# DivineConnect Architecture

## 1. Executive Summary

DivineConnect is a spiritual services and devotional commerce platform that combines:

- Puja booking
- Darshan support
- Yatra package booking
- Temple prasad and spiritual product commerce
- AI astrology
- Support and feedback
- Vendor and admin operations

The codebase currently supports two architectural modes:

1. Current live/demo mode
   - The frontend runs primarily as a static React SPA.
   - Most user-facing data flows are powered by browser `localStorage` through local demo adapters.
   - This allows the site to work as a polished interactive demo even on GitHub Pages.

2. Intended production mode
   - Firebase Hosting + Firebase Functions + Firestore + Firebase Auth.
   - Gemini-backed AI endpoints for astrology and support.
   - Role-aware backend APIs for devotees, vendors, and admins.

This distinction is the most important architectural finding in the project.

## 2. Product Purpose

### 2.1 Core Purpose

The platform is designed to create a guided devotional digital experience where a user can:

- Learn about rituals and scriptures
- Book sacred services
- Order devotional products
- Manage order and booking records
- Access astrology guidance
- Interact with vendor and admin workflows

### 2.2 Target Users

- Devotees and families
- Temple-oriented spiritual shoppers
- Vendors such as priests, temples, or spiritual product sellers
- Admin/platform operators

### 2.3 Business Model Assumptions

Likely revenue sources:

- Commission on product sales
- Margin or commission on puja bookings
- Margin on yatra packages
- Premium live consultation or astrology upsell
- Vendor onboarding or subscription in later stages

## 3. Current State vs Intended State

## 3.1 Current State

The current frontend does not actively use live API calls for the main app experience.

Instead, it uses:

- `src/lib/firestore-data.ts`
- `src/lib/cart.ts`
- `src/lib/platform.ts`

These files simulate backend behavior using:

- `localStorage`
- hardcoded demo profiles
- hardcoded seed catalog
- hardcoded booking/order/readings history generation

This makes the product behave like a production-style interactive demo.

## 3.2 Intended Production State

The backend in `functions/index.js` and the Firestore rules/indexes show the intended future architecture:

- Firebase Authentication for identity
- Firestore for persistence
- Firebase Functions as the API layer
- Gemini for AI-generated astrology and support chat
- Role-based access for vendor/admin operations

## 4. High-Level Architecture

```text
Browser
  ->
React SPA (Vite, React Router, Tailwind, Framer Motion)
  ->
Current mode:
  localStorage-backed demo adapters

Intended production mode:
  Firebase Hosting / GitHub Pages
    ->
  Firebase Functions REST API
    ->
  Firestore
    ->
  Gemini APIs for AI features
```

## 4.1 Architectural Style

This is best described as a modular monolith:

- One frontend SPA
- One backend Express app hosted in Firebase Functions
- One Firestore database
- Shared domain concepts across all product areas

It is not a microservices architecture.

## 5. Repository Structure

```text
divine-connect/
  src/
    components/
    pages/
    lib/
    assets/
    types.ts
    App.tsx
    main.tsx
  functions/
    index.js
    package.json
  public/
    sw.js
    manifest.webmanifest
  docs/
    static GitHub Pages build output
  firebase.json
  firestore.rules
  firestore.indexes.json
  vite.config.ts
```

## 6. Frontend Architecture

## 6.1 Framework and Tooling

- React 19
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS v4
- Framer Motion
- Lucide React

## 6.2 Routing

The route map is defined in `src/App.tsx`.

### Primary Routes

- `/`
- `/services`
- `/services/puja/:id`
- `/services/darshan`
- `/services/yatra`
- `/services/prasad`
- `/shop`
- `/knowledge`
- `/about`
- `/contact`
- `/profile`
- `/cart`
- `/vendor`
- `/admin`
- `/astrology`
- `*`

### Routing Strategy

- `BrowserRouter` with `basename={import.meta.env.BASE_URL}`
- Route-level lazy loading via `React.lazy`
- Suspense fallback loader
- Error boundary wraps the entire app shell

## 6.3 Application Shell

The main shell is defined by:

- `src/components/Layout.tsx`

It provides:

