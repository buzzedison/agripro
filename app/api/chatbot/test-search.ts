import { freeWebSearch, wikipediaSearch } from './freeWebSearch';

// Test function for the search utilities
async function testSearchFunctions() {
  console.log('Testing search functions...');
  
  const query = 'sustainable farming practices';
  
  console.log(`\nTesting freeWebSearch with query: "${query}"`);
  try {
    const freeResults = await freeWebSearch(query);
    console.log(`Found ${freeResults.length} results from freeWebSearch:`);
    freeResults.forEach((result, index) => {
      console.log(`\n--- Result ${index + 1} ---`);
      console.log(`Title: ${result.title}`);
      console.log(`Link: ${result.link}`);
      console.log(`Snippet: ${result.snippet.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error('Error testing freeWebSearch:', error);
  }
  
  console.log(`\nTesting wikipediaSearch with query: "${query}"`);
  try {
    const wikiResults = await wikipediaSearch(query);
    console.log(`Found ${wikiResults.length} results from wikipediaSearch:`);
    wikiResults.forEach((result, index) => {
      console.log(`\n--- Result ${index + 1} ---`);
      console.log(`Title: ${result.title}`);
      console.log(`Link: ${result.link}`);
      console.log(`Snippet: ${result.snippet.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error('Error testing wikipediaSearch:', error);
  }
}

// Run the test
testSearchFunctions().then(() => {
  console.log('\nSearch function tests completed');
}).catch(error => {
  console.error('Error running tests:', error);
});
