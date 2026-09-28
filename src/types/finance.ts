export type ReceivableCategory =
  | 'matricula'
  | 'inscricao'
  | 'mensalidade'
  | 'propina'
  | 'certificado'
  | 'cracha'
  | 'manual'
  | 'uniforme'
  | 'declaracao'
  | 'avaliacao'
  | 'exame'
  | 'multa'
  | 'outros';

export const RECEIVABLE_CATEGORY_CONFIG: Record<ReceivableCategory, {
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  defaultAmount: number;
}> = {
  matricula: {
    label: 'Matrícula',
    shortLabel: 'Matrícula',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    description: 'Taxa de confirmação e matrícula escolar / técnico-profissional',
    defaultAmount: 2500
  },
  inscricao: {
    label: 'Inscrição',
    shortLabel: 'Inscrição',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    description: 'Taxa de candidatura e admissão para novos estudantes',
    defaultAmount: 1500
  },
  mensalidade: {
    label: 'Mensalidade',
    shortLabel: 'Propina',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    description: 'Propina mensal do ano letivo / período de formação',
    defaultAmount: 4500
  },
  certificado: {
    label: 'Certificado',
    shortLabel: 'Certificado',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    description: 'Emissão de certificado de conclusão ou diploma homologado',
    defaultAmount: 1200
  },
  cracha: {
    label: 'Crachá',
    shortLabel: 'Crachá / Cartão',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
    description: 'Emissão ou 2ª via de carteira de estudante / crachá de acesso',
    defaultAmount: 350
  },
  manual: {
    label: 'Manual',
    shortLabel: 'Manual Didático',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
    description: 'Apostilas, manuais técnicos e módulos impressos',
    defaultAmount: 850
  },
  uniforme: {
    label: 'Uniforme',
    shortLabel: 'Uniforme / EPI',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
    description: 'Farda escolar, batas técnicas e equipamentos de proteção individual',
    defaultAmount: 1800
  },
  declaracao: {
    label: 'Declaração',
    shortLabel: 'Declaração',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    description: 'Declaração com ou sem notas, guias de transferência e termos',
    defaultAmount: 400
  },
  propina: {
    label: 'Propina',
    shortLabel: 'Propina',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    description: 'Propina mensal de curso ou formação',
    defaultAmount: 3000
  },
  avaliacao: {
    label: 'Avaliação',
    shortLabel: 'Exame / Recurso',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    description: 'Taxa para prova de recurso, exame especial ou reavaliação',
    defaultAmount: 750
  },
  exame: {
    label: 'Exame',
    shortLabel: 'Exame Especial',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    description: 'Taxa para exame de recurso, exame de equivalência ou final',
    defaultAmount: 850
  },
  multa: {
    label: 'Multa',
    shortLabel: 'Multa por Atraso',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-400',
    description: 'Multa por atraso no pagamento ou infração regulamentar',
    defaultAmount: 500
  },
  outros: {
    label: 'Outros',
    shortLabel: 'Outros Serviços',
    badgeBg: 'bg-slate-500/10',
    badgeText: 'text-slate-400',
    description: 'Taxas administrativas avulsas, alugueres e serviços complementares',
    defaultAmount: 300
  }
};

export type PayableTargetType = 'fornecedor' | 'funcionario' | 'servico' | 'despesa';

export type PayableExpenseCategory = 
  | 'Pessoal e Salários'
  | 'Infraestrutura & Instalações'
  | 'Material Didático & Gráfica'
  | 'Serviços Terceirizados'
  | 'Tecnologia & Softwares'
  | 'Manutenção & Equipamentos'
  | 'Tributária & Taxas Legais'
  | 'Outras Despesas Operacionais';

export interface ContaReceber {
  id: string;
  institutionId: string;
  branchId?: string;
  category: ReceivableCategory;
  description?: string;
  title?: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  classGroupId?: string;
  classGroupName?: string;
  courseName?: string;
  debtorName?: string;
  debtorPhone?: string;
  amount: number;
  fine?: number;
  interest?: number;
  discount?: number;
  totalAmount?: number;
  paidAmount?: number;
  dueDate: string;
  issueDate?: string;
  paymentDate?: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'parcial';
  paymentMethod?: 'Dinheiro' | 'M-Pesa' | 'e-Mola' | 'Ponto24' | 'Transferência Bancária' | 'POS' | string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContaPagar {
  id: string;
  institutionId: string;
  branchId?: string;
  targetType?: PayableTargetType;
  fornecedor?: string;
  supplierName?: string;
  funcionario?: string;
  servico?: string;
  despesa?: string;
  title?: string;
  categoria?: PayableExpenseCategory | string;
  category?: string;
  data?: string;
  dueDate?: string;
  valor?: number;
  amount?: number;
  invoiceNumber?: string;
  paymentDate?: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  paymentMethod?: 'Transferência Bancária' | 'M-Pesa' | 'e-Mola' | 'Dinheiro (Caixa)' | 'Cheque' | 'POS' | string;
  bankAccount?: string;
  notes?: string;
  paidBy?: string;
  deductFromCash?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FinancialStatsSummary {
  totalReceberPendente: number;
  totalReceberAtrasado: number;
  totalRecebidoMes: number;
  totalPagarPendente: number;
  totalPagarAtrasado: number;
  totalPagoMes: number;
  saldoProjetado: number;
  taxaInadimplencia: number;
}

// ==========================================================
// 30. MÓDULO DE PAGAMENTOS (PORTAL EFETUAR PAGAMENTO)
// ==========================================================
export type PaymentServiceItem =
  | 'inscrição'
  | 'mensalidade'
  | 'avaliação'
  | 'manual'
  | 'uniforme'
  | 'crachá'
  | 'certificado'
  | 'declaração'
  | 'multa'
  | 'outros';

export type PaymentNetwork = 'M-Pesa' | 'e-Mola' | 'Ponto24' | 'Transferência Bancária' | 'Dinheiro' | 'Banco (BIM)' | string;

export type PaymentStatus =
  | 'PENDENTE DE CONFIRMAÇÃO'
  | 'PAGO'
  | 'REJEITADO'
  | 'CORREÇÃO SOLICITADA';

export interface PaymentAuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
}

export interface PaymentRecord {
  id: string;
  institutionId?: string;
  branchId?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentPhone?: string;
  courseName?: string;
  
