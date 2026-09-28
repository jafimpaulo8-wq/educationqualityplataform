import React, { useState } from 'react';
import { 
  Award, 
  QrCode, 
  Download, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  FileCheck, 
  Eye, 
  UserCheck, 
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { CERTIFICATES_DATA, COURSES_DATA } from '../data/mockData';
import { CertificateData } from '../types';

export const CertificateShowcase: React.FC = () => {
  const [selectedCertIndex, setSelectedCertIndex] = useState(0);
  const [customStudentName, setCustomStudentName] = useState('');
  const [customCourse, setCustomCourse] = useState(COURSES_DATA[0].name);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const activeCert: CertificateData = CERTIFICATES_DATA[selectedCertIndex] || CERTIFICATES_DATA[0];

  const displayName = isCustomMode && customStudentName.trim() 
    ? customStudentName.toUpperCase() 
    : activeCert.studentName;

  const displayCourse = isCustomMode 
    ? customCourse.toUpperCase() 
    : activeCert.courseName;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <section id="certificados" className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800/80 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Certificação Oficial Moztechwave • SIVERC
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Visualizador da{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Frente do Certificado Oficial
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Veja exatamente como é emitido o certificado digital e impresso da <strong className="text-white">Moztechwave</strong>. Com selo holográfico em relevo, código QR de autenticidade instantânea e registro SIVERC homologado.
          </p>
        </div>

        {/* Interactive Controls Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl">
          {/* Preset Certificate Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              Modelos Emitidos:
            </span>
            {CERTIFICATES_DATA.map((cert, idx) => (
              <button
                key={cert.id}
                onClick={() => {
                  setSelectedCertIndex(idx);
                  setIsCustomMode(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isCustomMode && selectedCertIndex === idx
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                {cert.studentName.split(' ')[0]} ({cert.category})
              </button>
            ))}

            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isCustomMode
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 text-sky-400 border border-sky-500/30 hover:bg-sky-950/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalizar Meu Nome</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setVerificationModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
              <span>Verificar no SIVERC</span>
            </button>

            <button
              id="print-certificate-btn"
              onClick={handlePrintCertificate}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Customization Inputs (if custom mode active) */}
        {isCustomMode && (
          <div className="mb-8 p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-medium text-sky-300 mb-1">
                Nome Completo do Aluno (Aparece no Certificado):
              </label>
              <input
                type="text"
                value={customStudentName}
                onChange={(e) => setCustomStudentName(e.target.value)}
                placeholder="Ex: SEU NOME COMPLETO AQUI"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-sky-500/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sky-300 mb-1">
                Selecione o Curso Concluído:
              </label>
              <select
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-sky-500/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              >
                {COURSES_DATA.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* THE HIGH-FIDELITY OFFICIAL CERTIFICATE FRONT FACE ("A IMAGEM DE FRENTE DO CERTIFICADO") */}
        <div className="relative mx-auto max-w-5xl">
          {/* Certificate Sheet (Styled like heavy parchment paper with guilloche security borders) */}
          <div 
            id="moztechwave-official-certificate"
            className="relative w-full bg-[#fcfbf7] text-slate-900 p-6 sm:p-10 md:p-14 rounded-2xl shadow-2xl border-[10px] border-[#d4af37] select-none overflow-hidden transition-transform duration-300"
            style={{ 
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px 0 rgba(212, 175, 55, 0.15)',
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center'
            }}
          >
            {/* Watermark Security Guilloche Pattern in Background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.035] bg-repeat"
              style={{
                backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#d4af37 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px'
              }}
            />

            {/* Inner Gold Foil Filigree Border */}
            <div className="relative border-2 border-[#b8860b] p-6 sm:p-8 md:p-10 rounded-lg">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#8b6508]"></div>
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#8b6508]"></div>
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#8b6508]"></div>
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#8b6508]"></div>

              {/* Certificate Header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-0.5 w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#b8860b]" />
                  <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#5c4033] uppercase">
                    República de Moçambique
                  </span>
                  <div className="h-0.5 w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#b8860b]" />
                </div>

                <div className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-700 uppercase">
                  Ministério da Educação &amp; Ensino Técnico Profissional • SIVERC Homologado
                </div>

                <div className="py-2">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight uppercase" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
                    MOZTECHWAVE
                  </h3>
                  <div className="text-xs sm:text-sm font-semibold tracking-widest text-[#8b6508] uppercase mt-0.5">
                    Instituto de Tecnologia &amp; Formação Profissional
                  </div>
                </div>

                {/* Ribbon Divider */}
                <div className="flex items-center justify-center gap-4 py-1">
                  <div className="h-px w-24 sm:w-36 bg-[#b8860b]" />
                  <div className="w-2.5 h-2.5 rotate-45 bg-[#b8860b]" />
                  <div className="h-px w-24 sm:w-36 bg-[#b8860b]" />
                </div>

                {/* Certificate Main Title */}
                <div className="py-3">
                  <div className="text-xs sm:text-sm font-semibold tracking-widest text-[#78350f] uppercase">
                    Confere o presente
                  </div>
                  <h4 
                    className="text-xl sm:text-2xl md:text-3xl font-black text-[#1e293b] tracking-wider uppercase mt-1"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    CERTIFICADO DE QUALIFICAÇÃO
                  </h4>
                  <div className="text-[11px] sm:text-xs font-medium text-slate-600 italic">
                    Registro Nacional SIVERC nº: {activeCert.code}
                  </div>
                </div>
              </div>

              {/* Certificate Body Text */}
              <div className="mt-4 sm:mt-6 text-center space-y-4 max-w-3xl mx-auto">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Certifica-se para os devidos efeitos que o(a) formando(a):
                </p>

                {/* Candidate Name in Bold Display */}
                <div className="py-2 px-4 border-b-2 border-slate-300 inline-block min-w-[280px] sm:min-w-[420px]">
                  <span 
                    className="text-xl sm:text-2xl md:text-3xl font-black text-[#0f172a] tracking-wide"
                    style={{ fontFamily: 'Cinzel, Georgia, serif' }}
                  >
                    {displayName}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-700">
                  portador(a) do <strong className="text-slate-900">{activeCert.documentNumber}</strong>, concluiu com aproveitamento e rigor acadêmico o curso de especialização profissional de:
                </div>

                {/* Course Name in High Contrast */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
                  <span className="text-base sm:text-lg md:text-xl font-extrabold text-[#78350f] tracking-tight uppercase">
                    {displayCourse}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  com a carga horária de <strong className="text-slate-900">{activeCert.durationHours} horas letivas</strong>, obtendo a classificação final de <strong className="text-[#047857]">{activeCert.grade}</strong>, sendo-lhe concedidas todas as prerrogativas legais e de exercício da profissão.
                </p>

                <div className="text-xs text-slate-500 italic pt-1">
                  Maputo, Moçambique aos {activeCert.issueDate}
                </div>
              </div>

              {/* Bottom Signatures, Gold Foil Stamp & QR Code */}
              <div className="mt-10 sm:mt-12 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Director 1 */}
                <div className="text-center space-y-1">
                  <div className="h-10 flex items-center justify-center">
                    <span className="font-serif italic text-base text-slate-700 tracking-wide select-none transform -rotate-3">
                      Paulo Jafim
                    </span>
                  </div>
                  <div className="h-px bg-slate-400 w-44 mx-auto" />
                  <div className="text-xs font-bold text-slate-900 uppercase">Eng. Paulo Jafim</div>
                  <div className="text-[10px] text-slate-500">Diretor Geral • Moztechwave</div>
                </div>

                {/* Central Moztechwave Gold Embossed Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa771c] p-1 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-[#8b6508] flex flex-col items-center justify-center text-center p-1 bg-gradient-to-tr from-[#e6ca65] to-[#fdf6c7]">
                      <Award className="w-6 h-6 text-[#78350f]" />
                      <span className="text-[8px] font-black uppercase tracking-tighter text-[#78350f] leading-tight mt-0.5">
                        SELO OFICIAL
                      </span>
                      <span className="text-[7px] font-bold text-[#8b6508]">MOZTECHWAVE</span>
                      <span className="text-[6px] font-mono text-[#78350f]">SIVERC AUTH</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-2">
                    HASH: {activeCert.authHash.slice(0, 16)}...
                  </span>
                </div>

                {/* Pedagogic Director & SIVERC QR Code */}
                <div className="flex items-center justify-around sm:justify-end gap-4">
                  <div className="text-center space-y-1">
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-serif italic text-base text-slate-700 tracking-wide select-none transform rotate-1">
                        Amina Abdul
                      </span>
                    </div>
                    <div className="h-px bg-slate-400 w-36 mx-auto" />
                    <div className="text-xs font-bold text-slate-900 uppercase">Dra. Amina Abdul</div>
                    <div className="text-[10px] text-slate-500">Diretora Pedagógica</div>
                  </div>

                  {/* QR Code */}
                  <div 
                    onClick={() => setVerificationModalOpen(true)}
                    className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-300 rounded-lg shadow-sm cursor-pointer hover:border-sky-500 transition-colors"
                    title="Clique para validar autenticidade SIVERC"
                  >
                    <QrCode className="w-12 h-12 text-slate-900" />
                    <span className="text-[8px] font-bold text-sky-700 mt-0.5">SIVERC SCAN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Verification Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Validade jurídica em todo o território nacional e aceitação em concursos públicos e empresas privadas.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-300">Código de Validação: {activeCert.code}</span>
            <button 
              onClick={() => setVerificationModalOpen(true)}
              className="text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer"
            >
              Consultar Chave de Validação &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* SIVERC Verification Modal */}
      {verificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Certificado Autenticado com Sucesso</h3>
                  <p className="text-xs text-emerald-400">Registro Ativo no SIVERC Moztechwave</p>
                </div>
              </div>
              <button
                onClick={() => setVerificationModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Estudante:</span>
                <span className="text-white font-bold">{displayName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Curso:</span>
                <span className="text-white font-bold">{displayCourse}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Status no SIVERC:</span>
                <span className="text-emerald-400 font-bold">100% REGISTRADO &amp; VÁLIDO</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Hash Criptográfico:</span>
                <span className="text-slate-300 break-all">{activeCert.authHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emissão:</span>
                <span className="text-slate-300">{activeCert.issueDate}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setVerificationModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setVerificationModalOpen(false);
                  handlePrintCertificate();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Certificado</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
