-- Initial Database Migration
-- This file represents the first migration that sets up the initial database schema.
-- It should match the structure defined in backend/KoruSync_dB_Schema.sql
--
-- For making changes to the database:
-- 1. Create a new migration file with a timestamp prefix
-- 2. Add your SQL changes to the new file
-- 3. Run npm run migrate:db to apply the changes
-- 4. Update backend/KoruSync_dB_Schema.sql to reflect the new state
--
-- Migration ID: 20240503000000
-- Date: 2024-05-03

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types
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

-- Tables
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

CREATE TABLE public.default_pillars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.life_pillars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    pillar_id UUID REFERENCES public.life_pillars(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority task_priority DEFAULT 'medium' NOT NULL,
    status task_status DEFAULT 'todo' NOT NULL,
    estimated_duration INTERVAL,
    is_recurring BOOLEAN DEFAULT false NOT NULL,
    recurrence_rule TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.task_categories (
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (task_id, category_id)
);

CREATE TABLE public.time_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration INTERVAL GENERATED ALWAYS AS (end_time - start_time) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal_type goal_type NOT NULL,
    pillar_id UUID REFERENCES public.life_pillars(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    target_value NUMERIC NOT NULL,
    target_unit TEXT NOT NULL,
    time_period goal_time_period NOT NULL,
    start_date DATE,
    end_date DATE,
    status goal_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.user_gamification (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    xp INTEGER DEFAULT 0 NOT NULL CHECK (xp >= 0),
    level INTEGER DEFAULT 1 NOT NULL CHECK (level >= 1),
    current_streak INTEGER DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 NOT NULL CHECK (longest_streak >= 0),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_key TEXT UNIQUE,
    criteria TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.user_badges (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE public.friendships (
    user_id_1 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user_id_2 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status friendship_status NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    accepted_at TIMESTAMPTZ,
    PRIMARY KEY (user_id_1, user_id_2),
    CHECK (user_id_1 <> user_id_2)
);

CREATE TABLE public.journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    entry_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.mood_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    mood_value mood_rating NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, log_date)
);

CREATE TABLE public.user_preferences (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    theme app_theme DEFAULT 'system' NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true NOT NULL,
    onboarding_completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.social_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    provider social_provider NOT NULL,
    provider_user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider),
    UNIQUE(provider, provider_user_id)
);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
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

    INSERT INTO public.life_pillars (user_id, name, color, is_default)
    SELECT NEW.id, dp.name, dp.color, true
    FROM public.default_pillars dp;

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    INSERT INTO public.user_gamification (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS trigger AS $$
BEGIN
    UPDATE public.users
    SET 
        email_verified = true,
        email_verification_status = 'verified',
        updated_at = NOW()
    WHERE id = NEW.user_id;

    UPDATE public.email_verification_tokens
    SET used_at = NOW()
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
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

-- Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_email_verified ON public.email_verification_tokens;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_email_verified
    AFTER UPDATE OF used_at ON public.email_verification_tokens
    FOR EACH ROW
    WHEN (NEW.used_at IS NOT NULL AND OLD.used_at IS NULL)
    EXECUTE FUNCTION public.handle_email_verification();

-- RLS Policies
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

-- Force RLS for table owners
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.life_pillars FORCE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.goals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges FORCE ROW LEVEL SECURITY;
ALTER TABLE public.friendships FORCE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections FORCE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view default pillars" ON public.default_pillars FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own life pillars" ON public.life_pillars
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can manage their own time entries" ON public.time_entries
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own gamification stats" ON public.user_gamification FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view badges" ON public.badges FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own earned badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own friendships" ON public.friendships FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
CREATE POLICY "Users can insert friendship requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id_1);
CREATE POLICY "Users can update status of requests sent to them" ON public.friendships FOR UPDATE USING (auth.uid() = user_id_2) WITH CHECK (status IN ('accepted', 'blocked'));
CREATE POLICY "Users can delete their own pending requests or accepted friendships" ON public.friendships FOR DELETE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can manage their own journal entries" ON public.journal_entries
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mood logs" ON public.mood_logs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social connections" ON public.social_connections
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_mood_logs_user_id_log_date ON public.mood_logs(user_id, log_date);
CREATE INDEX idx_friendships_user_id_2 ON public.friendships(user_id_2); 