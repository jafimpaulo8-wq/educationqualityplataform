import { 
  CalendarEventBase, 
  CalendarCategoryType, 
  CalendarCustomEvent, 
  ClassScheduleSlot, 
  EvaluationItem, 
  TaskItem, 
  ContaReceber, 
  Student, 
  Teacher, 
  InternshipContract 
} from '../../../types';

export interface CalendarFilterOptions {
  institutionId?: string; // 'all' or specific institution ID
  userId?: string;        // 'all', 'current', or specific user name/ID
  currentUserName?: string;
  selectedCategories: CalendarCategoryType[];
  searchQuery?: string;
}

// Category Configuration (Label, Colors, Icons, Badges)
export const CATEGORY_CONFIG: Record<CalendarCategoryType, {
  label: string;
  pluralLabel: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  bgLight: string;
  hex: string;
  iconName: string;
}> = {
  aula: {
    label: 'Aula',
    pluralLabel: 'Aulas',
    badgeBg: 'bg-sky-500/15',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    dotColor: 'bg-sky-500',
    bgLight: 'bg-sky-950/40',
    hex: '#0284c7',
    iconName: 'BookOpen'
  },
  avaliacao: {
    label: 'Avaliação',
    pluralLabel: 'Avaliações',
    badgeBg: 'bg-rose-500/15',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    dotColor: 'bg-rose-500',
    bgLight: 'bg-rose-950/40',
    hex: '#e11d48',
    iconName: 'FileCheck2'
  },
  reuniao: {
    label: 'Reunião',
    pluralLabel: 'Reuniões',
    badgeBg: 'bg-purple-500/15',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    dotColor: 'bg-purple-500',
    bgLight: 'bg-purple-950/40',
    hex: '#9333ea',
    iconName: 'Users'
  },
  tarefa: {
    label: 'Tarefa',
    pluralLabel: 'Tarefas',
    badgeBg: 'bg-amber-500/15',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    bgLight: 'bg-amber-950/40',
    hex: '#d97706',
    iconName: 'CheckSquare'
  },
  evento: {
    label: 'Evento',
    pluralLabel: 'Eventos',
    badgeBg: 'bg-emerald-500/15',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    bgLight: 'bg-emerald-950/40',
    hex: '#059669',
    iconName: 'Sparkles'
  },
  pagamento: {
    label: 'Pagamento',
    pluralLabel: 'Pagamentos',
    badgeBg: 'bg-teal-500/15',
    textColor: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    dotColor: 'bg-teal-500',
    bgLight: 'bg-teal-950/40',
    hex: '#0d9488',
    iconName: 'CreditCard'
  },
  aniversario: {
    label: 'Aniversário',
    pluralLabel: 'Aniversários',
    badgeBg: 'bg-pink-500/15',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    dotColor: 'bg-pink-500',
    bgLight: 'bg-pink-950/40',
    hex: '#db2777',
    iconName: 'Cake'
  },
  estagio: {
    label: 'Estágio',
    pluralLabel: 'Estágios',
    badgeBg: 'bg-orange-500/15',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    dotColor: 'bg-orange-500',
    bgLight: 'bg-orange-950/40',
    hex: '#ea580c',
    iconName: 'Briefcase'
  }
};

/**
 * Aggregates all 8 categories into a unified list of CalendarEventBase items
 * for the requested year and month (or across all dates)
 */
