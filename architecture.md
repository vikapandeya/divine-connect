# PunyaSeva Architecture

PunyaSeva is a full-stack spiritual e-commerce and services platform designed to connect devotees with authentic puja services and spiritual products.

## Technology Stack

### Frontend
- **React (TypeScript)**: Core UI framework.
- **Vite**: Build tool and development server.
- **Tailwind CSS**: Utility-first styling.
- **Framer Motion**: Animations and transitions.
- **Lucide React**: Icon library.
- **React Router**: Client-side routing.
- **i18next**: Internationalization (English, Hindi, Sanskrit).
- **Stripe SDK**: Secure payment processing.

### Backend
- **Express (Node.js)**: Server framework.
- **Firebase Admin SDK**: Server-side interaction with Firebase services.
- **Gemini AI API**: Powering the "Veda AI" spiritual assistant.

### Database & Auth
- **Firebase Authentication**: User identity management (Google Login).
- **Cloud Firestore**: NoSQL document database for real-time data synchronization.

## System Components

### 1. User Interface (Client)
The frontend is a Single Page Application (SPA) that communicates with the Express backend via REST APIs and directly with Firebase for real-time updates.

### 2. API Layer (Server)
The Express server handles:
- User profile management.
- Service (Puja) and Product catalogs.
- Booking and Order processing.
- Payment intent creation (Stripe).
- Feedback and Review management.
- AI Assistant proxying.

### 3. Data Layer (Firestore)
Data is organized into collections:
- `users`: Profiles, addresses, and roles.
- `vendors`: Business details and verification status.
- `pujas`: Service details, pricing, and vendor links.
- `products`: Spiritual items, stock, and pricing.
- `bookings`: Puja appointments and status.
- `orders`: Product purchases and shipping status.
- `feedback`: User ratings and reviews.
- `notifications`: System and transaction alerts.

## Security Architecture
- **Firebase Security Rules**: Granular access control at the database level.
- **Server-side Validation**: Express routes validate incoming data and permissions.
- **Stripe Integration**: PCI-compliant payment handling via tokens and webhooks.
- **Environment Variables**: Sensitive keys (Firebase, Stripe, Gemini) are managed securely.

## Key Workflows

### Puja Booking
1. User selects a Puja service.
2. User chooses mode (Online/Offline) and Samagri options.
3. User confirms details in a modal.
4. Server creates a booking record.
5. User is prompted for feedback after completion.

### Product Purchase
1. User adds items to the cart.
2. User provides shipping address and selects payment method.
3. Stripe processes the payment.
4. Server creates an order and clears the cart.
5. User is prompted for feedback.

### Veda AI Assistant
1. User sends a query to the chat interface.
2. Frontend proxies the request through the Express server.
3. Server calls Gemini AI with spiritual context instructions.
4. AI response is streamed back to the user.
