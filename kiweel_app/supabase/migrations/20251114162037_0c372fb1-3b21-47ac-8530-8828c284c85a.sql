-- BLOCKER 2: Enable PostGIS and add user location
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS location_updated_at timestamptz;

-- Function to get professionals by distance
CREATE OR REPLACE FUNCTION get_professionals_by_distance(
  user_lat numeric,
  user_lng numeric,
  max_distance_km integer DEFAULT 50,
  min_rating numeric DEFAULT 0,
  search_text text DEFAULT NULL,
  category_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  city text,
  cap text,
  category professional_category,
  rating numeric,
  latitude numeric,
  longitude numeric,
  bio text,
  address text,
  hero_image_url text,
  verified boolean,
  created_at timestamptz,
  updated_at timestamptz,
  distance_km numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.title,
    p.city,
    p.cap,
    p.category,
    p.rating,
    p.latitude,
    p.longitude,
    p.bio,
    p.address,
    p.hero_image_url,
    p.verified,
    p.created_at,
    p.updated_at,
    ROUND(
      ST_Distance(
        ST_MakePoint(p.longitude, p.latitude)::geography,
        ST_MakePoint(user_lng, user_lat)::geography
      ) / 1000, 2
    ) as distance_km
  FROM professionals p
  WHERE 
    p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND (min_rating = 0 OR p.rating >= min_rating)
    AND (category_filter IS NULL OR p.category::text = category_filter)
    AND (search_text IS NULL OR p.title ILIKE '%' || search_text || '%' OR p.city ILIKE '%' || search_text || '%')
    AND ST_Distance(
      ST_MakePoint(p.longitude, p.latitude)::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    ) / 1000 <= max_distance_km
  ORDER BY distance_km ASC;
END;
$$;

-- BLOCKER 3: Booking availability functions
CREATE OR REPLACE FUNCTION is_timeslot_available(
  _pro_id uuid,
  _booking_date date,
  _booking_time time
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_count integer;
BEGIN
  SELECT COUNT(*)
  INTO booking_count
  FROM bookings
  WHERE 
    pro_id = _pro_id
    AND booking_date = _booking_date
    AND booking_time = _booking_time
    AND status IN ('pending', 'confirmed');
  
  RETURN booking_count = 0;
END;
$$;

CREATE OR REPLACE FUNCTION get_occupied_timeslots(
  _pro_id uuid,
  _booking_date date
)
RETURNS TABLE (booking_time time)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT b.booking_time
  FROM bookings b
  WHERE 
    b.pro_id = _pro_id
    AND b.booking_date = _booking_date
    AND b.status IN ('pending', 'confirmed');
END;
$$;