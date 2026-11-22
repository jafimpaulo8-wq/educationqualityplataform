import {
  Institution,
  InstitutionalReceivingAccount,
  PaymentNetwork,
  PaymentStatus,
  PublicInstitution
} from '../types';

export type CanonicalPaymentStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CORREÇÃO SOLICITADA';

export function normalizePaymentStatus(status?: PaymentStatus | string | null): CanonicalPaymentStatus {
  const s = (status || '').toString().trim().toUpperCase();
  if (s === 'APPROVED' || s === 'PAGO' || s === 'APROVADO') {
    return 'APPROVED';
  }
  if (s === 'REJECTED' || s === 'REJEITADO') {
    return 'REJECTED';
  }
  if (s === 'CORREÇÃO SOLICITADA' || s === 'CORRECTION_REQUESTED') {
    return 'CORREÇÃO SOLICITADA';
  }
  return 'PENDING_APPROVAL';
}

export function isPaymentPending(status?: PaymentStatus | string | null): boolean {
  return normalizePaymentStatus(status) === 'PENDING_APPROVAL';
}

export function isPaymentApproved(status?: PaymentStatus | string | null): boolean {
  return normalizePaymentStatus(status) === 'APPROVED';
}

export function isPaymentRejected(status?: PaymentStatus | string | null): boolean {
  return normalizePaymentStatus(status) === 'REJECTED';
}

export function isPaymentCorrectionRequested(status?: PaymentStatus | string | null): boolean {
  return normalizePaymentStatus(status) === 'CORREÇÃO SOLICITADA';
}

export function isPaymentFinalized(status?: PaymentStatus | string | null): boolean {
  const norm = normalizePaymentStatus(status);
  return norm === 'APPROVED' || norm === 'REJECTED';
}

export function getPaymentStatusLabel(status?: PaymentStatus | string | null): string {
  const norm = normalizePaymentStatus(status);
  switch (norm) {
    case 'APPROVED':
      return 'Aprovado';
    case 'REJECTED':
      return 'Rejeitado';
    case 'CORREÇÃO SOLICITADA':
      return 'Correção Solicitada';
    case 'PENDING_APPROVAL':
    default:
      return 'Pendente de Aprovação';
  }
}

export interface ConfiguredPaymentMethodOption {
  id: PaymentNetwork;
  label: string;
  category: 'mobile' | 'bank' | 'pos' | 'cash' | 'other';
  accountNumber?: string;
  holderName?: string;
  nib?: string;
  instructions?: string;
}

function mapChannelNameToNetwork(raw: string): { network: PaymentNetwork; category: ConfiguredPaymentMethodOption['category'] } {
  const lower = raw.trim().toLowerCase();
  if (lower.includes('mpesa') || lower.includes('m-pesa')) {
    return { network: 'M-Pesa', category: 'mobile' };
  }
  if (lower.includes('emola') || lower.includes('e-mola')) {
    return { network: 'e-Mola', category: 'mobile' };
  }
  if (lower.includes('mkesh') || lower.includes('m-kesh')) {
    return { network: 'mKesh', category: 'mobile' };
  }
  if (lower.includes('ponto24') || lower.includes('pos')) {
    return { network: 'Ponto24', category: 'pos' };
  }
  if (lower.includes('dinheiro') || lower.includes('numerário') || lower.includes('caixa')) {
    return { network: 'Dinheiro', category: 'cash' };
  }
  if (lower.includes('banco') || lower.includes('transfer') || lower.includes('nib') || lower.includes('iban') || lower.includes('bim') || lower.includes('bci')) {
    return { network: 'Transferência Bancária', category: 'bank' };
  }
  return { network: raw.trim() as PaymentNetwork, category: 'other' };
}

/**
 * Resolve exclusivamente os métodos de pagamento explicitamente configurados
 * pela instituição ativa/selecionada (sem fallbacks genéricos de outras instituições).
 */
