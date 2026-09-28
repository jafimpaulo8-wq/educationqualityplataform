import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Video, 
  Building2, 
  CheckCircle2, 
  CalendarDays,
  Sparkles
} from 'lucide-react';

interface StudentScheduleTabProps {
  currentStudent: Student;
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Segunda-feira', short: 'SEG' },
  { id: 2, name: 'Terça-feira', short: 'TER' },
  { id: 3, name: 'Quarta-feira', short: 'QUA' },
  { id: 4, name: 'Quinta-feira', short: 'QUI' },
  { id: 5, name: 'Sexta-feira', short: 'SEX' },
  { id: 6, name: 'Sábado', short: 'SÁB' }
];

export const StudentScheduleTab: React.FC<StudentScheduleTabProps> = ({ currentStudent }) => {
  const { allSchedules } = useApp();
  const [selectedDay, setSelectedDay] = useState<number>(1); // Segunda por padrão

  // Filtrar horários da turma do aluno
  const classSchedules = allSchedules.filter(s => 
    s.classGroupId === currentStudent.classGroupId || 
    s.classGroupName === currentStudent.classGroupName
  );

  // Fallback caso a turma ainda não tenha horários cadastrados
  const effectiveSchedules = classSchedules.length > 0 ? classSchedules : [
    {
      id: 'sch-fb-1',
      institutionId: 'inst-1',
      classGroupId: currentStudent.classGroupId,
      classGroupName: currentStudent.classGroupName,
      courseId: currentStudent.courseId,
      courseName: currentStudent.courseName,
      disciplineId: 'mod-1',
      disciplineName: 'Algoritmos & Estruturas de Dados Avançadas',
      teacherName: 'Eng. Arone Malendza',
      room: 'Laboratório Tech 1',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '10:00',
      durationMinutes: 120,
      status: 'Agendada',
      recurrence: 'semanal',
      color: '#059669',
      notes: 'Aulas teóricas e práticas com exercícios no terminal Linux e VS Code.',
      createdAt: '2026-02-15 08:00'
    },
    {
      id: 'sch-fb-2',
      institutionId: 'inst-1',
      classGroupId: currentStudent.classGroupId,
      classGroupName: currentStudent.classGroupName,
      courseId: currentStudent.courseId,
      courseName: currentStudent.courseName,
      disciplineId: 'mod-2',
      disciplineName: 'Arquitetura de Software & Microsserviços',
      teacherName: 'Eng. Carlos Manuel',
      room: 'Laboratório Tech 2',
      dayOfWeek: 2,
      startTime: '10:15',
      endTime: '12:15',
      durationMinutes: 120,
      status: 'Agendada',
      recurrence: 'semanal',
      color: '#3b82f6',
      notes: 'Projetos modulares em Docker e Node.js.',
      createdAt: '2026-02-15 08:00'
    },
    {
      id: 'sch-fb-3',
      institutionId: 'inst-1',
      classGroupId: currentStudent.classGroupId,
      classGroupName: currentStudent.classGroupName,
      courseId: currentStudent.courseId,
      courseName: currentStudent.courseName,
      disciplineId: 'mod-3',
      disciplineName: 'Engenharia de Dados & Modelagem SQL / NoSQL',
      teacherName: 'Dra. Amina Abdul',
      room: 'Sala de Teoria 04',
      dayOfWeek: 3,
      startTime: '08:00',
      endTime: '10:00',
      durationMinutes: 120,
      status: 'Agendada',
      recurrence: 'semanal',
      color: '#8b5cf6',
      notes: 'Consultas complexas e otimização de índices no PostgreSQL.',
      createdAt: '2026-02-15 08:00'
    },
    {
      id: 'sch-fb-4',
      institutionId: 'inst-1',
      classGroupId: currentStudent.classGroupId,
      classGroupName: currentStudent.classGroupName,
      courseId: currentStudent.courseId,
      courseName: currentStudent.courseName,
      disciplineId: 'mod-4',
      disciplineName: 'Desenvolvimento Frontend React & TypeScript',
      teacherName: 'Eng. Carlos Manuel',
      room: 'Laboratório Tech 1',
      dayOfWeek: 4,
      startTime: '10:15',
      endTime: '12:15',
      durationMinutes: 120,
      status: 'Agendada',
      recurrence: 'semanal',
      color: '#0284c7',
      notes: 'Construção de SPAs dinâmicas com Tailwind e gerenciamento de estado.',
      createdAt: '2026-02-15 08:00'
    },
    {
      id: 'sch-fb-5',
      institutionId: 'inst-1',
      classGroupId: currentStudent.classGroupId,
      classGroupName: currentStudent.classGroupName,
      courseId: currentStudent.courseId,
      courseName: currentStudent.courseName,
      disciplineId: 'mod-5',
      disciplineName: 'Oficina de Projetos Integradores & Avaliação',
      teacherName: 'Eng. Arone Malendza',
      room: 'Laboratório Tech 1',
      dayOfWeek: 5,
      startTime: '08:00',
      endTime: '11:00',
      durationMinutes: 180,
      status: 'Agendada',
      recurrence: 'semanal',
      color: '#d97706',
      notes: 'Acompanhamento do projeto prático de fim de semestre.',
      createdAt: '2026-02-15 08:00'
    }
  ];

  const daySchedules = effectiveSchedules.filter(s => s.dayOfWeek === selectedDay);

  return (
    <div id="student-schedule-tab" className="space-y-6">
      
      {/* Header do Horário */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Grade Semanal de Aulas
            </span>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-emerald-600" />
              Horário Oficial de Aulas
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Turma: <span className="font-semibold text-slate-800">{currentStudent.classGroupName}</span> • {currentStudent.regime}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600">Semestre 2026 / 2</span>
          </div>
        </div>

        {/* Seletor dos Dias da Semana */}
        <div className="flex items-center gap-2 pt-6 overflow-x-auto pb-2">
          {DAYS_OF_WEEK.map(day => {
            const countForDay = effectiveSchedules.filter(s => s.dayOfWeek === day.id).length;
            const isSelected = selectedDay === day.id;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDay(day.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{day.name}</span>
                {countForDay > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {countForDay}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Aulas do Dia Selecionado */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-semibold text-slate-700">
            Aulas agendadas para {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name}:
          </span>
          <span>{daySchedules.length} bloco(s) de aula</span>
        </div>

        {daySchedules.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Sem aulas agendadas neste dia</p>
            <p className="text-xs text-slate-400">Aproveite para realizar revisões ou adiantar os trabalhos práticos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daySchedules.map(slot => (
              <div
                key={slot.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold rounded">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{slot.disciplineName}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium shrink-0">
                    {slot.durationMinutes} min
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{slot.teacherName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{slot.room}</span>
                  </div>
                </div>

                {slot.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {slot.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grade Semanal Completa em Formato de Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          Visão Geral da Semana Completa
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="p-3 border-r border-slate-200">Horário</th>
                {DAYS_OF_WEEK.map(d => (
                  <th key={d.id} className="p-3 border-r border-slate-200 last:border-r-0 min-w-[150px]">
                    {d.short} - {d.name.split('-')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {['08:00 - 10:00', '10:15 - 12:15', '13:00 - 15:00', '15:15 - 17:15', '18:00 - 20:00'].map(timeRange => (
                <tr key={timeRange} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-slate-700 bg-slate-50/40 border-r border-slate-200 whitespace-nowrap">
                    {timeRange}
                  </td>
                  {DAYS_OF_WEEK.map(d => {
                    const startSlot = timeRange.split(' - ')[0];
                    const slot = effectiveSchedules.find(s => s.dayOfWeek === d.id && s.startTime === startSlot);

                    return (
                      <td key={d.id} className="p-2.5 border-r border-slate-200 last:border-r-0 align-top">
                        {slot ? (
                          <div className="p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-lg space-y-1">
                            <p className="font-bold text-emerald-950 line-clamp-2 leading-tight">
                              {slot.disciplineName}
                            </p>
                            <p className="text-[10px] text-emerald-800 font-medium">{slot.room}</p>
                            <p className="text-[10px] text-slate-500 truncate">{slot.teacherName}</p>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-center block">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
