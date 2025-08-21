import axios from 'axios';
import * as cheerio from 'cheerio';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Performs a free web search by scraping public search results
 * This approach doesn't require any API keys but has limitations:
 * - May be rate limited if used too frequently
 * - Search engines may change their HTML structure
 * - Less reliable than paid API services
 * 
 * @param query The search query
 * @returns Array of search results with title, link, and snippet
 */
export async function freeWebSearch(query: string): Promise<SearchResult[]> {
  try {
    // Add "agribusiness Africa" to the query to focus results
    const searchQuery = encodeURIComponent(`${query} agribusiness Africa`);
    
    // Use DuckDuckGo as it's more scraping-friendly than Google
    const response = await axios.get(`https://html.duckduckgo.com/html/?q=${searchQuery}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000, // 10 second timeout
    });

    // Parse the HTML response
    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    // Extract search results
    $('.result').each((i, element) => {
      if (i >= 5) return false; // Limit to 5 results
      
      const titleElement = $(element).find('.result__title');
      const title = titleElement.text().trim();
      const link = $(titleElement).find('a').attr('href');
      const snippet = $(element).find('.result__snippet').text().trim();
      
      if (title && link && snippet) {
        results.push({
          title,
          link,
          snippet
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error in freeWebSearch:', error);
    return [];
  }
}

/**
 * Alternative implementation using Bing search
 * This is another free option but may have similar limitations
 */
export async function bingWebSearch(query: string): Promise<SearchResult[]> {
  try {
    // Add "agribusiness Africa" to the query to focus results
    const searchQuery = encodeURIComponent(`${query} agribusiness Africa`);
    
    const response = await axios.get(`https://www.bing.com/search?q=${searchQuery}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000, // 10 second timeout
    });

    // Parse the HTML response
    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    // Extract search results from Bing
    $('.b_algo').each((i, element) => {
      if (i >= 5) return false; // Limit to 5 results
      
      const titleElement = $(element).find('h2');
      const title = titleElement.text().trim();
      const link = $(titleElement).find('a').attr('href') || '';
      const snippet = $(element).find('.b_caption p').text().trim();
      
      if (title && link && snippet) {
        results.push({
          title,
          link,
          snippet
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error with Bing web search:', error);
    return [];
  }
}

/**
 * Fallback search using Wikipedia API
 * This is more reliable than scraping but limited to Wikipedia content
 * 
 * @param query The search query
 * @returns Array of search results with title, link, and snippet
 */
export async function wikipediaSearch(query: string): Promise<SearchResult[]> {
  try {
    // Add "agriculture Africa" to the query to focus results
    const searchQuery = encodeURIComponent(`${query} agriculture Africa`);
    
    // Use Wikipedia's API to search for articles
    const response = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*`
    );
    
    const results: SearchResult[] = [];
    
    if (response.data && response.data.query && response.data.query.search) {
      const searchResults = response.data.query.search;
      
      // Process up to 5 results
      for (let i = 0; i < Math.min(5, searchResults.length); i++) {
        const item = searchResults[i];
        const title = item.title;
        const snippet = item.snippet.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
        const link = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
        
        results.push({
          title,
          link,
          snippet
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in wikipediaSearch:', error);
    return [];
  }
}
