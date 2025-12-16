-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('parent', 'specialist', 'admin')) not null,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Children Table
create table public.children (
  id uuid default uuid_generate_v4() primary key,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  pin_code text default '1234' not null,
  avatar_theme text default 'default',
  birth_date date,
  gender text,
  conditions text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Specialists Guide & Directory
create table public.specialist_details (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  specialty text not null, -- e.g. "Speech Therapist", "Psychologist"
  bio text,
  experience_years integer,
  rating numeric(3,2) default 5.00,
  available boolean default true,
  location text
);

-- 4. Messages / Chat System
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  primary key (conversation_id, profile_id)
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Groups (Community)
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member', -- member, admin
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, profile_id)
);

create table public.group_posts (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Clips (Educational Content)
create table public.clips (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  category text, -- e.g. "Speech", "Motor Skills"
  duration integer, -- in seconds
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Game Zone (Games Metadata)
create table public.games (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  icon_url text,
  category text,
  difficulty_level text,
  play_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Game Scores (Progress)
create table public.game_scores (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade, -- Optional link to games table
  game_name text, -- Fallback if game_id is null
  score integer not null,
  played_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Assessments
create table public.assessments (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  video_path text not null,
  status text check (status in ('pending', 'reviewed')) default 'pending' not null,
  specialist_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Consultations (Appointments)
create table public.consultations (
  id uuid default uuid_generate_v4() primary key,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  specialist_id uuid references public.profiles(id) on delete set null,
  child_id uuid references public.children(id) on delete set null,
  scheduled_at timestamp with time zone not null,
  status text default 'scheduled', -- scheduled, completed, cancelled
  meeting_link text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Clinical Notes
create table public.clinical_notes (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  specialist_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Prescriptions
create table public.prescriptions (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  specialist_id uuid references public.profiles(id) on delete set null,
  game_id uuid references public.games(id) on delete set null,
  game_name text,
  frequency text,
  duration text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Simplified for brevity, but critical for security)
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.specialist_details enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_posts enable row level security;
alter table public.clips enable row level security;
alter table public.games enable row level security;
alter table public.game_scores enable row level security;
alter table public.assessments enable row level security;
alter table public.consultations enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.prescriptions enable row level security;

-- Basic Public Read Policies (for demo purposes, refine for production)
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Specialist details viewable by everyone." on public.specialist_details for select using (true);
create policy "Clips viewable by everyone." on public.clips for select using (true);
create policy "Games viewable by everyone." on public.games for select using (true);
create policy "Groups viewable by everyone." on public.groups for select using (true);
create policy "Group posts viewable by everyone." on public.group_posts for select using (true);

-- User Specific Policies
create policy "Users can manage own children" on public.children for all using (auth.uid() = parent_id);
create policy "Parents manage consultations" on public.consultations for all using (auth.uid() = parent_id);
create policy "Specialists manage consultations" on public.consultations for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'specialist'));

-- Storage Buckets
insert into storage.buckets (id, name, public) values ('assessments', 'assessments', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('clips', 'clips', true) on conflict (id) do nothing;
