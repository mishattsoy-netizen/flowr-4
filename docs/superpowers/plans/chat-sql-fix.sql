-- Corrected SQL for Chat System
-- Run this in your Supabase SQL Editor if you encounter "Failed to load conversations" errors.

-- 1. Create conversations table if it doesn't exist, or add missing column
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text default 'New Chat',
  is_archived boolean default false, -- This was missing in the previous SQL snippet
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create messages table if it doesn't exist
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS (if not already enabled)
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- 4. Re-create policies (using do block to avoid "already exists" errors)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can manage their own conversations') then
    create policy "Users can manage their own conversations" on public.conversations
      for all using (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Users can manage their own messages') then
    create policy "Users can manage their own messages" on public.messages
      for all using (
        exists (
          select 1 from public.conversations
          where id = messages.conversation_id and user_id = auth.uid()
        )
      );
  end if;
end
$$;

-- 5. Indexes
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
