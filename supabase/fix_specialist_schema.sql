-- Fix for missing columns in specialist_details
-- This script ensures all required columns exist, even if the table was created previously without them.

DO $$
BEGIN
    -- 1. Ensure the table exists
    CREATE TABLE IF NOT EXISTS public.specialist_details (
        id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE
    );

    -- 2. Add 'credentials' column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'specialist_details' AND column_name = 'credentials') THEN
        ALTER TABLE public.specialist_details ADD COLUMN credentials JSONB;
    END IF;

    -- 3. Add 'specialization' column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'specialist_details' AND column_name = 'specialization') THEN
        ALTER TABLE public.specialist_details ADD COLUMN specialization TEXT;
    END IF;

    -- 4. Add 'bio' column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'specialist_details' AND column_name = 'bio') THEN
        ALTER TABLE public.specialist_details ADD COLUMN bio TEXT;
    END IF;

    -- 5. Add 'experience_years' column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'specialist_details' AND column_name = 'experience_years') THEN
        ALTER TABLE public.specialist_details ADD COLUMN experience_years INTEGER;
    END IF;

    -- 6. Add 'hourly_rate' column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'specialist_details' AND column_name = 'hourly_rate') THEN
        ALTER TABLE public.specialist_details ADD COLUMN hourly_rate DECIMAL(10, 2);
    END IF;

    -- 7. Add 'updated_at' column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'specialist_details' AND column_name = 'updated_at') THEN
        ALTER TABLE public.specialist_details ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 8. Enable RLS if not already enabled (idempotent)
ALTER TABLE public.specialist_details ENABLE ROW LEVEL SECURITY;

-- 9. Add policies if they don't exist (Drop first to ensure update)
DROP POLICY IF EXISTS "Public view specialist details" ON public.specialist_details;
CREATE POLICY "Public view specialist details" ON public.specialist_details
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Specialists can update their own details" ON public.specialist_details;
CREATE POLICY "Specialists can update their own details" ON public.specialist_details
  FOR ALL USING (auth.uid() = id);

-- 10. Reload the schema cache
NOTIFY pgrst, 'reload config';
