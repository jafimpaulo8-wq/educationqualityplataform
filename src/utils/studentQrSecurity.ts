/**
 * Utilitário centralizado para geração e verificação de payloads e tokens de QR Code dos alunos.
 * Mantém compatibilidade com QR Codes existentes enquanto elimina correspondência parcial,
 * detecta adulterações/expiração/outra instituição e prepara contrato para verificação no servidor.
 */

export const SIGAR_QR_PREFIX = 'SIGAR-QR-V1';

export interface SignedQrPayloadData {
  studentId: string;
  institutionId: string;
  studentCode: string;
  issuedAt: number;
  expiresAt?: number;
  signature: string;
}

export interface QrTokenVerificationResult {
  isSignedV1: boolean;
  valid: boolean;
  tampered: boolean;
  expired: boolean;
  wrongInstitution: boolean;
  requiresServerVerification: boolean;
  institutionId?: string;
  studentId?: string;
  studentCode?: string;
  signature?: string;
  reason?: string;
}

/**
 * Hash determinístico legado (para compatibilidade estrita com carteirinhas já impressas).
 * NUNCA deve ser usado com substring (.includes); apenas comparação exata.
 */
export function generateStudentQrHash(
  studentId: string,
  studentCode: string,
  institutionId: string
): string {
  const input = `${studentId}|${studentCode}|${institutionId}|SIGAR-MZ-2026`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const absHash = Math.abs(hash).toString(36).toUpperCase().padStart(6, '0');
  return `SGR-${absHash}`;
}

/**
 * Assinatura determinística de cliente (camada inicial pré-servidor).
 * Em produção, a emissão e validação final com segredo privado devem ocorrer via Cloud Function.
 */
