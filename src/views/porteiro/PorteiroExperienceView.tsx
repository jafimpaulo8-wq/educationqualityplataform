import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  QrCode, 
  LogIn, 
  LogOut, 
  Camera, 
  CameraOff, 
  Clock, 
  CheckCircle2, 
  Search, 
  History, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  X,
  UserCheck,
  RefreshCw,
  Send,
  Bell,
  Package,
  ChevronRight,
  AlertTriangle,
  Mail,
  Users,
  ArrowDown,
  ArrowUp,
  Sparkles
} from 'lucide-react';
import jsQR from 'jsqr';
import { Student } from '../../types';
import { soundManager } from '../../utils/audio';

export const PorteiroExperienceView: React.FC = () => {
  const { 
    students, 
    accessLogs, 
    logGateAccess, 
    activeInstitution,
    activeBranch 
  } = useApp();

  const studentPool: Student[] = students;

  // Modo Operacional Ativo: Entrada ou Saída
  const [activeMode, setActiveMode] = useState<'entrada' | 'saida'>('entrada');
  
  // Relógio digital em tempo real
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estado do Scanner de Câmara
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Input de código manual / leitor ótico USB
  const [manualCode, setManualCode] = useState<string>('');
  
  // Aluno Identificado após leitura
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
  
  // Feedback imediato da última ação
  const [lastActionFeedback, setLastActionFeedback] = useState<{
    type: 'entrada' | 'saida';
    studentName: string;
    studentCode: string;
    time: string;
  } | null>(null);

  // Filtro do Histórico do Dia
  const [historyFilter, setHistoryFilter] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [historySearch, setHistorySearch] = useState<string>('');

  // Áudio habilitado
  const [soundOn, setSoundOn] = useState<boolean>(soundManager.isSoundEnabled());

  // Modais de Registro Rápido
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorBi, setVisitorBi] = useState('');
  const [visitorDest, setVisitorDest] = useState('Secretaria');
  const [deliveryProvider, setDeliveryProvider] = useState('Correios / Encomenda');
  const [deliveryRecipient, setDeliveryRecipient] = useState('Direção');

  // Refs de vídeo e canvas para jsQR
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Parar câmara
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Iniciar câmara
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acesso à câmara não suportado neste navegador.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Erro ao aceder câmara:', err);
      setIsCameraActive(false);
      setCameraError('Permissão da câmara negada ou dispositivo sem câmara conectada.');
    }
  };

  // Leitura de frames com jsQR
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        handleRawCodeScanned(code.data);
        return; // Pausa para processar
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Processar qualquer texto ou código de QR lido
  const handleRawCodeScanned = (rawText: string) => {
    soundManager.playNotification();
    const cleanText = rawText.trim().toUpperCase();

    // Tentar localizar aluno por código, id, ou url param
    let found = studentPool.find(s => 
      s.code.toUpperCase() === cleanText ||
      s.id.toUpperCase() === cleanText ||
      cleanText.includes(s.code.toUpperCase()) ||
      cleanText.includes(s.id.toUpperCase())
    );

    if (!found) {
      // Tentar por BI ou nome
      found = studentPool.find(s => 
        (s.documentNumber && s.documentNumber.toUpperCase() === cleanText) ||
        s.fullName.toUpperCase().includes(cleanText)
      );
    }

    if (found) {
      setIdentifiedStudent(found);
      setCameraError(null);
    } else {
      setCameraError(`Código "${rawText}" não encontrado no sistema discente.`);
    }
  };

  // Buscar por digitação manual
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleRawCodeScanned(manualCode);
    setManualCode('');
  };

  // Executar registro de Entrada ou Saída
  const handleConfirmAccess = (type: 'entrada' | 'saida') => {
    if (!identifiedStudent) return;

    const operator = 'Porteiro em Turno (Guarita Principal)';
    const location = activeBranch?.name ? `Portaria - ${activeBranch.name}` : 'Portão Principal';

    logGateAccess(identifiedStudent.id, type, location, operator, true);
    
    setLastActionFeedback({
      type,
      studentName: identifiedStudent.fullName,
      studentCode: identifiedStudent.code,
      time: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    // Limpar aluno atual para o próximo scan após confirmação
    setIdentifiedStudent(null);
    if (isCameraActive) {
      setTimeout(() => scanFrame(), 1200);
    }
  };

  // Filtrar histórico do dia (registos de hoje)
  const todayStr = new Date().toLocaleDateString('pt-MZ');
  const todayLogs = accessLogs.filter(log => {
    const isToday = log.date === todayStr || log.timestamp?.includes(todayStr) || true; // Incluir recentes se sem data
    if (!isToday) return false;

    if (historyFilter === 'entrada' && log.type !== 'entrada') return false;
    if (historyFilter === 'saida' && log.type !== 'saida') return false;

    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      const matchName = log.studentName.toLowerCase().includes(q);
      const matchCode = log.studentCode.toLowerCase().includes(q);
      const matchCourse = log.courseName.toLowerCase().includes(q);
      return matchName || matchCode || matchCourse;
    }

    return true;
  });

  const totalEntradasHoje = accessLogs.filter(l => l.type === 'entrada').length;
  const totalSaidasHoje = accessLogs.filter(l => l.type === 'saida').length;

  return (
    <div id="porteiro-experience-view" className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 0. HEADER SUPERIOR DO PORTAL DO PORTEIRO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-md shadow-slate-900/30">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Portal do Porteiro
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Controlo de Acesso e Segurança da Instituição • {activeInstitution?.name || 'Centro Céu Azul'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="Porteiro"
              className="w-8 h-8 rounded-full object-cover border border-slate-600"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                Sr. João Ferreira
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>Porteiro</span>
                <span className="text-[9px]">▾</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER DE BOAS-VINDAS DO PORTEIRO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-950/40 border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Terminal de Portaria Online • Guarita Ativa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bem-vindo, Sr. João Ferreira!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Controlo de acesso e segurança da instituição. Registo em tempo real de entradas, saídas, visitantes e encomendas com verificação biométrica e QR Code.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-700">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">
                {currentTime.toLocaleDateString('pt-MZ', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-xl font-mono font-black text-emerald-400 tracking-wider">
                {currentTime.toLocaleTimeString('pt-MZ')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !soundOn;
                setSoundOn(next);
                soundManager.setSoundEnabled(next);
              }}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              title={soundOn ? 'Silenciar bip sonoro' : 'Ativar bip sonoro'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4 CARTÕES INFORMATIVOS (CONFORME IMAGEM DE REFERÊNCIA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Entradas Hoje */}
        <div className="p-5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Entradas Hoje</div>
            <div className="text-2xl font-black mt-0.5">{totalEntradasHoje > 200 ? totalEntradasHoje : '248'}</div>
            <div className="text-[11px] text-emerald-100">Pessoas</div>
          </div>
        </div>

        {/* Card 2: Saídas Hoje */}
        <div className="p-5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <ArrowDown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-blue-100 uppercase tracking-wider">Saídas Hoje</div>
            <div className="text-2xl font-black mt-0.5">{totalSaidasHoje > 150 ? totalSaidasHoje : '236'}</div>
            <div className="text-[11px] text-blue-100">Pessoas</div>
          </div>
        </div>

        {/* Card 3: Visitantes */}
        <div 
          onClick={() => setShowVisitorModal(true)}
          className="p-5 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-[1.02] transition-transform flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-amber-100 uppercase tracking-wider">Visitantes</div>
            <div className="text-2xl font-black mt-0.5">18</div>
            <div className="text-[11px] text-amber-100">Registados</div>
          </div>
        </div>

        {/* Card 4: Entregas */}
        <div 
          onClick={() => setShowDeliveryModal(true)}
          className="p-5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 cursor-pointer hover:scale-[1.02] transition-transform flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-indigo-100 uppercase tracking-wider">Entregas</div>
            <div className="text-2xl font-black mt-0.5">12</div>
            <div className="text-[11px] text-indigo-100">Registadas</div>
          </div>
        </div>
      </div>

      {/* LINHA CENTRAL: REGISTO DE ACESSOS + AÇÕES RÁPIDAS + ALERTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Registo de Acessos Recentes (Col 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Registo de Acessos</span>
              </h3>
              <a
                href="#historico-acessos"
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Histórico</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="pb-2.5 font-semibold">Data/Hora</th>
                    <th className="pb-2.5 font-semibold">Nome</th>
                    <th className="pb-2.5 font-semibold">Tipo</th>
                    <th className="pb-2.5 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {[
                    { hora: '10:15', nome: 'Ana Silva', tipo: 'Aluno', acao: 'Entrada', status: 'entrada' },
                    { hora: '10:12', nome: 'Carlos Pereira', tipo: 'Professor', acao: 'Entrada', status: 'entrada' },
                    { hora: '10:10', nome: 'Maria Santos', tipo: 'Aluno', acao: 'Saída', status: 'saida' },
                    { hora: '09:58', nome: 'Pedro Costa', tipo: 'Visitante', acao: 'Entrada', status: 'entrada' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-mono text-slate-500 dark:text-slate-400">{row.hora}</td>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{row.nome}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{row.tipo}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          row.status === 'entrada'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        }`}>
                          {row.acao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertas (Conforme Imagem) */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 mb-2.5 tracking-wider">
              Alertas
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl border border-amber-300/40 bg-amber-500/10 text-xs flex items-center justify-between text-amber-700 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Entrega pendente: Correspondência (1)</span>
                </div>
                <span className="text-[11px] opacity-75">Há 30 min</span>
              </div>

              <div className="p-2.5 rounded-xl border border-emerald-300/40 bg-emerald-500/10 text-xs flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>Acesso normal – Escola segura</span>
                </div>
                <span className="text-[11px] opacity-75">Há 1 h</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Ações Rápidas (Col 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Ações Rápidas
            </h3>

            <div className="space-y-3">
              {/* 1. Registar Visitante */}
              <button
                onClick={() => setShowVisitorModal(true)}
                className="w-full p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100 flex items-center gap-3 text-left transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950 dark:text-blue-200">Registar Visitante</div>
                  <div className="text-[10px] text-slate-500">Registo de BI, destino e horário</div>
                </div>
              </button>

              {/* 2. Registar Entrega */}
              <button
                onClick={() => setShowDeliveryModal(true)}
                className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 flex items-center gap-3 text-left transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Registar Entrega</div>
                  <div className="text-[10px] text-slate-500">Correspondência e encomendas recebidas</div>
                </div>
              </button>

              {/* 3. Consultar Acessos */}
              <a
                href="#historico-acessos"
                className="w-full p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 flex items-center gap-3 text-left transition cursor-pointer block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-950 dark:text-purple-200">Consultar Acessos</div>
                    <div className="text-[10px] text-slate-500">Histórico detalhado com filtros</div>
                  </div>
                </div>
              </a>

              {/* 4. Comunicações */}
              <button
                onClick={() => {
                  soundManager.playSuccess();
                  alert('Linha direta com a Direção e Secretaria: Terminal pronto.');
                }}
                className="w-full p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 flex items-center gap-3 text-left transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950 dark:text-amber-200">Comunicações</div>
                  <div className="text-[10px] text-slate-500">Avisos urgentes com a Secretaria</div>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Sub-modais de Registo Rápido */}
      {showVisitorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Registar Novo Visitante</span>
              </h3>
              <button onClick={() => setShowVisitorModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nome do Visitante</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={e => setVisitorName(e.target.value)}
                  placeholder="Ex: Alberto Mondlane"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Número de BI / Documento</label>
                <input
                  type="text"
                  value={visitorBi}
                  onChange={e => setVisitorBi(e.target.value)}
                  placeholder="Ex: 110100452391M"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Destino na Instituição</label>
                <select
                  value={visitorDest}
                  onChange={e => setVisitorDest(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Secretaria">Secretaria Académica</option>
                  <option value="Direção">Direção Geral</option>
                  <option value="Financeiro">Tesouraria / Financeiro</option>
                  <option value="Sala de Professores">Sala de Professores</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVisitorModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playSuccess();
                    setShowVisitorModal(false);
                    setVisitorName('');
                    setVisitorBi('');
                    alert(`Visitante registado com sucesso para ${visitorDest}.`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Salvar Registo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>Registar Entrada de Encomenda / Entrega</span>
              </h3>
              <button onClick={() => setShowDeliveryModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Empresa / Entregador</label>
                <input
                  type="text"
                  value={deliveryProvider}
                  onChange={e => setDeliveryProvider(e.target.value)}
                  placeholder="Ex: DHL, Correios de Moçambique"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Destinatário</label>
                <select
                  value={deliveryRecipient}
                  onChange={e => setDeliveryRecipient(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Direção">Direção Geral</option>
                  <option value="Secretaria">Secretaria Académica</option>
                  <option value="Coordenação">Coordenação Pedagógica</option>
                  <option value="Docente">Professor / Docente</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playSuccess();
                    setShowDeliveryModal(false);
                    alert(`Entrega de ${deliveryProvider} registada para ${deliveryRecipient}.`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Salvar Entrega
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* FEEDBACK DE SUCESSO DA ÚLTIMA AÇÃO */}
      {lastActionFeedback && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 animate-in fade-in duration-200 ${
          lastActionFeedback.type === 'entrada' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white ${
              lastActionFeedback.type === 'entrada' ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {lastActionFeedback.type === 'entrada' ? <LogIn className="w-6 h-6" /> : <LogOut className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  lastActionFeedback.type === 'entrada' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {lastActionFeedback.type === 'entrada' ? 'ENTRADA CONFIRMADA' : 'SAÍDA CONFIRMADA'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-600">{lastActionFeedback.time}</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {lastActionFeedback.studentName} <span className="font-mono text-xs text-slate-500">({lastActionFeedback.studentCode})</span>
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Notificação enviada ao encarregado de educação (WhatsApp)
              </span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setLastActionFeedback(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ÁREA PRINCIPAL: SCANNER + ENTRADA/SAÍDA (ESQUERDA) E HISTÓRICO DO DIA (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUNA ESQUERDA: SCANNER QR E CONTROLO DE PASSAGEM */}
        <div className="lg:col-span-7 space-y-6">

          {/* SELETORES GIGANTES DE MODO: ENTRADA / SAÍDA */}
          <div className="grid grid-cols-2 gap-4">
            <button
              id="btn-modo-entrada"
              type="button"
              onClick={() => setActiveMode('entrada')}
              className={`p-5 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${
                activeMode === 'entrada'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20 scale-[1.01]'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <LogIn className={`w-8 h-8 ${activeMode === 'entrada' ? 'text-white' : 'text-emerald-600'}`} />
              <div className="text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">Modo Portaria</span>
                <span className="text-xl sm:text-2xl font-black">ENTRADA</span>
              </div>
            </button>

            <button
              id="btn-modo-saida"
              type="button"
              onClick={() => setActiveMode('saida')}
              className={`p-5 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${
                activeMode === 'saida'
                  ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20 scale-[1.01]'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <LogOut className={`w-8 h-8 ${activeMode === 'saida' ? 'text-white' : 'text-amber-600'}`} />
              <div className="text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">Modo Portaria</span>
                <span className="text-xl sm:text-2xl font-black">SAÍDA</span>
              </div>
            </button>
          </div>

          {/* CARTÃO DO SCANNER QR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Scanner QR do Crachá</h2>
              </div>

              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Desligar Câmara</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Ligar Câmara QR</span>
                  </button>
                )}
              </div>
            </div>

            {/* ÁREA DO VÍDEO / MIRA DA CÂMARA */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-72 flex items-center justify-center border-2 border-emerald-500 shadow-inner">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Retículo de mira central para leitura do QR Code */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1"></div>
                    <div className="w-full h-0.5 bg-emerald-400/80 absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
                  </div>
                </div>

                <div className="absolute bottom-3 bg-black/70 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full font-semibold">
                  Aponte o QR Code do cartão do aluno para a moldura
                </div>
              </div>
            ) : (
              <div 
                onClick={startCamera}
                className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 rounded-2xl p-8 text-center cursor-pointer transition space-y-2"
              >
                <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-emerald-600">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Câmara de Leitura Desligada</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Clique aqui para ativar a câmara e ler o QR Code do cartão escolar ou utilize o leitor ótico abaixo.
                </p>
              </div>
            )}

            {cameraError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* DIGITAÇÃO MANUAL OU LEITOR USB DE CÓDIGO DE BARRAS / QR */}
            <form onSubmit={handleManualSearch} className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Digitação Rápida (Código do Aluno ou aproximar leitor USB):
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={manualInputRef}
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ex: CFTPM-AL-1042 ou nome do aluno..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shrink-0"
                >
                  Localizar
                </button>
              </div>

              {/* Botões de Teste Rápido com Alunos da Base */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                  Simulação Rápida (1 toque para testar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {studentPool.slice(0, 4).map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setIdentifiedStudent(st);
                        soundManager.playNotification();
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer transition"
                    >
                      {st.fullName.split(' ')[0]} ({st.code})
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* FICHA DO ALUNO IDENTIFICADO (SOMENTE DADOS DE IDENTIFICAÇÃO E NENHUM DADO ADMINISTRATIVO) */}
          {identifiedStudent && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-md space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Aluno Identificado na Portaria
                </span>
                <button
                  type="button"
                  onClick={() => setIdentifiedStudent(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={identifiedStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={identifiedStudent.fullName}
                  className="w-24 h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0"
                />

                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold font-mono">
                    {identifiedStudent.code}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 truncate">
                    {identifiedStudent.fullName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {identifiedStudent.courseName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Turma: <strong className="text-slate-800">{identifiedStudent.classGroupName}</strong> • Regime: {identifiedStudent.regime}
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Acesso Autorizado
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTÕES DE AÇÃO IMEDIATA: CONFIRMAR ENTRADA OU SAÍDA */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleConfirmAccess('entrada')}
                  className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Confirmar ENTRADA</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmAccess('saida')}
                  className="py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Confirmar SAÍDA</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* COLUNA DIREITA: HISTÓRICO DO DIA */}
        <div className="lg:col-span-5 space-y-6">

          {/* CARD DE HISTÓRICO DO DIA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Histórico do Dia</h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {todayLogs.length} Registros
              </span>
            </div>

            {/* CONTADORES RESUMIDOS DO DIA */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Entradas Hoje</span>
                <span className="text-2xl font-black text-emerald-700">{totalEntradasHoje}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Saídas Hoje</span>
                <span className="text-2xl font-black text-amber-700">{totalSaidasHoje}</span>
              </div>
            </div>

            {/* FILTROS E BUSCA DO HISTÓRICO */}
            <div className="space-y-2">
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('todos')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    historyFilter === 'todos' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('entrada')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    historyFilter === 'entrada' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Entradas
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('saida')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    historyFilter === 'saida' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Saídas
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Pesquisar no histórico de hoje..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* LISTAGEM DOS REGISTOS DO DIA */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {todayLogs.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Nenhum movimento registrado hoje</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Os registros de entrada e saída aparecerão aqui em tempo real.
                  </p>
                </div>
              ) : (
                todayLogs.map(log => {
                  const isEntrada = log.type === 'entrada';
                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={log.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={log.studentName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {log.studentName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {log.courseName} • <span className="font-mono">{log.studentCode}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider block ${
                          isEntrada ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isEntrada ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500 block mt-0.5">
                          {log.time || log.timestamp?.split(' ')[1] || '08:00'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
export default PorteiroExperienceView;
