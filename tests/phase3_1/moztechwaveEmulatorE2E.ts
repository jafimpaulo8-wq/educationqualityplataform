/**
 * Suíte E2E Real (Playwright + Firebase Auth/Firestore/Functions Emulators) — Portal Moztechwave (inst-1 / moztechwave)
 *
 * SEGURANÇA:
 * - Aborta imediatamente se FIRESTORE_EMULATOR_HOST ou FIREBASE_AUTH_EMULATOR_HOST não estiverem definidos.
 * - Aborta imediatamente se o projecto configurado for `siverc-94da3`.
 * - Bloqueia no browser qualquer pedido HTTP dirigido a serviços Firebase remotos.
 */

import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('/usr/local/share/bun-global/node_modules/playwright');

const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST;
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FUNCTIONS_HOST = process.env.FUNCTIONS_EMULATOR_HOST;
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-sigar-test';
const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}`;

if (!FIRESTORE_HOST || !AUTH_HOST || !FUNCTIONS_HOST) {
  console.error('ABORTADO: Execute via `firebase emulators:exec --only auth,firestore,functions --project demo-sigar-test ...`');
  process.exit(2);
}

if (PROJECT_ID === 'siverc-94da3' || PROJECT_ID !== 'demo-sigar-test') {
  console.error(`ABORTADO: O modo Emulator exige GCLOUD_PROJECT=demo-sigar-test (recebido "${PROJECT_ID}").`);
  process.exit(2);
}

function assertLocalHostPort(label: string, value: string): void {
  const match = /^(127\.0\.0\.1|localhost):(\d{1,5})$/.exec(value.trim());
  if (!match || Number(match[2]) < 1 || Number(match[2]) > 65535) {
    console.error(`ABORTADO: Host local inválido para ${label}: "${value}".`);
    process.exit(2);
  }
}

assertLocalHostPort('FIRESTORE_EMULATOR_HOST', FIRESTORE_HOST);
assertLocalHostPort('FIREBASE_AUTH_EMULATOR_HOST', AUTH_HOST);
assertLocalHostPort('FUNCTIONS_EMULATOR_HOST', FUNCTIONS_HOST);

function toFirestoreValue(val: any): any {
  if (val === null) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreValue(v: any): any {
  if (!v || typeof v !== 'object') return undefined;
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return Boolean(v.booleanValue);
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue?.values || []).map(fromFirestoreValue);
  if ('mapValue' in v) {
    const out: Record<string, any> = {};
    for (const [k, inner] of Object.entries(v.mapValue?.fields || {})) {
      out[k] = fromFirestoreValue(inner);
    }
    return out;
  }
  return undefined;
}

function decodeDoc(raw: any): Record<string, any> | null {
  if (!raw || !raw.fields) return null;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw.fields)) {
    out[k] = fromFirestoreValue(v);
  }
  return out;
}

async function fsSetDoc(docPath: string, data: Record<string, any>, bearerToken = 'owner') {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) fields[k] = toFirestoreValue(v);
  }
  const url = `http://${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`
    },
    body: JSON.stringify({ fields })
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

async function fsGetDoc(docPath: string, bearerToken = 'owner') {
  const url = `http://${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${bearerToken}` }
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: decodeDoc(body), raw: body };
}

async function fsListCollection(collectionPath: string, bearerToken = 'owner') {
  const url = `http://${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionPath}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${bearerToken}` }
  });
  const body = await res.json().catch(() => ({}));
  const docs = Array.isArray(body.documents) ? body.documents.map((d: any) => ({
    name: d.name,
    id: String(d.name || '').split('/').pop(),
    data: decodeDoc(d)
  })) : [];
  return { ok: res.ok, status: res.status, docs, raw: body };
}

async function createAuthUser(email: string, password: string) {
  const signUp = await fetch(
    `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );
  const created = (await signUp.json()) as any;
  assert.ok(created.localId && created.idToken, `Erro ao criar utilizador ${email}: ${JSON.stringify(created)}`);

  await fetch(
    `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: created.idToken, emailVerified: true })
    }
  );
  return { uid: created.localId as string, idToken: created.idToken as string };
}

