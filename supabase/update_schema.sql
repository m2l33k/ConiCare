-- 1. Update Conversations Table to handle RLS on creation
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Update RLS for conversations to allow creator to view it immediately
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        (created_by = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = id AND profile_id = auth.uid()
        )
    );

-- 2. Create Groups Tables (Fixes /groups page)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, profile_id)
);

-- Enable RLS for Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policies for Groups
CREATE POLICY "Groups are viewable by everyone" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Group members viewable by everyone" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- 3. Seed Groups Data
INSERT INTO public.groups (name, description, image_url)
VALUES 
    ('أمهات جدد', 'نصائح ودعم للأمهات في السنة الأولى.', 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=100&h=100'),
    ('التوحد والدعم', 'مساحة آمنة لمشاركة التحديات والانتصارات مع أطفال التوحد.', 'https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?auto=format&fit=crop&w=100&h=100'),
    ('تأخر النطق', 'استراتيجيات وتمارين منزلية لتحسين النطق عند الأطفال.', 'https://images.unsplash.com/photo-1516627145497-ae6963d5c94b?auto=format&fit=crop&w=100&h=100'),
    ('تغذية الطفل', 'وصفات صحية ونصائح للتعامل مع انتقائية الطعام.', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=100&h=100')
ON CONFLICT DO NOTHING;

-- 4. Safety Net: Ensure all auth users have profiles
-- This fixes the issue if the user is logged in but doesn't have a profile yet
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'User'), 
    COALESCE(raw_user_meta_data->>'role', 'parent')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
