// Sistema de Planos e Limites de Recursos Multi-Institucionais (Módulo 63)

export type PlanId = 'basico' | 'profissional' | 'empresarial' | 'enterprise';

export type PlanName = 'BÁSICO' | 'PROFISSIONAL' | 'EMPRESARIAL' | 'ENTERPRISE';

export interface PlanLimits {
  // 1. Alunos
  maxStudents: number; // -1 = ilimitado
  
  // 2. Utilizadores (Admin, Professores, Funcionários)
  maxUsers: number; // -1 = ilimitado
  
  // 3. Filiais / Polos / Delegações
  maxBranches: number; // -1 = ilimitado
  
  // 4. Armazenamento em Nuvem (GB)
  storageGB: number; // -1 = ilimitado
  
  // 5. Certificados Emitidos por Mês
  monthlyCertificates: number; // -1 = ilimitado
  
  // 6. Integração WhatsApp
  whatsappEnabled: boolean;
  whatsappMonthlyLimit: number; // Mensagens automáticas/mês (-1 = ilimitado)
  
  // 7. SIVEC (Sistema Integrado de Verificação de Credenciais)
  sivecEnabled: boolean;
  sivecMonthlyVerifications: number; // Verificações/mês (-1 = ilimitado)
  
  // 8. Aulas Online & Videoconferência
  onlineClassesEnabled: boolean;
  onlineClassesMaxHours: number; // Horas de transmissão/mês (-1 = ilimitado)
  
  // 9. Inteligência Artificial (Moztechwave AI)
  aiEnabled: boolean;
  aiMonthlyPrompts: number; // Consultas/mês (-1 = ilimitado)

  // Recursos Adicionais Opcionais
  customDomainEnabled?: boolean;
  apiAccessEnabled?: boolean;
  prioritySupport?: boolean;
  backupAutoDaily?: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: PlanName;
  tagline: string;
  description: string;
  priceMZN: number; // Valor em Meticais (MZN)
  billingPeriod: 'mensal' | 'anual';
  badgeColor: string;
  badge?: string;
  isPopular?: boolean;
  limits: PlanLimits;
  highlights: string[];
  billingCycles?: string[] | any;
}

export interface InstitutionUsageMetrics {
  students: number;
  users: number;
  branches: number;
  storageGB: number;
  monthlyCertificates: number;
  whatsappMonthlyMessages: number;
  sivecMonthlyVerifications: number;
  onlineClassesMonthlyHours: number;
  aiMonthlyPrompts: number;
  lastUpdated: string;
}

export interface InstitutionSubscription {
  planId: PlanId;
  planName: PlanName;
  status: 'active' | 'trial' | 'suspended' | 'expired';
  billingCycle: 'mensal' | 'trimestral' | 'anual';
  priceMZN: number;
  startDate: string;
  renewalDate: string;
  customLimitsOverride?: Partial<PlanLimits>; // Super Admin pode customizar recursos por instituição
  usage: InstitutionUsageMetrics;
  notes?: string;
  managedBySuperAdmin?: boolean;
}

