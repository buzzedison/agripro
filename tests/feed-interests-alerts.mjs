import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase } from "./feed-fixture.mjs";
const db = await createTestDatabase(true);
const a = "00000000-0000-0000-0000-000000000081",
  b = "00000000-0000-0000-0000-000000000082",
  c = "00000000-0000-0000-0000-000000000083";
await db.exec(`INSERT INTO auth.users VALUES('${a}','a@test.local'),('${b}','b@test.local'),('${c}','c@test.local'); INSERT INTO profiles(id) SELECT id FROM auth.users;
CREATE TABLE notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES auth.users,actor_id uuid NOT NULL REFERENCES auth.users,type text NOT NULL CHECK(type IN ('mention','like','comment','repost','follow','connection_request','connection_accepted')),post_id uuid REFERENCES posts ON DELETE CASCADE,comment_id uuid REFERENCES post_comments ON DELETE CASCADE,message text NOT NULL,read boolean DEFAULT false,created_at timestamptz DEFAULT now());
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY; GRANT ALL ON notifications TO authenticated;
CREATE POLICY own_read ON notifications FOR SELECT USING(user_id=auth.uid());CREATE POLICY own_delete ON notifications FOR DELETE USING(user_id=auth.uid());CREATE POLICY system_insert ON notifications FOR INSERT WITH CHECK(true);`);
for (const f of [
  "057_practical_feed_posts.sql",
  "058_feed_interests_and_alerts.sql",
])
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/" + f, import.meta.url),
      "utf8",
    ),
  );
