# Hashtag & Trending Topics System

Complete implementation of hashtag functionality and dynamic trending topics for the AgriProHub feed.

## Features Implemented

### 1. Database Schema
**File:** `supabase/migrations/011_create_hashtags.sql`

- **hashtags table**: Stores all unique hashtags with usage statistics
- **post_hashtags table**: Many-to-many relationship between posts and hashtags
- **Automatic triggers**: Updates use_count and last_used_at automatically
- **trending_hashtags view**: Calculates trending hashtags based on recent usage and engagement
- **RLS policies**: Secure access control for hashtags

### 2. Hashtag Utility Functions
**File:** `lib/utils/hashtags.ts`

Functions available:
- `extractHashtags(text)` - Extract all hashtags from text
- `normalizeHashtag(hashtag)` - Normalize hashtag for comparison
- `parseContentWithHashtags(content, onHashtagClick)` - Render hashtags as clickable
- `parseContentWithLinksAndHashtags(content, onHashtagClick)` - Render both URLs and hashtags as clickable
- `isValidHashtag(hashtag)` - Validate hashtag format
- `formatHashtag(hashtag)` - Add # prefix if needed

### 3. API Routes

#### GET /api/feed/trending
Returns top 10 trending hashtags based on:
- Usage in last 7 days
- Number of posts
- Trend score (velocity of growth)

#### POST /api/feed/hashtags
Extracts and saves hashtags for a post
- Body: `{ postId, content }`
- Automatically creates new hashtags
- Links hashtags to posts
- Updates usage statistics

#### GET /api/feed/hashtags?tag=TagName
Returns all posts containing a specific hashtag
- Includes user profiles and engagement data
- Sorted by most recent first

### 4. Feed Integration

#### Hashtag Parsing in Posts
- All post content now displays hashtags as clickable green text
- Clicking a hashtag filters the feed to show only posts with that tag
- URLs are also clickable (blue text)

#### Hashtag Filtering
- Click any hashtag to filter the feed
- Visual indicator shows active filter at top of feed
- "Clear Filter" button to return to full feed
- Scrolls to top when filter is applied

#### Dynamic Trending Topics Sidebar
- Replaces hardcoded topics with live data
- Shows top 5 trending hashtags
- Displays post count for each hashtag
- Click to filter feed by that hashtag
- Highlights currently selected hashtag

#### Automatic Hashtag Saving
- When creating a post, hashtags are extracted and saved automatically
- Works for both regular posts and quote reposts
- Hashtag saving happens in background (doesn't block post creation)

## How to Use

### For Users

**Creating Posts with Hashtags:**
```
Just posted a great harvest! #PoultryFarming #OrganicAgriculture
```

**Viewing Trending Topics:**
- Check the "Trending Topics" section in the right sidebar
- See which topics are popular
- Click any topic to see related posts

**Filtering by Hashtag:**
- Click any hashtag in a post (green text)
- OR click a trending topic
- Feed will show only posts with that hashtag
- Click "Clear Filter" to see all posts again

### For Developers

**Database Setup:**
1. Run the migration: `supabase/migrations/011_create_hashtags.sql` in Supabase SQL Editor
2. This creates all necessary tables, triggers, and views

**Using Hashtag Functions:**
```typescript
import { extractHashtags, parseContentWithLinksAndHashtags } from '@/lib/utils/hashtags';

// Extract hashtags from text
const tags = extractHashtags("Hello #World #AgTech");
// Returns: ['World', 'AgTech']

// Render with clickable hashtags
const content = parseContentWithLinksAndHashtags(
  "Check out #PoultryFarming https://example.com",
  (hashtag) => console.log(`Clicked: ${hashtag}`)
);
```

## Database Schema Details

### hashtags Table
```sql
- id (UUID, PK)
- name (TEXT, UNIQUE) - Original case hashtag name
- normalized_name (TEXT) - Lowercase for matching
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- use_count (INTEGER) - Total times used
- last_used_at (TIMESTAMPTZ) - Last usage timestamp
```

### post_hashtags Table
```sql
- id (UUID, PK)
- post_id (UUID, FK -> posts)
- hashtag_id (UUID, FK -> hashtags)
- created_at (TIMESTAMPTZ)
- UNIQUE(post_id, hashtag_id)
```

### trending_hashtags View
Calculated fields:
- `recent_post_count` - Posts in last 7 days
- `trend_score` - Velocity metric (posts per day)

## Hashtag Format

Valid hashtags:
- Must start with `#`
- Followed by a letter (a-z, A-Z)
- Can contain letters, numbers, underscores
- Examples: `#AgTech`, `#Farming101`, `#Organic_Food`

Invalid hashtags:
- `#123` - Can't start with number
- `#test-tag` - Hyphens not allowed
- `# tag` - Spaces not allowed

## Performance Considerations

- Indexes on `normalized_name`, `use_count`, and `last_used_at`
- Junction table prevents duplicate hashtag-post relationships
- Trending view limits to 10 results
- Hashtag saving happens asynchronously after post creation

## Future Enhancements

Possible improvements:
- Hashtag autocomplete while typing
- Hashtag suggestions based on post content
- Popular hashtags by category (agriculture, technology, etc.)
- Hashtag analytics dashboard
- Search with multiple hashtags
- Exclude certain hashtags from trending (moderation)
