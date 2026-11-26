import * as crypto from 'node:crypto';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import {
  buildCourseApplicationDedupKeys,
  buildJobDedupKey,
  evaluateInvitationForActivation,
  evaluateRateLimitWindow,
  isValidFirestoreId,
  isValidInviteTokenFormat,
  maskCandidateNameServer,
  normalizeRoleUpper,
  sanitizePublicInstitutionServerPayload,
  sha256Hex,
  validateCourseApplicationServerPayload,
  validateCourseVacancyAvailable,
  validateJobApplicationServerPayload,
  validateVacancyAcceptingApplications
} from './src/validation';

const app = getApps().length ? getApp() : initializeApp();
const db = getFirestore(app);
const adminAuth = getAuth(app);

/**
 * 1. Validação e activação transaccional de convites de acesso único.
 * - Exige autenticação prévia no Firebase Auth + email_verified === true efectivo
 * - Valida token, correspondência exacta de e-mail, expiração e uso único
 * - Bloqueia qualquer elevação a SUPER_ADMIN
 * - Vincula UID ↔ institutionId ↔ role ↔ permissions atomicamente
 * - Emite Custom Claims no Firebase Auth e grava registo em /auditLogs
 */
export const validateAndConsumeUserInvitation = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sessão Firebase obrigatória para activar o convite.');
  }

  const uid = request.auth.uid;
  const token = String(request.data?.token || '').trim();
  if (!isValidInviteTokenFormat(token)) {
    throw new HttpsError('invalid-argument', 'Formato de token de convite inválido.');
  }

  // Confirmação dupla de email_verified: token JWT e registo directo no Firebase Auth
  const authRecord = await adminAuth.getUser(uid);
  const effectiveEmail = authRecord.email || request.auth.token.email || '';
  const effectiveEmailVerified = Boolean(authRecord.emailVerified && request.auth.token.email_verified === true);

  if (
    uid === '2dRLWqnY1zf1MlR9rZYhAKPvGbV2' ||
    effectiveEmail.trim().toLowerCase() === 'moztechwavenacala8@gmail.com'
  ) {
    throw new HttpsError(
      'permission-denied',
      'A conta SUPER_ADMIN global está protegida e não pode ser alterada por fluxo de convite.'
    );
  }

  if (!effectiveEmailVerified) {
    throw new HttpsError(
      'failed-precondition',
      'O seu endereço de e-mail ainda não foi confirmado. Clique no link enviado para o seu e-mail antes de concluir a activação.'
    );
  }

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  const txResult = await db.runTransaction(async (tx) => {
    const userInvRef = db.collection('userInvitations').doc(token);
    const legacyInvRef = db.collection('studentInvitations').doc(token);

    let invRef = userInvRef;
    let sourceCollection: 'userInvitations' | 'studentInvitations' = 'userInvitations';
    let invSnap = await tx.get(userInvRef);

    if (!invSnap.exists) {
      const legacySnap = await tx.get(legacyInvRef);
      if (legacySnap.exists) {
        invSnap = legacySnap;
        invRef = legacyInvRef;
        sourceCollection = 'studentInvitations';
      }
    }

    const inviteData = invSnap.exists ? (invSnap.data() as Record<string, any>) : null;
    const evaluation = evaluateInvitationForActivation({
      invite: inviteData,
      callerUid: uid,
      callerEmail: effectiveEmail,
      emailVerified: effectiveEmailVerified,
      nowMs
    });

    if (!evaluation.ok) {
      throw new HttpsError(evaluation.error.code, evaluation.error.message);
    }

    const userRef = db.collection('users').doc(uid);
    const existingUserSnap = await tx.get(userRef);
    if (existingUserSnap.exists) {
      const existingUser = existingUserSnap.data() || {};
      if (
        existingUser.role === 'SUPER_ADMIN' ||
        (Array.isArray(existingUser.roles) && existingUser.roles.includes('SUPER_ADMIN'))
      ) {
        throw new HttpsError(
          'permission-denied',
          'Conta SUPER_ADMIN não pode ser sobrescrita por fluxo de convite.'
        );
      }
    }

    const permissions = Array.isArray(inviteData?.permissions)
      ? inviteData!.permissions.filter((p: unknown): p is string => typeof p === 'string').slice(0, 100)
      : [];

    const branchId = String(inviteData?.branchId || 'todas');
    const fullName = String(inviteData?.fullName || inviteData?.studentName || authRecord.displayName || 'Utilizador SIGAR');
    const linkedEntityType = inviteData?.linkedEntityType || (sourceCollection === 'studentInvitations' ? 'student' : undefined);
    const linkedEntityId = inviteData?.linkedEntityId || inviteData?.studentId;

    const userPayload: Record<string, any> = {
      id: uid,
      uid,
      name: fullName,
      displayName: fullName,
      email: evaluation.normalizedEmail,
      phone: String(inviteData?.phone || ''),
      institutionId: evaluation.institutionId,
      institutionIds: [evaluation.institutionId],
      branchId,
      role: evaluation.targetRole,
      roles: [evaluation.targetRole],
      permissions,
      inviteToken: token,
      isSuperAdmin: false,
      emailVerified: true,
      estado: 'ativo',
      status: 'aprovado',
      activatedAt: nowIso,
      lastLoginAt: nowIso,
      updatedAt: nowIso,
      createdAt: existingUserSnap.exists ? existingUserSnap.data()?.createdAt || nowIso : nowIso
    };

    if (linkedEntityType === 'student' && isValidFirestoreId(linkedEntityId)) {
      userPayload.studentId = linkedEntityId;
      userPayload.studentIds = [linkedEntityId];
    } else if (linkedEntityType === 'teacher' && isValidFirestoreId(linkedEntityId)) {
      userPayload.teacherId = linkedEntityId;
    }

    tx.set(userRef, userPayload, { merge: true });

    if (sourceCollection === 'userInvitations') {
      tx.update(invRef, {
        used: true,
        status: 'ativado',
        usedAt: nowIso,
        usedByUid: uid
      });
    } else {
      tx.update(invRef, {
        used: true,
        usedAt: nowIso,
        usedByUid: uid
      });
    }

    if (linkedEntityType === 'student' && isValidFirestoreId(linkedEntityId)) {
      const studentRef = db.collection('students').doc(linkedEntityId);
      const studentSnap = await tx.get(studentRef);
      if (studentSnap.exists && studentSnap.data()?.institutionId === evaluation.institutionId) {
        tx.update(studentRef, {
          userId: uid,
          updatedAt: nowIso
        });
      }
    }

    const auditRef = db.collection('auditLogs').doc(`invaud_${token}_${uid}`);
    tx.set(auditRef, {
      id: auditRef.id,
      institutionId: evaluation.institutionId,
      action: 'USER_INVITATION_ACTIVATED',
      severity: 'info',
      actorUid: uid,
      actorEmail: evaluation.normalizedEmail,
      actorRole: evaluation.targetRole,
      targetEntity: sourceCollection,
      targetId: token,
      details: `Convite activado com verificação de e-mail confirmada para perfil ${evaluation.targetRole}.`,
      timestamp: nowIso
    });

    return {
      uid,
      institutionId: evaluation.institutionId,
      role: evaluation.targetRole,
      permissions,
      branchId,
      fullName,
      email: evaluation.normalizedEmail
    };
  });

  // Emite Custom Claims no Firebase Auth para reforçar Rules/Storage sem alterar SUPER_ADMIN
  await adminAuth.setCustomUserClaims(uid, {
    role: txResult.role,
    roles: [txResult.role],
    institutionId: txResult.institutionId,
    sigarVerified: true,
    superAdmin: false
  });

  return {
    ok: true,
    ...txResult,
    customClaimsApplied: true
  };
});

