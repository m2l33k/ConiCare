-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 0. Cleanup Triggers (Prevent interference during seed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 1. Fix Profiles Table (Add email if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. Create/Update Tables

-- Create specialist_details if not exists
CREATE TABLE IF NOT EXISTS public.specialist_details (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialty TEXT,
    bio TEXT,
    rating NUMERIC(2, 1),
    experience_years INTEGER,
    location TEXT,
    available BOOLEAN DEFAULT true,
    working_hours TEXT,
    qualifications JSONB,
    reviews_count INTEGER DEFAULT 0,
    patients_helped TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations if not exists
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_participants if not exists
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, profile_id)
);

-- Create messages if not exists
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations if not exists (for booking)
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultation_date DATE NOT NULL,
    consultation_time TIME NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Drop and Recreate Policies (Fixes 42710)
DO $$ 
BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
    
    -- Specialist Details
    DROP POLICY IF EXISTS "Specialist details viewable by everyone." ON public.specialist_details;
    DROP POLICY IF EXISTS "Specialists can update own details." ON public.specialist_details;

    -- Conversations
    DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

    -- Participants
    DROP POLICY IF EXISTS "Participants viewable by members" ON public.conversation_participants;
    DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;

    -- Messages
    DROP POLICY IF EXISTS "Messages viewable by conversation members" ON public.messages;
    DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
    
    -- Consultations
    DROP POLICY IF EXISTS "Users can view their own consultations" ON public.consultations;
    DROP POLICY IF EXISTS "Users can create consultations" ON public.consultations;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Recreate Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Specialist details viewable by everyone." ON public.specialist_details FOR SELECT USING (true);
CREATE POLICY "Specialists can update own details." ON public.specialist_details FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = id AND profile_id = auth.uid()
    ));
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants viewable by members" ON public.conversation_participants
    FOR SELECT USING (
        profile_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND cp.profile_id = auth.uid()
        )
    );
CREATE POLICY "Users can join conversations" ON public.conversation_participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Messages viewable by conversation members" ON public.messages
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.conversation_participants 
        WHERE conversation_id = messages.conversation_id AND profile_id = auth.uid()
    ));
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their own consultations" ON public.consultations
    FOR SELECT USING (auth.uid() = specialist_id OR auth.uid() = parent_id);
CREATE POLICY "Users can create consultations" ON public.consultations FOR INSERT WITH CHECK (auth.uid() = parent_id);


-- 4. Seed Data (Upsert to avoid duplicates)

-- 4.1 Create Auth Users (Required for Foreign Key Constraints)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'd0d0d0d0-d0d0-4d0d-8d0d-0d0d0d0d0d01',
    'authenticated',
    'authenticated',
    'sara@cognicare.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name": "د. سارة أحمد", "role": "specialist"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    'd0d0d0d0-d0d0-4d0d-8d0d-0d0d0d0d0d02',
    'authenticated',
    'authenticated',
    'khalid@cognicare.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name": "أ. خالد العمري", "role": "specialist"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    'd0d0d0d0-d0d0-4d0d-8d0d-0d0d0d0d0d03',
    'authenticated',
    'authenticated',
    'layla@cognicare.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name": "د. ليلى حسن", "role": "specialist"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    'a0a0a0a0-a0a0-4a0a-8a0a-0a0a0a0a0a01', -- Fixed UUID (replaced p with a)
    'authenticated',
    'authenticated',
    'parent@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name": "أم عبدالله", "role": "parent"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

-- 4.2 Insert Specialists into Profiles
INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
VALUES 
    ('d0d0d0d0-d0d0-4d0d-8d0d-0d0d0d0d0d01', 'sara@cognicare.com', 'د. سارة أحمد', 'specialist', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara'),
    ('d0d0d0d0-d0d0-4d0d-8d0d-0d0d0d0d0d02', 'khalid@cognicare.com', 'أ. خالد العمري', 'specialist', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid'),
    ('d0d0d0d0-d0d0-4d0d-8d0d-0d0d0d0d0d03', 'layla@cognicare.com', 'د. ليلى حسن', 'specialist', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Layla')
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role, avatar_url = EXCLUDED.avatar_url;

-- 4.3 Insert Specialist Details
INSERT INTO public.specialist_details (id, specialty, bio, rating, experience_years, location, available, working_hours, qualifications, reviews_count, patients_helped)
VALUES 
    ('d0d0d0d0-d0d0-4d0d-8d0d-0d0d0d0d0d01', 'أخصائي نطق وتخاطب', 'دكتورة سارة لديها خبرة واسعة في التعامل مع حالات تأخر النطق عند الأطفال. حاصلة على ماجستير في علوم التخاطب من جامعة القاهرة.', 4.9, 12, 'الرياض، المملكة العربية السعودية', true, 'Sun - Thu, 9AM - 5PM', '[{"degree": "PhD in Child Psychology", "school": "King Saud University", "year": "2018"}, {"degree": "Master in Behavioral Therapy", "school": "Boston University", "year": "2015"}]'::jsonb, 124, '2k+'),
    ('d0d0d0d0-d0d0-4d0d-8d0d-0d0d0d0d0d02', 'أخصائي توحد', 'خالد متخصص في برامج التدخل المبكر لأطفال التوحد، معتمد من البورد الأمريكي لتحليل السلوك.', 4.8, 8, 'جدة، المملكة العربية السعودية', true, 'Sun - Thu, 10AM - 6PM', '[{"degree": "Master in Special Education", "school": "University of Jeddah", "year": "2016"}]'::jsonb, 85, '1.5k+'),
    ('d0d0d0d0-d0d0-4d0d-8d0d-0d0d0d0d0d03', 'أخصائي تعديل سلوك', 'د. ليلى خبيرة في تعديل السلوك والمشكلات النفسية لدى الأطفال والمراهقين.', 4.9, 15, 'الدمام، المملكة العربية السعودية', false, 'Mon - Fri, 8AM - 4PM', '[{"degree": "PhD in Clinical Psychology", "school": "University of Dammam", "year": "2010"}]'::jsonb, 200, '3k+')
ON CONFLICT (id) DO UPDATE 
SET specialty = EXCLUDED.specialty, bio = EXCLUDED.bio, rating = EXCLUDED.rating, working_hours = EXCLUDED.working_hours, qualifications = EXCLUDED.qualifications, reviews_count = EXCLUDED.reviews_count, patients_helped = EXCLUDED.patients_helped;

-- 4.4 Insert Sample Parent for Testing
INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
VALUES 
    ('a0a0a0a0-a0a0-4a0a-8a0a-0a0a0a0a0a01', 'parent@test.com', 'أم عبدالله', 'parent', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Parent1')
ON CONFLICT (id) DO NOTHING;

-- 5. Trigger to automatically create profile for new users (if not exists)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'parent'), new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger check (Drop if exists to avoid error)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
