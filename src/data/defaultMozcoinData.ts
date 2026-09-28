import { 
  MozcoinWallet, 
  MozcoinTransaction, 
  MozcoinPurchaseRequest, 
  MozcoinDiscountRule, 
  MozcoinEcosystemService,
  MoztechwaveIdentity 
} from '../types';

/**
 * Catálogo de Serviços do Ecossistema Consumíveis em MOZCOIN
 */
export const DEFAULT_ECOSYSTEM_SERVICES: MozcoinEcosystemService[] = [
  {
    id: 'srv-sivec-cert',
    code: 'SIVEC-CERT-UNIT',
    name: 'Homologação e Selo SIVEC (Por Certificado)',
    category: 'sivec',
    costMozcoin: 25,
    unit: 'por_emissao',
    description: 'Chancela digital de autenticidade no Repositório Nacional SIVEC, geração de QR Code antifraude e passaporte do graduado.',
    icon: 'ShieldCheck',
    isAvailable: true
  },
  {
    id: 'srv-whatsapp-1000',
    code: 'WA-PACK-1000',
    name: 'Pacote de Notificações WhatsApp (1.000 Envios)',
    category: 'comunicacao',
    costMozcoin: 350,
    unit: 'por_mil',
    description: 'Envio de cobranças automáticas, avisos de faltas, confirmação de pagamentos e alertas de portaria aos encarregados.',
    icon: 'MessageSquare',
    isAvailable: true
  },
  {
    id: 'srv-ai-doc-reader',
    code: 'AI-DOC-OCR-50',
    name: 'Processamento de Documentos com IA Moztechwave (Lote de 50)',
    category: 'ia',
    costMozcoin: 150,
    unit: 'por_requisicao',
    description: 'Leitura automática e OCR inteligente de BIs moçambicanos, talões de depósito bancário e certificados escolares.',
    icon: 'Sparkles',
    isAvailable: true
  },
  {
    id: 'srv-multi-branch',
    code: 'MOD-MULTI-BRANCH',
    name: 'Módulo de Gestão Multi-Filial / Multi-Campus (Mensal)',
    category: 'planos',
    costMozcoin: 1000,
    unit: 'por_mes',
    description: 'Sincronização entre sede e delegações provinciais com orçamentação segregada e transferências inter-turmas.',
    icon: 'Building2',
    isAvailable: true
  },
  {
    id: 'srv-storage-50gb',
    code: 'CLOUD-STORAGE-50GB',
    name: 'Armazenamento em Nuvem Extra (50 GB / Mês)',
    category: 'infra',
    costMozcoin: 400,
    unit: 'por_mes',
    description: 'Espaço redundante para guarda de dossiês de formandos, cópias digitalizadas de BI e atas de avaliação pedagógica.',
    icon: 'HardDrive',
    isAvailable: true
  },
  {
    id: 'srv-pvc-cards',
    code: 'STUDIO-PVC-CARD-PACK',
    name: 'Lote de Cartões de Estudante / Operador (100 Emissões)',
    category: 'documentos',
    costMozcoin: 200,
    unit: 'por_estudante',
    description: 'Emissão em alta fidelidade no Document Studio com layout frente/verso e código de barras para portaria.',
    icon: 'CreditCard',
    isAvailable: true
  }
];

/**
 * Regras de Desconto para Planos Antecipados (Requisito 86.5)
 * O Super Admin pode editar, criar ou desativar qualquer regra.
 */
