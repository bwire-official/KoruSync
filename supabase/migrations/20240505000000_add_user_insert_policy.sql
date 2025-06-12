-- Add INSERT policy for users table to allow handle_new_user trigger
CREATE POLICY "Allow handle_new_user trigger to insert profiles"
    ON public.users
    FOR INSERT
    WITH CHECK (true);  -- The trigger function is SECURITY DEFINER, so it will bypass RLS anyway 