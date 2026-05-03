# PunyaSeva — Development Guide

## Prerequisites

- **Node.js** v22+
- **npm** v10+
- **MySQL 8** (local) — or skip and use Firestore fallback
- **Git**

---

## Quick Start

```bash
git clone <repository-url>
cd divine-connect
npm install
cp .env.example .env   # fill in values (see below)
npm run dev
```

App runs at **http://localhost:5000** (Express serves Vite middleware).

---

## Environment Variables

Create `.env` in the project root:

```env
NODE_ENV=development
PORT=5000

# Database — choose one
DB_TYPE=mysql                          # or "firestore"
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=divine_connect
MYSQL_PORT=3306

# AI
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-oss-20b:free   # free model, no cost

# Auth
JWT_SECRET=generate-with-openssl-rand-hex-48

# Payments (optional for local dev — leave blank for demo mode)
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=

# App URL (used for CORS)
VITE_APP_URL=http://localhost:5000
```

### Using Firestore instead of MySQL

Set `DB_TYPE=firestore` and place your Firebase service account JSON at:
```
firebase-applet-config.json   (project root)
```

The server auto-falls back to Firestore if MySQL connection fails.

---

## Database Setup (MySQL)

```bash
# Create database and user
mysql -u root -p <<SQL
CREATE DATABASE IF NOT EXISTS divine_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'divineuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON divine_connect.* TO 'divineuser'@'localhost';
FLUSH PRIVILEGES;
SQL

# Apply schema — server auto-creates tables on first boot
# Then seed sample data
mysql -u divineuser -p divine_connect < database/seed.sql
```

Tables are created automatically when the server starts (`initializeDatabase()` in `server.ts`).
The seed is **idempotent** — safe to re-run, uses `WHERE NOT EXISTS` guards.

---

## Development Commands

```bash
npm run dev      # start Express + Vite HMR on port 5000
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

The dev server runs `tsx server.ts` which mounts Vite as middleware — no separate frontend port needed.

---

## Project Structure

```
src/
├── pages/          # One component per route
├── components/     # Shared UI (Layout, VedaAI, AuthModal, etc.)
├── lib/
│   ├── db.ts       # DatabaseAdapter — add new queries here
│   ├── astrology.ts
│   └── panchangCalc.ts
├── services/       # External API wrappers (Gemini, panchang)
└── types.ts        # Shared TypeScript types

server.ts           # All Express routes (~2100 lines)
database/seed.sql   # Sample data
```

---

## Adding a New API Route

1. Open `server.ts`
2. Find the relevant section (products, pujas, bookings, etc.)
3. Add your route with appropriate middleware:
   ```ts
   app.get("/api/your-endpoint", requireAuth, async (req, res) => {
     // ...
   });
   ```
4. If MySQL: add the query method to `MySQLAdapter` in `src/lib/db.ts`
5. Add the same method to `FirestoreAdapter` and the `DatabaseAdapter` interface

---

## Adding a New Page

1. Create `src/pages/YourPage.tsx`
2. Add a lazy import in `src/App.tsx`:
   ```ts
   const YourPage = lazy(() => import('./pages/YourPage'));
   ```
3. Add a route inside the `<Routes>` block:
   ```tsx
   <Route path="/your-path" element={<YourPage />} />
   ```
   Wrap with `<ProtectedRoute>` if auth is required.

---

## Internationalisation

Translation files are inline in `src/lib/i18n.ts`. To add a new string:

1. Add the key under `en`, `hi`, and `sa` in `i18n.ts`
2. Use it in components: `const { t } = useTranslation(); t('your.key')`

---

## Code Style

- Functional components + hooks only — no class components
- TypeScript strict mode — avoid `any` where possible
- Tailwind CSS for all styles — no custom CSS except `src/index.css`
- Lucide React for all icons
- Mobile-first responsive design (`sm:` → `md:` → `lg:`)
- No comments unless the **why** is non-obvious
