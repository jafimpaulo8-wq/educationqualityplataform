/**
 * Official Module Registry (Modules 01 - 65)
 * 
 * Provides an authoritative catalogue of all modules, their architectural
 * boundaries, required permissions, status, and domain categories.
 */

import { Permission } from '../types/rbac';

export type ModuleCategory = 
  | 'ACADEMICO' 
  | 'FINANCEIRO' 
  | 'SECRETARIA' 
  | 'SEGURANCA' 
  | 'INTEGRACOES' 
  | 'IA' 
  | 'GOVERNAMENTAL' 
  | 'SISTEMA'
  | 'PEDAGOGICO'
  | 'OPERACIONAL';

export interface SystemModule {
  number: number;
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  route: string;
  permission?: Permission | string;
  superAdminOnly?: boolean;
  isCore: boolean;
  status: 'ATIVO' | 'HOMOLOGADO' | 'PRODUCAO';
  architecturalPillars: string[];
}

export const SYSTEM_MODULES: SystemModule[] = [
  {
    number: 1,
    id: 'mod_alunos',
    name: '01. Gestão de Alunos',
    description: 'Cadastro biográfico, NUIT, BI, histórico e documentação do formando.',
    category: 'ACADEMICO',
    route: 'alunos',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['MODULAR', 'MULTI-INSTITUIÇÃO', 'AUDITÁVEL']
  },
  {
    number: 2,
    id: 'mod_cursos',
    name: '02. Cursos & Matrizes Curriculares',
    description: 'Estruturação de cursos técnicos, módulos, cargas horárias e competências.',
    category: 'ACADEMICO',
    route: 'cursos',
    permission: 'cursos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['MODULAR', 'MULTI-INSTITUIÇÃO', 'API-FIRST']
  },
  {
    number: 3,
    id: 'mod_turmas',
    name: '03. Gestão de Turmas',
    description: 'Alocação de salas, turnos (laboral, pós-laboral), lotação e formadores.',
    category: 'ACADEMICO',
    route: 'turmas',
    permission: 'turmas.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['MODULAR', 'MULTI-FILIAL', 'AUDITÁVEL']
  },
  {
    number: 4,
    id: 'mod_pautas',
    name: '04. Pautas & Avaliações',
    description: 'Lançamento de notas parciais, exames, médias modulares e pautas finais.',
    category: 'ACADEMICO',
    route: 'pautas',
    permission: 'notas.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['SEGURO', 'AUDITÁVEL', 'MULTI-FILIAL']
  },
  {
    number: 5,
    id: 'mod_secretaria',
    name: '05. Secretaria Virtual & Matrículas',
    description: 'Processo de admissão, renovação, trancamento e emissão de declarações.',
    category: 'SECRETARIA',
    route: 'secretaria',
    permission: 'matriculas.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['RESPONSIVO', 'FIREBASE READY', 'MULTI-INSTITUIÇÃO']
  },
  {
    number: 6,
    id: 'mod_docentes',
    name: '06. Corpo Docente & Formadores',
    description: 'Cadastro de formadores, alocação de módulos, contratos e assiduidade.',
    category: 'ACADEMICO',
    route: 'docentes',
    permission: 'docentes.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['MODULAR', 'AUDITÁVEL']
  },
  {
    number: 7,
    id: 'mod_financeiro',
    name: '07. Gestão Financeira & Propinas',
    description: 'Controlo de propinas, taxas de inscrição, emolumentos e plano de contas.',
    category: 'FINANCEIRO',
    route: 'financeiro',
    permission: 'financeiro.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['SEGURO', 'MULTI-FILIAL', 'AUDITÁVEL']
  },
  {
    number: 8,
    id: 'mod_portaria',
    name: '08. Portaria & Controlo de Acesso',
    description: 'Validação por QR Code digital, catraca eletrónica e registo de entradas/saídas.',
    category: 'SEGURANCA',
    route: 'portaria',
    permission: 'portaria.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['RESPONSIVO', 'SEGURO', 'API-FIRST']
  },
  {
    number: 9,
    id: 'mod_studio',
    name: '09. Document Studio & Certificados',
    description: 'Designer visual com drag-and-drop, variáveis dinâmicas e selo criptográfico.',
    category: 'SECRETARIA',
    route: 'studio',
    permission: 'studio.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['MODULAR', 'SEGURO', 'FIREBASE READY']
  },
  {
    number: 10,
    id: 'mod_comunicacao',
    name: '10. Central de Comunicações',
    description: 'Disparo de avisos institucionais, SMS em massa e notificações por canal.',
    category: 'INTEGRACOES',
    route: 'comunicacao',
    permission: 'comunicacao.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['RESPONSIVO', 'API-FIRST']
  },
  {
    number: 56,
    id: 'mod_auditoria_rbac',
    name: '56. Auditoria & RBAC Avançado',
    description: 'Trilha de auditoria imutável, registo de ações por IP e matriz de privilégios.',
    category: 'SEGURANCA',
    route: 'auditoria',
    permission: 'config.edit',
    superAdminOnly: true,
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['SEGURO', 'AUDITÁVEL', 'ZERO-TRUST']
  },
  {
    number: 57,
    id: 'mod_backup',
    name: '57. Backup & Restauração',
    description: 'Cópias de segurança instantâneas, snapshots cifrados e recuperação de desastres.',
    category: 'SISTEMA',
    route: 'backup_restauracao',
    permission: 'backup.view',
    superAdminOnly: true,
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['ESCALÁVEL', 'SEGURO', 'FIREBASE READY']
  },
  {
    number: 58,
    id: 'mod_ia',
    name: '58. Assistente IA MozTechWave',
    description: 'Motor Gemini Flash, deteção preditiva de abandono escolar e tutoria inteligente.',
    category: 'IA',
    route: 'moztechwave_ia',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['AI READY', 'ESCALÁVEL', 'API-FIRST']
  },
  {
    number: 59,
    id: 'mod_sivec',
    name: '59. Portal SIVEC Governamental',
    description: 'Barramento seguro de homologação curricular DINET/ANEP/MEC Moçambique.',
    category: 'GOVERNAMENTAL',
    route: 'sivec_portal',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['API-FIRST', 'SEGURO', 'AUDITÁVEL']
  },
  {
    number: 61,
    id: 'mod_config_inst',
    name: '61. Configurações da Instituição',
    description: 'Parâmetros fiscais, logotipo, NUIT, prefixos de código e contas bancárias.',
    category: 'SISTEMA',
    route: 'configuracoes_instituicao',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['MULTI-INSTITUIÇÃO', 'MULTI-FILIAL', 'MODULAR']
  },
  {
    number: 63,
    id: 'mod_planos',
    name: '63. Sistema de Planos & Subscrições',
    description: 'Planos Grátis, Básico, Profissional e Enterprise com limites por instituição.',
    category: 'FINANCEIRO',
    route: 'sistema_planos',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['ESCALÁVEL', 'MULTI-INSTITUIÇÃO', 'API-FIRST']
  },
  {
    number: 64,
    id: 'mod_integracoes',
    name: '64. Integrações Futuras (Hub)',
    description: 'Conectores M-Pesa, e-Mola, Bancos Moçambicanos, WhatsApp, SMS e Workspace.',
    category: 'INTEGRACOES',
    route: 'integracoes_futuras',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: ['API-FIRST', 'MODULAR', 'ESCALÁVEL']
  },
  {
    number: 65,
    id: 'mod_principio_fundamental',
    name: '65. Princípio Fundamental & Arquitetura',
    description: 'Garantia de 10 pilares: Modular, Escalável, Seguro, Multi-Instituição, Multi-Filial, Auditável, Responsivo, API-First, Firebase Ready e AI Ready.',
    category: 'SISTEMA',
    route: 'principio_fundamental',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'MULTI-FILIAL',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 66,
    id: 'mod_estrutura_pastas',
    name: '66. Estrutura de Pastas & Arquitetura de Ficheiros',
    description: 'Divisão física estrita entre /src (components, layouts, pages, services, security, hooks, utils, types, config), /firebase (firestore.rules, storage.rules, functions), /document-studio, /sivec, /integrations e /ai.',
    category: 'SISTEMA',
    route: 'estrutura_pastas',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'API-FIRST',
      'FIREBASE READY'
    ]
  },
  {
    number: 67,
    id: 'mod_regras_desenvolvimento',
    name: '67. Regras de Desenvolvimento & Ciclo de Qualidade',
    description: 'Protocolo de 8 etapas para qualquer recurso: interface, lógica, Firebase, regras, erros, permissões, mobile e desktop. Zero botões inertes, transparência de dados reais vs sandbox.',
    category: 'SISTEMA',
    route: 'regras_desenvolvimento',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'SEGURO',
      'RESPONSIVO',
      'AUDITÁVEL',
      'FIREBASE READY'
    ]
  },
  {
    number: 68,
    id: 'mod_dados_existentes',
    name: '68. Preservação de Dados & Compatibilidade Firebase',
    description: 'Estratégia de compatibilidade com projeto sigar-6754, garantindo preservação de coleções legadas (alunos, payments, frequencias, etc.) sem destruição ou sobrescrita acidental.',
    category: 'SISTEMA',
    route: 'migracao_dados',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'FIREBASE READY'
    ]
  },
  {
    number: 69,
    id: 'mod_migracao',
    name: '69. Motor de Migração & Importação Inteligente',
    description: 'Mecanismos de importação em massa para alunos, pagamentos, frequências, avaliações e certificados (CSV, JSON, Excel) com verificação anti-duplicação por BI/NUIT/ID.',
    category: 'SISTEMA',
    route: 'migracao_dados',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'AUDITÁVEL',
      'API-FIRST'
    ]
  },
  {
    number: 70,
    id: 'mod_superioridade_integrada',
    name: '70. Superioridade Sobre Sistemas Escolares Tradicionais',
    description: 'Orquestração reativa unindo os 10 pilares (Académico, Financeiro, Documentos, Certificados, SIVEC, WhatsApp, Portaria, Aulas Online, IA e API) com execução em cascata automática.',
    category: 'SISTEMA',
    route: 'superioridade_integrada',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'MULTI-FILIAL',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 71,
    id: 'mod_fluxo_conclusao',
    name: '71. Fluxo Completo de Conclusão de Curso',
    description: 'Pipeline estrito de 17 etapas de diplomação: matriculado → frequência → avaliações → notas → pauta → aprovação → estágio → conclusão → pedido de certificado → aprovação do diretor → Document Studio → assinaturas → QR → SIVEC → certificado emitido → Portal do Aluno → verificação pública.',
    category: 'ACADEMICO',
    route: 'fluxo_conclusao',
    permission: 'alunos.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 72,
    id: 'mod_fluxo_pagamento',
    name: '72. Fluxo Completo de Pagamento',
    description: 'Cadeia de liquidação financeira de 15 etapas: Aluno → Efetuar pagamento → Selecionar serviço → Ver instruções → Pagar → Enviar código → Pendente de confirmação → Financeiro/Diretor → Aprovar → Pago → Atualizar conta → Liberar serviço → Gerar recibo → Notificar aluno → Auditoria.',
    category: 'FINANCEIRO',
    route: 'fluxo_pagamento',
    permission: 'financeiro.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY'
    ]
  },
  {
    number: 73,
    id: 'mod_fluxo_sivec',
    name: '73. Fluxo SIVEC',
    description: 'Cadeia de homologação e validação governamental de 10 etapas: Instituição → Emite certificado → SIVEC registra → gera ID único → gera hash → gera QR → URL pública → verificação → status → histórico. Conexão Multi-Tenant Firebase (sigar-6754a) com preservação de dados existentes.',
    category: 'GOVERNAMENTAL',
    route: 'fluxo_sivec',
    permission: 'sivec.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 74,
    id: 'mod_experiencia_superadmin',
    name: '74. Experiência do Super Admin',
    description: 'Console Master Unificado do Super Admin em 12 Pilares: Dashboard global, Instituições, Filiais, Utilizadores, Planos, SIVEC, Integrações, WhatsApp, Analytics, Auditoria, Configurações e Segurança. Cadastro de instituições com geração de Código de Acesso para o Proprietário entrar no seu portal e delegar acessos RBAC específicos.',
    category: 'SISTEMA',
    route: 'experiencia_superadmin',
    permission: 'instituicoes.manage',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 75,
    id: 'mod_experiencia_diretor',
    name: '75. Experiência do Diretor',
    description: 'Painel de Governança Executiva do Diretor nos 15 Módulos Oficiais: Dashboard, Alunos, Cursos, Turmas, Professores, Frequência, Avaliações, Pautas, Estágios, Financeiro, Documentos, Certificados, SIVEC, Comunicados e Relatórios. Entrada direta via Código de Acesso Institucional.',
    category: 'SISTEMA',
    route: 'experiencia_diretor',
    permission: 'centro.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 76,
    id: 'mod_experiencia_secretaria',
    name: '76. Experiência da Secretaria',
    description: 'Central de Atendimento e Operação da Secretaria Acadêmica nos 12 Pilares: Inscrições, Alunos, Matrículas, Turmas, Documentos, Contratos, Carteirinhas, Declarações, Certificados, Frequência, Comunicados e Pagamentos conforme permissão.',
    category: 'SECRETARIA',
    route: 'experiencia_secretaria',
    permission: 'secretaria.manage',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 77,
    id: 'mod_experiencia_financeiro',
    name: '77. Experiência do Financeiro',
    description: 'Gestão Financeira e Contábil Completa nos 13 Pilares: Dashboard financeiro, Contas a receber, Contas a pagar, Mensalidades, Pagamentos, M-Pesa, e-Mola, Recibos, Caixa, Sangria, Fornecedores, Despesas e Relatórios fiscais.',
    category: 'FINANCEIRO',
    route: 'experiencia_financeiro',
    permission: 'finance.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 78,
    id: 'mod_experiencia_professor',
    name: '78. Experiência do Professor',
    description: 'Portal e Ferramentas Pedagógicas do Professor e Formador nos 10 Pilares: Minhas turmas, Minhas aulas, Alunos, Presença, Avaliações, Notas, Materiais, Chat, Aulas online e Calendário acadêmico.',
    category: 'PEDAGOGICO',
    route: 'experiencia_professor',
    permission: 'classes.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 79,
    id: 'mod_experiencia_aluno',
    name: '79. Experiência do Aluno',
    description: 'Portal do Aluno e Formando nos 16 Pilares: Meu perfil, Meu curso, Minha turma, Horário, Aulas, Materiais, Frequência, Notas, Pauta, Boletim, Pagamentos, Recibos, Certificados, Estágio, Aulas online e Notificações.',
    category: 'PEDAGOGICO',
    route: 'experiencia_aluno',
    permission: 'students.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 80,
    id: 'mod_experiencia_porteiro',
    name: '80. Experiência do Porteiro',
    description: 'Interface ultra simples para controle de acesso na guarita: Scanner QR por câmara ou leitor ótico, registro rápido de Entrada/Saída, histórico do dia, bip sonoro e notificação automática WhatsApp aos encarregados.',
    category: 'OPERACIONAL',
    route: 'experiencia_porteiro',
    permission: 'portaria.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 81,
    id: 'mod_experiencia_empresa',
    name: '81. Experiência da Empresa & Parcerias',
    description: 'Portal de empresas conveniadas: cadastro corporativo, indicação e envio de candidatos/bolsistas, consulta de colaboradores inscritos, acompanhamento de estágios curriculares, envio de documentos e canal direto com a instituição.',
    category: 'INTEGRACOES',
    route: 'experiencia_empresa',
    permission: 'estagios.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  },
  {
    number: 90,
    id: 'mod_moztechwave_core',
    name: '90. MOZTECHWAVE CORE — Painel do Dono da Plataforma',
    description: 'Centro de controlo do proprietário da plataforma: Dashboard global, gestão multi-institucional, IAM de utilizadores, autoridade nacional SIVEC, tesouraria MOZCOIN, gestão de planos SaaS, auditoria forense global, segurança militar e topologia do ecossistema.',
    category: 'SEGURANCA',
    route: 'moztechwave_core',
    permission: 'auditoria.view',
    isCore: true,
    status: 'PRODUCAO',
    architecturalPillars: [
      'MODULAR',
      'ESCALÁVEL',
      'SEGURO',
      'MULTI-INSTITUIÇÃO',
      'AUDITÁVEL',
      'RESPONSIVO',
      'API-FIRST',
      'FIREBASE READY',
      'AI READY'
    ]
  }
];

export function getModuleByRoute(route: string): SystemModule | undefined {
  return SYSTEM_MODULES.find(m => m.route === route);
}

export function getModulesByCategory(category: ModuleCategory): SystemModule[] {
  return SYSTEM_MODULES.filter(m => m.category === category);
}
