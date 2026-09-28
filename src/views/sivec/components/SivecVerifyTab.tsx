import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Printer, 
  Copy, 
  Check, 
  RefreshCw, 
  Award, 
  Building2, 
  Calendar, 
  Lock, 
  RotateCcw, 
  Clock, 
  FileCheck2, 
  Fingerprint, 
  History, 
  UserCheck,
  ExternalLink,
  Camera
} from 'lucide-react';
import { SivecRegistryEntry, SivecCredentialState } from '../types';
import { SIVEC_LEGAL_MANDATE } from '../mockSivecData';
import { normalizeSivecStatus } from './SivecRegistryTab';
import { QrCodeScannerModal } from './QrCodeScannerModal';

interface SivecVerifyTabProps {
  registry: SivecRegistryEntry[];
  initialSearchCode?: string;
  onIncrementVerifyCount?: (id: string) => void;
}

export const SivecVerifyTab: React.FC<SivecVerifyTabProps> = ({
  registry,
  initialSearchCode = 'SIVEC-MZ-2026-8819',
  onIncrementVerifyCount
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchCode);
  const [searchMethod, setSearchMethod] = useState<'codigo' | 'hash' | 'qrcode'>('codigo');
  const [hasSearched, setHasSearched] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [verifiedEntry, setVerifiedEntry] = useState<SivecRegistryEntry | null>(() => {
    return registry.find(r => r.sivecCode.toUpperCase() === initialSearchCode.toUpperCase()) || registry[0] || null;
  });

  const [copiedHash, setCopiedHash] = useState(false);
  const [isPrintingAttestation, setIsPrintingAttestation] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleVerify = (queryToTest?: string) => {
    const q = (queryToTest || searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    setTimeout(() => {
      const upper = q.toUpperCase();
      const cleanHash = q.toLowerCase();

      const found = registry.find(item => 
        item.sivecCode.toUpperCase() === upper ||
        item.id.toUpperCase() === upper ||
        (item.uniqueCertificateId && item.uniqueCertificateId.toUpperCase() === upper) ||
        (item.certificateNumber && item.certificateNumber.toUpperCase() === upper) ||
        item.sha256Hash.toLowerCase() === cleanHash ||
        item.studentDocument.toUpperCase().includes(upper)
      );

      setVerifiedEntry(found || null);
      setHasSearched(true);
      setIsSearching(false);

      if (found && onIncrementVerifyCount) {
        onIncrementVerifyCount(found.id);
      }
    }, 400);
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const currentStatus: SivecCredentialState = verifiedEntry 
    ? normalizeSivecStatus(verifiedEntry.status)
    : 'ATIVO';

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO DO VALIDADOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
            SIVEC VERIFY • CONSULTA PÚBLICA DE AUTENTICIDADE
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Consulta Pública de Autenticidade Documental
          </h2>
          <p className="text-xs text-slate-400">
            Aberto para empresas, embaixadas, ministérios e recrutadores consultarem a veracidade dos certificados emitidos.
          </p>
        </div>
      </div>

      {/* PAINEL DE BUSCA MULTIFATORIAL */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSearchMethod('codigo')}
            className={`px-3.5 py-1.5 rounded-xl cursor-pointer transition ${
              searchMethod === 'codigo' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Código SIVEC / ID Único
          </button>
          <button
            type="button"
            onClick={() => setSearchMethod('hash')}
            className={`px-3.5 py-1.5 rounded-xl cursor-pointer transition ${
              searchMethod === 'hash' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Hash Criptográfico SHA-256
          </button>
          <button
            type="button"
            onClick={() => setSearchMethod('qrcode')}
            className={`px-3.5 py-1.5 rounded-xl cursor-pointer transition ${
              searchMethod === 'qrcode' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Leitor de QR Code
          </button>
        </div>

        {searchMethod !== 'qrcode' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder={
                  searchMethod === 'codigo'
                    ? "Código SIVEC (ex: SIVEC-MZ-2026-8819) ou ID Único (ex: MZ-SIVEC-CERT-2026-008819-A1)..."
                    : "Cole o Hash SHA-256 (64 caracteres hexadecimais)..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-mono placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer transition flex items-center justify-center gap-2 shadow-xs"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Validar no SIVEC</span>
            </button>
          </form>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <QrCode className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-xs text-white font-bold">Leitor de QR Code com Assinatura Embutida</div>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Aponte a câmara do telemóvel/computador para o QR Code impresso no diploma ou selecione um dos certificados de teste.
            </p>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 mx-auto shadow-md"
            >
              <Camera className="w-4 h-4" />
              <span>Abrir Leitor de Câmara / Enviar Foto QR</span>
            </button>

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('SIVEC-MZ-2026-8819');
                  handleVerify('SIVEC-MZ-2026-8819');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-mono border border-slate-800 cursor-pointer"
              >
                Benedito (ATIVO)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('SIVEC-MZ-2026-3391');
                  handleVerify('SIVEC-MZ-2026-3391');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 text-xs font-mono border border-slate-800 cursor-pointer"
              >
                Manuel (REVOGADO)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('SIVEC-MZ-2026-5542');
                  handleVerify('SIVEC-MZ-2026-5542');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-mono border border-slate-800 cursor-pointer"
              >
                Isabel (CORRIGIDO)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('SIVEC-MZ-2026-2210');
                  handleVerify('SIVEC-MZ-2026-2210');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono border border-slate-800 cursor-pointer"
              >
                Rui (EXPIRADO)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('SIVEC-MZ-2026-1109');
                  handleVerify('SIVEC-MZ-2026-1109');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 text-xs font-mono border border-slate-800 cursor-pointer"
              >
                Soraia (CANCELADO)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RESULTADO DA CONSULTA NO SIVEC VERIFY */}
      {hasSearched && (
        <>
          {verifiedEntry ? (
            <div className={`p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 shadow-2xl space-y-6 ${
              currentStatus === 'ATIVO' 
                ? 'border-emerald-500/70' 
                : currentStatus === 'CORRIGIDO'
                  ? 'border-amber-500/70'
                  : currentStatus === 'EXPIRADO'
                    ? 'border-slate-500/70'
                    : currentStatus === 'CANCELADO'
                      ? 'border-purple-500/70'
                      : 'border-rose-500/80'
            }`}>
              
              {/* TOPO: BANNER CONFORME O ESTADO (ATIVO, CORRIGIDO, EXPIRADO, REVOGADO, CANCELADO) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    currentStatus === 'ATIVO' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : currentStatus === 'CORRIGIDO'
                        ? 'bg-amber-500/20 text-amber-400'
                        : currentStatus === 'EXPIRADO'
                          ? 'bg-slate-500/20 text-slate-400'
                          : currentStatus === 'CANCELADO'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {currentStatus === 'ATIVO' && <CheckCircle2 className="w-8 h-8" />}
                    {currentStatus === 'CORRIGIDO' && <RotateCcw className="w-8 h-8" />}
                    {currentStatus === 'EXPIRADO' && <Clock className="w-8 h-8" />}
                    {currentStatus === 'CANCELADO' && <AlertCircle className="w-8 h-8" />}
                    {currentStatus === 'REVOGADO' && <XCircle className="w-8 h-8" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider block ${
                        currentStatus === 'ATIVO' 
                          ? 'text-emerald-400' 
                          : currentStatus === 'CORRIGIDO'
                            ? 'text-amber-400'
                            : currentStatus === 'EXPIRADO'
                              ? 'text-slate-400'
                              : currentStatus === 'CANCELADO'
                                ? 'text-purple-400'
                                : 'text-rose-400'
                      }`}>
                        {currentStatus === 'ATIVO' && 'AUTENTICIDADE CONFIRMADA • REGISTRO HOMOLOGADO (ATIVO)'}
                        {currentStatus === 'CORRIGIDO' && 'AUTENTICIDADE CONFIRMADA COM APOSTILHA DE CORREÇÃO (CORRIGIDO)'}
                        {currentStatus === 'EXPIRADO' && 'REGISTRO LOCALIZADO • VALIDADE EXPIRADA (EXPIRADO)'}
                        {currentStatus === 'CANCELADO' && 'ALERTA NOTARIAL • DOCUMENTO CANCELADO ADMINISTRATIVAMENTE (CANCELADO)'}
                        {currentStatus === 'REVOGADO' && 'ALERTA CRÍTICO • DOCUMENTO REVOGADO POR FRAUDE/DISCIPLINA (REVOGADO)'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white">{verifiedEntry.studentName}</h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>{verifiedEntry.studentDocument}</span>
                      <span>•</span>
                      <span>ID: {verifiedEntry.studentId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    {verifiedEntry.sivecCode}
                  </span>
                  {verifiedEntry.uniqueCertificateId && (
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]" title={verifiedEntry.uniqueCertificateId}>
                      {verifiedEntry.uniqueCertificateId}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    Total de consultas públicas: {verifiedEntry.verificationCount + 1}
                  </span>
                </div>
              </div>

              {/* SE REVOGADO OU CANCELADO: AVISO CRÍTICO */}
              {(currentStatus === 'REVOGADO' || currentStatus === 'CANCELADO') && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs space-y-2">
                  <strong className="block text-rose-300 font-black text-sm">
                    ⚠️ ATENÇÃO: ESTE DOCUMENTO NÃO POSSUI VALIDADE ACADÉMICA OU LEGAL
                  </strong>
                  <p>
                    O registo associado ao código {verifiedEntry.sivecCode} foi formalmente {currentStatus.toLowerCase()} no livro de registo institucional e no SIVEC CORE.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-[11px] space-y-1">
                    <span className="text-slate-400 block font-bold">Motivo Registado no Livro Notarial:</span>
                    <p className="text-rose-300">
                      {verifiedEntry.revocationReason || verifiedEntry.cancellationReason || 'Anulação formal lavrada em ata'}
                    </p>
                    <div className="text-[10px] text-slate-500 pt-1">
                      Data: {verifiedEntry.revocationDate || verifiedEntry.cancellationDate || verifiedEntry.issueDate} • Autoridade: {verifiedEntry.revokedBy || verifiedEntry.cancelledBy || 'Secretaria Geral'}
                    </div>
                  </div>
                </div>
              )}

              {/* SE CORRIGIDO: APOSTILHA DE RETIFICAÇÃO */}
              {currentStatus === 'CORRIGIDO' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                  <strong className="block text-amber-300 font-black flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-amber-400" /> APOSTILHA NOTARIAL DE RETIFICAÇÃO CADASTRAL HOMOLOGADA
                  </strong>
                  <p>
                    O documento original foi emitido e posteriormente retificado por despacho formal averbado ao assento original.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-[11px] space-y-1">
                    <span className="text-slate-400 block font-bold">Fundamentação do Averbamento de Correção:</span>
                    <p className="text-amber-300">{verifiedEntry.correctionReason}</p>
                    <div className="text-[10px] text-slate-500 pt-1">
                      Data da Retificação: {verifiedEntry.correctionDate} • Homologado por: {verifiedEntry.correctedBy}
                    </div>
                  </div>
                </div>
              )}

              {/* CLÁUSULA MANDATÓRIA OBRIGATÓRIA (SIVEC & ANEP) */}
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Declaração Institucional de Validade Notarial:
                </div>
                <blockquote className="text-sm sm:text-base font-black text-white font-serif tracking-wide border-l-4 border-emerald-400 pl-3 py-1">
                  &ldquo;{SIVEC_LEGAL_MANDATE.standardFormula}&rdquo;
                </blockquote>
                <div className="text-[11px] text-slate-300/90 pt-1 space-y-1">
                  <p>
                    <strong>Nota Regulamentar:</strong> O SIVEC constitui a camada institucional de integridade digital, carimbo temporal e salvaguarda criptográfica contra fraudes. O SIVEC não substitui os atos regulatórios de acreditação sob tutela da ANEP (Autoridade Nacional de Educação Profissional).
                  </p>
                </div>
              </div>

              {/* OS 11 PONTOS VISÍVEIS EM CARDS REFINADOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                
                {/* 1. Instituição & Emissor */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] font-mono">1. Instituição &amp; 9. Emissor:</span>
                  <strong className="text-white text-xs block">{verifiedEntry.institutionName}</strong>
                  <div className="text-[10px] text-slate-400">Emissor: {verifiedEntry.issuerName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">NUIT: {verifiedEntry.institutionNuit}</div>
                </div>

                {/* 2. Certificado & 5. Número */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] font-mono">2. Certificado &amp; 5. Número:</span>
                  <strong className="text-white text-xs block truncate">{verifiedEntry.certificateTitle || verifiedEntry.credentialType}</strong>
                  <div className="text-emerald-400 font-mono font-bold text-[11px]">
                    Nº {verifiedEntry.certificateNumber || verifiedEntry.entryNumber}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {verifiedEntry.bookNumber} • {verifiedEntry.sheetNumber} • {verifiedEntry.entryNumber}
                  </div>
                </div>

                {/* 4. Curso */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] font-mono">4. Curso / Qualificação:</span>
                  <strong className="text-white text-xs block truncate">{verifiedEntry.courseName}</strong>
                  <div className="text-emerald-400 font-bold text-[11px]">
                    {verifiedEntry.durationHours} Horas • {verifiedEntry.finalGrade}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {verifiedEntry.academicLevel}
                  </div>
                </div>

                {/* 6. Data */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] font-mono">6. Datas &amp; Vigência:</span>
                  <div className="text-white">Emissão: <strong className="font-mono">{verifiedEntry.issueDate}</strong></div>
                  {verifiedEntry.expiryDate && (
                    <div className="text-amber-400 text-[11px]">Validade: <strong className="font-mono">{verifiedEntry.expiryDate}</strong></div>
                  )}
                  <div className="text-[10px] text-slate-500 font-mono">
                    TSA: {verifiedEntry.timestampUtc}
                  </div>
                </div>

                {/* 10. Assinaturas */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] font-mono">10. Assinaturas Digitais:</span>
                  <strong className="text-sky-400 text-xs block">
                    {verifiedEntry.signatures ? `${verifiedEntry.signatures.length} Assinaturas Ed25519` : 'Assinado Digitalmente'}
                  </strong>
                  <div className="text-[10px] text-slate-300 truncate">
                    {verifiedEntry.signatoryDirector}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {verifiedEntry.pedagogicOfficer}
                  </div>
                </div>

                {/* 11. Histórico */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] font-mono">11. Histórico Notarial:</span>
                  <strong className="text-emerald-400 text-xs block">
                    {verifiedEntry.history ? `${verifiedEntry.history.length} Eventos Auditáveis` : '1 Evento Auditável'}
                  </strong>
                  <div className="text-[10px] text-slate-300">
                    Último: {verifiedEntry.history?.[0]?.action || 'Emissão Notarial'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Estado: {currentStatus}
                  </div>
                </div>

              </div>

              {/* 8. DIGEST CRIPTOGRÁFICO DE INTEGRIDADE */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    8. Hash Criptográfico SHA-256 (Inviolável):
                  </span>
                  <button
                    onClick={() => handleCopyHash(verifiedEntry.sha256Hash)}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copiado' : 'Copiar Hash'}</span>
                  </button>
                </div>
                <div className="text-emerald-400 font-mono text-[11px] select-all break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  {verifiedEntry.sha256Hash}
                </div>
              </div>

              {/* BOTÕES DE AÇÃO (IMPRESSÃO DE CERTIDÃO DE VERACIDADE E LINK PÚBLICO) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-400">
                  Auditado e sincronizado com o Repositório Nacional SIVEC CORE 2026.
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      const id = verifiedEntry.uniqueCertificateId || verifiedEntry.sivecCode;
                      if (typeof window !== 'undefined') {
                        window.open(`/verify/${encodeURIComponent(id)}`, '_blank');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver na Página Pública /verify/{'{id}'}</span>
                  </button>

                  <button
                    onClick={() => setIsPrintingAttestation(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>Imprimir Certidão SIVEC</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (

            /* NÃO ENCONTRADO */
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Registo Não Encontrado no SIVEC</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não foi localizado nenhum documento emitido com os dados fornecidos (&quot;{searchQuery}&quot;). Certifique-se de que digitou o código exatamente como consta no certificado ou contacte a secretaria geral.
              </p>
            </div>

          )}
        </>
      )}

      {/* MODAL / VISUALIZADOR DE CERTIDÃO DE AUTENTICIDADE SIVEC */}
      {isPrintingAttestation && verifiedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-2xl max-h-[95vh] overflow-y-auto font-serif">
            
            {/* CABEÇALHO OFICIAL NOTARIAL */}
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
              <div className="text-xs font-mono font-bold tracking-widest text-slate-600 uppercase">
                REPÚBLICA DE MOÇAMBIQUE
              </div>
              <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
                {verifiedEntry.institutionName}
              </h2>
              <div className="text-xs font-sans text-slate-600">
                SIVEC • Sistema Integrado de Verificação e Emissão de Credenciais Digitais
              </div>
            </div>

            <div className="text-center py-2">
              <span className={`text-xs font-mono font-bold uppercase tracking-widest px-4 py-1 rounded-full border ${
                currentStatus === 'ATIVO'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : currentStatus === 'CORRIGIDO'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                CERTIDÃO DE AUTENTICIDADE E REGISTO DIGITAL NOTARIAL • ESTADO: {currentStatus}
              </span>
            </div>

            <div className="text-xs font-sans leading-relaxed text-slate-800 space-y-3">
              <p>
                Certifica-se, para os devidos efeitos e a pedido de qualquer entidade pública ou privada interessada, que se encontra registado no Livro de Assentos Notariais desta instituição, sob o identificador único <strong>{verifiedEntry.uniqueCertificateId || verifiedEntry.sivecCode}</strong> e número oficial <strong>{verifiedEntry.certificateNumber || verifiedEntry.entryNumber}</strong>, o documento relativo ao formando:
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 font-sans text-xs space-y-1">
                <div><strong>Titular:</strong> {verifiedEntry.studentName}</div>
                <div><strong>Documento de Identificação:</strong> {verifiedEntry.studentDocument} (Nº Matrícula: {verifiedEntry.studentId})</div>
                <div><strong>Habilitação / Curso:</strong> {verifiedEntry.courseName}</div>
                <div><strong>Classificação Final:</strong> {verifiedEntry.finalGrade} ({verifiedEntry.durationHours} horas)</div>
                <div><strong>Livro / Folha / Assento:</strong> {verifiedEntry.bookNumber}, {verifiedEntry.sheetNumber}, {verifiedEntry.entryNumber}</div>
                <div><strong>Data de Emissão:</strong> {verifiedEntry.issueDate}</div>
                <div><strong>Estado no Registro Central:</strong> <span className="font-mono font-bold uppercase">{currentStatus}</span></div>
              </div>

              {/* FÓRMULA OFICIAL MANDATÓRIA */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs">
                <strong className="text-emerald-900 block pb-1">CLÁUSULA DE EMISSÃO SIVEC:</strong>
                <p className="font-bold text-emerald-950 font-serif text-sm">
                  &ldquo;{SIVEC_LEGAL_MANDATE.standardFormula}&rdquo;
                </p>
                <p className="text-[10px] text-slate-600 pt-1">
                  O SIVEC não substitui a ANEP. O documento comprova a emissão genuína pela instituição de ensino e integridade dos dados registados.
                </p>
              </div>

              <div className="font-mono text-[10px] text-slate-600 break-all p-2 rounded-lg bg-slate-100 border border-slate-200">
                <strong>Assinatura Digital SHA-256:</strong> {verifiedEntry.sha256Hash}
              </div>
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-slate-200 font-sans text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Data de Consulta:</span>
                <strong>{new Date().toLocaleDateString('pt-PT')} • Carimbo Eletrónico UTC+2</strong>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPrintingAttestation(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Certidão</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE ESCANEAMENTO DE QR CODE */}
      <QrCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedCode) => {
          setIsScannerOpen(false);
          setSearchQuery(scannedCode);
          handleVerify(scannedCode);
        }}
      />

    </div>
  );
};
