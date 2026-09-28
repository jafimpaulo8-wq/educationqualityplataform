/**
 * graduationWorkflowService.ts
 * Módulo 71: Fluxo Completo de Conclusão de Curso
 *
 * Pipeline Sequencial Estrito de 17 Etapas:
 * 1.  matriculado
 * 2.  frequência
 * 3.  avaliações
 * 4.  notas
 * 5.  pauta
 * 6.  aprovação
 * 7.  estágio
 * 8.  conclusão
 * 9.  pedido de certificado
 * 10. aprovação do diretor
 * 11. Document Studio
 * 12. assinaturas
 * 13. QR
 * 14. SIVEC
 * 15. certificado emitido
 * 16. Portal do Aluno
 * 17. verificação pública
 */

export type GraduationStepKey =
  | 'matriculado'
  | 'frequencia'
  | 'avaliacoes'
  | 'notas'
  | 'pauta'
  | 'aprovacao'
  | 'estagio'
  | 'conclusao'
  | 'pedido_certificado'
  | 'aprovacao_diretor'
  | 'document_studio'
  | 'assinaturas'
  | 'qr'
  | 'sivec'
  | 'certificado_emitido'
  | 'portal_aluno'
  | 'verificacao_publica';

export type StepState = 'CONCLUIDO' | 'EM_ANDAMENTO' | 'PENDENTE' | 'BLOQUEADO';

export interface WorkflowStepDefinition {
  stepNumber: number;
  key: GraduationStepKey;
  label: string;
  responsibleRole: 'Secretaria' | 'Docente' | 'Coordenação' | 'Direção Pedagógica' | 'Sistema IA' | 'SIVEC / DINET' | 'Público';
  description: string;
  requirements: string[];
}

