'use client';

import { useState } from 'react';
import { searchWebsiteContent, WebsiteContent, websiteContent } from './websiteContent';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isAIResponse?: boolean;
}

// Sample agricultural knowledge base for demonstration
const knowledgeBase = {
  crops: [
    { name: 'Maize', regions: ['East Africa', 'West Africa'], drought_resistant: false },
    { name: 'Sorghum', regions: ['East Africa', 'Southern Africa'], drought_resistant: true },
    { name: 'Cassava', regions: ['West Africa', 'Central Africa'], drought_resistant: true },
    { name: 'Rice', regions: ['West Africa', 'East Africa'], drought_resistant: false },
    { name: 'Millet', regions: ['Sahel', 'East Africa'], drought_resistant: true },
  ],
  funding: [
    { name: 'African Development Bank (AfDB)', type: 'Loans and Grants', focus: 'Large-scale agriculture' },
    { name: 'Acumen Fund', type: 'Impact Investment', focus: 'Small-scale farmers' },
    { name: 'Alliance for a Green Revolution in Africa (AGRA)', type: 'Grants', focus: 'Smallholder farmers' },
  ],
  resources: [
    { title: 'Sustainable Farming Practices', type: 'Best Practice', path: '/knowledgehub/practices/sustainable-farming' },
    { title: 'Organic Certification Guide', type: 'Whitepaper', path: '/knowledgehub/whitepapers/climate-resilience' },
    { title: 'Water Conservation Techniques', type: 'Best Practice', path: '/knowledgehub#best-practices' },
  ]
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true); // Toggle between AI and rule-based responses

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response: string;
      
      if (useAI) {
        // Call the API route that uses Gemini
        const result = await fetch('/api/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            messages: messages, // Send conversation history for context
          }),
        });

        if (!result.ok) {
          throw new Error(`API responded with status: ${result.status}`);
        }

        const data = await result.json();
        response = data.response;
        
        // Add assistant message with AI response
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response, isAIResponse: data.isAIResponse }
        ]);
      } else {
        // Use rule-based response generation
        response = await generateResponse(content);
        
        // Add assistant message with rule-based response
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response, isAIResponse: false }
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: "I'm sorry, I encountered an error processing your request. Please try again later or ask a different question.", 
          isAIResponse: false 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between AI and rule-based responses
  const toggleAIMode = () => {
    setUseAI(prev => !prev);
  };

  return { messages, sendMessage, isLoading, useAI, toggleAIMode };
}

