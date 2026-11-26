import * as crypto from 'node:crypto';

export const ALLOWED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const;
export const ALLOWED_CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

export const MAX_CV_FILE_BYTES = 450 * 1024;
export const MAX_ATTACHMENTS_PER_APPLICATION = 3;
export const JOB_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const JOB_RATE_LIMIT_MAX_ATTEMPTS = 5;

export const FORBIDDEN_SUPER_ADMIN_ROLES = new Set([
  'SUPER_ADMIN',
  'SUPERADMIN',
  'SUPER ADMIN',
  'SUPER ADMINISTRADOR',
  'VISITANTE'
]);

export const VALID_INVITE_TARGET_ROLES = new Set([
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
]);

export interface ServerValidationError {
  code:
    | 'invalid-argument'
    | 'unauthenticated'
    | 'permission-denied'
    | 'not-found'
    | 'already-exists'
    | 'failed-precondition'
    | 'resource-exhausted';
  message: string;
}

export function isValidFirestoreId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(id);
}

export function isValidInviteTokenFormat(token: unknown): token is string {
  return typeof token === 'string' && /^[a-zA-Z0-9_-]{8,128}$/.test(token.trim());
}

export function normalizeRoleUpper(role: unknown): string {
  return String(role || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

export function isForbiddenSuperAdminRole(role: unknown): boolean {
  const norm = String(role || '').trim().toUpperCase();
  const underscored = normalizeRoleUpper(role);
  return (
    FORBIDDEN_SUPER_ADMIN_ROLES.has(norm) ||
    FORBIDDEN_SUPER_ADMIN_ROLES.has(underscored) ||
    underscored === 'SUPER_ADMIN'
  );
}

export function evaluateInvitationForActivation(params: {
  invite: Record<string, any> | null;
  callerUid: string;
  callerEmail: string;
  emailVerified: boolean;
  nowMs?: number;
}): { ok: true; normalizedEmail: string; targetRole: string; institutionId: string } | { ok: false; error: ServerValidationError } {
  const { invite, callerUid, callerEmail, emailVerified, nowMs = Date.now() } = params;

  if (!callerUid || !callerUid.trim()) {
    return { ok: false, error: { code: 'unauthenticated', message: 'Autenticação obrigatória.' } };
  }

  if (!emailVerified) {
    return {
      ok: false,
      error: {
        code: 'failed-precondition',
        message:
          'Confirmação de e-mail obrigatória (email_verified). Verifique o link enviado para a sua caixa de correio antes de concluir a activação.'
      }
    };
  }

  if (!invite) {
    return { ok: false, error: { code: 'not-found', message: 'Convite não encontrado ou inválido.' } };
  }

  if (invite.revoked === true || invite.status === 'revogado') {
    return {
      ok: false,
      error: { code: 'failed-precondition', message: 'Este convite foi revogado pela instituição.' }
    };
  }

  if (invite.used === true || invite.status === 'ativado') {
    return {
      ok: false,
      error: {
        code: 'failed-precondition',
        message: 'Este convite já foi utilizado. Utilize o login único com o seu e-mail e palavra-passe.'
      }
    };
  }

  const isoExpMs = typeof invite.expiresAt === 'string' ? Date.parse(invite.expiresAt) : NaN;
  const numExpMs = typeof invite.expiresAtMs === 'number' ? invite.expiresAtMs : NaN;
  const expMs =
    Number.isFinite(numExpMs) && Number.isFinite(isoExpMs)
      ? Math.min(numExpMs, isoExpMs)
      : Number.isFinite(numExpMs)
        ? numExpMs
        : isoExpMs;

  if (!Number.isFinite(expMs) || expMs <= nowMs) {
    return {
      ok: false,
      error: {
        code: 'failed-precondition',
        message: 'Este convite expirou. Solicite um novo link de activação à sua instituição.'
      }
    };
  }

  const rawInviteEmail = String(invite.email || invite.studentEmail || '').trim().toLowerCase();
  const cleanCallerEmail = String(callerEmail || '').trim().toLowerCase();

  if (!rawInviteEmail || !cleanCallerEmail || rawInviteEmail !== cleanCallerEmail) {
    return {
      ok: false,
      error: {
        code: 'permission-denied',
        message: 'O e-mail autenticado não corresponde ao endereço autorizado neste convite.'
      }
    };
  }

  const rawRole = invite.role || (invite.studentEmail ? 'ALUNO' : '');
  if (isForbiddenSuperAdminRole(rawRole) || invite.isSuperAdmin === true) {
    return {
      ok: false,
      error: {
        code: 'permission-denied',
        message: 'Atribuição de perfil SUPER_ADMIN ou papel inválido não é permitida por convite.'
      }
    };
  }

  const targetRole = normalizeRoleUpper(rawRole);
  if (!VALID_INVITE_TARGET_ROLES.has(targetRole)) {
    return {
      ok: false,
      error: { code: 'permission-denied', message: `Perfil de destino inválido (${targetRole}).` }
    };
  }

  const institutionId = String(invite.institutionId || '').trim();
  if (!isValidFirestoreId(institutionId)) {
    return {
      ok: false,
      error: { code: 'failed-precondition', message: 'Convite sem instituição válida associada.' }
    };
  }

  return {
    ok: true,
    normalizedEmail: rawInviteEmail,
    targetRole,
    institutionId
  };
}

export function getMaputoTodayIsoDate(nowMs = Date.now()): string {
  // Moçambique: UTC+2 (CAT)
  return new Date(nowMs + 2 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function validateVacancyAcceptingApplications(
  vacancy: Record<string, any> | null,
  institutionId: string,
  nowMs = Date.now()
): { ok: true } | { ok: false; error: ServerValidationError } {
  if (!vacancy) {
    return { ok: false, error: { code: 'not-found', message: 'Vaga de emprego não encontrada.' } };
  }

  if (String(vacancy.institutionId || '') !== institutionId) {
    return {
      ok: false,
      error: { code: 'permission-denied', message: 'Vaga não pertence à instituição informada.' }
    };
  }

  if (vacancy.status !== 'publicada') {
    return {
      ok: false,
      error: {
        code: 'failed-precondition',
        message: 'Esta vaga não se encontra publicada para novas candidaturas.'
      }
    };
  }

  const deadline = String(vacancy.deadline || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return {
      ok: false,
      error: { code: 'failed-precondition', message: 'Vaga sem data limite válida configurada.' }
    };
  }

  const todayMaputo = getMaputoTodayIsoDate(nowMs);
  if (deadline < todayMaputo) {
    return {
      ok: false,
      error: {
        code: 'failed-precondition',
        message: `O prazo desta vaga expirou em ${deadline}.`
      }
    };
  }

  return { ok: true };
}

export interface RawAttachmentInput {
  id?: string;
  label?: string;
  fileName: string;
  mimeType?: string;
  sizeBytes: number;
  dataUrl?: string;
  uploadedAt?: string;
}

export function validateServerAttachment(att: RawAttachmentInput): { ok: true } | { ok: false; message: string } {
  if (!att || typeof att !== 'object') {
    return { ok: false, message: 'Anexo inválido.' };
  }
  const fileName = String(att.fileName || '').trim();
  const lower = fileName.toLowerCase();
  if (!fileName || fileName.length > 200) {
    return { ok: false, message: 'Nome do ficheiro inválido.' };
  }
  const hasValidExt = ALLOWED_CV_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!hasValidExt) {
    return {
      ok: false,
      message: `Formato não permitido para "${fileName}". Aceitamos apenas PDF, DOC ou DOCX.`
    };
  }

  const mime = String(att.mimeType || '').trim().toLowerCase();
  if (mime) {
    const forbiddenPrefixes = [
      'text/html',
      'application/javascript',
      'text/javascript',
      'application/x-msdownload',
      'application/x-sh',
      'image/'
    ];
    if (forbiddenPrefixes.some((p) => mime.startsWith(p))) {
      return {
        ok: false,
        message: `Tipo MIME inválido (${mime}). Envie apenas currículo em PDF, DOC ou DOCX.`
      };
    }
    if (
      mime !== 'application/octet-stream' &&
      !ALLOWED_CV_MIME_TYPES.includes(mime as any)
    ) {
      return {
        ok: false,
        message: `Tipo de ficheiro não suportado (${mime}).`
      };
    }
  }

  const sizeBytes = Number(att.sizeBytes);
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_CV_FILE_BYTES) {
    return {
      ok: false,
      message: `O ficheiro "${fileName}" deve ter entre 1 byte e 450 KB.`
    };
  }

  if (att.dataUrl !== undefined && att.dataUrl !== '') {
    if (typeof att.dataUrl !== 'string') {
      return { ok: false, message: 'Conteúdo do anexo inválido.' };
    }
    const match = att.dataUrl.match(
      /^data:(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/octet-stream);base64,([A-Za-z0-9+/=]+)$/
    );
    if (!match) {
      return {
        ok: false,
        message: `Conteúdo Base64 inválido para "${fileName}".`
      };
    }
    const base64Payload = match[2];
    const estimatedBytes = Math.floor((base64Payload.length * 3) / 4);
    if (estimatedBytes > MAX_CV_FILE_BYTES + 4096) {
      return {
        ok: false,
        message: `O conteúdo decodificado de "${fileName}" excede o limite de 450 KB.`
      };
    }
  }

  return { ok: true };
}

export interface RawJobApplicationPayload {
  institutionId: string;
  vacancyId: string;
  fullName: string;
  email: string;
  phone: string;
  academicLevel: string;
  experienceSummary: string;
  coverLetter?: string;
  attachments: RawAttachmentInput[];
}

export function validateJobApplicationServerPayload(
  input: RawJobApplicationPayload
):
  | {
      ok: true;
      clean: {
        institutionId: string;
        vacancyId: string;
        fullName: string;
        email: string;
        phone: string;
        academicLevel: string;
        experienceSummary: string;
        coverLetter: string;
        attachments: RawAttachmentInput[];
      };
    }
  | { ok: false; error: ServerValidationError } {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: { code: 'invalid-argument', message: 'Dados de candidatura ausentes.' } };
  }
  if (!isValidFirestoreId(input.institutionId)) {
    return { ok: false, error: { code: 'invalid-argument', message: 'Instituição inválida.' } };
  }
  if (!isValidFirestoreId(input.vacancyId)) {
    return { ok: false, error: { code: 'invalid-argument', message: 'Vaga inválida.' } };
  }

  const fullName = String(input.fullName || '').trim();
  if (fullName.length < 3 || fullName.length > 200) {
    return {
      ok: false,
      error: { code: 'invalid-argument', message: 'O nome completo deve ter entre 3 e 200 caracteres.' }
    };
  }

  const email = String(input.email || '').trim().toLowerCase();
  if (!email || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      ok: false,
      error: { code: 'invalid-argument', message: 'Informe um endereço de e-mail válido.' }
    };
  }

  const phone = String(input.phone || '').trim();
  if (phone.length < 6 || phone.length > 40) {
    return {
      ok: false,
      error: { code: 'invalid-argument', message: 'Informe um número de telefone válido.' }
    };
  }

  const academicLevel = String(input.academicLevel || '').trim();
  if (academicLevel.length < 2 || academicLevel.length > 150) {
    return {
      ok: false,
      error: { code: 'invalid-argument', message: 'Informe as habilitações académicas.' }
    };
  }

  const experienceSummary = String(input.experienceSummary || '').trim();
  if (experienceSummary.length < 10 || experienceSummary.length > 4000) {
    return {
      ok: false,
      error: {
        code: 'invalid-argument',
        message: 'Descreva a sua experiência profissional ou académica (mínimo 10 caracteres).'
      }
    };
  }

  const coverLetter = String(input.coverLetter || '').trim().slice(0, 4000);

  if (!Array.isArray(input.attachments) || input.attachments.length === 0) {
    return {
      ok: false,
      error: {
        code: 'invalid-argument',
        message: 'É obrigatório anexar o Currículo (CV em PDF, DOC ou DOCX).'
      }
    };
  }

  if (input.attachments.length > MAX_ATTACHMENTS_PER_APPLICATION) {
    return {
      ok: false,
      error: {
        code: 'invalid-argument',
        message: `Máximo de ${MAX_ATTACHMENTS_PER_APPLICATION} anexos permitidos.`
      }
    };
  }

  for (const att of input.attachments) {
    const check = validateServerAttachment(att);
    if ('message' in check) {
      return { ok: false, error: { code: 'invalid-argument', message: check.message } };
    }
  }

  return {
    ok: true,
    clean: {
      institutionId: input.institutionId,
      vacancyId: input.vacancyId,
      fullName,
      email,
      phone,
      academicLevel,
      experienceSummary,
      coverLetter,
      attachments: input.attachments.map((att, idx) => ({
        id: String(att.id || `att-${Date.now()}-${idx}`),
        label: String(att.label || (idx === 0 ? 'Currículo (CV)' : 'Documento Adicional')).slice(0, 100),
        fileName: String(att.fileName).trim(),
        mimeType: String(att.mimeType || 'application/pdf').trim(),
        sizeBytes: Number(att.sizeBytes),
        dataUrl: att.dataUrl || '',
        uploadedAt: att.uploadedAt || new Date().toISOString()
      }))
    }
  };
}

