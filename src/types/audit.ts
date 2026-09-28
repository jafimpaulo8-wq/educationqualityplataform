export type CriticalAuditAction = 
  | 'login'
  | 'logout'
  | 'criacao'
  | 'alteracao'
  | 'aprovacao'
  | 'rejeicao'
  | 'exclusao_logica'
  | 'emissao'
  | 'revogacao'
  | 'alteracao_nota'
  | 'alteracao_financeira'
  | 'mudanca_permissoes';

export type AuditEntity =
  | 'Utilizador'
  | 'Aluno'
  | 'Candidato'
  | 'Instituição'
  | 'Turma'
  | 'Curso'
  | 'Nota / Avaliação'
  | 'Pauta'
  | 'Pagamento'
  | 'Caixa Escolar'
  | 'Certificado'
  | 'Contrato'
  | 'Permissões RBAC'
  | 'Sessão';

export interface AuditRelevantValues {
  summary: string;
  previousValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: CriticalAuditAction;
  actionLabel: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: string; // ISO 8601
  ipAddress: string;
  entity: AuditEntity | string;
  entityId: string;
  relevantValues: AuditRelevantValues;
  institutionId: string;
  branchId?: string;
  severity: 'info' | 'aviso' | 'critico';
  integrityHash: string;
}
