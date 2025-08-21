// JavaScript version of freeWebSearch.ts for testing
const axios = require('axios');
const cheerio = require('cheerio');

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
async function freeWebSearch(query) {
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
    const results = [];

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
    console.error('Error with free web search:', error);
    return [];
  }
}

/**
 * Fallback search that doesn't rely on scraping
 * Uses Wikipedia API which is free and has no rate limits for reasonable use
 */
async function wikipediaSearch(query) {
  try {
    // Add "agriculture Africa" to the query to focus results
    const searchQuery = encodeURIComponent(`${query} agriculture Africa`);
    
    // Use Wikipedia's API which is free and allows CORS
    const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*`, {
      timeout: 5000, // 5 second timeout
    });

    // Extract and format search results
    if (response.data && response.data.query && response.data.query.search) {
      return response.data.query.search.slice(0, 5).map((result) => {
        // Remove HTML tags from snippet
        const snippet = result.snippet.replace(/<\/?[^>]+(>|$)/g, "");
        
        return {
          title: result.title,
          link: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`,
          snippet: snippet
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Error with Wikipedia search:', error);
    return [];
  }
}

module.exports = {
  freeWebSearch,
  wikipediaSearch
};
