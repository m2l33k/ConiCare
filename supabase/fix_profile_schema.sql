-- Fix for missing updated_at column in profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Fix for missing updated_at column in specialist_details (just in case)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'specialist_details' AND column_name = 'updated_at') THEN
        ALTER TABLE public.specialist_details ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Reload the schema cache to ensure the new columns are detected
NOTIFY pgrst, 'reload config';
