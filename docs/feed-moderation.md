# Feed moderation

Apply `supabase/migrations/055_feed_spam_protection.sql`, then `supabase/migrations/056_community_tools.sql`, to the Supabase database before deploying these UI changes. It builds on the existing social-feed and moderation migrations through 054. Neither change has been applied to a hosted database. The available Supabase CLI login was checked and does not include the project configured in this app’s environment. Do not use another listed project as a substitute.

Admins use **Members → Moderate**, or **Reports → report details → Moderate**:

- Suspend for 1, 7, or 30 days; restrictions expire automatically.
- Block from the feed until an admin restores access.
- Restore access after review.
- Delete an account permanently, with a required reason and typed confirmation.

Suspension and blocking hide authored posts/comments from other members and anonymous visitors, and stop new posts, comments, edits, and reposts. They restrict the feed, not login or unrelated services. Admins can inspect hidden content through direct queries for report review. Existing sessions are subject to database enforcement. Reasons and action history are in an admin-only audit table. Self-moderation and moderation of active admin accounts are rejected.

Deletion runs transactionally against the auth account and its cascading database records. Existing non-cascading references can prevent deletion; in that case the whole action rolls back and the UI shows an error. Storage objects and records in external services are not purged. Audit records survive deletion.

Spam safeguards apply to posts and comments, including content edits: 5,000 characters, at most 3 explicit links (`http://`, `https://`, or `www.`), 15 seconds between submissions, 30 submissions an hour, and duplicate detection within 24 hours after normalizing case and whitespace. Changing an image does not bypass duplicate text detection. Deleting a post does not reset the limits. Media-only duplicates are checked by media URL. This is deterministic abuse prevention, not a classifier for all scams or harmful content; reports still need human review. Existing content is not automatically deleted.

## Validation

The isolated PostgreSQL test uses PGlite and never connects to production:

```sh
npm install --prefix /tmp/agripro-moderation-test --no-package-lock --no-audit --no-fund @electric-sql/pglite
PGLITE_MODULE=/tmp/agripro-moderation-test/node_modules/@electric-sql/pglite/dist/index.js node tests/feed-moderation.mjs
npx tsc --noEmit --incremental false
```

Tests cover migration execution, normal posting, normalized duplicates, link/length/rate limits, edits, admin authorization, protected profile fields, suspension, repost restrictions, expiry, member and anonymous feed visibility, restoration, counter updates, deletion rollback and audit retention. Fixtures use the existing social migrations and a minimal auth/profile schema; review the live database's foreign keys before rolling out account deletion. Browser checks with authenticated admin/member accounts remain part of deployment verification.

## Community tools

- `/feed`: topic and country filters run in the database before pagination and compose with Following and hashtag filters. Countries come from published posts. New posts inherit the author’s profile country; historical posts are backfilled once. There is no location inference from IP addresses. Existing posts default to the Community topic. The For You feed retains priority for recent posts from accepted connections.
- `/admin/community`: review pending posts, resolve appeals, and publish or unpin announcements. Queues show the oldest 50 pending items, moving to the next items as decisions are made. The three newest active, unexpired announcements appear above the feed. Expired announcements can be pinned again without an expiry.
- `/feed/activity`: members see their latest 50 post reviews, report statuses, and appeals in each section. Reporters cannot read internal admin notes or other members’ reports. Admin responses to post reviews and appeals are explicitly member-visible.

### Early-post review

Until an author has three published posts, submissions containing explicit links, WhatsApp/Telegram references, “guaranteed returns/profit”, or “DM me” go to review. Existing posts are not retroactively queued. This is a transparent heuristic, not a claim to detect every scam. Plain-text early posts remain publishable, subject to the spam limits.

Pending or rejected posts are visible only to their author and admins, and never appear in the main feed (including for the author). Account restrictions take precedence. Pending content cannot receive new comments, likes, reposts, mentions, or hashtag promotion. Members see review status after posting and on the post page. Early promotional edits are rechecked; edits to a rejected post return it to review. Admin review detects content changes since the queue loaded. Post decisions retain an admin-only snapshot and audit record.

Approved posts become available in the feed and hashtag discovery immediately. Mentions and trending hashtag metadata suppressed while a post was held are not replayed automatically on approval; the content still supports inline mentions and hashtag discovery.

### Appeals and report tracking

Members can appeal active account restrictions or their own rejected posts. There is one pending appeal per account/post, with a maximum of three submissions per day. Accepting an account appeal restores feed access; accepting a post appeal publishes the rejected post. An older account appeal cannot silently undo a newer moderation action. Declined appeals retain the response for the member. Reports always start pending, reject duplicate open reports, and have a limit of ten per hour.

Additional database verification:

```sh
PGLITE_MODULE=/tmp/agripro-moderation-test/node_modules/@electric-sql/pglite/dist/index.js node tests/community-tools.mjs
```

This suite covers first-post review, forged decisions, stale review detection, privacy, appeals, announcement permissions/expiry, discovery filters, following/muting, and pending-post interaction restrictions. No live accounts or announcements were changed during testing. Authenticated browser validation remains necessary against the migrated project before deployment.

## Recovering from the spam cooldown migration error

Run `supabase/repair_feed_submission_guard.sql` in SQL Editor first, then run the complete current `056_community_tools.sql`. Do not rerun an already successful 055. If the editor reports an aborted transaction, run `ROLLBACK;` separately before the repair.

The repair replaces the original guard with a content-aware version: metadata backfills and moderation decisions do not consume posting quota, while content/media changes still do. It also normalizes all triggers referencing that guard on posts/comments, preventing duplicate triggers from applying the cooldown twice. It preserves content, unrelated triggers, and rate-limit history. Changes happen under table locks inside one transaction. The repair is safe to rerun; migration 056 includes it as well.

The original 056 backfill ran before its trigger adjustment; the first repair relied on a particular trigger name/order. Replacing the function itself also protects older copies of 056 and databases with extra legacy triggers. The live database has not been inspected, so the exact trigger configuration there is still unverified.

Regression checks include the original legacy guard, multiple posts by one author, a recent submission, a blocked author, duplicate guard triggers, repeat repair execution, and continued enforcement of cooldowns on real posts/edits:

```sh
PGLITE_MODULE=/tmp/agripro-moderation-test/node_modules/@electric-sql/pglite/dist/index.js node tests/community-migration-existing-posts.mjs
```

## Structured post types

The next release is documented in `docs/practical-feed.md`. After 055 and 056, run only `057_practical_feed_posts.sql` to enable questions, listings, opportunities, private enquiries, and accepted answers. If guard repair is ever needed, use the current file, which also preserves structured-field checks; older saved copies do not.
