# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-27

The first major release — a complete modernization of the entire stack, architecture, and developer experience.

### Added
- **React Query** data fetching with `staleTime: Infinity` + localStorage persistence (7-day TTL)
- **Typed API layer** (`src/api/`) with CRUD functions per entity and Axios client
- **Code splitting** — 17 routes lazy-loaded with `React.lazy()` + Suspense
- **Design tokens system** (`src/styles/tokens/`) — colors, spacing, shadows, typography, transitions
- **Light / Dark theme** with FluentUI v9 FluentProvider
- **New SVG logos** for light and dark modes
- **Skeleton loading states** — Header, Sidebar, Content, Main
- **New shared components** — Card, EmptyState, ErrorState
- **Spotify embed player** (official iframe, replacing broken preview_url)
- **Standalone auth pages** — LoginPage, RegisterPage, RequireAuth wrapper
- **Auto-login** from localStorage (`stuffie-user` key)
- **GitHub Pages SPA support** — custom 404.html redirect for client-side routing
- **80 tests** (up from 8) — API layer, hooks, utilities, and components
- **ESLint flat config** (eslint.config.js, ESLint 9)
- `.nvmrc` for Node version pinning (22.22.2)
- `.env.example` with all required environment variables
- `npm run typecheck` script for standalone TypeScript validation

### Changed
- **Build system**: Create React App → **Vite 6.x** (dev startup: 150ms, build: ~6.5s)
- **Node.js**: upgraded to 22.x (from 20.x)
- **Testing**: Jest → **Vitest 4.x**
- **Environment variables**: `REACT_APP_*` → `VITE_*` prefix
- **Entry point**: `src/index.js` → `src/main.tsx`
- **Output directory**: `build/` → `dist/`
- **Sass**: migrated 40+ files from `@import` to `@use`/`@forward` module system
- **Folder restructure**:
  - `services/` dissolved → `api/`, `config/`, `lib/`
  - `sass/` → `styles/base/`
  - `config/crypto.js` → `lib/crypto.ts`
- **Bundle reduced 71%**: 1.69 MB → 486 KB via manual vendor chunks
- **CSS reduced 52%**: removed FontAwesome CDN (400+ KB), replaced with Fluent UI icons
- **All ESLint warnings resolved** (75 files cleaned)
- **TypeScript types added** across moved/restructured files

### Removed
- **Redux** — `redux`, `redux-thunk`, `redux-freeze`, `react-redux` and entire `src/redux/` folder (~40 files)
- **Create React App** — `react-scripts`, `@craco/craco`
- **FontAwesome CDN** (replaced by Fluent UI icons)
- **crypto-hash** package (consolidated to `crypto-js`)
- **Tetris game** — extracted to standalone `tetris` repo
- **Test playground** — extracted to standalone `tests-playground` repo
- Reduced from ~1,800 packages to ~494

### Fixed
- **0 security vulnerabilities** (resolved 17 inherited from CRA dependencies)
- `friends.length()` crash in feed
- API key exposure in Test.tsx
- Sensitive data logging in console
- `useEffect` dependency warnings in Spotify, Buy, Loan, Exchange
- Content area width consistency across all views

### Security
- Removed exposed API keys from source code
- Removed sensitive data from console.log statements
- Migrated to `VITE_*` env vars (only `VITE_` prefixed vars are exposed to client)
- Consolidated crypto to `crypto-js` (removed Node.js `crypto` browser incompatibility)

## [0.1.0] - Pre-2026

Initial version built with Create React App, Redux, and Jest.

[1.0.0]: https://github.com/reyesrico/StuffieReact/releases/tag/v1.0.0
[0.1.0]: https://github.com/reyesrico/StuffieReact/releases/tag/v0.1.0
