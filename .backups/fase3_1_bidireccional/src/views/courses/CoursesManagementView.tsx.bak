import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Course, CourseCategory, CourseModality, CoursePeriodType, CourseStatus } from '../../types';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Award, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  Calendar, 
  ChevronRight,
  Sparkles,
  LayoutGrid,
  List,
  AlertCircle,
  Truck,
  Languages,
  Zap,
  Wrench,
  Anchor,
  FileCheck,
  Monitor,
  Download,
  Eye,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { CourseModal } from './CourseModal';
import { CourseCurriculumDrawer } from './CourseCurriculumDrawer';
import { RecordDetailsModal, DetailField } from '../../components/common/RecordDetailsModal';
import { RecordHistoryModal } from '../../components/common/RecordHistoryModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { EmptyState } from '../../components/common/EmptyState';

export const CoursesManagementView: React.FC = () => {
  const { 
    courses, 
    activeInstitution, 
    addCourse, 
    updateCourse, 
    deleteCourse,
    addModuleToCourse,
    updateCourseModule,
    deleteCourseModule
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedModality, setSelectedModality] = useState<string>('todas');
  const [selectedPeriodType, setSelectedPeriodType] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<Course | null>(null);

  const { success, error: toastError } = useToast();
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [historyCourse, setHistoryCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Category counts and filter items
  const categoryFilters = [
    { id: 'todos', label: 'Todos os Cursos' },
    { id: 'Profissional', label: 'Profissionais' },
    { id: 'Técnico', label: 'Técnicos' },
    { id: 'Máquinas Pesadas', label: 'Máquinas Pesadas' },
    { id: 'Línguas / Inglês', label: 'Línguas / Inglês' },
    { id: 'Eletricidade', label: 'Eletricidade' },
    { id: 'Mecânica', label: 'Mecânica Auto' },
    { id: 'Operações Portuárias', label: 'Operações Portuárias' },
    { id: 'Técnicas Aduaneiras', label: 'Técnicas Aduaneiras' },
    { id: 'Informática', label: 'Informática & TI' },
    { id: 'Curta Duração', label: 'Curta Duração' },
  ];

  const handleExportCsv = () => {
    try {
      const headers = ['Código', 'Nome do Curso', 'Categoria', 'Modalidade', 'Regime', 'Carga Horária', 'Matrícula (MTn)', 'Mensalidade (MTn)', 'Módulos', 'Estado'];
      const rows = filteredCourses.map(c => [
        `"${c.code || ''}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.category}"`,
        `"${c.modality}"`,
        `"${c.periodType}"`,
        `"${c.workloadHours}h"`,
        `"${c.enrollmentFee || 0}"`,
        `"${c.monthlyFee || 0}"`,
        `"${c.modules?.length || 0}"`,
        `"${c.status}"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Cursos_${activeInstitution.code}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('Exportação Concluída', `${filteredCourses.length} cursos exportados com sucesso.`);
    } catch (err) {
      toastError('Falha na Exportação', 'Não foi possível gerar a folha CSV.');
    }
  };

  // Filtering logic
  const filteredCourses = courses.filter(c => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchCode = (c.code || '').toLowerCase().includes(q);
      const matchDesc = (c.description || '').toLowerCase().includes(q);
      const matchReq = (c.requirements || []).some(r => r.toLowerCase().includes(q));
      const matchMod = (c.modules || []).some(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchDesc && !matchReq && !matchMod) {
        return false;
      }
    }

    // Category
    if (selectedCategory !== 'todos') {
      if (c.category !== selectedCategory) return false;
    }

    // Modality
    if (selectedModality !== 'todas') {
      if (c.modality !== selectedModality) return false;
    }

    // Period Type
    if (selectedPeriodType !== 'todos') {
      if (c.periodType !== selectedPeriodType) return false;
    }

    // Status
    if (selectedStatus !== 'todos') {
      if (c.status !== selectedStatus) return false;
    }

    return true;
  });

  // Top Metrics
  const totalWorkloadHours = courses.reduce((acc, c) => acc + (Number(c.workloadHours) || 0), 0);
  const totalModulesCount = courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
  const activeCoursesCount = courses.filter(c => c.status === 'Ativo' || c.status === 'Inscrições Abertas').length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Máquinas Pesadas': return <Truck className="h-4 w-4 text-amber-600" />;
      case 'Línguas / Inglês': return <Languages className="h-4 w-4 text-blue-600" />;
      case 'Eletricidade': return <Zap className="h-4 w-4 text-amber-500" />;
      case 'Mecânica': return <Wrench className="h-4 w-4 text-slate-600" />;
      case 'Operações Portuárias': return <Anchor className="h-4 w-4 text-cyan-600" />;
      case 'Técnicas Aduaneiras': return <FileCheck className="h-4 w-4 text-emerald-600" />;
      case 'Informática': return <Monitor className="h-4 w-4 text-indigo-600" />;
      default: return <GraduationCap className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status?: CourseStatus) => {
    switch (status) {
      case 'Inscrições Abertas':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Inscrições Abertas
          </span>
        );
      case 'Ativo':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Ativo
          </span>
        );
      case 'Em Planejamento':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            Em Planejamento
          </span>
        );
      case 'Suspenso':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            Suspenso
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            Ativo
          </span>
        );
    }
  };

  return (
    <div id="view-courses-management" className="space-y-6">
      
      {/* Header & Global Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Gestão Geral de Cursos</h1>
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800">
              {courses.length} Cursos
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Organização modular e estrutural dos cursos técnicos, profissionais, máquinas, idiomas e formação contínua da{' '}
            <strong className="text-slate-700">{activeInstitution.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-export-courses"
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
            title="Exportar listagem de cursos para CSV"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            id="btn-new-course"
            type="button"
            onClick={() => {
              setCourseToEdit(null);
              setIsCourseModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Novo Curso
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cursos Ativos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{activeCoursesCount}</p>
          <span className="text-xs text-emerald-600 font-medium">Disponíveis para turmas</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disciplinas & Módulos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalModulesCount}</p>
          <span className="text-xs text-blue-600 font-medium">Matrizes curriculares ativas</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Carga Horária Ofertada</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalWorkloadHours.toLocaleString()}h</p>
          <span className="text-xs text-amber-700 font-medium">Horas de formação prática e teórica</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estruturas Acadêmicas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">Flexíveis</p>
          <span className="text-xs text-purple-600 font-medium">Trimestrais, Semestrais & Por Etapas</span>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categoryFilters.map(tab => {
          const isSelected = selectedCategory === tab.id;
          const count = tab.id === 'todos' 
            ? courses.length 
            : courses.filter(c => c.category === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="input-search-courses"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome, código (ex: MAQ-OP-03), módulo ou requisito..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white outline-hidden transition"
            />
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Modalidade */}
            <select
              id="select-filter-modality"
              value={selectedModality}
              onChange={e => setSelectedModality(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 outline-hidden"
            >
              <option value="todas">Todas as Modalidades</option>
              <option value="Presencial">Presencial</option>
              <option value="Prático em Oficina/Campo">Oficina / Campo</option>
              <option value="Semi-presencial">Semi-presencial</option>
              <option value="Online EAD">Online EAD</option>
              <option value="Híbrido">Híbrido</option>
            </select>

            {/* Periodicidade */}
            <select
              id="select-filter-period"
              value={selectedPeriodType}
              onChange={e => setSelectedPeriodType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 outline-hidden"
            >
              <option value="todos">Todas Estruturas</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
              <option value="por_modulo">Por Módulo</option>
              <option value="por_etapa">Por Etapa</option>
              <option value="intensivo">Intensivo</option>
            </select>

            {/* Estado */}
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 outline-hidden"
            >
              <option value="todos">Todos os Estados</option>
              <option value="Ativo">Ativo</option>
              <option value="Inscrições Abertas">Inscrições Abertas</option>
              <option value="Em Planejamento">Em Planejamento</option>
              <option value="Suspenso">Suspenso</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Visualização em Tabela"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Cards / Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => {
            const modulesCount = course.modules?.length || 0;
            const monthlyValue = course.monthlyFee ?? course.feeMonthly ?? 0;
            const hasMonthlyFee = monthlyValue > 0;

            return (
              <div
                key={course.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition duration-200 overflow-hidden group"
              >
                {/* Card Top Banner */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        {getCategoryIcon(course.category)}
                      </span>
                      <div>
                        <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {course.code || 'S/CÓD'}
                        </span>
                        <span className="ml-1.5 text-xs text-slate-500 font-medium">
                          {course.category}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                    {course.name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 mb-3 leading-relaxed">
                    {course.description || 'Formação com foco em capacitação prática e inserção profissional no mercado.'}
                  </p>

                  {/* Highlights / Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {course.workloadHours || 120}h ({course.duration})
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                      {course.modality || 'Presencial'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 border border-amber-200/60 capitalize">
                      <Calendar className="h-3 w-3 text-amber-600" />
                      {course.periodType?.replace('_', ' ') || 'semestral'}
                    </span>
                  </div>

                  {/* Requirements preview */}
                  {course.requirements && course.requirements.length > 0 && (
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs text-slate-600 mb-3">
                      <strong className="text-slate-800 text-[11px] block uppercase tracking-wider mb-1">
                        Requisito de Ingresso:
                      </strong>
                      <span className="line-clamp-1 text-slate-600">
                        {course.requirements[0]}
                        {course.requirements.length > 1 && ` (+${course.requirements.length - 1} requisitos)`}
                      </span>
                    </div>
                  )}

                  {/* Pricing Overview */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Matrícula / Inscrição</span>
                      <strong className="text-slate-800 font-bold">
                        {(course.registrationFee || 0).toLocaleString()} MTn
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        {hasMonthlyFee ? 'Mensalidade' : 'Preço Total'}
                      </span>
                      <strong className="text-emerald-700 font-bold">
                        {hasMonthlyFee 
                          ? `${monthlyValue.toLocaleString()} MTn/mês` 
                          : `${(course.price || 0).toLocaleString()} MTn`}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                  <button
                    id={`btn-curriculum-${course.id}`}
                    type="button"
                    onClick={() => setSelectedCourseForCurriculum(course)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition cursor-pointer"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Disciplinas ({modulesCount})
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewingCourse(course)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                      title="Visualizar Ficha Completa do Curso"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-edit-course-${course.id}`}
                      type="button"
                      onClick={() => {
                        setCourseToEdit(course);
                        setIsCourseModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200 transition cursor-pointer"
                      title="Editar Curso"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryCourse(course)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                      title="Histórico & Auditoria"
                    >
                      <History className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-delete-course-${course.id}`}
                      type="button"
                      onClick={() => setCourseToDelete(course)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Excluir Curso"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Código & Nome</th>
                  <th className="px-4 py-3.5">Categoria</th>
                  <th className="px-4 py-3.5">Modalidade</th>
                  <th className="px-4 py-3.5">Estrutura</th>
                  <th className="px-4 py-3.5">Carga Horária</th>
                  <th className="px-4 py-3.5">Disciplinas</th>
                  <th className="px-4 py-3.5">Valores (MTn)</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {c.code || 'S/CÓD'}
                        </span>
                        <strong className="text-slate-900 font-semibold">{c.name}</strong>
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">{c.duration}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                      {c.category}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {c.modality || 'Presencial'}
                    </td>
                    <td className="px-4 py-3.5 text-xs capitalize text-slate-700">
                      {c.periodType?.replace('_', ' ') || 'semestral'}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-800">
                      {c.workloadHours || 0}h
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedCourseForCurriculum(c)}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition"
                      >
                        {c.modules?.length || 0} Módulos
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {(c.monthlyFee || c.feeMonthly || 0) > 0 ? (
                        <span className="text-emerald-700 font-bold">
                          {(c.monthlyFee || c.feeMonthly).toLocaleString()} MT/mês
                        </span>
                      ) : (
                        <span className="text-slate-800 font-bold">
                          {(c.price || 0).toLocaleString()} MT Total
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingCourse(c)}
                          className="p-1 text-slate-400 hover:text-sky-600 transition cursor-pointer"
                          title="Visualizar Curso"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCourseToEdit(c);
                            setIsCourseModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                          title="Editar Curso"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryCourse(c)}
                          className="p-1 text-slate-400 hover:text-purple-600 transition cursor-pointer"
                          title="Histórico & Auditoria"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourseToDelete(c)}
                          className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Excluir Curso"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <EmptyState
          title="Nenhum curso encontrado"
          description="Nenhum curso corresponde aos filtros e termos de busca selecionados. Tente ajustar os parâmetros ou cadastrar um novo curso na instituição."
          resetLabel="Limpar Todos os Filtros"
          onReset={() => {
            setSearchQuery('');
            setSelectedCategory('todos');
            setSelectedModality('todas');
            setSelectedPeriodType('todos');
            setSelectedStatus('todos');
          }}
          actionLabel="+ Novo Curso"
          onAction={() => {
            setCourseToEdit(null);
            setIsCourseModalOpen(true);
          }}
        />
      )}

      {/* Course Modal (Create & Edit) */}
      {isCourseModalOpen && (
        <CourseModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          courseToEdit={courseToEdit}
          onSave={(courseData) => {
            if (courseToEdit) {
              updateCourse(courseToEdit.id, courseData);
              success('Curso Atualizado', `O curso "${courseData.name}" foi atualizado com sucesso.`);
            } else {
              addCourse(courseData);
              success('Curso Cadastrado', `O curso "${courseData.name}" foi criado e disponibilizado no catálogo.`);
            }
          }}
        />
      )}

      {/* Curriculum & Modules Drawer */}
      {selectedCourseForCurriculum && (
        <CourseCurriculumDrawer
          isOpen={!!selectedCourseForCurriculum}
          onClose={() => setSelectedCourseForCurriculum(null)}
          course={courses.find(c => c.id === selectedCourseForCurriculum.id) || selectedCourseForCurriculum}
          onAddModule={(courseId, moduleData) => {
            addModuleToCourse(courseId, moduleData);
            success('Disciplina Adicionada', `Módulo inserido na matriz do curso.`);
          }}
          onUpdateModule={(courseId, moduleId, updates) => {
            updateCourseModule(courseId, moduleId, updates);
            success('Disciplina Atualizada', `Módulo atualizado.`);
          }}
          onDeleteModule={(courseId, moduleId) => {
            deleteCourseModule(courseId, moduleId);
            success('Disciplina Removida', `Módulo removido da matriz.`);
          }}
        />
      )}

      {/* Detalhes do Curso Modal */}
      <RecordDetailsModal
        isOpen={!!viewingCourse}
        onClose={() => setViewingCourse(null)}
        title={viewingCourse?.name || 'Detalhes do Curso'}
        subtitle={viewingCourse ? `${viewingCourse.category} • ${viewingCourse.modality}` : ''}
        code={viewingCourse?.code}
        statusBadge={
          viewingCourse && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
              {viewingCourse.status}
            </span>
          )
        }
        fields={viewingCourse ? [
          { label: 'Nome Oficial do Curso', value: viewingCourse.name },
          { label: 'Código SIGAR', value: <span className="font-mono text-amber-500 font-bold">{viewingCourse.code}</span> },
          { label: 'Área / Categoria', value: viewingCourse.category },
          { label: 'Modalidade de Ensino', value: viewingCourse.modality },
          { label: 'Estrutura Curricular', value: viewingCourse.periodType },
          { label: 'Carga Horária Total', value: `${viewingCourse.workloadHours} horas letivas` },
          { label: 'Taxa de Inscrição / Matrícula', value: `${(viewingCourse.enrollmentFee || 0).toLocaleString()} MTn` },
          { label: 'Propina Mensal', value: `${(viewingCourse.monthlyFee || viewingCourse.feeMonthly || 0).toLocaleString()} MTn` },
          { label: 'Total de Disciplinas / Módulos', value: `${viewingCourse.modules?.length || 0} módulos homologados` },
          { label: 'Situação Cadastral', value: viewingCourse.status },
          { label: 'Descrição & Perfil Profissional', value: viewingCourse.description || 'Descrição detalhada em fase de preenchimento curricular.', fullWidth: true },
          { label: 'Pré-requisitos de Admissão', value: viewingCourse.requirements?.join(', ') || 'Sem requisitos restritivos adicionais.', fullWidth: true }
        ] : []}
        onEdit={() => {
          const c = viewingCourse;
          setViewingCourse(null);
          setCourseToEdit(c);
          setIsCourseModalOpen(true);
        }}
        onViewHistory={() => {
          const c = viewingCourse;
          setViewingCourse(null);
          setHistoryCourse(c);
        }}
        onDelete={() => {
          const c = viewingCourse;
          setViewingCourse(null);
          setCourseToDelete(c);
        }}
      />

      {/* Histórico & Auditoria do Curso */}
      <RecordHistoryModal
        isOpen={!!historyCourse}
        onClose={() => setHistoryCourse(null)}
        entityName={historyCourse?.name || 'Curso'}
        entityId={historyCourse?.id || ''}
        entityCode={historyCourse?.code}
      />

      {/* Confirmação de Exclusão de Curso */}
      <ConfirmationModal
        isOpen={!!courseToDelete}
        onCancel={() => setCourseToDelete(null)}
        title="Remover Curso do Catálogo"
        message={`Tem certeza que deseja remover o curso "${courseToDelete?.name}"? Esta ação removerá sua estrutura curricular e afetará as turmas que não estiverem concluídas.`}
        confirmText="Sim, Remover Curso"
        cancelText="Cancelar"
        variant="danger"
        requiredConfirmationWord="ELIMINAR"
        onConfirm={() => {
          if (courseToDelete) {
            deleteCourse(courseToDelete.id);
            success('Curso Removido', `O curso "${courseToDelete.name}" foi excluído.`);
            setCourseToDelete(null);
          }
        }}
      />

    </div>
  );
};
