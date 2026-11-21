import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
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

interface CaseResult {
  id: number;
  name: string;
  passed: boolean;
  detail?: string;
}

const results: CaseResult[] = [];
let nextId = 1;

async function runCase(name: string, fn: () => Promise<void>) {
  const id = nextId++;
  try {
    await fn();
    results.push({ id, name, passed: true });
  } catch (err: any) {
    results.push({
      id,
      name,
      passed: false,
      detail: err?.message || String(err),
    });
  }
}

async function main() {
  const rules = readFileSync(process.env.RULES_FILE || 'firestore.rules', 'utf8');

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: 'siverc-94da3',
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    },
  });

  const SUPER_UID = 'uid-super-moztech';
  const JAFIM_UID = 'uid-jafim-diretor';
  const SEC_CEU_UID = 'uid-sec-ceu';
  const ALUNO_CEU_UID = 'uid-aluno-ceu';
  const DIR_CFTPM_UID = 'uid-dir-cftpm';
  const NEW_USER_UID = 'uid-new-attacker';

  try {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();

      // Seed: Super Admin legítimo
      await setDoc(doc(db, 'users', SUPER_UID), {
        id: SUPER_UID,
        email: 'moztechwavenacala8@gmail.com',
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN'],
        institutionId: '',
        status: 'aprovado',
      });
      await setDoc(doc(db, 'admins', SUPER_UID), {
        email: 'moztechwavenacala8@gmail.com',
        role: 'SUPER_ADMIN',
      });

      // Seed: Jafim (mesmo com vestígio legado em /admins e roles array com SUPER_ADMIN)
      await setDoc(doc(db, 'users', JAFIM_UID), {
        id: JAFIM_UID,
        email: 'jafimpaulo8@gmail.com',
        name: 'Jafim Paulo Rupia',
        role: 'DIRETOR',
        roles: ['DIRETOR', 'SUPER_ADMIN'],
        institutionId: 'ceu-azul-nacala',
        status: 'aprovado',
      });
      await setDoc(doc(db, 'admins', JAFIM_UID), {
        email: 'jafimpaulo8@gmail.com',
        role: 'SUPER_ADMIN',
      });

      // Seed: Secretaria & Aluno de Céu Azul
      await setDoc(doc(db, 'users', SEC_CEU_UID), {
        id: SEC_CEU_UID,
        email: 'sec.ceuazul@teste.mz',
        name: 'Secretaria Céu Azul',
        role: 'SECRETARIA',
        institutionId: 'ceu-azul-nacala',
        status: 'aprovado',
      });
      await setDoc(doc(db, 'users', ALUNO_CEU_UID), {
        id: ALUNO_CEU_UID,
        email: 'aluno.ceuazul@teste.mz',
        name: 'Aluno Céu Azul',
        role: 'ALUNO',
        institutionId: 'ceu-azul-nacala',
        status: 'ativo',
      });

      // Seed: Diretor de outra instituição (CFTPM inst-1)
      await setDoc(doc(db, 'users', DIR_CFTPM_UID), {
        id: DIR_CFTPM_UID,
        email: 'dir.cftpm@teste.mz',
        name: 'Diretor CFTPM',
        role: 'DIRETOR',
        institutionId: 'inst-1',
        status: 'aprovado',
      });

      // Seed: Access codes
      await setDoc(doc(db, 'access_codes', 'CEU-ALUNO-01'), {
        code: 'CEU-ALUNO-01',
        role: 'ALUNO',
        institutionId: 'ceu-azul-nacala',
        status: 'ativo',
      });
      await setDoc(doc(db, 'access_codes', 'MTW-SEC-001'), {
        code: 'MTW-SEC-001',
        role: 'SECRETARIA',
        institutionId: 'inst-1',
        status: 'ativo',
      });

      // Seed: Colecção exclusiva Super Admin
      await setDoc(doc(db, 'sivecApiKeys', 'key-prod-01'), {
        name: 'SIVEC Key',
        active: true,
      });
    });

    const anonDb = testEnv.unauthenticatedContext().firestore();
    const superVerifiedDb = testEnv
      .authenticatedContext(SUPER_UID, {
        email: 'moztechwavenacala8@gmail.com',
        email_verified: true,
      })
      .firestore();
    const superUnverifiedDb = testEnv
      .authenticatedContext(SUPER_UID, {
        email: 'moztechwavenacala8@gmail.com',
        email_verified: false,
      })
      .firestore();
    const jafimDb = testEnv
      .authenticatedContext(JAFIM_UID, {
        email: 'jafimpaulo8@gmail.com',
        email_verified: true,
      })
      .firestore();
    const secCeuDb = testEnv
      .authenticatedContext(SEC_CEU_UID, {
        email: 'sec.ceuazul@teste.mz',
        email_verified: true,
      })
      .firestore();
    const alunoCeuDb = testEnv
      .authenticatedContext(ALUNO_CEU_UID, {
        email: 'aluno.ceuazul@teste.mz',
        email_verified: true,
      })
      .firestore();
    const claimAttackerDb = testEnv
      .authenticatedContext(NEW_USER_UID, {
        email: 'atacante@teste.mz',
        email_verified: true,
        role: 'SUPER_ADMIN',
      })
      .firestore();

    // --- 1. SUPER ADMIN EXCLUSIVO ---
    await runCase('SUPER_ADMIN verificado (moztechwavenacala8@gmail.com) lê e escreve /admins, /access_codes, /users e /sivecApiKeys', async () => {
      await assertSucceeds(getDoc(doc(superVerifiedDb, 'admins', SUPER_UID)));
      await assertSucceeds(getDocs(collection(superVerifiedDb, 'admins')));
      await assertSucceeds(getDocs(collection(superVerifiedDb, 'access_codes')));
      await assertSucceeds(getDocs(collection(superVerifiedDb, 'users')));
      await assertSucceeds(getDoc(doc(superVerifiedDb, 'sivecApiKeys', 'key-prod-01')));
      await assertSucceeds(
        setDoc(doc(superVerifiedDb, 'users', 'uid-teste-super'), {
          id: 'uid-teste-super',
          role: 'DIRETOR',
          institutionId: 'inst-1',
          status: 'aprovado',
        })
      );
    });

    await runCase('moztechwavenacala8@gmail.com com email_verified=false NÃO passa isSuperAdmin()', async () => {
      await assertFails(getDoc(doc(superUnverifiedDb, 'admins', SUPER_UID)));
      await assertFails(getDocs(collection(superUnverifiedDb, 'users')));
      await assertFails(getDoc(doc(superUnverifiedDb, 'sivecApiKeys', 'key-prod-01')));
      await assertFails(getDoc(doc(superUnverifiedDb, 'access_codes', 'MTW-SEC-001')));
    });

    await runCase('jafimpaulo8@gmail.com NÃO é Super Admin (mesmo com registo legado em /admins) — bloqueado em /admins e /sivecApiKeys', async () => {
      await assertFails(getDoc(doc(jafimDb, 'admins', JAFIM_UID)));
      await assertFails(getDocs(collection(jafimDb, 'admins')));
      await assertFails(setDoc(doc(jafimDb, 'admins', 'uid-novo'), { role: 'SUPER_ADMIN' }));
      await assertFails(getDoc(doc(jafimDb, 'sivecApiKeys', 'key-prod-01')));
    });

    await runCase('Atacante com custom claim role=SUPER_ADMIN no token é rejeitado', async () => {
      await assertFails(getDoc(doc(claimAttackerDb, 'admins', SUPER_UID)));
      await assertFails(getDoc(doc(claimAttackerDb, 'sivecApiKeys', 'key-prod-01')));
    });

    // --- 2. /admins FECHADO ---
    await runCase('Anónimo e Aluno são bloqueados em /admins (get, list, write)', async () => {
      await assertFails(getDoc(doc(anonDb, 'admins', SUPER_UID)));
      await assertFails(getDocs(collection(anonDb, 'admins')));
      await assertFails(setDoc(doc(anonDb, 'admins', 'anon-admin'), { role: 'SUPER_ADMIN' }));
      await assertFails(getDoc(doc(alunoCeuDb, 'admins', SUPER_UID)));
    });

    // --- 3. /access_codes FECHADO ---
    await runCase('Anónimo e Aluno são bloqueados em /access_codes (get, list, create, update, delete)', async () => {
      await assertFails(getDoc(doc(anonDb, 'access_codes', 'CEU-ALUNO-01')));
      await assertFails(getDocs(collection(anonDb, 'access_codes')));
      await assertFails(setDoc(doc(anonDb, 'access_codes', 'HACK-01'), { code: 'HACK-01', role: 'SUPER_ADMIN', institutionId: 'inst-1' }));
      await assertFails(getDoc(doc(alunoCeuDb, 'access_codes', 'CEU-ALUNO-01')));
      await assertFails(deleteDoc(doc(anonDb, 'access_codes', 'CEU-ALUNO-01')));
    });

    await runCase('DIRETOR (jafimpaulo8@gmail.com) gere /access_codes de ceu-azul-nacala, mas é bloqueado em inst-1 e em role SUPER_ADMIN', async () => {
      await assertSucceeds(getDoc(doc(jafimDb, 'access_codes', 'CEU-ALUNO-01')));
      await assertSucceeds(
        getDocs(query(collection(jafimDb, 'access_codes'), where('institutionId', '==', 'ceu-azul-nacala')))
      );
      await assertSucceeds(
        setDoc(doc(jafimDb, 'access_codes', 'CEU-PROF-01'), {
          code: 'CEU-PROF-01',
          role: 'PROFESSOR',
          institutionId: 'ceu-azul-nacala',
          status: 'ativo',
        })
      );
      await assertFails(getDoc(doc(jafimDb, 'access_codes', 'MTW-SEC-001')));
      await assertFails(
        setDoc(doc(jafimDb, 'access_codes', 'CEU-FAKE-SA'), {
          code: 'CEU-FAKE-SA',
          role: 'SUPER_ADMIN',
          institutionId: 'ceu-azul-nacala',
        })
      );
      await assertFails(
        setDoc(doc(jafimDb, 'access_codes', 'MTW-FAKE-01'), {
          code: 'MTW-FAKE-01',
          role: 'DIRETOR',
          institutionId: 'inst-1',
        })
      );
    });

    // --- 4. /users SEM AUTO-PROMOÇÃO E SEM LEITURA PÚBLICA ---
    await runCase('Anónimo bloqueado em /users (get, list, create, update, delete)', async () => {
      await assertFails(getDoc(doc(anonDb, 'users', ALUNO_CEU_UID)));
      await assertFails(getDocs(collection(anonDb, 'users')));
      await assertFails(setDoc(doc(anonDb, 'users', 'anon-uid'), { role: 'SUPER_ADMIN', institutionId: 'inst-1' }));
      await assertFails(updateDoc(doc(anonDb, 'users', ALUNO_CEU_UID), { role: 'SUPER_ADMIN' }));
      await assertFails(deleteDoc(doc(anonDb, 'users', ALUNO_CEU_UID)));
    });

    await runCase('Novo utilizador autenticado NÃO pode criar próprio perfil em /users escolhendo role ou institutionId', async () => {
      await assertFails(
        setDoc(doc(claimAttackerDb, 'users', NEW_USER_UID), {
          id: NEW_USER_UID,
          role: 'SUPER_ADMIN',
          institutionId: 'inst-1',
          status: 'aprovado',
        })
      );
      await assertFails(
        setDoc(doc(claimAttackerDb, 'users', NEW_USER_UID), {
          id: NEW_USER_UID,
          role: 'ALUNO',
          institutionId: 'ceu-azul-nacala',
          status: 'ativo',
        })
      );
    });

    await runCase('ALUNO NÃO pode alterar role, institutionId ou status do próprio perfil, nem ler perfis de terceiros', async () => {
      await assertFails(updateDoc(doc(alunoCeuDb, 'users', ALUNO_CEU_UID), { role: 'SUPER_ADMIN' }));
      await assertFails(updateDoc(doc(alunoCeuDb, 'users', ALUNO_CEU_UID), { roles: ['DIRETOR'] }));
      await assertFails(updateDoc(doc(alunoCeuDb, 'users', ALUNO_CEU_UID), { institutionId: 'inst-1' }));
      await assertFails(updateDoc(doc(alunoCeuDb, 'users', ALUNO_CEU_UID), { status: 'aprovado_admin' }));
      await assertFails(getDoc(doc(alunoCeuDb, 'users', SEC_CEU_UID)));
      await assertFails(getDocs(collection(alunoCeuDb, 'users')));
      // Mas pode ler o próprio perfil e atualizar campos seguros (lastLoginAt/name/phone)
      await assertSucceeds(getDoc(doc(alunoCeuDb, 'users', ALUNO_CEU_UID)));
      await assertSucceeds(updateDoc(doc(alunoCeuDb, 'users', ALUNO_CEU_UID), { lastLoginAt: '2026-11-20T00:00:00Z', phone: '840000000' }));
    });

    await runCase('jafimpaulo8@gmail.com (DIRETOR) NÃO pode alterar role, roles, institutionId nem status do PRÓPRIO perfil', async () => {
      await assertFails(updateDoc(doc(jafimDb, 'users', JAFIM_UID), { role: 'SUPER_ADMIN' }));
      await assertFails(updateDoc(doc(jafimDb, 'users', JAFIM_UID), { roles: ['SUPER_ADMIN'] }));
      await assertFails(updateDoc(doc(jafimDb, 'users', JAFIM_UID), { institutionId: 'inst-1' }));
      await assertFails(updateDoc(doc(jafimDb, 'users', JAFIM_UID), { status: 'master' }));
      // Pode atualizar apenas campos seguros no próprio perfil
      await assertSucceeds(updateDoc(doc(jafimDb, 'users', JAFIM_UID), { lastLoginAt: '2026-11-20T01:00:00Z' }));
    });

    await runCase('jafimpaulo8@gmail.com lê/gere utilizadores de ceu-azul-nacala (sem SUPER_ADMIN) e é bloqueado em inst-1', async () => {
      await assertSucceeds(
        getDocs(query(collection(jafimDb, 'users'), where('institutionId', '==', 'ceu-azul-nacala')))
      );
      await assertSucceeds(
        setDoc(doc(jafimDb, 'users', 'uid-prof-ceu-novo'), {
          id: 'uid-prof-ceu-novo',
          name: 'Prof Céu Azul',
          role: 'PROFESSOR',
          institutionId: 'ceu-azul-nacala',
          status: 'aprovado',
        })
      );
      await assertSucceeds(updateDoc(doc(jafimDb, 'users', ALUNO_CEU_UID), { status: 'suspenso' }));
      // Tentativas proibidas:
      await assertFails(getDoc(doc(jafimDb, 'users', DIR_CFTPM_UID)));
      await assertFails(getDocs(query(collection(jafimDb, 'users'), where('institutionId', '==', 'inst-1'))));
      await assertFails(updateDoc(doc(jafimDb, 'users', ALUNO_CEU_UID), { role: 'SUPER_ADMIN' }));
      await assertFails(updateDoc(doc(jafimDb, 'users', ALUNO_CEU_UID), { institutionId: 'inst-1' }));
      await assertFails(
        setDoc(doc(jafimDb, 'users', 'uid-outro-cftpm'), {
          id: 'uid-outro-cftpm',
          role: 'ALUNO',
          institutionId: 'inst-1',
          status: 'ativo',
        })
      );
    });

    await runCase('SECRETARIA de ceu-azul-nacala lê utilizadores da própria escola e é bloqueada em inst-1', async () => {
      await assertSucceeds(
        getDocs(query(collection(secCeuDb, 'users'), where('institutionId', '==', 'ceu-azul-nacala')))
      );
      await assertFails(getDoc(doc(secCeuDb, 'users', DIR_CFTPM_UID)));
    });

    await runCase('DIRETOR NÃO pode injetar institutionIds/ownedInstitutions de outro centro, isSuperAdmin ou roles=["SUPER_ADMIN"] em terceiros', async () => {
      await assertFails(
        updateDoc(doc(jafimDb, 'users', ALUNO_CEU_UID), {
          institutionIds: ['ceu-azul-nacala', 'inst-1'],
        })
      );
      await assertFails(
        updateDoc(doc(jafimDb, 'users', ALUNO_CEU_UID), {
          ownedInstitutions: ['inst-1'],
        })
      );
      await assertFails(
        updateDoc(doc(jafimDb, 'users', ALUNO_CEU_UID), {
          isSuperAdmin: true,
        })
      );
      await assertFails(
        updateDoc(doc(jafimDb, 'users', ALUNO_CEU_UID), {
          roles: ['ALUNO', 'SUPER_ADMIN'],
        })
      );
    });

    await runCase('DIRETOR NÃO pode eliminar utilizadores em /users (apenas SUPER_ADMIN)', async () => {
      await assertFails(deleteDoc(doc(jafimDb, 'users', ALUNO_CEU_UID)));
    });

    await runCase('DIRETOR NÃO pode alterar email nem codigoAcesso no próprio perfil, mas pode atualizar name/preferences', async () => {
      await assertFails(
        updateDoc(doc(jafimDb, 'users', JAFIM_UID), {
          email: 'moztechwavenacala8@gmail.com',
        })
      );
      await assertFails(
        updateDoc(doc(jafimDb, 'users', JAFIM_UID), {
          codigoAcesso: 'MTW-ROOT-001',
        })
      );
      await assertSucceeds(
        updateDoc(doc(jafimDb, 'users', JAFIM_UID), {
          name: 'Jafim Paulo Rupia',
          preferences: { theme: 'claro' },
        })
      );
    });

    await runCase('DIRETOR NÃO pode alterar institutionId nem elevar role para SUPER_ADMIN ao atualizar /access_codes da própria escola', async () => {
      await assertFails(
        updateDoc(doc(jafimDb, 'access_codes', 'CEU-ALUNO-01'), {
          institutionId: 'inst-1',
        })
      );
      await assertFails(
        updateDoc(doc(jafimDb, 'access_codes', 'CEU-ALUNO-01'), {
          role: 'SUPER_ADMIN',
        })
      );
      await assertSucceeds(
        updateDoc(doc(jafimDb, 'access_codes', 'CEU-ALUNO-01'), {
          status: 'inativo',
        })
      );
    });

    console.log('\n================ RESULTADO EMULATOR — FASE A ================');
    let passed = 0;
    for (const r of results) {
      const tag = r.passed ? 'PASS' : 'FAIL';
      console.log(`[${r.id}] [${tag}] ${r.name}`);
      if (!r.passed && r.detail) {
        console.log(`     Erro: ${r.detail}`);
      }
      if (r.passed) passed++;
    }
    console.log('===============================================================');
    console.log(`TOTAL: ${passed}/${results.length} PASS`);

    if (passed !== results.length) {
      process.exitCode = 1;
    }
  } finally {
    await testEnv.cleanup();
  }
}

main().catch((err) => {
  console.error('Erro fatal nos testes do Emulator:', err);
  process.exit(1);
});
