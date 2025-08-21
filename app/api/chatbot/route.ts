import { searchWebsiteContentServer, WebsiteContent } from './websiteUtils';
import { searchWeb } from './webSearch';
import { freeWebSearch, wikipediaSearch } from './freeWebSearch';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SearchParams, SearchResponse } from '../search/route';

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 1024,
  }
});

// Simple rule-based response generator as fallback
function generateRuleBasedResponse(message: string, relevantContent: any[]): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for greetings
  if (lowerMessage.match(/^(hi|hello|hey|greetings)/i)) {
    return "Hello! I'm the AgriPro Assistant. How can I help you with agricultural information today?";
  }
  
  // Check for thanks
  if (lowerMessage.match(/(thank you|thanks|thank)/i)) {
    return "You're welcome! If you have any more questions about agriculture or farming practices, feel free to ask.";
  }
  
  // Check for questions about AgriPro
  if (lowerMessage.includes('agripro') && (lowerMessage.includes('what') || lowerMessage.includes('who') || lowerMessage.includes('about'))) {
    return "AgriPro is a comprehensive platform dedicated to supporting African agriculture through knowledge sharing, market access, and community building. We offer resources for farmers, researchers, and agribusiness professionals across the continent.";
  }
  
  // If we have relevant content, use it to construct a response
  if (relevantContent.length > 0) {
    const mostRelevant = relevantContent[0];
    // If the most relevant content is Farm Forward, skip it and look for Farm Smart instead
    if (mostRelevant.title.toLowerCase().includes('farm forward')) {
      const farmSmart = relevantContent.find(item => item.title.toLowerCase().includes('farm smart'));
      if (farmSmart) {
        return `Based on our information: ${farmSmart.content}\n\n${farmSmart.title} has more details on this topic.`;
      }
      // If Farm Smart not found, skip Farm Forward and use next relevant
      const nextRelevant = relevantContent.find(item => !item.title.toLowerCase().includes('farm forward'));
      if (nextRelevant) {
        return `Based on our information: ${nextRelevant.content}\n\n${nextRelevant.title} has more details on this topic.`;
      }
      // If nothing else, fall back to default
    }
    return `Based on our information: ${mostRelevant.content}\n\n${mostRelevant.title} has more details on this topic.`;
  }
  
  // Default response
  return "I don't have specific information about that. Please try asking about agricultural practices, crop management, or farming techniques in Africa. You can also ask about the Farm Smart program for digital tools and advice.";
}

