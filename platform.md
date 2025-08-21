# AgriPro Platform Development

## Knowledge Hub

The Knowledge Hub is Africa's leading platform for agribusiness knowledge, insights, and best practices. It provides resources for farmers, agribusiness owners, and agricultural researchers across Africa.

### Components

1. **Best Practices**
   - Curated agricultural techniques and methods
   - Categorized by crop type, region, and farming system
   - Includes implementation guides and success stories

2. **Whitepapers**
   - In-depth research and analysis on key agricultural topics
   - Market trends, technologies, policies, and opportunities
   - Downloadable PDF format with citations

3. **Expert Insights**
   - Profiles of leading agricultural experts across Africa
   - Specialized knowledge in crop management, livestock, technology
   - Contact information for consultation opportunities

4. **Insights**
   - Latest news, trends, and analysis in African agriculture
   - Market developments, policy changes, and innovations
   - Regular updates with featured content

### Technical Implementation

#### Frontend
- Next.js 14.2.5 with App Router
- Client-side components for interactive features
- Responsive design with Tailwind CSS
- Framer Motion for animations

#### Content Management
- Sanity.io for structured content
- Type-safe content schemas
- Image optimization and CDN delivery

#### Database
- Supabase for user data and analytics
- PostgreSQL with row-level security
- Real-time subscriptions for dynamic content

## AI Chatbot Integration

The Knowledge Hub includes an AI-powered chatbot that helps users find information and navigate the platform.

### Current Implementation
- Client-side React component with dialog interface
- Accessibility features (ARIA attributes, keyboard navigation)
- Loading states and visual feedback
- Markdown support with clickable links to resources
- Seamless navigation integration with Next.js router
- Google Gemini AI integration for intelligent responses
- Web search capabilities for external agribusiness information
- Fallback to rule-based responses when AI is unavailable
- Clear UI indicators for AI vs. rule-based responses
- External links open in new tabs while internal links use Next.js routing
- Special styling for AgriPro content links for better visibility

### Technical Architecture
- Server-side API route for secure credential management
- Google Gemini 1.5 Flash model for fast, accurate responses
- Free web search implementation using DuckDuckGo and Wikipedia
- Optional paid search APIs (SerpAPI/Google Custom Search) for premium results
- Context-aware prompting with relevant website content
- Conversation history tracking for coherent interactions
- Error handling with graceful degradation
- Axios for external API requests
- Cheerio for HTML parsing in free web search implementation

### AI Integration Journey
#### Phase 1: Rule-Based System (Initial Implementation)
- Simple pattern matching for common questions
- Predefined responses for key topics
- Website content integration for basic context
- Limited conversation capabilities

#### Phase 2: DeepSeek AI (January 2025)
- Integration with DeepSeek API using OpenAI-compatible client
- System prompts with website content context
- Conversation history tracking
- Fallback to rule-based responses
- Error handling for API limitations

#### Phase 3: Google Gemini AI (February 2025)
- Migration from DeepSeek to Google's Gemini 1.5 Flash model
- Enhanced context-aware prompting
- Web search integration for external information
- Source citation with links to external resources
- Improved conversation capabilities
- More efficient API usage and cost management

#### Phase 4: Advanced Features (Planned)
- Multi-modal capabilities (image, audio processing)
- Integration with AgriPro database for personalized insights
- Predictive responses based on seasonal agricultural needs
- Regional specialization for different African agricultural zones
- Collaborative filtering for content recommendations

### Implementation Details

#### File Structure
```
/app
  /api
    /chatbot
      /route.ts         # Main API endpoint for chatbot
      /websiteUtils.ts  # Website content search utilities
      /webSearch.ts     # Paid web search functionality (optional)
      /freeWebSearch.ts # Free web search implementation
      /README.md        # Documentation for API implementation
  /knowledgehub
    /components
      /chatbot
        /ChatbotDialog.tsx  # Main chatbot UI component
        /useChat.ts         # Custom hook for chat state management
        /geminiClient.ts    # Client for Gemini AI API
        /README.md          # Documentation for chatbot component
```

