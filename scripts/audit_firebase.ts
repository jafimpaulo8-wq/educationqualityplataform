import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, terminate } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

async function main() {
  if (
    process.env.VITE_USE_FIREBASE_EMULATORS === 'true' ||
    process.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST
  ) {
    throw new Error('[PROD GUARD] audit_firebase.ts bloqueado em ambiente Emulator.');
  }
  if (process.env.SIGAR_ALLOW_PROD_SCRIPT !== 'CONFIRM_SIVERC_94DA3') {
    throw new Error(
      '[PROD GUARD] Execução bloqueada: defina SIGAR_ALLOW_PROD_SCRIPT=CONFIRM_SIVERC_94DA3 para confirmar acesso a siverc-94da3.'
    );
  }
  console.log('AUDIT_START: Connecting to project:', firebaseConfig.projectId);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const collectionsToCheck = [
    'users',
    'institutions',
    'admins',
    'access_codes',
    'students',
    'courses',
    'classes',
    'teachers',
    'payments',
    'certificates'
  ];

  for (const colName of collectionsToCheck) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`COLLECTION [${colName}]: Total documents = ${snap.size}`);
      snap.forEach(d => {
        console.log(`  -> doc ID [${d.id}]:`, JSON.stringify(d.data()));
      });
    } catch (err: any) {
      console.error(`Error querying [${colName}]:`, err.message);
    }
  }

  await terminate(db);
  console.log('AUDIT_COMPLETED_SUCCESSFULLY');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
