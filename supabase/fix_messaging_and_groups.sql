
-- FIX MESSAGING & GROUPS & CONSULTATIONS SCHEMA
-- Run this script in the Supabase SQL Editor

-- ==========================================
-- 1. CONSULTATIONS (Booking)
-- ==========================================

-- Standardize column names
DO $$ 
BEGIN
  -- 1. Handle consultation_date -> scheduled_at
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'consultation_date') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'scheduled_at') THEN
      ALTER TABLE public.consultations DROP COLUMN consultation_date;
    ELSE
      ALTER TABLE public.consultations RENAME COLUMN consultation_date TO scheduled_at;
    END IF;
  END IF;

  -- 2. Handle consultation_time (Legacy column causing errors)
  -- We don't need this separate column as time is included in scheduled_at (TIMESTAMPTZ)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'consultation_time') THEN
    ALTER TABLE public.consultations DROP COLUMN consultation_time;
  END IF;

END $$;

-- Ensure consultations table exists
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all required columns exist
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS specialist_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES public.children(id);
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS notes TEXT;

-- Make sure scheduled_at is nullable initially if there's legacy data, but we want it to be filled for new ones.
-- For now, let's just make sure it exists.
-- If the previous error was "null value in column consultation_date... violates not-null constraint", it means the DB has a NOT NULL constraint on it.
-- We should drop that constraint if we are renaming, or ensure our code writes to it.
-- Since we renamed it above, we should be good if we write to 'scheduled_at'.
-- But just in case 'scheduled_at' was created separately and is null for old rows, let's relax the constraint.
ALTER TABLE public.consultations ALTER COLUMN scheduled_at DROP NOT NULL;

-- Enable RLS for consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Consultations are viewable by participants" ON public.consultations;
DROP POLICY IF EXISTS "Parents can book consultations" ON public.consultations;
DROP POLICY IF EXISTS "Specialists can update consultations" ON public.consultations;

-- Create Policies
CREATE POLICY "Consultations are viewable by participants"
ON public.consultations FOR SELECT
USING (auth.uid() = parent_id OR auth.uid() = specialist_id);

CREATE POLICY "Parents can book consultations"
ON public.consultations FOR INSERT
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Specialists can update consultations"
ON public.consultations FOR UPDATE
USING (auth.uid() = specialist_id);


-- ==========================================
-- 2. MESSAGING
-- ==========================================

-- Ensure Conversations table exists
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Ensure Participants table exists
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, profile_id)
);

-- Ensure Messages table exists
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Messaging
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Clean up old policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view conversations they are part of" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert themselves as participant" ON public.conversation_participants;
DROP POLICY IF EXISTS "Authenticated users can add participants" ON public.conversation_participants;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;

-- New Robust Policies

-- Conversations
CREATE POLICY "Users can view conversations they are part of"
ON public.conversations FOR SELECT
USING (
  auth.uid() IN (
    SELECT profile_id FROM public.conversation_participants WHERE conversation_id = id
  )
  OR
  created_by = auth.uid() -- Allow creator to see it even before participants are added
);

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Participants
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants FOR SELECT
USING (
  auth.uid() = profile_id OR
  conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants WHERE profile_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Authenticated users can add participants"
ON public.conversation_participants FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants WHERE profile_id = auth.uid()
  )
);


-- ==========================================
-- 3. GROUPS & FORUM
-- ==========================================

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS for Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policies for Groups (Simplifying for robustness)
DROP POLICY IF EXISTS "Groups are viewable by everyone authenticated" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;

CREATE POLICY "Groups are viewable by everyone authenticated"
ON public.groups FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create groups"
ON public.groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for Group Members
DROP POLICY IF EXISTS "Group members are viewable by authenticated users" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;

CREATE POLICY "Group members are viewable by authenticated users"
ON public.group_members FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join groups"
ON public.group_members FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Policies for Posts
DROP POLICY IF EXISTS "Posts are viewable by group members" ON public.posts;
DROP POLICY IF EXISTS "Members can create posts" ON public.posts;

CREATE POLICY "Posts are viewable by group members"
ON public.posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = posts.group_id AND profile_id = auth.uid()
  )
);

CREATE POLICY "Members can create posts"
ON public.posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = posts.group_id AND profile_id = auth.uid()
  )
);

-- Policies for Comments
DROP POLICY IF EXISTS "Comments are viewable by group members" ON public.comments;
DROP POLICY IF EXISTS "Members can create comments" ON public.comments;

CREATE POLICY "Comments are viewable by group members"
ON public.comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    JOIN public.group_members ON posts.group_id = group_members.group_id
    WHERE posts.id = comments.post_id AND group_members.profile_id = auth.uid()
  )
);

CREATE POLICY "Members can create comments"
ON public.comments FOR INSERT
WITH CHECK (auth.role() = 'authenticated'); 

-- Policies for Likes
DROP POLICY IF EXISTS "Post likes are viewable by group members" ON public.post_likes;
DROP POLICY IF EXISTS "Members can toggle likes" ON public.post_likes;

CREATE POLICY "Post likes are viewable by group members"
ON public.post_likes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    JOIN public.group_members ON posts.group_id = group_members.group_id
    WHERE posts.id = post_likes.post_id AND group_members.profile_id = auth.uid()
  )
);

CREATE POLICY "Members can toggle likes"
ON public.post_likes FOR ALL
USING (auth.role() = 'authenticated');

-- Likes Trigger
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_change ON public.post_likes;
CREATE TRIGGER on_like_change
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_like();

-- Sample Groups (Idempotent)
INSERT INTO public.groups (name, description, image_url, created_by)
SELECT 'أمهات جدد', 'نصائح ودعم للأمهات في السنة الأولى.', NULL, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE name = 'أمهات جدد');

INSERT INTO public.groups (name, description, image_url, created_by)
SELECT 'التوحد والدعم', 'مساحة آمنة لمشاركة التحديات والانتصارات.', NULL, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE name = 'التوحد والدعم');
