-- Fix user profile issues
-- Migration ID: 20240505000000
-- Date: 2024-05-05

-- Ensure email_verification_status enum exists
DO $$ BEGIN
    CREATE TYPE email_verification_status AS ENUM ('pending', 'verified', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns if they don't exist
DO $$ BEGIN
    ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS email_verification_status email_verification_status DEFAULT 'pending' NOT NULL,
    ADD COLUMN IF NOT EXISTS last_verification_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS occupation TEXT,
    ADD COLUMN IF NOT EXISTS education TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS github_username TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS website TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Remove redundant email_verified column if it exists
DO $$ BEGIN
    ALTER TABLE public.users DROP COLUMN IF EXISTS email_verified;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create new policies with proper permissions
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON TYPE email_verification_status TO authenticated;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY; 