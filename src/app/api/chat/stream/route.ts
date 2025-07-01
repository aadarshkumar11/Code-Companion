import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// This API route demonstrates a streaming response pattern
export async function POST(request: NextRequest) {
  try {
    const { question, codeContext, language } = await request.json();
    
    // Initialize Google AI with API key
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      }
    });
    
    // Create the prompt
    const promptText = `
      You are an expert software developer and coding assistant.
      
      ${codeContext ? `Here is the code context:\n\`\`\`${language}\n${codeContext}\n\`\`\`\n` : ''}
      
      User question: ${question}
      
      Provide a clear, accurate, and helpful response. Include code examples when relevant.
    `;
    
    // Create a streaming response
    const stream = await model.generateContentStream(promptText);
    
    // Set up the Server-Sent Events response
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          // Process each chunk as it arrives
          for await (const chunk of stream.stream) {
            const text = chunk.text();
            if (text) {
              // Send the chunk to the client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
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
    console.error('Error in streaming chat API:', error);
    return new Response(JSON.stringify({ error: 'Failed to stream response' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
