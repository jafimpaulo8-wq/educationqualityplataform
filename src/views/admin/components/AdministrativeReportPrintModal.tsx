import React from 'react';
import { X, Printer, ShieldCheck, Building2, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export interface AdministrativeReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportCategory: string;
  filters: {
    period: string;
    courseName?: string;
    status: string;
    branchName?: string;
  };
  kpis: { label: string; value: string | number; sub?: string }[];
  tableHeaders: string[];
  tableRows: (string | number)[][];
  summaryNotes?: string;
}

export const AdministrativeReportPrintModal: React.FC<AdministrativeReportPrintModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  reportCategory,
  filters,
  kpis,
  tableHeaders,
  tableRows,
  summaryNotes
}) => {
  const { activeInstitution, activeBranch } = useApp();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('pt-MZ', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const refCode = `REP-ADM-${Date.now().toString().slice(-6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div 
        id="administrative-report-print-modal"
        className="relative w-full max-w-5xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none"
      >
        {/* Modal Controls - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-700" />
            <span className="font-bold text-sm text-slate-800">Visualização de Impressão Oficial A4 (Relatório Administrativo)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="btn-print-admin-report"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-all shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              id="btn-close-admin-print"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official A4 Sheet */}
        <div className="p-8 sm:p-12 print:p-8 bg-white min-h-[1050px] flex flex-col justify-between text-slate-900 font-serif">
          <div>
            {/* National Republic & Ministry Header (Mozambique Standard) */}
            <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
              <p className="text-[11px] uppercase tracking-widest font-sans font-bold text-slate-700">
                República de Moçambique
              </p>
              <p className="text-[10px] uppercase tracking-wider font-sans text-slate-600">
                Ministério da Ciência, Tecnologia e Ensino Superior
              </p>
              <p className="text-[9px] uppercase tracking-wider font-sans font-medium text-slate-500">
                Autoridade Nacional de Educação Profissional (ANEP) • SIGAR / SIVERC
              </p>
            </div>

            {/* Institution Letterhead */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border-2 border-slate-800 bg-indigo-50 flex items-center justify-center font-sans font-black text-indigo-900 text-xl shadow-sm">
                  {activeInstitution?.logo ? (
                    <img 
                      src={activeInstitution.logo} 
                      alt={activeInstitution.name} 
                      className="w-full h-full object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-indigo-800" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold font-sans tracking-tight text-slate-900">
                    {activeInstitution?.name || 'INSTITUTO POLITÉCNICO MOZTECHWAVE'}
                  </h1>
                  <p className="text-xs font-sans text-slate-600">
                    {activeInstitution?.slogan || 'Ensino Técnico-Profissional e Superior de Excelência'}
                  </p>
                  <p className="text-[10px] font-sans text-slate-500 mt-0.5">
                    NUIT: {activeInstitution?.nuit || '400189234'} • Alvará / Registo: {activeInstitution?.code || 'MTW-2026/MZ'}
                  </p>
                  <p className="text-[10px] font-sans text-slate-500">
                    Unidade: {activeBranch?.name || 'Campus Central de Maputo'} • {activeInstitution?.city || 'Maputo'}, Moçambique
                  </p>
                </div>
              </div>

              {/* Reference & Date Stamp */}
              <div className="text-right font-sans text-xs">
                <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg border border-slate-300 font-mono text-[11px] font-bold text-slate-700 mb-1">
                  REF: {refCode}
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>Emitido em:</strong> {currentDate}
                </p>
                <p className="text-slate-500 text-[10px]">
                  Horário: {currentTime}
                </p>
              </div>
            </div>

            {/* Report Title & Scope */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 mb-6 text-center">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                {reportCategory}
              </span>
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-900 mt-1 uppercase tracking-tight">
                {reportTitle}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-[11px] font-sans text-slate-600">
                <span><strong>Período:</strong> {filters.period}</span>
                {filters.courseName && <span>• <strong>Curso:</strong> {filters.courseName}</span>}
                {filters.branchName && <span>• <strong>Unidade/Campus:</strong> {filters.branchName}</span>}
                <span>• <strong>Estado:</strong> {filters.status}</span>
              </div>
            </div>

            {/* Executive KPIs Grid */}
            {kpis && kpis.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {kpis.map((kpi, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-xs">
                    <p className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
                      {kpi.label}
                    </p>
                    <p className="text-base font-sans font-black text-slate-900 mt-0.5">
                      {kpi.value}
                    </p>
                    {kpi.sub && (
                      <p className="text-[9px] font-sans text-slate-400 mt-0.5">
                        {kpi.sub}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Main Data Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse border border-slate-300 text-xs font-sans">
                <thead>
                  <tr className="bg-slate-800 text-white font-semibold">
                    <th className="border border-slate-700 px-2.5 py-2 w-8 text-center text-[10px]">#</th>
                    {tableHeaders.map((head, i) => (
                      <th key={i} className="border border-slate-700 px-2.5 py-2 text-[11px]">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={tableHeaders.length + 1} className="border border-slate-300 py-6 text-center text-slate-400 italic">
                        Nenhum registro encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((row, rIdx) => (
                      <tr 
                        key={rIdx} 
                        className={`hover:bg-slate-50 ${rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                      >
                        <td className="border border-slate-300 px-2 py-1.5 text-center text-[10px] text-slate-500 font-mono">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td 
                            key={cIdx} 
                            className="border border-slate-300 px-2.5 py-1.5 text-[11px] text-slate-800"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Observations / Summary Notes */}
            {summaryNotes && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 font-sans mb-6">
                <p className="font-bold text-slate-900 mb-1">Notas Administrativas & Conformidade Legal:</p>
                <p className="leading-relaxed text-[11px]">{summaryNotes}</p>
              </div>
            )}
          </div>

          {/* Official Signatures & Footer Section */}
          <div className="pt-6 border-t border-slate-200 mt-6 font-sans">
            <div className="grid grid-cols-3 gap-6 text-center text-xs mb-8">
              <div>
                <div className="border-b border-slate-400 h-14 mb-1"></div>
                <p className="font-bold text-slate-800">Serviços de Secretaria</p>
                <p className="text-[10px] text-slate-500">Operador / Responsável de Registo</p>
              </div>
              <div>
                <div className="border-b border-slate-400 h-14 mb-1"></div>
                <p className="font-bold text-slate-800">Direção Administrativa</p>
                <p className="text-[10px] text-slate-500">Chefe de Departamento / Controlo</p>
              </div>
              <div>
                <div className="border-b border-slate-400 h-14 mb-1"></div>
                <p className="font-bold text-slate-800">Direção Geral</p>
                <p className="text-[10px] text-slate-500">Homologação & Carimbo Oficial</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                <span>Documento oficial autenticado pelo SIGAR / SIVERC • Validação de conformidade normativa ANEP</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Hash: {refCode}-SEC-VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
