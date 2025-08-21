// Server-side version of website content utilities
// This file is completely self-contained and doesn't import from client components

export interface WebsiteContent {
  path: string;
  title: string;
  content: string;
  type: 'page' | 'article' | 'practice' | 'whitepaper' | 'expert' | 'market' | 'club' | 'program';
  tags: string[];
}

// Server-side copy of website content
const websiteContentServer: WebsiteContent[] = [
  // Knowledge Hub
  {
    path: '/knowledgehub',
    title: 'Knowledge Hub',
    content: 'Africa\'s leading platform for agribusiness knowledge, insights, and best practices. The Knowledge Hub provides resources for farmers, agribusiness owners, and agricultural researchers across Africa.',
    type: 'page',
    tags: ['overview', 'knowledge', 'hub', 'agribusiness']
  },
  {
    path: '/knowledgehub#best-practices',
    title: 'Best Practices',
    content: 'Discover proven agricultural techniques and methods that have been successful across Africa. Our best practices are curated by experts and practitioners with deep experience in African agriculture.',
    type: 'page',
    tags: ['practices', 'techniques', 'methods', 'farming']
  },
  {
    path: '/knowledgehub#expert-insights',
    title: 'Expert Insights',
    content: 'Learn from leading agricultural experts across Africa. Our experts provide insights on crop management, livestock, agricultural technology, market access, and more.',
    type: 'page',
    tags: ['experts', 'insights', 'advice', 'specialists']
  },
  {
    path: '/knowledgehub#whitepapers',
    title: 'Whitepapers',
    content: 'In-depth research and analysis on key agricultural topics. Our whitepapers provide comprehensive information on market trends, technologies, policies, and opportunities in African agriculture.',
    type: 'page',
    tags: ['whitepapers', 'research', 'analysis', 'reports']
  },
  {
    path: '/knowledgehub#insights',
    title: 'Insights',
    content: 'Latest news, trends, and analysis in African agriculture. Stay updated with market developments, policy changes, and innovations that impact agribusiness in Africa.',
    type: 'page',
    tags: ['insights', 'news', 'trends', 'analysis']
  },
  // Farm Smart
  {
    path: '/farm-smart',
    title: 'Farm Smart',
    content: 'Farm Smart is AgriPro’s flagship initiative empowering African farmers with digital tools, tailored advice, and access to markets. The program offers step-by-step guidance, expert tips, and a supportive community to help farmers make informed decisions and boost productivity using modern, sustainable practices.',
    type: 'program',
    tags: ['program', 'farm-smart', 'digital', 'advice', 'community', 'sustainable', 'modern', 'africa']
  },
  // Green Market
  {
    path: '/greenmarket',
    title: 'Green Market',
    content: 'Africa\'s premier digital marketplace connecting farmers directly with buyers. Green Market eliminates intermediaries, reduces post-harvest losses, and ensures fair prices for agricultural products across the continent.',
    type: 'market',
    tags: ['marketplace', 'digital', 'farmers', 'buyers', 'fair-trade']
  },
  // Agricultural Practices
  {
    path: '/knowledgehub/practices/sustainable-farming',
    title: 'Sustainable Farming Practices',
    content: 'Comprehensive guide to sustainable farming methods for African conditions. Covers conservation agriculture, agroforestry, integrated pest management, and water conservation techniques adapted for various African climates and soil types.',
    type: 'practice',
    tags: ['sustainable', 'farming', 'conservation', 'practices', 'methods']
  },
  {
    path: '/knowledgehub/practices/crop-rotation',
    title: 'Crop Rotation Systems',
    content: 'Effective crop rotation strategies for African farms. Learn how to implement rotation systems that improve soil health, reduce pest pressure, and increase yields while minimizing external inputs.',
    type: 'practice',
    tags: ['crop', 'rotation', 'soil', 'health', 'yield']
  }
];

/**
 * Search website content for relevant information based on a query
 * Server-side version that doesn't use client components
 */
export function searchWebsiteContentServer(query: string): WebsiteContent[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // If the query is empty, return an empty array
  if (!normalizedQuery) {
    return [];
  }
  
  // Split the query into individual words for more flexible matching
  const queryWords = normalizedQuery.split(/\s+/);
  
  // Score each content item based on how well it matches the query
  const scoredItems = [];
  for (const item of websiteContentServer) {
    let score = 0;
    
    // Check for exact matches in title (highest priority)
    if (item.title.toLowerCase().includes(normalizedQuery)) {
      score += 10;
    }
    
    // Check for exact matches in content
    if (item.content.toLowerCase().includes(normalizedQuery)) {
      score += 5;
    }
    
    // Check for exact matches in tags
    if (item.tags.some(tag => tag.toLowerCase() === normalizedQuery)) {
      score += 8;
    }
    
    // Check for partial matches in tags
    if (item.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
      score += 4;
    }
    
    // Check for matches of individual words
    for (const word of queryWords) {
      if (word.length < 3) continue; // Skip very short words
      
      if (item.title.toLowerCase().includes(word)) {
        score += 3;
      }
      
      if (item.content.toLowerCase().includes(word)) {
        score += 2;
      }
      
      if (item.tags.some(tag => tag.toLowerCase().includes(word))) {
        score += 2;
      }
      
      // Check for type matches (e.g., if query contains "market" and item type is "market")
      if (item.type.includes(word)) {
        score += 5;
      }
    }
    
    if (score > 0) {
      scoredItems.push({ item, score });
    }
  }
  
  // Sort by score and return only the items
  return scoredItems
    .sort((a, b) => b.score - a.score)
    .map(scored => scored.item);
}
