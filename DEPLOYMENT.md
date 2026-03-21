# DivineConnect Firebase Deployment

DivineConnect now uses:

- Firestore for app data
- Firebase Authentication for sign-in and password reset
- Firebase Functions for the secure backend API
- Gemini from the backend only for AI Astrology and AI Support

## Collections

The Firebase backend uses these main collections:

- `users`
- `products`
- `pujas`
- `bookings`
- `orders`
- `astrologyReadings`
- `supportChatLogs`

Default products and pujas are seeded automatically by the backend.

## One-Time Setup

1. Make sure the Firebase project in `.firebaserc` is the correct project.
2. In the Firebase console, enable:
   - Authentication
   - Firestore Database
   - Cloud Functions
3. Set the Gemini secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

4. Install Functions dependencies:

```bash
cd functions
npm install
cd ..
```

## Deploy Backend + Firestore Rules

```bash
npm run firebase:deploy
```

This deploys:

- Firestore rules from `firestore.rules`
- the `api` Firebase Function from `functions/index.js`
- Firebase Hosting if you choose to use it

## Default Backend URL

The frontend now defaults to this Firebase Functions endpoint:

```text
https://asia-south1-gen-lang-client-0754686396.cloudfunctions.net/api
```

That means your existing frontend can call the Firebase backend without MySQL or Render.

## Optional Frontend Override

If you want to point the frontend somewhere else, set:

```text
VITE_API_BASE_URL=
```

Example:

```text
VITE_API_BASE_URL=https://asia-south1-gen-lang-client-0754686396.cloudfunctions.net/api
```

## Local Development

Frontend:

```bash
npm run dev
```

Firebase emulators:

```bash
npm run firebase:emulators
```

For local Gemini testing in emulators, create `functions/.secret.local` with:

```text
GEMINI_API_KEY=your_key_here
```
