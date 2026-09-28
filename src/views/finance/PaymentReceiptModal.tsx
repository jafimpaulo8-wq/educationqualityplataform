import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Building2, 
  Calendar, 
  Clock, 
  DollarSign, 
  CreditCard,
  Download,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Smartphone,
  FileText,
  Receipt,
  FileCheck
} from 'lucide-react';
import { PaymentRecord, PAYMENT_SERVICE_CATALOG } from '../../types/finance';
import { useApp } from '../../context/AppContext';

export type ReceiptFormat = 'normal' | 'termico' | 'digital';

interface PaymentReceiptModalProps {
  payment: PaymentRecord;
  onClose: () => void;
  onReprint?: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ payment, onClose, onReprint }) => {
  const { activeInstitution, recordReceiptReprint, currentUser, sendDirectWhatsAppMessage } = useApp();
  const [format, setFormat] = useState<ReceiptFormat>('normal');
  const [thermalWidth, setThermalWidth] = useState<'80mm' | '58mm'>('80mm');
  const [showQrCode, setShowQrCode] = useState<boolean>(payment.qrCodeEnabled !== false);
  const [copied, setCopied] = useState(false);

  const serviceConfig = PAYMENT_SERVICE_CATALOG[payment.serviceItem];
  const receiptNumber = payment.receiptNumber || `REC-2026-${payment.id.slice(-4).toUpperCase()}`;
  const isReprint = (payment.reprintCount && payment.reprintCount > 0);

  const handlePrint = () => {
    // Registra a auditoria de reimpressão sem alterar valores ou duplicar pagamento
    recordReceiptReprint(payment.id, currentUser?.name);
    if (onReprint) onReprint();
    window.print();
  };

  const handleCopyDigital = () => {
    const text = `*RECIBO DE PAGAMENTO OFICIAL - ${activeInstitution.name}*
N.º: ${receiptNumber}
Aluno: ${payment.studentName} (${payment.studentCode})
Serviço: ${payment.serviceItem.toUpperCase()} - ${payment.serviceDescription || serviceConfig?.label}
Valor: ${payment.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
Método: ${payment.network} (Tx: ${payment.transactionCode})
Data: ${payment.date} ${payment.time}
Operador: ${payment.reviewedBy || 'Tesouraria Central'}
Autenticação SIVERC: SIVERC-${payment.transactionCode.slice(0, 6)}-${payment.id.slice(-4).toUpperCase()}
${isReprint ? `(2ª VIA - Reimpressão #${payment.reprintCount})` : '(1ª VIA - Original)'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const rawMsg = `*RECIBO DE PAGAMENTO OFICIAL - ${activeInstitution.name}*\nN.º: ${receiptNumber}\nAluno: ${payment.studentName} (${payment.studentCode})\nServiço: ${payment.serviceItem.toUpperCase()}\nValor: ${payment.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT\nData: ${payment.date} ${payment.time}\nVerificação: https://siverc.gov.mz/validar-recibo?ref=${receiptNumber}`;
    const phone = payment.studentPhone || '';

    sendDirectWhatsAppMessage({
      recipientPhone: phone || '+258 84 000 0000',
      recipientName: payment.studentName,
      category: 'confirmacao_pagamento',
      message: rawMsg,
      source: 'tesouraria',
      documentAttachment: {
        name: `Recibo_${receiptNumber}.pdf`,
        type: 'application/pdf'
      },
      openDirectlyInWeb: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Top Control Bar - Screen only */}
        <div className="px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Emissão de Recibo</span>
                {isReprint ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    2ª Via • Reimpressão ({payment.reprintCount}x)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    1ª Via • Original
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                N.º {receiptNumber} • Sem duplicação de pagamento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Format Selector */}
            <div className="inline-flex p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setFormat('normal')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  format === 'normal' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Normal A4
              </button>
              <button
                type="button"
                onClick={() => setFormat('termico')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  format === 'termico' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Térmico POS
              </button>
              <button
                type="button"
                onClick={() => setFormat('digital')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  format === 'digital' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Digital
              </button>
            </div>

            {/* QR Code Toggle */}
            <button
              type="button"
              onClick={() => setShowQrCode(!showQrCode)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showQrCode 
                  ? 'bg-slate-800 border-slate-600 text-emerald-400' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
              title="Alternar exibição do QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              QR {showQrCode ? 'Ativo' : 'Oculto'}
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              {isReprint ? 'Reimprimir 2ª Via' : 'Imprimir / PDF'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FORMAT: TÉRMICO (BOBINA POS 80MM / 58MM) */}
        {format === 'termico' && (
          <div className="p-6 sm:p-8 flex flex-col items-center bg-slate-100 print:p-0 print:bg-white">
            <div className="mb-4 flex items-center gap-2 print:hidden">
              <span className="text-xs text-slate-600 font-medium">Largura da bobina:</span>
              <button
                onClick={() => setThermalWidth('80mm')}
                className={`px-2.5 py-1 rounded text-xs font-bold ${thermalWidth === '80mm' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border'}`}
              >
                80mm (Padrão)
              </button>
              <button
                onClick={() => setThermalWidth('58mm')}
                className={`px-2.5 py-1 rounded text-xs font-bold ${thermalWidth === '58mm' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border'}`}
              >
                58mm (Compacto)
              </button>
            </div>

            <div 
              id="printable-thermal-receipt" 
              style={{ width: thermalWidth === '80mm' ? '300px' : '220px' }}
              className="bg-white p-4 font-mono text-[11px] leading-tight text-black border border-slate-300 shadow-md print:shadow-none print:border-none print:p-1"
            >
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-black">
                <p className="font-black text-xs uppercase">{activeInstitution.name}</p>
                <p className="text-[9px]">NUIT: {activeInstitution.nuit} • Tel: {activeInstitution.phone}</p>
                <p className="text-[9px]">{activeInstitution.address}</p>
                <p className="font-bold text-[10px] mt-1 uppercase">*** RECIBO DE PAGAMENTO ***</p>
                {isReprint && (
                  <p className="font-black text-[10px] uppercase bg-black text-white px-1 py-0.5 mt-0.5">
                    ** 2ª VIA / REIMPRESSÃO #{payment.reprintCount} **
                  </p>
                )}
              </div>

              <div className="py-2 space-y-1 text-[10px] border-b border-dashed border-black">
                <div className="flex justify-between">
                  <span>RECIBO N:</span>
                  <span className="font-bold">{receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATA:</span>
                  <span>{payment.date} {payment.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>OPERADOR:</span>
                  <span>{payment.reviewedBy || 'Tesouraria'}</span>
                </div>
                <div className="pt-1">
                  <span className="font-bold">ALUNO:</span>
                  <p className="font-bold uppercase truncate">{payment.studentName}</p>
                  <p className="text-[9px]">CÓDIGO: {payment.studentCode}</p>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-black">
                <div className="flex justify-between font-bold text-[10px] pb-1">
                  <span>DESCRIÇÃO</span>
                  <span>VALOR</span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase">{payment.serviceItem}</span>
                  <span className="font-bold">
                    {payment.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                  </span>
                </div>
                <div className="text-[9px] text-slate-700">
                  Forma: {payment.network} (Tx: {payment.transactionCode})
                </div>
              </div>

              <div className="py-2 space-y-1 border-b border-dashed border-black">
                <div className="flex justify-between text-xs font-black">
                  <span>TOTAL PAGO:</span>
                  <span>{payment.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT</span>
                </div>
              </div>

              {showQrCode && (
                <div className="py-3 flex flex-col items-center justify-center border-b border-dashed border-black">
                  <div className="p-1 bg-white border border-black inline-block">
                    <QrCode className="w-16 h-16 text-black" />
                  </div>
                  <span className="text-[8px] mt-1 font-mono">AUTENTICIDADE FISCAL SIVERC</span>
                  <span className="text-[7px]">SIVERC-{payment.transactionCode.slice(0, 6)}</span>
                </div>
              )}

              <div className="pt-3 text-center space-y-1 text-[8px]">
                <p>Obrigado pelo pagamento!</p>
                <p>Documento processado por computador.</p>
                <p>SIGAR MozTechWave Cloud</p>
              </div>
            </div>
          </div>
        )}

        {/* FORMAT: DIGITAL (MODERNO PARA CONSULTA E PARTILHA) */}
        {format === 'digital' && (
          <div className="p-6 sm:p-8 space-y-6 bg-slate-50 print:hidden">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Comprovativo Eletrônico Homologado
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      {receiptNumber}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {payment.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                  </span>
                  <p className="text-xs text-slate-500">Valor Total Liquidado</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Dados do Aluno</span>
                  <p className="text-sm font-bold text-slate-900">{payment.studentName}</p>
                  <p className="text-slate-600">Matrícula: {payment.studentCode}</p>
                  {payment.studentPhone && <p className="text-slate-600">Tel: {payment.studentPhone}</p>}
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Detalhes da Transação</span>
                  <p className="text-sm font-bold text-slate-900 uppercase">{payment.serviceItem}</p>
                  <p className="text-slate-600">Método: {payment.network} • Tx: {payment.transactionCode}</p>
                  <p className="text-slate-600">Emitido em: {payment.date} às {payment.time}</p>
                </div>
              </div>

              {isReprint && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                  <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Este recibo já possui <strong>{payment.reprintCount} reimpressão(ões)</strong> autorizada(s). A última foi em {payment.lastReprintedAt ? new Date(payment.lastReprintedAt).toLocaleString('pt-MZ') : 'data recente'}. O pagamento não foi duplicado.
                  </span>
                </div>
              )}

              {/* Action Buttons for Digital */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Enviar via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleCopyDigital}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto do Recibo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORMAT: NORMAL A4 CLÁSSICO (VIA DO ALUNO + VIA DA INSTITUIÇÃO) */}
        {format === 'normal' && (
          <div id="printable-receipt" className="p-6 sm:p-10 space-y-6 text-slate-800 print:p-4 print:space-y-4">
            
            {/* Banner de Reimpressão se aplicável */}
            {isReprint && (
              <div className="bg-amber-500 text-slate-900 px-4 py-1.5 rounded-lg text-center font-black text-xs uppercase tracking-widest border border-amber-600 shadow-xs">
                *** 2ª VIA - REIMPRESSÃO OFICIAL • AUTORIZADA SEM DUPLICAÇÃO DE CRÉDITO ***
              </div>
            )}

            {/* VIA 1: DO ALUNO */}
            <div className="space-y-4 pb-6 border-b-2 border-dashed border-slate-300">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                <span>República de Moçambique • SIVERC Homologado</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">1ª Via — Utente / Aluno</span>
              </div>

              {/* Institution Header */}
              <div className="flex items-center gap-4 pb-3 border-b border-slate-200">
                {activeInstitution.logoUrl ? (
                  <img 
                    src={activeInstitution.logoUrl} 
                    alt="Logo" 
                    className="w-14 h-14 object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                    {activeInstitution.code?.slice(0, 3) || 'SIG'}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                    {activeInstitution.name}
                  </h1>
                  <p className="text-xs text-slate-600">
                    {activeInstitution.address} • NUIT: {activeInstitution.nuit} • Telefone: {activeInstitution.phone}
                  </p>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 bg-slate-900 text-emerald-400 font-mono font-bold text-sm rounded-lg shadow-sm">
                    {receiptNumber}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    {payment.date} {payment.time}
                  </p>
                </div>
              </div>

              {/* Grid de Dados Aluno & Serviço */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[9px] font-bold uppercase text-slate-500">Dados do Aluno</span>
                  <p className="font-bold text-slate-900 text-sm">{payment.studentName}</p>
                  <p className="text-slate-600">Código de Matrícula: <strong>{payment.studentCode}</strong></p>
                  <p className="text-slate-600">Curso: {payment.courseName || 'Formação Geral'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[9px] font-bold uppercase text-slate-500">Liquidação & Operador</span>
                  <p className="font-bold text-slate-900 uppercase">{payment.serviceItem}</p>
                  <p className="text-slate-600">Método: <strong>{payment.network}</strong> (Tx: {payment.transactionCode})</p>
                  <p className="text-slate-600">Operador: {payment.reviewedBy || 'Tesouraria'}</p>
                </div>
              </div>

              {/* Tabela de Valor */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Serviço / Rubrica</th>
                      <th className="p-3 text-center">Referência Tx</th>
                      <th className="p-3 text-right">Valor Quitado (MZN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3">
                        <p className="font-bold uppercase text-slate-900">{payment.serviceItem}</p>
                        <p className="text-slate-500 text-[11px]">{payment.serviceDescription || serviceConfig?.description}</p>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-700">{payment.transactionCode}</td>
                      <td className="p-3 text-right font-mono font-black text-slate-900">
                        {payment.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-bold">
                    <tr>
                      <td colSpan={2} className="p-3 text-right uppercase text-xs">Total Pago:</td>
                      <td className="p-3 text-right font-mono text-base font-black text-emerald-400">
                        {payment.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Rodapé da Via 1: QR opcional e Assinatura */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                {showQrCode ? (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-900 text-white p-1 rounded-lg flex flex-col items-center justify-center">
                      <QrCode className="w-9 h-9 text-emerald-400" />
                      <span className="text-[6px] font-mono">SIVERC-OK</span>
                    </div>
                    <div className="text-[9px] text-slate-500">
                      <p className="font-bold text-slate-800">Autenticidade Fiscal Verificável</p>
                      <p className="font-mono">Hash: SIVERC-{payment.transactionCode.slice(0, 6)}-{payment.id.slice(-4).toUpperCase()}</p>
                      <p>siverc.gov.mz/validar-recibo</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-400 italic">
                    Chancela digital registrada nos servidores do SIGAR.
                  </div>
                )}

                <div className="text-center sm:text-right text-[9px] text-slate-500">
                  <div className="h-7 border-b border-slate-300 w-44 mb-1 mx-auto sm:ml-auto"></div>
                  <p className="font-bold text-slate-800 uppercase">Assinatura & Carimbo do Caixa</p>
                  <p>{payment.reviewedBy || 'Tesouraria'}</p>
                </div>
              </div>
            </div>

            {/* VIA 2: DA INSTITUIÇÃO / ARQUIVO */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                <span>{activeInstitution.name}</span>
                <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded">2ª Via — Arquivo Escolar / Tesouraria</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="font-bold text-slate-900 uppercase">
                    Recibo {receiptNumber} • {payment.studentName} ({payment.studentCode})
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Rubrica: {payment.serviceItem.toUpperCase()} • Modo: {payment.network} ({payment.transactionCode})
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-sm text-slate-900">
                    {payment.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                  </span>
                  <p className="text-[10px] text-slate-500">{payment.date}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
                <span>Documento arquivístico e fiscal nos termos do regulamento da instituição.</span>
                <div className="text-right">
                  <span>Visto do Responsável: ___________________________</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
