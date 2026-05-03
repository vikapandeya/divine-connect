import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndianRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Enhanced fetch wrapper that automatically handles:
 * 1. Base URL (optional)
 * 2. JWT Injection from localStorage
 * 3. Default JSON headers
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('jwt_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, you might want to redirect to login or clear token
  if (response.status === 401) {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
  }

  return response;
}
