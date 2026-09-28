import React, { useState, useEffect } from 'react';
import { 
  Course, 
  CourseCategory, 
  CourseModality, 
  CoursePeriodType, 
  CourseStatus 
} from '../../types';
import { 
  X, 
  GraduationCap, 
  Clock, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Trash2,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  onSave: (courseData: Omit<Course, 'id' | 'institutionId'>) => void;
}

const CATEGORY_OPTIONS: { label: string; value: CourseCategory; defaultPeriod: CoursePeriodType }[] = [
  { label: 'Cursos Profissionais', value: 'Profissional', defaultPeriod: 'semestral' },
  { label: 'Cursos Técnicos', value: 'Técnico', defaultPeriod: 'semestral' },
  { label: 'Cursos de Máquinas Pesadas', value: 'Máquinas Pesadas', defaultPeriod: 'por_etapa' },
  { label: 'Línguas / Inglês', value: 'Línguas / Inglês', defaultPeriod: 'trimestral' },
  { label: 'Eletricidade Industrial', value: 'Eletricidade', defaultPeriod: 'semestral' },
  { label: 'Mecânica Automotiva & Diesel', value: 'Mecânica', defaultPeriod: 'semestral' },
  { label: 'Logística Portuária & Terrestre', value: 'Logística', defaultPeriod: 'por_modulo' },
  { label: 'Operações Portuárias & Estiva', value: 'Operações Portuárias', defaultPeriod: 'por_modulo' },
  { label: 'Técnicas Aduaneiras & JÚE', value: 'Técnicas Aduaneiras', defaultPeriod: 'semestral' },
  { label: 'Cursos de Informática & Redes', value: 'Informática', defaultPeriod: 'trimestral' },
  { label: 'Cursos de Curta Duração', value: 'Curta Duração', defaultPeriod: 'intensivo' },
  { label: 'Gestão & Negócios', value: 'Gestão', defaultPeriod: 'semestral' },
  { label: 'Saúde & Enfermagem', value: 'Saúde', defaultPeriod: 'semestral' },
];