/**
 * 2. Submissão segura no servidor para candidaturas a vagas de emprego (Callable).
 * - Valida dados e anexos (PDF/DOC/DOCX <= 450 KB, base64 real)
 * - Verifica vaga publicada e prazo vigente (UTC+2 Moçambique)
 * - Bloqueia candidaturas duplicadas (mesmo email + mesma vaga) via documento dedup atómico
 * - Aplica rate limiting em janela deslizante contra submissões abusivas
 * - Actualiza applicationsCount atomicamente e grava histórico, tracking sem PII e auditoria
 */
export const submitPublicJobApplicationCallable = onCall(async (request) => {
  const validation = validateJobApplicationServerPayload(request.data);
  if (!validation.ok) {
    throw new HttpsError(validation.error.code, validation.error.message);
  }

  const clean = validation.clean;
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const emailHash = sha256Hex(clean.email);
  const dedupId = buildJobDedupKey(clean.vacancyId, clean.email);

  const vacancyRef = db
    .collection('institutions')
    .doc(clean.institutionId)
    .collection('jobVacancies')
    .doc(clean.vacancyId);

  const dedupRef = db
    .collection('institutions')
    .doc(clean.institutionId)
    .collection('jobApplicationDedup')
    .doc(dedupId);

  const rateLimitRef = db.collection('_rateLimits').doc(`jobsub_${emailHash}`);

  const appId = `jobapp-${nowMs}-${crypto.randomBytes(4).toString('hex')}`;
  const trackingToken = crypto.randomBytes(24).toString('hex'); // 192 bits de entropia
  const year = new Date(nowMs).getUTCFullYear();
  const seq = crypto.randomInt(1000, 9999);
  const applicationCode = `VAGA-${year}-${seq}`;

  const result = await db.runTransaction(async (tx) => {
    const [vacancySnap, dedupSnap, rateSnap] = await Promise.all([
      tx.get(vacancyRef),
      tx.get(dedupRef),
      tx.get(rateLimitRef)
    ]);

    const vacancyData = vacancySnap.exists ? (vacancySnap.data() as Record<string, any>) : null;
    const vacancyCheck = validateVacancyAcceptingApplications(vacancyData, clean.institutionId, nowMs);
    if (!vacancyCheck.ok) {
      throw new HttpsError(vacancyCheck.error.code, vacancyCheck.error.message);
    }

    const existingTimestamps = rateSnap.exists && Array.isArray(rateSnap.data()?.timestamps)
      ? (rateSnap.data()!.timestamps as number[])
      : [];
    const rateCheck = evaluateRateLimitWindow(existingTimestamps, nowMs);
    if (!rateCheck.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        'Demasiadas submissões em pouco tempo. Aguarde alguns minutos antes de tentar novamente.'
      );
    }

    if (dedupSnap.exists) {
      throw new HttpsError(
        'already-exists',
        'Já existe uma candidatura registada com este e-mail para esta vaga.'
      );
    }

    const initialAudit = {
      id: `aud-${nowMs}`,
      action: 'SUBMITTED',
      toStatus: 'RECEBIDA',
      note: 'Candidatura validada e registada pelo servidor SIGAR PRO.',
      actorUid: request.auth?.uid || 'public_applicant',
      actorName: clean.fullName,
      actorRole: 'CANDIDATO',
      timestamp: nowIso
    };

    const applicationRecord = {
      id: appId,
      applicationCode,
      trackingToken,
      vacancyId: clean.vacancyId,
      vacancyTitle: String(vacancyData?.title || ''),
      institutionId: clean.institutionId,
      institutionName: String(vacancyData?.institutionName || ''),
      fullName: clean.fullName,
      email: clean.email,
      phone: clean.phone,
      academicLevel: clean.academicLevel,
      experienceSummary: clean.experienceSummary,
      coverLetter: clean.coverLetter,
      attachments: clean.attachments,
      status: 'RECEBIDA',
      statusHistory: [initialAudit],
      countedInVacancy: true,
      submittedAt: nowIso,
      updatedAt: nowIso
    };

    const trackingRecord = {
      token: trackingToken,
      applicationCode,
      applicationId: appId,
      vacancyId: clean.vacancyId,
      vacancyTitle: String(vacancyData?.title || ''),
      institutionId: clean.institutionId,
      institutionName: String(vacancyData?.institutionName || ''),
      maskedCandidateName: maskCandidateNameServer(clean.fullName),
      status: 'RECEBIDA',
      publicHistory: [
        {
          status: 'RECEBIDA',
          timestamp: nowIso,
          summary: 'Candidatura validada e registada com sucesso na instituição.'
        }
      ],
      submittedAt: nowIso,
      updatedAt: nowIso
    };

    const appRef = db
      .collection('institutions')
      .doc(clean.institutionId)
      .collection('jobApplications')
      .doc(appId);
    const trackingRef = db.collection('jobApplicationTracking').doc(trackingToken);
    const auditRef = db.collection('auditLogs').doc(`jobaud_${appId}`);
    const notifRef = db.collection('notifications').doc(`jobnotif_${appId}`);

    tx.set(appRef, applicationRecord);
    tx.set(trackingRef, trackingRecord);
    tx.set(dedupRef, {
      id: dedupId,
      vacancyId: clean.vacancyId,
      institutionId: clean.institutionId,
      applicationId: appId,
      createdAt: nowIso
    });
    tx.set(
      rateLimitRef,
      {
        timestamps: rateCheck.nextTimestamps,
        updatedAt: nowIso
      },
      { merge: true }
    );
    tx.update(vacancyRef, {
      applicationsCount: FieldValue.increment(1),
      updatedAt: nowIso
    });
    tx.set(auditRef, {
      id: auditRef.id,
      institutionId: clean.institutionId,
      action: 'JOB_APPLICATION_SUBMITTED',
      severity: 'info',
      actorUid: request.auth?.uid || 'public_applicant',
      actorRole: 'CANDIDATO',
      targetEntity: 'jobApplications',
      targetId: appId,
      vacancyId: clean.vacancyId,
      applicationCode,
      timestamp: nowIso
    });
    tx.set(notifRef, {
      id: notifRef.id,
      institutionId: clean.institutionId,
      targetRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
      type: 'recruitment',
      title: 'Nova Candidatura Recebida',
      message: `${clean.fullName} submeteu candidatura (${applicationCode}) para ${String(vacancyData?.title || 'vaga')}.`,
      read: false,
      createdAt: nowIso
    });

    return {
      application: applicationRecord,
      trackingToken
    };
  });

  return result;
});