export const GRADUATION_WORKFLOW_STEPS: WorkflowStepDefinition[] = [
  {
    stepNumber: 1,
    key: 'matriculado',
    label: '1. Matriculado',
    responsibleRole: 'Secretaria',
    description: 'Estudante com matrícula regularizada, processo individual aberto e turma ativa atribuída.',
    requirements: ['BI / Passaporte válido', 'Ficha biográfica completa', 'Taxa de matrícula liquidada']
  },
  {
    stepNumber: 2,
    key: 'frequencia',
    label: '2. Frequência',
    responsibleRole: 'Docente',
    description: 'Assiduidade computada nos diários de classe digitais com registro sistemático de presenças e faltas.',
    requirements: ['Mínimo 75% de presenças', 'Faltas justificadas homologadas', 'Fechamento do diário']
  },
  {
    stepNumber: 3,
    key: 'avaliacoes',
    label: '3. Avaliações',
    responsibleRole: 'Docente',
    description: 'Realização de testes formativos, provas trimestrais, trabalhos práticos de laboratório e exames modulares.',
    requirements: ['Avaliações contínuas realizadas', 'Provas práticas concluídas', 'Exame final de módulo']
  },
  {
    stepNumber: 4,
    key: 'notas',
    label: '4. Notas',
    responsibleRole: 'Docente',
    description: 'Lançamento das notas em escala nacional de 0 a 20 valores no livro de notas digital.',
    requirements: ['Todas disciplinas pontuadas', 'Sem notas pendentes no trimestre', 'Validação do docente']
  },
  {
    stepNumber: 5,
    key: 'pauta',
    label: '5. Pauta',
    responsibleRole: 'Coordenação',
    description: 'Consolidação e afixação da pauta global de frequência e exame com cálculo das médias modulares.',
    requirements: ['Geração da pauta oficial', 'Conferência pela coordenação', 'Afixação física/digital']
  },
  {
    stepNumber: 6,
    key: 'aprovacao',
    label: '6. Aprovação',
    responsibleRole: 'Coordenação',
    description: 'Deliberação do conselho de notas confirmando aproveitamento pedagógico superior a 10 valores (ou 14 para dispensa).',
    requirements: ['Média curricular >= 10.0 valores', 'Aprovação em todos os módulos chave', 'Conselho pedagógico favorável']
  },
  {
    stepNumber: 7,
    key: 'estagio',
    label: '7. Estágio',
    responsibleRole: 'Coordenação',
    description: 'Cumprimento das horas regulamentares de estágio curricular supervisionado em empresa parceira.',
    requirements: ['300 a 480 horas cumpridas', 'Relatório de estágio aprovado', 'Avaliação do supervisor externo']
  },
  {
    stepNumber: 8,
    key: 'conclusao',
    label: '8. Conclusão',
    responsibleRole: 'Secretaria',
    description: 'Declaração formal de encerramento do plano de estudos curricular com termo de conclusão emitido.',
    requirements: ['Créditos letivos 100% cumpridos', 'Estágio integrado homologado', 'Quitação de propinas total']
  },
  {
    stepNumber: 9,
    key: 'pedido_certificado',
    label: '9. Pedido de Certificado',
    responsibleRole: 'Secretaria',
    description: 'Abertura do processo de certificação solicitado pela secretaria académica ou pelo estudante no portal.',
    requirements: ['Formulário de requisição oficial', 'Certidão de nascimento / BI anexado', 'Taxa de diplomação']
  },
  {
    stepNumber: 10,
    key: 'aprovacao_diretor',
    label: '10. Aprovação do Diretor',
    responsibleRole: 'Direção Pedagógica',
    description: 'Despacho formal e deferimento do Diretor Geral da instituição validando a legalidade da outorga do diploma.',
    requirements: ['Inspeção da pasta académica', 'Despacho eletrônico assinado', 'Deferimento na ata de diplomados']
  },
  {
    stepNumber: 11,
    key: 'document_studio',
    label: '11. Document Studio',
    responsibleRole: 'Sistema IA',
    description: 'Renderização vetorial no motor gráfico do Document Studio com 42 variáveis dinâmicas e selo antifraude.',
    requirements: ['Template curricular DINET/ANEP', 'Variáveis de dados vinculadas', 'Marca d\'água de segurança']
  },
  {
    stepNumber: 12,
    key: 'assinaturas',
    label: '12. Assinaturas',
    responsibleRole: 'Direção Pedagógica',
    description: 'Assinatura digital qualificada do Diretor Geral e do Secretário Académico com selo criptográfico SHA-256.',
    requirements: ['Assinatura do Diretor Geral', 'Assinatura do Secretário', 'Carimbo de tempo UTC']
  },
  {
    stepNumber: 13,
    key: 'qr',
    label: '13. QR Code',
    responsibleRole: 'Sistema IA',
    description: 'Geração e incrustação de QR Code dinâmico inviolável contendo a URL pública criptografada de conferência.',
    requirements: ['URL pública de validação', 'Hash criptográfico no payload', 'Leitura óptica em alta resolução']
  },
  {
    stepNumber: 14,
    key: 'sivec',
    label: '14. SIVEC',
    responsibleRole: 'SIVEC / DINET',
    description: 'Transmissão do protocolo oficial e registro no Sistema Governamental (DINET / ANEP / MEC) de Moçambique.',
    requirements: ['Protocolo nacional emitido', 'Chave de interoperabilidade DINET', 'Averbação no livro nacional']
  },
  {
    stepNumber: 15,
    key: 'certificado_emitido',
    label: '15. Certificado Emitido',
    responsibleRole: 'Secretaria',
    description: 'Formalização do estado oficial do diploma como EMITIDO e arquivado no livro de registo permanente.',
    requirements: ['Número de registro de diploma', 'Livro e folhas averbadas', 'Certificado pronto para posse']
  },
  {
    stepNumber: 16,
    key: 'portal_aluno',
    label: '16. Portal do Aluno',
    responsibleRole: 'Sistema IA',
    description: 'Publicação instantânea do certificado digital em PDF no portal do aluno e disparo automatizado via WhatsApp.',
    requirements: ['Disponível na aba Certificados', 'Download imediato em PDF', 'Notificação por WhatsApp/SMS']
  },
  {
    stepNumber: 17,
    key: 'verificacao_publica',
    label: '17. Verificação Pública',
    responsibleRole: 'Público',
    description: 'Página de consulta pública sem login para empregadores, embaixadas e universidades validarem autenticidade.',
    requirements: ['Consulta por código ou leitura QR', 'Exibição de dados institucionais', 'Selo de Autenticidade Ativo']
  }
];

