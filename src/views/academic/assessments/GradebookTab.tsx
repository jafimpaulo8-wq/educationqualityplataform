import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Save, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  Award, 
  TrendingUp, 
  UserCheck, 
  FileText,
  Calendar,
  BookOpen,
  User,
  Sliders
} from 'lucide-react';
import { EvaluationItem, ASSESSMENT_TYPE_METADATA } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface GradebookTabProps {
  evaluationId?: string;
  onBack?: () => void;
}

export const GradebookTab: React.FC<GradebookTabProps> = ({ 
  evaluationId: initialEvaluationId,
  onBack 
}) => {
  const { 
    evaluations, 
    classes, 
    students, 
    saveBulkEvaluationScores, 
    activeTeacher 
  } = useApp();

  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>(
    initialEvaluationId || evaluations[0]?.id || ''
  );

  useEffect(() => {
    if (initialEvaluationId) {
      setSelectedEvaluationId(initialEvaluationId);
    }
  }, [initialEvaluationId]);

  const currentEval = evaluations.find(e => e.id === selectedEvaluationId) || evaluations[0];
  const targetClass = classes.find(c => c.id === currentEval?.classGroupId);
  const classStudents = students.filter(s => s.classGroupId === currentEval?.classGroupId);

  // Local draft scores state
  const [draftScores, setDraftScores] = useState<Record<string, { score: number; notes: string }>>({});

  // Sync draft when currentEval changes
  useEffect(() => {
    if (currentEval) {
      const initial: Record<string, { score: number; notes: string }> = {};
      classStudents.forEach(st => {
        const existing = currentEval.scores[st.id];
        initial[st.id] = {
          score: existing ? existing.score : 0,
          notes: existing?.notes || ''
        };
      });
      setDraftScores(initial);
    }
  }, [currentEval?.id, classStudents.length]);

  const handleScoreChange = (studentId: string, val: number) => {
    const max = currentEval?.maxScore || 20;
    const clamped = Math.max(0, Math.min(max, val));
    setDraftScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: clamped
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setDraftScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleQuickFill = (score: number) => {
    const max = currentEval?.maxScore || 20;
    const clamped = Math.max(0, Math.min(max, score));
    const next: Record<string, { score: number; notes: string }> = {};
    classStudents.forEach(st => {
      next[st.id] = {
        score: clamped,
        notes: draftScores[st.id]?.notes || ''
      };
    });
    setDraftScores(next);
  };

  const handleSaveAll = () => {
    if (!currentEval) return;
    saveBulkEvaluationScores(currentEval.id, draftScores);
  };

  // Metrics
  const scoresArray = classStudents.map(st => draftScores[st.id]?.score || 0);
  const avg = scoresArray.length > 0 ? (scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length) : 0;
  const max = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
  const min = scoresArray.length > 0 ? Math.min(...scoresArray) : 0;
  const passingCount = scoresArray.filter(s => s >= 10).length;
  const passingRate = scoresArray.length > 0 ? Math.round((passingCount / scoresArray.length) * 100) : 0;

  if (!currentEval) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800">
        <p className="text-sm text-slate-400">Nenhuma avaliação disponível para lançamento de notas.</p>
      </div>
    );
  }

  const meta = ASSESSMENT_TYPE_METADATA[currentEval.type];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Voltar à lista"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${meta?.bg} ${meta?.color} ${meta?.border}`}>
                {meta?.label || currentEval.type}
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">{currentEval.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Disciplina: <strong className="text-slate-200">{currentEval.discipline}</strong> • Turma: <strong className="text-slate-200">{targetClass?.name}</strong> • Período: <strong className="text-slate-200">{currentEval.period}</strong>
            </p>
          </div>
        </div>

        {/* Evaluation Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedEvaluationId}
            onChange={(e) => setSelectedEvaluationId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden"
          >
            {evaluations.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name} ({ev.discipline} - {ev.type})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Salvar e Homologar Notas</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Média da Avaliação</span>
          <p className="text-xl font-mono font-black text-white mt-1">
            {avg.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ {currentEval.maxScore}v</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Aproveitamento (≥ 10v)</span>
          <p className="text-xl font-mono font-black text-emerald-400 mt-1">
            {passingRate}% <span className="text-xs text-slate-500 font-normal">({passingCount}/{classStudents.length})</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Maior Nota Obtida</span>
          <p className="text-xl font-mono font-black text-sky-400 mt-1">
            {max.toFixed(1)} <span className="text-xs text-slate-500 font-normal">valores</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Menor Nota Obtida</span>
          <p className="text-xl font-mono font-black text-rose-400 mt-1">
            {min.toFixed(1)} <span className="text-xs text-slate-500 font-normal">valores</span>
          </p>
        </div>
      </div>

      {/* Grade Entry Table */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Pauta de Lançamento de Notas por Aluno</h3>
            <p className="text-xs text-slate-400">
              Escala de notas: <strong>0.0 a {currentEval.maxScore}.0 valores</strong> • Peso definido: <strong>{currentEval.weight}%</strong>
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Preenchimento Rápido:</span>
            <button
              type="button"
              onClick={() => handleQuickFill(14)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
            >
              Todos 14v
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill(10)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
            >
              Todos 10v
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill(0)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
            >
              Zerar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="pb-3 w-12 text-center">Nº</th>
                <th className="pb-3">Estudante</th>
                <th className="pb-3 w-32 text-center">Nota Obtida *</th>
                <th className="pb-3 w-36 text-center">Situação</th>
                <th className="pb-3">Observações / Parecer do Docente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {classStudents.map((student, idx) => {
                const currentScore = draftScores[student.id]?.score ?? 0;
                const currentNotes = draftScores[student.id]?.notes ?? '';
                const isPassing = currentScore >= 10;
                const isExempt = currentScore >= 14;

                return (
                  <tr key={student.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 text-center font-mono text-slate-500 font-bold">
                      {idx + 1}
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.code}`}
                          alt={student.fullName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full bg-slate-800 object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{student.fullName}</p>
                          <p className="font-mono text-[10px] text-slate-400">{student.code}</p>
                        </div>
                      </div>
                    </td>

                    {/* Score Input */}
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={currentEval.maxScore}
                          value={currentScore}
                          onChange={(e) => handleScoreChange(student.id, parseFloat(e.target.value) || 0)}
                          className={`w-20 px-2 py-1.5 rounded-xl border text-center font-mono text-sm font-black focus:outline-hidden ${
                            isExempt
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                              : isPassing
                              ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                              : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                          }`}
                        />
                        <span className="text-[11px] text-slate-500 font-mono">/ {currentEval.maxScore}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isExempt
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isPassing
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          : currentScore >= 7
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {isExempt ? 'Dispensado' : isPassing ? 'Aprovado' : currentScore >= 7 ? 'Recurso' : 'Reprovado'}
                      </span>
                    </td>

                    {/* Notes Input */}
                    <td className="py-3">
                      <input
                        type="text"
                        value={currentNotes}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        placeholder="Ex: Excelente raciocínio; Prova bem fundamentada..."
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Docente Responsável: <strong className="text-white">{currentEval.teacher}</strong> • Data: <strong className="text-white">{currentEval.date}</strong>
          </p>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar e Homologar Pauta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
