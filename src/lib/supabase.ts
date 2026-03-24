import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured with valid credentials
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-url.supabase.co' &&
  supabaseUrl.startsWith('https://')
);

/**
 * Supabase client instance.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

/**
 * Checks if the Supabase connection is healthy.
 */
export async function checkSupabaseConnection(): Promise<{ 
  connected: boolean; 
  mode: 'supabase' | 'local'; 
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return { connected: true, mode: 'local' };
  }

  try {
    // Try to fetch a single row from a common table
    const { error } = await supabase.from('vocabulary').select('id', { count: 'exact', head: true }).limit(1);
    
    if (error) {
      // If it's a 401, it might just mean we're not logged in, which is fine for "connected"
      if (error.code === 'PGRST301' || (error as any).status === 401) {
        return { connected: true, mode: 'supabase' };
      }
      // Table exists but empty is also fine
      if (error.code === 'PGRST116') {
        return { connected: true, mode: 'supabase' };
      }
      throw error;
    }
    
    return { connected: true, mode: 'supabase' };
  } catch (err: any) {
    console.error('Supabase connection check failed:', err);
    return { 
      connected: false, 
      mode: 'supabase', 
      error: err.message || 'Unknown connection error'
    };
  }
}

/**
 * PRODUCTION DATABASE SCHEMA (SQL for Supabase SQL Editor)
 * 
 * -- 1. Profiles table (Extends Auth.Users)
 * create table profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   email text unique,
 *   full_name text,
 *   avatar_url text,
 *   streak integer default 0,
 *   level integer default 1,
 *   points integer default 0,
 *   target_language text default 'English',
 *   daily_goal integer default 15,
 *   theme text default 'system',
 *   notifications_enabled boolean default true,
 *   last_study_date timestamp with time zone,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   updated_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- 2. Vocabulary table
 * create table vocabulary (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade not null,
 *   text text not null,
 *   ipa text,
 *   meaning text,
 *   example text,
 *   translation text,
 *   source_speech_id text,
 *   source_sentence_id text,
 *   mastery integer default 0,
 *   srs_level text default 'NEW',
 *   next_review timestamp with time zone default timezone('utc'::text, now()),
 *   last_reviewed timestamp with time zone,
 *   is_difficult boolean default false,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- 3. Progress table (Speech-specific progress)
 * create table progress (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade not null,
 *   speech_id text not null,
 *   last_position float default 0,
 *   completed_sentence_ids text[] default '{}',
 *   difficult_sentence_ids text[] default '{}',
 *   saved_words_count integer default 0,
 *   total_time_spent integer default 0,
 *   last_studied_at timestamp with time zone default timezone('utc'::text, now()),
 *   updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   unique(user_id, speech_id)
 * );
 * 
 * -- 4. Sessions table (Shadowing history)
 * create table sessions (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade not null,
 *   speech_id text not null,
 *   start_time timestamp with time zone not null,
 *   end_time timestamp with time zone not null,
 *   duration integer not null,
 *   sentences_completed integer default 0,
 *   difficult_sentences_reviewed integer default 0,
 *   words_saved integer default 0,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- 5. Pronunciation Attempts
 * create table pronunciation_attempts (
 *   id uuid default uuid_generate_v4() primary key,
 *   user_id uuid references auth.users on delete cascade not null,
 *   text text not null,
 *   ipa text,
 *   score jsonb not null,
 *   feedback text[] default '{}',
 *   phonemes jsonb[] default '{}',
 *   audio_url text,
 *   timestamp timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- RLS POLICIES (Enable Row Level Security)
 * alter table profiles enable row level security;
 * alter table vocabulary enable row level security;
 * alter table progress enable row level security;
 * alter table sessions enable row level security;
 * alter table pronunciation_attempts enable row level security;
 * 
 * -- Example Policy: Users can only see their own data
 * create policy "Users can manage their own profile" on profiles for all using (auth.uid() = id);
 * create policy "Users can manage their own vocabulary" on vocabulary for all using (auth.uid() = user_id);
 * create policy "Users can manage their own progress" on progress for all using (auth.uid() = user_id);
 * create policy "Users can manage their own sessions" on sessions for all using (auth.uid() = user_id);
 * create policy "Users can manage their own pronunciation" on pronunciation_attempts for all using (auth.uid() = user_id);
 */
