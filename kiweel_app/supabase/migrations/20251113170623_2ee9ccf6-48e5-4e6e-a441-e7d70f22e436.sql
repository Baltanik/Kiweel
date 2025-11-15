-- Create enum for post types
CREATE TYPE public.post_type AS ENUM ('work_showcase', 'tip', 'offer', 'announcement');

-- Create enum for interaction types
CREATE TYPE public.interaction_type AS ENUM ('like', 'share');

-- Create professional_posts table
CREATE TABLE public.professional_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type public.post_type NOT NULL DEFAULT 'work_showcase',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_interactions table
CREATE TABLE public.post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.professional_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type public.interaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Enable Row Level Security
ALTER TABLE public.professional_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professional_posts
CREATE POLICY "Anyone can view public posts"
  ON public.professional_posts
  FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Professionals can view own posts"
  ON public.professional_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = professional_posts.pro_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can create own posts"
  ON public.professional_posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = professional_posts.pro_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own posts"
  ON public.professional_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = professional_posts.pro_id
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own posts"
  ON public.professional_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = professional_posts.pro_id
      AND professionals.user_id = auth.uid()
    )
  );

-- RLS Policies for post_interactions
CREATE POLICY "Anyone can view interactions"
  ON public.post_interactions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create interactions"
  ON public.post_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
  ON public.post_interactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update likes_count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Trigger for likes_count
CREATE TRIGGER update_likes_count_trigger
AFTER INSERT OR DELETE ON public.post_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_post_likes_count();

-- Trigger for updated_at on professional_posts
CREATE TRIGGER handle_updated_at_professional_posts
BEFORE UPDATE ON public.professional_posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_professional_posts_pro_id ON public.professional_posts(pro_id);
CREATE INDEX idx_professional_posts_created_at ON public.professional_posts(created_at DESC);
CREATE INDEX idx_post_interactions_post_id ON public.post_interactions(post_id);
CREATE INDEX idx_post_interactions_user_id ON public.post_interactions(user_id);