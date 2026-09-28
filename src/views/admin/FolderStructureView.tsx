import React, { useState } from 'react';
import { 
  FolderTree, 
  Folder, 
  FileCode, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  ExternalLink, 
  Copy, 
  Download, 
  Search, 
  ChevronRight, 
  ChevronDown,
  Terminal,
  Server,
  Sparkles,
  Database,
  Cpu,
  Smartphone,
  Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { AppRoute } from '../../types';

interface TreeNode {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  description?: string;
  badge?: string;
  route?: AppRoute;
  children?: TreeNode[];
}

export const FolderStructureView: React.FC = () => {
  const { navigate } = useApp();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'src': true,
    'src/pages': true,
    'src/services': true,
    'firebase': true
  });
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  const fileTree: TreeNode[] = [
    {
      id: 'src',
      name: '/src',
      path: 'src/',
      type: 'folder',
      description: 'Núcleo do código-fonte modular em TypeScript e React 18',
      children: [
        {
          id: 'src/components',
          name: 'components',
          path: 'src/components/',
          type: 'folder',
          description: 'Biblioteca de componentes visuais reutilizáveis do Design System (Cards, Modais, Gráficos, Alertas)'
        },
        {
          id: 'src/layouts',
          name: 'layouts',
          path: 'src/layouts/',
          type: 'folder',
          description: 'Modelos de casca de aplicação (MainLayout com sidebar e cabeçalho, AuthLayout para login/público)',
          children: [
            { id: 'src/layouts/MainLayout.tsx', name: 'MainLayout.tsx', path: 'src/layouts/MainLayout.tsx', type: 'file', description: 'Layout mestre do painel com navegação e rodapé' },
            { id: 'src/layouts/AuthLayout.tsx', name: 'AuthLayout.tsx', path: 'src/layouts/AuthLayout.tsx', type: 'file', description: 'Layout para fluxos de autenticação e portais públicos' },
            { id: 'src/layouts/index.ts', name: 'index.ts', path: 'src/layouts/index.ts', type: 'file', description: 'Reexportação limpa de todos os layouts' }
          ]
        },
        {
          id: 'src/pages',
          name: 'pages',
          path: 'src/pages/',
          type: 'folder',
          description: 'Diretório oficial de páginas e módulos da plataforma com carregamento limpo',
          children: [
            { id: 'p_dash', name: 'dashboard', path: 'src/pages/dashboard/', type: 'folder', route: 'dashboard', description: '00. Painel Central Académico & Gestão Executiva', badge: 'Módulo Central' },
            { id: 'p_stud', name: 'students', path: 'src/pages/students/', type: 'folder', route: 'alunos', description: '01. Cadastro Geral, Histórico e Ficha Biográfica do Formando', badge: 'Módulo 01' },
            { id: 'p_enro', name: 'enrollments', path: 'src/pages/enrollments/', type: 'folder', route: 'secretaria', description: '05. Secretaria Virtual, Pré-inscrições e Matrículas', badge: 'Módulo 05' },
            { id: 'p_cour', name: 'courses', path: 'src/pages/courses/', type: 'folder', route: 'cursos', description: '02. Cursos Técnicos, Módulos Curriculares e Cargas Horárias', badge: 'Módulo 02' },
            { id: 'p_clas', name: 'classes', path: 'src/pages/classes/', type: 'folder', route: 'turmas', description: '03. Gestão de Turmas, Turnos, Horários e Lotação de Salas', badge: 'Módulo 03' },
            { id: 'p_teac', name: 'teachers', path: 'src/pages/teachers/', type: 'folder', route: 'docentes', description: '06. Corpo Docente, Formadores e Atribuições Pedagógicas', badge: 'Módulo 06' },
            { id: 'p_atte', name: 'attendance', path: 'src/pages/attendance/', type: 'folder', route: 'presencas', description: '18. Diário de Presenças, Assiduidade e Controlo de Faltas', badge: 'Módulo 18' },
            { id: 'p_eval', name: 'evaluations', path: 'src/pages/evaluations/', type: 'folder', route: 'avaliacoes', description: '20. Calendário de Avaliações Contínuas e Provas Exames', badge: 'Módulo 20' },
            { id: 'p_grad', name: 'grades', path: 'src/pages/grades/', type: 'folder', route: 'pautas', description: '04. Pautas de Frequência, Exames Finais e Médias Modulares', badge: 'Módulo 04' },
            { id: 'p_repo', name: 'report-cards', path: 'src/pages/report-cards/', type: 'folder', route: 'boletins', description: '21. Emissão de Boletins de Notas e Cadernetas', badge: 'Módulo 21' },
            { id: 'p_inte', name: 'internships', path: 'src/pages/internships/', type: 'folder', route: 'estagios', description: '12. Estágios Curriculares, Parcerias e Inserção Laboral', badge: 'Módulo 12' },
            { id: 'p_fina', name: 'finance', path: 'src/pages/finance/', type: 'folder', route: 'financeiro', description: '07. Gestão Financeira, Propinas, Emolumentos e Fluxo de Caixa', badge: 'Módulo 07' },
            { id: 'p_docu', name: 'documents', path: 'src/pages/documents/', type: 'folder', route: 'studio', description: '09. Document Studio, Modelos Visuais e Variáveis Dinâmicas', badge: 'Módulo 09' },
            { id: 'p_cert', name: 'certificates', path: 'src/pages/certificates/', type: 'folder', route: 'certificados', description: '22. Emissão de Diplomas e Certificados com QR Code e Hash', badge: 'Módulo 22' },
            { id: 'p_cont', name: 'contracts', path: 'src/pages/contracts/', type: 'folder', route: 'contratos', description: '15. Contratos de Formação com Cláusulas e Assinatura Digital', badge: 'Módulo 15' },
            { id: 'p_what', name: 'whatsapp', path: 'src/pages/whatsapp/', type: 'folder', route: 'whatsapp', description: '16. Automação WhatsApp, Notificações e Confirmação de Matrícula', badge: 'Módulo 16' },
            { id: 'p_acce', name: 'access-control', path: 'src/pages/access-control/', type: 'folder', route: 'portaria', description: '08. Portaria & Controlo de Acesso com Catraca Virtual e QR', badge: 'Módulo 08' },
            { id: 'p_onli', name: 'online-classes', path: 'src/pages/online-classes/', type: 'folder', route: 'sala_online', description: '23. Sala Virtual, Aulas Online, Materiais e Videoconferência', badge: 'Módulo 23' },
            { id: 'p_sive', name: 'sivec', path: 'src/pages/sivec/', type: 'folder', route: 'sivec_portal', description: '59. Portal SIVEC Governamental (DINET / ANEP / MEC Moçambique)', badge: 'Módulo 59' },
            { id: 'p_ai', name: 'ai', path: 'src/pages/ai/', type: 'folder', route: 'moztechwave_ia', description: '58. Assistente IA MozTechWave com Motor Gemini Flash', badge: 'Módulo 58' },
            { id: 'p_sett', name: 'settings', path: 'src/pages/settings/', type: 'folder', route: 'configuracoes_instituicao', description: '61. Configurações da Instituição, NUIT, Fiscais e Logotipo', badge: 'Módulo 61' }
          ]
        },
        {
          id: 'src/services',
          name: 'services',
          path: 'src/services/',
          type: 'folder',
          description: 'Regras de negócio, integrações de APIs e comunicação assíncrona',
          children: [
            { id: 's_fb', name: 'firebase', path: 'src/services/firebase/', type: 'folder', description: 'Conexão Firestore e Auth particionados por instituição' },
            { id: 's_pay', name: 'payments', path: 'src/services/payments/', type: 'folder', description: 'Conectores M-Pesa, e-Mola, Transferências BIM e BCI' },
            { id: 's_wa', name: 'whatsapp', path: 'src/services/whatsapp/', type: 'folder', description: 'WhatsApp Cloud API e Evolution Gateway' },
            { id: 's_siv', name: 'sivec', path: 'src/services/sivec/', type: 'folder', description: 'Barramento de validação nacional SIVEC / ANEP' },
            { id: 's_doc', name: 'documents', path: 'src/services/documents/', type: 'folder', description: 'Motor de compilação de PDFs e estampagem de selos' },
            { id: 's_not', name: 'notifications', path: 'src/services/notifications/', type: 'folder', description: 'Disparo de SMS, e-mails transacionais e avisos' },
            { id: 's_ai', name: 'ai', path: 'src/services/ai/', type: 'folder', description: 'Orquestração Gemini Flash para previsões de abandono' }
          ]
        },
        {
          id: 'src/security',
          name: 'security',
          path: 'src/security/',
          type: 'folder',
          description: 'Zero-Trust, sanitização preventiva contra injeções XSS, hashes SHA-256 e auditoria imutável'
        },
        {
          id: 'src/hooks',
          name: 'hooks',
          path: 'src/hooks/',
          type: 'folder',
          description: 'React Hooks customizados (useTenant, useAuth, useAudit) para injeção de dependências limpa'
        },
        {
          id: 'src/utils',
          name: 'utils',
          path: 'src/utils/',
          type: 'folder',
          description: 'Validadores moçambicanos de NUIT, BI, formatador de Meticais (MT / MZN) e geradores CSV/Excel'
        },
        {
          id: 'src/types',
          name: 'types',
          path: 'src/types/',
          type: 'folder',
          description: 'Definições e interfaces estritas de TypeScript para toda a solução'
        },
        {
          id: 'src/config',
          name: 'config',
          path: 'src/config/',
          type: 'folder',
          description: 'Constantes de ambiente, províncias moçambicanas e metas pedagógicas'
        }
      ]
    },
    {
      id: 'firebase',
      name: '/firebase',
      path: 'firebase/',
      type: 'folder',
      description: 'Políticas de segurança do banco em nuvem e gatilhos de backend serverless',
      children: [
        { id: 'fb_rules', name: 'firestore.rules', path: 'firebase/firestore.rules', type: 'file', description: 'Regras de segurança declarativas com isolamento estrito por inquilino' },
        { id: 'fb_storage', name: 'storage.rules', path: 'firebase/storage.rules', type: 'file', description: 'Políticas de upload seguro para fotos de alunos, diplomas e comprovativos' },
        { id: 'fb_func', name: 'functions', path: 'firebase/functions/', type: 'folder', description: 'Gatilhos em nuvem para webhooks de pagamentos M-Pesa e geração de hash SIVEC' }
      ]
    },
    {
      id: 'doc_studio',
      name: '/document-studio',
      path: 'document-studio/',
      type: 'folder',
      description: 'Módulo dedicado ao motor gráfico de design de diplomas, crachás e contratos'
    },
    {
      id: 'sivec_root',
      name: '/sivec',
      path: 'sivec/',
      type: 'folder',
      description: 'Conector de homologação governamental e conferência de diplomas nacionais'
    },
    {
      id: 'integrations_root',
      name: '/integrations',
      path: 'integrations/',
      type: 'folder',
      description: 'Hub de interoperabilidade para M-Pesa, e-Mola, bancos, WhatsApp, SMS e LMS'
    },
    {
      id: 'ai_root',
      name: '/ai',
      path: 'ai/',
      type: 'folder',
      description: 'Motor de Inteligência Artificial MozTechWave com integração Gemini Flash'
    }
  ];

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const copyStructure = () => {
    const textStructure = `
/src
  /components
  /layouts
  /pages
    /dashboard
    /students
    /enrollments
    /courses
    /classes
    /teachers
    /attendance
    /evaluations
    /grades
    /report-cards
    /internships
    /finance
    /documents
    /certificates
    /contracts
    /whatsapp
    /access-control
    /online-classes
    /sivec
    /ai
    /settings
  /services
    /firebase
    /payments
    /whatsapp
    /sivec
    /documents
    /notifications
    /ai
  /security
  /hooks
  /utils
  /types
  /config

/firebase
  firestore.rules
  storage.rules
  functions

/document-studio
/sivec
/integrations
/ai
    `.trim();

    navigator.clipboard.writeText(textStructure);
    showToast(
      'success',
      'Estrutura Copiada',
      'Árvore de diretórios oficial copiada para a área de transferência!'
    );
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return (
      <div className="space-y-1" style={{ paddingLeft: depth > 0 ? '16px' : '0' }}>
        {nodes.map(node => {
          const isExpanded = expandedNodes[node.id] ?? false;
          const hasChildren = node.children && node.children.length > 0;
          const isSelected = selectedNode?.id === node.id;

          return (
            <div key={node.id} className="space-y-1">
              <div
                onClick={() => {
                  setSelectedNode(node);
                  if (hasChildren) {
                    toggleNode(node.id);
                  }
                }}
                className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-emerald-500/60 shadow-md'
                    : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {hasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode(node.id);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  ) : (
                    <span className="w-5" />
                  )}

                  {node.type === 'folder' ? (
                    <Folder className={`w-4 h-4 shrink-0 ${isExpanded ? 'text-emerald-400' : 'text-amber-400'}`} />
                  ) : (
                    <FileCode className="w-4 h-4 shrink-0 text-cyan-400" />
                  )}

                  <span className={`font-mono font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                    {node.name}
                  </span>

                  {node.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {node.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {node.route && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (node.route) navigate(node.route);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-all"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {hasChildren && isExpanded && (
                <div className="border-l border-slate-800 ml-4">
                  {renderTree(node.children!, depth + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Módulo 66 Homologado
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                Separação Arquitetural Estrita
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                21 Páginas Modulares
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              66. Estrutura de Pastas & Arquitetura de Ficheiros
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              O ecossistema SIGAR / MozTechWave é estruturado em pastas isoladas com total desacoplamento:
              <strong className="text-slate-200"> /src</strong> (components, layouts, pages, services, security, hooks, utils, types, config),
              <strong className="text-slate-200"> /firebase</strong> (firestore.rules, storage.rules, functions), e módulos de primeira classe:
              <strong className="text-slate-200"> /document-studio, /sivec, /integrations</strong> e <strong className="text-slate-200">/ai</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={copyStructure}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Estrutura</span>
            </button>
            <button
              onClick={() => navigate('principio_fundamental')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 cursor-pointer transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>65. Princípio Fundamental</span>
            </button>
          </div>
        </div>

        {/* 4 Scorecard Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Páginas Desacopladas</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">21</span>
              <span className="text-xs font-bold text-cyan-400">/src/pages/*</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Carregamento sob demanda</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Serviços Modulares</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">7</span>
              <span className="text-xs font-bold text-indigo-400">/src/services/*</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Firebase, SIVEC, IA, Pagamentos</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Módulos de Raiz</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">4</span>
              <span className="text-xs font-bold text-emerald-400">Top-Level</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Studio, SIVEC, Hub, AI</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Arquitetura Serverless</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">/firebase</span>
              <span className="text-xs font-bold text-amber-400">Rules + Func</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">firestore + storage + functions</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Tree and Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Tree Explorer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Explorador de Arquivos & Pastas</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Estrutura 100% Homologada</span>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 max-h-[600px] overflow-y-auto">
            {renderTree(fileTree)}
          </div>
        </div>

        {/* Node Detail & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Detalhes do Diretório Selecionado
            </h3>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 block">{selectedNode.path}</span>
                    <h4 className="text-xl font-black text-white mt-1">{selectedNode.name}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                    {selectedNode.type}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedNode.description || 'Diretório modular oficial do sistema SIGAR.'}
                </p>

                {selectedNode.route && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Rota do Módulo Ativa:
                    </span>
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono text-slate-200">
                        sigar://app/{selectedNode.route}
                      </code>
                      <button
                        onClick={() => navigate(selectedNode.route!)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Abrir Visualização</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                <FolderTree className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p>Clique em qualquer pasta ou arquivo da árvore ao lado para inspecionar seus detalhes e abrir o módulo diretamente.</p>
              </div>
            )}
          </div>

          {/* Quick Access to Key Folders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Acesso Rápido às 4 Camadas de Topo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('studio')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
              >
                <code className="text-xs font-mono text-emerald-400 font-bold block">/document-studio</code>
                <span className="text-[11px] text-slate-400 mt-1 block">Certificados & Diplomas</span>
              </button>
              <button
                onClick={() => navigate('sivec_portal')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
              >
                <code className="text-xs font-mono text-blue-400 font-bold block">/sivec</code>
                <span className="text-[11px] text-slate-400 mt-1 block">DINET / ANEP / MEC</span>
              </button>
              <button
                onClick={() => navigate('integracoes_futuras')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
              >
                <code className="text-xs font-mono text-purple-400 font-bold block">/integrations</code>
                <span className="text-[11px] text-slate-400 mt-1 block">M-Pesa, Bancos, WhatsApp</span>
              </button>
              <button
                onClick={() => navigate('moztechwave_ia')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
              >
                <code className="text-xs font-mono text-pink-400 font-bold block">/ai</code>
                <span className="text-[11px] text-slate-400 mt-1 block">Motor Gemini Flash</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
