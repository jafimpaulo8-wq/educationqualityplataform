import React from 'react';
import { CalendarEventBase } from '../../../types';
import { CATEGORY_CONFIG } from '../utils/calendarAggregation';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  ExternalLink, 
  Trash2, 
  AlertCircle,
  Building2,
  Tag,
  DollarSign,
  GraduationCap
} from 'lucide-react';

interface EventDetailModalProps {
  event: CalendarEventBase | null;
  onClose: () => void;
  onNavigateToModule?: (route: string, id?: string) => void;
  onDeleteCustomEvent?: (id: string) => void;
  currentUserId?: string;
  isSuperAdmin?: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onNavigateToModule,
  onDeleteCustomEvent,
  isSuperAdmin
}) => {
  if (!event) return null;

  const config = CATEGORY_CONFIG[event.category];
  const isCustomEvent = event.id.startsWith('cal-');

  // Format Date in full Portuguese
  const formatDateFull = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with category banner */}
        <div className={`p-4 border-b ${config.borderColor} ${config.bgLight} flex items-start justify-between gap-3`}>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.badgeBg} ${config.textColor}`}>
              {config.label}
            </span>

            {event.priority && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                event.priority === 'urgente'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : event.priority === 'alta'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                Prioridade {event.priority}
              </span>
            )}

            {event.status && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700">
                {event.status.toUpperCase()}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
              {event.title}
            </h2>
            {event.sourceModule && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Tag className="w-3 h-3 text-slate-600" />
                Origem: {event.sourceModule}
              </span>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300 text-xs leading-relaxed">
              {event.description}
            </div>
          )}

          {/* Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Date */}
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                Data
              </span>
              <p className="text-slate-200 font-semibold capitalize">
                {formatDateFull(event.startDate)}
              </p>
              {event.endDate && event.endDate !== event.startDate && (
                <p className="text-[11px] text-slate-400">
                  Até {formatDateFull(event.endDate)}
                </p>
              )}
            </div>

            {/* Time / Duration */}
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Horário
              </span>
              <p className="text-slate-200 font-semibold font-mono">
                {event.startTime ? `${event.startTime} ${event.endTime ? 'às ' + event.endTime : ''}` : 'Dia Inteiro'}
              </p>
            </div>

            {/* Responsible Person / Teacher / Student */}
            {event.userName && (
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Responsável / Vinculado
                </span>
                <p className="text-slate-200 font-semibold">
                  {event.userName}
                </p>
                {event.userRole && (
                  <p className="text-[11px] text-slate-400">
                    {event.userRole}
                  </p>
                )}
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Localização / Sala
                </span>
                <p className="text-slate-200 font-semibold">
                  {event.location}
                </p>
              </div>
            )}

            {/* Turma / Curso se aplicável */}
            {event.classGroupName && (
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  Turma & Disciplina
                </span>
                <p className="text-slate-200 font-semibold">
                  {event.classGroupName}
                </p>
                {event.disciplineName && (
                  <p className="text-[11px] text-slate-400">
                    {event.disciplineName}
                  </p>
                )}
              </div>
            )}

            {/* Valor do Pagamento se aplicável */}
            {event.amount && (
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                  Valor Financeiro
                </span>
                <p className="text-teal-400 font-bold font-mono text-sm">
                  {Number(event.amount).toLocaleString()} MT
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            {isCustomEvent && onDeleteCustomEvent && (
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza de que deseja remover este evento do calendário?')) {
                    onDeleteCustomEvent(event.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Evento</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Fechar
            </button>

            {event.targetRoute && onNavigateToModule && (
              <button
                onClick={() => {
                  onNavigateToModule(event.targetRoute!, event.targetId);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <span>Acessar Módulo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
