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
          {/* Col 1: SIGAR PRO Platform Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 text-slate-950 font-black">
                SP
              </div>
              <span className="text-lg font-black text-white font-mono">
                SIGAR<span className="text-sky-400"> PRO</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Plataforma Integrada de Gestão Académica, Admissões e Registos Multi-Instituição. Preparada para inscrições online isoladas, gestão financeira e certificação verificável.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Gestão Multi-Instituição Isolada</span>
            </div>
          </div>

          {/* Col 2: Portais e Admissões */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Portais &amp; Admissões</h4>
            <ul className="space-y-2">
              <li><a href="#cursos" className="hover:text-sky-400 transition-colors">Catálogo de Formação e Ensino</a></li>
              <li><a href="#inscricao" className="hover:text-sky-400 transition-colors">Candidatura Online por Instituição</a></li>
              <li><a href="#consultar" className="hover:text-sky-400 transition-colors">Acompanhar Candidatura</a></li>
              <li><a href="#portal_aluno" className="hover:text-sky-400 transition-colors">Acesso ao Portal do Aluno</a></li>
            </ul>
          </div>

          {/* Col 3: Módulos SIGAR PRO */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Módulos Integrados</h4>
            <ul className="space-y-2">
              <li><a href="#certificados" className="hover:text-sky-400 transition-colors">Validador de Certificados Digitais</a></li>
              <li><a href="#pagamentos" className="hover:text-sky-400 transition-colors">Pagamentos &amp; Recibos Oficiais</a></li>
              <li><a href="#portaria" className="hover:text-sky-400 transition-colors">Portaria Digital &amp; Cartão Virtual</a></li>
              <li><a href="#consultar" className="hover:text-sky-400 transition-colors">Secretaria &amp; Registo Académico</a></li>
            </ul>
          </div>

          {/* Col 4: Atendimento Institucional */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Atendimento Institucional</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Cada instituição possui os seus próprios contactos e endereço no respectivo portal oficial.</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Contacte a secretaria da sua escola ou centro de formação</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>suporte@sigarpro.mz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom micro copyright bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 SIGAR PRO • Plataforma Multi-Instituição. Todos os direitos reservados.</p>
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
