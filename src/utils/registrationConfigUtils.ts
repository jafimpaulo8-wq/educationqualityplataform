import {
  FieldRequirementStatus,
  Institution,
  OnlineCourseConfig,
  OnlineRegistrationConfig,
  OnlineRegistrationCustomQuestion,
  OnlineRegistrationRequiredFields
} from '../types';

export type NormalizedRequirement = 'obrigatorio' | 'opcional' | 'oculto';

export interface ConfiguredDocumentItem {
  name: string;
  requirement: NormalizedRequirement;
}

export interface RegistrationFormInput {
  selectedCourseId?: string;
  fullName?: string;
  documentNumber?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  email?: string;
  province?: string;
  city?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  authorizedPickupPersons?: string;
  nuit?: string;
  previousSchool?: string;
  customAnswers?: Record<string, string>;
  uploadedDocs?: Record<string, any>;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

const DEFAULT_NEUTRAL_FIELDS: OnlineRegistrationRequiredFields = {
  email: 'opcional',
  phone: 'obrigatorio',
  documentNumber: 'obrigatorio',
  birthDate: 'obrigatorio',
  gender: 'obrigatorio',
  province: 'opcional',
  city: 'opcional',
  address: 'opcional',
  guardianName: 'opcional',
  guardianPhone: 'opcional',
  guardianRelationship: 'oculto',
  authorizedPickupPersons: 'oculto',
  nuit: 'opcional',
  previousSchool: 'opcional'
};

/**
 * Normaliza qualquer representação de exigência de campo para 'obrigatorio' | 'opcional' | 'oculto'.
 */
export function normalizeFieldRequirement(
  value: FieldRequirementStatus | undefined | null,
  fallback: NormalizedRequirement = 'opcional'
): NormalizedRequirement {
  if (value === 'obrigatorio' || value === true) return 'obrigatorio';
  if (value === 'oculto' || value === false) return 'oculto';
  if (value === 'opcional') return 'opcional';
  return fallback;
}

/**
 * Cria uma configuração neutra de inscrições online específica da instituição,
 * sem qualquer curso, pergunta ou referência herdada do CFTPM ou de outro centro.
 */
export function createEmptyOnlineRegistrationConfig(
  inst?: Partial<Institution> | null
): OnlineRegistrationConfig {
  const isChildCenter = inst?.type === 'centro_infantil';
  const instName = inst?.name?.trim();
  const currentYear = String(new Date().getFullYear());

  return {
    institutionId: inst?.id || '',
    isOpen: true,
    title: instName ? `Inscrições Online — ${instName}` : 'Inscrições Online',
    description: instName
      ? `Portal oficial de candidaturas da instituição ${instName}.`
      : 'Preencha o formulário para submeter a sua candidatura oficial.',
    startDate: '',
    endDate: '',
    academicYear: currentYear,
    semester: '',
    requiredFields: {
      ...DEFAULT_NEUTRAL_FIELDS,
      documentNumber: isChildCenter ? 'opcional' : 'obrigatorio',
      guardianName: isChildCenter ? 'obrigatorio' : 'opcional',
      guardianPhone: isChildCenter ? 'obrigatorio' : 'opcional',
      guardianRelationship: isChildCenter ? 'obrigatorio' : 'oculto',
      authorizedPickupPersons: isChildCenter ? 'obrigatorio' : 'oculto'
    },
    requiredDocuments: [],
    documentRequirements: {},
    customQuestions: [],
    coursesConfig: [],
    autoApproveOnPayment: false,
    confirmationMessageTemplate: instName
      ? `Prezado(a) {NOME}, a sua candidatura para {CURSO} na ${instName} foi submetida com sucesso! Código: {CODIGO}.`
      : 'Prezado(a) {NOME}, a sua candidatura foi submetida com sucesso! Código: {CODIGO}.',
    contactPhone: inst?.phone || '',
    contactWhatsapp: inst?.whatsapp || '',
    contactEmail: inst?.email || ''
  };
}

/**
 * Indica se uma pergunta personalizada deve ser exibida no formulário público.
 */
export function isQuestionVisible(q: OnlineRegistrationCustomQuestion): boolean {
  return q && q.active !== false && Boolean(q.question?.trim());
}

/**
 * Retorna a lista de documentos visíveis com o seu nível de obrigatoriedade configurado.
 * Não injeta documentos fictícios nem de outras instituições quando a lista está vazia.
 */
export function getConfiguredDocuments(
  config?: Partial<OnlineRegistrationConfig> | null
): ConfiguredDocumentItem[] {
  const docs = Array.isArray(config?.requiredDocuments) ? config!.requiredDocuments : [];
  const reqMap = config?.documentRequirements || {};
  const seen = new Set<string>();
  const result: ConfiguredDocumentItem[] = [];

  for (const rawName of docs) {
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const requirement = normalizeFieldRequirement(reqMap[name], 'obrigatorio');
    if (requirement !== 'oculto') {
      result.push({ name, requirement });
    }
  }

  return result;
}

/**
 * Valida e formata o telefone para o padrão internacional Moçambicano (ex.: 258841234567).
 * Retorna null caso o número não exista ou seja inválido (permitindo ocultar o botão de WhatsApp).
 */
export function validateAndFormatInternationalPhone(
  rawPhone: string | null | undefined
): string | null {
  if (!rawPhone) return null;
  const digits = String(rawPhone).replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('258') && digits.length === 12) {
    return digits;
  }

