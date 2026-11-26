/**
 * Suite de Integração Real com Firebase Emulator Suite (Auth + Firestore + Cloud Functions).
 *
 * PRÉ-REQUISITOS PARA EXECUÇÃO FUTURA:
 *   - Java Runtime (JDK 17+) instalado no PATH (exigido pelo Firestore Emulator)
 *   - Executar apenas contra Emuladores locais com project ID de demonstração:
 *     firebase emulators:exec --only auth,firestore,functions --project demo-sigar-test \
 *       "npx tsx tests/phase3_1/emulatorSuite.test.ts"
 *
 * SEGURANÇA: Este script aborta imediatamente se FIRESTORE_EMULATOR_HOST ou
 * FIREBASE_AUTH_EMULATOR_HOST não estiverem definidos, evitando qualquer leitura/escrita
 * acidental no projecto remoto siverc-94da3.
 */

import assert from 'node:assert/strict';

const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST;
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;

if (!FIRESTORE_HOST || !AUTH_HOST) {
  console.error(
    'ABORTADO: FIRESTORE_EMULATOR_HOST e FIREBASE_AUTH_EMULATOR_HOST são obrigatórios para executar a suite do Emulador.'
  );
  process.exit(2);
}

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-sigar-test';
const FUNCTIONS_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';

async function callCallableEmulator(name: string, data: Record<string, any>, idToken?: string) {
  const url = `http://${FUNCTIONS_HOST}/${PROJECT_ID}/us-central1/${name}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
    },
    body: JSON.stringify({ data })
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

async function createAuthUser(email: string, password: string, emailVerified = true): Promise<{ localId: string; idToken: string }> {
  const signUpRes = await fetch(
    `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );
  const created = (await signUpRes.json()) as any;
  assert.ok(created.localId && created.idToken, `Falha ao criar utilizador no Auth Emulator: ${JSON.stringify(created)}`);

  if (emailVerified) {
    await fetch(
      `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: created.idToken, emailVerified: true })
      }
    );
  }
  return { localId: created.localId, idToken: created.idToken };
}

async function main() {
  // Limpar Firestore Emulator antes da execução
  await fetch(
    `http://${FIRESTORE_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  );

  // 1. Criar contas no Auth Emulator para Inst A e Inst B
  const adminA = await createAuthUser('admin-a@alpha.co.mz', 'SenhaForte123!', true);
  const adminB = await createAuthUser('admin-b@beta.co.mz', 'SenhaForte123!', true);
  assert.notEqual(adminA.localId, adminB.localId);

  // 2. Verificar que callable sem autenticação é recusada por confirmEnrollmentVacancyCallable
  const unauthVacancy = await callCallableEmulator('confirmEnrollmentVacancyCallable', {
    institutionId: 'inst-b',
    courseId: 'course-b-1'
  });
  assert.notEqual(unauthVacancy.status, 200);

  // 3. Verificar que submitPublicCourseApplicationCallable rejeita payload sem contacto no Emulador real
  const badPublicApp = await callCallableEmulator('submitPublicCourseApplicationCallable', {
    institutionId: 'inst-b',
    slug: 'centro-beta',
    courseId: 'course-b-1',
    courseName: 'Curso B',
    fullName: 'Candidato Sem Contacto',
    termsAccepted: true,
    privacyAccepted: true
  });
  assert.notEqual(badPublicApp.status, 200);

  console.log('EMULATOR SMOKE SUITE COMPLETED.');
}

main().catch((err) => {
  console.error('EMULATOR SUITE FAILED:', err);
  process.exit(1);
});
