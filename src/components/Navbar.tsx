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
  Lock,
  Sun,
  Moon,
  KeyRound
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onNavigateToPlatform: (mode?: 'google' | 'credentials' | 'code') => void;
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
  const { themeMode, toggleThemeMode } = useApp();

  const isLight = themeMode === 'branco';

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md transition-colors ${
      isLight 
        ? 'border-b border-slate-200 bg-white/95 text-slate-800 shadow-xs' 
        : 'border-b border-slate-800/80 bg-slate-950/90 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* SIGAR PRO Brand & Description (PARTE 3) */}
          <div className="flex items-center gap-3 select-none">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isLight ? 'bg-white' : 'bg-slate-950'
              }`}>
                <GraduationCap className={`w-6 h-6 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-black tracking-tight font-mono ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  SIGAR<span className="text-sky-500">PRO</span>
                </span>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${
                  isLight 
                    ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                }`}>
                  Moçambique
                </span>
              </div>
              <span className={`text-[11px] font-medium tracking-wide ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isLight
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
                    : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>Inscrição Online</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            )}

            {/* Verificação pública */}
            <button
              type="button"
              onClick={onOpenPublicVerify}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
              }`}
            >
              <Search className="w-4 h-4 text-sky-500" />
              <span>Verificação Pública</span>
            </button>

            {/* Registar instituição */}
            <button
              type="button"
              onClick={onOpenRegisterInstitution}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              <span>Registar Instituição</span>
            </button>

            {/* Ajuda */}
            <button
              type="button"
              onClick={onOpenHelp}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Ajuda</span>
            </button>

            {/* Theme Toggle Button (Fundo Branco vs Escuro) */}
            <button
              type="button"
              onClick={toggleThemeMode}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isLight
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
              title={isLight ? 'Fundo Branco Ativo (Clique para mudar para Escuro)' : 'Fundo Escuro Ativo (Clique para mudar para Fundo Branco)'}
            >
              {isLight ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-bold">Fundo Branco</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Fundo Escuro</span>
                </>
              )}
            </button>

            {/* Idioma */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isLight
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border-slate-800/80'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span className="uppercase">{currentLanguage || 'pt'}</span>
              </button>

              {langDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-32 rounded-xl border shadow-xl py-1 z-50 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}>
                  <button
                    onClick={() => { setLanguage('pt'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      isLight
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Português (MZ)
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      isLight
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Entrar com Código MTW / CEO */}
            <button
              type="button"
              onClick={() => onNavigateToPlatform('code')}
              className={`flex items-center gap-1.5 ml-1 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 shadow-2xs'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
              title="Aceder com Código MTW (CEO, Diretor, Secretaria, Professor, Aluno)"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Entrar com Código</span>
            </button>

            {/* Gestão SIGAR (Botão de Autenticação) */}
            <button
              type="button"
              onClick={() => onNavigateToPlatform('google')}
              className="flex items-center gap-2 ml-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Gestão SIGAR</span>
            </button>
          </nav>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleThemeMode}
              className={`p-2 rounded-xl border ${
                isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
              title="Alternar Tema"
            >
              {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>

            <button
              type="button"
              onClick={() => onNavigateToPlatform('code')}
              className="px-2.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] shadow-sm cursor-pointer"
            >
              Código
            </button>

            <button
              type="button"
              onClick={() => onNavigateToPlatform('google')}
              className="px-3.5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Gestão
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className={`lg:hidden py-4 border-t space-y-2 animate-fadeIn ${
            isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-950'
          }`}>
            {onOpenOnlineRegistration && (
              <button
                type="button"
                onClick={() => { onOpenOnlineRegistration(); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                  isLight ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>Inscrição Online (Candidatos)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => { onOpenPublicVerify(); setMobileMenuOpen(false); }}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Search className="w-4 h-4 text-sky-500" />
              <span>Verificação Pública</span>
            </button>

            <button
              type="button"
              onClick={() => { onOpenRegisterInstitution(); setMobileMenuOpen(false); }}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              <span>Registar Instituição</span>
            </button>

            <button
              type="button"
              onClick={() => { onOpenHelp(); setMobileMenuOpen(false); }}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Ajuda</span>
            </button>

            <div className={`pt-2 border-t flex items-center justify-between px-3 text-xs ${
              isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
            }`}>
              <span>Idioma:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('pt')}
                  className={`px-2 py-1 rounded text-xs ${currentLanguage === 'pt' ? 'bg-sky-500/20 text-sky-600 font-bold' : 'text-slate-500'}`}
                >
                  PT
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded text-xs ${currentLanguage === 'en' ? 'bg-sky-500/20 text-sky-600 font-bold' : 'text-slate-500'}`}
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