async function signInAuthUser(email: string, password: string) {
  const res = await fetch(
    `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );
  const json = (await res.json()) as any;
  assert.ok(json.idToken, `Erro ao autenticar ${email}: ${JSON.stringify(json)}`);
  return { uid: json.localId as string, idToken: json.idToken as string };
}

async function startViteEmulatorServer(): Promise<ChildProcess> {
  const childEnv: NodeJS.ProcessEnv = {
    ...process.env,
    VITE_USE_FIREBASE_EMULATORS: 'true',
    VITE_FIREBASE_EMULATOR_PROJECT_ID: PROJECT_ID,
    VITE_FIREBASE_AUTH_EMULATOR_HOST: AUTH_HOST,
    VITE_FIRESTORE_EMULATOR_HOST: FIRESTORE_HOST,
    VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST: FUNCTIONS_HOST,
    DISABLE_HMR: 'true'
  };
  delete childEnv.VITE_USE_FIREBASE_EMULATOR;

  const proc = spawn('npx', ['vite', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: process.cwd(),
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const start = Date.now();
  while (Date.now() - start < 30_000) {
    try {
      const res = await fetch(BASE_URL);
      if (res.status === 200) return proc;
    } catch {
      // waiting
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  proc.kill('SIGKILL');
  throw new Error('Vite emulator dev server não respondeu em 30s.');
}

async function attachRemoteFirewall(page: any, violations: string[], emulatorCalls: string[]) {
  await page.route('**/*', async (route: any) => {
    const req = route.request();
    const url = req.url();
    let parsedHost = '';
    try {
      parsedHost = new URL(url).hostname;
    } catch {
      parsedHost = '';
    }
    const isLocalHost = parsedHost === '127.0.0.1' || parsedHost === 'localhost';

    if (
      url.includes('siverc-94da3') ||
      (!isLocalHost &&
        (parsedHost.includes('firestore.googleapis.com') ||
          parsedHost.includes('identitytoolkit.googleapis.com') ||
          parsedHost.includes('securetoken.googleapis.com') ||
          parsedHost.includes('cloudfunctions.net')))
    ) {
      violations.push(`${req.method()} ${url}`);
      return route.abort();
    }
    if (
      isLocalHost &&
      (url.startsWith(`http://${AUTH_HOST}`) ||
        url.startsWith(`http://${FIRESTORE_HOST}`) ||
        url.startsWith(`http://${FUNCTIONS_HOST}`))
    ) {
      emulatorCalls.push(`${req.method()} ${url.slice(0, 120)}`);
    }
    return route.continue();
  });
}

async function assertIsolatedEmulatorsAvailable(): Promise<void> {
  const fetchJson = async (url: string) => {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(3000) });
    const ct = String(res.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('application/json')) {
      throw new Error(`Resposta não-JSON em ${url} (HTTP ${res.status}, content-type=${ct})`);
    }
    return { res, body: (await res.json()) as any };
  };

  const authCheck = await fetchJson(`http://${AUTH_HOST}/emulator/v1/projects/${PROJECT_ID}/config`);
  if (!authCheck.res.ok || !authCheck.body?.signIn || typeof authCheck.body.signIn !== 'object') {
    throw new Error(`Auth Emulator indisponível/inválido em http://${AUTH_HOST}`);
  }

  const fsCheck = await fetchJson(
    `http://${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/emulatorHealthProbe/probe`
  );
  const fsStatus = fsCheck.body?.error?.status;
  if (!(fsCheck.res.ok || fsStatus === 'PERMISSION_DENIED' || fsStatus === 'NOT_FOUND')) {
    throw new Error(`Firestore Emulator indisponível/inválido em http://${FIRESTORE_HOST}`);
  }

  const fnCheck = await fetchJson(`http://${FUNCTIONS_HOST}/backends`);
  const hasTriggers =
    Array.isArray(fnCheck.body?.backends) &&
    fnCheck.body.backends.length > 0 &&
    fnCheck.body.backends.some((b: any) => Array.isArray(b?.functionTriggers) && b.functionTriggers.length > 0);
  if (!fnCheck.res.ok || !hasTriggers) {
    throw new Error(`Functions Emulator indisponível ou sem triggers em http://${FUNCTIONS_HOST}`);
  }
}

