export type StudentPortalTab =
  | 'perfil'
  | 'curso_turma'
  | 'horario'
  | 'aulas_materiais'
  | 'aulas_online'
  | 'frequencia'
  | 'avaliacoes_pautas'
  | 'boletim'
  | 'financeiro'
  | 'recibos'
  | 'certificados'
  | 'documentos'
  | 'estagio'
  | 'notificacoes'
  | 'secretaria';

export type RequestCategory =
  | 'justificacao_falta'
  | 'revisao_nota'
  | 'alteracao_cadastral'
  | 'declaracao_matricula'
  | 'segunda_via_certificado'
  | 'acordo_financeiro'
  | 'equivalencia_dispensa'
  | 'mudanca_turma'
  | 'outro';

export interface SecretariatRequest {
  id: string;
  protocolNumber: string;
  studentId: string;
  studentName: string;
  category: RequestCategory;
  subject: string;
  description: string;
  targetItemInfo?: string; // ex: Avaliação X ou Data da Falta
  attachedFileName?: string;
  status: 'submetido' | 'em_analise' | 'deferido' | 'indeferido' | 'concluido';
  submittedAt: string;
  respondedAt?: string;
  officialResponse?: string;
  assignedOfficer?: string;
}

export interface OnlineClassSession {
  id: string;
  title: string;
  disciplineName: string;
  teacherName: string;
  platform: 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Moztechwave Live';
  scheduledDateTime: string;
  durationMinutes: number;
  meetingUrl: string;
  accessCode?: string;
  status: 'ao_vivo' | 'agendada' | 'concluida';
  recordingUrl?: string;
  recordingDuration?: string;
  summary?: string;
  materialsCount?: number;
}

export interface TuitionInstallment {
  id: string;
  installmentNumber: number;
  monthName: string;
  year: number;
  dueDate: string;
  amount: number;
  fine: number;
  discount: number;
  totalPayable: number;
  status: 'pago' | 'pendente' | 'atrasado' | 'a_vencer';
  paidDate?: string;
  receiptNumber?: string;
  paymentMethod?: string;
  transactionCode?: string;
  isApproved: boolean; // Pagamentos aprovados são imutáveis
}
