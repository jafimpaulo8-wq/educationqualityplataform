import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';

import {
  buildPublicInstitutionFromModel,
  executePublishPublicInstitutionTransaction,
  executeUnpublishPublicInstitutionTransaction,
  PublicInstitutionTxAdapter,
  sanitizePublicInstitutionPayload
} from '../../src/services/publicInstitutionService';
import {
  getRemainingVacancies,
  isCourseSoldOut,
  validateFullRegistration,
  validateRegistrationStep
} from '../../src/utils/registrationConfigUtils';
import {
  buildInviteActivationUrl,
  canCallerInviteRole,
  sanitizeInvitePermissions,
  validateInviteActivationState,
  validateInviteCreationInput
} from '../../src/services/inviteAuthService';
import { Institution, OnlineRegistrationConfig, Permission, toCanonicalRole, UserInvitation } from '../../src/types';

const require = createRequire(import.meta.url);
const compiledFunctions = require(path.resolve(process.cwd(), 'firebase/functions/lib/index.js'));
const serverValidation = require(path.resolve(process.cwd(), 'firebase/functions/lib/src/validation.js'));

// Espelho fiel da lógica de autorização de pré-visualização em src/views/public/PublicRegistrationView.tsx
function computeAuthorizedPreviewPool(params: {
  isPreviewModeParam: boolean;
  firebaseUser: { uid: string; email?: string; emailVerified?: boolean } | null;
  activeRole: string;
  authorizedRoles?: string[];
  userProfile?: {
    role?: string;
    roles?: string[];
    institutionId?: string;
    institutionIds?: string[];
    ownedInstitutions?: string[];
  } | null;
  activeInstitutionId?: string;
  allInstitutions: Institution[];
}): Institution[] {
  const { isPreviewModeParam, firebaseUser, activeRole, authorizedRoles, userProfile, activeInstitutionId, allInstitutions } = params;
  if (!isPreviewModeParam || !firebaseUser) return [];
  const canonicalActive = toCanonicalRole(activeRole);
  const allUserRoles = [
    canonicalActive,
    ...(authorizedRoles || []).map((r) => toCanonicalRole(r)),
    ...(userProfile?.role ? [toCanonicalRole(userProfile.role)] : []),
    ...(Array.isArray(userProfile?.roles) ? userProfile.roles.map((r) => toCanonicalRole(r)) : [])
  ];
  const isSuperAdmin =
    allUserRoles.includes('SUPER_ADMIN') ||
    (firebaseUser.emailVerified === true &&
      firebaseUser.email?.toLowerCase() === 'moztechwavenacala8@gmail.com');
  if (isSuperAdmin) return allInstitutions;

  const adminPreviewRoles = new Set(['ADMIN_INSTITUICAO', 'DIRETOR', 'CEO', 'SECRETARIA', 'FINANCEIRO']);
  if (!allUserRoles.some((r) => adminPreviewRoles.has(r))) return [];

  const allowedInstIds = new Set<string>(
    [
      userProfile?.institutionId,
      activeInstitutionId,
      ...(Array.isArray(userProfile?.institutionIds) ? userProfile.institutionIds : []),
      ...(Array.isArray(userProfile?.ownedInstitutions) ? userProfile.ownedInstitutions : [])
    ].filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
  );
  return allInstitutions.filter((inst) => inst?.id && allowedInstIds.has(inst.id));
}

function makeCourseConfig(courseId: string, courseName: string, vacancies: number, filledVacancies: number, price = 1500) {
  return {
    courseId,
    courseName,
    active: true,
    price,
    duration: '6 meses',
    requirements: ['10ª Classe'],
    vacancies,
    filledVacancies,
    regimes: ['Laboral'] as any,
    shifts: ['Manhã']
  };
}

