import React, { useState } from 'react';
import { 
  Globe, 
  Sliders, 
  BookOpen, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  Phone, 
  Share2, 
  Copy, 
  ExternalLink, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  QrCode,
  Sparkles,
  HelpCircle,
  Save,
  MessageCircle,
  Baby,
  GraduationCap,
  School
} from 'lucide-react';
import { 
  Institution, 
  OnlineRegistrationConfig, 
  OnlineCourseConfig, 
  FieldRequirementStatus,
  OnlineRegistrationRequiredFields
} from '../../types';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';
import { getPublicRegistrationUrl, normalizeSlug } from '../../services/publicInstitutionService';

interface OnlineRegistrationSettingsPanelProps {
  institution: Institution;
  onSave: (updatedConfig: OnlineRegistrationConfig, updatedSlug?: string) => Promise<void> | void;
}

export const OnlineRegistrationSettingsPanel: React.FC<OnlineRegistrationSettingsPanelProps> = ({
  institution,
  onSave
}) => {
  const { success, error: toastError, info } = useToast();

  const initialConfig = institution.onlineRegistrationConfig || {
    institutionId: institution.id,
    isOpen: true,
    title: `Inscrições Abertas — ${institution.name}`,
    description: `Candidaturas abertas para o ano letivo. Submeta a sua candidatura digital com comodidade e segurança.`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    academicYear: '2026',
    semester: 'Ano Completo',
    requiredFields: {
      email: 'opcional',
      phone: 'obrigatorio',
      documentNumber: 'obrigatorio',
      birthDate: 'obrigatorio',
      gender: 'obrigatorio',
      province: 'obrigatorio',
      city: 'obrigatorio',
      address: 'obrigatorio',
      guardianName: institution.type === 'centro_infantil' ? 'obrigatorio' : 'opcional',
      guardianPhone: institution.type === 'centro_infantil' ? 'obrigatorio' : 'opcional',
      guardianRelationship: institution.type === 'centro_infantil' ? 'obrigatorio' : 'oculto',
      authorizedPickupPersons: institution.type === 'centro_infantil' ? 'obrigatorio' : 'oculto'
    },
    requiredDocuments: [
      'Documento de Identificação Oficial (BI / Passaporte / Cédula)',
      'Fotografia recente tipo passe'
    ],
    customQuestions: [],
    coursesConfig: [],
    autoApproveOnPayment: false,
    confirmationMessageTemplate: 'Agradecemos a sua candidatura! A nossa equipa analisará os dados submetidos e entrará em contacto.'
  };

  const [activeSection, setActiveSection] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Página Pública
  const [isOpen, setIsOpen] = useState(initialConfig.isOpen ?? true);
  const [title, setTitle] = useState(initialConfig.title || '');
  const [description, setDescription] = useState(initialConfig.description || '');
  const [academicYear, setAcademicYear] = useState(initialConfig.academicYear || '2026');
  const [semester, setSemester] = useState(initialConfig.semester || 'Ano Completo');
  const [startDate, setStartDate] = useState(initialConfig.startDate || '');
  const [endDate, setEndDate] = useState(initialConfig.endDate || '');

  // Slug oficial
  const defaultSlug = institution.slug || (
    institution.id === 'ceu-azul-nacala' 
      ? 'ceu-azul' 
      : institution.id === 'inst-1' 
        ? 'cftpm-moztechwave' 
        : institution.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  );
  const [slug, setSlug] = useState(defaultSlug);

  // 2. Campos do Formulário
  const [fieldRequirements, setFieldRequirements] = useState<OnlineRegistrationRequiredFields>({
    email: initialConfig.requiredFields?.email ?? 'opcional',
    phone: initialConfig.requiredFields?.phone ?? 'obrigatorio',
    documentNumber: initialConfig.requiredFields?.documentNumber ?? 'obrigatorio',
    birthDate: initialConfig.requiredFields?.birthDate ?? 'obrigatorio',
    gender: initialConfig.requiredFields?.gender ?? 'obrigatorio',
    province: initialConfig.requiredFields?.province ?? 'obrigatorio',
    city: initialConfig.requiredFields?.city ?? 'obrigatorio',
    address: initialConfig.requiredFields?.address ?? 'obrigatorio',
    guardianName: initialConfig.requiredFields?.guardianName ?? 'obrigatorio',
    guardianPhone: initialConfig.requiredFields?.guardianPhone ?? 'obrigatorio',
    guardianRelationship: initialConfig.requiredFields?.guardianRelationship ?? (institution.type === 'centro_infantil' ? 'obrigatorio' : 'oculto'),
    authorizedPickupPersons: initialConfig.requiredFields?.authorizedPickupPersons ?? (institution.type === 'centro_infantil' ? 'obrigatorio' : 'oculto'),
    nuit: initialConfig.requiredFields?.nuit ?? 'opcional',
    previousSchool: initialConfig.requiredFields?.previousSchool ?? 'opcional'
  });

  // 3. Cursos / Salas
  const [courses, setCourses] = useState<OnlineCourseConfig[]>(initialConfig.coursesConfig || []);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState(institution.type === 'centro_infantil' ? 'Educação Infantil' : 'Formação');
  const [newCoursePrice, setNewCoursePrice] = useState(1000);
  const [newCourseMonthly, setNewCourseMonthly] = useState(3000);
  const [newCourseVacancies, setNewCourseVacancies] = useState(20);

  // 4. Documentos Exigidos
  const [documents, setDocuments] = useState<string[]>(initialConfig.requiredDocuments || []);
  const [newDocText, setNewDocText] = useState('');

  // 5. Métodos de Pagamento
  const [mpesaNumber, setMpesaNumber] = useState(institution.financialSettings?.mpesaNumber || institution.phone || '84');
  const [emolaNumber, setEmolaNumber] = useState(institution.financialSettings?.emolaNumber || '86');
  const [bankInfo, setBankInfo] = useState(institution.financialSettings?.bankInfo || 'Millennium BIM / BCI');

  // 6. Termos e Privacidade
  const [termsText, setTermsText] = useState(
    `1. A submissão da candidatura na ${institution.name} constitui manifestação de interesse e não confere garantia automática de admissão.\n2. A homologação da matrícula depende da validação física dos documentos originais pela Secretaria.\n3. A taxa de inscrição não é reembolsável após análise do processo.`
  );
  const [privacyText, setPrivacyText] = useState(
    `A ${institution.name} garante a salvaguarda e o tratamento confidencial dos dados recolhidos para fins exclusivamente de matrícula académica e segurança escolar, nos termos da legislação moçambicana.`
  );

  // 7. Contactos e Avisos
  const [contactPhone, setContactPhone] = useState(institution.phone || '');
  const [contactWhatsapp, setContactWhatsapp] = useState(institution.whatsapp || institution.phone || '');
  const [contactEmail, setContactEmail] = useState(institution.email || '');
  const [confirmationTemplate, setConfirmationTemplate] = useState(
    initialConfig.confirmationMessageTemplate || 
    `Agradecemos a sua candidatura na ${institution.name}! A nossa equipa entrará em contacto via WhatsApp ou telefone para agendamento e formalização da matrícula.`
  );

  const publicUrl = getPublicRegistrationUrl({ ...institution, slug });

  // Aplicar Perfis Pré-Definidos de Acordo com o Tipo Institucional
  const applyChildCenterPreset = () => {
    setFieldRequirements({
      email: 'opcional',
      phone: 'obrigatorio',
      documentNumber: 'opcional', // Criança pode não ter BI ainda
      birthDate: 'obrigatorio',
      gender: 'obrigatorio',
      province: 'obrigatorio',
      city: 'obrigatorio',
      address: 'obrigatorio',
      guardianName: 'obrigatorio',
      guardianPhone: 'obrigatorio',
      guardianRelationship: 'obrigatorio',
      authorizedPickupPersons: 'obrigatorio',
      nuit: 'oculto',
      previousSchool: 'opcional'
    });
    setDocuments([
      'Cédula de Nascimento ou Assento de Nascimento da Criança',
      'Boletim / Cartão de Vacinas Atualizado',
      'Fotocópia do BI / Identificação dos Pais ou Encarregados',
      'Fotografia recente tipo passe da criança (fundo branco)'
    ]);
    info('Perfil Aplicado', 'Configurações de campos e documentos calibradas para Centro Infantil / Creche.');
  };

  const applySchoolPreset = () => {
    setFieldRequirements({
      email: 'opcional',
      phone: 'obrigatorio',
      documentNumber: 'obrigatorio',
      birthDate: 'obrigatorio',
      gender: 'obrigatorio',
      province: 'obrigatorio',
      city: 'obrigatorio',
      address: 'obrigatorio',
      guardianName: 'obrigatorio',
      guardianPhone: 'obrigatorio',
      guardianRelationship: 'opcional',
      authorizedPickupPersons: 'opcional',
      nuit: 'opcional',
      previousSchool: 'obrigatorio'
    });
    setDocuments([
      'Bilhete de Identidade (BI) ou Cédula de Nascimento',
      'Certificado de Habilitações ou Declaração com Notas da Escola Anterior',
      'Guia de Transferência Oficial (quando aplicável)',
      'Fotografia tipo passe'
    ]);
    info('Perfil Aplicado', 'Configurações calibradas para Escola de Ensino Geral.');
  };

  const applyVocationalPreset = () => {
    setFieldRequirements({
      email: 'obrigatorio',
      phone: 'obrigatorio',
      documentNumber: 'obrigatorio',
      birthDate: 'obrigatorio',
      gender: 'obrigatorio',
      province: 'obrigatorio',
      city: 'obrigatorio',
      address: 'obrigatorio',
      guardianName: 'opcional', // Apenas se menor
      guardianPhone: 'opcional',
      guardianRelationship: 'oculto',
      authorizedPickupPersons: 'oculto',
      nuit: 'obrigatorio',
      previousSchool: 'obrigatorio'
    });
    setDocuments([
      'Bilhete de Identidade (BI), DIRE ou Passaporte Válido',
      'Certificado de Habilitações Literárias (10ª ou 12ª Classe)',
      'Declaração ou Cartão de NUIT',
      'Fotografia tipo passe recente (fundo branco)'
    ]);
    info('Perfil Aplicado', 'Configurações calibradas para Centro de Formação Técnico-Profissional ou Superior.');
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      soundManager.playSuccess();
      success('Link Copiado!', 'O endereço público oficial da instituição foi copiado para a área de transferência.');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(
      `Prezados encarregados e candidatos, estão abertas as inscrições na *${institution.name}*!\n\nAceda ao nosso portal oficial seguro para consultar vagas, requisitos e submeter a sua candidatura online:\n${publicUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newC: OnlineCourseConfig = {
      courseId: `crs-${Date.now()}`,
      courseName: newCourseName.trim(),
      category: newCourseCategory,
      active: true,
      price: Number(newCoursePrice) || 1000,
      monthlyFee: Number(newCourseMonthly) || 3000,
      duration: institution.type === 'centro_infantil' ? 'Ano Letivo' : '6 Meses',
      requirements: ['Inscrição formalizada', 'Documentos entregues'],
      vacancies: Number(newCourseVacancies) || 20,
      filledVacancies: 0,
      regimes: ['Laboral'],
      shifts: ['Manhã', 'Tarde', 'Integral']
    };

    setCourses([...courses, newC]);
    setNewCourseName('');
    soundManager.playClick();
  };

  const handleRemoveCourse = (courseId: string) => {
    setCourses(courses.filter(c => c.courseId !== courseId));
    soundManager.playClick();
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocText.trim()) return;
    if (!documents.includes(newDocText.trim())) {
      setDocuments([...documents, newDocText.trim()]);
    }
    setNewDocText('');
    soundManager.playClick();
  };

  const handleRemoveDocument = (docName: string) => {
    setDocuments(documents.filter(d => d !== docName));
    soundManager.playClick();
  };

  const handleSaveAll = async () => {
    setSaving(true);
    soundManager.playClick();
    try {
      const updatedConfig: OnlineRegistrationConfig = {
        institutionId: institution.id,
        isOpen,
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
        academicYear,
        semester,
        requiredFields: fieldRequirements,
        requiredDocuments: documents,
        customQuestions: initialConfig.customQuestions || [],
        coursesConfig: courses,
        autoApproveOnPayment: false,
        confirmationMessageTemplate: confirmationTemplate
      };

      const cleanSlug = normalizeSlug(slug) || defaultSlug;
      await onSave(updatedConfig, cleanSlug);

      soundManager.playSuccess();
      success('Configuração Salva', 'Os parâmetros do portal público foram atualizados e sincronizados com sucesso.');
    } catch (err: any) {
      toastError('Erro ao Salvar', err.message || 'Falha ao gravar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 1, title: '1. Página Pública', icon: <Globe className="w-4 h-4 text-emerald-400" /> },
    { id: 2, title: '2. Campos do Formulário', icon: <Sliders className="w-4 h-4 text-sky-400" /> },
    { id: 3, title: '3. Cursos, Salas & Preços', icon: <BookOpen className="w-4 h-4 text-blue-400" /> },
    { id: 4, title: '4. Documentos Exigidos', icon: <FileText className="w-4 h-4 text-amber-400" /> },
    { id: 5, title: '5. Métodos de Pagamento', icon: <DollarSign className="w-4 h-4 text-purple-400" /> },
    { id: 6, title: '6. Termos & Privacidade', icon: <ShieldCheck className="w-4 h-4 text-rose-400" /> },
    { id: 7, title: '7. Contactos & Avisos', icon: <Phone className="w-4 h-4 text-teal-400" /> },
    { id: 8, title: '8. Link, QR Code & Divulgação', icon: <Share2 className="w-4 h-4 text-indigo-400" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Link Info */}
      <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-blue-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              Portal Público Isolado
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {institution.name}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Configuração das Inscrições Online
          </h2>
          <p className="text-xs text-slate-400">
            Cada instituição configura e gere exclusivamente o seu portal público, sem partilha de cursos, preços ou identidades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copiedLink ? 'Copiado!' : 'Copiar Link'}
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Testar Portal
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'A salvar...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sections.map(sec => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeSection === sec.id
                ? 'bg-slate-800/90 border-blue-500 text-white ring-2 ring-blue-500/20 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
              {sec.icon}
            </span>
            <span className="text-xs font-semibold truncate">{sec.title}</span>
          </button>
        ))}
      </div>

      {/* SECTION CONTENT */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
        
        {/* 1. PÁGINA PÚBLICA */}
        {activeSection === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  1. Configuração da Página Pública
                </h3>
                <p className="text-xs text-slate-400">
                  Parâmetros de abertura, datas e títulos visíveis no portal do candidato.
                </p>
              </div>

              {/* Status Switch */}
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-bold ${isOpen ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isOpen ? 'Inscrições Abertas' : 'Inscrições Fechadas'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                    isOpen ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    isOpen ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Principal da Página
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Inscrições Abertas — Ano Letivo 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição & Apresentação Institucional
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve texto institucional com diferenciais, horários e orientações gerais..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ano Letivo
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="Ex: 2026 ou 2026/2027"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Período / Semestre
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Ex: Ano Completo, 1º Semestre"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data Limite de Candidaturas
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. CAMPOS DO FORMULÁRIO */}
        {activeSection === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  2. Configuração Dinâmica dos Campos do Formulário
                </h3>
                <p className="text-xs text-slate-400">
                  Cada campo pode ser configurado como Obrigatório, Opcional ou Oculto conforme a tipologia institucional.
                </p>
              </div>

              {/* Botões de Presets por Tipo */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 mr-1">Calibrar por tipo:</span>
                <button
                  type="button"
                  onClick={applyChildCenterPreset}
                  className="px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  title="Centro Infantil (criança, encarregado, sem dados de saúde na inscrição pública)"
                >
                  <Baby className="w-3 h-3 text-emerald-400" />
                  Centro Infantil
                </button>
                <button
                  type="button"
                  onClick={applySchoolPreset}
                  className="px-2.5 py-1 rounded-lg border border-sky-500/40 bg-sky-950/40 text-sky-300 hover:bg-sky-900/50 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <School className="w-3 h-3 text-sky-400" />
                  Escola Geral
                </button>
                <button
                  type="button"
                  onClick={applyVocationalPreset}
                  className="px-2.5 py-1 rounded-lg border border-blue-500/40 bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <GraduationCap className="w-3 h-3 text-blue-400" />
                  Técnico / Superior
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'phone', label: 'Contacto Telefónico Principal', desc: 'Canal primário de aviso e SMS' },
                { key: 'email', label: 'Endereço de E-mail', desc: 'Envio de confirmação e convites' },
                { key: 'documentNumber', label: 'Número de Documento (BI / DIRE / Cédula)', desc: 'Identificação civil do candidato/criança' },
                { key: 'birthDate', label: 'Data de Nascimento', desc: 'Cálculo de idade e conformidade com a turma' },
                { key: 'gender', label: 'Gênero', desc: 'Estatísticas e registo demográfico' },
                { key: 'guardianName', label: 'Nome do Encarregado de Educação', desc: 'Mandatório em centros infantis e menores' },
                { key: 'guardianPhone', label: 'Telefone do Encarregado', desc: 'Contacto de emergência da família' },
                { key: 'guardianRelationship', label: 'Grau de Parentesco', desc: 'Pai, Mãe, Tutor Legal, Familiar' },
                { key: 'authorizedPickupPersons', label: 'Pessoas Autorizadas a Buscar a Criança', desc: 'Segurança portária (Centros Infantis)' },
                { key: 'address', label: 'Endereço Residencial', desc: 'Bairro e domicílio do candidato' },
                { key: 'province', label: 'Província', desc: 'Geolocalização institucional' },
                { key: 'city', label: 'Cidade / Município', desc: 'Localidade de residência' },
                { key: 'nuit', label: 'Declaração de NUIT', desc: 'Identificação tributária oficial' },
                { key: 'previousSchool', label: 'Escola ou Habilitações Anteriores', desc: 'Histórico de escolaridade' }
              ].map(field => {
                const currentVal: FieldRequirementStatus = fieldRequirements[field.key] ?? 'obrigatorio';
                const statusStr = currentVal === true ? 'obrigatorio' : currentVal === false ? 'oculto' : currentVal;

                return (
                  <div key={field.key} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{field.label}</p>
                      <p className="text-[11px] text-slate-400 truncate">{field.desc}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setFieldRequirements({ ...fieldRequirements, [field.key]: 'obrigatorio' })}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          statusStr === 'obrigatorio'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Obrigatório
                      </button>
                      <button
                        type="button"
                        onClick={() => setFieldRequirements({ ...fieldRequirements, [field.key]: 'opcional' })}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          statusStr === 'opcional'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Opcional
                      </button>
                      <button
                        type="button"
                        onClick={() => setFieldRequirements({ ...fieldRequirements, [field.key]: 'oculto' })}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          statusStr === 'oculto'
                            ? 'bg-slate-700 text-slate-300 shadow-xs'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Oculto
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. CURSOS, SALAS & PREÇOS */}
        {activeSection === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                3. Oferta Formativa: Salas, Cursos, Preços e Vagas
              </h3>
              <p className="text-xs text-slate-400">
                Apenas os cursos ou salas desta instituição aparecerão para os seus candidatos.
              </p>
            </div>

            {/* Lista Existente */}
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.courseId} className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{course.courseName}</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 text-[10px]">
                        {course.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        course.active !== false ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {course.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Taxa de Inscrição: <strong className="text-emerald-400">{course.price?.toLocaleString()} MT</strong> • Mensalidade: <strong className="text-white">{course.monthlyFee?.toLocaleString()} MT</strong> • Vagas: <strong className="text-sky-400">{course.vacancies}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCourses(courses.map(c => c.courseId === course.courseId ? { ...c, active: !c.active } : c))}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs cursor-pointer"
                    >
                      {course.active !== false ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(course.courseId)}
                      className="p-1.5 rounded-lg border border-rose-900/40 bg-rose-950/30 text-rose-400 hover:text-rose-200 cursor-pointer"
                      title="Remover Curso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Adicionar Curso / Sala */}
            <form onSubmit={handleAddCourse} className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/30 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Adicionar Nova Oferta (Sala ou Curso)</span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <input
                  type="text"
                  required
                  placeholder={institution.type === 'centro_infantil' ? 'Ex: Jardim 2 (4 Anos)' : 'Ex: Contabilidade & Gestão'}
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
                <input
                  type="number"
                  placeholder="Taxa Inscrição (MT)"
                  value={newCoursePrice}
                  onChange={(e) => setNewCoursePrice(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
                <input
                  type="number"
                  placeholder="Mensalidade (MT)"
                  value={newCourseMonthly}
                  onChange={(e) => setNewCourseMonthly(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. DOCUMENTOS EXIGIDOS */}
        {activeSection === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                4. Documentos Exigidos aos Candidatos
              </h3>
              <p className="text-xs text-slate-400">
                Lista de documentos que a Secretaria exige para conferência e validação da matrícula.
              </p>
            </div>

            <div className="space-y-2">
              {documents.map((docItem, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-200 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {docItem}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(docItem)}
                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddDocument} className="flex gap-2">
              <input
                type="text"
                value={newDocText}
                onChange={(e) => setNewDocText(e.target.value)}
                placeholder="Ex: Boletim de Vacinas Atualizado, Atestado Médico..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </form>
          </div>
        )}

        {/* 5. MÉTODOS DE PAGAMENTO */}
        {activeSection === 5 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                5. Métodos de Pagamento e Dados Bancários
              </h3>
              <p className="text-xs text-slate-400">
                Canais oficiais para liquidação da taxa de inscrição pelo candidato.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número Oficial M-Pesa
                </label>
                <input
                  type="text"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  placeholder="Ex: 84 900 1200 ou 853 181 189"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número Oficial E-Mola
                </label>
                <input
                  type="text"
                  value={emolaNumber}
                  onChange={(e) => setEmolaNumber(e.target.value)}
                  placeholder="Ex: 86 900 1200 ou 864 826 647"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dados Bancários (Banco, Conta, NIB e Instruções)
                </label>
                <textarea
                  rows={2}
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  placeholder="Ex: Millennium BIM: 109283741 | NIB: 000100000010928374102 | Titular: ..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. TERMOS & PRIVACIDADE */}
        {activeSection === 6 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                6. Termos & Condições e Política de Privacidade
              </h3>
              <p className="text-xs text-slate-400">
                Regulamento aceito formalmente pelo candidato no momento da submissão digital.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Termos e Condições da Instituição
                </label>
                <textarea
                  rows={4}
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Política de Privacidade & Protecção de Dados
                </label>
                <textarea
                  rows={4}
                  value={privacyText}
                  onChange={(e) => setPrivacyText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. CONTACTOS & AVISOS */}
        {activeSection === 7 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                7. Contactos de Atendimento & Avisos
              </h3>
              <p className="text-xs text-slate-400">
                Canais de suporte exibidos na tela de confirmação e consulta de candidatura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone de Atendimento</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Institucional</label>
                <input
                  type="text"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail da Secretaria</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mensagem Personalizada de Sucesso (Exibida pós-candidatura)
              </label>
              <textarea
                rows={3}
                value={confirmationTemplate}
                onChange={(e) => setConfirmationTemplate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* 8. LINK, QR CODE & DIVULGAÇÃO */}
        {activeSection === 8 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                8. Link Oficial, QR Code e Divulgação
              </h3>
              <p className="text-xs text-slate-400">
                Endereço único de acesso garantindo isolamento total de identidade institucional.
              </p>
            </div>

            {/* Slug Editor */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Identificador de URL Oficial (Slug da Instituição)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 select-none">#instituicoes/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(normalizeSlug(e.target.value))}
                  placeholder="ex: ceu-azul ou cftpm-moztechwave"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:border-indigo-500 focus:outline-hidden"
                />
                <span className="text-xs font-mono text-slate-500 select-none">/inscricoes</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Este slug identifica inequivocamente a sua instituição no SIGAR PRO.
              </p>
            </div>

            {/* Box Link & Ações */}
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
              <span className="text-xs font-bold text-indigo-300 block">Endereço Público Completo:</span>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 select-all break-all">
                {publicUrl}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copiado para Área de Transferência!' : 'Copiar Link Oficial'}
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsapp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  Divulgar no WhatsApp
                </button>

                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-sky-400" />
                  Abrir como Candidato
                </a>
              </div>
            </div>

            {/* QR Code Simulado com Dados Reais */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center gap-4">
              <div className="w-20 h-20 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                <QrCode className="w-16 h-16 text-slate-950" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  QR Code Oficial para Cartazes e Panfletos
                </p>
                <p className="text-[11px] text-slate-400">
                  Os candidatos podem escanear diretamente com a câmara do telemóvel para abrir a ficha de inscrição da {institution.name}.
                </p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Imprimir QR Code em Alta Resolução
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
