# Catalyst W applicant clean-up and selection

Apply `supabase/migrations/063_catalyst_selection.sql` in the Supabase SQL Editor (after 062), then deploy. It is transactional and safe to rerun. The new pages show a load error until it is applied.

## Pages

- **Admin → Catalyst W → Applicant Clean-up** (`/admin/catalyst-w/clean-up`): completeness for every application (required form fields, plus phone/website/revenue as helpful extras), very short answers, invalid emails, likely test entries and possible duplicates (same email, same phone or same name + business). Mark duplicates, exclude with a reason (never deletes; restore any time), and send personal "complete your application" emails to one or many applicants. Reminders skip complete, excluded and recently reminded applicants (48 hours) and do not mention the 6 November working close date, which is not yet approved for publication.
- **Admin → Catalyst W → Selection & Interviews** (`/admin/catalyst-w/selection`): ranked shortlist by average weighted score; per-founder drawer with application answers, business verification (evidence notes, who verified and when), interview scheduling with an emailed invite showing GMT/WAT/CAT/EAT times, reschedule/complete/no-show/cancel, a personal scorecard (one per admin login) with recommendation and notes, and other interviewers' scorecards. A Questions tab edits the selection questions and their weights (six starter questions are seeded).

Booking an interview moves New/Reviewed applications to the new **Shortlisted** stage; marking it completed moves them to **Interviewed**. Stage changes on the Selection page do not email founders; stage emails stay on the All submissions page.

## Security fixes included

- `/api/admin/catalyst-w` (list, update, delete) and `/api/admin/catalyst-w/email` had no login check while using the service role. They now require an active admin (`lib/admin-auth.ts`).
- The original table policies let any signed-in member read and edit all applications. 063 restricts direct access to admins.
- Applicant names in stage emails are now HTML-escaped.

Other `/api/admin/*` routes still lack a login check; see the follow-up task.

## Verification

```sh
PGLITE_MODULE=/path/to/node_modules/@electric-sql/pglite/dist/index.js node tests/catalyst-selection.mjs
```

Covers member/anonymous access, the new stage and exclusion rules, duplicate self-reference, interview link validation, one scorecard per interviewer, cascade on delete, plus completeness, duplicate grouping and weighted scoring. Signed-out requests to the four APIs return 401 locally. The pages were type-checked and linted but not viewed while signed in as an admin; check them after applying 063, including one reminder and one interview invite to a test address.
