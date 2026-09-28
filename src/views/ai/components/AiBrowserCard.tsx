import React from 'react';
import { 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Compass, 
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface AiBrowserCardProps {
  title: string;
  description: string;
  url: string;
  route: string;
  actionLabel: string;
  badgeText?: string;
  studentData?: any;
  onNavigate?: () => void;
}

export const AiBrowserCard: React.FC<AiBrowserCardProps> = ({
  title,
  description,
  url,
  route,
  actionLabel,
  badgeText,
  studentData,
  onNavigate
}) => {
  const { navigate } = useApp();

  const handleConduct = () => {
    if (route) {
      navigate(route as any);
    }
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="mt-3 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/30 overflow-hidden shadow-xl shadow-indigo-950/20 text-slate-100 font-sans transition-all hover:border-indigo-500/50">
      {/* Browser Chrome Bar */}
      <div className="bg-slate-950/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" />
            Browser Automático
          </span>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-md bg-slate-900/90 border border-slate-700/60 rounded-lg px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-slate-300 truncate">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-sky-400 select-none">moztechwave://</span>
          <span className="truncate">{url.replace('sigar://', '').replace('moztechwave://', '')}</span>
        </div>

        {badgeText ? (
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 shrink-0">
            {badgeText}
          </span>
        ) : (
          <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 shrink-0">
            <ShieldCheck className="w-3 h-3" />
            RBAC OK
          </span>
        )}
      </div>

      {/* Browser Viewport Preview */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
            {studentData ? (
              studentData.photoUrl ? (
                <img src={studentData.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <User className="w-5 h-5" />
              )
            ) : (
              <Sparkles className="w-5 h-5 text-sky-200" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
              {studentData?.code && (
                <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30 font-bold">
                  {studentData.code}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-xl">
              {description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleConduct}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>{actionLabel || 'Conduzir para o Perfil'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
