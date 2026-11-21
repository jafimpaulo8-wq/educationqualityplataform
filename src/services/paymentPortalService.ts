import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Institution,
  Student,
  PaymentRecord,
  ContaReceber,
  OfficialReceiptRecord,
  InstitutionalReceivingAccount,
  PaymentNetwork
} from '../types';
import {
  isPaymentApproved,
  isPaymentFinalized,
  isPaymentRejected
} from '../utils/paymentStatusUtils';

export const FINANCIAL_ROLES = new Set([
  'SUPER_ADMIN',
  'ADMIN_INSTITUICAO',
  'DIRETOR',
  'FINANCEIRO'
]);

export function hasFinancialPermission(canonicalRole?: string | null, isSuperAdmin = false): boolean {
  if (isSuperAdmin) return true;
  if (!canonicalRole) return false;
  return FINANCIAL_ROLES.has(canonicalRole.toUpperCase());
}

export function formatInstitutionReceiptPrefix(institution?: Partial<Institution> | null, institutionId?: string): string {
  const raw = (institution?.sigla || institution?.code || institutionId || 'SIG')
    .toString()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (!raw) return 'SIG';
  return raw.slice(0, 6);
}

export function formatSequentialReceiptNumber(params: {
  sequenceNumber: number;
  institution?: Partial<Institution> | null;
  institutionId?: string;
  year?: number;
}): string {
  const prefix = formatInstitutionReceiptPrefix(params.institution, params.institutionId);
  const year = params.year || new Date().getFullYear();
  const padded = String(Math.max(1, params.sequenceNumber)).padStart(5, '0');
  return `REC-${prefix}-${year}-${padded}`;
}

/**
 * Remove propriedades undefined antes de gravar no Firestore.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    if (item?.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

async function safeQueryDocs<T extends { id: string }>(
  colName: string,
  constraints: ReturnType<typeof where>[]
): Promise<T[]> {
  try {
    const q = query(collection(db, colName), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as any), id: d.id } as T));
  } catch (err) {
    console.warn(`[PaymentPortalService] Nota ao consultar ${colName}:`, err);
    return [];
  }
}

export interface PortalQueryAccessOpts {
  isFinancialStaff: boolean;
  uid?: string;
  email?: string;
  linkedStudentIds?: string[];
}

/**
 * Obtém o(s) registo(s) discente(s) estritamente do próprio aluno ou encarregado na instituição autorizada.
 */
export async function fetchOwnStudentRecordsForPortal(
  institutionId: string,
  uid: string,
  email?: string,
  linkedStudentIds?: string[]
): Promise<Student[]> {
  if (!institutionId || !uid) return [];

  const queries: Promise<Student[]>[] = [
    safeQueryDocs<Student>('students', [where('institutionId', '==', institutionId), where('userId', '==', uid)]),
    safeQueryDocs<Student>('students', [where('institutionId', '==', institutionId), where('guardianUserId', '==', uid)]),
    safeQueryDocs<Student>('students', [where('institutionId', '==', institutionId), where('guardianUids', 'array-contains', uid)])
  ];

  if (email) {
    queries.push(
      safeQueryDocs<Student>('students', [where('institutionId', '==', institutionId), where('guardianEmail', '==', email)])
    );
  }

  const results = await Promise.all(queries);
  const directById: Student[] = [];
  if (linkedStudentIds && linkedStudentIds.length > 0) {
    for (const sid of linkedStudentIds) {
      if (!sid) continue;
      try {
        const snap = await getDoc(doc(db, 'students', sid));
        if (snap.exists()) {
          const data = { ...(snap.data() as any), id: snap.id } as Student;
          if (data.institutionId === institutionId) {
            directById.push(data);
          }
        }
      } catch (err) {
        console.warn(`[PaymentPortalService] Nota ao ler student/${sid}:`, err);
      }
    }
  }

  return deduplicateById([...results.flat(), ...directById]).filter(
    s => s.institutionId === institutionId
  );
}

