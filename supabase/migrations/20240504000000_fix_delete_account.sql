-- Fix delete_user_account function
-- Migration ID: 20240504000000
-- Date: 2024-05-04

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.delete_user_account();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
    current_user_id UUID;
    deleted_count INTEGER;
BEGIN
    -- Get the current user's ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found';
    END IF;

    -- Delete all user data from public schema
    -- Note: We delete in reverse order of dependencies to avoid foreign key violations
    
    -- First, delete data from tables that might reference other tables
    DELETE FROM public.task_categories WHERE task_id IN (SELECT id FROM public.tasks WHERE user_id = current_user_id);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % task categories', deleted_count;

    DELETE FROM public.friendships WHERE user_id_1 = current_user_id OR user_id_2 = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % friendships', deleted_count;

    DELETE FROM public.user_badges WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user badges', deleted_count;

    -- Then delete data from independent tables
    DELETE FROM public.tasks WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % tasks', deleted_count;

    DELETE FROM public.time_entries WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % time entries', deleted_count;

    DELETE FROM public.goals WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % goals', deleted_count;

    DELETE FROM public.categories WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % categories', deleted_count;

    DELETE FROM public.life_pillars WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % life pillars', deleted_count;

    DELETE FROM public.journal_entries WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % journal entries', deleted_count;

    DELETE FROM public.mood_logs WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % mood logs', deleted_count;

    DELETE FROM public.user_preferences WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user preferences', deleted_count;

    DELETE FROM public.social_connections WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % social connections', deleted_count;

    DELETE FROM public.user_gamification WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user gamification records', deleted_count;

    -- Finally, delete the user record
    DELETE FROM public.users WHERE id = current_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user record', deleted_count;

    IF deleted_count = 0 THEN
        RAISE EXCEPTION 'User record not found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated; 