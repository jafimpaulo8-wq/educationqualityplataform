import {
  collection,
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
  CanonicalRole,
  Permission,
  ROLE_DEFINITIONS,
  UserInvitation,
  UserRole,
  toCanonicalRole
} from '../types';
import { generateSecureInvitationToken } from './publicInstitutionService';
import { sanitizeFirestoreData } from '../utils/registrationConfigUtils';

export const USER_INVITATIONS_COLLECTION = 'userInvitations';
export const LEGACY_STUDENT_INVITATIONS_COLLECTION = 'studentInvitations';

export interface InviteActorContext {
  uid: string;
  name: string;
  email: string;
  role: UserRole | string;
  institutionId: string;
  permissions?: Permission[] | string[];
}

export interface CreateInviteInput {
  fullName: string;
  email: string;
  phone?: string;
  institutionId: string;
  institutionName?: string;
  branchId?: string;
  role: UserRole | string;
  permissions?: Permission[];
  linkedEntityType?: 'student' | 'teacher' | 'staff';
  linkedEntityId?: string;
  expiresInDays?: number;
}

export interface InviteValidationResult {
  valid: boolean;
  reason?: 'not_found' | 'used' | 'revoked' | 'expired' | 'email_mismatch' | 'invalid_role';
  message?: string;
}

const SECRETARIA_ALLOWED_TARGET_ROLES: CanonicalRole[] = [
  'ALUNO',
  'RESPONSAVEL',
  'PROFESSOR',
  'FORMADOR',
  'PORTEIRO'
];

const DIRECTOR_ALLOWED_TARGET_ROLES: CanonicalRole[] = [
  'SECRETARIA',
  'FINANCEIRO',
  'PROFESSOR',
  'FORMADOR',
  'PORTEIRO',
  'ALUNO',
  'RESPONSAVEL',
  'EMPRESA'
];

const INST_ADMIN_ALLOWED_TARGET_ROLES: CanonicalRole[] = [
  'DIRETOR',
  'CEO',
  'SECRETARIA',
  'FINANCEIRO',
  'PROFESSOR',
  'FORMADOR',
  'PORTEIRO',
  'ALUNO',
  'RESPONSAVEL',
  'EMPRESA'
];

const SUPER_ADMIN_ALLOWED_TARGET_ROLES: CanonicalRole[] = [
  'ADMIN_INSTITUICAO',
  'DIRETOR',
  'CEO',
  'SECRETARIA',
  'FINANCEIRO',
  'PROFESSOR',
  'FORMADOR',
  'PORTEIRO',
  'ALUNO',
  'RESPONSAVEL',
  'EMPRESA'
];

/**
 * Retorna os papéis que o utilizador actual tem autoridade para convidar.
 * Regra absoluta: NUNCA permite atribuir SUPER_ADMIN por convite.
 * SECRETARIA nunca pode convidar ADMIN_INSTITUICAO, DIRETOR, CEO ou FINANCEIRO.
 */
export function getAllowedInviteRoles(callerRole: string): CanonicalRole[] {
  const canonical = toCanonicalRole(callerRole);
  switch (canonical) {
    case 'SUPER_ADMIN':
      return [...SUPER_ADMIN_ALLOWED_TARGET_ROLES];
    case 'ADMIN_INSTITUICAO':
      return [...INST_ADMIN_ALLOWED_TARGET_ROLES];
    case 'DIRETOR':
    case 'CEO':
      return [...DIRECTOR_ALLOWED_TARGET_ROLES];
    case 'SECRETARIA':
      return [...SECRETARIA_ALLOWED_TARGET_ROLES];
    default:
      return [];
  }
}

export function canCallerInviteRole(callerRole: string, targetRole: string): boolean {
  const canonicalTarget = toCanonicalRole(targetRole);
  if (canonicalTarget === 'SUPER_ADMIN' || canonicalTarget === 'VISITANTE') {
    return false;
  }
  return getAllowedInviteRoles(callerRole).includes(canonicalTarget);
}

/**
 * Garante que as permissões atribuídas ao convite não excedem nem o papel de destino
 * nem o tecto de privilégios do próprio emissor (salvo SUPER_ADMIN).
 */
