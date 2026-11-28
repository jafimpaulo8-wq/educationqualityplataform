import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  doc, 
  getDocFromServer,
  Firestore 
} from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import firebaseConfig from '../../firebase-applet-config.json';

const rawEmulatorFlag =
  (import.meta as any).env?.VITE_USE_FIREBASE_EMULATOR ??
  (typeof process !== 'undefined' ? process.env?.VITE_USE_FIREBASE_EMULATOR : undefined);

export const isFirebaseEmulatorMode =
  import.meta.env.DEV && String(rawEmulatorFlag || '').toLowerCase() === 'true';

const emulatorProjectId =
  String((import.meta as any).env?.VITE_FIREBASE_EMULATOR_PROJECT_ID || 'demo-sigar-test').trim() ||
  'demo-sigar-test';

if (isFirebaseEmulatorMode && emulatorProjectId === 'siverc-94da3') {
  throw new Error(
    '[Firebase Emulator Guard] Abortado: o modo Emulator não pode utilizar o projectId remoto siverc-94da3.'
  );
}

const effectiveFirebaseConfig: FirebaseOptions = isFirebaseEmulatorMode
  ? {
      ...firebaseConfig,
      projectId: emulatorProjectId,
      authDomain: '127.0.0.1'
    }
  : firebaseConfig;

// Initialize Firebase App (siverc-94da3 in normal mode; isolated demo project in emulator mode)
export const app = !getApps().length ? initializeApp(effectiveFirebaseConfig) : getApp();

// Initialize Firestore
const targetDbId = firebaseConfig.firestoreDatabaseId;
export const db: Firestore =
  !isFirebaseEmulatorMode && targetDbId && targetDbId !== '(default)' && targetDbId.trim() !== ''
    ? getFirestore(app, targetDbId)
    : getFirestore(app);

export { firebaseConfig, effectiveFirebaseConfig };

// Auth & Cloud Functions
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const functions = getFunctions(app);

const globalEmulatorState = globalThis as typeof globalThis & {
  __SIGAR_EMULATORS_CONNECTED__?: boolean;
};

if (isFirebaseEmulatorMode && !globalEmulatorState.__SIGAR_EMULATORS_CONNECTED__) {
  const authHostPort = String(
    (import.meta as any).env?.VITE_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099'
  ).trim();
  const firestoreHostPort = String(
    (import.meta as any).env?.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'
  ).trim();
  const functionsHostPort = String(
    (import.meta as any).env?.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001'
  ).trim();

  const [fsHost, fsPortRaw] = firestoreHostPort.split(':');
  const fsPort = Number(fsPortRaw || 8080);
  const [fnHost, fnPortRaw] = functionsHostPort.split(':');
  const fnPort = Number(fnPortRaw || 5001);

  connectAuthEmulator(auth, `http://${authHostPort}`, { disableWarnings: true });
  connectFirestoreEmulator(db, fsHost || '127.0.0.1', Number.isFinite(fsPort) ? fsPort : 8080);
  connectFunctionsEmulator(functions, fnHost || '127.0.0.1', Number.isFinite(fnPort) ? fnPort : 5001);
  globalEmulatorState.__SIGAR_EMULATORS_CONNECTED__ = true;
}

// Operation Types for error logging
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection Helper
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
    return false;
  }
}

// Auth Helper Functions
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}
