-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create Enums
create type user_role as enum ('admin', 'specialist', 'guardian');
create type assessment_type as enum ('VIDEO_AI', 'GAME_SCORE');
create type appointment_status as enum ('scheduled', 'completed', 'cancelled');

-- Create Profiles Table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role not null default 'guardian',
  full_name text,
  avatar_url text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Patients Table (formerly children)
create table patients (
  id uuid default uuid_generate_v4() primary key,
  parent_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  dob date not null,
  diagnosis text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Assessments Table
create table assessments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  video_url text, -- URL to video in storage bucket 'assessments'
  ai_analysis_json jsonb, -- JSON result from AI analysis
  specialist_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Game Results Table
create table game_results (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  game_type text not null,
  score int not null default 0,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Appointments Table
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  specialist_id uuid references profiles(id) on delete cascade not null,
  parent_id uuid references profiles(id) on delete cascade not null,
  meeting_link text,
  time timestamp with time zone not null,
  status appointment_status default 'scheduled',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table patients enable row level security;
alter table assessments enable row level security;
alter table game_results enable row level security;
alter table appointments enable row level security;

-- RLS Policies

-- Profiles: Users can view their own profile.
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
  
-- Profiles: Specialists and Admins can view all profiles (simplified for context)
create policy "Staff can view all profiles" on profiles
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role in ('specialist', 'admin')
    )
  );

-- Patients: Parents can view own children.
create policy "Parents can view own patients" on patients
  for select using (parent_id = auth.uid());
  
-- Patients: Specialists can view all patients (or assigned ones - simplified to all for now)
create policy "Specialists can view all patients" on patients
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'specialist'
    )
  );

-- Assessments: Parents can view own child's assessments.
create policy "Parents can view own assessments" on assessments
  for select using (
    exists (
      select 1 from patients
      where patients.id = assessments.patient_id
      and patients.parent_id = auth.uid()
    )
  );

-- Assessments: Specialists can view all assessments.
create policy "Specialists can view all assessments" on assessments
  for select using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'specialist'
    )
  );

-- Triggers for User Creation
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
