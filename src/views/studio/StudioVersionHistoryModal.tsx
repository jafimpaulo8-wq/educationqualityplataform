import React, { useState } from 'react';
import { 
  History, 
  X, 
  RotateCcw, 
  Calendar, 
  User, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Plus,
  Eye,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { StudioTemplate, StudioTemplateVersion } from '../../types/studio';

interface StudioVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: StudioTemplate;
  onRestoreVersion: (versionNumber: string) => void;
  onCreateNewVersion: (versionNumber: string, notes: string) => void;
}

export const StudioVersionHistoryModal: React.FC<StudioVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  template,
  onRestoreVersion,
  onCreateNewVersion
}) => {
  const [newVerNumber, setNewVerNumber] = useState('');
  const [changeNotes, setChangeNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedVersionDiff, setSelectedVersionDiff] = useState<StudioTemplateVersion | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVerNumber.trim()) return;
    onCreateNewVersion(newVerNumber.trim(), changeNotes.trim() || 'Nova versão registrada.');
    setNewVerNumber('');
    setChangeNotes('');
    setIsCreating(false);
  };

  const history = template.versionHistory || [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Histórico de Versões & Auditoria
              </h2>
              <p className="text-xs text-slate-500">
                {template.name} • Versão Atual: <strong className="text-slate-800 font-mono">{template.version}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Create New Version Snapshot Box */}
          {!isCreating ? (
            <div className="flex items-center justify-between p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl">
              <div>
                <p className="text-xs font-bold text-sky-900">Deseja criar um marco de versão?</p>
                <p className="text-[11px] text-sky-700">
                  Salve o estado visual atual como uma versão histórica imutável antes de fazer grandes alterações.
                </p>
              </div>
              <button
                onClick={() => setIsCreating(true)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Versão
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Registrar Nova Versão
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Número da Versão
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: v2.2 ou 2026.3"
                    value={newVerNumber}
                    onChange={(e) => setNewVerNumber(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Notas da Alteração
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Atualização do layout das assinaturas e carimbo oficial"
                    value={changeNotes}
                    onChange={(e) => setChangeNotes(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
                >
                  Salvar Versão
                </button>
              </div>
            </form>
          )}

          {/* Current Active Version Banner */}
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-300 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-xs font-bold text-emerald-950">
                  Versão Ativa no Editor:
                </strong>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                  {template.version}
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                  {template.format}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                Última modificação registrada em {template.updatedAt || template.createdAt} por {template.author || 'Administrador'}.
              </p>
            </div>
          </div>

          {/* Detailed Comparator Modal / Box */}
          {selectedVersionDiff && (
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Auditoria Comparativa: {selectedVersionDiff.version} vs {template.version} (Atual)
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedVersionDiff(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Fechar Comparador
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">
                    Documento Arquivado ({selectedVersionDiff.version})
                  </span>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    <p>• Data: <strong className="text-white">{selectedVersionDiff.savedAt}</strong></p>
                    <p>• Autor: <strong className="text-white">{selectedVersionDiff.savedBy || 'Administrador'}</strong></p>
                    <p>• Elementos Frente: <strong className="text-white">{selectedVersionDiff.frenteElements?.length || 0}</strong></p>
                    <p>• Elementos Verso: <strong className="text-white">{selectedVersionDiff.versoElements?.length || 0}</strong></p>
                    <p>• Notas: <span className="italic text-amber-200">"{selectedVersionDiff.changeNotes}"</span></p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                    Documento Atual ({template.version})
                  </span>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    <p>• Data Atual: <strong className="text-white">{template.updatedAt || template.createdAt}</strong></p>
                    <p>• Autor Atual: <strong className="text-white">{template.author}</strong></p>
                    <p>• Elementos Frente: <strong className="text-white">{template.frenteElements?.length || 0}</strong></p>
                    <p>• Elementos Verso: <strong className="text-white">{template.versoElements?.length || 0}</strong></p>
                    <p>• Status: <strong className="text-emerald-400">{template.isActive ? 'Ativo em Produção' : 'Rascunho'}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline of Previous Versions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Linha do Tempo de Versões Auditáveis ({history.length})
            </h3>

            {history.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Nenhuma versão anterior arquivada ainda. Todas as alterações são salvas com versionamento garantido.
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((ver, idx) => (
                  <div
                    key={`${ver.version}-${idx}`}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                          {ver.version}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {ver.changeNotes || 'Snapshot salvo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {ver.savedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {ver.savedBy || 'Administrador'}
                        </span>
                        <span>
                          Frente: {ver.frenteElements?.length || 0} • Verso: {ver.versoElements?.length || 0} elem.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedVersionDiff(ver)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Inspecionar documento anterior vs atual"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Auditar</span>
                      </button>
                      <button
                        onClick={() => onRestoreVersion(ver.version)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-sky-500 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                        title="Restaurar o conteúdo desta versão"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
