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

function readMetaEnv(key: string): unknown {
  switch (key) {
    case 'VITE_USE_FIREBASE_EMULATORS':
      return (import.meta as any).env?.VITE_USE_FIREBASE_EMULATORS;
    case 'VITE_USE_FIREBASE_EMULATOR':
      return (import.meta as any).env?.VITE_USE_FIREBASE_EMULATOR;
    case 'VITE_FIREBASE_EMULATOR_PROJECT_ID':
      return (import.meta as any).env?.VITE_FIREBASE_EMULATOR_PROJECT_ID;
    case 'VITE_FIREBASE_AUTH_EMULATOR_HOST':
      return (import.meta as any).env?.VITE_FIREBASE_AUTH_EMULATOR_HOST;
    case 'VITE_FIRESTORE_EMULATOR_HOST':
      return (import.meta as any).env?.VITE_FIRESTORE_EMULATOR_HOST;
    case 'VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST':
      return (import.meta as any).env?.VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST;
    default:
      return undefined;
  }
}

function readEnvValue(key: string): string | undefined {
  const metaVal = readMetaEnv(key);
  const procVal = typeof process !== 'undefined' ? process.env?.[key] : undefined;

  if (metaVal !== undefined && procVal !== undefined) {
    const a = String(metaVal).trim();
    const b = String(procVal).trim();
    if (a !== b) {
      throw new Error(
        `[Firebase Emulator Guard] Valores divergentes para ${key} entre import.meta.env ("${a}") e process.env ("${b}").`
      );
    }
    return a;
  }
  if (metaVal !== undefined) return String(metaVal);
  if (procVal !== undefined) return String(procVal);
  return undefined;
}

function parseOptionalBooleanFlag(key: string, raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  throw new Error(
    `[Firebase Emulator Guard] Valor inválido para ${key}: "${raw}". Apenas "true" ou "false" são aceites.`
  );
}

const canonicalEmulatorFlag = parseOptionalBooleanFlag(
  'VITE_USE_FIREBASE_EMULATORS',
  readEnvValue('VITE_USE_FIREBASE_EMULATORS')
);
const legacyEmulatorFlag = parseOptionalBooleanFlag(
  'VITE_USE_FIREBASE_EMULATOR',
  readEnvValue('VITE_USE_FIREBASE_EMULATOR')
);

if (
  canonicalEmulatorFlag !== undefined &&
  legacyEmulatorFlag !== undefined &&
  canonicalEmulatorFlag !== legacyEmulatorFlag
) {
  throw new Error(
    `[Firebase Emulator Guard] Conflito entre VITE_USE_FIREBASE_EMULATORS (${canonicalEmulatorFlag}) e a flag legado VITE_USE_FIREBASE_EMULATOR (${legacyEmulatorFlag}).`
  );
}

if (canonicalEmulatorFlag === undefined && legacyEmulatorFlag === true) {
  console.warn(
    '[Firebase Emulator Guard] A flag VITE_USE_FIREBASE_EMULATOR é legado; utilize VITE_USE_FIREBASE_EMULATORS=true.'
  );
}

const emulatorRequested = canonicalEmulatorFlag ?? legacyEmulatorFlag ?? false;
const isDevEnvironment = Boolean((import.meta as any).env?.DEV);

if (emulatorRequested && !isDevEnvironment) {
  throw new Error(
    '[Firebase Emulator Guard] Abortado: os Firebase Emulators só podem ser activados em ambiente DEV. Fallback para o Firebase real bloqueado.'
  );
}

export const isFirebaseEmulatorMode = emulatorRequested && isDevEnvironment;

interface ParsedEmulatorEndpoint {
  host: '127.0.0.1' | 'localhost';
  port: number;
  hostPort: string;
  origin: string;
}

function parseLocalEmulatorEndpoint(
  serviceName: string,
  envKey: string,
  defaultHostPort: string
): ParsedEmulatorEndpoint {
  const raw = readEnvValue(envKey);
  const value = (raw === undefined ? defaultHostPort : raw).trim();
  const match = /^(127\.0\.0\.1|localhost):(\d{1,5})$/.exec(value);
  if (!match) {
    throw new Error(
      `[Firebase Emulator Guard] Host inválido para ${serviceName} (${envKey}="${value}"). Apenas "127.0.0.1:<porta>" ou "localhost:<porta>" são permitidos.`
    );
  }
  const host = match[1] as '127.0.0.1' | 'localhost';
  const port = Number(match[2]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `[Firebase Emulator Guard] Porta inválida para ${serviceName} (${envKey}="${value}"). Deve estar entre 1 e 65535.`
    );
  }
  return {
    host,
    port,
    hostPort: `${host}:${port}`,
    origin: `http://${host}:${port}`
  };
}

let emulatorProjectId = 'demo-sigar-test';
let emulatorEndpoints: {
  auth: ParsedEmulatorEndpoint;
  firestore: ParsedEmulatorEndpoint;
  functions: ParsedEmulatorEndpoint;
} | null = null;

