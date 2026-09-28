import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { getStudentTuitionInstallments } from '../mockStudentData';
import { TuitionInstallment } from '../types';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Lock, 
  Send, 
  DollarSign, 
  Receipt, 
  Phone, 
  Building2, 
  Upload, 
  FileText,
  ShieldCheck,
  X
} from 'lucide-react';

interface StudentFinanceTabProps {
  currentStudent: Student;
  onViewReceipt: (receiptNumber: string) => void;
  onRequestAgreement: () => void;
}

export const StudentFinanceTab: React.FC<StudentFinanceTabProps> = ({
  currentStudent,
  onViewReceipt,
  onRequestAgreement
}) => {
  const { submitPayment } = useApp();
  const [installments, setInstallments] = useState<TuitionInstallment[]>(() =>
    getStudentTuitionInstallments(currentStudent)
  );

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentNetwork, setPaymentNetwork] = useState<'M-Pesa' | 'e-Mola' | 'Ponto24' | 'Transferência'>('M-Pesa');
  const [transactionCode, setTransactionCode] = useState('');
  const [targetMonth, setTargetMonth] = useState('Outubro');
  const [amountInput, setAmountInput] = useState('4500');
  const [proofFileName, setProofFileName] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Recalcular quando o aluno muda
  React.useEffect(() => {
    setInstallments(getStudentTuitionInstallments(currentStudent));
  }, [currentStudent]);

  const paidCount = installments.filter(i => i.status === 'pago').length;
  const pendingCount = installments.filter(i => i.status === 'pendente' || i.status === 'atrasado').length;
  const totalPaidAmount = installments.filter(i => i.status === 'pago').reduce((acc, i) => acc + i.totalPayable, 0);

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionCode.trim()) return;

    // Submeter pagamento no AppContext
    submitPayment({
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      studentCode: currentStudent.code,
      courseName: currentStudent.courseName,
      className: currentStudent.classGroupName,
      documentNumber: currentStudent.documentNumber,
      amount: parseFloat(amountInput) || 4500,
      feeType: 'Mensalidade Escolar',
      monthReference: `${targetMonth}/2026`,
      network: (paymentNetwork === 'Ponto24' || paymentNetwork === 'Transferência') ? 'Banco (BIM)' : paymentNetwork as any,
      transactionCode: transactionCode.toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      proofFileName: proofFileName || 'Comprovativo_Digital.pdf'
    });

    // Atualizar visualmente o status da parcela
    setInstallments(prev =>
      prev.map(item => {
        if (item.monthName === targetMonth) {
          return {
            ...item,
            status: 'pendente',
            transactionCode: transactionCode.toUpperCase(),
            paymentMethod: paymentNetwork
          };
        }
        return item;
      })
    );

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentModal(false);
      setTransactionCode('');
      setProofFileName('');
    }, 2500);
  };

  return (
    <div id="student-finance-tab" className="space-y-6">
      
      {/* Banner de Proteção Contábil & Imutabilidade */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 text-amber-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Pagamentos Aprovados são Imutáveis (Somente Leitura)
              </h3>
              <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Auditoria Financeira
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
              Todas as mensalidades liquidadas e aprovadas pela Tesouraria possuem força legal de quitação contábil e <strong>não podem ser alteradas ou excluídas pelo aluno</strong>. Para requerer parcelamento especial ou compensação, entre em contato via secretaria.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRequestAgreement}
          className="px-4 py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Solicitar Acordo Financeiro</span>
        </button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Total Liquidado em 2026</span>
          <div className="text-2xl font-black text-emerald-700">{totalPaidAmount.toLocaleString('pt-PT')} MTn</div>
          <p className="text-[11px] text-emerald-600 font-semibold">{paidCount} parcelas quitadas com recibo</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Situação de Propinas</span>
          <div className="text-2xl font-black text-slate-900">
            {currentStudent.paymentStatus === 'Pago' ? 'Regularizada' : 'Pendente'}
          </div>
          <p className="text-[11px] text-slate-500">Próximo vencimento: 10 de Outubro</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Ação Financeira</span>
            <p className="text-xs font-bold text-slate-900 mt-1">Liquidar Propina do Mês</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagar Propina (M-Pesa / e-Mola)</span>
          </button>
        </div>
      </div>

      {/* Tabela de Mensalidades (Fevereiro a Dezembro) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4">
        <div className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cronograma Anual de Mensalidades (2026)</h3>
            <p className="text-xs text-slate-500">Histórico detalhado de parcelas vencidas, quitadas e a vencer</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">Parcela & Mês</th>
                <th className="px-4 py-3">Data de Vencimento</th>
                <th className="px-4 py-3">Valor da Propina</th>
                <th className="px-4 py-3">Forma de Pagamento</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Comprovativo / Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {installments.map(inst => {
                const isPaid = inst.status === 'pago';
                const isPending = inst.status === 'pendente';
                const isLate = inst.status === 'atrasado';

                return (
                  <tr key={inst.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900">Parcela {inst.installmentNumber}: {inst.monthName}</span>
                      <span className="block text-[11px] text-slate-400 font-mono">Ano Letivo {inst.year}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{inst.dueDate}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {inst.totalPayable.toLocaleString('pt-PT')} MTn
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {inst.paymentMethod ? (
                        <span className="font-medium text-slate-800">
                          {inst.paymentMethod} {inst.transactionCode && `(${inst.transactionCode})`}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {isPaid && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Pago (Aprovado)
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[11px]">
                          <Clock className="w-3 h-3" />
                          Em Validação
                        </span>
                      )}
                      {isLate && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[11px]">
                          <AlertCircle className="w-3 h-3" />
                          Em Atraso
                        </span>
                      )}
                      {inst.status === 'a_vencer' && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium text-[11px]">
                          A Vencer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {isPaid && inst.receiptNumber ? (
                        <button
                          type="button"
                          onClick={() => onViewReceipt(inst.receiptNumber!)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 ml-auto transition cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ver {inst.receiptNumber}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetMonth(inst.monthName);
                            setShowPaymentModal(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold ml-auto transition cursor-pointer"
                        >
                          Pagar Agora
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Efetuar Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Liquidar Mensalidade Escolar</h3>
                  <p className="text-xs text-slate-400">Envie o código da transação e comprovativo para validação rápida</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Comprovativo Submetido!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Seu pagamento está sendo verificado pela tesouraria. O recibo oficial será disponibilizado após conferência.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePaySubmit} className="p-6 space-y-4 text-xs">
                
                {/* Seleção do Canal de Pagamento */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-2">Canal de Pagamento Oficial</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'M-Pesa', label: 'M-Pesa', note: '84/85 391 8201' },
                      { id: 'e-Mola', label: 'e-Mola', note: '86/87 502 9184' },
                      { id: 'Transferência', label: 'Banco (BIM)', note: 'Conta: 192837401' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentNetwork(p.id as any)}
                        className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                          paymentNetwork === p.id
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <div className="text-xs">{p.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.note}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mês de Referência</label>
                    <input
                      type="text"
                      value={targetMonth}
                      onChange={e => setTargetMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Valor a Pagar (MTn)</label>
                    <input
                      type="number"
                      value={amountInput}
                      onChange={e => setAmountInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código de Confirmação da Transação *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MP91829381A ou TRF-BIM-84920"
                    value={transactionCode}
                    onChange={e => setTransactionCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Copie a mensagem SMS recebida da operadora
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Anexar Comprovativo / Screenshot (Opcional)
                  </label>
                  <label className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 transition bg-slate-50">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 font-medium">
                      {proofFileName || 'Clique para selecionar foto ou PDF'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) setProofFileName(e.target.files[0].name);
                      }}
                    />
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-sm transition"
                  >
                    Confirmar Envio
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
