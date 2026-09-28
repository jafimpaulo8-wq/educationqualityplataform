import React, { useState } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  BookOpen, 
  Award, 
  Sliders, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  AssessmentType, 
  EvaluationItem, 
  ASSESSMENT_TYPE_METADATA 
} from '../../../types';
import { useApp } from '../../../context/AppContext';

interface EvaluationListTabProps {
  onOpenGradebook: (evaluationId: string) => void;
  selectedClassGroupId?: string;
}

export const EvaluationListTab: React.FC<EvaluationListTabProps> = ({ 
  onOpenGradebook,
  selectedClassGroupId 
}) => {
  const { 
    evaluations, 
    addEvaluation, 
    updateEvaluation, 
    deleteEvaluation, 
    classes, 
    activeTeacher, 
    teachers,
    activeInstitution,
    activeBranchId,
    students
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [filterClassId, setFilterClassId] = useState<string>(selectedClassGroupId || 'todas');

  // Form State (All 8 mandatory evaluation fields + classGroupId & description)
  const [name, setName] = useState('');
  const [type, setType] = useState<AssessmentType>('teste');
  const [discipline, setDiscipline] = useState('Algoritmos & Estruturas de Dados');
  const [period, setPeriod] = useState('1º Semestre');
  const [weight, setWeight] = useState<number>(20);
  const [maxScore, setMaxScore] = useState<number>(20);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [teacher, setTeacher] = useState<string>(activeTeacher?.fullName || 'Prof. Eng. Mateus Cossa');
  const [targetClassGroupId, setTargetClassGroupId] = useState<string>(selectedClassGroupId || classes[0]?.id || '');
  const [description, setDescription] = useState('');

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setType('teste');
    setDiscipline('Algoritmos & Estruturas de Dados');
    setPeriod('1º Semestre');
    setWeight(20);
    setMaxScore(20);
    setDate(new Date().toISOString().split('T')[0]);
    setTeacher(activeTeacher?.fullName || 'Prof. Eng. Mateus Cossa');
    setTargetClassGroupId(filterClassId !== 'todas' ? filterClassId : (classes[0]?.id || ''));
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: EvaluationItem) => {
    setEditingId(item.id);
    setName(item.name);
    setType(item.type);
    setDiscipline(item.discipline);
    setPeriod(item.period);
    setWeight(item.weight);
    setMaxScore(item.maxScore);
    setDate(item.date);
    setTeacher(item.teacher);
    setTargetClassGroupId(item.classGroupId);
    setDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !discipline.trim()) return;

    if (editingId) {
      updateEvaluation(editingId, {
        name,
        type,
        discipline,
        period,
        weight: Number(weight),
        maxScore: Number(maxScore),
        date,
        teacher,
        classGroupId: targetClassGroupId,
        description
      });
    } else {
      addEvaluation({
        institutionId: activeInstitution.id,
        branchId: activeBranchId !== 'todas' ? activeBranchId : undefined,
        classGroupId: targetClassGroupId,
        name,
        type,
        discipline,
        period,
        weight: Number(weight),
        maxScore: Number(maxScore),
        date,
        teacher,
        description,
        status: 'agendada',
        scores: {}
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  // Filtered Evaluations
  const filteredEvaluations = evaluations.filter(ev => {
    if (filterClassId !== 'todas' && ev.classGroupId !== filterClassId) return false;
    if (selectedType !== 'todos' && ev.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ev.name.toLowerCase().includes(q);
      const matchDisc = ev.discipline.toLowerCase().includes(q);
      const matchTeacher = ev.teacher.toLowerCase().includes(q);
      if (!matchName && !matchDisc && !matchTeacher) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with quick creation and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Gerenciador de Avaliações Registradas
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Cada avaliação contempla: <strong>nome, disciplina, período, peso, nota máxima, nota obtida, data e professor</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Avaliação</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por avaliação, disciplina ou docente..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Filter Turma */}
        <select
          value={filterClassId}
          onChange={(e) => setFilterClassId(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs cursor-pointer focus:outline-hidden"
        >
          <option value="todas">Todas as Turmas</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Filter Tipos (9 Tipos Oficiais) */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs cursor-pointer focus:outline-hidden font-medium"
        >
          <option value="todos">Todos os Tipos de Avaliação</option>
          <option value="teste">teste</option>
          <option value="exame">exame</option>
          <option value="trabalho">trabalho</option>
          <option value="projeto">projeto</option>
          <option value="pratica">prática</option>
          <option value="participacao">participação</option>
          <option value="avaliacao_continua">avaliação contínua</option>
          <option value="prova_final">prova final</option>
          <option value="defesa">defesa</option>
        </select>
      </div>

      {/* Evaluations Cards Grid */}
      {filteredEvaluations.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhuma avaliação encontrada</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Não foram encontradas avaliações para os filtros selecionados. Clique no botão acima para cadastrar a primeira avaliação.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvaluations.map((item) => {
            const meta = ASSESSMENT_TYPE_METADATA[item.type];
            const targetClass = classes.find(c => c.id === item.classGroupId);
            const classStudents = students.filter(s => s.classGroupId === item.classGroupId);
            const gradedCount = Object.keys(item.scores || {}).length;
            const totalClassStudents = classStudents.length || 1;

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border uppercase tracking-wider ${meta?.bg || 'bg-slate-800'} ${meta?.color || 'text-white'} ${meta?.border || 'border-slate-700'}`}>
                      {meta?.label || item.type}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                      Peso: <strong>{item.weight}%</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-semibold text-slate-300">{item.discipline}</span>
                  </p>
                </div>

                {/* Specific 8 Fields Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Período:</span>
                    <span className="text-slate-300 font-medium">{item.period}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Nota Máxima:</span>
                    <span className="text-white font-mono font-bold">{item.maxScore} valores</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Data de Realização:</span>
                    <span className="text-slate-300 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {item.date}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Turma:</span>
                    <span className="text-slate-300 font-medium truncate block">{targetClass?.name || 'Geral'}</span>
                  </div>

                  <div className="col-span-2 pt-1 border-t border-slate-800/60">
                    <span className="text-slate-500 block">Professor Responsável:</span>
                    <span className="text-indigo-300 font-medium flex items-center gap-1">
                      <User className="w-3 h-3 text-indigo-400" />
                      {item.teacher}
                    </span>
                  </div>
                </div>

                {/* Progress of Grades Entered */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Lançamento de Notas:</span>
                    <span className="font-mono text-slate-300 font-bold">
                      {gradedCount} / {totalClassStudents} Alunos ({Math.round((gradedCount / totalClassStudents) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (gradedCount / totalClassStudents) * 100)}%` }} 
                      className={`h-full ${gradedCount === totalClassStudents ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                      title="Editar Parâmetros"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remover a avaliação "${item.name}"?`)) {
                          deleteEvaluation(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      title="Excluir Avaliação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenGradebook(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold border border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <span>Lançar Notas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Cadastro / Edição de Avaliação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingId ? 'Editar Avaliação' : 'Cadastrar Nova Avaliação'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Preencha os 8 parâmetros fundamentais da avaliação</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              {/* Nome da Avaliação */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">1. Nome da Avaliação *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: 1º Teste Escrito de Algoritmos"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Tipo e Disciplina */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    2. Tipo de Avaliação *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssessmentType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="teste">teste</option>
                    <option value="exame">exame</option>
                    <option value="trabalho">trabalho</option>
                    <option value="projeto">projeto</option>
                    <option value="pratica">prática</option>
                    <option value="participacao">participação</option>
                    <option value="avaliacao_continua">avaliação contínua</option>
                    <option value="prova_final">prova final</option>
                    <option value="defesa">defesa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">3. Disciplina / Cadeira *</label>
                  <input
                    type="text"
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    required
                    placeholder="Ex: Programação Web"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Período e Turma */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">4. Período Letivo *</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="1º Semestre">1º Semestre</option>
                    <option value="2º Semestre">2º Semestre</option>
                    <option value="1º Trimestre">1º Trimestre</option>
                    <option value="2º Trimestre">2º Trimestre</option>
                    <option value="3º Trimestre">3º Trimestre</option>
                    <option value="Módulo I">Módulo I</option>
                    <option value="Módulo II">Módulo II</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Turma Alvo *</label>
                  <select
                    value={targetClassGroupId}
                    onChange={(e) => setTargetClassGroupId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.shift})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Peso e Nota Máxima */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">5. Peso (%) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                    <span className="text-xs font-mono text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">6. Nota Máxima (Valores) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Padrão nacional: 20 valores</span>
                </div>
              </div>

              {/* Data e Professor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">7. Data da Avaliação *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">8. Professor / Docente *</label>
                  <input
                    type="text"
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    required
                    placeholder="Nome completo do docente"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Descrição Opcional */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Instruções / Conteúdos Avaliados</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Capítulos 1 a 4, complexidade computacional e matrizes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-all shadow-lg shadow-indigo-600/20"
                >
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