function computeClientEnvelopeTag(
  institutionId: string,
  studentId: string,
  studentCode: string,
  issuedAt: number,
  expiresAt: number
): string {
  const canonical = `V1|${institutionId.trim()}|${studentId.trim()}|${studentCode.trim().toUpperCase()}|${issuedAt}|${expiresAt}|SIGAR-GATE-ENVELOPE`;
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < canonical.length; i++) {
    const c = canonical.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c + (i << 1);
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const part1 = (h1 >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `${part1}${part2}`;
}

export function buildSignedStudentQrToken(params: {
  studentId: string;
  institutionId: string;
  studentCode: string;
  issuedAtMs?: number;
  ttlDays?: number;
}): string {
  const issuedAt = params.issuedAtMs ?? Date.now();
  const ttlMs = (params.ttlDays ?? 365) * 24 * 60 * 60 * 1000;
  const expiresAt = issuedAt + ttlMs;
  const cleanInst = (params.institutionId || '').trim();
  const cleanId = (params.studentId || '').trim();
  const cleanCode = (params.studentCode || '').trim().toUpperCase();
  const sig = computeClientEnvelopeTag(cleanInst, cleanId, cleanCode, issuedAt, expiresAt);
  return `${SIGAR_QR_PREFIX}:${cleanInst}:${cleanId}:${cleanCode}:${issuedAt}:${expiresAt}:${sig}`;
}

/**
 * Constrói o payload estruturado JSON para o QR Code da carteirinha do aluno.
 * Inclui assinatura versionada + vínculo explícito à instituição e aluno.
 */
export function buildStudentQrPayload(params: {
  studentId: string;
  studentCode: string;
  studentName: string;
  institutionId: string;
  institutionName?: string;
}): string {
  const cleanInst = (params.institutionId || '').trim();
  const cleanCode = (params.studentCode || '').trim().toUpperCase();
  const legacyHash = generateStudentQrHash(params.studentId, cleanCode, cleanInst);
  const signedToken = buildSignedStudentQrToken({
    studentId: params.studentId,
    institutionId: cleanInst,
    studentCode: cleanCode,
  });

  return JSON.stringify({
    v: 2,
    t: 'SIGAR_STUDENT_ID',
    id: params.studentId,
    code: cleanCode,
    inst: cleanInst,
    hash: legacyHash,
    token: signedToken,
  });
}

/**
 * Valida token SIGAR-QR-V1 no cliente antes de submeter à validação final do servidor.
 */
export function verifySignedStudentQrToken(
  token: string,
  expectedInstitutionId: string,
  nowMs: number = Date.now()
): QrTokenVerificationResult {
  const trimmed = (token || '').trim();
  if (!trimmed.startsWith(`${SIGAR_QR_PREFIX}:`)) {
    return {
      isSignedV1: false,
      valid: false,
      tampered: false,
      expired: false,
      wrongInstitution: false,
      requiresServerVerification: false,
    };
  }

  const parts = trimmed.split(':');
  if (parts.length !== 7) {
    return {
      isSignedV1: true,
      valid: false,
      tampered: true,
      expired: false,
      wrongInstitution: false,
      requiresServerVerification: true,
      reason: 'Formato de token QR inválido ou truncado.',
    };
  }

  const [, instId, studentId, studentCode, issuedStr, expStr, providedSig] = parts;
  const issuedAt = Number(issuedStr);
  const expiresAt = Number(expStr);

  if (!instId || !studentId || !studentCode || !Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || !providedSig) {
    return {
      isSignedV1: true,
      valid: false,
      tampered: true,
      expired: false,
      wrongInstitution: false,
      requiresServerVerification: true,
      reason: 'Campos obrigatórios do token QR ausentes ou corrompidos.',
    };
  }

  const expectedSig = computeClientEnvelopeTag(instId, studentId, studentCode, issuedAt, expiresAt);
  if (providedSig.toUpperCase() !== expectedSig) {
    return {
      isSignedV1: true,
      valid: false,
      tampered: true,
      expired: false,
      wrongInstitution: false,
      requiresServerVerification: true,
      institutionId: instId,
      studentId,
      studentCode,
      signature: providedSig,
      reason: 'Assinatura do token QR adulterada ou inválida.',
    };
  }

  if (expectedInstitutionId && instId !== expectedInstitutionId) {
    return {
      isSignedV1: true,
      valid: false,
      tampered: false,
      expired: false,
      wrongInstitution: true,
      requiresServerVerification: true,
      institutionId: instId,
      studentId,
      studentCode,
      signature: providedSig,
      reason: `QR Code pertence a outra instituição (${instId}).`,
    };
  }

  if (expiresAt > 0 && nowMs > expiresAt) {
    return {
      isSignedV1: true,
      valid: false,
      tampered: false,
      expired: true,
      wrongInstitution: false,
      requiresServerVerification: true,
      institutionId: instId,
      studentId,
      studentCode,
      signature: providedSig,
      reason: 'Token QR expirado. Emita uma nova carteirinha na Secretaria.',
    };
  }

  return {
    isSignedV1: true,
    valid: true,
    tampered: false,
    expired: false,
    wrongInstitution: false,
    requiresServerVerification: true,
    institutionId: instId,
    studentId,
    studentCode,
    signature: providedSig,
  };
}

/**
 * URL pública de verificação para QR Codes de carteirinhas ou certificados.
 */
export function getStudentQrUrl(studentCode: string, institutionId: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://sigar.moztechwave.com';
  return `${base}/?route=sivec_verify_public&type=student&code=${encodeURIComponent(studentCode)}&inst=${encodeURIComponent(institutionId)}`;
}

export interface PublicStudentInfo {
  fullName: string;
  code: string;
  courseName: string;
  classGroupName: string;
  status: string;
  photoUrl?: string;
  institutionName: string;
  qrVerificationHash: string;
  signedToken: string;
}

/**
 * Filtra estritamente apenas os dados públicos autorizados do estudante (sem BI, telefone pessoal, morada, financeiro ou encarregado).
 */
export function getAuthorizedPublicStudentData(
  student: {
    id: string;
    fullName: string;
    name?: string;
    code: string;
    courseName: string;
    classGroupName: string;
    status: string;
    photoUrl?: string;
    institutionId?: string;
  },
  institutionName: string,
  institutionIdOrCode: string
): PublicStudentInfo {
  const instRef = student.institutionId || institutionIdOrCode || 'INST';
  const cleanCode = (student.code || '').trim().toUpperCase();
  return {
    fullName: student.fullName || student.name || 'Estudante',
    code: cleanCode,
    courseName: student.courseName || 'Curso não especificado',
    classGroupName: student.classGroupName || 'Sem turma',
    status: student.status || 'Ativo',
    photoUrl: student.photoUrl,
    institutionName: institutionName || 'Instituição de Ensino',
    qrVerificationHash: generateStudentQrHash(student.id, cleanCode, instRef),
    signedToken: buildSignedStudentQrToken({
      studentId: student.id,
      institutionId: instRef,
      studentCode: cleanCode,
    }),
  };
}

/**
 * Verifica se o perfil autenticado tem autorização operacional na portaria.
 */
export function isAuthorizedGateOperator(role?: string): boolean {
  const normalized = (role || '').trim().toUpperCase();
  return [
    'SUPER_ADMIN',
    'SUPERADMIN',
    'ADMIN_INSTITUICAO',
    'ADMIN',
    'DIRETOR',
    'DIRECTOR',
    'DIRECTOR_GERAL',
    'SECRETARIA',
    'PORTEIRO',
    'PORTEIRO_ACESSO',
    'OPERADOR',
    'STAFF',
  ].includes(normalized);
}

