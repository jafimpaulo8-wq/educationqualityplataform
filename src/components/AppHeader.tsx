import React from 'react';
import { 
  Menu, 
  Bell, 
  Building2, 
  User, 
  ExternalLink, 
  Plus, 
  ShieldCheck,
  Search,
  Sparkles,
  MapPin,
  LogIn,
  LogOut,
  KeyRound,
  Database,
  CloudCheck,
  Globe,
  Settings,
  DollarSign,
  Coins
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/LanguageContext';
import { AppRoute } from '../types';
import { toCanonicalRole, ROLE_DEFINITIONS } from '../types/rbac';

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNotificationCenter: () => void;
  onOpenAuthModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  onOpenMobileMenu, 
  onOpenNotificationCenter,
  onOpenAuthModal 
}) => {
  const { 
    currentRoute, 
    navigate, 
    activeInstitution, 
    unreadCount, 
    activeRole,
    activeBranchId,
    setActiveBranchId,
    firebaseUser,
    isFirebaseConnected,
    loginWithGoogle,
    logout,
    activeInstitutionWallet,
    activeUserWallet
  } = useApp();

  const { language, setLanguage, t } = useTranslation();

  const canonicalActive = toCanonicalRole(activeRole);
  const isSuper = firebaseUser?.email === 'jafimpaulo8@gmail.com' || canonicalActive === 'SUPER_ADMIN';

  const getRouteBreadcrumb = () => {
    switch (currentRoute) {
      case 'public_portal':
        return 'Portal Público • Inscrições & Consulta';
      case 'admin_dashboard':
        return 'Moztechwave Core • Super Admin';
      case 'admin_cadastrar':
        return 'Super Admin • Cadastrar Nova Instituição';
      case 'admin_instituicoes':
        return 'Super Admin • Diretório de Instituições';
      case 'centro_dashboard':
        return `${activeInstitution.name} • Dashboard`;
      case 'alunos_list':
        return `${activeInstitution.code} • Gestão Completa de Alunos`;
      case 'alunos_cadastrar':
        return `${activeInstitution.code} • Nova Matrícula de Aluno`;
      case 'alunos_perfil':
        return `${activeInstitution.code} • Dossiê / Perfil Acadêmico`;
      case 'avaliacoes':
      case 'pautas':
        return `${activeInstitution.code} • Pautas & Avaliações`;
      case 'contratos':
      case 'contratos_editor':
        return `${activeInstitution.code} • Editor de Contratos & Termos`;
      case 'studio':
      case 'studio_editor':
        return 'SIVERC Document Studio • Certificados & Assinaturas';
      case 'sivec_verify':
      case 'sivec_connect':
      case 'sivec_pass':
        return 'SIVERC Core • Verificação Pública & Connect';
      case 'automacoes':
        return 'Automação • Aniversários & Lembretes WhatsApp';
      case 'candidatos_gestao':
        return `${activeInstitution.code} • Gestão de Candidatos & Inscrições`;
      case 'inscricao_publica':
        return `${activeInstitution.name} • Portal de Inscrições Online`;
      default:
        return 'Moztechwave Education Platform';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Abrir Menu de Navegação"
          className="p-2 rounded-xl bg-[#0d1527] border border-slate-800 text-slate-400 hover:text-white lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d1527] border border-slate-800 text-xs text-slate-300 font-mono">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-white">{activeInstitution.code}</span>
          </div>

          <span className="text-xs sm:text-sm font-semibold text-white tracking-tight line-clamp-1">
            {getRouteBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Center/Right: Filial Badge / Quick Selector & Firebase Status */}
      <div className="hidden md:flex items-center gap-3">
        {/* Firestore Status Badge */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border font-mono ${
            isFirebaseConnected 
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' 
              : 'bg-amber-950/40 border-amber-800/60 text-amber-400'
          }`}
          title={isFirebaseConnected ? 'Banco Firestore sincronizado e ativo' : 'A ligar à Cloud...'}
        >
          <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-[10px] font-bold tracking-wider">FIRESTORE</span>
        </div>

        {currentRoute !== 'public_portal' && (
          <div className="flex items-center gap-2 bg-[#0d1527] border border-slate-800 px-2.5 py-1 rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-semibold">Filial:</span>
            <select
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              aria-label="Selecionar Filial"
              className="bg-transparent text-xs text-amber-400 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="todas" className="bg-[#090d16] text-white">
                Todas ({activeInstitution.branches?.length || 0})
              </option>
              {activeInstitution.branches?.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#090d16] text-white">
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Quick actions, notifications, auth indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick action button based on context */}
        {currentRoute !== 'alunos_cadastrar' && currentRoute !== 'public_portal' && (
          <button
            onClick={() => navigate('alunos_cadastrar')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Matricular Aluno</span>
          </button>
        )}

        {/* Public Portal Switcher */}
        {currentRoute !== 'public_portal' ? (
          <button
            onClick={() => navigate('public_portal')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#111c35] border border-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Portal Público</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (onOpenAuthModal) {
                onOpenAuthModal();
              } else {
                navigate('centro_dashboard');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-600/30"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Aceder Gestão (SIGAR)</span>
          </button>
        )}

        {/* MOZCOIN Quick Balance Badge (Requisito 86) */}
        <button
          onClick={() => navigate('mozcoin_wallet')}
          title="Ver Carteira MOZCOIN"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>{(activeInstitutionWallet?.balance ?? activeUserWallet?.balance ?? 0).toLocaleString()}</span>
          <span className="text-[10px] font-sans font-normal text-amber-400/80">MOZ</span>
        </button>

        {/* MOZTECHWAVE ID Quick Button (Requisito 87) */}
        <button
          onClick={() => navigate('moztechwave_id')}
          title="Central MOZTECHWAVE ID"
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>MW ID</span>
        </button>

        {/* Multi-Language Selector (PT / EN) */}
        <div className="flex items-center rounded-xl bg-[#0d1527] border border-slate-800 p-0.5">
          <button
            type="button"
            onClick={() => setLanguage('pt')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              language === 'pt'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mudar idioma para Português (Padrão)"
          >
            <span>🇲🇿</span>
            <span className="hidden sm:inline">PT</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch language to English"
          >
            <span>🇬🇧</span>
            <span className="hidden sm:inline">EN</span>
          </button>
        </div>

        {/* Institution Settings Shortcut - restricted to Diretor and Admin */}
        {(isSuper || canonicalActive === 'DIRETOR' || canonicalActive === 'ADMIN_INSTITUICAO') && (
          <button
            onClick={() => navigate('configuracoes_instituicao')}
            aria-label={t('institution.title', 'Configurações da Instituição')}
            className={`p-2 rounded-xl border text-slate-300 hover:text-white cursor-pointer transition-all ${
              currentRoute === 'configuracoes_instituicao'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-[#0d1527] border-slate-800 hover:bg-[#111c35]'
            }`}
            title={t('institution.title', 'Configurações da Instituição (Módulo 61)')}
          >
            <Settings className="w-4 h-4 text-blue-400" />
          </button>
        )}

        {/* Financial Settings Shortcut - restricted to Diretor, Admin, and Financeiro */}
        {(isSuper || canonicalActive === 'DIRETOR' || canonicalActive === 'ADMIN_INSTITUICAO' || canonicalActive === 'FINANCEIRO') && (
          <button
            onClick={() => navigate('configuracoes_financeiras')}
            aria-label={t('finance.title', 'Configurações Financeiras')}
            className={`p-2 rounded-xl border text-slate-300 hover:text-white cursor-pointer transition-all ${
              currentRoute === 'configuracoes_financeiras'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#0d1527] border-slate-800 hover:bg-[#111c35]'
            }`}
            title={t('finance.title', 'Configurações Financeiras (Módulo 62)')}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={onOpenNotificationCenter}
          aria-label="Notificações"
          className="relative p-2 rounded-xl bg-[#0d1527] border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition-all"
          title="Central de Notificações SIVERC"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Authentication & Access Button - only shown when not authenticated */}
        {!firebaseUser && (
          <button
            onClick={() => {
              if (onOpenAuthModal) {
                onOpenAuthModal();
              } else {
                loginWithGoogle();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer transition-all"
            title="Autenticação Segura SIGAR"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Entrar / Acesso</span>
          </button>
        )}

        {/* Google Authentication / User Badge */}
        {firebaseUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            {firebaseUser.photoURL ? (
              <img 
                src={firebaseUser.photoURL} 
                alt="User" 
                className="w-8 h-8 rounded-xl object-cover border border-blue-500/50" 
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-blue-950/60 border border-blue-600/40 flex items-center justify-center text-blue-400 font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="hidden lg:block text-left text-[11px] leading-tight max-w-[130px]">
              <span className="font-bold text-white block truncate">
                {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
              </span>
              <button
                onClick={() => navigate('rbac_matrix')}
                title="Ver Matriz de Permissões RBAC"
                className="font-mono text-[9px] font-bold block uppercase hover:underline cursor-pointer text-amber-400"
              >
                {toCanonicalRole(activeRole)}
              </button>
            </div>
            <button
              onClick={logout}
              title="Encerrar Sessão"
              className="p-1.5 rounded-lg bg-[#0d1527] hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/40 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#111c35] border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer transition-all"
            title="Conectar com conta Google para autenticação na nuvem"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Google Auth</span>
          </button>
        )}
      </div>
    </header>
  );
};

