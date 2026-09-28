import React, { useState, useEffect } from 'react';
import { Course, CourseModule, ModuleEvaluationType } from '../../types';
import { X, BookOpen, Clock, User, Award, CheckCircle2 } from 'lucide-react';

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  moduleToEdit?: CourseModule | null;
  onSave: (moduleData: Omit<CourseModule, 'id'>) => void;
}

export const ModuleModal: React.FC<ModuleModalProps> = ({
  isOpen,
  onClose,
  course,
  moduleToEdit,
  onSave
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<CourseModule['type']>('disciplina');
  const [period, setPeriod] = useState('');
  const [workloadHours, setWorkloadHours] = useState<number>(40);
  const [theoryHours, setTheoryHours] = useState<number>(15);
  const [practiceHours, setPracticeHours] = useState<number>(25);
  const [teacherName, setTeacherName] = useState('');
  const [minGrade, setMinGrade] = useState<number>(10);
  const [minAttendance, setMinAttendance] = useState<number>(75);
  const [evaluationType, setEvaluationType] = useState<ModuleEvaluationType>('provas_e_exame');
  const [description, setDescription] = useState('');

  // Suggest periods based on course.periodType
  const getPeriodOptions = () => {
    switch (course.periodType) {
      case 'trimestral':
        return ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre'];
      case 'semestral':
        return ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre'];
      case 'anual':
        return ['1º Ano', '2º Ano', 'Ano Único'];
      case 'por_modulo':
        return ['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4', 'Módulo 5', 'Módulo 6'];
      case 'por_etapa':
        return [
          'Etapa 1: Teórica & Normas',
          'Etapa 2: Simulador & Manobras',
          'Etapa 3: Campo Real & Operação',
          'Etapa 4: Estágio Supervisionado'
        ];
      case 'intensivo':
        return ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Período Intensivo Único'];
      default:
        return ['Módulo 1', 'Módulo 2', '1º Semestre', '2º Semestre'];
    }
  };

  useEffect(() => {
    if (moduleToEdit) {
      setName(moduleToEdit.name);
      setCode(moduleToEdit.code);
      setType(moduleToEdit.type || 'disciplina');
      setPeriod(moduleToEdit.period);
      setWorkloadHours(moduleToEdit.workloadHours || 40);
      setTheoryHours(moduleToEdit.theoryHours ?? 15);
      setPracticeHours(moduleToEdit.practiceHours ?? 25);
      setTeacherName(moduleToEdit.teacherName || '');
      setMinGrade(moduleToEdit.minGrade ?? 10);
      setMinAttendance(moduleToEdit.minAttendance ?? 75);
      setEvaluationType(moduleToEdit.evaluationType || 'provas_e_exame');
      setDescription(moduleToEdit.description || '');
    } else {
      const nextIndex = (course.modules?.length || 0) + 1;
      setName('');
      setCode(`${course.code || 'MOD'}-${nextIndex.toString().padStart(2, '0')}`);
      setType(course.category === 'Máquinas Pesadas' ? 'modulo' : 'disciplina');
      setPeriod(getPeriodOptions()[0] || '1º Semestre');
      setWorkloadHours(40);
      setTheoryHours(15);
      setPracticeHours(25);
      setTeacherName('');
      setMinGrade(10);
      setMinAttendance(75);
      setEvaluationType(
        course.category === 'Máquinas Pesadas' ? 'teste_operacional' : 'provas_e_exame'
      );
      setDescription('');
    }
  }, [moduleToEdit, course, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      code: code.trim() || `MOD-${Date.now().toString().slice(-4)}`,
      type,
      period: period.trim() || 'Período Regular',
      workloadHours: Number(workloadHours) || (Number(theoryHours) + Number(practiceHours)),
      theoryHours: Number(theoryHours) || 0,
      practiceHours: Number(practiceHours) || 0,
      teacherName: teacherName.trim() || 'A Definir',
      minGrade: Number(minGrade),
      minAttendance: Number(minAttendance),
      evaluationType,
      description: description.trim()
    });
    onClose();
  };

  const periodOptions = getPeriodOptions();

  return (
    <div id="modal-module-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div id="modal-module-container" className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                {moduleToEdit ? 'Editar Disciplina / Módulo' : 'Nova Disciplina / Módulo'}
              </h3>
              <p className="text-xs text-slate-500">
                Curso: <span className="font-medium text-slate-700">{course.name}</span> ({course.code || 'Sem código'})
              </p>
            </div>
          </div>
          <button
            id="btn-close-module-modal"
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          
          {/* Row 1: Nome & Código */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nome da Disciplina / Módulo *
              </label>
              <input
                id="input-module-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Eletrotécnica Geral, Manobras de Retroescavadeira, Inglês Técnico"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Código / Sigla *
              </label>
              <input
                id="input-module-code"
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ex: ELE-101, MAQ-02"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
              />
            </div>
          </div>

          {/* Row 2: Tipo & Período Letivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tipo Estrutural
              </label>
              <select
                id="select-module-type"
                value={type}
                onChange={e => setType(e.target.value as CourseModule['type'])}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
              >
                <option value="disciplina">Disciplina Teórico-Prática</option>
                <option value="modulo">Módulo Ocupacional</option>
                <option value="unidade">Unidade Curricular / Tópico</option>
                <option value="estagio_pratico">Estágio Prático / Campo / Oficina</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Período / Etapa ({course.periodType || 'configurado'})
              </label>
              <div className="flex gap-2">
                <select
                  id="select-module-period"
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
                >
                  {periodOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="outro">Outro período personalizado...</option>
                </select>
              </div>
              {period === 'outro' && (
                <input
                  type="text"
                  placeholder="Especifique o período ou fase..."
                  onChange={e => setPeriod(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                />
              )}
            </div>
          </div>

          {/* Row 3: Cargas Horárias (Total, Teórica, Prática) */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Distribuição de Carga Horária (Horas)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Carga Total (h)</label>
                <input
                  id="input-module-workload"
                  type="number"
                  min="1"
                  value={workloadHours}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setWorkloadHours(val);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Horas Teóricas</label>
                <input
                  id="input-module-theory"
                  type="number"
                  min="0"
                  value={theoryHours}
                  onChange={e => {
                    const t = Number(e.target.value);
                    setTheoryHours(t);
                    setWorkloadHours(t + practiceHours);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Horas Práticas / Campo</label>
                <input
                  id="input-module-practice"
                  type="number"
                  min="0"
                  value={practiceHours}
                  onChange={e => {
                    const p = Number(e.target.value);
                    setPracticeHours(p);
                    setWorkloadHours(theoryHours + p);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Professor & Avaliação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Professor / Formador Responsável
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="input-module-teacher"
                  type="text"
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                  placeholder="Ex: Eng. Carlos Manuel, Dra. Amina"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Método de Avaliação
              </label>
              <select
                id="select-module-evaluation"
                value={evaluationType}
                onChange={e => setEvaluationType(e.target.value as ModuleEvaluationType)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
              >
                <option value="provas_e_exame">Provas Periódicas + Exame Final</option>
                <option value="avaliacao_continua">Avaliação Contínua & Frequência</option>
                <option value="projeto_pratico">Projeto Prático / Apresentação</option>
                <option value="teste_operacional">Teste Operacional em Máquina / Oficina</option>
                <option value="apenas_frequencia">Certificado por Participação (Apenas Frequência)</option>
              </select>
            </div>
          </div>

          {/* Row 5: Nota Mínima & Frequência Mínima */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nota Mínima de Aprovação (Escala 0 a 20)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="input-module-min-grade"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={minGrade}
                  onChange={e => setMinGrade(Number(e.target.value))}
                  className="w-24 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-blue-500 outline-hidden"
                />
                <span className="text-xs text-slate-500">
                  {minGrade >= 10 ? 'Aprovado a partir de 10 Valores' : 'Abaixo de 10 é reprovação'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Frequência Mínima Exigida (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="input-module-min-attendance"
                  type="number"
                  min="50"
                  max="100"
                  value={minAttendance}
                  onChange={e => setMinAttendance(Number(e.target.value))}
                  className="w-24 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-blue-500 outline-hidden"
                />
                <span className="text-xs text-slate-500">Ex: 75% padrão IFPELAC / DINET</span>
              </div>
            </div>
          </div>

          {/* Row 6: Descrição / Ementa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Ementa & Conteúdo Programático
            </label>
            <textarea
              id="input-module-description"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva as competências a desenvolver, conteúdos abordados e pré-requisitos pedagógicos desta disciplina..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              id="btn-cancel-module"
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              id="btn-save-module"
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              {moduleToEdit ? 'Salvar Alterações' : 'Adicionar ao Curso'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
