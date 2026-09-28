import React from 'react';
import { CalendarEventBase } from '../../../types';
import { CATEGORY_CONFIG } from '../utils/calendarAggregation';
import { 
  BookOpen, 
  FileCheck2, 
  Users, 
  CheckSquare, 
  Sparkles, 
  CreditCard, 
  Cake, 
  Briefcase 
} from 'lucide-react';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEventBase[];
  onSelectEvent: (event: CalendarEventBase) => void;
  onSelectDay: (dateStr: string) => void;
}

const CATEGORY_MINI_ICONS: Record<string, React.ReactNode> = {
  aula: <BookOpen className="w-2.5 h-2.5 shrink-0" />,
  avaliacao: <FileCheck2 className="w-2.5 h-2.5 shrink-0" />,
  reuniao: <Users className="w-2.5 h-2.5 shrink-0" />,
  tarefa: <CheckSquare className="w-2.5 h-2.5 shrink-0" />,
  evento: <Sparkles className="w-2.5 h-2.5 shrink-0" />,
  pagamento: <CreditCard className="w-2.5 h-2.5 shrink-0" />,
  aniversario: <Cake className="w-2.5 h-2.5 shrink-0" />,
  estagio: <Briefcase className="w-2.5 h-2.5 shrink-0" />
};

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onSelectDay
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Reference "Today" in 2026: 2026-09-17
  const todayStr = '2026-09-17';

  // Days of Week Header (Monday to Sunday)
  const weekDays = [
    { label: 'Seg', full: 'Segunda-feira' },
    { label: 'Ter', full: 'Terça-feira' },
    { label: 'Qua', full: 'Quarta-feira' },
    { label: 'Qui', full: 'Quinta-feira' },
    { label: 'Sex', full: 'Sexta-feira' },
    { label: 'Sáb', full: 'Sábado' },
    { label: 'Dom', full: 'Domingo' }
  ];

  // Calculate calendar grid
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // JS getDay(): 0 is Sunday, 1 is Monday...
  // We want Monday = 0, Tuesday = 1, ..., Sunday = 6
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const daysInMonth = lastDayOfMonth.getDate();

  // Days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    prevMonthDays.push({ day: d, dateStr, isCurrentMonth: false });
  }

  // Days in current month
  const currentMonthDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    currentMonthDays.push({ day: d, dateStr, isCurrentMonth: true });
  }

  // Days in next month to fill complete weeks (multiples of 7)
  const totalDaysSoFar = prevMonthDays.length + currentMonthDays.length;
  const remainingCells = (7 - (totalDaysSoFar % 7)) % 7;
  const nextMonthDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    nextMonthDays.push({ day: d, dateStr, isCurrentMonth: false });
  }

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Map events to date strings
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, CalendarEventBase[]> = {};
    events.forEach(ev => {
      // Check multi-day or single day
      if (ev.endDate && ev.endDate !== ev.startDate) {
        // Multi-day: add to all covered days within reasonable limit
        const start = new Date(ev.startDate + 'T00:00:00');
        const end = new Date(ev.endDate + 'T00:00:00');
        const cur = new Date(start);
        while (cur <= end) {
          const y = cur.getFullYear();
          const m = String(cur.getMonth() + 1).padStart(2, '0');
          const day = String(cur.getDate()).padStart(2, '0');
          const ds = `${y}-${m}-${day}`;
          if (!map[ds]) map[ds] = [];
          map[ds].push(ev);
          cur.setDate(cur.getDate() + 1);
        }
      } else {
        const ds = ev.startDate;
        if (!map[ds]) map[ds] = [];
        map[ds].push(ev);
      }
    });
    return map;
  }, [events]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-slate-950/80 border-b border-slate-800 text-center py-2.5 text-xs font-semibold text-slate-400">
        {weekDays.map((wd, idx) => (
          <div 
            key={wd.label} 
            className={`flex items-center justify-center gap-1 ${idx >= 5 ? 'text-amber-400/70' : ''}`}
          >
            <span className="hidden sm:inline">{wd.full}</span>
            <span className="sm:hidden">{wd.label}</span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/80 bg-slate-950/40 min-h-[620px]">
        {allCalendarDays.map((cell, idx) => {
          const dayEvents = eventsByDate[cell.dateStr] || [];
          const isToday = cell.dateStr === todayStr;
          const isWeekend = (idx % 7 === 5) || (idx % 7 === 6);

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDay(cell.dateStr)}
              className={`min-h-[105px] p-1.5 transition-colors group relative flex flex-col justify-between cursor-pointer ${
                cell.isCurrentMonth ? 'bg-slate-900/60 hover:bg-slate-800/60' : 'bg-slate-950/70 opacity-45 hover:opacity-75'
              } ${isWeekend && cell.isCurrentMonth ? 'bg-slate-900/30' : ''} ${
                isToday ? 'ring-2 ring-amber-500/50 bg-amber-950/10' : ''
              }`}
            >
              {/* Day Header with Day Number & Event Count */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-md flex items-center justify-center ${
                    isToday
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-slate-300 group-hover:text-white'
                      : 'text-slate-600'
                  }`}
                >
                  {cell.day}
                </span>

                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                    {dayEvents.length} {dayEvents.length === 1 ? 'item' : 'itens'}
                  </span>
                )}
              </div>

              {/* Event Pills (Up to 3) */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map(ev => {
                  const config = CATEGORY_CONFIG[ev.category];
                  return (
                    <button
                      key={ev.id}
                      onClick={e => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium truncate flex items-center gap-1 border transition-all ${config.badgeBg} ${config.textColor} ${config.borderColor} hover:brightness-125 hover:shadow-xs`}
                      title={`${config.label}: ${ev.title} (${ev.startTime || 'Dia todo'}${ev.location ? ' - ' + ev.location : ''})`}
                    >
                      <span className={config.textColor}>
                        {CATEGORY_MINI_ICONS[ev.category]}
                      </span>
                      {ev.startTime && (
                        <span className="text-[10px] font-mono opacity-80 shrink-0">
                          {ev.startTime}
                        </span>
                      )}
                      <span className="truncate">{ev.title}</span>
                    </button>
                  );
                })}

                {/* +N More indicator */}
                {dayEvents.length > 3 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSelectDay(cell.dateStr);
                    }}
                    className="w-full text-left text-[10px] font-semibold text-slate-400 hover:text-amber-400 px-1 py-0.5 transition-colors"
                  >
                    + {dayEvents.length - 3} mais compromissos...
                  </button>
                )}
              </div>

              {/* Day border highlight for today */}
              {isToday && (
                <div className="absolute top-1 right-1">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
