import React, { useState } from 'react';
import { ContractTemplate, ContractTemplateVersion } from '../../types';
import { History, RotateCcw, X, Eye, Shield, Calendar, User, FileText } from 'lucide-react';

interface TemplateVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ContractTemplate | null;
  onRestoreVersion: (templateId: string, version: string) => void;
}

export const TemplateVersionHistoryModal: React.FC<TemplateVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  template,
  onRestoreVersion
}) => {
  if (!isOpen || !template) return null;

  const [selectedVersion, setSelectedVersion] = useState<ContractTemplateVersion | null>(
    template.versionHistory?.[0] || null
  );

  const handleRestore = (versionStr: string) => {
    if (confirm(`Tem a certeza que deseja restaurar a versão ${versionStr}? A versão atual será guardada em backup e nenhuma versão anterior será excluída.`)) {
      onRestoreVersion(template.id, versionStr);
      onClose();
    }
  };

  const history = template.versionHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                <History className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono text-pink-400 font-bold uppercase">
                Repositório de Versões Imutáveis
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Histórico de Versões do Modelo: {template.name}
            </h3>
            <p className="text-xs text-slate-400">
              Versão atual ativa: <strong className="text-emerald-400 font-mono">{template.version}</strong> • Versões anteriores são preservadas permanentemente sem exclusão.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Layout Dividido: Lista de Versões à Esquerda e Visualizador à Direita */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 overflow-hidden min-h-[350px]">
          {/* Lista de Versões (4 Colunas) */}
          <div className="md:col-span-4 space-y-2 overflow-y-auto pr-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Edições Registadas ({history.length}):
            </span>

            {history.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                Nenhuma versão arquivada além da versão base.
              </div>
            ) : (
              history.map((ver, idx) => {
                const isSelected = selectedVersion?.version === ver.version;
                const isCurrentActive = template.version === ver.version;

                return (
                  <div
                    key={`${ver.version}-${idx}`}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-pink-500/15 border-pink-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-950 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700">
                        {ver.version}
                      </span>
                      {isCurrentActive && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Em Vigor
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-200 line-clamp-1">
                      {ver.title}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                      "{ver.changeNotes || 'Sem notas registradas'}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ver.savedAt}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[90px]">
                        <User className="w-3 h-3" />
                        {ver.savedBy || 'Gabinete'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Visualizador de Minuta da Versão Selecionada (8 Colunas) */}
          <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
            {selectedVersion ? (
              <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">
                      Minuta Registada na Versão {selectedVersion.version}
                    </span>
                    <h4 className="text-sm font-black text-white">
                      {selectedVersion.title}
                    </h4>
                  </div>
                  {template.version !== selectedVersion.version && (
                    <button
                      onClick={() => handleRestore(selectedVersion.version)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar Esta Versão</span>
                    </button>
                  )}
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Autor: <strong className="text-white">{selectedVersion.savedBy || 'Gabinete Jurídico'}</strong></span>
                    <span>Data: <strong className="text-white">{selectedVersion.savedAt}</strong></span>
                  </div>
                  <div className="text-slate-300">
                    Notas da Alteração: <em>{selectedVersion.changeNotes}</em>
                  </div>
                </div>

                {/* Conteúdo da Versão com Scroll */}
                <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <pre className="text-xs text-slate-200 font-serif whitespace-pre-wrap leading-relaxed">
                    {selectedVersion.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Selecione uma versão na lista ao lado para inspecionar.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
            <Shield className="w-4 h-4" />
            <span>Integridade Histórica Garantida • Nenhuma versão anterior é substituída ou eliminada.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
