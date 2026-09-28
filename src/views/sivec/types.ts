export type SivecPillarId = 'core' | 'registry' | 'verify' | 'pass' | 'connect' | 'studio';

export type CredentialType = 
  | 'certificado' 
  | 'diploma' 
  | 'declaracao_notas' 
  | 'microcredencial' 
  | 'carteira_estudante';

// Estados oficiais do SIVEC REGISTRY (Requisito 43)
export type SivecCredentialState = 
  | 'ATIVO' 
  | 'REVOGADO' 
  | 'CORRIGIDO' 
  | 'EXPIRADO' 
  | 'CANCELADO';

// Tipo de compatibilidade
export type CredentialStatus = SivecCredentialState | 'valido' | 'revogado' | 'suspenso' | 'substituido';

export interface AccreditationAuditProof {
  hasAnepAccreditation: boolean;
  anepRegisterNumber?: string;
  auditProofDocument?: string;
  anepAccreditationExpiry?: string;
  legalDisclaimer: string;
}

// Assinatura digital individual do certificado
export interface SivecSignature {
  id: string;
  signerName: string; // Nome do signatário (ex: Eng. Paulo Jafim)
  signerRole: string; // Cargo (ex: Diretor Geral)
  signatureDate: string; // Data da assinatura
  algorithm: string; // ex: Ed25519, RSA-4096
  signatureHex: string; // Digest da assinatura digital
  isValid: boolean;
  publicFingerprint: string; // Chave pública / fingerprint do certificado digital
}

// Evento cronológico da trilha de auditoria / histórico
export interface SivecHistoryEvent {
  id: string;
  timestamp: string; // Data e hora do evento
  action: string; // Ação executada (ex: Emissão Original, Correção Cadastral, Revogação Notarial, etc.)
  actor: string; // Nome do operador/autoridade
  actorRole: string; // Cargo do operador
  previousState?: SivecCredentialState | string;
  newState: SivecCredentialState;
  justification: string; // Justificativa ou notas do ato
  transactionHash?: string; // Hash da transação na cadeia do registo
}

export interface SivecRegistryEntry {
  // Identificador Único do Certificado
  id: string;
  uniqueCertificateId: string; // Identificador universal único (ex: MZ-SIVEC-CERT-2026-008819-A1)
  sivecCode: string; // Código público alfanumérico (ex: SIVEC-MZ-2026-8819)
  
  // 1. Instituição
  institutionName: string; // Nome da instituição
  institutionNuit: string; // NUIT da instituição
  institutionCode?: string; // Código de registo institucional (ex: IPTA-MZ-0042)
  institutionCampus?: string; // Campus ou polo

  // 2. Certificado
  certificateTitle: string; // Título formal do certificado
  credentialType: CredentialType;
  academicLevel?: string; // Nível académico / NQF
  bookNumber: string; // Livro Notarial nº (ex: L-04/TEC)
  sheetNumber: string; // Folha nº (ex: Fl. 88)
  entryNumber: string; // Assento nº (ex: Assento nº 1042)

  // 3. Aluno
  studentName: string; // Nome completo do aluno
  studentDocument: string; // Documento de identificação (BI / Passaporte / DIRE)
  studentId: string; // Matrícula / Código de estudante
  studentEmail: string; // E-mail institucional ou de contacto

  // 4. Curso
  courseName: string; // Nome do curso
  durationHours: number; // Carga horária
  finalGrade: string; // Nota / Classificação final

  // 5. Número
  certificateNumber: string; // Número de série / emissão do certificado (ex: CERT-2026-008819)

  // 6. Data
  issueDate: string; // Data de emissão
  completionDate?: string; // Data de conclusão
  expiryDate?: string; // Data de expiração (para microcredenciais ou certificados temporários)
  timestampUtc: string; // Carimbo temporal TSA RFC 3161 UTC

  // 7. Estado (ATIVO, REVOGADO, CORRIGIDO, EXPIRADO, CANCELADO)
  status: SivecCredentialState;
  revocationReason?: string;
  revocationDate?: string;
  revokedBy?: string;
  correctionReason?: string;
  correctionDate?: string;
  correctedBy?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  cancelledBy?: string;

  // 8. Hash
  sha256Hash: string; // Hash criptográfico SHA-256 de 64 caracteres

  // 9. Emissor
  issuerName: string; // Nome da autoridade emissora
  issuerRole: string; // Cargo do emissor (ex: Secretário-Geral Notarial)
  issuerDepartment: string; // Departamento emissor

  // 10. Assinaturas
  signatures: SivecSignature[]; // Quadro de assinaturas digitais
  digitalSignature?: string; // Assinatura consolidada para compatibilidade
  signatoryDirector?: string;
  pedagogicOfficer?: string;

  // 11. Histórico
  history: SivecHistoryEvent[]; // Histórico completo e imutável de eventos

  // Rastreamento e Conformidade
  verificationCount: number;
  lastVerifiedAt?: string;
  accreditation: AccreditationAuditProof;
}

