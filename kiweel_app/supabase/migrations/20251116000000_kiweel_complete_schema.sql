-- KIWEEL COMPLETE SCHEMA MIGRATION
-- Creates all tables for Kiweel wellness platform
-- Date: 2025-11-16

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- User and role enums
CREATE TYPE user_role AS ENUM ('client', 'pro');
CREATE TYPE app_role AS ENUM ('admin', 'client', 'pro');

-- Booking enums
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Subscription enums
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

-- Professional category (Wellness Only - 5 categories)
CREATE TYPE professional_category AS ENUM ('PT', 'Dietitian', 'Osteopath', 'Physiotherapist', 'Coach');

-- Post and interaction enums
CREATE TYPE post_type AS ENUM ('work_showcase', 'tip', 'offer', 'announcement');
CREATE TYPE interaction_type AS ENUM ('like', 'share', 'comment');

-- Shared data types
CREATE TYPE shared_data_type AS ENUM ('diet_plan', 'workout_plan', 'diagnosis', 'progress', 'prescription');
CREATE TYPE shared_data_visibility AS ENUM ('private', 'shared');

-- Workout program types
CREATE TYPE workout_program_type AS ENUM ('strength', 'cardio', 'flexibility', 'mixed');

-- Plan status
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'completed', 'archived');

-- Mission types
CREATE TYPE mission_type AS ENUM ('daily', 'weekly', 'milestone');
CREATE TYPE mission_status AS ENUM ('active', 'completed', 'expired', 'failed');

-- Token transaction types
CREATE TYPE token_transaction_type AS ENUM ('earn', 'spend', 'purchase', 'gift');

-- ============================================
-- BASE TABLES (Rewido Foundation)
-- ============================================

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Kiweel wellness fields
  health_goals TEXT[] DEFAULT '{}',
  fitness_level TEXT DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  medical_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  current_professionals UUID[] DEFAULT '{}',
  kiweel_tokens INT DEFAULT 0,
  subscription_tier subscription_tier DEFAULT 'free',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (for app_role)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Professionals table (Wellness Only)
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Wellness-specific fields
  profession_type professional_category NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  health_focus TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  availability_json JSONB DEFAULT '{"monday": [], "tuesday": [], "wednesday": [], "thursday": [], "friday": [], "saturday": [], "sunday": []}'::jsonb,
  
  -- Base fields
  title TEXT NOT NULL,
  bio TEXT,
  city TEXT NOT NULL,
  address TEXT,
  cap TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  subscription_tier subscription_tier DEFAULT 'free',
  hero_image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages table (Real-time chat)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pro_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pro_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(pro_id)
);

-- Portfolio images table
CREATE TABLE public.portfolio_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Professional posts table (Kiweel Feed)
CREATE TABLE public.professional_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type post_type DEFAULT 'work_showcase',
  post_category TEXT DEFAULT 'showcase' CHECK (post_category IN ('showcase', 'tip', 'achievement', 'milestone', 'transformation')),
  visibility TEXT DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Post interactions table
CREATE TABLE public.post_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.professional_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  comment_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- ============================================
-- KIWEEL WELLNESS TABLES (Core Differentiators)
-- ============================================

-- Shared Data table (Core Differentiator - Multi-professional data sharing)
CREATE TABLE public.shared_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  data_type shared_data_type NOT NULL,
  category TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_urls TEXT[] DEFAULT '{}',
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_log JSONB DEFAULT '[]'::jsonb,
  visibility shared_data_visibility DEFAULT 'private',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Diet Plans table
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dietitian_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  meals_per_day INT DEFAULT 3,
  plan_json JSONB DEFAULT '{}'::jsonb,
  macros_target JSONB DEFAULT '{"protein": 30, "carbs": 40, "fat": 30}'::jsonb,
  shared_with_professionals UUID[] DEFAULT '{}',
  status plan_status DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workout Plans table
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  program_type workout_program_type,
  exercises_json JSONB DEFAULT '{}'::jsonb,
  duration_days INT DEFAULT 30,
  shared_with_professionals UUID[] DEFAULT '{}',
  status plan_status DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Progress Tracking table
CREATE TABLE public.progress_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(5, 2),
  measurements JSONB DEFAULT '{"chest": 0, "waist": 0, "hips": 0}'::jsonb,
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Missions table (Gamification)
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mission_type mission_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INT NOT NULL,
  current_progress INT DEFAULT 0,
  token_reward INT DEFAULT 0,
  status mission_status DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tokens Transactions table (Token Economy)
CREATE TABLE public.tokens_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_type token_transaction_type NOT NULL,
  amount INT NOT NULL,
  description TEXT,
  related_entity_id UUID,
  balance_before INT,
  balance_after INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_location ON public.users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Professionals indexes
