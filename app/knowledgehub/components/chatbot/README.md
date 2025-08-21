# AgriPro Knowledge Hub Chatbot

## Overview
The AgriPro Knowledge Hub Chatbot is an intelligent assistant that provides information about agriculture, farming practices, and related topics to users of the AgriPro platform. The chatbot combines AI-powered responses with rule-based fallbacks for a reliable user experience.

## Features
- AI-powered responses using Google's Gemini AI
- Context-aware responses that incorporate website content
- Fallback to rule-based responses when AI is unavailable
- Clear UI indicators for AI vs. rule-based responses
- Conversation history tracking

## Implementation Details

### AI Integration
The chatbot uses Google's Gemini AI (specifically the Gemini 1.5 Flash model) to generate intelligent, contextually relevant responses. The integration is implemented server-side to protect API credentials.

### Components
1. **ChatbotDialog.tsx**: Main UI component for the chatbot interface
2. **useChat.ts**: Custom hook for managing chat state and interactions
3. **geminiClient.ts**: Client for interacting with the Gemini API
4. **route.ts**: Server-side API route for processing chatbot requests

### API Route
The `/api/chatbot/route.ts` file handles:
- Processing incoming chat messages
- Searching website content for relevant information
- Generating system prompts with context
- Calling the Gemini API
- Falling back to rule-based responses when needed

## Configuration
To use the chatbot with Gemini AI:

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add your API key to the `.env.local` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Fallback Mechanism
If the Gemini API is unavailable or returns an error, the chatbot will automatically fall back to rule-based responses. This ensures that users always receive a response, even if the AI service is temporarily unavailable.

## Future Improvements
- Advanced context management
- User interaction tracking
- Multi-modal response capabilities (images, links)
- Comprehensive error logging
