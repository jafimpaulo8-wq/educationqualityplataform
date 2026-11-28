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
  collection
} from 'firebase/firestore';

import {
  extractSlugFromLocation,
  isPublicRegistrationPath,
  resolvePublicInstitutionBySlug,
  buildPublicInstitutionFromModel,
  getPublicRegistrationUrl,
  normalizeSlug
} from '../src/services/publicInstitutionService';
import {
  createEmptyOnlineRegistrationConfig,
  getConfiguredDocuments,
  normalizeFieldRequirement,
  sanitizeFirestoreData,
  validateAndFormatInternationalPhone,
  validateFullRegistration,
  validateRegistrationStep
} from '../src/utils/registrationConfigUtils';
import { CEU_AZUL_INSTITUTION } from '../src/data/ceuAzulData';
import { INITIAL_INSTITUTIONS } from '../src/data/mockData';
import { Institution, OnlineRegistrationConfig } from '../src/types';

const PROJECT_ID = process.env.GCLOUD_PROJECT || '';
if (!PROJECT_ID || PROJECT_ID === 'siverc-94da3' || PROJECT_ID !== 'demo-sigar-test') {
  throw new Error(
    `[test_fase4_public_registration] Abortado: GCLOUD_PROJECT deve ser "demo-sigar-test" (recebido "${PROJECT_ID}").`
  );
}

function parseLocalEndpoint(envKey: string, label: string) {
  const raw = process.env[envKey];
  if (!raw) throw new Error(`[test_fase4_public_registration] Abortado: ${envKey} obrigatório para ${label}.`);
  const match = /^(127\.0\.0\.1|localhost):(\d{1,5})$/.exec(raw.trim());
  const port = match ? Number(match[2]) : NaN;
  if (!match || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`[test_fase4_public_registration] Abortado: ${envKey} inválido "${raw}".`);
  }
  return { host: match[1], port, url: `http://${match[1]}:${port}` };
}

const AUTH_ENDPOINT = parseLocalEndpoint('FIREBASE_AUTH_EMULATOR_HOST', 'Auth');
const FIRESTORE_ENDPOINT = parseLocalEndpoint('FIRESTORE_EMULATOR_HOST', 'Firestore');
const AUTH_EMULATOR_URL = AUTH_ENDPOINT.url;
const FIRESTORE_HOST = FIRESTORE_ENDPOINT.host;
const FIRESTORE_PORT = FIRESTORE_ENDPOINT.port;
const TEST_PASS = 'SigarFase4#2026';

interface TestResult {
  id: number;
  block: string;
  label: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];
let seq = 1;

function assertTest(block: string, label: string, condition: boolean, detail: string) {
  const id = seq++;
  results.push({ id, block, label, passed: condition, detail });
}

async function checkAllow(block: string, label: string, fn: () => Promise<unknown>) {
  const id = seq++;
  try {
    await fn();
    results.push({ id, block, label, passed: true, detail: 'PERMITIDO conforme esperado' });
  } catch (err: any) {
    results.push({
      id,
      block,
      label,
      passed: false,
      detail: `FALHOU (esperava ALLOW): ${err?.code || err?.message || err}`
    });
  }
}

async function checkDeny(block: string, label: string, fn: () => Promise<unknown>) {
  const id = seq++;
  try {
    await fn();
    results.push({
      id,
      block,
      label,
      passed: false,
      detail: 'FALHA DE SEGURANÇA: operação foi PERMITIDA (esperava DENY)'
    });
  } catch (err: any) {
    const code = String(err?.code || '');
    const msg = String(err?.message || '');
    if (code.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
      results.push({ id, block, label, passed: true, detail: 'BLOQUEADO (permission-denied)' });
    } else {
      results.push({
        id,
        block,
        label,
        passed: false,
        detail: `ERRO INESPERADO (esperava permission-denied): ${code || msg}`
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
        Authorization: 'Bearer owner'
      },
      body: JSON.stringify({ localId, emailVerified })
    }
  );
  if (!resp.ok) {
    throw new Error(`accounts:update falhou: ${resp.status} ${await resp.text()}`);
  }
}

async function ensureUser(auth: ReturnType<typeof getAuth>, email: string): Promise<string> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, TEST_PASS);
    await setAuthEmailVerified(cred.user.uid, true);
    return cred.user.uid;
  } catch {
    const cred = await signInWithEmailAndPassword(auth, email, TEST_PASS);
    await setAuthEmailVerified(cred.user.uid, true);
    return cred.user.uid;
  }
}

