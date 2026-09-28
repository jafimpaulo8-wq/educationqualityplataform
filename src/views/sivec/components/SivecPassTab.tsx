import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  QrCode, 
  Download, 
  Share2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileCode, 
  Sparkles,
  RefreshCw,
  User,
  GraduationCap
} from 'lucide-react';
import { SivecPassData } from '../types';
import { INITIAL_SIVEC_PASSES, SIVEC_LEGAL_MANDATE } from '../mockSivecData';

interface SivecPassTabProps {
  passes?: SivecPassData[];
}

export const SivecPassTab: React.FC<SivecPassTabProps> = ({ passes = INITIAL_SIVEC_PASSES }) => {
  const [selectedPass, setSelectedPass] = useState<SivecPassData>(passes[0]);
  const [dynamicCounter, setDynamicCounter] = useState(60);
  const [dynamicPin, setDynamicPin] = useState(selectedPass.dynamicPin);
  const [showJsonCredential, setShowJsonCredential] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Efeito de PIN dinâmico rotativo anti-screenshot de 60 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setDynamicCounter(prev => {
        if (prev <= 1) {
          const newRandomPin = Math.floor(1000 + Math.random() * 9000).toString();
          setDynamicPin(newRandomPin);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const verifiableCredentialJson = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://sivec.moztechwave.co.mz/contexts/credentials/v1"
    ],
    "id": `urn:uuid:${selectedPass.passId}`,
    "type": ["VerifiableCredential", "AcademicCertificateCredential"],
    "issuer": {
      "id": "did:sivec:moztechwave:inst-400192837",
      "name": "Instituto Politécnico de Tecnologias Avançadas Moztechwave",
      "sivecLegalFormula": SIVEC_LEGAL_MANDATE.standardFormula
    },
    "issuanceDate": "2026-08-15T10:30:00Z",
    "expirationDate": "2028-08-15T10:30:00Z",
    "credentialSubject": {
      "id": `did:sivec:student:${selectedPass.studentNumber}`,
      "name": selectedPass.studentName,
      "sivecCode": selectedPass.sivecCode,
      "course": selectedPass.courseName,
      "level": selectedPass.academicLevel,
      "dynamicPin": dynamicPin,
      "status": selectedPass.status
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "created": new Date().toISOString(),
      "verificationMethod": "did:sivec:moztechwave#key-1",
      "proofPurpose": "assertionMethod",
      "proofValue": "z3s6V5n9qB8x2yL...kP4w1m8R"
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(verifiableCredentialJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO SIVEC PASS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
            SIVEC PASS • CARTEIRA DIGITAL VERIFICÁVEL DO FORMANDO
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            Passaporte Digital Académico &amp; QR Dinâmico
          </h2>
          <p className="text-xs text-slate-400">
            Credencial portátil offline e online com proteção anti-cópia e compatibilidade W3C Verifiable Credentials.
          </p>
        </div>

        {/* SELETOR DE ALUNO EXEMPLAR */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Aluno em exibição:</span>
          <select
            value={selectedPass.passId}
            onChange={(e) => {
              const p = passes.find(item => item.passId === e.target.value);
              if (p) setSelectedPass(p);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs cursor-pointer focus:outline-hidden"
          >
            {passes.map(p => (
              <option key={p.passId} value={p.passId}>
                {p.studentName} ({p.sivecCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID DE VISUALIZAÇÃO: CARTÃO VIRTUAL E ESPECIFICAÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CARTÃO VIRTUAL SIVEC PASS (ESTILO CARTEIRA DIGITAL MÓVEL) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm rounded-3xl bg-linear-to-b from-slate-900 via-slate-950 to-slate-950 p-6 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-5">
            
            {/* EFEITO DE BRILHO SUTIL */}
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            {/* TOPO DO PASS */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                  S
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                    SIVEC DIGITAL PASS
                  </span>
                  <span className="text-xs font-bold text-white">Moztechwave Academy</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                VERIFICADO
              </span>
            </div>

            {/* FOTO E DADOS DO TITULAR */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-white leading-tight">{selectedPass.studentName}</h4>
                <div className="text-[11px] text-slate-400 font-mono">ID: {selectedPass.studentNumber}</div>
                <div className="text-[10px] text-emerald-400 font-medium">{selectedPass.academicLevel}</div>
              </div>
            </div>

            {/* CURSO */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Qualificação Académica</span>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{selectedPass.courseName}</span>
              </div>
            </div>

            {/* QR CODE DINÂMICO COM PIN ANTI-FRAUDE */}
            <div className="p-4 rounded-2xl bg-white text-slate-950 text-center space-y-2 shadow-inner">
              <div className="w-36 h-36 mx-auto bg-slate-100 rounded-xl p-2 flex items-center justify-center border border-slate-200">
                <QrCode className="w-full h-full text-slate-900" />
              </div>

              <div className="flex items-center justify-between text-xs font-mono px-2 pt-1">
                <span className="text-slate-600 font-bold">Código SIVEC:</span>
                <strong className="text-slate-900">{selectedPass.sivecCode}</strong>
              </div>

              <div className="flex items-center justify-between text-xs font-mono px-2 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  PIN Rotativo:
                </span>
                <strong className="text-emerald-700 text-sm tracking-widest">{dynamicPin}</strong>
                <span className="text-[10px] text-emerald-600">({dynamicCounter}s)</span>
              </div>
            </div>

            {/* CLÁUSULA MANDATÓRIA OFICIAL NO RODAPÉ DO CARTÃO */}
            <div className="text-[10px] text-slate-400 leading-tight text-center font-sans border-t border-slate-800/80 pt-3">
              &ldquo;{SIVEC_LEGAL_MANDATE.standardFormula}&rdquo;
            </div>

          </div>
        </div>

        {/* ESPECIFICAÇÕES DO SIVEC PASS & EXPORTAÇÕES */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Funcionalidades de Segurança do Passaporte Digital
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-white block">QR Code Dinâmico Anti-Screenshot</strong>
                <p className="text-slate-400 text-[11px]">
                  O PIN de 4 dígitos muda a cada 60 segundos. Fotografias ou capturas de ecrã estáticas expiram automaticamente.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-white block">Validação Offline Criptográfica</strong>
                <p className="text-slate-400 text-[11px]">
                  A assinatura do SIVEC CORE permite a qualquer fiscal ou entidade verificar o formando sem necessitar de rede móvel.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-white block">Padrão W3C Verifiable Credentials</strong>
                <p className="text-slate-400 text-[11px]">
                  Compatível com carteiras de identidade soberana digital (DID/SSI) e interoperabilidade com portais internacionais.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-white block">Controlo Remoto de Validade</strong>
                <p className="text-slate-400 text-[11px]">
                  Caso a credencial seja revogada no SIVEC REGISTRY, o Pass atualiza o estado para inválido em tempo real.
                </p>
              </div>
            </div>

            {/* BOTÕES DE EXPORTAÇÃO */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setShowJsonCredential(!showJsonCredential)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-sky-400" />
                <span>{showJsonCredential ? 'Ocultar JSON W3C' : 'Ver W3C Verifiable Credential'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Cartão Digital (PDF / Print)</span>
              </button>
            </div>
          </div>

          {/* VISUALIZADOR DE CÓDIGO W3C JSON-LD */}
          {showJsonCredential && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 font-bold">
                  JSON-LD • Verifiable Credential v1.0
                </span>
                <button
                  onClick={handleCopyJson}
                  className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copiado!' : 'Copiar Payload'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-64">
                {JSON.stringify(verifiableCredentialJson, null, 2)}
              </pre>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
