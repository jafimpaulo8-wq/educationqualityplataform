import React from 'react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'MozTechWave Education Platform',
  subtitle = 'Sistema de Gestão Escolar & Académica Integrada'
}) => {
  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-xl mb-2">
            M
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          {children}
        </div>

        <p className="text-center text-xs text-slate-500">
          República de Moçambique • Homologado SIVEC / ANEP / DINET
        </p>
      </div>
    </div>
  );
};