export interface StudentGraduationTrack {
  id: string;
  studentId: string;
  studentName: string;
  biNumber: string;
  studentNumber: string;
  courseName: string;
  courseCode: string;
  institutionName: string;
  currentStepIndex: number; // 0 to 16
  status: 'EM_PROGRESSO' | 'CONCLUIDO' | 'BLOQUEADO';
  stepLogs: {
    stepKey: GraduationStepKey;
    completedAt?: string;
    completedBy?: string;
    details?: string;
  }[];
  certificateMetadata?: {
    certificateNumber: string;
    finalAverage: number;
    attendanceRate: number;
    internshipCompany: string;
    internshipGrade: number;
    directorApprovalDate?: string;
    sivecProtocol?: string;
    qrValidationUrl?: string;
    sha256Hash?: string;
    issuedAt?: string;
  };
}

// Mock inicial de estudantes no fluxo de conclusão
export const INITIAL_GRADUATION_STUDENTS: StudentGraduationTrack[] = [
  {
    id: 'grad_track_01',
    studentId: 'std_001',
    studentName: 'Samora Moisés Machel Júnior',
    biNumber: '110100459812A',
    studentNumber: 'ALU-2026-0041',
    courseName: 'Técnico Superior de Gestão e Contabilidade',
    courseCode: 'TSGC-01',
    institutionName: 'Instituto Politécnico de Maputo',
    currentStepIndex: 16, // Totalmente concluído
    status: 'CONCLUIDO',
    stepLogs: [
      { stepKey: 'matriculado', completedAt: '2026-02-01T08:00:00Z', completedBy: 'Secretaria Académica', details: 'Matrícula deferida sem pendências' },
      { stepKey: 'frequencia', completedAt: '2026-06-30T16:00:00Z', completedBy: 'Docentes Modulares', details: '96.4% de frequência apurada' },
      { stepKey: 'avaliacoes', completedAt: '2026-07-15T10:00:00Z', completedBy: 'Conselho Docente', details: 'Todos os módulos formativos realizados' },
      { stepKey: 'notas', completedAt: '2026-07-20T14:30:00Z', completedBy: 'Prof. Sérgio Manhica', details: 'Pauta modular digitada e conferida' },
      { stepKey: 'pauta', completedAt: '2026-07-22T09:00:00Z', completedBy: 'Coordenação Pedagógica', details: 'Pauta geral de frequência afixada' },
      { stepKey: 'aprovacao', completedAt: '2026-07-25T11:00:00Z', completedBy: 'Conselho Pedagógico', details: 'Média final de aprovação: 17.2 valores' },
      { stepKey: 'estagio', completedAt: '2026-08-30T17:00:00Z', completedBy: 'Empresa Parceira / BCI', details: '400 horas no BCI com nota 18 valores' },
      { stepKey: 'conclusao', completedAt: '2026-09-01T10:00:00Z', completedBy: 'Secretaria Académica', details: 'Termo de conclusão curricular averbado' },
      { stepKey: 'pedido_certificado', completedAt: '2026-09-02T12:00:00Z', completedBy: 'Portal do Aluno', details: 'Requerimento n.º REQ-2026-891 submetido' },
      { stepKey: 'aprovacao_diretor', completedAt: '2026-09-03T15:00:00Z', completedBy: 'Dr. Alberto Mondlane (Diretor)', details: 'Despacho favorável lavrado em livro de atas' },
      { stepKey: 'document_studio', completedAt: '2026-09-04T08:30:00Z', completedBy: 'Motor Document Studio', details: 'Renderização gráfica com selo holográfico e variáveis' },
      { stepKey: 'assinaturas', completedAt: '2026-09-04T10:00:00Z', completedBy: 'Chave Digital Institucional', details: 'Assinaturas criptográficas SHA-256 integradas' },
      { stepKey: 'qr', completedAt: '2026-09-04T10:05:00Z', completedBy: 'Módulo QR Validator', details: 'QR Code de consulta pública nacional gerado' },
      { stepKey: 'sivec', completedAt: '2026-09-04T11:30:00Z', completedBy: 'Barramento SIVEC / ANEP', details: 'Homologação nacional: Protocolo DINET-2026-009841' },
      { stepKey: 'certificado_emitido', completedAt: '2026-09-04T12:00:00Z', completedBy: 'Secretaria Académica', details: 'Registado no Livro 14, Folha 88, Assento 204' },
      { stepKey: 'portal_aluno', completedAt: '2026-09-04T12:05:00Z', completedBy: 'Disparo Automático', details: 'PDF disponibilizado no Portal e WhatsApp enviado' },
      { stepKey: 'verificacao_publica', completedAt: '2026-09-04T12:06:00Z', completedBy: 'Validador Nacional', details: 'Página pública de consulta ativa 24/7' }
    ],
    certificateMetadata: {
      certificateNumber: 'CERT-MZ-2026-009841',
      finalAverage: 17.2,
      attendanceRate: 96.4,
      internshipCompany: 'Banco Comercial e de Investimentos (BCI)',
      internshipGrade: 18.0,
      directorApprovalDate: '03 de Setembro de 2026',
      sivecProtocol: 'DINET-ANEP-MZ-2026-009841',
      qrValidationUrl: 'https://sigar.co.mz/validar/CERT-MZ-2026-009841',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      issuedAt: '04 de Setembro de 2026'
    }
  },
  {
    id: 'grad_track_02',
    studentId: 'std_002',
    studentName: 'Graça Simbine Machel',
    biNumber: '110198456123B',
    studentNumber: 'ALU-2026-0099',
    courseName: 'Técnico Geral de Eletricidade e Redes Industriais',
    courseCode: 'TGER-02',
    institutionName: 'Instituto Politécnico de Maputo',
    currentStepIndex: 9, // Aguardando aprovação do Diretor
    status: 'EM_PROGRESSO',
    stepLogs: [
      { stepKey: 'matriculado', completedAt: '2026-02-05T09:00:00Z', completedBy: 'Secretaria Académica' },
      { stepKey: 'frequencia', completedAt: '2026-06-30T16:00:00Z', completedBy: 'Docentes Modulares' },
      { stepKey: 'avaliacoes', completedAt: '2026-07-15T10:00:00Z', completedBy: 'Conselho Docente' },
      { stepKey: 'notas', completedAt: '2026-07-20T14:30:00Z', completedBy: 'Docentes' },
      { stepKey: 'pauta', completedAt: '2026-07-22T09:00:00Z', completedBy: 'Coordenação' },
      { stepKey: 'aprovacao', completedAt: '2026-07-25T11:00:00Z', completedBy: 'Conselho Pedagógico' },
      { stepKey: 'estagio', completedAt: '2026-08-25T17:00:00Z', completedBy: 'EDM - Eletricidade de Moçambique' },
      { stepKey: 'conclusao', completedAt: '2026-09-01T10:00:00Z', completedBy: 'Secretaria Académica' },
      { stepKey: 'pedido_certificado', completedAt: '2026-09-05T11:00:00Z', completedBy: 'Secretaria Académica' }
    ],
    certificateMetadata: {
      certificateNumber: 'CERT-MZ-2026-010452',
      finalAverage: 15.8,
      attendanceRate: 91.2,
      internshipCompany: 'EDM (Eletricidade de Moçambique)',
      internshipGrade: 16.5
    }
  }
];

/**
 * Consulta de verificação pública
 */
export function verifyPublicCertificate(queryCode: string): StudentGraduationTrack | null {
  const cleanCode = queryCode.trim().toUpperCase();
  if (!cleanCode) return null;

  return INITIAL_GRADUATION_STUDENTS.find(
    track =>
      track.certificateMetadata?.certificateNumber?.toUpperCase() === cleanCode ||
      track.certificateMetadata?.sivecProtocol?.toUpperCase() === cleanCode ||
      track.biNumber.toUpperCase() === cleanCode ||
      track.studentNumber.toUpperCase() === cleanCode
  ) || null;
}
