# Catalyst W launch pages (roadmap 15 Oct – 30 Nov 2026)

Apply `supabase/migrations/064_catalyst_launch.sql` after 063 in the Supabase SQL Editor, then deploy. It is transactional and safe to rerun. It seeds the 2026 settings (launch 30 Nov, 5-day offer window, $399 standard fee) and the countries Ghana, Nigeria, Zimbabwe and Kenya, with South Africa inactive.

## Setup before use

- `RESEND_API_KEY` for all founder emails. Optionally set `CATALYST_REPLY_TO` for the reply-to address (defaults to edison@agriprohub.com).
- `PAYSTACK_SECRET_KEY` for card payments in USD. Without it, founders see "reply for bank transfer / mobile money", and admins record those payments manually.
- In the Paystack dashboard, set the webhook URL to `https://www.agriprohub.com/api/catalyst-w/paystack-webhook`. This confirms places even if a founder closes the tab after paying.
- `NEXT_PUBLIC_SITE_URL` is used to build founder links. It falls back to https://www.agriprohub.com.

## Admin pages (Admin → Catalyst W)

| Page | Roadmap step |
|---|---|
| Scholarships `/admin/catalyst-w/scholarships` | Set the number of $199 and fully funded places, invite founders to request support, and decide on need alone (selection scores are hidden). Warns before going over the set places. |
| Offers & places `/admin/catalyst-w/offers` | Target cohort, fee and offer window. Prepare offers with the fee that follows the scholarship decision, email them, and send reminders. Record bank-transfer or mobile-money payments, extend or expire past-deadline offers, and rank the reserve list. Shows "Offer next" when places are free. Flags successful payments that couldn't confirm a place. |
| Partners & funding `/admin/catalyst-w/funding` | Budget lines from Faith's budget (essential or not, funded amount, funder), and partners with status, contribution, owner and next step. Shows the essential-cost gap. |
| Countries `/admin/catalyst-w/countries` | Host, coordinator, capacity against confirmed and offered founders, venue and first activity. Lists confirmed founders in countries without a gathering. |
| Groups & welcome `/admin/catalyst-w/groups` | Groups with a venture lead and contact person. Assign confirmed founders, set each founder's next action, and send welcome packs. Shows the gaps that would leave a founder unprepared on launch day. |
| Launch readiness `/admin/catalyst-w/readiness` | Roadmap checks for each phase, filled in automatically from the pages above. "Copy review summary" gives a text summary to paste into Stride for the Monday and Thursday reviews. |

## Founder page `/catalyst-w/portal/<private link>`

Each founder gets a 256-bit private link the first time they're emailed. Admins can also copy it from the Offers page for WhatsApp. The page is not indexed. On it, founders can:

- request scholarship support (and update the request until it's decided)
- accept or decline their offer
- pay through Paystack in USD (a fully funded place confirms on acceptance)
- once confirmed, see their welcome pack: group, venture lead, contact person (with a WhatsApp link), next action, the weeks 1–3 timetable from Cohort Management → Programme, and their country gathering (shown once the host is confirmed)

## Rules worth knowing

- A payment confirms a place only if Paystack reports success, in USD, for at least the fee, on that founder's offer. Webhook retries are harmless.
- Offers close at 23:59 UTC on the deadline. Past-deadline offers are never expired automatically: the team chooses to extend, expire or chase.
- Confirming a place moves the application to Paid and the participant to Selected. Sending the welcome pack moves them to Onboarding.
- All launch tables are admin-only under RLS. Founders reach only their own record, through the server.

## Verification

```sh
PGLITE_MODULE=/path/to/pglite/dist/index.js node tests/catalyst-launch.mjs
```

This covers the seeds, token rules, scholarship and offer constraints, unique payment references, group deletion, member and anonymous access, cascading deletes, and the deadline, fee and welcome-gap rules. Signed out, the admin API returns 401 and unknown founder links return 404. The founder page was checked on a phone-sized screen with sample offer and welcome data.

**Still to check after applying 064 and setting the keys:** one full test journey with a test applicant at a test email address. Invite, request a scholarship, decide it, send an offer, pay with a Paystack test card in test mode, assign a group, then send the welcome pack. The admin pages were type-checked and linted but not viewed while signed in.
