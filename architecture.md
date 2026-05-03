# PunyaSeva — Architecture

PunyaSeva is a full-stack spiritual platform connecting devotees with puja services, pilgrimage packages, spiritual products, AI astrology, and temple knowledge. Live at **https://pre.punyaseva.in**.

---

## Technology Stack

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI framework (TypeScript) |
| Vite | 6 | Build tool + dev server |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | 12 | Animations and transitions |
| React Router | 7 | Client-side routing (lazy-loaded) |
| i18next | 25 | Internationalisation — English, Hindi, Sanskrit |
| Recharts | 3 | Admin analytics charts |
| Lucide React | 0.546 | Icon set |
| Stripe.js | 9 | Payment UI (frontend SDK) |
| react-signature-canvas | 1 | Signature pad for bookings |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Express | 4 | HTTP server + REST API |
| tsx | 4 | Runs TypeScript directly (no compile step) |
| mysql2 | 3 | MySQL connection pool with prepared statements |
| firebase-admin | 13 | Firestore fallback adapter + Google auth sync |
| jsonwebtoken | 9 | JWT auth cookies (`authToken`) |
| bcryptjs | 3 | Password hashing |
| multer | 2 | File uploads (product images) |
| helmet | 8 | HTTP security headers |
| express-rate-limit | 8 | API rate limiting |
| cookie-parser | 1 | JWT cookie parsing |
| stripe | 21 | Payment intent creation (server-side) |
| @google/genai | 1 | Gemini AI (primary AI model) |
| dotenv | 17 | Environment variable loading |

### Infrastructure
- **Process manager**: PM2 (fork mode, port 5000)
- **Web server**: Nginx reverse proxy → PM2
- **OS**: Ubuntu (AWS EC2)
- **Database**: MySQL 8 — database `divine_connect`, user `divineuser`
- **Node version**: 22+

---

## Repository Layout

```
divine-connect/
├── server.ts                  # Express server (single file, ~2100 lines)
├── src/
│   ├── App.tsx                # Route definitions (lazy-loaded)
│   ├── main.tsx               # React entry point
│   ├── types.ts               # Shared TypeScript types
│   ├── firebase.ts            # Firebase client initialisation
│   ├── pages/                 # One file per route
│   ├── components/            # Shared UI components
│   ├── contexts/              # ThemeContext
│   ├── hooks/                 # useAuth
│   ├── lib/
│   │   ├── db.ts              # DatabaseAdapter interface + FirestoreAdapter + MySQLAdapter
│   │   ├── astrology.ts       # Kundli prompt builder + OpenRouter call
│   │   ├── panchangCalc.ts    # Astronomical panchang calculator (suncalc)
│   │   ├── cart.ts            # localStorage cart
│   │   ├── wishlist.ts        # localStorage wishlist
│   │   ├── i18n.ts            # i18next setup
│   │   └── utils.ts           # Shared helpers
│   └── services/
│       ├── geminiService.ts   # Horoscope + panchang Gemini calls
│       ├── panchangService.ts # Panchang API wrapper
│       └── naamJapService.ts  # Naam Jap session persistence
├── database/
│   └── seed.sql               # Idempotent seed for products, pujas, yatras, feedback, bookings
├── public/
│   ├── products/              # Local product images (*.jpg)
│   ├── hero/                  # Hero section images
│   └── logo/                  # SVG brand assets
├── dist/                      # Vite production build (served by Express)
└── .env                       # Environment variables (not committed)
```

---

## Database Schema

