# PunyaSeva Deployment Guide

This guide outlines the steps for deploying the PunyaSeva application to a production environment.

## Deployment Strategy

PunyaSeva is designed for deployment on Google Cloud Run, leveraging its serverless architecture for scalability and cost-efficiency.

### Prerequisites
- **Google Cloud Project**: Access to a Google Cloud project with billing enabled.
- **Firebase Project**: A Firebase project associated with the Google Cloud project.
- **Stripe Account**: For production payment processing.
- **Gemini API Key**: For AI assistant features in production.

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```
This command compiles the frontend and prepares the production build in the `dist/` directory.

### 2. Set Up Production Environment Variables
In your deployment environment (e.g., Cloud Run), configure the following environment variables:
- `GEMINI_API_KEY`: Your production Gemini API key.
- `STRIPE_SECRET_KEY`: Your production Stripe secret key.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your production Stripe publishable key.
- `VITE_FCM_VAPID_KEY`: Your production FCM VAPID key.
- `NODE_ENV`: Set to `production`.

### 3. Deploy to Cloud Run
PunyaSeva can be deployed to Cloud Run using the `gcloud` CLI or through a CI/CD pipeline.

#### Using `gcloud` CLI:
```bash
gcloud run deploy punyaseva \
  --source . \
  --platform managed \
  --region your_region \
  --allow-unauthenticated
```

### 4. Configure Firebase Security Rules
Deploy the latest security rules to your production Firebase project:
```bash
firebase deploy --only firestore:rules
```

### 5. Update OAuth Redirect URIs
In your Google Cloud Console (APIs & Services > Credentials), add your production App URL and Shared App URL to the authorized redirect URIs for your OAuth 2.0 Client ID.

### 6. Verify Deployment
- Access your production URL.
- Test user login (Google Login).
- Perform a test puja booking and product purchase.
- Verify that feedback is being stored and displayed correctly.
- Test the Veda AI assistant.

## Continuous Integration and Deployment (CI/CD)
It is recommended to set up a CI/CD pipeline (e.g., GitHub Actions) to automate the build and deployment process.

### Example GitHub Actions Workflow:
1. **Trigger**: On push to the `main` branch.
2. **Build**: Run `npm install` and `npm run build`.
3. **Test**: Run unit and integration tests.
4. **Deploy**: Deploy the build to Cloud Run and update Firebase Security Rules.

## Monitoring and Maintenance
- **Google Cloud Logging**: Monitor server logs for errors and performance issues.
- **Firebase Console**: Monitor Firestore usage and Auth activity.
- **Stripe Dashboard**: Monitor payment transactions and potential issues.
- **Gemini API Usage**: Monitor API usage and quotas.

## Scaling
Cloud Run automatically scales the application based on incoming traffic. Monitor the performance and adjust the minimum and maximum instances as needed.
