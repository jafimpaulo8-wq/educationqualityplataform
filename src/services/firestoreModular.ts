import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

/**
 * 56. BANCO DE DADOS - ESTRUTURA FIRESTORE MODULAR
 * Lista exata das 48 coleções principais do sistema SIGAR / SIVERC
 */
export const FIRESTORE_COLLECTIONS = {
  INSTITUTIONS: 'institutions',
  BRANCHES: 'branches',
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  STUDENTS: 'students',
  GUARDIANS: 'guardians',
  APPLICATIONS: 'applications',
  ENROLLMENTS: 'enrollments',
  COURSES: 'courses',
  SUBJECTS: 'subjects',
  CLASSES: 'classes',
  SCHEDULES: 'schedules',
  TEACHERS: 'teachers',
  LESSONS: 'lessons',
  ATTENDANCE: 'attendance',
  EVALUATIONS: 'evaluations',
  GRADES: 'grades',
  REPORT_CARDS: 'reportCards',
  INTERNSHIPS: 'internships',
  COMPANIES: 'companies',
  CONTRACTS: 'contracts',
  DOCUMENTS: 'documents',
  DOCUMENT_TEMPLATES: 'documentTemplates',
  CERTIFICATES: 'certificates',
  CERTIFICATE_VERSIONS: 'certificateVersions',
  SIGNATURES: 'signatures',
  PAYMENTS: 'payments',
  PAYMENT_REQUESTS: 'paymentRequests',
  RECEIPTS: 'receipts',
  ACCOUNTS_RECEIVABLE: 'accountsReceivable',
  ACCOUNTS_PAYABLE: 'accountsPayable',
  CASH_REGISTERS: 'cashRegisters',
  CASH_MOVEMENTS: 'cashMovements',
  TASKS: 'tasks',
  ANNOUNCEMENTS: 'announcements',
  NOTIFICATIONS: 'notifications',
  ONLINE_CLASSES: 'onlineClasses',
  ONLINE_CLASS_PARTICIPANTS: 'onlineClassParticipants',
  MATERIALS: 'materials',
  WHATSAPP_CONNECTIONS: 'whatsappConnections',
  MESSAGE_TEMPLATES: 'messageTemplates',
  MESSAGES: 'messages',
  ACCESS_LOGS: 'accessLogs',
  AUDIT_LOGS: 'auditLogs',
  SIVEC_ISSUERS: 'sivecIssuers',
  SIVEC_CERTIFICATES: 'sivecCertificates',
  SIVEC_VERIFICATIONS: 'sivecVerifications',
  SIVEC_API_KEYS: 'sivecApiKeys',
  SETTINGS: 'settings',
  // 57. Backup e Preservação Histórica
  BACKUPS: 'backups',
  HISTORICAL_RECORDS: 'historicalRecords'
} as const;

export type FirestoreCollectionName = typeof FIRESTORE_COLLECTIONS[keyof typeof FIRESTORE_COLLECTIONS];

// Base document metadata guaranteeing history preservation
export interface BaseInstitutionalDocument {
  id: string;
  institutionId: string;
  branchId?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
  version?: number;
}

/**
 * Generic Modular Repository providing soft-delete and historical safety
 */
export class ModularCollectionRepository<T extends BaseInstitutionalDocument> {
  constructor(public readonly collectionName: string) {}

  protected getRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  protected getCollectionRef() {
    return collection(db, this.collectionName);
  }

  async getById(id: string): Promise<T | null> {
    try {
      const snap = await getDoc(this.getRef(id));
      if (!snap.exists()) return null;
      return snap.data() as T;
    } catch (e) {
      console.warn(`[${this.collectionName}] getById error:`, e);
      return null;
    }
  }