const TEMPLATES = [
  {
    name: 'Operador de Máquinas Pesadas',
    category: 'Máquinas Pesadas' as CourseCategory,
    code: 'MAQ-OP',
    duration: '3 Meses',
    workloadHours: 240,
    theoryHours: 60,
    practiceHours: 180,
    modality: 'Prático em Oficina/Campo' as CourseModality,
    periodType: 'por_etapa' as CoursePeriodType,
    price: 28000,
    registrationFee: 2000,
    monthlyFee: 0,
    certificate: 'Certificado de Aptidão Técnico-Operacional & Carteira de Operador',
    requirements: [
      'Carta de Condução Categoria C ou B com 2 anos',
      'Idade mínima de 21 anos',
      'Atestado de aptidão física e visual'
    ]
  },
  {
    name: 'Inglês Técnico para Petróleo & Gás',
    category: 'Línguas / Inglês' as CourseCategory,
    code: 'ING-OG',
    duration: '6 Meses',
    workloadHours: 180,
    theoryHours: 60,
    practiceHours: 120,
    modality: 'Semi-presencial' as CourseModality,
    periodType: 'trimestral' as CoursePeriodType,
    price: 18000,
    registrationFee: 1000,
    monthlyFee: 3000,
    certificate: 'Certificado de Fluência em Inglês Técnico Ocupacional (CEFR B2)',
    requirements: [
      'Conhecimento prévio de inglês elementar A2',
      '10ª Classe Concluída'
    ]
  },
  {
    name: 'Técnicas Aduaneiras & Despacho JÚE',
    category: 'Técnicas Aduaneiras' as CourseCategory,
    code: 'ADU-TEC',
    duration: '8 Meses',
    workloadHours: 400,
    theoryHours: 180,
    practiceHours: 220,
    modality: 'Híbrido' as CourseModality,
    periodType: 'semestral' as CoursePeriodType,
    price: 36800,
    registrationFee: 1400,
    monthlyFee: 4600,
    certificate: 'Certificado de Técnico Despachante Aduaneiro Acreditado',
    requirements: [
      '12ª Classe Concluída',
      'Boa redação e raciocínio analítico'
    ]
  },
  {
    name: 'Eletricidade Industrial & Comandos',
    category: 'Eletricidade' as CourseCategory,
    code: 'ELE-IND',
    duration: '8 Meses',
    workloadHours: 480,
    theoryHours: 160,
    practiceHours: 320,
    modality: 'Presencial' as CourseModality,
    periodType: 'semestral' as CoursePeriodType,
    price: 32000,
    registrationFee: 1500,
    monthlyFee: 4000,
    certificate: 'Certificado de Eletricista Instalador Industrial (IFPELAC)',
    requirements: [
      '10ª Classe Concluída',
      'Aptidão para ferramentas manuais e elétricas'
    ]
  },
  {
    name: 'Informática de Curta Duração',
    category: 'Curta Duração' as CourseCategory,
    code: 'INF-CURTA',
    duration: '4 Semanas',
    workloadHours: 60,
    theoryHours: 15,
    practiceHours: 45,
    modality: 'Presencial' as CourseModality,
    periodType: 'intensivo' as CoursePeriodType,
    price: 3500,
    registrationFee: 500,
    monthlyFee: 0,
    certificate: 'Certificado de Aptidão em Informática e Ferramentas de Escritório',
    requirements: [
      'Qualquer pessoa interessada em informática prática',
      'Sem exigência de escolaridade prévia'
    ]
  }
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  onSave
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<CourseCategory>('Profissional');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('6 Meses');
  const [workloadHours, setWorkloadHours] = useState<number>(360);
  const [theoryHours, setTheoryHours] = useState<number>(120);
  const [practiceHours, setPracticeHours] = useState<number>(240);
  const [modality, setModality] = useState<CourseModality>('Presencial');
  const [periodType, setPeriodType] = useState<CoursePeriodType>('semestral');
  const [requirements, setRequirements] = useState<string[]>(['10ª Classe Concluída']);
  const [newRequirement, setNewRequirement] = useState('');
  const [price, setPrice] = useState<number>(24000);
  const [registrationFee, setRegistrationFee] = useState<number>(1500);
  const [monthlyFee, setMonthlyFee] = useState<number>(3750);
  const [certificate, setCertificate] = useState('Certificado de Capacitação Técnico-Profissional');
  const [status, setStatus] = useState<CourseStatus>('Ativo');
  const [activeTab, setActiveTab] = useState<'geral' | 'financeiro' | 'requisitos' | 'certificado'>('geral');

  useEffect(() => {
    if (courseToEdit) {
      setName(courseToEdit.name);
      setCode(courseToEdit.code || '');
      setCategory(courseToEdit.category || 'Profissional');
      setDescription(courseToEdit.description || '');
      setDuration(courseToEdit.duration || '6 Meses');
      setWorkloadHours(courseToEdit.workloadHours || 360);
      setTheoryHours(courseToEdit.theoryHours || 120);
      setPracticeHours(courseToEdit.practiceHours || 240);
      setModality(courseToEdit.modality || 'Presencial');
      setPeriodType(courseToEdit.periodType || 'semestral');
      setRequirements(courseToEdit.requirements && courseToEdit.requirements.length > 0 
        ? courseToEdit.requirements 
        : ['10ª Classe Concluída']);
      setPrice(courseToEdit.price || (courseToEdit.monthlyFee || courseToEdit.feeMonthly || 0) * 6);
      setRegistrationFee(courseToEdit.registrationFee || 1500);
      setMonthlyFee(courseToEdit.monthlyFee ?? courseToEdit.feeMonthly ?? 0);
      setCertificate(courseToEdit.certificate || 'Certificado de Formação Profissional');
      setStatus(courseToEdit.status || 'Ativo');
    } else {
      setName('');
      setCode('');
      setCategory('Profissional');
      setDescription('');
      setDuration('6 Meses');
      setWorkloadHours(360);
      setTheoryHours(120);
      setPracticeHours(240);
      setModality('Presencial');
      setPeriodType('semestral');
      setRequirements(['10ª Classe Concluída']);
      setPrice(24000);
      setRegistrationFee(1500);
      setMonthlyFee(3750);
      setCertificate('Certificado de Capacitação Técnico-Profissional');
      setStatus('Ativo');
    }
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setName(tmpl.name);
    setCategory(tmpl.category);
    setCode(`${tmpl.code}-${Date.now().toString().slice(-3)}`);
    setDuration(tmpl.duration);
    setWorkloadHours(tmpl.workloadHours);
    setTheoryHours(tmpl.theoryHours);
    setPracticeHours(tmpl.practiceHours);
    setModality(tmpl.modality);
    setPeriodType(tmpl.periodType);
    setPrice(tmpl.price);
    setRegistrationFee(tmpl.registrationFee);
    setMonthlyFee(tmpl.monthlyFee);
    setCertificate(tmpl.certificate);
    setRequirements([...tmpl.requirements]);
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements(prev => [...prev, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      code: code.trim() || `CUR-${Date.now().toString().slice(-4)}`,
      category,
      description: description.trim(),
      duration: duration.trim() || '6 Meses',
      workloadHours: Number(workloadHours) || (Number(theoryHours) + Number(practiceHours)),
      theoryHours: Number(theoryHours) || 0,
      practiceHours: Number(practiceHours) || 0,
      modality,
      periodType,
      requirements,
      price: Number(price) || 0,
      registrationFee: Number(registrationFee) || 0,
      monthlyFee: Number(monthlyFee) || 0,
      feeMonthly: Number(monthlyFee) || 0,
      certificate: certificate.trim(),
      status,
      modules: courseToEdit?.modules || []
    });
    onClose();
  };

  return (
    <div id="modal-course-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div id="modal-course-container" className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {courseToEdit ? 'Editar Curso' : 'Cadastrar Novo Curso'}
              </h3>
              <p className="text-xs text-slate-500">
                Gestão completa de cursos, módulos, regime acadêmico e financeiro
              </p>
            </div>
          </div>
          <button
            id="btn-close-course-modal"
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Templates bar (only if creating new) */}
        {!courseToEdit && (
          <div className="border-b border-slate-200/80 bg-blue-50/60 px-6 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
              <span className="flex items-center gap-1 font-semibold text-blue-900 shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Modelos Rápidos:
              </span>
              {TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-800 hover:bg-blue-600 hover:text-white transition shrink-0 shadow-2xs"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'geral'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            1. Dados Gerais & Categoria
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('financeiro')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'financeiro'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            2. Estrutura & Valores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requisitos')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'requisitos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            3. Requisitos de Ingresso
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificado')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'certificado'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            4. Certificação & Estado
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          
          {activeTab === 'geral' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              {/* Nome & Código */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Oficial do Curso *
                  </label>
                  <input
                    id="input-course-name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Operador de Retroescavadeira, Inglês Técnico, Mecânica Diesel"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Código Identificador *
                  </label>
                  <input
                    id="input-course-code"
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Ex: MAQ-OP-01, ELE-101"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono font-bold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Categoria & Modalidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria do Curso *
                  </label>
                  <select
                    id="select-course-category"
                    value={category}
                    onChange={e => {
                      const cat = e.target.value as CourseCategory;
                      setCategory(cat);
                      const match = CATEGORY_OPTIONS.find(c => c.value === cat);
                      if (match) setPeriodType(match.defaultPeriod);
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Modalidade de Ensino *
                  </label>
                  <select
                    id="select-course-modality"
                    value={modality}
                    onChange={e => setModality(e.target.value as CourseModality)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition"
                  >
                    <option value="Presencial">Presencial (Sala / Laboratório)</option>
                    <option value="Prático em Oficina/Campo">Prático em Oficina / Campo de Treinamento</option>
                    <option value="Semi-presencial">Semi-presencial (Híbrido)</option>
                    <option value="Online EAD">Online EAD 100% Digital</option>
                    <option value="Híbrido">Híbrido Flexível</option>
                  </select>
                </div>
              </div>

              {/* Duração & Descrição */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Duração Estimada
                  </label>
                  <input
                    id="input-course-duration"
                    type="text"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="Ex: 3 Meses, 8 Meses, 4 Semanas"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 outline-hidden transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Descrição & Perfil do Egresso
                  </label>
                  <textarea
                    id="input-course-description"
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Resumo do curso, competências técnicas desenvolvidas e áreas de atuação profissional..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 outline-hidden transition resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              {/* Estrutura Periódica */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Configuração da Estrutura Curricular (Requisito 11)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  O sistema suporta modelos flexíveis de organização acadêmica de acordo com a natureza do curso:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'semestral', label: 'Semestral', desc: '1º e 2º Semestre' },
                    { id: 'trimestral', label: 'Trimestral', desc: 'Trimestres letivos' },
                    { id: 'anual', label: 'Anual', desc: 'Ano letivo completo' },
                    { id: 'por_modulo', label: 'Por Módulo', desc: 'Módulos independentes' },
                    { id: 'por_etapa', label: 'Por Etapa', desc: 'Teoria, simulador e campo' },
                    { id: 'intensivo', label: 'Intensivo', desc: 'Curta duração / semanas' }
                  ].map(p => (
                    <label
                      key={p.id}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition ${
                        periodType === p.id
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{p.label}</span>
                        <input
                          type="radio"
                          name="periodType"
                          value={p.id}
                          checked={periodType === p.id}
                          onChange={() => setPeriodType(p.id as CoursePeriodType)}
                          className="h-3.5 w-3.5 text-blue-600"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500">{p.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cargas Horárias */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Carga Horária Total & Distribuição
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Carga Horária Total (h)</label>
                    <input
                      id="input-course-workload"
                      type="number"
                      min="1"
                      value={workloadHours}
                      onChange={e => setWorkloadHours(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Horas Teóricas</label>
                    <input
                      id="input-course-theory"
                      type="number"
                      min="0"
                      value={theoryHours}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setTheoryHours(val);
                        setWorkloadHours(val + practiceHours);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Horas Práticas / Oficina</label>
                    <input
                      id="input-course-practice"
                      type="number"
                      min="0"
                      value={practiceHours}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setPracticeHours(val);
                        setWorkloadHours(theoryHours + val);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Preços & Valores em Meticais */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Estrutura Financeira (Moeda: Meticais MTn)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 font-semibold mb-1">
                      Preço Total do Curso (MTn)
                    </label>
                    <input
                      id="input-course-price"
                      type="number"
                      min="0"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      placeholder="Valor integral do curso"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-emerald-700 focus:border-emerald-500 outline-hidden"
                    />
                    <span className="text-[11px] text-slate-400">Total à vista ou pacote fechado</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 font-semibold mb-1">
                      Taxa de Matrícula (MTn)
                    </label>
                    <input
                      id="input-course-registration-fee"
                      type="number"
                      min="0"
                      value={registrationFee}
                      onChange={e => setRegistrationFee(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 outline-hidden"
                    />
                    <span className="text-[11px] text-slate-400">Paga no ato da inscrição</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 font-semibold mb-1">
                      Mensalidade / Propina (MTn)
                    </label>
                    <input
                      id="input-course-monthly-fee"
                      type="number"
                      min="0"
                      value={monthlyFee}
                      onChange={e => setMonthlyFee(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-800 focus:border-blue-500 outline-hidden"
                    />
                    <span className="text-[11px] text-slate-400">Informe 0 para cursos de valor único</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requisitos' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Requisitos de Ingresso & Pré-requisitos
                </span>
                <p className="text-xs text-slate-500 mb-3">
                  Especifique a escolaridade mínima, habilitações prévias (ex: Carta de Condução C, noções de elétrica) ou idade mínima:
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    id="input-new-requirement"
                    type="text"
                    value={newRequirement}
                    onChange={e => setNewRequirement(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                    placeholder="Adicionar requisito (ex: Carta C, Idade > 21 anos, 10ª Classe)..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 outline-hidden"
                  />
                  <button
                    id="btn-add-requirement"
                    type="button"
                    onClick={handleAddRequirement}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shrink-0"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="space-y-2">
                  {requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200 text-sm text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{req}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {requirements.length === 0 && (
                    <p className="text-center py-4 text-xs text-slate-400">
                      Nenhum requisito cadastrado. O curso não terá restrições de ingresso.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'certificado' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              {/* Certificado Emitido */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Certificação Emitida / Título Ocupacional
                </label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-3 h-4 w-4 text-blue-600" />
                  <input
                    id="input-course-certificate"
                    type="text"
                    value={certificate}
                    onChange={e => setCertificate(e.target.value)}
                    placeholder="Ex: Certificado de Habilitações Ocupacionais DINET, Carteira de Operador, Diploma Técnico"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 outline-hidden transition"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Aparecerá nos certificados oficiais gerados com QR Code e selo digital.
                </span>
              </div>

              {/* Estado do Curso */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Estado do Curso no Catálogo
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { val: 'Ativo', label: 'Ativo', desc: 'Em funcionamento normal' },
                    { val: 'Inscrições Abertas', label: 'Inscrições Abertas', desc: 'Disponível no portal público' },
                    { val: 'Em Planejamento', label: 'Em Planejamento', desc: 'Em montagem pedagógica' },
                    { val: 'Suspenso', label: 'Suspenso', desc: 'Temporariamente fechado' }
                  ].map(st => (
                    <label
                      key={st.val}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        status === st.val
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{st.label}</span>
                        <input
                          type="radio"
                          name="courseStatus"
                          value={st.val}
                          checked={status === st.val}
                          onChange={() => setStatus(st.val as CourseStatus)}
                          className="h-3.5 w-3.5 text-blue-600"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500">{st.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-400">
              Todos os cursos seguem isolamento institucional multi-tenant.
            </div>
            <div className="flex items-center gap-3">
              <button
                id="btn-cancel-course"
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                id="btn-save-course"
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                {courseToEdit ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
