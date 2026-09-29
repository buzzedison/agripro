# Private enquiry conversations

## Activation

Run `supabase/migrations/059_enquiry_conversations.sql` in Supabase SQL Editor after 058, then deploy the app. If the earlier releases are not installed, apply 057 and 058 first, in order. This change has not been applied to the live database by Codex.

The migration copies existing enquiries into opening messages without touching posts, triggering submission cooldowns, or replaying alerts. New enquiries create their opening message automatically.

## Member experience

Open **My enquiries → Open conversation**. Both the enquiry sender and post author can reply, browse earlier messages and report incoming messages. Threads refresh every 15 seconds while the page is visible, except while reading earlier history or using the report dialog. Refresh replies returns to the latest 50 messages. Replies use a stable send identifier so retrying after a network failure does not duplicate a successful send.

Closing or expiring a listing stops new enquiries but allows existing follow-up. Closing an individual enquiry pauses replies; its author can reopen it by changing its follow-up status to Contacted or Needs follow-up. Blocks, suspended accounts and unpublished posts also stop replies. Participants retain access to their conversation history for reporting. Account/post deletion can remove associated history through the existing cascade rules.

New reply alerts appear in the bell and link directly to the thread. One alert per recipient/thread is refreshed, rather than generating a stack of alerts. Opening a visible conversation marks fetched reply alerts as read without marking later replies. **Feed preferences → Someone replies to my enquiry conversation** controls future reply alerts independently. Muted members do not generate reply alerts. Alerts contain no message text.

## Privacy and moderation

Only the two participants can read a thread. Direct client inserts, edits and deletes of messages are prohibited. The send operation enforces membership, blocks/restrictions, 1–2,000 characters, at most three links, a five-second cooldown, 60 messages per hour and duplicate-text prevention within ten minutes. Opening messages count toward reply limits. Existing first-enquiry limits remain in force.

Reporting explicitly shares only the selected incoming message and the reporter's explanation with moderators. The usual report rate and duplicate protections apply. Moderators cannot browse unreported conversations. The reports dashboard displays the reported evidence and allows account moderation or message removal. Removal replaces the message with a notice and marks related reports actioned; the original snapshot remains private to moderators. Removing an opening message also redacts its copy in the enquiry dashboard.

## Validation

`tests/enquiry-conversations.mjs` covers existing-data migration, new opening messages, private access, idempotency, limits, alert preferences, blocks, closed/held threads, restrictions, report disclosure, moderator removal and pagination. Run it with PGlite installed, setting `PGLITE_MODULE` to the module path if required. The tests create only isolated test data, never live messages or accounts.
