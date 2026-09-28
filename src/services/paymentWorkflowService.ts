/**
 * paymentWorkflowService.ts
 * Módulo 72: Fluxo Completo de Pagamento
 *
 * Pipeline Sequencial Estrito de 15 Etapas:
 * 1.  Aluno
 * 2.  Efetuar pagamento
 * 3.  Selecionar serviço
 * 4.  Ver instruções
 * 5.  Pagar
 * 6.  Enviar código
 * 7.  Pendente de confirmação
 * 8.  Financeiro/Diretor
 * 9.  Aprovar
 * 10. Pago
 * 11. Atualizar conta
 * 12. Liberar serviço
 * 13. Gerar recibo
 * 14. Notificar aluno
 * 15. Auditoria
 */

export type PaymentStepKey =
  | 'aluno'
  | 'efetuar_pagamento'
  | 'selecionar_servico'
  | 'ver_instrucoes'
  | 'pagar'
  | 'enviar_codigo'
  | 'pendente_confirmacao'
  | 'financeiro_diretor'
  | 'aprovar'
  | 'pago'
  | 'atualizar_conta'
  | 'liberar_servico'
  | 'gerar_recibo'
  | 'notificar_aluno'
  | 'auditoria';

export interface PaymentStepDefinition {
  stepNumber: number;
  key: PaymentStepKey;
  label: string;
  actor: 'Aluno' | 'Financeiro/Diretor' | 'Sistema Reativo' | 'Auditoria Zero-Trust';
  description: string;
  actionText?: string;
}

export const PAYMENT_WORKFLOW_STEPS: PaymentStepDefinition[] = [
  {
    stepNumber: 1,
    key: 'aluno',
    label: '1. Aluno',
    actor: 'Aluno',
    description: 'Estudante acessa o Portal do Aluno ou dirige-se à secretaria/balcão de atendimento.',
    actionText: 'Identificar Aluno'
  },
  {
    stepNumber: 2,
    key: 'efetuar_pagamento',
    label: '2. Efetuar pagamento',
    actor: 'Aluno',
    description: 'Abertura da interface financeira para liquidação de valores devidos ou solicitação de serviços.',
    actionText: 'Iniciar Pagamento'
  },
  {
    stepNumber: 3,
    key: 'selecionar_servico',
    label: '3. Selecionar serviço',
    actor: 'Aluno',
    description: 'Seleção do item a liquidar: Propina Mensal, Taxa de Matrícula, 2ª Via de Cartão, Certificado, etc.',
    actionText: 'Escolher Serviço'
  },
  {
    stepNumber: 4,
    key: 'ver_instrucoes',
    label: '4. Ver instruções',
    actor: 'Aluno',
    description: 'Apresentação das referências de pagamento em Moçambique: M-Pesa (*150#), e-Mola (*898#) ou Conta Bancária (BIM/BCI).',
    actionText: 'Consultar Referência'
  },
  {
    stepNumber: 5,
    key: 'pagar',
    label: '5. Pagar',
    actor: 'Aluno',
    description: 'Execução do débito pelo aluno no seu telemóvel móvel, internet banking ou agente credenciado.',
    actionText: 'Executar Débito'
  },
  {
    stepNumber: 6,
    key: 'enviar_codigo',
    label: '6. Enviar código',
    actor: 'Aluno',
    description: 'Inserção do código da transação financeira (ID M-Pesa / e-Mola / comprovativo bancário) para conferência.',
    actionText: 'Submeter Código'
  },
  {
    stepNumber: 7,
    key: 'pendente_confirmacao',
    label: '7. Pendente de confirmação',
    actor: 'Sistema Reativo',
    description: 'Transação entra no livro de conferências da tesouraria com status PENDENTE e trava de segurança ativa.',
    actionText: 'Registrar Pendência'
  },
  {
    stepNumber: 8,
    key: 'financeiro_diretor',
    label: '8. Financeiro/Diretor',
    actor: 'Financeiro/Diretor',
    description: 'Notificação do tesoureiro ou diretor financeiro para inspecionar o extrato bancário ou webhook oficial.',
    actionText: 'Conferir no Extrato'
  },
  {
    stepNumber: 9,
    key: 'aprovar',
    label: '9. Aprovar',
    actor: 'Financeiro/Diretor',
    description: 'Ação executiva e irrevogável de deferimento do pagamento com autenticação de 2 fatores do operador.',
    actionText: 'Aprovar Pagamento'
  },
  {
    stepNumber: 10,
    key: 'pago',
    label: '10. Pago',
    actor: 'Sistema Reativo',
    description: 'Status oficial da fatura convertido em PAGO (Liquidado), impossibilitando cobranças duplicadas.',
    actionText: 'Consolidar Status'
  },
  {
    stepNumber: 11,
    key: 'atualizar_conta',
    label: '11. Atualizar conta',
    actor: 'Sistema Reativo',
    description: 'Conta corrente do aluno recalculada em tempo real: saldo devedor zerado e crédito averbado.',
    actionText: 'Ajustar Balanço'
  },
  {
    stepNumber: 12,
    key: 'liberar_servico',
    label: '12. Liberar serviço',
    actor: 'Sistema Reativo',
    description: 'Desbloqueio atômico de acessos: catraca e portaria física, pautas, visualização de notas e emissão documental.',
    actionText: 'Desbloquear Acessos'
  },
  {
    stepNumber: 13,
    key: 'gerar_recibo',
    label: '13. Gerar recibo',
    actor: 'Sistema Reativo',
    description: 'Emissão do Recibo Fiscal Eletrónico oficial com número de assento sequencial, QR Code e selo SHA-256.',
    actionText: 'Emitir Recibo'
  },
  {
    stepNumber: 14,
    key: 'notificar_aluno',
    label: '14. Notificar aluno',
    actor: 'Sistema Reativo',
    description: 'Envio automatizado de mensagem no WhatsApp do estudante/encarregado com o recibo em anexo e notificação in-app.',
    actionText: 'Disparar WhatsApp'
  },
  {
    stepNumber: 15,
    key: 'auditoria',
    label: '15. Auditoria',
    actor: 'Auditoria Zero-Trust',
    description: 'Registro no log imutável de transações financeiras com ID do operador, IP, data/hora e assinatura criptográfica.',
    actionText: 'Gravar Auditoria'
  }
];

