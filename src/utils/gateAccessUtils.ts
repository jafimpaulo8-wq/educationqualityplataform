import { Student, Course, ContaReceber, PaymentRecord } from '../types';
import {
  generateStudentQrHash,
  verifySignedStudentQrToken,
  SIGAR_QR_PREFIX,
} from './studentQrSecurity';

export const MAPUTO_TIMEZONE = 'Africa/Maputo';

export interface MonthlyPaymentCheckResult {
  isPaidForCurrentMonth: boolean;
  isExempt: boolean;
  monthLabel: string;
  monthKey: string; // YYYY-MM
  statusLabel: string;
  reason: string;
  warningNote?: string;
  pendingAmount: number;
  paidAmount: number;
  expectedMonthlyFee: number;
  matchedReceivableId?: string;
  matchedPaymentId?: string;
  paymentState?:
    | 'pago'
    | 'isento'
    | 'pendente'
    | 'atrasado'
    | 'aguardando_aprovacao'
    | 'rejeitado'
    | 'parcial'
    | 'sem_comprovativo';
  priorOverdueCount?: number;
  priorOverdueAmount?: number;
}

export interface GuardianContactInfo {
  guardianName: string;
  guardianPhone: string;
  cleanedWhatsAppPhone: string;
  hasValidPhone: boolean;
}

export interface QrResolutionResult {
  student: Student | null;
  status:
    | 'matched'
    | 'invalid_empty'
    | 'tampered'
    | 'expired'
    | 'wrong_institution'
    | 'not_found';
  reason: string;
  requiresServerVerification?: boolean;
}

const MONTH_NAMES_PT = [
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
  'Dezembro',
];

const MONTH_ALIASES_PT: Record<number, string[]> = {
  1: ['jan', 'janeiro'],
  2: ['fev', 'fevereiro'],
  3: ['mar', 'março', 'marco'],
  4: ['abr', 'abril'],
  5: ['mai', 'maio'],
  6: ['jun', 'junho'],
  7: ['jul', 'julho'],
  8: ['ago', 'agosto'],
  9: ['set', 'setembro'],
  10: ['out', 'outubro'],
  11: ['nov', 'novembro'],
  12: ['dez', 'dezembro'],
};

/**
 * Obtém data/hora corrente explicitamente no fuso horário de Moçambique (Africa/Maputo).
 */
export function getMaputoDateTimeInfo(date: Date = new Date()): {
  isoDate: string; // YYYY-MM-DD
  ddMmYyyy: string; // DD/MM/YYYY
  timeStr: string; // HH:mm:ss
  monthKey: string; // YYYY-MM
  year: number;
  month: number; // 1..12
  day: number;
  monthLabel: string;
} {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: MAPUTO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
  const yearStr = getPart('year');
  const monthStr = getPart('month');
  const dayStr = getPart('day');
  const hourStr = getPart('hour') === '24' ? '00' : getPart('hour');
  const minStr = getPart('minute');
  const secStr = getPart('second');

  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  return {
    isoDate: `${yearStr}-${monthStr}-${dayStr}`,
    ddMmYyyy: `${dayStr}/${monthStr}/${yearStr}`,
    timeStr: `${hourStr}:${minStr}:${secStr}`,
    monthKey: `${yearStr}-${monthStr}`,
    year,
    month,
    day,
    monthLabel: `${MONTH_NAMES_PT[Math.max(0, month - 1)] || 'Mês'} de ${year}`,
  };
}

/**
 * Retorna a referência do mês corrente no fuso horário Africa/Maputo (ex: "2026-09" e "Setembro de 2026").
 */
export function getCurrentMonthInfo(date: Date = new Date()): {
  monthKey: string;
  year: number;
  month: number;
  monthName: string;
  monthLabel: string;
} {
  const info = getMaputoDateTimeInfo(date);
  return {
    monthKey: info.monthKey,
    year: info.year,
    month: info.month,
    monthName: MONTH_NAMES_PT[info.month - 1] || 'Mês',
    monthLabel: info.monthLabel,
  };
}

/**
 * Converte strings de data ("YYYY-MM-DD", "DD/MM/YYYY", "YYYY/MM/DD", "DD-MM-YYYY", ISO) para "YYYY-MM-DD".
 */
export function normalizeDateToIso(raw?: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;

  const isoMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const ymMatch = s.match(/^(\d{4})[-/](\d{1,2})$/);
  if (ymMatch) {
    const [, y, m] = ymMatch;
    return `${y}-${m.padStart(2, '0')}-01`;
  }

  return null;
}

