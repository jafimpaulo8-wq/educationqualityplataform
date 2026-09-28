import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  GraduationCap, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  BookOpen, 
  Layers, 
  FileText, 
  Download, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  UserCheck, 
  Building2, 
  MapPin, 
  Eye, 
  FileCheck, 
  Upload, 
  ExternalLink,
  MessageSquare,
  History
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Teacher, TeacherDocument, ClassGroup } from '../../types';
import { RecordDetailsModal, DetailField } from '../../components/common/RecordDetailsModal';
import { RecordHistoryModal } from '../../components/common/RecordHistoryModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { EmptyState } from '../../components/common/EmptyState';

export const TeachersManagementView: React.FC = () => {
  const { 
    teachers, 
    allTeachers, 
    addTeacher, 
    updateTeacher, 
    deleteTeacher, 
    classes, 
    courses, 
    schedules, 
    activeInstitution, 
    activeBranchId, 
    setActiveTeacherId, 
    navigate,
    openWhatsAppMessage
  } = useApp();

  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'professor' | 'formador'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Ativo' | 'Inativo' | 'Licença'>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(teachers[0] || null);
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [historyTeacher, setHistoryTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'atribuicoes' | 'horarios' | 'documentos'>('perfil');

  // Form State for New/Edit Teacher
  const [formData, setFormData] = useState({
    fullName: '',
    type: 'formador' as 'professor' | 'formador',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+258 84 000 0000',
    email: '',
    academicDegree: 'Licenciatura em Informática',
    specialty: 'Engenharia de Software',
    status: 'Ativo' as 'Ativo' | 'Inativo' | 'Licença',
    biNumber: '110100234567M',
    biography: '',
    courseIds: [] as string[],
    disciplineNames: [] as string[],
    classGroupIds: [] as string[],
    disciplineInput: ''
  });

  // Filtered teachers list
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || teacher.type === roleFilter;
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const openCreateModal = () => {
    setTeacherToEdit(null);
    setFormData({
      fullName: '',
      type: 'formador',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+258 84 ',
      email: '',
      academicDegree: 'Licenciatura',
      specialty: '',
      status: 'Ativo',
      biNumber: '',
      biography: '',
      courseIds: courses.length > 0 ? [courses[0].id] : [],
      disciplineNames: ['Módulo Principal'],
      classGroupIds: classes.length > 0 ? [classes[0].id] : [],
      disciplineInput: ''
    });
    setIsCreatingModal(true);
  };

  const openEditModal = (t: Teacher) => {
    setTeacherToEdit(t);
    setFormData({
      fullName: t.fullName,
      type: t.type,
      photoUrl: t.photoUrl || '',
      phone: t.phone,
      email: t.email,
      academicDegree: t.academicDegree,
      specialty: t.specialty,
      status: t.status,
      biNumber: t.biNumber || '',
      biography: t.biography || '',
      courseIds: t.courseIds || [],
      disciplineNames: t.disciplineNames || [],
      classGroupIds: t.classGroupIds || [],
      disciplineInput: ''
    });
    setIsCreatingModal(true);
  };

  const handleExportTeachersCsv = () => {
    try {
      const headers = ['Código', 'Nome Completo', 'Tipo', 'Especialidade', 'Grau Acadêmico', 'Telefone', 'Email', 'BI', 'Turmas Atribuídas', 'Estado'];
      const rows = filteredTeachers.map(t => [
        `"${t.code}"`,
        `"${t.fullName.replace(/"/g, '""')}"`,
        `"${t.type === 'formador' ? 'Formador Técnico' : 'Professor Teórico'}"`,
        `"${t.specialty.replace(/"/g, '""')}"`,
        `"${t.academicDegree.replace(/"/g, '""')}"`,
        `"${t.phone}"`,
        `"${t.email}"`,
        `"${t.biNumber || ''}"`,
        `"${t.classGroupIds?.length || 0}"`,
        `"${t.status}"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Docentes_${activeInstitution.code}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('Exportação Concluída', `${filteredTeachers.length} docentes exportados com sucesso.`);
    } catch (err) {
      toastError('Erro na Exportação', 'Não foi possível gerar a folha de docentes.');
    }
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    const assignedCourses = courses.filter(c => formData.courseIds.includes(c.id)).map(c => c.name);
    const assignedClasses = classes.filter(cl => formData.classGroupIds.includes(cl.id)).map(cl => cl.name);

    const newTeacherData = {
      institutionId: activeInstitution.id,
      fullName: formData.fullName,
      type: formData.type,
      photoUrl: formData.photoUrl,
      phone: formData.phone,
      email: formData.email,
      academicDegree: formData.academicDegree,
      specialty: formData.specialty,
      status: formData.status,
      biNumber: formData.biNumber,
      biography: formData.biography,
      courseIds: formData.courseIds,
      courseNames: assignedCourses,
      disciplineIds: [],
      disciplineNames: formData.disciplineNames,
      classGroupIds: formData.classGroupIds,
      classGroupNames: assignedClasses,
      documents: teacherToEdit?.documents || [
        {
          id: `doc-${Date.now()}-1`,
          name: 'Bilhete de Identidade (BI)',
          type: 'bi' as const,
          url: '#',
          uploadedAt: new Date().toISOString().split('T')[0],
          size: '1.2 MB'
        },
        {
          id: `doc-${Date.now()}-2`,
          name: 'Curriculum Vitae Homologado',
          type: 'curriculo' as const,
          url: '#',
          uploadedAt: new Date().toISOString().split('T')[0],
          size: '2.4 MB'
        }
      ]
    };

    if (teacherToEdit) {
      updateTeacher(teacherToEdit.id, newTeacherData);
      const updated = { ...teacherToEdit, ...newTeacherData };
      setSelectedTeacher(updated);
      success('Docente Atualizado', `Os dados de "${formData.fullName}" foram atualizados com sucesso.`);
    } else {
      const created = addTeacher(newTeacherData);
      setSelectedTeacher(created);
      success('Docente Cadastrado', `Docente "${formData.fullName}" registrado com sucesso.`);
    }
    setTeacherToEdit(null);
    setIsCreatingModal(false);
  };

  const handleOpenTeacherPortal = (teacher: Teacher) => {
    setActiveTeacherId(teacher.id);
    navigate('portal_professor', { teacherId: teacher.id });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Gestão de Professores & Formadores
              </h1>
              <p className="text-sm text-slate-400">
                Corpo docente de {activeInstitution.name} • Cadastro completo, competências, turmas e horários atribuídos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-export-teachers"
            type="button"
            onClick={handleExportTeachersCsv}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Exportar listagem de docentes para CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Exportar CSV
          </button>

          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Docente</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total de Docentes</span>
          <div className="text-2xl font-bold text-white mt-1">{teachers.length}</div>
          <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {teachers.filter(t => t.status === 'Ativo').length} Ativos no semestre
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Formadores Técnicos</span>
          <div className="text-2xl font-bold text-sky-400 mt-1">
            {teachers.filter(t => t.type === 'formador').length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Áreas Profissionais & Oficinas</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Professores Teóricos</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {teachers.filter(t => t.type !== 'formador').length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Módulos Teóricos & Fundamentos</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Turmas Cobertas</span>
          <div className="text-2xl font-bold text-violet-400 mt-1">
            {classes.length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Alocação Pedagógica</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por nome, código, especialidade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                roleFilter === 'all' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setRoleFilter('formador')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                roleFilter === 'formador' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Formadores
            </button>
            <button
              onClick={() => setRoleFilter('professor')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                roleFilter === 'professor' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Professores
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">Todos os Estados</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Licença">Em Licença</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Teacher List (Left) + Detail View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Teacher List Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
            <span>Docentes Encontrados ({filteredTeachers.length})</span>
            <span>Selecione para ver detalhes</span>
          </div>

          {filteredTeachers.length === 0 ? (
            <EmptyState
              title="Nenhum docente encontrado"
              description="Não encontramos nenhum professor ou formador correspondente aos filtros de busca e categoria selecionados."
              actionLabel="Cadastrar Docente"
              onAction={openCreateModal}
              resetLabel="Limpar Filtros"
              onReset={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
            />
          ) : (
            filteredTeachers.map(teacher => {
              const isSelected = selectedTeacher?.id === teacher.id;
              const assignedCount = teacher.classGroupIds?.length || 0;

              return (
                <div
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={teacher.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={teacher.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700/80 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {teacher.fullName}
                        </h3>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          teacher.type === 'formador'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {teacher.type === 'formador' ? 'Formador' : 'Professor'}
                        </span>
                      </div>

                      <p className="text-xs text-emerald-400 font-medium truncate mt-0.5">
                        {teacher.specialty}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-mono text-[11px] text-slate-400">
                            {teacher.code}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-500" />
                            {assignedCount} {assignedCount === 1 ? 'turma' : 'turmas'}
                          </span>
                        </div>

                        {/* Quick Action Icons */}
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setViewingTeacher(teacher)}
                            title="Visualizar Ficha Completa"
                            className="p-1 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(teacher)}
                            title="Editar Docente"
                            className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryTeacher(teacher)}
                            title="Histórico do Docente"
                            className="p-1 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Teacher Details Panel */}
        <div className="lg:col-span-7">
          {selectedTeacher ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden sticky top-6">
              {/* Teacher Header Banner */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/60 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedTeacher.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={selectedTeacher.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md shadow-emerald-950/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white">
                          {selectedTeacher.fullName}
                        </h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                          {selectedTeacher.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-0.5">
                        {selectedTeacher.academicDegree} • {selectedTeacher.specialty}
                      </p>
                      <span className="text-xs text-slate-500 font-mono">
                        Código: {selectedTeacher.code}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingTeacher(selectedTeacher)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                      title="Visualizar Ficha Completa"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>Ver Ficha</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(selectedTeacher)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                      title="Editar Docente"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryTeacher(selectedTeacher)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                      title="Histórico & Auditoria"
                    >
                      <History className="w-3.5 h-3.5 text-purple-400" />
                      <span>Histórico</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenTeacherPortal(selectedTeacher)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                    >
                      <span>Portal do Professor</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-t border-slate-800/80 mt-6 pt-3">
                  <button
                    onClick={() => setActiveTab('perfil')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'perfil' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Perfil & Contatos
                  </button>
                  <button
                    onClick={() => setActiveTab('atribuicoes')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'atribuicoes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Turmas & Cursos ({selectedTeacher.classGroupIds?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('horarios')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'horarios' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Horários Semanais
                  </button>
                  <button
                    onClick={() => setActiveTab('documentos')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'documentos' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Documentos ({selectedTeacher.documents?.length || 0})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'perfil' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium block">Telefone / WhatsApp</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-white font-medium">{selectedTeacher.phone}</span>
                          <button
                            onClick={() => openWhatsAppMessage(selectedTeacher.phone, `Olá Professor(a) ${selectedTeacher.fullName}, contato da Direção de ${activeInstitution.name}.`)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Conversar no WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium block">Email Institucional</span>
                        <span className="text-white font-medium block mt-1 truncate">
                          {selectedTeacher.email || 'Não informado'}
                        </span>
                      </div>

                      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium block">Documento de Identidade</span>
                        <span className="text-white font-medium block mt-1">
                          BI: {selectedTeacher.biNumber || '110100492819M'}
                        </span>
                      </div>

                      <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium block">Categoria / Função</span>
                        <span className="text-white font-medium block mt-1">
                          {selectedTeacher.type === 'formador' ? 'Formador Técnico Profissional' : 'Professor Teórico / Instrutor'}
                        </span>
                      </div>
                    </div>

                    {selectedTeacher.biography && (
                      <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                        <span className="text-xs text-slate-400 font-medium block mb-1">Resumo Curricular / Biografia</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedTeacher.biography}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setTeacherToDelete(selectedTeacher)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Desvincular Docente</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(selectedTeacher)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Editar Informações</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenTeacherPortal(selectedTeacher)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Acessar Diário do Docente</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'atribuicoes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        Turmas & Disciplinas sob responsabilidade deste docente
                      </span>
                    </div>

                    {selectedTeacher.classGroupIds && selectedTeacher.classGroupIds.length > 0 ? (
                      <div className="space-y-3">
                        {classes
                          .filter(c => selectedTeacher.classGroupIds.includes(c.id))
                          .map(turma => (
                            <div
                              key={turma.id}
                              className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                            >
                              <div>
                                <h4 className="text-sm font-semibold text-white">{turma.name}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Curso: {turma.courseName} • Sala: {turma.room} • Turno: {turma.shift}
                                </p>
                              </div>
                              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                                {turma.studentIds?.length || 0} formandos
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                        <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Nenhuma turma atribuída a este professor até o momento.</p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <span className="text-xs text-slate-400 font-medium block mb-2">Disciplinas & Módulos Ministrados:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeacher.disciplineNames?.map((disc, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                          >
                            {disc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'horarios' && (
                  <div className="space-y-4">
                    <span className="text-xs text-slate-400 font-medium block">
                      Grade horária alocada no sistema
                    </span>

                    {schedules.filter(sch => 
                      sch.teacherId === selectedTeacher.id || 
                      (sch.teacherName && sch.teacherName.toLowerCase().includes(selectedTeacher.fullName.toLowerCase().split(' ')[1] || ''))
                    ).length > 0 ? (
                      <div className="space-y-2.5">
                        {schedules
                          .filter(sch => 
                            sch.teacherId === selectedTeacher.id || 
                            (sch.teacherName && sch.teacherName.toLowerCase().includes(selectedTeacher.fullName.toLowerCase().split(' ')[1] || ''))
                          )
                          .map(slot => (
                            <div
                              key={slot.id}
                              className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                                  <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-white">
                                    {slot.startTime} - {slot.endTime} • {slot.disciplineName}
                                  </h5>
                                  <p className="text-[11px] text-slate-400">
                                    Turma: {slot.classGroupName} • Sala: {slot.room}
                                  </p>
                                </div>
                              </div>

                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {slot.dayOfWeek === 1 ? 'Segunda-feira' :
                                 slot.dayOfWeek === 2 ? 'Terça-feira' :
                                 slot.dayOfWeek === 3 ? 'Quarta-feira' :
                                 slot.dayOfWeek === 4 ? 'Quinta-feira' :
                                 slot.dayOfWeek === 5 ? 'Sexta-feira' : 'Sábado'}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                        <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Nenhum horário registrado na grade para este docente.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documentos' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Documentos Cadastrais Anexados</span>
                      <button
                        onClick={() => alert('Para anexar novos documentos ao docente, use o upload local.')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Anexar Documento</span>
                      </button>
                    </div>

                    {selectedTeacher.documents && selectedTeacher.documents.length > 0 ? (
                      selectedTeacher.documents.map(doc => (
                        <div
                          key={doc.id}
                          className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 text-slate-300 rounded-lg">
                              <FileCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <h5 className="text-xs font-semibold text-white">{doc.name}</h5>
                              <span className="text-[11px] text-slate-400">
                                Tipo: {doc.type.toUpperCase()} • {doc.size || '1.5 MB'} • Enviado em {doc.uploadedAt}
                              </span>
                            </div>
                          </div>

                          <a
                            href={doc.url}
                            download={doc.name}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Descarregar documento"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Nenhum documento anexado ainda.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
              <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold">Selecione um professor/formador</p>
              <p className="text-xs text-slate-500 mt-1">Veja seus detalhes cadastrais, turmas atribuídas e horários.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Cadastrar Docente */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>{teacherToEdit ? 'Editar Dados do Docente' : 'Cadastrar Novo Professor / Formador'}</span>
              </h3>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Dr. António Zacarias"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Categoria Docente *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="formador">Formador Técnico Profissional</option>
                    <option value="professor">Professor Teórico / Instrutor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+258 84 123 4567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="docente@escola.mz"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Formação Acadêmica *</label>
                  <input
                    type="text"
                    placeholder="ex: Licenciatura em Engenharia Informática"
                    value={formData.academicDegree}
                    onChange={e => setFormData({ ...formData, academicDegree: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Especialidade Principal *</label>
                  <input
                    type="text"
                    placeholder="ex: Cibersegurança & Redes"
                    value={formData.specialty}
                    onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Número do BI</label>
                  <input
                    type="text"
                    placeholder="110100492819M"
                    value={formData.biNumber}
                    onChange={e => setFormData({ ...formData, biNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">URL da Fotografia</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.photoUrl}
                    onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Atribuição de Cursos */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Cursos Associados</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  {courses.map(course => (
                    <label key={course.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.courseIds.includes(course.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({ ...formData, courseIds: [...formData.courseIds, course.id] });
                          } else {
                            setFormData({ ...formData, courseIds: formData.courseIds.filter(id => id !== course.id) });
                          }
                        }}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="truncate">{course.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Atribuição de Turmas */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Turmas Atribuídas</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  {classes.map(turma => (
                    <label key={turma.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.classGroupIds.includes(turma.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({ ...formData, classGroupIds: [...formData.classGroupIds, turma.id] });
                          } else {
                            setFormData({ ...formData, classGroupIds: formData.classGroupIds.filter(id => id !== turma.id) });
                          }
                        }}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="truncate">{turma.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  {teacherToEdit ? 'Salvar Alterações' : 'Salvar Cadastro do Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RecordDetailsModal - Visualização Completa */}
      <RecordDetailsModal
        isOpen={!!viewingTeacher}
        onClose={() => setViewingTeacher(null)}
        title={viewingTeacher?.fullName || 'Ficha do Docente'}
        subtitle={viewingTeacher ? `${viewingTeacher.specialty} • ${viewingTeacher.academicDegree}` : ''}
        code={viewingTeacher?.code}
        statusBadge={
          viewingTeacher && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              {viewingTeacher.status}
            </span>
          )
        }
        fields={viewingTeacher ? [
          { label: 'Nome Completo', value: viewingTeacher.fullName },
          { label: 'Código Institucional', value: viewingTeacher.code },
          { label: 'Categoria Funcional', value: viewingTeacher.type === 'formador' ? 'Formador Técnico Profissional' : 'Professor Teórico' },
          { label: 'Especialidade / Área', value: viewingTeacher.specialty },
          { label: 'Grau Acadêmico', value: viewingTeacher.academicDegree },
          { label: 'Telefone / WhatsApp', value: viewingTeacher.phone },
          { label: 'Email Institucional', value: viewingTeacher.email || 'Não informado' },
          { label: 'Documento de Identidade (BI)', value: viewingTeacher.biNumber || '110100234567M' },
          { 
            label: 'Cursos Associados', 
            value: viewingTeacher.courseNames && viewingTeacher.courseNames.length > 0 ? viewingTeacher.courseNames.join(', ') : 'Nenhum curso associado' 
          },
          { 
            label: 'Turmas Atribuídas', 
            value: viewingTeacher.classGroupNames && viewingTeacher.classGroupNames.length > 0 ? viewingTeacher.classGroupNames.join(', ') : `${viewingTeacher.classGroupIds?.length || 0} turmas` 
          },
          { 
            label: 'Resumo Curricular / Biografia', 
            value: viewingTeacher.biography || 'Sem biografia cadastrada.',
            fullWidth: true
          }
        ] : []}
        onEdit={() => {
          const t = viewingTeacher;
          setViewingTeacher(null);
          if (t) openEditModal(t);
        }}
        onViewHistory={() => {
          const t = viewingTeacher;
          setViewingTeacher(null);
          setHistoryTeacher(t);
        }}
        onDelete={() => {
          const t = viewingTeacher;
          setViewingTeacher(null);
          setTeacherToDelete(t);
        }}
      />

      {/* RecordHistoryModal - Histórico & Auditoria */}
      <RecordHistoryModal
        isOpen={!!historyTeacher}
        onClose={() => setHistoryTeacher(null)}
        entityName={historyTeacher?.fullName || 'Docente'}
        entityId={historyTeacher?.id || ''}
      />

      {/* ConfirmationModal - Desvinculação / Exclusão */}
      <ConfirmationModal
        isOpen={!!teacherToDelete}
        onCancel={() => setTeacherToDelete(null)}
        title="Desvincular Docente da Instituição"
        message={`Tem certeza que deseja desvincular o docente "${teacherToDelete?.fullName}" (${teacherToDelete?.code})? As turmas e diários atribuídos a este professor perderão a titularidade.`}
        confirmText="Sim, Desvincular Docente"
        cancelText="Cancelar"
        variant="danger"
        requiredConfirmationWord="DESVINCULAR"
        onConfirm={() => {
          if (teacherToDelete) {
            deleteTeacher(teacherToDelete.id);
            if (selectedTeacher?.id === teacherToDelete.id) {
              const remaining = teachers.filter(t => t.id !== teacherToDelete.id);
              setSelectedTeacher(remaining[0] || null);
            }
            success('Docente Desvinculado', `O docente "${teacherToDelete.fullName}" foi removido do corpo acadêmico.`);
            setTeacherToDelete(null);
          }
        }}
      />
    </div>
  );
};
