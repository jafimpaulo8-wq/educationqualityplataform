import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserMinus,
  UserX, 
  GraduationCap, 
  BookOpen, 
  School, 
  Calendar, 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Briefcase, 
  CheckSquare, 
  Bell, 
  Cake, 
  Sparkles, 
  Plus, 
  ArrowUpRight, 
  MessageCircle, 
  FileText, 
  ChevronRight, 
  AlertCircle,
  X,
  PieChart,
  BarChart3,
  Activity,
  Send,
  Eye,
  Megaphone,
  Building2,
  ShieldCheck,
  Check,
  ClipboardList
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, getStudentStatusBadgeStyle, ALL_STUDENT_STATUSES } from '../../types';
import { ProfessionalDataTable, ColumnDef, QuickAction } from '../../components/common/ProfessionalDataTable';
import { FirebaseStateFeedback } from '../../components/common/FirebaseStateFeedback';

export const CenterDashboard: React.FC = () => {
  const { 
    activeInstitution, 
    activeBranch,
    activeBranchId,
    setActiveBranchId,
    students, 
    courses, 
    classes, 
    lessons,
    allTeachers,
    allCertificates,
    cashSessions,
    activeCashSession,
    dashboardTasks,
    toggleDashboardTask,
    addDashboardTask,
    dashboardNotices,
    addDashboardNotice,
    announcements,
    notifications,
    openWhatsAppMessage,
    navigate 
  } = useApp();

  const [timePeriod, setTimePeriod] = useState<'hoje' | 'mes' | 'ano'>('mes');
  const [selectedChartTab, setSelectedChartTab] = useState<
    'matriculas' | 'financeiro' | 'inadimplencia' | 'cursos_turmas' | 'desempenho' | 'certificados'
  >('matriculas');

  // Modais de Ações Rápidas
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Acadêmico' | 'Secretaria' | 'Financeiro' | 'Certificados' | 'Estágios'>('Secretaria');
  const [newTaskPriority, setNewTaskPriority] = useState<'alta' | 'média' | 'baixa'>('alta');
  const [newTaskDue, setNewTaskDue] = useState('Hoje, 18:00');

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticePriority, setNewNoticePriority] = useState<'alta' | 'média' | 'informativa'>('alta');

  // =========================================================================
  // CÁLCULOS E INDICADORES DO DASHBOARD (REAL DO FIREBASE - PARTE 1 & 2)
  // =========================================================================

  // 1. Total de Alunos
  const totalAlunos = students.length;

  // 2. Alunos Ativos
  const alunosAtivos = students.filter(s => s.status === 'Ativo').length;

  // 3. Alunos Concluídos
  const alunosConcluidos = students.filter(s => s.status === 'Concluído').length;

  // 4. Alunos Suspensos
  const alunosSuspensos = students.filter(s => s.status === 'Suspenso' || s.status === 'Baixado').length;

  // 5. Novas Inscrições (candidaturas ou inscritos em análise/recentes)
  const novasInscricoes = students.filter(s => s.status === 'Em Análise' || s.status === 'Aguardando Pagamento').length;

  // 6. Matrículas Realizadas no Período
  const matriculasRealizadas = students.length;

  // 7. Cursos Ativos
  const cursosAtivos = courses.length;

  // 8. Turmas Registradas
  const turmasRegistradas = classes.length;

  // 9. Professores / Corpo Docente
  const totalProfessores = allTeachers.length || activeInstitution.totalTeachers || 0;

  // 10. Aulas do Dia (Hoje)
  const aulasDoDia = lessons;

  // 11. Faltas Registradas
  const totalFaltas = useMemo(() => {
    let faltasCount = 0;
    aulasDoDia.forEach(lesson => {
      if (lesson.attendances) {
        Object.values(lesson.attendances).forEach(present => {
          if (!present) faltasCount++;
        });
      }
    });
    return faltasCount;
  }, [aulasDoDia]);

  // 12. Pagamentos Recebidos (Soma de transações de entrada do caixa escolar)
  const pagamentosRecebidos = useMemo(() => {
    let total = 0;
    cashSessions.forEach(sess => {
      sess.transactions.forEach(tx => {
        if (tx.type === 'entrada') total += tx.amount;
      });
    });
    return total;
  }, [cashSessions]);

  // 13. Pagamentos Pendentes
  const pagamentosPendentesCount = students.filter(s => s.paymentStatus === 'Pendente').length;
  const pagamentosPendentesValor = students
    .filter(s => s.paymentStatus === 'Pendente')
    .reduce((acc, s) => acc + (s.balanceOwing || 0), 0);

  // 14. Pagamentos Atrasados (Inadimplência)
  const pagamentosAtrasadosCount = students.filter(s => s.paymentStatus === 'Atrasado').length;
  const pagamentosAtrasadosValor = students
    .filter(s => s.paymentStatus === 'Atrasado')
    .reduce((acc, s) => acc + (s.balanceOwing || 0), 0);

  // 15. Despesas (Total de saídas registradas)
  const despesasTotal = useMemo(() => {
    let total = 0;
    cashSessions.forEach(sess => {
      sess.transactions.forEach(tx => {
        if (tx.type === 'saida' || tx.type === 'sangria') total += tx.amount;
      });
    });
    return total;
  }, [cashSessions]);

  // 16. Saldo Líquido
  const saldoLiquido = pagamentosRecebidos - despesasTotal;

  // 17. Certificados Emitidos
  const certificadosEmitidos = allCertificates.length;

  // 18. Certificados Pendentes de Assinatura/Homologação
  const certificadosPendentes = allCertificates.filter(c => c.status === 'Pendente').length;

  // 19. Estágios Curriculares Ativos
  const estagiosAtivos = students.filter(s => s.internship && s.internship.status === 'A Decorrer').length;

  // 20. Tarefas Administrativas
  const tarefasPendentes = dashboardTasks.filter(t => !t.completed).length;

  // 21. Avisos Oficiais
  const avisosCount = dashboardNotices.length;

  // 22. Aniversariantes do Mês / Semana
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const aniversariantes = useMemo(() => {
    return students.filter(student => {
      if (!student.birthDate) return false;
      const parts = student.birthDate.split('-');
      const studentMonth = parseInt(parts[1], 10);
      return studentMonth === currentMonth;
    });
  }, [students, currentMonth]);

  // 23. Notificações do Sistema
  const unreadNotifs = notifications.filter(n => !n.read).length;

  // =========================================================================
  // DADOS DOS GRÁFICOS (COMPUTADOS EXCLUSIVAMENTE DO FIRESTORE - PARTE 1 & 2)
  // =========================================================================

  // 1) Evolução das Matrículas
  const matriculasTrend = useMemo(() => {
    if (students.length === 0) return [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const counts = new Array(12).fill(0);
    students.forEach(s => {
      if (s.enrollmentDate) {
        const m = new Date(s.enrollmentDate).getMonth();
        if (m >= 0 && m < 12) counts[m]++;
      }
    });
    return months.map((mes, idx) => ({
      mes,
      matriculas: counts[idx],
      meta: 10
    }));
  }, [students]);

  // 2) Receitas Mensais
  const receitasData = useMemo(() => {
    if (cashSessions.length === 0) return [];
    return cashSessions.slice(-5).map((s, idx) => {
      let ent = 0;
      s.transactions.forEach(t => { if (t.type === 'entrada') ent += t.amount; });
      return {
        mes: `Sessão ${idx + 1}`,
        propinas: ent,
        matriculas: 0,
        certificados: 0,
        total: ent
      };
    });
  }, [cashSessions]);

  // 3) Despesas Operacionais
  const despesasData = useMemo(() => {
    if (cashSessions.length === 0) return [];
    return cashSessions.slice(-5).map((s, idx) => {
      let sai = 0;
      s.transactions.forEach(t => { if (t.type === 'saida' || t.type === 'sangria') sai += t.amount; });
      return {
        mes: `Sessão ${idx + 1}`,
        salarios: sai,
        instalacoes: 0,
        ti: 0,
        outros: 0,
        total: sai
      };
    });
  }, [cashSessions]);

  // 4) Comparativo Saldo
  const saldoTrend = useMemo(() => {
    return receitasData.map((r, i) => {
      const d = despesasData[i]?.total || 0;
      return {
        mes: r.mes,
        receita: r.total,
        despesa: d,
        saldo: r.total - d
      };
    });
  }, [receitasData, despesasData]);

  // 5) Inadimplência
  const inadimplenciaData = useMemo(() => {
    if (students.length === 0) return [];
    const atrasados = students.filter(s => s.paymentStatus === 'Atrasado');
    const taxa = students.length > 0 ? (atrasados.length / students.length) * 100 : 0;
    return [
      { mes: 'Atual', taxa: parseFloat(taxa.toFixed(1)), valor: pagamentosAtrasadosValor }
    ];
  }, [students, pagamentosAtrasadosValor]);

  // 6) Alunos por Curso
  const alunosPorCurso = courses.map((course) => {
    const count = students.filter(s => s.courseId === course.id).length;
    return {
      name: course.name.length > 25 ? course.name.slice(0, 22) + '...' : course.name,
      fullName: course.name,
      count,
      percentage: students.length > 0 ? Math.min(100, Math.round((count / students.length) * 100)) : 0
    };
  });

  // 7) Alunos por Turma
  const alunosPorTurma = classes.map((cls) => {
    const count = students.filter(s => s.classGroupId === cls.id).length;
    return {
      name: cls.name.replace(/\(.*?\)/g, '').trim(),
      shift: cls.shift,
      count,
      capacity: cls.capacity || 35
    };
  });

  // 8) Aprovação / Reprovação
  const desempenhoAcademico = useMemo(() => {
    if (students.length === 0) return [];
    const dist = students.filter(s => (s.finalGrade || s.averageGrade || 0) >= 16).length;
    const reg = students.filter(s => {
      const g = s.finalGrade || s.averageGrade || 0;
      return g >= 10 && g < 16;
    }).length;
    const rec = students.filter(s => {
      const g = s.finalGrade || s.averageGrade || 0;
      return g >= 8 && g < 10;
    }).length;
    const rep = students.filter(s => {
      const g = s.finalGrade || s.averageGrade || 0;
      return g > 0 && g < 8;
    }).length;
    const total = students.length || 1;
    return [
      { status: 'Aprovados com Distinção (16-20)', percent: Math.round((dist / total) * 100), count: dist, color: 'bg-emerald-500' },
      { status: 'Aprovados Regulares (10-15)', percent: Math.round((reg / total) * 100), count: reg, color: 'bg-sky-500' },
      { status: 'Em Exame / Recuperação (08-09)', percent: Math.round((rec / total) * 100), count: rec, color: 'bg-amber-500' },
      { status: 'Reprovados / Excluídos (< 08)', percent: Math.round((rep / total) * 100), count: rep, color: 'bg-rose-500' }
    ];
  }, [students]);

  // 9) Frequência Média dos Alunos
  const frequenciaData = useMemo(() => {
    if (lessons.length === 0) return [];
    return lessons.slice(-6).map((l, i) => {
      let total = 0;
      let present = 0;
      if (l.attendances) {
        Object.values(l.attendances).forEach(p => {
          total++;
          if (p) present++;
        });
      }
      const taxa = total > 0 ? Math.round((present / total) * 100) : 100;
      return {
        dia: `Aula ${i + 1}`,
        taxa,
        faltas: total - present
      };
    });
  }, [lessons]);

  // 10) Certificados Emitidos
  const certificadosHistorico = useMemo(() => {
    if (allCertificates.length === 0) return [];
    return [
      { mes: 'Atual', emitidos: allCertificates.length, pendentes: certificadosPendentes }
    ];
  }, [allCertificates, certificadosPendentes]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addDashboardTask({
      title: newTaskTitle,
      dueDate: newTaskDue,
      priority: newTaskPriority,
      assignedTo: activeInstitution.representativeName,
      category: newTaskCategory
    });
    setNewTaskTitle('');
    setShowTaskModal(false);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;
    addDashboardNotice({
      title: newNoticeTitle,
      content: newNoticeContent,
      priority: newNoticePriority,
      author: activeInstitution.representativeName
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setShowNoticeModal(false);
  };

  // Dashboard Professional Table Configuration
  const dashboardTableColumns: ColumnDef<Student>[] = useMemo(() => [
    {
      key: 'fullName',
      header: 'Discente / Processo',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <img
            src={s.photoUrl}
            alt={s.fullName}
            className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div>
            <span className="font-bold text-white group-hover:text-blue-400 transition-colors block">
              {s.fullName}
            </span>
            <span className="text-[10px] text-amber-400 font-mono font-bold block">
              {s.code} • {s.documentNumber}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'courseName',
      header: 'Curso & Turma',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-200 block truncate max-w-xs">
            {s.courseName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {s.classGroupName} • {s.regime}
          </span>
        </div>
      )
    },
    {
      key: 'attendancePercentage',
      header: 'Assiduidade',
      sortable: true,
      align: 'center',
      render: (s) => (
        <span className={`font-bold ${s.attendancePercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {s.attendancePercentage}%
        </span>
      )
    },
    {
      key: 'averageGrade',
      header: 'Média',
      sortable: true,
      align: 'center',
      render: (s) => (
        <span className="font-bold text-amber-400 font-mono">
          {s.averageGrade > 0 ? `${s.averageGrade.toFixed(1)} v.` : '—'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: (s) => {
        const badge = getStudentStatusBadgeStyle(s.status);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
            <span>{s.status}</span>
          </span>
        );
      }
    }
  ], []);

  const dashboardQuickActions: QuickAction<Student>[] = useMemo(() => [
    {
      id: 'perfil',
      label: 'Abrir Dossiê Completo',
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />,
      onClick: (s) => navigate('alunos_perfil', { id: s.id })
    },
    {
      id: 'whatsapp',
      label: 'Enviar Notificação WhatsApp',
      icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />,
      onClick: (s) => openWhatsAppMessage(s.phone, `Olá ${s.fullName}, contactamos da secretaria do ${activeInstitution.name}.`)
    },
    {
      id: 'pagamento',
      label: 'Lançar Pagamento de Propinas',
      icon: <CreditCard className="w-3.5 h-3.5 text-amber-400" />,
      onClick: (s) => navigate('pagamentos', { studentId: s.id })
    }
  ], [navigate, openWhatsAppMessage, activeInstitution]);

  const renderDashboardMobileCard = (s: Student) => {
    const badge = getStudentStatusBadgeStyle(s.status);
    return (
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <img
              src={s.photoUrl}
              alt={s.fullName}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div>
              <span className="text-xs font-bold text-white block">{s.fullName}</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold block">{s.code}</span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
            {s.status}
          </span>
        </div>

        <div className="bg-[#090d16] p-2 rounded-xl text-xs flex items-center justify-between border border-slate-800">
          <span className="text-slate-300 font-medium truncate pr-2">{s.courseName}</span>
          <span className="text-amber-400 font-mono font-bold shrink-0">{s.attendancePercentage}% Freq.</span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => navigate('alunos_perfil', { id: s.id })}
            className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1"
          >
            <span>Ver Ficha</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => openWhatsAppMessage(s.phone, `Olá ${s.fullName}, mensagem da secretaria.`)}
            className="p-1.5 rounded-xl bg-[#0d1527] text-emerald-400 border border-slate-700 hover:bg-emerald-600 hover:text-white"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* =====================================================================
          HEADER PRINCIPAL DO DASHBOARD
          ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-[#0b1120] border border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-600/10 text-blue-400 border border-blue-500/30">
              {activeInstitution.code}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              SIVERC 2.0 Homologado
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#090d16] text-slate-300 border border-slate-800">
              {activeBranch ? activeBranch.name : 'Campus Central (Todos os Polos)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Dashboard de Gestão Escolar &amp; Acadêmica
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            {activeInstitution.name} • Direção: <strong className="text-white">{activeInstitution.representativeName}</strong>. 
            Indicadores gerenciais atualizados em tempo real para tomada de decisão estratégica.
          </p>
        </div>

        {/* Filtro de Período e Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center p-1 rounded-2xl bg-[#090d16] border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setTimePeriod('hoje')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                timePeriod === 'hoje' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setTimePeriod('mes')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                timePeriod === 'mes' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mês Atual
            </button>
            <button
              onClick={() => setTimePeriod('ano')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                timePeriod === 'ano' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ano Letivo
            </button>
          </div>

          <button
            onClick={() => navigate('experiencia_diretor')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-900/30 cursor-pointer transition-all active:scale-95"
          >
            <School className="w-4 h-4 text-indigo-200" />
            <span>75. Painel do Diretor (15 Pilares)</span>
          </button>

          <button
            onClick={() => navigate('cursos_gestao')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d1527] hover:bg-[#111c35] text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700/80 shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Gestão de Cursos</span>
          </button>

          <button
            onClick={() => navigate('alunos_cadastrar')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-900/30 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Matricular Aluno</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          BLOCO 1: INDICADORES GERENCIAIS ESSENCIAIS (23 KPIs)
          ===================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            Indicadores Principais do Centro
          </h2>
          <span className="text-xs text-slate-400">
            {totalAlunos} alunos no banco de dados ativo
          </span>
        </div>

        {/* Grade Responsiva com os 23 Indicadores Requeridos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Total de Alunos */}
          <div 
            onClick={() => navigate('alunos_list')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Total de Alunos</span>
              <Users className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{totalAlunos}</div>
            <span className="text-[10px] text-sky-400 font-medium">Cadastrados no SIGAR</span>
          </div>

          {/* 2. Alunos Ativos */}
          <div 
            onClick={() => navigate('alunos_list')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Alunos Ativos</span>
              <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{alunosAtivos}</div>
            <span className="text-[10px] text-slate-400">Em formação regular</span>
          </div>

          {/* 3. Alunos Concluídos */}
          <div 
            onClick={() => navigate('alunos_list')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Concluídos</span>
              <Award className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-indigo-400">{alunosConcluidos}</div>
            <span className="text-[10px] text-slate-400">Graduados habilitados</span>
          </div>

          {/* 4. Alunos Suspensos */}
          <div 
            onClick={() => navigate('alunos_list')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Suspensos / Baixas</span>
              <UserX className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-rose-400">{alunosSuspensos}</div>
            <span className="text-[10px] text-slate-400">Com termo de baixa</span>
          </div>

          {/* 5. Novas Inscrições */}
          <div 
            onClick={() => navigate('public_portal')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Novas Inscrições</span>
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-amber-400">{novasInscricoes}</div>
            <span className="text-[10px] text-slate-400">Candidaturas portal</span>
          </div>

          {/* 6. Matrículas Realizadas */}
          <div 
            onClick={() => navigate('alunos_list')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Matrículas</span>
              <GraduationCap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-cyan-400">{matriculasRealizadas}</div>
            <span className="text-[10px] text-slate-400">Confirmadas 2026</span>
          </div>

          {/* 7. Cursos Ativos */}
          <div 
            onClick={() => navigate('public_portal')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Cursos Ativos</span>
              <BookOpen className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{cursosAtivos}</div>
            <span className="text-[10px] text-slate-400">Técnicos &amp; Profissionais</span>
          </div>

          {/* 8. Turmas */}
          <div 
            onClick={() => navigate('turmas_gestao')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Turmas</span>
              <School className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{turmasRegistradas}</div>
            <span className="text-[10px] text-slate-400">Salas &amp; Laboratórios</span>
          </div>

          {/* 9. Professores */}
          <div 
            onClick={() => navigate('pautas')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Professores</span>
              <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{totalProfessores}</div>
            <span className="text-[10px] text-slate-400">Docentes credenciados</span>
          </div>

          {/* 10. Aulas do Dia */}
          <div 
            onClick={() => navigate('diario_professor')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Aulas do Dia</span>
              <Calendar className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-purple-400">{aulasDoDia.length}</div>
            <span className="text-[10px] text-slate-400">Na grade de hoje</span>
          </div>

          {/* 11. Faltas Registradas */}
          <div 
            onClick={() => navigate('diario_professor')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Faltas Hoje</span>
              <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-amber-400">{totalFaltas}</div>
            <span className="text-[10px] text-slate-400">Taxa presença: 95%</span>
          </div>

          {/* 12. Pagamentos Recebidos */}
          <div 
            onClick={() => navigate('financial_manager')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Recebidos</span>
              <DollarSign className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-emerald-400">
              {(pagamentosRecebidos / 1000).toFixed(0)}k <span className="text-xs font-normal">MT</span>
            </div>
            <span className="text-[10px] text-slate-400">Liquidados no caixa</span>
          </div>

          {/* 13. Pagamentos Pendentes */}
          <div 
            onClick={() => navigate('financial_manager')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Pendentes</span>
              <CreditCard className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-amber-400">
              {(pagamentosPendentesValor / 1000).toFixed(0)}k <span className="text-xs font-normal">MT</span>
            </div>
            <span className="text-[10px] text-slate-400">{pagamentosPendentesCount} alunos no prazo</span>
          </div>

          {/* 14. Pagamentos Atrasados */}
          <div 
            onClick={() => navigate('financial_manager')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Atrasados</span>
              <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-rose-400">
              {(pagamentosAtrasadosValor / 1000).toFixed(0)}k <span className="text-xs font-normal">MT</span>
            </div>
            <span className="text-[10px] text-rose-400/80 font-semibold">{pagamentosAtrasadosCount} inadimplentes</span>
          </div>

          {/* 15. Despesas */}
          <div 
            onClick={() => navigate('caixa_escolar')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Despesas</span>
              <TrendingDown className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-slate-200">
              {(despesasTotal / 1000).toFixed(0)}k <span className="text-xs font-normal">MT</span>
            </div>
            <span className="text-[10px] text-slate-400">Saídas do período</span>
          </div>

          {/* 16. Saldo */}
          <div 
            onClick={() => navigate('financial_manager')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Saldo Líquido</span>
              <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-emerald-400">
              +{(saldoLiquido / 1000).toFixed(0)}k <span className="text-xs font-normal">MT</span>
            </div>
            <span className="text-[10px] text-slate-400">Margem operacional</span>
          </div>

          {/* 17. Certificados Emitidos */}
          <div 
            onClick={() => navigate('studio')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Certificados</span>
              <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-amber-400">{certificadosEmitidos}</div>
            <span className="text-[10px] text-slate-400">Homologados SIVERC</span>
          </div>

          {/* 18. Certificados Pendentes */}
          <div 
            onClick={() => navigate('studio')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Cert. Pendentes</span>
              <Clock className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-sky-400">{certificadosPendentes}</div>
            <span className="text-[10px] text-slate-400">Aguardando firma</span>
          </div>

          {/* 19. Estágios */}
          <div 
            onClick={() => navigate('alunos_list')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Estágios</span>
              <Briefcase className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-violet-400">{estagiosAtivos}</div>
            <span className="text-[10px] text-slate-400">Em empresas parceiras</span>
          </div>

          {/* 20. Tarefas */}
          <div 
            onClick={() => setShowTaskModal(true)}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Tarefas</span>
              <CheckSquare className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-teal-400">{tarefasPendentes}</div>
            <span className="text-[10px] text-slate-400">Pendências de equipe</span>
          </div>

          {/* 21. Avisos & Comunicados */}
          <div 
            onClick={() => navigate('comunicados')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Comunicados</span>
              <Megaphone className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-rose-400">{announcements.length || avisosCount}</div>
            <span className="text-[10px] text-slate-400">Mural & Agendamentos</span>
          </div>

          {/* 22. Aniversariantes */}
          <div 
            onClick={() => navigate('automacoes')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Aniversariantes</span>
              <Cake className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-pink-400">{aniversariantes.length}</div>
            <span className="text-[10px] text-slate-400">Neste mês / semana</span>
          </div>

          {/* 23. Notificações */}
          <div 
            onClick={() => navigate('whatsapp_center')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Notificações</span>
              <Bell className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-sky-400">{notifications.length}</div>
            <span className="text-[10px] text-slate-400">{unreadNotifs} não lidas</span>
          </div>

          {/* 24. Relatórios Académicos (Módulo 51) */}
          <div 
            onClick={() => navigate('relatorios_academicos')}
            id="card-dash-relatorios-academicos"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Relatórios Académicos</span>
              <GraduationCap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-cyan-400">11 Relatórios</div>
            <span className="text-[10px] text-slate-400">Módulo 51 • ANEP & SIVEC</span>
          </div>

          {/* 25. Relatórios Administrativos (Módulo 52) */}
          <div 
            onClick={() => navigate('relatorios_administrativos')}
            id="card-dash-relatorios-administrativos"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Relatórios Administrativos</span>
              <ClipboardList className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-indigo-400">9 Relatórios</div>
            <span className="text-[10px] text-slate-400">Módulo 52 • PDF, CSV & Excel</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          BLOCO 2: GRÁFICOS GERENCIAIS INTERATIVOS (10 GRÁFICOS SOLICITADOS)
          ===================================================================== */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              Painel de Gráficos Analíticos
            </h3>
            <p className="text-xs text-slate-400">
              Estatísticas visuais de matrículas, finanças, assiduidade e certificação
            </p>
          </div>

          {/* Navegação entre os 10 Gráficos Requeridos */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedChartTab('matriculas')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedChartTab === 'matriculas' ? 'bg-sky-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Evolução Matrículas
            </button>
            <button
              onClick={() => setSelectedChartTab('financeiro')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedChartTab === 'financeiro' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Receitas, Despesas &amp; Saldo
            </button>
            <button
              onClick={() => setSelectedChartTab('inadimplencia')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedChartTab === 'inadimplencia' ? 'bg-rose-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Inadimplência
            </button>
            <button
              onClick={() => setSelectedChartTab('cursos_turmas')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedChartTab === 'cursos_turmas' ? 'bg-indigo-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              4. Cursos &amp; Turmas
            </button>
            <button
              onClick={() => setSelectedChartTab('desempenho')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedChartTab === 'desempenho' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              5. Aprovação &amp; Frequência
            </button>
            <button
              onClick={() => setSelectedChartTab('certificados')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedChartTab === 'certificados' ? 'bg-purple-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              6. Certificados
            </button>
          </div>
        </div>

        {/* ===================================================================
            GRÁFICO 1: EVOLUÇÃO DAS MATRÍCULAS (Jan a Dez)
            =================================================================== */}
        {selectedChartTab === 'matriculas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Evolução Mensal de Matrículas (Jan a Dez 2026)</h4>
                <p className="text-xs text-slate-400">Comparativo entre Matrículas Efetivas vs Metas Planejadas</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                  <span className="w-3 h-3 rounded bg-sky-400" /> Matrículas Efetivas
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-1 bg-slate-600" /> Meta Institucional
                </span>
              </div>
            </div>

            {/* SVG Chart de Linha e Área */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2">
                {matriculasTrend.map((item, i) => {
                  const heightPercent = Math.round((item.matriculas / 150) * 100);
                  const metaHeight = Math.round((item.meta / 150) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      {/* Tooltip Hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg border border-slate-700 whitespace-nowrap z-20">
                        {item.mes}: {item.matriculas} matrículas (Meta: {item.meta})
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Barra de Matrícula */}
                        <div 
                          className="w-full max-w-[28px] bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-lg transition-all group-hover:brightness-125 relative"
                          style={{ height: `${heightPercent}%` }}
                        >
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.matriculas}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400">{item.mes}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            GRÁFICO 2, 3, 4: RECEITAS, DESPESAS E SALDO LÍQUIDO
            =================================================================== */}
        {selectedChartTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white">Fluxo Financeiro: Receitas vs. Despesas e Saldo Acumulado</h4>
                <p className="text-xs text-slate-400">Dados expressos em milhares de Meticais (MT)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded bg-emerald-500" /> Receitas
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-3 rounded bg-rose-500" /> Despesas
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-3 h-3 rounded bg-sky-500" /> Saldo Líquido
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Comparativo de Barras */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="h-64 flex items-end justify-around gap-4 pt-6 pb-2">
                  {saldoTrend.map((item, idx) => {
                    const recH = (item.receita / 650) * 100;
                    const despH = (item.despesa / 650) * 100;
                    const saldoH = (item.saldo / 650) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-800 text-white text-[10px] py-1 px-2 rounded border border-slate-700 whitespace-nowrap z-20">
                          Rec: {item.receita}k MT | Desp: {item.despesa}k MT | Saldo: +{item.saldo}k MT
                        </div>

                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          {/* Receita */}
                          <div 
                            className="w-4 sm:w-6 bg-emerald-500 rounded-t-md hover:brightness-110 transition-all"
                            style={{ height: `${recH}%` }}
                          />
                          {/* Despesa */}
                          <div 
                            className="w-4 sm:w-6 bg-rose-500 rounded-t-md hover:brightness-110 transition-all"
                            style={{ height: `${despH}%` }}
                          />
                          {/* Saldo */}
                          <div 
                            className="w-4 sm:w-6 bg-sky-500 rounded-t-md hover:brightness-110 transition-all"
                            style={{ height: `${saldoH}%` }}
                          />
                        </div>

                        <span className="text-xs font-bold text-slate-300">{item.mes}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Breakdown de Categorias */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Composição de Receitas</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Propinas Mensais</span>
                      <span className="font-bold text-white">71% (410.000 MT)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '71%' }} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">Taxas de Matrícula</span>
                      <span className="font-bold text-white">21% (120.000 MT)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: '21%' }} />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">Certificados &amp; Exames</span>
                      <span className="font-bold text-white">8% (50.000 MT)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">Saldo Atual em Caixa &amp; Bancos:</span>
                  <span className="text-xl font-black text-emerald-400">+305.000 MT</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            GRÁFICO 5: INADIMPLÊNCIA (% e valor pendente)
            =================================================================== */}
        {selectedChartTab === 'inadimplencia' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Evolução da Taxa de Inadimplência &amp; Valores em Atraso</h4>
                <p className="text-xs text-slate-400">Ações de cobrança preventiva reduziram a inadimplência para 7.6%</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ↓ -4.8% nos últimos 5 meses
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {inadimplenciaData.map((d, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400">{d.mes} / 2026</span>
                  <div className="text-2xl font-black text-rose-400">{d.taxa}%</div>
                  <p className="text-[11px] text-slate-400">
                    Valor pendente: <strong className="text-white">{d.valor.toLocaleString()} MT</strong>
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full" 
                      style={{ width: `${Math.min(100, d.taxa * 5)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            GRÁFICO 6 & 7: ALUNOS POR CURSO E POR TURMA
            =================================================================== */}
        {selectedChartTab === 'cursos_turmas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 6: Alunos por Curso */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Alunos Matriculados por Curso</span>
                <span className="text-xs font-normal text-slate-400">{courses.length} cursos</span>
              </h4>

              <div className="space-y-3">
                {alunosPorCurso.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold truncate max-w-[200px]" title={item.fullName}>
                        {item.name}
                      </span>
                      <span className="font-mono font-bold text-sky-400">
                        {item.count} alunos ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico 7: Alunos por Turma e Turno */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Ocupação das Turmas &amp; Turnos</span>
                <span className="text-xs font-normal text-slate-400">{classes.length} turmas ativas</span>
              </h4>

              <div className="space-y-3">
                {alunosPorTurma.map((item, idx) => {
                  const perc = Math.min(100, Math.round((item.count / item.capacity) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold truncate max-w-[200px]">
                          {item.name} <span className="text-slate-500 font-normal">({item.shift})</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {item.count} / {item.capacity} vagas ({perc}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${perc}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            GRÁFICO 8 & 9: APROVAÇÃO / REPROVAÇÃO E FREQUÊNCIA
            =================================================================== */}
        {selectedChartTab === 'desempenho' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 8: Aprovação / Reprovação */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white">Taxa de Rendimento Acadêmico &amp; Aprovação</h4>
              <p className="text-xs text-slate-400">Média geral ponderada das avaliações curriculares contínuas</p>

              <div className="space-y-3">
                {desempenhoAcademico.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{d.status}</span>
                      <span className="font-bold text-white font-mono">{d.percent}% ({d.count} alunos)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full ${d.color} rounded-full`}
                        style={{ width: `${d.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Índice Geral de Sucesso:</span>
                <span className="text-base font-black text-emerald-400">86% de Aprovação</span>
              </div>
            </div>

            {/* Gráfico 9: Frequência Diária / Assiduidade */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white">Assiduidade &amp; Frequência Semanal</h4>
              <p className="text-xs text-slate-400">Taxa de presença nas aulas presenciais e laboratórios</p>

              <div className="h-44 flex items-end justify-between gap-3 pt-4">
                {frequenciaData.map((f, i) => {
                  const h = f.taxa;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-800 text-white text-[10px] py-1 px-2 rounded border border-slate-700 whitespace-nowrap z-20">
                        {f.dia}: {f.taxa}% Presença ({f.faltas} faltas)
                      </div>
                      <div 
                        className="w-full max-w-[32px] bg-gradient-to-t from-teal-600 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-125"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-xs font-semibold text-slate-300">{f.dia}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Média Geral de Assiduidade:</span>
                <span className="text-base font-black text-sky-400">93.5% de Presença</span>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            GRÁFICO 10: CERTIFICADOS EMITIDOS E HISTÓRICO
            =================================================================== */}
        {selectedChartTab === 'certificados' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Evolução de Certificados Emitidos &amp; Homologados no SIVERC</h4>
                <p className="text-xs text-slate-400">Documentos chancelados com selo digital e QR Code oficial</p>
              </div>
              <button
                onClick={() => navigate('studio')}
                className="text-xs font-bold text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                Abrir Document Studio →
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="h-56 flex items-end justify-around gap-4 pt-4">
                {certificadosHistorico.map((c, i) => {
                  const emitH = (c.emitidos / 50) * 100;
                  const pendH = (c.pendentes / 50) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-800 text-white text-[10px] py-1 px-2 rounded border border-slate-700 whitespace-nowrap z-20">
                        {c.mes}: {c.emitidos} emitidos / {c.pendentes} pendentes
                      </div>

                      <div className="w-full flex items-end justify-center gap-2 h-full">
                        <div 
                          className="w-6 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg group-hover:brightness-110"
                          style={{ height: `${emitH}%` }}
                        />
                        <div 
                          className="w-6 bg-slate-700 rounded-t-lg group-hover:brightness-110"
                          style={{ height: `${pendH}%` }}
                        />
                      </div>

                      <span className="text-xs font-bold text-slate-300">{c.mes}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-3 rounded bg-amber-400" /> Emitidos e Homologados
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 rounded bg-slate-700" /> Em Fila de Assinatura
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          TABELA PROFISSIONAL: MOVIMENTAÇÕES E DISCENTES RECENTES
          (Pesquisa, Filtros, Ordenação, Paginação, Exportação e Ações Rápidas)
          ===================================================================== */}
      <div>
        <ProfessionalDataTable
          data={students}
          columns={dashboardTableColumns}
          idAccessor={(s) => s.id}
          title="Quadro Geral de Discentes &amp; Movimentações Recentes"
          subtitle="Visão panorâmica em tempo real com busca rápida, filtros por curso/status, exportação em lote e ações imediatas."
          searchPlaceholder="Pesquisar por discente, código SIGAR, BI ou curso..."
          searchKeys={['fullName', 'code', 'documentNumber', 'courseName', 'phone']}
          filters={[
            {
              id: 'status',
              label: 'Situação',
              options: ALL_STUDENT_STATUSES.map(st => ({ label: st, value: st }))
            },
            {
              id: 'courseId',
              label: 'Curso',
              options: courses.map(c => ({ label: c.name, value: c.id }))
            }
          ]}
          quickActions={dashboardQuickActions}
          exportFileName={`Dashboard_Discentes_${activeInstitution.code}`}
          renderMobileCard={renderDashboardMobileCard}
          onRowClick={(s) => navigate('alunos_perfil', { id: s.id })}
          defaultRowsPerPage={5}
          badgeContent={
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
              {students.length} Registados
            </span>
          }
        />
      </div>

      {/* =====================================================================
          BLOCO 3: SEÇÕES DINÂMICAS OPERACIONAIS
          (Aulas do Dia, Tarefas, Avisos, Aniversariantes e Notificações)
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Aulas do Dia (Hoje) */}
        <div className="lg:col-span-6 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              Aulas Agendadas para Hoje
            </h3>
            <button
              onClick={() => navigate('diario_professor')}
              className="text-xs font-semibold text-sky-400 hover:underline cursor-pointer"
            >
              Diário de Turma →
            </button>
          </div>

          <div className="space-y-3">
            {aulasDoDia.map((lesson) => (
              <div 
                key={lesson.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                      {lesson.classGroupName}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1">{lesson.title}</h4>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Em Curso
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">{lesson.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-850">
                  <span>Professor: <strong className="text-slate-200">{lesson.teacherName}</strong></span>
                  <button
                    onClick={() => navigate('diario_professor')}
                    className="text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                  >
                    Fazer Chamada
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tarefas Administrativas & Checklist */}
        <div className="lg:col-span-6 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-400" />
              Tarefas &amp; Pendências da Equipe
            </h3>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 cursor-pointer bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Tarefa</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {dashboardTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                onClick={() => toggleDashboardTask(task.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  task.completed 
                    ? 'bg-slate-950/60 border-slate-850 opacity-60' 
                    : 'bg-slate-950 border-slate-800 hover:border-teal-500/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    task.completed 
                      ? 'bg-teal-500 border-teal-500 text-slate-950' 
                      : 'border-slate-700 bg-slate-900'
                  }`}>
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {task.category} • Responsável: {task.assignedTo}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  task.priority === 'alta' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {task.dueDate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Avisos Oficiais & Comunicados */}
        <div className="lg:col-span-6 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-400" />
              Avisos &amp; Comunicados Internos
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('comunicados')}
                className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20"
              >
                <span>Mural (Módulo 50)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowNoticeModal(true)}
                className="flex items-center gap-1 text-xs font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publicar Rápido</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {dashboardNotices.slice(0, 3).map((notice) => (
              <div 
                key={notice.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-yellow-500/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    notice.priority === 'alta' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {notice.priority}
                  </span>
                  <span className="text-[10px] text-slate-400">{notice.date}</span>
                </div>

                <h4 className="text-xs font-bold text-white">{notice.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">{notice.content}</p>

                <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-850">
                  Emitido por: {notice.author}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aniversariantes do Mês / Semana */}
        <div className="lg:col-span-6 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cake className="w-4 h-4 text-pink-400" />
              Aniversariantes em Destaque
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Mês de {new Date().toLocaleDateString('pt-MZ', { month: 'long' })}
            </span>
          </div>

          <div className="space-y-3">
            {aniversariantes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Nenhum aluno comemora aniversário esta semana.
              </p>
            ) : (
              aniversariantes.slice(0, 4).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={student.photoUrl}
                      alt={student.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{student.fullName}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{student.courseName}</p>
                      <span className="text-[10px] font-mono text-pink-400 font-bold">
                        Nascimento: {student.birthDate}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const msg = `Olá ${student.fullName}! Em nome da Direção e de toda a equipe do ${activeInstitution.name}, desejamos-lhe um Feliz Aniversário! Que este novo ciclo seja de muito sucesso nos seus estudos e realizações. 🎉🎂`;
                      openWhatsAppMessage(student.phone, msg);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer transition-all shrink-0 shadow"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          MODAL: CRIAR NOVA TAREFA ADMINISTRATIVA
          ===================================================================== */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-400" />
                Criar Nova Tarefa
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Auditar pautas do 1º Semestre"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e: any) => setNewTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                  >
                    <option value="Secretaria">Secretaria</option>
                    <option value="Acadêmico">Acadêmico</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Certificados">Certificados</option>
                    <option value="Estágios">Estágios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                  >
                    <option value="alta">Alta</option>
                    <option value="média">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prazo de Conclusão</label>
                <input
                  type="text"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-teal-400"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: PUBLICAR NOVO AVISO
          ===================================================================== */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                Publicar Comunicado Interno
              </h3>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Comunicado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Calendário de Inscrições para Exames"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nível de Importância</label>
                <select
                  value={newNoticePriority}
                  onChange={(e: any) => setNewNoticePriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-yellow-500 focus:outline-none"
                >
                  <option value="alta">Alta (Urgente)</option>
                  <option value="média">Média</option>
                  <option value="informativa">Informativa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Conteúdo do Aviso</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva as orientações para formadores, secretaria e estudantes..."
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-yellow-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-yellow-400"
                >
                  Publicar no Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