  // Aluno escolhe
  serviceItem?: PaymentServiceItem;
  serviceDescription?: string;

  // Mostrar
  suggestedAmount?: number;
  emolaNumber?: string;
  mpesaNumber?: string;
  beneficiary?: string;
  instructions?: string;

  // Aluno informa
  transactionCode: string;
  amount: number;
  date: string;
  time: string;
  network: PaymentNetwork;
  proofUrl?: string;
  proofFileName?: string;
  studentNotes?: string;
  className?: string;
  classGroupName?: string;
  documentNumber?: string;
  feeType?: string;
  monthReference?: string;

  // Estado inicial e fluxo
  status: PaymentStatus;
  createdAt: string;

  // Administrador
  reviewedBy?: string;
  reviewedAt?: string;
  correctionNotes?: string;
  rejectionReason?: string;

  // Ao aprovar
  receiptNumber?: string;
  serviceReleased: boolean;
  serviceReleasedAt?: string;
  serviceReleaseMessage?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  auditTrail: PaymentAuditEntry[];

  // 32. Recibos & Reimpressão sem duplicar
  reprintCount?: number;
  lastReprintedAt?: string;
  lastReprintedBy?: string;
  qrCodeEnabled?: boolean;
}

export const PAYMENT_SERVICE_CATALOG: Record<PaymentServiceItem, {
  label: string;
  defaultAmount: number;
  description: string;
  serviceReleaseDetail: string;
  colorBadge: string;
}> = {
  'inscrição': {
    label: 'Inscrição',
    defaultAmount: 1500,
    description: 'Taxa de candidatura e admissão discente no curso',
    serviceReleaseDetail: 'Matrícula confirmada e liberação de vaga oficial no ano letivo',
    colorBadge: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  'mensalidade': {
    label: 'Mensalidade',
    defaultAmount: 4500,
    description: 'Propina mensal de formação técnico-profissional',
    serviceReleaseDetail: 'Quitação da propina do mês corrente e baixa no carnê de pagamento',
    colorBadge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  'avaliação': {
    label: 'Avaliação',
    defaultAmount: 750,
    description: 'Taxa para prova de recurso, exame especial ou reavaliação pedagógica',
    serviceReleaseDetail: 'Autorização e inclusão na pauta oficial de exame / prova de recurso',
    colorBadge: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  },
  'manual': {
    label: 'Manual',
    defaultAmount: 850,
    description: 'Apostilas, manuais técnicos e módulos didáticos oficiais',
    serviceReleaseDetail: 'Ordem de levantamento no setor pedagógico e liberação para download',
    colorBadge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  },
  'uniforme': {
    label: 'Uniforme',
    defaultAmount: 1800,
    description: 'Farda escolar, batas técnicas e equipamentos de proteção individual',
    serviceReleaseDetail: 'Ordem de entrega liberada na alfaiataria / almoxarifado central',
    colorBadge: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
  },
  'crachá': {
    label: 'Crachá',
    defaultAmount: 350,
    description: 'Emissão ou 2ª via de carteira de estudante / crachá com QR Code',
    serviceReleaseDetail: 'Credencial liberada para operação (ID card for operation) e portaria',
    colorBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  },
  'certificado': {
    label: 'Certificado',
    defaultAmount: 1200,
    description: 'Emissão de certificado de conclusão ou diploma homologado SIVEC',
    serviceReleaseDetail: 'Chancela digital liberada e registro público no SIVEC autenticado',
    colorBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  'declaração': {
    label: 'Declaração',
    defaultAmount: 400,
    description: 'Declaração de frequência com ou sem notas, guias e certidões',
    serviceReleaseDetail: 'Declaração acadêmica emitida com assinatura e carimbo digital',
    colorBadge: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
  },
  'multa': {
    label: 'Multa',
    defaultAmount: 500,
    description: 'Taxa por atraso no pagamento ou penalidade regulamentar',
    serviceReleaseDetail: 'Encargo extinto e regularização cadastral na tesouraria',
    colorBadge: 'bg-red-500/10 text-red-400 border-red-500/20'
  },
  'outros': {
    label: 'Outros',
    defaultAmount: 300,
    description: 'Taxas administrativas avulsas, alugueres e serviços complementares',
    serviceReleaseDetail: 'Serviço complementar homologado pela Administração Escolar',
    colorBadge: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
};
