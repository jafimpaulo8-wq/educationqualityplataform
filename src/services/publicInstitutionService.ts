import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Institution, PublicInstitution, OnlineRegistrationConfig } from '../types';
import { CEU_AZUL_INSTITUTION } from '../data/ceuAzulData';
import { INITIAL_INSTITUTIONS } from '../data/mockData';
import {
  createEmptyOnlineRegistrationConfig,
  sanitizeFirestoreData
} from '../utils/registrationConfigUtils';

export const PUBLIC_INSTITUTIONS_COLLECTION = 'publicInstitutions';

/**
 * Resolve o slug canónico de uma instituição para portais públicos.
 */
export function resolveInstitutionSlug(inst: Partial<Institution>): string {
  if (inst.slug && inst.slug.trim()) {
    const cleaned = normalizeSlug(inst.slug);
    if (cleaned) return cleaned;
  }
  if (inst.id === 'ceu-azul-nacala') return 'ceu-azul';
  if (inst.id === 'inst-1') return 'cftpm-moztechwave';
  if (inst.id === 'inst-peniel') return 'peniel';
  const rawName = (inst.shortName || inst.name || inst.id || 'instituicao')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return rawName || 'instituicao';
}

/**
 * Normaliza um slug removendo barras, cerquilhas, prefixos (/i/, /instituicoes/) e sufixos de rota pública.
 */
