import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  collection,
  query,
  where
} from 'firebase/firestore';

const PROJECT_ID = 'siverc-94da3';
const AUTH_EMULATOR_URL = 'http://127.0.0.1:9099';
const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8080;
const TEST_PASS = 'SigarFaseC#2026';

interface CheckResult {
  id: number;
  category: string;
  actor: string;
  label: string;
  expected: 'ALLOW' | 'DENY';
  passed: boolean;
  detail: string;
}

const results: CheckResult[] = [];
let seq = 1;

async function checkAllow(
  category: string,
  actor: string,
  label: string,
  fn: () => Promise<unknown>
): Promise<void> {
  const id = seq++;
  try {
    const res = await fn();
    const extra =
      res && typeof res === 'object' && 'size' in (res as any)
        ? `docs=${(res as any).size}`
        : res && typeof res === 'object' && 'exists' in (res as any)
          ? `exists=${(res as any).exists()}`
          : 'ok';
    results.push({ id, category, actor, label, expected: 'ALLOW', passed: true, detail: `PERMITIDO (${extra})` });
  } catch (err: any) {
    results.push({
      id,
      category,
      actor,
      label,
      expected: 'ALLOW',
      passed: false,
      detail: `FALHOU (esperava ALLOW): ${err?.code || err?.message || err}`
    });
  }
}

async function checkDeny(
  category: string,
  actor: string,
  label: string,
  fn: () => Promise<unknown>
): Promise<void> {
  const id = seq++;
  try {
    await fn();
    results.push({
      id,
      category,
      actor,
      label,
      expected: 'DENY',
      passed: false,
      detail: 'FALHA DE SEGURANÇA: operação foi PERMITIDA (esperava DENY)'
    });
  } catch (err: any) {
    const code = String(err?.code || '');
    const msg = String(err?.message || '');
    if (code.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
      results.push({ id, category, actor, label, expected: 'DENY', passed: true, detail: 'BLOQUEADO (permission-denied)' });
    } else {
      results.push({
        id,
        category,
        actor,
        label,
        expected: 'DENY',
        passed: false,
        detail: `ERRO INESPERADO: ${code || msg}`
      });
    }
  }
}

function assertCondition(category: string, actor: string, label: string, condition: boolean, detail: string) {
  const id = seq++;
  results.push({
    id,
    category,
    actor,
    label,
    expected: 'ALLOW',
    passed: condition,
    detail: condition ? `OK (${detail})` : `FALHOU (${detail})`
  });
}

