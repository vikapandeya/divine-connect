import { auth } from '../firebase';

export const addToWishlist = async (itemId: string, type: 'product' | 'puja') => {
  const user = auth.currentUser;
  if (!user) return;
  await fetch('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.uid, itemId, type }),
  });
};

export const removeFromWishlist = async (itemId: string, type: 'product' | 'puja') => {
  const user = auth.currentUser;
  if (!user) return;
  await fetch(`/api/wishlist/${user.uid}/${itemId}?type=${type}`, { method: 'DELETE' });
};

export const isInWishlist = async (itemId: string, type: 'product' | 'puja'): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;
  try {
    const res = await fetch(`/api/wishlist/${user.uid}/${itemId}/check?type=${type}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.inWishlist === true;
  } catch {
    return false;
  }
};