// Perform advanced search using our search API
async function performAdvancedSearch(query: string): Promise<string> {
  try {
    const searchParams: SearchParams = {
      query,
      filters: {},
      page: 1,
      pageSize: 5
    };
    
    const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Search API responded with status: ${searchResponse.status}`);
    }
    
    const data: SearchResponse = await searchResponse.json();
    
    if (data.results.length === 0) {
      return '';
    }
    
    let searchResultsText = 'Here are some relevant resources from our platform:\n\n';
    
    data.results.forEach((result, index) => {
      searchResultsText += `${index + 1}. [${result.title}](${result.url}) - ${result.description}\n`;
    });
    
    return searchResultsText;
  } catch (error) {
    console.error('Advanced search error:', error);
    return '';
  }
}

// Create a comprehensive system prompt with context
function createSystemPrompt(relevantContent: WebsiteContent[], webResults: any[], query: string): string {
  let systemPrompt = `You are the AgriPro Assistant, an AI helper for the AgriPro Knowledge Hub platform focused on African agriculture.
Your primary goal is to provide helpful, accurate, and actionable information about agriculture, farming practices, crops, and related topics specifically for African contexts.

IMPORTANT GUIDELINES:
1. Focus on providing direct, practical advice and information in your responses.
2. Prioritize sharing actual agricultural knowledge rather than redirecting users to other pages.
3. If the user asks for local suppliers, input shops, markets, or resources (e.g., 'where do I find seeds in Accra'), use the web search results to suggest specific businesses, locations, addresses, or online directories if possible.
4. If you find relevant web links, summarize the best options and include names, addresses, or links in your answer.
5. If no direct answer is found in the web results, suggest practical next steps (such as visiting local agri-input shops, searching online marketplaces, or contacting local agricultural extension offices in the specified location).
6. Always try to provide the most actionable and location-specific information available from the web or your knowledge.
7. Only suggest internal AgriPro links when they contain specific information that can't be summarized in your response.
8. Include external sources and references when relevant to provide comprehensive information.
9. When including external links, always use proper markdown format: [Title](https://example.com)
10. If you don't know something, admit it rather than making up information.
11. Format your responses with clear headings, bullet points, and paragraphs for readability.
12. When discussing agricultural practices, consider the specific challenges and opportunities in African contexts.
13. Remember that users are already in the Knowledge Hub, so avoid unnecessarily directing them there.

ABOUT AGRIPRO:
AgriPro is a comprehensive platform dedicated to supporting African agriculture through knowledge sharing, market access, and community building. The platform offers resources for farmers, researchers, and agribusiness professionals across the continent.

`;

  // Add relevant content from our website to the system prompt if available
  if (relevantContent.length > 0) {
    systemPrompt += '\n\nRELEVANT AGRIPRO CONTENT:\n';
    relevantContent.slice(0, 3).forEach(item => {
      systemPrompt += `\n--- ${item.title} ---\n${item.content}\n`;
      // Only include the link if it's not a general Knowledge Hub page
      if (!item.path.endsWith('/knowledgehub')) {
        systemPrompt += `For more details: [${item.title}](${item.path})\n`;
      }
    });
  }
  
  // Add search results to the system prompt
  if (webResults.length > 0) {
    systemPrompt += '\n\nRELEVANT WEB SEARCH RESULTS:\n';
    webResults.forEach((result: { title: string, link: string, snippet: string }) => {
      systemPrompt += `- ${result.title}: ${result.snippet} [Learn more](${result.link})\n`;
    });
  }
  
  // Add query-specific instructions
  systemPrompt += `\n\nCURRENT QUERY: "${query}"
  
Please provide a helpful, informative response to this query based on the information provided above. Focus on giving direct, practical information rather than redirecting the user to other pages. Include external sources when relevant, and always use proper markdown format for links: [Title](URL). If the query is about a topic not covered in the provided information, use your general knowledge about agriculture in Africa to provide a helpful response.`;

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const { message, messages } = await request.json();

    // First, search website content for relevant information
    const relevantContent = searchWebsiteContentServer(message);
    
    // Prioritize web search for external information
    let webResults: Array<{ title: string, link: string, snippet: string }> = [];
    
    // Try multiple search methods to get comprehensive external information
    try {
      // First try the primary web search
      const primaryResults = await searchWeb(message + " agriculture Africa");
      if (primaryResults && primaryResults.length > 0) {
        webResults = [...primaryResults];
      }
      
      // Then try the free web search for additional results
      const freeResults = await freeWebSearch(message + " agriculture Africa farming");
      if (freeResults && freeResults.length > 0) {
        // Combine results, avoiding duplicates
        const existingUrls = new Set(webResults.map(r => r.link));
        const newResults = freeResults.filter(r => !existingUrls.has(r.link));
        webResults = [...webResults, ...newResults].slice(0, 8); // Limit to 8 results
      }
      
      // Also try to get Wikipedia information for relevant agricultural terms
      const wikiResults = await wikipediaSearch(message + " agriculture");
      if (wikiResults && wikiResults.length > 0) {
        // Add Wikipedia results, which are often more comprehensive
        const existingUrls = new Set(webResults.map(r => r.link));
        const newWikiResults = wikiResults.filter(r => !existingUrls.has(r.link));
        webResults = [...webResults, ...newWikiResults].slice(0, 10); // Limit to 10 total results
      }
    } catch (searchError) {
      console.error('Web search error:', searchError);
      // Continue even if search fails
    }
    
    // Create a comprehensive system prompt with all available context
    const systemPrompt = createSystemPrompt(relevantContent, webResults, message);

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using fallback response');
      return NextResponse.json({ 
        response: generateRuleBasedResponse(message, relevantContent),
        isAIResponse: false
      });
    }

    try {
      // Format the conversation history for Gemini
      const chatHistory = messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      // Start a chat session
      const chat = geminiModel.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });
      
      // Generate a response
      const result = await chat.sendMessage([
        { text: systemPrompt }, // System prompt with context
        { text: message }       // User's message
      ]);
      
      const aiResponse = result.response.text();
      
      return NextResponse.json({ 
        response: aiResponse,
        isAIResponse: true
      });
    } catch (apiError: any) {
      // Handle specific API errors
      console.error('Gemini API error:', apiError);
      
      // Fall back to rule-based responses for any API errors
      return NextResponse.json({ 
        response: generateRuleBasedResponse(message, relevantContent),
        isAIResponse: false
      });
    }
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
