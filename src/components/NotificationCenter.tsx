import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CreditCard, 
  FileText, 
  Award, 
  AlertCircle, 
  CheckCheck, 
  Trash2, 
  Sparkles,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { LiveNotification } from '../types';
import { soundManager } from '../utils/audio';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: LiveNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onTriggerSimulatedNotification: () => void;
  activeToast: LiveNotification | null;
  onDismissToast: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onTriggerSimulatedNotification,
  activeToast,
  onDismissToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  const getIcon = (type: LiveNotification['type']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'registration':
        return <FileText className="w-4 h-4 text-sky-400" />;
      case 'certificate':
        return <Award className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <>
      {/* Floating Bottom-Right Toast Alert */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                {getIcon(activeToast.type)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Notificação em Tempo Real (SIVERC)
                </span>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {activeToast.title}
                </h4>
              </div>
            </div>
            <button
              onClick={onDismissToast}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-2 line-clamp-2">
            {activeToast.message}
          </p>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            <span>{activeToast.timestamp}</span>
            <span className="text-emerald-400 font-bold">Verificado Online</span>
          </div>
        </div>
      )}

      {/* Side Drawer Notification Center */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Central de Notificações</h3>
                      <p className="text-xs text-slate-400">Eventos em tempo real do sistema SIGAR</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 py-3 overflow-x-auto text-xs">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'payment', label: 'Pagamentos' },
                    { id: 'registration', label: 'Inscrições' },
                    { id: 'certificate', label: 'Certificados' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        activeFilter === tab.id
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-3 mt-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      Nenhuma notificação encontrada neste filtro.
                    </div>
                  ) : (
                    filteredNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          n.read
                            ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                            : 'bg-slate-900 border-sky-500/40 text-slate-200 shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {n.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={onTriggerSimulatedNotification}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-sky-400 border border-sky-500/30 text-xs font-semibold cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Simular Novo Alerta em Tempo Real</span>
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Marcar lidas</span>
                  </button>
                  <button
                    onClick={onClearAll}
                    className="flex items-center gap-1 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar histórico</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
