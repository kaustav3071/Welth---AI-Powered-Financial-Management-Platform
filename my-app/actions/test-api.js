"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Simple function to test if Gemini API is working
export async function testGeminiAPI() {
  try {
    console.log('🧪 Testing Gemini API...');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = "Reply with just the word 'SUCCESS' and nothing else.";
    
    console.log('📡 Making test API call to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('✅ Gemini API test response:', text);
    
    return {
      success: true,
      response: text,
      message: "Gemini API is working correctly"
    };
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    
    let errorMessage = "Unknown error";
    
    if (error.message.includes('API key')) {
      errorMessage = "Invalid API key";
    } else if (error.status === 429) {
      errorMessage = "API quota exceeded";
    } else if (error.status === 403) {
      errorMessage = "API access forbidden";
    } else {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
      details: error.message
    };
  }
}