  if (digits.length === 9) {
    const nationalPrefix = digits.slice(0, 2);
    if (['82', '83', '84', '85', '86', '87'].includes(nationalPrefix)) {
      return `258${digits}`;
    }
  }

  if (digits.length === 8 && digits.startsWith('2')) {
    return `258${digits}`;
  }

  return null;
}

function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getFieldLabel(fieldKey: string): string {
  const labels: Record<string, string> = {
    phone: 'Contacto Telefónico Principal',
    email: 'Endereço de E-mail',
    documentNumber: 'Número do Documento',
    birthDate: 'Data de Nascimento',
    gender: 'Género',
    guardianName: 'Nome do Encarregado de Educação',
    guardianPhone: 'Telefone do Encarregado',
    guardianRelationship: 'Grau de Parentesco',
    authorizedPickupPersons: 'Pessoas Autorizadas a Buscar a Criança',
    address: 'Endereço Residencial',
    province: 'Província',
    city: 'Cidade / Distrito',
    nuit: 'NUIT',
    previousSchool: 'Escola Anterior'
  };
  return labels[fieldKey] || fieldKey;
}

/**
 * Retorna o número real de vagas restantes de um curso configurado no portal ou na oferta formativa.
 * Retorna `null` apenas quando o curso não tem limite numérico de vagas definido.
 */
export function getRemainingVacancies(
  course?: { vacancies?: number; totalVacancies?: number; filledVacancies?: number } | null
): number | null {
  if (!course) return null;
  const maxVacancies =
    typeof course.vacancies === 'number' && Number.isFinite(course.vacancies)
      ? course.vacancies
      : typeof course.totalVacancies === 'number' && Number.isFinite(course.totalVacancies)
        ? course.totalVacancies
        : null;
  if (maxVacancies === null) return null;
  const filled =
    typeof course.filledVacancies === 'number' && Number.isFinite(course.filledVacancies) && course.filledVacancies > 0
      ? course.filledVacancies
      : 0;
  return Math.max(0, maxVacancies - filled);
}

/**
 * Indica se o curso está esgotado (`vacancies <= 0` ou `filledVacancies >= vacancies`).
 */
export function isCourseSoldOut(
  course?: { vacancies?: number; totalVacancies?: number; filledVacancies?: number } | null
): boolean {
  const remaining = getRemainingVacancies(course);
  if (remaining === null) return false;
  return remaining <= 0;
}

/**
 * Calcula hash SHA-256 em hexadecimal (browser WebCrypto / Node 20+) para chaves de deduplicação sem PII.
 */
