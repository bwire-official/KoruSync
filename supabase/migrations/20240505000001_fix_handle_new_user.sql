-- Drop and recreate the handle_new_user function with proper RLS bypass
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Set role to postgres to bypass RLS
    SET LOCAL ROLE postgres;
    
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

    -- Reset role
    RESET ROLE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 