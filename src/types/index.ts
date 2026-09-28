export * from './rbac';
export * from './studio';
export * from './signatures';
export * from './plans';
export * from './integrations';
export * from './mozcoin';
export * from './moztechwaveId';
import type { UserRole, CanonicalRole, Permission, RoleDefinition } from './rbac';
import type { PlanName, InstitutionSubscription, PlanLimits } from './plans';
export type { UserRole, CanonicalRole, Permission, RoleDefinition };

export type InstitutionType = 
  | 'centro_formacao' 
  | 'empresa' 
  | 'centro_infantil' 
  | 'instituicao_ensino' 
  | 'outra';

export interface Branch {
  id: string;
  institutionId: string;
  name: string; // e.g. "Sede Central (Maputo)", "Delegação Matola", "Campus Beira"
  code: string; // e.g. "MAP-01", "MAT-02", "BEI-03"
  phone: string;
  email?: string;
  address: string;
  city: string;
  province: string;
  directorName?: string;
  isMainBranch: boolean;
  isHeadquarter?: boolean;
  totalStudents?: number;
  status?: 'active' | 'inactive' | string;
  createdAt: string;
}

export interface InstitutionBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  nib: string;
  iban?: string;
  mpesaNumber?: string;
  emolaNumber?: string;
  currency: string;
  isDefault: boolean;
}

export interface InstitutionPrefixes {
  studentPrefix: string;     // e.g. "CFTPM-AL" or "IPS-AL"
  candidatePrefix?: string;  // e.g. "CFTPM-CAND" or "SIGAR-CAND"
  certificatePrefix: string; // e.g. "CFTPM-CERT" or "IPS-CERT"
  receiptPrefix: string;     // e.g. "CFTPM-REC" or "IPS-REC"
  contractPrefix: string;    // e.g. "CFTPM-CTR" or "IPS-CTR"
  invoicePrefix?: string;    // e.g. "CFTPM-FT"
  studentNextSeq?: number;
  candidateNextSeq?: number;
  certificateNextSeq?: number;
  receiptNextSeq?: number;
  contractNextSeq?: number;
  zeroPadding?: number;      // e.g. 4 -> 0001
}

export interface FinancialServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  periodicity: 'mensal' | 'unico' | 'anual' | 'por_solicitacao';
  isActive: boolean;
  applicableTo?: 'todos' | 'novos_alunos' | 'veteranos' | 'concluintes';
}

export interface PaymentMethodConfig {
  id: string;
  key: 'mpesa' | 'emola' | 'ponto24' | 'banco' | 'dinheiro' | 'pos';
  name: string;
  enabled: boolean;
  instructions: string;
  accountNumber?: string;
  entityCode?: string;
  beneficiaryName?: string;
  phone?: string;
  feePercentage?: number;
}

export interface FinancialSettings {
  fineAmount: number; // MT fixo
  finePercentage?: number; // % sobre a mensalidade
  interestRateDaily: number; // % ao dia
  maxFinePercentage?: number; // teto máximo ex: 25%
  toleranceDays?: number; // dias de tolerância após vencimento
  bankInfo: string;
  pixKey: string;
  dueDay: number;
  beneficiaryName?: string;
  beneficiaryNuit?: string;
  mpesaNumber?: string;
  mpesaShortcode?: string;
  mpesaHolderName?: string;
  mpesaInstructions?: string;
  emolaNumber?: string;
  emolaShortcode?: string;
  emolaHolderName?: string;
  emolaInstructions?: string;
  customServices?: FinancialServiceItem[];
  paymentMethods?: PaymentMethodConfig[];
  familyDiscountPercentage?: number;
  scholarshipDiscountPercentage?: number;
}

export interface InstitutionOfficialModels {
  defaultContractModel?: string;
  defaultDeclarationModel?: string;
  defaultCertificateModel?: string;
}

export interface InstitutionCustomMessages {
  welcomeMessageTemplate?: string;
  dueReminderMessageTemplate?: string;
  overdueMessageTemplate?: string;
  receiptMessageTemplate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[]; // Support for multiple authorized roles
  institutionId: string;
  branchId?: string; // undefined means access to all branches of the institution
  status: 'Ativo' | 'Inativo';
  permissions?: string[];
  preferences?: {
    onboardingCompleted?: boolean;
    theme?: string;
    [key: string]: any;
  };
}

export interface Institution {
  id: string;
  code: string; // e.g. MTW-CF-0001
  name: string;
  type: InstitutionType;
  nuit: string;
  licenseNumber: string;
  representativeName: string;
  representativeRole: string;
  repLegal?: string;
  activeBranches?: number;
  phone: string;
  phoneAlt?: string;
  email: string;
  whatsapp?: string;
  province: string;
  city: string;
  address: string;
  logo?: string;
  logoUrl?: string;
  slogan?: string;
  sigla?: string;
  currency?: string;
  timezone?: string;
  signatureUrl?: string;
  signatoryName?: string;
  signatoryRole?: string;
  stampUrl?: string;
  stampText?: string;
  showStampOnDocuments?: boolean;
  officialModels?: InstitutionOfficialModels;
  customMessages?: InstitutionCustomMessages;
  directorName?: string;
  plan: PlanName | 'Starter' | 'Profissional' | 'Enterprise Multi-Campus' | string;
  subscription?: InstitutionSubscription;
  customLimits?: Partial<PlanLimits>;
  status: 'Ativa' | 'Pendente' | 'Suspensa' | 'Ativo';
  connectedSystem: 'SIGAR' | 'SoftGenial' | 'Outro' | 'Nenhum';
  sivecEnabled: boolean;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  createdAt: string;
  branches?: Branch[];
  financialAccounts?: InstitutionBankAccount[];
  bankAccounts?: any[];
  prefixes?: InstitutionPrefixes;
  financialSettings?: FinancialSettings;
  whatsAppConfig?: WhatsAppConnection;
  whatsappConfig?: any;
  certificateCurrentSequence?: number;
  onlineRegistrationConfig?: OnlineRegistrationConfig;
  enabledModules?: Partial<InstitutionFeatureModules>;
  teacherPermissions?: Partial<TeacherPortalPermissions>;
  studentPermissions?: Partial<StudentPortalPermissions>;
  accessCode?: string;
  ownerEmail?: string;
}

export interface InstitutionFeatureModules {
  secretaria: boolean;
  portal_aluno: boolean;
  portal_professor: boolean;
  portaria: boolean;
  financeiro: boolean;
  pedagogico: boolean;
  certificados: boolean;
  estagios: boolean;
  comunicados: boolean;
  relatorios_academicos: boolean;
  relatorios_administrativos: boolean;
  auditoria: boolean;
}

export interface TeacherPortalPermissions {
  verNotas: boolean;
  lancarNotas: boolean;
  fazerChamada: boolean;
  verPautas: boolean;
  gerarRelatorios: boolean;
  verFinanceiro: boolean;
}

