import React from 'react';
import { Printer, X, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CalculationFormula, EvaluationItem, StudentCalculatedGrade } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface OfficialGradesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  classGroupName: string;
  disciplineName: string;
  periodName: string;
  formula: CalculationFormula;
  teacherName: string;
  grades: StudentCalculatedGrade[];
}

export const OfficialGradesheetModal: React.FC<OfficialGradesheetModalProps> = ({
  isOpen,
  onClose,
  classGroupName,
  disciplineName,
  periodName,
  formula,
  teacherName,
  grades
}) => {
  const { activeInstitution } = useApp();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const total = grades.length;
  const dispensados = grades.filter(g => g.status === 'Dispensado').length;
  const aprovados = grades.filter(g => g.status === 'Aprovado').length;
  const recursos = grades.filter(g => g.status === 'Recurso').length;
  const reprovados = grades.filter(g => g.status === 'Reprovado').length;
  const avg = total > 0 ? (grades.reduce((a, b) => a + b.finalScore, 0) / total).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col my-8 border border-slate-300 print:m-0 print:border-none print:shadow-none print:max-w-none">
        {/* Action Header - Hidden on Print */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold">Visualização da Pauta Oficial de Avaliações (Timbre SIGAR)</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Pauta Oficial</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 space-y-6 text-slate-900 bg-white" id="official-gradesheet-print">
          {/* Mozambican Official Letterhead */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 font-serif">
              REP.MZ
            </div>
            <h1 className="text-sm font-black uppercase tracking-widest font-serif text-slate-900">
              República de Moçambique
            </h1>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ministério da Ciência, Tecnologia e Ensino Superior / Educação Profissional
            </h2>
            <h3 className="text-base font-black uppercase text-indigo-900 mt-1">
              {activeInstitution.name}
            </h3>
            <p className="text-[11px] text-slate-600">
              Sistema Integrado de Gestão Acadêmica e Registo (SIGAR) • {activeInstitution.city}, Moçambique
            </p>
          </div>

          {/* Gradesheet Title & Scope */}
          <div className="text-center space-y-1 py-1">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 underline underline-offset-4">
              Pauta Oficial de Aproveitamento &amp; Avaliação Final
            </h4>
            <p className="text-xs text-slate-600 font-medium">Ano Letivo 2026 • Regime Semestral Modular</p>
          </div>

          {/* Context Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Turma:</span>
              <strong className="text-slate-900">{classGroupName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Disciplina / Módulo:</span>
              <strong className="text-slate-900">{disciplineName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Período:</span>
              <strong className="text-slate-900">{periodName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Docente Responsável:</span>
              <strong className="text-slate-900">{teacherName}</strong>
            </div>
          </div>

          {/* Applied Formula Info */}
          <div className="text-xs p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>Fórmula de Cálculo Homologada: </strong> {formula.name}
            </span>
            <span className="font-mono text-[11px]">
              (Escala: 0 a 20v • Dispensa: ≥{formula.examExemptionScore}v • Aprovação: ≥{formula.minPassingScore}v • Recurso: ≥{formula.recourseMinScore || 7.0}v)
            </span>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 w-10 text-center border-r border-slate-300">Nº</th>
                  <th className="p-2.5 w-28 border-r border-slate-300">Código</th>
                  <th className="p-2.5 border-r border-slate-300">Nome Completo do Estudante</th>
                  {formula.components.map(comp => (
                    <th key={comp.id} className="p-2.5 text-center border-r border-slate-300 font-mono">
                      {comp.label || comp.type}
                      <span className="block text-[9px] text-slate-500">({comp.weight}%)</span>
                    </th>
                  ))}
                  <th className="p-2.5 w-24 text-center border-r border-slate-300 bg-slate-200/70 font-mono">
                    Nota Final
                    <span className="block text-[9px] text-slate-500">(0 a 20v)</span>
                  </th>
                  <th className="p-2.5 w-32 text-center">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {grades.map((item, idx) => {
                  return (
                    <tr key={item.studentId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="p-2 font-mono text-[11px] text-slate-600 border-r border-slate-200">
                        {item.studentCode}
                      </td>
                      <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">
                        {item.studentName}
                      </td>
                      {formula.components.map(comp => {
                        const compData = item.componentScores[comp.type];
                        const val = compData ? compData.averageScore : 0;
                        return (
                          <td key={comp.id} className="p-2 text-center font-mono font-semibold text-slate-800 border-r border-slate-200">
                            {val.toFixed(1)}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center font-mono font-black text-slate-950 border-r border-slate-200 bg-slate-100/60">
                        {item.finalScore.toFixed(1)}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Dispensado' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.status === 'Aprovado'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'Recurso'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Statistical Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs p-3 rounded-xl bg-slate-100 border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Formandos</span>
              <strong className="text-slate-900 text-sm">{total}</strong>
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 uppercase block font-bold">Dispensados</span>
              <strong className="text-emerald-700 text-sm">{dispensados}</strong>
            </div>
            <div>
              <span className="text-[10px] text-blue-700 uppercase block font-bold">Aprovados</span>
              <strong className="text-blue-700 text-sm">{aprovados}</strong>
            </div>
            <div>
              <span className="text-[10px] text-amber-700 uppercase block font-bold">Em Recurso</span>
              <strong className="text-amber-700 text-sm">{recursos}</strong>
            </div>
            <div>
              <span className="text-[10px] text-rose-700 uppercase block font-bold">Reprovados</span>
              <strong className="text-rose-700 text-sm">{reprovados}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 uppercase block font-bold">Média da Pauta</span>
              <strong className="text-slate-900 text-sm">{avg}v</strong>
            </div>
          </div>

          {/* Signatures and Validation Term */}
          <div className="pt-8 space-y-10">
            <p className="text-[11px] text-slate-600 italic text-center">
              A presente pauta foi elaborada, conferida e apurada em conformidade com o Regulamento Acadêmico e Pedagógico em vigor.
            </p>

            <div className="grid grid-cols-3 gap-6 text-center text-xs pt-4">
              <div className="space-y-12">
                <div className="border-b border-slate-800 pb-1 w-4/5 mx-auto" />
                <div>
                  <p className="font-bold text-slate-900">{teacherName}</p>
                  <p className="text-[10px] text-slate-500 uppercase">O Docente da Disciplina</p>
                </div>
              </div>

              <div className="space-y-12">
                <div className="border-b border-slate-800 pb-1 w-4/5 mx-auto" />
                <div>
                  <p className="font-bold text-slate-900">Coordenação Pedagógica</p>
                  <p className="text-[10px] text-slate-500 uppercase">Visto &amp; Homologado</p>
                </div>
              </div>

              <div className="space-y-12">
                <div className="border-b border-slate-800 pb-1 w-4/5 mx-auto" />
                <div>
                  <p className="font-bold text-slate-900">A Direcção da Instituição</p>
                  <p className="text-[10px] text-slate-500 uppercase">Assinatura &amp; Carimbo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
