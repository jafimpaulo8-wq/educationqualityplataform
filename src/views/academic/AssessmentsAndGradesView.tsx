import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Award, 
  Download,
  Calendar,
  Layers,
  Search,
  Filter,
  Calculator,
  Sliders,
  Sparkles,
  FileCheck,
  Check,
  TrendingUp,
  User,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Clock,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PermissionGate } from '../../components/PermissionGate';
import { FormulaEngineTab } from './assessments/FormulaEngineTab';
import { EvaluationListTab } from './assessments/EvaluationListTab';
import { GradebookTab } from './assessments/GradebookTab';
import { OfficialGradesheetModal } from './assessments/OfficialGradesheetModal';
import { GradeSimulatorModal } from './assessments/GradeSimulatorModal';
import { ASSESSMENT_TYPE_METADATA, CalculationFormula, StudentCalculatedGrade } from '../../types';

export const AssessmentsAndGradesView: React.FC = () => {
  const { 
    classes, 
    students, 
    activeInstitution, 
    addNotification,
    evaluations,
    calculationFormulas,
    calculateStudentFinalGrade,
    activeTeacher
  } = useApp();

  // Navigation Subtabs
  const [activeSubTab, setActiveSubTab] = useState<'pauta' | 'avaliacoes' | 'formulas' | 'lancar_notas'>('pauta');
  const [gradebookEvaluationId, setGradebookEvaluationId] = useState<string | null>(null);

  // Selected Scope Filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('todas');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('todos');
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(() => {
    const def = calculationFormulas.find(f => f.isDefault);
    return def ? def.id : (calculationFormulas[0]?.id || '');
  });

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatedStudent, setSimulatedStudent] = useState<{ id: string; name: string; scores: Record<string, number> } | null>(null);

  // Quick Notification Banner
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Selected entities
  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classGroupId === selectedClassId || s.status === 'Ativo');
  
  const activeFormula: CalculationFormula = calculationFormulas.find(f => f.id === selectedFormulaId) 
    || calculationFormulas.find(f => f.isDefault) 
    || calculationFormulas[0];

  // Distinct disciplines and periods present in evaluations for this class
  const classEvaluations = evaluations.filter(e => e.classGroupId === selectedClassId);
  const availableDisciplines = Array.from(new Set(classEvaluations.map(e => e.discipline).filter(Boolean)));
  const availablePeriods = Array.from(new Set(classEvaluations.map(e => e.period).filter(Boolean)));

  // Automatic Calculation of Student Final Grades based on selected formula
  const calculatedGrades: StudentCalculatedGrade[] = useMemo(() => {
    return classStudents.map(student => {
      const result = calculateStudentFinalGrade(
        student.id,
        selectedClassId,
        selectedDiscipline !== 'todas' ? selectedDiscipline : undefined,
        selectedPeriod !== 'todos' ? selectedPeriod : undefined,
        activeFormula?.id
      );

      if (result) return result;

      // Fallback
      return {
        studentId: student.id,
        studentName: student.fullName,
        studentCode: student.code,
        finalScore: student.averageGrade || 10,
        status: (student.averageGrade || 10) >= (activeFormula?.examExemptionScore || 14) 
          ? 'Dispensado' 
          : (student.averageGrade || 10) >= (activeFormula?.minPassingScore || 10)
          ? 'Aprovado'
          : 'Reprovado',
        componentScores: {},
        assessmentsList: []
      };
    });
  }, [classStudents, selectedClassId, selectedDiscipline, selectedPeriod, activeFormula?.id, evaluations]);

  // General summary statistics
  const totalCount = calculatedGrades.length;
  const passingCount = calculatedGrades.filter(g => g.status === 'Aprovado' || g.status === 'Dispensado').length;
  const exemptCount = calculatedGrades.filter(g => g.status === 'Dispensado').length;
  const recourseCount = calculatedGrades.filter(g => g.status === 'Recurso').length;
  const failingCount = calculatedGrades.filter(g => g.status === 'Reprovado').length;
  const passingRate = totalCount > 0 ? Math.round((passingCount / totalCount) * 100) : 0;
  const averageGrade = totalCount > 0 
    ? (calculatedGrades.reduce((acc, cur) => acc + cur.finalScore, 0) / totalCount).toFixed(1)
    : '0.0';

  const handleOpenGradebookForEval = (evalId: string) => {
    setGradebookEvaluationId(evalId);
    setActiveSubTab('lancar_notas');
  };

  const handleOpenSimulator = (student: StudentCalculatedGrade) => {
    const componentScoresMap: Record<string, number> = {};
    if (activeFormula) {
      activeFormula.components.forEach(c => {
        componentScoresMap[c.type] = student.componentScores[c.type]?.averageScore ?? 12;
      });
    }
    setSimulatedStudent({
      id: student.studentId,
      name: student.studentName,
      scores: componentScoresMap
    });
    setIsSimulatorOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-md border border-violet-500/20">
              {activeInstitution.code} • ANO 2026
            </span>
            <span className="text-xs text-slate-400">SIGAR • Motor de Avaliações &amp; Fórmulas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Motor de Avaliações &amp; Pautas de Notas
          </h1>
          <p className="text-xs text-slate-400">
            Cálculo automático de notas finais com fórmulas configuráveis (ex: <strong>Avaliação contínua 40% + Exame 60%</strong>), 
            homologação de pautas e critérios de aprovação e dispensa.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Imprimir Pauta Oficial</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (calculatedGrades[0]) handleOpenSimulator(calculatedGrades[0]);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-semibold cursor-pointer border border-violet-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Simulador de Notas</span>
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setBannerMessage(null)}
            className="text-emerald-300 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSubTab('pauta')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'pauta'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Pauta Geral &amp; Cálculo Automático</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('avaliacoes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'avaliacoes'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Avaliações Registradas ({evaluations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('formulas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'formulas'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Motor de Fórmulas ({calculationFormulas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('lancar_notas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'lancar_notas'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>Lançar Notas da Avaliação</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PAUTA GERAL COM CÁLCULO AUTOMÁTICO DE NOTAS        */}
      {/* ========================================================= */}
      {activeSubTab === 'pauta' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Média Geral da Turma</span>
              <p className="text-2xl font-mono font-black text-white">
                {averageGrade} <span className="text-xs text-slate-500 font-normal">/ 20v</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aproveitamento</span>
              <p className="text-2xl font-mono font-black text-emerald-400">
                {passingRate}%
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dispensados (≥ 14v)</span>
              <p className="text-2xl font-mono font-black text-emerald-400">
                {exemptCount} <span className="text-xs text-slate-500 font-normal">aluno(s)</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Exame de Recurso</span>
              <p className="text-2xl font-mono font-black text-amber-400">
                {recourseCount} <span className="text-xs text-slate-500 font-normal">aluno(s)</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reprovados (&lt; 7v)</span>
              <p className="text-2xl font-mono font-black text-rose-400">
                {failingCount} <span className="text-xs text-slate-500 font-normal">aluno(s)</span>
              </p>
            </div>
          </div>

          {/* Scope Filters: Turma, Disciplina, Período, Fórmula Ativa */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Filtros de Apuração da Pauta &amp; Fórmula Ativa
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Total de alunos nesta pauta: <strong>{classStudents.length}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Seleção de Turma */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Turma Acadêmica</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-hidden focus:border-violet-500"
                >
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name} ({cl.shift})
                    </option>
                  ))}
                </select>
              </div>

              {/* Disciplina */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Disciplina / Cadeira</label>
                <select
                  value={selectedDiscipline}
                  onChange={(e) => setSelectedDiscipline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-hidden focus:border-violet-500"
                >
                  <option value="todas">Todas as Disciplinas da Turma</option>
                  {availableDisciplines.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Período */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Período Letivo</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-hidden focus:border-violet-500"
                >
                  <option value="todos">Todos os Períodos</option>
                  <option value="1º Semestre">1º Semestre</option>
                  <option value="2º Semestre">2º Semestre</option>
                  <option value="1º Trimestre">1º Trimestre</option>
                  <option value="2º Trimestre">2º Trimestre</option>
                  <option value="Módulo I">Módulo I</option>
                  <option value="Módulo II">Módulo II</option>
                </select>
              </div>

              {/* Fórmula de Cálculo Ativa */}
              <div>
                <label className="text-[11px] font-bold text-violet-400 block mb-1 flex items-center justify-between">
                  <span>Fórmula de Cálculo</span>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('formulas')}
                    className="text-[10px] text-violet-400 hover:underline cursor-pointer"
                  >
                    Gerenciar
                  </button>
                </label>
                <select
                  value={selectedFormulaId}
                  onChange={(e) => setSelectedFormulaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-violet-500/40 text-violet-200 text-xs font-bold focus:outline-hidden"
                >
                  {calculationFormulas.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.isDefault ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Banner: Fórmula Ativa Visual */}
            {activeFormula && (
              <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider bg-violet-500/20 px-2 py-0.5 rounded-md border border-violet-500/30">
                      Fórmula em Vigor
                    </span>
                    <strong className="text-xs text-white">{activeFormula.name}</strong>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Componentes:{' '}
                    {activeFormula.components.map((c, i) => (
                      <span key={c.id} className="font-semibold text-violet-200">
                        {c.label || c.type} (<strong>{c.weight}%</strong>){i < activeFormula.components.length - 1 ? ' + ' : ''}
                      </span>
                    ))}
                    {' '}= Nota Final (0 a 20v)
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <span className="text-slate-400">Aprovação: <strong className="text-white">≥{activeFormula.minPassingScore}v</strong></span>
                  <span className="text-slate-400">Dispensa: <strong className="text-emerald-400">≥{activeFormula.examExemptionScore}v</strong></span>
                  <span className="text-slate-400">Recurso: <strong className="text-amber-400">≥{activeFormula.recourseMinScore || 7.0}v</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Master Grades Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Pauta Completa com Apuração Automática da Nota Final
                </h3>
                <p className="text-xs text-slate-400">
                  Turma: <strong className="text-slate-200">{selectedClass?.name}</strong> • 
                  Disciplina: <strong className="text-slate-200">{selectedDiscipline === 'todas' ? 'Todas as Disciplinas' : selectedDiscipline}</strong> • 
                  Escala Nacional: <strong>0 a 20 valores</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Pauta</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3 w-10 text-center">Nº</th>
                    <th className="py-3 px-3">Estudante</th>
                    {/* Dynamic Formula Component Columns */}
                    {activeFormula?.components.map(comp => (
                      <th key={comp.id} className="py-3 px-3 text-center font-mono">
                        <span>{comp.label || comp.type}</span>
                        <span className="block text-[9px] text-violet-400 font-bold">({comp.weight}%)</span>
                      </th>
                    ))}
                    {/* Calculated Final Grade Column (Highlighted) */}
                    <th className="py-3 px-4 text-center bg-violet-950/40 text-violet-200 font-mono border-x border-violet-500/20">
                      <span>Nota Final</span>
                      <span className="block text-[9px] text-violet-400 font-bold">Cálculo Automático</span>
                    </th>
                    <th className="py-3 px-3 text-center">Situação</th>
                    <th className="py-3 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {calculatedGrades.map((grade, idx) => {
                    const studentObj = students.find(s => s.id === grade.studentId);
                    const isPassing = grade.status === 'Aprovado' || grade.status === 'Dispensado';

                    return (
                      <tr key={grade.studentId} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={studentObj?.avatar || studentObj?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${grade.studentCode}`}
                              alt={grade.studentName}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full bg-slate-800 object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-white block">{grade.studentName}</span>
                              <span className="text-[10px] font-mono text-sky-400">{grade.studentCode}</span>
                            </div>
                          </div>
                        </td>

                        {/* Components average scores */}
                        {activeFormula?.components.map(comp => {
                          const compData = grade.componentScores[comp.type];
                          const scoreVal = compData ? compData.averageScore : 0;
                          const hasEvaluations = (compData?.count || 0) > 0;

                          return (
                            <td key={comp.id} className="py-3 px-3 text-center font-mono font-semibold text-slate-300">
                              {hasEvaluations ? (
                                <div>
                                  <span className={scoreVal >= 10 ? 'text-slate-200' : 'text-rose-400'}>
                                    {scoreVal.toFixed(1)}v
                                  </span>
                                  <span className="block text-[9px] text-slate-500 font-normal">
                                    {compData?.count} aval.
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-600 italic text-[11px]">-</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Automatic Calculated Final Score */}
                        <td className="py-3 px-4 text-center bg-violet-950/20 border-x border-violet-500/20">
                          <div className="inline-flex items-baseline gap-1">
                            <span className={`text-base font-black font-mono ${
                              grade.status === 'Dispensado' 
                                ? 'text-emerald-400' 
                                : grade.status === 'Aprovado' 
                                ? 'text-sky-400' 
                                : grade.status === 'Recurso'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}>
                              {grade.finalScore.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">v.</span>
                          </div>
                        </td>

                        {/* Situation Badge */}
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            grade.status === 'Dispensado'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : grade.status === 'Aprovado'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : grade.status === 'Recurso'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {grade.status}
                          </span>
                        </td>

                        {/* Interactive Simulator Trigger */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenSimulator(grade)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 cursor-pointer transition-colors"
                            title="Simular notas deste aluno"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Homologation and Approval Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  O cálculo automático é atualizado dinamicamente a cada nota inserida pelo corpo docente.
                </span>
              </div>

              <PermissionGate 
                permission="notas.approve"
                fallback={
                  <div className="text-xs text-slate-500 italic">
                    🔒 Homologação restrita à Direção Pedagógica.
                  </div>
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    addNotification({
                      title: 'Pauta Homologada Oficialmente',
                      message: `Pauta da turma ${selectedClass?.name} homologada com ${passingCount} aprovados/dispensados.`,
                      type: 'academic'
                    });
                    setBannerMessage(`Pauta da turma "${selectedClass?.name}" homologada e assinada digitalmente com autorização SIGAR!`);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Homologar e Fechar Pauta Oficial
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: GERENCIADOR DE AVALIAÇÕES REGISTRADAS              */}
      {/* ========================================================= */}
      {activeSubTab === 'avaliacoes' && (
        <EvaluationListTab 
          onOpenGradebook={handleOpenGradebookForEval}
          selectedClassGroupId={selectedClassId}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 3: MOTOR DE FÓRMULAS DE CÁLCULO                       */}
      {/* ========================================================= */}
      {activeSubTab === 'formulas' && (
        <FormulaEngineTab 
          onFormulaSelected={(formulaId) => {
            setSelectedFormulaId(formulaId);
            setActiveSubTab('pauta');
            setBannerMessage('Fórmula de cálculo selecionada e aplicada à Pauta Geral!');
          }}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 4: LANÇAMENTO DE NOTAS POR AVALIAÇÃO                  */}
      {/* ========================================================= */}
      {activeSubTab === 'lancar_notas' && (
        <GradebookTab 
          evaluationId={gradebookEvaluationId || evaluations[0]?.id}
          onBack={() => setActiveSubTab('avaliacoes')}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: PAUTA OFICIAL TIMBRADA PARA IMPRESSÃO              */}
      {/* ========================================================= */}
      <OfficialGradesheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        classGroupName={selectedClass?.name || 'Turma A'}
        disciplineName={selectedDiscipline === 'todas' ? 'Avaliação Integrada / Módulos' : selectedDiscipline}
        periodName={selectedPeriod === 'todos' ? 'Ano Letivo Completo' : selectedPeriod}
        formula={activeFormula}
        teacherName={selectedClass?.teacherName || activeTeacher?.fullName || 'Docente Responsável'}
        grades={calculatedGrades}
      />

      {/* ========================================================= */}
      {/* MODAL: SIMULADOR DE NOTAS                                 */}
      {/* ========================================================= */}
      {simulatedStudent && activeFormula && (
        <GradeSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          formula={activeFormula}
          studentName={simulatedStudent.name}
          initialScores={simulatedStudent.scores}
        />
      )}
    </div>
  );
};
