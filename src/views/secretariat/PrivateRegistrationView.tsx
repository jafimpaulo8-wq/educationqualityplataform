import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  Link as LinkIcon, 
  QrCode, 
  CheckCircle2, 
  Printer, 
  Download, 
  Share2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Search, 
  DollarSign, 
  CreditCard, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Clock, 
  RefreshCw,
  Lock,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';
import { PROVINCES_MOZAMBIQUE } from '../../data/mockData';
import { RealQRCode } from '../../components/common/RealQRCode';
import { StudentStatus, RegistrationApplication } from '../../types';

export const PrivateRegistrationView: React.FC = () => {
  const { 
    activeInstitution, 
    allInstitutions,
    activeBranch,
    activeBranchId,
    courses, 
    classes, 
    addStudent, 
    addApplication,
    applications,
    navigate,
    openWhatsAppMessage
  } = useApp();

  const { success, error: toastError, info } = useToast();

  // Active platform sub-tab: 'balcao' | 'links' | 'cartaz' | 'historico'
  const [activeTab, setActiveTab] = useState<'balcao' | 'links' | 'cartaz' | 'historico'>('balcao');

  // Form State: Balcão Presencial
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<'BI' | 'DIRE' | 'Passaporte' | 'Cédula'>('BI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('2004-03-15');
  const [gender, setGender] = useState<'Masculino' | 'Feminino' | 'Outro'>('Masculino');
  const [phone, setPhone] = useState('+258 84 ');
  const [whatsapp, setWhatsapp] = useState('+258 84 ');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('Nampula');
  const [city, setCity] = useState('Nacala-Porto');
  const [address, setAddress] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // Academic Selections
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  const [regime, setRegime] = useState<'Laboral' | 'Pós-Laboral' | 'Online' | 'Sábado'>('Pós-Laboral');
  const [shift, setShift] = useState<'Manhã' | 'Tarde' | 'Noite'>('Noite');
  
  // Matched classes for course
  const availableClasses = useMemo(() => {
    return classes.filter(c => !selectedCourseId || c.courseId === selectedCourseId || c.courseName === selectedCourse?.name);
  }, [classes, selectedCourseId, selectedCourse]);

  const [selectedClassId, setSelectedClassId] = useState<string>(availableClasses[0]?.id || '');

  // Enrollment mode: direct student vs application
  const [enrollmentMode, setEnrollmentMode] = useState<'direta' | 'candidatura'>('direta');

  // Financial fields
  const [paymentAmount, setPaymentAmount] = useState<number>(1500);
  const [paymentStatus, setPaymentStatus] = useState<'Pago' | 'Isento' | 'Pendente'>('Pago');
  const [paymentMethod, setPaymentMethod] = useState<'Numerário' | 'POS/Cartão' | 'M-Pesa' | 'e-Mola' | 'Transferência BIM'>('Numerário');
  const [receiptNumber, setReceiptNumber] = useState<string>(`REC-${Date.now().toString().slice(-6)}`);
  const [isScholarship, setIsScholarship] = useState(false);
  const [scholarshipNote, setScholarshipNote] = useState('');

  // Physical document verification checklist
  const [biVerified, setBiVerified] = useState(true);
  const [certVerified, setCertVerified] = useState(true);
  const [photosReceived, setPhotosReceived] = useState(true);

  // Success Confirmation Modal State
  const [completedResult, setCompletedResult] = useState<{
    code: string;
    studentName: string;
    courseName: string;
    className: string;
    regime: string;
    paymentStatus: string;
    paymentAmount: number;
    receiptNumber: string;
    enrollmentType: 'direta' | 'candidatura';
    timestamp: string;
  } | null>(null);

  // Private Token for exclusive link
  const [privateToken, setPrivateToken] = useState<string>(`MTW-PRIV-${activeInstitution.code || '2026'}-${Math.floor(100 + Math.random() * 900)}`);
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  // Production Base URL
  const productionBaseUrl = typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
    ? window.location.origin
    : 'https://educationqualityplataform.vercel.app';

  // Generated Link URLs
  const publicRegistrationUrl = `${productionBaseUrl}/?route=inscricao_publica&inst=${encodeURIComponent(activeInstitution.id)}`;
  const privateRegistrationUrl = `${productionBaseUrl}/?route=inscricao_privada&inst=${encodeURIComponent(activeInstitution.id)}&token=${encodeURIComponent(privateToken)}`;

  // Handle Copy to Clipboard
  const handleCopyLink = (url: string, type: string) => {
    soundManager.playClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLinkType(type);
    success('Link Copiado!', `O ${type} foi copiado para a área de transferência.`);
    setTimeout(() => setCopiedLinkType(null), 3000);
  };

  // Handle Submit Balcão Form
  const handleSubmitBalcao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !documentNumber.trim() || !phone.trim()) {
      toastError('Campos Obrigatórios', 'Preencha o Nome Completo, Número do Documento e Contacto Telefónico.');
      return;
    }

    soundManager.playClick();

    if (enrollmentMode === 'direta') {
      // Create student directly
      const generatedCode = `MTW-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const chosenClass = classes.find(c => c.id === selectedClassId) || availableClasses[0];

      const createdStudent = addStudent({
        institutionId: activeInstitution.id,
        branchId: activeBranchId !== 'todas' ? activeBranchId : undefined,
        fullName: fullName.trim(),
        documentType: (documentType === 'Cédula' ? 'BI' : documentType) as any,
        documentNumber: documentNumber.trim(),
        birthDate,
        gender: gender as any,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim() || `${documentNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@aluno.mz`,
        province,
        city,
        address: address.trim() || `${city}, ${province}`,
        guardianName: guardianName.trim() || 'O Próprio',
        guardianPhone: guardianPhone.trim() || phone.trim(),
        emergencyContact: phone.trim(),
        courseId: selectedCourse?.id || 'crs-default',
        courseName: selectedCourse?.name || 'Curso Técnico',
        classGroupId: chosenClass?.id || 'turma-1',
        classGroupName: chosenClass?.name || 'Turma A',
        regime,
        status: 'Matriculado' as StudentStatus,
        paymentStatus: paymentStatus === 'Pendente' ? 'Pendente' : 'Pago',
        balanceOwing: paymentStatus === 'Pendente' ? paymentAmount : 0,
        attendancePercentage: 100,
        averageGrade: 14,
        assessments: [],
        enrollmentDate: new Date().toISOString().split('T')[0],
        notes: isScholarship ? `Bolsista Institucional: ${scholarshipNote}` : 'Inscrição presencial no balcão da secretaria.',
        photoUrl: gender === 'Feminino' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
      });

      // Also record as processed application
      addApplication({
        institutionId: activeInstitution.id,
        branchId: activeBranchId !== 'todas' ? activeBranchId : undefined,
        fullName: fullName.trim(),
        documentType: documentType as any,
        documentNumber: documentNumber.trim(),
        birthDate,
        gender: gender as any,
        phone: phone.trim(),
        email: email.trim() || `${phone.replace(/\D/g, '')}@candidato.mz`,
        province,
        city,
        address: address.trim(),
        courseId: selectedCourse?.id || 'crs-default',
        courseName: selectedCourse?.name || 'Curso Técnico',
        regime,
        shift,
        photoUrl: gender === 'Feminino' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        status: 'Matriculado',
        convertedStudentId: createdStudent.id,
        convertedStudentCode: createdStudent.code,
        paymentStatus: paymentStatus === 'Isento' ? 'Pago' : paymentStatus,
        paymentAmount: paymentStatus === 'Isento' ? 0 : paymentAmount,
        paymentMethod,
        paymentReference: receiptNumber,
        analysisNotes: `Matrícula direta no balcão por ${chosenClass?.name}. Recibo ${receiptNumber}.`
      });

      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 }
      });
      soundManager.playSuccess();

      setCompletedResult({
        code: createdStudent.code,
        studentName: createdStudent.fullName,
        courseName: createdStudent.courseName,
        className: createdStudent.classGroupName,
        regime: createdStudent.regime,
        paymentStatus: paymentStatus,
        paymentAmount: paymentStatus === 'Isento' ? 0 : paymentAmount,
        receiptNumber,
        enrollmentType: 'direta',
        timestamp: new Date().toLocaleString('pt-PT')
      });

      success('Matrícula Concluída!', `${createdStudent.fullName} matriculado com sucesso sob o código ${createdStudent.code}!`);
    } else {
      // Register as candidate application
      const newCand = addApplication({
        institutionId: activeInstitution.id,
        branchId: activeBranchId !== 'todas' ? activeBranchId : undefined,
        fullName: fullName.trim(),
        documentType: documentType as any,
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
        courseId: selectedCourse?.id || 'crs-default',
        courseName: selectedCourse?.name || 'Curso Técnico',
        regime,
        shift,
        photoUrl: gender === 'Feminino' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        status: 'Aprovada',
        paymentStatus: paymentStatus === 'Isento' ? 'Pago' : paymentStatus,
        paymentAmount: paymentStatus === 'Isento' ? 0 : paymentAmount,
        paymentMethod,
        paymentReference: receiptNumber,
        analysisNotes: `Candidatura presencial de balcão pré-aprovada. Recibo: ${receiptNumber}.`
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      soundManager.playSuccess();

      setCompletedResult({
        code: newCand.code,
        studentName: newCand.fullName,
        courseName: newCand.courseName,
        className: 'Pendente de Alocação',
        regime: newCand.regime,
        paymentStatus: paymentStatus,
        paymentAmount: paymentStatus === 'Isento' ? 0 : paymentAmount,
        receiptNumber,
        enrollmentType: 'candidatura',
        timestamp: new Date().toLocaleString('pt-PT')
      });

      success('Candidatura Registada', `Inscrição #${newCand.code} de ${newCand.fullName} aprovada pela secretaria.`);
    }
  };

  // Reset Form for next student
  const handleResetForm = () => {
    setFullName('');
    setDocumentNumber('');
    setPhone('+258 84 ');
    setWhatsapp('+258 84 ');
    setEmail('');
    setAddress('');
    setGuardianName('');
    setGuardianPhone('');
    setReceiptNumber(`REC-${Date.now().toString().slice(-6)}`);
    setCompletedResult(null);
  };

  // Filtered applications from balcão / private
  const privateApplicationsList = useMemo(() => {
    return applications.filter(a => 
      a.paymentReference?.startsWith('BALCAO-') || 
      a.paymentReference?.startsWith('REC-') ||
      a.analysisNotes?.includes('balcão') ||
      a.analysisNotes?.includes('presencial')
    );
  }, [applications]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" />
              Plataforma de Inscrição Privada &amp; Balcão
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-sky-400" />
              {activeInstitution.name}
            </span>
            {activeBranch && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/40">
                Polo: {activeBranch.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-amber-400" />
            Admissões &amp; Inscrições Privadas da Instituição
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Atendimento presencial no balcão da secretaria, gestão de links exclusivos institucionais, geração de QR Code de divulgação e matrícula imediata.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('inscricao_publica')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-sky-500/40"
            title="Aceder ao portal de inscrição pública online"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Portal Público</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          <button
            onClick={() => navigate('candidatos_gestao')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gestão de Candidaturas</span>
          </button>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl gap-1 w-full max-w-2xl">
        <button
          onClick={() => { setActiveTab('balcao'); soundManager.playClick(); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'balcao'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Balcão Presencial</span>
        </button>

        <button
          onClick={() => { setActiveTab('links'); soundManager.playClick(); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'links'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Central de Links</span>
        </button>

        <button
          onClick={() => { setActiveTab('cartaz'); soundManager.playClick(); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'cartaz'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Cartaz &amp; QR Code</span>
        </button>

        <button
          onClick={() => { setActiveTab('historico'); soundManager.playClick(); }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'historico'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Histórico Balcão</span>
        </button>
      </div>

      {/* TAB 1: BALCÃO PRESENCIAL */}
      {activeTab === 'balcao' && (
        <div className="space-y-6">
          
          {/* Information & Mode selector banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-sky-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Registo Direto de Aluno no Balcão da Secretaria</h3>
                <p className="text-xs text-slate-400">
                  Preencha os dados recolhidos presencialmente para emitir imediatamente o código oficial e comprovativo com QR Code.
                </p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setEnrollmentMode('direta')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  enrollmentMode === 'direta'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Matrícula Direta</span>
              </button>
              <button
                type="button"
                onClick={() => setEnrollmentMode('candidatura')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  enrollmentMode === 'candidatura'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Candidatura Balcão</span>
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmitBalcao} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Personal and Academic Data */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Section 1: Dados Pessoais */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>1. Identificação do Candidato / Aluno</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Nome Completo do Aluno <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Amina Selemane Bacar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Tipo de Documento</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="BI">Bilhete de Identidade (BI)</option>
                      <option value="DIRE">DIRE (Estrangeiro)</option>
                      <option value="Passaporte">Passaporte Oficial</option>
                      <option value="Cédula">Cédula Pessoal / Assento</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Número do Documento <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value.toUpperCase())}
                      placeholder="Ex: 110293847291M"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Data de Nascimento</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Gênero</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Telemóvel (Chamadas) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+258 84 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">WhatsApp</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+258 84 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Correio Eletrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aluno@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Província</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {PROVINCES_MOZAMBIQUE.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Cidade / Distrito</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Nacala-Porto"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Bairro / Residência</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Bairro Triângulo, Rua 12"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dados Académicos & Turma */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>2. Curso, Turma &amp; Regime de Aulas</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Curso Técnico / Profissional <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        // Reset class if needed
                        const matched = classes.filter(c => c.courseId === e.target.value);
                        if (matched[0]) setSelectedClassId(matched[0].id);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                    >
                      {courses.map((crs) => (
                        <option key={crs.id} value={crs.id}>
                          {crs.name} • {crs.duration} ({crs.category || 'Técnico'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Regime</label>
                    <select
                      value={regime}
                      onChange={(e) => setRegime(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Laboral">Laboral (Segunda a Sexta)</option>
                      <option value="Pós-Laboral">Pós-Laboral (Noturno)</option>
                      <option value="Online">Online / EAD</option>
                      <option value="Sábado">Intensivo de Sábado</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Turno</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Manhã">Manhã (07:30 - 12:30)</option>
                      <option value="Tarde">Tarde (13:00 - 17:30)</option>
                      <option value="Noite">Noite (18:00 - 21:30)</option>
                    </select>
                  </div>

                  {enrollmentMode === 'direta' && (
                    <div className="sm:col-span-2 space-y-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Alocar na Turma de Aulas Imediata</span>
                      </label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                      >
                        {availableClasses.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} • Sala: {cls.room || 'Principal'} • Horário: {cls.shift} ({cls.academicYear || '2026'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right 1 Col: Financial, Documents, Action */}
            <div className="space-y-6">
              
              {/* Financial Box */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>3. Taxa de Inscrição / Recibo</span>
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Valor da Taxa (MT)</label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        disabled={isScholarship}
                        value={isScholarship ? 0 : paymentAmount}
                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-amber-500 disabled:opacity-60"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-500">MZN</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Estado do Pagamento</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setPaymentStatus(val);
                        if (val === 'Isento') setIsScholarship(true);
                        else setIsScholarship(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 mt-1 cursor-pointer"
                    >
                      <option value="Pago">Pago no Balcão (Confirmado)</option>
                      <option value="Isento">Isento / Bolsa Institucional</option>
                      <option value="Pendente">Pendente de Pagamento</option>
                    </select>
                  </div>

                  {paymentStatus !== 'Isento' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Forma de Pagamento</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 mt-1 cursor-pointer"
                        >
                          <option value="Numerário">Numerário / Caixa Balcão</option>
                          <option value="POS/Cartão">POS / Cartão Bancário</option>
                          <option value="M-Pesa">M-Pesa Moçambique</option>
                          <option value="e-Mola">e-Mola Movitel</option>
                          <option value="Transferência BIM">Transferência Bancária (BIM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">Nº do Recibo / Talão</label>
                        <input
                          type="text"
                          value={receiptNumber}
                          onChange={(e) => setReceiptNumber(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 mt-1 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </>
                  )}

                  {isScholarship && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-amber-400">Motivo da Isenção / Bolsa</label>
                      <input
                        type="text"
                        value={scholarshipNote}
                        onChange={(e) => setScholarshipNote(e.target.value)}
                        placeholder="Ex: Parceria Empresa Vale / Bolsa Mérito"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Physical Documents Checked */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Conferência de Documentos Físicos</span>
                </h3>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={biVerified}
                    onChange={(e) => setBiVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span>Original de BI / Documento conferido</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={certVerified}
                    onChange={(e) => setCertVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span>Certificado de Habilitações autenticado</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={photosReceived}
                    onChange={(e) => setPhotosReceived(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span>Fotografias tipo passe entregues</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>
                  {enrollmentMode === 'direta' ? 'Efetivar Matrícula Direta' : 'Aprovar Candidatura Balcão'}
                </span>
              </button>

            </div>

          </form>

        </div>
      )}

      {/* TAB 2: CENTRAL DE LINKS INSTITUCIONAIS */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-white">Central de Links Oficiais de Inscrição</h2>
            <p className="text-xs text-slate-400 mt-1">
              Cada instituição possui canais distintos de admissão. Partilhe o link público para campanhas abertas ou o link privado para parcerias e turmas com acesso restrito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Link 1: Público Oficial */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">1. Link Público de Inscrição</h3>
                    <p className="text-[11px] text-slate-400">Acesso aberto para qualquer candidato online</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
                  Público
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 break-all select-all">
                {publicRegistrationUrl}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Utilize este link para divulgar em redes sociais (Facebook, Instagram, LinkedIn), panfletos e no website da instituição. Os candidatos podem consultar cursos, enviar BI e pagar via M-Pesa.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(publicRegistrationUrl, 'Link Público')}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  {copiedLinkType === 'Link Público' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLinkType === 'Link Público' ? 'Copiado!' : 'Copiar Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.open(publicRegistrationUrl, '_blank')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Testar Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => openWhatsAppMessage(
                    activeInstitution.phone || '+258840000000',
                    `Olá! Faça já a sua inscrição oficial nos cursos de ${activeInstitution.name} através do link seguro: ${publicRegistrationUrl}`
                  )}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Link 2: Privado / Exclusivo */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">2. Link Privado Institucional</h3>
                    <p className="text-[11px] text-amber-400 font-medium">Turmas corporativas, bolsas &amp; convênios</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                  Privado
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 break-all select-all">
                {privateRegistrationUrl}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Este link contém um token de segurança exclusivo. Deve ser entregue apenas a empresas parceiras, beneficiários de bolsas institucionais ou candidatos selecionados para turmas fechadas.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(privateRegistrationUrl, 'Link Privado')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                >
                  {copiedLinkType === 'Link Privado' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLinkType === 'Link Privado' ? 'Copiado!' : 'Copiar Link Privado'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newToken = `MTW-PRIV-${activeInstitution.code || '2026'}-${Math.floor(100 + Math.random() * 900)}`;
                    setPrivateToken(newToken);
                    info('Novo Token Gerado', 'O token de acesso privado foi renovado com sucesso.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Regerar Token</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick Domain Notice */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-white">Domínio Oficial de Produção:</span>
              <p className="text-slate-400">
                Os links gerados utilizam o domínio oficial <strong className="text-emerald-400">{productionBaseUrl}</strong>. Qualquer candidato que aceder a este link terá a instituição e os cursos automaticamente carregados.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CARTAZ & QR CODE PARA IMPRESSÃO */}
      {activeTab === 'cartaz' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Cartaz Oficial de Divulgação com QR Code</h2>
              <p className="text-xs text-slate-400 mt-1">
                Imprima este cartaz em formato A4 para afixar na portaria, secretaria e murais da instituição. Os alunos apontam a câmera do telemóvel e inscrevem-se no portal público oficial.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Cartaz A4</span>
            </button>
          </div>

          {/* Printable Poster Card */}
          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900 border-2 border-slate-700 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inscrições Abertas • Ano Letivo 2026</span>
            </div>

            {/* Institution Header */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeInstitution.name}
              </h1>
              <p className="text-xs text-slate-400">
                {activeInstitution.address || 'Nacala-Porto, Nampula • Moçambique'}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-6 bg-white rounded-3xl w-56 h-56 mx-auto flex items-center justify-center shadow-xl border-4 border-slate-800">
              <RealQRCode
                value={publicRegistrationUrl}
                size={190}
                darkColor="#090d16"
                lightColor="#ffffff"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">
                Aponte a câmara do seu telemóvel para fazer a sua inscrição
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aceda ao catálogo de cursos técnicos, envie a cópia do seu BI e conclua o pagamento da taxa escolar por M-Pesa ou no balcão.
              </p>
            </div>

            {/* Footer with Contact and Security Stamp */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-4 text-left text-[11px] text-slate-400">
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeInstitution.phone || '+258 84 000 0000'}</span>
                </div>
                <div>Secretaria Acadêmica &amp; Atendimento</div>
              </div>

              <div className="space-y-1 text-right">
                <div className="font-bold text-white flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SIGAR PRO • SIVEC</span>
                </div>
                <div className="text-slate-500 font-mono">Moztechwave Core Platform</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: HISTÓRICO DE BALCÃO */}
      {activeTab === 'historico' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Histórico de Inscrições Realizadas no Balcão</h2>
              <p className="text-xs text-slate-400 mt-1">
                Registo de candidatos inscritos diretamente pela secretaria nesta instituição.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-bold text-amber-400">
              {privateApplicationsList.length} Inscrições
            </span>
          </div>

          {privateApplicationsList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Nenhuma inscrição de balcão ainda</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando inscrever novos candidatos através do formulário de balcão, o registo detalhado ficará visível nesta secção.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Código</th>
                      <th className="p-3.5">Candidato / Aluno</th>
                      <th className="p-3.5">Documento</th>
                      <th className="p-3.5">Curso Pretendido</th>
                      <th className="p-3.5">Regime / Turno</th>
                      <th className="p-3.5">Pagamento</th>
                      <th className="p-3.5">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {privateApplicationsList.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-400">{app.code}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{app.fullName}</div>
                          <div className="text-[11px] text-slate-400">{app.phone}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">{app.documentNumber}</td>
                        <td className="p-3.5">{app.courseName}</td>
                        <td className="p-3.5">{app.regime} • {app.shift}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.paymentStatus === 'Pago' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {app.paymentStatus} ({app.paymentAmount || 1500} MT)
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400">
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION / COMPROVATIVO MODAL */}
      {completedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {completedResult.enrollmentType === 'direta' ? 'Matrícula Efetivada com Sucesso!' : 'Inscrição de Balcão Registada!'}
                  </h3>
                  <p className="text-xs text-slate-400">Comprovativo Oficial emitido pela Secretaria</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {completedResult.code}
              </span>
            </div>

            {/* Official Receipt Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold">Instituição</span>
                  <p className="text-xs font-bold text-white">{activeInstitution.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-semibold">Recibo Nº</span>
                  <p className="text-xs font-mono font-bold text-amber-400">{completedResult.receiptNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-[11px] text-slate-400">Aluno Matriculado:</span>
                  <p className="font-bold text-white">{completedResult.studentName}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Curso:</span>
                  <p className="font-bold text-white">{completedResult.courseName}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Turma / Regime:</span>
                  <p className="font-semibold text-slate-300">{completedResult.className} • {completedResult.regime}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Taxa Escolar:</span>
                  <p className="font-bold text-emerald-400">{completedResult.paymentAmount} MZN ({completedResult.paymentStatus})</p>
                </div>
              </div>

              {/* QR Code Validation */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-800/80">
                <div className="p-2 bg-white rounded-xl shrink-0">
                  <RealQRCode
                    value={JSON.stringify({
                      code: completedResult.code,
                      name: completedResult.studentName,
                      inst: activeInstitution.id,
                      status: 'Matriculado'
                    })}
                    size={80}
                    darkColor="#090d16"
                    lightColor="#ffffff"
                  />
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Validação Oficial SIVEC</span>
                  </div>
                  <p>
                    Código emitido e reconhecido pelo sistema de controlo de portaria e pautas da instituição.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">{completedResult.timestamp}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span>Imprimir Ficha</span>
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inscrever Próximo Aluno</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PrivateRegistrationView;
