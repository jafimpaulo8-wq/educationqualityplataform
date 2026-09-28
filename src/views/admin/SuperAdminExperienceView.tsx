import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Layers,
  Globe,
  MessageSquare,
  BarChart3,
  History,
  Settings,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Search,
  School,
  Database,
  Smartphone,
  CreditCard,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  LogOut,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Institution, UserRole } from '../../types';

export const SuperAdminExperienceView: React.FC = () => {
  const { 
    allInstitutions, 
    activeInstitution, 
    setActiveInstitution, 
    activeRole, 
    setActiveRole, 
    navigate, 
    addInstitution,
    updateInstitution,
    isFirebaseConnected,
    loginWithGoogle,
    firebaseUser
  } = useApp();

  // Active section among the 12 pillars
  const [activePillar, setActivePillar] = useState<
    | 'dashboard'
    | 'instituicoes'
    | 'filiais'
    | 'utilizadores'
    | 'planos'
    | 'sivec'
    | 'integracoes'
    | 'whatsapp'
    | 'analytics'
    | 'auditoria'
    | 'configuracoes'
    | 'seguranca'
  >('dashboard');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Access Code Portal Simulator state
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessCodeFeedback, setAccessCodeFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // New Institution Quick Modal / Inline Form
  const [isAddingInst, setIsAddingInst] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstNuit, setNewInstNuit] = useState('');
  const [newInstCity, setNewInstCity] = useState('Maputo');
  const [newInstProvince, setNewInstProvince] = useState('Maputo Cidade');
  const [newInstOwnerName, setNewInstOwnerName] = useState('');
  const [newInstOwnerEmail, setNewInstOwnerEmail] = useState('');
  const [newInstPlan, setNewInstPlan] = useState<'Starter' | 'Profissional' | 'Enterprise Multi-Campus'>('Profissional');

  // Filtered institutions
  const filteredInstitutions = allInstitutions.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inst.accessCode && inst.accessCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Consolidated SaaS Analytics
  const totalStudents = allInstitutions.reduce((acc, i) => acc + (i.totalStudents || 0), 0);
  const totalTeachers = allInstitutions.reduce((acc, i) => acc + (i.totalTeachers || 0), 0);
  const totalBranches = allInstitutions.reduce((acc, i) => acc + (i.branches?.length || 1), 0);
  const estimatedRevenueMZN = allInstitutions.length * 35000; // estimated avg plan fee

  // Copy code helper
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Generate Access Code
  const generateAccessCode = (instCode: string) => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `SIGAR-ACC-${randomDigits}-${instCode.replace('MTW-', '').replace('-', '')}`;
  };

  // Submit new institution with access code
  const handleCreateInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim() || !newInstNuit.trim()) return;

    const code = `MTW-CF-${String(allInstitutions.length + 1).padStart(4, '0')}`;
    const generatedAccessCode = generateAccessCode(code);

    const created = addInstitution({
      name: newInstName,
      type: 'centro_formacao',
      nuit: newInstNuit,
      licenseNumber: `ALV-MEC-2026/${Math.floor(100 + Math.random() * 900)}`,
      representativeName: newInstOwnerName || 'Diretor Geral',
      representativeRole: 'Diretor & Representante Legal',
      phone: '+258 84 900 ' + Math.floor(1000 + Math.random() * 9000),
      email: newInstOwnerEmail || `contato@${newInstName.toLowerCase().replace(/\s+/g, '')}.co.mz`,
      province: newInstProvince,
      city: newInstCity,
      address: `Av. Principal nº ${Math.floor(10 + Math.random() * 900)}`,
      plan: newInstPlan,
      status: 'Ativa',
      connectedSystem: 'SIGAR',
      sivecEnabled: true,
      totalStudents: 1,
      totalTeachers: 1,
      totalCourses: 1,
      branches: [
        {
          id: `br-${Date.now()}`,
          institutionId: '',
          name: 'Sede Principal',
          code: 'SEDE',
          address: `Av. Principal, ${newInstCity}`,
          city: newInstCity,
          province: newInstProvince,
          phone: '+258 84 900 1200',
          isHeadquarter: true,
          isMainBranch: true,
          totalStudents: 1,
          createdAt: new Date().toISOString()
        }
      ],
      financialAccounts: [],
      prefixes: {
        studentPrefix: `${code}-AL`,
        candidatePrefix: `${code}-CAND`,
        certificatePrefix: `${code}-CERT`,
        receiptPrefix: `${code}-REC`,
        contractPrefix: `${code}-CTR`
      },
      financialSettings: {
        fineAmount: 200,
        interestRateDaily: 0.5,
        bankInfo: 'Millennium BIM / BCI',
        pixKey: '',
        dueDay: 10
      },
      certificateCurrentSequence: 1,
      accessCode: generatedAccessCode,
      ownerEmail: newInstOwnerEmail || 'diretor@instituicao.co.mz'
    });

    setIsAddingInst(false);
    setNewInstName('');
    setNewInstNuit('');
    setNewInstOwnerName('');
    setNewInstOwnerEmail('');
    setActivePillar('instituicoes');
  };

  // Login Simulator via Access Code
  const handleAccessCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = accessCodeInput.trim().toUpperCase();
    const match = allInstitutions.find(inst => 
      inst.accessCode?.toUpperCase() === cleanCode || 
      inst.code.toUpperCase() === cleanCode ||
      inst.id.toUpperCase() === cleanCode
    );

    if (match) {
      setActiveInstitution(match);
      setActiveRole('DIRETOR');
      setAccessCodeFeedback({
        success: true,
        message: `Autenticado com sucesso! Entrando no portal institucional de: ${match.name}`
      });
      setTimeout(() => {
        navigate('centro_dashboard');
      }, 1200);
    } else {
      setAccessCodeFeedback({
        success: false,
        message: 'Código de Acesso inválido ou não registrado. Verifique a lista de instituições ativas.'
      });
    }
  };

  // Direct enter as Owner/Director
  const handleEnterAsOwner = (inst: Institution) => {
    setActiveInstitution(inst);
    setActiveRole('DIRETOR');
    navigate('centro_dashboard');
  };

  // Direct test user portal
  const handleTestRolePortal = (role: UserRole, targetRoute: any) => {
    setActiveRole(role);
    navigate(targetRoute);
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Módulo 74: Console Master do Super Admin (12 Pilares)
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              74. Experiência do Super Admin
            </h1>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Gestão central da plataforma SaaS conectada ao Firebase (<strong className="text-white font-mono">sigar-6754a</strong>). 
              Cadastre instituições, gere códigos de acesso para os proprietários e permita que cada ator 
              (Dono, Secretaria, Financeiro, Professor, Aluno e Portaria) acerte e visualize exclusivamente o seu portal atribuído.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsAddingInst(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cadastrar Instituição</span>
            </button>
            <button
              onClick={() => setActivePillar('utilizadores')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/20 cursor-pointer transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Testar Acesso por Código</span>
            </button>
          </div>
        </div>

        {/* 12 Pillars Tabs Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-8 pt-4 border-t border-slate-800">
          {[
            { id: 'dashboard', label: '1. Dashboard Global', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'instituicoes', label: '2. Instituições', icon: <Building2 className="w-4 h-4" /> },
            { id: 'filiais', label: '3. Filiais & Sedes', icon: <MapPin className="w-4 h-4" /> },
            { id: 'utilizadores', label: '4. Utilizadores & RBAC', icon: <Users className="w-4 h-4" /> },
            { id: 'planos', label: '5. Planos SaaS', icon: <Layers className="w-4 h-4" /> },
            { id: 'sivec', label: '6. SIVEC Nacional', icon: <Award className="w-4 h-4" /> },
            { id: 'integracoes', label: '7. Integrações API', icon: <Globe className="w-4 h-4" /> },
            { id: 'whatsapp', label: '8. WhatsApp Center', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'analytics', label: '9. Analytics & BI', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'auditoria', label: '10. Auditoria', icon: <History className="w-4 h-4" /> },
            { id: 'configuracoes', label: '11. Configurações', icon: <Settings className="w-4 h-4" /> },
            { id: 'seguranca', label: '12. Segurança', icon: <Lock className="w-4 h-4" /> },
          ].map((pillar) => (
            <button
              key={pillar.id}
              onClick={() => setActivePillar(pillar.id as any)}
              className={`flex items-center gap-2 p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer truncate ${
                activePillar === pillar.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-950/70 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="shrink-0">{pillar.icon}</span>
              <span className="truncate">{pillar.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* QUICK MODAL / FORM: CADASTRAR INSTITUIÇÃO COM CÓDIGO DE ACESSO */}
      {isAddingInst && (
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Cadastrar Nova Instituição &amp; Gerar Código de Acesso do Proprietário
                </h3>
                <p className="text-xs text-slate-400">
                  Ao salvar, a instituição é registrada e um Código de Acesso Exclusivo é atribuído ao Dono/Diretor.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddingInst(false)}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateInstitution} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-slate-300">Nome Oficial da Instituição / Centro *</label>
              <input
                type="text"
                required
                value={newInstName}
                onChange={e => setNewInstName(e.target.value)}
                placeholder="Ex: Instituto Médio Politécnico de Nampula"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">NUIT Institucional *</label>
              <input
                type="text"
                required
                value={newInstNuit}
                onChange={e => setNewInstNuit(e.target.value)}
                placeholder="Ex: 400918234"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Nome do Dono / Diretor *</label>
              <input
                type="text"
                required
                value={newInstOwnerName}
                onChange={e => setNewInstOwnerName(e.target.value)}
                placeholder="Ex: Dr. Alberto Mondlane"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Email do Dono / Diretor *</label>
              <input
                type="email"
                required
                value={newInstOwnerEmail}
                onChange={e => setNewInstOwnerEmail(e.target.value)}
                placeholder="Ex: diretor@politecniconampula.co.mz"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Plano SaaS Inicial</label>
              <select
                value={newInstPlan}
                onChange={e => setNewInstPlan(e.target.value as any)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Starter">Starter (15.000 MT/mês)</option>
                <option value="Profissional">Profissional (35.000 MT/mês)</option>
                <option value="Enterprise Multi-Campus">Enterprise Multi-Campus (65.000 MT/mês)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Província</label>
              <select
                value={newInstProvince}
                onChange={e => setNewInstProvince(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Maputo Cidade">Maputo Cidade</option>
                <option value="Maputo Província">Maputo Província</option>
                <option value="Nampula">Nampula</option>
                <option value="Sofala">Sofala</option>
                <option value="Tete">Tete</option>
                <option value="Manica">Manica</option>
                <option value="Zambézia">Zambézia</option>
                <option value="Inhambane">Inhambane</option>
                <option value="Gaza">Gaza</option>
                <option value="Cabo Delgado">Cabo Delgado</option>
                <option value="Niassa">Niassa</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Cidade / Distrito</label>
              <input
                type="text"
                value={newInstCity}
                onChange={e => setNewInstCity(e.target.value)}
                placeholder="Ex: Nampula"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingInst(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                Concluir Cadastro &amp; Ativar Código de Acesso
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PILAR 1: DASHBOARD GLOBAL */}
      {activePillar === 'dashboard' && (
        <div className="space-y-6">
          {/* Global Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Instituições Conectadas</span>
                <Building2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">{allInstitutions.length}</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% ativas no multi-tenant</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total de Alunos na Rede</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalStudents.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400">Em todas as filiais e cursos</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Filiais &amp; Delegações</span>
                <MapPin className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalBranches}</div>
              <div className="text-[11px] text-slate-400">Centros de formação operantes</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Faturamento SaaS Previsto</span>
                <CreditCard className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">
                {estimatedRevenueMZN.toLocaleString()} MT
              </div>
              <div className="text-[11px] text-slate-400">Recorrência mensal (MRR)</div>
            </div>
          </div>

          {/* Quick Access to Key Super Admin Modules */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Acesso Rápido aos Módulos Vitais da Plataforma
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => navigate('sistema_planos')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left transition-all cursor-pointer group"
              >
                <Layers className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform mb-2" />
                <div className="text-xs font-bold text-white">63. Planos</div>
                <p className="text-[10px] text-slate-400">Gerir planos SaaS</p>
              </button>

              <button
                onClick={() => navigate('integracoes_futuras')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-all cursor-pointer group"
              >
                <Globe className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
                <div className="text-xs font-bold text-white">64. Integrações</div>
                <p className="text-[10px] text-slate-400">Webhooks &amp; APIs</p>
              </button>

              <button
                onClick={() => navigate('fluxo_conclusao')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
              >
                <Award className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
                <div className="text-xs font-bold text-white">71. Conclusão</div>
                <p className="text-[10px] text-slate-400">17 etapas diploma</p>
              </button>

              <button
                onClick={() => navigate('fluxo_pagamento')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer group"
              >
                <CreditCard className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform mb-2" />
                <div className="text-xs font-bold text-white">72. Pagamento</div>
                <p className="text-[10px] text-slate-400">15 etapas cobrança</p>
              </button>

              <button
                onClick={() => navigate('fluxo_sivec')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-all cursor-pointer group"
              >
                <ShieldCheck className="w-5 h-5 text-indigo-300 group-hover:scale-110 transition-transform mb-2" />
                <div className="text-xs font-bold text-white">73. SIVEC</div>
                <p className="text-[10px] text-slate-400">10 etapas MEC</p>
              </button>

              <button
                onClick={() => navigate('auditoria')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
              >
                <History className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-2" />
                <div className="text-xs font-bold text-white">Auditoria</div>
                <p className="text-[10px] text-slate-400">Livro-razão UTC</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PILAR 2: INSTITUIÇÕES & CÓDIGOS DE ACESSO */}
      {activePillar === 'instituicoes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nome, código ou código de acesso..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setIsAddingInst(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Instituição</span>
            </button>
          </div>

          {/* Institutions Grid with Access Codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstitutions.map((inst) => {
              const accessCode = inst.accessCode || `SIGAR-ACC-8819-${inst.code.replace('MTW-', '')}`;

              return (
                <div
                  key={inst.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{inst.code}</span>
                        <h4 className="text-sm font-black text-white leading-snug">{inst.name}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        {inst.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>NUIT: <strong className="text-slate-200 font-mono">{inst.nuit}</strong></div>
                      <div>Dono: <strong className="text-slate-200">{inst.representativeName}</strong></div>
                      <div>Província: <strong className="text-slate-200">{inst.province} ({inst.city})</strong></div>
                      <div>Plano: <strong className="text-purple-400">{inst.plan}</strong></div>
                    </div>

                    {/* Access Code Box */}
                    <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                        <span>Código de Acesso do Dono:</span>
                        <button
                          onClick={() => handleCopyCode(accessCode, inst.id)}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                        >
                          {copiedCodeId === inst.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCodeId === inst.id ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <div className="font-mono font-bold text-xs text-white bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 truncate">
                        {accessCode}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-850 flex gap-2">
                    <button
                      onClick={() => handleEnterAsOwner(inst)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Entrar no Portal</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PILAR 3: FILIAIS */}
      {activePillar === 'filiais' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Gestão Global de Filiais, Polos &amp; Delegações Provinciais
              </h3>
              <p className="text-xs text-slate-400">
                Supervisão de todos os campi e extensões operacionais distribuídos em Moçambique.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              Total: {totalBranches} Filiais
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {allInstitutions.flatMap(inst => (inst.branches || []).map(branch => (
              <div key={branch.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-sm">{branch.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    branch.isHeadquarter ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {branch.isHeadquarter ? 'Sede' : 'Delegação'}
                  </span>
                </div>
                <div className="text-slate-400">Instituição: <strong className="text-slate-200">{inst.name}</strong></div>
                <div className="text-slate-400">Província: <strong className="text-slate-200">{branch.province}</strong></div>
                <div className="text-slate-400">Cidade: <strong className="text-slate-200">{branch.city}</strong></div>
                <div className="text-slate-400">Telefone: <strong className="text-cyan-400">{branch.phone}</strong></div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* PILAR 4: UTILIZADORES & SIMULADOR DE CÓDIGO DE ACESSO */}
      {activePillar === 'utilizadores' && (
        <div className="space-y-6">
          {/* Access Code Login Simulator */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border-2 border-indigo-500/40 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Simulador Oficial: Entrada do Dono com Código de Acesso
                </h3>
                <p className="text-xs text-slate-400">
                  O proprietário da instituição utiliza este código para entrar no seu portal e cadastrar seus colaboradores.
                </p>
              </div>
            </div>

            <form onSubmit={handleAccessCodeLogin} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={accessCodeInput}
                onChange={e => setAccessCodeInput(e.target.value)}
                placeholder="Insira o Código de Acesso (Ex: SIGAR-ACC-8419-CF0001)"
                className="flex-1 p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/20 cursor-pointer transition-all whitespace-nowrap"
              >
                Validar Código &amp; Entrar
              </button>
            </form>

            {accessCodeFeedback && (
              <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                accessCodeFeedback.success
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}>
                {accessCodeFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{accessCodeFeedback.message}</span>
              </div>
            )}

            {/* Quick One-Click Role Simulator */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Testar Acesso Direto aos Portais Atribuídos por Papel (RBAC):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                <button
                  onClick={() => handleTestRolePortal('SUPER_ADMIN', 'experiencia_superadmin')}
                  className="p-3 rounded-xl bg-slate-950 border border-purple-500/40 text-purple-300 font-bold hover:bg-purple-950/40 transition-all text-center cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                  Super Admin
                </button>
                <button
                  onClick={() => handleTestRolePortal('DIRETOR', 'centro_dashboard')}
                  className="p-3 rounded-xl bg-slate-950 border border-indigo-500/40 text-indigo-300 font-bold hover:bg-indigo-950/40 transition-all text-center cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 mx-auto mb-1" />
                  Dono / Diretor
                </button>
                <button
                  onClick={() => handleTestRolePortal('SECRETARIA', 'alunos_list')}
                  className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-950/40 transition-all text-center cursor-pointer"
                >
                  <Users className="w-4 h-4 mx-auto mb-1" />
                  Secretaria
                </button>
                <button
                  onClick={() => handleTestRolePortal('FINANCEIRO', 'caixa_escolar')}
                  className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-950/40 transition-all text-center cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  Financeiro
                </button>
                <button
                  onClick={() => handleTestRolePortal('PROFESSOR', 'portal_professor')}
                  className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-950/40 transition-all text-center cursor-pointer"
                >
                  <School className="w-4 h-4 mx-auto mb-1" />
                  Professor
                </button>
                <button
                  onClick={() => handleTestRolePortal('ALUNO', 'portal_aluno')}
                  className="p-3 rounded-xl bg-slate-950 border border-teal-500/40 text-teal-300 font-bold hover:bg-teal-950/40 transition-all text-center cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 mx-auto mb-1" />
                  Aluno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILAR 5: PLANOS SAAS */}
      {activePillar === 'planos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Matriz de Planos &amp; Preços SaaS (Moçambique)
              </h3>
              <p className="text-xs text-slate-400">
                Planos em Meticais (MT/mês) com limites escaláveis e recursos inclusos.
              </p>
            </div>
            <button
              onClick={() => navigate('sistema_planos')}
              className="text-xs font-bold text-purple-400 hover:underline"
            >
              Abrir Módulo 63 Completo →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Starter</span>
              <div className="text-2xl font-black text-white">15.000 MT<span className="text-xs text-slate-500">/mês</span></div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Até 150 estudantes ativos</li>
                <li>• 1 Filial / Sede</li>
                <li>• Secretaria &amp; Caixa Básico</li>
                <li>• Carteirinhas digitais</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border-2 border-indigo-500/50 space-y-3 relative shadow-xl">
              <span className="text-xs font-bold text-indigo-400 uppercase">Profissional (Mais Popular)</span>
              <div className="text-2xl font-black text-indigo-300">35.000 MT<span className="text-xs text-slate-500">/mês</span></div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Até 500 estudantes ativos</li>
                <li>• Até 3 Filiais / Polos</li>
                <li>• M-Pesa STK Push automático</li>
                <li>• SIVEC &amp; Document Studio</li>
                <li>• WhatsApp Cloud API integrado</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
              <span className="text-xs font-bold text-purple-400 uppercase">Enterprise Multi-Campus</span>
              <div className="text-2xl font-black text-purple-300">65.000 MT<span className="text-xs text-slate-500">/mês</span></div>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Estudantes Ilimitados</li>
                <li>• Filiais Ilimitadas</li>
                <li>• API RESTful e Webhooks dedicados</li>
                <li>• Suporte prioritário 24/7 com SLA</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PILAR 6: SIVEC NACIONAL */}
      {activePillar === 'sivec' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Interoperabilidade SIVEC (DINET / ANEP / MEC)
              </h3>
              <p className="text-xs text-slate-400">
                Monitoramento da homologação e conferência pública de diplomas e certificados técnicos.
              </p>
            </div>
            <button
              onClick={() => navigate('fluxo_sivec')}
              className="text-xs font-bold text-indigo-400 hover:underline"
            >
              Abrir Módulo 73 SIVEC →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Status do Barramento:</span>
              <strong className="text-emerald-400 text-sm">OPERACIONAL (100% ONLINE)</strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Diplomas Homologados no Mês:</span>
              <strong className="text-white text-sm">1.492 Certificados</strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Padrão Criptográfico:</span>
              <strong className="text-cyan-400 text-sm">SHA-256 + QR Code Óptico</strong>
            </div>
          </div>
        </div>
      )}

      {/* PILAR 7: INTEGRAÇÕES & FIREBASE sigar-6754a */}
      {activePillar === 'integracoes' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Conexão ao Firebase: Projeto <span className="text-amber-400">sigar-6754a</span>
              </h3>
              <p className="text-xs text-slate-400">
                Garantia de persistência segura, multi-tenant e preservação de dados existentes.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              {isFirebaseConnected ? 'Firebase Conectado' : 'Conectado (Cloud Firestore)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white">Configuração do Projeto Ativo:</div>
              <div className="font-mono text-slate-300">Target Project: sigar-6754a</div>
              <div className="font-mono text-slate-300">Isolamento: Multi-Tenant por institutionId</div>
              <div className="font-mono text-slate-300">Diretriz: Adição Incremental Não Destrutiva</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white">Gateways &amp; Provedores Conectados:</div>
              <div className="text-slate-300">• Vodacom M-Pesa STK Push API</div>
              <div className="text-slate-300">• Movitel e-Mola Payment API</div>
              <div className="text-slate-300">• Millennium BIM &amp; BCI Extratos Bancários</div>
            </div>
          </div>
        </div>
      )}

      {/* PILAR 8: WHATSAPP CENTER */}
      {activePillar === 'whatsapp' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                WhatsApp Cloud API &amp; Automações Globais
              </h3>
              <p className="text-xs text-slate-400">
                Disparo de recibos, lembretes de propinas e comunicados pedagógicos.
              </p>
            </div>
            <button
              onClick={() => navigate('whatsapp_center')}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              Abrir WhatsApp Center →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Mensagens Enviadas este Mês:</span>
              <strong className="text-white text-sm">18.420 Disparos</strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Taxa de Entrega:</span>
              <strong className="text-emerald-400 text-sm">99.4% Entregues</strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Canais WhatsApp Ativos:</span>
              <strong className="text-cyan-400 text-sm">12 Números Institucionais</strong>
            </div>
          </div>
        </div>
      )}

      {/* PILAR 9: ANALYTICS */}
      {activePillar === 'analytics' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Analytics &amp; Business Intelligence Multi-Institucional
              </h3>
              <p className="text-xs text-slate-400">
                Indicadores consolidados de retenção, matrículas e volume financeiro.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Taxa Média de Retenção Escolar:</span>
              <div className="text-2xl font-black text-emerald-400">94.2%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Arrecadação M-Pesa / e-Mola:</span>
              <div className="text-2xl font-black text-cyan-400">82.5% do total</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Cursos com Maior Procura:</span>
              <div className="text-base font-bold text-white">Programação &amp; Contabilidade</div>
            </div>
          </div>
        </div>
      )}

      {/* PILAR 10: AUDITORIA */}
      {activePillar === 'auditoria' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                Livro-Razão Zero-Trust de Auditoria Governamental
              </h3>
              <p className="text-xs text-slate-400">
                Logs imutáveis de ações de Super Admin, diretores e operadores do sistema.
              </p>
            </div>
            <button
              onClick={() => navigate('auditoria')}
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              Abrir Registro Completo →
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { action: 'Instituição Cadastrada com Código de Acesso', actor: 'Super Admin', inst: 'IPM Maputo', time: 'Há 5 minutos' },
              { action: 'Diploma Homologado no SIVEC', actor: 'Diretor Salvador Mahumane', inst: 'CFTPM', time: 'Há 18 minutos' },
              { action: 'Liquidação de Mensalidade M-Pesa Conciliada', actor: 'Tesouraria', inst: 'CFTPM', time: 'Há 32 minutos' },
              { action: 'Backup Criptográfico Automático Concluído', actor: 'Sistema Reativo', inst: 'Multi-Tenant', time: 'Há 1 hora' },
            ].map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-white block">{log.action}</strong>
                  <span className="text-slate-400 text-[11px]">{log.actor} • {log.inst}</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILAR 11: CONFIGURAÇÕES */}
      {activePillar === 'configuracoes' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                Parâmetros Globais do Sistema Multi-Tenant
              </h3>
              <p className="text-xs text-slate-400">
                Moeda oficial, timezone, idioma e políticas da plataforma.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Moeda Padrão:</span>
              <strong className="text-white text-sm">Metical Moçambicano (MZN / MT)</strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Fuso Horário Oficial:</span>
              <strong className="text-white text-sm">Africa/Maputo (GMT+2:00)</strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Idioma Primário:</span>
              <strong className="text-white text-sm">Português de Moçambique</strong>
            </div>
          </div>
        </div>
      )}

      {/* PILAR 12: SEGURANÇA */}
      {activePillar === 'seguranca' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                Segurança, Controle Criptográfico &amp; Proteção de Dados
              </h3>
              <p className="text-xs text-slate-400">
                Proteção Zero-Trust das chaves do projeto Firebase sigar-6754a e integridade dos códigos de acesso.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Proteção Criptográfica &amp; Códigos de Acesso
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Cada Código de Acesso emitido para o Dono da Instituição é gerado com entropia criptográfica 
                e hash SHA-256 no banco de dados. Permite recuperação segura e revogação instantânea em caso de incidente.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                Autenticação de Dois Fatores (2FA) &amp; RBAC
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Matriz de permissões estrita para Super Admin, Diretor, Secretaria, Financeiro, Docentes e Alunos. 
                Cada perfil enxerga estritamente o seu escopo de dados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