  async listByInstitution(institutionId: string, includeDeleted = false): Promise<T[]> {
    try {
      const colRef = this.getCollectionRef();
      const q = query(colRef, where('institutionId', '==', institutionId));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data() as T);
      return includeDeleted ? docs : docs.filter(d => !d.isDeleted);
    } catch (e) {
      console.warn(`[${this.collectionName}] listByInstitution error:`, e);
      return [];
    }
  }

  async save(document: T, actorEmail?: string): Promise<void> {
    const docId = document.id;
    const path = `${this.collectionName}/${docId}`;
    try {
      const existing = await this.getById(docId);
      const now = new Date().toISOString();
      const user = actorEmail || auth.currentUser?.email || 'system';

      const enriched: T = {
        ...document,
        createdAt: existing?.createdAt || document.createdAt || now,
        createdBy: existing?.createdBy || document.createdBy || user,
        updatedAt: now,
        updatedBy: user,
        version: ((existing?.version || 0) + 1),
        isDeleted: document.isDeleted ?? false
      };

      await setDoc(this.getRef(docId), enriched, { merge: true });

      // Record snapshot to historical audit log if modifying existing record
      if (existing) {
        await this.logHistoricalChange({
          collectionName: this.collectionName,
          docId,
          institutionId: document.institutionId,
          operation: 'UPDATE',
          previousState: existing,
          newState: enriched,
          performedBy: user,
          timestamp: now
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * CRITICAL COMPLIANCE DIRECTIVE:
   * "Não apagar dados históricos por operações comuns."
   * Normal operations MUST soft-delete to retain full audit trail.
   */
  async softDelete(id: string, reason?: string, actorEmail?: string): Promise<void> {
    const path = `${this.collectionName}/${id}`;
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const now = new Date().toISOString();
      const user = actorEmail || auth.currentUser?.email || 'system';

      await updateDoc(this.getRef(id), {
        isDeleted: true,
        deletedAt: now,
        deletedBy: user,
        deleteReason: reason || 'Remoção lógica via interface padrão',
        updatedAt: now,
        updatedBy: user
      });

      await this.logHistoricalChange({
        collectionName: this.collectionName,
        docId: id,
        institutionId: existing.institutionId,
        operation: 'SOFT_DELETE',
        previousState: existing,
        newState: { ...existing, isDeleted: true, deletedAt: now, deleteReason: reason },
        performedBy: user,
        timestamp: now,
        reason
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  async restore(id: string, actorEmail?: string): Promise<void> {
    const path = `${this.collectionName}/${id}`;
    try {
      const existing = await this.getById(id);
      if (!existing) return;

      const now = new Date().toISOString();
      const user = actorEmail || auth.currentUser?.email || 'system';

      await updateDoc(this.getRef(id), {
        isDeleted: false,
        restoredAt: now,
        restoredBy: user,
        updatedAt: now,
        updatedBy: user
      });

      await this.logHistoricalChange({
        collectionName: this.collectionName,
        docId: id,
        institutionId: existing.institutionId,
        operation: 'RESTORE',
        previousState: existing,
        newState: { ...existing, isDeleted: false },
        performedBy: user,
        timestamp: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  private async logHistoricalChange(event: {
    collectionName: string;
    docId: string;
    institutionId: string;
    operation: 'CREATE' | 'UPDATE' | 'SOFT_DELETE' | 'RESTORE';
    previousState?: any;
    newState?: any;
    performedBy: string;
    timestamp: string;
    reason?: string;
  }): Promise<void> {
    try {
      const historyCol = collection(db, FIRESTORE_COLLECTIONS.HISTORICAL_RECORDS);
      const historyId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await setDoc(doc(historyCol, historyId), {
        id: historyId,
        ...event
      });
    } catch (e) {
      console.warn('Historical audit write note:', e);
    }
  }
}

/**
 * Instantiate modular repositories for the functional domains
 */
export const modularDb = {
  // Instituição & Filiais
  institutions: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.INSTITUTIONS),
  branches: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.BRANCHES),
  settings: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.SETTINGS),

  // RBAC & Identidade
  users: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.USERS),
  roles: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.ROLES),
  permissions: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.PERMISSIONS),

  // Académico & Pedagógico
  students: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.STUDENTS),
  guardians: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.GUARDIANS),
  applications: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.APPLICATIONS),
  enrollments: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.ENROLLMENTS),
  courses: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.COURSES),
  subjects: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.SUBJECTS),
  classes: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.CLASSES),
  schedules: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.SCHEDULES),
  teachers: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.TEACHERS),
  lessons: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.LESSONS),
  attendance: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.ATTENDANCE),
  evaluations: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.EVALUATIONS),
  grades: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.GRADES),
  reportCards: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.REPORT_CARDS),

  // Estágios & Empresas
  internships: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.INTERNSHIPS),
  companies: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.COMPANIES),

  // Contratos & Documentos Oficiais
  contracts: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.CONTRACTS),
  documents: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.DOCUMENTS),
  documentTemplates: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.DOCUMENT_TEMPLATES),
  certificates: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.CERTIFICATES),
  certificateVersions: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.CERTIFICATE_VERSIONS),
  signatures: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.SIGNATURES),

  // Financeiro & Tesouraria
  payments: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.PAYMENTS),
  paymentRequests: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.PAYMENT_REQUESTS),
  receipts: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.RECEIPTS),
  accountsReceivable: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.ACCOUNTS_RECEIVABLE),
  accountsPayable: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.ACCOUNTS_PAYABLE),
  cashRegisters: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.CASH_REGISTERS),
  cashMovements: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.CASH_MOVEMENTS),

  // Comunicação & Operações
  tasks: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.TASKS),
  announcements: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.ANNOUNCEMENTS),
  notifications: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.NOTIFICATIONS),
  onlineClasses: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.ONLINE_CLASSES),
  onlineClassParticipants: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.ONLINE_CLASS_PARTICIPANTS),
  materials: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.MATERIALS),
  whatsappConnections: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.WHATSAPP_CONNECTIONS),
  messageTemplates: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.MESSAGE_TEMPLATES),
  messages: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.MESSAGES),

  // Governança & Auditoria
  accessLogs: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.ACCESS_LOGS),
  auditLogs: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.AUDIT_LOGS),

  // SIVEC & Validação Nacional
  sivecIssuers: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.SIVEC_ISSUERS),
  sivecCertificates: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.SIVEC_CERTIFICATES),
  sivecVerifications: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.SIVEC_VERIFICATIONS),
  sivecApiKeys: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.SIVEC_API_KEYS),

  // Backups e Histórico
  backups: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.BACKUPS),
  historicalRecords: new ModularCollectionRepository(FIRESTORE_COLLECTIONS.HISTORICAL_RECORDS)
};
