const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// Local files — used only for page hero backgrounds
export const spiritualImageLibrary = {
  mandir: {
    src: `${base}/assets/spiritual/mandir.jpg`,
    alt: 'Hindu temple mandir spiritual image',
  },
  prasad: {
    src: `${base}/assets/spiritual/prasad.jpg`,
    alt: 'Traditional Indian prasad thali spiritual image',
  },
  aarti: {
    src: `${base}/assets/spiritual/aarti.jpg`,
    alt: 'Hindu priest performing aarti spiritual image',
  },
  meditation: {
    src: `${base}/assets/spiritual/meditation.jpg`,
    alt: 'Meditation in temple with divine spiritual aura image',
  },
  pooja: {
    src: `${base}/assets/spiritual/pooja.jpg`,
    alt: 'Pooja samagri setup spiritual image',
  },
} as const;

export type SpiritualImageKey = keyof typeof spiritualImageLibrary;

export function getSpiritualImage(key: SpiritualImageKey) {
  return spiritualImageLibrary[key];
}

// ─── SVG-based product illustrations ─────────────────────────────────────────
// These replace local JPG files which had unrelated content.

function enc(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function prasadSvg(label: string): string {
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <radialGradient id="g" cx="50%" cy="40%" r="72%">
    <stop offset="0%" stop-color="#fed7aa"/>
    <stop offset="100%" stop-color="#9a3412"/>
  </radialGradient>
</defs>
<rect width="400" height="400" rx="0" fill="url(#g)"/>
<circle cx="350" cy="50" r="90" fill="rgba(255,255,255,0.1)"/>
<circle cx="50" cy="360" r="110" fill="rgba(255,255,255,0.07)"/>
<circle cx="200" cy="195" r="130" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
<circle cx="200" cy="195" r="98" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
<circle cx="200" cy="100" r="11" fill="#fbbf24"/>
<circle cx="229" cy="108" r="9" fill="#f97316"/>
<circle cx="171" cy="108" r="9" fill="#f97316"/>
<circle cx="253" cy="127" r="8" fill="#fde68a"/>
<circle cx="147" cy="127" r="8" fill="#fde68a"/>
<circle cx="267" cy="155" r="7" fill="#fb923c"/>
<circle cx="133" cy="155" r="7" fill="#fb923c"/>
<text x="200" y="220" text-anchor="middle" font-size="90" font-family="Georgia,serif" fill="rgba(255,255,255,0.92)">ॐ</text>
<text x="200" y="305" text-anchor="middle" font-size="16" font-family="Arial,sans-serif" fill="rgba(255,255,255,0.75)" letter-spacing="5">${label.toUpperCase()}</text>
<rect x="30" y="30" width="340" height="340" rx="28" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
</svg>`);
}

function malaSvg(label: string): string {
  // 18 bead positions at radius 100, centre 200,200
  const beads = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * 2 * Math.PI;
    const x = (200 + 100 * Math.cos(a)).toFixed(1);
    const y = (200 + 100 * Math.sin(a)).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="11" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5"/>`;
  }).join('');

  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <radialGradient id="g" cx="50%" cy="35%" r="68%">
    <stop offset="0%" stop-color="#0d9488"/>
    <stop offset="100%" stop-color="#022c22"/>
  </radialGradient>
</defs>
<rect width="400" height="400" fill="url(#g)"/>
<circle cx="340" cy="60" r="80" fill="rgba(255,255,255,0.08)"/>
<circle cx="60" cy="340" r="100" fill="rgba(255,255,255,0.06)"/>
<circle cx="200" cy="200" r="110" fill="none" stroke="rgba(45,212,191,0.25)" stroke-width="2"/>
${beads}
<text x="200" y="220" text-anchor="middle" font-size="80" font-family="Georgia,serif" fill="rgba(255,255,255,0.9)">ॐ</text>
<text x="200" y="305" text-anchor="middle" font-size="16" font-family="Arial,sans-serif" fill="rgba(255,255,255,0.7)" letter-spacing="5">${label.toUpperCase()}</text>
<rect x="30" y="30" width="340" height="340" rx="28" fill="none" stroke="rgba(45,212,191,0.28)" stroke-width="1.5"/>
</svg>`);
}

function pujaEssentialsSvg(label: string): string {
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <radialGradient id="g" cx="50%" cy="35%" r="72%">
    <stop offset="0%" stop-color="#fda4af"/>
    <stop offset="100%" stop-color="#7f1d1d"/>
  </radialGradient>
</defs>
<rect width="400" height="400" fill="url(#g)"/>
<circle cx="340" cy="55" r="85" fill="rgba(255,255,255,0.1)"/>
<circle cx="55" cy="350" r="110" fill="rgba(255,255,255,0.07)"/>
<!-- Thali circle -->
<ellipse cx="200" cy="220" rx="120" ry="18" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
<ellipse cx="200" cy="220" rx="90" ry="12" fill="rgba(255,255,255,0.08)"/>
<!-- Diya flame -->
<ellipse cx="200" cy="150" rx="22" ry="32" fill="#fbbf24" opacity="0.95"/>
<ellipse cx="200" cy="168" rx="14" ry="18" fill="#f97316"/>
<ellipse cx="200" cy="178" rx="8" ry="10" fill="#fff7ed" opacity="0.85"/>
<!-- Diya base -->
<ellipse cx="200" cy="202" rx="30" ry="10" fill="#92400e"/>
<ellipse cx="200" cy="198" rx="28" ry="8" fill="#b45309"/>
<text x="200" y="310" text-anchor="middle" font-size="16" font-family="Arial,sans-serif" fill="rgba(255,255,255,0.75)" letter-spacing="4">${label.toUpperCase()}</text>
<rect x="30" y="30" width="340" height="340" rx="28" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
</svg>`);
}

