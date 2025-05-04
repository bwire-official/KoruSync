-- KoruSync Database Schema (Source of Truth)
-- This file represents the current state of the database schema.
-- It is the source of truth for the database structure and should be kept in sync
-- with the actual database state.
--
-- For making changes to the database:
-- 1. Create a new migration file in supabase/migrations/
-- 2. Apply the migration using npm run migrate:db
-- 3. Update this file to reflect the new state
--
-- Last Updated: 2024-05-03

-- Ensure necessary extensions are enabled (run these as superuser if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- For uuid_generate_v4()

-- -------------------------------------------
-- ENUM Types for Data Integrity
-- -------------------------------------------

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE app_theme AS ENUM ('light', 'dark', 'system');
CREATE TYPE social_provider AS ENUM ('google', 'twitter', 'apple');
CREATE TYPE goal_type AS ENUM ('time_allocation', 'task_completion', 'consistency');
CREATE TYPE goal_time_period AS ENUM ('daily', 'weekly', 'monthly', 'custom');
CREATE TYPE goal_status AS ENUM ('active', 'achieved', 'archived');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE mood_rating AS ENUM ('great', 'good', 'okay', 'bad', 'awful');
CREATE TYPE email_verification_status AS ENUM ('pending', 'verified', 'expired');

-- -------------------------------------------
-- Tables
-- -------------------------------------------

-- Users Table (Extends auth.users, profile information)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    x_handle TEXT,
    email_verified BOOLEAN DEFAULT false NOT NULL,
    email_verification_status email_verification_status DEFAULT 'pending' NOT NULL,
    last_verification_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.users IS 'Stores public user profile information, extending auth.users.';

-- Email Verification Tokens Table
CREATE TABLE public.email_verification_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    used_at TIMESTAMPTZ,
    UNIQUE(user_id, token)
);
COMMENT ON TABLE public.email_verification_tokens IS 'Stores email verification tokens for users.';

-- Default Pillars Table (Template pillars for new users)
CREATE TABLE public.default_pillars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL, -- Consider constraints or specific format e.g., hex
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.default_pillars IS 'Template life pillars provided by default.';

-- Life Pillars Table (User-specific core life areas)
CREATE TABLE public.life_pillars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL, -- Flag if it came from the default template
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name) -- Ensure pillar names are unique per user
);
COMMENT ON TABLE public.life_pillars IS 'User-defined or default core life areas (e.g., Web3, School, Life).';

-- Categories Table (User-defined tags for finer categorization)
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name) -- Ensure category names are unique per user
);
COMMENT ON TABLE public.categories IS 'User-defined tags or categories for tasks.';

-- Tasks Table
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL, -- For sub-tasks
    pillar_id UUID REFERENCES public.life_pillars(id) ON DELETE SET NULL, -- Assign task to a primary pillar
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority task_priority DEFAULT 'medium' NOT NULL,
    status task_status DEFAULT 'todo' NOT NULL,
    estimated_duration INTERVAL, -- e.g., '1 hour 30 minutes'
    is_recurring BOOLEAN DEFAULT false NOT NULL,
    recurrence_rule TEXT, -- Store iCal RRULE string or similar definition
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.tasks IS 'Stores user tasks, supports sub-tasks and recurrence.';

-- Task Categories Junction Table (Many-to-many Tasks <-> Categories/Tags)
CREATE TABLE public.task_categories (
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (task_id, category_id)
);
COMMENT ON TABLE public.task_categories IS 'Links tasks to user-defined categories/tags.';

-- Time Entries Table
CREATE TABLE public.time_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL, -- Time might not be linked to a specific task
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ, -- Null if timer is currently running
    duration INTERVAL GENERATED ALWAYS AS (end_time - start_time) STORED, -- Auto-calculated duration
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.time_entries IS 'Records time spent by users, optionally linked to tasks.';

-- Goals Table
CREATE TABLE public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal_type goal_type NOT NULL,
    pillar_id UUID REFERENCES public.life_pillars(id) ON DELETE SET NULL, -- Goal can relate to a pillar
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL, -- Goal can relate to a category/tag
    target_value NUMERIC NOT NULL, -- e.g., 10 (hours), 5 (tasks), 5 (days)
    target_unit TEXT NOT NULL, -- e.g., 'hours', 'tasks', 'days'
    time_period goal_time_period NOT NULL,
    start_date DATE, -- For custom time periods
    end_date DATE, -- For custom time periods or deadlines
    status goal_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.goals IS 'Stores user-defined goals across different types and scopes.';