export const DEFAULT_DISCOUNT_RULES: MozcoinDiscountRule[] = [
  {
    id: 'rule-3-months',
    monthsAdvance: 3,
    title: 'Trimestral Antecipado',
    discountPercentage: 10,
    bonusMozcoins: 50,
    minMozcoins: 1000,
    description: '10% de desconto imediato + 50 MOZCOIN de bónus para aquisições de 3 meses ou mais.',
    isActive: true,
    applicableServices: ['todos'],
    createdAt: '2026-01-15',
    updatedAt: '2026-09-01'
  },
  {
    id: 'rule-6-months',
    monthsAdvance: 6,
    title: 'Semestral Fidelidade',
    discountPercentage: 18,
    bonusMozcoins: 200,
    minMozcoins: 2500,
    description: '18% de desconto na fatura global + 200 MOZCOIN creditadas diretamente na carteira institucional.',
    isActive: true,
    applicableServices: ['todos'],
    createdAt: '2026-01-15',
    updatedAt: '2026-09-01'
  },
  {
    id: 'rule-12-months',
    monthsAdvance: 12,
    title: 'Anual Corporativo Platinum',
    discountPercentage: 30,
    bonusMozcoins: 750,
    minMozcoins: 5000,
    description: '30% de desconto na anuidade integral + 750 MOZCOIN de crédito livre para qualquer serviço do ecossistema.',
    isActive: true,
    applicableServices: ['todos'],
    createdAt: '2026-01-15',
    updatedAt: '2026-09-10'
  }
];

/**
 * Carteiras Iniciais (Utilizador & Institucionais)
 */
export const DEFAULT_MOZCOIN_WALLETS: MozcoinWallet[] = [
  // Carteira do Super Admin / CEO
  {
    id: 'wlt-superadmin-01',
    ownerType: 'user',
    ownerId: 'usr-superadmin',
    ownerName: 'Paulo Jafim (Super Admin / CEO)',
    ownerEmail: 'jafimpaulo8@gmail.com',
    institutionId: 'inst-1',
    balance: 15400,
    totalCredited: 25000,
    totalDebited: 9600,
    pendingPurchases: 0,
    lastTransactionAt: '2026-09-22 14:30',
    createdAt: '2026-01-01',
    updatedAt: '2026-09-22'
  },
  // Carteira Institucional: Centro de Formação Técnico-Profissional de Moçambique
  {
    id: 'wlt-inst-cftpm',
    ownerType: 'institution',
    ownerId: 'inst-1',
    ownerName: 'Centro de Formação Técnico-Profissional de Moçambique (CFTPM)',
    ownerEmail: 'cftpm@moztechwave.co.mz',
    institutionId: 'inst-1',
    balance: 8750,
    totalCredited: 15000,
    totalDebited: 6250,
    pendingPurchases: 2500,
    lastTransactionAt: '2026-09-21 10:15',
    createdAt: '2026-01-05',
    updatedAt: '2026-09-21'
  },
  // Carteira Institucional: Instituto Politécnico do Sul
  {
    id: 'wlt-inst-ips',
    ownerType: 'institution',
    ownerId: 'inst-2',
    ownerName: 'Instituto Politécnico do Sul (IPS)',
    ownerEmail: 'ips@politecnico.ac.mz',
    institutionId: 'inst-2',
    balance: 3200,
    totalCredited: 5000,
    totalDebited: 1800,
    pendingPurchases: 0,
    lastTransactionAt: '2026-09-18 16:45',
    createdAt: '2026-02-10',
    updatedAt: '2026-09-18'
  },
  // Carteira Utilizador Diretor
  {
    id: 'wlt-usr-diretor-cftpm',
    ownerType: 'user',
    ownerId: 'usr-dir-01',
    ownerName: 'Dr. Alberto Mondlane (Direção Pedagógica)',
    ownerEmail: 'diretoria@cftpm.mz',
    institutionId: 'inst-1',
    balance: 1200,
    totalCredited: 2000,
    totalDebited: 800,
    pendingPurchases: 0,
    lastTransactionAt: '2026-09-19 11:20',
    createdAt: '2026-01-12',
    updatedAt: '2026-09-19'
  }
];

/**
 * Transações Iniciais no Extrato Imutável
 */
