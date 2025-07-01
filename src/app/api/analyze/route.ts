import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai/AIService';
import { detectLanguage } from '@/lib/parsers/codeParser';

export async function POST(request: NextRequest) {
  try {
    const { code, language, filename, additionalContext } = await request.json();
    
    // Detect language if not provided
    const detectedLanguage = language || detectLanguage(filename || '', code);
    
    console.log('Analyzing code with language:', detectedLanguage);
    
    // Call the AI service to analyze the code
    const analysisResult = await aiService.analyzeCode(code, detectedLanguage, additionalContext);
    
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in code analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    );
  }
}
