-- 043_add_moderation_system.sql
-- Report / block / mute for the social feed, plus an admin review queue.
--
-- Design:
--   * Reports are logged for admin review (post, comment, or user).
--   * Blocking is enforced at the RLS level on posts/comments/messages, so a
--     block hides content everywhere (feed, profile, permalink, search) and
--     stops new messages both ways — not just a feed-level filter.
--   * Muting is a private, one-directional feed preference (not enforced via
--     RLS) — a muted user's content still shows on their own profile if you
--     visit it directly; it's just filtered out of your feed.
--   * Admin actions (delete content, suspend a user, review a report) run
--     through additional permissive RLS policies gated by is_admin_user(),
--     matching the existing admin-page pattern (direct client-side ops).

-- ── Suspension flag ──────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- ── Reports ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type   TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
  target_id     UUID NOT NULL,
  reason        TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'misinformation', 'inappropriate', 'other')),
  details       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON public.content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_target ON public.content_reports(target_type, target_id);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert_own" ON public.content_reports;
CREATE POLICY "reports_insert_own" ON public.content_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_select_admin" ON public.content_reports;
CREATE POLICY "reports_select_admin" ON public.content_reports
  FOR SELECT TO authenticated
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "reports_update_admin" ON public.content_reports;
CREATE POLICY "reports_update_admin" ON public.content_reports
  FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

GRANT SELECT, INSERT ON public.content_reports TO authenticated;
GRANT UPDATE ON public.content_reports TO authenticated;

-- ── Blocks ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_manage_own" ON public.user_blocks;
CREATE POLICY "blocks_manage_own" ON public.user_blocks
  FOR ALL TO authenticated
  USING (auth.uid() = blocker_id)
  WITH CHECK (auth.uid() = blocker_id);

GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;

-- Symmetric check used by RLS elsewhere — SECURITY DEFINER so a blocked
-- party can't read the blocks table directly but the check still applies.
CREATE OR REPLACE FUNCTION public.is_blocked_pair(a UUID, b UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = a AND blocked_id = b)
       OR (blocker_id = b AND blocked_id = a)
  );
$$;

-- ── Mutes (private, feed-level only — no RLS enforcement) ───────────────
CREATE TABLE IF NOT EXISTS public.user_mutes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muter_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (muter_id, muted_id),
  CHECK (muter_id <> muted_id)
);

CREATE INDEX IF NOT EXISTS idx_user_mutes_muter ON public.user_mutes(muter_id);

ALTER TABLE public.user_mutes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mutes_manage_own" ON public.user_mutes;
CREATE POLICY "mutes_manage_own" ON public.user_mutes
  FOR ALL TO authenticated
  USING (auth.uid() = muter_id)
  WITH CHECK (auth.uid() = muter_id);

GRANT SELECT, INSERT, DELETE ON public.user_mutes TO authenticated;

-- ── Enforce blocks on posts / comments (hide everywhere, both directions) ─
DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts
  FOR SELECT
  USING (
    auth.uid() IS NULL
    OR NOT public.is_blocked_pair(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "comments_select" ON public.post_comments;
CREATE POLICY "comments_select" ON public.post_comments
  FOR SELECT
  USING (
    auth.uid() IS NULL
    OR NOT public.is_blocked_pair(auth.uid(), user_id)
  );

-- ── Enforce blocks on new messages (both directions) ─────────────────────
DROP POLICY IF EXISTS "Sender can insert messages" ON public.connection_messages;
CREATE POLICY "Sender can insert messages"
  ON public.connection_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT public.is_blocked_pair(sender_id, recipient_id)
    AND EXISTS (
      SELECT 1
      FROM public.user_connections uc
      WHERE uc.id = connection_id
        AND uc.status = 'accepted'
        AND (uc.requester_id = auth.uid() OR uc.receiver_id = auth.uid())
    )
  );

-- ── Admin moderation powers: delete any post/comment, suspend any profile ─
DROP POLICY IF EXISTS "posts_delete_admin" ON public.posts;
CREATE POLICY "posts_delete_admin" ON public.posts
  FOR DELETE TO authenticated
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "comments_delete_admin" ON public.post_comments;
CREATE POLICY "comments_delete_admin" ON public.post_comments
  FOR DELETE TO authenticated
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- ── Feed RPC: also exclude muted users' posts for the caller ─────────────
DROP FUNCTION IF EXISTS get_network_feed(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_network_feed(p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    content TEXT,
    image_url TEXT,
    gif_url TEXT,
    is_poll BOOLEAN,
    created_at TIMESTAMPTZ,
    likes_count INTEGER,
    comments_count INTEGER,
    reposts_count INTEGER,
    quoted_post_id UUID,
    is_connection BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    RETURN QUERY
    WITH connected_users AS (
        SELECT requester_id AS user_id FROM public.user_connections
        WHERE receiver_id = v_user_id AND status = 'accepted'
        UNION
        SELECT receiver_id AS user_id FROM public.user_connections
        WHERE requester_id = v_user_id AND status = 'accepted'
    )
    SELECT
        p.id,
        p.user_id,
        p.content,
        p.image_url,
        p.gif_url,
        p.is_poll,
        p.created_at,
        p.likes_count,
        p.comments_count,
        p.reposts_count,
        p.quoted_post_id,
        CASE WHEN cu.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_connection
    FROM public.posts p
    LEFT JOIN connected_users cu ON p.user_id = cu.user_id
    WHERE
        (v_user_id IS NULL OR NOT public.is_blocked_pair(v_user_id, p.user_id))
        AND (v_user_id IS NULL OR NOT EXISTS (
            SELECT 1 FROM public.user_mutes um
            WHERE um.muter_id = v_user_id AND um.muted_id = p.user_id
        ))
        AND NOT EXISTS (
            SELECT 1 FROM public.profiles pr
            WHERE pr.id = p.user_id AND COALESCE(pr.is_suspended, false)
        )
    ORDER BY
        (CASE WHEN cu.user_id IS NOT NULL AND p.created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) DESC,
        p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