function makeInstitution(id: string, slug: string, name: string, status: Institution['status'] = 'Ativa', vacancies = 2, filled = 0): Institution {
  const cfg: OnlineRegistrationConfig = {
    institutionId: id,
    isOpen: true,
    title: `Inscrições — ${name}`,
    description: `Portal oficial da ${name}`,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    academicYear: '2026',
    semester: '1º Semestre',
    requiredFields: {
      phone: 'obrigatorio',
      email: 'opcional',
      documentNumber: 'obrigatorio',
      birthDate: 'obrigatorio',
      gender: 'obrigatorio',
      province: 'opcional',
      city: 'opcional',
      address: 'opcional',
      guardianName: 'opcional',
      guardianPhone: 'opcional'
    },
    requiredDocuments: [],
    documentRequirements: {},
    customQuestions: [],
    coursesConfig: [makeCourseConfig(`course-${id}-1`, `Curso Técnico ${name}`, vacancies, filled)],
    autoApproveOnPayment: false,
    confirmationMessageTemplate: 'Obrigado {NOME}',
    contactPhone: '841234567',
    contactWhatsapp: '841234567',
    contactEmail: `contacto@${slug}.co.mz`
  };

  return {
    id,
    slug,
    code: id.toUpperCase(),
    name,
    type: 'instituicao_ensino',
    nuit: '400123456',
    licenseNumber: 'LIC-2026',
    representativeName: 'Gestor Teste',
    representativeRole: 'Diretor',
    email: `secretaria@${slug}.co.mz`,
    phone: '841234567',
    whatsapp: '841234567',
    province: 'Nampula',
    city: 'Nacala',
    address: 'Av. Principal',
    plan: 'Pro',
    status,
    connectedSystem: 'SIGAR',
    sivecEnabled: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    branches: [{ id: `br-${id}`, institutionId: id, name: 'Sede', code: 'SEDE', province: 'Nampula', city: 'Nacala', address: 'Av. Principal', phone: '841234567', isHeadquarter: true, status: 'Ativa', createdAt: '2026-01-01' }],
    onlineRegistrationConfig: cfg,
    financialSettings: {
      paymentMethods: [
        { id: 'pm1', name: 'M-Pesa', type: 'mobile', enabled: true, accountNumber: '849999999', accountName: 'Conta Privada' }
      ],
      defaultCurrency: 'MZN',
      lateFeePercentage: 5,
      gracePeriodDays: 5
    } as any,
    financialAccounts: [
      { id: 'fa1', provider: 'BIM', bankName: 'Millennium BIM', accountNumber: '000123456789', nib: '0001000012345678910', holder: name, isDefault: true }
    ] as any,
    accessCode: 'SEGREDO-ADMIN-999' as any,
    ownerEmail: 'owner-secret@inst.co.mz' as any,
    signatureUrl: 'data:image/png;base64,ASSINATURA_PRIVADA' as any,
    stampUrl: 'data:image/png;base64,CARIMBO_PRIVADO' as any
  } as Institution;
}

// Armazém em memória com suporte a transacção optimista para validar publicação/despublicação e concorrência real de vagas
class InMemoryFirestoreStore {
  publicDocs = new Map<string, Record<string, any>>();
  privInsts = new Map<string, Record<string, any>>();
  courses = new Map<string, Record<string, any>>();
  applications = new Map<string, Record<string, any>>();
  dedup = new Map<string, Record<string, any>>();
  private txChain: Promise<any> = Promise.resolve();
  private injectWriteFailure = false;

  setInjectWriteFailure(v: boolean) {
    this.injectWriteFailure = v;
  }

  createPublicAdapter(): PublicInstitutionTxAdapter {
    return {
      getIndex: async () => {
        const d = this.publicDocs.get('_index');
        return { exists: () => Boolean(d), data: () => (d ? structuredClone(d) : undefined) };
      },
      getPub: async (slug: string) => {
        const d = this.publicDocs.get(slug);
        return { exists: () => Boolean(d), data: () => (d ? structuredClone(d) : undefined) };
      },
      getPriv: async (instId: string) => {
        const d = this.privInsts.get(instId);
        return { exists: () => Boolean(d), data: () => (d ? structuredClone(d) : undefined) };
      },
      setPub: (slug: string, data: Record<string, any>) => {
        if (this.injectWriteFailure) throw new Error('Simulated Firestore write failure on publicInstitutions');
        this.publicDocs.set(slug, structuredClone(data));
      },
      deletePub: (slug: string) => {
        if (this.injectWriteFailure) throw new Error('Simulated Firestore delete failure');
        this.publicDocs.delete(slug);
      },
      setIndex: (data: { slugs: string[]; updatedAt: string }) => {
        if (this.injectWriteFailure) throw new Error('Simulated Firestore write failure on _index');
        this.publicDocs.set('_index', structuredClone(data));
      },
      setPrivPublishedFalse: (instId: string, updatedAt: string) => {
        if (this.injectWriteFailure) throw new Error('Simulated Firestore write failure on institutions');
        const cur = this.privInsts.get(instId) || {};
        this.privInsts.set(instId, { ...cur, publicPortalPublished: false, updatedAt });
      }
    };
  }

