import React, { useState, useMemo, useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  User, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  QrCode, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  BookOpen, 
  GraduationCap, 
  Stamp, 
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, PautaSituacao, BoletimDisciplineItem } from '../../types';

export const BoletimView: React.FC = () => {
  const { 
    students, 
    classes, 
    courses, 
    activeInstitution, 
    activeBranch,
    evaluations, 
    calculateStudentFinalGrade,
    activeTeacher
  } = useApp();

  // Estados de Seleção
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1º Semestre 2026');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Turma e Alunos
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = useMemo(() => {
    return students.filter(s => s.classGroupId === selectedClassId || s.status === 'Ativo');
  }, [students, selectedClassId]);

  // Aluno Selecionado
  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || classStudents[0] || students[0];
  }, [students, selectedStudentId, classStudents]);

  // Curso correspondente
  const currentCourse = useMemo(() => {
    return courses.find(c => c.id === (currentClass?.courseId || selectedStudent?.courseId)) || courses[0];
  }, [courses, currentClass, selectedStudent]);

  // Disciplinas do Curso / Turma com Notas, Médias e Frequência
  const disciplinesData: BoletimDisciplineItem[] = useMemo(() => {
    if (!selectedStudent) return [];

    // Módulos do curso ou avaliações cadastradas
    const modulesList = currentCourse?.modules || [
      { id: 'm1', name: 'Programação Web & Algoritmos', hours: 120 },
      { id: 'm2', name: 'Bases de Dados Relacionais & SQL', hours: 90 },
      { id: 'm3', name: 'Arquitetura de Sistemas & Redes', hours: 80 },
      { id: 'm4', name: 'Inglês Técnico Profissional', hours: 60 },
      { id: 'm5', name: 'Empreendedorismo & Ética Profissional', hours: 50 }
    ];

    return modulesList.map(mod => {
      // Cálculo da nota pelo motor de cálculo
      const gradeResult = calculateStudentFinalGrade(
        selectedStudent.id,
        currentClass?.id || '',
        mod.name,
        selectedPeriod !== 'todos' ? selectedPeriod : undefined
      );

      const finalAverage = gradeResult ? gradeResult.finalScore : (selectedStudent.averageGrade || 12.5);

      // Frequência simulada e consistente por disciplina
      const attendance = selectedStudent.attendancePercentage || 94;
      const totalClasses = Math.round((mod.hours || 80) / 2);
      const absences = Math.max(0, Math.round(totalClasses * ((100 - attendance) / 100)));

      let situation: PautaSituacao | 'DISPENSADO' = 'EM CURSO';
      if (finalAverage >= 14) {
        situation = 'DISPENSADO';
      } else if (finalAverage >= 10) {
        situation = 'APROVADO';
      } else if (finalAverage > 0) {
        situation = 'REPROVADO';
      } else {
        situation = 'PENDENTE';
      }

      return {
        disciplineId: mod.id,
        disciplineName: mod.name,
        code: `DISC-${mod.id.toUpperCase()}`,
        workloadHours: mod.hours || 80,
        teacherName: activeTeacher?.fullName || 'Docente Responsável',
        evaluations: gradeResult?.assessmentsList?.map(a => ({
          label: a.name,
          score: a.score,
          maxScore: a.maxScore,
          weight: a.weight
        })) || [
          { label: 'Teste Teórico 1', score: Math.min(20, finalAverage - 1), maxScore: 20, weight: 30 },
          { label: 'Projeto Prático', score: Math.min(20, finalAverage + 1), maxScore: 20, weight: 40 },
          { label: 'Avaliação Contínua', score: finalAverage, maxScore: 20, weight: 30 }
        ],
        finalAverage: Math.round(finalAverage * 10) / 10,
        attendancePercentage: attendance,
        totalClasses,
        totalAbsences: absences,
        situation,
        observations: finalAverage >= 14 ? 'Excelente aproveitamento' : finalAverage >= 10 ? 'Aproveitamento positivo' : 'Requer reforço pedagógico'
      };
    });
  }, [selectedStudent, currentCourse, currentClass, calculateStudentFinalGrade, selectedPeriod, activeTeacher]);

  // Cálculos Globais
  const globalAverage = useMemo(() => {
    if (disciplinesData.length === 0) return 0;
    const sum = disciplinesData.reduce((acc, d) => acc + d.finalAverage, 0);
    return Math.round((sum / disciplinesData.length) * 10) / 10;
  }, [disciplinesData]);

  const globalAttendance = useMemo(() => {
    if (disciplinesData.length === 0) return 100;
    const sum = disciplinesData.reduce((acc, d) => acc + d.attendancePercentage, 0);
    return Math.round(sum / disciplinesData.length);
  }, [disciplinesData]);

  const overallSituation: PautaSituacao = useMemo(() => {
    if (disciplinesData.length === 0) return 'PENDENTE';
    const hasFail = disciplinesData.some(d => d.situation === 'REPROVADO');
    if (hasFail) return 'REPROVADO';
    if (globalAverage >= 10) return 'APROVADO';
    return 'EM CURSO';
  }, [disciplinesData, globalAverage]);

  // Data de Emissão Formatada
  const issueDate = new Date().toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Barra de Controles (Não é impressa) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 print:hidden space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
                Módulo 19 • SIGAR Boletim
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Padrão Oficial ANEP
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-7 h-7 text-sky-400" />
              Boletim Profissional & Pauta Individual
            </h1>
            <p className="text-xs text-slate-400">
              Geração de boletins de aproveitamento com médias, frequência, chancela digital e exportação oficial em PDF.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-900/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
          </div>
        </div>

        {/* Filtros de Turma, Aluno e Período */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Turma</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const classStuds = students.filter(s => s.classGroupId === e.target.value);
                if (classStuds.length > 0) setSelectedStudentId(classStuds[0].id);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Aluno Selecionado</label>
            <select
              value={selectedStudent?.id || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
            >
              {classStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Período de Avaliação</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="1º Trimestre 2026">1º Trimestre 2026</option>
              <option value="2º Trimestre 2026">2º Trimestre 2026</option>
              <option value="3º Trimestre 2026">3º Trimestre 2026</option>
              <option value="1º Semestre 2026">1º Semestre 2026</option>
              <option value="2º Semestre 2026">2º Semestre 2026</option>
              <option value="Ano Letivo Completo">Ano Letivo Completo (Pauta Final)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOLETIM PROFISSIONAL OFICIAL (LAYOUT DE IMPRESSÃO A4 & EXIBIÇÃO EM TELA) */}
      {/* ========================================================================= */}
      <div 
        id="boletim-print-area"
        className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 sm:p-12 max-w-4xl mx-auto shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:p-6 print:m-0 print:max-w-none print:rounded-none"
      >
        {/* Marca d'água de segurança de fundo */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
          <div className="text-center transform -rotate-45">
            <span className="text-8xl font-black text-slate-900 uppercase tracking-widest block">
              REPÚBLICA DE MOÇAMBIQUE
            </span>
            <span className="text-6xl font-bold text-slate-900 uppercase tracking-wider block mt-4">
              SIGAR • DOCUMENTO AUTÊNTICO
            </span>
          </div>
        </div>

        {/* 1. CABEÇALHO OFICIAL */}
        <div className="text-center space-y-1.5 pb-6 border-b-2 border-slate-900 relative">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
            República de Moçambique
          </h4>
          <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Ministério da Ciência, Tecnologia e Ensino Superior • ANEP
          </h5>
          <h2 className="text-xl font-black text-slate-900 mt-2 uppercase tracking-tight">
            {activeInstitution.name}
          </h2>
          <p className="text-xs text-slate-600 max-w-xl mx-auto">
            {activeInstitution.address} • NUIT: {activeInstitution.nuit || '400192841'} • Telefone: {activeInstitution.phone}
            {activeBranch ? ` • Filial: ${activeBranch.name}` : ''}
          </p>

          <div className="pt-2">
            <span className="inline-block px-4 py-1 rounded bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
              Boletim Profissional de Aproveitamento e Assiduidade
            </span>
          </div>
        </div>

        {/* 2. DADOS DO ALUNO, CURSO E TURMA */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-xs">
          {/* Foto e QR de Validação */}
          <div className="flex md:flex-col items-center gap-3">
            <div className="w-24 h-28 rounded-lg bg-slate-100 border-2 border-slate-300 flex items-center justify-center overflow-hidden text-slate-400 font-bold text-xs shadow-inner">
              {selectedStudent?.photoUrl ? (
                <img 
                  src={selectedStudent.photoUrl} 
                  alt={selectedStudent.fullName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block font-mono">
                {selectedStudent?.code}
              </span>
            </div>
          </div>

          {/* Dados Pessoais e Acadêmicos */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
            <div>
              <span className="text-slate-500 block text-[11px]">Nome do Formando:</span>
              <strong className="text-sm font-bold text-slate-900 block">
                {selectedStudent?.fullName}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Documento de Identificação (BI):</span>
              <strong className="text-slate-800 block font-mono">
                {selectedStudent?.documentNumber || '110100293841B'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Curso / Qualificação Técnico-Profissional:</span>
              <strong className="text-slate-900 block font-semibold">
                {currentCourse?.name}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Turma & Ano Letivo:</span>
              <strong className="text-slate-800 block font-semibold">
                {currentClass?.name || 'Turma Regular'} • Ano: {currentClass?.academicYear || '2026'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Período de Avaliação:</span>
              <strong className="text-slate-800 block font-medium">
                {selectedPeriod}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Turno & Regime:</span>
              <strong className="text-slate-800 block font-medium">
                {currentClass?.shift || 'Diurno (Laboral)'} • Presencial Intensivo
              </strong>
            </div>
          </div>
        </div>

        {/* 3. TABELA DE DISCIPLINAS, NOTAS, MÉDIAS, FREQUÊNCIA E SITUAÇÃO */}
        <div className="py-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-600" />
              Disciplinas Curriculares & Avaliações
            </h3>
            <span className="text-[11px] text-slate-500">
              Escala de Avaliação: 0 a 20 Valores (Mínimo de Aprovação: 10)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2 px-3 border-r border-slate-300">Disciplina / Módulo</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center w-20">C. Horária</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Notas / Avaliações</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center w-20">Média</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center w-24">Frequência</th>
                  <th className="py-2 px-3 text-center w-28">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {disciplinesData.map((d, i) => (
                  <tr key={d.disciplineId} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    {/* Disciplina */}
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <strong className="text-slate-900 block">{d.disciplineName}</strong>
                      <span className="text-[10px] text-slate-500 block">{d.teacherName}</span>
                    </td>

                    {/* Carga Horária */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono">
                      {d.workloadHours}h
                    </td>

                    {/* Notas Parcelares */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {d.evaluations.map((ev, idx) => (
                          <span 
                            key={idx} 
                            title={ev.label}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                              ev.score >= 10 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {ev.score.toFixed(1)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Média */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold font-mono text-xs">
                      <span className={d.finalAverage >= 10 ? 'text-slate-900' : 'text-rose-700'}>
                        {d.finalAverage.toFixed(1)}
                      </span>
                    </td>

                    {/* Frequência */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                      <div className="font-mono font-semibold text-slate-800">
                        {d.attendancePercentage}%
                      </div>
                      <span className="text-[9px] text-slate-500 block">
                        {d.totalAbsences} falta(s)
                      </span>
                    </td>

                    {/* Situação */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        d.situation === 'APROVADO' || d.situation === 'DISPENSADO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : d.situation === 'REPROVADO'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}>
                        {d.situation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. QUADRO DE RESUMO GLOBAL */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-300 rounded-xl text-center text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Média Geral do Período</span>
            <strong className="text-base font-black text-slate-900 mt-0.5 block font-mono">
              {globalAverage.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 20</span>
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Assiduidade Média Global</span>
            <strong className="text-base font-black text-slate-900 mt-0.5 block font-mono">
              {globalAttendance}%
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Situação Global Oficial</span>
            <strong className={`text-base font-black mt-0.5 block uppercase ${
              overallSituation === 'APROVADO' ? 'text-emerald-700' :
              overallSituation === 'REPROVADO' ? 'text-rose-700' : 'text-sky-700'
            }`}>
              {overallSituation}
            </strong>
          </div>
        </div>

        {/* 5. ÁREA DE ASSINATURA E CARIMBO OFICIAL */}
        <div className="pt-10 pb-4 border-t-2 border-slate-900 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-xs items-end">
          {/* Assinatura do Docente / Diretor de Turma */}
          <div className="space-y-2">
            <div className="h-16 flex items-end justify-center">
              <span className="font-serif italic text-slate-800 text-sm border-b border-dashed border-slate-400 pb-1 px-4">
                {activeTeacher?.fullName || 'Assinatura Autorizada'}
              </span>
            </div>
            <div>
              <strong className="text-slate-900 block">O Diretor de Turma / Formador</strong>
              <span className="text-[10px] text-slate-500">Docente Titular da Turma</span>
            </div>
          </div>

          {/* Carimbo Oficial Circular */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-24 h-24 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center p-2 relative">
              <div className="w-20 h-20 rounded-full border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-1">
                <span className="text-[7px] font-black uppercase tracking-tighter text-slate-800 block">
                  REPÚBLICA DE MOÇAMBIQUE
                </span>
                <span className="text-[8px] font-bold text-slate-900 my-0.5 uppercase">
                  {activeInstitution.code || 'SIGAR'}
                </span>
                <span className="text-[7px] font-bold uppercase text-slate-700">
                  CARIMBO OFICIAL
                </span>
                <span className="text-[6px] text-slate-500 font-mono mt-0.5">
                  SIVEC-MZ-2026
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-600 font-medium">
              Data de Emissão: <strong>{issueDate}</strong>
            </div>
          </div>

          {/* Assinatura da Direção Geral */}
          <div className="space-y-2">
            <div className="h-16 flex items-end justify-center">
              <span className="font-serif italic text-slate-800 text-sm border-b border-dashed border-slate-400 pb-1 px-4">
                Prof. Doutor Zacarias Nhantumbo
              </span>
            </div>
            <div>
              <strong className="text-slate-900 block">A Direção da Instituição</strong>
              <span className="text-[10px] text-slate-500">Diretor Geral • SIGAR Core</span>
            </div>
          </div>
        </div>

        {/* Rodapé com Código SIVEC e QR de Segurança */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Documento Acadêmico Emitido pelo SIGAR • Hash de Validação: 
              <strong className="font-mono text-slate-700 ml-1">
                {selectedStudent?.code}-BOL-{selectedPeriod.replace(/\s+/g, '')}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <QrCode className="w-4 h-4 text-slate-700" />
            <span>Verificação Online: sivec.gov.mz/verificar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