#### Key Technologies
- **Google Generative AI SDK**: For Gemini model integration
- **Axios**: For external API requests
- **Cheerio**: For HTML parsing in web search
- **Next.js API Routes**: For server-side processing
- **React Hooks**: For state management
- **TypeScript**: For type safety
- **SerpAPI/Google Custom Search**: For optional premium web search
- **DuckDuckGo/Wikipedia**: For free web search capabilities

#### Environment Configuration
Required environment variables:
```
# Gemini API Key - Required for AI responses
GEMINI_API_KEY=your_gemini_api_key_here

# OPTIONAL: Paid Web Search APIs
# The chatbot will work without these keys, using free alternatives instead

# SerpAPI Key - Optional for premium web search
SERPAPI_KEY=your_serpapi_key_here

# Alternative: Google Custom Search API - Optional
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### Enhanced Features (February 2025)
- Website content integration for comprehensive information access
- Content indexing across ALL platform sections:
  - Knowledge Hub (Best Practices, Experts, Whitepapers, Insights)
  - Green Market (marketplace, buying, selling, logistics)
  - AgriPro Clubs (membership, events, leadership)
  - Farm Forward Program (application, success stories)
  - AgriTech Solutions (sensors, farm management software)
- Contextual answers based on content type
- Smart linking to relevant resources with correct routing
- Web search capabilities for up-to-date external information
  - Free implementation using DuckDuckGo and Wikipedia
  - Optional premium search with SerpAPI or Google Custom Search
- External links open in new tabs for better user experience
- Internal AgriPro links styled distinctively and use Next.js routing
- Source citation with links to external resources
- Toggle between AI-powered and rule-based responses

### Future Roadmap
- Personalized responses based on user history
- Multi-language support for pan-African reach
- Voice input/output capabilities
- Integration with Farm Forward program data
- Advanced analytics on user questions and interactions
- Expanded knowledge base with regular content updates

## UI/UX Improvements

### Layout and Navigation
- Conditional rendering of main site components
- Knowledge Hub-specific navigation
- Improved visual hierarchy and content organization
- Mobile-optimized interface

### Visual Design
- Consistent color scheme (green primary palette)
- Card-based content presentation
- Text truncation for cleaner layout
- Hover effects and subtle animations
- Gradient backgrounds for visual interest

### Search and Filtering
- Type-safe filtering implementation
- Excerpt generation for descriptions
- Multi-criteria search capabilities
- Real-time results updating

## AgriPro Knowledge Hub – Feature Specification

AgriPro Knowledge Hub is a dynamic, AI-powered platform where farmers, agribusinesses, researchers, and policymakers collaborate, share insights, and access actionable, data-driven resources.

### Currently Implemented Features

1. **Content Management System (CMS)**
   - Sanity.io integration for structured content
   - Multiple content types (Best Practices, Whitepapers, Expert Insights, Latest News)
   - Image optimization and CDN delivery
   - Type-safe content schemas

2. **Search & Filtering**
   - Advanced search functionality across all content types
   - Filtering by category, content type, and date
   - Real-time results updating
   - Type-safe filtering implementation

3. **AI Chatbot**
   - Client-side React component with dialog interface
   - Content indexing across ALL platform sections
   - Contextual answers based on content type
   - Smart linking to relevant resources
   - Web search capabilities with free and premium options
   - External links open in new tabs, internal links use Next.js routing
   - Distinctive styling for AgriPro content links
   - AI-powered responses with Google Gemini integration
   - Fallback to rule-based responses when needed

4. **Community Features**
   - AgriPro Clubs with membership options
   - Events and networking opportunities
   - Club leadership structure

5. **Marketplace**
   - Green Market digital marketplace
   - Buying and selling functionality
   - Logistics solutions

### Roadmap for Future Implementation

1. **Enhanced Content Management System (CMS)**
   - Modular Content Types: Additional templates for checklists, case studies, video series, and community threads
   - Version Control: Track updates, edits, and user-suggested improvements
   - AI-Assisted Content Creation: Auto-generate summaries, keyword tagging, and language translation
   - Multi-Format Uploads: Support for videos, PDFs, interactive tools (ROI calculators), and voice notes
   - User-Generated Content (UGC): Farmer and expert submission system with peer review

2. **AI-Powered Search & Personalization**
   - AI-driven Recommendations: Suggest resources based on user behavior
   - Conversational AI Chatbot: Integration with OpenAI or similar service
   - Personalized responses based on user history
   - Multi-language support for pan-African reach

3. **Community & Collaboration**
   - Discussion Forums: Thematic discussions on agricultural topics
   - Voting & Validation System: Upvoting helpful content and flagging misinformation
   - Gamification & Leaderboards: Badges for top contributors and frequent engagement
   - Expert Q&A & AMA (Ask Me Anything): Live sessions with industry leaders

4. **Data-Driven Market Intelligence**
   - Live Commodity Price Dashboard: Regional price tracking for major crops
   - Trend Analysis & AI Predictions: Supply-demand dynamics, fertilizer costs, and trade patterns
   - Real-time Weather & Climate Alerts: Integration with weather APIs

5. **Business & Funding Support**
   - Investor Matchmaking: Connecting agripreneurs with impact investors
   - Grant & Loan Finder: AI suggestions for funding opportunities
   - ROI Calculators: Tools for evaluating agricultural investments

6. **AgriTech & Innovation Hub**
   - AgriTech Solutions section (partially implemented)
   - AgriTech Marketplace: Discover and compare smart sensors, drones, and farm automation tools
   - IoT & Blockchain Integration: Supply chain tracking and product authenticity
   - Tech Experimentation Forum: Share success and failures in precision farming

7. **Policy & Compliance Navigator**
   - Global & Local Regulations Hub: Interactive guides for export requirements and certification
   - Crowdsourced Compliance Updates: User reports of regulatory changes
   - Policy Advocacy Forum: Discussion space for policymakers and farmers

8. **AI-Driven Learning & Training**
   - Adaptive Learning Paths: Personalized courses based on user needs
   - Webinars & Video Series: Featuring industry experts and pioneers
   - Microlearning Modules: Short clips covering essential agricultural topics

9. **API & Integration Capabilities**
   - Agricultural Data APIs: Integration with USDA, FAO, weather services
   - Social Media Integration: Auto-share key insights to social platforms
   - Mobile & SMS Support: Farmers receive AI-generated insights via SMS

### MVP Scope for AI Agent
- Launch Content & CMS (Implemented with Sanity.io)
- Community Engagement (Implemented with AgriPro Clubs)
- AI Chatbot & Personalization (Basic implementation complete)
- Market Intelligence Dashboard (Planned)
- Investor & Business Support (Planned)

## Development Workflow

### Local Development
- Next.js development server
- Hot module replacement
- Component isolation for testing
- Responsive design testing

### Deployment
- Vercel for production hosting
- Preview deployments for pull requests
- Analytics integration
- Performance monitoring

## Next Steps

1. **Content Expansion**
   - Increase best practices library
   - Add more expert profiles
   - Develop region-specific content
   - Create interactive content formats (checklists, case studies)

2. **Advanced Search**
   - Implement full-text search
   - Add faceted filtering
   - Integrate with AI chatbot for natural language queries
   - Add search analytics to improve results

3. **User Accounts**
   - Personalized content recommendations
   - Saved resources and favorites
   - Progress tracking for courses
   - User-specific chatbot history and preferences

4. **Community Features**
   - Discussion forums for agricultural topics
   - Expert Q&A sessions with scheduling
   - User-generated content submission and moderation
   - Voting system for helpful content

5. **Analytics Dashboard**
   - Content popularity metrics
   - User engagement tracking
   - Search query analysis
   - Chatbot interaction metrics and common questions

6. **Data-Driven Market Intelligence**
   - Live commodity price dashboard
   - Regional price tracking for major crops
   - Weather and climate alerts integration
   - Trend analysis and predictions

7. **Multi-Modal Chatbot Capabilities**
   - Image recognition for plant diseases and pests
   - Voice input/output for accessibility
   - Support for regional African languages
   - Integration with SMS for farmers with limited internet access