// Configuração Padrão dos 4 Planos do Sistema Moztechwave
export const DEFAULT_PLANS: PlanDefinition[] = [
  {
    id: 'basico',
    name: 'BÁSICO',
    tagline: 'Ideal para centros pequenos e escolas comunitárias em fase inicial.',
    description: 'Gestão essencial de alunos, turmas, notas e boletins acadêmicos com foco em operação local.',
    priceMZN: 2500,
    billingPeriod: 'mensal',
    badgeColor: 'border-slate-600 text-slate-300 bg-slate-800/60',
    isPopular: false,
    limits: {
      maxStudents: 150,
      maxUsers: 3,
      maxBranches: 1,
      storageGB: 5,
      monthlyCertificates: 50,
      whatsappEnabled: false,
      whatsappMonthlyLimit: 0,
      sivecEnabled: false,
      sivecMonthlyVerifications: 0,
      onlineClassesEnabled: false,
      onlineClassesMaxHours: 0,
      aiEnabled: false,
      aiMonthlyPrompts: 0,
      customDomainEnabled: false,
      apiAccessEnabled: false,
      prioritySupport: false,
      backupAutoDaily: false
    },
    highlights: [
      'Até 150 alunos matriculados',
      'Até 3 utilizadores administrativos',
      '1 Sede / Filial única',
      '5 GB de armazenamento em nuvem',
      '50 certificados digitais por mês',
      'Boletins e pautas em PDF',
      'Suporte comunitário via e-mail'
    ]
  },
  {
    id: 'profissional',
    name: 'PROFISSIONAL',
    tagline: 'O mais escolhido por centros técnicos e colégios de médio porte.',
    description: 'Automações via WhatsApp, emissão contínua de certificados, relatórios financeiros e suporte SIVEC.',
    priceMZN: 6500,
    billingPeriod: 'mensal',
    badgeColor: 'border-blue-500 text-blue-400 bg-blue-950/60',
    isPopular: true,
    limits: {
      maxStudents: 600,
      maxUsers: 10,
      maxBranches: 2,
      storageGB: 30,
      monthlyCertificates: 300,
      whatsappEnabled: true,
      whatsappMonthlyLimit: 600,
      sivecEnabled: true,
      sivecMonthlyVerifications: 500,
      onlineClassesEnabled: true,
      onlineClassesMaxHours: 40,
      aiEnabled: true,
      aiMonthlyPrompts: 200,
      customDomainEnabled: false,
      apiAccessEnabled: false,
      prioritySupport: true,
      backupAutoDaily: true
    },
    highlights: [
      'Até 600 alunos matriculados',
      'Até 10 utilizadores com permissões RBAC',
      'Até 2 filiais / polos conectados',
      '30 GB de armazenamento de ficheiros',
      '300 certificados SIVEC com QR Code',
      '600 mensagens de WhatsApp automáticas/mês',
      'SIVEC Integrado com carimbo de autenticidade',
      '40 horas de aulas online / videoconferência',
      'Moztechwave AI: 200 prompts inteligentes/mês',
      'Backup automático diário'
    ]
  },
  {
    id: 'empresarial',
    name: 'EMPRESARIAL',
    tagline: 'Para grandes redes de ensino e institutos técnicos com filiais provinciais.',
    description: 'Elevada capacidade de alunos, múltiplos polos, IA generativa avançada, SIVEC pleno e automações massivas.',
    priceMZN: 16000,
    billingPeriod: 'mensal',
    badgeColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/60',
    isPopular: false,
    limits: {
      maxStudents: 2500,
      maxUsers: 35,
      maxBranches: 6,
      storageGB: 150,
      monthlyCertificates: 1500,
      whatsappEnabled: true,
      whatsappMonthlyLimit: 3000,
      sivecEnabled: true,
      sivecMonthlyVerifications: 3000,
      onlineClassesEnabled: true,
      onlineClassesMaxHours: 200,
      aiEnabled: true,
      aiMonthlyPrompts: 1000,
      customDomainEnabled: true,
      apiAccessEnabled: true,
      prioritySupport: true,
      backupAutoDaily: true
    },
    highlights: [
      'Até 2.500 alunos matriculados',
      'Até 35 utilizadores com RBAC avançado',
      'Até 6 filiais provinciais interligadas',
      '150 GB de armazenamento dedicado',
      '1.500 certificados digitais com SIVEC Pass',
      '3.000 mensagens automáticas via WhatsApp',
      'SIVEC Pleno com validação pública instantânea',
      '200 horas de aulas online com gravação',
      'Moztechwave AI: 1.000 consultas / análises pedagógicas',
      'Domínio próprio personalizado e API de integração'
    ]
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    tagline: 'Capacidade ilimitada e infraestrutura dedicada para universidades e ministérios.',
    description: 'Recursos irrestritos, instâncias isoladas, SLAs críticos e suporte 24/7 sob demanda governamental.',
    priceMZN: 38000,
    billingPeriod: 'mensal',
    badgeColor: 'border-amber-500 text-amber-400 bg-amber-950/60',
    isPopular: false,
    limits: {
      maxStudents: -1, // Ilimitado
      maxUsers: -1, // Ilimitado
      maxBranches: -1, // Ilimitado
      storageGB: 1000, // 1 TB ou Custom
      monthlyCertificates: -1, // Ilimitado
      whatsappEnabled: true,
      whatsappMonthlyLimit: -1, // Ilimitado
      sivecEnabled: true,
      sivecMonthlyVerifications: -1, // Ilimitado
      onlineClassesEnabled: true,
      onlineClassesMaxHours: -1, // Ilimitado
      aiEnabled: true,
      aiMonthlyPrompts: -1, // Ilimitado
      customDomainEnabled: true,
      apiAccessEnabled: true,
      prioritySupport: true,
      backupAutoDaily: true
    },
    highlights: [
      'Alunos Ilimitados em tempo real',
      'Utilizadores e docentes Ilimitados',
      'Filiais e delegações Ilimitadas',
      '1 TB+ Armazenamento de alta performance',
      'Certificados SIVEC Ilimitados',
      'WhatsApp Ilimitado com servidor dedicado',
      'SIVEC Nacional com verificação direta DINET/MEC',
      'Aulas Online Ilimitadas com salas paralelas',
      'Moztechwave AI Ilimitada com modelos dedicados',
      'SLA de 99.98% e Gerente de Contas dedicado 24/7'
    ]
  }
];

// Helper para obter os limites efetivos de uma instituição
export function getEffectiveLimits(
  planId: PlanId | string,
  customOverrides?: Partial<PlanLimits>
): PlanLimits {
  const normalizedId: PlanId = 
    planId.toLowerCase().includes('enterprise') ? 'enterprise' :
    planId.toLowerCase().includes('empresar') ? 'empresarial' :
    planId.toLowerCase().includes('prof') ? 'profissional' : 'basico';

  const basePlan = DEFAULT_PLANS.find(p => p.id === normalizedId) || DEFAULT_PLANS[0];

  if (!customOverrides) {
    return { ...basePlan.limits };
  }

  return {
    ...basePlan.limits,
    ...customOverrides
  };
}

// Helper para normalizar o nome do plano
export function normalizePlanName(plan: string): PlanName {
  const p = plan.toLowerCase();
  if (p.includes('enterprise')) return 'ENTERPRISE';
  if (p.includes('empresar')) return 'EMPRESARIAL';
  if (p.includes('prof')) return 'PROFISSIONAL';
  return 'BÁSICO';
}

// Helper para calcular percentual de uso de um recurso
export function calculateUsagePercentage(current: number, max: number): {
  percentage: number;
  isUnlimited: boolean;
  status: 'normal' | 'warning' | 'critical' | 'exceeded';
} {
  if (max === -1) {
    return { percentage: 0, isUnlimited: true, status: 'normal' };
  }
  if (max === 0) {
    return { percentage: 100, isUnlimited: false, status: 'exceeded' };
  }

  const percentage = Math.min(Math.round((current / max) * 100), 999);
  let status: 'normal' | 'warning' | 'critical' | 'exceeded' = 'normal';

  if (current > max) {
    status = 'exceeded';
  } else if (percentage >= 90) {
    status = 'critical';
  } else if (percentage >= 75) {
    status = 'warning';
  }

  return { percentage, isUnlimited: false, status };
}
