-- Migration 021: Update Network Feed RPC
-- Previous RPC definition was missing gif_url and is_poll columns.

DROP FUNCTION IF EXISTS get_network_feed(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_network_feed(p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    content TEXT,
    image_url TEXT,
    gif_url TEXT,          -- Added
    is_poll BOOLEAN,       -- Added
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
        p.gif_url,         -- Added
        p.is_poll,         -- Added
        p.created_at,
        p.likes_count,
        p.comments_count,
        p.reposts_count,
        p.quoted_post_id,
        CASE WHEN cu.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_connection
    FROM public.posts p
    LEFT JOIN connected_users cu ON p.user_id = cu.user_id
    ORDER BY 
        -- Prioritize connection posts from the last 24 hours
        (CASE WHEN cu.user_id IS NOT NULL AND p.created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) DESC,
        p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
