import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Users,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Printer,
  Download,
  Send,
  Smartphone,
  RefreshCw,
  FileText,
  ShieldCheck,
  Layers,
  Lock,
  Unlock,
  Banknote,
  QrCode,
  Eye,
  Package,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord, ContaReceber, ContaPagar } from '../../types';

export const FinanceExperienceView: React.FC = () => {
  const {
    activeInstitution,
    activeBranch,
    students,
    courses,
    contasReceber,
    contasPagar,
    addContaReceber,
    receiveContaPayment,
    addContaPagar,
    payContaPagar,
    paymentRecords,
    approvePayment,
    rejectPayment,
    cashSessions,
    activeCashSession,
    addCashTransaction,
    openCashRegister,
    closeCashRegister,
    addNotification,
    navigate
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'receber'
    | 'pagar'
    | 'mensalidades'
    | 'pagamentos'
    | 'mpesa'
    | 'emola'
    | 'recibos'
    | 'caixa'
    | 'sangria'
    | 'fornecedores'
    | 'despesas'
    | 'relatorios'
  >('dashboard');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'hoje' | 'mes' | 'ano'>('mes');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modal / Form States
  const [showNewReceberModal, setShowNewReceberModal] = useState(false);
  const [showNewPagarModal, setShowNewPagarModal] = useState(false);
  const [showSangriaModal, setShowSangriaModal] = useState(false);
  const [showOpenCaixaModal, setShowOpenCaixaModal] = useState(false);
  const [showCloseCaixaModal, setShowCloseCaixaModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Sangria Form
  const [sangriaAmount, setSangriaAmount] = useState<number>(1000);
  const [sangriaReason, setSangriaReason] = useState('Depósito Bancário no Millennium BIM');

  // Open Caixa Form
  const [initialCashAmount, setInitialCashAmount] = useState<number>(2500);

  // New Conta Receber Form
  const [newReceberTitle, setNewReceberTitle] = useState('');
  const [newReceberStudent, setNewReceberStudent] = useState(students[0]?.fullName || '');
  const [newReceberAmount, setNewReceberAmount] = useState<number>(3500);
  const [newReceberCategory, setNewReceberCategory] = useState<'propina' | 'matricula' | 'declaracao' | 'exame'>('propina');
  const [newReceberDue, setNewReceberDue] = useState('2026-10-10');

  // New Conta Pagar Form
  const [newPagarTitle, setNewPagarTitle] = useState('');
  const [newPagarSupplier, setNewPagarSupplier] = useState('EDM - Electricidade de Moçambique');
  const [newPagarAmount, setNewPagarAmount] = useState<number>(4200);
  const [newPagarCategory, setNewPagarCategory] = useState('Utilidades');
  const [newPagarDue, setNewPagarDue] = useState('2026-10-05');

  // M-Pesa STK Simulator
  const [mpesaPhone, setMpesaPhone] = useState('84 123 4567');
  const [mpesaAmount, setMpesaAmount] = useState<number>(3500);
  const [mpesaStudentName, setMpesaStudentName] = useState(students[0]?.fullName || 'Estudante Selecionado');
  const [mpesaSimulating, setMpesaSimulating] = useState(false);

  // e-Mola Simulator
  const [emolaPhone, setEmolaPhone] = useState('86 987 6543');
  const [emolaAmount, setEmolaAmount] = useState<number>(2500);
  const [emolaStudentName, setEmolaStudentName] = useState(students[1]?.fullName || 'Estudante Selecionado');
  const [emolaSimulating, setEmolaSimulating] = useState(false);

  // Fornecedores Mock
  const [suppliers, setSuppliers] = useState([
    { id: 'sup-1', name: 'EDM - Electricidade de Moçambique', nuit: '400109281', category: 'Energia Elétrica', phone: '+258 21 353600', balance: 0 },
    { id: 'sup-2', name: 'FIPAG - Águas de Maputo', nuit: '400188273', category: 'Abastecimento de Água', phone: '+258 21 300400', balance: 0 },
    { id: 'sup-3', name: 'Vodacom Moçambique (Internet Fibra)', nuit: '400234199', category: 'Telecomunicações & TI', phone: '+258 84 111', balance: 0 },
    { id: 'sup-4', name: 'Papelaria & Tipografia Central', nuit: '400998124', category: 'Material Didático & Escritório', phone: '+258 82 555 1234', balance: 12500 },
    { id: 'sup-5', name: 'ProSegur Segurança Privada', nuit: '400778811', category: 'Segurança & Vigilância', phone: '+258 21 445566', balance: 28000 }
  ]);

  // Cálculos do Dashboard
  const totalRecebido = useMemo(() => {
    return contasReceber
      .filter(c => c.status === 'pago')
      .reduce((acc, curr) => acc + (curr.paidAmount || curr.amount), 0);
  }, [contasReceber]);

  const totalAReceber = useMemo(() => {
    return contasReceber
      .filter(c => c.status === 'pendente' || c.status === 'atrasado')
      .reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);
  }, [contasReceber]);

  const totalPagoDespesas = useMemo(() => {
    return contasPagar
      .filter(c => c.status === 'pago')
      .reduce((acc, curr) => acc + (curr.amount || curr.valor || 0), 0);
  }, [contasPagar]);

  const totalAPagar = useMemo(() => {
    return contasPagar
      .filter(c => c.status === 'pendente' || c.status === 'atrasado')
      .reduce((acc, curr) => acc + (curr.amount || curr.valor || 0), 0);
  }, [contasPagar]);

  const saldoEmCaixa = useMemo(() => {
    return activeCashSession ? activeCashSession.currentBalance : 14850;
  }, [activeCashSession]);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Handle Sangria
  const handlePerformSangria = (e: React.FormEvent) => {
    e.preventDefault();
    if (sangriaAmount <= 0) return;
    addCashTransaction({
      institutionId: activeInstitution.id,
      branchId: activeBranch?.id,
      type: 'sangria',
      category: 'Sangria',
      amount: sangriaAmount,
      description: `Sangria de Caixa: ${sangriaReason}`,
      operator: 'Tesoureiro Principal',
      paymentMethod: 'Dinheiro',
      notes: `Autorizado pela Direção do Centro ${activeInstitution.code}`
    });
    setShowSangriaModal(false);
    showFeedback(`Sangria de ${sangriaAmount.toLocaleString()} MT registrada com sucesso.`);
    addNotification({
      title: 'Sangria de Caixa Efetuada',
      message: `Retirada de ${sangriaAmount} MT para custódia bancária realizada por Tesoureiro Principal.`,
      type: 'payment'
    });
  };

  // Handle Open Caixa
  const handleOpenCaixa = (e: React.FormEvent) => {
    e.preventDefault();
    openCashRegister(initialCashAmount, 'Tesoureiro Principal');
    setShowOpenCaixaModal(false);
    showFeedback(`Caixa diário aberto com fundo de troco de ${initialCashAmount.toLocaleString()} MT.`);
  };

  // Handle Close Caixa
  const handleCloseCaixa = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashRegister('Fecho de caixa regular com conferência cega de valores.', saldoEmCaixa);
    setShowCloseCaixaModal(false);
    showFeedback('Sessão de caixa encerrada e balancete emitido.');
  };

  // Handle Create Conta Receber
  const handleCreateReceber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceberTitle.trim()) return;
    addContaReceber({
      institutionId: activeInstitution.id,
      branchId: activeBranch?.id,
      studentName: newReceberStudent,
      title: newReceberTitle,
      category: newReceberCategory,
      amount: newReceberAmount,
      dueDate: newReceberDue,
      status: 'pendente'
    });
    setNewReceberTitle('');
    setShowNewReceberModal(false);
    showFeedback('Título a receber lançado no sistema financeiro.');
  };

  // Handle Create Conta Pagar
  const handleCreatePagar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPagarTitle.trim()) return;
    addContaPagar({
      institutionId: activeInstitution.id,
      branchId: activeBranch?.id,
      supplierName: newPagarSupplier,
      title: newPagarTitle,
      category: newPagarCategory,
      amount: newPagarAmount,
      dueDate: newPagarDue,
      status: 'pendente'
    });
    setNewPagarTitle('');
    setShowNewPagarModal(false);
    showFeedback('Conta a pagar registrada com vencimento agendado.');
  };

  // Handle Simular M-Pesa
  const handleSimulateMpesa = () => {
    setMpesaSimulating(true);
    setTimeout(() => {
      setMpesaSimulating(false);
      const fakeTxCode = `NL${Math.floor(100000 + Math.random() * 900000)}JX`;
      addContaReceber({
        institutionId: activeInstitution.id,
        branchId: activeBranch?.id,
        studentName: mpesaStudentName,
        title: `Propina via M-Pesa (${fakeTxCode})`,
        category: 'propina',
        amount: mpesaAmount,
        dueDate: '2026-09-22',
        status: 'pago',
        paidAmount: mpesaAmount,
        paymentMethod: 'M-Pesa',
        receiptNumber: `REC-${fakeTxCode}`
      });
      showFeedback(`Pagamento M-Pesa de ${mpesaAmount} MT confirmado! Cód: ${fakeTxCode}`);
      addNotification({
        title: 'M-Pesa STK Push Concluído',
        message: `Transação ${fakeTxCode} recebida de ${mpesaStudentName} no valor de ${mpesaAmount} MT.`,
        type: 'payment'
      });
    }, 1800);
  };

  // Handle Simular e-Mola
  const handleSimulateEmola = () => {
    setEmolaSimulating(true);
    setTimeout(() => {
      setEmolaSimulating(false);
      const fakeRef = `EM${Math.floor(200000 + Math.random() * 800000)}`;
      addContaReceber({
        institutionId: activeInstitution.id,
        branchId: activeBranch?.id,
        studentName: emolaStudentName,
        title: `Propina via e-Mola (${fakeRef})`,
        category: 'propina',
        amount: emolaAmount,
        dueDate: '2026-09-22',
        status: 'pago',
        paidAmount: emolaAmount,
        paymentMethod: 'e-Mola',
        receiptNumber: `REC-${fakeRef}`
      });
      showFeedback(`Pagamento e-Mola de ${emolaAmount} MT liquidado! Ref: ${fakeRef}`);
      addNotification({
        title: 'e-Mola Movitel Confirmado',
        message: `Referência ${fakeRef} validada para ${emolaStudentName} (${emolaAmount} MT).`,
        type: 'payment'
      });
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* Top Financial Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              Módulo 77: Experiência do Financeiro • {activeInstitution.code}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Gestão Financeira &amp; Tesouraria Escolar
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Controle integral de contas a receber, contas a pagar, conciliação M-Pesa &amp; e-Mola, emissão oficial de recibos com código QR, abertura e sangria de caixa e DRE contábil em Meticais (MT).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2 shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Caixa da Tesouraria:
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {saldoEmCaixa.toLocaleString()} <span className="text-xs text-white">MT</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <span className={`w-2 h-2 rounded-full ${activeCashSession?.status === 'aberto' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-[11px] text-slate-300 font-bold">
                {activeCashSession?.status === 'aberto' ? 'Caixa Aberto (Sessão Ativa)' : 'Caixa Encerrado'}
              </span>
            </div>
          </div>
        </div>

        {/* 13 Pillars Tabs Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-8 pt-4 border-t border-slate-800">
          {[
            { id: 'dashboard', label: '1. Dashboard', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'receber', label: '2. A Receber', icon: <ArrowDownLeft className="w-3.5 h-3.5" /> },
            { id: 'pagar', label: '3. A Pagar', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
            { id: 'mensalidades', label: '4. Mensalidades', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'pagamentos', label: '5. Pagamentos', icon: <CreditCard className="w-3.5 h-3.5" /> },
            { id: 'mpesa', label: '6. M-Pesa', icon: <Smartphone className="w-3.5 h-3.5" /> },
            { id: 'emola', label: '7. e-Mola', icon: <Smartphone className="w-3.5 h-3.5" /> },
            { id: 'recibos', label: '8. Recibos', icon: <Receipt className="w-3.5 h-3.5" /> },
            { id: 'caixa', label: '9. Caixa', icon: <Wallet className="w-3.5 h-3.5" /> },
            { id: 'sangria', label: '10. Sangria', icon: <Banknote className="w-3.5 h-3.5" /> },
            { id: 'fornecedores', label: '11. Fornecedores', icon: <Building2 className="w-3.5 h-3.5" /> },
            { id: 'despesas', label: '12. Despesas', icon: <TrendingDown className="w-3.5 h-3.5" /> },
            { id: 'relatorios', label: '13. Relatórios', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 p-2 rounded-xl font-bold text-xs transition-all cursor-pointer truncate ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-950/70 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 1. DASHBOARD FINANCEIRO */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Receitas Arrecadadas</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {totalRecebido.toLocaleString()} <span className="text-sm font-normal text-slate-400">MT</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <span>+14.2% em relação ao mês anterior</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Contas a Receber (Pendente)</span>
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <ArrowDownLeft className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono">
                {totalAReceber.toLocaleString()} <span className="text-sm font-normal text-slate-400">MT</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Propinas e emolumentos a vencer no ciclo
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Despesas Liquidadas</span>
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {totalPagoDespesas.toLocaleString()} <span className="text-sm font-normal text-slate-400">MT</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Salários, rendas, energia e consumos
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Resultado Operacional Líquido</span>
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono">
                {(totalRecebido - totalPagoDespesas).toLocaleString()} <span className="text-sm font-normal text-slate-400">MT</span>
              </div>
              <div className="text-[11px] text-cyan-400 font-bold">
                Superávit operacional positivo
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewReceberModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Lançar Recebimento / Propina</span>
            </button>

            <button
              onClick={() => setShowNewPagarModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Lançar Conta a Pagar</span>
            </button>

            <button
              onClick={() => setShowSangriaModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-600/20"
            >
              <Banknote className="w-4 h-4" />
              <span>Efetuar Sangria de Caixa</span>
            </button>

            <button
              onClick={() => navigate('fluxo_pagamento')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Fluxo 72 (Aluno → Finanças) →</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. CONTAS A RECEBER */}
      {activeTab === 'receber' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                Contas a Receber (Propinas, Matrículas &amp; Emolumentos)
              </h3>
              <p className="text-xs text-slate-400">Total pendente: {totalAReceber.toLocaleString()} MT</p>
            </div>
            <button
              onClick={() => setShowNewReceberModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              + Novo Título a Receber
            </button>
          </div>

          <div className="space-y-3">
            {contasReceber.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">{item.title}</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'pago' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    Aluno: <span className="text-slate-200 font-bold">{item.studentName}</span> • Categoria: <span className="text-cyan-300 capitalize">{item.category}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Vencimento: {item.dueDate} {item.paymentMethod ? `• Pago via ${item.paymentMethod}` : ''}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-black text-white font-mono">{item.amount.toLocaleString()} MT</span>
                  </div>
                  {item.status !== 'pago' && (
                    <button
                      onClick={() => {
                        receiveContaPayment(item.id, {
                          paidAmount: item.amount,
                          paymentMethod: 'Dinheiro',
                          receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
                          operator: 'Tesouraria Central'
                        });
                        showFeedback(`Título de ${item.studentName} recebido e liquidado.`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Receber Agora
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CONTAS A PAGAR */}
      {activeTab === 'pagar' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
                Contas a Pagar (Fornecedores &amp; Despesas Fixas)
              </h3>
              <p className="text-xs text-slate-400">Total pendente de liquidação: {totalAPagar.toLocaleString()} MT</p>
            </div>
            <button
              onClick={() => setShowNewPagarModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/20"
            >
              + Nova Conta a Pagar
            </button>
          </div>

          <div className="space-y-3">
            {contasPagar.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">{(item as any).title || item.despesa}</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'pago' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    Fornecedor: <span className="text-slate-200 font-bold">{item.fornecedor || (item as any).supplierName || 'Geral'}</span> • Categoria: <span className="text-amber-300">{item.categoria}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Vencimento: {item.data || (item as any).dueDate}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-black text-rose-300 font-mono">{(item.valor ?? (item as any).amount ?? 0).toLocaleString()} MT</span>
                  </div>
                  {item.status !== 'pago' && (
                    <button
                      onClick={() => {
                        payContaPagar(item.id, {
                          paymentMethod: 'Dinheiro (Caixa)',
                          paidBy: 'Tesouraria Central',
                          deductFromCash: true
                        });
                        showFeedback(`Conta para ${item.fornecedor || (item as any).supplierName || item.despesa} liquidada com débito em caixa.`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                    >
                      Pagar Conta
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MENSALIDADES */}
      {activeTab === 'mensalidades' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Quadro Geral de Mensalidades (Jan a Dez 2026)
              </h3>
              <p className="text-xs text-slate-400">Controle individual de liquidação por formando e turma.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Estudante</th>
                  <th className="p-3">Curso</th>
                  <th className="p-3 text-center">Jul</th>
                  <th className="p-3 text-center">Ago</th>
                  <th className="p-3 text-center">Set</th>
                  <th className="p-3 text-center">Out</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.slice(0, 6).map((std) => (
                  <tr key={std.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-white">
                      <div>{std.fullName}</div>
                      <span className="text-[10px] font-mono text-cyan-400">{std.code}</span>
                    </td>
                    <td className="p-3 text-slate-300">{courses[0]?.name || 'Técnico Oficial'}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Pago</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Pago</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Pago</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">A Vencer</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-emerald-400 font-bold">Regular</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PAGAMENTOS (AUDITORIA E CONFIRMAÇÃO) */}
      {activeTab === 'pagamentos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                Histórico de Transações de Pagamentos Recebidos
              </h3>
              <p className="text-xs text-slate-400">Total de registros: {paymentRecords.length}</p>
            </div>
          </div>

          <div className="space-y-3">
            {paymentRecords.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">{p.studentName}</strong>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                      {p.transactionCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      (p.status as string).toLowerCase() === 'aprovado' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    Rede: <span className="text-white font-bold">{p.network}</span> • Data: {p.date} às {p.time}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400 font-mono">{p.amount.toLocaleString()} MT</span>
                  </div>
                  {((p.status as string).toLowerCase() === 'submetido' || (p.status as string).toLowerCase().includes('pendente')) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          approvePayment(p.id, 'Confirmado via Tesouraria');
                          showFeedback(`Pagamento ${p.transactionCode} aprovado.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => {
                          rejectPayment(p.id, 'Comprovativo ilegível');
                          showFeedback(`Pagamento ${p.transactionCode} rejeitado.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                      >
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. M-PESA */}
      {activeTab === 'mpesa' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-rose-500" />
                Integração Direta Vodacom M-Pesa (API &amp; STK Push)
              </h3>
              <p className="text-xs text-slate-400">Recebimento instantâneo no número curto institucional.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Gateway Vodacom: ONLINE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="font-bold text-white text-sm">Disparar Solicitação STK Push ao Aluno</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Nome do Formando</label>
                  <input
                    type="text"
                    value={mpesaStudentName}
                    onChange={(e) => setMpesaStudentName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Número de Telefone M-Pesa (84 ou 85)</label>
                  <input
                    type="text"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Valor da Propina (MT)</label>
                  <input
                    type="number"
                    value={mpesaAmount}
                    onChange={(e) => setMpesaAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-semibold"
                  />
                </div>
                <button
                  onClick={handleSimulateMpesa}
                  disabled={mpesaSimulating}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                >
                  {mpesaSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Aguardando Confirmação no Telemóvel...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Notificação de Cobrança STK</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">Credenciais e Webhook da Carteira</h4>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Shortcode C2B</span>
                <span className="font-mono text-white font-bold text-sm">849921</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Webhook URL de Callback</span>
                <span className="font-mono text-cyan-300 text-[11px] truncate block">
                  https://sigar.mz/api/v1/payments/mpesa/callback
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Taxa de Conciliação Automática</span>
                <span className="text-emerald-400 font-bold">100% dos pagamentos validados com NUIT</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. E-MOLA */}
      {activeTab === 'emola' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-500" />
                Integração Direta Movitel e-Mola
              </h3>
              <p className="text-xs text-slate-400">Cobranças e conciliações automáticas via carteira e-Mola.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Gateway Movitel: ONLINE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="font-bold text-white text-sm">Disparar Cobrança e-Mola</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Nome do Formando</label>
                  <input
                    type="text"
                    value={emolaStudentName}
                    onChange={(e) => setEmolaStudentName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Número de Telefone e-Mola (86 ou 87)</label>
                  <input
                    type="text"
                    value={emolaPhone}
                    onChange={(e) => setEmolaPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Valor a Cobrar (MT)</label>
                  <input
                    type="number"
                    value={emolaAmount}
                    onChange={(e) => setEmolaAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-semibold"
                  />
                </div>
                <button
                  onClick={handleSimulateEmola}
                  disabled={emolaSimulating}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30"
                >
                  {emolaSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validando Referência e-Mola...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Solicitar Pagamento e-Mola</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">Referência de Pagamento</h4>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Entidade e-Mola</span>
                <span className="font-mono text-white font-bold text-sm">86100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Canal de Notificação</span>
                <span className="text-slate-300">Push USSD com PIN de Segurança</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. RECIBOS */}
      {activeTab === 'recibos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                Emissão &amp; Auditoria de Recibos Oficiais
              </h3>
              <p className="text-xs text-slate-400">Recibos fiscais com numeração sequencial e código QR de autenticação.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contasReceber.filter(c => c.status === 'pago').slice(0, 6).map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400">{item.receiptNumber || `REC-2026-${item.id.slice(-4)}`}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">VÁLIDO</span>
                </div>
                <div>
                  <strong className="text-white block text-sm">{item.studentName}</strong>
                  <span className="text-slate-400">{item.description || (item as any).title}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="font-mono font-bold text-white">{item.amount.toLocaleString()} MT</span>
                  <button
                    onClick={() => {
                      setSelectedReceipt(item);
                      showFeedback(`Recibo ${item.receiptNumber || item.id} pronto para impressão.`);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir / Ver</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedReceipt && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 max-w-lg mx-auto space-y-4 mt-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{activeInstitution.name}</span>
                  <h4 className="text-sm font-black text-white">RECIBO DE PAGAMENTO Nº {selectedReceipt.receiptNumber || 'REC-2026-001'}</h4>
                </div>
                <QrCode className="w-10 h-10 text-cyan-400" />
              </div>
              <div className="text-xs space-y-1 text-slate-300">
                <div>Recebemos de: <strong className="text-white">{selectedReceipt.studentName}</strong></div>
                <div>A quantia de: <strong className="text-emerald-400 font-mono text-sm">{selectedReceipt.amount.toLocaleString()} MT</strong></div>
                <div>Referente a: {selectedReceipt.title}</div>
                <div>Forma de Liquidação: {selectedReceipt.paymentMethod || 'Dinheiro'}</div>
                <div>Data: 22 de Setembro de 2026</div>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <span>Chancela Eletrônica SIGAR</span>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-3 py-1 rounded bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. CAIXA */}
      {activeTab === 'caixa' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Controle do Caixa Diário da Tesouraria
              </h3>
              <p className="text-xs text-slate-400">Abertura, registro contínuo e encerramento de turno de atendimento.</p>
            </div>
            <div className="flex items-center gap-2">
              {activeCashSession?.status === 'aberto' ? (
                <button
                  onClick={() => setShowCloseCaixaModal(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  Fechar Caixa Diário
                </button>
              ) : (
                <button
                  onClick={() => setShowOpenCaixaModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  Abrir Caixa Diário
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs font-bold">Fundo de Troco Inicial</span>
              <div className="text-xl font-mono font-black text-white">
                {(activeCashSession?.openingBalance ?? activeCashSession?.initialBalance ?? 2500).toLocaleString()} MT
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs font-bold">Entradas em Espécie Hoje</span>
              <div className="text-xl font-mono font-black text-emerald-400">
                +{((activeCashSession?.totalEntradas ?? activeCashSession?.totalCashIn) || 12350).toLocaleString()} MT
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs font-bold">Saldo Corrente em Gaveta</span>
              <div className="text-xl font-mono font-black text-cyan-300">
                {saldoEmCaixa.toLocaleString()} MT
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. SANGRIA */}
      {activeTab === 'sangria' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-400" />
                Sangria &amp; Reforço de Caixa
              </h3>
              <p className="text-xs text-slate-400">Recolha preventiva de valores em espécie para cofre de segurança ou banco.</p>
            </div>
            <button
              onClick={() => setShowSangriaModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-amber-600/20"
            >
              + Executar Nova Sangria
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-white block">Regras Institucionais de Sangria:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              <li>O limite máximo permitido em gaveta sem sangria é de 15.000 MT.</li>
              <li>Toda sangria exige motivo registrado e comprovativo de custódia assinado.</li>
              <li>Os valores retirados são debitados automaticamente do saldo ativo do caixa.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 11. FORNECEDORES */}
      {activeTab === 'fornecedores' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Cadastro de Fornecedores &amp; Prestadores de Serviços
              </h3>
              <p className="text-xs text-slate-400">Gestão de parceiros comerciais e histórico de faturamento.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white block text-sm">{s.name}</strong>
                <div className="text-slate-400">NUIT: <span className="font-mono text-slate-200">{s.nuit}</span></div>
                <div className="text-slate-400">Categoria: <span className="text-cyan-300">{s.category}</span></div>
                <div className="text-slate-400">Contato: <span className="text-slate-200">{s.phone}</span></div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Saldo Devedor:</span>
                  <span className={`font-mono font-bold ${s.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {s.balance.toLocaleString()} MT
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. DESPESAS */}
      {activeTab === 'despesas' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                Lançamento &amp; Classificação de Despesas Operacionais
              </h3>
              <p className="text-xs text-slate-400">Custos fixos e variáveis da instituição em Meticais (MT).</p>
            </div>
            <button
              onClick={() => setShowNewPagarModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/20"
            >
              + Lançar Despesa
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">Pessoal &amp; Docência</span>
              <div className="text-lg font-black text-white font-mono">148.000 MT</div>
              <span className="text-slate-500 text-[10px]">Folha salarial e honorários</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">Energia &amp; Comunicação</span>
              <div className="text-lg font-black text-white font-mono">18.500 MT</div>
              <span className="text-slate-500 text-[10px]">EDM, FIPAG e Internet</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">Material Pedagógico</span>
              <div className="text-lg font-black text-white font-mono">12.200 MT</div>
              <span className="text-slate-500 text-[10px]">Papelaria e consumíveis</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">Manutenção Predial</span>
              <div className="text-lg font-black text-white font-mono">8.400 MT</div>
              <span className="text-slate-500 text-[10px]">Reparos e infraestrutura</span>
            </div>
          </div>
        </div>
      )}

      {/* 13. RELATÓRIOS */}
      {activeTab === 'relatorios' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                Demonstração de Resultados (DRE) &amp; Balanço Gerencial
              </h3>
              <p className="text-xs text-slate-400">Relatórios consolidados para a Direção Geral e órgãos fiscais.</p>
            </div>
            <button
              onClick={() => showFeedback('Relatório DRE consolidado exportado para auditoria.')}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar DRE (PDF / Excel)</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 max-w-2xl mx-auto text-xs">
            <div className="flex justify-between items-center text-sm font-bold border-b border-slate-800 pb-2">
              <span className="text-white">Demonstrativo de Resultado do Exercício (DRE)</span>
              <span className="text-cyan-400 font-mono">Setembro / 2026</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>(+) Receita Bruta com Propinas e Matrículas</span>
                <span className="font-mono text-emerald-400 font-bold">{totalRecebido.toLocaleString()} MT</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>(-) Deduções / Bolsas Institucionais</span>
                <span className="font-mono text-rose-400 font-bold">-0 MT</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                <span>(=) Receita Operacional Líquida</span>
                <span className="font-mono text-emerald-400">{totalRecebido.toLocaleString()} MT</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2">
                <span>(-) Despesas Operacionais e Administrativas</span>
                <span className="font-mono text-rose-400 font-bold">-{totalPagoDespesas.toLocaleString()} MT</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t-2 border-slate-800">
                <span>(=) Resultado Líquido do Período</span>
                <span className="font-mono text-cyan-400">
                  {(totalRecebido - totalPagoDespesas).toLocaleString()} MT
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SANGRIA */}
      {showSangriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-white flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-400" />
                Registrar Sangria de Caixa
              </h4>
              <button onClick={() => setShowSangriaModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePerformSangria} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Valor a Retirar (MT)</label>
                <input
                  type="number"
                  value={sangriaAmount}
                  onChange={(e) => setSangriaAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Destino / Justificativa</label>
                <input
                  type="text"
                  value={sangriaReason}
                  onChange={(e) => setSangriaReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSangriaModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer shadow-lg shadow-amber-600/30"
                >
                  Confirmar Sangria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO RECEBER */}
      {showNewReceberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Lançar Novo Título a Receber
              </h4>
              <button onClick={() => setShowNewReceberModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateReceber} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Descrição do Recebimento</label>
                <input
                  type="text"
                  placeholder="Ex: Mensalidade de Outubro / 2026"
                  value={newReceberTitle}
                  onChange={(e) => setNewReceberTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Nome do Formando</label>
                <input
                  type="text"
                  value={newReceberStudent}
                  onChange={(e) => setNewReceberStudent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Valor (MT)</label>
                  <input
                    type="number"
                    value={newReceberAmount}
                    onChange={(e) => setNewReceberAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={newReceberDue}
                    onChange={(e) => setNewReceberDue(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewReceberModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  Salvar Título
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PAGAR */}
      {showNewPagarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/40 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                Lançar Nova Conta a Pagar
              </h4>
              <button onClick={() => setShowNewPagarModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreatePagar} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Descrição da Despesa</label>
                <input
                  type="text"
                  placeholder="Ex: Fatura EDM Instalações Central"
                  value={newPagarTitle}
                  onChange={(e) => setNewPagarTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Fornecedor / Beneficiário</label>
                <input
                  type="text"
                  value={newPagarSupplier}
                  onChange={(e) => setNewPagarSupplier(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Valor (MT)</label>
                  <input
                    type="number"
                    value={newPagarAmount}
                    onChange={(e) => setNewPagarAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Data Vencimento</label>
                  <input
                    type="date"
                    value={newPagarDue}
                    onChange={(e) => setNewPagarDue(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPagarModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  Registrar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ABRIR CAIXA */}
      {showOpenCaixaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Abertura do Caixa Diário
              </h4>
              <button onClick={() => setShowOpenCaixaModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleOpenCaixa} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Fundo de Troco Inicial (MT)</label>
                <input
                  type="number"
                  value={initialCashAmount}
                  onChange={(e) => setInitialCashAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400">
                O operador responsável assina digitalmente a custódia do montante de abertura da sessão.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenCaixaModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  Abrir Caixa Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FECHAR CAIXA */}
      {showCloseCaixaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/40 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                Encerramento de Caixa
              </h4>
              <button onClick={() => setShowCloseCaixaModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCloseCaixa} className="space-y-3 text-xs">
              <p className="text-slate-300">
                Saldo final apurado em gaveta: <strong className="text-white font-mono">{saldoEmCaixa.toLocaleString()} MT</strong>.
              </p>
              <p className="text-[11px] text-slate-400">
                Ao fechar, o balanço é congelado para auditoria e o balancete de fechamento é enviado para a Direção.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseCaixaModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  Confirmar Encerramento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
