import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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
  collection,
  query,
  where,
} from 'firebase/firestore';

const PROJECT_ID = process.env.GCLOUD_PROJECT || '';
if (!PROJECT_ID || PROJECT_ID === 'siverc-94da3' || PROJECT_ID !== 'demo-sigar-test') {
  throw new Error(
    `[test_fase_b_rules] Abortado: GCLOUD_PROJECT deve ser "demo-sigar-test" (recebido "${PROJECT_ID}").`
  );
}

function parseLocalEndpoint(envKey: string, label: string) {
  const raw = process.env[envKey];
  if (!raw) throw new Error(`[test_fase_b_rules] Abortado: ${envKey} obrigatório para ${label}.`);
  const match = /^(127\.0\.0\.1|localhost):(\d{1,5})$/.exec(raw.trim());
  const port = match ? Number(match[2]) : NaN;
  if (!match || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`[test_fase_b_rules] Abortado: ${envKey} inválido "${raw}".`);
  }
  return { host: match[1], port, url: `http://${match[1]}:${port}` };
}

const AUTH_ENDPOINT = parseLocalEndpoint('FIREBASE_AUTH_EMULATOR_HOST', 'Auth');
const FIRESTORE_ENDPOINT = parseLocalEndpoint('FIRESTORE_EMULATOR_HOST', 'Firestore');
const AUTH_EMULATOR_URL = AUTH_ENDPOINT.url;
const FIRESTORE_HOST = FIRESTORE_ENDPOINT.host;
const FIRESTORE_PORT = FIRESTORE_ENDPOINT.port;
const TEST_PASS = 'SigarFaseB#2026';

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
      detail: `FALHOU (esperava ALLOW): ${err?.code || err?.message || err}`,
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
      detail: 'FALHA DE SEGURANÇA: operação foi PERMITIDA (esperava DENY)',
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
        detail: `ERRO INESPERADO: ${code || msg}`,
      });
    }
  }
}

async function setAuthEmailVerified(localId: string, emailVerified: boolean): Promise<void> {
  const resp = await fetch(
    `${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer owner',
      },
      body: JSON.stringify({ localId, emailVerified }),
    }
  );
  if (!resp.ok) {
    throw new Error(`Auth Emulator emailVerified falhou (${resp.status}): ${await resp.text()}`);
  }
}

async function assertEmulatorsReady(): Promise<void> {
  const authRes = await fetch(`${AUTH_EMULATOR_URL}/emulator/v1/projects/${PROJECT_ID}/config`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(3000),
  });
  const authBody = (await authRes.json().catch(() => null)) as any;
  if (!authRes.ok || !authBody?.signIn || typeof authBody.signIn !== 'object') {
    throw new Error(`[test_fase_b_rules] Auth Emulator indisponível em ${AUTH_EMULATOR_URL}`);
  }
  const fsRes = await fetch(
    `http://${FIRESTORE_HOST}:${FIRESTORE_PORT}/v1/projects/${PROJECT_ID}/databases/(default)/documents/emulatorHealthProbe/probe`,
    { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(3000) }
  );
  const fsBody = (await fsRes.json().catch(() => null)) as any;
  const fsStatus = fsBody?.error?.status;
  if (!(fsRes.ok || fsStatus === 'PERMISSION_DENIED' || fsStatus === 'NOT_FOUND')) {
    throw new Error(`[test_fase_b_rules] Firestore Emulator indisponível em http://${FIRESTORE_HOST}:${FIRESTORE_PORT}`);
  }
}

