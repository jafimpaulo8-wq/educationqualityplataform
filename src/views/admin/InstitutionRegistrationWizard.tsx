import React, { useState } from 'react';
import { 
  Building2, 
  School, 
  Briefcase, 
  Baby, 
  GraduationCap, 
  Landmark, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InstitutionType, Institution, InstitutionFeatureModules, TeacherPortalPermissions, StudentPortalPermissions } from '../../types';
import { PROVINCES_MOZAMBIQUE } from '../../data/mockData';
import { Sliders, DoorOpen, DollarSign, Award, Megaphone, BarChart3, Shield } from 'lucide-react';

export const InstitutionRegistrationWizard: React.FC = () => {
  const { addInstitution, navigate } = useApp();

  const [selectedType, setSelectedType] = useState<InstitutionType | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Módulos e Permissões Customizadas por Instituição
  const [enabledModules, setEnabledModules] = useState<InstitutionFeatureModules>({
    secretaria: true,
    portal_aluno: true,
    portal_professor: true,
    portaria: true,
    financeiro: true,
    pedagogico: true,
    certificados: true,
    estagios: true,
    comunicados: true,
    relatorios_academicos: true,
    relatorios_administrativos: true,
    auditoria: true
  });

  const [teacherPermissions, setTeacherPermissions] = useState<TeacherPortalPermissions>({
    verNotas: true,
    lancarNotas: true,
    fazerChamada: true,
    verPautas: true,
    gerarRelatorios: false,
    verFinanceiro: false
  });

  const [studentPermissions, setStudentPermissions] = useState<StudentPortalPermissions>({
    verPerfil: true,
    verNotas: true,
    verHorario: true,
    verFinanceiro: true,
    solicitarDocumentos: true,
    verAulasOnline: true,
    verEstagio: true,
    carteirinhaDigital: true
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nuit: '',
    licenseNumber: '',
    representativeName: '',
    representativeRole: 'Diretor Geral',
    phone: '',
    email: '',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: '',
    plan: 'Enterprise Multi-Campus' as 'Starter' | 'Profissional' | 'Enterprise Multi-Campus',
    connectedSystem: 'SIGAR' as 'SIGAR' | 'SoftGenial' | 'Outro' | 'Nenhum',
    sivecEnabled: true,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 4,
    adminUsername: '',
    adminPassword: ''
  });

  const institutionTypes: { id: InstitutionType; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'centro_formacao',
      title: 'Centro de Formação Profissional',
      desc: 'Institutos técnicos, centros de tecnologia, polos de formação vocacional e escolas práticas.',
      icon: <School className="w-7 h-7 text-sky-400" />,
      color: 'border-sky-500/40 hover:border-sky-500 bg-sky-500/5'
    },
    {
      id: 'empresa',
      title: 'Empresa / Parceiro Corporativo',
      desc: 'Empresas parceiras para alocação de estágios curriculares, formação in-company e recrutamento.',
      icon: <Briefcase className="w-7 h-7 text-emerald-400" />,
      color: 'border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5'
    },
    {
      id: 'centro_infantil',
      title: 'Centro Infantil / Pré-Escolar',
      desc: 'Creches, infantários, centros pré-escolares e colégios de infância.',
      icon: <Baby className="w-7 h-7 text-pink-400" />,
      color: 'border-pink-500/40 hover:border-pink-500 bg-pink-500/5'
    },
    {
      id: 'instituicao_ensino',
      title: 'Instituição de Ensino Superior / Médio',
      desc: 'Universidades, faculdades, institutos superiores politécnicos e escolas secundárias.',
      icon: <GraduationCap className="w-7 h-7 text-indigo-400" />,
      color: 'border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/5'
    },
    {
      id: 'outra',
      title: 'Outra Instituição / ONG / Governo',
      desc: 'Ministérios, secretarias distritais, associações de desenvolvimento e organizações sociais.',
      icon: <Landmark className="w-7 h-7 text-amber-400" />,
      color: 'border-amber-500/40 hover:border-amber-500 bg-amber-500/5'
    }
  ];

  const handleSelectType = (type: InstitutionType) => {
    setSelectedType(type);
    setCurrentStep(1);
  };

  const handleFinishRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !formData.name || !formData.nuit) return;

    const newInst = addInstitution({
      name: formData.name,
      type: selectedType,
      nuit: formData.nuit,
      licenseNumber: formData.licenseNumber || 'ALV-MEC-2026/01',
      representativeName: formData.representativeName || 'Diretor Responsável',
      representativeRole: formData.representativeRole,
      phone: formData.phone || '+258 84 000 0000',
      email: formData.email || 'contato@instituicao.co.mz',
      province: formData.province,
      city: formData.city,
      address: formData.address || 'Av. Principal',
      plan: formData.plan,
      status: 'Ativa',
      connectedSystem: formData.connectedSystem,
      sivecEnabled: formData.sivecEnabled,
      totalStudents: formData.totalStudents || 25,
      totalTeachers: formData.totalTeachers || 5,
      totalCourses: formData.totalCourses || 3,
      enabledModules,
      teacherPermissions,
      studentPermissions
    });

    // Automatically navigate to the new center's workspace dashboard!
    navigate('centro_dashboard', { centerId: newInst.code });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedType) {
                setSelectedType(null);
              } else {
                navigate('admin_dashboard');
              }
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Cadastrar Nova Instituição no Moztechwave Core
            </h1>
            <p className="text-xs text-slate-400">
              Provisionamento de instâncias SIGAR &amp; SIVERC para centros e organizações moçambicanas.
            </p>
          </div>
        </div>

        {selectedType && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 border border-sky-500/30 text-sky-400 uppercase">
            {selectedType.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Step 0: Pick the Institution Category */}
      {!selectedType ? (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Escolha o Tipo de Instituição que deseja Provisionar:
            </h2>
            <p className="text-xs text-slate-400">
              Cada tipo de instituição recebe uma estrutura pré-configurada de cursos, módulos, permissões e modelos documentais do SIVERC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {institutionTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => handleSelectType(type.id)}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:scale-[1.01] ${type.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
                    {type.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">{type.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{type.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-semibold text-sky-400">
                  <span>Selecionar &amp; Iniciar Cadastro</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Step 1-3: Comprehensive Registration Form */
        <form onSubmit={handleFinishRegistration} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
          {/* Progress Indicators */}
          <div className="grid grid-cols-4 gap-2 border-b border-slate-800 pb-6">
            <div className={`p-3 rounded-xl text-center text-xs font-bold transition-all ${
              currentStep === 1 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-slate-950 text-slate-400'
            }`}>
              1. Dados &amp; Responsável
            </div>
            <div className={`p-3 rounded-xl text-center text-xs font-bold transition-all ${
              currentStep === 2 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-slate-950 text-slate-400'
            }`}>
              2. Localização &amp; Sistema
            </div>
            <div className={`p-3 rounded-xl text-center text-xs font-bold transition-all ${
              currentStep === 3 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-slate-950 text-slate-400'
            }`}>
              3. Módulos &amp; Painéis
            </div>
            <div className={`p-3 rounded-xl text-center text-xs font-bold transition-all ${
              currentStep === 4 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-slate-950 text-slate-400'
            }`}>
              4. Plano &amp; Ativação
            </div>
          </div>

          {/* Step 1 Fields */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <School className="w-4 h-4" />
                Informações Institucionais &amp; Identificação
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Nome Oficial da Instituição / Centro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Instituto Médio de Tecnologias Avançadas da Beira"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    NUIT (Número Único de Identificação Tributária) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 400192841"
                    value={formData.nuit}
                    onChange={(e) => setFormData({ ...formData, nuit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Alvará / Registro no MEC ou Ministério
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: ALV-MEC-2026/894"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Nome do Diretor Geral / Representante Legal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dr. Salvador Mahumane"
                    value={formData.representativeName}
                    onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    value={formData.representativeRole}
                    onChange={(e) => setFormData({ ...formData, representativeRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer"
                >
                  Continuar para Endereço &amp; Sistema →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 Fields */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localização Geográfica &amp; Sistema Existente
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Província *</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-hidden"
                  >
                    {PROVINCES_MOZAMBIQUE.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cidade / Município *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Beira, Maputo, Nampula..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Samora Machel nº 102, 2º Andar"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Telefone Institucional</label>
                  <input
                    type="text"
                    placeholder="+258 84 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">E-mail Institucional</label>
                  <input
                    type="email"
                    placeholder="secretaria@instituto.co.mz"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-hidden"
                  />
                </div>

                {/* SIVEC Connect Selection */}
                <div className="space-y-1.5 sm:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <label className="text-xs font-bold text-white block mb-1">
                    Qual sistema de gestão o centro utiliza atualmente? (SIVEC Connect)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {(['SIGAR', 'SoftGenial', 'Outro', 'Nenhum'] as const).map((sys) => (
                      <label
                        key={sys}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer font-semibold ${
                          formData.connectedSystem === sys
                            ? 'border-sky-500 bg-sky-500/10 text-white'
                            : 'border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="connectedSystem"
                          value={sys}
                          checked={formData.connectedSystem === sys}
                          onChange={() => setFormData({ ...formData, connectedSystem: sys })}
                          className="accent-sky-500"
                        />
                        <span>{sys}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer"
                >
                  Continuar para Módulos &amp; Painéis →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Módulos & Permissões dos Portais (Item 53 / Customização de Painel) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Módulos Habilitados &amp; Permissões dos Painéis
                </h3>
                <p className="text-xs text-slate-400">
                  Configure exatamente quais ferramentas esta instituição terá disponível (Secretaria, Portaria, Portais) e defina as permissões individuais dos painéis do professor e formando.
                </p>
              </div>

              {/* Institution Core Modules Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  1. Ferramentas Globais da Instituição
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: 'secretaria', label: 'Secretaria Académica', desc: 'Matrículas, turmas e inscrições' },
                    { key: 'portal_aluno', label: 'Portal do Aluno', desc: 'Acesso do formando por código único' },
                    { key: 'portal_professor', label: 'Portal do Professor', desc: 'Painel docente exclusivo' },
                    { key: 'portaria', label: 'Portaria & Portões', desc: 'Registo e controlo de entradas' },
                    { key: 'financeiro', label: 'Módulo Financeiro', desc: 'Caixa escolar, faturas e propinas' },
                    { key: 'pedagogico', label: 'Gestão Pedagógica', desc: 'Matriz curricular e fórmulas' },
                    { key: 'certificados', label: 'Certificados & Diplomas', desc: 'Emissão com selo SIVERC' },
                    { key: 'estagios', label: 'Estágios Curriculares', desc: 'Alocações e empresas parceiras' },
                    { key: 'comunicados', label: 'Comunicados Oficiais', desc: 'Mural de avisos institucionais' },
                    { key: 'relatorios_academicos', label: 'Relatórios Académicos', desc: 'Pautas, pautas e notas' },
                    { key: 'relatorios_administrativos', label: 'Relatórios Administrativos', desc: 'Exportações PDF, CSV e Excel' },
                    { key: 'auditoria', label: 'Auditoria & Governança', desc: 'Trilha de auditoria e ações críticas' }
                  ].map(mod => {
                    const isChecked = enabledModules[mod.key as keyof InstitutionFeatureModules];
                    return (
                      <div
                        key={mod.key}
                        onClick={() => setEnabledModules(prev => ({ ...prev, [mod.key]: !prev[mod.key as keyof InstitutionFeatureModules] }))}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                          isChecked 
                            ? 'bg-amber-500/10 border-amber-500/30 text-white' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{mod.label}</div>
                          <div className="text-[10px] text-slate-400">{mod.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Granular Teacher Portal Permissions */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  2. O Que o Professor Verá &amp; Terá Acesso no Seu Painel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {[
                    { key: 'verNotas', label: 'Ver Notas dos Alunos' },
                    { key: 'lancarNotas', label: 'Lançar Notas & Avaliações' },
                    { key: 'fazerChamada', label: 'Fazer Chamada & Frequências' },
                    { key: 'verPautas', label: 'Ver Pautas Oficiais' },
                    { key: 'gerarRelatorios', label: 'Gerar Relatórios de Turma' },
                    { key: 'verFinanceiro', label: 'Ver Situação de Propinas' }
                  ].map(perm => {
                    const isChecked = teacherPermissions[perm.key as keyof TeacherPortalPermissions];
                    return (
                      <div
                        key={perm.key}
                        onClick={() => setTeacherPermissions(prev => ({ ...prev, [perm.key]: !prev[perm.key as keyof TeacherPortalPermissions] }))}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isChecked ? 'bg-sky-500/10 border-sky-500/30 text-white font-medium' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span>{perm.label}</span>
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Granular Student Portal Permissions */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  3. O Que o Aluno Verá &amp; Terá Acesso no Seu Painel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { key: 'verPerfil', label: 'Ver Perfil & Matrícula' },
                    { key: 'verNotas', label: 'Ver Notas & Boletim' },
                    { key: 'verHorario', label: 'Ver Horário Escolar' },
                    { key: 'verFinanceiro', label: 'Ver Propinas & Recibos' },
                    { key: 'solicitarDocumentos', label: 'Solicitar Documentos' },
                    { key: 'verAulasOnline', label: 'Aulas & Materiais' },
                    { key: 'verEstagio', label: 'Ver Estágio Curricular' },
                    { key: 'carteirinhaDigital', label: 'Carteirinha com Código' }
                  ].map(perm => {
                    const isChecked = studentPermissions[perm.key as keyof StudentPortalPermissions];
                    return (
                      <div
                        key={perm.key}
                        onClick={() => setStudentPermissions(prev => ({ ...prev, [perm.key]: !prev[perm.key as keyof StudentPortalPermissions] }))}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isChecked ? 'bg-emerald-500/10 border-emerald-500/30 text-white font-medium' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span>{perm.label}</span>
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer"
                >
                  Continuar para Plano &amp; Finalizar →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Plano & Ativação */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Plano de Subscrição &amp; Provisionamento Imediato
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Starter' as const,
                    price: '15.000 MT/mês',
                    desc: 'Até 100 alunos, emissão de certificados SIVERC com QR Code e portaria digital.'
                  },
                  {
                    name: 'Profissional' as const,
                    price: '35.000 MT/mês',
                    desc: 'Até 500 alunos, módulos de avaliação, contratos automáticos, WhatsApp e M-Pesa STK Push.'
                  },
                  {
                    name: 'Enterprise Multi-Campus' as const,
                    price: '65.000 MT/mês',
                    desc: 'Alunos ilimitados, filiais e delegações, API RESTful dedicada e suporte prioritário 24/7.'
                  }
                ].map((plan) => (
                  <div
                    key={plan.name}
                    onClick={() => setFormData({ ...formData, plan: plan.name })}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.plan === plan.name
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-950 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{plan.name}</span>
                      {formData.plan === plan.name && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-lg font-black text-emerald-400">{plan.price}</div>
                    <p className="text-[11px] text-slate-300 mt-2">{plan.desc}</p>
                  </div>
                ))}
              </div>

              {/* Summary of What Happens Next */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-sky-400 uppercase tracking-wider block">
                  Automações ao Salvar no Moztechwave Core:
                </span>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Geração de Código Único (ex: <strong className="text-white font-mono">MTW-CF-0004</strong>)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Ativação dos Módulos e Portais selecionados no Passo 3
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Criação de chave de API e ambiente seguro no SIVERC
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Redirecionamento automático para o Painel da Instituição
                  </li>
                </ul>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  ✓ Concluir Cadastro &amp; Abrir Painel do Centro
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