export interface PaymentServiceOption {
  id: string;
  name: string;
  category: 'Propina' | 'Matrícula' | 'Documentos' | 'Exames' | 'Outros';
  amountMzn: number;
  description: string;
}

export const AVAILABLE_PAYMENT_SERVICES: PaymentServiceOption[] = [
  {
    id: 'srv_propina_mensal',
    name: 'Propina Mensal (Mês Corrente)',
    category: 'Propina',
    amountMzn: 3500,
    description: 'Mensalidade regular do curso técnico profissional com liberação de frequência e portaria.'
  },
  {
    id: 'srv_taxa_matricula',
    name: 'Taxa de Matrícula & Processo',
    category: 'Matrícula',
    amountMzn: 2000,
    description: 'Abertura de ficha de estudante, pasta biográfica e atribuição de número de aluno.'
  },
  {
    id: 'srv_declaracao_notas',
    name: 'Declaração com Notas & Frequência',
    category: 'Documentos',
    amountMzn: 750,
    description: 'Documento impresso e assinado pela Direção Pedagógica com selo de autenticidade.'
  },
  {
    id: 'srv_exame_recurso',
    name: 'Exame de Recurso Extraordinário',
    category: 'Exames',
    amountMzn: 1200,
    description: 'Inscrição para realização de exame de época especial perante o júri.'
  },
  {
    id: 'srv_carteirinha_segunda_via',
    name: '2.ª Via de Carteirinha com Chip/QR',
    category: 'Outros',
    amountMzn: 500,
    description: 'Emissão de novo cartão de acesso físico à portaria e biblioteca institucional.'
  }
];

export interface PaymentOrderRecord {
  id: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  biNumber: string;
  serviceId: string;
  serviceName: string;
  amountMzn: number;
  paymentMethod: 'M-Pesa' | 'e-Mola' | 'Transferência BIM' | 'Transferência BCI' | 'POS Caixa';
  transactionReference: string;
  currentStepIndex: number; // 0 to 14
  status: 'PENDENTE' | 'PAGO' | 'REJEITADO';
  stepLogs: {
    stepKey: PaymentStepKey;
    completedAt: string;
    actor: string;
    details?: string;
  }[];
  receiptMetadata?: {
    receiptNumber: string;
    qrVerificationUrl: string;
    sha256Hash: string;
    issuedAt: string;
    authorizedBy: string;
  };
}

