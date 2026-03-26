export const spiritualImageLibrary = {
  mandir: {
    src: '/assets/spiritual/mandir.jpg',
    alt: 'Hindu temple mandir spiritual image',
  },
  prasad: {
    src: '/assets/spiritual/prasad.jpg',
    alt: 'Traditional Indian prasad thali spiritual image',
  },
  aarti: {
    src: '/assets/spiritual/aarti.jpg',
    alt: 'Hindu priest performing aarti spiritual image',
  },
  meditation: {
    src: '/assets/spiritual/meditation.jpg',
    alt: 'Meditation in temple with divine spiritual aura image',
  },
  pooja: {
    src: '/assets/spiritual/pooja.jpg',
    alt: 'Pooja samagri setup spiritual image',
  },
} as const;

export type SpiritualImageKey = keyof typeof spiritualImageLibrary;

export function getSpiritualImage(key: SpiritualImageKey) {
  return spiritualImageLibrary[key];
}

export function getProductSpiritualImage(category: string, name = '') {
  const normalizedCategory = category.toLowerCase();
  const normalizedName = name.toLowerCase();

  if (normalizedCategory.includes('prasad')) {
    return spiritualImageLibrary.prasad;
  }

  if (normalizedCategory.includes('puja')) {
    return spiritualImageLibrary.pooja;
  }

  if (normalizedCategory.includes('incense') || normalizedCategory.includes('mala')) {
    return spiritualImageLibrary.meditation;
  }

  if (normalizedCategory.includes('idol') || normalizedCategory.includes('yantra')) {
    return spiritualImageLibrary.mandir;
  }

  if (normalizedCategory.includes('book')) {
    return spiritualImageLibrary.meditation;
  }

  if (normalizedName.includes('diya') || normalizedName.includes('aarti')) {
    return spiritualImageLibrary.aarti;
  }

  return spiritualImageLibrary.pooja;
}

export function getPujaSpiritualImage(title = '') {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('satyanarayan') || normalizedTitle.includes('ganesh')) {
    return spiritualImageLibrary.aarti;
  }

  if (normalizedTitle.includes('mrityunjaya')) {
    return spiritualImageLibrary.meditation;
  }

  if (normalizedTitle.includes('lakshmi')) {
    return spiritualImageLibrary.pooja;
  }

  return spiritualImageLibrary.pooja;
}

export function getReviewSpiritualImage(productId = '') {
  const normalizedProductId = productId.toLowerCase();

  if (normalizedProductId.includes('prasad')) {
    return spiritualImageLibrary.prasad;
  }

  if (normalizedProductId.includes('mala')) {
    return spiritualImageLibrary.meditation;
  }

  return spiritualImageLibrary.pooja;
}
