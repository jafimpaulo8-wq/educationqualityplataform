import React from 'react';
import { CalendarEventBase } from '../../../types';
import { CATEGORY_CONFIG } from '../utils/calendarAggregation';
import { 
  Clock, 
  MapPin, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';

interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEventBase[];
  onSelectEvent: (event: CalendarEventBase) => void;
  onNavigateToModule?: (route: string, id?: string) => void;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onNavigateToModule
}) => {
  const y = currentDate.getFullYear();
  const m = String(currentDate.getMonth() + 1).padStart(2, '0');
  const d = String(currentDate.getDate()).padStart(2, '0');
  const selectedDateStr = `${y}-${m}-${d}`;

  // Filter events for this day
  const dayEvents = events.filter(ev => {
    if (ev.endDate && ev.endDate !== ev.startDate) {
      return selectedDateStr >= ev.startDate && selectedDateStr <= ev.endDate;
    }
    return ev.startDate === selectedDateStr;
  });

  // Sort by startTime
  dayEvents.sort((a, b) => {
    const tA = a.startTime || '99:99';
    const tB = b.startTime || '99:99';
    return tA.localeCompare(tB);
  });

  // Group into periods: Morning, Afternoon, Evening/All Day
  const morningEvents = dayEvents.filter(e => e.startTime && e.startTime < '12:00');
  const afternoonEvents = dayEvents.filter(e => e.startTime && e.startTime >= '12:00' && e.startTime < '18:00');
  const eveningAndAllDayEvents = dayEvents.filter(e => !e.startTime || e.startTime >= '18:00');

  const renderEventSection = (
    title: string, 
    icon: React.ReactNode, 
    items: CalendarEventBase[],
    subtitle: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <span className="text-amber-400">{icon}</span>
        <div>
          <h3 className="text-sm font-bold text-slate-200">{title}</h3>
          <p className="text-[11px] text-slate-500">{subtitle} ({items.length})</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-500 italic">
          Nenhum compromisso agendado para este período.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(ev => {
            const config = CATEGORY_CONFIG[ev.category];

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-slate-500 bg-slate-900/80 shadow-md flex flex-col justify-between gap-3 ${config.borderColor}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.badgeBg} ${config.textColor}`}>
                      {config.label}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{ev.startTime ? `${ev.startTime} ${ev.endTime ? '- ' + ev.endTime : ''}` : 'Dia Todo'}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                    {ev.title}
                  </h4>

                  {ev.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    {ev.userName && (
                      <div className="flex items-center gap-1 text-slate-300">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{ev.userName}</span>
                        {ev.userRole && <span className="text-slate-500">({ev.userRole})</span>}
                      </div>
                    )}

                    {ev.location && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{ev.location}</span>
                      </div>
                    )}

                    {ev.amount && (
                      <div className="text-teal-400 font-semibold font-mono">
                        Valor: {Number(ev.amount).toLocaleString()} MT
                      </div>
                    )}
                  </div>

                  {ev.targetRoute && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (onNavigateToModule) onNavigateToModule(ev.targetRoute!, ev.targetId);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Abrir Módulo</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Day Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">
            Programação Detalhada do Dia
          </h2>
          <p className="text-xs text-slate-400">
            {currentDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xl font-bold text-amber-400 font-mono">{dayEvents.length}</span>
            <span className="text-xs text-slate-400 block">Compromissos</span>
          </div>
        </div>
      </div>

      {/* 3 Periods: Morning, Afternoon, Evening */}
      <div className="space-y-6">
        {renderEventSection('Período da Manhã', <Sun className="w-5 h-5 text-amber-400" />, morningEvents, '06:00 - 12:00')}
        {renderEventSection('Período da Tarde', <Sunset className="w-5 h-5 text-orange-400" />, afternoonEvents, '12:00 - 18:00')}
        {renderEventSection('Noite & Eventos do Dia', <Moon className="w-5 h-5 text-indigo-400" />, eveningAndAllDayEvents, '18:00 em diante / Dia Todo')}
      </div>
    </div>
  );
};
