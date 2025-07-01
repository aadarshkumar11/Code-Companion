import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaEdit, FaCode } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface CodeSuggestion {
  id: string;
  originalCode: string;
  suggestedCode: string;
  lineNumber: number;
  bugDescription: string;
  severity: 'error' | 'warning' | 'info';
  language: string;
  category?: 'security' | 'ethics' | 'code-quality' | 'performance' | 'accessibility' | 'privacy' | 'compliance';
}

interface SuggestionEngineProps {
  suggestions: CodeSuggestion[];
  onAcceptSuggestion: (suggestion: CodeSuggestion) => void;
  onRejectSuggestion: (suggestion: CodeSuggestion) => void;
  onModifySuggestion: (suggestion: CodeSuggestion, modifiedCode: string) => void;
  onFixAllSuggestions?: () => void;
}

const SuggestionEngine: React.FC<SuggestionEngineProps> = ({
  suggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
  onModifySuggestion,
  onFixAllSuggestions,
}) => {
  const [activeSuggestion, setActiveSuggestion] = React.useState<CodeSuggestion | null>(null);
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [modifiedCode, setModifiedCode] = React.useState<string>('');

  const handleSuggestionClick = (suggestion: CodeSuggestion) => {
    setActiveSuggestion(suggestion);
    setModifiedCode(suggestion.suggestedCode);
    setEditMode(false);
  };

  const handleEditClick = () => {
    if (activeSuggestion) {
      setEditMode(true);
    }
  };

  const handleSaveEdit = () => {
    if (activeSuggestion) {
      onModifySuggestion(activeSuggestion, modifiedCode);
      setEditMode(false);
    }
  };

  const handleCancelEdit = () => {
    if (activeSuggestion) {
      setModifiedCode(activeSuggestion.suggestedCode);
      setEditMode(false);
    }
  };

  const getSeverityColor = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return 'text-red-500 border-red-500';
      case 'warning':
        return 'text-yellow-500 border-yellow-500';
      case 'info':
        return 'text-blue-500 border-blue-500';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'security':
        return 'This issue may expose your application to security vulnerabilities such as data breaches, unauthorized access, or code injection.';
      case 'ethics':
        return 'This code raises ethical concerns related to fairness, bias, discrimination, or inappropriate data usage.';
      case 'code-quality':
        return 'This issue affects code readability, maintainability, or follows poor programming practices.';
      case 'performance':
        return 'This code may cause performance problems, inefficiencies, or excessive resource usage.';
      case 'accessibility':
        return 'This issue may make your application difficult or impossible to use for people with disabilities.';
      case 'privacy':
        return 'This code may compromise user privacy or handle sensitive data improperly.';
      case 'compliance':
        return 'This issue may violate legal regulations or industry standards like GDPR, CCPA, HIPAA, etc.';
      default:
        return 'This issue requires attention based on best practices.';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security':
        return 'bg-red-700/30 text-red-300 border border-red-700';
      case 'ethics':
        return 'bg-purple-700/30 text-purple-300 border border-purple-700';
      case 'code-quality':
        return 'bg-blue-700/30 text-blue-300 border border-blue-700';
      case 'performance':
        return 'bg-yellow-700/30 text-yellow-300 border border-yellow-700';
      case 'accessibility':
        return 'bg-green-700/30 text-green-300 border border-green-700';
      case 'privacy':
        return 'bg-pink-700/30 text-pink-300 border border-pink-700';
      case 'compliance':
        return 'bg-orange-700/30 text-orange-300 border border-orange-700';
      default:
        return 'bg-gray-700/30 text-gray-300 border border-gray-700';
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Suggestions List */}
      <div className="w-full md:w-1/3 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-900 p-3 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white font-medium flex items-center">
            <FaCode className="mr-2" />
            Code Suggestions ({suggestions.length})
          </h3>
          {suggestions.length > 0 && onFixAllSuggestions && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFixAllSuggestions}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Fix All
            </motion.button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[500px]">
          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No issues found in your code!
            </div>
          ) : (
            <ul>
              {suggestions.map((suggestion) => (
                <motion.li
                  key={suggestion.id}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`p-3 border-b border-gray-700 cursor-pointer ${
                    activeSuggestion?.id === suggestion.id ? 'bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 ${
                        suggestion.severity === 'error'
                          ? 'bg-red-500'
                          : suggestion.severity === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    ></div>
                    <div>
                      <div className="text-white font-medium flex items-center">
                        <span>Line {suggestion.lineNumber}</span>
                        {suggestion.category && (
                          <span 
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getCategoryColor(suggestion.category)}`}
                          >
                            {suggestion.category}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm line-clamp-2">{suggestion.bugDescription}</div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Suggestion Details */}
      <div className="w-full md:w-2/3 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {activeSuggestion ? (
          <div className="h-full flex flex-col">
            <div className="bg-gray-900 p-3 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium flex items-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      activeSuggestion.severity === 'error'
                        ? 'bg-red-500'
                        : activeSuggestion.severity === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  ></span>
                  <span>Line {activeSuggestion.lineNumber}</span>
                  {activeSuggestion.category && (
                    <span 
                      className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getCategoryColor(activeSuggestion.category)}`}
                    >
                      {activeSuggestion.category}
                    </span>
                  )}
                </h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAcceptSuggestion(activeSuggestion)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center"
                  >
                    <FaCheck className="mr-1" /> Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRejectSuggestion(activeSuggestion)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 flex items-center"
                  >
                    <FaTimes className="mr-1" /> Reject
                  </motion.button>
                  {!editMode ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEditClick}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 flex items-center"
                    >
                      <FaEdit className="mr-1" /> Modify
                    </motion.button>
                  ) : (
                    <div className="flex space-x-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveEdit}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                      >
                        Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
              <p className={`mt-2 text-sm ${getSeverityColor(activeSuggestion.severity)}`}>
                {activeSuggestion.bugDescription}
              </p>
              {activeSuggestion.category && (
                <div className={`mt-2 text-xs p-2 rounded ${getCategoryColor(activeSuggestion.category)}`}>
                  <strong className="uppercase">{activeSuggestion.category}:</strong> {getCategoryDescription(activeSuggestion.category)}
                </div>
              )}
            </div>
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="mb-4">
                <h4 className="text-gray-300 text-sm font-medium mb-2">Original Code:</h4>
                <SyntaxHighlighter
                  language={activeSuggestion.language}
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: '0.375rem', marginTop: '0.5rem' }}
                >
                  {activeSuggestion.originalCode}
                </SyntaxHighlighter>
              </div>
              <div>
                <h4 className="text-gray-300 text-sm font-medium mb-2">
                  {editMode ? 'Edit Suggestion:' : 'Suggested Fix:'}
                </h4>
                {editMode ? (
                  <textarea
                    value={modifiedCode}
                    onChange={(e) => setModifiedCode(e.target.value)}
                    className="w-full h-40 bg-gray-900 text-gray-100 font-mono text-sm p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <SyntaxHighlighter
                    language={activeSuggestion.language}
                    style={vscDarkPlus}
                    customStyle={{ borderRadius: '0.375rem', marginTop: '0.5rem' }}
                  >
                    {activeSuggestion.suggestedCode}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-gray-400">
            <div className="text-center">
              <FaCode className="text-5xl mx-auto mb-4 text-gray-600" />
              <p>Select a suggestion to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionEngine;
