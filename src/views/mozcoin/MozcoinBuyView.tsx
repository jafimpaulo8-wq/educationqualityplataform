import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Coins, 
  ArrowLeft, 
  CheckCircle2, 
  Smartphone, 
  Building, 
  CreditCard, 
  Upload, 
  FileText, 
  Info, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  User,
  Building2,
  AlertCircle
} from 'lucide-react';
import { MozcoinPaymentMethod } from '../../types';

export const MozcoinBuyView: React.FC = () => {
  const { 
    activeInstitution, 
    activeRole, 
    currentUser, 
    requestMozcoinPurchase, 
    navigate, 
    mozcoinDiscountRules 
  } = useApp();

  // Wizard Steps: 1: Quantidade & Destino, 2: Método de Pagamento, 3: Informações do Comprovativo, 4: Concluído
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [targetWallet, setTargetWallet] = useState<'institution' | 'user'>('institution');
  const [mozcoinAmount, setMozcoinAmount] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<MozcoinPaymentMethod>('mpesa');
  const [transactionCode, setTransactionCode] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [paymentTime, setPaymentTime] = useState<string>(
    new Date().toTimeString().substring(0, 5)
  );
  const [network, setNetwork] = useState<string>('M-Pesa (Vodacom)');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submittedRequestId, setSubmittedRequestId] = useState<string>('');

  const PRESET_PACKAGES = [
    { amount: 500, label: 'Pacote Básico', tag: 'Testes e Avulso', bonus: 0 },
    { amount: 1000, label: 'Pacote Standard', tag: 'Secretaria Mensal', bonus: 0 },
    { amount: 2500, label: 'Pacote Profissional', tag: 'Mais Popular', bonus: 100 },
    { amount: 5000, label: 'Pacote Instituição', tag: 'Multi-Filial & WhatsApp', bonus: 350 },
    { amount: 10000, label: 'Pacote Anual Master', tag: 'Maior Economia', bonus: 1000 },
  ];

  const selectedAmount = customAmount ? (parseInt(customAmount) || 0) : mozcoinAmount;

  const handleSelectPackage = (amt: number) => {
    setMozcoinAmount(amt);
    setCustomAmount('');
  };

  const handleSelectPaymentMethod = (method: MozcoinPaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'mpesa') setNetwork('M-Pesa (Vodacom)');
    else if (method === 'emola') setNetwork('e-Mola (Movitel)');
    else if (method === 'transferencia_bancaria') setNetwork('Millennium BIM');
    else setNetwork('Outro Meio');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
      // Simulação de URL do comprovativo carregado
      setProofUrl(`https://storage.moztechwave.co.mz/receipts/${Date.now()}_${file.name}`);
    }
  };

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedAmount < 100) {
      setErrorMsg('A quantidade mínima para aquisição é de 100 MOZCOIN.');
      return;
    }

    if (!transactionCode.trim()) {
      setErrorMsg('Informe o código de confirmação da transação (ex: MP260923.88219.A ou talão).');
      return;
    }

    const newRequest = requestMozcoinPurchase({
      targetWallet,
      mozcoinAmount: selectedAmount,
      paymentMethod,
      transactionCode,
      paymentDate,
      paymentTime,
      network,
      proofUrl: proofUrl || undefined,
      proofFileName: proofFileName || undefined
    });

    setSubmittedRequestId(newRequest.id);
    setStep(4);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Back Button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('mozcoin_wallet')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Carteira
        </button>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Identidade Central:</span>
          <span className="font-mono text-amber-400 font-semibold">{currentUser.name}</span>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Comprar MOZCOIN</h1>
              <p className="text-xs text-slate-400">
                Recarregue os créditos da plataforma via M-Pesa, e-Mola ou Transferência Bancária.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300">
            Etapa {step} de 4
          </span>
        </div>

        {/* Steps Progress Bar */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-amber-500' : 'bg-slate-800'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-amber-500' : 'bg-slate-800'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-amber-500' : 'bg-slate-800'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step === 4 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
        </div>
      </div>

      {/* ETAPA 1: QUANTIDADE & DESTINO */}
      {step === 1 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              1. Selecione a Carteira de Destino do Crédito
            </h2>
            <p className="text-xs text-slate-400">
              Indique se as moedas serão creditadas na conta institucional ou na sua conta pessoal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div 
                onClick={() => setTargetWallet('institution')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  targetWallet === 'institution'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${targetWallet === 'institution' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-400'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{activeInstitution.name}</div>
                    <div className="text-xs text-slate-400">Carteira Institucional Oficial</div>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setTargetWallet('user')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  targetWallet === 'user'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${targetWallet === 'user' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-400'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{currentUser.name}</div>
                    <div className="text-xs text-slate-400">Carteira Pessoal ({activeRole})</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              2. Escolha o Pacote de MOZCOIN
            </h2>
            <p className="text-xs text-slate-400">
              Taxa de conversão transparente: 1 MTn = 1 MOZCOIN.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {PRESET_PACKAGES.map(pkg => (
                <div
                  key={pkg.amount}
                  onClick={() => handleSelectPackage(pkg.amount)}
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                    !customAmount && mozcoinAmount === pkg.amount
                      ? 'bg-amber-500/15 border-amber-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">{pkg.label}</span>
                      {pkg.bonus > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          +{pkg.bonus} bónus
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-white font-mono">
                      {pkg.amount.toLocaleString()} <span className="text-amber-400 text-sm font-sans">MOZ</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-semibold">
                      = {pkg.amount.toLocaleString()} MTn
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {pkg.tag}
                  </div>
                </div>
              ))}
            </div>

            {/* Valor Personalizado */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Ou digite uma quantidade personalizada em MOZCOIN (Mínimo: 100):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="100"
                  step="50"
                  placeholder="Ex: 7500"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="w-48 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-slate-400">
                  Total a pagar: <strong className="text-amber-400 font-mono text-sm">{selectedAmount.toLocaleString()} MTn</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                if (selectedAmount < 100) {
                  setErrorMsg('A quantidade mínima é 100 MOZCOIN.');
                  return;
                }
                setStep(2);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Continuar para Pagamento
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 2: ESCOLHA DO MÉTODO DE PAGAMENTO */}
      {step === 2 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-400" />
              Escolha o Meio de Pagamento
            </h2>
            <p className="text-xs text-slate-400">
              Realize a transferência exata de <strong className="text-amber-400 font-mono">{selectedAmount.toLocaleString()} MTn</strong> para as contas oficiais abaixo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {/* M-Pesa */}
              <div
                onClick={() => handleSelectPaymentMethod('mpesa')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'mpesa'
                    ? 'bg-red-500/10 border-red-500 shadow-lg shadow-red-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                  MP
                </div>
                <h3 className="text-sm font-bold text-white mt-3">M-Pesa (Vodacom)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transferência móvel imediata via *150# ou aplicativo M-Pesa.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                  Conta: <strong>84 900 0001</strong>
                </div>
              </div>

              {/* e-Mola */}
              <div
                onClick={() => handleSelectPaymentMethod('emola')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'emola'
                    ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                  eM
                </div>
                <h3 className="text-sm font-bold text-white mt-3">e-Mola (Movitel)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pagamento via *898# ou aplicativo e-Mola.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                  Conta: <strong>86 900 0002</strong>
                </div>
              </div>

              {/* Transferência Bancária */}
              <div
                onClick={() => handleSelectPaymentMethod('transferencia_bancaria')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'transferencia_bancaria'
                    ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mt-3">Transferência Bancária</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Millennium BIM / BCI / Standard Bank Moçambique.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-300">
                  NIB: <strong>0001.0000.999888.77</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Detalhados da Entidade */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="text-slate-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Titular Oficial da Conta de Depósito:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              <div>Beneficiário: <strong className="text-white">Moztechwave Soluções Tecnológicas, Lda</strong></div>
              <div>NUIT: <strong className="text-white">400.988.112</strong></div>
              <div>Referência a colocar no descritivo: <strong className="text-amber-400 font-mono">MOZ-{currentUser.id.substring(0, 6)}</strong></div>
              <div>Valor exato: <strong className="text-white font-mono">{selectedAmount.toLocaleString()} MTn</strong></div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Já Efetuei o Pagamento
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: INFORMAR DADOS DA TRANSAÇÃO */}
      {step === 3 && (
        <form onSubmit={handleSubmitPurchase} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Informar Dados da Transação
            </h2>
            <p className="text-xs text-slate-400">
              Preencha os dados do talão ou SMS recebido para validação imediata pelo CEO/Super Admin.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Código da Transação */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Código da Transação / Referência do Talão <span className="text-rose-400">*</span>:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: MP260923.88219.A ou 2026/BIM/09988"
                value={transactionCode}
                onChange={e => setTransactionCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono uppercase font-bold focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Insira o código alfanumérico tal como consta no comprovativo do M-Pesa, e-Mola ou banco.
              </span>
            </div>

            {/* Valor Pago */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Valor Pago (MTn):
              </label>
              <input
                type="text"
                disabled
                value={`${selectedAmount.toLocaleString()} MTn`}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 font-mono font-bold"
              />
            </div>

            {/* Rede Utilizada */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Rede / Canal Utilizado:
              </label>
              <input
                type="text"
                value={network}
                onChange={e => setNetwork(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            {/* Data do Pagamento */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Data do Pagamento:
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            {/* Hora do Pagamento */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Hora do Pagamento:
              </label>
              <input
                type="time"
                required
                value={paymentTime}
                onChange={e => setPaymentTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            {/* Comprovativo Opcional */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Comprovativo de Pagamento (Imagem ou PDF - Opcional):
              </label>
              <div className="p-4 border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl bg-slate-950/50 text-center transition-colors">
                <input
                  type="file"
                  id="proof-file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="proof-file" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-slate-300 font-medium">
                    {proofFileName ? `Arquivo anexado: ${proofFileName}` : 'Clique para carregar o print ou talão'}
                  </span>
                  <span className="text-[10px] text-slate-500">JPG, PNG ou PDF até 5MB</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Enviar Pedido para Confirmação
            </button>
          </div>
        </form>
      )}

      {/* ETAPA 4: SUCESSO & PENDENTE DE APROVAÇÃO */}
      {step === 4 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
              Estado: Pendente de Confirmação
            </span>
            <h2 className="text-2xl font-bold text-white mt-3">Pedido Submetido com Sucesso!</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              O seu pedido de <strong className="text-white font-mono">{selectedAmount.toLocaleString()} MOZCOIN</strong> foi registrado com o código <strong className="text-amber-400 font-mono">{transactionCode}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Destino:</span>
              <span className="font-semibold text-white">{targetWallet === 'institution' ? activeInstitution.name : currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Valor Pago:</span>
              <span className="font-mono text-white">{selectedAmount.toLocaleString()} MTn</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Canal:</span>
              <span className="text-white">{network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Data e Hora:</span>
              <span className="font-mono text-white">{paymentDate} às {paymentTime}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('mozcoin_wallet')}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Ver Extrato da Carteira
            </button>
            <button
              onClick={() => {
                setStep(1);
                setTransactionCode('');
                setProofFileName('');
                setProofUrl('');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              Novo Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
