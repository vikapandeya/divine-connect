import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type Auth,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let firebaseInitError: Error | null = null;
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let authRedirectInitPromise: Promise<void> | null = null;

const AUTH_SETUP_HOSTS = ['vikapandeya.github.io', 'localhost'];
const AUTH_PENDING_ROLE_KEY = 'divine-connect-auth-role';

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  firebaseInitError = error instanceof Error ? error : new Error(String(error));
  console.error('Firebase initialization failed:', firebaseInitError);
}

export { app, db, auth, googleProvider, firebaseInitError, authRedirectInitPromise };

async function syncUserProfile({
  uid,
  displayName,
  email,
  photoURL,
  role,
}: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: string;
}) {
  if (!db) {
    throw new Error('Firestore is unavailable. Please verify your Firebase config.');
  }

  const userRef = doc(db, 'users', uid);
  const existingSnapshot = await getDoc(userRef);
  const existingData = existingSnapshot.exists() ? existingSnapshot.data() : {};
  const resolvedRole =
    existingData.role ||
    (email === 'pg2331427@gmail.com' && auth?.currentUser?.emailVerified ? 'admin' : null) ||
    (role === 'vendor' ? 'vendor' : 'devotee');

  await setDoc(
    userRef,
    {
      uid,
      displayName: displayName || existingData.displayName || '',
      email: email || existingData.email || '',
      photoURL: photoURL || existingData.photoURL || '',
      role: resolvedRole,
      phoneNumber: existingData.phoneNumber || '',
      addresses: existingData.addresses || [],
      createdAt: existingData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

function requireAuth(): Auth {
  if (!auth) {
    throw new Error(
      firebaseInitError?.message || 'Firebase authentication is unavailable. Please verify your Firebase config.',
    );
  }
  return auth;
}

function getAuthSetupMessage(providerName: string) {
  return `${providerName} is not enabled in Firebase Authentication for this project. Enable the provider and add ${AUTH_SETUP_HOSTS.join(' and ')} to Authorized domains.`;
}

function mapAuthErrorMessage(error: unknown, providerName = 'Authentication') {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  const hostName =
    typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : AUTH_SETUP_HOSTS[0];

  switch (code) {
    case 'auth/operation-not-allowed':
      return getAuthSetupMessage(providerName);
    case 'auth/unauthorized-domain':
    case 'auth/auth-domain-config-required':
      return `This site domain is not authorized for Firebase sign-in. Add ${hostName} in Firebase Authentication > Settings > Authorized domains.`;
    case 'auth/popup-blocked':
      return 'The Google popup was blocked by the browser. Redirect sign-in will be used instead.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in popup was closed before finishing. Please try again.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please check your credentials and try again.';
    case 'auth/user-not-found':
      return 'No account exists for this email address yet.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network error while contacting Firebase. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts were made. Please wait a moment and try again.';
    default:
      return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
  }
}

function toFriendlyAuthError(error: unknown, providerName?: string) {
  const friendlyMessage = mapAuthErrorMessage(error, providerName);
  const friendlyError = new Error(friendlyMessage) as Error & { cause?: unknown };
  friendlyError.cause = error;
  return friendlyError;
}

if (auth) {
  authRedirectInitPromise = getRedirectResult(auth)
    .then(async (result) => {
      if (!result?.user) {
        return;
      }

      const storedRole =
        typeof window !== 'undefined'
          ? window.sessionStorage.getItem(AUTH_PENDING_ROLE_KEY)
          : null;

      await syncUserProfile({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        role: storedRole === 'vendor' ? 'vendor' : 'devotee',
      });

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(AUTH_PENDING_ROLE_KEY);
      }
    })
    .catch((error) => {
      console.error('Firebase redirect sign-in failed:', error);
    });
}

export const signInWithGoogle = async (role: string = 'devotee') => {
  try {
    const authInstance = requireAuth();
    if (!googleProvider) {
      throw new Error('Google sign-in is unavailable. Firebase failed to initialize.');
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(AUTH_PENDING_ROLE_KEY, role);
    }

    const result = await signInWithPopup(authInstance, googleProvider);
    const user = result.user;

    await syncUserProfile({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role,
    });

    return user;
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      const authInstance = requireAuth();
      if (!googleProvider) {
        throw toFriendlyAuthError(error, 'Google sign-in');
      }

      await signInWithRedirect(authInstance, googleProvider);
      return null;
    }

    console.error('Error signing in with Google:', error);
    throw toFriendlyAuthError(error, 'Google sign-in');
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string, role: string = 'devotee') => {
  try {
    const authInstance = requireAuth();
    const result = await createUserWithEmailAndPassword(authInstance, email, pass);
    await updateProfile(result.user, { displayName: name });

    await syncUserProfile({
      uid: result.user.uid,
      displayName: name,
      email,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      role,
    });
    
    return result.user;
  } catch (error) {
    throw toFriendlyAuthError(error, 'Email/password sign-up');
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const authInstance = requireAuth();
    const result = await signInWithEmailAndPassword(authInstance, email, pass);
    return result.user;
  } catch (error) {
    throw toFriendlyAuthError(error, 'Email/password sign-in');
  }
};

export const sendResetPasswordEmail = async (email: string) => {
  try {
    const authInstance = requireAuth();
    await sendPasswordResetEmail(authInstance, email);
  } catch (error) {
    throw toFriendlyAuthError(error, 'Password reset');
  }
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
