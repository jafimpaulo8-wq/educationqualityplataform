import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Building2, 
  User, 
  LayoutGrid, 
  Columns, 
  CalendarDays, 
  ListFilter
} from 'lucide-react';
import { Institution, Teacher, Student } from '../../../types';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  
  // Filters
  selectedInstitutionId: string;
  onInstitutionChange: (id: string) => void;
  institutions: Institution[];
  
  selectedUserId: string;
  onUserChange: (userId: string) => void;
  teachers: Teacher[];
  students: Student[];
  currentUserName: string;
  
  searchQuery: string;
  onSearchChange: (q: string) => void;
  
  onOpenNewEvent: () => void;
  isSuperAdmin: boolean;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  selectedInstitutionId,
  onInstitutionChange,
  institutions,
  selectedUserId,
  onUserChange,
  teachers,
  students,
  currentUserName,
  searchQuery,
  onSearchChange,
  onOpenNewEvent,
  isSuperAdmin
}) => {
  // Format Month Year in Portuguese (e.g. Setembro de 2026)
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-4">
      {/* Top Row: Title, Date navigation & Action button */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Date Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-1">
            <button
              onClick={onPrev}
              title="Período Anterior"
              className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              className="px-3 py-1 text-xs font-semibold text-amber-400 hover:bg-slate-700/60 rounded-md transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={onNext}
              title="Próximo Período"
              className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <span>{monthName}</span>
              <span className="text-slate-400 font-light">{year}</span>
            </h2>
          </div>
        </div>

        {/* View Mode Switcher + Add Event Button */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'month'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Mês
            </button>
            <button
              onClick={() => onViewModeChange('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'week'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Semana
            </button>
            <button
              onClick={() => onViewModeChange('day')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'day'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Dia
            </button>
            <button
              onClick={() => onViewModeChange('agenda')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'agenda'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Agenda
            </button>
          </div>

          {/* New Event Button */}
          <button
            onClick={onOpenNewEvent}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Second Row: Filters (Institution, User, Search) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
        {/* Institution Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Building2 className="w-4 h-4 text-amber-400/80" />
          </div>
          <select
            value={selectedInstitutionId}
            onChange={e => onInstitutionChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500 transition-colors"
          >
            {isSuperAdmin && (
              <option value="all">Todas as Instituições (Rede Geral)</option>
            )}
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.sigla || inst.name} - {inst.name}
              </option>
            ))}
          </select>
        </div>

        {/* User Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <User className="w-4 h-4 text-sky-400/80" />
          </div>
          <select
            value={selectedUserId}
            onChange={e => onUserChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-sky-500 transition-colors"
          >
            <option value="all">Todos os Utilizadores (Geral)</option>
            <option value="current">Minha Agenda ({currentUserName})</option>
            
            <optgroup label="Corpo Docente / Formadores">
              {teachers.slice(0, 15).map(tc => (
                <option key={tc.id} value={tc.fullName}>
                  Prof. {tc.fullName} ({tc.specialty || 'Docente'})
                </option>
              ))}
            </optgroup>

            <optgroup label="Estudantes (Amostra)">
              {students.slice(0, 15).map(st => (
                <option key={st.id} value={st.fullName}>
                  Aluno: {st.fullName} ({st.classGroupName || 'Geral'})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Real-time Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por aula, reunião, responsável, sala ou aluno..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