if (isFirebaseEmulatorMode) {
  const rawProjectId = readEnvValue('VITE_FIREBASE_EMULATOR_PROJECT_ID');
  emulatorProjectId = (rawProjectId === undefined ? 'demo-sigar-test' : rawProjectId).trim();

  if (emulatorProjectId !== 'demo-sigar-test') {
    throw new Error(
      `[Firebase Emulator Guard] Abortado: o modo Emulator exige o projectId "demo-sigar-test" (recebido "${emulatorProjectId}").`
    );
  }

  emulatorEndpoints = {
    auth: parseLocalEmulatorEndpoint('Auth', 'VITE_FIREBASE_AUTH_EMULATOR_HOST', '127.0.0.1:9099'),
    firestore: parseLocalEmulatorEndpoint('Firestore', 'VITE_FIRESTORE_EMULATOR_HOST', '127.0.0.1:8080'),
    functions: parseLocalEmulatorEndpoint('Functions', 'VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST', '127.0.0.1:5001')
  };
}

const effectiveFirebaseConfig: FirebaseOptions = isFirebaseEmulatorMode
  ? {
      apiKey: 'demo-emulator-api-key',
      appId: firebaseConfig.appId,
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

if (isFirebaseEmulatorMode && emulatorEndpoints && !globalEmulatorState.__SIGAR_EMULATORS_CONNECTED__) {
  connectAuthEmulator(auth, emulatorEndpoints.auth.origin, { disableWarnings: true });
  connectFirestoreEmulator(db, emulatorEndpoints.firestore.host, emulatorEndpoints.firestore.port);
  connectFunctionsEmulator(functions, emulatorEndpoints.functions.host, emulatorEndpoints.functions.port);
  globalEmulatorState.__SIGAR_EMULATORS_CONNECTED__ = true;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 3000): Promise<{ res: Response; body: any }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    const contentType = String(res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      throw new Error(`Resposta não-JSON (${contentType || 'sem content-type'}, HTTP ${res.status})`);
    }
    const body = await res.json();
    return { res, body };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Garante em modo de testes (quando isFirebaseEmulatorMode === true) que Auth, Firestore
 * e Functions Emulators respondem aos seus protocolos específicos locais, sem fallback real.
 */
export async function assertEmulatorsAvailable(): Promise<void> {
  if (!isFirebaseEmulatorMode || !emulatorEndpoints) {
    throw new Error(
      '[Firebase Emulator Guard] Operação bloqueada: VITE_USE_FIREBASE_EMULATORS=true não está activo em ambiente DEV.'
    );
  }

  // 1. Auth Emulator: endpoint de configuração Identity Toolkit do projecto de teste
  try {
    const authUrl = `${emulatorEndpoints.auth.origin}/emulator/v1/projects/${emulatorProjectId}/config`;
    const { res, body } = await fetchJsonWithTimeout(authUrl);
    if (!res.ok || !body || !body.signIn || typeof body.signIn !== 'object') {
      throw new Error(`Payload inesperado do Auth Emulator (HTTP ${res.status})`);
    }
  } catch (err) {
    throw new Error(
      `[Firebase Emulator Guard] Auth Emulator indisponível ou inválido em ${emulatorEndpoints.auth.origin} (sem fallback para siverc-94da3). (${err instanceof Error ? err.message : String(err)})`
    );
  }

  // 2. Firestore Emulator: consulta REST API Firestore (espera resposta JSON do Firestore, rejeita Nginx/HTML)
  try {
    const fsUrl = `${emulatorEndpoints.firestore.origin}/v1/projects/${emulatorProjectId}/databases/(default)/documents/emulatorHealthProbe/probe`;
    const { res, body } = await fetchJsonWithTimeout(fsUrl);
    const fsStatus = body?.error?.status;
    const isValidFirestoreResponse =
      res.ok || fsStatus === 'PERMISSION_DENIED' || fsStatus === 'NOT_FOUND';
    if (!isValidFirestoreResponse) {
      throw new Error(`Payload inesperado do Firestore Emulator (HTTP ${res.status}, status=${String(fsStatus)})`);
    }
  } catch (err) {
    throw new Error(
      `[Firebase Emulator Guard] Firestore Emulator indisponível ou inválido em ${emulatorEndpoints.firestore.origin} (sem fallback para siverc-94da3). (${err instanceof Error ? err.message : String(err)})`
    );
  }

  // 3. Functions Emulator: lista de backends registados e triggers efectivamente carregadas
  try {
    const fnUrl = `${emulatorEndpoints.functions.origin}/backends`;
    const { res, body } = await fetchJsonWithTimeout(fnUrl);
    const hasLoadedTriggers =
      Array.isArray(body?.backends) &&
      body.backends.length > 0 &&
      body.backends.some((b: any) => Array.isArray(b?.functionTriggers) && b.functionTriggers.length > 0);
    if (!res.ok || !body || !hasLoadedTriggers) {
      throw new Error(`Payload inesperado ou triggers não carregadas no Functions Emulator (HTTP ${res.status})`);
    }
  } catch (err) {
    throw new Error(
      `[Firebase Emulator Guard] Functions Emulator indisponível ou inválido em ${emulatorEndpoints.functions.origin} (sem fallback para siverc-94da3). (${err instanceof Error ? err.message : String(err)})`
    );
  }
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
