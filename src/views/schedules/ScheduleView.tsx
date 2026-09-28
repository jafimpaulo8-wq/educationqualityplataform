import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  DoorOpen, 
  User, 
  BookOpen, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Printer, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  ShieldAlert, 
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { ClassScheduleSlot, DayOfWeekNumber, ScheduleConflict } from '../../types';
import { hasPermission } from '../../types/rbac';
import { ScheduleModal } from './ScheduleModal';
import { ConflictRadarModal } from './ConflictRadarModal';
import { ScheduleCard } from './ScheduleCard';

type ViewTab = 'grade' | 'turma' | 'professor' | 'sala' | 'lista';

const DAYS: { number: DayOfWeekNumber; name: string; short: string }[] = [
  { number: 1, name: 'Segunda-feira', short: 'Seg' },
  { number: 2, name: 'Terça-feira', short: 'Ter' },
  { number: 3, name: 'Quarta-feira', short: 'Qua' },
  { number: 4, name: 'Quinta-feira', short: 'Qui' },
  { number: 5, name: 'Sexta-feira', short: 'Sex' },
  { number: 6, name: 'Sábado', short: 'Sáb' }
];

const TIME_BLOCKS = [
  { start: '07:30', end: '09:30', label: '07:30 - 09:30', shift: 'Manhã' },
  { start: '09:45', end: '11:45', label: '09:45 - 11:45', shift: 'Manhã' },
  { start: '12:00', end: '14:00', label: '12:00 - 14:00', shift: 'Tarde' },
  { start: '14:15', end: '16:15', label: '14:15 - 16:15', shift: 'Tarde' },
  { start: '16:30', end: '18:30', label: '16:30 - 18:30', shift: 'Tarde/Noite' },
  { start: '18:45', end: '20:45', label: '18:45 - 20:45', shift: 'Noite' }
];

