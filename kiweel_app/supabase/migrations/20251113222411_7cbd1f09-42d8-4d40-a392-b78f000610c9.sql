-- Drop the overly permissive policy that allows anyone to see all user data
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Create a policy that allows users to view only their own complete profile
CREATE POLICY "Users can view own complete profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Update the existing policy for viewing pro users to be more explicit
-- Note: This policy allows viewing pro user profiles, but in the application code
-- you should SELECT only non-sensitive columns (name, avatar_url, role) when querying other users
-- Do NOT select email or phone for users other than yourself