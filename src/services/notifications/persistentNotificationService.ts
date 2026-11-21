import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Unsubscribe,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { AppRoute, LiveNotification, PaymentRecord } from '../../types';
import { toCanonicalRole } from '../../types/rbac';
import { stripUndefinedDeep } from '../paymentPortalService';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const STAFF_PAYMENT_ALERT_ROLES = [
  'DIRETOR',
  'ADMIN_INSTITUICAO',
  'SECRETARIA',
  'FINANCEIRO'
];

function buildNotificationDocId(prefix = 'notif'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function mapDocToNotification(docId: string, raw: any, currentUid?: string): LiveNotification {
  const readByUids: string[] = Array.isArray(raw?.readByUids) ? raw.readByUids : [];
  const isRead = Boolean(raw?.read) || (currentUid ? readByUids.includes(currentUid) : false);
  return {
    ...(raw as LiveNotification),
    id: docId,
    readByUids,
    read: isRead,
    timestamp: raw?.timestamp || raw?.createdAt || new Date().toISOString()
  };
}

export async function createPersistentNotification(
  input: Omit<LiveNotification, 'id' | 'timestamp' | 'read'> & { id?: string; timestamp?: string; read?: boolean }
): Promise<LiveNotification> {
  if (!input.institutionId) {
    throw new Error('institutionId é obrigatório para persistir notificações.');
  }
  const now = input.createdAt || new Date().toISOString();
  const id = input.id || buildNotificationDocId('notif');
  const payload = stripUndefinedDeep({
    ...input,
    id,
    createdAt: now,
    timestamp: input.timestamp || now,
    read: Boolean(input.read ?? false),
    readByUids: Array.isArray(input.readByUids) ? input.readByUids : []
  });

  await setDoc(doc(db, NOTIFICATIONS_COLLECTION, id), payload);
  return payload as LiveNotification;
}

/**
 * Notifica Direção, Secretaria e Tesouraria da instituição quando um comprovativo é submetido.
 */
export async function notifyStaffPaymentSubmitted(params: {
  payment: PaymentRecord;
  actorUid?: string;
}): Promise<LiveNotification | null> {
  const { payment, actorUid } = params;
  if (!payment.institutionId) return null;

  return createPersistentNotification({
    id: `notif-paysub-${payment.id}`,
    institutionId: payment.institutionId,
    branchId: payment.branchId,
    createdByUid: actorUid || payment.submittedByUid,
    targetRoles: STAFF_PAYMENT_ALERT_ROLES,
    title: 'Novo Comprovativo de Pagamento Submetido',
    message: `${payment.studentName} (${payment.studentCode}) submeteu ${payment.amount.toLocaleString('pt-MZ')} MT via ${payment.network} (Ref: ${payment.transactionCode}). Estado: PENDING_APPROVAL.`,
    type: 'payment',
    actionType: 'PAYMENT_SUBMITTED',
    actionText: 'Analisar na Tesouraria',
    actionRoute: 'pagamentos',
    actionTab: 'admin_management',
    relatedEntityId: payment.id,
    metadata: {
      paymentId: payment.id,
      studentId: payment.studentId,
      name: payment.studentName,
      code: payment.transactionCode,
      amount: payment.amount
    }
  });
}

/**
 * Notifica aluno / encarregado (e regista na instituição) sobre aprovação, rejeição ou pedido de correção.
 */
export async function notifyStudentPaymentDecision(params: {
  payment: PaymentRecord;
  decision: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUESTED';
  receiptNumber?: string;
  receiptId?: string;
  reason?: string;
  actorUid?: string;
  actorName?: string;
}): Promise<LiveNotification | null> {
  const { payment, decision, receiptNumber, receiptId, reason, actorUid, actorName } = params;
  if (!payment.institutionId) return null;

  const targetUids = Array.from(
    new Set(
      [
        payment.studentUserId,
        payment.guardianUserId,
        payment.submittedByUid,
        ...(Array.isArray(payment.guardianUids) ? payment.guardianUids : [])
      ].filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    )
  );
  const primaryRecipientUid = targetUids[0];

  let title = '';
  let message = '';
  let actionTab = 'pagamentos';
  let actionText = 'Ver Pagamentos';

  if (decision === 'APPROVED') {
    title = `Pagamento Aprovado • Recibo ${receiptNumber || ''}`.trim();
    message = `O pagamento de ${payment.amount.toLocaleString('pt-MZ')} MT (${payment.network}, Ref: ${payment.transactionCode}) foi aprovado por ${actorName || 'Tesouraria'}. Recibo ${receiptNumber || ''} disponível para consulta e PDF.`;
    actionTab = 'recibos';
    actionText = 'Abrir Recibos';
  } else if (decision === 'REJECTED') {
    title = 'Pagamento Rejeitado pela Tesouraria';
    message = `O comprovativo de ${payment.amount.toLocaleString('pt-MZ')} MT (Ref: ${payment.transactionCode}) foi rejeitado. Motivo: ${reason || 'Inconsistência nos dados informados'}.`;
    actionTab = 'pagamentos';
    actionText = 'Ver Detalhes';
  } else {
    title = 'Correção Solicitada no Comprovativo';
    message = `A tesouraria solicitou retificação no pagamento de ${payment.amount.toLocaleString('pt-MZ')} MT (Ref: ${payment.transactionCode}): ${reason || 'Verifique os dados submetidos'}.`;
    actionTab = 'pagamentos';
    actionText = 'Corrigir Agora';
  }

  return createPersistentNotification({
    id: `notif-paydec-${decision.toLowerCase()}-${payment.id}-${Date.now().toString(36)}`,
    institutionId: payment.institutionId,
    branchId: payment.branchId,
    createdByUid: actorUid,
    recipientUid: primaryRecipientUid,
    userId: primaryRecipientUid,
    targetUids,
    targetRoles: ['DIRETOR', 'ADMIN_INSTITUICAO', 'FINANCEIRO'],
    title,
    message,
    type: 'payment',
    actionType: `PAYMENT_${decision}`,
    actionText,
    actionRoute: 'portal_aluno' as AppRoute,
    actionTab,
    relatedEntityId: payment.id,
    metadata: {
      paymentId: payment.id,
      receiptId,
      receiptNumber,
      studentId: payment.studentId,
      name: payment.studentName,
      code: payment.transactionCode,
      amount: payment.amount
    }
  });
}

export async function fetchNotificationsForUser(params: {
  institutionId: string;
  uid: string;
  role?: string | null;
}): Promise<LiveNotification[]> {
  const { institutionId, uid, role } = params;
  if (!institutionId || !uid) return [];

  const canonical = toCanonicalRole(role || '');
  const isSuperAdmin = canonical === 'SUPER_ADMIN';

  const queriesToRun = isSuperAdmin
    ? [query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId))]
    : [
        query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId), where('recipientUid', '==', uid)),
        query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId), where('userId', '==', uid)),
        query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId), where('targetUids', 'array-contains', uid)),
        ...(STAFF_PAYMENT_ALERT_ROLES.includes(canonical) || ['PROFESSOR', 'FORMADOR', 'PORTEIRO'].includes(canonical)
          ? [query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId), where('targetRoles', 'array-contains', canonical))]
          : [])
      ];

  const merged = new Map<string, LiveNotification>();
  const snapshots = await Promise.all(
    queriesToRun.map(q => getDocs(q).catch(() => null))
  );

  for (const snap of snapshots) {
    if (!snap) continue;
    for (const d of snap.docs) {
      merged.set(d.id, mapDocToNotification(d.id, d.data(), uid));
    }
  }

  return Array.from(merged.values()).sort((a, b) =>
    (b.createdAt || b.timestamp || '').localeCompare(a.createdAt || a.timestamp || '')
  );
}

