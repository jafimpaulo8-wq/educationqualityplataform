import React from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  GraduationCap, 
  Users, 
  Clock, 
  Calendar, 
  Building2, 
  BookOpen, 
  Send,
  CheckCircle2,
  Layers,
  Award
} from 'lucide-react';

interface StudentCourseTurmaTabProps {
  currentStudent: Student;
  onRequestChange?: (category: string, ref: string) => void;
  mode?: 'ambos' | 'curso' | 'turma';
}

export const StudentCourseTurmaTab: React.FC<StudentCourseTurmaTabProps> = ({
  currentStudent,
  onRequestChange = () => {},
  mode = 'ambos'
}) => {
  const { students, courses, classes } = useApp();

  const currentCourse = courses.find(c => c.id === currentStudent.courseId || c.name === currentStudent.courseName);
  const currentClass = classes.find(cl => cl.id === currentStudent.classGroupId || cl.name === currentStudent.classGroupName);

  // Colegas da mesma turma
  const classmates = students.filter(s => s.classGroupId === currentStudent.classGroupId);

  return (
    <div id="student-course-turma-tab" className="space-y-6">
      
      {/* Visualização de Curso (quando mode é 'curso' ou 'ambos') */}
      {(mode === 'curso' || mode === 'ambos') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                Programa de Formação Profissional • Certificação SIVEC
              </span>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
                {currentStudent.courseName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Certificação Reconhecida com Validação SIVEC e Nível Técnico Moztechwave (Qualificação Nacional Nível 5)
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRequestChange('mudanca_turma', `Turma Atual: ${currentStudent.classGroupName}`)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
            >
              <Send className="w-3.5 h-3.5 text-slate-600" />
              <span>Solicitar Mudança de Turma / Regime</span>
            </button>
          </div>

          {/* Métricas do Curso */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Carga Horária Total</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                {(currentCourse as any)?.durationHours || currentCourse?.workloadHours || 1200} Horas
              </span>
              <span className="text-[10px] text-slate-400">Teoria + Laboratório Prático</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Duração Estimada</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                {(currentCourse as any)?.durationMonths || 12} Meses
              </span>
              <span className="text-[10px] text-slate-400">2 Semestres Letivos</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Regime de Aulas</span>
              <span className="text-lg font-bold text-emerald-700 mt-0.5 block">
                {currentStudent.regime}
              </span>
              <span className="text-[10px] text-emerald-600">Presencial + EAD Integrado</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Ano Letivo</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                2026 / 2º Semestre
              </span>
              <span className="text-[10px] text-slate-400">Em curso normal</span>
            </div>
          </div>

          {/* Módulos Curriculares do Curso */}
          {mode === 'curso' && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Matriz Curricular &amp; Competências Profissionais
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block">Módulo 1: Fundamentos &amp; Lógica</span>
                  <span className="text-[11px] text-slate-500">Algoritmos, Estruturas e Sistemas Operacionais (180h)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block">Módulo 2: Desenvolvimento Aplicado</span>
                  <span className="text-[11px] text-slate-500">APIs, Arquitetura em Nuvem e Banco de Dados (240h)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block">Módulo 3: Projeto Final &amp; Estágio</span>
                  <span className="text-[11px] text-slate-500">Estágio Profissional Supervisionado e TCC (300h)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visualização de Turma (quando mode é 'turma' ou 'ambos') */}
      {(mode === 'turma' || mode === 'ambos') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Detalhes da Turma e Sala */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Dados da Minha Turma</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Designação Oficial:</span>
                <span className="font-bold text-slate-900">{currentStudent.classGroupName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Sala Principal / Laboratório:</span>
                <span className="font-semibold text-slate-900">{currentClass?.room || 'Laboratório Tech 1'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Turno &amp; Horário:</span>
                <span className="font-semibold text-slate-900">{currentClass?.shift || currentStudent.regime}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Total de Alunos Matriculados:</span>
                <span className="font-bold text-emerald-700">{classmates.length} Alunos</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Delegado(a) da Turma:</span>
                <span className="font-semibold text-slate-900">Arnaldo Mabunda (Eleito)</span>
              </div>
            </div>
          </div>

          {/* Lista de Colegas da Turma */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Colegas da Turma ({classmates.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Turma Ativa 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {classmates.map(colleague => {
                const isCurrent = colleague.id === currentStudent.id;
                return (
                  <div
                    key={colleague.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      isCurrent
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={colleague.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={colleague.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {colleague.fullName}
                        </p>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-bold">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{colleague.code}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
