/**
 * sivecWorkflowService.ts
 * Módulo 73: Fluxo SIVEC (Sistema Nacional de Validação e Certificação de Moçambique)
 *
 * Pipeline Sequencial Estrito de 10 Etapas:
 * 1.  Instituição
 * 2.  Emite certificado
 * 3.  SIVEC registra
 * 4.  gera ID único
 * 5.  gera hash
 * 6.  gera QR
 * 7.  URL pública
 * 8.  verificação
 * 9.  status
 * 10. histórico
 *
 * Conexão Segura ao Firebase (sigar-6754a):
 * Preservação total de dados pré-existentes, suporte Multi-Tenant SaaS e isolamento por Tenant.
 */

export type SivecStepKey =
  | 'instituicao'
  | 'emite_certificado'
  | 'sivec_registra'
  | 'gera_id_unico'
  | 'gera_hash'
  | 'gera_qr'
  | 'url_publica'
  | 'verificacao'
  | 'status'
  | 'historico';

export interface SivecStepDefinition {
  stepNumber: number;
  key: SivecStepKey;
  label: string;
  actor: 'Instituição' | 'Barramento SIVEC' | 'Motor Criptográfico' | 'Público / Empregador' | 'Auditoria Nacional';
  description: string;
}

export const SIVEC_WORKFLOW_STEPS: SivecStepDefinition[] = [
  {
    stepNumber: 1,
    key: 'instituicao',
    label: '1. Instituição',
    actor: 'Instituição',
    description: 'Instituição credenciada pela DINET / ANEP / MEC com NUIT ativo e credencial de emissor autorizada.'
  },
  {
    stepNumber: 2,
    key: 'emite_certificado',
    label: '2. Emite certificado',
    actor: 'Instituição',
    description: 'Conclusão curricular do estudante, despacho pedagógico e emissão do diploma técnico ou declaração.'
  },
  {
    stepNumber: 3,
    key: 'sivec_registra',
    label: '3. SIVEC registra',
    actor: 'Barramento SIVEC',
    description: 'Transmissão eletrônica segura via API RESTful para o livro nacional de registros do Ministério da Educação.'
  },
  {
    stepNumber: 4,
    key: 'gera_id_unico',
    label: '4. gera ID único',
    actor: 'Barramento SIVEC',
    description: 'Atribuição de código serial governamental irrepetível e rastreável nacionalmente (ex: SIVEC-MZ-2026-009841).'
  },
  {
    stepNumber: 5,
    key: 'gera_hash',
    label: '5. gera hash',
    actor: 'Motor Criptográfico',
    description: 'Computação matemática de hash criptográfico SHA-256 inviolável dos dados biográficos e notas do formando.'
  },
  {
    stepNumber: 6,
    key: 'gera_qr',
    label: '6. gera QR',
    actor: 'Motor Criptográfico',
    description: 'Geração de código QR dinâmico de alta resolução com redundância óptica e selo antifraude incrustado.'
  },
  {
    stepNumber: 7,
    key: 'url_publica',
    label: '7. URL pública',
    actor: 'Barramento SIVEC',
    description: 'Criação da URL canônica permanente para conferência descentralizada em nuvem governamental sem necessidade de login.'
  },
  {
    stepNumber: 8,
    key: 'verificacao',
    label: '8. verificação',
    actor: 'Público / Empregador',
    description: 'Consulta aberta por empresas, embaixadas, ministérios e universidades validando a outorga em tempo real.'
  },
  {
    stepNumber: 9,
    key: 'status',
    label: '9. status',
    actor: 'Barramento SIVEC',
    description: 'Apresentação oficial do parecer legal: HOMOLOGADO, REGULAR, ATIVO ou REVOGADO.'
  },
  {
    stepNumber: 10,
    key: 'historico',
    label: '10. histórico',
    actor: 'Auditoria Nacional',
    description: 'Registro no livro-razão imutável de todas as averbações, consultas públicas, carimbos UTC e acessos governamentais.'
  }
];

export interface SivecCertificateRecord {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionNuit: string;
  studentName: string;
  biNumber: string;
  studentNumber: string;
  courseName: string;
  courseCode: string;
  finalGrade: number;
  currentStepIndex: number; // 0 to 9
  status: 'PENDENTE' | 'HOMOLOGADO' | 'REVOGADO';
  sivecId?: string;
  sha256Hash?: string;
  qrPayload?: string;
  publicUrl?: string;
  issuedAt?: string;
  historyEvents: {
    stepKey: SivecStepKey;
    timestamp: string;
    actor: string;
    details: string;
  }[];
}

