import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Layers,
  Calculator,
  Search,
  FileSpreadsheet
} from 'lucide-react';

interface StudentDisciplinesTabProps {
  currentStudent: Student;
  onNavigateToNotas?: () => void;
}

export interface DisciplineGradeRecord {
  id: string;
  name: string;
  code: string;
  teacher: string;
  hours: number;
  credits: number;
  t1: number;       // 30%
  trabalho: number; // 30%
  exame: number;    // 40%
  finalGrade: number; // T1*0.3 + Trabalho*0.3 + Exame*0.4
  status: 'Aprovado' | 'Em curso' | 'Exame de Recorrência' | 'Reprovado';
}

export const StudentDisciplinesTab: React.FC<StudentDisciplinesTabProps> = ({ 
  currentStudent,
  onNavigateToNotas
}) => {
  const { courses } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Encontrar curso do aluno para extrair disciplinas reais se houver
  const studentCourse = courses.find(c => c.id === currentStudent.courseId || c.name === currentStudent.courseName);

  // Lista de disciplinas do estudante com as notas e fórmula oficial: T1 (30%) + Trab (30%) + Exame (40%)
  const disciplinesData: DisciplineGradeRecord[] = React.useMemo(() => {
    // Caso o estudante possua disciplinas configuradas ou avaliações
    const baseDisciplines = [
      {
        id: 'disc-1',
        name: 'Informática Aplicada & Redes',
        code: 'INF-101',
        teacher: 'Dr. Arnaldo Silva',
        hours: 60,
        credits: 4,
        t1: 15.5,
        trabalho: 16.0,
        exame: 16.5,
      },
      {
        id: 'disc-2',
        name: 'Inglês Técnico para Negócios',
        code: 'ING-102',
        teacher: 'Dra. Luísa Costa',
        hours: 45,
        credits: 3,
        t1: 13.0,
        trabalho: 14.5,
        exame: 14.5,
      },
      {
        id: 'disc-3',
        name: 'Matemática Financeira & Lógica',
        code: 'MAT-103',
        teacher: 'Prof. João Matusse',
        hours: 60,
        credits: 4,
        t1: 11.0,
        trabalho: 12.0,
        exame: 13.0,
      },
      {
        id: 'disc-4',
        name: 'Programação de Sistemas & Banco de Dados',
        code: 'PRG-104',
        teacher: 'Eng. Carlos Tembe',
        hours: 90,
        credits: 6,
        t1: 16.0,
        trabalho: 15.0,
        exame: 14.5,
      },
      {
        id: 'disc-5',
        name: 'Gestão de Sistemas de Informação',
        code: 'GSI-105',
        teacher: 'Dra. Amina Abdul',
        hours: 45,
        credits: 3,
        t1: 14.0,
        trabalho: 13.5,
        exame: 13.0,
      },
      {
        id: 'disc-6',
        name: 'Cibersegurança & Auditoria Digital',
        code: 'SEG-106',
        teacher: 'Eng. Mateus Nhaca',
        hours: 60,
        credits: 4,
        t1: 14.5,
        trabalho: 14.0,
        exame: 13.5,
      }
    ];

    return baseDisciplines.map(d => {
      // Fórmula oficial: T1 × 30% + Trab × 30% + Exame × 40%
      const finalGrade = Number(((d.t1 * 0.3) + (d.trabalho * 0.3) + (d.exame * 0.4)).toFixed(1));
      let status: 'Aprovado' | 'Em curso' | 'Exame de Recorrência' | 'Reprovado' = 'Aprovado';
      if (finalGrade >= 10) {
        status = 'Aprovado';
      } else if (finalGrade >= 8) {
        status = 'Exame de Recorrência';
      } else {
        status = 'Reprovado';
      }

      return {
        ...d,
        finalGrade,
        status
      };
    });
  }, [currentStudent]);

  const filteredDisciplines = disciplinesData.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageAll = Number(
    (disciplinesData.reduce((acc, d) => acc + d.finalGrade, 0) / disciplinesData.length).toFixed(1)
  );

  return (
    <div id="student-disciplines-tab" className="space-y-6">
      
      {/* Top Banner with Official Formula */}
      <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Pauta Individual do Semestre
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {currentStudent.courseName}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-sky-400" />
              Minhas Disciplinas em Curso
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Acompanhamento pormenorizado do seu desempenho com cálculo ponderado oficial: Teste 1 (30%), Trabalho Teórico-Prático (30%) e Exame Final (40%).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-blue-400/30 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Média Geral Ponderada</span>
              <span className="text-3xl font-black text-amber-400 font-mono leading-tight">{averageAll}</span>
              <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">/ 20 Valores</span>
            </div>
            <div className="border-l border-slate-800 pl-4 space-y-1 text-xs">
              <div className="text-slate-300">Disciplinas: <strong className="text-white">{disciplinesData.length}</strong></div>
              <div className="text-emerald-400 font-semibold">Situação: Aprovado</div>
            </div>
          </div>
        </div>

        {/* Formula breakdown bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Fórmula de Cálculo:</span>
            <strong className="text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              Média Final = (T1 × 30%) + (Trab × 30%) + (Exame × 40%)
            </strong>
          </div>

          {onNavigateToNotas && (
            <button
              type="button"
              onClick={onNavigateToNotas}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ver Pauta Geral Completa →</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por disciplina ou professor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Mostrando <strong>{filteredDisciplines.length}</strong> de {disciplinesData.length} cadeiras</span>
        </div>
      </div>

      {/* Grid of Disciplines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDisciplines.map((d) => {
          const percentScore = Math.min(100, Math.round((d.finalGrade / 20) * 100));
          const isHighGrade = d.finalGrade >= 14;

          return (
            <div 
              key={d.id} 
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      {d.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{d.hours} Horas ({d.credits} Créditos)</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 truncate" title={d.name}>
                    {d.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Docente: <strong>{d.teacher}</strong></span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                    isHighGrade 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : d.finalGrade >= 10 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {d.finalGrade.toFixed(1)} / 20
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-400 mt-1 capitalize">
                    {d.status}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown: T1 (30%) | Trabalho (30%) | Exame (40%) */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-center font-mono">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">T1 (30%)</span>
                  <span className="text-xs font-bold text-slate-800">{d.t1.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-400 block font-sans">ponderado: {(d.t1 * 0.3).toFixed(2)}</span>
                </div>
                <div className="space-y-0.5 border-x border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Trab (30%)</span>
                  <span className="text-xs font-bold text-slate-800">{d.trabalho.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-400 block font-sans">ponderado: {(d.trabalho * 0.3).toFixed(2)}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Exame (40%)</span>
                  <span className="text-xs font-bold text-slate-800">{d.exame.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-400 block font-sans">ponderado: {(d.exame * 0.4).toFixed(2)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Aproveitamento</span>
                  <span className="font-bold text-slate-800 font-mono">{percentScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighGrade 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                        : d.finalGrade >= 10 
                          ? 'bg-gradient-to-r from-blue-500 to-sky-400' 
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${percentScore}%` }}
                  />
                </div>
              </div>

              {/* Footer status notice */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Regularizada em Diário
                </span>
                <span className="text-slate-400">Escala 0 - 20</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
