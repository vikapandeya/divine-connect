import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndianRupees(amount: number) {
  return new Intl.NumberFormat('en-IN').format(amount);
}

export function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const productCategoryGradients: Record<string, [string, string]> = {
  Prasad: ['#f97316', '#fdba74'],
  Idols: ['#9a3412', '#f59e0b'],
  Incense: ['#475569', '#94a3b8'],
  Mala: ['#0f766e', '#5eead4'],
  Books: ['#1d4ed8', '#93c5fd'],
  Yantras: ['#7c3aed', '#c4b5fd'],
  'Puja Essentials': ['#be123c', '#fda4af'],
};

function getProductGradient(category: string) {
  return productCategoryGradients[category] || ['#1f2937', '#a8a29e'];
}

export function getProductPlaceholderImage(
  name: string,
  category: string,
  detail?: string,
) {
  const [start, end] = getProductGradient(category);
  const safeName = name.replace(/[&<>]/g, '');
  const safeCategory = category.replace(/[&<>]/g, '');
  const safeDetail = (detail || 'DivineConnect Demo').replace(/[&<>]/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" rx="48" fill="url(#bg)" />
      <circle cx="640" cy="160" r="120" fill="rgba(255,255,255,0.14)" />
      <circle cx="150" cy="650" r="150" fill="rgba(255,255,255,0.1)" />
      <rect x="72" y="88" width="656" height="624" rx="36" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" />
      <text x="110" y="170" fill="white" font-size="28" font-family="Georgia, serif" opacity="0.92" letter-spacing="6">DIVINECONNECT</text>
      <text x="110" y="260" fill="white" font-size="34" font-family="Arial, sans-serif" font-weight="700" opacity="0.95">${safeCategory.toUpperCase()}</text>
      <text x="110" y="360" fill="white" font-size="52" font-family="Georgia, serif" font-weight="700">${safeName}</text>
      <text x="110" y="430" fill="white" font-size="26" font-family="Arial, sans-serif" opacity="0.9">${safeDetail}</text>
      <text x="110" y="620" fill="white" font-size="24" font-family="Arial, sans-serif" opacity="0.82">Preview image unavailable</text>
      <text x="110" y="660" fill="white" font-size="24" font-family="Arial, sans-serif" opacity="0.82">Showing branded product placeholder</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getYatraPlaceholderImage(
  title: string,
  packageType: string,
  detail?: string,
) {
  const safeTitle = title.replace(/[&<>]/g, '');
  const safeType = packageType.replace(/[&<>]/g, '');
  const safeDetail = (detail || 'Sacred pilgrimage package').replace(/[&<>]/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900">
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2b211c" />
          <stop offset="45%" stop-color="#8b5e34" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="1400" height="900" fill="url(#sky)" />
      <path d="M0 620 C180 500, 300 520, 460 420 C620 320, 790 360, 980 270 C1130 200, 1260 250, 1400 180 L1400 900 L0 900 Z" fill="rgba(255,255,255,0.12)" />
      <path d="M0 720 C210 610, 380 650, 560 560 C760 460, 980 520, 1400 360 L1400 900 L0 900 Z" fill="rgba(255,255,255,0.18)" />
      <rect x="84" y="84" width="1232" height="732" rx="42" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.28)" />
      <text x="140" y="170" fill="white" font-size="34" font-family="Arial, sans-serif" letter-spacing="8" opacity="0.92">DIVINECONNECT YATRA</text>
      <text x="140" y="280" fill="white" font-size="32" font-family="Arial, sans-serif" font-weight="700" opacity="0.9">${safeType.toUpperCase()}</text>
      <text x="140" y="390" fill="white" font-size="64" font-family="Georgia, serif" font-weight="700">${safeTitle}</text>
      <text x="140" y="470" fill="white" font-size="30" font-family="Arial, sans-serif" opacity="0.9">${safeDetail}</text>
      <text x="140" y="690" fill="white" font-size="28" font-family="Arial, sans-serif" opacity="0.85">Scenic image unavailable</text>
      <text x="140" y="736" fill="white" font-size="28" font-family="Arial, sans-serif" opacity="0.85">Showing pilgrimage placeholder</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
