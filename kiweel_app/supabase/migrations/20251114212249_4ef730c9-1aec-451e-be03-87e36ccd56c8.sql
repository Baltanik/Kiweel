-- FASE 1: Sistema di Ruoli Sicuro
-- Crea enum per i ruoli
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'pro');

-- Crea tabella user_roles separata
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Abilita RLS sulla tabella user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy per leggere i propri ruoli
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy per inserire ruoli (solo tramite security definer function)
CREATE POLICY "Service role can insert roles"
ON public.user_roles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Funzione SECURITY DEFINER per verificare i ruoli
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Funzione SECURITY DEFINER per ottenere il ruolo principale di un utente
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'pro' THEN 2
      WHEN 'client' THEN 3
    END
  LIMIT 1
$$;

-- Aggiorna la policy sulla tabella users per impedire aggiornamenti al campo role
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile (no role changes)"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = (SELECT role FROM public.users WHERE id = auth.uid())
);

-- Aggiorna policy su professional_posts per usare has_role
DROP POLICY IF EXISTS "Professionals can insert posts" ON public.professional_posts;
CREATE POLICY "Professionals can insert posts"
ON public.professional_posts
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'pro') 
  AND pro_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Professionals can update own posts" ON public.professional_posts;
CREATE POLICY "Professionals can update own posts"
ON public.professional_posts
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'pro')
  AND pro_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Professionals can delete own posts" ON public.professional_posts;
CREATE POLICY "Professionals can delete own posts"
ON public.professional_posts
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'pro')
  AND pro_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid())
);

-- Migra i ruoli esistenti dalla tabella users alla tabella user_roles
-- Filtra solo user_id che esistono in auth.users
INSERT INTO public.user_roles (user_id, role)
SELECT 
  u.id, 
  CASE u.role::text
    WHEN 'client' THEN 'client'::app_role
    WHEN 'pro' THEN 'pro'::app_role
    ELSE 'client'::app_role
  END
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id
WHERE u.role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;