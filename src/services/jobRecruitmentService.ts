import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, handleFirestoreError, OperationType } from './firebase';
import {
  Institution,
  JobApplication,
  JobApplicationAttachment,
  JobApplicationAuditEntry,
  JobApplicationStatus,
  JobApplicationTracking,
  JobContractType,
  JobVacancy,
  JobVacancyStatus,
  toCanonicalRole
} from '../types';
import { generateSecureInvitationToken, resolveInstitutionSlug } from './publicInstitutionService';
import { maskCandidateName, sanitizeFirestoreData } from '../utils/registrationConfigUtils';

export const ALLOWED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const;
export const ALLOWED_CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

// Spark plan Firestore doc max is 1 MiB; cap single CV/doc encoding at 450 KB raw file size (~600 KB base64)
export const MAX_CV_FILE_BYTES = 450 * 1024;

export const JOB_APPLICATION_STATUS_ORDER: JobApplicationStatus[] = [
  'RECEBIDA',
  'EM ANÁLISE',
  'PRÉ-SELECCIONADA',
  'ENTREVISTA',
  'APROVADA',
  'REJEITADA',
  'RETIRADA'
];

export interface JobVacancyFormInput {
  title: string;
  department?: string;
  description: string;
  requirements: string[];
  qualifications?: string;
  experienceRequired?: string;
  location: string;
  contractType: JobContractType;
  salaryRange?: string;
  vacanciesCount?: number;
  deadline: string;
  requiredAttachments: string[];
  status: JobVacancyStatus;
}

export interface JobApplicationFormInput {
  fullName: string;
  email: string;
  phone: string;
  academicLevel: string;
  experienceSummary: string;
  coverLetter?: string;
  attachments: JobApplicationAttachment[];
}

export interface RecruitmentActor {
  uid: string;
  name: string;
  role: string;
  institutionId?: string;
  institutionIds?: string[];
  ownedInstitutions?: string[];
  permissions?: string[];
  email?: string;
  emailVerified?: boolean;
  isSuperAdmin?: boolean;
}

export function normalizeVacancyStatus(
  status: JobVacancyStatus | 'draft' | 'published' | 'closed' | string
): JobVacancyStatus {
  const norm = String(status || '').trim().toLowerCase();
  if (norm === 'draft' || norm === 'rascunho') return 'rascunho';
  if (norm === 'published' || norm === 'publicada') return 'publicada';
  if (norm === 'closed' || norm === 'encerrada') return 'encerrada';
  return 'rascunho';
}

