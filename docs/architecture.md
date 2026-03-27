# Project Architecture

## Folder Structure

```
StuffieReact/
├── index.html                 # Vite entry point
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json
├── .env.example               # Environment template
│
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── images/
│   └── manifest.json
│
├── docs/                      # Documentation
│   ├── architecture.md        # This file
│   └── cache-strategy.md      # Data fetching docs
│
└── src/
    ├── main.tsx               # App entry point (Vite standard)
    ├── App.tsx                # Root component with providers
    ├── App.scss               # Global app styles
    ├── index.css              # Base CSS reset
    │
    ├── api/                   # API Layer
    │   ├── client.ts          # Axios instance with interceptors
    │   ├── endpoints.ts       # URL builders per collection
    │   ├── index.ts           # Barrel export
    │   ├── products.api.ts    # Products CRUD
    │   ├── users.api.ts       # Users/auth
    │   ├── friends.api.ts     # Friends & requests
    │   ├── categories.api.ts  # Categories
    │   ├── subcategories.api.ts
    │   ├── exchanges.api.ts   # Exchange requests
    │   ├── loans.api.ts       # Loan requests
    │   └── external/          # External APIs
    │       └── spotify.ts     # Spotify Web API
    │
    ├── components/            # React Components
    │   ├── main/              # Main layout (TopRoutes, Main)
    │   ├── sections/          # Header, Footer, Chat, Theme
    │   ├── content/           # Feature pages (Products, Friends, etc.)
    │   ├── apps/              # Standalone features (Spotify, Charts, Exchange)
    │   ├── shared/            # Reusable UI (Button, TextField, Loading)
    │   ├── skeletons/         # Loading skeletons
    │   ├── auth/              # Auth pages (LoginPage, RegisterPage)
    │   ├── admin/             # Admin panel
    │   ├── helpers/           # Component helpers
    │   ├── types/             # TypeScript interfaces
    │   └── mocks/             # Mock data for testing
    │
    ├── config/                # Configuration
    │   ├── api.ts             # ⚠️ CRITICAL: Backend toggle (Codehooks/RestDB)
    │   ├── i18n.js            # i18next configuration
    │   ├── options.js         # Language options
    │   └── constants/         # Static data
    │       └── charts.ts      # Chart sample data
    │
    ├── context/               # React Context
    │   ├── ThemeContext.tsx   # Dark/light theme
    │   ├── UserContext.tsx    # Auth state + localStorage
    │   └── QueryProvider.tsx  # React Query + persister
    │
    ├── hooks/                 # Custom Hooks
    │   ├── useAuth.ts         # Auth hook
    │   ├── useChatGpt.ts      # OpenAI integration
    │   ├── useThemeDetector.ts # System theme detection
    │   └── queries/           # React Query hooks
    │       ├── index.ts       # Barrel export
    │       ├── products.ts    # useProducts, useCreateProduct...
    │       ├── categories.ts
    │       ├── friends.ts
    │       ├── exchanges.ts
    │       └── loans.ts
    │
    ├── lib/                   # Utility Libraries
    │   ├── cloudinary.ts      # Image URL helpers, upload signatures
    │   └── crypto.ts          # Password hashing (SHA256, PBKDF2)
    │
    ├── locale/                # i18n Translations
    │   ├── en.json
    │   └── es.json
    │
    ├── styles/                # Global Styles
    │   ├── theme.scss         # Theme variables
    │   ├── base/              # Base styles (was sass/)
    │   │   ├── main.scss      # Entry point
    │   │   ├── colors.scss    # Color variables
    │   │   ├── display.scss   # Flexbox mixins
    │   │   ├── button.scss    # Button styles
    │   │   └── screen.scss    # Breakpoints
    │   ├── tokens/            # Design tokens
    │   │   ├── colors.scss
    │   │   ├── spacing.scss
    │   │   └── shadows.scss
    │   └── utilities/         # Utility classes
    │
    └── utils/                 # App Utilities
        └── cache.ts           # localStorage cache helpers
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         Components                                │
│    Products.tsx, Friends.tsx, Exchange.tsx, etc.                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  React Query    │  │   UserContext   │  │  ThemeContext   │
│  (hooks/queries)│  │   (auth state)  │  │  (dark/light)   │
└────────┬────────┘  └────────┬────────┘  └─────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│   API Layer     │  │  localStorage   │
│  (src/api/*.ts) │  │  (stuffie-user) │
└────────┬────────┘  └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Codehooks/RestDB)                    │
│              Configured in: src/config/api.ts                    │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files

### Critical Configuration
- **`src/config/api.ts`** - Backend toggle (`useCodehooks = true/false`)
- **`.env`** - API keys and secrets (see `.env.example`)

### Entry Points
- **`index.html`** - Vite HTML entry
- **`src/main.tsx`** - React app bootstrap
- **`src/App.tsx`** - Root component with all providers

### State Management
- **`src/context/QueryProvider.tsx`** - React Query setup with localStorage persistence
- **`src/context/UserContext.tsx`** - Auth state with auto-login from localStorage
- **`src/context/ThemeContext.tsx`** - Theme persistence

## Testing

Tests are **colocated** with their components (Vite/Vitest standard):

```
src/
├── App.test.jsx
├── components/
│   ├── shared/
│   │   ├── Loading.tsx
│   │   ├── Loading.test.jsx    # Test next to component
│   │   ├── Menu.tsx
│   │   └── Menu.test.jsx
│   └── content/
│       ├── Products.tsx
│       └── Products.test.jsx
```

Run tests: `npm test`

## Build Output

```
dist/
├── index.html
└── assets/
    ├── index-*.css    (~71 KB gzipped: ~11 KB)
    └── index-*.js     (~1.7 MB gzipped: ~506 KB)
```

## Migration Notes

### From CRA to Vite (Completed)
- Entry point: `index.js` → `main.tsx`
- Config: `react-scripts` → `vite.config.ts`
- Tests: Jest → Vitest

### From Redux to React Query (Completed)
- State: Redux store → React Query cache
- Actions: `dispatch()` → `useMutation()`
- Selectors: `useSelector()` → `useQuery()` hooks
- Persistence: Custom cache → React Query Persist
