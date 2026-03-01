-- =============================================
-- CHAT MIGRATION — Run this in Supabase SQL Editor
-- =============================================

-- 1. Create the messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL,           -- 'project:<uuid>' or 'dm:<uid1>_<uid2>'
  sender_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for fast per-channel fetches
CREATE INDEX IF NOT EXISTS messages_channel_id_idx ON public.messages (channel_id, created_at DESC);

-- 2. Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Any authenticated user can read messages
CREATE POLICY "messages_allow_read" ON public.messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 4. Users can only insert messages as themselves
CREATE POLICY "messages_allow_insert" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- =============================================
-- AFTER RUNNING THIS SQL:
-- Go to Supabase Dashboard → Database → Replication → Tables
-- Toggle ON the 'messages' table to enable Realtime
-- =============================================
