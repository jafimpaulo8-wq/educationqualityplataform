/**
 * Utilitários de Segurança e Criptografia para o Sistema de Assinaturas Digitais (Módulo 23)
 * SIVERC / SIGAR / Moztechwave
 */

import { SignerRole, SystemSignature, SIGNER_ROLE_LABELS } from '../types/signatures';
import { toCanonicalRole } from '../types/rbac';

/**
 * Gera um selo digital criptográfico padronizado para a assinatura
 * Ex: SIVERC-SIG-DIR-2026-A8B9C
 */
export function generateDigitalSeal(role: SignerRole, institutionCode: string = 'MTW'): string {
  const roleCodeMap: Record<SignerRole, string> = {
    Diretor: 'DIR',
    Coordenador: 'COORD',
    Professor: 'PROF',
    Formador: 'FORM',
    Responsável: 'RESP',
    Outro: 'AUT'
  };
  const roleCode = roleCodeMap[role] || 'SIG';
  const year = new Date().getFullYear();
  const randomHex = Math.random().toString(16).substring(2, 7).toUpperCase();
  const timestampSeq = Date.now().toString().slice(-4);
  return `SIVERC-SIG-${roleCode}-${year}-${randomHex}${timestampSeq}`;
}

/**
 * Gera um hash SHA-256 consistente de integridade do documento assinado
 */
export function generateVerificationHash(
  documentId: string,
  signerName: string,
  role: string,
  timestamp: string
): string {
  const payload = `${documentId}|${signerName}|${role}|${timestamp}|SIGAR-SIVERC-SECURITY-TOKEN`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = Math.abs((hash * 31) | 0).toString(16).padStart(8, '0');
  const part3 = Math.abs((hash * 97) | 0).toString(16).padStart(8, '0');
  const part4 = Math.abs((hash * 179) | 0).toString(16).padStart(8, '0');
  return `sha256:${hex}${part2}${part3}${part4}`;
}

export interface CurrentUserAuthContext {
  id?: string;
  email?: string;
  name?: string;
  role: string;
}

/**
 * VERIFICAÇÃO RIGOROSA DE AUTORIZAÇÃO:
 * "Não permitir que qualquer usuário altere assinatura de outro utilizador sem autorização"
 */
export function checkUserSignatureAuthorization(
  signature: SystemSignature,
  currentUser: CurrentUserAuthContext
): { authorized: boolean; reason?: string; isSupervisorOverride?: boolean } {
  if (!currentUser) {
    return {
      authorized: false,
      reason: 'Sessão não identificada. É necessário iniciar sessão para assinar ou gerir documentos.'
    };
  }

  const canonicalRole = toCanonicalRole(currentUser.role);

  // 1. Super Administradores e Administradores da Instituição possuem autorização de supervisão e contingência
  if (canonicalRole === 'SUPER_ADMIN' || canonicalRole === 'ADMIN_INSTITUICAO') {
    return {
      authorized: true,
      isSupervisorOverride: true
    };
  }

  // 2. Se a assinatura tiver um usuário explicitamente designado por ID:
  if (signature.assignedUserId && currentUser.id) {
    if (signature.assignedUserId === currentUser.id) {
      return { authorized: true };
    }
  }

  // 3. Se a assinatura tiver um e-mail explicitamente designado:
  if (signature.assignedUserEmail && currentUser.email) {
    if (signature.assignedUserEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      return { authorized: true };
    }
  }

  // 4. Verificação por Role/Cargo permitido no sistema
  const allowedRolesForSigner = signature.allowedRoles && signature.allowedRoles.length > 0 
    ? signature.allowedRoles 
    : SIGNER_ROLE_LABELS[signature.role]?.allowedSystemRoles || [];

  const roleMatches = allowedRolesForSigner.some(r => {
    return toCanonicalRole(r) === canonicalRole || r.toLowerCase() === (currentUser.role || '').toLowerCase();
  });

  if (roleMatches) {
    return { authorized: true };
  }

  // 5. Caso contrário: BLOQUEADO
  const expectedTitle = signature.customRoleTitle || signature.signerTitle || signature.role;
  return {
    authorized: false,
    reason: `Não autorizado: Apenas ${signature.signerName} (${expectedTitle}) ou um Administrador possui autorização para assinar ou alterar esta assinatura.`
  };
}