/**
 * Verifica se uma data ou texto de referência pertence ao mês alvo ("YYYY-MM").
 */
export function matchesMonthDateOrReference(
  value: string | undefined,
  monthKey: string,
  year: number,
  month: number
): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  const iso = normalizeDateToIso(trimmed);
  if (iso && iso.startsWith(monthKey)) {
    return true;
  }

  const lower = trimmed.toLowerCase();
  const aliases = MONTH_ALIASES_PT[month] || [];
  const monthPadded = String(month).padStart(2, '0');
  const yearStr = String(year);

  if (lower.includes(monthKey) || lower.includes(`${yearStr}/${monthPadded}`) || lower.includes(`${monthPadded}/${yearStr}`)) {
    return true;
  }

  return aliases.some(alias => lower.includes(alias) && lower.includes(yearStr));
}

function isMonthlyFeeReceivable(r: ContaReceber): boolean {
  const cat = (r.category || '').toLowerCase();
  const desc = (r.description || r.title || '').toLowerCase();
  return (
    cat === 'mensalidade' ||
    cat === 'propina' ||
    desc.includes('mensalidade') ||
    desc.includes('propina')
  );
}

function isMonthlyFeePaymentRecord(p: PaymentRecord): boolean {
  const svc = (p.serviceItem || '').toLowerCase();
  const feeType = (p.feeType || '').toLowerCase();
  const desc = (p.serviceDescription || '').toLowerCase();
  return (
    svc === 'mensalidade' ||
    svc === 'propina' ||
    feeType === 'mensalidade' ||
    feeType === 'propina' ||
    desc.includes('mensalidade') ||
    desc.includes('propina') ||
    !p.serviceItem
  );
}

/**
 * Verifica de forma rigorosa se o aluno está regularizado na mensalidade do mês corrente.
 * Corrige todas as falhas auditadas:
 *  - Verifica pagamento submetido (PENDENTE DE CONFIRMAÇÃO) e REJEITADO mesmo quando existe conta a receber pendente;
 *  - Soma pagamentos parciais aprovados no mês corrente;
 *  - Suporta datas DD/MM/YYYY, YYYY/MM/DD e YYYY-MM-DD;
 *  - Não aceita student.paymentStatus='Pago'/'Regularizado' sem prova financeira do mês quando o curso tem mensalidade > 0;
 *  - Verifica validade (exemptUntil) em isenções/bolsas;
 *  - Dívidas de meses anteriores não bloqueiam se o mês corrente estiver comprovadamente pago (apenas emitem nota de alerta).
 */
