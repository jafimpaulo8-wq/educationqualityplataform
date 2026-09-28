import React, { useState } from 'react';
import { Student } from '../../../types';
import { INITIAL_STUDENT_NOTIFICATIONS } from '../mockStudentData';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  FileText, 
  Briefcase, 
  Video, 
  Check, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface StudentNotificationsTabProps {
  currentStudent: Student;
  onNavigateTab?: (tabId: string) => void;
}

export const StudentNotificationsTab: React.FC<StudentNotificationsTabProps> = ({
  currentStudent,
  onNavigateTab
}) => {
  const [notifications, setNotifications] = useState(INITIAL_STUDENT_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Financeiro':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'Acadêmico':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'Secretaria':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'Aulas':
        return <Video className="w-4 h-4 text-rose-600" />;
      case 'Estágio':
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div id="student-notifications-tab" className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Central de Comunicações & Avisos
            </span>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-emerald-600" />
              Notificações Acadêmicas & Administrativas
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Avisos da secretaria, confirmação de mensalidades, pautas publicadas e convites para aulas virtuais
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllAsRead}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Marcar todas como lidas</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tudo em dia
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{notifications.length} notificações registradas</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">{unreadCount} não lida(s)</span>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {notifications.map(item => (
          <div
            key={item.id}
            onClick={() => markAsRead(item.id)}
            className={`p-5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-4 ${
              item.isRead
                ? 'bg-white border-slate-200/90 text-slate-700'
                : 'bg-emerald-50/30 border-emerald-300/80 shadow-2xs text-slate-900'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                item.isRead ? 'bg-slate-100' : 'bg-white border border-emerald-200 shadow-2xs'
              }`}>
                {getCategoryIcon(item.category)}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.category === 'Financeiro' ? 'bg-emerald-100 text-emerald-800' :
                    item.category === 'Aulas' ? 'bg-rose-100 text-rose-800' :
                    item.category === 'Secretaria' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.category}
                  </span>

                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}

                  <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.message}</p>
              </div>
            </div>

            {item.linkTab && onNavigateTab && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab(item.linkTab!);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 self-center cursor-pointer transition"
              >
                <span>Acessar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
