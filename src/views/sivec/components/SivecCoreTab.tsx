import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Key, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  FileText, 
  ExternalLink,
  Lock,
  RefreshCw,
  Info
} from 'lucide-react';
import { SivecCoreMetrics } from '../types';
import { SIVEC_LEGAL_MANDATE } from '../mockSivecData';

interface SivecCoreTabProps {
  metrics: SivecCoreMetrics;
  onRefreshLedger?: () => void;
}

export const SivecCoreTab: React.FC<SivecCoreTabProps> = ({ metrics, onRefreshLedger }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeProofBlock, setActiveProofBlock] = useState<number>(metrics.blockchainLedgerBlocks);
  const [isRotating, setIsRotating] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(metrics.keyFingerprint);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSimulateRotation = () => {
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* ⚠️ DIRETRIZ ESTATUTÁRIA CRÍTICA DE CONFORMIDADE LEGAL (ANEP & FORMULAÇÃO OBRIGATÓRIA) */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-100 shadow-xl space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/30 text-amber-300 border border-amber-500/40">
                Diretriz de Conformidade Jurídica &amp; Verdade Notarial
              </span>
              <span className="text-xs font-mono font-bold text-amber-200">
                SIVEC NORMATIVA MZ-01/2026
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-black text-amber-100 tracking-tight">
              O SIVEC NÃO SUBSTITUI A ANEP (Autoridade Nacional de Educação Profissional)
            </h2>

            <p className="text-xs text-amber-200/90 leading-relaxed">
              O <strong>SIVEC</strong> opera como a <strong>camada tecnológica institucional de integridade, imutabilidade e verificação digital</strong>. Ele garante que um documento foi efetivamente emitido pela instituição de ensino e nunca foi adulterado. Contudo, <u>o SIVEC não substitui a acreditação pedagógica ou regulatória do Estado moçambicano</u>.
            </p>

            {/* CAIXA DE MANDATO FORMAL */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  FÓRMULA PADRÃO OBRIGATÓRIA (EM TODOS OS CERTIFICADOS &amp; VALIDADORES):
                </span>
                <span className="text-[10px] font-mono text-slate-400">Texto Oficial Mandatório</span>
              </div>
              <blockquote className="text-sm font-black text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/40 font-mono tracking-wide">
                &ldquo;{SIVEC_LEGAL_MANDATE.standardFormula}&rdquo;
              </blockquote>
              <p className="text-[11px] text-rose-300 font-medium">
                ⛔ <strong>VETO RIGOROSO:</strong> É terminantemente proibido redigir ou veicular a frase <em>&ldquo;certificado reconhecido pela ANEP&rdquo;</em> sem prova documental autenticada e homologada de acreditação em vigor da instituição junto da entidade reguladora.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DE TELEMETRIA E MOTOR DO SIVEC CORE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Status Criptográfico */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Algoritmo &amp; Assinatura
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              ATIVO
            </span>
          </div>
          <div className="text-xl font-black text-white font-mono">Ed25519 + SHA-256</div>
          <p className="text-[11px] text-slate-400">
            Curvas elípticas de alta performance com resistência quântica inicial e hashing imutável de 256 bits.
          </p>
        </div>

        {/* Carimbo de Tempo RFC 3161 TSA */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              Autoridade de Carimbo (TSA)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-mono font-bold">
              RFC 3161
            </span>
          </div>
          <div className="text-xl font-black text-white font-mono">UTC+2 (Maputo)</div>
          <p className="text-[11px] text-slate-400">
            Sincronização atómica com servidores de tempo auditados para prova temporal indelével de emissão.
          </p>
        </div>

        {/* Blocos de Integridade Ledger */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-violet-400" />
              Cadeia de Blocos SIVEC
            </span>
            <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-400 text-[10px] font-mono font-bold">
              Merkle Root
            </span>
          </div>
          <div className="text-xl font-black text-white font-mono">
            {metrics.blockchainLedgerBlocks.toLocaleString()} Blocos
          </div>
          <p className="text-[11px] text-slate-400">
            Cada credencial emitida gera um hash encadeado imutável, impossibilitando retroatividade ou fraude.
          </p>
        </div>

        {/* Emissões & Verificações */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Volume Protegido
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
              100% Auditado
            </span>
          </div>
          <div className="text-xl font-black text-white font-mono">
            {metrics.totalRegistered} Registos
          </div>
          <p className="text-[11px] text-slate-400">
            {metrics.activeValid} credenciais ativas e {metrics.revokedCount} cancelamentos com prova digital cartorária.
          </p>
        </div>

      </div>

      {/* CHAVE INSTITUCIONAL & COFRE HSM */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              SIVEC CORE HARDWARE SECURITY MODULE (HSM)
            </span>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-400" />
              Chave Pública Mestra da Instituição (Certificado Raiz Institucional)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateRotation}
              disabled={isRotating}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Verificar Chave</span>
            </button>
            <button
              onClick={handleCopyKey}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Fingerprint Copiado' : 'Copiar Hash da Chave'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Fingerprint SHA-256 da Chave Pública Raiz:</span>
              <span className="text-emerald-400 font-bold">Válida até 2030</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-emerald-300 select-all break-all">
              {metrics.keyFingerprint}
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              Todos os diplomas, certificados e microcredenciais emitidos por esta plataforma contêm a assinatura gerada por esta chave mestra privada, com custódia inviolável no HSM da Moztechwave.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <span className="text-slate-400 font-bold block text-[11px]">Políticas Criptográficas Ativas:</span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Assinatura Digital Ed25519 Institucional</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Carimbo de Tempo UTC com carimbo TSA</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>QR Code Dinâmico com rotação de PIN de 60s</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Validação offline com chave assimétrica pública</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
