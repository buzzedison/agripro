-- Migration 017: Connection Notifications and Network Feed
-- Run this in Supabase SQL Editor

-- 1. Update notifications type check to include connection types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('mention', 'like', 'comment', 'repost', 'follow', 'connection_request', 'connection_accepted'));

-- 2. Create Trigger Function for Connection Notifications
CREATE OR REPLACE FUNCTION public.handle_connection_update()
RETURNS TRIGGER AS $$
DECLARE
    requester_name TEXT;
    receiver_name TEXT;
BEGIN
    -- Handle NEW Connection Request
    IF (TG_OP = 'INSERT' AND NEW.status = 'pending') THEN
        SELECT full_name INTO requester_name FROM public.profiles WHERE id = NEW.requester_id;
        
        INSERT INTO public.notifications (user_id, actor_id, type, message, read)
        VALUES (
            NEW.receiver_id, -- User receiving the request
            NEW.requester_id, -- User sending the request
            'connection_request',
            requester_name || ' sent you a connection request',
            false
        );
    END IF;

    -- Handle Connection Accepted
    IF (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted') THEN
        SELECT full_name INTO receiver_name FROM public.profiles WHERE id = NEW.receiver_id;
        
        INSERT INTO public.notifications (user_id, actor_id, type, message, read)
        VALUES (
            NEW.requester_id, -- User who sent the original request now gets notified it was accepted
            NEW.receiver_id,  -- User who accepted
            'connection_accepted',
            receiver_name || ' accepted your connection request',
            false
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger on user_connections
DROP TRIGGER IF EXISTS trigger_connection_update ON public.user_connections;
CREATE TRIGGER trigger_connection_update
    AFTER INSERT OR UPDATE ON public.user_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_connection_update();

-- 4. Create Network Feed Function
-- Fetches posts, prioritizing those from connections
CREATE OR REPLACE FUNCTION get_network_feed(p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    content TEXT,
    image_url TEXT,
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
        p.created_at,
        p.likes_count,
        p.comments_count,
        p.reposts_count,
        p.quoted_post_id,
        CASE WHEN cu.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_connection
    FROM public.posts p
    LEFT JOIN connected_users cu ON p.user_id = cu.user_id
    -- Show posts from: Connections OR Self OR (Optional: Followed users if we kept follows)
    -- For this logic, we'll prioritize connections but mix in others sorted by date
    ORDER BY 
        -- Prioritize connection posts from the last 24 hours
        (CASE WHEN cu.user_id IS NOT NULL AND p.created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) DESC,
        p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
