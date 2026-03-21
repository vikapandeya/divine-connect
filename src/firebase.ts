import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { apiUrl } from './lib/api';

let firebaseInitError: Error | null = null;
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  firebaseInitError = error instanceof Error ? error : new Error(String(error));
  console.error('Firebase initialization failed:', firebaseInitError);
}

export { app, db, auth, googleProvider, firebaseInitError };

function requireAuth(): Auth {
  if (!auth) {
    throw new Error(
      firebaseInitError?.message || 'Firebase authentication is unavailable. Please verify your Firebase config.',
    );
  }
  return auth;
}

export const signInWithGoogle = async (role: string = 'devotee') => {
  try {
    const authInstance = requireAuth();
    if (!googleProvider) {
      throw new Error('Google sign-in is unavailable. Firebase failed to initialize.');
    }

    const result = await signInWithPopup(authInstance, googleProvider);
    const user = result.user;

    const token = await user.getIdToken();
    await fetch(apiUrl('/api/users'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role
      })
    });

    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string, role: string = 'devotee') => {
  const authInstance = requireAuth();
  const result = await createUserWithEmailAndPassword(authInstance, email, pass);
  await updateProfile(result.user, { displayName: name });

  const token = await result.user.getIdToken();
  await fetch(apiUrl('/api/users'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: result.user.uid,
      displayName: name,
      email: email,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      role
    })
  });
  
  return result.user;
};

export const loginWithEmail = async (email: string, pass: string) => {
  const authInstance = requireAuth();
  const result = await signInWithEmailAndPassword(authInstance, email, pass);
  return result.user;
};

export const sendResetPasswordEmail = async (email: string) => {
  const authInstance = requireAuth();
  await sendPasswordResetEmail(authInstance, email);
};

export const logout = () => signOut(requireAuth());

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
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
