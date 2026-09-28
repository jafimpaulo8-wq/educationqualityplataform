import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  requiredConfirmationWord?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Sim, Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  requiredConfirmationWord,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [typedWord, setTypedWord] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requiredConfirmationWord && typedWord.trim().toUpperCase() !== requiredConfirmationWord.toUpperCase()) {
      return;
    }
    setInternalLoading(true);
    try {
      await onConfirm();
    } finally {
      setInternalLoading(false);
      setTypedWord('');
    }
  };

  const handleClose = () => {
    if (isLoading || internalLoading) return;
    setTypedWord('');
    onCancel();
  };

  const isButtonDisabled = 
    isLoading || 
    internalLoading || 
    (Boolean(requiredConfirmationWord) && typedWord.trim().toUpperCase() !== requiredConfirmationWord?.toUpperCase());

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#0d1527] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon + Close */}
        <div className="flex items-start justify-between gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isDanger 
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
              : isWarning 
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
          }`}>
            {isDanger ? (
              <Trash2 className="w-6 h-6" />
            ) : isWarning ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>

          <button
            onClick={handleClose}
            disabled={isLoading || internalLoading}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-black text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Optional Typed Confirmation */}
        {requiredConfirmationWord && (
          <div className="p-3 bg-[#090d16] border border-slate-800 rounded-2xl space-y-2">
            <span className="text-[11px] text-slate-400 block">
              Para confirmar, digite exatamente <strong className="text-rose-400 font-mono font-bold">{requiredConfirmationWord}</strong> abaixo:
            </span>
            <input
              type="text"
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              placeholder={`Digite "${requiredConfirmationWord}"`}
              className="w-full px-3 py-2 bg-[#0b1120] border border-slate-700 rounded-xl text-xs text-white font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading || internalLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold border border-slate-700 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isButtonDisabled}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
            }`}
          >
            {(isLoading || internalLoading) ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
