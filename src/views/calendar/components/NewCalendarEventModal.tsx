import React, { useState } from 'react';
import { 
  CalendarCategoryType, 
  CalendarCustomEvent, 
  Teacher, 
  Institution 
} from '../../../types';
import { CATEGORY_CONFIG } from '../utils/calendarAggregation';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  Plus
} from 'lucide-react';

interface NewCalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Omit<CalendarCustomEvent, 'id' | 'createdAt' | 'updatedAt' | 'institutionId'>) => void;
  defaultDate?: string;
  teachers: Teacher[];
  currentUserName: string;
  activeInstitution: Institution;
}

export const NewCalendarEventModal: React.FC<NewCalendarEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
  teachers,
  currentUserName,
  activeInstitution
}) => {
  if (!isOpen) return null;

  const todayStr = defaultDate || '2026-09-17';

  const [category, setCategory] = useState<CalendarCategoryType>('reuniao');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [location, setLocation] = useState('Sala de Reuniões / Presencial');
  const [assignedUserName, setAssignedUserName] = useState(currentUserName);
  const [assignedUserRole, setAssignedUserRole] = useState('Organizador');
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('media');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, informe o título do agendamento.');
      return;
    }

    onSubmit({
      category,
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate: endDate || undefined,
      allDay,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      location: location.trim() || undefined,
      assignedUserName: assignedUserName.trim() || undefined,
      assignedUserRole: assignedUserRole.trim() || undefined,
      priority,
      status: 'agendado',
      createdBy: currentUserName
    });

    onClose();
  };

  const categoriesList: CalendarCategoryType[] = [
    'reuniao',
    'evento',
    'aula',
    'avaliacao',
    'estagio',
    'tarefa',
    'pagamento',
    'aniversario'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Novo Agendamento no Calendário
              </h2>
              <p className="text-xs text-slate-400">
                {activeInstitution.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Category Select Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Categoria do Evento *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {categoriesList.map(cat => {
                const conf = CATEGORY_CONFIG[cat];
                const isSel = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      isSel 
                        ? `${conf.badgeBg} ${conf.textColor} ${conf.borderColor} font-bold shadow-xs` 
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Título do Evento / Reunião / Compromisso *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Reunião do Conselho Pedagógico ou Visita de Estágio"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descrição & Pauta / Observações
            </label>
            <textarea
              rows={3}
              placeholder="Detalhes sobre os temas a tratar, objetivos ou participantes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Date & Multi-day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data Inicial *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data Final (Opcional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* All Day Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDayCheck"
              checked={allDay}
              onChange={e => setAllDay(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800"
            />
            <label htmlFor="allDayCheck" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
              Evento de Dia Inteiro (sem horário específico)
            </label>
          </div>

          {/* Times if not all day */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Horário de Término
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Localização / Sala / Link de Reunião
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Ex: Auditório Principal, Sala 04, Google Meet ou Empresa Parceira"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Responsible User & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Responsável / Organizador
              </label>
              <select
                value={assignedUserName}
                onChange={e => setAssignedUserName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
              >
                <option value={currentUserName}>{currentUserName} (Eu)</option>
                <optgroup label="Corpo Docente">
                  {teachers.map(tc => (
                    <option key={tc.id} value={tc.fullName}>
                      {tc.fullName} ({tc.specialty || 'Docente'})
                    </option>
                  ))}
                </optgroup>
                <option value="Direção Geral">Direção Geral</option>
                <option value="Coordenação Pedagógica">Coordenação Pedagógica</option>
                <option value="Secretaria Acadêmica">Secretaria Acadêmica</option>
                <option value="Tesouraria Central">Tesouraria Central</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nível de Prioridade
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Agendamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
