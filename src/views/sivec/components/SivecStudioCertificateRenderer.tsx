import React from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  ExternalLink, 
  CheckCircle2, 
  Award, 
  FileCheck, 
  Printer, 
  Building2, 
  Calendar, 
  Clock, 
  Hash, 
  User, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { SivecStudioDocumentRecord } from '../types';
import { SIVEC_LEGAL_MANDATE } from '../mockSivecData';
import { SIVEC_VISUAL_PRESERVATION_DISCLAIMER } from '../sivecStudioStorage';

interface Props {
  document: SivecStudioDocumentRecord;
  mode: 'original' | 'sivec_version' | 'side_by_side';
  qrDataUrl?: string;
  onPrint?: () => void;
}

export const SivecStudioCertificateRenderer: React.FC<Props> = ({
  document,
  mode,
  qrDataUrl,
  onPrint
}) => {
  const { extracted, registration, original, sivecVersion } = document;

  // Renderizador da Versão Original
  const renderOriginalView = () => {
    return (
      <div className="bg-slate-950 border border-slate-700 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        {/* Banner do Original Intacto */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-black tracking-wider uppercase font-mono flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              ORIGINAL PRESERVADO INTACTO
            </span>
            <span className="text-[11px] text-slate-400">
              Capturado em {original.capturedAt}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono block">Hash SHA-256 Original</span>
            <span className="text-[10px] text-slate-300 font-mono">
              {original.sha256Hash ? original.sha256Hash.slice(0, 20) + '...' + original.sha256Hash.slice(-12) : 'calculando...'}
            </span>
          </div>
        </div>

        {/* Quadro Visual do Certificado Original (Layout Institucional Nativo) */}
        <div className="bg-[#FAF8F5] text-slate-900 rounded-2xl p-6 sm:p-10 border-4 border-amber-900/20 relative shadow-inner">
          {/* Marca d'água de segurança de fundo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <Building2 className="w-96 h-96 text-slate-800" />
          </div>

          <div className="relative z-10 text-center space-y-5">
            {/* Cabeçalho Institucional Original */}
            <div className="border-b-2 border-amber-950/20 pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-950/10 text-amber-950 mb-2 font-serif font-black text-xl">
                🏛️
              </div>
              <h2 className="text-lg sm:text-2xl font-serif font-bold text-amber-950 uppercase tracking-wide">
                {extracted.institutionName || 'INSTITUIÇÃO DE ENSINO SUPERIOR E TÉCNICO'}
              </h2>
              {extracted.institutionNuit && (
                <p className="text-xs font-mono text-slate-600 mt-0.5">
                  NUIT: {extracted.institutionNuit} • Registo Notarial Académico
                </p>
              )}
            </div>

            {/* Título do Documento */}
            <div className="pt-2">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold block">
                DOCUMENTO ACADÉMICO OFICIAL
              </span>
              <h3 className="text-xl sm:text-3xl font-serif font-black text-slate-900 mt-1 uppercase tracking-tight">
                CERTIFICADO DE HABILITAÇÃO & CONCLUSÃO
              </h3>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Certificado nº <strong className="text-slate-900">{extracted.certificateNumber}</strong>
              </p>
            </div>

            {/* Texto Formal de Concessão */}
            <div className="py-4 text-xs sm:text-sm text-slate-800 leading-relaxed max-w-2xl mx-auto space-y-3 font-serif">
              <p>
                Certifica-se, nos termos das disposições estatutárias e regulamentos em vigor, que o(a) estudante:
              </p>
              
              <div className="py-2 bg-amber-50/80 rounded-xl border border-amber-900/10 px-4">
                <p className="text-base sm:text-xl font-sans font-black text-slate-950 tracking-wide uppercase">
                  {extracted.studentName || 'NOME DO ESTUDANTE'}
                </p>
                {extracted.studentDocument && (
                  <p className="text-xs font-mono text-slate-600 mt-0.5">
                    Portador(a) do {extracted.studentDocument}
                  </p>
                )}
              </div>

              <p>
                Concluiu com pleno aproveitamento o plano curricular do curso de:
              </p>

              <p className="text-sm sm:text-base font-sans font-bold text-amber-950 uppercase">
                {extracted.courseName}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono pt-2 text-slate-700">
                {extracted.durationHours > 0 && (
                  <span className="bg-white/80 px-3 py-1 rounded-lg border border-slate-300">
                    Carga Horária: <strong>{extracted.durationHours} Horas Letivas</strong>
                  </span>
                )}
                {extracted.finalGrade && (
                  <span className="bg-white/80 px-3 py-1 rounded-lg border border-slate-300">
                    Classificação: <strong>{extracted.finalGrade}</strong>
                  </span>
                )}
                {extracted.issueDate && (
                  <span className="bg-white/80 px-3 py-1 rounded-lg border border-slate-300">
                    Data: <strong>{extracted.issueDate}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Assentos Notariais Tradicionais */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-500 border-t border-b border-amber-950/10 py-2">
              <div>Livro: <strong className="text-slate-800">{extracted.bookNumber || 'L-01'}</strong></div>
              <div>Folha: <strong className="text-slate-800">{extracted.sheetNumber || 'Fl. 12'}</strong></div>
              <div>Assento: <strong className="text-slate-800">{extracted.entryNumber || 'Nº 100'}</strong></div>
            </div>

            {/* Assinaturas Tradicionais da Instituição */}
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="text-center">
                <div className="h-9 border-b border-slate-400 max-w-[200px] mx-auto flex items-end justify-center pb-1">
                  <span className="font-serif italic text-xs text-slate-600">Assinatura Manual</span>
                </div>
                <p className="text-[10px] font-bold text-slate-800 mt-1 uppercase">Direção Notarial e Académica</p>
                <p className="text-[9px] text-slate-500 font-mono">Chancela da Instituição</p>
              </div>

              <div className="text-center">
                <div className="h-9 border-b border-slate-400 max-w-[200px] mx-auto flex items-end justify-center pb-1">
                  <span className="font-serif italic text-xs text-slate-600">Assinatura do Reitor / Diretor</span>
                </div>
                <p className="text-[10px] font-bold text-slate-800 mt-1 uppercase">Direção Geral</p>
                <p className="text-[9px] text-slate-500 font-mono">Carimbo Físico em Branco</p>
              </div>
            </div>

            {/* Aviso de Documento Original não digitalmente chancelado */}
            <div className="mt-4 pt-3 border-t border-slate-300 text-[10px] text-slate-500 italic">
              Este é o documento conforme submetido pela instituição de origem. Não continha camada notarial SIVEC em sua emissão inicial.
            </div>
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Arquivo Original: {document.fileName} ({document.fileSizeKb} KB)</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Arquivo Original Preservado & Trancado
          </span>
        </div>
      </div>
    );
  };

  // Renderizador da Versão SIVEC (Requisitos 6, 7, 8, 9)
  const renderSivecView = () => {
    const sivecCode = registration?.sivecCode || 'SIVEC-MZ-2026-PENDENTE';
    const uniqueId = registration?.uniqueCertificateId || 'MZ-SIVEC-CERT-2026-PENDENTE';
    const verifyUrl = sivecVersion?.publicVerifyUrl || `https://sivec.moztechwave.co.mz/verify/${sivecCode}`;

    return (
      <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        {/* Banner do SIVEC com Garantia Notarial Soberana */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-emerald-500/20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-black tracking-wider uppercase font-mono flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              VERSÃO SIVEC GERADA COM QR & SELO NOTARIAL
            </span>
            <span className="text-[11px] text-slate-300 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {sivecCode}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">Chancela Notarial SIVEC</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {registration?.sha256Hash ? registration.sha256Hash.slice(0, 16) + '...' + registration.sha256Hash.slice(-8) : 'GERADO COM SUCESSO'}
            </span>
          </div>
        </div>

        {/* Quadro Visual do Certificado Versão SIVEC (Preservação Visual Aproximada + Elementos de Soberania) */}
        <div className="bg-[#FAF9F6] text-slate-900 rounded-2xl p-6 sm:p-10 border-4 border-emerald-900/30 relative shadow-inner">
          
          {/* FAIXA SUPERIOR NOTARIAL SIVEC */}
          <div className="bg-slate-950 text-white p-3.5 -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 rounded-t-xl mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-emerald-500">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[11px] font-black tracking-wider font-mono text-emerald-400 block uppercase">
                  SIVEC • CAMADA DE CONFIANÇA E SALVAGUARDA NOTARIAL DIGITAL
                </span>
                <span className="text-[10px] text-slate-300 font-mono">
                  Identificador Universal: {uniqueId}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block">Status no Registo</span>
              <span className="text-[11px] font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                REGISTO OFICIAL ATIVO
              </span>
            </div>
          </div>

          {/* Conteúdo Institucional Preservado Aproximadamente */}
          <div className="text-center space-y-5">
            {/* Cabeçalho Institucional */}
            <div className="border-b-2 border-slate-200 pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950/10 text-emerald-900 mb-2 font-serif font-black text-xl">
                🏛️
              </div>
              <h2 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 uppercase tracking-wide">
                {extracted.institutionName}
              </h2>
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                NUIT: {extracted.institutionNuit || '400891234'} • Entidade Académica Acreditada
              </p>
            </div>

            {/* Título do Documento */}
            <div className="pt-2">
              <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold block">
                VERSÃO OFICIAL SIVEC COM VALIDAÇÃO INSTANTÂNEA
              </span>
              <h3 className="text-xl sm:text-3xl font-serif font-black text-slate-900 mt-1 uppercase tracking-tight">
                CERTIFICADO DE HABILITAÇÃO PROFISSIONAL
              </h3>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Número de Registro: <strong className="text-slate-900">{extracted.certificateNumber}</strong>
              </p>
            </div>

            {/* Texto de Concessão com Dados Identificados e Revisados */}
            <div className="py-4 text-xs sm:text-sm text-slate-800 leading-relaxed max-w-2xl mx-auto space-y-3 font-serif">
              <p>
                Certifica-se formalmente que, de harmonia com os registos académicos em arquivo permanente:
              </p>
              
              <div className="py-3 bg-emerald-50/70 rounded-xl border border-emerald-900/15 px-4 shadow-sm">
                <p className="text-base sm:text-2xl font-sans font-black text-slate-950 tracking-wide uppercase">
                  {extracted.studentName}
                </p>
                {extracted.studentDocument && (
                  <p className="text-xs font-mono text-slate-700 mt-0.5">
                    {extracted.studentDocument} {extracted.studentId ? `• Matrícula: ${extracted.studentId}` : ''}
                  </p>
                )}
              </div>

              <p>
                Concluiu com mérito académico o plano de estudos e competências profissionais de:
              </p>

              <p className="text-sm sm:text-lg font-sans font-black text-emerald-950 uppercase tracking-tight">
                {extracted.courseName}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono pt-2 text-slate-700">
                <span className="bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs">
                  Carga Horária: <strong>{extracted.durationHours} Horas Letivas</strong>
                </span>
                {extracted.finalGrade && (
                  <span className="bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs">
                    Classificação: <strong>{extracted.finalGrade}</strong>
                  </span>
                )}
                {extracted.issueDate && (
                  <span className="bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs">
                    Data de Emissão: <strong>{extracted.issueDate}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Assentos Notariais */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-600 border-t border-b border-slate-200 py-2">
              <div>Livro: <strong className="text-slate-900">{extracted.bookNumber || 'L-01/TEC'}</strong></div>
              <div>Folha: <strong className="text-slate-900">{extracted.sheetNumber || 'Fl. 88'}</strong></div>
              <div>Assento: <strong className="text-slate-900">{extracted.entryNumber || 'Assento 1042'}</strong></div>
            </div>

            {/* BLOCO NOTARIAL INSERIDO: SELO DIGITAL + LINK PÚBLICO + QR CODE OFICIAL (Requisitos 7 e 8) */}
            <div className="mt-6 pt-4 border-2 border-emerald-600/30 bg-emerald-50/50 rounded-2xl p-4 sm:p-5 text-left grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              {/* Selo Notarial Soberano */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase font-sans">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>SELO NOTARIAL DIGITAL SIVEC</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Autenticado pela Infraestrutura de Chaves Públicas e Registro Notarial do SIVEC.
                </p>
                <div className="text-[9px] font-mono text-slate-500 pt-1">
                  Chave: {registration?.sha256Hash ? registration.sha256Hash.slice(0, 16) + '...' : '0x8819...'}
                </div>
              </div>

              {/* Link Canônico Público */}
              <div className="space-y-1 md:border-l md:border-r border-emerald-900/10 md:px-4">
                <span className="text-[10px] uppercase font-bold text-slate-700 block font-mono">
                  Link Canônico de Verificação
                </span>
                <a 
                  href={`/verify/${sivecCode}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-mono font-black text-emerald-700 hover:text-emerald-800 break-all flex items-center gap-1 group underline"
                >
                  <span>{verifyUrl}</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </a>
                <span className="text-[9px] text-slate-500 block">
                  Qualquer entidade ou empregador pode validar este diploma via navegador.
                </span>
              </div>

              {/* QR Code de Alta Resolução Gerado */}
              <div className="flex items-center justify-center md:justify-end gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-800 font-mono block">QR Code SIVEC</span>
                  <span className="text-[9px] text-slate-500 block">Aponte a câmara</span>
                </div>
                <div className="w-24 h-24 bg-white p-1.5 rounded-xl border-2 border-emerald-600 shadow-sm flex items-center justify-center">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code de Verificação SIVEC" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <QrCode className="w-12 h-12 text-emerald-700" />
                      <span className="text-[8px] font-mono">SIVEC QR</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Cláusula Jurídica Obrigatória ANEP */}
            <div className="mt-4 pt-3 border-t border-slate-300 text-[10px] text-slate-700 text-center font-serif leading-relaxed">
              <strong>Fórmula Notarial Oficial:</strong> &ldquo;{SIVEC_LEGAL_MANDATE.standardFormula}&rdquo;
            </div>

            {/* Preservação Visual Informativa */}
            <div className="text-[9px] font-mono text-slate-500 bg-slate-100 p-2 rounded-lg">
              {SIVEC_VISUAL_PRESERVATION_DISCLAIMER}
            </div>

          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <span>Versão SIVEC gerada em: {sivecVersion?.generatedAt || new Date().toLocaleString()}</span>
          <div className="flex items-center gap-2">
            {onPrint && (
              <button
                onClick={onPrint}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir / Salvar PDF
              </button>
            )}
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Protegido com QR & Selo Digital
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {mode === 'original' && renderOriginalView()}

      {mode === 'sivec_version' && renderSivecView()}

      {mode === 'side_by_side' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <FileText className="w-4 h-4" /> 1. Arquivo Original (Submetido pela Instituição)
            </h4>
            {renderOriginalView()}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <ShieldCheck className="w-4 h-4" /> 2. Versão SIVEC (Com QR, Selo Notarial & Link Público)
            </h4>
            {renderSivecView()}
          </div>
        </div>
      )}
    </div>
  );
};