export function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function buildJobDedupKey(vacancyId: string, normalizedEmail: string): string {
  return `${vacancyId}__${sha256Hex(normalizedEmail.trim().toLowerCase())}`;
}

export function maskCandidateNameServer(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2) + '••••••';
  }
  return `${parts[0].slice(0, 2)}•••••• ${parts[parts.length - 1]}`;
}

export function evaluateRateLimitWindow(
  existingTimestamps: number[],
  nowMs = Date.now(),
  windowMs = JOB_RATE_LIMIT_WINDOW_MS,
  maxAttempts = JOB_RATE_LIMIT_MAX_ATTEMPTS
): { allowed: boolean; nextTimestamps: number[] } {
  const cutoff = nowMs - windowMs;
  const recent = (Array.isArray(existingTimestamps) ? existingTimestamps : []).filter(
    (ts) => typeof ts === 'number' && Number.isFinite(ts) && ts > cutoff
  );
  if (recent.length >= maxAttempts) {
    return { allowed: false, nextTimestamps: recent };
  }
  return { allowed: true, nextTimestamps: [...recent, nowMs] };
}

export const PUBLIC_DOCUMENT_REQUIREMENT_ALLOWED_KEYS_SERVER = new Set<string>([
  'bi', 'passaporte', 'dire', 'cedula', 'certificado_habilitacoes',
  'declaracao_notas', 'nuit', 'foto_passe', 'boletim_vacinas',
  'bi_encarregado', 'guia_transferencia', 'atestado_medico',
  'comprovativo_residencia', 'comprovativo_pagamento', 'curriculo_cv',
  'Bilhete de Identidade (BI) ou Passaporte válido',
  'Bilhete de Identidade (BI), DIRE ou Passaporte Válido',
  'Bilhete de Identidade (BI) ou Cédula de Nascimento',
  'Bilhete de Identidade (BI)',
  'Passaporte válido',
  'Cédula de Nascimento ou Assento da Criança',
  'Cédula de Nascimento ou Assento de Nascimento da Criança',
  'Cédula de Nascimento',
  'Certificado de Habilitações Literárias (10ª ou 12ª Classe)',
  'Certificado de Habilitações ou Declaração com Notas da Escola Anterior',
  'Certificado de Habilitações',
  'Declaração de NUIT (Identificação Tributária)',
  'Declaração ou Cartão de NUIT',
  'Cartão ou Declaração de NUIT',
  'Fotografia tipo passe recente (fundo branco)',
  'Fotografia recente tipo passe da criança (fundo branco)',
  'Fotografia tipo passe',
  'Boletim / Cartão de Vacinas Atualizado',
  'Fotocópia do BI / Identificação dos Pais ou Encarregados',
  'Guia de Transferência Oficial (quando aplicável)',
  'Atestado Médico',
  'Comprovativo de Residência',
  'Declaração de Compromisso'
]);

