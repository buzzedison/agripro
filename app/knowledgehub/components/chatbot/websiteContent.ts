'use client';

// This file contains content from various parts of the website
// that the chatbot can use to provide more accurate and relevant answers

export interface WebsiteContent {
  path: string;
  title: string;
  content: string;
  type: 'page' | 'article' | 'practice' | 'whitepaper' | 'expert' | 'market' | 'club' | 'program';
  tags: string[];
}

// Sample website content - in a production environment, this would be
// dynamically fetched from the CMS or generated at build time
export const websiteContent: WebsiteContent[] = [
  // Homepage
  {
    path: '/',
    title: 'Homepage',
    content: "Welcome to AgriPro, Africa's leading platform for agribusiness knowledge, insights, and best practices. Find resources, connect with experts, and explore the future of African agriculture.",
    type: 'page',
    tags: ['homepage', 'landing', 'introduction', 'welcome', 'overview']
  },
  // Newsletter CTA
  {
    path: '/newsletter',
    title: 'Newsletter',
    content: 'Subscribe to our newsletter to receive the latest insights, research papers, and industry updates directly in your inbox.',
    type: 'page',
    tags: ['newsletter', 'subscribe', 'updates', 'insights', 'email']
  },
  // Footer
  {
    path: '/footer',
    title: 'Footer',
    content: 'AgriPro footer includes links to social media, contact information, legal disclaimers, and quick navigation to key sections of the site.',
    type: 'page',
    tags: ['footer', 'contact', 'social', 'legal', 'navigation']
  },
  // Courses
  {
    path: '/knowledgehub/courses',
    title: 'Courses',
    content: 'Browse a wide range of agribusiness courses covering crop management, sustainable farming, agritech, business skills, and more. Courses are designed for all experience levels.',
    type: 'page',
    tags: ['courses', 'learning', 'education', 'training', 'skills']
  },
  // Experts
  {
    path: '/knowledgehub/experts',
    title: 'Expert Directory',
    content: 'Connect with leading agricultural experts in Africa. Our experts offer advice on crop management, technology, markets, and sustainable practices.',
    type: 'page',
    tags: ['experts', 'directory', 'advice', 'consulting', 'specialists']
  },
  // Add additional major sections as needed below

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
  
  // Farm Forward
  {
    path: '/farm-forward',
    title: 'Farm Forward Program',
    content: 'An initiative to support small-scale farmers with technology, training, and market access. Farm Forward helps farmers increase productivity, reduce waste, and improve profitability through digital tools, training workshops, and market linkages.',
    type: 'program',
    tags: ['program', 'farmers', 'support', 'technology', 'training']
  },
  {
    path: '/farm-forward#apply',
    title: 'Apply to Farm Forward',
    content: 'Join the Farm Forward program to access technology, training, and market opportunities. Eligible participants include small and medium-scale farmers, agricultural cooperatives, and early-stage agribusinesses across Africa.',
    type: 'program',
    tags: ['application', 'eligibility', 'benefits', 'process']
  },
  {
    path: '/farm-forward#success-stories',
    title: 'Farm Forward Success Stories',
    content: 'Read about farmers and agribusinesses that have transformed their operations through the Farm Forward program. These case studies showcase increased yields, improved market access, and higher incomes achieved by program participants.',
    type: 'program',
    tags: ['success', 'stories', 'testimonials', 'impact']
  },
  
  // Clubs
  {
    path: '/clubs',
    title: 'AgriPro Clubs',
    content: 'Join a community of like-minded agricultural professionals. AgriPro Clubs provide networking opportunities, knowledge sharing, and collaborative problem-solving for members. Clubs are organized by region and agricultural focus area.',
    type: 'club',
    tags: ['clubs', 'community', 'networking', 'collaboration']
  },
  {
    path: '/clubs#membership',
    title: 'Club Membership',
    content: 'Become a member of an AgriPro Club to connect with peers, access exclusive resources, and participate in events. Membership options include Basic (free), Premium ($10/month), and Enterprise (custom pricing for organizations).',
    type: 'club',
    tags: ['membership', 'benefits', 'pricing', 'join']
  },
  {
    path: '/clubs#events',
    title: 'Club Events',
    content: 'Participate in regular events organized by AgriPro Clubs, including webinars, workshops, field days, and networking meetups. Events cover topics like sustainable farming, market access, technology adoption, and policy advocacy.',
    type: 'club',
    tags: ['events', 'webinars', 'workshops', 'networking']
  },
  {
    path: '/clubs#leadership',
    title: 'Club Leadership',
    content: 'Each AgriPro Club is led by experienced agricultural professionals who volunteer their time to organize activities and facilitate knowledge sharing. Club leaders receive training and support from the AgriPro team.',
    type: 'club',
    tags: ['leadership', 'governance', 'volunteers', 'structure']
  },
  
  // Green Market
  {
    path: '/greenmarket',
    title: 'Green Market',
    content: 'Africa\'s premier digital marketplace connecting farmers directly with buyers. Green Market eliminates intermediaries, reduces post-harvest losses, and ensures fair prices for agricultural products across the continent.',
    type: 'market',
    tags: ['marketplace', 'buying', 'selling', 'trade', 'e-commerce']
  },
  {
    path: '/greenmarket#sell',
    title: 'Sell on Green Market',
    content: 'List your agricultural products on Green Market to reach thousands of potential buyers. Sellers can create detailed listings with photos, pricing, quantity, quality standards, and delivery options. Commission fee is 5% of successful sales.',
    type: 'market',
    tags: ['selling', 'listing', 'commission', 'products']
  },
  {
    path: '/greenmarket#buy',
    title: 'Buy on Green Market',
    content: 'Purchase directly from verified farmers and agricultural producers. Buyers can browse listings by product category, region, certification, and price. Secure payment system with buyer protection and quality guarantees.',
    type: 'market',
    tags: ['buying', 'purchasing', 'products', 'payment']
  },
  {
    path: '/greenmarket#logistics',
    title: 'Green Market Logistics',
    content: 'Reliable transportation and storage solutions for agricultural products. Our logistics network covers major agricultural regions in Africa, with cold chain options for perishable goods and tracking for all shipments.',
    type: 'market',
    tags: ['logistics', 'transportation', 'storage', 'delivery']
  },
  
  // AgriTech
  {
    path: '/services',
    title: 'AgriTech Solutions',
    content: 'Cutting-edge technologies for modern African agriculture. Our AgriTech solutions include IoT sensors, drone monitoring, mobile apps, and data analytics tools designed specifically for African farming conditions and challenges.',
    type: 'page',
    tags: ['technology', 'innovation', 'digital', 'solutions']
  },
  {
    path: '/services#soil-sensors',
    title: 'Soil Monitoring Sensors',
    content: 'Affordable IoT sensors that monitor soil moisture, temperature, and nutrient levels in real-time. Data is accessible via mobile app, with alerts for irrigation needs and fertilizer recommendations based on soil conditions.',
    type: 'page',
    tags: ['sensors', 'soil', 'monitoring', 'iot']
  },
  {
    path: '/services#farm-management',
    title: 'Farm Management Software',
    content: 'Comprehensive digital tools for managing all aspects of farm operations. Features include crop planning, input tracking, labor management, yield forecasting, financial records, and compliance documentation.',
    type: 'page',
    tags: ['software', 'management', 'digital', 'operations']
  },
  
  // Crop Information
  {
    path: '/knowledgehub/practices/crop-guide',
    title: 'African Crop Guide',
    content: 'Comprehensive guide to crops grown across Africa, including maize, sorghum, cassava, rice, millet, and more. Each crop profile includes optimal growing conditions, common pests and diseases, harvesting techniques, and market information.',
    type: 'practice',
    tags: ['crops', 'farming', 'agriculture', 'guide', 'maize', 'cassava', 'rice']
  },
  {
    path: '/knowledgehub/practices/drought-resistant-crops',
    title: 'Drought-Resistant Crops for African Agriculture',
    content: 'Guide to drought-resistant crops suitable for arid and semi-arid regions of Africa. Includes sorghum, millet, cowpea, and drought-tolerant maize varieties. These crops require less water and can withstand periods of drought while maintaining reasonable yields.',
    type: 'practice',
    tags: ['drought', 'resistant', 'crops', 'arid', 'sorghum', 'millet', 'cowpea']
  },
  {
    path: '/knowledgehub/practices/cash-crops',
    title: 'High-Value Cash Crops',
    content: 'Information on high-value cash crops for African farmers, including coffee, cocoa, tea, cotton, and various fruits and vegetables. Learn about market demand, export opportunities, certification requirements, and value-addition strategies.',
    type: 'practice',
    tags: ['cash crops', 'export', 'coffee', 'cocoa', 'tea', 'cotton', 'market']
  },
  {
    path: '/knowledgehub/practices/crop-rotation',
    title: 'Crop Rotation Strategies',
    content: 'Effective crop rotation strategies for African farming systems. Rotating crops helps maintain soil fertility, reduce pest and disease pressure, and optimize land use. Learn about compatible crop combinations and rotation schedules for different regions.',
    type: 'practice',
    tags: ['crop rotation', 'soil health', 'farming', 'sustainability', 'techniques']
  },
  {
    path: '/knowledgehub/practices/indigenous-crops',
    title: 'Indigenous African Crops',
    content: 'Guide to indigenous African crops with high nutritional value and climate resilience. Includes teff, fonio, bambara groundnut, African yam bean, and other traditional crops that are well-adapted to local conditions and contribute to food security.',
    type: 'practice',
    tags: ['indigenous', 'traditional', 'crops', 'nutrition', 'teff', 'fonio']
  },
  
  // Knowledge Hub Content
  {
    path: '/knowledgehub/practices/sustainable-farming',
    title: 'Sustainable Farming Practices',
    content: 'Sustainable farming practices focus on maintaining soil health, conserving water, and minimizing environmental impact while ensuring long-term productivity. Key techniques include crop rotation, cover cropping, integrated pest management, and precision farming.',
    type: 'practice',
    tags: ['sustainable', 'farming', 'soil health', 'conservation']
  },
  {
    path: '/knowledgehub/practices/irrigation-techniques',
    title: 'Efficient Irrigation Techniques',
    content: 'Water-efficient irrigation methods suitable for African agriculture include drip irrigation, micro-sprinklers, and deficit irrigation scheduling. These techniques can reduce water usage by 30-50% while maintaining or improving crop yields.',
    type: 'practice',
    tags: ['irrigation', 'water', 'efficiency', 'conservation']
  },
  {
    path: '/knowledgehub/whitepapers/climate-resilience',
    title: 'Building Climate Resilience in African Agriculture',
    content: 'This whitepaper examines strategies for adapting to climate change in African agricultural systems. It covers drought-resistant crops, water management, weather forecasting integration, and policy recommendations for supporting climate-smart agriculture.',
    type: 'whitepaper',
    tags: ['climate', 'resilience', 'adaptation', 'drought']
  },
  {
    path: '/knowledgehub#experts',
    title: 'Dr. Amara Kone - Soil Science Specialist',
    content: 'Dr. Amara Kone is a leading soil scientist with 15 years of experience in soil fertility management across West Africa. Her research focuses on sustainable soil amendments using locally available materials and has helped thousands of smallholder farmers improve crop yields.',
    type: 'expert',
    tags: ['expert', 'soil', 'fertility', 'science']
  }
];