**Primary database:** `divine_connect` (MySQL 8)

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | `uid` (PK), `email`, `displayName`, `password`, `role` (devotee/vendor/admin), `vendorStatus`, `vendorCategory`, `vendorBankDetails` | Password is bcrypt-hashed; never returned in API responses |
| `products` | `id`, `vendorId`, `name`, `price`, `category`, `stock`, `rating`, `image`, `templeName`, `weightOptions` (JSON) | Images stored locally under `/public/products/` |
| `pujas` | `id`, `vendorId`, `title`, `price`, `onlinePrice`, `offlinePrice`, `duration`, `samagriList` (JSON), `availability` (JSON) | 5 seeded puja services |
| `yatras` | `id`, `vendorId`, `title`, `price`, `duration`, `location`, `category`, `itinerary` (JSON), `included` (JSON), `excluded` (JSON) | 3 seeded pilgrimages |
| `bookings` | `id`, `userId`, `serviceId`, `vendorId`, `type`, `date`, `timeSlot`, `status`, `totalAmount`, `isOnline`, `bringSamagri`, `paymentStatus` | status: pending/confirmed/completed/cancelled |
| `orders` | `id`, `userId`, `totalAmount`, `status`, `shippingAddress`, `paymentMethod`, `paymentStatus`, `paymentId`, `couponUsed`, `discountAmount` | status: processing/shipped/delivered/cancelled |
| `order_items` | `id`, `orderId`, `productId`, `name`, `price`, `quantity` | Linked to orders |
| `feedback` | `id`, `name`, `city`, `rating`, `message`, `createdAt` | Displayed on Home page |
| `vendors` | `id`, `userId` (UNI), `name`, `type`, `description`, `rating`, `joinedAt` | Vendor profile details |
| `vendor_wallets` | `id`, `vendorId` (UNI), `balance`, `totalEarned` | Auto-created on first order/booking |
| `vendor_transactions` | `id`, `vendorId`, `amount`, `type`, `referenceId`, `createdAt` | Earning history |
| `vendor_payouts` | `id`, `vendorId`, `amount`, `status`, `requestedAt` | Payout requests |
| `notifications` | `id`, `userId`, `title`, `message`, `type`, `read`, `createdAt` | Bell icon in navbar |
| `whatsapp_bookings` | `id`, `vendorId`, `customerName`, `phone`, `service`, `date`, `status` | WhatsApp-sourced bookings |
| `coupons` | `id`, `code`, `discount`, `type`, `maxUses`, `expiresAt` | Discount codes |
| `otps` | `id`, `email`, `otp`, `expiresAt` | OTP records (legacy; active reset uses in-memory Map) |
| `stats` | `id`, `visitors` | Site visitor counter |

**Fallback database:** Cloud Firestore (auto-selected when `DB_TYPE != mysql`)
Both backends implement the same `DatabaseAdapter` interface in `src/lib/db.ts`.

---

## Authentication & Security

```
Browser  ──POST /api/auth/login──►  Express
                                      │ verifies bcrypt password
                                      │ signs JWT (24h expiry)
                                      ◄── Set-Cookie: authToken (httpOnly, sameSite=strict)

Subsequent requests send the cookie automatically.
```

**Middleware chain:**
- `requireAuth` — verifies JWT from cookie or `Authorization: Bearer` header; populates `req.user`
- `requireAdmin` — chains `requireAuth`, then checks `req.user.role === 'admin'`

**Protected routes:**
- `GET /api/users/:uid` — `requireAuth` (own profile gets full data; others get public fields only; `vendorBankDetails` always stripped)
- All `POST/PUT/DELETE /api/products` — `requireAdmin`
- All `GET|POST /api/admin/*` — `requireAdmin`
- `POST /api/bookings`, `PATCH /api/bookings/:id/*` — `requireAuth`
- `POST /api/orders`, `PATCH /api/orders/:id/status` — `requireAuth`
- `POST|PUT|DELETE /api/pujas` — `requireAuth`

**Password reset flow (OTP):**
1. `POST /api/auth/request-password-reset { email }` → generates 6-digit OTP, stores in in-memory Map with 15-min TTL, logs OTP server-side (email delivery TODO)
2. `POST /api/auth/reset-password { email, otp, newPassword }` → validates OTP, hashes new password, clears OTP entry

**Other security measures:**
- `helmet` — sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- `express-rate-limit` — limits API abuse
- CORS restricted to `VITE_APP_URL`
- Cookie consent banner (GDPR)

---

## Frontend Pages

| Route | Page | Auth |
|-------|------|------|
| `/` | Home | Public |
| `/services` | Services (Pujas) | Public |
| `/services/yatra` | Yatra listing | Public |
| `/pujas/:id` | Puja detail + booking modal | Public |
| `/yatras/:id` | Yatra detail + booking modal | Public |
| `/shop` | Product catalogue | Public |
| `/product/:id` | Product detail | Public |
| `/cart` | Shopping cart + checkout | Public |
| `/astrology` | AI Astrology (Kundli, horoscope, panchang) | Public |
| `/temples` | Temple directory | Public |
| `/temple-knowledge` | Vedic knowledge base | Public |
| `/search` | AI-grounded search results | Public |
| `/about` | About PunyaSeva | Public |
| `/contact` | Contact + Veda AI chat | Public |
| `/vendor-registration` | Vendor signup form | Public |
| `/vendor/:id` | Vendor public profile | Public |
| `/terms` | Terms of Service | Public |
| `/privacy` | Privacy Policy | Public |
| `/wishlist` | Saved products | Protected |
| `/profile` | User profile + orders + bookings | Protected |
| `/naam-jap` | Naam Jap counter | Protected |
| `/order-tracking/:orderId` | Order tracking | Protected |
| `/vendor` | Vendor dashboard | Protected (vendor) |
| `/admin` | Admin dashboard | Protected (admin) |

