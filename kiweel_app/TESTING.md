# 🧪 Guida al Testing - Kiweel App

## ✅ Setup Completato

Il server di sviluppo è **attivo** su: **http://localhost:3000**

## 🚀 Come Testare

### 1. Apri il Browser
Vai su: **http://localhost:3000**

### 2. Test Registrazione KIWEERS

1. Clicca su "Registrati"
2. Seleziona "Sono un Kiweer"
3. Inserisci email e password
4. Completa l'onboarding con:
   - Nome
   - Città (opzionale)
   - Health Goals (seleziona uno o più)
   - Fitness Level
   - Medical Conditions (opzionale)
   - Allergies (opzionale)
5. Verrai reindirizzato al Dashboard

### 3. Test Dashboard KIWEERS

Nel dashboard puoi testare:
- ✅ Hero Header con saluto, tokens, streak
- ✅ Today's Progress Cards (mood, sleep, diet, workout)
- ✅ Quick Actions (4 azioni principali)
- ✅ Water Tracker
- ✅ Shared Data preview (se ci sono dati)
- ✅ Recent Activity (Kiweel Feed)

### 4. Test Features Principali

#### Progress Tracking (`/progress`)
- Registra nuovo progress
- Visualizza charts (weight, energy)
- Timeline storico

#### Diet Plans (`/diet`)
- Visualizza piano alimentare attivo (se presente)
- Macros target
- Meal list giornaliera

#### Workout Plans (`/workout`)
- Visualizza piano allenamento attivo (se presente)
- Inizia workout session
- Timer tra esercizi

#### Shared Data (`/shared-data`)
- Visualizza dati condivisi dai KIWEERIST
- Filter per tipo
- Detail modal

#### Missions (`/missions`)
- Visualizza missioni attive
- Completa missioni
- Visualizza tokens guadagnati

#### Kiweel Feed (`/feed`)
- Scroll feed infinito
- Like posts
- Visualizza categorie wellness

### 5. Test Registrazione KIWEERIST

1. Logout (se loggato)
2. Clicca su "Registrati"
3. Seleziona "Sono un Kiweerist"
4. Inserisci email e password
5. Completa onboarding professionale:
   - Profession Type (5 categorie wellness)
   - Specializations (opzionale)
   - Certifications (opzionale)
   - Health Focus (opzionale)
   - Nome, Telefono, Indirizzo
   - Titolo professionale
   - Bio
   - Servizi
6. Verrai reindirizzato al Pro Dashboard

### 6. Test Pro Dashboard

Nel dashboard professionale puoi:
- ✅ Creare post su Kiweel Feed
- ✅ Gestire servizi
- ✅ Visualizzare statistiche
- ✅ Gestire portfolio

## 🔍 Checklist Testing

### Funzionalità Base
- [ ] Registrazione KIWEERS funziona
- [ ] Registrazione KIWEERIST funziona
- [ ] Login funziona
- [ ] Logout funziona
- [ ] Onboarding completo funziona

### Dashboard KIWEERS
- [ ] Hero Header mostra dati corretti
- [ ] Progress Cards sono interattive
- [ ] Quick Actions navigano correttamente
- [ ] Water Tracker funziona
- [ ] Shared Data preview funziona

### Features Wellness
- [ ] Progress Tracking salva dati
- [ ] Diet Plans visualizza correttamente
- [ ] Workout Plans visualizza correttamente
- [ ] Shared Data Viewer funziona
- [ ] Missions completabili

### Kiweel Feed
- [ ] Feed carica correttamente
- [ ] Infinite scroll funziona
- [ ] Like funziona
- [ ] Categorie post corrette
- [ ] Creazione post (KIWEERIST) funziona

### Mobile Responsiveness
- [ ] Layout mobile-first funziona
- [ ] BottomNav naviga correttamente
- [ ] Componenti responsive
- [ ] Touch interactions funzionano

## 🐛 Problemi Comuni

### Server non si avvia
```bash
# Verifica che la porta 3000 sia libera
lsof -ti:3000 | xargs kill -9

# Riavvia
npm run dev
```

### Errori di compilazione
```bash
# Pulisci cache e reinstalla
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Errori Supabase
- Verifica che le credenziali in `src/integrations/supabase/client.ts` siano corrette
- Verifica che le migrations siano applicate nel database Supabase

## 📝 Note

- Il database Supabase è già configurato
- Le migrations sono in `supabase/migrations/`
- Tutti i componenti sono mobile-first per KIWEERS
- La piattaforma KIWEERIST è web-first e responsive

## 🎯 Prossimi Step

Dopo il testing, puoi:
1. Segnalare eventuali bug
2. Richiedere nuove features
3. Procedere con FASE 3 (Real-time hooks, TokenService)
4. Implementare features KIWEERIST avanzate


