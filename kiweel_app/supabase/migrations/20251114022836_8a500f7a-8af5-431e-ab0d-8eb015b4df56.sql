-- TEMPORARY TEST BYPASS: Allow viewing ALL professionals publicly
-- TODO: In production, restore the verified filter or implement proper access control
-- This is ONLY for testing purposes and should NOT be deployed to production

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view verified professionals" ON public.professionals;
DROP POLICY IF EXISTS "Chiunque può vedere professionisti verificati" ON public.professionals;

-- Create new policy that shows ALL professionals (TEST ONLY)
CREATE POLICY "TEST_BYPASS_view_all_professionals" 
ON public.professionals 
FOR SELECT 
USING (true); -- ⚠️ WARNING: This allows viewing ALL professionals regardless of verification status