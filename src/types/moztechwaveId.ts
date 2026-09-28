/**
 * MOZTECHWAVE ID — Identidade Central do Ecossistema (Requisito 87)
 * 
 * Ponto de entrada unificado para todo o ecossistema SIGAR.
 * Fluxo:
 * Gestão SIGAR -> MOZTECHWAVE ID -> Escolher perfil -> Autenticação -> Instituição -> Filial -> Permissões -> Painel correspondente
 */

import { UserRole } from './rbac';

export interface MoztechwaveInstitutionMembership {
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  role: UserRole;
  branches: string[]; // Lista de branch IDs ou ['todas']
  isDefault?: boolean;
}

export interface MoztechwaveIdentity {
  mwId: string; // Ex: "MWID-MZ-2026-0042"
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  nationalId?: string; // BI ou Passaporte
  primaryRole: UserRole;
  memberships: MoztechwaveInstitutionMembership[];
  securityLevel: 'padrao' | 'biometrico' | '2fa_ativo';
  twoFactorEnabled: boolean;
  walletId: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
}

export type MoztechwaveAuthStep = 
  | 'perfil'          // 1. Escolha do Perfil de Acesso
  | 'autenticacao'    // 2. Autenticação (Senha, Google, Código Master)
  | 'instituicao'     // 3. Seleção de Instituição
  | 'filial'          // 4. Seleção de Filial / Polo
  | 'permissao'       // 5. Validação RBAC e Permissões
  | 'concluido';      // 6. Redirecionamento ao Painel Correspondente
