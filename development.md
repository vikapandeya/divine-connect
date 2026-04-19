# PunyaSeva Development Guide

This guide provides instructions for setting up and developing the PunyaSeva application.

## Prerequisites
- **Node.js**: v18 or higher.
- **npm**: v9 or higher.
- **Firebase Project**: Access to a Firebase project with Firestore and Auth enabled.
- **Stripe Account**: For payment processing testing.
- **Gemini API Key**: For AI assistant features.

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd punyaseva
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# FCM Configuration
VITE_FCM_VAPID_KEY=your_fcm_vapid_key
```

### 4. Run the Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Development Workflow

### Frontend Development
- **Components**: Reusable UI components are located in `src/components`.
- **Pages**: Main application pages are in `src/pages`.
- **Styling**: Use Tailwind CSS utility classes. Global styles are in `src/index.css`.
- **State Management**: Use React hooks (`useState`, `useEffect`) and Firebase listeners (`onSnapshot`).
- **Internationalization**: Add translations to `src/i18n/locales`.

### Backend Development
- **Server**: The Express server is defined in `server.ts`.
- **API Routes**: Add new endpoints in `server.ts` to handle backend logic.
- **Firebase Admin**: Use the Firebase Admin SDK for server-side Firestore and Auth operations.

### Database Management
- **Schema**: Update `firebase-blueprint.json` to reflect changes in the data structure.
- **Security Rules**: Modify `firestore.rules` to enforce access control. Deploy rules using `firebase deploy --only firestore:rules`.

## Testing
- **Unit Testing**: Use Jest for testing utility functions.
- **Component Testing**: Use React Testing Library for frontend components.
- **Integration Testing**: Test the full flow from frontend to backend.

## Code Style
- Follow TypeScript best practices.
- Use functional components and hooks.
- Maintain clean, readable code with comments where necessary.
- Use Lucide React for all icons.
- Ensure responsive design using Tailwind's mobile-first approach.
