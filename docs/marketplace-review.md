# Marketplace review — 29 September 2026

## Verdict and scope

Green Market works as a supplier directory with product detail pages and phone/email contact. It is not yet a complete buyer-to-seller marketplace workflow. Reviewed repository code, public API responses from the local app using its configured database, and actual marketplace/product screens. No real applications, messages, uploads, purchases or account changes were submitted. Listing creation/editing and seller onboarding were inspected in code, not completed against live accounts.

The database permission findings below were reproduced in an isolated PGlite database using repository migrations, not by attempting changes in production. The deployed policies still need comparison against the repository.

## Fix first

1. **P1 — Sellers can control their own trust fields.** Migration 005 gives owners UPDATE access to their whole vendor record and unrestricted INSERT policy access. No later checked-in vendor trigger protects status, verification, featured flags or rating. With migrations 005/010/011/024/025 applied, an ordinary owner successfully changed their record to approved, verified, premium, featured and five-star in isolation. The admin vendor PATCH route checks only sign-in, not admin membership. Protect these fields at the database boundary; restrict approval actions to admins; derive rating from legitimate reviews.
   - `supabase/migrations/005_create_trade_tables.sql:142`
   - `app/api/admin/trade/vendors/route.ts:68`

2. **P1 — Verification-document policies are too broad.** Migration 023 permits every authenticated account to read and delete any object in the vendor-documents bucket. An isolated unrelated-account test could read and delete another user's file record. Restrict access to the uploader's directory and authorized reviewers, and protect replacement/deletion rules.
   - `supabase/migrations/023_create_vendor_documents_bucket.sql:14`

3. **P2 — Sellers are missing from browsing.** Public vendor API returned 29 sellers over three pages; the screen requests only the first 12 and ignores pagination. Verified filtering runs after that first page is fetched. Featured vendors beyond the first four are excluded from both the spotlight and regular list. Add server-side filters and accessible pagination/load-more, with accurate totals and stable ordering.
   - `app/greenmarket/marketplace/page.tsx:104`
   - `app/greenmarket/marketplace/page.tsx:133`

4. **P2 — Search/filter failures are hidden.** Searching `maize,beans` returned HTTP 500 due to direct interpolation into the filter expression. An unknown product category returned all 43 products rather than zero matches. The marketplace has no visible failure/retry state and can retain stale results; overlapping searches are not cancelled. Escape search input, bound page sizes, handle unknown categories explicitly, and show errors separately from empty results.
   - `app/api/trade/vendors/route.ts:26`
   - `app/api/trade/products/route.ts:63`

5. **P2 — Contact path does not open a conversation.** “Connect & message” opens the general member directory with a vendor query parameter; the directory does not consume that parameter. Product detail pages offer call/email but no product-linked enquiry. Connect the seller's account to a private product enquiry, preserving product, requested quantity, delivery destination and negotiation history.
   - `app/greenmarket/marketplace/page.tsx:510`
   - `app/connect/directory/page.tsx`

6. **P2 — Verification state is inconsistent.** Public visibility checks status plus verification_status (025), but the admin approval endpoint updates status/is_verified without updating verification_status. Migration 024 adds verification_status with a non-null default before backfilling only NULL rows, so its intended legacy backfill skips existing rows assigned that default. Review deployed state before changing data; establish one authoritative approval flow and clear pending/rejected explanations.

## Product and UI improvements

- Put **Products** and **Suppliers** tabs at the top. The present marketplace is seller-first even though the public product API returned 43 products.
- Product cards should show image, commodity, price and currency per unit, minimum order, location, availability, last updated date and a clear **Request quote** button.
- Add country/region, commodity, stock and price filters. Preserve filters in the URL and apply them before pagination.
- Show actual categories. The product detail screen currently hardcodes “Eco Goods”, confirmed on a frozen artichoke listing.
- Add saved products/suppliers and opted-in alerts for relevant stock or price changes after discovery and enquiries work reliably.
- Make verification badges explain what was checked and when; identify organic claims as seller-provided unless reviewed. Show response time only once it is measured.
- Remove unsupported marketing counters and refresh claims. The landing page contains hardcoded marketplace statistics; the marketplace says listings update hourly without corresponding refresh behavior in this screen.
- Extend spam reports, seller suspension and moderation to trade listings explicitly. The recently added feed protections and enquiry system target feed tables, not trade_products/trade_vendors.

## Recommended order

1. Secure seller approval and verification documents; reconcile verification state.
2. Repair search, filters, pagination and error states.
3. Add product-first browsing and product-linked private enquiries.
4. Add saves, availability alerts and evidence-based seller reputation.
5. Consider checkout/order tracking only after the enquiry workflow is dependable.

## Confirmed working

- Marketplace shell and seller results render.
- Public vendor and category API endpoints return successful responses.
- Public product endpoint returns 43 products in the inspected database.
- A real product detail page renders its image, price, currency/unit, stock status, description, vendor link and call/email links.
- Existing seller/product creation and edit screens/actions are present, but live write workflows were not exercised during this review.
