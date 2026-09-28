import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Smartphone, 
  Wifi, 
  RefreshCw, 
  Sparkles, 
  UserCheck,
  ScanLine
} from 'lucide-react';
import { INITIAL_REGISTRATIONS } from '../data/mockData';
import { RegistrationApplication } from '../types';
import { soundManager } from '../utils/audio';

interface DigitalGatePassProps {
  applications: RegistrationApplication[];
}

export const DigitalGatePass: React.FC<DigitalGatePassProps> = ({ applications }) => {
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const activeStudent = applications[selectedStudentIndex] || INITIAL_REGISTRATIONS[0];

  const handleSimulateScan = () => {
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      setScanResult('ACESSO AUTORIZADO • CATRACA / PORTARIA 01');
      soundManager.playNotification();
      setTimeout(() => setScanResult(null), 4000);
    }, 1200);
  };

  return (
    <section id="portaria" className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800/80 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            SIVERC Portaria Digital • Superior ao SoftGenial
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Controle de Acesso &amp; Cartão Digital do Aluno
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Identificação biométrica e leitura instantânea de QR Code nas catracas dos campus Moztechwave com validação em nuvem em milissegundos.
          </p>
        </div>

        {/* Interactive Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Realistic PVC Digital Student Card */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 p-6 sm:p-7 rounded-3xl border-2 border-sky-500/40 shadow-2xl shadow-sky-500/10 overflow-hidden select-none">
              {/* Card Hologram Ribbon */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm">
                    MW
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white tracking-wider">MOZTECHWAVE</h4>
                    <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest block">
                      CARTÃO DIGITAL • SIVERC ID
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <Wifi className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span className="text-[10px] font-mono">NFC / RFID</span>
                </div>
              </div>

              {/* Card Body: Student Photo + Identification */}
              <div className="flex items-center gap-5 py-5">
                <div className="relative shrink-0">
                  <img
                    src={activeStudent.photoUrl}
                    alt={activeStudent.fullName}
                    className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl object-cover border-2 border-sky-400 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[9px] text-white font-bold">
                    ✓
                  </span>
                </div>

                <div className="space-y-1.5 text-xs flex-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Aluno(a):</span>
                    <h5 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                      {activeStudent.fullName}
                    </h5>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Curso:</span>
                    <p className="text-xs text-sky-300 font-semibold line-clamp-1">
                      {activeStudent.courseName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-1 font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Nº Processo:</span>
                      <span className="text-emerald-400 font-bold">{activeStudent.code}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Turno:</span>
                      <span className="text-white">{activeStudent.regime.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Barcode & QR Code */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="space-y-1">
                  {/* Simulated SVG Barcode */}
                  <div className="flex items-center gap-0.5 h-7">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-300 h-full rounded-xs"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    SIVERC-SEC-HASH-892019
                  </span>
                </div>

                <div className="p-1.5 bg-white rounded-lg shadow-md">
                  <QrCode className="w-10 h-10 text-slate-950" />
                </div>
              </div>
            </div>

            {/* Switch Active Student Badge */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-slate-400">Ver crachá de:</span>
              {applications.slice(0, 3).map((app, idx) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedStudentIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedStudentIndex === idx
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {app.fullName.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Turnstile Scanner Simulator */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                <ScanLine className="w-4 h-4" />
                Simulador de Catraca / Portaria
              </div>
              <h3 className="text-xl font-bold text-white">Validação Automática em 0.2 Segundos</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ao aproximar o telemóvel ou cartão físico no leitor ótico da portaria Moztechwave, o sistema identifica instantaneamente o candidato e valida a anuidade.
              </p>
            </div>

            {/* Scanner Visual Screen */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 min-h-[190px]">
              {scanning ? (
                <div className="space-y-3">
                  <RefreshCw className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
                  <p className="text-xs font-mono text-sky-300">Lendo QR Code biométrico e consultando SIVERC...</p>
                </div>
              ) : scanResult ? (
                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-400 font-mono">{scanResult}</h4>
                  <p className="text-xs text-slate-300">
                    Estudante: <strong className="text-white">{activeStudent.fullName}</strong> • Situação Regular
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Smartphone className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-300">Catraca em Espera (Pronta para Leitura)</h4>
                  <p className="text-xs text-slate-500">
                    Aguardando aproximação do Cartão Digital ou Leitura de QR Code
                  </p>
                </div>
              )}
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleSimulateScan}
              disabled={scanning}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>Simular Leitura na Portaria Moztechwave</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Sem filas nem atrasos
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Notificação aos encarregados
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
