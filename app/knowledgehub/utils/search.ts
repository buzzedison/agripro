type FilterOption = {
  category: string[];
  contentType: string[];
  date: string;
};

export function filterAndSearchContent<T extends { 
  title: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  category?: string;
  contentType?: string;
  publishedAt?: string;
}>(
  content: T[],
  searchQuery: string,
  filters: FilterOption
): T[] {
  return content.filter((item) => {
    // Search query filter
    if (searchQuery) {
      const searchText = `${item.title} ${item.description || ''} ${item.excerpt || ''} ${item.summary || ''}`.toLowerCase();
      if (!searchText.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    // Category filter
    if (filters.category.length > 0 && item.category) {
      if (!filters.category.includes(item.category)) {
        return false;
      }
    }

    // Content type filter
    if (filters.contentType.length > 0 && item.contentType) {
      if (!filters.contentType.includes(item.contentType)) {
        return false;
      }
    }

    // Date filter
    if (filters.date !== 'all' && item.publishedAt) {
      const publishDate = new Date(item.publishedAt);
      const now = new Date();
      
      switch (filters.date) {
        case 'today':
          if (!isSameDay(publishDate, now)) return false;
          break;
        case 'this-week':
          if (!isThisWeek(publishDate, now)) return false;
          break;
        case 'this-month':
          if (!isThisMonth(publishDate, now)) return false;
          break;
        case 'this-year':
          if (!isThisYear(publishDate, now)) return false;
          break;
      }
    }

    return true;
  });
}

// Helper functions for date filtering
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isThisWeek(date: Date, now: Date): boolean {
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return date >= weekStart && date <= weekEnd;
}

function isThisMonth(date: Date, now: Date): boolean {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function isThisYear(date: Date, now: Date): boolean {
  return date.getFullYear() === now.getFullYear();
} 