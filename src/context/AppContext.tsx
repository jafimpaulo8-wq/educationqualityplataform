import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  AppRoute, 
  Institution, 
  Student, 
  UserProfile,
  Course, 
  CourseModule,
  ClassGroup, 
  StudentClassTransfer,
  ClassScheduleSlot,
  ScheduleConflict,
  ConflictDetectionResult,
  ContractTemplate, 
  GeneratedContract, 
  LiveNotification, 
  CertificateData, 
  UserRole,
  StudentTermination,
  StudentStatus,
  DocumentSignature,
  CashRegisterSession,
  CashTransaction,
  ClassLesson,
  GateAccessLog,
  Teacher,
  AssessmentRecord,
  WhatsAppConnection,
  WhatsAppConnectionStatus,
  WhatsAppTemplateCategory,
  WhatsAppMessageTemplate,
  WhatsAppCampaign,
  WhatsAppCampaignStatus,
  WhatsAppAutomationRule,
  WhatsAppTriggerType,
  WhatsAppMessageLog,
  WhatsAppConsentRecord,
  Branch,
  InstitutionBankAccount,
  InstitutionPrefixes,
  FinancialSettings,
  DashboardTask,
  StudentNotice,
  Announcement,
  StudentAuditEntry,
  StudentHistoryEvent,
  StudentAttachedDocument,
  StudentReceiptRecord,
  RegistrationApplication,
  OnlineRegistrationConfig,
  AttendanceStatus,
  LessonAttendanceAuditLog,
  EvaluationItem,
  CalculationFormula,
  AssessmentType,
  StudentCalculatedGrade,
  InternshipContract,
  InternshipStatus,
  InternshipEvaluation,
  PautaHomologationRecord,
  PautaSituacao,
  PautaScopeType,
  ContractStatus,
  ContractTemplateVersion,
  ContractSignatureDetails,
  ContractStatusHistoryEntry,
  StudioTemplate,
  StudioTemplateVersion,
  DocumentBackground,
  SystemSignature,
  OfficialSigner,
  SignerRole,
  SignatureStatus,
  SignatureAuditEntry,
  ContaReceber,
  ContaPagar,
  ReceivableCategory,
  PaymentRecord,
  PaymentServiceItem,
  PaymentNetwork,
  PaymentStatus,
  PaymentAuditEntry,
  PAYMENT_SERVICE_CATALOG,
  TaskItem,
  TaskState,
  TaskPriority,
  TaskNote,
  TaskNoteVisibility,
  TaskAttachment,
  CalendarCustomEvent,
  InstitutionFeatureModules,
  TeacherPortalPermissions,
  StudentPortalPermissions,
  PlanDefinition,
  PlanId,
  PlanName,
  PlanLimits,
  DEFAULT_PLANS,
  getEffectiveLimits,
  calculateUsagePercentage,
  MozcoinWallet,
  MozcoinTransaction,
  MozcoinPurchaseRequest,
  MozcoinDiscountRule,
  MozcoinEcosystemService,
  MozcoinPaymentMethod,
  MoztechwaveIdentity
} from '../types';
import {
  DEFAULT_MOZCOIN_WALLETS,
  DEFAULT_MOZCOIN_TRANSACTIONS,
  DEFAULT_MOZCOIN_PURCHASES,
  DEFAULT_DISCOUNT_RULES,
  DEFAULT_ECOSYSTEM_SERVICES,
  DEFAULT_MOZTECHWAVE_IDENTITIES
} from '../data/defaultMozcoinData';
import { AuditLogEntry, CriticalAuditAction } from '../types/audit';
import { INITIAL_AUDIT_LOGS } from '../data/mockAuditLogs';
import { INITIAL_TASKS } from '../data/tasksData';
import { INITIAL_CALENDAR_EVENTS } from '../data/calendarEventsData';
import { INITIAL_CONTAS_RECEBER, INITIAL_CONTAS_PAGAR } from '../data/defaultFinanceData';
import { INITIAL_PAYMENT_RECORDS } from '../data/defaultPaymentData';
import { DEFAULT_STUDIO_TEMPLATES } from '../data/defaultStudioTemplates';
import { DEFAULT_OFFICIAL_SIGNERS, INITIAL_SYSTEM_SIGNATURES } from '../data/defaultSignatures';
import { 
  CEU_AZUL_INSTITUTION, 
  CEU_AZUL_INSTITUTION_ID,
  CEU_AZUL_STUDENTS, 
  CEU_AZUL_DIRECTOR, 
  CEU_AZUL_CEO 
} from '../data/ceuAzulData';
import { bootstrapCeuAzul } from '../services/ceuAzulBootstrap';
import { generateDigitalSeal, generateVerificationHash, checkUserSignatureAuthorization } from '../utils/signatureSecurity';
import { 
  INITIAL_INSTITUTIONS, 
  INITIAL_STUDENTS, 
  COURSES_DATA, 
  INITIAL_CLASSES, 
  INITIAL_TRANSFERS,
  INITIAL_SCHEDULES,
  CONTRACT_TEMPLATES, 
  INITIAL_GENERATED_CONTRACTS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_CASH_SESSIONS,
  INITIAL_LESSONS,
  INITIAL_ATTENDANCE_AUDITS,
  INITIAL_ACCESS_LOGS,
  INITIAL_TEACHERS,
  INITIAL_WHATSAPP_CONFIG,
  INITIAL_DASHBOARD_TASKS,
  INITIAL_NOTICES,
  INITIAL_REGISTRATIONS,
  DEFAULT_ONLINE_REGISTRATION_CONFIG,
  INITIAL_CALCULATION_FORMULAS,
  INITIAL_EVALUATIONS,
  INITIAL_INTERNSHIPS,
  INITIAL_PAUTA_HOMOLOGATIONS,
  CERTIFICATES_DATA
} from '../data/mockData';
import {
  INITIAL_INSTITUTION_WHATSAPP_CONFIG,
  INITIAL_WHATSAPP_TEMPLATES,
  INITIAL_WHATSAPP_AUTOMATIONS,
  INITIAL_WHATSAPP_CAMPAIGNS,
  INITIAL_WHATSAPP_LOGS,
  INITIAL_WHATSAPP_CONSENTS,
  interpolateWhatsAppVariables
} from '../data/whatsappData';
import { INITIAL_ANNOUNCEMENTS } from '../data/announcementsData';
import { soundManager } from '../utils/audio';
import { auth, signInWithGoogle, signOutUser, testConnection } from '../services/firebase';
import { 
  getInstitutions, 
  saveInstitutionToFirestore, 
  getStudentsByInstitution,
  saveStudentToFirestore, 
  getCoursesByInstitution,
  saveCourseToFirestore, 
  getClassesByInstitution,
  saveClassToFirestore, 
  deleteClassFromFirestore,
  getTransfersByInstitution,
  saveTransferToFirestore,
  getSchedulesByInstitution,
  saveScheduleSlotToFirestore,
  deleteScheduleSlotFromFirestore,
  getTeachersByInstitution,
  saveTeacherToFirestore,
  deleteTeacherFromFirestore,
  getCashSessionsByInstitution,
  saveCashSessionToFirestore, 
  getLessonsByInstitution,
  saveLessonToFirestore, 
  deleteLessonFromFirestore,
  getAccessLogsByInstitution,
  saveAccessLogToFirestore, 
  getAttendanceAuditsByInstitution,
  saveAttendanceAuditToFirestore,
  getCertificatesByInstitution,
  getPaymentsByInstitution,
  saveUserProfile, 
  getUserProfile,
  updateUserPreferences,
  checkIsSuperAdmin
} from '../services/firestoreService';
import { authService } from '../auth/authService';
import { toCanonicalRole } from '../types/rbac';
import { getDefaultRouteForRole, getRoleDisplayName } from '../security/routeSecurity';

interface AppContextType {
  themeMode: 'branco' | 'escuro';
  setThemeMode: (mode: 'branco' | 'escuro') => void;
  toggleThemeMode: () => void;
  currentRoute: AppRoute;
  routeParams: Record<string, any>;
  navigate: (route: AppRoute, params?: Record<string, any>) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  authorizedRoles: UserRole[];
  switchRole: (role: UserRole) => boolean;
  hasSigarProfile: boolean;
  userProfile: UserProfile | null;

  // Firebase Auth & Cloud Status
  firebaseUser: User | null;
  isFirebaseConnected: boolean;
  isSyncing: boolean;
  authLoadingPhase: 'idle' | 'verificando_sessao' | 'carregando_perfil' | 'carregando_instituicao' | 'carregando_dados';
  onboardingCompleted: boolean;
  completeOnboarding: () => Promise<void>;
  restartOnboarding: () => void;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  
  // Multi-Institution & Multi-Branch Architecture
  institutions: Institution[];
  allInstitutions: Institution[];
  activeInstitution: Institution;
  setActiveInstitution: (inst: Institution) => void;
  addInstitution: (newInst: Omit<Institution, 'id' | 'code' | 'createdAt'>) => Institution;
  updateInstitution: (instId: string, updates: Partial<Institution>) => void;
  
  activeBranchId: string;
  setActiveBranchId: (branchId: string) => void;
  activeBranch: Branch | null;
  addBranch: (branchData: Omit<Branch, 'id' | 'institutionId' | 'createdAt'>) => Branch;
  
  updateInstitutionPrefixes: (prefixes: Partial<InstitutionPrefixes>) => void;
  updateInstitutionFinancialSettings: (settings: Partial<FinancialSettings>) => void;
  addInstitutionBankAccount: (account: Omit<InstitutionBankAccount, 'id'>) => void;
  removeInstitutionBankAccount: (accountId: string) => void;

  // 63. SISTEMA DE PLANOS E LIMITES (SUPER ADMIN)
  systemPlans: PlanDefinition[];
  updatePlanDefinition: (planId: PlanId, updates: Partial<PlanDefinition>) => void;
  updateInstitutionPlan: (instId: string, planName: PlanName, customOverrides?: Partial<PlanLimits>, notes?: string) => void;
  getEffectivePlanLimits: (institution: Institution) => PlanLimits;
  checkResourceUsage: (institution: Institution, resource: keyof PlanLimits, currentVal?: number) => {
    allowed: boolean;
    current: number;
    max: number;
    percentage: number;
    isUnlimited: boolean;
    status: 'normal' | 'warning' | 'critical' | 'exceeded';
  };

  // Students (Strictly Isolated by Institution & Branch)
  students: Student[];
  selectedStudent: Student | null;
  addStudent: (studentData: Omit<Student, 'id' | 'code'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  terminateStudent: (studentId: string, terminationData: StudentTermination) => void;
  reactivateStudent: (studentId: string, newStatus: StudentStatus, reactivationReason: string, responsibleUser: string) => void;
  changeStudentStatus: (studentId: string, newStatus: StudentStatus, justification?: string, responsibleUser?: string) => void;

  // Courses & Classes (Strictly Isolated by Institution & Branch)
  courses: Course[];
  allCourses: Course[];
  addCourse: (courseData: Omit<Course, 'id' | 'institutionId'>) => Course;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addModuleToCourse: (courseId: string, module: Omit<CourseModule, 'id'>) => CourseModule;
  updateCourseModule: (courseId: string, moduleId: string, updates: Partial<CourseModule>) => void;
  deleteCourseModule: (courseId: string, moduleId: string) => void;
  classes: ClassGroup[];
  allClasses: ClassGroup[];
  addClassGroup: (classData: Omit<ClassGroup, 'id' | 'institutionId'>) => ClassGroup;
  updateClassGroup: (classId: string, updates: Partial<ClassGroup>) => void;
  deleteClassGroup: (classId: string) => void;
  duplicateClassGroup: (sourceClassId: string, newName: string, newShift: ClassGroup['shift'], newRoom: string) => ClassGroup;
  transferStudent: (params: {
    studentId: string;
    fromClassId: string;
    toClassId: string;
    reason: string;
    authorizedBy: string;
    notes?: string;
    keepAcademicRecords?: boolean;
  }) => StudentClassTransfer;
  addStudentToClass: (classId: string, studentId: string) => void;
  removeStudentFromClass: (classId: string, studentId: string) => void;
  classTransfers: StudentClassTransfer[];
  allClassTransfers: StudentClassTransfer[];

  // 13. Horários & Calendário (Isolados por Instituição & Filial com Detecção de Conflitos)
  schedules: ClassScheduleSlot[];
  allSchedules: ClassScheduleSlot[];
  addScheduleSlot: (slot: Omit<ClassScheduleSlot, 'id' | 'institutionId'>) => { success: boolean; conflict?: ScheduleConflict; conflicts: ScheduleConflict[] };
  updateScheduleSlot: (id: string, updates: Partial<ClassScheduleSlot>) => { success: boolean; conflict?: ScheduleConflict; conflicts: ScheduleConflict[] };
  deleteScheduleSlot: (id: string) => void;
  detectScheduleConflicts: (slot: Omit<ClassScheduleSlot, 'id'>, excludeSlotId?: string) => ConflictDetectionResult;

  // 14. Professores & Formadores (Isolados por Instituição & Filial)
  teachers: Teacher[];
  allTeachers: Teacher[];
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'code' | 'createdAt'>) => Teacher;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  activeTeacherId: string | null;
  setActiveTeacherId: (id: string | null) => void;
  activeTeacher: Teacher | null;
  // Visões com Escopo Estrito do Docente (Professor deve ver apenas aquilo que lhe foi atribuído)
  teacherAssignedClasses: ClassGroup[];
  teacherAssignedStudents: Student[];
  teacherAssignedSchedules: ClassScheduleSlot[];
  teacherAssignedLessons: ClassLesson[];

  // Cash Register (Caixa Escolar - Isolated by Institution & Branch)
  cashSessions: CashRegisterSession[];
  activeCashSession: CashRegisterSession;
  addCashTransaction: (transaction: Omit<CashTransaction, 'id' | 'timestamp'>) => void;
  openCashRegister: (initialAmount: number, operatorName: string) => void;
  closeCashRegister: (notes: string, reportedAmount?: number) => void;

  // Lessons & Attendance (16. AULAS E FREQUÊNCIA)
  lessons: ClassLesson[];
  attendanceAuditLogs: LessonAttendanceAuditLog[];
  addLesson: (lessonData: Omit<ClassLesson, 'id'>) => void;
  updateLesson: (lessonId: string, updates: Partial<ClassLesson>) => void;
  deleteLesson: (lessonId: string) => void;
  saveAttendance: (
    lessonId: string, 
    attendances: { [studentId: string]: AttendanceStatus | boolean },
    options?: {
      isCorrection?: boolean;
      correctionReason?: string;
      actionType?: 'registro_inicial' | 'marcar_todos_presentes' | 'correcao' | 'desbloqueio';
      notes?: { [studentId: string]: string };
      lockAttendance?: boolean;
    }
  ) => void;
  unlockLessonAttendance: (lessonId: string, reason: string, authorizedBy?: string) => boolean;
  addAttendanceAuditEntry: (entry: Omit<LessonAttendanceAuditLog, 'id' | 'timestamp'>) => void;
  saveStudentAssessmentScore: (params: {
    classGroupId: string;
    studentId: string;
    assessmentTitle: string;
    moduleName: string;
    weight: number;
    maxScore: number;
    score: number;
    date: string;
    teacherName?: string;
  }) => void;

  // 17. MOTOR DE AVALIAÇÕES & FÓRMULAS DE CÁLCULO
  evaluations: EvaluationItem[];
  allEvaluations: EvaluationItem[];
  calculationFormulas: CalculationFormula[];
  allCalculationFormulas: CalculationFormula[];
  addEvaluation: (item: Omit<EvaluationItem, 'id' | 'createdAt'>) => string;
  updateEvaluation: (id: string, updates: Partial<EvaluationItem>) => void;
  deleteEvaluation: (id: string) => void;
  saveEvaluationScore: (evaluationId: string, studentId: string, score: number, maxScore?: number, notes?: string) => void;
  saveBulkEvaluationScores: (evaluationId: string, scores: Record<string, { score: number; notes?: string }>) => void;
  addCalculationFormula: (formula: Omit<CalculationFormula, 'id' | 'createdAt'>) => string;
  updateCalculationFormula: (id: string, updates: Partial<CalculationFormula>) => void;
  deleteCalculationFormula: (id: string) => void;
  calculateStudentFinalGrade: (
    studentId: string,
    classGroupId: string,
    discipline?: string,
    period?: string,
    formulaId?: string
  ) => StudentCalculatedGrade | null;

  // 18. PAUTAS ACADÊMICAS & HOMOLOGAÇÃO
  pautaHomologations: PautaHomologationRecord[];
  allPautaHomologations: PautaHomologationRecord[];
  homologatePauta: (data: Omit<PautaHomologationRecord, 'id' | 'homologatedAt'>) => void;
  overrideStudentPautaSituation: (pautaKey: string, studentId: string, newSituation: PautaSituacao, justification: string) => void;

  // 20. MÓDULO DE ESTÁGIOS CURRICULARES E PROFISSIONAIS
  internships: InternshipContract[];
  allInternships: InternshipContract[];
  addInternship: (item: Omit<InternshipContract, 'id' | 'createdAt'>) => string;
  updateInternship: (id: string, updates: Partial<InternshipContract>) => void;
  deleteInternship: (id: string) => void;
  evaluateInternship: (id: string, evaluation: InternshipEvaluation) => void;
  changeInternshipStatus: (id: string, newStatus: InternshipStatus) => void;

  // 51. Certificados & Relatórios Académicos
  certificates: CertificateData[];
  allCertificates: CertificateData[];
  addCertificate: (certData: Omit<CertificateData, 'id'>) => CertificateData;

  // Gate & Access Control (Portaria - Isolated)
  accessLogs: GateAccessLog[];
  logGateAccess: (
    studentId: string, 
    type: 'entrada' | 'saida', 
    customLocation?: string, 
    customOperator?: string, 
    sendNotification?: boolean
  ) => GateAccessLog | null;
  confirmStudentEntry: (studentId: string) => GateAccessLog | null;

  // WhatsApp (Isolated per Institution - Enterprise Integration Layer)
  whatsappConfig: WhatsAppConnection;
  updateWhatsAppConfig: (updates: Partial<WhatsAppConnection>) => void;
  whatsAppTemplates: WhatsAppMessageTemplate[];
  allWhatsAppTemplates: WhatsAppMessageTemplate[];
  whatsAppCampaigns: WhatsAppCampaign[];
  allWhatsAppCampaigns: WhatsAppCampaign[];
  whatsAppAutomations: WhatsAppAutomationRule[];
  allWhatsAppAutomations: WhatsAppAutomationRule[];
  whatsAppLogs: WhatsAppMessageLog[];
  allWhatsAppLogs: WhatsAppMessageLog[];
  whatsAppConsents: WhatsAppConsentRecord[];
  sendDirectWhatsAppMessage: (params: { 
    recipientPhone: string; 
    recipientName: string; 
    recipientType?: 'aluno' | 'encarregado' | 'professor' | 'funcionario' | 'outro'; 
    category: WhatsAppTemplateCategory; 
    message: string; 
    source?: 'manual' | 'campanha' | 'automacao' | 'portaria' | 'tesouraria'; 
    documentAttachment?: { name: string; type: string; url?: string }; 
    openDirectlyInWeb?: boolean 
  }) => { success: boolean; error?: string };
  createWhatsAppTemplate: (template: Omit<WhatsAppMessageTemplate, 'id' | 'updatedAt' | 'institutionId'>) => void;
  updateWhatsAppTemplate: (id: string, updates: Partial<WhatsAppMessageTemplate>) => void;
  deleteWhatsAppTemplate: (id: string) => void;
  createWhatsAppCampaign: (campaign: Omit<WhatsAppCampaign, 'id' | 'createdAt' | 'sentCount' | 'failedCount' | 'status' | 'institutionId'>) => void;
  executeWhatsAppCampaign: (campaignId: string) => Promise<{ sent: number; failed: number }>;
  createWhatsAppAutomation: (rule: Omit<WhatsAppAutomationRule, 'id' | 'institutionId' | 'totalTriggeredCount'>) => void;
  toggleWhatsAppAutomation: (id: string, enabled: boolean) => void;
  runWhatsAppAutomationNow: (ruleId: string) => Promise<{ triggeredCount: number }>;
  updateWhatsAppConsent: (phone: string, name: string, optIn: boolean, reason?: string) => void;
  simulateWhatsAppPairing: (method: 'qr' | 'code', phoneNumber?: string) => Promise<{ success: boolean; pairingCode?: string }>;
  disconnectWhatsAppDevice: () => void;

  // Financial Settings (Isolated per Institution)
  financialSettings: FinancialSettings;
  updateFinancialSettings: (settings: Partial<FinancialSettings>) => void;

  // 21. CONTRATOS & TERMOS OFICIAIS
  contractTemplates: ContractTemplate[];
  generatedContracts: GeneratedContract[];
  saveContractTemplate: (template: ContractTemplate) => void;
  createContractTemplate: (template: Omit<ContractTemplate, 'id' | 'versionHistory' | 'updatedAt'>) => string;
  updateContractTemplateWithVersion: (templateId: string, updates: Partial<ContractTemplate>, changeNotes?: string, newVersion?: string) => void;
  restoreContractTemplateVersion: (templateId: string, targetVersion: string) => void;
  generateContractForStudent: (studentId: string, templateId: string) => GeneratedContract;
  generateContractWithVariables: (params: { 
    templateId: string; 
    studentId: string; 
    customVariables?: Record<string, string | number>; 
    notes?: string; 
    autoSignStudent?: boolean;
    autoSignDirector?: boolean;
  }) => GeneratedContract;
  updateContractStatus: (contractId: string, newStatus: ContractStatus, reason?: string) => void;
  renewContract: (contractId: string, newDuration?: string, newValue?: number, notes?: string) => GeneratedContract | null;
  signContract: (contractId: string, party: 'student' | 'director', details: { signerName: string; signatureDataUrl?: string; documentNumber?: string }) => void;

  // 22. DOCUMENT STUDIO
  studioTemplates: StudioTemplate[];
  allStudioTemplates: StudioTemplate[];
  saveStudioTemplate: (template: StudioTemplate) => void;
  createStudioTemplate: (templateData: Partial<StudioTemplate>) => StudioTemplate;
  duplicateStudioTemplate: (templateId: string) => StudioTemplate;
  toggleActiveStudioTemplate: (templateId: string) => void;
  deleteStudioTemplate: (templateId: string) => void;
  restoreStudioTemplateVersion: (templateId: string, versionNumber: string) => void;
  createStudioTemplateVersion: (templateId: string, versionNumber: string, notes: string) => void;

  // 23. SISTEMA DE ASSINATURAS ELETRÓNICAS E DIGITAIS
  allSystemSignatures: SystemSignature[];
  systemSignatures: SystemSignature[];
  officialSigners: OfficialSigner[];
  signDocumentSignature: (signatureId: string, signatureDataUrl?: string, customSignerName?: string) => { success: boolean; message: string };
  rejectDocumentSignature: (signatureId: string, reason: string) => { success: boolean; message: string };
  revokeDocumentSignature: (signatureId: string, reason: string) => { success: boolean; message: string };
  createSignatureRequest: (data: Partial<SystemSignature>) => SystemSignature;
  addOfficialSigner: (signer: Omit<OfficialSigner, 'id' | 'registeredAt'>) => OfficialSigner;
  updateOfficialSigner: (id: string, updates: Partial<OfficialSigner>) => void;
  deleteOfficialSigner: (id: string) => void;

  // Signatures Workflow Legacy Support
  signatures: DocumentSignature[];
  toggleSignature: (role: DocumentSignature['role']) => void;

  // Tasks & Notices
  dashboardTasks: DashboardTask[];
  toggleDashboardTask: (taskId: string) => void;
  addDashboardTask: (task: Omit<DashboardTask, 'id' | 'completed'>) => void;
  dashboardNotices: StudentNotice[];
  addDashboardNotice: (notice: Omit<StudentNotice, 'id' | 'date'>) => void;

  // Student Dossier Lifecycle
  addStudentAuditEntry: (studentId: string, entry: Omit<StudentAuditEntry, 'id' | 'timestamp'>) => void;
  addStudentHistoryEvent: (studentId: string, event: Omit<StudentHistoryEvent, 'id' | 'date'>) => void;
  addStudentDocument: (studentId: string, doc: Omit<StudentAttachedDocument, 'id' | 'uploadDate'>) => void;

