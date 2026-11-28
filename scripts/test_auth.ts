import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

async function main() {
  if (
    process.env.VITE_USE_FIREBASE_EMULATORS === 'true' ||
    process.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST
  ) {
    throw new Error('[PROD GUARD] test_auth.ts bloqueado em ambiente Emulator.');
  }
  if (process.env.SIGAR_ALLOW_PROD_SCRIPT !== 'CONFIRM_SIVERC_94DA3') {
    throw new Error(
      '[PROD GUARD] Execução bloqueada: defina SIGAR_ALLOW_PROD_SCRIPT=CONFIRM_SIVERC_94DA3 para confirmar acesso a siverc-94da3.'
    );
  }
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  console.log('Testing Anonymous Auth...');
  try {
    const anonRes = await signInAnonymously(auth);
    console.log('Anonymous sign-in SUCCESS! UID:', anonRes.user.uid);
  } catch (err: any) {
    console.log('Anonymous sign-in failed (likely disabled):', err.message);
  }

  console.log('Testing Email/Password Auth for jafimpaulo8@gmail.com...');
  try {
    const emailRes = await signInWithEmailAndPassword(auth, 'jafimpaulo8@gmail.com', 'dummyPassword123');
    console.log('Email sign-in SUCCESS! UID:', emailRes.user.uid);
  } catch (err: any) {
    console.log('Email sign-in result:', err.code, err.message);
  }
}

main().catch(console.error);
