import React from 'react';
import { Student } from '../../../types';
import { 
  ShieldCheck, 
  Search, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  GraduationCap,
  Calendar,
  Building2,
  Lock
} from 'lucide-react';

interface StudentHeaderProps {
  currentStudent: Student;
  allStudents: Student[];
  onSelectStudent: (student: Student) => void;
  onRequestSecretariat: (category?: string, referenceInfo?: string) => void;
  pendingRequestsCount: number;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  currentStudent,
  allStudents,
  onSelectStudent,
  onRequestSecretariat,
  pendingRequestsCount
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);

  const filteredStudents = allStudents.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="student-portal-header" className="space-y-4">
      {/* Top Banner do Portal do Aluno */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Dados do Aluno */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={currentStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={currentStudent.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold tracking-wide">
                  MÓDULO 79 • EXPERIÊNCIA DO ALUNO
                </span>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full text-xs font-mono font-medium">
                  {currentStudent.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  currentStudent.status === 'Ativo' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  ● Matrícula {currentStudent.status}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentStudent.fullName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                  <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                  {currentStudent.courseName}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-medium">
                  Turma: {currentStudent.classGroupName} ({currentStudent.regime})
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-mono">
                  {currentStudent.documentType}: {currentStudent.documentNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Ações Rápidas: Alternar Aluno & Solicitar à Secretaria */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:border-l lg:border-slate-800 lg:pl-6">
            
            {/* Seletor / Pesquisa Rápida de Aluno */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus-within:ring-2 focus-within:ring-emerald-500">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Trocar Aluno (Nome / BI / Código)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="bg-transparent text-white placeholder-slate-400 text-xs focus:outline-none w-48 sm:w-56"
                />
              </div>

              {showDropdown && searchQuery.trim() !== '' && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                  {filteredStudents.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      Nenhum estudante encontrado com esse dado.
                    </div>
                  ) : (
                    filteredStudents.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          onSelectStudent(student);
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left p-3 hover:bg-slate-800 transition flex items-center gap-3 ${
                          student.id === currentStudent.id ? 'bg-emerald-950/40 text-emerald-300' : 'text-slate-200'
                        }`}
                      >
                        <img
                          src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                          alt={student.fullName}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{student.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{student.code} • {student.documentNumber}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Botão de Solicitação à Secretaria */}
            <button
              type="button"
              onClick={() => onRequestSecretariat()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Solicitar à Secretaria</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-emerald-900 rounded-full text-[10px] font-black">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Barra de Status e Indicadores de Proteção */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Média Geral:</span>
              <span className="font-bold text-emerald-400">{currentStudent.averageGrade} / 20 Valores</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Assiduidade:</span>
              <span className="font-bold text-white">{currentStudent.attendancePercentage}%</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Propinas:</span>
              <span className={`font-bold ${currentStudent.paymentStatus === 'Pago' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentStudent.paymentStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Dados administrativos, notas, frequência e certificados protegidos (somente leitura).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
