create extension if not exists "uuid-ossp";

create table if not exists children (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  avatar_emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  type text not null check (type in ('deposit', 'withdraw')),
  amount integer not null,
  memo text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade not null,
  title text not null,
  target_amount integer not null,
  current_amount integer default 0 not null,
  is_achieved boolean default false not null
);

create table if not exists chores (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade,
  title text not null,
  reward_amount integer not null,
  status text not null check (status in ('pending', 'requested', 'approved')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table children enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table chores enable row level security;

drop policy if exists "Allow public access" on children;
create policy "Allow public access" on children for all using (true) with check (true);

drop policy if exists "Allow public access" on transactions;
create policy "Allow public access" on transactions for all using (true) with check (true);

drop policy if exists "Allow public access" on goals;
create policy "Allow public access" on goals for all using (true) with check (true);

drop policy if exists "Allow public access" on chores;
create policy "Allow public access" on chores for all using (true) with check (true);
