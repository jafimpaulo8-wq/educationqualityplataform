import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  User, 
  CreditCard, 
  Sparkles, 
  Printer, 
  ShieldCheck, 
  Check, 
  Image as ImageIcon,
  RotateCcw,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { COURSES_DATA, PROVINCES_MOZAMBIQUE } from '../data/mockData';
import { RegistrationApplication, Course } from '../types';
import { soundManager } from '../utils/audio';

interface RegistrationWizardProps {
  initialCourseId?: string;
  onRegistrationComplete: (application: RegistrationApplication) => void;
}

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({
  initialCourseId,
  onRegistrationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<RegistrationApplication | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<'BI' | 'Passaporte' | 'DIRE'>('BI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('Maputo Cidade');
  const [city, setCity] = useState('Maputo');
  const [birthDate, setBirthDate] = useState('2003-04-12');
  const [gender, setGender] = useState<'Masculino' | 'Feminino'>('Masculino');
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || COURSES_DATA[0].id);
  const [regime, setRegime] = useState('Pós-Laboral');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola' | 'ponto24' | 'presencial'>('mpesa');

  // Photo switching state ("efeitos de mudar as fotos daqui para aqui")
  const defaultSamplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  ];
  const [selectedPhoto, setSelectedPhoto] = useState(defaultSamplePhotos[0]);
  const [customPhotoUploaded, setCustomPhotoUploaded] = useState<string | null>(null);

  const activeCourse = COURSES_DATA.find((c) => c.id === selectedCourseId) || COURSES_DATA[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setCustomPhotoUploaded(reader.result as string);
          setSelectedPhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const generatedCode = `SIGAR-MZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newApp: RegistrationApplication = {
        id: `app-${Date.now()}`,
        institutionId: activeCourse.institutionId || 'inst-1',
        branchId: activeCourse.branchId || 'branch-1-maputo',
        code: generatedCode,
        fullName: fullName || 'Candidato Moçambicano Moztechwave',
        documentType,
        documentNumber: documentNumber || '110293847291M',
        email: email || 'candidato@email.com',
        phone: phone ? `+258 ${phone}` : '+258 84 000 0000',
        province,
        city: city || 'Maputo',
        birthDate,
        gender,
        courseId: activeCourse.id,
        courseName: activeCourse.name,
        regime,
        status: paymentMethod === 'presencial' ? 'Aguardando Pagamento' : 'Aprovada',
        photoUrl: selectedPhoto,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        paymentStatus: paymentMethod === 'presencial' ? 'Pendente' : 'Pago',
        paymentReference: `${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
      };

      setSubmittedApplication(newApp);
      setCurrentStep(5); // voucher step

      // Play chime & confetti
      soundManager.playSuccess();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });

      onRegistrationComplete(newApp);
    }, 1500);
  };

  const steps = [
    { num: 1, title: 'Dados Pessoais' },
    { num: 2, title: 'Curso & Regime' },
    { num: 3, title: 'Foto & Identificação' },
    { num: 4, title: 'Pagamento SIVERC' },
  ];

  return (
    <section id="inscricao" className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            Ficha de Inscrição Oficial 2026/2027
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Inscrição Online no SIGAR Moztechwave
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Preencha os seus dados para validação acadêmica e emissão automática do seu processo e cartão de estudante digital.
          </p>
        </div>

        {/* Step Indicator (Only if not final voucher) */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-2">
              {steps.map((s) => {
                const isCompleted = currentStep > s.num;
                const isActive = currentStep === s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isActive
                          ? 'bg-sky-500 text-white ring-4 ring-sky-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                    </div>
                    <span className={`text-[11px] mt-1.5 hidden sm:block ${
                      isActive ? 'text-white font-bold' : 'text-slate-400'
                    }`}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* STEP 1: DADOS PESSOAIS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <User className="w-4 h-4 text-sky-400" />
                Passo 1: Identificação do Candidato
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome Completo do Candidato: *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Benedito Augusto Cossa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tipo de Documento:
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as 'BI' | 'Passaporte' | 'DIRE')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option value="BI">Bilhete de Identidade (BI)</option>
                    <option value="Passaporte">Passaporte Nacional / Estrangeiro</option>
                    <option value="DIRE">DIRE (Residentes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Número do Documento: *
                  </label>
                  <input
                    type="text"
                    required
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Ex: 110293817290A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:border-sky-500 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contacto Telefónico (WhatsApp / Chamadas): *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono">
                      +258
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="84 123 4567"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Endereço de E-mail: *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidato@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Província de Residência:
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
                  >
                    {PROVINCES_MOZAMBIQUE.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cidade / Distrito:
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Maputo, Matola, Beira"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-all cursor-pointer"
                >
                  <span>Avançar para Cursos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CURSO & REGIME */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Passo 2: Escolha do Curso &amp; Regime de Aulas
              </h3>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Selecione o Curso Desejado na Moztechwave:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COURSES_DATA.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedCourseId === course.id
                          ? 'bg-sky-950/40 border-sky-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold leading-snug">{course.name}</h4>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold ml-2 shrink-0">
                          {course.feeMonthly.toLocaleString()} MT
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{course.duration} • {course.level}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Regime de Frequência:
                  </label>
                  <select
                    value={regime}
                    onChange={(e) => setRegime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Laboral (Manhã/Tarde)">Laboral (08:00 - 12:30)</option>
                    <option value="Pós-Laboral (Noite)">Pós-Laboral (17:30 - 21:00)</option>
                    <option value="Sábado Intensivo">Sábado Intensivo (08:00 - 16:30)</option>
                    <option value="Online EAD com Tutoria">Online EAD com Tutoria 24/7</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Taxa de Inscrição:
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-sm flex items-center justify-between">
                    <span>Taxa Única de Processamento:</span>
                    <span>{activeCourse.registrationFee.toLocaleString()} MT</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-all cursor-pointer"
                >
                  <span>Avançar para Foto</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FOTO & IDENTIFICAÇÃO ("efeitos de mudar as fotos daqui para aqui") */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  Passo 3: Foto Tipo Passe &amp; Identificação do Aluno
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta foto será impressa no seu Cartão Digital SIVERC e no seu Certificado de Qualificação.
                </p>
              </div>

              {/* Photo Switcher Interface */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Active Photo Box with smooth transition */}
                <div className="sm:col-span-5 flex flex-col items-center">
                  <div className="relative w-40 h-48 rounded-2xl overflow-hidden border-4 border-sky-500/80 shadow-2xl bg-slate-950 group">
                    <img
                      src={selectedPhoto}
                      alt="Foto do Aluno"
                      className="w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-center text-sky-300 border border-sky-500/30 backdrop-blur-md">
                      Foto Oficial Aprovada
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">Dimensão: 3x4 Padrão SIVERC</span>
                </div>

                {/* Switcher Controls ("efeitos de mudar as fotos daqui para aqui") */}
                <div className="sm:col-span-7 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Alternar Fotos ou Carregar a Sua:
                    </span>

                    {/* Pre-set sample avatars */}
                    <div className="grid grid-cols-4 gap-2">
                      {defaultSamplePhotos.map((photoUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPhoto(photoUrl)}
                          className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            selectedPhoto === photoUrl
                              ? 'border-sky-400 ring-2 ring-sky-500/30 scale-95'
                              : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={photoUrl} alt="Opção" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    {/* Custom upload button */}
                    <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-sky-500 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer">
                      <Upload className="w-4 h-4 text-sky-400" />
                      <span>{customPhotoUploaded ? 'Alterar Imagem do Seu Dispositivo' : 'Fazer Upload da Minha Foto Real'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-all cursor-pointer"
                >
                  <span>Ir para Pagamento SIVERC</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAGAMENTO SIVERC */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Passo 4: Liquidação da Taxa de Inscrição
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Integração instantânea com confirmação automática via M-Pesa, E-Mola ou Ponto24.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Candidato:</span>
                  <span className="text-white font-bold">{fullName || 'Candidato Moçambicano'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Curso:</span>
                  <span className="text-sky-400 font-semibold">{activeCourse.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Regime:</span>
                  <span className="text-slate-300">{regime}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
                  <span className="text-white">Taxa a Liquidar:</span>
                  <span className="text-emerald-400 font-mono">{activeCourse.registrationFee.toLocaleString()} MT</span>
                </div>
              </div>

              {/* Payment Gateway Choice */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'mpesa'
                      ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block text-xs font-bold">M-Pesa</span>
                  <span className="text-[10px] text-slate-400">Vodacom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('emola')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'emola'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block text-xs font-bold">e-Mola</span>
                  <span className="text-[10px] text-slate-400">Movitel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ponto24')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'ponto24'
                      ? 'bg-sky-950/40 border-sky-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block text-xs font-bold">Ponto24</span>
                  <span className="text-[10px] text-slate-400">ATM/Cartão</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('presencial')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'presencial'
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block text-xs font-bold">Secretaria</span>
                  <span className="text-[10px] text-slate-400">Pagar no Local</span>
                </button>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processando Inscrição SIVERC...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir e Emitir Matrícula</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: REGISTRATION VOUCHER / COMPROVATIVO OFICIAL */}
          {currentStep === 5 && submittedApplication && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-2xl font-black text-white">Inscrição Efetuada com Sucesso!</h3>
                <p className="text-xs text-slate-300">
                  O seu processo acadêmico foi gerado e registrado no SIVERC Moztechwave.
                </p>
              </div>

              {/* Printable Official Voucher Card */}
              <div id="registration-voucher-receipt" className="p-6 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      COMPROVATIVO OFICIAL DE INSCRIÇÃO
                    </span>
                    <h4 className="text-base font-black text-white">MOZTECHWAVE ACADEMY</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {submittedApplication.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Código do Candidato:</span>
                    <p className="font-mono font-bold text-white text-sm">{submittedApplication.code}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Referência de Pagamento:</span>
                    <p className="font-mono font-bold text-sky-400">{submittedApplication.paymentReference}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Nome:</span>
                    <p className="font-bold text-white">{submittedApplication.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Documento:</span>
                    <p className="font-mono text-slate-200">{submittedApplication.documentNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Curso Inscrito:</span>
                    <p className="font-bold text-emerald-400 text-sm">{submittedApplication.courseName}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Apresente este código ou o cartão virtual na portaria da Moztechwave no primeiro dia de aulas.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setSubmittedApplication(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nova Inscrição</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Comprovativo</span>
                  </button>

                  <a
                    href="#certificados"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer"
                  >
                    <span>Ver Meu Certificado Futuro &rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
