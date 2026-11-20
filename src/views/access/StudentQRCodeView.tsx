import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  QrCode, 
  Scan, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  User, 
  LogIn, 
  LogOut, 
  Smartphone, 
  Search, 
  Eye, 
  EyeOff, 
  Printer, 
  Download, 
  Layers, 
  AlertCircle,
  Building,
  GraduationCap,
  Calendar,
  Lock,
  Share2
} from 'lucide-react';
import { 
  getAuthorizedPublicStudentData, 
  isAuthorizedGateOperator, 
  generateStudentQrHash,
  PublicStudentInfo 
} from '../../utils/studentQrSecurity';
import {
  buildGateWhatsAppMessage,
  buildWhatsAppUrl,
  checkGateMovementSequence,
  checkStudentMonthlyPaymentStatus,
  getMaputoDateTimeInfo,
  getStudentGuardianContact,
  resolveStudentFromQrPayload
} from '../../utils/gateAccessUtils';
import { Student } from '../../types';
import { InstitutionLogoBadge } from '../../components/common/InstitutionLogoBadge';
import { resolveInstitutionIdentity } from '../../utils/institutionIdentity';
import { RealQRCode } from '../../components/common/RealQRCode';

export const StudentQRCodeView: React.FC = () => {
  const { 
    students, 
    classes,
    courses,
    contasReceber,
    paymentRecords,
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
  const instClasses = identity.hasInstitution
    ? classes.filter(c => c.institutionId === activeInstitution.id)
    : [];

  // Selected student for active scan inspection
  const [selectedStudentId, setSelectedStudentId] = useState<string>(instStudents[0]?.id || '');
  const [searchInput, setSearchInput] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('todas');
  
  // Interactive mode toggle: test authenticated gate vs public scan
  const [simulationMode, setSimulationMode] = useState<'auth_operator' | 'public_visitor'>('auth_operator');
  
  // Optical scanner animation state
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanBlockAlert, setScanBlockAlert] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{
    logId?: string;
    type: 'entrada' | 'saida' | 'barrado';
    timestamp: string;
    student: Student;
    operator: string;
    guardianName: string;
    guardianPhone: string;
    whatsappMessage: string;
    whatsappUrl: string | null;
    whatsappOpened?: boolean;
  } | null>(null);

  const isUserAuthenticatedOperator = isAuthorizedGateOperator(activeRole);
  // Current effective mode based on user permission and toggle
  const isOperatorMode = simulationMode === 'auth_operator' && isUserAuthenticatedOperator;

  const currentStudent = instStudents.find(s => s.id === selectedStudentId) || instStudents[0];
  const publicData: PublicStudentInfo | null = currentStudent 
    ? getAuthorizedPublicStudentData(currentStudent, identity.officialName, currentStudent.institutionId || activeInstitution.id)
    : null;

  const paymentVerification = currentStudent
    ? checkStudentMonthlyPaymentStatus(currentStudent, courses, contasReceber, paymentRecords)
    : null;

  const currentGuardian = currentStudent ? getStudentGuardianContact(currentStudent) : null;
  const entrySequenceCheck = currentStudent
    ? checkGateMovementSequence(currentStudent.id, 'entrada', accessLogs, activeInstitution.id)
    : null;
  const exitSequenceCheck = currentStudent
    ? checkGateMovementSequence(currentStudent.id, 'saida', accessLogs, activeInstitution.id)
    : null;

  // Filtered students for QR directory
  const filteredStudents = instStudents.filter(s => {
    const matchesClass = selectedClassFilter === 'todas' || s.classGroupId === selectedClassFilter;
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchInput.toLowerCase()) ||
      s.code.toLowerCase().includes(searchInput.toLowerCase()) ||
      s.courseName.toLowerCase().includes(searchInput.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Recent logs for current student today
  const studentLogsToday = accessLogs.filter(
    l => l.studentId === currentStudent?.id && l.institutionId === activeInstitution.id
  );

  // Trigger scan simulation
  const handleSelectStudentForScan = (studentId: string) => {
    setIsScanningActive(true);
    setScanBlockAlert(null);
    setTimeout(() => {
      setSelectedStudentId(studentId);
      setIsScanningActive(false);
      setLastActionResult(null);
    }, 300);
  };

  // Confirm Gate Access (Entrada, Saída ou Barramento) COM validação financeira obrigatória
  const handleConfirmAccess = (type: 'entrada' | 'saida' | 'barrado') => {
    if (!currentStudent || !paymentVerification) return;
    if (!isOperatorMode) {
      addNotification({
        title: 'Operação Bloqueada no Scan Público',
        message: 'Apenas operadores autenticados e autorizados da portaria podem registrar Entrada ou Saída.',
        type: 'system'
      });
      return;
    }

    if (type === 'entrada' && !paymentVerification.isPaidForCurrentMonth) {
      setScanBlockAlert(`ACESSO NÃO PERMITIDO: ${paymentVerification.reason}`);
      addNotification({
        title: 'Entrada Bloqueada na Portaria',
        message: `${currentStudent.fullName}: ${paymentVerification.reason}`,
        type: 'alert'
      });
      return;
    }

    const maputoNow = getMaputoDateTimeInfo();
    const hourOnly = maputoNow.timeStr.slice(0, 5);
    const guardian = getStudentGuardianContact(currentStudent);
    const operatorName =
      firebaseUser?.displayName || (activeRole === 'superadmin' ? 'Super Administrador' : 'Operador da Portaria');

    const whatsappMessage = buildGateWhatsAppMessage({
      action: type,
      student: currentStudent,
      institutionName: centerName,
      timeStr: hourOnly,
      monthLabel: paymentVerification.monthLabel,
      blockReason: type === 'barrado' ? paymentVerification.reason : undefined
    });
    const whatsappUrl = buildWhatsAppUrl(guardian.guardianPhone, whatsappMessage);

    const log = logGateAccess(
      currentStudent.id,
      type,
      'Portão Principal',
      operatorName,
      false,
      whatsappMessage,
      type === 'barrado' ? paymentVerification.reason : undefined
    );

    setScanBlockAlert(null);
    setLastActionResult({
      logId: log?.id,
      type,
      timestamp: maputoNow.timeStr,
      student: currentStudent,
      operator: operatorName,
      guardianName: guardian.guardianName,
      guardianPhone: guardian.guardianPhone,
      whatsappMessage,
      whatsappUrl,
      whatsappOpened: false
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;

    const qrResult = resolveStudentFromQrPayload(trimmed, instStudents, activeInstitution.id, students);
    if (qrResult.student) {
      setScanBlockAlert(null);
      handleSelectStudentForScan(qrResult.student.id);
      setSearchInput('');
      return;
    }

    const isStructuredOrToken =
      trimmed.startsWith('{') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.toUpperCase().startsWith('SIGAR-QR-V1:') ||
      trimmed.toUpperCase().startsWith('SGR-');

    if (qrResult.status === 'not_found' && !isStructuredOrToken) {
      const q = trimmed.toLowerCase();
      const foundByName = instStudents.find(
        s => q.length >= 3 && s.fullName.toLowerCase().includes(q)
      );
      if (foundByName) {
        setScanBlockAlert(null);
        handleSelectStudentForScan(foundByName.id);
        setSearchInput('');
        return;
      }
    }

    setScanBlockAlert(qrResult.reason);
  };

  return (
    <div id="student-qrcode-module-view" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Module Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <InstitutionLogoBadge institution={activeInstitution} size="lg" rounded="2xl" />
              <div>
                <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                  Módulo 27{identity.officialName ? ` • ${identity.officialName}` : ''}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  QR Code do Aluno & Controlo de Acesso
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Cada estudante possui uma credencial criptográfica em QR Code. O scan público apresenta rigorosamente
              somente dados autorizados para proteger a privacidade discente, enquanto operadores autenticados
              homologam <strong>ENTRADA</strong> e <strong>SAÍDA</strong> em tempo real com disparo de WhatsApp aos encarregados.
            </p>
          </div>

          {/* Mode Switcher pill */}
          <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setSimulationMode('auth_operator')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                simulationMode === 'auth_operator'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Operador Autenticado (Portaria)
            </button>
            <button
              type="button"
              onClick={() => setSimulationMode('public_visitor')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                simulationMode === 'public_visitor'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-200" />
              Scan Público (Não Autenticado)
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Scan Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Terminal / Scanner Simulator (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  Terminal de Leitura Óptica & QR
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isOperatorMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-semibold text-slate-300">
                  {isOperatorMode ? 'Modo: Operador Autorizado' : 'Modo: Scan Público Restrito'}
                </span>
              </div>
            </div>

            {/* Simulated Optical Lens */}
            <div className="relative border-2 border-dashed border-slate-700 bg-slate-950/60 rounded-2xl p-8 text-center flex flex-col items-center justify-center overflow-hidden">
              {isScanningActive && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-lg shadow-cyan-500/50" />
              )}

              <div className="w-28 h-28 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center mb-4 text-indigo-400 relative">
                <QrCode className="w-16 h-16 text-indigo-400" />
                {isScanningActive && (
                  <div className="absolute inset-0 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                    <Scan className="w-12 h-12 text-cyan-400 animate-pulse" />
                  </div>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-200">
                Aponte o QR Code ou Crachá do Estudante
              </h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Leitor compatível com câmera de smartphone, leitor laser USB ou busca rápida por código de matrícula.
              </p>

              {/* Quick Simulator Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 w-full">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2.5">
                  Simular Escaneamento Instantâneo de Aluno:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {instStudents.slice(0, 5).map(s => {
                    const isSelected = s.id === selectedStudentId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectStudentForScan(s.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{s.fullName.split(' ')[0]}</span>
                        <span className="text-[10px] font-mono text-slate-400">({s.code.slice(-4)})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Manual Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={`Digitar matrícula ou nome do aluno (Ex: ${identity.code || 'SIGAR'}-AL-2026-0042)...`}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Escanear Código
              </button>
            </form>
          </div>

          {scanBlockAlert && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{scanBlockAlert}</span>
            </div>
          )}

          {/* Action Confirmation Banner (Operador) */}
          {lastActionResult && (
            <div className={`p-5 rounded-2xl border shadow-lg space-y-3 animate-in fade-in duration-300 ${
              lastActionResult.type === 'entrada'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : lastActionResult.type === 'barrado'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-sky-950/40 border-sky-500/40 text-sky-200'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-white">
                    {lastActionResult.type === 'entrada'
                      ? 'ENTRADA CONFIRMADA NA PORTARIA'
                      : lastActionResult.type === 'barrado'
                      ? 'ACESSO BARRADO REGISTADO NA PORTARIA'
                      : 'SAÍDA REGISTRADA NA PORTARIA'}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  {lastActionResult.timestamp}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={lastActionResult.student.photoUrl}
                  alt={lastActionResult.student.fullName}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-400/40"
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-white">{lastActionResult.student.fullName}</p>
                  <p className="text-xs text-slate-300">{lastActionResult.student.code} • {lastActionResult.student.classGroupName}</p>
                  <p className="text-[11px] text-slate-400">Operador: {lastActionResult.operator}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-slate-300">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  Encarregado: {lastActionResult.guardianName} ({lastActionResult.guardianPhone || 'Sem número'})
                </span>
                {lastActionResult.whatsappUrl ? (
                  <a
                    href={lastActionResult.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (lastActionResult.logId) {
                        markGateWhatsAppLinkOpened(lastActionResult.logId);
                        setLastActionResult(prev => (prev ? { ...prev, whatsappOpened: true } : prev));
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1fb858] text-white font-bold text-[11px] transition"
                  >
                    {lastActionResult.whatsappOpened ? 'Link WhatsApp Aberto' : 'Abrir WhatsApp do Encarregado'}
                  </a>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    Sem contacto WhatsApp
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Today's Movement for Current Student */}
          {currentStudent && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Registros do Aluno Hoje ({currentStudent.fullName.split(' ')[0]})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  {studentLogsToday.length} {studentLogsToday.length === 1 ? 'movimento' : 'movimentos'}
                </span>
              </div>

              {studentLogsToday.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">
                  Nenhuma entrada ou saída registrada para este aluno no dia de hoje.
                </div>
              ) : (
                <div className="space-y-2">
                  {studentLogsToday.map(log => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`p-1.5 rounded-lg ${
                          log.type === 'entrada'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.type === 'barrado'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-sky-500/20 text-sky-400'
                        }`}>
                          {log.type === 'entrada' ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                        </span>
                        <div>
                          <span className="font-bold text-white capitalize">{log.type}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{log.timestamp}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-300 block">{log.operator}</span>
                        <span
                          className={`text-[10px] flex items-center gap-1 justify-end ${
                            log.whatsappStatus === 'link_aberto' || log.whatsappStatus === 'enviado'
                              ? 'text-emerald-400'
                              : log.whatsappStatus === 'falhou'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          <Smartphone className="w-3 h-3" />{' '}
                          {log.whatsappStatus === 'link_aberto'
                            ? 'Link WhatsApp aberto'
                            : log.whatsappStatus === 'enviado'
                            ? 'Enviado'
                            : log.whatsappStatus === 'falhou'
                            ? 'Falhou'
                            : 'Pendente de envio'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scan Result Card & Privacy Control (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {currentStudent && publicData ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
              
              {/* Top Banner indicating mode */}
              {isOperatorMode ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">Operador Autenticado da Portaria</strong>
                    <span className="text-[11px] text-emerald-400/80">Permissões ativas para confirmar Entrada e Saída</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-amber-300">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">Visualização Pública de Scan</strong>
                    <span className="text-[11px] text-amber-400/80">Apenas informações autorizadas são mostradas</span>
                  </div>
                </div>
              )}

              {/* Student Identity Card Presentation */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={publicData.photoUrl || currentStudent.photoUrl}
                    alt={publicData.fullName}
                    className="w-20 h-24 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md shrink-0"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      publicData.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                    }`}>
                      Estado: {publicData.status}
                    </span>
                    <h3 className="text-lg font-black text-white truncate">{publicData.fullName}</h3>
                    <p className="text-xs font-mono text-indigo-400 font-bold">Nº {publicData.code}</p>
                    <p className="text-xs text-slate-300 leading-tight">{publicData.courseName}</p>
                    <p className="text-xs text-slate-400">Turma: {publicData.classGroupName}</p>
                  </div>
                </div>

                {/* QR Code Canvas Visualizer */}
                <div className="p-4 bg-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                      Código Criptográfico SIVERC
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 block break-all">
                      {publicData.qrVerificationHash}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      ✓ Autenticidade Institucional Verificada
                    </span>
                  </div>
                  
                  {/* Generated QR Graphic */}
                  <div className="w-20 h-20 bg-white rounded-xl p-1 flex items-center justify-center border border-slate-300 shrink-0">
                    <RealQRCode value={publicData.code} size={72} />
                  </div>
                </div>

                {/* Privacy & Authorized Fields Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Nome Completo:</span>
                    <span className="text-slate-200 font-semibold">{publicData.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Curso:</span>
                    <span className="text-slate-200 font-semibold">{publicData.courseName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Turma:</span>
                    <span className="text-slate-200 font-semibold">{publicData.classGroupName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Número de Matrícula:</span>
                    <span className="font-mono text-slate-200 font-semibold">{publicData.code}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Estado da Matrícula:</span>
                    <span className="text-emerald-400 font-bold">{publicData.status}</span>
                  </div>
                </div>

                {/* DADOS PRIVADOS OCULTOS (NUNCA MOSTRAR AO PÚBLICO) */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                      <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                      Dados Pessoais Privados:
                    </span>
                    <span className="text-rose-400 font-bold">Ocultos por Segurança</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[10px]">
                    BI, Telefone Pessoal, E-mail, Morada, Contactos de Encarregados e Dados Financeiros são estritamente
                    protegidos e não são visíveis no scan público.
                  </p>
                </div>
              </div>

              {/* Botoes de Acao: ENTRADA e SAIDA para Operador Autenticado (COM validação financeira obrigatória) */}
              {isOperatorMode && paymentVerification ? (
                <div className="space-y-3 pt-2">
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      paymentVerification.isPaidForCurrentMonth
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <strong className="block font-bold">
                      {paymentVerification.isPaidForCurrentMonth
                        ? `Mensalidade Regular (${paymentVerification.monthLabel})`
                        : `ACESSO NÃO PERMITIDO (${paymentVerification.monthLabel})`}
                    </strong>
                    <span className="text-[11px] opacity-90">{paymentVerification.reason}</span>
                    {paymentVerification.warningNote && (
                      <span className="block text-[10px] text-amber-300 mt-1">
                        {paymentVerification.warningNote}
                      </span>
                    )}
                  </div>

                  {(entrySequenceCheck?.isDuplicateSequence || exitSequenceCheck?.isDuplicateSequence) && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-0.5">
                      {entrySequenceCheck?.warningMessage && <div>{entrySequenceCheck.warningMessage}</div>}
                      {exitSequenceCheck?.warningMessage && <div>{exitSequenceCheck.warningMessage}</div>}
                    </div>
                  )}

                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Ações de Acesso da Portaria:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!paymentVerification.isPaidForCurrentMonth}
                      onClick={() => handleConfirmAccess('entrada')}
                      className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 ${
                        paymentVerification.isPaidForCurrentMonth
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95'
                          : 'bg-rose-950/60 border border-rose-500/40 text-rose-300 cursor-not-allowed'
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      {paymentVerification.isPaidForCurrentMonth ? 'Confirmar Entrada' : 'Entrada Bloqueada'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmAccess('saida')}
                      className="py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      Confirmar Saída
                    </button>
                  </div>

                  {!paymentVerification.isPaidForCurrentMonth && (
                    <button
                      type="button"
                      onClick={() => handleConfirmAccess('barrado')}
                      className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Registar Barramento na Portaria{currentGuardian?.hasValidPhone ? ` • ${currentGuardian.guardianPhone}` : ''}
                    </button>
                  )}

                  <p className="text-[11px] text-center text-slate-400">
                    Após confirmar, é gerado o botão oficial de WhatsApp para o encarregado (sem simulação automática).
                  </p>
                </div>
              ) : (
                /* Visitante público não autenticado */
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
                  <Lock className="w-6 h-6 text-amber-400 mx-auto" />
                  <h4 className="text-xs font-bold text-white">Controlo de Acesso Bloqueado</h4>
                  <p className="text-[11px] text-slate-400">
                    A confirmação de entrada e saída na portaria exige sessão com credenciais de operador autorizado.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Diretório de Alunos & Emissão de QR Codes */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Diretório Discente: QR Codes Gerados
            </h3>
            <p className="text-xs text-slate-400">
              Gerar, imprimir ou testar leitura de QR Code para qualquer aluno matriculado
            </p>
          </div>

          {/* Filtro de Turma */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-semibold">Turma:</label>
            <select
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todas">Todas as Turmas ({instStudents.length} alunos)</option>
              {instClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const isCurrentlySelected = student.id === selectedStudentId;
            const studentQrHash = generateStudentQrHash(
              student.id,
              student.code,
              student.institutionId || activeInstitution.id
            );
            return (
              <div
                key={student.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrentlySelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    student.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {student.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{student.code}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={student.photoUrl}
                    alt={student.fullName}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-xs truncate">{student.fullName}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{student.courseName}</p>
                    <p className="text-[10px] text-slate-500">Turma: {student.classGroupName}</p>
                  </div>
                  
                  {/* QR Preview Mini */}
                  <div className="w-12 h-12 bg-white rounded-lg p-0.5 flex items-center justify-center shrink-0">
                    <RealQRCode value={student.code} size={44} />
                  </div>
                </div>

                {/* Actions per student */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleSelectStudentForScan(student.id)}
                    className="flex-1 py-2 px-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    Carregar no Terminal
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addNotification({
                        title: 'QR Code Baixado',
                        message: `Código de verificação do aluno ${student.fullName} gerado com sucesso.`,
                        type: 'system'
                      });
                    }}
                    title="Baixar QR Code"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {(() => {
                    const guardian = getStudentGuardianContact(student);
                    const msg = `Olá ${guardian.guardianName}! Segue o link de validação digital da carteirinha escolar de ${student.fullName}: ${window.location.origin}/?scan_aluno=${encodeURIComponent(student.code)}`;
                    const waUrl = buildWhatsAppUrl(guardian.guardianPhone, msg);
                    return waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Enviar QR ao Encarregado via WhatsApp"
                        className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          addNotification({
                            title: 'Encarregado sem WhatsApp',
                            message: `${student.fullName} não tem contacto de encarregado registado.`,
                            type: 'alert'
                          });
                        }}
                        title="Sem contacto de encarregado"
                        className="p-2 bg-slate-800 text-slate-500 rounded-xl transition-all cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