export async function computeSha256Hex(value: string): Promise<string> {
  const text = String(value || '');
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle && typeof TextEncoder !== 'undefined') {
    const encoded = new TextEncoder().encode(text);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback determinístico FNV-1a estendido (64+ chars hex) apenas em ambientes sem WebCrypto
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}${text.length.toString(16).padStart(8, '0')}00000000`;
}

/**
 * Valida uma etapa específica do formulário de inscrição pública usando estritamente
 * os requisitos configurados pela instituição.
 */
export function validateRegistrationStep(
  step: number,
  data: RegistrationFormInput,
  config: Partial<OnlineRegistrationConfig>,
  activeCourses: OnlineCourseConfig[]
): ValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  const rf = config.requiredFields || {};

  if (step === 1) {
    if (config.isOpen === false) {
      errors.push('As inscrições online encontram-se encerradas neste momento.');
    }
    if (!activeCourses || activeCourses.length === 0) {
      errors.push('Esta instituição ainda não disponibilizou cursos ou salas ativas para inscrição online.');
    } else if (!data.selectedCourseId || !activeCourses.some(c => c.courseId === data.selectedCourseId)) {
      fieldErrors.selectedCourseId = 'Selecione uma opção válida.';
      errors.push('Selecione um curso ou sala disponível para prosseguir.');
    } else {
      const selectedCourse = activeCourses.find(c => c.courseId === data.selectedCourseId);
      if (selectedCourse && isCourseSoldOut(selectedCourse)) {
        const msg = `As vagas para "${selectedCourse.courseName}" encontram-se esgotadas.`;
        fieldErrors.selectedCourseId = msg;
        errors.push(msg);
      }
    }
  }

  if (step === 2) {
    const fullName = (data.fullName || '').trim();
    if (fullName.length < 2) {
      fieldErrors.fullName = 'Informe o nome completo (mínimo 2 caracteres).';
      errors.push('Nome completo é obrigatório.');
    }

    const fieldRules: Array<{
      key: keyof RegistrationFormInput & string;
      minLen?: number;
      fallback: NormalizedRequirement;
    }> = [
      { key: 'gender', minLen: 1, fallback: 'opcional' },
      { key: 'birthDate', minLen: 4, fallback: 'opcional' },
      { key: 'documentNumber', minLen: 3, fallback: 'opcional' },
      { key: 'phone', minLen: 6, fallback: 'obrigatorio' },
      { key: 'email', minLen: 5, fallback: 'opcional' },
      { key: 'guardianName', minLen: 2, fallback: 'opcional' },
      { key: 'guardianPhone', minLen: 6, fallback: 'opcional' },
      { key: 'guardianRelationship', minLen: 2, fallback: 'oculto' },
      { key: 'authorizedPickupPersons', minLen: 2, fallback: 'oculto' },
      { key: 'address', minLen: 2, fallback: 'opcional' },
      { key: 'province', minLen: 2, fallback: 'opcional' },
      { key: 'city', minLen: 2, fallback: 'opcional' },
      { key: 'nuit', minLen: 5, fallback: 'opcional' },
      { key: 'previousSchool', minLen: 2, fallback: 'opcional' }
    ];

    for (const rule of fieldRules) {
      const req = normalizeFieldRequirement(rf[rule.key], rule.fallback);
      if (req === 'oculto') continue;
      const rawVal = String(data[rule.key] || '').trim();

      if (req === 'obrigatorio') {
        if (!rawVal || rawVal.length < (rule.minLen || 1)) {
          const msg = `${getFieldLabel(rule.key)} é obrigatório.`;
          fieldErrors[rule.key] = msg;
          errors.push(msg);
          continue;
        }
      }

      if (rule.key === 'email' && rawVal && !isValidEmailFormat(rawVal)) {
        const msg = 'Informe um endereço de e-mail válido.';
        fieldErrors.email = msg;
        errors.push(msg);
      }
    }
  }

  if (step === 3) {
    const questions = (config.customQuestions || []).filter(isQuestionVisible);
    for (const q of questions) {
      if (q.required) {
        const ans = (data.customAnswers?.[q.id] || '').trim();
        if (!ans) {
          const msg = `Responda à pergunta obrigatória: "${q.question}"`;
          fieldErrors[`q_${q.id}`] = 'Resposta obrigatória.';
          errors.push(msg);
        }
      }
    }
  }

  if (step === 4) {
    const docs = getConfiguredDocuments(config);
    for (const docItem of docs) {
      if (docItem.requirement === 'obrigatorio') {
        const hasFile = Boolean(data.uploadedDocs?.[docItem.name]);
        if (!hasFile) {
          const msg = `Anexe o documento obrigatório: "${docItem.name}"`;
          fieldErrors[`doc_${docItem.name}`] = 'Documento obrigatório.';
          errors.push(msg);
        }
      }
    }
  }

  if (step === 5) {
    if (!data.termsAccepted) {
      fieldErrors.termsAccepted = 'Deve aceitar o regulamento.';
      errors.push('É obrigatório aceitar o Regulamento de Candidaturas da instituição.');
    }
    if (!data.privacyAccepted) {
      fieldErrors.privacyAccepted = 'Deve aceitar a política de privacidade.';
      errors.push('É obrigatório aceitar a Política de Privacidade.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    fieldErrors
  };
}

/**
 * Valida todas as 5 etapas antes da submissão final ao Firestore.
 */
export function validateFullRegistration(
  data: RegistrationFormInput,
  config: Partial<OnlineRegistrationConfig>,
  activeCourses: OnlineCourseConfig[]
): ValidationResult & { firstInvalidStep: number } {
  const allErrors: string[] = [];
  const allFieldErrors: Record<string, string> = {};
  let firstInvalidStep = 0;

  for (const step of [1, 2, 3, 4, 5]) {
    const res = validateRegistrationStep(step, data, config, activeCourses);
    if (!res.valid) {
      if (firstInvalidStep === 0) {
        firstInvalidStep = step;
      }
      allErrors.push(...res.errors);
      Object.assign(allFieldErrors, res.fieldErrors);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    fieldErrors: allFieldErrors,
    firstInvalidStep
  };
}

/**
 * Remove propriedades com valor undefined antes de gravar no Firestore.
 */
export function sanitizeFirestoreData<T>(input: T): T {
  if (Array.isArray(input)) {
    return input
      .filter(item => item !== undefined)
      .map(item => sanitizeFirestoreData(item)) as unknown as T;
  }
  if (input && typeof input === 'object' && !(input instanceof Date)) {
    // Preservar sentinels como serverTimestamp() (objetos com _methodName ou FieldValue)
    if ('_methodName' in (input as any) || typeof (input as any).toDate === 'function') {
      return input;
    }
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(input as Record<string, any>)) {
      if (v !== undefined) {
        clean[k] = sanitizeFirestoreData(v);
      }
    }
    return clean as T;
  }
  return input;
}

/**
 * Oculta PII do nome completo do candidato para consulta pública segura.
 * Mostra apenas as iniciais e o último apelido (ex.: "Ca•••••• Munguambe").
 */
export function maskCandidateName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2) + '••••••';
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.slice(0, 2)}•••••• ${last}`;
}