export const ScheduleView: React.FC = () => {
  const { 
    schedules, 
    classes, 
    courses, 
    deleteScheduleSlot, 
    detectScheduleConflicts, 
    activeInstitution,
    activeRole
  } = useApp();

  const canManage = hasPermission(activeRole, 'horarios.manage');

  // View state
  const [activeTab, setActiveTab] = useState<ViewTab>('grade');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConflictRadarOpen, setIsConflictRadarOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ClassScheduleSlot | null>(null);
  const [prefilledDay, setPrefilledDay] = useState<DayOfWeekNumber | undefined>(undefined);
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>(undefined);
  const [prefilledClassId, setPrefilledClassId] = useState<string | undefined>(undefined);

  // Extract distinct teachers & rooms
  const distinctTeachers = useMemo(() => {
    const set = new Set<string>();
    schedules.forEach(s => {
      if (s.teacherName) set.add(s.teacherName.trim());
    });
    classes.forEach(c => {
      if (c.teacherName) set.add(c.teacherName.trim());
    });
    return Array.from(set).sort();
  }, [schedules, classes]);

  const distinctRooms = useMemo(() => {
    const set = new Set<string>();
    schedules.forEach(s => {
      if (s.room) set.add(s.room.trim());
    });
    classes.forEach(c => {
      if (c.room) set.add(c.room.trim());
    });
    return Array.from(set).sort();
  }, [schedules, classes]);

  // Overall conflict scanner across all slots
  const allDetectedConflicts = useMemo(() => {
    const detected: { slot: ClassScheduleSlot; conflict: ScheduleConflict }[] = [];
    const seenPair = new Set<string>();

    schedules.forEach(slot => {
      const res = detectScheduleConflicts(slot, slot.id);
      if (res.hasConflict) {
        res.conflicts.forEach(c => {
          const pairKey = c.conflictingSlot 
            ? [slot.id, c.conflictingSlot.id].sort().join('::')
            : slot.id;
          if (!seenPair.has(pairKey)) {
            seenPair.add(pairKey);
            detected.push({ slot, conflict: c });
          }
        });
      }
    });

    return detected;
  }, [schedules, detectScheduleConflicts]);

  const conflictingSlotIds = useMemo(() => {
    const ids = new Set<string>();
    allDetectedConflicts.forEach(item => {
      ids.add(item.slot.id);
      if (item.conflict.conflictingSlot) {
        ids.add(item.conflict.conflictingSlot.id);
      }
    });
    return ids;
  }, [allDetectedConflicts]);

  // Filtered schedules for rendering
  const filteredSchedules = useMemo(() => {
    return schedules.filter(slot => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = 
          slot.disciplineName.toLowerCase().includes(term) ||
          slot.teacherName.toLowerCase().includes(term) ||
          slot.room.toLowerCase().includes(term) ||
          slot.classGroupName.toLowerCase().includes(term);
        if (!matches) return false;
      }

      // Class Filter
      if (filterClassId !== 'all' && slot.classGroupId !== filterClassId) {
        return false;
      }

      // Teacher Filter
      if (filterTeacher !== 'all' && slot.teacherName.trim().toLowerCase() !== filterTeacher.trim().toLowerCase()) {
        return false;
      }

      // Room Filter
      if (filterRoom !== 'all' && slot.room.trim().toLowerCase() !== filterRoom.trim().toLowerCase()) {
        return false;
      }

      // Day Filter
      if (filterDay !== 'all' && slot.dayOfWeek.toString() !== filterDay) {
        return false;
      }

      return true;
    });
  }, [schedules, searchTerm, filterClassId, filterTeacher, filterRoom, filterDay]);

  // Quick action openers
  const handleOpenAdd = (day?: DayOfWeekNumber, time?: string, classId?: string) => {
    setEditingSlot(null);
    setPrefilledDay(day);
    setPrefilledTime(time);
    setPrefilledClassId(classId);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: ClassScheduleSlot) => {
    setEditingSlot(slot);
    setPrefilledDay(undefined);
    setPrefilledTime(undefined);
    setPrefilledClassId(undefined);
    setIsModalOpen(true);
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {activeInstitution.name}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Gestão Acadêmica</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-amber-400" />
            <span>Horários & Grade Curricular</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Planejamento semanal de aulas, alocação de docentes, gestão de salas e laboratórios com detecção automática de conflitos.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Conflict Radar Button */}
          <button
            onClick={() => setIsConflictRadarOpen(true)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
              allDetectedConflicts.length > 0
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25 animate-pulse'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Radar de Conflitos</span>
            <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
              allDetectedConflicts.length > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500/30 text-emerald-200'
            }`}>
              {allDetectedConflicts.length}
            </span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrintSchedule}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Imprimir Grade</span>
          </button>

          {/* New Slot Button */}
          {canManage && (
            <button
              onClick={() => handleOpenAdd()}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Aula / Horário</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Aulas Cadastradas</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {schedules.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Distribuição semanal ativa
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Docentes em Grade</span>
            <User className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {distinctTeachers.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Professores alocados
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Espaços & Labs</span>
            <DoorOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {distinctRooms.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Salas com aulas ativas
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-md transition-colors ${
          allDetectedConflicts.length > 0 
            ? 'border-rose-500/30 bg-rose-950/20' 
            : 'border-emerald-500/30 bg-emerald-950/20'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={allDetectedConflicts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}>
              Integridade da Grade
            </span>
            {allDetectedConflicts.length > 0 ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${
            allDetectedConflicts.length > 0 ? 'text-rose-300' : 'text-emerald-300'
          }`}>
            {allDetectedConflicts.length === 0 ? '100% Livre' : `${allDetectedConflicts.length} Conflitos`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {allDetectedConflicts.length === 0 ? 'Zero sobreposições' : 'Requer ajuste no Radar'}
          </div>
        </div>
      </div>

      {/* View Tabs & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('grade')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'grade'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Grade Semanal</span>
          </button>

          <button
            onClick={() => setActiveTab('turma')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'turma'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Por Turma</span>
          </button>

          <button
            onClick={() => setActiveTab('professor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'professor'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Por Docente</span>
          </button>

          <button
            onClick={() => setActiveTab('sala')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sala'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>Por Sala / Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('lista')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'lista'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Lista / Tabela</span>
          </button>
        </div>

        {/* Global Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar aula, professor, sala..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Filtrar Turma
          </label>
          <select
            value={filterClassId}
            onChange={e => setFilterClassId(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todas as Turmas ({classes.length})</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shift})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Filtrar Docente
          </label>
          <select
            value={filterTeacher}
            onChange={e => setFilterTeacher(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Docentes ({distinctTeachers.length})</option>
            {distinctTeachers.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Filtrar Sala / Espaço
          </label>
          <select
            value={filterRoom}
            onChange={e => setFilterRoom(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todas as Salas ({distinctRooms.length})</option>
            {distinctRooms.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Dia da Semana
          </label>
          <select
            value={filterDay}
            onChange={e => setFilterDay(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Segunda a Sábado</option>
            {DAYS.map(d => (
              <option key={d.number} value={d.number.toString()}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: GRADE SEMANAL (TIMETABLE GRID) */}
      {/* ========================================================= */}
      {activeTab === 'grade' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="p-3.5 w-36 text-xs font-semibold text-slate-400 text-center border-r border-slate-800">
                    Horário / Faixa
                  </th>
                  {DAYS.map(day => (
                    <th key={day.number} className="p-3.5 text-xs font-semibold text-slate-300 border-r border-slate-800 last:border-r-0">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-100">{day.name}</span>
                        {canManage && (
                          <button
                            onClick={() => handleOpenAdd(day.number)}
                            title={`Adicionar aula na ${day.name}`}
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-amber-400 transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {TIME_BLOCKS.map((block, bIdx) => (
                  <tr key={bIdx} className="hover:bg-slate-950/20 transition-colors">
                    {/* Time Column */}
                    <td className="p-3 text-center border-r border-slate-800 bg-slate-950/40">
                      <div className="font-mono text-xs font-bold text-amber-400">
                        {block.start}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        até {block.end}
                      </div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold tracking-wide bg-slate-800/80 text-slate-400">
                        {block.shift}
                      </span>
                    </td>

                    {/* Day Columns */}
                    {DAYS.map(day => {
                      // Find slots for this day and overlapping this time block
                      const daySlots = filteredSchedules.filter(s => {
                        if (Number(s.dayOfWeek) !== day.number) return false;
                        
                        // Compare intervals
                        return s.startTime < block.end && s.endTime > block.start;
                      });

                      return (
                        <td 
                          key={day.number} 
                          className="p-2 border-r border-slate-800/60 last:border-r-0 align-top relative group"
                        >
                          <div className="min-h-[90px] flex flex-col gap-2">
                            {daySlots.map(slot => (
                              <ScheduleCard
                                key={slot.id}
                                slot={slot}
                                hasConflict={conflictingSlotIds.has(slot.id)}
                                onEdit={handleOpenEdit}
                                onDelete={deleteScheduleSlot}
                                compact={true}
                              />
                            ))}

                            {daySlots.length === 0 && canManage && (
                              <button
                                onClick={() => handleOpenAdd(day.number, block.start)}
                                className="w-full h-full min-h-[70px] rounded-xl border border-dashed border-slate-800/80 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center text-slate-600 hover:text-amber-400 group/btn"
                              >
                                <PlusCircle className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                <span className="text-[10px] font-medium opacity-0 group-hover/btn:opacity-100 transition-opacity mt-0.5">
                                  + Agendar
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: POR TURMA */}
      {/* ========================================================= */}
      {activeTab === 'turma' && (
        <div className="space-y-6">
          {classes.map(cls => {
            const classSlots = schedules
              .filter(s => s.classGroupId === cls.id)
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

            if (filterClassId !== 'all' && cls.id !== filterClassId) return null;

            return (
              <div key={cls.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">
                        {cls.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Curso: {cls.courseName}</span>
                        <span>•</span>
                        <span>Turno: {cls.shift}</span>
                        <span>•</span>
                        <span>Sala Padrão: {cls.room}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                      {classSlots.length} aula(s) agendada(s)
                    </span>
                    {canManage && (
                      <button
                        onClick={() => handleOpenAdd(1, '08:00', cls.id)}
                        className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Adicionar Aula</span>
                      </button>
                    )}
                  </div>
                </div>

                {classSlots.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Nenhum horário cadastrado para esta turma até o momento.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classSlots.map(slot => (
                      <ScheduleCard
                        key={slot.id}
                        slot={slot}
                        hasConflict={conflictingSlotIds.has(slot.id)}
                        onEdit={handleOpenEdit}
                        onDelete={deleteScheduleSlot}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: POR PROFESSOR / DOCENTE */}
      {/* ========================================================= */}
      {activeTab === 'professor' && (
        <div className="space-y-6">
          {distinctTeachers.map(teacher => {
            const teacherSlots = schedules
              .filter(s => s.teacherName.trim().toLowerCase() === teacher.trim().toLowerCase())
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

            if (filterTeacher !== 'all' && teacher.trim().toLowerCase() !== filterTeacher.trim().toLowerCase()) {
              return null;
            }

            const totalMinutes = teacherSlots.reduce((acc, s) => acc + (s.durationMinutes || 120), 0);
            const totalHours = (totalMinutes / 60).toFixed(1);

            return (
              <div key={teacher} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">
                        {teacher}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Carga Horária Semanal: <span className="text-amber-400 font-semibold">{totalHours}h</span> ({totalMinutes} minutos)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                      {teacherSlots.length} aula(s)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {teacherSlots.map(slot => (
                    <ScheduleCard
                      key={slot.id}
                      slot={slot}
                      hasConflict={conflictingSlotIds.has(slot.id)}
                      onEdit={handleOpenEdit}
                      onDelete={deleteScheduleSlot}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: POR SALA / LABORATÓRIO */}
      {/* ========================================================= */}
      {activeTab === 'sala' && (
        <div className="space-y-6">
          {distinctRooms.map(roomName => {
            const roomSlots = schedules
              .filter(s => s.room.trim().toLowerCase() === roomName.trim().toLowerCase())
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

            if (filterRoom !== 'all' && roomName.trim().toLowerCase() !== filterRoom.trim().toLowerCase()) {
              return null;
            }

            return (
              <div key={roomName} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">
                        {roomName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Ocupação e alocações de turmas neste espaço
                      </p>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                    {roomSlots.length} horário(s) alocado(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roomSlots.map(slot => (
                    <ScheduleCard
                      key={slot.id}
                      slot={slot}
                      hasConflict={conflictingSlotIds.has(slot.id)}
                      onEdit={handleOpenEdit}
                      onDelete={deleteScheduleSlot}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: TABELA / LISTA DETALHADA */}
      {/* ========================================================= */}
      {activeTab === 'lista' && (
        <div className="space-y-3">
          {filteredSchedules.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
              Nenhuma aula encontrada para os filtros selecionados.
            </div>
          ) : (
            filteredSchedules.map(slot => (
              <ScheduleCard
                key={slot.id}
                slot={slot}
                hasConflict={conflictingSlotIds.has(slot.id)}
                onEdit={handleOpenEdit}
                onDelete={deleteScheduleSlot}
              />
            ))
          )}
        </div>
      )}

      {/* Creation / Edit Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSlot={editingSlot}
        initialDay={prefilledDay}
        initialStartTime={prefilledTime}
        initialClassId={prefilledClassId}
      />

      {/* Conflict Diagnostic Radar Modal */}
      <ConflictRadarModal
        isOpen={isConflictRadarOpen}
        onClose={() => setIsConflictRadarOpen(false)}
        conflicts={allDetectedConflicts}
        onEditSlot={handleOpenEdit}
      />
    </div>
  );
};
