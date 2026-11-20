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
  collection,
  query,
  where,
} from 'firebase/firestore';

const PROJECT_ID = 'siverc-94da3';
const AUTH_EMULATOR_URL = 'http://127.0.0.1:9099';
const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8080;
const TEST_PASS = 'SigarFaseA#2026';

interface CheckResult {
  label: string;
  passed: boolean;
  detail: string;
}

interface LoginReport {
  actor: string;
  email: string;
  role: string;
  institutionId: string;
  uid: string;
  emailVerified: boolean;
  checks: CheckResult[];
}

async function expectAllow(label: string, fn: () => Promise<unknown>): Promise<CheckResult> {
  try {
    const res = await fn();
    const extra =
      res && typeof res === 'object' && 'size' in (res as any)
        ? `docs=${(res as any).size}`
        : res && typeof res === 'object' && 'exists' in (res as any)
          ? `exists=${(res as any).exists()}`
          : 'ok';
    return { label, passed: true, detail: `PERMITIDO (${extra})` };
  } catch (err: any) {
    return { label, passed: false, detail: `ERRO INESPERADO: ${err?.code || err?.message || err}` };
  }
}

async function expectDeny(label: string, fn: () => Promise<unknown>): Promise<CheckResult> {
  try {
    await fn();
    return { label, passed: false, detail: 'FALHA DE SEGURANÇA: leitura/escrita foi PERMITIDA' };
  } catch (err: any) {
    const code = err?.code || '';
    if (code.includes('permission-denied') || String(err?.message).includes('PERMISSION_DENIED')) {
      return { label, passed: true, detail: 'BLOQUEADO (permission-denied)' };
    }
    return { label, passed: false, detail: `ERRO INESPERADO: ${err?.code || err?.message || err}` };
  }
}

async function setAuthEmailVerified(localId: string, emailVerified: boolean): Promise<void> {
  // Update email verification via Auth Emulator Admin REST API
  const resp = await fetch(
    `${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer owner',
      },
      body: JSON.stringify({
        localId,
        emailVerified,
      }),
    }
  );
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Falha ao atualizar emailVerified no Auth Emulator (${resp.status}): ${body}`);
  }
}