CREATE INDEX idx_professionals_profession_type ON public.professionals(profession_type);
CREATE INDEX idx_professionals_location ON public.professionals(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_professionals_featured ON public.professionals(featured) WHERE featured = true;

-- Shared data indexes
CREATE INDEX idx_shared_data_client ON public.shared_data(client_id);
CREATE INDEX idx_shared_data_professional ON public.shared_data(professional_id);
CREATE INDEX idx_shared_data_type ON public.shared_data(data_type);

-- Diet plans indexes
CREATE INDEX idx_diet_plans_dietitian ON public.diet_plans(dietitian_id);
CREATE INDEX idx_diet_plans_client ON public.diet_plans(client_id);
CREATE INDEX idx_diet_plans_status ON public.diet_plans(status);

-- Workout plans indexes
CREATE INDEX idx_workout_plans_trainer ON public.workout_plans(trainer_id);
CREATE INDEX idx_workout_plans_client ON public.workout_plans(client_id);
CREATE INDEX idx_workout_plans_status ON public.workout_plans(status);

-- Progress tracking indexes
CREATE INDEX idx_progress_tracking_client ON public.progress_tracking(client_id);
CREATE INDEX idx_progress_tracking_date ON public.progress_tracking(tracking_date DESC);

-- Missions indexes
CREATE INDEX idx_missions_client ON public.missions(client_id);
CREATE INDEX idx_missions_status ON public.missions(status);

-- Tokens transactions indexes
CREATE INDEX idx_tokens_transactions_user ON public.tokens_transactions(user_id);
CREATE INDEX idx_tokens_transactions_type ON public.tokens_transactions(transaction_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for professionals
CREATE POLICY "Anyone can view verified professionals" ON public.professionals FOR SELECT USING (verified = true);
CREATE POLICY "Professionals can view own profile" ON public.professionals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Professionals can update own profile" ON public.professionals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Professionals can insert own profile" ON public.professionals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Professionals can manage own services" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = services.pro_id AND user_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (
  auth.uid() = client_id OR 
  EXISTS (SELECT 1 FROM public.professionals WHERE id = bookings.pro_id AND user_id = auth.uid())
);
CREATE POLICY "Clients can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (
  auth.uid() = client_id OR 
  EXISTS (SELECT 1 FROM public.professionals WHERE id = bookings.pro_id AND user_id = auth.uid())
);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);

-- RLS Policies for subscriptions
CREATE POLICY "Professionals can view own subscription" ON public.subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = subscriptions.pro_id AND user_id = auth.uid())
);
CREATE POLICY "Professionals can manage own subscription" ON public.subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = subscriptions.pro_id AND user_id = auth.uid())
);

-- RLS Policies for portfolio_images
CREATE POLICY "Anyone can view portfolio images" ON public.portfolio_images FOR SELECT USING (true);
CREATE POLICY "Professionals can manage own portfolio" ON public.portfolio_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = portfolio_images.pro_id AND user_id = auth.uid())
);

-- RLS Policies for professional_posts
CREATE POLICY "Anyone can view public posts" ON public.professional_posts FOR SELECT USING (visibility = 'public');
CREATE POLICY "Professionals can manage own posts" ON public.professional_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_posts.pro_id AND user_id = auth.uid())
);

-- RLS Policies for post_interactions
CREATE POLICY "Anyone can view post interactions" ON public.post_interactions FOR SELECT USING (true);
CREATE POLICY "Users can create interactions" ON public.post_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for shared_data (Core Kiweel feature)
CREATE POLICY "shared_data_client_access" ON public.shared_data FOR SELECT USING (
  auth.uid() = client_id OR 
  (auth.uid() IN (SELECT user_id FROM public.professionals WHERE id = professional_id))
);

CREATE POLICY "shared_data_professional_insert" ON public.shared_data FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.professionals WHERE id = professional_id)
);

CREATE POLICY "shared_data_professional_update" ON public.shared_data FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.professionals WHERE id = professional_id)
);

-- RLS Policies for diet_plans
CREATE POLICY "diet_plans_access" ON public.diet_plans FOR SELECT USING (
  auth.uid() = client_id OR
  auth.uid() = (SELECT user_id FROM public.professionals WHERE id = dietitian_id) OR
  auth.uid() = ANY(SELECT unnest(shared_with_professionals)::uuid)
);

CREATE POLICY "diet_plans_dietitian_manage" ON public.diet_plans FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.professionals WHERE id = dietitian_id)
);

-- RLS Policies for workout_plans
CREATE POLICY "workout_plans_access" ON public.workout_plans FOR SELECT USING (
  auth.uid() = client_id OR
  auth.uid() = (SELECT user_id FROM public.professionals WHERE id = trainer_id) OR
  auth.uid() = ANY(SELECT unnest(shared_with_professionals)::uuid)
);

