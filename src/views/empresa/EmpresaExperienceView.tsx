import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Users, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Upload, 
  Download, 
  ChevronRight, 
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  Eye,
  X
} from 'lucide-react';
import { InternshipContract } from '../../types';

interface PartnerCompany {
  id: string;
  name: string;
  nuit: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  activeInternsCount: number;
  sponsoredStudentsCount: number;
  status: 'Ativa' | 'Em Análise' | 'Parceria Formalizada';
}

interface SponsoredCandidate {
  id: string;
  candidateName: string;
  biNumber: string;
  email: string;
  phone: string;
  intendedCourse: string;
  sponsorshipType: 'Bolsa Empresa 100%' | 'Co-participação 50%' | 'Estágio Pré-Contratado';
  submissionDate: string;
  status: 'Inscrito' | 'Em Validação' | 'Matriculado' | 'Recusado';
}

interface CompanyDocument {
  id: string;
  title: string;
  category: 'Acordo de Cooperação' | 'Termo de Estágio' | 'Relatório de Atividades' | 'Comprovativo';
  uploadedAt: string;
  size: string;
  status: 'Homologado' | 'Em Revisão' | 'Pendente Assinatura';
}

interface CompanyMessage {
  id: string;
  sender: 'empresa' | 'instituicao';
  author: string;
  timestamp: string;
  content: string;
  subject?: string;
}

const INITIAL_COMPANIES: PartnerCompany[] = [
  {
    id: 'comp-1',
    name: 'Mozambique LNG Logistics S.A.',
    nuit: '400921882',
    industry: 'Energia & Petróleo',
    contactPerson: 'Dra. Elsa Tembe (Diretora de RH)',
    email: 'rh@moz-lng.co.mz',
    phone: '+258 84 399 2011',
    city: 'Maputo / Afungi',
    activeInternsCount: 4,
    sponsoredStudentsCount: 12,
    status: 'Parceria Formalizada'
  },
  {
    id: 'comp-2',
    name: 'Cervejas de Moçambique (CDM)',
    nuit: '400112998',
    industry: 'Indústria & Automação',
    contactPerson: 'Eng. Carlos Sitoe',
    email: 'estagios@cdm.co.mz',
    phone: '+258 82 450 1199',
    city: 'Marracuene / Maputo',
    activeInternsCount: 3,
    sponsoredStudentsCount: 6,
    status: 'Parceria Formalizada'
  },
  {
    id: 'comp-3',
    name: 'Standard Bank Moçambique IT Ops',
    nuit: '400034112',
    industry: 'Banca & Tecnologia',
    contactPerson: 'Nelson Macamo',
    email: 'talentos@standardbank.co.mz',
    phone: '+258 84 900 8822',
    city: 'Maputo',
    activeInternsCount: 2,
    sponsoredStudentsCount: 5,
    status: 'Ativa'
  }
];

const INITIAL_CANDIDATES: SponsoredCandidate[] = [
  {
    id: 'cand-1',
    candidateName: 'Mateus Armindo Cossa',
    biNumber: '110293847291B',
    email: 'mateus.cossa@gmail.com',
    phone: '+258 84 123 4567',
    intendedCourse: 'Eletromecânica & Manutenção Industrial',
    sponsorshipType: 'Bolsa Empresa 100%',
    submissionDate: '15/09/2026',
    status: 'Matriculado'
  },
  {
    id: 'cand-2',
    candidateName: 'Sheila Esperança Langa',
    biNumber: '109823471029C',
    email: 'sheila.langa@outlook.com',
    phone: '+258 82 998 7766',
    intendedCourse: 'Contabilidade Informatizada & Gestão',
    sponsorshipType: 'Co-participação 50%',
    submissionDate: '18/09/2026',
    status: 'Em Validação'
  },
  {
    id: 'cand-3',
    candidateName: 'Danilo Fausto Mondlane',
    biNumber: '112093846102A',
    email: 'danilo.mondlane@gmail.com',
    phone: '+258 84 555 4321',
    intendedCourse: 'Programação de Sistemas & Redes',
    sponsorshipType: 'Estágio Pré-Contratado',
    submissionDate: '20/09/2026',
    status: 'Inscrito'
  }
];