function idolSvg(label: string): string {
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#fcd34d"/>
    <stop offset="50%" stop-color="#d97706"/>
    <stop offset="100%" stop-color="#78350f"/>
  </linearGradient>
</defs>
<rect width="400" height="400" fill="url(#g)"/>
<circle cx="330" cy="70" r="80" fill="rgba(255,255,255,0.12)"/>
<circle cx="70" cy="340" r="100" fill="rgba(255,255,255,0.08)"/>
<!-- Temple silhouette -->
<rect x="155" y="290" width="90" height="60" fill="rgba(255,255,255,0.2)"/>
<rect x="140" y="265" width="120" height="30" fill="rgba(255,255,255,0.25)"/>
<rect x="125" y="245" width="150" height="25" fill="rgba(255,255,255,0.3)"/>
<!-- Shikhara tiers -->
<polygon points="200,80 150,240 250,240" fill="rgba(255,255,255,0.28)"/>
<polygon points="200,100 160,230 240,230" fill="rgba(255,255,255,0.15)"/>
<!-- Kalash on top -->
<circle cx="200" cy="78" r="14" fill="rgba(255,255,255,0.45)"/>
<text x="200" y="340" text-anchor="middle" font-size="15" font-family="Arial,sans-serif" fill="rgba(255,255,255,0.8)" letter-spacing="4">${label.toUpperCase()}</text>
<rect x="30" y="30" width="340" height="340" rx="28" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
</svg>`);
}

function incenseSvg(label: string): string {
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <linearGradient id="g" x1="0%" y1="0%" x2="60%" y2="100%">
    <stop offset="0%" stop-color="#818cf8"/>
    <stop offset="100%" stop-color="#1e1b4b"/>
  </linearGradient>
</defs>
<rect width="400" height="400" fill="url(#g)"/>
<circle cx="320" cy="80" r="75" fill="rgba(255,255,255,0.09)"/>
<!-- Incense sticks -->
<line x1="180" y1="320" x2="180" y2="60" stroke="#a5b4fc" stroke-width="3" stroke-linecap="round"/>
<line x1="200" y1="320" x2="200" y2="50" stroke="#c7d2fe" stroke-width="3" stroke-linecap="round"/>
<line x1="220" y1="320" x2="220" y2="65" stroke="#a5b4fc" stroke-width="3" stroke-linecap="round"/>
<!-- Glow tips -->
<circle cx="180" cy="60" r="5" fill="#fbbf24"/>
<circle cx="200" cy="50" r="5" fill="#fcd34d"/>
<circle cx="220" cy="65" r="5" fill="#fbbf24"/>
<!-- Smoke curls -->
<path d="M180,55 C170,35 190,20 178,5" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M200,45 C188,25 208,10 196,-5" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M220,60 C210,40 228,25 216,10" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round"/>
<!-- Holder -->
<rect x="155" y="315" width="90" height="10" rx="5" fill="#4f46e5"/>
<text x="200" y="365" text-anchor="middle" font-size="15" font-family="Arial,sans-serif" fill="rgba(255,255,255,0.7)" letter-spacing="5">${label.toUpperCase()}</text>
<rect x="30" y="30" width="340" height="340" rx="28" fill="none" stroke="rgba(129,140,248,0.3)" stroke-width="1.5"/>
</svg>`);
}

