-- 1. Enhance specialist_details table structure
ALTER TABLE public.specialist_details 
ADD COLUMN IF NOT EXISTS working_hours text,
ADD COLUMN IF NOT EXISTS qualifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS patients_helped text;

-- 2. Insert/Update Dr. Sarah Ahmed (Example Data)
-- First, ensure the profile exists (This is tricky without knowing the ID, so we assume a profile might exist or we insert one)
-- For the purpose of this script, we will try to find a specialist profile or create a placeholder if possible.
-- ideally, you run this after creating the user in Auth.

-- Let's assume we want to update ANY specialist with 'أخصائي نطق وتخاطب' to have these details for the demo.
UPDATE public.specialist_details
SET 
  working_hours = 'Sun - Thu, 9AM - 5PM',
  qualifications = '[
    {"degree": "PhD in Child Psychology", "school": "King Saud University", "year": "2018"},
    {"degree": "Master in Behavioral Therapy", "school": "Boston University", "year": "2015"}
  ]'::jsonb,
  reviews_count = 124,
  patients_helped = '2k+',
  location = 'الرياض، المملكة العربية السعودية',
  bio = 'دكتورة سارة لديها خبرة واسعة في التعامل مع حالات تأخر النطق عند الأطفال. حاصلة على ماجستير في علوم التخاطب من جامعة القاهرة.',
  rating = 4.9,
  experience_years = 12,
  available = true
WHERE specialty = 'أخصائي نطق وتخاطب';