export interface SivecCoreMetrics {
  totalRegistered: number;
  activeValid: number;
  revokedCount: number;
  totalVerificationsToday: number;
  blockchainLedgerBlocks: number;
  keyStatus: 'operacional' | 'em_rotatividade' | 'alerta';
  keyFingerprint: string;
  cryptoAlgorithm: string;
  tsaProvider: string;
}

export interface SivecPassData {
  passId: string;
  sivecCode: string;
  studentName: string;
  studentPhoto?: string;
  studentNumber: string;
  courseName: string;
  academicLevel: string;
  issueDate: string;
  validUntil: string;
  dynamicPin: string;
  offlineSignatureToken: string;
  qrPayloadUrl: string;
  status: CredentialStatus;
}

export type SivecConnectWebhookEvent = 
  | 'certificate.created'
  | 'certificate.verified'
  | 'certificate.revoked'
  | 'certificate.corrected'
  | 'institution.suspended'
  | 'institution.reactivated'
  | 'credential.issued'
  | 'credential.revoked'
  | 'credential.verified';

export interface SivecConnectWebhook {
  id: string;
  systemName: string;
  systemType: 'SoftGenial' | 'SistemasHugo' | 'SIGAR' | 'Empregador' | 'GovPortal' | 'ERP' | 'Outro';
  endpointUrl: string;
  authHeaderPrefix: string;
  eventsSubscribed: SivecConnectWebhookEvent[];
  status: 'ativo' | 'inativo' | 'erro_comunicacao';
  lastPingMs: number;
  totalDelivered: number;
}

export type SivecExternalSystemType = 
  | 'SIGAR' 
  | 'SistemasHugo'
  | 'SoftGenial' 
  | 'ERP_Primavera' 
  | 'ERP_SAP' 
  | 'ERP_PHC' 
  | 'Academico_Proprio' 
  | 'Empregador' 
  | 'GovPortal' 
  | 'Outro';

export type SivecConnectScope = 
  | 'certificates:register'
  | 'certificates:verify'
  | 'certificates:status'
  | 'certificates:qr'
  | 'certificates:url'
  | 'certificates:validate_hash'
  | 'certificates:revoke'
  | 'certificates:correct'
  | 'verify:read'
  | 'registry:read'
  | 'registry:write'
  | 'revoke:admin';

export interface SivecApiKey {
  id: string;
  name: string;
  systemType: SivecExternalSystemType;
  tokenPrefix: string;
  rawKey?: string;
  environment: 'production' | 'sandbox';
  createdAt: string;
  scopes: SivecConnectScope[];
  rateLimitPerMinute: number;
  lastUsedAt: string;
  status: 'ativa' | 'revogada';
  institutionId?: string;
  branchId?: string;
}

export interface SivecApiRevokePayload {
  certificateId: string; // sivecCode ou uniqueCertificateId
  revocationReason: string;
  authorizedBy: string;
  actorRole?: string;
  legalDispatchNumber?: string;
}

export interface SivecApiRevokeResponse {
  status: 'success' | 'error';
  code: number;
  message: string;
  data?: {
    sivecCode: string;
    uniqueCertificateId: string;
    previousState: SivecCredentialState;
    newState: 'REVOGADO';
    revocationDate: string;
    revocationReason: string;
    authorizedBy: string;
    transactionHash: string;
    publicVerifyUrl: string;
  };
  errors?: string[];
}

export interface SivecApiCorrectPayload {
  certificateId: string; // sivecCode ou uniqueCertificateId
  justification: string;
  authorizedBy: string;
  corrections: {
    studentName?: string;
    studentDocument?: string;
    courseName?: string;
    finalGrade?: string;
    durationHours?: number;
    bookNumber?: string;
    sheetNumber?: string;
    entryNumber?: string;
  };
}

export interface SivecApiCorrectResponse {
  status: 'success' | 'error';
  code: number;
  message: string;
  data?: {
    sivecCode: string;
    uniqueCertificateId: string;
    status: 'CORRIGIDO';
    correctionDate: string;
    justification: string;
    authorizedBy: string;
    previousVersionDigest: string;
    newSha256Hash: string;
    publicVerifyUrl: string;
  };
  errors?: string[];
}

// ----------------------------------------------------
// DTOs e Contratos da API SIVEC CONNECT
// ----------------------------------------------------

export interface SivecApiRegisterPayload {
  studentName: string;
  studentDocument: string;
  studentId?: string;
  studentEmail?: string;
  courseName: string;
  durationHours: number;
  finalGrade?: string;
  certificateTitle?: string;
  credentialType?: CredentialType;
  academicLevel?: string;
  institutionName?: string;
  institutionNuit?: string;
  institutionCampus?: string;
  externalReference?: string;
  bookNumber?: string;
  sheetNumber?: string;
  entryNumber?: string;
  issueDate?: string;
  completionDate?: string;
}

