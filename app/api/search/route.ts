import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/app/lib/client';

// Define the search parameters interface
export interface SearchParams {
  query?: string;
  filters?: {
    category?: string[];
    contentType?: string[];
    region?: string[];
    cropType?: string[];
    date?: string;
  };
  page?: number;
  pageSize?: number;
  includeRelated?: boolean;
}

// Define the search response interface
export interface SearchResponse {
  results: SearchResult[];
  facets: {
    categories: FacetValue[];
    contentTypes: FacetValue[];
    regions: FacetValue[];
    cropTypes: FacetValue[];
  };
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
  suggestions?: string[];
  relatedContent?: SearchResult[];
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  category?: string;
  contentType: string;
  publishedAt?: string;
  slug?: string;
  url: string;
  image?: string;
  regions?: string[];
  cropTypes?: string[];
  score: number;
  highlights?: {
    title?: string;
    description?: string;
    excerpt?: string;
    summary?: string;
  };
}

export interface FacetValue {
  value: string;
  count: number;
}

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

// Helper function to get related content based on search results
async function getRelatedContent(results: SearchResult[]): Promise<SearchResult[]> {
  if (!results || results.length === 0) return [];
  
  try {
    // Extract categories and content types from top results
    const topResults = results.slice(0, 3);
    const categories = topResults
      .map(r => r.category)
      .filter(Boolean) as string[];
    const contentTypes = topResults
      .map(r => r.contentType)
      .filter(Boolean) as string[];
    
    // Don't recommend the same content
    const excludeIds = results.map(r => r.id);
    
    // Query for related content
    const relatedQuery = `*[_type in $contentTypes && !(_id in $excludeIds) && category in $categories] | order(publishedAt desc) [0...4] {
      "id": _id,
      "contentType": _type,
      title,
      description,
      excerpt,
      summary,
      category,
      publishedAt,
      "slug": slug.current,
      "url": select(
        _type == "bestPractices" => "/knowledgehub/practices/" + slug.current,
        _type == "insight" => "/knowledgehub/insights/" + slug.current,
        _type == "whitepaper" => "/knowledgehub/whitepapers/" + _id,
        _type == "expert" => "/knowledgehub/experts/" + slug.current,
        _type == "course" => "/knowledgehub/courses/" + slug.current
      ),
      "image": select(
        defined(image) => image.asset->url,
        defined(coverImage) => coverImage.asset->url,
        defined(profileImage) => profileImage.asset->url,
        ""
      ),
      "score": 0
    }`;
    
    const relatedContent = await client.fetch(relatedQuery, {
      contentTypes,
      categories,
      excludeIds
    });
    
    return relatedContent;
  } catch (error) {
    console.error('Error fetching related content:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      filters = {}, 
      page = 1, 
      pageSize = 10,
      includeRelated = true
    } = body as SearchParams;
    
    // Default empty filters
    const {
      category = [],
      contentType = [],
      region = [],
      cropType = [],
      date = 'all'
    } = filters;
    
    // Calculate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    // Build GROQ query filters
    const categoryFilter = category.length > 0 
      ? ` && category in ["${category.join('","')}"]` 
      : '';
      
    const contentTypeFilter = contentType.length > 0 
      ? ` && _type in ["${contentType.join('","')}"]` 
      : '';
      
    const regionFilter = region.length > 0 
      ? ` && defined(regions) && count(regions[]->name[@ in ["${region.join('","')}"]]) > 0` 
      : '';
      
    const cropTypeFilter = cropType.length > 0 
      ? ` && defined(cropTypes) && count(cropTypes[]->name[@ in ["${cropType.join('","')}"]]) > 0` 
      : '';
    
    // Date filter
    let dateFilter = '';
    const now = new Date();
    
    if (date !== 'all') {
      const dateCondition = (() => {
        switch (date) {
          case 'today':
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            return `>= "${today.toISOString()}"`;
          case 'this-week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            return `>= "${weekStart.toISOString()}"`;
          case 'this-month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return `>= "${monthStart.toISOString()}"`;
          case 'this-year':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return `>= "${yearStart.toISOString()}"`;
          default:
            return '';
        }
      })();
      
      if (dateCondition) {
        dateFilter = `&& publishedAt ${dateCondition}`;
      }
    }
    
    // Build the main query with improved scoring and relevance
    const searchQuery = `{
      "results": *[_type in ["bestPractices", "insight", "whitepaper", "expert", "course"]${query ? ` && title match "${query}"` : ''}${categoryFilter}${contentTypeFilter}${regionFilter}${cropTypeFilter}${dateFilter}] | order(publishedAt desc) [${start}...${end}] {
        "id": _id,
        "contentType": _type,
        title,
        description,
        excerpt,
        summary,
        category,
        publishedAt,
        "slug": slug.current,
        "url": select(
          _type == "bestPractices" => "/knowledgehub/practices/" + slug.current,
          _type == "insight" => "/knowledgehub/insights/" + slug.current,
          _type == "whitepaper" => "/knowledgehub/whitepapers/" + _id,
          _type == "expert" => "/knowledgehub/experts/" + slug.current,
          _type == "course" => "/knowledgehub/courses/" + slug.current
        ),
        "image": select(
          defined(image) => image.asset->url,
          defined(coverImage) => coverImage.asset->url,
          defined(profileImage) => profileImage.asset->url,
          ""
        ),
        "regions": regions[]->name,
        "cropTypes": cropTypes[]->name,
        "score": 0
      },
      "totalResults": count(*[_type in ["bestPractices", "insight", "whitepaper", "expert", "course"]${query ? ` && title match "${query}"` : ''}${categoryFilter}${contentTypeFilter}${regionFilter}${cropTypeFilter}${dateFilter}])
    }`;
    
    // Build facets query separately to avoid complex grouping
    const facetsQuery = `{
      "categories": *[_type in ["bestPractices", "insight", "whitepaper", "course"] && defined(category)${query ? ` && title match "${query}"` : ''}].category,
      
      "contentTypes": *[_type in ["bestPractices", "insight", "whitepaper", "expert", "course"]${query ? ` && title match "${query}"` : ''}]._type,
      
      "regions": *[_type in ["bestPractices", "insight", "whitepaper", "course"] && defined(regions)${query ? ` && title match "${query}"` : ''}].regions[]->name,
      
      "cropTypes": *[_type in ["bestPractices", "insight", "whitepaper", "course"] && defined(cropTypes)${query ? ` && title match "${query}"` : ''}].cropTypes[]->name
    }`;
    
    // Execute the queries
    try {
      const [searchResults, facetsResults] = await Promise.all([
        client.fetch(searchQuery),
        client.fetch(facetsQuery)
      ]);
      
      // Process facets to count occurrences
      const processFacets = (items: string[]): FacetValue[] => {
        const counts: Record<string, number> = {};
        
        items.forEach(item => {
          if (typeof item === 'string') {
            counts[item] = (counts[item] || 0) + 1;
          }
        });
        
        return Object.entries(counts)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count);
      };
      
      // Prepare the response
      const response: SearchResponse = {
        results: searchResults.results || [],
        facets: {
          categories: processFacets(facetsResults.categories || []),
          contentTypes: processFacets(facetsResults.contentTypes || []),
          regions: processFacets(facetsResults.regions || []),
          cropTypes: processFacets(facetsResults.cropTypes || [])
        },
        totalResults: searchResults.totalResults || 0,
        page,
        pageSize,
        totalPages: Math.ceil(searchResults.totalResults / pageSize),
        suggestions: [],
        relatedContent: []
      };
      
      // Add suggestions if we have a query
      if (query && query.length >= 3) {
        try {
          const suggestions = await generateSearchSuggestions(query);
          response.suggestions = suggestions;
        } catch (error) {
          console.error('Error generating suggestions:', error);
        }
      }
      
      // Add related content if requested and we have results
      if (includeRelated && searchResults.results && searchResults.results.length > 0) {
        try {
          const relatedContent = await getRelatedContent(searchResults.results);
          response.relatedContent = relatedContent;
        } catch (error) {
          console.error('Error fetching related content:', error);
        }
      }
      
      return NextResponse.json(response);
    } catch (queryError) {
      console.error('Search query error:', queryError);
      return NextResponse.json(
        { 
          error: 'Failed to execute search query',
          details: queryError instanceof Error ? queryError.message : String(queryError)
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