/**
 * Consulta obrigações (accountsReceivable) exclusivamente dentro do institutionId autorizado.
 * Para ALUNO / RESPONSAVEL executa apenas queries restritas aos próprios vínculos.
 */
export async function fetchPortalAccountsReceivable(
  institutionId: string,
  opts: PortalQueryAccessOpts
): Promise<ContaReceber[]> {
  if (!institutionId) return [];

  if (opts.isFinancialStaff) {
    const items = await safeQueryDocs<ContaReceber>('accountsReceivable', [
      where('institutionId', '==', institutionId)
    ]);
    return deduplicateById(items).filter(c => c.institutionId === institutionId);
  }

  const uid = opts.uid;
  if (!uid) return [];

  const queries: Promise<ContaReceber[]>[] = [
    safeQueryDocs<ContaReceber>('accountsReceivable', [where('institutionId', '==', institutionId), where('studentUserId', '==', uid)]),
    safeQueryDocs<ContaReceber>('accountsReceivable', [where('institutionId', '==', institutionId), where('userId', '==', uid)]),
    safeQueryDocs<ContaReceber>('accountsReceivable', [where('institutionId', '==', institutionId), where('guardianUserId', '==', uid)]),
    safeQueryDocs<ContaReceber>('accountsReceivable', [where('institutionId', '==', institutionId), where('guardianUids', 'array-contains', uid)])
  ];

  for (const sid of opts.linkedStudentIds || []) {
    if (sid) {
      queries.push(
        safeQueryDocs<ContaReceber>('accountsReceivable', [where('institutionId', '==', institutionId), where('studentId', '==', sid)])
      );
    }
  }

  const results = await Promise.all(queries);
  return deduplicateById(results.flat()).filter(c => c.institutionId === institutionId);
}

/**
 * Consulta pagamentos e pedidos submetidos exclusivamente pelo institutionId autorizado.
 */