All pages are **lazy-loaded** (Vite code splitting) — each route is a separate JS chunk.

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `Layout.tsx` | Shell — navbar, footer, dark mode toggle, language switcher, notification bell, profile dropdown |
| `VedaAI.tsx` | Floating AI chat widget (Gemini primary, OpenRouter fallback) |
| `DailyHoroscope.tsx` | Zodiac horoscope with localStorage caching (per sign × language × date) |
| `DailyPanchang.tsx` | Live Vedic panchang (tithi, nakshatra, yoga, rashi) — cached 24h in localStorage |
| `AuthModal.tsx` | Login / Register modal (email+password + Google OAuth) |
| `NotificationCenter.tsx` | Bell dropdown — reads `/api/notifications/:userId` |
| `WhatsAppBookingModal.tsx` | WhatsApp-sourced booking intake form |
| `YatraBookingModal.tsx` | Pilgrimage booking with pilgrim count and date |
| `SchedulingCalendar.tsx` | Date/time slot picker for puja bookings |
| `SignaturePad.tsx` | Canvas signature capture for bookings |
| `AIGroundedSearch.tsx` | AI-powered search with Gemini grounding |
| `VendorRegistrationModal.tsx` | Inline vendor onboarding form |
| `ProtectedRoute.tsx` | Auth guard — redirects to login if no session |
| `ErrorBoundary.tsx` | Catches React render errors gracefully |
| `CookieConsent.tsx` | GDPR cookie consent banner |

---

## AI Features

### Veda AI Chat (`/contact`, floating widget)
- Primary: Gemini 2.0 Flash via `@google/genai`
- Fallback: OpenRouter (`openai/gpt-oss-20b:free`) when Gemini quota exhausted
- System prompt enforces spiritual/devotional context
- Full conversation history passed on each turn

### AI Astrology (`/astrology`)
- **Kundli reading**: birth date + time + location → OpenRouter generates personalised Vedic reading
- **Daily horoscope**: per-sign prediction via Gemini — cached in `localStorage` by `sign_language_date`
- **Live panchang**: astronomical calculation (`suncalc` library) + Gemini for interpretation

### AI-Grounded Search (`/search`)
- Query sent to Gemini with product/puja catalogue context
- Returns ranked results with explanations

---

