import React, { useMemo } from 'react';
import { Printer, Building, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { ContaReceber, Course, FinancialSettings, Institution, Student } from '../../types';
import { RealQRCode } from '../../components/common/RealQRCode';
import { printIsolatedElement } from '../../utils/printHelper';

interface CarnetA4PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  institution: Institution;
  financialSettings: FinancialSettings;
  receivables: ContaReceber[];
  courses: Course[];
}

interface CarnetParcelItem {
  id: string;
  parcelLabel: string;
  description: string;
  dueDate: string;
  baseAmount: number;
  fineAndInterest: number;
  totalAmount: number;
  status: 'pago' | 'pendente' | 'atrasado' | 'parcial';
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const CarnetA4PrintModal: React.FC<CarnetA4PrintModalProps> = ({
  isOpen,
  onClose,
  student,
  institution,
  financialSettings,
  receivables,
  courses
}) => {
  const parcels = useMemo<CarnetParcelItem[]>(() => {
    if (!student) return [];

    const studentReceivables = receivables
      .filter(
        r =>
          (r.studentId === student.id ||
            (r.studentCode && student.code && r.studentCode.toUpperCase() === student.code.toUpperCase())) &&
          r.status !== 'cancelado'
      )
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

    if (studentReceivables.length > 0) {
      return studentReceivables.map((r, idx) => {
        const base = Number(r.amount || 0);
        const fine = Number(r.fine || 0) + Number(r.interest || 0);
        const total = Number(r.totalAmount ?? base + fine - Number(r.discount || 0));
        return {
          id: r.id,
          parcelLabel: r.installmentNumber || `${String(idx + 1).padStart(2, '0')}/${String(studentReceivables.length).padStart(2, '0')}`,
          description: r.description || r.title || 'Mensalidade / Propina Escolar',
          dueDate: r.dueDate || '—',
          baseAmount: base,
          fineAndInterest: fine,
          totalAmount: Math.max(0, total - Number(r.paidAmount || 0)),
          status: r.status === 'pago' ? 'pago' : r.status === 'atrasado' ? 'atrasado' : r.status === 'parcial' ? 'parcial' : 'pendente'
        };
      });
    }

    // Fallback estruturado com base na mensalidade real do curso e dia de vencimento da instituição
    const course = courses.find(
      c => c.id === student.courseId || c.name?.toLowerCase() === student.courseName?.toLowerCase()
    );
    const monthlyFee = Number(course?.monthlyFee ?? course?.feeMonthly ?? 0);
    const dueDay = String(financialSettings?.dueDay || 10).padStart(2, '0');
    const baseYear = new Date().getFullYear();
    const startMonthIdx = new Date().getMonth();

    return Array.from({ length: 6 }, (_, i) => {
      const mIdx = (startMonthIdx + i) % 12;
      const y = baseYear + Math.floor((startMonthIdx + i) / 12);
      const dueIso = `${y}-${String(mIdx + 1).padStart(2, '0')}-${dueDay}`;
      return {
        id: `preview-parcel-${i + 1}`,
        parcelLabel: `${String(i + 1).padStart(2, '0')}/06`,
        description: `Propina ${MONTH_NAMES[mIdx]} ${y} (${student.courseName || 'Formação'})`,
        dueDate: dueIso,
        baseAmount: monthlyFee,
        fineAndInterest: 0,
        totalAmount: monthlyFee,
        status: 'pendente'
      };
    });
  }, [student, receivables, courses, financialSettings?.dueDay]);

  if (!isOpen || !student) return null;

  const mpesaInfo = financialSettings?.mpesaNumber || financialSettings?.pixKey || 'Configurar M-Pesa na Tesouraria';
  const emolaInfo = financialSettings?.emolaNumber || '';
  const staticQrUrl = institution?.carnetStaticQrUrl;
  const verifyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify?card=${encodeURIComponent(student.code)}&inst=${encodeURIComponent(institution.id)}`
      : student.code;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-slate-200 my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Carnê de Propinas &amp; Mensalidades (Folha A4)
            </h3>
            <p className="text-xs text-slate-500">
              {parcels.length} parcela(s) de {student.fullName} ({student.code}) • Canhoto destacável + QR Code
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printIsolatedElement('carnet-a4-print-root', `Carnê A4 - ${student.fullName}`)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Carnê A4
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div id="carnet-a4-print-root" className="space-y-6 relative bg-white text-slate-900 p-2">
          {institution?.showWatermarkOnReports && (
            <div className="pointer-events-none select-none fixed inset-0 flex items-center justify-center opacity-[0.04] rotate-[-25deg]">
              <span className="text-6xl font-black uppercase tracking-widest text-slate-900">
                {institution.shortName || institution.name}
              </span>
            </div>
          )}

          {parcels.map(parcel => (
            <div
              key={parcel.id}
              className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/40 break-inside-avoid grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch"
            >
              {/* Canhoto da Escola */}
              <div className="md:col-span-4 bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2 md:border-r-2 md:border-r-dashed">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                    Canhoto da Instituição • Parcela {parcel.parcelLabel}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">{institution.name}</h4>
                  <p className="text-[10px] text-slate-500">NUIT: {institution.nuit || 'N/A'}</p>
                </div>

                <div className="text-[11px] space-y-1 border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Formando</span>
                    <span className="font-bold text-slate-900">{student.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-slate-600">{student.code}</span>
                    <span className="font-mono font-bold text-rose-700 text-[10px]">Venc: {parcel.dueDate}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[10px]">Valor:</span>
                  <span className="font-black text-slate-900">{parcel.totalAmount.toLocaleString('pt-MZ')} MTn</span>
                </div>
              </div>

              {/* Guia Principal do Encarregado / Aluno */}
              <div className="md:col-span-8 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-start border-b border-slate-200 pb-2.5 gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 text-sm">{institution.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {parcel.description} • Parcela {parcel.parcelLabel}
                    </p>
                  </div>

                  <div className={`text-right px-3 py-1 rounded-lg border ${
                    parcel.status === 'pago'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <span className="text-[9px] font-bold uppercase block">
                      {parcel.status === 'pago' ? 'LIQUIDADO' : 'VALOR A PAGAR'}
                    </span>
                    <span className="text-sm font-black">
                      {parcel.totalAmount.toLocaleString('pt-MZ')} MTn
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Matrícula</span>
                    <strong className="font-mono text-slate-800">{student.code}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Curso</span>
                    <strong className="text-slate-800 truncate block">{student.courseName || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Vencimento</span>
                    <strong className="text-rose-600 font-mono">{parcel.dueDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Multa / Juros</span>
                    <span className="text-slate-700 font-medium">
                      +{financialSettings?.fineAmount || 0} MT + {financialSettings?.interestRateDaily || 0}%/dia
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="space-y-1 text-[11px] text-slate-700 flex-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      Canais Moçambique:
                    </div>
                    <p className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-800">
                      M-Pesa: <strong>{mpesaInfo}</strong>
                      {emolaInfo ? ` • e-Mola: ${emolaInfo}` : ''}
                    </p>
                    {financialSettings?.bankInfo && (
                      <p className="text-[10px] text-slate-600 truncate">
                        Banco: {financialSettings.bankInfo}
                      </p>
                    )}
                    {parcel.status === 'pago' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Parcela Confirmada
                      </span>
                    )}
                  </div>

                  <div className="text-center shrink-0">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center">
                      {staticQrUrl ? (
                        <img src={staticQrUrl} alt="QR Pagamento" className="w-full h-full object-contain" />
                      ) : (
                        <RealQRCode value={verifyUrl} size={54} />
                      )}
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                      {staticQrUrl ? 'QR PAGAMENTO' : 'VERIFICAR'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {institution?.showSignatureOnDocs !== false && (institution?.signatoryName || institution?.representativeName) && (
            <div className="pt-4 flex justify-end text-center text-xs">
              <div className="w-64 border-t border-slate-400 pt-1.5">
                <div className="font-bold text-slate-900">
                  {institution.signatoryName || institution.representativeName}
                </div>
                <div className="text-[10px] text-slate-500">
                  {institution.signatoryRole || institution.representativeRole || 'Tesouraria / Direção'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
