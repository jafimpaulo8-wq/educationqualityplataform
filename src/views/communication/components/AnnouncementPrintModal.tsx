import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Announcement } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface AnnouncementPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

export const AnnouncementPrintModal: React.FC<AnnouncementPrintModalProps> = ({
  isOpen,
  onClose,
  announcement
}) => {
  const { activeInstitution } = useApp();

  if (!isOpen || !announcement) return null;

  const handlePrint = () => {
    window.print();
  };

  const getTargetDescription = (target: Announcement['targetAudience']) => {
    switch (target) {
      case 'todos': return 'A Toda a Comunidade Académica (Estudantes, Docentes e Funcionários)';
      case 'curso': return `Aos Estudantes e Docentes do Curso: ${announcement.targetCourseName || 'Selecionado'}`;
      case 'turma': return `Aos Formandos da Turma: ${announcement.targetClassName || 'Selecionada'}`;
      case 'professor': return 'Ao Corpo Docente e Formadores';
      case 'aluno': return 'A Todos os Formandos e Estudantes';
      case 'responsaveis': return 'Aos Prezados Pais e Encarregados de Educação';
      default: return 'Geral';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div 
        id="announcement-print-modal"
        className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none"
      >
        {/* Modal Controls - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">Visualização de Impressão Oficial A4 (Circular Institucional)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Standard Mozambican Institutional Template) */}
        <div className="p-10 sm:p-14 font-serif leading-relaxed text-slate-900 bg-white min-h-[900px]">
          {/* Official Mozambique Institutional Header */}
          <div className="text-center space-y-1.5 pb-6 border-b-2 border-slate-900">
            <h4 className="text-xs tracking-widest uppercase font-bold text-slate-700">
              República de Moçambique
            </h4>
            <h5 className="text-[11px] tracking-wider uppercase font-semibold text-slate-600">
              Ministério da Ciência, Tecnologia e Ensino Superior / ANEP - SIVEC
            </h5>
            <div className="py-2">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-950 font-sans">
                {activeInstitution.name}
              </h1>
              <p className="text-xs font-sans text-slate-600">
                {activeInstitution.address} • NUIT: {activeInstitution.nuit} • Contato: {activeInstitution.phone}
              </p>
            </div>
            <div className="inline-block px-4 py-1 border border-slate-800 text-xs font-bold uppercase tracking-wider">
              {announcement.type === 'aviso' && 'AVISO OFICIAL Nº ' + announcement.id.toUpperCase().replace('ANN-', 'AV-')}
              {announcement.type === 'reuniao' && 'CONVOCATÓRIA DE REUNIÃO Nº ' + announcement.id.toUpperCase().replace('ANN-', 'CONV-')}
              {announcement.type === 'mudanca_horario' && 'COMUNICADO DE ALTERAÇÃO DE HORÁRIO Nº ' + announcement.id.toUpperCase().replace('ANN-', 'HOR-')}
              {announcement.type === 'pagamento' && 'CIRCULAR DE TESOURARIA Nº ' + announcement.id.toUpperCase().replace('ANN-', 'TES-')}
              {announcement.type === 'feriado' && 'COMUNICADO DE RECESSO LETIVO Nº ' + announcement.id.toUpperCase().replace('ANN-', 'FER-')}
              {announcement.type === 'evento' && 'CONVITE & COMUNICADO DE EVENTO Nº ' + announcement.id.toUpperCase().replace('ANN-', 'EVT-')}
            </div>
          </div>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs py-4 border-b border-slate-300 font-sans text-slate-700">
            <div>
              <span className="font-bold">Destinatários:</span> {getTargetDescription(announcement.targetAudience)}
            </div>
            <div>
              <span className="font-bold">Data de Emissão:</span> {announcement.publishDate}
            </div>
          </div>

          {/* Document Subject / Title */}
          <div className="py-6 text-center space-y-2">
            <h2 className="text-lg sm:text-xl font-bold uppercase underline underline-offset-4 text-slate-950 font-sans">
              {announcement.title}
            </h2>
            {announcement.summary && (
              <p className="text-xs font-sans text-slate-600 italic max-w-2xl mx-auto">
                &ldquo;{announcement.summary}&rdquo;
              </p>
            )}
          </div>

          {/* Conditional Highlight Boxes */}
          {(announcement.eventDate || announcement.eventLocation) && (
            <div className="my-4 p-4 border border-slate-400 bg-slate-50 font-sans text-xs space-y-1.5">
              <h4 className="font-bold uppercase tracking-wider text-slate-800">Detalhes da Convocatória / Evento:</h4>
              {announcement.eventDate && (
                <p><strong>Data e Hora:</strong> {new Date(announcement.eventDate).toLocaleDateString('pt-MZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              )}
              {announcement.eventLocation && (
                <p><strong>Local de Realização:</strong> {announcement.eventLocation}</p>
              )}
            </div>
          )}

          {announcement.scheduleChangeDetails && (
            <div className="my-4 p-4 border border-slate-400 bg-slate-50 font-sans text-xs space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-800">Quadro de Alteração de Horário:</h4>
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="border border-slate-300 p-1.5">Disciplina</th>
                    <th className="border border-slate-300 p-1.5">Horário Anterior</th>
                    <th className="border border-slate-300 p-1.5">Novo Horário</th>
                    <th className="border border-slate-300 p-1.5">Sala/Lab</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-1.5 font-medium">{announcement.scheduleChangeDetails.subject || 'Geral'}</td>
                    <td className="border border-slate-300 p-1.5 line-through">{announcement.scheduleChangeDetails.previousSchedule}</td>
                    <td className="border border-slate-300 p-1.5 font-bold">{announcement.scheduleChangeDetails.newSchedule}</td>
                    <td className="border border-slate-300 p-1.5">{announcement.scheduleChangeDetails.roomOrLab || 'Normal'}</td>
                  </tr>
                </tbody>
              </table>
              {announcement.scheduleChangeDetails.effectiveDate && (
                <p className="pt-1 text-[11px] text-slate-600">Vigorante a partir de: <strong>{announcement.scheduleChangeDetails.effectiveDate}</strong></p>
              )}
            </div>
          )}

          {announcement.paymentNoticeDetails && (
            <div className="my-4 p-4 border border-slate-400 bg-slate-50 font-sans text-xs space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-800">Dados de Liquidação Financeira:</h4>
              <div className="grid grid-cols-2 gap-2">
                <p><strong>Mês de Referência:</strong> {announcement.paymentNoticeDetails.referenceMonth}</p>
                <p><strong>Data Limite Sem Multa:</strong> {announcement.paymentNoticeDetails.dueDate}</p>
                <p><strong>Contas Bancárias:</strong> {announcement.paymentNoticeDetails.bankAccount}</p>
                <p><strong>M-Pesa / Entidade:</strong> {announcement.paymentNoticeDetails.mpesaEntity}</p>
              </div>
            </div>
          )}

          {/* Main Body */}
          <div className="py-4 text-sm sm:text-base leading-relaxed text-slate-800 whitespace-pre-line text-justify">
            {announcement.content}
          </div>

          {/* Notice of confirmation if required */}
          {announcement.requiresConfirmation && (
            <div className="my-6 p-3 border-l-4 border-slate-900 bg-slate-50 font-sans text-xs text-slate-700">
              <strong>Nota Obrigatória:</strong> A comparência ou tomada de conhecimento do teor deste comunicado é de carácter obrigatório e deve ser confirmada formalmente perante os serviços competentes ou via portal académico.
            </div>
          )}

          {/* Signatures & Seal Section */}
          <div className="pt-16 grid grid-cols-2 gap-8 text-center font-sans text-xs">
            <div className="space-y-12">
              <div className="w-48 mx-auto border-b border-slate-900 pb-1"></div>
              <div>
                <p className="font-bold text-slate-900 uppercase">{announcement.authorName}</p>
                <p className="text-slate-600">{announcement.authorRole || 'Direção Pedagógica'}</p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="w-48 mx-auto border-b border-slate-900 pb-1"></div>
              <div>
                <p className="font-bold text-slate-900 uppercase">A Direção Geral</p>
                <p className="text-slate-600">[Carimbo em Branco / Selo Branco]</p>
              </div>
            </div>
          </div>

          {/* Footer Footnote */}
          <div className="pt-16 mt-8 border-t border-slate-200 text-center font-sans text-[10px] text-slate-500">
            Documento emitido electronicamente via Plataforma Moztechwave Education • Sistema Integrado de Gestão Académica (SIGA) • {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};
