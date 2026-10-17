import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase } from "./feed-fixture.mjs";
const db = await createTestDatabase(true);
const a = "00000000-0000-0000-0000-000000000091",
  b = "00000000-0000-0000-0000-000000000092",
  banned = "00000000-0000-0000-0000-000000000093";
const media = (name) => `https://proj.supabase.co/storage/v1/object/public/post-images/${a}/${name}`;
// Minimal stand-ins for Supabase storage and the Realtime publication.
await db.exec(`CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,file_size_limit bigint,allowed_mime_types text[]);
INSERT INTO storage.buckets(id) VALUES('post-images'); CREATE PUBLICATION supabase_realtime;
INSERT INTO auth.users VALUES('${a}','a@test.local'),('${b}','b@test.local'),('${banned}','x@test.local'); INSERT INTO profiles(id) SELECT id FROM auth.users;
CREATE TABLE notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,actor_id uuid,type text,post_id uuid,comment_id uuid,message text,read boolean DEFAULT false,created_at timestamptz DEFAULT now());`);
for (const f of ["057_practical_feed_posts.sql", "058_feed_interests_and_alerts.sql", "062_feed_media_reactions_live.sql"])
  await db.exec(await readFile(new URL("../supabase/migrations/" + f, import.meta.url), "utf8"));
// Re-running is safe.
await db.exec(await readFile(new URL("../supabase/migrations/062_feed_media_reactions_live.sql", import.meta.url), "utf8"));

async function as(id) {
  await db.exec(`RESET ROLE; SET request.uid='${id}'; SET request.email=''; SET ROLE authenticated`);
}
async function anon() {
  await db.exec(`RESET ROLE; SET request.uid=''; SET ROLE anon`);
}
const resetCooldown = () => db.exec("RESET ROLE; UPDATE feed_submission_log SET submitted_at=now()-interval '1 hour'");

// Bucket limits and realtime publication.
await db.exec("RESET ROLE");
const bucket = (await db.query("SELECT file_size_limit,allowed_mime_types FROM storage.buckets")).rows[0];
assert.equal(Number(bucket.file_size_limit), 52428800);
assert.ok(bucket.allowed_mime_types.includes("video/mp4"));
assert.equal((await db.query("SELECT count(*)::int n FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='posts'")).rows[0].n, 1);

// Multi-photo posts with alt text.
await as(a);
const { rows: [post] } = await db.query(
  "INSERT INTO posts(user_id,content,image_url,media_urls,media_alt) VALUES($1,'Leaf spots on my cassava',$2,$3,$4) RETURNING id,media_urls,media_alt",
  [a, media("1.jpg"), [media("1.jpg"), media("2.jpg")], ["Yellow spots on cassava leaf", ""]],
);
assert.equal(post.media_urls.length, 2);
await resetCooldown();
await as(a);
await assert.rejects(
  () => db.query("INSERT INTO posts(user_id,content,media_urls) VALUES($1,'Too many',$2)", [a, [1, 2, 3, 4, 5].map((n) => media(`${n}.jpg`))]),
  /posts_media_limits/,
);
await assert.rejects(
  () => db.query("INSERT INTO posts(user_id,content,media_urls) VALUES($1,'Tracking pixel',$2)", [a, ["https://evil.example/pixel.gif"]]),
  /posts_media_limits/,
);
// Media cannot be swapped after posting; text edits still work.
await assert.rejects(() => db.query("UPDATE posts SET media_urls=$1 WHERE id=$2", [[media("3.jpg")], post.id]), /cannot be changed/);
await resetCooldown();
await as(a);
await db.query("UPDATE posts SET content='Leaf spots on my cassava — photos attached' WHERE id=$1", [post.id]);

// Typed reactions.
await as(b);
await db.query("INSERT INTO post_likes(post_id,user_id,reaction) VALUES($1,$2,'useful')", [post.id, b]);
await as(a);
await assert.rejects(() => db.query("INSERT INTO post_likes(post_id,user_id,reaction) VALUES($1,$2,'angry')", [post.id, a]), /reaction_check/);
await db.query("INSERT INTO post_likes(post_id,user_id) VALUES($1,$2)", [post.id, a]);
// Members can change only their own reaction.
await db.query("UPDATE post_likes SET reaction='insightful' WHERE post_id=$1", [post.id]);
const counts = Object.fromEntries((await db.query("SELECT reaction,total::int FROM post_reaction_counts($1)", [[post.id]])).rows.map((r) => [r.reaction, r.total]));
assert.deepEqual(counts, { useful: 1, insightful: 1 });
await db.exec("RESET ROLE");
assert.equal((await db.query("SELECT likes_count FROM posts WHERE id=$1", [post.id])).rows[0].likes_count, 2);

// Signed-out preview: published, open posts from unrestricted authors only.
await resetCooldown();
await as(banned);
await db.query("INSERT INTO posts(user_id,content) VALUES($1,'Posted before being blocked')", [banned]);
await resetCooldown();
await as(b);
const { rows: [held] } = await db.query("INSERT INTO posts(user_id,content) VALUES($1,'Held for review') RETURNING id", [b]);
await db.exec(`RESET ROLE; INSERT INTO admin_users VALUES('admin@test.local',true); SET request.email='admin@test.local';
UPDATE profiles SET is_blocked=true WHERE id='${banned}'; UPDATE posts SET moderation_status='pending' WHERE id='${held.id}'; RESET request.email;`);
await anon();
const preview = (await db.query("SELECT content FROM public_feed_preview(10)")).rows.map((r) => r.content);
assert.deepEqual(preview, ["Leaf spots on my cassava — photos attached"]);
assert.equal((await db.query("SELECT count(*)::int n FROM public_feed_preview(500)")).rows[0].n, 1);
await assert.rejects(() => db.query("INSERT INTO post_likes(post_id,user_id) VALUES($1,$2)", [post.id, b]));

console.log("feed media, reactions, realtime and public preview checks passed");