export function sanitizeInvitePermissions(
  callerRole: string,
  targetRole: CanonicalRole,
  requestedPermissions?: Permission[],
  actorPermissions?: Array<Permission | string>
): Permission[] {
  const targetRolePerms = ROLE_DEFINITIONS[targetRole]?.permissions || [];
  const callerCanonical = toCanonicalRole(callerRole);
  const callerPerms = callerCanonical === 'SUPER_ADMIN'
    ? targetRolePerms
    : (ROLE_DEFINITIONS[callerCanonical]?.permissions || []);

  const hasExplicitActorCeiling =
    callerCanonical !== 'SUPER_ADMIN' &&
    Array.isArray(actorPermissions) &&
    actorPermissions.length > 0;
  const actorPermSet = hasExplicitActorCeiling
    ? new Set(actorPermissions.map(p => String(p)))
    : null;

  const baseSet = (requestedPermissions && requestedPermissions.length > 0)
    ? requestedPermissions
    : targetRolePerms;

  const allowedSet = baseSet.filter((perm) =>
    targetRolePerms.includes(perm) &&
    (callerCanonical === 'SUPER_ADMIN' || callerPerms.includes(perm)) &&
    (!actorPermSet || actorPermSet.has(String(perm)))
  );

  return Array.from(new Set(allowedSet));
}

export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  errors: string[];
} {
  const errors: string[] = [];
  if (!password || password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres.');
  }
  if (!/[A-Za-z]/.test(password)) {
    errors.push('Inclua pelo menos uma letra.');
  }
  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Inclua pelo menos um número ou símbolo.');
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSym = /[^A-Za-z0-9]/.test(password);
  const score = [password.length >= 8, hasUpper, hasLower, hasDigit, hasSym].filter(Boolean).length;
  return {
    valid: errors.length === 0,
    score,
    errors
  };
}

export function validateInviteCreationInput(
  actor: InviteActorContext,
  input: CreateInviteInput
): {
  ok: boolean;
  error?: string;
  normalizedEmail: string;
  safeRole: CanonicalRole;
  safePermissions: Permission[];
} {
  const callerCanonical = toCanonicalRole(String(actor.role));
  const safeRole = toCanonicalRole(String(input.role));
  const normalizedEmail = (input.email || '').trim().toLowerCase();

  if (!input.fullName || input.fullName.trim().length < 3) {
    return { ok: false, error: 'Informe o nome completo do utilizador convidado.', normalizedEmail, safeRole, safePermissions: [] };
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, error: 'Informe um endereço de e-mail válido.', normalizedEmail, safeRole, safePermissions: [] };
  }
  if (!input.institutionId || !input.institutionId.trim()) {
    return { ok: false, error: 'O convite deve estar associado a uma instituição específica.', normalizedEmail, safeRole, safePermissions: [] };
  }
  if (callerCanonical !== 'SUPER_ADMIN' && actor.institutionId && actor.institutionId !== input.institutionId) {
    return { ok: false, error: 'Não é permitido emitir convites para outra instituição.', normalizedEmail, safeRole, safePermissions: [] };
  }
  if (!canCallerInviteRole(callerCanonical, safeRole)) {
    return {
      ok: false,
      error: `O perfil ${callerCanonical} não tem autorização para emitir convites para o perfil ${safeRole}.`,
      normalizedEmail,
      safeRole,
      safePermissions: []
    };
  }

  const safePermissions = sanitizeInvitePermissions(
    callerCanonical,
    safeRole,
    input.permissions,
    actor.permissions
  );
  return {
    ok: true,
    normalizedEmail,
    safeRole,
    safePermissions
  };
}

