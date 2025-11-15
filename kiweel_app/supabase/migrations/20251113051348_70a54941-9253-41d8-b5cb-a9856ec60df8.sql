-- Rimuovi constraint foreign key problematico su users.id
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Ora inserisci i dati seed
DELETE FROM public.reviews;
DELETE FROM public.subscriptions;
DELETE FROM public.services;
DELETE FROM public.bookings;
DELETE FROM public.professionals;
DELETE FROM public.users WHERE role = 'pro';

-- Inserisci utenti professionisti
INSERT INTO public.users (id, email, name, role, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'marco.rossi@example.com', 'Marco Rossi', 'pro', '+39 333 1111111'),
('22222222-2222-2222-2222-222222222222', 'lucia.bianchi@example.com', 'Lucia Bianchi', 'pro', '+39 333 2222222'),
('33333333-3333-3333-3333-333333333333', 'giovanni.verdi@example.com', 'Giovanni Verdi', 'pro', '+39 333 3333333'),
('44444444-4444-4444-4444-444444444444', 'sara.neri@example.com', 'Sara Neri', 'pro', '+39 333 4444444'),
('55555555-5555-5555-5555-555555555555', 'paolo.russo@example.com', 'Paolo Russo', 'pro', '+39 333 5555555'),
('66666666-6666-6666-6666-666666666666', 'anna.ferrari@example.com', 'Anna Ferrari', 'pro', '+39 333 6666666'),
('77777777-7777-7777-7777-777777777777', 'luca.bruno@example.com', 'Luca Bruno', 'pro', '+39 333 7777777'),
('88888888-8888-8888-8888-888888888888', 'elena.gallo@example.com', 'Elena Gallo', 'pro', '+39 333 8888888'),
('99999999-9999-9999-9999-999999999999', 'fabio.conti@example.com', 'Fabio Conti', 'pro', '+39 333 9999999'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'maria.romano@example.com', 'Maria Romano', 'pro', '+39 333 0000000');

-- Inserisci professionisti
INSERT INTO public.professionals (id, user_id, category, title, bio, city, address, cap, latitude, longitude, rating, total_reviews, verified, subscription_tier) VALUES
('10000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'parrucchiere', 'Hair Stylist Premium', 'Parrucchiere con 15 anni di esperienza', 'Milano', 'Via Montenapoleone 8', '20121', 45.4685, 9.1956, 4.8, 45, true, 'business'),
('10000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'parrucchiere', 'Salone di Bellezza', 'Salone moderno', 'Milano', 'Corso Buenos Aires 25', '20124', 45.4781, 9.2042, 4.6, 32, true, 'pro'),
('10000003-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'parrucchiere', 'Barbiere Classico', 'Barbiere tradizionale', 'Milano', 'Via Torino 12', '20123', 45.4636, 9.1859, 4.5, 28, true, 'free'),
('10000004-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'parrucchiere', 'Studio Hair Design', 'Hair designer certificato', 'Milano', 'Via Dante 45', '20121', 45.4668, 9.1836, 4.9, 56, true, 'premium'),
('10000005-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 'parrucchiere', 'Parrucchiera Donna', 'Specializzata acconciature', 'Milano', 'Viale Vittorio Veneto 8', '20124', 45.4722, 9.1956, 4.7, 41, true, 'pro'),
('10000006-0000-0000-0000-000000000006', '66666666-6666-6666-6666-666666666666', 'dentista', 'Studio Dentistico Moderno', 'Odontoiatria moderna', 'Roma', 'Via Veneto 120', '00187', 41.9064, 12.4902, 4.9, 78, true, 'business'),
('10000007-0000-0000-0000-000000000007', '77777777-7777-7777-7777-777777777777', 'dentista', 'Dentista Famiglia', 'Dentista famiglia', 'Roma', 'Piazza di Spagna 15', '00187', 41.9058, 12.4823, 4.7, 52, true, 'pro'),
('10000008-0000-0000-0000-000000000008', '88888888-8888-8888-8888-888888888888', 'dentista', 'Centro Odontoiatrico', 'Implantologia', 'Roma', 'Via Cola di Rienzo 45', '00192', 41.9065, 12.4638, 4.8, 64, true, 'premium'),
('10000009-0000-0000-0000-000000000009', '99999999-9999-9999-9999-999999999999', 'idraulico', 'Idraulico Express 24/7', 'Urgenze 24h', 'Napoli', 'Via Toledo 250', '80134', 40.8393, 14.2497, 4.5, 35, true, 'pro'),
('10000010-0000-0000-0000-000000000010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'idraulico', 'Impianti Idraulici', 'Installazione impianti', 'Napoli', 'Corso Umberto I 88', '80138', 40.8512, 14.2609, 4.3, 22, true, 'free');

-- Inserisci servizi
INSERT INTO public.services (pro_id, name, price, duration_minutes) VALUES
('10000001-0000-0000-0000-000000000001', 'Taglio Uomo', 35.00, 30),
('10000001-0000-0000-0000-000000000001', 'Taglio Donna', 45.00, 45),
('10000002-0000-0000-0000-000000000002', 'Taglio', 28.00, 30),
('10000003-0000-0000-0000-000000000003', 'Taglio + Barba', 30.00, 45),
('10000006-0000-0000-0000-000000000006', 'Visita', 60.00, 30),
('10000009-0000-0000-0000-000000000009', 'Riparazione', 50.00, 60);

-- Inserisci subscriptions
INSERT INTO public.subscriptions (pro_id, tier, status) VALUES
('10000001-0000-0000-0000-000000000001', 'business', 'active'),
('10000002-0000-0000-0000-000000000002', 'pro', 'active'),
('10000003-0000-0000-0000-000000000003', 'free', 'active'),
('10000004-0000-0000-0000-000000000004', 'premium', 'active'),
('10000005-0000-0000-0000-000000000005', 'pro', 'active'),
('10000006-0000-0000-0000-000000000006', 'business', 'active'),
('10000007-0000-0000-0000-000000000007', 'pro', 'active'),
('10000008-0000-0000-0000-000000000008', 'premium', 'active'),
('10000009-0000-0000-0000-000000000009', 'pro', 'active'),
('10000010-0000-0000-0000-000000000010', 'free', 'active');