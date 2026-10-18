import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMarketplaceDatabase } from "./marketplace-fixture.mjs";

const db = await createMarketplaceDatabase();
await db.exec(await readFile(new URL("../supabase/migrations/065_marketplace_saves_reviews_insights.sql", import.meta.url), "utf8"));
await db.exec(await readFile(new URL("../supabase/migrations/065_marketplace_saves_reviews_insights.sql", import.meta.url), "utf8")); // rerun-safe

const seller = "00000000-0000-0000-0000-0000000000c1",
  buyer = "00000000-0000-0000-0000-0000000000c2",
  other = "00000000-0000-0000-0000-0000000000c3",
  admin = "00000000-0000-0000-0000-0000000000c4";
await db.exec(`INSERT INTO auth.users VALUES('${seller}','s@test.local'),('${buyer}','b@test.local'),('${other}','o@test.local'),('${admin}','admin@test.local');
INSERT INTO profiles(id,full_name,country) VALUES('${seller}','Seller One','Ghana'),('${buyer}','Ama Buyer','Ghana'),('${other}','Kofi Other','Ghana'),('${admin}','Admin','Ghana');
INSERT INTO admin_users VALUES('admin@test.local',true);`);
const as = (id) => db.exec(`RESET ROLE;SET request.uid='${id}';SET request.email='${id === admin ? "admin@test.local" : "member@test.local"}';SET ROLE authenticated`);
const anon = () => db.exec("RESET ROLE;SET request.uid='';SET request.email='';SET ROLE anon");
const root = () => db.exec("RESET ROLE");
const n = async (sql, params) => (await db.query(sql, params)).rows[0].n;
const ageListings = () => db.exec("RESET ROLE; UPDATE trade_listing_log SET submitted_at=submitted_at-interval '1 minute'");
let seq = 500;
const key = () => `00000000-0000-0000-0000-${String(++seq).padStart(12, "0")}`;

// Approved seller with one product, a buyer quote and a seller reply.
await as(seller);
const vendor = (await db.query("INSERT INTO trade_vendors(user_id,business_name,owner_name,email,phone,business_type,product_description) VALUES($1,'Green Valley Farm','Seller','s@example.invalid','000','grains','Quality maize for local delivery') RETURNING id", [seller])).rows[0].id;
await as(admin);
await db.query("SELECT review_trade_vendor($1,'approved',false)", [vendor]);
await as(seller);
const product = (await db.query("INSERT INTO trade_products(vendor_id,name,description,price,currency,unit,min_order_quantity,images,slug,stock_status) VALUES($1,'Yellow maize','Dried and bagged, ready to collect',100,'GHS','bags',5,ARRAY['https://example.invalid/m.jpg'],'yellow-maize','out_of_stock') RETURNING id", [vendor])).rows[0].id;

// ── Saves ──
await as(buyer);
await db.query("INSERT INTO trade_saved_items(user_id,product_id) VALUES($1,$2)", [buyer, product]);
await db.query("INSERT INTO trade_saved_items(user_id,vendor_id) VALUES($1,$2)", [buyer, vendor]);
await assert.rejects(() => db.query("INSERT INTO trade_saved_items(user_id,product_id) VALUES($1,$2)", [buyer, product]), /duplicate key|unique/i);
await assert.rejects(() => db.query("INSERT INTO trade_saved_items(user_id,product_id) VALUES($1,$2)", [other, product]), /row-level security/i);
await assert.rejects(() => db.query("INSERT INTO trade_saved_items(user_id,product_id,vendor_id) VALUES($1,$2,$3)", [buyer, product, vendor]), /saved_one_target/);
await assert.rejects(() => db.query("UPDATE trade_saved_items SET product_id=NULL, vendor_id=$1 WHERE product_id=$2", [vendor, product]), /alert setting/);
await as(other);
assert.equal(await n("SELECT count(*)::int n FROM trade_saved_items"), 0, "saves are private");
await anon();
await assert.rejects(() => db.query("SELECT count(*) FROM trade_saved_items"), /permission denied/);

