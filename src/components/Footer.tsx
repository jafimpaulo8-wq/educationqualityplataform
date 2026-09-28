import React from 'react';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ExternalLink, 
  Heart,
  FileCheck
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Moztechwave & SIGAR Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 text-slate-950 font-black">
                MW
              </div>
              <span className="text-lg font-black text-white font-mono">
                SIGAR<span className="text-sky-400">.</span>MZ
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Sistema Integrado de Gestão Acadêmica e Registos da <strong className="text-slate-200">Moztechwave</strong>. Homologado pelo sistema SIVERC para inscrições online, pagamentos e certificação digital.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Certificação Nacional Homologada</span>
            </div>
          </div>

          {/* Col 2: Cursos e Formação */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cursos Oficiais</h4>
            <ul className="space-y-2">
              <li><a href="#cursos" className="hover:text-sky-400 transition-colors">Engenharia de Software Full-Stack</a></li>
              <li><a href="#cursos" className="hover:text-sky-400 transition-colors">Cibersegurança &amp; Redes Cisco</a></li>
              <li><a href="#cursos" className="hover:text-sky-400 transition-colors">Contabilidade Informatizada &amp; Fiscal</a></li>
              <li><a href="#cursos" className="hover:text-sky-400 transition-colors">Administração &amp; Gestão Estratégica</a></li>
              <li><a href="#cursos" className="hover:text-sky-400 transition-colors">Design Gráfico &amp; Multimídia</a></li>
              <li><a href="#cursos" className="hover:text-sky-400 transition-colors">Eletricidade &amp; Automação PLC</a></li>
            </ul>
          </div>

          {/* Col 3: Serviços e Integrações SIVERC */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">SIVERC Integrados</h4>
            <ul className="space-y-2">
              <li><a href="#inscricao" className="hover:text-sky-400 transition-colors">Ficha de Inscrição Online</a></li>
              <li><a href="#certificados" className="hover:text-sky-400 transition-colors">Validador de Certificados Digitais</a></li>
              <li><a href="#pagamentos" className="hover:text-sky-400 transition-colors">Gateway M-Pesa &amp; e-Mola</a></li>
              <li><a href="#portaria" className="hover:text-sky-400 transition-colors">Portaria Digital &amp; Cartão Virtual</a></li>
              <li><a href="#consultar" className="hover:text-sky-400 transition-colors">Consultar Processo Acadêmico</a></li>
            </ul>
          </div>

          {/* Col 4: Contactos & Localização */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Campus Moztechwave</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Av. 24 de Julho nº 1840, 3º Andar, Maputo - Moçambique</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+258 84 900 1200 / +258 87 210 3400</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>inscricoes@moztechwave.co.mz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom micro copyright bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 SIGAR • Moztechwave &amp; SIVERC Integrados. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Segurança SSL 256-bit</span>
            <span>•</span>
            <span>Termos de Uso</span>
            <span>•</span>
            <span>Privacidade de Dados</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
