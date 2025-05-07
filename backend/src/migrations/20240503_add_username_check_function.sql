-- Add check_username_availability function
CREATE OR REPLACE FUNCTION public.check_username_availability(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if username exists in users table
    RETURN EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE username = username_to_check
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 