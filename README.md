# DivineConnect

DivineConnect is a full-stack spiritual services platform for puja booking, darshan access, sacred products, AI-powered astrology, and guided customer support.

## Features

- Book pujas and spiritual services
- Browse and buy sacred products
- Get AI-powered Vedic astrology readings
- Use AI support chat for bookings, orders, and onboarding help
- Manage devotee, vendor, and admin flows

## Stack

- Frontend: React, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js, Express
- Database: MySQL
- Auth: Firebase Authentication
- AI: Google Gemini via `@google/genai`

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill in:

- `GEMINI_API_KEY`
- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_PORT`
- `FRONTEND_ORIGIN`
- `VITE_API_BASE_URL` when frontend and backend are on different origins

3. Run the frontend:

```bash
npm run dev
```

4. Run the backend:

```bash
npm run dev:server
```

## Production

- `npm run build` builds the production frontend
- `npm start` runs the production backend and serves `dist/`
- `npm run build:pages` builds the GitHub Pages version under `docs/`

## Live Deployment

- GitHub Pages frontend deployment is handled by `.github/workflows/deploy.yml`
- The workflow reads `VITE_API_BASE_URL` from GitHub repository secrets
- The backend can be deployed with the included `render.yaml`

See `DEPLOYMENT.md` for the full live deployment steps.

## Live URL

`https://vikapandeya.github.io/divine-connect/docs/`