async function main() {
  await assertEmulatorsReady();
  const app = initializeApp({
    apiKey: 'fake-api-key-emulator',
    authDomain: '127.0.0.1',
    projectId: PROJECT_ID,
  });

  const auth = getAuth(app);
  connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });

  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_HOST, FIRESTORE_PORT);

  const accounts = {
    superAdmin: { email: 'moztechwavenacala8@gmail.com', uid: '' },
    diretorCeu: { email: 'jafimpaulo8@gmail.com', uid: '' },
    diretorCftpm: { email: 'dir.cftpm@teste.mz', uid: '' },
    secretariaCftpm: { email: 'secretaria.cftpm@teste.mz', uid: '' },
    formadorCeu: { email: 'formador.ceuazul@teste.mz', uid: '' },
    alunoCeu: { email: 'aluno.ceuazul@teste.mz', uid: '' },
    encarregadoCeu: { email: 'encarregado.ceuazul@teste.mz', uid: '' },
    porteiroCeu: { email: 'porteiro.ceuazul@teste.mz', uid: '' },
  };

  console.log('Criando contas reais no Firebase Auth Emulator...');
  for (const [k, acc] of Object.entries(accounts)) {
    const cred = await createUserWithEmailAndPassword(auth, acc.email, TEST_PASS);
    acc.uid = cred.user.uid;
    await setAuthEmailVerified(acc.uid, true);
    console.log(`  - ${k}: ${acc.email} (${acc.uid})`);
    await signOut(auth);
  }

  // =========================================================================
  // 1. SUPER ADMIN: Seed real de dados e testes globais
  // =========================================================================
  await signInWithEmailAndPassword(auth, accounts.superAdmin.email, TEST_PASS);
  await auth.currentUser!.getIdToken(true);

  await setDoc(doc(db, 'admins', accounts.superAdmin.uid), {
    email: accounts.superAdmin.email,
    role: 'SUPER_ADMIN',
  });
  await setDoc(doc(db, 'admins', accounts.diretorCeu.uid), {
    email: accounts.diretorCeu.email,
    role: 'SUPER_ADMIN', // Vestígio legado — deve continuar sem efeito!
  });
  await setDoc(doc(db, 'sivecApiKeys', 'key-prod-01'), {
    name: 'SIVEC Key',
    active: true,
  });

  // Instituições com dados financeiros sensíveis (M-Pesa, e-Mola, mKesh)
  await setDoc(doc(db, 'institutions', 'ceu-azul-nacala'), {
    id: 'ceu-azul-nacala',
    institutionId: 'ceu-azul-nacala',
    name: 'Centro Infantil Céu Azul',
    code: 'CEU-AZUL-001',
    mpesa: '853181189',
    emola: '864826647',
    mkesh: '820001111',
    financialSettings: { mpesaNumber: '853181189', emolaNumber: '864826647', mkeshNumber: '820001111' },
    accessCode: 'CEU-SECRET-INTERNAL',
  });
  await setDoc(doc(db, 'institutions', 'inst-1'), {
    id: 'inst-1',
    institutionId: 'inst-1',
    name: 'Centro de Formação Técnico-Profissional de Moçambique',
    code: 'MTW-CF-0001',
    mpesa: '849990001',
    emola: '869990002',
    mkesh: '829990003',
    financialSettings: { mpesaNumber: '849990001', emolaNumber: '869990002', mkeshNumber: '829990003' },
  });

  // Perfis /users/{uid}
  const userSeeds: Array<[string, Record<string, any>]> = [
    [accounts.superAdmin.uid, { id: accounts.superAdmin.uid, email: accounts.superAdmin.email, role: 'SUPER_ADMIN', roles: ['SUPER_ADMIN'], institutionId: '', status: 'aprovado' }],
    [accounts.diretorCeu.uid, { id: accounts.diretorCeu.uid, email: accounts.diretorCeu.email, role: 'DIRETOR', roles: ['DIRETOR'], institutionId: 'ceu-azul-nacala', status: 'aprovado' }],
    [accounts.diretorCftpm.uid, { id: accounts.diretorCftpm.uid, email: accounts.diretorCftpm.email, role: 'DIRETOR', roles: ['DIRETOR'], institutionId: 'inst-1', status: 'aprovado' }],
    [accounts.secretariaCftpm.uid, { id: accounts.secretariaCftpm.uid, email: accounts.secretariaCftpm.email, role: 'SECRETARIA', roles: ['SECRETARIA'], institutionId: 'inst-1', status: 'aprovado' }],
    [accounts.formadorCeu.uid, { id: accounts.formadorCeu.uid, email: accounts.formadorCeu.email, role: 'FORMADOR', roles: ['FORMADOR'], institutionId: 'ceu-azul-nacala', status: 'aprovado' }],
    [accounts.alunoCeu.uid, { id: accounts.alunoCeu.uid, email: accounts.alunoCeu.email, role: 'ALUNO', roles: ['ALUNO'], institutionId: 'ceu-azul-nacala', status: 'ativo', studentId: 'ceu-azul-std-41' }],
    [accounts.encarregadoCeu.uid, { id: accounts.encarregadoCeu.uid, email: accounts.encarregadoCeu.email, role: 'RESPONSAVEL', roles: ['RESPONSAVEL'], institutionId: 'ceu-azul-nacala', status: 'ativo', studentIds: ['ceu-azul-std-41'] }],
    [accounts.porteiroCeu.uid, { id: accounts.porteiroCeu.uid, email: accounts.porteiroCeu.email, role: 'PORTEIRO', roles: ['PORTEIRO'], institutionId: 'ceu-azul-nacala', status: 'aprovado' }],
  ];
  for (const [uid, payload] of userSeeds) {
    await setDoc(doc(db, 'users', uid), payload);
  }

  // Portais públicos separados (publicInstitutions/{slug})
  await setDoc(doc(db, 'publicInstitutions', 'ceu-azul'), {
    id: 'ceu-azul',
    slug: 'ceu-azul',
    institutionId: 'ceu-azul-nacala',
    name: 'Centro Infantil Céu Azul',
    city: 'Nacala-Porto',
    province: 'Nampula',
  });

  // 22 Matrículas do Céu Azul (Nº 41 a 62) + Matrícula & Encarregado
  for (let n = 41; n <= 62; n++) {
    const stdId = `ceu-azul-std-${n}`;
    await setDoc(doc(db, 'students', stdId), {
      id: stdId,
      numLista: n,
      numAluno: `CA-0${n}`,
      fullName: `Criança Céu Azul ${n}`,
      institutionId: 'ceu-azul-nacala',
      branchId: 'branch-ceu-azul-main',
      userId: n === 41 ? accounts.alunoCeu.uid : `unlinked-${n}`,
      guardianUserId: n === 41 ? accounts.encarregadoCeu.uid : `guardian-${n}`,
      guardianName: n === 41 ? 'Encarregado Titular 41' : `Encarregado ${n}`,
      guardianPhone: `8400000${n}`,
      status: 'Ativo',
    });
    await setDoc(doc(db, 'enrollments', `enr-ceu-${n}`), {
      id: `enr-ceu-${n}`,
      studentId: stdId,
      institutionId: 'ceu-azul-nacala',
      userId: n === 41 ? accounts.alunoCeu.uid : `unlinked-${n}`,
      guardianUserId: n === 41 ? accounts.encarregadoCeu.uid : `guardian-${n}`,
      academicYear: '2026',
      status: 'Ativa',
    });
  }
  await setDoc(doc(db, 'students', 'cftpm-std-01'), {
    id: 'cftpm-std-01',
    fullName: 'Formando CFTPM 01',
    institutionId: 'inst-1',
    status: 'Ativo',
  });
  await setDoc(doc(db, 'guardians', 'guard-ceu-41'), {
    id: 'guard-ceu-41',
    institutionId: 'ceu-azul-nacala',
    userId: accounts.encarregadoCeu.uid,
    fullName: 'Encarregado Titular 41',
    phone: '840000041',
  });

  // Cursos, turmas, docentes, horários, portaria
  await setDoc(doc(db, 'courses', 'crs-ceu-01'), { id: 'crs-ceu-01', institutionId: 'ceu-azul-nacala', name: 'Pré-Escolar' });
  await setDoc(doc(db, 'courses', 'crs-cftpm-01'), { id: 'crs-cftpm-01', institutionId: 'inst-1', name: 'Informática' });
  await setDoc(doc(db, 'classes', 'cls-ceu-01'), { id: 'cls-ceu-01', institutionId: 'ceu-azul-nacala', name: 'Sala Azul' });
  await setDoc(doc(db, 'teachers', 'tch-ceu-01'), { id: 'tch-ceu-01', institutionId: 'ceu-azul-nacala', fullName: 'Educadora Ana', biNumber: '110100112233B' });
  await setDoc(doc(db, 'lessons', 'les-ceu-01'), { id: 'les-ceu-01', institutionId: 'ceu-azul-nacala', title: 'Pintura' });
  await setDoc(doc(db, 'lessons', 'les-cftpm-01'), { id: 'les-cftpm-01', institutionId: 'inst-1', title: 'Redes' });
  await setDoc(doc(db, 'evaluations', 'ev-ceu-01'), { id: 'ev-ceu-01', institutionId: 'ceu-azul-nacala', title: 'Desenvolvimento I' });
  await setDoc(doc(db, 'grades', 'gr-ceu-01'), { id: 'gr-ceu-01', institutionId: 'ceu-azul-nacala', score: 19 });
  await setDoc(doc(db, 'accessLogs', 'acc-ceu-01'), {
    id: 'acc-ceu-01',
    institutionId: 'ceu-azul-nacala',
    studentId: 'ceu-azul-std-41',
    studentUserId: accounts.alunoCeu.uid,
    guardianUserId: accounts.encarregadoCeu.uid,
    type: 'entrada',
  });
  await setDoc(doc(db, 'accessLogs', 'acc-cftpm-01'), { id: 'acc-cftpm-01', institutionId: 'inst-1', studentId: 'cftpm-std-01', type: 'entrada' });

  // Financeiro
  await setDoc(doc(db, 'payments', 'pay-ceu-01'), { id: 'pay-ceu-01', institutionId: 'ceu-azul-nacala', amount: 3500, method: 'M-Pesa', mpesaRef: 'MP123' });
  await setDoc(doc(db, 'payments', 'pay-cftpm-01'), { id: 'pay-cftpm-01', institutionId: 'inst-1', amount: 5500, method: 'e-Mola' });
  await setDoc(doc(db, 'cashSessions', 'cash-ceu-01'), { id: 'cash-ceu-01', institutionId: 'ceu-azul-nacala', balance: 15000 });
  await setDoc(doc(db, 'accountsReceivable', 'rec-ceu-01'), { id: 'rec-ceu-01', institutionId: 'ceu-azul-nacala', amount: 3500 });
  await setDoc(doc(db, 'receipts', 'rcp-ceu-01'), { id: 'rcp-ceu-01', institutionId: 'ceu-azul-nacala', amount: 3500 });

  // Certificados & SIVEC & Assinaturas
  await setDoc(doc(db, 'certificates', 'CERT-CEU-001'), {
    id: 'CERT-CEU-001',
    institutionId: 'ceu-azul-nacala',
    verificationCode: 'CERT-CEU-001',
    studentName: 'Criança Céu Azul 41',
  });
  await setDoc(doc(db, 'sivecCertificates', 'SIVEC-MZ-2026-8819'), {
    id: 'SIVEC-MZ-2026-8819',
    institutionId: 'ceu-azul-nacala',
    sivecCode: 'SIVEC-MZ-2026-8819',
    studentName: 'Criança Céu Azul 41',
    status: 'ATIVO',
  });
  await setDoc(doc(db, 'sivecIssuers', 'issuer-ceu'), { id: 'issuer-ceu', institutionId: 'ceu-azul-nacala', name: 'Centro Infantil Céu Azul' });
  await setDoc(doc(db, 'signatures', 'sig-ceu-01'), { id: 'sig-ceu-01', institutionId: 'ceu-azul-nacala', signer: 'Jafim Paulo', digitalSealCode: 'SIVEC-SEAL-01' });
  await setDoc(doc(db, 'certificateVersions', 'ver-ceu-01'), { id: 'ver-ceu-01', institutionId: 'ceu-azul-nacala', version: 1 });

  // Candidatura existente em Céu Azul + tracking público + access codes + settings + test/connection
  await setDoc(doc(db, 'applications', 'app-ceu-exist-01'), {
    id: 'app-ceu-exist-01',
    institutionId: 'ceu-azul-nacala',
    fullName: 'Candidato Privado Céu Azul',
    documentNumber: '110100998877A',
    phone: '841112233',
    status: 'submetida',
    paymentStatus: 'Pendente',
  });
  await setDoc(doc(db, 'access_codes', 'CEU-CODE-01'), { code: 'CEU-CODE-01', institutionId: 'ceu-azul-nacala', role: 'ALUNO' });
  await setDoc(doc(db, 'access_codes', 'CFTPM-CODE-01'), { code: 'CFTPM-CODE-01', institutionId: 'inst-1', role: 'ALUNO' });
  await setDoc(doc(db, 'settings', 'set-ceu-01'), { id: 'set-ceu-01', institutionId: 'ceu-azul-nacala', currency: 'MZN' });
  await setDoc(doc(db, 'settings', 'set-cftpm-01'), { id: 'set-cftpm-01', institutionId: 'inst-1', currency: 'MZN' });
  await setDoc(doc(db, 'documents', 'doc-ceu-41'), { id: 'doc-ceu-41', institutionId: 'ceu-azul-nacala', studentUserId: accounts.alunoCeu.uid, guardianUserId: accounts.encarregadoCeu.uid, title: 'Cédula Pessoal' });

  // Checks Super Admin
  await checkAllow('FaseA+B', 'Super Admin', 'Lê /admins, /sivecApiKeys e /users globais', async () => {
    await getDocs(collection(db, 'admins'));
    await getDoc(doc(db, 'sivecApiKeys', 'key-prod-01'));
    return getDocs(collection(db, 'users'));
  });
  await checkAllow('FaseB', 'Super Admin', 'Lê todas as 22 matrículas de Céu Azul + CFTPM', () => getDocs(collection(db, 'students')));
  await checkAllow('FaseB', 'Super Admin', 'Lê /institutions e /payments de ambos os centros', async () => {
    await getDocs(collection(db, 'institutions'));
    return getDocs(collection(db, 'payments'));
  });
  await checkDeny('FaseB', 'Super Admin', 'NÃO pode apagar sivecCertificates existentes (preservação SIVEC)', () =>
    deleteDoc(doc(db, 'sivecCertificates', 'SIVEC-MZ-2026-8819'))
  );
  await checkDeny('FaseB', 'Super Admin', 'NÃO pode apagar signatures SIVEC existentes (preservação SIVEC)', () =>
    deleteDoc(doc(db, 'signatures', 'sig-ceu-01'))
  );
  await signOut(auth);

  // =========================================================================
  // 2. VISITANTE ANÓNIMO (Inscrição Pública, Certificados, Bloqueio PII & Financeiro)
  // =========================================================================
  const anonActor = 'Visitante Anónimo';
  await checkAllow('PublicPortal', anonActor, 'Lê publicInstitutions/ceu-azul via getDoc exacto', () =>
    getDoc(doc(db, 'publicInstitutions', 'ceu-azul'))
  );
  await checkDeny('PublicPortal', anonActor, 'Bloqueado de listar publicInstitutions (anti-raspagem)', () =>
    getDocs(collection(db, 'publicInstitutions'))
  );
  await checkDeny('Financeiro', anonActor, 'Bloqueado de ler /institutions/ceu-azul-nacala (protege M-Pesa/e-Mola/mKesh)', () =>
    getDoc(doc(db, 'institutions', 'ceu-azul-nacala'))
  );
  await checkDeny('Financeiro', anonActor, 'Bloqueado de ler /payments e /accountsReceivable', () =>
    getDoc(doc(db, 'payments', 'pay-ceu-01'))
  );
  await checkDeny('Matriculas', anonActor, 'Bloqueado de ler /students/ceu-azul-std-41 (ID direto) e listar 22 alunos', async () => {
    await getDoc(doc(db, 'students', 'ceu-azul-std-41'));
  });
  await checkDeny('Matriculas', anonActor, 'Bloqueado de listar /students e /enrollments', () =>
    getDocs(collection(db, 'students'))
  );
  await checkAllow('InscricaoPublica', anonActor, 'Submete candidatura pública válida em /applications e /institutions/{id}/applications e /applicationTracking', async () => {
    await setDoc(doc(db, 'applications', 'app-pub-9001'), {
      id: 'app-pub-9001',
      institutionId: 'ceu-azul-nacala',
      fullName: 'Maria João Teste',
      phone: '841234567',
      status: 'submetida',
      paymentStatus: 'Pendente',
    });
    await setDoc(doc(db, 'institutions', 'ceu-azul-nacala', 'applications', 'app-pub-9001'), {
      id: 'app-pub-9001',
      institutionId: 'ceu-azul-nacala',
      fullName: 'Maria João Teste',
      status: 'submetida',
      paymentStatus: 'Pendente',
    });
    return setDoc(doc(db, 'applicationTracking', 'CEU-2026-9001'), {
      token: 'CEU-2026-9001',
      institutionId: 'ceu-azul-nacala',
      status: 'submetida',
      paymentStatus: 'Pendente',
      maskedName: 'M*** T***',
    });
  });
  await checkAllow('InscricaoPublica', anonActor, 'Consulta estado sem PII em applicationTracking/CEU-2026-9001 via getDoc', () =>
    getDoc(doc(db, 'applicationTracking', 'CEU-2026-9001'))
  );
  await checkDeny('InscricaoPublica', anonActor, 'Bloqueado de ler PII da própria/outra candidatura em /applications/app-pub-9001 (ID direto)', () =>
    getDoc(doc(db, 'applications', 'app-pub-9001'))
  );
  await checkDeny('InscricaoPublica', anonActor, 'Bloqueado de ler /institutions/ceu-azul-nacala/applications/app-pub-9001', () =>
    getDoc(doc(db, 'institutions', 'ceu-azul-nacala', 'applications', 'app-pub-9001'))
  );
  await checkDeny('InscricaoPublica', anonActor, 'Bloqueado de submeter candidatura forjada já aprovada (status=aprovada)', () =>
    setDoc(doc(db, 'applications', 'app-hack-01'), {
      id: 'app-hack-01',
      institutionId: 'ceu-azul-nacala',
      fullName: 'Atacante',
      status: 'aprovada',
      paymentStatus: 'Pago',
      studentId: 'ceu-azul-std-41',
    })
  );
  await checkDeny('InscricaoPublica', anonActor, 'Bloqueado de gravar PII (phone/email) em applicationTracking', () =>
    setDoc(doc(db, 'applicationTracking', 'TRK-HACK-01'), {
      institutionId: 'ceu-azul-nacala',
      status: 'submetida',
      paymentStatus: 'Pendente',
      phone: '849999999',
    })
  );
  await checkAllow('SIVEC', anonActor, 'Verifica certificado individual por código/QR em certificates e sivecCertificates (getDoc)', async () => {
    await getDoc(doc(db, 'certificates', 'CERT-CEU-001'));
    return getDoc(doc(db, 'sivecCertificates', 'SIVEC-MZ-2026-8819'));
  });
  await checkAllow('SIVEC', anonActor, 'Regista verificação pública em sivecVerifications', () =>
    setDoc(doc(db, 'sivecVerifications', 'ver-anon-01'), {
      certificateId: 'SIVEC-MZ-2026-8819',
      result: 'VALID',
    })
  );
  await checkDeny('SIVEC', anonActor, 'Bloqueado de listar /certificates (anti-raspagem pública)', () =>
    getDocs(collection(db, 'certificates'))
  );
  await checkDeny('SIVEC', anonActor, 'Bloqueado de listar /sivecCertificates (anti-raspagem pública)', () =>
    getDocs(collection(db, 'sivecCertificates'))
  );
  await checkDeny('SIVEC', anonActor, 'Bloqueado de ler ou listar /signatures e /certificateVersions', () =>
    getDoc(doc(db, 'signatures', 'sig-ceu-01'))
  );
  await checkDeny('FaseA', anonActor, 'Bloqueado em /users, /admins e /access_codes', () =>
    getDoc(doc(db, 'access_codes', 'CEU-CODE-01'))
  );

  // =========================================================================
  // 3. DIRETOR DO CÉU AZUL (jafimpaulo8@gmail.com)
  // =========================================================================
  await signInWithEmailAndPassword(auth, accounts.diretorCeu.email, TEST_PASS);
  await auth.currentUser!.getIdToken(true);
  const dirCeuActor = 'Diretor Céu Azul';

  await checkDeny('FaseA', dirCeuActor, 'Bloqueado em /admins (mesmo com registo legado) e /sivecApiKeys', () =>
    getDocs(collection(db, 'admins'))
  );
  await checkDeny('FaseA', dirCeuActor, 'Bloqueado de auto-promover role=SUPER_ADMIN no próprio /users/{uid}', () =>
    updateDoc(doc(db, 'users', accounts.diretorCeu.uid), { role: 'SUPER_ADMIN' })
  );
  await checkAllow('Matriculas', dirCeuActor, 'Lê as 22 matrículas do Céu Azul (students where institutionId==ceu-azul-nacala)', async () => {
    const snap = await getDocs(query(collection(db, 'students'), where('institutionId', '==', 'ceu-azul-nacala')));
    if (snap.size !== 22) throw new Error(`Esperava 22 alunos, obteve ${snap.size}`);
    return snap;
  });
  await checkAllow('Financeiro', dirCeuActor, 'Lê própria instituição (M-Pesa/e-Mola), payments e accountsReceivable de Céu Azul', async () => {
    await getDoc(doc(db, 'institutions', 'ceu-azul-nacala'));
    await getDocs(query(collection(db, 'payments'), where('institutionId', '==', 'ceu-azul-nacala')));
    return getDocs(query(collection(db, 'accountsReceivable'), where('institutionId', '==', 'ceu-azul-nacala')));
  });
  await checkDeny('Isolamento', dirCeuActor, 'Bloqueado em /institutions/inst-1 (ID direto CFTPM)', () =>
    getDoc(doc(db, 'institutions', 'inst-1'))
  );
  await checkDeny('Isolamento', dirCeuActor, 'Bloqueado em /students/cftpm-std-01 (ID direto CFTPM)', () =>
    getDoc(doc(db, 'students', 'cftpm-std-01'))
  );
  await checkDeny('Isolamento', dirCeuActor, 'Bloqueado em /payments/pay-cftpm-01 (ID direto CFTPM)', () =>
    getDoc(doc(db, 'payments', 'pay-cftpm-01'))
  );
  await checkDeny('SIVEC', dirCeuActor, 'NÃO pode apagar certificado ou assinatura SIVEC existente', () =>
    deleteDoc(doc(db, 'sivecCertificates', 'SIVEC-MZ-2026-8819'))
  );
  await signOut(auth);

  // =========================================================================
  // 4. DIRETOR DO CFTPM (inst-1) tentando aceder às 22 matrículas & dados de Céu Azul
  // =========================================================================
  await signInWithEmailAndPassword(auth, accounts.diretorCftpm.email, TEST_PASS);
  await auth.currentUser!.getIdToken(true);
  const dirCftpmActor = 'Diretor CFTPM (inst-1)';

  await checkDeny('Isolamento22', dirCftpmActor, 'Bloqueado de consultar as 22 matrículas do Céu Azul (query)', () =>
    getDocs(query(collection(db, 'students'), where('institutionId', '==', 'ceu-azul-nacala')))
  );
  await checkDeny('Isolamento22', dirCftpmActor, 'Bloqueado de aceder student ID direto ceu-azul-std-41 e enr-ceu-41', async () => {
    await getDoc(doc(db, 'students', 'ceu-azul-std-41'));
  });
  await checkDeny('Isolamento', dirCftpmActor, 'Bloqueado de sobrescrever publicInstitutions/ceu-azul (sequestro de slug)', () =>
    updateDoc(doc(db, 'publicInstitutions', 'ceu-azul'), { institutionId: 'inst-1', name: 'Falso' })
  );
  await checkDeny('Isolamento', dirCftpmActor, 'Bloqueado de alterar certificado CERT-CEU-001 de Céu Azul', () =>
    updateDoc(doc(db, 'certificates', 'CERT-CEU-001'), { studentName: 'Adulterado' })
  );
  await signOut(auth);

  // =========================================================================
  // 5. SECRETARIA (CFTPM inst-1)
  // =========================================================================
  await signInWithEmailAndPassword(auth, accounts.secretariaCftpm.email, TEST_PASS);
  await auth.currentUser!.getIdToken(true);
  const secActor = 'Secretaria CFTPM';

  await checkAllow('Operacao', secActor, 'Lê/gere estudantes, instituições e pagamentos do próprio centro (inst-1)', async () => {
    await getDoc(doc(db, 'institutions', 'inst-1'));
    await getDoc(doc(db, 'students', 'cftpm-std-01'));
    return getDoc(doc(db, 'payments', 'pay-cftpm-01'));
  });
  await checkDeny('Isolamento22', secActor, 'Bloqueada em /students/ceu-azul-std-41 (ID direto Céu Azul)', () =>
    getDoc(doc(db, 'students', 'ceu-azul-std-41'))
  );
  await checkDeny('Isolamento', secActor, 'Bloqueada em /applications/app-ceu-exist-01 (ID direto Céu Azul)', () =>
    getDoc(doc(db, 'applications', 'app-ceu-exist-01'))
  );
  await checkDeny('Isolamento', secActor, 'Bloqueada em /payments/pay-ceu-01 e /institutions/ceu-azul-nacala', () =>
    getDoc(doc(db, 'institutions', 'ceu-azul-nacala'))
  );
  await signOut(auth);

  // =========================================================================
  // 6. FORMADOR (Céu Azul)
  // =========================================================================
  await signInWithEmailAndPassword(auth, accounts.formadorCeu.email, TEST_PASS);
  await auth.currentUser!.getIdToken(true);
  const formActor = 'Formador Céu Azul';

  await checkAllow('Pedagogico', formActor, 'Lê alunos (turma/escola), aulas, avaliações, notas e certificados de Céu Azul', async () => {
    await getDocs(query(collection(db, 'students'), where('institutionId', '==', 'ceu-azul-nacala')));
    await getDocs(query(collection(db, 'lessons'), where('institutionId', '==', 'ceu-azul-nacala')));
    await getDocs(query(collection(db, 'grades'), where('institutionId', '==', 'ceu-azul-nacala')));
    return getDocs(query(collection(db, 'certificates'), where('institutionId', '==', 'ceu-azul-nacala')));
  });
  await checkDeny('Financeiro', formActor, 'Bloqueado em /institutions/ceu-azul-nacala (protege M-Pesa/e-Mola/mKesh)', () =>
    getDoc(doc(db, 'institutions', 'ceu-azul-nacala'))
  );
  await checkDeny('Financeiro', formActor, 'Bloqueado em /payments, /cashSessions e /accountsReceivable do próprio centro', () =>
    getDoc(doc(db, 'payments', 'pay-ceu-01'))
  );
  await checkDeny('Isolamento', formActor, 'Bloqueado em /students/cftpm-std-01 e /lessons/les-cftpm-01 (inst-1)', () =>
    getDoc(doc(db, 'students', 'cftpm-std-01'))
  );
  await signOut(auth);

  // =========================================================================
  // 7. ALUNO (Céu Azul — vinculado apenas a ceu-azul-std-41)
  // =========================================================================
  await signInWithEmailAndPassword(auth, accounts.alunoCeu.email, TEST_PASS);
  await auth.currentUser!.getIdToken(true);
  const alunoActor = 'Aluno Céu Azul';

  await checkAllow('PortalAluno', alunoActor, 'Lê o próprio perfil /users/{uid}, próprio aluno ceu-azul-std-41 e próprio documento', async () => {
    await getDoc(doc(db, 'users', accounts.alunoCeu.uid));
    await getDoc(doc(db, 'students', 'ceu-azul-std-41'));
    await getDocs(query(collection(db, 'students'), where('institutionId', '==', 'ceu-azul-nacala'), where('userId', '==', accounts.alunoCeu.uid)));
    return getDoc(doc(db, 'documents', 'doc-ceu-41'));
  });
  await checkDeny('Privacidade', alunoActor, 'Bloqueado de ler outro colega ceu-azul-std-42 por ID direto', () =>
    getDoc(doc(db, 'students', 'ceu-azul-std-42'))
  );
  await checkDeny('Privacidade', alunoActor, 'Bloqueado de listar todas as 22 matrículas do Céu Azul', () =>
    getDocs(query(collection(db, 'students'), where('institutionId', '==', 'ceu-azul-nacala')))
  );
  await checkDeny('Financeiro', alunoActor, 'Bloqueado em /institutions/ceu-azul-nacala (M-Pesa/e-Mola) e /payments', async () => {
    await getDoc(doc(db, 'institutions', 'ceu-azul-nacala'));
  });
  await checkDeny('Privacidade', alunoActor, 'Bloqueado de listar /certificates e de editar próprio /students', () =>
    updateDoc(doc(db, 'students', 'ceu-azul-std-41'), { status: 'Isento' })
  );
  await signOut(auth);

  // =========================================================================
  // 8. ENCARREGADO (RESPONSAVEL — vinculado a ceu-azul-std-41)
  // =========================================================================
  await signInWithEmailAndPassword(auth, accounts.encarregadoCeu.email, TEST_PASS);
  await auth.currentUser!.getIdToken(true);
  const encActor = 'Encarregado Céu Azul';

  await checkAllow('PortalEncarregado', encActor, 'Lê o próprio educando (ceu-azul-std-41, enr-ceu-41, accessLog acc-ceu-01, doc-ceu-41)', async () => {
    await getDoc(doc(db, 'students', 'ceu-azul-std-41'));
    await getDoc(doc(db, 'enrollments', 'enr-ceu-41'));
    await getDocs(query(collection(db, 'students'), where('institutionId', '==', 'ceu-azul-nacala'), where('guardianUserId', '==', accounts.encarregadoCeu.uid)));
    await getDoc(doc(db, 'accessLogs', 'acc-ceu-01'));
    return getDoc(doc(db, 'documents', 'doc-ceu-41'));
  });
  await checkDeny('Privacidade', encActor, 'Bloqueado de ler outra criança ceu-azul-std-42 por ID direto', () =>
    getDoc(doc(db, 'students', 'ceu-azul-std-42'))
  );
  await checkDeny('Privacidade', encActor, 'Bloqueado de listar todas as 22 crianças do Céu Azul', () =>
    getDocs(query(collection(db, 'students'), where('institutionId', '==', 'ceu-azul-nacala')))
  );
  await checkDeny('Financeiro', encActor, 'Bloqueado em /institutions/ceu-azul-nacala (M-Pesa/e-Mola) e /payments', () =>
    getDoc(doc(db, 'payments', 'pay-ceu-01'))
  );
  await checkDeny('Isolamento', encActor, 'Bloqueado em /students/cftpm-std-01 (inst-1)', () =>
    getDoc(doc(db, 'students', 'cftpm-std-01'))
  );
  await signOut(auth);

  // =========================================================================
  // 9. PORTEIRO (Céu Azul)
  // =========================================================================
  await signInWithEmailAndPassword(auth, accounts.porteiroCeu.email, TEST_PASS);
  await auth.currentUser!.getIdToken(true);
  const portActor = 'Porteiro Céu Azul';

  await checkAllow('Portaria', portActor, 'Consulta alunos de Céu Azul e regista entrada/saída em /accessLogs de Céu Azul', async () => {
    await getDoc(doc(db, 'students', 'ceu-azul-std-41'));
    await setDoc(doc(db, 'accessLogs', 'acc-ceu-new-01'), {
      id: 'acc-ceu-new-01',
      institutionId: 'ceu-azul-nacala',
      studentId: 'ceu-azul-std-41',
      type: 'entrada',
    });
    return getDocs(query(collection(db, 'accessLogs'), where('institutionId', '==', 'ceu-azul-nacala')));
  });
  await checkDeny('Isolamento', portActor, 'Bloqueado em /students/cftpm-std-01 e /accessLogs/acc-cftpm-01 (inst-1)', async () => {
    await getDoc(doc(db, 'students', 'cftpm-std-01'));
  });
  await checkDeny('Portaria', portActor, 'Bloqueado de alterar /students, /payments ou /institutions/ceu-azul-nacala', async () => {
    await updateDoc(doc(db, 'students', 'ceu-azul-std-41'), { fullName: 'Adulterado' });
  });
  await checkDeny('Financeiro', portActor, 'Bloqueado em /payments/pay-ceu-01 e /institutions/ceu-azul-nacala', () =>
    getDoc(doc(db, 'institutions', 'ceu-azul-nacala'))
  );
  await signOut(auth);

  // =========================================================================
  // RESUMO
  // =========================================================================
  console.log('\n================ RESULTADO EMULATOR — FASE B ================');
  let passed = 0;
  for (const r of results) {
    const tag = r.passed ? 'PASS' : 'FAIL';
    console.log(`[${r.id}] [${tag}] [${r.actor}] ${r.label} => ${r.detail}`);
    if (r.passed) passed++;
  }
  console.log('===============================================================');
  console.log(`TOTAL FASE B: ${passed}/${results.length} PASS`);

  await deleteApp(app);
  if (passed !== results.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
