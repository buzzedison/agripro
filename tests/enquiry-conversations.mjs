import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase } from "./feed-fixture.mjs";
const db = await createTestDatabase(true);
const admin = "00000000-0000-0000-0000-000000000084";
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
  await db.exec(
    `RESET ROLE; SET request.uid='${id}'; SET request.email=''; SET ROLE authenticated`,
  );
}
async function root(sql) {
  await db.exec("RESET ROLE");
  return db.exec(sql);
}
const count = async (sql) => (await db.query(sql)).rows[0].n;
await root(`INSERT INTO auth.users VALUES('${admin}','admin@test.local'); INSERT INTO profiles(id) VALUES('${admin}'); INSERT INTO admin_users VALUES('admin@test.local',true);
INSERT INTO posts(user_id,content,post_kind,post_details,country) VALUES('${a}','Maize harvest for local buyers','listing','{"title":"Fresh maize available","location":"Accra","commodity":"Maize","listing_type":"sell","quantity":"20","unit":"bags","currency":"GHS","available_from":"2098-01-01","deadline":"2099-01-01"}','Ghana');`);
const post = (await db.query("SELECT id FROM posts")).rows[0].id;
await as(b);
await db.query("SELECT send_feed_enquiry($1,$2)", [
  post,
  "Please confirm the collection arrangements.",
]);
const enquiry = (await db.query("SELECT id FROM feed_enquiries")).rows[0].id;
await root("");
const alertsBefore = await count("SELECT count(*)::int n FROM notifications");
await db.exec(
  await readFile(
    new URL(
      "../supabase/migrations/059_enquiry_conversations.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
assert.equal(
  await count("SELECT count(*)::int n FROM notifications"),
  alertsBefore,
  "migration must not replay alerts",
);
assert.equal(
  await count("SELECT count(*)::int n FROM feed_enquiry_messages"),
  1,
  "opening message backfilled",
);
async function age() {
  await root(
    "UPDATE feed_enquiry_messages SET created_at=created_at-interval '6 seconds'",
  );
}
let seq = 100;
const key = () => `00000000-0000-0000-0000-${String(++seq).padStart(12, "0")}`;
async function send(who, body, client = key()) {
  await as(who);
  return (
    await db.query("SELECT send_enquiry_reply($1,$2,$3) id", [
      enquiry,
      body,
      client,
    ])
  ).rows[0].id;
}
await as(c);
assert.equal(
  await count("SELECT count(*)::int n FROM feed_enquiry_messages"),
  0,
);
await assert.rejects(
  () => db.query("SELECT enquiry_conversation($1)", [enquiry]),
  /unavailable/,
);
await assert.rejects(() => send(c, "I should not be here"), /unavailable/);
await as(admin);
await db.exec("SET request.email='admin@test.local'");
assert.equal(
  await count("SELECT count(*)::int n FROM feed_enquiry_messages"),
  0,
  "admin cannot browse unreported private threads",
);
await as(a);
assert.equal(
  (await db.query("SELECT * FROM enquiry_conversation($1)", [enquiry])).rows[0]
    .can_reply,
  true,
);
await assert.rejects(
  () =>
    db.query(
      "INSERT INTO feed_enquiry_messages(enquiry_id,sender_id,body,client_id) VALUES($1,$2,$3,$4)",
      [enquiry, a, "forged", key()],
    ),
  /permission denied/,
);
await assert.rejects(() => send(a, "\n\t"), /1–2,000/);
const client = key();
const message = await send(a, "Collection is available on Friday.", client);
assert.equal(
  await send(a, "Collection is available on Friday.", client),
  message,
  "retry must return same message",
);
await assert.rejects(() => send(a, "Different body", client), /already used/);
await assert.rejects(() => send(a, "Too fast"), /5 seconds/);
await age();
await assert.rejects(
  () => send(a, "Collection is available on Friday."),
  /already sent/,
);
await send(a, "We can also arrange local delivery.");
await as(b);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM notifications WHERE type='enquiry_reply'",
  ),
  1,
  "reply alerts collapse per conversation",
);
await db.query(
  "SELECT save_feed_preferences_v2('{}','{}','{}',true,true,true,false)",
);
await db.exec("DELETE FROM notifications WHERE type='enquiry_reply'");
await age();
await send(a, "Here is a further update on delivery.");
await as(b);
assert.equal(
  await count(
    "SELECT count(*)::int n FROM notifications WHERE type='enquiry_reply'",
  ),
  0,
  "reply alert opt-out respected",
);
await assert.rejects(
  () =>
    db.query(
      "INSERT INTO notifications(user_id,actor_id,type,enquiry_id,message) VALUES($1,$2,'enquiry_reply',$3,'forged')",
      [a, b, enquiry],
    ),
  /row-level security/,
);
await db.query("INSERT INTO user_blocks(blocker_id,blocked_id) VALUES($1,$2)", [
  b,
  a,
]);
assert.equal(
  (await db.query("SELECT * FROM enquiry_conversation($1)", [enquiry])).rows[0]
    .can_reply,
  false,
);
assert.equal(
  (await db.query("SELECT * FROM read_enquiry_messages($1)", [enquiry])).rows
    .length,
  4,
  "history stays available for evidence",
);
await age();
await assert.rejects(() => send(a, "Blocked reply"), /unavailable/);
await assert.rejects(() => send(b, "Blocked reply"), /unavailable/);
// Reporting explicitly discloses just the selected incoming message to moderators.
await as(c);
await assert.rejects(
  () =>
    db.query(
      "INSERT INTO content_reports(reporter_id,target_type,target_id,reason) VALUES($1,'enquiry_message',$2,'spam')",
      [c, message],
    ),
  /Only received/,
);
await as(a);
await assert.rejects(
  () =>
    db.query(
      "INSERT INTO content_reports(reporter_id,target_type,target_id,reason) VALUES($1,'enquiry_message',$2,'spam')",
      [a, message],
    ),
  /Only received/,
);
await as(b);
await db.query(
  "INSERT INTO content_reports(reporter_id,target_type,target_id,reason) VALUES($1,'enquiry_message',$2,'spam')",
  [b, message],
);
assert.equal(
  await count("SELECT count(*)::int n FROM feed_enquiry_report_evidence"),
  0,
);
await as(admin);
await db.exec("SET request.email='admin@test.local'");
assert.equal(
  await count("SELECT count(*)::int n FROM feed_enquiry_messages"),
  1,
);
const report = (
  await db.query("SELECT report_id FROM feed_enquiry_report_evidence")
).rows[0].report_id;
assert.equal(
  (await db.query("SELECT body FROM feed_enquiry_report_evidence")).rows[0]
    .body,
  "Collection is available on Friday.",
);
await db.query("SELECT remove_reported_enquiry_message($1)", [report]);
await as(b);
assert.equal(
  (
    await db.query("SELECT body FROM feed_enquiry_messages WHERE id=$1", [
      message,
    ])
  ).rows[0].body,
  "Message removed by a moderator.",
);
await assert.rejects(
  () => db.query("SELECT remove_reported_enquiry_message($1)", [report]),
  /Moderator/,
);
await root("DELETE FROM user_blocks");
// Closed listings still allow follow-up, but closed enquiries do not.
await as(a);
await db.query("SELECT close_feed_post($1,true)", [post]);
await age();
await send(a, "Following up after the listing closed.");
await db.query("SELECT update_feed_enquiry($1,'closed')", [enquiry]);
await age();
await assert.rejects(
  () => send(b, "Cannot reply to a closed enquiry"),
  /closed or paused/,
);
await as(a);
await db.query("SELECT update_feed_enquiry($1,'contacted')", [enquiry]);
await age();
await send(b, "Thank you. I will collect on Friday.");
await root(
  `SET request.email='admin@test.local'; UPDATE profiles SET is_suspended=true WHERE id='${a}'`,
);
await age();
await assert.rejects(() => send(b, "Suspended recipient"), /unavailable/);
await root(
  `SET request.email='admin@test.local'; UPDATE profiles SET is_suspended=false WHERE id='${a}'`,
);
await as(admin);
await db.exec("SET request.email='admin@test.local'");
await db.query("UPDATE posts SET moderation_status='pending' WHERE id=$1", [
  post,
]);
await age();
await assert.rejects(() => send(b, "Held post reply"), /closed or paused/);
await as(admin);
await db.exec("SET request.email='admin@test.local'");
await db.query("UPDATE posts SET moderation_status='published' WHERE id=$1", [
  post,
]);
// The opening message can also be reported and removed from both representations.
await as(a);
await db.query(
  "INSERT INTO content_reports(reporter_id,target_type,target_id,reason) VALUES($1,'enquiry_message',$2,'spam')",
  [a, enquiry],
);
await as(admin);
await db.exec("SET request.email='admin@test.local'");
const initialReport = (
  await db.query(
    "SELECT report_id FROM feed_enquiry_report_evidence WHERE message_id=$1",
    [enquiry],
  )
).rows[0].report_id;
await db.query("SELECT remove_reported_enquiry_message($1)", [initialReport]);
await as(b);
assert.equal(
  (await db.query("SELECT message FROM feed_enquiries WHERE id=$1", [enquiry]))
    .rows[0].message,
  "Message removed by a moderator.",
);
// Tie-safe pagination over more than one page, and hourly cap.
await root(
  `INSERT INTO feed_enquiry_messages(enquiry_id,sender_id,body,client_id,created_at) SELECT '${enquiry}','${a}','History item '||n,gen_random_uuid(),now()-interval '30 minutes' FROM generate_series(1,65) n;`,
);
await as(b);
const first = (
  await db.query("SELECT * FROM read_enquiry_messages($1)", [enquiry])
).rows;
const last = first.at(-1);
const second = (
  await db.query("SELECT * FROM read_enquiry_messages($1,$2,$3)", [
    enquiry,
    last.created_at,
    last.id,
  ])
).rows;
assert.equal(first.length, 50);
assert.ok(second.length > 0);
assert.equal(
  new Set([...first, ...second].map((m) => m.id)).size,
  first.length + second.length,
);
await age();
await assert.rejects(() => send(a, "Hourly cap enforced"), /Reply limit/);
// Newly-created enquiries get exactly one opening message after the migration.
await as(a);
await db.query("SELECT close_feed_post($1,false)", [post]);
await as(c);
await db.query("SELECT send_feed_enquiry($1,$2)", [
  post,
  "Can you supply a smaller order next week?",
]);
const newEnquiry = (
  await db.query("SELECT id FROM feed_enquiries WHERE user_id=$1", [c])
).rows[0].id;
assert.equal(
  (await db.query("SELECT * FROM read_enquiry_messages($1)", [newEnquiry])).rows
    .length,
  1,
);
await assert.rejects(
  () =>
    db.query("SELECT send_enquiry_reply($1,$2,$3)", [
      newEnquiry,
      "Immediate opening follow-up",
      key(),
    ]),
  /5 seconds/,
);
await db.close();
console.log(
  "PASS: enquiry migration, membership, private history, idempotency, rate limits, alerts, blocks, reports, redaction, paused threads and pagination.",
);