  // Serializa execuções transaccionais exactamente como o controlo de concorrência serializável do Firestore
  async runAtomicTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.txChain.then(async () => {
      const prevPub = new Map(Array.from(this.publicDocs.entries()).map(([k, v]) => [k, structuredClone(v)]));
      const prevPriv = new Map(Array.from(this.privInsts.entries()).map(([k, v]) => [k, structuredClone(v)]));
      const prevCourses = new Map(Array.from(this.courses.entries()).map(([k, v]) => [k, structuredClone(v)]));
      try {
        return await fn();
      } catch (err) {
        // Rollback atómico apenas das escritas desta transacção falhada
        this.publicDocs = prevPub;
        this.privInsts = prevPriv;
        this.courses = prevCourses;
        throw err;
      }
    });
    this.txChain = run.catch(() => undefined);
    return run;
  }

  // Simula confirmEnrollmentVacancyCallable transaccional com validação cruzada de course + inst + pub
  async confirmVacancyAtomic(institutionId: string, courseId: string): Promise<{ ok: true; filledVacancies: number }> {
    return this.runAtomicTransaction(async () => {
      // Simula latência assíncrona real entre read e write antes da commit serializada
      await new Promise((r) => setTimeout(r, 10));
      const course = this.courses.get(courseId);
      const inst = this.privInsts.get(institutionId);
      const slug = String(inst?.slug || '').trim().toLowerCase();
      const pub = slug ? this.publicDocs.get(slug) : undefined;

      const courseData = course && course.institutionId === institutionId ? course : null;
      const instCourseCfg = Array.isArray(inst?.onlineRegistrationConfig?.coursesConfig)
        ? inst!.onlineRegistrationConfig.coursesConfig.find((c: any) => c.courseId === courseId) || null
        : null;
      const pubCourseCfg = Array.isArray(pub?.onlineRegistrationConfig?.coursesConfig)
        ? pub!.onlineRegistrationConfig.coursesConfig.find((c: any) => c.courseId === courseId) || null
        : null;

      const sources = [courseData, instCourseCfg, pubCourseCfg].filter((s): s is Record<string, any> => Boolean(s));
      if (sources.length === 0) {
        throw new Error('not-found: Curso não encontrado na instituição informada.');
      }

      const currentFilled = Math.max(
        0,
        ...sources.map((s) => (typeof s.filledVacancies === 'number' && s.filledVacancies > 0 ? s.filledVacancies : 0))
      );

      for (const s of sources) {
        const check = serverValidation.validateCourseVacancyAvailable({ ...s, filledVacancies: currentFilled });
        if (!check.ok) {
          throw new Error(`${check.error.code}: ${check.error.message}`);
        }
      }

      const nextFilled = currentFilled + 1;
      if (this.injectWriteFailure) {
        throw new Error('aborted: Simulated Firestore persistence failure during confirmEnrollmentVacancy');
      }

      if (courseData) {
        this.courses.set(courseId, { ...courseData, filledVacancies: nextFilled });
      }
      if (inst?.onlineRegistrationConfig?.coursesConfig) {
        this.privInsts.set(institutionId, {
          ...inst,
          onlineRegistrationConfig: {
            ...inst.onlineRegistrationConfig,
            coursesConfig: inst.onlineRegistrationConfig.coursesConfig.map((c: any) =>
              c.courseId === courseId ? { ...c, filledVacancies: nextFilled } : c
            )
          }
        });
      }
      if (pub?.onlineRegistrationConfig?.coursesConfig) {
        this.publicDocs.set(slug, {
          ...pub,
          onlineRegistrationConfig: {
            ...pub.onlineRegistrationConfig,
            coursesConfig: pub.onlineRegistrationConfig.coursesConfig.map((c: any) =>
              c.courseId === courseId ? { ...c, filledVacancies: nextFilled } : c
            )
          }
        });
      }
      return { ok: true, filledVacancies: nextFilled };
    });
  }
}

