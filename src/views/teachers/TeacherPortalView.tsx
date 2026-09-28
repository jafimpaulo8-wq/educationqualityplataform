import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  FileText, 
  Paperclip, 
  Video, 
  VideoOff, 
  Share2, 
  Download, 
  Search, 
  Filter, 
  MessageSquare, 
  FileUp, 
  Award, 
  ClipboardCheck, 
  Sparkles, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  Printer,
  Radio,
  FileArchive,
  FileCode,
  Link as LinkIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Teacher, ClassGroup, Student, ClassLesson, LessonMaterial } from '../../types';

export const TeacherPortalView: React.FC = () => {
  const { 
    teachers, 
    activeTeacher, 
    setActiveTeacherId, 
    teacherAssignedClasses, 
    teacherAssignedStudents, 
    teacherAssignedSchedules, 
    teacherAssignedLessons, 
    addLesson, 
    updateLesson,
    deleteLesson,
    saveAttendance, 
    saveStudentAssessmentScore,
    activeInstitution,
    openWhatsAppMessage,
    addNotification,
    navigate
  } = useApp();

  // Selected sub-view
  const [activeTab, setActiveTab] = useState<'turmas' | 'alunos' | 'aulas' | 'presenca' | 'pauta' | 'comunicacao' | 'online'>('turmas');

  // Selected entities
  const [selectedClassId, setSelectedClassId] = useState<string>(teacherAssignedClasses[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(teacherAssignedLessons[0]?.id || '');

  // Modal States
  const [isCreatingLessonModal, setIsCreatingLessonModal] = useState(false);
  const [isScoringModal, setIsScoringModal] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // New Lesson Form State
  const [newLessonData, setNewLessonData] = useState({
    classGroupId: teacherAssignedClasses[0]?.id || '',
    disciplineName: activeTeacher?.disciplineNames?.[0] || 'Módulo Principal',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '10:30',
    description: '',
    content: '',
    onlineMeetingUrl: 'https://meet.google.com/new',
    isLiveOnline: false,
    materials: [
      {
        id: `mat-${Date.now()}-1`,
        title: 'Apostila Teórica da Aula',
        type: 'pdf' as const,
        url: '#',
        size: '2.8 MB',
        fileName: 'apostila_aula.pdf'
      }
    ] as LessonMaterial[]
  });

  // Material attachment input
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState<'pdf' | 'zip' | 'slides' | 'doc' | 'link'>('pdf');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');

  // Attendance Form State (Roll Call)
  const currentLessonForAttendance = teacherAssignedLessons.find(l => l.id === selectedLessonId) || teacherAssignedLessons[0];
  const studentsInCurrentLessonClass = teacherAssignedStudents.filter(s => 
    s.classGroupId === (currentLessonForAttendance?.classGroupId || selectedClassId)
  );
  const [rollCallAttendances, setRollCallAttendances] = useState<{ [studentId: string]: boolean }>({});

  // When selectedLessonId changes, initialize roll call from lesson data
  React.useEffect(() => {
    if (currentLessonForAttendance?.attendances) {
      const boolMap: { [studentId: string]: boolean } = {};
      Object.entries(currentLessonForAttendance.attendances).forEach(([stId, val]) => {
        boolMap[stId] = val === true || val === 'presente' || val === 'atraso';
      });
      setRollCallAttendances(boolMap);
    } else {
      // Default all present
      const initial: { [studentId: string]: boolean } = {};
      studentsInCurrentLessonClass.forEach(s => {
        initial[s.id] = true;
      });
      setRollCallAttendances(initial);
    }
  }, [selectedLessonId, currentLessonForAttendance]);

  // Assessment & Grading State
  const [assessmentTitle, setAssessmentTitle] = useState('Teste Teórico 1');
  const [assessmentModule, setAssessmentModule] = useState(activeTeacher?.disciplineNames?.[0] || 'Módulo Principal');
  const [assessmentWeight, setAssessmentWeight] = useState(30);
  const [assessmentMaxScore, setAssessmentMaxScore] = useState(20);
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentScores, setStudentScores] = useState<{ [studentId: string]: number }>({});

  // Message Broadcast State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'turma' | 'individual'>('turma');

  // Helpers
  const currentClass = teacherAssignedClasses.find(c => c.id === selectedClassId) || teacherAssignedClasses[0];

  const handleAddMaterialToNewLesson = () => {
    if (!newMaterialTitle) return;
    const item: LessonMaterial = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: newMaterialTitle,
      type: newMaterialType,
      url: newMaterialUrl || '#',
      size: newMaterialType === 'zip' ? '12.4 MB' : newMaterialType === 'pdf' ? '3.5 MB' : '1.0 MB',
      fileName: `${newMaterialTitle.toLowerCase().replace(/\s+/g, '_')}.${newMaterialType === 'pdf' ? 'pdf' : newMaterialType === 'zip' ? 'zip' : 'file'}`
    };
    setNewLessonData(prev => ({
      ...prev,
      materials: [...prev.materials, item]
    }));
    setNewMaterialTitle('');
    setNewMaterialUrl('');
  };

  const handleRemoveMaterial = (matId: string) => {
    setNewLessonData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== matId)
    }));
  };

  const handleSaveNewLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonData.title || !newLessonData.classGroupId) return;

    const targetClass = teacherAssignedClasses.find(c => c.id === newLessonData.classGroupId);
    
    // Initial attendance default for all enrolled students
    const targetStudents = teacherAssignedStudents.filter(s => s.classGroupId === newLessonData.classGroupId);
    const initialAtt: { [studentId: string]: boolean } = {};
    targetStudents.forEach(s => {
      initialAtt[s.id] = true;
    });

    addLesson({
      institutionId: activeInstitution.id,
      classGroupId: newLessonData.classGroupId,
      classGroupName: targetClass?.name || 'Turma Atribuída',
      courseId: targetClass?.courseId,
      courseName: targetClass?.courseName,
      disciplineName: newLessonData.disciplineName,
      teacherId: activeTeacher?.id,
      teacherName: activeTeacher?.fullName || 'Docente Titular',
      title: newLessonData.title,
      date: newLessonData.date,
      startTime: newLessonData.startTime,
      endTime: newLessonData.endTime,
      description: newLessonData.description,
      content: newLessonData.content,
      materials: newLessonData.materials,
      attendances: initialAtt,
      totalPresent: targetStudents.length,
      totalAbsent: 0,
      onlineMeetingUrl: newLessonData.onlineMeetingUrl,
      isLiveOnline: newLessonData.isLiveOnline,
      status: 'concluida'
    });

    setIsCreatingLessonModal(false);
    setNewLessonData(prev => ({ ...prev, title: '', description: '', content: '' }));
  };

  const handleSaveCurrentAttendance = () => {
    if (!currentLessonForAttendance) return;
    saveAttendance(currentLessonForAttendance.id, rollCallAttendances);
  };

  const handleSaveBulkScores = (e: React.FormEvent) => {
    e.preventDefault();
    const studentsInSelected = teacherAssignedStudents.filter(s => s.classGroupId === selectedClassId);

    studentsInSelected.forEach(s => {
      const score = studentScores[s.id] !== undefined ? studentScores[s.id] : 14;
      saveStudentAssessmentScore({
        classGroupId: selectedClassId,
        studentId: s.id,
        assessmentTitle,
        moduleName: assessmentModule,
        weight: assessmentWeight,
        maxScore: assessmentMaxScore,
        score,
        date: assessmentDate,
        teacherName: activeTeacher?.fullName
      });
    });

    setIsScoringModal(false);
  };

  const handleLaunchOnlineClass = (lesson?: ClassLesson) => {
    const meetingUrl = lesson?.onlineMeetingUrl || 'https://meet.google.com/new';
    setIsLiveActive(true);
    addNotification({
      title: '🔴 Aula Online Iniciada',
      message: `A sala virtual para a turma ${currentClass?.name || 'sua turma'} foi aberta. Alunos notificados.`,
      type: 'system'
    });
    window.open(meetingUrl, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Teacher Identity & Scoped Context */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={activeTeacher?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={activeTeacher?.fullName || 'Docente'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg shadow-emerald-950/40"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeTeacher?.fullName || 'Portal do Professor'}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                  {activeTeacher?.type === 'formador' ? 'Formador Técnico' : 'Professor Titular'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {activeTeacher?.code || 'DOC-2026'}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Especialidade: <span className="text-emerald-400 font-medium">{activeTeacher?.specialty}</span> • {activeInstitution.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Regra de Acesso: Acesso estrito apenas às turmas, alunos e diários sob sua responsabilidade.
              </p>
            </div>
          </div>

          {/* Teacher Selector for Admin / Multi-Teacher Simulation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-1.5 flex items-center gap-2">
              <span className="text-[11px] text-slate-400 pl-2 font-medium">Perfil Docente:</span>
              <select
                value={activeTeacher?.id || ''}
                onChange={e => setActiveTeacherId(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none pr-3 py-1 cursor-pointer"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.fullName} ({t.specialty})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsCreatingLessonModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Nova Aula</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Turmas Atribuídas</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{teacherAssignedClasses.length}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Total de Alunos</span>
            <span className="text-xl font-bold text-sky-400 mt-0.5 block">{teacherAssignedStudents.length}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Aulas Registradas</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5 block">{teacherAssignedLessons.length}</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Aulas Semanais</span>
            <span className="text-xl font-bold text-violet-400 mt-0.5 block">{teacherAssignedSchedules.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('turmas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'turmas'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Ver Turmas ({teacherAssignedClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alunos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'alunos'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Ver Alunos ({teacherAssignedStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('aulas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'aulas'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Diário de Aulas & Materiais ({teacherAssignedLessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('presenca')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'presenca'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Registrar Presença</span>
        </button>

        <button
          onClick={() => setActiveTab('pauta')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'pauta'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Lançar Notas & Pauta</span>
        </button>

        <button
          onClick={() => setActiveTab('comunicacao')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'comunicacao'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comunicar com Alunos</span>
        </button>

        <button
          onClick={() => setActiveTab('online')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'online'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Radio className="w-4 h-4 text-cyan-400" />
          <span>Iniciar Aula Online</span>
        </button>
      </div>

      {/* TAB 1: VER TURMAS ATRIBUÍDAS */}
      {activeTab === 'turmas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Turmas Atribuídas ao Docente</span>
            </h2>
            <span className="text-xs text-slate-400">
              Visualização restrita às turmas sob sua docência
            </span>
          </div>

          {teacherAssignedClasses.length === 0 ? (
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-medium">Nenhuma turma atribuída a este professor.</p>
              <p className="text-xs text-slate-500 mt-1">A Direção Pedagógica deve alocar turmas a este perfil.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherAssignedClasses.map(turma => {
                const enrolledStudents = teacherAssignedStudents.filter(s => s.classGroupId === turma.id);
                const classLessons = teacherAssignedLessons.filter(l => l.classGroupId === turma.id);

                return (
                  <div
                    key={turma.id}
                    className="p-5 bg-slate-900/70 border border-slate-800/90 rounded-2xl flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {turma.shift}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Sala: {turma.room}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mt-3">
                        {turma.name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Curso: {turma.courseName}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                        <div className="bg-slate-950/60 p-2.5 rounded-xl">
                          <span className="text-[11px] text-slate-500 block">Formandos</span>
                          <span className="font-semibold text-white mt-0.5 block">
                            {enrolledStudents.length} / {turma.capacity || 25}
                          </span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-xl">
                          <span className="text-[11px] text-slate-500 block">Aulas Dadas</span>
                          <span className="font-semibold text-amber-400 mt-0.5 block">
                            {classLessons.length} registradas
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedClassId(turma.id);
                          setActiveTab('alunos');
                        }}
                        className="flex-1 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg text-center transition-colors cursor-pointer"
                      >
                        Ver Alunos
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClassId(turma.id);
                          setActiveTab('pauta');
                        }}
                        className="flex-1 py-1.5 px-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium rounded-lg text-center transition-colors cursor-pointer"
                      >
                        Consultar Pauta
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VER ALUNOS ATRIBUÍDOS */}
      {activeTab === 'alunos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Formandos Sob Sua Responsabilidade</span>
              </h2>
              <p className="text-xs text-slate-400">
                Visualização filtrada apenas aos alunos matriculados nas suas turmas
              </p>
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Turma:</span>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="">Todas as minhas turmas</option>
                {teacherAssignedClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Formando</th>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Turma / Curso</th>
                    <th className="py-3 px-4 text-center">Frequência</th>
                    <th className="py-3 px-4 text-center">Média Atual</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teacherAssignedStudents
                    .filter(s => !selectedClassId || s.classGroupId === selectedClassId)
                    .map(student => (
                      <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={student.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <span className="font-semibold text-white block">{student.fullName}</span>
                              <span className="text-[11px] text-slate-400">{student.phone}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-400">
                          {student.code}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-white font-medium block">{student.classGroupName}</span>
                          <span className="text-[11px] text-slate-400">{student.courseName}</span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                            (student.attendancePercentage || 95) >= 75
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}>
                            {student.attendancePercentage || 95}%
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs ${
                            (student.averageGrade || 14) >= 10
                              ? 'bg-sky-500/15 text-sky-300'
                              : 'bg-rose-500/15 text-rose-300'
                          }`}>
                            {(student.averageGrade || 14).toFixed(1)} / 20
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            {student.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openWhatsAppMessage(student.phone, `Olá ${student.fullName}, comunicado do seu Professor ${activeTeacher?.fullName} da turma ${student.classGroupName}.`)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Enviar WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIÁRIO DE AULAS & MATERIAIS */}
      {activeTab === 'aulas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Diário de Aulas, Conteúdos & Materiais</span>
              </h2>
              <p className="text-xs text-slate-400">
                Registo de aulas lecionadas com conteúdos programáticos, anexos (PDF, ZIP) e chamadas associadas
              </p>
            </div>

            <button
              onClick={() => setIsCreatingLessonModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Aula</span>
            </button>
          </div>

          {/* Lessons List */}
          {teacherAssignedLessons.length === 0 ? (
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-medium">Nenhuma aula registrada ainda.</p>
              <p className="text-xs text-slate-500 mt-1">Clique em "Registrar Aula" para criar a primeira aula do diário.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teacherAssignedLessons.map(lesson => {
                const totalStudents = teacherAssignedStudents.filter(s => s.classGroupId === lesson.classGroupId).length || 20;
                const attendancesCount = lesson.attendances ? Object.values(lesson.attendances).filter(Boolean).length : totalStudents;
                const attendanceRate = Math.round((attendancesCount / totalStudents) * 100);

                return (
                  <div
                    key={lesson.id}
                    className="p-5 bg-slate-900/70 border border-slate-800/90 rounded-2xl space-y-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            {lesson.date}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {lesson.startTime || '08:30'} - {lesson.endTime || '10:30'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {lesson.classGroupName}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {lesson.disciplineName}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-2">
                          {lesson.title}
                        </h3>
                      </div>

                      {/* Quick Actions for Lesson */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedLessonId(lesson.id);
                            setActiveTab('presenca');
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Chamada ({attendancesCount}/{totalStudents})</span>
                        </button>

                        {lesson.onlineMeetingUrl && (
                          <button
                            onClick={() => handleLaunchOnlineClass(lesson)}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Abrir Sala Online</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {lesson.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {lesson.description}
                      </p>
                    )}

                    {lesson.content && (
                      <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-300 space-y-1">
                        <span className="font-semibold text-slate-400 block text-[11px] uppercase tracking-wider">
                          Conteúdo Programático Lecionado:
                        </span>
                        <div className="whitespace-pre-line text-slate-200">{lesson.content}</div>
                      </div>
                    )}

                    {/* Materials & Attachments */}
                    {lesson.materials && lesson.materials.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-slate-400 block mb-2">
                          Materiais Anexados ({lesson.materials.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {lesson.materials.map(mat => (
                            <a
                              key={mat.id}
                              href={mat.url}
                              download={mat.fileName || mat.title}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-200 transition-colors"
                            >
                              {mat.type === 'pdf' ? (
                                <FileText className="w-3.5 h-3.5 text-rose-400" />
                              ) : mat.type === 'zip' ? (
                                <FileArchive className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Paperclip className="w-3.5 h-3.5 text-sky-400" />
                              )}
                              <span className="font-medium">{mat.title}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">
                                ({mat.type} • {mat.size || '1 MB'})
                              </span>
                              <Download className="w-3 h-3 text-slate-500 ml-1" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REGISTRAR PRESENÇA (ASSOCIADA À AULA) */}
      {activeTab === 'presenca' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                <span>Registrar Presença (Chamada da Aula)</span>
              </h2>
              <p className="text-xs text-slate-400">
                "A presença deve ficar associada à aula." Consolida no histórico escolar e taxas de assiduidade do aluno.
              </p>
            </div>

            {/* Lesson Selector and Advanced Module Link */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate('aulas_frequencia', { classId: selectedClassId, lessonId: selectedLessonId })}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                title="Abrir Módulo 16 com 4 estados de presença, auditoria e permissões"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Módulo 16. Aulas & Frequência</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Aula:</span>
                <select
                  value={selectedLessonId}
                  onChange={e => setSelectedLessonId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer max-w-xs truncate"
                >
                  {teacherAssignedLessons.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.date} - {l.title} ({l.classGroupName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {currentLessonForAttendance ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Lesson Summary Card */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    Aula Selecionada para Chamada
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {currentLessonForAttendance.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Turma: {currentLessonForAttendance.classGroupName} • Data: {currentLessonForAttendance.date} • {currentLessonForAttendance.disciplineName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const allPresent: { [k: string]: boolean } = {};
                      studentsInCurrentLessonClass.forEach(s => { allPresent[s.id] = true; });
                      setRollCallAttendances(allPresent);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Marcar Todos Presentes
                  </button>

                  <button
                    onClick={() => {
                      const inverted: { [k: string]: boolean } = {};
                      studentsInCurrentLessonClass.forEach(s => {
                        inverted[s.id] = !rollCallAttendances[s.id];
                      });
                      setRollCallAttendances(inverted);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Inverter
                  </button>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden">
                {studentsInCurrentLessonClass.map(student => {
                  const isPresent = rollCallAttendances[student.id] !== false;

                  return (
                    <div
                      key={student.id}
                      className="p-3.5 bg-slate-950/40 hover:bg-slate-950/80 flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={student.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="text-sm font-semibold text-white block">{student.fullName}</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {student.code} • Assiduidade Geral: {student.attendancePercentage || 95}%
                          </span>
                        </div>
                      </div>

                      {/* Present / Absent Toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRollCallAttendances({ ...rollCallAttendances, [student.id]: true })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/30'
                              : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Presente</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRollCallAttendances({ ...rollCallAttendances, [student.id]: false })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            !isPresent
                              ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/30'
                              : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Falta</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Total Presentes: <span className="text-emerald-400 font-bold">{Object.values(rollCallAttendances).filter(Boolean).length}</span> / {studentsInCurrentLessonClass.length}
                </div>

                <button
                  onClick={handleSaveCurrentAttendance}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gravar Presença da Aula</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center">
              <ClipboardCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-medium">Nenhuma aula disponível para chamada.</p>
              <p className="text-xs text-slate-500 mt-1">Crie primeiro uma aula no diário para registrar presença.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: LANÇAR NOTAS & CONSULTAR PAUTA */}
      {activeTab === 'pauta' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Pauta de Avaliações & Lançamento de Notas</span>
              </h2>
              <p className="text-xs text-slate-400">
                Lançar notas por avaliação/teste e consultar a pauta oficial com cálculo automático de aprovação
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {teacherAssignedClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  const currentStudents = teacherAssignedStudents.filter(s => s.classGroupId === selectedClassId);
                  const initial: { [k: string]: number } = {};
                  currentStudents.forEach(s => { initial[s.id] = 14; });
                  setStudentScores(initial);
                  setIsScoringModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lançar Avaliação</span>
              </button>
            </div>
          </div>

          {/* Gradebook Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{currentClass?.name || 'Turma Selecionada'}</h3>
                <span className="text-xs text-slate-400">Curso: {currentClass?.courseName} • Professor: {activeTeacher?.fullName}</span>
              </div>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Pauta</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Nome do Formando</th>
                    <th className="py-3 px-4 text-center">Teste 1 (30%)</th>
                    <th className="py-3 px-4 text-center">Trabalho Prático (30%)</th>
                    <th className="py-3 px-4 text-center">Exame Final (40%)</th>
                    <th className="py-3 px-4 text-center">Média Final</th>
                    <th className="py-3 px-4 text-center">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teacherAssignedStudents
                    .filter(s => !selectedClassId || s.classGroupId === selectedClassId)
                    .map(student => {
                      const avg = student.averageGrade || 14;
                      const isApproved = avg >= 10;

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {student.code}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {student.fullName}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {student.assessments?.[0]?.score !== undefined ? `${student.assessments[0].score}` : '14.0'}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {student.assessments?.[1]?.score !== undefined ? `${student.assessments[1].score}` : '15.0'}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {student.assessments?.[2]?.score !== undefined ? `${student.assessments[2].score}` : '13.5'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-white text-sm">
                              {avg.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/ 20</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isApproved
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                              {isApproved ? 'Aprovado' : 'Reprovado'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COMUNICAR COM ALUNOS */}
      {activeTab === 'comunicacao' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Comunicar com a Turma / Formandos</span>
            </h2>
            <p className="text-xs text-slate-400">
              Envio de avisos pedagógicos, lembretes de entregas e comunicados oficiais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Selecionar Turma Destinatária</label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  {teacherAssignedClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.courseName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Mensagem do Comunicado</label>
                <textarea
                  rows={5}
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Escreva o comunicado para a turma (ex: Lembrete sobre a entrega do projeto prático na próxima segunda-feira...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Destinatários: <strong className="text-white">{teacherAssignedStudents.filter(s => s.classGroupId === selectedClassId).length} alunos</strong>
                </span>

                <button
                  onClick={() => {
                    if (!broadcastMessage) return;
                    addNotification({
                      title: 'Comunicado Enviado à Turma',
                      message: `Aviso enviado aos formandos de ${currentClass?.name}: "${broadcastMessage.substring(0, 45)}..."`,
                      type: 'system'
                    });
                    setBroadcastMessage('');
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Enviar Comunicado</span>
                </button>
              </div>
            </div>

            {/* Quick WhatsApp Direct to Students */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-bold text-white block">Contatos Diretos da Turma</span>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {teacherAssignedStudents
                  .filter(s => s.classGroupId === selectedClassId)
                  .map(s => (
                    <div
                      key={s.id}
                      className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <span className="text-xs font-medium text-white block truncate">{s.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.phone}</span>
                      </div>
                      <button
                        onClick={() => openWhatsAppMessage(s.phone, `Olá ${s.fullName}, mensagem do seu professor ${activeTeacher?.fullName}.`)}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg shrink-0 transition-colors cursor-pointer"
                        title="Abrir WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: INICIAR AULA ONLINE AO VIVO */}
      {activeTab === 'online' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isLiveActive ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                  <h2 className="text-base font-bold text-white">
                    {isLiveActive ? '🔴 AULA ONLINE EM DIRETO / TRANSMISSÃO AO VIVO' : 'Sala Virtual & Aula Online'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Transmissão ao vivo com sala segura para videoconferência com a turma selecionada
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isLiveActive ? (
                  <button
                    onClick={() => setIsLiveActive(false)}
                    className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-semibold rounded-xl border border-rose-600/30 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <VideoOff className="w-4 h-4" />
                    <span>Encerrar Transmissão</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleLaunchOnlineClass()}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-950/40 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Iniciar Aula Online Agora</span>
                  </button>
                )}
              </div>
            </div>

            {/* Online Classroom Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-slate-400 font-medium block">Turma Conectada</span>
                <span className="text-sm font-bold text-white mt-1 block">{currentClass?.name}</span>
                <span className="text-slate-400 text-[11px]">{currentClass?.courseName}</span>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-slate-400 font-medium block">Link da Reunião Virtual</span>
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:underline mt-1 block truncate font-mono"
                >
                  meet.google.com/new
                </a>
                <span className="text-slate-400 text-[11px]">Google Meet / WebRTC Seguro</span>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-slate-400 font-medium block">Status da Conexão</span>
                <span className={`text-xs font-bold mt-1 block ${isLiveActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isLiveActive ? 'Transmitindo para os alunos' : 'Aguardando Início do Professor'}
                </span>
                <span className="text-slate-400 text-[11px]">Servidor Moztechwave Core</span>
              </div>
            </div>

            {/* Quick Broadcast Link to WhatsApp */}
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-semibold text-white block">Compartilhar Link da Aula com a Turma</span>
                <span className="text-slate-400">Dispara o link da videoconferência direto no WhatsApp dos formandos</span>
              </div>

              <button
                onClick={() => {
                  teacherAssignedStudents
                    .filter(s => s.classGroupId === selectedClassId)
                    .forEach(s => {
                      // Trigger notification
                    });
                  addNotification({
                    title: 'Link da Aula Enviado',
                    message: `O link da aula online foi enviado para os formandos da turma ${currentClass?.name}.`,
                    type: 'system'
                  });
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Notificar Turma no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR NOVA AULA COM MATERIAIS */}
      {isCreatingLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Criar Aula no Diário do Professor</span>
              </h3>
              <button
                onClick={() => setIsCreatingLessonModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewLesson} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Turma *</label>
                  <select
                    value={newLessonData.classGroupId}
                    onChange={e => setNewLessonData({ ...newLessonData, classGroupId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    {teacherAssignedClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Disciplina / Módulo *</label>
                  <input
                    type="text"
                    required
                    value={newLessonData.disciplineName}
                    onChange={e => setNewLessonData({ ...newLessonData, disciplineName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Data da Aula *</label>
                  <input
                    type="date"
                    required
                    value={newLessonData.date}
                    onChange={e => setNewLessonData({ ...newLessonData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Hora Início</label>
                  <input
                    type="time"
                    value={newLessonData.startTime}
                    onChange={e => setNewLessonData({ ...newLessonData, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Hora Término</label>
                  <input
                    type="time"
                    value={newLessonData.endTime}
                    onChange={e => setNewLessonData({ ...newLessonData, endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Título da Aula *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Arquitetura de Software em Camadas & Injeção de Dependências"
                  value={newLessonData.title}
                  onChange={e => setNewLessonData({ ...newLessonData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Descrição Sumária da Aula</label>
                <input
                  type="text"
                  placeholder="ex: Visão geral teórica seguida de prática em laboratório com TypeScript"
                  value={newLessonData.description}
                  onChange={e => setNewLessonData({ ...newLessonData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Conteúdo Programático Detalhado</label>
                <textarea
                  rows={4}
                  placeholder="1. Revisão do módulo anterior&#10;2. Padrões de Projeto (Singleton, Factory, Observer)&#10;3. Exercício prático em pares&#10;4. Dúvidas e orientações para o teste"
                  value={newLessonData.content}
                  onChange={e => setNewLessonData({ ...newLessonData, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Anexos: PDF, ZIP e Outros Materiais */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Anexar Materiais Permitidos (PDF, ZIP, Slides, Docs)</span>
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Material (ex: Código-Fonte Aula 04.zip)"
                    value={newMaterialTitle}
                    onChange={e => setNewMaterialTitle(e.target.value)}
                    className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />

                  <select
                    value={newMaterialType}
                    onChange={e => setNewMaterialType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="pdf">PDF</option>
                    <option value="zip">ZIP / Código</option>
                    <option value="slides">Slides PPT</option>
                    <option value="doc">Documento Word</option>
                    <option value="link">Link Web</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddMaterialToNewLesson}
                    className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
                  >
                    + Anexar
                  </button>
                </div>

                {/* List of Attached Materials */}
                {newLessonData.materials.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {newLessonData.materials.map(mat => (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg text-xs border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400">
                            {mat.type}
                          </span>
                          <span className="text-white font-medium">{mat.title}</span>
                          <span className="text-slate-500 text-[10px]">({mat.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(mat.id)}
                          className="text-rose-400 hover:text-rose-300 text-xs px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Online Meeting Option */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-semibold text-white block">Esta aula terá transmissão online ao vivo?</span>
                  <span className="text-slate-400">Gera link para Google Meet / videoconferência</span>
                </div>
                <input
                  type="checkbox"
                  checked={newLessonData.isLiveOnline}
                  onChange={e => setNewLessonData({ ...newLessonData, isLiveOnline: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingLessonModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  Salvar Aula no Diário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LANÇAR AVALIAÇÕES E NOTAS */}
      {isScoringModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Lançar Notas da Avaliação</span>
              </h3>
              <button
                onClick={() => setIsScoringModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBulkScores} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Título da Avaliação</label>
                  <input
                    type="text"
                    required
                    value={assessmentTitle}
                    onChange={e => setAssessmentTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Disciplina / Módulo</label>
                  <input
                    type="text"
                    required
                    value={assessmentModule}
                    onChange={e => setAssessmentModule(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Nota Máxima</label>
                  <input
                    type="number"
                    value={assessmentMaxScore}
                    onChange={e => setAssessmentMaxScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Peso (%)</label>
                  <input
                    type="number"
                    value={assessmentWeight}
                    onChange={e => setAssessmentWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Data</label>
                  <input
                    type="date"
                    value={assessmentDate}
                    onChange={e => setAssessmentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Student scores inputs */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block">Notas dos Alunos (Escala 0 a 20):</span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {teacherAssignedStudents
                    .filter(s => s.classGroupId === selectedClassId)
                    .map(student => (
                      <div
                        key={student.id}
                        className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="text-white font-medium truncate flex-1">{student.fullName}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={assessmentMaxScore}
                            step={0.5}
                            value={studentScores[student.id] !== undefined ? studentScores[student.id] : 14}
                            onChange={e => setStudentScores({ ...studentScores, [student.id]: Number(e.target.value) })}
                            className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-center font-bold text-white focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-slate-500">/ 20</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScoringModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Salvar Notas na Pauta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