export function checkStudentMonthlyPaymentStatus(
  student: Student,
  courses: Course[],
  receivables: ContaReceber[],
  paymentRecords: PaymentRecord[],
  referenceDate: Date = new Date()
): MonthlyPaymentCheckResult {
  const maputoNow = getMaputoDateTimeInfo(referenceDate);
  const { monthKey, year, month, monthLabel, isoDate } = maputoNow;

  // 1. Verificar Isenção Financeira ou Bolsa Integral (com verificação de validade)
  const paymentStatusLower = (student.paymentStatus || '').toLowerCase();
  const studentStatusLower = (student.status || '').toLowerCase();
  const notesLower = (student.notes || '').toLowerCase();
  const hasExemptionFlag =
    Boolean(student.isFinancialExempt) ||
    paymentStatusLower.includes('isento') ||
    paymentStatusLower.includes('bolsa') ||
    paymentStatusLower.includes('gratuito') ||
    studentStatusLower.includes('bolsista') ||
    notesLower.includes('isento de mensalidade');

  if (hasExemptionFlag) {
    const exemptUntilIso = normalizeDateToIso(student.exemptUntil);
    if (exemptUntilIso && exemptUntilIso < isoDate) {
      // Isenção expirada: prosseguir para validação financeira normal
    } else {
      return {
        isPaidForCurrentMonth: true,
        isExempt: true,
        monthLabel,
        monthKey,
        statusLabel: 'Isento / Bolsista',
        reason: exemptUntilIso
          ? `Aluno com isenção válida até ${exemptUntilIso} em ${monthLabel}.`
          : `Aluno com isenção financeira / bolsa válida em ${monthLabel}.`,
        pendingAmount: 0,
        paidAmount: 0,
        expectedMonthlyFee: 0,
        paymentState: 'isento',
      };
    }
  }

  // Determinar o valor da mensalidade do curso do aluno
  const studentCourse = courses.find(
    c =>
      c.id === student.courseId ||
      (student.courseName && c.name?.toLowerCase() === student.courseName.toLowerCase())
  );
  const courseMonthlyFee = Number(studentCourse?.monthlyFee ?? studentCourse?.feeMonthly ?? 0);

  // Isolamento multi-instituição explícito nos registos financeiros
  const instId = student.institutionId;

  const studentReceivables = receivables.filter(
    r =>
      (!instId || !r.institutionId || r.institutionId === instId) &&
      (r.studentId === student.id ||
        (r.studentCode && student.code && r.studentCode.toUpperCase() === student.code.toUpperCase())) &&
      r.status !== 'cancelado'
  );

  const studentPayments = paymentRecords.filter(
    p =>
      (!instId || !p.institutionId || p.institutionId === instId) &&
      (p.studentId === student.id ||
        (p.studentCode && student.code && p.studentCode.toUpperCase() === student.code.toUpperCase()))
  );

  // Calcular mensalidades em atraso de meses ANTERIORES ao mês corrente (informativo — não bloqueia se mês corrente pago)
  const priorOverdueReceivables = studentReceivables.filter(r => {
    if (!isMonthlyFeeReceivable(r)) return false;
    if (r.status === 'pago') return false;
    const dueIso = normalizeDateToIso(r.dueDate);
    if (!dueIso) return false;
    return dueIso.slice(0, 7) < monthKey;
  });
  const priorOverdueCount = priorOverdueReceivables.length;
  const priorOverdueAmount = priorOverdueReceivables.reduce((sum, r) => {
    const total = Number(r.totalAmount ?? r.amount ?? 0);
    const paid = Number(r.paidAmount ?? 0);
    return sum + Math.max(0, total - paid);
  }, 0);
  const priorWarning =
    priorOverdueCount > 0
      ? `Nota financeira: ${priorOverdueCount} mensalidade(s) de meses anteriores por regularizar (${priorOverdueAmount.toLocaleString('pt-MZ')} MT).`
      : undefined;

  // 2. Filtrar contas a receber (receivables) do mês corrente
  const currentMonthReceivables = studentReceivables.filter(
    r =>
      isMonthlyFeeReceivable(r) &&
      (matchesMonthDateOrReference(r.dueDate, monthKey, year, month) ||
        matchesMonthDateOrReference(r.description, monthKey, year, month) ||
        matchesMonthDateOrReference(r.title, monthKey, year, month))
  );

  // 3. Filtrar pagamentos submetidos (PaymentRecords) do mês corrente
  const currentMonthPayments = studentPayments.filter(
    p =>
      isMonthlyFeePaymentRecord(p) &&
      (matchesMonthDateOrReference(p.monthReference, monthKey, year, month) ||
        matchesMonthDateOrReference(p.date, monthKey, year, month) ||
        matchesMonthDateOrReference(p.createdAt, monthKey, year, month) ||
        matchesMonthDateOrReference(p.serviceDescription, monthKey, year, month))
  );

  // Verificar recibos emitidos no perfil do aluno referentes ao mês corrente
  const currentMonthReceipts = (student.receipts || []).filter(
    rec =>
      rec.status === 'Emitido' &&
      (matchesMonthDateOrReference(rec.date, monthKey, year, month) ||
        matchesMonthDateOrReference(rec.description, monthKey, year, month))
  );

  // 4. Calcular valores pagos vs esperados no mês corrente
  const approvedPaymentsCurrentMonth = currentMonthPayments.filter(p => p.status === 'PAGO');
  const pendingApprovalPayment = currentMonthPayments.find(p => p.status === 'PENDENTE DE CONFIRMAÇÃO');
  const rejectedPayment = currentMonthPayments.find(
    p => p.status === 'REJEITADO' || p.status === 'CORREÇÃO SOLICITADA'
  );

  const paidFromApprovedRecords = approvedPaymentsCurrentMonth.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const paidFromReceipts = currentMonthReceipts.reduce((sum, rec) => sum + Number(rec.amount || 0), 0);

  const paidReceivable = currentMonthReceivables.find(r => r.status === 'pago');
  const unpaidCurrentReceivable = currentMonthReceivables.find(
    r => r.status === 'pendente' || r.status === 'atrasado' || r.status === 'parcial'
  );

  const receivablePaidAmount = currentMonthReceivables.reduce((sum, r) => {
    if (r.status === 'pago') {
      return sum + Number(r.totalAmount ?? r.amount ?? 0);
    }
    return sum + Number(r.paidAmount ?? 0);
  }, 0);

  // Evitar dupla contagem entre receivable.paidAmount e paymentRecords caso ambos existam; considerar o maior comprovado
  const totalPaidCurrentMonth = Math.max(paidFromApprovedRecords, receivablePaidAmount, paidFromReceipts);
  const expectedAmount =
    Number(
      paidReceivable?.totalAmount ??
        paidReceivable?.amount ??
        unpaidCurrentReceivable?.totalAmount ??
        unpaidCurrentReceivable?.amount ??
        courseMonthlyFee
    ) || 0;

  // 5A. Se há conta a receber explicitamente paga (e quitada integralmente)
  if (paidReceivable && (!unpaidCurrentReceivable || totalPaidCurrentMonth >= expectedAmount)) {
    const amt = Number(paidReceivable.totalAmount ?? paidReceivable.amount ?? courseMonthlyFee);
    return {
      isPaidForCurrentMonth: true,
      isExempt: false,
      monthLabel,
      monthKey,
      statusLabel: 'Mensalidade Paga',
      reason: `Mensalidade de ${monthLabel} regularizada (${amt.toLocaleString('pt-MZ')} MT).`,
      warningNote: priorWarning,
      pendingAmount: 0,
      paidAmount: amt,
      expectedMonthlyFee: expectedAmount,
      matchedReceivableId: paidReceivable.id,
      paymentState: 'pago',
      priorOverdueCount,
      priorOverdueAmount,
    };
  }

  // 5B. Se há pagamentos aprovados (inclusive múltiplos parciais) que quitam o valor esperado do mês
  if (approvedPaymentsCurrentMonth.length > 0 && (expectedAmount <= 0 || totalPaidCurrentMonth >= expectedAmount)) {
    return {
      isPaidForCurrentMonth: true,
      isExempt: false,
      monthLabel,
      monthKey,
      statusLabel: 'Mensalidade Paga',
      reason: `Pagamento(s) aprovado(s) da mensalidade de ${monthLabel} (${totalPaidCurrentMonth.toLocaleString('pt-MZ')} MT).`,
      warningNote: priorWarning,
      pendingAmount: 0,
      paidAmount: totalPaidCurrentMonth,
      expectedMonthlyFee: expectedAmount,
      matchedPaymentId: approvedPaymentsCurrentMonth[0].id,
      paymentState: 'pago',
      priorOverdueCount,
      priorOverdueAmount,
    };
  }

  // 5C. Se há recibo emitido no mês corrente que cobre o valor esperado
  if (currentMonthReceipts.length > 0 && (expectedAmount <= 0 || paidFromReceipts >= expectedAmount)) {
    return {
      isPaidForCurrentMonth: true,
      isExempt: false,
      monthLabel,
      monthKey,
      statusLabel: 'Mensalidade Paga (Recibo)',
      reason: `Recibo emitido referente a ${monthLabel} (${paidFromReceipts.toLocaleString('pt-MZ')} MT).`,
      warningNote: priorWarning,
      pendingAmount: 0,
      paidAmount: paidFromReceipts,
      expectedMonthlyFee: expectedAmount,
      paymentState: 'pago',
      priorOverdueCount,
      priorOverdueAmount,
    };
  }

  // 6. Verificar estados pendentes de aprovação / rejeitados ANTES de falhar apenas como pendente genérico
  if (pendingApprovalPayment) {
    return {
      isPaidForCurrentMonth: false,
      isExempt: false,
      monthLabel,
      monthKey,
      statusLabel: 'Aguarda Aprovação Financeira',
      reason: `Pagamento de ${monthLabel} submetido (${pendingApprovalPayment.network || 'Comprovativo'}), mas ainda NÃO aprovado pela secretaria/financeiro.`,
      pendingAmount: Math.max(0, expectedAmount - totalPaidCurrentMonth),
      paidAmount: totalPaidCurrentMonth,
      expectedMonthlyFee: expectedAmount,
      matchedPaymentId: pendingApprovalPayment.id,
      matchedReceivableId: unpaidCurrentReceivable?.id,
      paymentState: 'aguardando_aprovacao',
      priorOverdueCount,
      priorOverdueAmount,
    };
  }

  if (rejectedPayment) {
    return {
      isPaidForCurrentMonth: false,
      isExempt: false,
      monthLabel,
      monthKey,
      statusLabel:
        rejectedPayment.status === 'CORREÇÃO SOLICITADA'
          ? 'Correção Solicitada no Pagamento'
          : 'Pagamento Rejeitado',
      reason: `O pagamento submetido para ${monthLabel} foi rejeitado${rejectedPayment.rejectionReason ? ` (${rejectedPayment.rejectionReason})` : ''}. Regularize na tesouraria.`,
      pendingAmount: Math.max(0, expectedAmount - totalPaidCurrentMonth),
      paidAmount: totalPaidCurrentMonth,
      expectedMonthlyFee: expectedAmount,
      matchedPaymentId: rejectedPayment.id,
      matchedReceivableId: unpaidCurrentReceivable?.id,
      paymentState: 'rejeitado',
      priorOverdueCount,
      priorOverdueAmount,
    };
  }

  // 7. Pagamento parcial (algum valor pago no mês corrente, mas inferior ao exigido)
  if (totalPaidCurrentMonth > 0 && expectedAmount > 0 && totalPaidCurrentMonth < expectedAmount) {
    const remaining = Math.max(0, expectedAmount - totalPaidCurrentMonth);
    return {
      isPaidForCurrentMonth: false,
      isExempt: false,
      monthLabel,
      monthKey,
      statusLabel: 'Mensalidade Parcial',
      reason: `Mensalidade de ${monthLabel} paga parcialmente (${totalPaidCurrentMonth.toLocaleString('pt-MZ')} MT de ${expectedAmount.toLocaleString('pt-MZ')} MT; faltam ${remaining.toLocaleString('pt-MZ')} MT).`,
      pendingAmount: remaining,
      paidAmount: totalPaidCurrentMonth,
      expectedMonthlyFee: expectedAmount,
      matchedReceivableId: unpaidCurrentReceivable?.id,
      paymentState: 'parcial',
      priorOverdueCount,
      priorOverdueAmount,
    };
  }

  // 8. Conta a receber pendente / atrasada no mês corrente
  if (unpaidCurrentReceivable) {
    const totalDue = Number(unpaidCurrentReceivable.totalAmount ?? unpaidCurrentReceivable.amount ?? courseMonthlyFee);
    const remaining = Math.max(0, totalDue - totalPaidCurrentMonth);
    return {
      isPaidForCurrentMonth: false,
      isExempt: false,
      monthLabel,
      monthKey,
      statusLabel: unpaidCurrentReceivable.status === 'atrasado' ? 'Mensalidade Atrasada' : 'Mensalidade Pendente',
      reason: `Mensalidade de ${monthLabel} não paga (${remaining.toLocaleString('pt-MZ')} MT em aberto).`,
      pendingAmount: remaining,
      paidAmount: totalPaidCurrentMonth,
      expectedMonthlyFee: expectedAmount,
      matchedReceivableId: unpaidCurrentReceivable.id,
      paymentState: unpaidCurrentReceivable.status === 'atrasado' ? 'atrasado' : 'pendente',
      priorOverdueCount,
      priorOverdueAmount,
    };
  }

  // 9. Se o curso não cobra mensalidade (courseMonthlyFee === 0) e não há cobrança aberta para o mês
  if (courseMonthlyFee <= 0 && !paymentStatusLower.includes('atrasad') && !paymentStatusLower.includes('pendente')) {
    return {
      isPaidForCurrentMonth: true,
      isExempt: false,
      monthLabel,
      monthKey,
      statusLabel: 'Sem Mensalidade Aplicável',
      reason: `Curso sem mensalidade configurada para ${monthLabel}.`,
      warningNote: priorWarning,
      pendingAmount: 0,
      paidAmount: 0,
      expectedMonthlyFee: 0,
      paymentState: 'pago',
      priorOverdueCount,
      priorOverdueAmount,
    };
  }

  // 10. Curso com mensalidade > 0, mas SEM prova financeira do mês corrente:
  // NÃO confiar em student.paymentStatus === 'Pago' / 'Regularizado' sem comprovativo real do mês corrente!
  return {
    isPaidForCurrentMonth: false,
    isExempt: false,
    monthLabel,
    monthKey,
    statusLabel: 'Sem Comprovativo do Mês Corrente',
    reason: `Não foi encontrado pagamento aprovado ou recibo da mensalidade de ${monthLabel} (${courseMonthlyFee.toLocaleString('pt-MZ')} MT). Regularize na secretaria.`,
    pendingAmount: courseMonthlyFee,
    paidAmount: 0,
    expectedMonthlyFee: courseMonthlyFee,
    paymentState: 'sem_comprovativo',
    priorOverdueCount,
    priorOverdueAmount,
  };
}

