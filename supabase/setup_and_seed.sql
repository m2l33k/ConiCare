-- 1. Create Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('parent', 'specialist', 'admin')) not null default 'parent',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist (in case table already existed without them)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Specialist Details Table (if not exists)
CREATE TABLE IF NOT EXISTS public.specialist_details (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  specialty text not null,
  bio text,
  experience_years integer,
  rating numeric(3,2) default 5.00,
  available boolean default true,
  location text
);

-- Enable RLS on specialist_details
ALTER TABLE public.specialist_details ENABLE ROW LEVEL SECURITY;

-- 3. Enhance Specialist Details with new columns
ALTER TABLE public.specialist_details 
ADD COLUMN IF NOT EXISTS working_hours text,
ADD COLUMN IF NOT EXISTS qualifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS patients_helped text;

-- 4. Create Trigger for New Users
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'parent')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Backfill Profiles for existing users (Safe run)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'parent' 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- 6. Seed/Update a Sample Specialist
-- We will try to pick the first user and make them a specialist for demo purposes
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the first user (just for demo/dev environment)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Make this user a specialist
    UPDATE public.profiles 
    SET role = 'specialist', full_name = 'د. سارة أحمد'
    WHERE id = v_user_id;

    -- Insert or Update specialist details
    INSERT INTO public.specialist_details (
      id, specialty, bio, experience_years, rating, available, location, 
      working_hours, qualifications, reviews_count, patients_helped
    ) VALUES (
      v_user_id,
      'أخصائي نطق وتخاطب',
      'دكتورة سارة لديها خبرة واسعة في التعامل مع حالات تأخر النطق عند الأطفال. حاصلة على ماجستير في علوم التخاطب من جامعة القاهرة.',
      12,
      4.9,
      true,
      'الرياض، المملكة العربية السعودية',
      'Sun - Thu, 9AM - 5PM',
      '[
        {"degree": "PhD in Child Psychology", "school": "King Saud University", "year": "2018"},
        {"degree": "Master in Behavioral Therapy", "school": "Boston University", "year": "2015"}
      ]'::jsonb,
      124,
      '2k+'
    )
    ON CONFLICT (id) DO UPDATE SET
      working_hours = EXCLUDED.working_hours,
      qualifications = EXCLUDED.qualifications,
      reviews_count = EXCLUDED.reviews_count,
      patients_helped = EXCLUDED.patients_helped,
      bio = EXCLUDED.bio,
      rating = EXCLUDED.rating,
      location = EXCLUDED.location;
      
  END IF;
END $$;
