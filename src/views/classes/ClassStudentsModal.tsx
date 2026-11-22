import React, { useState } from 'react';
import { 
  X, 
  Users, 
  ArrowRightLeft, 
  UserMinus, 
  UserPlus, 
  Search, 
  GraduationCap, 
  Clock, 
  DoorOpen,
  Award,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { Student, ClassGroup, Course, FinancialSettings } from '../../types';

export interface AllocateFinancePlanOptions {
  generatePlan: boolean;
  installmentsCount: number;
  dueDay: number;
  monthlyAmount: number;
  includeRegistrationFee: boolean;
  registrationFeeAmount: number;
}

interface ClassStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classGroup: ClassGroup | null;
  students: Student[];
  allStudents: Student[];
  courses?: Course[];
  financialSettings?: FinancialSettings;
  onTransferClick: (student: Student) => void;
  onAddStudent: (classId: string, studentId: string) => void;
  onAllocateWithFinance?: (student: Student, opts: AllocateFinancePlanOptions) => void;
  onOpenCarnet?: (student: Student) => void;
  onRemoveStudent: (classId: string, studentId: string) => void;
}

export const ClassStudentsModal: React.FC<ClassStudentsModalProps> = ({
  isOpen,
  onClose,
  classGroup,
  students,
  allStudents,
  courses = [],
  financialSettings,
  onTransferClick,
  onAddStudent,
  onAllocateWithFinance,
  onOpenCarnet,
  onRemoveStudent
}) => {
  const matchedCourse = classGroup
    ? courses.find(
        c =>
          c.id === classGroup.courseId ||
          c.name?.toLowerCase() === classGroup.courseName?.toLowerCase()
      )
    : undefined;

  const defaultMonthly = Number(matchedCourse?.monthlyFee ?? matchedCourse?.feeMonthly ?? 0);
  const defaultRegFee = Number(matchedCourse?.registrationFee ?? matchedCourse?.enrollmentFee ?? 0);
  const defaultDueDay = Number(financialSettings?.dueDay || 10);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [addSearchTerm, setAddSearchTerm] = useState('');
  const [generatePlan, setGeneratePlan] = useState(true);
  const [installmentsCount, setInstallmentsCount] = useState<number>(6);
  const [dueDay, setDueDay] = useState<number>(defaultDueDay);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(defaultMonthly);
  const [includeRegistrationFee, setIncludeRegistrationFee] = useState<boolean>(defaultRegFee > 0);
  const [registrationFeeAmount, setRegistrationFeeAmount] = useState<number>(defaultRegFee);

  React.useEffect(() => {
    if (classGroup) {
      const m = Number(matchedCourse?.monthlyFee ?? matchedCourse?.feeMonthly ?? 0);
      const r = Number(matchedCourse?.registrationFee ?? matchedCourse?.enrollmentFee ?? 0);
      const durNum = parseInt(String(matchedCourse?.duration || '').replace(/\D/g, ''), 10);
      setMonthlyAmount(m);
      setRegistrationFeeAmount(r);
      setIncludeRegistrationFee(r > 0);
      setDueDay(Number(financialSettings?.dueDay || 10));
      setInstallmentsCount(durNum > 0 && durNum <= 24 ? durNum : 6);
    }
  }, [classGroup?.id, matchedCourse?.id, financialSettings?.dueDay]);

  if (!isOpen || !classGroup) return null;

  const classStudents = students.filter(s => s.classGroupId === classGroup.id);
  const capacity = classGroup.capacity || 25;
  const occupancyPercentage = Math.round((classStudents.length / capacity) * 100);

  const filteredClassStudents = classStudents.filter(s => {
    const q = searchTerm.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  // Eligible students to add (not in this class)
  const candidateStudents = allStudents.filter(s => {
    if (s.classGroupId === classGroup.id) return false;
    const q = addSearchTerm.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {classGroup.shift}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {classGroup.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{classGroup.name}</h2>
            <p className="text-xs text-slate-500 font-medium">
              {classGroup.courseName} • Sala {classGroup.room} • {classGroup.schedule || 'Horário flexível'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Bar */}
        <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1 font-semibold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Lotação de Alunos
              </span>
              <span className={classStudents.length >= capacity ? 'text-rose-600 font-bold' : 'text-slate-900'}>
                {classStudents.length} / {capacity} matriculados ({occupancyPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  occupancyPercentage >= 100
                    ? 'bg-rose-500'
                    : occupancyPercentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setIsAddingMode(!isAddingMode)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            {isAddingMode ? 'Voltar para Lista' : 'Adicionar Aluno'}
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isAddingMode ? (
            /* Adding candidate students */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Inscrever Alunos Disponíveis na Turma
                </h3>
                <span className="text-xs text-slate-500">
                  {capacity - classStudents.length > 0
                    ? `${capacity - classStudents.length} vagas livres`
                    : 'Atenção: Turma com lotação completa'}
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar aluno por nome ou código..."
                  value={addSearchTerm}
                  onChange={e => setAddSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {onAllocateWithFinance && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={generatePlan}
                        onChange={(e) => setGeneratePlan(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        Gerar Plano Financeiro / Carnê ao Alocar
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      {generatePlan ? `${installmentsCount}x de ${monthlyAmount.toLocaleString('pt-MZ')} MT` : 'Apenas alocar na turma'}
                    </span>
                  </label>

                  {generatePlan && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-emerald-200/70">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Nº de Parcelas
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={installmentsCount}
                          onChange={(e) => setInstallmentsCount(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Dia de Vencimento
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={dueDay}
                          onChange={(e) => setDueDay(Math.max(1, Math.min(30, Number(e.target.value) || 10)))}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Mensalidade (MT - Bolsa/Desc.)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={monthlyAmount}
                          onChange={(e) => setMonthlyAmount(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-2 pt-1">
                        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeRegistrationFee}
                            onChange={(e) => setIncludeRegistrationFee(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-emerald-600"
                          />
                          <span className="font-semibold">Incluir Taxa de Matrícula / Inscrição</span>
                        </label>
                        {includeRegistrationFee && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-500">Valor (MT):</span>
                            <input
                              type="number"
                              min={0}
                              value={registrationFeeAmount}
                              onChange={(e) => setRegistrationFeeAmount(Math.max(0, Number(e.target.value) || 0))}
                              className="w-28 px-2 py-1 bg-white border border-emerald-200 rounded-lg text-xs font-bold"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="max-h-72 overflow-y-auto space-y-2">
                {candidateStudents.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    Nenhum aluno encontrado disponível para alocação.
                  </p>
                ) : (
                  candidateStudents.map(student => (
                    <div
                      key={student.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={student.fullName}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{student.fullName}</p>
                          <p className="text-[11px] text-slate-500">
                            Cód: {student.code} • Turma Atual: {student.classGroupName || 'Sem Turma'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onAllocateWithFinance) {
                            onAllocateWithFinance(student, {
                              generatePlan,
                              installmentsCount,
                              dueDay,
                              monthlyAmount,
                              includeRegistrationFee,
                              registrationFeeAmount
                            });
                          } else {
                            onAddStudent(classGroup.id, student.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {generatePlan && onAllocateWithFinance ? 'Alocar + Carnê' : 'Alocar'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Current enrolled students list */
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar entre os alunos da turma..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {filteredClassStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">Nenhum aluno matriculado nesta turma ainda.</p>
                  </div>
                ) : (
                  filteredClassStudents.map(student => (
                    <div
                      key={student.id}
                      className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={student.fullName}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{student.fullName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{student.code}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              Média: {student.averageGrade ? `${student.averageGrade} v.` : 'S/N'}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              Presença: {student.attendancePercentage || 100}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onOpenCarnet && (
                          <button
                            type="button"
                            onClick={() => onOpenCarnet(student)}
                            title="Abrir Carnê A4 deste aluno"
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Carnê A4
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onTransferClick(student)}
                          title="Transferir aluno para outra turma com histórico"
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Transferir
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveStudent(classGroup.id, student.id)}
                          title="Desvincular da turma"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-500 font-medium">
            Formador: <strong className="text-slate-800">{classGroup.teacherName}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