- sticky header
- top utility bar
- desktop and mobile navigation
- search entry
- cart count
- profile menu
- locale switcher
- notifications
- footer with internal navigation

## 6.4 UI Design System

The visual language is consistent across the app:

- warm stone and saffron palette
- serif display headings
- large rounded cards
- generous spacing
- motion-based section entry transitions
- soft gradients and blurred surfaces

### Shared Design Patterns

- `PageHero` for page-level header sections
- pill buttons and chips
- card-first content organization
- strong hierarchy for CTA surfaces
- sticky action panels on booking/checkout pages

### Theming

Global styling in `src/index.css` defines:

- background gradients
- accent colors
- focus states
- scrollbar treatment
- light-only visual scheme

## 6.5 Responsiveness

The site is responsive throughout:

- mobile menu for smaller screens
- stacked forms and cards on small devices
- multi-column layouts on desktop
- sticky panels only where appropriate
- utility classes reflect mobile-first layout design

## 7. Frontend Pages and Responsibilities

## 7.1 Home

Purpose:

- landing page
- value proposition
- daily spiritual content
- featured services and products
- feedback submission

Key modules:

- panchang and horoscope cards
- temple spotlights
- featured products
- feedback form
- knowledge content preview

## 7.2 Services

Purpose:

- service discovery hub
- puja browsing
- cross-sell into darshan, astrology, yatra

Key modules:

- puja listing
- service explainers
- temple support highlights
- livestream-readiness demo content

## 7.3 Puja Detail

Purpose:

- detailed booking page for a single puja

Key modules:

- puja description
- online/offline mode selection
- date and slot selection
- booking confirmation
- live session placeholder metadata

## 7.4 Darshan Booking

Purpose:

- reserve darshan support by temple, date, slot, and mode

## 7.5 Yatra Booking

Purpose:

- compare pilgrimage packages
- select route and departure city
- reserve travel package

## 7.6 Prasad Delivery

Purpose:

- content bridge into prasad commerce
- temple-origin trust framing

## 7.7 Shop

Purpose:

- product catalog and browse/search/filter interface

Key modules:

- categories
- city filters
- price/rating filters
- wishlist
- review-photo counts
- add-to-cart

## 7.8 Cart

Purpose:

- cart review
- quantity management
- delivery details
- payment method selection
- order creation

## 7.9 Profile

Purpose:

- user workspace for activity history

Tabs:

- profile
- bookings
- orders
- readings

Notable features:

- PDF invoice download
- receipt printing
- booking certificate generation
- puja invitation download
- order certificate generation
- kundali certificate generation
- reorder/book again
- simulated notifications

## 7.10 Vendor Dashboard

Purpose:

- vendor operations panel

Capabilities:

- manage products
- manage pujas
- review bookings
- update booking statuses
- view finance snapshot
- see low-stock alerts

## 7.11 Admin Dashboard

Purpose:

- platform-level inventory and summary operations

Capabilities:

- platform stats
- catalog management
- alert panels
- payout queue summary
- PWA readiness summary

## 7.12 Astrology

Purpose:

- interactive astrology experience

Modes:

- AI Kundali Reading
- Kundali Match
- Rashi Phal

Current behavior:

- generated locally in browser
- saved to local demo history

Intended production behavior:

- generated by Gemini through backend

## 7.13 Contact

Purpose:

- support hub
- email/phone/location access
- AI support chat

Current behavior:

- uses local demo response generator

Intended production behavior:

- backed by Gemini support endpoint

## 7.14 Knowledge

Purpose:

- content hub for devotional learning

Content modules:

- featured editorial
- puja guides
- scripture library
- temple guides
- learning paths
- FAQ-style devotee questions

## 8. Frontend State Management

There is no centralized state library like Redux or Zustand.

State is handled through:

- React local component state
- URL query params
- localStorage
- small subscription helpers

## 8.1 Client-Side Persistence

Main browser storage areas:

- cart
- products
- pujas
- bookings
- orders
- astrology readings
- feedback
- locale
- wishlist

## 8.2 Event-Based Sync

The app uses browser events to synchronize UI updates:

- cart update events
- locale update events
- wishlist update events

This is a lightweight local event-bus approach.

## 9. Backend Architecture

