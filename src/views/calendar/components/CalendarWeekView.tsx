import React from 'react';
import { CalendarEventBase } from '../../../types';
import { CATEGORY_CONFIG } from '../utils/calendarAggregation';
import { 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  FileCheck2, 
  Users, 
  CheckSquare, 
  Sparkles, 
  CreditCard, 
  Cake, 
  Briefcase 
} from 'lucide-react';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEventBase[];
  onSelectEvent: (event: CalendarEventBase) => void;
  onSelectDay: (dateStr: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  aula: <BookOpen className="w-3.5 h-3.5" />,
  avaliacao: <FileCheck2 className="w-3.5 h-3.5" />,
  reuniao: <Users className="w-3.5 h-3.5" />,
  tarefa: <CheckSquare className="w-3.5 h-3.5" />,
  evento: <Sparkles className="w-3.5 h-3.5" />,
  pagamento: <CreditCard className="w-3.5 h-3.5" />,
  aniversario: <Cake className="w-3.5 h-3.5" />,
  estagio: <Briefcase className="w-3.5 h-3.5" />
};

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onSelectDay
}) => {
  const todayStr = '2026-09-17';

  // Find Monday of the current week
  const curr = new Date(currentDate);
  const day = curr.getDay();
  // day: 0=Sun, 1=Mon, ..., 6=Sat
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + diffToMonday);

  const weekDays: { name: string; dateStr: string; dayNumber: number }[] = [];
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    weekDays.push({
      name: dayNames[i],
      dateStr: `${y}-${m}-${dayNum}`,
      dayNumber: d.getDate()
    });
  }

  // Group events by date
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, CalendarEventBase[]> = {};
    events.forEach(ev => {
      const ds = ev.startDate;
      if (!map[ds]) map[ds] = [];
      map[ds].push(ev);
    });
    // Sort each day by startTime
    Object.keys(map).forEach(ds => {
      map[ds].sort((a, b) => {
        const timeA = a.startTime || '99:99';
        const timeB = b.startTime || '99:99';
        return timeA.localeCompare(timeB);
      });
    });
    return map;
  }, [events]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        {weekDays.map(col => {
          const isToday = col.dateStr === todayStr;
          const dayEvents = eventsByDate[col.dateStr] || [];

          return (
            <div key={col.dateStr} className="min-h-[550px] flex flex-col bg-slate-950/40">
              {/* Column Header */}
              <div 
                onClick={() => onSelectDay(col.dateStr)}
                className={`p-3 text-center border-b border-slate-800 cursor-pointer transition-colors ${
                  isToday 
                    ? 'bg-amber-500/15 border-b-amber-500/50' 
                    : 'bg-slate-900/80 hover:bg-slate-800/80'
                }`}
              >
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {col.name}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span 
                    className={`text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center ${
                      isToday 
                        ? 'bg-amber-500 text-slate-950 shadow-md' 
                        : 'text-white hover:bg-slate-800'
                    }`}
                  >
                    {col.dayNumber}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {dayEvents.length} compromisso{dayEvents.length === 1 ? '' : 's'}
                </div>
              </div>

              {/* Event Cards Column */}
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[600px]">
                {dayEvents.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <span className="text-xs text-slate-600 italic">Sem eventos agendados</span>
                  </div>
                ) : (
                  dayEvents.map(ev => {
                    const config = CATEGORY_CONFIG[ev.category];

                    return (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer hover:scale-[1.01] shadow-xs ${config.bgLight} ${config.borderColor} hover:border-slate-500`}
                      >
                        {/* Header: Category Badge + Time */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${config.badgeBg} ${config.textColor}`}>
                            {CATEGORY_ICONS[ev.category]}
                            <span>{config.label}</span>
                          </span>

                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-slate-500" />
                            {ev.startTime || 'Dia todo'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
                          {ev.title}
                        </h4>

                        {/* Sub details */}
                        <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                          {ev.userName && (
                            <div className="flex items-center gap-1 text-slate-300 truncate">
                              <User className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{ev.userName}</span>
                            </div>
                          )}

                          {ev.location && (
                            <div className="flex items-center gap-1 text-slate-400 truncate">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </div>
                          )}

                          {ev.amount && (
                            <div className="font-semibold text-teal-400 text-[11px] mt-1">
                              {Number(ev.amount).toLocaleString()} MT
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