-- User Gamification / Stats Table
CREATE TABLE public.user_gamification (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    xp INTEGER DEFAULT 0 NOT NULL CHECK (xp >= 0),
    level INTEGER DEFAULT 1 NOT NULL CHECK (level >= 1),
    current_streak INTEGER DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 NOT NULL CHECK (longest_streak >= 0),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.user_gamification IS 'Tracks user XP, level, and streaks.';

-- Badges Table (Definitions of available badges)
CREATE TABLE public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_key TEXT UNIQUE, -- Identifier for the badge icon in the frontend
    criteria TEXT, -- Description of how to earn it
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.badges IS 'Definitions of unlockable badges/achievements.';

-- User Badges Junction Table (Which users have earned which badges)
CREATE TABLE public.user_badges (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);
COMMENT ON TABLE public.user_badges IS 'Tracks which badges users have earned.';

-- Friendships Table
CREATE TABLE public.friendships (
    user_id_1 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Requestor
    user_id_2 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Requested
    status friendship_status NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    accepted_at TIMESTAMPTZ,
    PRIMARY KEY (user_id_1, user_id_2),
    CHECK (user_id_1 <> user_id_2) -- Ensure user cannot friend themselves
);
COMMENT ON TABLE public.friendships IS 'Manages friendship connections between users.';

-- Journal Entries Table
CREATE TABLE public.journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    entry_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.journal_entries IS 'Stores private user journal entries.';

-- Mood Logs Table
CREATE TABLE public.mood_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    mood_value mood_rating NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, log_date) -- Only one mood log per user per day
);
COMMENT ON TABLE public.mood_logs IS 'Stores daily user mood logs.';

-- User Preferences Table
CREATE TABLE public.user_preferences (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    theme app_theme DEFAULT 'system' NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true NOT NULL,
    onboarding_completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.user_preferences IS 'Stores user-specific application preferences.';

-- Social Connections Table (Optional, for explicit tracking if needed beyond Supabase Auth identities)
CREATE TABLE public.social_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    provider social_provider NOT NULL,
    provider_user_id TEXT NOT NULL, -- The unique ID from the social provider
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider), -- User can only link one account per provider
    UNIQUE(provider, provider_user_id) -- Provider ID must be unique per provider
);
COMMENT ON TABLE public.social_connections IS 'Explicitly tracks linked social provider accounts for a user.';

-- -------------------------------------------
-- Functions
-- -------------------------------------------

-- Function to handle new user setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Insert entry into public.users table
    INSERT INTO public.users (
        id,
        full_name,
        timezone,
        email_verified,
        email_verification_status
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        'UTC',
        false,
        'pending'
    );

    -- Insert default pillars for the new user
    INSERT INTO public.life_pillars (user_id, name, color, is_default)
    SELECT NEW.id, dp.name, dp.color, true
    FROM public.default_pillars dp;

    -- Create default user preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    -- Create default user gamification entry
    INSERT INTO public.user_gamification (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle email verification
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS trigger AS $$
BEGIN
    -- Update user's email verification status
    UPDATE public.users
    SET 
        email_verified = true,
        email_verification_status = 'verified',
        updated_at = NOW()
    WHERE id = NEW.user_id;

    -- Mark the token as used
    UPDATE public.email_verification_tokens
    SET used_at = NOW()
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user's ID
    current_user_id := auth.uid();
    
    -- Delete all user data from public schema
    DELETE FROM public.users WHERE id = current_user_id;
    DELETE FROM public.life_pillars WHERE user_id = current_user_id;
    DELETE FROM public.categories WHERE user_id = current_user_id;
    DELETE FROM public.tasks WHERE user_id = current_user_id;
    DELETE FROM public.time_entries WHERE user_id = current_user_id;
    DELETE FROM public.goals WHERE user_id = current_user_id;
    DELETE FROM public.user_gamification WHERE user_id = current_user_id;
    DELETE FROM public.user_badges WHERE user_id = current_user_id;
    DELETE FROM public.friendships WHERE user_id_1 = current_user_id OR user_id_2 = current_user_id;
    DELETE FROM public.journal_entries WHERE user_id = current_user_id;
    DELETE FROM public.mood_logs WHERE user_id = current_user_id;
    DELETE FROM public.user_preferences WHERE user_id = current_user_id;
    DELETE FROM public.social_connections WHERE user_id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- Function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_availability(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Allows bypassing RLS for this specific query
AS $$
DECLARE
  exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE username = username_to_check
  ) INTO exists;
  RETURN exists; -- Returns TRUE if username exists (taken), FALSE otherwise
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_username_availability(TEXT) TO authenticated;

-- -------------------------------------------
-- Triggers
-- -------------------------------------------

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_email_verified ON public.email_verification_tokens;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_email_verified
    AFTER UPDATE OF used_at ON public.email_verification_tokens
    FOR EACH ROW
    WHEN (NEW.used_at IS NOT NULL AND OLD.used_at IS NULL)
    EXECUTE FUNCTION public.handle_email_verification();

-- -------------------------------------------
-- RLS Policies
-- -------------------------------------------

-- Add RLS policies for email verification tokens
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification tokens"
    ON public.email_verification_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification tokens"
    ON public.email_verification_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.default_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (recommended by Supabase)
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.default_pillars FORCE ROW LEVEL SECURITY; -- Might want owners to bypass RLS
ALTER TABLE public.life_pillars FORCE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.goals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.badges FORCE ROW LEVEL SECURITY; -- Might want owners to bypass RLS
ALTER TABLE public.user_badges FORCE ROW LEVEL SECURITY;
ALTER TABLE public.friendships FORCE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections FORCE ROW LEVEL SECURITY;


-- --- POLICIES ---

-- public.users Policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Add admin policies if needed, checking the 'role' column

-- public.default_pillars Policies
CREATE POLICY "Authenticated users can view default pillars" ON public.default_pillars FOR SELECT USING (auth.role() = 'authenticated');
-- Admins might need INSERT/UPDATE/DELETE policies

-- public.life_pillars Policies
CREATE POLICY "Users can manage their own life pillars" ON public.life_pillars
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public.categories Policies
CREATE POLICY "Users can manage their own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public.tasks Policies
CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public.task_categories Policies (Slightly more complex checks)
CREATE POLICY "Users can view categories for their own tasks" ON public.task_categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_categories.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can insert categories for their own tasks" ON public.task_categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_categories.task_id AND tasks.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.categories WHERE categories.id = task_categories.category_id AND categories.user_id = auth.uid())
);
CREATE POLICY "Users can delete categories from their own tasks" ON public.task_categories FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_categories.task_id AND tasks.user_id = auth.uid())
);

