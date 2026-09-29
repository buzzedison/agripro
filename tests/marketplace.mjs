import assert from "node:assert/strict";
import { createMarketplaceDatabase } from "./marketplace-fixture.mjs";
const db = await createMarketplaceDatabase();
const seller = "00000000-0000-0000-0000-000000000091",
  buyer = "00000000-0000-0000-0000-000000000092",
  other = "00000000-0000-0000-0000-000000000093",
  admin = "00000000-0000-0000-0000-000000000094";
await db.exec(
  `INSERT INTO auth.users VALUES('${seller}','seller@test.local'),('${buyer}','buyer@test.local'),('${other}','other@test.local'),('${admin}','admin@test.local');INSERT INTO profiles(id) SELECT id FROM auth.users;INSERT INTO admin_users VALUES('admin@test.local',true);`,
);
async function as(id) {
  await db.exec(
    `RESET ROLE;SET request.uid='${id}';SET request.email='${id === admin ? "admin@test.local" : "member@test.local"}';SET ROLE authenticated`,
  );
}
async function root(sql) {
  await db.exec("RESET ROLE");
  return db.exec(sql);
}
async function age() {
  await root(
    "UPDATE feed_enquiry_messages SET created_at=created_at-interval '6 seconds'",
  );
}
let sequence = 200;
const key = () =>
  `00000000-0000-0000-0000-${String(++sequence).padStart(12, "0")}`;
