-- SEED DATA FOR FINDPRO
-- Execute this in Supabase SQL Editor to populate fake data

-- Insert fake users (professionals)
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
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'maria.romano@example.com', 'Maria Romano', 'pro', '+39 333 0000000')
ON CONFLICT (id) DO NOTHING;

-- Insert fake professionals
INSERT INTO public.professionals (id, user_id, category, title, bio, city, address, cap, latitude, longitude, rating, total_reviews, verified, subscription_tier) VALUES
-- Milano Parrucchieri
('10000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'parrucchiere', 'Hair Stylist Premium', 'Parrucchiere con 15 anni di esperienza. Specializzato in tagli moderni, colorazioni e trattamenti capelli.', 'Milano', 'Via Montenapoleone 8', '20121', 45.4685, 9.1956, 4.8, 45, true, 'business'),
('10000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'parrucchiere', 'Salone di Bellezza', 'Salone moderno nel cuore di Milano. Offriamo servizi completi per uomo e donna.', 'Milano', 'Corso Buenos Aires 25', '20124', 45.4781, 9.2042, 4.6, 32, true, 'pro'),
('10000003-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'parrucchiere', 'Barbiere Classico', 'Barbiere tradizionale con tocco moderno. Specializzato in rasature e tagli uomo.', 'Milano', 'Via Torino 12', '20123', 45.4636, 9.1859, 4.5, 28, true, 'free'),
('10000004-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'parrucchiere', 'Studio Hair Design', 'Hair designer certificato. Creo look personalizzati per ogni cliente.', 'Milano', 'Via Dante 45', '20121', 45.4668, 9.1836, 4.9, 56, true, 'premium'),
('10000005-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 'parrucchiere', 'Parrucchiera Donna', 'Specializzata in acconciature sposa, extension e trattamenti ricostruttivi.', 'Milano', 'Viale Vittorio Veneto 8', '20124', 45.4722, 9.1956, 4.7, 41, true, 'pro'),

-- Roma Dentisti
('10000006-0000-0000-0000-000000000006', '66666666-6666-6666-6666-666666666666', 'dentista', 'Studio Dentistico Moderno', 'Odontoiatria moderna con tecnologie digitali. Ortodonzia invisibile e implantologia.', 'Roma', 'Via Veneto 120', '00187', 41.9064, 12.4902, 4.9, 78, true, 'business'),
('10000007-0000-0000-0000-000000000007', '77777777-7777-7777-7777-777777777777', 'dentista', 'Dentista Famiglia', 'Studio dentistico per tutta la famiglia. Pedodonzia e cure conservative.', 'Roma', 'Piazza di Spagna 15', '00187', 41.9058, 12.4823, 4.7, 52, true, 'pro'),
('10000008-0000-0000-0000-000000000008', '88888888-8888-8888-8888-888888888888', 'dentista', 'Centro Odontoiatrico', 'Centro specializzato in implantologia e chirurgia orale. Sedazione cosciente disponibile.', 'Roma', 'Via Cola di Rienzo 45', '00192', 41.9065, 12.4638, 4.8, 64, true, 'premium'),

-- Napoli Idraulici  
('10000009-0000-0000-0000-000000000009', '99999999-9999-9999-9999-999999999999', 'idraulico', 'Idraulico Express 24/7', 'Servizio urgenze idrauliche 24 ore su 24. Riparazioni rapide e professionali.', 'Napoli', 'Via Toledo 250', '80134', 40.8393, 14.2497, 4.5, 35, true, 'pro'),
('10000010-0000-0000-0000-000000000010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'idraulico', 'Impianti Idraulici', 'Installazione e manutenzione impianti idraulici civili e industriali.', 'Napoli', 'Corso Umberto I 88', '80138', 40.8512, 14.2609, 4.3, 22, true, 'free')
ON CONFLICT (id) DO NOTHING;

-- Insert services for each professional
INSERT INTO public.services (pro_id, name, price, duration_minutes, description) VALUES
-- Marco Rossi (Parrucchiere)
('10000001-0000-0000-0000-000000000001', 'Taglio Uomo', 35.00, 30, 'Taglio professionale con consulenza stile'),
('10000001-0000-0000-0000-000000000001', 'Taglio Donna', 45.00, 45, 'Taglio e piega professionale'),
('10000001-0000-0000-0000-000000000001', 'Colorazione Completa', 85.00, 120, 'Colorazione con prodotti premium'),
('10000001-0000-0000-0000-000000000001', 'Trattamento Ricostruttivo', 60.00, 60, 'Trattamento intensivo per capelli danneggiati'),

-- Lucia Bianchi (Parrucchiere)
('10000002-0000-0000-0000-000000000002', 'Taglio Uomo', 28.00, 30, 'Taglio classico o moderno'),
('10000002-0000-0000-0000-000000000002', 'Taglio Donna', 38.00, 45, 'Taglio e styling'),
('10000002-0000-0000-0000-000000000002', 'Colpi di Sole', 65.00, 90, 'Meches con tecnica balayage'),
('10000002-0000-0000-0000-000000000002', 'Piega', 25.00, 30, 'Piega professionale'),

-- Giovanni Verdi (Barbiere)
('10000003-0000-0000-0000-000000000003', 'Taglio + Barba', 30.00, 45, 'Servizio completo taglio e barba'),
('10000003-0000-0000-0000-000000000003', 'Solo Taglio', 20.00, 25, 'Taglio veloce'),
('10000003-0000-0000-0000-000000000003', 'Rasatura Completa', 25.00, 30, 'Rasatura tradizionale con rasoio'),
('10000003-0000-0000-0000-000000000003', 'Rifinitura Barba', 15.00, 15, 'Rifinitura e modellatura barba'),

-- Sara Neri (Hair Designer)
('10000004-0000-0000-0000-000000000004', 'Consulenza Immagine', 50.00, 60, 'Analisi e studio del look personalizzato'),
('10000004-0000-0000-0000-000000000004', 'Taglio Creativo', 60.00, 60, 'Taglio artistico personalizzato'),
('10000004-0000-0000-0000-000000000004', 'Color Design', 120.00, 180, 'Colorazione artistica personalizzata'),

-- Paolo Russo (Parrucchiera)
('10000005-0000-0000-0000-000000000005', 'Acconciatura Sposa', 150.00, 120, 'Acconciatura completa per matrimonio'),
('10000005-0000-0000-0000-000000000005', 'Extension', 200.00, 180, 'Applicazione extension capelli veri'),
('10000005-0000-0000-0000-000000000005', 'Trattamento Keratina', 80.00, 90, 'Stiratura alla keratina'),

-- Anna Ferrari (Dentista)
('10000006-0000-0000-0000-000000000006', 'Visita Controllo', 60.00, 30, 'Visita dentistica completa'),
('10000006-0000-0000-0000-000000000006', 'Igiene Dentale', 90.00, 60, 'Pulizia professionale denti'),
('10000006-0000-0000-0000-000000000006', 'Sbiancamento', 250.00, 90, 'Sbiancamento dentale professionale'),
('10000006-0000-0000-0000-000000000006', 'Otturazione', 120.00, 45, 'Otturazione estetica in composito'),
('10000006-0000-0000-0000-000000000006', 'Ortodonzia Invisibile', 3500.00, 60, 'Apparecchio invisibile completo'),

-- Luca Bruno (Dentista Famiglia)
('10000007-0000-0000-0000-000000000007', 'Prima Visita', 50.00, 30, 'Prima visita con panoramica'),
('10000007-0000-0000-0000-000000000007', 'Pulizia Denti', 75.00, 45, 'Detartrasi e lucidatura'),
('10000007-0000-0000-0000-000000000007', 'Cura Carie', 100.00, 45, 'Rimozione carie e otturazione'),
('10000007-0000-0000-0000-000000000007', 'Visita Bambini', 40.00, 30, 'Controllo pedodontico'),

-- Elena Gallo (Centro Odontoiatrico)
('10000008-0000-0000-0000-000000000008', 'Implantologia', 1200.00, 90, 'Inserimento impianto dentale'),
('10000008-0000-0000-0000-000000000008', 'Estrazione', 80.00, 30, 'Estrazione dentale semplice'),
('10000008-0000-0000-0000-000000000008', 'Devitalizzazione', 350.00, 90, 'Cura canalare completa'),
('10000008-0000-0000-0000-000000000008', 'Corona Ceramica', 600.00, 60, 'Corona in ceramica integrale'),

-- Fabio Conti (Idraulico Express)
('10000009-0000-0000-0000-000000000009', 'Riparazione Perdita', 50.00, 60, 'Riparazione perdite urgenti'),
('10000009-0000-0000-0000-000000000009', 'Spurgo Tubature', 80.00, 90, 'Disostruzione e spurgo'),
('10000009-0000-0000-0000-000000000009', 'Sostituzione Rubinetteria', 60.00, 45, 'Cambio rubinetti e miscelatori'),
('10000009-0000-0000-0000-000000000009', 'Pronto Intervento Notturno', 100.00, 60, 'Servizio urgenze 24h'),

-- Maria Romano (Impianti Idraulici)
('10000010-0000-0000-0000-000000000010', 'Installazione WC', 120.00, 120, 'Installazione sanitari completa'),
('10000010-0000-0000-0000-000000000010', 'Impianto Bagno', 800.00, 480, 'Realizzazione impianto bagno completo'),
('10000010-0000-0000-0000-000000000010', 'Manutenzione Caldaia', 80.00, 60, 'Controllo e pulizia caldaia'),
('10000010-0000-0000-0000-000000000010', 'Riparazione Perdita', 45.00, 60, 'Riparazione perdite standard')
ON CONFLICT DO NOTHING;

-- Insert some fake reviews
INSERT INTO public.reviews (client_id, pro_id, rating, comment, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000001', 5, 'Eccellente! Molto professionale e attento ai dettagli.', NOW() - INTERVAL '5 days'),
('22222222-2222-2222-2222-222222222222', '10000001-0000-0000-0000-000000000001', 5, 'Il migliore a Milano! Tornerò sicuramente.', NOW() - INTERVAL '10 days'),
('33333333-3333-3333-3333-333333333333', '10000002-0000-0000-0000-000000000002', 4, 'Buon servizio, prezzi giusti. Consigliato.', NOW() - INTERVAL '3 days'),
('44444444-4444-4444-4444-444444444444', '10000006-0000-0000-0000-000000000006', 5, 'Studio modernissimo, personale gentilissimo. Zero dolore!', NOW() - INTERVAL '7 days'),
('55555555-5555-5555-5555-555555555555', '10000006-0000-0000-0000-000000000006', 5, 'Finalmente un dentista che capisce le tue esigenze.', NOW() - INTERVAL '15 days'),
('66666666-6666-6666-6666-666666666666', '10000009-0000-0000-0000-000000000009', 4, 'Veloce ed efficiente. Ha risolto il problema in 30 minuti.', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Insert subscriptions
INSERT INTO public.subscriptions (pro_id, tier, status, created_at) VALUES
('10000001-0000-0000-0000-000000000001', 'business', 'active', NOW()),
('10000002-0000-0000-0000-000000000002', 'pro', 'active', NOW()),
('10000003-0000-0000-0000-000000000003', 'free', 'active', NOW()),
('10000004-0000-0000-0000-000000000004', 'premium', 'active', NOW()),
('10000005-0000-0000-0000-000000000005', 'pro', 'active', NOW()),
('10000006-0000-0000-0000-000000000006', 'business', 'active', NOW()),
('10000007-0000-0000-0000-000000000007', 'pro', 'active', NOW()),
('10000008-0000-0000-0000-000000000008', 'premium', 'active', NOW()),
('10000009-0000-0000-0000-000000000009', 'pro', 'active', NOW()),
('10000010-0000-0000-0000-000000000010', 'free', 'active', NOW())
ON CONFLICT (pro_id) DO NOTHING;

-- Success message
SELECT 'Seed data inserted successfully! 10 professionals, 40+ services, and 6 reviews added.' as result;