/**
 * Assinatura em tempo real das notificações persistidas no Firestore para o utilizador autenticado.
 */
export function subscribeToNotificationsForUser(params: {
  institutionId: string;
  uid: string;
  role?: string | null;
  onChange: (notifications: LiveNotification[]) => void;
  onError?: (err: unknown) => void;
}): Unsubscribe {
  const { institutionId, uid, role, onChange, onError } = params;
  if (!institutionId || !uid) {
    onChange([]);
    return () => {};
  }

  const canonical = toCanonicalRole(role || '');
  const isSuperAdmin = canonical === 'SUPER_ADMIN';
  const buckets = new Map<number, Map<string, LiveNotification>>();

  const emitMerged = () => {
    const merged = new Map<string, LiveNotification>();
    for (const bucket of buckets.values()) {
      for (const [id, item] of bucket.entries()) {
        merged.set(id, item);
      }
    }
    const sorted = Array.from(merged.values()).sort((a, b) =>
      (b.createdAt || b.timestamp || '').localeCompare(a.createdAt || a.timestamp || '')
    );
    onChange(sorted);
  };

  const queriesToListen = isSuperAdmin
    ? [query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId))]
    : [
        query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId), where('recipientUid', '==', uid)),
        query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId), where('userId', '==', uid)),
        query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId), where('targetUids', 'array-contains', uid)),
        ...(STAFF_PAYMENT_ALERT_ROLES.includes(canonical) || ['PROFESSOR', 'FORMADOR', 'PORTEIRO'].includes(canonical)
          ? [query(collection(db, NOTIFICATIONS_COLLECTION), where('institutionId', '==', institutionId), where('targetRoles', 'array-contains', canonical))]
          : [])
      ];

  const unsubscribers = queriesToListen.map((q, index) =>
    onSnapshot(
      q,
      snap => {
        const bucket = new Map<string, LiveNotification>();
        for (const d of snap.docs) {
          bucket.set(d.id, mapDocToNotification(d.id, d.data(), uid));
        }
        buckets.set(index, bucket);
        emitMerged();
      },
      err => {
        if (onError) onError(err);
        else console.warn('[PersistentNotificationService] Listener note:', err);
      }
    )
  );

  return () => {
    for (const unsub of unsubscribers) {
      unsub();
    }
  };
}

/**
 * Marca apenas estado de leitura da notificação no Firestore.
 * Nunca aprova nem altera pagamentos.
 */
export async function markNotificationAsReadInFirestore(
  notification: Pick<LiveNotification, 'id' | 'recipientUid' | 'userId'>,
  uid: string
): Promise<void> {
  if (!notification?.id || !uid) return;
  const now = new Date().toISOString();
  const isPersonal = notification.recipientUid === uid || notification.userId === uid;
  await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notification.id), {
    readByUids: arrayUnion(uid),
    readAt: now,
    ...(isPersonal ? { read: true } : {})
  });
}

export async function markAllNotificationsAsReadInFirestore(
  notifications: LiveNotification[],
  uid: string
): Promise<void> {
  if (!uid || notifications.length === 0) return;
  const unread = notifications.filter(n => !n.read);
  await Promise.all(
    unread.map(n =>
      markNotificationAsReadInFirestore(n, uid).catch(err =>
        console.warn('[PersistentNotificationService] Nota ao marcar lida:', err)
      )
    )
  );
}
