// Test script for web search functionality
// Run with: node test-web-search.js

// Import free search methods
const { freeWebSearch, wikipediaSearch } = require('./freeWebSearch');

// Try to import paid search methods if available
let searchWeb, searchGoogleCustom;
try {
  const paidSearchMethods = require('./webSearch');
  searchWeb = paidSearchMethods.searchWeb;
  searchGoogleCustom = paidSearchMethods.searchGoogleCustom;
} catch (error) {
  console.log('Paid search methods not available. Will only test free methods.');
}

async function testWebSearch() {
  console.log('Testing web search functionality...');
  
  // Test query
  const query = 'latest developments in agribusiness in Kenya';
  
  console.log(`Query: "${query}"`);
  
  try {
    // Test free search methods first
    console.log('\n--- Testing Free Web Search Methods ---');
    
    // Test DuckDuckGo search
    console.log('\nSearching with DuckDuckGo (free)...');
    const duckDuckGoResults = await freeWebSearch(query);
    
    if (duckDuckGoResults.length > 0) {
      console.log('\nDuckDuckGo Search Results:');
      duckDuckGoResults.forEach((result, index) => {
        console.log(`\n[Result ${index + 1}]`);
        console.log(`Title: ${result.title}`);
        console.log(`Link: ${result.link}`);
        console.log(`Snippet: ${result.snippet}`);
      });
    } else {
      console.log('\nNo DuckDuckGo results found. This might be due to rate limiting or HTML structure changes.');
    }
    
    // Test Wikipedia search
    console.log('\nSearching with Wikipedia API (free)...');
    const wikipediaResults = await wikipediaSearch(query);
    
    if (wikipediaResults.length > 0) {
      console.log('\nWikipedia Search Results:');
      wikipediaResults.forEach((result, index) => {
        console.log(`\n[Result ${index + 1}]`);
        console.log(`Title: ${result.title}`);
        console.log(`Link: ${result.link}`);
        console.log(`Snippet: ${result.snippet}`);
      });
    } else {
      console.log('\nNo Wikipedia results found.');
    }
    
    // Test paid search methods if available
    if (searchWeb && searchGoogleCustom) {
      console.log('\n--- Testing Paid API Methods (if configured) ---');
      
      // Test SerpAPI search
      console.log('\nSearching with SerpAPI (paid)...');
      const serpResults = await searchWeb(query);
      
      if (serpResults.length > 0) {
        console.log('\nSerpAPI Search Results:');
        serpResults.forEach((result, index) => {
          console.log(`\n[Result ${index + 1}]`);
          console.log(`Title: ${result.title}`);
          console.log(`Link: ${result.link}`);
          console.log(`Snippet: ${result.snippet}`);
        });
      } else {
        console.log('\nNo SerpAPI results found. Check your API key configuration.');
      }
      
      // Test Google Custom Search
      console.log('\nSearching with Google Custom Search (paid)...');
      const googleResults = await searchGoogleCustom(query);
      
      if (googleResults.length > 0) {
        console.log('\nGoogle Custom Search Results:');
        googleResults.forEach((result, index) => {
          console.log(`\n[Result ${index + 1}]`);
          console.log(`Title: ${result.title}`);
          console.log(`Link: ${result.link}`);
          console.log(`Snippet: ${result.snippet}`);
        });
      } else {
        console.log('\nNo Google Custom Search results found. Check your API key configuration.');
      }
      
      console.log('\n--- Summary ---');
      console.log(`DuckDuckGo results: ${duckDuckGoResults.length}`);
      console.log(`Wikipedia results: ${wikipediaResults.length}`);
      console.log(`SerpAPI results: ${serpResults.length}`);
      console.log(`Google Custom Search results: ${googleResults.length}`);
    } else {
      console.log('\n--- Summary ---');
      console.log(`DuckDuckGo results: ${duckDuckGoResults.length}`);
      console.log(`Wikipedia results: ${wikipediaResults.length}`);
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testWebSearch();