// Function to search website content based on query
export function searchWebsiteContent(query: string): WebsiteContent[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // If the query is empty, return an empty array
  if (!normalizedQuery) {
    return [];
  }
  
  // Split the query into individual words for more flexible matching
  const queryWords = normalizedQuery.split(/\s+/);
  
  // Score each content item based on how well it matches the query
  const scoredContent = websiteContent.map(item => {
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
    
    return { item, score };
  });
  
  // Filter out items with no relevance and sort by score
  return scoredContent
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

// Function to get content by path
export function getContentByPath(path: string): WebsiteContent | undefined {
  return websiteContent.find(item => item.path === path);
}

// Function to get related content
export function getRelatedContent(tags: string[], currentPath: string, limit: number = 3): WebsiteContent[] {
  // Calculate relevance score based on matching tags
  const scoredContent = websiteContent
    .filter(item => item.path !== currentPath) // Exclude current content
    .map(item => {
      const matchingTags = item.tags.filter(tag => tags.includes(tag));
      return {
        content: item,
        score: matchingTags.length
      };
    })
    .filter(item => item.score > 0) // Only include items with at least one matching tag
    .sort((a, b) => b.score - a.score); // Sort by score (descending)
  
  // Return top N results
  return scoredContent.slice(0, limit).map(item => item.content);
}
