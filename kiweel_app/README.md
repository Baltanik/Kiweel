# Kiweel - Il tuo ecosistema wellness personale

Piattaforma wellness verticale con marketplace integrato per professionisti del benessere.

## 🚀 Setup Locale

### Prerequisiti
- Node.js 18+ 
- npm o yarn

### Installazione

1. **Installa le dipendenze:**
```bash
npm install
```

2. **Configura le variabili d'ambiente (opzionale):**
Le credenziali Supabase sono già configurate in `src/integrations/supabase/client.ts`, ma puoi sovrascriverle creando un file `.env.local`:

```bash
cp .env.local.example .env.local
# Modifica .env.local se necessario
```

3. **Avvia il server di sviluppo:**
```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

## 📁 Struttura Progetto

```
kiweel_app/
├── src/
│   ├── components/        # Componenti React
│   │   ├── kiweel/       # Componenti Kiweel-specific
│   │   ├── ui/           # Componenti UI base (shadcn/ui)
│   │   └── ...
│   ├── pages/            # Pagine dell'app
│   ├── contexts/         # React Contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities e constants
│   └── integrations/     # Integrazioni (Supabase)
├── supabase/             # Configurazione Supabase
│   ├── migrations/       # Database migrations
│   └── functions/       # Edge Functions
└── public/              # File statici
```

## 🛠️ Script Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Build per produzione
- `npm run preview` - Preview del build di produzione
- `npm run lint` - Esegue il linter

## 🗄️ Database

Il database Supabase è già configurato. Le migrations si trovano in `supabase/migrations/`.

### Migrazione principale
- `20251116000000_kiweel_complete_schema.sql` - Schema completo Kiweel

## 📱 Features Implementate

### Per KIWEERS (Utenti)
- ✅ Dashboard mobile-first
- ✅ Progress Tracking
- ✅ Diet Plans Viewer
- ✅ Workout Plans Viewer
- ✅ Shared Data Viewer
- ✅ Gamification (Missions & Tokens)
- ✅ Kiweel Feed

### Per KIWEERIST (Professionisti)
- ✅ Onboarding professionale
- ✅ Dashboard professionale
- ✅ Gestione servizi
- ✅ Post su Kiweel Feed

## 🔐 Autenticazione

- Sign up come KIWEER o KIWEERIST
- Onboarding differenziato per tipo utente
- Gestione ruoli con Supabase Auth

## 🌐 Routes Principali

- `/` - Home (ricerca professionisti)
- `/dashboard` - Dashboard KIWEERS
- `/progress` - Progress Tracking
- `/diet` - Diet Plans
- `/workout` - Workout Plans
- `/shared-data` - Dati Condivisi
- `/missions` - Gamification Hub
- `/feed` - Kiweel Feed
- `/pro/dashboard` - Dashboard KIWEERIST

## 📝 Note

- L'app è mobile-first per KIWEERS
- La piattaforma KIWEERIST è web-first e responsive
- Tutti i dati sono sincronizzati con Supabase in real-time


