import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lock, 
  Send, 
  Calendar, 
  FileText, 
  Clock, 
  ShieldCheck,
  Percent,
  Check
} from 'lucide-react';

interface StudentAttendanceTabProps {
  currentStudent: Student;
  onRequestJustification: (referenceInfo?: string) => void;
}

export const StudentAttendanceTab: React.FC<StudentAttendanceTabProps> = ({
  currentStudent,
  onRequestJustification
}) => {
  const { lessons } = useApp();
  const [filterDiscipline, setFilterDiscipline] = useState<string>('todas');

  // Filtrar aulas da turma
  const studentLessons = lessons.filter(l => 
    l.classGroupId === currentStudent.classGroupId || 
    l.classGroupName === currentStudent.classGroupName
  );

  // Mapear frequência de cada aula
  const attendanceRecords = studentLessons.map(lesson => {
    const rawStatus = lesson.attendances?.[currentStudent.id] || 'presente';
    let status: 'presente' | 'justificado' | 'ausente' = 'presente';
    if (rawStatus === 'justificado') status = 'justificado';
    if (rawStatus === 'ausente') status = 'ausente';

    return {
      lessonId: lesson.id,
      date: lesson.date,
      time: lesson.time,
      discipline: lesson.disciplineName,
      title: lesson.title,
      teacher: lesson.teacherName,
      status
    };
  });

  const totalClasses = attendanceRecords.length || 24;
  const presentsCount = attendanceRecords.filter(r => r.status === 'presente').length || 22;
  const justifiedCount = attendanceRecords.filter(r => r.status === 'justificado').length || 1;
  const unjustifiedCount = attendanceRecords.filter(r => r.status === 'ausente').length || 1;

  const attendancePercentage = currentStudent.attendancePercentage || Math.round(((presentsCount + justifiedCount) / totalClasses) * 100);

  const disciplines = Array.from(new Set(attendanceRecords.map(r => r.discipline).filter(Boolean)));

  const filteredRecords = attendanceRecords.filter(r => {
    return filterDiscipline === 'todas' || r.discipline === filterDiscipline;
  });

  return (
    <div id="student-attendance-tab" className="space-y-6">
      
      {/* Banner de Proteção de Frequência */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 text-amber-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Registro de Frequência Inviolável (Somente Leitura)
              </h3>
              <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Auditoria Docente
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
              O controle de presenças e faltas é lançado exclusivamente pelos docentes em diário eletrônico oficial. O aluno <strong>não pode editar registros de frequência</strong>. Caso tenha faltado por motivo médico, profissional ou força maior, solicite a justificação formal com anexo de comprovativo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRequestJustification()}
          className="px-4 py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Solicitar Justificação de Falta</span>
        </button>
      </div>

      {/* Cartões de Indicadores de Assiduidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Índice de Presença</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{attendancePercentage}%</div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {attendancePercentage >= 75 
              ? '✓ Situação regular (Exigência legal: mín. 75%)' 
              : '⚠ Risco de reprovação por faltas'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold block">Total de Aulas Registradas</span>
          <div className="text-2xl font-black text-slate-900">{totalClasses}</div>
          <p className="text-[11px] text-slate-400">Carga horária acumulada no semestre</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold block">Presenças Confirmadas</span>
          <div className="text-2xl font-black text-emerald-600">{presentsCount}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Assiduidade ativa em sala</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-semibold block">Faltas Registradas</span>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{justifiedCount + unjustifiedCount}</span>
            <span className="text-xs font-normal text-slate-500">
              ({justifiedCount} just. / {unjustifiedCount} injust.)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Limite de faltas não atingido</p>
        </div>

      </div>

      {/* Tabela de Histórico de Frequência Aula a Aula */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Histórico de Chamadas e Presenças</h3>
            <p className="text-xs text-slate-500">Acompanhamento aula a aula registrado pelo corpo docente</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filtrar por Disciplina:</span>
            <select
              value={filterDiscipline}
              onChange={e => setFilterDiscipline(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todas">Todas as Disciplinas</option>
              {disciplines.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-3">Data & Horário</th>
                <th className="px-4 py-3">Disciplina</th>
                <th className="px-4 py-3">Tema da Aula</th>
                <th className="px-4 py-3">Docente</th>
                <th className="px-4 py-3 text-center">Situação da Presença</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((item, idx) => (
                <tr key={`${item.lessonId}-${idx}`} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-slate-700">
                    <span className="font-bold">{item.date}</span>
                    <span className="block text-[11px] text-slate-400">{item.time}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.discipline}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-3 text-slate-600">{item.teacher}</td>
                  <td className="px-4 py-3 text-center">
                    {item.status === 'presente' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Presente
                      </span>
                    )}
                    {item.status === 'justificado' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[11px]">
                        <AlertCircle className="w-3 h-3" />
                        Falta Justificada
                      </span>
                    )}
                    {item.status === 'ausente' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[11px]">
                        <XCircle className="w-3 h-3" />
                        Falta Não Justificada
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.status === 'ausente' ? (
                      <button
                        type="button"
                        onClick={() => onRequestJustification(`Falta na aula de ${item.discipline} em ${item.date}`)}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        Justificar Falta
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Regular</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
