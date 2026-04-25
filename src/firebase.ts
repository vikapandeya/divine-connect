// Auth via REST API + localStorage — no Firebase SDK

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'devotee' | 'vendor' | 'admin';
  fcmToken?: string;
  createdAt?: any;
}

export const firebaseInitError: Error | null = null;
export const db = null;

type AuthCallback = (user: User | null) => void;
const listeners = new Set<AuthCallback>();

export const auth = {
  currentUser: null as User | null,
  onAuthStateChanged: (callback: AuthCallback) => {
    listeners.add(callback);
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        auth.currentUser = user;
        callback(user);
      } catch (e) {
        callback(null);
      }
    } else {
      callback(null);
    }
    return () => { listeners.delete(callback); };
  }
};

const notifyListeners = (user: User | null) => {
  auth.currentUser = user;
  listeners.forEach(cb => cb(user));
};

export const loginWithEmail = async (email: string, pass: string) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Login failed');
  localStorage.setItem('user', JSON.stringify(data.user));
  notifyListeners(data.user);
  return data.user;
};

export const registerWithEmail = async (email: string, pass: string, name: string, role = 'devotee') => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass, displayName: name, role })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Registration failed');
  const user: User = { uid: data.uid, email, displayName: name, role: role as any };
  localStorage.setItem('user', JSON.stringify(user));
  notifyListeners(user);
  return user;
};

export const signInWithGoogle = async (_role = 'devotee') => {
  throw new Error('Google Sign-In unavailable. Please use email and password.');
};

export const signInWithFacebook = async (_role = 'devotee') => {
  throw new Error('Facebook Sign-In unavailable. Please use email and password.');
};

export const logout = async () => {
  localStorage.removeItem('user');
  auth.currentUser = null;
  notifyListeners(null);
  window.location.href = '/';
};

export const requestNotificationPermission = async () => null;

export const onMessageListener = () => new Promise<never>(() => {});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, op: OperationType, path: string | null) {
  console.error('DB Error:', error, op, path);
  throw error;
}