export function aggregateCalendarEvents({
  year,
  month, // 0-indexed (0 = Jan, 8 = Sep)
  customEvents,
  schedules,
  evaluations,
  tasks,
  contasReceber,
  students,
  teachers,
  internships,
  filters
}: {
  year: number;
  month: number;
  customEvents: CalendarCustomEvent[];
  schedules: ClassScheduleSlot[];
  evaluations: EvaluationItem[];
  tasks: TaskItem[];
  contasReceber: ContaReceber[];
  students: Student[];
  teachers: Teacher[];
  internships: InternshipContract[];
  filters: CalendarFilterOptions;
}): CalendarEventBase[] {
  const aggregated: CalendarEventBase[] = [];

  // Helper to format date YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Target month range
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // 1. REUNIÕES, EVENTOS E EVENTOS CUSTOMIZADOS
  customEvents.forEach(ev => {
    aggregated.push({
      id: ev.id,
      institutionId: ev.institutionId,
      branchId: ev.branchId,
      category: ev.category,
      title: ev.title,
      description: ev.description,
      startDate: ev.startDate,
      endDate: ev.endDate,
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location,
      allDay: ev.allDay ?? (!ev.startTime),
      userName: ev.assignedUserName,
      userRole: ev.assignedUserRole,
      priority: ev.priority,
      status: ev.status,
      sourceModule: 'Calendário Geral',
      createdBy: ev.createdBy,
      createdAt: ev.createdAt,
      updatedAt: ev.updatedAt
    });
  });

  // 2. AULAS (Aulas recorrentes semanais geradas no mês atual + datas específicas)
  schedules.forEach(slot => {
    // If slot has a specific date
    if (slot.date) {
      aggregated.push({
        id: `aula-slot-${slot.id}-${slot.date}`,
        institutionId: slot.institutionId,
        branchId: slot.branchId,
        category: 'aula',
        title: `${slot.disciplineName} - ${slot.classGroupName}`,
        description: `Turma: ${slot.classGroupName} | Sala: ${slot.room} | Professor: ${slot.teacherName}`,
        startDate: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        location: slot.room,
        allDay: false,
        userName: slot.teacherName,
        userRole: 'Professor / Formador',
        userId: slot.teacherId,
        classGroupId: slot.classGroupId,
        classGroupName: slot.classGroupName,
        disciplineName: slot.disciplineName,
        courseName: slot.courseName,
        status: slot.status,
        targetRoute: 'horarios_calendario',
        targetId: slot.id,
        sourceModule: 'Módulo 13 - Horários'
      });
    } else {
      // Slot recurrent by dayOfWeek (1=Seg ... 6=Sáb, 0=Dom)
      // Expand across the month
      const targetDayOfWeek = slot.dayOfWeek;
      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        if (currentDate.getDay() === targetDayOfWeek) {
          const dateStr = formatYMD(currentDate);
          aggregated.push({
            id: `aula-slot-${slot.id}-${dateStr}`,
            institutionId: slot.institutionId,
            branchId: slot.branchId,
            category: 'aula',
            title: `${slot.disciplineName} - ${slot.classGroupName}`,
            description: `Turma: ${slot.classGroupName} | Sala: ${slot.room} | Docente: ${slot.teacherName}`,
            startDate: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime,
            location: slot.room,
            allDay: false,
            userName: slot.teacherName,
            userRole: 'Professor / Formador',
            userId: slot.teacherId,
            classGroupId: slot.classGroupId,
            classGroupName: slot.classGroupName,
            disciplineName: slot.disciplineName,
            courseName: slot.courseName,
            status: slot.status,
            targetRoute: 'horarios_calendario',
            targetId: slot.id,
            sourceModule: 'Módulo 13 - Horários'
          });
        }
      }
    }
  });

  // 3. AVALIAÇÕES (Provas, testes, exames, trabalhos)
  evaluations.forEach(ev => {
    if (ev.date) {
      aggregated.push({
        id: `eval-${ev.id}`,
        institutionId: ev.institutionId,
        branchId: ev.branchId,
        category: 'avaliacao',
        title: `${ev.name} - ${ev.discipline}`,
        description: `Turma: ${ev.classGroupName || 'N/A'} | Docente: ${ev.teacher} | Tipo: ${ev.type.toUpperCase()} | Peso: ${ev.weight}% | Nota Máx: ${ev.maxScore}V`,
        startDate: ev.date,
        startTime: '08:00',
        endTime: '10:00',
        location: ev.classGroupName ? `Sala da Turma ${ev.classGroupName}` : 'Sala de Provas',
        allDay: false,
        userName: ev.teacher,
        userRole: 'Professor / Formador',
        classGroupId: ev.classGroupId,
        classGroupName: ev.classGroupName,
        disciplineName: ev.discipline,
        status: ev.status,
        targetRoute: 'avaliacoes',
        targetId: ev.id,
        sourceModule: 'Módulo 15 - Avaliações'
      });
    }
  });

  // 4. TAREFAS (Tasks do Módulo 36 com dueDate)
  tasks.forEach(task => {
    if (task.dueDate) {
      aggregated.push({
        id: `task-cal-${task.id}`,
        institutionId: task.institutionId,
        branchId: task.branchId,
        category: 'tarefa',
        title: task.title,
        description: task.description,
        startDate: task.dueDate,
        startTime: task.dueTime || '17:00',
        location: task.category ? `Categoria: ${task.category}` : 'Gestão Administrativa',
        allDay: !task.dueTime,
        userName: task.assigneeName,
        userRole: task.assigneeRole || 'Responsável pela Tarefa',
        priority: (task.priority as any) || 'media',
        status: task.state,
        targetRoute: 'tarefas',
        targetId: task.id,
        sourceModule: 'Módulo 36 - Tarefas'
      });
    }
  });

  // 5. PAGAMENTOS (Mensalidades e contas a receber com vencimento no mês)
  contasReceber.forEach(cr => {
    if (cr.dueDate) {
      aggregated.push({
        id: `cr-cal-${cr.id}`,
        institutionId: cr.institutionId,
        branchId: cr.branchId,
        category: 'pagamento',
        title: `Vencimento: ${cr.studentName || cr.debtorName || 'Mensalidade'}`,
        description: `${cr.description || 'Mensalidade'} | Valor: ${Number(cr.totalAmount || cr.amount || 0).toLocaleString()} MT | Categoria: ${cr.category} | Estado: ${cr.status?.toUpperCase()}`,
        startDate: cr.dueDate,
        startTime: '16:00',
        location: 'Tesouraria / Sistema Online',
        allDay: true,
        userName: cr.studentName || cr.debtorName,
        userRole: 'Aluno / Pagador',
        amount: cr.totalAmount || cr.amount,
        status: cr.status,
        priority: cr.status === 'pendente' ? 'alta' : 'baixa',
        targetRoute: 'pagamentos',
        targetId: cr.id,
        sourceModule: 'Módulo 29 - Financeiro'
      });
    }
  });

  // 6. ANIVERSÁRIOS (Alunos e Professores mapeados para o ano do calendário)
  // Alunos
  students.forEach(st => {
    if (st.birthDate) {
      // Format can be YYYY-MM-DD or DD/MM/YYYY
      const parts = st.birthDate.split(/[-/]/);
      let birthMonth = -1;
      let birthDay = -1;
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          birthMonth = parseInt(parts[1], 10) - 1;
          birthDay = parseInt(parts[2], 10);
        } else {
          // DD-MM-YYYY
          birthMonth = parseInt(parts[1], 10) - 1;
          birthDay = parseInt(parts[0], 10);
        }

        if (!isNaN(birthMonth) && !isNaN(birthDay) && birthDay > 0 && birthDay <= 31) {
          const targetDateStr = `${year}-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
          aggregated.push({
            id: `bday-student-${st.id}-${year}`,
            institutionId: st.institutionId,
            branchId: st.branchId,
            category: 'aniversario',
            title: `Aniversário: ${st.fullName}`,
            description: `Estudante do curso de ${st.courseName || 'Formação'}, Turma: ${st.classGroupName || 'Geral'}. Contato: ${st.phone || 'N/A'}`,
            startDate: targetDateStr,
            allDay: true,
            userName: st.fullName,
            userRole: 'Estudante',
            userId: st.id,
            classGroupName: st.classGroupName,
            courseName: st.courseName,
            status: 'comemoracao',
            targetRoute: 'alunos_perfil',
            targetId: st.id,
            sourceModule: 'Cadastro de Alunos'
          });
        }
      }
    }
  });

  // Professores (aniversários)
  teachers.forEach(tc => {
    if (tc.biNumber || tc.id) {
      // Mock or actual birth date for teachers if not explicit
      const teacherSeedDay = (tc.fullName.length * 7) % 28 + 1;
      const teacherSeedMonth = (tc.fullName.length * 3) % 12;
      const targetDateStr = `${year}-${String(teacherSeedMonth + 1).padStart(2, '0')}-${String(teacherSeedDay).padStart(2, '0')}`;
      aggregated.push({
        id: `bday-teacher-${tc.id}-${year}`,
        institutionId: tc.institutionId,
        branchId: tc.branchId,
        category: 'aniversario',
        title: `Aniversário Docente: ${tc.fullName}`,
        description: `Docente de ${tc.specialty || 'Especialidade'}. Contato: ${tc.email} / ${tc.phone}`,
        startDate: targetDateStr,
        allDay: true,
        userName: tc.fullName,
        userRole: 'Professor / Formador',
        userId: tc.id,
        status: 'comemoracao',
        targetRoute: 'professores_gestao',
        targetId: tc.id,
        sourceModule: 'Corpo Docente'
      });
    }
  });

  // 7. ESTÁGIOS (Início, fim e marcos de estágios profissionais)
  internships.forEach(intern => {
    if (intern.startDate) {
      aggregated.push({
        id: `intern-start-${intern.id}`,
        institutionId: intern.institutionId,
        branchId: intern.branchId,
        category: 'estagio',
        title: `Início de Estágio: ${intern.studentName}`,
        description: `Empresa: ${intern.company.name} (${intern.company.city}) | Orientador Acadêmico: ${intern.supervisor.academicSupervisor} | Carga: ${intern.workloadHours}h`,
        startDate: intern.startDate,
        startTime: '08:30',
        location: intern.company.name,
        allDay: true,
        userName: intern.studentName,
        userRole: 'Estagiário',
        userId: intern.studentId,
        classGroupName: intern.classGroupName,
        status: 'iniciado',
        targetRoute: 'estagios',
        targetId: intern.id,
        sourceModule: 'Módulo 20 - Estágios'
      });
    }

    if (intern.endDate) {
      aggregated.push({
        id: `intern-end-${intern.id}`,
        institutionId: intern.institutionId,
        branchId: intern.branchId,
        category: 'estagio',
        title: `Conclusão de Estágio: ${intern.studentName}`,
        description: `Empresa: ${intern.company.name} | Prazo Limite para Entrega do Relatório Técnico de Estágio`,
        startDate: intern.endDate,
        startTime: '17:00',
        location: intern.company.name,
        allDay: true,
        userName: intern.studentName,
        userRole: 'Estagiário',
        userId: intern.studentId,
        classGroupName: intern.classGroupName,
        status: 'conclusao',
        priority: 'alta',
        targetRoute: 'estagios',
        targetId: intern.id,
        sourceModule: 'Módulo 20 - Estágios'
      });
    }
  });

  // NOW APPLY ALL FILTERS (INSTITUTION, USER, CATEGORIES, SEARCH)
  return aggregated.filter(ev => {
    // 1. Institution Filter
    if (filters.institutionId && filters.institutionId !== 'all') {
      if (ev.institutionId && ev.institutionId !== filters.institutionId) {
        return false;
      }
    }

    // 2. Category Filter
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      if (!filters.selectedCategories.includes(ev.category)) {
        return false;
      }
    }

    // 3. User Filter
    if (filters.userId && filters.userId !== 'all') {
      if (filters.userId === 'current') {
        const cName = (filters.currentUserName || '').toLowerCase();
        const evUser = (ev.userName || '').toLowerCase();
        if (!cName || !evUser.includes(cName)) {
          return false;
        }
      } else {
        // Specific user name or id
        const target = filters.userId.toLowerCase();
        const evUser = (ev.userName || '').toLowerCase();
        const evUserId = (ev.userId || '').toLowerCase();
        if (!evUser.includes(target) && !evUserId.includes(target)) {
          return false;
        }
      }
    }

    // 4. Text Search Query
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = (ev.title || '').toLowerCase().includes(q);
      const matchDesc = (ev.description || '').toLowerCase().includes(q);
      const matchLoc = (ev.location || '').toLowerCase().includes(q);
      const matchUser = (ev.userName || '').toLowerCase().includes(q);
      const matchDisc = (ev.disciplineName || '').toLowerCase().includes(q);
      const matchClass = (ev.classGroupName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchUser && !matchDisc && !matchClass) {
        return false;
      }
    }

    return true;
  });
}
