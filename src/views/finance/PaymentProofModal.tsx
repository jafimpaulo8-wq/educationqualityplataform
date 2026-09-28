import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { PaymentRecord } from '../../types/finance';

interface PaymentProofModalProps {
  payment: PaymentRecord;
  onClose: () => void;
}

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({ payment, onClose }) => {
  const [scale, setScale] = useState(1);

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 text-white bg-slate-900/90">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Comprovativo Anexado: {payment.serviceItem.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Aluno: {payment.studentName} • Rede: {payment.network} • Tx: {payment.transactionCode}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg p-1 text-slate-300">
              <button
                onClick={zoomOut}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetZoom}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Redefinir Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={zoomIn}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {payment.proofUrl && (
              <a
                href={payment.proofUrl}
                target="_blank"
                rel="noreferrer"
                download={payment.proofFileName || `comprovativo-${payment.transactionCode}.png`}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Descarregar Comprovativo"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950/60 min-h-[350px]">
          {payment.proofUrl ? (
            <div 
              style={{ transform: `scale(${scale})`, transition: 'transform 0.15s ease-out' }}
              className="max-w-full origin-center flex items-center justify-center"
            >
              <img
                src={payment.proofUrl}
                alt="Comprovativo de Pagamento"
                className="max-h-[70vh] rounded-xl shadow-lg border border-slate-800 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800 max-w-md">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold text-sm">Comprovativo por Notificação SMS</p>
              <p className="text-xs text-slate-500 mt-1">
                O formando inseriu o código <span className="font-mono text-emerald-400 font-bold">{payment.transactionCode}</span> via rede {payment.network}.
              </p>
              <div className="mt-4 p-3 bg-slate-950 rounded-lg text-left text-xs font-mono text-slate-300 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Mensagem Declarada:</p>
                <p className="mt-1 text-emerald-300">
                  {payment.network}: Confirmado. {payment.amount.toFixed(2)} MT transferidos para {payment.network === 'M-Pesa' ? '84 123 4567' : '87 987 6543'}. Ref: {payment.transactionCode} às {payment.time} de {payment.date}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Arquivo: <strong className="text-slate-200">{payment.proofFileName || 'comprovativo_digital.png'}</strong></span>
          <span>Valor Declarado: <strong className="text-emerald-400 font-mono text-sm">{payment.amount.toLocaleString('pt-MZ')} MT</strong></span>
        </div>
      </div>
    </div>
  );
};
