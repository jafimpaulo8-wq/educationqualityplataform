import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  BookOpen, 
  DoorOpen, 
  Clock, 
  Calendar, 
  Users, 
  UserCheck, 
  Activity,
  Layers,
  GraduationCap
} from 'lucide-react';
import { ClassGroup, Student, Course } from '../../types';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<ClassGroup, 'id' | 'institutionId'>) => void;
  initialClass?: ClassGroup | null;
  courses: Course[];
  availableStudents: Student[];
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClass,
  courses,
  availableStudents
}) => {
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [period, setPeriod] = useState('1º Semestre 2026');
  const [schedule, setSchedule] = useState('08:00 - 12:00');
  const [room, setRoom] = useState('Laboratório Tech 1');
  const [teacherName, setTeacherName] = useState('');
  const [capacity, setCapacity] = useState<number>(25);
  const [shift, setShift] = useState<ClassGroup['shift']>('Manhã');
  const [status, setStatus] = useState<ClassGroup['status']>('Em Curso');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    if (initialClass) {
      setName(initialClass.name);
      setCourseId(initialClass.courseId);
      setPeriod(initialClass.period || '1º Semestre 2026');
      setSchedule(initialClass.schedule || '08:00 - 12:00');
      setRoom(initialClass.room);
      setTeacherName(initialClass.teacherName);
      setCapacity(initialClass.capacity || 25);
      setShift(initialClass.shift);
      setStatus(initialClass.status);
      setStartDate(initialClass.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(initialClass.endDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setSelectedStudentIds(initialClass.studentIds || []);
    } else {
      setName('');
      setCourseId(courses[0]?.id || '');
      setPeriod('1º Semestre 2026');
      setSchedule('08:00 - 12:00');
      setRoom('Laboratório Tech 1');
      setTeacherName('');
      setCapacity(25);
      setShift('Manhã');
      setStatus('Em Curso');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setSelectedStudentIds([]);
    }
  }, [initialClass, courses, isOpen]);

  if (!isOpen) return null;

  const handleCourseChange = (selectedCourseId: string) => {
    setCourseId(selectedCourseId);
    const crs = courses.find(c => c.id === selectedCourseId);
    if (crs && !name) {
      const code = crs.code || crs.name.substring(0, 4).toUpperCase();
      setName(`${code}-2026-T1`);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      }
      if (prev.length >= capacity) {
        return prev;
      }
      return [...prev, studentId];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !courseId) return;

    const currentCourse = courses.find(c => c.id === courseId);

    onSave({
      name: name.trim(),
      courseId,
      courseName: currentCourse?.name || 'Curso Técnico',
      period,
      schedule,
      room: room.trim(),
      teacherName: teacherName.trim() || 'A definir',
      capacity: Number(capacity) || 25,
      studentIds: selectedStudentIds,
      shift,
      status,
      startDate,
      endDate
    });

    onClose();
  };

  const filteredCandidates = availableStudents.filter(s => {
    const q = studentSearch.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100/80 text-blue-700 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialClass ? 'Editar Turma' : 'Criar Nova Turma'}
              </h2>
              <p className="text-xs text-slate-500">
                Defina dados acadêmicos, capacidade, horário, sala e formador titular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Nome da Turma & Curso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nome da Turma <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: ENG-DEV-2026-T1"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Curso <span className="text-rose-500">*</span>
              </label>
              <select
                value={courseId}
                onChange={e => handleCourseChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="" disabled>Selecione um curso...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code || c.modality})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Período Letivo & Horário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Período / Regime
              </label>
              <input
                type="text"
                list="period-options"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                placeholder="Ex: 1º Semestre 2026, Trimestral, Módulo I"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="period-options">
                <option value="1º Trimestre 2026" />
                <option value="2º Trimestre 2026" />
                <option value="1º Semestre 2026" />
                <option value="2º Semestre 2026" />
                <option value="Anual 2026" />
                <option value="Módulo I" />
                <option value="Módulo II" />
                <option value="Etapa 1" />
              </datalist>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Horário das Aulas
              </label>
              <input
                type="text"
                list="schedule-options"
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                placeholder="Ex: 08:00 - 12:00"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <datalist id="schedule-options">
                <option value="08:00 - 12:00" />
                <option value="08:00 - 10:00" />
                <option value="10:15 - 12:15" />
                <option value="13:30 - 17:30" />
                <option value="18:00 - 21:30 (Pós-laboral)" />
                <option value="Sábados 08:00 - 15:00" />
              </datalist>
            </div>
          </div>

          {/* Row 3: Sala / Laboratório & Formador / Professor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                Sala / Laboratório
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="Ex: Laboratório Tech 1"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                Professor / Formador Titular
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                placeholder="Ex: Prof. Américo Matsinhe"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Capacidade, Turno & Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Capacidade Máxima (Vagas)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={capacity}
                onChange={e => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Turno
              </label>
              <select
                value={shift}
                onChange={e => setShift(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite (Pós-Laboral)">Noite (Pós-Laboral)</option>
                <option value="Sábado">Sábado</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                Estado da Turma
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Planejada">Planejada</option>
                <option value="Inscrições Abertas">Inscrições Abertas</option>
                <option value="Em Curso">Em Curso</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Row 5: Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data de Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data Prevista de Término
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Alunos Selecionados / Associação Inicial */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  Alunos Matriculados ({selectedStudentIds.length} / {capacity} vagas)
                </label>
                <p className="text-[11px] text-slate-500">
                  Selecione alunos ativos para compor a turma imediatamente
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                selectedStudentIds.length >= capacity 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {selectedStudentIds.length >= capacity ? 'Lotação Máxima' : `${capacity - selectedStudentIds.length} vagas livres`}
              </span>
            </div>

            <input
              type="text"
              placeholder="Buscar aluno por nome ou código..."
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />

            <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
              {filteredCandidates.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Nenhum aluno encontrado</p>
              ) : (
                filteredCandidates.map(student => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  const isFull = !isSelected && selectedStudentIds.length >= capacity;

                  return (
                    <div
                      key={student.id}
                      onClick={() => !isFull && toggleStudent(student.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border border-blue-200 text-blue-900 font-medium' 
                          : isFull 
                            ? 'opacity-40 cursor-not-allowed bg-white' 
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isFull}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                        <div>
                          <p className="font-semibold">{student.fullName}</p>
                          <p className="text-[10px] text-slate-400">Cód: {student.code} • {student.courseName}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {student.classGroupName || 'Sem Turma'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {initialClass ? 'Salvar Alterações' : 'Criar Turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
