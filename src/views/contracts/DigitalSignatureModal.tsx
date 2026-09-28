import React, { useRef, useState, useEffect } from 'react';
import { PenTool, CheckCircle2, RotateCcw, X, ShieldCheck } from 'lucide-react';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractTitle: string;
  contractRef: string;
  signerParty: 'student' | 'director';
  defaultSignerName: string;
  defaultDocumentNumber?: string;
  onConfirmSignature: (details: {
    signerName: string;
    signatureDataUrl?: string;
    documentNumber?: string;
  }) => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  contractTitle,
  contractRef,
  signerParty,
  defaultSignerName,
  defaultDocumentNumber,
  onConfirmSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [docNumber, setDocNumber] = useState(defaultDocumentNumber || '');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');

  useEffect(() => {
    if (isOpen) {
      setSignerName(defaultSignerName);
      setDocNumber(defaultDocumentNumber || '');
      setHasDrawn(false);
      setTimeout(() => {
        initCanvas();
      }, 100);
    }
  }, [isOpen, defaultSignerName, defaultDocumentNumber]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#38bdf8'; // sky-400
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height)
      };
    } else {
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    initCanvas();
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    let signatureDataUrl: string | undefined = undefined;
    if (signatureMode === 'draw' && hasDrawn && canvasRef.current) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    onConfirmSignature({
      signerName,
      signatureDataUrl,
      documentNumber: docNumber
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 text-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                <PenTool className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono text-pink-400 font-bold uppercase">
                Assinatura Digital Autenticada
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Assinar como {signerParty === 'student' ? 'Formando (Segundo Outorgante)' : 'Diretor Geral (Homologação)'}
            </h3>
            <p className="text-xs text-slate-400">
              {contractTitle} • Ref: <span className="font-mono text-slate-200">{contractRef}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Nome do Signatário</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {signerParty === 'student' ? 'Nº de BI / Passaporte' : 'Cargo / Credencial'}
            </label>
            <input
              type="text"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder={signerParty === 'student' ? 'Ex: 110100482914B' : 'Direção Geral SIVEC'}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
            />
          </div>
        </div>

        {/* Alternador de Modo */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setSignatureMode('draw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              signatureMode === 'draw'
                ? 'bg-pink-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            Desenhar Rubrica com o Dedo / Mouse
          </button>
          <button
            onClick={() => setSignatureMode('type')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              signatureMode === 'type'
                ? 'bg-pink-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            Assinatura Tipográfica Formal
          </button>
        </div>

        {/* Canvas ou Tipografia */}
        {signatureMode === 'draw' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Desenhe a sua assinatura abaixo no quadro:</span>
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 cursor-pointer font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar Traço</span>
              </button>
            </div>
            <div className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-950 relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                className="w-full h-40 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="absolute bottom-2 left-4 text-[10px] text-slate-500 font-mono pointer-events-none">
                Área de Captura Biométrica • Assine sobre a linha
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <span className="text-[11px] text-slate-400">Prévia da chancela oficial a ser impressa:</span>
            <div className="font-serif italic text-2xl text-pink-300 border-b border-dashed border-slate-700 pb-2">
              {signerName || 'Assinatura Registrada'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Certificação criptográfica com data e hora UTC+2 Moçambique
            </div>
          </div>
        )}

        {/* Carimbo da Direção Aviso */}
        {signerParty === 'director' && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 shrink-0 text-blue-400" />
            <span>
              A homologação pela Direção incluirá automaticamente o <strong>Carimbo Oficial SIVEC</strong> e o selo de autenticidade jurídica.
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar e Gravar Assinatura</span>
          </button>
        </div>
      </div>
    </div>
  );
};