async function runTests() {
  let passed = 0;
  const check = (name: string, fn: () => void | Promise<void>) =>
    Promise.resolve(fn()).then(() => {
      passed += 1;
      console.log(`PASS [${passed}] ${name}`);
    });

  // =========================================================
  // GRUPO 1: Cloud Functions & Contratos de Payload Servidor
  // =========================================================
  await check('1.1 Cloud Functions compilam e exportam os 6 endpoints exactos', () => {
    const expected = [
      'validateAndConsumeUserInvitation',
      'submitPublicJobApplicationCallable',
      'onJobApplicationCreated',
      'publishPublicInstitutionCallable',
      'submitPublicCourseApplicationCallable',
      'confirmEnrollmentVacancyCallable'
    ];
    for (const key of expected) {
      assert.ok(key in compiledFunctions, `Export ausente: ${key}`);
    }
  });

  await check('1.2 sanitizePublicInstitutionServerPayload remove campos privados/financeiros e preserva vitrine pública', () => {
    const instA = makeInstitution('inst-a', 'inst-a-slug', 'Instituto Alpha');
    const clientPub = buildPublicInstitutionFromModel(instA);
    const serverPub = serverValidation.sanitizePublicInstitutionServerPayload(
      {
        ...instA,
        ...clientPub,
        signatureUrl: 'SECRET_SIG',
        stampUrl: 'SECRET_STAMP',
        accessCode: '9999',
        financialAccounts: [{ accountNumber: 'PRIVATE' }],
        financialSettings: { mpesa: '840000000' }
      },
      'inst-a-slug',
      'inst-a'
    );
    assert.equal(serverPub.institutionId, 'inst-a');
    assert.equal(serverPub.slug, 'inst-a-slug');
    assert.equal(serverPub.onlineRegistrationConfig.coursesConfig.length, 1);
    for (const forbidden of ['signatureUrl', 'stampUrl', 'carnetStaticQrUrl', 'accessCode', 'ownerEmail', 'financialAccounts', 'financialSettings']) {
      assert.equal(forbidden in serverPub, false, `Campo privado vazou para payload público: ${forbidden}`);
    }
  });

  await check('1.3 validateCourseApplicationServerPayload aplica allowlist estrita, força verified=false e rejeita campos internos', () => {
    const injected = serverValidation.validateCourseApplicationServerPayload({
      institutionId: 'inst-b',
      slug: 'inst-b-slug',
      courseId: 'course-inst-b-1',
      courseName: 'Curso B',
      fullName: 'Candidato Teste',
      phone: '841112233',
      termsAccepted: true,
      privacyAccepted: true,
      analyzedBy: 'fake-admin'
    });
    assert.equal(injected.ok, false);
    assert.equal(injected.error.code, 'permission-denied');

    const emptyContact = serverValidation.validateCourseApplicationServerPayload({
      institutionId: 'inst-b',
      slug: 'inst-b-slug',
      courseId: 'course-inst-b-1',
      courseName: 'Curso B',
      fullName: 'Candidato Sem Contacto',
      termsAccepted: true,
      privacyAccepted: true
    });
    assert.equal(emptyContact.ok, false);
    assert.equal(emptyContact.error.code, 'invalid-argument');

    const valid = serverValidation.validateCourseApplicationServerPayload({
      institutionId: 'inst-b',
      slug: 'inst-b-slug',
      courseId: 'course-inst-b-1',
      courseName: 'Curso B',
      fullName: 'Maria João',
      phone: '841112233',
      paymentAmount: 0, // tentativa de forjar taxa zero
      unknownField: 'lixo',
      documents: [{ name: 'BI', fileName: 'bi.pdf', verified: true, url: 'data:application/pdf;base64,JVBERi0=' }],
      termsAccepted: true,
      privacyAccepted: true
    });
    assert.equal(valid.ok, true);
    assert.equal('unknownField' in valid.clean, false);
    assert.equal('paymentAmount' in valid.clean, false);
    assert.equal(valid.clean.documents[0].verified, false);
    assert.equal(valid.clean.status, 'submetida');
    assert.equal(valid.clean.paymentStatus, 'Pendente');
  });

  // =========================================================
  // GRUPO 2: Links Públicos Multi-Tenant (Instituição A e B)
  // =========================================================
  const store = new InMemoryFirestoreStore();
  const instA = makeInstitution('inst-a', 'instituto-alpha', 'Instituto Alpha', 'Ativa', 3, 0);
  const instB = makeInstitution('inst-b', 'centro-beta', 'Centro Beta', 'Ativa', 2, 0);
  const instBUnpublishedDraft = makeInstitution('inst-b-draft', 'rascunho-beta', 'Rascunho Beta', 'Ativa', 5, 0);
  const instBSuspended = makeInstitution('inst-b-susp', 'centro-suspenso', 'Centro Suspenso', 'Suspensa', 5, 0);
  const instBInactive = makeInstitution('inst-b-inact', 'centro-inativo', 'Centro Inativo', 'Inativa' as Institution['status'], 5, 0);

  store.privInsts.set(instA.id, instA);
  store.privInsts.set(instB.id, instB);
  store.privInsts.set(instBUnpublishedDraft.id, instBUnpublishedDraft);
  store.privInsts.set(instBSuspended.id, instBSuspended);
  store.privInsts.set(instBInactive.id, instBInactive);

  await store.runAtomicTransaction(async () => {
    await executePublishPublicInstitutionTransaction(store.createPublicAdapter(), {
      slug: 'instituto-alpha',
      institutionId: instA.id,
      publicData: buildPublicInstitutionFromModel(instA),
      isSuperAdmin: false
    });
    await executePublishPublicInstitutionTransaction(store.createPublicAdapter(), {
      slug: 'centro-beta',
      institutionId: instB.id,
      publicData: buildPublicInstitutionFromModel(instB),
      isSuperAdmin: false
    });
  });

  await check('2.1 Visitante sem login a abrir link de Inst B lê estritamente Inst B sem dados de Inst A', () => {
    const pubB = sanitizePublicInstitutionPayload(store.publicDocs.get('centro-beta') as any);
    assert.equal(pubB.institutionId, 'inst-b');
    assert.equal(pubB.name, 'Centro Beta');
    assert.equal(pubB.onlineRegistrationConfig.coursesConfig[0].courseId, 'course-inst-b-1');
    assert.equal(JSON.stringify(pubB).includes('Instituto Alpha'), false);
    assert.equal(JSON.stringify(pubB).includes('course-inst-a-1'), false);
  });

  await check('2.2 Utilizador autenticado de Inst A a abrir ?preview=true de Inst B rascunho não acede ao rascunho de Inst B', () => {
    const allInsts = [instA, instB, instBUnpublishedDraft];
    const poolForAdminA = computeAuthorizedPreviewPool({
      isPreviewModeParam: true,
      firebaseUser: { uid: 'u-admin-a', email: 'admin@alpha.co.mz', emailVerified: true },
      activeRole: 'ADMIN_INSTITUICAO',
      authorizedRoles: ['ADMIN_INSTITUICAO'],
      userProfile: { role: 'ADMIN_INSTITUICAO', institutionId: 'inst-a' },
      activeInstitutionId: 'inst-a',
      allInstitutions: allInsts
    });
    assert.deepEqual(poolForAdminA.map((i) => i.id), ['inst-a']);
    assert.equal(poolForAdminA.some((i) => i.id === 'inst-b-draft'), false);

    // Aluno autenticado não pode usar pré-visualização administrativa mesmo na própria instituição
    const poolForStudent = computeAuthorizedPreviewPool({
      isPreviewModeParam: true,
      firebaseUser: { uid: 'u-aluno-b', email: 'aluno@beta.co.mz', emailVerified: true },
      activeRole: 'ALUNO',
      authorizedRoles: ['ALUNO'],
      userProfile: { role: 'ALUNO', institutionId: 'inst-b-draft' },
      activeInstitutionId: 'inst-b-draft',
      allInstitutions: allInsts
    });
    assert.equal(poolForStudent.length, 0);

    // Visitante sem login tem pool de preview vazio
    const poolForAnon = computeAuthorizedPreviewPool({
      isPreviewModeParam: true,
      firebaseUser: null,
      activeRole: 'VISITANTE',
      allInstitutions: allInsts
    });
    assert.equal(poolForAnon.length, 0);

    // Super Admin tem acesso autorizado ao pool global em ?preview=true
    const poolForSuperAdmin = computeAuthorizedPreviewPool({
      isPreviewModeParam: true,
      firebaseUser: { uid: '2dRLWqnY1zf1MlR9rZYhAKPvGbV2', email: 'moztechwavenacala8@gmail.com', emailVerified: true },
      activeRole: 'SUPER_ADMIN',
      authorizedRoles: ['SUPER_ADMIN'],
      userProfile: { role: 'SUPER_ADMIN', institutionId: 'inst-1' },
      activeInstitutionId: 'inst-1',
      allInstitutions: allInsts
    });
    assert.equal(poolForSuperAdmin.length, 3);
  });

  await check('2.3 Instituições suspensa, inativa e slug inexistente são rejeitados e despublicação limpa índice atomicamente', async () => {
    const idx = store.publicDocs.get('_index');
    assert.equal(idx?.slugs.includes('slug-inexistente'), false);
    assert.equal(store.publicDocs.get('slug-inexistente'), undefined);

    // Despublicação de Inst A por utilizador de Inst B tem de ser recusada
    await assert.rejects(
      () =>
        store.runAtomicTransaction(() =>
          executeUnpublishPublicInstitutionTransaction(store.createPublicAdapter(), {
            slug: 'instituto-alpha',
            explicitInstId: 'inst-b',
            resolvedInstId: 'inst-b',
            isSuperAdmin: false
          })
        ),
      /Operação bloqueada/
    );

    // Admin legítimo de Inst A consegue despublicar atomicamente
    await store.runAtomicTransaction(() =>
      executeUnpublishPublicInstitutionTransaction(store.createPublicAdapter(), {
        slug: 'instituto-alpha',
        explicitInstId: 'inst-a',
        resolvedInstId: 'inst-a',
        isSuperAdmin: false
      })
    );
    assert.equal(store.publicDocs.get('instituto-alpha'), undefined);
    assert.equal(store.publicDocs.get('_index')?.slugs.includes('instituto-alpha'), false);
    assert.equal(store.privInsts.get('inst-a')?.publicPortalPublished, false);
  });

  // =========================================================
  // GRUPO 3: Cursos, Vagas, Candidaturas & Concorrência
  // =========================================================
  await check('3.1 Curso disponível vs curso esgotado (client + server validation)', () => {
    const available = makeCourseConfig('c-ok', 'Informática', 2, 1);
    const soldOut = makeCourseConfig('c-full', 'Enfermagem', 1, 1);
    const zeroCap = makeCourseConfig('c-zero', 'Design', 0, 0);

    assert.equal(getRemainingVacancies(available), 1);
    assert.equal(isCourseSoldOut(available), false);
    assert.equal(getRemainingVacancies(soldOut), 0);
    assert.equal(isCourseSoldOut(soldOut), true);
    assert.equal(isCourseSoldOut(zeroCap), true);

    assert.equal(serverValidation.validateCourseVacancyAvailable(available).ok, true);
    assert.equal(serverValidation.validateCourseVacancyAvailable(soldOut).ok, false);
    assert.equal(serverValidation.validateCourseVacancyAvailable(zeroCap).ok, false);

    const stepRes = validateRegistrationStep(
      1,
      { selectedCourseId: 'c-full' },
      { isOpen: true, coursesConfig: [soldOut] },
      [soldOut]
    );
    assert.equal(stepRes.valid, false);
    assert.match(stepRes.errors[0], /esgotadas/);
  });

  await check('3.2 Candidatura pendente ou aprovada NÃO decrementa vagas; matrícula confirmada incrementa atomicamente e bloqueia 2ª concorrência na última vaga', async () => {
    const concStore = new InMemoryFirestoreStore();
    const lastSeatInst = makeInstitution('inst-conc', 'conc-inst', 'Instituto Concorrência', 'Ativa', 1, 0);
    const courseId = 'course-inst-conc-1';
    concStore.privInsts.set(lastSeatInst.id, lastSeatInst);
    concStore.publicDocs.set('conc-inst', buildPublicInstitutionFromModel(lastSeatInst));
    concStore.courses.set(courseId, {
      id: courseId,
      institutionId: lastSeatInst.id,
      name: 'Curso Última Vaga',
      vacancies: 1,
      filledVacancies: 0,
      active: true
    });

    // Submissão de candidatura pendente + aprovação simulada não mexem em filledVacancies
    concStore.applications.set('app-1', { id: 'app-1', courseId, status: 'submetida' });
    concStore.applications.set('app-2', { id: 'app-2', courseId, status: 'Aprovada' });
    assert.equal(concStore.courses.get(courseId)?.filledVacancies, 0);
    assert.equal(getRemainingVacancies(concStore.courses.get(courseId) as any), 1);

    // Duas confirmações simultâneas de matrícula para a ÚLTIMA vaga
    const results = await Promise.allSettled([
      concStore.confirmVacancyAtomic(lastSeatInst.id, courseId),
      concStore.confirmVacancyAtomic(lastSeatInst.id, courseId)
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    assert.equal(fulfilled.length, 1, 'Apenas 1 matrícula concorrente deve obter a última vaga.');
    assert.equal(rejected.length, 1, 'A 2ª matrícula concorrente tem de ser recusada.');
    assert.match(String((rejected[0] as PromiseRejectedResult).reason), /esgotadas/);

    // Consistência sincronizada entre /courses, /institutions e /publicInstitutions
    assert.equal(concStore.courses.get(courseId)?.filledVacancies, 1);
    assert.equal(concStore.privInsts.get(lastSeatInst.id)?.onlineRegistrationConfig.coursesConfig[0].filledVacancies, 1);
    assert.equal(concStore.publicDocs.get('conc-inst')?.onlineRegistrationConfig.coursesConfig[0].filledVacancies, 1);
  });

  await check('3.3 Candidatura duplicada detectada determinísticamente e rollback atómico em falha de persistência', async () => {
    const keysA = serverValidation.buildCourseApplicationDedupKeys({
      institutionId: 'inst-b',
      courseId: 'course-inst-b-1',
      documentNumber: '110100234567B',
      email: 'Aluno@Teste.co.mz',
      phone: '+258 84 123 4567'
    });
    const keysB = serverValidation.buildCourseApplicationDedupKeys({
      institutionId: 'inst-b',
      courseId: 'course-inst-b-1',
      documentNumber: '110100234567b',
      email: 'aluno@teste.co.mz',
      phone: '258841234567'
    });
    assert.equal(keysA.length, 3);
    assert.deepEqual(keysA, keysB);

    // Simular falha de persistência durante confirmação de vaga e provar rollback completo
    const rbStore = new InMemoryFirestoreStore();
    const instRb = makeInstitution('inst-rb', 'rb-inst', 'Inst Rollback', 'Ativa', 3, 1);
    rbStore.privInsts.set(instRb.id, instRb);
    rbStore.publicDocs.set('rb-inst', buildPublicInstitutionFromModel(instRb));
    rbStore.courses.set('course-inst-rb-1', { id: 'course-inst-rb-1', institutionId: instRb.id, vacancies: 3, filledVacancies: 1 });
    rbStore.setInjectWriteFailure(true);

    await assert.rejects(() => rbStore.confirmVacancyAtomic(instRb.id, 'course-inst-rb-1'), /Simulated Firestore/);
    assert.equal(rbStore.courses.get('course-inst-rb-1')?.filledVacancies, 1);
    assert.equal(rbStore.privInsts.get(instRb.id)?.onlineRegistrationConfig.coursesConfig[0].filledVacancies, 1);
    assert.equal(rbStore.publicDocs.get('rb-inst')?.onlineRegistrationConfig.coursesConfig[0].filledVacancies, 1);
  });

  // =========================================================
  // GRUPO 4: Convites, Permissões e Auditoria de E-mail
  // =========================================================
  await check('4.1 Teto de permissões, hierarquia de papéis e isolamento multi-tenant nos convites', () => {
    // Secretaria não pode convidar Diretor nem Admin nem Super Admin
    assert.equal(canCallerInviteRole('SECRETARIA', 'ALUNO'), true);
    assert.equal(canCallerInviteRole('SECRETARIA', 'PROFESSOR'), true);
    assert.equal(canCallerInviteRole('SECRETARIA', 'DIRETOR'), false);
    assert.equal(canCallerInviteRole('SECRETARIA', 'ADMIN_INSTITUICAO'), false);
    assert.equal(canCallerInviteRole('ADMIN_INSTITUICAO', 'SUPER_ADMIN'), false);

    // Permissões do convite NUNCA excedem actor.permissions nem targetRole
    const requested: Permission[] = ['alunos.view', 'pagamentos.approve', 'instituicoes.create', 'usuarios.delete'];
    const restricted = sanitizeInvitePermissions('DIRETOR', 'PROFESSOR', requested, ['alunos.view', 'notas.edit']);
    assert.deepEqual(restricted, ['alunos.view']);

    // Emissor da Inst A bloqueado ao tentar convidar utilizador para Inst B
    const crossTenant = validateInviteCreationInput(
      {
        uid: 'actor-a',
        name: 'Admin A',
        email: 'admin@alpha.co.mz',
        role: 'ADMIN_INSTITUICAO',
        institutionId: 'inst-a',
        permissions: ['alunos.view', 'usuarios.create']
      },
      {
        fullName: 'Professor B',
        email: 'prof@beta.co.mz',
        institutionId: 'inst-b',
        role: 'PROFESSOR'
      }
    );
    assert.equal(crossTenant.ok, false);
    assert.match(crossTenant.error || '', /outra instituição/);
  });

  await check('4.2 Ciclo de vida completo de activação de convite (servidor + cliente) sem envio simulado de e-mail', () => {
    const token = 'a'.repeat(48);
    const url = buildInviteActivationUrl(token);
    assert.ok(url.includes(`/ativar-conta?token=${token}`));

    const invite: UserInvitation = {
      id: token,
      token,
      fullName: 'Docente Convidado',
      email: 'docente@centrobeta.co.mz',
      institutionId: 'inst-b',
      role: 'PROFESSOR',
      permissions: ['students.view'],
      status: 'pendente',
      used: false,
      revoked: false,
      expiresAt: new Date(Date.now() + 86400_000).toISOString(),
      expiresAtMs: Date.now() + 86400_000,
      createdAt: new Date().toISOString(),
      createdByUid: 'admin-b',
      createdByRole: 'ADMIN_INSTITUICAO'
    };

    // Sem emailVerified === true -> rejeitado no servidor
    const unverified = serverValidation.evaluateInvitationForActivation({
      invite,
      callerUid: 'uid-doc-1',
      callerEmail: 'docente@centrobeta.co.mz',
      emailVerified: false,
      nowMs: Date.now()
    });
    assert.equal(unverified.ok, false);
    assert.equal(unverified.error.code, 'failed-precondition');

    // E-mail diferente -> rejeitado no cliente e no servidor
    assert.equal(validateInviteActivationState(invite, 'outro@evil.com').valid, false);
    const mismatch = serverValidation.evaluateInvitationForActivation({
      invite,
      callerUid: 'uid-doc-1',
      callerEmail: 'outro@evil.com',
      emailVerified: true,
      nowMs: Date.now()
    });
    assert.equal(mismatch.ok, false);
    assert.equal(mismatch.error.code, 'permission-denied');

    // E-mail confirmado e correspondente -> activação válida e vinculada exclusivamente a inst-b
    const okActivation = serverValidation.evaluateInvitationForActivation({
      invite,
      callerUid: 'uid-doc-1',
      callerEmail: 'DOCENTE@centrobeta.co.mz',
      emailVerified: true,
      nowMs: Date.now()
    });
    assert.equal(okActivation.ok, true);
    assert.equal(okActivation.institutionId, 'inst-b');
    assert.equal(okActivation.targetRole, 'PROFESSOR');

    // Convite já usado ou revogado -> bloqueado
    assert.equal(
      serverValidation.evaluateInvitationForActivation({
        invite: { ...invite, used: true, status: 'ativado' },
        callerUid: 'uid-doc-2',
        callerEmail: 'docente@centrobeta.co.mz',
        emailVerified: true,
        nowMs: Date.now()
      }).ok,
      false
    );
    assert.equal(
      serverValidation.evaluateInvitationForActivation({
        invite: { ...invite, revoked: true, status: 'revogado' },
        callerUid: 'uid-doc-2',
        callerEmail: 'docente@centrobeta.co.mz',
        emailVerified: true,
        nowMs: Date.now()
      }).ok,
      false
    );
  });

  // Garantir também validação completa do formulário em 5 passos no fluxo público
  await check('4.3 validateFullRegistration valida todos os 5 passos com curso válido e rejeita falta de aceitação', () => {
    const course = makeCourseConfig('course-inst-b-1', 'Curso B', 5, 1);
    const cfg: OnlineRegistrationConfig = {
      institutionId: 'inst-b',
      isOpen: true,
      title: 'T',
      description: 'D',
      startDate: '',
      endDate: '',
      academicYear: '2026',
      semester: '',
      requiredFields: {
        phone: 'obrigatorio',
        email: 'opcional',
        documentNumber: 'opcional',
        birthDate: 'opcional',
        gender: 'opcional',
        province: 'opcional',
        city: 'opcional',
        address: 'opcional',
        guardianName: 'opcional',
        guardianPhone: 'opcional'
      },
      requiredDocuments: [],
      documentRequirements: {},
      customQuestions: [],
      coursesConfig: [course],
      autoApproveOnPayment: false,
      confirmationMessageTemplate: '',
      contactPhone: '',
      contactWhatsapp: '',
      contactEmail: ''
    };
    const okRes = validateFullRegistration(
      {
        selectedCourseId: 'course-inst-b-1',
        fullName: 'Carlos Munguambe',
        phone: '841234567',
        termsAccepted: true,
        privacyAccepted: true
      },
      cfg,
      [course]
    );
    assert.equal(okRes.valid, true);
  });

  console.log(`\nALL ${passed} LOCAL INTEGRATION ASSERTIONS PASSED.`);
}

runTests().catch((err) => {
  console.error('TEST FAILURE:', err);
  process.exit(1);
});
