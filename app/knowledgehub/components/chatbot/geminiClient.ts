'use client';

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * Initialize the Gemini client with the API key
 * Note: This is a client-side implementation for demonstration purposes
 * In production, all API calls should be made server-side to protect the API key
 */
export function getGeminiClient(apiKey: string): GenerativeModel {
  // Initialize the Gemini API client
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Get the generative model (using Gemini 1.5 Flash for faster responses)
  // With improved configuration for better responses
  return genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 1024,
    }
  });
}
