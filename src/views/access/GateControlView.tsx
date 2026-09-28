import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  Scan, 
  Layers
} from 'lucide-react';
import { StudentQRCodeView } from './StudentQRCodeView';
import { GateEntryControlPanel } from './GateEntryControlPanel';
import { StudentCardGeneratorView } from '../students/StudentCardGeneratorView';

export const GateControlView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'portaria' | 'lote_carteirinhas' | 'qrcode_aluno'>('portaria');

  return (
    <div id="gate-control-container" className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900">Portaria, Acesso & Identificação</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                SIVERC Gate Pass
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Controlo operacional de entradas e saídas com leitor de QR Code, auditoria e emissão de carteirinhas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
          <button
            id="tab-portaria"
            type="button"
            onClick={() => setActiveTab('portaria')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'portaria' ? 'bg-white shadow-xs text-emerald-800 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scan className="w-4 h-4 text-emerald-600" />
            28. Controlo de Entrada / Saída
          </button>
          <button
            id="tab-qrcode-modulo27"
            type="button"
            onClick={() => setActiveTab('qrcode_aluno')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'qrcode_aluno' ? 'bg-white shadow-xs text-indigo-600 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            27. QR Code do Aluno
          </button>
          <button
            id="tab-lote-cards"
            type="button"
            onClick={() => setActiveTab('lote_carteirinhas')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'lote_carteirinhas' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            Carteirinhas A4 (Lote)
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'qrcode_aluno' ? (
        <StudentQRCodeView />
      ) : activeTab === 'portaria' ? (
        <GateEntryControlPanel />
      ) : (
        <StudentCardGeneratorView />
      )}
    </div>
  );
};
