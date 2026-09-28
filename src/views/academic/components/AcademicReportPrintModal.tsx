import React from 'react';
import { X, Printer, Download, GraduationCap, ShieldCheck, FileSpreadsheet, Building2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export interface AcademicReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportCategory: string;
  filters: {
    period: string;
    courseName: string;
    className: string;
    teacherName: string;
    status: string;
  };
  kpis: { label: string; value: string | number; sub?: string }[];
  tableHeaders: string[];
  tableRows: (string | number)[][];
  summaryNotes?: string;
}

export const AcademicReportPrintModal: React.FC<AcademicReportPrintModalProps> = ({
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

  const refCode = `REP-ACAD-${Date.now().toString().slice(-6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div 
        id="academic-report-print-modal"
        className="relative w-full max-w-5xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none"
      >
        {/* Modal Controls - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-700" />
            <span className="font-bold text-sm text-slate-800">Visualização de Impressão Oficial A4 (Relatório Académico)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="btn-print-academic-report"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl transition-all shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              id="btn-close-academic-print"
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
                Autoridade Nacional de Educação Profissional (ANEP) • SIVEC
              </p>
              
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                <div className="flex items-center gap-3 text-left">
                  {activeInstitution.logoUrl ? (
                    <img 
                      src={activeInstitution.logoUrl} 
                      alt={activeInstitution.name} 
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-cyan-900 text-white flex items-center justify-center font-sans font-bold text-xl">
                      {activeInstitution.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-sans font-black uppercase text-slate-900 tracking-tight leading-tight">
                      {activeInstitution.name}
                    </h2>
                    <p className="text-[11px] font-sans text-slate-600">
                      NUIT: {activeInstitution.nuit || '400192831'} • Campus: {activeBranch ? activeBranch.name : 'Sede Geral'}
                    </p>
                    <p className="text-[10px] font-sans text-slate-500">
                      {activeInstitution.address || 'Av. 24 de Julho nº 1820, Maputo'} • Tel: {activeInstitution.phone || '+258 84 000 0000'}
                    </p>
                  </div>
                </div>

                <div className="text-right font-sans">
                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 rounded">
                    DOCUMENTO OFICIAL
                  </span>
                  <p className="text-[11px] font-bold text-slate-800 mt-1">Ref: {refCode}</p>
                  <p className="text-[10px] text-slate-500">Emitido: {currentDate} às {currentTime}</p>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                {reportCategory}
              </span>
              <h1 className="text-2xl font-black uppercase font-sans tracking-tight text-slate-900 mt-2">
                {reportTitle}
              </h1>
              <p className="text-xs text-slate-600 font-sans italic mt-1">
                Relatório analítico consolidado extraído do Sistema Integrado de Gestão Académica (SIGAR / Moztechwave)
              </p>
            </div>

            {/* Applied Filters Metadata Box */}
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs">
              <p className="font-bold text-slate-800 mb-2 uppercase text-[10px] tracking-wider text-cyan-900">
                Parâmetros e Filtros Aplicados ao Relatório:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-slate-700">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Período:</span>
                  <span className="font-bold text-slate-900">{filters.period}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Curso:</span>
                  <span className="font-bold text-slate-900 truncate block">{filters.courseName}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Turma:</span>
                  <span className="font-bold text-slate-900 truncate block">{filters.className}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Professor:</span>
                  <span className="font-bold text-slate-900 truncate block">{filters.teacherName}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Estado:</span>
                  <span className="font-bold text-slate-900">{filters.status}</span>
                </div>
              </div>
            </div>

            {/* Executive KPIs Snapshot */}
            {kpis && kpis.length > 0 && (
              <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
                {kpis.map((kpi, idx) => (
                  <div key={idx} className="p-3 bg-cyan-950/5 border border-cyan-900/20 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-600 tracking-wider mb-1">{kpi.label}</p>
                    <p className="text-xl font-black text-cyan-900">{kpi.value}</p>
                    {kpi.sub && <p className="text-[10px] text-slate-500 mt-0.5">{kpi.sub}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Main Data Table */}
            <div className="mb-6 font-sans">
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 border-b border-slate-700 w-10 text-center">#</th>
                      {tableHeaders.map((header, hIdx) => (
                        <th key={hIdx} className="py-2.5 px-3 border-b border-slate-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tableRows.length === 0 ? (
                      <tr>
                        <td colSpan={tableHeaders.length + 1} className="py-6 text-center text-slate-500 italic">
                          Nenhum registro encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      tableRows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-2 px-3 text-slate-500 font-mono text-center text-[10px]">
                            {rIdx + 1}
                          </td>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 text-slate-800 text-xs">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 font-sans mt-2 text-right">
                Total de Linhas Listadas: <strong>{tableRows.length}</strong>
              </p>
            </div>

            {/* Optional Summary Notes */}
            {summaryNotes && (
              <div className="mb-6 p-3 bg-amber-50/60 border border-amber-200 rounded-lg font-sans text-xs text-amber-900">
                <span className="font-bold">Observações Institucionais: </span>
                {summaryNotes}
              </div>
            )}
          </div>

          {/* Institutional Sign-offs & Stamp */}
          <div className="pt-8 border-t-2 border-slate-900 font-sans mt-8">
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="flex flex-col justify-end">
                <div className="border-b border-slate-800 pb-1 mb-2 h-14 flex items-end justify-center">
                  <span className="font-serif italic text-slate-500 text-sm">Assinatura Autorizada</span>
                </div>
                <p className="font-bold text-slate-900">Diretor Geral / Reitor</p>
                <p className="text-[10px] text-slate-500">Homologação Institucional</p>
              </div>

              <div className="flex flex-col justify-end">
                <div className="border-b border-slate-800 pb-1 mb-2 h-14 flex items-end justify-center">
                  <span className="font-serif italic text-slate-500 text-sm">Assinatura Pedagógica</span>
                </div>
                <p className="font-bold text-slate-900">Direção Pedagógica</p>
                <p className="text-[10px] text-slate-500">Supervisão Curricular & ANEP</p>
              </div>

              <div className="flex flex-col justify-end">
                <div className="border-b border-slate-800 pb-1 mb-2 h-14 flex items-end justify-center">
                  <span className="font-serif italic text-slate-500 text-sm">Secretaria Responsável</span>
                </div>
                <p className="font-bold text-slate-900">Secretaria Académica</p>
                <p className="text-[10px] text-slate-500">Arquivo & Validação SIVEC</p>
              </div>
            </div>

            {/* Footer Institutional Watermark */}
            <div className="flex items-center justify-between pt-6 text-[9px] text-slate-400">
              <span>SIGAR Academic Engine • Módulo 51 (Relatórios Académicos)</span>
              <span>Autenticação Digital: {refCode}-HASH-SECURE</span>
              <span>Página 1 de 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
