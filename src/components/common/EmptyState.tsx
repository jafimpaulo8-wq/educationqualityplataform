import React from 'react';
import { SearchX, Plus, RefreshCw, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  resetLabel?: string;
  onReset?: () => void;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nenhum registo encontrado',
  description = 'Não foram encontrados registos para os critérios ou filtros selecionados.',
  icon,
  actionLabel,
  onAction,
  resetLabel,
  onReset,
  compact = false
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-800 bg-[#090d16]/70 ${
      compact ? 'p-6 sm:p-8' : 'p-10 sm:p-14'
    }`}>
      <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
        {icon || <FolderSearch className="w-7 h-7" />}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>

      {(onReset || onAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>{resetLabel || 'Limpar Filtros'}</span>
            </button>
          )}

          {onAction && actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
