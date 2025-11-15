-- ============================================
-- KIWEEL TEST DATA SEED
-- ============================================
-- Esegui questo file nella console Supabase SQL Editor
-- per creare dati di test completi
--
-- Data: 2025-11-16
-- ============================================

-- STEP 1: Crea utenti in auth.users (bypassa signup)
-- ============================================

-- Client test: Mario Rossi
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'mario.rossi@test.com',
  crypt('Test123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Mario Rossi","role":"client"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Professional test 1: Luca Bianchi (PT)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'luca.bianchi@test.com',
  crypt('Test123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Luca Bianchi","role":"pro"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Professional test 2: Anna Verdi (Dietitian)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '55555555-5555-5555-5555-555555555555',
  'authenticated',
  'authenticated',
  'anna.verdi@test.com',
  crypt('Test123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Anna Verdi","role":"pro"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Il trigger handle_new_user() creerà automaticamente
-- le entry in public.users, ma possiamo forzare l'update
-- ============================================

-- Aggiorna Mario (client) con dati wellness
UPDATE public.users SET
  health_goals = ARRAY['Perdita peso', 'Aumento massa muscolare'],
  fitness_level = 'beginner',
  kiweel_tokens = 50,
  phone = '+39 333 1111111'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Aggiorna Luca (professional)
UPDATE public.users SET
  kiweel_tokens = 100,
  phone = '+39 333 2222222'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Aggiorna Anna (professional)
UPDATE public.users SET
  kiweel_tokens = 80,
  phone = '+39 333 3333333'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- ============================================
-- STEP 3: Crea user_roles
-- ============================================

INSERT INTO public.user_roles (user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'client'),
  ('22222222-2222-2222-2222-222222222222', 'pro'),
  ('55555555-5555-5555-5555-555555555555', 'pro')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- STEP 4: Crea professionals profiles
-- ============================================

-- Luca Bianchi - Personal Trainer
INSERT INTO public.professionals (
  id,
  user_id,
  profession_type,
  title,
  bio,
  city,
  cap,
  address,
  latitude,
  longitude,
  specializations,
  certifications,
  health_focus,
  rating,
  total_reviews,
  verified
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'PT',
  'Personal Trainer Certificato - Specialist in Forza',
  'Sono Luca, personal trainer con 10 anni di esperienza nel settore fitness. Specializzato in programmi di forza, ipertrofia e dimagrimento. Ho aiutato centinaia di clienti a raggiungere i loro obiettivi!',
  'Milano',
  '20100',
  'Via Roma 123, Milano',
  45.4642,
  9.1900,
  ARRAY['Strength Training', 'Weight Loss', 'Bodybuilding', 'Functional Training'],
  ARRAY['ISSA Certified Personal Trainer', 'CrossFit Level 1', 'Nutrition Specialist'],
  ARRAY['Perdita peso', 'Aumento massa muscolare', 'Preparazione atletica'],
  4.8,
  15,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Anna Verdi - Dietitian
INSERT INTO public.professionals (
  id,
  user_id,
  profession_type,
  title,
  bio,
  city,
  cap,
  address,
  latitude,
  longitude,
  specializations,
  certifications,
  health_focus,
  rating,
  total_reviews,
  verified
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  '55555555-5555-5555-5555-555555555555',
  'Dietitian',
  'Dietista Nutrizionista - Nutrizione Sportiva',
  'Ciao! Sono Anna, dietista nutrizionista specializzata in nutrizione sportiva e piani alimentari personalizzati. Creo programmi su misura basati su scienza e risultati concreti.',
  'Milano',
  '20100',
  'Via Dante 45, Milano',
  45.4654,
  9.1859,
  ARRAY['Sports Nutrition', 'Weight Management', 'Meal Planning'],
  ARRAY['Registered Dietitian', 'Sports Nutrition Certification'],
  ARRAY['Perdita peso', 'Nutrizione sportiva', 'Benessere generale'],
  4.9,
  22,
  true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 5: Crea Workout Plan per Mario
-- ============================================

INSERT INTO public.workout_plans (
  id,
  trainer_id,
  client_id,
  name,
  description,
  program_type,
  exercises_json,
  duration_days,
  status,
  start_date,
  end_date
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Programma Forza Base - 4 Settimane',
  'Programma di 4 settimane per principianti focalizzato su forza fondamentale e tecnica. Perfetto per chi vuole costruire una base solida.',
  'strength',
  '{
    "week1": {
      "monday": [
        {"exercise": "Squat", "sets": 3, "reps": 12, "rest": "90s", "notes": "Focus su tecnica"},
        {"exercise": "Panca Piana", "sets": 3, "reps": 10, "rest": "90s"},
        {"exercise": "Lat Machine", "sets": 3, "reps": 12, "rest": "60s"}
      ],
      "wednesday": [
        {"exercise": "Stacco Rumeno", "sets": 3, "reps": 10, "rest": "120s"},
        {"exercise": "Military Press", "sets": 3, "reps": 10, "rest": "90s"},
        {"exercise": "Curl Bicipiti", "sets": 3, "reps": 12, "rest": "60s"}
      ],
      "friday": [
        {"exercise": "Leg Press", "sets": 3, "reps": 15, "rest": "90s"},
        {"exercise": "Panca Inclinata", "sets": 3, "reps": 10, "rest": "90s"},
        {"exercise": "Rematore", "sets": 3, "reps": 12, "rest": "60s"}
      ]
    }
  }'::jsonb,
  28,
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '28 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 6: Crea Diet Plan per Mario
-- ============================================

INSERT INTO public.diet_plans (
  id,
  dietitian_id,
  client_id,
  name,
  description,
  meals_per_day,
  plan_json,
  macros_target,
  status,
  start_date,
  end_date
) VALUES (
  '77777777-7777-7777-7777-777777777777',
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  'Piano Dimagrimento Bilanciato',
  'Piano alimentare bilanciato per perdita peso graduale e sostenibile. Deficit calorico moderato di 500kcal con focus su macronutrienti ottimali.',
  4,
  '{
    "daily_calories": 2000,
    "meals": {
      "colazione": {
        "name": "Colazione Energetica",
        "time": "07:30",
        "items": ["Avena 60g", "Yogurt greco 150g", "Mirtilli 80g", "Mandorle 15g"],
        "calories": 450,
        "protein": 20,
        "carbs": 55,
        "fat": 15
      },
      "pranzo": {
        "name": "Pranzo Proteico",
        "time": "13:00",
        "items": ["Petto di pollo 180g", "Riso basmati 80g", "Verdure miste 200g", "Olio EVO 10g"],
        "calories": 550,
        "protein": 45,
        "carbs": 60,
        "fat": 12
      },
      "snack": {
        "name": "Snack Pomeridiano",
        "time": "16:30",
        "items": ["Frutta secca mista 30g", "Mela 150g"],
        "calories": 250,
        "protein": 8,
        "carbs": 30,
        "fat": 12
      },
      "cena": {
        "name": "Cena Leggera",
        "time": "20:00",
        "items": ["Salmone alla griglia 150g", "Patate dolci 150g", "Broccoli 200g"],
        "calories": 500,
        "protein": 35,
        "carbs": 45,
        "fat": 18
      }
    }
  }'::jsonb,
  '{"protein": 30, "carbs": 40, "fat": 30}'::jsonb,
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 7: Crea Shared Data
-- ============================================

INSERT INTO public.shared_data (
  id,
  client_id,
  professional_id,
  data_type,
  category,
  content,
  visibility
) VALUES 
  (
    '88888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'workout_plan',
    'Forza e Ipertrofia',
    '{"plan_id": "44444444-4444-4444-4444-444444444444", "note": "Piano personalizzato basato sui tuoi obiettivi. Segui le indicazioni e vedrai risultati in 4 settimane!"}'::jsonb,
    'shared'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    '11111111-1111-1111-1111-111111111111',
    '66666666-6666-6666-6666-666666666666',
    'diet_plan',
    'Nutrizione per Dimagrimento',
    '{"plan_id": "77777777-7777-7777-7777-777777777777", "note": "Segui le indicazioni nutrizionali per risultati ottimali. Ricorda di bere 2-3L di acqua al giorno!"}'::jsonb,
    'shared'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 8: Crea Missioni per Mario
-- ============================================

INSERT INTO public.missions (
  id,
  client_id,
  mission_type,
  title,
  description,
  target_value,
  current_progress,
  token_reward,
  status,
  expires_at
) VALUES 
  (
    'aaaa1111-aaaa-1111-aaaa-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'daily',
    '💪 Completa il workout di oggi',
    'Fai almeno 30 minuti di allenamento seguendo il tuo piano',
    1,
    0,
    10,
    'active',
    CURRENT_DATE + INTERVAL '1 day'
  ),
  (
    'bbbb2222-bbbb-2222-bbbb-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'weekly',
    '🔥 Allenati 3 volte questa settimana',
    'Completa almeno 3 sessioni di allenamento questa settimana',
    3,
    1,
    50,
    'active',
    CURRENT_DATE + INTERVAL '7 days'
  ),
  (
    'cccc3333-cccc-3333-cccc-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'milestone',
    '🏆 Raggiungi 100 Kiweel Tokens',
    'Accumula 100 Kiweel Tokens completando attività e missioni',
    100,
    50,
    100,
    'active',
    CURRENT_DATE + INTERVAL '30 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 9: Crea Progress Tracking per Mario
-- ============================================

INSERT INTO public.progress_tracking (
  id,
  client_id,
  tracking_date,
  weight,
  measurements,
  energy_level,
  mood,
  notes
) VALUES 
  (
    'dddd1111-dddd-1111-dddd-111111111111',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE - INTERVAL '7 days',
    82.5,
    '{"chest": 95, "waist": 85, "hips": 98}'::jsonb,
    7,
    '7',
    'Prima settimana del piano, molto motivato!'
  ),
  (
    'eeee2222-eeee-2222-eeee-222222222222',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE - INTERVAL '3 days',
    81.8,
    '{"chest": 95, "waist": 84, "hips": 97}'::jsonb,
    8,
    '8',
    'Sto vedendo i primi progressi, energia molto alta'
  ),
  (
    'ffff3333-ffff-3333-ffff-333333333333',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE,
    81.2,
    '{"chest": 96, "waist": 83, "hips": 97}'::jsonb,
    9,
    '9',
    'Ottima giornata! Il piano sta funzionando alla grande!'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 10: Crea Post per il Kiweel Feed
-- ============================================

INSERT INTO public.professional_posts (
  id,
  pro_id,
  content,
  post_category,
  visibility,
  likes_count,
  comments_count
) VALUES 
  (
    'post1111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'Nuovo record personale del mio cliente Mario! 🎉 Ha perso 1.3kg in una settimana mantenendo la massa muscolare. Orgoglioso dei suoi progressi! 💪 #transformation #fitness #kiweel',
    'achievement',
    'public',
    12,
    3
  ),
  (
    'post2222-2222-2222-2222-222222222222',
    '66666666-6666-6666-6666-666666666666',
    '🥗 Tip del giorno: Non saltare mai la colazione! È il pasto più importante per kickstart il metabolismo. Prova con avena, yogurt greco e frutta per iniziare la giornata con energia! #nutrition #wellness',
    'tip',
    'public',
    24,
    7
  ),
  (
    'post3333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Ecco la mia nuova tecnica per explosive power sullo squat! 🔥 Provate ad aggiungere un piccolo salto alla fine della fase concentrica. Game changer! #workout #fitness #strength',
    'showcase',
    'public',
    8,
    2
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 11: Crea Token Transactions per Mario
-- ============================================

INSERT INTO public.tokens_transactions (
  id,
  user_id,
  transaction_type,
  amount,
  description,
  balance_before,
  balance_after
) VALUES 
  (
    'trans111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'earn',
    5,
    'Check-in giornaliero completato',
    45,
    50
  ),
  (
    'trans222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'earn',
    10,
    'Workout completato',
    40,
    50
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SUMMARY
-- ============================================

SELECT 
  '✅ Seed completato con successo!' as status,
  (SELECT COUNT(*) FROM public.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555')) as users_created,
  (SELECT COUNT(*) FROM public.professionals WHERE id IN ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666')) as professionals_created,
  (SELECT COUNT(*) FROM public.workout_plans WHERE client_id = '11111111-1111-1111-1111-111111111111') as workout_plans,
  (SELECT COUNT(*) FROM public.diet_plans WHERE client_id = '11111111-1111-1111-1111-111111111111') as diet_plans,
  (SELECT COUNT(*) FROM public.missions WHERE client_id = '11111111-1111-1111-1111-111111111111') as missions,
  (SELECT COUNT(*) FROM public.progress_tracking WHERE client_id = '11111111-1111-1111-1111-111111111111') as progress_entries,
  (SELECT COUNT(*) FROM public.professional_posts) as feed_posts;

-- ============================================
-- TEST ACCOUNTS CREATED
-- ============================================
-- Client: mario.rossi@test.com / Test123!
-- PT: luca.bianchi@test.com / Test123!
-- Dietitian: anna.verdi@test.com / Test123!
-- ============================================

