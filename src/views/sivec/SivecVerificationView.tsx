import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Cpu, 
  Smartphone, 
  Globe, 
  AlertTriangle,
  CheckCircle2,
  Award,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SivecPillarId, SivecRegistryEntry, SivecCoreMetrics, SivecCredentialState, SivecHistoryEvent } from './types';
import { 
  INITIAL_SIVEC_METRICS, 
  SIVEC_LEGAL_MANDATE 
} from './mockSivecData';
import { getSivecRegistry, saveSivecRegistry } from './sivecStorage';
import { SivecCoreTab } from './components/SivecCoreTab';
import { SivecRegistryTab } from './components/SivecRegistryTab';
import { SivecVerifyTab } from './components/SivecVerifyTab';
import { SivecPassTab } from './components/SivecPassTab';
import { SivecConnectTab } from './components/SivecConnectTab';
import { SivecStudioTab } from './components/SivecStudioTab';

export const SivecVerificationView: React.FC = () => {
  const { currentRoute, navigate } = useApp();

  // Mapear rota da aplicação para o pilar do SIVEC correspondente
  const getInitialPillar = (): SivecPillarId => {
    if (currentRoute === 'sivec_studio') return 'studio';
    if (currentRoute === 'sivec_connect') return 'connect';
    if (currentRoute === 'sivec_pass') return 'pass';
    return 'verify';
  };

  const [activePillar, setActivePillar] = useState<SivecPillarId>(getInitialPillar());
  const [registry, setRegistry] = useState<SivecRegistryEntry[]>(getSivecRegistry);
  const [metrics, setMetrics] = useState<SivecCoreMetrics>(INITIAL_SIVEC_METRICS);
  const [searchTargetCode, setSearchTargetCode] = useState<string>('SIVEC-MZ-2026-8819');

  // Sincronizar quando a rota muda na sidebar
  useEffect(() => {
    if (currentRoute === 'sivec_studio') setActivePillar('studio');
    else if (currentRoute === 'sivec_connect') setActivePillar('connect');
    else if (currentRoute === 'sivec_pass') setActivePillar('pass');
    else if (currentRoute === 'sivec_verify') setActivePillar('verify');
  }, [currentRoute]);

  // Handler para adicionar novo registo
  const handleAddEntry = (newEntry: SivecRegistryEntry) => {
    const updated = [newEntry, ...registry];
    setRegistry(updated);
    saveSivecRegistry(updated);
    setMetrics(prev => ({
      ...prev,
      totalRegistered: prev.totalRegistered + 1,
      activeValid: prev.activeValid + 1,
      blockchainLedgerBlocks: prev.blockchainLedgerBlocks + 1
    }));
  };

  // Handler para atualizar estado com auditoria imutável no histórico
  const handleUpdateStatus = (
    id: string, 
    newStatus: SivecCredentialState, 
    justification: string, 
    actor = 'Secretaria Notarial & Registo Académico SIVEC'
  ) => {
    const timestampStr = new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT').slice(0, 5);
    const dateOnly = new Date().toLocaleDateString('pt-PT');
    const newTxHash = `tx-${newStatus.toLowerCase()}-${Date.now().toString(16)}`;

    const updated = registry.map(item => {
      if (item.id === id) {
        const prevStatus = item.status;
        const newHistoryEvent: SivecHistoryEvent = {
          id: `hist-${Date.now()}`,
          timestamp: timestampStr,
          action: `Transição para estado ${newStatus}`,
          actor: actor,
          actorRole: 'Comissão Notarial SIVEC',
          previousState: prevStatus,
          newState: newStatus,
          justification: justification,
          transactionHash: newTxHash
        };

        const updatedEntry: SivecRegistryEntry = {
          ...item,
          status: newStatus,
          history: [newHistoryEvent, ...(item.history || [])]
        };

        if (newStatus === 'REVOGADO') {
          updatedEntry.revocationReason = justification;
          updatedEntry.revocationDate = dateOnly;
          updatedEntry.revokedBy = actor;
        } else if (newStatus === 'CORRIGIDO') {
          updatedEntry.correctionReason = justification;
          updatedEntry.correctionDate = dateOnly;
          updatedEntry.correctedBy = actor;
        } else if (newStatus === 'CANCELADO') {
          updatedEntry.cancellationReason = justification;
          updatedEntry.cancellationDate = dateOnly;
          updatedEntry.cancelledBy = actor;
        }

        return updatedEntry;
      }
      return item;
    });

    setRegistry(updated);
    saveSivecRegistry(updated);

    setMetrics(prev => ({
      ...prev,
      blockchainLedgerBlocks: prev.blockchainLedgerBlocks + 1,
      activeValid: newStatus === 'ATIVO' ? prev.activeValid + 1 : Math.max(0, prev.activeValid - 1),
      revokedCount: newStatus === 'REVOGADO' ? prev.revokedCount + 1 : prev.revokedCount
    }));
  };

  // Handler para revogar credencial
  const handleRevokeEntry = (id: string, reason: string) => {
    handleUpdateStatus(id, 'REVOGADO', reason, 'Comissão Notarial & Secretaria Geral');
  };

  // Handler para saltar direto para verificação com código preenchido
  const handleSelectForVerify = (code: string) => {
    setSearchTargetCode(code);
    setActivePillar('verify');
  };

  // Handler de incremento de verificações
  const handleIncrementVerifyCount = (id: string) => {
    const updated = registry.map(item => {
      if (item.id === id) {
        return {
          ...item,
          verificationCount: item.verificationCount + 1,
          lastVerifiedAt: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT').slice(0, 5)
        };
      }
      return item;
    });

    setRegistry(updated);
    saveSivecRegistry(updated);

    setMetrics(prev => ({
      ...prev,
      totalVerificationsToday: prev.totalVerificationsToday + 1
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER PRINCIPAL DO SIVEC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              SIVEC ARCHITECTURE v5.0
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Sistema Integrado de Verificação e Emissão de Credenciais
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            SIVEC • Camada de Confiança e Verificação Digital
          </h1>

          <p className="text-xs text-slate-400 max-w-3xl mt-1">
            Plataforma institucional soberana para salvaguarda notarial de certificados, diplomas e microcredenciais com integridade criptográfica.
          </p>
        </div>

        {/* INDICADOR RÁPIDO DE STATUS E ACESSO PÚBLICO */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('public_verify')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Página Pública /verify/{'{id}'}</span>
          </button>

          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Volume Protegido</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {metrics.totalRegistered} Registos Ativos
            </span>
          </div>
        </div>
      </div>

      {/* ⚠️ NOTA CRÍTICA DE CONFORMIDADE COM A ANEP (DESTAQUE PERMANENTE CONFORME DIRETRIZ) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-300">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            <strong>Nota Jurídica de Conformidade:</strong> O SIVEC não substitui a ANEP. A fórmula padrão oficial utilizada em todas as credenciais é: <em>&ldquo;{SIVEC_LEGAL_MANDATE.standardFormula}&rdquo;</em>
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 shrink-0 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          ANEP COMPLIANCE 2026
        </span>
      </div>

      {/* AS 5 ABAS DA ARQUITETURA SIVEC: CORE, REGISTRY, VERIFY, PASS, CONNECT */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        
        {/* PILAR 1: SIVEC CORE */}
        <button
          onClick={() => setActivePillar('core')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activePillar === 'core'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>SIVEC CORE</span>
        </button>

        {/* PILAR 2: SIVEC REGISTRY */}
        <button
          onClick={() => setActivePillar('registry')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activePillar === 'registry'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>SIVEC REGISTRY</span>
        </button>

        {/* PILAR 3: SIVEC VERIFY */}
        <button
          onClick={() => setActivePillar('verify')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activePillar === 'verify'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>SIVEC VERIFY</span>
        </button>

        {/* PILAR 4: SIVEC PASS */}
        <button
          onClick={() => setActivePillar('pass')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activePillar === 'pass'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>SIVEC PASS</span>
        </button>

        {/* PILAR 5: SIVEC CONNECT */}
        <button
          onClick={() => setActivePillar('connect')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activePillar === 'connect'
              ? 'bg-sky-500 text-white shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>SIVEC CONNECT</span>
        </button>

        {/* PILAR 6: SIVEC STUDIO (Requisito 46) */}
        <button
          onClick={() => setActivePillar('studio')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activePillar === 'studio'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>SIVEC STUDIO</span>
        </button>

      </div>

      {/* CONTEÚDO DO PILAR SELECIONADO */}
      <div className="pt-2">
        {activePillar === 'core' && (
          <SivecCoreTab metrics={metrics} />
        )}

        {activePillar === 'registry' && (
          <SivecRegistryTab
            registry={registry}
            onAddEntry={handleAddEntry}
            onRevokeEntry={handleRevokeEntry}
            onUpdateStatus={handleUpdateStatus}
            onSelectForVerify={handleSelectForVerify}
          />
        )}

        {activePillar === 'verify' && (
          <SivecVerifyTab
            registry={registry}
            initialSearchCode={searchTargetCode}
            onIncrementVerifyCount={handleIncrementVerifyCount}
          />
        )}

        {activePillar === 'pass' && (
          <SivecPassTab />
        )}

        {activePillar === 'connect' && (
          <SivecConnectTab 
            registry={registry}
            onAddEntry={handleAddEntry}
            onNavigateVerify={(code) => {
              setSearchTargetCode(code);
              setActivePillar('verify');
            }}
          />
        )}

        {activePillar === 'studio' && (
          <SivecStudioTab 
            registry={registry}
            onAddEntry={handleAddEntry}
            onNavigateVerify={(code) => {
              setSearchTargetCode(code);
              setActivePillar('verify');
            }}
          />
        )}
      </div>

    </div>
  );
};
