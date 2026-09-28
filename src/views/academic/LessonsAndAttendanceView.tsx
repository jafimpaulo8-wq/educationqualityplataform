import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  XCircle, 
  FileCheck, 
  ShieldCheck, 
  ShieldAlert,
  Plus, 
  Search, 
  Filter, 
  Download, 
  Paperclip, 
  FileText, 
  FileArchive, 
  Lock, 
  Unlock, 
  History, 
  CheckCheck, 
  Printer, 
  AlertTriangle,
  Share2,
  Trash2,
  Edit3,
  Check,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AttendanceStatus, ClassLesson, LessonMaterial, LessonAttendanceAuditLog } from '../../types';
import { soundManager } from '../../utils/audio';

export const LessonsAndAttendanceView: React.FC = () => {
  const { 
    classes, 
    students, 
    lessons, 
    teachers,
    activeRole,
    activeInstitution,
    activeBranch,
    addLesson, 
    updateLesson,
    deleteLesson,
    saveAttendance, 
    unlockLessonAttendance,
    attendanceAuditLogs,
    navigate, 
    routeParams,
    addNotification
  } = useApp();

  // Selected filters
  const [selectedClassId, setSelectedClassId] = useState<string>(
    routeParams.classId || classes[0]?.id || ''
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    routeParams.lessonId || lessons[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'homologadas' | 'em_aberto'>('todos');

  // Modal States
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // Lesson Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formDiscipline, setFormDiscipline] = useState('');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || '');
  const [formTeacherName, setFormTeacherName] = useState(teachers[0]?.fullName || 'Eng. Carlos Manuel');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formMaterials, setFormMaterials] = useState<LessonMaterial[]>([]);
  
  // New Material Inputs in modal
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatType, setNewMatType] = useState<'pdf' | 'zip' | 'doc' | 'slides' | 'link'>('pdf');
  const [newMatSize, setNewMatSize] = useState('1.5 MB');

  // Unlock Authorization Form State
  const [unlockReason, setUnlockReason] = useState('');
  const [unlockSupervisorPin, setUnlockSupervisorPin] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Attendance Local Editing State
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = useMemo(() => {
    return students.filter(s => s.classGroupId === currentClass?.id);
  }, [students, currentClass?.id]);

  const filteredLessons = useMemo(() => {
    return lessons
      .filter(l => {
        if (selectedClassId && l.classGroupId !== selectedClassId) return false;
        if (statusFilter === 'homologadas' && !l.isAttendanceLocked) return false;
        if (statusFilter === 'em_aberto' && l.isAttendanceLocked) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            l.title.toLowerCase().includes(q) ||
            l.disciplineName.toLowerCase().includes(q) ||
            (l.teacherName && l.teacherName.toLowerCase().includes(q)) ||
            (l.description && l.description.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [lessons, selectedClassId, statusFilter, searchQuery]);

  const currentLesson = useMemo(() => {
    if (selectedLessonId) {
      const found = lessons.find(l => l.id === selectedLessonId);
      if (found) return found;
    }
    return filteredLessons[0] || lessons[0];
  }, [selectedLessonId, filteredLessons, lessons]);

  // Attendance in-progress state
  const [localAttendances, setLocalAttendances] = useState<{ [studentId: string]: AttendanceStatus }>({});
  const [localNotes, setLocalNotes] = useState<{ [studentId: string]: string }>({});
  const [correctionJustification, setCorrectionJustification] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync attendance when lesson changes
  React.useEffect(() => {
    if (currentLesson) {
      const initial: { [studentId: string]: AttendanceStatus } = {};
      classStudents.forEach(st => {
        const recorded = currentLesson.attendances?.[st.id];
        if (recorded === true || recorded === 'presente') initial[st.id] = 'presente';
        else if (recorded === false || recorded === 'ausente') initial[st.id] = 'ausente';
        else if (recorded === 'atraso') initial[st.id] = 'atraso';
        else if (recorded === 'justificado') initial[st.id] = 'justificado';
        else initial[st.id] = 'presente'; // default
      });
      setLocalAttendances(initial);
      setLocalNotes(currentLesson.attendanceNotes || {});
      setCorrectionJustification('');
      setHasUnsavedChanges(false);
    }
  }, [currentLesson?.id, classStudents]);

  // Statistics for Current Attendance Call
  const attendanceStats = useMemo(() => {
    let pres = 0;
    let aus = 0;
    let atr = 0;
    let just = 0;
    const total = classStudents.length;

    Object.values(localAttendances).forEach(status => {
      if (status === 'presente') pres++;
      else if (status === 'ausente') aus++;
      else if (status === 'atraso') atr++;
      else if (status === 'justificado') just++;
    });

    const rate = total > 0 ? Math.round(((pres + just + atr * 0.8) / total) * 100) : 0;
    return { pres, aus, atr, just, total, rate };
  }, [localAttendances, classStudents.length]);

  // Handler: "MARCAR TODOS PRESENTES"
  const handleMarkAllPresent = () => {
    const updated: { [studentId: string]: AttendanceStatus } = {};
    classStudents.forEach(s => {
      updated[s.id] = 'presente';
    });
    setLocalAttendances(updated);
    setHasUnsavedChanges(true);
    soundManager.playSuccess();
    addNotification({
      title: 'Chamada Coletiva Aplicada',
      message: `Todos os ${classStudents.length} alunos da turma foram marcados como PRESENTES. Clique em "Homologar Chamada" para registrar.`,
      type: 'system'
    });
  };

  // Handler: Individual student status change
  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    if (currentLesson?.isAttendanceLocked) {
      addNotification({
        title: 'Chamada Bloqueada',
        message: 'Esta chamada já foi homologada. Clique no botão "Solicitar Correção" para retificar mediante permissão e registro de auditoria.',
        type: 'system'
      });
      return;
    }
    setLocalAttendances(prev => ({
      ...prev,
      [studentId]: status
    }));
    setHasUnsavedChanges(true);
    soundManager.playClick();
  };

  // Handler: Save Attendance
  const handleSaveAttendance = (isCorrection: boolean = false) => {
    if (!currentLesson) return;

    if (isCorrection && !correctionJustification.trim()) {
      alert('Por favor, informe a justificativa oficial para esta retificação de frequência.');
      return;
    }

    saveAttendance(currentLesson.id, localAttendances, {
      isCorrection,
      correctionReason: correctionJustification || (isCorrection ? 'Retificação de frequência autorizada' : 'Homologação oficial de diário de classe'),
      actionType: isCorrection ? 'correcao' : 'registro_inicial',
      notes: localNotes,
      lockAttendance: true
    });

    setHasUnsavedChanges(false);
    setCorrectionJustification('');
  };

  // Handler: Authorize Unlock for Correction
  const handleAuthorizeUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLesson) return;

    if (!unlockReason.trim()) {
      setUnlockError('A justificativa formal do desbloqueio é obrigatória para fins de auditoria.');
      return;
    }

    // Role verification or PIN check
    const isSupervisor = ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'].includes(activeRole.toUpperCase());
    const validPin = unlockSupervisorPin === '1234' || unlockSupervisorPin === '2026' || isSupervisor;

    if (!validPin && unlockSupervisorPin !== '') {
      setUnlockError('PIN de autorização de coordenação inválido.');
      return;
    }

    const success = unlockLessonAttendance(
      currentLesson.id,
      unlockReason,
      isSupervisor ? `${activeRole} Homologado` : 'Docente Responsável (PIN Validado)'
    );

    if (success) {
      setIsUnlockModalOpen(false);
      setUnlockReason('');
      setUnlockSupervisorPin('');
      setUnlockError('');
      setHasUnsavedChanges(true);
    }
  };

  // Handler: Open Create / Edit Lesson Modal
  const handleOpenCreateModal = () => {
    setEditingLessonId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('08:00');
    setFormEndTime('10:00');
    setFormClassId(selectedClassId || classes[0]?.id || '');
    const currentCls = classes.find(c => c.id === (selectedClassId || classes[0]?.id));
    setFormDiscipline(currentCls?.courseName ? `Módulo: ${currentCls.courseName}` : 'Tecnologias de Informação');
    setFormTeacherName(teachers[0]?.fullName || 'Eng. Carlos Manuel');
    setFormTitle('');
    setFormDescription('');
    setFormContent('');
    setFormMaterials([
      { id: `mat-${Date.now()}`, title: 'Sumario_Aula_Plano_Estudos.pdf', type: 'pdf', size: '1.4 MB', url: '#' }
    ]);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditModal = (lesson: ClassLesson) => {
    setEditingLessonId(lesson.id);
    setFormDate(lesson.date);
    setFormStartTime(lesson.startTime || '08:00');
    setFormEndTime(lesson.endTime || '10:00');
    setFormClassId(lesson.classGroupId);
    setFormDiscipline(lesson.disciplineName);
    setFormTeacherName(lesson.teacherName || '');
    setFormTitle(lesson.title);
    setFormDescription(lesson.description || '');
    setFormContent(lesson.content || '');
    setFormMaterials(lesson.materials || []);
    setIsLessonModalOpen(true);
  };

  const handleSaveLessonForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Por favor, informe o título da aula.');
      return;
    }

    const targetClass = classes.find(c => c.id === formClassId) || currentClass;

    if (editingLessonId) {
      updateLesson(editingLessonId, {
        date: formDate,
        time: `${formStartTime} - ${formEndTime}`,
        startTime: formStartTime,
        endTime: formEndTime,
        disciplineName: formDiscipline,
        classGroupId: formClassId,
        classGroupName: targetClass?.name || 'Turma Geral',
        teacherName: formTeacherName,
        title: formTitle,
        description: formDescription,
        content: formContent,
        materials: formMaterials
      });
      addNotification({
        title: 'Aula Atualizada',
        message: `As informações da aula "${formTitle}" foram salvas.`,
        type: 'system'
      });
    } else {
      addLesson({
        institutionId: activeInstitution?.id || 'inst-1',
        branchId: activeBranch?.id || 'branch-1-maputo',
        classGroupId: formClassId,
        classGroupName: targetClass?.name || 'Turma Geral',
        disciplineName: formDiscipline,
        teacherName: formTeacherName,
        date: formDate,
        time: `${formStartTime} - ${formEndTime}`,
        startTime: formStartTime,
        endTime: formEndTime,
        title: formTitle,
        description: formDescription,
        content: formContent,
        materials: formMaterials,
        attendances: {},
        isAttendanceLocked: false,
        status: 'planejada'
      });
      addNotification({
        title: 'Nova Aula Criada',
        message: `A aula "${formTitle}" foi cadastrada com sucesso no diário.`,
        type: 'system'
      });
    }

    setIsLessonModalOpen(false);
  };

  const handleAddMaterialItem = () => {
    if (!newMatTitle.trim()) return;
    setFormMaterials(prev => [
      ...prev,
      {
        id: `mat-${Date.now()}`,
        title: newMatTitle.trim(),
        type: newMatType,
        size: newMatSize,
        url: '#'
      }
    ]);
    setNewMatTitle('');
  };

  const handleRemoveMaterialItem = (id: string) => {
    setFormMaterials(prev => prev.filter(m => m.id !== id));
  };

  // WhatsApp Alert for Absent/Late Student
  const handleSendWhatsAppNotification = (student: typeof students[0], status: AttendanceStatus) => {
    const statusText = status === 'ausente' 
      ? 'ausência na aula de hoje' 
      : status === 'atraso' 
      ? 'atraso registrado na entrada' 
      : 'frequência escolar';
      
    const message = encodeURIComponent(
      `Prezado(a) ${student.fullName}, comunicamos que foi registrado ${statusText} na disciplina de "${currentLesson?.disciplineName || 'Aula'}" na turma "${currentClass?.name}". Data: ${currentLesson?.date}. Dúvidas, contate a secretaria do ${activeInstitution?.name}.`
    );
    const phone = student.phone?.replace(/\D/g, '') || '840000000';
    window.open(`https://wa.me/258${phone}?text=${message}`, '_blank');
  };

  // Print Attendance Sheet
  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div id="aulas-frequencia-module" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* MODULE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl backdrop-blur">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Módulo 16 • SIGAR Pedagógico
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {activeInstitution?.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            <span>Aulas & Frequência</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Gestão integral do diário de classe: registro pedagógico de aulas, conteúdos lecionados, anexos didáticos, controle de presença com 4 estados e auditoria rastreável.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-ver-auditoria"
            onClick={() => setIsAuditModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Ver registros de auditoria e retificações"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>Trilha de Auditoria ({attendanceAuditLogs.length})</span>
          </button>

          <button
            id="btn-imprimir-pauta"
            onClick={handlePrintSheet}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Imprimir pauta da aula"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Pauta de Presença</span>
          </button>

          <button
            id="btn-nova-aula"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Aula</span>
          </button>
        </div>
      </div>

      {/* QUICK STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block font-medium">Aulas Registradas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{lessons.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">no diário</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block font-medium">Turma Selecionada</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-sky-400 truncate">{currentClass?.name || 'Geral'}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block font-medium">Alunos Matriculados</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400">{classStudents.length}</span>
            <span className="text-xs text-slate-400">formandos</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block font-medium">Auditorias Registradas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-violet-400">{attendanceAuditLogs.length}</span>
            <span className="text-xs text-slate-400">logs de conformidade</span>
          </div>
        </div>
      </div>

      {/* FILTER & SELECTION TOOLBAR */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Turma Selector */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Turma:</span>
            <select
              id="select-turma-filtro"
              value={selectedClassId}
              onChange={e => {
                setSelectedClassId(e.target.value);
                const firstLessonOfClass = lessons.find(l => l.classGroupId === e.target.value);
                if (firstLessonOfClass) setSelectedLessonId(firstLessonOfClass.id);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium flex-1 cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.shift})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Estado:</span>
            <select
              id="select-estado-filtro"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="todos">Todas as Aulas</option>
              <option value="homologadas">Homologadas / Bloqueadas</option>
              <option value="em_aberto">Em Aberto / Pendentes</option>
            </select>
          </div>

          {/* Search Query */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, conteúdo ou professor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-end gap-2">
          <span>Aulas listadas: <strong className="text-slate-200">{filteredLessons.length}</strong></span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: LESSON TIMELINE / LIST (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Aulas da Turma</span>
            </h2>
            <span className="text-xs text-slate-500">Cronológico</span>
          </div>

          {filteredLessons.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Nenhuma aula encontrada para os filtros selecionados.</p>
              <button
                onClick={handleOpenCreateModal}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Cadastrar Primeira Aula
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredLessons.map(lesson => {
                const isSelected = currentLesson?.id === lesson.id;
                const isLocked = !!lesson.isAttendanceLocked;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/30'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                          {lesson.date}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {lesson.startTime || '08:00'} - {lesson.endTime || '10:00'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title="Chamada homologada e protegida">
                            <Lock className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Homologada</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Chamada pendente de homologação">
                            <Unlock className="w-2.5 h-2.5" />
                            <span>Em Aberto</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xs font-bold text-white mt-2 line-clamp-2 group-hover:text-emerald-300 transition-colors">
                      {lesson.title}
                    </h3>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {lesson.disciplineName} • {lesson.teacherName}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 text-slate-400">
                        {lesson.materials && lesson.materials.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                            <Paperclip className="w-3 h-3 text-sky-400" />
                            {lesson.materials.length} anexos
                          </span>
                        )}
                        {lesson.auditLogs && lesson.auditLogs.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                            <History className="w-3 h-3 text-amber-400" />
                            {lesson.auditLogs.length} logs
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="text-emerald-400 font-bold" title="Presentes">P:{lesson.totalPresent ?? 0}</span>
                        <span className="text-rose-400 font-bold" title="Ausentes">A:{lesson.totalAbsent ?? 0}</span>
                        <span className="text-amber-400 font-bold" title="Atrasos">At:{lesson.totalLate ?? 0}</span>
                        <span className="text-sky-400 font-bold" title="Justificados">J:{lesson.totalJustified ?? 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LESSON DETAILS & ATTENDANCE WORKBENCH (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {currentLesson ? (
            <>
              {/* LESSON DETAILS CARD */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2.5 py-0.5 rounded-md font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {currentLesson.date}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {currentLesson.startTime || '08:00'} - {currentLesson.endTime || '10:00'} ({currentLesson.time || '2h'})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {currentLesson.classGroupName}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white pt-1">
                      {currentLesson.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(currentLesson)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Editar dados da aula"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir aula "${currentLesson.title}" do diário?`)) {
                          deleteLesson(currentLesson.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition cursor-pointer"
                      title="Excluir aula"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* METADATA GRID: data, hora, disciplina, turma, professor */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Disciplina / Módulo</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block truncate">
                      {currentLesson.disciplineName}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Professor / Formador</span>
                    <span className="font-semibold text-emerald-400 mt-0.5 block truncate">
                      {currentLesson.teacherName || 'Docente Responsável'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Turma & Turno</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block truncate">
                      {currentLesson.classGroupName}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Status da Chamada</span>
                    <span className="font-semibold mt-0.5 block flex items-center gap-1.5">
                      {currentLesson.isAttendanceLocked ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Homologada
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Unlock className="w-3.5 h-3.5" /> Em Edição
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* DESCRIÇÃO & CONTEÚDO */}
                <div className="space-y-3 pt-2">
                  {currentLesson.description && (
                    <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 text-xs">
                      <span className="text-slate-400 font-bold block mb-1">Descrição Sumária da Aula:</span>
                      <p className="text-slate-300 leading-relaxed">{currentLesson.description}</p>
                    </div>
                  )}

                  {currentLesson.content && (
                    <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 text-xs">
                      <span className="text-slate-400 font-bold block mb-1">Conteúdo Programático Desenvolvido:</span>
                      <pre className="text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                        {currentLesson.content}
                      </pre>
                    </div>
                  )}
                </div>

                {/* MATERIAIS ANEXADOS */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                      Materiais da Aula (PDF, ZIP, Documentos)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {(currentLesson.materials || []).length} anexo(s) disponível(is)
                    </span>
                  </div>

                  {(!currentLesson.materials || currentLesson.materials.length === 0) ? (
                    <p className="text-xs text-slate-500 italic">Nenhum material didático anexado a esta aula.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentLesson.materials.map(mat => (
                        <div
                          key={mat.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {mat.type === 'pdf' ? (
                              <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                            ) : mat.type === 'zip' ? (
                              <FileArchive className="w-5 h-5 text-amber-400 shrink-0" />
                            ) : (
                              <Download className="w-5 h-5 text-sky-400 shrink-0" />
                            )}
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-200 truncate">{mat.title}</p>
                              <span className="text-[10px] text-slate-500 uppercase">{mat.type} • {mat.size || 'Arquivo'}</span>
                            </div>
                          </div>

                          <a
                            href={mat.url || '#'}
                            onClick={e => {
                              e.preventDefault();
                              alert(`Simulação de download do material didático: "${mat.title}". Arquivo seguro verificado no SIGAR.`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition shrink-0"
                            title="Descarregar Material"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ATTENDANCE SECTION (AULAS E FREQUÊNCIA) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                
                {/* ATTENDANCE TOOLBAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      <span>Registro de Presença & Frequência</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Selecione o estado de cada formando (Presente, Ausente, Atraso, Justificado).
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* BOTÃO OBRIGATÓRIO: "MARCAR TODOS PRESENTES" */}
                    <button
                      id="btn-marcar-todos-presentes"
                      onClick={handleMarkAllPresent}
                      disabled={currentLesson.isAttendanceLocked}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
                        currentLesson.isAttendanceLocked
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 active:scale-95'
                      }`}
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>MARCAR TODOS PRESENTES</span>
                    </button>

                    {/* PERMISSÃO & CORREÇÃO */}
                    {currentLesson.isAttendanceLocked ? (
                      <button
                        id="btn-solicitar-correcao"
                        onClick={() => setIsUnlockModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Desbloquear / Corrigir</span>
                      </button>
                    ) : (
                      <button
                        id="btn-salvar-homologar"
                        onClick={() => handleSaveAttendance(false)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-950/40 transition active:scale-95 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Homologar Chamada</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* CORRECTION MODE BANNER */}
                {!currentLesson.isAttendanceLocked && currentLesson.attendanceFinalizedAt && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/60 text-xs space-y-2">
                    <div className="flex items-center justify-between text-amber-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Modo de Retificação Ativo (Permissão Concedida)
                      </span>
                      <span className="text-[11px] font-mono text-amber-400">
                        Todas as alterações serão registradas em auditoria
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Justificativa da retificação (ex: Atestado médico protocolado)..."
                        value={correctionJustification}
                        onChange={e => setCorrectionJustification(e.target.value)}
                        className="flex-1 bg-slate-950 border border-amber-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleSaveAttendance(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                      >
                        Salvar Correção Auditada
                      </button>
                    </div>
                  </div>
                )}

                {/* STATUS COUNTERS BAR: presente, ausente, atraso, justificado */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/60">
                    <span className="text-[11px] text-emerald-400 block font-semibold">Presentes</span>
                    <span className="text-lg font-bold text-emerald-300">
                      {attendanceStats.pres} <span className="text-xs text-slate-500">({attendanceStats.total > 0 ? Math.round((attendanceStats.pres / attendanceStats.total) * 100) : 0}%)</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/60">
                    <span className="text-[11px] text-rose-400 block font-semibold">Ausentes</span>
                    <span className="text-lg font-bold text-rose-300">
                      {attendanceStats.aus} <span className="text-xs text-slate-500">({attendanceStats.total > 0 ? Math.round((attendanceStats.aus / attendanceStats.total) * 100) : 0}%)</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/60">
                    <span className="text-[11px] text-amber-400 block font-semibold">Atrasos</span>
                    <span className="text-lg font-bold text-amber-300">
                      {attendanceStats.atr} <span className="text-xs text-slate-500">({attendanceStats.total > 0 ? Math.round((attendanceStats.atr / attendanceStats.total) * 100) : 0}%)</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-900/60">
                    <span className="text-[11px] text-sky-400 block font-semibold">Justificados</span>
                    <span className="text-lg font-bold text-sky-300">
                      {attendanceStats.just} <span className="text-xs text-slate-500">({attendanceStats.total > 0 ? Math.round((attendanceStats.just / attendanceStats.total) * 100) : 0}%)</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">Taxa Global</span>
                    <span className="text-lg font-bold text-white">
                      {attendanceStats.rate}%
                    </span>
                  </div>
                </div>

                {/* STUDENT ATTENDANCE TABLE */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Estudante / Código</th>
                        <th className="py-3 px-3 text-center">Frequência Geral</th>
                        <th className="py-3 px-4 text-center">Presença na Aula</th>
                        <th className="py-3 px-3">Observação / Justificativa</th>
                        <th className="py-3 px-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {classStudents.map(student => {
                        const currentStatus: AttendanceStatus = localAttendances[student.id] || 'presente';
                        const note = localNotes[student.id] || '';

                        return (
                          <tr 
                            key={student.id} 
                            className="hover:bg-slate-950/40 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                                  alt={student.fullName}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                                />
                                <div>
                                  <p className="font-semibold text-white">{student.fullName}</p>
                                  <p className="text-[11px] font-mono text-slate-500">{student.code}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-200">
                                {student.attendancePercentage || 90}%
                              </span>
                            </td>

                            {/* 4 STATUS BUTTON SELECTOR */}
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* 1. PRESENTE */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(student.id, 'presente')}
                                  disabled={currentLesson.isAttendanceLocked}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                    currentStatus === 'presente'
                                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                  } ${currentLesson.isAttendanceLocked ? 'opacity-90 cursor-default' : 'cursor-pointer'}`}
                                  title="Marcar como Presente"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Presente</span>
                                </button>

                                {/* 2. AUSENTE */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(student.id, 'ausente')}
                                  disabled={currentLesson.isAttendanceLocked}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                    currentStatus === 'ausente'
                                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                  } ${currentLesson.isAttendanceLocked ? 'opacity-90 cursor-default' : 'cursor-pointer'}`}
                                  title="Marcar como Ausente (Falta)"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Ausente</span>
                                </button>

                                {/* 3. ATRASO */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(student.id, 'atraso')}
                                  disabled={currentLesson.isAttendanceLocked}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                    currentStatus === 'atraso'
                                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                  } ${currentLesson.isAttendanceLocked ? 'opacity-90 cursor-default' : 'cursor-pointer'}`}
                                  title="Marcar como Atraso"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Atraso</span>
                                </button>

                                {/* 4. JUSTIFICADO */}
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(student.id, 'justificado')}
                                  disabled={currentLesson.isAttendanceLocked}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                    currentStatus === 'justificado'
                                      ? 'bg-sky-600 text-white shadow-md shadow-sky-950'
                                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                  } ${currentLesson.isAttendanceLocked ? 'opacity-90 cursor-default' : 'cursor-pointer'}`}
                                  title="Falta Justificada (Atestado / Declaração)"
                                >
                                  <FileCheck className="w-3.5 h-3.5" />
                                  <span>Justificado</span>
                                </button>
                              </div>
                            </td>

                            {/* OBSERVAÇÃO */}
                            <td className="py-3 px-3">
                              <input
                                type="text"
                                placeholder="Nota / Motivo..."
                                value={note}
                                disabled={currentLesson.isAttendanceLocked}
                                onChange={e => {
                                  setLocalNotes(prev => ({
                                    ...prev,
                                    [student.id]: e.target.value
                                  }));
                                  setHasUnsavedChanges(true);
                                }}
                                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1 w-full focus:outline-none focus:border-slate-600 disabled:opacity-60"
                              />
                            </td>

                            {/* WHATSAPP ALERTA */}
                            <td className="py-3 px-3 text-right">
                              {(currentStatus === 'ausente' || currentStatus === 'atraso') && (
                                <button
                                  onClick={() => handleSendWhatsAppNotification(student, currentStatus)}
                                  className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                                  title="Notificar encarregado / aluno por WhatsApp"
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM ACTION BAR IF CHANGES UNSAVED */}
                {hasUnsavedChanges && !currentLesson.isAttendanceLocked && (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl">
                    <span className="text-xs text-emerald-300 font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Você possui alterações não homologadas nesta chamada.
                    </span>
                    <button
                      onClick={() => handleSaveAttendance(false)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Homologar & Salvar no SIGAR
                    </button>
                  </div>
                )}
              </div>

              {/* AUDITORIA DA AULA ATIVA */}
              {currentLesson.auditLogs && currentLesson.auditLogs.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <History className="w-4 h-4 text-sky-400" />
                    <span>Trilha de Auditoria Desta Aula ({currentLesson.auditLogs.length} eventos)</span>
                  </h4>
                  <div className="space-y-2">
                    {currentLesson.auditLogs.map(log => (
                      <div key={log.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono text-emerald-400 font-semibold">{log.timestamp}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                            {log.actionType}
                          </span>
                        </div>
                        <p className="text-slate-200">
                          <strong>Operador:</strong> {log.actorName} ({log.actorRole})
                        </p>
                        <p className="text-slate-300">
                          <strong>Justificativa:</strong> {log.reason}
                        </p>
                        {log.previousStatus && (
                          <p className="text-[11px] text-slate-400">
                            Status anterior: <span className="text-rose-400 font-bold">{log.previousStatus}</span> ➔ Novo status: <span className="text-emerald-400 font-bold">{log.newStatus}</span> ({log.studentName})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhuma Aula Selecionada</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Selecione uma aula no painel esquerdo ou cadastre uma nova aula para registrar frequência e conteúdos.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Cadastrar Aula
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: CADASTRAR / EDITAR AULA                         */}
      {/* ========================================================= */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>{editingLessonId ? 'Editar Aula do Diário' : 'Cadastrar Nova Aula'}</span>
              </h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLessonForm} className="space-y-4 text-xs">
              {/* Turma e Disciplina */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Turma Destino *</label>
                  <select
                    value={formClassId}
                    onChange={e => setFormClassId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-emerald-500"
                    required
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.courseName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Disciplina / Módulo *</label>
                  <input
                    type="text"
                    value={formDiscipline}
                    onChange={e => setFormDiscipline(e.target.value)}
                    placeholder="Ex: Arquitetura de Software"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data da Aula *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hora de Início *</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hora de Término *</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Professor Responsável */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Professor / Formador Responsável</label>
                <select
                  value={formTeacherName}
                  onChange={e => setFormTeacherName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-emerald-500"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.fullName}>
                      {t.fullName} ({t.specialty || t.academicDegree})
                    </option>
                  ))}
                  <option value="Docente Substituto / Convidado">Docente Substituto / Convidado</option>
                </select>
              </div>

              {/* Título da Aula */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título da Aula *</label>
                <input
                  type="text"
                  placeholder="Ex: Aula 14: Microserviços e Docker"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Descrição Sumária */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição / Objetivos da Aula</label>
                <input
                  type="text"
                  placeholder="Breve resumo das competências a desenvolver..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-emerald-500"
                />
              </div>

              {/* Conteúdo Programático */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Conteúdo Programático Completo</label>
                <textarea
                  rows={4}
                  placeholder="1. Tópico A&#10;2. Demonstração prática em laboratório&#10;3. Exercício em duplas"
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Anexar Materiais (PDF, ZIP, DOC) */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-300 block">Anexar Materiais Didáticos</span>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nome do arquivo (ex: Guia_Estudo_Docker.pdf)"
                    value={newMatTitle}
                    onChange={e => setNewMatTitle(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                  <select
                    value={newMatType}
                    onChange={e => setNewMatType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="pdf">PDF</option>
                    <option value="zip">ZIP</option>
                    <option value="doc">Word/DOC</option>
                    <option value="slides">Slides/PPT</option>
                    <option value="link">Link Externo</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMaterialItem}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs cursor-pointer"
                  >
                    Anexar
                  </button>
                </div>

                {formMaterials.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {formMaterials.map(mat => (
                      <div key={mat.id} className="flex items-center justify-between p-2 rounded bg-slate-900 text-xs">
                        <span className="truncate text-slate-300">{mat.title} ({mat.type})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterialItem(mat.id)}
                          className="text-rose-400 hover:text-rose-300 ml-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  {editingLessonId ? 'Atualizar Aula' : 'Salvar Aula no Diário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DESBLOQUEIO DE FREQUÊNCIA MEDIANTE PERMISSÃO     */}
      {/* ========================================================= */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Autorização para Retificação</span>
              </h3>
              <button
                onClick={() => setIsUnlockModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 space-y-1">
              <p className="font-semibold">Controle de Auditoria e Integridade:</p>
              <p className="text-amber-200/80 leading-relaxed">
                A retificação de presenças após homologação requer justificativa formal e permissão pedagógica. Todos os registros serão gravados no log de auditoria permanente do SIGAR.
              </p>
            </div>

            <form onSubmit={handleAuthorizeUnlock} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Motivo / Justificativa Obrigatória *
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Aluno apresentou atestado médico comprovando motivo de força maior protocolado na secretaria geral."
                  value={unlockReason}
                  onChange={e => setUnlockReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  PIN de Autorização de Coordenação (Opcional se seu perfil for Diretor/Secretaria)
                </label>
                <input
                  type="password"
                  placeholder="Digite o PIN de supervisão (ex: 1234)..."
                  value={unlockSupervisorPin}
                  onChange={e => setUnlockSupervisorPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Perfil Atual: <strong>{activeRole}</strong>
                </span>
              </div>

              {unlockError && (
                <p className="text-xs text-rose-400 font-semibold">{unlockError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUnlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  Validar Permissão & Desbloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: TRILHA GERAL DE AUDITORIA DE FREQUÊNCIA          */}
      {/* ========================================================= */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-4xl shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-sky-400" />
                  <span>Trilha de Auditoria e Retificações de Frequência</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Histórico inalterável de lançamentos, chamada coletiva e retificações com operadores e motivos
                </p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-3">Data / Hora</th>
                      <th className="py-3 px-3">Ação</th>
                      <th className="py-3 px-3">Aula / Turma</th>
                      <th className="py-3 px-3">Estudante</th>
                      <th className="py-3 px-3">Transição</th>
                      <th className="py-3 px-3">Operador</th>
                      <th className="py-3 px-4">Motivo / Justificativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {attendanceAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-950/40">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.actionType === 'correcao'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : log.actionType === 'desbloqueio'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : log.actionType === 'marcar_todos_presentes'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}>
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-white truncate max-w-[140px]">{log.lessonTitle}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{log.classGroupName}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="text-slate-200 font-medium truncate max-w-[130px]">{log.studentName}</p>
                          {log.studentCode && <p className="text-[10px] font-mono text-slate-500">{log.studentCode}</p>}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {log.previousStatus ? (
                            <span className="font-mono text-[11px]">
                              <span className="text-rose-400">{log.previousStatus}</span> ➔ <span className="text-emerald-400">{log.newStatus}</span>
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] text-emerald-400">{log.newStatus}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <p className="text-slate-200 font-semibold">{log.actorName}</p>
                          <p className="text-[10px] text-slate-500">{log.actorRole}</p>
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 text-[11px]">
                          {log.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Total de eventos gravados: <strong>{attendanceAuditLogs.length}</strong>
              </span>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
