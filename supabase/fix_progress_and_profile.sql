-- FIX PROGRESS, GAMES, AND PROFILE SCHEMA

-- 1. Ensure 'prescriptions' table exists
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  specialist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  game_name TEXT NOT NULL,
  frequency TEXT, -- e.g. "Daily", "Weekly"
  duration TEXT, -- e.g. "15 mins"
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure 'game_scores' table exists
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  game_id UUID, -- Optional FK to games table
  game_name TEXT NOT NULL, -- Fallback if game_id is null
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ensure 'games' table exists
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  icon_url TEXT,
  difficulty_level TEXT DEFAULT 'Medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Simple ones for now)

-- Prescriptions
DROP POLICY IF EXISTS "view_prescriptions" ON public.prescriptions;
CREATE POLICY "view_prescriptions" ON public.prescriptions FOR SELECT USING (true);
DROP POLICY IF EXISTS "insert_prescriptions" ON public.prescriptions;
CREATE POLICY "insert_prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (true);

-- Game Scores
DROP POLICY IF EXISTS "view_scores" ON public.game_scores;
CREATE POLICY "view_scores" ON public.game_scores FOR SELECT USING (true);
DROP POLICY IF EXISTS "insert_scores" ON public.game_scores;
CREATE POLICY "insert_scores" ON public.game_scores FOR INSERT WITH CHECK (true);

-- Games
DROP POLICY IF EXISTS "view_games" ON public.games;
CREATE POLICY "view_games" ON public.games FOR SELECT USING (true);

-- 6. Seed Games (if empty)
INSERT INTO public.games (title, category, description, difficulty_level, icon_url)
SELECT 'Memory Match', 'Cognition', 'Improve memory by matching pairs of cards.', 'Easy', 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE title = 'Memory Match');

INSERT INTO public.games (title, category, description, difficulty_level, icon_url)
SELECT 'Pattern Puzzle', 'Logic', 'Complete the sequence of shapes and colors.', 'Medium', 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE title = 'Pattern Puzzle');

INSERT INTO public.games (title, category, description, difficulty_level, icon_url)
SELECT 'Emotion Identifier', 'Social', 'Identify the correct emotion shown in the picture.', 'Hard', 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'
WHERE NOT EXISTS (SELECT 1 FROM public.games WHERE title = 'Emotion Identifier');

-- 7. Ensure 'children' table exists (Critical for linking)
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  diagnosis TEXT,
  pin_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "view_children" ON public.children;
CREATE POLICY "view_children" ON public.children FOR SELECT USING (true);
DROP POLICY IF EXISTS "insert_children" ON public.children;
CREATE POLICY "insert_children" ON public.children FOR INSERT WITH CHECK (true);