export function validateCourseVacancyAvailable(
  courseCfg: Record<string, any> | null | undefined
): { ok: true; remaining: number | null } | { ok: false; error: ServerValidationError } {
  if (!courseCfg) {
    return { ok: false, error: { code: 'not-found', message: 'Curso ou sala não encontrado na oferta pública.' } };
  }
  if (courseCfg.active === false) {
    return {
      ok: false,
      error: { code: 'failed-precondition', message: 'Este curso encontra-se inactivo para novas inscrições.' }
    };
  }
  const rawMax =
    typeof courseCfg.vacancies === 'number' && Number.isFinite(courseCfg.vacancies)
      ? courseCfg.vacancies
      : typeof courseCfg.totalVacancies === 'number' && Number.isFinite(courseCfg.totalVacancies)
        ? courseCfg.totalVacancies
        : null;
  if (rawMax === null) {
    return { ok: true, remaining: null };
  }
  const filled =
    typeof courseCfg.filledVacancies === 'number' && Number.isFinite(courseCfg.filledVacancies) && courseCfg.filledVacancies > 0
      ? courseCfg.filledVacancies
      : 0;
  const remaining = Math.max(0, rawMax - filled);
  if (rawMax <= 0 || remaining <= 0) {
    return {
      ok: false,
      error: { code: 'failed-precondition', message: 'As vagas para este curso encontram-se esgotadas.' }
    };
  }
  return { ok: true, remaining };
}