// ── Alerts: restock and price drop notify the saver once a day; new listings notify supplier followers ──
await as(seller);
await db.query("UPDATE trade_products SET stock_status='in_stock' WHERE id=$1", [product]);
await db.query("UPDATE trade_products SET price=90 WHERE id=$1", [product]); // same day → deduplicated
await ageListings();
await as(seller);
const product2 = (await db.query("INSERT INTO trade_products(vendor_id,name,description,price,currency,unit,min_order_quantity,images,slug) VALUES($1,'White maize','Fresh harvest, bagged',120,'GHS','bags',5,ARRAY['https://example.invalid/w.jpg'],'white-maize') RETURNING id", [vendor])).rows[0].id;
await as(buyer);
assert.deepEqual((await db.query("SELECT message FROM notifications WHERE type='saved_item_update' ORDER BY created_at, message")).rows.map((r) => r.message).sort(),
  ["Green Valley Farm listed a new product: White maize", "Yellow maize is back in stock"]);
await assert.rejects(() => db.query("INSERT INTO notifications(user_id,actor_id,type,message) VALUES($1,$2,'saved_item_update','fake')", [buyer, buyer]), /row-level security/i);
// Turning off alerts on a saved item stops them.
await db.query("UPDATE trade_saved_items SET notify=false WHERE product_id=$1", [product2]).catch(() => {});
await db.query("UPDATE trade_saved_items SET notify=false WHERE product_id=$1", [product]);
await root();
await db.query("DELETE FROM notifications WHERE type='saved_item_update'");
await as(seller);
await db.query("UPDATE trade_products SET stock_status='out_of_stock' WHERE id=$1", [product]);
await db.query("UPDATE trade_products SET stock_status='in_stock' WHERE id=$1", [product]);
await root();
assert.equal(await n("SELECT count(*)::int n FROM notifications WHERE type='saved_item_update' AND user_id=$1", [buyer]), 0);

// ── Views: counted for visitors, not for the seller ──
await anon();
await db.query("SELECT record_product_view($1)", [product]);
await as(buyer);
await db.query("SELECT record_product_view($1)", [product]);
await as(seller);
await db.query("SELECT record_product_view($1)", [product]);
await root();
assert.equal(await n("SELECT sum(views)::int n FROM trade_product_views"), 2);
await as(buyer);
await assert.rejects(() => db.query("SELECT * FROM trade_product_views"), /permission denied/);

// ── Reviews need a quote conversation the seller replied to ──
await as(buyer);
assert.equal((await db.query("SELECT * FROM my_trade_review_status($1)", [vendor])).rows[0].eligible, false);
await assert.rejects(() => db.query("SELECT submit_trade_review($1,5,$2,true)", [vendor, "Great supplier, delivered on time."]), /Reviews open after/);
const enquiry = (await db.query("SELECT request_product_quote($1,10,$2,$3) id", [product, "Accra, Ghana", "Please confirm the delivery cost."])).rows[0].id;
await assert.rejects(() => db.query("SELECT submit_trade_review($1,5,$2,true)", [vendor, "Great supplier, delivered on time."]), /Reviews open after/, "a quote alone is not enough");
await as(seller);
await db.query("SELECT send_enquiry_reply($1,$2,$3)", [enquiry, "Delivery to Accra is available tomorrow.", key()]);
await assert.rejects(() => db.query("SELECT submit_trade_review($1,5,$2,true)", [vendor, "My own farm is the best supplier."]), /own business/);
await as(buyer);
assert.equal((await db.query("SELECT * FROM my_trade_review_status($1)", [vendor])).rows[0].eligible, true);
await assert.rejects(() => db.query("SELECT submit_trade_review($1,6,$2,true)", [vendor, "Great supplier, delivered on time."]), /1 to 5/);
await assert.rejects(() => db.query("SELECT submit_trade_review($1,5,'Good',true)", [vendor]), /20/);
const review = (await db.query("SELECT submit_trade_review($1,4,$2,true) id", [vendor, "Good maize, clear communication and fair price."])).rows[0].id;
// Editing keeps one review per buyer.
assert.equal((await db.query("SELECT submit_trade_review($1,5,$2,true) id", [vendor, "Good maize, clear communication and fair price. Delivered."])).rows[0].id, review);
await assert.rejects(() => db.query("INSERT INTO trade_reviews(vendor_id,buyer_id,rating,body) VALUES($1,$2,5,'Direct insert should not work at all')", [vendor, buyer]), /permission denied/);
await as(other);
await assert.rejects(() => db.query("SELECT submit_trade_review($1,1,$2,false)", [vendor, "Never traded with them but here is a bad review."]), /Reviews open after/);
await assert.rejects(() => db.query("SELECT respond_trade_review($1,'Not my review')", [review]), /Only the supplier/);
await as(seller);
assert.equal(await n("SELECT count(*)::int n FROM notifications WHERE type='new_review'"), 1, "seller notified once, not on edit");
await db.query("SELECT respond_trade_review($1,'Thank you, Ama!')", [review]);
assert.equal((await db.query("SELECT * FROM my_vendor_reviews()")).rows.length, 1);

