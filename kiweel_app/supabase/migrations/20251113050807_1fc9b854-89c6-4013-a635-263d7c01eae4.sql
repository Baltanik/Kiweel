-- Aggiungi policy RLS per permettere la lettura pubblica dei professionisti verificati
-- Necessario per mostrare i professionisti sulla mappa e nelle liste

-- Policy per visualizzare professionisti verificati (pubblico)
DROP POLICY IF EXISTS "Chiunque può vedere professionisti verificati" ON public.professionals;
CREATE POLICY "Chiunque può vedere professionisti verificati"
ON public.professionals
FOR SELECT
USING (verified = true);

-- Policy per visualizzare servizi dei professionisti (pubblico)
DROP POLICY IF EXISTS "Chiunque può vedere servizi" ON public.services;
CREATE POLICY "Chiunque può vedere servizi"
ON public.services
FOR SELECT
USING (true);

-- Policy per visualizzare recensioni (pubblico)
DROP POLICY IF EXISTS "Chiunque può vedere recensioni" ON public.reviews;
CREATE POLICY "Chiunque può vedere recensioni"
ON public.reviews
FOR SELECT
USING (true);

-- Policy per visualizzare info base utenti professionisti (solo nome e avatar)
DROP POLICY IF EXISTS "Chiunque può vedere info base utenti pro" ON public.users;
CREATE POLICY "Chiunque può vedere info base utenti pro"
ON public.users
FOR SELECT
USING (role = 'pro');