export const DEFAULT_MOZCOIN_TRANSACTIONS: MozcoinTransaction[] = [
  {
    id: 'tx-mc-001',
    walletId: 'wlt-inst-cftpm',
    ownerId: 'inst-1',
    ownerName: 'CFTPM',
    ownerType: 'institution',
    type: 'compra',
    amount: 5000,
    previousBalance: 0,
    newBalance: 5000,
    origin: 'Vodacom M-Pesa #MP260901-8842',
    destination: 'Carteira Institucional CFTPM',
    status: 'concluido',
    description: 'Aquisição de créditos operacionais homologada pelo Super Admin.',
    timestamp: '2026-09-01 09:15:20',
    operator: 'Super Admin / CEO',
    referenceCode: 'MOZ-BUY-9810'
  },
  {
    id: 'tx-mc-002',
    walletId: 'wlt-inst-cftpm',
    ownerId: 'inst-1',
    ownerName: 'CFTPM',
    ownerType: 'institution',
    type: 'consumo_servico',
    amount: -750,
    previousBalance: 5000,
    newBalance: 4250,
    origin: 'Carteira Institucional CFTPM',
    destination: 'Chancela Digital SIVEC',
    serviceRef: 'srv-sivec-cert',
    status: 'concluido',
    description: 'Emissão e selo de autenticidade para lote de 30 certificados do Curso de Eletricidade.',
    timestamp: '2026-09-05 14:22:10',
    operator: 'Secretaria Acadêmica',
    referenceCode: 'SIVEC-BATCH-409'
  },
  {
    id: 'tx-mc-003',
    walletId: 'wlt-inst-cftpm',
    ownerId: 'inst-1',
    ownerName: 'CFTPM',
    ownerType: 'institution',
    type: 'plano_antecipado',
    amount: -2500,
    previousBalance: 4250,
    newBalance: 1750,
    origin: 'Carteira Institucional CFTPM',
    destination: 'Módulo Multi-Filial 3 Meses',
    serviceRef: 'srv-multi-branch',
    status: 'concluido',
    description: 'Assinatura antecipada trimestral do módulo Multi-Filial com desconto promocional de 10%.',
    timestamp: '2026-09-10 16:04:45',
    operator: 'Direção Geral',
    referenceCode: 'PLAN-ADV-TRIM-01'
  },
  {
    id: 'tx-mc-004',
    walletId: 'wlt-inst-cftpm',
    ownerId: 'inst-1',
    ownerName: 'CFTPM',
    ownerType: 'institution',
    type: 'compra',
    amount: 7000,
    previousBalance: 1750,
    newBalance: 8750,
    origin: 'Millennium BIM Transferência #TRF-982711',
    destination: 'Carteira Institucional CFTPM',
    status: 'concluido',
    description: 'Recarga institucional de 7.000 MOZCOIN aprovada pela tesouraria central.',
    timestamp: '2026-09-15 11:30:00',
    operator: 'Super Admin / CEO',
    referenceCode: 'MOZ-BUY-9920'
  },
  {
    id: 'tx-mc-005',
    walletId: 'wlt-superadmin-01',
    ownerId: 'usr-superadmin',
    ownerName: 'Paulo Jafim',
    ownerType: 'user',
    type: 'bonus',
    amount: 1000,
    previousBalance: 14400,
    newBalance: 15400,
    origin: 'Moztechwave Ecosystem Engine',
    destination: 'Carteira Master CEO',
    status: 'concluido',
    description: 'Crédito de bonificação para testes de novas funcionalidades e IA.',
    timestamp: '2026-09-22 14:30:12',
    operator: 'Sistema Central',
    referenceCode: 'BONUS-CORE-001'
  }
];

/**
 * Pedidos Iniciais de Compra de MOZCOIN (Requisito 86.1 & 86.2)
 */
