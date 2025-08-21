import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/app/lib/client';

// Helper function to generate search suggestions based on query
async function generateSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 3) return [];
  
  try {
    // Get common terms related to the query from the content
    const suggestionsQuery = `{
      "titleTerms": *[_type in ["bestPractices", "insight", "whitepaper", "course"] && title match "${query}*"].title,
      "categoryTerms": *[_type in ["bestPractices", "insight", "whitepaper", "course"] && category match "${query}*"].category
    }`;
    
    const results = await client.fetch<{titleTerms: string[], categoryTerms: string[]}>(suggestionsQuery);
    
    // Extract unique terms that contain the query
    const allTerms = [...(results.titleTerms || []), ...(results.categoryTerms || [])];
    const suggestions = new Set<string>();
    
    // Process terms to extract relevant suggestions
    allTerms.forEach((term: string) => {
      if (typeof term === 'string') {
        // Extract phrases containing the query
        const lowerTerm = term.toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        if (lowerTerm.includes(lowerQuery)) {
          // Extract the phrase containing the query (up to 5 words)
          const words = term.split(' ');
          for (let i = 0; i < words.length; i++) {
            if (words[i].toLowerCase().includes(lowerQuery)) {
              // Get a phrase of up to 5 words centered around the matching word
              const start = Math.max(0, i - 2);
              const end = Math.min(words.length, i + 3);
              const phrase = words.slice(start, end).join(' ');
              suggestions.add(phrase);
              break;
            }
          }
        }
      }
    });
    
    // Convert to array and limit to top 5 suggestions
    return Array.from(suggestions).slice(0, 5);
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string' || query.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }
    
    const suggestions = await generateSearchSuggestions(query);
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in suggestions API:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
} 