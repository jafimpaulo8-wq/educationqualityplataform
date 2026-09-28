import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Award,
  ArrowRight,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { CalculationFormula, ASSESSMENT_TYPE_METADATA, AssessmentType } from '../../../types';

interface GradeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  formula: CalculationFormula;
  studentName?: string;
  initialScores?: Record<string, number>;
}

export const GradeSimulatorModal: React.FC<GradeSimulatorModalProps> = ({
  isOpen,
  onClose,
  formula,
  studentName = 'Estudante Simulado',
  initialScores = {}
}) => {
  if (!isOpen) return null;

  // Initialize simulator state with existing or default scores (0 to 20 scale)
  const [simulatedScores, setSimulatedScores] = useState<Record<string, number>>(() => {
    const scores: Record<string, number> = {};
    formula.components.forEach(comp => {
      scores[comp.type] = initialScores[comp.type] !== undefined ? initialScores[comp.type] : 12;
    });
    return scores;
  });

  const handleScoreChange = (type: string, val: number) => {
    const clamped = Math.max(0, Math.min(20, val));
    setSimulatedScores(prev => ({
      ...prev,
      [type]: clamped
    }));
  };

  // Calculate automatic final grade
  let simulatedFinal = 0;
  formula.components.forEach(comp => {
    const score = simulatedScores[comp.type] ?? 0;
    simulatedFinal += (score * comp.weight) / 100;
  });
  simulatedFinal = Math.round(simulatedFinal * 10) / 10;

  let statusText = 'Reprovado';
  let statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  if (simulatedFinal >= formula.examExemptionScore) {
    statusText = 'Dispensado de Exame (Excelente)';
    statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (simulatedFinal >= formula.minPassingScore) {
    statusText = 'Aprovado na Disciplina';
    statusColor = 'text-sky-400 bg-sky-500/10 border-sky-500/30';
  } else if (simulatedFinal >= (formula.recourseMinScore || 7.0)) {
    statusText = 'Admitido ao Exame de Recurso';
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulador de Nota Final Interativo</h3>
              <p className="text-[11px] text-slate-400">
                Fórmula: <strong>{formula.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Aluno Selecionado:</span>
            <span className="text-xs font-bold text-white">{studentName}</span>
          </div>

          {/* Interactive Sliders for each component */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Ajuste as Notas dos Componentes:
            </h4>

            {formula.components.map((comp) => {
              const meta = ASSESSMENT_TYPE_METADATA[comp.type];
              const currentVal = simulatedScores[comp.type] ?? 0;
              const contribution = ((currentVal * comp.weight) / 100).toFixed(2);

              return (
                <div key={comp.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${meta?.bg} ${meta?.color} ${meta?.border}`}>
                        {meta?.label || comp.type}
                      </span>
                      <span className="text-xs font-bold text-white">{comp.label || meta?.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-violet-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                        {currentVal.toFixed(1)}v
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        (Peso {comp.weight}%)
                      </span>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-mono">0v</span>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={currentVal}
                      onChange={(e) => handleScoreChange(comp.type, parseFloat(e.target.value))}
                      className="w-full accent-violet-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">20v</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Contribuição para a Nota Final:</span>
                    <span className="font-mono text-slate-300 font-bold">
                      {contribution} pontos
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Automatic Calculation Result Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-violet-500/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Nota Final Calculada pelo Motor:</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Escala 0-20v</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-black text-white tracking-tight">
                  {simulatedFinal.toFixed(1)}
                </span>
                <span className="text-sm font-mono text-slate-400">/ 20 valores</span>
              </div>

              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${statusColor}`}>
                {statusText}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
              <div>
                <span className="block text-slate-500">Mínimo:</span>
                <span className="font-mono text-slate-200">≥ {formula.minPassingScore}v</span>
              </div>
              <div>
                <span className="block text-slate-500">Dispensa:</span>
                <span className="font-mono text-emerald-400">≥ {formula.examExemptionScore}v</span>
              </div>
              <div>
                <span className="block text-slate-500">Recurso:</span>
                <span className="font-mono text-amber-400">≥ {formula.recourseMinScore || 7.0}v</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold cursor-pointer transition-all"
          >
            Concluir Simulação
          </button>
        </div>
      </div>
    </div>
  );
};
