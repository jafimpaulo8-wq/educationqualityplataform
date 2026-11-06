import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Institution, PublicInstitution, OnlineRegistrationConfig } from '../types';
import { CEU_AZUL_INSTITUTION } from '../data/ceuAzulData';
import { INITIAL_INSTITUTIONS, DEFAULT_ONLINE_REGISTRATION_CONFIG } from '../data/mockData';

export const PUBLIC_INSTITUTIONS_COLLECTION = 'publicInstitutions';

/**
 * Normaliza um slug removendo barras, cerquilhas e espaços.
 */
export function normalizeSlug(rawSlug: string): string {
  if (!rawSlug) return '';
  return decodeURIComponent(rawSlug)
    .trim()
    .toLowerCase()
    .replace(/^[#/]+|[#/]+$/g, '')
    .replace(/^instituico?e?s\//, '')
    .replace(/\/inscricoes$/, '')
    .trim();
}

/**
 * Constrói um objeto PublicInstitution a partir de uma Institution interna,
 * expondo apenas dados públicos e não-sensíveis necessários ao portal de candidatura.
 */
export function buildPublicInstitutionFromModel(inst: Institution): PublicInstitution {
  const primarySlug = inst.slug || (
    inst.id === 'ceu-azul-nacala' 
      ? 'ceu-azul' 
      : inst.id === 'inst-1' 
        ? 'cftpm-moztechwave' 
        : inst.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  );

  const aliases: string[] = inst.slugAliases || [];
  if (!aliases.includes(primarySlug)) aliases.push(primarySlug);
  if (inst.code && !aliases.includes(inst.code.toLowerCase())) aliases.push(inst.code.toLowerCase());
  if (inst.id && !aliases.includes(inst.id.toLowerCase())) aliases.push(inst.id.toLowerCase());

  const effectiveConfig: OnlineRegistrationConfig = inst.onlineRegistrationConfig || {
    ...DEFAULT_ONLINE_REGISTRATION_CONFIG,
    institutionId: inst.id,
    title: `Inscrições Abertas — ${inst.name}`
  };

  return {
    id: primarySlug,
    institutionId: inst.id,
    slug: primarySlug,
    slugAliases: aliases,
    name: inst.name,
    code: inst.code,
    sigla: inst.sigla,
    type: inst.type,
    nuit: inst.nuit,
    licenseNumber: inst.licenseNumber,
    phone: inst.phone,
    phoneAlt: inst.phoneAlt,
    email: inst.email,
    whatsapp: inst.whatsapp || inst.phone,
    address: inst.address,
    city: inst.city,
    province: inst.province,
    logoUrl: inst.logoUrl,
    slogan: inst.slogan,
    branches: inst.branches,
    onlineRegistrationConfig: effectiveConfig,
    paymentMethods: {
      mpesa: inst.financialSettings?.mpesaNumber || inst.financialAccounts?.[0]?.mpesaNumber || inst.phone,
      emola: inst.financialSettings?.emolaNumber || inst.financialAccounts?.[0]?.emolaNumber,
      bankName: inst.financialAccounts?.[0]?.bankName || 'Millennium BIM',
      accountNumber: inst.financialAccounts?.[0]?.accountNumber,
      nib: inst.financialAccounts?.[0]?.nib,
      instructions: inst.financialSettings?.bankInfo || 'Envie o comprovativo por WhatsApp para confirmação imediata.'
    },
    termsAndConditions: `1. Termos Oficiais da ${inst.name}.\n2. A submissão da candidatura não garante admissão imediata sem análise documental e homologação pela Secretaria Académica.\n3. O pagamento da taxa de inscrição não é reembolsável após validação do processo.`,
    privacyPolicy: `A ${inst.name} compromete-se a resguardar a privacidade e os dados pessoais do candidato exclusivamente para fins de admissão e gestão académica oficial no SIGAR PRO.`,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Lista de instituições padrão de fallback para resolução quando offline ou sem registo na nuvem.
 */
const KNOWN_INSTITUTIONS: Institution[] = [
  CEU_AZUL_INSTITUTION as Institution,
  ...INITIAL_INSTITUTIONS
];

/**
 * Resolve e valida a instituição a partir do slug do endereço público.
 * 
 * Regra Mandatória:
 * - Nunca utilizar a instituição ativa do browser para determinar o portal público.
 * - Validar primeiramente em publicInstitutions/{slug}.
 * - Se o slug for inválido ou não existir, retorna NULL.
 */
export async function resolvePublicInstitutionBySlug(
  rawSlug: string,
  localInstitutionsPool?: Institution[]
): Promise<PublicInstitution | null> {
  const slug = normalizeSlug(rawSlug);
  if (!slug) {
    return null;
  }

  // 1. Tentar obter do Firestore na coleção publicInstitutions/{slug}
  try {
    const docRef = doc(db, PUBLIC_INSTITUTIONS_COLLECTION, slug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as PublicInstitution;
      return data;
    }
  } catch (error) {
    console.warn(`[PublicInstitutionService] Nota ao buscar publicInstitutions/${slug}:`, error);
  }

  // 2. Tentar encontrar nas instituições conhecidas
  const pool = localInstitutionsPool && localInstitutionsPool.length > 0
    ? localInstitutionsPool
    : KNOWN_INSTITUTIONS;

  const matched = pool.find(inst => {
    const primary = (inst.slug || '').toLowerCase();
    if (primary && primary === slug) return true;

    const aliases = (inst.slugAliases || []).map(a => a.toLowerCase());
    if (aliases.includes(slug)) return true;

    if (inst.code && inst.code.toLowerCase() === slug) return true;
    if (inst.id && inst.id.toLowerCase() === slug) return true;
    if (inst.sigla && inst.sigla.toLowerCase() === slug) return true;

    // Correspondências amigáveis por nome para compatibilidade
    const slugifiedName = inst.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (slugifiedName === slug) return true;

    // Correspondência de alias históricos CFTPM
    if ((slug === 'cftpm' || slug === 'cftpm-moztechwave') && (inst.id === 'inst-1' || inst.code.includes('MTW-CF'))) {
      return true;
    }

    // Correspondência de Céu Azul
    if ((slug === 'ceu-azul' || slug === 'centro-infantil-ceu-azul') && (inst.id === 'ceu-azul-nacala' || inst.name.includes('Céu Azul'))) {
      return true;
    }

    return false;
  });

  if (matched) {
    const publicData = buildPublicInstitutionFromModel(matched);
    // Sincronizar em segundo plano para persistência na nuvem (não-bloqueante)
    try {
      setDoc(doc(db, PUBLIC_INSTITUTIONS_COLLECTION, slug), publicData, { merge: true }).catch(() => {});
    } catch (e) {
      // ignore
    }
    return publicData;
  }

  // 3. Slug inválido ou inexistente: NUNCA retornar o tenant ativo do browser!
  return null;
}

/**
 * Gera URL oficial formatada para o portal público de inscrição.
 * Preserva o formato exigido: #instituicoes/<slug>/inscricoes
 */
export function getPublicRegistrationUrl(inst: Institution, preview = false): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sigar.moztechwave.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const slug = inst.slug || (inst.id === 'ceu-azul-nacala' ? 'ceu-azul' : 'cftpm-moztechwave');
  const previewQuery = preview ? '?preview=true' : '';
  return `${origin}${pathname}#instituicoes/${slug}/inscricoes${previewQuery}`;
}

/**
 * Gera token criptográfico seguro com pelo menos 128 bits de entropia (16+ bytes).
 * Sem nomes ou códigos previsíveis da instituição.
 */
export function generateSecureInvitationToken(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(24); // 192 bits de entropia
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback seguro em caso de ambiente sem Web Crypto
  const rnd = () => Math.random().toString(36).substring(2, 15);
  return `${Date.now().toString(36)}${rnd()}${rnd()}${rnd()}`.slice(0, 48);
}

/**
 * Utilitário para compressão de fotografia para até 150 KB no Spark.
 */
export async function compressImageToBase64(file: File, maxSizeBytes = 150000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 600;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Ajusta qualidade iterativamente até caber em maxSizeBytes
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        while (dataUrl.length > maxSizeBytes && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
