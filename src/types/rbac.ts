/**
 * RBAC (Role-Based Access Control) Granular Specification
 * Moztechwave Education Platform / SIGAR / SIVERC
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN_INSTITUICAO'
  | 'DIRETOR'
  | 'SECRETARIA'
  | 'FINANCEIRO'
  | 'PROFESSOR'
  | 'FORMADOR'
  | 'PORTEIRO'
  | 'ALUNO'
  | 'RESPONSAVEL'
  | 'EMPRESA'
  | 'VISITANTE'
  // Lowercase compatibility aliases
  | 'superadmin'
  | 'director'
  | 'secretaria'
  | 'financeiro'
  | 'professor'
  | 'formador'
  | 'porteiro'
  | 'aluno'
  | 'responsavel'
  | 'empresa'
  | 'visitante';

export type CanonicalRole =
  | 'SUPER_ADMIN'
  | 'ADMIN_INSTITUICAO'
  | 'DIRETOR'
  | 'SECRETARIA'
  | 'FINANCEIRO'
  | 'PROFESSOR'
  | 'FORMADOR'
  | 'PORTEIRO'
  | 'ALUNO'
  | 'RESPONSAVEL'
  | 'EMPRESA'
  | 'VISITANTE';

export type Permission =
  // Inscrições Online & Candidatos
  | 'candidatos.view'
  | 'candidatos.create'
  | 'candidatos.edit'
  | 'candidatos.approve'
  | 'candidatos.reject'
  | 'candidatos.convert'
  | 'candidatos.config'
  // Alunos
  | 'alunos.view'
  | 'alunos.create'
  | 'alunos.edit'
  | 'alunos.delete'
  | 'alunos.export'
  | 'alunos.terminate'
  | 'alunos.reactivate'
  | 'alunos.change_status'
  // Notas e Avaliações
  | 'notas.view'
  | 'notas.create'
  | 'notas.edit'
  | 'notas.approve'
  // 18. Pautas
  | 'pautas.view'
  | 'pautas.export'
  | 'pautas.approve'
  | 'pautas.override'
  // 19. Boletim
  | 'boletim.view'
  | 'boletim.export'
  | 'boletim.sign'
  // 20. Estágios
  | 'estagios.view'
  | 'estagios.create'
  | 'estagios.edit'
  | 'estagios.delete'
  | 'estagios.evaluate'
  | 'estagios.docs'
  | 'estagios.manage'
  // Pagamentos & Financeiro
  | 'pagamentos.view'
  | 'pagamentos.create'
  | 'pagamentos.approve'
  | 'pagamentos.reject'
  | 'pagamentos.export'
  // Caixa Escolar
  | 'caixa.view'
  | 'caixa.open'
  | 'caixa.close'
  | 'caixa.transact'
  | 'caixa.bleed'
  // Certificados & Diplomas
  | 'certificados.view'
  | 'certificados.create'
  | 'certificados.approve'
  | 'certificados.revoke'
  | 'certificados.export'
  // Cursos e Matrizes
  | 'cursos.view'
  | 'cursos.create'
  | 'cursos.edit'
  | 'cursos.delete'
  // Turmas e Horários
  | 'turmas.view'
  | 'turmas.create'
  | 'turmas.edit'
  | 'turmas.delete'
  | 'turmas.duplicate'
  | 'turmas.transfer'
  | 'horarios.view'
  | 'horarios.manage'
  // Professores e Formadores
  | 'professores.view'
  | 'professores.create'
  | 'professores.edit'
  | 'professores.delete'
  | 'professores.assign'
  // Diário e Presenças
  | 'diario.view'
  | 'diario.create_lesson'
  | 'diario.attendance'
  | 'diario.correct'
  | 'diario.audit'
  // Portaria & Controlo de Acesso
  | 'portaria.view'
  | 'portaria.log_entry'
  | 'portaria.log_exit'
  | 'portaria.notify'
  // Contratos e Termos
  | 'contratos.view'
  | 'contratos.create'
  | 'contratos.edit'
  | 'contratos.sign_director'
  | 'contratos.sign_student'
  // Instituições e Filiais
  | 'instituicoes.view'
  | 'instituicoes.create'
  | 'instituicoes.edit'
  | 'instituicoes.delete'
  | 'instituicoes.switch'
  // Usuários e Níveis de Acesso
  | 'usuarios.view'
  | 'usuarios.create'
  | 'usuarios.edit_role'
  | 'usuarios.delete'
  // Automações & WhatsApp
  | 'automacoes.view'
  | 'automacoes.trigger'
  // 50. Comunicados
  | 'comunicados.view'
  | 'comunicados.publish'
  | 'comunicados.delete'
  // 51. Relatórios Académicos
  | 'relatorios_academicos.view'
  | 'relatorios_academicos.export'
  // 52. Relatórios Administrativos
  | 'relatorios_administrativos.view'
  | 'relatorios_administrativos.export'
  // 53. Auditoria do Sistema
  | 'auditoria.view'
  | 'auditoria.export'
  | 'auditoria.purge'
  // 55. Firebase Storage
  | 'storage.view'
  | 'storage.upload'
  | 'storage.archive'
  // 57. Backup & Restauro
  | 'backup.view'
  | 'backup.create'
  | 'backup.restore';

export interface RoleDefinition {
  role: CanonicalRole;
  title: string;
  description: string;
  category: 'Administração Core' | 'Gestão Institucional' | 'Pedagógico' | 'Operacional' | 'Comunidade';
  scope: 'global' | 'institution' | 'branch' | 'personal';
  badgeColor: string;
  badgeBg: string;
  permissions: Permission[];
}

export function toCanonicalRole(role: string): CanonicalRole {
  const r = (role || '').toUpperCase().trim();
  if (r === 'SUPERADMIN' || r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (r === 'ADMIN_INSTITUICAO' || r === 'ADMIN') return 'ADMIN_INSTITUICAO';
  if (r === 'DIRECTOR' || r === 'DIRETOR') return 'DIRETOR';
  if (r === 'SECRETARIA' || r === 'SECRETARIO') return 'SECRETARIA';
  if (r === 'FINANCEIRO' || r === 'TESOURARIA') return 'FINANCEIRO';
  if (r === 'PROFESSOR' || r === 'DOCENTE') return 'PROFESSOR';
  if (r === 'FORMADOR' || r === 'INSTRUTOR') return 'FORMADOR';
  if (r === 'PORTEIRO' || r === 'PORTARIA' || r === 'SEGURANCA') return 'PORTEIRO';
  if (r === 'ALUNO' || r === 'ESTUDANTE' || r === 'FORMANDO') return 'ALUNO';
  if (r === 'RESPONSAVEL' || r === 'ENCARREGADO') return 'RESPONSAVEL';
  if (r === 'EMPRESA' || r === 'PARCEIRO') return 'EMPRESA';
  if (r === 'VISITANTE' || r === 'GUEST') return 'VISITANTE';
  return 'VISITANTE';
}

export const ROLE_DEFINITIONS: Record<CanonicalRole, RoleDefinition> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Super Administrador Core',
    description: 'Acesso total global à infraestrutura SaaS, todas as instituições, filiais, auditoria e regras de segurança.',
    category: 'Administração Core',
    scope: 'global',
    badgeColor: 'text-rose-400 border-rose-800/80',
    badgeBg: 'bg-rose-950/60',
    permissions: [
      'candidatos.view', 'candidatos.create', 'candidatos.edit', 'candidatos.approve', 'candidatos.reject', 'candidatos.convert', 'candidatos.config',
      'alunos.view', 'alunos.create', 'alunos.edit', 'alunos.delete', 'alunos.export', 'alunos.terminate', 'alunos.reactivate', 'alunos.change_status',
      'notas.view', 'notas.create', 'notas.edit', 'notas.approve',
      'pautas.view', 'pautas.export', 'pautas.approve', 'pautas.override',
      'boletim.view', 'boletim.export', 'boletim.sign',
      'estagios.view', 'estagios.create', 'estagios.edit', 'estagios.delete', 'estagios.evaluate', 'estagios.docs', 'estagios.manage',
      'pagamentos.view', 'pagamentos.create', 'pagamentos.approve', 'pagamentos.reject', 'pagamentos.export',
      'caixa.view', 'caixa.open', 'caixa.close', 'caixa.transact', 'caixa.bleed',
      'certificados.view', 'certificados.create', 'certificados.approve', 'certificados.revoke', 'certificados.export',
      'cursos.view', 'cursos.create', 'cursos.edit', 'cursos.delete',
      'turmas.view', 'turmas.create', 'turmas.edit', 'turmas.delete', 'turmas.duplicate', 'turmas.transfer',
      'horarios.view', 'horarios.manage',
      'professores.view', 'professores.create', 'professores.edit', 'professores.delete', 'professores.assign',
      'diario.view', 'diario.create_lesson', 'diario.attendance', 'diario.correct', 'diario.audit',
      'portaria.view', 'portaria.log_entry', 'portaria.log_exit', 'portaria.notify',
      'contratos.view', 'contratos.create', 'contratos.edit', 'contratos.sign_director', 'contratos.sign_student',
      'instituicoes.view', 'instituicoes.create', 'instituicoes.edit', 'instituicoes.delete', 'instituicoes.switch',
      'usuarios.view', 'usuarios.create', 'usuarios.edit_role', 'usuarios.delete',
      'automacoes.view', 'automacoes.trigger',
      'comunicados.view', 'comunicados.publish', 'comunicados.delete',
      'relatorios_academicos.view', 'relatorios_academicos.export',
      'relatorios_administrativos.view', 'relatorios_administrativos.export',
      'auditoria.view', 'auditoria.export', 'auditoria.purge',
      'storage.view', 'storage.upload', 'storage.archive',
      'backup.view', 'backup.create', 'backup.restore'
    ]
  },
  ADMIN_INSTITUICAO: {
    role: 'ADMIN_INSTITUICAO',
    title: 'Administrador da Instituição',
    description: 'Gestão completa dos dados institucionais, filiais, usuários, finanças e parâmetros da instituição correspondente.',
    category: 'Gestão Institucional',
    scope: 'institution',
    badgeColor: 'text-amber-400 border-amber-800/80',
    badgeBg: 'bg-amber-950/60',
    permissions: [
      'candidatos.view', 'candidatos.create', 'candidatos.edit', 'candidatos.approve', 'candidatos.reject', 'candidatos.convert', 'candidatos.config',
      'alunos.view', 'alunos.create', 'alunos.edit', 'alunos.delete', 'alunos.export', 'alunos.terminate', 'alunos.reactivate', 'alunos.change_status',
      'notas.view', 'notas.create', 'notas.edit', 'notas.approve',
      'pautas.view', 'pautas.export', 'pautas.approve', 'pautas.override',
      'boletim.view', 'boletim.export', 'boletim.sign',
      'estagios.view', 'estagios.create', 'estagios.edit', 'estagios.delete', 'estagios.evaluate', 'estagios.docs', 'estagios.manage',
      'pagamentos.view', 'pagamentos.create', 'pagamentos.approve', 'pagamentos.reject', 'pagamentos.export',
      'caixa.view', 'caixa.open', 'caixa.close', 'caixa.transact', 'caixa.bleed',
      'certificados.view', 'certificados.create', 'certificados.approve', 'certificados.revoke', 'certificados.export',
      'cursos.view', 'cursos.create', 'cursos.edit', 'cursos.delete',
      'turmas.view', 'turmas.create', 'turmas.edit', 'turmas.delete', 'turmas.duplicate', 'turmas.transfer',
      'horarios.view', 'horarios.manage',
      'professores.view', 'professores.create', 'professores.edit', 'professores.delete', 'professores.assign',
      'diario.view', 'diario.create_lesson', 'diario.attendance', 'diario.correct', 'diario.audit',
      'portaria.view', 'portaria.log_entry', 'portaria.log_exit', 'portaria.notify',
      'contratos.view', 'contratos.create', 'contratos.edit', 'contratos.sign_director',
      'instituicoes.view', 'instituicoes.edit',
      'usuarios.view', 'usuarios.create', 'usuarios.edit_role',
      'automacoes.view', 'automacoes.trigger',
      'comunicados.view', 'comunicados.publish', 'comunicados.delete',
      'relatorios_academicos.view', 'relatorios_academicos.export',
      'relatorios_administrativos.view', 'relatorios_administrativos.export',
      'auditoria.view', 'auditoria.export',
      'storage.view', 'storage.upload', 'storage.archive',
      'backup.view', 'backup.create', 'backup.restore'
    ]
  },
  DIRETOR: {
    role: 'DIRETOR',
    title: 'Diretor Geral / Pedagógico',
    description: 'Homologação pedagógica, aprovação/reprovação de pautas, emissão e assinatura de boletins e certificados oficiais, supervisão de estágios e contratos.',
    category: 'Gestão Institucional',
    scope: 'institution',
    badgeColor: 'text-sky-400 border-sky-800/80',
    badgeBg: 'bg-sky-950/60',
    permissions: [
      'candidatos.view', 'candidatos.create', 'candidatos.edit', 'candidatos.approve', 'candidatos.reject', 'candidatos.convert',
      'alunos.view', 'alunos.create', 'alunos.edit', 'alunos.export', 'alunos.terminate', 'alunos.reactivate', 'alunos.change_status',
      'notas.view', 'notas.approve',
      'pautas.view', 'pautas.export', 'pautas.approve', 'pautas.override',
      'boletim.view', 'boletim.export', 'boletim.sign',
      'estagios.view', 'estagios.create', 'estagios.edit', 'estagios.delete', 'estagios.evaluate', 'estagios.docs', 'estagios.manage',
      'pagamentos.view', 'pagamentos.export',
      'caixa.view',
      'certificados.view', 'certificados.create', 'certificados.approve', 'certificados.revoke', 'certificados.export',
      'cursos.view', 'cursos.create', 'cursos.edit',
      'turmas.view', 'turmas.create', 'turmas.edit', 'turmas.duplicate', 'turmas.transfer',
      'horarios.view', 'horarios.manage',
      'professores.view', 'professores.create', 'professores.edit', 'professores.assign',
      'diario.view', 'diario.create_lesson', 'diario.attendance', 'diario.correct', 'diario.audit',
      'portaria.view',
      'contratos.view', 'contratos.create', 'contratos.sign_director',
      'instituicoes.view',
      'usuarios.view',
      'automacoes.view',
      'comunicados.view', 'comunicados.publish', 'comunicados.delete',
      'relatorios_academicos.view', 'relatorios_academicos.export',
      'relatorios_administrativos.view', 'relatorios_administrativos.export',
      'auditoria.view', 'auditoria.export'
    ]
  },
  SECRETARIA: {
    role: 'SECRETARIA',
    title: 'Secretaria Acadêmica',
    description: 'Matrículas de alunos, geração de contratos, pautas de chamada, boletins, documentos de estágio e atendimento.',
    category: 'Operacional',
    scope: 'branch',
    badgeColor: 'text-teal-400 border-teal-800/80',
    badgeBg: 'bg-teal-950/60',
    permissions: [
      'candidatos.view', 'candidatos.create', 'candidatos.edit', 'candidatos.approve', 'candidatos.reject', 'candidatos.convert', 'candidatos.config',
      'alunos.view', 'alunos.create', 'alunos.edit', 'alunos.export', 'alunos.terminate', 'alunos.reactivate', 'alunos.change_status',
      'notas.view', 'notas.create', 'notas.edit',
      'pautas.view', 'pautas.export',
      'boletim.view', 'boletim.export',
      'estagios.view', 'estagios.create', 'estagios.edit', 'estagios.docs',
      'pagamentos.view', 'pagamentos.create',
      'caixa.view', 'caixa.transact',
      'certificados.view', 'certificados.create', 'certificados.export',
      'cursos.view',
      'turmas.view', 'turmas.create', 'turmas.edit', 'turmas.transfer',
      'horarios.view', 'horarios.manage',
      'professores.view', 'professores.create', 'professores.edit', 'professores.assign',
      'diario.view', 'diario.create_lesson', 'diario.attendance', 'diario.correct', 'diario.audit',
      'portaria.view',
      'contratos.view', 'contratos.create', 'contratos.edit',
      'automacoes.view', 'automacoes.trigger',
      'comunicados.view', 'comunicados.publish', 'comunicados.delete',
      'relatorios_academicos.view', 'relatorios_academicos.export',
      'relatorios_administrativos.view', 'relatorios_administrativos.export'
    ]
  },
  FINANCEIRO: {
    role: 'FINANCEIRO',
    title: 'Direção Financeira & Tesouraria',
    description: 'Gestão de caixa escolar, cobrança de propinas, sangrias, reconciliação M-Pesa/e-Mola/POS e relatórios fiscais.',
    category: 'Operacional',
    scope: 'institution',
    badgeColor: 'text-emerald-400 border-emerald-800/80',
    badgeBg: 'bg-emerald-950/60',
    permissions: [
      'alunos.view', 'alunos.export',
      'pagamentos.view', 'pagamentos.create', 'pagamentos.approve', 'pagamentos.reject', 'pagamentos.export',
      'caixa.view', 'caixa.open', 'caixa.close', 'caixa.transact', 'caixa.bleed',
      'contratos.view',
      'cursos.view',
      'turmas.view',
      'comunicados.view', 'comunicados.publish',
      'relatorios_academicos.view',
      'relatorios_administrativos.view', 'relatorios_administrativos.export'
    ]
  },
  PROFESSOR: {
    role: 'PROFESSOR',
    title: 'Professor / Docente',
    description: 'Lançamento de notas das turmas atribuídas, emissão de pautas e acompanhamento pedagógico.',
    category: 'Pedagógico',
    scope: 'branch',
    badgeColor: 'text-indigo-400 border-indigo-800/80',
    badgeBg: 'bg-indigo-950/60',
    permissions: [
      'alunos.view',
      'notas.view', 'notas.create', 'notas.edit',
      'pautas.view', 'pautas.export',
      'boletim.view',
      'estagios.view', 'estagios.evaluate',
      'turmas.view',
      'horarios.view',
      'professores.view',
      'diario.view', 'diario.create_lesson', 'diario.attendance', 'diario.correct', 'diario.audit',
      'cursos.view',
      'comunicados.view', 'comunicados.publish',
      'relatorios_academicos.view'
    ]
  },
  FORMADOR: {
    role: 'FORMADOR',
    title: 'Formador Técnico-Profissional',
    description: 'Avaliações práticas laboratoriais, registo de competências técnicas, pautas modulares e avaliação de estágios.',
    category: 'Pedagógico',
    scope: 'branch',
    badgeColor: 'text-purple-400 border-purple-800/80',
    badgeBg: 'bg-purple-950/60',
    permissions: [
      'alunos.view',
      'notas.view', 'notas.create', 'notas.edit',
      'pautas.view', 'pautas.export',
      'boletim.view',
      'estagios.view', 'estagios.evaluate',
      'turmas.view',
      'horarios.view',
      'professores.view',
      'diario.view', 'diario.create_lesson', 'diario.attendance', 'diario.correct', 'diario.audit',
      'cursos.view',
      'comunicados.view', 'comunicados.publish',
      'relatorios_academicos.view'
    ]
  },
  PORTEIRO: {
    role: 'PORTEIRO',
    title: 'Portaria & Controlo de Acesso',
    description: 'Validação de carteirinhas por QR Code/código, registo de entradas e saídas com disparo automático de WhatsApp aos encarregados.',
    category: 'Operacional',
    scope: 'branch',
    badgeColor: 'text-orange-400 border-orange-800/80',
    badgeBg: 'bg-orange-950/60',
    permissions: [
      'alunos.view',
      'portaria.view', 'portaria.log_entry', 'portaria.log_exit', 'portaria.notify',
      'comunicados.view'
    ]
  },
  ALUNO: {
    role: 'ALUNO',
    title: 'Aluno / Formando',
    description: 'Apenas consulta de notas, pautas escolares, boletim individual, dados de estágio e frequência sem permissão de alteração.',
    category: 'Comunidade',
    scope: 'personal',
    badgeColor: 'text-cyan-400 border-cyan-800/80',
    badgeBg: 'bg-cyan-950/60',
    permissions: [
      'alunos.view',
      'notas.view',
      'pautas.view',
      'boletim.view',
      'estagios.view',
      'pagamentos.view',
      'certificados.view',
      'cursos.view',
      'diario.view',
      'comunicados.view'
    ]
  },
  RESPONSAVEL: {
    role: 'RESPONSAVEL',
    title: 'Responsável / Encarregado de Educação',
    description: 'Acompanhamento em tempo real de entradas e saídas na portaria, assiduidade, pautas escolares, boletim e situação financeira do educando.',
    category: 'Comunidade',
    scope: 'personal',
    badgeColor: 'text-yellow-400 border-yellow-800/80',
    badgeBg: 'bg-yellow-950/60',
    permissions: [
      'alunos.view',
      'notas.view',
      'pautas.view',
      'boletim.view',
      'estagios.view',
      'pagamentos.view',
      'portaria.view',
      'certificados.view',
      'comunicados.view'
    ]
  },
  EMPRESA: {
    role: 'EMPRESA',
    title: 'Empresa Concedente de Estágio / Parceiro',
    description: 'Acompanhamento e avaliação de estagiários, emissão de pareceres e documentos de estágio, e validação de certificados.',
    category: 'Comunidade',
    scope: 'global',
    badgeColor: 'text-blue-400 border-blue-800/80',
    badgeBg: 'bg-blue-950/60',
    permissions: [
      'estagios.view',
      'estagios.evaluate',
      'estagios.docs',
      'certificados.view',
      'cursos.view',
      'comunicados.view'
    ]
  },
  VISITANTE: {
    role: 'VISITANTE',
    title: 'Visitante / Candidato',
    description: 'Acesso ao portal público, catálogo de cursos, inscrições online e consulta pública de certificados.',
    category: 'Comunidade',
    scope: 'personal',
    badgeColor: 'text-slate-400 border-slate-700',
    badgeBg: 'bg-slate-900',
    permissions: [
      'cursos.view',
      'candidatos.create',
      'comunicados.view'
    ]
  }
};

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const canonical = toCanonicalRole(role);
  const def = ROLE_DEFINITIONS[canonical];
  if (!def) return false;
  return def.permissions.includes(permission);
}

/**
 * Check if a role possesses ANY of the provided permissions
 */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role possesses ALL of the provided permissions
 */
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Returns list of permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
  const canonical = toCanonicalRole(role);
  return ROLE_DEFINITIONS[canonical]?.permissions || [];
}