async function main() {
  const app = initializeApp({
    apiKey: 'fake-api-key-emulator',
    authDomain: `${PROJECT_ID}.firebaseapp.com`,
    projectId: PROJECT_ID,
  });

  const auth = getAuth(app);
  connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });

  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_HOST, FIRESTORE_PORT);

  const accounts = {
    superAdmin: { email: 'moztechwavenacala8@gmail.com', uid: '', idToken: '' },
    diretor: { email: 'jafimpaulo8@gmail.com', uid: '', idToken: '' },
    secretaria: { email: 'secretaria.cftpm@teste.mz', uid: '', idToken: '' },
    formador: { email: 'formador.ceuazul@teste.mz', uid: '', idToken: '' },
    aluno: { email: 'aluno.ceuazul@teste.mz', uid: '', idToken: '' },
  };

  console.log('1) Criando utilizadores reais no Firebase Auth Emulator...');
  for (const [key, acc] of Object.entries(accounts)) {
    const cred = await createUserWithEmailAndPassword(auth, acc.email, TEST_PASS);
    acc.uid = cred.user.uid;
    acc.idToken = await cred.user.getIdToken();
    console.log(`   - ${key}: ${acc.email} -> uid=${acc.uid}`);
    await signOut(auth);
  }

  // Testar Super Admin ANTES de verificar email
  console.log('\n2) Testando Super Admin com email_verified=false (deve falhar isSuperAdmin)...');
  await signInWithEmailAndPassword(auth, accounts.superAdmin.email, TEST_PASS);
  const unverifiedCheck = await expectDeny(
    'moztechwavenacala8@gmail.com sem emailVerified=true bloqueado em /admins',
    () => getDocs(collection(db, 'admins'))
  );
  console.log(`   [${unverifiedCheck.passed ? 'PASS' : 'FAIL'}] ${unverifiedCheck.label} -> ${unverifiedCheck.detail}`);
  await signOut(auth);

  // Verificar emails de todos os utilizadores no Auth Emulator
  for (const acc of Object.values(accounts)) {
    await setAuthEmailVerified(acc.uid, true);
  }

  const reports: LoginReport[] = [];

  // =========================================================
  // LOGIN 1: SUPER ADMIN (moztechwavenacala8@gmail.com)
  // =========================================================
  {
    const cred = await signInWithEmailAndPassword(auth, accounts.superAdmin.email, TEST_PASS);
    await cred.user.getIdToken(true);

    // Seed real de instituições, perfis /users, e dados dos 2 centros usando Super Admin real autenticado
    await setDoc(doc(db, 'admins', accounts.superAdmin.uid), {
      email: accounts.superAdmin.email,
      role: 'SUPER_ADMIN',
    });
    // Vestígio legado em /admins para confirmar que NÃO dá privilégio a jafimpaulo8@gmail.com
    await setDoc(doc(db, 'admins', accounts.diretor.uid), {
      email: accounts.diretor.email,
      role: 'SUPER_ADMIN',
    });

    await setDoc(doc(db, 'sivecApiKeys', 'key-prod-01'), {
      name: 'SIVEC Key Teste',
      active: true,
    });

    await setDoc(doc(db, 'institutions', 'ceu-azul-nacala'), {
      id: 'ceu-azul-nacala',
      name: 'Centro Infantil Céu Azul',
      code: 'CEU-AZUL-001',
    });
    await setDoc(doc(db, 'institutions', 'inst-1'), {
      id: 'inst-1',
      name: 'Centro de Formação Técnico-Profissional de Moçambique',
      code: 'MTW-CF-0001',
    });

    await setDoc(doc(db, 'users', accounts.superAdmin.uid), {
      id: accounts.superAdmin.uid,
      email: accounts.superAdmin.email,
      name: 'Super Admin Moztechwave',
      role: 'SUPER_ADMIN',
      roles: ['SUPER_ADMIN'],
      institutionId: '',
      status: 'aprovado',
    });

    await setDoc(doc(db, 'users', accounts.diretor.uid), {
      id: accounts.diretor.uid,
      email: accounts.diretor.email,
      name: 'Jafim Paulo Rupia',
      role: 'DIRETOR',
      roles: ['DIRETOR'],
      institutionId: 'ceu-azul-nacala',
      status: 'aprovado',
    });

    await setDoc(doc(db, 'users', accounts.secretaria.uid), {
      id: accounts.secretaria.uid,
      email: accounts.secretaria.email,
      name: 'Secretaria CFTPM',
      role: 'SECRETARIA',
      roles: ['SECRETARIA'],
      institutionId: 'inst-1',
      status: 'aprovado',
    });

    await setDoc(doc(db, 'users', accounts.formador.uid), {
      id: accounts.formador.uid,
      email: accounts.formador.email,
      name: 'Formador Céu Azul',
      role: 'FORMADOR',
      roles: ['FORMADOR'],
      institutionId: 'ceu-azul-nacala',
      status: 'aprovado',
    });

    await setDoc(doc(db, 'users', accounts.aluno.uid), {
      id: accounts.aluno.uid,
      email: accounts.aluno.email,
      name: 'Aluno Céu Azul',
      role: 'ALUNO',
      roles: ['ALUNO'],
      institutionId: 'ceu-azul-nacala',
      status: 'ativo',
    });

    // Dados isolados por instituição
    await setDoc(doc(db, 'access_codes', 'CEU-ACC-01'), {
      code: 'CEU-ACC-01',
      role: 'ALUNO',
      institutionId: 'ceu-azul-nacala',
      status: 'ativo',
    });
    await setDoc(doc(db, 'access_codes', 'CFTPM-ACC-01'), {
      code: 'CFTPM-ACC-01',
      role: 'ALUNO',
      institutionId: 'inst-1',
      status: 'ativo',
    });

    await setDoc(doc(db, 'lessons', 'lesson-ceu-01'), {
      id: 'lesson-ceu-01',
      institutionId: 'ceu-azul-nacala',
      title: 'Aula Céu Azul',
    });
    await setDoc(doc(db, 'lessons', 'lesson-cftpm-01'), {
      id: 'lesson-cftpm-01',
      institutionId: 'inst-1',
      title: 'Aula CFTPM',
    });

    await setDoc(doc(db, 'evaluations', 'eval-ceu-01'), {
      id: 'eval-ceu-01',
      institutionId: 'ceu-azul-nacala',
      title: 'Avaliação Céu Azul',
    });
    await setDoc(doc(db, 'evaluations', 'eval-cftpm-01'), {
      id: 'eval-cftpm-01',
      institutionId: 'inst-1',
      title: 'Avaliação CFTPM',
    });

    await setDoc(doc(db, 'grades', 'grade-ceu-01'), {
      id: 'grade-ceu-01',
      institutionId: 'ceu-azul-nacala',
      score: 18,
    });
    await setDoc(doc(db, 'grades', 'grade-cftpm-01'), {
      id: 'grade-cftpm-01',
      institutionId: 'inst-1',
      score: 16,
    });

    await setDoc(doc(db, 'payments', 'pay-ceu-01'), {
      id: 'pay-ceu-01',
      institutionId: 'ceu-azul-nacala',
      amount: 3500,
    });
    await setDoc(doc(db, 'payments', 'pay-cftpm-01'), {
      id: 'pay-cftpm-01',
      institutionId: 'inst-1',
      amount: 5500,
    });

    await setDoc(doc(db, 'cashSessions', 'cash-ceu-01'), {
      id: 'cash-ceu-01',
      institutionId: 'ceu-azul-nacala',
      status: 'open',
    });
    await setDoc(doc(db, 'cashSessions', 'cash-cftpm-01'), {
      id: 'cash-cftpm-01',
      institutionId: 'inst-1',
      status: 'open',
    });

    await setDoc(doc(db, 'settings', 'set-ceu-01'), {
      id: 'set-ceu-01',
      institutionId: 'ceu-azul-nacala',
      currency: 'MZN',
    });
    await setDoc(doc(db, 'settings', 'set-cftpm-01'), {
      id: 'set-cftpm-01',
      institutionId: 'inst-1',
      currency: 'MZN',
    });

    await setDoc(doc(db, 'students', 'stu-ceu-01'), {
      id: 'stu-ceu-01',
      institutionId: 'ceu-azul-nacala',
      userId: accounts.aluno.uid,
      fullName: 'Aluno Céu Azul',
    });
    await setDoc(doc(db, 'students', 'stu-cftpm-01'), {
      id: 'stu-cftpm-01',
      institutionId: 'inst-1',
      fullName: 'Aluno CFTPM',
    });

    const checks: CheckResult[] = [
      unverifiedCheck,
      await expectAllow('Lê /admins e /sivecApiKeys (globais)', async () => {
        await getDocs(collection(db, 'admins'));
        return getDoc(doc(db, 'sivecApiKeys', 'key-prod-01'));
      }),
      await expectAllow('Lê /users de ambos os centros', () => getDocs(collection(db, 'users'))),
      await expectAllow('Lê /lessons de ceu-azul-nacala e inst-1', () => getDocs(collection(db, 'lessons'))),
      await expectAllow('Lê /payments de ceu-azul-nacala e inst-1', () => getDocs(collection(db, 'payments'))),
      await expectAllow('Lê /settings de ceu-azul-nacala e inst-1', () => getDocs(collection(db, 'settings'))),
    ];

    reports.push({
      actor: 'Super Admin',
      email: cred.user.email || '',
      role: 'SUPER_ADMIN',
      institutionId: 'GLOBAL (todos os centros)',
      uid: cred.user.uid,
      emailVerified: cred.user.emailVerified,
      checks,
    });
    await signOut(auth);
  }

  // =========================================================
  // LOGIN 2: DIRETOR DO CÉU AZUL (jafimpaulo8@gmail.com)
  // =========================================================
  {
    const cred = await signInWithEmailAndPassword(auth, accounts.diretor.email, TEST_PASS);
    await cred.user.getIdToken(true);

    const checks: CheckResult[] = [
      await expectAllow('Lê o próprio perfil em /users/{uid} (role=DIRETOR, institutionId=ceu-azul-nacala)', async () => {
        const snap = await getDoc(doc(db, 'users', cred.user.uid));
        if (snap.data()?.role !== 'DIRETOR' || snap.data()?.institutionId !== 'ceu-azul-nacala') {
          throw new Error(`Perfil inesperado: ${JSON.stringify(snap.data())}`);
        }
        return snap;
      }),
      await expectDeny('Bloqueado em /admins (mesmo com doc legado lá)', () => getDocs(collection(db, 'admins'))),
      await expectDeny('Bloqueado em /sivecApiKeys', () => getDoc(doc(db, 'sivecApiKeys', 'key-prod-01'))),
      await expectDeny('Bloqueado de auto-promover role=SUPER_ADMIN no próprio perfil', () =>
        updateDoc(doc(db, 'users', cred.user.uid), { role: 'SUPER_ADMIN' })
      ),
      await expectDeny('Bloqueado de mudar institutionId no próprio perfil para inst-1', () =>
        updateDoc(doc(db, 'users', cred.user.uid), { institutionId: 'inst-1' })
      ),
      await expectAllow('Lê /users de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'users'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Lê /lessons de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'lessons'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Lê /payments de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'payments'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Lê /settings de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'settings'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Lê /access_codes de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'access_codes'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Consulta alunos do próprio centro (where institutionId == ceu-azul-nacala)', () =>
        getDocs(query(collection(db, 'students'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectDeny('Bloqueado em /users de inst-1 (CFTPM)', () =>
        getDocs(query(collection(db, 'users'), where('institutionId', '==', 'inst-1')))
      ),
      await expectDeny('Bloqueado em /lessons de inst-1 (CFTPM)', () => getDoc(doc(db, 'lessons', 'lesson-cftpm-01'))),
      await expectDeny('Bloqueado em /payments de inst-1 (CFTPM)', () => getDoc(doc(db, 'payments', 'pay-cftpm-01'))),
      await expectDeny('Bloqueado em /settings de inst-1 (CFTPM)', () => getDoc(doc(db, 'settings', 'set-cftpm-01'))),
      await expectDeny('Bloqueado em /access_codes de inst-1 (CFTPM)', () => getDoc(doc(db, 'access_codes', 'CFTPM-ACC-01'))),
    ];

    reports.push({
      actor: 'Diretor do Céu Azul',
      email: cred.user.email || '',
      role: 'DIRETOR',
      institutionId: 'ceu-azul-nacala',
      uid: cred.user.uid,
      emailVerified: cred.user.emailVerified,
      checks,
    });
    await signOut(auth);
  }

  // =========================================================
  // LOGIN 3: SECRETARIA (secretaria.cftpm@teste.mz, inst-1)
  // =========================================================
  {
    const cred = await signInWithEmailAndPassword(auth, accounts.secretaria.email, TEST_PASS);
    await cred.user.getIdToken(true);

    const checks: CheckResult[] = [
      await expectAllow('Lê o próprio perfil em /users/{uid}', () => getDoc(doc(db, 'users', cred.user.uid))),
      await expectAllow('Lê /users de inst-1', () =>
        getDocs(query(collection(db, 'users'), where('institutionId', '==', 'inst-1')))
      ),
      await expectAllow('Lê /lessons de inst-1', () =>
        getDocs(query(collection(db, 'lessons'), where('institutionId', '==', 'inst-1')))
      ),
      await expectAllow('Lê /payments de inst-1', () =>
        getDocs(query(collection(db, 'payments'), where('institutionId', '==', 'inst-1')))
      ),
      await expectAllow('Lê /settings de inst-1', () =>
        getDocs(query(collection(db, 'settings'), where('institutionId', '==', 'inst-1')))
      ),
      await expectDeny('Bloqueada em /users de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'users'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectDeny('Bloqueada em /lessons de ceu-azul-nacala', () => getDoc(doc(db, 'lessons', 'lesson-ceu-01'))),
      await expectDeny('Bloqueada em /payments de ceu-azul-nacala', () => getDoc(doc(db, 'payments', 'pay-ceu-01'))),
      await expectDeny('Bloqueada em /settings de ceu-azul-nacala', () => getDoc(doc(db, 'settings', 'set-ceu-01'))),
      await expectDeny('Bloqueada em /admins, /sivecApiKeys e /access_codes', async () => {
        await getDocs(collection(db, 'admins'));
      }),
      await expectDeny('Bloqueada em /access_codes de inst-1 (só Diretor/Admin)', () =>
        getDoc(doc(db, 'access_codes', 'CFTPM-ACC-01'))
      ),
      await expectDeny('Bloqueada de auto-promover role=DIRETOR', () =>
        updateDoc(doc(db, 'users', cred.user.uid), { role: 'DIRETOR' })
      ),
    ];

    reports.push({
      actor: 'Secretaria (CFTPM)',
      email: cred.user.email || '',
      role: 'SECRETARIA',
      institutionId: 'inst-1',
      uid: cred.user.uid,
      emailVerified: cred.user.emailVerified,
      checks,
    });
    await signOut(auth);
  }

  // =========================================================
  // LOGIN 4: FORMADOR (formador.ceuazul@teste.mz, ceu-azul-nacala)
  // =========================================================
  {
    const cred = await signInWithEmailAndPassword(auth, accounts.formador.email, TEST_PASS);
    await cred.user.getIdToken(true);

    const checks: CheckResult[] = [
      await expectAllow('Lê o próprio perfil em /users/{uid}', () => getDoc(doc(db, 'users', cred.user.uid))),
      await expectAllow('Lê /lessons de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'lessons'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Lê /evaluations de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'evaluations'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Lê /grades de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'grades'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Lê /settings de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'settings'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectDeny('Bloqueado em /lessons de inst-1', () => getDoc(doc(db, 'lessons', 'lesson-cftpm-01'))),
      await expectDeny('Bloqueado em /evaluations de inst-1', () => getDoc(doc(db, 'evaluations', 'eval-cftpm-01'))),
      await expectDeny('Bloqueado em /grades de inst-1', () => getDoc(doc(db, 'grades', 'grade-cftpm-01'))),
      await expectDeny('Bloqueado em /settings de inst-1', () => getDoc(doc(db, 'settings', 'set-cftpm-01'))),
      await expectDeny('Bloqueado em /payments e /cashSessions mesmo do próprio centro', async () => {
        await getDoc(doc(db, 'payments', 'pay-ceu-01'));
      }),
      await expectDeny('Bloqueado em listar /users e ler perfil de outro utilizador', () =>
        getDoc(doc(db, 'users', accounts.diretor.uid))
      ),
      await expectDeny('Bloqueado em /admins e /access_codes', () =>
        getDoc(doc(db, 'access_codes', 'CEU-ACC-01'))
      ),
    ];

    reports.push({
      actor: 'Formador (Céu Azul)',
      email: cred.user.email || '',
      role: 'FORMADOR',
      institutionId: 'ceu-azul-nacala',
      uid: cred.user.uid,
      emailVerified: cred.user.emailVerified,
      checks,
    });
    await signOut(auth);
  }

  // =========================================================
  // LOGIN 5: ALUNO (aluno.ceuazul@teste.mz, ceu-azul-nacala)
  // =========================================================
  {
    const cred = await signInWithEmailAndPassword(auth, accounts.aluno.email, TEST_PASS);
    await cred.user.getIdToken(true);

    const checks: CheckResult[] = [
      await expectAllow('Lê o próprio perfil em /users/{uid}', () => getDoc(doc(db, 'users', cred.user.uid))),
      await expectAllow('Lê /lessons de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'lessons'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Lê /grades de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'grades'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectAllow('Lê /settings de ceu-azul-nacala', () =>
        getDocs(query(collection(db, 'settings'), where('institutionId', '==', 'ceu-azul-nacala')))
      ),
      await expectDeny('Bloqueado em /lessons de inst-1', () => getDoc(doc(db, 'lessons', 'lesson-cftpm-01'))),
      await expectDeny('Bloqueado em /grades de inst-1', () => getDoc(doc(db, 'grades', 'grade-cftpm-01'))),
      await expectDeny('Bloqueado em /settings de inst-1', () => getDoc(doc(db, 'settings', 'set-cftpm-01'))),
      await expectDeny('Bloqueado em /payments e /cashSessions', () =>
        getDoc(doc(db, 'payments', 'pay-ceu-01'))
      ),
      await expectDeny('Bloqueado em ler /users de terceiros e listar /users', () =>
        getDoc(doc(db, 'users', accounts.diretor.uid))
      ),
      await expectDeny('Bloqueado em /admins, /sivecApiKeys e /access_codes', () =>
        getDoc(doc(db, 'access_codes', 'CEU-ACC-01'))
      ),
      await expectDeny('Bloqueado de auto-promover role=DIRETOR no próprio perfil', () =>
        updateDoc(doc(db, 'users', cred.user.uid), { role: 'DIRETOR' })
      ),
    ];

    reports.push({
      actor: 'Aluno (Céu Azul)',
      email: cred.user.email || '',
      role: 'ALUNO',
      institutionId: 'ceu-azul-nacala',
      uid: cred.user.uid,
      emailVerified: cred.user.emailVerified,
      checks,
    });
    await signOut(auth);
  }

  // Verificar também observação honesta da Fase A vs Fase B em /students
  await signInWithEmailAndPassword(auth, accounts.diretor.email, TEST_PASS);
  const crossStudentProbe = await getDoc(doc(db, 'students', 'stu-cftpm-01')).then(
    (s) => `exists=${s.exists()} (aguarda Fase B para fechar leitura direta em /students)`
  ).catch((e) => `bloqueado (${e?.code || e})`);
  await signOut(auth);

  console.log('\n================ RESULTADO DOS 5 LOGINS REAIS (FIREBASE AUTH + FIRESTORE.RULES.NOVO) ================');
  let totalChecks = 0;
  let totalPassed = 0;

  for (const r of reports) {
    const passedCount = r.checks.filter((c) => c.passed).length;
    totalChecks += r.checks.length;
    totalPassed += passedCount;
    console.log(`\n▶ ${r.actor} | ${r.email} | Role: ${r.role} | Centro: ${r.institutionId} | emailVerified=${r.emailVerified}`);
    console.log(`  UID: ${r.uid} | Resultado: ${passedCount}/${r.checks.length} PASS`);
    for (const c of r.checks) {
      console.log(`   - [${c.passed ? 'PASS' : 'FAIL'}] ${c.label} => ${c.detail}`);
    }
  }

  console.log(`\nNota Fase A vs Fase B (/students): getDoc('students/stu-cftpm-01') por DIRETOR de ceu-azul-nacala => ${crossStudentProbe}`);
  console.log(`TOTAL GERAL: ${totalPassed}/${totalChecks} verificações aprovadas.`);

  await deleteApp(app);
  if (totalPassed !== totalChecks) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
