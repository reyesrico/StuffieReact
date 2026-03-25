# Migration Plan: Extract Test & Tetris Components

> **Created**: March 24, 2026  
> **Completed**: March 24, 2026 ✅
> **Purpose**: Move Test components and Tetris game to standalone repositories  
> **Target Location**: `/Users/chiquito/Repos/`
> **Status**: COMPLETED

---

## ✅ Migration Results

| Repository | Location | Status |
|------------|----------|--------|
| **tests-playground** | `/Users/chiquito/Repos/tests-playground/` | ✅ Created, builds passing |
| **tetris** | `/Users/chiquito/Repos/tetris/` | ✅ Created, builds passing |
| **StuffieReact cleanup** | Sandbox & tetris folders removed | ✅ Done |

### What Was Migrated

**tests-playground:**
- Test.tsx (Async Promise Demo)
- Test2.tsx (Cipher Encoder - converted from JSX to TSX)
- Test3.tsx (Algorithm Tests - wrapped in React component)
- Test4.tsx (Movie Filter Demo)
- Practice.tsx (JS Practice - wrapped in React component)
- MyPromise.tsx (Promise Implementation - wrapped in React component)
- Shared: Button.tsx, Loading.tsx

**tetris:**
- Tetris.tsx (with local theme state instead of ThemeContext)
- Piece.tsx + Piece.scss (unchanged)
- Added theme toggle and "Play Again" functionality

**StuffieReact cleanup:**
- Deleted `src/sandbox/` folder
- Deleted `src/components/apps/tetris/` folder
- Updated `MainRoutes.tsx` - removed 5 routes
- Updated `Apps.tsx` - removed 5 links

**Skipped:**
- Test5.tsx - Too coupled to Redux/Context, not worth extracting

---

## 📋 Original Overview

| Repository | Description | Components |
|------------|-------------|------------|
| **TestsPlayground** | Collection of React test/practice components | Test, Test2, Test3, Test4, Test5, Practice, MyPromise, useTest |
| **Tetris** | Standalone Tetris game | Tetris, Piece |

---

## 🎯 Repository 1: TestsPlayground

### Components to Migrate

| File | Type | Dependencies | Complexity |
|------|------|--------------|------------|
| `Test.tsx` | Simple async demo | Button (recreate simple) | Low |
| `Test2.jsx` | Cipher encoder (class) | Test2.scss | Low |
| `Test2.scss` | Styles | - | Low |
| `Test3.js` | Algorithm tests (pure JS) | None | Low |
| `Test4.tsx` | Movie filter demo | Loading (recreate simple) | Low |
| `Test5.tsx` | React Query demo | Redux, Context, React Query | **High - Skip initially** |
| `Practice.js` | JS practice code | None | Low |
| `MyPromise.js` | Promise implementation | None | Low |
| `useTest.ts` | Hook tests | None | Low |

### Recommended Approach

**Phase 1: Create standalone versions (remove StuffieReact dependencies)**

Test5.tsx is heavily coupled to StuffieReact's Redux store and Context. Options:
1. Skip Test5 entirely (recommended - too coupled)
2. Create a simplified version without Redux/Context dependencies

### Target Structure