/**
 * 3. Gatilho complementar idempotente ao criar candidatura em /institutions/{institutionId}/jobApplications/{applicationId}.
 * Garante contagem única de applicationsCount, notificação institucional e log de auditoria mesmo em retries.
 */
export const onJobApplicationCreated = onDocumentCreated(
  'institutions/{institutionId}/jobApplications/{applicationId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const { institutionId, applicationId } = event.params;
    const data = snap.data() || {};
    const vacancyId = String(data.vacancyId || '');
    const nowIso = new Date().toISOString();

    await db.runTransaction(async (tx) => {
      const appRef = snap.ref;
      const currentAppSnap = await tx.get(appRef);
      if (!currentAppSnap.exists) return;

      const currentData = currentAppSnap.data() || {};
      const auditRef = db.collection('auditLogs').doc(`jobaud_${applicationId}`);
      const notifRef = db.collection('notifications').doc(`jobnotif_${applicationId}`);

      const [auditSnap, notifSnap] = await Promise.all([tx.get(auditRef), tx.get(notifRef)]);

      if (currentData.countedInVacancy !== true && isValidFirestoreId(vacancyId)) {
        const vacancyRef = db
          .collection('institutions')
          .doc(institutionId)
          .collection('jobVacancies')
          .doc(vacancyId);
        const vacancySnap = await tx.get(vacancyRef);
        if (vacancySnap.exists) {
          tx.update(vacancyRef, {
            applicationsCount: FieldValue.increment(1),
            updatedAt: nowIso
          });
        }
        tx.update(appRef, { countedInVacancy: true });
      }

      if (!auditSnap.exists) {
        tx.set(auditRef, {
          id: auditRef.id,
          institutionId,
          action: 'JOB_APPLICATION_RECORDED',
          severity: 'info',
          actorUid: 'system_trigger',
          actorRole: 'SYSTEM',
          targetEntity: 'jobApplications',
          targetId: applicationId,
          vacancyId,
          applicationCode: String(currentData.applicationCode || ''),
          timestamp: nowIso
        });
      }

      if (!notifSnap.exists) {
        tx.set(notifRef, {
          id: notifRef.id,
          institutionId,
          targetRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
          type: 'recruitment',
          title: 'Nova Candidatura Registada',
          message: `Candidatura ${String(currentData.applicationCode || applicationId)} recebida para ${String(currentData.vacancyTitle || 'vaga institucional')}.`,
          read: false,
          createdAt: nowIso
        });
      }
    });
  }
);

