import { OnlineClassSession, SecretariatRequest, TuitionInstallment } from './types';
import { Student } from '../../types';

export const INITIAL_SECRETARIAT_REQUESTS: SecretariatRequest[] = [
  {
    id: 'req-01',
    protocolNumber: 'SEC-2026-081',
    studentId: 'std-01',
    studentName: 'Arnaldo Tomás Mabunda',
    category: 'declaracao_matricula',
    subject: 'Emissão de Declaração de Frequência com Notas para Fins Profissionais',
    description: 'Solicito a emissão com urgência para apresentação na empresa onde realizo estágio.',
    status: 'concluido',
    submittedAt: '2026-08-20 09:30',
    respondedAt: '2026-08-21 14:15',
    assignedOfficer: 'Dra. Luísa Cossa (Secretaria Geral)',
    officialResponse: 'Declaração emitida com assinatura digital e código de verificação SIVEC. O documento foi anexado ao seu dossier digital.'
  },
  {
    id: 'req-02',
    protocolNumber: 'SEC-2026-094',
    studentId: 'std-01',
    studentName: 'Arnaldo Tomás Mabunda',
    category: 'justificacao_falta',
    subject: 'Justificação de Ausência no dia 05/09/2026 - Consulta Médica',
    description: 'Estive ausente na aula de Arquitetura de Software devido a consulta médica de rotina comprovada em anexo.',
    targetItemInfo: 'Aula do dia 05/09/2026',
    attachedFileName: 'Atestado_Medico_Hospital_Central_Maputo.pdf',
    status: 'deferido',
    submittedAt: '2026-09-06 11:00',
    respondedAt: '2026-09-07 10:20',
    assignedOfficer: 'Secretaria Acadêmica',
    officialResponse: 'Justificativo acolhido pelo Conselho Pedagógico. Falta convertida para Falta Justificada no sistema.'
  }
];

export const INITIAL_ONLINE_CLASSES: OnlineClassSession[] = [
  {
    id: 'onl-01',
    title: 'Mentoria Técnica ao Vivo: Resolução de Dúvidas em Docker & CI/CD Pipelines',
    disciplineName: 'Arquitetura de Software & Cloud',
    teacherName: 'Eng. Carlos Manuel',
    platform: 'Google Meet',
    scheduledDateTime: '2026-09-17 18:30',
    durationMinutes: 90,
    meetingUrl: 'https://meet.google.com/mtw-tech-2026',
    accessCode: 'mtw-tech-2026',
    status: 'ao_vivo',
    summary: 'Sessão interativa com demonstração prática de deploy de containers e configuração de webhook no GitHub Actions.',
    materialsCount: 3
  },
  {
    id: 'onl-02',
    title: 'Masterclass Remota: Boas Práticas de Segurança em APIs RESTful & JWT',
    disciplineName: 'Cibersegurança & Backend',
    teacherName: 'Eng. Arone Malendza',
    platform: 'Zoom',
    scheduledDateTime: '2026-09-19 19:00',
    durationMinutes: 120,
    meetingUrl: 'https://zoom.us/j/84920193820?pwd=MTW2026Secured',
    accessCode: '849 2019 3820',
    status: 'agendada',
    summary: 'Análise de vulnerabilidades OWASP Top 10 aplicadas a microsserviços Node.js e proteção contra injeção SQL/XSS.',
    materialsCount: 2
  },
  {
    id: 'onl-03',
    title: 'Aula Gravada: Modelagem Conceitual e Normalização de Banco de Dados (3FN)',
    disciplineName: 'Engenharia de Dados & SQL',
    teacherName: 'Dra. Amina Abdul',
    platform: 'Moztechwave Live',
    scheduledDateTime: '2026-09-10 18:00',
    durationMinutes: 105,
    meetingUrl: '#',
    status: 'concluida',
    recordingUrl: 'https://cdn.moztechwave.co.mz/vod/aulas/turma-es-2026-09-10.mp4',
    recordingDuration: '1h 45m',
    summary: 'Estudo de caso real do SIGAR: tabelas normalizadas, relacionamentos 1:N e N:M, integridade referencial.',
    materialsCount: 4
  },
  {
    id: 'onl-04',
    title: 'Aula Gravada: Introdução aos Design Patterns em TypeScript & React',
    disciplineName: 'Programação Web & Algoritmos',
    teacherName: 'Eng. Carlos Manuel',
    platform: 'Moztechwave Live',
    scheduledDateTime: '2026-09-03 18:30',
    durationMinutes: 90,
    meetingUrl: '#',
    status: 'concluida',
    recordingUrl: 'https://cdn.moztechwave.co.mz/vod/aulas/turma-es-2026-09-03.mp4',
    recordingDuration: '1h 32m',
    summary: 'Implementação prática dos padrões Observer, Factory e Singleton no ecossistema moderno de frontend.',
    materialsCount: 3
  }
];

export interface StudentNotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Acadêmico' | 'Financeiro' | 'Secretaria' | 'Aulas' | 'Estágio';
  date: string;
  isRead: boolean;
  linkTab?: string;
}

