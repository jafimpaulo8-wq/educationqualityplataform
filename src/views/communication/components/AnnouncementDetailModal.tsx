import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Share2, 
  Printer, 
  Edit3, 
  Trash2, 
  Bell,
  CheckCheck,
  Building2,
  Send,
  AlertCircle
} from 'lucide-react';
import { Announcement } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface AnnouncementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onPrint: (announcement: Announcement) => void;
  onConfirmAttendance: (id: string) => void;
  canManage: boolean;
}

export const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  isOpen,
  onClose,
  announcement,
  onEdit,
  onDelete,
  onPrint,
  onConfirmAttendance,
  canManage
}) => {
  const { activeInstitution } = useApp();

  if (!isOpen || !announcement) return null;

  const getTypeBadge = (type: Announcement['type']) => {
    switch (type) {
      case 'aviso':
        return { label: 'Aviso Oficial', bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' };
      case 'reuniao':
        return { label: 'Convocatória de Reunião', bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' };
      case 'mudanca_horario':
        return { label: 'Mudança de Horário', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
      case 'pagamento':
        return { label: 'Lembrete de Pagamento', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
      case 'feriado':
        return { label: 'Feriado & Recesso', bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' };
      case 'evento':
        return { label: 'Evento & Inovação', bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' };
      default:
        return { label: 'Comunicado', bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
    }
  };

  const getTargetLabel = (target: Announcement['targetAudience']) => {
    switch (target) {
      case 'todos': return 'Toda a Comunidade Académica';
      case 'curso': return `Curso: ${announcement.targetCourseName || 'Selecionado'}`;
      case 'turma': return `Turma: ${announcement.targetClassName || 'Selecionada'}`;
      case 'professor': return 'Docentes & Formadores';
      case 'aluno': return 'Estudantes & Formandos';
      case 'responsaveis': return 'Pais & Encarregados de Educação';
      default: return 'Geral';
    }
  };

  const handleShareWhatsApp = () => {
    const text = `📢 *COMUNICADO OFICIAL - ${activeInstitution.name}*\n\n` +
      `*${announcement.title}*\n` +
      `_Destinatários: ${getTargetLabel(announcement.targetAudience)}_\n\n` +
      `${announcement.summary ? `*Resumo:* ${announcement.summary}\n\n` : ''}` +
      `${announcement.content}\n\n` +
      (announcement.eventDate ? `📅 *Data/Hora:* ${new Date(announcement.eventDate).toLocaleString('pt-MZ')}\n` : '') +
      (announcement.eventLocation ? `📍 *Local:* ${announcement.eventLocation}\n` : '') +
      `\n🏛️ _Emitido por: ${announcement.authorName} (${announcement.authorRole || 'Direção'})_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const typeInfo = getTypeBadge(announcement.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        id="announcement-detail-modal"
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${typeInfo.bg}`}>
                {typeInfo.label}
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                Público: {getTargetLabel(announcement.targetAudience)}
              </span>
              {announcement.priority !== 'normal' && (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                  announcement.priority === 'urgente' 
                    ? 'bg-red-500/20 text-red-700 dark:text-red-400' 
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                }`}>
                  Prioridade {announcement.priority.toUpperCase()}
                </span>
              )}
              {announcement.status === 'agendado' && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Programado para {announcement.scheduledFor}</span>
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {announcement.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Publicado em: <strong>{announcement.publishDate}</strong></span>
              <span>•</span>
              <span>Emissor: <strong>{announcement.authorName}</strong> ({announcement.authorRole})</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Summary Callout if exists */}
          {announcement.summary && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 italic">
              &ldquo;{announcement.summary}&rdquo;
            </div>
          )}

          {/* Specific Extras */}
          {(announcement.eventDate || announcement.eventLocation) && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {announcement.eventDate && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">Data do Evento</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {new Date(announcement.eventDate).toLocaleDateString('pt-MZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              )}

              {announcement.eventLocation && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">Local de Realização</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {announcement.eventLocation}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedule Change Table */}
          {announcement.scheduleChangeDetails && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Quadro de Alteração de Horário</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Disciplina</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{announcement.scheduleChangeDetails.subject || 'Geral'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Horário Anterior</span>
                  <span className="line-through text-rose-600 dark:text-rose-400">{announcement.scheduleChangeDetails.previousSchedule}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Novo Horário</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{announcement.scheduleChangeDetails.newSchedule}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Sala / Laboratório</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{announcement.scheduleChangeDetails.roomOrLab || 'Normal'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Notice Details */}
          {announcement.paymentNoticeDetails && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span>Instruções de Pagamento e Contas Bancárias</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Mês de Referência:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{announcement.paymentNoticeDetails.referenceMonth}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Data Limite sem Multa:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{announcement.paymentNoticeDetails.dueDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Contas Bancárias:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{announcement.paymentNoticeDetails.bankAccount}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">M-Pesa / Referência:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{announcement.paymentNoticeDetails.mpesaEntity}</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Text Content */}
          <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            {announcement.content}
          </div>

          {/* Channels & Audit */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>Canais Ativos:</span>
              <div className="flex items-center gap-1.5 font-medium">
                {announcement.channels?.system && <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Sistema</span>}
                {announcement.channels?.email && <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Email</span>}
                {announcement.channels?.whatsapp && <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">WhatsApp</span>}
                {announcement.channels?.muralA4 && <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Mural A4</span>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span>Visualizações: <strong>{announcement.readCount || 0}</strong></span>
              {announcement.requiresConfirmation && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Confirmados: <strong>{announcement.confirmedCount || 0}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            {announcement.requiresConfirmation && (
              <button
                onClick={() => onConfirmAttendance(announcement.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Leitura / Presença</span>
              </button>
            )}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Partilhar no WhatsApp</span>
            </button>
            <button
              onClick={() => onPrint(announcement)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Circular A4</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(announcement);
                  }}
                  className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  title="Editar Comunicado"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza de que deseja excluir este comunicado oficial?')) {
                      onDelete(announcement.id);
                      onClose();
                    }
                  }}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  title="Excluir Comunicado"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
