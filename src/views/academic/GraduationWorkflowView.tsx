import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowDown, 
  ArrowRight, 
  QrCode, 
  ShieldCheck, 
  Search, 
  FileText, 
  Award, 
  UserCheck, 
  Check, 
  Sparkles, 
  Printer, 
  Download, 
  Share2, 
  ExternalLink,
  ChevronRight,
  BookOpen,
  Calendar,
  Building,
  Hash,
  Copy,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  GRADUATION_WORKFLOW_STEPS, 
  INITIAL_GRADUATION_STUDENTS, 
  StudentGraduationTrack, 
  WorkflowStepDefinition,
  verifyPublicCertificate,
  GraduationStepKey
} from '../../services/graduationWorkflowService';

export const GraduationWorkflowView: React.FC = () => {
  const { activeInstitution: currentInstitution } = useApp();

  const [tracks, setTracks] = useState<StudentGraduationTrack[]>(INITIAL_GRADUATION_STUDENTS);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(INITIAL_GRADUATION_STUDENTS[0].id);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'public_verification' | 'sivec_dinet'>('pipeline');
  
  // Public Verification State
  const [verificationQuery, setVerificationQuery] = useState('CERT-MZ-2026-009841');
  const [verifiedResult, setVerifiedResult] = useState<StudentGraduationTrack | null>(
    verifyPublicCertificate('CERT-MZ-2026-009841')
  );
  const [hasSearched, setHasSearched] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);

  const currentTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];

  // Advance single step
  const handleAdvanceStep = () => {
    if (currentTrack.currentStepIndex >= 16) return;

    const nextIndex = currentTrack.currentStepIndex + 1;
    const nextStepDef = GRADUATION_WORKFLOW_STEPS[nextIndex];

    const updatedTracks = tracks.map(track => {
      if (track.id === currentTrack.id) {
        const newLogs = [...track.stepLogs];
        newLogs.push({
          stepKey: nextStepDef.key,
          completedAt: new Date().toISOString(),
          completedBy: nextStepDef.responsibleRole,
          details: `Etapa concluída: ${nextStepDef.label}`
        });

        const isLast = nextIndex === 16;

        return {
          ...track,
          currentStepIndex: nextIndex,
          status: isLast ? ('CONCLUIDO' as const) : ('EM_PROGRESSO' as const),
          stepLogs: newLogs,
          certificateMetadata: {
            ...track.certificateMetadata,
            certificateNumber: track.certificateMetadata?.certificateNumber || `CERT-MZ-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            finalAverage: track.certificateMetadata?.finalAverage || 16.5,
            attendanceRate: track.certificateMetadata?.attendanceRate || 92.5,
            internshipCompany: track.certificateMetadata?.internshipCompany || 'Portos e Caminhos de Ferro de Moçambique (CFM)',
            internshipGrade: track.certificateMetadata?.internshipGrade || 17.0,
            sivecProtocol: track.certificateMetadata?.sivecProtocol || `DINET-ANEP-MZ-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            qrValidationUrl: `https://sigar.co.mz/validar/${track.studentNumber}`,
            sha256Hash: track.certificateMetadata?.sha256Hash || 'a7c4e88392fb142a781b4d0092c478a8f4c8996fb92427ae41e4649b934ca495',
            issuedAt: isLast ? new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' }) : track.certificateMetadata?.issuedAt
          }
        };
      }
      return track;
    });

    setTracks(updatedTracks);
  };

  // Run all steps to completion
  const handleCompleteAllSteps = () => {
    const updatedTracks = tracks.map(track => {
      if (track.id === currentTrack.id) {
        const fullLogs = GRADUATION_WORKFLOW_STEPS.map((step) => ({
          stepKey: step.key,
          completedAt: new Date().toISOString(),
          completedBy: step.responsibleRole,
          details: `Etapa validada: ${step.label}`
        }));

        return {
          ...track,
          currentStepIndex: 16,
          status: 'CONCLUIDO' as const,
          stepLogs: fullLogs,
          certificateMetadata: {
            ...track.certificateMetadata,
            certificateNumber: track.certificateMetadata?.certificateNumber || `CERT-MZ-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            finalAverage: track.certificateMetadata?.finalAverage || 16.8,
            attendanceRate: track.certificateMetadata?.attendanceRate || 94.0,
            internshipCompany: track.certificateMetadata?.internshipCompany || 'Vodacom Moçambique / Cervejas de Moçambique',
            internshipGrade: track.certificateMetadata?.internshipGrade || 18.0,
            directorApprovalDate: new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' }),
            sivecProtocol: `DINET-ANEP-MZ-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            qrValidationUrl: `https://sigar.co.mz/validar/${track.studentNumber}`,
            sha256Hash: 'f4b3e99182ac45129afbf4c8996fb92427ae41e4649b934ca495991b7852c710',
            issuedAt: new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' })
          }
        };
      }
      return track;
    });

    setTracks(updatedTracks);
  };

  // Reset track
  const handleResetTrack = () => {
    const updatedTracks = tracks.map(track => {
      if (track.id === currentTrack.id) {
        return {
          ...track,
          currentStepIndex: 0,
          status: 'EM_PROGRESSO' as const,
          stepLogs: [
            { stepKey: 'matriculado' as const, completedAt: new Date().toISOString(), completedBy: 'Secretaria Académica', details: 'Matrícula regularizada' }
          ]
        };
      }
      return track;
    });

    setTracks(updatedTracks);
  };

  const handleSearchVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const result = verifyPublicCertificate(verificationQuery);
    setVerifiedResult(result);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              Módulo 71: Orquestração Curricular e Diplomação Oficial
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              71. Fluxo Completo de Conclusão de Curso
            </h1>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Cadeia ininterrupta de 17 etapas sequenciais: desde a matrícula e frequência até a emissão no 
              <strong className="text-white font-semibold"> Document Studio</strong>, validação com o 
              <strong className="text-white font-semibold"> SIVEC (DINET/ANEP/MEC)</strong> e verificação pública com QR Code.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('public_verification')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Verificação Pública Nacional</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-800 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Pipeline de 17 Etapas</span>
          </button>
          <button
            onClick={() => setActiveTab('public_verification')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'public_verification'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Validador Público & Diploma</span>
          </button>
          <button
            onClick={() => setActiveTab('sivec_dinet')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sivec_dinet'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Integração SIVEC & Document Studio</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PIPELINE DE 17 ETAPAS */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Student Selector & Quick Controls */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Estudante em Processamento
              </h2>

              <div className="space-y-2">
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      track.id === currentTrack.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">{track.studentNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        track.status === 'CONCLUIDO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {track.status === 'CONCLUIDO' ? '17/17 Concluído' : `${track.currentStepIndex + 1}/17 Etapas`}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{track.studentName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{track.courseName}</div>
                  </button>
                ))}
              </div>

              {/* Progress Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Progresso da Graduação:</span>
                  <span className="font-bold text-white">
                    {Math.round(((currentTrack.currentStepIndex + 1) / 17) * 100)}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 rounded-full"
                    style={{ width: `${((currentTrack.currentStepIndex + 1) / 17) * 100}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-slate-850 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Etapa Atual:</span>
                    <span className="font-bold text-emerald-400">
                      {GRADUATION_WORKFLOW_STEPS[currentTrack.currentStepIndex]?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Responsável:</span>
                    <span className="font-bold text-slate-300">
                      {GRADUATION_WORKFLOW_STEPS[currentTrack.currentStepIndex]?.responsibleRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Advancement Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAdvanceStep}
                  disabled={currentTrack.currentStepIndex >= 16}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-40"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {currentTrack.currentStepIndex >= 16 
                      ? 'Diploma Totalmente Emitido' 
                      : `Avançar para Etapa ${currentTrack.currentStepIndex + 2}`}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCompleteAllSteps}
                    disabled={currentTrack.currentStepIndex >= 16}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Concluir Tudo</span>
                  </button>

                  <button
                    onClick={handleResetTrack}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-bold text-rose-300 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reiniciar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Audit & Security Box */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2 text-slate-400">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                Segurança Imutável & Zero-Trust
              </div>
              <p>
                Cada avanço no fluxo gera carimbo de tempo, IP e assinatura digital. O certificado não pode ser emitido sem a aprovação do Diretor e validação prévia de 75% de frequência e notas.
              </p>
            </div>
          </div>

          {/* Right Column: Visual 17-Step Sequential Stepper */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    Cadeia Completa: 17 Etapas Obrigatórias
                  </h3>
                  <p className="text-xs text-slate-400">
                    Acompanhe o estado de cada elo na cadeia de conclusão do estudante {currentTrack.studentName}.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold font-mono">
                  BI: {currentTrack.biNumber}
                </div>
              </div>

              {/* 17 Steps Vertical Interactive Timeline */}
              <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                {GRADUATION_WORKFLOW_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentTrack.currentStepIndex;
                  const isCurrent = idx === currentTrack.currentStepIndex;
                  const isPending = idx > currentTrack.currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`relative pl-10 transition-all ${
                        isCurrent
                          ? 'opacity-100'
                          : isCompleted
                          ? 'opacity-90'
                          : 'opacity-50'
                      }`}
                    >
                      {/* Step Indicator Bullet */}
                      <div
                        className={`absolute left-0 top-3.5 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all z-10 ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
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
                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                            : isCompleted
                            ? 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                            : 'bg-slate-950/30 border-slate-900'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{step.label}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                              {step.responsibleRole}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Validado
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

                        {/* Requirements Badges */}
                        <div className="mt-3 pt-2.5 border-t border-slate-850 flex flex-wrap gap-1.5">
                          {step.requirements.map((req, reqIdx) => (
                            <span
                              key={reqIdx}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-medium"
                            >
                              • {req}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Visual Arrow Down */}
                      {idx < 16 && (
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

      {/* TAB 2: VALIDADOR PÚBLICO & DIPLOMA OFICIAL */}
      {activeTab === 'public_verification' && (
        <div className="space-y-6">
          {/* Public Search Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">
                  17. Portal de Verificação Pública Nacional de Certificados
                </h2>
                <p className="text-xs text-slate-400">
                  Consulte a autenticidade de qualquer diploma emitido através do número do certificado, protocolo SIVEC, B.I. ou código do aluno.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearchVerification} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={verificationQuery}
                  onChange={(e) => setVerificationQuery(e.target.value)}
                  placeholder="Ex: CERT-MZ-2026-009841 ou 110100459812A ou ALU-2026-0041"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Verificar Autenticidade</span>
              </button>
            </form>
          </div>

          {/* Verified Certificate Display */}
          {hasSearched && verifiedResult ? (
            <div className="space-y-6">
              {/* Authenticity Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-black text-white block">
                      CERTIFICADO OFICIALMENTE RECONHECIDO E REGISTADO NO SIVEC
                    </span>
                    <span className="text-xs text-emerald-300">
                      Autenticidade confirmada pelo Ministério da Educação e Desenvolvimento Humano / DINET / ANEP.
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                  <span>HASH VERIFICADO</span>
                </div>
              </div>

              {/* Visual Simulated Certificate (Document Studio Output) */}
              <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-slate-900 font-serif">
                {/* Visual Certificate Paper Effect */}
                <div className="absolute inset-2 border border-amber-500/30 rounded-2xl pointer-events-none" />
                <div className="absolute inset-4 border-2 border-dashed border-amber-500/20 rounded-xl pointer-events-none" />

                <div className="relative z-10 bg-amber-50/95 text-slate-900 p-8 sm:p-12 rounded-xl shadow-inner space-y-8">
                  {/* Header */}
                  <div className="text-center space-y-2 border-b-2 border-amber-900/20 pb-6">
                    <div className="text-xs tracking-widest font-sans font-bold text-amber-900 uppercase">
                      REPÚBLICA DE MOÇAMBIQUE
                    </div>
                    <div className="text-[11px] tracking-wider font-sans font-medium text-slate-700 uppercase">
                      MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO • DINET / ANEP
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 uppercase tracking-wide pt-2">
                      {verifiedResult.institutionName}
                    </h2>
                    <div className="text-xs font-sans font-semibold text-emerald-800">
                      Autorização Governamental n.º 412/MEC-DINET/2024
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-4 text-center max-w-2xl mx-auto font-serif">
                    <p className="text-sm text-slate-700 italic">
                      O Diretor Geral do {verifiedResult.institutionName}, no uso das atribuições que lhe são conferidas pela legislação em vigor, certifica que:
                    </p>

                    <div className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-wider py-1 border-b border-amber-900/30">
                      {verifiedResult.studentName}
                    </div>

                    <p className="text-xs font-sans text-slate-700">
                      Titular do B.I. n.º <strong>{verifiedResult.biNumber}</strong>, Processo n.º <strong>{verifiedResult.studentNumber}</strong>
                    </p>

                    <p className="text-sm text-slate-800 leading-relaxed pt-2">
                      Concluiu com aproveitamento o plano curricular do curso de:
                    </p>

                    <div className="text-lg sm:text-xl font-bold text-amber-950 font-serif uppercase">
                      {verifiedResult.courseName}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-sans text-xs pt-4 max-w-lg mx-auto">
                      <div className="p-2 rounded bg-amber-100/60 border border-amber-300 text-center">
                        <span className="text-[10px] text-slate-600 block">Média Final:</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {verifiedResult.certificateMetadata?.finalAverage} Valores
                        </span>
                      </div>
                      <div className="p-2 rounded bg-amber-100/60 border border-amber-300 text-center">
                        <span className="text-[10px] text-slate-600 block">Assiduidade:</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {verifiedResult.certificateMetadata?.attendanceRate}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-amber-100/60 border border-amber-300 text-center col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-600 block">Estágio CFM/BCI:</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {verifiedResult.certificateMetadata?.internshipGrade} Valores
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures & Seals */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-6 pt-8 border-t-2 border-amber-900/20 font-sans text-xs">
                    {/* Left: Director Signature */}
                    <div className="text-center space-y-2">
                      <div className="h-10 flex items-center justify-center italic text-slate-700 font-serif border-b border-slate-700 pb-1">
                        Assinatura Digital Qualificada
                      </div>
                      <div className="font-bold text-slate-900">Dr. Alberto Mondlane</div>
                      <div className="text-[10px] text-slate-600">Diretor Pedagógico Geral</div>
                    </div>

                    {/* Center: Official Seal & QR Code */}
                    <div className="flex flex-col items-center text-center space-y-1">
                      <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-slate-900" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-600">
                        {verifiedResult.certificateMetadata?.certificateNumber}
                      </span>
                    </div>

                    {/* Right: SIVEC National Registration */}
                    <div className="text-center space-y-2">
                      <div className="p-2 rounded bg-emerald-100/80 border border-emerald-400 text-[10px] text-emerald-950 font-bold space-y-1">
                        <div>SIVEC DINET / ANEP</div>
                        <div className="font-mono text-[9px] text-slate-700">
                          {verifiedResult.certificateMetadata?.sivecProtocol}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-600">
                        Maputo, {verifiedResult.certificateMetadata?.issuedAt || '04 de Setembro de 2026'}
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Hash Bar */}
                  <div className="pt-4 border-t border-amber-200 text-[10px] font-mono text-slate-600 flex flex-wrap items-center justify-between gap-2">
                    <span className="truncate max-w-md">
                      SHA-256: {verifiedResult.certificateMetadata?.sha256Hash}
                    </span>
                    <button
                      onClick={() => copyHash(verifiedResult.certificateMetadata?.sha256Hash || '')}
                      className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer font-sans"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Copiado!' : 'Copiar Hash'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhum certificado localizado para esta chave</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Verifique se digitou corretamente o número do documento, B.I. ou protocolo SIVEC. Certificados em processamento nas etapas 1 a 14 ainda não estão públicos.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 3: INTEGRAÇÃO SIVEC & DOCUMENT STUDIO */}
      {activeTab === 'sivec_dinet' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-400" />
              Padrões Técnicos das Etapas 11 a 14 (Document Studio, Assinaturas, QR e SIVEC)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              O ecossistema garante que nenhuma instituição privada ou pública emita diplomas sem a conformidade curricular exigida pelos órgãos tutelares em Moçambique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Studio Variables */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  11. Injeção de 42 Variáveis no Document Studio
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                  DINET Template v2.4
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { k: '{{aluno.nome}}', v: currentTrack.studentName },
                  { k: '{{aluno.bi}}', v: currentTrack.biNumber },
                  { k: '{{aluno.numero}}', v: currentTrack.studentNumber },
                  { k: '{{curso.nome}}', v: currentTrack.courseName },
                  { k: '{{curso.codigo}}', v: currentTrack.courseCode },
                  { k: '{{nota.media_final}}', v: `${currentTrack.certificateMetadata?.finalAverage || 16.5} val` },
                  { k: '{{estagio.horas}}', v: '400 Horas' },
                  { k: '{{estagio.empresa}}', v: currentTrack.certificateMetadata?.internshipCompany || 'BCI / CFM' }
                ].map((item, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                    <span className="text-indigo-400 block text-[10px]">{item.k}</span>
                    <span className="text-slate-300 truncate block text-[11px]">{item.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SIVEC Interoperability Protocol */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  14. Barramento Governamental SIVEC / ANEP
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                  REST API SSL v3
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-xs font-mono text-slate-300 space-y-2">
                <div className="text-slate-500">// Payload submetido à DINET / MEC:</div>
                <div className="text-emerald-400">{`{`}</div>
                <div className="pl-4">
                  <div>"instituicao_nuit": "{currentInstitution.nuit || '400123987'}",</div>
                  <div>"estudante_bi": "{currentTrack.biNumber}",</div>
                  <div>"curso_homologado": "{currentTrack.courseCode}",</div>
                  <div>"media_conclusao": {currentTrack.certificateMetadata?.finalAverage || 16.5},</div>
                  <div>"despacho_diretor": "{currentTrack.certificateMetadata?.directorApprovalDate || '03/09/2026'}",</div>
                  <div>"status_sivec": "REGISTADO_PUBLICO"</div>
                </div>
                <div className="text-emerald-400">{`}`}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
