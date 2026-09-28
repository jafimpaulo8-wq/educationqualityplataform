import React from 'react';
import { 
  Eye, 
  X, 
  Edit, 
  History, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface DetailField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

interface RecordDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  code?: string;
  statusBadge?: React.ReactNode;
  imageUrl?: string;
  fields: DetailField[];
  onEdit?: () => void;
  onViewHistory?: () => void;
  onDelete?: () => void;
  printTitle?: string;
}

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  code,
  statusBadge,
  imageUrl,
  fields,
  onEdit,
  onViewHistory,
  onDelete,
  printTitle
}) => {
  const { success } = useToast();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
    success('Impressão Solicitada', 'A janela de impressão do documento foi acionada.');
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#0d1527] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Eye className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {title}
                </h3>
                {code && (
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {code}
                  </span>
                )}
                {statusBadge}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
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

        {/* Fields Grid */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-1 ${
                  f.fullWidth ? 'sm:col-span-2' : ''
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  {f.label}
                </span>
                <div className="text-xs font-semibold text-white break-words">
                  {f.value || <span className="text-slate-500 font-normal">Não informado</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#090d16] hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Imprimir Ficha</span>
            </button>

            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#090d16] hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Histórico</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                Eliminar
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-900/30"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Registo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
