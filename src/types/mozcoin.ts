/**
 * MOZCOIN — Economia Interna da Plataforma Moztechwave
 * 
 * AVISO LEGAL E REGULATÓRIO:
 * A MOZCOIN não é moeda oficial de Moçambique, moeda bancária de curso forçado
 * nem criptomoeda regulamentada. É uma unidade de crédito interno da plataforma Moztechwave,
 * sujeita aos termos e condições contratuais do proprietário do sistema.
 */

import { UserRole } from './rbac';

export type MozcoinWalletOwnerType = 'user' | 'institution';

export interface MozcoinWallet {
  id: string;
  ownerType: MozcoinWalletOwnerType;
  ownerId: string; // userId ou institutionId
  ownerName: string;
  ownerEmail?: string;
  institutionId?: string; // se for carteira institucional ou utilizador de instituição
  balance: number; // Saldo líquido disponível em MOZCOIN
  totalCredited: number; // Entradas acumuladas
  totalDebited: number; // Saídas acumuladas
  pendingPurchases: number; // Créditos solicitados e aguardando aprovação
  lastTransactionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MozcoinTransactionType = 
  | 'compra'             // Aquisição via M-Pesa / e-Mola / Banco
  | 'consumo_servico'    // Uso em emissão de certificados, WhatsApp, IA, etc.
  | 'plano_antecipado'   // Aquisição antecipada de pacotes ou assinaturas com desconto
  | 'estorno'            // Reembolso administrativo
  | 'bonus'              // Bonificação ou fidelização promocional
  | 'transferencia'      // Transferência entre carteiras autorizadas
  | 'credito_admin'      // Crédito administrativo direto do Super Admin
  | 'debito_admin';      // Débito administrativo direto do Super Admin

export type MozcoinTransactionStatus = 'concluido' | 'pendente' | 'cancelado' | 'estornado';

export interface MozcoinTransaction {
  id: string;
  walletId: string;
  ownerId: string;
  ownerName: string;
  ownerType: MozcoinWalletOwnerType;
  type: MozcoinTransactionType;
  amount: number; // Positivo para crédito, negativo para débito
  previousBalance: number;
  newBalance: number;
  origin: string; // e.g. "M-Pesa Ref #MP-9842", "Emissão Lote SIVEC #CERT-2026-40"
  destination: string; // e.g. "Carteira Institucional CFTPM", "Serviço Central Moztechwave"
  serviceRef?: string;
  status: MozcoinTransactionStatus;
  description: string;
  timestamp: string;
  operator: string;
  referenceCode?: string;
}

export type MozcoinPaymentMethod = 'mpesa' | 'emola' | 'transferencia_bancaria' | 'outro';
export type MozcoinPurchaseStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'correcao_solicitada';

export interface MozcoinPurchaseRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  institutionId?: string;
  institutionName?: string;
  targetWallet: MozcoinWalletOwnerType; // 'user' ou 'institution'
  mozcoinAmount: number;
  fiatAmount: number; // Valor pago em Meticais (MTn)
  rate: number; // Taxa de conversão (1 MTn = 1 MOZCOIN)
  paymentMethod: MozcoinPaymentMethod;
  transactionCode: string; // Código de transação M-Pesa / e-Mola / Talão Bancário
  paymentDate: string;
  paymentTime: string;
  network: string; // 'Vodacom M-Pesa' | 'Movitel e-Mola' | 'Millennium BIM' | 'BCI' | 'Standard Bank'
  proofUrl?: string;
  proofFileName?: string;
  status: MozcoinPurchaseStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  correctionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Regras de Desconto para Planos Antecipados (Requisito 86.5)
 * Configurável pelo Super Admin / CEO — nunca fixo em código.
 */
export interface MozcoinDiscountRule {
  id: string;
  monthsAdvance: number; // e.g. 3, 6, 12 meses
  title: string;
  discountPercentage: number; // e.g. 10 para 10%
  bonusMozcoins: number; // Moedas bónus adicionadas
  minMozcoins?: number; // Mínimo de moedas para ativar (opcional)
  description: string;
  isActive: boolean;
  applicableServices?: string[]; // ['todos'] ou ['sivec', 'whatsapp', 'ia', 'planos']
  createdAt: string;
  updatedAt: string;
}

/**
 * Catálogo de Serviços do Ecossistema Consumíveis em MOZCOIN
 */
export interface MozcoinEcosystemService {
  id: string;
  code: string;
  name: string;
  category: 'sivec' | 'comunicacao' | 'ia' | 'infra' | 'documentos' | 'planos';
  costMozcoin: number;
  unit: 'por_emissao' | 'por_mil' | 'por_mes' | 'por_requisicao' | 'por_estudante';
  description: string;
  icon: string;
  isAvailable: boolean;
}
