import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FaCode, FaPython, FaJs, FaJava, FaHtml5, FaCss3, FaSun, FaMoon, FaCopy, FaListOl, FaAlignLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import type * as Monaco from 'monaco-editor';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
  height?: string;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript', icon: <FaJs /> },
  { value: 'typescript', label: 'TypeScript', icon: <FaJs /> },
  { value: 'python', label: 'Python', icon: <FaPython /> },
  { value: 'java', label: 'Java', icon: <FaJava /> },
  { value: 'html', label: 'HTML', icon: <FaHtml5 /> },
  { value: 'css', label: 'CSS', icon: <FaCss3 /> },
];

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '// Start coding here...',
  language = 'javascript',
  theme = 'vs-dark',
  height = '500px',
  onCodeChange,
  onLanguageChange,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>(theme);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      if (onCodeChange) {
        onCodeChange(value);
      }
    }
  };

  const changeLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    // Notify parent component about language change
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const toggleTheme = () => {
    setEditorTheme(prev => prev === 'vs-dark' ? 'light' : 'vs-dark');
  };

  const toggleLineNumbers = () => {
    setShowLineNumbers(prev => !prev);
  };
  
  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };
  
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  useEffect(() => {
    // Handle initial setup and cleanup
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 shadow-lg bg-gray-900 relative">
      <div className="bg-gray-800 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaCode className="text-gray-400" />
          <span className="text-gray-300 font-medium">Code Editor</span>
        </div>
        <div className="flex space-x-2 items-center">
          {languageOptions.map((lang) => (
            <motion.button
              key={lang.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                selectedLanguage === lang.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => changeLanguage(lang.value)}
            >
              <span>{lang.icon}</span>
              <span>{lang.label}</span>
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="ml-2 px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center space-x-1"
            title={editorTheme === 'vs-dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {editorTheme === 'vs-dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-400" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLineNumbers}
            className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center"
            title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
          >
            <FaListOl />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center"
            title="Copy code to clipboard"
          >
            <FaCopy className={copySuccess ? "text-green-400" : ""} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={formatCode}
            className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center"
            title="Format code"
          >
            <FaAlignLeft />
          </motion.button>
        </div>
      </div>
      <Editor
        height={height}
        language={selectedLanguage}
        value={code}
        theme={editorTheme}
        onChange={handleCodeChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: showLineNumbers ? 'on' : 'off',
          automaticLayout: true,
          wordWrap: 'on',
        }}
      />
      <AnimatePresence>
        {copySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-14 right-4 bg-green-600 text-white px-3 py-1 rounded-md shadow-lg"
            style={{ zIndex: 100 }}
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodeEditor;
