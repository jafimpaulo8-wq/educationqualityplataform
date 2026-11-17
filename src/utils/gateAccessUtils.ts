import { Course, Institution, Student } from '../types';
import { ContaReceber, PaymentRecord } from '../types/finance';
import { generateStudentQrHash } from './studentQrSecurity';
import { resolveInstitutionIdentity } from './institutionIdentity';

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export interface CurrentMonthInfo {
  year: number;
  monthIndex: number;
  monthNumberPadded: string;
  yearMonth: string;
  monthNamePt: string;
  monthNameNormalized: string;
  labelPt: string;
}

export function getCurrentMonthInfo(now: Date = new Date()): CurrentMonthInfo {
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const monthNumberPadded = String(monthIndex + 1).padStart(2, '0');
  const monthNamePt = MONTHS_PT[monthIndex] || 'Mês Atual';
  return {
    year,
    monthIndex,
    monthNumberPadded,
    yearMonth: `${year}-${monthNumberPadded}`,
    monthNamePt,
    monthNameNormalized: normalizeText(monthNamePt),
    labelPt: `${monthNamePt}/${year}`
  };
}

export interface MonthlyPaymentVerificationResult {
  isPaidForCurrentMonth: boolean;
  isExempt: boolean;
  hasPendingApproval: boolean;
  currentMonthLabel: string;
  reason: string;
  amountDue?: number;
}

function textMatchesMonth(text: string | undefined, monthInfo: CurrentMonthInfo): boolean {
  if (!text) return false;
  const norm = normalizeText(text);
  const shortMonth = monthInfo.monthNameNormalized.slice(0, 3);
  const yearStr = String(monthInfo.year);
  return (
    norm.includes(`${monthInfo.monthNameNormalized}/${yearStr}`) ||
    norm.includes(`${monthInfo.monthNameNormalized} ${yearStr}`) ||
    norm.includes(`${monthInfo.monthNameNormalized} de ${yearStr}`) ||
    norm.includes(`${monthInfo.monthNumberPadded}/${yearStr}`) ||
    norm.includes(`${yearStr}-${monthInfo.monthNumberPadded}`) ||
    (norm.includes(monthInfo.monthNameNormalized) && (!/20\d{2}/.test(norm) || norm.includes(yearStr))) ||
    (norm.includes(`${shortMonth}/${yearStr}`))
  );
}

/**
 * Verifica se o aluno tem a mensalidade do mês corrente paga/regularizada
 * dentro da instituição ativa.
 */
