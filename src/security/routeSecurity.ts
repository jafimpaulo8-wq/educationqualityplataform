/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SIGAR Security Engine — Route Protection & RBAC Access Matrix
 * Guarantees zero unauthorized navigation and strict role boundary enforcement.
 */

import { AppRoute } from '../types';
import { CanonicalRole, toCanonicalRole } from '../types/rbac';

export interface RouteSecurityPolicy {
  allowedRoles: CanonicalRole[];
  title: string;
  category: 'Public' | 'Super Admin' | 'Direção' | 'Secretaria' | 'Financeiro' | 'Docente' | 'Portaria' | 'Aluno' | 'Ecosystem';
  isPublic?: boolean;
}

export const ROUTE_POLICIES: Partial<Record<AppRoute, RouteSecurityPolicy>> = {
  // Public Routes (Accessible without login, zero private data)
  public_portal: {
    allowedRoles: ['VISITANTE', 'ALUNO', 'PROFESSOR', 'FORMADOR', 'SECRETARIA', 'FINANCEIRO', 'DIRETOR', 'ADMIN_INSTITUICAO', 'SUPER_ADMIN', 'PORTEIRO', 'RESPONSAVEL', 'EMPRESA'],
    title: 'Portal Público',
    category: 'Public',
    isPublic: true
  },
  public_verify: {
    allowedRoles: ['VISITANTE', 'ALUNO', 'PROFESSOR', 'FORMADOR', 'SECRETARIA', 'FINANCEIRO', 'DIRETOR', 'ADMIN_INSTITUICAO', 'SUPER_ADMIN', 'PORTEIRO', 'RESPONSAVEL', 'EMPRESA'],
    title: 'Verificação Pública SIVEC',
    category: 'Public',
    isPublic: true
  },
  sivec_verify_public: {
    allowedRoles: ['VISITANTE', 'ALUNO', 'PROFESSOR', 'FORMADOR', 'SECRETARIA', 'FINANCEIRO', 'DIRETOR', 'ADMIN_INSTITUICAO', 'SUPER_ADMIN', 'PORTEIRO', 'RESPONSAVEL', 'EMPRESA'],
    title: 'Verificação Pública SIVEC',
    category: 'Public',
    isPublic: true
  },
  inscricao_publica: {
    allowedRoles: ['VISITANTE', 'ALUNO', 'PROFESSOR', 'FORMADOR', 'SECRETARIA', 'FINANCEIRO', 'DIRETOR', 'ADMIN_INSTITUICAO', 'SUPER_ADMIN', 'PORTEIRO', 'RESPONSAVEL', 'EMPRESA'],
    title: 'Inscrições Online',
    category: 'Public',
    isPublic: true
  },

  // Super Admin Exclusive Modules
  moztechwave_core: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Moztechwave Core HQ',
    category: 'Super Admin'
  },
  super_admin: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Painel Super Admin',
    category: 'Super Admin'
  },
  admin_dashboard: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Dashboard Super Admin',
    category: 'Super Admin'
  },
  superadmin_dashboard: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Dashboard Super Admin',
    category: 'Super Admin'
  },
  admin_cadastrar: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Cadastrar Instituição',
    category: 'Super Admin'
  },
  admin_instituicoes: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Diretório de Instituições',
    category: 'Super Admin'
  },
  sistema_planos: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Planos & Limites',
    category: 'Super Admin'
  },
  planos_gestao: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Gestão de Planos',
    category: 'Super Admin'
  },
  storage_gestao: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Gestão de Armazenamento',
    category: 'Super Admin'
  },
  backup_recuperacao: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO'],
    title: 'Backup & Recuperação',
    category: 'Super Admin'
  },
  rbac_matrix: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Matriz de Permissões RBAC',
    category: 'Super Admin'
  },
  principio_fundamental: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Princípios Fundamentais',
    category: 'Super Admin'
  },
  estrutura_pastas: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Arquitetura de Pastas',
    category: 'Super Admin'
  },
  regras_desenvolvimento: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Regras de Engenharia',
    category: 'Super Admin'
  },
  migracao_dados: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Migração de Dados',
    category: 'Super Admin'
  },
  superioridade_integrada: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Superioridade Integrada',
    category: 'Super Admin'
  },
  experiencia_superadmin: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Experiência Super Admin',
    category: 'Super Admin'
  },
  mozcoin_aprovacao: {
    allowedRoles: ['SUPER_ADMIN'],
    title: 'Aprovação de MOZCOIN',
    category: 'Super Admin'
  },

  // Diretor / Administração da Instituição
  centro_dashboard: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Dashboard Geral da Instituição',
    category: 'Direção'
  },
  dashboard: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Dashboard Geral',
    category: 'Direção'
  },
  experiencia_diretor: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Experiência Diretor',
    category: 'Direção'
  },
  configuracoes_instituicao: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Configurações da Instituição',
    category: 'Direção'
  },
  configuracoes_filiais: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Configurações de Filiais',
    category: 'Direção'
  },
  relatorios_administrativos: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Relatórios Executivos & Administrativos',
    category: 'Direção'
  },
  relatorios_admin: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Relatórios Administrativos',
    category: 'Direção'
  },
  auditoria: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Trilha de Auditoria',
    category: 'Direção'
  },
  professores_gestao: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Gestão de Professores & Formadores',
    category: 'Direção'
  },
  pautas: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Homologação de Pautas Acadêmicas',
    category: 'Direção'
  },
  estagios: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'EMPRESA'],
    title: 'Estágios & Empresas Parceiras',
    category: 'Direção'
  },
  fluxo_conclusao: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Fluxo de Conclusão de Curso',
    category: 'Direção'
  },
  integracoes_futuras: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Integrações Externas',
    category: 'Direção'
  },
  integracoes_hub: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR'],
    title: 'Hub de Integrações',
    category: 'Direção'
  },

  // Secretaria Académica
  candidatos_gestao: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Gestão de Candidatos & Inscrições',
    category: 'Secretaria'
  },
  alunos_list: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PROFESSOR', 'PORTEIRO'],
    title: 'Lista de Alunos',
    category: 'Secretaria'
  },
  alunos_gestao: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Gestão de Alunos',
    category: 'Secretaria'
  },
  alunos_cadastrar: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Nova Matrícula / Inscrição',
    category: 'Secretaria'
  },
  alunos_perfil: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PROFESSOR'],
    title: 'Dossiê do Aluno',
    category: 'Secretaria'
  },
  turmas_gestao: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PROFESSOR'],
    title: 'Gestão de Turmas',
    category: 'Secretaria'
  },
  horarios_calendario: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PROFESSOR', 'ALUNO'],
    title: 'Horários & Calendário',
    category: 'Secretaria'
  },
  contratos: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Emissão de Contratos & Termos',
    category: 'Secretaria'
  },
  contratos_editor: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Editor de Contratos',
    category: 'Secretaria'
  },
  studio: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Document Studio & Certificados',
    category: 'Secretaria'
  },
  studio_editor: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Editor de Modelos Studio',
    category: 'Secretaria'
  },
  certificados: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Emissão de Certificados SIVEC',
    category: 'Secretaria'
  },
  carteirinhas: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Emissão de Carteirinhas',
    category: 'Secretaria'
  },
  sivec_verify: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Painel SIVEC Conectado',
    category: 'Secretaria'
  },
  sivec_connect: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Conector SIVEC',
    category: 'Secretaria'
  },
  sivec_pass: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Passe Digital SIVEC',
    category: 'Secretaria'
  },
  sivec_studio: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Design SIVEC',
    category: 'Secretaria'
  },
  relatorios_academicos: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Relatórios Académicos',
    category: 'Secretaria'
  },
  comunicados: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PROFESSOR'],
    title: 'Comunicados Institucionais',
    category: 'Secretaria'
  },
  experiencia_secretaria: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Experiência Secretaria',
    category: 'Secretaria'
  },
  assinaturas: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Assinaturas Digitais',
    category: 'Secretaria'
  },

  // Financeiro & Tesouraria (ESTRITAMENTE VEDADO A ALUNOS, PROFESSORES E PORTARIA)
  financeiro: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'FINANCEIRO'],
    title: 'Painel Financeiro Geral',
    category: 'Financeiro'
  },
  financeiro_modulo29: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'FINANCEIRO'],
    title: 'Contas a Pagar & Receber',
    category: 'Financeiro'
  },
  financial_manager: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'FINANCEIRO'],
    title: 'Gestor Financeiro Central',
    category: 'Financeiro'
  },
  caixa_escolar: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'FINANCEIRO'],
    title: 'Caixa Escolar & Sessões',
    category: 'Financeiro'
  },
  pagamentos: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'FINANCEIRO', 'SECRETARIA', 'ALUNO'],
    title: 'Pagamentos & Mensalidades',
    category: 'Financeiro'
  },
  relatorios_financeiros: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'FINANCEIRO'],
    title: 'Relatórios Financeiros & Balanços',
    category: 'Financeiro'
  },
  configuracoes_financeiras: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'FINANCEIRO'],
    title: 'Configurações Financeiras',
    category: 'Financeiro'
  },
  fluxo_pagamento: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'FINANCEIRO'],
    title: 'Fluxo de Pagamento Integrado',
    category: 'Financeiro'
  },
  experiencia_financeiro: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'FINANCEIRO'],
    title: 'Experiência Financeiro',
    category: 'Financeiro'
  },

  // Docente / Professor / Formador
  portal_professor: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR'],
    title: 'Dashboard do Professor',
    category: 'Docente'
  },
  diario_professor: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR', 'SECRETARIA'],
    title: 'Diário de Classe & Presenças',
    category: 'Docente'
  },
  aulas_frequencia: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR', 'SECRETARIA', 'ALUNO'],
    title: 'Frequência & Aulas',
    category: 'Docente'
  },
  avaliacoes: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR', 'SECRETARIA'],
    title: 'Lançamento de Notas & Avaliações',
    category: 'Docente'
  },
  tarefas: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR', 'SECRETARIA', 'FINANCEIRO'],
    title: 'Centro de Tarefas & Materiais',
    category: 'Docente'
  },
  tarefas_gestao: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR', 'SECRETARIA'],
    title: 'Gestão de Tarefas',
    category: 'Docente'
  },
  calendario_geral: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR', 'SECRETARIA', 'FINANCEIRO', 'ALUNO'],
    title: 'Calendário Institucional',
    category: 'Docente'
  },
  calendario: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR', 'SECRETARIA', 'FINANCEIRO', 'ALUNO'],
    title: 'Calendário',
    category: 'Docente'
  },
  cursos_gestao: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PROFESSOR', 'ALUNO'],
    title: 'Catálogo & Oferta Formativa',
    category: 'Docente'
  },
  aulas_online: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR', 'ALUNO'],
    title: 'Salas Virtuais & Aulas Online',
    category: 'Docente'
  },
  experiencia_professor: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PROFESSOR', 'FORMADOR'],
    title: 'Experiência Professor',
    category: 'Docente'
  },

  // Portaria & Controlo de Acesso
  portaria_acesso: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PORTEIRO'],
    title: 'Controlo de Acesso & Portaria',
    category: 'Portaria'
  },
  controlo_entrada: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PORTEIRO'],
    title: 'Registo de Entrada / Saída',
    category: 'Portaria'
  },
  aluno_qrcode: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PORTEIRO', 'ALUNO'],
    title: 'Leitor de Cartão / QR Code',
    category: 'Portaria'
  },
  experiencia_porteiro: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'PORTEIRO'],
    title: 'Experiência Porteiro',
    category: 'Portaria'
  },

  // Portal do Aluno
  portal_aluno: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'ALUNO', 'RESPONSAVEL'],
    title: 'Portal do Aluno',
    category: 'Aluno'
  },
  boletim: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL'],
    title: 'Boletim de Notas & Pautas',
    category: 'Aluno'
  },
  experiencia_aluno: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'ALUNO', 'RESPONSAVEL'],
    title: 'Experiência Aluno',
    category: 'Aluno'
  },
  experiencia_empresa: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'EMPRESA'],
    title: 'Experiência Empresa Parceira',
    category: 'Ecosystem'
  },

  // Ecosystem & Central Identity
  mozcoin_wallet: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'ALUNO'],
    title: 'Carteira MOZCOIN',
    category: 'Ecosystem'
  },
  mozcoin_comprar: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'ALUNO'],
    title: 'Comprar MOZCOIN',
    category: 'Ecosystem'
  },
  moztechwave_id: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PORTEIRO', 'ALUNO'],
    title: 'MOZTECHWAVE ID Central',
    category: 'Ecosystem'
  },
  automacoes: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Automações & Lembretes',
    category: 'Ecosystem'
  },
  whatsapp_center: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Central WhatsApp',
    category: 'Ecosystem'
  },
  moztechwave_ai: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'PROFESSOR'],
    title: 'Moztechwave AI Copilot',
    category: 'Ecosystem'
  },
  fluxo_sivec: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'],
    title: 'Fluxo SIVEC',
    category: 'Secretaria'
  }
};

