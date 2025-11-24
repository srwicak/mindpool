-- Create sessions table
create table public.sessions (
  id uuid not null default gen_random_uuid (),
  title text not null,
  description text null,
  created_at timestamp with time zone not null default now(),
  constraint sessions_pkey primary key (id)
);

-- Create boards table
create table public.boards (
  id uuid not null default gen_random_uuid (),
  session_id uuid not null,
  name text not null,
  created_at timestamp with time zone not null default now(),
  constraint boards_pkey primary key (id),
  constraint boards_session_id_fkey foreign key (session_id) references sessions (id) on delete cascade
);

-- Create notes table
create table public.notes (
  id uuid not null default gen_random_uuid (),
  board_id uuid not null,
  column_type text not null,
  author_name text not null,
  content text not null,
  highlighted boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint notes_pkey primary key (id),
  constraint notes_board_id_fkey foreign key (board_id) references boards (id) on delete cascade
);

-- Enable Realtime for notes
alter publication supabase_realtime add table notes;

-- RLS Policies (Simple public access for workshop demo)
alter table public.sessions enable row level security;
alter table public.boards enable row level security;
alter table public.notes enable row level security;

create policy "Enable read access for all users" on public.sessions for select using (true);
create policy "Enable insert access for all users" on public.sessions for insert with check (true);

create policy "Enable read access for all users" on public.boards for select using (true);
create policy "Enable insert access for all users" on public.boards for insert with check (true);

create policy "Enable read access for all users" on public.notes for select using (true);
create policy "Enable insert access for all users" on public.notes for insert with check (true);
create policy "Enable update access for all users" on public.notes for update using (true);