// Enhanced response generator that uses website content
async function generateResponse(message: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lowerMessage = message.toLowerCase();
  
  // First, search website content for relevant information
  const relevantContent = searchWebsiteContent(message);
  
  // If we found relevant website content, use it to enhance our response
  if (relevantContent.length > 0) {
    return generateWebsiteContentResponse(relevantContent, lowerMessage);
  }
  
  // Check for specific section inquiries that might not be caught by the content search
  if (lowerMessage.includes('green market') || lowerMessage.includes('marketplace') || lowerMessage.includes('buy') || lowerMessage.includes('sell') || lowerMessage.includes('product')) {
    const marketContent = findSectionContent('green market');
    if (marketContent.length > 0) {
      return generateWebsiteContentResponse(marketContent, 'green market');
    }
  }
  
  if (lowerMessage.includes('club') || lowerMessage.includes('community') || lowerMessage.includes('member') || lowerMessage.includes('network')) {
    const clubContent = findSectionContent('clubs');
    if (clubContent.length > 0) {
      return generateWebsiteContentResponse(clubContent, 'clubs');
    }
  }
  
  if (lowerMessage.includes('farm forward') || lowerMessage.includes('program') || lowerMessage.includes('initiative') || lowerMessage.includes('support')) {
    const programContent = findSectionContent('farm forward');
    if (programContent.length > 0) {
      return generateWebsiteContentResponse(programContent, 'farm forward');
    }
  }
  
  if (lowerMessage.includes('tech') || lowerMessage.includes('technology') || lowerMessage.includes('digital') || lowerMessage.includes('innovation') || lowerMessage.includes('sensor')) {
    const techContent = findSectionContent('agritech');
    if (techContent.length > 0) {
      return generateWebsiteContentResponse(techContent, 'agritech');
    }
  }
  
  // If the user is asking about sections or navigation
  if (lowerMessage.includes('section') || lowerMessage.includes('part') || lowerMessage.includes('area') || lowerMessage.includes('what can you tell me about')) {
    // Extract potential section names
    const sections = ['knowledge hub', 'green market', 'clubs', 'farm forward', 'agritech'];
    
    for (const section of sections) {
      if (lowerMessage.includes(section)) {
        const sectionContent = findSectionContent(section);
        if (sectionContent.length > 0) {
          return generateWebsiteContentResponse(sectionContent, section);
        }
      }
    }
  }
  
  // Check for crop-related questions
  if (lowerMessage.includes('crop') || lowerMessage.includes('grow') || lowerMessage.includes('plant')) {
    // First try to find specific crop content from the website
    const cropKeywords = [
      'maize', 'corn', 'sorghum', 'cassava', 'rice', 'millet', 'wheat', 
      'beans', 'cowpea', 'groundnut', 'peanut', 'coffee', 'cocoa', 'tea', 
      'cotton', 'vegetable', 'fruit', 'teff', 'fonio'
    ];
    
    // Check if the user is asking about a specific crop
    const mentionedCrops = cropKeywords.filter(crop => lowerMessage.includes(crop));
    
    if (mentionedCrops.length > 0) {
      // Search for content related to the specific crop(s)
      const cropContent = websiteContent.filter(item => 
        mentionedCrops.some(crop => 
          item.content.toLowerCase().includes(crop) || 
          item.tags.some(tag => tag.includes(crop))
        )
      );
      
      if (cropContent.length > 0) {
        return generateWebsiteContentResponse(cropContent, mentionedCrops.join(' '));
      }
    }
    
    // Check for specific crop categories
    if (lowerMessage.includes('drought') || lowerMessage.includes('dry') || lowerMessage.includes('arid')) {
      const droughtContent = websiteContent.filter(item => 
        item.content.toLowerCase().includes('drought') || 
        item.tags.some(tag => ['drought', 'resistant', 'arid'].includes(tag))
      );
      
      if (droughtContent.length > 0) {
        return generateWebsiteContentResponse(droughtContent, 'drought resistant crops');
      }
      
      // Fall back to knowledge base if no website content
      const droughtResistantCrops = knowledgeBase.crops
        .filter(crop => crop.drought_resistant)
        .map(crop => crop.name)
        .join(', ');
      
      return `For dry regions, I recommend drought-resistant crops such as ${droughtResistantCrops}. These crops require less water and can withstand periods of drought. Would you like specific information about any of these crops?`;
    }
    
    if (lowerMessage.includes('cash') || lowerMessage.includes('export') || lowerMessage.includes('market') || lowerMessage.includes('sell')) {
      const cashCropContent = websiteContent.filter(item => 
        item.content.toLowerCase().includes('cash crop') || 
        item.tags.some(tag => ['cash crops', 'export', 'market'].includes(tag))
      );
      
      if (cashCropContent.length > 0) {
        return generateWebsiteContentResponse(cashCropContent, 'cash crops');
      }
    }
    
    if (lowerMessage.includes('indigenous') || lowerMessage.includes('traditional') || lowerMessage.includes('native')) {
      const indigenousContent = websiteContent.filter(item => 
        item.content.toLowerCase().includes('indigenous') || 
        item.tags.some(tag => ['indigenous', 'traditional'].includes(tag))
      );
      
      if (indigenousContent.length > 0) {
        return generateWebsiteContentResponse(indigenousContent, 'indigenous crops');
      }
    }
    
    if (lowerMessage.includes('rotation') || lowerMessage.includes('rotate')) {
      const rotationContent = websiteContent.filter(item => 
        item.content.toLowerCase().includes('rotation') || 
        item.tags.some(tag => tag.includes('rotation'))
      );
      
      if (rotationContent.length > 0) {
        return generateWebsiteContentResponse(rotationContent, 'crop rotation');
      }
    }
    
    // If no specific crop category is mentioned, search for general crop content
    const generalCropContent = websiteContent.filter(item => 
      item.content.toLowerCase().includes('crop') || 
      item.tags.some(tag => tag.includes('crop'))
    );
    
    if (generalCropContent.length > 0) {
      return generateWebsiteContentResponse(generalCropContent, 'crops');
    }
    
    // Fall back to knowledge base if no website content matches
    return `Some common crops grown in Africa include ${knowledgeBase.crops.map(c => c.name).join(', ')}. Each is suited to different regions and growing conditions. What specific information are you looking for?`;
  }
  
  // Check for funding-related questions
  if (lowerMessage.includes('fund') || lowerMessage.includes('money') || lowerMessage.includes('invest') || lowerMessage.includes('loan') || lowerMessage.includes('grant')) {
    const fundingSources = knowledgeBase.funding
      .map(f => `${f.name} (${f.type}) - focuses on ${f.focus}`)
      .join('\n• ');
    
    return `Here are some funding sources for agricultural projects in Africa:\n\n• ${fundingSources}\n\nI recommend checking our Knowledge Hub's Business & Funding Support section for more detailed information and application guides.`;
  }
  
  // Check for resource-related questions
  if (lowerMessage.includes('resource') || lowerMessage.includes('sustainable') || lowerMessage.includes('practice') || lowerMessage.includes('learn')) {
    const resources = knowledgeBase.resources
      .map(r => `[${r.title}](${r.path}) (${r.type})`)
      .join('\n• ');
    
    return `Here are some resources on sustainable farming practices:\n\n• ${resources}\n\nYou can find more resources in our Knowledge Hub. Would you like me to help you navigate to a specific section?`;
  }
  
  // Navigation assistance
  if (lowerMessage.includes('navigate') || lowerMessage.includes('find') || lowerMessage.includes('where') || lowerMessage.includes('how to')) {
    return `The AgriPro platform is organized into several sections:\n\n• **Knowledge Hub** - Best practices, whitepapers, expert insights, and latest news\n• **Green Market** - Buy and sell agricultural products directly\n• **Clubs** - Join communities of agricultural professionals\n• **Farm Forward** - Support program for small-scale farmers\n• **AgriTech Solutions** - Technology for modern African agriculture\n\nWhich section would you like to explore?`;
  }
  
  // Default response
  return `I'm your AgriPro Assistant. I can help you find information about all parts of our platform including:\n\n• Knowledge Hub (best practices, research)\n• Green Market (buying and selling)\n• Clubs (networking and events)\n• Farm Forward program\n• AgriTech solutions\n\nWhat would you like to know about?`;
}

