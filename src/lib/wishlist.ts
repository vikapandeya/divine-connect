import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export const addToWishlist = async (itemId: string, type: 'product' | 'puja') => {
  if (!auth.currentUser) return;

  const wishlistRef = collection(db, 'wishlist');
  const q = query(wishlistRef, 
    where('userId', '==', auth.currentUser.uid), 
    where('itemId', '==', itemId),
    where('type', '==', type)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    await addDoc(wishlistRef, {
      userId: auth.currentUser.uid,
      itemId,
      type,
      createdAt: serverTimestamp()
    });
  }
};

export const removeFromWishlist = async (itemId: string, type: 'product' | 'puja') => {
  if (!auth.currentUser) return;

  const wishlistRef = collection(db, 'wishlist');
  const q = query(wishlistRef, 
    where('userId', '==', auth.currentUser.uid), 
    where('itemId', '==', itemId),
    where('type', '==', type)
  );

  const snapshot = await getDocs(q);
  snapshot.forEach(async (document) => {
    await deleteDoc(doc(db, 'wishlist', document.id));
  });
};

export const isInWishlist = async (itemId: string, type: 'product' | 'puja') => {
  if (!auth.currentUser) return false;

  const wishlistRef = collection(db, 'wishlist');
  const q = query(wishlistRef, 
    where('userId', '==', auth.currentUser.uid), 
    where('itemId', '==', itemId),
    where('type', '==', type)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
