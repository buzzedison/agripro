import assert from "node:assert/strict";
import { createMarketplaceDatabase } from "./marketplace-fixture.mjs";
const owner = "00000000-0000-0000-0000-000000000097",
  reviewer = "00000000-0000-0000-0000-000000000098";
const db = await createMarketplaceDatabase(async (db) => {
  await db.exec(`INSERT INTO auth.users VALUES('${owner}','legacy@test.local'),('${reviewer}','reviewer@test.local');INSERT INTO profiles(id) SELECT id FROM auth.users;INSERT INTO admin_users VALUES('reviewer@test.local',true);
 INSERT INTO trade_vendors(user_id,business_name,owner_name,email,phone,business_type,product_description,status,is_verified,verification_level,verification_status)
 VALUES('${owner}','Legacy seller','Seller','legacy@example.invalid','000','grains','A legacy approved storefront','approved',true,'verified','not_submitted');
 INSERT INTO trade_vendors(user_id,business_name,owner_name,email,phone,business_type,product_description,status,is_verified,verification_level,verification_status,verified_by,verified_at,id_verified_at,id_document_url)
 VALUES('${reviewer}','Reviewed seller','Seller','reviewed@example.invalid','000','grains','A storefront with recorded review','approved',true,'verified','approved','${reviewer}',now(),now(),'recorded-path');`);
});
const rows = (
  await db.query(
    "SELECT business_name,status,is_verified,verification_level FROM trade_vendors ORDER BY business_name",
  )
).rows;
assert.deepEqual(rows, [
  {
    business_name: "Legacy seller",
    status: "approved",
    is_verified: false,
    verification_level: "basic",
  },
  {
    business_name: "Reviewed seller",
    status: "approved",
    is_verified: true,
    verification_level: "verified",
  },
]);
assert.equal(
  (
    await db.query(
      "SELECT count(*)::int n FROM trade_vendor_reviews WHERE action='verification_review_required'",
    )
  ).rows[0].n,
  1,
);
await db.exec("SET ROLE anon");
assert.equal(
  (await db.query("SELECT count(*)::int n FROM trade_vendors")).rows[0].n,
  2,
  "approved stores stay visible",
);
assert.equal(
  (await db.query("SELECT count(*)::int n FROM storage.objects")).rows[0].n,
  0,
);
await db.close();
console.log(
  "PASS: legacy migration preserves approved storefronts and recorded reviews while removing unsupported badges.",
);
