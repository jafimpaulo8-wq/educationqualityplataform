import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Building2, 
  HelpCircle, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  Award, 
  CreditCard, 
  FileText, 
  Lock, 
  Globe, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface PublicPortalLandingProps {
  onOpenAuthModal: () => void;
  onOpenPublicVerify: () => void;
  onOpenRegisterInstitution: () => void;
  onOpenHelp: () => void;
}

export const PublicPortalLanding: React.FC<PublicPortalLandingProps> = ({
  onOpenAuthModal,
  onOpenPublicVerify,
  onOpenRegisterInstitution,
  onOpenHelp,
}) => {
  const [quickVerifyCode, setQuickVerifyCode] = useState('');

  const handleQuickVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickVerifyCode.trim()) {
      soundManager.playClick();
      window.location.href = `/verify/${encodeURIComponent(quickVerifyCode.trim())}`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800/60 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Educação digital. Gestão inteligente. Futuro melhor.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none max-w-4xl mx-auto">
            SIGAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">PRO</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mt-4 font-normal leading-relaxed">
            Plataforma Integrada de Gestão Académica, Emissão de Certificados SIVEC e Administração Institucional em Moçambique.
          </p>

          {/* Primary Action Buttons (PARTE 3) */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-950/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Aceder à Gestão SIGAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenPublicVerify}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-sky-400" />
              <span>Verificação Pública</span>
            </button>

            <button
              type="button"
              onClick={onOpenRegisterInstitution}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Registar Instituição</span>
            </button>
          </div>

          {/* Quick Certificate Verification Box */}
          <div className="max-w-xl mx-auto mt-12 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Verificação Rápida de Certificados &amp; Diplomas SIVEC</span>
            </h3>
            <form onSubmit={handleQuickVerifySubmit} className="flex gap-2">
              <input
                type="text"
                value={quickVerifyCode}
                onChange={(e) => setQuickVerifyCode(e.target.value)}
                placeholder="Insira o código SIVEC (Ex: SIVEC-2026-XXXX)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Validar
              </button>
            </form>
            <p className="text-[11px] text-slate-500 text-left mt-2">
              Validação pública de autenticidade criptográfica de documentos emitidos por instituições autorizadas.
            </p>
          </div>

        </div>
      </section>

      {/* Modern SaaS Features Overview (Zero Private Data) */}
      <section className="py-16 sm:py-20 border-b border-slate-800/60 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tecnologia Completa para o Ensino Técnico e Universitário
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Desenvolvido sob padrões rigorosos de segurança e soberania de dados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Inscrições &amp; Matrículas Digitais</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recepção e triagem de candidaturas online, envio de documentos e gestão de turmas com redução de filas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Certificados &amp; Selo SIVEC</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Emissão segura de diplomas com hash criptográfico, código QR de validação e rastreamento oficial.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Pagamentos M-Pesa &amp; e-Mola</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conciliação financeira de propinas e taxas escolares em tempo real com emissão imediata de recibos.
              </p>
            </div>

          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              <span>Aceda ao seu painel institucional autorizado</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white font-mono">SIGAR PRO</span>
            <span className="text-slate-600">|</span>
            <span>Moztechwave Tecnologia</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenHelp} className="hover:text-white transition-colors cursor-pointer">
              Ajuda
            </button>
            <button onClick={onOpenPublicVerify} className="hover:text-white transition-colors cursor-pointer">
              Verificação
            </button>
            <button onClick={onOpenRegisterInstitution} className="hover:text-white transition-colors cursor-pointer">
              Registar Instituição
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
