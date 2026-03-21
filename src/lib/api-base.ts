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
