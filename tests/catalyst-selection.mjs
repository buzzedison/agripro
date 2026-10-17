import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createTestDatabase } from "./feed-fixture.mjs";

const db = await createTestDatabase(false);
const admin = "00000000-0000-0000-0000-0000000000a1",
  member = "00000000-0000-0000-0000-0000000000a2";
const migration = async (f) => db.exec(await readFile(new URL("../supabase/migrations/" + f, import.meta.url), "utf8"));

// Supabase grants table privileges to anon/authenticated by default; RLS does the filtering.
await db.exec(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;`);
await db.exec(`CREATE TABLE public.catalyst_fellows(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
INSERT INTO auth.users VALUES('${admin}','admin@test.local'),('${member}','member@test.local');
INSERT INTO admin_users VALUES('admin@test.local',true);`);
for (const f of ["031_create_catalyst_submissions.sql", "038_add_catalyst_w_participant_ops.sql", "042_add_submission_referral_source.sql", "049_add_catalyst_submission_stages.sql"])
  await migration(f);
await db.exec(`INSERT INTO catalyst_submissions(type,full_name,email,business_name) VALUES
 ('apply','Ama Mensah','ama@farm.gh','Ama Farms'),('apply','Ama Mensah','AMA@farm.gh','Ama Farms Ltd');`);
await migration("063_catalyst_selection.sql");
await migration("063_catalyst_selection.sql"); // safe to rerun

const as = (id, email) => db.exec(`RESET ROLE; SET request.uid='${id}'; SET request.email='${email}'; SET ROLE authenticated`);
const root = () => db.exec("RESET ROLE; RESET request.email;");

// Starter questions are seeded once.
await root();
assert.equal((await db.query("SELECT count(*)::int n FROM catalyst_selection_questions WHERE cohort_year=2026")).rows[0].n, 6);

// Signed-in members can no longer read or edit applications; admins can.
await as(member, "member@test.local");
assert.equal((await db.query("SELECT count(*)::int n FROM catalyst_submissions")).rows[0].n, 0);
await db.query("UPDATE catalyst_submissions SET admin_notes='hacked'");
await root();
assert.equal((await db.query("SELECT count(*)::int n FROM catalyst_submissions WHERE admin_notes='hacked'")).rows[0].n, 0);
await as(member, "member@test.local");
assert.equal((await db.query("SELECT count(*)::int n FROM catalyst_selection_questions")).rows[0].n, 0);
await db.exec("RESET ROLE; SET request.uid=''; SET ROLE anon");
await assert.rejects(() => db.query("SELECT count(*) FROM catalyst_scorecards"), /permission denied/);
await as(admin, "admin@test.local");
const apps = (await db.query("SELECT id FROM catalyst_submissions ORDER BY created_at, id")).rows;
assert.equal(apps.length, 2);
const [first, second] = apps.map((r) => r.id);

// New stage, exclusion reasons and duplicate rules.
await db.query("UPDATE catalyst_submissions SET status='shortlisted' WHERE id=$1", [first]);
await db.query("UPDATE catalyst_submissions SET duplicate_of=$1, excluded_reason='duplicate' WHERE id=$2", [first, second]);
await assert.rejects(() => db.query("UPDATE catalyst_submissions SET status='offered' WHERE id=$1", [first]), /status_check/);
await assert.rejects(() => db.query("UPDATE catalyst_submissions SET excluded_reason='spam!!' WHERE id=$1", [first]), /excluded_reason_check/);
await assert.rejects(() => db.query("UPDATE catalyst_submissions SET duplicate_of=id WHERE id=$1", [first]), /not_own_duplicate/);

// Interviews and scorecards.
await assert.rejects(() => db.query("INSERT INTO catalyst_interviews(submission_id,scheduled_at,interviewer_email,meeting_link) VALUES($1,now(),'a@b.co','javascript:alert(1)')", [first]), /meeting_link/);
await db.query("INSERT INTO catalyst_interviews(submission_id,scheduled_at,interviewer_email,meeting_link) VALUES($1,now()+interval '2 days','admin@test.local','https://meet.google.com/abc')", [first]);
const q = (await db.query("SELECT id FROM catalyst_selection_questions ORDER BY position LIMIT 1")).rows[0].id;
await db.query("INSERT INTO catalyst_scorecards(submission_id,interviewer_email,scores,weighted_score,recommendation) VALUES($1,'admin@test.local',$2,80,'yes')", [first, { [q]: 4 }]);
await assert.rejects(() => db.query("INSERT INTO catalyst_scorecards(submission_id,interviewer_email) VALUES($1,'admin@test.local')", [first]), /unique|duplicate key/i);
await assert.rejects(() => db.query("INSERT INTO catalyst_scorecards(submission_id,interviewer_email,recommendation) VALUES($1,'x@test.local','definitely')", [first]), /recommendation/);

// Deleting an application removes its interviews and scorecards.
await root();
await db.query("UPDATE catalyst_submissions SET duplicate_of=NULL WHERE id=$1", [second]);
await db.query("DELETE FROM catalyst_submissions WHERE id=$1", [first]);
assert.equal((await db.query("SELECT ((SELECT count(*) FROM catalyst_interviews)+(SELECT count(*) FROM catalyst_scorecards))::int AS n")).rows[0].n, 0);

// Pure selection rules (completeness, duplicate grouping, weighted scoring).
const lib = await import("../lib/catalyst-selection.ts");
const base = { id: "1", type: "apply", status: "new", full_name: "Ama Mensah", email: "ama@farm.gh", created_at: "2026-10-01" };
const full = { ...base, country: "Ghana", business_name: "Ama Farms", business_stage: "Growth", sector: "Poultry", why_apply: "x".repeat(100), primary_constraint: "y".repeat(60), support_needed: "Buyers", referral_source: "Partner" };
assert.equal(lib.completeness(full).complete, true);
assert.deepEqual(lib.completeness(base).missing.slice(0, 2), ["Country", "Business name"]);
assert.ok(lib.completeness({ ...full, why_apply: "short" }).warnings.length === 1);
assert.equal(lib.looksLikeTest({ ...base, full_name: "Test User" }), true);
const groups = lib.duplicateGroups([
  { ...base, id: "a", phone: "+233 24 123 4567", created_at: "2026-10-01" },
  { ...base, id: "b", email: "other@x.com", phone: "024 123 4567", created_at: "2026-10-02" },
  { ...base, id: "c", email: "c@x.com", full_name: "Kofi", created_at: "2026-10-03" },
]);
assert.deepEqual([...groups.values()], [["a", "b"]]);
const qs = [{ id: "q1", weight: 2, max_score: 5 }, { id: "q2", weight: 1, max_score: 5 }];
assert.equal(lib.weightedScore({ q1: 5, q2: 0 }, qs), 66.7);
assert.equal(lib.weightedScore({ q2: 5 }, qs), 100);
assert.equal(lib.weightedScore({}, qs), null);

console.log("catalyst selection migration and rules checks passed");