export async function fetchPortalPayments(
  institutionId: string,
  opts: PortalQueryAccessOpts
): Promise<PaymentRecord[]> {
  if (!institutionId) return [];

  if (opts.isFinancialStaff) {
    const items = await safeQueryDocs<PaymentRecord>('payments', [
      where('institutionId', '==', institutionId)
    ]);
    return deduplicateById(items)
      .filter(p => p.institutionId === institutionId)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  const uid = opts.uid;
  if (!uid) return [];

  const queries: Promise<PaymentRecord[]>[] = [
    safeQueryDocs<PaymentRecord>('payments', [where('institutionId', '==', institutionId), where('studentUserId', '==', uid)]),
    safeQueryDocs<PaymentRecord>('payments', [where('institutionId', '==', institutionId), where('userId', '==', uid)]),
    safeQueryDocs<PaymentRecord>('payments', [where('institutionId', '==', institutionId), where('guardianUserId', '==', uid)]),
    safeQueryDocs<PaymentRecord>('payments', [where('institutionId', '==', institutionId), where('submittedByUid', '==', uid)]),
    safeQueryDocs<PaymentRecord>('payments', [where('institutionId', '==', institutionId), where('guardianUids', 'array-contains', uid)])
  ];

  for (const sid of opts.linkedStudentIds || []) {
    if (sid) {
      queries.push(
        safeQueryDocs<PaymentRecord>('payments', [where('institutionId', '==', institutionId), where('studentId', '==', sid)])
      );
    }
  }

  const results = await Promise.all(queries);
  return deduplicateById(results.flat())
    .filter(p => p.institutionId === institutionId)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

/**
 * Consulta recibos oficiais exclusivamente dentro do institutionId autorizado.
 */
export async function fetchPortalReceipts(
  institutionId: string,
  opts: PortalQueryAccessOpts
): Promise<OfficialReceiptRecord[]> {
  if (!institutionId) return [];

  if (opts.isFinancialStaff) {
    const items = await safeQueryDocs<OfficialReceiptRecord>('receipts', [
      where('institutionId', '==', institutionId)
    ]);
    return deduplicateById(items)
      .filter(r => r.institutionId === institutionId)
      .sort((a, b) => (b.issuedAt || '').localeCompare(a.issuedAt || ''));
  }

  const uid = opts.uid;
  if (!uid) return [];

  const queries: Promise<OfficialReceiptRecord[]>[] = [
    safeQueryDocs<OfficialReceiptRecord>('receipts', [where('institutionId', '==', institutionId), where('studentUserId', '==', uid)]),
    safeQueryDocs<OfficialReceiptRecord>('receipts', [where('institutionId', '==', institutionId), where('guardianUserId', '==', uid)]),
    safeQueryDocs<OfficialReceiptRecord>('receipts', [where('institutionId', '==', institutionId), where('guardianUids', 'array-contains', uid)])
  ];

  for (const sid of opts.linkedStudentIds || []) {
    if (sid) {
      queries.push(
        safeQueryDocs<OfficialReceiptRecord>('receipts', [where('institutionId', '==', institutionId), where('studentId', '==', sid)])
      );
    }
  }

  const results = await Promise.all(queries);
  return deduplicateById(results.flat())
    .filter(r => r.institutionId === institutionId)
    .sort((a, b) => (b.issuedAt || '').localeCompare(a.issuedAt || ''));
}

/**
 * Lê configurações financeiras e contas de recebimento da instituição.
 * IMPORTANTE: Invocar apenas quando o utilizador tem permissão financeira (rejeitado nas regras para público/aluno).
 */
export async function fetchAuthorizedInstitutionFinancialConfig(institutionId: string): Promise<{
  institution: Institution | null;
  receivingAccounts: InstitutionalReceivingAccount[];
}> {
  if (!institutionId) {
    return { institution: null, receivingAccounts: [] };
  }

  let institution: Institution | null = null;
  let receivingAccounts: InstitutionalReceivingAccount[] = [];

  try {
    const instSnap = await getDoc(doc(db, 'institutions', institutionId));
    if (instSnap.exists()) {
      institution = { ...(instSnap.data() as any), id: instSnap.id } as Institution;
    }
  } catch (err) {
    console.warn(`[PaymentPortalService] Nota ao ler institutions/${institutionId}:`, err);
  }

  try {
    const accSnap = await getDocs(collection(db, 'institutions', institutionId, 'receivingAccounts'));
    receivingAccounts = accSnap.docs.map(d => ({
      ...(d.data() as any),
      id: d.id,
      institutionId
    })) as InstitutionalReceivingAccount[];
  } catch (err) {
    console.warn(`[PaymentPortalService] Nota ao ler institutions/${institutionId}/receivingAccounts:`, err);
  }

  return { institution, receivingAccounts };
}

/**
 * Guarda/atualiza uma conta de recebimento em /institutions/{institutionId}/receivingAccounts/{accountId}.
 * Permitido exclusivamente a pessoal financeiro autorizado.
 */
export async function saveReceivingAccount(
  institutionId: string,
  account: InstitutionalReceivingAccount
): Promise<void> {
  if (!institutionId || !account?.id) {
    throw new Error('Identificador de instituição e conta obrigatório.');
  }
  const payload = stripUndefinedDeep({
    ...account,
    institutionId,
    updatedAt: new Date().toISOString()
  });
  await setDoc(doc(db, 'institutions', institutionId, 'receivingAccounts', account.id), payload, { merge: true });
}

export async function deleteReceivingAccount(institutionId: string, accountId: string): Promise<void> {
  if (!institutionId || !accountId) return;
  await deleteDoc(doc(db, 'institutions', institutionId, 'receivingAccounts', accountId));
}

/**
 * Atualiza estritamente financialAccounts / financialSettings / updatedAt do documento da instituição.
 * Compatível com a regra Firestore que restringe FINANCEIRO apenas a esses 3 campos.
 */
export async function saveInstitutionFinancialSettings(
  institutionId: string,
  updates: Pick<Institution, 'financialAccounts' | 'financialSettings'>
): Promise<void> {
  if (!institutionId) return;
  const payload = stripUndefinedDeep({
    ...(updates.financialAccounts !== undefined ? { financialAccounts: updates.financialAccounts } : {}),
    ...(updates.financialSettings !== undefined ? { financialSettings: updates.financialSettings } : {}),
    updatedAt: new Date().toISOString()
  });
  await updateDoc(doc(db, 'institutions', institutionId), payload);
}

/**
 * Submete um comprovativo de pagamento ao Firestore cumprindo isValidOwnPaymentSubmission.
 * Entra como PENDING_APPROVAL, sem redução de dívida nem emissão de recibo.
 */
export async function createPortalPaymentSubmission(record: PaymentRecord): Promise<void> {
  if (!record.id || !record.institutionId) {
    throw new Error('Registo de pagamento requer id e institutionId.');
  }
  const {
    receiptNumber: _rn,
    receiptId: _ri,
    reviewedBy: _rb,
    reviewedByUid: _rbu,
    reviewedAt: _ra,
    rejectionReason: _rr,
    serviceReleasedAt: _sra,
    serviceReleaseMessage: _srm,
    ...cleanBase
  } = record;

  const payload = stripUndefinedDeep({
    ...cleanBase,
    status: 'PENDING_APPROVAL',
    serviceReleased: false
  });
  await setDoc(doc(db, 'payments', record.id), payload);
}

/**
 * Reenvia comprovativo corrigido a partir do estado CORREÇÃO SOLICITADA para PENDING_APPROVAL.
 * Remove campos de revisão anteriores para satisfazer isValidOwnPaymentResubmission.
 */
export async function resubmitPortalPayment(
  paymentId: string,
  updates: {
    institutionId: string;
    studentId: string;
    studentUserId?: string;
    guardianUserId?: string;
    transactionCode: string;
    amount: number;
    date: string;
    time: string;
    network: PaymentNetwork;
    proofUrl?: string;
    proofFileName?: string;
    auditTrail?: PaymentRecord['auditTrail'];
  }
): Promise<void> {
  if (!paymentId) return;
  const patch: Record<string, any> = stripUndefinedDeep({
    institutionId: updates.institutionId,
    studentId: updates.studentId,
    ...(updates.studentUserId ? { studentUserId: updates.studentUserId } : {}),
    ...(updates.guardianUserId ? { guardianUserId: updates.guardianUserId } : {}),
    transactionCode: updates.transactionCode,
    amount: updates.amount,
    date: updates.date,
    time: updates.time,
    network: updates.network,
    ...(updates.proofUrl ? { proofUrl: updates.proofUrl } : {}),
    ...(updates.proofFileName ? { proofFileName: updates.proofFileName } : {}),
    ...(updates.auditTrail ? { auditTrail: updates.auditTrail } : {}),
    status: 'PENDING_APPROVAL',
    serviceReleased: false
  });
  patch.correctionNotes = deleteField();
  patch.reviewedBy = deleteField();
  patch.reviewedByUid = deleteField();
  patch.reviewedAt = deleteField();
  patch.receiptNumber = deleteField();
  patch.receiptId = deleteField();

  await updateDoc(doc(db, 'payments', paymentId), patch);
}

/**
 * Aprova um pagamento de forma atómica e idempotente via runTransaction:
 * - Impede aprovação duplicada ou alteração após decisão final (APPROVED/REJECTED)
 * - Gera número sequencial único por instituição em /receiptCounters/{institutionId}
 * - Cria recibo imutável em /receipts/{receiptId}
 * - Atualiza o pagamento para APPROVED e liquida eventual Conta a Receber
 */
export async function approvePortalPaymentIdempotent(params: {
  payment: PaymentRecord;
  operatorName: string;
  operatorUid?: string;
  institution?: Partial<Institution> | null;
  receiptNumber?: string;
  serviceReleaseMessage: string;
  balanceBefore: number;
  balanceAfter: number;
  auditTrail: PaymentRecord['auditTrail'];
  notes?: string;
}): Promise<{ receipt: OfficialReceiptRecord; alreadyApproved: boolean }> {
  const {
    payment,
    operatorName,
    operatorUid,
    institution,
    receiptNumber: explicitReceiptNumber,
    serviceReleaseMessage,
    balanceBefore,
    balanceAfter,
    auditTrail,
    notes
  } = params;

  if (!payment.institutionId) {
    throw new Error('institutionId obrigatório para aprovação de pagamento.');
  }
  if (!payment.id) {
    throw new Error('Identificador do pagamento obrigatório.');
  }

  const instId = payment.institutionId;
  const deterministicReceiptId = payment.receiptId || `rcp-${payment.id}`;
  const paymentRef = doc(db, 'payments', payment.id);
  const counterRef = doc(db, 'receiptCounters', instId);
  const receiptRef = doc(db, 'receipts', deterministicReceiptId);
  const receivableRef = payment.contaReceberId
    ? doc(db, 'accountsReceivable', payment.contaReceberId)
    : null;

  return runTransaction(db, async tx => {
    const paymentSnap = await tx.get(paymentRef);
    const counterSnap = await tx.get(counterRef);
    const receiptSnap = await tx.get(receiptRef);
    const receivableSnap = receivableRef ? await tx.get(receivableRef) : null;

    if (paymentSnap.exists()) {
      const existingData = paymentSnap.data() as PaymentRecord;
      if (isPaymentRejected(existingData.status)) {
        throw new Error('Este pagamento já foi rejeitado definitivamente e não pode ser aprovado.');
      }
      if (isPaymentApproved(existingData.status) && existingData.receiptNumber) {
        if (receiptSnap.exists()) {
          return {
            receipt: { ...(receiptSnap.data() as any), id: receiptSnap.id } as OfficialReceiptRecord,
            alreadyApproved: true
          };
        }
        throw new Error(`Pagamento já aprovado anteriormente (${existingData.receiptNumber}).`);
      }
    }

    if (receiptSnap.exists()) {
      return {
        receipt: { ...(receiptSnap.data() as any), id: receiptSnap.id } as OfficialReceiptRecord,
        alreadyApproved: true
      };
    }

    const prevSeq = counterSnap.exists() ? Number(counterSnap.data()?.lastSequence || 0) : 0;
    const nextSequence = prevSeq + 1;
    const year = new Date().getFullYear();
    const generatedReceiptNumber =
      explicitReceiptNumber ||
      formatSequentialReceiptNumber({
        sequenceNumber: nextSequence,
        institution,
        institutionId: instId,
        year
      });

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const instAddress = [institution?.address, institution?.city, institution?.province]
      .filter(Boolean)
      .join(', ');

    const receiptRecord: OfficialReceiptRecord = stripUndefinedDeep({
      id: deterministicReceiptId,
      institutionId: instId,
      paymentId: payment.id,
      ...(payment.contaReceberId ? { contaReceberId: payment.contaReceberId } : {}),
      receiptNumber: generatedReceiptNumber,
      sequenceNumber: nextSequence,
      studentId: payment.studentId,
      studentName: payment.studentName,
      studentCode: payment.studentCode,
      ...(payment.studentUserId ? { studentUserId: payment.studentUserId } : {}),
      ...(payment.guardianUserId ? { guardianUserId: payment.guardianUserId } : {}),
      ...(payment.guardianUids ? { guardianUids: payment.guardianUids } : {}),
      ...(payment.guardianEmail ? { guardianEmail: payment.guardianEmail } : {}),
      ...(payment.courseName ? { courseName: payment.courseName } : {}),
      ...(institution?.name ? { institutionName: institution.name } : {}),
      ...(institution?.nuit ? { institutionNuit: institution.nuit } : {}),
      ...(instAddress ? { institutionAddress: instAddress } : {}),
      ...(institution?.phone ? { institutionPhone: institution.phone } : {}),
      serviceItem: payment.serviceItem || 'outros',
      ...(payment.serviceDescription ? { serviceDescription: payment.serviceDescription } : {}),
      amount: payment.amount,
      network: payment.network,
      transactionCode: payment.transactionCode,
      paymentDate: payment.date,
      paymentTime: payment.time,
      issuedAt: now,
      issuedBy: operatorName,
      ...(operatorUid ? { issuedByUid: operatorUid } : {}),
      qrVerificationCode: `SIVERC-REC-${generatedReceiptNumber.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase()}`,
      reprintCount: 0,
      status: 'Emitido' as const
    });

    const finalizedAuditTrail = auditTrail.map(entry => ({
      ...entry,
      details: entry.details.replace(/REC-PENDENTE/g, generatedReceiptNumber)
    }));

    const counterPayload = stripUndefinedDeep({
      institutionId: instId,
      year,
      lastSequence: nextSequence,
      lastReceiptNumber: generatedReceiptNumber,
      updatedAt: now,
      ...(operatorUid ? { updatedByUid: operatorUid } : {})
    });

    if (counterSnap.exists()) {
      tx.update(counterRef, counterPayload);
    } else {
      tx.set(counterRef, counterPayload);
    }

    const paymentUpdatePayload = stripUndefinedDeep({
      institutionId: instId,
      status: 'APPROVED',
      reviewedBy: operatorName,
      ...(operatorUid ? { reviewedByUid: operatorUid } : {}),
      reviewedAt: now,
      receiptNumber: generatedReceiptNumber,
      receiptId: deterministicReceiptId,
      serviceReleased: true,
      serviceReleasedAt: now,
      serviceReleaseMessage,
      balanceBefore,
      balanceAfter,
      ...(notes ? { adminNotes: notes } : {}),
      auditTrail: finalizedAuditTrail
    });

    if (paymentSnap.exists()) {
      tx.update(paymentRef, paymentUpdatePayload);
    } else {
      tx.set(
        paymentRef,
        stripUndefinedDeep({
          ...payment,
          ...paymentUpdatePayload
        })
      );
    }

    tx.set(receiptRef, receiptRecord);

    if (receivableRef) {
      if (receivableSnap?.exists()) {
        tx.update(
          receivableRef,
          stripUndefinedDeep({
            institutionId: instId,
            status: 'pago',
            paidAmount: payment.amount,
            paymentDate: today,
            paymentMethod: payment.network,
            receiptNumber: generatedReceiptNumber,
            receiptId: deterministicReceiptId,
            paymentRecordId: payment.id,
            updatedAt: now
          })
        );
      } else {
        tx.set(
          receivableRef,
          stripUndefinedDeep({
            institutionId: instId,
            status: 'pago',
            paidAmount: payment.amount,
            paymentDate: today,
            paymentMethod: payment.network,
            receiptNumber: generatedReceiptNumber,
            receiptId: deterministicReceiptId,
            paymentRecordId: payment.id,
            updatedAt: now
          }),
          { merge: true }
        );
      }
    }

    return { receipt: receiptRecord, alreadyApproved: false };
  });
}

export async function rejectPortalPayment(
  payment: PaymentRecord,
  rejectionReason: string,
  operatorName: string,
  auditTrail: PaymentRecord['auditTrail'],
  operatorUid?: string
): Promise<void> {
  if (!payment.id || !payment.institutionId) {
    throw new Error('Identificador de pagamento e instituição obrigatórios.');
  }
  const cleanReason = (rejectionReason || '').trim();
  if (cleanReason.length < 3) {
    throw new Error('É obrigatório informar o motivo formal da rejeição (mínimo 3 caracteres).');
  }

  const paymentRef = doc(db, 'payments', payment.id);
  const now = new Date().toISOString();

  await runTransaction(db, async tx => {
    const snap = await tx.get(paymentRef);
    if (snap.exists()) {
      const existing = snap.data() as PaymentRecord;
      if (isPaymentFinalized(existing.status)) {
        throw new Error('Pagamento já possui decisão definitiva e não pode ser alterado.');
      }
    }

    tx.update(
      paymentRef,
      stripUndefinedDeep({
        status: 'REJECTED',
        reviewedBy: operatorName,
        ...(operatorUid ? { reviewedByUid: operatorUid } : {}),
        reviewedAt: now,
        rejectionReason: cleanReason,
        serviceReleased: false,
        auditTrail
      })
    );
  });
}

export async function requestCorrectionPortalPayment(
  payment: PaymentRecord,
  correctionNotes: string,
  operatorName: string,
  auditTrail: PaymentRecord['auditTrail'],
  operatorUid?: string
): Promise<void> {
  if (!payment.id || !payment.institutionId) return;
  const cleanNotes = (correctionNotes || '').trim();
  if (cleanNotes.length < 3) {
    throw new Error('Informe as instruções de correção para o formando.');
  }

  const paymentRef = doc(db, 'payments', payment.id);
  await runTransaction(db, async tx => {
    const snap = await tx.get(paymentRef);
    if (snap.exists()) {
      const existing = snap.data() as PaymentRecord;
      if (isPaymentFinalized(existing.status)) {
        throw new Error('Pagamento já possui decisão definitiva e não pode voltar para correção.');
      }
    }
    tx.update(
      paymentRef,
      stripUndefinedDeep({
        status: 'CORREÇÃO SOLICITADA',
        reviewedBy: operatorName,
        ...(operatorUid ? { reviewedByUid: operatorUid } : {}),
        reviewedAt: new Date().toISOString(),
        correctionNotes: cleanNotes,
        serviceReleased: false,
        auditTrail
      })
    );
  });
}

export async function incrementReceiptReprint(
  payment: PaymentRecord,
  operatorName: string,
  nextCount: number,
  auditTrail: PaymentRecord['auditTrail']
): Promise<void> {
  if (!payment.id || !payment.institutionId) return;
  const now = new Date().toISOString();
  // Recibos em /receipts são estritamente imutáveis (allow update, delete: if false).
  // A auditoria de reimpressão é registada apenas no documento /payments correspondente.
  await updateDoc(
    doc(db, 'payments', payment.id),
    stripUndefinedDeep({
      reprintCount: nextCount,
      lastReprintedAt: now,
      lastReprintedBy: operatorName,
      auditTrail
    })
  ).catch(err => console.warn('[PaymentPortalService] Nota ao registar reimpressão em payments:', err));
}

export async function createContaReceberInFirestore(conta: ContaReceber): Promise<void> {
  if (!conta.id || !conta.institutionId) return;
  await setDoc(doc(db, 'accountsReceivable', conta.id), stripUndefinedDeep(conta));
}

export async function settleContaReceberInFirestore(
  conta: ContaReceber,
  receipt: OfficialReceiptRecord,
  paymentData: {
    paidAmount: number;
    paymentMethod: string;
    notes?: string;
  }
): Promise<void> {
  if (!conta.id || !conta.institutionId) return;
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const batch = writeBatch(db);
  batch.set(
    doc(db, 'accountsReceivable', conta.id),
    stripUndefinedDeep({
      ...conta,
      paidAmount: paymentData.paidAmount,
      status: 'pago',
      paymentDate: today,
      paymentMethod: paymentData.paymentMethod,
      receiptNumber: receipt.receiptNumber,
      receiptId: receipt.id,
      updatedAt: now
    }),
    { merge: true }
  );
  batch.set(doc(db, 'receipts', receipt.id), stripUndefinedDeep(receipt), { merge: true });
  await batch.commit();
}