export function getConfiguredInstitutionPaymentMethods(params: {
  institution?: Partial<Institution> | null;
  publicInstitution?: Partial<PublicInstitution> | null;
  receivingAccounts?: InstitutionalReceivingAccount[];
  includePrivateDetails?: boolean;
}): ConfiguredPaymentMethodOption[] {
  const { institution, publicInstitution, receivingAccounts = [], includePrivateDetails = false } = params;
  const resultMap = new Map<string, ConfiguredPaymentMethodOption>();

  const registerOption = (opt: ConfiguredPaymentMethodOption) => {
    const key = opt.id.toLowerCase();
    const existing = resultMap.get(key);
    if (!existing) {
      resultMap.set(key, opt);
    } else if (includePrivateDetails) {
      resultMap.set(key, {
        ...existing,
        accountNumber: existing.accountNumber || opt.accountNumber,
        holderName: existing.holderName || opt.holderName,
        nib: existing.nib || opt.nib,
        instructions: existing.instructions || opt.instructions
      });
    }
  };

  // 1. Contas de recebimento ativas da subcoleção privada (apenas visíveis se já carregadas com permissão)
  for (const acc of receivingAccounts) {
    if (acc.isActive === false) continue;
    const mapped = mapChannelNameToNetwork(acc.channel || acc.label);
    registerOption({
      id: mapped.network,
      label: acc.label || mapped.network,
      category: mapped.category,
      ...(includePrivateDetails
        ? {
            accountNumber: acc.accountNumber,
            holderName: acc.holderName,
            nib: acc.nib || acc.iban,
            instructions: acc.instructions
          }
        : {})
    });
  }

  // 2. Definições financeiras da instituição (apenas se configuradas)
  const fs = institution?.financialSettings;
  if (fs) {
    if (fs.mpesaNumber && fs.mpesaNumber.trim()) {
      registerOption({
        id: 'M-Pesa',
        label: 'Vodacom M-Pesa',
        category: 'mobile',
        ...(includePrivateDetails
          ? {
              accountNumber: fs.mpesaNumber.trim(),
              holderName: fs.mpesaHolderName || institution?.name
            }
          : {})
      });
    }
    if (fs.emolaNumber && fs.emolaNumber.trim()) {
      registerOption({
        id: 'e-Mola',
        label: 'Movitel e-Mola',
        category: 'mobile',
        ...(includePrivateDetails
          ? {
              accountNumber: fs.emolaNumber.trim(),
              holderName: fs.emolaHolderName || institution?.name
            }
          : {})
      });
    }
    if (fs.mkeshNumber && fs.mkeshNumber.trim()) {
      registerOption({
        id: 'mKesh',
        label: 'Tmcel mKesh',
        category: 'mobile',
        ...(includePrivateDetails
          ? {
              accountNumber: fs.mkeshNumber.trim(),
              holderName: fs.mkeshHolderName || institution?.name
            }
          : {})
      });
    }
    if (fs.bankInfo && fs.bankInfo.trim()) {
      registerOption({
        id: 'Transferência Bancária',
        label: 'Transferência Bancária',
        category: 'bank',
        ...(includePrivateDetails ? { accountNumber: fs.bankInfo.trim(), holderName: institution?.name } : {})
      });
    }
    if (Array.isArray(fs.paymentMethods)) {
      for (const methodItem of fs.paymentMethods) {
        if (!methodItem) continue;
        if (typeof methodItem === 'string') {
          const clean = (methodItem as string).trim();
          if (!clean) continue;
          const mapped = mapChannelNameToNetwork(clean);
          registerOption({
            id: mapped.network,
            label: clean,
            category: mapped.category
          });
        } else if (typeof methodItem === 'object') {
          if (methodItem.enabled === false) continue;
          const rawLabel = (methodItem.name || methodItem.key || '').trim();
          if (!rawLabel) continue;
          const mapped = mapChannelNameToNetwork(methodItem.key || rawLabel);
          registerOption({
            id: mapped.network,
            label: rawLabel,
            category: mapped.category,
            ...(includePrivateDetails && (methodItem.accountNumber || methodItem.phone)
              ? {
                  accountNumber: (methodItem.accountNumber || methodItem.phone || '').trim(),
                  holderName: methodItem.beneficiaryName || institution?.name
                }
              : {})
          });
        }
      }
    }
  }

  // 3. Canais públicos aceites explicitamente configurados na instituição pública
  const publicChannels = [
    ...(Array.isArray(publicInstitution?.acceptedChannels) ? publicInstitution.acceptedChannels : []),
    ...(Array.isArray(publicInstitution?.paymentMethods?.acceptedChannels) ? publicInstitution.paymentMethods.acceptedChannels : [])
  ];
  for (const ch of publicChannels) {
    if (!ch || !ch.trim()) continue;
    const mapped = mapChannelNameToNetwork(ch);
    registerOption({
      id: mapped.network,
      label: ch.trim(),
      category: mapped.category
    });
  }

  return Array.from(resultMap.values());
}