export interface StudentPortalPermissions {
  verPerfil: boolean;
  verNotas: boolean;
  verHorario: boolean;
  verFinanceiro: boolean;
  solicitarDocumentos: boolean;
  verAulasOnline: boolean;
  verEstagio: boolean;
  carteirinhaDigital: boolean;
}

export interface OnlineCourseConfig {
  courseId: string;
  courseName: string;
  category?: string;
  active: boolean;
  price: number; // Taxa de Inscrição / Admissão (MT)
  monthlyFee?: number;
  duration: string; // Ex: "6 Meses (480 Horas)"
  requirements: string[]; // Ex: ["10ª Classe Concluída", "Idade mínima 16 anos"]
  vacancies: number; // Total de vagas
  filledVacancies: number; // Vagas ocupadas
  regimes: ('Laboral' | 'Pós-Laboral' | 'Online EAD' | 'Híbrido')[];
  shifts: string[]; // Ex: ["Manhã", "Tarde", "Noite"]
  documents?: string[];
}

export interface OnlineRegistrationCustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
}

export interface OnlineRegistrationRequiredFields {
  email: boolean;
  phone: boolean;
  documentNumber: boolean;
  birthDate: boolean;
  gender: boolean;
  province: boolean;
  city: boolean;
  address: boolean;
  guardianName: boolean;
  guardianPhone: boolean;
}

export interface OnlineRegistrationConfig {
  institutionId: string;
  isOpen: boolean;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  academicYear: string; // Ex: "2026/2027"
  semester: string;     // Ex: "2º Semestre"
  requiredFields: OnlineRegistrationRequiredFields;
  requiredDocuments: string[];
  customQuestions: OnlineRegistrationCustomQuestion[];
  coursesConfig: OnlineCourseConfig[];
  autoApproveOnPayment: boolean;
  confirmationMessageTemplate: string;
}

export type CourseCategory = 
  | 'Profissional'
  | 'Técnico'
  | 'Curta Duração'
  | 'Máquinas Pesadas'
  | 'Informática'
  | 'Línguas / Inglês'
  | 'Eletricidade'
  | 'Mecânica'
  | 'Logística'
  | 'Operações Portuárias'
  | 'Técnicas Aduaneiras'
  | 'Tecnologia'
  | 'Gestão'
  | 'Saúde'
  | 'Engenharia'
  | string;

export type CourseModality = 
  | 'Presencial' 
  | 'Semi-presencial' 
  | 'Online EAD' 
  | 'Prático em Oficina/Campo'
  | 'Híbrido'
  | string;

export type CoursePeriodType = 
  | 'trimestral'
  | 'semestral'
  | 'anual'
  | 'por_modulo'
  | 'por_etapa'
  | 'intensivo';

export type ModuleEvaluationType = 
  | 'provas_e_exame'
  | 'avaliacao_continua'
  | 'projeto_pratico'
  | 'teste_operacional'
  | 'apenas_frequencia';

export interface CourseModule {
  id: string;
  name: string;
  code: string;
  type: 'modulo' | 'disciplina' | 'unidade' | 'estagio_pratico' | 'etapa';
  period: string; // e.g. "1º Semestre", "Módulo 1", "Trimestre 1", "Etapa Teórica", "Etapa Prática"
  workloadHours: number;
  theoryHours?: number;
  practiceHours?: number;
  teacherName?: string;
  teacherId?: string;
  minGrade: number; // Nota mínima (ex: 10 / 20)
  minAttendance: number; // Frequência mínima (ex: 75%)
  evaluationType: ModuleEvaluationType;
  description?: string;
  order?: number;
}

export type CourseStatus = 'Ativo' | 'Em Planejamento' | 'Inscrições Abertas' | 'Suspenso' | 'Arquivado';

export interface Course {
  id: string;
  institutionId: string;
  branchId?: string;
  name: string;
  code?: string;
  category: CourseCategory;
  description: string;
  duration: string;
  workloadHours?: number;
  theoryHours?: number;
  practiceHours?: number;
  modality?: CourseModality;
  regime?: 'Laboral' | 'Pós-Laboral' | 'Online EAD' | 'Híbrido' | string;
  requirements?: string[];
  price?: number; // Preço total do curso
  registrationFee: number; // Matrícula / Inscrição
  enrollmentFee?: number; // Compatibilidade com matrícula
  monthlyFee?: number; // Mensalidade (0 para cursos sem mensalidade)
  feeMonthly?: number; // Compatibilidade com dados legados
  certificate?: string; // Certificado emitido
  status?: CourseStatus;
  periodType?: CoursePeriodType; // trimestral, semestral, anual, por_modulo, por_etapa
  modules?: CourseModule[]; // Disciplinas / Módulos / Unidades
  totalVacancies?: number;
  filledVacancies?: number;
  highlights?: string[];
  icon?: string;
  image?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
}

export type ClassGroupStatus = 'Planejada' | 'Inscrições Abertas' | 'Em Curso' | 'Concluída' | 'Cancelada';

export interface ClassGroup {
  id: string;
  institutionId: string;
  branchId?: string;
  name: string; // Nome da turma (e.g. Turma ES-2026-A)
  courseId: string; // Curso associado
  courseName: string;
  period?: string; // Período (e.g. "1º Semestre 2026", "Manhã", "Módulo I", "Ciclo 2026")
  shift: 'Manhã' | 'Tarde' | 'Noite (Pós-Laboral)' | 'Sábado';
  schedule?: string; // Horário (e.g. "08:00 - 11:30", "18:00 - 21:30")
  room: string; // Sala / Laboratório
  teacherName: string; // Professor / Formador Titular
  teacherId?: string;
  capacity: number; // Capacidade máxima de formandos
  studentIds?: string[]; // IDs de alunos alocados
  academicYear?: string;
  year?: string | number;
  startDate: string;
  endDate: string;
  status: ClassGroupStatus; // Estado da turma
  notes?: string;
}

export interface StudentClassTransfer {
  id: string;
  institutionId: string;
  branchId?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  fromClassId: string;
  fromClassName: string;
  fromCourseName?: string;
  toClassId: string;
  toClassName: string;
  toCourseName?: string;
  transferDate: string; // YYYY-MM-DD
  reason: string; // Motivo da transferência
  authorizedBy: string; // Responsável / Operador
  notes?: string;
  status?: string;
  keepAcademicRecords?: boolean;
  timestamp?: string;
  createdAt: string;
}

export type StudentStatus = 
  | 'Pré-inscrito'
  | 'Inscrito'
  | 'Matriculado'
  | 'Ativo'
  | 'Em curso'
  | 'Suspenso'
  | 'Transferido'
  | 'Concluído'
  | 'Reprovado'
  | 'Desistente'
  | 'Baixado'
  | 'Cancelado'
  // Compatibilidade com dados anteriores
  | 'Em Análise'
  | 'Aguardando Pagamento';

export const ALL_STUDENT_STATUSES: StudentStatus[] = [
  'Pré-inscrito',
  'Inscrito',
  'Matriculado',
  'Ativo',
  'Em curso',
  'Suspenso',
  'Transferido',
  'Concluído',
  'Reprovado',
  'Desistente',
  'Baixado',
  'Cancelado'
];