async function verifyServerInstitutionActor(
  uid: string,
  token: Record<string, any> | undefined,
  institutionId: string,
  allowedRoles: string[]
): Promise<{ isSuperAdmin: boolean; role: string }> {
  const email = String(token?.email || '').trim().toLowerCase();
  const isVerifiedSuper =
    token?.email_verified === true &&
    (email === 'moztechwavenacala8@gmail.com' ||
      (uid === '2dRLWqnY1zf1MlR9rZYhAKPvGbV2' && (!email || email === 'moztechwavenacala8@gmail.com')));
  if (isVerifiedSuper) {
    return { isSuperAdmin: true, role: 'SUPER_ADMIN' };
  }

  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) {
    throw new HttpsError('permission-denied', 'Perfil SIGAR PRO não encontrado para o utilizador autenticado.');
  }
  const u = userSnap.data() || {};
  const role = normalizeRoleUpper(u.role || '');
  if (!allowedRoles.includes(role)) {
    throw new HttpsError('permission-denied', `Perfil "${role}" não autorizado para esta operação.`);
  }
  const belongs =
    u.institutionId === institutionId ||
    (Array.isArray(u.institutionIds) && u.institutionIds.includes(institutionId)) ||
    (Array.isArray(u.ownedInstitutions) && u.ownedInstitutions.includes(institutionId)) ||
    token?.institutionId === institutionId;
  if (!belongs) {
    throw new HttpsError('permission-denied', 'Utilizador não pertence à instituição alvo.');
  }
  return { isSuperAdmin: false, role };
}

