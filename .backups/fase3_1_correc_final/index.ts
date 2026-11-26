import * as crypto from 'node:crypto';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import {
  buildJobDedupKey,
  evaluateInvitationForActivation,
  evaluateRateLimitWindow,
  isValidFirestoreId,
  isValidInviteTokenFormat,
  maskCandidateNameServer,
  sha256Hex,
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
