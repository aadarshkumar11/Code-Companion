import React, { useState } from 'react';
import { FaCode, FaRobot, FaCog, FaSearch, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import StreamingChat from '../ChatAssistant/StreamingChat';

type AIModel = {
  id: string;
  provider: string;
  name: string;
  description: string;
};

const availableModels: AIModel[] = [
  {
    id: 'gemini-pro',
    provider: 'Google',
    name: 'Gemini Pro',
    description: 'Good for general code analysis and chat'
  },
  {
    id: 'gemini-ultra',
    provider: 'Google',
    name: 'Gemini Ultra',
    description: 'Advanced model with better reasoning'
  },
  {
    id: 'gpt-4',
    provider: 'OpenAI',
    name: 'GPT-4',
    description: 'Excellent for complex code understanding'
  },
  {
    id: 'claude-3',
    provider: 'Anthropic',
    name: 'Claude 3',
    description: 'Good alternative with different strengths'
  },
  {
    id: 'local-onnx',
    provider: 'Local',
    name: 'CodeLlama (Local)',
    description: 'Runs directly in browser, no API needed'
  }
];

// Properly typed editor options
type LineNumbersType = 'on' | 'off' | 'relative' | ((lineNumber: number) => string);

interface EditorOptions {
  minimap: { enabled: boolean };
  lineNumbers: LineNumbersType;
  scrollBeyondLastLine: boolean;
  automaticLayout: boolean;
}

export default function AdvancedCodeEditor() {
  const [code, setCode] = useState<string>('// Enter your code here\nfunction example() {\n  console.log("Hello world");\n}\n');
  const [language, setLanguage] = useState<string>('javascript');
  const [theme, setTheme] = useState<string>('vs-dark');
  const [selectedModel, setSelectedModel] = useState<AIModel>(availableModels[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [editorOptions, setEditorOptions] = useState<EditorOptions>({
    minimap: { enabled: true },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
  });
  
  // Toggle a specific editor option
  const toggleEditorOption = (option: string) => {
    setEditorOptions(prev => {
      if (option === 'minimap') {
        return { ...prev, minimap: { enabled: !prev.minimap.enabled } };
      }
      if (option === 'lineNumbers') {
        return { 
          ...prev, 
          lineNumbers: prev.lineNumbers === 'on' ? 'off' as LineNumbersType : 'on' as LineNumbersType 
        };
      }
      return prev;
    });
  };
  
  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(prev => prev === 'vs-dark' ? 'vs-light' : 'vs-dark');
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-900 rounded-lg border border-gray-700">
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <FaCode className="text-blue-400 mr-2" />
          <h3 className="text-white font-medium">Advanced Code Editor</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(prev => !prev)}
              className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded-md"
            >
              <FaRobot className="text-blue-400" />
              <span>{selectedModel.name}</span>
              <FaChevronDown className="h-3 w-3" />
            </button>
            
            <AnimatePresence>
              {isModelDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-1 w-64 rounded-md bg-gray-800 border border-gray-700 shadow-lg z-10"
                >
                  <div className="p-2">
                    <div className="flex items-center bg-gray-700 rounded-md px-2 mb-2">
                      <FaSearch className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search models..."
                        className="bg-transparent border-none text-white text-sm p-1 w-full focus:outline-none"
                      />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {availableModels.map(model => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-md text-sm mb-1 ${
                            selectedModel.id === model.id
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-700 text-gray-200'
                          }`}
                        >
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs opacity-80">
                            <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs mr-1">
                              {model.provider}
                            </span>
                            {model.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-white text-sm border-none rounded-md px-2 py-1.5"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="cpp">C++</option>
          </select>
          
          <button 
            onClick={toggleTheme}
            className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-md"
            title={theme === 'vs-dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'vs-dark' ? '☀️' : '🌙'}
          </button>
          
          <button 
            onClick={() => toggleEditorOption('minimap')}
            className={`p-1.5 rounded-md ${
              editorOptions.minimap.enabled 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title="Toggle minimap"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 4H7V5H4V4Z" fill="currentColor"/>
              <path d="M4 6H8V7H4V6Z" fill="currentColor"/>
              <path d="M4 8H6V9H4V8Z" fill="currentColor"/>
              <path d="M4 10H8V11H4V10Z" fill="currentColor"/>
            </svg>
          </button>
          
          <button 
            onClick={() => toggleEditorOption('lineNumbers')}
            className={`p-1.5 rounded-md ${
              editorOptions.lineNumbers === 'on' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title="Toggle line numbers"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H4V4H2V2Z" fill="currentColor"/>
              <path d="M2 6H4V8H2V6Z" fill="currentColor"/>
              <path d="M2 10H4V12H2V10Z" fill="currentColor"/>
              <path d="M6 3H14V5H6V3Z" fill="currentColor"/>
              <path d="M6 7H12V9H6V7Z" fill="currentColor"/>
              <path d="M6 11H14V13H6V11Z" fill="currentColor"/>
            </svg>
          </button>
          
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-md"
            title="Settings"
          >
            <FaCog />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language={language}
            theme={theme}
            value={code}
            onChange={(value) => setCode(value || '')}
            options={editorOptions}
          />
        </div>
        
        <div className="w-96 border-l border-gray-700 overflow-hidden">
          <StreamingChat 
            codeContext={code}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}