/**
 * Normaliza telefone moçambicano para link wa.me (258 + 9 dígitos).
 */
export function normalizeMozambiqueWhatsAppPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('258') && digits.length >= 12) return digits;
  if (digits.startsWith('00258') && digits.length >= 14) return digits.slice(2);
  if (digits.length === 9 && (digits.startsWith('8') || digits.startsWith('2'))) {
    return `258${digits}`;
  }
  return digits;
}

/**
 * Extrai estritamente o contacto do encarregado de educação ou contacto de emergência.
 * NUNCA faz fallback para student.phone (número do próprio aluno).
 */
export function getStudentGuardianContact(student: Student): GuardianContactInfo {
  const guardianName = (student.guardianName || '').trim() || 'Encarregado de Educação';
  const rawPhone = (student.guardianPhone || student.emergencyContact || '').trim();
  const cleanedWhatsAppPhone = normalizeMozambiqueWhatsAppPhone(rawPhone);
  return {
    guardianName,
    guardianPhone: rawPhone,
    cleanedWhatsAppPhone,
    hasValidPhone: cleanedWhatsAppPhone.length >= 9,
  };
}

/**
 * Constrói mensagem oficial e link wa.me para o encarregado.
 */
export function buildGateWhatsAppNotification(params: {
  student: Student;
  institutionName: string;
  action: 'entrada' | 'saida' | 'barrado';
  timeStr: string;
  monthLabel?: string;
  blockReason?: string;
}): {
  message: string;
  whatsappUrl: string | null;
  guardian: GuardianContactInfo;
} {
  const guardian = getStudentGuardianContact(params.student);
  const studentName = params.student.fullName || params.student.name || 'Aluno';
  const studentCode = params.student.code || 'N/A';
  const center = params.institutionName || 'Instituição de Ensino';

  let message = '';
  if (params.action === 'entrada') {
    message = `Olá ${guardian.guardianName}, informamos que o(a) aluno(a) *${studentName}* (${studentCode}) deu *ENTRADA* no centro *${center}* às *${params.timeStr}*.`;
  } else if (params.action === 'saida') {
    message = `Olá ${guardian.guardianName}, informamos que o(a) aluno(a) *${studentName}* (${studentCode}) registou *SAÍDA* do centro *${center}* às *${params.timeStr}*.`;
  } else {
    const reasonText =
      params.blockReason ||
      `falta de pagamento da mensalidade do mês corrente (${params.monthLabel || getCurrentMonthInfo().monthLabel})`;
    message = `Olá ${guardian.guardianName}, informamos que o(a) aluno(a) *${studentName}* (${studentCode}) teve o acesso *BARRADO* na portaria do centro *${center}* às *${params.timeStr}* devido a: *${reasonText}*. Pedimos que regularize na secretaria.`;
  }

  const whatsappUrl = guardian.hasValidPhone
    ? `https://wa.me/${guardian.cleanedWhatsAppPhone}?text=${encodeURIComponent(message)}`
    : null;

  return {
    message,
    whatsappUrl,
    guardian,
  };
}