  // Notifications
  notifications: LiveNotification[];
  unreadCount: number;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<LiveNotification, 'id' | 'timestamp' | 'read'>) => void;
  clearNotifications: () => void;

  // Quick Action
  openWhatsAppMessage: (phone: string, text: string) => void;

  // Inscrições Online & Candidatos (Isolados por Instituição & Filial)
  applications: RegistrationApplication[];
  allApplications: RegistrationApplication[];
  onlineRegistrationConfig: OnlineRegistrationConfig;
  updateOnlineRegistrationConfig: (configUpdates: Partial<OnlineRegistrationConfig>) => void;
  addApplication: (newApp: Omit<RegistrationApplication, 'id' | 'code' | 'createdAt'>) => RegistrationApplication;
  updateApplication: (id: string, updates: Partial<RegistrationApplication>) => void;
  approveApplication: (id: string, notes: string, actorName?: string) => void;
  rejectApplication: (id: string, rejectionReason: string, notes?: string, actorName?: string) => void;
  convertCandidateToStudent: (candidateId: string, classId: string, initialStatus?: StudentStatus, targetRegime?: string) => Student | null;
  deleteApplication: (id: string) => void;

  // 29. FINANCEIRO (CONTAS A RECEBER E CONTAS A PAGAR)
  contasReceber: ContaReceber[];
  allContasReceber: ContaReceber[];
  contasPagar: ContaPagar[];
  allContasPagar: ContaPagar[];
  addContaReceber: (item: Omit<ContaReceber, 'id' | 'createdAt'>) => string;
  updateContaReceber: (id: string, updates: Partial<ContaReceber>) => void;
  deleteContaReceber: (id: string) => void;
  receiveContaPayment: (id: string, paymentData: {
    paidAmount: number;
    paymentMethod: 'Dinheiro' | 'M-Pesa' | 'e-Mola' | 'Ponto24' | 'Transferência Bancária' | 'POS';
    receiptNumber?: string;
    notes?: string;
    registerInCash?: boolean;
    operator?: string;
  }) => void;
  addContaPagar: (item: Omit<ContaPagar, 'id' | 'createdAt'>) => string;
  updateContaPagar: (id: string, updates: Partial<ContaPagar>) => void;
  deleteContaPagar: (id: string) => void;
  payContaPagar: (id: string, paymentData: {
    paymentMethod: 'Transferência Bancária' | 'M-Pesa' | 'e-Mola' | 'Dinheiro (Caixa)' | 'Cheque' | 'POS';
    paymentDate?: string;
    invoiceNumber?: string;
    notes?: string;
    deductFromCash?: boolean;
    paidBy?: string;
  }) => void;

  // 30. PAGAMENTOS (PORTAL EFETUAR PAGAMENTO)
  paymentRecords: PaymentRecord[];
  allPaymentRecords: PaymentRecord[];
  submitPayment: (data: Omit<PaymentRecord, 'id' | 'createdAt' | 'status' | 'serviceReleased' | 'auditTrail'>) => string;
  approvePayment: (id: string, notes?: string, actorName?: string) => void;
  rejectPayment: (id: string, rejectionReason: string, actorName?: string) => void;
  requestPaymentCorrection: (id: string, correctionNotes: string, actorName?: string) => void;
  resubmitPayment: (id: string, updates: { transactionCode: string; amount: number; date: string; time: string; network: PaymentNetwork; proofUrl?: string; proofFileName?: string }) => void;
  deletePaymentRecord: (id: string) => void;
  recordReceiptReprint: (id: string, operatorName?: string) => void;

  // Utilizador Ativo
  currentUser: {
    id: string;
    name: string;
    email?: string;
    role: UserRole;
  };

  // 36. MÓDULO DE TAREFAS
  tasks: TaskItem[];
  allTasks: TaskItem[];
  addTask: (taskData: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'institutionId'>) => TaskItem;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  deleteTask: (taskId: string) => void;
  changeTaskState: (taskId: string, newState: TaskState) => void;
  addTaskNote: (taskId: string, noteData: { content: string; visibility: TaskNoteVisibility; authorizedRoles?: string[] }) => void;
  deleteTaskNote: (taskId: string, noteId: string) => void;
  addTaskAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  removeTaskAttachment: (taskId: string, attachmentId: string) => void;

  // 37. MÓDULO DE CALENDÁRIO GERAL
  calendarEvents: CalendarCustomEvent[];
  allCalendarEvents: CalendarCustomEvent[];
  addCalendarEvent: (eventData: Omit<CalendarCustomEvent, 'id' | 'createdAt' | 'updatedAt' | 'institutionId'>) => CalendarCustomEvent;
  updateCalendarEvent: (id: string, updates: Partial<CalendarCustomEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // 50. COMUNICADOS (MÓDULO DE COMUNICADOS INSTITUCIONAIS)
  announcements: Announcement[];
  allAnnouncements: Announcement[];
  addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'readCount' | 'confirmedCount'>) => Announcement;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  publishAnnouncementNow: (id: string) => void;
  markAnnouncementAsRead: (id: string) => void;
  confirmAnnouncementAttendance: (id: string) => void;

  // 53. AUDITORIA (MÓDULO DE AUDITORIA CRÍTICA)
  auditLogs: AuditLogEntry[];
  allAuditLogs: AuditLogEntry[];
  logCriticalAction: (entry: {
    action: CriticalAuditAction;
    actionLabel?: string;
    entity: string;
    entityId: string;
    relevantValues: {
      summary: string;
      previousValue?: any;
      newValue?: any;
      metadata?: Record<string, any>;
    };
    severity?: 'info' | 'aviso' | 'critico';
    ipAddress?: string;
    userId?: string;
    userName?: string;
    userRole?: string;
  }) => AuditLogEntry;
  purgeAuditLogs: () => { success: boolean; message: string };

  // Instituição: Módulos e Permissões Customizadas por Instituição
  updateInstitutionModules: (
    institutionId: string, 
    modules: Partial<InstitutionFeatureModules>,
    teacherPerms?: Partial<TeacherPortalPermissions>,
    studentPerms?: Partial<StudentPortalPermissions>
  ) => void;

  // Student Authentication via Registration Code
  authenticatedStudent: Student | null;
  loginStudentByCode: (code: string) => { success: boolean; student?: Student; error?: string };
  logoutStudent: () => void;

  // ==========================================
  // 86. MOZCOIN — ECONOMIA INTERNA DA PLATAFORMA
  // ==========================================
  mozcoinWallets: MozcoinWallet[];
  allMozcoinWallets: MozcoinWallet[];
  mozcoinTransactions: MozcoinTransaction[];
  allMozcoinTransactions: MozcoinTransaction[];
  mozcoinPurchases: MozcoinPurchaseRequest[];
  allMozcoinPurchases: MozcoinPurchaseRequest[];
  mozcoinDiscountRules: MozcoinDiscountRule[];
  mozcoinEcosystemServices: MozcoinEcosystemService[];
  activeUserWallet: MozcoinWallet | null;
  activeInstitutionWallet: MozcoinWallet | null;
  
  requestMozcoinPurchase: (params: {
    targetWallet: 'user' | 'institution';
    mozcoinAmount: number;
    paymentMethod: MozcoinPaymentMethod;
    transactionCode: string;
    paymentDate: string;
    paymentTime: string;
    network: string;
    proofUrl?: string;
    proofFileName?: string;
  }) => MozcoinPurchaseRequest;

  approveMozcoinPurchase: (purchaseId: string, actorName?: string) => void;
  rejectMozcoinPurchase: (purchaseId: string, reason: string, actorName?: string) => void;
  requestPurchaseCorrection: (purchaseId: string, notes: string, actorName?: string) => void;
  resubmitPurchaseCorrection: (purchaseId: string, updates: { transactionCode: string; proofUrl?: string; proofFileName?: string; network?: string; paymentDate?: string }) => void;
  
  consumeMozcoinService: (params: {
    walletId: string;
    serviceId: string;
    quantity?: number;
    referenceNotes?: string;
    advanceMonths?: number;
  }) => { success: boolean; error?: string; transaction?: MozcoinTransaction };

  updateDiscountRule: (ruleId: string, updates: Partial<MozcoinDiscountRule>) => void;
  addDiscountRule: (rule: Omit<MozcoinDiscountRule, 'id' | 'createdAt' | 'updatedAt'>) => MozcoinDiscountRule;
  deleteDiscountRule: (ruleId: string) => void;

  // ==========================================
  // 87. MOZTECHWAVE ID — IDENTIDADE CENTRAL
  // ==========================================
  moztechwaveIdentities: MoztechwaveIdentity[];
  activeMoztechwaveIdentity: MoztechwaveIdentity | null;
  loginWithMoztechwaveId: (params: {
    role: UserRole;
    institutionId: string;
    branchId: string;
    authMethod: string;
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlRoute = searchParams.get('route');
      if (urlRoute) return urlRoute as AppRoute;
      const path = window.location.pathname;
      if (path.includes('/inscricao') || path.includes('/candidatura')) return 'inscricao_publica';
      if (path.includes('/verify')) return 'public_verify';
    }
    return 'public_portal';
  });
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});
  const [activeRole, setActiveRoleState] = useState<UserRole>('visitante');
  const [authorizedRoles, setAuthorizedRoles] = useState<UserRole[]>(['VISITANTE']);
  const [hasSigarProfile, setHasSigarProfile] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Theme Management (Fundo Branco vs Escuro - Default 'branco' as requested)
  const [themeMode, setThemeModeState] = useState<'branco' | 'escuro'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sigar_theme');
      if (saved === 'escuro') return 'escuro';
    }
    return 'branco';
  });

  const setThemeMode = (mode: 'branco' | 'escuro') => {
    setThemeModeState(mode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sigar_theme', mode);
        if (mode === 'branco') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          document.body.classList.remove('dark', 'bg-slate-950', 'text-slate-100');
          document.body.classList.add('bg-white', 'text-slate-900');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          document.body.classList.add('dark', 'bg-slate-950', 'text-slate-100');
          document.body.classList.remove('bg-white', 'text-slate-900');
        }
      } catch (e) {
        console.error('Erro ao guardar tema:', e);
      }
    }
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === 'branco' ? 'escuro' : 'branco');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (themeMode === 'branco') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.body.classList.remove('dark', 'bg-slate-950', 'text-slate-100');
        document.body.classList.add('bg-white', 'text-slate-900');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body.classList.add('dark', 'bg-slate-950', 'text-slate-100');
        document.body.classList.remove('bg-white', 'text-slate-900');
      }
    }
  }, [themeMode]);

  const setActiveRole = (role: UserRole) => {
    const isSuper = (authorizedRoles || []).map(r => toCanonicalRole(r)).includes('SUPER_ADMIN');
    const canonicalNew = toCanonicalRole(role);
    const isAllowed = isSuper || (authorizedRoles || []).map(r => toCanonicalRole(r)).includes(canonicalNew);
    if (!isAllowed) {
      console.warn(`Tentativa de violação de perfil bloqueada: Perfil "${role}" não autorizado para este utilizador.`);
      return;
    }
    setActiveRoleState(role);
    authService.switchRole(role);
  };

  const switchRole = (newRole: UserRole): boolean => {
    const isSuper = (authorizedRoles || []).map(r => toCanonicalRole(r)).includes('SUPER_ADMIN');
    const canonicalNew = toCanonicalRole(newRole);
    const isAllowed = isSuper || (authorizedRoles || []).map(r => toCanonicalRole(r)).includes(canonicalNew);

    if (!isAllowed) {
      addNotification({
        title: 'Acesso Negado',
        message: `O seu utilizador não possui autorização para assumir o perfil de "${getRoleDisplayName(newRole)}".`,
        type: 'warning'
      });
      soundManager.playError();
      return false;
    }

    setActiveRoleState(newRole);
    authService.switchRole(newRole);

    const defaultRoute = getDefaultRouteForRole(newRole);
    setCurrentRoute(defaultRoute);

    addNotification({
      title: 'Perfil Ativo Atualizado',
      message: `A operar agora no perfil de ${getRoleDisplayName(newRole)}.`,
      type: 'system'
    });
    soundManager.playClick();
    return true;
  };

  // Firebase Auth & Cloud Connectivity State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Helper to strictly deduplicate institutions by unique ID (prevents React duplicate key errors)
  const deduplicateInstitutions = (list: Institution[]): Institution[] => {
    const seen = new Set<string>();
    return list.filter(item => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  // Multi-Institution Central State (Defaults to Centro Infantil Céu Azul and INITIAL_INSTITUTIONS)
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>(() =>
    deduplicateInstitutions([
      CEU_AZUL_INSTITUTION as Institution,
      ...INITIAL_INSTITUTIONS
    ])
  );
  const [activeInstitutionId, setActiveInstitutionId] = useState<string>(CEU_AZUL_INSTITUTION_ID);
  const [activeBranchId, setActiveBranchId] = useState<string>('todas');

  // Progressive Auth Loading & Onboarding Guided Tour State (PARTE 4, 14, 15)
  const [authLoadingPhase, setAuthLoadingPhase] = useState<
    'idle' | 'verificando_sessao' | 'carregando_perfil' | 'carregando_instituicao' | 'carregando_dados'
  >('idle');
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true);

  const defaultEmptyInstitution: Institution = {
    id: '',
    name: 'Nenhuma Instituição Registada',
    code: 'SIGAR',
    type: 'instituicao_ensino',
    nuit: '',
    licenseNumber: '',
    representativeName: '',
    representativeRole: '',
    repLegal: '',
    email: '',
    phone: '',
    city: 'Moçambique',
    province: 'Maputo Cidade',
    address: '',
    plan: 'Básico',
    status: 'Ativa',
    connectedSystem: 'SIGAR',
    sivecEnabled: false,
    activeBranches: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    createdAt: '',
    branches: []
  };

  const activeInstitution = allInstitutions.find(i => i.id === activeInstitutionId) || allInstitutions[0] || defaultEmptyInstitution;
  const activeBranch = activeInstitution?.branches?.find(b => b.id === activeBranchId) || null;

  // 63. Sistema de Planos e Limites de Recursos (Super Admin)
  const [systemPlans, setSystemPlans] = useState<PlanDefinition[]>(() => {
    const saved = localStorage.getItem('mtw_system_plans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved system plans:', e);
      }
    }
    return DEFAULT_PLANS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_system_plans', JSON.stringify(systemPlans));
    } catch (e) {
      console.warn('Failed to save system plans to localStorage:', e);
    }
  }, [systemPlans]);

  // Core Data Stores (Master Data across system, strictly from real Firestore - starts EMPTY)
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allClasses, setAllClasses] = useState<ClassGroup[]>([]);
  const [allCashSessions, setAllCashSessions] = useState<CashRegisterSession[]>([]);
  const [allLessons, setAllLessons] = useState<ClassLesson[]>([]);
  const [allAttendanceAudits, setAllAttendanceAudits] = useState<LessonAttendanceAuditLog[]>([]);
  const [allAccessLogs, setAllAccessLogs] = useState<GateAccessLog[]>([]);
  const [dashboardTasks, setDashboardTasks] = useState<DashboardTask[]>([]);
  const [dashboardNotices, setDashboardNotices] = useState<StudentNotice[]>([]);
  const [allClassTransfers, setAllClassTransfers] = useState<StudentClassTransfer[]>([]);
  const [allSchedules, setAllSchedules] = useState<ClassScheduleSlot[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);

  // 53. AUDITORIA (TRILHA DE AUDITORIA IMUTÁVEL E CRÍTICA)
  const [allAuditLogs, setAllAuditLogs] = useState<AuditLogEntry[]>([]);

  // Autenticação de Aluno por Código Único (Portal do Aluno)
  const [authenticatedStudent, setAuthenticatedStudent] = useState<Student | null>(null);

  // 17. MOTOR DE AVALIAÇÕES E FÓRMULAS DE CÁLCULO (Local Storage & Core State)
  const [allEvaluations, setAllEvaluations] = useState<EvaluationItem[]>(() => {
    const saved = localStorage.getItem('mtw_evaluations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved evaluations:', e);
      }
    }
    return INITIAL_EVALUATIONS;
  });

  const [allCalculationFormulas, setAllCalculationFormulas] = useState<CalculationFormula[]>(() => {
    const saved = localStorage.getItem('mtw_calculation_formulas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved calculation formulas:', e);
      }
    }
    return INITIAL_CALCULATION_FORMULAS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_evaluations', JSON.stringify(allEvaluations));
    } catch (e) {
      console.warn('Failed to save evaluations to localStorage:', e);
    }
  }, [allEvaluations]);

  useEffect(() => {
    try {
      localStorage.setItem('mtw_calculation_formulas', JSON.stringify(allCalculationFormulas));
    } catch (e) {
      console.warn('Failed to save calculation formulas to localStorage:', e);
    }
  }, [allCalculationFormulas]);

  // 18. PAUTAS HOMOLOGADAS
  const [allPautaHomologations, setAllPautaHomologations] = useState<PautaHomologationRecord[]>(() => {
    const saved = localStorage.getItem('mtw_pauta_homologations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved pauta homologations:', e);
      }
    }
    return INITIAL_PAUTA_HOMOLOGATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_pauta_homologations', JSON.stringify(allPautaHomologations));
    } catch (e) {
      console.warn('Failed to save pauta homologations:', e);
    }
  }, [allPautaHomologations]);

  // 20. ESTÁGIOS CURRICULARES & PROFISSIONAIS
  const [allInternships, setAllInternships] = useState<InternshipContract[]>([]);

  // 51. CERTIFICADOS (SIVEC)
  const [allCertificates, setAllCertificates] = useState<CertificateData[]>([]);

  // 29. FINANCEIRO - CONTAS A RECEBER E CONTAS A PAGAR
  const [allContasReceber, setAllContasReceber] = useState<ContaReceber[]>([]);
  const [allContasPagar, setAllContasPagar] = useState<ContaPagar[]>([]);

  // 30. PAGAMENTOS - SUBMISSÕES E HISTÓRICO
  const [allPaymentRecords, setAllPaymentRecords] = useState<PaymentRecord[]>([]);

  // 35. CAMADA DE INTEGRAÇÃO WHATSAPP (ESTADO PERSISTIDO POR INSTITUIÇÃO)
  const [allWhatsAppTemplates, setAllWhatsAppTemplates] = useState<WhatsAppMessageTemplate[]>(() => {
    const saved = localStorage.getItem('mtw_whatsapp_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved whatsapp templates:', e);
      }
    }
    return INITIAL_WHATSAPP_TEMPLATES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_whatsapp_templates', JSON.stringify(allWhatsAppTemplates));
    } catch (e) {
      console.warn('Failed to save whatsapp templates:', e);
    }
  }, [allWhatsAppTemplates]);

  const [allWhatsAppCampaigns, setAllWhatsAppCampaigns] = useState<WhatsAppCampaign[]>(() => {
    const saved = localStorage.getItem('mtw_whatsapp_campaigns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved whatsapp campaigns:', e);
      }
    }
    return INITIAL_WHATSAPP_CAMPAIGNS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_whatsapp_campaigns', JSON.stringify(allWhatsAppCampaigns));
    } catch (e) {
      console.warn('Failed to save whatsapp campaigns:', e);
    }
  }, [allWhatsAppCampaigns]);

  const [allWhatsAppAutomations, setAllWhatsAppAutomations] = useState<WhatsAppAutomationRule[]>(() => {
    const saved = localStorage.getItem('mtw_whatsapp_automations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved whatsapp automations:', e);
      }
    }
    return INITIAL_WHATSAPP_AUTOMATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_whatsapp_automations', JSON.stringify(allWhatsAppAutomations));
    } catch (e) {
      console.warn('Failed to save whatsapp automations:', e);
    }
  }, [allWhatsAppAutomations]);

  const [allWhatsAppLogs, setAllWhatsAppLogs] = useState<WhatsAppMessageLog[]>(() => {
    const saved = localStorage.getItem('mtw_whatsapp_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved whatsapp logs:', e);
      }
    }
    return INITIAL_WHATSAPP_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_whatsapp_logs', JSON.stringify(allWhatsAppLogs));
    } catch (e) {
      console.warn('Failed to save whatsapp logs:', e);
    }
  }, [allWhatsAppLogs]);

  const [allWhatsAppConsents, setAllWhatsAppConsents] = useState<WhatsAppConsentRecord[]>(() => {
    const saved = localStorage.getItem('mtw_whatsapp_consents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved whatsapp consents:', e);
      }
    }
    return INITIAL_WHATSAPP_CONSENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_whatsapp_consents', JSON.stringify(allWhatsAppConsents));
    } catch (e) {
      console.warn('Failed to save whatsapp consents:', e);
    }
  }, [allWhatsAppConsents]);

  // 36. MÓDULO DE TAREFAS - ESTADO & PERSISTÊNCIA
  const [allTasks, setAllTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('mtw_tasks_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved tasks:', e);
      }
    }
    return INITIAL_TASKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_tasks_v1', JSON.stringify(allTasks));
    } catch (e) {
      console.warn('Failed to save tasks:', e);
    }
  }, [allTasks]);

  // 37. MÓDULO DE CALENDÁRIO GERAL - ESTADO & PERSISTÊNCIA
  const [allCalendarEvents, setAllCalendarEvents] = useState<CalendarCustomEvent[]>(() => {
    const saved = localStorage.getItem('mtw_calendar_events_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved calendar events:', e);
      }
    }
    return INITIAL_CALENDAR_EVENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_calendar_events_v1', JSON.stringify(allCalendarEvents));
    } catch (e) {
      console.warn('Failed to save calendar events:', e);
    }
  }, [allCalendarEvents]);

  // 50. COMUNICADOS - ESTADO & PERSISTÊNCIA
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('mtw_announcements_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved announcements:', e);
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_announcements_v1', JSON.stringify(allAnnouncements));
    } catch (e) {
      console.warn('Failed to save announcements:', e);
    }
  }, [allAnnouncements]);

  // ==========================================
  // 86. MOZCOIN — ESTADO & PERSISTÊNCIA
  // ==========================================
  const [allMozcoinWallets, setAllMozcoinWallets] = useState<MozcoinWallet[]>(() => {
    const saved = localStorage.getItem('mtw_mozcoin_wallets_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved mozcoin wallets:', e);
      }
    }
    return DEFAULT_MOZCOIN_WALLETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_mozcoin_wallets_v1', JSON.stringify(allMozcoinWallets));
    } catch (e) {
      console.warn('Failed to save mozcoin wallets:', e);
    }
  }, [allMozcoinWallets]);

  const [allMozcoinTransactions, setAllMozcoinTransactions] = useState<MozcoinTransaction[]>(() => {
    const saved = localStorage.getItem('mtw_mozcoin_transactions_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved mozcoin transactions:', e);
      }
    }
    return DEFAULT_MOZCOIN_TRANSACTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_mozcoin_transactions_v1', JSON.stringify(allMozcoinTransactions));
    } catch (e) {
      console.warn('Failed to save mozcoin transactions:', e);
    }
  }, [allMozcoinTransactions]);

  const [allMozcoinPurchases, setAllMozcoinPurchases] = useState<MozcoinPurchaseRequest[]>(() => {
    const saved = localStorage.getItem('mtw_mozcoin_purchases_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved mozcoin purchases:', e);
      }
    }
    return DEFAULT_MOZCOIN_PURCHASES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_mozcoin_purchases_v1', JSON.stringify(allMozcoinPurchases));
    } catch (e) {
      console.warn('Failed to save mozcoin purchases:', e);
    }
  }, [allMozcoinPurchases]);

  const [mozcoinDiscountRules, setMozcoinDiscountRules] = useState<MozcoinDiscountRule[]>(() => {
    const saved = localStorage.getItem('mtw_mozcoin_discount_rules_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved mozcoin discount rules:', e);
      }
    }
    return DEFAULT_DISCOUNT_RULES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_mozcoin_discount_rules_v1', JSON.stringify(mozcoinDiscountRules));
    } catch (e) {
      console.warn('Failed to save mozcoin discount rules:', e);
    }
  }, [mozcoinDiscountRules]);

  const [mozcoinEcosystemServices, setMozcoinEcosystemServices] = useState<MozcoinEcosystemService[]>(() => {
    const saved = localStorage.getItem('mtw_mozcoin_services_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved mozcoin services:', e);
      }
    }
    return DEFAULT_ECOSYSTEM_SERVICES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_mozcoin_services_v1', JSON.stringify(mozcoinEcosystemServices));
    } catch (e) {
      console.warn('Failed to save mozcoin services:', e);
    }
  }, [mozcoinEcosystemServices]);

  // ==========================================
  // 87. MOZTECHWAVE ID — ESTADO & PERSISTÊNCIA
  // ==========================================
  const [moztechwaveIdentities, setMoztechwaveIdentities] = useState<MoztechwaveIdentity[]>(() => {
    const saved = localStorage.getItem('mtw_moztechwave_identities_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved moztechwave identities:', e);
      }
    }
    return DEFAULT_MOZTECHWAVE_IDENTITIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_moztechwave_identities_v1', JSON.stringify(moztechwaveIdentities));
    } catch (e) {
      console.warn('Failed to save moztechwave identities:', e);
    }
  }, [moztechwaveIdentities]);

  const [activeMoztechwaveIdentity, setActiveMoztechwaveIdentity] = useState<MoztechwaveIdentity | null>(() => {
    return DEFAULT_MOZTECHWAVE_IDENTITIES[0] || null;
  });

  // Initialize Firebase connection and data sync
  useEffect(() => {
    testConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        setAuthLoadingPhase('verificando_sessao');
        try {
          setAuthLoadingPhase('carregando_perfil');
          const isSuper = await checkIsSuperAdmin(user.uid);
          const existing = await getUserProfile(user.uid);

          if (existing?.preferences?.onboardingCompleted !== undefined) {
            setOnboardingCompleted(Boolean(existing.preferences.onboardingCompleted));
          } else {
            setOnboardingCompleted(true);
          }

          let effectiveRole: UserRole = 'visitante';
          let userAuthRoles: UserRole[] = [];
          let effectiveInstId = '';
          let effectiveBranchId = 'todas';

          if (user.email === 'jafimpaulo8@gmail.com') {
            // Mandato: Jafim Paulo é DIRETOR do Centro Infantil Céu Azul (NÃO Super Admin)
            effectiveRole = 'DIRETOR';
            userAuthRoles = ['DIRETOR'];
            effectiveInstId = CEU_AZUL_INSTITUTION_ID;
            effectiveBranchId = 'branch-ceu-azul-main';
            setUserProfile({
              id: user.uid,
              name: 'Jafim Paulo Rupia',
              email: 'jafimpaulo8@gmail.com',
              role: 'DIRETOR',
              roles: ['DIRETOR'],
              institutionId: CEU_AZUL_INSTITUTION_ID,
              branchId: 'branch-ceu-azul-main',
              status: 'Ativo'
            });
            setHasSigarProfile(true);
            bootstrapCeuAzul(user.uid).catch(err => console.warn('Ceu Azul bootstrap error:', err));
          } else if (user.email === 'andradaalfred02308@gmail.com') {
            // Mandato: Alfredo Andrade é CEO do Centro Infantil Céu Azul (NÃO Super Admin)
            effectiveRole = 'CEO';
            userAuthRoles = ['CEO'];
            effectiveInstId = CEU_AZUL_INSTITUTION_ID;
            effectiveBranchId = 'branch-ceu-azul-main';
            setUserProfile({
              id: user.uid,
              name: 'Alfredo Andrade',
              email: 'andradaalfred02308@gmail.com',
              role: 'CEO',
              roles: ['CEO'],
              institutionId: CEU_AZUL_INSTITUTION_ID,
              branchId: 'branch-ceu-azul-main',
              status: 'Ativo'
            });
            setHasSigarProfile(true);
            bootstrapCeuAzul(user.uid).catch(err => console.warn('Ceu Azul bootstrap error:', err));
          } else if (user.email === 'centromoz8@gmail.com') {
            // Secretaria Académica CFTPM Moztechwave: Egas Paulo (role = SECRETARIA, institutionId = 'moztechwave' / 'inst-1')
            effectiveRole = 'SECRETARIA';
            userAuthRoles = ['SECRETARIA'];
            effectiveInstId = 'inst-1';
            effectiveBranchId = 'branch-1-maputo';
            const secProfile = {
              id: user.uid,
              name: 'Egas Paulo',
              email: 'centromoz8@gmail.com',
              role: 'SECRETARIA' as UserRole,
              roles: ['SECRETARIA' as UserRole],
              institutionId: 'inst-1',
              institutionIds: ['inst-1', 'moztechwave'],
              branchId: 'branch-1-maputo',
              status: 'Ativo',
              codigoAcesso: 'MTW-SEC-001'
            };
            setUserProfile(secProfile);
            setHasSigarProfile(true);
            saveUserProfile(secProfile).catch(err => console.warn('Secretaria sync error:', err));
          } else if (existing) {
            setUserProfile(existing);
            setHasSigarProfile(true);

            if (Array.isArray(existing.roles) && existing.roles.length > 0) {
              userAuthRoles = existing.roles;
            } else if (existing.role) {
              userAuthRoles = [existing.role];
            } else {
              userAuthRoles = ['aluno'];
            }

            if (isSuper && !userAuthRoles.includes('SUPER_ADMIN')) {
              userAuthRoles = ['SUPER_ADMIN', ...userAuthRoles];
            }

            effectiveRole = isSuper ? 'SUPER_ADMIN' : userAuthRoles[0];
            effectiveInstId = existing.institutionId || '';
            effectiveBranchId = existing.branchId || 'todas';
          } else if (isSuper) {
            setHasSigarProfile(true);
            userAuthRoles = ['SUPER_ADMIN'];
            effectiveRole = 'SUPER_ADMIN';
          } else {
            // Document does NOT exist in Firestore
            setUserProfile(null);
            setHasSigarProfile(false);
            userAuthRoles = ['VISITANTE'];
            effectiveRole = 'visitante';
            effectiveInstId = '';
            addNotification({
              title: 'Conta Sem Perfil Associado',
              message: 'Conta autenticada, mas ainda não possui um perfil SIGAR associado. Contacte o administrador da sua instituição.',
              type: 'warning'
            });
          }

          setAuthorizedRoles(userAuthRoles);
          setActiveRoleState(effectiveRole);

          setAuthLoadingPhase('carregando_instituicao');
          const cloudInsts = await getInstitutions();
          
          if (cloudInsts.length > 0) {
            const hasCeu = cloudInsts.some(i => i.id === CEU_AZUL_INSTITUTION_ID);
            const merged = deduplicateInstitutions(hasCeu ? cloudInsts : [CEU_AZUL_INSTITUTION as Institution, ...cloudInsts]);
            setAllInstitutions(merged);
            if (effectiveInstId && merged.some(i => i.id === effectiveInstId)) {
              setActiveInstitutionId(effectiveInstId);
            } else if (isSuper) {
              setActiveInstitutionId(merged[0].id);
              effectiveInstId = merged[0].id;
            } else {
              setActiveInstitutionId(effectiveInstId || CEU_AZUL_INSTITUTION_ID);
            }
          } else {
            setAllInstitutions(deduplicateInstitutions([CEU_AZUL_INSTITUTION as Institution, ...INITIAL_INSTITUTIONS]));
            setActiveInstitutionId(effectiveInstId || CEU_AZUL_INSTITUTION_ID);
          }
          setActiveBranchId(effectiveBranchId);

          setAuthLoadingPhase('carregando_dados');
          if (effectiveInstId) {
            // Scope queries according to role (Section 5 of prompt: Proteger também os dados)
            const isStudent = toCanonicalRole(effectiveRole) === 'ALUNO';
            const isPorteiro = toCanonicalRole(effectiveRole) === 'PORTEIRO';

            if (isStudent) {
              // Student only loads their own academic data
              const [cloudStudents, cloudCourses, cloudClasses, cloudCertificates, cloudLessons, cloudSchedules] = await Promise.all([
                getStudentsByInstitution(effectiveInstId, effectiveBranchId),
                getCoursesByInstitution(effectiveInstId),
                getClassesByInstitution(effectiveInstId, effectiveBranchId),
                getCertificatesByInstitution(effectiveInstId),
                getLessonsByInstitution(effectiveInstId),
                getSchedulesByInstitution(effectiveInstId)
              ]);
              const ownStudents = cloudStudents.filter(s => s.userId === user.uid || (user.email && s.email === user.email));
              setAllStudents(ownStudents);
              setAllCourses(cloudCourses || []);
              setAllClasses(cloudClasses || []);
              setAllTeachers([]);
              setAllCertificates(cloudCertificates.filter(c => ownStudents.some(s => ((s as any).name === c.studentName || s.fullName === c.studentName))));
              setAllPaymentRecords([]);
              setAllLessons(cloudLessons || []);
              setAllSchedules(cloudSchedules || []);
              setAllClassTransfers([]);
              setAllCashSessions([]);
            } else if (isPorteiro) {
              // Portaria only loads students (for gate verification) and access logs
              const [cloudStudents, cloudAccess] = await Promise.all([
                getStudentsByInstitution(effectiveInstId, effectiveBranchId),
                getAccessLogsByInstitution(effectiveInstId)
              ]);
              setAllStudents(cloudStudents || []);
              setAllCourses([]);
              setAllClasses([]);
              setAllTeachers([]);
              setAllCertificates([]);
              setAllPaymentRecords([]);
              setAllLessons([]);
              setAllSchedules([]);
              setAllClassTransfers([]);
              setAllCashSessions([]);
              setAllAccessLogs(cloudAccess || []);
            } else {
              // Administrative roles (Diretor, Secretaria, Financeiro, SuperAdmin, Professor)
              const [
                cloudStudents,
                cloudCourses,
                cloudClasses,
                cloudTeachers,
                cloudCertificates,
                cloudPayments,
                cloudLessons,
                cloudSchedules,
                cloudTransfers,
                cloudCash
              ] = await Promise.all([
                getStudentsByInstitution(effectiveInstId, effectiveBranchId),
                getCoursesByInstitution(effectiveInstId),
                getClassesByInstitution(effectiveInstId, effectiveBranchId),
                getTeachersByInstitution(effectiveInstId),
                getCertificatesByInstitution(effectiveInstId),
                getPaymentsByInstitution(effectiveInstId),
                getLessonsByInstitution(effectiveInstId),
                getSchedulesByInstitution(effectiveInstId),
                getTransfersByInstitution(effectiveInstId),
                getCashSessionsByInstitution(effectiveInstId)
              ]);

              setAllStudents(cloudStudents || []);
              setAllCourses(cloudCourses || []);
              setAllClasses(cloudClasses || []);
              setAllTeachers(cloudTeachers || []);
              setAllCertificates(cloudCertificates || []);
              setAllPaymentRecords(cloudPayments || []);
              setAllLessons(cloudLessons || []);
              setAllSchedules(cloudSchedules || []);
              setAllClassTransfers(cloudTransfers || []);
              setAllCashSessions(cloudCash || []);
            }
          }
        } catch (e) {
          console.warn('Profile sync info:', e);
        } finally {
          setAuthLoadingPhase('idle');
        }
      } else {
        // No authenticated user: completely clear private data (PARTE 3)
        setAuthLoadingPhase('idle');
        setAllStudents([]);
        setAllInstitutions([]);
        setAllCourses([]);
        setAllClasses([]);
        setAllTeachers([]);
        setAllCertificates([]);
        setAllPaymentRecords([]);
        setAllLessons([]);
        setAllSchedules([]);
        setAllClassTransfers([]);
        setAllCashSessions([]);
        setActiveRoleState('visitante');
        setAuthorizedRoles(['VISITANTE']);
        setHasSigarProfile(true);
        setUserProfile(null);
      }
    });

    const unsubAuthService = authService.subscribe((authUser) => {
      if (authUser) {
        if (authUser.role) setActiveRoleState(authUser.role);
        if (authUser.roles) setAuthorizedRoles(authUser.roles);
        if (authUser.institutionId) setActiveInstitutionId(authUser.institutionId);
        if (authUser.branchId) setActiveBranchId(authUser.branchId);
      }
    });

    return () => {
      unsubscribe();
      unsubAuthService();
    };
  }, []);

  const completeOnboarding = async () => {
    setOnboardingCompleted(true);
    if (firebaseUser?.uid) {
      try {
        await updateUserPreferences(firebaseUser.uid, { onboardingCompleted: true });
      } catch (e) {
        console.warn('Failed to persist onboarding preference:', e);
      }
    }
  };

  const restartOnboarding = () => {
    setOnboardingCompleted(false);
  };

  const loginWithGoogle = async (): Promise<User | null> => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        addNotification({
          title: 'Sessão Iniciada com Sucesso',
          message: `Bem-vindo(a), ${user.displayName || user.email}! Autenticação Google vinculada ao Moztechwave Core.`,
          type: 'system'
        });
        soundManager.playSuccess();
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      addNotification({
        title: 'Erro de Autenticação',
        message: 'Não foi possível concluir o login com o Google. Tente novamente.',
        type: 'system'
      });
      return null;
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      authService.logout();
      setCurrentRoute('public_portal');
      setActiveRoleState('visitante');
      setAuthorizedRoles(['VISITANTE']);
      setHasSigarProfile(true);
      setUserProfile(null);
      setFirebaseUser(null);
      setAllStudents([]);
      setAllInstitutions([]);
      setAllCourses([]);
      setAllClasses([]);
      setAllTeachers([]);
      setAllCertificates([]);
      setAllPaymentRecords([]);
      setAllLessons([]);
      setAllSchedules([]);
      setAllClassTransfers([]);
      setAllCashSessions([]);
      addNotification({
        title: 'Sessão Encerrada',
        message: 'A sua sessão foi encerrada com segurança.',
        type: 'system'
      });
      soundManager.playClick();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Contracts & Signatures
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>(CONTRACT_TEMPLATES);
  const [generatedContracts, setGeneratedContracts] = useState<GeneratedContract[]>(INITIAL_GENERATED_CONTRACTS);

  // Document Studio Templates (Persisted in localStorage)
  const [allStudioTemplates, setAllStudioTemplates] = useState<StudioTemplate[]>(() => {
    const saved = localStorage.getItem('siverc_studio_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved studio templates:', e);
      }
    }
    return DEFAULT_STUDIO_TEMPLATES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('siverc_studio_templates', JSON.stringify(allStudioTemplates));
    } catch (e) {
      console.warn('Failed to persist studio templates:', e);
    }
  }, [allStudioTemplates]);
  // 23. SISTEMA DE ASSINATURAS ELETRÓNICAS E DIGITAIS (Persistência Local)
  const [allSystemSignatures, setAllSystemSignatures] = useState<SystemSignature[]>(() => {
    const saved = localStorage.getItem('mtw_system_signatures');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved system signatures:', e);
      }
    }
    return INITIAL_SYSTEM_SIGNATURES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_system_signatures', JSON.stringify(allSystemSignatures));
    } catch (e) {
      console.warn('Failed to persist system signatures:', e);
    }
  }, [allSystemSignatures]);

  const [officialSigners, setOfficialSigners] = useState<OfficialSigner[]>(() => {
    const saved = localStorage.getItem('mtw_official_signers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved official signers:', e);
      }
    }
    return DEFAULT_OFFICIAL_SIGNERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_official_signers', JSON.stringify(officialSigners));
    } catch (e) {
      console.warn('Failed to persist official signers:', e);
    }
  }, [officialSigners]);

  const systemSignatures = allSystemSignatures.filter(s => 
    !s.institutionId || s.institutionId === activeInstitutionId
  );

  const [signatures, setSignatures] = useState<DocumentSignature[]>([
    {
      role: 'Director',
      name: 'Eng. Paulo Jafim Pereira',
      title: 'Diretor Geral & Coordenador Executivo',
      signed: true,
      signedAt: '2026-08-15 11:30',
      digitalSeal: 'SIVERC-SIG-DIR-88192'
    },
    {
      role: 'Formador',
      name: 'Eng. Carlos Manuel Sitoe',
      title: 'Formador Chefe de Engenharia de Software',
      signed: true,
      signedAt: '2026-08-14 16:45',
      digitalSeal: 'SIVERC-SIG-FORM-10492'
    },
    {
      role: 'Coordenador',
      name: 'Dra. Amina Abdul',
      title: 'Coordenadora Pedagógica Central',
      signed: false,
      digitalSeal: 'SIVERC-SIG-COORD-PENDING'
    }
  ]);

  const [notifications, setNotifications] = useState<LiveNotification[]>(INITIAL_NOTIFICATIONS);

  // Online Registration Applications State (Persisted in localStorage)
  const [allApplications, setAllApplications] = useState<RegistrationApplication[]>(() => {
    const saved = localStorage.getItem('mtw_online_applications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved applications:', e);
      }
    }
    return INITIAL_REGISTRATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mtw_online_applications', JSON.stringify(allApplications));
    } catch (e) {
      console.warn('Failed to persist applications to localStorage:', e);
    }
  }, [allApplications]);

  // ==========================================
  // MULTI-TENANT STRICT DATA ISOLATION FILTERS
  // ==========================================
  
  // Rule: Non-superadmin users ONLY see their own institution
  const institutions = activeRole === 'superadmin' ? allInstitutions : [activeInstitution];

  // Studio Templates strictly isolated by activeInstitution (or shared if without institutionId)
  const studioTemplates = allStudioTemplates.filter(tpl => {
    if (activeRole === 'superadmin') return true;
    return !tpl.institutionId || tpl.institutionId === activeInstitution.id;
  });

  // Candidates & Applications belonging strictly to activeInstitution and activeBranch (if selected)
  const applications = allApplications.filter(app => {
    if (activeRole === 'superadmin') return true;
    if (app.institutionId && app.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && app.branchId && app.branchId !== activeBranchId) return false;
    return true;
  });

  // Online Registration Configuration for the active institution
  const onlineRegistrationConfig: OnlineRegistrationConfig = 
    activeInstitution.onlineRegistrationConfig || DEFAULT_ONLINE_REGISTRATION_CONFIG;

  // Students belonging strictly to activeInstitution and activeBranch (if selected)
  const students = allStudents.filter(s => {
    if (s.institutionId && s.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && s.branchId && s.branchId !== activeBranchId) return false;
    return true;
  });

  // Courses belonging strictly to activeInstitution
  const courses = allCourses.filter(c => {
    return !c.institutionId || c.institutionId === activeInstitution.id;
  });

  // Classes belonging strictly to activeInstitution and activeBranch (if selected)
  const classes = allClasses.filter(c => {
    if (c.institutionId && c.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && c.branchId && c.branchId !== activeBranchId) return false;
    return true;
  });

  // Student Transfers belonging strictly to activeInstitution and activeBranch (if selected)
  const classTransfers = allClassTransfers.filter(t => {
    if (t.institutionId && t.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && t.branchId && t.branchId !== activeBranchId) return false;
    return true;
  });

  // Schedules belonging strictly to activeInstitution and activeBranch (if selected)
  const schedules = allSchedules.filter(sch => {
    if (sch.institutionId && sch.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && sch.branchId && sch.branchId !== activeBranchId) return false;
    return true;
  });

  // Teachers belonging strictly to activeInstitution and activeBranch (if selected)
  const teachers = allTeachers.filter(t => {
    if (t.institutionId && t.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && t.branchId && t.branchId !== activeBranchId) return false;
    return true;
  });

  const activeTeacher = teachers.find(t => t.id === activeTeacherId) || teachers[0] || null;

  // Escopo Estrito do Docente: "Professor deve ver apenas aquilo que lhe foi atribuído"
  const teacherAssignedClasses = classes.filter(c => {
    if (!activeTeacher) return true;
    const secondWord = activeTeacher.fullName?.split(' ')[1]?.toLowerCase() || '';
    return (
      (activeTeacher.classGroupIds && activeTeacher.classGroupIds.includes(c.id)) ||
      (c.teacherId && c.teacherId === activeTeacher.id) ||
      (secondWord && c.teacherName && c.teacherName.toLowerCase().includes(secondWord))
    );
  });

  const teacherAssignedStudents = students.filter(s => {
    if (!activeTeacher) return true;
    return teacherAssignedClasses.some(c => c.id === s.classGroupId);
  });

  const teacherAssignedSchedules = schedules.filter(sch => {
    if (!activeTeacher) return true;
    const secondWord = activeTeacher.fullName?.split(' ')[1]?.toLowerCase() || '';
    return (
      teacherAssignedClasses.some(c => c.id === sch.classGroupId) ||
      (secondWord && sch.teacherName && sch.teacherName.toLowerCase().includes(secondWord))
    );
  });

  // Cash sessions belonging strictly to activeInstitution and activeBranch (if selected)
  const cashSessions = allCashSessions.filter(s => {
    if (s.institutionId && s.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && s.branchId && s.branchId !== activeBranchId) return false;
    return true;
  });

  const activeCashSession = cashSessions.find(s => s.status === 'aberto') || cashSessions[0] || {
    id: `cx-sess-${activeInstitution.id}-default`,
    institutionId: activeInstitution.id,
    branchId: activeBranchId !== 'todas' ? activeBranchId : 'default',
    operator: 'Tesouraria',
    openedAt: new Date().toLocaleString('pt-MZ'),
    openingBalance: 0,
    currentBalance: 0,
    status: 'fechado',
    transactions: []
  };

  // Lessons belonging strictly to activeInstitution
  const lessons = allLessons.filter(l => {
    if (l.institutionId && l.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && l.branchId && l.branchId !== activeBranchId) return false;
    return true;
  });

  const teacherAssignedLessons = lessons.filter(l => {
    if (!activeTeacher) return true;
    const secondWord = activeTeacher.fullName?.split(' ')[1]?.toLowerCase() || '';
    return (
      teacherAssignedClasses.some(c => c.id === l.classGroupId) ||
      (secondWord && l.teacherName && l.teacherName.toLowerCase().includes(secondWord))
    );
  });

  // Access Logs belonging strictly to activeInstitution
  const accessLogs = allAccessLogs.filter(a => {
    if (a.institutionId && a.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && a.branchId && a.branchId !== activeBranchId) return false;
    return true;
  });

  // 53. AUDITORIA: Audit Logs belonging to activeInstitution (ou globais)
  const auditLogs = allAuditLogs.filter(log => {
    if (!log.institutionId || log.institutionId === activeInstitution.id) return true;
    return false;
  });

  // 17. Evaluations belonging strictly to activeInstitution and activeBranch (if selected)
  const evaluations = allEvaluations.filter(ev => {
    if (ev.institutionId && ev.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && ev.branchId && ev.branchId !== activeBranchId) return false;
    return true;
  });

  // Calculation formulas belonging to activeInstitution (or default global)
  const calculationFormulas = allCalculationFormulas.filter(f => {
    return !f.institutionId || f.institutionId === activeInstitution.id;
  });

  // 18. Pauta Homologations belonging to activeInstitution and activeBranch (if selected)
  const pautaHomologations = allPautaHomologations.filter(h => {
    if (h.institutionId && h.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && h.branchId && h.branchId !== activeBranchId) return false;
    return true;
  });

  // 20. Internships belonging strictly to activeInstitution and activeBranch (if selected)
  const internships = allInternships.filter(intern => {
    if (intern.institutionId && intern.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && intern.branchId && intern.branchId !== activeBranchId) return false;
    return true;
  });

  // 51. Certificados isolados por Instituição e Filial
  const certificates = allCertificates.filter(cert => {
    if (cert.institutionId && cert.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && cert.branchId && cert.branchId !== activeBranchId) return false;
    return true;
  });

  // 29. Contas a Receber e Contas a Pagar
  const contasReceber = allContasReceber.filter(item => {
    if (activeRole === 'superadmin') return true;
    if (item.institutionId && item.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && item.branchId && item.branchId !== activeBranchId) return false;
    return true;
  });

  const contasPagar = allContasPagar.filter(item => {
    if (activeRole === 'superadmin') return true;
    if (item.institutionId && item.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && item.branchId && item.branchId !== activeBranchId) return false;
    return true;
  });

  // 30. Pagamentos do Portal (Filtrados por instituição e filial)
  const paymentRecords = allPaymentRecords.filter(item => {
    if (activeRole === 'superadmin') return true;
    if (item.institutionId && item.institutionId !== activeInstitution.id) return false;
    if (activeBranchId !== 'todas' && item.branchId && item.branchId !== activeBranchId) return false;
    return true;
  });

  // 35. CAMADA DE INTEGRAÇÃO WHATSAPP (ISOLADO ESTATUTARIAMENTE POR INSTITUIÇÃO)
  const whatsAppTemplates = allWhatsAppTemplates.filter(item => {
    if (activeRole === 'superadmin') return true;
    return item.institutionId === activeInstitution.id;
  });

  const whatsAppCampaigns = allWhatsAppCampaigns.filter(item => {
    if (activeRole === 'superadmin') return true;
    return item.institutionId === activeInstitution.id;
  });

  const whatsAppAutomations = allWhatsAppAutomations.filter(item => {
    if (activeRole === 'superadmin') return true;
    return item.institutionId === activeInstitution.id;
  });

  const whatsAppLogs = allWhatsAppLogs.filter(item => {
    if (activeRole === 'superadmin') return true;
    return item.institutionId === activeInstitution.id;
  });

  const whatsAppConsents = allWhatsAppConsents.filter(item => {
    if (activeRole === 'superadmin') return true;
    return item.institutionId === activeInstitution.id;
  });

  // Independent WhatsApp Config per Institution
  const whatsappConfig: WhatsAppConnection = activeInstitution.whatsAppConfig || INITIAL_INSTITUTION_WHATSAPP_CONFIG[activeInstitution.id] || {
    institutionId: activeInstitution.id,
    status: 'conectado',
    isConnected: true,
    instanceName: `${activeInstitution.code}_WhatsApp`,
    phoneNumber: activeInstitution.phone || '+258 84 900 0000',
    batteryLevel: 92,
    isCharging: true,
    deviceModel: 'Dispositivo Android / WhatsApp Business',
    dailyMessagesSent: 12,
    dailyLimit: 500,
    minDelaySeconds: 3,
    maxDelaySeconds: 8,
    allowedStartHour: 8,
    allowedEndHour: 20,
    appendOptOutNotice: true,
    optOutText: 'Para não receber comunicados desta instituição, responda PARAR.',
    lastSync: '2026-09-17 08:30',
    authorizedBy: 'Diretoria Executiva'
  };

  // Independent Financial Settings per Institution
  const financialSettings: FinancialSettings = activeInstitution.financialSettings || {
    fineAmount: 50,
    interestRateDaily: 1,
    bankInfo: 'Millennium BIM - Conta Central',
    pixKey: activeInstitution.phone,
    dueDay: 10
  };

  const navigate = (route: AppRoute, params: Record<string, any> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        if (route === 'public_portal') {
          url.searchParams.delete('route');
        } else {
          url.searchParams.set('route', route);
        }
        if (params.inst) url.searchParams.set('inst', params.inst);
        if (params.course) url.searchParams.set('course', params.course);
        window.history.pushState(null, '', url.toString());
      }
    } catch (e) {
      // Ignore URL state errors
    }
  };

  // Switch Institution with strict Multi-Tenant Permission check
  const setActiveInstitution = (inst: Institution) => {
    if (activeRole !== 'superadmin' && inst.id !== activeInstitution.id) {
      addNotification({
        title: 'Acesso Negado (Multi-Tenant)',
        message: 'Apenas Super Administradores podem alternar entre instituições. Os dados de cada escola permanecem isolados.',
        type: 'system'
      });
      return;
    }
    setActiveInstitutionId(inst.id);
    setActiveBranchId('todas');
    soundManager.playClick();
  };

  const addInstitution = (newInstData: Omit<Institution, 'id' | 'code' | 'createdAt'>): Institution => {
    const typePrefix = newInstData.type === 'centro_formacao' ? 'CF' : newInstData.type === 'empresa' ? 'EMP' : 'INST';
    const randomNum = String(allInstitutions.length + 1).padStart(4, '0');
    const code = `MTW-${typePrefix}-${randomNum}`;
    const newInst: Institution = {
      ...newInstData,
      id: `inst-${Date.now()}`,
      code,
      createdAt: new Date().toISOString().split('T')[0],
      branches: newInstData.branches || [
        {
          id: `branch-${Date.now()}-main`,
          institutionId: `inst-${Date.now()}`,
          name: 'Sede Principal',
          code: 'SEDE-01',
          phone: newInstData.phone,
          email: newInstData.email,
          address: newInstData.address,
          city: newInstData.city,
          province: newInstData.province,
          directorName: newInstData.representativeName,
          isMainBranch: true,
          createdAt: new Date().toISOString()
        }
      ],
      prefixes: newInstData.prefixes || {
        studentPrefix: `${code}-AL`,
        certificatePrefix: `${code}-CERT`,
        receiptPrefix: `${code}-REC`,
        contractPrefix: `${code}-CTR`
      },
      financialSettings: newInstData.financialSettings || {
        fineAmount: 50,
        interestRateDaily: 1,
        bankInfo: 'Conta Bancária Principal',
        pixKey: newInstData.phone,
        dueDay: 10
      },
      financialAccounts: newInstData.financialAccounts || []
    };

    setAllInstitutions(prev => deduplicateInstitutions([newInst, ...prev]));
    setActiveInstitutionId(newInst.id);
    setActiveBranchId('todas');

    // Async persist to Firestore
    saveInstitutionToFirestore(newInst).catch(err => console.warn('Firestore sync institution:', err));

    addNotification({
      title: `Nova Instituição Registrada: ${newInst.name}`,
      message: `Ambiente independente ${code} provisionado com sucesso no Moztechwave Core.`,
      type: 'system'
    });

    soundManager.playNotification();
    return newInst;
  };

  const updateInstitution = (instId: string, updates: Partial<Institution>) => {
    let updatedObj: Institution | null = null;
    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === instId) {
        updatedObj = { ...inst, ...updates };
        return updatedObj;
      }
      return inst;
    }));

    if (updatedObj) {
      saveInstitutionToFirestore(updatedObj).catch(err => console.warn('Firestore sync institution update:', err));
    }

    addNotification({
      title: 'Configurações Institucionais Salvas',
      message: 'Os dados cadastrais e operacionais da instituição foram atualizados.',
      type: 'system'
    });

    soundManager.playSuccess();
  };

  const updateInstitutionModules = (
    institutionId: string, 
    modules: Partial<InstitutionFeatureModules>,
    teacherPerms?: Partial<TeacherPortalPermissions>,
    studentPerms?: Partial<StudentPortalPermissions>
  ) => {
    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === institutionId) {
        const updated: Institution = {
          ...inst,
          enabledModules: {
            ...(inst.enabledModules || {
              secretaria: true,
              portal_aluno: true,
              portal_professor: true,
              portaria: true,
              financeiro: true,
              pedagogico: true,
              certificados: true,
              estagios: true,
              comunicados: true,
              relatorios_academicos: true,
              relatorios_administrativos: true,
              auditoria: true
            }),
            ...modules
          },
          teacherPermissions: teacherPerms ? { ...(inst.teacherPermissions || {}), ...teacherPerms } : inst.teacherPermissions,
          studentPermissions: studentPerms ? { ...(inst.studentPermissions || {}), ...studentPerms } : inst.studentPermissions
        };
        return updated;
      }
      return inst;
    }));

    logCriticalAction({
      action: 'mudanca_permissoes',
      entity: 'Instituição',
      entityId: institutionId,
      relevantValues: {
        summary: `Atualização de módulos ativados e permissões granulares dos portais para a instituição.`,
        newValue: { modules, teacherPerms, studentPerms }
      },
      severity: 'critico'
    });

    addNotification({
      title: 'Módulos e Permissões Atualizados',
      message: 'As ferramentas ativas e permissões dos portais foram salvas com sucesso.',
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const logCriticalAction = (entry: {
    action: CriticalAuditAction;
    actionLabel?: string;
    entity: string;
    entityId: string;
    relevantValues: {
      summary: string;
      previousValue?: any;
      newValue?: any;
      metadata?: Record<string, any>;
    };
    severity?: 'info' | 'aviso' | 'critico';
    ipAddress?: string;
    userId?: string;
    userName?: string;
    userRole?: string;
  }): AuditLogEntry => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const randomHash = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

    const actionLabels: Record<CriticalAuditAction, string> = {
      login: 'Autenticação de Sessão (Login)',
      logout: 'Encerramento de Sessão (Logout)',
      criacao: 'Criação de Registo Institucional',
      alteracao: 'Alteração de Dados / Cadastral',
      aprovacao: 'Aprovação / Homologação Oficial',
      rejeicao: 'Rejeição Administrativa',
      exclusao_logica: 'Exclusão Lógica / Baixa Cadastral',
      emissao: 'Emissão de Documento Oficial',
      revogacao: 'Revogação de Documento / Certidão',
      alteracao_nota: 'Alteração de Nota / Pauta',
      alteracao_financeira: 'Alteração Financeira / Pagamento',
      mudanca_permissoes: 'Mudança de Permissões RBAC'
    };

    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: entry.userId || (currentUser as any)?.id || 'usr-central',
      userName: entry.userName || (currentUser as any)?.name || 'Operador Institucional',
      userRole: entry.userRole || activeRole,
      action: entry.action,
      actionLabel: entry.actionLabel || actionLabels[entry.action] || entry.action,
      date: dateStr,
      time: timeStr,
      timestamp: now.toISOString(),
      ipAddress: entry.ipAddress || '197.249.12.84',
      entity: entry.entity,
      entityId: entry.entityId,
      relevantValues: entry.relevantValues,
      institutionId: activeInstitutionId,
      branchId: activeBranchId !== 'todas' ? activeBranchId : undefined,
      severity: entry.severity || (['exclusao_logica', 'revogacao', 'mudanca_permissoes'].includes(entry.action) ? 'critico' : ['alteracao_nota', 'alteracao_financeira', 'rejeicao'].includes(entry.action) ? 'aviso' : 'info'),
      integrityHash: randomHash
    };

    setAllAuditLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  const purgeAuditLogs = (): { success: boolean; message: string } => {
    // "Não permitir que utilizador comum apague logs."
    if (activeRole !== 'SUPER_ADMIN' && activeRole !== 'superadmin') {
      logCriticalAction({
        action: 'mudanca_permissoes',
        entity: 'Permissões RBAC',
        entityId: 'AUDIT_PURGE_DENIED',
        relevantValues: {
          summary: `Tentativa não autorizada de eliminação de logs por utilizador comum (${(currentUser as any)?.name || activeRole}). Ação bloqueada pelo sistema.`,
          metadata: { attemptedBy: (currentUser as any)?.name, role: activeRole }
        },
        severity: 'critico'
      });
      return {
        success: false,
        message: 'Acesso negado! O sistema não permite que utilizadores comuns apaguem registos de auditoria.'
      };
    }

    logCriticalAction({
      action: 'exclusao_logica',
      entity: 'Auditoria do Sistema',
      entityId: 'AUDIT_ARCHIVE_SUPERADMIN',
      relevantValues: {
        summary: 'Arquivo autorizado e purga controlada de logs históricos realizada pelo Super Administrador.',
        metadata: { authorizedBy: (currentUser as any)?.name }
      },
      severity: 'critico'
    });

    return {
      success: true,
      message: 'Trilha de auditoria arquivada com sucesso pelo Super Administrador.'
    };
  };

  const loginStudentByCode = (code: string): { success: boolean; student?: Student; error?: string } => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, error: 'Por favor, insira o seu código de formando ou número de BI.' };
    }

    const found = allStudents.find(s => 
      s.code?.toLowerCase() === trimmed || 
      (s as any).codigoAcesso?.toLowerCase() === trimmed ||
      (s as any).numAluno?.toLowerCase() === trimmed ||
      (s.documentNumber && s.documentNumber.toLowerCase() === trimmed)
    );

    if (found) {
      setAuthenticatedStudent(found);
      try {
        localStorage.setItem('mtw_auth_student_code', found.code);
      } catch (e) {
        console.warn(e);
      }

      logCriticalAction({
        action: 'login',
        entity: 'Aluno',
        entityId: found.code,
        userName: found.fullName,
        userRole: 'ALUNO',
        relevantValues: {
          summary: `Autenticação do formando ${found.fullName} (${found.code}) no Portal do Aluno via código único.`,
          metadata: { course: found.courseName, class: found.className }
        },
        severity: 'info'
      });

      return { success: true, student: found };
    }

    const foundApp = allApplications.find(a => 
      a.code.toLowerCase() === trimmed || 
      (a.documentNumber && a.documentNumber.toLowerCase() === trimmed)
    );

    if (foundApp) {
      const candidateStudent: Student = {
        id: foundApp.id,
        code: foundApp.code,
        fullName: foundApp.fullName,
        gender: foundApp.gender || 'Masculino',
        birthDate: foundApp.birthDate || '2004-01-01',
        documentType: foundApp.documentType || 'BI',
        documentNumber: foundApp.documentNumber,
        email: foundApp.email,
        phone: foundApp.phone,
        address: foundApp.address || 'Maputo',
        city: foundApp.city || 'Maputo',
        province: foundApp.province || 'Maputo Cidade',
        courseId: foundApp.courseId,
        courseName: foundApp.courseName,
        classGroupId: 'cand',
        classGroupName: 'Candidatura em Análise',
        regime: foundApp.regime || 'Regular',
        status: 'Pré-inscrito',
        institutionId: foundApp.institutionId || activeInstitutionId,
        enrollmentDate: foundApp.createdAt || new Date().toISOString().split('T')[0],
        photoUrl: '',
        paymentStatus: 'Pendente',
        balanceOwing: foundApp.paymentAmount || 1500,
        attendancePercentage: 100,
        averageGrade: 0,
        emergencyContact: foundApp.phone,
        assessments: []
      };

      setAuthenticatedStudent(candidateStudent);
      try {
        localStorage.setItem('mtw_auth_student_code', foundApp.code);
      } catch (e) {}

      logCriticalAction({
        action: 'login',
        entity: 'Candidato',
        entityId: foundApp.code,
        userName: foundApp.fullName,
        userRole: 'ALUNO',
        relevantValues: {
          summary: `Autenticação do candidato ${foundApp.fullName} (${foundApp.code}) no Portal do Aluno.`,
          metadata: { applicationStatus: foundApp.status }
        },
        severity: 'info'
      });

      return { success: true, student: candidateStudent };
    }

    return { 
      success: false, 
      error: `Código "${code}" não encontrado no sistema. Verifique o seu recibo de inscrição ou cartão de formando.` 
    };
  };

  const logoutStudent = () => {
    if (authenticatedStudent) {
      logCriticalAction({
        action: 'logout',
        entity: 'Aluno',
        entityId: authenticatedStudent.code,
        userName: authenticatedStudent.fullName,
        userRole: 'ALUNO',
        relevantValues: {
          summary: `Encerramento de sessão do formando ${authenticatedStudent.fullName} (${authenticatedStudent.code}).`
        },
        severity: 'info'
      });
    }
    setAuthenticatedStudent(null);
    try {
      localStorage.removeItem('mtw_auth_student_code');
    } catch (e) {}
  };

  const addBranch = (branchData: Omit<Branch, 'id' | 'institutionId' | 'createdAt'>): Branch => {
    const newBranch: Branch = {
      ...branchData,
      id: `branch-${Date.now()}`,
      institutionId: activeInstitution.id,
      createdAt: new Date().toISOString()
    };

    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === activeInstitution.id) {
        return {
          ...inst,
          branches: [...(inst.branches || []), newBranch]
        };
      }
      return inst;
    }));

    addNotification({
      title: `Nova Filial / Campus: ${newBranch.name}`,
      message: `Filial com código ${newBranch.code} vinculada com sucesso à ${activeInstitution.name}.`,
      type: 'system'
    });

    soundManager.playSuccess();
    return newBranch;
  };

  const updateInstitutionPrefixes = (prefixes: Partial<InstitutionPrefixes>) => {
    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === activeInstitution.id) {
        return {
          ...inst,
          prefixes: {
            ...inst.prefixes,
            ...prefixes
          } as InstitutionPrefixes
        };
      }
      return inst;
    }));

    addNotification({
      title: 'Prefixos & Numeração Atualizados',
      message: 'Prefixos independentes de alunos, recibos e certificados salvos para a instituição.',
      type: 'system'
    });

    soundManager.playClick();
  };

  const updateInstitutionFinancialSettings = (settings: Partial<FinancialSettings>) => {
    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === activeInstitution.id) {
        return {
          ...inst,
          financialSettings: {
            ...inst.financialSettings,
            ...settings
          } as FinancialSettings
        };
      }
      return inst;
    }));

    addNotification({
      title: 'Parâmetros Financeiros Salvos',
      message: 'Taxas de multas, juros diários e vencimento configurados para esta instituição.',
      type: 'payment'
    });

    soundManager.playClick();
  };

  const addInstitutionBankAccount = (account: Omit<InstitutionBankAccount, 'id'>) => {
    const newAcc: InstitutionBankAccount = {
      ...account,
      id: `acc-bank-${Date.now()}`
    };

    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === activeInstitution.id) {
        return {
          ...inst,
          financialAccounts: [...(inst.financialAccounts || []), newAcc]
        };
      }
      return inst;
    }));

    addNotification({
      title: 'Nova Conta Financeira Registrada',
      message: `Conta ${newAcc.bankName} (${newAcc.accountNumber}) vinculada aos recebimentos da instituição.`,
      type: 'payment'
    });

    soundManager.playSuccess();
  };

  const removeInstitutionBankAccount = (accountId: string) => {
    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === activeInstitution.id) {
        return {
          ...inst,
          financialAccounts: (inst.financialAccounts || []).filter(a => a.id !== accountId)
        };
      }
      return inst;
    }));

    addNotification({
      title: 'Conta Bancária Removida',
      message: 'A conta selecionada foi removida da instituição.',
      type: 'system'
    });
  };

  // 63. SISTEMA DE PLANOS E LIMITES (SUPER ADMIN)
  const updatePlanDefinition = (planId: PlanId, updates: Partial<PlanDefinition>) => {
    setSystemPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          ...updates,
          limits: { ...p.limits, ...(updates.limits || {}) }
        };
      }
      return p;
    }));

    addNotification({
      title: 'Plano Atualizado com Sucesso',
      message: `Configurações e limites de recursos do plano foram recalculados.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const updateInstitutionPlan = (
    instId: string, 
    planName: PlanName, 
    customOverrides?: Partial<PlanLimits>,
    notes?: string
  ) => {
    const targetPlan = systemPlans.find(p => p.name === planName) || systemPlans[0];

    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === instId) {
        const updatedInst: Institution = {
          ...inst,
          plan: planName,
          customLimits: customOverrides !== undefined ? customOverrides : inst.customLimits,
          sivecEnabled: customOverrides?.sivecEnabled !== undefined ? customOverrides.sivecEnabled : targetPlan.limits.sivecEnabled,
          subscription: {
            planId: targetPlan.id,
            planName: targetPlan.name,
            status: 'active',
            billingCycle: inst.subscription?.billingCycle || 'mensal',
            priceMZN: targetPlan.priceMZN,
            startDate: inst.subscription?.startDate || new Date().toISOString().split('T')[0],
            renewalDate: inst.subscription?.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customLimitsOverride: customOverrides !== undefined ? customOverrides : inst.subscription?.customLimitsOverride,
            notes: notes || inst.subscription?.notes,
            managedBySuperAdmin: true,
            usage: inst.subscription?.usage || {
              students: inst.totalStudents || 0,
              users: inst.totalTeachers || 0,
              branches: inst.branches?.length || 1,
              storageGB: 5,
              monthlyCertificates: 20,
              whatsappMonthlyMessages: 0,
              sivecMonthlyVerifications: 0,
              onlineClassesMonthlyHours: 0,
              aiMonthlyPrompts: 0,
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          }
        };
        return updatedInst;
      }
      return inst;
    }));

    addNotification({
      title: 'Plano Institucional Atualizado',
      message: `A instituição agora opera sob o plano ${planName} com limites atualizados pelo Super Admin.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const getEffectivePlanLimits = (inst: Institution): PlanLimits => {
    const planName = inst.plan || 'BÁSICO';
    return getEffectiveLimits(planName, inst.customLimits || inst.subscription?.customLimitsOverride);
  };

  const checkResourceUsage = (
    inst: Institution, 
    resource: keyof PlanLimits, 
    currentVal?: number
  ) => {
    const limits = getEffectivePlanLimits(inst);
    const limitValue = limits[resource];

    let current = currentVal;
    if (current === undefined) {
      const usage = inst.subscription?.usage;
      if (resource === 'maxStudents') current = inst.totalStudents || usage?.students || 0;
      else if (resource === 'maxUsers') current = (inst.totalTeachers || 0) + 2;
      else if (resource === 'maxBranches') current = inst.branches?.length || 1;
      else if (resource === 'storageGB') current = usage?.storageGB || 2.5;
      else if (resource === 'monthlyCertificates') current = usage?.monthlyCertificates || 15;
      else if (resource === 'whatsappMonthlyLimit') current = usage?.whatsappMonthlyMessages || 0;
      else if (resource === 'sivecMonthlyVerifications') current = usage?.sivecMonthlyVerifications || 0;
      else if (resource === 'onlineClassesMaxHours') current = usage?.onlineClassesMonthlyHours || 0;
      else if (resource === 'aiMonthlyPrompts') current = usage?.aiMonthlyPrompts || 0;
      else current = 0;
    }

    if (typeof limitValue === 'boolean') {
      return {
        allowed: limitValue,
        current: limitValue ? 1 : 0,
        max: 1,
        percentage: limitValue ? 100 : 0,
        isUnlimited: false,
        status: limitValue ? ('normal' as const) : ('exceeded' as const)
      };
    }

    const calc = calculateUsagePercentage(current, limitValue);
    return {
      allowed: limitValue === -1 || current <= limitValue,
      current,
      max: limitValue,
      percentage: calc.percentage,
      isUnlimited: calc.isUnlimited,
      status: calc.status
    };
  };

  // Student CRUD (Scoped to Institution & Branch)
  const addStudent = (studentData: Omit<Student, 'id' | 'code'>): Student => {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const prefix = activeInstitution.prefixes?.studentPrefix || `${activeInstitution.code}-AL`;
    const code = `${prefix}-2026-${randomSeq}`;
    const targetBranch = studentData.branchId || (activeBranchId !== 'todas' ? activeBranchId : (activeInstitution.branches?.[0]?.id || 'branch-default'));

    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
      code,
      institutionId: activeInstitution.id,
      branchId: targetBranch
    };

    setAllStudents(prev => [newStudent, ...prev]);

    // Async persist to Firestore
    saveStudentToFirestore(newStudent).catch(err => console.warn('Firestore sync student:', err));

    addNotification({
      title: `Novo Aluno Matriculado: ${newStudent.fullName}`,
      message: `Processo ${code} registrado sob a instituição ${activeInstitution.name}.`,
      type: 'registration',
      metadata: { code, name: newStudent.fullName }
    });

    soundManager.playNotification();
    return newStudent;
  };

  // Online Registration & Candidates Workflow
  const updateOnlineRegistrationConfig = (configUpdates: Partial<OnlineRegistrationConfig>) => {
    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === activeInstitution.id) {
        const currentCfg = inst.onlineRegistrationConfig || DEFAULT_ONLINE_REGISTRATION_CONFIG;
        const updatedConfig = {
          ...currentCfg,
          ...configUpdates
        };
        return {
          ...inst,
          onlineRegistrationConfig: updatedConfig
        };
      }
      return inst;
    }));

    addNotification({
      title: 'Configuração de Inscrições Atualizada',
      message: 'Parâmetros da página pública de inscrições salvos com sucesso.',
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const addApplication = (newApp: Omit<RegistrationApplication, 'id' | 'code' | 'createdAt'>): RegistrationApplication => {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const prefix = activeInstitution.prefixes?.candidatePrefix || `${activeInstitution.code || 'MTW'}-CAND`;
    const code = `${prefix}-2026-${randomSeq}`;
    const targetBranch = newApp.branchId || (activeBranchId !== 'todas' ? activeBranchId : (activeInstitution.branches?.[0]?.id || 'branch-1-maputo'));
    const createdAt = new Date().toLocaleString('pt-MZ');

    const application: RegistrationApplication = {
      ...newApp,
      id: `reg-${Date.now()}`,
      code,
      institutionId: newApp.institutionId || activeInstitution.id,
      branchId: targetBranch,
      createdAt,
      status: newApp.status || 'Pendente',
      confirmationSent: {
        email: true,
        sms: true,
        whatsapp: true,
        sentAt: createdAt,
        recipientPhone: newApp.phone,
        recipientEmail: newApp.email
      }
    };

    setAllApplications(prev => [application, ...prev]);

    // If coursesConfig has this course, bump filledVacancies
    if (activeInstitution.onlineRegistrationConfig?.coursesConfig) {
      setAllInstitutions(prev => prev.map(inst => {
        if (inst.id === activeInstitution.id && inst.onlineRegistrationConfig) {
          return {
            ...inst,
            onlineRegistrationConfig: {
              ...inst.onlineRegistrationConfig,
              coursesConfig: inst.onlineRegistrationConfig.coursesConfig.map(cc => {
                if (cc.courseId === newApp.courseId) {
                  return { ...cc, filledVacancies: Math.min(cc.vacancies, (cc.filledVacancies || 0) + 1) };
                }
                return cc;
              })
            }
          };
        }
        return inst;
      }));
    }

    addNotification({
      title: `Nova Inscrição Online: ${application.fullName}`,
      message: `Candidato #${code} submeteu inscrição para ${application.courseName}.`,
      type: 'registration',
      metadata: { code, name: application.fullName, phone: application.phone }
    });

    soundManager.playSuccess();
    return application;
  };

  const updateApplication = (id: string, updates: Partial<RegistrationApplication>) => {
    setAllApplications(prev => prev.map(app => app.id === id ? { ...app, ...updates } : app));
  };

  const approveApplication = (id: string, notes: string, actorName = 'Secretaria Acadêmica') => {
    const timestamp = new Date().toLocaleString('pt-MZ');
    let approvedCandidate: RegistrationApplication | null = null;

    setAllApplications(prev => prev.map(app => {
      if (app.id === id) {
        approvedCandidate = {
          ...app,
          status: 'Aprovada',
          analysisNotes: notes,
          analyzedBy: actorName,
          analyzedAt: timestamp
        };
        return approvedCandidate;
      }
      return app;
    }));

    if (approvedCandidate) {
      addNotification({
        title: `Candidatura Aprovada: ${(approvedCandidate as RegistrationApplication).fullName}`,
        message: `Inscrição ${(approvedCandidate as RegistrationApplication).code} deferida pela secretaria. Candidato liberado para matrícula.`,
        type: 'system'
      });
      soundManager.playSuccess();
    }
  };

  const rejectApplication = (id: string, rejectionReason: string, notes = '', actorName = 'Secretaria Acadêmica') => {
    const timestamp = new Date().toLocaleString('pt-MZ');
    let rejectedCandidate: RegistrationApplication | null = null;

    setAllApplications(prev => prev.map(app => {
      if (app.id === id) {
        rejectedCandidate = {
          ...app,
          status: 'Rejeitada',
          rejectionReason,
          analysisNotes: notes,
          analyzedBy: actorName,
          analyzedAt: timestamp
        };
        return rejectedCandidate;
      }
      return app;
    }));

    if (rejectedCandidate) {
      addNotification({
        title: `Candidatura Indeferida: ${(rejectedCandidate as RegistrationApplication).fullName}`,
        message: `Motivo registrado: ${rejectionReason}`,
        type: 'system'
      });
      soundManager.playClick();
    }
  };

  const convertCandidateToStudent = (
    candidateId: string, 
    classId: string, 
    initialStatus: StudentStatus = 'Matriculado', 
    targetRegime?: string
  ): Student | null => {
    const candidate = allApplications.find(a => a.id === candidateId);
    if (!candidate) return null;

    const targetClass = classes.find(c => c.id === classId);
    const attachedDocs: StudentAttachedDocument[] = (candidate.documents || []).map((d, idx) => ({
      id: `doc-std-${Date.now()}-${idx}`,
      name: d.name,
      type: (d.type as any) || 'Outro',
      url: d.url || '#',
      size: d.fileSize || '1.0 MB',
      uploadDate: d.uploadedAt || new Date().toISOString().split('T')[0],
      status: d.verified ? 'Verificado' : 'Pendente'
    }));

    const createdStudent = addStudent({
      institutionId: candidate.institutionId || activeInstitution.id,
      branchId: candidate.branchId || activeBranchId,
      fullName: candidate.fullName,
      documentType: candidate.documentType,
      documentNumber: candidate.documentNumber,
      birthDate: candidate.birthDate,
      gender: candidate.gender,
      phone: candidate.phone,
      email: candidate.email,
      province: candidate.province,
      city: candidate.city,
      address: candidate.address || 'Residência não especificada',
      guardianName: candidate.guardianName,
      guardianPhone: candidate.guardianPhone,
      emergencyContact: candidate.guardianPhone || candidate.phone,
      attendancePercentage: 100,
      averageGrade: 0,
      photoUrl: candidate.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      courseId: candidate.courseId,
      courseName: candidate.courseName,
      classGroupId: classId,
      classGroupName: targetClass?.name || 'Turma Designada',
      regime: (targetRegime || candidate.regime || 'Pós-Laboral') as any,
      status: initialStatus,
      enrollmentDate: new Date().toISOString().split('T')[0],
      paymentStatus: candidate.paymentStatus === 'Pago' ? 'Pago' : 'Pendente',
      balanceOwing: candidate.paymentStatus === 'Pago' ? 0 : (candidate.paymentAmount || 1500),
      assessments: [],
      attachedDocuments: attachedDocs,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString('pt-MZ'),
          action: 'Efetivação de Matrícula Online',
          actorName: 'Secretaria Acadêmica',
          actorRole: 'secretaria',
          details: `Convertido com sucesso a partir da candidatura digital código ${candidate.code}.`
        }
      ],
      historyEvents: [
        {
          id: `he-conv-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: 'Matrícula Oficial Concluída',
          category: 'matrícula',
          description: `Aluno admitido e matriculado na ${targetClass?.name || classId} a partir do processo de inscrição online ${candidate.code}.`,
          recordedBy: 'Secretaria Geral'
        }
      ],
      receipts: candidate.paymentStatus === 'Pago' ? [
        {
          id: `rec-cand-${Date.now()}`,
          receiptNumber: candidate.paymentReference || `REC-${Date.now()}`,
          amount: candidate.paymentAmount || 1500,
          date: new Date().toISOString().split('T')[0],
          description: `Taxa de Inscrição & Candidatura Online (${candidate.courseName})`,
          paymentMethod: (candidate.paymentMethod as any) || 'M-Pesa',
          status: 'Emitido',
          qrVerificationCode: `SIVERC-REC-CAND-${Date.now()}`
        }
      ] : []
    });

    // Update the candidate record so it links to the new student
    setAllApplications(prev => prev.map(app => {
      if (app.id === candidateId) {
        return {
          ...app,
          status: 'Matriculado',
          convertedStudentId: createdStudent.id,
          convertedStudentCode: createdStudent.code,
          convertedAt: new Date().toLocaleString('pt-MZ'),
          convertedClassId: classId,
          convertedClassName: targetClass?.name || 'Turma Designada'
        };
      }
      return app;
    }));

    addNotification({
      title: `Candidato Convertido em Aluno com Sucesso!`,
      message: `${candidate.fullName} matriculado(a) com código oficial ${createdStudent.code}.`,
      type: 'registration',
      metadata: { code: createdStudent.code, name: createdStudent.fullName }
    });

    soundManager.playSuccess();
    return createdStudent;
  };

  const deleteApplication = (id: string) => {
    setAllApplications(prev => prev.filter(app => app.id !== id));
    addNotification({
      title: 'Candidatura Removida',
      message: 'O processo de inscrição do candidato foi removido com sucesso.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    let updatedStudent: Student | null = null;
    setAllStudents(prev => prev.map(s => {
      if (s.id === id) {
        updatedStudent = { ...s, ...updates };
        return updatedStudent;
      }
      return s;
    }));
    if (updatedStudent) {
      saveStudentToFirestore(updatedStudent).catch(err => console.warn('Firestore sync student update:', err));
    }
  };

  const deleteStudent = (id: string) => {
    setAllStudents(prev => prev.filter(s => s.id !== id));
  };

  const terminateStudent = (studentId: string, terminationData: StudentTermination) => {
    const completeTermination: StudentTermination = {
      ...terminationData,
      historyPreserved: true,
      paymentsPreserved: true,
      gradesPreserved: true,
      attendancePreserved: true,
      documentsPreserved: true
    };

    const historyEvent: StudentHistoryEvent = {
      id: `he-term-${Date.now()}`,
      date: terminationData.date || new Date().toISOString().split('T')[0],
      title: `Baixa no Processo Escolar (${terminationData.reason})`,
      category: 'baixa',
      description: `Baixa administrativa homologada por ${terminationData.authorizedBy}. Motivo registrado: "${terminationData.reason}". Parecer: ${terminationData.notes || 'Sem notas adicionais'}. Situação acadêmica: ${terminationData.academicSituation}. Situação financeira: ${terminationData.financialSituation}. Todos os registros históricos, notas, frequência, documentos e pagamentos 100% preservados.`,
      recordedBy: terminationData.authorizedBy
    };

    const auditEntry: StudentAuditEntry = {
      id: `aud-term-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-MZ'),
      actorName: terminationData.authorizedBy,
      actorRole: terminationData.authorizedRole || 'Diretoria / Gestão',
      action: 'HOMOLOGACAO_BAIXA_ALUNO',
      details: `Homologação de baixa sob o motivo "${terminationData.reason}". O aluno NÃO foi apagado do sistema; histórico, notas, propinas e documentos integralmente mantidos.`,
      ipAddress: '197.249.10.1'
    };

    let targetStudent: Student | null = null;

    setAllStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        targetStudent = {
          ...s,
          status: 'Baixado',
          termination: completeTermination,
          // Preservar estritamente histórico, notas, pagamentos, frequência, documentos
          historyEvents: [historyEvent, ...(s.historyEvents || [])],
          auditTrail: [auditEntry, ...(s.auditTrail || [])],
          attachedDocuments: s.attachedDocuments || [],
          receipts: s.receipts || [],
          assessments: s.assessments || [],
          attendancePercentage: s.attendancePercentage,
          averageGrade: s.averageGrade,
          paymentStatus: s.paymentStatus,
          balanceOwing: s.balanceOwing
        };
        return targetStudent;
      }
      return s;
    }));

    if (targetStudent) {
      saveStudentToFirestore(targetStudent).catch(err => console.warn('Firestore sync terminate:', err));
    }

    addNotification({
      title: `Baixa Homologada: ${targetStudent?.fullName || studentId}`,
      message: `Desligamento por "${terminationData.reason}". O cadastro NÃO foi excluído; histórico, notas e pagamentos preservados no SIGAR.`,
      type: 'system'
    });

    soundManager.playNotification();
  };

  const reactivateStudent = (studentId: string, newStatus: StudentStatus = 'Ativo', reactivationReason: string, responsibleUser: string) => {
    const historyEvent: StudentHistoryEvent = {
      id: `he-react-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: `Reativação de Processo Escolar (${newStatus})`,
      category: 'matrícula',
      description: `Processo reativado por ${responsibleUser}. Novo estado: ${newStatus}. Justificativa: ${reactivationReason}.`,
      recordedBy: responsibleUser
    };

    const auditEntry: StudentAuditEntry = {
      id: `aud-react-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-MZ'),
      actorName: responsibleUser,
      actorRole: 'Diretoria / Gestão',
      action: 'REATIVACAO_PROCESSO_ALUNO',
      details: `Reativação de aluno homologada. Status alterado de Baixado para ${newStatus}. Justificativa: ${reactivationReason}`,
      ipAddress: '197.249.10.1'
    };

    let targetStudent: Student | null = null;

    setAllStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const currentTermination = s.termination;
        const updatedTermination: StudentTermination | undefined = currentTermination ? {
          ...currentTermination,
          reactivated: true,
          reactivatedAt: new Date().toISOString(),
          reactivatedBy: responsibleUser,
          reactivationReason: reactivationReason
        } : undefined;

        targetStudent = {
          ...s,
          status: newStatus,
          termination: updatedTermination,
          historyEvents: [historyEvent, ...(s.historyEvents || [])],
          auditTrail: [auditEntry, ...(s.auditTrail || [])]
        };
        return targetStudent;
      }
      return s;
    }));

    if (targetStudent) {
      saveStudentToFirestore(targetStudent).catch(err => console.warn('Firestore sync reactivate:', err));
    }

    addNotification({
      title: `Aluno Reativado: ${targetStudent?.fullName || studentId}`,
      message: `Processo reativado com sucesso para estado "${newStatus}". Histórico anterior preservado.`,
      type: 'system'
    });

    soundManager.playSuccess();
  };

  const changeStudentStatus = (studentId: string, newStatus: StudentStatus, justification?: string, responsibleUser?: string) => {
    const actor = responsibleUser || activeInstitution.representativeName;
    const historyEvent: StudentHistoryEvent = {
      id: `he-stat-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: `Alteração de Estado para ${newStatus}`,
      category: newStatus === 'Concluído' ? 'certificação' : 'acadêmico',
      description: `Estado atualizado para "${newStatus}" por ${actor}.${justification ? ` Justificativa: ${justification}` : ''}`,
      recordedBy: actor
    };

    const auditEntry: StudentAuditEntry = {
      id: `aud-stat-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-MZ'),
      actorName: actor,
      actorRole: 'Secretaria / Direção',
      action: 'ALTERACAO_STATUS_ALUNO',
      details: `Estado alterado para ${newStatus}.${justification ? ` Observação: ${justification}` : ''}`
    };

    let targetStudent: Student | null = null;

    setAllStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        targetStudent = {
          ...s,
          status: newStatus,
          historyEvents: [historyEvent, ...(s.historyEvents || [])],
          auditTrail: [auditEntry, ...(s.auditTrail || [])]
        };
        return targetStudent;
      }
      return s;
    }));

    if (targetStudent) {
      saveStudentToFirestore(targetStudent).catch(err => console.warn('Firestore sync status change:', err));
    }

    addNotification({
      title: `Estado Atualizado: ${targetStudent?.fullName || studentId}`,
      message: `Novo estado definido como "${newStatus}".`,
      type: 'system'
    });

    soundManager.playClick();
  };

  const addStudentAuditEntry = (studentId: string, entry: Omit<StudentAuditEntry, 'id' | 'timestamp'>) => {
    const newEntry: StudentAuditEntry = {
      ...entry,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-MZ')
    };
    setAllStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, auditTrail: [newEntry, ...(s.auditTrail || [])] };
        saveStudentToFirestore(updated).catch(err => console.warn('Audit sync error:', err));
        return updated;
      }
      return s;
    }));
  };

  const addStudentHistoryEvent = (studentId: string, event: Omit<StudentHistoryEvent, 'id' | 'date'>) => {
    const newEvent: StudentHistoryEvent = {
      ...event,
      id: `he-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setAllStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, historyEvents: [newEvent, ...(s.historyEvents || [])] };
        saveStudentToFirestore(updated).catch(err => console.warn('History sync error:', err));
        return updated;
      }
      return s;
    }));
    soundManager.playSuccess();
  };

  const addStudentDocument = (studentId: string, doc: Omit<StudentAttachedDocument, 'id' | 'uploadDate'>) => {
    const newDoc: StudentAttachedDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setAllStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, attachedDocuments: [...(s.attachedDocuments || []), newDoc] };
        saveStudentToFirestore(updated).catch(err => console.warn('Doc sync error:', err));
        return updated;
      }
      return s;
    }));
    addStudentAuditEntry(studentId, {
      actorName: activeInstitution.representativeName,
      actorRole: activeRole,
      action: 'DOCUMENTO_ANEXADO',
      details: `Documento "${newDoc.name}" (${newDoc.type}) foi anexado ao dossiê.`
    });
    soundManager.playSuccess();
  };

  const toggleDashboardTask = (taskId: string) => {
    setDashboardTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    soundManager.playClick();
  };

  const addDashboardTask = (taskData: Omit<DashboardTask, 'id' | 'completed'>) => {
    const newTask: DashboardTask = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      completed: false
    };
    setDashboardTasks(prev => [newTask, ...prev]);
    soundManager.playSuccess();
  };

  const addDashboardNotice = (noticeData: Omit<StudentNotice, 'id' | 'date'>) => {
    const newNotice: StudentNotice = {
      ...noticeData,
      id: `av-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' })
    };
    setDashboardNotices(prev => [newNotice, ...prev]);
    addNotification({
      title: `Novo Aviso: ${newNotice.title}`,
      message: newNotice.content.slice(0, 100) + '...',
      type: 'system'
    });
    soundManager.playNotification();
  };

  const addCourse = (courseData: Omit<Course, 'id' | 'institutionId'>): Course => {
    const newCourse: Course = {
      ...courseData,
      id: `crs-${Date.now()}`,
      institutionId: activeInstitution.id,
      branchId: activeBranchId !== 'todas' ? activeBranchId : undefined
    };

    setAllCourses(prev => [newCourse, ...prev]);

    // Async persist to Firestore
    saveCourseToFirestore(newCourse).catch(err => console.warn('Firestore sync course:', err));

    addNotification({
      title: `Novo Curso Cadastrado: ${newCourse.name}`,
      message: `Curso vinculado com exclusividade à instituição ${activeInstitution.name}.`,
      type: 'system'
    });

    soundManager.playSuccess();
    return newCourse;
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    let updatedCourse: Course | null = null;
    setAllCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        updatedCourse = { ...c, ...updates };
        return updatedCourse;
      }
      return c;
    }));
    if (updatedCourse) {
      saveCourseToFirestore(updatedCourse).catch(err => console.warn('Firestore sync course update:', err));
      addNotification({
        title: `Curso Atualizado: ${(updatedCourse as Course).name}`,
        message: 'Estrutura curricular e parâmetros do curso salvos com sucesso.',
        type: 'system'
      });
      soundManager.playSuccess();
    }
  };

  const deleteCourse = (courseId: string) => {
    const course = allCourses.find(c => c.id === courseId);
    setAllCourses(prev => prev.filter(c => c.id !== courseId));
    addNotification({
      title: `Curso Removido: ${course?.name || courseId}`,
      message: 'O curso foi desativado do catálogo institucional.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const addModuleToCourse = (courseId: string, moduleData: Omit<CourseModule, 'id'>): CourseModule => {
    const newModule: CourseModule = {
      ...moduleData,
      id: `mod-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    let updatedCourse: Course | null = null;
    setAllCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const modules = [...(c.modules || []), newModule];
        const totalWorkload = modules.reduce((acc, m) => acc + (Number(m.workloadHours) || 0), 0);
        const totalTheory = modules.reduce((acc, m) => acc + (Number(m.theoryHours) || 0), 0);
        const totalPractice = modules.reduce((acc, m) => acc + (Number(m.practiceHours) || 0), 0);
        updatedCourse = {
          ...c,
          modules,
          workloadHours: totalWorkload > 0 ? totalWorkload : c.workloadHours,
          theoryHours: totalTheory > 0 ? totalTheory : c.theoryHours,
          practiceHours: totalPractice > 0 ? totalPractice : c.practiceHours
        };
        return updatedCourse;
      }
      return c;
    }));
    if (updatedCourse) {
      saveCourseToFirestore(updatedCourse).catch(err => console.warn('Firestore sync module:', err));
      addNotification({
        title: `Disciplina / Módulo Adicionado: ${newModule.name}`,
        message: `Módulo ${newModule.code} vinculado à matriz curricular do curso.`,
        type: 'system'
      });
      soundManager.playSuccess();
    }
    return newModule;
  };

  const updateCourseModule = (courseId: string, moduleId: string, updates: Partial<CourseModule>) => {
    let updatedCourse: Course | null = null;
    setAllCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const modules = (c.modules || []).map(m => m.id === moduleId ? { ...m, ...updates } : m);
        const totalWorkload = modules.reduce((acc, m) => acc + (Number(m.workloadHours) || 0), 0);
        const totalTheory = modules.reduce((acc, m) => acc + (Number(m.theoryHours) || 0), 0);
        const totalPractice = modules.reduce((acc, m) => acc + (Number(m.practiceHours) || 0), 0);
        updatedCourse = {
          ...c,
          modules,
          workloadHours: totalWorkload > 0 ? totalWorkload : c.workloadHours,
          theoryHours: totalTheory > 0 ? totalTheory : c.theoryHours,
          practiceHours: totalPractice > 0 ? totalPractice : c.practiceHours
        };
        return updatedCourse;
      }
      return c;
    }));
    if (updatedCourse) {
      saveCourseToFirestore(updatedCourse).catch(err => console.warn('Firestore sync module update:', err));
      soundManager.playClick();
    }
  };

  const deleteCourseModule = (courseId: string, moduleId: string) => {
    let updatedCourse: Course | null = null;
    setAllCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const modules = (c.modules || []).filter(m => m.id !== moduleId);
        const totalWorkload = modules.reduce((acc, m) => acc + (Number(m.workloadHours) || 0), 0);
        const totalTheory = modules.reduce((acc, m) => acc + (Number(m.theoryHours) || 0), 0);
        const totalPractice = modules.reduce((acc, m) => acc + (Number(m.practiceHours) || 0), 0);
        updatedCourse = {
          ...c,
          modules,
          workloadHours: totalWorkload,
          theoryHours: totalTheory,
          practiceHours: totalPractice
        };
        return updatedCourse;
      }
      return c;
    }));
    if (updatedCourse) {
      saveCourseToFirestore(updatedCourse).catch(err => console.warn('Firestore sync delete module:', err));
      soundManager.playClick();
    }
  };

  const addClassGroup = (classData: Omit<ClassGroup, 'id' | 'institutionId'>): ClassGroup => {
    const newClassId = `grp-${Date.now()}`;
    const targetBranch = classData.branchId || (activeBranchId !== 'todas' ? activeBranchId : (activeInstitution.branches?.[0]?.id || 'branch-default'));
    const initialStudentIds = classData.studentIds || [];

    const newClass: ClassGroup = {
      ...classData,
      id: newClassId,
      institutionId: activeInstitution.id,
      branchId: targetBranch,
      capacity: Number(classData.capacity) || 25,
      studentIds: initialStudentIds,
      status: classData.status || 'Planejada'
    };

    setAllClasses(prev => [newClass, ...prev]);
    saveClassToFirestore(newClass).catch(err => console.warn('Firestore sync add class:', err));

    if (initialStudentIds.length > 0) {
      setAllStudents(prev => prev.map(s => {
        if (initialStudentIds.includes(s.id)) {
          const updatedStd = {
            ...s,
            classGroupId: newClassId,
            classGroupName: newClass.name,
            courseId: newClass.courseId,
            courseName: newClass.courseName
          };
          saveStudentToFirestore(updatedStd).catch(err => console.warn('Firestore sync student class:', err));
          return updatedStd;
        }
        return s;
      }));
    }

    addNotification({
      title: 'Turma Criada com Sucesso',
      message: `Turma "${newClass.name}" cadastrada com capacidade para ${newClass.capacity} alunos.`,
      type: 'system'
    });
    soundManager.playSuccess();

    return newClass;
  };

  const updateClassGroup = (classId: string, updates: Partial<ClassGroup>) => {
    let updatedClass: ClassGroup | null = null;
    setAllClasses(prev => prev.map(c => {
      if (c.id === classId) {
        updatedClass = {
          ...c,
          ...updates,
          capacity: updates.capacity !== undefined ? Number(updates.capacity) : c.capacity
        };
        return updatedClass;
      }
      return c;
    }));

    if (updatedClass) {
      saveClassToFirestore(updatedClass).catch(err => console.warn('Firestore sync update class:', err));
      if (updates.name) {
        setAllStudents(prev => prev.map(s => {
          if (s.classGroupId === classId) {
            return { ...s, classGroupName: updates.name! };
          }
          return s;
        }));
      }
      addNotification({
        title: 'Turma Atualizada',
        message: `Turma "${(updatedClass as ClassGroup).name}" atualizada com sucesso.`,
        type: 'system'
      });
      soundManager.playClick();
    }
  };

  const deleteClassGroup = (classId: string) => {
    const toDelete = allClasses.find(c => c.id === classId);
    setAllClasses(prev => prev.filter(c => c.id !== classId));
    deleteClassFromFirestore(classId).catch(err => console.warn('Firestore sync delete class:', err));

    setAllStudents(prev => prev.map(s => {
      if (s.classGroupId === classId) {
        return {
          ...s,
          classGroupId: undefined,
          classGroupName: 'Sem Turma Atribuída'
        };
      }
      return s;
    }));

    addNotification({
      title: 'Turma Removida',
      message: `A turma "${toDelete?.name || classId}" foi removida do sistema.`,
      type: 'system'
    });
    soundManager.playClick();
  };

  const transferStudent = (params: {
    studentId: string;
    fromClassId: string;
    toClassId: string;
    reason: string;
    authorizedBy: string;
    notes?: string;
    keepAcademicRecords?: boolean;
  }): StudentClassTransfer => {
    const student = allStudents.find(s => s.id === params.studentId);
    const fromClass = allClasses.find(c => c.id === params.fromClassId);
    const toClass = allClasses.find(c => c.id === params.toClassId);

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const timestampStr = now.toLocaleDateString('pt-MZ') + ' ' + now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });

    const transferRecord: StudentClassTransfer = {
      id: `trf-${Date.now()}`,
      institutionId: activeInstitution.id,
      branchId: toClass?.branchId || fromClass?.branchId || (activeBranchId !== 'todas' ? activeBranchId : undefined),
      studentId: params.studentId,
      studentName: student?.fullName || 'Formando',
      studentCode: student?.code || 'S/N',
      fromClassId: params.fromClassId,
      fromClassName: fromClass?.name || 'Turma de Origem',
      fromCourseName: fromClass?.courseName || student?.courseName,
      toClassId: params.toClassId,
      toClassName: toClass?.name || 'Turma de Destino',
      toCourseName: toClass?.courseName || student?.courseName,
      transferDate: formattedDate,
      reason: params.reason,
      authorizedBy: params.authorizedBy,
      notes: params.notes,
      keepAcademicRecords: params.keepAcademicRecords ?? true,
      createdAt: timestampStr
    };

    // 1. Record transfer in history
    setAllClassTransfers(prev => [transferRecord, ...prev]);
    saveTransferToFirestore(transferRecord).catch(err => console.warn('Firestore sync transfer:', err));

    // 2. Update Student: new class, new course if different, append to student history
    setAllStudents(prev => prev.map(s => {
      if (s.id === params.studentId) {
        const historyEvent: StudentHistoryEvent = {
          id: `hist-trf-${Date.now()}`,
          date: formattedDate,
          title: `Transferência de Turma: ${transferRecord.fromClassName} ➜ ${transferRecord.toClassName}`,
          description: `Transferência autorizada por ${params.authorizedBy}. Motivo: ${params.reason}. ${params.notes ? `Observações: ${params.notes}` : ''}`,
          category: 'acadêmico',
          recordedBy: params.authorizedBy
        };

        const updatedStudent: Student = {
          ...s,
          classGroupId: params.toClassId,
          classGroupName: toClass?.name || s.classGroupName,
          courseId: toClass?.courseId || s.courseId,
          courseName: toClass?.courseName || s.courseName,
          status: 'Ativo',
          historyEvents: [historyEvent, ...(s.historyEvents || [])],
          ...(params.keepAcademicRecords === false ? {
            averageGrade: 0,
            attendancePercentage: 100,
            assessments: []
          } : {})
        };

        saveStudentToFirestore(updatedStudent).catch(err => console.warn('Firestore sync student transfer:', err));
        return updatedStudent;
      }
      return s;
    }));

    // 3. Update both classes' studentIds array
    setAllClasses(prev => prev.map(c => {
      if (c.id === params.fromClassId) {
        const updated = {
          ...c,
          studentIds: (c.studentIds || []).filter(id => id !== params.studentId)
        };
        saveClassToFirestore(updated).catch(err => console.warn('Firestore sync fromClass studentIds:', err));
        return updated;
      }
      if (c.id === params.toClassId) {
        const currentIds = c.studentIds || [];
        const updated = {
          ...c,
          studentIds: currentIds.includes(params.studentId) ? currentIds : [...currentIds, params.studentId]
        };
        saveClassToFirestore(updated).catch(err => console.warn('Firestore sync toClass studentIds:', err));
        return updated;
      }
      return c;
    }));

    addNotification({
      title: 'Transferência de Aluno Efetuada',
      message: `${student?.fullName || 'Formando'} transferido de "${fromClass?.name}" para "${toClass?.name}". Histórico oficial registrado.`,
      type: 'system'
    });
    soundManager.playSuccess();

    return transferRecord;
  };

  const addStudentToClass = (classId: string, studentId: string) => {
    const targetClass = allClasses.find(c => c.id === classId);
    if (!targetClass) return;

    setAllClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const currentIds = c.studentIds || [];
        const updated = {
          ...c,
          studentIds: currentIds.includes(studentId) ? currentIds : [...currentIds, studentId]
        };
        saveClassToFirestore(updated).catch(err => console.warn('Firestore sync add student to class:', err));
        return updated;
      }
      return c;
    }));

    setAllStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = {
          ...s,
          classGroupId: classId,
          classGroupName: targetClass.name
        };
        saveStudentToFirestore(updated).catch(err => console.warn('Firestore sync student class assignment:', err));
        return updated;
      }
      return s;
    }));

    soundManager.playClick();
  };

  const removeStudentFromClass = (classId: string, studentId: string) => {
    setAllClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const updated = {
          ...c,
          studentIds: (c.studentIds || []).filter(id => id !== studentId)
        };
        saveClassToFirestore(updated).catch(err => console.warn('Firestore sync remove student from class:', err));
        return updated;
      }
      return c;
    }));

    setAllStudents(prev => prev.map(s => {
      if (s.id === studentId && s.classGroupId === classId) {
        const updated = {
          ...s,
          classGroupId: undefined,
          classGroupName: 'Sem Turma Atribuída'
        };
        saveStudentToFirestore(updated).catch(err => console.warn('Firestore sync student unassign:', err));
        return updated;
      }
      return s;
    }));

    soundManager.playClick();
  };

  const duplicateClassGroup = (
    sourceClassId: string, 
    newName: string, 
    newShift: ClassGroup['shift'], 
    newRoom: string
  ): ClassGroup => {
    const sourceClass = allClasses.find(c => c.id === sourceClassId) || allClasses[0];
    const newClassId = `grp-${Date.now()}`;
    const targetBranch = activeBranchId !== 'todas' ? activeBranchId : (sourceClass.branchId || activeInstitution.branches?.[0]?.id || 'branch-default');

    const duplicated: ClassGroup = {
      id: newClassId,
      institutionId: activeInstitution.id,
      branchId: targetBranch,
      name: newName,
      courseId: sourceClass.courseId,
      courseName: sourceClass.courseName,
      period: sourceClass.period || 'Novo Ciclo Letivo',
      shift: newShift,
      schedule: sourceClass.schedule || '08:00 - 12:00',
      room: newRoom,
      teacherName: sourceClass.teacherName,
      capacity: sourceClass.capacity || 25,
      studentIds: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0],
      status: 'Em Curso'
    };

    setAllClasses(prev => [duplicated, ...prev]);

    // Async persist to Firestore
    saveClassToFirestore(duplicated).catch(err => console.warn('Firestore sync class:', err));

    // Associar alunos da turma antiga à nova turma com notas e faltas zeradas
    setAllStudents(prev => prev.map(s => {
      if (s.classGroupId === sourceClassId) {
        return {
          ...s,
          classGroupId: newClassId,
          classGroupName: newName,
          averageGrade: 0,
          attendancePercentage: 100,
          assessments: []
        };
      }
      return s;
    }));

    addNotification({
      title: 'Turma Duplicada com Sucesso',
      message: `Turma ${newName} criada para o novo ano letivo com alunos transferidos e pauta zerada.`,
      type: 'system'
    });

    soundManager.playSuccess();
    return duplicated;
  };

  // =======================================================
  // 13. HORÁRIOS & CALENDÁRIO ACADÊMICO (Detecção de Conflitos)
  // =======================================================
  const timeStringToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  };

  const detectScheduleConflicts = (
    candidate: Omit<ClassScheduleSlot, 'id'>, 
    excludeSlotId?: string
  ): ConflictDetectionResult => {
    const conflicts: ScheduleConflict[] = [];
    const candStart = timeStringToMinutes(candidate.startTime);
    const candEnd = timeStringToMinutes(candidate.endTime);

    if (candEnd <= candStart) {
      return {
        hasConflict: true,
        conflicts: [{
          type: 'classGroup',
          title: 'Horário Inválido',
          message: 'O horário de término da aula deve ser posterior ao horário de início.',
          severity: 'bloqueante'
        }]
      };
    }

    const tenantId = candidate.institutionId || activeInstitution.id;
    const candidateBranch = candidate.branchId || (activeBranchId !== 'todas' ? activeBranchId : undefined);

    const relevantSlots = allSchedules.filter(existing => {
      if (excludeSlotId && existing.id === excludeSlotId) return false;
      if (existing.institutionId !== tenantId) return false;
      if (candidateBranch && existing.branchId && candidateBranch !== existing.branchId) return false;
      
      // Day of week match
      if (Number(candidate.dayOfWeek) !== Number(existing.dayOfWeek)) return false;

      // Date match if specified
      if (candidate.date && existing.date && candidate.date !== existing.date) return false;

      // Interval overlap check: startA < endB && endA > startB
      const existStart = timeStringToMinutes(existing.startTime);
      const existEnd = timeStringToMinutes(existing.endTime);
      return candStart < existEnd && candEnd > existStart;
    });

    for (const slot of relevantSlots) {
      // 1. Professor ocupado
      if (
        candidate.teacherName &&
        slot.teacherName &&
        candidate.teacherName.trim().toLowerCase() === slot.teacherName.trim().toLowerCase()
      ) {
        conflicts.push({
          type: 'teacher',
          title: 'Conflito de Docente (Professor Ocupado)',
          message: `O docente "${candidate.teacherName}" já está alocado à aula de "${slot.disciplineName}" na turma "${slot.classGroupName}" das ${slot.startTime} às ${slot.endTime} (${slot.room}).`,
          conflictingSlot: slot,
          severity: 'bloqueante'
        });
      }

      // 2. Sala ocupada
      if (
        candidate.room &&
        slot.room &&
        candidate.room.trim().toLowerCase() === slot.room.trim().toLowerCase()
      ) {
        conflicts.push({
          type: 'room',
          title: 'Conflito de Espaço (Sala Ocupada)',
          message: `A sala/laboratório "${candidate.room}" já está ocupada pela turma "${slot.classGroupName}" (${slot.disciplineName}) das ${slot.startTime} às ${slot.endTime}.`,
          conflictingSlot: slot,
          severity: 'bloqueante'
        });
      }

      // 3. Turma ocupada
      if (
        candidate.classGroupId &&
        slot.classGroupId &&
        candidate.classGroupId === slot.classGroupId
      ) {
        conflicts.push({
          type: 'classGroup',
          title: 'Conflito de Turma (Turma Ocupada)',
          message: `A turma "${candidate.classGroupName || 'Selecionada'}" já tem outra aula agendada neste horário: "${slot.disciplineName}" com ${slot.teacherName} (${slot.startTime} - ${slot.endTime}).`,
          conflictingSlot: slot,
          severity: 'bloqueante'
        });
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts
    };
  };

  const addScheduleSlot = (slotData: Omit<ClassScheduleSlot, 'id' | 'institutionId'>) => {
    const fullCandidate = {
      ...slotData,
      institutionId: activeInstitution.id,
      branchId: slotData.branchId || (activeBranchId !== 'todas' ? activeBranchId : (activeInstitution.branches?.[0]?.id || undefined))
    };

    const conflictCheck = detectScheduleConflicts(fullCandidate);
    
    const newSlot: ClassScheduleSlot = {
      id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...fullCandidate,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setAllSchedules(prev => [newSlot, ...prev]);
    saveScheduleSlotToFirestore(newSlot).catch(err => console.warn('Firestore schedule save:', err));

    if (conflictCheck.hasConflict) {
      addNotification({
        title: 'Alerta: Conflito de Horário Detectado',
        message: conflictCheck.conflicts[0].message,
        type: 'system'
      });
      soundManager.playError?.();
    } else {
      addNotification({
        title: 'Aula Agendada no Calendário',
        message: `${newSlot.disciplineName} (${newSlot.classGroupName}) agendada para ${newSlot.startTime} - ${newSlot.endTime} na ${newSlot.room}.`,
        type: 'system'
      });
      soundManager.playSuccess();
    }

    return {
      success: true,
      conflict: conflictCheck.conflicts[0],
      conflicts: conflictCheck.conflicts
    };
  };

  const updateScheduleSlot = (id: string, updates: Partial<ClassScheduleSlot>) => {
    const existing = allSchedules.find(s => s.id === id);
    if (!existing) return { success: false, conflicts: [] };

    const merged: ClassScheduleSlot = { ...existing, ...updates };
    const conflictCheck = detectScheduleConflicts(merged, id);

    setAllSchedules(prev => prev.map(s => s.id === id ? merged : s));
    saveScheduleSlotToFirestore(merged).catch(err => console.warn('Firestore schedule update:', err));

    if (conflictCheck.hasConflict) {
      addNotification({
        title: 'Atenção: Horário Atualizado com Conflito',
        message: conflictCheck.conflicts[0].message,
        type: 'system'
      });
      soundManager.playError?.();
    } else {
      addNotification({
        title: 'Horário Atualizado',
        message: `Aula de ${merged.disciplineName} atualizada para ${merged.startTime} - ${merged.endTime}.`,
        type: 'system'
      });
      soundManager.playClick();
    }

    return {
      success: true,
      conflict: conflictCheck.conflicts[0],
      conflicts: conflictCheck.conflicts
    };
  };

  const deleteScheduleSlot = (id: string) => {
    setAllSchedules(prev => prev.filter(s => s.id !== id));
    deleteScheduleSlotFromFirestore(id).catch(err => console.warn('Firestore schedule delete:', err));
    addNotification({
      title: 'Horário Removido',
      message: 'A aula foi removida do calendário acadêmico.',
      type: 'system'
    });
    soundManager.playClick();
  };

  // Caixa Escolar (Abertura, Sangria, Reforço, Transferência, Lançamentos, Fechamento)
  const addCashTransaction = (transaction: Omit<CashTransaction, 'id' | 'timestamp'>) => {
    const now = new Date();
    const time = now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('pt-MZ');
    const newTx: CashTransaction = {
      ...transaction,
      id: `cxt-${Date.now()}`,
      timestamp: now.toISOString(),
      time: transaction.time || time,
      date: transaction.date || date
    };

    let updatedSession: CashRegisterSession | null = null;
    setAllCashSessions(prev => prev.map(session => {
      if (session.status === 'aberto' && session.institutionId === activeInstitution.id) {
        // Delta de acordo com o tipo do movimento:
        // Entrada ou Reforço aumenta o saldo em caixa
        // Saída, Sangria ou Transferência retira do saldo em caixa
        const isAddition = transaction.type === 'entrada' || transaction.type === 'reforco';
        const delta = isAddition ? transaction.amount : -transaction.amount;
        
        const newBalance = Math.max(0, session.currentBalance + delta);
        updatedSession = {
          ...session,
          currentBalance: newBalance,
          transactions: [newTx, ...session.transactions]
        };
        return updatedSession;
      }
      return session;
    }));

    if (updatedSession) {
      saveCashSessionToFirestore(updatedSession).catch(err => console.warn('Firestore sync cash session:', err));
    }

    addNotification({
      title: `Movimentação de Caixa: ${transaction.type.toUpperCase()}`,
      message: `${transaction.description} • ${transaction.amount.toLocaleString('pt-MZ')} MT`,
      type: 'payment'
    });

    soundManager.playClick();
  };

  const openCashRegister = (initialAmount: number, operatorName: string) => {
    const targetBranch = activeBranchId !== 'todas' ? activeBranchId : (activeInstitution.branches?.[0]?.id || 'branch-default');
    const newSession: CashRegisterSession = {
      id: `cx-sess-${Date.now()}`,
      institutionId: activeInstitution.id,
      branchId: targetBranch,
      operator: operatorName,
      openedAt: new Date().toLocaleString('pt-MZ'),
      openingBalance: initialAmount,
      currentBalance: initialAmount,
      status: 'aberto',
      transactions: []
    };

    setAllCashSessions(prev => [
      newSession, 
      ...prev.map(s => (s.institutionId === activeInstitution.id ? { ...s, status: 'fechado' as const } : s))
    ]);

    saveCashSessionToFirestore(newSession).catch(err => console.warn('Firestore sync open cash:', err));

    addNotification({
      title: 'Caixa Escolar Aberto',
      message: `Operador ${operatorName} abriu o caixa com fundo de ${initialAmount.toLocaleString('pt-MZ')} MT.`,
      type: 'system'
    });

    soundManager.playSuccess();
  };

  const closeCashRegister = (notes: string, reportedAmount?: number) => {
    let closedSession: CashRegisterSession | null = null;
    setAllCashSessions(prev => prev.map(session => {
      if (session.status === 'aberto' && session.institutionId === activeInstitution.id) {
        const totalEntradas = session.transactions
          .filter(t => t.type === 'entrada')
          .reduce((acc, t) => acc + t.amount, 0);

        const totalReforcos = session.transactions
          .filter(t => t.type === 'reforco')
          .reduce((acc, t) => acc + t.amount, 0);

        const totalSaidas = session.transactions
          .filter(t => t.type === 'saida')
          .reduce((acc, t) => acc + t.amount, 0);

        const totalSangrias = session.transactions
          .filter(t => t.type === 'sangria')
          .reduce((acc, t) => acc + t.amount, 0);

        const totalTransferencias = session.transactions
          .filter(t => t.type === 'transferencia')
          .reduce((acc, t) => acc + t.amount, 0);

        const expectedBalance = session.openingBalance + totalEntradas + totalReforcos - totalSaidas - totalSangrias - totalTransferencias;
        const finalReported = reportedAmount !== undefined ? reportedAmount : expectedBalance;
        const differenceAmount = finalReported - expectedBalance;

        closedSession = {
          ...session,
          status: 'fechado',
          closedAt: new Date().toLocaleString('pt-MZ'),
          closingNotes: notes,
          expectedBalance,
          reportedBalance: finalReported,
          differenceAmount,
          totalEntradas,
          totalSaidas,
          totalSangrias,
          totalReforcos,
          totalTransferencias
        };
        return closedSession;
      }
      return session;
    }));

    if (closedSession) {
      saveCashSessionToFirestore(closedSession).catch(err => console.warn('Firestore sync close cash:', err));
    }

    addNotification({
      title: 'Caixa Escolar Encerrado',
      message: `Fecho de caixa homologado com saldo apurado e relatório de quebra gerado.`,
      type: 'system'
    });

    soundManager.playSuccess();
  };

  // 14. Professores & Formadores
  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'code' | 'createdAt'>): Teacher => {
    const targetBranch = activeBranchId !== 'todas' ? activeBranchId : (activeInstitution.branches?.[0]?.id || 'branch-default');
    const prefix = teacherData.type === 'formador' ? 'FORM' : 'PROF';
    const code = `${prefix}-2026-${String(allTeachers.length + 1).padStart(3, '0')}`;
    const newTeacher: Teacher = {
      ...teacherData,
      id: `teach-${Date.now()}`,
      code,
      institutionId: activeInstitution.id,
      branchId: targetBranch,
      createdAt: new Date().toISOString()
    };

    setAllTeachers(prev => [newTeacher, ...prev]);
    saveTeacherToFirestore(newTeacher).catch(err => console.warn('Firestore sync teacher:', err));

    addNotification({
      title: 'Docente Cadastrado',
      message: `${newTeacher.fullName} (${code}) foi cadastrado com sucesso.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    let updated: Teacher | null = null;
    setAllTeachers(prev => prev.map(t => {
      if (t.id === id) {
        updated = { ...t, ...updates };
        return updated;
      }
      return t;
    }));

    if (updated) {
      saveTeacherToFirestore(updated).catch(err => console.warn('Firestore update teacher:', err));
      addNotification({
        title: 'Dados do Docente Atualizados',
        message: `Ficha cadastral de ${updated.fullName} sincronizada.`,
        type: 'system'
      });
      soundManager.playClick();
    }
  };

  const deleteTeacher = (id: string) => {
    const teacher = allTeachers.find(t => t.id === id);
    setAllTeachers(prev => prev.filter(t => t.id !== id));
    deleteTeacherFromFirestore(id).catch(err => console.warn('Firestore delete teacher:', err));
    if (activeTeacherId === id) {
      setActiveTeacherId(null);
    }
    addNotification({
      title: 'Docente Removido',
      message: teacher ? `O docente ${teacher.fullName} foi desvinculado.` : 'Docente removido.',
      type: 'system'
    });
    soundManager.playClick();
  };

  // Diário e Aulas
  const addLesson = (lessonData: Omit<ClassLesson, 'id'>) => {
    const targetBranch = activeBranchId !== 'todas' ? activeBranchId : (activeInstitution.branches?.[0]?.id || 'branch-default');
    const newL: ClassLesson = {
      ...lessonData,
      id: `lsn-${Date.now()}`,
      institutionId: activeInstitution.id,
      branchId: targetBranch
    };
    setAllLessons(prev => [newL, ...prev]);

    saveLessonToFirestore(newL).catch(err => console.warn('Firestore sync lesson:', err));

    addNotification({
      title: 'Nova Aula Registrada no Diário',
      message: `"${newL.title}" foi adicionada à turma ${newL.classGroupName}.`,
      type: 'system'
    });

    soundManager.playSuccess();
  };

  const updateLesson = (lessonId: string, updates: Partial<ClassLesson>) => {
    let updated: ClassLesson | null = null;
    setAllLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        updated = { ...l, ...updates };
        return updated;
      }
      return l;
    }));

    if (updated) {
      saveLessonToFirestore(updated).catch(err => console.warn('Firestore update lesson:', err));
      addNotification({
        title: 'Aula Atualizada',
        message: `As informações da aula "${updated.title}" foram atualizadas.`,
        type: 'system'
      });
      soundManager.playClick();
    }
  };

  const deleteLesson = (lessonId: string) => {
    const target = allLessons.find(l => l.id === lessonId);
    setAllLessons(prev => prev.filter(l => l.id !== lessonId));
    deleteLessonFromFirestore(lessonId).catch(err => console.warn('Firestore delete lesson:', err));
    addNotification({
      title: 'Aula Removida',
      message: target ? `A aula "${target.title}" foi removida do diário.` : 'Aula removida.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const addAttendanceAuditEntry = (entry: Omit<LessonAttendanceAuditLog, 'id' | 'timestamp'>) => {
    const fullLog: LessonAttendanceAuditLog = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleString('pt-MZ')
    };
    setAllAttendanceAudits(prev => [fullLog, ...prev]);
    saveAttendanceAuditToFirestore(fullLog).catch(err => console.warn('Firestore sync audit:', err));
  };

  const unlockLessonAttendance = (lessonId: string, reason: string, authorizedBy?: string): boolean => {
    let success = false;
    const target = allLessons.find(l => l.id === lessonId);
    if (!target) return false;

    const actor = authorizedBy || firebaseUser?.displayName || firebaseUser?.email || 'Coordenação Pedagógica';
    const auditEntry: LessonAttendanceAuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      lessonId: target.id,
      lessonTitle: target.title,
      classGroupId: target.classGroupId,
      classGroupName: target.classGroupName,
      disciplineName: target.disciplineName,
      studentId: 'TURMA',
      studentName: 'Desbloqueio Oficial de Chamada Homologada',
      previousStatus: 'bloqueado',
      newStatus: 'presente',
      reason: reason || 'Autorização formal para retificação de chamada no diário de classe',
      actorName: actor,
      actorRole: activeRole.toUpperCase(),
      actorEmail: firebaseUser?.email || '',
      timestamp: new Date().toLocaleString('pt-MZ'),
      actionType: 'desbloqueio'
    };

    setAllAttendanceAudits(prev => [auditEntry, ...prev]);
    saveAttendanceAuditToFirestore(auditEntry).catch(e => console.warn(e));

    setAllLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        success = true;
        const updated: ClassLesson = {
          ...l,
          isAttendanceLocked: false,
          auditLogs: [auditEntry, ...(l.auditLogs || [])],
          updatedAt: new Date().toLocaleString('pt-MZ')
        };
        saveLessonToFirestore(updated).catch(e => console.warn(e));
        return updated;
      }
      return l;
    }));

    addNotification({
      title: 'Chamada Desbloqueada para Retificação',
      message: `Permissão validada. Justificativa registrada: "${reason}".`,
      type: 'system'
    });
    soundManager.playClick();
    return success;
  };

  const saveAttendance = (
    lessonId: string, 
    attendances: { [studentId: string]: AttendanceStatus | boolean },
    options?: {
      isCorrection?: boolean;
      correctionReason?: string;
      actionType?: 'registro_inicial' | 'marcar_todos_presentes' | 'correcao' | 'desbloqueio';
      notes?: { [studentId: string]: string };
      lockAttendance?: boolean;
    }
  ) => {
    let updatedLsn: ClassLesson | null = null;
    const nowStr = new Date().toLocaleString('pt-MZ');
    const actorName = firebaseUser?.displayName || firebaseUser?.email || 'Docente Responsável';

    // Contadores de presença
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let justifiedCount = 0;

    Object.values(attendances).forEach(val => {
      if (val === 'presente' || val === true) presentCount++;
      else if (val === 'ausente' || val === false) absentCount++;
      else if (val === 'atraso') lateCount++;
      else if (val === 'justificado') justifiedCount++;
    });

    const targetLesson = allLessons.find(l => l.id === lessonId);
    const newAudits: LessonAttendanceAuditLog[] = [];

    // Gerar auditoria para a ação realizada
    if (targetLesson) {
      if (options?.actionType === 'marcar_todos_presentes') {
        const auditLog: LessonAttendanceAuditLog = {
          id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          lessonId: targetLesson.id,
          lessonTitle: targetLesson.title,
          classGroupId: targetLesson.classGroupId,
          classGroupName: targetLesson.classGroupName,
          disciplineName: targetLesson.disciplineName,
          studentId: 'ALL',
          studentName: 'Todos os Alunos da Turma',
          previousStatus: 'pendente',
          newStatus: 'presente',
          reason: options?.correctionReason || 'Acionamento rápido do botão "MARCAR TODOS PRESENTES"',
          actorName: actorName,
          actorRole: activeRole.toUpperCase(),
          actorEmail: firebaseUser?.email || '',
          timestamp: nowStr,
          actionType: 'marcar_todos_presentes'
        };
        newAudits.push(auditLog);
      } else if (options?.isCorrection || options?.actionType === 'correcao') {
        // Identificar estudantes que tiveram status alterado
        const prevAttendances = targetLesson.attendances || {};
        Object.entries(attendances).forEach(([stdId, newSt]) => {
          const prevSt = prevAttendances[stdId];
          const prevStr = prevSt === true ? 'presente' : prevSt === false ? 'ausente' : prevSt || 'pendente';
          const newStr = newSt === true ? 'presente' : newSt === false ? 'ausente' : newSt;
          if (prevStr !== newStr) {
            const studentObj = allStudents.find(s => s.id === stdId);
            const auditLog: LessonAttendanceAuditLog = {
              id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              lessonId: targetLesson.id,
              lessonTitle: targetLesson.title,
              classGroupId: targetLesson.classGroupId,
              classGroupName: targetLesson.classGroupName,
              disciplineName: targetLesson.disciplineName,
              studentId: stdId,
              studentName: studentObj?.fullName || stdId,
              studentCode: studentObj?.code,
              previousStatus: prevStr as AttendanceStatus,
              newStatus: newStr as AttendanceStatus,
              reason: options?.correctionReason || 'Retificação individual de frequência',
              actorName: actorName,
              actorRole: activeRole.toUpperCase(),
              actorEmail: firebaseUser?.email || '',
              timestamp: nowStr,
              actionType: 'correcao'
            };
            newAudits.push(auditLog);
          }
        });
      } else {
        // Registro inicial
        const auditLog: LessonAttendanceAuditLog = {
          id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          lessonId: targetLesson.id,
          lessonTitle: targetLesson.title,
          classGroupId: targetLesson.classGroupId,
          classGroupName: targetLesson.classGroupName,
          disciplineName: targetLesson.disciplineName,
          studentId: 'TURMA',
          studentName: 'Chamada da Turma Consolidada',
          newStatus: 'presente',
          reason: options?.correctionReason || 'Lançamento e consolidação de presenças no diário',
          actorName: actorName,
          actorRole: activeRole.toUpperCase(),
          actorEmail: firebaseUser?.email || '',
          timestamp: nowStr,
          actionType: options?.actionType || 'registro_inicial'
        };
        newAudits.push(auditLog);
      }
    }

    if (newAudits.length > 0) {
      setAllAttendanceAudits(prev => [...newAudits, ...prev]);
      newAudits.forEach(aud => {
        saveAttendanceAuditToFirestore(aud).catch(err => console.warn('Audit firestore save:', err));
      });
    }

    setAllLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        updatedLsn = { 
          ...l, 
          attendances,
          attendanceNotes: options?.notes ? { ...(l.attendanceNotes || {}), ...options.notes } : l.attendanceNotes,
          totalPresent: presentCount,
          totalAbsent: absentCount,
          totalLate: lateCount,
          totalJustified: justifiedCount,
          isAttendanceLocked: options?.lockAttendance !== undefined ? options.lockAttendance : true,
          attendanceFinalizedAt: nowStr,
          attendanceFinalizedBy: actorName,
          auditLogs: [...newAudits, ...(l.auditLogs || [])],
          updatedAt: nowStr
        };
        return updatedLsn;
      }
      return l;
    }));

    if (updatedLsn) {
      saveLessonToFirestore(updatedLsn).catch(err => console.warn('Firestore sync attendance:', err));
    }

    // Recalcular percentual de frequência dos alunos no SIGAR
    setAllStudents(prev => prev.map(student => {
      const studentLessons = allLessons.filter(l => (l.id === lessonId ? attendances[student.id] : l.attendances[student.id]) !== undefined);
      if (studentLessons.length === 0) return student;
      
      let presences = 0;
      let totalCounted = 0;
      studentLessons.forEach(l => {
        const val = l.id === lessonId ? attendances[student.id] : l.attendances[student.id];
        if (val === 'presente' || val === true) {
          presences += 1;
          totalCounted += 1;
        } else if (val === 'atraso') {
          presences += 0.8;
          totalCounted += 1;
        } else if (val === 'ausente' || val === false) {
          totalCounted += 1;
        } else if (val === 'justificado') {
          // Justified absence does not lower student attendance penalty
          presences += 1;
          totalCounted += 1;
        }
      });
      const rate = totalCounted > 0 ? Math.round((presences / totalCounted) * 100) : 100;
      return { ...student, attendancePercentage: rate };
    }));

    addNotification({
      title: options?.isCorrection ? 'Frequência Corrigida & Auditada' : 'Chamada Homologada com Sucesso',
      message: options?.isCorrection 
        ? `Retificação registrada para ${newAudits.length} registro(s) com trilha de auditoria formal.`
        : `${presentCount} presentes, ${absentCount} ausentes, ${lateCount} atrasos, ${justifiedCount} justificados.`,
      type: 'system'
    });

    soundManager.playClick();
  };

  const saveStudentAssessmentScore = (params: {
    classGroupId: string;
    studentId: string;
    assessmentTitle: string;
    moduleName: string;
    weight: number;
    maxScore: number;
    score: number;
    date: string;
    teacherName?: string;
  }) => {
    let studentUpdated: Student | null = null;
    setAllStudents(prev => prev.map(student => {
      if (student.id === params.studentId) {
        const existingAssessments = student.assessments || [];
        const existingIndex = existingAssessments.findIndex(
          a => a.title.toLowerCase() === params.assessmentTitle.toLowerCase() && a.moduleName.toLowerCase() === params.moduleName.toLowerCase()
        );

        let newAssessments = [...existingAssessments];
        const newRecord: AssessmentRecord = {
          id: existingIndex >= 0 ? existingAssessments[existingIndex].id : `ass-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          title: params.assessmentTitle,
          moduleName: params.moduleName,
          weight: params.weight,
          maxScore: params.maxScore,
          score: params.score,
          date: params.date,
          teacher: params.teacherName || activeTeacher?.fullName || 'Professor / Formador'
        };

        if (existingIndex >= 0) {
          newAssessments[existingIndex] = newRecord;
        } else {
          newAssessments.push(newRecord);
        }

        // Recalcular média ponderada
        const totalWeight = newAssessments.reduce((sum, a) => sum + (a.weight || 1), 0);
        const weightedScore = newAssessments.reduce((sum, a) => sum + ((a.score / (a.maxScore || 20)) * 20 * (a.weight || 1)), 0);
        const avg = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 10) / 10 : 0;

        studentUpdated = {
          ...student,
          assessments: newAssessments,
          averageGrade: avg
        };
        return studentUpdated;
      }
      return student;
    }));

    if (studentUpdated) {
      saveStudentToFirestore(studentUpdated).catch(err => console.warn('Firestore sync assessment score:', err));
    }

    addNotification({
      title: 'Nota Lançada na Pauta',
      message: `Nota ${params.score}/${params.maxScore} gravada para "${params.assessmentTitle}". Média atualizada.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  // ==========================================================
  // 17. MOTOR DE AVALIAÇÕES E FÓRMULAS DE CÁLCULO
  // ==========================================================
  const addEvaluation = (item: Omit<EvaluationItem, 'id' | 'createdAt'>): string => {
    const id = `eval-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newEval: EvaluationItem = {
      ...item,
      id,
      institutionId: item.institutionId || activeInstitution.id,
      branchId: item.branchId || (activeBranchId !== 'todas' ? activeBranchId : undefined),
      scores: item.scores || {},
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAllEvaluations(prev => [newEval, ...prev]);
    addNotification({
      title: 'Nova Avaliação Criada',
      message: `"${newEval.name}" (${newEval.discipline}) cadastrada com peso ${newEval.weight}%.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return id;
  };

  const updateEvaluation = (id: string, updates: Partial<EvaluationItem>) => {
    setAllEvaluations(prev => prev.map(ev => {
      if (ev.id === id) {
        return { ...ev, ...updates };
      }
      return ev;
    }));
    addNotification({
      title: 'Avaliação Atualizada',
      message: 'Parâmetros da avaliação salvos com sucesso.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const deleteEvaluation = (id: string) => {
    setAllEvaluations(prev => prev.filter(ev => ev.id !== id));
    addNotification({
      title: 'Avaliação Excluída',
      message: 'A avaliação foi removida da pauta.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const saveEvaluationScore = (
    evaluationId: string,
    studentId: string,
    score: number,
    maxScore?: number,
    notes?: string
  ) => {
    const student = allStudents.find(s => s.id === studentId);
    const time = new Date().toLocaleString('pt-MZ');
    
    setAllEvaluations(prev => prev.map(ev => {
      if (ev.id === evaluationId) {
        const actualMax = maxScore !== undefined ? maxScore : ev.maxScore;
        const clampedScore = Math.max(0, Math.min(actualMax, score));
        return {
          ...ev,
          scores: {
            ...ev.scores,
            [studentId]: {
              studentId,
              studentName: student?.fullName || studentId,
              score: clampedScore,
              maxScore: actualMax,
              notes: notes !== undefined ? notes : ev.scores[studentId]?.notes,
              updatedAt: time,
              gradedBy: activeTeacher?.fullName || 'Docente'
            }
          }
        };
      }
      return ev;
    }));

    // Sincronizar também no histórico e pauta resumida do aluno
    const targetEval = allEvaluations.find(ev => ev.id === evaluationId);
    if (targetEval && student) {
      saveStudentAssessmentScore({
        classGroupId: targetEval.classGroupId,
        studentId,
        assessmentTitle: targetEval.name,
        moduleName: targetEval.discipline,
        weight: targetEval.weight,
        maxScore: targetEval.maxScore,
        score,
        date: targetEval.date,
        teacherName: targetEval.teacher
      });
    }
  };

  const saveBulkEvaluationScores = (
    evaluationId: string,
    scores: Record<string, { score: number; notes?: string }>
  ) => {
    const time = new Date().toLocaleString('pt-MZ');
    const targetEval = allEvaluations.find(ev => ev.id === evaluationId);
    if (!targetEval) return;

    setAllEvaluations(prev => prev.map(ev => {
      if (ev.id === evaluationId) {
        const nextScores = { ...ev.scores };
        Object.entries(scores).forEach(([stdId, data]) => {
          const student = allStudents.find(s => s.id === stdId);
          const clamped = Math.max(0, Math.min(ev.maxScore, data.score));
          nextScores[stdId] = {
            studentId: stdId,
            studentName: student?.fullName || stdId,
            score: clamped,
            maxScore: ev.maxScore,
            notes: data.notes || nextScores[stdId]?.notes,
            updatedAt: time,
            gradedBy: activeTeacher?.fullName || 'Docente'
          };

          // Salvar também no registro do estudante
          if (student) {
            saveStudentAssessmentScore({
              classGroupId: targetEval.classGroupId,
              studentId: stdId,
              assessmentTitle: targetEval.name,
              moduleName: targetEval.discipline,
              weight: targetEval.weight,
              maxScore: targetEval.maxScore,
              score: clamped,
              date: targetEval.date,
              teacherName: targetEval.teacher
            });
          }
        });
        return { ...ev, scores: nextScores, status: 'homologada' };
      }
      return ev;
    }));

    addNotification({
      title: 'Pauta Gravada & Sincronizada',
      message: `Notas atribuídas a ${Object.keys(scores).length} aluno(s) em "${targetEval.name}".`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const addCalculationFormula = (formula: Omit<CalculationFormula, 'id' | 'createdAt'>): string => {
    const id = `formula-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newFormula: CalculationFormula = {
      ...formula,
      id,
      institutionId: formula.institutionId || activeInstitution.id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (newFormula.isDefault) {
      setAllCalculationFormulas(prev => prev.map(f => ({ ...f, isDefault: false })));
    }

    setAllCalculationFormulas(prev => [newFormula, ...prev]);
    addNotification({
      title: 'Fórmula de Cálculo Registrada',
      message: `Fórmula "${newFormula.name}" adicionada ao motor.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return id;
  };

  const updateCalculationFormula = (id: string, updates: Partial<CalculationFormula>) => {
    setAllCalculationFormulas(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, ...updates };
      }
      if (updates.isDefault && f.id !== id) {
        return { ...f, isDefault: false };
      }
      return f;
    }));
    addNotification({
      title: 'Fórmula Atualizada',
      message: 'Parâmetros de cálculo gravados.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const deleteCalculationFormula = (id: string) => {
    setAllCalculationFormulas(prev => prev.filter(f => f.id !== id));
    addNotification({
      title: 'Fórmula Removida',
      message: 'Fórmula excluída do motor de avaliações.',
      type: 'system'
    });
    soundManager.playClick();
  };

  // Motor de Cálculo Automático:
  // Executa o cálculo da nota final do aluno baseado nas regras da fórmula selecionada (ou padrão)
  const calculateStudentFinalGrade = (
    studentId: string,
    classGroupId: string,
    discipline?: string,
    period?: string,
    formulaId?: string
  ): StudentCalculatedGrade | null => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return null;

    // Localizar fórmula aplicável
    let formula = calculationFormulas.find(f => f.id === formulaId);
    if (!formula && discipline) {
      formula = calculationFormulas.find(f => f.discipline === discipline);
    }
    if (!formula && classGroupId) {
      formula = calculationFormulas.find(f => f.classGroupId === classGroupId);
    }
    if (!formula) {
      formula = calculationFormulas.find(f => f.isDefault) || calculationFormulas[0] || INITIAL_CALCULATION_FORMULAS[0];
    }
    if (!formula) return null;

    // Buscar avaliações da turma
    let classEvals = evaluations.filter(ev => ev.classGroupId === classGroupId);
    if (discipline && discipline !== 'todas') {
      classEvals = classEvals.filter(ev => ev.discipline === discipline);
    }
    if (period && period !== 'todos') {
      classEvals = classEvals.filter(ev => ev.period === period);
    }

    const componentScores: Record<string, {
      type: AssessmentType;
      label: string;
      weight: number;
      averageScore: number;
      weightedContribution: number;
      count: number;
    }> = {};

    let totalWeightedScore = 0;
    const assessmentsList: {
      id: string;
      name: string;
      type: AssessmentType;
      score: number;
      maxScore: number;
      weight: number;
    }[] = [];

    formula.components.forEach(comp => {
      const matchingEvals = classEvals.filter(ev => ev.type === comp.type);
      let totalNormalized = 0;
      let count = 0;

      matchingEvals.forEach(ev => {
        const studentScore = ev.scores[studentId];
        if (studentScore !== undefined && studentScore.score !== undefined) {
          const normalized = (studentScore.score / (ev.maxScore || 20)) * 20;
          totalNormalized += normalized;
          count += 1;
          assessmentsList.push({
            id: ev.id,
            name: ev.name,
            type: ev.type,
            score: studentScore.score,
            maxScore: ev.maxScore,
            weight: ev.weight
          });
        }
      });

      const avgScore = count > 0 ? totalNormalized / count : 0;
      const contribution = (avgScore * comp.weight) / 100;
      totalWeightedScore += contribution;

      componentScores[comp.type] = {
        type: comp.type,
        label: comp.label || comp.type,
        weight: comp.weight,
        averageScore: Math.round(avgScore * 10) / 10,
        weightedContribution: Math.round(contribution * 100) / 100,
        count
      };
    });

    const finalScore = Math.round(totalWeightedScore * 10) / 10;

    let status: 'Aprovado' | 'Dispensado' | 'Recurso' | 'Reprovado';
    if (finalScore >= formula.examExemptionScore) {
      status = 'Dispensado';
    } else if (finalScore >= formula.minPassingScore) {
      status = 'Aprovado';
    } else if (finalScore >= (formula.recourseMinScore || 7.0)) {
      status = 'Recurso';
    } else {
      status = 'Reprovado';
    }

    return {
      studentId,
      studentName: student.fullName,
      studentCode: student.code,
      finalScore,
      status,
      componentScores,
      assessmentsList
    };
  };

  // ==========================================================
  // 18. PAUTAS ACADÊMICAS & HOMOLOGAÇÃO
  // ==========================================================
  const homologatePauta = (data: Omit<PautaHomologationRecord, 'id' | 'homologatedAt'>) => {
    const nowStr = new Date().toLocaleString('pt-MZ');
    const existingIndex = allPautaHomologations.findIndex(h => h.pautaKey === data.pautaKey);
    
    if (existingIndex >= 0) {
      setAllPautaHomologations(prev => prev.map((item, idx) => {
        if (idx === existingIndex) {
          return {
            ...item,
            ...data,
            homologatedAt: nowStr
          };
        }
        return item;
      }));
    } else {
      const newRecord: PautaHomologationRecord = {
        ...data,
        id: `homol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        institutionId: data.institutionId || activeInstitution.id,
        branchId: data.branchId || (activeBranchId !== 'todas' ? activeBranchId : undefined),
        homologatedAt: nowStr
      };
      setAllPautaHomologations(prev => [newRecord, ...prev]);
    }

    addNotification({
      title: data.status === 'HOMOLOGADA' ? 'Pauta Oficial Homologada' : 'Estado da Pauta Atualizado',
      message: `A pauta "${data.pautaKey}" foi assinada digitalmente e homologada por ${data.homologatedBy || 'Direção'}.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const overrideStudentPautaSituation = (
    pautaKey: string,
    studentId: string,
    newSituation: PautaSituacao,
    justification: string
  ) => {
    const nowStr = new Date().toLocaleString('pt-MZ');
    const student = allStudents.find(s => s.id === studentId);
    const existingRecord = allPautaHomologations.find(h => h.pautaKey === pautaKey);

    const overrideEntry = {
      studentId,
      previousSituation: (newSituation === 'APROVADO' ? 'REPROVADO' : 'APROVADO') as PautaSituacao,
      newSituation,
      justification,
      authorizedBy: firebaseUser?.displayName || 'Diretor Geral',
      authorizedRole: activeRole.toUpperCase(),
      authorizedAt: nowStr
    };

    if (existingRecord) {
      setAllPautaHomologations(prev => prev.map(h => {
        if (h.pautaKey === pautaKey) {
          return {
            ...h,
            overriddenStudents: {
              ...(h.overriddenStudents || {}),
              [studentId]: overrideEntry
            }
          };
        }
        return h;
      }));
    } else {
      const newRecord: PautaHomologationRecord = {
        id: `homol-${Date.now()}`,
        institutionId: activeInstitution.id,
        branchId: activeBranchId !== 'todas' ? activeBranchId : undefined,
        pautaKey,
        scope: 'por_turma',
        status: 'HOMOLOGADA',
        homologatedBy: firebaseUser?.displayName || 'Diretor Geral',
        homologatedRole: activeRole.toUpperCase(),
        homologatedAt: nowStr,
        approvalNotes: 'Pauta com retificação administrativa autorizada pela Direção.',
        overriddenStudents: {
          [studentId]: overrideEntry
        }
      };
      setAllPautaHomologations(prev => [newRecord, ...prev]);
    }

    addNotification({
      title: 'Decisão Administrativa Registada',
      message: `Situação do formando ${student?.fullName || studentId} retificada para "${newSituation}". Justificativa arquivada.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  // ==========================================================
  // 20. MÓDULO DE ESTÁGIOS
  // ==========================================================
  const addInternship = (item: Omit<InternshipContract, 'id' | 'createdAt'>): string => {
    const id = `intern-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newInternship: InternshipContract = {
      ...item,
      id,
      institutionId: item.institutionId || activeInstitution.id,
      branchId: item.branchId || (activeBranchId !== 'todas' ? activeBranchId : undefined),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAllInternships(prev => [newInternship, ...prev]);
    addNotification({
      title: 'Estágio Registado',
      message: `Formando ${newInternship.studentName} vinculado à empresa "${newInternship.company.name}".`,
      type: 'system'
    });
    soundManager.playSuccess();
    return id;
  };

  const updateInternship = (id: string, updates: Partial<InternshipContract>) => {
    setAllInternships(prev => prev.map(intern => {
      if (intern.id === id) {
        return {
          ...intern,
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return intern;
    }));
    addNotification({
      title: 'Estágio Atualizado',
      message: 'Os dados do processo de estágio foram salvos.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const deleteInternship = (id: string) => {
    setAllInternships(prev => prev.filter(intern => intern.id !== id));
    addNotification({
      title: 'Estágio Removido',
      message: 'O registo de estágio foi excluído do sistema.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const evaluateInternship = (id: string, evaluation: InternshipEvaluation) => {
    setAllInternships(prev => prev.map(intern => {
      if (intern.id === id) {
        const isApproved = evaluation.score >= 10;
        return {
          ...intern,
          evaluation,
          status: isApproved ? 'concluído' : 'concluído',
          updatedAt: new Date().toISOString().split('T')[0],
          generatedDocuments: {
            ...(intern.generatedDocuments || {}),
            fichaAvaliacaoDate: evaluation.evaluationDate,
            ...(isApproved ? { declaracaoConclusaoDate: evaluation.evaluationDate } : {})
          }
        };
      }
      return intern;
    }));

    addNotification({
      title: 'Avaliação de Estágio Registada',
      message: `Nota final de ${evaluation.score}/20 atribuída pelo supervisor da empresa. Parecer: ${evaluation.recommendation}.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const changeInternshipStatus = (id: string, newStatus: InternshipStatus) => {
    setAllInternships(prev => prev.map(intern => {
      if (intern.id === id) {
        return {
          ...intern,
          status: newStatus,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return intern;
    }));
    addNotification({
      title: 'Estado do Estágio Atualizado',
      message: `Processo de estágio alterado para "${newStatus.toUpperCase()}".`,
      type: 'system'
    });
    soundManager.playClick();
  };

  // ==========================================================
  // 29. MÓDULO FINANCEIRO (CONTAS A RECEBER E CONTAS A PAGAR)
  // ==========================================================
  const addContaReceber = (item: Omit<ContaReceber, 'id' | 'createdAt'>): string => {
    const id = `cr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newConta: ContaReceber = {
      ...item,
      id,
      institutionId: item.institutionId || activeInstitution.id,
      branchId: item.branchId || (activeBranchId !== 'todas' ? activeBranchId : undefined),
      totalAmount: (item.amount || 0) + (item.fine || 0) + (item.interest || 0) - (item.discount || 0),
      createdAt: new Date().toISOString()
    };
    setAllContasReceber(prev => [newConta, ...prev]);
    addNotification({
      title: 'Conta a Receber Criada',
      message: `${newConta.description} no valor de ${newConta.totalAmount.toLocaleString('pt-MZ')} MTn registrado.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return id;
  };

  const updateContaReceber = (id: string, updates: Partial<ContaReceber>) => {
    setAllContasReceber(prev => prev.map(c => {
      if (c.id === id) {
        const amount = updates.amount !== undefined ? updates.amount : c.amount;
        const fine = updates.fine !== undefined ? updates.fine : c.fine;
        const interest = updates.interest !== undefined ? updates.interest : c.interest;
        const discount = updates.discount !== undefined ? updates.discount : c.discount;
        const totalAmount = amount + fine + interest - discount;
        return {
          ...c,
          ...updates,
          totalAmount,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
    addNotification({
      title: 'Lançamento Financeiro Atualizado',
      message: 'Dados da conta a receber atualizados com sucesso.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const deleteContaReceber = (id: string) => {
    setAllContasReceber(prev => prev.filter(c => c.id !== id));
    addNotification({
      title: 'Conta a Receber Cancelada/Excluída',
      message: 'O lançamento a receber foi removido do sistema.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const receiveContaPayment = (id: string, paymentData: {
    paidAmount: number;
    paymentMethod: 'Dinheiro' | 'M-Pesa' | 'e-Mola' | 'Ponto24' | 'Transferência Bancária' | 'POS';
    receiptNumber?: string;
    notes?: string;
    registerInCash?: boolean;
    operator?: string;
  }) => {
    const target = allContasReceber.find(c => c.id === id);
    if (!target) return;

    const receipt = paymentData.receiptNumber || `REC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const today = new Date().toISOString().split('T')[0];

    setAllContasReceber(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          paidAmount: paymentData.paidAmount,
          status: 'pago',
          paymentDate: today,
          paymentMethod: paymentData.paymentMethod,
          receiptNumber: receipt,
          notes: paymentData.notes ? `${c.notes || ''} | ${paymentData.notes}` : c.notes,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    // Se o pagamento for registrado em caixa
    if (paymentData.registerInCash !== false) {
      const categoryMap: Record<string, string> = {
        mensalidade: 'Propinas',
        matricula: 'Matrículas',
        inscricao: 'Inscrições',
        cracha: 'Documentos & Crachás',
        certificado: 'Certificados & Diplomas',
        manual: 'Material & Livros',
        uniforme: 'Uniformes & Fardas',
        declaracao: 'Declarações',
        avaliacao: 'Exames & Provas',
        multa: 'Multas & Penalidades',
        outros: 'Outras Receitas'
      };

      const cashMethod = paymentData.paymentMethod === 'Transferência Bancária' 
        ? 'Transferência' 
        : (paymentData.paymentMethod === 'Ponto24' ? 'POS' : paymentData.paymentMethod);

      addCashTransaction({
        institutionId: target.institutionId,
        branchId: target.branchId,
        type: 'entrada',
        amount: paymentData.paidAmount,
        description: `Recebimento: ${target.description} (${target.studentName || target.debtorName || 'Avulso'})`,
        category: categoryMap[target.category] || 'Outros',
        operator: paymentData.operator || firebaseUser?.displayName || 'Tesouraria',
        paymentMethod: cashMethod as any,
        studentName: target.studentName || target.debtorName,
        documentRef: receipt
      });
    }

    addNotification({
      title: 'Pagamento Liquidado com Sucesso',
      message: `Recibo ${receipt} emitido. Valor de ${paymentData.paidAmount.toLocaleString('pt-MZ')} MTn confirmado via ${paymentData.paymentMethod}.`,
      type: 'payment'
    });
    soundManager.playSuccess();
  };

  const addContaPagar = (item: Omit<ContaPagar, 'id' | 'createdAt'>): string => {
    const id = `cp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newConta: ContaPagar = {
      ...item,
      id,
      institutionId: item.institutionId || activeInstitution.id,
      branchId: item.branchId || (activeBranchId !== 'todas' ? activeBranchId : undefined),
      createdAt: new Date().toISOString()
    };
    setAllContasPagar(prev => [newConta, ...prev]);
    addNotification({
      title: 'Conta a Pagar Lançada',
      message: `Despesa "${newConta.despesa}" no valor de ${newConta.valor.toLocaleString('pt-MZ')} MTn agendada para ${newConta.data}.`,
      type: 'payment'
    });
    soundManager.playSuccess();
    return id;
  };

  const updateContaPagar = (id: string, updates: Partial<ContaPagar>) => {
    setAllContasPagar(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
    addNotification({
      title: 'Conta a Pagar Atualizada',
      message: 'Informações da despesa atualizadas.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const deleteContaPagar = (id: string) => {
    setAllContasPagar(prev => prev.filter(c => c.id !== id));
    addNotification({
      title: 'Despesa Excluída',
      message: 'A conta a pagar foi removida.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const payContaPagar = (id: string, paymentData: {
    paymentMethod: 'Transferência Bancária' | 'M-Pesa' | 'e-Mola' | 'Dinheiro (Caixa)' | 'Cheque' | 'POS';
    paymentDate?: string;
    invoiceNumber?: string;
    notes?: string;
    deductFromCash?: boolean;
    paidBy?: string;
  }) => {
    const target = allContasPagar.find(c => c.id === id);
    if (!target) return;

    const today = paymentData.paymentDate || new Date().toISOString().split('T')[0];

    setAllContasPagar(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'pago',
          paymentDate: today,
          paymentMethod: paymentData.paymentMethod,
          invoiceNumber: paymentData.invoiceNumber || c.invoiceNumber,
          notes: paymentData.notes ? `${c.notes || ''} | ${paymentData.notes}` : c.notes,
          paidBy: paymentData.paidBy || firebaseUser?.displayName || 'Tesouraria',
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    if (paymentData.deductFromCash || paymentData.paymentMethod === 'Dinheiro (Caixa)') {
      addCashTransaction({
        institutionId: target.institutionId,
        branchId: target.branchId,
        type: 'saida',
        amount: target.valor,
        description: `Saída p/ Pagamento: ${target.despesa} (${target.fornecedor || target.funcionario || target.servico || target.categoria})`,
        category: target.categoria || 'Despesas Gerais',
        operator: paymentData.paidBy || firebaseUser?.displayName || 'Tesoureiro',
        paymentMethod: 'Dinheiro',
        documentRef: paymentData.invoiceNumber || target.invoiceNumber || `DESP-${Date.now().toString().slice(-5)}`
      });
    }

    addNotification({
      title: 'Pagamento Efetuado',
      message: `Despesa "${target.despesa}" liquidada no valor de ${target.valor.toLocaleString('pt-MZ')} MTn via ${paymentData.paymentMethod}.`,
      type: 'payment'
    });
    soundManager.playSuccess();
  };

  // ==========================================================
  // 30. MÓDULO DE PAGAMENTOS (PORTAL EFETUAR PAGAMENTO)
  // ==========================================================
  const submitPayment = (data: Omit<PaymentRecord, 'id' | 'createdAt' | 'status' | 'serviceReleased' | 'auditTrail'>): string => {
    const id = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newRecord: PaymentRecord = {
      ...data,
      id,
      institutionId: data.institutionId || activeInstitution.id,
      branchId: data.branchId || (activeBranchId !== 'todas' ? activeBranchId : undefined),
      status: 'PENDENTE DE CONFIRMAÇÃO',
      createdAt: now,
      serviceReleased: false,
      auditTrail: [
        {
          id: `aud-${Date.now()}-1`,
          timestamp: now,
          actorName: data.studentName,
          actorRole: 'Aluno / Formando',
          action: 'Submissão de Pagamento',
          details: `Pagamento submetido via portal: ${data.serviceItem} (${data.amount.toLocaleString('pt-MZ')} MT via ${data.network}). Código da transação: ${data.transactionCode}. Data: ${data.date} às ${data.time}. Comprovativo anexado.`
        }
      ]
    };

    setAllPaymentRecords(prev => [newRecord, ...prev]);

    addNotification({
      title: 'Pagamento Submetido com Sucesso',
      message: `Comprovativo de ${data.serviceItem} (${data.amount.toLocaleString('pt-MZ')} MT via ${data.network}) submetido. Estado: PENDENTE DE CONFIRMAÇÃO.`,
      type: 'payment'
    });
    soundManager.playSuccess();
    return id;
  };

  const approvePayment = (id: string, notes?: string, actorName?: string) => {
    const target = allPaymentRecords.find(p => p.id === id);
    if (!target) return;

    const operator = actorName || firebaseUser?.displayName || 'Administrador Financeiro';
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const receiptNum = target.receiptNumber || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Encontrar o aluno para atualizar saldo, adicionar recibo e auditoria
    const student = allStudents.find(s => s.id === target.studentId || s.code === target.studentCode);
    const balanceBefore = student?.balanceOwing ?? 0;
    const balanceAfter = Math.max(0, balanceBefore - target.amount);

    const serviceMessage = target.serviceDescription || PAYMENT_SERVICE_CATALOG[target.serviceItem]?.serviceReleaseDetail || `Serviço "${target.serviceItem}" liberado com sucesso.`;

    const approvalAuditEntry: PaymentAuditEntry = {
      id: `aud-${Date.now()}-app`,
      timestamp: now,
      actorName: operator,
      actorRole: 'Administrador Financeiro',
      action: 'Aprovação de Pagamento & Liberação de Serviço',
      details: `Pagamento homologado: ${target.serviceItem} no valor de ${target.amount.toLocaleString('pt-MZ')} MT (${target.network} - Tx: ${target.transactionCode}). Recibo ${receiptNum} gerado. Saldo discente atualizado de ${balanceBefore} MT para ${balanceAfter} MT. Serviço liberado: ${serviceMessage}. ${notes ? 'Obs: ' + notes : ''}`
    };

    // 2. Atualizar o registro do pagamento
    setAllPaymentRecords(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'PAGO',
          reviewedBy: operator,
          reviewedAt: now,
          receiptNumber: receiptNum,
          serviceReleased: true,
          serviceReleasedAt: now,
          serviceReleaseMessage: serviceMessage,
          balanceBefore,
          balanceAfter,
          adminNotes: notes,
          auditTrail: [approvalAuditEntry, ...(p.auditTrail || [])]
        };
      }
      return p;
    }));

    // 3. Atualizar aluno (saldo, recibos, auditoria)
    if (student) {
      const studentReceipt: StudentReceiptRecord = {
        id: `rec-${Date.now()}`,
        receiptNumber: receiptNum,
        date: target.date || today,
        amount: target.amount,
        description: `Pagamento de ${target.serviceItem} via ${target.network} (Tx: ${target.transactionCode})`,
        paymentMethod: target.network === 'M-Pesa' ? 'M-Pesa' : 'e-Mola',
        status: 'Emitido',
        qrVerificationCode: `SIVERC-REC-${Date.now().toString(36).toUpperCase()}`
      };

      const studentAudit: StudentAuditEntry = {
        id: `aud-stu-${Date.now()}`,
        timestamp: now,
        actorName: operator,
        actorRole: 'Administrador Financeiro',
        action: 'Homologação de Pagamento e Liberação de Serviço',
        details: `Pagamento de ${target.serviceItem} no valor de ${target.amount.toLocaleString('pt-MZ')} MT (Rede: ${target.network}, Tx: ${target.transactionCode}) APROVADO. Recibo ${receiptNum} emitido. Saldo atualizado de ${balanceBefore} MT para ${balanceAfter} MT. Serviço liberado com sucesso.`
      };

      setAllStudents(prev => prev.map(s => {
        if (s.id === student.id) {
          const newBalance = Math.max(0, (s.balanceOwing || 0) - target.amount);
          return {
            ...s,
            balanceOwing: newBalance,
            paymentStatus: newBalance === 0 ? 'Pago' : (s.paymentStatus === 'Atrasado' ? 'Pendente' : s.paymentStatus),
            receipts: [studentReceipt, ...(s.receipts || [])],
            auditTrail: [studentAudit, ...(s.auditTrail || [])]
          };
        }
        return s;
      }));
    }

    // 4. Registrar no Caixa Escolar do Dia
    const categoryMap: Record<string, string> = {
      mensalidade: 'Propinas',
      inscrição: 'Inscrições',
      crachá: 'Documentos & Crachás',
      certificado: 'Certificados & Diplomas',
      manual: 'Material & Livros',
      uniforme: 'Uniformes & Fardas',
      declaração: 'Declarações',
      avaliação: 'Exames & Provas',
      multa: 'Multas & Penalidades',
      outros: 'Outras Receitas'
    };

    addCashTransaction({
      institutionId: target.institutionId,
      branchId: target.branchId,
      type: 'entrada',
      amount: target.amount,
      description: `Pagamento Homologado: ${target.serviceItem} - ${target.studentName} (${target.network} Tx: ${target.transactionCode})`,
      category: categoryMap[target.serviceItem] || 'Outros',
      operator,
      paymentMethod: target.network === 'M-Pesa' ? 'M-Pesa' : 'e-Mola',
      studentName: target.studentName,
      documentRef: receiptNum
    });

    // 5. Se houver Conta a Receber pendente correspondente, dar baixa
    setAllContasReceber(prev => prev.map(c => {
      if (c.studentId === target.studentId && c.status === 'pendente' && c.category === target.serviceItem) {
        return {
          ...c,
          status: 'pago',
          paidAmount: target.amount,
          paymentDate: today,
          paymentMethod: target.network === 'M-Pesa' ? 'M-Pesa' : 'e-Mola',
          receiptNumber: receiptNum,
          notes: `${c.notes || ''} | Baixa automática via aprovação de comprovativo (${target.transactionCode})`,
          updatedAt: now
        };
      }
      return c;
    }));

    addNotification({
      title: 'Pagamento Aprovado e Serviço Liberado',
      message: `Recibo ${receiptNum} emitido com sucesso para ${target.studentName}. Saldo atualizado e serviço "${target.serviceItem}" liberado.`,
      type: 'payment'
    });
    soundManager.playSuccess();
  };

  const rejectPayment = (id: string, rejectionReason: string, actorName?: string) => {
    const target = allPaymentRecords.find(p => p.id === id);
    if (!target) return;

    const operator = actorName || firebaseUser?.displayName || 'Administrador Financeiro';
    const now = new Date().toISOString();

    const rejectAuditEntry: PaymentAuditEntry = {
      id: `aud-${Date.now()}-rej`,
      timestamp: now,
      actorName: operator,
      actorRole: 'Administrador Financeiro',
      action: 'Rejeição de Pagamento',
      details: `Pagamento de ${target.serviceItem} (${target.amount.toLocaleString('pt-MZ')} MT) foi REJEITADO. Motivo formal: "${rejectionReason}".`
    };

    setAllPaymentRecords(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'REJEITADO',
          reviewedBy: operator,
          reviewedAt: now,
          rejectionReason,
          auditTrail: [rejectAuditEntry, ...(p.auditTrail || [])]
        };
      }
      return p;
    }));

    // Auditoria no aluno
    const student = allStudents.find(s => s.id === target.studentId);
    if (student) {
      const studentAudit: StudentAuditEntry = {
        id: `aud-stu-${Date.now()}`,
        timestamp: now,
        actorName: operator,
        actorRole: 'Administrador Financeiro',
        action: 'Rejeição de Comprovativo de Pagamento',
        details: `Submissão de pagamento (${target.serviceItem}, ${target.amount.toLocaleString('pt-MZ')} MT) rejeitada por inconsistência. Motivo: ${rejectionReason}`
      };
      setAllStudents(prev => prev.map(s => s.id === student.id ? { ...s, auditTrail: [studentAudit, ...(s.auditTrail || [])] } : s));
    }

    addNotification({
      title: 'Pagamento Rejeitado',
      message: `A submissão de ${target.studentName} (${target.serviceItem}) foi marcada como REJEITADA. Motivo: ${rejectionReason}`,
      type: 'payment'
    });
    soundManager.playError();
  };

  const requestPaymentCorrection = (id: string, correctionNotes: string, actorName?: string) => {
    const target = allPaymentRecords.find(p => p.id === id);
    if (!target) return;

    const operator = actorName || firebaseUser?.displayName || 'Administrador Financeiro';
    const now = new Date().toISOString();

    const correctionAuditEntry: PaymentAuditEntry = {
      id: `aud-${Date.now()}-cor`,
      timestamp: now,
      actorName: operator,
      actorRole: 'Administrador Financeiro',
      action: 'Solicitação de Correção de Pagamento',
      details: `Solicitada correção ao formando para ${target.serviceItem} (${target.amount.toLocaleString('pt-MZ')} MT). Instruções: "${correctionNotes}".`
    };

    setAllPaymentRecords(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'CORREÇÃO SOLICITADA',
          reviewedBy: operator,
          reviewedAt: now,
          correctionNotes,
          auditTrail: [correctionAuditEntry, ...(p.auditTrail || [])]
        };
      }
      return p;
    }));

    // Auditoria no aluno
    const student = allStudents.find(s => s.id === target.studentId);
    if (student) {
      const studentAudit: StudentAuditEntry = {
        id: `aud-stu-${Date.now()}`,
        timestamp: now,
        actorName: operator,
        actorRole: 'Administrador Financeiro',
        action: 'Solicitação de Correção em Comprovativo',
        details: `Solicitada retificação do comprovativo de ${target.serviceItem}. Instruções da tesouraria: ${correctionNotes}`
      };
      setAllStudents(prev => prev.map(s => s.id === student.id ? { ...s, auditTrail: [studentAudit, ...(s.auditTrail || [])] } : s));
    }

    addNotification({
      title: 'Correção de Pagamento Solicitada',
      message: `Orientação de retificação enviada para ${target.studentName}. O estado foi atualizado para CORREÇÃO SOLICITADA.`,
      type: 'payment'
    });
    soundManager.playClick();
  };

  const resubmitPayment = (id: string, updates: { transactionCode: string; amount: number; date: string; time: string; network: PaymentNetwork; proofUrl?: string; proofFileName?: string }) => {
    const now = new Date().toISOString();
    setAllPaymentRecords(prev => prev.map(p => {
      if (p.id === id) {
        const audit: PaymentAuditEntry = {
          id: `aud-${Date.now()}-resub`,
          timestamp: now,
          actorName: p.studentName,
          actorRole: 'Aluno / Formando',
          action: 'Reenvio de Pagamento com Correção',
          details: `Pagamento retificado pelo formando. Novo código: ${updates.transactionCode}, Valor: ${updates.amount} MT, Rede: ${updates.network}. Estado retornado para PENDENTE DE CONFIRMAÇÃO.`
        };
        return {
          ...p,
          ...updates,
          status: 'PENDENTE DE CONFIRMAÇÃO',
          correctionNotes: undefined,
          auditTrail: [audit, ...(p.auditTrail || [])]
        };
      }
      return p;
    }));

    addNotification({
      title: 'Pagamento Retificado e Reenviado',
      message: 'Os novos dados foram salvos. O pagamento voltou para PENDENTE DE CONFIRMAÇÃO pela tesouraria.',
      type: 'payment'
    });
    soundManager.playSuccess();
  };

  const deletePaymentRecord = (id: string) => {
    setAllPaymentRecords(prev => prev.filter(p => p.id !== id));
    addNotification({
      title: 'Registro de Pagamento Removido',
      message: 'O registro foi excluído do histórico.',
      type: 'system'
    });
  };

  const recordReceiptReprint = (id: string, operatorName?: string) => {
    const now = new Date().toISOString();
    const operator = operatorName || firebaseUser?.displayName || 'Operador da Tesouraria';
    setAllPaymentRecords(prev => prev.map(p => {
      if (p.id === id) {
        const nextCount = (p.reprintCount || 0) + 1;
        const audit: PaymentAuditEntry = {
          id: `aud-${Date.now()}-reprint`,
          timestamp: now,
          actorName: operator,
          actorRole: 'Tesouraria Escolar',
          action: 'Reimpressão de Recibo Oficial (2ª Via)',
          details: `Emissão de 2ª via do recibo oficial por ${operator}. Reimpressão #${nextCount} autorizada sem alteração de valores ou duplicação de pagamento.`
        };
        return {
          ...p,
          reprintCount: nextCount,
          lastReprintedAt: now,
          lastReprintedBy: operator,
          auditTrail: [audit, ...(p.auditTrail || [])]
        };
      }
      return p;
    }));
  };

  // Portaria & Controlo de Acesso (com Notificação WhatsApp Imediata ao Encarregado)
  const logGateAccess = (
    studentId: string, 
    type: 'entrada' | 'saida',
    customLocation?: string,
    customOperator?: string,
    sendNotification: boolean = true
  ): GateAccessLog | null => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return null;

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-MZ');
    const timeStr = now.toLocaleTimeString('pt-MZ');
    const hourOnly = now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    const fullTimestamp = `${dateStr} ${timeStr}`;

    const targetBranch = activeBranchId !== 'todas' ? activeBranchId : (student.branchId || activeInstitution.branches?.[0]?.id || 'branch-default');

    // Mensagem padronizada conforme especificação oficial do Módulo 28:
    // "O aluno [NOME] entrou na instituição às [HORA]."
    const notificationMessage = type === 'entrada'
      ? `O aluno ${student.fullName} entrou na instituição às ${hourOnly}.`
      : `O aluno ${student.fullName} saiu da instituição às ${hourOnly}.`;

    const operatorName = customOperator || firebaseUser?.displayName || (activeRole === 'superadmin' ? 'Super Administrador' : 'Portaria / Secretaria');
    const locationName = customLocation || 'Portão Principal';

    const log: GateAccessLog = {
      id: `acc-${Date.now()}`,
      institutionId: activeInstitution.id,
      institutionName: activeInstitution.name,
      branchId: targetBranch,
      location: locationName,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.fullName,
      courseName: student.courseName,
      classGroupName: student.classGroupName,
      photoUrl: student.photoUrl,
      guardianPhone: student.guardianPhone || student.emergencyContact || student.phone,
      guardianName: student.guardianName || 'Encarregado de Educação',
      date: dateStr,
      time: timeStr,
      timestamp: fullTimestamp,
      type,
      operator: operatorName,
      operatorRole: activeRole,
      whatsappStatus: sendNotification ? 'enviado' : 'pendente',
      notificationSent: sendNotification,
      notificationMessage,
      confirmed: true
    };

    setAllAccessLogs(prev => [log, ...prev]);

    saveAccessLogToFirestore(log).catch(err => console.warn('Firestore sync gate access:', err));

    // Incrementar disparos de WhatsApp na instituição se notificação estiver configurada
    if (sendNotification) {
      setAllInstitutions(prev => prev.map(inst => {
        if (inst.id === activeInstitution.id && inst.whatsAppConfig) {
          return {
            ...inst,
            whatsAppConfig: {
              ...inst.whatsAppConfig,
              dailyMessagesSent: inst.whatsAppConfig.dailyMessagesSent + 1,
              lastSync: 'Agora mesmo'
            }
          };
        }
        return inst;
      }));
    }

    addNotification({
      title: `Portaria: ${type === 'entrada' ? 'Entrada Confirmada' : 'Saída Registrada'}`,
      message: notificationMessage,
      type: 'system'
    });

    soundManager.playSuccess();
    return log;
  };

  const confirmStudentEntry = (studentId: string) => {
    return logGateAccess(studentId, 'entrada');
  };

  const updateWhatsAppConfig = (updates: Partial<WhatsAppConnection>) => {
    setAllInstitutions(prev => prev.map(inst => {
      if (inst.id === activeInstitution.id) {
        return {
          ...inst,
          whatsAppConfig: {
            ...(inst.whatsAppConfig || {
              institutionId: inst.id,
              status: 'conectado',
              instanceName: `${inst.code}_WhatsApp`,
              phoneNumber: inst.phone,
              dailyMessagesSent: 0,
              lastSync: 'Agora mesmo'
            }),
            ...updates
          }
        };
      }
      return inst;
    }));

    addNotification({
      title: 'Configurações do WhatsApp Atualizadas',
      message: 'Instância da instituição e parâmetros de envio salvos.',
      type: 'system'
    });
  };

  // 35. CAMADA DE INTEGRAÇÃO WHATSAPP & POLÍTICAS DO PROVEDOR
  const sendDirectWhatsAppMessage = (params: { 
    recipientPhone: string; 
    recipientName: string; 
    recipientType?: 'aluno' | 'encarregado' | 'professor' | 'funcionario' | 'outro'; 
    category: WhatsAppTemplateCategory; 
    message: string; 
    source?: 'manual' | 'campanha' | 'automacao' | 'portaria' | 'tesouraria'; 
    documentAttachment?: { name: string; type: string; url?: string }; 
    openDirectlyInWeb?: boolean 
  }): { success: boolean; error?: string } => {
    // 1. Verificar conexão do WhatsApp da instituição
    const isConn = whatsappConfig.isConnected ?? (whatsappConfig.status === 'conectado');
    if (!isConn) {
      const err = `A instituição "${activeInstitution.name}" não possui dispositivo WhatsApp conectado. Conecte o WhatsApp na aba Conexão.`;
      addNotification({
        title: 'Falha no Disparo WhatsApp',
        message: err,
        type: 'system'
      });
      return { success: false, error: err };
    }

    // 2. Verificar Consentimento / Opt-out
    const cleanPhone = params.recipientPhone.replace(/[^0-9+]/g, '');
    const consent = allWhatsAppConsents.find(c => 
      c.institutionId === activeInstitution.id && 
      (c.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, ''))
    );
    if (consent && !consent.optIn) {
      const err = `Envio cancelado: o número ${params.recipientPhone} solicitou opt-out e bloqueio de notificações desta instituição.`;
      const logEntry: WhatsAppMessageLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        institutionId: activeInstitution.id,
        recipientName: params.recipientName,
        recipientPhone: params.recipientPhone,
        recipientType: params.recipientType || 'aluno',
        category: params.category,
        message: params.message,
        status: 'opt_out',
        sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        source: params.source || 'manual',
        errorReason: 'Opt-out solicitado pelo destinatário'
      };
      setAllWhatsAppLogs(prev => [logEntry, ...prev]);
      return { success: false, error: err };
    }

    // 3. Verificar limite diário de mensagens (proteção contra ban)
    const currentSent = whatsappConfig.dailyMessagesSent || 0;
    const limit = whatsappConfig.dailyLimit || 500;
    if (currentSent >= limit) {
      const err = `Limite seguro diário atingido (${currentSent}/${limit} mensagens enviadas hoje). Para evitar bloqueio do provedor, aguarde o próximo dia.`;
      addNotification({
        title: 'Limite Diário do WhatsApp Atingido',
        message: err,
        type: 'system'
      });
      return { success: false, error: err };
    }

    // 4. Montar mensagem final com rodapé de opt-out (se configurado)
    let finalMessage = params.message;
    if (whatsappConfig.appendOptOutNotice && whatsappConfig.optOutText) {
      finalMessage = `${finalMessage}\n\n_${whatsappConfig.optOutText}_`;
    }

    // 5. Registrar Log de Sucesso
    const newLog: WhatsAppMessageLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      institutionId: activeInstitution.id,
      recipientName: params.recipientName,
      recipientPhone: params.recipientPhone,
      recipientType: params.recipientType || 'aluno',
      category: params.category,
      message: finalMessage,
      status: 'enviado',
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      source: params.source || 'manual',
      documentAttachment: params.documentAttachment
    };
    setAllWhatsAppLogs(prev => [newLog, ...prev]);

    // 6. Atualizar contador diário da instituição
    updateWhatsAppConfig({
      dailyMessagesSent: currentSent + 1,
      lastSync: 'Hoje às ' + new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
    });

    // 7. Se solicitado abrir no Web/App
    if (params.openDirectlyInWeb) {
      openWhatsAppMessage(params.recipientPhone, finalMessage);
    }

    try {
      soundManager?.playSuccess?.();
    } catch {
      // ignore
    }
    return { success: true };
  };

  const createWhatsAppTemplate = (template: Omit<WhatsAppMessageTemplate, 'id' | 'updatedAt' | 'institutionId'>) => {
    const newTmpl: WhatsAppMessageTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      institutionId: activeInstitution.id,
      updatedAt: new Date().toISOString().substring(0, 10)
    };
    setAllWhatsAppTemplates(prev => [...prev, newTmpl]);
    addNotification({
      title: 'Template WhatsApp Salvo',
      message: `O modelo "${template.name}" foi registrado com sucesso.`,
      type: 'system'
    });
  };

  const updateWhatsAppTemplate = (id: string, updates: Partial<WhatsAppMessageTemplate>) => {
    setAllWhatsAppTemplates(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString().substring(0, 10)
        };
      }
      return t;
    }));
  };

  const deleteWhatsAppTemplate = (id: string) => {
    setAllWhatsAppTemplates(prev => prev.filter(t => t.id !== id));
    addNotification({
      title: 'Template Removido',
      message: 'O modelo de mensagem foi excluído.',
      type: 'system'
    });
  };

  const createWhatsAppCampaign = (campaign: Omit<WhatsAppCampaign, 'id' | 'createdAt' | 'sentCount' | 'failedCount' | 'status' | 'institutionId'>) => {
    const newCamp: WhatsAppCampaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      institutionId: activeInstitution.id,
      sentCount: 0,
      failedCount: 0,
      status: 'rascunho',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAllWhatsAppCampaigns(prev => [newCamp, ...prev]);
    addNotification({
      title: 'Campanha Criada',
      message: `Campanha "${campaign.title}" salva como rascunho.`,
      type: 'system'
    });
  };

  const executeWhatsAppCampaign = async (campaignId: string): Promise<{ sent: number; failed: number }> => {
    const campaign = allWhatsAppCampaigns.find(c => c.id === campaignId);
    if (!campaign) return { sent: 0, failed: 0 };

    setAllWhatsAppCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'enviando' } : c));

    // Filtrar destinatários conforme o público-alvo
    let targets: { name: string; phone: string; type: 'aluno' | 'encarregado' | 'professor' | 'funcionario' | 'outro' }[] = [];
    if (campaign.targetAudience === 'inadimplentes') {
      targets = students.filter(s => s.paymentStatus === 'Atrasado' || s.paymentStatus === 'Pendente').map(s => ({
        name: s.fullName,
        phone: s.guardianPhone || s.phone,
        type: 'aluno'
      }));
    } else if (campaign.targetAudience === 'aniversariantes') {
      targets = students.slice(0, 5).map(s => ({
        name: s.fullName,
        phone: s.phone,
        type: 'aluno'
      }));
    } else if (campaign.targetAudience === 'professores') {
      targets = teachers.map(t => ({
        name: t.fullName,
        phone: t.phone,
        type: 'professor'
      }));
    } else {
      targets = students.map(s => ({
        name: s.fullName,
        phone: s.phone,
        type: 'aluno'
      }));
    }

    let sent = 0;
    let failed = 0;

    for (const target of targets) {
      const vars = {
        nome: target.name,
        instituicao: activeInstitution.name,
        valor: '4.500 MT',
        mes: 'Setembro/2026',
        telefone_instituicao: activeInstitution.phone,
        chave_pagamento: activeInstitution.phone
      };
      const text = interpolateWhatsAppVariables(campaign.messageText, vars);
      const res = sendDirectWhatsAppMessage({
        recipientName: target.name,
        recipientPhone: target.phone,
        recipientType: target.type,
        category: campaign.category,
        message: text,
        source: 'campanha'
      });
      if (res.success) {
        sent++;
      } else {
        failed++;
      }
    }

    setAllWhatsAppCampaigns(prev => prev.map(c => c.id === campaignId ? {
      ...c,
      status: 'concluido',
      totalRecipients: targets.length,
      sentCount: sent,
      failedCount: failed,
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : c));

    addNotification({
      title: 'Campanha Concluída',
      message: `Campanha "${campaign.title}": ${sent} enviadas, ${failed} falhas/bloqueios.`,
      type: 'system'
    });

    return { sent, failed };
  };

  const createWhatsAppAutomation = (rule: Omit<WhatsAppAutomationRule, 'id' | 'institutionId' | 'totalTriggeredCount'>) => {
    const newRule: WhatsAppAutomationRule = {
      ...rule,
      id: `auto-${Date.now()}`,
      institutionId: activeInstitution.id,
      totalTriggeredCount: 0
    };
    setAllWhatsAppAutomations(prev => [...prev, newRule]);
    addNotification({
      title: 'Automação Registrada',
      message: `A regra "${rule.title}" foi configurada com sucesso.`,
      type: 'system'
    });
  };

  const toggleWhatsAppAutomation = (id: string, enabled: boolean) => {
    setAllWhatsAppAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled } : a));
  };

  const runWhatsAppAutomationNow = async (ruleId: string): Promise<{ triggeredCount: number }> => {
    const rule = allWhatsAppAutomations.find(r => r.id === ruleId);
    if (!rule) return { triggeredCount: 0 };

    let count = 0;
    if (rule.triggerType === 'aniversario_dia') {
      const bdays = students.slice(0, 3);
      for (const s of bdays) {
        const text = interpolateWhatsAppVariables(
          rule.customMessage || 'Feliz aniversário, {{nome}}! A {{instituicao}} deseja-lhe um excelente dia.',
          { nome: s.fullName, instituicao: activeInstitution.name }
        );
        sendDirectWhatsAppMessage({
          recipientName: s.fullName,
          recipientPhone: s.phone,
          category: 'aniversario',
          message: text,
          source: 'automacao'
        });
        count++;
      }
    } else if (rule.triggerType === 'cobranca_vencido' || rule.triggerType === 'cobranca_vencendo' || rule.triggerType === 'cobranca_preventiva') {
      const late = students.filter(s => s.paymentStatus === 'Atrasado');
      for (const s of late) {
        const text = interpolateWhatsAppVariables(
          rule.customMessage || 'Olá {{nome}}, informamos que existe uma mensalidade pendente no valor de {{valor}}.',
          { nome: s.fullName, valor: '4.500 MT', instituicao: activeInstitution.name }
        );
        sendDirectWhatsAppMessage({
          recipientName: s.fullName,
          recipientPhone: s.guardianPhone || s.phone,
          category: 'cobranca',
          message: text,
          source: 'automacao'
        });
        count++;
      }
    } else {
      count = 2; // Simula disparo para outros gatilhos elegíveis
    }

    setAllWhatsAppAutomations(prev => prev.map(r => r.id === ruleId ? {
      ...r,
      totalTriggeredCount: r.totalTriggeredCount + count,
      lastExecutedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : r));

    addNotification({
      title: 'Automação Executada',
      message: `Regra "${rule.title}" acionou ${count} disparos automáticos.`,
      type: 'system'
    });

    return { triggeredCount: count };
  };

  const updateWhatsAppConsent = (phone: string, name: string, optIn: boolean, reason?: string) => {
    setAllWhatsAppConsents(prev => {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const filtered = prev.filter(c => c.phone !== cleanPhone);
      return [
        ...filtered,
        {
          id: `cst-${Date.now()}`,
          institutionId: activeInstitution.id,
          phone: cleanPhone,
          name,
          optIn,
          updatedAt: new Date().toISOString().substring(0, 10),
          reason
        }
      ];
    });
    addNotification({
      title: 'Consentimento Atualizado',
      message: `Número ${phone} definido como ${optIn ? 'Autorizado (Opt-in)' : 'Bloqueado (Opt-out)'}.`,
      type: 'system'
    });
  };

  const simulateWhatsAppPairing = async (method: 'qr' | 'code', phoneNumber?: string): Promise<{ success: boolean; pairingCode?: string }> => {
    if (method === 'code') {
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 8; i++) {
        if (i === 4) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      updateWhatsAppConfig({
        status: 'pareando_codigo',
        pairingCode: code,
        phoneNumber: phoneNumber || activeInstitution.phone
      });
      return { success: true, pairingCode: code };
    }

    // QR Code simulation
    updateWhatsAppConfig({
      status: 'aguardando_qr'
    });
    return { success: true };
  };

  const disconnectWhatsAppDevice = () => {
    updateWhatsAppConfig({
      status: 'desconectado',
      isConnected: false,
      pairingCode: undefined
    });
    addNotification({
      title: 'Sessão WhatsApp Encerrada',
      message: `A instância de ${activeInstitution.name} foi desconectada com segurança.`,
      type: 'system'
    });
  };

  const updateFinancialSettings = (settings: Partial<FinancialSettings>) => {
    updateInstitutionFinancialSettings(settings);
  };

  // ==========================================================
  // 21. MÓDULO DE CONTRATOS & TERMOS OFICIAIS
  // ==========================================================
  const saveContractTemplate = (template: ContractTemplate) => {
    setContractTemplates(prev => {
      const exists = prev.some(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? template : t);
      }
      return [template, ...prev];
    });

    addNotification({
      title: `Modelo de Contrato Atualizado`,
      message: `"${template.name}" foi salvo na versão ${template.version}.`,
      type: 'system'
    });
  };

  const createContractTemplate = (templateData: Omit<ContractTemplate, 'id' | 'versionHistory' | 'updatedAt'>): string => {
    const id = `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowStr = new Date().toISOString().split('T')[0];
    const initialVersion = templateData.version || 'v1.0';

    const newTemplate: ContractTemplate = {
      ...templateData,
      id,
      institutionId: templateData.institutionId || activeInstitution.id,
      version: initialVersion,
      updatedAt: nowStr,
      createdAt: nowStr,
      author: templateData.author || firebaseUser?.displayName || 'Gabinete Jurídico',
      isDefault: templateData.isDefault || false,
      versionHistory: [
        {
          version: initialVersion,
          title: templateData.title,
          content: templateData.content,
          savedAt: nowStr,
          savedBy: firebaseUser?.displayName || 'Direção Geral',
          changeNotes: 'Criação inicial do modelo de documento oficial.'
        }
      ]
    };

    setContractTemplates(prev => [newTemplate, ...prev]);

    addNotification({
      title: 'Novo Modelo Criado',
      message: `O modelo "${newTemplate.name}" (${initialVersion}) foi registrado no repositório oficial.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return id;
  };

  const updateContractTemplateWithVersion = (
    templateId: string, 
    updates: Partial<ContractTemplate>, 
    changeNotes?: string, 
    newVersion?: string
  ) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const author = firebaseUser?.displayName || 'Secretaria Acadêmica';

    setContractTemplates(prev => prev.map(tpl => {
      if (tpl.id !== templateId) return tpl;

      // REGRA: "Não apagar versões anteriores" -> salvar snapshot atual no histórico
      const previousVersionSnapshot: ContractTemplateVersion = {
        version: tpl.version,
        title: tpl.title,
        content: tpl.content,
        savedAt: tpl.updatedAt || nowStr,
        savedBy: tpl.author || author,
        changeNotes: changeNotes || 'Atualização de cláusulas do documento.'
      };

      // Calcular número da nova versão se não informado
      let calculatedVersion = newVersion;
      if (!calculatedVersion) {
        const vMatch = tpl.version.match(/v?(\d+)(\.(\d+))?/);
        if (vMatch) {
          const major = parseInt(vMatch[1] || '1', 10);
          const minor = parseInt(vMatch[3] || '0', 10) + 1;
          calculatedVersion = `v${major}.${minor}`;
        } else {
          calculatedVersion = `${tpl.version}.1`;
        }
      }

      // Preservar todas as versões anteriores sem apagar nenhuma
      const existingHistory = tpl.versionHistory || [];
      const updatedHistory = [previousVersionSnapshot, ...existingHistory];

      return {
        ...tpl,
        ...updates,
        version: calculatedVersion,
        updatedAt: nowStr,
        author,
        versionHistory: updatedHistory
      };
    }));

    addNotification({
      title: 'Modelo Atualizado com Nova Versão',
      message: `Versão anterior preservada no histórico. Nova versão registrada com sucesso.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const restoreContractTemplateVersion = (templateId: string, targetVersion: string) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const author = firebaseUser?.displayName || 'Administrador';

    setContractTemplates(prev => prev.map(tpl => {
      if (tpl.id !== templateId) return tpl;

      const foundVersion = tpl.versionHistory?.find(v => v.version === targetVersion);
      if (!foundVersion) return tpl;

      // Salva a versão atual antes de reverter, garantindo que nada é perdido
      const currentSnapshot: ContractTemplateVersion = {
        version: tpl.version,
        title: tpl.title,
        content: tpl.content,
        savedAt: tpl.updatedAt || nowStr,
        savedBy: tpl.author || author,
        changeNotes: `Snapshot antes de restaurar a versão ${targetVersion}`
      };

      const restoredVersionNumber = `${targetVersion}-restaurado`;

      return {
        ...tpl,
        title: foundVersion.title,
        content: foundVersion.content,
        version: restoredVersionNumber,
        updatedAt: nowStr,
        author,
        versionHistory: [currentSnapshot, ...(tpl.versionHistory || [])]
      };
    }));

    addNotification({
      title: 'Versão Anterior Restaurada',
      message: `O conteúdo da versão ${targetVersion} foi recuperado. Nenhuma versão anterior foi excluída.`,
      type: 'system'
    });
    soundManager.playClick();
  };

  const generateContractWithVariables = (params: {
    templateId: string;
    studentId: string;
    customVariables?: Record<string, string | number>;
    notes?: string;
    autoSignStudent?: boolean;
    autoSignDirector?: boolean;
  }): GeneratedContract => {
    const student = allStudents.find(s => s.id === params.studentId);
    const template = contractTemplates.find(t => t.id === params.templateId) || contractTemplates[0];

    const targetCourse = allCourses.find(c => c.id === student?.courseId || c.name === student?.courseName);
    const targetClass = allClasses.find(cl => cl.id === student?.classGroupId);

    // Valores padrão das 8 Variáveis Requeridas:
    // {{nome_aluno}}, {{curso}}, {{turma}}, {{valor}}, {{data}}, {{duracao}}, {{instituicao}}, {{diretor}}
    const varNomeAluno = student?.fullName || 'Nome do Formando';
    const varCurso = student?.courseName || targetCourse?.name || 'Curso Técnico Profissional';
    const varTurma = student?.classGroupName || targetClass?.name || 'Turma Regular';
    const rawVal = params.customVariables?.valor !== undefined 
      ? Number(params.customVariables.valor) 
      : (targetCourse?.monthlyFee || targetCourse?.feeMonthly || targetCourse?.price || 4500);
    const varValor = typeof rawVal === 'number' ? rawVal.toLocaleString('pt-MZ') : String(rawVal);
    const varData = (params.customVariables?.data as string) || new Date().toLocaleDateString('pt-MZ');
    const varDuracao = (params.customVariables?.duracao as string) || targetCourse?.duration || '12 Meses (1200 Horas)';
    const varInstituicao = (params.customVariables?.instituicao as string) || activeInstitution.name;
    const varDiretor = (params.customVariables?.diretor as string) || 'Eng. Paulo Jafim';

    // Variáveis complementares
    const varBi = student?.documentNumber ? `${student.documentType || 'BI'} nº ${student.documentNumber}` : 'Documento em tramitação';
    const varTelefone = student?.phone || '+258 84 000 0000';
    const varEmail = student?.email || 'aluno@cftpm.mz';
    const varEndereco = student?.address || 'Maputo Cidade';
    const varCodigoAluno = student?.code || `MTW-AL-${Date.now().toString().slice(-4)}`;
    const varRegime = student?.regime || 'Laboral';

    let content = template.content;

    // Substituição das 8 variáveis requeridas
    content = content
      .replace(/{{nome_aluno}}/g, varNomeAluno)
      .replace(/{{curso}}/g, varCurso)
      .replace(/{{turma}}/g, varTurma)
      .replace(/{{valor}}/g, varValor)
      .replace(/{{data}}/g, varData)
      .replace(/{{duracao}}/g, varDuracao)
      .replace(/{{instituicao}}/g, varInstituicao)
      .replace(/{{diretor}}/g, varDiretor)
      // Substituições de suporte e compatibilidade
      .replace(/{{bi}}/g, varBi)
      .replace(/{{codigo_aluno}}/g, varCodigoAluno)
      .replace(/{{telefone}}/g, varTelefone)
      .replace(/{{email}}/g, varEmail)
      .replace(/{{endereco}}/g, varEndereco)
      .replace(/{{regime}}/g, varRegime)
      .replace(/{{valor_mensalidade}}/g, varValor)
      .replace(/{{data_atual}}/g, varData)
      .replace(/{{nuit_instituicao}}/g, activeInstitution.nuit || '400123456')
      .replace(/{{endereco_instituicao}}/g, activeInstitution.address || 'Maputo, Moçambique');

    // Injeção de variáveis personalizadas adicionais se fornecidas
    if (params.customVariables) {
      Object.entries(params.customVariables).forEach(([key, val]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, String(val));
      });
    }

    const prefix = activeInstitution.prefixes?.contractPrefix || `${activeInstitution.code || 'CFTPM'}-CTR`;
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const refNumber = `${prefix}-2026-${randNum}`;
    const nowIso = new Date().toISOString().split('T')[0];
    const nowDateTime = new Date().toLocaleString('pt-MZ');

    const autoSignStudent = params.autoSignStudent ?? true;
    const autoSignDirector = params.autoSignDirector ?? true;

    const newContract: GeneratedContract = {
      id: `cnt-${Date.now()}`,
      institutionId: activeInstitution.id,
      branchId: activeBranchId !== 'todas' ? activeBranchId : student?.branchId,
      templateId: template.id,
      templateName: template.name,
      templateVersion: template.version,
      studentId: params.studentId,
      studentName: varNomeAluno,
      studentCode: varCodigoAluno,
      studentDocumentNumber: student?.documentNumber,
      courseId: student?.courseId,
      courseName: varCurso,
      classGroupId: student?.classGroupId,
      classGroupName: varTurma,
      value: typeof rawVal === 'number' ? rawVal : 4500,
      valueFormatted: `${varValor} MT`,
      duration: varDuracao,
      date: varData,
      institutionName: varInstituicao,
      directorName: varDiretor,
      referenceNumber: refNumber,
      content,
      status: 'ativo',
      statusHistory: [
        {
          id: `csh-${Date.now()}`,
          status: 'ativo',
          changedAt: nowDateTime,
          changedBy: firebaseUser?.displayName || 'Secretaria Acadêmica',
          reason: 'Contrato gerado automaticamente e emitido com sucesso.'
        }
      ],
      signedByStudent: autoSignStudent,
      signedByDirector: autoSignDirector,
      signatures: {
        student: {
          signed: autoSignStudent,
          signerName: varNomeAluno,
          signedAt: autoSignStudent ? nowDateTime : undefined,
          documentNumber: student?.documentNumber,
          role: 'Formando'
        },
        director: {
          signed: autoSignDirector,
          signerName: varDiretor,
          signedAt: autoSignDirector ? nowDateTime : undefined,
          role: 'Diretor Geral',
          hasStamp: true
        }
      },
      generatedDate: nowIso,
      createdAt: nowIso,
      notes: params.notes
    };

    setGeneratedContracts(prev => [newContract, ...prev]);

    addNotification({
      title: `Contrato Gerado: #${refNumber}`,
      message: `Documento compilado para ${varNomeAluno} (${varCurso}). Status: ATIVO.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return newContract;
  };

  const generateContractForStudent = (studentId: string, templateId: string): GeneratedContract => {
    return generateContractWithVariables({ templateId, studentId });
  };

  const updateContractStatus = (contractId: string, newStatus: ContractStatus, reason?: string) => {
    const nowDateTime = new Date().toLocaleString('pt-MZ');
    const author = firebaseUser?.displayName || 'Secretaria Geral';

    setGeneratedContracts(prev => prev.map(cnt => {
      if (cnt.id !== contractId) return cnt;

      const newHistoryEntry: ContractStatusHistoryEntry = {
        id: `csh-${Date.now()}`,
        status: newStatus,
        changedAt: nowDateTime,
        changedBy: author,
        reason: reason || `Status do contrato alterado para ${newStatus.toUpperCase()}.`
      };

      return {
        ...cnt,
        status: newStatus,
        statusHistory: [newHistoryEntry, ...(cnt.statusHistory || [])],
        updatedAt: nowDateTime,
        cancellationReason: newStatus === 'cancelado' ? reason : cnt.cancellationReason,
        closureReason: newStatus === 'encerrado' ? reason : cnt.closureReason
      };
    }));

    addNotification({
      title: `Estado do Contrato Alterado`,
      message: `Contrato atualizado para "${newStatus.toUpperCase()}". Motivo registrado no histórico.`,
      type: 'system'
    });
    soundManager.playClick();
  };

  const renewContract = (
    contractId: string, 
    newDuration?: string, 
    newValue?: number, 
    notes?: string
  ): GeneratedContract | null => {
    const existing = generatedContracts.find(c => c.id === contractId);
    if (!existing) return null;

    const nowIso = new Date().toISOString().split('T')[0];
    const nowDateTime = new Date().toLocaleString('pt-MZ');
    const author = firebaseUser?.displayName || 'Secretaria Acadêmica';

    // 1. Marca contrato anterior como 'renovado'
    const newContractId = `cnt-${Date.now()}`;
    const newRefNumber = `${existing.referenceNumber}-REN`;

    setGeneratedContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          status: 'renovado' as ContractStatus,
          renewedByContractId: newContractId,
          statusHistory: [
            {
              id: `csh-${Date.now()}-ren`,
              status: 'renovado' as ContractStatus,
              changedAt: nowDateTime,
              changedBy: author,
              reason: `Contrato original renovado através do novo termo #${newRefNumber}. ${notes || ''}`
            },
            ...(c.statusHistory || [])
          ]
        };
      }
      return c;
    }));

    // 2. Gera novo contrato com status 'ativo' vinculado ao anterior
    const duration = newDuration || existing.duration;
    const value = newValue !== undefined ? newValue : existing.value;

    const renewedContract: GeneratedContract = {
      ...existing,
      id: newContractId,
      referenceNumber: newRefNumber,
      status: 'ativo',
      duration,
      value,
      valueFormatted: `${value.toLocaleString('pt-MZ')} MT`,
      renewalOfContractId: existing.id,
      generatedDate: nowIso,
      createdAt: nowIso,
      notes: notes || `Renovação de ciclo do contrato original #${existing.referenceNumber}`,
      statusHistory: [
        {
          id: `csh-${Date.now()}-new`,
          status: 'ativo',
          changedAt: nowDateTime,
          changedBy: author,
          reason: `Contrato ativo gerado por renovação do contrato #${existing.referenceNumber}.`
        }
      ],
      signatures: {
        student: { ...existing.signatures.student, signed: true, signedAt: nowDateTime },
        director: { ...existing.signatures.director, signed: true, signedAt: nowDateTime }
      }
    };

    setGeneratedContracts(prev => [renewedContract, ...prev]);

    addNotification({
      title: 'Contrato Renovado com Sucesso',
      message: `Novo contrato ativo #${newRefNumber} criado em continuidade ao #${existing.referenceNumber}.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return renewedContract;
  };

  const signContract = (
    contractId: string, 
    party: 'student' | 'director', 
    details: { signerName: string; signatureDataUrl?: string; documentNumber?: string }
  ) => {
    const nowDateTime = new Date().toLocaleString('pt-MZ');

    setGeneratedContracts(prev => prev.map(cnt => {
      if (cnt.id !== contractId) return cnt;

      const currentSignatures = cnt.signatures || {
        student: { signed: false, signerName: cnt.studentName },
        director: { signed: false, signerName: cnt.directorName }
      };

      if (party === 'student') {
        const nextSignedStudent = {
          signed: true,
          signerName: details.signerName || cnt.studentName,
          signedAt: nowDateTime,
          signatureDataUrl: details.signatureDataUrl,
          documentNumber: details.documentNumber || cnt.studentDocumentNumber,
          role: 'Formando'
        };
        return {
          ...cnt,
          signedByStudent: true,
          signatures: {
            ...currentSignatures,
            student: nextSignedStudent
          }
        };
      } else {
        const nextSignedDirector = {
          signed: true,
          signerName: details.signerName || cnt.directorName,
          signedAt: nowDateTime,
          signatureDataUrl: details.signatureDataUrl,
          role: 'Diretor Geral',
          hasStamp: true
        };
        return {
          ...cnt,
          signedByDirector: true,
          signatures: {
            ...currentSignatures,
            director: nextSignedDirector
          }
        };
      }
    }));

    addNotification({
      title: 'Assinatura Registada',
      message: `Assinatura de ${party === 'student' ? 'Formando' : 'Diretor Geral'} gravada digitalmente com autenticação.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  // ==========================================================
  // 22. DOCUMENT STUDIO - GESTÃO DE MODELOS GRÁFICOS
  // ==========================================================
  const saveStudioTemplate = (template: StudioTemplate) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const updated: StudioTemplate = {
      ...template,
      updatedAt: nowStr
    };

    setAllStudioTemplates(prev => {
      const exists = prev.some(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? updated : t);
      }
      return [updated, ...prev];
    });

    addNotification({
      title: 'Modelo Gráfico Salvo',
      message: `"${template.name}" foi salvo com sucesso.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const createStudioTemplate = (templateData: Partial<StudioTemplate>): StudioTemplate => {
    const id = `tpl-studio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowStr = new Date().toISOString().split('T')[0];
    const initialVersion = templateData.version || 'v1.0';

    const defaultBg: DocumentBackground = {
      color: '#FFFFFF',
      pattern: 'guilloche',
      borderColor: '#B45309',
      borderWidth: 6,
      borderStyle: 'ornamental_cantos',
      watermarkText: activeInstitution.name,
      watermarkOpacity: 0.05,
      cornerOrnaments: true
    };

    const bgFrente = templateData.backgroundFrente || defaultBg;
    const bgVerso = templateData.backgroundVerso || defaultBg;
    const format = templateData.format || 'A4_Horizontal';
    const frenteElements = templateData.frenteElements || [];
    const versoElements = templateData.versoElements || [];

    const newTemplate: StudioTemplate = {
      id,
      institutionId: templateData.institutionId || activeInstitution.id,
      name: templateData.name || 'Novo Modelo de Documento',
      category: templateData.category || 'certificado',
      format,
      description: templateData.description || 'Modelo gráfico criado no Document Studio.',
      hasBackSide: templateData.hasBackSide || false,
      isActive: true,
      version: initialVersion,
      createdAt: nowStr,
      updatedAt: nowStr,
      author: firebaseUser?.displayName || 'Secretaria Acadêmica',
      backgroundFrente: bgFrente,
      backgroundVerso: bgVerso,
      frenteElements,
      versoElements,
      versionHistory: [
        {
          version: initialVersion,
          savedAt: nowStr,
          savedBy: firebaseUser?.displayName || 'Secretaria Acadêmica',
          changeNotes: 'Criação inicial do modelo gráfico no Document Studio.',
          format,
          frenteElements,
          versoElements,
          backgroundFrente: bgFrente,
          backgroundVerso: bgVerso
        }
      ]
    };

    setAllStudioTemplates(prev => [newTemplate, ...prev]);

    addNotification({
      title: 'Novo Modelo Criado',
      message: `O modelo "${newTemplate.name}" foi registrado com sucesso.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return newTemplate;
  };

  const duplicateStudioTemplate = (templateId: string): StudioTemplate => {
    const source = allStudioTemplates.find(t => t.id === templateId);
    if (!source) {
      throw new Error(`Template ${templateId} not found`);
    }

    const id = `tpl-studio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowStr = new Date().toISOString().split('T')[0];

    const cloned: StudioTemplate = {
      ...source,
      id,
      name: `${source.name} (Cópia)`,
      version: 'v1.0',
      createdAt: nowStr,
      updatedAt: nowStr,
      versionHistory: [
        {
          version: 'v1.0',
          savedAt: nowStr,
          savedBy: firebaseUser?.displayName || 'Secretaria Acadêmica',
          changeNotes: `Duplicado a partir de ${source.name} (${source.version})`,
          format: source.format,
          frenteElements: JSON.parse(JSON.stringify(source.frenteElements || [])),
          versoElements: JSON.parse(JSON.stringify(source.versoElements || [])),
          backgroundFrente: JSON.parse(JSON.stringify(source.backgroundFrente)),
          backgroundVerso: JSON.parse(JSON.stringify(source.backgroundVerso))
        }
      ],
      frenteElements: JSON.parse(JSON.stringify(source.frenteElements || [])),
      versoElements: JSON.parse(JSON.stringify(source.versoElements || [])),
      backgroundFrente: JSON.parse(JSON.stringify(source.backgroundFrente)),
      backgroundVerso: JSON.parse(JSON.stringify(source.backgroundVerso))
    };

    setAllStudioTemplates(prev => [cloned, ...prev]);

    addNotification({
      title: 'Modelo Duplicado',
      message: `"${cloned.name}" foi duplicado e já está disponível para personalização.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return cloned;
  };

  const toggleActiveStudioTemplate = (templateId: string) => {
    setAllStudioTemplates(prev => prev.map(t => {
      if (t.id === templateId) {
        const nextActive = !t.isActive;
        addNotification({
          title: nextActive ? 'Modelo Ativado' : 'Modelo Desativado',
          message: `O modelo "${t.name}" foi ${nextActive ? 'ativado' : 'desativado'} para emissões.`,
          type: 'system'
        });
        return { ...t, isActive: nextActive };
      }
      return t;
    }));
    soundManager.playClick();
  };

  const deleteStudioTemplate = (templateId: string) => {
    setAllStudioTemplates(prev => prev.filter(t => t.id !== templateId));
    addNotification({
      title: 'Modelo Removido',
      message: 'O modelo de documento foi excluído com sucesso.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const restoreStudioTemplateVersion = (templateId: string, versionNumber: string) => {
    const target = allStudioTemplates.find(t => t.id === templateId);
    if (!target) return;

    const historical = target.versionHistory?.find(v => v.version === versionNumber);
    if (!historical) {
      addNotification({
        title: 'Versão não Encontrada',
        message: `Não foi possível encontrar o snapshot ${versionNumber}.`,
        type: 'system'
      });
      return;
    }

    // Regra: "Não apagar versões anteriores" - salva o estado atual antes de restaurar
    const nowStr = new Date().toISOString().split('T')[0];
    const currentSnapshot: StudioTemplateVersion = {
      version: target.version,
      savedAt: nowStr,
      savedBy: firebaseUser?.displayName || 'Secretaria Acadêmica',
      changeNotes: `Snapshot de segurança gravado antes da restauração da ${versionNumber}.`,
      format: target.format,
      frenteElements: target.frenteElements,
      versoElements: target.versoElements,
      backgroundFrente: target.backgroundFrente,
      backgroundVerso: target.backgroundVerso
    };

    setAllStudioTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;

      return {
        ...t,
        version: `${versionNumber}-restaurada`,
        updatedAt: nowStr,
        format: historical.format || t.format,
        frenteElements: JSON.parse(JSON.stringify(historical.frenteElements || [])),
        versoElements: JSON.parse(JSON.stringify(historical.versoElements || [])),
        backgroundFrente: historical.backgroundFrente ? JSON.parse(JSON.stringify(historical.backgroundFrente)) : t.backgroundFrente,
        backgroundVerso: historical.backgroundVerso ? JSON.parse(JSON.stringify(historical.backgroundVerso)) : t.backgroundVerso,
        versionHistory: [currentSnapshot, ...(t.versionHistory || [])]
      };
    }));

    addNotification({
      title: 'Versão Restaurada',
      message: `O modelo "${target.name}" foi restaurado para a versão ${versionNumber}. O histórico foi integralmente preservado.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const createStudioTemplateVersion = (templateId: string, versionNumber: string, notes: string) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const author = firebaseUser?.displayName || 'Secretaria Acadêmica';

    setAllStudioTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;

      const anteriorSnapshot = {
        version: t.version,
        name: t.name,
        format: t.format,
        elementsCount: (t.frenteElements?.length || 0) + (t.versoElements?.length || 0),
        frenteElements: JSON.parse(JSON.stringify(t.frenteElements || [])),
        versoElements: JSON.parse(JSON.stringify(t.versoElements || [])),
        backgroundFrente: JSON.parse(JSON.stringify(t.backgroundFrente)),
        backgroundVerso: JSON.parse(JSON.stringify(t.backgroundVerso))
      };

      const atualSnapshot = {
        version: versionNumber,
        name: t.name,
        format: t.format,
        elementsCount: (t.frenteElements?.length || 0) + (t.versoElements?.length || 0),
        frenteElements: JSON.parse(JSON.stringify(t.frenteElements || [])),
        versoElements: JSON.parse(JSON.stringify(t.versoElements || [])),
        backgroundFrente: JSON.parse(JSON.stringify(t.backgroundFrente)),
        backgroundVerso: JSON.parse(JSON.stringify(t.backgroundVerso))
      };

      const newSnapshot: StudioTemplateVersion = {
        version: versionNumber,
        savedAt: nowStr,
        savedBy: author,
        changeNotes: notes,
        format: t.format,
        frenteElements: JSON.parse(JSON.stringify(t.frenteElements || [])),
        versoElements: JSON.parse(JSON.stringify(t.versoElements || [])),
        backgroundFrente: JSON.parse(JSON.stringify(t.backgroundFrente)),
        backgroundVerso: JSON.parse(JSON.stringify(t.backgroundVerso)),
        documentoAnterior: anteriorSnapshot,
        documentoAtual: atualSnapshot
      };

      return {
        ...t,
        version: versionNumber,
        updatedAt: nowStr,
        versionHistory: [newSnapshot, ...(t.versionHistory || [])]
      };
    }));

    addNotification({
      title: 'Nova Versão Registrada',
      message: `A versão ${versionNumber} foi gravada na linha do tempo do modelo.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  // ==========================================
  // 23. SISTEMA DE ASSINATURAS DIGITAIS & SEGURANÇA
  // ==========================================

  const signDocumentSignature = (
    signatureId: string, 
    signatureDataUrl?: string, 
    customSignerName?: string
  ): { success: boolean; message: string } => {
    const target = allSystemSignatures.find(s => s.id === signatureId);
    if (!target) {
      return { success: false, message: 'Assinatura não encontrada no sistema.' };
    }

    // 1. Rigorous Authorization check:
    const currentUserContext = {
      id: firebaseUser?.uid,
      email: firebaseUser?.email || undefined,
      name: firebaseUser?.displayName || (activeRole === 'superadmin' ? 'Super Administrador' : 'Diretor(a)'),
      role: activeRole
    };

    const authCheck = checkUserSignatureAuthorization(target, currentUserContext);

    if (!authCheck.authorized) {
      const blockedMsg = authCheck.reason || 'Você não tem autorização para assinar ou alterar este documento por outro utilizador.';
      
      // Registrar tentativa não autorizada na trilha de auditoria para segurança jurídica
      const auditLog: SignatureAuditEntry = {
        id: `aud-block-${Date.now()}`,
        action: 'tentativa_nao_autorizada',
        timestamp: new Date().toLocaleString('pt-MZ'),
        actorId: currentUserContext.id || 'anon',
        actorName: currentUserContext.name,
        actorEmail: currentUserContext.email,
        actorRole: currentUserContext.role,
        details: `Tentativa não autorizada bloqueada: ${currentUserContext.name} (${currentUserContext.role}) tentou assinar o documento "${target.document.title}" atribuído a ${target.signerName} (${target.signerTitle}).`,
        wasBlocked: true
      };

      setAllSystemSignatures(prev => prev.map(s => {
        if (s.id === signatureId) {
          return {
            ...s,
            auditTrail: [auditLog, ...(s.auditTrail || [])]
          };
        }
        return s;
      }));

      addNotification({
        title: 'Bloqueio de Segurança: Acesso Negado',
        message: blockedMsg,
        type: 'system'
      });
      soundManager.playError();
      return { success: false, message: blockedMsg };
    }

    // 2. Assinatura autorizada:
    const nowStr = new Date().toLocaleString('pt-MZ');
    const actualSignerName = customSignerName || target.signerName;
    const seal = generateDigitalSeal(target.role, activeInstitution.code);
    const hash = generateVerificationHash(target.document.documentId, actualSignerName, target.role, nowStr);

    const successAudit: SignatureAuditEntry = {
      id: `aud-sign-${Date.now()}`,
      action: 'assinada',
      timestamp: nowStr,
      actorId: currentUserContext.id || 'local-actor',
      actorName: currentUserContext.name,
      actorEmail: currentUserContext.email,
      actorRole: currentUserContext.role,
      details: `Documento assinado com sucesso por ${actualSignerName} (${target.signerTitle}). Selo gerado: ${seal}. ${authCheck.isSupervisorOverride ? '[Assinatura homologada sob supervisão administrativa]' : ''}`
    };

    setAllSystemSignatures(prev => prev.map(s => {
      if (s.id === signatureId) {
        return {
          ...s,
          status: 'Assinado' as const,
          signedAt: nowStr,
          signerName: actualSignerName,
          signedByUserId: currentUserContext.id,
          signedByUserName: currentUserContext.name,
          signedByUserEmail: currentUserContext.email,
          signedByRole: currentUserContext.role,
          digitalSeal: seal,
          verificationHash: hash,
          signatureDataUrl: signatureDataUrl || s.signatureDataUrl,
          stampType: s.stampType || 'oficial',
          auditTrail: [successAudit, ...(s.auditTrail || [])]
        };
      }
      return s;
    }));

    addNotification({
      title: 'Assinatura Registrada com Sucesso',
      message: `O documento ${target.document.documentNumber} foi assinado por ${actualSignerName} e autenticado digitalmente.`,
      type: 'system'
    });
    soundManager.playSuccess();

    return { success: true, message: 'Assinatura digital registrada e autenticada com sucesso.' };
  };

  const rejectDocumentSignature = (signatureId: string, reason: string): { success: boolean; message: string } => {
    const target = allSystemSignatures.find(s => s.id === signatureId);
    if (!target) return { success: false, message: 'Assinatura não encontrada.' };

    const currentUserContext = {
      id: firebaseUser?.uid,
      email: firebaseUser?.email || undefined,
      name: firebaseUser?.displayName || 'Utilizador do Sistema',
      role: activeRole
    };

    const authCheck = checkUserSignatureAuthorization(target, currentUserContext);
    if (!authCheck.authorized) {
      const msg = 'Você não possui permissão para rejeitar ou alterar a assinatura de outro signatário.';
      addNotification({ title: 'Acesso Negado', message: msg, type: 'system' });
      soundManager.playError();
      return { success: false, message: msg };
    }

    const nowStr = new Date().toLocaleString('pt-MZ');
    const rejectAudit: SignatureAuditEntry = {
      id: `aud-rej-${Date.now()}`,
      action: 'rejeitada',
      timestamp: nowStr,
      actorId: currentUserContext.id || 'local-actor',
      actorName: currentUserContext.name,
      actorEmail: currentUserContext.email,
      actorRole: currentUserContext.role,
      details: `Assinatura rejeitada. Motivo: "${reason}".`
    };

    setAllSystemSignatures(prev => prev.map(s => {
      if (s.id === signatureId) {
        return {
          ...s,
          status: 'Rejeitado' as const,
          rejectionReason: reason,
          auditTrail: [rejectAudit, ...(s.auditTrail || [])]
        };
      }
      return s;
    }));

    addNotification({
      title: 'Assinatura Rejeitada',
      message: `A assinatura do documento ${target.document.documentNumber} foi rejeitada com justificativa formal registrada.`,
      type: 'system'
    });
    soundManager.playClick();
    return { success: true, message: 'Assinatura rejeitada com sucesso.' };
  };

  const revokeDocumentSignature = (signatureId: string, reason: string): { success: boolean; message: string } => {
    const target = allSystemSignatures.find(s => s.id === signatureId);
    if (!target) return { success: false, message: 'Assinatura não encontrada.' };

    const currentUserContext = {
      id: firebaseUser?.uid,
      email: firebaseUser?.email || undefined,
      name: firebaseUser?.displayName || 'Diretor/Admin',
      role: activeRole
    };

    // Apenas diretores ou superadmins podem revogar assinaturas oficiais
    const authCheck = checkUserSignatureAuthorization(target, currentUserContext);
    if (!authCheck.authorized && !authCheck.isSupervisorOverride) {
      const msg = 'Apenas Administradores ou a Direção podem revogar uma assinatura já firmada.';
      addNotification({ title: 'Acesso Negado', message: msg, type: 'system' });
      soundManager.playError();
      return { success: false, message: msg };
    }

    const nowStr = new Date().toLocaleString('pt-MZ');
    const revokeAudit: SignatureAuditEntry = {
      id: `aud-rev-${Date.now()}`,
      action: 'revogada',
      timestamp: nowStr,
      actorId: currentUserContext.id || 'admin',
      actorName: currentUserContext.name,
      actorEmail: currentUserContext.email,
      actorRole: currentUserContext.role,
      details: `Assinatura formalmente revogada. Motivo: "${reason}".`
    };

    setAllSystemSignatures(prev => prev.map(s => {
      if (s.id === signatureId) {
        return {
          ...s,
          status: 'Revogado' as const,
          revocationReason: reason,
          revokedAt: nowStr,
          revokedBy: currentUserContext.name,
          auditTrail: [revokeAudit, ...(s.auditTrail || [])]
        };
      }
      return s;
    }));

    addNotification({
      title: 'Assinatura Revogada',
      message: `A assinatura do documento ${target.document.documentNumber} foi revogada.`,
      type: 'system'
    });
    soundManager.playClick();
    return { success: true, message: 'Assinatura revogada com sucesso.' };
  };

  const createSignatureRequest = (data: Partial<SystemSignature>): SystemSignature => {
    const nowStr = new Date().toLocaleString('pt-MZ');
    const role: SignerRole = data.role || 'Diretor';
    const signerTitle = data.signerTitle || (data.customRoleTitle || role);
    const newId = `sig-${Date.now()}`;

    const newSig: SystemSignature = {
      id: newId,
      institutionId: activeInstitutionId,
      branchId: activeBranchId,
      role,
      customRoleTitle: data.customRoleTitle,
      signerName: data.signerName || 'Signatário a Designar',
      signerTitle,
      createdAt: nowStr,
      deadlineDate: data.deadlineDate,
      status: 'Pendente',
      document: data.document || {
        documentId: `doc-${Date.now()}`,
        documentType: 'Certificado',
        documentNumber: `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Documento Académico Oficial',
        recipientName: 'Destinatário',
        issueDate: nowStr
      },
      allowedRoles: data.allowedRoles || [role.toUpperCase(), 'DIRETOR', 'SUPER_ADMIN'],
      assignedUserId: data.assignedUserId,
      assignedUserEmail: data.assignedUserEmail,
      digitalSeal: `SIVERC-SIG-${role.toUpperCase()}-PENDING`,
      verificationHash: '',
      stampType: data.stampType || 'oficial',
      notes: data.notes,
      auditTrail: [
        {
          id: `aud-req-${Date.now()}`,
          action: 'solicitacao_criada',
          timestamp: nowStr,
          actorId: firebaseUser?.uid || 'actor',
          actorName: firebaseUser?.displayName || 'Secretaria / Direção',
          actorRole: activeRole,
          details: `Solicitação de assinatura criada para ${data.signerName || role} (${signerTitle}).`
        }
      ]
    };

    setAllSystemSignatures(prev => [newSig, ...prev]);

    addNotification({
      title: 'Solicitação de Assinatura Criada',
      message: `Solicitação emitida para ${newSig.signerName} referente ao documento ${newSig.document.documentNumber}.`,
      type: 'system'
    });
    soundManager.playSuccess();

    return newSig;
  };

  const addOfficialSigner = (signer: Omit<OfficialSigner, 'id' | 'registeredAt'>): OfficialSigner => {
    const nowStr = new Date().toISOString().split('T')[0];
    const newSigner: OfficialSigner = {
      ...signer,
      id: `signer-${Date.now()}`,
      registeredAt: nowStr
    };
    setOfficialSigners(prev => [newSigner, ...prev]);
    addNotification({
      title: 'Signatário Registrado',
      message: `${newSigner.name} foi cadastrado como signatário oficial (${newSigner.role}).`,
      type: 'system'
    });
    soundManager.playSuccess();
    return newSigner;
  };

  const updateOfficialSigner = (id: string, updates: Partial<OfficialSigner>) => {
    setOfficialSigners(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addNotification({
      title: 'Signatário Atualizado',
      message: 'Os dados do signatário oficial foram salvos.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const deleteOfficialSigner = (id: string) => {
    setOfficialSigners(prev => prev.filter(s => s.id !== id));
    addNotification({
      title: 'Signatário Removido',
      message: 'O signatário foi removido do diretório oficial da instituição.',
      type: 'system'
    });
    soundManager.playClick();
  };

  const toggleSignature = (role: DocumentSignature['role']) => {
    setSignatures(prev => prev.map(s => {
      if (s.role === role) {
        const nextSigned = !s.signed;
        return {
          ...s,
          signed: nextSigned,
          signedAt: nextSigned ? new Date().toLocaleString('pt-MZ') : undefined
        };
      }
      return s;
    }));

    soundManager.playClick();
  };

  const addNotification = (notif: Omit<LiveNotification, 'id' | 'timestamp' | 'read'>) => {
    const newN: LiveNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Agora mesmo',
      read: false
    };
    setNotifications(prev => [newN, ...prev]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const openWhatsAppMessage = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // 36. TAREFAS - USUÁRIO ATUAL & MÉTODOS DO MÓDULO
  const currentUser = {
    id: firebaseUser?.uid || 'user-current',
    email: firebaseUser?.email || undefined,
    name: firebaseUser?.displayName || (activeRole === 'superadmin' || activeRole === 'SUPER_ADMIN' ? 'Super Administrador' : activeRole === 'director' || activeRole === 'DIRETOR' ? 'Diretor Geral' : (activeRole as string) === 'admin' || activeRole === 'ADMIN_INSTITUICAO' ? 'Administrador' : activeRole === 'professor' || activeRole === 'PROFESSOR' || (activeRole as string) === 'teacher' ? 'Professor(a)' : 'Utilizador Autorizado'),
    role: activeRole
  };

  const tasks = allTasks.filter(t => 
    activeRole === 'superadmin' ? true : t.institutionId === activeInstitution.id
  );

  const addTask = (taskData: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'institutionId'>): TaskItem => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institutionId: activeInstitution.id,
      attachments: taskData.attachments || [],
      notes: taskData.notes || [],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAllTasks(prev => [newTask, ...prev]);
    addNotification({
      title: 'Tarefa Criada',
      message: `A tarefa "${newTask.title}" foi registrada com sucesso.`,
      type: 'system'
    });
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<TaskItem>) => {
    setAllTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = updates.state === 'concluído' && t.state !== 'concluído';
        return {
          ...t,
          ...updates,
          completedAt: isNowCompleted ? new Date().toISOString().replace('T', ' ').substring(0, 16) : (updates.completedAt !== undefined ? updates.completedAt : t.completedAt),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    }));
  };

  const deleteTask = (taskId: string) => {
    setAllTasks(prev => prev.filter(t => t.id !== taskId));
    addNotification({
      title: 'Tarefa Excluída',
      message: 'A tarefa foi removida com sucesso.',
      type: 'system'
    });
  };

  const changeTaskState = (taskId: string, newState: TaskState) => {
    updateTask(taskId, {
      state: newState,
      completedAt: newState === 'concluído' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined
    });
    addNotification({
      title: 'Estado da Tarefa Atualizado',
      message: `A tarefa foi movida para "${newState.toUpperCase()}".`,
      type: 'system'
    });
  };

  const addTaskNote = (taskId: string, noteData: { content: string; visibility: TaskNoteVisibility; authorizedRoles?: string[] }) => {
    const currentUserName = currentUser.name;
    const currentUserRole = currentUser.role;
    const newNote: TaskNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorId: currentUser.id,
      authorName: currentUserName,
      authorRole: currentUserRole,
      content: noteData.content,
      visibility: noteData.visibility,
      authorizedRoles: noteData.authorizedRoles || ['superadmin', 'director', 'admin', 'coordenador'],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setAllTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          notes: [...(t.notes || []), newNote],
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    }));

    addNotification({
      title: noteData.visibility === 'privada' ? 'Nota Privada Registrada' : 'Nota Registrada',
      message: noteData.visibility === 'privada' 
        ? 'Nota gravada sob sigilo (visível apenas para si).' 
        : 'Nota gravada e visível para utilizadores autorizados.',
      type: 'system'
    });
  };

  const deleteTaskNote = (taskId: string, noteId: string) => {
    setAllTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          notes: (t.notes || []).filter(n => n.id !== noteId),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    }));
  };

  const addTaskAttachment = (taskId: string, attachment: Omit<TaskAttachment, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const newAttachment: TaskAttachment = {
      ...attachment,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      uploadedBy: currentUser.name
    };

    setAllTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          attachments: [...(t.attachments || []), newAttachment],
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    }));

    addNotification({
      title: 'Anexo Adicionado',
      message: `Arquivo "${newAttachment.name}" anexado à tarefa.`,
      type: 'system'
    });
  };

  const removeTaskAttachment = (taskId: string, attachmentId: string) => {
    setAllTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          attachments: (t.attachments || []).filter(a => a.id !== attachmentId),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    }));
  };

  // 37. MÓDULO DE CALENDÁRIO GERAL - MÉTODOS
  const calendarEvents = allCalendarEvents.filter(ev => 
    activeRole === 'superadmin' ? true : ev.institutionId === activeInstitution.id
  );

  const addCalendarEvent = (eventData: Omit<CalendarCustomEvent, 'id' | 'createdAt' | 'updatedAt' | 'institutionId'>): CalendarCustomEvent => {
    const newEvent: CalendarCustomEvent = {
      ...eventData,
      id: `cal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institutionId: activeInstitution.id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAllCalendarEvents(prev => [newEvent, ...prev]);
    addNotification({
      title: 'Evento Agendado',
      message: `"${newEvent.title}" foi adicionado com sucesso ao calendário geral.`,
      type: 'system'
    });
    return newEvent;
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarCustomEvent>) => {
    setAllCalendarEvents(prev => prev.map(ev => {
      if (ev.id === id) {
        return {
          ...ev,
          ...updates,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return ev;
    }));
    addNotification({
      title: 'Evento Atualizado',
      message: 'As alterações do calendário foram salvas.',
      type: 'system'
    });
  };

  const deleteCalendarEvent = (id: string) => {
    setAllCalendarEvents(prev => prev.filter(ev => ev.id !== id));
    addNotification({
      title: 'Evento Removido',
      message: 'O evento foi excluído do calendário.',
      type: 'system'
    });
  };

  // 50. COMUNICADOS (MÓDULO DE COMUNICADOS INSTITUCIONAIS) - MÉTODOS
  const announcements = allAnnouncements.filter(a => 
    activeRole === 'superadmin' ? true : a.institutionId === activeInstitution.id
  );

  const addAnnouncement = (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'readCount' | 'confirmedCount'>): Announcement => {
    const newAnn: Announcement = {
      ...data,
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institutionId: activeInstitution.id,
      branchId: activeBranchId !== 'todas' ? activeBranchId : undefined,
      readCount: 0,
      confirmedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAllAnnouncements(prev => [newAnn, ...prev]);

    if (newAnn.status === 'publicado') {
      addNotification({
        title: `Novo Comunicado: ${newAnn.title}`,
        message: newAnn.summary || newAnn.content.slice(0, 100),
        type: 'system'
      });
    } else if (newAnn.status === 'agendado') {
      addNotification({
        title: `Comunicado Agendado`,
        message: `O comunicado "${newAnn.title}" foi programado para publicação em ${newAnn.scheduledFor || 'data futura'}.`,
        type: 'system'
      });
    }

    soundManager.playSuccess();
    return newAnn;
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    setAllAnnouncements(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    ));
    addNotification({
      title: 'Comunicado Atualizado',
      message: 'As alterações do comunicado foram salvas.',
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const deleteAnnouncement = (id: string) => {
    setAllAnnouncements(prev => prev.filter(a => a.id !== id));
    addNotification({
      title: 'Comunicado Removido',
      message: 'O comunicado foi excluído com sucesso.',
      type: 'system'
    });
    soundManager.playNotification();
  };

  const publishAnnouncementNow = (id: string) => {
    setAllAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'publicado',
          publishDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    }));
    addNotification({
      title: 'Comunicado Publicado',
      message: 'O comunicado agendado foi publicado com sucesso no mural!',
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const markAnnouncementAsRead = (id: string) => {
    setAllAnnouncements(prev => prev.map(a => 
      a.id === id ? { ...a, readCount: (a.readCount || 0) + 1 } : a
    ));
  };

  const confirmAnnouncementAttendance = (id: string) => {
    setAllAnnouncements(prev => prev.map(a => 
      a.id === id ? { ...a, confirmedCount: (a.confirmedCount || 0) + 1 } : a
    ));
    addNotification({
      title: 'Confirmação Registrada',
      message: 'A sua confirmação de presença/leitura foi registrada com sucesso.',
      type: 'system'
    });
    soundManager.playSuccess();
  };

  // ==========================================
  // 86. MOZCOIN — CARTEIRAS & REGRAS DE ISOLAMENTO
  // ==========================================
  // Carteira do utilizador atual (ou Super Admin se superadmin)
  const activeUserWallet = useMemo(() => {
    const userEmail = firebaseUser?.email || (activeRole === 'superadmin' ? 'admin-core@moztechwave.co.mz' : undefined);
    const userId = firebaseUser?.uid || (activeRole === 'superadmin' ? 'usr-superadmin' : currentUser.id);
    
    // Procura por ID do utilizador ou email
    let found = allMozcoinWallets.find(w => w.ownerType === 'user' && (w.ownerId === userId || (userEmail && w.ownerEmail === userEmail)));
    if (!found) {
      if (activeRole === 'superadmin') {
        found = allMozcoinWallets.find(w => w.id === 'wlt-superadmin-01');
      } else {
        found = allMozcoinWallets.find(w => w.ownerType === 'user');
      }
    }
    return found || null;
  }, [allMozcoinWallets, firebaseUser, activeRole, currentUser.id]);

  // Carteira Institucional Ativa
  const activeInstitutionWallet = useMemo(() => {
    return allMozcoinWallets.find(w => w.ownerType === 'institution' && w.ownerId === activeInstitution.id) || null;
  }, [allMozcoinWallets, activeInstitution.id]);

  // Carteiras visíveis (Super Admin vê todas; outros veem a pessoal + institucional)
  const mozcoinWallets = useMemo(() => {
    if (activeRole === 'superadmin') return allMozcoinWallets;
    return allMozcoinWallets.filter(w => 
      (activeUserWallet && w.id === activeUserWallet.id) || 
      (activeInstitutionWallet && w.id === activeInstitutionWallet.id)
    );
  }, [activeRole, allMozcoinWallets, activeUserWallet, activeInstitutionWallet]);

  // Transações visíveis
  const mozcoinTransactions = useMemo(() => {
    if (activeRole === 'superadmin') return allMozcoinTransactions;
    const allowedWalletIds = new Set(mozcoinWallets.map(w => w.id));
    return allMozcoinTransactions.filter(tx => allowedWalletIds.has(tx.walletId) || tx.ownerId === activeInstitution.id);
  }, [activeRole, allMozcoinTransactions, mozcoinWallets, activeInstitution.id]);

  // Pedidos de compra visíveis
  const mozcoinPurchases = useMemo(() => {
    if (activeRole === 'superadmin') return allMozcoinPurchases;
    return allMozcoinPurchases.filter(p => 
      p.userId === currentUser.id || 
      p.userEmail === firebaseUser?.email || 
      p.institutionId === activeInstitution.id
    );
  }, [activeRole, allMozcoinPurchases, currentUser.id, firebaseUser, activeInstitution.id]);

  // 86.1 Compra de MOZCOIN (Criação de Pedido Pendente)
  const requestMozcoinPurchase = (params: {
    targetWallet: 'user' | 'institution';
    mozcoinAmount: number;
    paymentMethod: MozcoinPaymentMethod;
    transactionCode: string;
    paymentDate: string;
    paymentTime: string;
    network: string;
    proofUrl?: string;
    proofFileName?: string;
  }): MozcoinPurchaseRequest => {
    const now = new Date().toISOString();
    const newRequest: MozcoinPurchaseRequest = {
      id: `pur-mc-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name || 'Utilizador do Sistema',
      userEmail: currentUser.email || 'utilizador@moztechwave.co.mz',
      userRole: activeRole,
      institutionId: activeInstitution.id,
      institutionName: activeInstitution.name,
      targetWallet: params.targetWallet,
      mozcoinAmount: params.mozcoinAmount,
      fiatAmount: params.mozcoinAmount, // 1 MTn = 1 MOZCOIN
      rate: 1,
      paymentMethod: params.paymentMethod,
      transactionCode: params.transactionCode.trim().toUpperCase(),
      paymentDate: params.paymentDate,
      paymentTime: params.paymentTime,
      network: params.network,
      proofUrl: params.proofUrl,
      proofFileName: params.proofFileName,
      status: 'pendente',
      createdAt: now,
      updatedAt: now
    };

    setAllMozcoinPurchases(prev => [newRequest, ...prev]);

    // Atualiza saldo pendente da carteira destino
    const targetWalletId = params.targetWallet === 'institution' && activeInstitutionWallet 
      ? activeInstitutionWallet.id 
      : activeUserWallet?.id;

    if (targetWalletId) {
      setAllMozcoinWallets(prev => prev.map(w => 
        w.id === targetWalletId ? { ...w, pendingPurchases: (w.pendingPurchases || 0) + params.mozcoinAmount } : w
      ));
    }

    addNotification({
      title: 'Pedido de MOZCOIN Submetido',
      message: `Solicitação de ${params.mozcoinAmount.toLocaleString()} MOZCOIN enviada. Aguardando aprovação administrativa.`,
      type: 'payment'
    });
    soundManager.playSuccess();

    return newRequest;
  };

  // 86.2 Aprovação de Compra pelo Super Admin / CEO
  const approveMozcoinPurchase = (purchaseId: string, actorName = 'Super Admin / CEO') => {
    const purchase = allMozcoinPurchases.find(p => p.id === purchaseId);
    if (!purchase || purchase.status === 'aprovado') return;

    const now = new Date();
    const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // Identificar carteira de destino
    let targetWallet = allMozcoinWallets.find(w => {
      if (purchase.targetWallet === 'institution') {
        return w.ownerType === 'institution' && w.ownerId === purchase.institutionId;
      }
      return w.ownerType === 'user' && (w.ownerId === purchase.userId || w.ownerEmail === purchase.userEmail);
    });

    let updatedWallets = [...allMozcoinWallets];
    if (!targetWallet) {
      const newWallet: MozcoinWallet = {
        id: `wlt-${purchase.targetWallet}-${purchase.targetWallet === 'institution' ? purchase.institutionId : purchase.userId}`,
        ownerType: purchase.targetWallet,
        ownerId: (purchase.targetWallet === 'institution' ? purchase.institutionId : purchase.userId) || 'anon',
        ownerName: (purchase.targetWallet === 'institution' ? purchase.institutionName : purchase.userName) || 'Carteira Mozcoin',
        ownerEmail: purchase.userEmail,
        institutionId: purchase.institutionId,
        balance: 0,
        totalCredited: 0,
        totalDebited: 0,
        pendingPurchases: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      targetWallet = newWallet;
      updatedWallets.push(newWallet);
    }

    const prevBalance = targetWallet.balance;
    const newBalance = prevBalance + purchase.mozcoinAmount;
    const newPending = Math.max(0, (targetWallet.pendingPurchases || 0) - purchase.mozcoinAmount);

    // 1. Atualizar carteira
    const finalWallets = updatedWallets.map(w => {
      if (w.id === targetWallet!.id) {
        return {
          ...w,
          balance: newBalance,
          totalCredited: (w.totalCredited || 0) + purchase.mozcoinAmount,
          pendingPurchases: newPending,
          lastTransactionAt: nowStr,
          updatedAt: now.toISOString()
        };
      }
      return w;
    });
    setAllMozcoinWallets(finalWallets);

    // 2. Extrato imutável de movimentação
    const newTx: MozcoinTransaction = {
      id: `tx-mc-${Date.now()}`,
      walletId: targetWallet.id,
      ownerId: targetWallet.ownerId,
      ownerName: targetWallet.ownerName,
      ownerType: targetWallet.ownerType,
      type: 'compra',
      amount: purchase.mozcoinAmount,
      previousBalance: prevBalance,
      newBalance: newBalance,
      origin: `${purchase.network} #${purchase.transactionCode}`,
      destination: targetWallet.ownerName,
      status: 'concluido',
      description: `Compra de ${purchase.mozcoinAmount.toLocaleString()} MOZCOIN confirmada por ${actorName}.`,
      timestamp: nowStr,
      operator: actorName,
      referenceCode: purchase.id
    };
    setAllMozcoinTransactions(prev => [newTx, ...prev]);

    // 3. Atualizar status do pedido
    setAllMozcoinPurchases(prev => prev.map(p => 
      p.id === purchaseId ? {
        ...p,
        status: 'aprovado',
        reviewedBy: actorName,
        reviewedAt: now.toISOString(),
        updatedAt: now.toISOString()
      } : p
    ));

    addNotification({
      title: 'MOZCOIN Creditada!',
      message: `${purchase.mozcoinAmount.toLocaleString()} MOZCOIN creditadas com sucesso na carteira de ${targetWallet.ownerName}.`,
      type: 'payment'
    });
    soundManager.playSuccess();
  };

  // Rejeitar compra
  const rejectMozcoinPurchase = (purchaseId: string, reason: string, actorName = 'Super Admin / CEO') => {
    const purchase = allMozcoinPurchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    setAllMozcoinWallets(prev => prev.map(w => {
      const match = purchase.targetWallet === 'institution' 
        ? (w.ownerType === 'institution' && w.ownerId === purchase.institutionId)
        : (w.ownerType === 'user' && (w.ownerId === purchase.userId || w.ownerEmail === purchase.userEmail));
      if (match) {
        return {
          ...w,
          pendingPurchases: Math.max(0, (w.pendingPurchases || 0) - purchase.mozcoinAmount)
        };
      }
      return w;
    }));

    setAllMozcoinPurchases(prev => prev.map(p => 
      p.id === purchaseId ? {
        ...p,
        status: 'rejeitado',
        rejectionReason: reason,
        reviewedBy: actorName,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } : p
    ));

    addNotification({
      title: 'Pedido de MOZCOIN Não Aprovado',
      message: `O pedido de compra #${purchase.transactionCode} foi recusado: ${reason}`,
      type: 'system'
    });
    soundManager.playError();
  };

  // Solicitar correção
  const requestPurchaseCorrection = (purchaseId: string, notes: string, actorName = 'Super Admin / CEO') => {
    setAllMozcoinPurchases(prev => prev.map(p => 
      p.id === purchaseId ? {
        ...p,
        status: 'correcao_solicitada',
        correctionNotes: notes,
        reviewedBy: actorName,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } : p
    ));

    addNotification({
      title: 'Correção de Pedido Solicitada',
      message: `Por favor revise os dados do pedido de MOZCOIN: ${notes}`,
      type: 'system'
    });
    soundManager.playWarning();
  };

  // Reenviar dados corrigidos
  const resubmitPurchaseCorrection = (
    purchaseId: string, 
    updates: { transactionCode: string; proofUrl?: string; proofFileName?: string; network?: string; paymentDate?: string }
  ) => {
    setAllMozcoinPurchases(prev => prev.map(p => 
      p.id === purchaseId ? {
        ...p,
        ...updates,
        transactionCode: updates.transactionCode.trim().toUpperCase(),
        status: 'pendente',
        correctionNotes: undefined,
        updatedAt: new Date().toISOString()
      } : p
    ));

    addNotification({
      title: 'Pedido Reenviado para Análise',
      message: 'Os dados foram atualizados e o pedido retornou à fila de aprovação.',
      type: 'payment'
    });
    soundManager.playSuccess();
  };

  // 86.4 & 86.5 Consumo de Serviços em MOZCOIN & Planos Antecipados
  const consumeMozcoinService = (params: {
    walletId: string;
    serviceId: string;
    quantity?: number;
    referenceNotes?: string;
    advanceMonths?: number;
  }): { success: boolean; error?: string; transaction?: MozcoinTransaction } => {
    const wallet = allMozcoinWallets.find(w => w.id === params.walletId);
    if (!wallet) {
      return { success: false, error: 'Carteira não encontrada.' };
    }

    const service = mozcoinEcosystemServices.find(s => s.id === params.serviceId);
    if (!service) {
      return { success: false, error: 'Serviço não encontrado no catálogo do ecossistema.' };
    }

    const qty = params.quantity || 1;
    let baseCost = service.costMozcoin * qty;

    // Regra de Desconto por Plano Antecipado (86.5)
    let appliedDiscountRule: MozcoinDiscountRule | null = null;
    let bonusGranted = 0;

    if (params.advanceMonths && params.advanceMonths >= 3) {
      const rule = mozcoinDiscountRules
        .filter(r => r.isActive && r.monthsAdvance <= params.advanceMonths!)
        .sort((a, b) => b.monthsAdvance - a.monthsAdvance)[0];

      if (rule) {
        appliedDiscountRule = rule;
        const discountVal = (baseCost * rule.discountPercentage) / 100;
        baseCost = Math.round(baseCost - discountVal);
        bonusGranted = rule.bonusMozcoins || 0;
      }
    }

    if (wallet.balance < baseCost) {
      return {
        success: false,
        error: `Saldo insuficiente na carteira. Necessário: ${baseCost} MOZCOIN. Disponível: ${wallet.balance} MOZCOIN.`
      };
    }

    const now = new Date();
    const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const prevBalance = wallet.balance;
    const finalBalance = prevBalance - baseCost + bonusGranted;

    // Atualizar carteira
    setAllMozcoinWallets(prev => prev.map(w => {
      if (w.id === wallet.id) {
        return {
          ...w,
          balance: finalBalance,
          totalDebited: (w.totalDebited || 0) + baseCost,
          totalCredited: (w.totalCredited || 0) + bonusGranted,
          lastTransactionAt: nowStr,
          updatedAt: now.toISOString()
        };
      }
      return w;
    }));

    // Extrato imutável
    const newTx: MozcoinTransaction = {
      id: `tx-mc-${Date.now()}`,
      walletId: wallet.id,
      ownerId: wallet.ownerId,
      ownerName: wallet.ownerName,
      ownerType: wallet.ownerType,
      type: appliedDiscountRule ? 'plano_antecipado' : 'consumo_servico',
      amount: -baseCost,
      previousBalance: prevBalance,
      newBalance: finalBalance,
      origin: wallet.ownerName,
      destination: service.name,
      serviceRef: service.code,
      status: 'concluido',
      description: appliedDiscountRule 
        ? `Aquisição antecipada (${params.advanceMonths} meses) com ${appliedDiscountRule.discountPercentage}% desc. + ${bonusGranted} bonus: ${service.name}`
        : `Consumo de ${qty}x ${service.name}. ${params.referenceNotes || ''}`,
      timestamp: nowStr,
      operator: currentUser.name || 'Utilizador',
      referenceCode: `SVC-${Date.now().toString(36).toUpperCase()}`
    };

    setAllMozcoinTransactions(prev => [newTx, ...prev]);

    addNotification({
      title: 'Serviço Consumido com MOZCOIN',
      message: `Foram debitadas ${baseCost} MOZCOIN para "${service.name}". Saldo restante: ${finalBalance} MOZCOIN.`,
      type: 'payment'
    });
    soundManager.playSuccess();

    return { success: true, transaction: newTx };
  };

  // Gestão de Regras de Desconto (Super Admin)
  const updateDiscountRule = (ruleId: string, updates: Partial<MozcoinDiscountRule>) => {
    setMozcoinDiscountRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, ...updates, updatedAt: new Date().toISOString().substring(0, 10) } : r
    ));
    addNotification({
      title: 'Regra de Desconto Atualizada',
      message: 'As condições promocionais de planos antecipados foram salvas.',
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const addDiscountRule = (rule: Omit<MozcoinDiscountRule, 'id' | 'createdAt' | 'updatedAt'>): MozcoinDiscountRule => {
    const now = new Date().toISOString().substring(0, 10);
    const newRule: MozcoinDiscountRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setMozcoinDiscountRules(prev => [...prev, newRule]);
    addNotification({
      title: 'Nova Regra Promocional Criada',
      message: `Regra de ${newRule.monthsAdvance} meses com ${newRule.discountPercentage}% de desconto ativa.`,
      type: 'system'
    });
    soundManager.playSuccess();
    return newRule;
  };

  const deleteDiscountRule = (ruleId: string) => {
    setMozcoinDiscountRules(prev => prev.filter(r => r.id !== ruleId));
    addNotification({
      title: 'Regra Removida',
      message: 'A regra de desconto foi eliminada do sistema.',
      type: 'system'
    });
  };

  // ==========================================
  // 87. MOZTECHWAVE ID — LOGIN UNIFICADO & FLUXO
  // ==========================================
  const loginWithMoztechwaveId = (params: {
    role: UserRole;
    institutionId: string;
    branchId: string;
    authMethod: string;
  }) => {
    // Privilege Escalation Guard: Only authenticated platform owner can assume superadmin
    let grantedRole = params.role;
    if (params.role === 'SUPER_ADMIN' || params.role === 'superadmin') {
      const isOwner = (authorizedRoles || []).map(r => toCanonicalRole(r)).includes('SUPER_ADMIN') || (firebaseUser as any)?.claims?.role === 'superadmin';
      if (!isOwner) {
        grantedRole = 'DIRETOR';
        addNotification({
          title: 'Proteção Anti-Escalação Ativa',
          message: 'Apenas a identidade soberana do proprietário pode assumir o papel de Super Admin.',
          type: 'system'
        });
      }
    }

    setActiveRole(grantedRole);

    const targetInst = allInstitutions.find(i => i.id === params.institutionId);
    if (targetInst) {
      setActiveInstitution(targetInst);
    }

    setActiveBranchId(params.branchId);

    const roleLower = params.role.toLowerCase();
    let targetRoute: AppRoute = 'admin_dashboard';

    if (roleLower === 'super_admin' || roleLower === 'superadmin') {
      targetRoute = 'experiencia_superadmin';
    } else if (roleLower === 'diretor' || roleLower === 'director') {
      targetRoute = 'experiencia_diretor';
    } else if (roleLower === 'secretaria') {
      targetRoute = 'experiencia_secretaria';
    } else if (roleLower === 'financeiro') {
      targetRoute = 'experiencia_financeiro';
    } else if (roleLower === 'professor' || roleLower === 'formador') {
      targetRoute = 'experiencia_professor';
    } else if (roleLower === 'porteiro') {
      targetRoute = 'experiencia_porteiro';
    } else if (roleLower === 'aluno' || roleLower === 'responsavel') {
      targetRoute = 'experiencia_aluno';
    } else if (roleLower === 'empresa') {
      targetRoute = 'experiencia_empresa';
    }

    navigate(targetRoute);

    addNotification({
      title: 'MOZTECHWAVE ID Conectado',
      message: `Sessão iniciada como ${params.role} em ${targetInst?.name || 'SIGAR'}.`,
      type: 'system'
    });
    soundManager.playSuccess();
  };

  const selectedStudent = routeParams.id 
    ? students.find(s => s.id === routeParams.id) || null 
    : null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        themeMode,
        setThemeMode,
        toggleThemeMode,
        currentRoute,
        routeParams,
        navigate,
        activeRole,
        setActiveRole,
        authorizedRoles,
        switchRole,
        hasSigarProfile,
        userProfile,
        firebaseUser,
        isFirebaseConnected,
        isSyncing,
        loginWithGoogle,
        logout,
        institutions,
        allInstitutions,
        activeInstitution,
        setActiveInstitution,
        addInstitution,
        updateInstitution,
        activeBranchId,
        setActiveBranchId,
        activeBranch,
        addBranch,
        updateInstitutionPrefixes,
        updateInstitutionFinancialSettings,
        addInstitutionBankAccount,
        removeInstitutionBankAccount,
        systemPlans,
        updatePlanDefinition,
        updateInstitutionPlan,
        getEffectivePlanLimits,
        checkResourceUsage,
        students,
        selectedStudent,
        addStudent,
        updateStudent,
        deleteStudent,
        terminateStudent,
        reactivateStudent,
        changeStudentStatus,
        courses,
        allCourses,
        addCourse,
        updateCourse,
        deleteCourse,
        addModuleToCourse,
        updateCourseModule,
        deleteCourseModule,
        classes,
        allClasses,
        addClassGroup,
        updateClassGroup,
        deleteClassGroup,
        duplicateClassGroup,
        transferStudent,
        addStudentToClass,
        removeStudentFromClass,
        classTransfers,
        allClassTransfers,
        schedules,
        allSchedules,
        addScheduleSlot,
        updateScheduleSlot,
        deleteScheduleSlot,
        detectScheduleConflicts,
        teachers,
        allTeachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        activeTeacherId,
        setActiveTeacherId,
        activeTeacher,
        teacherAssignedClasses,
        teacherAssignedStudents,
        teacherAssignedSchedules,
        teacherAssignedLessons,
        cashSessions,
        activeCashSession,
        addCashTransaction,
        openCashRegister,
        closeCashRegister,
        lessons,
        attendanceAuditLogs: allAttendanceAudits,
        addLesson,
        updateLesson,
        deleteLesson,
        saveAttendance,
        unlockLessonAttendance,
        addAttendanceAuditEntry,
        saveStudentAssessmentScore,
        evaluations,
        allEvaluations,
        calculationFormulas,
        allCalculationFormulas,
        addEvaluation,
        updateEvaluation,
        deleteEvaluation,
        saveEvaluationScore,
        saveBulkEvaluationScores,
        addCalculationFormula,
        updateCalculationFormula,
        deleteCalculationFormula,
        calculateStudentFinalGrade,
        pautaHomologations,
        allPautaHomologations,
        homologatePauta,
        overrideStudentPautaSituation,
        internships,
        allInternships,
        addInternship,
        updateInternship,
        deleteInternship,
        evaluateInternship,
        changeInternshipStatus,
        certificates,
        allCertificates,
        addCertificate: (certData: Omit<CertificateData, 'id'>) => {
          const newCert: CertificateData = {
            ...certData,
            id: `cert-${Date.now()}`
          };
          setAllCertificates(prev => [newCert, ...prev]);
          return newCert;
        },
        accessLogs,
        logGateAccess,
        confirmStudentEntry,
        whatsappConfig,
        updateWhatsAppConfig,
        whatsAppTemplates,
        allWhatsAppTemplates,
        whatsAppCampaigns,
        allWhatsAppCampaigns,
        whatsAppAutomations,
        allWhatsAppAutomations,
        whatsAppLogs,
        allWhatsAppLogs,
        whatsAppConsents,
        sendDirectWhatsAppMessage,
        createWhatsAppTemplate,
        updateWhatsAppTemplate,
        deleteWhatsAppTemplate,
        createWhatsAppCampaign,
        executeWhatsAppCampaign,
        createWhatsAppAutomation,
        toggleWhatsAppAutomation,
        runWhatsAppAutomationNow,
        updateWhatsAppConsent,
        simulateWhatsAppPairing,
        disconnectWhatsAppDevice,
        financialSettings,
        updateFinancialSettings,
        contractTemplates,
        generatedContracts,
        saveContractTemplate,
        createContractTemplate,
        updateContractTemplateWithVersion,
        restoreContractTemplateVersion,
        generateContractForStudent,
        generateContractWithVariables,
        updateContractStatus,
        renewContract,
        signContract,
        studioTemplates,
        allStudioTemplates,
        saveStudioTemplate,
        createStudioTemplate,
        duplicateStudioTemplate,
        toggleActiveStudioTemplate,
        deleteStudioTemplate,
        restoreStudioTemplateVersion,
        createStudioTemplateVersion,
        // 23. SISTEMA DE ASSINATURAS
        allSystemSignatures,
        systemSignatures,
        officialSigners,
        signDocumentSignature,
        rejectDocumentSignature,
        revokeDocumentSignature,
        createSignatureRequest,
        addOfficialSigner,
        updateOfficialSigner,
        deleteOfficialSigner,
        signatures,
        toggleSignature,
        dashboardTasks,
        toggleDashboardTask,
        addDashboardTask,
        dashboardNotices,
        addDashboardNotice,
        addStudentAuditEntry,
        addStudentHistoryEvent,
        addStudentDocument,
        notifications,
        unreadCount,
        markAllNotificationsAsRead,
        addNotification,
        clearNotifications,
        openWhatsAppMessage,
        applications,
        allApplications,
        onlineRegistrationConfig,
        updateOnlineRegistrationConfig,
        addApplication,
        updateApplication,
        approveApplication,
        rejectApplication,
        convertCandidateToStudent,
        deleteApplication,
        // 29. FINANCEIRO (CONTAS A RECEBER E CONTAS A PAGAR)
        contasReceber,
        allContasReceber,
        contasPagar,
        allContasPagar,
        addContaReceber,
        updateContaReceber,
        deleteContaReceber,
        receiveContaPayment,
        addContaPagar,
        updateContaPagar,
        deleteContaPagar,
        payContaPagar,
        // 30. PAGAMENTOS (PORTAL EFETUAR PAGAMENTO)
        paymentRecords,
        allPaymentRecords,
        submitPayment,
        approvePayment,
        rejectPayment,
        requestPaymentCorrection,
        resubmitPayment,
        deletePaymentRecord,
        recordReceiptReprint,
        // 36. MÓDULO DE TAREFAS
        currentUser,
        tasks,
        allTasks,
        addTask,
        updateTask,
        deleteTask,
        changeTaskState,
        addTaskNote,
        deleteTaskNote,
        addTaskAttachment,
        removeTaskAttachment,
        // 37. MÓDULO DE CALENDÁRIO GERAL
        calendarEvents,
        allCalendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        // 50. COMUNICADOS (MÓDULO DE COMUNICADOS INSTITUCIONAIS)
        announcements,
        allAnnouncements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        publishAnnouncementNow,
        markAnnouncementAsRead,
        confirmAnnouncementAttendance,
        // 53. AUDITORIA (MÓDULO DE AUDITORIA CRÍTICA)
        auditLogs,
        allAuditLogs,
        logCriticalAction,
        purgeAuditLogs,
        updateInstitutionModules,
        authenticatedStudent,
        loginStudentByCode,
        logoutStudent,
        // 86. MOZCOIN — ECONOMIA INTERNA
        mozcoinWallets,
        allMozcoinWallets,
        mozcoinTransactions,
        allMozcoinTransactions,
        mozcoinPurchases,
        allMozcoinPurchases,
        mozcoinDiscountRules,
        mozcoinEcosystemServices,
        activeUserWallet,
        activeInstitutionWallet,
        requestMozcoinPurchase,
        approveMozcoinPurchase,
        rejectMozcoinPurchase,
        requestPurchaseCorrection,
        resubmitPurchaseCorrection,
        consumeMozcoinService,
        updateDiscountRule,
        addDiscountRule,
        deleteDiscountRule,
        // 87. MOZTECHWAVE ID
        moztechwaveIdentities,
        activeMoztechwaveIdentity,
        loginWithMoztechwaveId,
        // PARTE 4 & 14: Progressive Auth Loading & Onboarding Tour
        authLoadingPhase,
        onboardingCompleted,
        completeOnboarding,
        restartOnboarding
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
