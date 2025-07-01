import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

export type CodeAnalysisResult = {
  bugs: Array<{
    id: string;
    lineNumber: number;
    bugDescription: string;
    originalCode: string;
    suggestedCode: string;
    severity: 'error' | 'warning' | 'info';
    category?: 'security' | 'ethics' | 'code-quality' | 'performance' | 'accessibility' | 'privacy' | 'compliance';
  }>;
  summary: string;
};

// Define the schema for the code analysis result
const codeAnalysisSchema = z.object({
  bugs: z.array(
    z.object({
      id: z.string(),
      lineNumber: z.number(),
      bugDescription: z.string(),
      originalCode: z.string(),
      suggestedCode: z.string(),
      severity: z.enum(['error', 'warning', 'info']),
      category: z.enum(['security', 'ethics', 'code-quality', 'performance', 'accessibility', 'privacy', 'compliance']).optional(),
    })
  ),
  summary: z.string(),
});

export class AIService {
  private googleAI: GoogleGenerativeAI;
  private openAI: ChatOpenAI;
  private parser: StructuredOutputParser<typeof codeAnalysisSchema>;

  constructor(googleApiKey: string, openaiApiKey: string) {
    // Initialize Google Generative AI
    this.googleAI = new GoogleGenerativeAI(googleApiKey);
    
    // Initialize OpenAI
    this.openAI = new ChatOpenAI({
      openAIApiKey: openaiApiKey,
      modelName: 'gpt-4',
      temperature: 0.2,
    });

    // Initialize the parser for structured output
    this.parser = StructuredOutputParser.fromZodSchema(codeAnalysisSchema);
  }

  /**
   * Analyze code for bugs and suggestions
   */
  public async analyzeCode(
    code: string,
    language: string,
    additionalContext: string = ''
  ): Promise<CodeAnalysisResult> {
    try {
      const formatInstructions = this.parser.getFormatInstructions();
      
      // Create the prompt text as a simple string (avoiding PromptTemplate to prevent template errors)
      const promptText = `
        You are an expert software developer specializing in debugging and code review with a focus on both technical correctness, security, and ethical considerations.
        Analyze the following ${language} code for bugs, errors, security vulnerabilities, ethical concerns, or potential improvements.
        
        ${additionalContext ? `Additional context: ${additionalContext}\n` : ''}
        
        CODE TO ANALYZE:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Perform a comprehensive analysis, looking for:
        1. Functional bugs and errors
        2. Security vulnerabilities (including but not limited to injection flaws, XSS, CSRF, insecure storage)
        3. Potential secret keys, API tokens, or hardcoded credentials
        4. Privacy concerns (excessive data collection, improper consent, insecure data handling)
        5. Biased algorithms or data handling (gender, racial, or other bias)
        6. Accessibility issues in user interfaces
        7. Performance problems or optimization opportunities
        8. Code quality and maintainability issues
        9. Potential intellectual property concerns
        10. Compliance issues (GDPR, CCPA, etc. where relevant)
        
        For each issue:
        1. Specify the line number
        2. Describe the bug or issue clearly
        3. Provide the original problematic code snippet
        4. Suggest a fixed or improved version of the code
        5. Classify the severity as "error" (breaks functionality or major security/ethical concern), "warning" (works but problematic or moderate security/ethical concern), or "info" (style/optimization or minor security/ethical concern)
        6. Categorize the issue as one of: "security", "ethics", "code-quality", "performance", "accessibility", "privacy", or "compliance"

        IMPORTANT: The code is written in ${language}. Make sure your analysis and suggestions are appropriate for ${language} syntax and best practices.

        ${formatInstructions}
      `;

      // We'll try to use Google Generative AI first, and fall back to OpenAI if there's an issue
      try {
        const model = this.googleAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(promptText);
        const response = result.response.text();
        
        // Parse the response
        return await this.parser.parse(response);
      } catch (googleError) {
        console.log('Google AI failed, falling back to OpenAI:', googleError);
        
        // Fallback to OpenAI
        const response = await this.openAI.invoke(promptText);
        return await this.parser.parse(response.content as string);
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
      throw new Error('Failed to analyze code');
    }
  }

  /**
   * Generate a response to a user's question about code
   */
  public async askQuestion(question: string, codeContext: string = '', language: string = ''): Promise<string> {
    try {
      // Use a simple string for the prompt (avoid PromptTemplate to prevent template errors)
      const promptText = `
        You are an expert software developer and coding assistant with deep knowledge of ethical and security best practices.
        
        ${codeContext ? `Here is the code context:\n\`\`\`${language}\n${codeContext}\n\`\`\`\n` : ''}
        
        User question: ${question}
        
        Provide a clear, accurate, and helpful response. Include code examples when relevant.
        
        If the question or code involves any of the following areas, be sure to highlight them in your response:
        1. Security vulnerabilities or best practices
        2. Potential presence of API keys, credentials, or secrets
        3. Privacy concerns or data protection issues
        4. Ethical implications of algorithms or data handling
        5. Bias in algorithms or data processing
        6. Accessibility considerations
        7. Regulatory compliance (like GDPR, CCPA, HIPAA, etc.)
        8. Intellectual property concerns
        9. Environmental impact of code efficiency
        
        For security or ethical concerns, always explain:
        - Why it's a concern
        - The potential impact or risk
        - Recommended best practices to address it
      `;
      
      // Try Google AI first
      try {
        const model = this.googleAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(promptText);
        return result.response.text();
      } catch (googleError) {
        console.log('Google AI failed, falling back to OpenAI:', googleError);
        
        // Fallback to OpenAI
        const response = await this.openAI.invoke(promptText);
        return response.content as string;
      }
    } catch (error) {
      console.error('Error asking question:', error);
      throw new Error('Failed to get response from AI');
    }
  }
}

// Create a singleton instance that can be imported across the application
// Get API keys from environment variables
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

// Create the service with available API keys
export const aiService = new AIService(googleApiKey, openaiApiKey);
