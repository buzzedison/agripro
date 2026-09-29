# Practical feed posts

This release adds three structured post types alongside ordinary updates:

- **Ask a question:** title, crop/subject, country, and location, with optional context/photos. Replies use the existing comment system and useful reactions. The question author can choose a top-level accepted answer on the post page. Editing the question or the selected answer clears the endorsement; deleting the answer clears it too. Acceptance is not expert verification.
- **Buy or sell:** commodity, positive quantity/unit, country/location, optional price per unit, currency, availability date, and closing date. Interested members send a private enquiry containing their requirements and preferred follow-up details. This is an enquiry workflow, not payment processing or a confirmed sale.
- **Share an opportunity:** grant, job, training, tender, funding, or event; title, location/country, eligibility, closing date, and official application URL. Members can open the external application or privately request details. Existing bookmarks can save these posts.

## Activation

Run the complete **`supabase/migrations/057_practical_feed_posts.sql`** in Supabase SQL Editor after successful migrations 055 and 056. Do not rerun those earlier migrations. The current standalone guard-repair helper is also compatible with the new fields; older saved copies are not. Then deploy the application changes.

057 runs transactionally. It adds default values without updating existing post content or resetting posting history. It normalizes legacy duplicate guard triggers. It has been tested with existing posts and a recent submission. It has not been applied to the live database from this workspace.

## Member experience

The feed composer offers all four post types. The fields, card layout, action buttons, edit form, and filters reflect the selected type. Structured details also appear on post pages, in bookmarks, in the member's review history, and in the admin review queue. Feed search matches structured titles and details.

`/feed/enquiries` contains private sent/received enquiries and the member's own listings/opportunities. Authors can mark enquiries as needing follow-up, contacted, or closed, and mark posts closed/fulfilled. Profile links let members use existing connection/contact flows. Status changes do not automatically send messages or email. The page shows the latest 100 records, and displayed counts are for that loaded set.

Closing dates end at 23:59 UTC. Closed/expired listings and opportunities leave the default discovery feed and stop accepting enquiries. An explicit “Include closed posts” filter allows browsing them. Authors can reopen a manually closed post before its deadline; expired posts cannot reopen without a valid future deadline. Saved/permalink views retain closed posts and display their status.

## Enforcement and privacy

- Both the form and database validate structured fields; application links must use HTTP(S).
- Structured-field edits participate in spam rate limits and early-post review. A new member cannot bypass link review by placing a promotional link only in the application URL or title.
- Post kind cannot change after creation. Structured fields are editable from the post's edit menu; updates to reviewed content can return it to the review queue.
- Enquiries are visible only to their sender and the post author. One enquiry per member/post; at most ten per member per hour. Own-post enquiries, blocked pairs, restricted members, unpublished posts, and closed/expired posts are rejected by the database.
- Only a post author can update their enquiry statuses or close/reopen their post. Accepted answers must belong to that published question and be visible, top-level comments.
- No bulk migration backfill changes post content or consumes the posting cooldown.

## Verification

```sh
PGLITE_MODULE=/tmp/agripro-moderation-test/node_modules/@electric-sql/pglite/dist/index.js node tests/practical-feed.mjs
```

The isolated PostgreSQL tests cover migration with existing data, required-field and URL validation, structured edit cooldowns, early-post review, enquiry privacy and permissions, duplicates, closed/expired post discovery, restricted accounts, and accepted-answer edits/deletion. The preceding moderation, community, and migration-regression suites also pass.

The new form/card components were checked in a local desktop and 390px mobile browser preview; the temporary preview route was removed. Live authenticated workflow verification is still needed after applying 057 and deploying.

Suggested deployment smoke check: create each type using a test member; approve any held opportunity; enquire using another test member; update the enquiry as the author; close the listing; accept and then edit an answer; verify that saved and filtered views show the expected state. Use a past-deadline fixture in a test database to check expiry rather than modifying real listings.