const INITIAL_DOCS: CompanyDocument[] = [
  {
    id: 'doc-1',
    title: 'Acordo Geral de Cooperação Técnica e Estágios 2026-2028',
    category: 'Acordo de Cooperação',
    uploadedAt: '01/08/2026',
    size: '1.4 MB',
    status: 'Homologado'
  },
  {
    id: 'doc-2',
    title: 'Termo de Compromisso e Plano de Estágio - Turma Mecânica',
    category: 'Termo de Estágio',
    uploadedAt: '12/09/2026',
    size: '840 KB',
    status: 'Homologado'
  },
  {
    id: 'doc-3',
    title: 'Relatório Mensal de Assiduidade e Desempenho - Agosto/2026',
    category: 'Relatório de Atividades',
    uploadedAt: '05/09/2026',
    size: '520 KB',
    status: 'Homologado'
  }
];

const INITIAL_MESSAGES: CompanyMessage[] = [
  {
    id: 'msg-1',
    sender: 'instituicao',
    author: 'Gabinete de Estágios & Inserção Profissional',
    timestamp: '18/09/2026 às 10:15',
    subject: 'Abertura do Ciclo de Estágios do 2º Semestre',
    content: 'Estimados parceiros, informamos que temos 18 formandos concluintes no curso de Eletrotécnica e Redes disponíveis para integração imediata em estágio prático.'
  },
  {
    id: 'msg-2',
    sender: 'empresa',
    author: 'Dra. Elsa Tembe (Mozambique LNG)',
    timestamp: '19/09/2026 às 14:30',
    subject: 'Re: Abertura do Ciclo de Estágios',
    content: 'Boa tarde. Temos interesse em receber 4 formandos para o polo de manutenção em Maputo a partir de Outubro. Segue em anexo a especificação de perfil pretendida.'
  }
];