const n = async (sql) => (await db.query(sql)).rows[0].n;
await as(seller);
const vendor = (
  await db.query(
    `INSERT INTO trade_vendors(user_id,business_name,owner_name,email,phone,business_type,product_description,status,is_verified,verification_status,rating,is_featured) VALUES($1,'Audit farm','Seller','seller@example.invalid','000','grains','Quality maize for local delivery','approved',true,'approved',5,true) RETURNING *`,
    [seller],
  )
).rows[0];
assert.equal(vendor.status, "pending");
assert.equal(vendor.is_verified, false);
assert.equal(Number(vendor.rating), 0);
assert.equal(vendor.is_featured, false);
for (const sql of [
  "status='approved'",
  "is_verified=true",
  "verification_status='approved'",
  "rating=5",
  "verification_level='premium'",
  "is_featured=true",
]) {
  await assert.rejects(
    () => db.query(`UPDATE trade_vendors SET ${sql} WHERE id=$1`, [vendor.id]),
    /Only moderators|Submit an identity/,
  );
}
await db.query(
  "UPDATE trade_vendors SET business_name='Audit farm renamed' WHERE id=$1",
  [vendor.id],
);
await db.query(
  "INSERT INTO storage.objects(bucket_id,name) VALUES('vendor-documents',$1)",
  [vendor.id + "/id/identity.pdf"],
);
await db.query(
  "UPDATE trade_vendors SET id_document_url=$2,id_document_type='passport',verification_status='pending_review',verification_submitted_at=now() WHERE id=$1",
  [vendor.id, vendor.id + "/id/identity.pdf"],
);
await as(buyer);
assert.equal(await n("SELECT count(*)::int n FROM storage.objects"), 0);
assert.equal(
  (await db.query("DELETE FROM storage.objects RETURNING id")).rows.length,
  0,
);
await assert.rejects(
  () =>
    db.query(
      "INSERT INTO storage.objects(bucket_id,name) VALUES('vendor-documents',$1)",
      [vendor.id + "/id/forged.pdf"],
    ),
  /row-level security/,
);
await assert.rejects(
  () => db.query("SELECT review_trade_vendor($1,'approved',true)", [vendor.id]),
  /Administrator/,
);
await as(admin);
assert.equal(await n("SELECT count(*)::int n FROM storage.objects"), 1);
await db.query(
  "SELECT review_trade_vendor($1,'approved',true,'Identity reviewed',NULL,(SELECT updated_at FROM trade_vendors WHERE id=$1))",
  [vendor.id],
);
assert.equal(
  (
    await db.query(
      "SELECT verification_status FROM trade_vendors WHERE id=$1",
      [vendor.id],
    )
  ).rows[0].verification_status,
  "approved",
);
assert.equal(await n("SELECT count(*)::int n FROM trade_vendor_reviews"), 1);
await as(seller);
await assert.rejects(
  () =>
    db.query(
      "UPDATE trade_vendors SET verification_status='pending_review',id_document_url=$2 WHERE id=$1",
      [vendor.id, vendor.id + "/id/identity.pdf"],
    ),
  /replace approved/,
);
assert.equal(
  (await db.query("DELETE FROM storage.objects RETURNING id")).rows.length,
  0,
  "submitted documents cannot be deleted by owner",
);
const product = (
  await db.query(
    "INSERT INTO trade_products(vendor_id,name,description,price,currency,unit,min_order_quantity,images,slug) VALUES($1,'Maize bags','Available for collection this week',100,'GHS','bags',5,ARRAY['https://example.invalid/maize.jpg'],'audit-maize') RETURNING *",
    [vendor.id],
  )
).rows[0];
await db.exec("RESET ROLE;SET ROLE anon");
assert.equal(await n("SELECT count(*)::int n FROM trade_products"), 1);
await as(buyer);
await assert.rejects(
  () =>
    db.query("SELECT request_product_quote($1,1,$2,$3)", [
      product.id,
      "Accra, Ghana",
      "Please confirm the delivery cost.",
    ]),
  /minimum order/,
);
const enquiry = (
  await db.query("SELECT request_product_quote($1,10,$2,$3) id", [
    product.id,
    "Accra, Ghana",
    "Please confirm the delivery cost.",
  ])
).rows[0].id;
assert.equal(
  (
    await db.query("SELECT request_product_quote($1,10,$2,$3) id", [
      product.id,
      "Accra, Ghana",
      "Please confirm the delivery cost.",
    ])
  ).rows[0].id,
  enquiry,
);
assert.equal(
  (await db.query("SELECT * FROM read_enquiry_messages($1)", [enquiry])).rows
    .length,
  1,
);
const info = (
  await db.query("SELECT * FROM enquiry_conversation_v2($1)", [enquiry])
).rows[0];
assert.equal(info.target_url, "/greenmarket/products/audit-maize");
assert.equal(info.other_user_id, seller);
await as(other);
assert.equal(await n("SELECT count(*)::int n FROM feed_enquiries"), 0);
assert.equal(await n("SELECT count(*)::int n FROM feed_enquiry_messages"), 0);
assert.equal(
  (await db.query("SELECT * FROM my_enquiry_conversations()")).rows.length,
  0,
);
await assert.rejects(
  () => db.query("SELECT enquiry_conversation_v2($1)", [enquiry]),
  /unavailable/,
);
await as(seller);
assert.equal(
  (await db.query("SELECT * FROM my_enquiry_conversations()")).rows.length,
  1,
);
assert.equal(
  await n("SELECT count(*)::int n FROM notifications WHERE type='enquiry'"),
  1,
);
await db.query("SELECT send_enquiry_reply($1,$2,$3)", [
  enquiry,
  "Delivery to Accra is available.",
  key(),
]);
await as(buyer);
assert.equal(
  await n(
    "SELECT count(*)::int n FROM notifications WHERE type='enquiry_reply'",
  ),
  1,
);
await assert.rejects(
  () => db.query("SELECT update_feed_enquiry($1,'closed')", [enquiry]),
  /Only the seller/,
);
await db.query("INSERT INTO user_blocks(blocker_id,blocked_id) VALUES($1,$2)", [
  buyer,
  seller,
]);
await age();
await as(seller);
await assert.rejects(
  () =>
    db.query("SELECT send_enquiry_reply($1,$2,$3)", [
      enquiry,
      "Blocked reply should fail",
      key(),
    ]),
  /unavailable/,
);
await root("DELETE FROM user_blocks");
await as(admin);
await db.query("SELECT review_trade_vendor($1,'suspended',false)", [vendor.id]);
await as(buyer);
assert.equal(
  (await db.query("SELECT * FROM enquiry_conversation_v2($1)", [enquiry]))
    .rows[0].can_reply,
  false,
);
await assert.rejects(
  () =>
    db.query("SELECT send_enquiry_reply($1,$2,$3)", [
      enquiry,
      "Suspended vendor reply",
      key(),
    ]),
  /closed or paused/,
);
await as(seller);
await assert.rejects(
  () =>
    db.query("UPDATE trade_products SET price=50 WHERE id=$1", [product.id]),
  /Active seller/,
);
await as(admin);
await db.query("SELECT review_trade_vendor($1,'approved',false)", [vendor.id]);
await as(seller);
await db.query(
  "UPDATE trade_products SET stock_status='out_of_stock' WHERE id=$1",
  [product.id],
);
await as(other);
await assert.rejects(
  () =>
    db.query("SELECT request_product_quote($1,10,$2,$3)", [
      product.id,
      "Accra, Ghana",
      "Please send a quotation for collection.",
    ]),
  /not currently available/,
);
await age();
await as(buyer);
await db.query("SELECT send_enquiry_reply($1,$2,$3)", [
  enquiry,
  "Following up on our existing order enquiry.",
  key(),
]);
// Feed conversations still work after generalising enquiry ownership.
await root(
  `INSERT INTO posts(user_id,content,post_kind,post_details,country) VALUES('${seller}','Selling a different harvest','listing','{"title":"Cassava available now","location":"Accra","commodity":"Cassava","listing_type":"sell","quantity":"20","unit":"bags","currency":"GHS","available_from":"2098-01-01","deadline":"2099-01-01"}','Ghana');`,
);
const post = (await db.query("SELECT id FROM posts")).rows[0].id;
await as(buyer);
await db.query("SELECT send_feed_enquiry($1,$2)", [
  post,
  "Please confirm the collection arrangements.",
]);
const feedEnquiry = (
  await db.query("SELECT id FROM feed_enquiries WHERE post_id=$1", [post])
).rows[0].id;
await age();
await as(seller);
await db.query("SELECT send_enquiry_reply($1,$2,$3)", [
  feedEnquiry,
  "Collection is available this weekend.",
  key(),
]);
assert.equal(
  (await db.query("SELECT * FROM enquiry_conversation_v2($1)", [feedEnquiry]))
    .rows[0].target_url,
  "/feed/post/" + post,
);
await as(admin);
await root(`DELETE FROM auth.users WHERE id='${seller}'`);
await root("");
assert.equal(
  await n("SELECT count(*)::int n FROM trade_products"),
  0,
  "deleted seller leaves no orphaned public listings",
);
assert.equal(await n("SELECT count(*)::int n FROM trade_vendors"), 0);
await db.close();
console.log(
  "PASS: marketplace approval, document privacy, guarded listings, private quotes, replies, blocks, suspension and feed compatibility.",
);
