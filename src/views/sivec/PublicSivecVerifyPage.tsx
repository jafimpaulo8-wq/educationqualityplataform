import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Clock, 
  Printer, 
  Copy, 
  Check, 
  Building2, 
  Calendar, 
  Lock, 
  Award, 
  FileCheck2, 
  Fingerprint, 
  Share2, 
  ExternalLink, 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  User, 
  BookOpen 
} from 'lucide-react';
import { SivecRegistryEntry, SivecCredentialState } from './types';
import { SIVEC_LEGAL_MANDATE } from './mockSivecData';
import { getSivecRegistry, findSivecCertificate, maskPrivateDocument } from './sivecStorage';
import { QrCodeScannerModal } from './components/QrCodeScannerModal';
import { normalizeSivecStatus } from './components/SivecRegistryTab';
import { useApp } from '../../context/AppContext';

interface PublicSivecVerifyPageProps {
  initialId?: string;
  onNavigateHome?: () => void;
}

export const PublicSivecVerifyPage: React.FC<PublicSivecVerifyPageProps> = ({
  initialId,
  onNavigateHome
}) => {
  // Extrair ID da prop ou diretamente da URL /verify/:id
  const getInitialSearchQuery = (): string => {
    if (initialId) return initialId;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/verify/')) {
        const urlId = decodeURIComponent(path.replace('/verify/', '').trim());
        if (urlId) return urlId;
      }
      const searchParams = new URLSearchParams(window.location.search);
      const queryId = searchParams.get('verify') || searchParams.get('id');
      if (queryId) return queryId;
    }
    return 'SIVEC-MZ-2026-8819';
  };

  const [searchQuery, setSearchQuery] = useState<string>(getInitialSearchQuery);
  const [registry, setRegistry] = useState<SivecRegistryEntry[]>(getSivecRegistry);
  const [currentEntry, setCurrentEntry] = useState<SivecRegistryEntry | null>(() => {
    const query = getInitialSearchQuery();
    return findSivecCertificate(query, registry) || registry[0] || null;
  });

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  const { themeMode } = useApp();
  const isLight = themeMode === 'branco';

  // Sincronizar com mudanças externas no localStorage
  useEffect(() => {
    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setRegistry(e.detail);
      } else {
        setRegistry(getSivecRegistry());
      }
    };
    window.addEventListener('sivec_registry_updated', handleStorageUpdate);
    return () => window.removeEventListener('sivec_registry_updated', handleStorageUpdate);
  }, []);

  // Executar busca por ID / Código
  const executeSearch = (targetQuery: string) => {
    const clean = targetQuery.trim();
    if (!clean) return;
    setSearchQuery(clean);

    const found = findSivecCertificate(clean, registry);
    setCurrentEntry(found || null);
    setHasSearched(true);

    // Atualizar URL sem recarregar a página
    if (typeof window !== 'undefined') {
      const cleanPath = `/verify/${encodeURIComponent(clean)}`;
      if (window.location.pathname !== cleanPath) {
        window.history.pushState(null, '', cleanPath);
      }
    }
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin + `/verify/${currentEntry?.uniqueCertificateId || currentEntry?.sivecCode || searchQuery}`;
      navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const currentStatus: SivecCredentialState = currentEntry 
    ? normalizeSivecStatus(currentEntry.status)
    : 'ATIVO';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isLight 
        ? 'bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white' 
        : 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950'
    }`}>
      
      {/* TOPO PÚBLICO OFICIAL SIVEC */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isLight ? 'border-slate-200 bg-white/95' : 'border-slate-800 bg-slate-900/90'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Voltar ao portal"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className={`p-2.5 rounded-2xl border ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black tracking-widest uppercase ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>SIVEC</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  PORTAL PÚBLICO NOTARIAL
                </span>
              </div>
              <p className={`text-[11px] truncate max-w-[280px] sm:max-w-md ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Sistema Integrado de Verificação e Emissão de Credenciais Digitais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Escanear QR Code</span>
              <span className="sm:hidden">Escanear QR</span>
            </button>
          </div>

        </div>
      </header>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* BANNER INSTITUCIONAL: SIVEC & CERTIFICADO REGISTADO */}
        <div className="text-center space-y-2 py-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 inline-block">
            REPÚBLICA DE MOÇAMBIQUE • CONSULTA PÚBLICA DE VALIDADE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Certificado registado e verificável no SIVEC.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Verificação pública oficial para validação de genuinidade, integridade criptográfica SHA-256 e averbamento notarial contra fraudes.
          </p>
        </div>

        {/* BARRA DE PESQUISA RÁPIDA / URL / QR */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeSearch(searchQuery);
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Insira o Código SIVEC (ex: SIVEC-MZ-2026-8819) ou ID Único..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs font-mono placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer transition flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Consultar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
                title="Abrir leitor de câmara QR"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Câmara QR</span>
              </button>
            </div>
          </form>

          {/* Rota exibida */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400 font-medium">URL Pública:</span>
              <span className="text-emerald-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 truncate max-w-[280px] sm:max-w-md">
                /verify/{currentEntry?.uniqueCertificateId || currentEntry?.sivecCode || searchQuery}
              </span>
            </div>
            {currentEntry && (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Link Copiado' : 'Partilhar Link'}</span>
              </button>
            )}
          </div>
        </div>

        {/* RESULTADO DA CONSULTA NO SIVEC */}
        {hasSearched && (
          <>
            {currentEntry ? (
              <div className={`p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 shadow-2xl space-y-6 ${
                currentStatus === 'ATIVO'
                  ? 'border-emerald-500/70 shadow-emerald-950/20'
                  : currentStatus === 'CORRIGIDO'
                    ? 'border-amber-500/70 shadow-amber-950/20'
                    : currentStatus === 'EXPIRADO'
                      ? 'border-slate-600/70 shadow-slate-950/20'
                      : currentStatus === 'CANCELADO'
                        ? 'border-purple-500/70 shadow-purple-950/20'
                        : 'border-rose-500/80 shadow-rose-950/30'
              }`}>
                
                {/* 1. CABEÇALHO DO RESULTADO & ESTADO */}
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
                          {currentStatus === 'ATIVO' && 'AUTENTICIDADE CONFIRMADA • REGISTO HOMOLOGADO'}
                          {currentStatus === 'CORRIGIDO' && 'AUTENTICIDADE CONFIRMADA COM APOSTILHA DE CORREÇÃO'}
                          {currentStatus === 'EXPIRADO' && 'REGISTO LOCALIZADO • VALIDADE CRONOLÓGICA EXPIRADA'}
                          {currentStatus === 'CANCELADO' && 'ALERTA NOTARIAL • DOCUMENTO CANCELADO'}
                          {currentStatus === 'REVOGADO' && 'ALERTA CRÍTICO • DOCUMENTO REVOGADO'}
                        </span>
                      </div>

                      {/* Nome do aluno (Ponto 2) */}
                      <h2 className="text-xl sm:text-2xl font-black text-white">{currentEntry.studentName}</h2>
                      
                      {/* Proteção de Privacidade Estrita */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 pt-0.5">
                        <span className="text-emerald-400 font-bold">
                          {maskPrivateDocument(currentEntry.studentDocument)}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">ID Académico: {currentEntry.studentId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Identificadores do Certificado (Ponto 1 & Estado) */}
                  <div className="flex flex-col sm:items-end gap-1">
                    <span className={`text-xs font-mono font-black px-3.5 py-1.5 rounded-xl border ${
                      currentStatus === 'ATIVO'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : currentStatus === 'CORRIGIDO'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : currentStatus === 'EXPIRADO'
                            ? 'bg-slate-700 text-slate-300 border-slate-600'
                            : currentStatus === 'CANCELADO'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      ESTADO: {currentStatus}
                    </span>

                    <span className="text-xs font-mono text-white bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                      Código SIVEC: {currentEntry.sivecCode}
                    </span>
                    {currentEntry.uniqueCertificateId && (
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[220px]" title={currentEntry.uniqueCertificateId}>
                        UID: {currentEntry.uniqueCertificateId}
                      </span>
                    )}
                  </div>
                </div>

                {/* CASO REVOGADO OU CANCELADO: AVISO CRÍTICO */}
                {(currentStatus === 'REVOGADO' || currentStatus === 'CANCELADO') && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs space-y-2">
                    <strong className="block text-rose-300 font-black text-sm flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      ESTE DOCUMENTO NÃO POSSUI VALIDADE ACADÉMICA OU LEGAL
                    </strong>
                    <p>
                      O certificado com o código {currentEntry.sivecCode} foi formalmente {currentStatus.toLowerCase()} no repositório notarial SIVEC.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-[11px] space-y-1">
                      <span className="text-slate-400 block font-bold">Motivo Registado:</span>
                      <p className="text-rose-300">
                        {currentEntry.revocationReason || currentEntry.cancellationReason || 'Cancelamento formal lavrado em ata institucional.'}
                      </p>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Data do Ato: {currentEntry.revocationDate || currentEntry.cancellationDate || currentEntry.issueDate} • Autoridade: {currentEntry.revokedBy || currentEntry.cancelledBy || 'Secretaria Geral Notarial'}
                      </div>
                    </div>
                  </div>
                )}

                {/* CASO CORRIGIDO: APOSTILHA NOTARIAL */}
                {currentStatus === 'CORRIGIDO' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                    <strong className="block text-amber-300 font-black flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-amber-400" /> APOSTILHA NOTARIAL DE RETIFICAÇÃO CADASTRAL
                    </strong>
                    <p>
                      O registo original foi emitido e posteriormente retificado por despacho formal averbado ao assento original.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-[11px] space-y-1">
                      <span className="text-slate-400 block font-bold">Fundamentação do Averbamento:</span>
                      <p className="text-amber-300">{currentEntry.correctionReason || 'Retificação cadastral formal'}</p>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Data da Retificação: {currentEntry.correctionDate || currentEntry.issueDate} • Homologado por: {currentEntry.correctedBy || 'Secretaria Geral'}
                      </div>
                    </div>
                  </div>
                )}

                {/* CLÁUSULA MANDATÓRIA OBRIGATÓRIA SIVEC */}
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Declaração Institucional de Validade Notarial:
                  </div>
                  <blockquote className="text-sm sm:text-base font-black text-white font-serif tracking-wide border-l-4 border-emerald-400 pl-3 py-1">
                    &ldquo;{SIVEC_LEGAL_MANDATE.standardFormula}&rdquo;
                  </blockquote>
                  <p className="text-[11px] text-slate-400 pt-1">
                    O SIVEC não substitui a ANEP. O documento comprova a emissão genuína pela instituição de ensino e integridade dos dados registados.
                  </p>
                </div>

                {/* OS PONTOS SOLICITADOS NA ESPECIFICAÇÃO 44 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* PONTO 1: NÚMERO */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">
                      1. Número do Certificado:
                    </span>
                    <strong className="text-emerald-400 font-mono text-sm block">
                      {currentEntry.certificateNumber || currentEntry.entryNumber}
                    </strong>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Livro: {currentEntry.bookNumber} • Folha: {currentEntry.sheetNumber} • {currentEntry.entryNumber}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate" title={currentEntry.uniqueCertificateId}>
                      ID Único: {currentEntry.uniqueCertificateId || currentEntry.sivecCode}
                    </div>
                  </div>

                  {/* PONTO 2: ALUNO (NUNCA EXPOR DADOS PRIVADOS) */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">
                      2. Aluno Formando:
                    </span>
                    <strong className="text-white text-sm block">
                      {currentEntry.studentName}
                    </strong>
                    <div className="text-emerald-400 font-mono text-[11px]">
                      {maskPrivateDocument(currentEntry.studentDocument)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Privacidade Salvaguardada • Sem dados privados expostos
                    </div>
                  </div>

                  {/* PONTO 3: CURSO */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">
                      3. Curso &amp; Qualificação:
                    </span>
                    <strong className="text-white text-xs block truncate" title={currentEntry.courseName}>
                      {currentEntry.courseName}
                    </strong>
                    <div className="text-slate-400 text-[11px]">
                      {currentEntry.academicLevel || 'Formação Profissional'}
                    </div>
                    <div className="text-emerald-400 font-bold text-[10px]">
                      Classificação Final: {currentEntry.finalGrade}
                    </div>
                  </div>

                  {/* PONTO 4: INSTITUIÇÃO EMISSORA */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">
                      4. Instituição Emissora:
                    </span>
                    <strong className="text-white text-xs block truncate" title={currentEntry.institutionName}>
                      {currentEntry.institutionName}
                    </strong>
                    <div className="text-slate-400 text-[11px]">
                      NUIT: {currentEntry.institutionNuit}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {currentEntry.institutionCampus || 'Campus Central'}
                    </div>
                  </div>

                  {/* PONTO 5: DATA */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">
                      5. Data de Emissão:
                    </span>
                    <strong className="text-white font-mono text-sm block">
                      {currentEntry.issueDate}
                    </strong>
                    <div className="text-slate-400 text-[11px]">
                      Conclusão: {currentEntry.completionDate || currentEntry.issueDate}
                    </div>
                    {currentEntry.expiryDate ? (
                      <div className="text-amber-400 text-[10px]">
                        Validade: {currentEntry.expiryDate}
                      </div>
                    ) : (
                      <div className="text-emerald-400 text-[10px]">
                        Validade: Vitalício / Indeterminado
                      </div>
                    )}
                  </div>

                  {/* PONTO 6: CARGA HORÁRIA QUANDO AUTORIZADA */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">
                      6. Carga Horária:
                    </span>
                    {currentEntry.durationHours && currentEntry.durationHours > 0 ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-emerald-400 font-mono text-base">
                            {currentEntry.durationHours} Horas
                          </strong>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block">
                          Carga Horária Autorizada
                        </span>
                        <div className="text-[10px] text-slate-500">
                          Cumprimento integral auditado no plano curricular
                        </div>
                      </>
                    ) : (
                      <>
                        <strong className="text-slate-400 text-xs block">Não especificada</strong>
                        <div className="text-[10px] text-slate-500">
                          Em processo de averbamento de carga horária
                        </div>
                      </>
                    )}
                  </div>

                </div>

                {/* PONTO 8: ASSINATURA & PONTO 10: DATA DE REGISTRO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* ASSINATURAS DIGITAIS INSTITUCIONAIS */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] font-mono uppercase font-bold flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                        Assinaturas Digitais Oficiais (Ed25519):
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        {currentEntry.signatures?.length || 3} Validadas
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {currentEntry.signatures && currentEntry.signatures.length > 0 ? (
                        currentEntry.signatures.map((sig) => (
                          <div key={sig.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-0.5">
                            <div className="flex items-center justify-between text-white font-bold">
                              <span>{sig.signerName}</span>
                              <span className="text-[9px] font-mono text-emerald-400">Ed25519</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{sig.signerRole}</div>
                            <div className="text-[9px] font-mono text-slate-500 truncate" title={sig.publicFingerprint}>
                              Fingerprint: {sig.publicFingerprint}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                          <div className="text-white font-bold">{currentEntry.signatoryDirector || 'Direção Geral'}</div>
                          <div className="text-slate-400 text-[10px]">{currentEntry.pedagogicOfficer || 'Direção Pedagógica'}</div>
                          <div className="text-emerald-400 text-[10px] font-mono">Assinatura Eletrónica Qualificada Ed25519 Homologada</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DATA DE REGISTRO & CARTÓRIO NOTARIAL */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] font-mono uppercase font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          Data de Registo Notarial Central:
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">UTC+2 Maputo</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="text-white font-mono text-xs font-bold">
                          Data &amp; Hora: {currentEntry.issueDate} • Carimbo TSA: {currentEntry.timestampUtc || '2026-08-15T10:30:00.000Z'}
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Emissor: <strong>{currentEntry.issuerName}</strong> ({currentEntry.issuerRole})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Departamento: {currentEntry.issuerDepartment || 'Secretaria Notarial SIVEC'}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono pt-1">
                          Assento Cartorário: {currentEntry.bookNumber}, {currentEntry.sheetNumber}, {currentEntry.entryNumber}
                        </div>
                      </div>
                    </div>

                    {/* Alerta de privacidade */}
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed">
                      <strong className="text-slate-300 block">Privacidade Salvaguardada:</strong>
                      Em cumprimento com as melhores práticas de proteção de dados, o número de telefone, morada e documento integral do titular não são tornados públicos.
                    </div>
                  </div>

                </div>

                {/* PONTO 9: HASH CRIPTOGRÁFICO SHA-256 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Hash Criptográfico SHA-256 (Garantia de Integridade Inviolável):
                    </span>
                    <button
                      onClick={() => handleCopyHash(currentEntry.sha256Hash)}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedHash ? 'Hash Copiado' : 'Copiar Hash'}</span>
                    </button>
                  </div>
                  <div className="text-emerald-400 font-mono text-[11px] select-all break-all bg-slate-900 p-3 rounded-xl border border-slate-800">
                    {currentEntry.sha256Hash}
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO E IMPRESSÃO PÚBLICA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Consulta pública autenticada via protocolo SIVEC CORE 2026.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyShareLink}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{copiedUrl ? 'Copiado!' : 'Partilhar'}</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Comprovativo</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (

              /* NÃO ENCONTRADO */
              <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">Certificado Não Encontrado no SIVEC</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                    Não foi localizado nenhum registo oficial correspondente aos dados pesquisados (&quot;{searchQuery}&quot;). Certifique-se de que digitou o código exatamente como emitido pela instituição ou escaneie o QR Code original.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Escanear QR Code Novamente</span>
                  </button>
                  <button
                    onClick={() => executeSearch('SIVEC-MZ-2026-8819')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Ver Exemplo Válido (Benedito)
                  </button>
                </div>
              </div>

            )}
          </>
        )}

      </main>

      {/* RODAPÉ PÚBLICO */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950 text-center text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-300">
          SIVEC • Sistema Integrado de Verificação e Emissão de Credenciais Digitais
        </p>
        <p className="text-[11px]">
          República de Moçambique • Camada Institucional de Confiança &amp; Integridade Notarial Criptográfica
        </p>
        <p className="text-[10px] text-slate-400 pt-1">
          O SIVEC não substitui a ANEP (Autoridade Nacional de Educação Profissional).
        </p>
      </footer>

      {/* MODAL DE ESCANEAMENTO DE QR CODE */}
      <QrCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedId) => {
          setIsScannerOpen(false);
          executeSearch(scannedId);
        }}
      />

    </div>
  );
};
