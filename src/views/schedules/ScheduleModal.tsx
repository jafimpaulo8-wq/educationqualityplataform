import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  BookOpen, 
  Users, 
  DoorOpen, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassScheduleSlot, DayOfWeekNumber, ScheduleConflict } from '../../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlot?: ClassScheduleSlot | null;
  initialDay?: DayOfWeekNumber;
  initialStartTime?: string;
  initialClassId?: string;
}

const DAY_LABELS: { [key in DayOfWeekNumber]: string } = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
  0: 'Domingo'
};

const COMMON_ROOMS = [
  'Laboratório Tech 1',
  'Laboratório Tech 2',
  'Laboratório Redes & Cisco',
  'Sala Teórica 101',
  'Sala Teórica 102',
  'Sala Multimídia A',
  'Hangar Técnico 01 - CTIM',
  'Oficina Mecânica Central',
  'Pátio de Manobras e Máquinas',
  'Auditório Central'
];

const DURATION_PRESETS = [
  { label: '1 Hora (60 min)', minutes: 60 },
  { label: '1h 30m (90 min)', minutes: 90 },
  { label: '2 Horas (120 min)', minutes: 120 },
  { label: '2h 30m (150 min)', minutes: 150 },
  { label: '3 Horas (180 min)', minutes: 180 },
  { label: '4 Horas (240 min)', minutes: 240 }
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  initialSlot,
  initialDay,
  initialStartTime,
  initialClassId
}) => {
  const { classes, courses, addScheduleSlot, updateScheduleSlot, detectScheduleConflicts } = useApp();

  const [classGroupId, setClassGroupId] = useState<string>('');
  const [disciplineName, setDisciplineName] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekNumber>(1);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [status, setStatus] = useState<ClassScheduleSlot['status']>('Agendada');
  const [recurrence, setRecurrence] = useState<ClassScheduleSlot['recurrence']>('semanal');
  const [color, setColor] = useState<string>('#3b82f6');
  const [notes, setNotes] = useState<string>('');
  const [specificDate, setSpecificDate] = useState<string>('');
  const [forceOverride, setForceOverride] = useState<boolean>(false);

  // Set initial form state
  useEffect(() => {
    if (initialSlot) {
      setClassGroupId(initialSlot.classGroupId);
      setDisciplineName(initialSlot.disciplineName);
      setTeacherName(initialSlot.teacherName);
      setRoom(initialSlot.room);
      setDayOfWeek(initialSlot.dayOfWeek);
      setStartTime(initialSlot.startTime);
      setEndTime(initialSlot.endTime);
      setDurationMinutes(initialSlot.durationMinutes);
      setStatus(initialSlot.status);
      setRecurrence(initialSlot.recurrence);
      setColor(initialSlot.color || '#3b82f6');
      setNotes(initialSlot.notes || '');
      setSpecificDate(initialSlot.date || '');
    } else {
      const defaultClass = initialClassId 
        ? classes.find(c => c.id === initialClassId) || classes[0]
        : classes[0];

      const initialClsId = defaultClass ? defaultClass.id : '';
      setClassGroupId(initialClsId);
      setDayOfWeek(initialDay !== undefined ? initialDay : 1);
      
      const stTime = initialStartTime || '08:00';
      setStartTime(stTime);
      
      // Calculate 2 hours ahead
      const [h, m] = stTime.split(':').map(Number);
      const endH = Math.min(23, (h || 8) + 2).toString().padStart(2, '0');
      const endM = (m || 0).toString().padStart(2, '0');
      setEndTime(`${endH}:${endM}`);
      setDurationMinutes(120);

      if (defaultClass) {
        setTeacherName(defaultClass.teacherName || '');
        setRoom(defaultClass.room || 'Laboratório Tech 1');
        const course = courses.find(c => c.id === defaultClass.courseId);
        if (course?.modules?.[0]) {
          setDisciplineName(course.modules[0].name);
        } else {
          setDisciplineName('');
        }
      } else {
        setTeacherName('');
        setRoom('Laboratório Tech 1');
        setDisciplineName('');
      }

      setStatus('Agendada');
      setRecurrence('semanal');
      setColor('#3b82f6');
      setNotes('');
      setSpecificDate('');
    }
    setForceOverride(false);
  }, [initialSlot, initialDay, initialStartTime, initialClassId, isOpen, classes, courses]);

  // When class changes, autofill course disciplines & teacher if blank
  const handleClassChange = (newClassId: string) => {
    setClassGroupId(newClassId);
    const selectedClass = classes.find(c => c.id === newClassId);
    if (selectedClass) {
      if (!teacherName || initialSlot?.classGroupId !== newClassId) {
        setTeacherName(selectedClass.teacherName || '');
      }
      if (!room || initialSlot?.classGroupId !== newClassId) {
        setRoom(selectedClass.room || 'Laboratório Tech 1');
      }
      const course = courses.find(c => c.id === selectedClass.courseId);
      if (course?.modules && course.modules.length > 0 && (!disciplineName || initialSlot?.classGroupId !== newClassId)) {
        setDisciplineName(course.modules[0].name);
      }
    }
  };

  // Synchronize duration when startTime or endTime changes
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    if (!newStart) return;
    const [h, m] = newStart.split(':').map(Number);
    const totalStartMin = (h || 0) * 60 + (m || 0);
    const totalEndMin = totalStartMin + durationMinutes;
    const endH = Math.floor((totalEndMin % (24 * 60)) / 60).toString().padStart(2, '0');
    const endM = (totalEndMin % 60).toString().padStart(2, '0');
    setEndTime(`${endH}:${endM}`);
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    if (!startTime || !newEnd) return;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = newEnd.split(':').map(Number);
    const startTotal = (startH || 0) * 60 + (startM || 0);
    const endTotal = (endH || 0) * 60 + (endM || 0);
    if (endTotal > startTotal) {
      setDurationMinutes(endTotal - startTotal);
    }
  };

  const handleDurationPreset = (minutes: number) => {
    setDurationMinutes(minutes);
    if (!startTime) return;
    const [h, m] = startTime.split(':').map(Number);
    const totalStartMin = (h || 0) * 60 + (m || 0);
    const totalEndMin = totalStartMin + minutes;
    const endH = Math.floor((totalEndMin % (24 * 60)) / 60).toString().padStart(2, '0');
    const endM = (totalEndMin % 60).toString().padStart(2, '0');
    setEndTime(`${endH}:${endM}`);
  };

  // Selected class & course context
  const selectedClass = classes.find(c => c.id === classGroupId);
  const selectedCourse = courses.find(c => c.id === selectedClass?.courseId);
  const availableModules = selectedCourse?.modules || [];

  // REAL-TIME CONFLICT SCANNING
  const candidatePayload = {
    institutionId: selectedClass?.institutionId || '',
    branchId: selectedClass?.branchId,
    classGroupId,
    classGroupName: selectedClass?.name || 'Turma',
    courseId: selectedClass?.courseId || '',
    courseName: selectedClass?.courseName || '',
    disciplineName: disciplineName || 'Disciplina',
    teacherName: teacherName || '',
    room: room || '',
    dayOfWeek,
    startTime,
    endTime,
    durationMinutes,
    status,
    recurrence,
    date: specificDate || undefined
  };

  const conflictResult = detectScheduleConflicts(candidatePayload, initialSlot?.id);
  const hasConflict = conflictResult.hasConflict;
  const conflicts = conflictResult.conflicts;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!classGroupId) {
      alert('Por favor, selecione uma turma.');
      return;
    }
    if (!disciplineName.trim()) {
      alert('Por favor, informe a disciplina da aula.');
      return;
    }
    if (!teacherName.trim()) {
      alert('Por favor, informe o docente responsável.');
      return;
    }
    if (!room.trim()) {
      alert('Por favor, informe a sala ou laboratório.');
      return;
    }

    if (hasConflict && !forceOverride) {
      return;
    }

    const payload = {
      classGroupId,
      classGroupName: selectedClass?.name || 'Turma',
      courseId: selectedClass?.courseId || '',
      courseName: selectedClass?.courseName || '',
      disciplineName: disciplineName.trim(),
      teacherName: teacherName.trim(),
      room: room.trim(),
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes) || 120,
      status,
      recurrence,
      color,
      notes: notes.trim(),
      date: specificDate || undefined,
      branchId: selectedClass?.branchId
    };

    if (initialSlot) {
      updateScheduleSlot(initialSlot.id, payload);
    } else {
      addScheduleSlot(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {initialSlot ? 'Editar Horário de Aula' : 'Novo Horário no Calendário'}
              </h2>
              <p className="text-xs text-slate-400">
                Atribuição de aula, professor, turma, sala e detecção inteligente de conflitos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* REAL-TIME CONFLICT ALERT BANNER */}
          {hasConflict && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/40 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Conflito Detectado na Programação Acadêmica</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                  {conflicts.length} conflito(s)
                </span>
              </div>
              <div className="space-y-1.5 pl-6">
                {conflicts.map((c: ScheduleConflict, idx: number) => (
                  <div key={idx} className="text-xs text-rose-200/90 leading-relaxed">
                    • <strong className="text-rose-300">{c.title}:</strong> {c.message}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-rose-800/40 flex items-center justify-between text-xs">
                <span className="text-rose-300/80">
                  Ajuste o professor, a sala, o dia ou o horário para eliminar a sobreposição.
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-amber-300 hover:text-amber-200">
                  <input
                    type="checkbox"
                    checked={forceOverride}
                    onChange={e => setForceOverride(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                  />
                  <span>Permitir salvar mesmo com conflito</span>
                </label>
              </div>
            </div>
          )}

          {!hasConflict && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Nenhum conflito detectado! O professor, a turma e a sala estão 100% disponíveis neste horário.
              </span>
            </div>
          )}

          {/* Form grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Turma */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Turma <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <select
                  value={classGroupId}
                  onChange={e => handleClassChange(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">Selecione a turma...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.shift} - {c.period})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Disciplina */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Disciplina / Módulo <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                {availableModules.length > 0 ? (
                  <select
                    value={disciplineName}
                    onChange={e => setDisciplineName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Selecione o módulo...</option>
                    {availableModules.map(m => (
                      <option key={m.id} value={m.name}>
                        {m.code ? `[${m.code}] ` : ''}{m.name}
                      </option>
                    ))}
                    <option value={disciplineName}>Outro (Manual)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={disciplineName}
                    onChange={e => setDisciplineName(e.target.value)}
                    placeholder="Ex: Algoritmos & Estruturas de Dados"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>
            </div>

            {/* Professor */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Docente / Professor Responsável <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                  placeholder="Ex: Eng. Arone Malendza"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Sala / Laboratório */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Sala / Laboratório / Oficina <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <DoorOpen className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  list="rooms-list"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  placeholder="Ex: Laboratório Tech 1"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
                <datalist id="rooms-list">
                  {COMMON_ROOMS.map(r => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Dia da Semana */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Dia da Semana <span className="text-rose-400">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value) as DayOfWeekNumber)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value={1}>Segunda-feira</option>
                <option value={2}>Terça-feira</option>
                <option value={3}>Quarta-feira</option>
                <option value={4}>Quinta-feira</option>
                <option value={5}>Sexta-feira</option>
                <option value={6}>Sábado</option>
                <option value={0}>Domingo</option>
              </select>
            </div>

            {/* Recorrência */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Frequência / Recorrência
              </label>
              <select
                value={recurrence}
                onChange={e => setRecurrence(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="semanal">Semanal (Padrão)</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="unica">Aula Pontual / Única</option>
              </select>
            </div>

            {/* Horário de Início & Término */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Horário de Início <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="time"
                  value={startTime}
                  onChange={e => handleStartTimeChange(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Horário de Término <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="time"
                  value={endTime}
                  onChange={e => handleEndTimeChange(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Duração presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Duração da Aula: <span className="text-amber-400 font-semibold">{durationMinutes} minutos</span> ({Math.floor(durationMinutes / 60)}h {durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ''})
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map(preset => (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => handleDurationPreset(preset.minutes)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    durationMinutes === preset.minutes
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cor do Bloco & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Cor de Destaque no Calendário
              </label>
              <div className="flex items-center gap-2">
                {[
                  '#3b82f6', // azul
                  '#10b981', // verde
                  '#f59e0b', // âmbar
                  '#8b5cf6', // roxo
                  '#06b6d4', // ciano
                  '#ec4899', // rosa
                  '#ef4444'  // vermelho
                ].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform ${
                      color === c ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Estado da Aula
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Agendada">Agendada (Ativa)</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Realizada">Realizada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Instruções Pedagógicas / Observações
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Aula prática com simulador; alunos devem trazer notebooks ou equipamento de segurança."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={hasConflict && !forceOverride}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg flex items-center gap-2 ${
                hasConflict && !forceOverride
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {hasConflict && !forceOverride ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Resolver Conflito para Salvar</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>{initialSlot ? 'Atualizar Horário' : 'Salvar no Calendário'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
