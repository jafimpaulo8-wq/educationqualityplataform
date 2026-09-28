import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowDown,
  ArrowRight,
  QrCode,
  Globe,
  Database,
  Search,
  Lock,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Award,
  Building,
  Check,
  Hash,
  History,
  FileCheck2,
  AlertTriangle,
  Server,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  SIVEC_WORKFLOW_STEPS,
  INITIAL_SIVEC_RECORDS,
  SivecCertificateRecord,
  SivecStepKey,
  SIGAR_FIREBASE_INTEGRATION_INFO
} from '../../services/sivecWorkflowService';

export const SivecWorkflowView: React.FC = () => {
  const { activeInstitution } = useApp();
  const currentInstitution = activeInstitution;

  const [records, setRecords] = useState<SivecCertificateRecord[]>(INITIAL_SIVEC_RECORDS);
  const [selectedRecordId, setSelectedRecordId] = useState<string>(INITIAL_SIVEC_RECORDS[1].id); // record 2 is pending
  const [activeTab, setActiveTab] = useState<'timeline' | 'verification' | 'firebase_connect'>('timeline');

  // Public verifier search input
  const [searchIdInput, setSearchIdInput] = useState('SIVEC-MZ-2026-009841');
  const [searchResult, setSearchResult] = useState<SivecCertificateRecord | null>(INITIAL_SIVEC_RECORDS[0]);
  const [hasSearched, setHasSearched] = useState(true);

  const currentRecord = records.find(r => r.id === selectedRecordId) || records[0];

  // Advance single step
  const handleAdvanceStep = () => {
    if (currentRecord.currentStepIndex >= 9) return;

    const nextIndex = currentRecord.currentStepIndex + 1;
    const nextStepDef = SIVEC_WORKFLOW_STEPS[nextIndex];

    const updated = records.map(rec => {
      if (rec.id === currentRecord.id) {
        const newEvents = [...rec.historyEvents];
        newEvents.push({
          stepKey: nextStepDef.key,
          timestamp: new Date().toISOString(),
          actor: nextStepDef.actor,
          details: `Etapa concluída: ${nextStepDef.label}`
        });

        const isHomologated = nextIndex >= 8;
        const generatedId = rec.sivecId || `SIVEC-MZ-2026-${Math.floor(100000 + Math.random() * 900000)}`;

        return {
          ...rec,
          currentStepIndex: nextIndex,
          status: isHomologated ? ('HOMOLOGADO' as const) : ('PENDENTE' as const),
          sivecId: nextIndex >= 3 ? generatedId : undefined,
          sha256Hash: nextIndex >= 4 ? (rec.sha256Hash || '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b') : undefined,
          qrPayload: nextIndex >= 5 ? `https://sivec.mined.gov.mz/validar/${generatedId}` : undefined,
          publicUrl: nextIndex >= 6 ? `https://sivec.mined.gov.mz/validar/${generatedId}` : undefined,
          issuedAt: nextIndex >= 8 ? (rec.issuedAt || new Date().toLocaleDateString('pt-MZ')) : undefined,
          historyEvents: newEvents
        };
      }
      return rec;
    });

    setRecords(updated);
  };

  // Immediate 10-Step Cascade Approval
  const handleApproveImmediate = () => {
    const updated = records.map(rec => {
      if (rec.id === currentRecord.id) {
        const fullEvents = SIVEC_WORKFLOW_STEPS.map((step) => ({
          stepKey: step.key,
          timestamp: new Date().toISOString(),
          actor: step.actor,
          details: `Etapa validada e registrada: ${step.label}`
        }));

        const finalId = rec.sivecId || `SIVEC-MZ-2026-00${Math.floor(1000 + Math.random() * 9000)}`;

        return {
          ...rec,
          currentStepIndex: 9,
          status: 'HOMOLOGADO' as const,
          sivecId: finalId,
          sha256Hash: '9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
          qrPayload: `https://sivec.mined.gov.mz/validar/${finalId}`,
          publicUrl: `https://sivec.mined.gov.mz/validar/${finalId}`,
          issuedAt: new Date().toLocaleDateString('pt-MZ'),
          historyEvents: fullEvents
        };
      }
      return rec;
    });

    setRecords(updated);
    setActiveTab('verification');
  };

  // Reset current record
  const handleResetRecord = () => {
    const updated = records.map(rec => {
      if (rec.id === currentRecord.id) {
        return {
          ...rec,
          currentStepIndex: 0,
          status: 'PENDENTE' as const,
          sivecId: undefined,
          sha256Hash: undefined,
          qrPayload: undefined,
          publicUrl: undefined,
          historyEvents: [
            { stepKey: 'instituicao' as const, timestamp: new Date().toISOString(), actor: 'Instituição', details: 'Sessão institucional iniciada' }
          ]
        };
      }
      return rec;
    });

    setRecords(updated);
  };

  // Public search handler
  const handleSearchPublic = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchIdInput.trim().toUpperCase();
    const found = records.find(r => r.sivecId?.toUpperCase() === query || r.studentNumber.toUpperCase() === query || r.biNumber.toUpperCase() === query);
    setSearchResult(found || null);
    setHasSearched(true);
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Módulo 73: Validação Governamental SIVEC & Firebase sigar-6754a
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              73. Fluxo Oficial SIVEC
            </h1>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Cadeia de certificação de 10 etapas: <strong className="text-white font-semibold">Instituição</strong> → 
              <strong className="text-white font-semibold"> Emite certificado</strong> → <strong className="text-white font-semibold">SIVEC registra</strong> → 
              <strong className="text-white font-semibold"> gera ID único</strong> → <strong className="text-white font-semibold">gera hash</strong> → 
              <strong className="text-white font-semibold"> gera QR</strong> → <strong className="text-white font-semibold">URL pública</strong> → 
              <strong className="text-white font-semibold"> verificação</strong> → <strong className="text-white font-semibold">status</strong> → 
              <strong className="text-white font-semibold"> histórico</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('firebase_connect')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm shadow-xl transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>Conexão sigar-6754a</span>
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Portal de Verificação Pública</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-800 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Timeline 10 Etapas (↓)</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Verificação, Status & Histórico (Passos 8 a 10)</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase_connect')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'firebase_connect'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Integração Multi-Tenant Firebase (sigar-6754a)</span>
          </button>
        </div>
      </div>

      {/* Selector of Certificate Records & Global Progress Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diploma Selecionado:</span>
            <div className="flex items-center gap-2">
              {records.map(rec => (
                <button
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    rec.id === currentRecord.id
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {rec.studentName.split(' ')[0]} ({rec.courseCode}) - {rec.status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-indigo-400">
              Etapa {currentRecord.currentStepIndex + 1} de 10: {SIVEC_WORKFLOW_STEPS[currentRecord.currentStepIndex]?.label}
            </span>
            <div className="w-32 sm:w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${((currentRecord.currentStepIndex + 1) / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: TIMELINE DE 10 ETAPAS (↓) */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Certificate Status & Fast Actions */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Dados do Certificado
              </h2>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Instituição:</span>
                  <span className="font-semibold text-white">{currentRecord.institutionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NUIT Emissor:</span>
                  <span className="font-mono text-slate-300">{currentRecord.institutionNuit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estudante:</span>
                  <span className="font-bold text-indigo-400">{currentRecord.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BI / Identificação:</span>
                  <span className="font-mono text-slate-300">{currentRecord.biNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Curso:</span>
                  <span className="font-medium text-slate-200">{currentRecord.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Média Final:</span>
                  <span className="font-black text-emerald-400">{currentRecord.finalGrade} Valores</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-850">
                  <span className="text-slate-500">ID SIVEC:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {currentRecord.sivecId || 'Pendente de registro'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado Legal:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                    currentRecord.status === 'HOMOLOGADO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {currentRecord.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAdvanceStep}
                  disabled={currentRecord.currentStepIndex >= 9}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {currentRecord.currentStepIndex >= 9
                      ? 'Processo SIVEC Concluído'
                      : `Executar Etapa ${currentRecord.currentStepIndex + 2}`}
                  </span>
                </button>

                <button
                  onClick={handleApproveImmediate}
                  disabled={currentRecord.status === 'HOMOLOGADO'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Registrar no SIVEC Imediatamente</span>
                </button>

                <button
                  onClick={handleResetRecord}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-bold text-rose-300 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reiniciar para Etapa 1</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 10-Step Sequential Flow with Arrows (↓) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    Fluxo Sequencial das 10 Etapas SIVEC
                  </h3>
                  <p className="text-xs text-slate-400">
                    Da validação institucional ao registro definitivo no livro ministerial e histórico público.
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                  {currentRecord.status}
                </span>
              </div>

              {/* Steps Vertical List */}
              <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                {SIVEC_WORKFLOW_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentRecord.currentStepIndex;
                  const isCurrent = idx === currentRecord.currentStepIndex;
                  const isPending = idx > currentRecord.currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`relative pl-10 transition-all ${
                        isCurrent
                          ? 'opacity-100'
                          : isCompleted
                          ? 'opacity-90'
                          : 'opacity-40'
                      }`}
                    >
                      {/* Step Indicator */}
                      <div
                        className={`absolute left-0 top-3.5 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all z-10 ${
                          isCompleted
                            ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                            : isCurrent
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : step.stepNumber}
                      </div>

                      {/* Card Content */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                            : isCompleted
                            ? 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                            : 'bg-slate-950/30 border-slate-900'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{step.label}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                              {step.actor}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Concluído
                              </span>
                            )}
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                Em Execução
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[11px] text-slate-500 font-medium">Aguardando</span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{step.description}</p>
                      </div>

                      {/* Visual Arrow Down (↓) */}
                      {idx < 9 && (
                        <div className="flex items-center justify-center my-1 ml-[-24px] text-slate-700">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PORTAL DE VERIFICAÇÃO PÚBLICA, STATUS E HISTÓRICO */}
      {activeTab === 'verification' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">
                  Passos 8 a 10: Verificação Pública, Status & Histórico SIVEC
                </h2>
                <p className="text-xs text-slate-400">
                  Consulte a autenticidade jurídica de qualquer certificado emitido através do identificador nacional ou BI.
                </p>
              </div>
            </div>

            {/* Public Search Bar */}
            <form onSubmit={handleSearchPublic} className="flex gap-2">
              <input
                type="text"
                value={searchIdInput}
                onChange={(e) => setSearchIdInput(e.target.value)}
                placeholder="Insira o ID Único SIVEC (Ex: SIVEC-MZ-2026-009841) ou BI"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm shadow-xl shadow-cyan-600/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Consultar</span>
              </button>
            </form>

            {/* Search Result Box */}
            {hasSearched && searchResult && (
              <div className="p-6 rounded-3xl bg-slate-950 border-2 border-emerald-500/40 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      CERTIFICADO AUTÊNTICO & HOMOLOGADO PELO GOVERNO DE MOÇAMBIQUE
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      {searchResult.studentName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {searchResult.courseName} • Conclusão com {searchResult.finalGrade} Valores
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">9. Status Oficial</span>
                    <span className="text-sm font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block">
                      {searchResult.status}
                    </span>
                  </div>
                </div>

                {/* Technical Identifiers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">4. ID Único SIVEC:</span>
                    <strong className="font-mono text-cyan-400">{searchResult.sivecId}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">1. Instituição Emissora:</span>
                    <strong className="text-slate-200">{searchResult.institutionName}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">7. URL Canônica Pública:</span>
                    <a
                      href={searchResult.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline truncate block font-mono text-[11px]"
                    >
                      {searchResult.publicUrl}
                    </a>
                  </div>
                </div>

                {/* Hash & QR Details */}
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Hash className="w-4 h-4 text-indigo-400" />
                      5. Hash Criptográfico SHA-256 (Inviolável)
                    </div>
                    <div className="font-mono text-[10px] text-slate-300 break-all">
                      {searchResult.sha256Hash}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center">
                      <QrCode className="w-14 h-14 text-slate-950" />
                    </div>
                    <div className="text-left text-[10px] text-slate-400">
                      <strong>6. QR Code Ativo</strong><br />
                      Leitura óptica direta
                    </div>
                  </div>
                </div>

                {/* 10. Histórico de Auditoria */}
                <div className="space-y-2 pt-2 border-t border-slate-850">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-emerald-400" />
                    10. Histórico de Eventos & Averbações
                  </h4>
                  <div className="space-y-1.5">
                    {searchResult.historyEvents.map((evt, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          <span className="text-slate-300">{evt.details}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-slate-500">{evt.actor}</span>
                          <span className="font-mono text-slate-400">
                            {new Date(evt.timestamp).toLocaleTimeString('pt-MZ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {hasSearched && !searchResult && (
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Nenhum certificado localizado no SIVEC</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Certifique-se de que o ID foi digitado corretamente ou avance os passos na aba "Timeline" para homologar o diploma selecionado.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FIREBASE sigar-6754a MULTI-TENANT SAAS INTEGRATION */}
      {activeTab === 'firebase_connect' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Conexão ao Firebase: Projeto <span className="text-amber-400">sigar-6754a</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Arquitetura Multi-Tenant SaaS em produção com garantia de integridade estrutural.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{SIGAR_FIREBASE_INTEGRATION_INFO.connectionStatus}</span>
              </div>
            </div>

            {/* Zero-Destruction Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-2">
              <div className="font-bold text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Diretriz Rigorosa: Zero Destruição & Preservação Total de Dados
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Nenhum dado, coleção legada ou registro pré-existente no projeto <strong className="text-white font-mono">sigar-6754a</strong> é 
                apagado ou substituído. As novas estruturas da plataforma operam de forma isolada por <strong className="text-white">institutionId</strong> (Multi-Tenant SaaS), 
                com adição incremental não destrutiva.
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">Projeto Firebase Ativo:</span>
                <span className="font-mono font-bold text-white text-sm">sigar-6754a</span>
                <span className="text-[10px] text-emerald-400 block pt-1">Ambiente de Produção</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">Modelo de Isolamento:</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">Multi-Tenant SaaS</span>
                <span className="text-[10px] text-slate-400 block pt-1">Chave: institutionId</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">Latência de Ping:</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{SIGAR_FIREBASE_INTEGRATION_INFO.lastPingMs} ms</span>
                <span className="text-[10px] text-slate-400 block pt-1">Cloud Firestore / Auth</span>
              </div>
            </div>

            {/* Multi-Tenant SaaS Isolation Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Mapeamento das Coleções Multi-Tenant & Preservadas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Safe Upsert Collections */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Novas Estruturas Multi-Tenant (Seguras)
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    {SIGAR_FIREBASE_INTEGRATION_INFO.safeUpsertCollections.map(col => (
                      <div key={col} className="flex items-center gap-1.5">
                        <span className="text-slate-600">/</span>
                        <span>{col}</span>
                        <span className="text-[9px] text-slate-500 ml-auto font-sans">Multi-Tenant</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Protected Legacy Collections */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                    <Lock className="w-3.5 h-3.5" />
                    Coleções Pré-Existentes (Protegidas / Read-Only)
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    {SIGAR_FIREBASE_INTEGRATION_INFO.readOnlyProtectedCollections.map(col => (
                      <div key={col} className="flex items-center gap-1.5">
                        <span className="text-slate-600">/</span>
                        <span>{col}</span>
                        <span className="text-[9px] text-amber-400 ml-auto font-sans">Inviolável</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