export function isVacancyWithinDeadline(
  vacancy: Pick<JobVacancy, 'status' | 'deadline'> | null | undefined,
  nowMs = Date.now()
): boolean {
  if (!vacancy || vacancy.status !== 'publicada') return false;
  const deadline = String(vacancy.deadline || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return false;
  const todayMaputo = new Date(nowMs + 2 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return deadline >= todayMaputo;
}

export function formatRecruitmentErrorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (!raw) return fallback;
  if (raw.startsWith('{') && raw.includes('"error"')) {
    try {
      const parsed = JSON.parse(raw) as { error?: string; operationType?: string; path?: string | null };
      if (parsed && typeof parsed.error === 'string' && parsed.error.trim()) {
        const ctx = [
          parsed.operationType ? `operação: ${parsed.operationType}` : '',
          parsed.path ? `caminho: ${parsed.path}` : ''
        ]
          .filter(Boolean)
          .join(', ');
        return ctx ? `${parsed.error} (${ctx})` : parsed.error;
      }
    } catch {
      // ignore invalid JSON
    }
  }
  return raw;
}

function isActorVerifiedSuperAdmin(actor: RecruitmentActor): boolean {
  if (actor.emailVerified === false) return false;
  const canonical = toCanonicalRole(actor.role);
  return (
    canonical === 'SUPER_ADMIN' ||
    actor.isSuperAdmin === true ||
    actor.uid === '2dRLWqnY1zf1MlR9rZYhAKPvGbV2' ||
    actor.email?.toLowerCase() === 'moztechwavenacala8@gmail.com'
  );
}

function actorBelongsToInstitution(actor: RecruitmentActor, targetInstitutionId: string): boolean {
  if (!targetInstitutionId) return false;
  if (actor.institutionId === targetInstitutionId) return true;
  if (Array.isArray(actor.institutionIds) && actor.institutionIds.includes(targetInstitutionId)) return true;
  if (Array.isArray(actor.ownedInstitutions) && actor.ownedInstitutions.includes(targetInstitutionId)) return true;
  return false;
}

export function canActorManageJobVacancies(
  actor: RecruitmentActor | undefined,
  targetInstitutionId: string
): boolean {
  if (!actor || !targetInstitutionId) return false;
  if (isActorVerifiedSuperAdmin(actor)) {
    return true;
  }
  if (!actorBelongsToInstitution(actor, targetInstitutionId)) {
    return false;
  }
  const canonical = toCanonicalRole(actor.role);
  if (canonical === 'ADMIN_INSTITUICAO' || canonical === 'DIRETOR' || canonical === 'CEO') {
    return true;
  }
  if (canonical === 'SECRETARIA') {
    const perms = Array.isArray(actor.permissions) ? actor.permissions : [];
    return perms.some((p) => ['vagas.manage', 'publish_vacancies', 'manage_recruitment'].includes(p));
  }
  return false;
}

export function canActorReviewJobApplications(
  actor: RecruitmentActor | undefined,
  targetInstitutionId: string
): boolean {
  if (!actor || !targetInstitutionId) return false;
  if (isActorVerifiedSuperAdmin(actor)) {
    return true;
  }
  if (!actorBelongsToInstitution(actor, targetInstitutionId)) {
    return false;
  }
  const canonical = toCanonicalRole(actor.role);
  if (canonical === 'ADMIN_INSTITUICAO' || canonical === 'DIRETOR' || canonical === 'CEO') {
    return true;
  }
  if (canonical === 'SECRETARIA') {
    const perms = Array.isArray(actor.permissions) ? actor.permissions : [];
    return perms.some((p) =>
      ['vagas.review_applications', 'vagas.manage', 'review_job_applications', 'manage_recruitment'].includes(p)
    );
  }
  return false;
}

export function validateAttachmentFile(file: {
  name: string;
  type?: string;
  size: number;
}): { valid: boolean; error?: string } {
  const name = (file.name || '').trim().toLowerCase();
  const hasValidExt = ALLOWED_CV_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!hasValidExt) {
    return {
      valid: false,
      error: `Formato não permitido para "${file.name}". Aceitamos apenas ficheiros PDF, DOC ou DOCX.`
    };
  }
  if (file.type && file.type.trim() !== '' && !ALLOWED_CV_MIME_TYPES.includes(file.type as any)) {
    // Some browsers report application/octet-stream for .docx; allow if extension matches, reject obvious executables/images/scripts
    const forbidden = ['text/html', 'application/javascript', 'text/javascript', 'application/x-msdownload', 'image/'];
    if (forbidden.some((f) => file.type!.toLowerCase().startsWith(f))) {
      return {
        valid: false,
        error: `Tipo MIME inválido (${file.type}). Envie apenas currículo em PDF, DOC ou DOCX.`
      };
    }
  }
  if (!file.size || file.size <= 0) {
    return { valid: false, error: 'O ficheiro seleccionado está vazio.' };
  }
  if (file.size > MAX_CV_FILE_BYTES) {
    return {
      valid: false,
      error: `O ficheiro "${file.name}" excede o limite de 450 KB. Comprima o PDF antes de anexar.`
    };
  }
  return { valid: true };
}

