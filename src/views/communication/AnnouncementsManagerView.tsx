import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Announcement, 
  AnnouncementType, 
  AnnouncementTarget, 
  AnnouncementPriority, 
  AnnouncementStatus 
} from '../../types';
import { hasPermission } from '../../types/rbac';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Bell, 
  DollarSign, 
  CalendarDays, 
  Share2, 
  Printer, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Layers, 
  AlertTriangle,
  ArrowRight,
  BookOpen,
  MapPin,
  CheckCheck,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { AnnouncementFormModal } from './components/AnnouncementFormModal';
import { AnnouncementDetailModal } from './components/AnnouncementDetailModal';
import { AnnouncementPrintModal } from './components/AnnouncementPrintModal';

export const AnnouncementsManagerView: React.FC = () => {
  const { 
    announcements, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement, 
    publishAnnouncementNow,
    confirmAnnouncementAttendance,
    markAnnouncementAsRead,
    courses, 
    classes, 
    activeRole,
    activeInstitution
  } = useApp();

  // RBAC checks
  const canPublish = hasPermission(activeRole, 'comunicados.publish');
  const canDelete = hasPermission(activeRole, 'comunicados.delete');

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedTarget, setSelectedTarget] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedPriority, setSelectedPriority] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [announcementToPrint, setAnnouncementToPrint] = useState<Announcement | null>(null);

  // Lists for targeting
  const coursesList = useMemo(() => {
    return courses.map(c => ({ id: c.id, name: c.name }));
  }, [courses]);

  const classesList = useMemo(() => {
    return classes.map(cls => ({ id: cls.id, name: cls.name, courseId: cls.courseId }));
  }, [classes]);

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      // Type filter
      if (selectedType !== 'todos' && a.type !== selectedType) return false;

      // Target filter
      if (selectedTarget !== 'todos' && a.targetAudience !== selectedTarget) return false;

      // Status filter
      if (selectedStatus !== 'todos' && a.status !== selectedStatus) return false;

      // Priority filter
      if (selectedPriority !== 'todas' && a.priority !== selectedPriority) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(query);
        const matchSummary = a.summary ? a.summary.toLowerCase().includes(query) : false;
        const matchContent = a.content.toLowerCase().includes(query);
        const matchAuthor = a.authorName.toLowerCase().includes(query);
        const matchCourse = a.targetCourseName ? a.targetCourseName.toLowerCase().includes(query) : false;
        const matchClass = a.targetClassName ? a.targetClassName.toLowerCase().includes(query) : false;

        if (!matchTitle && !matchSummary && !matchContent && !matchAuthor && !matchCourse && !matchClass) {
          return false;
        }
      }

      return true;
    });
  }, [announcements, selectedType, selectedTarget, selectedStatus, selectedPriority, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = announcements.length;
    const published = announcements.filter(a => a.status === 'publicado').length;
    const scheduled = announcements.filter(a => a.status === 'agendado').length;
    const totalViews = announcements.reduce((acc, a) => acc + (a.readCount || 0), 0);
    const totalConfirmed = announcements.reduce((acc, a) => acc + (a.confirmedCount || 0), 0);

    return { total, published, scheduled, totalViews, totalConfirmed };
  }, [announcements]);

  // Scheduled Queue
  const scheduledList = useMemo(() => {
    return announcements.filter(a => a.status === 'agendado');
  }, [announcements]);

  const handleOpenCreate = () => {
    setAnnouncementToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setAnnouncementToEdit(a);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (a: Announcement) => {
    markAnnouncementAsRead(a.id);
    setSelectedAnnouncement(a);
    setIsDetailModalOpen(true);
  };

  const handleOpenPrint = (a: Announcement) => {
    setAnnouncementToPrint(a);
    setIsPrintModalOpen(true);
  };

  const handleSaveAnnouncement = (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'readCount' | 'confirmedCount'>) => {
    if (announcementToEdit) {
      updateAnnouncement(announcementToEdit.id, data);
    } else {
      addAnnouncement(data);
    }
  };

  const getTypeColor = (type: AnnouncementType) => {
    switch (type) {
      case 'aviso': return { badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', label: 'Aviso', icon: Bell };
      case 'reuniao': return { badge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', label: 'Reunião', icon: Users };
      case 'mudanca_horario': return { badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', label: 'Horário', icon: Clock };
      case 'pagamento': return { badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', label: 'Pagamento', icon: DollarSign };
      case 'feriado': return { badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', label: 'Feriado', icon: CalendarDays };
      case 'evento': return { badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', label: 'Evento', icon: Sparkles };
      default: return { badge: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', label: 'Comunicado', icon: Megaphone };
    }
  };

  const getTargetLabel = (target: AnnouncementTarget, a?: Announcement) => {
    switch (target) {
      case 'todos': return 'Toda Comunidade';
      case 'curso': return a?.targetCourseName ? `Curso: ${a.targetCourseName}` : 'Curso Específico';
      case 'turma': return a?.targetClassName ? `Turma: ${a.targetClassName}` : 'Turma Específica';
      case 'professor': return 'Docentes / Formadores';
      case 'aluno': return 'Estudantes / Formandos';
      case 'responsaveis': return 'Pais / Encarregados';
      default: return 'Geral';
    }
  };

  return (
    <div id="announcements-manager-view" className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
                  Módulo 50
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Comunicados Oficiais & Mural Institucional
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Gestão centralizada de publicações, agendamentos e difusão multi-canal para a comunidade escolar de {activeInstitution.name}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canPublish && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-lg shadow-rose-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Novo Comunicado</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Cadastrados</span>
            <Megaphone className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">No repositório institucional</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Publicados no Mural</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.published}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Disponíveis para consulta</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Publicações Agendadas</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.scheduled}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Programadas para disparo</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Leituras & Confirmações</span>
            <CheckCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-sky-600 dark:text-sky-400">
            {stats.totalConfirmed} / {stats.totalViews}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Confirmações vs Visualizações</p>
        </div>
      </div>

      {/* Scheduled Queue Banner if any */}
      {scheduledList.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 dark:border-amber-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Fila de Comunicados Agendados ({scheduledList.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              Disparo automático conforme programação
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {scheduledList.map(item => (
              <div 
                key={item.id}
                className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-amber-200 dark:border-amber-800/50 shadow-sm flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-amber-600 dark:text-amber-400 font-bold mb-1">
                    <span>Programado: {item.scheduledFor}</span>
                    <span className="capitalize text-slate-500">{item.type}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {item.summary || item.content}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400">Público: {getTargetLabel(item.targetAudience, item)}</span>
                  {canPublish && (
                    <button
                      onClick={() => publishAnnouncementNow(item.id)}
                      className="px-2 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1"
                      title="Publicar imediatamente no mural sem aguardar horário agendado"
                    >
                      <Send className="w-3 h-3" />
                      <span>Publicar Agora</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, resumo, autor ou conteúdo..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Filter by Type */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="aviso">📢 Aviso</option>
              <option value="reuniao">👥 Reunião</option>
              <option value="mudanca_horario">⏰ Mudança de Horário</option>
              <option value="pagamento">💰 Pagamento</option>
              <option value="feriado">🏖️ Feriado</option>
              <option value="evento">🎉 Evento</option>
            </select>
          </div>

          {/* Filter by Target */}
          <div>
            <select
              value={selectedTarget}
              onChange={e => setSelectedTarget(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            >
              <option value="todos">Todos os Destinatários</option>
              <option value="todos">🌐 Toda a Comunidade</option>
              <option value="curso">📚 Curso</option>
              <option value="turma">👥 Turma</option>
              <option value="professor">👨‍🏫 Professores</option>
              <option value="aluno">🎓 Alunos</option>
              <option value="responsaveis">👨‍👩‍👦 Responsáveis</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            >
              <option value="todos">Todos os Estados</option>
              <option value="publicado">Publicados</option>
              <option value="agendado">Agendados</option>
              <option value="rascunho">Rascunhos</option>
              <option value="arquivado">Arquivados</option>
            </select>
          </div>
        </div>

        {/* Second row of pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Prioridade:</span>
            {(['todas', 'normal', 'alta', 'urgente'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  selectedPriority === p
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p === 'todas' ? 'Todas' : p}
              </button>
            ))}
          </div>

          <div className="text-slate-500 text-xs">
            Exibindo <strong>{filteredAnnouncements.length}</strong> de {announcements.length} comunicados
          </div>
        </div>
      </div>

      {/* Announcements List / Grid */}
      {filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Nenhum comunicado encontrado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tente ajustar os filtros de tipo, público-alvo ou o termo pesquisado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnnouncements.map(ann => {
            const typeInfo = getTypeColor(ann.type);
            const Icon = typeInfo.icon;

            return (
              <div
                key={ann.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800/80 shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-lg border ${typeInfo.badge}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{typeInfo.label}</span>
                      </span>

                      {ann.priority !== 'normal' && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          ann.priority === 'urgente' 
                            ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' 
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        }`}>
                          {ann.priority}
                        </span>
                      )}

                      {ann.status === 'agendado' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Agendado</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {ann.publishDate?.slice(0, 10)}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 
                      onClick={() => handleOpenDetail(ann)}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 cursor-pointer"
                    >
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                      {ann.summary || ann.content}
                    </p>
                  </div>

                  {/* Event / Schedule change / Payment snippet */}
                  {ann.eventDate && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="line-clamp-1 font-medium">
                        {new Date(ann.eventDate).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {ann.eventLocation ? ` • ${ann.eventLocation}` : ''}
                      </span>
                    </div>
                  )}

                  {ann.scheduleChangeDetails && (
                    <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs space-y-1">
                      <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                        <span>{ann.scheduleChangeDetails.subject || 'Horário alterado'}</span>
                        <span className="text-emerald-600 font-bold">{ann.scheduleChangeDetails.newSchedule}</span>
                      </div>
                    </div>
                  )}

                  {ann.paymentNoticeDetails && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs space-y-1">
                      <div className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                        <span>Ref: {ann.paymentNoticeDetails.referenceMonth}</span>
                        <span className="text-rose-600 font-bold">Até {ann.paymentNoticeDetails.dueDate}</span>
                      </div>
                    </div>
                  )}

                  {/* Target Audience Badge */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {getTargetLabel(ann.targetAudience, ann)}
                    </span>
                  </div>
                </div>

                {/* Card Footer & Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenDetail(ann)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver</span>
                    </button>

                    <button
                      onClick={() => handleOpenPrint(ann)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Imprimir Circular A4 Oficial"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        const text = `📢 *COMUNICADO OFICIAL: ${ann.title}*\n\n${ann.summary || ann.content.slice(0, 150)}...\n\n🏛️ _${activeInstitution.name}_`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                      title="Partilhar no WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {ann.status === 'agendado' && canPublish && (
                      <button
                        onClick={() => publishAnnouncementNow(ann.id)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        title="Publicar agora mesmo"
                      >
                        <Send className="w-3 h-3" />
                        <span>Publicar</span>
                      </button>
                    )}

                    {canPublish && (
                      <button
                        onClick={() => handleOpenEdit(ann)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir o comunicado "${ann.title}"?`)) {
                            deleteAnnouncement(ann.id);
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnnouncementFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        announcementToEdit={announcementToEdit}
        onSave={handleSaveAnnouncement}
        coursesList={coursesList}
        classesList={classesList}
      />

      <AnnouncementDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        announcement={selectedAnnouncement}
        onEdit={handleOpenEdit}
        onDelete={deleteAnnouncement}
        onPrint={handleOpenPrint}
        onConfirmAttendance={confirmAnnouncementAttendance}
        canManage={canPublish}
      />

      <AnnouncementPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        announcement={announcementToPrint}
      />
    </div>
  );
};
