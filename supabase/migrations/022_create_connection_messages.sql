-- Messaging between accepted connections
-- Creates connection_messages table with RLS so only participants in
-- accepted user_connections can read or write messages.

CREATE TABLE IF NOT EXISTS public.connection_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.user_connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
  attachment_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_connection_messages_connection_created_at
  ON public.connection_messages(connection_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_connection_messages_recipient_unread
  ON public.connection_messages(recipient_id)
  WHERE read_at IS NULL;

ALTER TABLE public.connection_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages"
  ON public.connection_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_connections uc
      WHERE uc.id = connection_id
        AND uc.status = 'accepted'
        AND (uc.requester_id = auth.uid() OR uc.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Sender can insert messages"
  ON public.connection_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1
      FROM public.user_connections uc
      WHERE uc.id = connection_id
        AND uc.status = 'accepted'
        AND (uc.requester_id = auth.uid() OR uc.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Recipient can update read state"
  ON public.connection_messages
  FOR UPDATE
  USING (
    auth.uid() = recipient_id
    AND EXISTS (
      SELECT 1
      FROM public.user_connections uc
      WHERE uc.id = connection_id
        AND uc.status = 'accepted'
        AND (uc.requester_id = auth.uid() OR uc.receiver_id = auth.uid())
    )
  )
  WITH CHECK (auth.uid() = recipient_id);

DROP TRIGGER IF EXISTS update_connection_messages_updated_at ON public.connection_messages;
CREATE TRIGGER update_connection_messages_updated_at
  BEFORE UPDATE ON public.connection_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