```
TestsPlayground/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx              # Main app with navigation
│   ├── index.tsx             # Entry point
│   ├── index.css             # Global styles
│   ├── components/
│   │   ├── Home.tsx          # Landing page with test links
│   │   ├── Test.tsx
│   │   ├── Test2.jsx
│   │   ├── Test2.scss
│   │   ├── Test3.js          # Or render in a component
│   │   ├── Test4.tsx
│   │   ├── Practice.tsx      # Wrap in component
│   │   ├── MyPromise.tsx     # Wrap in component
│   │   └── shared/
│   │       ├── Button.tsx    # Simple button
│   │       └── Loading.tsx   # Simple loading
│   └── hooks/
│       └── useTest.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Home.tsx Design

```tsx
const Home = () => {
  const tests = [
    { path: '/test', name: 'Test', description: 'Async Promise Demo' },
    { path: '/test2', name: 'Test2', description: 'Cipher Encoder' },
    { path: '/test3', name: 'Test3', description: 'Algorithm Tests' },
    { path: '/test4', name: 'Test4', description: 'Movie Filter Demo' },
    { path: '/practice', name: 'Practice', description: 'JS Practice Code' },
    { path: '/mypromise', name: 'MyPromise', description: 'Promise Implementation' },
  ];

  return (
    <div>
      <h1>Tests Playground</h1>
      <ul>
        {tests.map(test => (
          <li key={test.path}>
            <Link to={test.path}>{test.name}</Link>
            <span> - {test.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### Dependencies (package.json)

```json
{
  "name": "tests-playground",
  "version": "0.1.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.x",
    "typescript": "^4.9.5"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x"
  }
}
```

---

## 🎮 Repository 2: Tetris

### Components to Migrate

| File | Type | Dependencies | Notes |
|------|------|--------------|-------|
| `Tetris.tsx` | Main game | ThemeContext | Replace with local state |
| `Piece.tsx` | Piece definitions | Piece.scss | Self-contained |
| `Piece.scss` | Piece styles | - | - |

### Target Structure

```
Tetris/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx               # Main app (just renders Tetris)
│   ├── index.tsx             # Entry point
│   ├── index.css             # Global styles
│   ├── components/
│   │   ├── Tetris.tsx        # Main game component
│   │   ├── Piece.tsx         # Piece component
│   │   └── Piece.scss        # Piece styles
│   └── context/
│       └── ThemeContext.tsx  # Simple theme context (optional)
├── package.json
├── tsconfig.json
└── README.md
```

### Changes Required

**Tetris.tsx modifications:**
- Remove `import ThemeContext from "../../../context/ThemeContext";`
- Replace with local state: `const [theme, setTheme] = useState<'light' | 'dark'>('dark');`
- Or create a simple local ThemeContext

### Dependencies (package.json)

```json
{
  "name": "tetris",
  "version": "0.1.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^4.9.5"
  }
}
```

---

## 🔧 StuffieReact Cleanup

### Files to Remove

```bash
# Sandbox files (moving to TestsPlayground)
rm -rf src/sandbox/

# Tetris files (moving to Tetris repo)
rm -rf src/components/apps/tetris/
```

### MainRoutes.tsx Updates

**Remove these imports:**
```tsx
// DELETE these lines
import Test from '../../sandbox/Test';
import Test4 from '../../sandbox/Test4';
import Test5 from '../../sandbox/Test5';
import Tetris from '../apps/tetris/Tetris';
// import Test2 from '../../sandbox/Test2';
```

**Remove these routes:**
```tsx
// DELETE these routes
<Route path="test" element={<Test />} />
<Route path="test4" element={<Test4 />} />
<Route path="test5" element={<Test5 />} />
<Route path="tetris" element={<Tetris />} />
{/* <Route path="/test2" element={<Test2 />} /> */}
```

---

## 📝 Step-by-Step Execution Plan

### Phase 1: Create TestsPlayground Repository

1. **Create directory and initialize**
   ```bash
   cd /Users/chiquito/Repos
   npx create-react-app TestsPlayground --template typescript
   cd TestsPlayground
   npm install react-router-dom
   ```

2. **Copy and adapt files**
   - Copy Test.tsx, Test2.jsx, Test2.scss, Test3.js, Test4.tsx
   - Create simple Button.tsx and Loading.tsx
   - Create Home.tsx with links
   - Set up routing in App.tsx

3. **Test and verify**
   ```bash
   npm start
   ```

4. **Initialize git and push**
   ```bash
   git init
   git add -A
   git commit -m "Initial commit: TestsPlayground"
   # Create repo on GitHub, then:
   git remote add origin git@github.com:reyesrico/TestsPlayground.git
   git push -u origin main
   ```

### Phase 2: Create Tetris Repository

1. **Create directory and initialize**
   ```bash
   cd /Users/chiquito/Repos
   npx create-react-app Tetris --template typescript
   cd Tetris
   ```

2. **Copy and adapt files**
   - Copy Tetris.tsx, Piece.tsx, Piece.scss
   - Replace ThemeContext with local state
   - Update App.tsx to render Tetris directly

3. **Test and verify**
   ```bash
   npm start
   ```

4. **Initialize git and push**
   ```bash
   git init
   git add -A
   git commit -m "Initial commit: Tetris game"
   git remote add origin git@github.com:reyesrico/Tetris.git
   git push -u origin main
   ```

### Phase 3: Clean Up StuffieReact

1. **Remove files**
   ```bash
   cd /Users/chiquito/Repos/StuffieReact
   rm -rf src/sandbox/
   rm -rf src/components/apps/tetris/
   ```

2. **Update MainRoutes.tsx**
   - Remove imports for Test, Test4, Test5, Tetris
   - Remove routes for /test, /test4, /test5, /tetris

3. **Verify build**
   ```bash
   npm run build
   npm start
   ```

4. **Commit and push**
   ```bash
   git add -A
   git commit -m "Remove Test and Tetris components (migrated to separate repos)"
   git push origin main
   ```

---

## ⚠️ Important Notes

1. **Test5.tsx** is heavily coupled to StuffieReact's Redux store - recommend skipping it or creating a simplified version without dependencies.

2. **ThemeContext** in Tetris should be replaced with local state to avoid dependency on StuffieReact.

3. **GitHub repos** need to be created manually on GitHub before pushing. I will need access or you'll need to create them:
   - https://github.com/reyesrico/TestsPlayground
   - https://github.com/reyesrico/Tetris

4. **Test locally** before committing to ensure all dependencies are properly handled.

---

## ✅ Verification Checklist

- [ ] TestsPlayground repo created and working
- [ ] All test components render correctly with navigation
- [ ] Tetris repo created and working
- [ ] Tetris game fully playable
- [ ] StuffieReact builds without errors
- [ ] StuffieReact routes updated (no 404s on removed routes)
- [ ] All repos pushed to GitHub

---

## 🚀 Ready to Execute?

When you're ready, I can:
1. Create the TestsPlayground project structure
2. Create the Tetris project structure
3. Clean up StuffieReact

Just confirm and I'll proceed with the migration!
