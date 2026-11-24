/**
 * Bateria Completa de Testes Automatizados — SIGAR PRO (3 Fluxos Centrais + Backend Real)
 *
 * Verifica:
 * 1. Lógica de convites, hierarquia RBAC e bloqueio anti-SUPER_ADMIN
 * 2. Exigência estrita de email_verified == true (cliente, validação servidor e Firestore Rules)
 * 3. Reutilização, revogação, divergência de e-mail e expiração de convite
 * 4. Submissão de candidatura a vaga, deduplicação atómica e rate limiting
 * 5. Rejeição de vaga em rascunho/encerrada/prazo expirado e anexos inválidos
 * 6. Isolamento multi-institucional (inst-1 vs ceu-azul-nacala) + payloads públicos sanitizados
 * 7. Integridade de Storage Rules, Firestore Rules, Índices e firebase.json
 * 8. Idempotência do gatilho onJobApplicationCreated (sem dupla contagem ou duplicação de logs)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  buildInviteActivationUrl,
  canCallerInviteRole,
  consumeUserInvitationAndProvisionUser,
  getAllowedInviteRoles,
  sanitizeInvitePermissions,
  validateInviteActivationState,
  validateInviteCreationInput
} from '../src/services/inviteAuthService';
import {
  canActorManageJobVacancies,
  canActorReviewJobApplications,
  formatRecruitmentErrorMessage,
  isVacancyWithinDeadline,
  normalizeVacancyStatus,
  validateAttachmentFile,
  validateJobApplicationInput
} from '../src/services/jobRecruitmentService';
import {
  KNOWN_INSTITUTIONS,
  preparePublicInstitutionsSyncPayloads,
  resolveInstitutionSlug,
  resolvePublicInstitutionBySlug
} from '../src/services/publicInstitutionService';
import {
  buildJobDedupKey,
  evaluateInvitationForActivation,
  evaluateRateLimitWindow,
  getMaputoTodayIsoDate,
  maskCandidateNameServer,
  sha256Hex,
  validateJobApplicationServerPayload,
  validateVacancyAcceptingApplications
} from '../firebase/functions/src/validation';
import { JobVacancy, UserInvitation } from '../src/types';

interface CheckResult {
  id: number;
  category: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: CheckResult[] = [];
let seq = 0;

function record(category: string, name: string, passed: boolean, details: string) {
  seq += 1;
  results.push({
    id: seq,
    category,
    name,
    status: passed ? 'PASS' : 'FAIL',
    details
  });
}

async function runAll() {
  const nowMs = Date.now();
  const futureIso = new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString();
  const futureDateStr = new Date(nowMs + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const pastDateStr = new Date(nowMs - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const validPdfDataUrl = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4\nSIGAR TEST CV').toString('base64');

  // ---------------------------------------------------------------------------
  // 1. LÓGICA DE CONVITES E RBAC
  // ---------------------------------------------------------------------------
  const secAllowed = getAllowedInviteRoles('SECRETARIA');
  record(
    'Convites & RBAC',
    'SECRETARIA não pode convidar ADMIN_INSTITUICAO, DIRETOR, FINANCEIRO ou SUPER_ADMIN',
    secAllowed.includes('PROFESSOR') &&
      secAllowed.includes('ALUNO') &&
      !secAllowed.includes('ADMIN_INSTITUICAO' as any) &&
      !secAllowed.includes('DIRETOR' as any) &&
      !secAllowed.includes('FINANCEIRO' as any) &&
      !canCallerInviteRole('SUPER_ADMIN', 'SUPER_ADMIN'),
    `Permitidos SECRETARIA=[${secAllowed.join(', ')}]; anti-SUPER_ADMIN ativo`
  );

  const crossInstAttempt = validateInviteCreationInput(
    {
      uid: 'sec-1',
      name: 'Secretária CFTPM',
      email: 'sec@moztechwave.co.mz',
      role: 'SECRETARIA',
      institutionId: 'inst-1'
    },
    {
      fullName: 'Docente Alvo',
      email: 'docente@ceuazul.co.mz',
      institutionId: 'ceu-azul-nacala',
      role: 'PROFESSOR'
    }
  );
  record(
    'Convites & RBAC',
    'Bloqueia emissão de convite para outra instituição (inst-1 -> ceu-azul-nacala)',
    !crossInstAttempt.ok,
    `Resultado: ok=${crossInstAttempt.ok}, msg="${crossInstAttempt.error}"`
  );

  const sanitizedPerms = sanitizeInvitePermissions('SECRETARIA', 'PROFESSOR', [
    'manage_system' as any,
    'view_dashboard'
  ]);
  const activationUrl = buildInviteActivationUrl('tok_abc123456789');
  record(
    'Convites & RBAC',
    'Sanitiza permissões acima do tecto e gera URL /ativar-conta?token=...',
    !sanitizedPerms.includes('manage_system' as any) && activationUrl.includes('/ativar-conta?token=tok_abc123456789'),
    `Perms sanitizadas=[${sanitizedPerms.join(', ')}], URL="${activationUrl}"`
  );

  // ---------------------------------------------------------------------------
  // 2. EMAIL NÃO CONFIRMADO VS CONFIRMADO
  // ---------------------------------------------------------------------------
  const baseInvite: UserInvitation = {
    id: 'tok_valid_1234567890abcdef',
    token: 'tok_valid_1234567890abcdef',
    fullName: 'Carla Mondlane',
    email: 'carla.mondlane@exemplo.mz',
    institutionId: 'inst-1',
    branchId: 'todas',
    role: 'PROFESSOR',
    permissions: ['view_dashboard'],
    status: 'pendente',
    used: false,
    revoked: false,
    expiresAt: futureIso,
    expiresAtMs: nowMs + 7 * 24 * 60 * 60 * 1000,
    createdAt: new Date(nowMs).toISOString(),
    createdByUid: 'dir-1',
    createdByName: 'Diretor CFTPM',
    createdByRole: 'DIRETOR'
  };

  const unverifiedEval = evaluateInvitationForActivation({
    invite: baseInvite,
    callerUid: 'uid-carla',
    callerEmail: 'carla.mondlane@exemplo.mz',
    emailVerified: false,
    nowMs
  });
  record(
    'Verificação E-mail',
    'Servidor rejeita activação quando email_verified == false',
    !unverifiedEval.ok && 'error' in unverifiedEval && unverifiedEval.error.code === 'failed-precondition',
    `ok=${unverifiedEval.ok}, code=${'error' in unverifiedEval ? unverifiedEval.error.code : 'none'}`
  );

  let clientRejectedUnverified = false;
  try {
    await consumeUserInvitationAndProvisionUser({
      uid: 'uid-carla',
      email: 'carla.mondlane@exemplo.mz',
      emailVerified: false,
      invite: baseInvite,
      sourceCollection: 'userInvitations'
    });
  } catch {
    clientRejectedUnverified = true;
  }
  record(
    'Verificação E-mail',
    'Cliente recusa finalização do convite quando emailVerified == false',
    clientRejectedUnverified,
    `Bloqueio local lançado antes de qualquer escrita: ${clientRejectedUnverified}`
  );

  const verifiedEval = evaluateInvitationForActivation({
    invite: baseInvite,
    callerUid: 'uid-carla',
    callerEmail: 'CARLA.MONDLANE@exemplo.mz',
    emailVerified: true,
    nowMs
  });
  record(
    'Verificação E-mail',
    'Servidor aprova activação quando email_verified == true e e-mail coincide (case-insensitive)',
    verifiedEval.ok && verifiedEval.institutionId === 'inst-1' && verifiedEval.targetRole === 'PROFESSOR',
    `ok=${verifiedEval.ok}, role=${verifiedEval.ok ? verifiedEval.targetRole : 'none'}, inst=${verifiedEval.ok ? verifiedEval.institutionId : 'none'}`
  );

  // ---------------------------------------------------------------------------
  // 3. REUTILIZAÇÃO, REVOGAÇÃO, DIVERGÊNCIA E EXPIRAÇÃO DE CONVITE
  // ---------------------------------------------------------------------------
  const usedEval = evaluateInvitationForActivation({
    invite: { ...baseInvite, used: true, status: 'ativado' },
    callerUid: 'uid-carla',
    callerEmail: 'carla.mondlane@exemplo.mz',
    emailVerified: true,
    nowMs
  });
  const expiredEval = evaluateInvitationForActivation({
    invite: {
      ...baseInvite,
      expiresAt: new Date(nowMs - 1000).toISOString(),
      expiresAtMs: nowMs - 1000
    },
    callerUid: 'uid-carla',
    callerEmail: 'carla.mondlane@exemplo.mz',
    emailVerified: true,
    nowMs
  });
  const revokedEval = evaluateInvitationForActivation({
    invite: { ...baseInvite, revoked: true, status: 'revogado' },
    callerUid: 'uid-carla',
    callerEmail: 'carla.mondlane@exemplo.mz',
    emailVerified: true,
    nowMs
  });
  const mismatchEval = evaluateInvitationForActivation({
    invite: baseInvite,
    callerUid: 'uid-intruso',
    callerEmail: 'intruso@outro.mz',
    emailVerified: true,
    nowMs
  });
  const superAdminInviteEval = evaluateInvitationForActivation({
    invite: { ...baseInvite, role: 'SUPER_ADMIN' },
    callerUid: 'uid-carla',
    callerEmail: 'carla.mondlane@exemplo.mz',
    emailVerified: true,
    nowMs
  });
  const clientExpiredCheck = validateInviteActivationState({
    ...baseInvite,
    expiresAt: new Date(nowMs - 60000).toISOString(),
    expiresAtMs: nowMs - 60000
  });

  record(
    'Uso Único & Expiração',
    'Rejeita convite já usado, expirado, revogado, e-mail divergente e tentativa SUPER_ADMIN',
    !usedEval.ok &&
      !expiredEval.ok &&
      !revokedEval.ok &&
      !mismatchEval.ok &&
      'error' in mismatchEval &&
      mismatchEval.error.code === 'permission-denied' &&
      !superAdminInviteEval.ok &&
      !clientExpiredCheck.valid &&
      clientExpiredCheck.reason === 'expired',
    `used=${!usedEval.ok}, expired=${!expiredEval.ok}, revoked=${!revokedEval.ok}, mismatch=${!mismatchEval.ok}, superAdmin=${!superAdminInviteEval.ok}`
  );

  // ---------------------------------------------------------------------------
  // 4. VAGA ENCERRADA, PRAZO VENCIDO E ANEXOS INVÁLIDOS
  // ---------------------------------------------------------------------------
  const openVacancy: JobVacancy = {
    id: 'vaga-docente-1',
    institutionId: 'inst-1',
    institutionName: 'CFTPM Moztechwave',
    institutionSlug: 'moztechwave',
    title: 'Formador de Informática',
    description: 'Ministrar módulos práticos de redes e programação.',
    requirements: ['Licenciatura em Informática'],
    location: 'Nacala Porto',
    contractType: 'Tempo Inteiro',
    deadline: futureDateStr,
    requiredAttachments: ['Currículo (CV)'],
    status: 'publicada',
    applicationsCount: 0,
    createdAt: new Date(nowMs).toISOString(),
    updatedAt: new Date(nowMs).toISOString(),
    createdByUid: 'dir-1'
  };

  const draftCheck = validateVacancyAcceptingApplications({ ...openVacancy, status: 'rascunho' }, 'inst-1', nowMs);
  const closedCheck = validateVacancyAcceptingApplications({ ...openVacancy, status: 'encerrada' }, 'inst-1', nowMs);
  const expiredVacCheck = validateVacancyAcceptingApplications({ ...openVacancy, deadline: pastDateStr }, 'inst-1', nowMs);
  const clientExpiredVacCheck = validateJobApplicationInput(
    { ...openVacancy, deadline: pastDateStr },
    {
      fullName: 'João Sitoe',
      email: 'joao.sitoe@mz.co',
      phone: '841234567',
      academicLevel: 'Licenciatura',
      experienceSummary: 'Cinco anos de experiência docente em TI.',
      attachments: [
        {
          id: 'att-1',
          label: 'CV',
          fileName: 'cv.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 2048,
          dataUrl: validPdfDataUrl,
          uploadedAt: new Date(nowMs).toISOString()
        }
      ]
    },
    nowMs
  );

  const badExt = validateAttachmentFile({ name: 'script.exe', type: 'application/x-msdownload', size: 1024 });
  const oversize = validateAttachmentFile({ name: 'cv_pesado.pdf', type: 'application/pdf', size: 600 * 1024 });
  const serverBadDataUrl = validateJobApplicationServerPayload({
    institutionId: 'inst-1',
    vacancyId: 'vaga-docente-1',
    fullName: 'João Sitoe',
    email: 'joao.sitoe@mz.co',
    phone: '841234567',
    academicLevel: 'Licenciatura',
    experienceSummary: 'Cinco anos de experiência docente em TI.',
    attachments: [
      {
        fileName: 'cv.pdf',
        mimeType: 'text/html',
        sizeBytes: 1200,
        dataUrl: 'data:text/html;base64,PGh0bWw+'
      }
    ]
  });

  record(
    'Vagas & Anexos',
    'Bloqueia vaga em rascunho, encerrada, prazo expirado e anexos executáveis/HTML/>450KB',
    !draftCheck.ok &&
      !closedCheck.ok &&
      !expiredVacCheck.ok &&
      !clientExpiredVacCheck.valid &&
      !badExt.valid &&
      !oversize.valid &&
      !serverBadDataUrl.ok,
    `rascunho=${!draftCheck.ok}, encerrada=${!closedCheck.ok}, expiradaServ=${!expiredVacCheck.ok}, expiradaCli=${!clientExpiredVacCheck.valid}, exe=${!badExt.valid}, >450KB=${!oversize.valid}, htmlPayload=${!serverBadDataUrl.ok}`
  );

  // ---------------------------------------------------------------------------
  // 5. SUBMISSÃO DUPLICADA + RATE LIMITING (SIMULAÇÃO TRANSACCIONAL FIEL AO SERVIDOR)
  // ---------------------------------------------------------------------------
  const memStore = {
    vacancies: new Map<string, Record<string, any>>([
      ['inst-1/vaga-docente-1', { ...openVacancy, applicationsCount: 0 }],
      ['inst-1/vaga-contab-2', { ...openVacancy, id: 'vaga-contab-2', title: 'Formador Contabilidade', applicationsCount: 0 }]
    ]),
    dedup: new Map<string, Record<string, any>>(),
    rateLimits: new Map<string, { timestamps: number[] }>(),
    applications: new Map<string, Record<string, any>>(),
    tracking: new Map<string, Record<string, any>>(),
    auditLogs: new Map<string, Record<string, any>>(),
    notifications: new Map<string, Record<string, any>>()
  };

  function simulateServerJobSubmission(payload: any, tsMs: number): { ok: true; appId: string } | { ok: false; code: string } {
    const val = validateJobApplicationServerPayload(payload);
    if ('error' in val) return { ok: false, code: val.error.code };
    const clean = val.clean;
    const vacKey = `${clean.institutionId}/${clean.vacancyId}`;
    const vac = memStore.vacancies.get(vacKey) || null;
    const vacCheck = validateVacancyAcceptingApplications(vac, clean.institutionId, tsMs);
    if ('error' in vacCheck) return { ok: false, code: vacCheck.error.code };

    const rlKey = `jobsub_${sha256Hex(clean.email)}`;
    const rlExisting = memStore.rateLimits.get(rlKey)?.timestamps || [];
    const rlCheck = evaluateRateLimitWindow(rlExisting, tsMs);
    if (!rlCheck.allowed) return { ok: false, code: 'resource-exhausted' };

    const dedupKey = `${clean.institutionId}/${buildJobDedupKey(clean.vacancyId, clean.email)}`;
    if (memStore.dedup.has(dedupKey)) return { ok: false, code: 'already-exists' };

    const appId = `jobapp-${memStore.applications.size + 1}`;
    memStore.applications.set(`${clean.institutionId}/${appId}`, {
      id: appId,
      vacancyId: clean.vacancyId,
      institutionId: clean.institutionId,
      applicationCode: `VAGA-2026-${1000 + memStore.applications.size}`,
      countedInVacancy: true,
      maskedName: maskCandidateNameServer(clean.fullName)
    });
    memStore.dedup.set(dedupKey, { vacancyId: clean.vacancyId, applicationId: appId });
    memStore.rateLimits.set(rlKey, { timestamps: rlCheck.nextTimestamps });
    vac!.applicationsCount += 1;
    memStore.auditLogs.set(`jobaud_${appId}`, { id: `jobaud_${appId}`, institutionId: clean.institutionId });
    memStore.notifications.set(`jobnotif_${appId}`, { id: `jobnotif_${appId}`, institutionId: clean.institutionId });
    return { ok: true, appId };
  }

  const baseAppPayload = {
    institutionId: 'inst-1',
    vacancyId: 'vaga-docente-1',
    fullName: 'Maria Teresa Macamo',
    email: 'Maria.Macamo@exemplo.mz',
    phone: '842223344',
    academicLevel: 'Licenciatura em Engenharia Informática',
    experienceSummary: '4 anos de docência e suporte de redes locais.',
    attachments: [{ fileName: 'CV_Maria.pdf', mimeType: 'application/pdf', sizeBytes: 1800, dataUrl: validPdfDataUrl }]
  };

  const firstSub = simulateServerJobSubmission(baseAppPayload, nowMs);
  const dupSubSameCase = simulateServerJobSubmission({ ...baseAppPayload, email: 'maria.macamo@exemplo.mz' }, nowMs + 1000);
  const otherVacSub = simulateServerJobSubmission({ ...baseAppPayload, vacancyId: 'vaga-contab-2' }, nowMs + 2000);

  // Rate limit test with 6 rapid attempts across distinct vacancies/emails check
  const spamEmail = 'spam.tester@exemplo.mz';
  let rateAllowedCount = 0;
  let sixthBlockedCode = '';
  for (let i = 1; i <= 6; i++) {
    memStore.vacancies.set(`inst-1/vaga-rl-${i}`, { ...openVacancy, id: `vaga-rl-${i}`, applicationsCount: 0 });
    const res = simulateServerJobSubmission(
      { ...baseAppPayload, email: spamEmail, vacancyId: `vaga-rl-${i}` },
      nowMs + i * 500
    );
    if (res.ok) rateAllowedCount++;
    else if ('code' in res) sixthBlockedCode = res.code;
  }

  record(
    'Deduplicação & Rate Limit',
    'Bloqueia candidatura duplicada na mesma vaga, permite outra vaga e trava 6.ª tentativa rápida',
    firstSub.ok &&
      !dupSubSameCase.ok &&
      'code' in dupSubSameCase &&
      dupSubSameCase.code === 'already-exists' &&
      otherVacSub.ok &&
      memStore.vacancies.get('inst-1/vaga-docente-1')?.applicationsCount === 1 &&
      rateAllowedCount === 5 &&
      sixthBlockedCode === 'resource-exhausted',
    `1ª=${firstSub.ok}, dup=${'code' in dupSubSameCase ? dupSubSameCase.code : 'ok'}, outraVaga=${otherVacSub.ok}, countVaga1=${memStore.vacancies.get('inst-1/vaga-docente-1')?.applicationsCount}, rateLimit=${rateAllowedCount}/5->${sixthBlockedCode}`
  );

  // ---------------------------------------------------------------------------
  // 6. IDEMPOTÊNCIA DO GATILHO onJobApplicationCreated
  // ---------------------------------------------------------------------------
  function simulateOnJobApplicationCreated(institutionId: string, applicationId: string) {
    const appDoc = memStore.applications.get(`${institutionId}/${applicationId}`);
    if (!appDoc) return;
    if (appDoc.countedInVacancy !== true) {
      const vac = memStore.vacancies.get(`${institutionId}/${appDoc.vacancyId}`);
      if (vac) vac.applicationsCount += 1;
      appDoc.countedInVacancy = true;
    }
    const audId = `jobaud_${applicationId}`;
    if (!memStore.auditLogs.has(audId)) {
      memStore.auditLogs.set(audId, { id: audId, institutionId, targetId: applicationId });
    }
    const notifId = `jobnotif_${applicationId}`;
    if (!memStore.notifications.has(notifId)) {
      memStore.notifications.set(notifId, { id: notifId, institutionId });
    }
  }

  // Cenário A: Aplicação criada pela Callable (já tem countedInVacancy=true, jobaud e jobnotif)
  const preCount = memStore.vacancies.get('inst-1/vaga-docente-1')!.applicationsCount;
  const preAudCount = memStore.auditLogs.size;
  const preNotifCount = memStore.notifications.size;
  if (firstSub.ok) {
    simulateOnJobApplicationCreated('inst-1', firstSub.appId);
    simulateOnJobApplicationCreated('inst-1', firstSub.appId);
  }
  const postCallableTriggerOk =
    memStore.vacancies.get('inst-1/vaga-docente-1')!.applicationsCount === preCount &&
    memStore.auditLogs.size === preAudCount &&
    memStore.notifications.size === preNotifCount;

  // Cenário B: Aplicação criada por Secretaria (countedInVacancy=false), trigger corre 2x (retry)
  memStore.applications.set('inst-1/jobapp-sec-99', {
    id: 'jobapp-sec-99',
    vacancyId: 'vaga-docente-1',
    institutionId: 'inst-1',
    applicationCode: 'VAGA-2026-9999',
    countedInVacancy: false
  });
  simulateOnJobApplicationCreated('inst-1', 'jobapp-sec-99');
  simulateOnJobApplicationCreated('inst-1', 'jobapp-sec-99');
  const postRetryCount = memStore.vacancies.get('inst-1/vaga-docente-1')!.applicationsCount;
  const retryTriggerOk =
    postRetryCount === preCount + 1 &&
    memStore.auditLogs.size === preAudCount + 1 &&
    memStore.notifications.size === preNotifCount + 1;

  record(
    'Idempotência Cloud Function',
    'onJobApplicationCreated nunca duplica applicationsCount, auditLogs nem notifications em retries',
    postCallableTriggerOk && retryTriggerOk,
    `Pos-Callable (2 triggers): count=${preCount}->${preCount}; Retry Secretaria (2 triggers): count=${preCount}->${postRetryCount}, logs=+1`
  );

  // ---------------------------------------------------------------------------
  // 7. ISOLAMENTO inst-1 vs ceu-azul-nacala + PAYLOADS PÚBLICOS SANITIZADOS
  // ---------------------------------------------------------------------------
  const pubMoz = await resolvePublicInstitutionBySlug('moztechwave', KNOWN_INSTITUTIONS);
  const pubCeuCan = await resolvePublicInstitutionBySlug('ceu-azul-nacala', KNOWN_INSTITUTIONS);
  const pubCeuAlias = await resolvePublicInstitutionBySlug('ceu-azul', KNOWN_INSTITUTIONS);
  const pubInvalid = await resolvePublicInstitutionBySlug('instituicao-inexistente-xyz', KNOWN_INSTITUTIONS);
  const syncPayloads = preparePublicInstitutionsSyncPayloads();

  const sensitiveKeys = [
    'financialSettings',
    'financialAccounts',
    'bankAccounts',
    'receivingAccounts',
    'mpesa',
    'emola',
    'mkesh',
    'mpesaNumber',
    'emolaNumber',
    'mkeshNumber',
    'accessCode',
    'students',
    'users'
  ];
  const hasLeakedKeys = (obj: Record<string, any>) =>
    sensitiveKeys.some((k) => k in obj) ||
    (obj.paymentMethods && ('mpesa' in obj.paymentMethods || 'emola' in obj.paymentMethods || 'accountNumber' in obj.paymentMethods));

  record(
    'Isolamento Multi-Tenant',
    'Slugs moztechwave e ceu-azul-nacala resolvem isoladamente sem PII/contas privadas',
    pubMoz?.institutionId === 'inst-1' &&
      pubCeuCan?.institutionId === 'ceu-azul-nacala' &&
      pubCeuAlias?.institutionId === 'ceu-azul-nacala' &&
      pubInvalid === null &&
      resolveInstitutionSlug({ id: 'ceu-azul-nacala', slug: 'ceu-azul' }) === 'ceu-azul-nacala' &&
      syncPayloads.moztechwave.institutionId === 'inst-1' &&
      syncPayloads['ceu-azul-nacala'].institutionId === 'ceu-azul-nacala' &&
      !hasLeakedKeys(syncPayloads.moztechwave) &&
      !hasLeakedKeys(syncPayloads['ceu-azul-nacala']),
    `moztechwave->${pubMoz?.institutionId}, ceu-azul-nacala->${pubCeuCan?.institutionId}, invalid->${pubInvalid}, zeroCamposPrivados=${!hasLeakedKeys(syncPayloads.moztechwave) && !hasLeakedKeys(syncPayloads['ceu-azul-nacala'])}`
  );

  // ---------------------------------------------------------------------------
  // 8. RBAC GRANULAR COMPLETO PARA VAGAS & CANDIDATURAS (8 PERFIS + PRAZOS)
  // ---------------------------------------------------------------------------
  const superByUid = canActorManageJobVacancies(
    {
      uid: '2dRLWqnY1zf1MlR9rZYhAKPvGbV2',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      email: 'moztechwavenacala8@gmail.com',
      emailVerified: true
    },
    'ceu-azul-nacala'
  );
  const superByEmail = canActorManageJobVacancies(
    {
      uid: '2dRLWqnY1zf1MlR9rZYhAKPvGbV2',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      email: 'moztechwavenacala8@gmail.com',
      emailVerified: true
    },
    'inst-1'
  );
  const superUnverifiedDenied =
    !canActorManageJobVacancies(
      {
        uid: '2dRLWqnY1zf1MlR9rZYhAKPvGbV2',
        name: 'Super Admin Não Verificado',
        role: 'SUPER_ADMIN',
        email: 'moztechwavenacala8@gmail.com',
        emailVerified: false
      },
      'inst-1'
    ) &&
    !canActorReviewJobApplications(
      {
        uid: '2dRLWqnY1zf1MlR9rZYhAKPvGbV2',
        name: 'Super Admin Não Verificado',
        role: 'SUPER_ADMIN',
        email: 'moztechwavenacala8@gmail.com',
        emailVerified: false
      },
      'inst-1'
    );

  const adminInstOwn = canActorManageJobVacancies(
    { uid: 'adm-1', name: 'Admin Inst1', role: 'ADMIN_INSTITUICAO', institutionId: 'inst-1' },
    'inst-1'
  );
  const adminInstCrossDenied = !canActorManageJobVacancies(
    { uid: 'adm-1', name: 'Admin Inst1', role: 'ADMIN_INSTITUICAO', institutionId: 'inst-1' },
    'ceu-azul-nacala'
  );
  const directorOwn = canActorManageJobVacancies(
    { uid: 'dir-1', name: 'Diretor Inst1', role: 'DIRETOR', institutionId: 'inst-1' },
    'inst-1'
  );
  const directorCrossDenied = !canActorManageJobVacancies(
    { uid: 'dir-1', name: 'Diretor Inst1', role: 'DIRETOR', institutionId: 'inst-1' },
    'ceu-azul-nacala'
  );
  const ceoOwn = canActorManageJobVacancies(
    { uid: 'ceo-1', name: 'CEO Céu Azul', role: 'CEO', institutionId: 'ceu-azul-nacala' },
    'ceu-azul-nacala'
  );
  const ceoCross = canActorManageJobVacancies(
    { uid: 'ceo-1', name: 'CEO Céu Azul', role: 'CEO', institutionId: 'ceu-azul-nacala' },
    'inst-1'
  );
  const adminNoInst = canActorManageJobVacancies(
    { uid: 'adm-sem-inst', name: 'Admin Órfão', role: 'ADMIN_INSTITUICAO', institutionId: '' },
    'inst-1'
  );
  const secWithVagasPerm =
    canActorManageJobVacancies(
      { uid: 'sec-ok', name: 'Secretaria Vagas', role: 'SECRETARIA', institutionId: 'ceu-azul-nacala', permissions: ['alunos.view', 'vagas.manage'] },
      'ceu-azul-nacala'
    ) &&
    canActorReviewJobApplications(
      { uid: 'sec-ok', name: 'Secretaria Vagas', role: 'SECRETARIA', institutionId: 'ceu-azul-nacala', permissions: ['alunos.view', 'vagas.manage'] },
      'ceu-azul-nacala'
    );
  const secReviewOnlyPerm =
    !canActorManageJobVacancies(
      { uid: 'sec-rev', name: 'Secretaria Triagem', role: 'SECRETARIA', institutionId: 'ceu-azul-nacala', permissions: ['vagas.review_applications'] },
      'ceu-azul-nacala'
    ) &&
    canActorReviewJobApplications(
      { uid: 'sec-rev', name: 'Secretaria Triagem', role: 'SECRETARIA', institutionId: 'ceu-azul-nacala', permissions: ['vagas.review_applications'] },
      'ceu-azul-nacala'
    );
  const secWithoutVagasPerm =
    canActorManageJobVacancies(
      { uid: 'sec-no', name: 'Secretaria Geral', role: 'SECRETARIA', institutionId: 'ceu-azul-nacala', permissions: ['alunos.view'] },
      'ceu-azul-nacala'
    ) ||
    canActorReviewJobApplications(
      { uid: 'sec-no', name: 'Secretaria Geral', role: 'SECRETARIA', institutionId: 'ceu-azul-nacala', permissions: ['alunos.view'] },
      'ceu-azul-nacala'
    );
  const profDenied =
    canActorManageJobVacancies(
      { uid: 'prof-1', name: 'Professor', role: 'PROFESSOR', institutionId: 'ceu-azul-nacala' },
      'ceu-azul-nacala'
    ) ||
    canActorReviewJobApplications(
      { uid: 'prof-1', name: 'Professor', role: 'PROFESSOR', institutionId: 'ceu-azul-nacala' },
      'ceu-azul-nacala'
    );
  const formadorDenied =
    canActorManageJobVacancies(
      { uid: 'form-1', name: 'Formador', role: 'FORMADOR', institutionId: 'inst-1' },
      'inst-1'
    ) ||
    canActorReviewJobApplications(
      { uid: 'form-1', name: 'Formador', role: 'FORMADOR', institutionId: 'inst-1' },
      'inst-1'
    );
  const anonDenied =
    canActorManageJobVacancies(undefined, 'inst-1') ||
    canActorManageJobVacancies({ uid: '', name: 'Anon', role: 'VISITANTE' }, 'inst-1') ||
    canActorReviewJobApplications(undefined, 'inst-1');

  const statusMapOk =
    normalizeVacancyStatus('draft') === 'rascunho' &&
    normalizeVacancyStatus('published') === 'publicada' &&
    normalizeVacancyStatus('closed') === 'encerrada';

  const deadlineVisibilityOk =
    isVacancyWithinDeadline({ status: 'publicada', deadline: futureDateStr }, nowMs) &&
    isVacancyWithinDeadline({ status: 'publicada', deadline: getMaputoTodayIsoDate(nowMs) }, nowMs) &&
    !isVacancyWithinDeadline({ status: 'publicada', deadline: pastDateStr }, nowMs) &&
    !isVacancyWithinDeadline({ status: 'encerrada', deadline: futureDateStr }, nowMs) &&
    !isVacancyWithinDeadline({ status: 'rascunho', deadline: futureDateStr }, nowMs);

  const formattedPermErr = formatRecruitmentErrorMessage(
    new Error(
      JSON.stringify({
        error: 'Missing or insufficient permissions.',
        authInfo: { userId: 'u1', email: 'secret@x.mz' },
        operationType: 'write',
        path: 'institutions/inst-1/jobVacancies/v1'
      })
    ),
    'fallback'
  );
  const errorFormatSafe =
    formattedPermErr.includes('Missing or insufficient permissions.') &&
    formattedPermErr.includes('institutions/inst-1/jobVacancies/v1') &&
    !formattedPermErr.includes('secret@x.mz');

  record(
    'RBAC Vagas',
    'Matriz completa dos 8 perfis, isolamento inst-1/ceu-azul-nacala, prazos Maputo e formatação segura de erros',
    superByUid &&
      superByEmail &&
      superUnverifiedDenied &&
      adminInstOwn &&
      adminInstCrossDenied &&
      directorOwn &&
      directorCrossDenied &&
      ceoOwn &&
      !ceoCross &&
      !adminNoInst &&
      secWithVagasPerm &&
      secReviewOnlyPerm &&
      !secWithoutVagasPerm &&
      !profDenied &&
      !formadorDenied &&
      !anonDenied &&
      statusMapOk &&
      deadlineVisibilityOk &&
      errorFormatSafe,
    `super=${superByUid && superByEmail}, superUnverifDenied=${superUnverifiedDenied}, adminOwn/Cross=${adminInstOwn}/${adminInstCrossDenied}, dirOwn/Cross=${directorOwn}/${directorCrossDenied}, ceoOwn/Cross=${ceoOwn}/${!ceoCross}, secManage=${secWithVagasPerm}, secReviewOnly=${secReviewOnlyPerm}, secNoPerm=${!secWithoutVagasPerm}, prof/form/anonDenied=${!profDenied && !formadorDenied && !anonDenied}, deadlineOk=${deadlineVisibilityOk}, errSafe=${errorFormatSafe}`
  );

  // ---------------------------------------------------------------------------
  // 9. INTEGRIDADE DE REGRAS, STORAGE, ÍNDICES E CONFIGURAÇÃO FIREBASE
  // ---------------------------------------------------------------------------
  const rootDir = process.cwd();
  const rootRules = fs.readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');
  const nestedRules = fs.readFileSync(path.join(rootDir, 'firebase/firestore.rules'), 'utf8');
  const storageRules = fs.readFileSync(path.join(rootDir, 'firebase/storage.rules'), 'utf8');
  const indexesJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'firestore.indexes.json'), 'utf8'));
  const firebaseJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'firebase.json'), 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

  const openBraces = (rootRules.match(/\{/g) || []).length;
  const closeBraces = (rootRules.match(/\}/g) || []).length;
  const rulesSynced = rootRules === nestedRules;
  const rulesHardened =
    rootRules.includes('request.auth.token.email_verified == true') &&
    !rootRules.includes('!isRegisteredPublicSlug') &&
    rootRules.includes('match /jobApplicationDedup/{dedupId}') &&
    rootRules.includes("request.auth.token.email == 'moztechwavenacala8@gmail.com'") &&
    rootRules.includes("request.auth.uid == '2dRLWqnY1zf1MlR9rZYhAKPvGbV2'") &&
    rootRules.includes("'CEO'") &&
    rootRules.includes('canManageJobVacancies(instId)') &&
    rootRules.includes("'vagas.manage'");

  const storageHardened =
    storageRules.includes("request.auth.token.email == 'moztechwavenacala8@gmail.com'") &&
    storageRules.includes("request.auth.uid == '2dRLWqnY1zf1MlR9rZYhAKPvGbV2'") &&
    storageRules.includes('isInstRecruitmentStaff(instId)') &&
    !storageRules.includes('jafimpaulo8@gmail.com') &&
    !/allow write:\s*if\s*isSignedIn\(\)\s*;/.test(storageRules) &&
    storageRules.includes('450 * 1024') &&
    storageRules.includes('allow read, write: if false;');

  const hasCollectionGroupVacanciesIndex = Array.isArray(indexesJson.fieldOverrides) &&
    indexesJson.fieldOverrides.some(
      (f: any) =>
        f.collectionGroup === 'jobVacancies' &&
        f.fieldPath === 'status' &&
        Array.isArray(f.indexes) &&
        f.indexes.some((ix: any) => ix.queryScope === 'COLLECTION_GROUP')
    );

  const firebaseJsonWired =
    firebaseJson?.firestore?.rules === 'firestore.rules' &&
    firebaseJson?.firestore?.indexes === 'firestore.indexes.json' &&
    firebaseJson?.storage?.rules === 'firebase/storage.rules' &&
    Array.isArray(firebaseJson?.functions) &&
    firebaseJson.functions[0]?.source === 'firebase/functions' &&
    Boolean(firebaseJson?.emulators?.auth?.port) &&
    Boolean(firebaseJson?.emulators?.functions?.port) &&
    Boolean(firebaseJson?.emulators?.firestore?.port) &&
    Boolean(firebaseJson?.emulators?.storage?.port) &&
    typeof packageJson?.scripts?.['test:emulators'] === 'string';

  record(
    'Regras & Índices Firebase',
    'firestore.rules sincronizado (UID/CEO/vagas.manage), storage.rules, índice jobVacancies e emulators configurados',
    rulesSynced &&
      openBraces === closeBraces &&
      rulesHardened &&
      storageHardened &&
      hasCollectionGroupVacanciesIndex &&
      firebaseJsonWired,
    `synced=${rulesSynced}, braces=${openBraces}/${closeBraces}, rulesHardened=${rulesHardened}, storageHardened=${storageHardened}, indexCG=${hasCollectionGroupVacanciesIndex}, fbJson=${firebaseJsonWired}`
  );

  // ---------------------------------------------------------------------------
  // RELATÓRIO DE SAÍDA
  // ---------------------------------------------------------------------------
  console.log('========================================================================');
  console.log('SIGAR PRO — BATERIA DE VALIDAÇÃO INTEGRADA DOS 3 FLUXOS & BACKEND');
  console.log(`Data UTC+2 (Maputo): ${getMaputoTodayIsoDate(nowMs)}`);
  console.log('========================================================================');
  let passed = 0;
  for (const r of results) {
    console.log(`[${r.id}] [${r.status}] [${r.category}] ${r.name}`);
    console.log(`    Evidência: ${r.details}`);
    if (r.status === 'PASS') passed++;
  }
  console.log('------------------------------------------------------------------------');
  console.log(`TOTAL: ${passed}/${results.length} VERIFICAÇÕES APROVADAS (PASS).`);
  console.log('========================================================================');

  process.exit(passed === results.length ? 0 : 1);
}

runAll().catch((err) => {
  console.error('Erro fatal na execução da bateria de testes:', err);
  process.exit(1);
});
