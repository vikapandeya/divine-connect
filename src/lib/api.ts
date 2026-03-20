const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}

export function getApiConnectionHelp(feature: 'astrology' | 'support') {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io') && !apiBaseUrl) {
    const featureLabel = feature === 'astrology' ? 'AI Astrology' : 'AI Support';
    return `${featureLabel} needs a deployed backend service. Add VITE_API_BASE_URL to your frontend build so it can reach the live API.`;
  }

  return feature === 'astrology'
    ? 'The astrology service is temporarily unavailable. Please try again later.'
    : 'AI support is temporarily unavailable. Please try again later.';
}
