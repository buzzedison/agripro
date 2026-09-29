# Feed interests and in-app alerts

Apply `supabase/migrations/058_feed_interests_and_alerts.sql` in the Supabase SQL Editor after migrations 055, 056 and 057 have succeeded, then deploy the app. Run 057 first if the practical-post release has not been installed. This release has not been applied to the live database by Codex.

Members open **Feed preferences** from the feed to save up to 20 crops/commodities, six topics and ten countries. Preferences are private. Crop matching uses the crop/commodity field on structured posts, normalized for case and spaces; countries use full names. This is explicit matching, not fuzzy matching or behavioral tracking.

For you prioritizes matching posts from the last 14 days (crop match: 3; topic: 2; country: 1), then recent connections, then newest posts. Following remains chronological. All visibility and selected filters apply before pagination. **Only my interests** limits results to any saved match, including older posts. No interests means no results in that mode. Empty preferences retain the default feed ordering.

The notification bell and notification page now show new enquiries, enquiry status updates and accepted answers. Links open the correct received/sent enquiry or the question. Each alert can be disabled separately in Feed preferences. These settings affect future in-app alerts only; email and push settings are unchanged. No historical events are replayed.

Alerts omit enquiry message content. Blocks, mutes and account restrictions suppress new alerts; hidden posts and withdrawn accepted answers hide existing relevant alerts. A private event ledger prevents repeated status/answer toggles from recreating the same alert, even after deletion. Deleting a post also removes its event ledger. New event types cannot be inserted directly by a client.

Validation: `tests/feed-interests-alerts.mjs` exercises a real isolated PostgreSQL-compatible database with authenticated roles and RLS. It requires PGlite; set `PGLITE_MODULE` to its installed module path if it is not installed in the project. Existing moderation/community/practical-post tests remain applicable. No live accounts or posts are created by these tests.
