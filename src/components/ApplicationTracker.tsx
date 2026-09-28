import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download, 
  User, 
  ShieldCheck,
  CreditCard,
  QrCode,
  Sparkles
} from 'lucide-react';
import { RegistrationApplication } from '../types';

interface ApplicationTrackerProps {
  applications: RegistrationApplication[];
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ applications }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedApp, setSearchedApp] = useState<RegistrationApplication | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleanQuery = searchQuery.trim().toLowerCase();

    if (!cleanQuery) {
      setSearchedApp(null);
      return;
    }

    const found = applications.find(
      (app) =>
        app.code.toLowerCase().includes(cleanQuery) ||
        app.documentNumber.toLowerCase().includes(cleanQuery) ||
        app.fullName.toLowerCase().includes(cleanQuery)
    );

    setSearchedApp(found || null);
  };

  const handleQuickSelect = (app: RegistrationApplication) => {
    setSearchQuery(app.code);
    setSearchedApp(app);
    setHasSearched(true);
  };

  return (
    <section id="consultar" className="py-16 sm:py-20 bg-slate-900/70 border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" />
            Consulta de Candidatura &amp; Matrícula
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Acompanhe o Status da Sua Inscrição
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Consulte o estado do seu processo pelo número de BI/Passaporte ou código SIGAR.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite seu BI (ex: 110100482914B) ou código SIGAR..."
              className="w-full pl-12 pr-36 py-4 rounded-2xl bg-slate-950 border border-slate-700 focus:border-sky-500 text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none shadow-xl"
            />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Consultar
            </button>
          </div>
        </form>

        {/* Quick Click Samples */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-slate-400">Exemplos rápidos:</span>
          {applications.slice(0, 3).map((app) => (
            <button
              key={app.id}
              onClick={() => handleQuickSelect(app)}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono cursor-pointer border border-slate-700/60"
            >
              {app.code} ({app.fullName.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Search Result Display */}
        {hasSearched && (
          <div>
            {searchedApp ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={searchedApp.photoUrl}
                      alt={searchedApp.fullName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-sky-500/60 shadow-md"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white">{searchedApp.fullName}</h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {searchedApp.documentType} nº: {searchedApp.documentNumber}
                      </p>
                      <span className="text-[11px] text-sky-400 font-mono">{searchedApp.code}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      searchedApp.status === 'Aprovada'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : searchedApp.status === 'Aguardando Pagamento'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Status: {searchedApp.status}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">Registrado em: {searchedApp.createdAt}</p>
                  </div>
                </div>

                {/* Academic & Financial Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold uppercase text-sky-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Informações Curriculares
                    </div>
                    <div>
                      <span className="text-slate-400">Curso Escolhido:</span>
                      <p className="text-white font-bold">{searchedApp.courseName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Regime:</span>
                      <p className="text-slate-200">{searchedApp.regime}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Localização / Campus:</span>
                      <p className="text-slate-200">{searchedApp.province} • {searchedApp.city}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Situação Financeira SIVERC
                    </div>
                    <div>
                      <span className="text-slate-400">Status do Pagamento:</span>
                      <p className={`font-bold ${
                        searchedApp.paymentStatus === 'Pago' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {searchedApp.paymentStatus}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Referência SIVERC:</span>
                      <p className="font-mono text-slate-200">{searchedApp.paymentReference}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Homologação Digital:</span>
                      <p className="text-emerald-400 font-mono">100% Válido no SIVERC</p>
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-300">
                    Etapas do Processo de Matrícula:
                  </span>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                      ✓ Submissão
                    </div>
                    <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                      ✓ Análise Doc.
                    </div>
                    <div className={`text-center p-2 rounded-lg text-[11px] font-bold ${
                      searchedApp.paymentStatus === 'Pago'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                    }`}>
                      {searchedApp.paymentStatus === 'Pago' ? '✓ Pagamento' : '⏳ Aguardando'}
                    </div>
                    <div className="text-center p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-bold">
                      Turma Atribuída
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <a
                    href="#portaria"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ver Cartão de Estudante (Portaria Digital)</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Guia de Confirmação</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Nenhuma Inscrição Encontrada</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Não encontramos nenhuma candidatura correspondente a &quot;{searchQuery}&quot;. Verifique se digitou o BI ou código corretamente.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
