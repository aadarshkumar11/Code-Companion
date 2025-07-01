import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaSpinner, FaStop } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isComplete: boolean;
};

interface StreamingChatProps {
  codeContext?: string;
  language?: string;
}

export default function StreamingChat({ codeContext = '', language = '' }: StreamingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      isComplete: true,
    };
    
    // Create placeholder for assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isComplete: false,
    };
    
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    
    // Set up abort controller for the fetch
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          codeContext,
          language,
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      // Process the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('Stream reader is not available');
      }
      
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                // Stream is complete
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, isComplete: true } 
                      : msg
                  )
                );
              } else {
                try {
                  const parsedData = JSON.parse(data);
                  if (parsedData.text) {
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === assistantMessage.id 
                          ? { ...msg, content: msg.content + parsedData.text } 
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  console.error('Error parsing stream data:', e);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error in chat:', error);
        // Update the assistant message with an error
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { 
                  ...msg, 
                  content: 'Sorry, I encountered an error. Please try again.', 
                  isComplete: true 
                } 
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };
  
  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      
      // Mark the current message as complete
      setMessages(prev => 
        prev.map(msg => 
          !msg.isComplete ? { ...msg, isComplete: true } : msg
        )
      );
    }
  };
  
  // Process message content for code blocks
  const renderMessageContent = (content: string) => {
    // Match code blocks with language specification
    const parts = content.split(/(```[\w-]*\n[\s\S]*?\n```)/g);
    
    return parts.map((part, i) => {
      const codeBlockMatch = part.match(/```([\w-]*)\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        const [, lang, code] = codeBlockMatch;
        return (
          <div key={i} className="my-2 rounded overflow-hidden">
            <SyntaxHighlighter 
              language={lang || 'javascript'} 
              style={oneDark}
              customStyle={{ margin: 0 }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      // Process inline code
      const inlineParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={i}>
          {inlineParts.map((inlinePart, j) => {
            const inlineMatch = inlinePart.match(/`([^`]+)`/);
            if (inlineMatch) {
              return (
                <code key={j} className="px-1 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-sm">
                  {inlineMatch[1]}
                </code>
              );
            }
            return (
              <span key={j} className="whitespace-pre-wrap">
                {inlinePart}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 flex items-center">
        <FaRobot className="text-blue-400 mr-2" />
        <h3 className="text-white font-medium">Streaming AI Chat</h3>
        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">Beta</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FaRobot className="text-4xl mx-auto mb-3 text-gray-600" />
            <p>Ask me anything about your code!</p>
            <p className="text-sm mt-2">I can now respond in real-time as I think.</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                <div className="prose prose-invert max-w-none">
                  {renderMessageContent(message.content)}
                </div>
                {!message.isComplete && (
                  <div className="h-5 w-5 mt-2">
                    <motion.div
                      animate={{ 
                        opacity: [0.5, 1, 0.5],
                        scale: [0.95, 1, 0.95],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                      }}
                      className="bg-blue-400 h-2 w-2 rounded-full"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stopStreaming}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-r-lg focus:outline-none"
            >
              <FaStop />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg focus:outline-none disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
