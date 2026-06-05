# PunyaSeva — Architecture

PunyaSeva is a full-stack spiritual platform connecting devotees with puja services, pilgrimage packages, spiritual products, AI astrology, and temple knowledge. Live at **https://punyaseva.in** · Staging: **https://pre.punyaseva.in**.

---

## Technology Stack

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI framework (TypeScript) |
| Vite | 6 | Build tool + dev server |
| Tailwind CSS | 4 | Utility-first styling (`@tailwindcss/vite` plugin) |
| Framer Motion | 12 | Animations and transitions |
| React Router | 7 | Client-side routing (all 25 pages lazy-loaded) |
| i18next | 25 | Internationalisation — English, Hindi, Sanskrit |
| Recharts | 3 | Admin analytics charts |
| Lucide React | 0.546 | Icon set |
| Stripe.js | 9 | Payment UI (frontend SDK) |
| react-signature-canvas | 1 | Signature pad for bookings |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Express | 4 | HTTP server + REST API (~2,850 lines) |
| tsx | 4 | Runs TypeScript directly (no compile step) |
| mysql2 | 3 | MySQL connection pool with prepared statements |
| firebase-admin | 13 | Firestore fallback adapter + Google auth sync |
| zod | 4 | Input validation schemas on all critical endpoints |
| jsonwebtoken | 9 | JWT auth cookies (`authToken`) |
| bcryptjs | 3 | Password hashing |
| multer | 2 | File uploads (product images) |
| helmet | 8 | HTTP security headers |
| express-rate-limit | 8 | API rate limiting |
| cookie-parser | 1 | JWT cookie parsing |
| stripe | 21 | Payment intent creation + payment verification |
| @google/genai | 1 | Gemini AI (primary AI model) |
| nodemailer | 8 | Email delivery (OTP, booking notifications) |
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
├── server.ts                  # Express server (~2,850 lines)
├── src/
│   ├── App.tsx                # Route definitions (lazy-loaded)
│   ├── main.tsx               # React entry point
│   ├── types.ts               # Shared TypeScript types (AuthUser, Order, OrderItem, etc.)
│   ├── firebase.ts            # Firebase client initialisation
│   ├── index.css              # Global styles + design tokens
│   ├── pages/                 # 25 route-level page components
│   ├── components/            # Shared UI components
│   ├── contexts/              # ThemeContext (light/dark/system)
│   ├── hooks/                 # useAuth
│   ├── lib/
│   │   ├── db.ts              # DatabaseAdapter interface + FirestoreAdapter + MySQLAdapter
│   │   │                      #   — includes addBookingWithWallet() and addOrderWithWallets()
│   │   │                      #     for atomic MySQL transactions
│   │   ├── validation.ts      # Zod schemas (registerSchema, bookingSchema, orderSchema, etc.)
│   │   ├── astrology.ts       # Kundli prompt builder + OpenRouter call
│   │   ├── panchangCalc.ts    # Astronomical panchang calculator (suncalc)
│   │   ├── cart.ts            # localStorage cart helpers
│   │   ├── wishlist.ts        # localStorage wishlist helpers
│   │   ├── i18n.ts            # i18next setup + inline en/hi/sa translations
│   │   └── utils.ts           # formatIndianRupees + shared helpers
│   └── services/
│       ├── geminiService.ts   # Horoscope + panchang Gemini calls
│       ├── panchangService.ts # Panchang API wrapper
│       └── naamJapService.ts  # Naam Jap session persistence
├── database/
│   ├── schema.sql             # Full CREATE TABLE definitions
│   ├── seed.sql               # Idempotent seed — 40 products, pujas, yatras, feedback
│   ├── migrations/
│   │   ├── 001_add_missing_columns_and_yatras.sql
│   │   └── 002_add_performance_indexes.sql
│   └── tables/                # Per-table CREATE statements (used during dev)
├── public/
│   ├── products/              # 23 local product images (*.jpg)
│   ├── hero/                  # Hero section images
│   └── logo/                  # SVG/PNG brand assets
├── dist/                      # Vite production build (served by Express in production)
├── .env                       # Environment variables (not committed)
└── .env.example               # Template — all required variables documented
```

---

## Database Schema

**Primary database:** `divine_connect` (MySQL 8)

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | `uid` (PK), `email`, `displayName`, `password` (bcrypt), `role` (devotee/vendor/admin), `vendorStatus`, `fcmToken` | Password never returned in API responses |
| `products` | `id`, `vendorId`, `name`, `price`, `category`, `stock`, `rating`, `image`, `templeName`, `weightOptions` (JSON) | 40 seeded products across 8 categories |
| `pujas` | `id`, `vendorId`, `title`, `onlinePrice`, `offlinePrice`, `duration`, `samagriList` | 5 seeded puja services |
| `yatras` | `id`, `vendorId`, `title`, `price`, `duration`, `location`, `category`, `rating`, `images` (JSON), `itinerary` (JSON), `included` (JSON), `excluded` (JSON) | 3 seeded pilgrimages |
| `bookings` | `id`, `userId`, `serviceId`, `vendorId`, `type`, `date`, `timeSlot`, `status`, `totalAmount`, `paidAmount`, `isOnline`, `bringSamagri`, `paymentStatus` | status: pending/confirmed/completed/cancelled |
| `orders` | `id`, `userId`, `totalAmount`, `status`, `shippingAddress`, `paymentMethod`, `paymentStatus`, `paymentId`, `couponUsed`, `discountAmount` | status: processing/shipped/delivered/cancelled |
| `order_items` | `id`, `orderId`, `productId`, `quantity`, `price`, `selectedOption` | Linked to orders |
| `feedback` | `id`, `userId`, `serviceId`, `vendorId`, `type`, `name`, `city`, `rating`, `message`, `imageURL`, `createdAt` | Displayed on Home page |
| `vendors` | `userId` (PK), `name`, `type`, `description`, `rating`, `reviews`, `joinedAt` | Vendor profile |
| `vendor_wallets` | `vendorId` (PK), `balance`, `totalEarned` | Auto-created on first booking/order |
| `vendor_transactions` | `id`, `vendorId`, `amount`, `originalAmount`, `commission`, `type`, `referenceId`, `createdAt` | 10% commission deducted |
| `vendor_payouts` | `id`, `vendorId`, `amount`, `status`, `bankDetails` (JSON), `createdAt` | Payout requests |
| `notifications` | `id`, `userId`, `title`, `message`, `type`, `read`, `createdAt` | Bell icon in navbar |
| `whatsapp_bookings` | `id`, `userId`, `vendorId`, `pujaTitle`, `status`, `userLocation` (JSON), `distance`, `whatsappNumber`, `totalAmount`, `paidAmount`, `createdAt` | WhatsApp-sourced bookings |
| `naam_jap` | `id`, `userId`, `date`, `count`, `target`, `mantraName`, `updatedAt` | UNIQUE on (userId, date) |
| `coupons` | `id`, `code`, `discount`, `type`, `minAmount`, `active` | Discount codes |
| `otps` | `id`, `email`, `otp`, `expiresAt` | OTP records (active reset uses in-memory Map) |
| `stats` | `id`, `total`, `new`, `lastReset` | Site visitor counter |

**Indexes** (migration 002): All `vendorId`, `userId`, `serviceId`, `status`, `createdAt` columns on high-query tables.

**Fallback database:** Cloud Firestore (auto-selected when MySQL is unavailable).
Both backends implement the same `DatabaseAdapter` interface in `src/lib/db.ts`.

---

## Authentication & Security

```
Browser  ──POST /api/auth/login──►  Express
                                      │ Zod validates { email, password }
                                      │ bcrypt verifies password
                                      │ signs JWT (7-day expiry)
                                      ◄── Set-Cookie: authToken (httpOnly, sameSite=strict)

