import JSZip from 'jszip';

/**
 * Utility functions for handling files and file uploads
 */

export interface FileInfo {
  name: string;
  content: string;
  path?: string;
  language?: string;
}

/**
 * Read a text file and return its content
 */
export const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Process a zip file and extract all text files
 */
export const processZipFile = async (file: File): Promise<FileInfo[]> => {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    const fileInfos: FileInfo[] = [];
    
    const processPromises = Object.keys(zipContent.files).map(async (filename) => {
      const zipEntry = zipContent.files[filename];
      
      // Skip directories and non-text files
      if (!zipEntry.dir && isTextFile(filename)) {
        try {
          const content = await zipEntry.async('string');
          fileInfos.push({
            name: filename.split('/').pop() || filename,
            content,
            path: filename,
          });
        } catch (error) {
          console.error(`Error extracting ${filename}:`, error);
        }
      }
    });
    
    await Promise.all(processPromises);
    return fileInfos;
  } catch (error) {
    console.error('Error processing zip file:', error);
    throw new Error('Failed to process zip file');
  }
};

/**
 * Check if a file is likely a text file based on extension
 */
export const isTextFile = (filename: string): boolean => {
  const textExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.html', '.css', 
    '.json', '.md', '.txt', '.xml', '.csv', '.rb', '.php', '.go', 
    '.c', '.cpp', '.h', '.cs', '.sh', '.yml', '.yaml', '.toml',
  ];
  
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return textExtensions.includes(ext);
};

/**
 * Fetch code from a GitHub repository URL
 * Note: In a real app, you would use the GitHub API with proper authentication
 */
export const fetchFromGitHub = async (url: string): Promise<FileInfo[]> => {
  try {
    // Basic validation and parsing of GitHub URL
    if (!url.includes('github.com')) {
      throw new Error('Not a valid GitHub URL');
    }
    
    // Extract owner and repo from URL
    // This is a simplified version - in reality you'd need to handle various GitHub URL formats
    const parts = url.replace('https://github.com/', '').split('/');
    if (parts.length < 2) {
      throw new Error('Invalid GitHub repository URL format');
    }
    
    const owner = parts[0];
    const repo = parts[1];
    const branch = parts.length > 3 && parts[2] === 'tree' ? parts[3] : 'main';
    
    // Fetch file list using GitHub API
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch repository data');
    }
    
    // Process files - this is simplified and would need proper pagination and filtering in a real app
    const fileInfos: FileInfo[] = [];
    
    interface TreeItem {
      path: string;
      type: string;
      url: string;
      sha: string;
    }
    
    const filePromises = data.tree
      .filter((item: TreeItem) => item.type === 'blob' && isTextFile(item.path))
      .slice(0, 10) // Limit to 10 files for this example
      .map(async (item: TreeItem) => {
        try {
          const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
          const fileResponse = await fetch(fileUrl);
          if (fileResponse.ok) {
            const content = await fileResponse.text();
            fileInfos.push({
              name: item.path.split('/').pop() || item.path,
              content,
              path: item.path,
            });
          }
        } catch (error) {
          console.error(`Error fetching ${item.path}:`, error);
        }
      });
    
    await Promise.all(filePromises);
    return fileInfos;
  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    throw new Error('Failed to fetch repository data');
  }
};