-- public.time_entries Policies
CREATE POLICY "Users can manage their own time entries" ON public.time_entries
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public.goals Policies
CREATE POLICY "Users can manage their own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public.user_gamification Policies
CREATE POLICY "Users can view their own gamification stats" ON public.user_gamification FOR SELECT USING (auth.uid() = user_id);
-- UPDATE likely handled by secure functions or triggers, not direct user updates

-- public.badges Policies
CREATE POLICY "Authenticated users can view badges" ON public.badges FOR SELECT USING (auth.role() = 'authenticated');
-- Admins might need INSERT/UPDATE/DELETE policies

-- public.user_badges Policies
CREATE POLICY "Users can view their own earned badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
-- INSERT likely handled by secure functions or triggers

-- public.friendships Policies
CREATE POLICY "Users can view their own friendships" ON public.friendships FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
CREATE POLICY "Users can insert friendship requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id_1); -- Only requester can insert
CREATE POLICY "Users can update status of requests sent to them (accept/block)" ON public.friendships FOR UPDATE USING (auth.uid() = user_id_2) WITH CHECK (status IN ('accepted', 'blocked')); -- Only receiver can accept/block
CREATE POLICY "Users can delete their own pending requests or accepted friendships" ON public.friendships FOR DELETE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- public.journal_entries Policies
CREATE POLICY "Users can manage their own journal entries" ON public.journal_entries
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public.mood_logs Policies
CREATE POLICY "Users can manage their own mood logs" ON public.mood_logs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public.user_preferences Policies
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- public.social_connections Policies
CREATE POLICY "Users can manage their own social connections" ON public.social_connections
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------
-- Indexes (Add selectively based on query patterns)
-- -------------------------------------------
-- Example indexes (add more as needed for performance)
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_mood_logs_user_id_log_date ON public.mood_logs(user_id, log_date);
CREATE INDEX idx_friendships_user_id_2 ON public.friendships(user_id_2); -- For finding requests received

-- Add indexes for email verification
CREATE INDEX idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX idx_users_email_verification_status ON public.users(email_verification_status);

-- -------------------------------------------
-- Comments on potential future improvements
-- -------------------------------------------
-- Consider using PostgreSQL functions or triggers for calculating goal progress or updating XP/streaks
-- Explore database views for simplifying common queries (e.g., tasks joined with categories)
-- Add more specific constraints (e.g., check recurrence_rule format)
-- Refine RLS policies further based on specific application logic (e.g., allowing friends to view certain profile data)

