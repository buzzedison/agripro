import { readFile } from 'node:fs/promises';
export async function createTestDatabase(community = false, beforeCommunity = async () => {}) {
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const db = new PGlite();
const migration = async name => db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
await db.exec(`
CREATE ROLE anon; CREATE ROLE authenticated;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY, email text);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.uid',true),'')::uuid $$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT jsonb_build_object('email',current_setting('request.email',true)) $$;
GRANT USAGE ON SCHEMA auth TO authenticated, anon;
CREATE TABLE public.admin_users(email text, is_active boolean);
CREATE FUNCTION public.is_admin_user() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE email = auth.jwt()->>'email' AND is_active) $$;
CREATE TABLE public.profiles(id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE, full_name text, country text);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.profiles TO authenticated;
CREATE POLICY profile_read ON public.profiles FOR SELECT USING (true);
CREATE POLICY profile_update ON public.profiles FOR UPDATE USING (id=auth.uid());
CREATE POLICY profile_insert ON public.profiles FOR INSERT WITH CHECK (id=auth.uid());
CREATE TABLE public.user_connections(id uuid PRIMARY KEY, requester_id uuid, receiver_id uuid, status text);
CREATE TABLE public.connection_messages(id uuid PRIMARY KEY, sender_id uuid, recipient_id uuid, connection_id uuid);
GRANT SELECT ON public.user_connections TO authenticated, anon;
`);
await migration('002_create_social_feed.sql');
await migration('006_add_repost_table.sql');
await db.exec(`ALTER TABLE posts ADD COLUMN gif_url text, ADD COLUMN is_poll boolean DEFAULT false, ADD COLUMN quoted_post_id uuid, ADD COLUMN views_count integer DEFAULT 0;`);
await migration('043_add_moderation_system.sql');
await migration('045_add_views_to_network_feed_rpc.sql');
await migration('055_feed_spam_protection.sql');
if (community) await db.exec(`
CREATE TABLE post_hashtags(post_id uuid REFERENCES posts(id));
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON post_hashtags TO authenticated;
CREATE POLICY hashtag_insert ON post_hashtags FOR INSERT WITH CHECK (true);
CREATE TABLE post_mentions(post_id uuid REFERENCES posts(id), mentioned_by_user_id uuid);
CREATE TABLE comment_mentions(comment_id uuid REFERENCES post_comments(id), mentioned_by_user_id uuid);
ALTER TABLE post_mentions ENABLE ROW LEVEL SECURITY; ALTER TABLE comment_mentions ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON post_mentions,comment_mentions TO authenticated;
CREATE POLICY mention_insert ON post_mentions FOR INSERT WITH CHECK (mentioned_by_user_id=auth.uid());
CREATE POLICY comment_mention_insert ON comment_mentions FOR INSERT WITH CHECK (mentioned_by_user_id=auth.uid());
`);
if (community) {
  await beforeCommunity(db);
  await migration('056_community_tools.sql');
}

return db;
}