/**
 * Identifica um aluno da instituição activa a partir de qualquer QR Code lido.
 * Regras de segurança:
 *  - Elimina completamente `.includes()` / correspondência parcial (sem colisão CA-001 vs CA-0010);
 *  - Verifica integridade de token SIGAR-QR-V1 / JSON / URL e pertença à instituição;
 *  - Rejeita payloads adulterados, expirados ou de outra instituição;
 *  - Mantém compatibilidade estrita (comparação exata) para códigos puros e hashes legados válidos.
 */
export function resolveStudentFromQrPayload(
  rawPayload: string,
  institutionStudents: Student[],
  activeInstitutionId: string,
  allInstitutionsStudents: Student[] = institutionStudents
): QrResolutionResult {
  const trimmed = (rawPayload || '').trim();
  if (!trimmed) {
    return {
      student: null,
      status: 'invalid_empty',
      reason: 'Código QR vazio ou ilegível.',
    };
  }

  let candidateToken: string | undefined;
  let candidateCode: string | undefined;
  let candidateId: string | undefined;
  let candidateHash: string | undefined;
  let payloadInstitutionId: string | undefined;
  let isStructuredPayload = false;

  // 1. Tentar parse JSON estruturado (carteirinha v1 ou v2)
  if (trimmed.startsWith('{')) {
    isStructuredPayload = true;
    try {
      const parsed = JSON.parse(trimmed);
      candidateToken = typeof parsed.token === 'string' ? parsed.token.trim() : undefined;
      candidateCode = typeof parsed.code === 'string' ? parsed.code.trim() : undefined;
      candidateId = typeof parsed.id === 'string' ? parsed.id.trim() : undefined;
      candidateHash = typeof parsed.hash === 'string' ? parsed.hash.trim() : undefined;
      payloadInstitutionId = typeof parsed.inst === 'string' ? parsed.inst.trim() : undefined;
    } catch {
      return {
        student: null,
        status: 'tampered',
        reason: 'Payload JSON de QR Code malformado ou corrompido.',
      };
    }
  }

  // 2. Tentar token SIGAR-QR-V1 direto ou contido no JSON
  const tokenToVerify = candidateToken || (trimmed.startsWith(`${SIGAR_QR_PREFIX}:`) ? trimmed : undefined);
  if (tokenToVerify) {
    isStructuredPayload = true;
    const verification = verifySignedStudentQrToken(tokenToVerify, activeInstitutionId);
    if (!verification.valid) {
      return {
        student: null,
        status: verification.tampered
          ? 'tampered'
          : verification.expired
          ? 'expired'
          : verification.wrongInstitution
          ? 'wrong_institution'
          : 'tampered',
        reason: verification.reason || 'Token QR inválido ou rejeitado.',
        requiresServerVerification: verification.requiresServerVerification,
      };
    }

    const matchedByToken = institutionStudents.find(
      s =>
        s.institutionId === activeInstitutionId &&
        s.id === verification.studentId &&
        (s.code || '').toUpperCase() === (verification.studentCode || '').toUpperCase()
    );
    if (!matchedByToken) {
      return {
        student: null,
        status: 'not_found',
        reason: 'Token válido estruturalmente, mas o aluno não está ativo nesta instituição.',
        requiresServerVerification: true,
      };
    }
    return {
      student: matchedByToken,
      status: 'matched',
      reason: 'Identidade validada via token estruturado.',
      requiresServerVerification: true,
    };
  }

  // 3. Tentar URL com ?code=...&inst=...&hash=...
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    isStructuredPayload = true;
    try {
      const url = new URL(trimmed);
      candidateToken = url.searchParams.get('token')?.trim() || undefined;
      candidateCode = url.searchParams.get('code')?.trim() || url.searchParams.get('card')?.trim() || undefined;
      candidateId = url.searchParams.get('id')?.trim() || undefined;
      candidateHash = url.searchParams.get('hash')?.trim() || undefined;
      payloadInstitutionId = url.searchParams.get('inst')?.trim() || undefined;

      if (candidateToken) {
        return resolveStudentFromQrPayload(
          candidateToken,
          institutionStudents,
          activeInstitutionId,
          allInstitutionsStudents
        );
      }
    } catch {
      return {
        student: null,
        status: 'tampered',
        reason: 'URL de QR Code inválida ou adulterada.',
      };
    }
  }

  // Validar instituição explícita no payload antes de qualquer pesquisa
  if (payloadInstitutionId && activeInstitutionId && payloadInstitutionId !== activeInstitutionId) {
    return {
      student: null,
      status: 'wrong_institution',
      reason: `QR Code pertence a outra instituição (${payloadInstitutionId}). Acesso negado.`,
    };
  }

  // Se for payload JSON v1 com hash, verificar integridade exata do hash legado quando disponível
  if (isStructuredPayload && candidateHash && candidateId && candidateCode) {
    const expectedHash = generateStudentQrHash(
      candidateId,
      candidateCode.toUpperCase(),
      payloadInstitutionId || activeInstitutionId
    );
    if (candidateHash.toUpperCase() !== expectedHash.toUpperCase()) {
      return {
        student: null,
        status: 'tampered',
        reason: 'Assinatura/hash do QR Code adulterada. Leitura rejeitada.',
      };
    }
  }

  // 4. Comparação estritamente EXATA (sem .includes()) na instituição ativa
  const exactToken = (candidateCode || candidateId || trimmed).trim().toUpperCase();
  const exactHash = (candidateHash || (!isStructuredPayload ? trimmed : '')).trim().toUpperCase();

  const findExactInList = (list: Student[], instIdForHash: string): Student | undefined =>
    list.find(s => {
      const sCode = (s.code || '').trim().toUpperCase();
      const sId = (s.id || '').trim().toUpperCase();
      const sNumAluno = (s.numAluno || '').trim().toUpperCase();
      const sAccessCode = (s.codigoAcesso || '').trim().toUpperCase();

      if (candidateId && candidateCode) {
        if (s.id !== candidateId || sCode !== candidateCode.toUpperCase()) return false;
      }

      if (
        (sCode && sCode === exactToken) ||
        (sId && sId === exactToken) ||
        (sNumAluno && sNumAluno === exactToken) ||
        (sAccessCode && sAccessCode === exactToken)
      ) {
        // Se um hash legado foi informado em JSON, já foi validado acima;
        // em leitura direta SGR-XXXX, validamos exatamente no ramo abaixo.
        return true;
      }

      if (exactHash && exactHash.startsWith('SGR-')) {
        const computed = generateStudentQrHash(
          s.id,
          s.code || '',
          s.institutionId || instIdForHash
        ).toUpperCase();
        if (computed === exactHash) return true;
      }

      return false;
    });

  const activeMatch = findExactInList(
    institutionStudents.filter(s => !activeInstitutionId || s.institutionId === activeInstitutionId),
    activeInstitutionId
  );

  if (activeMatch) {
    return {
      student: activeMatch,
      status: 'matched',
      reason: 'Aluno identificado com correspondência exata.',
      requiresServerVerification: false,
    };
  }

  // Verificar se pertence a outra instituição conhecida em memória (para dar feedback preciso de bloqueio cross-tenant)
  const crossTenantMatch = allInstitutionsStudents.find(s => {
    if (s.institutionId === activeInstitutionId) return false;
    const sCode = (s.code || '').trim().toUpperCase();
    const sId = (s.id || '').trim().toUpperCase();
    const computed = generateStudentQrHash(s.id, s.code || '', s.institutionId || '').toUpperCase();
    return sCode === exactToken || sId === exactToken || (exactHash && computed === exactHash);
  });

  if (crossTenantMatch) {
    return {
      student: null,
      status: 'wrong_institution',
      reason: `QR Code pertence a outra instituição (${crossTenantMatch.institutionId}). Acesso bloqueado.`,
    };
  }

  return {
    student: null,
    status: 'not_found',
    reason: 'QR Code não reconhecido ou aluno não pertencente a esta instituição.',
  };
}

