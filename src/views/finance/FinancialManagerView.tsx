import React, { useState } from 'react';
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
  Download, 
  Printer, 
  CheckCircle, 
  CreditCard, 
  FileText, 
  Clock, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Smartphone,
  Building,
  Check,
  Receipt
} from 'lucide-react';

export const FinancialManagerView: React.FC = () => {
  const { 
    students, 
    classes, 
    activeInstitution, 
    financialSettings, 
    addCashTransaction, 
    addNotification,
    navigate
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'todos' | 'pago' | 'pendente' | 'atrasado'>('todos');
  const [filterClass, setFilterClass] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCarnetStudent, setSelectedCarnetStudent] = useState<any | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [receiptFormat, setReceiptFormat] = useState<'a4' | 'termica'>('a4');
  const [paymentModalStudent, setPaymentModalStudent] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'M-Pesa' | 'e-Mola' | 'POS'>('M-Pesa');

  // Multiplicador de propinas fictícias para simular mensalidades reais
  const monthlyFeeBase = 4500;

  // Gerar dados de mensalidades dos alunos com multas e juros calculados
  const studentInstallments = students.map(student => {
    const isLate = student.paymentStatus === 'Atrasado';
    const isPending = student.paymentStatus === 'Pendente';
    const isPaid = student.paymentStatus === 'Pago';

    const daysLate = isLate ? 14 : 0;
    const fine = isLate ? financialSettings.fineAmount : 0;
    const interest = isLate ? (monthlyFeeBase * (financialSettings.interestRateDaily / 100) * daysLate) : 0;
    const totalDue = isPaid ? 0 : monthlyFeeBase + fine + interest;

    return {
      student,
      month: 'Setembro / 2026',
      dueDate: '10/09/2026',
      daysLate,
      fine,
      interest,
      baseAmount: monthlyFeeBase,
      totalDue,
      status: student.paymentStatus,
      receiptRef: `REC-2026-${student.code.slice(-4)}`
    };
  });

  const filteredInstallments = studentInstallments.filter(item => {
    const matchesStatus = 
      filterStatus === 'todos' ? true :
      filterStatus === 'pago' ? item.status === 'Pago' :
      filterStatus === 'pendente' ? item.status === 'Pendente' :
      item.status === 'Atrasado';

    const matchesClass = filterClass === 'todas' || item.student.classGroupId === filterClass;
    const matchesSearch = 
      item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student.code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesClass && matchesSearch;
  });

  // Estatísticas do painel
  const totalReceivable = studentInstallments.reduce((acc, curr) => acc + (curr.status !== 'Pago' ? curr.totalDue : 0), 0);
  const totalReceived = studentInstallments.filter(i => i.status === 'Pago').length * monthlyFeeBase;
  const lateCount = studentInstallments.filter(i => i.status === 'Atrasado').length;
  const lateAmount = studentInstallments.filter(i => i.status === 'Atrasado').reduce((acc, curr) => acc + curr.totalDue, 0);

  const handleReceivePayment = (item: typeof studentInstallments[0]) => {
    // Registrar entrada no caixa ativo
    addCashTransaction({
      institutionId: activeInstitution.id,
      type: 'entrada',
      amount: item.totalDue,
      description: `Propina Setembro/2026 - ${item.student.fullName}`,
      category: 'Propinas',
      operator: 'Tesoureiro de Turno',
      paymentMethod,
      studentName: item.student.fullName,
      documentRef: `REC-${Date.now().toString().slice(-6)}`
    });

    // Atualizar status do aluno no mock
    item.student.paymentStatus = 'Pago';
    item.student.balanceOwing = 0;

    addNotification({
      title: 'Mensalidade Recebida com Sucesso',
      message: `Recebimento de ${item.totalDue.toLocaleString('pt-MZ')} MTn de ${item.student.fullName} registrado.`,
      type: 'payment'
    });

    setPaymentModalStudent(null);
  };

  return (
    <div id="financial-manager-container" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Gestão Financeira & Contas a Receber</h1>
              <p className="text-sm text-slate-500">
                Controle de mensalidades, carnês com QR Code, multas diárias e emissão de recibos oficiais
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-nav-caixa"
            onClick={() => navigate('caixa_escolar')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Caixa Escolar do Dia
          </button>
          <button
            id="btn-print-financial"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Recebido (Mês)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalReceived.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-500">MTn</span>
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Liquidado pontualmente
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">A Receber (Setembro)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalReceivable.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-slate-500">MTn</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Previsão bruta da folha</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Inadimplência (Atraso)</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {lateAmount.toLocaleString('pt-MZ')} <span className="text-xs font-normal text-rose-500">MTn</span>
          </div>
          <p className="text-xs text-rose-600 mt-1 font-medium">
            {lateCount} {lateCount === 1 ? 'aluno em atraso' : 'alunos em atraso'} com multas calculadas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Regra de Multa & Juros</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900">
            +{financialSettings.fineAmount} MT <span className="text-xs font-normal text-slate-500">fixo</span> + {financialSettings.interestRateDaily}%/dia
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">Calculado no carnê A4 e balcão</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-finance"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do aluno ou código de matrícula..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            id="select-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="todos">Todos os Status</option>
            <option value="pago">Apenas Pagos</option>
            <option value="pendente">Apenas Pendentes</option>
            <option value="atrasado">Apenas Atrasados</option>
          </select>

          <select
            id="select-filter-class"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="todas">Todas as Turmas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Mensalidades */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Mensalidades do Período Letivo
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Exibindo {filteredInstallments.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Aluno / Matrícula</th>
                <th className="px-4 py-3">Turma</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Valor Base</th>
                <th className="px-4 py-3">Multa / Juros</th>
                <th className="px-4 py-3">Total a Pagar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstallments.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.student.photoUrl}
                        alt={item.student.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{item.student.fullName}</div>
                        <div className="text-xs text-slate-500">{item.student.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-700">
                      {item.student.classGroupName}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <div className="font-medium text-slate-800">{item.dueDate}</div>
                    {item.daysLate > 0 && (
                      <div className="text-xs text-rose-600 font-semibold">{item.daysLate} dias de atraso</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {item.baseAmount.toLocaleString('pt-MZ')} MTn
                  </td>
                  <td className="px-4 py-3.5">
                    {item.fine > 0 || item.interest > 0 ? (
                      <div className="text-xs">
                        <span className="text-rose-600 font-medium">+{item.fine + item.interest} MTn</span>
                        <span className="text-slate-400 block text-[10px]">({item.fine} MT multa + {item.interest.toFixed(0)} MT juros)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    {item.totalDue > 0 ? `${item.totalDue.toLocaleString('pt-MZ')} MTn` : '0 MTn (Pago)'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Pago' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : item.status === 'Atrasado'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}>
                      {item.status === 'Pago' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status !== 'Pago' ? (
                        <PermissionGate permission="pagamentos.create">
                          <button
                            id={`btn-pay-${item.student.id}`}
                            onClick={() => setPaymentModalStudent(item)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Receber
                          </button>
                        </PermissionGate>
                      ) : (
                        <button
                          id={`btn-receipt-${item.student.id}`}
                          onClick={() => setSelectedReceipt(item)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-slate-600" />
                          Recibo
                        </button>
                      )}

                      <button
                        id={`btn-carnet-${item.student.id}`}
                        onClick={() => setSelectedCarnetStudent(item)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                        title="Emitir Carnê A4 com QR Code"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        Carnê A4
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Recebimento de Mensalidade no Balcão */}
      {paymentModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Receber Mensalidade</h3>
            <p className="text-xs text-slate-500 mb-4">
              Lançamento imediato de entrada no caixa ativo da instituição
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Formando:</span>
                <span className="font-semibold text-slate-800">{paymentModalStudent.student.fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Mês Referência:</span>
                <span className="font-medium text-slate-800">{paymentModalStudent.month}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Valor Base:</span>
                <span>{paymentModalStudent.baseAmount.toLocaleString('pt-MZ')} MTn</span>
              </div>
              {paymentModalStudent.daysLate > 0 && (
                <div className="flex justify-between text-sm text-rose-600 font-medium">
                  <span>Multa ({paymentModalStudent.fine} MT) + Juros:</span>
                  <span>+{(paymentModalStudent.fine + paymentModalStudent.interest).toLocaleString('pt-MZ')} MTn</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-slate-900">
                <span>Total a Cobrar:</span>
                <span className="text-emerald-700">{paymentModalStudent.totalDue.toLocaleString('pt-MZ')} MTn</span>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-semibold text-slate-700 block">Forma de Pagamento:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Dinheiro', 'M-Pesa', 'e-Mola', 'POS'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === method 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleReceivePayment(paymentModalStudent)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Carnê Escolar A4 Formatado com Canhoto & QR Code */}
      {selectedCarnetStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Carnê de Pagamento Escolar (Folha A4)</h3>
                <p className="text-xs text-slate-500">Padrão nacional com canhoto destacável, linha digitável e QR Code PIX/M-Pesa</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Carnê A4
                </button>
                <button
                  onClick={() => setSelectedCarnetStudent(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Carnê Visual em Folha A4 */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-6">
              {/* Canhoto da Escola */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Canhoto do Centro / Instituição</span>
                    <h4 className="font-bold text-slate-900 text-sm">{activeInstitution.name}</h4>
                    <p className="text-xs text-slate-500">NUIT: {activeInstitution.nuit} • {activeInstitution.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700">Parcela: 09/12</span>
                    <div className="text-xs text-rose-600 font-bold">Vencimento: 10/09/2026</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Formando</span>
                    <span className="font-semibold">{selectedCarnetStudent.student.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Matrícula</span>
                    <span className="font-mono">{selectedCarnetStudent.student.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Valor Base</span>
                    <span className="font-bold text-slate-900">{selectedCarnetStudent.baseAmount.toLocaleString('pt-MZ')} MTn</span>
                  </div>
                </div>
              </div>

              {/* Linha de corte pontilhada */}
              <div className="border-t-2 border-dashed border-slate-300 relative text-center">
                <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest relative -top-2">
                  ✂ Destaque aqui no momento do pagamento
                </span>
              </div>

              {/* Guia Principal do Aluno / Encarregado */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 text-base">{activeInstitution.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500">{activeInstitution.address} • NUIT: {activeInstitution.nuit}</p>
                  </div>
                  <div className="text-right bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 font-bold block">VALOR A LIQUIDAR</span>
                    <span className="text-base font-bold text-emerald-800">{selectedCarnetStudent.totalDue.toLocaleString('pt-MZ')} MTn</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Número do Aluno</span>
                    <span className="font-semibold text-slate-800">{selectedCarnetStudent.student.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Curso Matriculado</span>
                    <span className="font-semibold text-slate-800">{selectedCarnetStudent.student.courseName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Data de Vencimento</span>
                    <span className="font-bold text-rose-600">10 de Setembro de 2026</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Multa após Vencimento</span>
                    <span className="font-medium text-slate-700">+{financialSettings.fineAmount} MT + {financialSettings.interestRateDaily}%/dia</span>
                  </div>
                </div>

                {/* Dados de Pagamento & QR Code */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      Pagamento Digital via M-Pesa / e-Mola:
                    </div>
                    <p className="font-mono text-xs bg-slate-100 p-1.5 rounded text-slate-800 font-semibold">
                      Chave M-Pesa: {financialSettings.pixKey}
                    </p>
                    <div className="font-bold text-slate-900 pt-1">Transferência Bancária:</div>
                    <p className="text-slate-600 text-[11px]">{financialSettings.bankInfo}</p>
                    <p className="text-slate-400 text-[10px]">Referência Obrigatória: <strong>{selectedCarnetStudent.student.code}</strong></p>
                  </div>

                  <div className="text-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg p-1.5 mx-auto flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-slate-800" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium mt-1 block">Escanear para Pagar</span>
                  </div>
                </div>

                {/* Código de barras simulado / Linha digitável */}
                <div className="text-center pt-2">
                  <p className="font-mono text-xs text-slate-600 tracking-wider">
                    00190.00009 01202.690412 00000.001842 1 91200000450000
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Recibo Digital Oficial (Opção A4 e Térmica 80mm) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Comprovativo de Pagamento</h3>
                <p className="text-xs text-slate-500">Emissão de recibo com autenticação fiscal</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setReceiptFormat('a4')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    receiptFormat === 'a4' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Padrão A4
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptFormat('termica')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    receiptFormat === 'termica' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Térmica 80mm
                </button>
              </div>
            </div>

            {/* Recibo Renderizado */}
            {receiptFormat === 'termica' ? (
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 space-y-2 max-w-[300px] mx-auto shadow-inner">
                <div className="text-center pb-2 border-b border-dashed border-slate-400">
                  <div className="font-bold text-sm">{activeInstitution.name}</div>
                  <div className="text-[10px]">NUIT: {activeInstitution.nuit}</div>
                  <div className="text-[10px]">Maputo - Moçambique</div>
                </div>
                <div className="py-1 border-b border-dashed border-slate-400 text-[11px]">
                  <div>RECIBO: {selectedReceipt.receiptRef}</div>
                  <div>DATA: {new Date().toLocaleDateString('pt-MZ')} {new Date().toLocaleTimeString('pt-MZ')}</div>
                  <div>OPERADOR: Tesouraria Geral</div>
                </div>
                <div className="py-1 border-b border-dashed border-slate-400 text-[11px] space-y-0.5">
                  <div>ALUNO: {selectedReceipt.student.fullName}</div>
                  <div>DOC: {selectedReceipt.student.code}</div>
                  <div>REF: Propina Setembro/2026</div>
                </div>
                <div className="pt-2 flex justify-between font-bold text-sm">
                  <span>TOTAL PAGO:</span>
                  <span>{selectedReceipt.baseAmount.toLocaleString('pt-MZ')} MT</span>
                </div>
                <div className="text-center pt-2 text-[9px] text-slate-500">
                  Documento processado por computador via SIGAR Moztechwave. Obrigado!
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{activeInstitution.name}</h4>
                    <p className="text-xs text-slate-500">NUIT: {activeInstitution.nuit} • {activeInstitution.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      {selectedReceipt.receiptRef}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recebemos de:</span>
                    <span className="font-semibold text-slate-900">{selectedReceipt.student.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Código de Matrícula:</span>
                    <span className="font-mono">{selectedReceipt.student.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Curso:</span>
                    <span>{selectedReceipt.student.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Referente a:</span>
                    <span>Propina Mensal - Mês de Setembro/2026</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                    <span>Valor Liquidado:</span>
                    <span className="text-emerald-700">{selectedReceipt.baseAmount.toLocaleString('pt-MZ')} MTn</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