async function runUnitChecks() {
  const pool: Institution[] = [CEU_AZUL_INSTITUTION as Institution, ...INITIAL_INSTITUTIONS];

  // Bloco 1: URL & Slug
  assertTest(
    'URL & Slug',
    'Suporta /i/<slug>, #i/<slug>, #/i/<slug>, /i/<slug>/inscricoes e legado #instituicoes/<slug>/inscricoes',
    extractSlugFromLocation('/i/ceu-azul', '', '') === 'ceu-azul' &&
      extractSlugFromLocation('/', '#i/ceu-azul', '') === 'ceu-azul' &&
      extractSlugFromLocation('/', '#/i/peniel', '') === 'peniel' &&
      extractSlugFromLocation('/i/cftpm-moztechwave/inscricoes', '', '') === 'cftpm-moztechwave' &&
      extractSlugFromLocation('/', '#instituicoes/ceu-azul/inscricoes', '') === 'ceu-azul',
    'Todos os formatos extraíram o slug esperado'
  );

  assertTest(
    'URL & Slug',
    'isPublicRegistrationPath identifica rotas públicas novas e legadas sem falsos positivos',
    isPublicRegistrationPath('/i/ceu-azul', '') === true &&
      isPublicRegistrationPath('/', '#i/ceu-azul') === true &&
      isPublicRegistrationPath('/', '#instituicoes/cftpm-moztechwave/inscricoes') === true &&
      isPublicRegistrationPath('/', '') === false &&
      isPublicRegistrationPath('/dashboard', '') === false,
    'Detecção booleana exata'
  );

  const ceuResolved = await resolvePublicInstitutionBySlug('ceu-azul', pool);
  const cftpmResolved = await resolvePublicInstitutionBySlug('cftpm-moztechwave', pool);
  assertTest(
    'URL & Slug',
    'Resolução estrita isola Céu Azul vs CFTPM sem contaminação cruzada',
    ceuResolved?.institutionId === 'ceu-azul-nacala' &&
      cftpmResolved?.institutionId === 'inst-1' &&
      ceuResolved?.name !== cftpmResolved?.name,
    `ceu-azul->${ceuResolved?.institutionId}, cftpm-moztechwave->${cftpmResolved?.institutionId}`
  );

  const ghostResolved = await resolvePublicInstitutionBySlug('instituicao-inexistente-999', pool);
  const emptyResolved = await resolvePublicInstitutionBySlug('', pool);
  assertTest(
    'URL & Slug',
    'Slug inválido ou vazio retorna null e nunca faz fallback para outra instituição',
    ghostResolved === null && emptyResolved === null,
    `ghost=${ghostResolved}, empty=${emptyResolved}`
  );

  const bareSlugInst: Partial<Institution> = { id: 'ceu-azul-nacala', slug: 'ceu-azul' };
  const generatedUrl = getPublicRegistrationUrl(bareSlugInst as Institution);
  assertTest(
    'URL & Slug',
    'getPublicRegistrationUrl gera formato canónico #i/<slug>',
    generatedUrl === 'https://sigar.moztechwave.com/#i/ceu-azul' && normalizeSlug('#/i/ceu-azul/') === 'ceu-azul',
    `URL gerada: ${generatedUrl}`
  );

  // Bloco 2: Hardcodes & Isolamento de Configuração
  const neutralCfg = createEmptyOnlineRegistrationConfig({
    id: 'inst-peniel',
    name: 'Instituto Técnico Peniel',
    type: 'centro_formacao'
  });
  assertTest(
    'Zero Hardcodes',
    'createEmptyOnlineRegistrationConfig não contém cursos do CFTPM, perguntas fictícias nem datas hardcoded',
    neutralCfg.coursesConfig.length === 0 &&
      neutralCfg.customQuestions.length === 0 &&
      neutralCfg.requiredDocuments.length === 0 &&
      neutralCfg.startDate === '' &&
      neutralCfg.endDate === '' &&
      !neutralCfg.title.includes('CFTPM'),
    `title="${neutralCfg.title}", courses=${neutralCfg.coursesConfig.length}`
  );

  const bareInst: Institution = {
    id: 'inst-bare',
    name: 'Escola Nova Esperança',
    slug: 'nova-esperanca',
    code: 'ENE',
    type: 'instituicao_ensino',
    nuit: '400999111',
    licenseNumber: 'LIC-2026-01',
    representativeName: 'Direção ENE',
    representativeRole: 'Diretor',
    email: 'geral@ene.mz',
    phone: '841112233',
    city: 'Nacala',
    province: 'Nampula',
    address: 'Bairro Maiaia',
    plan: 'Básico',
    status: 'Ativa',
    connectedSystem: 'SIGAR',
    sivecEnabled: false,
    activeBranches: 1,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    createdAt: '2026-01-01',
    branches: []
  };
  const pubBare = buildPublicInstitutionFromModel(bareInst);
  assertTest(
    'Zero Hardcodes',
    'Instituição sem configuração prévia nunca herda cursos nem contactos do CFTPM',
    pubBare.onlineRegistrationConfig.coursesConfig.length === 0 &&
      pubBare.onlineRegistrationConfig.customQuestions.length === 0 &&
      pubBare.phone === '841112233' &&
      pubBare.onlineRegistrationConfig.contactPhone === '841112233' &&
      !('financialSettings' in (pubBare as any)),
    `slug=${pubBare.slug}, phone=${pubBare.phone}, courses=${pubBare.onlineRegistrationConfig.coursesConfig.length}`
  );

  assertTest(
    'WhatsApp',
    'validateAndFormatInternationalPhone valida Moçambique e oculta números ausentes/inválidos',
    validateAndFormatInternationalPhone('84 123 4567') === '258841234567' &&
      validateAndFormatInternationalPhone('+258 86 999 0001') === '258869990001' &&
      validateAndFormatInternationalPhone('') === null &&
      validateAndFormatInternationalPhone('12345') === null,
    'Validação 258 + prefixo nacional correta'
  );

  // Bloco 3: Campos Obrigatórios / Opcionais / Ocultos, Perguntas e Documentos
  const childCenterCfg: OnlineRegistrationConfig = {
    ...createEmptyOnlineRegistrationConfig({ id: 'ceu-azul-nacala', name: 'Céu Azul', type: 'centro_infantil' }),
    requiredFields: {
      phone: 'obrigatorio',
      email: 'opcional',
      documentNumber: 'oculto',
      birthDate: 'obrigatorio',
      gender: 'obrigatorio',
      guardianName: 'obrigatorio',
      guardianPhone: 'obrigatorio',
      guardianRelationship: 'obrigatorio',
      authorizedPickupPersons: 'obrigatorio',
      address: 'opcional',
      province: 'oculto',
      city: 'oculto',
      nuit: 'oculto',
      previousSchool: 'oculto'
    },
    requiredDocuments: ['Certidão de Nascimento / Cédula', 'Cartão de Vacinas', 'Foto Tipo Passe'],
    documentRequirements: {
      'Certidão de Nascimento / Cédula': 'obrigatorio',
      'Cartão de Vacinas': 'opcional',
      'Foto Tipo Passe': 'oculto'
    },
    customQuestions: [
      { id: 'q-ativa', question: 'Alergias alimentares?', type: 'text', required: true, active: true },
      { id: 'q-oculta', question: 'Pergunta desativada', type: 'text', required: true, active: false }
    ],
    coursesConfig: [
      {
        courseId: 'sala-maternal',
        courseName: 'Maternal (2-3 anos)',
        active: true,
        price: 1800,
        monthlyFee: 2500,
        duration: 'Anual',
        shifts: ['Manhã'],
        regimes: ['Laboral'],
        requirements: ['Cédula pessoal'],
        vacancies: 15,
        filledVacancies: 0
      }
    ]
  };

  const docsConfigured = getConfiguredDocuments(childCenterCfg);
  assertTest(
    'Documentos',
    'getConfiguredDocuments respeita Obrigatório/Opcional e omite Oculto sem inventar docs padrão',
    docsConfigured.length === 2 &&
      docsConfigured[0].requirement === 'obrigatorio' &&
      docsConfigured[1].requirement === 'opcional' &&
      getConfiguredDocuments({ requiredDocuments: [] }).length === 0,
    `Docs visíveis: ${docsConfigured.map(d => `${d.name}:${d.requirement}`).join(', ')}`
  );

  const step2MissingGuardian = validateRegistrationStep(
    2,
    {
      selectedCourseId: 'sala-maternal',
      fullName: 'Helena Paulo',
      birthDate: '2023-05-10',
      gender: 'Feminino',
      phone: '849990001'
    },
    childCenterCfg,
    childCenterCfg.coursesConfig
  );
  assertTest(
    'Validação Campos',
    'Campos obrigatórios do Centro Infantil bloqueiam avanço se vazios, mas campos ocultos/opcionais não bloqueiam',
    !step2MissingGuardian.valid &&
      'guardianName' in step2MissingGuardian.fieldErrors &&
      !('documentNumber' in step2MissingGuardian.fieldErrors) &&
      !('email' in step2MissingGuardian.fieldErrors),
    `Erros capturados: ${Object.keys(step2MissingGuardian.fieldErrors).join(', ')}`
  );

  const fullValidChild = validateFullRegistration(
    {
      selectedCourseId: 'sala-maternal',
      fullName: 'Helena Paulo',
      birthDate: '2023-05-10',
      gender: 'Feminino',
      phone: '849990001',
      guardianName: 'Maria Paulo',
      guardianPhone: '849990001',
      guardianRelationship: 'Mãe',
      authorizedPickupPersons: 'Maria Paulo, João Paulo',
      customAnswers: { 'q-ativa': 'Nenhuma' }, // q-oculta omitida intencionalmente
      uploadedDocs: { 'Certidão de Nascimento / Cédula': { name: 'cedula.pdf', size: 1024 } }, // Cartão de Vacinas opcional
      termsAccepted: true,
      privacyAccepted: true
    },
    childCenterCfg,
    childCenterCfg.coursesConfig
  );
  assertTest(
    'Validação Completa',
    'Submissão completa ignora pergunta oculta (active=false) e documento opcional, exigindo apenas ativos/obrigatórios + termos',
    fullValidChild.valid === true && normalizeFieldRequirement(true) === 'obrigatorio',
    fullValidChild.valid ? 'Validação global aprovada' : `Erros inesperados: ${fullValidChild.errors.join('; ')}`
  );

  const sanitized = sanitizeFirestoreData({ fullName: 'Teste', email: undefined, nested: { a: 1, b: undefined } });
  assertTest(
    'Sanitização',
    'sanitizeFirestoreData remove propriedades undefined antes de gravar no Firestore',
    !('email' in sanitized) && !('b' in (sanitized as any).nested) && (sanitized as any).nested.a === 1,
    `Chaves preservadas: ${Object.keys(sanitized).join(', ')}`
  );
}