export function validateInviteActivationState(
  invite: UserInvitation | null,
  currentAuthEmail?: string | null
): InviteValidationResult {
  if (!invite) {
    return {
      valid: false,
      reason: 'not_found',
      message: 'Convite não encontrado ou inválido.'
    };
  }
  if (invite.revoked || invite.status === 'revogado') {
    return {
      valid: false,
      reason: 'revoked',
      message: 'Este convite foi revogado pela instituição e não pode mais ser utilizado.'
    };
  }
  if (invite.used || invite.status === 'ativado') {
    return {
      valid: false,
      reason: 'used',
      message: 'Este convite já foi utilizado. Aceda ao login único com o seu e-mail e senha.'
    };
  }

  const targetRole = toCanonicalRole(String(invite.role));
  if (targetRole === 'SUPER_ADMIN') {
    return {
      valid: false,
      reason: 'invalid_role',
      message: 'Convite rejeitado por política de segurança.'
    };
  }

  const isoExpMs = invite.expiresAt ? new Date(invite.expiresAt).getTime() : NaN;
  const numExpMs = typeof invite.expiresAtMs === 'number' ? invite.expiresAtMs : NaN;
  const expMs = Number.isFinite(numExpMs) && Number.isFinite(isoExpMs)
    ? Math.min(numExpMs, isoExpMs)
    : Number.isFinite(numExpMs)
      ? numExpMs
      : isoExpMs;

  if (!Number.isFinite(expMs) || expMs <= Date.now()) {
    return {
      valid: false,
      reason: 'expired',
      message: 'Este convite expirou. Solicite um novo link de activação à sua instituição.'
    };
  }

  if (currentAuthEmail && currentAuthEmail.trim().toLowerCase() !== invite.email.trim().toLowerCase()) {
    return {
      valid: false,
      reason: 'email_mismatch',
      message: `Este convite é exclusivo para ${invite.email}. Inicie sessão ou crie conta com o mesmo e-mail.`
    };
  }

  return { valid: true };
}

export function buildInviteActivationUrl(token: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sigar.moztechwave.com';
  return `${origin}/ativar-conta?token=${encodeURIComponent(token)}`;
}

/**
 * Cria um convite individual de uso único e expiração configurável na coleção userInvitations/{token}.
 * NOTA: Não há envio automático de e-mail SMTP nesta chamada — devolve o link de activação para partilha manual/WhatsApp/mailto.
 */
