import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Clock, 
  DollarSign, 
  PlusCircle, 
  Receipt, 
  Printer, 
  CheckCircle,
  FileSpreadsheet,
  Building,
  UserCheck,
  Send,
  ArrowRightLeft,
  Coins,
  History,
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  X,
  FileDown
} from 'lucide-react';
import { CashMovementType, CashTransaction, CashRegisterSession } from '../../types';

export const CashRegisterView: React.FC = () => {
  const { 
    activeCashSession, 
    cashSessions,
    addCashTransaction, 
    openCashRegister, 
    closeCashRegister, 
    activeInstitution,
    currentUser
  } = useApp();

  // Tab: 'atual' (sessão em curso) | 'historico' (sessões anteriores)
  const [activeTab, setActiveTab] = useState<'atual' | 'historico'>('atual');

  // Modal de Abertura
  const [openModal, setOpenModal] = useState(false);
  const [openingBalanceInput, setOpeningBalanceInput] = useState('5000');
  const [operatorInput, setOperatorInput] = useState(currentUser?.name || 'Tesouraria Central');

  // Modal de Movimentação (Entrada, Saída, Sangria, Reforço, Transferência)
  const [transactionModal, setTransactionModal] = useState(false);
  const [txType, setTxType] = useState<CashMovementType>('entrada');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txReason, setTxReason] = useState('');
  const [txCategory, setTxCategory] = useState('Propinas');
  const [txMethod, setTxMethod] = useState<'Dinheiro' | 'M-Pesa' | 'e-Mola' | 'POS' | 'Transferência'>('Dinheiro');
  const [txRef, setTxRef] = useState('');
  const [txTargetAccount, setTxTargetAccount] = useState('Conta Millennium BIM Principal');
  const [txNotes, setTxNotes] = useState('');

  // Modal de Fechamento de Caixa com Relatório e Conferência Cega/Informada
  const [closeModal, setCloseModal] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');
  const [reportedBalanceInput, setReportedBalanceInput] = useState('');
  const [viewSessionDetails, setViewSessionDetails] = useState<CashRegisterSession | null>(null);

  const isOpen = activeCashSession?.status === 'aberto';

  // Cálculos de totais da sessão ativa
  const totalEntradas = useMemo(() => {
    return activeCashSession?.transactions
      .filter(t => t.type === 'entrada')
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  }, [activeCashSession]);

  const totalReforcos = useMemo(() => {
    return activeCashSession?.transactions
      .filter(t => t.type === 'reforco')
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  }, [activeCashSession]);

  const totalSaidas = useMemo(() => {
    return activeCashSession?.transactions
      .filter(t => t.type === 'saida')
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  }, [activeCashSession]);

  const totalSangrias = useMemo(() => {
    return activeCashSession?.transactions
      .filter(t => t.type === 'sangria')
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  }, [activeCashSession]);

  const totalTransferencias = useMemo(() => {
    return activeCashSession?.transactions
      .filter(t => t.type === 'transferencia')
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  }, [activeCashSession]);

  // Saldo Esperado pelo sistema
  const expectedBalance = (activeCashSession?.openingBalance || 0) + totalEntradas + totalReforcos - totalSaidas - totalSangrias - totalTransferencias;

  // Diferença / Quebra calculada em tempo real no fecho
  const numReported = reportedBalanceInput === '' ? expectedBalance : parseFloat(reportedBalanceInput) || 0;
  const quebraCalculada = numReported - expectedBalance;

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(openingBalanceInput) || 0;
    openCashRegister(val, operatorInput || 'Operador Tesouraria');
    setOpenModal(false);
  };

  const handleOpenMovementModal = (type: CashMovementType) => {
    setTxType(type);
    if (type === 'sangria') {
      setTxCategory('Sangria / Cofre');
      setTxDesc('Sangria de segurança para cofre');
      setTxReason('Excesso de numerário em caixa para guarda no cofre central');
      setTxRef(`SANG-${Date.now().toString().slice(-4)}`);
    } else if (type === 'reforco') {
      setTxCategory('Suprimento de Troco');
      setTxDesc('Reforço de troco e numerário');
      setTxReason('Aporte de moedas e notas miúdas para facilitação de trocos');
      setTxRef(`REF-${Date.now().toString().slice(-4)}`);
    } else if (type === 'transferencia') {
      setTxCategory('Transferência Bancária');
      setTxDesc('Transferência de caixa para conta bancária');
      setTxReason('Depósito bancário diário da tesouraria');
      setTxRef(`TRANSF-${Date.now().toString().slice(-4)}`);
    } else if (type === 'saida') {
      setTxCategory('Despesas Operacionais');
      setTxDesc('');
      setTxReason('');
      setTxRef(`SAI-${Date.now().toString().slice(-4)}`);
    } else {
      setTxCategory('Propinas');
      setTxDesc('');
      setTxReason('');
      setTxRef(`CXT-${Date.now().toString().slice(-4)}`);
    }
    setTransactionModal(true);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(txAmount);
    if (!val || val <= 0) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-MZ');
    const timeStr = now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    addCashTransaction({
      institutionId: activeInstitution.id,
      type: txType,
      amount: val,
      description: txDesc || (txType === 'sangria' ? 'Sangria de segurança para cofre' : 'Lançamento de caixa'),
      reason: txReason || txDesc,
      category: txCategory,
      operator: activeCashSession?.operator || currentUser?.name || 'Operador Tesouraria',
      paymentMethod: txMethod,
      documentRef: txRef || `REF-${Date.now().toString().slice(-5)}`,
      targetAccount: txType === 'transferencia' ? txTargetAccount : undefined,
      notes: txNotes || undefined,
      date: dateStr,
      time: timeStr
    });

    setTxAmount('');
    setTxDesc('');
    setTxReason('');
    setTxNotes('');
    setTransactionModal(false);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reported = reportedBalanceInput === '' ? expectedBalance : parseFloat(reportedBalanceInput) || 0;
    closeCashRegister(
      closingNotes || 'Fechamento de caixa regular com conferência física realizada.',
      reported
    );
    setCloseModal(false);
  };

  const handlePrintSessionReport = (session: CashRegisterSession) => {
    setViewSessionDetails(session);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div id="cash-register-container" className="space-y-6">
      
      {/* Top Bar Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${
            isOpen 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs' 
              : 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
          }`}>
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Caixa Escolar & Tesouraria</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isOpen 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                {isOpen ? '● Caixa Aberto' : '○ Caixa Fechado'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Operador: <strong className="text-slate-700">{activeCashSession?.operator || 'Nenhum'}</strong> • {activeInstitution.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Navegação entre Sessão Atual e Histórico */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs mr-1">
            <button
              onClick={() => setActiveTab('atual')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'atual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sessão Atual
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'historico' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Histórico de Sessões ({cashSessions.length})
            </button>
          </div>

          {isOpen ? (
            <>
              {/* Botão Entrada */}
              <button
                id="btn-new-entrada"
                onClick={() => handleOpenMovementModal('entrada')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                + Entrada
              </button>

              {/* Botão Saída */}
              <button
                id="btn-new-saida"
                onClick={() => handleOpenMovementModal('saida')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                - Saída
              </button>

              {/* Botão Sangria */}
              <button
                id="btn-sangria"
                onClick={() => handleOpenMovementModal('sangria')}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Retirada para o cofre"
              >
                <Coins className="w-4 h-4 text-amber-600" />
                Sangria
              </button>

              {/* Botão Reforço */}
              <button
                id="btn-reforco"
                onClick={() => handleOpenMovementModal('reforco')}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Aporte de troco ou numerário"
              >
                <PlusCircle className="w-4 h-4 text-sky-600" />
                Reforço
              </button>

              {/* Botão Transferência */}
              <button
                id="btn-transferencia"
                onClick={() => handleOpenMovementModal('transferencia')}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Transferir para banco ou outro caixa"
              >
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                Transferência
              </button>

              {/* Botão Fechar Caixa */}
              <button
                id="btn-close-caixa"
                onClick={() => {
                  setReportedBalanceInput(expectedBalance.toString());
                  setCloseModal(true);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Lock className="w-4 h-4 text-rose-400" />
                Fechar Caixa
              </button>
            </>
          ) : (
            <button
              id="btn-open-caixa"
              onClick={() => setOpenModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Abrir Caixa Financeiro
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Imprimir relatório"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'atual' ? (
        <>
          {/* KPI Cards de Caixa */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Saldo Inicial */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Saldo Inicial
              </span>
              <div className="text-xl font-black text-slate-900">
                {(activeCashSession?.openingBalance || 0).toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-500">MT</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                {activeCashSession?.openedAt ? `Às ${activeCashSession.openedAt}` : 'Não aberto'}
              </span>
            </div>

            {/* Total Entradas */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs bg-emerald-50/20">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                (+) Entradas
              </span>
              <div className="text-xl font-black text-emerald-700">
                {totalEntradas.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-emerald-600">MT</span>
              </div>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">
                Propinas &amp; serviços
              </span>
            </div>

            {/* Total Reforços */}
            <div className="bg-white p-4 rounded-2xl border border-sky-200/80 shadow-xs bg-sky-50/20">
              <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block mb-1">
                (+) Reforços
              </span>
              <div className="text-xl font-black text-sky-700">
                {totalReforcos.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-sky-600">MT</span>
              </div>
              <span className="text-[10px] text-sky-600 mt-0.5 block">
                Aportes de troco
              </span>
            </div>

            {/* Total Saídas */}
            <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs bg-rose-50/20">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
                (-) Saídas
              </span>
              <div className="text-xl font-black text-rose-700">
                {totalSaidas.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-rose-600">MT</span>
              </div>
              <span className="text-[10px] text-rose-600 mt-0.5 block">
                Despesas avulsas
              </span>
            </div>

            {/* Total Sangrias */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs bg-amber-50/20">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                (-) Sangrias
              </span>
              <div className="text-xl font-black text-amber-700">
                {totalSangrias.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-amber-600">MT</span>
              </div>
              <span className="text-[10px] text-amber-600 mt-0.5 block">
                Recolha p/ cofre
              </span>
            </div>

            {/* Saldo Esperado / Atual */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Saldo Esperado
              </span>
              <div className="text-xl font-black text-emerald-400">
                {expectedBalance.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-400">MT</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Em posse do operador
              </span>
            </div>
          </div>

          {/* Relatório Resumo de Fechamento / Conferência Prévia */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Quadro de Fecho &amp; Prestação de Contas (Relatório do Turno)</h3>
                  <p className="text-xs text-slate-400">
                    Acompanhamento analítico da equação de caixa em tempo real
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  Sessão: {activeCashSession?.id || 'Nenhum caixa aberto'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-4 text-xs font-mono">
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[9px] text-slate-400 uppercase block">1. Saldo Inicial</span>
                <span className="text-sm font-bold text-white">{(activeCashSession?.openingBalance || 0).toLocaleString('pt-MZ')} MT</span>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[9px] text-emerald-400 uppercase block">2. (+) Entradas</span>
                <span className="text-sm font-bold text-emerald-300">+{totalEntradas.toLocaleString('pt-MZ')} MT</span>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[9px] text-sky-400 uppercase block">3. (+) Reforços</span>
                <span className="text-sm font-bold text-sky-300">+{totalReforcos.toLocaleString('pt-MZ')} MT</span>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[9px] text-rose-400 uppercase block">4. (-) Saídas</span>
                <span className="text-sm font-bold text-rose-300">-{totalSaidas.toLocaleString('pt-MZ')} MT</span>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[9px] text-amber-400 uppercase block">5. (-) Sangrias</span>
                <span className="text-sm font-bold text-amber-300">-{totalSangrias.toLocaleString('pt-MZ')} MT</span>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[9px] text-indigo-400 uppercase block">6. (-) Transf.</span>
                <span className="text-sm font-bold text-indigo-300">-{totalTransferencias.toLocaleString('pt-MZ')} MT</span>
              </div>
              <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-600/50">
                <span className="text-[9px] text-emerald-400 uppercase font-bold block">7. Saldo Esperado</span>
                <span className="text-sm font-black text-emerald-400">{expectedBalance.toLocaleString('pt-MZ')} MT</span>
              </div>
            </div>
          </div>

          {/* Tabela de Movimentações da Sessão Ativa */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Movimentações do Caixa ({activeCashSession?.transactions?.length || 0})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Operador: <strong className="text-slate-800">{activeCashSession?.operator}</strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Data &amp; Hora</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Referência</th>
                    <th className="px-4 py-3">Descrição / Motivo</th>
                    <th className="px-4 py-3">Utilizador</th>
                    <th className="px-4 py-3">Forma</th>
                    <th className="px-4 py-3 text-right">Valor (MZN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCashSession?.transactions?.map(tx => {
                    const isPlus = tx.type === 'entrada' || tx.type === 'reforco';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          <span className="font-bold text-slate-900 block">{tx.time || tx.timestamp}</span>
                          <span className="text-[10px] text-slate-400">{tx.date || 'Hoje'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            tx.type === 'entrada'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : tx.type === 'reforco'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : tx.type === 'sangria'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : tx.type === 'transferencia'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isPlus ? '+' : '-'} {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">
                          {tx.documentRef || tx.id}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{tx.description}</p>
                          {tx.reason && tx.reason !== tx.description && (
                            <p className="text-[11px] text-slate-500">Motivo: {tx.reason}</p>
                          )}
                          {tx.studentName && (
                            <p className="text-[10px] text-emerald-700 font-semibold">Aluno: {tx.studentName}</p>
                          )}
                          {tx.targetAccount && (
                            <p className="text-[10px] text-indigo-700 font-semibold">Destino: {tx.targetAccount}</p>
                          )}
                          {tx.notes && (
                            <p className="text-[10px] text-slate-400 italic">Obs: {tx.notes}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {tx.operator}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {tx.paymentMethod}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-black text-sm ${
                          isPlus ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPlus ? '+' : '-'}{tx.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                        </td>
                      </tr>
                    );
                  })}
                  {(!activeCashSession?.transactions || activeCashSession.transactions.length === 0) && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Nenhum movimento registrado nesta sessão de caixa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* TAB: HISTÓRICO DE SESSÕES ANTERIORES */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              Histórico de Sessões de Caixa Homologadas
            </h2>
            <span className="text-xs text-slate-500">
              Total: {cashSessions.length} sessões
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">ID / Período</th>
                  <th className="px-4 py-3">Operador</th>
                  <th className="px-4 py-3 text-right">Saldo Inicial</th>
                  <th className="px-4 py-3 text-right">Entradas</th>
                  <th className="px-4 py-3 text-right">Saídas / Sangrias</th>
                  <th className="px-4 py-3 text-right">Saldo Esperado</th>
                  <th className="px-4 py-3 text-right">Saldo Informado</th>
                  <th className="px-4 py-3 text-center">Diferença / Quebra</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashSessions.map(session => {
                  const dif = session.differenceAmount !== undefined 
                    ? session.differenceAmount 
                    : (session.reportedBalance !== undefined && session.expectedBalance !== undefined ? session.reportedBalance - session.expectedBalance : 0);
                  
                  return (
                    <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono">
                        <span className="font-bold text-slate-900 block">{session.id}</span>
                        <span className="text-[10px] text-slate-500">Aberto: {session.openedAt}</span>
                        {session.closedAt && (
                          <span className="text-[10px] text-slate-400 block">Fechado: {session.closedAt}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {session.operator}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        {session.openingBalance.toLocaleString('pt-MZ')} MT
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                        +{(session.totalEntradas || 0).toLocaleString('pt-MZ')} MT
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                        -{((session.totalSaidas || 0) + (session.totalSangrias || 0)).toLocaleString('pt-MZ')} MT
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-slate-900">
                        {(session.expectedBalance !== undefined ? session.expectedBalance : session.currentBalance).toLocaleString('pt-MZ')} MT
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                        {(session.reportedBalance !== undefined ? session.reportedBalance : session.currentBalance).toLocaleString('pt-MZ')} MT
                      </td>
                      <td className="px-4 py-3 text-center">
                        {dif === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Exato (0 MT)
                          </span>
                        ) : dif < 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" /> Falta ({dif.toLocaleString('pt-MZ')} MT)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-sky-700 border border-sky-200">
                            Sobra (+{dif.toLocaleString('pt-MZ')} MT)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handlePrintSessionReport(session)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          Relatório
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Abertura de Caixa */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Unlock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Abertura de Caixa Escolar</h3>
              </div>
              <button onClick={() => setOpenModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Operador Responsável</label>
                <input
                  type="text"
                  value={operatorInput}
                  onChange={e => setOperatorInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fundo de Caixa Inicial (MZN)</label>
                <input
                  type="number"
                  step="0.01"
                  value={openingBalanceInput}
                  onChange={e => setOpeningBalanceInput(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Valor em dinheiro físico conferido na gaveta no início do turno.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Homologar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Lançamento de Movimentação (Entrada, Saída, Sangria, Reforço, Transferência) */}
      {transactionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-slate-900 capitalize">
                  Novo Movimento: {txType}
                </span>
              </div>
              <button onClick={() => setTransactionModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-3.5">
              {/* Seleção do Tipo de Movimento */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Tipo de Movimentação</label>
                <div className="grid grid-cols-5 gap-1 text-[11px] font-bold">
                  {(['entrada', 'saida', 'sangria', 'reforco', 'transferencia'] as CashMovementType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTxType(t)}
                      className={`py-1.5 px-1 rounded-lg border text-center capitalize transition-all cursor-pointer truncate ${
                        txType === t
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor e Referência */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Valor em Meticais (MZN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    placeholder="Ex: 2500"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Referência / N.º Doc</label>
                  <input
                    type="text"
                    value={txRef}
                    onChange={e => setTxRef(e.target.value)}
                    placeholder="Ex: REC-9921, FAT-102"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Descrição e Motivo */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição</label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={e => setTxDesc(e.target.value)}
                  placeholder="Ex: Pagamento de propina do formando Carlos Silva"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Motivo do Lançamento</label>
                <input
                  type="text"
                  value={txReason}
                  onChange={e => setTxReason(e.target.value)}
                  placeholder="Ex: Recolha de segurança / Regularização de propina atrasada"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Se for transferência, pedir a conta de destino */}
              {txType === 'transferencia' && (
                <div>
                  <label className="text-xs font-bold text-indigo-900 block mb-1">Conta de Destino / Caixa Destino</label>
                  <select
                    value={txTargetAccount}
                    onChange={e => setTxTargetAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50/40 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Conta Millennium BIM Principal">Conta Millennium BIM Principal (NUIT 400192831)</option>
                    <option value="Conta BCI Operacional">Conta BCI Operacional (NUIT 400192831)</option>
                    <option value="Conta Standard Bank">Conta Standard Bank</option>
                    <option value="Caixa Secundário / Filial B">Caixa Secundário (Filial)</option>
                  </select>
                </div>
              )}

              {/* Categoria e Forma de Pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Propinas">Propinas</option>
                    <option value="Matrículas">Matrículas</option>
                    <option value="Certificados">Certificados &amp; Diplomas</option>
                    <option value="Uniformes">Uniformes &amp; Manuais</option>
                    <option value="Sangria / Cofre">Sangria / Cofre</option>
                    <option value="Suprimento de Troco">Suprimento de Troco</option>
                    <option value="Despesas Operacionais">Despesas Operacionais</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Forma de Pagamento</label>
                  <select
                    value={txMethod}
                    onChange={e => setTxMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Dinheiro">Dinheiro Físico</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="e-Mola">e-Mola</option>
                    <option value="POS">POS Cartão (BIM/Ponto24)</option>
                    <option value="Transferência">Transferência Bancária</option>
                  </select>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Observações (Opcional)</label>
                <textarea
                  value={txNotes}
                  onChange={e => setTxNotes(e.target.value)}
                  rows={2}
                  placeholder="Informações adicionais para auditoria..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransactionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Gravar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Fechamento de Caixa com Relatório e Conferência Cega */}
      {closeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Fechamento do Caixa Escolar</h3>
                  <p className="text-xs text-slate-500">Relatório de conferência e apuração de quebra</p>
                </div>
              </div>
              <button onClick={() => setCloseModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloseSubmit} className="space-y-4">
              {/* Resumo Contábil do Turno */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Saldo Inicial (Abertura):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {(activeCashSession?.openingBalance || 0).toLocaleString('pt-MZ')} MT
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>(+) Total Entradas:</span>
                  <span className="font-mono font-bold">+{totalEntradas.toLocaleString('pt-MZ')} MT</span>
                </div>
                <div className="flex justify-between text-sky-700">
                  <span>(+) Total Reforços:</span>
                  <span className="font-mono font-bold">+{totalReforcos.toLocaleString('pt-MZ')} MT</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>(-) Total Saídas:</span>
                  <span className="font-mono font-bold">-{totalSaidas.toLocaleString('pt-MZ')} MT</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>(-) Total Sangrias:</span>
                  <span className="font-mono font-bold">-{totalSangrias.toLocaleString('pt-MZ')} MT</span>
                </div>
                <div className="flex justify-between text-indigo-700">
                  <span>(-) Total Transferências:</span>
                  <span className="font-mono font-bold">-{totalTransferencias.toLocaleString('pt-MZ')} MT</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-sm text-slate-900">
                  <span>Saldo Esperado em Caixa:</span>
                  <span className="font-mono text-emerald-700">{expectedBalance.toLocaleString('pt-MZ')} MT</span>
                </div>
              </div>

              {/* Saldo Informado pelo Operador */}
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Saldo Informado / Físico (Contagem de Notas e Moedas)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={reportedBalanceInput}
                  onChange={e => setReportedBalanceInput(e.target.value)}
                  placeholder={expectedBalance.toString()}
                  className="w-full px-3 py-2.5 border-2 border-slate-300 focus:border-slate-900 rounded-xl text-lg font-black text-slate-900 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Informe exatamente o valor apurado fisicamente na gaveta de dinheiro.
                </span>
              </div>

              {/* Diferença / Quebra Card */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                quebraCalculada === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : quebraCalculada < 0
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-sky-50 border-sky-200 text-sky-900'
              }`}>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] block">
                    {quebraCalculada === 0 ? 'Conferência Exata' : quebraCalculada < 0 ? 'Quebra de Caixa (Falta)' : 'Sobra de Caixa (Excedente)'}
                  </span>
                  <p className="text-[11px]">
                    {quebraCalculada === 0 
                      ? 'Nenhuma divergência apurada entre o sistema e o dinheiro físico.' 
                      : quebraCalculada < 0 
                      ? 'O saldo físico informado é menor que o esperado.' 
                      : 'O saldo físico informado é maior que o esperado.'}
                  </p>
                </div>
                <div className="text-right font-mono font-black text-base">
                  {quebraCalculada > 0 ? '+' : ''}{quebraCalculada.toLocaleString('pt-MZ')} MT
                </div>
              </div>

              {/* Observações de Fechamento */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Observações do Fecho / Ocorrências
                </label>
                <textarea
                  value={closingNotes}
                  onChange={e => setClosingNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Conferência efetuada com o tesoureiro adjunto. Sangrias lacradas no malote #14."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCloseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Homologar Fecho do Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL / VIEW: Relatório Imprimível de Fechamento de Sessão Específica */}
      {viewSessionDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 print:border-none print:shadow-none print:max-w-none">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="font-bold text-sm text-slate-900">Relatório Oficial de Fecho de Caixa</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  onClick={() => setViewSessionDetails(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Documento Imprimível */}
            <div className="space-y-5 text-slate-800 text-xs mt-4">
              <div className="text-center pb-4 border-b border-slate-900">
                <h2 className="text-base font-black uppercase text-slate-900">{activeInstitution.name}</h2>
                <p className="text-[10px] text-slate-600 font-medium">
                  {activeInstitution.address} • NUIT: {activeInstitution.nuit} • Telefone: {activeInstitution.phone}
                </p>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mt-2">
                  RELATÓRIO DE FECHO &amp; CONFERÊNCIA DE CAIXA
                </h3>
                <p className="text-[10px] font-mono text-slate-500">ID da Sessão: {viewSessionDetails.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p><strong>Operador:</strong> {viewSessionDetails.operator}</p>
                  <p><strong>Abertura:</strong> {viewSessionDetails.openedAt}</p>
                </div>
                <div className="text-right">
                  <p><strong>Estado:</strong> {viewSessionDetails.status.toUpperCase()}</p>
                  <p><strong>Fecho:</strong> {viewSessionDetails.closedAt || 'Em aberto'}</p>
                </div>
              </div>

              {/* Tabela de Fechamento */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Item da Demonstração</th>
                      <th className="p-2.5 text-right">Valor (MZN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5">Saldo Inicial (Fundo de Abertura)</td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        {viewSessionDetails.openingBalance.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-emerald-700">(+) Total Entradas no Período</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700 font-bold">
                        +{(viewSessionDetails.totalEntradas || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-700">(+) Total Reforços de Caixa</td>
                      <td className="p-2.5 text-right font-mono text-sky-700 font-bold">
                        +{(viewSessionDetails.totalReforcos || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-rose-700">(-) Total Saídas / Despesas</td>
                      <td className="p-2.5 text-right font-mono text-rose-700 font-bold">
                        -{(viewSessionDetails.totalSaidas || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-amber-700">(-) Total Sangrias para Cofre</td>
                      <td className="p-2.5 text-right font-mono text-amber-700 font-bold">
                        -{(viewSessionDetails.totalSangrias || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2.5">Saldo Esperado pelo Sistema</td>
                      <td className="p-2.5 text-right font-mono text-emerald-800">
                        {(viewSessionDetails.expectedBalance !== undefined ? viewSessionDetails.expectedBalance : viewSessionDetails.currentBalance).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                    <tr className="bg-slate-100 font-black">
                      <td className="p-2.5">Saldo Informado (Conferência Física)</td>
                      <td className="p-2.5 text-right font-mono text-slate-900">
                        {(viewSessionDetails.reportedBalance !== undefined ? viewSessionDetails.reportedBalance : viewSessionDetails.currentBalance).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                    <tr className="bg-slate-900 text-white font-bold">
                      <td className="p-2.5">Diferença / Quebra Apurada</td>
                      <td className="p-2.5 text-right font-mono">
                        {(viewSessionDetails.differenceAmount !== undefined ? viewSessionDetails.differenceAmount : 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {viewSessionDetails.closingNotes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-[10px] uppercase text-slate-500">Observações Registradas no Fecho:</p>
                  <p className="text-slate-800 italic mt-0.5">{viewSessionDetails.closingNotes}</p>
                </div>
              )}

              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-600">
                <div>
                  <div className="border-b border-slate-400 h-8 mb-1"></div>
                  <p className="font-bold text-slate-900 uppercase">Assinatura do Operador</p>
                  <p>{viewSessionDetails.operator}</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-8 mb-1"></div>
                  <p className="font-bold text-slate-900 uppercase">Visto da Direção / Auditoria</p>
                  <p>Direção Administrativa e Financeira</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
