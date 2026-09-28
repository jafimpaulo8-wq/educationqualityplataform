import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  compact?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'A carregar dados...',
  subMessage = 'Sincronizando com o servidor institucional',
  compact = false
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center rounded-2xl border border-slate-800 bg-[#090d16]/80 ${
      compact ? 'p-6 sm:p-8' : 'p-12 sm:p-16'
    }`}>
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white tracking-tight">
        {message}
      </h4>

      {subMessage && (
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          {subMessage}
        </p>
      )}
    </div>
  );
};
