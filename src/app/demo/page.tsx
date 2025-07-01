import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaCode, FaTools, FaBrain, FaGithub, FaStar } from 'react-icons/fa';
import AdvancedCodeEditor from '@/components/CodeEditor/AdvancedCodeEditor';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('editor');
  
  const tabs = [
    { id: 'editor', label: 'AI Code Editor', icon: <FaCode /> },
    { id: 'features', label: 'Features', icon: <FaTools /> },
    { id: 'models', label: 'AI Models', icon: <FaBrain /> },
    { id: 'github', label: 'GitHub', icon: <FaGithub /> },
  ];
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaRobot className="text-blue-500 text-2xl" />
              <h1 className="text-xl font-bold">Code Companion</h1>
              <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">Beta</span>
            </div>
            
            <nav>
              <ul className="flex space-x-1">
                {tabs.map(tab => (
                  <li key={tab.id}>
                    <motion.button
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div>
              <motion.a
                href="https://github.com/yourusername/code-companion"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaStar className="text-yellow-500" />
                <span>Star on GitHub</span>
              </motion.a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">AI-Powered Code Companion</h2>
          <p className="text-gray-400 max-w-3xl">
            Enhance your coding experience with real-time AI assistance, code analysis, and smart suggestions.
            Try our new streaming AI chat that responds as it thinks!
          </p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {activeTab === 'editor' && (
            <div className="h-[calc(100vh-220px)]">
              <AdvancedCodeEditor />
            </div>
          )}
          
          {activeTab === 'features' && (
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Advanced Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard
                  title="Streaming AI Responses"
                  description="See AI responses as they're generated, token by token, for a more interactive experience."
                  icon={<FaRobot className="text-blue-500" />}
                  isNew={true}
                />
                
                <FeatureCard
                  title="Multi-Model Support"
                  description="Choose from various AI models including Google's Gemini, OpenAI's GPT-4, Claude, and even local models."
                  icon={<FaBrain className="text-purple-500" />}
                  isNew={true}
                />
                
                <FeatureCard
                  title="Advanced Code Analysis"
                  description="Get in-depth code analysis with suggestions for bugs, performance improvements, and style issues."
                  icon={<FaCode className="text-green-500" />}
                />
                
                <FeatureCard
                  title="GitHub Integration"
                  description="Analyze code directly from GitHub repositories with a simple URL."
                  icon={<FaGithub className="text-gray-400" />}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'models' && (
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Supported AI Models</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ModelCard
                  name="Gemini Pro"
                  provider="Google"
                  description="High-quality model for general code tasks with fast response times."
                  strengths={["Code understanding", "Bug detection", "Explanation quality"]}
                  color="blue"
                />
                
                <ModelCard
                  name="GPT-4"
                  provider="OpenAI"
                  description="Sophisticated model with excellent reasoning for complex code problems."
                  strengths={["Complex reasoning", "Code generation", "Language understanding"]}
                  color="green"
                />
                
                <ModelCard
                  name="CodeLlama (Local)"
                  provider="Meta (Local)"
                  description="Runs directly in your browser with no API calls for privacy and offline use."
                  strengths={["Privacy", "No API costs", "Offline usage"]}
                  color="orange"
                  isExperimental={true}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'github' && (
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">GitHub Repository</h3>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-gray-300 mb-3">
                  This project is open source and available on GitHub. Feel free to star, fork, or contribute!
                </p>
                
                <motion.a
                  href="https://github.com/yourusername/code-companion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaGithub />
                  <span>View on GitHub</span>
                </motion.a>
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Coming Soon</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Visual code diagram generation</li>
                  <li>Test generation from code samples</li>
                  <li>Performance benchmarking</li>
                  <li>Accessibility checking for frontend code</li>
                  <li>Technical debt analysis</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-gray-900 border-t border-gray-800 py-4 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div>
              &copy; {new Date().getFullYear()} Code Companion. Built with Next.js, React, and AI.
            </div>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  isNew?: boolean;
}

// Feature card component
function FeatureCard({ title, description, icon, isNew = false }: FeatureCardProps) {
  return (
    <motion.div 
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 transition-all hover:border-blue-500"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-1">{icon}</div>
        <div>
          <div className="flex items-center">
            <h4 className="font-semibold">{title}</h4>
            {isNew && (
              <span className="ml-2 bg-blue-600 text-xs px-1.5 py-0.5 rounded-full">New</span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

type ModelColor = 'blue' | 'green' | 'purple' | 'orange';

interface ModelCardProps {
  name: string;
  provider: string;
  description: string;
  strengths: string[];
  color: ModelColor;
  isExperimental?: boolean;
}

// AI Model card component
function ModelCard({ 
  name, 
  provider, 
  description, 
  strengths, 
  color, 
  isExperimental = false 
}: ModelCardProps) {
  const colorClasses: Record<ModelColor, string> = {
    blue: "from-blue-900/50 to-blue-800/20 border-blue-700/50",
    green: "from-green-900/50 to-green-800/20 border-green-700/50",
    purple: "from-purple-900/50 to-purple-800/20 border-purple-700/50",
    orange: "from-orange-900/50 to-orange-800/20 border-orange-700/50",
  };
  
  return (
    <motion.div 
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-5 h-full`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-bold text-lg">{name}</h4>
        {isExperimental && (
          <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-500/30">
            Experimental
          </span>
        )}
      </div>
      <div className="mb-2 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded inline-block">
        {provider}
      </div>
      <p className="text-gray-300 text-sm mb-4">{description}</p>
      
      <h5 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Strengths</h5>
      <ul className="space-y-1">
        {strengths.map((strength: string, index: number) => (
          <li key={index} className="text-sm flex items-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
            {strength}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
