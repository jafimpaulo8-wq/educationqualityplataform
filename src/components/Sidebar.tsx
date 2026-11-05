import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  FileText, 
  Award, 
  ShieldCheck, 
  Settings, 
  Calendar, 
  PlusCircle, 
  Layers, 
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  School,
  Sliders,
  MapPin,
  GitBranch,
  Lock,
  Plus,
  X,
  UserCheck,
  Globe,
  BookOpen,
  QrCode,
  DollarSign,
  CreditCard,
  CheckSquare,
  HardDrive,
  Coins,
  DoorOpen,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppRoute, UserRole } from '../types';
import { 
  toCanonicalRole, 
  CanonicalRole, 
  ROLE_DEFINITIONS 
} from '../types/rbac';
import { getRoleDisplayName } from '../security/routeSecurity';
import { RBACModal } from './RBACModal';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  route: AppRoute;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { 
    currentRoute, 
    navigate, 
    activeInstitution, 
    allInstitutions,
    activeRole, 
    setActiveRole,
    authorizedRoles,
    switchRole,
    activeBranchId, 
    setActiveBranchId,
    addBranch, 
    firebaseUser,
    themeMode 
  } = useApp();

  const isLight = themeMode === 'branco';

  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showRBACModal, setShowRBACModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');

  const canonicalActive = toCanonicalRole(activeRole);
  const isSuper = canonicalActive === 'SUPER_ADMIN';

  const handleNav = (route: AppRoute, params?: Record<string, any>) => {
    navigate(route, params);
    onCloseMobile();
  };

  /**
   * Section 6 Menu Engine:
   * Generates navigation items strictly tailored to the active canonical role.
   * Cross-role leakage is programmatically impossible.
   */
  const getRoleMenuItems = (): NavItem[] => {
    switch (canonicalActive) {
      case 'ALUNO':
      case 'RESPONSAVEL':
        return [
          { label: 'Dashboard Aluno', route: 'portal_aluno', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },
          { label: 'Cursos / Turmas', route: 'cursos_gestao', icon: <BookOpen className="w-4 h-4 text-sky-400" /> },
          { label: 'Horários', route: 'horarios_calendario', icon: <Calendar className="w-4 h-4 text-amber-400" /> },
          { label: 'Notas / Pautas', route: 'boletim', icon: <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> },
          { label: 'Presenças', route: 'aulas_frequencia', icon: <ClipboardList className="w-4 h-4 text-teal-400" /> },
          { label: 'Pagamentos', route: 'pagamentos', icon: <CreditCard className="w-4 h-4 text-rose-400" /> },
          { label: 'Certificados', route: 'studio', icon: <Award className="w-4 h-4 text-amber-400" />, badge: 'SIVEC' },
          { label: 'Definições do Perfil', route: 'moztechwave_id', icon: <UserCheck className="w-4 h-4 text-blue-400" /> }
        ];

      case 'PROFESSOR':
      case 'FORMADOR':
        return [
          { label: 'Início', route: 'portal_professor', icon: <School className="w-4 h-4 text-white" /> },
          { label: 'O Meu Perfil', route: 'moztechwave_id', icon: <UserCheck className="w-4 h-4 text-blue-200" /> },
          { label: 'Turmas', route: 'turmas_gestao', icon: <Layers className="w-4 h-4 text-blue-200" /> },
          { label: 'Alunos', route: 'alunos_list', icon: <Users className="w-4 h-4 text-blue-200" /> },
          { label: 'Avaliações', route: 'avaliacoes', icon: <FileText className="w-4 h-4 text-blue-200" /> },
          { label: 'Pagamentos', route: 'pagamentos', icon: <CreditCard className="w-4 h-4 text-blue-200" /> },
          { label: 'Certificados', route: 'studio', icon: <Award className="w-4 h-4 text-blue-200" /> },
          { label: 'Document Studio', route: 'studio_editor', icon: <BookOpen className="w-4 h-4 text-blue-200" /> },
          { label: 'Comunicações', route: 'comunicados', icon: <Calendar className="w-4 h-4 text-blue-200" /> },
          { label: 'Definições', route: 'configuracoes_instituicao', icon: <Settings className="w-4 h-4 text-blue-200" /> }
        ];

      case 'SECRETARIA':
        return [
          { label: 'Início', route: 'experiencia_secretaria', icon: <ClipboardList className="w-4 h-4 text-white" /> },
          { label: 'Alunos', route: 'alunos_list', icon: <Users className="w-4 h-4 text-emerald-200" /> },
          { label: 'Professores', route: 'professores_gestao', icon: <School className="w-4 h-4 text-emerald-200" /> },
          { label: 'Turmas', route: 'turmas_gestao', icon: <Layers className="w-4 h-4 text-emerald-200" /> },
          { label: 'Matrículas', route: 'alunos_cadastrar', icon: <PlusCircle className="w-4 h-4 text-emerald-200" />, badge: 'Novo' },
          { label: 'Pagamentos', route: 'pagamentos', icon: <DollarSign className="w-4 h-4 text-emerald-200" /> },
          { label: 'Pautas', route: 'pautas', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-200" /> },
          { label: 'Certificados', route: 'studio', icon: <Award className="w-4 h-4 text-emerald-200" />, badge: 'SIVEC' },
          { label: 'SIVEC', route: 'sivec_verify', icon: <ShieldCheck className="w-4 h-4 text-emerald-200" /> },
          { label: 'Document Studio', route: 'studio_editor', icon: <BookOpen className="w-4 h-4 text-emerald-200" /> },
          { label: 'Relatórios', route: 'relatorios_academicos', icon: <FileText className="w-4 h-4 text-emerald-200" /> },
          { label: 'Definições', route: 'configuracoes_instituicao', icon: <Settings className="w-4 h-4 text-emerald-200" /> }
        ];

      case 'FINANCEIRO':
        return [
          { label: 'Início', route: 'experiencia_financeiro', icon: <DollarSign className="w-4 h-4 text-white" /> },
          { label: 'Caixa Escolar', route: 'caixa_escolar', icon: <CreditCard className="w-4 h-4 text-amber-300" /> },
          { label: 'Mensalidades & Propinas', route: 'pagamentos', icon: <DollarSign className="w-4 h-4 text-emerald-300" /> },
          { label: 'Contas a Receber', route: 'financial_manager', icon: <FileText className="w-4 h-4 text-sky-300" /> },
          { label: 'Contas a Pagar', route: 'financeiro_modulo29', icon: <FileSpreadsheet className="w-4 h-4 text-rose-300" /> },
          { label: 'M-Pesa & e-Mola', route: 'experiencia_financeiro', icon: <Coins className="w-4 h-4 text-amber-300" /> },
          { label: 'Recibos & Faturas', route: 'experiencia_financeiro', icon: <Award className="w-4 h-4 text-teal-300" /> },
          { label: 'Relatórios & DRE', route: 'relatorios_financeiros', icon: <Layers className="w-4 h-4 text-purple-300" /> },
          { label: 'Definições', route: 'configuracoes_financeiras', icon: <Settings className="w-4 h-4 text-slate-300" /> }
        ];

      case 'PORTEIRO':
        return [
          { label: 'Início', route: 'experiencia_porteiro', icon: <DoorOpen className="w-4 h-4 text-white" /> },
          { label: 'Controlo de Acessos', route: 'controlo_entrada', icon: <CheckSquare className="w-4 h-4 text-slate-300" /> },
          { label: 'Visitantes', route: 'experiencia_porteiro', icon: <Users className="w-4 h-4 text-slate-300" /> },
          { label: 'Entregas/Levantamentos', route: 'experiencia_porteiro', icon: <Layers className="w-4 h-4 text-slate-300" /> },
          { label: 'Comunicações', route: 'comunicados', icon: <Calendar className="w-4 h-4 text-slate-300" /> },
          { label: 'Estado da Escola', route: 'portaria_acesso', icon: <ShieldCheck className="w-4 h-4 text-slate-300" /> },
          { label: 'Definições', route: 'moztechwave_id', icon: <Settings className="w-4 h-4 text-slate-300" /> }
        ];

      case 'CEO':
      case 'DIRETOR':
      case 'ADMIN_INSTITUICAO':
        return [
          { label: 'Dashboard Geral', route: 'centro_dashboard', icon: <School className="w-4 h-4 text-blue-400" /> },
          { label: 'Inscrições & Candidaturas', route: 'candidatos_gestao', icon: <ClipboardList className="w-4 h-4 text-sky-400" /> },
          { label: 'Inscrição Privada / Links', route: 'inscricao_privada', icon: <Lock className="w-4 h-4 text-amber-400" /> },
          { label: 'Visão Académica', route: 'relatorios_academicos', icon: <BookOpen className="w-4 h-4 text-sky-400" /> },
          { label: 'Visão Financeira', route: 'relatorios_financeiros', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
          { label: 'Professores', route: 'professores_gestao', icon: <Users className="w-4 h-4 text-indigo-400" /> },
          { label: 'Alunos', route: 'alunos_list', icon: <GraduationCap className="w-4 h-4 text-teal-400" /> },
          { label: 'Turmas', route: 'turmas_gestao', icon: <Layers className="w-4 h-4 text-purple-400" /> },
          { label: 'Homologação de Pautas', route: 'pautas', icon: <FileSpreadsheet className="w-4 h-4 text-amber-400" /> },
          { label: 'Aprovação de Certificados', route: 'studio', icon: <Award className="w-4 h-4 text-rose-400" />, badge: 'SIVEC' },
          { label: 'Relatórios Executivos', route: 'relatorios_administrativos', icon: <FileText className="w-4 h-4 text-blue-400" /> },
          { label: 'Configurações da Instituição', route: 'configuracoes_instituicao', icon: <Settings className="w-4 h-4 text-slate-300" /> }
        ];

      case 'SUPER_ADMIN':
        return [
          { label: 'Dashboard Global', route: 'moztechwave_core', icon: <ShieldCheck className="w-4 h-4 text-amber-400" />, badge: 'HQ' },
          { label: 'Instituições', route: 'admin_instituicoes', icon: <Building2 className="w-4 h-4 text-blue-400" /> },
          { label: 'Planos / Limites', route: 'sistema_planos', icon: <Sliders className="w-4 h-4 text-emerald-400" /> },
          { label: 'SIVEC Geral', route: 'sivec_verify', icon: <Award className="w-4 h-4 text-purple-400" /> },
          { label: 'Auditoria & Matriz RBAC', route: 'rbac_matrix', icon: <FileText className="w-4 h-4 text-indigo-400" /> },
          { label: 'Segurança Máxima', route: 'moztechwave_core', icon: <Lock className="w-4 h-4 text-rose-400" /> },
          { label: 'Aprovação MOZCOIN', route: 'mozcoin_aprovacao', icon: <Coins className="w-4 h-4 text-amber-400" /> },
          { label: 'Armazenamento & Backup', route: 'storage_gestao', icon: <HardDrive className="w-4 h-4 text-sky-400" /> },
          { label: 'Configurações do Sistema', route: 'configuracoes_financeiras', icon: <Settings className="w-4 h-4 text-slate-300" /> }
        ];

      case 'VISITANTE':
      default:
        return [
          { label: 'Portal Público', route: 'public_portal', icon: <Globe className="w-4 h-4 text-blue-400" /> },
          { label: 'Verificação Pública', route: 'public_verify', icon: <Award className="w-4 h-4 text-amber-400" /> },
          { label: 'Inscrição Online', route: 'inscricao_publica', icon: <FileText className="w-4 h-4 text-emerald-400" /> }
        ];
    }
  };

  const navItems = getRoleMenuItems();

  // Multi-role handling (Section 7)
  const userAuthorizedRolesList = isSuper
    ? ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'PORTEIRO', 'ALUNO']
    : (authorizedRoles || [activeRole]);

  const hasMultipleRoles = userAuthorizedRolesList.length > 1;

  // Determine Theme Style based on canonical active role matching reference image
  let sidebarBg = isLight ? 'bg-white border-r border-slate-200 text-slate-800 shadow-sm' : 'bg-[#090d16] border-r border-slate-800 text-slate-100';
  let headerBg = isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0d1527]/90';
  let activeItemStyle = 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30';
  let inactiveItemStyle = isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-[#111c35]';
  let brandSubtext = isLight ? 'text-slate-500' : 'text-slate-400';
  let brandIcon = <GraduationCap className="w-5 h-5 text-white" />;

  if (!isLight) {
    if (canonicalActive === 'PROFESSOR' || canonicalActive === 'FORMADOR') {
      sidebarBg = 'bg-[#1b3260] border-r border-[#24427e] text-white';
      headerBg = 'bg-[#15274d] border-[#24427e]';
      activeItemStyle = 'bg-[#2563eb] text-white font-bold shadow-md shadow-blue-900/40';
      inactiveItemStyle = 'text-blue-100 hover:text-white hover:bg-white/10';
      brandSubtext = 'text-blue-200';
      brandIcon = <GraduationCap className="w-5 h-5 text-white" />;
    } else if (canonicalActive === 'SECRETARIA') {
      sidebarBg = 'bg-[#064e3b] border-r border-[#065f46] text-white';
      headerBg = 'bg-[#043d2e] border-[#065f46]';
      activeItemStyle = 'bg-[#059669] text-white font-bold shadow-md shadow-emerald-900/40';
      inactiveItemStyle = 'text-emerald-100 hover:text-white hover:bg-white/10';
      brandSubtext = 'text-emerald-200';
      brandIcon = <Building2 className="w-5 h-5 text-white" />;
    } else if (canonicalActive === 'PORTEIRO') {
      sidebarBg = 'bg-[#0b1322] border-r border-[#1e293b] text-white';
      headerBg = 'bg-[#070b12] border-[#1e293b]';
      activeItemStyle = 'bg-[#1e293b] text-white font-bold border border-slate-700 shadow-md';
      inactiveItemStyle = 'text-slate-300 hover:text-white hover:bg-white/10';
      brandSubtext = 'text-slate-400';
      brandIcon = <DoorOpen className="w-5 h-5 text-white" />;
    } else if (canonicalActive === 'FINANCEIRO') {
      sidebarBg = 'bg-[#0a1628] border-r border-amber-900/40 text-white';
      headerBg = 'bg-[#06101d] border-amber-900/30';
      activeItemStyle = 'bg-gradient-to-r from-amber-600 to-emerald-600 text-white font-bold shadow-md shadow-amber-900/30';
      inactiveItemStyle = 'text-amber-100/80 hover:text-white hover:bg-white/10';
      brandSubtext = 'text-amber-200';
      brandIcon = <DollarSign className="w-5 h-5 text-white" />;
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Element */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-72 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarBg} ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Institution Header */}
        <div className={`p-4 border-b flex items-center justify-between transition-colors ${headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-md">
              {brandIcon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-wider text-white">SIGAR PRO</span>
              </div>
              <p className={`text-[10px] truncate max-w-[155px] font-medium ${brandSubtext}`}>
                Sistema Integrado de Gestão
              </p>
            </div>
          </div>
          
          <button 
            onClick={onCloseMobile}
            className="p-1 rounded-lg lg:hidden text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar navegação móvel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Super Admin Sovereign 4-Portals Quick Jump */}
        {isSuper && (
          <div className="px-3 py-2 border-b border-amber-500/30 bg-amber-500/10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-300">
              <span>Ambientes (4 Portais):</span>
              <span className="text-[9px] uppercase font-mono bg-amber-500/20 px-1 rounded">Super Admin</span>
            </div>
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              <button
                onClick={() => {
                  handleNav('portal_professor');
                }}
                title="Portal do Professor"
                className={`p-1 rounded text-center text-[10px] font-bold truncate transition-all cursor-pointer ${
                  currentRoute === 'portal_professor' ? 'bg-blue-600 text-white font-black' : 'bg-slate-900/80 text-blue-300 hover:bg-blue-900/50'
                }`}
              >
                Prof
              </button>
              <button
                onClick={() => {
                  handleNav('experiencia_secretaria');
                }}
                title="Portal da Secretaria"
                className={`p-1 rounded text-center text-[10px] font-bold truncate transition-all cursor-pointer ${
                  currentRoute === 'experiencia_secretaria' ? 'bg-emerald-600 text-white font-black' : 'bg-slate-900/80 text-emerald-300 hover:bg-emerald-900/50'
                }`}
              >
                Secr
              </button>
              <button
                onClick={() => {
                  handleNav('experiencia_financeiro');
                }}
                title="Portal Financeiro"
                className={`p-1 rounded text-center text-[10px] font-bold truncate transition-all cursor-pointer ${
                  currentRoute === 'experiencia_financeiro' ? 'bg-amber-600 text-white font-black' : 'bg-slate-900/80 text-amber-300 hover:bg-amber-900/50'
                }`}
              >
                Fin
              </button>
              <button
                onClick={() => {
                  handleNav('experiencia_porteiro');
                }}
                title="Portal do Porteiro"
                className={`p-1 rounded text-center text-[10px] font-bold truncate transition-all cursor-pointer ${
                  currentRoute === 'experiencia_porteiro' ? 'bg-slate-700 text-white font-black' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Port
              </button>
            </div>
          </div>
        )}

        {/* Institution / Filial Context Banner */}
        <div className={`px-4 py-2 border-b flex items-center justify-between text-xs transition-colors ${
          isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-black/20 border-white/10'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className={`text-[11px] font-semibold truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              {activeBranchId === 'todas' ? 'Todas as Filiais' : (activeInstitution.branches?.find(b => b.id === activeBranchId)?.name || 'Filial Principal')}
            </span>
          </div>

          {(canonicalActive === 'DIRETOR' || canonicalActive === 'ADMIN_INSTITUICAO' || isSuper) && (
            <button
              onClick={() => setShowAddBranchModal(true)}
              title="Adicionar Nova Filial / Delegação"
              className="p-1 rounded-md text-amber-400 hover:bg-white/10 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Identity Tag */}
        <div className={`px-4 py-2 border-b flex items-center justify-between transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'
        }`}>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            <Lock className="w-3 h-3 text-amber-400" />
            Ambiente:
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            isLight ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-amber-300 bg-amber-500/10 border-amber-500/30'
          }`}>
            {canonicalActive}
          </span>
        </div>

        {/* Navigation Menu strictly scoped to this profile */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNav(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                  isActive ? activeItemStyle : inactiveItemStyle
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0 ${
                    isActive 
                      ? 'bg-amber-400 text-slate-950 font-black' 
                      : 'bg-black/30 text-white/90 border border-white/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Multi-Role Switcher or Fixed Identity Badge (Section 7) */}
        <div className={`p-3.5 border-t space-y-2 transition-colors ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0d1527]/90'
        }`}>
          {hasMultipleRoles ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                  Alternar Perfil:
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase">
                  {userAuthorizedRolesList.length} Autorizados
                </span>
              </div>

              <select
                value={canonicalActive}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className={`w-full border text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer ${
                  isLight 
                    ? 'bg-white border-slate-300 text-slate-800' 
                    : 'bg-[#090d16] border-slate-700 text-amber-300'
                }`}
              >
                {userAuthorizedRolesList.map((r) => (
                  <option key={r} value={toCanonicalRole(r)} className={isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-white'}>
                    {getRoleDisplayName(r)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px]">
              <span className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Perfil Ativo:
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isLight ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-amber-300 bg-amber-500/10 border-amber-500/20'
              }`}>
                {getRoleDisplayName(activeRole)}
              </span>
            </div>
          )}

          {/* Quick RBAC matrix inspector shortcut for administrators */}
          {(canonicalActive === 'SUPER_ADMIN' || canonicalActive === 'DIRETOR') && (
            <button
              type="button"
              onClick={() => setShowRBACModal(true)}
              className="w-full py-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Inspecionar Matriz RBAC</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-300 font-mono">SIGAR PRO v3.0.0</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">SIVEC Online</span>
          </div>
        </div>
      </aside>

      {/* Modal: Matriz RBAC */}
      <RBACModal
        isOpen={showRBACModal}
        onClose={() => setShowRBACModal(false)}
      />

      {/* Modal: Adicionar Nova Filial / Delegação */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Cadastrar Nova Filial / Delegação</h3>
              </div>
              <button
                onClick={() => setShowAddBranchModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Instituição: <strong className="text-sky-400">{activeInstitution.name}</strong> ({activeInstitution.code})
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBranchName.trim() || !newBranchCode.trim()) return;
                addBranch({
                  name: newBranchName.trim(),
                  code: newBranchCode.trim().toUpperCase(),
                  city: newBranchCity.trim() || activeInstitution.city,
                  province: activeInstitution.province,
                  address: 'Endereço da delegação local',
                  phone: newBranchPhone.trim() || activeInstitution.phone,
                  isMainBranch: false,
                  status: 'active'
                });
                setNewBranchName('');
                setNewBranchCode('');
                setNewBranchCity('');
                setNewBranchPhone('');
                setShowAddBranchModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Filial / Delegação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Delegação da Beira ou Campus Matola"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Código da Filial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BEI-01"
                    value={newBranchCode}
                    onChange={(e) => setNewBranchCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Beira"
                    value={newBranchCity}
                    onChange={(e) => setNewBranchCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telefone Local / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="+258 84 000 0000"
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  Criar Filial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
