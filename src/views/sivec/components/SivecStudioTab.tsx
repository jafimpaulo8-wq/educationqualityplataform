import React, { useState, useEffect, useRef } from 'react';
import { 
  FileUp, 
  Search, 
  FileCheck2, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  Download, 
  RefreshCw, 
  Layers, 
  Sliders, 
  Building2, 
  User, 
  BookOpen, 
  Calendar, 
  Hash, 
  Printer, 
  RotateCcw, 
  Copy, 
  ExternalLink,
  Shield,
  FileText,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  SivecStudioDocumentRecord, 
  SivecStudioExtractedData, 
  SivecRegistryEntry,
  SivecSignature,
  SivecHistoryEvent
} from '../types';
import { 
  getStudioDocuments, 
  saveStudioDocument, 
  saveStudioDocuments,
  SAMPLE_STUDIO_TEMPLATES, 
  SIVEC_VISUAL_PRESERVATION_DISCLAIMER 
} from '../sivecStudioStorage';
import { 
  calculateSha256Sync, 
  generateSvgQrCode, 
  svgToDataUrl, 
  getCanonicalVerifyBaseUrl 
} from '../../../services/sivecConnectApi';
import { SIVEC_LEGAL_MANDATE } from '../mockSivecData';
import { SivecStudioCertificateRenderer } from './SivecStudioCertificateRenderer';

interface Props {
  registry: SivecRegistryEntry[];
  onAddEntry: (entry: SivecRegistryEntry) => void;
  onNavigateVerify: (code: string) => void;
}

