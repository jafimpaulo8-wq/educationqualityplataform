import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  QrCode,
  LogIn,
  LogOut,
  Clock,
  CheckCircle2,
  Search,
  History,
  Volume2,
  VolumeX,
  AlertCircle,
  X,
  UserCheck,
  Bell,
  Package,
  ChevronRight,
  AlertTriangle,
  Mail,
  Users,
  ArrowDown,
  MessageCircle,
  ShieldAlert,
  Ban,
  ExternalLink
} from 'lucide-react';
import { Student } from '../../types';
import { soundManager } from '../../utils/audio';
import { InstitutionLogoBadge } from '../../components/common/InstitutionLogoBadge';
import { resolveInstitutionIdentity } from '../../utils/institutionIdentity';
import { GateQrCameraScanner } from '../../components/access/GateQrCameraScanner';
import {
  buildGateWhatsAppMessage,
  buildWhatsAppUrl,
  checkStudentMonthlyPaymentStatus,
  getStudentGuardianContact,
  parseStudentQrPayload
} from '../../utils/gateAccessUtils';

interface QuickGateEntry {
  id: string;
  time: string;
  name: string;
  detail: string;
}

export const PorteiroExperienceView: React.FC = () => {
  const {
    students,
    courses,
    paymentRecords,
    contasReceber,
    accessLogs,
    logGateAccess,
    activeInstitution,
    activeBranch,
    firebaseUser,
    addNotification
  } = useApp();

  const identity = resolveInstitutionIdentity(activeInstitution);
  const centerName = identity.officialName || activeInstitution.name || 'Centro de Formação';
  const studentPool: Student[] = identity.hasInstitution
    ? students.filter(s => s.institutionId === activeInstitution.id)
    : [];

  // Modo Operacional Ativo: Entrada ou Saída
  const [activeMode, setActiveMode] = useState<'entrada' | 'saida'>('entrada');

  // Relógio digital em tempo real
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mensagem de erro/aviso da leitura
  const [scanError, setScanError] = useState<string | null>(null);

  // Input de código manual / leitor ótico USB
  const [manualCode, setManualCode] = useState<string>('');

  // Aluno Identificado após leitura
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);

  // Feedback imediato após confirmação de Entrada, Saída ou Registo de Barramento
  const [lastActionFeedback, setLastActionFeedback] = useState<{
    type: 'entrada' | 'saida' | 'barrado';
    studentName: string;
    studentCode: string;
    institutionName: string;
    time: string;
    guardianName: string;
    guardianPhone: string;
    whatsappMessage: string;
    whatsappUrl: string | null;
    reason?: string;
  } | null>(null);

  // Filtro do Histórico do Dia
  const [historyFilter, setHistoryFilter] = useState<'todos' | 'entrada' | 'saida' | 'barrado'>('todos');
  const [historySearch, setHistorySearch] = useState<string>('');

  // Áudio habilitado
  const [soundOn, setSoundOn] = useState<boolean>(soundManager.isSoundEnabled());

  // Registos locais de Visitantes & Entregas (sem dados fictícios fixos)
  const [visitorsLog, setVisitorsLog] = useState<QuickGateEntry[]>([]);
  const [deliveriesLog, setDeliveriesLog] = useState<QuickGateEntry[]>([]);

  // Modais de Registro Rápido
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorBi, setVisitorBi] = useState('');
  const [visitorDest, setVisitorDest] = useState('Secretaria');
  const [deliveryProvider, setDeliveryProvider] = useState('Correios / Encomenda');
  const [deliveryRecipient, setDeliveryRecipient] = useState('Direção');

  // Limpar estado ao trocar de instituição (isolamento multi-instituição)
  useEffect(() => {
    setIdentifiedStudent(null);
    setLastActionFeedback(null);
    setScanError(null);
    setManualCode('');
    setVisitorsLog([]);
    setDeliveriesLog([]);
  }, [activeInstitution.id]);

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Processar código lido pela câmara ou digitado manualmente
  const handleRawCodeScanned = (rawText: string, allowNameFallback = false) => {
    const result = parseStudentQrPayload(rawText, students, activeInstitution.id, {
      allowNameFallback
    });

    if (result.student) {
      soundManager.playNotification();
      setIdentifiedStudent(result.student);
      setScanError(null);
      setLastActionFeedback(null);
    } else {
      soundManager.playError();
      setScanError(result.errorReason || `Código "${rawText}" não encontrado nesta instituição.`);
    }
  };

  // Buscar por digitação manual
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleRawCodeScanned(manualCode, true);
    setManualCode('');
  };

  // Verificação da mensalidade do mês corrente para o aluno identificado
  const paymentVerification = identifiedStudent
    ? checkStudentMonthlyPaymentStatus({
        student: identifiedStudent,
        activeInstitution,
        courses,
        paymentRecords,
        contasReceber
      })
    : null;

  // Dados e links WhatsApp do aluno identificado quando barrado na porta
  const identifiedGuardian = identifiedStudent ? getStudentGuardianContact(identifiedStudent) : null;
  const hourNowStr = currentTime.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
  const barredPreviewMessage =
    identifiedStudent && paymentVerification && !paymentVerification.isPaidForCurrentMonth
      ? buildGateWhatsAppMessage({
          action: 'barrado',
          student: identifiedStudent,
          institution: activeInstitution,
          timeStr: hourNowStr,
          monthLabel: paymentVerification.currentMonthLabel
        })
      : '';
  const barredWhatsAppUrl =
    identifiedGuardian && barredPreviewMessage
      ? buildWhatsAppUrl(identifiedGuardian.guardianPhone, barredPreviewMessage)
      : null;

  // Executar registro de Entrada, Saída ou Barramento
  const handleConfirmAccess = (type: 'entrada' | 'saida' | 'barrado') => {
    if (!identifiedStudent || !paymentVerification) return;

    // Bloqueio rígido de entrada se mensalidade do mês atual não estiver paga
    if (type === 'entrada' && !paymentVerification.isPaidForCurrentMonth) {
      soundManager.playError();
      setScanError(`Acesso não permitido: ${paymentVerification.reason}`);
      return;
    }

    const now = new Date();
    const hourOnly = now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    const operator = firebaseUser?.displayName || 'Porteiro em Turno (Guarita Principal)';
    const location = activeBranch?.name ? `Portaria - ${activeBranch.name}` : 'Portão Principal';
    const guardian = getStudentGuardianContact(identifiedStudent);

    const whatsappMessage = buildGateWhatsAppMessage({
      action: type,
      student: identifiedStudent,
      institution: activeInstitution,
      timeStr: hourOnly,
      monthLabel: paymentVerification.currentMonthLabel
    });

    const whatsappUrl = buildWhatsAppUrl(guardian.guardianPhone, whatsappMessage);

    logGateAccess(
      identifiedStudent.id,
      type,
      location,
      operator,
      true,
      whatsappMessage,
      type === 'barrado' ? paymentVerification.reason : undefined
    );

    setLastActionFeedback({
      type,
      studentName: identifiedStudent.fullName,
      studentCode: identifiedStudent.code,
      institutionName: centerName,
      time: hourOnly,
      guardianName: guardian.guardianName,
      guardianPhone: guardian.guardianPhone,
      whatsappMessage,
      whatsappUrl,
      reason: type === 'barrado' ? paymentVerification.reason : undefined
    });

    // Limpar aluno identificado para a próxima leitura após confirmação
    setIdentifiedStudent(null);
    setScanError(null);
  };

  // Filtrar histórico do dia (apenas dados reais da instituição ativa)
  const instAccessLogs = identity.hasInstitution
    ? accessLogs.filter(log => log.institutionId === activeInstitution.id)
    : [];

  const todayStr = new Date().toLocaleDateString('pt-MZ');
  const todayLogs = instAccessLogs.filter(log => {
    if (historyFilter !== 'todos' && log.type !== historyFilter) return false;

    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      const matchName = log.studentName.toLowerCase().includes(q);
      const matchCode = log.studentCode.toLowerCase().includes(q);
      const matchCourse = (log.courseName || '').toLowerCase().includes(q);
      return matchName || matchCode || matchCourse;
    }

    return true;
  });

  const logsForTodayCount = instAccessLogs.filter(
    l => !l.date || l.date === todayStr || l.timestamp?.includes(todayStr)
  );
  const totalEntradasHoje = logsForTodayCount.filter(l => l.type === 'entrada').length;
  const totalSaidasHoje = logsForTodayCount.filter(l => l.type === 'saida').length;
  const totalBarradosHoje = logsForTodayCount.filter(l => l.type === 'barrado').length;

  const operatorDisplayName = firebaseUser?.displayName || 'Portaria em Turno';

  return (
    <div id="porteiro-experience-view" className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* 0. HEADER SUPERIOR DO PORTAL DO PORTEIRO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <InstitutionLogoBadge institution={activeInstitution} size="md" rounded="2xl" />
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Portal do Porteiro
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Controlo de Acesso e Mensalidade • {centerName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Bell className="w-4 h-4" />
            {totalBarradosHoje > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalBarradosHoje}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                {operatorDisplayName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Porteiro • {activeBranch?.name || 'Sede'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER DO PORTEIRO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-950/40 border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Terminal de Portaria Online • {centerName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Controlo de Entradas &amp; Saídas por QR Code
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Abra a câmara para ler automaticamente o QR Code do aluno, valide a mensalidade do mês corrente e envie notificação WhatsApp ao encarregado após confirmar Entrada, Saída ou Barramento.
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

      {/* 4 CARTÕES INFORMATIVOS COM CONTADORES REAIS DA INSTITUIÇÃO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Entradas Hoje</div>
            <div className="text-2xl font-black mt-0.5">{totalEntradasHoje}</div>
            <div className="text-[11px] text-emerald-100">Confirmadas</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <ArrowDown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-blue-100 uppercase tracking-wider">Saídas Hoje</div>
            <div className="text-2xl font-black mt-0.5">{totalSaidasHoje}</div>
            <div className="text-[11px] text-blue-100">Registadas</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-rose-100 uppercase tracking-wider">Barrados Hoje</div>
            <div className="text-2xl font-black mt-0.5">{totalBarradosHoje}</div>
            <div className="text-[11px] text-rose-100">Mensalidade em falta</div>
          </div>
        </div>

        <div
          onClick={() => setShowVisitorModal(true)}
          className="p-5 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-[1.02] transition-transform flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-amber-100 uppercase tracking-wider">Visitantes &amp; Entregas</div>
            <div className="text-2xl font-black mt-0.5">{visitorsLog.length + deliveriesLog.length}</div>
            <div className="text-[11px] text-amber-100">Registar na guarita</div>
          </div>
        </div>
      </div>

      {/* FEEDBACK APÓS CONFIRMAÇÃO COM BOTÃO DIRETO DO WHATSAPP AO ENCARREGADO */}
      {lastActionFeedback && (
        <div
          className={`p-5 rounded-2xl border-2 space-y-3 animate-in fade-in duration-200 ${
            lastActionFeedback.type === 'entrada'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
              : lastActionFeedback.type === 'saida'
              ? 'bg-amber-50 border-amber-400 text-amber-950'
              : 'bg-rose-50 border-rose-400 text-rose-950'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl text-white shrink-0 ${
                  lastActionFeedback.type === 'entrada'
                    ? 'bg-emerald-600'
                    : lastActionFeedback.type === 'saida'
                    ? 'bg-amber-600'
                    : 'bg-rose-600'
                }`}
              >
                {lastActionFeedback.type === 'entrada' ? (
                  <LogIn className="w-6 h-6" />
                ) : lastActionFeedback.type === 'saida' ? (
                  <LogOut className="w-6 h-6" />
                ) : (
                  <Ban className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded ${
                      lastActionFeedback.type === 'entrada'
                        ? 'bg-emerald-600 text-white'
                        : lastActionFeedback.type === 'saida'
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {lastActionFeedback.type === 'entrada'
                      ? 'ENTRADA CONFIRMADA'
                      : lastActionFeedback.type === 'saida'
                      ? 'SAÍDA CONFIRMADA'
                      : 'ALUNO BARRADO NA PORTA'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Hora: {lastActionFeedback.time}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    • {lastActionFeedback.institutionName}
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {lastActionFeedback.studentName}{' '}
                  <span className="font-mono text-xs text-slate-500">({lastActionFeedback.studentCode})</span>
                </p>
                <p className="text-xs text-slate-700 mt-1 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 italic">
                  "{lastActionFeedback.whatsappMessage}"
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLastActionFeedback(null)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* BOTÃO WHATSAPP PÓS-CONFIRMAÇÃO APONTANDO PARA O ENCARREGADO DO CENTRO */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/70">
            <div className="text-xs text-slate-700">
              Encarregado: <strong>{lastActionFeedback.guardianName}</strong>{' '}
              {lastActionFeedback.guardianPhone ? (
                <span className="font-mono font-semibold text-slate-900">
                  ({lastActionFeedback.guardianPhone})
                </span>
              ) : (
                <span className="text-rose-600 font-semibold">(Sem telefone cadastrado)</span>
              )}
            </div>

            {lastActionFeedback.whatsappUrl ? (
              <a
                href={lastActionFeedback.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1fb858] text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  Enviar WhatsApp ao Encarregado ({lastActionFeedback.guardianPhone})
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1.5 rounded-xl">
                Número WhatsApp do encarregado não disponível no cadastro do aluno.
              </span>
            )}
          </div>
        </div>
      )}

      {/* ÁREA PRINCIPAL: SCANNER + FICHA DO ALUNO (ESQUERDA) E HISTÓRICO DO DIA (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: SCANNER QR E CONTROLO DE PASSAGEM */}
        <div className="lg:col-span-7 space-y-6">
          {/* SELETORES DE MODO: ENTRADA / SAÍDA */}
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

          {/* CARTÃO DO SCANNER QR COM CÂMARA REAL */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Scanner QR do Crachá (Câmara ao Vivo)</h2>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {studentPool.length} alunos ativos
              </span>
            </div>

            <GateQrCameraScanner
              onCodeDetected={code => handleRawCodeScanned(code, false)}
              pauseDetection={Boolean(identifiedStudent)}
              theme="light"
            />

            {scanError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{scanError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScanError(null)}
                  className="text-rose-500 hover:text-rose-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* DIGITAÇÃO MANUAL OU LEITOR USB */}
            <form onSubmit={handleManualSearch} className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Digitação Rápida (Código do Aluno, BI ou leitor USB):
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder={`Ex: ${identity.code || 'SIGAR'}-AL-001 ou nome do aluno...`}
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

              {/* Atalhos rápidos com alunos reais da instituição */}
              {studentPool.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                    Teste Rápido de Alunos da Instituição:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {studentPool.slice(0, 5).map(st => {
                      const check = checkStudentMonthlyPaymentStatus({
                        student: st,
                        activeInstitution,
                        courses,
                        paymentRecords,
                        contasReceber
                      });
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setIdentifiedStudent(st);
                            setLastActionFeedback(null);
                            setScanError(null);
                            soundManager.playNotification();
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition border flex items-center gap-1.5 ${
                            check.isPaidForCurrentMonth
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200'
                          }`}
                        >
                          <span>{st.fullName.split(' ')[0]} ({st.code})</span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                              check.isPaidForCurrentMonth
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {check.isPaidForCurrentMonth ? 'Pago' : 'Não Pago'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* FICHA DO ALUNO IDENTIFICADO + VALIDAÇÃO DE MENSALIDADE DO MÊS CORRENTE */}
          {identifiedStudent && paymentVerification && (
            <div
              className={`bg-white rounded-2xl border-2 p-6 shadow-md space-y-5 animate-in slide-in-from-top-2 duration-200 ${
                paymentVerification.isPaidForCurrentMonth ? 'border-emerald-500' : 'border-rose-500'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    paymentVerification.isPaidForCurrentMonth ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {paymentVerification.isPaidForCurrentMonth ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  )}
                  {paymentVerification.isPaidForCurrentMonth
                    ? 'Aluno Identificado • Acesso Permitido'
                    : 'ACESSO NÃO PERMITIDO — MENSALIDADE POR PAGAR'}
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
                {identifiedStudent.photoUrl ? (
                  <img
                    src={identifiedStudent.photoUrl}
                    alt={identifiedStudent.fullName}
                    className="w-24 h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-24 h-28 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <Users className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      paymentVerification.isPaidForCurrentMonth
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {identifiedStudent.code}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 truncate">
                    {identifiedStudent.fullName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">{identifiedStudent.courseName}</p>
                  <p className="text-xs text-slate-500">
                    Turma: <strong className="text-slate-800">{identifiedStudent.classGroupName || '—'}</strong> • Regime:{' '}
                    {identifiedStudent.regime}
                  </p>
                  <p className="text-xs text-slate-500">
                    Encarregado: <strong className="text-slate-800">{identifiedGuardian?.guardianName}</strong>{' '}
                    {identifiedGuardian?.guardianPhone ? (
                      <span className="font-mono text-slate-700">({identifiedGuardian.guardianPhone})</span>
                    ) : null}
                  </p>
                </div>
              </div>

              {/* RESULTADO DA VERIFICAÇÃO DA MENSALIDADE DO MÊS ATUAL */}
              {paymentVerification.isPaidForCurrentMonth ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-emerald-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block font-black">
                          Mensalidade de {paymentVerification.currentMonthLabel} Regularizada
                        </strong>
                        <span className="text-[11px] text-emerald-700">{paymentVerification.reason}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase">
                      Autorizado
                    </span>
                  </div>

                  {/* BOTÕES ENTRAR OU SAIR */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleConfirmAccess('entrada')}
                      className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Entrar (Confirmar)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmAccess('saida')}
                      className="py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair (Confirmar)</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-center text-slate-500">
                    Após confirmar <strong>Entrar</strong> ou <strong>Sair</strong>, será exibido o botão do WhatsApp para avisar o encarregado com a hora exata.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* ALERTA VERMELHO: ACESSO NÃO PERMITIDO */}
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2">
                    <div className="flex items-center gap-2.5 text-rose-800">
                      <Ban className="w-6 h-6 text-rose-600 shrink-0" />
                      <div>
                        <div className="text-sm font-black uppercase tracking-wide text-rose-700">
                          ACESSO NÃO PERMITIDO
                        </div>
                        <p className="text-xs font-semibold text-rose-900">
                          {paymentVerification.reason}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      O(A) aluno(a) não pode entrar sem regularizar a mensalidade de{' '}
                      <strong>{paymentVerification.currentMonthLabel}</strong>. Clique no botão abaixo para avisar o encarregado via WhatsApp.
                    </p>
                  </div>

                  {/* BOTÃO ENTRAR BLOQUEADO + SAÍDA SE JÁ ESTIVER DENTRO */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled
                      className="py-3.5 px-4 bg-rose-100 text-rose-500 border border-rose-200 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Ban className="w-4 h-4" />
                      <span>ENTRADA BLOQUEADA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmAccess('saida')}
                      className="py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Confirmar SAÍDA</span>
                    </button>
                  </div>

                  {/* BOTÃO WHATSAPP DE ALUNO BARRADO NA PORTA */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block mb-1">
                        Mensagem pronta para o Encarregado ({identifiedGuardian?.guardianName}):
                      </span>
                      <p className="italic text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                        "{barredPreviewMessage}"
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {barredWhatsAppUrl ? (
                        <a
                          href={barredWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            logGateAccess(
                              identifiedStudent.id,
                              'barrado',
                              activeBranch?.name ? `Portaria - ${activeBranch.name}` : 'Portão Principal',
                              operatorDisplayName,
                              true,
                              barredPreviewMessage,
                              paymentVerification.reason
                            );
                          }}
                          className="flex-1 min-w-[220px] py-3 px-4 bg-[#25D366] hover:bg-[#1fb858] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>
                            Avisar Encarregado no WhatsApp ({identifiedGuardian?.guardianPhone})
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-2 rounded-xl">
                          Sem número WhatsApp registado para o encarregado deste aluno.
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleConfirmAccess('barrado')}
                        className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                      >
                        Registar Barramento
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REGISTOS RECENTES + AÇÕES RÁPIDAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Últimos Movimentos</h3>
                <a
                  href="#historico-acessos"
                  className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
                >
                  <span>Ver Todos</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
              {instAccessLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Sem movimentos registados nesta sessão.
                </p>
              ) : (
                <div className="space-y-2">
                  {instAccessLogs.slice(0, 4).map(row => (
                    <div key={row.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-800 truncate">{row.studentName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{row.time || row.timestamp}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase shrink-0 ${
                          row.type === 'entrada'
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                            : row.type === 'saida'
                            ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
                        }`}
                      >
                        {row.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2.5">
              <h3 className="font-bold text-sm text-slate-900">Ações Rápidas da Guarita</h3>
              <button
                type="button"
                onClick={() => setShowVisitorModal(true)}
                className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 flex items-center gap-3 text-left transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950">Registar Visitante</div>
                  <div className="text-[10px] text-slate-500">BI, destino e horário ({visitorsLog.length})</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowDeliveryModal(true)}
                className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 flex items-center gap-3 text-left transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">Registar Entrega</div>
                  <div className="text-[10px] text-slate-500">Correspondência recebida ({deliveriesLog.length})</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playSuccess();
                  addNotification({
                    title: 'Linha Direta com a Secretaria',
                    message: `Comunicação da guarita (${centerName}) encaminhada à Secretaria.`,
                    type: 'system'
                  });
                }}
                className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 flex items-center gap-3 text-left transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950">Avisar Secretaria</div>
                  <div className="text-[10px] text-slate-500">Notificar direção/secretaria sem sair da guarita</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: HISTÓRICO DO DIA */}
        <div id="historico-acessos" className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Histórico do Dia</h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {todayLogs.length} Registos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Entradas</span>
                <span className="text-xl font-black text-emerald-700">{totalEntradasHoje}</span>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Saídas</span>
                <span className="text-xl font-black text-amber-700">{totalSaidasHoje}</span>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Barrados</span>
                <span className="text-xl font-black text-rose-700">{totalBarradosHoje}</span>
              </div>
            </div>

            {/* FILTROS E BUSCA DO HISTÓRICO */}
            <div className="space-y-2">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {(['todos', 'entrada', 'saida', 'barrado'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setHistoryFilter(tab)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer capitalize ${
                      historyFilter === tab
                        ? tab === 'entrada'
                          ? 'bg-emerald-600 text-white'
                          : tab === 'saida'
                          ? 'bg-amber-600 text-white'
                          : tab === 'barrado'
                          ? 'bg-rose-600 text-white'
                          : 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'todos' ? 'Todos' : tab === 'entrada' ? 'Entradas' : tab === 'saida' ? 'Saídas' : 'Barrados'}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  placeholder="Pesquisar no histórico..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* LISTAGEM DOS REGISTOS */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {todayLogs.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Nenhum movimento registado</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    As entradas, saídas e bloqueios aparecerão aqui em tempo real.
                  </p>
                </div>
              ) : (
                todayLogs.map(log => {
                  const isEntrada = log.type === 'entrada';
                  const isBarrado = log.type === 'barrado';
                  const msg =
                    log.notificationMessage ||
                    `Olá ${log.guardianName || 'Encarregado'}, informamos que o(a) aluno(a) ${log.studentName} do centro ${
                      log.institutionName || centerName
                    } ${isEntrada ? 'ENTROU' : isBarrado ? 'foi BARRADO(A) NA PORTA' : 'SAIU'} às ${
                      log.time || log.timestamp
                    }.`;
                  const waUrl = buildWhatsAppUrl(log.guardianPhone, msg);

                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                        isBarrado
                          ? 'bg-rose-50/70 border-rose-200'
                          : 'bg-slate-50/70 hover:bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {log.photoUrl ? (
                          <img
                            src={log.photoUrl}
                            alt={log.studentName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-200/70 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                            <UserCheck className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{log.studentName}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {log.courseName} • <span className="font-mono">{log.studentCode}</span>
                          </p>
                          {isBarrado && log.blockReason && (
                            <p className="text-[10px] text-rose-700 font-semibold truncate">{log.blockReason}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Enviar WhatsApp para ${log.guardianPhone}`}
                            className="p-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider block ${
                              isEntrada
                                ? 'bg-emerald-100 text-emerald-800'
                                : isBarrado
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isEntrada ? 'ENTRADA' : isBarrado ? 'BARRADO' : 'SAÍDA'}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500 block mt-0.5">
                            {log.time || log.timestamp?.split(' ')[1] || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
              <button
                type="button"
                onClick={() => setShowVisitorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
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
                    if (!visitorName.trim()) return;
                    soundManager.playSuccess();
                    setVisitorsLog(prev => [
                      {
                        id: `vis-${Date.now()}`,
                        time: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
                        name: visitorName.trim(),
                        detail: `${visitorDest}${visitorBi ? ` • BI: ${visitorBi}` : ''}`
                      },
                      ...prev
                    ]);
                    addNotification({
                      title: 'Visitante Registado',
                      message: `${visitorName.trim()} encaminhado(a) para ${visitorDest}.`,
                      type: 'system'
                    });
                    setShowVisitorModal(false);
                    setVisitorName('');
                    setVisitorBi('');
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
              <button
                type="button"
                onClick={() => setShowDeliveryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
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
                    setDeliveriesLog(prev => [
                      {
                        id: `del-${Date.now()}`,
                        time: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
                        name: deliveryProvider.trim() || 'Encomenda',
                        detail: deliveryRecipient
                      },
                      ...prev
                    ]);
                    addNotification({
                      title: 'Entrega Registada',
                      message: `Entrega de ${deliveryProvider} registada para ${deliveryRecipient}.`,
                      type: 'system'
                    });
                    setShowDeliveryModal(false);
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
    </div>
  );
};

export default PorteiroExperienceView;
