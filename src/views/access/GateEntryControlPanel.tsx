import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  QrCode, 
  Scan, 
  CheckCircle2, 
  Clock, 
  User, 
  LogIn, 
  LogOut, 
  Smartphone, 
  Search, 
  MapPin, 
  Building, 
  AlertTriangle, 
  Filter, 
  Printer, 
  Download, 
  Send, 
  Calendar,
  Layers,
  Settings,
  UserCheck
} from 'lucide-react';
import { Student } from '../../types';
import { isAuthorizedGateOperator } from '../../utils/studentQrSecurity';

export const GateEntryControlPanel: React.FC = () => {
  const { 
    students, 
    classes, 
    activeInstitution, 
    activeRole, 
    firebaseUser,
    logGateAccess, 
    accessLogs, 
    openWhatsAppMessage,
    addNotification
  } = useApp();

  // Selected Gate Location (ex: Portão Principal, Portaria Sul, Recepção Central)
  const [selectedLocation, setSelectedLocation] = useState('Portão Principal');
  const [customLocationInput, setCustomLocationInput] = useState('');
  const [isCustomLocation, setIsCustomLocation] = useState(false);

  // Operation Mode: ENTRADA ou SAÍDA
  const [currentMode, setCurrentMode] = useState<'entrada' | 'saida'>('entrada');
  
  // Notification Toggle
  const [sendGuardianNotification, setSendGuardianNotification] = useState(true);

  // Scanner & Student Identification
  const [qrOrCodeInput, setQrOrCodeInput] = useState('');
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(students[0] || null);
  const [isScanningActive, setIsScanningActive] = useState(false);

  // Filter for Movement Log
  const [filterType, setFilterType] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [searchLogQuery, setSearchLogQuery] = useState('');

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const operatorName = firebaseUser?.displayName || (
    (activeRole as string) === 'superadmin' ? 'Super Administrador' :
    (activeRole as string) === 'admin' ? 'Administrador' :
    (activeRole as string) === 'secretaria' ? 'Secretaria Geral' : 'Operador da Portaria'
  );

  const activeGateLocation = isCustomLocation && customLocationInput.trim() 
    ? customLocationInput.trim() 
    : selectedLocation;

  // Last Access Action Banner
  const [lastAction, setLastAction] = useState<{
    student: Student;
    type: 'entrada' | 'saida';
    date: string;
    time: string;
    operator: string;
    institution: string;
    location: string;
    message: string;
  } | null>(null);

  // Search or identify student from QR / code
  const handleIdentifyStudent = (searchVal: string) => {
    if (!searchVal.trim()) return;
    setIsScanningActive(true);

    setTimeout(() => {
      // Find by exact code, partial code, or student name
      const cleanVal = searchVal.trim().toLowerCase();
      const found = students.find(s => 
        s.code.toLowerCase() === cleanVal ||
        s.fullName.toLowerCase().includes(cleanVal) ||
        cleanVal.includes(s.code.toLowerCase())
      );

      if (found) {
        setIdentifiedStudent(found);
        setQrOrCodeInput('');
      } else {
        addNotification({
          title: 'Aluno Não Identificado',
          message: `Nenhum estudante encontrado com o código/QR "${searchVal}".`,
          type: 'alert'
        });
      }
      setIsScanningActive(false);
    }, 350);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleIdentifyStudent(qrOrCodeInput);
  };

  // Confirm Access (ENTRADA ou SAÍDA)
  const handleConfirmAccess = (type: 'entrada' | 'saida') => {
    if (!identifiedStudent) {
      addNotification({
        title: 'Nenhum Aluno Selecionado',
        message: 'Apresente o QR Code ou selecione um aluno para confirmar o acesso.',
        type: 'alert'
      });
      return;
    }

    const log = logGateAccess(
      identifiedStudent.id, 
      type, 
      activeGateLocation, 
      operatorName, 
      sendGuardianNotification
    );

    if (log) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-MZ');
      const timeStr = now.toLocaleTimeString('pt-MZ');
      const hourOnly = now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });

      // Mensagem padronizada conforme especificação do Módulo 28:
      // "O aluno [NOME] entrou na instituição às [HORA]."
      const standardMsg = type === 'entrada'
        ? `O aluno ${identifiedStudent.fullName} entrou na instituição às ${hourOnly}.`
        : `O aluno ${identifiedStudent.fullName} saiu da instituição às ${hourOnly}.`;

      setLastAction({
        student: identifiedStudent,
        type,
        date: dateStr,
        time: timeStr,
        operator: operatorName,
        institution: activeInstitution.name,
        location: activeGateLocation,
        message: standardMsg
      });
    }
  };

  // Filter logs
  const filteredLogs = accessLogs.filter(log => {
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
                  Painel de Controlo de Entrada & Saída
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Painel operacional da portaria e secretaria. Identificação instantânea por leitura de QR Code, 
              homologação de acesso com registro de utilizador, data, hora, instituição e local, com envio 
              automático de notificação ao encarregado.
            </p>
          </div>

          {/* Operator and Live Clock Card */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 self-start lg:self-auto min-w-[280px]">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Operador em Sessão:</span>
              </div>
              <div className="font-bold text-white text-sm">{operatorName}</div>
              <div className="text-[11px] text-emerald-400 font-medium">{activeInstitution.name}</div>
            </div>
            <div className="text-right border-l border-slate-800 pl-4">
              <div className="text-xs text-slate-400 flex items-center gap-1 justify-end font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {currentTime.toLocaleTimeString('pt-MZ')}
              </div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">
                {currentTime.toLocaleDateString('pt-MZ', { weekday: 'short', day: '2-digit', month: 'short' })}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Bar: Location & Notification Settings */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Selector */}
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
                <option value="Bloco Técnico & Oficinas">Bloco Técnico & Oficinas</option>
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

          {/* Mode Switcher: Entrada vs Saída */}
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
                  currentMode === 'entrada'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                ENTRADA
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('saida')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentMode === 'saida'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                SAÍDA
              </button>
            </div>
          </div>

          {/* Guardian Notification Toggle */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Notificação ao Encarregado (WhatsApp):
            </label>
            <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-300">Disparo automático</span>
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
        
        {/* Left 7 Cols: Passos 1 e 2 - Apresentação de QR & Identificação */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Box de Entrada Óptica de QR / Busca */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Passo 1: Aluno Apresenta QR Code</h2>
                  <p className="text-xs text-slate-500">Leitor laser, câmera ou digitação da matrícula</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                Ponto: {activeGateLocation}
              </span>
            </div>

            {/* Simulated Optical Viewfinder */}
            <div className="relative border-2 border-dashed border-indigo-200 bg-indigo-50/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center overflow-hidden">
              {isScanningActive && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-bounce shadow-md shadow-emerald-500/50" />
              )}

              <div className="w-20 h-20 bg-white rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-center mb-3 text-indigo-600">
                <QrCode className={`w-12 h-12 ${isScanningActive ? 'animate-pulse text-emerald-600' : ''}`} />
              </div>

              <h3 className="font-bold text-slate-800 text-sm">Aproxime a Carteirinha Discente</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Ao posicionar o QR Code no leitor, o sistema identifica instantaneamente o aluno e valida sua matrícula.
              </p>

              {/* Botões de Simulação Rápida */}
              <div className="mt-4 pt-3 border-t border-indigo-100/80 w-full">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                  Identificar Aluno em 1 Clique (Simulador):
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {students.slice(0, 6).map(s => {
                    const isCurrent = identifiedStudent?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleIdentifyStudent(s.code)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{s.fullName.split(' ')[0]}</span>
                        <span className="text-[10px] font-mono text-slate-400">({s.code.slice(-4)})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Input Manual / Leitor de Código de Barras USB */}
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

          {/* Passo 2: Aluno Identificado com Sucesso */}
          {identifiedStudent && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Passo 2: Sistema Identifica Aluno</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  identifiedStudent.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Estado: {identifiedStudent.status}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <img
                  src={identifiedStudent.photoUrl}
                  alt={identifiedStudent.fullName}
                  className="w-20 h-24 rounded-2xl object-cover border-2 border-slate-300 shadow-sm shrink-0"
                />
                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 truncate">{identifiedStudent.fullName}</h4>
                  <p className="text-xs font-mono font-bold text-indigo-700">Matrícula: {identifiedStudent.code}</p>
                  <p className="text-xs text-slate-600 font-medium">Curso: {identifiedStudent.courseName}</p>
                  <p className="text-xs text-slate-500">Turma: {identifiedStudent.classGroupName}</p>

                  <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span>Encarregado: <strong>{identifiedStudent.guardianName || 'Não registrado'}</strong></span>
                    <span>Contacto: <strong>{identifiedStudent.guardianPhone || identifiedStudent.phone}</strong></span>
                  </div>
                </div>
              </div>

              {/* Passo 3: Confirmação de Entrada / Saída */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Passo 3: Utilizador Autorizado Confirma:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Operador: <strong className="text-slate-800">{operatorName}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleConfirmAccess('entrada')}
                    className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Confirmar Entrada
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmAccess('saida')}
                    className="py-3.5 px-4 bg-sky-600 hover:bg-sky-500 active:scale-98 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-sky-700/20 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Confirmar Saída
                  </button>
                </div>

                {sendGuardianNotification && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Mensagem formatada ao encarregado: <em>"O aluno {identifiedStudent.fullName} {currentMode === 'entrada' ? 'entrou na' : 'saiu da'} instituição às {currentTime.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}."</em>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Comprovativo de Confirmação & Dados Registrados */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card de Acesso Confirmado */}
          {lastAction ? (
            <div className={`p-6 rounded-3xl border-2 shadow-md space-y-5 animate-in fade-in duration-300 ${
              lastAction.type === 'entrada'
                ? 'bg-emerald-50/80 border-emerald-500/40 text-emerald-950'
                : 'bg-sky-50/80 border-sky-500/40 text-sky-950'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span className="font-black text-sm uppercase tracking-wider">
                    {lastAction.type === 'entrada' ? 'ENTRADA HOMOLOGADA' : 'SAÍDA REGISTRADA'}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg">
                  {lastAction.time}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={lastAction.student.photoUrl}
                  alt={lastAction.student.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{lastAction.student.fullName}</h4>
                  <p className="text-xs font-mono text-slate-600">{lastAction.student.code}</p>
                  <p className="text-[11px] text-slate-500">{lastAction.student.courseName}</p>
                </div>
              </div>

              {/* Registro Completo Solicitado: Aluno, Data, Hora, Utilizador, Instituição, Local */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
                  Dados Homologados no Registro de Acesso:
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Aluno:</span>
                  <span className="font-bold text-slate-900">{lastAction.student.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data:</span>
                  <span className="font-mono font-bold text-slate-900">{lastAction.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hora:</span>
                  <span className="font-mono font-bold text-slate-900">{lastAction.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Utilizador:</span>
                  <span className="font-bold text-slate-900">{lastAction.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Instituição:</span>
                  <span className="font-bold text-slate-900">{lastAction.institution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Local da Portaria:</span>
                  <span className="font-bold text-slate-900">{lastAction.location}</span>
                </div>
              </div>

              {/* Notificação Enviada */}
              {sendGuardianNotification && (
                <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      Notificação ao Responsável
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Enviado ✓
                    </span>
                  </div>
                  <p className="text-slate-600 italic text-[11px]">
                    "{lastAction.message}"
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Destinatário: {lastAction.student.guardianName || 'Encarregado'} ({lastAction.student.guardianPhone || lastAction.student.phone})
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Aguardando Próxima Leitura</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Assim que o QR Code for apresentado e a entrada ou saída for confirmada, o comprovativo 
                com todos os dados aparecerá aqui.
              </p>
            </div>
          )}

          {/* Acesso Rápido a Diretório de Carteirinhas */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900">Carteirinhas & Lote de Alunos</h4>
              <p className="text-[11px] text-slate-500">Imprimir cartões discentes formatados em A4</p>
            </div>
            <button
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
              Registros Recentes de Portaria ({activeGateLocation})
            </h3>
            <p className="text-xs text-slate-500">Entradas e saídas registradas com data, hora, utilizador e envio ao responsável</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Type */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setFilterType('todos')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterType === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Todos ({accessLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('entrada')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterType === 'entrada' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Entradas
              </button>
              <button
                type="button"
                onClick={() => setFilterType('saida')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterType === 'saida' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Saídas
              </button>
            </div>

            {/* Search */}
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

        {/* Tabela de Registros */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Aluno</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Data & Hora</th>
                <th className="pb-3">Utilizador (Operador)</th>
                <th className="pb-3">Instituição & Local</th>
                <th className="pb-3">Notificação WhatsApp</th>
                <th className="pb-3 text-right pr-2">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={log.photoUrl}
                        alt={log.studentName}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{log.studentName}</span>
                        <span className="text-[11px] font-mono text-slate-500">{log.studentCode}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      log.type === 'entrada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {log.type === 'entrada' ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                      {log.type === 'entrada' ? 'ENTRADA' : 'SAÍDA'}
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
                    <span className="text-[10px] text-slate-400">{log.institutionName || activeInstitution.name}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <div>
                        <span className="text-[11px] font-semibold text-slate-700 block">
                          {log.guardianName}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Mensagem enviada
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right pr-2">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = log.notificationMessage || (
                          log.type === 'entrada'
                            ? `O aluno ${log.studentName} entrou na instituição às ${log.time || log.timestamp}.`
                            : `O aluno ${log.studentName} saiu da instituição às ${log.time || log.timestamp}.`
                        );
                        openWhatsAppMessage(log.guardianPhone, msg);
                      }}
                      title="Reenviar Notificação WhatsApp"
                      className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
