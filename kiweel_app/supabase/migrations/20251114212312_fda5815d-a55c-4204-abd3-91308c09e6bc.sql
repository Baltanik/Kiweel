-- FASE 4: Sicurezza Funzioni Database
-- Aggiunge SET search_path = public a tutte le funzioni per prevenire function hijacking

-- Fix handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_professional_rating
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.professionals
  SET rating = (
    SELECT AVG(rating)::numeric(3,2)
    FROM public.reviews
    WHERE pro_id = NEW.pro_id
  ),
  total_reviews = (
    SELECT COUNT(*)
    FROM public.reviews
    WHERE pro_id = NEW.pro_id
  )
  WHERE id = NEW.pro_id;
  RETURN NEW;
END;
$$;

-- Fix update_post_likes_count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.interaction_type = 'like' THEN
    UPDATE public.professional_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.interaction_type = 'like' THEN
    UPDATE public.professional_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;