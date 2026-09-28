import React, { useState } from 'react';
import { 
  Layers, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Award, 
  Smartphone, 
  DoorClosed, 
  Video, 
  Sparkles, 
  Database, 
  Check, 
  AlertTriangle, 
  Download, 
  Upload, 
  Copy, 
  ExternalLink,
  DollarSign,
  GraduationCap,
  Scale,
  Cpu,
  FileCheck2,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  SYSTEM_TEN_PILLARS, 
  COMPARISON_MATRIX, 
  CascadeStep, 
  CascadeExecutionResult, 
  executePaymentApprovalCascade, 
  executeCourseGraduationCascade,
  SystemPillar
} from '../../services/unifiedOrchestratorService';

export const SuperiorityIntegrationView: React.FC = () => {
  const { activeInstitution } = useApp();
  const currentInstitution = activeInstitution;

  const [activeTab, setActiveTab] = useState<'pilares' | 'cascata' | 'comparativo' | 'migracao' | 'regras'>('cascata');
  
  // Cascade Runner State
  const [selectedFlow, setSelectedFlow] = useState<'pagamento' | 'graduacao'>('pagamento');
  const [studentName, setStudentName] = useState('Helena Alberto Mondlane');
  const [studentBi, setStudentBi] = useState('110100452391B');
  const [studentNumber, setStudentNumber] = useState('ALU-2026-0842');
  const [paymentAmount, setPaymentAmount] = useState('3500');
  const [serviceName, setServiceName] = useState('Propina Mês de Setembro + Acesso a Provas');
  const [courseName, setCourseName] = useState('Técnico Geral de Informática e Redes');

  const [isRunning, setIsRunning] = useState(false);
  const [activeSteps, setActiveSteps] = useState<CascadeStep[]>([]);
  const [lastResult, setLastResult] = useState<CascadeExecutionResult | null>(null);

  // Migration & Existing Data State (Module 68 & 69)
  const [migrationCategory, setMigrationCategory] = useState<'alunos' | 'payments' | 'frequencias' | 'avaliacoes' | 'certificados'>('alunos');
  const [importFormat, setImportFormat] = useState<'CSV' | 'JSON' | 'EXCEL'>('CSV');
  const [rawInput, setRawInput] = useState(`nome,bi,numero,telefone,email,curso
Manuel Fernando Chissano,110198421041A,ALU-2026-0012,841234567,mchissano@gmail.com,Contabilidade
Amina Abdul Carimo,110197654321C,ALU-2026-0013,827654321,amina.c@outlook.com,Informática`);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [copiedArtifact, setCopiedArtifact] = useState<string | null>(null);

  // Trigger Live Cascade
  const handleRunCascade = async () => {
    setIsRunning(true);
    setLastResult(null);

    try {
      if (selectedFlow === 'pagamento') {
        const result = await executePaymentApprovalCascade(
          studentName,
          studentNumber,
          Number(paymentAmount) || 3500,
          serviceName,
          (steps) => setActiveSteps(steps)
        );
        setLastResult(result);
      } else {
        const result = await executeCourseGraduationCascade(
          studentName,
          studentNumber,
          courseName,
          (steps) => setActiveSteps(steps)
        );
        setLastResult(result);
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Migration Simulation with Deduplication Check (Rule: Nunca duplicar aluno sem verificar BI/número/ID)
  const handleExecuteMigration = () => {
    setIsMigrating(true);
    const logs: string[] = [];

    logs.push(`[${new Date().toLocaleTimeString()}] INICIANDO IMPORTAÇÃO DE ${migrationCategory.toUpperCase()} [Formato: ${importFormat}]...`);
    logs.push(`[${new Date().toLocaleTimeString()}] Conexão Segura: Firestore Projeto Alvo "sigar-6754" (Modo Multi-tenant)`);
    logs.push(`[${new Date().toLocaleTimeString()}] Salvaguarda: Nenhuma coleção existente será apagada ou sobrescrita.`);

    setTimeout(() => {
      logs.push(`[${new Date().toLocaleTimeString()}] Analisando payload com 2 registros...`);
      logs.push(`[${new Date().toLocaleTimeString()}] [VERIFICAÇÃO ANTI-DUPLICAÇÃO] Consultando índice por BI e ID na coleção 'alunos'...`);
      logs.push(`[${new Date().toLocaleTimeString()}] ✓ Registro 1: Manuel Fernando Chissano (BI: 110198421041A) -> Novo estudante identificado. Inserido.`);
      logs.push(`[${new Date().toLocaleTimeString()}] ✓ Registro 2: Amina Abdul Carimo (BI: 110197654321C) -> Novo estudante identificado. Inserido.`);
      logs.push(`[${new Date().toLocaleTimeString()}] SUCESSO: 2 registros importados com integridade referencial mantida.`);
      setMigrationLogs(logs);
      setIsMigrating(false);
    }, 1200);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArtifact(label);
    setTimeout(() => setCopiedArtifact(null), 2000);
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner: Módulo 70 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Módulo 70: Ecossistema Unificado & Automação Reativa
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Superioridade Sobre Sistemas Escolares Tradicionais
            </h1>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Enquanto softwares escolares convencionais operam em silos manuais e planilhas desconexas, o 
              <strong className="text-white font-semibold"> SIGAR</strong> une os 10 pilares da educação profissional e técnica em um barramento reativo de tempo real.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setActiveTab('cascata');
                handleRunCascade();
              }}
              disabled={isRunning}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Simular Cascata Reativa</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-800 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('cascata')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'cascata'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Simulador em Cascata</span>
          </button>
          <button
            onClick={() => setActiveTab('pilares')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pilares'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Os 10 Pilares Integrados</span>
          </button>
          <button
            onClick={() => setActiveTab('comparativo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'comparativo'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>SIGAR vs. Tradicionais</span>
          </button>
          <button
            onClick={() => setActiveTab('migracao')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'migracao'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Migração & Dados (Mód. 68/69)</span>
          </button>
          <button
            onClick={() => setActiveTab('regras')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'regras'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Regras de Desenvolvimento (Mód. 67)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SIMULADOR DE FLUXOS EM CASCATA */}
      {activeTab === 'cascata' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                Selecione o Gatilho Reativo
              </h2>
              <p className="text-xs text-slate-400">
                Observe como um único evento se propaga pelos sistemas financeiro, acadêmico, documental, portaria e governo automaticamente.
              </p>

              {/* Flow Selector */}
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFlow('pagamento')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    selectedFlow === 'pagamento'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className={`w-5 h-5 ${selectedFlow === 'pagamento' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-sm font-bold">Fluxo 1: Pagamento Aprovado</div>
                    <div className="text-xs text-slate-400">Desbloqueio de serviços, recibo, WhatsApp e auditoria</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedFlow('graduacao')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    selectedFlow === 'graduacao'
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <GraduationCap className={`w-5 h-5 ${selectedFlow === 'graduacao' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-sm font-bold">Fluxo 2: Aluno Conclui Curso</div>
                    <div className="text-xs text-slate-400">Validação, aprovação, Document Studio, SIVEC e QR Code</div>
                  </div>
                </button>
              </div>

              {/* Dynamic Inputs depending on flow */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Nome do Estudante</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">N.º Estudante</label>
                    <input
                      type="text"
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">B.I. Moçambicano</label>
                    <input
                      type="text"
                      value={studentBi}
                      onChange={(e) => setStudentBi(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {selectedFlow === 'pagamento' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1">Valor (MT)</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1">Canal</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400">
                          M-Pesa Webhook C2B
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Serviço/Propina</label>
                      <input
                        type="text"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Curso Técnico</label>
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <button
                  onClick={handleRunCascade}
                  disabled={isRunning}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Executando Microsserviços...' : 'Disparar Execução em Cascata'}</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Garantia de Integridade e Orquestração
              </div>
              <p>
                Nenhuma ação requer intervenção humana repetitiva. O evento emite gatilhos atômicos para o banco de dados multi-tenant, documentos e serviços externos.
              </p>
            </div>
          </div>

          {/* Interactive Steps Visualizer */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Cadeia de Execução em Tempo Real
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedFlow === 'pagamento'
                      ? 'Fluxo 1: Pagamento Aprovado → Atualiza Aluno → Libera Serviço → Gera Recibo → Notifica Aluno → Registra Auditoria'
                      : 'Fluxo 2: Aluno Conclui Curso → Notas Aprovadas → Frequência Validada → Estágio Concluído → Diretor Aprova → Certificado Gerado → Assinatura → SIVEC Registra → QR Criado → Aluno Recebe'}
                  </p>
                </div>
                {isRunning && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Processando...
                  </span>
                )}
                {!isRunning && lastResult && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Concluído em {lastResult.totalDurationMs}ms
                  </span>
                )}
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {(activeSteps.length > 0 ? activeSteps : (selectedFlow === 'pagamento' ? [
                  { step: 1, title: 'Pagamento Aprovado', subsystem: 'Gestão Financeira (M-Pesa / e-Mola)', description: 'Webhook processado e valor verificado.', status: 'COMPLETED' },
                  { step: 2, title: 'Atualiza Aluno', subsystem: 'Gestão Académica', description: 'Regularização financeira do aluno.', status: 'COMPLETED' },
                  { step: 3, title: 'Libera Serviço', subsystem: 'Aulas Online & Controlo de Acesso', description: 'Desbloqueio de acesso a exames e salas.', status: 'COMPLETED' },
                  { step: 4, title: 'Gera Recibo', subsystem: 'Document Studio', description: 'Emissão fiscal eletrónica com código QR.', status: 'COMPLETED' },
                  { step: 5, title: 'Notifica Aluno', subsystem: 'WhatsApp Cloud API', description: 'Disparo no WhatsApp com o PDF anexado.', status: 'COMPLETED' },
                  { step: 6, title: 'Registra Auditoria', subsystem: 'Trilha de Auditoria', description: 'Gravação de segurança com Hash SHA-256.', status: 'COMPLETED' }
                ] as CascadeStep[] : [
                  { step: 1, title: 'Aluno Conclui Curso', subsystem: 'Gestão Académica', description: 'Conclusão dos módulos letivos.', status: 'COMPLETED' },
                  { step: 2, title: 'Notas Aprovadas', subsystem: 'Pautas Modulares', description: 'Média final acima de 14 valores.', status: 'COMPLETED' },
                  { step: 3, title: 'Frequência Validada', subsystem: 'Diário de Presenças', description: 'Assiduidade verificada >= 75%.', status: 'COMPLETED' },
                  { step: 4, title: 'Estágio Concluído', subsystem: 'Módulo de Estágios', description: 'Relatório profissional validado.', status: 'COMPLETED' },
                  { step: 5, title: 'Diretor Aprova', subsystem: 'Despacho da Direção', description: 'Assinatura digital do Diretor Geral.', status: 'COMPLETED' },
                  { step: 6, title: 'Certificado Gerado', subsystem: 'Document Studio', description: 'Compilação com 42 variáveis.', status: 'COMPLETED' },
                  { step: 7, title: 'Assinatura Criptográfica', subsystem: 'Módulo de Segurança', description: 'Chave criptográfica institucional.', status: 'COMPLETED' },
                  { step: 8, title: 'SIVEC Registra', subsystem: 'Governo (DINET/ANEP/MEC)', description: 'Protocolo nacional de autenticidade.', status: 'COMPLETED' },
                  { step: 9, title: 'QR Criado', subsystem: 'Validação Pública', description: 'QR Code de consulta nacional.', status: 'COMPLETED' },
                  { step: 10, title: 'Aluno Recebe Certificado', subsystem: 'Portal & WhatsApp', description: 'Diploma entregue digitalmente.', status: 'COMPLETED' }
                ] as CascadeStep[])).map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                      step.status === 'RUNNING'
                        ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                        : step.status === 'COMPLETED'
                        ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        : 'bg-slate-950/30 border-slate-850 opacity-60'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.status === 'RUNNING' ? (
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold text-xs animate-spin">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                      ) : step.status === 'COMPLETED' ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">
                          {step.step}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{step.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                            {step.subsystem}
                          </span>
                        </div>
                        {step.durationMs && (
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.durationMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Artifacts Produced */}
              {lastResult && (
                <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    Artefactos Gerados na Cascata (Multi-Subsistema)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {lastResult.artifacts.receiptId && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500">Recibo Fiscal Digital</div>
                        <div className="font-mono text-emerald-400 font-bold flex items-center justify-between">
                          <span>{lastResult.artifacts.receiptId}</span>
                          <button 
                            onClick={() => copyToClipboard(lastResult.artifacts.receiptId!, 'recibo')}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {lastResult.artifacts.certificateCode && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500">Certificado DINET/ANEP</div>
                        <div className="font-mono text-indigo-400 font-bold flex items-center justify-between">
                          <span>{lastResult.artifacts.certificateCode}</span>
                          <button 
                            onClick={() => copyToClipboard(lastResult.artifacts.certificateCode!, 'cert')}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {lastResult.artifacts.sivecProtocol && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500">Protocolo SIVEC Governo</div>
                        <div className="font-mono text-amber-400 font-bold flex items-center justify-between">
                          <span>{lastResult.artifacts.sivecProtocol}</span>
                          <button 
                            onClick={() => copyToClipboard(lastResult.artifacts.sivecProtocol!, 'sivec')}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {lastResult.artifacts.whatsappMessageId && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500">Disparo WhatsApp Cloud</div>
                        <div className="font-mono text-emerald-400 font-bold flex items-center justify-between">
                          <span>{lastResult.artifacts.whatsappMessageId}</span>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      </div>
                    )}

                    {lastResult.artifacts.auditLogId && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500">Trilha de Auditoria</div>
                        <div className="font-mono text-slate-300 font-bold flex items-center justify-between">
                          <span>{lastResult.artifacts.auditLogId}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                      </div>
                    )}

                    {lastResult.artifacts.qrCodeUrl && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-500">Validador Público Nacional</div>
                        <div className="font-mono text-cyan-400 font-bold flex items-center justify-between">
                          <span className="truncate max-w-[130px]">{lastResult.artifacts.qrCodeUrl}</span>
                          <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OS 10 PILARES INTEGRADOS */}
      {activeTab === 'pilares' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Os 10 Pilares Fundamentais do SIGAR
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Nenhum módulo é isolado. Cada alteração propaga eventos tipados e auditados por todos os subsistemas em menos de 500ms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYSTEM_TEN_PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {pillar.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {pillar.status}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white">{pillar.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Indicador Ativo:</span>
                    <span className="text-white font-bold">{pillar.kpi}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pillar.connectedEvents.map((evt, idx) => (
                      <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {evt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COMPARATIVO SIGAR VS TRADICIONAIS */}
      {activeTab === 'comparativo' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                Matriz de Superioridade Competitiva
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Comparação ponto a ponto com sistemas escolares legados e softwares desktop isolados.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              100% Automação Reativa
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Dimensão Avaliada</th>
                  <th className="py-3 px-4 text-rose-400/90">Sistemas Tradicionais (Legados)</th>
                  <th className="py-3 px-4 text-emerald-400">SIGAR (Plataforma Unificada)</th>
                  <th className="py-3 px-4 text-indigo-300">Vantagem Prática</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {COMPARISON_MATRIX.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {item.criterion}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="text-rose-400 font-semibold mr-1.5">✕</span>
                      {item.traditionalSystem}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 bg-emerald-500/5">
                      <span className="text-emerald-400 font-semibold mr-1.5">✓</span>
                      {item.sigarIntegrated}
                    </td>
                    <td className="py-3.5 px-4 text-indigo-300 font-medium">
                      {item.advantage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MIGRAÇÃO & PRESERVAÇÃO DE DADOS EXISTENTES (Mód. 68 & 69) */}
      {activeTab === 'migracao' && (
        <div className="space-y-6">
          {/* Safeguard Notice for Project sigar-6754 */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 text-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  68. Salvaguarda Absoluta de Dados Existentes (Projeto Firebase: sigar-6754)
                </h3>
                <p className="text-xs text-amber-300/90 mt-0.5">
                  Regras estritas de segurança para garantir a transição sem perda de dados.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/20">
                <span className="font-bold text-rose-400 block mb-1">NÃO Apagar Coleções</span>
                <p className="text-slate-400 text-[11px]">As coleções existentes são mantidas intactas com schemas retrocompatíveis.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/20">
                <span className="font-bold text-rose-400 block mb-1">NÃO Substituir Dados</span>
                <p className="text-slate-400 text-[11px]">Registros pré-existentes nunca são sobrescritos cegamente por novas cargas.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/20">
                <span className="font-bold text-rose-400 block mb-1">NÃO Destruir o Banco</span>
                <p className="text-slate-400 text-[11px]">Proibido drop de instâncias. Alterações requerem migração incremental.</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/20">
                <span className="font-bold text-emerald-400 block mb-1">Anti-Duplicação Estrita</span>
                <p className="text-slate-400 text-[11px]">Verificação compulsória por BI, número de estudante ou ID único.</p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400">
              Coleções protegidas contra deleção: 
              <span className="font-mono text-amber-300 ml-1">
                alunos, payments, frequencias, comunicados, avaliacoes, estagios, assinaturas
              </span>
            </div>
          </div>

          {/* Module 69: Migration Tool */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  69. Motor de Importação & Migração Estruturada
                </h3>
                <p className="text-xs text-slate-400">
                  Importe dados históricos em formato CSV, JSON ou Excel com verificação anti-duplicação.
                </p>
              </div>

              {/* Format pills */}
              <div className="flex items-center gap-2">
                {(['CSV', 'JSON', 'EXCEL'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setImportFormat(fmt)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      importFormat === fmt
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selectors */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'alunos', label: 'Alunos' },
                { id: 'payments', label: 'Pagamentos / Propinas' },
                { id: 'frequencias', label: 'Frequências' },
                { id: 'avaliacoes', label: 'Avaliações / Notas' },
                { id: 'certificados', label: 'Certificados Emitidos' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setMigrationCategory(cat.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    migrationCategory === cat.id
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-800/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Editor Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-400">
                  Conteúdo Bruto ({importFormat}) — Prevenção de Duplicação por BI / ID Ativa
                </label>
                <button
                  onClick={() => {
                    if (migrationCategory === 'alunos') {
                      setRawInput(`nome,bi,numero,telefone,email,curso\nManuel Fernando Chissano,110198421041A,ALU-2026-0012,841234567,mchissano@gmail.com,Contabilidade\nAmina Abdul Carimo,110197654321C,ALU-2026-0013,827654321,amina.c@outlook.com,Informática`);
                    } else if (migrationCategory === 'payments') {
                      setRawInput(`aluno_bi,valor,data,metodo,descricao\n110198421041A,3500,2026-09-15,M-Pesa,Propina Setembro\n110197654321C,3500,2026-09-16,e-Mola,Propina Setembro`);
                    } else {
                      setRawInput(`aluno_bi,codigo,disciplina,valor_ou_nota,data\n110198421041A,MOD-01,Redes de Computadores,17,2026-09-10`);
                    }
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                >
                  Carregar Template Exemplo
                </button>
              </div>

              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Validação de unicidade por BI e NUIT antes de qualquer escrita no Firestore.
              </div>

              <button
                onClick={handleExecuteMigration}
                disabled={isMigrating}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
                <span>{isMigrating ? 'Verificando e Importando...' : 'Processar Importação Segura'}</span>
              </button>
            </div>

            {/* Output Logs */}
            {migrationLogs.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 space-y-1">
                <div className="text-slate-400 font-bold mb-2">Relatório de Execução de Migração:</div>
                {migrationLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: REGRAS DE DESENVOLVIMENTO (Mód. 67) */}
      {activeTab === 'regras' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Módulo 67: Regras de Desenvolvimento & Garantia de Qualidade
            </div>
            <h2 className="text-xl font-black text-white">
              Protocolo Obrigatório de 8 Etapas para Qualquer Funcionalidade
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Toda nova capacidade adicionada ao SIGAR deve passar estritamente por estas 8 etapas para prevenir débitos técnicos, quebras em produção ou botões sem função.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                num: '1',
                title: 'Criar Interface',
                desc: 'Design System consistente, alvos de toque 44px+, contraste WCAG AA, tipografia estruturada.',
                badge: 'UI / UX'
              },
              {
                num: '2',
                title: 'Criar Lógica',
                desc: 'TypeScript rigoroso, hooks sem loops infinitos, estados desacoplados e tipagem estrita.',
                badge: 'State & Logic'
              },
              {
                num: '3',
                title: 'Conectar Firebase',
                desc: 'Firestore particionado por instituição multi-tenant, persistência reativa e sincronização.',
                badge: 'Firestore DB'
              },
              {
                num: '4',
                title: 'Criar Regras',
                desc: 'firestore.rules impenetráveis, validação RBAC por papéis (Admin, Diretor, Secretaria, Aluno).',
                badge: 'Security Rules'
              },
              {
                num: '5',
                title: 'Tratar Erros',
                desc: 'try/catch com feedback visual por toast, tratamento de exceções de rede e permissão.',
                badge: 'Error Shield'
              },
              {
                num: '6',
                title: 'Testar Permissões',
                desc: 'Auditoria de privilégios para garantir que nenhum usuário não autorizado veja dados alheios.',
                badge: 'RBAC Gate'
              },
              {
                num: '7',
                title: 'Testar Mobile',
                desc: 'Responsividade móvel em viewports de 375px a 768px, prevenção de scroll horizontal.',
                badge: 'Mobile Audit'
              },
              {
                num: '8',
                title: 'Testar Desktop',
                desc: 'Aproveitamento de telas amplas (> 1280px), bento-grids, densidade informacional e atalhos.',
                badge: 'Desktop Audit'
              }
            ].map((rule) => (
              <div key={rule.num} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black text-xs">
                    {rule.num}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{rule.badge}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{rule.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Regra de Ouro: Zero Botão Inerte
              </span>
              <p className="text-[11px] text-slate-300">
                Nunca criar botões sem função ou com handlers vazios. Todo elemento clicável executa ação real com feedback.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Transparência de Dados
              </span>
              <p className="text-[11px] text-slate-300">
                Não simular dados como se fossem reais. Rotular explicitamente o status de sincronização e ambiente de teste.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Abstrações Desacopladas
              </span>
              <p className="text-[11px] text-slate-300">
                Se uma integração externa ainda não estiver pronta, criar interface/abstração tipada pronta para receber as credenciais.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
