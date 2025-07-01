/**
 * Utility functions for parsing and analyzing code
 */

/**
 * Basic language detection based on file extension or content
 */
export const detectLanguage = (filename: string, content: string): string => {
  // Check file extension first
  if (filename) {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension) {
      switch (extension) {
        case 'js':
          return 'javascript';
        case 'ts':
        case 'tsx':
          return 'typescript';
        case 'py':
          return 'python';
        case 'java':
          return 'java';
        case 'html':
          return 'html';
        case 'css':
          return 'css';
        case 'json':
          return 'json';
        case 'md':
          return 'markdown';
        case 'rb':
          return 'ruby';
        case 'php':
          return 'php';
        case 'go':
          return 'go';
        case 'c':
          return 'c';
        case 'cpp':
        case 'cc':
        case 'cxx':
          return 'cpp';
        case 'cs':
          return 'csharp';
        case 'sh':
          return 'bash';
      }
    }
  }

  // Fallback to content analysis if extension doesn't help
  if (content) {
    if (content.includes('def ') && content.includes(':') && (content.includes('import ') || content.includes('from '))) {
      return 'python';
    }
    if (content.includes('function') && (content.includes('const ') || content.includes('let ') || content.includes('var '))) {
      return 'javascript';
    }
    if (content.includes('class') && content.includes('public') && content.includes(';')) {
      return 'java';
    }
    if (content.includes('<html') || content.includes('<!DOCTYPE html')) {
      return 'html';
    }
    if (content.includes('interface ') && content.includes('export ') && content.includes(':')) {
      return 'typescript';
    }
  }

  // Default fallback
  return 'javascript';
};

/**
 * Extracts a code snippet around a specific line number
 */
export const extractCodeSnippet = (code: string, lineNumber: number, contextLines: number = 3): string => {
  const lines = code.split('\n');
  
  if (lineNumber <= 0 || lineNumber > lines.length) {
    return '';
  }
  
  const startLine = Math.max(0, lineNumber - 1 - contextLines);
  const endLine = Math.min(lines.length - 1, lineNumber - 1 + contextLines);
  
  return lines.slice(startLine, endLine + 1).join('\n');
};

/**
 * Apply suggested fix to the original code
 */
export const applyCodeFix = (originalCode: string, lineNumber: number, fixedCode: string, contextLines: number = 3): string => {
  const lines = originalCode.split('\n');
  
  if (lineNumber <= 0 || lineNumber > lines.length) {
    return originalCode;
  }
  
  // Extract the context of the fix
  const startLine = Math.max(0, lineNumber - 1 - contextLines);
  const endLine = Math.min(lines.length - 1, lineNumber - 1 + contextLines);
  
  // Replace the section with the fixed code
  const beforeFix = lines.slice(0, startLine).join('\n');
  const afterFix = lines.slice(endLine + 1).join('\n');
  
  // Combine the parts
  return [
    beforeFix,
    fixedCode,
    afterFix
  ].filter(Boolean).join('\n');
};

/**
 * Basic AST-less code analysis to find potential issues
 */
export const findBasicIssues = (code: string, language: string): Array<{lineNumber: number, issue: string, category?: string}> => {
  const issues: Array<{lineNumber: number, issue: string, category?: string}> = [];
  const lines = code.split('\n');
  
  // Very basic checks - in a real app this would be much more sophisticated
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Common issues across languages
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        lineNumber,
        issue: `Found "${line.includes('TODO') ? 'TODO' : 'FIXME'}" comment that needs to be addressed`,
        category: 'code-quality'
      });
    }
    
    // Check for potential hardcoded secrets
    checkForSecrets(line, lineNumber, issues);
    
    // Check for potential ethical issues
    checkForEthicalIssues(line, lineNumber, issues);
    
    // Check for security vulnerabilities
    checkForSecurityIssues(line, lineNumber, language, issues);
    
    // Language-specific checks
    if (language === 'javascript' || language === 'typescript') {
      if (line.includes('console.log')) {
        issues.push({
          lineNumber,
          issue: 'Console logging statement should be removed in production code',
          category: 'code-quality'
        });
      }
      
      if (line.includes('===') && line.includes('==')) {
        issues.push({
          lineNumber,
          issue: 'Mixing strict and loose equality operators might lead to confusion',
          category: 'code-quality'
        });
      }
      
      // JavaScript-specific security checks
      if (line.includes('eval(') || line.includes('new Function(')) {
        issues.push({
          lineNumber,
          issue: 'Using eval() or new Function() can lead to code injection vulnerabilities',
          category: 'security'
        });
      }
      
      if (line.includes('innerHTML') || line.includes('outerHTML')) {
        issues.push({
          lineNumber,
          issue: 'Using innerHTML or outerHTML can lead to XSS vulnerabilities',
          category: 'security'
        });
      }
    }
    
    if (language === 'python') {
      if (line.includes('print(') && !line.includes('#')) {
        issues.push({
          lineNumber,
          issue: 'Print statement should be removed in production code',
          category: 'code-quality'
        });
      }
      
      if (line.match(/except:/) && !line.match(/except \w+:/)) {
        issues.push({
          lineNumber,
          issue: 'Bare except clause will catch all exceptions including KeyboardInterrupt',
          category: 'code-quality'
        });
      }
      
      // Python-specific security checks
      if (line.includes('pickle.load') || line.includes('pickle.loads')) {
        issues.push({
          lineNumber,
          issue: 'Using pickle to deserialize data from untrusted sources is a security risk',
          category: 'security'
        });
      }
      
      if (line.includes('exec(') || line.includes('eval(')) {
        issues.push({
          lineNumber,
          issue: 'Using exec() or eval() can lead to code injection vulnerabilities',
          category: 'security'
        });
      }
      
      if (line.includes('subprocess.call') && line.includes('shell=True')) {
        issues.push({
          lineNumber,
          issue: 'Using shell=True with subprocess functions can lead to command injection vulnerabilities',
          category: 'security'
        });
      }
    }
  });
  
  return issues;
};