/**
 * Wrapper de compatibilidade que retorna apenas Student | null mantendo as novas garantias de segurança.
 */
export function parseStudentQrPayload(
  rawPayload: string,
  students: Student[],
  activeInstitutionId: string
): Student | null {
  return resolveStudentFromQrPayload(rawPayload, students, activeInstitutionId, students).student;
}

export function buildGateWhatsAppMessage(params: {
  action: 'entrada' | 'saida' | 'barrado';
  student: Student;
  institutionName: string;
  timeStr: string;
  monthLabel?: string;
  blockReason?: string;
}): string {
  return buildGateWhatsAppNotification(params).message;
}

export function buildWhatsAppUrl(phone: string | undefined, message: string): string | null {
  const cleaned = normalizeMozambiqueWhatsAppPhone(phone);
  if (!cleaned || cleaned.length < 9) return null;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Verifica sequência lógica de movimentos do dia para evitar entrada dupla consecutiva ou saída sem entrada prévia.
 * Retorna apenas aviso operacional (ex: saída excepcional ainda é permitida se o porteiro confirmar, mas recebe alerta visível).
 */
export function checkGateMovementSequence(
  studentId: string,
  intendedAction: 'entrada' | 'saida',
  accessLogs: Array<{ studentId: string; institutionId: string; type: 'entrada' | 'saida' | 'barrado'; date?: string; timestamp?: string }>,
  activeInstitutionId: string,
  todayDdMmYyyy: string = getMaputoDateTimeInfo().ddMmYyyy
): {
  isDuplicateSequence: boolean;
  lastMovementType?: 'entrada' | 'saida' | 'barrado';
  warningMessage?: string;
} {
  const todayStudentLogs = accessLogs.filter(
    l =>
      l.studentId === studentId &&
      (!activeInstitutionId || l.institutionId === activeInstitutionId) &&
      (l.type === 'entrada' || l.type === 'saida') &&
      (!l.date || l.date === todayDdMmYyyy || (l.timestamp || '').startsWith(todayDdMmYyyy))
  );

  const latest = todayStudentLogs[0];
  if (!latest) {
    if (intendedAction === 'saida') {
      return {
        isDuplicateSequence: true,
        warningMessage: 'Aviso: Não existe registo de ENTRADA hoje para este aluno antes da SAÍDA.',
      };
    }
    return { isDuplicateSequence: false };
  }

  if (intendedAction === 'entrada' && latest.type === 'entrada') {
    return {
      isDuplicateSequence: true,
      lastMovementType: 'entrada',
      warningMessage: 'Aviso: O último movimento registado hoje já é uma ENTRADA (possível entrada dupla sem saída prévia).',
    };
  }

  if (intendedAction === 'saida' && latest.type === 'saida') {
    return {
      isDuplicateSequence: true,
      lastMovementType: 'saida',
      warningMessage: 'Aviso: O último movimento registado hoje já é uma SAÍDA (sem nova entrada registada).',
    };
  }

  return { isDuplicateSequence: false, lastMovementType: latest.type };
}