export function buildCourseApplicationDedupKeys(params: {
  institutionId: string;
  courseId: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
}): Array<{ id: string; hash: string }> {
  const keys: Array<{ id: string; hash: string }> = [];
  const safeCourse = String(params.courseId || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
  const normDoc = String(params.documentNumber || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const normEmail = String(params.email || '').trim().toLowerCase();
  const normPhone = String(params.phone || '').replace(/\D/g, '');

  if (normDoc.length >= 4) {
    const hash = sha256Hex(`${params.institutionId}|${params.courseId}|doc:${normDoc}`);
    keys.push({ id: `doc_${safeCourse}_${hash.slice(0, 32)}`, hash });
  }
  if (normEmail.length >= 5 && normEmail.includes('@')) {
    const hash = sha256Hex(`${params.institutionId}|${params.courseId}|email:${normEmail}`);
    keys.push({ id: `eml_${safeCourse}_${hash.slice(0, 32)}`, hash });
  }
  if (normPhone.length >= 6) {
    const hash = sha256Hex(`${params.institutionId}|${params.courseId}|phone:${normPhone}`);
    keys.push({ id: `phn_${safeCourse}_${hash.slice(0, 32)}`, hash });
  }
  return keys;
}

export function validateCourseApplicationServerPayload(
  input: Record<string, any>
): { ok: true; clean: Record<string, any> } | { ok: false; error: ServerValidationError } {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: { code: 'invalid-argument', message: 'Dados de candidatura ausentes.' } };
  }
  const institutionId = String(input.institutionId || '').trim();
  const slug = String(input.slug || '').trim().toLowerCase();
  const courseId = String(input.courseId || '').trim();
  const courseName = String(input.courseName || '').trim();
  const fullName = String(input.fullName || '').trim();

  if (!isValidFirestoreId(institutionId)) {
    return { ok: false, error: { code: 'invalid-argument', message: 'Instituição inválida.' } };
  }
  if (!isValidFirestoreId(slug) || slug === '_index') {
    return { ok: false, error: { code: 'invalid-argument', message: 'Slug institucional inválido.' } };
  }
  if (!courseId || courseId.length > 128) {
    return { ok: false, error: { code: 'invalid-argument', message: 'Curso selecionado inválido.' } };
  }
  if (!courseName || courseName.length > 200) {
    return { ok: false, error: { code: 'invalid-argument', message: 'Nome do curso inválido.' } };
  }
  if (fullName.length < 2 || fullName.length > 200) {
    return { ok: false, error: { code: 'invalid-argument', message: 'Nome completo inválido.' } };
  }
  if (input.termsAccepted !== true || input.privacyAccepted !== true) {
    return {
      ok: false,
      error: { code: 'invalid-argument', message: 'É obrigatório aceitar o regulamento e a política de privacidade.' }
    };
  }
  const forbiddenKeys = ['studentId', 'matricula', 'approved', 'convertedStudentId', 'convertedStudentCode', 'role'];
  for (const fk of forbiddenKeys) {
    if (fk in input && input[fk] !== undefined) {
      return {
        ok: false,
        error: { code: 'permission-denied', message: `Campo administrativo não permitido na submissão pública: ${fk}` }
      };
    }
  }

  return {
    ok: true,
    clean: {
      ...input,
      institutionId,
      slug,
      courseId,
      courseName,
      fullName,
      email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : '',
      phone: typeof input.phone === 'string' ? input.phone.trim() : '',
      documentNumber: typeof input.documentNumber === 'string' ? input.documentNumber.trim() : '',
      status: 'submetida',
      paymentStatus: 'Pendente'
    }
  };
}

