import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  User, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  HardDrive, 
  CreditCard, 
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Send,
  Zap,
  Tag
} from 'lucide-react';
import { MozcoinEcosystemService, MozcoinTransactionType } from '../../types';

export const MozcoinWalletView: React.FC = () => {
  const { 
    activeUserWallet, 
    activeInstitutionWallet, 
    mozcoinTransactions, 
    mozcoinPurchases,
    mozcoinEcosystemServices,
    mozcoinDiscountRules,
    consumeMozcoinService,
    activeRole,
    activeInstitution,
    navigate,
    resubmitPurchaseCorrection
  } = useApp();

  // Seletor de carteira ativa na visualização (Pessoal vs Institucional)
  const [selectedWalletType, setSelectedWalletType] = useState<'user' | 'institution'>('institution');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de consumo de serviço
  const [selectedService, setSelectedService] = useState<MozcoinEcosystemService | null>(null);
  const [consumeQty, setConsumeQty] = useState<number>(1);
  const [advanceMonths, setAdvanceMonths] = useState<number>(0);
  const [referenceNotes, setReferenceNotes] = useState<string>('');
  const [isConsuming, setIsConsuming] = useState<boolean>(false);
  const [consumptionResult, setConsumptionResult] = useState<{ success: boolean; message: string } | null>(null);

  // Modal de correção de pedido
  const [correctingPurchaseId, setCorrectingPurchaseId] = useState<string | null>(null);
  const [correctedCode, setCorrectedCode] = useState<string>('');

  const currentWallet = selectedWalletType === 'institution' ? activeInstitutionWallet : activeUserWallet;

  // Filtragem de transações da carteira selecionada
  const filteredTransactions = mozcoinTransactions
    .filter(tx => {
      if (!currentWallet) return true;
      return tx.walletId === currentWallet.id || tx.ownerId === currentWallet.ownerId;
    })
    .filter(tx => {
      if (txTypeFilter === 'todos') return true;
      return tx.type === txTypeFilter;
    })
    .filter(tx => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(term) ||
        tx.origin.toLowerCase().includes(term) ||
        tx.destination.toLowerCase().includes(term) ||
        tx.id.toLowerCase().includes(term)
      );
    });

  // Pedidos pendentes e com correção solicitada da carteira selecionada
  const activePurchases = mozcoinPurchases.filter(p => {
    if (selectedWalletType === 'institution') {
      return p.targetWallet === 'institution' && p.institutionId === activeInstitution.id;
    }
    return p.targetWallet === 'user';
  });

  // Cálculo de desconto e bónus dinâmico para o modal de consumo
  const calculateConsumptionSummary = () => {
    if (!selectedService) return { baseCost: 0, discountVal: 0, finalCost: 0, bonusCoins: 0, ruleTitle: '' };
    const rawCost = selectedService.costMozcoin * consumeQty;
    if (advanceMonths >= 3) {
      const rule = mozcoinDiscountRules
        .filter(r => r.isActive && r.monthsAdvance <= advanceMonths)
        .sort((a, b) => b.monthsAdvance - a.monthsAdvance)[0];
      if (rule) {
        const discountVal = Math.round((rawCost * rule.discountPercentage) / 100);
        return {
          baseCost: rawCost,
          discountVal,
          finalCost: rawCost - discountVal,
          bonusCoins: rule.bonusMozcoins || 0,
          ruleTitle: rule.title
        };
      }
    }
    return { baseCost: rawCost, discountVal: 0, finalCost: rawCost, bonusCoins: 0, ruleTitle: '' };
  };

  const consumptionSummary = calculateConsumptionSummary();

  const handleConfirmConsumption = () => {
    if (!currentWallet || !selectedService) return;
    setIsConsuming(true);
    setConsumptionResult(null);

    const res = consumeMozcoinService({
      walletId: currentWallet.id,
      serviceId: selectedService.id,
      quantity: consumeQty,
      referenceNotes: referenceNotes || undefined,
      advanceMonths: advanceMonths > 0 ? advanceMonths : undefined
    });

    setIsConsuming(false);
    if (res.success) {
      setConsumptionResult({
        success: true,
        message: `Serviço "${selectedService.name}" acionado com sucesso! O débito foi gravado no extrato.`
      });
      setTimeout(() => {
        setSelectedService(null);
        setConsumptionResult(null);
        setConsumeQty(1);
        setAdvanceMonths(0);
        setReferenceNotes('');
      }, 1500);
    } else {
      setConsumptionResult({
        success: false,
        message: res.error || 'Falha ao processar consumo de créditos.'
      });
    }
  };

  const handleResubmitCorrection = (purchaseId: string) => {
    if (!correctedCode.trim()) return;
    resubmitPurchaseCorrection(purchaseId, {
      transactionCode: correctedCode
    });
    setCorrectingPurchaseId(null);
    setCorrectedCode('');
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-blue-400" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5 text-cyan-400" />;
      default: return <CreditCard className="w-5 h-5 text-amber-400" />;
    }
  };

  const getTxTypeBadge = (type: MozcoinTransactionType) => {
    switch (type) {
      case 'compra':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ArrowDownLeft className="w-3 h-3" /> Recarga / Compra</span>;
      case 'consumo_servico':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><ArrowUpRight className="w-3 h-3" /> Consumo de Serviço</span>;
      case 'plano_antecipado':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20"><Zap className="w-3 h-3" /> Plano Antecipado</span>;
      case 'bonus':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Sparkles className="w-3 h-3" /> Bónus Promocional</span>;
      case 'estorno':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Clock className="w-3 h-3" /> Estorno</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Transferência</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Legal Disclaimer */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl backdrop-blur-md">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-amber-600/30 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">MOZCOIN</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Créditos do Ecossistema
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Unidade de crédito interno para consumo de serviços, emissões de certificados SIVEC e planos na Moztechwave.
                </p>
              </div>
            </div>

            {/* Disclaimer Legal Obrigatório (Requisito 86) */}
            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 max-w-3xl">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-300">Nota Legal de Conformidade:</strong> A MOZCOIN não é moeda oficial da República de Moçambique, moeda bancária com curso forçado ou criptomoeda regulamentada. Constitui exclusivamente unidade de crédito contratual interno do ecossistema Moztechwave, regulada pelas políticas do sistema.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('mozcoin_comprar')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Comprar MOZCOIN
            </button>

            {(activeRole === 'superadmin' || activeRole === 'director') && (
              <button
                onClick={() => navigate('mozcoin_aprovacao')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700/80 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Painel de Aprovações
              </button>
            )}
          </div>
        </div>

        {/* Alternância de Carteira (Pessoal vs Institucional) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setSelectedWalletType('institution')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedWalletType === 'institution'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Carteira Institucional ({activeInstitution.name.split(' ')[0]})
            </button>
            <button
              onClick={() => setSelectedWalletType('user')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedWalletType === 'user'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              Carteira Pessoal ({activeRole})
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Última atualização:</span>
            <span className="font-mono text-slate-300">{currentWallet?.lastTransactionAt || 'Hoje'}</span>
          </div>
        </div>
      </div>

      {/* Cards de Métricas da Carteira */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Disponível */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Saldo Disponível</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {(currentWallet?.balance || 0).toLocaleString()} <span className="text-amber-400 text-lg font-sans">MOZ</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              ≈ {(currentWallet?.balance || 0).toLocaleString()} MTn (1 MOZ = 1 MTn)
            </div>
          </div>
        </div>

        {/* Total Entradas */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Total Entradas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight font-mono">
              +{(currentWallet?.totalCredited || 0).toLocaleString()} <span className="text-emerald-400 text-sm font-sans">MOZ</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Recargas e créditos recebidos
            </div>
          </div>
        </div>

        {/* Total Saídas */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Total Saídas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight font-mono">
              -{(currentWallet?.totalDebited || 0).toLocaleString()} <span className="text-rose-400 text-sm font-sans">MOZ</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Serviços e planos consumidos
            </div>
          </div>
        </div>

        {/* Saldo Pendente de Confirmação */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Pendente de Aprovação</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-yellow-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight font-mono">
              {(currentWallet?.pendingPurchases || 0).toLocaleString()} <span className="text-yellow-400 text-sm font-sans">MOZ</span>
            </div>
            <div className="mt-1 text-xs text-yellow-400/80 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Aguardando revisão do CEO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pedidos em Análise ou com Correção Solicitada */}
      {activePurchases.some(p => p.status === 'pendente' || p.status === 'correcao_solicitada') && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Pedidos de MOZCOIN em Processamento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePurchases
              .filter(p => p.status === 'pendente' || p.status === 'correcao_solicitada')
              .map(p => (
                <div 
                  key={p.id}
                  className={`p-4 rounded-xl border ${
                    p.status === 'correcao_solicitada'
                      ? 'bg-rose-950/20 border-rose-700/50'
                      : 'bg-slate-900/60 border-slate-800'
                  } flex flex-col justify-between gap-3`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-white">
                          +{p.mozcoinAmount.toLocaleString()} MOZCOIN
                        </span>
                        <span className="text-xs text-slate-400">({p.fiatAmount} MTn)</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Método: <strong className="text-slate-200">{p.network}</strong> • Ref: <span className="font-mono text-amber-400">{p.transactionCode}</span>
                      </div>
                    </div>
                    {p.status === 'correcao_solicitada' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        Correção Solicitada
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                        Pendente de Validação
                      </span>
                    )}
                  </div>

                  {p.correctionNotes && (
                    <div className="p-3 rounded-lg bg-rose-900/30 border border-rose-800/40 text-xs text-rose-200">
                      <strong>Mensagem do Administrador:</strong> {p.correctionNotes}
                    </div>
                  )}

                  {p.status === 'correcao_solicitada' && (
                    <div className="pt-2 border-t border-rose-900/30">
                      {correctingPurchaseId === p.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Novo código de transação"
                            value={correctedCode}
                            onChange={e => setCorrectedCode(e.target.value)}
                            className="flex-1 bg-slate-950 border border-rose-600 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono"
                          />
                          <button
                            onClick={() => handleResubmitCorrection(p.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
                          >
                            Reenviar
                          </button>
                          <button
                            onClick={() => setCorrectingPurchaseId(null)}
                            className="px-2 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCorrectingPurchaseId(p.id);
                            setCorrectedCode(p.transactionCode);
                          }}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline"
                        >
                          Corrigir Dados da Transação Agora
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Catálogo de Serviços do Ecossistema Consumíveis em MOZCOIN (Requisito 86.4) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Consumo de Serviços com MOZCOIN
            </h2>
            <p className="text-xs text-slate-400">
              Utilize o saldo da carteira para emissão de chancelas SIVEC, pacotes de WhatsApp e automação.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            Carteira em uso: <strong className="text-amber-400">{currentWallet?.ownerName}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mozcoinEcosystemServices.map(service => (
            <div 
              key={service.id}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:bg-slate-900/90 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-500/30 transition-colors">
                    {getServiceIcon(service.icon)}
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg font-extrabold text-amber-400">
                      {service.costMozcoin.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">MOZ</span>
                    <div className="text-[10px] text-slate-500 uppercase">{service.unit.replace('por_', '/ ')}</div>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mt-3 group-hover:text-amber-300 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">{service.code}</span>
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setConsumeQty(1);
                    setAdvanceMonths(0);
                    setReferenceNotes('');
                    setConsumptionResult(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-semibold border border-amber-500/30 hover:border-amber-500 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Acionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regras Promocionais para Planos Antecipados (Requisito 86.5) */}
      <div className="bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-slate-900/80 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Condições Especiais para Aquisições Antecipadas</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Requisito 86.5
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl mb-4">
          Instituições que contratam serviços com meses de antecedência recebem descontos aplicados automaticamente e moedas bónus de fidelidade configuradas pelo CEO.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mozcoinDiscountRules.filter(r => r.isActive).map(rule => (
            <div key={rule.id} className="p-4 rounded-xl bg-slate-950/70 border border-purple-900/40 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{rule.title}</span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    -{rule.discountPercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {rule.description}
                </p>
              </div>
              <div className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                +{rule.bonusMozcoins} MOZCOIN de bónus incluídas
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extrato Imutável de Movimentações (Requisito 86.3 & 86.6) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Extrato & Histórico de Movimentações
            </h2>
            <p className="text-xs text-slate-400">
              Registro contábil imutável com saldo anterior, variação e saldo final de cada operação.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Buscar movimentação..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />

            <select
              value={txTypeFilter}
              onChange={e => setTxTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="compra">Compras / Recargas</option>
              <option value="consumo_servico">Consumos de Serviços</option>
              <option value="plano_antecipado">Planos Antecipados</option>
              <option value="bonus">Bónus</option>
              <option value="estorno">Estornos</option>
            </select>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">ID / Ref</th>
                <th className="py-3 px-3">Data / Hora</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Origem &rarr; Destino</th>
                <th className="py-3 px-3 text-right">Saldo Anterior</th>
                <th className="py-3 px-3 text-right">Valor</th>
                <th className="py-3 px-3 text-right">Saldo Posterior</th>
                <th className="py-3 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Nenhuma movimentação localizada para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400 font-medium">
                        {tx.id}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono">
                        {tx.timestamp}
                      </td>
                      <td className="py-3 px-3">
                        {getTxTypeBadge(tx.type)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-white font-medium truncate max-w-[200px]" title={tx.description}>
                          {tx.origin} &rarr; {tx.destination}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                          {tx.description}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        {tx.previousBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPositive ? '+' : ''}{tx.amount.toLocaleString()} MOZ
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        {tx.newBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Consumo de Serviço */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {getServiceIcon(selectedService.icon)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedService.name}</h3>
                  <span className="text-xs font-mono text-slate-400">{selectedService.code}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="text-slate-300 leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {/* Seletor de Quantidade */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Quantidade / Unidades ({selectedService.unit.replace('por_', '')}):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={consumeQty}
                    onChange={e => setConsumeQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                  <span className="text-slate-400">
                    x {selectedService.costMozcoin} MOZ = <strong className="text-white font-mono">{selectedService.costMozcoin * consumeQty} MOZ</strong>
                  </span>
                </div>
              </div>

              {/* Opção de Plano Antecipado (86.5) */}
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-400" />
                    Aquisição Antecipada Promocional (Opcional):
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdvanceMonths(0)}
                    className={`py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      advanceMonths === 0
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Mês a Mês
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvanceMonths(3)}
                    className={`py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      advanceMonths === 3
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    3 Meses (-10%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvanceMonths(12)}
                    className={`py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      advanceMonths === 12
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    12 Meses (-30%)
                  </button>
                </div>
              </div>

              {/* Observação / Referência */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nota / Identificador de Referência (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lote Turma Eletricidade 2026-A"
                  value={referenceNotes}
                  onChange={e => setReferenceNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Resumo Financeiro */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Carteira Debitada:</span>
                  <span className="font-semibold text-white">{currentWallet?.ownerName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Saldo Atual:</span>
                  <span className="font-mono text-white">{currentWallet?.balance.toLocaleString()} MOZ</span>
                </div>
                {consumptionSummary.discountVal > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Desconto ({consumptionSummary.ruleTitle}):</span>
                    <span className="font-mono">-{consumptionSummary.discountVal.toLocaleString()} MOZ</span>
                  </div>
                )}
                {consumptionSummary.bonusCoins > 0 && (
                  <div className="flex justify-between text-purple-400 font-semibold">
                    <span>Bónus de Fidelidade:</span>
                    <span className="font-mono">+{consumptionSummary.bonusCoins.toLocaleString()} MOZ</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Custo Líquido a Debitar:</span>
                  <span className="font-mono text-amber-400">{consumptionSummary.finalCost.toLocaleString()} MOZ</span>
                </div>
              </div>

              {consumptionResult && (
                <div className={`p-3 rounded-xl border text-xs ${
                  consumptionResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  {consumptionResult.message}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/50">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmConsumption}
                disabled={isConsuming || (currentWallet ? currentWallet.balance < consumptionSummary.finalCost : true)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isConsuming ? 'Processando...' : 'Confirmar e Debitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
