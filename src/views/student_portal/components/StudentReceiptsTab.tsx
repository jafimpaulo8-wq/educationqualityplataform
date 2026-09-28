import React, { useState } from 'react';
import { Student } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { 
  Receipt, 
  Printer, 
  Download, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  X,
  CreditCard,
  Building2,
  Lock
} from 'lucide-react';

interface StudentReceiptsTabProps {
  currentStudent: Student;
  initialSelectedReceipt?: string | null;
}

export const StudentReceiptsTab: React.FC<StudentReceiptsTabProps> = ({
  currentStudent,
  initialSelectedReceipt
}) => {
  const { activeInstitution } = useApp();

  const receiptsList = [
    {
      id: 'rec-01',
      number: 'REC-2026-1042-01',
      date: '05/02/2026 09:14',
      month: 'Fevereiro/2026',
      amount: 4500,
      paymentMethod: 'M-Pesa (MP91823901A)',
      operator: 'Teresa Mondlane (Tesouraria)',
      qrCode: 'SIGAR-REC-2026-01-9921',
      description: 'Propina Mensal - Curso de Engenharia de Software & Web Full-Stack'
    },
    {
      id: 'rec-02',
      number: 'REC-2026-1042-02',
      date: '08/03/2026 14:22',
      month: 'Março/2026',
      amount: 4500,
      paymentMethod: 'e-Mola (EM77120391B)',
      operator: 'Teresa Mondlane (Tesouraria)',
      qrCode: 'SIGAR-REC-2026-02-8812',
      description: 'Propina Mensal - Curso de Engenharia de Software & Web Full-Stack'
    },
    {
      id: 'rec-03',
      number: 'REC-2026-1042-03',
      date: '09/04/2026 10:45',
      month: 'Abril/2026',
      amount: 4500,
      paymentMethod: 'Transferência Bancária (BIM-TRF-09182)',
      operator: 'Armindo Sitoe (Caixa Geral)',
      qrCode: 'SIGAR-REC-2026-03-7741',
      description: 'Propina Mensal - Curso de Engenharia de Software & Web Full-Stack'
    },
    {
      id: 'rec-04',
      number: 'REC-2026-1042-04',
      date: '04/05/2026 11:30',
      month: 'Maio/2026',
      amount: 4500,
      paymentMethod: 'M-Pesa (MP44019283K)',
      operator: 'Teresa Mondlane (Tesouraria)',
      qrCode: 'SIGAR-REC-2026-04-6632',
      description: 'Propina Mensal - Curso de Engenharia de Software & Web Full-Stack'
    },
    {
      id: 'rec-05',
      number: 'REC-2026-1042-05',
      date: '08/06/2026 15:10',
      month: 'Junho/2026',
      amount: 4500,
      paymentMethod: 'M-Pesa (MP88129034L)',
      operator: 'Teresa Mondlane (Tesouraria)',
      qrCode: 'SIGAR-REC-2026-05-5521',
      description: 'Propina Mensal - Curso de Engenharia de Software & Web Full-Stack'
    },
    {
      id: 'rec-06',
      number: 'REC-2026-1042-06',
      date: '09/07/2026 08:50',
      month: 'Julho/2026',
      amount: 4500,
      paymentMethod: 'e-Mola (EM22910482P)',
      operator: 'Armindo Sitoe (Caixa Geral)',
      qrCode: 'SIGAR-REC-2026-06-4410',
      description: 'Propina Mensal - Curso de Engenharia de Software & Web Full-Stack'
    },
    {
      id: 'rec-07',
      number: 'REC-2026-1042-07',
      date: '07/08/2026 13:40',
      month: 'Agosto/2026',
      amount: 4500,
      paymentMethod: 'M-Pesa (MP99182746Q)',
      operator: 'Teresa Mondlane (Tesouraria)',
      qrCode: 'SIGAR-REC-2026-07-3309',
      description: 'Propina Mensal - Curso de Engenharia de Software & Web Full-Stack'
    }
  ];

  const [activeReceiptModal, setActiveReceiptModal] = useState<typeof receiptsList[0] | null>(() => {
    if (initialSelectedReceipt) {
      return receiptsList.find(r => r.number === initialSelectedReceipt) || receiptsList[0];
    }
    return null;
  });

  return (
    <div id="student-receipts-tab" className="space-y-6">
      
      {/* Header dos Recibos */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Comprovativos Contábeis Fiscais
            </span>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-600" />
              Recibos Oficiais de Pagamento
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Todos os recibos expedidos pela tesouraria com validação eletrônica e código QR de quitação
            </p>
          </div>

          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold self-start sm:self-auto">
            {receiptsList.length} Recibos Emitidos
          </span>
        </div>

        {/* Proteção dos recibos */}
        <div className="pt-4 flex items-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Recibos são documentos definitivos autenticados por assinatura digital do caixa.</span>
        </div>
      </div>

      {/* Grid de Recibos Emitidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {receiptsList.map(rec => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold rounded">
                  {rec.number}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2">{rec.month}</h3>
                <p className="text-[11px] text-slate-400 font-mono">{rec.date}</p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-slate-900 block">
                  {rec.amount.toLocaleString('pt-PT')} MTn
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  Quitado
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div>
                <span className="text-slate-400">Canal:</span> <span className="font-semibold text-slate-800">{rec.paymentMethod}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-400">Emissor:</span> {rec.operator}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveReceiptModal(rec)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Visualizar Recibo Oficial</span>
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE RECIBO OFICIAL COM QR CODE */}
      {activeReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header do Modal */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">Recibo de Quitação Contábil Oficial</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceiptModal(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Recibo Imprimível */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              
              {/* Cabeçalho da Empresa */}
              <div className="text-center border-b border-slate-200 pb-4 space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  {activeInstitution?.name || 'Moztechwave Professional Institute'}
                </h3>
                <p className="text-[10px] text-slate-500">NUIT: 400192837 • Maputo, Moçambique</p>
                <div className="inline-block mt-1 px-3 py-0.5 bg-slate-100 rounded text-xs font-mono font-bold text-slate-900">
                  {activeReceiptModal.number}
                </div>
              </div>

              {/* Dados do Aluno */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estudante:</span>
                  <span className="font-bold text-slate-900">{currentStudent.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Código / BI:</span>
                  <span className="font-mono">{currentStudent.code} • {currentStudent.documentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Curso:</span>
                  <span className="font-medium text-slate-800">{currentStudent.courseName}</span>
                </div>
              </div>

              {/* Discriminação do Pagamento */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Itens Liquidados</span>
                <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>{activeReceiptModal.description}</span>
                    <span className="font-bold">{activeReceiptModal.amount.toLocaleString('pt-PT')} MTn</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px] pt-2 border-t border-slate-100">
                    <span>Referência: {activeReceiptModal.month}</span>
                    <span className="text-emerald-700 font-bold">100% Liquidado</span>
                  </div>
                </div>
              </div>

              {/* Total e Método */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-900 block">Total Recebido</span>
                  <span className="text-xl font-black text-emerald-800">
                    {activeReceiptModal.amount.toLocaleString('pt-PT')} MTn
                  </span>
                </div>
                <div className="text-right text-[11px] text-emerald-900 font-medium">
                  <p>{activeReceiptModal.paymentMethod}</p>
                  <p className="text-[10px] text-emerald-700">Data: {activeReceiptModal.date}</p>
                </div>
              </div>

              {/* QR Code de Autenticação Contábil */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded p-1 flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    <p className="font-bold text-slate-800">Validador SIVEC</p>
                    <p>{activeReceiptModal.qrCode}</p>
                    <p>Operador: {activeReceiptModal.operator}</p>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-500">
                  <div className="w-28 border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                    Tesouraria Geral
                  </div>
                  <span>Assinatura Digital</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
