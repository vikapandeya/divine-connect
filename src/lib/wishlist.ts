import { auth } from '../firebase';

const KEY = 'wishlist';

type WishItem = { userId: string; itemId: string; type: string };

function load(): WishItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(items: WishItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export const addToWishlist = async (itemId: string, type: 'product' | 'puja') => {
  if (!auth.currentUser) return;
  const items = load();
  if (!items.some(i => i.userId === auth.currentUser!.uid && i.itemId === itemId && i.type === type)) {
    items.push({ userId: auth.currentUser.uid, itemId, type });
    save(items);
  }
};

export const removeFromWishlist = async (itemId: string, type: 'product' | 'puja') => {
  if (!auth.currentUser) return;
  save(load().filter(i => !(i.userId === auth.currentUser!.uid && i.itemId === itemId && i.type === type)));
};

export const isInWishlist = async (itemId: string, type: 'product' | 'puja'): Promise<boolean> => {
  if (!auth.currentUser) return false;
  return load().some(i => i.userId === auth.currentUser!.uid && i.itemId === itemId && i.type === type);
};

export const getWishlistItems = (userId: string) =>
  load().filter(i => i.userId === userId);