export const INITIAL_STUDENT_NOTIFICATIONS: StudentNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Recibo de Pagamento Emitido: Setembro/2026',
    message: 'Seu pagamento de propina referente a Setembro foi processado e homologado com sucesso pela Tesouraria.',
    category: 'Financeiro',
    date: '10/09/2026 11:20',
    isRead: false,
    linkTab: 'recibos'
  },
  {
    id: 'notif-2',
    title: 'Pauta de Avaliação Homologada',
    message: 'A Direção Pedagógica publicou a pauta oficial de Engenharia de Dados & SQL no portal acadêmico.',
    category: 'Acadêmico',
    date: '08/09/2026 14:00',
    isRead: false,
    linkTab: 'avaliacoes_pautas'
  },
  {
    id: 'notif-3',
    title: 'Aula Ao Vivo Transmitida Hoje às 18h30',
    message: 'Sessão de mentoria síncrona sobre Docker & CI/CD com o Eng. Carlos Manuel via Google Meet.',
    category: 'Aulas',
    date: 'Hoje 08:00',
    isRead: false,
    linkTab: 'aulas_online'
  },
  {
    id: 'notif-4',
    title: 'Declaração de Matrícula Disponível',
    message: 'Seu requerimento nº SEC-2026-081 foi concluído pela Secretaria Geral e o documento já está no seu Dossier.',
    category: 'Secretaria',
    date: '21/08/2026 14:15',
    isRead: true,
    linkTab: 'documentos'
  },
  {
    id: 'notif-5',
    title: 'Relatório Mensal de Estágio Aprovado',
    message: 'O supervisor da Vodacom e o tutor institucional validaram as 40h de práticas profissionais do mês.',
    category: 'Estágio',
    date: '15/08/2026 16:30',
    isRead: true,
    linkTab: 'estagio'
  }
];

export function getStudentTuitionInstallments(student: Student): TuitionInstallment[] {
  const months = [
    { num: 1, name: 'Fevereiro', due: '2026-02-10', status: 'pago', paidDate: '2026-02-05', receipt: 'REC-2026-1042-01', method: 'M-Pesa', code: 'MP91823901A' },
    { num: 2, name: 'Março', due: '2026-03-10', status: 'pago', paidDate: '2026-03-08', receipt: 'REC-2026-1042-02', method: 'e-Mola', code: 'EM77120391B' },
    { num: 3, name: 'Abril', due: '2026-04-10', status: 'pago', paidDate: '2026-04-09', receipt: 'REC-2026-1042-03', method: 'Ponto24 / Transferência', code: 'BIM-TRF-09182' },
    { num: 4, name: 'Maio', due: '2026-05-10', status: 'pago', paidDate: '2026-05-04', receipt: 'REC-2026-1042-04', method: 'M-Pesa', code: 'MP44019283K' },
    { num: 5, name: 'Junho', due: '2026-06-10', status: 'pago', paidDate: '2026-06-08', receipt: 'REC-2026-1042-05', method: 'M-Pesa', code: 'MP88129034L' },
    { num: 6, name: 'Julho', due: '2026-07-10', status: 'pago', paidDate: '2026-07-09', receipt: 'REC-2026-1042-06', method: 'e-Mola', code: 'EM22910482P' },
    { num: 7, name: 'Agosto', due: '2026-08-10', status: 'pago', paidDate: '2026-08-07', receipt: 'REC-2026-1042-07', method: 'M-Pesa', code: 'MP99182746Q' },
    { num: 8, name: 'Setembro', due: '2026-09-10', status: student.paymentStatus === 'Pago' ? 'pago' : 'pendente', paidDate: student.paymentStatus === 'Pago' ? '2026-09-08' : undefined, receipt: student.paymentStatus === 'Pago' ? 'REC-2026-1042-08' : undefined, method: student.paymentStatus === 'Pago' ? 'M-Pesa' : undefined, code: student.paymentStatus === 'Pago' ? 'MP33918274Z' : undefined },
    { num: 9, name: 'Outubro', due: '2026-10-10', status: 'a_vencer' },
    { num: 10, name: 'Novembro', due: '2026-11-10', status: 'a_vencer' },
    { num: 11, name: 'Dezembro', due: '2026-12-10', status: 'a_vencer' }
  ];

  const basePrice = 4500;

  return months.map(m => {
    const isPaid = m.status === 'pago';
    return {
      id: `inst-${student.id}-${m.num}`,
      installmentNumber: m.num,
      monthName: m.name,
      year: 2026,
      dueDate: m.due,
      amount: basePrice,
      fine: 0,
      discount: isPaid ? 0 : 0,
      totalPayable: basePrice,
      status: m.status as any,
      paidDate: m.paidDate,
      receiptNumber: m.receipt,
      paymentMethod: m.method,
      transactionCode: m.code,
      isApproved: isPaid // Todos os meses pagos já possuem aprovação e são imutáveis
    };
  });
}
