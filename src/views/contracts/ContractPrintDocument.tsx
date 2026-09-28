import React from 'react';
import { GeneratedContract, Institution } from '../../types';
import { ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

interface ContractPrintDocumentProps {
  contract: GeneratedContract;
  institution: Institution;
  onClose?: () => void;
  onPrint?: () => void;
  onSign?: (party: 'student' | 'director') => void;
}

export const ContractPrintDocument: React.FC<ContractPrintDocumentProps> = ({
  contract,
  institution,
  onClose,
  onPrint,
  onSign
}) => {
  const studentSig = contract.signatures?.student;
  const directorSig = contract.signatures?.director;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const getStatusBadge = () => {
    switch (contract.status) {
      case 'ativo':
        return { label: 'CONTRATO ATIVO / EM VIGÊNCIA', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'renovado':
        return { label: 'CONTRATO RENOVADO', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'encerrado':
        return { label: 'CONTRATO ENCERRADO / CONCLUÍDO', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'cancelado':
        return { label: 'CONTRATO RESCINDIDO / CANCELADO', color: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { label: 'DOCUMENTO OFICIAL', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior (Oculta na Impressão) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge.color}`}>
            {statusBadge.label}
          </span>
          <span className="text-xs font-mono text-slate-400">
            Ref: <strong className="text-white">{contract.referenceNumber}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(!contract.signedByStudent || !studentSig?.signed) && onSign && (
            <button
              onClick={() => onSign('student')}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
            >
              Assinar Formando
            </button>
          )}

          {(!contract.signedByDirector || !directorSig?.signed) && onSign && (
            <button
              onClick={() => onSign('director')}
              className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all"
            >
              Homologar Direção
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all"
          >
            <span>Imprimir / Exportar PDF</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Fechar
            </button>
          )}
        </div>
      </div>

      {/* Folha Oficial A4 Timbrada */}
      <div 
        id={`contract-sheet-${contract.id}`}
        className="bg-white text-slate-900 p-8 sm:p-12 md:p-16 rounded-2xl shadow-2xl max-w-4xl mx-auto font-serif print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none text-sm leading-relaxed"
      >
        {/* Cabeçalho Nacional Moçambicano */}
        <div className="text-center border-b-2 border-slate-900 pb-5 mb-8">
          <div className="text-[11px] font-sans font-black tracking-widest text-slate-700 uppercase">
            REPÚBLICA DE MOÇAMBIQUE
          </div>
          <div className="text-[11px] font-sans font-bold tracking-wider text-slate-600 uppercase mt-0.5">
            MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO
          </div>
          <div className="text-[10px] font-sans text-slate-500 uppercase">
            AUTORIDADE NACIONAL DE EDUCAÇÃO PROFISSIONAL (ANEP)
          </div>
          <div className="h-0.5 w-16 bg-slate-400 mx-auto my-2" />
          <h1 className="text-lg sm:text-xl font-sans font-black text-slate-950 tracking-tight uppercase">
            {institution.name}
          </h1>
          <p className="text-xs font-sans text-slate-600">
            {institution.address} • NUIT: {institution.nuit} • Contacto: {institution.phone}
          </p>
        </div>

        {/* Identificador Oficial do Documento */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200 font-sans text-xs">
          <div>
            <div className="text-slate-500 uppercase text-[10px] font-semibold">Número de Referência / Registo:</div>
            <div className="font-mono font-bold text-slate-950 text-sm">{contract.referenceNumber}</div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-slate-500 uppercase text-[10px] font-semibold">Modelo de Instrumento:</div>
            <div className="font-bold text-slate-900">{contract.templateName || 'Contrato de Formação'} ({contract.templateVersion || 'v1.0'})</div>
          </div>
        </div>

        {/* Título Principal */}
        <div className="text-center my-6">
          <h2 className="text-base sm:text-lg font-sans font-black text-slate-950 uppercase tracking-wide underline underline-offset-4 decoration-2">
            TERMO DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS
          </h2>
          <p className="text-xs text-slate-600 font-sans mt-1">
            Ano Letivo de 2026 • Formação Técnico-Profissional Certificada
          </p>
        </div>

        {/* Quadro de Resumo das Variáveis do Contrato */}
        <div className="mb-6 p-4 rounded-lg bg-slate-100 border border-slate-300 font-sans text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">1. Primeiro Outorgante (Instituição):</span>
            <span className="font-bold text-slate-900">{contract.institutionName || institution.name}</span>
            <span className="text-slate-600 block text-[11px]">Representada pelo Diretor: {contract.directorName || 'Direção Geral'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">2. Segundo Outorgante (Formando):</span>
            <span className="font-bold text-slate-900">{contract.studentName}</span>
            <span className="text-slate-600 block text-[11px]">Código: {contract.studentCode || 'N/A'} {contract.studentDocumentNumber ? `• Doc: ${contract.studentDocumentNumber}` : ''}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">3. Curso e Turma:</span>
            <span className="font-semibold text-slate-900">{contract.courseName} • {contract.classGroupName || 'Turma Regular'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">4. Carga Horária e Valor:</span>
            <span className="font-semibold text-slate-900">{contract.duration || '12 Meses'} • Valor: {contract.valueFormatted || `${contract.value} MT`}</span>
          </div>
        </div>

        {/* Corpo Textual das Cláusulas com Quebras de Linha Preservadas */}
        <div className="prose prose-slate max-w-none text-justify text-slate-800 leading-relaxed font-serif text-[13px] space-y-4 mb-10 whitespace-pre-wrap">
          {contract.content}
        </div>

        {/* Data e Localidade */}
        <div className="text-right font-sans text-xs text-slate-700 my-8">
          Maputo, {contract.date || new Date().toLocaleDateString('pt-MZ')}
        </div>

        {/* Bloco de Assinaturas e Carimbo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t-2 border-slate-800 font-sans">
          {/* Assinatura do Aluno */}
          <div className="text-center flex flex-col items-center justify-end min-h-[140px]">
            {studentSig?.signed ? (
              <div className="space-y-1 mb-2">
                {studentSig.signatureDataUrl ? (
                  <img 
                    src={studentSig.signatureDataUrl} 
                    alt="Rubrica do Aluno" 
                    className="h-14 max-w-[200px] object-contain mx-auto"
                  />
                ) : (
                  <div className="font-serif italic text-lg text-slate-800 border-b border-slate-400 px-6 py-1">
                    {studentSig.signerName || contract.studentName}
                  </div>
                )}
                <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Assinado Digitalmente ({studentSig.signedAt || '2026'})</span>
                </div>
              </div>
            ) : (
              <div className="h-14 flex items-center justify-center border-b border-dashed border-slate-400 w-full mb-2">
                <span className="text-xs text-slate-400 italic">Pendente de assinatura do formando</span>
              </div>
            )}
            <div className="font-bold text-slate-950 text-xs uppercase tracking-wide">
              {contract.studentName}
            </div>
            <div className="text-[11px] text-slate-600">
              O Segundo Outorgante (Formando)
            </div>
          </div>

          {/* Assinatura da Direção com Carimbo Oficial */}
          <div className="text-center flex flex-col items-center justify-end min-h-[140px] relative">
            {/* Carimbo SIVEC em overlay sutil */}
            <div className="absolute top-0 right-4 pointer-events-none opacity-85">
              <div className="border-2 border-rose-800 rounded-full w-24 h-24 flex flex-col items-center justify-center text-rose-800 rotate-[-12deg] p-1 shadow-xs">
                <span className="text-[7px] font-black uppercase text-center leading-tight">
                  REPÚBLICA DE MOÇAMBIQUE
                </span>
                <span className="text-[8px] font-black uppercase tracking-tighter my-0.5">
                  ★ HOMOLOGADO ★
                </span>
                <span className="text-[7px] font-bold text-center">
                  DIREÇÃO GERAL
                </span>
              </div>
            </div>

            {directorSig?.signed ? (
              <div className="space-y-1 mb-2 z-10">
                {directorSig.signatureDataUrl ? (
                  <img 
                    src={directorSig.signatureDataUrl} 
                    alt="Rubrica da Direção" 
                    className="h-14 max-w-[200px] object-contain mx-auto"
                  />
                ) : (
                  <div className="font-serif italic text-lg text-slate-900 border-b border-slate-400 px-6 py-1">
                    {directorSig.signerName || contract.directorName || 'Eng. Paulo Jafim'}
                  </div>
                )}
                <div className="flex items-center justify-center gap-1 text-[11px] text-blue-800 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Homologação e Carimbo Oficial ({directorSig.signedAt || '2026'})</span>
                </div>
              </div>
            ) : (
              <div className="h-14 flex items-center justify-center border-b border-dashed border-slate-400 w-full mb-2">
                <span className="text-xs text-slate-400 italic">Pendente de homologação institucional</span>
              </div>
            )}
            <div className="font-bold text-slate-950 text-xs uppercase tracking-wide">
              {contract.directorName || 'Eng. Paulo Jafim'}
            </div>
            <div className="text-[11px] text-slate-600">
              Pelo Primeiro Outorgante (Direção Geral)
            </div>
          </div>
        </div>

        {/* Rodapé Legal com Código de Validação */}
        <div className="mt-12 pt-4 border-t border-slate-200 font-sans flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-slate-700" />
            <div>
              <div className="font-mono font-bold text-slate-800">HASH: SIGAR-LEG-{contract.id.toUpperCase()}</div>
              <div>Documento digital autêntico registado na base central de Moçambique.</div>
            </div>
          </div>
          <div className="text-right">
            <div>Página 1 de 1 • Emitido pelo SIGAR Acadêmico</div>
            <div className="font-medium text-slate-700">Art. 42 da Lei nº 23/2014 do Ensino Técnico Profissional</div>
          </div>
        </div>
      </div>
    </div>
  );
};
