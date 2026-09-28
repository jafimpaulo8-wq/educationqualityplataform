import React from 'react';
import { CalendarEventBase } from '../../../types';
import { CATEGORY_CONFIG } from '../utils/calendarAggregation';
import { 
  Clock, 
  MapPin, 
  User, 
  ExternalLink, 
  Calendar as CalendarIcon,
  Tag,
  ArrowRight
} from 'lucide-react';

interface CalendarAgendaViewProps {
  events: CalendarEventBase[];
  onSelectEvent: (event: CalendarEventBase) => void;
  onNavigateToModule?: (route: string, id?: string) => void;
}

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  events,
  onSelectEvent,
  onNavigateToModule
}) => {
  const todayStr = '2026-09-17';

  // Group events by date and sort chronologically
  const groupedDates = React.useMemo(() => {
    const map: Record<string, CalendarEventBase[]> = {};
    events.forEach(ev => {
      const ds = ev.startDate;
      if (!map[ds]) map[ds] = [];
      map[ds].push(ev);
    });

    // Sort dates
    const sortedDateKeys = Object.keys(map).sort();
    return sortedDateKeys.map(dateKey => {
      const items = map[dateKey];
      items.sort((a, b) => {
        const timeA = a.startTime || '99:99';
        const timeB = b.startTime || '99:99';
        return timeA.localeCompare(timeB);
      });
      return {
        dateStr: dateKey,
        items
      };
    });
  }, [events]);

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) {
      return 'Hoje, 17 de Setembro de 2026';
    }
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (groupedDates.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">Nenhum evento encontrado</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Não há compromissos correspondentes aos filtros selecionados de instituição, utilizador e categorias.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedDates.map(group => {
        const isToday = group.dateStr === todayStr;

        return (
          <div key={group.dateStr} className="space-y-3">
            {/* Date Group Header */}
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${
              isToday 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                : 'bg-slate-900/90 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold capitalize">
                  {formatDateLabel(group.dateStr)}
                </span>
                {isToday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-500 text-slate-950">
                    Dia Atual
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400">
                {group.items.length} {group.items.length === 1 ? 'evento' : 'eventos'}
              </span>
            </div>

            {/* List of Events */}
            <div className="space-y-2">
              {group.items.map(ev => {
                const config = CATEGORY_CONFIG[ev.category];

                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className={`p-3.5 rounded-xl border bg-slate-900/80 hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${config.borderColor}`}
                  >
                    {/* Left: Time & Category */}
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-24 shrink-0 font-mono text-xs text-slate-400">
                        {ev.startTime ? (
                          <div className="flex items-center gap-1 font-semibold text-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{ev.startTime}</span>
                            {ev.endTime && <span className="text-slate-500">-{ev.endTime}</span>}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                            Dia Todo
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config.badgeBg} ${config.textColor}`}>
                            {config.label}
                          </span>

                          {ev.priority && (
                            <span className={`px-1.5 py-0.2 text-[10px] rounded font-semibold uppercase ${
                              ev.priority === 'urgente' 
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                                : ev.priority === 'alta'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {ev.priority}
                            </span>
                          )}

                          {ev.status && (
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-800/60 px-1.5 py-0.5 rounded">
                              {ev.status}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug">
                          {ev.title}
                        </h4>

                        {ev.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Meta & Direct action */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-right text-xs space-y-0.5">
                        {ev.userName && (
                          <div className="flex items-center gap-1 text-slate-300 justify-end">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{ev.userName}</span>
                          </div>
                        )}
                        {ev.location && (
                          <div className="flex items-center gap-1 text-slate-400 justify-end text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{ev.location}</span>
                          </div>
                        )}
                        {ev.amount && (
                          <div className="text-teal-400 font-bold font-mono text-xs">
                            {Number(ev.amount).toLocaleString()} MT
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {ev.targetRoute && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (onNavigateToModule) onNavigateToModule(ev.targetRoute!, ev.targetId);
                            }}
                            title="Abrir no módulo de origem"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
