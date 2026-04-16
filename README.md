<p align="center">
  <img src="public/images/stuffie-logo-light.svg" alt="Stuffie" width="120" />
</p>

<h1 align="center">Stuffie</h1>

<p align="center">
  <strong>Personal belongings management → Universal consumption intelligence</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-brightgreen" alt="Version" />
  <img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js" />
  <img src="https://img.shields.io/badge/react-18.3.1-blue" alt="React" />
  <img src="https://img.shields.io/badge/vite-6.x-purple" alt="Vite" />
  <img src="https://img.shields.io/badge/typescript-5.9-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tests-168-green" alt="Tests" />
  <img src="https://img.shields.io/badge/bundle-486KB-orange" alt="Bundle Size" />
</p>

---

## Vision

Connect every person with their belongings, purchases, and consumption habits — starting as a personal inventory tool and evolving into a universal consumption intelligence platform.

```
TODAY                    NEAR FUTURE                    LONG TERM
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│ Personal        │     │ Connected       │     │ Universal           │
│ Inventory       │ --> │ Ecosystem       │ --> │ Consumption         │
│ Management      │     │ (IoT + Retail)  │     │ Intelligence        │
└─────────────────┘     └─────────────────┘     └─────────────────────┘
```

---

## Features

| Feature | Section | Status |
|---------|:-------:|:------:|
| Products inventory | Products | ✅ Ready |
| Add products with images | Header | ✅ Ready |
| Add & manage friends | Header | ✅ Ready |
| Exchange products | Feed | ✅ Ready |
| Loan products | Feed | ✅ Ready |
| Buy products | Feed | ✅ Ready |
| Spotify integration | Apps | ✅ Ready |
| ChatGPT assistant | Apps | ✅ Ready |
| AI auto-categorization | Add Product | ✅ Ready |
| Product deduplication | Add Product | ✅ Ready |
| Light / Dark theme | Settings | ✅ Ready |
| Lazy-loaded routes | Core | ✅ Ready |
| Offline-first caching | Core | ✅ Ready |

---

## Try It

**Live App**: [https://reyesrico.github.io/StuffieReact/](https://reyesrico.github.io/StuffieReact)

| User | Password | Name |
|------|:--------:|:----:|
| user@stuffie.net | test | John Doe |

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥ 22 (.nvmrc → 22.22.2) | Runtime |
| **Vite** | 6.x | Build tool & dev server |
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.9.3 | Type safety |
| **React Query** | 5.71.10 | Data fetching & caching with localStorage persistence |
| **Fluent UI** | 8.x / 9.x | UI components (FluentProvider, light/dark themes) |
| **Vitest** | 4.1.x | Testing framework |
| **Sass** | 1.86.x | Styling (module system with @use/@forward) |

---

## Getting Started

### Prerequisites

- **Node.js 22+** — use [nvm](https://github.com/nvm-sh/nvm) for version management
- npm (comes with Node)

### Setup

```bash
# 1. Clone
git clone https://github.com/reyesrico/StuffieReact.git
cd StuffieReact

# 2. Use correct Node version
nvm use          # reads .nvmrc → 22.22.2

# 3. Install dependencies
npm install

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your API keys (see Environment Variables below)

# 5. Start dev server
npm run dev      # http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build & deploy to GitHub Pages |
| `npm test` | Run tests with Vitest (watch mode) |
| `npm run test:ci` | Run tests once (CI mode) |
| `npm run lint` | Lint with ESLint (flat config) |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run typecheck` | TypeScript type checking (no emit) |

### Environment Variables

Copy `.env.example` to `.env` and fill in your values. All variables use the `VITE_` prefix.

| Variable | Required | Service |
|----------|:--------:|---------|
| `VITE_CLOUDINARY_*` | Yes | Image uploads (Cloudinary) |
| `VITE_CODEHOOKS_*` | Yes | Backend API (Codehooks) |
| `VITE_SPOTIFY_*` | Optional | Spotify integration |
| `VITE_AZURE_MAPS_KEY` | Optional | Location / map features |
| `VITE_FB_APP_ID` | Optional | Facebook login |

---

## Project Structure

```
src/
├── api/                  # Typed API layer (CRUD per entity)
│   ├── client.ts         # Axios instance with auth headers
│   ├── endpoints.ts      # URL builders (Codehooks)
│   ├── *.api.ts          # Entity CRUD functions
│   └── external/         # Third-party APIs (Spotify)
├── components/
│   ├── auth/             # Login, Register, RequireAuth
│   ├── content/          # Feature pages (Products, Friends, etc.)
│   ├── apps/             # Integrations (Spotify, ChatGPT, Charts)
│   ├── shared/           # Reusable UI (Card, EmptyState, ErrorState)
│   └── skeletons/        # Loading skeleton components
├── config/
│   ├── api.ts            # Backend config (Codehooks-only)
│   └── constants/        # Static data & chart configs
├── context/
│   ├── UserContext.tsx    # Auth state + auto-login
│   ├── ThemeContext.tsx   # Light/dark theme
│   └── QueryProvider.tsx # React Query + localStorage persistence
├── hooks/
│   ├── useAuth.ts        # Authentication hook
│   └── queries/          # React Query hooks per entity
├── lib/                  # Utilities (cloudinary, crypto)
├── locale/               # i18n translations (en, es)
└── styles/
    ├── tokens/           # Design tokens (colors, spacing, shadows)
    ├── base/             # Mixins & variables
    └── theme.scss        # CSS custom properties
```

---

## Architecture Highlights

- **No Redux** — React Query handles all server state with `staleTime: Infinity` and localStorage persistence (7-day TTL). Zero API calls on return visits.
- **JWT Auth** — HS256 tokens (1h expiry), rate-limited login (5 failures / 15 min), PBKDF2v2 password hashing (600k iterations). Backend on Codehooks serverless.
- **Code splitting** — 17 routes lazy-loaded with `React.lazy()` + Suspense. Only the home page is eagerly loaded.
- **Bundle optimized** — Manual vendor chunks (react, fluent, query, charts, utils). Initial bundle: **486 KB** (down 71% from 1.69 MB).
- **168 tests** — Unit and integration tests covering API layer, hooks, utilities, and components.
- **SPA routing on GitHub Pages** — Custom 404.html redirect for client-side routing support.
- **Design tokens** — SCSS token system with CSS custom properties for consistent theming.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

---

## About

**Author**: [Carlos Reyes-Rico](https://stuffie.azurewebsites.net/PM_Carlos-Reyes2.html)

**More Info**: [stuffie.azurewebsites.net](https://stuffie.azurewebsites.net/About_Init.aspx)
