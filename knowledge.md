# AgriPro Knowledge Hub

## Purpose & Audience
- Provides a continent-wide knowledge exchange for farmers, agribusiness operators, researchers, and policy leaders.
- Delivers actionable guides, research, decision tools, and expert access tailored to African agricultural realities.
- Integrates closely with the wider AgriPro platform (Green Market, Clubs, Farm Forward, AgriTech Solutions) to keep knowledge contextual and actionable.

## Content Architecture
- **Structured CMS (Sanity.io)** with dedicated schemas for best practices, insights, whitepapers, research, courses, events, videos, ROI calculations, experts, authors, and contributor submissions.
- **Rich metadata** (categories, topics, regions, crop types, tags, published/updated timestamps) powering search, segmentation, and analytics.
- **Multi-format support**: long-form articles, PDF downloads, embedded media, interactive tools, calculators, and planned voice/video assets.
- **Access control hooks** for premium or members-only materials via Supabase-backed paywall logic.

## Editorial Lifecycle & Contribution Workflow
- **Contributor workspace** ( `/knowledgehub/contributors` ) for authenticated experts to create drafts, manage submissions, and monitor status.
- **Draft → Review → Approval → Publication** workflow secured through Supabase identity and Sanity write operations.
- **Schema-backed submissions** accepting structured topics, tags, attachments, and cover imagery.
- **Status management API** (`/api/knowledge-hub/contributors/status`) logs reviewer notes, links final content, and notifies authors.
- **Automated email updates** via Resend (`lib/resend/contributor.ts`) for draft saved, submitted, approved, rejected, or published milestones.
- **Expert onboarding**: multi-step application (`/knowledgehub/experts/apply`) collects credentials, specialties, availability, and compliance attestations.
- **Author directory** with profile linkage so published pieces surface author credentials and contact paths.

## Access, Membership, & Monetisation
- **Metered paywall** (two free reads) implemented through `useContentAccess`, cookies, and Supabase auth.
- **Dynamic banners & modals** (`AccessBanner`, `PaywallModal`) promote sign-up, indicate remaining views, and route readers to auth flows.
- **Persona-aware CTAs** (newsletter signup, contributor invitations, tool promotions) embedded across hero and section modules.

## Discovery & Personalisation
- **Home experience** combines hero narratives, paywall messaging, search, curated best practices, insights, whitepapers, expert cards, and research.
- **Ambient filtering** via `SearchAndFilter` (quick toggles by content type) and the full **Advanced Search** console with facets (category, type, region, crop, date), autocomplete suggestions, pagination, and related content recommendations.
- **Breadcrumbs, dedicated landing pages, and knowledge-specific navigation/footer** maintain context as readers traverse deep content.
- **AI-assisted recommendations (planned)** leveraging usage analytics, regional context, and chatbot insights for personalised content feeds.

## AI Assistant & Automation
- **AgriPro Assistant chatbot** (Gemini 1.5 Flash) embedded in `/knowledgehub/components/chatbot` with:
  - Contextual prompts seeded from website content and user journeys.
  - Free and optional premium web search (DuckDuckGo/Wikipedia or SerpAPI/Google CSE).
  - Markdown rendering, internal routing, external linking, and graceful fallbacks to rule-based replies.
  - Roadmapped multimodal, multi-language, voice, and personalised response upgrades.
- **AI creation support (planned)**: auto-summarisation, keyword tagging, translation, seasonal content prompts, and contributor drafting aids.

## Decision Tools & Data Services
- **ROI Calculator Suite** with enhanced, crop-specific, livestock, and saved-comparison workflows; supports exports, scenario planning, and persistent storage.
- **Market Analyzer & Cost Optimiser** entries surface within `ToolsSection`, guiding users to price analytics and optimisation dashboards.
- **Research & data formats**: whitepapers, research summaries, video explainers, and future dashboards (commodity prices, weather alerts, funding trackers).

## Community & Social Features
- **AgriPro Clubs** and events (schemas + platform integration) give members thematic communities and offline/online gathering points.
- **Expert Insights** highlight verified specialists, enabling consultation or AMA scheduling.
- **Roadmapped engagement suite**:
  - **Discussion forums & threaded conversations** for peer problem-solving.
  - **Polls and sentiment checks** to capture community views on policy, technology, and market shifts.
  - **Reddit-style voting & flagging** to surface valuable contributions and moderate misinformation.
  - **Gamified reputation system** with badges, leaderboards, and contributor tiers.
  - **Live Q&A and AMA events** anchored by expert panels and community moderators.

## Analytics & Administration
- **View tracking pipeline** (`ArticleViewTracker`, `/api/knowledge-hub/track-view`, Supabase tables) records article views, durations, referrers, and user context.
- **Article stats component** displays total/unique views, dwell time, and last viewed timestamp per asset.
- **Knowledge Hub Analytics dashboard** (`/admin/knowledge-hub`) with charts, filters, CSV exports, and period selectors for sign-ups, views, and engagement metrics.
- **Global admin console** ( `/admin` ) surfaces platform-wide KPIs and quick links to manage Knowledge Hub, users, and data pipelines.

## Integrations & Infrastructure
- **Tech stack**: Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Supabase (auth, database, analytics), Sanity CMS, Resend, and Google Generative AI SDK.
- **Content delivery** via Sanity CDN and Next.js image optimisation for performance across devices.
- **Schema-driven APIs** for search (`/api/search`), suggestions, contributor management, sign-up tracking, and analytics.
- **Extensible architecture** prepared for mobile clients, SMS distribution, and third-party data ingestion (USDA, FAO, weather APIs).

## Roadmap Highlights
1. **Enhanced CMS tooling**: version history, collaborative editing, templated checklists, interactive case studies, and multimedia uploads.
2. **AI-powered personalisation**: behaviour-driven recommendations, multilingual experiences, SMS/USSD summaries, and context-aware alerts.
3. **Community expansion**: launch forums, polls, voting, moderation tooling, and integration with Clubs for localised cohorts.
4. **Market intelligence dashboards**: live commodity prices, weather/climate alerts, supply-demand predictions, and investment-grade reports.
5. **Business & funding services**: investor matchmaking, grant/loan discovery, ROI calculators, and deal rooms for agribusiness ventures.
6. **Integration APIs**: partner portals, data sharing endpoints, and webhook support for agritech tools and compliance systems.

## Immediate Next Steps
1. Finalise poll, forum, and voting data models in Sanity & Supabase; wire to moderation workflows.
2. Extend contributor experience with co-editing, inline comments, and AI-assisted drafting.
3. Roll out knowledge recommendations across homepage, chatbot, and email digests.
4. Launch beta market intelligence dashboard and connect it to ROI tool insights.
5. Draft community launch playbook: seed discussion topics, define moderator guidelines, and stage initial polls to validate UX before scaling forums.
