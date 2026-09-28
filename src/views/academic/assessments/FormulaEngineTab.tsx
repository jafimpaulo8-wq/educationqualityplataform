import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Check, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Layers,
  Star,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { 
  CalculationFormula, 
  CalculationFormulaComponent, 
  AssessmentType, 
  ASSESSMENT_TYPE_METADATA 
} from '../../../types';
import { useApp } from '../../../context/AppContext';

interface FormulaEngineTabProps {
  onFormulaSelected?: (formulaId: string) => void;
}

const PRESET_FORMULAS: {
  title: string;
  badge: string;
  description: string;
  components: { type: AssessmentType; label: string; weight: number; minScore?: number }[];
  minPassingScore: number;
  examExemptionScore: number;
  recourseMinScore: number;
}[] = [
  {
    title: 'Fórmula Oficial SIGAR PRO: T1 30% + Trabalho 30% + Exame 40%',
    badge: 'Padrão SIGAR PRO',
    description: 'Padrão oficial do SIGAR: Teste 1 (30%) + Trabalho Prático (30%) + Exame Final (40%). Aprovação ≥ 10 valores na escala 0-20.',
    components: [
      { type: 'teste', label: 'Teste Teórico 1 (T1)', weight: 30, minScore: 10 },
      { type: 'trabalho', label: 'Trabalho Individual / Grupo', weight: 30, minScore: 10 },
      { type: 'exame', label: 'Exame Final', weight: 40, minScore: 8 }
    ],
    minPassingScore: 10,
    examExemptionScore: 14,
    recourseMinScore: 7
  },
  {
    title: 'Avaliação Contínua 40% + Exame 60%',
    badge: 'Oficial Regulamentar',
    description: 'Padrão tradicional de Moçambique: 40% média de avaliação contínua + 60% nota do exame semestral.',
    components: [
      { type: 'avaliacao_continua', label: 'Avaliação Contínua', weight: 40, minScore: 10 },
      { type: 'exame', label: 'Exame Final / Semestral', weight: 60, minScore: 8 }
    ],
    minPassingScore: 10,
    examExemptionScore: 14,
    recourseMinScore: 7
  },
  {
    title: 'Projetos Tecnológicos: Trabalho 20% + Projeto 40% + Defesa 40%',
    badge: 'Engenharia & TI',
    description: 'Focado em desenvolvimento de software, protótipos e apresentação perante júri examinador.',
    components: [
      { type: 'trabalho', label: 'Trabalho de Pesquisa', weight: 20 },
      { type: 'projeto', label: 'Projeto Integrador', weight: 40, minScore: 10 },
      { type: 'defesa', label: 'Defesa Técnica Perante Banca', weight: 40, minScore: 10 }
    ],
    minPassingScore: 10,
    examExemptionScore: 16,
    recourseMinScore: 8
  },
  {
    title: 'Técnico Operacional: Prática 50% + Prova Final 50%',
    badge: 'Oficinas & Laboratórios',
    description: '50% avaliação em bancada ou oficina técnica e 50% exame global.',
    components: [
      { type: 'pratica', label: 'Avaliação Prática em Bancada', weight: 50, minScore: 10 },
      { type: 'prova_final', label: 'Prova Final Global', weight: 50, minScore: 10 }
    ],
    minPassingScore: 10,
    examExemptionScore: 14,
    recourseMinScore: 7
  },
  {
    title: 'Formação Completa: Teste 30% + Trabalho 20% + Prática 30% + Participação 20%',
    badge: 'Multicomponente',
    description: 'Avaliação multidimensional contínua valorizando tarefas, práticas e engajamento em sala de aula.',
    components: [
      { type: 'teste', label: 'Testes Teóricos', weight: 30 },
      { type: 'trabalho', label: 'Trabalhos & Relatórios', weight: 20 },
      { type: 'pratica', label: 'Aulas Práticas', weight: 30 },
      { type: 'participacao', label: 'Participação & Assiduidade', weight: 20 }
    ],
    minPassingScore: 10,
    examExemptionScore: 14,
    recourseMinScore: 7
  }
];

