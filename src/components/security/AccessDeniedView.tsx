import React from 'react';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Lock, 
  Building2, 
  UserCheck, 
  RefreshCw, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppRoute, UserRole } from '../../types';
import { 
  ROUTE_POLICIES, 
  getDefaultRouteForRole, 
  getRoleDisplayName 
} from '../../security/routeSecurity';
import { toCanonicalRole } from '../../types/rbac';

interface AccessDeniedViewProps {
  attemptedRoute: AppRoute;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ attemptedRoute }) => {
  const { 
    activeRole, 
    authorizedRoles, 
    switchRole, 
    navigate, 
    activeInstitution,
    firebaseUser 
  } = useApp();

  const policy = ROUTE_POLICIES[attemptedRoute];
  const targetTitle = policy?.title || attemptedRoute;
  const currentCanonical = toCanonicalRole(activeRole);
  const currentTitle = getRoleDisplayName(activeRole);
  const defaultRoute = getDefaultRouteForRole(activeRole);

  // Check if any of user's other authorized roles have access to this route
  const alternateEligibleRoles = (authorizedRoles || []).filter(r => {
    const canonical = toCanonicalRole(r);
    return canonical !== currentCanonical && (policy?.allowedRoles || []).includes(canonical);
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-xl bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Top ambient highlight */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Security Badge & Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 shadow-lg shadow-rose-950/40">
            <ShieldAlert className="w-8 h-8 text-rose-400 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-[11px] font-mono font-bold text-rose-400 uppercase tracking-widest mb-2">
            <Lock className="w-3 h-3" />
            <span>Acesso Negado • RBAC 403</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Módulo Não Autorizado
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md">
            O seu perfil ativo (<strong className="text-amber-400">{currentTitle}</strong>) não possui permissão para aceder à funcionalidade <strong className="text-white">"{targetTitle}"</strong>.
          </p>

          {/* Context Details Card */}
          <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mt-6 text-left space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Instituição:
              </span>
              <span className="font-bold text-slate-200 truncate max-w-[200px]">
                {activeInstitution.name}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                Perfil Atual:
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
                {currentCanonical}
              </span>
            </div>

            <div className="text-slate-400 pt-1">
              <span className="block mb-1.5 text-[11px] font-sans text-slate-400">
                Perfis autorizados para este módulo:
              </span>
              <div className="flex flex-wrap gap-1.5 font-sans">
                {policy?.allowedRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-semibold text-slate-300"
                  >
                    {getRoleDisplayName(role)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* If the user actually has another authorized role that can view this */}
          {alternateEligibleRoles.length > 0 && (
            <div className="w-full mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left">
              <p className="text-xs text-amber-300 font-medium mb-2">
                A sua conta possui perfis com acesso a este módulo. Deseja alternar?
              </p>
              <div className="flex flex-wrap gap-2">
                {alternateEligibleRoles.map(altRole => (
                  <button
                    key={altRole}
                    onClick={() => {
                      switchRole(altRole);
                      navigate(attemptedRoute);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Alternar para {getRoleDisplayName(altRole)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-2.5 mt-6">
            <button
              onClick={() => navigate(defaultRoute)}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Ir para o Meu Dashboard Autorizado</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('public_portal')}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal Público</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
