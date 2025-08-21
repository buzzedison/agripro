# AgriPro AI Chat Interface

This directory contains the implementation of the AgriPro AI chat interface, which allows users to interact with various AI models to get agriculture-related information and assistance.

## Features

- Chat interface similar to ChatGPT/Claude/Grok
- Support for multiple AI models (Claude, Gemini, GPT-4, Mistral)
- Markdown rendering for formatted responses
- Example prompts for common agricultural questions
- Responsive design for all device sizes

## Components

- `page.tsx` - Main chat page component
- `components/` - Directory containing UI components
  - `ChatInput.tsx` - Message input component
  - `ChatMessage.tsx` - Individual message display component
  - `ModelSelector.tsx` - AI model selection dropdown
  - `EmptyState.tsx` - Initial state with example prompts
- `types.ts` - TypeScript types for the chat interface
- `api/chat/route.ts` - API endpoint for chat functionality

## Usage

To use this chat interface, navigate to the /chat route in the application. Users can:

1. Select an AI model from the dropdown
2. Type a question in the input field
3. View the AI's response with formatted markdown
4. Use example prompts to get started

## Implementation Notes

The current implementation uses simulated responses for demonstration purposes. To integrate with real AI models, update the API route handler with appropriate API credentials and request formatting for each supported model.

For each model:
- Claude: Anthropic's API
- Gemini: Google's Generative AI API
- GPT-4: OpenAI's API
- Mistral: Mistral AI's API

## Model Icon Credits

The model icons should be placed in the public/images directory with the following filenames:
- claude-icon.png
- gemini-icon.png
- gpt-icon.png
- mistral-icon.png 