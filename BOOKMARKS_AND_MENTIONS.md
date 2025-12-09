# Bookmarks & @Mentions System

Complete implementation of bookmarks and user mentions for the AgriProHub feed.

## Features Implemented

### 1. 🔖 Bookmarks System

**Save posts for later reference**

#### Database Schema
**File:** `supabase/migrations/012_create_bookmarks_and_mentions.sql`

- **post_bookmarks table**: Stores user-post bookmark relationships
- **Automatic triggers**: Prevents duplicate bookmarks
- **RLS policies**: Users can only view/manage their own bookmarks

#### API Routes

**POST /api/feed/bookmarks**
- Bookmark a post
- Body: `{ postId: string }`
- Returns: Success/error message

**DELETE /api/feed/bookmarks?postId=xxx**
- Remove bookmark from a post
- Returns: Success/error message

**GET /api/feed/bookmarks**
- Get all bookmarked posts for authenticated user
- Returns: Array of posts with full details

#### UI Features

**In Feed (`/feed`):**
- Yellow bookmark button on each post
- Filled bookmark icon when post is bookmarked
- Optimistic UI updates (instant visual feedback)
- Hover effects and transitions

**Bookmarks Page (`/feed/bookmarks`):**
- Dedicated page to view all saved posts
- Shows post count
- Remove bookmarks directly
- "View in feed" links
- Empty state with call-to-action

### 2. @️ Mentions System

**Tag other users in posts and comments**

#### Database Schema
**File:** `supabase/migrations/012_create_bookmarks_and_mentions.sql`

- **post_mentions table**: Tracks user mentions in posts
- **comment_mentions table**: Tracks user mentions in comments
- **search_users_for_mention()**: Database function for autocomplete
- **RLS policies**: Secure mention creation and viewing

#### API Routes

**GET /api/feed/mentions/search?q=john**
- Search users for mention autocomplete
- Searches by full name (case-insensitive)
- Returns: Up to 10 matching users

**POST /api/feed/mentions**
- Save mentions for a post or comment
- Body: `{ postId?: string, commentId?: string, content: string }`
- Extracts @mentions from content automatically
- Returns: Count of mentions saved

#### Mention Parsing

**File:** `lib/utils/mentions.tsx`

Functions available:
- `extractMentions(text)` - Extract all @mentions from text
- `parseContentWithAll(content, onHashtagClick, onMentionClick)` - Render URLs, hashtags, and mentions as clickable
- `searchUsersForMention(query)` - Search for users (autocomplete helper)
- `isValidMention(mention)` - Validate mention format
- `formatMention(mention)` - Add @ prefix if needed

#### UI Features

**Mention Display:**
- @mentions appear as clickable blue text
- Click mention → Search for user in Connect directory
- Works in posts and comments
- Combined with hashtag and URL parsing

**Mention Format:**
- Must start with @ symbol
- Followed by user's full name
- Example: `@John Doe`, `@Jane Smith`
- Case-insensitive matching

## How to Use

### For Users

**Bookmarking Posts:**
1. Click the bookmark icon (📑) on any post
2. Icon turns yellow when bookmarked
3. View all bookmarks at `/feed/bookmarks`
4. Click bookmark again to remove

**Mentioning Users:**
1. Type @ followed by user's name in a post: `@John Doe check this out!`
2. User will be notified (when notifications are implemented)
3. Mention appears as clickable blue text
4. Click mention to find that user

### For Developers

**Database Setup:**
Run the migration in Supabase SQL Editor:
```sql
-- Run: supabase/migrations/012_create_bookmarks_and_mentions.sql
```

**Using Bookmark API:**
```typescript
// Bookmark a post
await fetch('/api/feed/bookmarks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postId: 'uuid-here' })
});

// Get user's bookmarks
const response = await fetch('/api/feed/bookmarks');
const data = await response.json();
console.log(data.posts); // Array of bookmarked posts
```

**Using Mention Utilities:**
```typescript
import { extractMentions, parseContentWithAll } from '@/lib/utils/mentions';

// Extract mentions from text
const mentions = extractMentions("Hello @John Doe and @Jane Smith!");
// Returns: ['John Doe', 'Jane Smith']

// Render with clickable mentions and hashtags
const content = parseContentWithAll(
  "Check out #AgTech @John Doe! https://example.com",
  (hashtag) => console.log(`Clicked hashtag: ${hashtag}`),
  (mention) => console.log(`Clicked mention: ${mention}`)
);
```

**Automatic Mention Saving:**
Mentions are automatically extracted and saved when:
- Creating new posts
- Creating quote reposts
- (Can be extended to comments)

## Database Schema Details

### post_bookmarks Table
```sql
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- post_id (UUID, FK -> posts)
- created_at (TIMESTAMPTZ)
- UNIQUE(user_id, post_id)
```

### post_mentions Table
```sql
- id (UUID, PK)
- post_id (UUID, FK -> posts)
- mentioned_user_id (UUID, FK -> auth.users)
- mentioned_by_user_id (UUID, FK -> auth.users)
- created_at (TIMESTAMPTZ)
- UNIQUE(post_id, mentioned_user_id)
```

### comment_mentions Table
```sql
- id (UUID, PK)
- comment_id (UUID, FK -> post_comments)
- mentioned_user_id (UUID, FK -> auth.users)
- mentioned_by_user_id (UUID, FK -> auth.users)
- created_at (TIMESTAMPTZ)
- UNIQUE(comment_id, mentioned_user_id)
```

## Performance Considerations

- Indexes on user_id, post_id, mentioned_user_id
- Optimistic UI updates for instant feedback
- Debounced search for mention autocomplete
- Efficient database function for user search

## Integration with Other Features

**Works seamlessly with:**
- ✅ Hashtags - Can use both in same post
- ✅ URLs - All three are clickable
- ✅ Quote reposts - Mentions work in quotes
- ✅ User profiles - Click mention to find user
- ⏳ Notifications - Ready for notification system

## Next Steps / Future Enhancements

**Mention Autocomplete:**
- Dropdown suggestions while typing @
- Show user avatars in suggestions
- Keyboard navigation

**Bookmark Enhancements:**
- Bookmark collections/folders
- Share bookmark lists
- Export bookmarks

**Mention Features:**
- Email notifications when mentioned
- In-app notifications
- "You were mentioned" feed
- Mention analytics

## Files Created/Modified

### New Files
- `supabase/migrations/012_create_bookmarks_and_mentions.sql`
- `app/api/feed/bookmarks/route.ts`
- `app/api/feed/mentions/route.ts`
- `lib/utils/mentions.tsx`
- `app/feed/bookmarks/page.tsx`

### Modified Files
- `app/feed/page.tsx` - Added bookmark button, mention parsing, state management

## Testing Checklist

- [x] Bookmark a post → Icon fills yellow
- [x] Unbookmark a post → Icon becomes outlined
- [x] View bookmarks page → Shows all saved posts
- [x] Remove bookmark from bookmarks page → Post disappears
- [x] Post with @mention → Mention saved to database
- [x] Click @mention → Navigate to user search
- [x] Mentions render as blue, clickable text
- [x] Hashtags and mentions in same post → Both work
- [x] Empty bookmarks state → Shows helpful message
