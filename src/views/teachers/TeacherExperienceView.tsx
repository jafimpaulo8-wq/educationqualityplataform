import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Video,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  School,
  BarChart3,
  UserCheck,
  XCircle,
  Send,
  Paperclip,
  Link as LinkIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassGroup, Student, ClassLesson, EvaluationItem } from '../../types';

export const TeacherExperienceView: React.FC = () => {
  const {
    activeInstitution,
    activeBranch,
    classes,
    students,
    courses,
    lessons,
    addLesson,
    saveAttendance,
    evaluations,
    addEvaluation,
    saveEvaluationScore,
    activeTeacher,
    addNotification,
    navigate
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'turmas'
    | 'aulas'
    | 'alunos'
    | 'presenca'
    | 'avaliacoes'
    | 'notas'
    | 'materiais'
    | 'chat'
    | 'online'
    | 'calendario'
  >('turmas');

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modais
  const [showNewLessonModal, setShowNewLessonModal] = useState(false);
  const [showNewEvaluationModal, setShowNewEvaluationModal] = useState(false);
  const [showUploadMaterialModal, setShowUploadMaterialModal] = useState(false);
  const [showNewOnlineClassModal, setShowNewOnlineClassModal] = useState(false);

  // Form states: Nova Aula
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonSummary, setNewLessonSummary] = useState('');
  const [newLessonDate, setNewLessonDate] = useState('2026-09-22');
  const [newLessonStartTime, setNewLessonStartTime] = useState('08:00');
  const [newLessonEndTime, setNewLessonEndTime] = useState('10:00');

  // Form states: Nova Avaliação
  const [newEvalTitle, setNewEvalTitle] = useState('');
  const [newEvalType, setNewEvalType] = useState<'teste' | 'trabalho' | 'exame'>('teste');
  const [newEvalWeight, setNewEvalWeight] = useState<number>(30);
  const [newEvalMaxScore, setNewEvalMaxScore] = useState<number>(20);
  const [newEvalDate, setNewEvalDate] = useState('2026-10-15');

  // Form states: Novo Material
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState('PDF');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');

  // Form states: Nova Aula Online
  const [onlineTitle, setOnlineTitle] = useState('Aula Prática Remota: Programação Reativa');
  const [onlinePlatform, setOnlinePlatform] = useState<'Google Meet' | 'Zoom' | 'Microsoft Teams'>('Google Meet');
  const [onlineUrl, setOnlineUrl] = useState('https://meet.google.com/sig-form-2026');
  const [onlineDate, setOnlineDate] = useState('2026-09-24 18:30');

  // Attendance in-memory state for selected lesson
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'presente' | 'falta_justificada' | 'falta_injustificada'>>({});

  // Chat in-memory state
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Eng. Arone Malendza', text: 'Boa tarde caros formandos! A aula de laboratório de amanhã será na Sala 104.', time: '14:20', isTeacher: true },
    { id: '2', sender: 'Lucas Macamo', text: 'Boa tarde professor! Precisamos levar os nossos notebooks com o Docker instalado?', time: '14:25', isTeacher: false },
    { id: '3', sender: 'Eng. Arone Malendza', text: 'Sim Lucas, ou utilizem as máquinas do laboratório já configuradas com Linux.', time: '14:28', isTeacher: true }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Materiais pedagógicos
  const [materialsList, setMaterialsList] = useState([
    { id: 'mat-1', title: 'Apostila 01: Algoritmos e Lógica Computacional', type: 'PDF', size: '3.4 MB', date: '15/09/2026', downloads: 28 },
    { id: 'mat-2', title: 'Slides de Aula: Estruturas de Dados em TypeScript', type: 'PPTX', size: '8.1 MB', date: '18/09/2026', downloads: 35 },
    { id: 'mat-3', title: 'Guia de Laboratório: Configuração de Containers Docker', type: 'PDF', size: '1.8 MB', date: '20/09/2026', downloads: 22 },
    { id: 'mat-4', title: 'Repositório de Exemplos Práticos no GitHub', type: 'LINK', size: 'Web', date: '21/09/2026', downloads: 44 }
  ]);

  // Selected Class Object
  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0] || null;
  }, [classes, selectedClassId]);

  // Filtered Students
  const classStudents = useMemo(() => {
    if (!selectedClass) return students.slice(0, 15);
    return students.filter(s => s.classGroupId === selectedClass.id || !s.classGroupId);
  }, [students, selectedClass]);

  // Filtered Lessons
  const classLessons = useMemo(() => {
    if (!selectedClass) return lessons;
    return lessons.filter(l => l.classGroupId === selectedClass.id);
  }, [lessons, selectedClass]);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Handle Attendance Save
  const handleSaveAttendance = () => {
    if (!classLessons[0]) {
      showFeedback('Por favor, crie uma aula antes de registrar presenças.');
      return;
    }
    const mappedAttendances: Record<string, boolean> = {};
    classStudents.forEach(s => {
      mappedAttendances[s.id] = (attendanceRecords[s.id] || 'presente') === 'presente';
    });
    saveAttendance(classLessons[0].id, mappedAttendances);
    showFeedback('Folha de presenças submetida e auditada com sucesso.');
    addNotification({
      title: 'Chamada Pedagógica Registrada',
      message: `Presenças da turma ${selectedClass?.name || ''} lançadas no diário de classe oficial.`,
      type: 'system'
    });
  };

  // Handle Create Lesson
  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !selectedClass) return;
    addLesson({
      institutionId: activeInstitution.id,
      branchId: activeBranch?.id,
      classGroupId: selectedClass.id,
      classGroupName: selectedClass.name,
      disciplineName: selectedClass.name,
      title: newLessonTitle,
      date: newLessonDate,
      time: `${newLessonStartTime} - ${newLessonEndTime}`,
      startTime: newLessonStartTime,
      endTime: newLessonEndTime,
      description: newLessonSummary || 'Conteúdo curricular programático',
      content: newLessonSummary || 'Conteúdo curricular programático',
      teacherName: activeTeacher?.fullName || 'Eng. Arone Malendza',
      materials: [],
      attendances: {}
    });
    setNewLessonTitle('');
    setNewLessonSummary('');
    setShowNewLessonModal(false);
    showFeedback('Aula lançada no diário de bordo com sucesso.');
  };

  // Handle Create Evaluation
  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvalTitle.trim() || !selectedClass) return;
    addEvaluation({
      institutionId: activeInstitution.id,
      branchId: activeBranch?.id,
      classGroupId: selectedClass.id,
      classGroupName: selectedClass.name,
      name: newEvalTitle,
      type: newEvalType,
      discipline: selectedClass.name,
      period: 'Semestre 1',
      maxScore: newEvalMaxScore,
      weight: newEvalWeight,
      date: newEvalDate,
      teacher: activeTeacher?.fullName || 'Eng. Arone Malendza',
      status: 'agendada',
      scores: {}
    });
    setNewEvalTitle('');
    setShowNewEvaluationModal(false);
    showFeedback('Avaliação cadastrada no plano pedagógico da turma.');
  };

  // Handle Send Chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        id: String(Date.now()),
        sender: activeTeacher?.fullName || 'Eng. Arone Malendza',
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTeacher: true
      }
    ]);
    setChatInput('');
  };

  // Handle Copy Link
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    showFeedback('Link da aula online copiado para a área de transferência.');
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* Top Teacher Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              Módulo 78: Experiência do Professor • {activeInstitution.code}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Portal do Docente &amp; Formador
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Gestão pedagógica das suas turmas, diário de aulas, chamada de presença, aplicação de avaliações, lançamento de notas, distribuição de materiais didáticos, chat com os alunos e salas virtuais.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-2 shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Docente Conectado:
            </div>
            <div className="text-sm font-black text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {activeTeacher?.fullName || 'Eng. Arone Malendza'}
            </div>
            <div className="text-[11px] text-indigo-300 font-medium">
              Especialidade: {activeTeacher?.specialty || 'Engenharia de Software & Redes'}
            </div>
          </div>
        </div>

        {/* 10 Pillars Tabs Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mt-8 pt-4 border-t border-slate-800">
          {[
            { id: 'turmas', label: '1. Turmas', icon: <School className="w-3.5 h-3.5" /> },
            { id: 'aulas', label: '2. Aulas', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'alunos', label: '3. Alunos', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'presenca', label: '4. Presença', icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: 'avaliacoes', label: '5. Avaliações', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'notas', label: '6. Notas', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'materiais', label: '7. Materiais', icon: <Upload className="w-3.5 h-3.5" /> },
            { id: 'chat', label: '8. Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: 'online', label: '9. Aulas Online', icon: <Video className="w-3.5 h-3.5" /> },
            { id: 'calendario', label: '10. Calendário', icon: <Calendar className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 p-2 rounded-xl font-bold text-xs transition-all cursor-pointer truncate ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-950/70 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Selector de Turma Ativa */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Turma em Foco:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shift} • Sala {c.room})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
            {classStudents.length} Formandos Matriculados
          </span>
          <button
            onClick={() => navigate('experiencia_diretor')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
          >
            Direção →
          </button>
        </div>
      </div>

      {/* 1. MINHAS TURMAS */}
      {activeTab === 'turmas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-4 ${
                  selectedClassId === c.id
                    ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase">
                    {c.shift}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Sala: {c.room}</span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Curso: {courses[0]?.name || 'Engenharia de Software'}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Progresso Curricular:</span>
                    <span className="text-indigo-400 font-bold">65%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[65%]" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    {c.studentIds?.length || 24} Alunos
                  </span>
                  <span className="text-emerald-400 font-bold">Em Andamento</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MINHAS AULAS (DIÁRIO DE BORDO) */}
      {activeTab === 'aulas' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Diário de Aulas &amp; Sumários ({selectedClass?.name})
              </h3>
              <p className="text-xs text-slate-400">Registro oficial de lições lecionadas e planejadas.</p>
            </div>
            <button
              onClick={() => setShowNewLessonModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Lançar Nova Aula</span>
            </button>
          </div>

          <div className="space-y-3">
            {classLessons.map((l) => (
              <div key={l.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">{l.title}</strong>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {Object.keys(l.attendances || {}).length > 0 ? 'REALIZADA' : 'AGENDADA'}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{l.date} ({l.time || `${l.startTime || '08:00'} - ${l.endTime || '10:00'}`})</span>
                </div>
                <p className="text-slate-300">{l.content || l.description}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Docente: {l.teacherName}</span>
                  <span className={Object.keys(l.attendances || {}).length > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                    {Object.keys(l.attendances || {}).length > 0 ? '✓ Chamada Realizada' : '⚠ Chamada Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ALUNOS */}
      {activeTab === 'alunos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Formandos Matriculados na Turma ({classStudents.length})
              </h3>
              <p className="text-xs text-slate-400">Ficha rápida e histórico de assiduidade por aluno.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {classStudents
              .filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((std) => (
                <div key={std.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">{std.code}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {std.status || 'Ativo'}
                    </span>
                  </div>
                  <strong className="text-white block text-sm">{std.fullName}</strong>
                  <div className="text-slate-400 text-[11px]">Telefone: {std.phone || '+258 84 000 0000'}</div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Assiduidade Geral:</span>
                    <span className="text-emerald-400 font-bold">92%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. PRESENÇA (CHAMADA DIÁRIA) */}
      {activeTab === 'presenca' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Chamada &amp; Controle Diário de Assiduidade
              </h3>
              <p className="text-xs text-slate-400">Turma: {selectedClass?.name} • Data: 22 de Setembro de 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const allP: Record<string, 'presente'> = {};
                  classStudents.forEach(s => { allP[s.id] = 'presente'; });
                  setAttendanceRecords(allP);
                  showFeedback('Todos os formandos marcados como presentes.');
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Marcar Todos Presentes
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                Salvar Chamada
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {classStudents.map((std) => {
              const currentStatus = attendanceRecords[std.id] || 'presente';
              return (
                <div key={std.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-white block">{std.fullName}</strong>
                    <span className="text-[10px] font-mono text-slate-400">{std.code}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAttendanceRecords({ ...attendanceRecords, [std.id]: 'presente' })}
                      className={`px-3 py-1 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
                        currentStatus === 'presente'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      Presente
                    </button>
                    <button
                      onClick={() => setAttendanceRecords({ ...attendanceRecords, [std.id]: 'falta_justificada' })}
                      className={`px-3 py-1 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
                        currentStatus === 'falta_justificada'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      Falta Just.
                    </button>
                    <button
                      onClick={() => setAttendanceRecords({ ...attendanceRecords, [std.id]: 'falta_injustificada' })}
                      className={`px-3 py-1 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
                        currentStatus === 'falta_injustificada'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      Falta Injust.
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. AVALIAÇÕES */}
      {activeTab === 'avaliacoes' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Plano de Avaliações ({selectedClass?.name})
              </h3>
              <p className="text-xs text-slate-400">Testes, trabalhos práticos, mini-testes e exames.</p>
            </div>
            <button
              onClick={() => setShowNewEvaluationModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              + Nova Avaliação
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.map((ev) => (
              <div key={ev.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase">
                    {ev.type}
                  </span>
                  <span className="text-slate-400 text-[11px]">Data: {ev.date}</span>
                </div>
                <div>
                  <strong className="text-white block text-sm">{ev.name}</strong>
                  <span className="text-slate-400">Disciplina: {ev.discipline}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Peso: <strong className="text-white">{ev.weight}%</strong></span>
                  <span className="text-slate-400">Nota Máxima: <strong className="text-emerald-400">{ev.maxScore} val.</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. NOTAS */}
      {activeTab === 'notas' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Pauta &amp; Lançamento de Notas dos Alunos
              </h3>
              <p className="text-xs text-slate-400">Média ponderada oficial com escala de 0 a 20 valores.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Estudante</th>
                  <th className="p-3 text-center">Teste 01 (30%)</th>
                  <th className="p-3 text-center">Trabalho (30%)</th>
                  <th className="p-3 text-center">Exame (40%)</th>
                  <th className="p-3 text-center">Média Final</th>
                  <th className="p-3 text-right">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {classStudents.slice(0, 8).map((std, idx) => {
                  const t1 = 14 + (idx % 5);
                  const trab = 15 + (idx % 4);
                  const exame = 13 + (idx % 6);
                  const media = ((t1 * 0.3) + (trab * 0.3) + (exame * 0.4)).toFixed(1);
                  return (
                    <tr key={std.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-white">
                        <div>{std.fullName}</div>
                        <span className="text-[10px] font-mono text-cyan-400">{std.code}</span>
                      </td>
                      <td className="p-3 text-center font-mono text-white">{t1}.0</td>
                      <td className="p-3 text-center font-mono text-white">{trab}.0</td>
                      <td className="p-3 text-center font-mono text-white">{exame}.0</td>
                      <td className="p-3 text-center font-mono font-black text-emerald-400">{media}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          Aprovado
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. MATERIAIS */}
      {activeTab === 'materiais' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                Materiais Didáticos &amp; Recursos de Estudo
              </h3>
              <p className="text-xs text-slate-400">Arquivos disponibilizados diretamente no portal dos formandos.</p>
            </div>
            <button
              onClick={() => setShowUploadMaterialModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              + Publicar Material
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {materialsList.map((m) => (
              <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <strong className="text-white block">{m.title}</strong>
                  <span className="text-slate-400 text-[11px]">Formato: {m.type} • Tamanho: {m.size} • Publicado em {m.date}</span>
                </div>
                <button
                  onClick={() => showFeedback(`Download iniciado: ${m.title}`)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. CHAT COM A TURMA */}
      {activeTab === 'chat' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Chat &amp; Dúvidas da Turma ({selectedClass?.name})
            </h3>
            <p className="text-xs text-slate-400">Canal direto de comunicação síncrona com os alunos.</p>
          </div>

          <div className="h-64 overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isTeacher ? 'items-end' : 'items-start'}`}
              >
                <div className={`p-3 rounded-2xl max-w-md ${
                  msg.isTeacher ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}>
                  <span className="text-[10px] font-bold block opacity-75 mb-1">{msg.sender}</span>
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">{msg.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Digite uma mensagem ou aviso para os alunos..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      )}

      {/* 9. AULAS ONLINE */}
      {activeTab === 'online' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                Salas de Aula Virtuais (Google Meet &amp; Zoom)
              </h3>
              <p className="text-xs text-slate-400">Transmissão síncrona e sessões remotas de mentoria.</p>
            </div>
            <button
              onClick={() => setShowNewOnlineClassModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              + Agendar Aula Virtual
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                  Sessão Ativa
                </span>
                <h4 className="text-lg font-black text-white mt-1">{onlineTitle}</h4>
                <p className="text-xs text-slate-400">Plataforma: {onlinePlatform} • Agendado para: {onlineDate}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyLink(onlineUrl)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
                <a
                  href={onlineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Video className="w-4 h-4" />
                  <span>Entrar na Sala Virtual →</span>
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 truncate">
              {onlineUrl}
            </div>
          </div>
        </div>
      )}

      {/* 10. CALENDÁRIO ACADÊMICO */}
      {activeTab === 'calendario' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Grade Semanal &amp; Cronograma de Aulas
            </h3>
            <p className="text-xs text-slate-400">Horários alocados para o docente ao longo do semestre letivo.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'].map((dia, idx) => (
              <div key={dia} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <strong className="text-indigo-400 block font-black border-b border-slate-800 pb-1">{dia}</strong>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono">08:00 - 10:00</span>
                  <div className="text-white font-bold">{classes[0]?.name || 'Turma A'}</div>
                  <span className="text-[10px] text-cyan-300">Sala 104 • Teórica</span>
                </div>
                {idx % 2 === 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">10:30 - 12:30</span>
                    <div className="text-white font-bold">Laboratório Prático</div>
                    <span className="text-[10px] text-emerald-300">Lab de TI 02</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: NOVA AULA */}
      {showNewLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Lançar Sumário de Aula
              </h4>
              <button onClick={() => setShowNewLessonModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateLesson} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Título da Aula</label>
                <input
                  type="text"
                  placeholder="Ex: Introdução a Microsserviços e APIs REST"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Sumário / Tópicos Abordados</label>
                <textarea
                  placeholder="Conteúdos programáticos e exercícios lecionados..."
                  value={newLessonSummary}
                  onChange={(e) => setNewLessonSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold h-20"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Data</label>
                  <input
                    type="date"
                    value={newLessonDate}
                    onChange={(e) => setNewLessonDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Início</label>
                  <input
                    type="time"
                    value={newLessonStartTime}
                    onChange={(e) => setNewLessonStartTime(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Fim</label>
                  <input
                    type="time"
                    value={newLessonEndTime}
                    onChange={(e) => setNewLessonEndTime(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLessonModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Salvar Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA AVALIAÇÃO */}
      {showNewEvaluationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Cadastrar Nova Avaliação
              </h4>
              <button onClick={() => setShowNewEvaluationModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateEvaluation} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Título da Avaliação</label>
                <input
                  type="text"
                  placeholder="Ex: Teste Teórico 02: Banco de Dados"
                  value={newEvalTitle}
                  onChange={(e) => setNewEvalTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipo</label>
                  <select
                    value={newEvalType}
                    onChange={(e) => setNewEvalType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  >
                    <option value="teste">Teste Escrito</option>
                    <option value="trabalho">Trabalho Prático</option>
                    <option value="exame">Exame Final</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Peso (%)</label>
                  <input
                    type="number"
                    value={newEvalWeight}
                    onChange={(e) => setNewEvalWeight(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Data Prevista</label>
                <input
                  type="date"
                  value={newEvalDate}
                  onChange={(e) => setNewEvalDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEvaluationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Criar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO MATERIAL */}
      {showUploadMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                Publicar Material de Aula
              </h4>
              <button onClick={() => setShowUploadMaterialModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newMaterialTitle.trim()) return;
              setMaterialsList([
                ...materialsList,
                {
                  id: String(Date.now()),
                  title: newMaterialTitle,
                  type: newMaterialType,
                  size: '4.2 MB',
                  date: '22/09/2026',
                  downloads: 0
                }
              ]);
              setNewMaterialTitle('');
              setShowUploadMaterialModal(false);
              showFeedback('Material pedagógico publicado para os formandos da turma.');
            }} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Título do Documento</label>
                <input
                  type="text"
                  placeholder="Ex: Ficha de Exercícios Preparatórios 02"
                  value={newMaterialTitle}
                  onChange={(e) => setNewMaterialTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Arquivo</label>
                <select
                  value={newMaterialType}
                  onChange={(e) => setNewMaterialType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                >
                  <option value="PDF">PDF (Apostila / Ficha)</option>
                  <option value="PPTX">Apresentação de Slides</option>
                  <option value="ZIP">Arquivo Compactado (Códigos / Laboratório)</option>
                  <option value="LINK">Link Web / Repositório Git</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadMaterialModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Publicar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA AULA ONLINE */}
      {showNewOnlineClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                Agendar Sala Virtual de Aula
              </h4>
              <button onClick={() => setShowNewOnlineClassModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowNewOnlineClassModal(false);
              showFeedback(`Aula virtual agendada via ${onlinePlatform}. Link compartilhado com os alunos.`);
            }} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Título da Sessão Remota</label>
                <input
                  type="text"
                  value={onlineTitle}
                  onChange={(e) => setOnlineTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Plataforma</label>
                <select
                  value={onlinePlatform}
                  onChange={(e) => setOnlinePlatform(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom Meetings</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Link da Sala Virtual</label>
                <input
                  type="url"
                  value={onlineUrl}
                  onChange={(e) => setOnlineUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOnlineClassModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Salvar e Notificar Alunos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
