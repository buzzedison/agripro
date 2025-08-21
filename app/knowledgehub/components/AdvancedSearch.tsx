'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SearchParams, SearchResponse, SearchResult } from '@/app/api/search/route';
import Image from 'next/image';
import Link from 'next/link';
import { debounce } from 'lodash';

// Define types for facets
interface Facets {
  categories: Array<{ value: string; count: number }>;
  contentTypes: Array<{ value: string; count: number }>;
  regions: Array<{ value: string; count: number }>;
  cropTypes: Array<{ value: string; count: number }>;
}

// Define required filters type
type RequiredFilters = {
  category: string[];
  contentType: string[];
  region: string[];
  cropType: string[];
  date: string;
};

export default function AdvancedSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get initial values from URL
  const initialQuery = searchParams.get('q') || '';
  const initialCategories = searchParams.getAll('category');
  const initialContentTypes = searchParams.getAll('contentType');
  const initialRegions = searchParams.getAll('region');
  const initialCropTypes = searchParams.getAll('cropType');
  const initialDate = searchParams.get('date') || 'all';
  const initialPage = parseInt(searchParams.get('page') || '1');
  
  // State for search parameters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RequiredFilters>({
    category: initialCategories,
    contentType: initialContentTypes,
    region: initialRegions,
    cropType: initialCropTypes,
    date: initialDate
  });
  
  // State for search results
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<Facets>({
    categories: [],
    contentTypes: [],
    regions: [],
    cropTypes: []
  });
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [relatedContent, setRelatedContent] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Content type labels for display
  const contentTypeLabels: Record<string, string> = {
    bestPractices: 'Best Practice',
    insight: 'Insight',
    whitepaper: 'Whitepaper',
    expert: 'Expert',
    course: 'Course'
  };
  
  // Helper function to get content type label
  const getContentTypeLabel = (contentType: string): string => {
    return contentTypeLabels[contentType] || contentType;
  };
  
  // Update URL with search parameters
  const updateUrl = useCallback((params: SearchParams) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('category');
    url.searchParams.delete('contentType');
    url.searchParams.delete('region');
    url.searchParams.delete('cropType');
    url.searchParams.delete('date');
    url.searchParams.delete('page');
    
    if (params.query) url.searchParams.set('q', params.query);
    
    const filterParams = params.filters || {};
    
    if (filterParams.category?.length) {
      filterParams.category.forEach(cat => {
        url.searchParams.append('category', cat);
      });
    }
    
    if (filterParams.contentType?.length) {
      filterParams.contentType.forEach(type => {
        url.searchParams.append('contentType', type);
      });
    }
    
    if (filterParams.region?.length) {
      filterParams.region.forEach(region => {
        url.searchParams.append('region', region);
      });
    }
    
    if (filterParams.cropType?.length) {
      filterParams.cropType.forEach(crop => {
        url.searchParams.append('cropType', crop);
      });
    }
    
    if (filterParams.date && filterParams.date !== 'all') {
      url.searchParams.set('date', filterParams.date);
    }
    
    if (params.page && params.page > 1) {
      url.searchParams.set('page', params.page.toString());
    }
    
    router.replace(`${pathname}?${url.searchParams.toString()}`);
  }, [router, pathname]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Show suggestions when typing (if query is at least 3 characters)
    if (value.length >= 3) {
      setShowSuggestions(true);
      // Fetch suggestions (debounced)
      debouncedFetchSuggestions(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };
  
  // Debounced function to fetch suggestions
  const debouncedFetchSuggestions = useMemo(
    () => debounce(async (query: string) => {
      try {
        const response = await fetch('/api/search/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300),
    [setSuggestions]
  );
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Perform search with the selected suggestion
    performSearch();
  };
  
  // Perform search
  const performSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searchParams: SearchParams = {
        query: searchQuery,
        filters,
        page: currentPage,
        pageSize: 10,
        includeRelated: true
      };
      
      // Update URL with search parameters
      updateUrl(searchParams);
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) {
        throw new Error(`Search request failed with status ${response.status}`);
      }
      
      const data: SearchResponse = await response.json();
      
      setSearchResults(data.results);
      setFacets(data.facets);
      setTotalResults(data.totalResults);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
      
      // Set suggestions and related content if available
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      
      if (data.relatedContent) {
        setRelatedContent(data.relatedContent);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, currentPage, updateUrl, setIsLoading, setError, setSearchResults, setFacets, setTotalResults, setTotalPages, setCurrentPage, setSuggestions, setRelatedContent]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    performSearch();
  };
  
  // Handle filter changes
  const handleFilterChange = (type: keyof RequiredFilters, value: string) => {
    const newFilters = { ...filters };
    if (type === 'date') {
      newFilters.date = value;
    } else {
      const array = newFilters[type] as string[];
      const index = array.indexOf(value);
      if (index === -1) {
        array.push(value);
      } else {
        array.splice(index, 1);
      }
    }
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: [],
      contentType: [],
      region: [],
      cropType: [],
      date: 'all'
    });
    performSearch();
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setCurrentPage(newPage);
  };
  
  // Update search when filters or page changes
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      performSearch();
    } else if (searchQuery || 
        filters.category.length || 
        filters.contentType.length || 
        filters.region.length || 
        filters.cropType.length || 
        filters.date !== 'all') {
      performSearch();
    }
  }, [filters, currentPage, initialLoad, performSearch, searchQuery]);
  
  // Initial search on component mount
  useEffect(() => {
    if (initialQuery || 
        initialCategories.length || 
        initialContentTypes.length || 
        initialRegions.length || 
        initialCropTypes.length || 
        initialDate !== 'all') {
      performSearch();
    }
  }, [initialQuery, initialCategories.length, initialContentTypes.length, initialRegions.length, initialCropTypes.length, initialDate, performSearch]);
  
  // Function to highlight text with search query
  const highlightText = (text: string, highlight?: string): React.ReactNode => {
    if (!highlight || !text) return text;
    
    // If we have a pre-highlighted text from the API, use it
    if (highlight.includes('<em>') && highlight.includes('</em>')) {
      return (
        <span dangerouslySetInnerHTML={{ 
                          __html: highlight.replace(/<em>/g, '<mark class="bg-green-100 px-0.5 rounded">').replace(/<\/em>/g, '</mark>') 
        }} />
      );
    }
    
    // Otherwise, do client-side highlighting
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
                              ? <mark key={i} className="bg-green-100 px-0.5 rounded">{part}</mark> 
            : part
        )}
      </>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Knowledge Hub Search</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <div className="flex">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search for agricultural knowledge..."
                className="w-full px-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              
              {/* Search suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-b-lg shadow-lg mt-1">
                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {highlightText(suggestion, searchQuery)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-r-lg hover:bg-green-700 flex items-center"
            >
              <Search className="mr-2" size={18} />
              Search
            </button>
          </div>
        </div>
      </form>

      {showFilters && (
        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {facets.categories.map((category) => (
                  <label key={category.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category.value)}
                      onChange={() => handleFilterChange('category', category.value)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    {category.value} ({category.count})
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Content Type</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {facets.contentTypes.map((type) => (
                  <label key={type.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.contentType.includes(type.value)}
                      onChange={() => handleFilterChange('contentType', type.value)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    {getContentTypeLabel(type.value)} ({type.count})
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Region</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {facets.regions.map((region) => (
                  <label key={region.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.region.includes(region.value)}
                      onChange={() => handleFilterChange('region', region.value)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    {region.value} ({region.count})
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Crop Type</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {facets.cropTypes.map((crop) => (
                  <label key={crop.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.cropType.includes(crop.value)}
                      onChange={() => handleFilterChange('cropType', crop.value)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    {crop.value} ({crop.count})
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Time Period</h3>
              <select
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full rounded-lg border p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-label="Time Period Filter"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="this-year">This Year</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Search results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-green-600" size={32} />
          <span className="ml-2">Searching...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="mt-8">
          <div className="mb-4 text-gray-600">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </div>
          
          <div className="space-y-6">
            {searchResults.map((result) => (
              <div key={result.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <Link href={result.url} className="flex gap-4">
                  {result.image && (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={result.image}
                        alt={result.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {result.highlights?.title 
                            ? <span dangerouslySetInnerHTML={{ 
                                __html: result.highlights.title.replace(/<em>/g, '<mark class="bg-green-100 px-0.5 rounded">').replace(/<\/em>/g, '</mark>') 
                              }} />
                            : result.title
                          }
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {getContentTypeLabel(result.contentType)} • {result.category}
                          {result.publishedAt && ` • ${new Date(result.publishedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span className="text-green-600 text-sm">View →</span>
                    </div>
                    <p className="mt-2 text-gray-700 line-clamp-2">
                      {result.highlights?.description 
                        ? <span dangerouslySetInnerHTML={{ 
                            __html: result.highlights.description.replace(/<em>/g, '<mark class="bg-green-100 px-0.5 rounded">').replace(/<\/em>/g, '</mark>') 
                          }} />
                        : result.highlights?.excerpt
                        ? <span dangerouslySetInnerHTML={{ 
                            __html: result.highlights.excerpt.replace(/<em>/g, '<mark class="bg-green-100 px-0.5 rounded">').replace(/<\/em>/g, '</mark>') 
                          }} />
                        : result.highlights?.summary
                        ? <span dangerouslySetInnerHTML={{ 
                            __html: result.highlights.summary.replace(/<em>/g, '<mark class="bg-green-100 px-0.5 rounded">').replace(/<\/em>/g, '</mark>') 
                          }} />
                        : result.description || result.excerpt || result.summary || ''
                      }
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Related content section */}
          {relatedContent.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Related Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedContent.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <Link href={item.url} className="flex gap-3">
                      {item.image && (
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {getContentTypeLabel(item.contentType)} • {item.category}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum
                        ? 'bg-green-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : searchQuery || 
          filters.category.length || 
          filters.contentType.length || 
          filters.region.length || 
          filters.cropType.length || 
          filters.date !== 'all' ? (
        <div className="text-center py-12 text-gray-500">
          No results found. Try adjusting your search or filters.
        </div>
      ) : null}
    </div>
  );
}
