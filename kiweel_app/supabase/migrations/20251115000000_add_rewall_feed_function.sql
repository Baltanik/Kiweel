-- Funzione per ottenere i post pubblici del Rewall con i dati del professionista
CREATE OR REPLACE FUNCTION public.get_rewall_feed(
  limit_posts integer DEFAULT 10,
  offset_posts integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  pro_id uuid,
  content text,
  image_url text,
  post_type public.post_type,
  visibility text,
  likes_count integer,
  comments_count integer,
  created_at timestamptz,
  professional_title text,
  professional_city text,
  professional_user_id uuid,
  professional_name text,
  professional_avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.pro_id,
    p.content,
    p.image_url,
    p.post_type,
    p.visibility,
    p.likes_count,
    p.comments_count,
    p.created_at,
    pr.title AS professional_title,
    pr.city AS professional_city,
    pr.user_id AS professional_user_id,
    u.name AS professional_name,
    u.avatar_url AS professional_avatar_url
  FROM public.professional_posts p
  JOIN public.professionals pr ON pr.id = p.pro_id
  JOIN public.users u ON u.id = pr.user_id
  WHERE p.visibility = 'public'
  ORDER BY p.created_at DESC
  LIMIT GREATEST(limit_posts, 1)
  OFFSET GREATEST(offset_posts, 0);
$$;

REVOKE ALL ON FUNCTION public.get_rewall_feed(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_rewall_feed(integer, integer) TO authenticated, anon;