export function readFileAsValidatedAttachment(file: File, label: string): Promise<JobApplicationAttachment> {
  return new Promise((resolve, reject) => {
    const validation = validateAttachmentFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Falha ao ler o ficheiro "${file.name}".`));
    reader.onload = () => {
      resolve({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label,
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
        sizeBytes: file.size,
        dataUrl: typeof reader.result === 'string' ? reader.result : '',
        uploadedAt: new Date().toISOString()
      });
    };
    reader.readAsDataURL(file);
  });
}

export function validateJobVacancyInput(
  institutionId: string,
  input: JobVacancyFormInput
): { valid: boolean; error?: string } {
  if (!institutionId || !institutionId.trim()) {
    return { valid: false, error: 'Instituição inválida.' };
  }
  if (!input.title || input.title.trim().length < 3) {
    return { valid: false, error: 'O título da vaga deve ter pelo menos 3 caracteres.' };
  }
  if (!input.description || input.description.trim().length < 15) {
    return { valid: false, error: 'Forneça uma descrição clara das responsabilidades da vaga.' };
  }
  if (!input.location || input.location.trim().length < 2) {
    return { valid: false, error: 'Indique o local de trabalho.' };
  }
  if (!input.deadline || !/^\d{4}-\d{2}-\d{2}$/.test(input.deadline)) {
    return { valid: false, error: 'Indique uma data limite válida (AAAA-MM-DD).' };
  }
  if (!['rascunho', 'publicada', 'encerrada'].includes(input.status)) {
    return { valid: false, error: 'Estado de vaga inválido.' };
  }
  return { valid: true };
}

export function validateJobApplicationInput(
  vacancy: JobVacancy,
  input: JobApplicationFormInput,
  nowMs = Date.now()
): { valid: boolean; error?: string } {
  if (!vacancy || vacancy.status !== 'publicada') {
    return {
      valid: false,
      error: 'Esta vaga não se encontra publicada para novas candidaturas.'
    };
  }
  const todayMaputo = new Date(nowMs + 2 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (vacancy.deadline && /^\d{4}-\d{2}-\d{2}$/.test(vacancy.deadline) && vacancy.deadline < todayMaputo) {
    return {
      valid: false,
      error: `O prazo desta vaga expirou em ${vacancy.deadline}.`
    };
  }
  if (!input.fullName || input.fullName.trim().length < 3) {
    return { valid: false, error: 'Informe o seu nome completo.' };
  }
  const email = (input.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Informe um e-mail de contacto válido.' };
  }
  if (!input.phone || input.phone.trim().length < 6) {
    return { valid: false, error: 'Informe um número de telefone válido.' };
  }
  if (!input.academicLevel || input.academicLevel.trim().length < 2) {
    return { valid: false, error: 'Informe as suas habilitações / formação académica.' };
  }
  if (!input.experienceSummary || input.experienceSummary.trim().length < 10) {
    return { valid: false, error: 'Descreva brevemente a sua experiência profissional ou académica.' };
  }
  if (!input.attachments || input.attachments.length === 0) {
    return { valid: false, error: 'É obrigatório anexar o seu Currículo (CV em PDF, DOC ou DOCX).' };
  }
  for (const att of input.attachments) {
    const check = validateAttachmentFile({
      name: att.fileName,
      type: att.mimeType,
      size: att.sizeBytes
    });
    if (!check.valid) {
      return check;
    }
  }
  return { valid: true };
}

export async function createOrUpdateJobVacancy(
  institution: Institution,
  input: JobVacancyFormInput,
  actor: RecruitmentActor,
  existingVacancy?: JobVacancy | null
): Promise<JobVacancy> {
  if (!canActorManageJobVacancies(actor, institution.id)) {
    throw new Error(
      'Permissão insuficiente: apenas Super Admin, Admin/Diretor/CEO da instituição ou Secretaria com permissão explícita (vagas.manage) podem publicar ou editar vagas.'
    );
  }
  const normalizedStatus = normalizeVacancyStatus(input.status);
  const normalizedInput: JobVacancyFormInput = { ...input, status: normalizedStatus };
  const check = validateJobApplicationOrVacancyInput(institution.id, normalizedInput);
  if (!check.valid) {
    throw new Error(check.error || 'Dados da vaga inválidos.');
  }

  const nowIso = new Date().toISOString();
  const vacancyId = existingVacancy?.id || `vaga-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const slug = resolveInstitutionSlug(institution);

  const vacancy: JobVacancy = sanitizeFirestoreData({
    id: vacancyId,
    institutionId: institution.id,
    institutionName: institution.name,
    institutionSlug: slug,
    institutionLogoUrl: institution.logoUrl || '',
    branchId: institution.branches?.[0]?.id || 'branch-main',
    title: normalizedInput.title.trim(),
    department: normalizedInput.department?.trim() || '',
    description: normalizedInput.description.trim(),
    requirements: normalizedInput.requirements.map((r) => r.trim()).filter(Boolean),
    qualifications: normalizedInput.qualifications?.trim() || '',
    experienceRequired: normalizedInput.experienceRequired?.trim() || '',
    location: normalizedInput.location.trim(),
    contractType: normalizedInput.contractType,
    salaryRange: normalizedInput.salaryRange?.trim() || '',
    vacanciesCount: Math.max(1, Number(normalizedInput.vacanciesCount || 1)),
    deadline: normalizedInput.deadline,
    requiredAttachments: normalizedInput.requiredAttachments.length > 0
      ? normalizedInput.requiredAttachments
      : ['Currículo (CV)'],
    status: normalizedStatus,
    ...(!existingVacancy ? { applicationsCount: 0 } : {}),
    createdAt: existingVacancy?.createdAt || nowIso,
    updatedAt: nowIso,
    publishedAt: normalizedStatus === 'publicada' ? (existingVacancy?.publishedAt || nowIso) : existingVacancy?.publishedAt,
    closedAt: normalizedStatus === 'encerrada' ? nowIso : undefined,
    createdByUid: existingVacancy?.createdByUid || actor.uid,
    createdByName: existingVacancy?.createdByName || actor.name
  });

  const path = `institutions/${institution.id}/jobVacancies/${vacancyId}`;
  try {
    await setDoc(doc(db, 'institutions', institution.id, 'jobVacancies', vacancyId), vacancy, { merge: true });
    return existingVacancy
      ? { ...vacancy, applicationsCount: existingVacancy.applicationsCount ?? 0 }
      : vacancy;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

function validateJobApplicationOrVacancyInput(institutionId: string, input: JobVacancyFormInput) {
  return validateJobVacancyInput(institutionId, input);
}

export async function changeJobVacancyStatus(
  institutionId: string,
  vacancyId: string,
  newStatus: JobVacancyStatus | 'draft' | 'published' | 'closed',
  actor?: RecruitmentActor
): Promise<void> {
  if (actor && !canActorManageJobVacancies(actor, institutionId)) {
    throw new Error(
      'Permissão insuficiente para alterar o estado desta vaga.'
    );
  }
  const canonicalStatus = normalizeVacancyStatus(newStatus);
  const nowIso = new Date().toISOString();
  const updates: Record<string, any> = {
    status: canonicalStatus,
    updatedAt: nowIso
  };
  if (canonicalStatus === 'publicada') updates.publishedAt = nowIso;
  if (canonicalStatus === 'encerrada') updates.closedAt = nowIso;

  const path = `institutions/${institutionId}/jobVacancies/${vacancyId}`;
  try {
    await updateDoc(doc(db, 'institutions', institutionId, 'jobVacancies', vacancyId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
}

export async function listInstitutionJobVacancies(institutionId: string): Promise<JobVacancy[]> {
  if (!institutionId) return [];
  const path = `institutions/${institutionId}/jobVacancies`;
  try {
    const snap = await getDocs(collection(db, 'institutions', institutionId, 'jobVacancies'));
    const list = snap.docs.map((d) => ({ ...(d.data() as JobVacancy), id: d.id }));
    return list.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    throw err;
  }
}

export async function listAllPublishedJobVacancies(institutionIdFilter?: string): Promise<JobVacancy[]> {
  const path = institutionIdFilter
    ? `institutions/${institutionIdFilter}/jobVacancies`
    : 'collectionGroup(jobVacancies)';
  try {
    if (institutionIdFilter) {
      const q = query(
        collection(db, 'institutions', institutionIdFilter, 'jobVacancies'),
        where('status', '==', 'publicada')
      );
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ ...(d.data() as JobVacancy), id: d.id }))
        .filter((v) => isVacancyWithinDeadline(v))
        .sort((a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt));
    }

    const q = query(collectionGroup(db, 'jobVacancies'), where('status', '==', 'publicada'));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ ...(d.data() as JobVacancy), id: d.id }))
      .filter((v) => isVacancyWithinDeadline(v))
      .sort((a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    throw err;
  }
}

export async function submitPublicJobApplication(
  vacancy: JobVacancy,
  input: JobApplicationFormInput
): Promise<{ application: JobApplication; trackingToken: string }> {
  const check = validateJobApplicationInput(vacancy, input);
  if (!check.valid) {
    throw new Error(check.error || 'Candidatura inválida.');
  }

  const callable = httpsCallable<
    {
      institutionId: string;
      vacancyId: string;
      fullName: string;
      email: string;
      phone: string;
      academicLevel: string;
      experienceSummary: string;
      coverLetter: string;
      attachments: JobApplicationAttachment[];
    },
    { application: JobApplication; trackingToken: string }
  >(functions, 'submitPublicJobApplicationCallable');

  try {
    const response = await callable({
      institutionId: vacancy.institutionId,
      vacancyId: vacancy.id,
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      academicLevel: input.academicLevel.trim(),
      experienceSummary: input.experienceSummary.trim(),
      coverLetter: input.coverLetter?.trim() || '',
      attachments: input.attachments
    });
    return response.data;
  } catch (err: any) {
    const rawMsg = String(err?.message || '');
    const code = String(err?.code || '');
    if (code.includes('already-exists')) {
      throw new Error('Já existe uma candidatura registada com este e-mail para esta vaga.');
    }
    if (code.includes('resource-exhausted')) {
      throw new Error('Demasiadas submissões em pouco tempo. Aguarde alguns minutos e tente novamente.');
    }
    handleFirestoreError(
      err,
      OperationType.WRITE,
      `functions/submitPublicJobApplicationCallable/${vacancy.institutionId}/${vacancy.id}`
    );
    throw new Error(rawMsg || 'Não foi possível validar e submeter a candidatura no servidor.');
  }
}

export async function listInstitutionJobApplications(
  institutionId: string,
  vacancyId?: string
): Promise<JobApplication[]> {
  if (!institutionId) return [];
  const path = `institutions/${institutionId}/jobApplications`;
  try {
    const colRef = collection(db, 'institutions', institutionId, 'jobApplications');
    const q = vacancyId ? query(colRef, where('vacancyId', '==', vacancyId)) : query(colRef);
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ ...(d.data() as JobApplication), id: d.id }))
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    throw err;
  }
}

