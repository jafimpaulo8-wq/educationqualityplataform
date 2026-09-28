import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { 
  Users, 
  Copy, 
  PlusCircle, 
  Calendar, 
  Clock, 
  DoorOpen, 
  BookOpen, 
  UserCheck, 
  Check, 
  FileText, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  ArrowRightLeft,
  Search,
  Filter,
  Edit3,
  Trash2,
  History,
  CheckCircle2,
  Layers,
  Activity,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Download,
  Eye
} from 'lucide-react';
import { ClassGroup, Student } from '../../types';
import { ClassFormModal } from './ClassFormModal';
import { StudentTransferModal } from './StudentTransferModal';
import { ClassStudentsModal } from './ClassStudentsModal';
import { RecordDetailsModal, DetailField } from '../../components/common/RecordDetailsModal';
import { RecordHistoryModal } from '../../components/common/RecordHistoryModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { EmptyState } from '../../components/common/EmptyState';

export const ClassManagerView: React.FC = () => {
  const { 
    classes, 
    students, 
    courses, 
    classTransfers,
    addClassGroup, 
    updateClassGroup, 
    deleteClassGroup, 
    duplicateClassGroup, 
    transferStudent,
    addStudentToClass,
    removeStudentFromClass,
    activeInstitution, 
    firebaseUser,
    activeRole,
    navigate 
  } = useApp();

  // Primary Tab State
  const [activeTab, setActiveTab] = useState<'turmas' | 'transferencias'>('turmas');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('todos');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('todos');

  // Transfer Filter state
  const [transferSearch, setTransferSearch] = useState('');

  const { success, error: toastError } = useToast();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [viewingClass, setViewingClass] = useState<ClassGroup | null>(null);
  const [historyClass, setHistoryClass] = useState<ClassGroup | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassGroup | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [preSelectedStudentForTransfer, setPreSelectedStudentForTransfer] = useState<Student | null>(null);
  const [preSelectedClassIdForTransfer, setPreSelectedClassIdForTransfer] = useState<string | undefined>(undefined);

  const [viewingClassStudents, setViewingClassStudents] = useState<ClassGroup | null>(null);

  const [selectedClassToDuplicate, setSelectedClassToDuplicate] = useState<ClassGroup | null>(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassShift, setNewClassShift] = useState<ClassGroup['shift']>('Manhã');
  const [newClassRoom, setNewClassRoom] = useState('Laboratório Tech 2');

  const handleExportClassesCsv = () => {
    try {
      const headers = ['Turma', 'Curso', 'Turno', 'Sala', 'Formador', 'Capacidade', 'Alunos Matriculados', 'Ocupação (%)', 'Horário', 'Estado'];
      const rows = filteredClasses.map(c => {
        const enrolled = students.filter(s => s.classGroupId === c.id).length;
        const occ = Math.round((enrolled / (c.capacity || 25)) * 100);
        return [
          `"${c.name.replace(/"/g, '""')}"`,
          `"${c.courseName.replace(/"/g, '""')}"`,
          `"${c.shift}"`,
          `"${c.room}"`,
          `"${c.teacherName || 'A definir'}"`,
          `"${c.capacity || 25}"`,
          `"${enrolled}"`,
          `"${occ}%"`,
          `"${c.schedule || '08:00 - 12:00'}"`,
          `"${c.status}"`
        ];
      });
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Turmas_${activeInstitution.code}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('Exportação Concluída', `${filteredClasses.length} turmas exportadas para CSV.`);
    } catch (err) {
      toastError('Erro ao Exportar', 'Falha ao gerar o ficheiro CSV de turmas.');
    }
  };

  // Metrics
  const totalClasses = classes.length;
  const enrolledStudentsCount = students.filter(s => s.classGroupId && s.classGroupId !== '').length;
  const totalCapacity = classes.reduce((acc, c) => acc + (c.capacity || 25), 0);
  const averageOccupancy = totalCapacity > 0 ? Math.round((enrolledStudentsCount / totalCapacity) * 100) : 0;
  const totalTransfersCount = classTransfers.length;

  // Filtered Classes
  const filteredClasses = classes.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = selectedCourseFilter === 'todos' || c.courseId === selectedCourseFilter;
    const matchesShift = selectedShiftFilter === 'todos' || c.shift === selectedShiftFilter;
    const matchesStatus = selectedStatusFilter === 'todos' || c.status === selectedStatusFilter;

    return matchesSearch && matchesCourse && matchesShift && matchesStatus;
  });

  // Filtered Transfers
  const filteredTransfers = classTransfers.filter(t => {
    const q = transferSearch.toLowerCase();
    return (
      t.studentName.toLowerCase().includes(q) ||
      t.studentCode.toLowerCase().includes(q) ||
      t.fromClassName.toLowerCase().includes(q) ||
      t.toClassName.toLowerCase().includes(q) ||
      t.reason.toLowerCase().includes(q) ||
      t.authorizedBy.toLowerCase().includes(q)
    );
  });

  // Handlers
  const handleOpenDuplicate = (c: ClassGroup) => {
    setSelectedClassToDuplicate(c);
    setNewClassName(`${c.name.replace(/202[0-9]/, '2027')}`);
    setNewClassShift(c.shift);
    setNewClassRoom(c.room);
    setDuplicateModalOpen(true);
  };

  const handleDuplicateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassToDuplicate || !newClassName) return;

    duplicateClassGroup(selectedClassToDuplicate.id, newClassName, newClassShift, newClassRoom);
    success('Turma Duplicada', `Nova turma "${newClassName}" criada para o próximo ano letivo.`);
    setDuplicateModalOpen(false);
    setSelectedClassToDuplicate(null);
  };

  const handleSaveClass = (classData: Omit<ClassGroup, 'id' | 'institutionId'>) => {
    if (editingClass) {
      updateClassGroup(editingClass.id, classData);
      success('Turma Atualizada', `A turma "${classData.name}" foi atualizada com sucesso.`);
      setEditingClass(null);
    } else {
      addClassGroup(classData);
      success('Turma Criada', `A turma "${classData.name}" foi cadastrada com sucesso.`);
    }
    setIsCreateModalOpen(false);
  };

  const handleDeleteClass = (c: ClassGroup) => {
    setClassToDelete(c);
  };

  const handleOpenTransfer = (student?: Student, classId?: string) => {
    setPreSelectedStudentForTransfer(student || null);
    setPreSelectedClassIdForTransfer(classId || student?.classGroupId);
    setIsTransferModalOpen(true);
  };

  const currentUserName = firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || (activeRole === 'director' ? 'Diretor Geral' : 'Secretaria Acadêmica');

  return (
    <div id="class-manager-container" className="space-y-6 pb-12">
      {/* Header & KPI Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Gestão de Turmas & Transferências</h1>
              <p className="text-sm text-slate-500">
                Planejamento acadêmico, horários, salas, capacidade de alunos e movimentação entre turmas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-export-classes"
              type="button"
              onClick={handleExportClassesCsv}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Exportar listagem de turmas para CSV"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Exportar CSV
            </button>

            <button
              onClick={() => handleOpenTransfer()}
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Transferir Aluno
            </button>

            <button
              onClick={() => {
                setEditingClass(null);
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Nova Turma
            </button>

            <button
              onClick={() => navigate('diario_professor')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Diário de Aulas
            </button>

            <button
              onClick={() => navigate('horarios_calendario')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Grade de Horários
            </button>
          </div>
        </div>

        {/* KPI Mini-cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Turmas Cadastradas</span>
            <span className="text-xl font-bold text-slate-900">{totalClasses}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Alunos Enturmados</span>
            <span className="text-xl font-bold text-blue-700">{enrolledStudentsCount}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Ocupação Global</span>
            <span className="text-xl font-bold text-emerald-700">{averageOccupancy}%</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Transferências Registradas</span>
            <span className="text-xl font-bold text-purple-700">{totalTransfersCount}</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('turmas')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'turmas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Turmas Ativas & Planejadas ({classes.length})
          </button>

          <button
            onClick={() => setActiveTab('transferencias')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'transferencias'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico de Transferências ({classTransfers.length})
          </button>
        </div>
      </div>

      {/* TAB 1: TURMAS */}
      {activeTab === 'turmas' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Pesquisar turma por nome, curso, formador ou sala..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCourseFilter}
                onChange={e => setSelectedCourseFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="todos">Todos os Cursos</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedShiftFilter}
                onChange={e => setSelectedShiftFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="todos">Todos os Turnos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite (Pós-Laboral)">Noite</option>
                <option value="Sábado">Sábado</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="todos">Todos os Estados</option>
                <option value="Em Curso">Em Curso</option>
                <option value="Inscrições Abertas">Inscrições Abertas</option>
                <option value="Planejada">Planejada</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Grid de Turmas */}
          {filteredClasses.length === 0 ? (
            <EmptyState
              title="Nenhuma turma encontrada"
              description="Não há turmas correspondentes aos filtros selecionados. Tente ajustar os parâmetros ou crie uma nova turma acadêmica."
              actionLabel="Criar Nova Turma"
              onAction={() => {
                setEditingClass(null);
                setIsCreateModalOpen(true);
              }}
              resetLabel="Limpar Filtros"
              onReset={() => {
                setSearchTerm('');
                setSelectedCourseFilter('todos');
                setSelectedShiftFilter('todos');
                setSelectedStatusFilter('todos');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map(c => {
                const classStudents = students.filter(s => s.classGroupId === c.id);
                const capacity = c.capacity || 25;
                const occupancyPercent = Math.round((classStudents.length / capacity) * 100);

                let statusColor = 'bg-blue-50 text-blue-700 border-blue-200/60';
                if (c.status === 'Em Curso') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
                if (c.status === 'Planejada') statusColor = 'bg-amber-50 text-amber-700 border-amber-200/60';
                if (c.status === 'Concluída') statusColor = 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
                if (c.status === 'Cancelada') statusColor = 'bg-rose-50 text-rose-700 border-rose-200/60';

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold">
                            {c.shift}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {c.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingClass(c)}
                            title="Visualizar Detalhes da Turma"
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClass(c);
                              setIsCreateModalOpen(true);
                            }}
                            title="Editar Turma"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryClass(c)}
                            title="Histórico & Auditoria da Turma"
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClass(c)}
                            title="Remover Turma"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{c.name}</h3>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">{c.courseName}</p>

                      {/* Information Box */}
                      <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Formador:
                          </span>
                          <span className="font-semibold text-slate-800 line-clamp-1 max-w-[170px] text-right">
                            {c.teacherName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Horário:
                          </span>
                          <span className="font-medium text-slate-800">{c.schedule || '08:00 - 12:00'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <DoorOpen className="w-3.5 h-3.5 text-slate-400" /> Sala:
                          </span>
                          <span className="font-medium text-slate-800">{c.room}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Layers className="w-3.5 h-3.5 text-slate-400" /> Período:
                          </span>
                          <span className="font-medium text-slate-800">{c.period || '1º Semestre 2026'}</span>
                        </div>

                        {/* Occupancy Progress */}
                        <div className="pt-2 border-t border-slate-200/60 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-600">Lotação:</span>
                            <span className={`font-bold ${classStudents.length >= capacity ? 'text-rose-600' : 'text-slate-800'}`}>
                              {classStudents.length} / {capacity} alunos ({occupancyPercent}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                occupancyPercent >= 100 
                                  ? 'bg-rose-500' 
                                  : occupancyPercent >= 80 
                                  ? 'bg-amber-500' 
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Class Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingClassStudents(c)}
                          className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Alunos ({classStudents.length})
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate('diario_professor', { classId: c.id })}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Abrir Diário de Aulas & Frequência"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                          Diário
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenTransfer(undefined, c.id)}
                          className="flex-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Transferir alunos desta turma"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          Transferir
                        </button>

                        <button
                          type="button"
                          id={`btn-dup-${c.id}`}
                          onClick={() => handleOpenDuplicate(c)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          title="Duplicar turma para o próximo ano letivo"
                        >
                          <Copy className="w-3 h-3 text-slate-500" />
                          Duplicar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTÓRICO DE TRANSFERÊNCIAS */}
      {activeTab === 'transferencias' && (
        <div className="space-y-4">
          {/* Transfer Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Pesquisar por formando, código, turma de origem, destino, motivo ou responsável..."
                value={transferSearch}
                onChange={e => setTransferSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleOpenTransfer()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Nova Transferência
            </button>
          </div>

          {/* Transfers Table / Feed */}
          {filteredTransfers.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <History className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Nenhum registro de transferência encontrado</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Todas as transferências entre turmas geram um histórico auditável oficial com data, motivo, despacho e autorizador.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Formando</th>
                      <th className="py-3 px-4">Turma Origem ➜ Destino</th>
                      <th className="py-3 px-4">Motivo Oficial</th>
                      <th className="py-3 px-4">Autorizado Por</th>
                      <th className="py-3 px-4">Status & Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransfers.map(trf => (
                      <tr key={trf.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {trf.transferDate}
                          </div>
                          <span className="text-[10px] text-slate-400 block">{trf.createdAt || 'Horário de expediente'}</span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{trf.studentName}</p>
                          <span className="text-[10px] text-slate-500 font-medium">Cód: {trf.studentCode}</span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                              {trf.fromClassName}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold text-[11px] border border-purple-200">
                              {trf.toClassName}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">{trf.reason}</span>
                          {trf.notes && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                              "{trf.notes}"
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-medium">{trf.authorizedBy}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Concluída
                          </span>
                          {trf.keepAcademicRecords && (
                            <span className="text-[10px] text-purple-700 block mt-0.5 font-medium">
                              Notas preservadas
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Criar ou Editar Turma */}
      <ClassFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingClass(null);
        }}
        onSave={handleSaveClass}
        initialClass={editingClass}
        courses={courses}
        availableStudents={students}
      />

      {/* MODAL: Transferência de Aluno */}
      <StudentTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setPreSelectedStudentForTransfer(null);
          setPreSelectedClassIdForTransfer(undefined);
        }}
        onConfirmTransfer={transferStudent}
        preSelectedStudent={preSelectedStudentForTransfer}
        preSelectedClassId={preSelectedClassIdForTransfer}
        allStudents={students}
        allClasses={classes}
        currentUserName={currentUserName}
      />

      {/* MODAL: Lista de Alunos da Turma */}
      <ClassStudentsModal
        isOpen={!!viewingClassStudents}
        onClose={() => setViewingClassStudents(null)}
        classGroup={viewingClassStudents}
        students={students}
        allStudents={students}
        onTransferClick={(student) => {
          setViewingClassStudents(null);
          handleOpenTransfer(student, viewingClassStudents?.id);
        }}
        onAddStudent={addStudentToClass}
        onRemoveStudent={removeStudentFromClass}
      />

      {/* MODAL: Duplicar Turma para Próximo Ano Letivo */}
      {duplicateModalOpen && selectedClassToDuplicate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Duplicar Turma para Próximo Ano Letivo</h3>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
              <p className="font-semibold">Regra de Transição Acadêmica Moztechwave:</p>
              <p>
                Os formandos da turma original ({selectedClassToDuplicate.name}) serão transferidos automaticamente para a nova turma,
                com notas e histórico de faltas zerados para o novo ciclo letivo.
              </p>
            </div>

            <form onSubmit={handleDuplicateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nome da Nova Turma</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Turno</label>
                  <select
                    value={newClassShift}
                    onChange={e => setNewClassShift(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite (Pós-Laboral)">Noite (Pós-Laboral)</option>
                    <option value="Sábado">Sábado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Sala / Laboratório</label>
                  <input
                    type="text"
                    value={newClassRoom}
                    onChange={e => setNewClassRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDuplicateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  Confirmar Duplicação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detalhes da Turma Modal */}
      <RecordDetailsModal
        isOpen={!!viewingClass}
        onClose={() => setViewingClass(null)}
        title={viewingClass?.name || 'Detalhes da Turma'}
        subtitle={viewingClass ? `${viewingClass.courseName} • Turno ${viewingClass.shift}` : ''}
        code={viewingClass?.id}
        statusBadge={
          viewingClass && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
              {viewingClass.status}
            </span>
          )
        }
        fields={viewingClass ? [
          { label: 'Nome da Turma', value: viewingClass.name },
          { label: 'Curso Vinculado', value: viewingClass.courseName },
          { label: 'Turno', value: viewingClass.shift },
          { label: 'Sala / Espaço', value: viewingClass.room },
          { label: 'Formador Titular', value: viewingClass.teacherName || 'Não atribuído' },
          { label: 'Horário de Aulas', value: viewingClass.schedule || '08:00 - 12:00' },
          { label: 'Capacidade Máxima', value: `${viewingClass.capacity || 25} vagas` },
          { 
            label: 'Alunos Matriculados', 
            value: `${students.filter(s => s.classGroupId === viewingClass.id).length} formandos` 
          },
          { 
            label: 'Taxa de Ocupação', 
            value: `${Math.round((students.filter(s => s.classGroupId === viewingClass.id).length / (viewingClass.capacity || 25)) * 100)}%` 
          },
          { label: 'Estado da Turma', value: viewingClass.status }
        ] : []}
        onEdit={() => {
          const c = viewingClass;
          setViewingClass(null);
          setEditingClass(c);
          setIsCreateModalOpen(true);
        }}
        onViewHistory={() => {
          const c = viewingClass;
          setViewingClass(null);
          setHistoryClass(c);
        }}
        onDelete={() => {
          const c = viewingClass;
          setViewingClass(null);
          setClassToDelete(c);
        }}
      />

      {/* Histórico & Auditoria da Turma */}
      <RecordHistoryModal
        isOpen={!!historyClass}
        onClose={() => setHistoryClass(null)}
        entityName={historyClass?.name || 'Turma'}
        entityId={historyClass?.id || ''}
      />

      {/* Confirmação de Exclusão da Turma */}
      <ConfirmationModal
        isOpen={!!classToDelete}
        onCancel={() => setClassToDelete(null)}
        title="Remover Turma do Sistema"
        message={`Tem certeza que deseja remover a turma "${classToDelete?.name}"? Os alunos vinculados ficarão sem turma atribuída.`}
        confirmText="Sim, Remover Turma"
        cancelText="Cancelar"
        variant="danger"
        requiredConfirmationWord="ELIMINAR"
        onConfirm={() => {
          if (classToDelete) {
            deleteClassGroup(classToDelete.id);
            if (viewingClassStudents?.id === classToDelete.id) {
              setViewingClassStudents(null);
            }
            success('Turma Removida', `A turma "${classToDelete.name}" foi excluída.`);
            setClassToDelete(null);
          }
        }}
      />
    </div>
  );
};
