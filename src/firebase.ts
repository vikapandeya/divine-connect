import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export let firebaseInitError: Error | null = null;

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'devotee' | 'vendor' | 'admin';
}

// Auth state management
type AuthCallback = (user: User | null) => void;
const listeners = new Set<AuthCallback>();

export const auth = {
  currentUser: null as User | null,
  onAuthStateChanged: (callback: AuthCallback) => {
    listeners.add(callback);
    
    // Check local storage first for immediate UI response
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      auth.currentUser = user;
      callback(user);
    } else {
      callback(null);
    }

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
  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const firebaseUser = result.user;
    
    // Sync with MySQL backend
    const response = await fetch('/api/auth/google-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        uid: firebaseUser.uid,
        role
      })
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Google Sync failed');
    
    const user = data.user;
    localStorage.setItem('user', JSON.stringify(user));
    notifyListeners(user);
    return user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string, role: string = 'devotee') => {
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
  localStorage.removeItem('user');
  notifyListeners(null);
  window.location.href = '/';
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, _operationType: OperationType, _path: string | null) {
  console.error('Database Error: ', error);
  throw error;
}
