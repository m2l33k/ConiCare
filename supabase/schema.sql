-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create Enums
create type user_role as enum ('admin', 'specialist', 'mother');
create type assessment_type as enum ('VIDEO_AI', 'GAME_SCORE');
create type appointment_status as enum ('scheduled', 'completed', 'cancelled');
create type assignment_status as enum ('pending', 'active', 'archived');

-- Create Profiles Table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null default 'mother',
  full_name text,
  avatar_url text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Children Table
create table children (
  id uuid default uuid_generate_v4() primary key,
  mother_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  dob date not null,
  gender text,
  diagnosis_tags text[], -- Array of strings for tags like ['Autism', 'ADHD']
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Specialist Assignments Table
create table specialist_assignments (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references children(id) on delete cascade not null,
  specialist_id uuid references profiles(id) on delete cascade not null,
  status assignment_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(child_id, specialist_id)
);

-- Create Assessments Table
create table assessments (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references children(id) on delete cascade not null,
  type assessment_type not null,
  media_url text, -- URL to video or image in storage
  ai_result_json jsonb, -- JSON result from AI analysis
  specialist_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Game Sessions Table
create table game_sessions (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references children(id) on delete cascade not null,
  game_type text not null, -- e.g., 'Memory Match', 'Logic Puzzle'
  score int not null default 0,
  duration_seconds int not null default 0,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Appointments Table
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  mother_id uuid references profiles(id) on delete cascade not null,
  specialist_id uuid references profiles(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  meeting_link text,
  status appointment_status default 'scheduled',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table children enable row level security;
alter table specialist_assignments enable row level security;
alter table assessments enable row level security;
alter table game_sessions enable row level security;
alter table appointments enable row level security;

-- RLS Policies

-- Profiles: Users can view their own profile.
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Profiles: Admins can view all profiles.
-- Note: Requires a way to identify admins securely. For simplicity here, we assume a setup where admins can bypass or we check a claim. 
-- A common pattern is using a function or just checking the role if the user can read their own role first.
-- For this schema, we will allow any authenticated user to read profiles (needed for specialists to see mothers, mothers to see specialists).
create policy "Any authenticated user can view profiles" on profiles
  for select using (auth.role() = 'authenticated');

-- Profiles: Users can update their own profile.
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Children: Mothers can view/edit their own children.
create policy "Mothers can view own children" on children
  for select using (auth.uid() = mother_id);

create policy "Mothers can insert own children" on children
  for insert with check (auth.uid() = mother_id);

create policy "Mothers can update own children" on children
  for update using (auth.uid() = mother_id);

-- Children: Specialists can view children they are assigned to.
create policy "Specialists can view assigned children" on children
  for select using (
    exists (
      select 1 from specialist_assignments
      where specialist_assignments.child_id = children.id
      and specialist_assignments.specialist_id = auth.uid()
    )
  );

-- Specialist Assignments: Specialists can view their assignments.
create policy "Specialists can view own assignments" on specialist_assignments
  for select using (specialist_id = auth.uid());

-- Specialist Assignments: Mothers can view assignments for their children.
create policy "Mothers can view assignments for their children" on specialist_assignments
  for select using (
    exists (
      select 1 from children
      where children.id = specialist_assignments.child_id
      and children.mother_id = auth.uid()
    )
  );

-- Assessments: Mothers can view their children's assessments.
create policy "Mothers can view own children's assessments" on assessments
  for select using (
    exists (
      select 1 from children
      where children.id = assessments.child_id
      and children.mother_id = auth.uid()
    )
  );

-- Assessments: Specialists can view/create assessments for assigned children.
create policy "Specialists can view assigned children's assessments" on assessments
  for select using (
    exists (
      select 1 from specialist_assignments
      where specialist_assignments.child_id = assessments.child_id
      and specialist_assignments.specialist_id = auth.uid()
    )
  );
  
create policy "Specialists can create assessments for assigned children" on assessments
  for insert with check (
    exists (
      select 1 from specialist_assignments
      where specialist_assignments.child_id = assessments.child_id
      and specialist_assignments.specialist_id = auth.uid()
    )
  );

-- Game Sessions: Mothers can view.
create policy "Mothers can view own children's game sessions" on game_sessions
  for select using (
    exists (
      select 1 from children
      where children.id = game_sessions.child_id
      and children.mother_id = auth.uid()
    )
  );

-- Game Sessions: Insert allowed for authenticated users (assuming the app inserts this).
-- Ideally, we'd check if the user is the mother of the child, but the child might be playing on a device logged in as the mother.
create policy "Mothers can insert game sessions for own children" on game_sessions
  for insert with check (
    exists (
      select 1 from children
      where children.id = game_sessions.child_id
      and children.mother_id = auth.uid()
    )
  );

-- Appointments: Users can view their own appointments.
create policy "Users can view own appointments" on appointments
  for select using (mother_id = auth.uid() or specialist_id = auth.uid());

-- Triggers for User Creation (Handle new user signup)
-- This function automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', (new.raw_user_meta_data->>'role')::user_role);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
