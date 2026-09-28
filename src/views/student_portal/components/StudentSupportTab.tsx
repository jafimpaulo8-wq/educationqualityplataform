import React from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  FileQuestion, 
  ShieldCheck, 
  Send,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface StudentSupportTabProps {
  currentStudent: Student;
  onOpenRequestModal: () => void;
}

export const StudentSupportTab: React.FC<StudentSupportTabProps> = ({
  currentStudent,
  onOpenRequestModal
}) => {
  const { activeInstitution, openWhatsAppMessage } = useApp();

  const handleWhatsAppHelp = () => {
    const text = `Olá, Secretaria! Sou o(a) aluno(a) ${currentStudent.fullName} (Código: ${currentStudent.code}), matriculado(a) no curso ${currentStudent.courseName}. Preciso de apoio institucional com: `;
    const phone = activeInstitution?.phone || '853181189';
    openWhatsAppMessage(phone, text);
  };

  const faqs = [
    {
      q: 'Como solicito uma Declaração de Matrícula oficial?',
      a: 'Acesse a aba "Documentos" ou utilize o botão "Pedir à Secretaria" na barra lateral. O documento é emitido com autenticação digital SIVEC e fica disponível para download.'
    },
    {
      q: 'Qual é o prazo para pagamento das mensalidades sem multa?',
      a: 'As mensalidades vencem normalmente até o dia 10 de cada mês. Pagamentos via M-Pesa ou e-Mola são compensados automaticamente pelo sistema SIGAR.'
    },
    {
      q: 'O que fazer se uma nota não corresponder ao meu exame?',
      a: 'Dirija-se à aba "Minhas Notas" e clique em "Pedir Revisão". O pedido será analisado pelo docente titular e pelo Diretor Pedagógico no prazo de até 5 dias úteis.'
    },
    {
      q: 'Como utilizo a Carteirinha Digital para comprovação de meia-tarifa?',
      a: 'Apresente o QR Code no seu telemóvel ou o documento impresso aos operadores autorizados. O código contém assinatura digital criptográfica infalsificável.'
    }
  ];

  return (
    <div id="student-support-tab" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-slate-900 rounded-3xl border border-sky-800/40 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400 block">
              CANAL DE APOIO AO ESTUDANTE • SIGAR PRO
            </span>
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <HelpCircle className="w-7 h-7 text-sky-400" />
              Suporte & Atendimento Académico
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Tem dúvidas sobre notas, mensalidades, emissão de declarações ou horários de aulas? Entre em contacto direto com os serviços académicos da sua instituição.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleWhatsAppHelp}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp da Secretaria</span>
            </button>

            <button
              type="button"
              onClick={onOpenRequestModal}
              className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submeter Requerimento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Linha Direta</span>
          <p className="text-sm font-bold text-white font-mono">{activeInstitution?.phone || '+258 85 318 1189'}</p>
          <p className="text-[11px] text-slate-400">Atendimento telefónico</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-mono uppercase block">WhatsApp Suporte</span>
          <p className="text-sm font-bold text-white font-mono">+258 85 318 1189</p>
          <p className="text-[11px] text-slate-400">Seg. a Sex. 07h30 às 18h00</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-mono uppercase block">E-mail Oficial</span>
          <p className="text-sm font-bold text-white truncate">{activeInstitution?.email || 'secretaria@moztechwave.co.mz'}</p>
          <p className="text-[11px] text-slate-400">Tempo de resposta: até 24h</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Horário de Atendimento</span>
          <p className="text-sm font-bold text-white">07:30 — 17:30</p>
          <p className="text-[11px] text-slate-400">Sábados: 08:00 às 12:30</p>
        </div>
      </div>

      {/* Address & Institutional Location */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{activeInstitution?.name || 'Campus Principal'}</h4>
            <p className="text-xs text-slate-400">
              {activeInstitution?.address || 'Nacala-Porto, Província de Nampula'} • {activeInstitution?.city || 'Nacala'}, Moçambique
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-300">
          NUIT Oficial: <strong className="text-amber-400">402029013</strong>
        </div>
      </div>

      {/* Perguntas Frequentes (FAQ) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <FileQuestion className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-white">Perguntas Frequentes dos Estudantes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <h5 className="text-xs font-bold text-sky-300 flex items-start gap-2">
                <span className="text-slate-500 font-mono">Q{idx + 1}.</span>
                <span>{faq.q}</span>
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