/**
 * 4. Publicação segura no servidor para catálogos maiores (>5 cursos, >4 perguntas ou >3 polos)
 * sem exceder o orçamento CEL das Firestore Rules cliente.
 */
export const publishPublicInstitutionCallable = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Autenticação obrigatória para publicar portal público.');
  }
  const institutionId = String(request.data?.institutionId || '').trim();
  const slug = String(request.data?.slug || '').trim().toLowerCase();
  const rawPublicData = request.data?.publicData;

  if (!isValidFirestoreId(institutionId)) {
    throw new HttpsError('invalid-argument', 'Identificador institucional inválido.');
  }
  if (!isValidFirestoreId(slug) || slug === '_index') {
    throw new HttpsError('invalid-argument', 'Slug institucional inválido ou reservado.');
  }
  if (!rawPublicData || typeof rawPublicData !== 'object') {
    throw new HttpsError('invalid-argument', 'Payload público em falta.');
  }

  const actor = await verifyServerInstitutionActor(
    request.auth.uid,
    request.auth.token as any,
    institutionId,
    ['ADMIN_INSTITUICAO', 'DIRETOR', 'CEO']
  );

  const nowIso = new Date().toISOString();
  const sanitized = sanitizePublicInstitutionServerPayload(rawPublicData, slug, institutionId);

  await db.runTransaction(async (tx) => {
    const privRef = db.collection('institutions').doc(institutionId);
    const pubRef = db.collection('publicInstitutions').doc(slug);
    const indexRef = db.collection('publicInstitutions').doc('_index');

    const [privSnap, pubSnap, indexSnap] = await Promise.all([
      tx.get(privRef),
      tx.get(pubRef),
      tx.get(indexRef)
    ]);

    if (privSnap.exists) {
      const status = String(privSnap.data()?.status || '');
      if (status === 'Suspensa' || status === 'Inativa') {
        throw new HttpsError('failed-precondition', `Instituição com estado "${status}" não pode ser publicada.`);
      }
    }

    if (pubSnap.exists) {
      const existingOwner = String(pubSnap.data()?.institutionId || '').trim();
      if (existingOwner && existingOwner !== institutionId) {
        throw new HttpsError('permission-denied', `Slug "${slug}" já pertence a outra instituição.`);
      }
      if (!existingOwner && !actor.isSuperAdmin) {
        throw new HttpsError('permission-denied', `Documento público "${slug}" sem proprietário válido.`);
      }
    }

    const rawSlugs = indexSnap.exists && Array.isArray(indexSnap.data()?.slugs) ? indexSnap.data()!.slugs : [];
    const nextSlugs = Array.from(
      new Set([
        ...rawSlugs.filter((s: unknown): s is string => typeof s === 'string' && isValidFirestoreId(s) && s !== '_index'),
        slug
      ])
    );

    tx.set(pubRef, sanitized);
    tx.set(indexRef, { slugs: nextSlugs, updatedAt: nowIso });
    if (privSnap.exists) {
      tx.set(privRef, { publicPortalPublished: true, updatedAt: nowIso }, { merge: true });
    }

    const auditRef = db.collection('auditLogs').doc(`pubaud_${institutionId}_${Date.now()}`);
    tx.set(auditRef, {
      id: auditRef.id,
      institutionId,
      action: 'PUBLIC_PORTAL_PUBLISHED_SERVER',
      severity: 'info',
      actorUid: request.auth!.uid,
      actorRole: actor.role,
      targetEntity: 'publicInstitutions',
      targetId: slug,
      timestamp: nowIso
    });
  });

  return { ok: true, slug };
});

