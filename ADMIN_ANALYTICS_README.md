# Admin and Analytics Setup Guide

This guide explains how to set up the admin user system and knowledge hub analytics for Agripro.

## Database Setup

### 1. Run the Database Schema

You need to create the necessary database tables. There are two ways to do this:

#### Option A: Manual Setup (Recommended)
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `admin_and_analytics_schema.sql`
4. Execute the SQL

#### Option B: Automated Setup
```bash
npm install dotenv
node setup-analytics-db.js
```

### 2. Tables Created

The following tables will be created:

- `admin_users` - Admin user accounts
- `knowledge_hub_signups` - Newsletter signups
- `article_views` - Individual article view tracking
- `article_analytics` - Aggregated article statistics
- `content_access` - Premium content access tracking

## Admin Setup

### 1. Admin User Created

The initial admin user is already set up in the schema:
- **Email**: edison@agriprohub.com
- **Role**: super_admin
- **Status**: Active

### 2. Admin Authentication

The middleware in `middleware.ts` automatically protects admin routes and checks for admin privileges.

## Features Implemented

### 1. Admin Dashboard

- **Location**: `/admin/knowledge-hub`
- **Features**:
  - Overview of signup and view statistics
  - Charts showing content type performance
  - Recent activity feed
  - Top performing articles
  - Data export functionality
  - Search and filtering capabilities

### 2. Knowledge Hub Signup Tracking

- **Newsletter Signup**: Updated `NewsletterCTA` component tracks signups
- **API Endpoint**: `/api/knowledge-hub/signup`
- **Data Stored**: Email, name, signup source, user ID

### 3. Article View Tracking

- **Components**:
  - `ArticleViewTracker` - Tracks views and time spent
  - `ArticleStats` - Displays view statistics
- **API Endpoints**:
  - `/api/knowledge-hub/track-view` - Records views
  - `/api/knowledge-hub/article-stats` - Retrieves stats
- **Features**:
  - Real-time view counting
  - Time spent tracking
  - Unique visitor counting
  - Average view duration

### 4. Analytics API

- **Endpoint**: `/api/admin/knowledge-hub`
- **Features**:
  - Period-based filtering (7d, 30d, 90d)
  - Comprehensive statistics
  - Chart data for visualizations
  - Recent activity tracking

## Usage Instructions

### Accessing Admin Dashboard

1. Ensure you're logged in with an admin account (edison@agriprohub.com)
2. Navigate to `/admin/knowledge-hub`
3. View analytics, export data, and manage content

### Viewing Article Statistics

Article statistics are automatically displayed on individual article pages (insights, best practices, etc.) showing:
- Total views
- Unique views
- Average time spent
- Last viewed date

### Signup Tracking

The newsletter signup form automatically tracks:
- Email address
- Name (if provided)
- Signup source
- User association (if logged in)

## Security Notes

- Admin routes are protected by middleware
- Only users with admin privileges can access admin dashboards
- API endpoints use service role key for database operations
- User data is handled securely with proper validation

## Troubleshooting

### Database Issues
- Ensure all tables are created successfully
- Check Supabase dashboard for any errors
- Verify environment variables are set correctly

### Admin Access Issues
- Verify the admin user exists in the database
- Check middleware configuration
- Ensure proper authentication flow

### Analytics Not Working
- Check browser console for JavaScript errors
- Verify API endpoints are accessible
- Ensure database connections are working

## Next Steps

1. Test the admin dashboard functionality
2. Verify article view tracking is working
3. Test newsletter signup tracking
4. Set up automated analytics reports (optional)
5. Configure email notifications for signups (optional)

## File Structure

```
app/
├── admin/
│   └── knowledge-hub/
│       └── page.tsx              # Admin dashboard
├── api/
│   ├── admin/
│   │   └── knowledge-hub/
│   │       └── route.ts          # Admin analytics API
│   └── knowledge-hub/
│       ├── signup/
│       │   └── route.ts          # Signup tracking
│       ├── track-view/
│       │   └── route.ts          # View tracking
│       └── article-stats/
│           └── route.ts          # Stats retrieval
├── knowledgehub/
│   └── components/
│       ├── ArticleStats.tsx      # Stats display
│       └── ArticleViewTracker.tsx # View tracking
└── middleware.ts                 # Admin route protection

Database schemas:
├── admin_and_analytics_schema.sql
└── setup-analytics-db.js
```
