# Requirements - Kiweel App

## Dipendenze Installate

### Core Dependencies
- **React 18.2.0** - Framework UI
- **TypeScript 5.2.2** - Type safety
- **Vite 5.0.8** - Build tool e dev server

### UI & Styling
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **tailwindcss-animate 1.0.7** - Animazioni Tailwind
- **Radix UI** - Componenti UI accessibili
  - @radix-ui/react-accordion
  - @radix-ui/react-alert-dialog
  - @radix-ui/react-avatar
  - @radix-ui/react-checkbox
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-label
  - @radix-ui/react-popover
  - @radix-ui/react-progress
  - @radix-ui/react-select
  - @radix-ui/react-separator
  - @radix-ui/react-slider
  - @radix-ui/react-slot
  - @radix-ui/react-tabs
  - @radix-ui/react-toast
  - @radix-ui/react-tooltip
- **lucide-react 0.303.0** - Icone
- **sonner 1.3.0** - Toast notifications
- **clsx 2.1.0** - Utility per classi CSS
- **tailwind-merge 2.2.0** - Merge Tailwind classes
- **class-variance-authority 0.7.0** - Varianti componenti

### State Management & Data Fetching
- **@tanstack/react-query 5.17.0** - Server state management
- **react-router-dom 6.21.0** - Routing

### Backend & Database
- **@supabase/supabase-js 2.39.0** - Supabase client

### Utilities
- **date-fns 3.0.0** - Date formatting
- **zod 3.22.4** - Schema validation

### Dev Dependencies
- **@vitejs/plugin-react 4.2.1** - Vite React plugin
- **@typescript-eslint/eslint-plugin** - TypeScript ESLint
- **@typescript-eslint/parser** - TypeScript parser per ESLint
- **eslint** - Linter
- **eslint-plugin-react-hooks** - React hooks linting
- **eslint-plugin-react-refresh** - React refresh linting
- **autoprefixer** - CSS autoprefixer
- **postcss** - CSS post-processor

## Configurazione File

### File di Configurazione Creati
- ✅ `package.json` - Dipendenze e script
- ✅ `vite.config.ts` - Configurazione Vite
- ✅ `tsconfig.json` - Configurazione TypeScript
- ✅ `tsconfig.node.json` - TypeScript per Node
- ✅ `tailwind.config.js` - Configurazione Tailwind
- ✅ `postcss.config.js` - Configurazione PostCSS
- ✅ `index.html` - Entry point HTML
- ✅ `.gitignore` - File da ignorare in git

## Setup Completato

✅ Tutte le dipendenze sono installate
✅ Configurazione completa
✅ Server di sviluppo pronto

## Comandi Disponibili

```bash
# Avvia sviluppo
npm run dev

# Build produzione
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

## Porta Default

Il server di sviluppo è configurato per avviarsi su **porta 3000**:
- URL: `http://localhost:3000`

## Note

- Le credenziali Supabase sono già configurate in `src/integrations/supabase/client.ts`
- Il progetto è pronto per lo sviluppo locale
- Tutti i componenti UI sono basati su shadcn/ui (Radix UI + Tailwind)


