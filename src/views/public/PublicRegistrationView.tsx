import React, { useState, useMemo, useEffect } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Printer, 
  Share2, 
  MessageCircle, 
  Search, 
  Sparkles, 
  QrCode, 
  AlertTriangle, 
  School, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  HelpCircle, 
  RotateCcw,
  XCircle,
  BookOpen,
  Camera,
  HeartHandshake,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { soundManager } from '../../utils/audio';
import { PROVINCES_MOZAMBIQUE } from '../../data/mockData';
import { RegistrationApplication, PublicInstitution, OnlineCourseConfig } from '../../types';
import { 
  resolvePublicInstitutionBySlug, 
  compressImageToBase64 
} from '../../services/publicInstitutionService';

/**
 * Extrai o slug institucional a partir da URL (hash, pathname ou search query).
 */
function extractSlugFromBrowser(): string {
  if (typeof window === 'undefined') return '';
  const hash = window.location.hash || '';
  const pathname = window.location.pathname || '';
  const search = window.location.search || '';

  // 1. Hash match: #instituicoes/:slug/inscricoes ou #instituicao/:slug/inscricoes
  const hashMatch = hash.match(/instituico?e?s\/([^/?#]+)/i);
  if (hashMatch && hashMatch[1]) {
    return hashMatch[1].trim();
  }

  // 2. Pathname match: /instituicoes/:slug/inscricoes ou /instituicao/:slug/inscricoes
  const pathMatch = pathname.match(/\/instituico?e?s\/([^/?#]+)/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1].trim();
  }

  // 3. Search query: ?inst=..., ?slug=..., ?institutionId=...
  const params = new URLSearchParams(search);
  const qSlug = params.get('slug') || params.get('inst') || params.get('institutionId') || params.get('institution');
  if (qSlug) {
    return qSlug.trim();
  }

  return '';
}

/**
 * Oculta PII do candidato para consulta pública segura.
 * Mostra apenas as iniciais e o último apelido (ex.: "Ca•••••• Munguambe").
 */
function maskCandidateName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2) + '••••••';
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.slice(0, 2)}•••••• ${last}`;
}

export const PublicRegistrationView: React.FC = () => {
  const { 
    allInstitutions,
    addApplication, 
    applications,
    navigate,
    openWhatsAppMessage,
    themeMode
  } = useApp();

  const isLight = themeMode === 'branco';

  // Resolução Assíncrona e Isolada da Instituição Pública
  const [resolvedPublicInst, setResolvedPublicInst] = useState<PublicInstitution | null>(null);
  const [isLoadingInst, setIsLoadingInst] = useState<boolean>(true);
  const [slugNotFound, setSlugNotFound] = useState<boolean>(false);

  // Efeito de resolução de tenant sem vazamento
  useEffect(() => {
    let isCancelled = false;
    const rawSlug = extractSlugFromBrowser();

    if (!rawSlug) {
      setSlugNotFound(true);
      setIsLoadingInst(false);
      return;
    }

    resolvePublicInstitutionBySlug(rawSlug, allInstitutions)
      .then(result => {
        if (isCancelled) return;
        if (result) {
          setResolvedPublicInst(result);
          setSlugNotFound(false);
        } else {
          setSlugNotFound(true);
        }
        setIsLoadingInst(false);
      })
      .catch(err => {
        console.warn('Erro ao resolver instituição pública:', err);
        if (!isCancelled) {
          setSlugNotFound(true);
          setIsLoadingInst(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [allInstitutions]);

  // Identificação do tipo institucional para adaptação da UI
  const isChildCenter = useMemo(() => {
    if (!resolvedPublicInst) return false;
    const type = (resolvedPublicInst.type || '').toLowerCase();
    const id = (resolvedPublicInst.institutionId || resolvedPublicInst.id || '').toLowerCase();
    const name = (resolvedPublicInst.name || '').toLowerCase();
    return type === 'centro_infantil' || id.includes('ceu-azul') || name.includes('infantil') || name.includes('creche') || name.includes('jardim');
  }, [resolvedPublicInst]);

  const isSchool = useMemo(() => {
    if (!resolvedPublicInst) return false;
    const type = (resolvedPublicInst.type || '').toLowerCase();
    return type === 'escola' || type === 'escola_primaria' || type === 'escola_secundaria';
  }, [resolvedPublicInst]);

  // Configuração efetiva da instituição pública resolvida
  const effectiveConfig = useMemo(() => {
    return resolvedPublicInst?.onlineRegistrationConfig || {
      institutionId: '',
      isOpen: true,
      title: 'Inscrições Online',
      description: 'Preencha o formulário para submeter a sua candidatura oficial.',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      academicYear: '2026',
      semester: '1º Semestre',
      confirmationMessageTemplate: 'Inscrição submetida com sucesso.',
      requiredFields: {},
      requiredDocuments: [],
      coursesConfig: [],
      customQuestions: []
    };
  }, [resolvedPublicInst]);

  // Active Main View Tab: 'formulario' | 'consultar'
  const [activeTab, setActiveTab] = useState<'formulario' | 'consultar'>('formulario');

  // Form Step State (1: Curso/Sala, 2: Dados Pessoais, 3: Questionário, 4: Documentos, 5: Pagamento & Submissão)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidate, setSubmittedCandidate] = useState<RegistrationApplication | null>(null);

  // Termos e Privacidade
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Cursos / Salas ativos da instituição
  const activeCourses: OnlineCourseConfig[] = useMemo(() => {
    return (effectiveConfig.coursesConfig || []).filter(c => c.active !== false);
  }, [effectiveConfig]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  useEffect(() => {
    if (activeCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(activeCourses[0].courseId);
    }
  }, [activeCourses, selectedCourseId]);

  const selectedCourse = useMemo(() => {
    return activeCourses.find(c => c.courseId === selectedCourseId) || activeCourses[0];
  }, [activeCourses, selectedCourseId]);

  const [regime, setRegime] = useState<'Laboral' | 'Pós-Laboral' | 'Online'>('Laboral');
  const [shift, setShift] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');

  // Campos Pessoais (Adaptados: Criança ou Jovem/Adulto)
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<'BI' | 'Passaporte' | 'DIRE' | 'Cédula'>('BI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [nuit, setNuit] = useState('');
  const [birthDate, setBirthDate] = useState('2021-04-12');
  const [gender, setGender] = useState<'Masculino' | 'Feminino' | 'Outro'>('Masculino');
  const [phone, setPhone] = useState('');
  const [guardianAltPhone, setGuardianAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('Nampula');
  const [city, setCity] = useState('Nacala');
  const [address, setAddress] = useState('');
  
  // Encarregados & Pessoas autorizadas (Obrigatório em Centro Infantil)
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('Mãe');
  const [authorizedPickupPersons, setAuthorizedPickupPersons] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');

  // Fotografia tipo passe (comprimida <= 150 KB)
  const [candidatePhotoUrl, setCandidatePhotoUrl] = useState<string>('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  // Questionário customizado
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  // Documentos anexados
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { fileName: string; fileSize: string; uploadedAt: string }>>({});

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'e-Mola' | 'BIM' | 'Presencial'>('M-Pesa');
  const [mpesaNumber, setMpesaNumber] = useState('84');
  const [paymentSimulatedSuccess, setPaymentSimulatedSuccess] = useState(false);

  // Status Lookup State
  const [searchCode, setSearchCode] = useState('');
  const [lookedUpApplication, setLookedUpApplication] = useState<RegistrationApplication | null>(null);
  const [lookupAttempted, setLookupAttempted] = useState(false);

  // Estado das Inscrições
  const isOpen = effectiveConfig.isOpen !== false;

  // Handler para upload e compressão da foto tipo passe (<= 150 KB)
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingPhoto(true);
      const compressedDataUrl = await compressImageToBase64(file, 150000);
      setCandidatePhotoUrl(compressedDataUrl);
      soundManager.playSuccess();
    } catch (err) {
      console.warn('Falha na compressão da imagem:', err);
      alert('Não foi possível processar a imagem. Tente uma foto menor em formato JPG ou PNG.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleAnswerChange = (qId: string, answer: string) => {
    setCustomAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  // Upload simulado de documento com nome amigável
  const handleUploadDoc = (docTitle: string) => {
    soundManager.playClick();
    const mockFiles = [
      { name: `${docTitle.replace(/\s+/g, '_')}_Digitalizado.pdf`, size: '120 KB' },
      { name: `${docTitle.replace(/\s+/g, '_')}_Certificado.pdf`, size: '145 KB' }
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setUploadedDocs(prev => ({
      ...prev,
      [docTitle]: {
        fileName: picked.name,
        fileSize: picked.size,
        uploadedAt: new Date().toISOString().split('T')[0]
      }
    }));
  };

  const handleRemoveDoc = (docTitle: string) => {
    setUploadedDocs(prev => {
      const copy = { ...prev };
      delete copy[docTitle];
      return copy;
    });
  };

  const handleSimulatePayment = () => {
    soundManager.playSuccess();
    setPaymentSimulatedSuccess(true);
  };

  // Submissão Oficial com Prevenção de Duplo Clique e Validação Estrita
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!resolvedPublicInst) {
      alert('Instituição inválida. Por favor recarregue a página com o link correto.');
      return;
    }

    if (!fullName.trim()) {
      alert(isChildCenter ? 'Por favor, informe o Nome Completo da Criança.' : 'Por favor, informe o seu Nome Completo.');
      return;
    }

    if (!birthDate) {
      alert('Por favor, informe a Data de Nascimento.');
      return;
    }

    if (isChildCenter) {
      if (!guardianName.trim()) {
        alert('O Nome do Encarregado de Educação é obrigatório para centros infantis.');
        return;
      }
      if (!phone.trim()) {
        alert('O Contacto Telefónico do Encarregado de Educação é obrigatório.');
        return;
      }
    } else {
      if (!documentNumber.trim()) {
        alert('Por favor, informe o Número do Documento (BI / DIRE / Passaporte).');
        return;
      }
      if (!phone.trim()) {
        alert('Por favor, informe o Contacto Telefónico principal.');
        return;
      }
    }

    if (!termsAccepted || !privacyAccepted) {
      alert('É obrigatório aceitar o Regulamento e a Política de Privacidade para submeter a candidatura.');
      return;
    }

    setIsSubmitting(true);
    soundManager.playClick();

    setTimeout(() => {
      try {
        const documentsList = (Object.entries(uploadedDocs) as [string, { fileName: string; fileSize: string; uploadedAt: string }][]).map(([docType, fileInfo], idx) => ({
          id: `cand-doc-${Date.now()}-${idx}`,
          name: docType,
          type: docType,
          fileName: fileInfo.fileName,
          fileSize: fileInfo.fileSize,
          url: '#',
          verified: false,
          uploadedAt: fileInfo.uploadedAt
        }));

        const customAnswersArray = (effectiveConfig.customQuestions || []).map(q => ({
          questionId: q.id,
          question: q.question,
          answer: customAnswers[q.id] || (q.type === 'boolean' ? 'Não' : 'Não informado')
        }));

        const nowIso = new Date().toISOString();
        const created = addApplication({
          institutionId: resolvedPublicInst.institutionId,
          branchId: resolvedPublicInst.branches?.[0]?.id || 'branch-main',
          status: 'Pendente',
          fullName: fullName.trim(),
          documentType,
          documentNumber: documentNumber.trim() || 'CERT-PENDENTE',
          birthDate,
          gender: gender as any,
          phone: phone.trim(),
          email: email.trim() || `${phone.replace(/\D/g, '')}@candidato.mz`,
          province,
          city,
          address: address.trim(),
          guardianName: guardianName.trim() || (isChildCenter ? 'Encarregado Declarado' : undefined),
          guardianPhone: (guardianAltPhone.trim() || phone.trim()) || undefined,
          courseId: selectedCourse?.courseId || selectedCourseId || 'geral',
          courseName: selectedCourse?.courseName || (isChildCenter ? 'Sala de Cuidados e Educação' : 'Ensino Regular'),
          regime,
          shift,
          photoUrl: candidatePhotoUrl || (gender === 'Feminino' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'),
          paymentStatus: paymentSimulatedSuccess ? 'Pago' : 'Pendente',
          paymentAmount: selectedCourse?.price || 1500,
          paymentMethod,
          paymentReference: paymentSimulatedSuccess ? `MPESA-TX-${Date.now().toString().slice(-6)}` : `REF-${Date.now().toString().slice(-6)}`,
          documents: documentsList,
          customAnswers: customAnswersArray,
          termsAccepted: true,
          termsAcceptedAt: nowIso,
          privacyAccepted: true
        });

        setSubmittedCandidate(created);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
        soundManager.playSuccess();
      } catch (err) {
        console.error('Erro na submissão de candidatura:', err);
        alert('Ocorreu um erro ao submeter a candidatura. Verifique os dados e tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    }, 800);
  };

  // Pesquisa de Candidatura com Anonimização Estrita de PII
  const handleSearchApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim() || !resolvedPublicInst) return;
    setLookupAttempted(true);
    const q = searchCode.trim().toLowerCase();

    // Filtra exclusivamente dentro da instituição resolvida
    const found = applications.find(app => {
      const matchInst = app.institutionId === resolvedPublicInst.institutionId || app.institutionId === resolvedPublicInst.id;
      if (!matchInst) return false;
      return (
        app.code.toLowerCase() === q || 
        app.documentNumber.toLowerCase() === q ||
        app.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      );
    });

    setLookedUpApplication(found || null);
    if (found) {
      soundManager.playSuccess();
    } else {
      soundManager.playNotification();
    }
  };

  // 1. Tela de Carregamento da Instituição
  if (isLoadingInst) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center select-none font-sans ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
      }`}>
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-4">
          <GraduationCap className="w-7 h-7 text-sky-400 animate-pulse" />
        </div>
        <h2 className="text-base font-bold">A carregar portal institucional...</h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">SIGAR PRO • Inscrições Online</p>
      </div>
    );
  }

  // 2. Tela de Link Inválido (Regra Mandatória 1: Sem vazamento, sem redirecionar para admin)
  if (slugNotFound || !resolvedPublicInst) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center select-none font-sans ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}>
        <div className="max-w-md w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-sky-400">
            <School className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block font-mono">
              SIGAR PRO • PLATAFORMA OFICIAL
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Portal de Candidaturas</h2>
          </div>
          
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm font-semibold leading-relaxed">
            Link inválido. Solicita o endereço correcto à instituição.
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Cada instituição de ensino e formação credenciada no SIGAR PRO possui um endereço próprio e isolado para recepção de candidaturas.
          </p>

          <div className="pt-2">
            <button
              onClick={() => navigate('public_portal')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Portal Principal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Renderização Principal do Portal Institucional Isolado
  return (
    <div className={`min-h-screen font-sans transition-colors ${
      isLight 
        ? 'bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white' 
        : 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950'
    }`}>
      {/* Top Portal Banner & Institution Branding */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isLight ? 'border-slate-200 bg-white/95' : 'border-slate-800/80 bg-slate-900/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold overflow-hidden ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              {resolvedPublicInst.logoUrl ? (
                <img src={resolvedPublicInst.logoUrl} alt={resolvedPublicInst.name} className="w-full h-full object-cover" />
              ) : (
                <School className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-bold text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-md ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {resolvedPublicInst.name}
                </h1>
                <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  Portal Oficial
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {resolvedPublicInst.city ? `${resolvedPublicInst.city}, ${resolvedPublicInst.province}` : 'Inscrições Online Oficiais'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('formulario'); soundManager.playClick(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'formulario'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Fazer Inscrição
            </button>
            <button
              onClick={() => { setActiveTab('consultar'); soundManager.playClick(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'consultar'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Consultar Estado
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Campaign Announcement Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isOpen 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
                {isOpen ? 'Inscrições Abertas' : 'Inscrições Encerradas'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                Ano Letivo {effectiveConfig.academicYear} • {effectiveConfig.semester}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {effectiveConfig.title || `Inscrições Abertas — ${resolvedPublicInst.name}`}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {effectiveConfig.description || (isChildCenter
                ? 'Garanta o desenvolvimento e o acolhimento seguro da sua criança com instalações modernas e educadores dedicados.'
                : 'Preencha o formulário eletrônico e submeta a sua candidatura oficial para homologação da secretaria.')}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Período: {effectiveConfig.startDate} até {effectiveConfig.endDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>{activeCourses.length} {isChildCenter ? 'Salas/Grupos Disponíveis' : 'Cursos/Classes'}</span>
              </div>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Tab 1: Formulário de Inscrição */}
        {activeTab === 'formulario' ? (
          submittedCandidate ? (
            /* Submission Success & Official Voucher */
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-bold text-white">Inscrição Submetida com Sucesso!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  A candidatura foi registrada no sistema acadêmico do {resolvedPublicInst.name} e já está sob análise da secretaria.
                </p>
              </div>

              {/* Official Voucher Printable Box */}
              <div id="comprovativo-voucher" className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Comprovativo Oficial de Inscrição
                    </span>
                    <h4 className="text-lg font-bold text-white">{submittedCandidate.fullName}</h4>
                    <p className="text-xs text-slate-400">
                      {submittedCandidate.documentType}: {submittedCandidate.documentNumber}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Número da Inscrição</span>
                    <span className="font-mono text-xl font-bold text-emerald-400">
                      {submittedCandidate.code}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">{isChildCenter ? 'Sala / Grupo' : 'Curso Solicitado'}</span>
                    <span className="font-semibold text-white">{submittedCandidate.courseName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Turno & Regime</span>
                    <span>{submittedCandidate.regime} • {submittedCandidate.shift || 'Manhã'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Estado da Candidatura</span>
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pendente (Em Análise)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Taxa de Inscrição</span>
                    <span className="font-semibold text-white">
                      {(submittedCandidate.paymentAmount || 1500).toLocaleString()} MT ({submittedCandidate.paymentStatus})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Data da Submissão</span>
                    <span>{submittedCandidate.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Documentos Anexados</span>
                    <span>{submittedCandidate.documents?.length || 0} arquivos</span>
                  </div>
                </div>

                {/* QR Code & Digital Verification Token */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                      <QrCode className="w-full h-full text-slate-950" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Autenticação Digital SIVERC</span>
                      <span className="font-mono text-xs text-emerald-400">
                        SIVERC-CAND-{submittedCandidate.code.replace(/[^0-9]/g, '')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Válido para consulta institucional</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir
                    </button>
                    {submittedCandidate.phone && (
                      <button
                        onClick={() => openWhatsAppMessage(
                          submittedCandidate.phone,
                          `Olá! Segue a confirmação da sua inscrição no ${resolvedPublicInst.name}:\n\nCandidato: ${submittedCandidate.fullName}\nCódigo: ${submittedCandidate.code}\nOpção: ${submittedCandidate.courseName}\n\nAguarde a conferência dos seus documentos pela secretaria.`
                        )}
                        className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Steps Guidance */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200/90 space-y-2">
                <h5 className="font-bold text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Próximos Passos:
                </h5>
                <ul className="space-y-1 text-[11px] list-disc list-inside">
                  <li>Guarde o seu código oficial de inscrição: <strong>{submittedCandidate.code}</strong>.</li>
                  <li>A secretaria acadêmica analisará os documentos em até 48 horas úteis.</li>
                  <li>Após deferimento, receberá notificação por SMS/WhatsApp para confirmação de matrícula.</li>
                  <li>Pode acompanhar o estado na aba <strong>Consultar Estado</strong> a qualquer momento.</li>
                </ul>
              </div>

              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={() => {
                    setSubmittedCandidate(null);
                    setCurrentStep(1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Fazer Nova Inscrição
                </button>
              </div>
            </div>
          ) : !isOpen ? (
            /* Registration Closed Screen */
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Inscrições Online Encerradas</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                O período de inscrições para este ciclo letivo está no momento suspenso ou fora do prazo regulamentar. Para esclarecimentos, contate a secretaria do {resolvedPublicInst.name}.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('consultar')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-md"
                >
                  Consultar Inscrição Já Realizada
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Registration Form */
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 shadow-2xl">
              {/* Stepper Header */}
              <div className="grid grid-cols-5 gap-2 border-b border-slate-800 pb-6">
                {[
                  { step: 1, label: isChildCenter ? 'Sala' : 'Curso' },
                  { step: 2, label: 'Dados' },
                  { step: 3, label: 'Perguntas' },
                  { step: 4, label: 'Documentos' },
                  { step: 5, label: 'Pagamento' }
                ].map(item => (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setCurrentStep(item.step)}
                    className={`flex flex-col items-center text-center group cursor-pointer transition-all ${
                      currentStep === item.step
                        ? 'text-emerald-400 font-bold'
                        : currentStep > item.step
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1.5 transition-all ${
                      currentStep === item.step
                        ? 'bg-emerald-500 text-slate-950 font-bold ring-4 ring-emerald-500/20'
                        : currentStep > item.step
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {currentStep > item.step ? <Check className="w-4 h-4" /> : item.step}
                    </div>
                    <span className="text-[11px] truncate max-w-full">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* STEP 1: Curso / Sala */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                      1. {isChildCenter ? 'Selecione a Sala / Grupo' : 'Selecione o Curso ou Classe Desejada'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isChildCenter 
                        ? 'Selecione o grupo pedagógico adequado à faixa etária da criança.' 
                        : 'Confira os valores, requisitos de ingresso e vagas disponíveis.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCourses.map(course => {
                      const isSelected = selectedCourseId === course.courseId;
                      const filledPct = Math.min(100, Math.round(((course.filledVacancies || 0) / (course.vacancies || 1)) * 100));

                      return (
                        <div
                          key={course.courseId}
                          onClick={() => setSelectedCourseId(course.courseId)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/10'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                                {course.category || (isChildCenter ? 'Educação Infantil' : 'Formação')}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold text-white text-sm">{course.courseName}</h4>
                              <p className="text-xs text-slate-400 mt-1">Duração / Faixa: <strong className="text-slate-200">{course.duration}</strong></p>
                            </div>

                            {/* Preço e Propina */}
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Taxa de Inscrição:</span>
                                <span className="font-bold text-emerald-400 font-mono">{course.price.toLocaleString()} MT</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Propina Mensal:</span>
                                <span className="font-medium text-slate-200 font-mono">{course.monthlyFee.toLocaleString()} MT/mês</span>
                              </div>
                            </div>

                            {/* Requirements */}
                            {course.requirements && course.requirements.length > 0 && (
                              <div className="space-y-1 text-[11px] text-slate-300">
                                <span className="text-slate-500 block text-[10px] font-bold uppercase">Requisitos:</span>
                                {course.requirements.map((req, rIdx) => (
                                  <div key={rIdx} className="flex items-center gap-1.5">
                                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                    <span className="truncate">{req}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Vacancy Progress */}
                          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Vagas Totais: {course.vacancies}</span>
                              <span className={filledPct > 85 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                {Math.max(0, course.vacancies - (course.filledVacancies || 0))} disponíveis
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${filledPct > 85 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                style={{ width: `${filledPct}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Regime & Turno */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Regime Pretendido</label>
                      <select
                        value={regime}
                        onChange={e => setRegime(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Laboral">Laboral (Segunda a Sexta, Período Diurno)</option>
                        {!isChildCenter && <option value="Pós-Laboral">Pós-Laboral (Noite ou Finais de Semana)</option>}
                        {!isChildCenter && <option value="Online">Online / Híbrido</option>}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Turno de Preferência</label>
                      <select
                        value={shift}
                        onChange={e => setShift(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Manhã">Manhã (07h30 - 12h30)</option>
                        <option value="Tarde">Tarde (13h00 - 17h30)</option>
                        {!isChildCenter && <option value="Noite">Noite (18h00 - 21h30)</option>}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(2);
                        soundManager.playClick();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                    >
                      Avançar para Identificação
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Identificação Adaptativa por Tipo de Instituição */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-400" />
                      2. {isChildCenter ? 'Identificação da Criança e Encarregados' : 'Identificação do Candidato'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isChildCenter 
                        ? 'Preencha os dados da criança e os contactos dos pais ou encarregados de educação responsáveis.' 
                        : 'Insira os dados exatamente como constam no seu documento de identificação oficial.'}
                    </p>
                  </div>

                  {/* Fotografia tipo passe da Criança ou Candidato (Comprimida <= 150 KB no Spark) */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative">
                      {candidatePhotoUrl ? (
                        <img src={candidatePhotoUrl} alt="Foto" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-7 h-7 text-slate-500" />
                      )}
                      {isCompressingPhoto && (
                        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
                          Ajustando...
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <h4 className="text-xs font-bold text-white">
                        {isChildCenter ? 'Fotografia tipo passe da Criança (Opcional)' : 'Fotografia tipo passe do Candidato (Opcional)'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        A imagem é comprimida automaticamente no seu navegador para até 150 KB para caber com segurança no plano Spark.
                      </p>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-all border border-slate-700 mt-1">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Carregar Fotografia</span>
                        <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Nome Completo */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        {isChildCenter ? 'Nome Completo da Criança' : 'Nome Completo do Candidato'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder={isChildCenter ? 'Ex: Kevin Paulo Rupia' : 'Ex: Carlos Ernesto Munguambe'}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Género */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Género <span className="text-rose-400">*</span></label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </div>

                    {/* Data de Nascimento */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Data de Nascimento <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={birthDate}
                        onChange={e => setBirthDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Tipo de Documento */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        {isChildCenter ? 'Tipo de Registo / Documento' : 'Tipo de Documento'}
                      </label>
                      <select
                        value={documentType}
                        onChange={e => setDocumentType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {isChildCenter ? (
                          <>
                            <option value="Cédula">Cédula de Nascimento</option>
                            <option value="BI">Bilhete de Identidade (BI)</option>
                            <option value="Passaporte">Passaporte</option>
                          </>
                        ) : (
                          <>
                            <option value="BI">Bilhete de Identidade (BI)</option>
                            <option value="DIRE">DIRE</option>
                            <option value="Passaporte">Passaporte</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Número do Documento */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        {isChildCenter ? 'Número da Cédula / Registo (Opcional)' : 'Número do Documento'} {!isChildCenter && <span className="text-rose-400">*</span>}
                      </label>
                      <input
                        type="text"
                        required={!isChildCenter}
                        value={documentNumber}
                        onChange={e => setDocumentNumber(e.target.value)}
                        placeholder={isChildCenter ? 'Ex: Registo nº 1042/2022' : 'Ex: 110200349182A'}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                      />
                    </div>

                    {/* Se for Centro Técnico/Profissional (CFTPM), permitir NUIT opcional */}
                    {!isChildCenter && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">NUIT (Opcional)</label>
                        <input
                          type="text"
                          value={nuit}
                          onChange={e => setNuit(e.target.value)}
                          placeholder="Ex: 400192831"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    )}

                    {/* Escola Anterior (se for escola) */}
                    {isSchool && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Escola Anterior (se aplicável)</label>
                        <input
                          type="text"
                          value={previousSchool}
                          onChange={e => setPreviousSchool(e.target.value)}
                          placeholder="Ex: Escola Primária Completa de Nacala"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* SEÇÃO: Encarregados de Educação (OBRIGATÓRIO em Centro Infantil / Escola) */}
                  {(isChildCenter || isSchool) && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <HeartHandshake className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Dados do Encarregado de Educação Responsável (Obrigatório)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-300">
                            Nome do Pai / Mãe / Tutor(a) <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={guardianName}
                            onChange={e => setGuardianName(e.target.value)}
                            placeholder="Nome Completo do Encarregado"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Grau de Parentesco <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={guardianRelationship}
                            onChange={e => setGuardianRelationship(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="Mãe">Mãe</option>
                            <option value="Pai">Pai</option>
                            <option value="Avó/Avô">Avó / Avô</option>
                            <option value="Tutor Legal">Tutor(a) Legal</option>
                            <option value="Tio/Tia">Tio / Tia</option>
                            <option value="Outro">Outro Responsável</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Telefone / WhatsApp Principal <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+258 84 / 85 XXX XXXX"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Telefone Alternativo de Emergência</label>
                          <input
                            type="tel"
                            value={guardianAltPhone}
                            onChange={e => setGuardianAltPhone(e.target.value)}
                            placeholder="+258 82 / 86 / 87 XXX XXXX"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">E-mail do Encarregado (Opcional)</label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="encarregado@email.com"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Pessoas autorizadas a buscar a criança */}
                        {isChildCenter && (
                          <div className="sm:col-span-3 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">
                              Pessoas Autorizadas a Buscar a Criança na Saída <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={authorizedPickupPersons}
                              onChange={e => setAuthorizedPickupPersons(e.target.value)}
                              placeholder="Nomes completos das pessoas autorizadas e respectivos telefones"
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                            <p className="text-[10px] text-slate-500">
                              Por motivos de segurança infantil da portaria, nenhuma criança é entregue a pessoas não cadastradas.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contactos Próprios se for CFTPM / Adulto */}
                  {!isChildCenter && !isSchool && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Contacto Telefónico / WhatsApp <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+258 84 / 85 XXX XXXX"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          E-mail para Notificações <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="candidato@email.mz"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Localização & Endereço */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Província</label>
                      <select
                        value={province}
                        onChange={e => setProvince(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {PROVINCES_MOZAMBIQUE.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Cidade / Distrito</label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="Ex: Nacala"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Bairro / Rua</label>
                      <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Ex: Bairro Triângulo, Casa 44"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar à {isChildCenter ? 'Sala' : 'Opção'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName.trim() || !birthDate || (!isChildCenter && !documentNumber.trim()) || !phone.trim()) {
                          alert('Preencha os campos obrigatórios assinalados com (*).');
                          return;
                        }
                        setCurrentStep(3);
                        soundManager.playClick();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                    >
                      Avançar para Questionário
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Questionário de Admissão */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-emerald-400" />
                      3. Questionário de Admissão
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Responda às questões solicitadas pela direção do {resolvedPublicInst.name}.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {(effectiveConfig.customQuestions && effectiveConfig.customQuestions.length > 0) ? (
                      effectiveConfig.customQuestions.map(q => (
                        <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                          <label className="text-xs font-semibold text-slate-200 block">
                            {q.question} {q.required && <span className="text-rose-400">*</span>}
                          </label>

                          {q.type === 'text' && (
                            <input
                              type="text"
                              value={customAnswers[q.id] || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Digite a sua resposta..."
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          )}

                          {q.type === 'boolean' && (
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  value="Sim"
                                  checked={customAnswers[q.id] === 'Sim'}
                                  onChange={() => handleAnswerChange(q.id, 'Sim')}
                                  className="text-emerald-500 focus:ring-0"
                                />
                                Sim
                              </label>
                              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  value="Não"
                                  checked={customAnswers[q.id] === 'Não'}
                                  onChange={() => handleAnswerChange(q.id, 'Não')}
                                  className="text-emerald-500 focus:ring-0"
                                />
                                Não
                              </label>
                            </div>
                          )}

                          {q.type === 'select' && (
                            <select
                              value={customAnswers[q.id] || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="">Selecione uma opção...</option>
                              {(q.options || []).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        Não há perguntas adicionais para este ciclo de candidatura.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar aos Dados
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(4);
                        soundManager.playClick();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                    >
                      Avançar para Documentos
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Documentos Digitais */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      4. Anexar Documentos Obrigatórios
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submeta cópias legíveis em formato PDF ou imagem dos documentos exigidos pelo {resolvedPublicInst.name}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(effectiveConfig.requiredDocuments && effectiveConfig.requiredDocuments.length > 0 
                      ? effectiveConfig.requiredDocuments 
                      : (isChildCenter 
                          ? ['Cédula de Nascimento', 'Cartão de Vacinas em Dia', 'Fotografia tipo passe da Criança'] 
                          : ['Bilhete de Identidade (BI)', 'Certificado de Habilitações', 'Fotografia tipo passe'])
                    ).map(docTitle => {
                      const isUploaded = !!uploadedDocs[docTitle];

                      return (
                        <div 
                          key={docTitle}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isUploaded
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isUploaded
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {isUploaded ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-xs truncate">{docTitle}</p>
                              {isUploaded ? (
                                <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                                  {uploadedDocs[docTitle].fileName} ({uploadedDocs[docTitle].fileSize})
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Obrigatório • PDF, JPG ou PNG
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isUploaded ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(docTitle)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Remover
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUploadDoc(docTitle)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                                Carregar Arquivo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar ao Questionário
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(5);
                        soundManager.playClick();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                    >
                      Avançar para Pagamento
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Pagamento e Finalização */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      5. Taxa de Candidatura & Submissão Oficial
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Efetue o pagamento da taxa de inscrição de <strong className="text-emerald-400 font-mono">{(selectedCourse?.price || 1500).toLocaleString()} MT</strong> para homologação da sua vaga.
                    </p>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'M-Pesa', label: 'M-Pesa', desc: resolvedPublicInst.paymentMethods?.mpesa || 'Vodacom' },
                      { id: 'e-Mola', label: 'e-Mola', desc: resolvedPublicInst.paymentMethods?.emola || 'Movitel' },
                      { id: 'BIM', label: 'BIM / Banco', desc: resolvedPublicInst.paymentMethods?.bankName || 'Millennium BIM' },
                      { id: 'Presencial', label: 'Secretaria', desc: 'Presencial no balcão' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPaymentMethod(item.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          paymentMethod === item.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-bold text-xs block text-white">{item.label}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 truncate">{item.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment Box */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    {paymentMethod === 'M-Pesa' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">Instruções M-Pesa Oficial</span>
                          <span className="text-[11px] font-mono text-emerald-400">Taxa: {(selectedCourse?.price || 1500).toLocaleString()} MT</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Número oficial de recebimento da instituição: <strong className="text-white font-mono">{resolvedPublicInst.paymentMethods?.mpesa || resolvedPublicInst.phone}</strong>.
                        </p>
                        <div className="flex gap-2 max-w-sm">
                          <input
                            type="tel"
                            value={mpesaNumber}
                            onChange={e => setMpesaNumber(e.target.value)}
                            placeholder="84 / 85 XXX XXXX"
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleSimulatePayment}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              paymentSimulatedSuccess
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                            }`}
                          >
                            {paymentSimulatedSuccess ? 'Pago com Sucesso!' : 'Confirmar Pagamento'}
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'BIM' && (
                      <div className="space-y-2 text-xs text-slate-300">
                        <p className="font-semibold text-white">Coordenadas Bancárias da Instituição:</p>
                        <div className="p-3 rounded-xl bg-slate-900 font-mono text-[11px] space-y-1">
                          <p>Banco: {resolvedPublicInst.paymentMethods?.bankName || 'Millennium BIM'}</p>
                          <p>Titular: {resolvedPublicInst.name}</p>
                          {resolvedPublicInst.paymentMethods?.accountNumber && <p>Conta: {resolvedPublicInst.paymentMethods.accountNumber}</p>}
                          {resolvedPublicInst.paymentMethods?.nib && <p>NIB: {resolvedPublicInst.paymentMethods.nib}</p>}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {resolvedPublicInst.paymentMethods?.instructions || 'Envie o comprovativo para a secretaria por WhatsApp.'}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'Presencial' && (
                      <div className="text-xs text-slate-300 space-y-1">
                        <p className="font-semibold text-white">Pagamento Direto na Secretaria:</p>
                        <p className="text-slate-400">
                          Poderá efetuar o pagamento presencialmente na secretaria do {resolvedPublicInst.name} no ato de entrega física dos documentos para validação.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Regulamento e Privacidade */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={e => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs text-slate-300">
                        Declaro que li e aceito o{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-emerald-400 underline hover:text-emerald-300 font-semibold cursor-pointer"
                        >
                          Regulamento de Candidaturas
                        </button>{' '}
                        do {resolvedPublicInst.name}.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={e => setPrivacyAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs text-slate-300">
                        Concordo com o tratamento dos dados pessoais submetidos em conformidade com a{' '}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-emerald-400 underline hover:text-emerald-300 font-semibold cursor-pointer"
                        >
                          Política de Privacidade
                        </button>.
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setCurrentStep(4)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar aos Documentos
                    </button>
                    
                    {/* Botão de Submissão com Prevenção de Duplo Clique e Spinner */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                          <span>Processando Candidatura...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Finalizar e Submeter Candidatura</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )
        ) : (
          /* TAB 2: CONSULTA PÚBLICA DE ESTADO (RASTREAMENTO SEGURO COM ANONIMIZAÇÃO PII) */
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-400" />
                Consulta Pública de Candidatura
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Acompanhe o estado da sua inscrição no {resolvedPublicInst.name} inserindo o seu código ou contacto.
              </p>
            </div>

            <form onSubmit={handleSearchApplication} className="flex gap-2 max-w-xl">
              <input
                type="text"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                placeholder="Ex: CAND-2026-1042 ou Contacto"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
              >
                <Search className="w-4 h-4" />
                Pesquisar
              </button>
            </form>

            {/* Resultado da Consulta (PII rigorosamente mascarada) */}
            {lookupAttempted && (
              lookedUpApplication ? (
                <div className="max-w-2xl p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-400 block">
                        {lookedUpApplication.code}
                      </span>
                      {/* Nome Mascarado (Sem PII) */}
                      <h4 className="text-base font-bold text-white mt-0.5">
                        {maskCandidateName(lookedUpApplication.fullName)}
                      </h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      lookedUpApplication.status === 'Aprovada'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : lookedUpApplication.status === 'Matriculado'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : lookedUpApplication.status === 'Rejeitada'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {lookedUpApplication.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">{isChildCenter ? 'Sala / Grupo' : 'Curso'}</span>
                      <span className="font-semibold text-white">{lookedUpApplication.courseName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Data de Submissão</span>
                      <span>{lookedUpApplication.createdAt}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Taxa de Inscrição</span>
                      <span>{lookedUpApplication.paymentStatus}</span>
                    </div>
                  </div>

                  {/* Estado da Candidatura */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    {lookedUpApplication.status === 'Pendente' && (
                      <p className="text-amber-300">
                        ⏳ A sua candidatura foi recebida e aguarda revisão e conferência de documentos pela secretaria.
                      </p>
                    )}
                    {lookedUpApplication.status === 'Em Análise' && (
                      <p className="text-amber-300">
                        🔍 A secretaria acadêmica está ativamente a verificar a sua documentação de suporte.
                      </p>
                    )}
                    {lookedUpApplication.status === 'Aprovada' && (
                      <p className="text-emerald-300 font-semibold">
                        🎉 Parabéns! A sua candidatura foi APROVADA. Dirija-se à secretaria ou confirme a sua matrícula.
                      </p>
                    )}
                    {lookedUpApplication.status === 'Matriculado' && (
                      <p className="text-blue-300 font-semibold">
                        🎓 Matrícula Efetivada! Você já é oficialmente aluno da nossa instituição (Código: {lookedUpApplication.convertedStudentCode || 'Ativo'}).
                      </p>
                    )}
                    {lookedUpApplication.status === 'Rejeitada' && (
                      <p className="text-rose-300">
                        ❌ Candidatura indeferida. Para detalhes, contacte a secretaria acadêmica.
                      </p>
                    )}
                  </div>

                  {/* Documentos Pendentes (se houver) */}
                  {lookedUpApplication.documents && lookedUpApplication.documents.some(d => !d.verified) && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs space-y-1.5">
                      <span className="text-slate-400 font-bold block text-[11px]">Documentos Sob Validação:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {lookedUpApplication.documents.map((d, dIdx) => (
                          <li key={dIdx} className={d.verified ? 'text-emerald-400' : 'text-amber-300'}>
                            {d.name} — {d.verified ? 'Verificado' : 'Aguardando validação formal'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Botão de Contacto Direto com a Secretaria da Instituição */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Dúvidas sobre o seu processo?</span>
                    {(resolvedPublicInst.whatsapp || resolvedPublicInst.phone) && (
                      <button
                        type="button"
                        onClick={() => openWhatsAppMessage(
                          resolvedPublicInst.whatsapp || resolvedPublicInst.phone || '',
                          `Olá Secretaria do ${resolvedPublicInst.name}! Gostaria de informações sobre o estado da candidatura #${lookedUpApplication.code}.`
                        )}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Falar com a Secretaria no WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Nenhuma candidatura encontrada no {resolvedPublicInst.name} com os dados informados. Verifique se digitou o código corretamente.
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* Modal Termos e Condições */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Regulamento de Candidaturas • {resolvedPublicInst.name}
              </h4>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto leading-relaxed">
              <p>{resolvedPublicInst.termsAndConditions || '1. A submissão da candidatura constitui manifestação oficial de interesse e não assegura admissão automática sem parecer favorável da secretaria acadêmica.'}</p>
              <p>2. Os candidatos e encarregados comprometem-se com a veracidade dos dados e documentos submetidos sob as penalidades legais vigentes.</p>
              <p>3. As taxas de candidatura destinam-se ao custeio administrativo do processo de seleção e admissão.</p>
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Aceitar Regulamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Política de Privacidade */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Política de Privacidade • {resolvedPublicInst.name}
              </h4>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto leading-relaxed">
              <p>{resolvedPublicInst.privacyPolicy || 'Os dados recolhidos nesta candidatura destinam-se estritamente à gestão acadêmica, registo de frequência e emissão de credenciais da instituição no SIGAR PRO.'}</p>
              <p>Nenhum dado pessoal é partilhado com terceiros ou utilizado para fins não educacionais.</p>
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setPrivacyAccepted(true);
                  setShowPrivacyModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Aceitar Privacidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
