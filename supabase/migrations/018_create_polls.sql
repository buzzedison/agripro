-- Migration 018: Interactive Polls
-- Run this in Supabase SQL Editor

-- 1. Add is_poll column to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_poll BOOLEAN DEFAULT FALSE;

-- 2. Create Poll Options Table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL,
    index INTEGER NOT NULL, -- To order options (0, 1, 2...)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Poll Votes Table
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL, -- Denormalized for easier lookups
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id) -- One vote per user per poll
);

-- 4. Enable RLS
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Poll Options: Viewable by everyone, insertable by post creator (handled via app logic/posts policy usually, but let's be explicit)
CREATE POLICY "Poll options are viewable by everyone" 
    ON public.poll_options FOR SELECT USING (true);

CREATE POLICY "Users can create poll options for their own posts"
    ON public.poll_options FOR INSERT 
    WITH CHECK (
        exists (select 1 from public.posts where id = poll_options.post_id and user_id = auth.uid())
    );

-- Poll Votes: Viewable by everyone (to count), insertable by auth users
CREATE POLICY "Poll votes are viewable by everyone" 
    ON public.poll_votes FOR SELECT USING (true);

CREATE POLICY "Users can vote once"
    ON public.poll_votes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change vote (delete)"
    ON public.poll_votes FOR DELETE 
    USING (auth.uid() = user_id);


-- 6. RPC Function for Voting
-- Handles the logic: If user already voted, maybe switch vote? Or fail?
-- For simplicity, let's just use standard insert/delete in client, but RPC is safer for concurrency.
-- Let's make a simple toggle vote RPC.
CREATE OR REPLACE FUNCTION vote_in_poll(p_post_id UUID, p_option_id UUID)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Check if already voted for THIS option (Toggle OFF)
    IF EXISTS (SELECT 1 FROM public.poll_votes WHERE user_id = v_user_id AND poll_option_id = p_option_id) THEN
        DELETE FROM public.poll_votes WHERE user_id = v_user_id AND poll_option_id = p_option_id;
    ELSE
        -- Delete any OTHER vote for this poll (Switch vote)
        DELETE FROM public.poll_votes WHERE user_id = v_user_id AND post_id = p_post_id;
        
        -- Insert new vote
        INSERT INTO public.poll_votes (poll_option_id, user_id, post_id)
        VALUES (p_option_id, v_user_id, p_post_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
