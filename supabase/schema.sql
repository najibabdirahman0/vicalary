-- Run this script once in your Supabase Dashboard -> SQL Editor
-- Project: https://ledujricqxsoukolraam.supabase.co

create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null check (char_length(trim(email)) between 3 and 254),
  message text not null check (char_length(trim(message)) between 1 and 5000),
  recipient text not null default 'vicalaryii@gmail.com',
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed')),
  delivery_provider text,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_created_at
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- Allow backend / client inserts while preventing public reads, edits, or deletes
drop policy if exists "Allow anonymous contact message inserts" on public.contact_messages;
create policy "Allow anonymous contact message inserts"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) between 1 and 120
    and char_length(trim(email)) between 3 and 254
    and char_length(trim(message)) between 1 and 5000
  );

revoke all on table public.contact_messages from anon, authenticated;
grant insert on table public.contact_messages to anon, authenticated;
grant all on table public.contact_messages to service_role;
