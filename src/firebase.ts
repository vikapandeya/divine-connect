import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
// Initialize messaging safely
let messaging: any = null;
if (typeof window !== 'undefined') {
  try {
    // Only attempt to get messaging if supported and we're not in an iframe (optional but safer)
    messaging = getMessaging(app);
  } catch (e) {
    console.warn('Firebase Messaging not supported or could not be initialized:', e);
  }
}
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { db };

export let firebaseInitError: Error | null = null;

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'devotee' | 'vendor' | 'admin';
  fcmToken?: string;
  createdAt?: any;
}

// Auth state management
type AuthCallback = (user: User | null) => void;
const listeners = new Set<AuthCallback>();

// Single listener for firebase auth state
firebaseOnAuthStateChanged(firebaseAuth, async (firebaseUser) => {
  if (firebaseUser) {
    // Fetch user data from Firestore to get the role
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let user: User;
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userData.displayName || firebaseUser.displayName || '',
          photoURL: userData.photoURL || firebaseUser.photoURL || '',
          role: userData.role || 'devotee',
        };
      } else {
        // Handle case where user exists in Auth but not in Firestore (e.g. initial sign in)
        user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          role: 'devotee',
        };
      }
      auth.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      notifyListeners(user);
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      // Fallback to basic user info if Firestore fails
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        role: 'devotee',
      };
      auth.currentUser = user;
      notifyListeners(user);
    }
  } else {
    auth.currentUser = null;
    localStorage.removeItem('user');
    notifyListeners(null);
  }
});

export const auth = {
  currentUser: ((): User | null => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser) as User;
      } catch (e) {
        return null;
      }
    }
    return null;
  })(),
  onAuthStateChanged: (callback: AuthCallback) => {
    listeners.add(callback);
    
    // Provide current value immediately
    callback(auth.currentUser);

    return () => {
      listeners.delete(callback);
    };
  }
};

const notifyListeners = (user: User | null) => {
  auth.currentUser = user;
  listeners.forEach(callback => callback(user));
};

export const signInWithGoogle = async (role: string = 'devotee') => {
  return signInWithSocial(googleProvider, role);
};

export const signInWithFacebook = async (role: string = 'devotee') => {
  return signInWithSocial(facebookProvider, role);
};

const signInWithSocial = async (provider: GoogleAuthProvider | FacebookAuthProvider, role: string = 'devotee') => {
  try {
    const result = await signInWithPopup(firebaseAuth, provider);
    const firebaseUser = result.user;
    
    // Sync with backend instead of direct Firestore
    const response = await fetch('/api/auth/social-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: userRole
      })
    });
    
    const syncData = await response.json();
    if (!syncData.success) throw new Error(syncData.error || 'Sync failed');

    const user: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      role: syncData.role || 'devotee',
    };

    localStorage.setItem('user', JSON.stringify(user));
    notifyListeners(user);
    return user;
  } catch (error) {
    console.error('Social Sign-In Error:', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string, role: string = 'devotee') => {
  // For this demo, we'll still use the backend for email/pass registration if it's custom
  // But we should ideally use Firebase Auth directly.
  // Given the current setup, let's stick to the API but the API will now use Firestore.
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass, displayName: name, role })
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Registration failed');
  
  const user: User = { uid: data.uid, email, displayName: name, role: role as any };
  localStorage.setItem('user', JSON.stringify(user));
  notifyListeners(user);
  return user;
};

export const loginWithEmail = async (email: string, pass: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.message || 'Login failed');
  
  const user = data.user;
  localStorage.setItem('user', JSON.stringify(user));
  notifyListeners(user);
  return user;
};

export const logout = async () => {
  await firebaseAuth.signOut();
  localStorage.removeItem('user');
  notifyListeners(null);
  window.location.href = '/';
};

export const requestNotificationPermission = async () => {
  if (!messaging || typeof Notification === 'undefined') {
    console.log('Notifications not supported in this environment');
    return;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FCM_VAPID_KEY
      });
      
      if (token && auth.currentUser) {
        // Update user document with the token via API
        await fetch('/api/users/register-fcm-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: auth.currentUser.uid, token })
        });
        
        // Update local state
        const updatedUser = { ...auth.currentUser, fcmToken: token };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        notifyListeners(updatedUser);
        
        return token;
      }
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    if (!messaging) {
      reject(new Error('Messaging not initialized'));
      return;
    }
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: firebaseAuth.currentUser?.uid,
      email: firebaseAuth.currentUser?.email,
      emailVerified: firebaseAuth.currentUser?.emailVerified,
      isAnonymous: firebaseAuth.currentUser?.isAnonymous,
      tenantId: firebaseAuth.currentUser?.tenantId,
      providerInfo: firebaseAuth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    }
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