export async function updateJobApplicationStatusAndNotes(
  institutionId: string,
  application: JobApplication,
  nextStatus: JobApplicationStatus,
  internalNote: string | undefined,
  actor: RecruitmentActor,
  publicSummary?: string
): Promise<JobApplication> {
  if (!canActorReviewJobApplications(actor, institutionId)) {
    throw new Error(
      'Permissão insuficiente para rever ou actualizar o estado de candidaturas desta instituição.'
    );
  }
  if (application.institutionId !== institutionId) {
    throw new Error('Violação de isolamento institucional.');
  }

  const nowIso = new Date().toISOString();
  const auditEntry: JobApplicationAuditEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    action: nextStatus !== application.status ? 'STATUS_CHANGED' : 'NOTE_ADDED',
    fromStatus: application.status,
    toStatus: nextStatus,
    note: internalNote?.trim() || `Estado actualizado para ${nextStatus}`,
    actorUid: actor.uid,
    actorName: actor.name,
    actorRole: toCanonicalRole(actor.role),
    timestamp: nowIso
  };

  const nextHistory = [...(application.statusHistory || []), auditEntry];
  const updatedApp: JobApplication = sanitizeFirestoreData({
    ...application,
    status: nextStatus,
    ...(internalNote !== undefined ? { internalNotes: internalNote.trim() } : {}),
    statusHistory: nextHistory,
    updatedAt: nowIso,
    updatedByUid: actor.uid,
    updatedByName: actor.name
  });

  const batch = writeBatch(db);
  batch.set(
    doc(db, 'institutions', institutionId, 'jobApplications', application.id),
    updatedApp,
    { merge: true }
  );

  if (application.trackingToken) {
    const trackingRef = doc(db, 'jobApplicationTracking', application.trackingToken);
    let existingPublicHistory: JobApplicationTracking['publicHistory'] = [];
    try {
      const existingSnap = await getDoc(trackingRef);
      if (existingSnap.exists()) {
        existingPublicHistory = (existingSnap.data() as JobApplicationTracking).publicHistory || [];
      }
    } catch {
      existingPublicHistory = [];
    }

    const updatedPublicHistory = nextStatus !== application.status
      ? [
          ...existingPublicHistory,
          {
            status: nextStatus,
            timestamp: nowIso,
            summary: publicSummary || `Estado da candidatura actualizado para ${nextStatus}.`
          }
        ]
      : existingPublicHistory;

    batch.set(
      trackingRef,
      sanitizeFirestoreData({
        token: application.trackingToken,
        applicationCode: application.applicationCode,
        applicationId: application.id,
        vacancyId: application.vacancyId,
        vacancyTitle: application.vacancyTitle,
        institutionId: application.institutionId,
        institutionName: application.institutionName,
        maskedCandidateName: maskCandidateName(application.fullName),
        status: nextStatus,
        publicHistory: updatedPublicHistory,
        submittedAt: application.submittedAt,
        updatedAt: nowIso
      }),
      { merge: true }
    );
  }

  try {
    await batch.commit();
    return updatedApp;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `institutions/${institutionId}/jobApplications/${application.id}`);
    throw err;
  }
}

export async function lookupJobApplicationByToken(rawToken: string): Promise<JobApplicationTracking | null> {
  const token = (rawToken || '').trim();
  if (!token || token.length < 24 || !/^[a-zA-Z0-9_-]+$/.test(token)) {
    return null;
  }
  try {
    const snap = await getDoc(doc(db, 'jobApplicationTracking', token));
    if (!snap.exists()) return null;
    return snap.data() as JobApplicationTracking;
  } catch (err) {
    console.warn('[JobRecruitment] Nota ao consultar tracking:', err);
    return null;
  }
}
