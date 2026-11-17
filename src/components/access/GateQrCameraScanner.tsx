import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  Upload,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Scan
} from 'lucide-react';
import jsQR from 'jsqr';

interface GateQrCameraScannerProps {
  onCodeDetected: (rawCode: string) => void;
  theme?: 'light' | 'dark';
  autoStart?: boolean;
  pauseDetection?: boolean;
}

export const GateQrCameraScanner: React.FC<GateQrCameraScannerProps> = ({
  onCodeDetected,
  theme = 'light',
  autoStart = false,
  pauseDetection = false
}) => {
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'active'>('idle');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastDetectedPreview, setLastDetectedPreview] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanRef = useRef<{ value: string; at: number }>({ value: '', at: 0 });
  const onCodeDetectedRef = useRef(onCodeDetected);
  const pauseDetectionRef = useRef(pauseDetection);

  useEffect(() => {
    onCodeDetectedRef.current = onCodeDetected;
  }, [onCodeDetected]);

  useEffect(() => {
    pauseDetectionRef.current = pauseDetection;
  }, [pauseDetection]);

  const stopCamera = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setMediaStream(null);
    setCameraState('idle');
  };

  const startCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    setCameraState('starting');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acesso à câmara não é suportado neste navegador.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch {
        // Fallback para qualquer câmara disponível (desktop/laptop)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      setMediaStream(stream);
      setCameraState('active');
    } catch (err: any) {
      console.warn('Erro ao iniciar câmara da portaria:', err);
      setCameraState('idle');
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError(
          'Permissão da câmara recusada pelo navegador. Autorize a câmara ou envie uma imagem com o QR Code.'
        );
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setCameraError(
          'Nenhuma câmara encontrada neste dispositivo. Use o envio de imagem com QR Code ou o código manual abaixo.'
        );
      } else {
        setCameraError(err?.message || 'Não foi possível ligar a câmara.');
      }
    }
  };

  // Liga o MediaStream ao elemento <video> depois de montado no DOM e inicia o loop jsQR
  useEffect(() => {
    if (!mediaStream || cameraState !== 'active') return;

    let cancelled = false;
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = mediaStream;
    video.setAttribute('playsinline', 'true');
    video.muted = true;

    const scanLoop = () => {
      if (cancelled) return;
      const vid = videoRef.current;
      const canvas = canvasRef.current;

      if (vid && canvas && vid.readyState >= vid.HAVE_CURRENT_DATA && vid.videoWidth > 0) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = vid.videoWidth;
          canvas.height = vid.videoHeight;
          ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);

          if (!pauseDetectionRef.current) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            });

            if (decoded && decoded.data) {
              const now = Date.now();
              const isDuplicateBurst =
                lastScanRef.current.value === decoded.data && now - lastScanRef.current.at < 2000;

              if (!isDuplicateBurst) {
                lastScanRef.current = { value: decoded.data, at: now };
                setLastDetectedPreview(decoded.data);
                onCodeDetectedRef.current(decoded.data);
                setTimeout(() => {
                  setLastDetectedPreview(prev => (prev === decoded.data ? null : prev));
                }, 2000);
              }
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(scanLoop);
    };

    video
      .play()
      .then(() => {
        if (!cancelled) {
          rafRef.current = requestAnimationFrame(scanLoop);
        }
      })
      .catch(err => {
        console.warn('Video play warning:', err);
        if (!cancelled) {
          rafRef.current = requestAnimationFrame(scanLoop);
        }
      });

    return () => {
      cancelled = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [mediaStream, cameraState]);

  useEffect(() => {
    if (autoStart) {
      startCamera(facingMode);
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleFacing = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    if (cameraState === 'active' || cameraState === 'starting') {
      startCamera(next);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setCameraError(null);
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });
        if (decoded && decoded.data) {
          setLastDetectedPreview(decoded.data);
          onCodeDetectedRef.current(decoded.data);
          setTimeout(() => setLastDetectedPreview(null), 2000);
        } else {
          setCameraError('Nenhum QR Code válido foi encontrado nesta imagem.');
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-3">
      {/* Barra de controlo da câmara */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {cameraState === 'active' || cameraState === 'starting' ? (
            <button
              type="button"
              onClick={stopCamera}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Desligar Câmara</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Abrir Câmara QR</span>
            </button>
          )}

          {(cameraState === 'active' || cameraState === 'starting') && (
            <button
              type="button"
              onClick={handleToggleFacing}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Alternar entre câmara traseira e frontal"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span>{facingMode === 'environment' ? 'Traseira' : 'Frontal'}</span>
            </button>
          )}
        </div>

        <label
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ler Foto QR</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {/* Área do vídeo (sempre montada durante starting/active para garantir videoRef disponível) */}
      {cameraState !== 'idle' ? (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-80 flex items-center justify-center border-2 border-emerald-500 shadow-inner">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Mira ótica */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-md" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-md" />
              {!pauseDetection && (
                <div className="w-full h-0.5 bg-emerald-400/90 absolute top-1/2 -translate-y-1/2 animate-pulse" />
              )}
            </div>
          </div>

          {cameraState === 'starting' && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-xs text-slate-200">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
              <span>A inicializar câmara para leitura de QR Code...</span>
            </div>
          )}

          {lastDetectedPreview ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>QR Detetado: {lastDetectedPreview}</span>
            </div>
          ) : (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-xs text-white text-[11px] px-3.5 py-1 rounded-full font-semibold flex items-center gap-1.5 whitespace-nowrap">
              <Scan className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {pauseDetection
                  ? 'Aluno carregado — confirme ou limpe para nova leitura'
                  : 'Aponte o QR Code do cartão do aluno para a mira'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => startCamera(facingMode)}
          className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition space-y-2 ${
            isDark
              ? 'bg-slate-950/60 border-slate-700 hover:border-emerald-500'
              : 'bg-slate-50 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto text-emerald-600 ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <Camera className="w-6 h-6" />
          </div>
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Clique aqui para abrir a Câmara e ler o QR Code
          </h3>
          <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            A câmara identifica automaticamente o QR Code da carteirinha do aluno em tempo real, verifica a mensalidade do mês atual e libera Entrada/Saída.
          </p>
        </div>
      )}

      {cameraError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{cameraError}</span>
        </div>
      )}
    </div>
  );
};
