import { SivecRegistryEntry } from './types';
import { INITIAL_SIVEC_REGISTRY } from './mockSivecData';

const STORAGE_KEY = 'sivec_registry_v5';

/**
 * Obtém o repositório atual de certificados SIVEC do localStorage ou valores iniciais
 */
export function getSivecRegistry(): SivecRegistryEntry[] {
  if (typeof window === 'undefined') return INITIAL_SIVEC_REGISTRY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SIVEC_REGISTRY));
      return INITIAL_SIVEC_REGISTRY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Erro ao ler registo SIVEC do localStorage:', e);
  }
  return INITIAL_SIVEC_REGISTRY;
}

/**
 * Salva o repositório no localStorage e notifica ouvintes
 */
export function saveSivecRegistry(entries: SivecRegistryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent('sivec_registry_updated', { detail: entries }));
  } catch (e) {
    console.error('Erro ao guardar registo SIVEC no localStorage:', e);
  }
}

/**
 * Procura um certificado no repositório por qualquer um dos identificadores possíveis:
 * ID único, Código SIVEC, Número de Certificado, Hash SHA-256 ou ID interno
 */
export function findSivecCertificate(query: string, registry?: SivecRegistryEntry[]): SivecRegistryEntry | undefined {
  if (!query) return undefined;
  const list = registry || getSivecRegistry();
  const clean = query.trim();
  const upper = clean.toUpperCase();
  const lower = clean.toLowerCase();

  return list.find(entry => 
    (entry.uniqueCertificateId && entry.uniqueCertificateId.toUpperCase() === upper) ||
    entry.sivecCode.toUpperCase() === upper ||
    (entry.certificateNumber && entry.certificateNumber.toUpperCase() === upper) ||
    entry.id.toUpperCase() === upper ||
    entry.sha256Hash.toLowerCase() === lower ||
    entry.studentDocument.toUpperCase().includes(upper) ||
    // Suporte caso a query seja uma URL completa como https://.../verify/SIVEC-MZ-2026-8819
    (clean.includes('/verify/') && (
      (entry.uniqueCertificateId && clean.toUpperCase().includes(entry.uniqueCertificateId.toUpperCase())) ||
      clean.toUpperCase().includes(entry.sivecCode.toUpperCase()) ||
      (entry.certificateNumber && clean.toUpperCase().includes(entry.certificateNumber.toUpperCase()))
    ))
  );
}

/**
 * Máscara estrita de proteção de privacidade para documentos de identificação (BI / Passaporte / DIRE).
 * NUNCA expõe o documento completo em páginas públicas.
 * Exemplo: "BI nº 110293817290A" -> "BI nº 11029*****90A"
 */
export function maskPrivateDocument(docString?: string): string {
  if (!docString) return 'Documento Registado e Verificado';
  const trimmed = docString.trim();
  if (trimmed.length <= 6) return '******';

  // Se tiver formato tipo "BI nº 110293817290A"
  const parts = trimmed.split(' ');
  if (parts.length > 1) {
    const prefix = parts.slice(0, -1).join(' ');
    const num = parts[parts.length - 1];
    if (num.length >= 6) {
      const start = num.slice(0, 3);
      const end = num.slice(-3);
      return `${prefix} ${start}*****${end}`;
    }
  }

  const start = trimmed.slice(0, 4);
  const end = trimmed.slice(-3);
  return `${start}*****${end}`;
}