export const EmpresaExperienceView: React.FC = () => {
  const { activeInstitution, activeBranch, students } = useApp();

  // Abas do Módulo 81 - Experiência da Empresa
  type EmpresaTab = 'dashboard' | 'empresas' | 'candidatos' | 'colaboradores' | 'estagios' | 'documentos' | 'comunicacao';
  const [activeTab, setActiveTab] = useState<EmpresaTab>('dashboard');

  // Estado das Empresas
  const [companies, setCompanies] = useState<PartnerCompany[]>(INITIAL_COMPANIES);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(INITIAL_COMPANIES[0].id);

  // Estado dos Candidatos Indicados
  const [candidates, setCandidates] = useState<SponsoredCandidate[]>(INITIAL_CANDIDATES);
  const [candidateSearch, setCandidateSearch] = useState<string>('');

  // Estado dos Documentos
  const [documents, setDocuments] = useState<CompanyDocument[]>(INITIAL_DOCS);

  // Estado das Mensagens
  const [messages, setMessages] = useState<CompanyMessage[]>(INITIAL_MESSAGES);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [newMessageSubject, setNewMessageSubject] = useState<string>('');

  // Modais
  const [showCompanyModal, setShowCompanyModal] = useState<boolean>(false);
  const [showCandidateModal, setShowCandidateModal] = useState<boolean>(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState<boolean>(false);

  // Form Empresa
  const [compForm, setCompForm] = useState({
    name: '',
    nuit: '',
    industry: 'Tecnologia & Informática',
    contactPerson: '',
    email: '',
    phone: '',
    city: 'Maputo'
  });

  // Form Candidato
  const [candForm, setCandForm] = useState({
    candidateName: '',
    biNumber: '',
    email: '',
    phone: '',
    intendedCourse: 'Programação de Sistemas & Redes',
    sponsorshipType: 'Bolsa Empresa 100%' as SponsoredCandidate['sponsorshipType']
  });

  // Form Documento
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Termo de Estágio' as CompanyDocument['category']
  });

  const activeCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  // Ações de criação
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compForm.name.trim()) return;

    const newComp: PartnerCompany = {
      id: `comp-${Date.now()}`,
      name: compForm.name,
      nuit: compForm.nuit || '400999000',
      industry: compForm.industry,
      contactPerson: compForm.contactPerson || 'Gabinete de RH',
      email: compForm.email || 'contato@empresa.co.mz',
      phone: compForm.phone || '+258 84 000 0000',
      city: compForm.city,
      activeInternsCount: 0,
      sponsoredStudentsCount: 0,
      status: 'Ativa'
    };

    setCompanies([newComp, ...companies]);
    setSelectedCompanyId(newComp.id);
    setShowCompanyModal(false);
    setCompForm({
      name: '',
      nuit: '',
      industry: 'Tecnologia & Informática',
      contactPerson: '',
      email: '',
      phone: '',
      city: 'Maputo'
    });
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candForm.candidateName.trim()) return;

    const newCand: SponsoredCandidate = {
      id: `cand-${Date.now()}`,
      candidateName: candForm.candidateName,
      biNumber: candForm.biNumber || '110099887766A',
      email: candForm.email || 'candidato@empresa.co.mz',
      phone: candForm.phone || '+258 84 000 1122',
      intendedCourse: candForm.intendedCourse,
      sponsorshipType: candForm.sponsorshipType,
      submissionDate: new Date().toLocaleDateString('pt-MZ'),
      status: 'Inscrito'
    };

    setCandidates([newCand, ...candidates]);
    setShowCandidateModal(false);
    setCandForm({
      candidateName: '',
      biNumber: '',
      email: '',
      phone: '',
      intendedCourse: 'Programação de Sistemas & Redes',
      sponsorshipType: 'Bolsa Empresa 100%'
    });
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title.trim()) return;

    const newDoc: CompanyDocument = {
      id: `doc-${Date.now()}`,
      title: docForm.title,
      category: docForm.category,
      uploadedAt: new Date().toLocaleDateString('pt-MZ'),
      size: '640 KB',
      status: 'Em Revisão'
    };

    setDocuments([newDoc, ...documents]);
    setShowDocUploadModal(false);
    setDocForm({
      title: '',
      category: 'Termo de Estágio'
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const msg: CompanyMessage = {
      id: `msg-${Date.now()}`,
      sender: 'empresa',
      author: activeCompany.contactPerson,
      timestamp: `${new Date().toLocaleDateString('pt-MZ')} às ${new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}`,
      subject: newMessageSubject || 'Comunicação Oficial Empresa',
      content: newMessageText
    };

    setMessages([...messages, msg]);
    setNewMessageText('');
    setNewMessageSubject('');
  };

  return (
    <div id="empresa-experience-view" className="space-y-6">

      {/* BREADCRUMBS & IDENTIFICAÇÃO PROFISSIONAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>SIGAR</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Módulo 81</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">Experiência da Empresa &amp; Parcerias</span>
          </nav>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Portal Corporativo &amp; Gestão de Parcerias
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Módulo 81
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão integrada de empresas conveniadas, encaminhamento de candidatos, acompanhamento de estagiários e tramitação documental.
          </p>
        </div>

        {/* SELETOR DE EMPRESA ATIVA */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
          <Building2 className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            aria-label="Selecionar Empresa Parceira"
            className="text-xs font-bold text-slate-800 bg-transparent border-none focus:ring-0 pr-3 cursor-pointer"
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.industry})</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowCompanyModal(true)}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Empresa</span>
          </button>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO DE ABAS INTERNAS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'dashboard', label: 'Painel Geral', icon: Building2 },
          { id: 'candidatos', label: 'Enviar Candidatos', icon: Users, badge: candidates.length },
          { id: 'colaboradores', label: 'Colaboradores Inscritos', icon: Award },
          { id: 'estagios', label: 'Consultar Estágios', icon: Briefcase, badge: activeCompany.activeInternsCount },
          { id: 'documentos', label: 'Enviar Documentos', icon: FileText, badge: documents.length },
          { id: 'comunicacao', label: 'Comunicação Institucional', icon: MessageSquare, badge: messages.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as EmpresaTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DAS ABAS */}

      {/* 1. DASHBOARD GERAL */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI CARDS LIMPOS COM BADGES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Empresa Ativa</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 truncate">{activeCompany.name}</h3>
              <p className="text-xs text-slate-500 mt-1">NUIT: {activeCompany.nuit} • {activeCompany.city}</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Estagiários Ativos</span>
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{activeCompany.activeInternsCount}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Em acompanhamento no polo</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Candidatos Submetidos</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{candidates.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Bolsistas e formandos indicados</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Estado da Parceria</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black">
                {activeCompany.status}
              </span>
              <p className="text-xs text-slate-500 mt-1">{activeCompany.contactPerson}</p>
            </div>
          </div>

          {/* PAINEL DE AÇÕES RÁPIDAS COMERCIAL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => { setActiveTab('candidatos'); setShowCandidateModal(true); }}
              className="p-5 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl shadow-2xs cursor-pointer transition group"
            >
              <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center text-blue-600 group-hover:text-white transition mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Encaminhar Novo Candidato</h4>
              <p className="text-xs text-slate-500 mt-1">
                Inscrever novos formandos patrocinados ou colaboradores em cursos da instituição.
              </p>
            </div>

            <div 
              onClick={() => { setActiveTab('documentos'); setShowDocUploadModal(true); }}
              className="p-5 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl shadow-2xs cursor-pointer transition group"
            >
              <div className="w-10 h-10 bg-emerald-50 group-hover:bg-emerald-600 rounded-xl flex items-center justify-center text-emerald-600 group-hover:text-white transition mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Enviar Documentos &amp; Termos</h4>
              <p className="text-xs text-slate-500 mt-1">
                Protocolar acordos, termos de compromisso de estágio e folhas de frequência.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('comunicacao')}
              className="p-5 bg-white border border-slate-200 hover:border-purple-500 rounded-2xl shadow-2xs cursor-pointer transition group"
            >
              <div className="w-10 h-10 bg-purple-50 group-hover:bg-purple-600 rounded-xl flex items-center justify-center text-purple-600 group-hover:text-white transition mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Falar com a Secretaria &amp; Estágios</h4>
              <p className="text-xs text-slate-500 mt-1">
                Solicitação de novas vagas, agendamento de entrevistas e alinhamento pedagógico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ENVIAR CANDIDATOS */}
      {activeTab === 'candidatos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Candidatos &amp; Bolsistas Indicados</h3>
              <p className="text-xs text-slate-500">
                Lista de candidatos enviados pela empresa para os cursos da instituição.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCandidateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Enviar Candidato</span>
            </button>
          </div>

          {/* TABELA COMERCIAL DE CANDIDATOS */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Candidato</th>
                  <th className="py-3 px-4">Curso Pretendido</th>
                  <th className="py-3 px-4">Tipo de Bolsa / Convénio</th>
                  <th className="py-3 px-4">Data Envio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {candidates.map(cand => (
                  <tr key={cand.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block">{cand.candidateName}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">BI: {cand.biNumber} • {cand.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-medium">{cand.intendedCourse}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                        {cand.sponsorshipType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{cand.submissionDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cand.status === 'Matriculado' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : cand.status === 'Em Validação'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {cand.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        type="button"
                        onClick={() => alert(`Ficha do candidato ${cand.candidateName} em conformidade com o regulamento de bolsas.`)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. COLABORADORES INSCRITOS */}
      {activeTab === 'colaboradores' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Colaboradores da Empresa em Formação</h3>
            <p className="text-xs text-slate-500">
              Acompanhe a assiduidade, turma ativa e aproveitamento dos funcionários inscritos.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Colaborador / Aluno</th>
                  <th className="py-3 px-4">Código SIGAR</th>
                  <th className="py-3 px-4">Curso &amp; Turma</th>
                  <th className="py-3 px-4">Frequência</th>
                  <th className="py-3 px-4">Aproveitamento</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {students.slice(0, 5).map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={st.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'} 
                          alt="" 
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200" 
                        />
                        <div>
                          <strong className="text-slate-900 block">{st.fullName}</strong>
                          <span className="text-[11px] text-slate-500">Colaborador ID #EMP-0{idx + 1}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{st.code}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900 block">{st.courseName}</span>
                      <span className="text-[11px] text-slate-500">Turma: {st.classGroupName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-600">96%</span>
                      <span className="text-[11px] text-slate-400 block">Assíduo</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">16.8 / 20</span>
                      <span className="text-[10px] text-emerald-600 block font-semibold">Excelente</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ativo Regular
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CONSULTAR ESTÁGIOS */}
      {activeTab === 'estagios' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Estágios Curriculares em Acompanhamento</h3>
              <p className="text-xs text-slate-500">
                Formandos acolhidos na empresa com supervisão de estágio e avaliação prática.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              Supervisor na Empresa: {activeCompany.contactPerson}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              {
                studentName: 'Armando Filipe Matsinhe',
                course: 'Mecânica Industrial & Soldadura',
                period: '01/08/2026 a 30/11/2026',
                hoursDone: '240h de 360h',
                department: 'Oficina Central de Manutenção',
                tutor: 'Eng. Carlos Sitoe',
                status: 'Em Andamento'
              },
              {
                studentName: 'Jéssica Beatriz Tembe',
                course: 'Eletrotécnica & Redes de Potência',
                period: '01/08/2026 a 30/11/2026',
                hoursDone: '280h de 360h',
                department: 'Setor de Subestações & Painéis',
                tutor: 'Eng. Carlos Sitoe',
                status: 'Em Andamento'
              }
            ].map((est, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {est.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{est.hoursDone}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{est.studentName}</h4>
                  <p className="text-xs text-slate-600">{est.course}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Setor: <strong>{est.department}</strong> • Tutor: {est.tutor}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-[11px] font-mono">Vigência: {est.period}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Ficha de Avaliação Técnica de ${est.studentName}: Parecer Favorável com Nota Provisória 18/20.`)}
                    className="font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    Avaliar Desempenho
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ENVIAR DOCUMENTOS */}
      {activeTab === 'documentos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Dossiê Documental da Parceria</h3>
              <p className="text-xs text-slate-500">
                Envio e acompanhamento de termos de cooperação, contratos de estágio e pareceres técnicos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDocUploadModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Enviar Documento</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Título do Arquivo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Data de Envio</th>
                  <th className="py-3 px-4">Tamanho</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <strong className="text-slate-900">{doc.title}</strong>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{doc.category}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{doc.uploadedAt}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{doc.size}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.status === 'Homologado'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        type="button"
                        onClick={() => alert(`Download iniciado: ${doc.title}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. COMUNICAR COM INSTITUIÇÃO */}
      {activeTab === 'comunicacao' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Canal Direto de Comunicação Corporativa</h3>
            <p className="text-xs text-slate-500">
              Mensagens diretas com o Gabinete de Parcerias e Inserção Profissional da instituição.
            </p>
          </div>

          {/* HISTÓRICO DE MENSAGENS */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {messages.map(msg => {
              const isEmpresa = msg.sender === 'empresa';
              return (
                <div 
                  key={msg.id} 
                  className={`p-4 rounded-2xl border text-xs space-y-1 ${
                    isEmpresa ? 'bg-blue-50/60 border-blue-200 ml-8' : 'bg-slate-50 border-slate-200 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <strong className="text-slate-900 font-bold">{msg.author}</strong>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>
                  {msg.subject && (
                    <p className="font-bold text-slate-800 text-xs">{msg.subject}</p>
                  )}
                  <p className="text-slate-700 leading-relaxed">{msg.content}</p>
                </div>
              );
            })}
          </div>

          {/* FORM DE RESPOSTA / NOVA MENSAGEM */}
          <form onSubmit={handleSendMessage} className="space-y-3 pt-4 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-700 block">
              Nova Mensagem para a Instituição:
            </label>
            <input
              type="text"
              value={newMessageSubject}
              onChange={(e) => setNewMessageSubject(e.target.value)}
              placeholder="Assunto (ex: Solicitação de estagiários de Mecânica)"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <textarea
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Escreva a sua mensagem ou solicitação..."
                rows={3}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Mensagem</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CADASTRAR EMPRESA */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Empresa Parceira</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCompanyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome da Empresa / Razão Social *</label>
                <input
                  type="text"
                  required
                  value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                  placeholder="Ex: HCB Hidroeléctrica de Cahora Bassa"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NUIT Fiscal</label>
                  <input
                    type="text"
                    value={compForm.nuit}
                    onChange={(e) => setCompForm({ ...compForm, nuit: e.target.value })}
                    placeholder="400123999"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Setor / Ramo</label>
                  <input
                    type="text"
                    value={compForm.industry}
                    onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })}
                    placeholder="Energia, TI, Mineração..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Responsável / RH</label>
                  <input
                    type="text"
                    value={compForm.contactPerson}
                    onChange={(e) => setCompForm({ ...compForm, contactPerson: e.target.value })}
                    placeholder="Nome do interlocutor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cidade / Província</label>
                  <input
                    type="text"
                    value={compForm.city}
                    onChange={(e) => setCompForm({ ...compForm, city: e.target.value })}
                    placeholder="Maputo, Tete, Nampula..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={compForm.email}
                    onChange={(e) => setCompForm({ ...compForm, email: e.target.value })}
                    placeholder="rh@empresa.co.mz"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telefone de Contacto</label>
                  <input
                    type="text"
                    value={compForm.phone}
                    onChange={(e) => setCompForm({ ...compForm, phone: e.target.value })}
                    placeholder="+258 84 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Salvar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENVIAR CANDIDATO */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Encaminhar Candidato da Empresa</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCandidateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Completo do Candidato *</label>
                <input
                  type="text"
                  required
                  value={candForm.candidateName}
                  onChange={(e) => setCandForm({ ...candForm, candidateName: e.target.value })}
                  placeholder="Nome completo conforme BI"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número de BI</label>
                  <input
                    type="text"
                    value={candForm.biNumber}
                    onChange={(e) => setCandForm({ ...candForm, biNumber: e.target.value })}
                    placeholder="110293847291B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telefone</label>
                  <input
                    type="text"
                    value={candForm.phone}
                    onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })}
                    placeholder="+258 84 123 4567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Curso Pretendido</label>
                <input
                  type="text"
                  value={candForm.intendedCourse}
                  onChange={(e) => setCandForm({ ...candForm, intendedCourse: e.target.value })}
                  placeholder="Ex: Eletromecânica, Redes, Gestão..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Modalidade de Apoio</label>
                <select
                  value={candForm.sponsorshipType}
                  onChange={(e) => setCandForm({ ...candForm, sponsorshipType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Bolsa Empresa 100%">Bolsa Empresa 100% (Custos Integrais)</option>
                  <option value="Co-participação 50%">Co-participação 50%</option>
                  <option value="Estágio Pré-Contratado">Estágio Pré-Contratado</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Submeter Candidato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENVIAR DOCUMENTO */}
      {showDocUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Protocolar Documento da Empresa</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDocUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="Ex: Termo de Compromisso de Estágio Assinado"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoria do Documento</label>
                <select
                  value={docForm.category}
                  onChange={(e) => setDocForm({ ...docForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Termo de Estágio">Termo de Estágio</option>
                  <option value="Acordo de Cooperação">Acordo de Cooperação</option>
                  <option value="Relatório de Atividades">Relatório de Atividades</option>
                  <option value="Comprovativo">Comprovativo Financeiro / Seguro</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-1">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">Clique para selecionar o arquivo PDF</p>
                <p className="text-[11px] text-slate-400">PDF, DOCX ou PNG até 10MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDocUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Enviar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmpresaExperienceView;
