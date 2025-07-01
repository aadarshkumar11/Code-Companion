import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { detectLanguage } from '@/lib/parsers/codeParser';

// This API route enables streaming analysis results as they're generated
export async function POST(request: NextRequest) {
  try {
    const { code, language, filename, additionalContext } = await request.json();
    
    // Detect language if not provided
    const detectedLanguage = language || detectLanguage(filename || '', code);
    
    // Initialize Google AI with API key
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.2,
      }
    });
    
    // Create the prompt for code analysis - simplified to focus on streaming
    const promptText = `
      You are an expert software developer specializing in debugging and code review.
      Analyze the following ${detectedLanguage} code for bugs, errors, or potential improvements.
      
      ${additionalContext ? `Additional context: ${additionalContext}\n` : ''}
      
      CODE TO ANALYZE:
      \`\`\`${detectedLanguage}
      ${code}
      \`\`\`
      
      For each issue you find, respond in this exact JSON format:
      { "id": "unique-id", "lineNumber": 123, "bugDescription": "description", "originalCode": "problematic code", "suggestedCode": "fixed code", "severity": "error|warning|info" }
      
      Analyze the code line by line. After each issue found, output "ISSUE_COMPLETE" on a separate line.
      When you've completed your analysis, output "ANALYSIS_COMPLETE" followed by a summary of all issues.
    `;
    
    // Create a streaming response
    const stream = await model.generateContentStream(promptText);
    
    // Set up the Server-Sent Events response
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          
          // Process each chunk as it arrives
          for await (const chunk of stream.stream) {
            const text = chunk.text();
            if (text) {
              buffer += text;
              
              // Check if we have a complete issue
              if (buffer.includes('ISSUE_COMPLETE')) {
                const parts = buffer.split('ISSUE_COMPLETE');
                // Process all complete issues except possibly the last part
                for (let i = 0; i < parts.length - 1; i++) {
                  try {
                    // Try to extract JSON from the text
                    const jsonMatch = parts[i].match(/\{[\s\S]*?\}/);
                    if (jsonMatch) {
                      // Send the parsed issue to the client
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                        type: 'issue', 
                        content: JSON.parse(jsonMatch[0]) 
                      })}\n\n`));
                    }
                  } catch (e) {
                    console.error('Error parsing issue JSON:', e);
                  }
                }
                // Keep the last part in the buffer
                buffer = parts[parts.length - 1];
              }
              
              // Check if analysis is complete
              if (buffer.includes('ANALYSIS_COMPLETE')) {
                const parts = buffer.split('ANALYSIS_COMPLETE');
                // Send any remaining issue
                if (parts[0].trim()) {
                  try {
                    const jsonMatch = parts[0].match(/\{[\s\S]*?\}/);
                    if (jsonMatch) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                        type: 'issue', 
                        content: JSON.parse(jsonMatch[0]) 
                      })}\n\n`));
                    }
                  } catch (e) {
                    console.error('Error parsing final issue JSON:', e);
                  }
                }
                
                // Send the summary
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'summary', 
                  content: parts[1].trim() 
                })}\n\n`));
                
                // Clear the buffer
                buffer = '';
              }
            }
          }
          
          // Send any remaining content
          if (buffer.trim()) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'partial', 
              content: buffer.trim() 
            })}\n\n`));
          }
          
          // Signal the end of the stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });
    
    // Return the streaming response
    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in streaming analysis API:', error);
    return new Response(JSON.stringify({ error: 'Failed to stream analysis' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
