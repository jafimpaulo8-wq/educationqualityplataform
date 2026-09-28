import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  X, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  QrCode, 
  Sparkles,
  SwitchCamera
} from 'lucide-react';
import jsQR from 'jsqr';

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedId: string) => void;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'simular'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Limpeza da câmera
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Iniciar câmera
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsInitializing(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acesso à câmara não é suportado pelo seu navegador.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsInitializing(false);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Erro ao acessar câmara:', err);
      setIsInitializing(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Permissão da câmara foi recusada. Autorize a câmara no navegador ou utilize o envio de foto/imagem.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Nenhuma câmara detetada neste dispositivo. Por favor, envie uma foto com o QR Code.');
      } else {
        setCameraError(err.message || 'Não foi possível aceder à câmara.');
      }
    }
  };

  // Loop contínuo de leitura de frames com jsQR
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        handleExtractAndDeliver(code.data);
        return; // interrompe o loop após detetar
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Tratar extração de URL ou código do QR
  const handleExtractAndDeliver = (rawCode: string) => {
    let cleanCode = rawCode.trim();

    // Se for URL completa (ex: https://dominio.com/verify/SIVEC-MZ-2026-8819 ou ?verify=...)
    if (cleanCode.includes('/verify/')) {
      const parts = cleanCode.split('/verify/');
      cleanCode = parts[parts.length - 1].split('?')[0].split('#')[0];
    } else if (cleanCode.includes('verify=')) {
      const match = cleanCode.match(/verify=([^&]+)/);
      if (match && match[1]) {
        cleanCode = decodeURIComponent(match[1]);
      }
    }

    stopCamera();
    onScanSuccess(cleanCode);
  };

  // Processamento de imagem enviada pelo utilizador
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFeedback('A processar imagem do certificado...');
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            setUploadFeedback('QR Code reconhecido com sucesso!');
            setTimeout(() => {
              handleExtractAndDeliver(code.data);
            }, 300);
          } else {
            setUploadFeedback('Nenhum QR Code válido do SIVEC foi encontrado nesta imagem. Tente uma imagem mais nítida ou selecione um código de teste.');
          }
        }
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  // Alternar entre câmara frontal e traseira
  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-6">
        
        {/* TOPO DO MODAL */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <QrCode className="w-5 h-5" />
            <h3 className="text-base font-black text-white">Escanear QR Code do Certificado</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SELETOR DE MÉTODOS DE LEITURA */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'camera' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Câmara ao Vivo</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Foto / Arquivo</span>
          </button>
          <button
            onClick={() => setActiveTab('simular')}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'simular' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simular Teste</span>
          </button>
        </div>

        {/* CORPO: CÂMARA */}
        {activeTab === 'camera' && (
          <div className="space-y-3">
            <div className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/50 flex items-center justify-center shadow-inner">
              
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              
              <canvas ref={canvasRef} className="hidden" />

              {/* Mira visual de escaneamento */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative animate-pulse shadow-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-sm" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-sm" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-sm" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-sm" />
                </div>
              </div>

              {isInitializing && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-xs text-slate-300">
                  <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                  <span>A ligar câmara do dispositivo...</span>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col items-center justify-center gap-2 text-center text-xs">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                  <span className="text-rose-300 font-medium">{cameraError}</span>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Usar Envio de Foto / Imagem
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
              <span>Aponte para o QR Code impresso no verso ou rodapé do certificado.</span>
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Trocar câmara"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
                <span>Trocar</span>
              </button>
            </div>
          </div>
        )}

        {/* CORPO: UPLOAD DE FOTO */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/80 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition text-center">
              <Upload className="w-10 h-10 text-emerald-400" />
              <strong className="text-white text-xs">Clique para selecionar foto ou arraste o arquivo</strong>
              <span className="text-[11px] text-slate-500">Formatos aceites: JPG, PNG, WEBP ou PDF com imagem</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {uploadFeedback && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-center font-medium text-emerald-300">
                {uploadFeedback}
              </div>
            )}
          </div>
        )}

        {/* CORPO: SIMULAÇÃO COM DADOS REAIS DE TESTE */}
        {activeTab === 'simular' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-400 text-[11px]">
              Selecione uma das credenciais emitidas para simular o resultado imediato do escaneamento do QR Code:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleExtractAndDeliver('SIVEC-MZ-2026-8819')}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-left flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <strong className="text-white">BENEDITO AUGUSTO COSSA</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Engenharia de Software (1200h) • SIVEC-MZ-2026-8819</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 font-mono">
                  ATIVO
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExtractAndDeliver('SIVEC-MZ-2026-3391')}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-rose-500/40 text-left flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <strong className="text-white">MANUEL FERNANDO MACUÁCUA</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Eletricidade Industrial • SIVEC-MZ-2026-3391</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 font-mono">
                  REVOGADO
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExtractAndDeliver('SIVEC-MZ-2026-5542')}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-left flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <strong className="text-white">ISABEL JOÃO NHANTUMBO</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Contabilidade &amp; Fiscalidade • SIVEC-MZ-2026-5542</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 font-mono">
                  CORRIGIDO
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExtractAndDeliver('SIVEC-MZ-2026-2210')}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-white">RUI MIGUEL CHISSANO</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Redes &amp; Cibersegurança • SIVEC-MZ-2026-2210</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 font-mono">
                  EXPIRADO
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExtractAndDeliver('SIVEC-MZ-2026-1109')}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-purple-500/40 text-left flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
                    <strong className="text-white">SORAIA BENTO TEMBE</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Operações Portuárias • SIVEC-MZ-2026-1109</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 font-mono">
                  CANCELADO
                </span>
              </button>
            </div>
          </div>
        )}

        {/* RODAPÉ */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
