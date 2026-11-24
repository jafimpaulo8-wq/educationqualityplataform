/**
 * Bateria Real de Testes E2E nos Firebase Emulators — SIGAR PRO
 * Projecto: siverc-94da3 | Base: (default)
 *
 * Executar via:
 *   npm run test:emulators
 *   (equivale a: firebase emulators:exec --project siverc-94da3 "npx tsx scripts/test_emulators_e2e.ts")
 *
 * Requer Java 17+ e Firebase Emulators (Auth:9099, Functions:5001, Firestore:8080, Storage:9199).
 */

import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { preparePublicInstitutionsSyncPayloads } from '../src/services/publicInstitutionService';

interface TestCase {
  id: number;
  suite: string;
  name: string;
  status: 'PASS' | 'FAIL';
  detail?: string;
}

const results: TestCase[] = [];
let nextId = 1;

async function runCase(suite: string, name: string, fn: () => Promise<void>) {
  const id = nextId++;
  try {
    await fn();
    results.push({ id, suite, name, status: 'PASS' });
  } catch (err: any) {
    results.push({
      id,
      suite,
      name,
      status: 'FAIL',
      detail: err?.message || String(err)
    });
  }
}

async function createEmulatorUserAndGetToken(params: {
  email: string;
  password: string;
  emailVerified: boolean;
}): Promise<{ localId: string; idToken: string }> {
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
  const signUpRes = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        returnSecureToken: true
      })
    }
  );
  const signUpData = (await signUpRes.json()) as any;
  if (!signUpRes.ok) {
    throw new Error(`Auth signUp failed: ${JSON.stringify(signUpData)}`);
  }

  if (params.emailVerified) {
    await fetch(
      `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: signUpData.idToken,
          emailVerified: true,
          returnSecureToken: true
        })
      }
    );
  }

  const signInRes = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        returnSecureToken: true
      })
    }
  );
  const signInData = (await signInRes.json()) as any;
  if (!signInRes.ok) {
    throw new Error(`Auth signIn failed: ${JSON.stringify(signInData)}`);
  }
  return { localId: signInData.localId, idToken: signInData.idToken };
}

async function callFunctionEmulator<T = any>(
  functionName: string,
  data: Record<string, any>,
  idToken?: string
): Promise<{ ok: boolean; status: number; body: any }> {
  const fnHost = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
  const url = `http://${fnHost}/siverc-94da3/us-central1/${functionName}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data })
  });
  const json = await res.json();
  return { ok: res.ok && !json.error, status: res.status, body: json };
}

