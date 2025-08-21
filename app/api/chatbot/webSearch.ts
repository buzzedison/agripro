import axios from 'axios';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Performs a web search using the SerpAPI to get information from the internet
 * Note: Requires a SerpAPI key to be set in the environment variables
 * 
 * @param query The search query
 * @returns Array of search results with title, link, and snippet
 */
export async function searchWeb(query: string): Promise<SearchResult[]> {
  // If no SerpAPI key is set, return empty results
  if (!process.env.SERPAPI_KEY) {
    console.warn('SERPAPI_KEY not found in environment variables');
    return [];
  }

  try {
    // Add "agribusiness Africa" to the query to focus results
    const searchQuery = `${query} agribusiness Africa`;
    
    // Call SerpAPI to get search results
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: searchQuery,
        api_key: process.env.SERPAPI_KEY,
        engine: 'google',
        num: 5, // Limit to 5 results for conciseness
      },
      timeout: 5000, // 5 second timeout
    });

    // Extract and format search results
    if (response.data && response.data.organic_results) {
      return response.data.organic_results.map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error searching the web:', error);
    return [];
  }
}

/**
 * Alternative implementation using a custom Google Search API
 * Note: Requires Google Custom Search API key and Search Engine ID
 */
export async function searchGoogleCustom(query: string): Promise<SearchResult[]> {
  // If no Google API key or search engine ID is set, return empty results
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    console.warn('Google Search API credentials not found in environment variables');
    return [];
  }

  try {
    // Add "agribusiness Africa" to the query to focus results
    const searchQuery = `${query} agribusiness Africa`;
    
    // Call Google Custom Search API
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_SEARCH_API_KEY,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: searchQuery,
        num: 5, // Limit to 5 results
      },
      timeout: 5000, // 5 second timeout
    });

    // Extract and format search results
    if (response.data && response.data.items) {
      return response.data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error searching Google:', error);
    return [];
  }
}
