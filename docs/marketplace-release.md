# Marketplace repair release

## Activation

Apply `supabase/migrations/060_marketplace_security.sql`, then `supabase/migrations/061_marketplace_enquiries.sql` in Supabase SQL Editor after 059 and the existing trade migrations. Deploy the updated application after both succeed. Codex has not applied these migrations to the live database or deployed this release.

060 is a transaction containing the security fixes; 061 adds product enquiries to the private conversation system. Do not deploy the new enquiry/verification screens against the old schema.

## Security and approval changes

- Seller applications now require sign-in and begin pending. Moderators approve storefronts before listings become public. Sellers may prepare product listings while pending.
- Seller approval and identity verification are separate. Verification requires document review, an administrator decision, and a matching record version; changes since the reviewer loaded the documents reject the decision until refreshed.
- Database guards protect ownership, approval, badges, featured placement and reputation values. Admin trade API endpoints check admin membership explicitly.
- Legacy verification badges missing a complete recorded review are removed and queued for review in the audit table. **Approved storefronts stay approved and visible.** No legacy seller is automatically verified. Administrators should review the `verification_review_required` audit entries and request documents where needed. This is a consistency repair, not a forensic certification of historical data.
- Verification files remain private. Owners can upload/read their own vendor folder; reviewers can read and remove documents. Unrelated users cannot read, overwrite or delete them. Submitted evidence cannot be overwritten/deleted by its uploader. Views use five-minute signed links, never public URLs. File uploads accept JPEG, PNG, WebP and PDF up to 5MB.
- The old verification page redirects to the real upload flow instead of simulating success.
- Suspended/blocked accounts disappear from public discovery. Suspended/rejected sellers cannot publish/edit products or receive new quotes. Deleting an account also deletes its owned storefronts and products, rather than leaving ownerless public listings.
- Products can be reported through the existing moderation queue. Admins can remove products and moderate their authors. Ordinary sellers cannot change featured flags, transfer products, or change publication dates/URLs. New listings have field/image validation, a 15-second interval, a 30-per-hour limit and protected unique URL allocation.

## Marketplace experience

Products and Suppliers are separate tabs. Search, country, category, verified supplier, availability and price filters run before pagination. Price ranges require a currency. Filters and page numbers live in the URL. Failed requests show a retry state, unknown categories return zero matches, and punctuation is treated literally in search. Page sizes are bounded; all suppliers remain reachable, including featured sellers.

Product cards/detail screens show actual categories, currency/unit, minimum order and update date. Organic is labelled as seller-stated. The landing page no longer presents invented activity counts or an example supplier as live marketplace data.

The seller product dashboard now has a working route with add/edit/view/hide controls and an enquiry link. Minimum order quantities are editable. Pending sellers get an explicit notice that products remain private until approval.

## Product enquiries

A quote request records product, quantity, delivery location and a private message. One conversation per buyer/product prevents duplicate enquiries. Repeated requests reopen the existing thread. New quotes require an active, approved, linked seller and an available product, enforce the minimum order and share the ten-enquiries-per-hour limit with feed enquiries.

Product enquiries use My enquiries, private reply threads, report/block controls and notification preferences already introduced in 057–059. Only participants can read the conversation. Existing conversations can continue when a product goes out of stock; hidden products, closed enquiries, blocks or account restrictions pause replies. Sellers without a linked member account retain their phone/email contact route until their account is linked by an administrator.

New quote and status alerts respect preferences and deduplicate repeated status transitions. Reply alerts remain one per recipient/thread. This flow does not process payments or create orders. Account, storefront or product deletion cascades to its associated conversations.

## Validation and remaining rollout checks

- `tests/marketplace.mjs`: isolated database security, scoped documents, protected seller fields, approval/verification, private quotes, replies, blocks, seller suspension/deletion, and compatibility with feed conversations.
- `tests/marketplace-legacy.mjs`: migration behavior for unsupported legacy badges and complete review records, preserving approved storefronts.
- `tests/marketplace-api.mjs`: read-only tests against a running local app for punctuation, pagination, verified filtering, nonexistent categories, request bounds, currency validation and anonymous admin denial.
- Existing moderation/community/practical feed/preferences/conversation regression suites remain applicable.
- Browser checks cover product/supplier browsing, second-page sellers, the correct product category, and mobile marketplace/quote layout without horizontal overflow.

No real vendor application, quote, message, upload or moderation decision was submitted during testing. After migration/deployment, exercise one authorized seller review and quote/reply flow using designated test accounts to verify the deployed Supabase schema and Storage service together.
