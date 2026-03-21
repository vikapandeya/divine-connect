import { auth } from '../firebase';
import { apiUrl } from './api-base';

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});

  if (!headers.has('Authorization')) {
    try {
      const currentUser = auth?.currentUser;

      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        headers.set('Authorization', `Bearer ${idToken}`);
      }
    } catch (error) {
      console.warn('Unable to attach auth token to API request:', error);
    }
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(apiUrl(path), {
    ...init,
    headers,
  });
}

export function getApiConnectionHelp(feature: 'astrology' | 'support') {
  const featureLabel = feature === 'astrology' ? 'AI Astrology' : 'AI Support';

  return `${featureLabel} is unavailable right now. Deploy the Firebase "api" function and set the GEMINI_API_KEY secret to enable it.`;
}
