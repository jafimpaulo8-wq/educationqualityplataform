import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  ShieldCheck, 
  User, 
  Award, 
  BookOpen, 
  Check, 
  Edit3, 
  HelpCircle,
  Eye,
  Sliders,
  Sparkles,
  ChevronRight,
  School,
  Lock,
  Stamp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PautaScopeType, PautaSituacao, StudentCalculatedGrade } from '../../types';

export const PautasManagerView: React.FC = () => {
  const { 
    classes, 
    courses, 
    students, 
    activeInstitution, 
    activeBranch,
    evaluations, 
    activeRole,
    activeTeacher,
    pautaHomologations,
    homologatePauta,
    overrideStudentPautaSituation,
    calculateStudentFinalGrade,
    addNotification
  } = useApp();

  // 18. PAUTAS - Tipos de Pauta Requisitados
  const [selectedScope, setSelectedScope] = useState<PautaScopeType>('por_turma');

  // Filtros
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('todas');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('todos');
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'TODAS' | PautaSituacao>('TODAS');

  // Modal de Retificação / Aprovação pela Direção
  const [overrideModal, setOverrideModal] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
    currentSituation: PautaSituacao;
    targetSituation: PautaSituacao;
    justification: string;
  } | null>(null);

  // Modal de Visualização Oficial / Impressão
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Permissões conforme requisitos
  // "O aluno apenas consulta. Não pode alterar notas."
  const isStudent = activeRole === 'aluno' || (activeRole as string) === 'estudante' || activeRole === 'ALUNO';
  // "Professor pode lançar notas conforme autorização."
  const isTeacher = activeRole === 'professor' || activeRole === 'formador' || activeRole === 'PROFESSOR' || activeRole === 'FORMADOR';
  // "Diretor/administrador pode aprovar/reprovar conforme permissão."
  const isDirectorOrAdmin = ['director', 'superadmin', 'admin', 'diretor', 'coordenador', 'DIRETOR', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO'].includes(activeRole as string);

  // Turmas filtradas pelo curso selecionado (se aplicável)
  const availableClasses = useMemo(() => {
    if (!selectedCourseId) return classes;
    return classes.filter(c => c.courseId === selectedCourseId);
  }, [classes, selectedCourseId]);

  // Turma atual
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const currentCourse = courses.find(c => c.id === (currentClass?.courseId || selectedCourseId)) || courses[0];

  // Avaliações disponíveis para a turma
  const classEvals = useMemo(() => {
    return evaluations.filter(e => {
      if (selectedScope === 'por_curso') {
        const classObj = classes.find(c => c.id === e.classGroupId);
        return classObj?.courseId === selectedCourseId;
      }
      return e.classGroupId === selectedClassId;
    });
  }, [evaluations, selectedScope, selectedClassId, selectedCourseId, classes]);

  // Disciplinas únicas presentes
  const availableDisciplines = useMemo(() => {
    const list = Array.from(new Set(classEvals.map(e => e.discipline).filter(Boolean)));
    if (list.length === 0 && currentCourse?.modules) {
      return currentCourse.modules.map(m => m.name);
    }
    return list;
  }, [classEvals, currentCourse]);

  // Períodos únicos presentes
  const availablePeriods = useMemo(() => {
    return Array.from(new Set(classEvals.map(e => e.period).filter(Boolean)));
  }, [classEvals]);

  // Chave identificadora única da pauta
  const pautaKey = useMemo(() => {
    const scopePart = selectedScope;
    const classPart = selectedScope === 'por_curso' ? `curso-${selectedCourseId}` : `turma-${selectedClassId}`;
    const discPart = selectedDiscipline !== 'todas' ? selectedDiscipline : 'todas-disc';
    const periodPart = selectedPeriod !== 'todos' ? selectedPeriod : 'todos-periodos';
    return `${classPart}_${discPart}_${periodPart}_${scopePart}`;
  }, [selectedScope, selectedCourseId, selectedClassId, selectedDiscipline, selectedPeriod]);

  // Registro de homologação da pauta atual
  const homologationRecord = pautaHomologations.find(h => h.pautaKey === pautaKey);
  const isHomologated = homologationRecord?.status === 'HOMOLOGADA';

  // Alunos no escopo da pauta
  const scopedStudents = useMemo(() => {
    let list = students;
    if (selectedScope === 'por_curso') {
      const courseClassIds = classes.filter(c => c.courseId === selectedCourseId).map(c => c.id);
      list = list.filter(s => courseClassIds.includes(s.classGroupId || ''));
    } else {
      list = list.filter(s => s.classGroupId === selectedClassId);
    }
    return list;
  }, [students, selectedScope, selectedClassId, selectedCourseId, classes]);

  // Lista de Avaliações específicas no caso de "pauta por avaliação"
  const selectedEvalObj = evaluations.find(e => e.id === selectedEvaluationId) || classEvals[0];

  // Cálculo das Notas, Médias e Situação
  // Situações obrigatórias: APROVADO, REPROVADO, EM CURSO, PENDENTE
  const pautaRows = useMemo(() => {
    return scopedStudents.map(student => {
      // Verifica se houve retificação formal da Direção
      const overridden = homologationRecord?.overriddenStudents?.[student.id];

      if (selectedScope === 'por_avaliacao') {
        const evalScoreItem = selectedEvalObj?.scores?.[student.id];
        const score = evalScoreItem?.score;
        const maxScore = selectedEvalObj?.maxScore || 20;
        const hasScore = score !== undefined;
        const normalized = hasScore ? Math.round(((score / maxScore) * 20) * 10) / 10 : null;

        let situacao: PautaSituacao = 'PENDENTE';
        if (hasScore && normalized !== null) {
          situacao = normalized >= 10 ? 'APROVADO' : 'REPROVADO';
        }

        if (overridden) {
          situacao = overridden.newSituation;
        }

        return {
          student,
          discipline: selectedEvalObj?.discipline || selectedDiscipline || 'Geral',
          evaluationScores: [{
            name: selectedEvalObj?.name || 'Avaliação Pontual',
            score: score ?? null,
            maxScore
          }],
          average: normalized ?? (student.averageGrade || 0),
          situacao,
          overridden
        };
      }

      // Para trimestral, semestral, final, por turma, por curso
      const calculated = calculateStudentFinalGrade(
        student.id,
        student.classGroupId || selectedClassId,
        selectedDiscipline !== 'todas' ? selectedDiscipline : undefined,
        selectedPeriod !== 'todos' ? selectedPeriod : undefined
      );

      const average = calculated ? calculated.finalScore : (student.averageGrade || 0);

      // Determinação da situação oficial conforme padrão nacional de Moçambique:
      // APROVADO (>= 10.0), REPROVADO (< 10.0), EM CURSO (ano letivo em andamento com avaliações pendentes), PENDENTE (sem notas)
      let situacao: PautaSituacao = 'EM CURSO';
      const assessmentsCount = calculated?.assessmentsList?.length || 0;

      if (assessmentsCount === 0 && (!student.assessments || student.assessments.length === 0)) {
        situacao = 'PENDENTE';
      } else if (selectedScope === 'final') {
        situacao = average >= 10 ? 'APROVADO' : 'REPROVADO';
      } else {
        // Trimestral, Semestral, Turma, Curso
        if (average >= 10) {
          situacao = isHomologated ? 'APROVADO' : 'APROVADO';
        } else if (average > 0) {
          situacao = isHomologated ? 'REPROVADO' : 'EM CURSO';
        } else {
          situacao = 'PENDENTE';
        }
      }

      // Aplica decisão homologada pela direção caso exista
      if (overridden) {
        situacao = overridden.newSituation;
      }

      return {
        student,
        discipline: selectedDiscipline !== 'todas' ? selectedDiscipline : (currentCourse?.name || 'Todas as Disciplinas'),
        evaluationScores: calculated?.assessmentsList || [],
        average,
        situacao,
        overridden
      };
    });
  }, [
    scopedStudents, 
    selectedScope, 
    selectedEvalObj, 
    selectedDiscipline, 
    selectedPeriod, 
    selectedClassId, 
    calculateStudentFinalGrade, 
    homologationRecord, 
    isHomologated, 
    currentCourse
  ]);

  // Filtragem local por pesquisa e situação
  const filteredRows = useMemo(() => {
    return pautaRows.filter(row => {
      const matchSearch = 
        row.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.student.documentNumber && row.student.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchStatus = statusFilter === 'TODAS' || row.situacao === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pautaRows, searchTerm, statusFilter]);

  // Estatísticas da Pauta
  const stats = useMemo(() => {
    const total = pautaRows.length;
    const aprovados = pautaRows.filter(r => r.situacao === 'APROVADO').length;
    const reprovados = pautaRows.filter(r => r.situacao === 'REPROVADO').length;
    const emCurso = pautaRows.filter(r => r.situacao === 'EM CURSO').length;
    const pendentes = pautaRows.filter(r => r.situacao === 'PENDENTE').length;
    const taxaAprovacao = total > 0 ? Math.round((aprovados / total) * 100) : 0;
    const mediaGeral = total > 0 ? (pautaRows.reduce((acc, r) => acc + r.average, 0) / total).toFixed(1) : '0.0';

    return { total, aprovados, reprovados, emCurso, pendentes, taxaAprovacao, mediaGeral };
  }, [pautaRows]);

  // Homologação da Pauta (Apenas Diretor / Administrador)
  const handleHomologate = () => {
    if (!isDirectorOrAdmin) {
      addNotification({
        title: 'Acesso Restrito',
        message: 'Apenas a Direção da Instituição tem permissão para homologar pautas.',
        type: 'warning'
      });
      return;
    }

    homologatePauta({
      institutionId: activeInstitution.id,
      branchId: activeBranch?.id,
      pautaKey,
      scope: selectedScope,
      classGroupId: selectedScope !== 'por_curso' ? selectedClassId : undefined,
      classGroupName: currentClass?.name,
      courseId: selectedCourseId,
      courseName: currentCourse?.name,
      discipline: selectedDiscipline,
      period: selectedPeriod,
      status: 'HOMOLOGADA',
      homologatedBy: `${activeInstitution.name} - Direção Pedagógica`,
      homologatedRole: activeRole.toUpperCase(),
      approvalNotes: `Pauta ${selectedScope.replace('_', ' ').toUpperCase()} homologada formalmente com chancela institucional.`
    });
  };

  // Salvar Retificação de Situação (Aprovar / Reprovar pela Direção)
  const handleConfirmOverride = () => {
    if (!overrideModal) return;
    if (!overrideModal.justification.trim()) {
      addNotification({
        title: 'Justificativa Obrigatória',
        message: 'Indique a fundamentação legal ou parecer pedagógico para a retificação.',
        type: 'warning'
      });
      return;
    }

    overrideStudentPautaSituation(
      pautaKey,
      overrideModal.studentId,
      overrideModal.targetSituation,
      overrideModal.justification
    );

    setOverrideModal(null);
  };

  // Badge da Situação
  const renderSituacaoBadge = (situacao: PautaSituacao) => {
    switch (situacao) {
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            APROVADO
          </span>
        );
      case 'REPROVADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            REPROVADO
          </span>
        );
      case 'EM CURSO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            EM CURSO
          </span>
        );
      case 'PENDENTE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            PENDENTE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Identidade Institucional */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wider">
                Módulo 18 • SIGAR Pautas
              </span>
              {isHomologated ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Homologada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Pauta Provisória
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-violet-400" />
              Pautas Acadêmicas Oficiais
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl">
              Emissão, cálculo ponderado e homologação de pautas escolares e técnico-profissionais.
              {isStudent && ' Modo de consulta exclusivo do aluno (somente leitura).'}
              {isTeacher && ' Professor autorizado para lançamento e verificação de notas.'}
              {isDirectorOrAdmin && ' Direção Geral com poderes de homologação e deliberação extraordinária.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Visualizar & Imprimir (PDF)
            </button>

            {isDirectorOrAdmin && (
              <button
                onClick={handleHomologate}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
                  isHomologated 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/30'
                }`}
              >
                <Stamp className="w-4 h-4" />
                {isHomologated ? 'Rehomologar Pauta' : 'Homologar Pauta Oficial'}
              </button>
            )}
          </div>
        </div>

        {/* 18. PAUTAS: Seletor dos 6 Tipos Requisitados */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Tipo de Pauta Oficial (Requisito 18):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'por_avaliacao', label: 'Pauta por Avaliação' },
              { id: 'trimestral', label: 'Pauta Trimestral' },
              { id: 'semestral', label: 'Pauta Semestral' },
              { id: 'final', label: 'Pauta Final' },
              { id: 'por_turma', label: 'Pauta por Turma' },
              { id: 'por_curso', label: 'Pauta por Curso' }
            ].map((scope) => (
              <button
                key={scope.id}
                onClick={() => setSelectedScope(scope.id as PautaScopeType)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-center border ${
                  selectedScope === scope.id
                    ? 'bg-violet-600/30 border-violet-500 text-violet-200 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {scope.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de Filtros Dinâmicos */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Curso */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Curso</label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                const firstCls = classes.find(c => c.courseId === e.target.value);
                if (firstCls) setSelectedClassId(firstCls.id);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Turma (Oculta se pauta for por curso) */}
          {selectedScope !== 'por_curso' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Turma</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Disciplina */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Disciplina</label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="todas">Todas as Disciplinas</option>
              {availableDisciplines.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Condicional para "pauta por avaliação" */}
          {selectedScope === 'por_avaliacao' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Avaliação Específica</label>
              <select
                value={selectedEvaluationId}
                onChange={(e) => setSelectedEvaluationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {classEvals.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.weight}%) - {ev.period}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Período / Trimestre / Semestre</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="todos">Todos os Períodos</option>
                {availablePeriods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Busca e Filtro de Situação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar por aluno, código ou BI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {(['TODAS', 'APROVADO', 'REPROVADO', 'EM CURSO', 'PENDENTE'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Indicadores / Estatísticas Rápidas da Pauta */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">Total de Alunos</span>
          <span className="text-xl font-bold text-white mt-1 block">{stats.total}</span>
        </div>
        <div className="bg-slate-900/70 border border-emerald-900/30 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-emerald-400 block">Aprovados</span>
          <span className="text-xl font-bold text-emerald-300 mt-1 block">{stats.aprovados}</span>
        </div>
        <div className="bg-slate-900/70 border border-rose-900/30 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-rose-400 block">Reprovados</span>
          <span className="text-xl font-bold text-rose-300 mt-1 block">{stats.reprovados}</span>
        </div>
        <div className="bg-slate-900/70 border border-sky-900/30 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-sky-400 block">Em Curso</span>
          <span className="text-xl font-bold text-sky-300 mt-1 block">{stats.emCurso}</span>
        </div>
        <div className="bg-slate-900/70 border border-amber-900/30 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-amber-400 block">Pendentes</span>
          <span className="text-xl font-bold text-amber-300 mt-1 block">{stats.pendentes}</span>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">Média Geral / 20</span>
          <span className="text-xl font-bold text-violet-300 mt-1 block">{stats.mediaGeral}</span>
        </div>
      </div>

      {/* TABELA OFICIAL DA PAUTA: Mostrando Aluno, Disciplina, Notas, Média, Situação */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Pauta Oficial: {selectedScope.replace('_', ' ').toUpperCase()}</span>
              {selectedScope !== 'por_curso' && (
                <span className="text-xs text-slate-400 font-normal">({currentClass?.name})</span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Escala Moçambicana (0 a 20 valores) • Média mínima de aprovação: 10 valores
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Exibindo <span className="font-semibold text-white">{filteredRows.length}</span> de {pautaRows.length} formando(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Aluno (Código & Nome)</th>
                <th className="py-3.5 px-4">Disciplina</th>
                <th className="py-3.5 px-4 text-center">Notas Obtidas</th>
                <th className="py-3.5 px-4 text-center w-28">Média (0-20)</th>
                <th className="py-3.5 px-4 text-center w-36">Situação</th>
                {isDirectorOrAdmin && (
                  <th className="py-3.5 px-4 text-right w-36">Ação da Direção</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    Nenhum formando encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const student = row.student;
                  const isPassing = row.average >= 10;

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        row.overridden ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Numeração */}
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* Aluno */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              <span>{student.fullName}</span>
                              {row.overridden && (
                                <span 
                                  title={`Retificado por ${row.overridden.authorizedBy}: ${row.overridden.justification}`}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                >
                                  Retificado
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {student.code} • BI: {student.documentNumber || 'Não registrado'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Disciplina */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200">{row.discipline}</span>
                        {selectedScope === 'por_curso' && (
                          <span className="block text-[11px] text-slate-400">
                            {student.classGroupName || 'Turma não atribuída'}
                          </span>
                        )}
                      </td>

                      {/* Notas Detalhadas */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {row.evaluationScores.length === 0 ? (
                            <span className="text-slate-500 italic text-[11px]">Sem avaliações</span>
                          ) : (
                            row.evaluationScores.map((ev, i) => (
                              <span
                                key={i}
                                title={ev.name}
                                className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                                  ev.score === null
                                    ? 'bg-slate-800/60 text-slate-500 border-slate-700'
                                    : ev.score >= 10
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                }`}
                              >
                                {ev.score !== null ? ev.score.toFixed(1) : '-'}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Média */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg font-bold font-mono text-xs ${
                          row.average >= 14
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : row.average >= 10
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : row.average > 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {row.average.toFixed(1)}
                        </span>
                      </td>

                      {/* Situação Obrigatória: APROVADO, REPROVADO, EM CURSO, PENDENTE */}
                      <td className="py-3 px-4 text-center">
                        {renderSituacaoBadge(row.situacao)}
                      </td>

                      {/* Ação da Direção: Aprovar / Reprovar conforme permissão */}
                      {isDirectorOrAdmin && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              const nextSit: PautaSituacao = row.situacao === 'APROVADO' ? 'REPROVADO' : 'APROVADO';
                              setOverrideModal({
                                isOpen: true,
                                studentId: student.id,
                                studentName: student.fullName,
                                currentSituation: row.situacao,
                                targetSituation: nextSit,
                                justification: ''
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors"
                          >
                            <Edit3 className="w-3 h-3 text-violet-400" />
                            Deliberar
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Pauta Oficial com Assinaturas Institucionais */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Certificação Digital SIVEC: <strong className="text-slate-300">{pautaKey}</strong>
            </span>
          </div>

          <div className="text-slate-400 flex items-center gap-4">
            <span>Docente da Disciplina: <strong className="text-slate-200">{activeTeacher?.fullName || 'Corpo Docente'}</strong></span>
            <span>•</span>
            <span>Homologação: <strong className="text-slate-200">{isHomologated ? 'Concluída' : 'Pendente de Homologação'}</strong></span>
          </div>
        </div>
      </div>

      {/* MODAL: Deliberação da Direção (Aprovar / Reprovar Conforme Permissão) */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                <Stamp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Deliberação da Direção</h3>
                <p className="text-xs text-slate-400">Alteração extraordinária de situação acadêmica</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Aluno:</span>
                <strong className="text-white">{overrideModal.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Situação Atual:</span>
                <strong className="text-slate-300">{overrideModal.currentSituation}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nova Situação:</span>
                <strong className={overrideModal.targetSituation === 'APROVADO' ? 'text-emerald-400' : 'text-rose-400'}>
                  {overrideModal.targetSituation}
                </strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fundamentação / Parecer do Conselho Pedagógico: <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Indique o despacho, exame especial ou motivo formal da deliberação..."
                value={overrideModal.justification}
                onChange={(e) => setOverrideModal({ ...overrideModal, justification: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOverrideModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmOverride}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-md"
              >
                Gravar Decisão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Visualização da Pauta Timbrada & Impressão em PDF */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-5xl w-full p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-0">
            {/* Cabeçalho Oficial Moçambicano */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600">
                República de Moçambique
              </h4>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Ministério da Educação e Desenvolvimento Humano • ANEP
              </h5>
              <h2 className="text-lg font-bold text-slate-900 mt-2 uppercase">
                {activeInstitution.name}
              </h2>
              <p className="text-xs text-slate-500">
                {activeInstitution.address} • NUIT: {activeInstitution.nuit || '400192841'} • {activeBranch?.name || 'Sede'}
              </p>
              <div className="inline-block mt-3 px-4 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-sm tracking-wide border border-slate-300">
                PAUTA OFICIAL: {selectedScope.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {/* Metadados da Pauta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Curso:</span>
                <strong className="text-slate-900 font-semibold">{currentCourse?.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Turma:</span>
                <strong className="text-slate-900 font-semibold">{currentClass?.name || 'Geral'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Disciplina:</span>
                <strong className="text-slate-900 font-semibold">{selectedDiscipline}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Ano Letivo / Período:</span>
                <strong className="text-slate-900 font-semibold">{currentClass?.academicYear || '2026'} - {selectedPeriod}</strong>
              </div>
            </div>

            {/* Tabela de Impressão A4 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="p-2 border border-slate-300 text-center w-8">#</th>
                    <th className="p-2 border border-slate-300">Código</th>
                    <th className="p-2 border border-slate-300">Nome do Formando</th>
                    <th className="p-2 border border-slate-300 text-center w-24">Média / 20</th>
                    <th className="p-2 border border-slate-300 text-center w-32">Situação Oficial</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <tr key={row.student.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">{i + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono">{row.student.code}</td>
                      <td className="p-2 border border-slate-300 font-semibold">{row.student.fullName}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                        {row.average.toFixed(1)}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold">
                        <span className={
                          row.situacao === 'APROVADO' ? 'text-emerald-700' :
                          row.situacao === 'REPROVADO' ? 'text-rose-700' :
                          row.situacao === 'EM CURSO' ? 'text-sky-700' : 'text-amber-700'
                        }>
                          {row.situacao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Assinaturas e Carimbo Oficial para PDF */}
            <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-1">
                <div className="h-14 flex items-end justify-center">
                  <span className="font-serif italic text-slate-700 text-sm">{activeTeacher?.fullName || 'Assinatura'}</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <strong>O Professor / Formador</strong>
                </div>
              </div>

              <div className="space-y-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] text-slate-500 font-semibold uppercase text-center p-1">
                  Carimbo Oficial
                </div>
                <div className="border-t border-slate-400 pt-1 w-full">
                  <strong>Secretaria Acadêmica</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-14 flex items-end justify-center">
                  <span className="font-serif italic text-slate-700 text-sm">Direção Geral SIGAR</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <strong>O Diretor da Instituição</strong>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Salvar como PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
