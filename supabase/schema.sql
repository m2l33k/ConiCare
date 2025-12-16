-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('parent', 'specialist', 'admin')) not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Children Table
create table public.children (
  id uuid default uuid_generate_v4() primary key,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  pin_code text default '1234' not null,
  avatar_theme text default 'default',
  age integer,
  conditions text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Assessments Table
create table public.assessments (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  video_path text not null,
  status text check (status in ('pending', 'reviewed')) default 'pending' not null,
  specialist_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Game Scores Table
create table public.game_scores (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  game_name text not null,
  score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.assessments enable row level security;
alter table public.game_scores enable row level security;

-- RLS Policies

-- Profiles:
-- Users can read/update their own profile.
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Children:
-- Parents can view/edit their own children.
create policy "Parents can view their own children" on public.children
  for select using (auth.uid() = parent_id);

create policy "Parents can insert their own children" on public.children
  for insert with check (auth.uid() = parent_id);

create policy "Parents can update their own children" on public.children
  for update using (auth.uid() = parent_id);

-- Specialists can view all children (for now, or assigned ones). 
-- Assuming 'specialist' role can view all for this MVP.
create policy "Specialists can view all children" on public.children
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'specialist'
    )
  );

-- Assessments:
-- Parents can view their children's assessments.
create policy "Parents can view their children's assessments" on public.assessments
  for select using (
    exists (
      select 1 from public.children
      where children.id = assessments.child_id and children.parent_id = auth.uid()
    )
  );

-- Parents can upload assessments.
create policy "Parents can insert assessments" on public.assessments
  for insert with check (
    exists (
      select 1 from public.children
      where children.id = assessments.child_id and children.parent_id = auth.uid()
    )
  );

-- Specialists can view and update assessments.
create policy "Specialists can view assessments" on public.assessments
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'specialist'
    )
  );

create policy "Specialists can update assessments" on public.assessments
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'specialist'
    )
  );


-- STORAGE BUCKET SETUP (Run this in Supabase SQL Editor)
-- 1. Create the 'assessments' bucket
insert into storage.buckets (id, name, public)
values ('assessments', 'assessments', true)
on conflict (id) do nothing;

-- 2. Storage Policies
-- Allow public access to read (or restrict to authenticated users)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'assessments' );

-- Allow authenticated users to upload
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'assessments' and auth.role() = 'authenticated' );