/**
 * 5. Submissão transaccional de candidatura pública a curso com verificação de vagas e deduplicação no servidor.
 */
export const submitPublicCourseApplicationCallable = onCall(async (request) => {
  const validation = validateCourseApplicationServerPayload(request.data);
  if (!validation.ok) {
    throw new HttpsError(validation.error.code, validation.error.message);
  }

  const clean = validation.clean;
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const appId = `app-${nowMs}-${crypto.randomBytes(4).toString('hex')}`;
  const trackingToken = crypto.randomBytes(16).toString('hex');
  const year = new Date(nowMs).getUTCFullYear();
  const appCode = `CAND-${year}-${crypto.randomInt(1000, 9999)}`;
  const dedupKeys = buildCourseApplicationDedupKeys({
    institutionId: clean.institutionId,
    courseId: clean.courseId,
    documentNumber: clean.documentNumber,
    email: clean.email,
    phone: clean.phone
  });

  await db.runTransaction(async (tx) => {
    const pubRef = db.collection('publicInstitutions').doc(clean.slug);
    const privRef = db.collection('institutions').doc(clean.institutionId);
    const courseRef = db.collection('courses').doc(clean.courseId);
    const dedupRefs = dedupKeys.map((k) =>
      db.collection('institutions').doc(clean.institutionId).collection('courseApplicationDedup').doc(k.id)
    );

    const [pubSnap, privSnap, courseSnap, ...dedupSnaps] = await Promise.all([
      tx.get(pubRef),
      tx.get(privRef),
      tx.get(courseRef),
      ...dedupRefs.map((ref) => tx.get(ref))
    ]);

    if (!pubSnap.exists) {
      throw new HttpsError('not-found', 'Portal público não encontrado ou despublicado.');
    }
    const pub = pubSnap.data() || {};
    if (pub.institutionId !== clean.institutionId) {
      throw new HttpsError('permission-denied', 'O slug não corresponde à instituição indicada.');
    }
    if (privSnap.exists) {
      const st = String(privSnap.data()?.status || '');
      if (st === 'Suspensa' || st === 'Inativa') {
        throw new HttpsError('failed-precondition', 'Esta instituição não está activa para candidaturas.');
      }
    }

    const cfg = pub.onlineRegistrationConfig || {};
    if (cfg.isOpen === false) {
      throw new HttpsError('failed-precondition', 'As inscrições online desta instituição estão encerradas.');
    }

    const coursesCfg: Array<Record<string, any>> = Array.isArray(cfg.coursesConfig) ? cfg.coursesConfig : [];
    const targetCourse = coursesCfg.find((c) => c && c.courseId === clean.courseId) || null;
    const vacancyCheck = validateCourseVacancyAvailable(targetCourse);
    if (!vacancyCheck.ok) {
      throw new HttpsError(vacancyCheck.error.code, vacancyCheck.error.message);
    }

    if (courseSnap.exists && courseSnap.data()?.institutionId === clean.institutionId) {
      const privVacCheck = validateCourseVacancyAvailable(courseSnap.data());
      if (!privVacCheck.ok) {
        throw new HttpsError(privVacCheck.error.code, privVacCheck.error.message);
      }
    }

    if (dedupSnaps.some((s) => s.exists)) {
      throw new HttpsError(
        'already-exists',
        'Já existe uma candidatura registada para este curso com os dados informados.'
      );
    }

    const appRecord = {
      ...clean,
      id: appId,
      code: appCode,
      trackingToken,
      status: 'submetida',
      paymentStatus: 'Pendente',
      origin: 'online_portal',
      submittedAt: nowIso,
      updatedAt: nowIso
    };

    const trackingRecord = {
      token: trackingToken,
      code: appCode,
      applicationId: appId,
      institutionId: clean.institutionId,
      institutionName: String(pub.name || ''),
      slug: clean.slug,
      courseId: clean.courseId,
      courseName: clean.courseName,
      maskedCandidateName: maskCandidateNameServer(clean.fullName),
      status: 'submetida',
      paymentStatus: 'Pendente',
      submittedAt: nowIso,
      updatedAt: nowIso
    };

    tx.set(db.collection('applications').doc(appId), appRecord);
    tx.set(
      db.collection('institutions').doc(clean.institutionId).collection('applications').doc(appId),
      appRecord
    );
    tx.set(db.collection('applicationTracking').doc(trackingToken), trackingRecord);
    tx.set(db.collection('applicationTracking').doc(appCode), trackingRecord);

    dedupKeys.forEach((k, idx) => {
      tx.set(dedupRefs[idx], {
        institutionId: clean.institutionId,
        courseId: clean.courseId,
        dedupHash: k.hash,
        createdAt: nowIso
      });
    });

    const auditRef = db.collection('auditLogs').doc(`cappaud_${appId}`);
    tx.set(auditRef, {
      id: auditRef.id,
      institutionId: clean.institutionId,
      action: 'PUBLIC_COURSE_APPLICATION_SUBMITTED',
      severity: 'info',
      actorUid: request.auth?.uid || 'public_applicant',
      actorRole: 'CANDIDATO',
      targetEntity: 'applications',
      targetId: appId,
      courseId: clean.courseId,
      timestamp: nowIso
    });
  });

  return {
    ok: true,
    applicationId: appId,
    code: appCode,
    trackingToken
  };
});

