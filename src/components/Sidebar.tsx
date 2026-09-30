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
          { label: 'Dashboard Professor', route: 'portal_professor', icon: <School className="w-4 h-4 text-sky-400" /> },
          { label: 'Minhas Turmas', route: 'turmas_gestao', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
          { label: 'Meus Alunos', route: 'alunos_list', icon: <Users className="w-4 h-4 text-blue-400" /> },
          { label: 'Lançamento de Notas', route: 'avaliacoes', icon: <FileText className="w-4 h-4 text-amber-400" /> },
          { label: 'Diário de Classe / Presenças', route: 'diario_professor', icon: <ClipboardList className="w-4 h-4 text-indigo-400" /> },
          { label: 'Horários', route: 'horarios_calendario', icon: <Calendar className="w-4 h-4 text-teal-400" /> },
          { label: 'Materiais & Tarefas', route: 'tarefas', icon: <CheckSquare className="w-4 h-4 text-orange-400" /> }
        ];

      case 'SECRETARIA':
        return [
          { label: 'Dashboard Secretaria', route: 'candidatos_gestao', icon: <ClipboardList className="w-4 h-4 text-sky-400" /> },
          { label: 'Inscrição Privada / Balcão', route: 'inscricao_privada', icon: <Lock className="w-4 h-4 text-amber-400" />, badge: 'Balcão' },
          { label: 'Inscrição Pública (Portal)', route: 'inscricao_publica', icon: <Globe className="w-4 h-4 text-emerald-400" /> },
          { label: 'Alunos', route: 'alunos_list', icon: <Users className="w-4 h-4 text-blue-400" /> },
          { label: 'Matrículas / Inscrições', route: 'alunos_cadastrar', icon: <PlusCircle className="w-4 h-4 text-emerald-400" />, badge: 'Novo' },
          { label: 'Turmas', route: 'turmas_gestao', icon: <Layers className="w-4 h-4 text-indigo-400" /> },
          { label: 'Transferências', route: 'alunos_perfil', icon: <GitBranch className="w-4 h-4 text-amber-400" /> },
          { label: 'Emissão de Documentos', route: 'contratos', icon: <FileText className="w-4 h-4 text-teal-400" /> },
          { label: 'Certificados', route: 'studio', icon: <Award className="w-4 h-4 text-amber-400" />, badge: 'SIVEC' },
          { label: 'Relatórios Académicos', route: 'relatorios_academicos', icon: <FileSpreadsheet className="w-4 h-4 text-rose-400" /> }
        ];

      case 'FINANCEIRO':
        return [
          { label: 'Dashboard Financeiro', route: 'financeiro', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
          { label: 'Caixa Escolar', route: 'caixa_escolar', icon: <CreditCard className="w-4 h-4 text-sky-400" /> },
          { label: 'Pagamentos / Mensalidades', route: 'pagamentos', icon: <DollarSign className="w-4 h-4 text-teal-400" /> },
          { label: 'Contas a Receber', route: 'financial_manager', icon: <FileText className="w-4 h-4 text-indigo-400" /> },
          { label: 'Contas a Pagar', route: 'financeiro_modulo29', icon: <FileSpreadsheet className="w-4 h-4 text-rose-400" /> },
          { label: 'Recibos', route: 'pagamentos', icon: <Award className="w-4 h-4 text-amber-400" /> },
          { label: 'Relatórios Financeiros', route: 'relatorios_financeiros', icon: <Layers className="w-4 h-4 text-orange-400" /> }
        ];

      case 'PORTEIRO':
        return [
          { label: 'Dashboard Portaria', route: 'portaria_acesso', icon: <DoorOpen className="w-4 h-4 text-amber-400" /> },
          { label: 'Registo de Entrada / Saída', route: 'controlo_entrada', icon: <CheckSquare className="w-4 h-4 text-emerald-400" /> },
          { label: 'Leitura de Cartões / QR Code', route: 'aluno_qrcode', icon: <QrCode className="w-4 h-4 text-sky-400" /> },
          { label: 'Consulta Rápida de Alunos', route: 'alunos_list', icon: <Users className="w-4 h-4 text-blue-400" /> },
          { label: 'Histórico do Dia', route: 'portaria_acesso', icon: <Calendar className="w-4 h-4 text-indigo-400" /> }
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
        className={`fixed top-0 bottom-0 left-0 w-72 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isLight ? 'bg-white border-r border-slate-200 text-slate-800 shadow-sm' : 'bg-[#090d16] border-r border-slate-800 text-slate-100'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Institution Header */}
        <div className={`p-4 border-b flex items-center justify-between transition-colors ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-[#0d1527]/90'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-600/30">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black text-sm tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>SIGAR</span>
                <span className={`text-[10px] px-1 rounded font-bold border ${
                  isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>PRO</span>
              </div>
              <p className={`text-[10px] truncate max-w-[145px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {activeInstitution.name}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onCloseMobile}
            className={`p-1 rounded-lg lg:hidden transition-colors ${
              isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Fechar navegação móvel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Institution / Filial Context Banner */}
        <div className={`px-4 py-2 border-b flex items-center justify-between text-xs transition-colors ${
          isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-[#070b12] border-slate-800/80'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className={`text-[11px] font-semibold truncate ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              {activeBranchId === 'todas' ? 'Todas as Filiais' : (activeInstitution.branches?.find(b => b.id === activeBranchId)?.name || 'Filial Principal')}
            </span>
          </div>

          {(canonicalActive === 'DIRETOR' || canonicalActive === 'ADMIN_INSTITUICAO' || isSuper) && (
            <button
              onClick={() => setShowAddBranchModal(true)}
              title="Adicionar Nova Filial / Delegação"
              className={`p-1 rounded-md text-amber-500 transition-all cursor-pointer ${
                isLight ? 'hover:bg-slate-200' : 'hover:bg-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Identity Tag */}
        <div className={`px-4 py-2 border-b flex items-center justify-between transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800/80'
        }`}>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            <Lock className="w-3 h-3 text-amber-500" />
            Painel Autorizado:
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            isLight ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-amber-300 bg-amber-500/10 border-amber-500/20'
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
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-[#111c35]'
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
                      : isLight 
                        ? 'bg-slate-200 text-slate-700' 
                        : 'bg-slate-800 text-slate-400'
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

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
            <span>SIVEC Conectado</span>
            <span>SIGAR PRO • MZ</span>
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
