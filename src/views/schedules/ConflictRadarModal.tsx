import React from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DoorOpen, 
  User, 
  Users, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ClassScheduleSlot, ScheduleConflict } from '../../types';

interface ConflictRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: {
    slot: ClassScheduleSlot;
    conflict: ScheduleConflict;
  }[];
  onEditSlot: (slot: ClassScheduleSlot) => void;
}

export const ConflictRadarModal: React.FC<ConflictRadarModalProps> = ({
  isOpen,
  onClose,
  conflicts,
  onEditSlot
}) => {
  if (!isOpen) return null;

  const teacherConflicts = conflicts.filter(c => c.conflict.type === 'teacher');
  const roomConflicts = conflicts.filter(c => c.conflict.type === 'room');
  const classConflicts = conflicts.filter(c => c.conflict.type === 'classGroup');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              conflicts.length > 0 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-100">
                  Radar de Conflitos de Horários
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                  conflicts.length > 0 
                    ? 'bg-rose-500/20 text-rose-300' 
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {conflicts.length} Detectado(s)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Varredura cruzada de sobreposição entre Professores, Salas de Aula e Turmas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic counters */}
        <div className="grid grid-cols-3 gap-3 p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Professores Ocupados</span>
            </div>
            <div className="text-xl font-bold text-slate-100">
              {teacherConflicts.length}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <DoorOpen className="w-3.5 h-3.5 text-rose-400" />
              <span>Salas / Labs Ocupados</span>
            </div>
            <div className="text-xl font-bold text-slate-100">
              {roomConflicts.length}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Turmas Sobrepostas</span>
            </div>
            <div className="text-xl font-bold text-slate-100">
              {classConflicts.length}
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {conflicts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">Grade Perfeita! Zero Conflitos</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Todos os horários cadastrados possuem docentes livres, salas disponíveis e turmas sem dupla alocação no mesmo intervalo de tempo.
              </p>
            </div>
          ) : (
            conflicts.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 hover:border-rose-500/40 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                      {item.conflict.type === 'teacher' && <User className="w-4 h-4" />}
                      {item.conflict.type === 'room' && <DoorOpen className="w-4 h-4" />}
                      {item.conflict.type === 'classGroup' && <Users className="w-4 h-4" />}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-rose-300">
                        {item.conflict.title}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {item.conflict.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onEditSlot(item.slot);
                    }}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/30 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>Editar Horário</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details snippet */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-rose-900/30 text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500">Turma:</span> {item.slot.classGroupName}
                  </div>
                  <div>
                    <span className="text-slate-500">Disciplina:</span> {item.slot.disciplineName}
                  </div>
                  <div>
                    <span className="text-slate-500">Docente:</span> {item.slot.teacherName}
                  </div>
                  <div>
                    <span className="text-slate-500">Espaço:</span> {item.slot.room}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <span className="text-xs text-slate-400">
            Dica: Utilize a Grade Semanal interativa para reorganizar os horários.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
          >
            Fechar Radar
          </button>
        </div>
      </div>
    </div>
  );
};
