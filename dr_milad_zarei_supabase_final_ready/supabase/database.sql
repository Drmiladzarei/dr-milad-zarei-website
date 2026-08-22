-- Supabase database schema
create table if not exists articles (id uuid primary key default gen_random_uuid(), title text not null, content text, image text, created_at timestamptz default now());
create table if not exists gallery (id uuid primary key default gen_random_uuid(), title text, image text not null, created_at timestamptz default now());
create table if not exists education (id uuid primary key default gen_random_uuid(), title text, video_url text, description text, created_at timestamptz default now());
create table if not exists consultations (id uuid primary key default gen_random_uuid(), name text, phone text, message text, created_at timestamptz default now());

alter table articles enable row level security;
alter table gallery enable row level security;
alter table education enable row level security;
alter table consultations enable row level security;

create policy "public read" on articles for select using (true);
create policy "public read gallery" on gallery for select using (true);
create policy "public read education" on education for select using (true);
create policy "public insert consultation" on consultations for insert with check (true);