export function checkStudentMonthlyPaymentStatus(params: {
  student: Student;
  activeInstitution?: Institution | null;
  courses: Course[];
  paymentRecords: PaymentRecord[];
  contasReceber: ContaReceber[];
  now?: Date;
}): MonthlyPaymentVerificationResult {
  const { student, activeInstitution, courses, paymentRecords, contasReceber, now = new Date() } = params;
  const monthInfo = getCurrentMonthInfo(now);
  const instId = activeInstitution?.id || student.institutionId;

  // 1. Verificar curso do aluno (se houver isenção explícita de mensalidade)
  const studentCourse = courses.find(
    c =>
      (!instId || c.institutionId === instId) &&
      (c.id === student.courseId || normalizeText(c.name) === normalizeText(student.courseName || ''))
  );
  const courseMonthlyFee =
    studentCourse?.monthlyFee ?? studentCourse?.feeMonthly;
  const isCourseExplicitlyFree = courseMonthlyFee !== undefined && courseMonthlyFee <= 0;

  // 2. Contas a Receber do aluno na instituição referentes a mensalidade/propina do mês corrente
  const studentReceivables = contasReceber.filter(
    c =>
      (!instId || c.institutionId === instId) &&
      (c.studentId === student.id || (c.studentCode && c.studentCode === student.code)) &&
      c.status !== 'cancelado'
  );

  const monthlyReceivables = studentReceivables.filter(c => {
    const desc = normalizeText(`${c.category || ''} ${c.description || ''} ${c.title || ''}`);
    return (
      c.category === 'mensalidade' ||
      c.category === 'propina' ||
      desc.includes('mensalidade') ||
      desc.includes('propina')
    );
  });

  const currentMonthReceivables = monthlyReceivables.filter(c => {
    const dueMatch = Boolean(c.dueDate && c.dueDate.startsWith(monthInfo.yearMonth));
    const payDateMatch = Boolean(c.paymentDate && c.paymentDate.startsWith(monthInfo.yearMonth));
    const textMatch =
      textMatchesMonth(c.description, monthInfo) ||
      textMatchesMonth(c.title, monthInfo) ||
      textMatchesMonth(c.notes, monthInfo);
    return dueMatch || payDateMatch || textMatch;
  });

  const unpaidCurrentReceivable = currentMonthReceivables.find(
    c => c.status === 'pendente' || c.status === 'atrasado' || c.status === 'parcial'
  );
  if (unpaidCurrentReceivable) {
    const total = unpaidCurrentReceivable.totalAmount ?? unpaidCurrentReceivable.amount ?? 0;
    const paid = unpaidCurrentReceivable.paidAmount ?? 0;
    const due = Math.max(0, total - paid);
    return {
      isPaidForCurrentMonth: false,
      isExempt: false,
      hasPendingApproval: false,
      currentMonthLabel: monthInfo.labelPt,
      amountDue: due || total,
      reason: `Mensalidade de ${monthInfo.labelPt} ${
        unpaidCurrentReceivable.status === 'atrasado' ? 'em atraso' : 'por pagar'
      }${due > 0 ? ` (${due.toLocaleString('pt-MZ')} MT)` : ''}.`
    };
  }

  const hasPaidCurrentReceivable = currentMonthReceivables.some(c => c.status === 'pago');

  // 3. Registos de pagamento do portal financeiro (PaymentRecord)
  const studentPayments = paymentRecords.filter(
    p =>
      (!instId || !p.institutionId || p.institutionId === instId) &&
      (p.studentId === student.id || (p.studentCode && p.studentCode === student.code))
  );

  const monthlyPaymentsCurrentMonth = studentPayments.filter(p => {
    const desc = normalizeText(`${p.serviceItem || ''} ${p.feeType || ''} ${p.serviceDescription || ''}`);
    const isMonthly =
      p.serviceItem === 'mensalidade' || desc.includes('mensalidade') || desc.includes('propina');
    if (!isMonthly) return false;
    const matchesRef =
      textMatchesMonth(p.monthReference, monthInfo) ||
      textMatchesMonth(p.serviceDescription, monthInfo) ||
      Boolean(p.date && p.date.startsWith(monthInfo.yearMonth));
    return matchesRef;
  });

  const hasApprovedCurrentPayment = monthlyPaymentsCurrentMonth.some(p => p.status === 'PAGO');
  const hasPendingApproval = monthlyPaymentsCurrentMonth.some(
    p => p.status === 'PENDENTE DE CONFIRMAÇÃO' || p.status === 'CORREÇÃO SOLICITADA'
  );

  // 4. Recibos emitidos no cadastro do aluno
  const hasCurrentMonthReceipt = (student.receipts || []).some(r => {
    if (r.status !== 'Emitido') return false;
    const desc = normalizeText(r.description || '');
    const isMonthlyOrTuition = desc.includes('mensalidade') || desc.includes('propina');
    if (!isMonthlyOrTuition) return false;
    return (
      Boolean(r.date && r.date.startsWith(monthInfo.yearMonth)) ||
      textMatchesMonth(r.description, monthInfo)
    );
  });

  if (hasPaidCurrentReceivable || hasApprovedCurrentPayment || hasCurrentMonthReceipt) {
    return {
      isPaidForCurrentMonth: true,
      isExempt: false,
      hasPendingApproval: false,
      currentMonthLabel: monthInfo.labelPt,
      reason: `Mensalidade de ${monthInfo.labelPt} confirmada e paga.`
    };
  }

  // 5. Curso explicitamente sem mensalidade (ex: curso gratuito/isento)
  if (isCourseExplicitlyFree && student.paymentStatus !== 'Atrasado') {
    return {
      isPaidForCurrentMonth: true,
      isExempt: true,
      hasPendingApproval: false,
      currentMonthLabel: monthInfo.labelPt,
      reason: `Curso sem mensalidade / aluno isento no mês de ${monthInfo.labelPt}.`
    };
  }

  // 6. Estado financeiro consolidado do aluno (quando não há conta específica do mês lançada)
  const rawStatus = normalizeText(student.paymentStatus || '');
  if (rawStatus === 'atrasado' || rawStatus === 'pendente' || rawStatus === 'inadimplente') {
    return {
      isPaidForCurrentMonth: false,
      isExempt: false,
      hasPendingApproval,
      currentMonthLabel: monthInfo.labelPt,
      amountDue: student.balanceOwing && student.balanceOwing > 0 ? student.balanceOwing : courseMonthlyFee,
      reason: hasPendingApproval
        ? `Pagamento da mensalidade de ${monthInfo.labelPt} submetido e a aguardar validação da Tesouraria.`
        : `Mensalidade de ${monthInfo.labelPt} não paga (estado financeiro: ${student.paymentStatus}).`
    };
  }

  if (rawStatus === 'pago' || rawStatus === 'regularizado' || rawStatus === 'isento') {
    return {
      isPaidForCurrentMonth: true,
      isExempt: rawStatus === 'isento',
      hasPendingApproval: false,
      currentMonthLabel: monthInfo.labelPt,
      reason: `Mensalidade de ${monthInfo.labelPt} em dia (${student.paymentStatus}).`
    };
  }

  if ((student.balanceOwing ?? 0) > 0) {
    return {
      isPaidForCurrentMonth: false,
      isExempt: false,
      hasPendingApproval,
      currentMonthLabel: monthInfo.labelPt,
      amountDue: student.balanceOwing,
      reason: `Saldo pendente de ${(student.balanceOwing ?? 0).toLocaleString('pt-MZ')} MT no mês de ${monthInfo.labelPt}.`
    };
  }

  return {
    isPaidForCurrentMonth: true,
    isExempt: false,
    hasPendingApproval: false,
    currentMonthLabel: monthInfo.labelPt,
    reason: `Situação financeira regularizada para ${monthInfo.labelPt}.`
  };
}

