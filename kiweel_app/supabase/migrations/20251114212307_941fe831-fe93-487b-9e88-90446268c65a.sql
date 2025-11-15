-- FASE 3: Vincoli di Lunghezza Database
-- Aggiunge vincoli CHECK per limitare la lunghezza dei campi testuali

-- Vincoli per professional_posts
ALTER TABLE public.professional_posts 
  ADD CONSTRAINT content_length_limit CHECK (LENGTH(content) <= 2000);

-- Vincoli per messages
ALTER TABLE public.messages 
  ADD CONSTRAINT content_length_limit CHECK (LENGTH(content) <= 1000);

-- Vincoli per professionals
ALTER TABLE public.professionals 
  ADD CONSTRAINT bio_length_limit CHECK (bio IS NULL OR LENGTH(bio) <= 500),
  ADD CONSTRAINT title_length_limit CHECK (LENGTH(title) <= 100),
  ADD CONSTRAINT address_length_limit CHECK (address IS NULL OR LENGTH(address) <= 200);

-- Vincoli per bookings
ALTER TABLE public.bookings 
  ADD CONSTRAINT notes_length_limit CHECK (notes IS NULL OR LENGTH(notes) <= 500);

-- Vincoli per users
ALTER TABLE public.users 
  ADD CONSTRAINT name_length_limit CHECK (name IS NULL OR LENGTH(name) <= 100),
  ADD CONSTRAINT phone_length_limit CHECK (phone IS NULL OR LENGTH(phone) <= 20);