import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Printer, 
  ArrowRight, 
  Zap, 
  RefreshCw,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod, PaymentTransaction } from '../types';
import { soundManager } from '../utils/audio';

interface PaymentIntegrationsViewProps {
  onPaymentSuccess?: (transaction: PaymentTransaction) => void;
}

export const PaymentIntegrationsView: React.FC<PaymentIntegrationsViewProps> = ({
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('843918201');
  const [customAmount, setCustomAmount] = useState('1500');
  const [candidateRef, setCandidateRef] = useState('SIGAR-MZ-2026-9104');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pushPromptSimOpen, setPushPromptSimOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentTransaction | null>(null);

  // Live transaction log
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: 'tx-01',
      registrationCode: 'SIGAR-MZ-2026-9102',
      candidateName: 'Arnaldo Tomás Mabunda',
      courseName: 'Engenharia de Software',
      amount: 1500,
      currency: 'MZN',
      method: 'mpesa',
      status: 'concluido',
      referenceNumber: 'MP-881920-MZ',
      phoneNumber: '+258 84 391 8201',
      timestamp: 'Hoje, 14:20'
    },
    {
      id: 'tx-02',
      registrationCode: 'SIGAR-MZ-2026-9103',
      candidateName: 'Yolanda Celina Mondlane',
      courseName: 'Cibersegurança & Redes Cisco',
      amount: 1500,
      currency: 'MZN',
      method: 'emola',
      status: 'concluido',
      referenceNumber: 'EM-749102-MZ',
      phoneNumber: '+258 87 502 9184',
      timestamp: 'Hoje, 09:15'
    },
    {
      id: 'tx-03',
      registrationCode: 'SIGAR-MZ-2026-9104',
      candidateName: 'Edilson Zacarias Chissano',
      courseName: 'Contabilidade Informatizada',
      amount: 1200,
      currency: 'MZN',
      method: 'ponto24',
      status: 'pendente',
      referenceNumber: 'REF-P24-991823',
      timestamp: 'Hoje, 06:40'
    }
  ]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const triggerPaymentSimulation = () => {
    setIsProcessing(true);

    if (activeTab === 'mpesa' || activeTab === 'emola') {
      // Open the simulated mobile screen prompt
      setPushPromptSimOpen(true);
    } else {
      finalizePayment();
    }
  };

  const finalizePayment = () => {
    setTimeout(() => {
      setIsProcessing(false);
      setPushPromptSimOpen(false);

      const newTx: PaymentTransaction = {
        id: `tx-${Date.now()}`,
        registrationCode: candidateRef || `SIGAR-MZ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        candidateName: 'Candidato Teste Moztechwave',
        courseName: 'Formação Especializada',
        amount: Number(customAmount) || 1500,
        currency: 'MZN',
        method: activeTab,
        status: 'concluido',
        referenceNumber: `${activeTab.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}-MZ`,
        phoneNumber: `+258 ${phoneNumber}`,
        timestamp: 'Agora mesmo'
      };

      setTransactions((prev) => [newTx, ...prev]);
      setActiveReceipt(newTx);

      // Play success chime & confetti
      soundManager.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(newTx);
      }
    }, 1800);
  };

  return (
    <section id="pagamentos" className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5" />
            SIVERC Integrados • Gateway Multi-Pagamentos
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Integrações de Pagamento em Tempo Real
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Arquitetura de pagamentos inspirada nos sistemas mais robustos (Sistemas Hugo / SIVERC). Confirmação instantânea via webhook M-Pesa STK Push, E-Mola, Ponto24 e Bancos moçambicanos.
          </p>
        </div>

        {/* Main Payment Hub Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Payment Engine & Gateway Tabs */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Terminal de Pagamento da Inscrição
                </h3>
                <p className="text-xs text-slate-400">Escolha o seu método preferido para liquidação imediata</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SSL 256-bit Seguro
              </span>
            </div>

            {/* Gateway Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('mpesa')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  activeTab === 'mpesa'
                    ? 'bg-rose-950/40 border-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-black text-xs mb-1">
                  M
                </div>
                <span className="text-xs font-bold">M-Pesa</span>
                <span className="text-[10px] text-slate-400">Vodacom</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('emola')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  activeTab === 'emola'
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs mb-1">
                  e
                </div>
                <span className="text-xs font-bold">e-Mola</span>
                <span className="text-[10px] text-slate-400">Movitel</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ponto24')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  activeTab === 'ponto24'
                    ? 'bg-sky-950/40 border-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-xs mb-1">
                  24
                </div>
                <span className="text-xs font-bold">Ponto24</span>
                <span className="text-[10px] text-slate-400">ATM / Cartão</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('banco')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  activeTab === 'banco'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building2 className="w-6 h-6 text-indigo-400 mb-1" />
                <span className="text-xs font-bold">Bancos</span>
                <span className="text-[10px] text-slate-400">BIM / BCI</span>
              </button>
            </div>

            {/* Gateway Specific Form Inputs */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Referência do Candidato:</label>
                  <input
                    type="text"
                    value={candidateRef}
                    onChange={(e) => setCandidateRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Valor a Pagar (MT):</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-bold font-mono"
                  />
                </div>
              </div>

              {/* M-Pesa / E-Mola Specific Inputs */}
              {(activeTab === 'mpesa' || activeTab === 'emola') && (
                <div className="space-y-2">
                  <label className="block text-xs text-slate-300 font-medium">
                    {activeTab === 'mpesa' ? 'Número Vodacom (M-Pesa):' : 'Número Movitel (e-Mola):'}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1">
                      🇲🇿 +258
                    </span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={activeTab === 'mpesa' ? '84 123 4567' : '86 123 4567'}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                    Irá receber uma mensagem flash no seu telemóvel para inserir o seu PIN de segurança.
                  </p>
                </div>
              )}

              {/* Ponto24 Details */}
              {activeTab === 'ponto24' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Entidade:</span>
                      <div className="flex items-center gap-2 font-mono font-bold text-white">
                        <span>00892</span>
                        <button 
                          onClick={() => copyToClipboard('00892', 'ent')}
                          className="text-sky-400 hover:text-white"
                        >
                          {copiedKey === 'ent' ? 'Copiado!' : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Referência SIVERC:</span>
                      <div className="flex items-center gap-2 font-mono font-bold text-white">
                        <span>981 029 481</span>
                        <button 
                          onClick={() => copyToClipboard('981 029 481', 'ref')}
                          className="text-sky-400 hover:text-white"
                        >
                          {copiedKey === 'ref' ? 'Copiado!' : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pague em qualquer Caixa Automático ATM Ponto24 ou através do seu Internet Banking.
                  </p>
                </div>
              )}

              {/* Bank Accounts */}
              {activeTab === 'banco' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">Millennium BIM</div>
                      <div className="text-[11px] text-slate-400 font-mono">Conta: 291048201 • NIB: 000100000029104820101</div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('000100000029104820101', 'bim')}
                      className="px-2 py-1 bg-slate-800 rounded text-sky-400 hover:text-white"
                    >
                      {copiedKey === 'bim' ? 'Copiado' : 'Copiar NIB'}
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">Banco Comercial e de Investimentos (BCI)</div>
                      <div className="text-[11px] text-slate-400 font-mono">Conta: 110294812 • NIB: 000800001102948120034</div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('000800001102948120034', 'bci')}
                      className="px-2 py-1 bg-slate-800 rounded text-sky-400 hover:text-white"
                    >
                      {copiedKey === 'bci' ? 'Copiado' : 'Copiar NIB'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Trigger Button */}
            <button
              id="trigger-payment-simulator-btn"
              onClick={triggerPaymentSimulation}
              disabled={isProcessing}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-bold text-sm sm:text-base shadow-lg transition-all cursor-pointer ${
                activeTab === 'mpesa'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                  : activeTab === 'emola'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25 text-slate-950 font-black'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processando com a Rede {activeTab.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Efetuar Pagamento de {Number(customAmount).toLocaleString()} MT</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Live Payment Transactions Ledger */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Transações SIVERC em Tempo Real</h3>
                <p className="text-xs text-slate-400">Histórico de confirmações automáticas</p>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* Transaction Items */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setActiveReceipt(tx)}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                          {tx.candidateName}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.method === 'mpesa' ? 'bg-rose-500/20 text-rose-400' :
                          tx.method === 'emola' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-sky-500/20 text-sky-400'
                        }`}>
                          {tx.method}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tx.courseName}</p>
                      <span className="text-[10px] font-mono text-slate-500">{tx.referenceNumber}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        +{tx.amount.toLocaleString()} MT
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        tx.status === 'concluido' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {tx.status === 'concluido' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmado
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Pendente
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">
                Homologação direta com API Vodacom M-Pesa &amp; Movitel Moçambique
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Mobile STK Push Modal (M-Pesa / E-Mola) */}
      {pushPromptSimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
            {/* Phone Screen Mockup Header */}
            <div className="w-20 h-1 rounded-full bg-slate-700 mx-auto" />

            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <Smartphone className="w-7 h-7 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white">
                M-Pesa Flash Prompt
              </span>
              <h3 className="text-lg font-bold text-white">Autorizar Pagamento?</h3>
              <p className="text-xs text-slate-300">
                Pagar <strong className="text-white">{Number(customAmount).toLocaleString()} MZN</strong> à entidade:
                <br />
                <span className="text-sky-400 font-bold">MOZTECHWAVE SIVERC (89201)</span>
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Telemóvel:</span>
                <span className="text-white font-mono">+258 {phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Referência:</span>
                <span className="text-white font-mono">{candidateRef}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={finalizePayment}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer shadow-lg"
              >
                Inserir PIN e Confirmar (Simular)
              </button>
              <button
                onClick={() => setPushPromptSimOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancelar Transação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Payment Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#fffdfa] text-slate-900 border-2 border-amber-400 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="text-center border-b border-slate-300 pb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-[#78350f]">
                RECIBO FISCAL ELETRÔNICO • SIVERC
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                MOZTECHWAVE TECNOLOGIA
              </h4>
              <p className="text-[11px] text-slate-600">NUIT: 400192849 • Maputo, Moçambique</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Comprovativo Nº:</span>
                <span className="font-mono font-bold text-slate-900">{activeReceipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Candidato / Aluno:</span>
                <span className="font-bold text-slate-900">{activeReceipt.candidateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Código de Matrícula:</span>
                <span className="font-mono text-slate-800">{activeReceipt.registrationCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Forma de Liquidação:</span>
                <span className="font-bold uppercase text-slate-900">{activeReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Data e Hora:</span>
                <span className="text-slate-800">{activeReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between border-t border-b border-slate-300 py-2 text-sm font-bold">
                <span>TOTAL LIQUIDADO:</span>
                <span className="text-emerald-700">{activeReceipt.amount.toLocaleString()} MZN</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-3">
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
