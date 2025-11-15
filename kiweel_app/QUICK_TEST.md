# 🧪 Quick Test Guide - Kiweel App

## ✅ Checklist Rapida

### 1. **Setup & Avvio**
```bash
cd kiweel_app
npm run dev
```
- [ ] App si avvia senza errori
- [ ] Nessun errore in console
- [ ] Header verde wellness visibile

### 2. **Autenticazione**
- [ ] `/auth` → Login funziona
- [ ] `/signup` → Registrazione KIWEERS funziona
- [ ] `/signup` → Registrazione KIWEERIST funziona
- [ ] Onboarding client completa correttamente
- [ ] Onboarding pro completa correttamente

### 3. **Dashboard KIWEERS** (`/dashboard`)
- [ ] Token balance visibile in header (verde)
- [ ] Card progresso caricate
- [ ] Quick actions funzionano
- [ ] Water tracker funziona
- [ ] Recent shared data visibile (se presente)
- [ ] Navigazione funziona

### 4. **Real-time Hooks** ⚡
**Test in 2 finestre browser:**
- [ ] Finestra 1: `/shared-data` → Crea nuovo dato
- [ ] Finestra 2: `/shared-data` → Dato appare automaticamente (< 1 sec)
- [ ] Finestra 1: `/diet` → Vedi diet plan
- [ ] Finestra 2: Modifica diet plan in DB → Aggiorna in tempo reale

### 5. **Token System** 🪙
- [ ] `/progress` → Logga progresso → +5 tokens (prima volta oggi)
- [ ] `/missions` → Completa missione → Tokens aumentano
- [ ] Header mostra balance aggiornato
- [ ] Click su token balance → Va a `/missions`

### 6. **Pagine Principali**
- [ ] `/progress` → Form funziona, salva dati
- [ ] `/diet` → Visualizza diet plan (se presente)
- [ ] `/workout` → Visualizza workout plan (se presente)
- [ ] `/shared-data` → Lista dati condivisi
- [ ] `/missions` → Lista missioni, completa funziona
- [ ] `/feed` → Feed carica post, scroll infinito funziona

### 7. **Geolocalizzazione** 📍
- [ ] `/` (Home) → Mappa si carica
- [ ] Click "La mia posizione" → Richiede permesso
- [ ] Se permesso → Centra sulla posizione reale
- [ ] Se negato → Mostra errore chiaro
- [ ] Marker professionisti visibili (se presenti)

### 8. **Branding & UI** 🎨
- [ ] Colori verde wellness (#10B981) visibili
- [ ] Header con gradiente verde/teal
- [ ] "Kiweel" invece di "Rewido" ovunque
- [ ] Mobile-first responsive
- [ ] Bottom nav funziona

### 9. **Errori da Verificare**
- [ ] Nessun errore 404 in console
- [ ] Nessun errore auth (400/401)
- [ ] Nessun errore RLS policies
- [ ] Query Supabase funzionano

## 🐛 Problemi Comuni

### Geolocalizzazione non funziona
- Verifica permessi browser
- Click "La mia posizione" manualmente
- Controlla console per errori

### Token non si aggiornano
- Refresh pagina
- Verifica che TokenService funzioni
- Controlla console per errori

### Real-time non funziona
- Verifica connessione Supabase
- Controlla che real-time sia abilitato in Supabase
- Apri 2 finestre per testare

### Dati non appaiono
- Verifica che ci siano dati nel DB
- Controlla RLS policies
- Verifica filtri nelle query

## 📊 Test Performance

- [ ] Prima pagina carica < 3 secondi
- [ ] Navigazione tra pagine fluida
- [ ] Real-time updates < 500ms
- [ ] Scroll infinito fluido

## ✅ Done quando:
- [ ] Tutte le funzionalità principali funzionano
- [ ] Nessun errore critico
- [ ] UI responsive e bella
- [ ] Real-time funziona
- [ ] Token system funziona


