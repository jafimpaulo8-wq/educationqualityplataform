import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, terminate, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('Writing /institutions/ceu-azul-nacala...');
  try {
    const institutionData = {
      id: "ceu-azul-nacala",
      nome: "Centro Infantil Céu Azul",
      nomeCompleto: "Centro Infantil Céu Azul — Delegação de Nacala-Porto",
      tipo: "Centro de Educação Infantil",
      nuit: "402029013",
      local: "Nacala-Porto, Nampula, Moçambique",
      email: "moztechwavenacala8@gmail.com",
      telefone1: "853 181 189",
      telefone2: "864 826 647",
      mpesa: "853 181 189",
      emola: "864 826 647",
      estado: "activo",
      institutionId: "ceu-azul-nacala",
      createdAt: serverTimestamp(),
      createdBy: "jafimpaulo8@gmail.com"
    };

    await setDoc(doc(db, 'institutions', 'ceu-azul-nacala'), institutionData, { merge: true });
    console.log('SUCCESS: Written /institutions/ceu-azul-nacala');

    const checkSnap = await getDoc(doc(db, 'institutions', 'ceu-azul-nacala'));
    console.log('Read back:', checkSnap.exists(), checkSnap.data());
  } catch (err: any) {
    console.error('Error writing /institutions/ceu-azul-nacala:', err.message);
  }

  await terminate(db);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