async function setAuthEmailVerified(localId: string, emailVerified: boolean): Promise<void> {
  const resp = await fetch(
    `${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer owner'
      },
      body: JSON.stringify({ localId, emailVerified })
    }
  );
  if (!resp.ok) {
    throw new Error(`Emulator accounts:update failed: ${resp.status} ${await resp.text()}`);
  }
}

async function ensureUser(auth: ReturnType<typeof getAuth>, email: string, verified = true): Promise<string> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, TEST_PASS);
    if (verified) await setAuthEmailVerified(cred.user.uid, true);
    return cred.user.uid;
  } catch {
    const cred = await signInWithEmailAndPassword(auth, email, TEST_PASS);
    if (verified) await setAuthEmailVerified(cred.user.uid, true);
    return cred.user.uid;
  }
}

async function main() {
  const app = initializeApp({ apiKey: 'fake-api-key', projectId: PROJECT_ID }, `fase-c-test-${Date.now()}`);
  const auth = getAuth(app);
  const db = getFirestore(app);
  connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });
  connectFirestoreEmulator(db, FIRESTORE_HOST, FIRESTORE_PORT);

  const SUPER_EMAIL = 'moztechwavenacala8@gmail.com';
  const DIR_CEU_EMAIL = 'jafimpaulo8@gmail.com';
  const FIN_CEU_EMAIL = 'fin.ceuazul@sigar.test';
  const SEC_CEU_EMAIL = 'sec.ceuazul@sigar.test';
  const ALUNO_CEU_1_EMAIL = 'aluno1.ceuazul@sigar.test';
  const ALUNO_CEU_2_EMAIL = 'aluno2.ceuazul@sigar.test';
  const GUARDIAN_CEU_1_EMAIL = 'encarregado1.ceuazul@sigar.test';
  const FIN_CFTPM_EMAIL = 'fin.cftpm@sigar.test';
  const ALUNO_CFTPM_EMAIL = 'aluno.cftpm@sigar.test';
  const FIN_PENIEL_EMAIL = 'fin.peniel@sigar.test';
  const ALUNO_PENIEL_EMAIL = 'aluno.peniel@sigar.test';

  const superUid = await ensureUser(auth, SUPER_EMAIL, true);
  const dirCeuUid = await ensureUser(auth, DIR_CEU_EMAIL, true);
  const finCeuUid = await ensureUser(auth, FIN_CEU_EMAIL, true);
  const secCeuUid = await ensureUser(auth, SEC_CEU_EMAIL, true);
  const alunoCeu1Uid = await ensureUser(auth, ALUNO_CEU_1_EMAIL, true);
  const alunoCeu2Uid = await ensureUser(auth, ALUNO_CEU_2_EMAIL, true);
  const guardianCeu1Uid = await ensureUser(auth, GUARDIAN_CEU_1_EMAIL, true);
  const finCftpmUid = await ensureUser(auth, FIN_CFTPM_EMAIL, true);
  const alunoCftpmUid = await ensureUser(auth, ALUNO_CFTPM_EMAIL, true);
  const finPenielUid = await ensureUser(auth, FIN_PENIEL_EMAIL, true);
  const alunoPenielUid = await ensureUser(auth, ALUNO_PENIEL_EMAIL, true);

  // Autenticar como Super Admin para criar seed multi-institucional realista
  await signInWithEmailAndPassword(auth, SUPER_EMAIL, TEST_PASS);

  // 1. Seed das 3 instituições: Céu Azul, CFTPM e Peniel
  await setDoc(doc(db, 'institutions', 'ceu-azul-nacala'), {
    id: 'ceu-azul-nacala',
    slug: 'ceu-azul',
    name: 'Centro Infantil Céu Azul — Nacala',
    sigla: 'CICA',
    logoUrl: 'https://cdn.example.test/ceu-azul-logo.png',
    faviconUrl: 'https://cdn.example.test/ceu-azul-fav.ico',
    financialSettings: {
      currency: 'MT',
      mpesaNumber: '849990001',
      emolaNumber: '869990001',
      mkeshNumber: '829990001'
    }
  });

  await setDoc(doc(db, 'institutions', 'inst-1'), {
    id: 'inst-1',
    slug: 'cftpm-moztechwave',
    name: 'CFTPM — Moztechwave Formação',
    sigla: 'CFTPM',
    logoUrl: 'https://cdn.example.test/cftpm-logo.png',
    faviconUrl: 'https://cdn.example.test/cftpm-fav.ico',
    financialSettings: {
      currency: 'MT',
      mpesaNumber: '848880002',
      emolaNumber: '868880002',
      mkeshNumber: '828880002'
    }
  });

  await setDoc(doc(db, 'institutions', 'inst-peniel'), {
    id: 'inst-peniel',
    slug: 'peniel',
    name: 'Instituto Técnico Peniel',
    sigla: 'PENIEL',
    logoUrl: 'https://cdn.example.test/peniel-logo.png',
    faviconUrl: 'https://cdn.example.test/peniel-fav.ico',
    financialSettings: {
      currency: 'MT',
      mpesaNumber: '847770003',
      emolaNumber: '867770003',
      mkeshNumber: '827770003'
    }
  });

  // Contas de recebimento privadas (M-Pesa / e-Mola / mKesh) em cada centro
  await setDoc(doc(db, 'institutions', 'ceu-azul-nacala', 'receivingAccounts', 'rec_ceu_mpesa'), {
    id: 'rec_ceu_mpesa',
    institutionId: 'ceu-azul-nacala',
    channel: 'M-Pesa',
    label: 'M-Pesa Oficial Céu Azul',
    accountNumber: '849990001',
    holderName: 'Centro Infantil Céu Azul',
    isActive: true,
    updatedAt: new Date().toISOString()
  });

  await setDoc(doc(db, 'institutions', 'inst-1', 'receivingAccounts', 'rec_cftpm_mpesa'), {
    id: 'rec_cftpm_mpesa',
    institutionId: 'inst-1',
    channel: 'M-Pesa',
    label: 'M-Pesa Oficial CFTPM',
    accountNumber: '848880002',
    holderName: 'CFTPM',
    isActive: true,
    updatedAt: new Date().toISOString()
  });

  await setDoc(doc(db, 'institutions', 'inst-peniel', 'receivingAccounts', 'rec_peniel_emola'), {
    id: 'rec_peniel_emola',
    institutionId: 'inst-peniel',
    channel: 'e-Mola',
    label: 'e-Mola Oficial Peniel',
    accountNumber: '867770003',
    holderName: 'Instituto Peniel',
    isActive: true,
    updatedAt: new Date().toISOString()
  });

  // Perfis de utilizadores
  const seedUsers = [
    { id: superUid, email: SUPER_EMAIL, role: 'SUPER_ADMIN', roles: ['SUPER_ADMIN'], institutionId: '' },
    { id: dirCeuUid, email: DIR_CEU_EMAIL, role: 'DIRETOR', roles: ['DIRETOR'], institutionId: 'ceu-azul-nacala' },
    { id: finCeuUid, email: FIN_CEU_EMAIL, role: 'FINANCEIRO', roles: ['FINANCEIRO'], institutionId: 'ceu-azul-nacala' },
    { id: secCeuUid, email: SEC_CEU_EMAIL, role: 'SECRETARIA', roles: ['SECRETARIA'], institutionId: 'ceu-azul-nacala' },
    { id: alunoCeu1Uid, email: ALUNO_CEU_1_EMAIL, role: 'ALUNO', roles: ['ALUNO'], institutionId: 'ceu-azul-nacala', studentId: 'stu_ceu_1' },
    { id: alunoCeu2Uid, email: ALUNO_CEU_2_EMAIL, role: 'ALUNO', roles: ['ALUNO'], institutionId: 'ceu-azul-nacala', studentId: 'stu_ceu_2' },
    { id: guardianCeu1Uid, email: GUARDIAN_CEU_1_EMAIL, role: 'RESPONSAVEL', roles: ['RESPONSAVEL'], institutionId: 'ceu-azul-nacala', studentIds: ['stu_ceu_1'] },
    { id: finCftpmUid, email: FIN_CFTPM_EMAIL, role: 'FINANCEIRO', roles: ['FINANCEIRO'], institutionId: 'inst-1' },
    { id: alunoCftpmUid, email: ALUNO_CFTPM_EMAIL, role: 'ALUNO', roles: ['ALUNO'], institutionId: 'inst-1', studentId: 'stu_cftpm_1' },
    { id: finPenielUid, email: FIN_PENIEL_EMAIL, role: 'FINANCEIRO', roles: ['FINANCEIRO'], institutionId: 'inst-peniel' },
    { id: alunoPenielUid, email: ALUNO_PENIEL_EMAIL, role: 'ALUNO', roles: ['ALUNO'], institutionId: 'inst-peniel', studentId: 'stu_peniel_1' }
  ];
  for (const u of seedUsers) {
    await setDoc(doc(db, 'users', u.id), u);
  }

  // Configurações públicas por slug (ZERO números privados)
  const publicPayloads = [
    {
      id: 'ceu-azul',
      slug: 'ceu-azul',
      institutionId: 'ceu-azul-nacala',
      name: 'Centro Infantil Céu Azul — Nacala',
      logoUrl: 'https://cdn.example.test/ceu-azul-logo.png',
      faviconUrl: 'https://cdn.example.test/ceu-azul-fav.ico',
      acceptedChannels: ['M-Pesa', 'e-Mola', 'mKesh'],
      paymentMethods: { acceptedChannels: ['M-Pesa', 'e-Mola', 'mKesh'], instructions: 'Autentique-se para pagar.' }
    },
    {
      id: 'cftpm-moztechwave',
      slug: 'cftpm-moztechwave',
      institutionId: 'inst-1',
      name: 'CFTPM — Moztechwave Formação',
      logoUrl: 'https://cdn.example.test/cftpm-logo.png',
      faviconUrl: 'https://cdn.example.test/cftpm-fav.ico',
      acceptedChannels: ['M-Pesa', 'e-Mola', 'Transferência Bancária'],
      paymentMethods: { acceptedChannels: ['M-Pesa', 'e-Mola', 'Transferência Bancária'], instructions: 'Autentique-se para pagar.' }
    },
    {
      id: 'peniel',
      slug: 'peniel',
      institutionId: 'inst-peniel',
      name: 'Instituto Técnico Peniel',
      logoUrl: 'https://cdn.example.test/peniel-logo.png',
      faviconUrl: 'https://cdn.example.test/peniel-fav.ico',
      acceptedChannels: ['e-Mola', 'mKesh'],
      paymentMethods: { acceptedChannels: ['e-Mola', 'mKesh'], instructions: 'Autentique-se para pagar.' }
    }
  ];
  for (const p of publicPayloads) {
    await setDoc(doc(db, 'publicInstitutions', p.slug), p);
  }

  // Estudantes & Registos financeiros existentes (preservação + vínculo aluno/encarregado)
  await setDoc(doc(db, 'students', 'stu_ceu_1'), {
    id: 'stu_ceu_1',
    institutionId: 'ceu-azul-nacala',
    fullName: 'Ana Maria Matola',
    code: 'CA-2026-01',
    userId: alunoCeu1Uid,
    guardianUserId: guardianCeu1Uid,
    guardianUids: [guardianCeu1Uid]
  });
  await setDoc(doc(db, 'students', 'stu_ceu_2'), {
    id: 'stu_ceu_2',
    institutionId: 'ceu-azul-nacala',
    fullName: 'Bruno João',
    code: 'CA-2026-02',
    userId: alunoCeu2Uid
  });
  await setDoc(doc(db, 'students', 'stu_cftpm_1'), {
    id: 'stu_cftpm_1',
    institutionId: 'inst-1',
    fullName: 'Carlos CFTPM',
    code: 'CF-2026-01',
    userId: alunoCftpmUid
  });
  await setDoc(doc(db, 'students', 'stu_peniel_1'), {
    id: 'stu_peniel_1',
    institutionId: 'inst-peniel',
    fullName: 'Délcio Peniel',
    code: 'PN-2026-01',
    userId: alunoPenielUid
  });

  await setDoc(doc(db, 'accountsReceivable', 'ar_ceu_1'), {
    id: 'ar_ceu_1',
    institutionId: 'ceu-azul-nacala',
    studentId: 'stu_ceu_1',
    studentUserId: alunoCeu1Uid,
    guardianUserId: guardianCeu1Uid,
    guardianUids: [guardianCeu1Uid],
    category: 'mensalidade',
    amount: 2500,
    dueDate: '2026-05-10',
    status: 'pendente'
  });
  await setDoc(doc(db, 'accountsReceivable', 'ar_ceu_2'), {
    id: 'ar_ceu_2',
    institutionId: 'ceu-azul-nacala',
    studentId: 'stu_ceu_2',
    studentUserId: alunoCeu2Uid,
    category: 'mensalidade',
    amount: 2500,
    dueDate: '2026-05-10',
    status: 'pendente'
  });
  await setDoc(doc(db, 'accountsReceivable', 'ar_cftpm_1'), {
    id: 'ar_cftpm_1',
    institutionId: 'inst-1',
    studentId: 'stu_cftpm_1',
    studentUserId: alunoCftpmUid,
    category: 'mensalidade',
    amount: 4500,
    dueDate: '2026-05-10',
    status: 'pendente'
  });
  await setDoc(doc(db, 'accountsReceivable', 'ar_peniel_1'), {
    id: 'ar_peniel_1',
    institutionId: 'inst-peniel',
    studentId: 'stu_peniel_1',
    studentUserId: alunoPenielUid,
    category: 'mensalidade',
    amount: 3200,
    dueDate: '2026-05-10',
    status: 'pendente'
  });

  // Pagamentos iniciais & Recibos pré-existentes (preservação)
  await setDoc(doc(db, 'payments', 'pay_ceu_1_approved'), {
    id: 'pay_ceu_1_approved',
    institutionId: 'ceu-azul-nacala',
    studentId: 'stu_ceu_1',
    studentUserId: alunoCeu1Uid,
    guardianUserId: guardianCeu1Uid,
    guardianUids: [guardianCeu1Uid],
    studentName: 'Ana Maria Matola',
    studentCode: 'CA-2026-01',
    amount: 2500,
    network: 'M-Pesa',
    transactionCode: 'MP001CEU',
    status: 'PAGO',
    receiptNumber: 'REC-2026-0001',
    receiptId: 'rcp-pay_ceu_1_approved',
    serviceReleased: true
  });
  await setDoc(doc(db, 'payments', 'pay_ceu_1_correction'), {
    id: 'pay_ceu_1_correction',
    institutionId: 'ceu-azul-nacala',
    studentId: 'stu_ceu_1',
    studentUserId: alunoCeu1Uid,
    guardianUserId: guardianCeu1Uid,
    submittedByUid: alunoCeu1Uid,
    studentName: 'Ana Maria Matola',
    studentCode: 'CA-2026-01',
    amount: 2500,
    network: 'M-Pesa',
    transactionCode: 'MPERR01',
    status: 'CORREÇÃO SOLICITADA',
    correctionNotes: 'Código ilegível',
    reviewedBy: 'Tesouraria Céu Azul',
    reviewedAt: new Date().toISOString(),
    serviceReleased: false
  });
  await setDoc(doc(db, 'payments', 'pay_ceu_2_existing'), {
    id: 'pay_ceu_2_existing',
    institutionId: 'ceu-azul-nacala',
    studentId: 'stu_ceu_2',
    studentUserId: alunoCeu2Uid,
    studentName: 'Bruno João',
    studentCode: 'CA-2026-02',
    amount: 2500,
    network: 'e-Mola',
    transactionCode: 'EM002CEU',
    status: 'PAGO',
    receiptNumber: 'REC-2026-0002',
    receiptId: 'rcp-pay_ceu_2_existing',
    serviceReleased: true
  });
  await setDoc(doc(db, 'payments', 'pay_cftpm_pending'), {
    id: 'pay_cftpm_pending',
    institutionId: 'inst-1',
    studentId: 'stu_cftpm_1',
    studentUserId: alunoCftpmUid,
    studentName: 'Carlos CFTPM',
    studentCode: 'CF-2026-01',
    amount: 4500,
    network: 'M-Pesa',
    transactionCode: 'MPCFTPM01',
    status: 'PENDENTE DE CONFIRMAÇÃO',
    serviceReleased: false
  });
  await setDoc(doc(db, 'payments', 'pay_peniel_pending'), {
    id: 'pay_peniel_pending',
    institutionId: 'inst-peniel',
    studentId: 'stu_peniel_1',
    studentUserId: alunoPenielUid,
    studentName: 'Délcio Peniel',
    studentCode: 'PN-2026-01',
    amount: 3200,
    network: 'e-Mola',
    transactionCode: 'EMPENIEL01',
    status: 'PENDENTE DE CONFIRMAÇÃO',
    serviceReleased: false
  });

  await setDoc(doc(db, 'receipts', 'rcp-pay_ceu_1_approved'), {
    id: 'rcp-pay_ceu_1_approved',
    institutionId: 'ceu-azul-nacala',
    paymentId: 'pay_ceu_1_approved',
    receiptNumber: 'REC-2026-0001',
    studentId: 'stu_ceu_1',
    studentName: 'Ana Maria Matola',
    studentCode: 'CA-2026-01',
    studentUserId: alunoCeu1Uid,
    guardianUserId: guardianCeu1Uid,
    guardianUids: [guardianCeu1Uid],
    amount: 2500,
    network: 'M-Pesa',
    transactionCode: 'MP001CEU',
    issuedAt: new Date().toISOString(),
    issuedBy: 'Tesouraria Céu Azul',
    status: 'Emitido'
  });
  await setDoc(doc(db, 'receipts', 'rcp-pay_ceu_2_existing'), {
    id: 'rcp-pay_ceu_2_existing',
    institutionId: 'ceu-azul-nacala',
    paymentId: 'pay_ceu_2_existing',
    receiptNumber: 'REC-2026-0002',
    studentId: 'stu_ceu_2',
    studentName: 'Bruno João',
    studentCode: 'CA-2026-02',
    studentUserId: alunoCeu2Uid,
    amount: 2500,
    network: 'e-Mola',
    transactionCode: 'EM002CEU',
    issuedAt: new Date().toISOString(),
    issuedBy: 'Tesouraria Céu Azul',
    status: 'Emitido'
  });

  // =========================================================================
  // 2. TESTES ANÓNIMOS & PUBLIC INSTITUTIONS (ZERO NÚMEROS PRIVADOS)
  // =========================================================================
  await signOut(auth);

  await checkAllow('1. Portal Público', 'Anónimo', 'Ler publicInstitutions/ceu-azul', async () => {
    const snap = await getDoc(doc(db, 'publicInstitutions', 'ceu-azul'));
    const data = snap.data() || {};
    assertCondition(
      '1. Portal Público',
      'Anónimo',
      'publicInstitutions/ceu-azul sem M-Pesa/e-Mola/mKesh/NIB privados',
      !('mpesaNumber' in data) && !('emolaNumber' in data) && !('mkeshNumber' in data) && !('financialSettings' in data),
      'campos privados ausentes'
    );
    return snap;
  });
  await checkAllow('1. Portal Público', 'Anónimo', 'Ler publicInstitutions/cftpm-moztechwave', () =>
    getDoc(doc(db, 'publicInstitutions', 'cftpm-moztechwave'))
  );
  await checkAllow('1. Portal Público', 'Anónimo', 'Ler publicInstitutions/peniel', () =>
    getDoc(doc(db, 'publicInstitutions', 'peniel'))
  );
  await checkDeny('1. Portal Público', 'Anónimo', 'Listar toda a coleção publicInstitutions', () =>
    getDocs(collection(db, 'publicInstitutions'))
  );
  await checkDeny('1. Portal Público', 'Anónimo', 'Ler institutions/ceu-azul-nacala privado', () =>
    getDoc(doc(db, 'institutions', 'ceu-azul-nacala'))
  );
  await checkDeny('1. Portal Público', 'Anónimo', 'Ler receivingAccounts de Céu Azul', () =>
    getDocs(collection(db, 'institutions', 'ceu-azul-nacala', 'receivingAccounts'))
  );
  await checkDeny('1. Portal Público', 'Anónimo', 'Ler payments de qualquer instituição', () =>
    getDoc(doc(db, 'payments', 'pay_ceu_1_approved'))
  );
  await checkDeny('1. Portal Público', 'Anónimo', 'Ler accountsReceivable de qualquer instituição', () =>
    getDoc(doc(db, 'accountsReceivable', 'ar_ceu_1'))
  );
  await checkDeny('1. Portal Público', 'Anónimo', 'Ler receipts de qualquer instituição', () =>
    getDoc(doc(db, 'receipts', 'rcp-pay_ceu_1_approved'))
  );

  // =========================================================================
  // 3. ALUNO & ENCARREGADO: CONSULTA PRÓPRIA E SUBMISSÃO DE COMPROVATIVO
  // =========================================================================
  await signInWithEmailAndPassword(auth, ALUNO_CEU_1_EMAIL, TEST_PASS);

  await checkAllow('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Ler próprias obrigações (accountsReceivable)', () =>
    getDocs(query(collection(db, 'accountsReceivable'), where('institutionId', '==', 'ceu-azul-nacala'), where('studentUserId', '==', alunoCeu1Uid)))
  );
  await checkAllow('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Ler próprios pagamentos (payments)', () =>
    getDocs(query(collection(db, 'payments'), where('institutionId', '==', 'ceu-azul-nacala'), where('studentUserId', '==', alunoCeu1Uid)))
  );
  await checkAllow('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Ler próprios recibos (receipts)', () =>
    getDocs(query(collection(db, 'receipts'), where('institutionId', '==', 'ceu-azul-nacala'), where('studentUserId', '==', alunoCeu1Uid)))
  );
  await checkDeny('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Ler obrigação de outro aluno do mesmo centro (Aluno2)', () =>
    getDoc(doc(db, 'accountsReceivable', 'ar_ceu_2'))
  );
  await checkDeny('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Ler recibo de outro aluno do mesmo centro (Aluno2)', () =>
    getDoc(doc(db, 'receipts', 'rcp-pay_ceu_2_existing'))
  );
  await checkDeny('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Ler receivingAccounts privados do centro', () =>
    getDocs(collection(db, 'institutions', 'ceu-azul-nacala', 'receivingAccounts'))
  );
  await checkDeny('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Ler payments do CFTPM', () =>
    getDoc(doc(db, 'payments', 'pay_cftpm_pending'))
  );

  await checkAllow('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Submeter comprovativo pendente válido', () =>
    setDoc(doc(db, 'payments', 'pay_ceu_1_submitted_new'), {
      id: 'pay_ceu_1_submitted_new',
      institutionId: 'ceu-azul-nacala',
      studentId: 'stu_ceu_1',
      studentUserId: alunoCeu1Uid,
      submittedByUid: alunoCeu1Uid,
      studentName: 'Ana Maria Matola',
      studentCode: 'CA-2026-01',
      amount: 2500,
      network: 'M-Pesa',
      transactionCode: 'MPNEW001',
      status: 'PENDENTE DE CONFIRMAÇÃO',
      serviceReleased: false
    })
  );
  await checkDeny('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Tentar submeter pagamento já PAGO/auto-aprovado', () =>
    setDoc(doc(db, 'payments', 'pay_ceu_1_fake_paid'), {
      id: 'pay_ceu_1_fake_paid',
      institutionId: 'ceu-azul-nacala',
      studentId: 'stu_ceu_1',
      studentUserId: alunoCeu1Uid,
      submittedByUid: alunoCeu1Uid,
      amount: 2500,
      status: 'PAGO',
      receiptNumber: 'REC-FAKE',
      serviceReleased: true
    })
  );
  await checkAllow('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Reenviar pagamento em CORREÇÃO SOLICITADA', () =>
    updateDoc(doc(db, 'payments', 'pay_ceu_1_correction'), {
      transactionCode: 'MPCORRIGIDO1',
      amount: 2500,
      status: 'PENDENTE DE CONFIRMAÇÃO',
      serviceReleased: false,
      correctionNotes: deleteField(),
      reviewedBy: deleteField(),
      reviewedAt: deleteField()
    })
  );
  await checkDeny('2. Aluno/Encarregado', 'Aluno1 Céu Azul', 'Tentar criar recibo oficial em receipts', () =>
    setDoc(doc(db, 'receipts', 'rcp_fake_student'), {
      id: 'rcp_fake_student',
      institutionId: 'ceu-azul-nacala',
      studentId: 'stu_ceu_1',
      studentUserId: alunoCeu1Uid,
      amount: 2500
    })
  );

  // Encarregado de Educação (RESPONSAVEL) Céu Azul
  await signInWithEmailAndPassword(auth, GUARDIAN_CEU_1_EMAIL, TEST_PASS);
  await checkAllow('2. Aluno/Encarregado', 'Encarregado Céu Azul', 'Consultar obrigações do educando A1', () =>
    getDocs(query(collection(db, 'accountsReceivable'), where('institutionId', '==', 'ceu-azul-nacala'), where('guardianUserId', '==', guardianCeu1Uid)))
  );
  await checkAllow('2. Aluno/Encarregado', 'Encarregado Céu Azul', 'Consultar recibos do educando A1', () =>
    getDocs(query(collection(db, 'receipts'), where('institutionId', '==', 'ceu-azul-nacala'), where('guardianUserId', '==', guardianCeu1Uid)))
  );
  await checkDeny('2. Aluno/Encarregado', 'Encarregado Céu Azul', 'Consultar pagamentos de outro educando A2', () =>
    getDoc(doc(db, 'payments', 'pay_ceu_2_existing'))
  );

  // =========================================================================
  // 4. FUNCIONÁRIO NÃO-FINANCEIRO (SECRETARIA) BLOQUEADO EM VALIDAÇÕES/CONTAS
  // =========================================================================
  await signInWithEmailAndPassword(auth, SEC_CEU_EMAIL, TEST_PASS);
  await checkDeny('3. RBAC Financeiro', 'Secretaria Céu Azul', 'Aprovar pagamento (somente FINANCEIRO/DIRETOR)', () =>
    updateDoc(doc(db, 'payments', 'pay_ceu_1_submitted_new'), { status: 'PAGO', serviceReleased: true })
  );
  await checkDeny('3. RBAC Financeiro', 'Secretaria Céu Azul', 'Emitir recibo em receipts', () =>
    setDoc(doc(db, 'receipts', 'rcp_sec_forbidden'), {
      id: 'rcp_sec_forbidden',
      institutionId: 'ceu-azul-nacala',
      paymentId: 'pay_ceu_1_submitted_new',
      amount: 2500
    })
  );
  await checkDeny('3. RBAC Financeiro', 'Secretaria Céu Azul', 'Gerir receivingAccounts do centro', () =>
    setDoc(doc(db, 'institutions', 'ceu-azul-nacala', 'receivingAccounts', 'rec_sec_forbidden'), {
      id: 'rec_sec_forbidden',
      institutionId: 'ceu-azul-nacala',
      channel: 'M-Pesa',
      accountNumber: '840000000'
    })
  );

  // =========================================================================
  // 5. ISOLAMENTO MULTI-INSTITUCIONAL FINANCEIRO: CÉU AZUL <-> CFTPM <-> PENIEL
  // =========================================================================
  await signInWithEmailAndPassword(auth, FIN_CEU_EMAIL, TEST_PASS);

  await checkAllow('4. Financeiro & Multi-Tenant', 'Financeiro Céu Azul', 'Ler receivingAccounts próprios (Céu Azul)', () =>
    getDocs(collection(db, 'institutions', 'ceu-azul-nacala', 'receivingAccounts'))
  );
  await checkAllow('4. Financeiro & Multi-Tenant', 'Financeiro Céu Azul', 'Aprovar pagamento em Céu Azul', () =>
    updateDoc(doc(db, 'payments', 'pay_ceu_1_submitted_new'), {
      status: 'PAGO',
      receiptNumber: 'REC-2026-0099',
      receiptId: 'rcp-pay_ceu_1_submitted_new',
      serviceReleased: true
    })
  );
  await checkAllow('4. Financeiro & Multi-Tenant', 'Financeiro Céu Azul', 'Emitir recibo único em Céu Azul', () =>
    setDoc(doc(db, 'receipts', 'rcp-pay_ceu_1_submitted_new'), {
      id: 'rcp-pay_ceu_1_submitted_new',
      institutionId: 'ceu-azul-nacala',
      paymentId: 'pay_ceu_1_submitted_new',
      receiptNumber: 'REC-2026-0099',
      studentId: 'stu_ceu_1',
      studentUserId: alunoCeu1Uid,
      amount: 2500,
      status: 'Emitido'
    })
  );
  await checkAllow('4. Financeiro & Multi-Tenant', 'Financeiro Céu Azul', 'Atualizar apenas financialSettings em Céu Azul', () =>
    updateDoc(doc(db, 'institutions', 'ceu-azul-nacala'), {
      financialSettings: { currency: 'MT', mpesaNumber: '849990001', emolaNumber: '869990001', mkeshNumber: '829990001' },
      updatedAt: new Date().toISOString()
    })
  );
  await checkDeny('4. Financeiro & Multi-Tenant', 'Financeiro Céu Azul', 'Tentar escrever campos privados em publicInstitutions/ceu-azul (bloqueio de vazamento)', () =>
    setDoc(doc(db, 'publicInstitutions', 'ceu-azul'), {
      institutionId: 'ceu-azul-nacala',
      slug: 'ceu-azul',
      mpesaNumber: '849990001'
    })
  );

  // Cruzamentos interditos Céu Azul -> CFTPM / Peniel
  await checkDeny('4. Financeiro & Multi-Tenant', 'Financeiro Céu Azul', 'Ler receivingAccounts de CFTPM', () =>
    getDocs(collection(db, 'institutions', 'inst-1', 'receivingAccounts'))
  );
  await checkDeny('4. Financeiro & Multi-Tenant', 'Financeiro Céu Azul', 'Ler pagamento de CFTPM', () =>
    getDoc(doc(db, 'payments', 'pay_cftpm_pending'))
  );
  await checkDeny('4. Financeiro & Multi-Tenant', 'Financeiro Céu Azul', 'Ler pagamento de Peniel', () =>
    getDoc(doc(db, 'payments', 'pay_peniel_pending'))
  );
  await checkDeny('4. Financeiro & Multi-Tenant', 'Financeiro Céu Azul', 'Apagar recibo emitido (preservação obrigatória)', () =>
    deleteDoc(doc(db, 'receipts', 'rcp-pay_ceu_1_submitted_new'))
  );

  // Financeiro CFTPM
  await signInWithEmailAndPassword(auth, FIN_CFTPM_EMAIL, TEST_PASS);
  await checkAllow('4. Financeiro & Multi-Tenant', 'Financeiro CFTPM', 'Ler receivingAccounts de CFTPM', () =>
    getDocs(collection(db, 'institutions', 'inst-1', 'receivingAccounts'))
  );
  await checkAllow('4. Financeiro & Multi-Tenant', 'Financeiro CFTPM', 'Aprovar pagamento de CFTPM', () =>
    updateDoc(doc(db, 'payments', 'pay_cftpm_pending'), { status: 'PAGO', receiptNumber: 'REC-CF-001', serviceReleased: true })
  );
  await checkDeny('4. Financeiro & Multi-Tenant', 'Financeiro CFTPM', 'Ler pagamento de Céu Azul', () =>
    getDoc(doc(db, 'payments', 'pay_ceu_1_approved'))
  );
  await checkDeny('4. Financeiro & Multi-Tenant', 'Financeiro CFTPM', 'Ler receivingAccounts de Peniel', () =>
    getDocs(collection(db, 'institutions', 'inst-peniel', 'receivingAccounts'))
  );

  // Financeiro Peniel
  await signInWithEmailAndPassword(auth, FIN_PENIEL_EMAIL, TEST_PASS);
  await checkAllow('4. Financeiro & Multi-Tenant', 'Financeiro Peniel', 'Ler receivingAccounts de Peniel', () =>
    getDocs(collection(db, 'institutions', 'inst-peniel', 'receivingAccounts'))
  );
  await checkAllow('4. Financeiro & Multi-Tenant', 'Financeiro Peniel', 'Aprovar pagamento de Peniel', () =>
    updateDoc(doc(db, 'payments', 'pay_peniel_pending'), { status: 'PAGO', receiptNumber: 'REC-PN-001', serviceReleased: true })
  );
  await checkDeny('4. Financeiro & Multi-Tenant', 'Financeiro Peniel', 'Ler pagamento de Céu Azul', () =>
    getDoc(doc(db, 'payments', 'pay_ceu_1_approved'))
  );
  await checkDeny('4. Financeiro & Multi-Tenant', 'Financeiro Peniel', 'Ler pagamento de CFTPM', () =>
    getDoc(doc(db, 'payments', 'pay_cftpm_pending'))
  );

  // Super Admin preserva integridade (não consegue apagar recibo mesmo sendo Super Admin)
  await signInWithEmailAndPassword(auth, SUPER_EMAIL, TEST_PASS);
  await checkDeny('5. Preservação Histórica', 'Super Admin', 'Apagar recibo oficial (delete: if false)', () =>
    deleteDoc(doc(db, 'receipts', 'rcp-pay_ceu_1_approved'))
  );
  await checkAllow('5. Preservação Histórica', 'Super Admin', 'Confirmar preservação dos recibos iniciais de Céu Azul', async () => {
    const r1 = await getDoc(doc(db, 'receipts', 'rcp-pay_ceu_1_approved'));
    const r2 = await getDoc(doc(db, 'receipts', 'rcp-pay_ceu_2_existing'));
    assertCondition('5. Preservação Histórica', 'Super Admin', 'Ambos recibos prévios preservados', r1.exists() && r2.exists(), 'r1+r2 existentes');
    return r1;
  });

  // Impressão do relatório
  console.log('\n================ RESULTADOS DOS TESTES FASE C (EMULATOR) ================');
  for (const r of results) {
    const badge = r.passed ? '[PASS]' : '[FAIL]';
    console.log(`${badge} #${String(r.id).padStart(2, '0')} | ${r.category} | ${r.actor} | ${r.label} -> ${r.detail}`);
  }
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;
  console.log(`\nResumo Fase C: ${passedCount}/${results.length} aprovados, ${failedCount} falhos.`);

  await deleteApp(app);
  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Erro fatal na suíte Fase C:', err);
  process.exit(1);
});
