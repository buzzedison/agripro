'use client';

import { OpenAI } from 'openai';

// DeepSeek API client using OpenAI-compatible interface
export class DeepSeekClient {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com', // DeepSeek API endpoint
    });
  }

  /**
   * Generate a response using DeepSeek's API
   * @param messages The conversation history
   * @param systemPrompt Optional system prompt to guide the model
   * @returns The generated response text
   */
  async generateResponse(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    systemPrompt?: string
  ): Promise<string> {
    try {
      // Add system prompt if provided
      const allMessages = systemPrompt 
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat', // Uses DeepSeek-V3 model
        messages: allMessages as any,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      });

      return response.choices[0].message.content || 'No response generated';
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw new Error('Failed to generate response from DeepSeek API');
    }
  }
}

// Note: We don't need this client-side helper anymore since we'll only call DeepSeek from the server
// The API key should only be used server-side in the API route