export interface SivecApiRegisterResponse {
  status: 'success' | 'error';
  code: number;
  message: string;
  data?: {
    sivecCode: string;
    uniqueCertificateId: string;
    certificateNumber: string;
    sha256Hash: string;
    status: SivecCredentialState;
    studentName: string;
    courseName: string;
    issueDate: string;
    qrPayload: string;
    publicVerifyUrl: string;
    legalFormula: string;
    anepNotice: string;
  };
  errors?: string[];
}

export interface SivecApiVerifyResponse {
  status: 'success' | 'error';
  code: number;
  isAuthentic: boolean;
  message: string;
  data?: {
    sivecCode: string;
    uniqueCertificateId: string;
    certificateNumber: string;
    status: SivecCredentialState;
    studentName: string;
    studentDocumentMasked: string;
    courseName: string;
    durationHours: number;
    finalGrade: string;
    institutionName: string;
    institutionNuit: string;
    bookNumber: string;
    sheetNumber: string;
    entryNumber: string;
    issueDate: string;
    completionDate?: string;
    sha256Hash: string;
    publicVerifyUrl: string;
    legalFormula: string;
    anepNotice: string;
    signatures: SivecSignature[];
  };
  errors?: string[];
}

export interface SivecApiStatusResponse {
  status: 'success' | 'error';
  code: number;
  sivecCode?: string;
  uniqueCertificateId?: string;
  credentialStatus?: SivecCredentialState;
  isValid?: boolean;
  lastStatusUpdate?: string;
  reason?: string;
  legalFormula?: string;
  message?: string;
}

export interface SivecApiQrResponse {
  status: 'success' | 'error';
  code: number;
  sivecCode: string;
  qrPayload: string;
  qrDataUrl: string;
  publicVerifyUrl: string;
  format: 'image/svg+xml' | 'image/png';
  message?: string;
}

export interface SivecApiPublicUrlResponse {
  status: 'success' | 'error';
  code: number;
  sivecCode: string;
  canonicalUrl: string;
  shortUrl: string;
  iframeEmbedSnippet: string;
  badgeHtml: string;
  openGraph: {
    title: string;
    description: string;
    type: string;
    url: string;
  };
}

export interface SivecApiValidateHashResponse {
  status: 'success' | 'error';
  code: number;
  hash: string;
  isValid: boolean;
  matchFound: boolean;
  tamperAlert: boolean;
  message: string;
  certificate?: {
    sivecCode: string;
    uniqueCertificateId: string;
    studentName: string;
    courseName: string;
    status: SivecCredentialState;
    issueDate: string;
    publicVerifyUrl: string;
  };
  integrityProof: {
    algorithm: 'SHA-256';
    verifiedAt: string;
    blockAudit: string;
    ledgerStatus: 'AUTHENTIC_UNCHANGED' | 'TAMPERED_OR_UNKNOWN';
  };
}

export interface SivecApiOAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
  jti: string;
  issued_at: string;
}

// ----------------------------------------------------
// SIVEC STUDIO (Requisito 46)
// ----------------------------------------------------

export interface SivecStudioExtractedData {
  studentName: string;
  courseName: string;
  certificateNumber: string;
  issueDate: string;
  institutionName: string;
  durationHours: number;
  
  // Metadados adicionais notariais
  studentDocument?: string;
  studentId?: string;
  finalGrade?: string;
  academicLevel?: string;
  bookNumber?: string;
  sheetNumber?: string;
  entryNumber?: string;
  institutionNuit?: string;
  
  // Pontuações de confiança da extração por campo
  confidence: {
    studentName: number;
    courseName: number;
    certificateNumber: number;
    issueDate: number;
    institutionName: number;
    durationHours: number;
  };
  rawExtractedTextSnippet?: string;
}

export interface SivecStudioDocumentRecord {
  id: string;
  uploadedAt: string;
  fileName: string;
  fileSizeKb: number;
  mimeType: string;
  
  // 1. Guardar original (NUNCA sobrescrever)
  original: {
    dataUrl?: string;
    rawText: string;
    sha256Hash: string;
    capturedAt: string;
    preservedNotice: string;
  };

  // 2, 3 e 4. Dados analisados e identificados
  extracted: SivecStudioExtractedData;

  // 5. Revisão humana
  humanReview: {
    reviewed: boolean;
    reviewedBy?: string;
    reviewedRole?: string;
    reviewedAt?: string;
    notes?: string;
    isApproved: boolean;
    fieldsModified: string[];
  };

  // 6. Registro no SIVEC
  registration?: {
    sivecCode: string;
    uniqueCertificateId: string;
    registeredAt: string;
    status: SivecCredentialState;
    registryEntryId: string;
    sha256Hash: string;
  };

  // 7, 8 e 9. Versão SIVEC gerada com QR, Selo e Link
  sivecVersion?: {
    generatedAt: string;
    qrDataUrl: string;
    publicVerifyUrl: string;
    securityStampId: string;
    visualPreservationNotice: string;
    layoutStyle: 'modern_border' | 'classic_notarial' | 'tech_academic';
  };

  stage: 'upload' | 'analyzing' | 'extracting' | 'review' | 'registered_and_generated';
}