async function assertEmulatorsReady(): Promise<void> {
  const authRes = await fetch(`${AUTH_EMULATOR_URL}/emulator/v1/projects/${PROJECT_ID}/config`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(3000)
  });
  const authBody = (await authRes.json().catch(() => null)) as any;
  if (!authRes.ok || !authBody?.signIn || typeof authBody.signIn !== 'object') {
    throw new Error(`[test_fase4_public_registration] Auth Emulator indisponível em ${AUTH_EMULATOR_URL}`);
  }
  const fsRes = await fetch(
    `http://${FIRESTORE_HOST}:${FIRESTORE_PORT}/v1/projects/${PROJECT_ID}/databases/(default)/documents/emulatorHealthProbe/probe`,
    { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(3000) }
  );
  const fsBody = (await fsRes.json().catch(() => null)) as any;
  const fsStatus = fsBody?.error?.status;
  if (!(fsRes.ok || fsStatus === 'PERMISSION_DENIED' || fsStatus === 'NOT_FOUND')) {
    throw new Error(`[test_fase4_public_registration] Firestore Emulator indisponível em http://${FIRESTORE_HOST}:${FIRESTORE_PORT}`);
  }
}

async function runEmulatorChecks() {
  await assertEmulatorsReady();
  const app = initializeApp({ apiKey: 'fake-api-key', authDomain: '127.0.0.1', projectId: PROJECT_ID }, `fase4-test-${Date.now()}`);
  const auth = getAuth(app);
  const db = getFirestore(app);
  connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });
  connectFirestoreEmulator(db, FIRESTORE_HOST, FIRESTORE_PORT);

  const SUPER_EMAIL = 'moztechwavenacala8@gmail.com';
  const DIR_CEU_EMAIL = 'jafimpaulo8@gmail.com';
  const SEC_CEU_EMAIL = 'sec.ceu.f4@sigar.test';
  const SEC_CFTPM_EMAIL = 'sec.cftpm.f4@sigar.test';
  const DIR_PENIEL_EMAIL = 'dir.peniel.f4@sigar.test';

  const superUid = await ensureUser(auth, SUPER_EMAIL);
  const dirCeuUid = await ensureUser(auth, DIR_CEU_EMAIL);
  const secCeuUid = await ensureUser(auth, SEC_CEU_EMAIL);
  const secCftpmUid = await ensureUser(auth, SEC_CFTPM_EMAIL);
  const dirPenielUid = await ensureUser(auth, DIR_PENIEL_EMAIL);

  await signInWithEmailAndPassword(auth, SUPER_EMAIL, TEST_PASS);

  await setDoc(doc(db, 'institutions', 'ceu-azul-nacala'), {
    id: 'ceu-azul-nacala',
    slug: 'ceu-azul',
    name: 'Centro Infantil Céu Azul',
    financialSettings: { mpesaNumber: '849990001', emolaNumber: '869990001' }
  });
  await setDoc(doc(db, 'institutions', 'inst-1'), {
    id: 'inst-1',
    slug: 'cftpm-moztechwave',
    name: 'CFTPM — Moztechwave Formação',
    financialSettings: { mpesaNumber: '848880002' }
  });
  await setDoc(doc(db, 'institutions', 'inst-peniel'), {
    id: 'inst-peniel',
    slug: 'peniel',
    name: 'Instituto Técnico Peniel',
    financialSettings: { mpesaNumber: '847770003' }
  });

  const seedUsers = [
    { id: superUid, email: SUPER_EMAIL, role: 'SUPER_ADMIN', roles: ['SUPER_ADMIN'], institutionId: '' },
    { id: dirCeuUid, email: DIR_CEU_EMAIL, role: 'DIRETOR', roles: ['DIRETOR'], institutionId: 'ceu-azul-nacala' },
    { id: secCeuUid, email: SEC_CEU_EMAIL, role: 'SECRETARIA', roles: ['SECRETARIA'], institutionId: 'ceu-azul-nacala' },
    { id: secCftpmUid, email: SEC_CFTPM_EMAIL, role: 'SECRETARIA', roles: ['SECRETARIA'], institutionId: 'inst-1' },
    { id: dirPenielUid, email: DIR_PENIEL_EMAIL, role: 'DIRETOR', roles: ['DIRETOR'], institutionId: 'inst-peniel' }
  ];
  for (const u of seedUsers) {
    await setDoc(doc(db, 'users', u.id), u);
  }

  // Director do Céu Azul sincroniza publicInstitutions/ceu-azul
  await signInWithEmailAndPassword(auth, DIR_CEU_EMAIL, TEST_PASS);
  await checkAllow('Emulator PublicSync', 'Director do Céu Azul publica publicInstitutions/ceu-azul sem M-Pesa/e-Mola', () =>
    setDoc(doc(db, 'publicInstitutions', 'ceu-azul'), {
      id: 'ceu-azul',
      slug: 'ceu-azul',
      institutionId: 'ceu-azul-nacala',
      name: 'Centro Infantil Céu Azul',
      logoUrl: 'https://cdn.test/ceu-logo.png',
      contactPhone: '849990001',
      contactWhatsapp: '849990001',
      contactEmail: 'admissoes@ceuazul.mz',
      onlineRegistrationConfig: {
        institutionId: 'ceu-azul-nacala',
        isOpen: true,
        requiredFields: {
          phone: 'obrigatorio',
          email: 'opcional',
          documentNumber: 'oculto',
          guardianName: 'obrigatorio',
          guardianPhone: 'obrigatorio'
        },
        coursesConfig: [{ courseId: 'maternal', courseName: 'Maternal', active: true, price: 1500, vacancies: 10 }]
      }
    })
  );

  await checkDeny('Emulator PublicSync', 'Director do Céu Azul NÃO pode vazar mpesaNumber em publicInstitutions/ceu-azul', () =>
    setDoc(doc(db, 'publicInstitutions', 'ceu-azul-leak'), {
      id: 'ceu-azul-leak',
      slug: 'ceu-azul-leak',
      institutionId: 'ceu-azul-nacala',
      name: 'Céu Azul Leak',
      mpesaNumber: '849990001'
    })
  );

  await checkDeny('Emulator PublicSync', 'Director do Céu Azul NÃO pode registar portal para outra instituição (inst-peniel)', () =>
    setDoc(doc(db, 'publicInstitutions', 'peniel'), {
      id: 'peniel',
      slug: 'peniel',
      institutionId: 'inst-peniel',
      name: 'Hijack Peniel'
    })
  );

  // Director da Peniel publica portal próprio + CFTPM fechado via Super Admin
  await signInWithEmailAndPassword(auth, DIR_PENIEL_EMAIL, TEST_PASS);
  await checkAllow('Emulator PublicSync', 'Director da Peniel publica publicInstitutions/peniel', () =>
    setDoc(doc(db, 'publicInstitutions', 'peniel'), {
      id: 'peniel',
      slug: 'peniel',
      institutionId: 'inst-peniel',
      name: 'Instituto Técnico Peniel',
      onlineRegistrationConfig: {
        institutionId: 'inst-peniel',
        isOpen: true,
        requiredFields: { phone: 'obrigatorio', email: 'obrigatorio', documentNumber: 'obrigatorio' },
        coursesConfig: [{ courseId: 'enf', courseName: 'Enfermagem Geral', active: true, price: 2500, vacancies: 20 }]
      }
    })
  );

  await signInWithEmailAndPassword(auth, SUPER_EMAIL, TEST_PASS);
  await setDoc(doc(db, 'publicInstitutions', 'cftpm-fechado'), {
    id: 'cftpm-fechado',
    slug: 'cftpm-fechado',
    institutionId: 'inst-1',
    name: 'CFTPM Encerrado',
    onlineRegistrationConfig: {
      institutionId: 'inst-1',
      isOpen: false,
      requiredFields: { phone: 'obrigatorio' },
      coursesConfig: [{ courseId: 'inf', courseName: 'Informática', active: true, price: 1200, vacancies: 10 }]
    }
  });

  // Testes como Visitante Anónimo
  await signOut(auth);

  await checkAllow('Emulator Visitante', 'Visitante anónimo lê get(publicInstitutions/ceu-azul)', async () => {
    const snap = await getDoc(doc(db, 'publicInstitutions', 'ceu-azul'));
    if (!snap.exists() || snap.data()?.institutionId !== 'ceu-azul-nacala') {
      throw new Error('Dados públicos inválidos');
    }
  });

  await checkDeny('Emulator Visitante', 'Visitante anónimo NÃO pode listar publicInstitutions', () =>
    getDocs(collection(db, 'publicInstitutions'))
  );

  await checkDeny('Emulator Submissão', 'Visitante NÃO pode submeter slug ceu-azul com institutionId de inst-1 (cross-tenant spoofing)', () =>
    setDoc(doc(db, 'applications', 'app-spoof-1'), {
      id: 'app-spoof-1',
      institutionId: 'inst-1',
      slug: 'ceu-azul',
      fullName: 'Atacante Cross Tenant',
      phone: '849990001',
      guardianName: 'Encarregado',
      guardianPhone: '849990001',
      courseId: 'maternal',
      courseName: 'Maternal',
      termsAccepted: true,
      privacyAccepted: true,
      status: 'submetida',
      paymentStatus: 'Pendente'
    })
  );

  await checkDeny('Emulator Submissão', 'Visitante NÃO pode submeter no Céu Azul sem guardianName/guardianPhone obrigatórios', () =>
    setDoc(doc(db, 'applications', 'app-missing-guardian'), {
      id: 'app-missing-guardian',
      institutionId: 'ceu-azul-nacala',
      slug: 'ceu-azul',
      fullName: 'Criança Sem Encarregado',
      phone: '849990001',
      courseId: 'maternal',
      courseName: 'Maternal',
      termsAccepted: true,
      privacyAccepted: true,
      status: 'submetida',
      paymentStatus: 'Pendente'
    })
  );

  await checkDeny('Emulator Submissão', 'Visitante NÃO pode submeter sem termsAccepted/privacyAccepted', () =>
    setDoc(doc(db, 'applications', 'app-no-terms'), {
      id: 'app-no-terms',
      institutionId: 'ceu-azul-nacala',
      slug: 'ceu-azul',
      fullName: 'Sem Termos',
      phone: '849990001',
      guardianName: 'Maria',
      guardianPhone: '849990001',
      courseId: 'maternal',
      courseName: 'Maternal',
      termsAccepted: false,
      privacyAccepted: true,
      status: 'submetida',
      paymentStatus: 'Pendente'
    })
  );

  await checkDeny('Emulator Submissão', 'Visitante NÃO pode submeter para portal com isOpen=false (cftpm-fechado)', () =>
    setDoc(doc(db, 'applications', 'app-closed-portal'), {
      id: 'app-closed-portal',
      institutionId: 'inst-1',
      slug: 'cftpm-fechado',
      fullName: 'Candidato Tardio',
      phone: '848880002',
      courseId: 'inf',
      courseName: 'Informática',
      termsAccepted: true,
      privacyAccepted: true,
      status: 'submetida',
      paymentStatus: 'Pendente'
    })
  );

  await checkAllow('Emulator Submissão', 'Visitante submete candidatura válida para Céu Azul (sem BI/email opcionais) em applications e subcoleção', async () => {
    const payload = {
      id: 'app-ceu-valid-1',
      institutionId: 'ceu-azul-nacala',
      slug: 'ceu-azul',
      fullName: 'Helena Paulo',
      phone: '849990001',
      guardianName: 'Maria Paulo',
      guardianPhone: '849990001',
      courseId: 'maternal',
      courseName: 'Maternal',
      termsAccepted: true,
      privacyAccepted: true,
      status: 'submetida',
      paymentStatus: 'Pendente'
    };
    await setDoc(doc(db, 'applications', 'app-ceu-valid-1'), payload);
    await setDoc(doc(db, 'institutions', 'ceu-azul-nacala', 'applications', 'app-ceu-valid-1'), payload);
    await setDoc(doc(db, 'applicationTracking', 'CEU-CAND-2026-4001'), {
      id: 'CEU-CAND-2026-4001',
      code: 'CEU-CAND-2026-4001',
      institutionId: 'ceu-azul-nacala',
      slug: 'ceu-azul',
      courseName: 'Maternal',
      maskedName: 'He•••••• Paulo',
      status: 'submetida',
      paymentStatus: 'Pendente'
    });
  });

  await checkDeny('Emulator PII', 'Visitante anónimo NÃO pode ler PII em /applications/{id}', () =>
    getDoc(doc(db, 'applications', 'app-ceu-valid-1'))
  );

  await checkAllow('Emulator PII', 'Visitante anónimo acompanha estado sem PII em /applicationTracking/{token}', () =>
    getDoc(doc(db, 'applicationTracking', 'CEU-CAND-2026-4001'))
  );

  // Isolamento da Secretaria
  await signInWithEmailAndPassword(auth, SEC_CFTPM_EMAIL, TEST_PASS);
  await checkDeny('Emulator Tenant', 'Secretaria do CFTPM NÃO pode ler candidatura do Céu Azul', () =>
    getDoc(doc(db, 'applications', 'app-ceu-valid-1'))
  );

  await signInWithEmailAndPassword(auth, SEC_CEU_EMAIL, TEST_PASS);
  await checkAllow('Emulator Tenant', 'Secretaria do Céu Azul lê candidatura do próprio centro', () =>
    getDoc(doc(db, 'applications', 'app-ceu-valid-1'))
  );

  await deleteApp(app);
}

async function main() {
  console.log('========================================================================');
  console.log('TESTES FASE 4 — INSCRIÇÕES PÚBLICAS ISOLADAS (UNITÁRIO + EMULATOR)');
  console.log('========================================================================\n');

  await runUnitChecks();
  await runEmulatorChecks();

  let passCount = 0;
  for (const r of results) {
    const tag = r.passed ? 'PASS' : 'FAIL';
    console.log(`[${String(r.id).padStart(2, '0')}] [${tag}] [${r.block}] ${r.label}`);
    console.log(`     -> ${r.detail}`);
    if (r.passed) passCount++;
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`TOTAL FASE 4: ${passCount}/${results.length} TESTES PASSARAM.`);
  console.log('------------------------------------------------------------------------');

  process.exit(passCount === results.length ? 0 : 1);
}

main().catch(err => {
  console.error('Erro fatal nos testes da Fase 4:', err);
  process.exit(1);
});
