import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  Globe, 
  HelpCircle, 
  PlusCircle, 
  Lock
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface NavbarProps {
  onNavigateToPlatform: () => void;
  onOpenPublicVerify: () => void;
  onOpenOnlineRegistration?: () => void;
  onOpenRegisterInstitution: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateToPlatform,
  onOpenPublicVerify,
  onOpenOnlineRegistration,
  onOpenRegisterInstitution,
  onOpenHelp,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentLanguage, setLanguage } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* SIGAR PRO Brand & Description (PARTE 3) */}
          <div className="flex items-center gap-3 select-none">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white font-mono">
                  SIGAR<span className="text-sky-400">PRO</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Moçambique
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                Plataforma de Gestão Académica Integrada
              </span>
            </div>
          </div>

          {/* Desktop Public Navigation (PARTE 3) */}
          <nav className="hidden lg:flex items-center gap-2">
            
            {/* Inscrição Online */}
            {onOpenOnlineRegistration && (
              <button
                type="button"
                onClick={onOpenOnlineRegistration}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer shadow-sm shadow-emerald-950/40"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Inscrição Online</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {/* Verificação pública */}
            <button
              type="button"
              onClick={onOpenPublicVerify}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-sky-400" />
              <span>Verificação Pública</span>
            </button>

            {/* Registar instituição */}
            <button
              type="button"
              onClick={onOpenRegisterInstitution}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Registar Instituição</span>
            </button>

            {/* Ajuda */}
            <button
              type="button"
              onClick={onOpenHelp}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Ajuda</span>
            </button>

            {/* Idioma */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span className="uppercase">{currentLanguage || 'pt'}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50">
                  <button
                    onClick={() => { setLanguage('pt'); setLangDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Português (MZ)
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Gestão SIGAR (Botão de Autenticação) */}
            <button
              type="button"
              onClick={onNavigateToPlatform}
              className="flex items-center gap-2 ml-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-950/50 transition-all cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Gestão SIGAR</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToPlatform}
              className="px-3.5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Gestão SIGAR
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-2 animate-fadeIn">
            {onOpenOnlineRegistration && (
              <button
                type="button"
                onClick={() => { onOpenOnlineRegistration(); setMobileMenuOpen(false); }}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Inscrição Online (Candidatos)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => { onOpenPublicVerify(); setMobileMenuOpen(false); }}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900"
            >
              <Search className="w-4 h-4 text-sky-400" />
              <span>Verificação Pública</span>
            </button>

            <button
              type="button"
              onClick={() => { onOpenRegisterInstitution(); setMobileMenuOpen(false); }}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Registar Instituição</span>
            </button>

            <button
              type="button"
              onClick={() => { onOpenHelp(); setMobileMenuOpen(false); }}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-900"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Ajuda</span>
            </button>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-3 text-xs text-slate-400">
              <span>Idioma:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('pt')}
                  className={`px-2 py-1 rounded text-xs ${currentLanguage === 'pt' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400'}`}
                >
                  PT
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded text-xs ${currentLanguage === 'en' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400'}`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