export function sanitizePublicInstitutionServerPayload(
  raw: Record<string, any>,
  slug: string,
  institutionId: string
): Record<string, any> {
  const safeStr = (v: unknown, max = 500) => (typeof v === 'string' ? v.slice(0, max) : undefined);
  const safeStrArr = (arr: unknown, maxItems: number) =>
    Array.isArray(arr)
      ? arr.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, maxItems)
      : [];

  const allowedReqStatus = (v: unknown, fallback = 'opcional') =>
    v === 'obrigatorio' || v === 'opcional' || v === 'oculto' || typeof v === 'boolean' ? v : fallback;

  const rawCfg = raw.onlineRegistrationConfig && typeof raw.onlineRegistrationConfig === 'object' ? raw.onlineRegistrationConfig : {};
  const rawRf = rawCfg.requiredFields && typeof rawCfg.requiredFields === 'object' ? rawCfg.requiredFields : {};
  const requiredFieldsKeys = [
    'email', 'phone', 'documentNumber', 'birthDate', 'gender',
    'province', 'city', 'address', 'guardianName', 'guardianPhone',
    'guardianRelationship', 'authorizedPickupPersons', 'nuit', 'previousSchool'
  ];
  const requiredFields: Record<string, any> = {};
  for (const k of requiredFieldsKeys) {
    if (rawRf[k] !== undefined) requiredFields[k] = allowedReqStatus(rawRf[k], 'opcional');
  }

  const rawDr = rawCfg.documentRequirements && typeof rawCfg.documentRequirements === 'object' ? rawCfg.documentRequirements : {};
  const documentRequirements: Record<string, any> = {};
  for (const [k, v] of Object.entries(rawDr)) {
    if (Object.keys(documentRequirements).length >= 30) break;
    if (PUBLIC_DOCUMENT_REQUIREMENT_ALLOWED_KEYS_SERVER.has(k)) {
      documentRequirements[k] = allowedReqStatus(v, 'obrigatorio');
    }
  }

  const customQuestions = Array.isArray(rawCfg.customQuestions)
    ? rawCfg.customQuestions
        .filter((q: any) => q && typeof q === 'object')
        .slice(0, 25)
        .map((q: any) => ({
          id: String(q.id || ''),
          question: String(q.question || ''),
          type: q.type === 'select' || q.type === 'boolean' ? q.type : 'text',
          ...(Array.isArray(q.options) ? { options: safeStrArr(q.options, 15) } : {}),
          required: Boolean(q.required),
          ...(q.active !== undefined ? { active: Boolean(q.active) } : {})
        }))
    : [];

  const allowedRegimes = new Set([
    'Laboral', 'Pós-Laboral', 'Online EAD', 'Híbrido', 'Presencial', 'Semi-presencial', 'Integral'
  ]);
  const coursesConfig = Array.isArray(rawCfg.coursesConfig)
    ? rawCfg.coursesConfig
        .filter((c: any) => c && typeof c === 'object')
        .slice(0, 40)
        .map((c: any) => ({
          courseId: String(c.courseId || ''),
          courseName: String(c.courseName || ''),
          ...(typeof c.category === 'string' ? { category: c.category } : {}),
          active: c.active !== false,
          price: typeof c.price === 'number' && Number.isFinite(c.price) ? c.price : 0,
          ...(typeof c.monthlyFee === 'number' && Number.isFinite(c.monthlyFee) ? { monthlyFee: c.monthlyFee } : {}),
          duration: String(c.duration || ''),
          requirements: safeStrArr(c.requirements, 20),
          vacancies: typeof c.vacancies === 'number' && Number.isFinite(c.vacancies) ? c.vacancies : 0,
          filledVacancies: typeof c.filledVacancies === 'number' && Number.isFinite(c.filledVacancies) ? c.filledVacancies : 0,
          regimes: safeStrArr(c.regimes, 10).filter((r) => allowedRegimes.has(r)),
          shifts: safeStrArr(c.shifts, 10),
          ...(Array.isArray(c.documents) ? { documents: safeStrArr(c.documents, 15) } : {})
        }))
    : [];

  const branches = Array.isArray(raw.branches)
    ? raw.branches
        .filter((b: any) => b && typeof b === 'object')
        .slice(0, 20)
        .map((b: any) => {
          const cleanB: Record<string, any> = {};
          const branchStringFields = [
            'id', 'institutionId', 'name', 'code', 'phone', 'email',
            'address', 'city', 'province', 'status', 'createdAt'
          ];
          for (const f of branchStringFields) {
            if (typeof b[f] === 'string') cleanB[f] = b[f];
          }
          if (typeof b.isMainBranch === 'boolean') cleanB.isMainBranch = b.isMainBranch;
          if (typeof b.isHeadquarter === 'boolean') cleanB.isHeadquarter = b.isHeadquarter;
          return cleanB;
        })
    : undefined;

  const rawPm = raw.paymentMethods && typeof raw.paymentMethods === 'object' ? raw.paymentMethods : {};
  const acceptedChannels = safeStrArr(raw.acceptedChannels, 15);
  const pmChannels = safeStrArr(rawPm.acceptedChannels, 15);

  const out: Record<string, any> = {
    id: slug,
    institutionId,
    slug,
    slugAliases: safeStrArr(raw.slugAliases, 15),
    name: safeStr(raw.name) || '',
    code: safeStr(raw.code) || '',
    type: safeStr(raw.type) || 'outra',
    phone: safeStr(raw.phone) || '',
    email: safeStr(raw.email) || '',
    address: safeStr(raw.address) || '',
    city: safeStr(raw.city) || '',
    province: safeStr(raw.province) || '',
    acceptedChannels: acceptedChannels.length > 0 ? acceptedChannels : pmChannels,
    paymentMethods: {
      ...(typeof rawPm.bankName === 'string' ? { bankName: rawPm.bankName } : {}),
      acceptedChannels: pmChannels.length > 0 ? pmChannels : acceptedChannels,
      instructions: typeof rawPm.instructions === 'string' ? rawPm.instructions : ''
    },
    onlineRegistrationConfig: {
      institutionId,
      isOpen: rawCfg.isOpen !== false,
      title: safeStr(rawCfg.title) || 'Inscrições Online',
      description: safeStr(rawCfg.description, 4000) || '',
      startDate: safeStr(rawCfg.startDate) || '',
      endDate: safeStr(rawCfg.endDate) || '',
      academicYear: safeStr(rawCfg.academicYear) || String(new Date().getUTCFullYear()),
      semester: safeStr(rawCfg.semester) || '',
      requiredFields,
      requiredDocuments: safeStrArr(rawCfg.requiredDocuments, 25),
      documentRequirements,
      customQuestions,
      coursesConfig,
      autoApproveOnPayment: Boolean(rawCfg.autoApproveOnPayment),
      confirmationMessageTemplate: safeStr(rawCfg.confirmationMessageTemplate, 2000) || '',
      ...(typeof rawCfg.termsAndConditions === 'string' ? { termsAndConditions: rawCfg.termsAndConditions } : {}),
      ...(typeof rawCfg.privacyPolicy === 'string' ? { privacyPolicy: rawCfg.privacyPolicy } : {}),
      ...(typeof rawCfg.contactPhone === 'string' ? { contactPhone: rawCfg.contactPhone } : {}),
      ...(typeof rawCfg.contactWhatsapp === 'string' ? { contactWhatsapp: rawCfg.contactWhatsapp } : {}),
      ...(typeof rawCfg.contactEmail === 'string' ? { contactEmail: rawCfg.contactEmail } : {})
    },
    updatedAt: new Date().toISOString()
  };

  const optionalStrings = [
    'sigla', 'nuit', 'licenseNumber', 'phoneAlt', 'whatsapp',
    'logoUrl', 'emblemUrl', 'faviconUrl', 'slogan', 'primaryColor',
    'accentColor', 'termsAndConditions', 'privacyPolicy'
  ];
  for (const key of optionalStrings) {
    if (typeof raw[key] === 'string' && raw[key].length > 0) {
      out[key] = raw[key];
    }
  }
  if (branches !== undefined) {
    out.branches = branches;
  }

  return out;
}