/**
 * Returns the default dashboard route strictly assigned to a role
 */
export function getDefaultRouteForRole(role: string): AppRoute {
  const canonical = toCanonicalRole(role);
  switch (canonical) {
    case 'SUPER_ADMIN':
      return 'moztechwave_core';
    case 'ADMIN_INSTITUICAO':
    case 'DIRETOR':
      return 'centro_dashboard';
    case 'SECRETARIA':
      return 'candidatos_gestao';
    case 'FINANCEIRO':
      return 'financeiro';
    case 'PROFESSOR':
    case 'FORMADOR':
      return 'portal_professor';
    case 'PORTEIRO':
      return 'portaria_acesso';
    case 'ALUNO':
    case 'RESPONSAVEL':
      return 'portal_aluno';
    case 'EMPRESA':
      return 'estagios';
    case 'VISITANTE':
    default:
      return 'public_portal';
  }
}

/**
 * Returns user-friendly name for a role
 */
export function getRoleDisplayName(role: string): string {
  const canonical = toCanonicalRole(role);
  switch (canonical) {
    case 'SUPER_ADMIN':
      return 'Super Administrador (Core)';
    case 'ADMIN_INSTITUICAO':
      return 'Administrador da Instituição';
    case 'DIRETOR':
      return 'Diretor Geral / Pedagógico';
    case 'SECRETARIA':
      return 'Secretaria Académica';
    case 'FINANCEIRO':
      return 'Direção Financeira & Tesouraria';
    case 'PROFESSOR':
      return 'Professor / Docente';
    case 'FORMADOR':
      return 'Formador Técnico';
    case 'PORTEIRO':
      return 'Portaria & Segurança';
    case 'ALUNO':
      return 'Aluno / Formando';
    case 'RESPONSAVEL':
      return 'Encarregado de Educação';
    case 'EMPRESA':
      return 'Empresa / Parceiro';
    case 'VISITANTE':
    default:
      return 'Visitante';
  }
}

/**
 * Validates if the current role is authorized to view the requested route
 */
export function isRouteAllowed(route: AppRoute, role: string, isSuperAdmin = false): boolean {
  if (isSuperAdmin) return true;
  const policy = ROUTE_POLICIES[route];
  if (!policy) {
    // If route unknown, default to requiring admin
    return false;
  }
  if (policy.isPublic) {
    return true;
  }
  const canonical = toCanonicalRole(role);
  return policy.allowedRoles.includes(canonical);
}