export const DEFAULT_MOZCOIN_PURCHASES: MozcoinPurchaseRequest[] = [
  {
    id: 'pur-mc-001',
    userId: 'usr-dir-01',
    userName: 'Dr. Alberto Mondlane',
    userEmail: 'diretoria@cftpm.mz',
    userRole: 'DIRETOR',
    institutionId: 'inst-1',
    institutionName: 'CFTPM',
    targetWallet: 'institution',
    mozcoinAmount: 2500,
    fiatAmount: 2500,
    rate: 1,
    paymentMethod: 'mpesa',
    transactionCode: 'MP260922.88392.A',
    paymentDate: '2026-09-22',
    paymentTime: '15:40',
    network: 'Vodacom M-Pesa',
    proofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    proofFileName: 'comprovativo_mpesa_2500mzn.pdf',
    status: 'pendente',
    createdAt: '2026-09-22T15:42:00Z',
    updatedAt: '2026-09-22T15:42:00Z'
  },
  {
    id: 'pur-mc-002',
    userId: 'usr-fin-02',
    userName: 'Teresa Cossa (Tesouraria IPS)',
    userEmail: 'financeiro@politecnico.ac.mz',
    userRole: 'FINANCEIRO',
    institutionId: 'inst-2',
    institutionName: 'Instituto Politécnico do Sul',
    targetWallet: 'institution',
    mozcoinAmount: 5000,
    fiatAmount: 5000,
    rate: 1,
    paymentMethod: 'transferencia_bancaria',
    transactionCode: 'BIM-EFT-994821',
    paymentDate: '2026-09-21',
    paymentTime: '11:15',
    network: 'Millennium BIM',
    proofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    proofFileName: 'talao_transferencia_bim_5000.pdf',
    status: 'aprovado',
    reviewedBy: 'Paulo Jafim (Super Admin)',
    reviewedAt: '2026-09-21T12:00:00Z',
    createdAt: '2026-09-21T11:20:00Z',
    updatedAt: '2026-09-21T12:00:00Z'
  },
  {
    id: 'pur-mc-003',
    userId: 'usr-sec-03',
    userName: 'Manuel Sitoe',
    userEmail: 'secretaria@cftpm.mz',
    userRole: 'SECRETARIA',
    institutionId: 'inst-1',
    institutionName: 'CFTPM',
    targetWallet: 'user',
    mozcoinAmount: 500,
    fiatAmount: 500,
    rate: 1,
    paymentMethod: 'emola',
    transactionCode: 'EMOLA-883921',
    paymentDate: '2026-09-20',
    paymentTime: '16:05',
    network: 'Movitel e-Mola',
    status: 'correcao_solicitada',
    reviewedBy: 'Paulo Jafim (Super Admin)',
    reviewedAt: '2026-09-20T17:10:00Z',
    correctionNotes: 'O código de transação e-Mola informado parece truncado (faltam os últimos 2 dígitos). Por favor anexe o print do SMS ou retifique o código.',
    createdAt: '2026-09-20T16:10:00Z',
    updatedAt: '2026-09-20T17:10:00Z'
  }
];

/**
 * Identidades Moztechwave ID Iniciais (Requisito 87)
 */
export const DEFAULT_MOZTECHWAVE_IDENTITIES: MoztechwaveIdentity[] = [
  {
    mwId: 'MWID-MZ-2026-0001',
    fullName: 'Paulo Jafim',
    email: 'jafimpaulo8@gmail.com',
    phone: '+258 84 399 2811',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    nationalId: '110100492819B',
    primaryRole: 'SUPER_ADMIN',
    securityLevel: '2fa_ativo',
    twoFactorEnabled: true,
    walletId: 'wlt-superadmin-01',
    memberships: [
      {
        institutionId: 'inst-1',
        institutionName: 'Centro de Formação Técnico-Profissional de Moçambique',
        institutionCode: 'MTW-CF-0001',
        role: 'SUPER_ADMIN',
        branches: ['todas'],
        isDefault: true
      },
      {
        institutionId: 'inst-2',
        institutionName: 'Instituto Politécnico do Sul',
        institutionCode: 'MTW-CF-0002',
        role: 'SUPER_ADMIN',
        branches: ['todas']
      }
    ],
    lastLoginAt: '2026-09-23 08:45',
    lastLoginIp: '197.249.10.42',
    createdAt: '2026-01-01'
  },
  {
    mwId: 'MWID-MZ-2026-0042',
    fullName: 'Dr. Alberto Mondlane',
    email: 'diretoria@cftpm.mz',
    phone: '+258 84 555 1234',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    nationalId: '110293819283M',
    primaryRole: 'DIRETOR',
    securityLevel: 'padrao',
    twoFactorEnabled: false,
    walletId: 'wlt-usr-diretor-cftpm',
    memberships: [
      {
        institutionId: 'inst-1',
        institutionName: 'Centro de Formação Técnico-Profissional de Moçambique',
        institutionCode: 'MTW-CF-0001',
        role: 'DIRETOR',
        branches: ['branch-maputo-sede', 'branch-matola'],
        isDefault: true
      }
    ],
    lastLoginAt: '2026-09-22 15:30',
    lastLoginIp: '197.249.12.18',
    createdAt: '2026-01-10'
  }
];
