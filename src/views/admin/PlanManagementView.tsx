import React, { useState } from 'react';
import { 
  Layers, 
  Building2, 
  ShieldCheck, 
  Users, 
  HardDrive, 
  Award, 
  Share2, 
  Video, 
  Sparkles, 
  MapPin, 
  Edit3, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  RefreshCw, 
  Plus, 
  Search, 
  ArrowRight, 
  DollarSign, 
  Zap, 
  Calendar, 
  FileText,
  HelpCircle,
  TrendingUp,
  Infinity as InfinityIcon,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  PlanName, 
  PlanId, 
  PlanDefinition, 
  PlanLimits, 
  Institution, 
  DEFAULT_PLANS 
} from '../../types';

export const PlanManagementView: React.FC = () => {
  const { 
    allInstitutions, 
    systemPlans, 
    updatePlanDefinition, 
    updateInstitutionPlan, 
    getEffectivePlanLimits,
    checkResourceUsage,
    navigate 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'planos' | 'instituicoes' | 'consumo_global'>('planos');
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<PlanDefinition | null>(null);
  const [selectedInstForPlanEdit, setSelectedInstForPlanEdit] = useState<Institution | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('todos');

  // Plan Edit Form State
  const [editPlanPrice, setEditPlanPrice] = useState<number>(0);
  const [editPlanMaxStudents, setEditPlanMaxStudents] = useState<number>(0);
  const [editPlanMaxUsers, setEditPlanMaxUsers] = useState<number>(0);
  const [editPlanMaxBranches, setEditPlanMaxBranches] = useState<number>(0);
  const [editPlanStorageGB, setEditPlanStorageGB] = useState<number>(0);
  const [editPlanCertificates, setEditPlanCertificates] = useState<number>(0);
  const [editPlanWhatsappLimit, setEditPlanWhatsappLimit] = useState<number>(0);
  const [editPlanSivecVerifications, setEditPlanSivecVerifications] = useState<number>(0);
  const [editPlanOnlineClassesHours, setEditPlanOnlineClassesHours] = useState<number>(0);
  const [editPlanAiPrompts, setEditPlanAiPrompts] = useState<number>(0);
  const [editPlanWhatsappEnabled, setEditPlanWhatsappEnabled] = useState<boolean>(false);
  const [editPlanSivecEnabled, setEditPlanSivecEnabled] = useState<boolean>(false);
  const [editPlanOnlineClassesEnabled, setEditPlanOnlineClassesEnabled] = useState<boolean>(false);
  const [editPlanAiEnabled, setEditPlanAiEnabled] = useState<boolean>(false);

  // Institution Assignment / Override Form State
  const [assignPlanName, setAssignPlanName] = useState<PlanName>('BÁSICO');
  const [customOverrideActive, setCustomOverrideActive] = useState<boolean>(false);
  const [customOverrideStudents, setCustomOverrideStudents] = useState<number>(0);
  const [customOverrideUsers, setCustomOverrideUsers] = useState<number>(0);
  const [customOverrideBranches, setCustomOverrideBranches] = useState<number>(0);
  const [customOverrideStorage, setCustomOverrideStorage] = useState<number>(0);
  const [customOverrideCertificates, setCustomOverrideCertificates] = useState<number>(0);
  const [customOverrideWhatsapp, setCustomOverrideWhatsapp] = useState<number>(0);
  const [customOverrideSivec, setCustomOverrideSivec] = useState<number>(0);
  const [customOverrideOnlineClasses, setCustomOverrideOnlineClasses] = useState<number>(0);
  const [customOverrideAi, setCustomOverrideAi] = useState<number>(0);
  const [overrideNotes, setOverrideNotes] = useState<string>('');

  const openEditPlanModal = (plan: PlanDefinition) => {
    setSelectedPlanForEdit(plan);
    setEditPlanPrice(plan.priceMZN);
    setEditPlanMaxStudents(plan.limits.maxStudents);
    setEditPlanMaxUsers(plan.limits.maxUsers);
    setEditPlanMaxBranches(plan.limits.maxBranches);
    setEditPlanStorageGB(plan.limits.storageGB);
    setEditPlanCertificates(plan.limits.monthlyCertificates);
    setEditPlanWhatsappLimit(plan.limits.whatsappMonthlyLimit);
    setEditPlanSivecVerifications(plan.limits.sivecMonthlyVerifications);
    setEditPlanOnlineClassesHours(plan.limits.onlineClassesMaxHours);
    setEditPlanAiPrompts(plan.limits.aiMonthlyPrompts);
    setEditPlanWhatsappEnabled(plan.limits.whatsappEnabled);
    setEditPlanSivecEnabled(plan.limits.sivecEnabled);
    setEditPlanOnlineClassesEnabled(plan.limits.onlineClassesEnabled);
    setEditPlanAiEnabled(plan.limits.aiEnabled);
  };

  const handleSavePlanDefinition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForEdit) return;

    updatePlanDefinition(selectedPlanForEdit.id, {
      priceMZN: editPlanPrice,
      limits: {
        maxStudents: editPlanMaxStudents,
        maxUsers: editPlanMaxUsers,
        maxBranches: editPlanMaxBranches,
        storageGB: editPlanStorageGB,
        monthlyCertificates: editPlanCertificates,
        whatsappMonthlyLimit: editPlanWhatsappLimit,
        sivecMonthlyVerifications: editPlanSivecVerifications,
        onlineClassesMaxHours: editPlanOnlineClassesHours,
        aiMonthlyPrompts: editPlanAiPrompts,
        whatsappEnabled: editPlanWhatsappEnabled,
        sivecEnabled: editPlanSivecEnabled,
        onlineClassesEnabled: editPlanOnlineClassesEnabled,
        aiEnabled: editPlanAiEnabled
      }
    });

    setSelectedPlanForEdit(null);
  };

  const openInstPlanModal = (inst: Institution) => {
    setSelectedInstForPlanEdit(inst);
    const planName = (inst.plan as PlanName) || 'BÁSICO';
    setAssignPlanName(planName);

    const overrides = inst.customLimits || inst.subscription?.customLimitsOverride;
    if (overrides && Object.keys(overrides).length > 0) {
      setCustomOverrideActive(true);
      setCustomOverrideStudents(overrides.maxStudents ?? 0);
      setCustomOverrideUsers(overrides.maxUsers ?? 0);
      setCustomOverrideBranches(overrides.maxBranches ?? 0);
      setCustomOverrideStorage(overrides.storageGB ?? 0);
      setCustomOverrideCertificates(overrides.monthlyCertificates ?? 0);
      setCustomOverrideWhatsapp(overrides.whatsappMonthlyLimit ?? 0);
      setCustomOverrideSivec(overrides.sivecMonthlyVerifications ?? 0);
      setCustomOverrideOnlineClasses(overrides.onlineClassesMaxHours ?? 0);
      setCustomOverrideAi(overrides.aiMonthlyPrompts ?? 0);
      setOverrideNotes(inst.subscription?.notes || '');
    } else {
      setCustomOverrideActive(false);
      const targetPlan = systemPlans.find(p => p.name === planName) || systemPlans[0];
      setCustomOverrideStudents(targetPlan.limits.maxStudents);
      setCustomOverrideUsers(targetPlan.limits.maxUsers);
      setCustomOverrideBranches(targetPlan.limits.maxBranches);
      setCustomOverrideStorage(targetPlan.limits.storageGB);
      setCustomOverrideCertificates(targetPlan.limits.monthlyCertificates);
      setCustomOverrideWhatsapp(targetPlan.limits.whatsappMonthlyLimit);
      setCustomOverrideSivec(targetPlan.limits.sivecMonthlyVerifications);
      setCustomOverrideOnlineClasses(targetPlan.limits.onlineClassesMaxHours);
      setCustomOverrideAi(targetPlan.limits.aiMonthlyPrompts);
      setOverrideNotes('');
    }
  };

  const handleSaveInstitutionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstForPlanEdit) return;

    let overrides: Partial<PlanLimits> | undefined = undefined;
    if (customOverrideActive) {
      overrides = {
        maxStudents: customOverrideStudents,
        maxUsers: customOverrideUsers,
        maxBranches: customOverrideBranches,
        storageGB: customOverrideStorage,
        monthlyCertificates: customOverrideCertificates,
        whatsappMonthlyLimit: customOverrideWhatsapp,
        sivecMonthlyVerifications: customOverrideSivec,
        onlineClassesMaxHours: customOverrideOnlineClasses,
        aiMonthlyPrompts: customOverrideAi,
        whatsappEnabled: customOverrideWhatsapp > 0,
        sivecEnabled: customOverrideSivec > 0,
        onlineClassesEnabled: customOverrideOnlineClasses > 0,
        aiEnabled: customOverrideAi > 0
      };
    }

    updateInstitutionPlan(
      selectedInstForPlanEdit.id,
      assignPlanName,
      overrides,
      overrideNotes
    );

    setSelectedInstForPlanEdit(null);
  };

  const filteredInstitutions = allInstitutions.filter(inst => {
    const matchesSearch = 
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterPlan === 'todos') return matchesSearch;
    return matchesSearch && inst.plan === filterPlan;
  });

  // Calculate Global Consumption Metrics
  const totalStudents = allInstitutions.reduce((acc, i) => acc + (i.totalStudents || 0), 0);
  const totalUsers = allInstitutions.reduce((acc, i) => acc + (i.totalTeachers || 0), 0);
  const totalBranches = allInstitutions.reduce((acc, i) => acc + (i.branches?.length || 1), 0);
  const totalStorageGB = allInstitutions.reduce((acc, i) => acc + (i.subscription?.usage?.storageGB || 2), 0);
  const totalMonthlyCertificates = allInstitutions.reduce((acc, i) => acc + (i.subscription?.usage?.monthlyCertificates || 0), 0);
  const totalWhatsappSent = allInstitutions.reduce((acc, i) => acc + (i.subscription?.usage?.whatsappMonthlyMessages || 0), 0);
  const totalSivecVerifications = allInstitutions.reduce((acc, i) => acc + (i.subscription?.usage?.sivecMonthlyVerifications || 0), 0);
  const totalOnlineClassesHours = allInstitutions.reduce((acc, i) => acc + (i.subscription?.usage?.onlineClassesMonthlyHours || 0), 0);
  const totalAiPrompts = allInstitutions.reduce((acc, i) => acc + (i.subscription?.usage?.aiMonthlyPrompts || 0), 0);

  const getPlanBadgeColor = (planName?: string) => {
    switch (planName) {
      case 'ENTERPRISE':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'EMPRESARIAL':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'PROFISSIONAL':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'BÁSICO':
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            Módulo 63 • Gestão Multi-Institucional
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sistema de Planos &amp; Limites de Recursos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Configure os 4 níveis de assinatura (BÁSICO, PROFISSIONAL, EMPRESARIAL, ENTERPRISE) e defina limites rigorosos de alunos, utilizadores, filiais, armazenamento, certificados, WhatsApp, SIVEC, aulas online e IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('superadmin_dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Painel Multi-Tenant</span>
          </button>
          <button
            onClick={() => setActiveTab('instituicoes')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Atribuir Planos</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('planos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'planos'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Catálogo dos 4 Planos ({systemPlans.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('instituicoes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'instituicoes'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Instituições &amp; Assinaturas ({allInstitutions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('consumo_global')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'consumo_global'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Auditoria de Consumo Global</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Controle Exclusivo do Super Admin</span>
        </div>
      </div>

      {/* TAB 1: OS 4 PLANOS (BÁSICO, PROFISSIONAL, EMPRESARIAL, ENTERPRISE) */}
      {activeTab === 'planos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemPlans.map(plan => {
              const assignedCount = allInstitutions.filter(i => i.plan === plan.name).length;
              return (
                <div 
                  key={plan.id}
                  className={`flex flex-col justify-between rounded-3xl p-6 border transition-all duration-300 relative ${
                    plan.isPopular
                      ? 'bg-gradient-to-b from-purple-950/40 to-slate-900 border-purple-500/50 shadow-xl shadow-purple-950/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500 text-white shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-black text-white tracking-tight">{plan.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{plan.description}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${getPlanBadgeColor(plan.name)}`}>
                        {assignedCount} {assignedCount === 1 ? 'Centro' : 'Centros'}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-white tracking-tight">
                          {plan.priceMZN.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-slate-400">MZN / mês</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium mt-1">
                        Faturamento {Array.isArray(plan.billingCycles) ? plan.billingCycles.join(' ou ') : 'Mensal ou Anual'}
                      </div>
                    </div>

                    {/* 9 Configurable Limits */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Limites Configuráveis (9 Recursos):
                      </span>

                      {/* 1. Alunos */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-sky-400" />
                          Alunos
                        </span>
                        <span className="font-bold text-white">
                          {plan.limits.maxStudents === -1 ? 'Ilimitados' : plan.limits.maxStudents.toLocaleString()}
                        </span>
                      </div>

                      {/* 2. Utilizadores */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          Utilizadores
                        </span>
                        <span className="font-bold text-white">
                          {plan.limits.maxUsers === -1 ? 'Ilimitados' : plan.limits.maxUsers}
                        </span>
                      </div>

                      {/* 3. Filiais */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          Filiais
                        </span>
                        <span className="font-bold text-white">
                          {plan.limits.maxBranches === -1 ? 'Multi-Campus Ilimitado' : `${plan.limits.maxBranches} Filial`}
                        </span>
                      </div>

                      {/* 4. Armazenamento */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                          Armazenamento
                        </span>
                        <span className="font-bold text-white">
                          {plan.limits.storageGB} GB
                        </span>
                      </div>

                      {/* 5. Certificados */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-yellow-400" />
                          Certificados/mês
                        </span>
                        <span className="font-bold text-white">
                          {plan.limits.monthlyCertificates === -1 ? 'Ilimitados' : plan.limits.monthlyCertificates}
                        </span>
                      </div>

                      {/* 6. WhatsApp */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          WhatsApp
                        </span>
                        <span className={`font-bold ${plan.limits.whatsappEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {plan.limits.whatsappEnabled ? `${plan.limits.whatsappMonthlyLimit}/mês` : 'Desativado'}
                        </span>
                      </div>

                      {/* 7. SIVEC */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                          SIVEC
                        </span>
                        <span className={`font-bold ${plan.limits.sivecEnabled ? 'text-teal-400' : 'text-slate-500'}`}>
                          {plan.limits.sivecEnabled ? `${plan.limits.sivecMonthlyVerifications} verif.` : 'Desativado'}
                        </span>
                      </div>

                      {/* 8. Aulas Online */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-blue-400" />
                          Aulas Online
                        </span>
                        <span className={`font-bold ${plan.limits.onlineClassesEnabled ? 'text-blue-400' : 'text-slate-500'}`}>
                          {plan.limits.onlineClassesEnabled ? `${plan.limits.onlineClassesMaxHours} h/mês` : 'Desativado'}
                        </span>
                      </div>

                      {/* 9. IA */}
                      <div className="flex items-center justify-between text-xs py-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          IA Moztechwave
                        </span>
                        <span className={`font-bold ${plan.limits.aiEnabled ? 'text-purple-400' : 'text-slate-500'}`}>
                          {plan.limits.aiEnabled ? `${plan.limits.aiMonthlyPrompts} prompts` : 'Desativado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Super Admin Action */}
                  <div className="pt-6 mt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => openEditPlanModal(plan)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white font-bold text-xs transition-all border border-slate-700 hover:border-purple-500 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configurar Limites do Plano</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Informational Box */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Princípio de Isolamento Multi-Tenant &amp; Expansão Comercial
              </h4>
              <p className="text-xs text-slate-400 max-w-3xl">
                À medida que a plataforma Moztechwave atende novos centros e instituições de ensino em Moçambique, cada entidade opera com seu banco de dados isolado e quotas rigorosamente monitoradas contra sobrecarga do servidor.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('instituicoes')}
              className="whitespace-nowrap px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-2"
            >
              <span>Gerir Centros Conectados</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: INSTITUIÇÕES & ATRIBUIÇÃO DE PLANOS */}
      {activeTab === 'instituicoes' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar instituição por nome, código ou cidade..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400">Filtrar por Plano:</span>
              <select
                value={filterPlan}
                onChange={e => setFilterPlan(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
              >
                <option value="todos">Todos os Planos</option>
                <option value="BÁSICO">BÁSICO</option>
                <option value="PROFISSIONAL">PROFISSIONAL</option>
                <option value="EMPRESARIAL">EMPRESARIAL</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>
          </div>

          {/* Institutions Table / Cards */}
          <div className="space-y-4">
            {filteredInstitutions.map(inst => {
              const currentPlanName = (inst.plan as PlanName) || 'BÁSICO';
              const effectiveLimits = getEffectivePlanLimits(inst);
              const hasOverrides = !!(inst.customLimits || inst.subscription?.customLimitsOverride);
              
              // Resource checks
              const studentCheck = checkResourceUsage(inst, 'maxStudents');
              const storageCheck = checkResourceUsage(inst, 'storageGB');
              const certCheck = checkResourceUsage(inst, 'monthlyCertificates');
              const whatsappCheck = checkResourceUsage(inst, 'whatsappMonthlyLimit');
              const sivecCheck = checkResourceUsage(inst, 'sivecMonthlyVerifications');
              const aiCheck = checkResourceUsage(inst, 'aiMonthlyPrompts');

              return (
                <div 
                  key={inst.id}
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                >
                  {/* Inst Row Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-white text-base overflow-hidden shrink-0">
                        {inst.logoUrl ? (
                          <img src={inst.logoUrl} alt={inst.name} className="w-full h-full object-cover" />
                        ) : (
                          inst.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-bold text-white">{inst.name}</h3>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {inst.code}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getPlanBadgeColor(currentPlanName)}`}>
                            Plano {currentPlanName}
                          </span>
                          {hasOverrides && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Sliders className="w-3 h-3" />
                              Limites Personalizados
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                          <span>{inst.city}, {inst.province}</span>
                          <span>•</span>
                          <span>{inst.branches?.length || 1} {(inst.branches?.length || 1) === 1 ? 'Filial' : 'Filiais'}</span>
                          <span>•</span>
                          <span>NUIT: {inst.nuit}</span>
                          <span>•</span>
                          <span className="text-slate-300">
                            Renovação: {inst.subscription?.renewalDate || '30 dias'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => openInstPlanModal(inst)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 cursor-pointer transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Alterar Plano / Limites</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Progress Bar of Key Resources */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                    {/* Alunos */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-sky-400" />
                          Alunos
                        </span>
                        <span className="font-bold text-white">
                          {studentCheck.current} / {studentCheck.isUnlimited ? '∞' : studentCheck.max}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            studentCheck.percentage > 90 ? 'bg-rose-500' : studentCheck.percentage > 70 ? 'bg-amber-400' : 'bg-sky-400'
                          }`}
                          style={{ width: `${studentCheck.percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right font-mono">
                        {studentCheck.isUnlimited ? 'Ilimitado' : `${studentCheck.percentage}% usado`}
                      </span>
                    </div>

                    {/* Armazenamento */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-cyan-400" />
                          Storage
                        </span>
                        <span className="font-bold text-white">
                          {storageCheck.current} / {storageCheck.max} GB
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            storageCheck.percentage > 90 ? 'bg-rose-500' : storageCheck.percentage > 70 ? 'bg-amber-400' : 'bg-cyan-400'
                          }`}
                          style={{ width: `${storageCheck.percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right font-mono">
                        {storageCheck.percentage}% usado
                      </span>
                    </div>

                    {/* Certificados */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          Certificados
                        </span>
                        <span className="font-bold text-white">
                          {certCheck.current} / {certCheck.isUnlimited ? '∞' : certCheck.max}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            certCheck.percentage > 90 ? 'bg-rose-500' : certCheck.percentage > 70 ? 'bg-amber-400' : 'bg-yellow-400'
                          }`}
                          style={{ width: `${certCheck.percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right font-mono">
                        {certCheck.isUnlimited ? 'Ilimitado' : `${certCheck.percentage}%`}
                      </span>
                    </div>

                    {/* WhatsApp */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Share2 className="w-3 h-3 text-emerald-400" />
                          WhatsApp
                        </span>
                        <span className="font-bold text-white">
                          {whatsappCheck.allowed ? `${whatsappCheck.current}/${whatsappCheck.max}` : 'Off'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{ width: `${whatsappCheck.allowed ? whatsappCheck.percentage : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right font-mono">
                        {whatsappCheck.allowed ? `${whatsappCheck.percentage}%` : 'Não incluído'}
                      </span>
                    </div>

                    {/* SIVEC */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-teal-400" />
                          SIVEC
                        </span>
                        <span className="font-bold text-white">
                          {sivecCheck.allowed ? `${sivecCheck.current}/${sivecCheck.max}` : 'Off'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-teal-400 transition-all"
                          style={{ width: `${sivecCheck.allowed ? sivecCheck.percentage : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right font-mono">
                        {sivecCheck.allowed ? `${sivecCheck.percentage}%` : 'Não incluído'}
                      </span>
                    </div>

                    {/* IA Moztechwave */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          IA
                        </span>
                        <span className="font-bold text-white">
                          {aiCheck.allowed ? `${aiCheck.current}/${aiCheck.max}` : 'Off'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-purple-400 transition-all"
                          style={{ width: `${aiCheck.allowed ? aiCheck.percentage : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right font-mono">
                        {aiCheck.allowed ? `${aiCheck.percentage}%` : 'Não incluído'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AUDITORIA DE CONSUMO GLOBAL DO ECOSSISTEMA */}
      {activeTab === 'consumo_global' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Alunos Matriculados</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalStudents.toLocaleString()}</div>
              <p className="text-[11px] text-slate-400">Distribuídos por {allInstitutions.length} instituições</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage Total Utilizado</span>
                <HardDrive className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalStorageGB.toFixed(1)} GB</div>
              <p className="text-[11px] text-cyan-400 font-medium">Bancos de dados + Documentos PDF</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Certificados no Mês</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalMonthlyCertificates}</div>
              <p className="text-[11px] text-amber-400 font-medium">Emitidos com QR Code SIVEC</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disparos WhatsApp</span>
                <Share2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalWhatsappSent.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-400 font-medium">Cobranças &amp; Comunicados automáticos</p>
            </div>
          </div>

          {/* Detailed Ecosystem Table */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Balanço Geral de Recursos por Instituição Ativa
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Instituição</th>
                    <th className="py-3 px-4">Plano Ativo</th>
                    <th className="py-3 px-4">Alunos (Uso/Max)</th>
                    <th className="py-3 px-4">Filiais</th>
                    <th className="py-3 px-4">Storage (GB)</th>
                    <th className="py-3 px-4">Certificados</th>
                    <th className="py-3 px-4">WhatsApp</th>
                    <th className="py-3 px-4">SIVEC</th>
                    <th className="py-3 px-4">Aulas Online</th>
                    <th className="py-3 px-4">IA Prompts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allInstitutions.map(inst => {
                    const planLimits = getEffectivePlanLimits(inst);
                    const usage = inst.subscription?.usage;
                    return (
                      <tr key={inst.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{inst.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({inst.code})</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${getPlanBadgeColor(inst.plan)}`}>
                            {inst.plan || 'BÁSICO'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {inst.totalStudents || 0} / {planLimits.maxStudents === -1 ? '∞' : planLimits.maxStudents}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {inst.branches?.length || 1} / {planLimits.maxBranches === -1 ? '∞' : planLimits.maxBranches}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {usage?.storageGB || 2} / {planLimits.storageGB} GB
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {usage?.monthlyCertificates || 0} / {planLimits.monthlyCertificates === -1 ? '∞' : planLimits.monthlyCertificates}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {planLimits.whatsappEnabled ? `${usage?.whatsappMonthlyMessages || 0}/${planLimits.whatsappMonthlyLimit}` : <span className="text-slate-500">Inativo</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {planLimits.sivecEnabled ? `${usage?.sivecMonthlyVerifications || 0}/${planLimits.sivecMonthlyVerifications}` : <span className="text-slate-500">Inativo</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {planLimits.onlineClassesEnabled ? `${usage?.onlineClassesMonthlyHours || 0}h/${planLimits.onlineClassesMaxHours}h` : <span className="text-slate-500">Inativo</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {planLimits.aiEnabled ? `${usage?.aiMonthlyPrompts || 0}/${planLimits.aiMonthlyPrompts}` : <span className="text-slate-500">Inativo</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT PLAN DEFINITION (SUPER ADMIN) */}
      {selectedPlanForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Configurar Plano Global: {selectedPlanForEdit.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ajuste o preço e os 9 limites de recursos concedidos aos clientes deste plano.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlanForEdit(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlanDefinition} className="space-y-6">
              {/* Preço Mensal */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Preço Base Mensal (MZN)
                </label>
                <input
                  type="number"
                  value={editPlanPrice}
                  onChange={e => setEditPlanPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* 9 Configurable Limits */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Limites dos 9 Recursos (Utilize -1 para Ilimitado):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Alunos */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      Limite Máximo de Alunos (-1 = ilimitado)
                    </label>
                    <input
                      type="number"
                      value={editPlanMaxStudents}
                      onChange={e => setEditPlanMaxStudents(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* 2. Utilizadores */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Limite de Utilizadores (Docentes/Admin)
                    </label>
                    <input
                      type="number"
                      value={editPlanMaxUsers}
                      onChange={e => setEditPlanMaxUsers(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* 3. Filiais */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      Limite de Filiais / Delegações
                    </label>
                    <input
                      type="number"
                      value={editPlanMaxBranches}
                      onChange={e => setEditPlanMaxBranches(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* 4. Armazenamento */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      Armazenamento em Nuvem (GB)
                    </label>
                    <input
                      type="number"
                      value={editPlanStorageGB}
                      onChange={e => setEditPlanStorageGB(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* 5. Certificados */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                      <Award className="w-3.5 h-3.5 text-yellow-400" />
                      Certificados Mensais (-1 = ilimitado)
                    </label>
                    <input
                      type="number"
                      value={editPlanCertificates}
                      onChange={e => setEditPlanCertificates(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* 6. WhatsApp */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                        <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                        Disparos WhatsApp Mensais
                      </label>
                      <input
                        type="checkbox"
                        checked={editPlanWhatsappEnabled}
                        onChange={e => setEditPlanWhatsappEnabled(e.target.checked)}
                        className="rounded-sm text-purple-600 focus:ring-0 cursor-pointer"
                      />
                    </div>
                    <input
                      type="number"
                      value={editPlanWhatsappLimit}
                      disabled={!editPlanWhatsappEnabled}
                      onChange={e => setEditPlanWhatsappLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-40 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* 7. SIVEC */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                        Verificações SIVEC / mês
                      </label>
                      <input
                        type="checkbox"
                        checked={editPlanSivecEnabled}
                        onChange={e => setEditPlanSivecEnabled(e.target.checked)}
                        className="rounded-sm text-purple-600 focus:ring-0 cursor-pointer"
                      />
                    </div>
                    <input
                      type="number"
                      value={editPlanSivecVerifications}
                      disabled={!editPlanSivecEnabled}
                      onChange={e => setEditPlanSivecVerifications(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-40 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* 8. Aulas Online */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                        <Video className="w-3.5 h-3.5 text-blue-400" />
                        Horas de Aulas Online / mês
                      </label>
                      <input
                        type="checkbox"
                        checked={editPlanOnlineClassesEnabled}
                        onChange={e => setEditPlanOnlineClassesEnabled(e.target.checked)}
                        className="rounded-sm text-purple-600 focus:ring-0 cursor-pointer"
                      />
                    </div>
                    <input
                      type="number"
                      value={editPlanOnlineClassesHours}
                      disabled={!editPlanOnlineClassesEnabled}
                      onChange={e => setEditPlanOnlineClassesHours(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-40 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* 9. IA */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Prompts de Inteligência Artificial / mês
                      </label>
                      <input
                        type="checkbox"
                        checked={editPlanAiEnabled}
                        onChange={e => setEditPlanAiEnabled(e.target.checked)}
                        className="rounded-sm text-purple-600 focus:ring-0 cursor-pointer"
                      />
                    </div>
                    <input
                      type="number"
                      value={editPlanAiPrompts}
                      disabled={!editPlanAiEnabled}
                      onChange={e => setEditPlanAiPrompts(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-40 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Salvar Limites do Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN PLAN & CONFIGURE CUSTOM OVERRIDES FOR AN INSTITUTION */}
      {selectedInstForPlanEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Plano &amp; Quotas: {selectedInstForPlanEdit.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina o plano contratado ou estabeleça quotas sob medida para este centro.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInstForPlanEdit(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInstitutionPlan} className="space-y-6">
              {/* Select Main Plan */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Selecione o Plano da Instituição:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['BÁSICO', 'PROFISSIONAL', 'EMPRESARIAL', 'ENTERPRISE'] as PlanName[]).map(pName => (
                    <button
                      type="button"
                      key={pName}
                      onClick={() => setAssignPlanName(pName)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        assignPlanName === pName
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md font-bold'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-black">{pName}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        {systemPlans.find(p => p.name === pName)?.priceMZN.toLocaleString()} MZN
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Overrides Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Limites Personalizados (Custom Overrides)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Permite estender recursos além dos limites normais do plano sem alterar o plano base.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={customOverrideActive}
                    onChange={e => setCustomOverrideActive(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-purple-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                {customOverrideActive && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Limite Alunos (-1 = ilimitado)</label>
                      <input
                        type="number"
                        value={customOverrideStudents}
                        onChange={e => setCustomOverrideStudents(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Limite Utilizadores</label>
                      <input
                        type="number"
                        value={customOverrideUsers}
                        onChange={e => setCustomOverrideUsers(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Limite Filiais</label>
                      <input
                        type="number"
                        value={customOverrideBranches}
                        onChange={e => setCustomOverrideBranches(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Storage Nuvem (GB)</label>
                      <input
                        type="number"
                        value={customOverrideStorage}
                        onChange={e => setCustomOverrideStorage(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Certificados / mês</label>
                      <input
                        type="number"
                        value={customOverrideCertificates}
                        onChange={e => setCustomOverrideCertificates(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">WhatsApp Disparos / mês</label>
                      <input
                        type="number"
                        value={customOverrideWhatsapp}
                        onChange={e => setCustomOverrideWhatsapp(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">SIVEC Verificações / mês</label>
                      <input
                        type="number"
                        value={customOverrideSivec}
                        onChange={e => setCustomOverrideSivec(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Aulas Online (Horas/mês)</label>
                      <input
                        type="number"
                        value={customOverrideOnlineClasses}
                        onChange={e => setCustomOverrideOnlineClasses(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-400 block mb-1">IA Prompts / mês</label>
                      <input
                        type="number"
                        value={customOverrideAi}
                        onChange={e => setCustomOverrideAi(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold block">
                  Observações / Acordo Comercial do Super Admin:
                </label>
                <textarea
                  value={overrideNotes}
                  onChange={e => setOverrideNotes(e.target.value)}
                  placeholder="Ex: Concedido bônus de 50GB de armazenamento mediante contrato anual assinado..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInstForPlanEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Confirmar Assinatura do Centro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