async function main() {
  const firestoreRules = readFileSync('firestore.rules', 'utf8');
  const storageRules = readFileSync('firebase/storage.rules', 'utf8');

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: 'siverc-94da3',
    firestore: {
      rules: firestoreRules,
      host: '127.0.0.1',
      port: 8080
    },
    storage: {
      rules: storageRules,
      host: '127.0.0.1',
      port: 9199
    }
  });

  const SUPER_UID = '2dRLWqnY1zf1MlR9rZYhAKPvGbV2';
  const SUPER_EMAIL = 'moztechwavenacala8@gmail.com';
  const ADMIN_CFTPM_UID = 'uid-admin-inst1';
  const DIRECTOR_CFTPM_UID = 'uid-dir-inst1';
  const CEO_CEU_UID = 'uid-ceo-ceuazul';
  const SEC_WITH_PERM_UID = 'uid-sec-perm-ceu';
  const SEC_NO_PERM_UID = 'uid-sec-noperm-ceu';
  const PROF_CEU_UID = 'uid-prof-ceu';
  const FORMADOR_CFTPM_UID = 'uid-formador-inst1';

  try {
    // Seed de base no Firestore Emulator (sem alterar produção)
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      const payloads = preparePublicInstitutionsSyncPayloads();

      await setDoc(doc(db, 'publicInstitutions', 'moztechwave'), payloads.moztechwave);
      await setDoc(doc(db, 'publicInstitutions', 'ceu-azul-nacala'), payloads['ceu-azul-nacala']);

      await setDoc(doc(db, 'institutions', 'inst-1'), {
        id: 'inst-1',
        name: 'CFTPM Moztechwave'
      });
      await setDoc(doc(db, 'institutions', 'ceu-azul-nacala'), {
        id: 'ceu-azul-nacala',
        name: 'Centro Infantil Céu Azul'
      });

      await setDoc(doc(db, 'users', SUPER_UID), {
        id: SUPER_UID,
        email: SUPER_EMAIL,
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN'],
        institutionId: '',
        status: 'aprovado'
      });

      await setDoc(doc(db, 'users', ADMIN_CFTPM_UID), {
        id: ADMIN_CFTPM_UID,
        email: 'admin.cftpm@moztechwave.co.mz',
        role: 'ADMIN_INSTITUICAO',
        institutionId: 'inst-1',
        status: 'aprovado'
      });

      await setDoc(doc(db, 'users', DIRECTOR_CFTPM_UID), {
        id: DIRECTOR_CFTPM_UID,
        email: 'diretor.cftpm@moztechwave.co.mz',
        role: 'DIRETOR',
        institutionId: 'inst-1',
        status: 'aprovado'
      });

      await setDoc(doc(db, 'users', FORMADOR_CFTPM_UID), {
        id: FORMADOR_CFTPM_UID,
        email: 'formador@moztechwave.co.mz',
        role: 'FORMADOR',
        institutionId: 'inst-1',
        status: 'aprovado'
      });

      await setDoc(doc(db, 'users', CEO_CEU_UID), {
        id: CEO_CEU_UID,
        email: 'ceo.ceuazul@moztechwave.co.mz',
        role: 'CEO',
        institutionId: 'ceu-azul-nacala',
        status: 'aprovado'
      });

      await setDoc(doc(db, 'users', SEC_WITH_PERM_UID), {
        id: SEC_WITH_PERM_UID,
        email: 'sec.vagas@ceuazul.co.mz',
        role: 'SECRETARIA',
        institutionId: 'ceu-azul-nacala',
        permissions: ['alunos.view', 'vagas.manage', 'vagas.review_applications'],
        status: 'aprovado'
      });

      await setDoc(doc(db, 'users', SEC_NO_PERM_UID), {
        id: SEC_NO_PERM_UID,
        email: 'sec.basica@ceuazul.co.mz',
        role: 'SECRETARIA',
        institutionId: 'ceu-azul-nacala',
        permissions: ['alunos.view', 'diario.view'],
        status: 'aprovado'
      });

      await setDoc(doc(db, 'users', PROF_CEU_UID), {
        id: PROF_CEU_UID,
        email: 'prof@ceuazul.co.mz',
        role: 'PROFESSOR',
        institutionId: 'ceu-azul-nacala',
        status: 'aprovado'
      });

      await setDoc(doc(db, 'students', 'stud-ceu-priv-1'), {
        id: 'stud-ceu-priv-1',
        institutionId: 'ceu-azul-nacala',
        fullName: 'Criança Privada Teste'
      });
    });

    // Contextos autenticados
    const superCtx = testEnv.authenticatedContext(SUPER_UID, {
      email: SUPER_EMAIL,
      email_verified: true
    });
    const superUnverifiedCtx = testEnv.authenticatedContext(SUPER_UID, {
      email: SUPER_EMAIL,
      email_verified: false
    });
    const adminCftpmCtx = testEnv.authenticatedContext(ADMIN_CFTPM_UID, {
      email: 'admin.cftpm@moztechwave.co.mz',
      email_verified: true
    });
    const directorCftpmCtx = testEnv.authenticatedContext(DIRECTOR_CFTPM_UID, {
      email: 'diretor.cftpm@moztechwave.co.mz',
      email_verified: true
    });
    const ceoCeuCtx = testEnv.authenticatedContext(CEO_CEU_UID, {
      email: 'ceo.ceuazul@moztechwave.co.mz',
      email_verified: true
    });
    const secPermCtx = testEnv.authenticatedContext(SEC_WITH_PERM_UID, {
      email: 'sec.vagas@ceuazul.co.mz',
      email_verified: true
    });
    const secNoPermCtx = testEnv.authenticatedContext(SEC_NO_PERM_UID, {
      email: 'sec.basica@ceuazul.co.mz',
      email_verified: true
    });
    const profCtx = testEnv.authenticatedContext(PROF_CEU_UID, {
      email: 'prof@ceuazul.co.mz',
      email_verified: true
    });
    const formadorCtx = testEnv.authenticatedContext(FORMADOR_CFTPM_UID, {
      email: 'formador@moztechwave.co.mz',
      email_verified: true
    });
    const anonCtx = testEnv.unauthenticatedContext();

    // -------------------------------------------------------------------------
    // SUITE 1: PERMISSÕES DE PUBLICAÇÃO DE VAGAS & ISOLAMENTO (FIRESTORE RULES)
    // -------------------------------------------------------------------------
    await runCase('Permissões Vagas', 'Super Admin publica vagas em CFTPM (inst-1) e Céu Azul (ceu-azul-nacala)', async () => {
      const db = superCtx.firestore();
      await assertSucceeds(
        setDoc(doc(db, 'institutions', 'inst-1', 'jobVacancies', 'vaga-cftpm-1'), {
          id: 'vaga-cftpm-1',
          institutionId: 'inst-1',
          title: 'Formador de Electrónica',
          status: 'publicada',
          applicationsCount: 0,
          deadline: '2026-12-31'
        })
      );
      await assertSucceeds(
        setDoc(doc(db, 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-ceu-1'), {
          id: 'vaga-ceu-1',
          institutionId: 'ceu-azul-nacala',
          title: 'Educadora de Infância',
          status: 'rascunho',
          applicationsCount: 0,
          deadline: '2026-12-31'
        })
      );
      await assertSucceeds(
        updateDoc(doc(db, 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-ceu-1'), {
          status: 'publicada'
        })
      );
      await assertSucceeds(
        updateDoc(doc(db, 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-ceu-1'), {
          status: 'encerrada'
        })
      );
    });

    await runCase('Permissões Vagas', 'Admin/Diretor/CEO publica apenas na sua instituição e é bloqueado noutra; Super Admin sem email verificado é bloqueado', async () => {
      await assertSucceeds(
        setDoc(doc(adminCftpmCtx.firestore(), 'institutions', 'inst-1', 'jobVacancies', 'vaga-cftpm-2'), {
          id: 'vaga-cftpm-2',
          institutionId: 'inst-1',
          title: 'Instrutor de Redes',
          status: 'publicada',
          applicationsCount: 0
        })
      );
      await assertSucceeds(
        setDoc(doc(directorCftpmCtx.firestore(), 'institutions', 'inst-1', 'jobVacancies', 'vaga-cftpm-dir-1'), {
          id: 'vaga-cftpm-dir-1',
          institutionId: 'inst-1',
          title: 'Formador de Electricidade',
          status: 'rascunho',
          applicationsCount: 0
        })
      );
      await assertSucceeds(
        setDoc(doc(ceoCeuCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-ceu-2'), {
          id: 'vaga-ceu-2',
          institutionId: 'ceu-azul-nacala',
          title: 'Auxiliar Pedagógica',
          status: 'publicada',
          applicationsCount: 0,
          deadline: '2026-12-31'
        })
      );
      await assertFails(
        setDoc(doc(adminCftpmCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-invasao'), {
          id: 'vaga-invasao',
          institutionId: 'ceu-azul-nacala',
          title: 'Vaga Cruzada Inválida',
          status: 'publicada',
          applicationsCount: 0
        })
      );
      await assertFails(
        setDoc(doc(directorCftpmCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-dir-invasao'), {
          id: 'vaga-dir-invasao',
          institutionId: 'ceu-azul-nacala',
          title: 'Vaga Cruzada Diretor Inválida',
          status: 'publicada',
          applicationsCount: 0
        })
      );
      await assertFails(
        setDoc(doc(superUnverifiedCtx.firestore(), 'institutions', 'inst-1', 'jobVacancies', 'vaga-unverif-super'), {
          id: 'vaga-unverif-super',
          institutionId: 'inst-1',
          title: 'Super Admin Sem Verificação',
          status: 'publicada',
          applicationsCount: 0
        })
      );
    });

    await runCase('Permissões Vagas', 'Secretaria COM permissão explícita (vagas.manage) publica; Secretaria SEM permissão é bloqueada', async () => {
      await assertSucceeds(
        setDoc(doc(secPermCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-sec-ok'), {
          id: 'vaga-sec-ok',
          institutionId: 'ceu-azul-nacala',
          title: 'Secretária Adjunta',
          status: 'rascunho',
          applicationsCount: 0
        })
      );
      await assertFails(
        setDoc(doc(secNoPermCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-sec-fail'), {
          id: 'vaga-sec-fail',
          institutionId: 'ceu-azul-nacala',
          title: 'Secretaria Sem Permissão',
          status: 'publicada',
          applicationsCount: 0
        })
      );
    });

    await runCase('Permissões Vagas', 'Professor, Formador e Utilizador Não Autenticado são bloqueados ao criar/editar vagas', async () => {
      await assertFails(
        setDoc(doc(profCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-prof-fail'), {
          id: 'vaga-prof-fail',
          institutionId: 'ceu-azul-nacala',
          title: 'Tentativa Docente',
          status: 'publicada',
          applicationsCount: 0
        })
      );
      await assertFails(
        setDoc(doc(formadorCtx.firestore(), 'institutions', 'inst-1', 'jobVacancies', 'vaga-formador-fail'), {
          id: 'vaga-formador-fail',
          institutionId: 'inst-1',
          title: 'Tentativa Formador',
          status: 'publicada',
          applicationsCount: 0
        })
      );
      await assertFails(
        setDoc(doc(anonCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-anon-fail'), {
          id: 'vaga-anon-fail',
          institutionId: 'ceu-azul-nacala',
          title: 'Tentativa Anónima',
          status: 'publicada',
          applicationsCount: 0
        })
      );
    });

    await runCase('Revisão Candidaturas', 'Apenas gestor autorizado da instituição actualiza parecer em jobApplications e tracking; intrusos bloqueados', async () => {
      const appRef = doc(secPermCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobApplications', 'app-review-1');
      await assertSucceeds(
        setDoc(appRef, {
          id: 'app-review-1',
          institutionId: 'ceu-azul-nacala',
          vacancyId: 'vaga-ceu-2',
          status: 'RECEBIDA',
          fullName: 'Candida Teste'
        })
      );
      await assertSucceeds(
        updateDoc(appRef, {
          status: 'ENTREVISTA',
          internalNotes: 'Perfil aprovado para entrevista'
        })
      );
      await assertFails(
        updateDoc(doc(secNoPermCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobApplications', 'app-review-1'), {
          status: 'APROVADA'
        })
      );
      await assertFails(
        updateDoc(doc(profCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobApplications', 'app-review-1'), {
          status: 'APROVADA'
        })
      );
      await assertFails(
        updateDoc(doc(adminCftpmCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobApplications', 'app-review-1'), {
          status: 'APROVADA'
        })
      );
    });

    await runCase('Isolamento Multi-Tenant', 'Admin de inst-1 não pode ler dados privados nem rascunhos de ceu-azul-nacala', async () => {
      await assertFails(getDoc(doc(adminCftpmCtx.firestore(), 'students', 'stud-ceu-priv-1')));
      await assertFails(getDoc(doc(adminCftpmCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-sec-ok')));
    });

    await runCase('Permissões Vagas', 'Visibilidade pública: rascunho bloqueado para anónimo, publicada legível para anónimo', async () => {
      await assertSucceeds(
        setDoc(doc(ceoCeuCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-ceu-pub'), {
          id: 'vaga-ceu-pub',
          institutionId: 'ceu-azul-nacala',
          title: 'Vaga Pública Céu Azul',
          status: 'publicada',
          applicationsCount: 0,
          deadline: '2026-12-31'
        })
      );
      await assertSucceeds(getDoc(doc(anonCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-ceu-pub')));
      await assertFails(getDoc(doc(anonCtx.firestore(), 'institutions', 'ceu-azul-nacala', 'jobVacancies', 'vaga-sec-ok')));
    });

    // -------------------------------------------------------------------------
    // SUITE 2: INSCRIÇÕES PÚBLICAS ISOLADAS (FIRESTORE RULES)
    // -------------------------------------------------------------------------
    await runCase('Inscrições Públicas', 'Permite submissão válida para moztechwave e ceu-azul-nacala; rejeita slug inexistente', async () => {
      const dbAnon = anonCtx.firestore();
      await assertSucceeds(
        setDoc(doc(dbAnon, 'applications', 'app-moz-public-1'), {
          institutionId: 'inst-1',
          slug: 'moztechwave',
          fullName: 'Ana Paula Chissano',
          phone: '841002030',
          courseId: 'inf-1',
          courseName: 'Informática',
          termsAccepted: true,
          privacyAccepted: true,
          status: 'submetida',
          paymentStatus: 'Pendente'
        })
      );
      await assertSucceeds(
        setDoc(doc(dbAnon, 'applications', 'app-ceu-public-1'), {
          institutionId: 'ceu-azul-nacala',
          slug: 'ceu-azul-nacala',
          fullName: 'Criança Teste Céu Azul',
          guardianName: 'Encarregado Teste',
          guardianPhone: '841112233',
          courseId: 'bercario',
          courseName: 'Berçário',
          termsAccepted: true,
          privacyAccepted: true,
          status: 'submetida',
          paymentStatus: 'Pendente'
        })
      );
      await assertFails(
        setDoc(doc(dbAnon, 'applications', 'app-invalid-slug-1'), {
          institutionId: 'inst-inexistente',
          slug: 'slug-inexistente',
          fullName: 'Candidato Inválido',
          courseId: 'c1',
          courseName: 'Curso X',
          termsAccepted: true,
          privacyAccepted: true,
          status: 'submetida',
          paymentStatus: 'Pendente'
        })
      );
    });

    // -------------------------------------------------------------------------
    // SUITE 3: AUTH + FUNCTIONS EMULATOR (CONVITES & CANDIDATURAS A VAGAS)
    // -------------------------------------------------------------------------
    if (process.env.FUNCTIONS_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      await runCase('Convites E2E (Auth+Functions)', 'Rejeita email não verificado; activa com email verificado e permite login', async () => {
        const inviteToken = 'tok_emu_invite_1234567890abcdef';
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
          await setDoc(doc(ctx.firestore(), 'userInvitations', inviteToken), {
            id: inviteToken,
            token: inviteToken,
            fullName: 'Formador Emulator',
            email: 'formador.emu@teste.mz',
            institutionId: 'inst-1',
            role: 'FORMADOR',
            permissions: ['view_dashboard'],
            status: 'pendente',
            used: false,
            revoked: false,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            expiresAtMs: Date.now() + 86400000
          });
        });

        const unverifiedUser = await createEmulatorUserAndGetToken({
          email: 'formador.emu@teste.mz',
          password: 'SigarPassword2026!',
          emailVerified: false
        });
        const failUnverified = await callFunctionEmulator(
          'validateAndConsumeUserInvitation',
          { token: inviteToken },
          unverifiedUser.idToken
        );
        if (failUnverified.ok) {
          throw new Error('Deveria rejeitar utilizador sem email_verified=true');
        }

        const verifiedUser = await createEmulatorUserAndGetToken({
          email: 'formador.emu@teste.mz',
          password: 'SigarPassword2026!',
          emailVerified: true
        });
        const passVerified = await callFunctionEmulator(
          'validateAndConsumeUserInvitation',
          { token: inviteToken },
          verifiedUser.idToken
        );
        if (!passVerified.ok || !passVerified.body?.result?.ok) {
          throw new Error(`Activação falhou: ${JSON.stringify(passVerified.body)}`);
        }

        const reuseAttempt = await callFunctionEmulator(
          'validateAndConsumeUserInvitation',
          { token: inviteToken },
          verifiedUser.idToken
        );
        if (reuseAttempt.ok) {
          throw new Error('Convite reutilizado deveria ser rejeitado');
        }

        // Rejeita e-mail divergente, expirado e tentativa de convite SUPER_ADMIN
        const expiredToken = 'tok_emu_expired_1234567890abcd';
        const superToken = 'tok_emu_super_1234567890abcdef';
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
          await setDoc(doc(ctx.firestore(), 'userInvitations', expiredToken), {
            id: expiredToken,
            token: expiredToken,
            fullName: 'Expirado Emu',
            email: 'expirado.emu@teste.mz',
            institutionId: 'inst-1',
            role: 'PROFESSOR',
            status: 'pendente',
            used: false,
            revoked: false,
            expiresAt: new Date(Date.now() - 60000).toISOString(),
            expiresAtMs: Date.now() - 60000
          });
          await setDoc(doc(ctx.firestore(), 'userInvitations', superToken), {
            id: superToken,
            token: superToken,
            fullName: 'Intruso Super',
            email: 'intruso.super@teste.mz',
            institutionId: 'inst-1',
            role: 'SUPER_ADMIN',
            status: 'pendente',
            used: false,
            revoked: false,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            expiresAtMs: Date.now() + 86400000
          });
        });

        const intruderUser = await createEmulatorUserAndGetToken({
          email: 'intruso.super@teste.mz',
          password: 'SigarPassword2026!',
          emailVerified: true
        });
        const failSuper = await callFunctionEmulator('validateAndConsumeUserInvitation', { token: superToken }, intruderUser.idToken);
        const failMismatch = await callFunctionEmulator('validateAndConsumeUserInvitation', { token: expiredToken }, intruderUser.idToken);
        if (failSuper.ok || failMismatch.ok) {
          throw new Error('Deveria rejeitar convite SUPER_ADMIN e e-mail divergente/expirado');
        }
      });

      await runCase('Vagas E2E (Functions)', 'Submete candidatura válida, bloqueia duplicada e cria tracking sem PII', async () => {
        const pdfBase64 = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4\nCV EMULATOR').toString('base64');
        const payload = {
          institutionId: 'ceu-azul-nacala',
          vacancyId: 'vaga-ceu-2',
          fullName: 'Helena Macuácua',
          email: 'helena.emu@teste.mz',
          phone: '849998877',
          academicLevel: 'Licenciatura em Pedagogia',
          experienceSummary: '3 anos de experiência em ensino infantil.',
          attachments: [{ fileName: 'cv_helena.pdf', mimeType: 'application/pdf', sizeBytes: 1200, dataUrl: pdfBase64 }]
        };
        const sub1 = await callFunctionEmulator('submitPublicJobApplicationCallable', payload);
        if (!sub1.ok || !sub1.body?.result?.trackingToken) {
          throw new Error(`Submissão pública falhou: ${JSON.stringify(sub1.body)}`);
        }
        const subDup = await callFunctionEmulator('submitPublicJobApplicationCallable', payload);
        if (subDup.ok) {
          throw new Error('Candidatura duplicada deveria ser rejeitada com already-exists');
        }
        const trackSnap = await getDoc(doc(anonCtx.firestore(), 'jobApplicationTracking', sub1.body.result.trackingToken));
        if (!trackSnap.exists() || 'email' in trackSnap.data()!) {
          throw new Error('Tracking inválido ou expondo PII');
        }
      });
    }

    // -------------------------------------------------------------------------
    // SUITE 4: STORAGE RULES EMULATOR
    // -------------------------------------------------------------------------
    await runCase('Storage Rules', 'Permite upload de CV válido por gestor autorizado e bloqueia sem permissão / cross-tenant / >450KB', async () => {
      const pdfBytes = new Uint8Array(Buffer.from('%PDF-1.4\nCV TESTE'));
      const oversizedBytes = new Uint8Array(460 * 1024);

      const secStorage = secPermCtx.storage();
      await assertSucceeds(
        secStorage
          .ref('institutions/ceu-azul-nacala/jobApplications/app1/cv.pdf')
          .put(pdfBytes, { contentType: 'application/pdf' })
          .then((s) => s)
      );

      const secNoPermStorage = secNoPermCtx.storage();
      await assertFails(
        secNoPermStorage
          .ref('institutions/ceu-azul-nacala/jobApplications/app1/cv2.pdf')
          .put(pdfBytes, { contentType: 'application/pdf' })
          .then((s) => s)
      );

      const adminCftpmStorage = adminCftpmCtx.storage();
      await assertFails(
        adminCftpmStorage
          .ref('institutions/ceu-azul-nacala/jobApplications/app1/cv3.pdf')
          .put(pdfBytes, { contentType: 'application/pdf' })
          .then((s) => s)
      );

      await assertFails(
        secStorage
          .ref('institutions/ceu-azul-nacala/jobApplications/app1/cv_big.pdf')
          .put(oversizedBytes, { contentType: 'application/pdf' })
          .then((s) => s)
      );
    });
  } finally {
    await testEnv.cleanup();
  }

  console.log('========================================================================');
  console.log('SIGAR PRO — RESULTADO E2E NO FIREBASE EMULATOR SUITE');
  console.log('========================================================================');
  let passed = 0;
  for (const r of results) {
    console.log(`[${r.id}] [${r.status}] [${r.suite}] ${r.name}`);
    if (r.detail) console.log(`    Detalhe: ${r.detail}`);
    if (r.status === 'PASS') passed++;
  }
  console.log('------------------------------------------------------------------------');
  console.log(`TOTAL: ${passed}/${results.length} PASS.`);
  console.log('========================================================================');
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((err) => {
  console.error('Erro ao executar testes no Emulator:', err);
  process.exit(1);
});
