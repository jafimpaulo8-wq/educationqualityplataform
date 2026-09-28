import React from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Menu,
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppRoute } from '../types';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileMenu }) => {
  const { currentRoute, navigate, unreadCount } = useApp();

  // Highlight active tab
  const isDashboard = currentRoute === 'centro_dashboard' || currentRoute === 'admin_dashboard';
  const isStudents = currentRoute === 'alunos_list' || currentRoute === 'alunos_cadastrar' || currentRoute === 'alunos_perfil';
  const isFinance = currentRoute === 'financeiro' || currentRoute === 'pagamentos' || currentRoute === 'caixa_escolar' || currentRoute === 'relatorios_financeiros';
  const isCertificates = currentRoute === 'sivec_verify' || currentRoute === 'sivec_studio' || currentRoute === 'studio';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800/90 py-1 px-2 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {/* 1. Dashboard */}
        <button
          onClick={() => navigate('centro_dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isDashboard 
              ? 'text-amber-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isDashboard ? 'bg-blue-600/20' : ''}`}>
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Início</span>
        </button>

        {/* 2. Alunos */}
        <button
          onClick={() => navigate('alunos_list')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isStudents 
              ? 'text-amber-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isStudents ? 'bg-blue-600/20' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Alunos</span>
        </button>

        {/* 3. Financeiro */}
        <button
          onClick={() => navigate('financeiro')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isFinance 
              ? 'text-amber-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isFinance ? 'bg-blue-600/20' : ''}`}>
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Finanças</span>
        </button>

        {/* 4. SIVEC / Certificados */}
        <button
          onClick={() => navigate('sivec_verify')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isCertificates 
              ? 'text-amber-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isCertificates ? 'bg-blue-600/20' : ''}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">SIVEC</span>
        </button>

        {/* 5. Menu Completo (Abre Drawer da Sidebar) */}
        <button
          onClick={onOpenMobileMenu}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#090d16]" />
          )}
        </button>
      </div>
    </nav>
  );
};