export async function createUserInvitation(
  actor: InviteActorContext,
  input: CreateInviteInput
): Promise<{
  invitation: UserInvitation;
  activationUrl: string;
  emailDeliveryStatus: 'manual_link_required';
  emailDeliveryNote: string;
}> {
  const validation = validateInviteCreationInput(actor, input);
  if (!validation.ok) {
    throw new Error(validation.error || 'Dados de convite inválidos.');
  }

  const token = generateSecureInvitationToken(); // 48 hex chars = 192 bits entropy
  const days = Math.min(Math.max(Number(input.expiresInDays || 7), 1), 30);
  const nowMs = Date.now();
  const expiresAtMs = nowMs + days * 24 * 60 * 60 * 1000;

  const invitation: UserInvitation = sanitizeFirestoreData({
    id: token,
    token,
    fullName: input.fullName.trim(),
    email: validation.normalizedEmail,
    phone: input.phone?.trim() || '',
    institutionId: input.institutionId,
    institutionName: input.institutionName || '',
    branchId: input.branchId || 'todas',
    role: validation.safeRole as UserRole,
    permissions: validation.safePermissions,
    ...(input.linkedEntityType ? { linkedEntityType: input.linkedEntityType } : {}),
    ...(input.linkedEntityId ? { linkedEntityId: input.linkedEntityId } : {}),
    status: 'pendente',
    used: false,
    revoked: false,
    expiresAt: new Date(expiresAtMs).toISOString(),
    expiresAtMs,
    createdAt: new Date(nowMs).toISOString(),
    createdByUid: actor.uid,
    createdByName: actor.name,
    createdByEmail: actor.email,
    createdByRole: toCanonicalRole(String(actor.role))
  });

  try {
    await setDoc(doc(db, USER_INVITATIONS_COLLECTION, token), invitation);
    return {
      invitation,
      activationUrl: buildInviteActivationUrl(token),
      emailDeliveryStatus: 'manual_link_required',
      emailDeliveryNote:
        'Nenhum e-mail automático foi enviado nesta etapa. Partilhe o link único por cópia, WhatsApp ou rascunho de e-mail (mailto:); o Firebase Auth enviará a verificação oficial de e-mail quando o convidado activar a conta.'
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${USER_INVITATIONS_COLLECTION}/${token}`);
    throw err;
  }
}

/**
 * Lê um convite pelo token usando apenas `getDoc` (sem listar/expor outros convites).
 * Suporta tanto `userInvitations/{token}` quanto o formato legado `studentInvitations/{token}`.
 */
export async function fetchInviteByToken(rawToken: string): Promise<{
  invitation: UserInvitation | null;
  sourceCollection: typeof USER_INVITATIONS_COLLECTION | typeof LEGACY_STUDENT_INVITATIONS_COLLECTION | null;
}> {
  const token = (rawToken || '').trim();
  if (!token || !/^[a-zA-Z0-9_-]{8,128}$/.test(token)) {
    return { invitation: null, sourceCollection: null };
  }

  try {
    const snap = await getDoc(doc(db, USER_INVITATIONS_COLLECTION, token));
    if (snap.exists()) {
      const data = snap.data() as UserInvitation;
      return {
        invitation: {
          ...data,
          id: snap.id,
          token: data.token || snap.id
        },
        sourceCollection: USER_INVITATIONS_COLLECTION
      };
    }
  } catch (err) {
    console.warn('[InviteAuth] Nota ao ler userInvitations:', err);
  }

  try {
    const legacySnap = await getDoc(doc(db, LEGACY_STUDENT_INVITATIONS_COLLECTION, token));
    if (legacySnap.exists()) {
      const l = legacySnap.data() as any;
      const expMs = l.expiresAt ? new Date(l.expiresAt).getTime() : Date.now() + 86400000;
      const normalized: UserInvitation = {
        id: legacySnap.id,
        token: l.token || legacySnap.id,
        fullName: l.studentName || 'Aluno Convidado',
        email: (l.studentEmail || '').toLowerCase(),
        institutionId: l.institutionId,
        branchId: l.branchId || 'todas',
        role: 'ALUNO',
        permissions: ROLE_DEFINITIONS.ALUNO.permissions,
        linkedEntityType: 'student',
        linkedEntityId: l.studentId,
        status: l.revoked ? 'revogado' : l.used ? 'ativado' : 'pendente',
        used: !!l.used,
        revoked: !!l.revoked,
        expiresAt: l.expiresAt || new Date(expMs).toISOString(),
        expiresAtMs: expMs,
        createdAt: l.createdAt || new Date().toISOString(),
        createdByUid: l.createdBy || 'secretaria',
        createdByRole: 'SECRETARIA',
        usedAt: l.usedAt,
        usedByUid: l.usedByUid
      };
      return {
        invitation: normalized,
        sourceCollection: LEGACY_STUDENT_INVITATIONS_COLLECTION
      };
    }
  } catch (err) {
    console.warn('[InviteAuth] Nota ao ler studentInvitations:', err);
  }

  return { invitation: null, sourceCollection: null };
}

export async function listUserInvitations(institutionId: string, isSuperAdmin = false): Promise<UserInvitation[]> {
  try {
    const ref = collection(db, USER_INVITATIONS_COLLECTION);
    const q = isSuperAdmin && (!institutionId || institutionId === 'all')
      ? query(ref)
      : query(ref, where('institutionId', '==', institutionId));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ ...(d.data() as UserInvitation), id: d.id }));
    return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (err) {
    console.warn('[InviteAuth] Aviso ao listar userInvitations:', err);
    return [];
  }
}

export async function revokeUserInvitation(invitationId: string, actorUid: string): Promise<void> {
  try {
    await updateDoc(doc(db, USER_INVITATIONS_COLLECTION, invitationId), {
      revoked: true,
      status: 'revogado',
      revokedAt: new Date().toISOString(),
      revokedByUid: actorUid
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${USER_INVITATIONS_COLLECTION}/${invitationId}`);
    throw err;
  }
}

export async function listInstitutionUsers(institutionId: string, isSuperAdmin = false): Promise<any[]> {
  try {
    const ref = collection(db, 'users');
    const q = isSuperAdmin && (!institutionId || institutionId === 'all')
      ? query(ref)
      : query(ref, where('institutionId', '==', institutionId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Record<string, any>), id: d.id }));
  } catch (err) {
    console.warn('[InviteAuth] Aviso ao listar utilizadores:', err);
    return [];
  }
}

export interface ServerInviteActivationResult {
  ok: boolean;
  uid: string;
  institutionId: string;
  role: CanonicalRole;
  permissions: string[];
  branchId: string;
  fullName: string;
  email: string;
  customClaimsApplied: boolean;
}

