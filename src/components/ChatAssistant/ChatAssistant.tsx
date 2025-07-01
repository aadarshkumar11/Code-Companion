import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaComments } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatAssistantProps {
  onAskQuestion: (question: string) => Promise<string>;
  onClose?: () => void;
  initialMessages?: Message[];
  isOpen?: boolean;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({
  onAskQuestion,
  onClose,
  initialMessages = [],
  isOpen = true,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean>(isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await onAskQuestion(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setVisible(!visible);
    if (onClose && visible) {
      onClose();
    }
  };

  const formatMessage = (text: string) => {
    // Process text with more advanced markdown-like formatting
    // Split by code blocks (```language...```)
    const parts = text.split(/(```[\s\S]*?```)/);
    
    return parts.map((part, index) => {
      // Check if this is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const content = part.slice(3, -3);
        
        // Try to detect language from the first line
        let language = 'text';
        let code = content;
        
        const firstLineBreak = content.indexOf('\n');
        if (firstLineBreak > 0) {
          const firstLine = content.slice(0, firstLineBreak).trim();
          // Check if the first line is a language identifier
          if (/^[a-zA-Z0-9]+$/.test(firstLine)) {
            language = firstLine;
            code = content.slice(firstLineBreak + 1);
          }
        }
        
        return (
          <div key={index} className="my-2 rounded overflow-hidden">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: '0.375rem' }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        // Regular text - handle basic formatting like bold, italic, etc.
        return (
          <p key={index} className="whitespace-pre-wrap">
            {part}
          </p>
        );
      }
    });
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-screen w-80 bg-gray-800 shadow-lg flex flex-col z-10"
          >
            <div className="flex justify-between items-center px-4 py-3 bg-gray-900">
              <div className="flex items-center space-x-2">
                <FaRobot className="text-blue-400" />
                <h2 className="text-white font-medium">AI Assistant</h2>
              </div>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {formatMessage(message.text)}
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white p-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-gray-900">
              <div className="flex items-end space-x-2">
                <textarea
                  className="flex-1 p-2 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isTyping}
                  className={`p-2 rounded-lg bg-blue-600 text-white ${
                    isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!visible && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleChat}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg z-10"
        >
          <FaComments className="text-xl" />
        </motion.button>
      )}
    </>
  );
};

export default ChatAssistant;