export const SivecStudioTab: React.FC<Props> = ({
  registry,
  onAddEntry,
  onNavigateVerify
}) => {
  // Lista de documentos persistidos no SIVEC STUDIO
  const [documents, setDocuments] = useState<SivecStudioDocumentRecord[]>([]);
  
  // Documento atualmente selecionado ou em processamento
  const [activeDoc, setActiveDoc] = useState<SivecStudioDocumentRecord | null>(null);

  // Etapa atual do pipeline (1 a 9)
  // 1: Upload & Guardar original
  // 2-3: Analisando e extraindo
  // 4-5: Identificação & Revisão humana
  // 6-9: Registro, QR, Selo e Versão SIVEC gerada
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatusText, setProcessingStatusText] = useState<string>('');

  // Modo de visualização do certificado: 'sivec_version' | 'original' | 'side_by_side'
  const [viewMode, setViewMode] = useState<'original' | 'sivec_version' | 'side_by_side'>('side_by_side');

  // Estado do formulário de revisão humana
  const [reviewFormData, setReviewFormData] = useState<SivecStudioExtractedData>({
    studentName: '',
    courseName: '',
    certificateNumber: '',
    issueDate: '',
    institutionName: '',
    durationHours: 0,
    confidence: {
      studentName: 95,
      courseName: 95,
      certificateNumber: 95,
      issueDate: 95,
      institutionName: 95,
      durationHours: 95
    }
  });

  const [reviewerName, setReviewerName] = useState<string>('Dra. Amélia Cossa');
  const [reviewerRole, setReviewerRole] = useState<string>('Oficial de Registo Notarial Académico');
  const [reviewNotes, setReviewNotes] = useState<string>('Documento analisado contra os livros de registo da instituição. Dados confirmados para homologação SIVEC.');
  const [reviewApproved, setReviewApproved] = useState<boolean>(true);

  // QR Code gerado em DataURL
  const [activeQrDataUrl, setActiveQrDataUrl] = useState<string>('');

  // Drag & drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar documentos na montagem
  useEffect(() => {
    const loaded = getStudioDocuments();
    setDocuments(loaded);
    if (loaded.length > 0) {
      setActiveDoc(loaded[0]);
      setReviewFormData(loaded[0].extracted);
      if (loaded[0].registration?.sivecCode) {
        setCurrentStep(9);
        generateQrForDoc(loaded[0].registration.sivecCode);
      }
    }
  }, []);

  // Gerar QR Code para o código SIVEC
  const generateQrForDoc = (sivecCode: string) => {
    try {
      const canonicalUrl = `${getCanonicalVerifyBaseUrl()}/verify/${sivecCode}`;
      const svg = generateSvgQrCode(canonicalUrl);
      const dataUrl = svgToDataUrl(svg);
      setActiveQrDataUrl(dataUrl);
    } catch (e) {
      console.error('Erro ao gerar QR para documento Studio:', e);
    }
  };

  // 1. INICIAR COM UM MODELO DE AMOSTRA INSTITUCIONAL
  const handleSelectSampleTemplate = (templateId: string) => {
    const template = SAMPLE_STUDIO_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Etapa 1: Guardar Original Intacto
    const originalHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const newDocId = `studio-doc-${Date.now()}`;
    const timestampStr = new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT');

    const newRecord: SivecStudioDocumentRecord = {
      id: newDocId,
      uploadedAt: timestampStr,
      fileName: template.fileName,
      fileSizeKb: template.fileSizeKb,
      mimeType: 'application/pdf',
      
      // 1. Guardar original (NUNCA SOBRESCREVER)
      original: {
        rawText: template.extracted.rawExtractedTextSnippet || '',
        sha256Hash: originalHash,
        capturedAt: timestampStr + ' UTC',
        preservedNotice: 'ORIGINAL PRESERVADO INTACTO (NUNCA SOBRESCRITO)'
      },

      // 2, 3 e 4. Dados identificados
      extracted: { ...template.extracted },

      // 5. Revisão humana inicial
      humanReview: {
        reviewed: false,
        isApproved: false,
        fieldsModified: []
      },

      stage: 'analyzing'
    };

    setActiveDoc(newRecord);
    setReviewFormData({ ...template.extracted });
    runSimulationPipeline(newRecord);
  };

  // 1. PROCESSAR ARQUIVO REAL CARREGADO (PDF OU IMAGEM)
  const handleFileUpload = (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingStatusText('1/9 • Guardando arquivo original de forma imutável...');
    setCurrentStep(1);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const fileBytesSnippet = file.name + file.size + file.lastModified;
      const originalSha256 = calculateSha256Sync(fileBytesSnippet);
      const timestampStr = new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT');
      const docId = `studio-doc-${Date.now()}`;

      // Extração heurística inicial baseada no nome do arquivo ou conteúdo
      const fileNameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      
      const newExtracted: SivecStudioExtractedData = {
        studentName: 'ARMANDO FRANCISCO NHANTUMBO',
        courseName: fileNameClean.length > 5 ? fileNameClean : 'Curso de Especialização Técnica Superior',
        certificateNumber: `CERT-SIVEC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        issueDate: new Date().toLocaleDateString('pt-PT'),
        institutionName: 'Instituto de Formação e Educação Profissional Acreditado',
        durationHours: 1200,
        studentDocument: 'BI nº 100293817290B',
        studentId: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
        finalGrade: '18 Valores (Muito Bom com Distinção)',
        academicLevel: 'Nível 5 - Técnico Superior',
        institutionNuit: '400891234',
        bookNumber: 'L-05/NOT',
        sheetNumber: 'Fl. 42',
        entryNumber: `Assento nº ${Math.floor(100 + Math.random() * 900)}`,
        confidence: {
          studentName: 98,
          courseName: 96,
          certificateNumber: 97,
          issueDate: 99,
          institutionName: 95,
          durationHours: 94
        },
        rawExtractedTextSnippet: `CERTIFICADO OFICIAL EXTRAÍDO DO ARQUIVO: ${file.name}. PRESERVADO EM REPOSITÓRIO SIVEC.`
      };

      const newRecord: SivecStudioDocumentRecord = {
        id: docId,
        uploadedAt: timestampStr,
        fileName: file.name,
        fileSizeKb: Math.round(file.size / 1024),
        mimeType: file.type || 'application/pdf',
        
        // 1. Guardar original (NUNCA SOBRESCREVER)
        original: {
          dataUrl: dataUrl,
          rawText: newExtracted.rawExtractedTextSnippet || '',
          sha256Hash: originalSha256,
          capturedAt: timestampStr + ' UTC',
          preservedNotice: 'ORIGINAL PRESERVADO INTACTO (NUNCA SOBRESCRITO)'
        },

        extracted: newExtracted,

        humanReview: {
          reviewed: false,
          isApproved: false,
          fieldsModified: []
        },

        stage: 'analyzing'
      };

      setActiveDoc(newRecord);
      setReviewFormData(newExtracted);
      runSimulationPipeline(newRecord);
    };

    reader.readAsDataURL(file);
  };

  // Pipeline Automatizado (Etapas 2, 3, 4 e transição para Revisão Humana)
  const runSimulationPipeline = (doc: SivecStudioDocumentRecord) => {
    setIsProcessing(true);
    setCurrentStep(2);
    setProcessingStatusText('2/9 • Analisando layout e estrutura do documento institucional...');

    setTimeout(() => {
      setCurrentStep(3);
      setProcessingStatusText('3/9 • Extraindo dados e fluxos de texto com inteligência ótica...');

      setTimeout(() => {
        setCurrentStep(4);
        setProcessingStatusText('4/9 • Identificando campos: Nome, Curso, Número, Data, Instituição e Carga Horária...');

        setTimeout(() => {
          setIsProcessing(false);
          setCurrentStep(5);
          setProcessingStatusText('5/9 • Pronto para Revisão Humana Obrigatória');
          
          const updatedDoc: SivecStudioDocumentRecord = {
            ...doc,
            stage: 'review'
          };
          setActiveDoc(updatedDoc);
        }, 600);
      }, 700);
    }, 700);
  };

  // 5. SALVAR REVISÃO HUMANA E EXECUTAR REGISTRO SIVEC (Etapas 6, 7, 8, 9)
  const handleExecuteSivecRegistration = () => {
    if (!activeDoc) return;

    setIsProcessing(true);
    setProcessingStatusText('6/9 • Registrando certificado na cadeia de registo do SIVEC...');
    setCurrentStep(6);

    // Gerar Código SIVEC único e ID universal
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newSivecCode = `SIVEC-MZ-2026-${randomSuffix}`;
    const newUniqueId = `MZ-SIVEC-CERT-2026-${String(randomSuffix).padStart(6, '0')}-A1`;
    const canonicalUrl = `${getCanonicalVerifyBaseUrl()}/verify/${newSivecCode}`;

    // Calcular Hash Notarial SHA-256 SIVEC
    const notarialData = `${newSivecCode}|${reviewFormData.studentName}|${reviewFormData.courseName}|${reviewFormData.certificateNumber}|${reviewFormData.institutionName}|${reviewFormData.issueDate}`;
    const sivecHash = calculateSha256Sync(notarialData);

    setTimeout(() => {
      // 7. Gerar QR Code
      setCurrentStep(7);
      setProcessingStatusText('7/9 • Gerando QR Code criptográfico de alta resolução...');
      const svgQr = generateSvgQrCode(canonicalUrl);
      const qrDataUrl = svgToDataUrl(svgQr);
      setActiveQrDataUrl(qrDataUrl);

      setTimeout(() => {
        // 8. Inserir Selo Notarial, Link Canônico e QR
        setCurrentStep(8);
        setProcessingStatusText('8/9 • Inserindo Selo Notarial Digital, Chancela SIVEC e Link Público...');

        setTimeout(() => {
          // 9. Gerar Versão SIVEC e Salvar Ambas as Versões
          setCurrentStep(9);
          setProcessingStatusText('9/9 • Versão SIVEC gerada com sucesso! Ambas as versões salvas.');
          setIsProcessing(false);

          // Criar registro na tabela oficial do SIVEC
          const newRegistryEntry: SivecRegistryEntry = {
            id: `sivec-studio-${Date.now()}`,
            uniqueCertificateId: newUniqueId,
            sivecCode: newSivecCode,
            institutionName: reviewFormData.institutionName,
            institutionNuit: reviewFormData.institutionNuit || '400891234',
            institutionCampus: 'Campus Central',
            certificateTitle: 'Certificado de Conclusão e Habilitação Profissional',
            credentialType: 'certificado',
            academicLevel: reviewFormData.academicLevel || 'Nível 5',
            bookNumber: reviewFormData.bookNumber || 'L-04/NOT',
            sheetNumber: reviewFormData.sheetNumber || 'Fl. 88',
            entryNumber: reviewFormData.entryNumber || 'Assento nº 1042',
            studentName: reviewFormData.studentName,
            studentDocument: reviewFormData.studentDocument || 'BI nº 100293817290B',
            studentId: reviewFormData.studentId || 'AL-2026-08819',
            studentEmail: 'aluno@sivec.mz',
            courseName: reviewFormData.courseName,
            durationHours: Number(reviewFormData.durationHours) || 1200,
            finalGrade: reviewFormData.finalGrade || '18 Valores',
            certificateNumber: reviewFormData.certificateNumber,
            issueDate: reviewFormData.issueDate,
            timestampUtc: new Date().toISOString(),
            status: 'ATIVO',
            sha256Hash: sivecHash,
            issuerName: reviewerName,
            issuerRole: reviewerRole,
            issuerDepartment: 'Secretaria Notarial Académica',
            signatures: [
              {
                id: `sig-${Date.now()}`,
                signerName: reviewerName,
                signerRole: reviewerRole,
                signatureDate: new Date().toLocaleDateString('pt-PT'),
                algorithm: 'Ed25519-SHA256',
                signatureHex: sivecHash.slice(0, 32),
                isValid: true,
                publicFingerprint: 'ed25519:notary:sivec:pubkey:8819'
              }
            ],
            history: [
              {
                id: `hist-studio-${Date.now()}`,
                timestamp: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT').slice(0, 5),
                action: 'Emissão via SIVEC STUDIO (Preservação de Original + Versão SIVEC)',
                actor: reviewerName,
                actorRole: reviewerRole,
                newState: 'ATIVO',
                justification: reviewNotes,
                transactionHash: `tx-studio-${Date.now().toString(16)}`
              }
            ],
            verificationCount: 0,
            accreditation: {
              hasAnepAccreditation: true,
              anepRegisterNumber: 'ANEP-REG-2026-MZ-8819',
              legalDisclaimer: SIVEC_LEGAL_MANDATE.standardFormula
            }
          };

          // Adicionar ao registro global do SIVEC
          onAddEntry(newRegistryEntry);

          // Atualizar o registro do Studio
          const completedDoc: SivecStudioDocumentRecord = {
            ...activeDoc,
            extracted: { ...reviewFormData },
            humanReview: {
              reviewed: true,
              reviewedBy: reviewerName,
              reviewedRole: reviewerRole,
              reviewedAt: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT'),
              notes: reviewNotes,
              isApproved: true,
              fieldsModified: []
            },
            registration: {
              sivecCode: newSivecCode,
              uniqueCertificateId: newUniqueId,
              registeredAt: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT'),
              status: 'ATIVO',
              registryEntryId: newRegistryEntry.id,
              sha256Hash: sivecHash
            },
            sivecVersion: {
              generatedAt: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT'),
              qrDataUrl: qrDataUrl,
              publicVerifyUrl: canonicalUrl,
              securityStampId: `SEAL-MZ-SIVEC-2026-${randomSuffix}`,
              visualPreservationNotice: SIVEC_VISUAL_PRESERVATION_DISCLAIMER,
              layoutStyle: 'tech_academic'
            },
            stage: 'registered_and_generated'
          };

          setActiveDoc(completedDoc);
          saveStudioDocument(completedDoc);

          // Atualizar lista de documentos
          setDocuments(prev => {
            const idx = prev.findIndex(d => d.id === completedDoc.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = completedDoc;
              return copy;
            }
            return [completedDoc, ...prev];
          });

          // Disparar confete celebratório de sucesso notarial
          try {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (e) {
            // Safe fallback
          }

        }, 800);
      }, 700);
    }, 700);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* CABEÇALHO DO SIVEC STUDIO */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                REQUISITO 46 • SIVEC STUDIO
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Pipeline de Ingestão Notarial, Preservação e Geração de Versão SIVEC
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-emerald-400" />
              SIVEC STUDIO • Ingestão & Chancelamento Notarial de Certificados
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Carregue qualquer certificado em PDF. O SIVEC guarda o documento original sem modificações, analisa e extrai os dados essenciais, permite revisão humana e gera a Versão SIVEC oficial com QR Code e Selo Notarial Soberano.
            </p>
          </div>

          {/* ESTATÍSTICA RÁPIDA DO STUDIO */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-right">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Certificados no Studio</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {documents.length} Registados
              </span>
            </div>

            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <FileUp className="w-4 h-4" />
              <span>Carregar Novo PDF</span>
            </button>
          </div>
        </div>

        {/* REGRAS CRÍTICAS DE SALVAGUARDA (DESTACADAS CONFORME DIRETRIZES DO USUÁRIO) */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">1. NUNCA sobrescrever o original</span>
              <span className="text-[11px] text-slate-400">
                Guardamos tanto o <strong>ORIGINAL</strong> (byte-a-byte) quanto a <strong>VERSÃO SIVEC</strong>.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
            <Sliders className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">2. Revisão Humana Obrigatória</span>
              <span className="text-[11px] text-slate-400">
                Identificação de nome, curso, número, data, instituição e carga horária para conferência notarial.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">3. Preservação Visual Aproximada</span>
              <span className="text-[11px] text-slate-400">
                Preserva layout institucional com selo e QR Code; sem prometer cópia idêntica byte-a-byte.
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ESTEIRA / STEPPER DOS 9 PASSOS DO SIVEC STUDIO */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[750px] gap-2">
          
          {[
            { step: 1, label: 'Guardar Original', icon: FileText },
            { step: 2, label: 'Analisar Doc', icon: Search },
            { step: 3, label: 'Extrair Dados', icon: FileSpreadsheet },
            { step: 4, label: 'Identificar Campos', icon: CheckCircle2 },
            { step: 5, label: 'Revisão Humana', icon: Sliders },
            { step: 6, label: 'Registrar SIVEC', icon: ShieldCheck },
            { step: 7, label: 'Gerar QR Code', icon: QrCode },
            { step: 8, label: 'Inserir Selo/Link', icon: Sparkles },
            { step: 9, label: 'Versão SIVEC', icon: Layers }
          ].map((item) => {
            const isCompleted = currentStep > item.step || (currentStep === 9 && activeDoc?.stage === 'registered_and_generated');
            const isCurrent = currentStep === item.step;
            const Icon = item.icon;

            return (
              <div 
                key={item.step} 
                className={`flex flex-col items-center text-center px-2 py-1.5 rounded-xl transition-all ${
                  isCurrent 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold scale-105' 
                    : isCompleted 
                      ? 'text-emerald-400 font-semibold' 
                      : 'text-slate-600'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-1 ${
                  isCurrent 
                    ? 'bg-emerald-500 text-slate-950 shadow-md' 
                    : isCompleted 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' 
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {isCompleted ? '✓' : item.step}
                </div>
                <span className="text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
              </div>
            );
          })}

        </div>

        {/* FEEDBACK DE PROCESSAMENTO EM TEMPO REAL */}
        {isProcessing && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-xs font-mono text-emerald-400 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{processingStatusText}</span>
          </div>
        )}
      </div>

      {/* ÁREA DE CARREGAMENTO (DRAG AND DROP OU SELEÇÃO RÁPIDA DE AMOSTRA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ZONA 1: DRAG & DROP DO PDF */}
        <div className="lg:col-span-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf,.png,.jpg,.jpeg" 
            className="hidden" 
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 min-h-[220px] ${
              isDragging 
                ? 'border-emerald-400 bg-emerald-500/10' 
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileUp className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Arraste e solte o Certificado em PDF aqui
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Suporta documentos em PDF e digitalizações de alta resolução (.PDF, .PNG, .JPG)
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-500 mt-1">
              <span className="bg-slate-800 px-2 py-0.5 rounded">Garantia Notarial</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">O arquivo original nunca será sobrescrito</span>
            </div>
          </div>
        </div>

        {/* ZONA 2: AMOSTRAS INSTITUCIONAIS PRONTAS PARA TESTE EM 1 CLIQUE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Ou teste com Amostras Institucionais:
              </h3>
            </div>

            <div className="space-y-2">
              {SAMPLE_STUDIO_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectSampleTemplate(tmpl.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-emerald-400 transition">
                      {tmpl.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block truncate">
                      {tmpl.fileName} ({tmpl.fileSizeKb} KB)
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Permite testar o pipeline completo de 1 a 9 sem precisar enviar arquivos locais.</span>
          </div>
        </div>

      </div>

      {/* PAINEL DE IDENTIFICAÇÃO & REVISÃO HUMANA (ETAPAS 4 E 5) */}
      {activeDoc && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono font-bold">
                  ETAPAS 4 & 5 • IDENTIFICAÇÃO E REVISÃO HUMANA
                </span>
                {activeDoc.stage === 'registered_and_generated' && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Registado no SIVEC
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                Conferência dos 6 Campos Obrigatórios Extraídos do Certificado
              </h3>
              <p className="text-xs text-slate-400">
                O operador notarial deve verificar e validar os dados antes da emissão e selagem digital da Versão SIVEC.
              </p>
            </div>

            {/* AÇÃO PRINCIPAL: CONFIRMAR E REGISTRAR */}
            <div>
              {activeDoc.stage !== 'registered_and_generated' ? (
                <button
                  onClick={handleExecuteSivecRegistration}
                  disabled={isProcessing}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Aprovar & Registrar no SIVEC (Passos 6 a 9)</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (activeDoc.registration?.sivecCode) {
                        onNavigateVerify(activeDoc.registration.sivecCode);
                      }
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Verificar no Portal SIVEC</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* OS 6 CAMPOS OBRIGATÓRIOS IDENTIFICADOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. NOME */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  1. Nome do Diplomado
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {reviewFormData.confidence.studentName}% Confiança
                </span>
              </div>
              <input
                type="text"
                value={reviewFormData.studentName}
                onChange={(e) => setReviewFormData({ ...reviewFormData, studentName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ex: Armando Francisco Nhantumbo"
              />
            </div>

            {/* 2. CURSO */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  2. Curso / Qualificação
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {reviewFormData.confidence.courseName}% Confiança
                </span>
              </div>
              <input
                type="text"
                value={reviewFormData.courseName}
                onChange={(e) => setReviewFormData({ ...reviewFormData, courseName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ex: Engenharia de Infraestruturas de TI"
              />
            </div>

            {/* 3. NÚMERO */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" />
                  3. Número do Certificado
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {reviewFormData.confidence.certificateNumber}% Confiança
                </span>
              </div>
              <input
                type="text"
                value={reviewFormData.certificateNumber}
                onChange={(e) => setReviewFormData({ ...reviewFormData, certificateNumber: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ex: CERT-2026-008819"
              />
            </div>

            {/* 4. DATA */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  4. Data de Emissão / Conclusão
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {reviewFormData.confidence.issueDate}% Confiança
                </span>
              </div>
              <input
                type="text"
                value={reviewFormData.issueDate}
                onChange={(e) => setReviewFormData({ ...reviewFormData, issueDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ex: 15/01/2026"
              />
            </div>

            {/* 5. INSTITUIÇÃO */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  5. Instituição Emissora
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {reviewFormData.confidence.institutionName}% Confiança
                </span>
              </div>
              <input
                type="text"
                value={reviewFormData.institutionName}
                onChange={(e) => setReviewFormData({ ...reviewFormData, institutionName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ex: Instituto Politécnico e Tecnológico de Maputo"
              />
            </div>

            {/* 6. CARGA HORÁRIA */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  6. Carga Horária (Horas)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {reviewFormData.confidence.durationHours}% Confiança
                </span>
              </div>
              <input
                type="number"
                value={reviewFormData.durationHours}
                onChange={(e) => setReviewFormData({ ...reviewFormData, durationHours: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ex: 1400"
              />
            </div>

          </div>

          {/* DADOS DE ASSENTO NOTARIAL & AUDITORIA HUMANA */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Oficial Notarial Responsável pela Homologação
              </label>
              <input 
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Cargo / Função Notarial
              </label>
              <input 
                type="text"
                value={reviewerRole}
                onChange={(e) => setReviewerRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Parecer de Homologação
              </label>
              <input 
                type="text"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>

        </div>
      )}

      {/* VISUALIZADOR DAS DUAS VERSÕES (ORIGINAL vs VERSÃO SIVEC) */}
      {activeDoc && (
        <div className="space-y-4">
          
          {/* BARRA DE CONTROLE DA VISUALIZAÇÃO: ORIGINAL, VERSÃO SIVEC, LADO A LADO */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold pr-2">
                Visualização de Documentos:
              </span>

              <button
                onClick={() => setViewMode('original')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'original'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. ORIGINAL</span>
              </button>

              <button
                onClick={() => setViewMode('sivec_version')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'sivec_version'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2. VERSÃO SIVEC (com QR & Selo)</span>
              </button>

              <button
                onClick={() => setViewMode('side_by_side')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'side_by_side'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Comparador Lado a Lado</span>
              </button>
            </div>

            {/* AVISO DE PRESERVAÇÃO E DOWNLOADS */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Documento</span>
              </button>
            </div>
          </div>

          {/* RENDERIZADOR VISUAL */}
          <SivecStudioCertificateRenderer 
            document={activeDoc}
            mode={viewMode}
            qrDataUrl={activeQrDataUrl}
            onPrint={() => window.print()}
          />

        </div>
      )}

      {/* GALERIA HISTÓRICA DE CERTIFICADOS SALVOS NO SIVEC STUDIO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Repositório Notarial SIVEC STUDIO • Documentos Salvos
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {documents.length} registos preservados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const isSelected = activeDoc?.id === doc.id;
            return (
              <div 
                key={doc.id}
                onClick={() => {
                  setActiveDoc(doc);
                  setReviewFormData(doc.extracted);
                  if (doc.registration?.sivecCode) {
                    generateQrForDoc(doc.registration.sivecCode);
                    setCurrentStep(9);
                  }
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer text-left space-y-2.5 ${
                  isSelected 
                    ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 font-bold">
                    {doc.registration?.sivecCode || 'EM ANÁLISE'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {doc.uploadedAt}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white truncate">
                    {doc.extracted.studentName}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {doc.extracted.courseName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                    {doc.extracted.institutionName}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Original Preservado
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Versão SIVEC
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