async function as(id) {
  await db.exec(`RESET ROLE; SET request.uid='${id}'; SET request.email=''; SET ROLE authenticated`);
}
async function root(sql) {
  await db.exec("RESET ROLE");
  return db.exec(sql);
}
const count = async (sql) => (await db.query(sql)).rows[0].n;
await as(b);
await db.query("SELECT save_feed_preferences($1,$2,$3,true,true,true)", [
  [" Maize ", "maize"],
  ["markets"],
  [" GHANA "],
]);
assert.deepEqual(
  (await db.query("SELECT crops,countries FROM feed_preferences")).rows[0],
  { crops: ["maize"], countries: ["ghana"] },
);
await assert.rejects(
  () =>
    db.query(
      "SELECT save_feed_preferences('{}','{invalid}','{}',true,true,true)",
    ),
  /Choose up to/,
);
await as(a);
assert.equal(await count("SELECT count(*)::int n FROM feed_preferences"), 0);
await root(
  `INSERT INTO posts(user_id,content,post_kind,post_details,country) VALUES('${a}','A harvest ready for local buyers','listing','{"title":"Fresh maize available","location":"Accra","commodity":"Maize","listing_type":"sell","quantity":"20","unit":"bags","currency":"GHS","available_from":"2098-01-01","deadline":"2099-01-01"}','Ghana');UPDATE feed_submission_log SET submitted_at=now()-interval '1 minute';`,
);
await root(`INSERT INTO posts(user_id,content) VALUES('${a}','A newer unrelated community update');`,
);
const listing = (
  await db.query("SELECT id FROM posts WHERE post_kind='listing'")
).rows[0].id;
await as(b);
assert.equal(
  (await db.query("SELECT id FROM discover_feed_v3()")).rows[0].id,
  listing,
);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM discover_feed_v3(p_interests_only=>true)",
  ),
  1,
);
await db.query("SELECT send_feed_enquiry($1,$2)", [
  listing,
  "Please share the pickup arrangements.",
]);
const enquiry = (await db.query("SELECT id FROM feed_enquiries")).rows[0].id;
assert.equal(await count("SELECT count(*)::int n FROM notifications"), 0);
await as(a);
assert.equal(
  await count("SELECT count(*)::int n FROM notifications WHERE type='enquiry'"),
  1,
);
await db.query("SELECT update_feed_enquiry($1,'contacted')", [enquiry]);
await as(b);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM notifications WHERE type='enquiry_update'",
  ),
  1,
);
await db.exec("DELETE FROM notifications");
await as(a);
await db.query("SELECT update_feed_enquiry($1,'new');", [enquiry]);
await db.query("SELECT update_feed_enquiry($1,'contacted');", [enquiry]);
await as(b);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM notifications WHERE message LIKE '%contacted'",
  ),
  0,
);
await db.query("SELECT save_feed_preferences('{}','{}','{}',true,false,true)");
await as(a);
await db.query("SELECT update_feed_enquiry($1,'closed')", [enquiry]);
await as(b);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM notifications WHERE message LIKE '%closed'",
  ),
  0,
);
await assert.rejects(
  () =>
    db.query(
      "INSERT INTO notifications(user_id,actor_id,type,message) VALUES($1,$2,'enquiry','forged')",
      [a, b],
    ),
  /row-level security/,
);
await as(c);
assert.equal(await count("SELECT count(*)::int n FROM notifications"), 0);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM discover_feed_v3(p_interests_only=>true)",
  ),
  0,
);
await as(a);
await db.query("INSERT INTO user_blocks(blocker_id,blocked_id) VALUES($1,$2)", [
  a,
  b,
]);
assert.equal(await count("SELECT count(*)::int n FROM notifications"), 0);
await as(b);
assert.equal(await count("SELECT count(*)::int n FROM notifications"), 0);
assert.equal(await count("SELECT count(*)::int n FROM discover_feed_v3()"), 0);
await root(
  `DELETE FROM user_blocks;UPDATE feed_submission_log SET submitted_at=now()-interval '1 minute';INSERT INTO posts(user_id,content,post_kind,post_details,country) VALUES('${a}','How should I protect this crop?','question','{"title":"How to protect maize","crop":"Maize","location":"Accra"}','Ghana');`,
);
const question = (
  await db.query("SELECT id FROM posts WHERE post_kind='question'")
).rows[0].id;
await as(b);
await db.query(
  "INSERT INTO post_comments(post_id,user_id,content) VALUES($1,$2,$3)",
  [question, b, "Inspect the leaves and check the soil moisture."],
);
const answer = (await db.query("SELECT id FROM post_comments")).rows[0].id;
await as(a);
await db.query("SELECT accept_feed_answer($1,$2)", [question, answer]);
await as(b);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM notifications WHERE type='answer_accepted'",
  ),
  1,
);
await as(a);
await db.query("SELECT accept_feed_answer($1,NULL)", [question]);
await as(b);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM notifications WHERE type='answer_accepted'",
  ),
  0,
);
await as(a);
await db.query("SELECT accept_feed_answer($1,$2)", [question, answer]);
await as(b);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM notifications WHERE type='answer_accepted'",
  ),
  1,
);
// Mutes hide old alerts and suppress future ones. Preference opt-outs suppress creation.
await as(b);
await db.query('INSERT INTO user_mutes(muter_id,muted_id) VALUES($1,$2)', [b,a]);
assert.equal(await count('SELECT count(*)::int n FROM notifications'), 0);
await as(a);
await db.query("SELECT save_feed_preferences('{}','{}','{}',false,true,true)");
await as(c);
await db.query('SELECT send_feed_enquiry($1,$2)', [listing, 'Can you confirm the harvest delivery date?']);
await as(a);
assert.equal(await count("SELECT count(*)::int n FROM notifications WHERE actor_id='"+c+"'"),0);
await root(`DELETE FROM user_mutes; INSERT INTO admin_users VALUES('moderator@test.local',true); SET request.email='moderator@test.local'; UPDATE posts SET moderation_status='pending' WHERE id='${question}';`);
await as(b);
assert.equal(await count("SELECT count(*)::int n FROM notifications WHERE type='answer_accepted'"),0);
// Interest filtering happens before pagination; following ignores interest boost.
await db.query("SELECT save_feed_preferences('{maize}','{}','{}',true,true,true)");
assert.equal(await count('SELECT count(*)::int n FROM discover_feed_v3(p_limit=>1,p_offset=>1,p_interests_only=>true)'),0);
await db.query('INSERT INTO connections(follower_id,following_id) VALUES($1,$2)',[b,a]);
assert.notEqual((await db.query('SELECT id FROM discover_feed_v3(p_following=>true)')).rows[0].id,listing);
await db.close();
console.log(
  "Feed interests and alerts: privacy, matching, preferences, deduplication, blocks and accepted answers passed.",
);
