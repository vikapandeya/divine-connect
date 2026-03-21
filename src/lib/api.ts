import firebaseConfig from '../../firebase-applet-config.json';

const functionsRegion = 'asia-south1';
const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '')
  .trim()
  .replace(/\/$/, '');
const defaultFunctionsApiBaseUrl = `https://${functionsRegion}-${firebaseConfig.projectId}.cloudfunctions.net/api`;
const resolvedApiBaseUrl = configuredApiBaseUrl || defaultFunctionsApiBaseUrl;

function normalizeApiPath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (resolvedApiBaseUrl.endsWith('/api')) {
    if (normalizedPath === '/api') {
      return '';
    }

    if (normalizedPath.startsWith('/api/')) {
      return normalizedPath.slice(4);
    }
  }

  return normalizedPath;
}

export function apiUrl(path: string) {
  const normalizedPath = normalizeApiPath(path);
  return resolvedApiBaseUrl ? `${resolvedApiBaseUrl}${normalizedPath}` : normalizedPath;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});

  if (!headers.has('Authorization')) {
    try {
      const firebaseModule = await import('../firebase');
      const currentUser = firebaseModule.auth?.currentUser;

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
