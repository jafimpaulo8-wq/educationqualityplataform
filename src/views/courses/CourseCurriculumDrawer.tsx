import React, { useState } from 'react';
import { Course, CourseModule } from '../../types';
import { 
  X, 
  BookOpen, 
  Plus, 
  Clock, 
  User, 
  Award, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  Printer, 
  ChevronRight,
  Sparkles,
  Layers,
  FileCheck,
  Check
} from 'lucide-react';
import { ModuleModal } from './ModuleModal';

interface CourseCurriculumDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onAddModule: (courseId: string, moduleData: Omit<CourseModule, 'id'>) => void;
  onUpdateModule: (courseId: string, moduleId: string, updates: Partial<CourseModule>) => void;
  onDeleteModule: (courseId: string, moduleId: string) => void;
}

export const CourseCurriculumDrawer: React.FC<CourseCurriculumDrawerProps> = ({
  isOpen,
  onClose,
  course,
  onAddModule,
  onUpdateModule,
  onDeleteModule
}) => {
  const [selectedModuleForEdit, setSelectedModuleForEdit] = useState<CourseModule | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  if (!isOpen || !course) return null;

  const modules = course.modules || [];

  // Group modules by Period
  const modulesByPeriod: { [period: string]: CourseModule[] } = {};
  modules.forEach(m => {
    const p = m.period || 'Período Regular';
    if (!modulesByPeriod[p]) {
      modulesByPeriod[p] = [];
    }
    modulesByPeriod[p].push(m);
  });

  const totalCalculatedWorkload = modules.reduce((sum, m) => sum + (Number(m.workloadHours) || 0), 0);
  const totalTheory = modules.reduce((sum, m) => sum + (Number(m.theoryHours) || 0), 0);
  const totalPractice = modules.reduce((sum, m) => sum + (Number(m.practiceHours) || 0), 0);

  const handlePrintCurriculum = () => {
    setPrintSuccess(true);
    setTimeout(() => setPrintSuccess(false), 3000);
    window.print();
  };

  const getEvaluationLabel = (type: CourseModule['evaluationType']) => {
    switch (type) {
      case 'provas_e_exame': return 'Provas + Exame Final';
      case 'avaliacao_continua': return 'Avaliação Contínua';
      case 'projeto_pratico': return 'Projeto Prático';
      case 'teste_operacional': return 'Teste Operacional em Máquina';
      case 'apenas_frequencia': return 'Apenas Frequência';
      default: return 'Avaliação Regular';
    }
  };

  return (
    <div id="drawer-curriculum-backdrop" className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div 
        id="drawer-curriculum-panel"
        className="w-full max-w-3xl bg-white shadow-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-mono font-bold text-blue-800">
                    {course.code || 'CURSO'}
                  </span>
                  <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {course.category}
                  </span>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 capitalize">
                    {course.periodType?.replace('_', ' ') || 'semestral'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{course.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matriz Curricular, Disciplinas, Cargas Horárias e Critérios de Aprovação
                </p>
              </div>
            </div>

            <button
              id="btn-close-curriculum-drawer"
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-5 grid grid-cols-4 gap-3">
            <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Disciplinas
              </span>
              <span className="text-lg font-bold text-slate-800">{modules.length}</span>
            </div>
            <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Carga Curricular
              </span>
              <span className="text-lg font-bold text-blue-600">
                {totalCalculatedWorkload > 0 ? `${totalCalculatedWorkload}h` : `${course.workloadHours || 0}h`}
              </span>
            </div>
            <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Teoria / Prática
              </span>
              <span className="text-sm font-bold text-slate-700 mt-0.5 block">
                {totalTheory}h / <span className="text-emerald-600">{totalPractice}h</span>
              </span>
            </div>
            <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Mensalidade / Preço
              </span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                {(course.monthlyFee || course.feeMonthly || 0) > 0 
                  ? `${(course.monthlyFee || course.feeMonthly).toLocaleString()} MT/mês` 
                  : `${(course.price || 0).toLocaleString()} MT Total`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              id="btn-print-curriculum"
              type="button"
              onClick={handlePrintCurriculum}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {printSuccess ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Printer className="h-3.5 w-3.5" />}
              {printSuccess ? 'Enviado para Impressão!' : 'Imprimir Matriz Curricular'}
            </button>
          </div>

          <button
            id="btn-add-module-drawer"
            type="button"
            onClick={() => {
              setSelectedModuleForEdit(null);
              setIsModuleModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Disciplina / Módulo
          </button>
        </div>

        {/* Body / List of Modules grouped by period */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          
          {Object.keys(modulesByPeriod).length === 0 ? (
            <div className="text-center py-16 px-4">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">Nenhuma disciplina cadastrada</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Este curso ainda não possui disciplinas ou módulos em sua matriz curricular. Adicione as unidades para compor a carga horária.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedModuleForEdit(null);
                  setIsModuleModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Criar Primeira Disciplina
              </button>
            </div>
          ) : (
            Object.entries(modulesByPeriod).map(([periodName, pModules]) => {
              const periodWorkload = pModules.reduce((s, m) => s + (Number(m.workloadHours) || 0), 0);
              return (
                <div key={periodName} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  {/* Period Group Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-100/70 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
                        {periodName.charAt(0)}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">{periodName}</h4>
                      <span className="text-xs text-slate-500 font-normal">
                        ({pModules.length} {pModules.length === 1 ? 'disciplina' : 'disciplinas'})
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      Total: {periodWorkload} Horas
                    </span>
                  </div>

                  {/* Modules in this period */}
                  <div className="divide-y divide-slate-100">
                    {pModules.map(mod => (
                      <div key={mod.id} className="p-4 hover:bg-slate-50/80 transition flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">
                              {mod.code}
                            </span>
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 capitalize">
                              {mod.type || 'disciplina'}
                            </span>
                            <h5 className="text-sm font-bold text-slate-900">{mod.name}</h5>
                          </div>

                          {mod.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {mod.description}
                            </p>
                          )}

                          {/* Details Badges */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {mod.workloadHours}h
                              {(mod.theoryHours !== undefined && mod.practiceHours !== undefined) && (
                                <span className="text-slate-400 font-normal">
                                  ({mod.theoryHours}h teo / {mod.practiceHours}h prát)
                                </span>
                              )}
                            </span>

                            {mod.teacherName && (
                              <span className="flex items-center gap-1 text-slate-600">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                {mod.teacherName}
                              </span>
                            )}

                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/60">
                              {getEvaluationLabel(mod.evaluationType)}
                            </span>

                            <span className="text-slate-600 text-[11px]">
                              Nota Mín: <strong className="text-slate-800">{mod.minGrade ?? 10}/20</strong>
                            </span>

                            <span className="text-slate-600 text-[11px]">
                              Freq. Mín: <strong className="text-slate-800">{mod.minAttendance ?? 75}%</strong>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 pt-1">
                          <button
                            type="button"
                            title="Editar Disciplina"
                            onClick={() => {
                              setSelectedModuleForEdit(mod);
                              setIsModuleModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Remover Disciplina"
                            onClick={() => {
                              if (confirm(`Remover a disciplina "${mod.name}" deste curso?`)) {
                                onDeleteModule(course.id, mod.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Certificação: <strong className="text-slate-700">{course.certificate || 'Padrão Oficial'}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition"
          >
            Fechar Matriz
          </button>
        </div>

      </div>

      {/* Module Add/Edit Modal */}
      {isModuleModalOpen && (
        <ModuleModal
          isOpen={isModuleModalOpen}
          onClose={() => setIsModuleModalOpen(false)}
          course={course}
          moduleToEdit={selectedModuleForEdit}
          onSave={(moduleData) => {
            if (selectedModuleForEdit) {
              onUpdateModule(course.id, selectedModuleForEdit.id, moduleData);
            } else {
              onAddModule(course.id, moduleData);
            }
          }}
        />
      )}
    </div>
  );
};
