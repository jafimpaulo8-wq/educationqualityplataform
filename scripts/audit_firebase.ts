import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, terminate } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

async function main() {
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
