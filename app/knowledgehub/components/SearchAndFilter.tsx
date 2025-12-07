import { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  BookOpen, // Changed from BookOpenCheck for cleaner icon
  Newspaper,
  Users,
  LayoutGrid, // For "All"
  Award
} from 'lucide-react';

type FilterOption = {
  category: string[];
  contentType: string[];
  date: string;
};

const contentTypeIcons: { [key: string]: React.ElementType } = {
  'All': LayoutGrid,
  'Articles': FileText,
  'Best Practices': Award,
  'Whitepapers': Newspaper,
  'Research Papers': BookOpen,
  'Expert Insights': Users,
};

export default function SearchAndFilter({
  onSearch,
  onFilter,
  className = ""
}: {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOption) => void;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [filters, setFilters] = useState<FilterOption>({
    category: [],
    contentType: [], // Empty means all in the parent logic, but we track UI selection
    date: 'all'
  });

  const contentTypes = ['All', 'Articles', 'Best Practices', 'Whitepapers', 'Research Papers', 'Expert Insights'];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleTypeChange = (type: string) => {
    setActiveType(type);

    // Convert UI selection to filter format
    // If 'All', send empty array to show everything
    const newContentType = type === 'All' ? [] : [type];

    const newFilters = {
      ...filters,
      contentType: newContentType
    };

    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className={`w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Filter Tabs - Scrollable on mobile */}
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2">
            {contentTypes.map((type) => {
              const IconComponent = contentTypeIcons[type] || LayoutGrid;
              const isActive = activeType === type;

              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                    ${isActive
                      ? 'bg-green-600 text-white shadow-md transform scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
                    }`}
                >
                  <IconComponent size={16} />
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 lg:w-96 flex-shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-full focus:ring-2 focus:ring-green-200 transition-all outline-none text-sm"
          />
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>
    </div>
  );
}