## API Surface (74 endpoints)

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/social-sync
POST /api/auth/request-password-reset
POST /api/auth/reset-password
```

### Users
```
GET  /api/users/:uid             requireAuth
PUT  /api/users/:uid             requireAuth
PUT  /api/users/:uid/address     requireAuth
POST /api/users/register-fcm-token
```

### Products
```
GET    /api/products
GET    /api/products/:id
GET    /api/products/:id/reviews
POST   /api/products             requireAdmin
PUT    /api/products/:id         requireAdmin
DELETE /api/products/:id         requireAdmin
POST   /api/upload               requireAdmin  (multer image upload)
```

### Pujas
```
GET    /api/pujas
GET    /api/pujas/:id
POST   /api/pujas                requireAuth
PUT    /api/pujas/:id            requireAuth
DELETE /api/pujas/:id            requireAuth
```

### Yatras
```
GET  /api/yatras
POST /api/yatras
```

### Bookings
```
GET   /api/bookings/:uid
POST  /api/bookings              requireAuth
PATCH /api/bookings/:id/status   requireAuth
PATCH /api/bookings/:id/payment  requireAuth
```

### Orders
```
GET   /api/orders/:uid
GET   /api/orders/details/:id
GET   /api/orders/:id/receipt
POST  /api/orders                requireAuth
PATCH /api/orders/:id/status     requireAuth
```

### Admin
```
GET  /api/admin/stats                    requireAdmin
GET  /api/admin/vendors-performance      requireAdmin
GET  /api/admin/pending-vendors          requireAdmin
POST /api/admin/approve-vendor           requireAdmin
POST /api/admin/reject-vendor            requireAdmin
GET  /api/admin/payouts                  requireAdmin
POST /api/admin/payouts/:id/status       requireAdmin
POST /api/admin/send-announcement        requireAdmin
```

### Vendor
```
GET  /api/vendors
GET  /api/vendors/:vendorId
GET  /api/vendors/:id/reviews
POST /api/vendor/register
GET  /api/vendor/stats/:vendorId
GET  /api/vendor/wallet/:vendorId
POST /api/vendor/payout/:vendorId
GET  /api/vendor/bookings/:vendorId
GET  /api/vendor/orders/:vendorId
GET  /api/vendor/whatsapp-bookings/:vendorId
```

### AI
```
POST /api/ai/chat
POST /api/ai/astrology
GET  /api/ai/horoscope
GET  /api/ai/panchang
GET  /api/ai/search
POST /api/astrology/reading
```

### Misc
```
GET  /api/feedback
POST /api/feedback
GET  /api/notifications/:userId
PATCH /api/notifications/:id/read
POST /api/coupons/validate
POST /api/create-payment-intent
GET  /api/stats/visitors
POST /api/stats/visitors/increment
GET  /api/naam-jap/logs
POST /api/naam-jap/save
POST /api/whatsapp-bookings
GET  /api/whatsapp-bookings
PATCH /api/whatsapp-bookings/:id/status
PATCH /api/whatsapp-bookings/:id/payment
POST /api/inquiry
GET  /api/health
```

---

## Key Workflows

### Puja Booking
1. User browses `/services`, opens a puja → `PujaDetail` page
2. Selects Online/Offline, date (SchedulingCalendar), samagri option → `POST /api/bookings` (requireAuth)
3. Server creates booking, notifies user + vendor, updates vendor wallet
4. Vendor confirms via dashboard → `PATCH /api/bookings/:id/status`
5. Payment recorded via `PATCH /api/bookings/:id/payment`

### Product Purchase
1. User adds to cart (localStorage) → `/cart`
2. Provides shipping address, applies coupon (`POST /api/coupons/validate`)
3. Stripe payment intent created (`POST /api/create-payment-intent`)
4. On success → `POST /api/orders` (requireAuth) — creates order, notifies vendors, updates wallets
5. User tracks order at `/order-tracking/:orderId`

### Vendor Onboarding
1. User fills `/vendor-registration` form → `POST /api/vendor/register`
2. Status set to `vendorStatus: 'pending'` in `users` table
3. Admin reviews at `/admin` → `POST /api/admin/approve-vendor` or `/reject-vendor`
4. On approval: `role` → `vendor`, `vendorStatus` → `approved`, notification sent
5. Vendor manages products/pujas/bookings via `/vendor` dashboard

### Password Reset
1. User submits email → `POST /api/auth/request-password-reset`
2. 6-digit OTP generated (15-min TTL), stored in server memory, logged (email delivery pending)
3. User submits OTP + new password → `POST /api/auth/reset-password`
4. OTP validated, bcrypt hash stored, OTP entry cleared

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | Yes | Server port (default 5000) |
| `JWT_SECRET` | Yes | Signs auth tokens (96-char hex recommended) |
| `DB_TYPE` | Yes | `mysql` or `firestore` |
| `MYSQL_HOST` | If MySQL | Database host |
| `MYSQL_USER` | If MySQL | Database user |
| `MYSQL_PASSWORD` | If MySQL | Database password |
| `MYSQL_DATABASE` | If MySQL | Database name |
| `MYSQL_PORT` | If MySQL | Database port (default 3306) |
| `GEMINI_API_KEY` | Yes | Google Gemini AI |
| `OPENROUTER_API_KEY` | Yes | OpenRouter fallback AI |
| `OPENROUTER_MODEL` | No | Model ID (default `openai/gpt-oss-20b:free`) |
| `STRIPE_SECRET_KEY` | Payments | Stripe server key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Payments | Stripe public key |
| `VITE_APP_URL` | Yes | CORS origin (e.g. `https://pre.punyaseva.in`) |
| `VITE_FCM_VAPID_KEY` | Push | Firebase Cloud Messaging VAPID key |
| `VITE_WHATSAPP_NUMBER` | No | WhatsApp contact number (displayed in footer) |

---

## Build & Deploy

```bash
# Install
npm install

# Development (Vite dev server + tsx watch)
npm run dev

# Production build
npm run build          # outputs to dist/

# Start (production)
pm2 start "npx tsx server.ts" --name divine-connect
pm2 restart divine-connect --update-env

# Database seed (idempotent — safe to re-run)
mysql -u divineuser -p divine_connect < database/seed.sql
```

Express serves `dist/` as static files in production. In development, Vite middleware is mounted on the Express server for HMR.

---

## Known Limitations

| Issue | Severity | Notes |
|-------|----------|-------|
| Stripe keys not configured | P1 | Payments operate in demo mode |
| OTP not emailed — logged to console only | P1 | nodemailer/SendGrid integration pending |
| Gemini free-tier quota exhausted | P2 | OpenRouter fallback active; paid key needed |
| No yatra images (uses hero placeholder) | P2 | Dedicated yatra photography needed |
| Large JS bundle (`index-*.js` ~779 kB) | P3 | Further code-splitting or dynamic imports needed |
