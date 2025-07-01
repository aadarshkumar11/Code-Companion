import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai/AIService';

export async function POST(request: NextRequest) {
  try {
    const { question, codeContext, language } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }
    
    // Call the AI service to generate a response
    const response = await aiService.askQuestion(question, codeContext, language);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
