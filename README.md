# DivineConnect

DivineConnect is a comprehensive full-stack platform designed to bridge the gap between spiritual traditions and modern technology. It provides a sacred digital space for devotees to access temple services, spiritual products, and divine guidance.

## 🌟 Features

- **Temple Services**: Book Pujas, Darshan slots, and order Prasad from verified temples.
- **Spiritual Marketplace**: A dedicated shop for spiritual essentials, idols, and sacred items.
- **AI Astrology (Jyotish AI)**: Personalized Vedic astrology readings powered by Gemini 3 Flash.
- **Secure Authentication**: Devotee and Vendor specific login flows with OTP-based password recovery.
- **Vendor Dashboard**: Specialized interface for temple administrators and spiritual product vendors.
- **Admin Panel**: Comprehensive management of services, orders, and users.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, MySQL (via `mysql2`).
- **Database**: Firestore (for real-time updates) and MySQL (for structured data).
- **AI**: Google Gemini API (`@google/genai`).
- **Auth**: Firebase Authentication.

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vikapandeya/divine-connect.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file based on `.env.example` and add your keys:
   - `GEMINI_API_KEY`
   - `GOOGLE_MAPS_PLATFORM_KEY`
   - Firebase configuration details.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📜 License

This project is licensed under the MIT License.

---
Built with ❤️ by [Gautam Pince](https://github.com/GautamPince)