export function normalizeSlug(rawSlug: string): string {
  if (!rawSlug) return '';
  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(rawSlug);
  } catch {
    decoded = rawSlug;
  }
  return decoded
    .trim()
    .toLowerCase()
    .replace(/\?.*$/, '')
    .replace(/^[#/]+|[#/]+$/g, '')
    .replace(/^i\//, '')
    .replace(/^instituico?e?s\//, '')
    .replace(/\/(inscricoes|inscricao|pagamentos|pagamento).*$/, '')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Indica se a localização atual corresponde a uma rota de Portal Público de Inscrições
 * (`/i/<slug>`, `#i/<slug>`, `#/i/<slug>`, `/instituicoes/<slug>/inscricoes`, `#instituicoes/<slug>/inscricoes`).
 */
export function isPublicRegistrationPath(pathname?: string, hash?: string): boolean {
  const path = (pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '')).toLowerCase();
  const h = (hash ?? (typeof window !== 'undefined' ? window.location.hash : '')).toLowerCase();

  if (/(?:^|\/)i\/[^/?#]+/.test(path)) return true;
  if (/(?:^#?\/?)i\/[^/?#]+/.test(h)) return true;
  if ((path.includes('/instituicao') || path.includes('/instituicoes')) && (path.includes('/inscricoes') || path.includes('/inscricao'))) {
    return true;
  }
  if ((h.includes('instituicao') || h.includes('instituicoes')) && (h.includes('/inscricoes') || h.includes('/inscricao'))) {
    return true;
  }
  return false;
}

/**
 * Extrai o slug institucional de pathname, hash ou query string
 * (ex: /i/ceu-azul, #i/ceu-azul, #instituicoes/ceu-azul/inscricoes, #instituicoes/ceu-azul/pagamentos).
 */
export function extractSlugFromLocation(pathname?: string, hash?: string, search?: string): string {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const h = hash ?? (typeof window !== 'undefined' ? window.location.hash : '');
  const s = search ?? (typeof window !== 'undefined' ? window.location.search : '');

  // 1. Formato legado completo em hash: #instituicoes/<slug>/inscricoes ou /pagamentos
  const hashLegacyMatch = h.match(/instituico?e?s\/([^/?#]+)(?:\/(inscricoes|inscricao|pagamentos|pagamento))?/i);
  if (hashLegacyMatch?.[1]) {
    return normalizeSlug(hashLegacyMatch[1]);
  }

  // 2. Formato curto em hash: #i/<slug> ou #/i/<slug>
  const hashShortMatch = h.match(/^#?\/?i\/([^/?#]+)/i);
  if (hashShortMatch?.[1]) {
    return normalizeSlug(hashShortMatch[1]);
  }

  // 3. Formato legado completo em pathname: /instituicoes/<slug>/inscricoes ou /pagamentos
  const pathLegacyMatch = path.match(/instituico?e?s\/([^/?#]+)(?:\/(inscricoes|inscricao|pagamentos|pagamento))?/i);
  if (pathLegacyMatch?.[1]) {
    return normalizeSlug(pathLegacyMatch[1]);
  }

  // 4. Formato curto em pathname: /i/<slug> ou /i/<slug>/inscricoes
  const pathShortMatch = path.match(/^\/i\/([^/?#]+)/i);
  if (pathShortMatch?.[1]) {
    return normalizeSlug(pathShortMatch[1]);
  }

  // 5. Query parameters explícitos (?slug= ou ?inst=)
  if (s) {
    try {
      const params = new URLSearchParams(s);
      const qSlug = params.get('slug') || params.get('inst') || params.get('institutionId') || params.get('institution');
      if (qSlug && qSlug.trim()) {
        return normalizeSlug(qSlug);
      }
    } catch {
      // ignore malformed search string
    }
  }

  return '';
}

/**
 * Remove estritamente quaisquer números privados de M-Pesa, e-Mola, mKesh ou dados bancários internos
 * antes de persistir ou expor em configuração pública (publicInstitutions).
 */
export function sanitizePublicInstitutionPayload<T extends Record<string, any>>(raw: T): PublicInstitution {
  const source = (raw || {}) as Record<string, any>;
  const {
    financialSettings: _fs,
    financialAccounts: _fa,
    bankAccounts: _ba,
    receivingAccounts: _ra,
    mpesa: _m,
    emola: _e,
    mkesh: _k,
    mpesaNumber: _mn,
    emolaNumber: _en,
    mkeshNumber: _kn,
    pixKey: _pk,
    accessCode: _ac,
    ownerEmail: _oe,
    subscription: _sub,
    students: _st,
    users: _us,
    ...rest
  } = source;

  const rawPm = (source.paymentMethods && typeof source.paymentMethods === 'object') ? source.paymentMethods : {};
  const acceptedChannels = Array.isArray(source.acceptedChannels) && source.acceptedChannels.length > 0
    ? source.acceptedChannels
    : Array.isArray(rawPm.acceptedChannels) && rawPm.acceptedChannels.length > 0
      ? rawPm.acceptedChannels
      : ['M-Pesa', 'e-Mola', 'mKesh', 'Transferência Bancária', 'Balcão / Tesouraria'];

  const sanitizedPaymentMethods: PublicInstitution['paymentMethods'] = {
    ...(rawPm.bankName ? { bankName: String(rawPm.bankName) } : {}),
    acceptedChannels,
    instructions: typeof rawPm.instructions === 'string' && rawPm.instructions.trim()
      ? rawPm.instructions.trim()
      : 'Autentique-se no Portal de Pagamentos com a sua conta institucional para consultar as coordenadas oficiais e submeter comprovativos.'
  };

  return sanitizeFirestoreData({
    ...(rest as PublicInstitution),
    acceptedChannels,
    paymentMethods: sanitizedPaymentMethods,
    updatedAt: (rest.updatedAt as string | undefined) || new Date().toISOString()
  });
}

/**
 * Constrói um objeto PublicInstitution a partir de uma Institution interna,
 * expondo exclusivamente identidade, branding e configuração pública (ZERO números privados M-Pesa/e-Mola/mKesh).
 */
export function buildPublicInstitutionFromModel(inst: Institution): PublicInstitution {
  const primarySlug = resolveInstitutionSlug(inst);

  const aliases = Array.from(new Set([
    ...(inst.slugAliases || []).map(a => normalizeSlug(a)).filter(Boolean),
    primarySlug,
    ...(inst.code ? [normalizeSlug(inst.code)] : []),
    ...(inst.id ? [inst.id.toLowerCase()] : [])
  ].filter(Boolean)));

  const neutralFallback = createEmptyOnlineRegistrationConfig(inst);
  const existingCfg = inst.onlineRegistrationConfig;
  const effectiveConfig: OnlineRegistrationConfig = existingCfg
    ? {
        ...neutralFallback,
        ...existingCfg,
        institutionId: inst.id,
        requiredFields: {
          ...neutralFallback.requiredFields,
          ...(existingCfg.requiredFields || {})
        },
        requiredDocuments: Array.isArray(existingCfg.requiredDocuments) ? existingCfg.requiredDocuments : [],
        documentRequirements: existingCfg.documentRequirements || {},
        customQuestions: Array.isArray(existingCfg.customQuestions) ? existingCfg.customQuestions : [],
        coursesConfig: Array.isArray(existingCfg.coursesConfig) ? existingCfg.coursesConfig : []
      }
    : neutralFallback;

  const configuredChannels = inst.financialSettings?.paymentMethods
    ?.filter(m => m.enabled)
    .map(m => m.name);

  const resolvedPhone = effectiveConfig.contactPhone || inst.phone || '';
  const resolvedWhatsapp = effectiveConfig.contactWhatsapp || inst.whatsapp || resolvedPhone;
  const resolvedEmail = effectiveConfig.contactEmail || inst.email || '';

  return sanitizePublicInstitutionPayload({
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
    phone: resolvedPhone,
    phoneAlt: inst.phoneAlt,
    email: resolvedEmail,
    whatsapp: resolvedWhatsapp,
    address: inst.address,
    city: inst.city,
    province: inst.province,
    logoUrl: inst.logoUrl,
    emblemUrl: inst.emblemUrl,
    faviconUrl: inst.faviconUrl || inst.logoUrl || inst.emblemUrl,
    slogan: inst.slogan,
    primaryColor: inst.institutionalColors?.primary,
    accentColor: inst.institutionalColors?.accent,
    branches: inst.branches,
    onlineRegistrationConfig: effectiveConfig,
    acceptedChannels: configuredChannels && configuredChannels.length > 0
      ? configuredChannels
      : ['M-Pesa', 'e-Mola', 'mKesh', 'Transferência Bancária', 'Presencial'],
    paymentMethods: {
      bankName: inst.financialAccounts?.[0]?.bankName,
      acceptedChannels: configuredChannels && configuredChannels.length > 0
        ? configuredChannels
        : ['M-Pesa', 'e-Mola', 'mKesh', 'Transferência Bancária', 'Presencial'],
      instructions: 'Inicie sessão no Portal de Pagamentos com a sua conta de aluno, encarregado ou tesouraria para consultar coordenadas de recebimento e submeter comprovativos.'
    },
    termsAndConditions:
      effectiveConfig.termsAndConditions?.trim() ||
      `1. Termos Oficiais da ${inst.name}.\n2. A submissão da candidatura não garante admissão imediata sem análise documental e homologação pela Secretaria Académica.\n3. O pagamento da taxa de inscrição não é reembolsável após validação do processo.`,
    privacyPolicy:
      effectiveConfig.privacyPolicy?.trim() ||
      `A ${inst.name} compromete-se a resguardar a privacidade e os dados pessoais do candidato exclusivamente para fins de admissão e gestão académica oficial no SIGAR PRO.`,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Sincroniza metadados estritamente públicos da instituição para publicInstitutions/{slug}.
 */
export async function syncPublicInstitutionMetadata(inst: Institution): Promise<void> {
  if (!inst?.id || !auth.currentUser) return;
  const publicData = sanitizeFirestoreData(buildPublicInstitutionFromModel(inst));
  const slug = publicData.slug;
  if (!slug) return;
  try {
    await setDoc(doc(db, PUBLIC_INSTITUTIONS_COLLECTION, slug), publicData, { merge: true });
  } catch (err) {
    console.warn(`[PublicInstitutionService] Nota ao sincronizar publicInstitutions/${slug}:`, err);
  }
}

/**
 * Lista de instituições padrão para fallback de identidade pública quando offline ou sem registo em publicInstitutions.
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
 * - Sanitizar sempre quaisquer campos financeiros privados legados antes de retornar.
 * - Se o slug for inválido ou não existir, retorna NULL (nunca redireciona nem aplica fallback cruzado).
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
      return sanitizePublicInstitutionPayload(data);
    }
  } catch (error) {
    console.warn(`[PublicInstitutionService] Nota ao buscar publicInstitutions/${slug}:`, error);
  }

  // 2. Tentar encontrar por correspondência exata de slug/aliases/id/code/sigla na pool conhecida
  const pool = localInstitutionsPool && localInstitutionsPool.length > 0
    ? localInstitutionsPool
    : KNOWN_INSTITUTIONS;

  const matched = pool.find(inst => {
    const primary = inst.slug ? normalizeSlug(inst.slug) : '';
    if (primary && primary === slug) return true;

    const aliases = (inst.slugAliases || []).map(a => normalizeSlug(a));
    if (aliases.includes(slug)) return true;

    if (inst.code && normalizeSlug(inst.code) === slug) return true;
    if (inst.id && inst.id.toLowerCase() === slug) return true;
    if (inst.sigla && normalizeSlug(inst.sigla) === slug) return true;

    const slugifiedName = normalizeSlug(
      inst.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    );
    if (slugifiedName && slugifiedName === slug) return true;

    if ((slug === 'cftpm' || slug === 'cftpm-moztechwave' || slug === 'cftpm-nacala') && inst.id === 'inst-1') {
      return true;
    }

    if ((slug === 'ceu-azul' || slug === 'centro-infantil-ceu-azul' || slug === 'ceu-azul-nacala') && inst.id === 'ceu-azul-nacala') {
      return true;
    }

    return false;
  });

  if (matched) {
    return buildPublicInstitutionFromModel(matched);
  }

  // 3. Slug inválido ou inexistente: NUNCA retornar o tenant ativo nem outra instituição!
  return null;
}

/**
 * Gera URL oficial formatada para o portal público de inscrição.
 * Formato estável: #i/<slug> (com total compatibilidade para #instituicoes/<slug>/inscricoes e /i/<slug>).
 */
export function getPublicRegistrationUrl(inst: Institution, preview = false): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sigar.moztechwave.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const slug = resolveInstitutionSlug(inst);
  const previewQuery = preview ? '?preview=true' : '';
  return `${origin}${pathname}#i/${slug}${previewQuery}`;
}

/**
 * Gera URL oficial formatada para o Portal Independente de Pagamentos da instituição.
 * Formato multi-institucional: #instituicoes/<slug>/pagamentos
 */
export function getPublicPaymentPortalUrl(inst: Partial<Institution>): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sigar.moztechwave.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const slug = resolveInstitutionSlug(inst);
  return `${origin}${pathname}#instituicoes/${slug}/pagamentos`;
}

/**
 * Gera token criptográfico seguro com pelo menos 128 bits de entropia (16+ bytes).
 */
export function generateSecureInvitationToken(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const rnd = () => Math.random().toString(36).substring(2, 15);
  return `${Date.now().toString(36)}${rnd()}${rnd()}${rnd()}`.slice(0, 48);
}

/**
 * Utilitário para compressão de fotografia ou comprovativo para até 150 KB no Spark.
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