/**
 * Executa a validação e consumo atómico do convite na Cloud Function do servidor
 * (`validateAndConsumeUserInvitation`), garantindo:
 * - email_verified === true efectivo no Firebase Auth
 * - correspondência exacta de e-mail
 * - consumo único transaccional
 * - Custom Claims e registo em /auditLogs
 */
export async function consumeUserInvitationViaServer(
  token: string,
  options?: { emailVerified?: boolean }
): Promise<ServerInviteActivationResult> {
  if (options?.emailVerified === false) {
    throw new Error(
      'É obrigatório confirmar o seu endereço de e-mail através do link enviado antes de concluir a activação.'
    );
  }
  const cleanToken = (token || '').trim();
  if (!cleanToken || !/^[a-zA-Z0-9_-]{8,128}$/.test(cleanToken)) {
    throw new Error('Token de convite inválido.');
  }

  const callable = httpsCallable<{ token: string }, ServerInviteActivationResult>(
    functions,
    'validateAndConsumeUserInvitation'
  );
  const response = await callable({ token: cleanToken });
  return response.data;
}

/**
 * Mantido para compatibilidade estrutural/testes locais, exigindo explicitamente emailVerified === true.
 */
export async function consumeUserInvitationAndProvisionUser(params: {
  uid: string;
  email: string;
  emailVerified: boolean;
  invite: UserInvitation;
  sourceCollection: typeof USER_INVITATIONS_COLLECTION | typeof LEGACY_STUDENT_INVITATIONS_COLLECTION;
}): Promise<void> {
  const { uid, email, emailVerified, invite, sourceCollection } = params;
  if (!emailVerified) {
    throw new Error(
      'Confirmação de e-mail obrigatória: verifique a sua caixa de correio antes de activar a conta.'
    );
  }

  const check = validateInviteActivationState(invite, email);
  if (!check.valid) {
    throw new Error(check.message || 'Convite inválido.');
  }

  const targetRole = toCanonicalRole(String(invite.role));
  if (targetRole === 'SUPER_ADMIN') {
    throw new Error('Operação não permitida.');
  }

  const nowIso = new Date().toISOString();
  const batch = writeBatch(db);

  const userRef = doc(db, 'users', uid);
  const safePermissions = Array.isArray(invite.permissions) && invite.permissions.length > 0
    ? invite.permissions
    : (ROLE_DEFINITIONS[targetRole]?.permissions || []);

  const userPayload = sanitizeFirestoreData({
    id: uid,
    uid,
    name: invite.fullName,
    displayName: invite.fullName,
    email: invite.email.toLowerCase(),
    phone: invite.phone || '',
    institutionId: invite.institutionId,
    institutionIds: [invite.institutionId],
    branchId: invite.branchId || 'todas',
    role: targetRole,
    roles: [targetRole],
    permissions: safePermissions,
    inviteToken: invite.token,
    isSuperAdmin: false,
    emailVerified: true,
    ...(invite.linkedEntityType === 'student' && invite.linkedEntityId
      ? {
          studentId: invite.linkedEntityId,
          studentIds: [invite.linkedEntityId]
        }
      : {}),
    ...(invite.linkedEntityType === 'teacher' && invite.linkedEntityId
      ? { teacherId: invite.linkedEntityId }
      : {}),
    estado: 'ativo',
    status: 'aprovado',
    activatedAt: nowIso,
    lastLoginAt: nowIso,
    createdAt: nowIso
  });

  batch.set(userRef, userPayload);

  const invRef = doc(db, sourceCollection, invite.token);
  if (sourceCollection === USER_INVITATIONS_COLLECTION) {
    batch.update(invRef, {
      used: true,
      status: 'ativado',
      usedAt: nowIso,
      usedByUid: uid
    });
  } else {
    batch.update(invRef, {
      used: true,
      usedAt: nowIso,
      usedByUid: uid
    });
  }

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${sourceCollection}/${invite.token}`);
    throw err;
  }

  if (invite.linkedEntityType === 'student' && invite.linkedEntityId) {
    try {
      await updateDoc(doc(db, 'students', invite.linkedEntityId), {
        userId: uid,
        updatedAt: nowIso
      });
    } catch {
      // Silencioso: isOwnStudentDoc já valida via user.studentIds / user.studentId
    }
  }
}
