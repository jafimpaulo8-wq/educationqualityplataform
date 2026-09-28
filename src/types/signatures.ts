/**
 * 23. SISTEMA DE ASSINATURAS DIGITAIS & ELETRÓNICAS
 * Moztechwave Education Platform / SIVERC / SIGAR
 */

export type SignerRole = 
  | 'Diretor' 
  | 'Coordenador' 
  | 'Professor' 
  | 'Formador' 
  | 'Responsável' 
  | 'Outro';

export const SIGNER_ROLE_LABELS: Record<SignerRole, {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconColor: string;
  defaultTitle: string;
  allowedSystemRoles: string[];
}> = {
  Diretor: {
    label: 'Diretor(a)',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    defaultTitle: 'Diretor(a) Geral & Coordenador Executivo',
    allowedSystemRoles: ['DIRETOR', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'director', 'superadmin']
  },
  Coordenador: {
    label: 'Coordenador(a)',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
    iconColor: 'text-sky-400',
    defaultTitle: 'Coordenador(a) Pedagógico(a) e Académico(a)',
    allowedSystemRoles: ['DIRETOR', 'SECRETARIA', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'director', 'secretaria', 'superadmin']
  },
  Professor: {
    label: 'Professor(a)',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    defaultTitle: 'Docente Titular da Disciplina',
    allowedSystemRoles: ['PROFESSOR', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'professor', 'superadmin']
  },
  Formador: {
    label: 'Formador(a)',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-500/30',
    iconColor: 'text-indigo-400',
    defaultTitle: 'Formador(a) Técnico(a) Certificado(a)',
    allowedSystemRoles: ['FORMADOR', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'formador', 'superadmin']
  },
  Responsável: {
    label: 'Responsável / Encarregado(a)',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
    badgeBorder: 'border-teal-500/30',
    iconColor: 'text-teal-400',
    defaultTitle: 'Encarregado(a) de Educação / Tutor Legal',
    allowedSystemRoles: ['RESPONSAVEL', 'ALUNO', 'SUPER_ADMIN', 'responsavel', 'aluno', 'superadmin']
  },
  Outro: {
    label: 'Outro Signatário',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    defaultTitle: 'Representante Autorizado / Testemunha',
    allowedSystemRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'superadmin', 'director']
  }
};

export type SignatureStatus = 
  | 'Pendente' 
  | 'Assinado' 
  | 'Rejeitado' 
  | 'Revogado';

export type SignedDocumentType = 
  | 'Certificado' 
  | 'Declaração' 
  | 'Contrato' 
  | 'Pauta' 
  | 'Boletim' 
  | 'Recibo' 
  | 'Estágio' 
  | 'Outro';

export interface SignedDocumentInfo {
  documentId: string;
  documentType: SignedDocumentType;
  documentNumber: string; // Ex: MTW-CERT-2026-9021, CFTPM-CTR-2026-0042
  title: string;          // Ex: "Certificado de Conclusão - Desenvolvimento Web"
  recipientName: string;  // Ex: "Arsénio Mário Sitoe"
  recipientCode?: string; // Ex: "CFTPM-AL-2026-0012"
  courseName?: string;    // Ex: "Técnico de Redes & Cibersegurança"
  issueDate: string;      // Data de emissão (ex: "2026-09-10")
  summary?: string;       // Resumo ou descrição do teor do documento
  metadata?: Record<string, any>;
}

export interface SignatureAuditEntry {
  id: string;
  action: 
    | 'solicitacao_criada' 
    | 'assinada' 
    | 'rejeitada' 
    | 'revogada' 
    | 'tentativa_nao_autorizada' 
    | 'rubrica_atualizada';
  timestamp: string;
  actorId: string;
  actorName: string;
  actorEmail?: string;
  actorRole: string;
  ipAddress?: string;
  details: string;
  wasBlocked?: boolean;
}

export interface OfficialSigner {
  id: string;
  institutionId: string;
  name: string;
  role: SignerRole;
  customRoleTitle?: string;
  signerTitle: string; // Ex: "Diretora Pedagógica Geral"
  email: string;
  phone?: string;
  associatedUserId?: string; // ID do usuário do sistema vinculado
  signatureDataUrl?: string; // Rubrica salva
  digitalSealCode: string;
  isActive: boolean;
  registeredAt: string;
}

export interface SystemSignature {
  id: string;
  institutionId: string;
  branchId?: string;

  // 1. Quem assina (Definir quem assina: Diretor, Coordenador, Professor, Formador, Responsável, Outro)
  role: SignerRole;
  customRoleTitle?: string;

  // 2. Cada assinatura deve guardar:
  // - nome
  signerName: string;
  // - cargo
  signerTitle: string;
  // - data
  signedAt?: string;
  createdAt: string;
  deadlineDate?: string;
  // - estado
  status: SignatureStatus;
  // - documento assinado
  document: SignedDocumentInfo;

  // 3. Controle de Acesso e Segurança (Não permitir que qualquer usuário altere assinatura de outro utilizador sem autorização)
  assignedUserId?: string;
  assignedUserEmail?: string;
  allowedRoles: string[]; // Roles permitidas para assinar

  // Dados do executor real (quando assinado)
  signedByUserId?: string;
  signedByUserName?: string;
  signedByUserEmail?: string;
  signedByRole?: string;

  // Elementos gráficos e de integridade para "O documento deve indicar quem assinou"
  signatureDataUrl?: string; // Desenho da rubrica do canvas
  digitalSeal: string;       // Selo de validação: "SIVERC-SIG-DIR-2026-9021"
  verificationHash: string;  // Hash criptográfico SHA-256 do documento + signatário
  stampType?: 'oficial' | 'homologado' | 'autenticado' | 'republica' | 'concluido';
  
  // Justificativas
  rejectionReason?: string;
  revocationReason?: string;
  revokedAt?: string;
  revokedBy?: string;

  // Trilha de auditoria da assinatura
  auditTrail: SignatureAuditEntry[];

  notes?: string;
}