export const INITIAL_PAYMENT_ORDERS: PaymentOrderRecord[] = [
  {
    id: 'pay_ord_001',
    orderNumber: 'PAG-2026-08412',
    studentId: 'std_001',
    studentName: 'Samora Moisés Machel Júnior',
    studentNumber: 'ALU-2026-0041',
    biNumber: '110100459812A',
    serviceId: 'srv_propina_mensal',
    serviceName: 'Propina Mensal (Setembro/2026)',
    amountMzn: 3500,
    paymentMethod: 'M-Pesa',
    transactionReference: 'MP260922.0841.B71829',
    currentStepIndex: 14, // Completo até Auditoria
    status: 'PAGO',
    stepLogs: [
      { stepKey: 'aluno', completedAt: '2026-09-22T08:00:00Z', actor: 'Aluno (Portal)', details: 'Sessão iniciada' },
      { stepKey: 'efetuar_pagamento', completedAt: '2026-09-22T08:01:00Z', actor: 'Aluno (Portal)', details: 'Ação de pagamento aberta' },
      { stepKey: 'selecionar_servico', completedAt: '2026-09-22T08:01:30Z', actor: 'Aluno (Portal)', details: 'Propina Mensal 3.500 MT' },
      { stepKey: 'ver_instrucoes', completedAt: '2026-09-22T08:02:00Z', actor: 'Sistema Reativo', details: 'Conta M-Pesa 849922001' },
      { stepKey: 'pagar', completedAt: '2026-09-22T08:03:00Z', actor: 'Vodacom M-Pesa', details: 'Transação debitada via telemóvel' },
      { stepKey: 'enviar_codigo', completedAt: '2026-09-22T08:04:00Z', actor: 'Aluno (Portal)', details: 'Ref: MP260922.0841.B71829 submetida' },
      { stepKey: 'pendente_confirmacao', completedAt: '2026-09-22T08:04:05Z', actor: 'Sistema Reativo', details: 'Fatura colocada na fila da tesouraria' },
      { stepKey: 'financeiro_diretor', completedAt: '2026-09-22T08:10:00Z', actor: 'Dra. Elsa Cossa (Tesoureira)', details: 'Extrato conciliado no banco' },
      { stepKey: 'aprovar', completedAt: '2026-09-22T08:12:00Z', actor: 'Dra. Elsa Cossa (Tesoureira)', details: 'Pagamento deferido com sucesso' },
      { stepKey: 'pago', completedAt: '2026-09-22T08:12:01Z', actor: 'Sistema Reativo', details: 'Status liquidado' },
      { stepKey: 'atualizar_conta', completedAt: '2026-09-22T08:12:02Z', actor: 'Sistema Reativo', details: 'Saldo devedor zerado: 0.00 MT' },
      { stepKey: 'liberar_servico', completedAt: '2026-09-22T08:12:03Z', actor: 'Sistema Reativo', details: 'Catraca e portaria desbloqueadas' },
      { stepKey: 'gerar_recibo', completedAt: '2026-09-22T08:12:04Z', actor: 'Sistema Reativo', details: 'Recibo n.º REC-2026-04192 emitido' },
      { stepKey: 'notificar_aluno', completedAt: '2026-09-22T08:12:05Z', actor: 'WhatsApp Cloud API', details: 'Mensagem e PDF disparados para 841234567' },
      { stepKey: 'auditoria', completedAt: '2026-09-22T08:12:06Z', actor: 'Auditoria Zero-Trust', details: 'Hash criptográfico gravado no ledger imutável' }
    ],
    receiptMetadata: {
      receiptNumber: 'REC-2026-04192',
      qrVerificationUrl: 'https://sigar.co.mz/recibos/REC-2026-04192',
      sha256Hash: '9b2d8f431a4781c0092c478a8f4c8996fb92427ae41e4649b934ca495991c491',
      issuedAt: '22 de Setembro de 2026, 08:12',
      authorizedBy: 'Dra. Elsa Cossa (Tesoureira-Geral)'
    }
  },
  {
    id: 'pay_ord_002',
    orderNumber: 'PAG-2026-08413',
    studentId: 'std_002',
    studentName: 'Graça Simbine Machel',
    studentNumber: 'ALU-2026-0099',
    biNumber: '110198456123B',
    serviceId: 'srv_declaracao_notas',
    serviceName: 'Declaração com Notas & Frequência',
    amountMzn: 750,
    paymentMethod: 'e-Mola',
    transactionReference: 'EM260922.0915.C44102',
    currentStepIndex: 6, // Pendente de confirmação (passo 7)
    status: 'PENDENTE',
    stepLogs: [
      { stepKey: 'aluno', completedAt: '2026-09-22T09:10:00Z', actor: 'Aluno (Portal)' },
      { stepKey: 'efetuar_pagamento', completedAt: '2026-09-22T09:11:00Z', actor: 'Aluno (Portal)' },
      { stepKey: 'selecionar_servico', completedAt: '2026-09-22T09:12:00Z', actor: 'Aluno (Portal)' },
      { stepKey: 'ver_instrucoes', completedAt: '2026-09-22T09:12:30Z', actor: 'Sistema Reativo' },
      { stepKey: 'pagar', completedAt: '2026-09-22T09:14:00Z', actor: 'Movitel e-Mola' },
      { stepKey: 'enviar_codigo', completedAt: '2026-09-22T09:15:00Z', actor: 'Aluno (Portal)', details: 'Código: EM260922.0915.C44102' },
      { stepKey: 'pendente_confirmacao', completedAt: '2026-09-22T09:15:02Z', actor: 'Sistema Reativo' }
    ]
  }
];
