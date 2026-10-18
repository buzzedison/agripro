# Marketplace: sharing, saves and alerts, buyer reviews, seller insights

Apply `supabase/migrations/065_marketplace_saves_reviews_insights.sql` after 060 and 061 (and after 064). It's transactional and safe to rerun. Link previews and share buttons work without it. Saves, reviews and insights need it: before it's applied they show empty states, and stored ratings display as before.

## What buyers get

- **Link previews and sharing.** Product and supplier pages render Open Graph and Twitter previews (title, price, location, first photo) for public listings only. Share buttons: WhatsApp, Facebook, copy link, and the phone's share sheet.
- **Save** on product and supplier pages, plus a **Saved** page (`/greenmarket/saved`, linked from the marketplace header). With the alert bell on, buyers are notified when:
  - a saved product is back in stock
  - a saved product's price drops (same currency)
  - a saved supplier lists a new product

  Each buyer gets at most one alert per product per day. Blocks and account restrictions suppress alerts.
- **Reviews** on supplier pages. A buyer can review a supplier only after requesting a quote from them and receiving a reply in that conversation. There's one review per buyer per supplier; it can be edited, and it can be reported. The page shows the reviewer's first name and country only.

## What sellers get

- **Insights** (`/greenmarket/vendor-dashboard/insights`, in the seller menu), over 7, 30 or 90 days:
  - product views (one per buyer session, excluding the seller's own)
  - quote requests and request rate
  - share of requests answered and answered within a day, and median first-reply time
  - product saves and suppliers following
  - rating, a daily chart and a per-product table
  - a prompt when quote requests are waiting for a first reply
- **Review replies:** a public response to each review, which can be edited or removed. Sellers are notified of new reviews.

## Trust and safety

- Ratings come only from visible reviews, through `vendor_review_summary()`, and are overlaid wherever sellers are listed. The protected `rating` and `total_reviews` columns from 060 are never written, so sellers still can't change their own reputation.
- Reviews can only be written through `submit_trade_review()`, which checks for a genuine quote conversation, blocks self-reviews and blocked pairs, and limits each buyer to 10 new reviews a day. Admins can hide a reported review from the reports queue (`moderate_trade_review`); hidden reviews can't be edited.
- Saved items are private to their owner. Alerts can only be created by the database. View counts store daily totals per product and no visitor identity.

## Verification

```sh
PGLITE_MODULE=/path/to/pglite/dist/index.js node tests/marketplace-saves-reviews.mjs
```

This covers save privacy and limits, alert rules and deduplication, turning alerts off, view counting, review eligibility (a quote alone isn't enough; the seller must reply), self-reviews, editing, direct-write denial, the public first-name-only list, the summary, reports and moderation, and insights totals. The existing marketplace, legacy and enquiry suites still pass.

I checked with live data in the browser, on a phone-sized screen and without changing anything: the product page (Save, WhatsApp, Facebook, copy link; Save sends signed-out visitors to login and back), the supplier page (Save supplier, share buttons, reviews section) and both pages' link-preview tags.

**Still to check after applying 065**, with test accounts: save a product and get an alert, request a quote and reply as the seller, leave and answer a review, report and hide it, and view insights.