export const FormulaEngineTab: React.FC<FormulaEngineTabProps> = ({ onFormulaSelected }) => {
  const { 
    calculationFormulas, 
    addCalculationFormula, 
    updateCalculationFormula, 
    deleteCalculationFormula,
    activeInstitution,
    classes
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [editingFormulaId, setEditingFormulaId] = useState<string | null>(null);

  // Form State
  const [formulaName, setFormulaName] = useState('Avaliação contínua 40% + Exame 60%');
  const [formulaDescription, setFormulaDescription] = useState('Fórmula de cálculo com 40% contínua e 60% exame com apuração automática de médias.');
  const [discipline, setDiscipline] = useState('');
  const [classGroupId, setClassGroupId] = useState('');
  const [minPassingScore, setMinPassingScore] = useState(10.0);
  const [examExemptionScore, setExamExemptionScore] = useState(14.0);
  const [recourseMinScore, setRecourseMinScore] = useState(7.0);
  const [isDefault, setIsDefault] = useState(false);

  const [components, setComponents] = useState<CalculationFormulaComponent[]>([
    { id: 'c-1', type: 'avaliacao_continua', label: 'Avaliação Contínua', weight: 40, minScore: 10 },
    { id: 'c-2', type: 'exame', label: 'Exame Semestral', weight: 60, minScore: 8 }
  ]);

  const totalWeight = components.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const isWeightValid = totalWeight === 100;

  const handleAddComponent = () => {
    const remaining = Math.max(0, 100 - totalWeight);
    const newComp: CalculationFormulaComponent = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`,
      type: 'teste',
      label: 'Novo Componente',
      weight: remaining > 0 ? remaining : 10
    };
    setComponents(prev => [...prev, newComp]);
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length <= 1) return;
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateComponent = (id: string, updates: Partial<CalculationFormulaComponent>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const applyPreset = (preset: typeof PRESET_FORMULAS[0]) => {
    setFormulaName(preset.title);
    setFormulaDescription(preset.description);
    setMinPassingScore(preset.minPassingScore);
    setExamExemptionScore(preset.examExemptionScore);
    setRecourseMinScore(preset.recourseMinScore);
    setComponents(preset.components.map((p, idx) => ({
      id: `preset-comp-${idx}-${Date.now()}`,
      type: p.type,
      label: p.label,
      weight: p.weight,
      minScore: p.minScore
    })));
  };

  const handleStartEdit = (formula: CalculationFormula) => {
    setEditingFormulaId(formula.id);
    setIsCreating(true);
    setFormulaName(formula.name);
    setFormulaDescription(formula.description);
    setDiscipline(formula.discipline || '');
    setClassGroupId(formula.classGroupId || '');
    setMinPassingScore(formula.minPassingScore);
    setExamExemptionScore(formula.examExemptionScore);
    setRecourseMinScore(formula.recourseMinScore || 7.0);
    setIsDefault(formula.isDefault);
    setComponents(formula.components);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingFormulaId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightValid) {
      alert(`A soma dos pesos deve totalizar exatamente 100%. Total atual: ${totalWeight}%`);
      return;
    }

    if (editingFormulaId) {
      updateCalculationFormula(editingFormulaId, {
        name: formulaName,
        description: formulaDescription,
        discipline: discipline || undefined,
        classGroupId: classGroupId || undefined,
        components,
        minPassingScore,
        examExemptionScore,
        recourseMinScore,
        isDefault
      });
    } else {
      addCalculationFormula({
        institutionId: activeInstitution.id,
        name: formulaName,
        description: formulaDescription,
        discipline: discipline || undefined,
        classGroupId: classGroupId || undefined,
        components,
        minPassingScore,
        examExemptionScore,
        recourseMinScore,
        isDefault
      });
    }

    setIsCreating(false);
    setEditingFormulaId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Motor de Fórmulas &amp; Ponderação de Avaliações
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Configure as regras de ponderação das notas finais (ex: <strong>Avaliação contínua 40% + Exame 60%</strong>). 
            O sistema calcula automaticamente a média final, situação acadêmica (Aprovado, Dispensado, Recurso, Reprovado) e sincroniza as pautas.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingFormulaId(null);
              applyPreset(PRESET_FORMULAS[0]);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Fórmula</span>
          </button>
        )}
      </div>

      {/* Editor Form Modal / Section */}
      {isCreating && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900 border-2 border-violet-500/30 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingFormulaId ? 'Editar Fórmula de Cálculo' : 'Configurar Nova Fórmula de Cálculo'}
                </h3>
                <p className="text-xs text-slate-400">Defina os componentes de avaliação e suas respectivas ponderações percentuais</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {/* Quick Presets Bar */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Carregar Modelo Predefinido:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESET_FORMULAS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-violet-500/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                      {preset.badge}
                    </span>
                    <RefreshCw className="w-3 h-3 text-slate-500 group-hover:text-violet-400 group-hover:rotate-180 transition-all" />
                  </div>
                  <p className="text-xs font-bold text-white leading-tight line-clamp-1">{preset.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Core Info Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nome da Fórmula *</label>
              <input
                type="text"
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
                required
                placeholder="Ex: Avaliação contínua 40% + Exame 60%"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-hidden focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Descrição / Finalidade</label>
              <input
                type="text"
                value={formulaDescription}
                onChange={(e) => setFormulaDescription(e.target.value)}
                placeholder="Ex: Regulamento geral do 1º e 2º semestre..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-hidden focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Aplicar a Disciplina Específica (Opcional)</label>
              <input
                type="text"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                placeholder="Ex: Programação Web & Algoritmos (deixe em branco para geral)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-hidden focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Aplicar a Turma Específica (Opcional)</label>
              <select
                value={classGroupId}
                onChange={(e) => setClassGroupId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-hidden focus:border-violet-500"
              >
                <option value="">Todas as Turmas da Instituição</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.shift})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Criteria (Mozambique Standard 0-20 scale) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Critérios de Aprovação (Escala Moçambicana 0 a 20 Valores)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nota Mínima de Aprovação (v.)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={minPassingScore}
                  onChange={(e) => setMinPassingScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500">Padrão: 10.0 valores</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nota para Dispensa de Exame (v.)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={examExemptionScore}
                  onChange={(e) => setExamExemptionScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500">Padrão: 14.0 valores (Dispensado)</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nota Mínima para Exame de Recurso (v.)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={recourseMinScore}
                  onChange={(e) => setRecourseMinScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-500">Padrão: 7.0 a 9.9 valores</span>
              </div>
            </div>
          </div>

          {/* Components & Weights Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white block">Componentes da Fórmula &amp; Pesos (%)</label>
                <p className="text-[11px] text-slate-400">Selecione os tipos de avaliação cadastrados e defina o percentual de cada um na nota final.</p>
              </div>

              <button
                type="button"
                onClick={handleAddComponent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Componente</span>
              </button>
            </div>

            {/* Weight Progress Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Soma dos Pesos:</span>
                <span className={`font-mono font-black ${isWeightValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {totalWeight}% {isWeightValid ? '(Válido: 100%)' : `(Diferença: ${100 - totalWeight > 0 ? `+${100 - totalWeight}%` : `${100 - totalWeight}%`})`}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                {components.map((c, i) => {
                  const meta = ASSESSMENT_TYPE_METADATA[c.type];
                  return (
                    <div
                      key={c.id}
                      style={{ width: `${Math.max(0, Math.min(100, c.weight))}%` }}
                      className={`h-full ${i % 2 === 0 ? 'bg-violet-500' : 'bg-sky-500'} transition-all`}
                      title={`${c.label || meta?.label}: ${c.weight}%`}
                    />
                  );
                })}
              </div>
              {!isWeightValid && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Atenção: A soma dos pesos deve totalizar exatamente 100% para salvar a fórmula.</span>
                </div>
              )}
            </div>

            {/* Components List */}
            <div className="space-y-2.5">
              {components.map((comp, idx) => {
                const meta = ASSESSMENT_TYPE_METADATA[comp.type];
                return (
                  <div 
                    key={comp.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Tipo de Avaliação (9 tipos obrigatórios) */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Tipo de Avaliação *</label>
                        <select
                          value={comp.type}
                          onChange={(e) => {
                            const newType = e.target.value as AssessmentType;
                            handleUpdateComponent(comp.id, { 
                              type: newType,
                              label: ASSESSMENT_TYPE_METADATA[newType]?.label || comp.label 
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-hidden"
                        >
                          <option value="teste">teste (Teste Escrito / Teórico)</option>
                          <option value="exame">exame (Exame Normal / Semestral)</option>
                          <option value="trabalho">trabalho (Trabalho Individual / Grupo)</option>
                          <option value="projeto">projeto (Projeto Integrador / Prático)</option>
                          <option value="pratica">prática (Avaliação Prática / Lab)</option>
                          <option value="participacao">participação (Participação &amp; Presença)</option>
                          <option value="avaliacao_continua">avaliação contínua (AC)</option>
                          <option value="prova_final">prova final (Prova Global)</option>
                          <option value="defesa">defesa (Defesa / Apresentação Oral)</option>
                        </select>
                      </div>

                      {/* Nome Personalizado */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Rótulo / Nome no Boletim</label>
                        <input
                          type="text"
                          value={comp.label}
                          onChange={(e) => handleUpdateComponent(comp.id, { label: e.target.value })}
                          placeholder={meta?.label || 'Nome do componente'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      {/* Peso % */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Peso Percentual (%) *</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={comp.weight}
                            onChange={(e) => handleUpdateComponent(comp.id, { weight: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
                          />
                          <span className="text-xs font-mono text-slate-400">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Component Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(comp.id)}
                      disabled={components.length <= 1}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer self-end sm:self-center"
                      title="Remover componente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Make Default Checkbox */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <input
              type="checkbox"
              id="isDefaultFormula"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded-md accent-violet-600 cursor-pointer"
            />
            <label htmlFor="isDefaultFormula" className="text-xs text-slate-300 font-medium cursor-pointer">
              Definir esta fórmula como <strong>fórmula de cálculo padrão</strong> para todas as turmas e pautas da instituição
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isWeightValid}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Fórmula no Motor</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Registered Formulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calculationFormulas.map((formula) => {
          return (
            <div
              key={formula.id}
              className={`p-5 rounded-3xl bg-slate-900 border transition-all space-y-4 ${
                formula.isDefault ? 'border-violet-500/50 shadow-lg shadow-violet-500/5' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">{formula.name}</h3>
                    {formula.isDefault && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                        <Star className="w-3 h-3 fill-violet-400" />
                        <span>Fórmula Padrão</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{formula.description}</p>
                </div>
              </div>

              {/* Formula Visual Breakdown (e.g. Avaliação contínua 40% + Exame 60%) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Expressão de Cálculo:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {formula.components.map((comp, idx) => {
                    const meta = ASSESSMENT_TYPE_METADATA[comp.type];
                    return (
                      <React.Fragment key={comp.id}>
                        <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${meta?.bg || 'bg-slate-800'} ${meta?.color || 'text-white'} ${meta?.border || 'border-slate-700'}`}>
                          <span>{comp.label || meta?.label || comp.type}</span>
                          <span className="ml-1.5 font-mono opacity-90">({comp.weight}%)</span>
                        </div>
                        {idx < formula.components.length - 1 && (
                          <span className="text-slate-500 font-bold text-xs">+</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <span className="text-slate-500 font-bold text-xs">=</span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                    Nota Final (0 a 20v)
                  </span>
                </div>
              </div>

              {/* Details & Scope */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <div>
                  <span className="text-slate-500">Aprovação: </span>
                  <span className="font-mono text-white font-bold">≥ {formula.minPassingScore}v</span>
                </div>
                <div>
                  <span className="text-slate-500">Dispensa: </span>
                  <span className="font-mono text-emerald-400 font-bold">≥ {formula.examExemptionScore}v</span>
                </div>
                <div>
                  <span className="text-slate-500">Recurso: </span>
                  <span className="font-mono text-amber-400 font-bold">≥ {formula.recourseMinScore || 7.0}v</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                {onFormulaSelected ? (
                  <button
                    type="button"
                    onClick={() => onFormulaSelected(formula.id)}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Usar na Pauta Atual</span>
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(formula)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Editar
                  </button>

                  {!formula.isDefault && (
                    <button
                      type="button"
                      onClick={() => updateCalculationFormula(formula.id, { isDefault: true })}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
                      title="Definir como padrão"
                    >
                      Tornar Padrão
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Excluir a fórmula "${formula.name}"?`)) {
                        deleteCalculationFormula(formula.id);
                      }
                    }}
                    disabled={formula.isDefault || calculationFormulas.length <= 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                    title="Excluir fórmula"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
