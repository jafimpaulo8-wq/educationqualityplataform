import { Institution } from '../types';

export interface InstitutionalColors {
  primary: string;
  secondary: string;
  accent: string;
}

export const DEFAULT_INSTITUTION_COLORS: InstitutionalColors = {
  primary: '#2563eb',
  secondary: '#0f172a',
  accent: '#10b981',
};

export interface ResolvedInstitutionIdentity {
  hasInstitution: boolean;
  id: string;
  officialName: string;
  shortName: string;
  code: string;
  sigla: string;
  logoUrl: string;
  emblemUrl: string;
  initials: string;
  colors: InstitutionalColors;
  phone: string;
  phoneAlt: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  province: string;
  nuit: string;
  licenseNumber: string;
  website: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  representativeName: string;
  representativeRole: string;
  signatoryName: string;
  signatoryRole: string;
  signatureUrl: string;
  stampUrl: string;
  stampText: string;
  showStampOnDocuments: boolean;
  isLogoConfigured: boolean;
  isEmblemConfigured: boolean;
  isSignatureConfigured: boolean;
  isStampConfigured: boolean;
}

const VALID_HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function sanitizeColor(color: unknown, fallback: string): string {
  if (typeof color === 'string' && VALID_HEX_COLOR.test(color.trim())) {
    return color.trim();
  }
  return fallback;
}

function sanitizeImageUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Guard against accidental placeholder/stock unsplash URLs used previously as fake logos/stamps
  if (
    trimmed.includes('images.unsplash.com/photo-1579783900882-c0d3dad7b119') ||
    trimmed.includes('images.unsplash.com/photo-1618005182384-a83a8bd57fbe') ||
    trimmed.includes('images.unsplash.com/photo-1546410531-bb4caa6b424d') ||
    trimmed.includes('images.unsplash.com/photo-1522202176988-66273c2fd55f')
  ) {
    return '';
  }
  return trimmed;
}

export function computeInstitutionInitials(name?: string, sigla?: string, code?: string): string {
  const cleanSigla = (sigla || '').trim();
  if (cleanSigla && cleanSigla !== 'SIGAR') {
    return cleanSigla.slice(0, 3).toUpperCase();
  }

  const cleanName = (name || '').trim();
  if (cleanName && cleanName !== 'Nenhuma Instituição Registada' && cleanName !== 'Sem Instituição Associada') {
    const words = cleanName
      .split(/\s+/)
      .filter((w) => w.length > 2 || /^[A-ZÁÉÍÓÚÂÊÔÃÕ]/.test(w))
      .slice(0, 3);
    if (words.length >= 2) {
      return words.map((w) => w[0]).join('').toUpperCase().slice(0, 3);
    }
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
  }

  const cleanCode = (code || '').trim();
  if (cleanCode && cleanCode !== 'SIGAR') {
    return cleanCode.slice(0, 3).toUpperCase();
  }

  return 'IN';
}

export function resolveInstitutionIdentity(inst?: Partial<Institution> | null): ResolvedInstitutionIdentity {
  const id = (inst?.id || '').trim();
  const hasInstitution = Boolean(id);

  const officialName = hasInstitution
    ? ((inst?.name || (inst as any)?.nomeCompleto || (inst as any)?.nome || '').trim() || 'Instituição Sem Nome')
    : 'Sem Instituição Associada';

  const shortName = hasInstitution
    ? ((inst?.shortName || inst?.sigla || (inst as any)?.nome || inst?.name || inst?.code || '').trim() || officialName)
    : 'SIGAR PRO';

  const code = hasInstitution ? ((inst?.code || '').trim() || id) : '';
  const sigla = hasInstitution ? ((inst?.sigla || inst?.shortName || code || '').trim()) : '';

  const logoUrl = hasInstitution ? sanitizeImageUrl(inst?.logoUrl || inst?.logo) : '';
  const emblemUrl = hasInstitution ? sanitizeImageUrl(inst?.emblemUrl || logoUrl) : '';

  const anyInst = inst as any;
  const colors: InstitutionalColors = {
    primary: sanitizeColor(
      inst?.institutionalColors?.primary || anyInst?.primaryColor,
      DEFAULT_INSTITUTION_COLORS.primary
    ),
    secondary: sanitizeColor(
      inst?.institutionalColors?.secondary || anyInst?.secondaryColor,
      DEFAULT_INSTITUTION_COLORS.secondary
    ),
    accent: sanitizeColor(
      inst?.institutionalColors?.accent || anyInst?.accentColor,
      DEFAULT_INSTITUTION_COLORS.accent
    ),
  };

  const phone = hasInstitution ? (inst?.phone || anyInst?.telefone1 || '').trim() : '';
  const phoneAlt = hasInstitution ? (inst?.phoneAlt || anyInst?.telefone2 || '').trim() : '';
  const whatsapp = hasInstitution
    ? (inst?.whatsapp || inst?.whatsAppConfig?.phoneNumber || phone || '').trim()
    : '';
  const email = hasInstitution ? (inst?.email || '').trim() : '';
  const address = hasInstitution ? (inst?.address || anyInst?.local || '').trim() : '';
  const city = hasInstitution ? (inst?.city || '').trim() : '';
  const province = hasInstitution ? (inst?.province || '').trim() : '';
  const nuit = hasInstitution ? (inst?.nuit || '').trim() : '';
  const licenseNumber = hasInstitution ? (inst?.licenseNumber || '').trim() : '';
  const website = hasInstitution ? (inst?.website || '').trim() : '';

  const socialLinks = {
    facebook: hasInstitution ? (inst?.socialLinks?.facebook || '').trim() : '',
    instagram: hasInstitution ? (inst?.socialLinks?.instagram || '').trim() : '',
    linkedin: hasInstitution ? (inst?.socialLinks?.linkedin || '').trim() : '',
    youtube: hasInstitution ? (inst?.socialLinks?.youtube || '').trim() : '',
  };

  const representativeName = hasInstitution
    ? (inst?.representativeName || inst?.directorName || inst?.repLegal || '').trim()
    : '';
  const representativeRole = hasInstitution ? (inst?.representativeRole || '').trim() : '';
  const signatoryName = hasInstitution
    ? (inst?.signatoryName || representativeName || '').trim()
    : '';
  const signatoryRole = hasInstitution
    ? (inst?.signatoryRole || representativeRole || '').trim()
    : '';

  const signatureUrl = hasInstitution ? sanitizeImageUrl(inst?.signatureUrl) : '';
  const stampUrl = hasInstitution ? sanitizeImageUrl(inst?.stampUrl) : '';
  const stampText = hasInstitution ? (inst?.stampText || '').trim() : '';
  const showStampOnDocuments = hasInstitution ? (inst?.showStampOnDocuments ?? Boolean(stampUrl || stampText)) : false;

  return {
    hasInstitution,
    id,
    officialName,
    shortName,
    code,
    sigla,
    logoUrl,
    emblemUrl,
    initials: hasInstitution ? computeInstitutionInitials(officialName, sigla, code) : '--',
    colors,
    phone,
    phoneAlt,
    whatsapp,
    email,
    address,
    city,
    province,
    nuit,
    licenseNumber,
    website,
    socialLinks,
    representativeName,
    representativeRole,
    signatoryName,
    signatoryRole,
    signatureUrl,
    stampUrl,
    stampText,
    showStampOnDocuments,
    isLogoConfigured: Boolean(logoUrl),
    isEmblemConfigured: Boolean(emblemUrl),
    isSignatureConfigured: Boolean(signatureUrl),
    isStampConfigured: Boolean(stampUrl || stampText),
  };
}