CREATE POLICY "workout_plans_trainer_manage" ON public.workout_plans FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.professionals WHERE id = trainer_id)
);

-- RLS Policies for progress_tracking
CREATE POLICY "progress_tracking_own_access" ON public.progress_tracking FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "progress_tracking_own_insert" ON public.progress_tracking FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "progress_tracking_own_update" ON public.progress_tracking FOR UPDATE USING (auth.uid() = client_id);

-- RLS Policies for missions
CREATE POLICY "missions_own_access" ON public.missions FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "missions_own_insert" ON public.missions FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "missions_own_update" ON public.missions FOR UPDATE USING (auth.uid() = client_id);

-- RLS Policies for tokens_transactions
CREATE POLICY "tokens_own_access" ON public.tokens_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tokens_own_insert" ON public.tokens_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_professionals BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_professional_posts BEFORE UPDATE ON public.professional_posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_shared_data BEFORE UPDATE ON public.shared_data FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_diet_plans BEFORE UPDATE ON public.diet_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_workout_plans BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update professional rating
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.professionals
  SET 
    rating = (SELECT AVG(rating) FROM public.reviews WHERE pro_id = NEW.pro_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE pro_id = NEW.pro_id)
  WHERE id = NEW.pro_id;
  RETURN NEW;
END;
$$;

-- Trigger to update rating on new review
CREATE TRIGGER update_rating_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_professional_rating();

-- Function to update post interaction counts
CREATE OR REPLACE FUNCTION public.update_post_interaction_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.interaction_type = 'like' THEN
    UPDATE public.professional_posts
    SET likes_count = (
      SELECT COUNT(*) FROM public.post_interactions 
      WHERE post_id = NEW.post_id AND interaction_type = 'like'
    )
    WHERE id = NEW.post_id;
  ELSIF NEW.interaction_type = 'comment' THEN
    UPDATE public.professional_posts
    SET comments_count = (
      SELECT COUNT(*) FROM public.post_interactions 
      WHERE post_id = NEW.post_id AND interaction_type = 'comment'
    )
    WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for post interactions
CREATE TRIGGER update_post_interactions
  AFTER INSERT OR DELETE ON public.post_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_post_interaction_counts();

-- Function to get professionals by distance (for map search)
CREATE OR REPLACE FUNCTION public.get_professionals_by_distance(
  user_lat DECIMAL,
  user_lng DECIMAL,
  max_distance_km INTEGER DEFAULT 50,
  category_filter TEXT DEFAULT NULL,
  min_rating DECIMAL DEFAULT 0,
  search_text TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  profession_type professional_category,
  title TEXT,
  city TEXT,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  rating DECIMAL,
  distance_km DECIMAL,
  verified BOOLEAN,
  hero_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.profession_type,
    p.title,
    p.city,
    p.address,
    p.latitude,
    p.longitude,
    p.rating,
    -- Calculate distance using Haversine formula (approximate)
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(p.latitude::numeric)) * 
        cos(radians(p.longitude::numeric) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(p.latitude::numeric))
      )
    ) AS distance_km,
    p.verified,
    p.hero_image_url,
    p.created_at,
    p.updated_at
  FROM public.professionals p
  WHERE 
    p.verified = true
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND (category_filter IS NULL OR p.profession_type::TEXT = category_filter)
    AND p.rating >= min_rating
    AND (search_text IS NULL OR p.title ILIKE '%' || search_text || '%' OR p.city ILIKE '%' || search_text || '%')
    AND (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(p.latitude::numeric)) * 
        cos(radians(p.longitude::numeric) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(p.latitude::numeric))
      )
    ) <= max_distance_km
  ORDER BY distance_km ASC;
END;
$$;

-- Function to get occupied timeslots for a professional on a date
CREATE OR REPLACE FUNCTION public.get_occupied_timeslots(
  _booking_date DATE,
  _pro_id UUID
)
RETURNS TABLE (booking_time TIME)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT b.booking_time
  FROM public.bookings b
  WHERE b.pro_id = _pro_id
    AND b.booking_date = _booking_date
    AND b.status IN ('pending', 'confirmed');
END;
$$;

-- Function to check if timeslot is available
CREATE OR REPLACE FUNCTION public.is_timeslot_available(
  _booking_date DATE,
  _booking_time TIME,
  _pro_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  is_occupied BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.bookings
    WHERE pro_id = _pro_id
      AND booking_date = _booking_date
      AND booking_time = _booking_time
      AND status IN ('pending', 'confirmed')
  ) INTO is_occupied;
  
  RETURN NOT is_occupied;
END;
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE plpgsql
AS $$
DECLARE
  user_role app_role;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY role ASC
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'client'::app_role);
END;
$$;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id UUID,
  _role app_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Enable real-time for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diet_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.professional_posts;

