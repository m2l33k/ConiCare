-- FIX MESSAGING RECURSION (V4 - CASCADE CLEANUP)
-- Run this to fix "infinite recursion" and "cannot drop function" errors.
-- We use CASCADE to forcefully remove old policies and functions.

-- 1. Clean up previous attempts (Forcefully)
DROP FUNCTION IF EXISTS public.is_conversation_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_conversation_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_conversation_ids() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_conversations_v3() CASCADE;

-- 2. Create the Master Key Function
-- Must be SECURITY DEFINER to run as Owner (Admin) and bypass RLS.
CREATE OR REPLACE FUNCTION public.get_my_conversations_v4()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- Direct query to participants table. 
  -- Since this runs as Admin, it does NOT trigger the RLS policy on conversation_participants.
  RETURN QUERY 
  SELECT conversation_id 
  FROM public.conversation_participants 
  WHERE profile_id = auth.uid();
END;
$$;

-- 3. Set Owner and Permissions
ALTER FUNCTION public.get_my_conversations_v4() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.get_my_conversations_v4() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_conversations_v4() TO service_role;

-- 4. Ensure created_by exists
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- 5. Drop ALL Existing Policies (Just to be safe, even though CASCADE handled most)
DROP POLICY IF EXISTS "Users can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "view_conversations" ON public.conversations;
DROP POLICY IF EXISTS "create_conversations" ON public.conversations;
DROP POLICY IF EXISTS "p_view_conversations" ON public.conversations;
DROP POLICY IF EXISTS "p_create_conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Authenticated users can add participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "view_participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "insert_participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "p_view_participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "p_insert_participants" ON public.conversation_participants;

DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
DROP POLICY IF EXISTS "view_messages" ON public.messages;
DROP POLICY IF EXISTS "insert_messages" ON public.messages;
DROP POLICY IF EXISTS "p_view_messages" ON public.messages;
DROP POLICY IF EXISTS "p_insert_messages" ON public.messages;

-- 6. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 7. Apply New Policies (Using v4 function)

-- CONVERSATIONS
CREATE POLICY "p_view_conversations"
ON public.conversations FOR SELECT
USING (
  created_by = auth.uid()
  OR
  id IN (SELECT public.get_my_conversations_v4())
);

CREATE POLICY "p_create_conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- PARTICIPANTS
CREATE POLICY "p_view_participants"
ON public.conversation_participants FOR SELECT
USING (
  conversation_id IN (SELECT public.get_my_conversations_v4())
);

CREATE POLICY "p_insert_participants"
ON public.conversation_participants FOR INSERT
WITH CHECK (
  profile_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND created_by = auth.uid()
  )
);

-- MESSAGES
CREATE POLICY "p_view_messages"
ON public.messages FOR SELECT
USING (
  conversation_id IN (SELECT public.get_my_conversations_v4())
);

CREATE POLICY "p_insert_messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  conversation_id IN (SELECT public.get_my_conversations_v4())
);