function bookSvg(label: string): string {
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#60a5fa"/>
    <stop offset="100%" stop-color="#1e3a5f"/>
  </linearGradient>
</defs>
<rect width="400" height="400" fill="url(#g)"/>
<circle cx="330" cy="70" r="80" fill="rgba(255,255,255,0.1)"/>
<!-- Book shape -->
<rect x="100" y="110" width="200" height="200" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
<rect x="100" y="110" width="200" height="200" rx="8" fill="rgba(255,255,255,0.05)"/>
<!-- Spine -->
<rect x="100" y="110" width="14" height="200" rx="4" fill="rgba(255,255,255,0.25)"/>
<!-- Pages hint -->
<line x1="115" y1="135" x2="285" y2="135" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
<line x1="115" y1="160" x2="285" y2="160" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
<line x1="115" y1="185" x2="285" y2="185" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
<!-- Om on cover -->
<text x="200" y="240" text-anchor="middle" font-size="80" font-family="Georgia,serif" fill="rgba(255,255,255,0.85)">ॐ</text>
<text x="200" y="345" text-anchor="middle" font-size="15" font-family="Arial,sans-serif" fill="rgba(255,255,255,0.7)" letter-spacing="4">${label.toUpperCase()}</text>
<rect x="30" y="30" width="340" height="340" rx="28" fill="none" stroke="rgba(96,165,250,0.3)" stroke-width="1.5"/>
</svg>`);
}

function yantraSvg(label: string): string {
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <radialGradient id="g" cx="50%" cy="40%" r="70%">
    <stop offset="0%" stop-color="#c026d3"/>
    <stop offset="100%" stop-color="#2e1065"/>
  </radialGradient>
</defs>
<rect width="400" height="400" fill="url(#g)"/>
<!-- Outer circle -->
<circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
<!-- Lotus petals (8 triangles) -->
<circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
<!-- Upward triangle -->
<polygon points="200,80 120,300 280,300" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
<!-- Downward triangle -->
<polygon points="200,320 120,100 280,100" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
<!-- Inner circles -->
<circle cx="200" cy="200" r="70" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
<circle cx="200" cy="200" r="40" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
<!-- Central point -->
<circle cx="200" cy="200" r="6" fill="rgba(255,255,255,0.9)"/>
<text x="200" y="370" text-anchor="middle" font-size="14" font-family="Arial,sans-serif" fill="rgba(255,255,255,0.7)" letter-spacing="5">${label.toUpperCase()}</text>
<rect x="30" y="30" width="340" height="340" rx="28" fill="none" stroke="rgba(192,38,211,0.35)" stroke-width="1.5"/>
</svg>`);
}

function genericSvg(category: string, label: string): string {
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <radialGradient id="g" cx="50%" cy="40%" r="70%">
    <stop offset="0%" stop-color="#d4a574"/>
    <stop offset="100%" stop-color="#4a2c17"/>
  </radialGradient>
</defs>
<rect width="400" height="400" fill="url(#g)"/>
<circle cx="330" cy="70" r="80" fill="rgba(255,255,255,0.1)"/>
<circle cx="70" cy="340" r="100" fill="rgba(255,255,255,0.07)"/>
<circle cx="200" cy="195" r="110" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
<text x="200" y="220" text-anchor="middle" font-size="90" font-family="Georgia,serif" fill="rgba(255,255,255,0.88)">ॐ</text>
<text x="200" y="305" text-anchor="middle" font-size="16" font-family="Arial,sans-serif" fill="rgba(255,255,255,0.72)" letter-spacing="4">${label.toUpperCase()}</text>
<rect x="30" y="30" width="340" height="340" rx="28" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
</svg>`);
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export function getProductSpiritualImage(category: string, name = '') {
  const cat = category.toLowerCase();
  const shortLabel = name.length > 22 ? name.slice(0, 22) + '…' : name || category;

  let svgSrc: string;
  if (cat.includes('prasad')) {
    svgSrc = prasadSvg(shortLabel);
  } else if (cat.includes('mala')) {
    svgSrc = malaSvg(shortLabel);
  } else if (cat.includes('puja') || cat.includes('essential')) {
    svgSrc = pujaEssentialsSvg(shortLabel);
  } else if (cat.includes('idol') || cat.includes('murti')) {
    svgSrc = idolSvg(shortLabel);
  } else if (cat.includes('incense')) {
    svgSrc = incenseSvg(shortLabel);
  } else if (cat.includes('book')) {
    svgSrc = bookSvg(shortLabel);
  } else if (cat.includes('yantra')) {
    svgSrc = yantraSvg(shortLabel);
  } else {
    svgSrc = genericSvg(category, shortLabel);
  }

  return { src: svgSrc, alt: `${name || category} spiritual product illustration` };
}

export function getPujaSpiritualImage(title = '') {
  const t = title.toLowerCase();
  if (t.includes('satyanarayan') || t.includes('ganesh')) return spiritualImageLibrary.aarti;
  if (t.includes('mrityunjaya')) return spiritualImageLibrary.meditation;
  return spiritualImageLibrary.pooja;
}

export function getReviewSpiritualImage(productId = '') {
  const id = productId.toLowerCase();
  if (id.includes('prasad')) return spiritualImageLibrary.prasad;
  if (id.includes('mala')) return spiritualImageLibrary.meditation;
  return spiritualImageLibrary.pooja;
}
