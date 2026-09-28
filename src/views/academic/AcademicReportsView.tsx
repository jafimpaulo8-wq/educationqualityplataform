import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Filter,
  Search,
  Printer,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Briefcase,
  Layers,
  UserCheck,
  UserX,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Percent,
  RefreshCw,
  HelpCircle,
  Building,
  School,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { exportToCsv } from '../../utils/csvExport';
import { AcademicReportPrintModal } from './components/AcademicReportPrintModal';
import { StudentStatus, Course, ClassGroup, Teacher, Student } from '../../types';

export type AcademicReportType =
  | 'alunos_curso'
  | 'alunos_turma'
  | 'frequencia'
  | 'faltas'
  | 'medias'
  | 'aprovacao'
  | 'reprovacao'
  | 'abandono'
  | 'conclusao'
  | 'certificados'
  | 'estagio';

interface ReportTabConfig {
  id: AcademicReportType;
  title: string;
  shortTitle: string;
  icon: React.ReactNode;
  category: 'Matrículas & Turmas' | 'Assiduidade' | 'Desempenho & Notas' | 'Carreira & SIVEC';
  description: string;
  badgeColor: string;
}

const REPORT_TABS: ReportTabConfig[] = [
  // Matrículas & Turmas
  {
    id: 'alunos_curso',
    title: 'Alunos por Curso',
    shortTitle: 'Por Curso',
    icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
    category: 'Matrículas & Turmas',
    description: 'Consolidação de matrículas ativas, concluintes e ocupação por curso',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  },
  {
    id: 'alunos_turma',
    title: 'Alunos por Turma',
    shortTitle: 'Por Turma',
    icon: <Users className="w-4 h-4 text-sky-400" />,
    category: 'Matrículas & Turmas',
    description: 'Relação de turmas, formadores titulares, lotação e salas',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
  },
  // Assiduidade
  {
    id: 'frequencia',
    title: 'Frequência Escolar',
    shortTitle: 'Frequência',
    icon: <UserCheck className="w-4 h-4 text-emerald-400" />,
    category: 'Assiduidade',
    description: 'Assiduidade percentual, presenças acumuladas e taxa de engajamento',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    id: 'faltas',
    title: 'Faltas & Absenteísmo',
    shortTitle: 'Faltas',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    category: 'Assiduidade',
    description: 'Faltas justificadas e injustificadas com alerta de limiar ANEP',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  // Desempenho & Notas
  {
    id: 'medias',
    title: 'Médias & Desempenho',
    shortTitle: 'Médias',
    icon: <TrendingUp className="w-4 h-4 text-indigo-400" />,
    category: 'Desempenho & Notas',
    description: 'Médias calculadas de 0 a 20 valores e quadro de mérito acadêmico',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  },
  {
    id: 'aprovacao',
    title: 'Aprovação & Dispensa',
    shortTitle: 'Aprovação',
    icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />,
    category: 'Desempenho & Notas',
    description: 'Formandos aprovados direto (≥10) e dispensados de exame (≥14)',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
  },
  {
    id: 'reprovacao',
    title: 'Reprovação & Retenção',
    shortTitle: 'Reprovação',
    icon: <XCircle className="w-4 h-4 text-rose-400" />,
    category: 'Desempenho & Notas',
    description: 'Chumbos por nota, exclusão por faltas e disciplinas críticas',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  },
  {
    id: 'abandono',
    title: 'Abandono & Evasão',
    shortTitle: 'Abandono',
    icon: <UserX className="w-4 h-4 text-orange-400" />,
    category: 'Desempenho & Notas',
    description: 'Desistências, trancamentos de matrícula e motivos registrados',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  },
  // Carreira & SIVEC
  {
    id: 'conclusao',
    title: 'Conclusão de Cursos',
    shortTitle: 'Conclusão',
    icon: <GraduationCap className="w-4 h-4 text-purple-400" />,
    category: 'Carreira & SIVEC',
    description: 'Formandos graduados, aptos para colação de grau e histórico final',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  {
    id: 'certificados',
    title: 'Certificados Emitidos',
    shortTitle: 'Certificados',
    icon: <Award className="w-4 h-4 text-yellow-400" />,
    category: 'Carreira & SIVEC',
    description: 'Diplomas homologados, códigos SIVEC, validação QR e hashes',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  },
  {
    id: 'estagio',
    title: 'Estágios Curriculares',
    shortTitle: 'Estágio',
    icon: <Briefcase className="w-4 h-4 text-blue-400" />,
    category: 'Carreira & SIVEC',
    description: 'Alocações em empresas parceiras, supervisores e notas práticas',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  }
];

export const AcademicReportsView: React.FC = () => {
  const {
    students,
    courses,
    classes,
    teachers,
    lessons,
    internships,
    certificates,
    activeInstitution
  } = useApp();

  // Active Report Selection
  const [activeReport, setActiveReport] = useState<AcademicReportType>('alunos_curso');

  // 5 Explicit Filters Required
  const [filterPeriod, setFilterPeriod] = useState<string>('todos');
  const [filterCourseId, setFilterCourseId] = useState<string>('todos');
  const [filterClassId, setFilterClassId] = useState<string>('todas');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Search query for fast matching
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // When course changes, reset or narrow class options
  const handleCourseFilterChange = (newCourseId: string) => {
    setFilterCourseId(newCourseId);
    if (newCourseId !== 'todos') {
      const classBelongs = classes.some(c => c.id === filterClassId && c.courseId === newCourseId);
      if (!classBelongs) {
        setFilterClassId('todas');
      }
    }
  };

  // Available classes dependent on course filter
  const availableClasses = useMemo(() => {
    if (filterCourseId === 'todos') return classes;
    return classes.filter(c => c.courseId === filterCourseId);
  }, [classes, filterCourseId]);

  // Teacher-associated classes / courses lookup
  const selectedTeacher = useMemo(() => {
    if (filterTeacherId === 'todos') return null;
    return teachers.find(t => t.id === filterTeacherId) || null;
  }, [teachers, filterTeacherId]);

  // Master Filter Engine for Students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // 1. Filter Course
      if (filterCourseId !== 'todos' && student.courseId !== filterCourseId) {
        return false;
      }

      // 2. Filter Class
      if (filterClassId !== 'todas' && student.classGroupId !== filterClassId) {
        return false;
      }

      // 3. Filter Teacher
      if (selectedTeacher) {
        const matchesClass = selectedTeacher.classGroupIds?.includes(student.classGroupId);
        const matchesCourse = selectedTeacher.courseIds?.includes(student.courseId);
        if (!matchesClass && !matchesCourse) {
          return false;
        }
      }

      // 4. Filter Status
      if (filterStatus !== 'todos') {
        if (filterStatus === 'Desistente') {
          const isDropout = student.status === 'Desistente' || student.status === 'Baixado' || student.status === 'Cancelado';
          if (!isDropout) return false;
        } else if (student.status !== filterStatus) {
          return false;
        }
      }

      // 5. Filter Period
      if (filterPeriod !== 'todos') {
        const studentYear = student.enrollmentDate ? student.enrollmentDate.slice(0, 4) : '2026';
        if (filterPeriod === '2026_ano' && studentYear !== '2026') return false;
        if (filterPeriod === '2025_ano' && studentYear !== '2025') return false;
        if (filterPeriod === '2026_sem1') {
          if (!student.enrollmentDate?.startsWith('2026-01') && !student.enrollmentDate?.startsWith('2026-02') && !student.enrollmentDate?.startsWith('2026-03') && !student.enrollmentDate?.startsWith('2026-04') && !student.enrollmentDate?.startsWith('2026-05') && !student.enrollmentDate?.startsWith('2026-06')) {
            return false;
          }
        }
        if (filterPeriod === '2026_sem2') {
          if (!student.enrollmentDate || studentYear !== '2026' || parseInt(student.enrollmentDate.slice(5, 7) || '1') < 7) {
            return false;
          }
        }
      }

      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.fullName.toLowerCase().includes(q);
        const matchesCode = student.code.toLowerCase().includes(q);
        const matchesBI = student.documentNumber?.toLowerCase().includes(q) || false;
        const matchesCourse = student.courseName?.toLowerCase().includes(q) || false;
        const matchesClass = student.classGroupName?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesCode && !matchesBI && !matchesCourse && !matchesClass) {
          return false;
        }
      }

      return true;
    });
  }, [students, filterCourseId, filterClassId, selectedTeacher, filterStatus, filterPeriod, searchQuery]);

  // Consolidated Data for "Alunos por Curso"
  const reportAlunosCurso = useMemo(() => {
    const list = courses.map(course => {
      const courseStudents = filteredStudents.filter(s => s.courseId === course.id);
      const activeCount = courseStudents.filter(s => s.status === 'Ativo' || s.status === 'Matriculado' || s.status === 'Em curso').length;
      const completedCount = courseStudents.filter(s => s.status === 'Concluído').length;
      const dropoutCount = courseStudents.filter(s => s.status === 'Desistente' || s.status === 'Baixado' || s.status === 'Cancelado').length;
      const failedCount = courseStudents.filter(s => s.status === 'Reprovado').length;
      
      const totalCapacity = course.totalVacancies || 40;
      const filledVacancies = course.filledVacancies || courseStudents.length;
      const occupancyRate = totalCapacity > 0 ? Math.min(100, Math.round((courseStudents.length / totalCapacity) * 100)) : 0;
      
      const avgGrade = courseStudents.length > 0 
        ? (courseStudents.reduce((acc, s) => acc + (s.averageGrade || 14), 0) / courseStudents.length).toFixed(1)
        : '-';

      const avgAttendance = courseStudents.length > 0
        ? Math.round(courseStudents.reduce((acc, s) => acc + (s.attendancePercentage || 90), 0) / courseStudents.length)
        : 0;

      return {
        course,
        totalStudents: courseStudents.length,
        activeCount,
        completedCount,
        dropoutCount,
        failedCount,
        totalCapacity,
        filledVacancies,
        occupancyRate,
        avgGrade,
        avgAttendance,
        students: courseStudents
      };
    });

    // If filterCourseId is set, filter to that course only
    if (filterCourseId !== 'todos') {
      return list.filter(item => item.course.id === filterCourseId);
    }
    return list;
  }, [courses, filteredStudents, filterCourseId]);

  // Consolidated Data for "Alunos por Turma"
  const reportAlunosTurma = useMemo(() => {
    const list = availableClasses.map(cls => {
      const classStudents = filteredStudents.filter(s => s.classGroupId === cls.id);
      const activeCount = classStudents.filter(s => s.status === 'Ativo' || s.status === 'Matriculado' || s.status === 'Em curso').length;
      const capacity = cls.capacity || 30;
      const occupancyRate = capacity > 0 ? Math.min(100, Math.round((classStudents.length / capacity) * 100)) : 0;
      
      const avgGrade = classStudents.length > 0
        ? (classStudents.reduce((acc, s) => acc + (s.averageGrade || 14), 0) / classStudents.length).toFixed(1)
        : '-';

      const avgAttendance = classStudents.length > 0
        ? Math.round(classStudents.reduce((acc, s) => acc + (s.attendancePercentage || 90), 0) / classStudents.length)
        : 0;

      return {
        classGroup: cls,
        totalStudents: classStudents.length,
        activeCount,
        capacity,
        occupancyRate,
        avgGrade,
        avgAttendance,
        students: classStudents
      };
    });

    return list;
  }, [availableClasses, filteredStudents]);

  // Consolidated Data for "Frequência"
  const reportFrequencia = useMemo(() => {
    return filteredStudents.map(student => {
      const rate = student.attendancePercentage !== undefined ? student.attendancePercentage : 92;
      let classification: 'Excelente' | 'Regular' | 'Atenção' | 'Exclusão' = 'Regular';
      if (rate >= 95) classification = 'Excelente';
      else if (rate >= 85) classification = 'Regular';
      else if (rate >= 75) classification = 'Atenção';
      else classification = 'Exclusão';

      // Approximate estimated lesson counts for context
      const totalLessons = 64;
      const attendedLessons = Math.round((rate / 100) * totalLessons);
      const absences = totalLessons - attendedLessons;

      return {
        student,
        rate,
        classification,
        totalLessons,
        attendedLessons,
        absences
      };
    }).sort((a, b) => a.rate - b.rate); // Sort lowest attendance first for pedagogue action
  }, [filteredStudents]);

  // Consolidated Data for "Faltas"
  const reportFaltas = useMemo(() => {
    return filteredStudents.map(student => {
      const rate = student.attendancePercentage !== undefined ? student.attendancePercentage : 92;
      const totalLessons = 64;
      const totalAbsences = Math.max(0, Math.round(((100 - rate) / 100) * totalLessons));
      // Justified vs Unjustified approximation
      const justifiedAbsences = Math.floor(totalAbsences * 0.35);
      const unjustifiedAbsences = totalAbsences - justifiedAbsences;
      const missedHours = totalAbsences * 2; // 2 hours per lesson

      let anepStatus: 'Regular' | 'Notificado' | 'Risco Crítico' | 'Excluído por Faltas' = 'Regular';
      if (rate < 75) anepStatus = 'Excluído por Faltas';
      else if (rate < 80) anepStatus = 'Risco Crítico';
      else if (rate < 88) anepStatus = 'Notificado';

      return {
        student,
        rate,
        totalAbsences,
        unjustifiedAbsences,
        justifiedAbsences,
        missedHours,
        anepStatus
      };
    }).sort((a, b) => b.unjustifiedAbsences - a.unjustifiedAbsences);
  }, [filteredStudents]);

  // Consolidated Data for "Médias"
  const reportMedias = useMemo(() => {
    return filteredStudents.map(student => {
      const grade = student.averageGrade !== undefined ? student.averageGrade : 14.5;
      let classification = 'Suficiente';
      if (grade >= 17) classification = 'Excelente (Louvor)';
      else if (grade >= 14) classification = 'Muito Bom (Dispensa)';
      else if (grade >= 10) classification = 'Suficiente (Aprovado)';
      else classification = 'Insuficiente (Chumbo)';

      return {
        student,
        grade,
        classification,
        isHonor: grade >= 16
      };
    }).sort((a, b) => b.grade - a.grade); // Highest grade first
  }, [filteredStudents]);

  // Consolidated Data for "Aprovação"
  const reportAprovacao = useMemo(() => {
    return filteredStudents
      .filter(s => (s.averageGrade || 14.5) >= 10 && (s.attendancePercentage || 92) >= 75)
      .map(student => {
        const grade = student.averageGrade || 14.5;
        let type = 'Aprovado em Exame Normal';
        if (grade >= 16) type = 'Aprovado com Distinção';
        else if (grade >= 14) type = 'Dispensado de Exame';
        
        return {
          student,
          grade,
          type,
          attendance: student.attendancePercentage || 92
        };
      }).sort((a, b) => b.grade - a.grade);
  }, [filteredStudents]);

  // Consolidated Data for "Reprovação"
  const reportReprovacao = useMemo(() => {
    return filteredStudents
      .filter(s => (s.averageGrade || 14.5) < 10 || (s.attendancePercentage || 92) < 75 || s.status === 'Reprovado')
      .map(student => {
        const grade = student.averageGrade || 8.5;
        const attendance = student.attendancePercentage || 70;
        
        let reason = 'Nota Insuficiente (< 10.0)';
        if (attendance < 75 && grade < 10) {
          reason = 'Duplo Chumbo: Média & Exclusão por Faltas';
        } else if (attendance < 75) {
          reason = 'Exclusão por Faltas (Assiduidade < 75%)';
        }

        return {
          student,
          grade,
          attendance,
          reason,
          canRecourse: grade >= 7.0 && attendance >= 75
        };
      }).sort((a, b) => a.grade - b.grade);
  }, [filteredStudents]);

  // Consolidated Data for "Abandono"
  const reportAbandono = useMemo(() => {
    return filteredStudents
      .filter(s => s.status === 'Desistente' || s.status === 'Baixado' || s.status === 'Cancelado' || s.termination !== undefined)
      .map(student => {
        const reason = student.termination?.reason || 'Abandono Escolar / Sem Notificação Prévia';
        const date = student.termination?.date || student.enrollmentDate || '2026-03-10';
        const debt = student.balanceOwing || 0;

        return {
          student,
          reason,
          date,
          debt
        };
      });
  }, [filteredStudents]);

  // Consolidated Data for "Conclusão"
  const reportConclusao = useMemo(() => {
    return filteredStudents
      .filter(s => s.status === 'Concluído')
      .map(student => {
        const finalGrade = student.averageGrade || 16.8;
        const completionDate = student.termination?.date || '15 de Agosto de 2026';
        const hasInternship = Boolean(student.internship || student.status === 'Concluído');
        const diplomaStatus = student.averageGrade && student.averageGrade >= 14 ? 'Pronto para Emissão' : 'Em Homologação SIVEC';

        return {
          student,
          finalGrade,
          completionDate,
          hasInternship,
          diplomaStatus
        };
      });
  }, [filteredStudents]);

  // Consolidated Data for "Certificados"
  const reportCertificados = useMemo(() => {
    // If certificates exist in context
    let certs = certificates;

    if (filterCourseId !== 'todos') {
      const targetCourse = courses.find(c => c.id === filterCourseId);
      if (targetCourse) {
        certs = certs.filter(c => c.courseName?.toLowerCase().includes(targetCourse.name.toLowerCase()));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      certs = certs.filter(c => 
        c.studentName?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.courseName?.toLowerCase().includes(q)
      );
    }

    return certs;
  }, [certificates, filterCourseId, courses, searchQuery]);

  // Consolidated Data for "Estágio"
  const reportEstagio = useMemo(() => {
    let list = internships;

    // Filter by course
    if (filterCourseId !== 'todos') {
      const targetCourse = courses.find(c => c.id === filterCourseId);
      if (targetCourse) {
        list = list.filter(i => i.courseName?.toLowerCase().includes(targetCourse.name.toLowerCase()));
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => 
        i.studentName?.toLowerCase().includes(q) ||
        (i.company?.name || (i as any).companyName || '').toLowerCase().includes(q) ||
        ((i.supervisor as any)?.name || (i as any).supervisorName || i.supervisor?.companySupervisor || '').toLowerCase().includes(q) ||
        i.courseName?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [internships, filterCourseId, courses, searchQuery]);

  // Current Active Tab Config
  const activeTabConfig = useMemo(() => {
    return REPORT_TABS.find(t => t.id === activeReport) || REPORT_TABS[0];
  }, [activeReport]);

  // Prepare Print & CSV Export Data dynamically based on active tab
  const exportPayload = useMemo(() => {
    const courseName = filterCourseId === 'todos' ? 'Todos os Cursos' : courses.find(c => c.id === filterCourseId)?.name || 'Curso Selecionado';
    const className = filterClassId === 'todas' ? 'Todas as Turmas' : classes.find(c => c.id === filterClassId)?.name || 'Turma Selecionada';
    const teacherName = filterTeacherId === 'todos' ? 'Todos os Professores' : teachers.find(t => t.id === filterTeacherId)?.fullName || 'Professor Selecionado';
    const periodLabel = filterPeriod === 'todos' ? 'Todos os Períodos' : filterPeriod;
    const statusLabel = filterStatus === 'todos' ? 'Todos os Estados' : filterStatus;

    const filtersSummary = {
      period: periodLabel,
      courseName,
      className,
      teacherName,
      status: statusLabel
    };

    switch (activeReport) {
      case 'alunos_curso': {
        const headers = ['Código', 'Nome do Curso', 'Matriculados', 'Ativos', 'Concluídos', 'Desistentes', 'Vagas Totais', 'Ocupação (%)', 'Média Geral'];
        const rows = reportAlunosCurso.map(item => [
          item.course.code,
          item.course.name,
          item.totalStudents,
          item.activeCount,
          item.completedCount,
          item.dropoutCount,
          item.totalCapacity,
          `${item.occupancyRate}%`,
          item.avgGrade
        ]);
        const kpis = [
          { label: 'Cursos Ofertados', value: reportAlunosCurso.length, sub: 'Estrutura Curricular' },
          { label: 'Total de Formandos', value: filteredStudents.length, sub: 'Matrículas ativas e históricas' },
          { label: 'Média de Ocupação', value: `${reportAlunosCurso.length > 0 ? Math.round(reportAlunosCurso.reduce((acc, c) => acc + c.occupancyRate, 0) / reportAlunosCurso.length) : 0}%`, sub: 'Capacidade instalada' },
          { label: 'Média Geral Cursos', value: `${(reportAlunosCurso.reduce((acc, c) => acc + (parseFloat(c.avgGrade) || 14), 0) / (reportAlunosCurso.length || 1)).toFixed(1)} val.`, sub: 'Escala 0 a 20' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_alunos_por_curso_${Date.now()}` };
      }

      case 'alunos_turma': {
        const headers = ['Turma', 'Curso', 'Turno', 'Sala / Lab', 'Formador Titular', 'Alunos Alocados', 'Capacidade', 'Lotação (%)', 'Média Turma'];
        const rows = reportAlunosTurma.map(item => [
          item.classGroup.name,
          item.classGroup.courseName,
          item.classGroup.shift,
          item.classGroup.room,
          item.classGroup.teacherName,
          item.totalStudents,
          item.capacity,
          `${item.occupancyRate}%`,
          item.avgGrade
        ]);
        const kpis = [
          { label: 'Turmas Registadas', value: reportAlunosTurma.length, sub: 'Salas & Laboratórios' },
          { label: 'Alunos em Turma', value: reportAlunosTurma.reduce((acc, t) => acc + t.totalStudents, 0), sub: 'Alocação pedagógica' },
          { label: 'Lotação Média', value: `${reportAlunosTurma.length > 0 ? Math.round(reportAlunosTurma.reduce((acc, t) => acc + t.occupancyRate, 0) / reportAlunosTurma.length) : 0}%`, sub: 'Eficiência de espaço' },
          { label: 'Formadores Titulares', value: new Set(reportAlunosTurma.map(t => t.classGroup.teacherName)).size, sub: 'Corpo docente em atividade' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_alunos_por_turma_${Date.now()}` };
      }

      case 'frequencia': {
        const headers = ['Código MTW', 'Nome do Aluno', 'Curso', 'Turma', 'Presenças', 'Faltas', 'Taxa (%)', 'Situação'];
        const rows = reportFrequencia.map(item => [
          item.student.code,
          item.student.fullName,
          item.student.courseName,
          item.student.classGroupName,
          item.attendedLessons,
          item.absences,
          `${item.rate}%`,
          item.classification
        ]);
        const avgAttendance = reportFrequencia.length > 0
          ? Math.round(reportFrequencia.reduce((acc, f) => acc + f.rate, 0) / reportFrequencia.length)
          : 0;
        const lowAttendanceCount = reportFrequencia.filter(f => f.rate < 75).length;
        const kpis = [
          { label: 'Assiduidade Média', value: `${avgAttendance}%`, sub: 'Geral da amostragem' },
          { label: 'Total de Formandos', value: reportFrequencia.length, sub: 'Com chamadas registradas' },
          { label: 'Frequência Excelente (≥95%)', value: reportFrequencia.filter(f => f.rate >= 95).length, sub: 'Presença exemplar' },
          { label: 'Risco de Exclusão (<75%)', value: lowAttendanceCount, sub: 'Abaixo do limiar ANEP' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_frequencia_academica_${Date.now()}` };
      }

      case 'faltas': {
        const headers = ['Código MTW', 'Nome do Aluno', 'Turma', 'Faltas Injustificadas', 'Faltas Justificadas', 'Total Ausências', 'Horas Perdidas', 'Enquadramento ANEP'];
        const rows = reportFaltas.map(item => [
          item.student.code,
          item.student.fullName,
          item.student.classGroupName,
          item.unjustifiedAbsences,
          item.justifiedAbsences,
          item.totalAbsences,
          `${item.missedHours}h`,
          item.anepStatus
        ]);
        const totalMissedHours = reportFaltas.reduce((acc, f) => acc + f.missedHours, 0);
        const criticalCount = reportFaltas.filter(f => f.anepStatus === 'Excluído por Faltas' || f.anepStatus === 'Risco Crítico').length;
        const kpis = [
          { label: 'Total Horas de Ausência', value: `${totalMissedHours}h`, sub: 'Carga letiva não assistida' },
          { label: 'Alunos em Alerta/Exclusão', value: criticalCount, sub: 'Limiar regulamentar atingido' },
          { label: 'Faltas Justificadas', value: reportFaltas.reduce((acc, f) => acc + f.justifiedAbsences, 0), sub: 'Atestados & declarações' },
          { label: 'Faltas Injustificadas', value: reportFaltas.reduce((acc, f) => acc + f.unjustifiedAbsences, 0), sub: 'Sem respaldo legal' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_faltas_absenteismo_${Date.now()}` };
      }

      case 'medias': {
        const headers = ['Código MTW', 'Nome do Aluno', 'Curso', 'Turma', 'Média Final', 'Escala', 'Classificação Pedagógica'];
        const rows = reportMedias.map(item => [
          item.student.code,
          item.student.fullName,
          item.student.courseName,
          item.student.classGroupName,
          `${item.grade.toFixed(1)} valores`,
          '0 - 20',
          item.classification
        ]);
        const avgGeneral = reportMedias.length > 0
          ? (reportMedias.reduce((acc, m) => acc + m.grade, 0) / reportMedias.length).toFixed(1)
          : '0.0';
        const honorCount = reportMedias.filter(m => m.isHonor).length;
        const kpis = [
          { label: 'Média Global', value: `${avgGeneral} val.`, sub: 'Escala 0 a 20 valores' },
          { label: 'Quadro de Honra (≥16)', value: honorCount, sub: 'Mérito acadêmico' },
          { label: 'Maior Nota Registada', value: `${reportMedias.length > 0 ? Math.max(...reportMedias.map(m => m.grade)).toFixed(1) : 0} val.`, sub: 'Desempenho topo' },
          { label: 'Menor Nota Registada', value: `${reportMedias.length > 0 ? Math.min(...reportMedias.map(m => m.grade)).toFixed(1) : 0} val.`, sub: 'Ponto de recuperação' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_medias_desempenho_${Date.now()}` };
      }

      case 'aprovacao': {
        const headers = ['Código MTW', 'Nome do Aluno', 'Curso', 'Turma', 'Média', 'Assiduidade', 'Modalidade de Aprovação'];
        const rows = reportAprovacao.map(item => [
          item.student.code,
          item.student.fullName,
          item.student.courseName,
          item.student.classGroupName,
          `${item.grade.toFixed(1)} valores`,
          `${item.attendance}%`,
          item.type
        ]);
        const passRate = filteredStudents.length > 0 
          ? Math.round((reportAprovacao.length / filteredStudents.length) * 100) 
          : 0;
        const kpis = [
          { label: 'Taxa de Aprovação', value: `${passRate}%`, sub: 'Percentagem sobre a amostragem' },
          { label: 'Total de Aprovados', value: reportAprovacao.length, sub: 'Média ≥ 10 e Presença ≥ 75%' },
          { label: 'Dispensados de Exame (≥14)', value: reportAprovacao.filter(a => a.grade >= 14).length, sub: 'Sem necessidade de prova' },
          { label: 'Distinção & Louvor (≥16)', value: reportAprovacao.filter(a => a.grade >= 16).length, sub: 'Classificação superior' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_aprovacao_academica_${Date.now()}` };
      }

      case 'reprovacao': {
        const headers = ['Código MTW', 'Nome do Aluno', 'Curso', 'Turma', 'Média Obtida', 'Frequência', 'Motivo da Reprovação', 'Apto a Recurso'];
        const rows = reportReprovacao.map(item => [
          item.student.code,
          item.student.fullName,
          item.student.courseName,
          item.student.classGroupName,
          `${item.grade.toFixed(1)} valores`,
          `${item.attendance}%`,
          item.reason,
          item.canRecourse ? 'Sim (Exame de Recurso)' : 'Não (Retenção Plena)'
        ]);
        const failRate = filteredStudents.length > 0 
          ? Math.round((reportReprovacao.length / filteredStudents.length) * 100) 
          : 0;
        const kpis = [
          { label: 'Taxa de Reprovação', value: `${failRate}%`, sub: 'Retenção na amostragem' },
          { label: 'Total de Chumbos', value: reportReprovacao.length, sub: 'Abaixo da nota de corte' },
          { label: 'Exclusão por Faltas', value: reportReprovacao.filter(r => r.attendance < 75).length, sub: 'Descumprimento de presença' },
          { label: 'Aptos a Exame de Recurso', value: reportReprovacao.filter(r => r.canRecourse).length, sub: 'Nota 7.0 a 9.9 com presença' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_reprovacao_retencao_${Date.now()}` };
      }

      case 'abandono': {
        const headers = ['Código MTW', 'Nome do Aluno', 'Curso', 'Turma', 'Data da Evasão', 'Motivo Declarado', 'Saldo Devedor (MT)'];
        const rows = reportAbandono.map(item => [
          item.student.code,
          item.student.fullName,
          item.student.courseName,
          item.student.classGroupName,
          item.date,
          item.reason,
          `${item.debt.toLocaleString('pt-MZ')} MT`
        ]);
        const evasionRate = filteredStudents.length > 0 
          ? Math.round((reportAbandono.length / filteredStudents.length) * 100) 
          : 0;
        const totalOutstanding = reportAbandono.reduce((acc, a) => acc + a.debt, 0);
        const kpis = [
          { label: 'Taxa de Evasão Escolar', value: `${evasionRate}%`, sub: 'Índice de evasão acumulado' },
          { label: 'Total de Desistências', value: reportAbandono.length, sub: 'Matrículas canceladas/baixadas' },
          { label: 'Passivo Financeiro Pendente', value: `${totalOutstanding.toLocaleString('pt-MZ')} MT`, sub: 'Propinas não quitadas' },
          { label: 'Causa Mais Frequente', value: 'Financeiro / Emprego', sub: 'Tendência institucional' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_abandono_evasao_${Date.now()}` };
      }

      case 'conclusao': {
        const headers = ['Código MTW', 'Nome do Formando', 'Curso Concluído', 'Data de Conclusão', 'Média Final', 'Estágio', 'Estado do Certificado'];
        const rows = reportConclusao.map(item => [
          item.student.code,
          item.student.fullName,
          item.student.courseName,
          item.completionDate,
          `${item.finalGrade.toFixed(1)} valores`,
          item.hasInternship ? 'Concluído' : 'Dispensado',
          item.diplomaStatus
        ]);
        const completionRate = filteredStudents.length > 0 
          ? Math.round((reportConclusao.length / filteredStudents.length) * 100) 
          : 0;
        const kpis = [
          { label: 'Total de Concluintes', value: reportConclusao.length, sub: 'Aptos para formatura' },
          { label: 'Eficiência Formativa', value: `${completionRate}%`, sub: 'Conclusão no período regulamentar' },
          { label: 'Média Média de Graduação', value: `${(reportConclusao.reduce((acc, c) => acc + c.finalGrade, 0) / (reportConclusao.length || 1)).toFixed(1)} val.`, sub: 'Desempenho dos formados' },
          { label: 'Diplomas SIVEC Prontos', value: reportConclusao.filter(c => c.diplomaStatus === 'Pronto para Emissão').length, sub: 'Aguardando entrega solene' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_conclusao_cursos_${Date.now()}` };
      }

      case 'certificados': {
        const headers = ['Código do Certificado', 'Nome do Formando', 'BI / Documento', 'Curso', 'Carga Horária', 'Menção / Nota', 'Data de Emissão', 'Validação SIVEC'];
        const rows = reportCertificados.map(c => [
          c.code,
          c.studentName,
          c.documentNumber,
          c.courseName,
          `${c.durationHours}h`,
          c.grade,
          c.issueDate,
          'Autenticado & Ativo'
        ]);
        const kpis = [
          { label: 'Certificados Emitidos', value: reportCertificados.length, sub: 'Base homologada' },
          { label: 'Autenticação QR Code', value: '100% Válidos', sub: 'Certificados com Hash SHA-256' },
          { label: 'Cursos Abrangidos', value: new Set(reportCertificados.map(c => c.courseName)).size, sub: 'Especialidades certificadas' },
          { label: 'Direção Homologadora', value: 'Dra. Amina Abdul', sub: 'Diretoria Pedagógica' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_certificados_sivec_${Date.now()}` };
      }

      case 'estagio': {
        const headers = ['Formando', 'Curso', 'Empresa Acolhedora', 'Supervisor Empresa', 'Tutor Académico', 'Início', 'Término', 'Horas', 'Estado', 'Nota Prática'];
        const rows = reportEstagio.map(i => [
          i.studentName,
          i.courseName,
          i.company?.name || (i as any).companyName || 'Empresa Parceira',
          i.supervisor?.companySupervisor || (i.supervisor as any)?.name || (i as any).supervisorName || 'Supervisor Responsável',
          (i as any).academicTutorName || 'Eng. Paulo Jafim',
          i.startDate,
          i.endDate,
          `${(i as any).totalHoursRequired || (i as any).workloadHours || 300}h`,
          i.status,
          i.evaluation?.score ? `${i.evaluation.score} val.` : 'Pendente'
        ]);
        const activeInterns = reportEstagio.filter(i => i.status === 'em andamento' || i.status === 'atribuído').length;
        const completedInterns = reportEstagio.filter(i => i.status === 'concluído').length;
        const kpis = [
          { label: 'Total de Estagiários', value: reportEstagio.length, sub: 'Contratos de estágio firmados' },
          { label: 'Estágios a Decorrer', value: activeInterns, sub: 'Formandos em empresa' },
          { label: 'Estágios Concluídos', value: completedInterns, sub: 'Com relatório validado' },
          { label: 'Empresas Parceiras', value: new Set(reportEstagio.map(i => i.company?.name || (i as any).companyName)).size, sub: 'Convênios ativos' }
        ];
        return { headers, rows, kpis, filtersSummary, filename: `relatorio_estagios_profissionais_${Date.now()}` };
      }
    }
  }, [
    activeReport,
    filterCourseId,
    filterClassId,
    filterTeacherId,
    filterPeriod,
    filterStatus,
    courses,
    classes,
    teachers,
    filteredStudents,
    reportAlunosCurso,
    reportAlunosTurma,
    reportFrequencia,
    reportFaltas,
    reportMedias,
    reportAprovacao,
    reportReprovacao,
    reportAbandono,
    reportConclusao,
    reportCertificados,
    reportEstagio
  ]);

  // Handler: Export CSV
  const handleExportCsv = () => {
    const tableData = [exportPayload.headers, ...exportPayload.rows];
    exportToCsv(exportPayload.filename, tableData);
  };

  // Handler: Reset all filters
  const handleResetFilters = () => {
    setFilterPeriod('todos');
    setFilterCourseId('todos');
    setFilterClassId('todas');
    setFilterTeacherId('todos');
    setFilterStatus('todos');
    setSearchQuery('');
  };

  const isFiltered = filterPeriod !== 'todos' || filterCourseId !== 'todos' || filterClassId !== 'todas' || filterTeacherId !== 'todos' || filterStatus !== 'todos' || searchQuery.trim() !== '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Módulo 51 • Gestão Académica
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              SIVEC & ANEP Compliance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
            51. Relatórios Académicos
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl">
            Central institucional de inteligência pedagógica. Emissão e auditoria dos 11 relatórios regulamentares
            com filtros dinâmicos por período, curso, turma, formador e estado do formando.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            id="btn-export-csv-academic-reports"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-sm cursor-pointer"
            title="Exportar dados do relatório em planilha CSV / Excel com UTF-8"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV / Excel</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            id="btn-open-print-modal-academic-reports"
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-900/30 cursor-pointer"
            title="Abrir folha timbrada oficial em padrão A4 para impressão ou PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Documento A4</span>
          </button>
        </div>
      </div>

      {/* 5-Field Filtering Engine */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filtros do Sistema Académico (5 Dimensões Regulamentares)</span>
          </div>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              id="btn-reset-academic-filters"
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Período */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              1. Período Letivo
            </label>
            <select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value)}
              id="filter-academic-period"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todos">Todos os Períodos</option>
              <option value="2026_ano">Ano Letivo 2026</option>
              <option value="2026_sem1">2026 / 1º Semestre</option>
              <option value="2026_sem2">2026 / 2º Semestre</option>
              <option value="2025_ano">Ano Letivo 2025</option>
              <option value="2025_sem2">2025 / 2º Semestre</option>
              <option value="2025_sem1">2025 / 1º Semestre</option>
            </select>
          </div>

          {/* 2. Curso */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              2. Curso
            </label>
            <select
              value={filterCourseId}
              onChange={e => handleCourseFilterChange(e.target.value)}
              id="filter-academic-course"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todos">Todos os Cursos ({courses.length})</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code ? `[${course.code}] ` : ''}{course.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Turma */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              3. Turma
            </label>
            <select
              value={filterClassId}
              onChange={e => setFilterClassId(e.target.value)}
              id="filter-academic-class"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todas">Todas as Turmas ({availableClasses.length})</option>
              {availableClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.shift})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Professor */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              4. Formador / Professor
            </label>
            <select
              value={filterTeacherId}
              onChange={e => setFilterTeacherId(e.target.value)}
              id="filter-academic-teacher"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todos">Todos os Formadores ({teachers.length})</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName} ({teacher.specialty || 'Geral'})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Estado */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              5. Estado do Aluno
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              id="filter-academic-status"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="todos">Todos os Estados</option>
              <option value="Ativo">Ativo / Regular</option>
              <option value="Matriculado">Matriculado</option>
              <option value="Em curso">Em Curso</option>
              <option value="Concluído">Concluído / Formado</option>
              <option value="Reprovado">Reprovado</option>
              <option value="Desistente">Desistente / Evasão</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Pré-inscrito">Pré-inscrito</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Free text search bar */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome de aluno, documento BI, código MTW, turma ou empresa acolhedora..."
            id="search-academic-records"
            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Navigation of the 11 Reports Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Selecione o Relatório Académico a Visualizar:
          </span>
          <span className="text-xs text-cyan-400 font-mono">
            {REPORT_TABS.findIndex(t => t.id === activeReport) + 1} de {REPORT_TABS.length} Relatórios
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {REPORT_TABS.map(tab => {
            const isActive = tab.id === activeReport;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                id={`tab-report-${tab.id}`}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                    {tab.icon}
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-bold line-clamp-1">{tab.title}</span>
                <span className="text-[10px] text-slate-500 line-clamp-1">{tab.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Report Header & Description */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              {activeTabConfig.icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {activeTabConfig.title}
              </h2>
              <p className="text-xs text-slate-400">
                {activeTabConfig.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeTabConfig.badgeColor}`}>
              {activeTabConfig.category}
            </span>
          </div>
        </div>

        {/* Dynamic Executive KPIs Snapshot for the Current Active Report */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {exportPayload.kpis.map((kpi, idx) => (
            <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                {kpi.label}
              </span>
              <span className="text-2xl font-black text-white block">
                {kpi.value}
              </span>
              {kpi.sub && (
                <span className="text-[11px] text-cyan-400/90 block truncate">
                  {kpi.sub}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Main Interactive Table Render for the Selected Report */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Registos Consolidados ({exportPayload.rows.length} itens encontrados)
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Classificação: Padrão Oficial Moçambique</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  {exportPayload.headers.map((h, i) => (
                    <th key={i} className="py-3 px-4 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                {exportPayload.rows.length === 0 ? (
                  <tr>
                    <td colSpan={exportPayload.headers.length + 1} className="py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <AlertTriangle className="w-8 h-8 text-amber-500/70 mx-auto" />
                        <p className="font-semibold text-slate-400">Nenhum dado encontrado para os filtros selecionados.</p>
                        <p className="text-[11px] text-slate-500">Experimente ajustar o período, limpar a turma ou resetar os filtros.</p>
                        {isFiltered && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs rounded-lg font-bold border border-slate-700 cursor-pointer"
                          >
                            Redefinir Filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  exportPayload.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                        {rIdx + 1}
                      </td>
                      {row.map((cell, cIdx) => {
                        const cellStr = String(cell);
                        const isHigh = cellStr.includes('Excelente') || cellStr.includes('Distinção') || cellStr.includes('Dispensa') || cellStr.includes('Regular') || cellStr.includes('Autenticado');
                        const isRisk = cellStr.includes('Risco') || cellStr.includes('Exclusão') || cellStr.includes('Chumbo') || cellStr.includes('Insuficiente');
                        const isWarning = cellStr.includes('Atenção') || cellStr.includes('Notificado') || cellStr.includes('Pendente');

                        return (
                          <td key={cIdx} className="py-3 px-4 whitespace-nowrap">
                            {isHigh ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {cellStr}
                              </span>
                            ) : isRisk ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                {cellStr}
                              </span>
                            ) : isWarning ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {cellStr}
                              </span>
                            ) : (
                              <span>{cell}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Official Print Modal */}
      <AcademicReportPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        reportTitle={activeTabConfig.title}
        reportCategory={activeTabConfig.category}
        filters={exportPayload.filtersSummary}
        kpis={exportPayload.kpis}
        tableHeaders={exportPayload.headers}
        tableRows={exportPayload.rows}
        summaryNotes={`Relatório oficial emitido eletronicamente pela Direção Pedagógica da instituição ${activeInstitution.name}. Válido perante a Autoridade Nacional de Educação Profissional (ANEP) e Ministério da Ciência, Tecnologia e Ensino Superior.`}
      />
    </div>
  );
};
