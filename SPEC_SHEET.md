# ProjectHub — Astro + React SPA Spec Sheet

## Architecture Overview

```
astro.config.mjs          ← Astro v7 + React + Tailwind v4 config
src/
├── pages/index.astro     ← Single entry: mounts SPARoot via client:only="react"
├── layouts/Layout.astro  ← HTML shell (meta, dark-mode script, font import)
├── components/
│   └── SPARoot.jsx       ← React SPA root: BrowserRouter, contexts, routes
├── App.jsx               ← Internal App shell (sidebar, nav, page routes, effects)
├── context/
│   ├── AuthContext.jsx   ← Login/logout, password hash in data.settings
│   └── ThemeContext.jsx  ← dark/light/system toggle
├── data/
│   ├── store.js          ← All CRUD, localStorage, stats, search
│   └── sync.js           ← Gist push/pull/create, image upload
├── ui/                   ← Reusable: Button, Card, Input, Modal, Select, Badge,
│                            Tooltip, Timer, ImageUpload
├── effects/              ← ParticleBackground, FloatingOrbs, FloatingActionButton,
│                            ScrollReveal, AnimatedCounter, etc.
├── hooks/                ← useTilt3D, useScrollReveal, useMousePosition, etc.
├── react-pages/          ← Dashboard, Projects, ProjectDetail, DailyLog, KanbanBoard,
│                            CalendarView, TimelineView, Analytics, Settings, Login
├── styles/
│   └── app.css           ← Tailwind v4 @import "tailwindcss", amber CSS vars
```

## Framework

| Layer | Tech |
|-------|------|
| Static shell | Astro v7 — `pages/index.astro` |
| Client app | React 19 — `SPARoot.jsx` via `client:only="react"` |
| Routing | react-router-dom v7 — `<BrowserRouter basename={import.meta.env.BASE_URL}>` |
| Styling | Tailwind v4 — `@import "tailwindcss"` in app.css |
| Animations | framer-motion |
| Icons | lucide-react |
| Charts | recharts |
| Drag & drop | @dnd-kit (core, sortable, utilities) |
| Markdown | react-markdown |
| Notifications | react-hot-toast |
| Dates | date-fns |

## Color Palette

| Token | Light | Dark |
|-------|-------|------|
| `--accent` | `#d97706` (amber-600) | `#f59e0b` (amber-500) |
| `--accent-dim` | `#b45309` | `#d97706` |
| `--accent-glow` | `rgba(217,119,6,0.12)` | `rgba(245,158,11,0.15)` |
| `--card` | `rgba(255,255,255,0.9)` | `rgba(24,24,27,0.85)` |
| `--card-border` | `rgba(0,0,0,0.08)` | `rgba(39,39,42,0.8)` |
| `--bg` | `#fafafa` | `#09090b` |
| `--text` | `#18181b` | `#e4e4e7` |
| Card radii | 12px | 12px |
| No backdrop-blur on cards | solid `var(--card)` | solid `var(--card)` |

## Data Layer

- **localStorage key:** `project_hub_data` — stores all app state
- **Auth:** `project_hub_auth` — session with 7-day expiry
- **Sync config:** `project_hub_sync` — GitHub token + Gist ID
- **Theme:** `hub_theme` — `'dark'` | `'light'` | `'system'`
- Default password: `admin` (base64 encoded, stored in `data.settings.passwordHash`)
- Anonymous read-only sharing via `?gist=GIST_ID` URL param
- Auto-sync to GitHub Gist on every data mutation (if configured)

## Auth Rules

- **Provider:** Clerk (clerk.com) — supports Google, GitHub, email/password, magic link, and more
- **`isOwner`** = any signed-in Clerk user: create/edit/delete projects, logs, milestones, time entries, comments, notifications, import/export, and image upload
- **Viewer mode** (not signed in): browse read-only, viewer banner at top
- **Sign-in:** via Clerk modal (`<SignInButton mode="modal">`) or Login page (`<SignIn />` component)
- **User menu:** Clerk `<UserButton />` in top nav — profile, manage account, sign out
- **Publishable key:** set `PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env`

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/login` | Login | No |
| `/` | Dashboard | No (read-only) |
| `/projects` | Projects | No |
| `/projects/:id` | ProjectDetail | No |
| `/daily-log` | DailyLog | No |
| `/kanban` | KanbanBoard | No |
| `/calendar` | CalendarView | No |
| `/timeline` | TimelineView | No |
| `/analytics` | Analytics | No |
| `/settings` | Settings | No |

## Deployment

- **Platform:** GitHub Pages
- **Base URL:** `/PROJECT-MANAGER/`
- **Entry:** `dist/index.html` (static Astro build)
- **SPA fallback:** `public/404.html` — stores redirect path, re-routes to `index.html`
- **Build command:** `npm run build` → outputs to `dist/`
- **Dev server:** `npx astro dev --port 3000`

## Image Upload

- CDN: `https://imagetourl.cloud/api/upload`
- Anonymous (no API key)
- Max 10MB, 10 uploads/min
- Returns URL string

## Key Files to Edit

| File | Purpose |
|------|---------|
| `src/styles/app.css` | Tailwind v4 theme, CSS vars, fonts |
| `src/data/store.js` | All CRUD, localStorage, stats, search |
| `src/data/sync.js` | Gist sync functions, image upload |
| `src/context/AuthContext.jsx` | Auth logic |
| `src/context/ThemeContext.jsx` | Theme logic |
| `astro.config.mjs` | Astro settings, integrations, base path |
| `src/components/SPARoot.jsx` | Full SPA structure (routes, sidebar, header) |
| `src/components/Sidebar.jsx` | Navigation sidebar |
| `src/react-pages/*` | All page components |

## Dependencies (npm)

```
astro @astrojs/react react react-dom react-router-dom
@tailwindcss/vite tailwindcss
@clerk/clerk-react
lucide-react framer-motion recharts
react-hot-toast react-markdown date-fns
@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
@types/react @types/react-dom
```

## Setup Steps

1. Create an account at [clerk.com](https://clerk.com) and create a new application
2. Copy the **Publishable Key** from Clerk dashboard
3. Add to `.env`: `PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE`
4. Start dev server: `npx astro dev --port 3000`