export type TerminationReason = 
  | 'Desistência' 
  | 'Transferência' 
  | 'Inadimplência' 
  | 'Mudança de Cidade' 
  | 'Motivos de Saúde' 
  | 'Abandono Escolar'
  | 'Sanção Disciplinar'
  | 'Solicitação do Aluno'
  | 'Outro';

export interface StudentTermination {
  reason: TerminationReason;
  date: string;
  authorizedBy: string;
  authorizedRole?: string;
  notes: string;
  academicSituation: string;
  financialSituation: 'Regularizado' | 'Pendente de Pagamento' | 'Com Saldo Devedor';
  documentGenerated: boolean;
  officialDocumentRef?: string;
  // Garantias de preservação explícita
  historyPreserved?: boolean;
  paymentsPreserved?: boolean;
  gradesPreserved?: boolean;
  attendancePreserved?: boolean;
  documentsPreserved?: boolean;
  // Reativação de processo
  reactivated?: boolean;
  reactivatedAt?: string;
  reactivatedBy?: string;
  reactivationReason?: string;
}

export function getStudentStatusBadgeStyle(status: StudentStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
  dotColor: string;
} {
  switch (status) {
    case 'Pré-inscrito':
      return { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30', label: 'Pré-inscrito', dotColor: 'bg-slate-400' };
    case 'Inscrito':
      return { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30', label: 'Inscrito', dotColor: 'bg-sky-400' };
    case 'Matriculado':
      return { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30', label: 'Matriculado', dotColor: 'bg-blue-400' };
    case 'Ativo':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', label: 'Ativo', dotColor: 'bg-emerald-400' };
    case 'Em curso':
      return { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30', label: 'Em curso', dotColor: 'bg-teal-400' };
    case 'Suspenso':
      return { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', label: 'Suspenso', dotColor: 'bg-amber-400' };
    case 'Transferido':
      return { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30', label: 'Transferido', dotColor: 'bg-purple-400' };
    case 'Concluído':
      return { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30', label: 'Concluído', dotColor: 'bg-indigo-400' };
    case 'Reprovado':
      return { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30', label: 'Reprovado', dotColor: 'bg-rose-400' };
    case 'Desistente':
      return { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30', label: 'Desistente', dotColor: 'bg-orange-400' };
    case 'Baixado':
      return { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-700/50', label: 'Baixado', dotColor: 'bg-rose-500' };
    case 'Cancelado':
      return { bg: 'bg-zinc-800/80', text: 'text-zinc-400', border: 'border-zinc-700/50', label: 'Cancelado', dotColor: 'bg-zinc-500' };
    case 'Em Análise':
      return { bg: 'bg-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-500/30', label: 'Em Análise', dotColor: 'bg-yellow-400' };
    case 'Aguardando Pagamento':
      return { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', label: 'Aguardando Pagamento', dotColor: 'bg-amber-400' };
    default:
      return { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30', label: status, dotColor: 'bg-slate-400' };
  }
}

export interface AssessmentRecord {
  id: string;
  title: string; // e.g. Teste 1, Trabalho Prático, Exame
  moduleName: string;
  weight: number; // percentage
  maxScore: number;
  score: number;
  date: string;
  teacher: string;
}

// ==========================================================
// 17. MOTOR DE AVALIAÇÕES E FÓRMULAS DE CÁLCULO
// ==========================================================
export type AssessmentType = 
  | 'teste'
  | 'exame'
  | 'trabalho'
  | 'projeto'
  | 'pratica'
  | 'participacao'
  | 'avaliacao_continua'
  | 'prova_final'
  | 'defesa';

export const ASSESSMENT_TYPE_METADATA: Record<AssessmentType, {
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}> = {
  teste: {
    label: 'Teste Teórico / Escrito',
    shortLabel: 'Teste',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    description: 'Avaliação escrita individual sobre a matéria teórica'
  },
  exame: {
    label: 'Exame Normal / Semestral',
    shortLabel: 'Exame',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    description: 'Prova global formal de fim de semestre/ano'
  },
  trabalho: {
    label: 'Trabalho Individual / Grupo',
    shortLabel: 'Trabalho',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    description: 'Pesquisas, relatórios e tarefas extraclasse'
  },
  projeto: {
    label: 'Projeto Integrador / Prático',
    shortLabel: 'Projeto',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    description: 'Desenvolvimento de solução ou protótipo funcional'
  },
  pratica: {
    label: 'Avaliação Prática / Laboratório',
    shortLabel: 'Prática',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    description: 'Execução de rotinas e ensaios práticos em oficina ou lab'
  },
  participacao: {
    label: 'Participação & Assiduidade',
    shortLabel: 'Participação',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    description: 'Engajamento nas aulas, pontualidade e debates'
  },
  avaliacao_continua: {
    label: 'Avaliação Contínua (AC)',
    shortLabel: 'Av. Contínua',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    description: 'Conjunto contínuo de fichas, mini-testes e acompanhamento'
  },
  prova_final: {
    label: 'Prova Final / Global',
    shortLabel: 'Prova Final',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    description: 'Avaliação culminante do ciclo de formação'
  },
  defesa: {
    label: 'Defesa / Apresentação Oral',
    shortLabel: 'Defesa',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    description: 'Apresentação oral e sustentação perante banca examinadora'
  }
};

export interface EvaluationItem {
  id: string;
  institutionId: string;
  branchId?: string;
  classGroupId: string;
  classGroupName?: string;
  name: string; // nome da avaliação
  type: AssessmentType; // teste, exame, trabalho, etc.
  discipline: string; // disciplina
  period: string; // período: e.g. "1º Trimestre", "Semestre 1", "Módulo I"
  weight: number; // peso percentual ou proporcional (ex: 40 para 40%)
  maxScore: number; // nota máxima (padrão 20)
  date: string; // data
  teacher: string; // professor
  formulaId?: string; // id da fórmula vinculada
  description?: string;
  status: 'agendada' | 'em_lancamento' | 'concluida' | 'homologada';
  scores: Record<string, {
    studentId: string;
    studentName?: string;
    score: number; // nota obtida
    maxScore?: number;
    notes?: string;
    updatedAt?: string;
    gradedBy?: string;
  }>;
  createdAt: string;
}

export interface CalculationFormulaComponent {
  id: string;
  type: AssessmentType;
  label?: string; // e.g. "Avaliação Contínua" ou "Exame"
  weight: number; // e.g. 40 para 40%, 60 para 60%
  minScore?: number; // nota mínima exigida no componente (ex: 7 para não chumbar)
  required?: boolean;
}

export interface CalculationFormula {
  id: string;
  institutionId: string;
  name: string; // Ex: "Regulamento Padrão: Avaliação Contínua 40% + Exame 60%"
  description: string;
  discipline?: string; // opcional: aplicável a disciplina específica ou geral
  classGroupId?: string; // opcional: aplicável a turma específica ou geral
  period?: string;
  components: CalculationFormulaComponent[];
  minPassingScore: number; // padrão 10.0 valores
  examExemptionScore: number; // padrão 14.0 valores (dispensa)
  recourseMinScore?: number; // padrão 7.0 valores
  isDefault: boolean;
  createdAt: string;
}

export interface StudentCalculatedGrade {
  studentId: string;
  studentName: string;
  studentCode: string;
  finalScore: number; // nota final calculada automaticamente (0 a 20)
  status: 'Aprovado' | 'Dispensado' | 'Recurso' | 'Reprovado';
  componentScores: Record<string, {
    type: AssessmentType;
    label: string;
    weight: number;
    averageScore: number; // média obtida nesse componente
    weightedContribution: number; // contribuição para a nota final (ex: 15 * 0.4 = 6.0)
    count: number;
  }>;
  assessmentsList: {
    id: string;
    name: string;
    type: AssessmentType;
    score: number;
    maxScore: number;
    weight: number;
  }[];
}

// ==========================================================
// 18. PAUTAS ACADÊMICAS
// ==========================================================
export type PautaScopeType = 
  | 'por_avaliacao' 
  | 'trimestral' 
  | 'semestral' 
  | 'final' 
  | 'por_turma' 
  | 'por_curso';

export type PautaSituacao = 'APROVADO' | 'REPROVADO' | 'EM CURSO' | 'PENDENTE';

export interface PautaGradeOverride {
  studentId: string;
  previousSituation: PautaSituacao;
  newSituation: PautaSituacao;
  justification: string;
  authorizedBy: string;
  authorizedRole: string;
  authorizedAt: string;
}

export interface PautaHomologationRecord {
  id: string;
  institutionId: string;
  branchId?: string;
  pautaKey: string; // classGroupId + '_' + (discipline || 'todas') + '_' + scope
  scope: PautaScopeType;
  classGroupId?: string;
  classGroupName?: string;
  courseId?: string;
  courseName?: string;
  discipline?: string;
  period?: string;
  status: 'PENDENTE' | 'HOMOLOGADA' | 'REJEITADA';
  homologatedBy?: string;
  homologatedRole?: string;
  homologatedAt?: string;
  approvalNotes?: string;
  overriddenStudents?: Record<string, PautaGradeOverride>;
}

// ==========================================================
// 19. BOLETIM PROFISSIONAL
// ==========================================================
export interface BoletimDisciplineItem {
  disciplineId: string;
  disciplineName: string;
  code?: string;
  workloadHours?: number;
  teacherName?: string;
  evaluations: {
    label: string;
    score: number;
    maxScore: number;
    weight: number;
  }[];
  finalAverage: number; // 0 a 20
  attendancePercentage: number;
  totalClasses: number;
  totalAbsences: number;
  situation: PautaSituacao | 'DISPENSADO';
  observations?: string;
}

export interface BoletimProfissional {
  id: string;
  institutionId: string;
  branchId?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  documentNumber: string; // BI
  birthDate?: string;
  photoUrl?: string;
  courseId: string;
  courseName: string;
  courseCode?: string;
  classGroupId: string;
  classGroupName: string;
  academicYear: string;
  periodType: string; // "1º Trimestre", "1º Semestre", "Anual"
  periodLabel: string;
  disciplines: BoletimDisciplineItem[];
  globalAverage: number; // 0 a 20
  globalAttendancePercentage: number;
  overallSituation: PautaSituacao;
  teacherSignature: {
    name: string;
    signed: boolean;
    signedAt?: string;
  };
  pedagogicSignature: {
    name: string;
    role: string;
    signed: boolean;
    signedAt?: string;
  };
  directorSignature: {
    name: string;
    role: string;
    signed: boolean;
    signedAt?: string;
  };
  officialStamp: {
    institutionName: string;
    branchName?: string;
    registrationNumber: string;
    date: string;
    securitySeal: string;
    verificationQrCode: string;
  };
  issuedAt: string;
}

// ==========================================================
// 20. MÓDULO DE ESTÁGIOS
// ==========================================================
export type InternshipStatus = 
  | 'pendente' 
  | 'procurando' 
  | 'atribuído' 
  | 'em andamento' 
  | 'concluído' 
  | 'cancelado';

export interface InternshipEvaluation {
  score: number; // 0 a 20 valores
  attendanceScore: number; // 0 a 20 valores (assiduidade e pontualidade)
  technicalSkillsScore: number; // 0 a 20 valores (competências técnicas práticas)
  professionalConductScore: number; // 0 a 20 valores (postura, iniciativa e ética)
  technicalFeedback: string; // Parecer técnico circunstanciado
  recommendation: 'Aprovado com Distinção' | 'Aprovado' | 'Reprovado' | 'Pendente';
  evaluatedByCompanySupervisor: boolean;
  companySupervisorName: string;
  academicSupervisorName: string;
  evaluationDate: string;
}

export type InternshipDocumentType = 
  | 'termo_compromisso' 
  | 'carta_apresentacao' 
  | 'ficha_avaliacao' 
  | 'declaracao_conclusao';

export interface InternshipContract {
  id: string;
  institutionId: string;
  branchId?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentDocumentNumber?: string;
  studentPhone?: string;
  studentEmail?: string;
  courseId: string;
  courseName: string;
  classGroupId?: string;
  classGroupName?: string;
  company: {
    name: string; // Empresa
    nuit?: string;
    sector?: string; // Área de atuação
    contactPerson?: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    province?: string;
  };
  supervisor: {
    companySupervisor: string; // Supervisor na empresa
    companySupervisorRole?: string;
    companySupervisorPhone?: string;
    companySupervisorEmail?: string;
    academicSupervisor: string; // Orientador do centro
    academicSupervisorPhone?: string;
  };
  startDate: string; // Início
  endDate: string; // Fim
  workloadHours: number; // Carga horária
  location: string; // Local (instalações, departamento, posto)
  activities: string; // Atividades a desempenhar
  evaluation?: InternshipEvaluation; // Avaliação de desempenho
  status: InternshipStatus;
  generatedDocuments?: {
    termoCompromissoDate?: string;
    cartaApresentacaoDate?: string;
    fichaAvaliacaoDate?: string;
    declaracaoConclusaoDate?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// Compatibilidade
export interface InternshipRecord {
  companyName: string;
  supervisor: string;
  role: string;
  startDate: string;
  endDate: string;
  status: 'A Decorrer' | 'Concluído' | 'Previsto';
  evaluationScore?: number; // 0-20
}

export interface StudentAttachedDocument {
  id: string;
  name: string;
  type: 'BI' | 'Certificado de Habilitações' | 'NUIT' | 'Fotografia' | 'Termo de Matrícula' | 'Atestado Médico' | 'Outro';
  url: string;
  size: string;
  uploadDate: string;
  status: 'Verificado' | 'Pendente' | 'Rejeitado';
}

export interface StudentAuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface StudentHistoryEvent {
  id: string;
  date: string;
  title: string;
  category: 'matrícula' | 'acadêmico' | 'financeiro' | 'disciplinar' | 'estágio' | 'certificação' | 'baixa';
  description: string;
  recordedBy: string;
}

export interface StudentReceiptRecord {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  description: string;
  paymentMethod: 'Dinheiro' | 'M-Pesa' | 'e-Mola' | 'POS' | 'Transferência';
  status: 'Emitido' | 'Cancelado';
  qrVerificationCode: string;
}

export interface StudentNotice {
  id: string;
  title: string;
  date: string;
  priority: 'alta' | 'média' | 'informativa';
  content: string;
  author: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'alta' | 'média' | 'baixa';
  assignedTo: string;
  category: 'Acadêmico' | 'Secretaria' | 'Financeiro' | 'Certificados' | 'Estágios';
  completed: boolean;
}

export interface Student {
  id: string;
  institutionId: string;
  branchId?: string;
  code: string; // e.g. MTW-AL-2026-1042
  fullName: string;
  socialName?: string;
  documentType: 'BI' | 'Passaporte' | 'DIRE';
  documentNumber: string;
  nuit?: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'Masculino' | 'Feminino' | 'Outro';
  phone: string;
  whatsapp?: string;
  email: string;
  province: string;
  city: string;
  neighborhood?: string;
  address: string;
  guardianName?: string;
  guardianPhone?: string;
  emergencyContact: string;
  notes?: string;
  courseId: string;
  courseName: string;
  classGroupId: string;
  classGroupName: string;
  regime: string;
  status: StudentStatus;
  enrollmentDate: string;
  photoUrl: string;
  paymentStatus: 'Pago' | 'Pendente' | 'Atrasado';
  balanceOwing: number; // in MZN
  attendancePercentage: number;
  averageGrade: number; // 0-20
  assessments: AssessmentRecord[];
  internship?: InternshipRecord;
  termination?: StudentTermination;
  attachedDocuments?: StudentAttachedDocument[];
  auditTrail?: StudentAuditEntry[];
  historyEvents?: StudentHistoryEvent[];
  receipts?: StudentReceiptRecord[];
  avatar?: string;
  studentNumber?: string;
  classId?: string;
  className?: string;
  createdAt?: string;
  documents?: any[];
  userId?: string;
  finalGrade?: number;
  gradeAverage?: number;
  attendanceRate?: number;
  unexcusedAbsences?: number;
  branchName?: string;
}

// ==========================================================
// 21. MÓDULO DE CONTRATOS & TERMOS OFICIAIS
// ==========================================================
export type ContractStatus = 'ativo' | 'encerrado' | 'cancelado' | 'renovado';

export interface ContractTemplateVersion {
  version: string; // Ex: "v1.0", "v1.1", "v2.0"
  title: string;
  content: string;
  savedAt: string;
  savedBy: string;
  changeNotes?: string;
}

export interface ContractTemplate {
  id: string;
  institutionId?: string;
  name: string;
  type: 'matricula' | 'formacao' | 'estagio' | 'prestacao_servicos' | 'responsabilidade' | string;
  title: string;
  content: string; // Markdown / Plain text with variables {{nome_aluno}}, {{curso}}, {{turma}}, {{valor}}, {{data}}, {{duracao}}, {{instituicao}}, {{diretor}}
  version: string; // Versão atual ativa
  updatedAt: string;
  createdAt?: string;
  author?: string;
  isDefault: boolean;
  versionHistory: ContractTemplateVersion[]; // Não apagar versões anteriores!
  description?: string;
}

export interface ContractStatusHistoryEntry {
  id: string;
  status: ContractStatus;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export interface ContractSignatureDetails {
  signed: boolean;
  signerName: string;
  signedAt?: string;
  signatureDataUrl?: string; // Desenho da rubrica / assinatura em canvas
  documentNumber?: string;
  role?: string;
  hasStamp?: boolean;
}

export interface GeneratedContract {
  id: string;
  institutionId: string;
  branchId?: string;
  templateId: string;
  templateName: string;
  templateVersion: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentDocumentNumber?: string;
  courseId?: string;
  courseName: string;
  classGroupId?: string;
  classGroupName: string;
  value: number; // {{valor}}
  valueFormatted: string;
  duration: string; // {{duracao}}
  date: string; // {{data}}
  institutionName: string; // {{instituicao}}
  directorName: string; // {{diretor}}
  referenceNumber: string; // ex: CFTPM-CTR-2026-0042
  content: string; // Contrato final compilado com variáveis preenchidas
  status: ContractStatus; // ativo | encerrado | cancelado | renovado
  statusHistory: ContractStatusHistoryEntry[];
  signedByStudent: boolean;
  signedByDirector: boolean;
  signatures: {
    student: ContractSignatureDetails;
    director: ContractSignatureDetails;
  };
  generatedDate: string;
  renewalOfContractId?: string; // ID do contrato anterior se este for uma renovação
  renewedByContractId?: string; // ID do novo contrato se este tiver sido renovado
  cancellationReason?: string;
  closureReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentSignature {
  role: 'Director' | 'Formador' | 'Coordenador';
  name: string;
  title: string;
  signed: boolean;
  signedAt?: string;
  signatureUrl?: string;
  digitalSeal: string;
}

export interface DocumentStudioItem {
  id: string;
  title: string;
  type: 'certificado' | 'diploma' | 'cracha' | 'declaracao' | 'pauta' | 'contrato';
  format: 'A4_Horizontal' | 'A4_Vertical' | 'ID_Card';
  styleTheme: 'classico_dourado' | 'moderno_tech' | 'institucional_azul' | 'minimalista';
  signatures: DocumentSignature[];
  showQrCode: boolean;
  showStamp: boolean;
  studentId?: string;
  recipientName: string;
  courseName: string;
  documentNumber: string;
  issueDate: string;
  gradeText: string;
  hours: number;
}

export type PaymentMethod = 'mpesa' | 'emola' | 'ponto24' | 'banco';

export interface PaymentTransaction {
  id: string;
  registrationCode: string;
  candidateName: string;
  courseName: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'concluido' | 'pendente' | 'processando' | 'falhou';
  referenceNumber: string;
  phoneNumber?: string;
  timestamp: string;
  receiptUrl?: string;
}

export type CandidateStatus = 
  | 'Pendente' 
  | 'Em Análise' 
  | 'Aprovada' 
  | 'Rejeitada' 
  | 'Matriculado' 
  | 'Aguardando Pagamento' 
  | 'Concluída';

export interface CandidateCustomAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface CandidateAttachedDoc {
  id: string;
  name: string;
  type: string;
  fileName: string;
  fileSize: string;
  url?: string;
  verified: boolean;
  uploadedAt: string;
}

export interface RegistrationApplication {
  id: string;
  institutionId: string;
  branchId?: string;
  code: string; // e.g. SIGAR-MZ-2026-8941 ou CAND-2026-8941
  fullName: string;
  documentType: 'BI' | 'Passaporte' | 'DIRE';
  documentNumber: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  address?: string;
  birthDate: string;
  gender: 'Masculino' | 'Feminino';
  guardianName?: string;
  guardianPhone?: string;
  courseId: string;
  courseName: string;
  regime: string;
  shift?: string;
  status: CandidateStatus;
  photoUrl: string;
  createdAt: string;
  paymentStatus: 'Pago' | 'Pendente';
  paymentReference: string;
  paymentAmount?: number;
  paymentMethod?: string;
  customAnswers?: CandidateCustomAnswer[];
  documents?: CandidateAttachedDoc[];
  rejectionReason?: string;
  analysisNotes?: string;
  analyzedBy?: string;
  analyzedAt?: string;
  convertedStudentId?: string;
  convertedStudentCode?: string;
  convertedAt?: string;
  convertedClassId?: string;
  convertedClassName?: string;
  confirmationSent?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    sentAt: string;
    recipientPhone: string;
    recipientEmail: string;
  };
}

export interface CertificateData {
  id: string;
  institutionId: string;
  branchId?: string;
  code: string; // MTW-CERT-2026-9021
  studentName: string;
  documentNumber: string;
  courseName: string;
  durationHours: number;
  grade: string;
  issueDate: string;
  validationUrl: string;
  directorName: string;
  pedagogicDirector: string;
  authHash: string;
  category: string;
  status?: string;
  studentId?: string;
}

export interface LiveNotification {
  id: string;
  institutionId?: string;
  branchId?: string;
  title: string;
  message: string;
  type: 'payment' | 'registration' | 'certificate' | 'system' | 'birthday' | 'academic' | 'warning' | 'alert' | 'task' | 'announcement' | string;
  timestamp: string;
  read: boolean;
  actionText?: string;
  actionRoute?: AppRoute;
  metadata?: {
    code?: string;
    amount?: number;
    name?: string;
    phone?: string;
    taskId?: string;
    announcementId?: string;
  };
}

export type AppRoute = 
  | 'moztechwave_core'
  | 'public_portal'
  | 'inscricao_publica'
  | 'inscricao_privada'
  | 'candidatos_gestao'
  | 'cursos_gestao'
  | 'super_admin'
  | 'admin_dashboard'
  | 'admin_cadastrar'
  | 'admin_instituicoes'
  | 'centro_dashboard'
  | 'alunos_list'
  | 'alunos_gestao'
  | 'alunos_cadastrar'
  | 'alunos_perfil'
  | 'turmas_gestao'
  | 'horarios_calendario'
  | 'professores_gestao'
  | 'portal_professor'
  | 'diario_professor'
  | 'aulas_frequencia'
  | 'avaliacoes'
  | 'pautas'
  | 'boletim'
  | 'estagios'
  | 'financeiro'
  | 'financeiro_modulo29'
  | 'financial_manager'
  | 'caixa_escolar'
  | 'pagamentos'
  | 'relatorios_financeiros'
  | 'contratos'
  | 'contratos_editor'
  | 'assinaturas'
  | 'certificados'
  | 'carteirinhas'
  | 'aluno_qrcode'
  | 'controlo_entrada'
  | 'studio'
  | 'studio_editor'
  | 'sivec_verify'
  | 'sivec_connect'
  | 'sivec_pass'
  | 'sivec_studio'
  | 'public_verify'
  | 'sivec_verify_public'
  | 'portaria_acesso'
  | 'automacoes'
  | 'whatsapp_center'
  | 'portal_aluno'
  | 'aulas_online'
  | 'configuracoes_filiais'
  | 'rbac_matrix'
  | 'moztechwave_ai'
  | 'tarefas'
  | 'tarefas_gestao'
  | 'calendario_geral'
  | 'calendario'
  | 'comunicados'
  | 'relatorios_academicos'
  | 'relatorios_administrativos'
  | 'relatorios_admin'
  | 'auditoria'
  | 'storage_gestao'
  | 'backup_recuperacao'
  | 'configuracoes_instituicao'
  | 'configuracoes_financeiras'
  | 'sistema_planos'
  | 'planos_gestao'
  | 'integracoes_futuras'
  | 'integracoes_hub'
  | 'principio_fundamental'
  | 'estrutura_pastas'
  | 'regras_desenvolvimento'
  | 'migracao_dados'
  | 'superioridade_integrada'
  | 'fluxo_conclusao'
  | 'fluxo_pagamento'
  | 'fluxo_sivec'
  | 'experiencia_superadmin'
  | 'experiencia_diretor'
  | 'experiencia_secretaria'
  | 'experiencia_financeiro'
  | 'experiencia_professor'
  | 'experiencia_aluno'
  | 'experiencia_porteiro'
  | 'experiencia_empresa'
  | 'mozcoin_wallet'
  | 'mozcoin_comprar'
  | 'mozcoin_aprovacao'
  | 'moztechwave_id'
  | 'superadmin_dashboard'
  | 'dashboard'
  | 'alunos'
  | 'secretaria'
  | 'cursos'
  | 'turmas'
  | 'docentes'
  | 'presencas'
  | 'boletins'
  | 'whatsapp'
  | 'portaria'
  | 'sala_online'
  | 'sivec_portal'
  | 'moztechwave_ia';

// Cash Register (Caixa Escolar - Módulo 33)
export type CashMovementType = 'entrada' | 'saida' | 'sangria' | 'reforco' | 'transferencia';

export interface CashTransaction {
  id: string;
  institutionId: string;
  branchId?: string;
  type: CashMovementType;
  amount: number;
  description: string;
  reason?: string; // Motivo do lançamento
  timestamp: string; // ISO
  date?: string; // dd/mm/aaaa
  time?: string; // hh:mm:ss
  category: string;
  operator: string; // Utilizador responsável
  paymentMethod: 'Dinheiro' | 'M-Pesa' | 'e-Mola' | 'POS' | 'Transferência';
  studentName?: string;
  documentRef?: string; // Referência (Recibo, Fatura, Talão, Guia)
  targetAccount?: string; // Destino de transferência (ex: Conta Millennium BIM ou Caixa 2)
  notes?: string; // Observações adicionais
}

export interface CashRegisterSession {
  id: string;
  institutionId: string;
  branchId?: string;
  operator: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number; // Saldo inicial
  initialBalance?: number; // Alias para compatibilidade
  currentBalance: number;
  expectedBalance?: number; // Saldo esperado calculado pelo sistema
  reportedBalance?: number; // Saldo informado / contagem física no fecho
  differenceAmount?: number; // Diferença / Quebra de caixa (informado - esperado)
  status: 'aberto' | 'fechado';
  transactions: CashTransaction[];
  closingNotes?: string; // Observações do fecho
  totalEntradas?: number;
  totalCashIn?: number; // Alias para compatibilidade
  totalSaidas?: number;
  totalSangrias?: number;
  totalReforcos?: number;
  totalTransferencias?: number;
}

// Teachers / Formadores (Professores e Formadores Técnicos)
export interface TeacherDocument {
  id: string;
  name: string;
  type: 'bi' | 'curriculo' | 'diploma' | 'certificado' | 'contrato' | 'outro';
  url: string;
  uploadedAt: string;
  size?: string;
}

export interface Teacher {
  id: string;
  institutionId: string;
  branchId?: string;
  code: string;
  fullName: string;
  name?: string;
  type?: 'professor' | 'formador';
  photoUrl?: string;
  phone: string;
  email: string;
  academicDegree: string; // Formação (ex: Licenciatura, Mestrado, Técnico Superior)
  specialty: string; // Especialidade (ex: Engenharia de Software, Cibersegurança, Automação)
  status: 'Ativo' | 'Inativo' | 'Licença';
  biNumber?: string;
  hireDate?: string;
  biography?: string;
  
  // Atribuições Pedagógicas
  courseIds: string[];
  courseNames?: string[];
  disciplineIds: string[];
  disciplineNames: string[];
  classGroupIds: string[];
  classGroupNames?: string[];
  
  // Documentos Anexados (BI, CV, Diploma, Certificados, etc.)
  documents: TeacherDocument[];

  createdAt: string;
  updatedAt?: string;
}

// Lessons & Attendance (16. AULAS E FREQUÊNCIA)
export type AttendanceStatus = 'presente' | 'ausente' | 'atraso' | 'justificado';

export interface LessonAttendanceAuditLog {
  id: string;
  lessonId: string;
  lessonTitle: string;
  classGroupId: string;
  classGroupName: string;
  disciplineName: string;
  studentId: string;
  studentName: string;
  studentCode?: string;
  previousStatus?: AttendanceStatus | string;
  newStatus: AttendanceStatus;
  reason?: string; // Motivo da correção ou alteração
  actorName: string;
  actorRole: string;
  actorEmail?: string;
  timestamp: string;
  actionType: 'registro_inicial' | 'marcar_todos_presentes' | 'correcao' | 'desbloqueio';
}

export interface LessonMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'zip' | 'doc' | 'slides' | 'link' | 'video' | 'outro';
  url: string;
  size?: string;
  fileName?: string;
  uploadedAt?: string;
}

export interface ClassLesson {
  id: string;
  institutionId: string;
  branchId?: string;
  date: string;                     // data
  time?: string;                     // hora formatada (ex: "08:00 - 10:00")
  startTime?: string;               // hora de início
  endTime?: string;                 // hora de término
  disciplineId?: string;
  disciplineName: string;           // disciplina
  classGroupId: string;             // turma
  classGroupName: string;
  courseId?: string;
  courseName?: string;
  teacherId?: string;
  teacherName: string;              // professor
  title: string;
  description: string;              // descrição
  content?: string;                 // conteúdo programático lecionado
  materials: LessonMaterial[];      // materiais anexados
  attendances: { [studentId: string]: AttendanceStatus | boolean }; // Presença: presente, ausente, atraso, justificado
  attendanceNotes?: { [studentId: string]: string }; // Notas específicas por aluno (ex: motivo do atraso/justificativa)
  isAttendanceLocked?: boolean;     // Trava da chamada (correção mediante permissão)
  attendanceFinalizedAt?: string;
  attendanceFinalizedBy?: string;
  auditLogs?: LessonAttendanceAuditLog[]; // Auditoria da chamada
  totalPresent?: number;
  totalAbsent?: number;
  totalLate?: number;
  totalJustified?: number;
  onlineMeetingUrl?: string;        // Link da aula online ao vivo
  isLiveOnline?: boolean;
  status?: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
  createdAt?: string;
  updatedAt?: string;
}

// Access Control & Gate Pass (Portaria / Controlo de Entrada e Saída)
export interface GateAccessLog {
  id: string;
  institutionId: string;
  institutionName?: string;
  branchId?: string;
  location?: string; // Local da portaria (Ex: Portão Principal, Portaria Sul, Recepção Central)
  studentId: string;
  studentCode: string;
  studentName: string;
  courseName: string;
  classGroupName?: string;
  photoUrl: string;
  guardianPhone: string;
  guardianName: string;
  date?: string; // Data (Ex: 16/09/2026)
  time?: string; // Hora (Ex: 11:19:08)
  timestamp: string;
  type: 'entrada' | 'saida';
  operator: string;
  operatorRole?: string;
  whatsappStatus: 'enviado' | 'pendente' | 'falhou';
  notificationSent?: boolean;
  notificationMessage?: string;
  confirmed: boolean;
}

// WhatsApp Device Connection & Integration Layer
export type WhatsAppConnectionStatus = 'conectado' | 'desconectado' | 'aguardando_qr' | 'pareando_codigo';

export interface WhatsAppConnection {
  institutionId: string;
  status: WhatsAppConnectionStatus;
  instanceName?: string;
  phoneNumber?: string;
  isConnected?: boolean;
  qrCodeUrl?: string;
  pairingCode?: string;
  pairingCodeExpiresAt?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  deviceModel?: string;
  dailyMessagesSent: number;
  dailyLimit?: number;
  minDelaySeconds?: number;
  maxDelaySeconds?: number;
  allowedStartHour?: number;
  allowedEndHour?: number;
  appendOptOutNotice?: boolean;
  optOutText?: string;
  lastSync?: string;
  connectedAt?: string;
  authorizedBy?: string;
}

export type WhatsAppTemplateCategory = 
  | 'cobranca' 
  | 'aniversario' 
  | 'aviso' 
  | 'confirmacao_pagamento' 
  | 'documento' 
  | 'frequencia' 
  | 'entrada_saida' 
  | 'comunicacao_curso' 
  | 'geral';

export interface WhatsAppMessageTemplate {
  id: string;
  institutionId: string;
  name: string;
  category: WhatsAppTemplateCategory;
  body?: string;
  content: string;
  header?: string;
  variables: string[];
  isSystemDefault?: boolean;
  updatedAt: string;
}

export type WhatsAppCampaignStatus = 'rascunho' | 'agendado' | 'enviando' | 'concluido' | 'cancelado';

export interface WhatsAppCampaign {
  id: string;
  institutionId: string;
  title: string;
  category: WhatsAppTemplateCategory;
  templateId?: string;
  messageText: string;
  targetAudience: 'todos_alunos' | 'todos' | 'inadimplentes' | 'curso' | 'turma' | 'aniversariantes' | 'professores' | 'encarregados' | 'personalizado' | 'turma_especifica';
  targetFilter?: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: WhatsAppCampaignStatus;
  createdAt: string;
  scheduledFor?: string;
  completedAt?: string;
}

export type WhatsAppTriggerType = 
  | 'cobranca_preventiva' 
  | 'cobranca_vencido' 
  | 'cobranca_vencendo'
  | 'aniversario_dia' 
  | 'confirmacao_pagamento' 
  | 'pagamento_confirmado'
  | 'entrada_saida_portaria' 
  | 'portaria_entrada'
  | 'portaria_saida'
  | 'frequencia_baixa' 
  | 'falta_registrada'
  | 'documento_pronto' 
  | 'comunicacao_curso_inicio'
  | 'comunicado_geral';

export interface WhatsAppAutomationRule {
  id: string;
  institutionId: string;
  title: string;
  description?: string;
  triggerType: WhatsAppTriggerType;
  category?: WhatsAppTemplateCategory;
  enabled: boolean;
  templateId?: string;
  customMessage?: string;
  executionHour?: string;
  executionScheduleTime?: string;
  daysOffset?: number;
  lastExecutedAt?: string;
  totalTriggeredCount: number;
}

export interface WhatsAppMessageLog {
  id: string;
  institutionId: string;
  recipientName: string;
  recipientPhone: string;
  recipientType: 'aluno' | 'encarregado' | 'professor' | 'funcionario' | 'outro';
  category: WhatsAppTemplateCategory;
  message: string;
  status: 'enviado' | 'entregue' | 'lido' | 'falha' | 'bloqueado_politica' | 'opt_out';
  sentAt: string;
  source: 'manual' | 'campanha' | 'automacao' | 'portaria' | 'tesouraria';
  documentAttachment?: {
    name: string;
    type: string;
    url?: string;
  };
  errorReason?: string;
}

export interface WhatsAppConsentRecord {
  id: string;
  institutionId: string;
  phone: string;
  name: string;
  optIn: boolean;
  updatedAt: string;
  reason?: string;
}

// ==========================================
// 13. HORÁRIOS & CALENDÁRIO COM DETECÇÃO DE CONFLITOS
// ==========================================
export type DayOfWeekNumber = 1 | 2 | 3 | 4 | 5 | 6 | 0; // 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb, 0 = Dom

export interface ClassScheduleSlot {
  id: string;
  institutionId: string;
  branchId?: string;
  classGroupId: string;         // turma
  classGroupName: string;
  courseId: string;             // curso
  courseName: string;
  disciplineId?: string;        // disciplina / módulo
  disciplineName: string;       // disciplina
  teacherId?: string;
  teacherName: string;          // professor
  room: string;                 // sala
  dayOfWeek: DayOfWeekNumber;   // dia da semana (1 a 6)
  date?: string;                // YYYY-MM-DD para aula específica
  startTime: string;            // HH:mm (e.g. "08:00")
  endTime: string;              // HH:mm (e.g. "10:00")
  durationMinutes: number;      // duração em minutos (e.g. 60, 90, 120, 180, 240)
  status: 'Agendada' | 'Em Andamento' | 'Realizada' | 'Cancelada';
  recurrence: 'semanal' | 'unica' | 'quinzenal';
  color?: string;
  notes?: string;
  createdAt?: string;
}

export type ScheduleConflictType = 'teacher' | 'room' | 'classGroup';

export interface ScheduleConflict {
  type: ScheduleConflictType;
  title: string;
  message: string;
  conflictingSlot?: ClassScheduleSlot;
  severity: 'bloqueante' | 'aviso';
}

export interface ConflictDetectionResult {
  hasConflict: boolean;
  conflicts: ScheduleConflict[];
}

// ==========================================
// 36. MÓDULO DE TAREFAS
// ==========================================
export type TaskState = 'pendente' | 'em andamento' | 'concluído' | 'cancelado' | 'concluida' | 'em_andamento';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente' | 'urgent' | 'low' | 'medium' | 'high';
export type TaskNoteVisibility = 'privada' | 'autorizados';

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  visibility: TaskNoteVisibility;
  authorizedRoles?: string[];
}

export interface TaskItem {
  id: string;
  institutionId: string;
  branchId?: string;
  title: string;
  description: string;
  assigneeName: string;
  assigneeRole?: string;
  assigneeAvatar?: string;
  priority: TaskPriority;
  dueDate: string;
  dueTime?: string;
  state: TaskState;
  status?: TaskState;
  category?: string;
  attachments: TaskAttachment[];
  notes: TaskNote[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ==========================================
// 37. MÓDULO DE CALENDÁRIO GERAL
// ==========================================
export type CalendarCategoryType = 
  | 'aula' 
  | 'avaliacao' 
  | 'reuniao' 
  | 'tarefa' 
  | 'evento' 
  | 'pagamento' 
  | 'aniversario' 
  | 'estagio';

export interface CalendarEventBase {
  id: string;
  institutionId: string;
  branchId?: string;
  category: CalendarCategoryType;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD (para eventos de múltiplos dias)
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  location?: string;  // sala, auditório, link online, etc.
  allDay?: boolean;
  color?: string;
  
  // Vínculos com utilizadores e entidades
  userId?: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  
  // Metadados adicionais específicos
  classGroupId?: string;
  classGroupName?: string;
  courseName?: string;
  disciplineName?: string;
  amount?: number; // Para pagamentos
  status?: string; // e.g. "pendente", "concluido", "agendada", "pago"
  priority?: 'baixa' | 'media' | 'alta' | 'urgente';
  targetRoute?: AppRoute; // Para navegar direto ao módulo de origem
  targetId?: string;
  sourceModule?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarCustomEvent {
  id: string;
  institutionId: string;
  branchId?: string;
  category: CalendarCategoryType;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  allDay?: boolean;
  assignedUserId?: string;
  assignedUserName?: string;
  assignedUserRole?: string;
  priority?: 'baixa' | 'media' | 'alta' | 'urgente';
  status?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 50. COMUNICADOS (Módulo de Comunicados Institucionais)
export type AnnouncementType = 
  | 'aviso'
  | 'reuniao'
  | 'mudanca_horario'
  | 'pagamento'
  | 'feriado'
  | 'evento';

export type AnnouncementTarget = 
  | 'todos'
  | 'curso'
  | 'turma'
  | 'professor'
  | 'aluno'
  | 'responsaveis';

export type AnnouncementStatus = 
  | 'publicado'
  | 'agendado'
  | 'rascunho'
  | 'arquivado';

export type AnnouncementPriority = 'normal' | 'alta' | 'urgente';

export interface Announcement {
  id: string;
  institutionId: string;
  branchId?: string;
  type: AnnouncementType;
  title: string;
  content: string;
  summary?: string;
  targetAudience: AnnouncementTarget;
  targetCourseId?: string;
  targetCourseName?: string;
  targetClassId?: string;
  targetClassName?: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  publishDate: string; // ISO date or formatted
  scheduledFor?: string; // Data e hora do agendamento (YYYY-MM-DDTHH:mm)
  authorName: string;
  authorRole: string;
  authorId?: string;
  channels: {
    system: boolean;
    email: boolean;
    whatsapp: boolean;
    muralA4: boolean;
  };
  attachments?: {
    id: string;
    name: string;
    size?: string;
    type?: string;
  }[];
  readCount: number;
  confirmedCount?: number;
  requiresConfirmation?: boolean;
  eventDate?: string;
  eventLocation?: string;
  scheduleChangeDetails?: {
    subject?: string;
    previousSchedule?: string;
    newSchedule?: string;
    effectiveDate?: string;
    roomOrLab?: string;
  };
  paymentNoticeDetails?: {
    referenceMonth?: string;
    dueDate?: string;
    bankAccount?: string;
    mpesaEntity?: string;
    fineAfterDueDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export * from './finance';

