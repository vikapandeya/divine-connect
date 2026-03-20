# DivineConnect Deployment

DivineConnect now has two AI-backed features that run on the backend:

- `POST /api/astrology/reading`
- `POST /api/support/chat`

Both endpoints require:

- `GEMINI_API_KEY`
- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_PORT`

## Recommended: Deploy Full Stack on One Node Host

This is the simplest way to make AI Astrology and AI Support work in production.

1. Set these environment variables on your Node host:
   - `GEMINI_API_KEY`
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT`
   - `PORT`
   - `FRONTEND_ORIGIN`
2. Install dependencies:

```bash
npm install
```

3. Build the frontend:

```bash
npm run build
```

4. Start the backend:

```bash
npm start
```

The Express server will serve the built frontend from `dist/` and handle all `/api/*` requests.

## Recommended Hosted Backend: Render

This repo now includes `render.yaml` so you can deploy the backend as a Render web service directly from the repository.

1. In Render, create a new Blueprint from this repository.
2. For the `divineconnect-api` service, set:
   - `GEMINI_API_KEY`
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT`
   - `FRONTEND_ORIGIN`
3. After the first deploy, copy the Render backend URL.
4. Add that URL as the GitHub repository secret `VITE_API_BASE_URL`.

Example:

```text
https://divineconnect-api.onrender.com
```

Once that secret is added, the GitHub Pages workflow will rebuild the frontend with the correct API base URL.

## Local Development

Run the frontend and backend separately:

```bash
npm run dev
```

```bash
npm run dev:server
```

When the frontend runs on a different origin, set `VITE_API_BASE_URL` to the backend URL, for example:

```text
http://localhost:3000
```

## If You Keep GitHub Pages for the Frontend

GitHub Pages cannot run the Node backend. In that setup:

1. Deploy the backend separately on a Node host using the steps above.
2. Set `FRONTEND_ORIGIN` on the backend to your frontend URL.
3. Add a repository secret named `VITE_API_BASE_URL` with your backend URL, for example:

```text
https://your-backend.example.com
```

4. The GitHub Actions Pages build will inject that URL into the frontend.

## GitHub Pages Automation

The repository workflow in `.github/workflows/deploy.yml` now:

1. Builds the `/docs` version of the site with `VITE_API_BASE_URL`.
2. Publishes the generated `docs/` output to the `docs` path on the Pages branch.

This keeps the existing live URL style working:

```text
https://vikapandeya.github.io/divine-connect/docs/
```

## Notes

- The backend auto-creates the required MySQL tables on startup.
- Astrology readings are stored in `astrology_readings`.
- AI support exchanges are stored in `support_chat_logs`.
- GitHub repository secrets are available to GitHub Actions at build time, but they are not a runtime environment for GitHub Pages.
