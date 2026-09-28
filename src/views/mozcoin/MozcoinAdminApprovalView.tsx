import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Building2, 
  User, 
  ExternalLink, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  Sparkles,
  ArrowLeft,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { MozcoinDiscountRule, MozcoinPurchaseRequest } from '../../types';

export const MozcoinAdminApprovalView: React.FC = () => {
  const { 
    allMozcoinPurchases, 
    allMozcoinWallets,
    mozcoinDiscountRules,
    approveMozcoinPurchase, 
    rejectMozcoinPurchase, 
    requestPurchaseCorrection,
    addDiscountRule,
    updateDiscountRule,
    deleteDiscountRule,
    navigate,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'regras_desconto' | 'seguranca'>('pedidos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modais de ação para compras
  const [selectedPurchase, setSelectedPurchase] = useState<MozcoinPurchaseRequest | null>(null);
  const [actionType, setActionType] = useState<'aprovar' | 'rejeitar' | 'correcao' | null>(null);
  const [reasonInput, setReasonInput] = useState<string>('');

  // Modal para regra de desconto
  const [editingRule, setEditingRule] = useState<MozcoinDiscountRule | null>(null);
  const [isCreatingRule, setIsCreatingRule] = useState<boolean>(false);
  const [ruleForm, setRuleForm] = useState({
    title: '',
    description: '',
    monthsAdvance: 3,
    discountPercentage: 10,
    bonusMozcoins: 100,
    isActive: true
  });

  // Filtro de pedidos
  const filteredPurchases = allMozcoinPurchases
    .filter(p => {
      if (statusFilter === 'todos') return true;
      return p.status === statusFilter;
    })
    .filter(p => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.transactionCode.toLowerCase().includes(term) ||
        p.userName.toLowerCase().includes(term) ||
        p.institutionName?.toLowerCase().includes(term) ||
        p.network.toLowerCase().includes(term)
      );
    });

  // Estatísticas do painel
  const pendingCount = allMozcoinPurchases.filter(p => p.status === 'pendente').length;
  const approvedCount = allMozcoinPurchases.filter(p => p.status === 'aprovado').length;
  const totalMozInCirculation = allMozcoinWallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const totalPendingMoz = allMozcoinPurchases
    .filter(p => p.status === 'pendente')
    .reduce((acc, p) => acc + p.mozcoinAmount, 0);

  const handleOpenAction = (purchase: MozcoinPurchaseRequest, type: 'aprovar' | 'rejeitar' | 'correcao') => {
    setSelectedPurchase(purchase);
    setActionType(type);
    setReasonInput(type === 'rejeitar' ? 'Código de transação não localizado no extrato bancário.' : type === 'correcao' ? 'Por favor reenvie o comprovativo nítido ou confirme o código M-Pesa.' : '');
  };

  const handleExecuteAction = () => {
    if (!selectedPurchase || !actionType) return;

    if (actionType === 'aprovar') {
      approveMozcoinPurchase(selectedPurchase.id, currentUser.name);
    } else if (actionType === 'rejeitar') {
      rejectMozcoinPurchase(selectedPurchase.id, reasonInput, currentUser.name);
    } else if (actionType === 'correcao') {
      requestPurchaseCorrection(selectedPurchase.id, reasonInput, currentUser.name);
    }

    setSelectedPurchase(null);
    setActionType(null);
    setReasonInput('');
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      updateDiscountRule(editingRule.id, {
        title: ruleForm.title,
        description: ruleForm.description,
        monthsAdvance: ruleForm.monthsAdvance,
        discountPercentage: ruleForm.discountPercentage,
        bonusMozcoins: ruleForm.bonusMozcoins,
        isActive: ruleForm.isActive
      });
      setEditingRule(null);
    } else {
      addDiscountRule({
        title: ruleForm.title,
        description: ruleForm.description,
        monthsAdvance: ruleForm.monthsAdvance,
        discountPercentage: ruleForm.discountPercentage,
        bonusMozcoins: ruleForm.bonusMozcoins,
        isActive: ruleForm.isActive
      });
      setIsCreatingRule(false);
    }
    setRuleForm({
      title: '',
      description: '',
      monthsAdvance: 3,
      discountPercentage: 10,
      bonusMozcoins: 100,
      isActive: true
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('mozcoin_wallet')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Carteira
        </button>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Acesso Exclusivo Super Admin / CEO
        </span>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Gestão Administrativa & Aprovação de MOZCOIN
              </h1>
              <p className="text-xs text-slate-400">
                Aprovação soberana de recargas, controle de segurança das carteiras e regras de planos antecipados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 inline-flex">
              <button
                onClick={() => setActiveTab('pedidos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'pedidos' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fila de Pedidos ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('regras_desconto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'regras_desconto' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Regras de Desconto (86.5)
              </button>
              <button
                onClick={() => setActiveTab('seguranca')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'seguranca' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Segurança & Firestore (86.6)
              </button>
            </div>
          </div>
        </div>

        {/* Indicadores Globais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase">Pedidos Pendentes</div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{pendingCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase">Total MOZ em Análise</div>
            <div className="text-xl font-bold text-yellow-400 mt-1 font-mono">{totalPendingMoz.toLocaleString()} MOZ</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase">Pedidos Já Aprovados</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{approvedCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase">Em Circulação no Ecossistema</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{totalMozInCirculation.toLocaleString()} MOZ</div>
          </div>
        </div>
      </div>

      {/* ABA 1: FILA DE PEDIDOS DE COMPRA (Requisito 86.2) */}
      {activeTab === 'pedidos' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Fila de Validação de Transações (M-Pesa / e-Mola / Bancos)
              </h2>
              <p className="text-xs text-slate-400">
                Confira o extrato bancário ou SMS da operadora antes de liberar os créditos no sistema.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Buscar código ou requerente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50"
              >
                <option value="todos">Todos os Estados</option>
                <option value="pendente">Apenas Pendentes</option>
                <option value="aprovado">Aprovados</option>
                <option value="correcao_solicitada">Correção Solicitada</option>
                <option value="rejeitado">Rejeitados</option>
              </select>
            </div>
          </div>

          {/* Tabela de Pedidos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Data / Hora</th>
                  <th className="py-3 px-3">Requerente & Instituição</th>
                  <th className="py-3 px-3">Destino</th>
                  <th className="py-3 px-3">Método / Canal</th>
                  <th className="py-3 px-3">Código Transação</th>
                  <th className="py-3 px-3 text-right">Valor Pago</th>
                  <th className="py-3 px-3 text-right">Qtd MOZCOIN</th>
                  <th className="py-3 px-3 text-center">Comprovativo</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                      Nenhum pedido de MOZCOIN localizado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-300 font-mono">
                        {p.paymentDate} <span className="text-[10px] text-slate-500">{p.paymentTime}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{p.userName}</div>
                        <div className="text-[11px] text-slate-400">
                          {p.institutionName} • <span className="text-purple-400">{p.userRole}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {p.targetWallet === 'institution' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                            <Building2 className="w-3 h-3 text-amber-400" /> Institucional
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                            <User className="w-3 h-3 text-blue-400" /> Pessoal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-300">{p.network}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {p.transactionCode}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300 font-semibold">
                        {p.fiatAmount.toLocaleString()} MTn
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        +{p.mozcoinAmount.toLocaleString()} MOZ
                      </td>
                      <td className="py-3 px-3 text-center">
                        {p.proofUrl ? (
                          <a
                            href={p.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 underline text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3" /> Ver Talão
                          </a>
                        ) : (
                          <span className="text-slate-600 text-[11px]">Sem anexo</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {p.status === 'pendente' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                            Pendente
                          </span>
                        )}
                        {p.status === 'aprovado' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Aprovado
                          </span>
                        )}
                        {p.status === 'correcao_solicitada' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                            Correção Pedida
                          </span>
                        )}
                        {p.status === 'rejeitado' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            Rejeitado
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {p.status === 'pendente' || p.status === 'correcao_solicitada' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAction(p, 'aprovar')}
                              title="Aprovar e Creditar MOZCOIN"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenAction(p, 'correcao')}
                              title="Pedir Correção"
                              className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-slate-950 transition-colors"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenAction(p, 'rejeitar')}
                              title="Rejeitar Pedido"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {p.reviewedBy ? `Por ${p.reviewedBy.split(' ')[0]}` : 'Concluído'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: REGRAS DE DESCONTO PARA PLANOS ANTECIPADOS (Requisito 86.5) */}
      {activeTab === 'regras_desconto' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Configuração de Regras Promocionais & Bónus de Antecipação
              </h2>
              <p className="text-xs text-slate-400">
                Regras dinâmicas para aquisição de 3, 6, 12 meses. O sistema aplica os descontos de forma automática nos módulos.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingRule(null);
                setRuleForm({
                  title: '',
                  description: '',
                  monthsAdvance: 6,
                  discountPercentage: 20,
                  bonusMozcoins: 200,
                  isActive: true
                });
                setIsCreatingRule(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              Nova Regra Promocional
            </button>
          </div>

          {/* Lista de Regras Configuradas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mozcoinDiscountRules.map(rule => (
              <div 
                key={rule.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                  rule.isActive ? 'bg-slate-950/70 border-purple-500/30' : 'bg-slate-950/30 border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {rule.monthsAdvance} Meses
                    </span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      -{rule.discountPercentage}% Desconto
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-3">{rule.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rule.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Bónus Concedido:</span>
                    <strong className="text-amber-400 font-mono">+{rule.bonusMozcoins} MOZ</strong>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span className={`text-[11px] font-semibold ${rule.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {rule.isActive ? '● Regra Ativa' : '○ Inativa'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setRuleForm({
                            title: rule.title,
                            description: rule.description,
                            monthsAdvance: rule.monthsAdvance,
                            discountPercentage: rule.discountPercentage,
                            bonusMozcoins: rule.bonusMozcoins,
                            isActive: rule.isActive
                          });
                          setIsCreatingRule(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteDiscountRule(rule.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal / Formulário de Criação ou Edição de Regra */}
          {isCreatingRule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    {editingRule ? 'Editar Regra Promocional' : 'Nova Regra Promocional'}
                  </h3>
                  <button
                    onClick={() => setIsCreatingRule(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSaveRule} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Título da Regra:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Semestral Premium"
                      value={ruleForm.title}
                      onChange={e => setRuleForm({ ...ruleForm, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Descrição:</label>
                    <textarea
                      rows={2}
                      placeholder="Condição explicada ao cliente..."
                      value={ruleForm.description}
                      onChange={e => setRuleForm({ ...ruleForm, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Meses Mínimos:</label>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        required
                        value={ruleForm.monthsAdvance}
                        onChange={e => setRuleForm({ ...ruleForm, monthsAdvance: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">% Desconto:</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={ruleForm.discountPercentage}
                        onChange={e => setRuleForm({ ...ruleForm, discountPercentage: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Bónus em MOZCOIN:</label>
                    <input
                      type="number"
                      min="0"
                      value={ruleForm.bonusMozcoins}
                      onChange={e => setRuleForm({ ...ruleForm, bonusMozcoins: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="rule-active"
                      checked={ruleForm.isActive}
                      onChange={e => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-purple-600"
                    />
                    <label htmlFor="rule-active" className="text-slate-300 font-medium cursor-pointer">
                      Regra ativa imediatamente para todas as instituições
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingRule(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                    >
                      Salvar Regra
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: MONITOR DE SEGURANÇA FINANCEIRA (Requisito 86.6) */}
      {activeTab === 'seguranca' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Monitor de Segurança Financeira & Integridade (Requisito 86.6)
              </h2>
              <p className="text-xs text-slate-400">
                Auditoria de proteção do saldo: imutabilidade de extratos e restrição estrita de gravação via Firestore Rules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Anti-Adulteração de Saldo</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                O frontend é impedido de gravar qualquer saldo arbitrário. As coleções <strong className="text-slate-200">mozcoin_wallets</strong> exigem verificação do Super Admin ou funções de backend autorizadas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Extrato Imutável (Ledger)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Registros de <strong className="text-slate-200">mozcoin_transactions</strong> possuem regras <code className="text-amber-400">allow update, delete: if false</code>, garantindo rastreabilidade histórica irrevogável.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Isolamento Multi-Tenant</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada instituição e utilizador acessa estritamente sua carteira. O Super Admin/CEO é o único com escopo global para homologação e auditoria contábil.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Ação em Pedido (Aprovar / Rejeitar / Correção) */}
      {selectedPurchase && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                actionType === 'aprovar' ? 'bg-emerald-500/20 text-emerald-400' : actionType === 'rejeitar' ? 'bg-rose-500/20 text-rose-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {actionType === 'aprovar' ? <CheckCircle2 className="w-6 h-6" /> : actionType === 'rejeitar' ? <XCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {actionType === 'aprovar' ? 'Confirmar e Creditar MOZCOIN' : actionType === 'rejeitar' ? 'Rejeitar Pedido de Compra' : 'Solicitar Correção de Dados'}
                </h3>
                <p className="text-xs text-slate-400">
                  Ref: <span className="font-mono text-amber-400">{selectedPurchase.transactionCode}</span> • Requerente: {selectedPurchase.userName}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Valor a Creditar:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">+{selectedPurchase.mozcoinAmount.toLocaleString()} MOZ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Pago:</span>
                <span className="font-mono text-white">{selectedPurchase.fiatAmount.toLocaleString()} MTn</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destino:</span>
                <span className="font-semibold text-white">
                  {selectedPurchase.targetWallet === 'institution' ? `Instituição: ${selectedPurchase.institutionName}` : `Utilizador: ${selectedPurchase.userName}`}
                </span>
              </div>
            </div>

            {(actionType === 'rejeitar' || actionType === 'correcao') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {actionType === 'rejeitar' ? 'Motivo do Indeferimento:' : 'Instruções para o Requerente:'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={reasonInput}
                  onChange={e => setReasonInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs resize-none"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPurchase(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
                  actionType === 'aprovar'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : actionType === 'rejeitar'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                }`}
              >
                {actionType === 'aprovar' ? 'Sim, Creditar MOZCOIN' : actionType === 'rejeitar' ? 'Confirmar Rejeição' : 'Enviar Solicitação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
