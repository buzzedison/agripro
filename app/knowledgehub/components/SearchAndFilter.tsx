import { useState } from 'react';
import {
  Search,
  FileText,
  BookOpenCheck,
  Newspaper,
  Award,
  Users,
  Settings2 // Replaced Filter icon
} from 'lucide-react';

type FilterOption = {
  category: string[];
  contentType: string[];
  date: string;
};

const contentTypeIcons: { [key: string]: React.ElementType } = {
  'Articles': FileText,
  'Best Practices': Award,
  'Whitepapers': Newspaper,
  'Research Papers': BookOpenCheck,
  'Expert Insights': Users,
};

export default function SearchAndFilter({ 
  onSearch, 
  onFilter 
}: { 
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOption) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOption>({
    category: [], // Kept in state for potential future use, but UI removed for now
    contentType: [],
    date: 'all' // Kept in state for potential future use, but UI removed for now
  });

  // const categories = ['Agriculture', 'Technology', 'Sustainability', 'Business', 'Innovation']; // UI Removed
  const contentTypes = ['Articles', 'Best Practices', 'Whitepapers', 'Research Papers', 'Expert Insights'];
  // const dateOptions = ['all', 'today', 'this-week', 'this-month', 'this-year']; // UI Removed

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (type: keyof FilterOption, value: string) => {
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
    onFilter(newFilters);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-8">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="flex-1 relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets or start creating..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none text-base autocomplete-off"
            autoComplete="off"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        {/* The camera icon from the image is not implemented as its function is unclear in this context */}
      </form>

      <div className="flex flex-wrap gap-2 items-center">
        {contentTypes.map((type) => {
          const IconComponent = contentTypeIcons[type] || Settings2; // Fallback icon
          const isSelected = filters.contentType.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleFilterChange('contentType', type)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors
                          ${isSelected 
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
            >
              <IconComponent size={16} />
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}