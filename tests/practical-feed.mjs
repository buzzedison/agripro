import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase } from "./feed-fixture.mjs";
const db = await createTestDatabase(true);
const admin = "00000000-0000-0000-0000-000000000021",
  author = "00000000-0000-0000-0000-000000000022",
  buyer = "00000000-0000-0000-0000-000000000023",
  other = "00000000-0000-0000-0000-000000000024";
await db.exec(
  `INSERT INTO auth.users VALUES('${admin}','admin@test.local'),('${author}','author@test.local'),('${buyer}','buyer@test.local'),('${other}','other@test.local');INSERT INTO profiles(id,country) SELECT id,'Ghana' FROM auth.users;INSERT INTO admin_users VALUES('admin@test.local',true);INSERT INTO posts(user_id,content) VALUES('${author}','Existing post one');UPDATE feed_submission_log SET submitted_at=now()-interval '1 minute';INSERT INTO posts(user_id,content) VALUES('${author}','Existing post two');`,
);
await db.exec(
  await readFile(
    new URL(
      "../supabase/migrations/057_practical_feed_posts.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
assert.equal(
  (await db.query("SELECT count(*)::int n FROM posts")).rows[0].n,
  2,
);
assert.equal(
  (await db.query("SELECT count(*)::int n FROM feed_submission_log")).rows[0].n,
  2,
);
async function as(id) {
  await db.exec(
    `RESET ROLE; SET request.uid='${id}'; SET request.email='${id === admin ? "admin" : id === author ? "author" : id === buyer ? "buyer" : "other"}@test.local'; SET ROLE authenticated`,
  );
}
async function root(sql) {
  await db.exec("RESET ROLE");
  return db.exec(sql);
}
async function age(id = author) {
  await root(
    "UPDATE feed_submission_log SET submitted_at=submitted_at-interval '1 minute'",
  );
  await as(id);
}
async function rejects(query, params, pattern) {
  await assert.rejects(() => db.query(query, params), pattern);
}
async function insert(kind, details, who = author, content = "") {
  return (
    await db.query(
      "INSERT INTO posts(user_id,content,post_kind,post_details,country) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [who, content, kind, JSON.stringify(details), "Ghana"],
    )
  ).rows[0];
}
const future = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
  today = new Date().toISOString().slice(0, 10);
const listing = {
  title: "Maize available in Tamale",
  location: "Tamale",
  listing_type: "sell",
  commodity: "Maize",
  quantity: "500",
  unit: "kg",
  currency: "GHS",
  price: "15",
  available_from: today,
  deadline: future,
};
await age();
await rejects(
  "INSERT INTO posts(user_id,content,post_kind,post_details) VALUES($1,$2,$3,$4)",
  [author, "", "listing", "{}"],
  /title/,
);
const question = await insert("question", {
  title: "How can I prevent leaf wilt?",
  location: "Tamale",
  crop: "Tomatoes",
});
assert.equal(question.topic, "questions");
await age();
const offer = await insert("listing", listing);
assert.equal(offer.topic, "markets");
await root(await readFile(new URL('../supabase/repair_feed_submission_guard.sql', import.meta.url), 'utf8'));
await as(author);
assert.ok(offer.expires_at);
await rejects(
  "UPDATE posts SET post_details=$1 WHERE id=$2",
  [JSON.stringify({ ...listing, price: "18" }), offer.id],
  /15 seconds/,
);
await age();
await db.query("UPDATE posts SET post_details=$1 WHERE id=$2", [
  JSON.stringify({ ...listing, price: "18" }),
  offer.id,
]);
await age();
await rejects(
  "UPDATE posts SET post_details=$1 WHERE id=$2",
  [JSON.stringify({ ...listing, price: "0" }), offer.id],
  /Price/,
);
await rejects(
  "UPDATE posts SET post_kind=$1 WHERE id=$2",
  ["update", offer.id],
  /cannot be changed/,
);
const opportunity = await insert("opportunity", {
  title: "Farm training programme",
  location: "Accra",
  opportunity_type: "training",
  eligibility: "Open to smallholder farmers in Ghana.",
  deadline: future,
  url: "https://example.test/apply",
});
assert.equal(opportunity.moderation_status, "published");
await age(other);
const held = await insert(
  "opportunity",
  {
    title: "Funding for farm founders",
    location: "Kumasi",
    opportunity_type: "funding",
    eligibility: "For farmers starting a registered business.",
    deadline: future,
    url: "https://example.test/funding",
  },
  other,
);
assert.equal(held.moderation_status, "pending");
await age(other);
await rejects(
  "UPDATE posts SET post_details=$1 WHERE id=$2",
  [
    JSON.stringify({ ...held.post_details, url: "javascript:alert(1)" }),
    held.id,
  ],
  /application link/,
);
await as(buyer);
await db.query("SELECT send_feed_enquiry($1,$2)", [
  offer.id,
  "I need 200 kg delivered to Accra. Please contact me through my profile.",
]);
const enquiry = (await db.query("SELECT * FROM feed_enquiries")).rows[0];
assert.ok(enquiry);
await rejects(
  "SELECT send_feed_enquiry($1,$2)",
  [offer.id, "I would like to send a duplicate enquiry for this maize."],
  /already sent/,
);
await rejects(
  "SELECT send_feed_enquiry($1,$2)",
  [held.id, "Please send further information about this funding programme."],
  /not accepting/,
);
await rejects(
  "SELECT update_feed_enquiry($1,$2)",
  [enquiry.id, "contacted"],
  /Only the post author/,
);
await as(other);
assert.equal((await db.query("SELECT * FROM feed_enquiries")).rows.length, 0);
await as(author);
assert.equal((await db.query("SELECT * FROM feed_enquiries")).rows.length, 1);
await db.query("SELECT update_feed_enquiry($1,$2)", [enquiry.id, "contacted"]);
await db.query("SELECT close_feed_post($1,true)", [offer.id]);
assert.equal(
  (
    await db.query(
      "SELECT * FROM discover_feed_v2(20,0,NULL,NULL,false,NULL,'listing',false)",
    )
  ).rows.length,
  0,
);
assert.equal(
  (
    await db.query(
      "SELECT * FROM discover_feed_v2(20,0,NULL,NULL,false,NULL,'listing',true)",
    )
  ).rows.length,
  1,
);
await as(other);
await rejects(
  "SELECT send_feed_enquiry($1,$2)",
  [offer.id, "Please send pricing and delivery details for your maize."],
  /not accepting/,
);
await as(author);
await db.query("SELECT close_feed_post($1,false)", [offer.id]);
await as(buyer);
const answer = (
  await db.query(
    "INSERT INTO post_comments(post_id,user_id,content) VALUES($1,$2,$3) RETURNING *",
    [
      question.id,
      buyer,
      "Check drainage and inspect roots before changing irrigation.",
    ],
  )
).rows[0];
await rejects(
  "SELECT accept_feed_answer($1,$2)",
  [question.id, answer.id],
  /Only the author/,
);
await as(author);
await db.query("SELECT accept_feed_answer($1,$2)", [question.id, answer.id]);
assert.equal(
  (await db.query("SELECT * FROM feed_accepted_answers")).rows[0].comment_id,
  answer.id,
);
await rejects(
  "SELECT accept_feed_answer($1,$2)",
  [offer.id, answer.id],
  /published question/,
);
await age(buyer);
await db.query("UPDATE post_comments SET content=$1 WHERE id=$2", ["Updated advice: check root health and drainage first.", answer.id]);
assert.equal((await db.query("SELECT * FROM feed_accepted_answers")).rows.length, 0);
await as(author);
await db.query("SELECT accept_feed_answer($1,$2)", [question.id, answer.id]);
await as(buyer);
await db.query("DELETE FROM post_comments WHERE id=$1", [answer.id]);
assert.equal(
  (await db.query("SELECT * FROM feed_accepted_answers")).rows.length,
  0,
);
await root(
  `ALTER TABLE posts DISABLE TRIGGER a_validate_practical_post; UPDATE posts SET expires_at=now()-interval '1 second' WHERE id='${opportunity.id}'; ALTER TABLE posts ENABLE TRIGGER a_validate_practical_post;`,
);
await as(buyer);
assert.equal(
  (
    await db.query(
      "SELECT * FROM discover_feed_v2(20,0,NULL,NULL,false,NULL,'opportunity',false)",
    )
  ).rows.length,
  0,
);
await rejects(
  "SELECT send_feed_enquiry($1,$2)",
  [opportunity.id, "I would like details about the training programme."],
  /not accepting/,
);
await as(admin);
await db.query("SELECT moderate_feed_user($1,$2,$3,$4)", [
  buyer,
  "block",
  "Spam enquiries reported by members",
  7,
]);
await as(buyer);
await rejects(
  "SELECT send_feed_enquiry($1,$2)",
  [offer.id, "Please send details about your available maize."],
  /restricted/,
);
await db.close();
console.log(
  "PASS: populated migration, structured validation, field-edit rate limits, early-post review, private enquiries, owner-only follow-up, expiry/filtering, and accepted answers.",
);
