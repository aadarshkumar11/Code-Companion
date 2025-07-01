'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaCode, FaRobot, FaFileCode } from 'react-icons/fa';

import CodeEditor from '@/components/CodeEditor/CodeEditor';
import FileUploader from '@/components/FileUploader/FileUploader';
import ChatAssistant from '@/components/ChatAssistant/ChatAssistant';
import SuggestionEngine, { CodeSuggestion } from '@/components/SuggestionEngine/SuggestionEngine';
import { detectLanguage } from '@/lib/parsers/codeParser';

export default function Home() {
  const [code, setCode] = useState<string>('// Start coding here or upload a file...');
  const [language, setLanguage] = useState<string>('javascript');
  const [filename, setFilename] = useState<string>('');
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<'editor' | 'suggestions'>('editor');
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const introTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close intro animation after 3 seconds
  useEffect(() => {
    introTimerRef.current = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    
    return () => {
      if (introTimerRef.current) {
        clearTimeout(introTimerRef.current);
      }
    };
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleFilesUploaded = (files: { name: string; content: string }[]) => {
    if (files.length > 0) {
      const file = files[0];
      setCode(file.content);
      setFilename(file.name);
      
      // Auto-detect language
      const detectedLang = detectLanguage(file.name, file.content);
      setLanguage(detectedLang);
    }
  };

  const handleFolderUploaded = (files: { path: string; name: string; content: string }[]) => {
    if (files.length > 0) {
      const file = files[0];
      setCode(file.content);
      setFilename(file.name);
      
      // Auto-detect language
      const detectedLang = detectLanguage(file.name, file.content);
      setLanguage(detectedLang);
    }
  };

  const handleGitHubUrlSubmit = async () => {
    // In a real implementation, this would use the fileUtils.fetchFromGitHub function
    // but for now we'll just simulate it
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Simulate GitHub API call delay with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample data
      const sampleCode = `
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  console.log("Total: " + total);
  return total;
}

// Function with some bugs
function processData(data) {
  if (data == null) {
    console.error("Data is null");
    return;
  }
  
  let result = [];
  for (let i = 0; i <= data.length; i++) {
    let item = data[i];
    if (item.active == true) {
      result.push({
        id: item.id,
        name: item.name,
        value: item.value * 2
      });
    }
  }
  
  return results;
}
      `;
      
      setCode(sampleCode);
      setFilename('sample.js');
      setLanguage('javascript');
      
    } catch (err) {
      console.error('GitHub URL error:', err);
      setError('Failed to fetch from GitHub. Please check the URL and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter or upload some code first.');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          filename,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }
      
      const data = await response.json();
      
      // Define the type for the bug object from the API
      type BugResult = {
        id?: string;
        lineNumber: number;
        bugDescription: string;
        originalCode: string;
        suggestedCode: string;
        severity: 'error' | 'warning' | 'info';
        category?: 'security' | 'ethics' | 'code-quality' | 'performance' | 'accessibility' | 'privacy' | 'compliance';
      };

      // Transform API response to CodeSuggestion format and ensure language is correctly passed
      const formattedSuggestions: CodeSuggestion[] = data.bugs.map((bug: BugResult, index: number) => ({
        id: bug.id || `bug-${index}`,
        originalCode: bug.originalCode,
        suggestedCode: bug.suggestedCode,
        lineNumber: bug.lineNumber,
        bugDescription: bug.bugDescription,
        severity: bug.severity,
        language: language, // Explicitly use the current language from state
        category: bug.category,
      }));
      
      setSuggestions(formattedSuggestions);
      
      if (formattedSuggestions.length > 0) {
        setActivePage('suggestions');
      } else {
        setError('No issues found in your code!');
      }
      
    } catch (err) {
      console.error('Error analyzing code:', err);
      setError('Failed to analyze code. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleAskQuestion = async (question: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          codeContext: code,
          language,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error in chat:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  };
  
  const handleAcceptSuggestion = (suggestion: CodeSuggestion) => {
    // Replace the problematic code with the suggested fix
    const lines = code.split('\n');
    const startLine = Math.max(0, suggestion.lineNumber - 3);
    const endLine = Math.min(lines.length, suggestion.lineNumber + 3);
    
    const originalSnippet = lines.slice(startLine, endLine).join('\n');
    
    // Simple replacement - in a real app, you'd need more sophisticated patching
    if (originalSnippet.includes(suggestion.originalCode)) {
      const newCode = code.replace(suggestion.originalCode, suggestion.suggestedCode);
      setCode(newCode);
      
      // Remove the accepted suggestion from the list
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      // If no more suggestions, go back to editor
      if (suggestions.length <= 1) {
        setActivePage('editor');
      }
    }
  };
  
  const handleRejectSuggestion = (suggestion: CodeSuggestion) => {
    // Remove the rejected suggestion from the list
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    
    // If no more suggestions, go back to editor
    if (suggestions.length <= 1) {
      setActivePage('editor');
    }
  };
  
  const handleModifySuggestion = (suggestion: CodeSuggestion, modifiedCode: string) => {
    // Create a modified suggestion
    const updatedSuggestion: CodeSuggestion = {
      ...suggestion,
      suggestedCode: modifiedCode,
    };
    
    // Update the suggestion in the list
    setSuggestions(prev => 
      prev.map(s => s.id === suggestion.id ? updatedSuggestion : s)
    );
  };
  
  const handleFixAllSuggestions = () => {
    let newCode = code;
    
    // Apply all suggestions (this is simplified and would need better conflict resolution)
    suggestions.forEach(suggestion => {
      newCode = newCode.replace(suggestion.originalCode, suggestion.suggestedCode);
    });
    
    setCode(newCode);
    setSuggestions([]);
    setActivePage('editor');
  };

  return (
    <main className="min-h-screen flex flex-col">
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="mb-4 text-6xl inline-block text-blue-500"
              >
                <FaRobot />
              </motion.div>
              <h1 className="text-4xl font-bold mb-2 text-blue-400">Code Companion</h1>
              <p className="text-gray-400">AI-Powered Debugging Assistant</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-gray-900 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaCode className="text-blue-500 text-2xl" />
            <h1 className="text-xl font-bold text-white">Code Companion</h1>
          </div>
          <div className="flex space-x-2">
            <a
              href="https://github.com/yourusername/code-companion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaGithub className="text-xl" />
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <FileUploader
            onFilesUploaded={handleFilesUploaded}
            onFolderUploaded={handleFolderUploaded}
            onGitHubUrlSubmit={handleGitHubUrlSubmit}
          />
        </div>

        <div className="mb-4 flex flex-wrap justify-between items-center">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <button
              onClick={() => setActivePage('editor')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                activePage === 'editor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              <FaFileCode />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActivePage('suggestions')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                activePage === 'suggestions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              } ${suggestions.length > 0 ? 'relative' : ''}`}
            >
              <FaRobot />
              <span>Suggestions</span>
              {suggestions.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {suggestions.length}
                </span>
              )}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={analyzeCode}
            disabled={isAnalyzing}
            className={`px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2 ${
              isAnalyzing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <FaRobot />
                <span>Analyze Code</span>
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-100 rounded-md"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activePage === 'editor' ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CodeEditor
                initialCode={code}
                language={language}
                theme="vs-dark"
                height="600px"
                onCodeChange={handleCodeChange}
                onLanguageChange={setLanguage}
              />
            </motion.div>
          ) : (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SuggestionEngine
                suggestions={suggestions}
                onAcceptSuggestion={handleAcceptSuggestion}
                onRejectSuggestion={handleRejectSuggestion}
                onModifySuggestion={handleModifySuggestion}
                onFixAllSuggestions={handleFixAllSuggestions}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ChatAssistant
        onAskQuestion={handleAskQuestion}
        isOpen={false}
      />

      <footer className="bg-gray-900 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Code Companion - AI-Powered Debugging Assistant © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}
