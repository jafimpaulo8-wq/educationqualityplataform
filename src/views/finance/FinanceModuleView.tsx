import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PermissionGate } from '../../components/PermissionGate';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Calendar, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle, 
  CreditCard, 
  FileText, 
  Clock, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Building, 
  Receipt,
  FileSpreadsheet,
  Plus,
  X,
  Share2,
  Send,
  Smartphone,
  Eye,
  Trash2,
  Briefcase,
  Users,
  BookOpen,
  ShieldCheck,
  Award,
  GraduationCap,
  Shirt,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { 
  ContaReceber, 
  ContaPagar, 
  ReceivableCategory, 
  RECEIVABLE_CATEGORY_CONFIG,
  PayableTargetType,
  PayableExpenseCategory 
} from '../../types/finance';

const PAYABLE_EXPENSE_CATEGORIES: PayableExpenseCategory[] = [
  'Pessoal e Salários',
  'Infraestrutura & Instalações',
  'Material Didático & Gráfica',
  'Serviços Terceirizados',
  'Tecnologia & Softwares',
  'Manutenção & Equipamentos',
  'Tributária & Taxas Legais',
  'Outras Despesas Operacionais'
];

export const FinanceModuleView: React.FC = () => {
  const { 
    contasReceber, 
    contasPagar, 
    addContaReceber, 
    updateContaReceber, 
    deleteContaReceber, 
    receiveContaPayment,
    addContaPagar, 
    updateContaPagar, 
    deleteContaPagar, 
    payContaPagar,
    students,
    teachers,
    classes,
    activeInstitution,
    activeCashSession,
    addNotification,
    openWhatsAppMessage,
    navigate: setCurrentRoute,
    paymentRecords
  } = useApp();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'receber' | 'pagar' | 'dre_resumo'>('receber');

  // CONTAS A RECEBER: Filter states
  const [recCategoryFilter, setRecCategoryFilter] = useState<string>('todas');
  const [recStatusFilter, setRecStatusFilter] = useState<'todos' | 'pago' | 'pendente' | 'atrasado'>('todos');
  const [recSearchQuery, setRecSearchQuery] = useState<string>('');

  // CONTAS A PAGAR: Filter states
  const [payTargetFilter, setPayTargetFilter] = useState<string>('todos');
  const [payCategoryFilter, setPayCategoryFilter] = useState<string>('todas');
  const [payStatusFilter, setPayStatusFilter] = useState<'todos' | 'pago' | 'pendente' | 'atrasado'>('todos');
  const [paySearchQuery, setPaySearchQuery] = useState<string>('');

  // Modals state
  const [isNewReceivableOpen, setIsNewReceivableOpen] = useState(false);
  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<ContaReceber | null>(null);

  const [isNewPayableOpen, setIsNewPayableOpen] = useState(false);
  const [isPayAccountOpen, setIsPayAccountOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<ContaPagar | null>(null);

  const [receiptToPrint, setReceiptToPrint] = useState<ContaReceber | null>(null);
  const [receiptPrintMode, setReceiptPrintMode] = useState<'a4' | 'termica'>('a4');

  const [voucherToPrint, setVoucherToPrint] = useState<ContaPagar | null>(null);

  // Form State: New Receivable
  const [newRecCategory, setNewRecCategory] = useState<ReceivableCategory>('mensalidade');
  const [newRecStudentId, setNewRecStudentId] = useState<string>('');
  const [newRecExternalDebtor, setNewRecExternalDebtor] = useState<string>('');
  const [newRecExternalPhone, setNewRecExternalPhone] = useState<string>('');
  const [newRecDescription, setNewRecDescription] = useState<string>('');
  const [newRecAmount, setNewRecAmount] = useState<number>(4500);
  const [newRecDueDate, setNewRecDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [newRecNotes, setNewRecNotes] = useState<string>('');

  // Form State: Liquidation / Receive Payment
  const [liquidateAmount, setLiquidateAmount] = useState<number>(0);
  const [liquidateMethod, setLiquidateMethod] = useState<'Dinheiro' | 'M-Pesa' | 'e-Mola' | 'Ponto24' | 'Transferência Bancária' | 'POS'>('M-Pesa');
  const [liquidateReceiptNumber, setLiquidateReceiptNumber] = useState<string>('');
  const [liquidateRegisterInCash, setLiquidateRegisterInCash] = useState<boolean>(true);
  const [liquidateNotes, setLiquidateNotes] = useState<string>('');

  // Form State: New Payable
  const [newPayTargetType, setNewPayTargetType] = useState<PayableTargetType>('fornecedor');
  const [newPayFornecedor, setNewPayFornecedor] = useState<string>('');
  const [newPayFuncionario, setNewPayFuncionario] = useState<string>('');
  const [newPayServico, setNewPayServico] = useState<string>('');
  const [newPayDespesa, setNewPayDespesa] = useState<string>('');
  const [newPayCategoria, setNewPayCategoria] = useState<string>('Infraestrutura & Instalações');
  const [newPayData, setNewPayData] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [newPayValor, setNewPayValor] = useState<number>(5000);
  const [newPayInvoiceNumber, setNewPayInvoiceNumber] = useState<string>('');
  const [newPayNotes, setNewPayNotes] = useState<string>('');

  // Form State: Pay Payable Account
  const [payAccMethod, setPayAccMethod] = useState<'Transferência Bancária' | 'M-Pesa' | 'e-Mola' | 'Dinheiro (Caixa)' | 'Cheque' | 'POS'>('Transferência Bancária');
  const [payAccDeductFromCash, setPayAccDeductFromCash] = useState<boolean>(false);
  const [payAccInvoiceNumber, setPayAccInvoiceNumber] = useState<string>('');
  const [payAccNotes, setPayAccNotes] = useState<string>('');

  // Filtered Contas a Receber
  const filteredContasReceber = useMemo(() => {
    return contasReceber.filter(item => {
      const matchCat = recCategoryFilter === 'todas' || item.category === recCategoryFilter;
      const matchStatus = recStatusFilter === 'todos' || item.status === recStatusFilter;
      const q = recSearchQuery.toLowerCase();
      const matchSearch = !recSearchQuery || 
        item.description.toLowerCase().includes(q) ||
        (item.studentName && item.studentName.toLowerCase().includes(q)) ||
        (item.studentCode && item.studentCode.toLowerCase().includes(q)) ||
        (item.debtorName && item.debtorName.toLowerCase().includes(q)) ||
        (item.receiptNumber && item.receiptNumber.toLowerCase().includes(q));
      return matchCat && matchStatus && matchSearch;
    });
  }, [contasReceber, recCategoryFilter, recStatusFilter, recSearchQuery]);

  // Filtered Contas a Pagar
  const filteredContasPagar = useMemo(() => {
    return contasPagar.filter(item => {
      const matchTarget = payTargetFilter === 'todos' || item.targetType === payTargetFilter;
      const matchCat = payCategoryFilter === 'todas' || item.categoria === payCategoryFilter;
      const matchStatus = payStatusFilter === 'todos' || item.status === payStatusFilter;
      const q = paySearchQuery.toLowerCase();
      const matchSearch = !paySearchQuery ||
        item.despesa.toLowerCase().includes(q) ||
        (item.fornecedor && item.fornecedor.toLowerCase().includes(q)) ||
        (item.funcionario && item.funcionario.toLowerCase().includes(q)) ||
        (item.servico && item.servico.toLowerCase().includes(q)) ||
        (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(q));
      return matchTarget && matchCat && matchStatus && matchSearch;
    });
  }, [contasPagar, payTargetFilter, payCategoryFilter, payStatusFilter, paySearchQuery]);

  // KPIs / DRE Summary
  const metrics = useMemo(() => {
    const totalReceberPendente = contasReceber
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + (c.totalAmount - c.paidAmount), 0);

    const totalReceberAtrasado = contasReceber
      .filter(c => c.status === 'atrasado')
      .reduce((sum, c) => sum + (c.totalAmount - c.paidAmount), 0);

    const totalRecebido = contasReceber
      .filter(c => c.status === 'pago')
      .reduce((sum, c) => sum + c.paidAmount, 0);

    const totalPagarPendente = contasPagar
      .filter(c => c.status === 'pendente')
      .reduce((sum, c) => sum + c.valor, 0);

    const totalPagarAtrasado = contasPagar
      .filter(c => c.status === 'atrasado')
      .reduce((sum, c) => sum + c.valor, 0);

    const totalPago = contasPagar
      .filter(c => c.status === 'pago')
      .reduce((sum, c) => sum + c.valor, 0);

    const saldoOperacionalLiquido = totalRecebido - totalPago;
    const saldoProjetadoFuturo = (totalRecebido + totalReceberPendente) - (totalPago + totalPagarPendente);

    return {
      totalReceberPendente,
      totalReceberAtrasado,
      totalReceberGeral: totalReceberPendente + totalReceberAtrasado,
      totalRecebido,
      totalPagarPendente,
      totalPagarAtrasado,
      totalPagarGeral: totalPagarPendente + totalPagarAtrasado,
      totalPago,
      saldoOperacionalLiquido,
      saldoProjetadoFuturo
    };
  }, [contasReceber, contasPagar]);

  // Handle open receive payment modal
  const handleOpenReceiveModal = (conta: ContaReceber) => {
    setSelectedReceivable(conta);
    const pendingToPay = Math.max(0, conta.totalAmount - (conta.paidAmount || 0));
    setLiquidateAmount(pendingToPay);
    setLiquidateReceiptNumber(`REC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`);
    setLiquidateMethod((conta.paymentMethod as any) || 'M-Pesa');
    setLiquidateRegisterInCash(true);
    setLiquidateNotes('');
    setIsReceivePaymentOpen(true);
  };

  // Submit Receive Payment
  const handleConfirmReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;

    receiveContaPayment(selectedReceivable.id, {
      paidAmount: liquidateAmount,
      paymentMethod: liquidateMethod,
      receiptNumber: liquidateReceiptNumber,
      registerInCash: liquidateRegisterInCash,
      notes: liquidateNotes
    });

    setIsReceivePaymentOpen(false);

    // Ask to print or share
    const updatedConta = {
      ...selectedReceivable,
      paidAmount: liquidateAmount,
      status: 'pago' as const,
      paymentMethod: liquidateMethod,
      receiptNumber: liquidateReceiptNumber,
      paymentDate: new Date().toISOString().split('T')[0]
    };
    setReceiptToPrint(updatedConta);
  };

  // Handle open pay account modal
  const handleOpenPayModal = (conta: ContaPagar) => {
    setSelectedPayable(conta);
    setPayAccMethod((conta.paymentMethod as any) || 'Transferência Bancária');
    setPayAccDeductFromCash(conta.deductFromCash || false);
    setPayAccInvoiceNumber(conta.invoiceNumber || '');
    setPayAccNotes('');
    setIsPayAccountOpen(true);
  };

  // Submit Pay Account
  const handleConfirmPayAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayable) return;

    payContaPagar(selectedPayable.id, {
      paymentMethod: payAccMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      invoiceNumber: payAccInvoiceNumber,
      notes: payAccNotes,
      deductFromCash: payAccDeductFromCash
    });

    setIsPayAccountOpen(false);

    const updatedPayable = {
      ...selectedPayable,
      status: 'pago' as const,
      paymentMethod: payAccMethod,
      invoiceNumber: payAccInvoiceNumber,
      paymentDate: new Date().toISOString().split('T')[0]
    };
    setVoucherToPrint(updatedPayable);
  };

  // Submit New Receivable
  const handleCreateReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === newRecStudentId);
    const catConfig = RECEIVABLE_CATEGORY_CONFIG[newRecCategory];

    const description = newRecDescription.trim() || 
      `${catConfig.label} - ${student ? student.fullName : newRecExternalDebtor}`;

    addContaReceber({
      institutionId: activeInstitution.id,
      category: newRecCategory,
      description,
      studentId: student ? student.id : undefined,
      studentName: student ? student.fullName : undefined,
      studentCode: student ? student.code : undefined,
      classGroupId: student ? student.classGroupId : undefined,
      classGroupName: student ? student.classGroupName : undefined,
      courseName: student ? student.courseName : undefined,
      debtorName: !student ? newRecExternalDebtor : undefined,
      debtorPhone: !student ? newRecExternalPhone : undefined,
      amount: newRecAmount,
      fine: 0,
      interest: 0,
      discount: 0,
      totalAmount: newRecAmount,
      paidAmount: 0,
      dueDate: newRecDueDate,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'pendente',
      notes: newRecNotes
    });

    setIsNewReceivableOpen(false);
    // Reset
    setNewRecStudentId('');
    setNewRecExternalDebtor('');
    setNewRecExternalPhone('');
    setNewRecDescription('');
    setNewRecNotes('');
  };

  // Submit New Payable
  const handleCreatePayable = (e: React.FormEvent) => {
    e.preventDefault();

    const desc = newPayDespesa.trim() || 
      `Despesa de ${newPayCategoria} (${newPayFornecedor || newPayFuncionario || newPayServico})`;

    addContaPagar({
      institutionId: activeInstitution.id,
      targetType: newPayTargetType,
      fornecedor: newPayTargetType === 'fornecedor' ? newPayFornecedor : (newPayFornecedor || undefined),
      funcionario: newPayTargetType === 'funcionario' ? newPayFuncionario : undefined,
      servico: newPayTargetType === 'servico' ? newPayServico : undefined,
      despesa: desc,
      categoria: newPayCategoria,
      data: newPayData,
      valor: newPayValor,
      invoiceNumber: newPayInvoiceNumber || undefined,
      status: 'pendente',
      notes: newPayNotes
    });

    setIsNewPayableOpen(false);
    setNewPayFornecedor('');
    setNewPayFuncionario('');
    setNewPayServico('');
    setNewPayDespesa('');
    setNewPayInvoiceNumber('');
    setNewPayNotes('');
  };

  // WhatsApp notification for receipt
  const handleShareReceiptWhatsApp = (conta: ContaReceber) => {
    const student = students.find(s => s.id === conta.studentId);
    const phone = conta.debtorPhone || student?.phone || student?.guardianPhone;
    if (!phone) {
      addNotification({
        title: 'Contacto não Encontrado',
        message: 'O formando não possui número de telefone cadastrado para envio de WhatsApp.',
        type: 'system'
      });
      return;
    }

    const message = 
      `*COMPROVATIVO DE PAGAMENTO - ${activeInstitution.name}*\n\n` +
      `Prezado(a) *${conta.studentName || conta.debtorName}*,\n` +
      `Confirmamos com sucesso a liquidação de:\n` +
      `📄 *Documento / Taxa:* ${conta.description}\n` +
      `💰 *Valor Liquidado:* ${conta.paidAmount.toLocaleString('pt-MZ')} MTn\n` +
      `💳 *Forma de Pagamento:* ${conta.paymentMethod}\n` +
      `🧾 *N.º de Recibo:* ${conta.receiptNumber}\n` +
      `📅 *Data de Liquidação:* ${conta.paymentDate || new Date().toLocaleDateString('pt-MZ')}\n\n` +
      `Este documento possui autenticação digital homologada via SIVEC.\n` +
      `_Tesouraria Central - Moztechwave Core_`;

    openWhatsAppMessage(phone, message);
  };

  return (
    <PermissionGate permission="pagamentos.view">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">29. Módulo Financeiro</h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    SIVEC Gestão Contábil
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  Contas a Receber (11 categorias de taxas & propinas) e Contas a Pagar (fornecedores, funcionários & despesas).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => setCurrentRoute('relatorios_financeiros')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>34. Relatórios Financeiros</span>
            </button>

            <button
              onClick={() => setCurrentRoute('pagamentos')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>30. Pagamentos M-Pesa &amp; e-Mola</span>
              {paymentRecords.filter(p => p.status === 'PENDENTE DE CONFIRMAÇÃO').length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] animate-pulse">
                  {paymentRecords.filter(p => p.status === 'PENDENTE DE CONFIRMAÇÃO').length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (activeTab === 'receber') setIsNewReceivableOpen(true);
                else if (activeTab === 'pagar') setIsNewPayableOpen(true);
                else setIsNewReceivableOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'pagar' ? '+ Nova Conta a Pagar' : '+ Novo Lançamento a Receber'}
            </button>
          </div>
        </div>

        {/* Global Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Recebido */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Recebido (Mês)</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {metrics.totalRecebido.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-400">MTn</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {contasReceber.filter(c => c.status === 'pago').length} cobranças liquidadas
              </p>
            </div>
          </div>

          {/* Total a Receber Pendente / Atrasado */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">A Receber em Aberto</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {metrics.totalReceberGeral.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-400">MTn</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 font-medium">{metrics.totalReceberAtrasado.toLocaleString('pt-MZ')} MTn</span> em atraso
              </p>
            </div>
          </div>

          {/* Total Pago */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pago (Despesas)</span>
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-rose-400 font-mono">
                {metrics.totalPago.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-400">MTn</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {contasPagar.filter(c => c.status === 'pago').length} despesas quitadas
              </p>
            </div>
          </div>

          {/* Saldo Líquido Operacional */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Líquido Operacional</span>
              <div className={`p-2 rounded-lg ${metrics.saldoOperacionalLiquido >= 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-red-500/10 text-red-400'}`}>
                {metrics.saldoOperacionalLiquido >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-2xl font-bold font-mono ${metrics.saldoOperacionalLiquido >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {metrics.saldoOperacionalLiquido.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-400">MTn</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span>Caixa Aberto Atual:</span>
                <span className="text-white font-medium font-mono">{activeCashSession?.currentBalance?.toLocaleString('pt-MZ') || '0'} MTn</span>
              </p>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 space-x-2">
          <button
            onClick={() => setActiveTab('receber')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'receber'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Contas a Receber
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
              {contasReceber.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pagar')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pagar'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Contas a Pagar
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
              {contasPagar.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dre_resumo')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'dre_resumo'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Demonstrativo & Fluxo de Caixa
          </button>
        </div>

        {/* TAB 1: CONTAS A RECEBER */}
        {activeTab === 'receber' && (
          <div className="space-y-6">
            
            {/* 11 Categories Quick Filter Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Categorias de Recebimento (Itens Solicitados)</span>
                <span>{filteredContasReceber.length} registros exibidos</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  onClick={() => setRecCategoryFilter('todas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    recCategoryFilter === 'todas'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Todas ({contasReceber.length})
                </button>

                {(Object.keys(RECEIVABLE_CATEGORY_CONFIG) as ReceivableCategory[]).map(catKey => {
                  const cfg = RECEIVABLE_CATEGORY_CONFIG[catKey];
                  const count = contasReceber.filter(c => c.category === catKey).length;
                  const isSelected = recCategoryFilter === catKey;

                  return (
                    <button
                      key={catKey}
                      onClick={() => setRecCategoryFilter(catKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-semibold shadow'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{cfg.shortLabel}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${isSelected ? 'bg-emerald-700/60 text-white' : 'bg-slate-900 text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search and Secondary Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por formando, código, devedor, descrição ou recibo..."
                  value={recSearchQuery}
                  onChange={(e) => setRecSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={recStatusFilter}
                    onChange={(e: any) => setRecStatusFilter(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="todos" className="bg-slate-900">Estado: Todos</option>
                    <option value="pendente" className="bg-slate-900">Estado: Pendentes</option>
                    <option value="pago" className="bg-slate-900">Estado: Pagos</option>
                    <option value="atrasado" className="bg-slate-900">Estado: Atrasados</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsNewReceivableOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Novo Recebimento
                </button>
              </div>
            </div>

            {/* Table of Contas a Receber */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Categoria & Descrição</th>
                      <th className="py-3 px-4">Formando / Devedor</th>
                      <th className="py-3 px-4">Vencimento</th>
                      <th className="py-3 px-4 text-right">Valor Total</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-center">Recibo</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredContasReceber.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          Nenhum lançamento a receber encontrado com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredContasReceber.map((conta) => {
                        const catCfg = RECEIVABLE_CATEGORY_CONFIG[conta.category] || RECEIVABLE_CATEGORY_CONFIG.outros;
                        const isPaid = conta.status === 'pago';
                        const isLate = conta.status === 'atrasado';

                        return (
                          <tr key={conta.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-start gap-2.5">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${catCfg.badgeBg} ${catCfg.badgeText} border border-current/20 mt-0.5`}>
                                  {catCfg.shortLabel}
                                </span>
                                <div>
                                  <div className="text-white font-medium">{conta.description}</div>
                                  {conta.notes && (
                                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{conta.notes}</div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {conta.studentName ? (
                                <div>
                                  <div className="text-white font-medium">{conta.studentName}</div>
                                  <div className="text-xs text-slate-400 font-mono">
                                    {conta.studentCode} {conta.classGroupName ? `• ${conta.classGroupName}` : ''}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-white font-medium">{conta.debtorName || 'Avulso'}</div>
                                  {conta.debtorPhone && (
                                    <div className="text-xs text-slate-400 font-mono">{conta.debtorPhone}</div>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="text-slate-300 font-mono text-xs">{conta.dueDate}</div>
                              {isLate && (
                                <div className="text-[11px] text-rose-400 font-semibold flex items-center gap-1 mt-0.5">
                                  <AlertCircle className="w-3 h-3" />
                                  Vencido
                                </div>
                              )}
                              {isPaid && conta.paymentDate && (
                                <div className="text-[11px] text-emerald-400 mt-0.5">
                                  Pago em {conta.paymentDate}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="font-mono font-bold text-white">
                                {conta.totalAmount.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-400">MTn</span>
                              </div>
                              {conta.fine > 0 && (
                                <div className="text-[10px] text-rose-400 font-mono">
                                  +{conta.fine} MTn multa
                                </div>
                              )}
                              {isPaid && (
                                <div className="text-[10px] text-emerald-400 font-mono">
                                  Liquidado via {conta.paymentMethod}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isPaid 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : isLate
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {isPaid ? <CheckCircle className="w-3 h-3" /> : isLate ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {isPaid ? 'Pago' : isLate ? 'Atrasado' : 'Pendente'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              {conta.receiptNumber ? (
                                <button
                                  onClick={() => setReceiptToPrint(conta)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors"
                                  title="Ver e Imprimir Recibo"
                                >
                                  <Receipt className="w-3 h-3 text-emerald-400" />
                                  {conta.receiptNumber}
                                </button>
                              ) : (
                                <span className="text-xs text-slate-500 font-mono">-</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isPaid ? (
                                  <button
                                    onClick={() => handleOpenReceiveModal(conta)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Receber
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setReceiptToPrint(conta)}
                                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                                      title="Imprimir Recibo"
                                    >
                                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                                    </button>
                                    <button
                                      onClick={() => handleShareReceiptWhatsApp(conta)}
                                      className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/20 rounded transition-colors"
                                      title="Enviar Recibo por WhatsApp"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    if (confirm(`Remover cobrança "${conta.description}"?`)) {
                                      deleteContaReceber(conta.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Excluir Lançamento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CONTAS A PAGAR */}
        {activeTab === 'pagar' && (
          <div className="space-y-6">
            
            {/* Target Filter Tabs (Fornecedor, Funcionário, Serviço, Despesa) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setPayTargetFilter('todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    payTargetFilter === 'todos'
                      ? 'bg-rose-600 text-white font-semibold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Todos ({contasPagar.length})
                </button>
                <button
                  onClick={() => setPayTargetFilter('fornecedor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    payTargetFilter === 'fornecedor'
                      ? 'bg-rose-600 text-white font-semibold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  Fornecedores ({contasPagar.filter(c => c.targetType === 'fornecedor').length})
                </button>
                <button
                  onClick={() => setPayTargetFilter('funcionario')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    payTargetFilter === 'funcionario'
                      ? 'bg-rose-600 text-white font-semibold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Funcionários & Docentes ({contasPagar.filter(c => c.targetType === 'funcionario').length})
                </button>
                <button
                  onClick={() => setPayTargetFilter('servico')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    payTargetFilter === 'servico'
                      ? 'bg-rose-600 text-white font-semibold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Serviços Terceirizados ({contasPagar.filter(c => c.targetType === 'servico').length})
                </button>
                <button
                  onClick={() => setPayTargetFilter('despesa')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    payTargetFilter === 'despesa'
                      ? 'bg-rose-600 text-white font-semibold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Despesas Gerais ({contasPagar.filter(c => c.targetType === 'despesa').length})
                </button>
              </div>

              <button
                onClick={() => setIsNewPayableOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                + Nova Conta a Pagar
              </button>
            </div>

            {/* Search and Secondary Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por despesa, fornecedor, funcionário, serviço ou n.º de fatura..."
                  value={paySearchQuery}
                  onChange={(e) => setPaySearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={payCategoryFilter}
                    onChange={(e) => setPayCategoryFilter(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="todas" className="bg-slate-900">Categoria: Todas</option>
                    {PAYABLE_EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
                  <select
                    value={payStatusFilter}
                    onChange={(e: any) => setPayStatusFilter(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="todos" className="bg-slate-900">Estado: Todos</option>
                    <option value="pendente" className="bg-slate-900">Estado: Pendentes</option>
                    <option value="pago" className="bg-slate-900">Estado: Pagos</option>
                    <option value="atrasado" className="bg-slate-900">Estado: Atrasados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table of Contas a Pagar */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Despesa & Credor</th>
                      <th className="py-3 px-4">Categoria Contábil</th>
                      <th className="py-3 px-4">Data Vencimento</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-center">Fatura / Comprovativo</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredContasPagar.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          Nenhuma conta a pagar encontrada com os critérios informados.
                        </td>
                      </tr>
                    ) : (
                      filteredContasPagar.map((conta) => {
                        const isPaid = conta.status === 'pago';
                        const isLate = conta.status === 'atrasado';

                        return (
                          <tr key={conta.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="text-white font-medium">{conta.despesa}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                {conta.targetType === 'fornecedor' && <Building className="w-3.5 h-3.5 text-amber-400" />}
                                {conta.targetType === 'funcionario' && <Users className="w-3.5 h-3.5 text-blue-400" />}
                                {conta.targetType === 'servico' && <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />}
                                {conta.targetType === 'despesa' && <CreditCard className="w-3.5 h-3.5 text-purple-400" />}
                                <span className="font-semibold text-slate-300">
                                  {conta.fornecedor || conta.funcionario || conta.servico || 'Despesa Direta'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                {conta.categoria}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="text-slate-300 font-mono text-xs">{conta.data}</div>
                              {isPaid && conta.paymentDate && (
                                <div className="text-[11px] text-emerald-400 mt-0.5">
                                  Liquidado em {conta.paymentDate}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="font-mono font-bold text-rose-400">
                                {conta.valor.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-400">MTn</span>
                              </div>
                              {isPaid && conta.paymentMethod && (
                                <div className="text-[10px] text-slate-400">
                                  via {conta.paymentMethod}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isPaid 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : isLate
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {isPaid ? <CheckCircle className="w-3 h-3" /> : isLate ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {isPaid ? 'Pago' : isLate ? 'Atrasado' : 'Pendente'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              {conta.invoiceNumber ? (
                                <span className="text-xs font-mono text-slate-300 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded">
                                  {conta.invoiceNumber}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">-</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isPaid ? (
                                  <button
                                    onClick={() => handleOpenPayModal(conta)}
                                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Dar Baixa
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setVoucherToPrint(conta)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                                    title="Ver Comprovativo de Liquidação"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    if (confirm(`Excluir conta a pagar "${conta.despesa}"?`)) {
                                      deleteContaPagar(conta.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Remover Despesa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: DEMONSTRATIVO & FLUXO DE CAIXA */}
        {activeTab === 'dre_resumo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Receitas por Categoria */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                  Composição de Receitas por Categoria
                </h3>
                <div className="space-y-3">
                  {(Object.keys(RECEIVABLE_CATEGORY_CONFIG) as ReceivableCategory[]).map(catKey => {
                    const cfg = RECEIVABLE_CATEGORY_CONFIG[catKey];
                    const items = contasReceber.filter(c => c.category === catKey);
                    const totalCat = items.reduce((sum, c) => sum + (c.status === 'pago' ? c.paidAmount : c.totalAmount), 0);
                    const totalReceivedCat = items.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.paidAmount, 0);
                    const pct = metrics.totalRecebido > 0 ? Math.round((totalReceivedCat / metrics.totalRecebido) * 100) : 0;

                    return (
                      <div key={catKey} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-white flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${cfg.badgeText.replace('text-', 'bg-')}`}></span>
                            {cfg.label}
                          </span>
                          <span className="font-mono text-slate-300 font-bold">
                            {totalReceivedCat.toLocaleString('pt-MZ')} MTn
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cfg.badgeText.replace('text-', 'bg-')}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                          <span>{items.length} cobranças registradas</span>
                          <span>{pct}% do faturamento realizado</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Despesas por Categoria */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-rose-400" />
                  Composição de Despesas por Centro de Custo
                </h3>
                <div className="space-y-3">
                  {PAYABLE_EXPENSE_CATEGORIES.map(cat => {
                    const items = contasPagar.filter(c => c.categoria === cat);
                    const totalCat = items.reduce((sum, c) => sum + c.valor, 0);
                    const totalPaidCat = items.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.valor, 0);
                    const pct = metrics.totalPago > 0 ? Math.round((totalPaidCat / metrics.totalPago) * 100) : 0;

                    return (
                      <div key={cat} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-white">{cat}</span>
                          <span className="font-mono text-rose-400 font-bold">
                            {totalPaidCat.toLocaleString('pt-MZ')} MTn
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                          <span>Total empenhado: {totalCat.toLocaleString('pt-MZ')} MTn</span>
                          <span>{pct}% do total pago</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL 1: NOVO LANÇAMENTO A RECEBER (11 CATEGORIAS) */}
        {isNewReceivableOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Novo Lançamento a Receber</h2>
                    <p className="text-xs text-slate-400">Escolha uma das 11 categorias regulamentares de receita.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewReceivableOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateReceivable} className="mt-5 space-y-4">
                
                {/* 11 Categorias Grid */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Categoria da Taxa / Receita *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-slate-950">
                    {(Object.keys(RECEIVABLE_CATEGORY_CONFIG) as ReceivableCategory[]).map(catKey => {
                      const cfg = RECEIVABLE_CATEGORY_CONFIG[catKey];
                      const isSelected = newRecCategory === catKey;

                      return (
                        <button
                          type="button"
                          key={catKey}
                          onClick={() => {
                            setNewRecCategory(catKey);
                            setNewRecAmount(cfg.defaultAmount || 1000);
                          }}
                          className={`p-2.5 text-left rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-emerald-600/10 border-emerald-500 text-white font-semibold shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs">{cfg.label}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Pad: {cfg.defaultAmount} MTn
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Formando ou Devedor Externo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Vincular a Formando Cadastrado (Opcional)
                  </label>
                  <select
                    value={newRecStudentId}
                    onChange={(e) => {
                      setNewRecStudentId(e.target.value);
                      if (e.target.value) {
                        const std = students.find(s => s.id === e.target.value);
                        if (std) {
                          setNewRecDescription(`${RECEIVABLE_CATEGORY_CONFIG[newRecCategory].label} - ${std.fullName}`);
                        }
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="">-- Nenhum / Devedor Externo ou Avulso --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.fullName} ({s.classGroupName || 'Sem turma'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Se não for aluno cadastrado: Devedor Externo */}
                {!newRecStudentId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nome do Devedor / Empresa *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Carlos Machel ou Empresa XYZ"
                        value={newRecExternalDebtor}
                        onChange={(e) => setNewRecExternalDebtor(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="+258 84 000 0000"
                        value={newRecExternalPhone}
                        onChange={(e) => setNewRecExternalPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Descrição Personalizada */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Descrição do Lançamento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Propina Mensal de Outubro / Kit de Uniforme Completo"
                    value={newRecDescription}
                    onChange={(e) => setNewRecDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Valor & Vencimento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Valor a Cobrar (MTn) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newRecAmount}
                      onChange={(e) => setNewRecAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Data de Vencimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={newRecDueDate}
                      onChange={(e) => setNewRecDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Observações Adicionais
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalhes sobre autorização, desconto prévio ou condições de pagamento..."
                    value={newRecNotes}
                    onChange={(e) => setNewRecNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewReceivableOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
                  >
                    Confirmar Lançamento
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: RECEBER / LIQUIDAR COBRANÇA */}
        {isReceivePaymentOpen && selectedReceivable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Recebimento de Pagamento</h2>
                    <p className="text-xs text-slate-400">Emissão de recibo e conciliação de caixa.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReceivePaymentOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Descrição:</span>
                  <span className="text-white font-medium">{selectedReceivable.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiário / Devedor:</span>
                  <span className="text-white font-medium">{selectedReceivable.studentName || selectedReceivable.debtorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valor Original:</span>
                  <span className="text-white font-mono">{selectedReceivable.totalAmount.toLocaleString('pt-MZ')} MTn</span>
                </div>
              </div>

              <form onSubmit={handleConfirmReceivePayment} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Valor a Liquidar (MTn) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={liquidateAmount}
                    onChange={(e) => setLiquidateAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Forma de Pagamento *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Dinheiro', 'M-Pesa', 'e-Mola', 'POS', 'Ponto24', 'Transferência Bancária'] as const).map(method => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setLiquidateMethod(method)}
                        className={`p-2 rounded-lg border text-xs text-center transition-all ${
                          liquidateMethod === method
                            ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 font-semibold shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">N.º do Recibo Oficial *</label>
                    <input
                      type="text"
                      required
                      value={liquidateReceiptNumber}
                      onChange={(e) => setLiquidateReceiptNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={liquidateRegisterInCash}
                        onChange={(e) => setLiquidateRegisterInCash(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                      />
                      <span>Entrada no Caixa Escolar</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Nota de Pagamento (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Pago no balcão presencial com comprovativo impresso"
                    value={liquidateNotes}
                    onChange={(e) => setLiquidateNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsReceivePaymentOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmar e Emitir Recibo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: NOVA CONTA A PAGAR (7 DIMENSÕES SOLICITADAS) */}
        {isNewPayableOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Nova Conta a Pagar</h2>
                    <p className="text-xs text-slate-400">
                      Registo obrigatório: fornecedor, funcionário, serviço, despesa, categoria, data e valor.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewPayableOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePayable} className="mt-5 space-y-4">
                
                {/* Tipo de Destinatário */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Tipo de Destinatário / Origem *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'fornecedor', label: 'Fornecedor', icon: Building },
                      { id: 'funcionario', label: 'Funcionário', icon: Users },
                      { id: 'servico', label: 'Serviço', icon: ShieldCheck },
                      { id: 'despesa', label: 'Despesa Geral', icon: CreditCard }
                    ].map(tab => (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => setNewPayTargetType(tab.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                          newPayTargetType === tab.id
                            ? 'bg-rose-600/10 border-rose-500 text-rose-400 font-semibold shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos condicionais baseados na especificação do utilizador: */}
                {newPayTargetType === 'fornecedor' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Fornecedor (Razão Social / NUIT) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Papelaria Minerva Lda, Vodacom Moçambique, Gráfica Central"
                      value={newPayFornecedor}
                      onChange={(e) => setNewPayFornecedor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                {newPayTargetType === 'funcionario' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Funcionário / Formador Beneficiário *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dr. Abdul Karim Rachid, Eng.ª Marta Bila"
                      value={newPayFuncionario}
                      onChange={(e) => setNewPayFuncionario(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                {newPayTargetType === 'servico' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Serviço Prestado *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Vigilância Armada, Limpeza & Higiene"
                        value={newPayServico}
                        onChange={(e) => setNewPayServico(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Empresa Prestadora
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: G4S Moçambique, CleanCorp Lda"
                        value={newPayFornecedor}
                        onChange={(e) => setNewPayFornecedor(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                )}

                {/* Despesa (Título / Descrição detalhada) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Despesa (Título / Descrição) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fornecimento de 20 Resmas de Papel A4 e Toners"
                    value={newPayDespesa}
                    onChange={(e) => setNewPayDespesa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Categoria Contábil */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Categoria da Despesa *
                  </label>
                  <select
                    value={newPayCategoria}
                    onChange={(e) => setNewPayCategoria(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    {PAYABLE_EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Data e Valor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Data de Vencimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={newPayData}
                      onChange={(e) => setNewPayData(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Valor (MTn) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newPayValor}
                      onChange={(e) => setNewPayValor(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* N.º Fatura e Notas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      N.º Fatura / Recibo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: FT-MIN-2026-441"
                      value={newPayInvoiceNumber}
                      onChange={(e) => setNewPayInvoiceNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Notas / Detalhes Bancários
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Conta BIM ou Pessoal"
                      value={newPayNotes}
                      onChange={(e) => setNewPayNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewPayableOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
                  >
                    Registar Despesa
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: DAR BAIXA / PAGAR CONTA */}
        {isPayAccountOpen && selectedPayable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Liquidação de Despesa</h2>
                    <p className="text-xs text-slate-400">Confirmar ordem de pagamento e saída financeira.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPayAccountOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Despesa:</span>
                  <span className="text-white font-medium">{selectedPayable.despesa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Credor:</span>
                  <span className="text-white font-semibold">
                    {selectedPayable.fornecedor || selectedPayable.funcionario || selectedPayable.servico || 'Geral'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Categoria:</span>
                  <span className="text-slate-300">{selectedPayable.categoria}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-slate-400">Valor a Liquidar:</span>
                  <span className="text-rose-400 font-bold font-mono text-sm">{selectedPayable.valor.toLocaleString('pt-MZ')} MTn</span>
                </div>
              </div>

              <form onSubmit={handleConfirmPayAccount} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Meio de Pagamento Utilizado *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Transferência Bancária', 'M-Pesa', 'e-Mola', 'Dinheiro (Caixa)', 'Cheque', 'POS'] as const).map(m => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => {
                          setPayAccMethod(m);
                          if (m === 'Dinheiro (Caixa)') setPayAccDeductFromCash(true);
                        }}
                        className={`p-2 rounded-lg border text-xs text-center transition-all ${
                          payAccMethod === m
                            ? 'bg-rose-600/10 border-rose-500 text-rose-400 font-semibold shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">N.º da Fatura / Comprovativo Bancário</label>
                  <input
                    type="text"
                    placeholder="Ex: TRF-BIM-991823 ou N.º de Talão"
                    value={payAccInvoiceNumber}
                    onChange={(e) => setPayAccInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={payAccDeductFromCash}
                      onChange={(e) => setPayAccDeductFromCash(e.target.checked)}
                      className="rounded border-slate-700 text-rose-600 focus:ring-0"
                    />
                    <span>Abater e Registar Saída Direta no Caixa Escolar do Turno</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPayAccountOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Liquidação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: RECIBO OFICIAL (A4 & TÉRMICA) */}
        {receiptToPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Recibo Oficial de Pagamento</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setReceiptPrintMode('a4')}
                      className={`px-2.5 py-1 rounded font-medium ${receiptPrintMode === 'a4' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                    >
                      A4 Oficial
                    </button>
                    <button
                      onClick={() => setReceiptPrintMode('termica')}
                      className={`px-2.5 py-1 rounded font-medium ${receiptPrintMode === 'termica' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                    >
                      Térmica 80mm
                    </button>
                  </div>
                  <button
                    onClick={() => setReceiptToPrint(null)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Area */}
              <div className="mt-5 bg-white text-slate-900 p-6 rounded-xl shadow font-sans">
                
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
                  <div>
                    <div className="text-xl font-black uppercase tracking-tight text-slate-950">{activeInstitution.name}</div>
                    <div className="text-xs text-slate-600 font-semibold">{(activeInstitution as any).tagline || activeInstitution.type || 'Instituto Médio Técnico Profissional'}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {activeInstitution.address} • NUIT: {activeInstitution.nuit || '400192831'} • Maputo, Moçambique
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded border border-emerald-300 inline-block uppercase">
                      RECIBO DE QUITAÇÃO
                    </div>
                    <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                      {receiptToPrint.receiptNumber || 'REC-2026-0000'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Data: {receiptToPrint.paymentDate || new Date().toISOString().split('T')[0]}
                    </div>
                  </div>
                </div>

                {/* Debtor details */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-4 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block">Recebido de:</span>
                    <span className="font-bold text-slate-900 text-sm">{receiptToPrint.studentName || receiptToPrint.debtorName}</span>
                    {receiptToPrint.studentCode && (
                      <span className="text-slate-600 block font-mono text-[11px]">Código: {receiptToPrint.studentCode}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block">Turma / Referência:</span>
                    <span className="font-semibold text-slate-800">{receiptToPrint.classGroupName || 'Geral / Avulso'}</span>
                    <span className="text-slate-600 block text-[11px]">{receiptToPrint.courseName || 'Serviços Institucionais'}</span>
                  </div>
                </div>

                {/* Itemized Table */}
                <table className="w-full text-left text-xs mb-4 border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 border-b">Discriminação do Serviço / Taxa</th>
                      <th className="p-2 border-b text-center">Categoria</th>
                      <th className="p-2 border-b text-right">Valor Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-b font-medium text-slate-900">{receiptToPrint.description}</td>
                      <td className="p-2 border-b text-center uppercase text-[10px] font-bold text-slate-600">
                        {RECEIVABLE_CATEGORY_CONFIG[receiptToPrint.category]?.label || receiptToPrint.category}
                      </td>
                      <td className="p-2 border-b text-right font-mono font-bold text-slate-900">
                        {receiptToPrint.paidAmount.toLocaleString('pt-MZ')} MTn
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Total and Signatures */}
                <div className="flex justify-between items-end border-t border-slate-300 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-slate-100 border border-slate-300 flex items-center justify-center p-1 rounded">
                      <QrCode className="w-14 h-14 text-slate-800" />
                    </div>
                    <div className="text-[10px] text-slate-500 max-w-[200px]">
                      Autenticação Digital SIVEC:
                      <div className="font-mono text-slate-700 font-semibold break-all">
                        {`SIVEC-REC-${receiptToPrint.id.toUpperCase().slice(-8)}`}
                      </div>
                      Verificável em sivec.gov.mz/portal
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase">Total Liquidado</div>
                    <div className="text-2xl font-black font-mono text-slate-950">
                      {receiptToPrint.paidAmount.toLocaleString('pt-MZ')} MTn
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Pago via: <span className="font-bold">{receiptToPrint.paymentMethod || 'Dinheiro'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-slate-300 flex justify-between text-[11px] text-slate-500">
                  <div>Assinatura do Operador de Caixa: _______________________</div>
                  <div>Carimbo da Secretaria / Tesouraria</div>
                </div>

              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleShareReceiptWhatsApp(receiptToPrint)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar via WhatsApp
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL 6: COMPROVATIVO DE CONTA A PAGAR / ORDEM DE PAGAMENTO */}
        {voucherToPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-bold text-white">Comprovativo de Ordem de Pagamento</h3>
                </div>
                <button onClick={() => setVoucherToPrint(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 bg-white text-slate-900 p-5 rounded-xl text-xs space-y-3 font-sans">
                <div className="border-b pb-2 flex justify-between">
                  <div>
                    <div className="font-bold text-sm uppercase">{activeInstitution.name}</div>
                    <div className="text-[11px] text-slate-500">Tesouraria Central & Gestão Financeira</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">PAGO</span>
                    <div className="font-mono text-[11px] mt-1">{voucherToPrint.invoiceNumber || 'VOUCH-001'}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Despesa:</span>
                    <span className="font-bold text-slate-900">{voucherToPrint.despesa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beneficiário:</span>
                    <span className="font-semibold text-slate-800">
                      {voucherToPrint.fornecedor || voucherToPrint.funcionario || voucherToPrint.servico}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Categoria Contábil:</span>
                    <span className="text-slate-700">{voucherToPrint.categoria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Data de Liquidação:</span>
                    <span className="font-mono">{voucherToPrint.paymentDate || voucherToPrint.data}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Forma de Pagamento:</span>
                    <span className="font-bold text-slate-800">{voucherToPrint.paymentMethod}</span>
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-500">Valor Liquidado:</span>
                  <span className="text-xl font-black font-mono text-rose-700">
                    {voucherToPrint.valor.toLocaleString('pt-MZ')} MTn
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Comprovativo
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PermissionGate>
  );
};