/**
 * 6. Confirmação atómica de vaga preenchida na conversão para matrícula / inscrição directa.
 */
export const confirmEnrollmentVacancyCallable = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sessão autenticada obrigatória.');
  }
  const institutionId = String(request.data?.institutionId || '').trim();
  const courseId = String(request.data?.courseId || '').trim();
  if (!isValidFirestoreId(institutionId) || !isValidFirestoreId(courseId)) {
    throw new HttpsError('invalid-argument', 'Instituição ou curso inválido.');
  }

  await verifyServerInstitutionActor(
    request.auth.uid,
    request.auth.token as any,
    institutionId,
    ['ADMIN_INSTITUICAO', 'DIRETOR', 'CEO', 'SECRETARIA']
  );

  const nowIso = new Date().toISOString();
  const result = await db.runTransaction(async (tx) => {
    const courseRef = db.collection('courses').doc(courseId);
    const instRef = db.collection('institutions').doc(institutionId);
    const [courseSnap, instSnap] = await Promise.all([tx.get(courseRef), tx.get(instRef)]);

    if (!courseSnap.exists || courseSnap.data()?.institutionId !== institutionId) {
      throw new HttpsError('not-found', 'Curso não encontrado na instituição informada.');
    }

    const courseData = courseSnap.data() || {};
    const check = validateCourseVacancyAvailable(courseData);
    if (!check.ok) {
      throw new HttpsError(check.error.code, check.error.message);
    }

    const nextFilled = (typeof courseData.filledVacancies === 'number' ? courseData.filledVacancies : 0) + 1;
    const instData = instSnap.exists ? instSnap.data() || {} : {};
    const slug = String(instData.slug || '').trim().toLowerCase();
    const pubRef = slug && isValidFirestoreId(slug) && slug !== '_index'
      ? db.collection('publicInstitutions').doc(slug)
      : null;
    const pubSnap = pubRef ? await tx.get(pubRef) : null;

    tx.update(courseRef, { filledVacancies: nextFilled, updatedAt: nowIso });

    const updateCoursesConfig = (cfg: any) => {
      if (!cfg || !Array.isArray(cfg.coursesConfig)) return null;
      let changed = false;
      const updated = cfg.coursesConfig.map((c: any) => {
        if (c && c.courseId === courseId) {
          changed = true;
          return { ...c, filledVacancies: nextFilled };
        }
        return c;
      });
      return changed ? { ...cfg, coursesConfig: updated } : null;
    };

    if (instSnap.exists) {
      const nextCfg = updateCoursesConfig(instData.onlineRegistrationConfig);
      if (nextCfg) {
        tx.update(instRef, { onlineRegistrationConfig: nextCfg, updatedAt: nowIso });
      }
    }

    if (pubRef && pubSnap && pubSnap.exists && pubSnap.data()?.institutionId === institutionId) {
      const nextPubCfg = updateCoursesConfig(pubSnap.data()?.onlineRegistrationConfig);
      if (nextPubCfg) {
        tx.update(pubRef, { onlineRegistrationConfig: nextPubCfg, updatedAt: nowIso });
      }
    }

    return { filledVacancies: nextFilled };
  });

  return { ok: true, ...result };
});