// Public reading: first name only, summary computed, reputation columns untouched.
await anon();
const pub = (await db.query("SELECT * FROM vendor_reviews($1)", [vendor])).rows;
assert.equal(pub.length, 1);
assert.equal(pub[0].reviewer, "Ama");
assert.equal(pub[0].product_name, "Yellow maize");
assert.equal(pub[0].seller_response, "Thank you, Ama!");
assert.equal(pub[0].buyer_id, undefined, "buyer id is not exposed");
const summary = (await db.query("SELECT * FROM vendor_review_summary($1)", [[vendor]])).rows[0];
assert.equal(Number(summary.average), 5);
assert.equal(summary.total, 1);
assert.equal(summary.would_trade_again_pct, 100);
await root();
assert.equal(Number((await db.query("SELECT rating FROM trade_vendors WHERE id=$1", [vendor])).rows[0].rating), 0);

// Reports and moderation.
await as(other);
await db.query("INSERT INTO content_reports(reporter_id,target_type,target_id,reason) VALUES($1,'trade_review',$2,'spam')", [other, review]);
await assert.rejects(() => db.query("SELECT moderate_trade_review($1,true,'spam')", [review]), /Administrator/);
await as(admin);
await db.query("SELECT moderate_trade_review($1,true,'Not a genuine trade')", [review]);
await anon();
assert.equal((await db.query("SELECT * FROM vendor_reviews($1)", [vendor])).rows.length, 0);
assert.equal((await db.query("SELECT * FROM vendor_review_summary($1)", [[vendor]])).rows.length, 0);
await as(buyer);
await assert.rejects(() => db.query("SELECT submit_trade_review($1,5,$2,true)", [vendor, "Trying to edit a hidden review again."]), /moderator removed/);
assert.equal((await db.query("SELECT * FROM my_trade_review_status($1)", [vendor])).rows[0].hidden, true);

// ── Seller insights ──
await as(seller);
const insights = (await db.query("SELECT vendor_insights(30) j")).rows[0].j;
assert.equal(insights.totals.views, 2);
assert.equal(insights.totals.enquiries, 1);
assert.equal(insights.totals.replied, 1);
assert.equal(insights.totals.replied_within_day, 1);
assert.equal(insights.totals.supplier_saves, 1);
assert.equal(insights.totals.product_saves, 1);
assert.equal(insights.products.length, 2);
assert.equal(insights.products[0].name, "Yellow maize");
assert.ok(insights.daily.length >= 30);
await as(buyer);
await assert.rejects(() => db.query("SELECT vendor_insights(30)"), /seller profile/);

console.log("marketplace saves, alerts, views, reviews and insights checks passed");
