import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { resolveInstitutionIdentity } from '../../utils/institutionIdentity';

const NEUTRAL_FAVICON_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23090d16'/%3E%3Cpath d='M18 42V22h10c6 0 10 3.5 10 8.5S34 39 28 39h-4v3H18zm6-8h4c2.8 0 4.5-1.3 4.5-3.5S30.8 27 28 27h-4v7z' fill='%2338bdf8'/%3E%3C/svg%3E";

function setDocumentFavicon(href: string) {
  if (typeof document === 'undefined') return;
  const rels = ['icon', 'shortcut icon'];
  rels.forEach(rel => {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    if (link.href !== href) {
      link.href = href;
    }
  });
}

function isValidImageUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  );
}

/**
 * Mantém o título da aba (`document.title`) e o favicon (`<link rel="icon">`)
 * sincronizados com a instituição ativa ou portal público por slug (Inscrições e Pagamentos),
 * revertendo de forma limpa após logout, troca de instituição ou rotas neutras.
 */
export const DocumentIdentitySync: React.FC = () => {
  const { activeInstitution, currentRoute, firebaseUser, publicPortalIdentity } = useApp();

  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    const hasInstPrefix =
      pathname.includes('/instituicao') ||
      pathname.includes('/instituicoes') ||
      hash.includes('instituicao') ||
      hash.includes('instituicoes');

    const isPaymentPortalRoute =
      (hasInstPrefix && (pathname.includes('/pagamentos') || hash.includes('/pagamentos'))) ||
      currentRoute === 'portal_pagamentos';

    const isRegistrationPortalRoute =
      (hasInstPrefix && (pathname.includes('/inscricoes') || hash.includes('/inscricoes'))) ||
      currentRoute === 'inscricao_publica';

    // 1. Portal público / independente por slug institucional (Inscrições ou Pagamentos)
    if ((isPaymentPortalRoute || isRegistrationPortalRoute) && publicPortalIdentity?.officialName) {
      document.title = isPaymentPortalRoute
        ? `Portal de Pagamentos — ${publicPortalIdentity.officialName} | SIGAR PRO`
        : `${publicPortalIdentity.officialName} | SIGAR PRO`;
      const iconCandidate =
        publicPortalIdentity.faviconUrl ||
        publicPortalIdentity.logoUrl ||
        publicPortalIdentity.emblemUrl;
      setDocumentFavicon(isValidImageUrl(iconCandidate) ? iconCandidate! : NEUTRAL_FAVICON_DATA_URI);
      return;
    }

    // 2. Rotas públicas neutras ou utilizador sem sessão autenticada
    if (
      !firebaseUser ||
      currentRoute === 'public_portal' ||
      currentRoute === 'public_verify' ||
      currentRoute === 'sivec_verify_public'
    ) {
      document.title =
        currentRoute === 'public_verify' || currentRoute === 'sivec_verify_public'
          ? 'Verificação Pública SIVEC | SIGAR PRO'
          : 'SIGAR PRO | Plataforma Integrada de Gestão Académica';
      setDocumentFavicon(NEUTRAL_FAVICON_DATA_URI);
      return;
    }

    // 3. Sessão autenticada com instituição ativa
    const identity = resolveInstitutionIdentity(activeInstitution);
    if (identity.hasInstitution && identity.officialName) {
      document.title = `${identity.officialName} | SIGAR PRO`;
      const iconCandidate = identity.faviconUrl || identity.logoUrl || identity.emblemUrl;
      setDocumentFavicon(isValidImageUrl(iconCandidate) ? iconCandidate : NEUTRAL_FAVICON_DATA_URI);
      return;
    }

    // 4. Fallback neutro (ex: Super Admin antes de selecionar instituição)
    document.title = 'SIGAR PRO | Administração Central';
    setDocumentFavicon(NEUTRAL_FAVICON_DATA_URI);
  }, [activeInstitution, currentRoute, firebaseUser, publicPortalIdentity]);

  return null;
};
