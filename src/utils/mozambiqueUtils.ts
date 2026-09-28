/**
 * Mozambican Localization & Data Helpers
 * 
 * NUIT, BI, MZN currency, phone formatting, and date utilities.
 */

export function formatMzn(amount: number): string {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('MZN', 'MT');
}

export function validateNuit(nuit: string): boolean {
  if (!nuit) return false;
  const clean = nuit.replace(/\D/g, '');
  return clean.length === 9;
}

export function validateMozBi(bi: string): boolean {
  if (!bi) return false;
  // Mozambique BI format: 12 digits followed by 1 letter (e.g. 110100234567M)
  const regex = /^\d{12}[A-Za-z]$/;
  return regex.test(bi.trim());
}

export function formatMozPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 9) {
    return `+258 ${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
  }
  if (clean.length === 12 && clean.startsWith('258')) {
    const num = clean.slice(3);
    return `+258 ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
  }
  return phone;
}
