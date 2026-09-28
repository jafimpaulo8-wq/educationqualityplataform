import React from 'react';
import { 
  Clock, 
  DoorOpen, 
  User, 
  Users, 
  AlertTriangle, 
  Edit3, 
  Trash2,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { ClassScheduleSlot } from '../../types';

interface ScheduleCardProps {
  slot: ClassScheduleSlot;
  hasConflict?: boolean;
  onEdit: (slot: ClassScheduleSlot) => void;
  onDelete: (slotId: string) => void;
  compact?: boolean;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  slot,
  hasConflict = false,
  onEdit,
  onDelete,
  compact = false
}) => {
  const getStatusBadge = (status: ClassScheduleSlot['status']) => {
    switch (status) {
      case 'Em Andamento':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Em Andamento
          </span>
        );
      case 'Realizada':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Realizada
          </span>
        );
      case 'Cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Agendada
          </span>
        );
    }
  };

  const slotColor = slot.color || '#3b82f6';

  if (compact) {
    return (
      <div 
        className={`group relative p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] shadow-sm ${
          hasConflict 
            ? 'bg-rose-950/40 border-rose-500/50 hover:border-rose-500 shadow-rose-950/50' 
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
        }`}
        style={{ borderLeftWidth: '4px', borderLeftColor: hasConflict ? '#ef4444' : slotColor }}
      >
        {/* Top bar with time and conflict alert */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-mono text-[11px] font-semibold text-slate-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
            {slot.startTime} - {slot.endTime}
          </span>
          {hasConflict && (
            <span 
              title="Conflito detectado neste horário!"
              className="p-0.5 rounded bg-rose-500/20 text-rose-400"
            >
              <AlertTriangle className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Discipline & Class */}
        <div className="font-semibold text-xs text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
          {slot.disciplineName}
        </div>
        <div className="text-[11px] text-slate-300 font-medium line-clamp-1 flex items-center gap-1 mt-0.5">
          <Users className="w-3 h-3 text-sky-400 shrink-0" />
          <span>{slot.classGroupName}</span>
        </div>

        {/* Room & Teacher */}
        <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex flex-col gap-0.5 text-[10px] text-slate-400">
          <div className="flex items-center gap-1 line-clamp-1">
            <User className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span className="truncate">{slot.teacherName}</span>
          </div>
          <div className="flex items-center gap-1 line-clamp-1">
            <DoorOpen className="w-2.5 h-2.5 text-rose-400 shrink-0" />
            <span className="truncate">{slot.room}</span>
          </div>
        </div>

        {/* Quick action buttons on hover */}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-950/90 backdrop-blur-sm p-1 rounded-lg border border-slate-800">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(slot);
            }}
            title="Editar aula"
            className="p-1 hover:text-amber-400 text-slate-400 transition-colors rounded"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remover aula de "${slot.disciplineName}" (${slot.classGroupName})?`)) {
                onDelete(slot.id);
              }
            }}
            title="Excluir aula"
            className="p-1 hover:text-rose-400 text-slate-400 transition-colors rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded card view for lists and detailed agendas
  return (
    <div 
      className={`p-4 rounded-2xl border transition-all hover:border-slate-700 bg-slate-900/60 shadow-lg ${
        hasConflict 
          ? 'border-rose-500/40 bg-rose-950/10' 
          : 'border-slate-800'
      }`}
      style={{ borderLeftWidth: '5px', borderLeftColor: hasConflict ? '#ef4444' : slotColor }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {slot.startTime} - {slot.endTime} ({slot.durationMinutes} min)
            </span>
            {getStatusBadge(slot.status)}
            {hasConflict && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" />
                Conflito Detectado
              </span>
            )}
            <span className="text-[11px] text-slate-400 capitalize bg-slate-800/40 px-2 py-0.5 rounded">
              {slot.recurrence}
            </span>
          </div>

          <h3 className="text-base font-semibold text-slate-100">
            {slot.disciplineName}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1.5 font-medium text-sky-400">
              <Users className="w-3.5 h-3.5" />
              Turma: {slot.classGroupName}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Docente: {slot.teacherName}
            </span>
            <span className="flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5 text-rose-400" />
              Espaço: {slot.room}
            </span>
          </div>

          {slot.notes && (
            <p className="text-xs text-slate-400 italic pt-1">
              Obs: {slot.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onEdit(slot)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => {
              if (confirm(`Remover horário de "${slot.disciplineName}" (${slot.classGroupName})?`)) {
                onDelete(slot.id);
              }
            }}
            className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors"
            title="Excluir aula"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