## 9.1 Backend Stack

Defined in `functions/package.json`:

- Node.js 20
- Express
- CORS
- Firebase Admin SDK
- Firebase Functions
- `@google/genai`

## 9.2 Hosting and Routing

`firebase.json` shows:

- Firestore config
- Functions source at `functions/`
- Hosting rewrites:
  - `/api/**` -> Function `api`
  - everything else -> `index.html`

This indicates an SPA + API setup when deployed via Firebase Hosting.

## 9.3 API Style

The backend uses REST endpoints, not GraphQL.

Representative endpoints:

- `GET /api`
- `GET /api/health`
- `GET /api/users/:uid`
- `POST /api/users`
- `GET /api/admin/stats`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/pujas`
- `POST /api/pujas`
- `PUT /api/pujas/:id`
- `DELETE /api/pujas/:id`
- `GET /api/bookings/:uid`
- `GET /api/vendor/bookings/:vendorId`
- `PATCH /api/bookings/:id/status`
- `POST /api/bookings`
- `GET /api/orders/:uid`
- `POST /api/orders`
- `GET /api/orders/:uid/:orderId/receipt`
- `GET /api/astrology/readings/:uid`
- `POST /api/astrology/reading`
- `POST /api/support/chat`
- `POST /api/feedback`

## 9.4 Backend Responsibilities

The backend is intended to own:

- authentication verification
- authorization
- Firestore CRUD
- seed initialization
- analytics-like admin stats
- astrology generation
- support chat generation
- secure multi-user record access

## 10. Authentication and Authorization

## 10.1 Intended Auth Model

The backend expects Firebase ID tokens:

- `Authorization: Bearer <idToken>`

User roles are resolved from:

- Firebase Auth token identity
- Firestore `users` document role

Roles:

- `devotee`
- `vendor`
- `admin`

## 10.2 Current Frontend Behavior

The current frontend does not expose a real sign-in flow.

Instead, it uses demo identities:

- demo devotee
- demo vendor
- demo admin

This means current role separation in the UI is mostly presentational/demo-oriented.

## 10.3 Authorization Rules

Both backend code and Firestore rules enforce intended access patterns:

- devotees can access their own orders/bookings/profile
- vendors can manage their own products/pujas and related bookings
- admins can access platform-wide operations

## 11. Database Design

The data model is visible across:

- `src/types.ts`
- `functions/index.js`
- `firestore.rules`

## 11.1 Core Collections

### users

Fields:

- `uid`
- `displayName`
- `email`
- `photoURL`
- `role`
- `phoneNumber`
- `addresses`
- `createdAt`
- `updatedAt`

### vendors

Fields inferred from frontend type:

- `uid`
- `businessName`
- `description`
- `type`
- `status`
- `gstNumber`
- `rating`
- `commissionRate`

### products

Fields:

- `vendorId`
- `name`
- `description`
- `price`
- `category`
- `image`
- `stock`
- `rating`
- `templeName`
- `weight`
- `size`
- `dispatchWindow`
- `city`
- `offeringType`
- `tags`
- `searchKeywords`
- `isActive`
- `createdAt`
- `updatedAt`

### pujas

Fields:

- `vendorId`
- `title`
- `description`
- `price`
- `duration`
- `samagriIncluded`
- `mode`
- `onlineTimings`
- `offlineTimings`
- `templeName`
- `liveDarshanAvailable`
- `searchKeywords`
- `isActive`
- `createdAt`
- `updatedAt`

### bookings

Fields:

- `userId`
- `serviceId`
- `serviceTitle`
- `vendorId`
- `type`
- `mode`
- `date`
- `timeSlot`
- `status`
- `totalAmount`
- `bookingReference`
- `createdAt`
- `updatedAt`

Booking types currently modeled end to end:

- `puja`
- `darshan`
- `yatra`

### orders

Fields:

- `userId`
- `orderNumber`
- `items`
- `itemCount`
- `totalAmount`
- `status`
- `shippingAddress`
- `customerDetails`
- `receipt`
- `estimatedDeliveryDate`
- `statusTimeline`
- `createdAt`
- `updatedAt`

### astrologyReadings

Fields:

- `userId`
- `name`
- `dob`
- `tob`
- `pob`
- `readingType`
- `partnerName`
- `partnerDob`
- `partnerTob`
- `partnerPob`
- `rashi`
- `userQuery`
- `reading`
- `createdAt`

### feedbackSubmissions

Fields:

- `userId`
- `name`
- `email`
- `subject`
- `rating`
- `message`
- `createdAt`

### supportChatLogs

Fields inferred from backend:

- `userId`
- `userMessage`
- `assistantMessage`
- `createdAt`

### _system/bootstrap

Purpose:

- tracks seed version initialization

## 11.2 Entity Relationships

```text
User
  1 -> many Bookings
  1 -> many Orders
  1 -> many AstrologyReadings