export const INITIAL_SIVEC_RECORDS: SivecCertificateRecord[] = [
  {
    id: 'sivec_rec_001',
    institutionId: 'inst_01',
    institutionName: 'Instituto Politécnico de Maputo (IPM)',
    institutionNuit: '400123987',
    studentName: 'Samora Moisés Machel Júnior',
    biNumber: '110100459812A',
    studentNumber: 'ALU-2026-0041',
    courseName: 'Técnico Superior de Gestão e Contabilidade',
    courseCode: 'TSGC-01',
    finalGrade: 17.2,
    currentStepIndex: 9, // Todas as 10 etapas concluídas
    status: 'HOMOLOGADO',
    sivecId: 'SIVEC-MZ-2026-009841',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    qrPayload: 'https://sivec.mined.gov.mz/validar/SIVEC-MZ-2026-009841',
    publicUrl: 'https://sivec.mined.gov.mz/validar/SIVEC-MZ-2026-009841',
    issuedAt: '04 de Setembro de 2026',
    historyEvents: [
      { stepKey: 'instituicao', timestamp: '2026-09-04T08:00:00Z', actor: 'Instituição (IPM)', details: 'Instituição emissora autenticada com Alvará DINET n.º 412/2024' },
      { stepKey: 'emite_certificado', timestamp: '2026-09-04T08:30:00Z', actor: 'Direção Pedagógica', details: 'Diploma conferido com média 17.2 valores' },
      { stepKey: 'sivec_registra', timestamp: '2026-09-04T09:00:00Z', actor: 'Barramento SIVEC', details: 'Assento ministerial transmitido e protocolado' },
      { stepKey: 'gera_id_unico', timestamp: '2026-09-04T09:00:05Z', actor: 'Barramento SIVEC', details: 'Identificador nacional atribuído: SIVEC-MZ-2026-009841' },
      { stepKey: 'gera_hash', timestamp: '2026-09-04T09:00:06Z', actor: 'Motor Criptográfico', details: 'Hash SHA-256 gerado e assinado com chave pública MEC' },
      { stepKey: 'gera_qr', timestamp: '2026-09-04T09:00:07Z', actor: 'Motor Criptográfico', details: 'QR Code de alta densidade óptica gerado' },
      { stepKey: 'url_publica', timestamp: '2026-09-04T09:00:08Z', actor: 'Barramento SIVEC', details: 'URL canônica ativa em sivec.mined.gov.mz' },
      { stepKey: 'verificacao', timestamp: '2026-09-04T10:15:22Z', actor: 'Público / Empregador', details: 'Primeira verificação pública efetuada por Banco BCI' },
      { stepKey: 'status', timestamp: '2026-09-04T10:15:23Z', actor: 'Barramento SIVEC', details: 'Status verificado como HOMOLOGADO & REGULAR' },
      { stepKey: 'historico', timestamp: '2026-09-04T10:15:24Z', actor: 'Auditoria Nacional', details: 'Log imutável registrado no barramento do Ministério' }
    ]
  },
  {
    id: 'sivec_rec_002',
    institutionId: 'inst_01',
    institutionName: 'Instituto Politécnico de Maputo (IPM)',
    institutionNuit: '400123987',
    studentName: 'Graça Simbine Machel',
    biNumber: '110198456123B',
    studentNumber: 'ALU-2026-0099',
    courseName: 'Técnico Geral de Eletricidade e Redes Industriais',
    courseCode: 'TGER-02',
    finalGrade: 15.8,
    currentStepIndex: 2, // Na etapa 3: SIVEC registra
    status: 'PENDENTE',
    historyEvents: [
      { stepKey: 'instituicao', timestamp: '2026-09-22T08:00:00Z', actor: 'Instituição (IPM)', details: 'Alvará verificado' },
      { stepKey: 'emite_certificado', timestamp: '2026-09-22T08:30:00Z', actor: 'Direção Pedagógica', details: 'Certificado despachado pelo Diretor Geral' },
      { stepKey: 'sivec_registra', timestamp: '2026-09-22T08:35:00Z', actor: 'Barramento SIVEC', details: 'Submissão eletrônica em processamento' }
    ]
  }
];

export interface FirebaseConnectionDetails {
  targetProject: string;
  environment: 'production' | 'staging';
  multiTenantMode: boolean;
  isolationKey: string;
  readOnlyProtectedCollections: string[];
  safeUpsertCollections: string[];
  connectionStatus: 'CONECTADO_ATIVO' | 'OFFLINE_SINCRONIZADO';
  lastPingMs: number;
}

export const SIGAR_FIREBASE_INTEGRATION_INFO: FirebaseConnectionDetails = {
  targetProject: 'sigar-6754a',
  environment: 'production',
  multiTenantMode: true,
  isolationKey: 'institutionId',
  readOnlyProtectedCollections: [
    'legacy_students_archive',
    'historical_audit_records',
    'institutions_master_config',
    'system_security_keys'
  ],
  safeUpsertCollections: [
    'institutions',
    'branches',
    'students',
    'courses',
    'classes',
    'payments',
    'certificates',
    'sivec_registry',
    'audit_logs'
  ],
  connectionStatus: 'CONECTADO_ATIVO',
  lastPingMs: 24
};
