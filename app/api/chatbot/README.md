# AgriPro Chatbot API

## Overview
This directory contains the server-side API implementation for the AgriPro Knowledge Hub chatbot. The chatbot combines AI-powered responses from Google's Gemini with web search capabilities to provide comprehensive information about agribusiness in Africa.

## Components

### `route.ts`
Main API route handler that:
- Processes incoming chat messages
- Searches website content for relevant information
- Performs web searches for external information
- Generates AI responses using Gemini
- Falls back to rule-based responses when needed

### `websiteUtils.ts`
Utilities for searching internal website content to provide context-aware responses.

### `webSearch.ts`
Implements web search functionality using either:
- SerpAPI (recommended for production)
- Google Custom Search API (alternative)

### `freeWebSearch.ts`
Implements free web search functionality using:
- DuckDuckGo HTML scraping (primary method)
- Wikipedia API (fallback method)
- No API keys required

## Configuration
To enable all features, you'll need to set up the following API keys in your `.env.local` file:

```
# Gemini API Key - Required for AI responses
GEMINI_API_KEY=your_gemini_api_key_here

# OPTIONAL: Paid Web Search APIs
# The chatbot will work without these keys, using free alternatives instead

# SerpAPI Key - Optional for premium web search
SERPAPI_KEY=your_serpapi_key_here

# Alternative: Google Custom Search API - Optional
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

## Web Search Setup

### Free Options (No API Keys Required)

#### DuckDuckGo Search
The chatbot uses DuckDuckGo HTML scraping as the primary free search method. This requires no setup but has some limitations:
- May be subject to rate limiting
- HTML structure changes might break the scraper
- Less reliable than paid API services

#### Wikipedia API
Used as a fallback when DuckDuckGo fails. The Wikipedia API:
- Is completely free with no API key required
- Has no rate limits for reasonable use
- Provides reliable, factual information
- Is more limited in scope than general web search

### Paid Options (Optional)

#### Option 1: SerpAPI (Recommended)
1. Sign up at [SerpAPI](https://serpapi.com/)
2. Get your API key
3. Add it to your `.env.local` file as `SERPAPI_KEY`

#### Option 2: Google Custom Search API
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Custom Search API
3. Create API credentials
4. Set up a Custom Search Engine at [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
5. Add both the API key and Search Engine ID to your `.env.local` file

## Fallback Mechanism
If web search or AI services are unavailable, the chatbot will automatically fall back to rule-based responses to ensure users always receive a helpful answer.

## Link Handling

The chatbot has been enhanced to intelligently handle links in responses:

### System Prompt Configuration
- AI is instructed to format links using markdown syntax: `[link text](URL)`
- AI is prompted to reference AgriPro content with appropriate links
- AI includes source citations with links to external resources

### Client-Side Rendering
In the `ChatbotDialog.tsx` component:
- Links are rendered using ReactMarkdown with proper styling
- Internal AgriPro links (containing the site domain) are:
  - Styled with green color for better visibility
  - Handled by Next.js router for seamless navigation
- External links are:
  - Styled with blue color
  - Configured to open in new tabs with `target="_blank"`
  - Include `rel="noopener noreferrer"` for security

### Benefits
- Improved user experience with contextual navigation
- Clear visual distinction between internal and external resources
- Seamless transitions between chatbot and website content
- Better content discovery through relevant links

## Testing

### Test Scripts
- `test-web-search.js`: JavaScript test script for validating web search functionality
- Can be run with Node.js to test both free and paid search methods

### Manual Testing
Test the chatbot by asking questions that would benefit from:
1. Internal content references (e.g., "Tell me about AgriPro Clubs")
2. External web searches (e.g., "What are current cocoa prices in Ghana?")
3. Link generation (e.g., "Show me resources about sustainable farming")

## Future Enhancements
- Multi-modal capabilities (image recognition for plant diseases)
- Voice input/output for accessibility
- Support for regional African languages
- SMS integration for farmers with limited internet access
- User-specific chat history and preferences
