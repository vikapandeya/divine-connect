# DivineConnect

DivineConnect is a full-stack spiritual services platform for puja booking, sacred products, AI-powered astrology, and guided support.

## Stack

- Frontend: React, TypeScript, Tailwind CSS, Framer Motion
- Auth: Firebase Authentication
- Database: Cloud Firestore
- Backend: Firebase Functions
- AI: Google Gemini through the backend only

## Features

- Puja browsing and booking
- Spiritual shop and checkout flow
- Devotee, vendor, and admin dashboards
- AI Astrology for signed-in users
- AI Support chat from the contact page

## Local Development

Install frontend dependencies:

```bash
npm install
```

Install Functions dependencies:

```bash
cd functions
npm install
cd ..
```

Run the frontend:

```bash
npm run dev
```

Run Firebase emulators:

```bash
npm run firebase:emulators
```

## Firebase Setup

1. Use the Firebase project in `.firebaserc`, or update it to your own project.
2. Enable Firestore, Authentication, and Functions in Firebase.
3. Set the Gemini backend secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

4. Deploy:

```bash
npm run firebase:deploy
```

## API Routing

The frontend defaults to the Firebase Functions endpoint:

```text
https://asia-south1-gen-lang-client-0754686396.cloudfunctions.net/api
```

You can override this with `VITE_API_BASE_URL` if needed.

## Live URL

`https://vikapandeya.github.io/divine-connect/docs/`
