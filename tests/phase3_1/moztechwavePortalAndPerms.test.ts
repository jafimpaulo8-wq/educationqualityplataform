import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import { INITIAL_INSTITUTIONS, COURSES_DATA } from '../../src/data/mockData';
import { ROLE_DEFINITIONS, toCanonicalRole } from '../../src/types/rbac';
import {
  buildPublicInstitutionFromModel,
  canUserManagePublicPortalProfile,
  executePublishPublicInstitutionTransaction,
  extractPublishedPublicCourses,
  extractSlugFromLocation,
  getClientDirectWriteOverflowReasons,
  PublicInstitutionTxAdapter,
  resolveInstitutionSlug,
  sanitizePublicInstitutionPayload
} from '../../src/services/publicInstitutionService';
import {
  getRemainingVacancies,
  isCourseSoldOut,
  validateFullRegistration
} from '../../src/utils/registrationConfigUtils';
import { Course, Institution } from '../../src/types';

const require = createRequire(import.meta.url);
const serverValidation = require(path.resolve(process.cwd(), 'firebase/functions/lib/src/validation.js'));
const compiledFunctions = require(path.resolve(process.cwd(), 'firebase/functions/lib/index.js'));

class LocalMoztechwaveFirestoreMock {
  publicDocs = new Map<string, Record<string, any>>();
  privInsts = new Map<string, Record<string, any>>();
  courses = new Map<string, Record<string, any>>();
  applications = new Map<string, Record<string, any>>();
  dedup = new Map<string, Record<string, any>>();
  private txChain: Promise<any> = Promise.resolve();

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
        this.publicDocs.set(slug, structuredClone(data));
      },
      deletePub: (slug: string) => {
        this.publicDocs.delete(slug);
      },
      setIndex: (data: { slugs: string[]; updatedAt: string }) => {
        this.publicDocs.set('_index', structuredClone(data));
      },
      setPrivPublishedFalse: (instId: string, updatedAt: string) => {
        const cur = this.privInsts.get(instId) || {};
        this.privInsts.set(instId, { ...cur, publicPortalPublished: false, updatedAt });
      }
    };
  }

  async runAtomicTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.txChain.then(async () => {
      const prevPub = new Map(Array.from(this.publicDocs.entries()).map(([k, v]) => [k, structuredClone(v)]));
      const prevPriv = new Map(Array.from(this.privInsts.entries()).map(([k, v]) => [k, structuredClone(v)]));
      const prevCourses = new Map(Array.from(this.courses.entries()).map(([k, v]) => [k, structuredClone(v)]));
      try {
        return await fn();
      } catch (err) {
        this.publicDocs = prevPub;
        this.privInsts = prevPriv;
        this.courses = prevCourses;
        throw err;
      }
    });
    this.txChain = run.catch(() => undefined);
    return run;
  }

  async confirmVacancyAtomic(institutionId: string, courseId: string): Promise<{ ok: true; filledVacancies: number }> {
    return this.runAtomicTransaction(async () => {
      await new Promise((r) => setTimeout(r, 10));
      const course = this.courses.get(courseId);
      const inst = this.privInsts.get(institutionId);
      const slug = inst ? resolveInstitutionSlug(inst as Partial<Institution>) : '';
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

  const moztechwaveInst = INITIAL_INSTITUTIONS.find((i) => i.id === 'inst-1');
  assert.ok(moztechwaveInst, 'inst-1 (CFTPM Moztechwave) deve existir em INITIAL_INSTITUTIONS');
  const moztechwaveCourses = COURSES_DATA.filter((c) => c.institutionId === 'inst-1');
  assert.ok(moztechwaveCourses.length >= 3, 'inst-1 deve ter cursos configurados em COURSES_DATA');

  const store = new LocalMoztechwaveFirestoreMock();
  store.privInsts.set(moztechwaveInst.id, structuredClone(moztechwaveInst));
  for (const c of moztechwaveCourses) {
    store.courses.set(c.id, structuredClone(c));
  }

  // 1. Abertura pública de /i/moztechwave quando publicado
  await check('1. Portal /i/moztechwave publicado resolve inst-1, cursos e zero campos privados', async () => {
    assert.equal(extractSlugFromLocation('/i/moztechwave', '', ''), 'moztechwave');
    assert.equal(resolveInstitutionSlug(moztechwaveInst), 'moztechwave');

    const pubModel = buildPublicInstitutionFromModel(moztechwaveInst);
    await store.runAtomicTransaction(() =>
      executePublishPublicInstitutionTransaction(store.createPublicAdapter(), {
        slug: 'moztechwave',
        institutionId: 'inst-1',
        publicData: pubModel,
        isSuperAdmin: true
      })
    );

    const storedPub = sanitizePublicInstitutionPayload(store.publicDocs.get('moztechwave') as any);
    assert.equal(storedPub.institutionId, 'inst-1');
    assert.equal(storedPub.slug, 'moztechwave');
    assert.equal(storedPub.branches?.length, 5);
    assert.ok((storedPub.onlineRegistrationConfig?.coursesConfig?.length || 0) >= 3);

    const serialized = JSON.stringify(storedPub);
    for (const privateField of ['financialAccounts', 'financialSettings', 'signatureUrl', 'stampUrl', 'carnetStaticQrUrl', 'accessCode', 'ownerEmail', '849001200', '109283741']) {
      // nota: phone/whatsapp públicos podem existir; testamos chaves privadas e conta bancária/M-Pesa privada
      if (privateField === '849001200') continue;
      assert.equal(serialized.includes(privateField), false, `Campo privado detectado no documento público: ${privateField}`);
    }
    assert.equal('financialAccounts' in storedPub, false);
    assert.equal('financialSettings' in storedPub, false);
  });

  // 2. Portal não publicado não faz fallback estático para KNOWN_INSTITUTIONS
  await check('2. Portal /i/moztechwave não publicado retorna ausência explícita sem fallback estático', () => {
    const emptyCourses = extractPublishedPublicCourses([]);
    assert.equal(emptyCourses.length, 0);

    const viewSource = fs.readFileSync(path.resolve(process.cwd(), 'src/views/public/PublicRegistrationView.tsx'), 'utf8');
    assert.equal(viewSource.includes('KNOWN_INSTITUTIONS'), false);
    assert.ok(viewSource.includes('fetchPublishedPublicInstitutionStrict'));
    assert.ok(viewSource.includes('resolvePublicInstitutionStrictWithAliases'));
  });

  // 3. Super Admin publica Moztechwave (5 filiais e até 12 cursos) dentro do orçamento directo das Rules
  await check('3. Super Admin publica Moztechwave (5 polos e 8 cursos) com 0 overflows de Rules e índice atómico sem duplicados', async () => {
    const eightCourseConfigs = moztechwaveCourses.slice(0, 8).map((c) => ({
      courseId: c.id,
      courseName: c.name,
      category: c.category,
      active: c.status !== 'Suspenso',
      price: c.registrationFee ?? 1500,
      monthlyFee: c.monthlyFee ?? c.feeMonthly ?? 0,
      duration: c.duration,
      requirements: (c.requirements || []).slice(0, 5),
      vacancies: c.totalVacancies ?? 30,
      filledVacancies: c.filledVacancies ?? 0,
      regimes: ['Laboral', 'Pós-Laboral'] as any,
      shifts: ['Manhã', 'Tarde', 'Noite']
    }));

    const fullMozInst: Institution = {
      ...moztechwaveInst,
      onlineRegistrationConfig: {
        ...moztechwaveInst.onlineRegistrationConfig!,
        coursesConfig: eightCourseConfigs
      }
    };

    const publicData = buildPublicInstitutionFromModel(fullMozInst);
    const overflowReasons = getClientDirectWriteOverflowReasons(publicData);
    assert.deepEqual(overflowReasons, [], `Overflow inesperado para Moztechwave: ${overflowReasons.join(', ')}`);

    await store.runAtomicTransaction(() =>
      executePublishPublicInstitutionTransaction(store.createPublicAdapter(), {
        slug: 'moztechwave',
        institutionId: 'inst-1',
        publicData,
        isSuperAdmin: true
      })
    );
    // Re-publicação repetida não duplica no _index
    await store.runAtomicTransaction(() =>
      executePublishPublicInstitutionTransaction(store.createPublicAdapter(), {
        slug: 'moztechwave',
        institutionId: 'inst-1',
        publicData,
        isSuperAdmin: true
      })
    );

    const indexDoc = store.publicDocs.get('_index');
    assert.ok(indexDoc);
    assert.deepEqual(indexDoc.slugs, ['moztechwave']);
    assert.equal(store.publicDocs.get('moztechwave')?.onlineRegistrationConfig?.coursesConfig?.length, 8);
  });

  // 4. Secretaria da Moztechwave COM permissão explícita é autorizada
  await check('4. Secretaria de inst-1 com permissões explícitas é autorizada em RBAC e portal público', () => {
    assert.ok(ROLE_DEFINITIONS.SECRETARIA.permissions.includes('cursos.create'));
    assert.ok(ROLE_DEFINITIONS.SECRETARIA.permissions.includes('cursos.edit'));
    assert.ok(ROLE_DEFINITIONS.SECRETARIA.permissions.includes('candidatos.config'));

    const secAuthorized = canUserManagePublicPortalProfile(
      {
        role: 'SECRETARIA',
        institutionId: 'inst-1',
        status: 'Ativo',
        permissions: ['cursos.create', 'cursos.edit', 'candidatos.config']
      },
      false,
      'inst-1'
    );
    assert.equal(secAuthorized.allowed, true);
    assert.equal(toCanonicalRole('secretaria'), 'SECRETARIA');
  });

  // 5. Secretaria SEM permissão explícita (ou conta suspensa/inactiva) é bloqueada
  await check('5. Secretaria de inst-1 sem permissão explícita ou suspensa é recusada', () => {
    const noPerms = canUserManagePublicPortalProfile(
      {
        role: 'SECRETARIA',
        institutionId: 'inst-1',
        status: 'Ativo',
        permissions: ['alunos.view']
      },
      false,
      'inst-1'
    );
    assert.equal(noPerms.allowed, false);

    const emptyPerms = canUserManagePublicPortalProfile(
      {
        role: 'SECRETARIA',
        institutionId: 'inst-1',
        permissions: []
      },
      false,
      'inst-1'
    );
    assert.equal(emptyPerms.allowed, false);

    const disabledSec = canUserManagePublicPortalProfile(
      {
        role: 'SECRETARIA',
        institutionId: 'inst-1',
        disabled: true,
        permissions: ['cursos.create', 'candidatos.config']
      },
      false,
      'inst-1'
    );
    assert.equal(disabledSec.allowed, false);
  });

  // 6. Secretaria de outra instituição (inst-2) bloqueada em inst-1 / moztechwave
  await check('6. Secretaria de outra instituição (inst-2) é recusada ao tentar gerir inst-1/moztechwave', async () => {
    const crossTenant = canUserManagePublicPortalProfile(
      {
        role: 'SECRETARIA',
        institutionId: 'inst-2',
        status: 'Ativo',
        permissions: ['cursos.create', 'cursos.edit', 'candidatos.config']
      },
      false,
      'inst-1'
    );
    assert.equal(crossTenant.allowed, false);

    await assert.rejects(() =>
      store.runAtomicTransaction(() =>
        executePublishPublicInstitutionTransaction(store.createPublicAdapter(), {
          slug: 'moztechwave',
          institutionId: 'inst-2',
          publicData: buildPublicInstitutionFromModel(moztechwaveInst),
          isSuperAdmin: false
        })
      )
    );
  });

  // 7. Perfis sem permissão administrativa (Professor, Aluno, Visitante, Financeiro, Porteiro) recusados
  await check('7. Professor, Formador, Aluno, Financeiro, Porteiro e Visitante são bloqueados', () => {
    for (const role of ['PROFESSOR', 'FORMADOR', 'ALUNO', 'RESPONSAVEL', 'VISITANTE', 'FINANCEIRO', 'PORTEIRO']) {
      const res = canUserManagePublicPortalProfile(
        {
          role,
          institutionId: 'inst-1',
          permissions: ['cursos.create', 'candidatos.config']
        },
        false,
        'inst-1'
      );
      assert.equal(res.allowed, false, `Perfil "${role}" não devia conseguir publicar o portal público`);
    }
  });

  // 8. Secretaria autorizada cria/edita/activa/desactiva curso da Moztechwave e sincroniza portal público (incluindo vacancies = 0)
  await check('8. Secretaria autorizada cria, edita e sincroniza curso da Moztechwave (incluindo vagas=0 esgotado)', async () => {
    const newCourse: Course = {
      id: 'crs-moz-test-solar',
      institutionId: 'inst-1',
      name: 'Instalação de Painéis Solares & Energia Renovável',
      code: 'SOL-101',
      category: 'Eletricidade',
      description: 'Curso técnico prático.',
      duration: '4 Meses',
      workloadHours: 240,
      theoryHours: 80,
      practiceHours: 160,
      modality: 'Presencial',
      periodType: 'trimestral',
      requirements: ['10ª Classe Concluída', 'Aptidão básica'],
      price: 16000,
      registrationFee: 1500,
      monthlyFee: 4000,
      feeMonthly: 4000,
      totalVacancies: 2,
      filledVacancies: 0,
      certificate: 'Certificado Técnico Solar',
      status: 'Inscrições Abertas',
      modules: []
    };

    store.courses.set(newCourse.id, newCourse);
    const currentInst = store.privInsts.get('inst-1') as Institution;
    const updatedInst: Institution = {
      ...currentInst,
      onlineRegistrationConfig: {
        ...currentInst.onlineRegistrationConfig!,
        coursesConfig: [
          ...currentInst.onlineRegistrationConfig!.coursesConfig,
          {
            courseId: newCourse.id,
            courseName: newCourse.name,
            category: newCourse.category,
            active: true,
            price: newCourse.registrationFee!,
            monthlyFee: newCourse.monthlyFee!,
            duration: newCourse.duration,
            requirements: newCourse.requirements,
            vacancies: newCourse.totalVacancies!,
            filledVacancies: 0,
            regimes: ['Laboral', 'Pós-Laboral'],
            shifts: ['Manhã', 'Tarde', 'Noite']
          }
        ]
      }
    };
    store.privInsts.set('inst-1', updatedInst);

    const pubPayload = buildPublicInstitutionFromModel(updatedInst);
    assert.deepEqual(getClientDirectWriteOverflowReasons(pubPayload), []);

    await store.runAtomicTransaction(() =>
      executePublishPublicInstitutionTransaction(store.createPublicAdapter(), {
        slug: 'moztechwave',
        institutionId: 'inst-1',
        publicData: pubPayload,
        isSuperAdmin: false
      })
    );

    const publishedList = extractPublishedPublicCourses([
      store.publicDocs.get('moztechwave') as any
    ]);
    const syncedCourse = publishedList.find((c) => c.courseId === newCourse.id);
    assert.ok(syncedCourse, 'Novo curso criado pela Secretaria deve aparecer no portal público');
    assert.equal(syncedCourse.monthlyFee, 4000);
    assert.equal(syncedCourse.vacancies, 2);

    // Verificar comportamento estrito quando totalVacancies === 0
    assert.equal(getRemainingVacancies({ vacancies: 0, filledVacancies: 0 }), 0);
    assert.equal(isCourseSoldOut({ vacancies: 0, filledVacancies: 0 }), true);
  });

  // 9. Candidato público submete inscrição em /i/moztechwave com estado inicial seguro e sem alterar filledVacancies
  await check('9. Submissão pública em /i/moztechwave valida campos, aplica estado submetida/Pendente e não altera filledVacancies', () => {
    const pubDoc = store.publicDocs.get('moztechwave') as any;
    const cfg = pubDoc.onlineRegistrationConfig;
    const activeCfgCourses = cfg.coursesConfig.filter((c: any) => c.active !== false);

    const formCheck = validateFullRegistration(
      {
        selectedCourseId: 'crs-moz-test-solar',
        fullName: 'Joana Alberto Tembe',
        documentNumber: '110104558291A',
        birthDate: '2003-04-12',
        gender: 'Feminino',
        phone: '+258 84 555 9012',
        email: 'joana.tembe@example.co.mz',
        province: 'Nampula',
        city: 'Nacala-Porto',
        address: 'Bairro Triângulo',
        guardianName: 'Alberto Tembe',
        guardianPhone: '+258 84 555 0001',
        guardianRelationship: 'Pai',
        authorizedPickupPersons: 'Alberto Tembe',
        nuit: '123456789',
        previousSchool: 'Escola Secundária de Nacala',
        customAnswers: { q1: 'Website Oficial Moztechwave', q2: 'Sim', q3: '12ª Classe Geral Concluída' },
        uploadedDocs: Object.fromEntries(
          (cfg.requiredDocuments || []).map((docTitle: string) => [
            docTitle,
            {
              fileName: 'documento.pdf',
              fileSize: '42 KB',
              mimeType: 'application/pdf',
              dataUrl: 'data:application/pdf;base64,JVBERi0xLjQ=',
              uploadedAt: '2026-11-27'
            }
          ])
        ),
        termsAccepted: true,
        privacyAccepted: true
      },
      cfg,
      activeCfgCourses
    );
    assert.equal(formCheck.valid, true, `Erros inesperados: ${formCheck.errors.join('; ')}`);

    const serverCheck = serverValidation.validateCourseApplicationServerPayload({
      institutionId: 'inst-1',
      slug: 'moztechwave',
      courseId: 'crs-moz-test-solar',
      courseName: 'Instalação de Painéis Solares & Energia Renovável',
      fullName: 'Joana Alberto Tembe',
      phone: '+258 84 555 9012',
      email: 'joana.tembe@example.co.mz',
      documentNumber: '110104558291A',
      termsAccepted: true,
      privacyAccepted: true
    });
    assert.equal(serverCheck.ok, true);
    assert.equal(serverCheck.clean.status, 'submetida');
    assert.equal(serverCheck.clean.paymentStatus, 'Pendente');
    assert.equal('studentId' in serverCheck.clean, false);
    assert.equal('matricula' in serverCheck.clean, false);
    assert.equal(store.courses.get('crs-moz-test-solar')?.filledVacancies, 0);
  });

  // 10. Bloqueio por curso esgotado (vacancies=0 ou esgotado) e duplicado BI/email/telefone
  await check('10. Submissão pública bloqueia curso esgotado, curso com 0 vagas e duplicados', () => {
    const soldOutZero = serverValidation.validateCourseVacancyAvailable({
      courseId: 'crs-zero',
      vacancies: 0,
      filledVacancies: 0
    });
    assert.equal(soldOutZero.ok, false);
    assert.equal(soldOutZero.error.code, 'failed-precondition');

    const dedup1 = serverValidation.buildCourseApplicationDedupKeys({
      institutionId: 'inst-1',
      courseId: 'crs-moz-test-solar',
      documentNumber: '110104558291A',
      email: 'joana.tembe@example.co.mz',
      phone: '+258 84 555 9012'
    });
    const dedup2 = serverValidation.buildCourseApplicationDedupKeys({
      institutionId: 'inst-1',
      courseId: 'crs-moz-test-solar',
      documentNumber: '110104558291A',
      email: 'JOANA.TEMBE@EXAMPLE.CO.MZ',
      phone: '258845559012'
    });
    assert.equal(dedup1.length, 3);
    assert.equal(dedup1[0].id, dedup2[0].id);
    assert.equal(dedup1[1].id, dedup2[1].id);
    assert.equal(dedup1[2].id, dedup2[2].id);

    const forgedStatus = serverValidation.validateCourseApplicationServerPayload({
      institutionId: 'inst-1',
      slug: 'moztechwave',
      courseId: 'crs-moz-test-solar',
      courseName: 'Instalação de Painéis Solares & Energia Renovável',
      fullName: 'Candidato Fraudulento',
      phone: '841112233',
      termsAccepted: true,
      privacyAccepted: true,
      matricula: 'MTW-FAKE-1'
    });
    assert.equal(forgedStatus.ok, false);
    assert.equal(forgedStatus.error.code, 'permission-denied');
  });

  // 11. Confirmação de matrícula reserva vaga atomicamente e impede excesso concorrente
  await check('11. Confirmação de matrícula incrementa filledVacancies atomicamente em courses/inst/publicInstitutions e trava corrida', async () => {
    // Curso tem 2 vagas; 1ª matrícula passa (0 -> 1)
    const first = await store.confirmVacancyAtomic('inst-1', 'crs-moz-test-solar');
    assert.equal(first.filledVacancies, 1);

    // Duas matrículas concorrentes para a última vaga disponível (1/2) -> exactamente 1 sucesso e 1 erro
    const race = await Promise.allSettled([
      store.confirmVacancyAtomic('inst-1', 'crs-moz-test-solar'),
      store.confirmVacancyAtomic('inst-1', 'crs-moz-test-solar')
    ]);
    assert.equal(race.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal(race.filter((r) => r.status === 'rejected').length, 1);

    assert.equal(store.courses.get('crs-moz-test-solar')?.filledVacancies, 2);
    const privCourse = (store.privInsts.get('inst-1')?.onlineRegistrationConfig?.coursesConfig || []).find(
      (c: any) => c.courseId === 'crs-moz-test-solar'
    );
    const pubCourse = (store.publicDocs.get('moztechwave')?.onlineRegistrationConfig?.coursesConfig || []).find(
      (c: any) => c.courseId === 'crs-moz-test-solar'
    );
    assert.equal(privCourse.filledVacancies, 2);
    assert.equal(pubCourse.filledVacancies, 2);
  });

  // 12. Paridade estrita firestore.rules <-> firebase/firestore.rules e funções servidor
  await check('12. firestore.rules, firebase/firestore.rules e firebase/functions mantêm paridade e regras mínimas activas', () => {
    const rootRules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');
    const fbRules = fs.readFileSync(path.resolve(process.cwd(), 'firebase/firestore.rules'), 'utf8');
    assert.equal(rootRules, fbRules, 'firestore.rules e firebase/firestore.rules devem ser idênticos');

    for (const marker of [
      'function isActiveUserDoc()',
      'function canManageCourses(instId)',
      'function canPublishPublicPortal(instId)',
      "'onlineRegistrationConfig', 'phone', 'whatsapp', 'email', 'publicPortalPublished', 'updatedAt'",
      'branches.size() <= 6',
      'courses.size() <= 12',
      'isCourseOpenAndAvailableAt(pub.onlineRegistrationConfig.coursesConfig, 11, targetCourseId)'
    ]) {
      assert.ok(rootRules.includes(marker), `Marcador obrigatório ausente em firestore.rules: ${marker}`);
    }

    assert.ok('publishPublicInstitutionCallable' in compiledFunctions);
    const fnIndexSrc = fs.readFileSync(path.resolve(process.cwd(), 'firebase/functions/index.ts'), 'utf8');
    assert.ok(fnIndexSrc.includes('requiredSecretariaPermissions'));
    assert.ok(fnIndexSrc.includes("['candidatos.config', 'cursos.create', 'cursos.edit']"));
  });

  console.log(`\nResumo Moztechwave & Permissões Fase 3.1: ${passed}/12 testes concluídos com sucesso.`);
}

runTests().catch((err) => {
  console.error('FALHA NA SUÍTE MOZTECHWAVE & PERMISSÕES:', err);
  process.exit(1);
});
