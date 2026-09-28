import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarCategoryType, CalendarEventBase, CalendarCustomEvent } from '../../types';
import { CalendarHeader, CalendarViewMode } from './components/CalendarHeader';
import { CalendarCategoryFilter } from './components/CalendarCategoryFilter';
import { CalendarMonthView } from './components/CalendarMonthView';
import { CalendarWeekView } from './components/CalendarWeekView';
import { CalendarDayView } from './components/CalendarDayView';
import { CalendarAgendaView } from './components/CalendarAgendaView';
import { EventDetailModal } from './components/EventDetailModal';
import { NewCalendarEventModal } from './components/NewCalendarEventModal';
import { aggregateCalendarEvents } from './utils/calendarAggregation';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  BookOpen, 
  Users, 
  CheckSquare, 
  CreditCard, 
  Cake, 
  Briefcase 
} from 'lucide-react';

export const GeneralCalendarView: React.FC = () => {
  const {
    activeInstitution,
    allInstitutions,
    activeRole,
    currentUser,
    schedules,
    evaluations,
    tasks,
    contasReceber,
    students,
    teachers,
    internships,
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    navigate
  } = useApp();

  const isSuper = activeRole === 'superadmin';

  // 1. Current Date State - default to 17th of September 2026
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 8, 17));
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // 2. Filter States
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(activeInstitution.id);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<CalendarCategoryType[]>([
    'aula',
    'avaliacao',
    'reuniao',
    'tarefa',
    'evento',
    'pagamento',
    'aniversario',
    'estagio'
  ]);

  // 3. Modals State
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventBase | null>(null);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);
  const [newEventDefaultDate, setNewEventDefaultDate] = useState<string>('2026-09-17');

  // 4. Date Navigation Handlers
  const handlePrev = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setDate(d.getDate() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setDate(d.getDate() + 1);
      }
      return d;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 17));
  };

  const handleSelectDay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, d));
    setNewEventDefaultDate(dateStr);
    setViewMode('day');
  };

  // 5. Aggregate events across all 8 modules
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const aggregatedEvents = useMemo(() => {
    return aggregateCalendarEvents({
      year: currentYear,
      month: currentMonth,
      customEvents: calendarEvents,
      schedules,
      evaluations,
      tasks,
      contasReceber,
      students,
      teachers,
      internships,
      filters: {
        institutionId: selectedInstitutionId,
        userId: selectedUserId,
        currentUserName: currentUser.name,
        selectedCategories,
        searchQuery
      }
    });
  }, [
    currentYear,
    currentMonth,
    calendarEvents,
    schedules,
    evaluations,
    tasks,
    contasReceber,
    students,
    teachers,
    internships,
    selectedInstitutionId,
    selectedUserId,
    currentUser.name,
    selectedCategories,
    searchQuery
  ]);

  // 6. Category counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<CalendarCategoryType, number> = {
      aula: 0,
      avaliacao: 0,
      reuniao: 0,
      tarefa: 0,
      evento: 0,
      pagamento: 0,
      aniversario: 0,
      estagio: 0
    };

    // Unfiltered by category to show total available per category
    const unfilteredEvents = aggregateCalendarEvents({
      year: currentYear,
      month: currentMonth,
      customEvents: calendarEvents,
      schedules,
      evaluations,
      tasks,
      contasReceber,
      students,
      teachers,
      internships,
      filters: {
        institutionId: selectedInstitutionId,
        userId: selectedUserId,
        currentUserName: currentUser.name,
        selectedCategories: ['aula', 'avaliacao', 'reuniao', 'tarefa', 'evento', 'pagamento', 'aniversario', 'estagio'],
        searchQuery
      }
    });

    unfilteredEvents.forEach(ev => {
      if (counts[ev.category] !== undefined) {
        counts[ev.category]++;
      }
    });

    return counts;
  }, [
    currentYear,
    currentMonth,
    calendarEvents,
    schedules,
    evaluations,
    tasks,
    contasReceber,
    students,
    teachers,
    internships,
    selectedInstitutionId,
    selectedUserId,
    currentUser.name,
    searchQuery
  ]);

  // 7. Navigation helper to other modules
  const handleNavigateToModule = (route: string, id?: string) => {
    navigate(route as any, id ? { id } : undefined);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Módulo 37
            </span>
            <span className="text-xs text-slate-400">
              Gestão Escolar & Visão Geral Integrada
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-amber-400" />
            <span>Calendário Geral & Cronograma Unificado</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Visão consolidada multi-institucional abrangendo <strong>aulas</strong>, <strong>avaliações</strong>, <strong>reuniões</strong>, <strong>tarefas</strong>, <strong>eventos</strong>, <strong>pagamentos</strong>, <strong>aniversários</strong> e <strong>estágios</strong> com filtros avançados.
          </p>
        </div>

        {/* Quick Indicators */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center min-w-[100px]">
            <span className="text-2xl font-black text-white font-mono block">
              {aggregatedEvents.length}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Total Itens
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center min-w-[100px]">
            <span className="text-2xl font-black text-amber-400 font-mono block">
              {categoryCounts.tarefa + categoryCounts.reuniao}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Reuniões & Tarefas
            </span>
          </div>
        </div>
      </div>

      {/* Main Calendar Navigation & Filters Header */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        selectedInstitutionId={selectedInstitutionId}
        onInstitutionChange={setSelectedInstitutionId}
        institutions={allInstitutions}
        selectedUserId={selectedUserId}
        onUserChange={setSelectedUserId}
        teachers={teachers}
        students={students}
        currentUserName={currentUser.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewEvent={() => {
          setNewEventDefaultDate('2026-09-17');
          setIsNewEventModalOpen(true);
        }}
        isSuperAdmin={isSuper}
      />

      {/* 8 Categories Filter Chips */}
      <CalendarCategoryFilter
        selectedCategories={selectedCategories}
        onChange={setSelectedCategories}
        categoryCounts={categoryCounts}
      />

      {/* Views Switcher */}
      {viewMode === 'month' && (
        <CalendarMonthView
          currentDate={currentDate}
          events={aggregatedEvents}
          onSelectEvent={setSelectedEvent}
          onSelectDay={handleSelectDay}
        />
      )}

      {viewMode === 'week' && (
        <CalendarWeekView
          currentDate={currentDate}
          events={aggregatedEvents}
          onSelectEvent={setSelectedEvent}
          onSelectDay={handleSelectDay}
        />
      )}

      {viewMode === 'day' && (
        <CalendarDayView
          currentDate={currentDate}
          events={aggregatedEvents}
          onSelectEvent={setSelectedEvent}
          onNavigateToModule={handleNavigateToModule}
        />
      )}

      {viewMode === 'agenda' && (
        <CalendarAgendaView
          events={aggregatedEvents}
          onSelectEvent={setSelectedEvent}
          onNavigateToModule={handleNavigateToModule}
        />
      )}

      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onNavigateToModule={handleNavigateToModule}
        onDeleteCustomEvent={deleteCalendarEvent}
        currentUserId={currentUser.id}
        isSuperAdmin={isSuper}
      />

      {/* New Event / Agendamento Modal */}
      <NewCalendarEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onSubmit={addCalendarEvent}
        defaultDate={newEventDefaultDate}
        teachers={teachers}
        currentUserName={currentUser.name}
        activeInstitution={activeInstitution}
      />
    </div>
  );
};