async function main() {
  await assertIsolatedEmulatorsAvailable();

  // Limpar Firestore Emulator antes do teste
  await fetch(
    `http://${FIRESTORE_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  );

  // Criar utilizadores de teste no Auth Emulator
  const secInst1 = await createAuthUser('secretaria.moz@demo.test', 'DemoPass123!');
  const secNoPerm = await createAuthUser('sec.noperm@demo.test', 'DemoPass123!');
  const profInst1 = await createAuthUser('prof.moz@demo.test', 'DemoPass123!');
  const secInst2 = await createAuthUser('admin.inst2@demo.test', 'DemoPass123!');

  // Seed perfis users/{uid} no Firestore Emulator
  await fsSetDoc(`users/${secInst1.uid}`, {
    uid: secInst1.uid,
    email: 'secretaria.moz@demo.test',
    displayName: 'Secretaria Moztechwave Teste',
    role: 'SECRETARIA',
    roles: ['SECRETARIA'],
    institutionId: 'inst-1',
    institutionIds: ['inst-1'],
    status: 'Ativo',
    estado: 'ativo',
    disabled: false,
    permissions: ['cursos.create', 'cursos.edit', 'candidatos.config', 'vagas.manage']
  });

  await fsSetDoc(`users/${secNoPerm.uid}`, {
    uid: secNoPerm.uid,
    email: 'sec.noperm@demo.test',
    displayName: 'Secretaria Sem Permissoes',
    role: 'SECRETARIA',
    roles: ['SECRETARIA'],
    institutionId: 'inst-1',
    institutionIds: ['inst-1'],
    status: 'Ativo',
    estado: 'ativo',
    disabled: false,
    permissions: []
  });

  await fsSetDoc(`users/${profInst1.uid}`, {
    uid: profInst1.uid,
    email: 'prof.moz@demo.test',
    displayName: 'Professor Teste Moztechwave',
    role: 'PROFESSOR',
    roles: ['PROFESSOR'],
    institutionId: 'inst-1',
    institutionIds: ['inst-1'],
    status: 'Ativo',
    estado: 'ativo',
    disabled: false,
    permissions: []
  });

  await fsSetDoc(`users/${secInst2.uid}`, {
    uid: secInst2.uid,
    email: 'admin.inst2@demo.test',
    displayName: 'Admin Outra Instituicao',
    role: 'SECRETARIA',
    roles: ['SECRETARIA'],
    institutionId: 'inst-2',
    institutionIds: ['inst-2'],
    status: 'Ativo',
    estado: 'ativo',
    disabled: false,
    permissions: ['cursos.create', 'cursos.edit', 'candidatos.config']
  });

  const initialCoursesCfg = [
    {
      courseId: 'crs-moz-base-1',
      courseName: 'Engenharia de Software & Web Full-Stack',
      category: 'Tecnologia',
      active: true,
      price: 1500,
      monthlyFee: 4500,
      duration: '12 Meses',
      requirements: ['10ª Classe Concluída'],
      vacancies: 30,
      filledVacancies: 5,
      regimes: ['Laboral', 'Pós-Laboral'],
      shifts: ['Manhã', 'Noite'],
      documents: ['Bilhete de Identidade (BI)']
    }
  ];

  const baseOnlineCfg = {
    institutionId: 'inst-1',
    isOpen: true,
    title: 'Inscrições Abertas - 2º Semestre 2026',
    description: 'Portal oficial de candidaturas do CFTPM Moztechwave.',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    academicYear: '2026/2027',
    semester: '2º Semestre',
    requiredFields: {
      email: 'obrigatorio',
      phone: 'obrigatorio',
      documentNumber: 'obrigatorio',
      birthDate: 'obrigatorio',
      gender: 'obrigatorio',
      province: 'obrigatorio',
      city: 'obrigatorio',
      address: 'opcional',
      guardianName: 'oculto',
      guardianPhone: 'oculto',
      guardianRelationship: 'oculto',
      authorizedPickupPersons: 'oculto',
      nuit: 'opcional',
      previousSchool: 'opcional'
    },
    requiredDocuments: ['Bilhete de Identidade (BI) ou Passaporte válido'],
    documentRequirements: {
      'Bilhete de Identidade (BI) ou Passaporte válido': 'obrigatorio'
    },
    customQuestions: [
      {
        id: 'q1',
        question: 'Qual o seu nível de escolaridade atual?',
        type: 'select',
        options: ['10ª Classe Concluída', '12ª Classe Geral Concluída'],
        required: true
      }
    ],
    coursesConfig: initialCoursesCfg,
    autoApproveOnPayment: false,
    confirmationMessageTemplate: 'Prezado(a) {NOME}, sua inscrição no curso {CURSO} foi submetida com sucesso! Código: {CODIGO}.'
  };

  // Seed instituições inst-1 e inst-2 + curso base + documento público inicial
  await fsSetDoc('institutions/inst-1', {
    id: 'inst-1',
    institutionId: 'inst-1',
    code: 'MTW-CF-0001',
    name: 'Centro de Formação Técnico Profissional Moztechwave (CFTPM)',
    shortName: 'CFTPM Moztechwave',
    type: 'centro_formacao',
    phone: '+258 84 900 1200',
    whatsapp: '+258 84 900 1200',
    email: 'direcao@moztechwave.co.mz',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: 'Av. 24 de Julho nº 1840',
    status: 'Ativa',
    slug: 'moztechwave',
    slugAliases: ['cftpm-moztechwave', 'inst-1'],
    publicPortalPublished: true,
    branches: [
      { id: 'branch-main', institutionId: 'inst-1', name: 'Campus Sede Maputo', code: 'MPM-01', status: 'Ativa', isMainBranch: true }
    ],
    onlineRegistrationConfig: baseOnlineCfg
  });

  await fsSetDoc('courses/crs-moz-base-1', {
    id: 'crs-moz-base-1',
    institutionId: 'inst-1',
    name: 'Engenharia de Software & Web Full-Stack',
    code: 'ESW-01',
    category: 'Tecnologia',
    description: 'Formação prática em desenvolvimento web.',
    duration: '12 Meses',
    workloadHours: 1200,
    theoryHours: 400,
    practiceHours: 800,
    modality: 'Presencial',
    periodType: 'semestral',
    requirements: ['10ª Classe Concluída'],
    price: 25000,
    registrationFee: 1500,
    monthlyFee: 4500,
    feeMonthly: 4500,
    totalVacancies: 30,
    filledVacancies: 5,
    certificate: 'Certificado Técnico-Profissional',
    status: 'Inscrições Abertas',
    modules: []
  });

  await fsSetDoc('publicInstitutions/moztechwave', {
    id: 'moztechwave',
    institutionId: 'inst-1',
    slug: 'moztechwave',
    slugAliases: ['cftpm-moztechwave', 'inst-1'],
    name: 'Centro de Formação Técnico Profissional Moztechwave (CFTPM)',
    code: 'MTW-CF-0001',
    type: 'centro_formacao',
    phone: '+258 84 900 1200',
    email: 'direcao@moztechwave.co.mz',
    address: 'Av. 24 de Julho nº 1840',
    city: 'Maputo',
    province: 'Maputo Cidade',
    acceptedChannels: ['M-Pesa', 'e-Mola'],
    paymentMethods: { acceptedChannels: ['M-Pesa', 'e-Mola'], instructions: '' },
    branches: [
      { id: 'branch-main', institutionId: 'inst-1', name: 'Campus Sede Maputo', code: 'MPM-01', status: 'Ativa', isMainBranch: true }
    ],
    onlineRegistrationConfig: baseOnlineCfg,
    updatedAt: new Date().toISOString()
  });

  await fsSetDoc('publicInstitutions/_index', {
    slugs: ['moztechwave'],
    updatedAt: new Date().toISOString()
  });

  await fsSetDoc('institutions/inst-2', {
    id: 'inst-2',
    institutionId: 'inst-2',
    code: 'MTW-CF-0002',
    name: 'Centro Tecnológico de Inovação da Matola (CTIM)',
    type: 'centro_formacao',
    phone: '+258 87 210 3400',
    email: 'matola@moztechwave.co.mz',
    province: 'Maputo Província',
    city: 'Matola',
    address: 'Av. das Indústrias',
    status: 'Ativa',
    slug: 'ctim-matola',
    publicPortalPublished: true,
    onlineRegistrationConfig: {
      institutionId: 'inst-2',
      isOpen: true,
      title: 'Inscrições CTIM',
      description: 'CTIM Matola',
      requiredFields: { email: 'obrigatorio', phone: 'obrigatorio' },
      requiredDocuments: [],
      documentRequirements: {},
      customQuestions: [],
      coursesConfig: [],
      autoApproveOnPayment: false,
      confirmationMessageTemplate: 'OK'
    }
  });

  // Criar PDF mínimo válido para upload real no passo 10
  const tmpPdfPath = path.join(os.tmpdir(), 'bi_ficticio_e2e.pdf');
  fs.writeFileSync(
    tmpPdfPath,
    '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n',
    'utf8'
  );

  const viteProc = await startViteEmulatorServer();
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell'
  });

  const remoteViolations: string[] = [];
  const emulatorCalls: string[] = [];
  const results: Array<{ step: string; ok: boolean; evidence: string }> = [];

  const record = (step: string, ok: boolean, evidence: string) => {
    results.push({ step, ok, evidence });
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${step} | ${evidence}`);
  };

  try {
    // 1 & 2. Abrir /i/moztechwave em contexto limpo e verificar instituição
    const anonCtx1 = await browser.newContext();
    const anonPage1 = await anonCtx1.newPage();
    await attachRemoteFirewall(anonPage1, remoteViolations, emulatorCalls);

    await anonPage1.goto(`${BASE_URL}/i/moztechwave`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await anonPage1.getByText('Centro de Formação Técnico Profissional Moztechwave (CFTPM)').waitFor({ timeout: 15000 });
    const portalText1 = await anonPage1.evaluate(() => document.body.innerText);
    record(
      '1. Abrir aplicação local em /i/moztechwave',
      portalText1.includes('Moztechwave'),
      `URL=${anonPage1.url()} carregou via Emulator; chamadas remotas=${remoteViolations.length}`
    );
    record(
      '2. Verificar apresentação da instituição',
      portalText1.includes('Engenharia de Software & Web Full-Stack') && portalText1.includes('Inscrições Abertas'),
      'Título oficial, descrição e curso base renderizados a partir de publicInstitutions/moztechwave no Emulator'
    );
    await anonCtx1.close();

    // 3. Login como SECRETARIA de teste (secretaria.moz@demo.test)
    const secCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const secPage = await secCtx.newPage();
    secPage.on('console', (m: any) => {
      if (m.type() === 'error' || m.type() === 'warning') {
        console.log(`[secPage ${m.type()}]`, m.text());
      }
    });
    await attachRemoteFirewall(secPage, remoteViolations, emulatorCalls);

    await secPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await secPage.getByRole('button', { name: /Aceder à Gestão SIGAR/i }).click();
    await secPage.getByRole('button', { name: /E-mail & Senha/i }).click();
    await secPage.getByPlaceholder('utilizador@instituicao.ac.mz').fill('secretaria.moz@demo.test');
    await secPage.getByPlaceholder('••••••••').fill('DemoPass123!');
    await secPage.getByRole('button', { name: /Entrar no Sistema/i }).click();

    try {
      await secPage.getByRole('button', { name: /^Cursos$/i }).waitFor({ timeout: 20000 });
    } catch (waitErr) {
      const dbgText = await secPage.evaluate(() => document.body.innerText).catch(() => '');
      console.log('[DEBUG secPage body after login]:', dbgText.slice(0, 1200));
      throw waitErr;
    }
    record(
      '3. Entrar com conta SECRETARIA activa e autorizada da inst-1',
      true,
      'Login real via Firebase Auth Emulator (secretaria.moz@demo.test) e carregamento de inst-1 concluído'
    );

    // 4. Cadastrar curso de teste fictício
    const testCourseName = 'Curso Teste Energia Solar E2E';
    const testCourseCode = 'E2E-SOL-01';
    await secPage.getByRole('button', { name: /^Cursos$/i }).click();
    await secPage.getByRole('button', { name: /Novo Curso/i }).first().click();

    await secPage.locator('#input-course-name').fill(testCourseName);
    await secPage.locator('#input-course-code').fill(testCourseCode);
    await secPage.locator('#input-course-duration').fill('4 Meses');

    // Aba 2: vagas = 15
    await secPage.getByRole('button', { name: /2\. Estrutura & Valores/i }).click();
    await secPage.locator('#input-course-vacancies').fill('15');

    // Aba 4: definir estado "Inscrições Abertas" (publicado)
    await secPage.getByRole('button', { name: /4\. Certificação & Estado/i }).click();
    await secPage.locator('input[name="courseStatus"][value="Inscrições Abertas"]').check();

    await secPage.locator('#btn-save-course').click();
    await secPage.locator('#modal-course-container').waitFor({ state: 'detached', timeout: 20000 });
    await secPage.getByText(testCourseName).first().waitFor({ timeout: 10000 });
    record(
      '4. Cadastrar curso de teste com dados fictícios',
      true,
      `Curso "${testCourseName}" (${testCourseCode}, 15 vagas) criado via CourseModal`
    );

    // 5 & 6. Guardar, recarregar página e confirmar que continua guardado no Firestore Emulator
    await secPage.reload({ waitUntil: 'domcontentloaded', timeout: 25000 });
    await secPage.getByRole('button', { name: /^Cursos$/i }).waitFor({ timeout: 20000 });
    await secPage.getByRole('button', { name: /^Cursos$/i }).click();
    await secPage.getByText(testCourseName).first().waitFor({ timeout: 15000 });

    const allCoursesFs = await fsListCollection('courses');
    const createdCourseDoc = allCoursesFs.docs.find((d: any) => d.data?.name === testCourseName);
    assert.ok(createdCourseDoc && createdCourseDoc.data?.institutionId === 'inst-1', 'Curso não encontrado no Firestore Emulator após reload!');
    record(
      '5. Guardar e recarregar a página',
      true,
      'Página recarregada (page.reload) e reidratada via Auth/Firestore Emulator'
    );
    record(
      '6. Confirmar persistência real do curso após reload',
      Boolean(createdCourseDoc),
      `Persistido na UI e em Firestore Emulator courses/${createdCourseDoc.id} (totalVacancies=${createdCourseDoc.data.totalVacancies})`
    );

    // 7. Confirmar publicação do curso em publicInstitutions/moztechwave e publicInstitutions/_index
    const pubDocSnap = await fsGetDoc('publicInstitutions/moztechwave');
    const pubCourses = pubDocSnap.data?.onlineRegistrationConfig?.coursesConfig || [];
    const pubCourseEntry = pubCourses.find((c: any) => c.courseName === testCourseName && c.active === true);
    const idxSnap = await fsGetDoc('publicInstitutions/_index');
    assert.ok(pubCourseEntry, 'Curso não sincronizado para publicInstitutions/moztechwave!');
    assert.ok((idxSnap.data?.slugs || []).includes('moztechwave'), '_index sem moztechwave!');
    record(
      '7. Publicar o curso para inscrições',
      Boolean(pubCourseEntry),
      `Sincronizado automaticamente em publicInstitutions/moztechwave (active=true, vacancies=${pubCourseEntry.vacancies}) e _index=['moztechwave']`
    );

    // 8 & 9. Abrir portal em sessão anónima e confirmar que o novo curso aparece
    const anonCtx2 = await browser.newContext();
    const anonPage2 = await anonCtx2.newPage();
    await attachRemoteFirewall(anonPage2, remoteViolations, emulatorCalls);

    await anonPage2.goto(`${BASE_URL}/i/moztechwave`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await anonPage2.getByText(testCourseName).first().waitFor({ timeout: 15000 });
    record(
      '8. Abrir o portal numa sessão anónima',
      true,
      `Nova sessão browser sem cookies/autenticação acedeu a ${BASE_URL}/i/moztechwave`
    );
    record(
      '9. Confirmar que o novo curso aparece no portal público',
      true,
      `Card "${testCourseName}" visível na etapa 1 do portal público`
    );

    // 10. Submeter candidatura fictícia sem login (5 passos)
    await anonPage2.getByText(testCourseName).first().click();
    await anonPage2.getByRole('button', { name: /Avançar para Identificação/i }).click();

    // Passo 2
    const candName = 'Mário Fictício Nhantumbo';
    const candEmail = 'mario.ficticio@demo.test';
    await anonPage2.getByPlaceholder('Nome completo conforme documento').fill(candName);
    await anonPage2.locator('input[type="date"]').fill('2001-05-14');
    await anonPage2.getByPlaceholder('Número do BI / Cédula / Passaporte').fill('110199887766E');
    await anonPage2.getByPlaceholder('+258 84 / 85 / 86 XXX XXXX').fill('+258 84 999 8877');
    await anonPage2.getByPlaceholder('nome@exemplo.mz').fill(candEmail);

    // Género e Província (selects)
    const step2Selects = anonPage2.locator('select');
    const selectCount = await step2Selects.count();
    for (let i = 0; i < selectCount; i++) {
      const sel = step2Selects.nth(i);
      const html = await sel.innerHTML();
      if (html.includes('Masculino')) await sel.selectOption('Masculino');
      if (html.includes('Maputo Cidade')) await sel.selectOption('Maputo Cidade');
    }
    await anonPage2.getByPlaceholder('Cidade ou distrito de residência').fill('Maputo');
    await anonPage2.getByRole('button', { name: /Avançar para Questionário/i }).click();

    // Passo 3
    const qSelect = anonPage2.locator('select').first();
    if (await qSelect.count()) {
      await qSelect.selectOption('12ª Classe Geral Concluída');
    }
    await anonPage2.getByRole('button', { name: /Avançar para Documentos/i }).click();

    // Passo 4 (upload PDF mínimo válido)
    await anonPage2.getByRole('button', { name: /Carregar Arquivo/i }).first().click();
    await anonPage2.locator('input[type="file"][accept*="pdf"]').setInputFiles(tmpPdfPath);
    await anonPage2.getByText('bi_ficticio_e2e.pdf').waitFor({ timeout: 10000 });
    await anonPage2.getByRole('button', { name: /Avançar para Pagamento/i }).click();

    // Passo 5
    await anonPage2.getByPlaceholder(/Seu nº telemóvel/i).fill('849998877');
    const checkboxes = anonPage2.locator('input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await anonPage2.getByRole('button', { name: /Finalizar e Submeter Candidatura/i }).click();

    await anonPage2.getByText(/Candidatura Submetida|Comprovativo de Candidatura/i).first().waitFor({ timeout: 20000 });
    const receiptText = await anonPage2.evaluate(() => document.body.innerText);
    record(
      '10. Submeter candidatura fictícia sem login',
      receiptText.includes(candName),
      `Formulário de 5 passos submetido com sucesso em sessão anónima para "${candName}"`
    );

    // 11. Confirmar persistência real da candidatura no Firestore Emulator
    const appsTop = await fsListCollection('applications');
    const appsSub = await fsListCollection('institutions/inst-1/applications');
    const savedAppTop = appsTop.docs.find((d: any) => d.data?.email === candEmail);
    const savedAppSub = appsSub.docs.find((d: any) => d.data?.email === candEmail);
    assert.ok(savedAppTop && savedAppSub, 'Candidatura não persistida em applications e institutions/inst-1/applications!');
    assert.equal(savedAppTop.data.status, 'submetida');
    assert.equal(savedAppTop.data.paymentStatus, 'Pendente');
    record(
      '11. Confirmar persistência real da candidatura submetida',
      Boolean(savedAppTop && savedAppSub),
      `Persistida no Firestore Emulator em applications/${savedAppTop.id} e institutions/inst-1/applications/${savedAppSub.id} (status=submetida)`
    );
    await anonCtx2.close();

    // 12. Voltar à Secretaria e confirmar que a candidatura aparece (recarregar para ler última versão do Firestore)
    await secPage.reload({ waitUntil: 'domcontentloaded', timeout: 25000 });
    await secPage.getByRole('button', { name: /Inscrições & Candidaturas/i }).waitFor({ timeout: 20000 });
    await secPage.getByRole('button', { name: /Inscrições & Candidaturas/i }).click();
    await secPage.getByText(candName).first().waitFor({ timeout: 15000 });
    record(
      '12. Voltar à Secretaria e confirmar que a candidatura aparece',
      true,
      `Candidatura de "${candName}" carregada e exibida na lista de Inscrições & Candidaturas`
    );

    // 13. Recarregar a aplicação novamente e confirmar persistência tanto da candidatura como do curso
    await secPage.reload({ waitUntil: 'domcontentloaded', timeout: 25000 });
    await secPage.getByRole('button', { name: /Inscrições & Candidaturas/i }).waitFor({ timeout: 20000 });
    await secPage.getByRole('button', { name: /Inscrições & Candidaturas/i }).click();
    await secPage.getByText(candName).first().waitFor({ timeout: 15000 });
    await secPage.getByRole('button', { name: /^Cursos$/i }).click();
    await secPage.getByText(testCourseName).first().waitFor({ timeout: 15000 });
    record(
      '13. Recarregar a aplicação e confirmar persistência novamente',
      true,
      `Após novo reload, candidatura "${candName}" e curso "${testCourseName}" continuam carregados do Firestore Emulator`
    );
    await secCtx.close();

    // 14. Tentar consultar dados de inst-1 com conta de outra instituição (inst-2) e confirmar bloqueio
    const inst2Ctx = await browser.newContext();
    const inst2Page = await inst2Ctx.newPage();
    await attachRemoteFirewall(inst2Page, remoteViolations, emulatorCalls);

    await inst2Page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await inst2Page.getByRole('button', { name: /Aceder à Gestão SIGAR/i }).click();
    await inst2Page.getByRole('button', { name: /E-mail & Senha/i }).click();
    await inst2Page.getByPlaceholder('utilizador@instituicao.ac.mz').fill('admin.inst2@demo.test');
    await inst2Page.getByPlaceholder('••••••••').fill('DemoPass123!');
    await inst2Page.getByRole('button', { name: /Entrar no Sistema/i }).click();
    await inst2Page.getByRole('button', { name: /^Cursos$/i }).waitFor({ timeout: 20000 });
    await inst2Page.getByRole('button', { name: /^Cursos$/i }).click();
    await inst2Page.waitForTimeout(1500);
    const inst2Body = await inst2Page.evaluate(() => document.body.innerText);
    const uiIsolated = !inst2Body.includes(testCourseName);

    const inst2Token = (await signInAuthUser('admin.inst2@demo.test', 'DemoPass123!')).idToken;
    const crossReadInst = await fsGetDoc('institutions/inst-1', inst2Token);
    const crossReadCourse = await fsGetDoc(`courses/${createdCourseDoc.id}`, inst2Token);
    const crossReadApp = await fsGetDoc(`applications/${savedAppTop.id}`, inst2Token);

    assert.equal(uiIsolated, true);
    assert.equal(crossReadInst.status, 403);
    assert.equal(crossReadCourse.status, 403);
    assert.equal(crossReadApp.status, 403);
    record(
      '14. Consultar dados de inst-1 com conta de outra instituição (inst-2) e confirmar bloqueio',
      true,
      `UI isolada em inst-2; Firestore Rules devolveram HTTP 403 (PERMISSION_DENIED) em institutions/inst-1, courses/${createdCourseDoc.id} e applications/${savedAppTop.id}`
    );
    await inst2Ctx.close();

    // 15. Tentar editar o curso com perfis não autorizados (PROFESSOR e SECRETARIA sem permissões)
    const profToken = (await signInAuthUser('prof.moz@demo.test', 'DemoPass123!')).idToken;
    const secNoPermToken = (await signInAuthUser('sec.noperm@demo.test', 'DemoPass123!')).idToken;

    const profEditCourse = await fsSetDoc(
      `courses/${createdCourseDoc.id}`,
      { ...createdCourseDoc.data, name: 'CURSO_HACKEADO_PROF' },
      profToken
    );
    const secNoPermEditCourse = await fsSetDoc(
      `courses/${createdCourseDoc.id}`,
      { ...createdCourseDoc.data, name: 'CURSO_HACKEADO_SEC' },
      secNoPermToken
    );
    const profEditPublic = await fsSetDoc(
      'publicInstitutions/moztechwave',
      { ...pubDocSnap.data, name: 'PORTAL_HACKEADO' },
      profToken
    );
    const secNoPermEditPublic = await fsSetDoc(
      'publicInstitutions/moztechwave',
      { ...pubDocSnap.data, name: 'PORTAL_HACKEADO_SEC' },
      secNoPermToken
    );

    assert.equal(profEditCourse.status, 403);
    assert.equal(secNoPermEditCourse.status, 403);
    assert.equal(profEditPublic.status, 403);
    assert.equal(secNoPermEditPublic.status, 403);
    record(
      '15. Tentar editar o curso e portal público com perfil não autorizado e confirmar bloqueio',
      true,
      'Firestore Rules devolveram HTTP 403 (PERMISSION_DENIED) para PROFESSOR e para SECRETARIA sem permissão explícita (cursos.edit / candidatos.config)'
    );

    assert.equal(remoteViolations.length, 0, `Detectadas chamadas remotas proibidas: ${remoteViolations.join(', ')}`);
    assert.ok(emulatorCalls.length > 0, 'Nenhuma chamada aos Emuladores registada pelo browser!');
    console.log(`\nRESUMO E2E EMULATOR: ${results.filter((r) => r.ok).length}/15 cenários passaram | Chamadas Emulador=${emulatorCalls.length} | Violações Remotas=${remoteViolations.length}`);
  } finally {
    await browser.close();
    viteProc.kill('SIGTERM');
    if (fs.existsSync(tmpPdfPath)) fs.unlinkSync(tmpPdfPath);
  }
}

main().catch((err) => {
  console.error('FALHA NA SUÍTE E2E EMULATOR:', err);
  process.exit(1);
});
