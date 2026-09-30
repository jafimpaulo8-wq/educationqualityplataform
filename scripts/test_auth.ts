import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

async function main() {
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
