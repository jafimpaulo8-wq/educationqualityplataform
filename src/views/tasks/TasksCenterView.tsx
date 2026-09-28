import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TaskItem, 
  TaskState, 
  TaskPriority, 
  TaskNoteVisibility, 
  TaskAttachment 
} from '../../types';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Paperclip, 
  FileText, 
  Lock, 
  Users, 
  User, 
  Calendar, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  Download, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Tag, 
  LayoutGrid, 
  List, 
  ShieldCheck, 
  Sparkles,
  UploadCloud,
  X,
  FileSpreadsheet,
  File,
  FileImage,
  Layers,
  ChevronRight,
  Briefcase
} from 'lucide-react';

const CATEGORIES = [
  'Todas',
  'Pedagógico',
  'Financeiro',
  'Secretaria',
  'TI & Infraestrutura',
  'Jurídico & Compliance',
  'Recursos Humanos',
  'Geral'
];

const PREDEFINED_STAFF = [
  { name: 'Dra. Maria Lurdes', role: 'Coordenadora Pedagógica', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Carlos Machel', role: 'Chefe de Tesouraria', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Eng. Fernando Sitoe', role: 'Técnico de Suporte TI', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Anabela Cuamba', role: 'Secretária Acadêmica', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Director Geral', role: 'Diretor Executivo', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Prof. Bernardo Nhantumbo', role: 'Formador de TI', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }
];

export const TasksCenterView: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    changeTaskState, 
    addTaskNote, 
    deleteTaskNote, 
    addTaskAttachment, 
    removeTaskAttachment,
    activeInstitution,
    currentUser,
    activeRole
  } = useApp();

  // Filters & View Mode
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todas');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [dueDateFilter, setDueDateFilter] = useState<string>('todos');

  // Selected task for detail drawer
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Modal for creating/editing task
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAssigneeName, setFormAssigneeName] = useState('');
  const [formAssigneeRole, setFormAssigneeRole] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('media');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDueTime, setFormDueTime] = useState('17:00');
  const [formState, setFormState] = useState<TaskState>('pendente');
  const [formCategory, setFormCategory] = useState('Geral');
  const [formAttachments, setFormAttachments] = useState<TaskAttachment[]>([]);

  // Note composer state in Detail Drawer
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteVisibility, setNewNoteVisibility] = useState<TaskNoteVisibility>('autorizados');

  // Attachment composer state in Detail Drawer
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentType, setNewAttachmentType] = useState('application/pdf');

  // Helper to determine if note is visible to the active user
  const canViewNote = (note: TaskItem['notes'][0], task: TaskItem) => {
    // Super Admin can audit everything
    if (activeRole === 'superadmin') return true;

    // Author always sees their own note
    if (note.authorName === currentUser.name || note.authorId === currentUser.id) {
      return true;
    }

    // If private note: only author or superadmin
    if (note.visibility === 'privada') {
      return false;
    }

    // If authorized users: check roles or if user is task assignee or director
    if (note.visibility === 'autorizados') {
      const authorizedRoles = note.authorizedRoles || ['superadmin', 'director', 'admin', 'coordenador'];
      if (authorizedRoles.includes(activeRole)) return true;
      if (task.assigneeName.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
      return false;
    }

    return false;
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description.toLowerCase().includes(q);
        const matchesAssignee = task.assigneeName.toLowerCase().includes(q);
        const matchesCat = (task.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAssignee && !matchesCat) return false;
      }

      // State
      if (stateFilter !== 'todos' && task.state !== stateFilter) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'todas' && task.priority !== priorityFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'Todas' && task.category !== categoryFilter) {
        return false;
      }

      // Due Date Filter
      const today = new Date().toISOString().split('T')[0];
      if (dueDateFilter === 'vencidas') {
        if (task.state === 'concluído' || task.state === 'cancelado') return false;
        return task.dueDate < today;
      } else if (dueDateFilter === 'hoje') {
        return task.dueDate === today;
      } else if (dueDateFilter === '7dias') {
        const next7 = new Date();
        next7.setDate(next7.getDate() + 7);
        const next7Str = next7.toISOString().split('T')[0];
        return task.dueDate >= today && task.dueDate <= next7Str;
      }

      return true;
    });
  }, [tasks, searchQuery, stateFilter, priorityFilter, categoryFilter, dueDateFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const total = tasks.length;
    const pendente = tasks.filter(t => t.state === 'pendente').length;
    const emAndamento = tasks.filter(t => t.state === 'em andamento').length;
    const concluido = tasks.filter(t => t.state === 'concluído').length;
    const cancelado = tasks.filter(t => t.state === 'cancelado').length;
    const atrasadas = tasks.filter(t => (t.state === 'pendente' || t.state === 'em andamento') && t.dueDate < today).length;
    return { total, pendente, emAndamento, concluido, cancelado, atrasadas };
  }, [tasks]);

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setFormTitle('');
    setFormDescription('');
    setFormAssigneeName(PREDEFINED_STAFF[0].name);
    setFormAssigneeRole(PREDEFINED_STAFF[0].role);
    setFormPriority('media');
    const today = new Date();
    today.setDate(today.getDate() + 3);
    setFormDueDate(today.toISOString().split('T')[0]);
    setFormDueTime('17:00');
    setFormState('pendente');
    setFormCategory('Geral');
    setFormAttachments([]);
    setIsCreateModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormAssigneeName(task.assigneeName);
    setFormAssigneeRole(task.assigneeRole || '');
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate);
    setFormDueTime(task.dueTime || '17:00');
    setFormState(task.state);
    setFormCategory(task.category || 'Geral');
    setFormAttachments(task.attachments || []);
    setIsCreateModalOpen(true);
  };

  // Handle save task form
  const handleSaveTaskForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAssigneeName.trim()) {
      alert('Preencha o título e o responsável da tarefa.');
      return;
    }

    const matchedStaff = PREDEFINED_STAFF.find(s => s.name === formAssigneeName);

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        assigneeName: formAssigneeName.trim(),
        assigneeRole: formAssigneeRole || matchedStaff?.role || 'Colaborador',
        assigneeAvatar: matchedStaff?.avatar,
        priority: formPriority,
        dueDate: formDueDate,
        dueTime: formDueTime,
        state: formState,
        category: formCategory,
        attachments: formAttachments
      });
      // Update selectedTask if drawer is currently open
      if (selectedTask && selectedTask.id === editingTaskId) {
        setSelectedTask(prev => prev ? {
          ...prev,
          title: formTitle.trim(),
          description: formDescription.trim(),
          assigneeName: formAssigneeName.trim(),
          assigneeRole: formAssigneeRole || matchedStaff?.role || 'Colaborador',
          priority: formPriority,
          dueDate: formDueDate,
          dueTime: formDueTime,
          state: formState,
          category: formCategory,
          attachments: formAttachments
        } : null);
      }
    } else {
      const created = addTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        assigneeName: formAssigneeName.trim(),
        assigneeRole: formAssigneeRole || matchedStaff?.role || 'Colaborador',
        assigneeAvatar: matchedStaff?.avatar,
        priority: formPriority,
        dueDate: formDueDate,
        dueTime: formDueTime,
        state: formState,
        category: formCategory,
        attachments: formAttachments,
        notes: [],
        createdBy: currentUser.name
      });
      setSelectedTask(created);
    }

    setIsCreateModalOpen(false);
  };

  // Add simulated attachment in form
  const handleAddFormAttachment = () => {
    const names = [
      'Documento_Orientador.pdf',
      'Termo_Responsabilidade_Assinado.pdf',
      'Plano_Acao_Tarefas.xlsx',
      'Evidencia_Fotografica.png',
      'Especificacao_Tecnica.pdf'
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newAtt: TaskAttachment = {
      id: `att-temp-${Date.now()}`,
      name: randomName,
      size: `${(Math.random() * 2 + 0.3).toFixed(1)} MB`,
      type: randomName.endsWith('.pdf') ? 'application/pdf' : randomName.endsWith('.xlsx') ? 'application/vnd.ms-excel' : 'image/png',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      uploadedBy: currentUser.name
    };
    setFormAttachments(prev => [...prev, newAtt]);
  };

  // Add attachment inside Detail Drawer
  const handleAddDrawerAttachment = () => {
    if (!selectedTask) return;
    const name = newAttachmentName.trim() || 'Anexo_Documental.pdf';
    addTaskAttachment(selectedTask.id, {
      name,
      size: `${(Math.random() * 2 + 0.4).toFixed(1)} MB`,
      type: newAttachmentType
    });
    setNewAttachmentName('');
    // refresh drawer selected task
    setTimeout(() => {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
    }, 50);
  };

  // Add note inside Detail Drawer
  const handleAddDrawerNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newNoteContent.trim()) return;

    addTaskNote(selectedTask.id, {
      content: newNoteContent.trim(),
      visibility: newNoteVisibility,
      authorizedRoles: ['superadmin', 'director', 'admin', 'coordenador']
    });

    setNewNoteContent('');
    setTimeout(() => {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
    }, 50);
  };

  // Priority styling helper
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgente':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Urgente</span>;
      case 'alta':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Alta</span>;
      case 'media':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">Média</span>;
      case 'baixa':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Baixa</span>;
    }
  };

  // State styling helper
  const getStateBadge = (state: TaskState) => {
    switch (state) {
      case 'pendente':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pendente</span>;
      case 'em andamento':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Sparkles className="w-3 h-3" /> Em Andamento</span>;
      case 'concluído':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Concluído</span>;
      case 'cancelado':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300"><XCircle className="w-3 h-3" /> Cancelado</span>;
    }
  };

  // Due Date status indicator
  const getDueStatus = (dueDate: string, state: TaskState) => {
    if (state === 'concluído') {
      return { text: 'Concluído', color: 'text-emerald-600 font-medium' };
    }
    if (state === 'cancelado') {
      return { text: 'Cancelado', color: 'text-slate-500' };
    }
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today) {
      return { text: 'Atrasada!', color: 'text-rose-600 font-bold flex items-center gap-1' };
    }
    if (dueDate === today) {
      return { text: 'Vence Hoje', color: 'text-amber-600 font-semibold' };
    }
    return { text: dueDate, color: 'text-slate-600' };
  };

  // File icon helper
  const getFileIcon = (type: string, name: string) => {
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-rose-500" />;
    }
    if (type.includes('excel') || type.includes('sheet') || name.endsWith('.xlsx') || name.endsWith('.csv')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    }
    if (type.includes('image') || name.endsWith('.png') || name.endsWith('.jpg')) {
      return <FileImage className="w-4 h-4 text-sky-500" />;
    }
    return <File className="w-4 h-4 text-slate-500" />;
  };

  const columns: { key: TaskState; label: string; bg: string; border: string; badgeColor: string }[] = [
    { key: 'pendente', label: 'Pendente', bg: 'bg-amber-50/50', border: 'border-amber-200', badgeColor: 'bg-amber-100 text-amber-800' },
    { key: 'em andamento', label: 'Em Andamento', bg: 'bg-blue-50/50', border: 'border-blue-200', badgeColor: 'bg-blue-100 text-blue-800' },
    { key: 'concluído', label: 'Concluído', bg: 'bg-emerald-50/50', border: 'border-emerald-200', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { key: 'cancelado', label: 'Cancelado', bg: 'bg-slate-50', border: 'border-slate-200', badgeColor: 'bg-slate-200 text-slate-700' }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  36. Gestão de Tarefas & Workflows
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeInstitution.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  Operador: {currentUser.name} ({currentUser.role})
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Controle de prazos, responsáveis, anexos e notas com sigilo estrito (Privadas vs Autorizadas).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="btn-view-kanban"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'kanban' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kanban
              </button>
              <button
                id="btn-view-list"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Lista Detalhada
              </button>
            </div>

            <button
              id="btn-nova-tarefa"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow"
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <div className="text-xs font-medium text-slate-500">Total de Tarefas</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{metrics.total}</div>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60">
            <div className="text-xs font-medium text-amber-700">Pendentes</div>
            <div className="text-xl font-bold text-amber-900 mt-1">{metrics.pendente}</div>
          </div>
          <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-200/60">
            <div className="text-xs font-medium text-blue-700">Em Andamento</div>
            <div className="text-xl font-bold text-blue-900 mt-1">{metrics.emAndamento}</div>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/60">
            <div className="text-xs font-medium text-emerald-700">Concluídas</div>
            <div className="text-xl font-bold text-emerald-900 mt-1">{metrics.concluido}</div>
          </div>
          <div className="bg-slate-100/60 rounded-xl p-3 border border-slate-200/60">
            <div className="text-xs font-medium text-slate-600">Canceladas</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{metrics.cancelado}</div>
          </div>
          <div className={`rounded-xl p-3 border ${
            metrics.atrasadas > 0 
              ? 'bg-rose-50 border-rose-200/80 text-rose-900' 
              : 'bg-slate-50 border-slate-200/70 text-slate-700'
          }`}>
            <div className={`text-xs font-medium ${metrics.atrasadas > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
              Prazos Vencidos
            </div>
            <div className="text-xl font-bold mt-1 flex items-center gap-1">
              {metrics.atrasadas}
              {metrics.atrasadas > 0 && <AlertTriangle className="w-4 h-4 text-rose-500" />}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-busca-tarefas"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, descrição, responsável ou categoria..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Filtros:
          </div>

          {/* State Filter */}
          <select
            id="select-filtro-estado"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="todos">Todos Estados</option>
            <option value="pendente">Pendente</option>
            <option value="em andamento">Em Andamento</option>
            <option value="concluído">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>

          {/* Priority Filter */}
          <select
            id="select-filtro-prioridade"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="todas">Todas Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          {/* Category Filter */}
          <select
            id="select-filtro-categoria"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Due Date Filter */}
          <select
            id="select-filtro-prazo"
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="todos">Todos Prazos</option>
            <option value="vencidas">⚠️ Atrasadas</option>
            <option value="hoje">📅 Vencem Hoje</option>
            <option value="7dias">Próximos 7 dias</option>
          </select>

          {(searchQuery || stateFilter !== 'todos' || priorityFilter !== 'todas' || categoryFilter !== 'Todas' || dueDateFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStateFilter('todos');
                setPriorityFilter('todas');
                setCategoryFilter('Todas');
                setDueDateFilter('todos');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Kanban or List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.state === col.key);

            return (
              <div 
                key={col.key} 
                className={`rounded-2xl border ${col.border} ${col.bg} p-4 min-h-[500px] flex flex-col`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{col.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeColor}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleOpenCreateModal();
                      setFormState(col.key);
                    }}
                    title={`Adicionar tarefa em ${col.label}`}
                    className="p-1 rounded-lg hover:bg-white text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-xs text-slate-400 border border-dashed border-slate-300/80 rounded-xl p-4 text-center">
                      Nenhuma tarefa nesta etapa
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const dueInfo = getDueStatus(task.dueDate, task.state);
                      const hasAttachments = task.attachments && task.attachments.length > 0;
                      const hasNotes = task.notes && task.notes.length > 0;
                      // Check how many notes user can see
                      const visibleNotesCount = (task.notes || []).filter(n => canViewNote(n, task)).length;

                      return (
                        <div
                          key={task.id}
                          id={`task-card-${task.id}`}
                          onClick={() => setSelectedTask(task)}
                          className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-indigo-300 relative"
                        >
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {task.category || 'Geral'}
                            </span>
                            {getPriorityBadge(task.priority)}
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {task.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {task.description}
                          </p>

                          {/* Assignee & Due Date */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0" title={`Responsável: ${task.assigneeName}`}>
                              {task.assigneeAvatar ? (
                                <img 
                                  src={task.assigneeAvatar} 
                                  alt={task.assigneeName} 
                                  className="w-5 h-5 rounded-full object-cover shrink-0" 
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {task.assigneeName.charAt(0)}
                                </div>
                              )}
                              <span className="font-medium text-slate-700 truncate text-[11px]">
                                {task.assigneeName.split(' ')[0]}
                              </span>
                            </div>

                            <div className={`text-[11px] ${dueInfo.color}`}>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {dueInfo.text}
                            </div>
                          </div>

                          {/* Bottom metadata (Attachments, Notes count, Quick state changer) */}
                          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-3">
                              {hasAttachments && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                  <Paperclip className="w-3 h-3 text-slate-400" />
                                  {task.attachments.length}
                                </span>
                              )}
                              {hasNotes && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium" title={`${visibleNotesCount} notas visíveis para si`}>
                                  <MessageSquare className="w-3 h-3 text-slate-400" />
                                  {visibleNotesCount}
                                </span>
                              )}
                            </div>

                            {/* Quick state transitions */}
                            <div 
                              onClick={(e) => e.stopPropagation()} 
                              className="flex items-center gap-1"
                            >
                              {task.state !== 'concluído' && (
                                <button
                                  id={`btn-complete-task-${task.id}`}
                                  onClick={() => changeTaskState(task.id, 'concluído')}
                                  title="Marcar como Concluído"
                                  className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {task.state === 'pendente' && (
                                <button
                                  onClick={() => changeTaskState(task.id, 'em andamento')}
                                  title="Iniciar Tarefa (Em Andamento)"
                                  className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tarefa</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Prazo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Anexos & Notas</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Nenhuma tarefa encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    const dueInfo = getDueStatus(task.dueDate, task.state);
                    const visibleNotesCount = (task.notes || []).filter(n => canViewNote(n, task)).length;

                    return (
                      <tr 
                        key={task.id}
                        id={`task-row-${task.id}`}
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {task.title}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {task.description}
                          </div>
                          <span className="inline-block mt-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {task.category || 'Geral'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {task.assigneeAvatar ? (
                              <img 
                                src={task.assigneeAvatar} 
                                alt={task.assigneeName} 
                                className="w-6 h-6 rounded-full object-cover" 
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                {task.assigneeName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-800 text-xs">{task.assigneeName}</div>
                              <div className="text-[11px] text-slate-400">{task.assigneeRole}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getPriorityBadge(task.priority)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className={`text-xs ${dueInfo.color}`}>
                            {dueInfo.text}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {task.dueTime ? `até às ${task.dueTime}` : ''}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={task.state}
                            onChange={(e) => changeTaskState(task.id, e.target.value as TaskState)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="em andamento">Em Andamento</option>
                            <option value="concluído">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1" title={`${task.attachments?.length || 0} anexos`}>
                              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                              {task.attachments?.length || 0}
                            </span>
                            <span className="flex items-center gap-1" title={`${visibleNotesCount} notas visíveis`}>
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                              {visibleNotesCount}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedTask(task)}
                              title="Visualizar Detalhes"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(task)}
                              title="Editar Tarefa"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
                                  deleteTask(task.id);
                                }
                              }}
                              title="Excluir Tarefa"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL DE DETALHES DA TAREFA COM NOTAS (PRIVADAS vs AUTORIZADOS) */}
      {/* ========================================================================= */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {getStateBadge(selectedTask.state)}
                  {getPriorityBadge(selectedTask.priority)}
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {selectedTask.category || 'Geral'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedTask.title}
                </h2>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Criada em: {selectedTask.createdAt} por {selectedTask.createdBy}</span>
                  {selectedTask.completedAt && (
                    <span className="text-emerald-700 font-medium">
                      Concluída em: {selectedTask.completedAt}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedTask)}
                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white border border-slate-200 transition-colors shadow-xs"
                  title="Editar Tarefa"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-slate-200 transition-colors shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* State Transitions Quick Bar */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs font-semibold text-slate-700">
                  Mudar Estado:
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['pendente', 'em andamento', 'concluído', 'cancelado'] as TaskState[]).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        changeTaskState(selectedTask.id, st);
                        setSelectedTask(prev => prev ? { ...prev, state: st } : null);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedTask.state === st
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {st.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsible & Deadline Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                  <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    Responsável Atribuído
                  </div>
                  <div className="flex items-center gap-2.5 mt-2">
                    {selectedTask.assigneeAvatar ? (
                      <img 
                        src={selectedTask.assigneeAvatar} 
                        alt={selectedTask.assigneeName} 
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {selectedTask.assigneeName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {selectedTask.assigneeName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedTask.assigneeRole || 'Colaborador'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                  <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Prazo Limite (Deadline)
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-2">
                    {selectedTask.dueDate} {selectedTask.dueTime && `às ${selectedTask.dueTime}`}
                  </div>
                  <div className={`text-xs mt-0.5 ${getDueStatus(selectedTask.dueDate, selectedTask.state).color}`}>
                    {getDueStatus(selectedTask.dueDate, selectedTask.state).text}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Descrição da Tarefa
                </h4>
                <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description || 'Nenhuma descrição fornecida.'}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* ANEXOS (ATTACHMENTS) SECTION */}
              {/* ========================================================================= */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                    Anexos da Tarefa ({selectedTask.attachments?.length || 0})
                  </h4>
                </div>

                {/* Attachments List */}
                <div className="space-y-2">
                  {(!selectedTask.attachments || selectedTask.attachments.length === 0) ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                      Nenhum arquivo anexado a esta tarefa.
                    </div>
                  ) : (
                    selectedTask.attachments.map(att => (
                      <div 
                        key={att.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                            {getFileIcon(att.type, att.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 truncate" title={att.name}>
                              {att.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {att.size} • Enviado por {att.uploadedBy} em {att.uploadedAt}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => alert(`Simulando download/abertura do anexo: ${att.name}`)}
                            title="Descarregar / Abrir"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Remover o anexo "${att.name}"?`)) {
                                removeTaskAttachment(selectedTask.id, att.id);
                                setSelectedTask(prev => prev ? {
                                  ...prev,
                                  attachments: prev.attachments.filter(a => a.id !== att.id)
                                } : null);
                              }
                            }}
                            title="Excluir anexo"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Add Attachment Box */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    placeholder="Nome do arquivo ou documento (ex: Termo_Aprovacao.pdf)..."
                    className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <select
                    value={newAttachmentType}
                    onChange={(e) => setNewAttachmentType(e.target.value)}
                    className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
                  >
                    <option value="application/pdf">PDF</option>
                    <option value="application/vnd.ms-excel">Excel</option>
                    <option value="image/png">Imagem</option>
                    <option value="text/plain">Texto</option>
                  </select>
                  <button
                    onClick={handleAddDrawerAttachment}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Anexar
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* NOTAS PRIVADAS VS AUTORIZADOS (CRITICAL USER REQUIREMENT) */}
              {/* ========================================================================= */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    Notas & Observações Internas
                  </h4>
                </div>

                {/* Privacy Guidelines Banner */}
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 mb-4 text-xs text-indigo-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    Política de Sigilo das Notas:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">PRIVADA</span>
                      <span>Visível exclusivamente para si (o autor da nota). Outros utilizadores não conseguem ler.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">AUTORIZADOS</span>
                      <span>Visível para Diretores, Coordenadores, Administradores e o Responsável da tarefa.</span>
                    </div>
                  </div>
                </div>

                {/* Notes Feed */}
                <div className="space-y-3 mb-4">
                  {(!selectedTask.notes || selectedTask.notes.length === 0) ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                      Nenhuma nota registrada até ao momento.
                    </div>
                  ) : (
                    selectedTask.notes.map(note => {
                      const isVisible = canViewNote(note, selectedTask);
                      const isAuthor = note.authorName === currentUser.name || note.authorId === currentUser.id;

                      return (
                        <div 
                          key={note.id}
                          className={`rounded-xl p-3.5 border transition-all ${
                            note.visibility === 'privada'
                              ? 'bg-amber-50/50 border-amber-200/80 shadow-xs'
                              : 'bg-white border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-900">
                                {note.authorName}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                ({note.authorRole})
                              </span>
                              <span className="text-[10px] text-slate-400">
                                • {note.createdAt}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {note.visibility === 'privada' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  <Lock className="w-2.5 h-2.5 text-amber-700" />
                                  PRIVADA (SIGILOSA)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                                  <Users className="w-2.5 h-2.5 text-indigo-700" />
                                  VISÍVEL PARA AUTORIZADOS
                                </span>
                              )}

                              {(isAuthor || activeRole === 'superadmin') && (
                                <button
                                  onClick={() => {
                                    if (window.confirm('Excluir esta nota?')) {
                                      deleteTaskNote(selectedTask.id, note.id);
                                      setSelectedTask(prev => prev ? {
                                        ...prev,
                                        notes: prev.notes.filter(n => n.id !== note.id)
                                      } : null);
                                    }
                                  }}
                                  title="Excluir Nota"
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Content or Hidden Blocker */}
                          {isVisible ? (
                            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                              {note.content}
                            </div>
                          ) : (
                            <div className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-500 italic flex items-center gap-2 border border-slate-200">
                              <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>[Nota Privada Sigilosa - Conteúdo restrito apenas ao autor]</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddDrawerNote} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Adicionar Nova Nota
                    </label>
                    <textarea
                      id="textarea-nova-nota"
                      rows={2}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Escreva observações internas sobre o andamento, bloqueios ou detalhes da tarefa..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Visibility Switcher (PRIVADAS ou VISÍVEIS PARA UTILIZADORES AUTORIZADOS) */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600">
                        Visibilidade:
                      </span>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="note_vis"
                          value="privada"
                          checked={newNoteVisibility === 'privada'}
                          onChange={() => setNewNoteVisibility('privada')}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span className="flex items-center gap-1 font-semibold text-amber-800">
                          <Lock className="w-3 h-3 text-amber-600" />
                          PRIVADA
                        </span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="note_vis"
                          value="autorizados"
                          checked={newNoteVisibility === 'autorizados'}
                          onChange={() => setNewNoteVisibility('autorizados')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="flex items-center gap-1 font-semibold text-indigo-800">
                          <Users className="w-3 h-3 text-indigo-600" />
                          AUTORIZADOS
                        </span>
                      </label>
                    </div>

                    <button
                      id="btn-submeter-nota"
                      type="submit"
                      disabled={!newNoteContent.trim()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                    >
                      Registrar Nota
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>ID: {selectedTask.id}</span>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE TAREFA */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up my-8">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {editingTaskId ? 'Editar Tarefa' : 'Nova Tarefa'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Preencha os dados e configure os responsáveis, prazos e anexos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskForm} className="p-6 space-y-4">
              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título da Tarefa *
                </label>
                <input
                  id="input-task-titulo"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Auditoria das Pautas de Frequência do 1º Semestre..."
                  className="w-full text-sm px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição Detalhada
                </label>
                <textarea
                  id="input-task-descricao"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Instruções, critérios de aceite e detalhes operacionais..."
                  className="w-full text-sm px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Responsável & Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável *
                  </label>
                  <select
                    id="select-task-responsavel"
                    value={formAssigneeName}
                    onChange={(e) => {
                      const selected = PREDEFINED_STAFF.find(s => s.name === e.target.value);
                      setFormAssigneeName(e.target.value);
                      if (selected) {
                        setFormAssigneeRole(selected.role);
                      }
                    }}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {PREDEFINED_STAFF.map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {CATEGORIES.filter(c => c !== 'Todas').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prioridade & Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    id="select-task-prioridade"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    id="select-task-estado"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value as TaskState)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em andamento">Em Andamento</option>
                    <option value="concluído">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Prazo (Data e Hora) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data Limite (Prazo) *
                  </label>
                  <input
                    id="input-task-prazo"
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hora Limite
                  </label>
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Anexos Iniciais */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Anexos ({formAttachments.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFormAttachment}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Anexo
                  </button>
                </div>

                {formAttachments.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {formAttachments.map((att, i) => (
                      <div key={att.id || i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs border border-slate-200">
                        <div className="flex items-center gap-2 truncate">
                          {getFileIcon(att.type, att.name)}
                          <span className="truncate font-medium text-slate-800">{att.name}</span>
                          <span className="text-slate-400">({att.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormAttachments(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    Nenhum anexo adicionado nesta tarefa.
                  </div>
                )}
              </div>

              {/* Submit / Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  id="btn-salvar-tarefa"
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  {editingTaskId ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
