# PunyaSeva

PunyaSeva is a comprehensive full-stack spiritual services marketplace connecting devotees with puja services, pilgrimage yatras, spiritual products, AI astrology, and temple knowledge across India.

Live at: **[https://punyaseva.in](https://punyaseva.in)** · Staging: **[https://pre.punyaseva.in](https://pre.punyaseva.in)**

---

## Features

- **Puja Booking** — Book online and offline pujas with verified pandits; online/offline mode, samagri arrangement, date/time scheduling.
- **Yatra Packages** — Browse and book pilgrimage packages (Char Dham, Kashi, Tirupati and more) with full itineraries.
- **Spiritual Marketplace** — 40+ products across 8 categories: Idols, Incense, Mala, Books, Yantras, Prasad, Puja Essentials, Samagri Kits.
- **AI Astrology (Jyotish AI)** — Personalized Vedic kundli readings, daily horoscope, live panchang powered by Gemini and OpenRouter.
- **Naam Jap Counter** — Digital mala counter with target tracking, custom mantras, audio feedback and session history.
- **Temple Directory** — Browse temples with location details, darshan timings and Prasad ordering.
- **Vedic Knowledge Base** — Searchable library of Hindu scriptures, festivals, rituals and deity information.
- **Vendor Dashboard** — Full product, puja, booking and earnings management for registered vendors.
- **Admin Panel** — User management, vendor approvals, order oversight, analytics and announcements.
- **Multilingual** — English, Hindi (हिन्दी) and Sanskrit (संस्कृत) with auto language detection.
- **Dark / Light / System Theme** — Class-based dark mode across all 25 pages.
- **Payments** — Stripe card payments, Cash on Delivery and UPI.
- **Wishlists & Cart** — localStorage-backed cart with coupon support and order tracking.

---

## Tech Stack

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI framework (TypeScript) |
| Vite | 6 | Build tool + dev server |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | 12 | Animations and transitions |
| React Router | 7 | Client-side routing (all pages lazy-loaded) |
| i18next | 25 | i18n — English, Hindi, Sanskrit |
| Recharts | 3 | Admin analytics charts |
| Lucide React | 0.546 | Icon library |
| Stripe.js | 9 | Payment UI (frontend SDK) |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Express | 4 | HTTP server + REST API (~2,850 lines) |
| tsx | 4 | Runs TypeScript directly (no compile step) |
| mysql2 | 3 | MySQL connection pool with prepared statements |
| firebase-admin | 13 | Firestore fallback adapter + Google auth sync |
| zod | 4 | Input validation on all critical endpoints |
| jsonwebtoken | 9 | JWT auth cookies |
| bcryptjs | 3 | Password hashing |
| multer | 2 | File uploads |
| helmet | 8 | HTTP security headers |
| express-rate-limit | 8 | API rate limiting |
| stripe | 21 | Payment intent creation |
| @google/genai | 1 | Gemini AI (primary AI model) |
| nodemailer | 8 | Email delivery (OTP, notifications) |

---

## Getting Started

### Prerequisites
- Node.js v22+
- npm v10+
- MySQL 8 (or Firestore — auto-fallback if MySQL unavailable)

### Installation

```bash
git clone <repository-url> divine-connect
cd divine-connect
npm install
cp .env.example .env   # fill in all values
npm run dev
```

App runs at **http://localhost:5000**.

### Required environment variables

```env
NODE_ENV=development
PORT=5000
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=divineuser
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=divine_connect
JWT_SECRET=<run: openssl rand -hex 48>   # REQUIRED — server exits in production if missing
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
STRIPE_SECRET_KEY=your_key               # optional — demo mode if blank
VITE_STRIPE_PUBLISHABLE_KEY=your_key
VITE_APP_URL=http://localhost:5000
```

See `.env.example` for the full list.

### Database

Tables are created automatically on first server boot. Seed 40 products, pujas, yatras, and feedback:

```bash
mysql -u divineuser -p divine_connect < database/seed.sql
```

Apply schema migrations (for existing databases):

```bash
mysql -u divineuser -p divine_connect < database/migrations/001_add_missing_columns_and_yatras.sql
mysql -u divineuser -p divine_connect < database/migrations/002_add_performance_indexes.sql
```

### Commands

```bash
npm run dev      # development — Express + Vite HMR on port 5000
npm run build    # production build → dist/
```

---

## Project Structure

```
divine-connect/
├── server.ts                  # Express REST API (~2,850 lines)
├── src/
│   ├── App.tsx                # Lazy-loaded route definitions
│   ├── firebase.ts            # Firebase client init
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── pages/                 # 25 route-level pages
│   ├── components/            # Shared UI components
│   ├── contexts/              # ThemeContext
│   ├── hooks/                 # useAuth
│   └── lib/
│       ├── db.ts              # DatabaseAdapter + MySQLAdapter + FirestoreAdapter
│       ├── validation.ts      # Zod schemas for all POST/PUT endpoints
│       ├── i18n.ts            # i18next config + translations (en/hi/sa)
│       ├── cart.ts            # localStorage cart
│       └── wishlist.ts        # localStorage wishlist
├── database/
│   ├── schema.sql             # Full table definitions
│   ├── seed.sql               # Idempotent seed data (40 products, pujas, yatras)
│   └── migrations/            # ALTER TABLE migration scripts
├── public/
│   ├── products/              # 23 product images (*.jpg)
│   ├── hero/                  # Hero section images
│   └── logo/                  # SVG/PNG brand assets
└── dist/                      # Vite production build (served by Express)
```

---

## License

MIT License — see LICENSE for details.

---

Built with devotion by [Gautam Pince](https://github.com/GautamPince) and [Vikash Pandey](https://github.com/vikapandeya).
