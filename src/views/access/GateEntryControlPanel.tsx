import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Scan,
  CheckCircle2,
  Clock,
  User,
  LogIn,
  LogOut,
  Smartphone,
  Search,
  MapPin,
  Printer,
  UserCheck,
  Ban,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  X
} from 'lucide-react';
import { Student } from '../../types';
import { soundManager } from '../../utils/audio';
import { resolveInstitutionIdentity } from '../../utils/institutionIdentity';
import { GateQrCameraScanner } from '../../components/access/GateQrCameraScanner';
import {
  buildGateWhatsAppMessage,
  buildWhatsAppUrl,
  checkGateMovementSequence,
  checkStudentMonthlyPaymentStatus,
  getMaputoDateTimeInfo,
  getStudentGuardianContact,
  resolveStudentFromQrPayload
} from '../../utils/gateAccessUtils';

export const GateEntryControlPanel: React.FC = () => {
  const {
    students,
    courses,
    paymentRecords,
    contasReceber,
    activeInstitution,
    activeRole,
    firebaseUser,
    logGateAccess,
    markGateWhatsAppLinkOpened,
    accessLogs,
    addNotification
  } = useApp();

  const identity = resolveInstitutionIdentity(activeInstitution);
  const centerName = identity.officialName || activeInstitution.name || 'Instituição de Ensino';
  const instStudents = identity.hasInstitution
    ? students.filter(s => s.institutionId === activeInstitution.id)
    : [];

  // Local da Portaria
  const [selectedLocation, setSelectedLocation] = useState('Portão Principal');
  const [customLocationInput, setCustomLocationInput] = useState('');
  const [isCustomLocation, setIsCustomLocation] = useState(false);

  // Fluxo pré-definido: ENTRADA ou SAÍDA
  const [currentMode, setCurrentMode] = useState<'entrada' | 'saida'>('entrada');

  // Registo de notificação WhatsApp
  const [sendGuardianNotification, setSendGuardianNotification] = useState(true);

  // Scanner & Identificação
  const [qrOrCodeInput, setQrOrCodeInput] = useState('');
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Filtro de Histórico
  const [filterType, setFilterType] = useState<'todos' | 'entrada' | 'saida' | 'barrado'>('todos');
  const [searchLogQuery, setSearchLogQuery] = useState('');

  // Relógio ao vivo
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Limpar dados temporários ao trocar de instituição
  useEffect(() => {
    setIdentifiedStudent(null);
    setLastAction(null);
    setScanError(null);
    setQrOrCodeInput('');
  }, [activeInstitution.id]);

  const operatorName =
    firebaseUser?.displayName ||
    ((activeRole as string) === 'superadmin'
      ? 'Super Administrador'
      : (activeRole as string) === 'admin'
      ? 'Administrador'
      : (activeRole as string) === 'secretaria'
      ? 'Secretaria Geral'
      : 'Operador da Portaria');

  const activeGateLocation =
    isCustomLocation && customLocationInput.trim() ? customLocationInput.trim() : selectedLocation;

  // Última ação confirmada (para apresentar botão WhatsApp pós-confirmação)
  const [lastAction, setLastAction] = useState<{
    logId?: string;
    student: Student;
    type: 'entrada' | 'saida' | 'barrado';
    date: string;
    time: string;
    hourOnly: string;
    operator: string;
    institution: string;
    location: string;
    message: string;
    guardianName: string;
    guardianPhone: string;
    whatsappUrl: string | null;
    whatsappOpened?: boolean;
  } | null>(null);
  const isSubmittingRef = useRef(false);

  // Identificar aluno por QR Code (câmara) ou busca manual
  const handleIdentifyStudent = (searchVal: string, allowManualNameLookup = false) => {
    const trimmed = (searchVal || '').trim();
    if (!trimmed) return;

    const qrResult = resolveStudentFromQrPayload(
      trimmed,
      instStudents,
      activeInstitution.id,
      students
    );

    if (qrResult.student) {
      soundManager.playNotification();
      setIdentifiedStudent(qrResult.student);
      setQrOrCodeInput('');
      setScanError(null);
      return;
    }

    const isStructuredOrToken =
      trimmed.startsWith('{') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.toUpperCase().startsWith('SIGAR-QR-V1:') ||
      trimmed.toUpperCase().startsWith('SGR-');

    if (allowManualNameLookup && qrResult.status === 'not_found' && !isStructuredOrToken) {
      const q = trimmed.toLowerCase();
      const manualMatches = instStudents.filter(s => {
        const biMatch = (s.documentNumber || '').trim().toLowerCase() === q;
        const nameMatch = (s.fullName || s.name || '').toLowerCase().includes(q);
        return biMatch || (q.length >= 3 && nameMatch);
      });
      if (manualMatches.length === 1) {
        soundManager.playNotification();
        setIdentifiedStudent(manualMatches[0]);
        setQrOrCodeInput('');
        setScanError(null);
        return;
      }
      if (manualMatches.length > 1) {
        soundManager.playError();
        setScanError(`Encontrados ${manualMatches.length} alunos para "${trimmed}". Indique o código exacto.`);
        return;
      }
    }

    soundManager.playError();
    const errText =
      qrResult.reason || `Nenhum estudante encontrado nesta instituição para "${searchVal}".`;
    setScanError(errText);
    addNotification({
      title: 'Leitura Rejeitada / Não Identificada',
      message: errText,
      type: 'alert'
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleIdentifyStudent(qrOrCodeInput, true);
  };

  const paymentVerification = identifiedStudent
    ? checkStudentMonthlyPaymentStatus(
        identifiedStudent,
        courses,
        contasReceber,
        paymentRecords,
        currentTime
      )
    : null;

  const entrySequenceCheck = identifiedStudent
    ? checkGateMovementSequence(identifiedStudent.id, 'entrada', accessLogs, activeInstitution.id)
    : null;
  const exitSequenceCheck = identifiedStudent
    ? checkGateMovementSequence(identifiedStudent.id, 'saida', accessLogs, activeInstitution.id)
    : null;

  const maputoClock = getMaputoDateTimeInfo(currentTime);
  const identifiedGuardian = identifiedStudent ? getStudentGuardianContact(identifiedStudent) : null;
  const hourNowStr = maputoClock.timeStr.slice(0, 5);
  const barredPreviewMessage =
    identifiedStudent && paymentVerification && !paymentVerification.isPaidForCurrentMonth
      ? buildGateWhatsAppMessage({
          action: 'barrado',
          student: identifiedStudent,
          institutionName: centerName,
          timeStr: hourNowStr,
          monthLabel: paymentVerification.monthLabel,
          blockReason: paymentVerification.reason
        })
      : '';
  const barredWhatsAppUrl =
    identifiedGuardian && barredPreviewMessage
      ? buildWhatsAppUrl(identifiedGuardian.guardianPhone, barredPreviewMessage)
      : null;

  // Confirmar Acesso (ENTRADA, SAÍDA ou BARRADO) com trava anti-duplo clique
  const handleConfirmAccess = (
    type: 'entrada' | 'saida' | 'barrado',
    options?: { openedFromWhatsAppLink?: boolean }
  ) => {
    if (isSubmittingRef.current) return;
    if (!identifiedStudent || !paymentVerification) {
      addNotification({
        title: 'Nenhum Aluno Selecionado',
        message: 'Apresente o QR Code ou selecione um aluno para confirmar o acesso.',
        type: 'alert'
      });
      return;
    }

    if (type === 'entrada' && !paymentVerification.isPaidForCurrentMonth) {
      soundManager.playError();
      setScanError(`Acesso não permitido: ${paymentVerification.reason}`);
      return;
    }

    isSubmittingRef.current = true;
    try {
      const maputoNow = getMaputoDateTimeInfo();
      const dateStr = maputoNow.ddMmYyyy;
      const timeStr = maputoNow.timeStr;
      const hourOnly = maputoNow.timeStr.slice(0, 5);
      const guardian = getStudentGuardianContact(identifiedStudent);

      const standardMsg = buildGateWhatsAppMessage({
        action: type,
        student: identifiedStudent,
        institutionName: centerName,
        timeStr: hourOnly,
        monthLabel: paymentVerification.monthLabel,
        blockReason: type === 'barrado' ? paymentVerification.reason : undefined
      });

      const whatsappUrl = buildWhatsAppUrl(guardian.guardianPhone, standardMsg);

      const log = logGateAccess(
        identifiedStudent.id,
        type,
        activeGateLocation,
        operatorName,
        false,
        standardMsg,
        type === 'barrado' ? paymentVerification.reason : undefined
      );

      if (log) {
        if (options?.openedFromWhatsAppLink) {
          markGateWhatsAppLinkOpened(log.id);
        }
        setLastAction({
          logId: log.id,
          student: identifiedStudent,
          type,
          date: dateStr,
          time: timeStr,
          hourOnly,
          operator: operatorName,
          institution: centerName,
          location: activeGateLocation,
          message: standardMsg,
          guardianName: guardian.guardianName,
          guardianPhone: guardian.guardianPhone,
          whatsappUrl,
          whatsappOpened: Boolean(options?.openedFromWhatsAppLink)
        });
        setIdentifiedStudent(null);
        setScanError(null);
      }
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 400);
    }
  };

  // Filtrar registos da instituição ativa
  const instAccessLogs = identity.hasInstitution
    ? accessLogs.filter(log => log.institutionId === activeInstitution.id)
    : [];

  const filteredLogs = instAccessLogs.filter(log => {
    const matchesType = filterType === 'todos' || log.type === filterType;
    const matchesSearch =
      log.studentName.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      log.studentCode.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      (log.location && log.location.toLowerCase().includes(searchLogQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div id="gate-entry-control-panel" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600/30 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Módulo 28</span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Painel de Controlo de Entrada &amp; Saída
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Leitura de QR Code pela câmara em tempo real, validação automática da mensalidade do mês corrente, bloqueio na porta em caso de atraso e botão direto para WhatsApp do encarregado.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 self-start lg:self-auto min-w-[280px]">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Operador em Sessão:</span>
              </div>
              <div className="font-bold text-white text-sm">{operatorName}</div>
              <div className="text-[11px] text-emerald-400 font-medium">{centerName}</div>
            </div>
            <div className="text-right border-l border-slate-800 pl-4">
              <div className="text-xs text-slate-400 flex items-center gap-1 justify-end font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {maputoClock.timeStr}
              </div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">
                {currentTime.toLocaleDateString('pt-MZ', { timeZone: 'Africa/Maputo', weekday: 'short', day: '2-digit', month: 'short' })}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Local da Portaria / Ponto de Acesso:
            </label>
            <div className="flex items-center gap-2">
              <select
                value={isCustomLocation ? 'outro' : selectedLocation}
                onChange={e => {
                  if (e.target.value === 'outro') {
                    setIsCustomLocation(true);
                  } else {
                    setIsCustomLocation(false);
                    setSelectedLocation(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Portão Principal">Portão Principal</option>
                <option value="Portaria Sul">Portaria Sul</option>
                <option value="Entrada de Pedestres">Entrada de Pedestres</option>
                <option value="Recepção Central">Recepção Central</option>
                <option value="Bloco Técnico & Oficinas">Bloco Técnico &amp; Oficinas</option>
                <option value="outro">+ Outro Local Personalizado</option>
              </select>
              {isCustomLocation && (
                <input
                  type="text"
                  placeholder="Nome do local..."
                  value={customLocationInput}
                  onChange={e => setCustomLocationInput(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
                />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              Fluxo Pré-Definido da Portaria:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentMode('entrada')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentMode === 'entrada' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                ENTRADA
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('saida')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentMode === 'saida' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                SAÍDA
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Notificação ao Encarregado (WhatsApp):
            </label>
            <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-300">Botão pós-confirmação</span>
              <button
                type="button"
                onClick={() => setSendGuardianNotification(!sendGuardianNotification)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sendGuardianNotification
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {sendGuardianNotification ? 'Ativado ✓' : 'Desativado ✕'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Operational Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Passos 1 e 2 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Passo 1: Câmara &amp; Leitura de QR Code</h2>
                  <p className="text-xs text-slate-500">Abra a câmara, leia foto do QR ou use leitor USB/matrícula</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                Ponto: {activeGateLocation}
              </span>
            </div>

            <GateQrCameraScanner
              onCodeDetected={code => handleIdentifyStudent(code, false)}
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

            {/* Atalhos rápidos */}
            {instStudents.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                  Identificar Aluno da Instituição (Teste Rápido):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {instStudents.slice(0, 6).map(s => {
                    const isCurrent = identifiedStudent?.id === s.id;
                    const check = checkStudentMonthlyPaymentStatus(
                      s,
                      courses,
                      contasReceber,
                      paymentRecords
                    );
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setIdentifiedStudent(s);
                          setScanError(null);
                          soundManager.playNotification();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isCurrent
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : check.isPaidForCurrentMonth
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{s.fullName.split(' ')[0]}</span>
                        <span className="text-[10px] font-mono opacity-75">({s.code})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Manual / USB */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={qrOrCodeInput}
                  onChange={e => setQrOrCodeInput(e.target.value)}
                  placeholder="Escanear com leitor USB ou digitar código da matrícula..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Identificar Aluno
              </button>
            </form>
          </div>

          {/* Passo 2: Aluno Identificado + Verificação de Mensalidade */}
          {identifiedStudent && paymentVerification && (
            <div
              className={`bg-white rounded-3xl p-6 border-2 shadow-sm space-y-4 ${
                paymentVerification.isPaidForCurrentMonth ? 'border-emerald-500' : 'border-rose-500'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {paymentVerification.isPaidForCurrentMonth ? (
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Ban className="w-5 h-5 text-rose-600" />
                  )}
                  <h3 className="text-sm font-bold text-slate-900">
                    {paymentVerification.isPaidForCurrentMonth
                      ? 'Passo 2: Aluno Identificado (Mensalidade Regular)'
                      : 'Passo 2: ACESSO NÃO PERMITIDO'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      paymentVerification.isPaidForCurrentMonth
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {paymentVerification.isPaidForCurrentMonth ? 'Mês Pago ✓' : 'Mês Não Pago ✕'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIdentifiedStudent(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                {identifiedStudent.photoUrl ? (
                  <img
                    src={identifiedStudent.photoUrl}
                    alt={identifiedStudent.fullName}
                    className="w-20 h-24 rounded-2xl object-cover border-2 border-slate-300 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-20 h-24 rounded-2xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-500 shrink-0">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 truncate">{identifiedStudent.fullName}</h4>
                  <p className="text-xs font-mono font-bold text-indigo-700">Matrícula: {identifiedStudent.code}</p>
                  <p className="text-xs text-slate-600 font-medium">Curso: {identifiedStudent.courseName}</p>
                  <p className="text-xs text-slate-500">Turma: {identifiedStudent.classGroupName || '—'}</p>

                  <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span>
                      Encarregado: <strong>{identifiedGuardian?.guardianName}</strong>
                    </span>
                    <span>
                      Contacto: <strong>{identifiedGuardian?.guardianPhone || 'Não registado'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Passo 3: Confirmação ou Bloqueio por falta de pagamento */}
              {paymentVerification.isPaidForCurrentMonth ? (
                <div className="pt-2 space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <strong>{paymentVerification.monthLabel}:</strong> {paymentVerification.reason}
                  </div>

                  {paymentVerification.warningNote && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                      {paymentVerification.warningNote}
                    </div>
                  )}

                  {(entrySequenceCheck?.isDuplicateSequence || exitSequenceCheck?.isDuplicateSequence) && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                      {entrySequenceCheck?.warningMessage && <div>{entrySequenceCheck.warningMessage}</div>}
                      {exitSequenceCheck?.warningMessage && <div>{exitSequenceCheck.warningMessage}</div>}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Passo 3: Confirmar Entrada ou Saída:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Operador: <strong className="text-slate-800">{operatorName}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleConfirmAccess('entrada')}
                      className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      Entrar (Confirmar Entrada)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmAccess('saida')}
                      className="py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-sky-700/20 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair (Confirmar Saída)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 space-y-3">
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-700 font-black text-sm uppercase">
                      <Ban className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>ACESSO NÃO PERMITIDO</span>
                    </div>
                    <p className="text-xs font-semibold text-rose-900">{paymentVerification.reason}</p>
                    <p className="text-[11px] text-rose-700">
                      Entrada bloqueada por falta de pagamento da mensalidade de{' '}
                      <strong>{paymentVerification.monthLabel}</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled
                      className="py-3.5 px-4 bg-rose-100 text-rose-500 border border-rose-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Ban className="w-4 h-4" />
                      Entrada Bloqueada
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmAccess('saida')}
                      className="py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Confirmar Saída
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <p className="text-[11px] text-slate-600 italic">"{barredPreviewMessage}"</p>
                    <div className="flex flex-wrap gap-2">
                      {barredWhatsAppUrl ? (
                        <a
                          href={barredWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleConfirmAccess('barrado', { openedFromWhatsAppLink: true })}
                          className="flex-1 min-w-[210px] py-2.5 px-4 bg-[#25D366] hover:bg-[#1fb858] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Avisar Encarregado no WhatsApp (Barrado)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-rose-700">
                          Encarregado sem número WhatsApp registado.
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleConfirmAccess('barrado')}
                        className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Registar Bloqueio
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Comprovativo Pós-Confirmação & Botão WhatsApp */}
        <div className="lg:col-span-5 space-y-6">
          {lastAction ? (
            <div
              className={`p-6 rounded-3xl border-2 shadow-md space-y-5 animate-in fade-in duration-300 ${
                lastAction.type === 'entrada'
                  ? 'bg-emerald-50/80 border-emerald-500/40 text-emerald-950'
                  : lastAction.type === 'saida'
                  ? 'bg-sky-50/80 border-sky-500/40 text-sky-950'
                  : 'bg-rose-50/80 border-rose-500/40 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  {lastAction.type === 'barrado' ? (
                    <Ban className="w-6 h-6 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  )}
                  <span className="font-black text-sm uppercase tracking-wider">
                    {lastAction.type === 'entrada'
                      ? 'ENTRADA HOMOLOGADA'
                      : lastAction.type === 'saida'
                      ? 'SAÍDA REGISTRADA'
                      : 'BARRADO NA PORTA'}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg">
                  {lastAction.hourOnly}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {lastAction.student.photoUrl ? (
                  <img
                    src={lastAction.student.photoUrl}
                    alt={lastAction.student.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{lastAction.student.fullName}</h4>
                  <p className="text-xs font-mono text-slate-600">{lastAction.student.code}</p>
                  <p className="text-[11px] text-slate-500">{lastAction.student.courseName}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
                  Dados Homologados no Registo de Acesso:
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data &amp; Hora:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {lastAction.date} • {lastAction.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Centro / Instituição:</span>
                  <span className="font-bold text-slate-900 text-right">{lastAction.institution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Local da Portaria:</span>
                  <span className="font-bold text-slate-900">{lastAction.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operador:</span>
                  <span className="font-bold text-slate-900">{lastAction.operator}</span>
                </div>
              </div>

              {/* BOTÃO WHATSAPP PÓS-CONFIRMAÇÃO */}
              <div className="p-4 bg-white border border-emerald-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    WhatsApp ao Encarregado
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {lastAction.guardianName} ({lastAction.guardianPhone || 'N/D'})
                  </span>
                </div>
                <p className="text-slate-600 italic text-[11px]">"{lastAction.message}"</p>

                {lastAction.whatsappUrl ? (
                  <div className="space-y-2">
                    <a
                      href={lastAction.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (lastAction.logId) {
                          markGateWhatsAppLinkOpened(lastAction.logId);
                          setLastAction(prev => (prev ? { ...prev, whatsappOpened: true } : prev));
                        }
                      }}
                      className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#1fb858] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {lastAction.whatsappOpened
                          ? `Reabrir WhatsApp (${lastAction.guardianPhone})`
                          : `Abrir WhatsApp do Encarregado (${lastAction.guardianPhone})`}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {lastAction.whatsappOpened && (
                      <span className="block text-[10px] font-bold text-emerald-700 text-center">
                        Link WhatsApp aberto pelo operador
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="block text-[11px] font-bold text-rose-600">
                    Número de WhatsApp do encarregado não registado.
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Aguardando Próxima Leitura</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Após ler o QR Code do aluno e confirmar Entrada ou Saída, o botão de envio no WhatsApp ao encarregado aparecerá aqui com a hora exata.
              </p>
            </div>
          )}

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900">Carteirinhas &amp; Lote de Alunos</h4>
              <p className="text-[11px] text-slate-500">Imprimir cartões discentes formatados em A4</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Histórico Consolidado de Acessos Hoje */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Registos Recentes de Portaria ({activeGateLocation})
            </h3>
            <p className="text-xs text-slate-500">
              Entradas, saídas e bloqueios registados com data, hora, utilizador e link WhatsApp do responsável
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {(['todos', 'entrada', 'saida', 'barrado'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterType(tab)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filterType === tab
                      ? tab === 'entrada'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : tab === 'saida'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : tab === 'barrado'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {tab === 'todos'
                    ? `Todos (${instAccessLogs.length})`
                    : tab === 'entrada'
                    ? 'Entradas'
                    : tab === 'saida'
                    ? 'Saídas'
                    : 'Barrados'}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLogQuery}
                onChange={e => setSearchLogQuery(e.target.value)}
                placeholder="Filtrar por nome, matrícula..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Aluno</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Data &amp; Hora</th>
                <th className="pb-3">Utilizador (Operador)</th>
                <th className="pb-3">Instituição &amp; Local</th>
                <th className="pb-3">Encarregado</th>
                <th className="pb-3 text-right pr-2">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    Nenhum registo encontrado para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const msg =
                    log.notificationMessage ||
                    `Olá ${log.guardianName || 'Encarregado'}, informamos que o(a) aluno(a) ${log.studentName} do centro ${
                      log.institutionName || centerName
                    } ${log.type === 'entrada' ? 'ENTROU' : log.type === 'barrado' ? 'foi BARRADO(A) NA PORTA' : 'SAIU'} às ${
                      log.time || log.timestamp
                    }.`;
                  const waUrl = buildWhatsAppUrl(log.guardianPhone, msg);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-3">
                          {log.photoUrl ? (
                            <img
                              src={log.photoUrl}
                              alt={log.studentName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block">{log.studentName}</span>
                            <span className="text-[11px] font-mono text-slate-500">{log.studentCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            log.type === 'entrada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.type === 'barrado'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {log.type === 'entrada' ? (
                            <LogIn className="w-3 h-3" />
                          ) : log.type === 'barrado' ? (
                            <Ban className="w-3 h-3" />
                          ) : (
                            <LogOut className="w-3 h-3" />
                          )}
                          {log.type === 'entrada' ? 'ENTRADA' : log.type === 'barrado' ? 'BARRADO' : 'SAÍDA'}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-700">
                        <div className="font-semibold">{log.time || log.timestamp.split(' ')[1] || log.timestamp}</div>
                        <div className="text-[10px] text-slate-400">{log.date || log.timestamp.split(' ')[0]}</div>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-slate-800 block">{log.operator}</span>
                        <span className="text-[10px] text-slate-400">Portaria / Secretaria</span>
                      </td>
                      <td className="py-3">
                        <span className="text-slate-800 font-medium block">{log.location || activeGateLocation}</span>
                        <span className="text-[10px] text-slate-400">{log.institutionName || centerName}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          <div>
                            <span className="text-[11px] font-semibold text-slate-700 block">
                              {log.guardianName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {log.guardianPhone || 'Sem número'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right pr-2">
                        {waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => markGateWhatsAppLinkOpened(log.id)}
                            title={
                              log.whatsappStatus === 'link_aberto'
                                ? 'Link WhatsApp já aberto'
                                : 'Abrir WhatsApp do Encarregado'
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              log.whatsappStatus === 'link_aberto'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white'
                            }`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{log.whatsappStatus === 'link_aberto' ? 'Link Aberto' : 'WhatsApp'}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
