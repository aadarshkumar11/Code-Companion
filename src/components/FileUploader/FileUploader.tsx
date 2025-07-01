import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaGithub, FaFileArchive, FaFolder, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import JSZip from 'jszip';
import { fetchFromGitHub } from '@/lib/utils/fileUtils';

interface FileUploaderProps {
  onFilesUploaded: (files: { name: string; content: string }[]) => void;
  onFolderUploaded: (files: { path: string; name: string; content: string }[]) => void;
  onGitHubUrlSubmit?: (url: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesUploaded,
  onFolderUploaded,
  onGitHubUrlSubmit,
}) => {
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadType, setUploadType] = useState<'file' | 'folder' | 'github'>('file');
  const [error, setError] = useState<string | null>(null);

  const handleFileRead = async (file: File): Promise<{ name: string; content: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          resolve({ name: file.name, content: e.target.result });
        }
      };
      reader.readAsText(file);
    });
  };

  const handleZipFile = async (file: File): Promise<{ path: string; name: string; content: string }[]> => {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const files: { path: string; name: string; content: string }[] = [];

    const processFiles = async () => {
      const promises = Object.keys(contents.files).map(async (fileName) => {
        const zipEntry = contents.files[fileName];
        if (!zipEntry.dir) {
          const content = await zipEntry.async('string');
          files.push({
            path: fileName,
            name: fileName.split('/').pop() || fileName,
            content,
          });
        }
      });

      await Promise.all(promises);
    };

    await processFiles();
    return files;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      setError(null);
      try {
        if (uploadType === 'file') {
          const fileContents = await Promise.all(acceptedFiles.map(handleFileRead));
          onFilesUploaded(fileContents);
        } else if (uploadType === 'folder' || acceptedFiles.some(file => file.name.endsWith('.zip'))) {
          // Handle zip files or directory uploads
          const allFiles: { path: string; name: string; content: string }[] = [];
          
          for (const file of acceptedFiles) {
            if (file.name.endsWith('.zip')) {
              const zipFiles = await handleZipFile(file);
              allFiles.push(...zipFiles);
            } else {
              const content = await handleFileRead(file);
              allFiles.push({ 
                path: file.webkitRelativePath || file.name, 
                name: file.name, 
                content: content.content 
              });
            }
          }
          
          onFolderUploaded(allFiles);
        }
      } catch (error) {
        console.error('Error processing files:', error);
        setError('Error processing files. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [onFilesUploaded, onFolderUploaded, uploadType]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: uploadType === 'file' 
      ? { 'text/*': ['.js', '.py', '.ts', '.html', '.css', '.java', '.json'] }
      : { 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] },
    multiple: true,
  });

  const handleGitHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!githubUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }
    
    try {
      setUploading(true);
      
      // Use the fetchFromGitHub function
      const files = await fetchFromGitHub(githubUrl);
      
      if (files.length === 0) {
        setError('No compatible files found in this repository');
        return;
      }
      
      // Handle the files as a folder upload
      const folderFiles = files.map(file => ({
        path: file.path || file.name,
        name: file.name,
        content: file.content
      }));
      
      onFolderUploaded(folderFiles);
      
      // Also call the callback if provided (for compatibility)
      if (onGitHubUrlSubmit) {
        onGitHubUrlSubmit(githubUrl);
      }
      
      setGithubUrl('');
    } catch (err) {
      console.error('Error fetching from GitHub:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch from GitHub');
    } finally {
      setUploading(false);
    }
  };

  const uploadOptions = [
    { type: 'file', label: 'Files', icon: <FaUpload /> },
    { type: 'folder', label: 'Folder/Zip', icon: <FaFolder /> },
    { type: 'github', label: 'GitHub URL', icon: <FaGithub /> },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-center mb-4 space-x-2">
        {uploadOptions.map((option) => (
          <motion.button
            key={option.type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              uploadType === option.type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={() => setUploadType(option.type as 'file' | 'folder' | 'github')}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </motion.button>
        ))}
      </div>

      {uploadType === 'github' ? (
        <form onSubmit={handleGitHubSubmit} className="mb-6">
          <div className="flex">
            <input
              type="text"
              placeholder="Enter GitHub repository URL"
              className="flex-grow px-4 py-2 border border-gray-700 rounded-l-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded-r-md flex items-center space-x-2 hover:bg-blue-700 ${
                uploading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <FaGithub />
                  <span>Import</span>
                </>
              )}
            </motion.button>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-red-500/20 border border-red-500 text-red-100 rounded-md flex items-start"
            >
              <FaExclamationTriangle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </form>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800'
          }`}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            {uploadType === 'file' ? (
              <FaUpload className="text-4xl text-gray-400" />
            ) : (
              <FaFileArchive className="text-4xl text-gray-400" />
            )}
            {uploading ? (
              <p className="text-gray-300">Processing files...</p>
            ) : isDragActive ? (
              <p className="text-blue-300">Drop the files here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-300">
                  {uploadType === 'file'
                    ? 'Drag & drop code files here, or click to select files'
                    : 'Drag & drop a folder or .zip file here, or click to select'}
                </p>
                <p className="text-sm text-gray-500">
                  {uploadType === 'file'
                    ? 'Supports .js, .py, .ts, .html, .css, .java, .json files'
                    : 'Upload an entire project folder or zip archive'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500 text-white rounded-md flex items-center space-x-2">
          <FaExclamationTriangle />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