// Helper function to find content from specific sections
function findSectionContent(section: string): WebsiteContent[] {
  // Map common section names to their path prefixes
  const sectionPaths: Record<string, string[]> = {
    'knowledge hub': ['/knowledgehub'],
    'green market': ['/greenmarket'],
    'clubs': ['/clubs'],
    'farm forward': ['/farm-forward'],
    'agritech': ['/services'],
    'services': ['/services']
  };
  
  const paths = sectionPaths[section.toLowerCase()];
  if (!paths) return [];
  
  return websiteContent.filter(item => 
    paths.some(path => item.path.startsWith(path))
  );
}

// Helper function to generate responses based on website content
function generateWebsiteContentResponse(content: WebsiteContent[], query: string): string {
  // If we have multiple matches, provide a summary with links
  if (content.length > 1) {
    // Group content by type for better organization
    const groupedByType: Record<string, WebsiteContent[]> = {};
    
    content.forEach(item => {
      if (!groupedByType[item.type]) {
        groupedByType[item.type] = [];
      }
      groupedByType[item.type].push(item);
    });
    
    let response = `I found several relevant resources about "${query}" on our website:\n\n`;
    
    // Add content organized by type
    Object.entries(groupedByType).forEach(([type, items]) => {
      const typeTitle = type.charAt(0).toUpperCase() + type.slice(1) + 's';
      response += `**${typeTitle}**\n`;
      
      items.slice(0, 3).forEach(item => {
        response += `• [${item.title}](${item.path}) - ${item.content.substring(0, 80)}...\n`;
      });
      
      if (items.length > 3) {
        response += `• And ${items.length - 3} more ${type}s...\n`;
      }
      
      response += '\n';
    });
    
    // Add a helpful prompt based on the query
    if (query.includes('green market') || query.includes('marketplace')) {
      response += 'Would you like to know more about buying or selling on Green Market?';
    } else if (query.includes('club') || query.includes('community')) {
      response += 'Would you like to know more about joining a club or upcoming events?';
    } else if (query.includes('farm forward') || query.includes('program')) {
      response += 'Would you like to know more about applying to the Farm Forward program?';
    } else if (query.includes('tech') || query.includes('technology')) {
      response += 'Would you like to know more about specific AgriTech solutions?';
    } else {
      response += 'Would you like more specific information about any of these topics?';
    }
    
    return response;
  }
  
  // If we have just one match, provide a more detailed response
  const item = content[0];
  
  let response = `Based on information from our website:\n\n**${item.title}**\n\n${item.content}\n\n`;
  
  // Add a link to the full content
  response += `You can [read more about ${item.title} here](${item.path}).`;
  
  // Add some contextual information based on content type
  switch (item.type) {
    case 'practice':
      response += `\n\nThis is one of our recommended best practices. Would you like to explore more farming techniques?`;
      break;
    case 'whitepaper':
      response += `\n\nThis information comes from one of our research whitepapers. Would you like to see more in-depth research on agricultural topics?`;
      break;
    case 'expert':
      response += `\n\nThis insight comes from one of our agricultural experts. Would you like to connect with more specialists in this field?`;
      break;
    case 'market':
      response += `\n\nThis information is about our Green Market platform. Would you like to learn more about buying or selling agricultural products?`;
      break;
    case 'club':
      response += `\n\nThis information is about our AgriPro Clubs. Would you like to learn more about joining or participating in club activities?`;
      break;
    case 'program':
      response += `\n\nThis information is about our Farm Forward program. Would you like to learn more about how to apply or the benefits of participation?`;
      break;
  }
  
  return response;
}
