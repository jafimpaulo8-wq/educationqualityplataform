import React from 'react';
import { Loader2, FolderX, AlertTriangle, ShieldAlert, WifiOff, RefreshCw } from 'lucide-react';

export type StateFeedbackType = 'loading' | 'empty' | 'error' | 'permission_denied' | 'offline';

interface FirebaseStateFeedbackProps {
  type: StateFeedbackType;
  message?: string;
  subMessage?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const FirebaseStateFeedback: React.FC<FirebaseStateFeedbackProps> = ({
  type,
  message,
  subMessage,
  onRetry,
  compact = false
}) => {
  // Config matching strict specifications from PARTE 11
  const config = {
    loading: {
      defaultMsg: 'Carregando dados...',
      defaultSub: 'Sincronizando com o Firebase Firestore',
      icon: <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />,
      colorClass: 'bg-sky-500/10 border-sky-500/20 text-sky-400'
    },
    empty: {
      defaultMsg: 'Não existem registos.',
      defaultSub: 'Sem dados registados nesta coleção institucional.',
      icon: <FolderX className="w-7 h-7 text-slate-400" />,
      colorClass: 'bg-slate-800/60 border-slate-700/60 text-slate-400'
    },
    error: {
      defaultMsg: 'Não foi possível carregar os dados.',
      defaultSub: 'Ocorreu uma falha na comunicação com os serviços em nuvem.',
      icon: <AlertTriangle className="w-7 h-7 text-rose-400" />,
      colorClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400'
    },
    permission_denied: {
      defaultMsg: 'Não possui autorização para consultar estes dados.',
      defaultSub: 'O seu perfil não detém privilégios RBAC para este recurso.',
      icon: <ShieldAlert className="w-7 h-7 text-amber-400" />,
      colorClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    },
    offline: {
      defaultMsg: 'Sem ligação. Verifique a sua conexão.',
      defaultSub: 'O cliente Firebase não consegue alcançar o servidor.',
      icon: <WifiOff className="w-7 h-7 text-yellow-400" />,
      colorClass: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
    }
  }[type];

  return (
    <div className={`flex flex-col items-center justify-center text-center rounded-2xl border bg-slate-900/60 backdrop-blur-sm ${
      config.colorClass.includes('border') ? config.colorClass.split(' ').filter(c => c.startsWith('border-')).join(' ') : 'border-slate-800'
    } ${compact ? 'p-6 sm:p-8' : 'p-12 sm:p-16'}`}>
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${config.colorClass}`}>
        {config.icon}
      </div>

      <h4 className="text-base font-bold text-white tracking-tight">
        {message || config.defaultMsg}
      </h4>

      {(subMessage || config.defaultSub) && (
        <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          {subMessage || config.defaultSub}
        </p>
      )}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tentar Novamente</span>
        </button>
      )}
    </div>
  );
};
