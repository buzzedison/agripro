# Feed media, reactions, live updates and public preview

Apply `supabase/migrations/062_feed_media_reactions_live.sql` in the Supabase SQL Editor after 061, then deploy. It is transactional and safe to rerun. It has not been applied to the live database from this workspace.

The app degrades safely if deployed first: likes load without types, signed-out visitors see a direct published-posts query, single-photo posts without a description still post, and multi-photo, alt text, reactions and live signals start working once 062 is applied.

## What changed

- **Photos and video:** up to 4 photos or 1 video (MP4/WebM/MOV, max 50 MB) per post. Photos are resized in the browser to 1600px JPEG before upload. Each photo has an optional description used as its alt text. The bucket now enforces 50 MB and photo/video MIME types.
- **No silent media loss:** if any upload fails, already-uploaded files are removed and the post is not published; the draft stays in the composer.
- **Media is fixed after posting:** the database rejects member changes to `media_urls`/`media_alt` after insert, so approved posts cannot gain unreviewed images. URLs must point at the `post-images` bucket. `image_url` still holds the first item for older readers.
- **Drafts:** composer text, post type, structured fields, topic and country are saved per member in browser storage and restored on return. Attachments must be re-added.
- **Reactions:** Like, Useful, Insightful, Support. A `post_likes` row now carries `reaction`; `likes_count` counts all reactions. Members can only change their own reaction. Totals per type come from `post_reaction_counts`.
- **Live new-posts banner:** Realtime INSERTs on `posts` (RLS applies, so held/restricted posts are not delivered) show "N new posts"; clicking reloads the top of the feed. Blocked/muted authors are ignored.
- **Infinite scroll:** the next page loads automatically near the end of the list; the button remains as a fallback.
- **Sharing:** Copy link, WhatsApp, Facebook, and the device share sheet where supported. Post pages now render Open Graph/Twitter metadata server-side (title, text, first photo) for published posts only.
- **Translate:** members can translate a post into 10 languages via `/api/ai/translate` (Groq, signed-in only, max 5,000 characters). Translations are labelled as machine translations.
- **Signed-out preview:** `/feed` shows the 10 newest open, published posts from unrestricted authors with sign-up prompts, instead of redirecting to login. Post permalinks were already public.
- **Code structure:** media helpers moved from `app/feed/page.tsx` into `app/feed/components/FeedMedia.tsx`; new features live in their own components (`ComposerMediaPreview`, `LiveFeed`, `ReactionButton`, `TranslateButton`, `PublicFeedPreview`) and `lib/feed-media.ts`.

## Verification

```sh
PGLITE_MODULE=/path/to/node_modules/@electric-sql/pglite/dist/index.js node tests/feed-media-reactions.mjs
```

Covers bucket limits, realtime publication, media limits and URL restriction, media immutability, reaction types and ownership, reaction totals, and preview visibility (blocked authors and held posts excluded). The moderation, practical-feed and interests/alerts suites still pass.

Checked in a local browser while signed out (preview at mobile width, post page, link-preview metadata). Still to check with a test member after applying 062: multi-photo and video posts, alt text, failed-upload handling, draft restore, reactions, the new-posts banner from a second account, infinite scroll and translation (needs `GROQ_API_KEY`).