Subsequent requests send the cookie automatically.
```

**Startup enforcement:**
- Server calls `process.exit(1)` if `JWT_SECRET` is missing or default in `NODE_ENV=production`.

**Middleware chain:**
- `validate(schema)` — Zod middleware applied to all POST/PUT; returns `400` with field-level errors on failure
- `requireAuth` — verifies JWT from cookie or `Authorization: Bearer`; populates `req.user`
- `requireRole('vendor')` / `requireAdmin` — chains `requireAuth`, then role check

**Ownership checks (BOLA prevention):**
- All user-scoped endpoints (`/api/bookings/:uid`, `/api/orders/:uid`, `/api/naam-jap/*`) verify `req.user.uid === param` or `isAdmin`
- Vendor product PUT/DELETE fetches the product first and verifies `product.vendorId === req.user.uid`

**Protected routes (selected):**
- `GET /api/bookings/:uid` — `requireAuth` + ownership check
- `GET /api/orders/:uid` — `requireAuth` + ownership check
- `GET/POST /api/naam-jap/*` — `requireAuth` + ownership check
- `POST /api/whatsapp-bookings` — `requireAuth`
- `GET /api/whatsapp-bookings` — `requireAdmin`
- `POST /api/bookings`, `PATCH /api/bookings/:id/*` — `requireAuth`
- `POST /api/orders`, `PATCH /api/orders/:id/status` — `requireAuth`
- `PUT/DELETE /api/vendor/products/:id` — `requireVendor` + ownership check

**Payment security:**
- Stripe orders: `stripe.paymentIntents.retrieve(paymentId)` called before order insert; rejects if `status !== 'succeeded'`

**Password reset flow (OTP):**
1. `POST /api/auth/request-password-reset { email }` → 6-digit OTP stored in memory with 15-min TTL; **OTP is never returned in the response** (console-logged in dev only)
2. `POST /api/auth/reset-password { email, otp, newPassword }` → validates OTP, hashes new password, clears OTP

**Other security measures:**
- `helmet` — security headers (CSP delegated to Cloudflare)
- `express-rate-limit` — auth: 20/15 min; AI: 10/1 min
- CORS restricted to `VITE_APP_URL`
- Raw error messages never sent to clients — generic messages only
- Cookie consent banner (GDPR)

---

## Frontend Pages (25 total)

| Route | Page | Auth |
|-------|------|------|
| `/` | Home | Public |
| `/services` | Services (Pujas + Yatras) | Public |
| `/pujas/:id` | Puja detail + booking | Public |
| `/yatras/:id` | Yatra detail + booking | Public |
| `/shop` | Product catalogue (40 products, 8 categories) | Public |
| `/product/:id` | Product detail | Public |
| `/cart` | Cart + Stripe/COD/UPI checkout | Public |
| `/astrology` | AI Astrology (Kundli, horoscope, panchang) | Public |
| `/temples` | Temple directory | Public |
| `/temple-knowledge` | Vedic knowledge base | Public |
| `/search` | AI-grounded search | Public |
| `/about` | About PunyaSeva | Public |
| `/contact` | Contact + Veda AI chat | Public |
| `/vendor-registration` | Vendor signup | Public |
| `/vendor/:id` | Vendor public profile | Public |
| `/terms` | Terms of Service | Public |
| `/privacy` | Privacy Policy | Public |
| `/wishlist` | Saved products | Protected |
| `/profile` | User profile + orders + bookings + receipts | Protected |
| `/naam-jap` | Naam Jap counter (custom mantras, audio, history) | Protected |
| `/order-tracking/:id` | Order tracking | Protected |
| `/vendor` | Vendor dashboard | Protected (vendor) |
| `/admin` | Admin dashboard | Protected (admin) |
| `*` | 404 Not Found | Public |

All pages are **lazy-loaded** — each route is a separate JS chunk.

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `Layout.tsx` | Shell — navbar, footer, dark mode, language switcher, notification bell, cart badge |
| `AuthModal.tsx` | Login / Register modal (email+password + Google OAuth) |
| `ProtectedRoute.tsx` | Auth + role guard — redirects or shows Access Denied |
| `ErrorBoundary.tsx` | Catches React render errors gracefully |
| `SchedulingCalendar.tsx` | Date/time slot picker for puja bookings |
| `WhatsAppBookingModal.tsx` | WhatsApp-sourced booking intake |
| `NotificationCenter.tsx` | Bell dropdown — polls `/api/notifications/:userId` |
| `DailyHoroscope.tsx` | Zodiac horoscope — localStorage cached per sign × lang × date |
| `DailyPanchang.tsx` | Live Vedic panchang — cached 24h |
| `AIGroundedSearch.tsx` | AI-powered search with Gemini grounding |
| `VedaAI.tsx` | Floating Gemini AI chat widget |
| `CookieConsent.tsx` | GDPR cookie consent banner |
| `FeedbackModal.tsx` | Post-booking / post-purchase review form |
| `SignaturePad.tsx` | Canvas signature capture for bookings |

---

## AI Features

### Veda AI Chat (`/contact`, floating widget)
- Primary: Gemini 2.0 Flash via `@google/genai`
- Fallback: OpenRouter (`openai/gpt-oss-20b:free`) when Gemini quota exhausted
- System prompt enforces spiritual/devotional context

### AI Astrology (`/astrology`)
- **Kundli reading**: birth date + time + location → OpenRouter generates personalised Vedic reading
- **Daily horoscope**: per-sign prediction via Gemini — cached per `sign_language_date`
- **Live panchang**: astronomical calculation (`suncalc`) + Gemini interpretation

### AI-Grounded Search
- Query sent to Gemini with product/puja catalogue context
- Returns ranked, explained results

---

## API Surface

### Auth
```
POST /api/auth/register              validate(registerSchema)
POST /api/auth/login                 validate(loginSchema)
POST /api/auth/logout
POST /api/auth/social-sync
POST /api/auth/request-password-reset  validate(passwordResetRequestSchema) — OTP never in response
POST /api/auth/reset-password           validate(passwordResetSchema)
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
GET    /api/products             paginated (limit/offset)
GET    /api/products/:id
POST   /api/vendor/products      requireVendor  validate(productSchema)
PUT    /api/vendor/products/:id  requireVendor  + ownership check
DELETE /api/vendor/products/:id  requireVendor  + ownership check
POST   /api/upload               requireAuth    (multer image upload)
```

### Pujas
```
GET    /api/pujas                paginated
GET    /api/pujas/:id
POST   /api/pujas                requireAuth
PUT    /api/pujas/:id            requireAuth
DELETE /api/pujas/:id            requireAuth
```

### Yatras
```
GET  /api/yatras
POST /api/yatras
PUT  /api/yatras/:id             requireAuth
DELETE /api/yatras/:id           requireAuth
```

### Bookings
```
GET   /api/bookings/:uid         requireAuth + ownership
POST  /api/bookings              requireAuth  validate(bookingSchema) — atomic booking+wallet tx
PATCH /api/bookings/:id/status   requireAuth
PATCH /api/bookings/:id/payment  requireAuth
```

### Orders
```
GET   /api/orders/:uid           requireAuth + ownership
GET   /api/orders/details/:id
GET   /api/orders/:id/receipt
POST  /api/orders                requireAuth  validate(orderSchema) — Stripe verified + atomic tx
PATCH /api/orders/:id/status     requireAuth
```

### WhatsApp Bookings
```
POST  /api/whatsapp-bookings                    requireAuth  validate(whatsappBookingSchema)
GET   /api/whatsapp-bookings                    requireAdmin
PATCH /api/whatsapp-bookings/:id/status         requireAdmin
PATCH /api/whatsapp-bookings/:id/payment        requireAuth + ownership
GET   /api/vendor/whatsapp-bookings/:vendorId   requireAuth + ownership
```

### Naam Jap
```
GET  /api/naam-jap/logs          requireAuth + ownership
POST /api/naam-jap/save          requireAuth  validate(naamJapSchema) + ownership
```

### Vendor
```
GET  /api/vendors                paginated
GET  /api/vendors/:vendorId
POST /api/vendor/register
GET  /api/vendor/products/:vendorId
GET  /api/vendor/stats/:vendorId
GET  /api/vendor/wallet/:vendorId       requireAuth
GET  /api/vendor/transactions/:vendorId requireAuth
POST /api/vendor/payout/:vendorId       requireAuth
GET  /api/vendor/bookings/:vendorId
GET  /api/vendor/orders/:vendorId
GET  /api/vendor/top-products/:vendorId
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

### Feedback
```
GET  /api/feedback               paginated + filters (serviceId, type, vendorId)
POST /api/feedback               validate(feedbackSchema)
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
GET  /api/notifications/:userId
PATCH /api/notifications/:id/read
POST /api/coupons/validate
POST /api/create-payment-intent
GET  /api/stats/visitors
POST /api/stats/visitors/increment
POST /api/inquiry
GET  /api/health
GET  /api/receipt/:type/:id
```

---

## Key Workflows

### Puja Booking (Atomic)
1. User opens `PujaDetail`, selects mode/date/slot → `POST /api/bookings` (Zod validated, `requireAuth`)
2. Server uses `addBookingWithWallet()` — booking INSERT + wallet UPDATE in single MySQL transaction
3. Notifications sent to user and vendor (non-critical, outside transaction)
4. Vendor confirms via dashboard → `PATCH /api/bookings/:id/status`

### Product Purchase (Stripe verified)
1. User adds to cart → `/cart`, provides address, applies coupon
2. Stripe payment intent created (`POST /api/create-payment-intent`)
3. On client success → `POST /api/orders`: server calls `stripe.paymentIntents.retrieve()`, rejects if not `succeeded`
4. Server uses `addOrderWithWallets()` — order INSERT + all vendor wallet UPDATEs in single MySQL transaction
5. User tracks at `/order-tracking/:id`

### Vendor Onboarding
1. `/vendor-registration` → `POST /api/vendor/register` → `vendorStatus: 'pending'`
2. Admin reviews → `POST /api/admin/approve-vendor` → `role: 'vendor'`, `vendorStatus: 'approved'`
3. Vendor manages via `/vendor` dashboard

### Password Reset
1. `POST /api/auth/request-password-reset` → OTP generated, stored in memory (15-min TTL), **never returned in response**
2. In dev: OTP logged to server console only
3. `POST /api/auth/reset-password` → OTP validated, new bcrypt hash stored

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | Yes | Server port (default 5000) |
| `JWT_SECRET` | **Yes — exits in production if missing** | Signs auth tokens |
| `DB_TYPE` | Yes | `mysql` or `firestore` |
| `MYSQL_HOST` | If MySQL | Database host |
| `MYSQL_USER` | If MySQL | Database user |
| `MYSQL_PASSWORD` | If MySQL | Database password |
| `MYSQL_DATABASE` | If MySQL | Database name |
| `MYSQL_PORT` | If MySQL | Database port (default 3306) |
| `GEMINI_API_KEY` | Yes | Google Gemini AI |
| `OPENROUTER_API_KEY` | Yes | OpenRouter fallback AI |
| `OPENROUTER_MODEL` | No | Model ID (default `openai/gpt-oss-20b:free`) |
| `STRIPE_SECRET_KEY` | Payments | Stripe server key — demo mode if blank |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Payments | Stripe public key |
| `VITE_APP_URL` | Yes | CORS origin |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Email | OTP + notification emails via nodemailer |
| `VITE_FCM_VAPID_KEY` | Push | Firebase Cloud Messaging |

---

## Build & Deploy

```bash
npm install
npm run build          # outputs to dist/
pm2 start "npx tsx server.ts" --name divine-connect
pm2 restart divine-connect --update-env

# Database migrations (existing databases only)
mysql -u divineuser -p divine_connect < database/migrations/001_add_missing_columns_and_yatras.sql
mysql -u divineuser -p divine_connect < database/migrations/002_add_performance_indexes.sql
```

Express serves `dist/` as static files in production. In development, Vite middleware is mounted on Express for HMR.

---

## Known Limitations

| Issue | Severity | Notes |
|-------|----------|-------|
| Stripe keys not configured | P1 | Payments operate in demo mode; set `STRIPE_SECRET_KEY` |
| OTP not emailed — server console only | P1 | nodemailer configured but SMTP credentials needed |
| Gemini free-tier quota | P2 | OpenRouter fallback active; paid key recommended |
| Firebase SDK in main JS bundle | P2 | ~250 KB; can be split via `manualChunks` in vite.config.ts |
| Main bundle ~845 KB | P2 | Firebase + i18n translations; further code-splitting possible |
| No Redis for rate-limit state | P3 | In-memory rate limits reset on PM2 restart |
| File uploads to local filesystem | P3 | Not horizontally scalable; migrate to S3/GCS for multi-instance |
| 8 moderate npm audit findings | P3 | In firebase-admin transitive deps — not fixable without breaking Firebase |