Vendor(User role)
  1 -> many Products
  1 -> many Pujas
  1 -> many Bookings

Order
  contains many OrderItems

Booking
  references one service, which may be:
    - a puja
    - a darshan temple flow
    - a yatra package
```

## 11.3 Index Strategy

`firestore.indexes.json` defines composite indexes for:

- products by category + updatedAt
- products by vendorId + updatedAt
- pujas by vendorId + updatedAt
- bookings by userId + createdAt
- bookings by vendorId + createdAt
- orders by userId + createdAt
- astrologyReadings by userId + createdAt

This supports the intended dashboard and history queries.

## 12. Key Domain Services

## 12.1 Commerce

Implemented through:

- `src/pages/Shop.tsx`
- `src/pages/Cart.tsx`
- `src/lib/cart.ts`
- `src/lib/receipts.ts`
- `src/lib/documents.ts`

Capabilities:

- browse
- filter
- wishlist
- cart
- checkout
- invoice generation
- reorder

## 12.2 Service Booking

Implemented through:

- `Services`
- `PujaDetail`
- `DarshanBooking`
- `YatraBooking`

Capabilities:

- date/slot selection
- booking creation
- profile history
- certificate creation

## 12.3 Astrology

Current:

- local reading generation
- client-side history save

Planned:

- Gemini-generated personalized readings
- backend-only protected AI access

## 12.4 Support

Current:

- local deterministic support replies

Planned:

- Gemini-powered support assistant
- chat logging

## 13. Documents and Artifact Generation

One standout feature is rich PDF and print artifact generation.

Implemented in:

- `src/lib/documents.ts`
- `src/lib/receipts.ts`
- `src/lib/pdf.ts`

Generated artifacts include:

- booking certificates
- puja invitation cards
- order certificates
- kundali certificates
- printable invoices
- downloadable PDF receipts

This is a meaningful differentiator because it turns user actions into formal devotional/transaction records.

## 14. PWA and Offline Strategy

The app includes:

- service worker
- manifest
- offline-friendly shell strategy
- runtime cache cleanup logic
- chunk-load recovery handling

Current PWA behavior is geared toward:

- caching shell/static assets
- installability
- resilient route loading

The service worker was recently hardened to reduce stale chunk issues on GitHub Pages.

## 15. Deployment Architecture

## 15.1 Build Targets

There are two build targets in `vite.config.ts` and `package.json`:

- default build -> `dist`
- GitHub Pages build -> `docs`

## 15.2 Hosting Modes

### GitHub Pages

- static docs build
- no real backend connectivity in active UI flows
- suitable for demo/showcase mode

### Firebase Hosting

- SPA hosting
- API rewrites to Firebase Functions
- suitable for full-stack deployment

## 15.3 Runtime Base Paths

The app uses different `base` paths depending on build mode:

- `/divine-connect/`
- `/divine-connect/docs/`

This is important for route and asset resolution.

## 16. Security Analysis

## 16.1 Strengths

- explicit Firestore validation rules
- role-aware backend checks
- admin detection with verified email fallback
- astrology write path intended to go through backend only
- separation between client and Gemini secret via Functions secret

## 16.2 Current Risks

- live frontend relies on demo profiles and local storage instead of real auth
- admin/vendor pages are openly reachable in demo mode
- no frontend API client currently enforcing secure server flows
- permissive CORS configuration in Functions
- no visible rate limiting, abuse throttling, or bot protection
- hardcoded admin email
- payments are UI-only placeholders

## 16.3 Schema/Rules Gaps

The major booking-type mismatch has been resolved, but future production hardening should still verify:

- shared validation parity between frontend, Functions, and Firestore rules
- explicit vendor ownership rules for any non-system yatra providers
- broader rule test coverage for newly added booking flows

## 17. Performance and Optimization

Implemented performance measures:

- route-level lazy loading
- manual vendor chunk splitting
- local-first reads for demo mode
- image fallbacks and generated placeholders
- service worker shell caching
- Suspense loading boundary

Likely future performance needs:

- real image CDN strategy
- pagination or infinite loading for large catalogs
- search indexing
- server-driven filtering for scale
- analytics and error monitoring

## 18. SDLC and Delivery Practices

Observed practices suggest:

- Git-based source control
- build-first workflow with `npm run build`, `build:pages`, and `lint`
- Firebase deployment flow for production
- GitHub Pages flow for public demo

Current maturity level appears to be:

- strong UI prototyping
- moderate backend scaffolding
- low automated testing coverage

## 18.1 Testing

Visible testing strategy is minimal.

Observed checks:

- TypeScript compile validation via `npm run lint`

Missing layers:

- unit tests
- integration tests
- e2e tests
- API contract tests
- Firestore rule tests

## 19. Recommended Roadmap

## 19.1 Immediate Architecture Priorities

1. Introduce a real frontend data-access layer
2. Add real auth UI and session handling
3. Switch main flows from `*Direct` local adapters to backend APIs
4. Fix yatra booking schema/rule mismatch
5. Add environment-based demo vs production mode switching

## 19.2 Product Priorities

1. Real payment integration
2. Vendor onboarding and KYC workflow
3. Shipment/tracking integration
4. Search and recommendation quality
5. Notification delivery channels
6. Live darshan meeting integration

## 19.3 Engineering Priorities

1. Extract typed API client
2. Add test coverage
3. Add observability and logging
4. Add validation shared between client and backend
5. Improve role-based route protection in frontend

## 20. Clone Guide

## 20.1 Recommended Build Order

1. Create domain model
   - users
   - vendors
   - products
   - pujas
   - bookings
   - orders
   - astrology readings

2. Build frontend shell
   - router
   - layout
   - reusable hero and card components

3. Build browse flows
   - services
   - shop
   - knowledge

4. Build conversion flows
   - puja booking
   - darshan booking
   - yatra booking
   - cart and checkout

5. Build record-management flows
   - profile
   - invoice generation
   - booking certificates

6. Build operator workflows
   - vendor dashboard
   - admin dashboard

7. Add backend
   - Firebase Auth
   - Firestore
   - Functions REST API

8. Add AI features
   - astrology
   - support chat

9. Add real integrations
   - payments
   - communications
   - live meeting/video
   - analytics

10. Production hardening
   - tests
   - monitoring
   - security review
   - caching and performance tuning

## 20.2 Suggested Tech Stack for a Similar Build

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Motion: Framer Motion
- Routing: React Router
- Auth: Firebase Auth
- Backend: Express on Firebase Functions
- Database: Firestore
- AI: Gemini
- Hosting: Firebase Hosting or Vercel + serverless backend
- Documents: browser PDF generation or server-side PDFs

## 21. Final Architectural Assessment

DivineConnect already has a strong product shell and a surprisingly rich experiential layer:

- polished responsive UI
- coherent product architecture
- operator dashboards
- document generation
- content-led trust building
- multiple devotional journeys

Its main architectural gap is not the lack of product definition. The gap is the transition from:

- static demo with local adapters

to:

- secure, authenticated, API-driven production system

That transition is highly feasible because the domain model, route structure, backend skeleton, and role concepts are already present.

## 22. Source Anchors

The architecture above is primarily derived from:

- `src/App.tsx`
- `src/components/Layout.tsx`
- `src/components/PageHero.tsx`
- `src/pages/*`
- `src/lib/firestore-data.ts`
- `src/lib/cart.ts`
- `src/lib/platform.ts`
- `src/lib/documents.ts`
- `src/lib/receipts.ts`
- `functions/index.js`
- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`
- `vite.config.ts`
- `package.json`