/**
 * Check for potential hardcoded secrets or API keys
 */
const checkForSecrets = (line: string, lineNumber: number, issues: Array<{lineNumber: number, issue: string, category?: string}>) => {
  // Check for common secret patterns
  const secretPatterns = [
    { pattern: /api[_-]?key/i, name: 'API Key' },
    { pattern: /auth[_-]?token/i, name: 'Auth Token' },
    { pattern: /password/i, name: 'Password' },
    { pattern: /secret/i, name: 'Secret' },
    { pattern: /access[_-]?key/i, name: 'Access Key' },
    { pattern: /private[_-]?key/i, name: 'Private Key' },
    { pattern: /BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY/, name: 'SSH/PGP Private Key' },
    { pattern: /-----BEGIN CERTIFICATE-----/, name: 'Certificate' },
    { pattern: /jwt[_-]?token/i, name: 'JWT' },
    { pattern: /bearer/i, name: 'Bearer Token' }
  ];

  // Check for API key formats (long strings of letters/numbers)
  const possibleApiKeyPattern = /(["'])(?:[A-Za-z0-9_=-]{20,})\1/;
  
  // Check if the line contains any secret pattern
  for (const { pattern, name } of secretPatterns) {
    if (pattern.test(line)) {
      issues.push({
        lineNumber,
        issue: `Potential hardcoded ${name} detected. Storing sensitive information in code is a security risk.`,
        category: 'security'
      });
      break;
    }
  }

  // Check for possible API key format
  if (possibleApiKeyPattern.test(line)) {
    issues.push({
      lineNumber,
      issue: 'Potential hardcoded API key or secret detected. Consider using environment variables or a secrets manager.',
      category: 'security'
    });
  }
};

/**
 * Check for potential ethical issues in code
 */
const checkForEthicalIssues = (line: string, lineNumber: number, issues: Array<{lineNumber: number, issue: string, category?: string}>) => {
  // Check for terms that might indicate bias or ethical concerns
  const ethicalConcernPatterns = [
    { pattern: /gender/i, issue: 'Code references gender which might need ethical review for bias' },
    { pattern: /race/i, issue: 'Code references race which might need ethical review for bias' },
    { pattern: /ethnicity/i, issue: 'Code references ethnicity which might need ethical review for bias' },
    { pattern: /nationality/i, issue: 'Code references nationality which might need ethical review for bias' },
    { pattern: /age discrimination/i, issue: 'Code might involve age-related logic that should be reviewed for discrimination' },
    { pattern: /tracking/i, issue: 'Code involves tracking which might have privacy implications' },
    { pattern: /surveillance/i, issue: 'Code involves surveillance which raises ethical concerns' },
    { pattern: /facial recognition/i, issue: 'Facial recognition technology raises privacy and bias concerns' }
  ];

  for (const { pattern, issue } of ethicalConcernPatterns) {
    if (pattern.test(line)) {
      issues.push({
        lineNumber,
        issue,
        category: 'ethics'
      });
      break;
    }
  }
};

/**
 * Check for potential security issues
 */
const checkForSecurityIssues = (
  line: string, 
  lineNumber: number, 
  language: string,
  issues: Array<{lineNumber: number, issue: string, category?: string}>
) => {
  // Generic security checks across languages
  const securityPatterns = [
    { pattern: /TODO.*security/i, issue: 'Security-related TODO comment found' },
    { pattern: /FIXME.*security/i, issue: 'Security-related FIXME comment found' },
    { pattern: /\/\/.*hack/i, issue: 'Comment indicates a potential security hack or workaround' }
  ];

  for (const { pattern, issue } of securityPatterns) {
    if (pattern.test(line)) {
      issues.push({
        lineNumber,
        issue,
        category: 'security'
      });
    }
  }

  // SQL Injection checks
  if (
    (line.includes('SELECT') || line.includes('INSERT') || line.includes('UPDATE') || line.includes('DELETE')) &&
    line.includes('+') && !line.includes('prepared')
  ) {
    issues.push({
      lineNumber,
      issue: 'Potential SQL injection vulnerability. Use prepared statements or parameterized queries.',
      category: 'security'
    });
  }
};
