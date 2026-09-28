import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Layers, 
  Globe,
  ExternalLink, 
  ArrowUpRight, 
  CheckCircle2, 
  Search,
  School,
  Database,
  KeyRound,
  Activity,
  MapPin,
  Share2,
  Settings,
  X,
  FileCode2,
  Check,
  AlertCircle,
  FolderTree,
  Zap,
  Upload,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Institution } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const { 
    allInstitutions, 
    navigate, 
    setActiveInstitution, 
    updateInstitution,
    addBranch
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstForConfig, setSelectedInstForConfig] = useState<Institution | null>(null);
  const [configTab, setConfigTab] = useState<'filiais' | 'prefixos' | 'bancos' | 'whatsapp'>('filiais');

  // New branch form state in modal
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');

  // Prefix form state in modal
  const [prefixStudent, setPrefixStudent] = useState('');
  const [prefixCert, setPrefixCert] = useState('');
  const [prefixReceipt, setPrefixReceipt] = useState('');
  const [prefixContract, setPrefixContract] = useState('');

  // Bank account form state
  const [newBankName, setNewBankName] = useState('Millennium BIM');
  const [newAccountNum, setNewAccountNum] = useState('');
  const [newNIB, setNewNIB] = useState('');
  const [newHolder, setNewHolder] = useState('');

  const handleOpenConfig = (inst: Institution) => {
    setSelectedInstForConfig(inst);
    setPrefixStudent(inst.prefixes?.studentPrefix || `ALU-${inst.code}`);
    setPrefixCert(inst.prefixes?.certificatePrefix || `CERT-${inst.code}`);
    setPrefixReceipt(inst.prefixes?.receiptPrefix || `REC-${inst.code}`);
    setPrefixContract(inst.prefixes?.contractPrefix || `CTR-${inst.code}`);
    setConfigTab('filiais');
  };

  const handleEnterInstitution = (inst: Institution) => {
    setActiveInstitution(inst);
    navigate('centro_dashboard');
  };

  const filteredInstitutions = allInstitutions.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = allInstitutions.reduce((acc, i) => acc + (i.totalStudents || 0), 0);
  const totalTeachers = allInstitutions.reduce((acc, i) => acc + (i.totalTeachers || 0), 0);
  const totalBranches = allInstitutions.reduce((acc, i) => acc + (i.branches?.length || 1), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            Moztechwave Core • Super Admin
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Painel Central de Gestão Multi-Institucional
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Controle global de centros de formação, escolas conveniadas, delegações provinciais, isolamento estrito de dados e configurações independentes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('sistema_planos')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/20 cursor-pointer transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>63. Sistema de Planos</span>
          </button>
          <button
            onClick={() => navigate('integracoes_futuras')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>64. Integrações Hub</span>
          </button>
          <button
            onClick={() => navigate('principio_fundamental')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/20 cursor-pointer transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>65. Princípio Fundamental</span>
          </button>
          <button
            onClick={() => navigate('estrutura_pastas')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/20 cursor-pointer transition-all"
          >
            <FolderTree className="w-4 h-4" />
            <span>66. Estrutura</span>
          </button>
          <button
            onClick={() => navigate('regras_desenvolvimento')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-700/20 cursor-pointer transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>67. Regras QA</span>
          </button>
          <button
            onClick={() => navigate('migracao_dados')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>68/69. Migração</span>
          </button>
          <button
            onClick={() => navigate('superioridade_integrada')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>70. Superioridade Integrada</span>
          </button>
          <button
            onClick={() => navigate('fluxo_conclusao')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Award className="w-4 h-4" />
            <span>71. Conclusão</span>
          </button>
          <button
            onClick={() => navigate('fluxo_pagamento')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/20 cursor-pointer transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>72. Pagamento</span>
          </button>
          <button
            onClick={() => navigate('fluxo_sivec')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>73. SIVEC</span>
          </button>
          <button
            onClick={() => navigate('experiencia_superadmin')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/20 cursor-pointer transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>74. Super Admin (12 Pilares)</span>
          </button>
          <button
            onClick={() => navigate('admin_cadastrar')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Instituição</span>
          </button>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Instituições Conectadas</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{allInstitutions.length}</div>
          <p className="text-[11px] text-emerald-400 font-medium">Dados 100% Isolados por Tenant</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filiais &amp; Delegações</span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalBranches}</div>
          <p className="text-[11px] text-amber-400 font-medium">Permissões e caixas por filial</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alunos no Ecossistema</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalStudents.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Em todo o território moçambicano</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Docentes &amp; Formadores</span>
            <School className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalTeachers} Formadores</div>
          <p className="text-[11px] text-emerald-400">Certificados pelo SIVERC</p>
        </div>
      </div>

      {/* Directory of Institutions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Diretório de Instituições &amp; Centros Moztechwave</h3>
            <p className="text-xs text-slate-400">
              Cada centro opera em ambiente autônomo com logotipo, prefixos, contas financeiras e WhatsApp independentes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar instituição ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500 w-64"
              />
            </div>
            <button
              onClick={() => navigate('admin_cadastrar')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Centro</span>
            </button>
          </div>
        </div>

        {/* Institution Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInstitutions.map((inst) => (
            <div
              key={inst.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {inst.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {inst.branches?.length || 1} Filial(is)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {inst.plan}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    {inst.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {inst.province} • {inst.city}
                  </p>
                </div>

                {/* Independent Config Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                  <span className={`px-2 py-0.5 rounded-md font-bold border ${
                    inst.plan === 'ENTERPRISE' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                    inst.plan === 'EMPRESARIAL' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                    inst.plan === 'PROFISSIONAL' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                    'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}>
                    Plano {inst.plan || 'BÁSICO'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    Matrícula: {inst.prefixes?.studentPrefix || `ALU-${inst.code}`}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    Certificado: {inst.prefixes?.certificatePrefix || `CERT-${inst.code}`}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span>Responsável:</span>
                    <span className="text-slate-200 font-medium">{inst.representativeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alunos Ativos:</span>
                    <span className="text-emerald-400 font-bold">{inst.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contas Bancárias:</span>
                    <span className="text-sky-400 font-mono font-medium">
                      {inst.bankAccounts?.length || 0} Registradas
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>WhatsApp Próprio:</span>
                    <span className={`font-medium ${
                      inst.whatsappConfig?.status === 'connected' ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {inst.whatsappConfig?.status === 'connected' ? '● Conectado' : 'Configurado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => handleOpenConfig(inst)}
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 cursor-pointer transition-all"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>Configurar</span>
                </button>
                <button
                  onClick={() => navigate('sistema_planos')}
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 hover:text-white text-[11px] font-semibold border border-purple-500/40 cursor-pointer transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Plano &amp; Quotas</span>
                </button>
                <button
                  onClick={() => handleEnterInstitution(inst)}
                  className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold cursor-pointer transition-all shadow-md"
                >
                  <span>Painel</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SIVEC Connect Compatibility Architecture */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          SIVEC Connect • Filosofia Multi-Sistema &amp; Multi-Tenant
        </div>
        <h3 className="text-base font-bold text-white">
          Isolamento Criptográfico e Autonomia Institucional
        </h3>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Cada instituição no Moztechwave opera com esquemas isolados de alunos, cursos, avaliações, carnês de mensalidades, portaria e templates de certificados. Nenhum operador de uma instituição possui permissão para visualizar dados ou relatórios de outro centro conveniado.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => navigate('sivec_verify')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold cursor-pointer border border-slate-700"
          >
            Ver Validador Público SIVERC
          </button>
          <button
            onClick={() => navigate('studio')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold cursor-pointer border border-slate-700"
          >
            Abrir Document Studio
          </button>
        </div>
      </div>

      {/* MODAL: Independent Institution Configuration */}
      {selectedInstForConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-bold text-white">{selectedInstForConfig.name}</h3>
                  <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                    {selectedInstForConfig.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configurações Independentes de Multi-Instituição &amp; Filiais
                </p>
              </div>
              <button
                onClick={() => setSelectedInstForConfig(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 px-5 bg-slate-950/60">
              <button
                onClick={() => setConfigTab('filiais')}
                className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  configTab === 'filiais'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📍 Filiais &amp; Delegações ({selectedInstForConfig.branches?.length || 0})
              </button>
              <button
                onClick={() => setConfigTab('prefixos')}
                className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  configTab === 'prefixos'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                🔤 Prefixos &amp; Numeração
              </button>
              <button
                onClick={() => setConfigTab('bancos')}
                className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  configTab === 'bancos'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                💳 Contas Bancárias ({selectedInstForConfig.bankAccounts?.length || 0})
              </button>
              <button
                onClick={() => setConfigTab('whatsapp')}
                className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  configTab === 'whatsapp'
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📱 WhatsApp Próprio
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* TAB 1: FILIAIS */}
              {configTab === 'filiais' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Filiais e Delegações Cadastradas</h4>
                    <span className="text-xs text-slate-400">Cada filial possui registros e caixas próprios</span>
                  </div>

                  <div className="space-y-2">
                    {selectedInstForConfig.branches?.map((branch) => (
                      <div
                        key={branch.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{branch.name}</span>
                            <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                              {branch.code}
                            </span>
                            {branch.isMainBranch && (
                              <span className="text-[10px] bg-sky-500/10 text-sky-400 font-semibold px-1.5 py-0.5 rounded">
                                Sede Principal
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {branch.city}, {branch.province} • Tel: {branch.phone}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Ativa
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add branch form */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      + Adicionar Nova Filial
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nome da Filial *</label>
                        <input
                          type="text"
                          placeholder="Ex: Delegação da Matola"
                          value={newBranchName}
                          onChange={(e) => setNewBranchName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Código *</label>
                        <input
                          type="text"
                          placeholder="Ex: MAT-01"
                          value={newBranchCode}
                          onChange={(e) => setNewBranchCode(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cidade</label>
                        <input
                          type="text"
                          placeholder="Ex: Matola"
                          value={newBranchCity}
                          onChange={(e) => setNewBranchCity(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Telefone</label>
                        <input
                          type="text"
                          placeholder="+258 84 000 0000"
                          value={newBranchPhone}
                          onChange={(e) => setNewBranchPhone(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBranchName.trim() || !newBranchCode.trim()) return;
                        const newBranchItem = {
                          id: `branch-${Date.now()}`,
                          institutionId: selectedInstForConfig.id,
                          name: newBranchName.trim(),
                          code: newBranchCode.trim().toUpperCase(),
                          city: newBranchCity.trim() || selectedInstForConfig.city,
                          province: selectedInstForConfig.province,
                          address: 'Endereço da delegação local',
                          phone: newBranchPhone.trim() || selectedInstForConfig.phone,
                          isMainBranch: false,
                          status: 'active' as const,
                          createdAt: new Date().toISOString()
                        };
                        const updatedBranches = [...(selectedInstForConfig.branches || []), newBranchItem];
                        updateInstitution(selectedInstForConfig.id, { branches: updatedBranches });
                        setSelectedInstForConfig({
                          ...selectedInstForConfig,
                          branches: updatedBranches
                        });
                        setNewBranchName('');
                        setNewBranchCode('');
                        setNewBranchCity('');
                        setNewBranchPhone('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Salvar Filial
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PREFIXOS */}
              {configTab === 'prefixos' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Prefixos de Numeração Independentes</h4>
                    <p className="text-xs text-slate-400">
                      Garante que cada instituição emita matrículas, certificados e recibos com identificador próprio.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Prefixo de Alunos / Matrícula
                      </label>
                      <input
                        type="text"
                        value={prefixStudent}
                        onChange={(e) => setPrefixStudent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-sky-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Ex: {prefixStudent}-2025-001</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Prefixo de Certificados SIVERC
                      </label>
                      <input
                        type="text"
                        value={prefixCert}
                        onChange={(e) => setPrefixCert(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-sky-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Ex: {prefixCert}-2025-00042</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Prefixo de Recibos &amp; Carnês
                      </label>
                      <input
                        type="text"
                        value={prefixReceipt}
                        onChange={(e) => setPrefixReceipt(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-sky-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Ex: {prefixReceipt}-00891</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Prefixo de Contratos Formativos
                      </label>
                      <input
                        type="text"
                        value={prefixContract}
                        onChange={(e) => setPrefixContract(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-sky-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Ex: {prefixContract}-2025-019</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updatedPrefixes = {
                        studentPrefix: prefixStudent.trim(),
                        certificatePrefix: prefixCert.trim(),
                        receiptPrefix: prefixReceipt.trim(),
                        contractPrefix: prefixContract.trim()
                      };
                      updateInstitution(selectedInstForConfig.id, { prefixes: updatedPrefixes });
                      setSelectedInstForConfig({
                        ...selectedInstForConfig,
                        prefixes: updatedPrefixes
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    Salvar Prefixos da Instituição
                  </button>
                </div>
              )}

              {/* TAB 3: CONTAS BANCÁRIAS */}
              {configTab === 'bancos' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Contas Financeiras Independentes</h4>
                    <p className="text-xs text-slate-400">
                      Contas e carteiras móveis (M-Pesa / e-Mola) específicas impressas nos carnês A4 desta instituição.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {selectedInstForConfig.bankAccounts?.map((account) => (
                      <div
                        key={account.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{account.bankName}</span>
                            <span className="font-mono text-xs text-emerald-400 font-bold">{account.accountNumber}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            NIB: <span className="font-mono text-slate-300">{account.nib}</span> • Titular: {account.accountHolder}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const updated = selectedInstForConfig.bankAccounts.filter(a => a.id !== account.id);
                            updateInstitution(selectedInstForConfig.id, { bankAccounts: updated });
                            setSelectedInstForConfig({ ...selectedInstForConfig, bankAccounts: updated });
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add bank form */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      + Adicionar Nova Conta Bancária ou Carteira Móvel
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Banco / Serviço</label>
                        <select
                          value={newBankName}
                          onChange={(e) => setNewBankName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="Millennium BIM">Millennium BIM</option>
                          <option value="BCI - Fomento">BCI - Fomento</option>
                          <option value="Standard Bank Moçambique">Standard Bank Moçambique</option>
                          <option value="Absa Bank Moçambique">Absa Bank Moçambique</option>
                          <option value="M-Pesa Vodacom">M-Pesa Vodacom</option>
                          <option value="e-Mola Movitel">e-Mola Movitel</option>
                          <option value="mKesh Tmcel">mKesh Tmcel</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Número da Conta / Telefone</label>
                        <input
                          type="text"
                          placeholder="Ex: 123456789 ou 840000000"
                          value={newAccountNum}
                          onChange={(e) => setNewAccountNum(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">NIB (21 Dígitos)</label>
                        <input
                          type="text"
                          placeholder="0001 0000 0000 0000 0000 0"
                          value={newNIB}
                          onChange={(e) => setNewNIB(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Titular da Conta</label>
                        <input
                          type="text"
                          placeholder="Nome institucional registrado"
                          value={newHolder}
                          onChange={(e) => setNewHolder(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newAccountNum.trim()) return;
                        const newAcc = {
                          id: `bank-${Date.now()}`,
                          bankName: newBankName,
                          accountNumber: newAccountNum.trim(),
                          nib: newNIB.trim() || '0000 0000 0000 0000 0000 0',
                          accountHolder: newHolder.trim() || selectedInstForConfig.name,
                          isActive: true
                        };
                        const updated = [...(selectedInstForConfig.bankAccounts || []), newAcc];
                        updateInstitution(selectedInstForConfig.id, { bankAccounts: updated });
                        setSelectedInstForConfig({ ...selectedInstForConfig, bankAccounts: updated });
                        setNewAccountNum('');
                        setNewNIB('');
                        setNewHolder('');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Cadastrar Conta
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: WHATSAPP */}
              {configTab === 'whatsapp' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Instância WhatsApp Independente</h4>
                    <p className="text-xs text-slate-400">
                      Cada instituição pode conectar seu próprio número ou chip local para envio automático de cobranças, avisos de faltas e certificados.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">
                          Status: {selectedInstForConfig.whatsappConfig?.status === 'connected' ? '● Conectado' : 'Pronto para emparelhar'}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        {selectedInstForConfig.whatsappConfig?.phoneNumber || selectedInstForConfig.phone}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Avisos de Aniversário:</span>
                        <span className="text-emerald-400 font-bold">Ativado (08:00 AM)</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Lembrete de Mensalidade:</span>
                        <span className="text-sky-400 font-bold">Ativado (Dia 28)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xs text-slate-400">
                Alterações aplicadas instantaneamente ao tenant.
              </span>
              <button
                onClick={() => setSelectedInstForConfig(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
