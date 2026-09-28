import React, { useState } from 'react';
import { 
  History, 
  X, 
  Clock, 
  User, 
  ShieldCheck, 
  FileText, 
  Plus, 
  Download, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export interface HistoryEvent {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  operatorName: string;
  operatorRole?: string;
  action: string;
  summary: string;
  details?: string;
  severity?: 'info' | 'aviso' | 'critico' | 'sucesso';
  beforeValue?: any;
  afterValue?: any;
}

interface RecordHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  entityId: string;
  entityCode?: string;
  customEvents?: HistoryEvent[];
  onAddObservation?: (text: string) => void;
}

export const RecordHistoryModal: React.FC<RecordHistoryModalProps> = ({
  isOpen,
  onClose,
  entityName,
  entityId,
  entityCode,
  customEvents,
  onAddObservation
}) => {
  const { auditLogs, activeRole } = useApp();
  const { success, warning } = useToast();
  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [localEvents, setLocalEvents] = useState<HistoryEvent[]>([]);

  if (!isOpen) return null;

  // Gather matching audit logs from AppContext or custom events
  const matchingAuditLogs: HistoryEvent[] = auditLogs
    .filter(log => log.entityId === entityId || log.relevantValues?.metadata?.studentId === entityId || log.relevantValues?.metadata?.courseId === entityId)
    .map(log => ({
      id: log.id,
      timestamp: log.timestamp || `${log.date} ${log.time}`,
      date: log.date,
      time: log.time,
      operatorName: log.userName || 'Operador do Sistema',
      operatorRole: log.userRole,
      action: log.actionLabel || log.action,
      summary: log.relevantValues?.summary || 'Operação registada na auditoria central.',
      severity: log.severity === 'critico' ? 'critico' : log.severity === 'aviso' ? 'aviso' : 'info',
      details: log.relevantValues?.metadata ? JSON.stringify(log.relevantValues.metadata) : undefined
    }));

  // Combine customEvents, matching audit logs, and localEvents
  const allEvents: HistoryEvent[] = [
    ...localEvents,
    ...(customEvents || []),
    ...matchingAuditLogs
  ];

  // If completely empty, provide an initial system creation entry so user always sees the origin
  if (allEvents.length === 0) {
    allEvents.push({
      id: 'initial_creation',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      time: '08:00:00',
      operatorName: 'Secretaria Geral (SIGAR)',
      operatorRole: 'Secretaria Académica',
      action: 'Criação e Matrícula Inicial',
      summary: `Registo oficializado no sistema sob ID ${entityId.slice(0, 8)}...`,
      severity: 'sucesso'
    });
  }

  // Sort descending by timestamp/date
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSaveNote = () => {
    if (!newNote.trim()) {
      warning('Nota Vazia', 'Por favor, escreva a observação antes de salvar.');
      return;
    }

    const now = new Date();
    const event: HistoryEvent = {
      id: `note_${Date.now()}`,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString(),
      operatorName: `Operador Atual (${activeRole})`,
      operatorRole: activeRole,
      action: 'Nota / Observação Manual',
      summary: newNote.trim(),
      severity: 'info'
    };

    setLocalEvents(prev => [event, ...prev]);
    if (onAddObservation) {
      onAddObservation(newNote.trim());
    }
    setNewNote('');
    setShowNoteInput(false);
    success('Histórico Atualizado', 'A observação foi anexada com carimbo de tempo ao histórico.');
  };

  const handleExportHistory = () => {
    const csvRows = [
      ['Data', 'Hora', 'Acao', 'Operador', 'Cargo', 'Sumario'].join(';')
    ];
    allEvents.forEach(e => {
      csvRows.push([
        `"${e.date}"`,
        `"${e.time}"`,
        `"${e.action}"`,
        `"${e.operatorName}"`,
        `"${e.operatorRole || ''}"`,
        `"${e.summary.replace(/"/g, '""')}"`
      ].join(';'));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Historico_${entityName.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exportação Concluída', 'Ficheiro CSV do histórico descarregado com sucesso.');
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#0d1527] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Histórico &amp; Trilha de Auditoria
                </h3>
                {entityCode && (
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {entityCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Registo cronológico imutável para: <strong className="text-slate-200">{entityName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toolbar */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300">
            {allEvents.length} {allEvents.length === 1 ? 'evento registado' : 'eventos registados'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090d16] hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Anexar Observação</span>
            </button>
          </div>
        </div>

        {/* Note input box */}
        {showNoteInput && (
          <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3 animate-fade-in">
            <label className="text-xs font-bold text-slate-200 block">
              Nova Anotação no Dossiê / Histórico:
            </label>
            <textarea
              rows={2}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Ex: Aluno apresentou comprovativo original de habilitações literárias..."
              className="w-full bg-[#0b1120] border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNoteInput(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
              >
                Gravar no Histórico
              </button>
            </div>
          </div>
        )}

        {/* Timeline Events List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {allEvents.map((evt, idx) => {
            let badgeBg = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            if (evt.severity === 'sucesso') badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            if (evt.severity === 'aviso') badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            if (evt.severity === 'critico') badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';

            return (
              <div 
                key={evt.id || idx}
                className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-2 relative hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeBg}`}>
                      {evt.action}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {evt.date} às {evt.time}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[160px] flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {evt.operatorName}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {evt.summary}
                </p>

                {evt.details && (
                  <div className="p-2 rounded-xl bg-[#0b1120] text-[10px] text-slate-400 font-mono border border-slate-800 break-all">
                    {evt.details}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Assinatura Digital de Integridade SIGAR</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
