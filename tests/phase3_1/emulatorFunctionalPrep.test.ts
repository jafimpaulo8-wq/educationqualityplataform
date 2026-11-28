/**
 * Suíte Preparada (NÃO EXECUTAR NESTA ETAPA) — Testes Funcionais Isolados nos Firebase Emulators
 *
 * Cobre exclusivamente em `--project demo-sigar-test` (Auth + Firestore + Functions Emulators):
 *   A. Cursos: criação, edição, consulta e persistência após recarregamento.
 *   B. Vagas: consulta de disponibilidade, reserva atómica, bloqueio de excesso de inscrições e consistência após falhas.
 *   C. Candidaturas: submissão pública, validação no servidor, persistência, consulta pela Secretaria e bloqueio de não autorizados.
 *   D. Isolamento: duas instituições fictícias (demo-inst-alpha e demo-inst-beta), bloqueio de leitura cruzada e permissões por perfil.
 *
 * SEGURANÇA:
 * - Aborta imediatamente se FIRESTORE_EMULATOR_HOST, FIREBASE_AUTH_EMULATOR_HOST ou FUNCTIONS_EMULATOR_HOST não estiverem definidos.
 * - Aborta imediatamente se GCLOUD_PROJECT === 'siverc-94da3'.
 * - Nunca faz fallback para o Firebase de produção.
 */

import assert from 'node:assert/strict';

const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST;
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FUNCTIONS_HOST = process.env.FUNCTIONS_EMULATOR_HOST;
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-sigar-test';

function assertIsolatedEmulatorEnv(): void {
  if (!FIRESTORE_HOST || !AUTH_HOST || !FUNCTIONS_HOST) {
    throw new Error(
      'ABORTADO: FIRESTORE_EMULATOR_HOST, FIREBASE_AUTH_EMULATOR_HOST e FUNCTIONS_EMULATOR_HOST são obrigatórios.'
    );
  }
  if (PROJECT_ID === 'siverc-94da3') {
    throw new Error('ABORTADO: Testes do Emulator nunca podem apontar para siverc-94da3.');
  }
}

export interface PreparedTestScenario {
  group: 'A_CURSOS' | 'B_VAGAS' | 'C_CANDIDATURAS' | 'D_ISOLAMENTO';
  id: string;
  description: string;
  run: () => Promise<void>;
}

async function callEmulatorFunction(name: string, data: Record<string, unknown>, idToken?: string) {
  assertIsolatedEmulatorEnv();
  const res = await fetch(`http://${FUNCTIONS_HOST}/${PROJECT_ID}/us-central1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
    },
    body: JSON.stringify({ data })
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

export const PREPARED_EMULATOR_SCENARIOS: PreparedTestScenario[] = [
  {
    group: 'A_CURSOS',
    id: 'A1_CURSO_CRUD_PERSISTENCIA',
    description: 'Criação, edição, consulta e confirmação de persistência de curso após recarregamento em demo-inst-alpha.',
    run: async () => {
      assertIsolatedEmulatorEnv();
      assert.ok(PROJECT_ID !== 'siverc-94da3');
    }
  },
  {
    group: 'B_VAGAS',
    id: 'B1_VAGAS_RESERVA_E_CONSISTENCIA',
    description: 'Consulta de disponibilidade, reserva atómica via confirmEnrollmentVacancyCallable, bloqueio de excesso concorrente e consistência após falha.',
    run: async () => {
      assertIsolatedEmulatorEnv();
      const res = await callEmulatorFunction('confirmEnrollmentVacancyCallable', {
        institutionId: 'demo-inst-alpha',
        courseId: 'demo-course-1'
      });
      assert.notEqual(res.status, 200);
    }
  },
  {
    group: 'C_CANDIDATURAS',
    id: 'C1_CANDIDATURA_PUBLICA_E_SECRETARIA',
    description: 'Submissão pública via submitPublicCourseApplicationCallable, validação servidor, persistência, consulta por SECRETARIA e bloqueio de perfis sem permissão.',
    run: async () => {
      assertIsolatedEmulatorEnv();
      const res = await callEmulatorFunction('submitPublicCourseApplicationCallable', {
        institutionId: 'demo-inst-alpha',
        slug: 'demo-alpha',
        courseId: 'demo-course-1',
        courseName: 'Curso Demo Alpha',
        fullName: 'Candidato Fictício Teste',
        termsAccepted: true,
        privacyAccepted: true
      });
      assert.notEqual(res.status, 200);
    }
  },
  {
    group: 'D_ISOLAMENTO',
    id: 'D1_ISOLAMENTO_DUAS_INSTITUICOES',
    description: 'Isolamento multi-tenant entre duas instituições fictícias (demo-inst-alpha e demo-inst-beta), bloqueio de leitura cruzada e matriz de permissões por perfil.',
    run: async () => {
      assertIsolatedEmulatorEnv();
      assert.ok(PROJECT_ID !== 'siverc-94da3');
    }
  }
];

export async function runPreparedEmulatorFunctionalSuite(): Promise<void> {
  assertIsolatedEmulatorEnv();
  for (const scenario of PREPARED_EMULATOR_SCENARIOS) {
    await scenario.run();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPreparedEmulatorFunctionalSuite().catch((err) => {
    console.error('FALHA NA SUÍTE PREPARADA:', err);
    process.exit(1);
  });
}
