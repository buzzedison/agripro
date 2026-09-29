import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTestDatabase } from './feed-fixture.mjs';
const author = '00000000-0000-0000-0000-000000000011';
const restricted = '00000000-0000-0000-0000-000000000012';
const db = await createTestDatabase(true, async db => {
    // Model an existing database: multiple posts by one author, a recent
    // submission, and a blocked author's historical post before the backfill.
    await db.exec(`
        INSERT INTO auth.users VALUES ('${author}','existing@test.local'), ('${restricted}','restricted@test.local');
        INSERT INTO profiles(id,country) VALUES ('${author}','Ghana'), ('${restricted}','Kenya');
        INSERT INTO posts(user_id,content) VALUES ('${author}','First existing crop update');
        UPDATE feed_submission_log SET submitted_at = now() - interval '1 minute';
        INSERT INTO posts(user_id,content) VALUES ('${author}','Second existing crop update');
        INSERT INTO posts(user_id,content) VALUES ('${restricted}','Historical market update');
        UPDATE profiles SET is_blocked=true WHERE id='${restricted}';
    `);
    // Reproduce the deployed legacy function, including an extra legacy trigger.
    await db.exec(await readFile(new URL('./fixtures/legacy-feed-guard.sql', import.meta.url), 'utf8'));
    await db.exec(`CREATE TRIGGER legacy_spam_guard BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION guard_feed_submission()`);
});
const { rows } = await db.query('SELECT user_id,content,country,moderation_status FROM posts ORDER BY content');
assert.equal(rows.length, 3);
assert.ok(rows.every(post => post.country === (post.user_id === author ? 'Ghana' : 'Kenya')));
assert.ok(rows.every(post => post.moderation_status === 'published'));
assert.equal((await db.query('SELECT count(*)::int AS count FROM feed_submission_log')).rows[0].count, 3);
await assert.rejects(() => db.exec(`INSERT INTO posts(user_id,content) VALUES ('${author}','Immediate new post')`), /15 seconds/);
await assert.rejects(() => db.exec(`UPDATE posts SET content='Blocked author edit' WHERE user_id='${restricted}'`), /restricted/);
// The standalone repair can also be rerun safely after migration 056.
const repair = await readFile(new URL('../supabase/repair_feed_submission_guard.sql', import.meta.url), 'utf8');
await db.exec(repair);
await db.exec(repair);
assert.equal((await db.query("SELECT count(*)::int AS count FROM pg_trigger WHERE NOT tgisinternal AND tgfoid='public.guard_feed_submission()'::regprocedure")).rows[0].count, 2);
await db.exec(`UPDATE posts SET country='Ghana' WHERE user_id='${author}'`);
assert.equal((await db.query('SELECT count(*)::int AS count FROM feed_submission_log')).rows[0].count, 3);
await db.exec("UPDATE feed_submission_log SET submitted_at=now()-interval '1 minute'");
await db.exec(`INSERT INTO posts(user_id,content) VALUES('${author}','New submission after cooldown')`);
await assert.rejects(() => db.exec(`UPDATE posts SET content='Immediate real edit' WHERE user_id='${author}'`), /15 seconds/);
await db.close();
console.log('PASS: migration backfills existing and blocked authors without spam penalties; posting and edit restrictions remain enforced.');
