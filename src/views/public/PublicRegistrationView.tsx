import React, { useState, useMemo } from 'react';
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
  Download, 
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
  DollarSign, 
  RotateCcw,
  CheckCircle,
  XCircle,
  BookOpen,
  Send,
  Layers,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { soundManager } from '../../utils/audio';
import { PROVINCES_MOZAMBIQUE } from '../../data/mockData';
import { RegistrationApplication, OnlineCourseConfig } from '../../types';

export const PublicRegistrationView: React.FC = () => {
  const { 
    activeInstitution, 
    onlineRegistrationConfig, 
    addApplication, 
    applications,
    navigate,
    openWhatsAppMessage
  } = useApp();

  // Active Main View Tab: 'formulario' | 'consultar'
  const [activeTab, setActiveTab] = useState<'formulario' | 'consultar'>('formulario');

  // Form Step State (1: Curso, 2: Dados Pessoais, 3: Perguntas, 4: Documentos, 5: Pagamento & Submissão)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidate, setSubmittedCandidate] = useState<RegistrationApplication | null>(null);

  // Form Data State
  const activeCourses = useMemo(() => {
    return (onlineRegistrationConfig.coursesConfig || []).filter(c => c.active !== false);
  }, [onlineRegistrationConfig]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    activeCourses[0]?.courseId || 'crs-dev'
  );
  const selectedCourse = useMemo(() => {
    return activeCourses.find(c => c.courseId === selectedCourseId) || activeCourses[0];
  }, [activeCourses, selectedCourseId]);

  const [regime, setRegime] = useState<'Laboral' | 'Pós-Laboral' | 'Online'>('Laboral');
  const [shift, setShift] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');

  // Personal Fields
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<'BI' | 'Passaporte' | 'DIRE'>('BI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('2004-05-18');
  const [gender, setGender] = useState<'Masculino' | 'Feminino' | 'Outro'>('Masculino');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('Maputo Cidade');
  const [city, setCity] = useState('Maputo');
  const [address, setAddress] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // Custom Answers State
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  // Documents Upload Simulation State
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { fileName: string; fileSize: string; uploadedAt: string }>>({
    'Bilhete de Identidade': { fileName: 'BI_Frente_Verso.pdf', fileSize: '1.2 MB', uploadedAt: new Date().toISOString().split('T')[0] },
    'Certificado de Habilitações': { fileName: 'Certificado_12a_Classe.pdf', fileSize: '2.1 MB', uploadedAt: new Date().toISOString().split('T')[0] }
  });

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'e-Mola' | 'BIM' | 'Presencial'>('M-Pesa');
  const [mpesaNumber, setMpesaNumber] = useState('84');
  const [paymentSimulatedSuccess, setPaymentSimulatedSuccess] = useState(false);

  // Status Lookup State
  const [searchCode, setSearchCode] = useState('');
  const [lookedUpApplication, setLookedUpApplication] = useState<RegistrationApplication | null>(null);
  const [lookupAttempted, setLookupAttempted] = useState(false);

  // Check if Registration is Open
  const isOpen = onlineRegistrationConfig.isOpen;

  // Handle Answer Change
  const handleAnswerChange = (qId: string, answer: string) => {
    setCustomAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  // Handle Simulated Document Upload
  const handleUploadDoc = (docTitle: string) => {
    soundManager.playClick();
    const mockFiles = [
      { name: `${docTitle.replace(/\s+/g, '_')}_Digitalizado.pdf`, size: '1.4 MB' },
      { name: `${docTitle.replace(/\s+/g, '_')}_Oficial.pdf`, size: '2.3 MB' }
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

  // Remove Document
  const handleRemoveDoc = (docTitle: string) => {
    setUploadedDocs(prev => {
      const copy = { ...prev };
      delete copy[docTitle];
      return copy;
    });
  };

  // Simulate Instant Mobile Payment
  const handleSimulatePayment = () => {
    soundManager.playSuccess();
    setPaymentSimulatedSuccess(true);
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !documentNumber.trim() || !phone.trim()) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    soundManager.playClick();

    setTimeout(() => {
      // Build documents list
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

      // Format custom answers array
      const customAnswersArray = (onlineRegistrationConfig.customQuestions || []).map(q => ({
        questionId: q.id,
        question: q.question,
        answer: customAnswers[q.id] || (q.type === 'boolean' ? 'Não' : 'Não informado')
      }));

      const created = addApplication({
        institutionId: activeInstitution.id,
        status: 'Pendente',
        fullName: fullName.trim(),
        documentType,
        documentNumber: documentNumber.trim(),
        birthDate,
        gender: gender as any,
        phone: phone.trim(),
        email: email.trim() || `${phone.replace(/\D/g, '')}@candidato.mz`,
        province,
        city,
        address: address.trim(),
        guardianName: guardianName.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
        courseId: selectedCourse?.courseId || selectedCourseId,
        courseName: selectedCourse?.courseName || 'Curso Técnico Profissional',
        regime,
        shift,
        photoUrl: gender === 'Feminino' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        paymentStatus: paymentSimulatedSuccess ? 'Pago' : 'Pendente',
        paymentAmount: selectedCourse?.price || 1500,
        paymentMethod,
        paymentReference: paymentSimulatedSuccess ? `MPESA-TX-${Date.now().toString().slice(-6)}` : `REF-${Date.now().toString().slice(-6)}`,
        documents: documentsList,
        customAnswers: customAnswersArray
      });

      setIsSubmitting(false);
      setSubmittedCandidate(created);

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
      soundManager.playSuccess();
    }, 900);
  };

  // Handle Application Tracker Search
  const handleSearchApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setLookupAttempted(true);
    const q = searchCode.trim().toLowerCase();
    const found = applications.find(
      app => app.code.toLowerCase() === q || app.documentNumber.toLowerCase() === q || app.phone.includes(q)
    );
    setLookedUpApplication(found || null);
    if (found) {
      soundManager.playSuccess();
    } else {
      soundManager.playNotification();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Portal Banner & Institution Branding */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-sm sm:text-base tracking-tight truncate max-w-[220px] sm:max-w-md">
                  {activeInstitution.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Oficial
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Portal de Inscrições & Admissões Online • Moçambique
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
            <button
              onClick={() => navigate('candidatos_gestao')}
              className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
              title="Acesso Secretaria / Gestão"
            >
              Secretaria
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
                Ano Letivo {onlineRegistrationConfig.academicYear} • {onlineRegistrationConfig.semester}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {onlineRegistrationConfig.title || 'Inscrições Online Abertas'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {onlineRegistrationConfig.description || 'Preencha o formulário eletrônico, anexe os documentos necessários e garanta a sua vaga em um dos nossos cursos técnicos profissionais com certificação acreditada.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Período: {onlineRegistrationConfig.startDate} até {onlineRegistrationConfig.endDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>{activeCourses.length} Cursos Disponíveis</span>
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
                  A sua candidatura foi registrada no sistema acadêmico do {activeInstitution.name} e já está sob análise da secretaria.
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
                    <span className="text-slate-500 block text-[10px]">Curso Solicitado</span>
                    <span className="font-semibold text-white">{submittedCandidate.courseName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Regime & Turno</span>
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
                    <span className="text-slate-500 block text-[10px]">Taxa de Candidatura</span>
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
                    <span>{submittedCandidate.documents?.length || 0} arquivos enviados</span>
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
                          `Olá! Segue a confirmação da sua inscrição no ${activeInstitution.name}:\n\nCandidato: ${submittedCandidate.fullName}\nCódigo: ${submittedCandidate.code}\nCurso: ${submittedCandidate.courseName}\n\nAguarde a conferência dos seus documentos pela secretaria.`
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
                  <li>Guarde o seu número de inscrição (<strong>{submittedCandidate.code}</strong>).</li>
                  <li>A secretaria acadêmica analisará os documentos em até 48 horas úteis.</li>
                  <li>Após deferimento, receberá notificação por SMS/WhatsApp para confirmação de matrícula.</li>
                  <li>Você pode acompanhar a qualquer momento o status da candidatura na aba <strong>Consultar Estado</strong>.</li>
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
                O período de inscrições para este ciclo letivo está no momento suspenso ou fora do prazo regulamentar. Para esclarecimentos, contate a secretaria acadêmica.
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
                  { step: 1, label: 'Curso' },
                  { step: 2, label: 'Dados' },
                  { step: 3, label: 'Questionário' },
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

              {/* STEP 1: Curso, Preço, Duração, Requisitos e Vagas */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                      1. Selecione o Curso Desejado
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Confira os valores, requisitos de ingresso, prazos e disponibilidade de vagas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCourses.map(course => {
                      const isSelected = selectedCourseId === course.courseId;
                      const filledPct = Math.min(100, Math.round(((course.filledVacancies || 0) / course.vacancies) * 100));

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
                                {course.category}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold text-white text-sm">{course.courseName}</h4>
                              <p className="text-xs text-slate-400 mt-1">Duração: <strong className="text-slate-200">{course.duration}</strong></p>
                            </div>

                            {/* Price & Monthly Fee */}
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

                            {/* Requirements Checklist */}
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
                              <span>Vagas: {course.filledVacancies || 0}/{course.vacancies}</span>
                              <span className={filledPct > 80 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                {course.vacancies - (course.filledVacancies || 0)} restantes
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${filledPct > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                style={{ width: `${filledPct}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Regime & Turno Selection */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Regime de Aulas Desejado</label>
                      <select
                        value={regime}
                        onChange={e => setRegime(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Laboral">Laboral (Segunda a Sexta, Período Diurno)</option>
                        <option value="Pós-Laboral">Pós-Laboral (Noite ou Finais de Semana)</option>
                        <option value="Online">Online / Híbrido</option>
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
                        <option value="Noite">Noite (18h00 - 21h30)</option>
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
                      Avançar para Dados Pessoais
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Dados Pessoais do Candidato */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-400" />
                      2. Identificação e Contactos do Candidato
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Insira os dados exatamente como constam no seu Bilhete de Identidade ou Passaporte.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Nome Completo <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Ex: Carlos Ernesto Munguambe"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Gênero</label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Tipo de Documento</label>
                      <select
                        value={documentType}
                        onChange={e => setDocumentType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="BI">Bilhete de Identidade (BI)</option>
                        <option value="Passaporte">Passaporte Nacional / Estrangeiro</option>
                        <option value="DIRE">DIRE</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Número do Documento <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={documentNumber}
                        onChange={e => setDocumentNumber(e.target.value)}
                        placeholder="Ex: 110200349182A"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 uppercase font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Data de Nascimento</label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={e => setBirthDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Telefone / WhatsApp <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+258 84 123 4567"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="candidato@gmail.com"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Província de Residência</label>
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
                        placeholder="Ex: Matola"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Endereço Residencial (Bairro, Quarteirão, Casa)</label>
                      <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Ex: Bairro Machava, Rua 12, Q. 4, Casa 28"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Nome do Encarregado (se menor)</label>
                      <input
                        type="text"
                        value={guardianName}
                        onChange={e => setGuardianName(e.target.value)}
                        placeholder="Nome do Encarregado"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Telefone do Encarregado</label>
                      <input
                        type="tel"
                        value={guardianPhone}
                        onChange={e => setGuardianPhone(e.target.value)}
                        placeholder="+258 82 987 6543"
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
                      Voltar ao Curso
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName.trim() || !documentNumber.trim() || !phone.trim()) {
                          alert('Preencha os campos obrigatórios (Nome, Documento e Telefone).');
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

              {/* STEP 3: Perguntas Adicionais Configuradas pela Instituição */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-emerald-400" />
                      3. Questionário de Admissão
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Responda às questões solicitadas pela comissão pedagógica do {activeInstitution.name}.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {(onlineRegistrationConfig.customQuestions && onlineRegistrationConfig.customQuestions.length > 0) ? (
                      onlineRegistrationConfig.customQuestions.map(q => (
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
                        Não há perguntas adicionais configuradas para esta edição.
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
                      Submeta cópias legíveis em formato PDF ou imagem (PNG, JPG) dos documentos exigidos pela instituição.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(onlineRegistrationConfig.requiredDocuments || ['Bilhete de Identidade', 'Certificado de Habilitações', 'Fotografia tipo passe']).map(docTitle => {
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
                                  Obrigatório • PDF, JPG ou PNG até 5 MB
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
                      { id: 'M-Pesa', label: 'M-Pesa', desc: 'Vodacom Moçambique' },
                      { id: 'e-Mola', label: 'e-Mola', desc: 'Movitel' },
                      { id: 'BIM', label: 'BIM / BCI', desc: 'Transferência' },
                      { id: 'Presencial', label: 'Secretaria', desc: 'Pagar no Centro' }
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
                        <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment Simulator Box */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    {paymentMethod === 'M-Pesa' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">Instruções M-Pesa Automático</span>
                          <span className="text-[11px] font-mono text-emerald-400">Taxa: {(selectedCourse?.price || 1500).toLocaleString()} MT</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Informe o seu número M-Pesa. Será enviada uma solicitação USSD para digitação do seu PIN com validação instantânea.
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
                            {paymentSimulatedSuccess ? 'Pago com Sucesso!' : 'Simular Pagamento'}
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'BIM' && (
                      <div className="space-y-2 text-xs text-slate-300">
                        <p className="font-semibold text-white">Coordenadas Bancárias da Instituição:</p>
                        <div className="p-3 rounded-xl bg-slate-900 font-mono text-[11px] space-y-1">
                          <p>Banco: Millennium BIM</p>
                          <p>Titular: {activeInstitution.name}</p>
                          <p>Conta: 198234812001</p>
                          <p>NIB: 0001 0000 1982 3481 2001 42</p>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Poderá anexar o comprovativo no ato ou apresentar na secretaria durante a matrícula.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'Presencial' && (
                      <div className="text-xs text-slate-300 space-y-1">
                        <p className="font-semibold text-white">Pagamento no Balcão de Atendimento</p>
                        <p className="text-slate-400">
                          A sua vaga ficará pré-reservada por 48 horas para liquidação presencial da taxa de inscrição junto da tesouraria do centro.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Resumo da Inscrição:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Candidato</span>
                        <span className="font-semibold text-white truncate block">{fullName || 'Não informado'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Curso</span>
                        <span className="font-semibold text-white truncate block">{selectedCourse?.courseName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Regime</span>
                        <span>{regime} ({shift})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Documentação</span>
                        <span>{Object.keys(uploadedDocs).length} anexos</span>
                      </div>
                    </div>
                  </div>

                  {/* Declaration & Submit Button */}
                  <div className="space-y-4 pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        defaultChecked
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                      />
                      <span>
                        Declaro sob compromisso de honra que os dados fornecidos e documentos anexados são verídicos e que aceito o regulamento interno do {activeInstitution.name}.
                      </span>
                    </label>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar aos Documentos
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                            Registrando Candidatura...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submeter Candidatura Oficial
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )
        ) : (
          /* Tab 2: Consultar Estado em Tempo Real (Tracker) */
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Consultar Estado de Candidatura</h3>
              <p className="text-xs text-slate-400">
                Acompanhe o andamento da sua inscrição, verificação de documentos e parecer de deferimento da secretaria.
              </p>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleSearchApplication} className="max-w-md mx-auto flex gap-2">
              <input
                type="text"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                placeholder="Código (ex: CFTPM-CAND-2026-001) ou BI..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 uppercase font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </form>

            {/* Result Display */}
            {lookupAttempted && (
              lookedUpApplication ? (
                <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-400 block">
                        {lookedUpApplication.code}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{lookedUpApplication.fullName}</h4>
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
                      <span className="text-slate-500 block text-[10px]">Curso</span>
                      <span className="font-semibold text-white">{lookedUpApplication.courseName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Regime</span>
                      <span>{lookedUpApplication.regime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Taxa</span>
                      <span>{lookedUpApplication.paymentStatus}</span>
                    </div>
                  </div>

                  {/* Status Interpretation */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
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
                        🎉 Parabéns! A sua candidatura foi APROVADA. Dirija-se à secretaria ou efetive a sua matrícula para iniciar as aulas.
                      </p>
                    )}
                    {lookedUpApplication.status === 'Matriculado' && (
                      <p className="text-blue-300 font-semibold">
                        🎓 Matrícula Efetivada! Você já é oficialmente aluno da nossa instituição (Código: {lookedUpApplication.convertedStudentCode || 'Ativo'}).
                      </p>
                    )}
                    {lookedUpApplication.status === 'Rejeitada' && (
                      <p className="text-rose-300">
                        ❌ Candidatura indeferida. Motivo: {lookedUpApplication.rejectionReason || 'Documentação incompleta'}.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Nenhuma candidatura encontrada com os dados informados. Verifique se digitou o código corretamente (ex: CFTPM-CAND-2026-XXXX).
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
};