/**
 * Formata um número de telefone moçambicano ou internacional para link wa.me.
 */
export function formatWhatsAppPhone(phone?: string | null): string {
  if (!phone) return '';
  let digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  // Moçambique: números móveis de 9 dígitos começados por 82, 83, 84, 85, 86, 87
  if (digits.length === 9 && digits.startsWith('8')) {
    digits = `258${digits}`;
  }
  return digits;
}

export function getStudentGuardianContact(student: Student): {
  guardianName: string;
  guardianPhone: string;
} {
  return {
    guardianName: student.guardianName?.trim() || 'Encarregado(a) de Educação',
    guardianPhone: (student.guardianPhone || student.emergencyContact || student.phone || '').trim()
  };
}

export function buildWhatsAppUrl(phone?: string | null, message?: string): string | null {
  const digits = formatWhatsAppPhone(phone);
  if (!digits) return null;
  const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${textParam}`;
}

export function buildGateWhatsAppMessage(params: {
  action: 'entrada' | 'saida' | 'barrado';
  student: Student;
  institution?: Institution | null;
  timeStr: string;
  monthLabel?: string;
}): string {
  const { action, student, institution, timeStr, monthLabel } = params;
  const centerName =
    (institution ? resolveInstitutionIdentity(institution).officialName : '') ||
    institution?.name ||
    'Instituição de Ensino';
  const { guardianName } = getStudentGuardianContact(student);
  const monthText = monthLabel || getCurrentMonthInfo().labelPt;

  if (action === 'entrada') {
    return `Olá ${guardianName}, informamos que o(a) aluno(a) ${student.fullName} (${student.code}) do centro ${centerName} ENTROU às ${timeStr}.`;
  }
  if (action === 'saida') {
    return `Olá ${guardianName}, informamos que o(a) aluno(a) ${student.fullName} (${student.code}) do centro ${centerName} SAIU às ${timeStr}.`;
  }
  return `Olá ${guardianName}, informamos que o(a) aluno(a) ${student.fullName} (${student.code}) do centro ${centerName} foi BARRADO(A) NA PORTA às ${timeStr}. Motivo: falta de pagamento da mensalidade referente ao mês de ${monthText}.`;
}

/**
 * Extrai e localiza o aluno estritamente na instituição ativa a partir de QR Code ou busca manual.
 */
export function parseStudentQrPayload(
  rawText: string,
  students: Student[],
  institutionId: string,
  options?: { allowNameFallback?: boolean }
): { student: Student | null; extractedToken: string; errorReason?: string } {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { student: null, extractedToken: '', errorReason: 'Código QR vazio.' };
  }

  const instStudents = institutionId
    ? students.filter(s => s.institutionId === institutionId)
    : [];

  let candidateTokens: string[] = [trimmed];

  // 1. Tentar JSON (ex: { code, studentCode, studentId, id, hash })
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const fields = [
        parsed.code,
        parsed.studentCode,
        parsed.studentId,
        parsed.id,
        parsed.hash,
        parsed.qrVerificationHash
      ];
      fields.forEach(f => {
        if (typeof f === 'string' && f.trim()) {
          candidateTokens.unshift(f.trim());
        }
      });
    } catch {
      // Ignorar se não for JSON válido
    }
  }

  // 2. Tentar URL com query params (?scan_aluno=..., ?code=..., ?aluno=...) ou path (/aluno/...)
  try {
    if (trimmed.includes('://') || trimmed.includes('?') || trimmed.includes('=')) {
      const asUrl = new URL(trimmed.startsWith('http') ? trimmed : `https://sigar.local/${trimmed.replace(/^\/+/, '')}`);
      const paramKeys = ['scan_aluno', 'code', 'aluno', 'studentCode', 'studentId', 'id'];
      paramKeys.forEach(key => {
        const val = asUrl.searchParams.get(key);
        if (val && val.trim()) {
          candidateTokens.unshift(decodeURIComponent(val.trim()));
        }
      });
      const pathParts = asUrl.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        candidateTokens.push(decodeURIComponent(pathParts[pathParts.length - 1]));
      }
    }
  } catch {
    // Seguir para comparação direta
  }

  const uniqueTokens = Array.from(new Set(candidateTokens.map(t => t.trim()).filter(Boolean)));
  const primaryToken = uniqueTokens[0] || trimmed;

  // 3. Correspondência exata por código, ID, número ou hash SIVERC
  for (const token of uniqueTokens) {
    const upper = token.toUpperCase();
    const exactMatch = instStudents.find(s => {
      const hash = generateStudentQrHash(s.id, s.code, s.institutionId || institutionId).toUpperCase();
      return (
        s.code.toUpperCase() === upper ||
        s.id.toUpperCase() === upper ||
        (s.studentNumber && s.studentNumber.toUpperCase() === upper) ||
        (s.codigo && s.codigo.toUpperCase() === upper) ||
        (s.codigoAcesso && s.codigoAcesso.toUpperCase() === upper) ||
        hash === upper
      );
    });
    if (exactMatch) {
      return { student: exactMatch, extractedToken: token };
    }
  }

  // 4. Correspondência parcial quando o QR contém um texto mais longo com o código do aluno
  for (const token of uniqueTokens) {
    const upper = token.toUpperCase();
    const containedMatch = instStudents.find(
      s =>
        (s.code && upper.includes(s.code.toUpperCase())) ||
        (s.id && s.id.length >= 4 && upper.includes(s.id.toUpperCase()))
    );
    if (containedMatch) {
      return { student: containedMatch, extractedToken: token };
    }
  }

  // 5. Fallback por BI ou nome (para pesquisa manual na portaria)
  if (options?.allowNameFallback) {
    const upper = primaryToken.toUpperCase();
    const byDoc = instStudents.find(
      s => s.documentNumber && s.documentNumber.toUpperCase() === upper
    );
    if (byDoc) {
      return { student: byDoc, extractedToken: primaryToken };
    }

    const normQuery = normalizeText(primaryToken);
    if (normQuery.length >= 2) {
      const byName = instStudents.find(s => normalizeText(s.fullName).includes(normQuery));
      if (byName) {
        return { student: byName, extractedToken: primaryToken };
      }
    }
  }

  return {
    student: null,
    extractedToken: primaryToken,
    errorReason: `Nenhum aluno desta instituição foi encontrado para o código "${primaryToken}".`
  };
}
