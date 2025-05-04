-- Add delete_user_account function
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
  
  -- Delete from public.users (this is already handled by the CASCADE)
  -- DELETE FROM public.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated; 