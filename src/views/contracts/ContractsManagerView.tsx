import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Save, 
  Printer, 
  Eye, 
  Copy, 
  Check,
  RotateCcw,
  Sliders,
  History,
  FileCheck2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  PenTool,
  ShieldCheck,
  ChevronRight,
  FolderOpen,
  Sparkles,
  Download,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ContractTemplate, GeneratedContract, ContractStatus } from '../../types';
import { ContractPrintDocument } from './ContractPrintDocument';
import { DigitalSignatureModal } from './DigitalSignatureModal';
import { ContractStatusModal } from './ContractStatusModal';
import { TemplateVersionHistoryModal } from './TemplateVersionHistoryModal';
import { NewTemplateModal } from './NewTemplateModal';
import { RecordDetailsModal, DetailField } from '../../components/common/RecordDetailsModal';
import { RecordHistoryModal } from '../../components/common/RecordHistoryModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { EmptyState } from '../../components/common/EmptyState';

export const ContractsManagerView: React.FC = () => {
  const { 
    contractTemplates, 
    generatedContracts,
    saveContractTemplate,
    createContractTemplate,
    updateContractTemplateWithVersion,
    restoreContractTemplateVersion,
    generateContractWithVariables,
    updateContractStatus,
    renewContract,
    signContract,
    students, 
    courses,
    classes,
    activeInstitution 
  } = useApp();

  // Abas de navegação
  const [activeTab, setActiveTab] = useState<'contratos' | 'gerar' | 'modelos'>('contratos');

  const { success, error: toastError } = useToast();

  // Filtros da aba de contratos emitidos
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | ContractStatus>('todos');

  // Estados dos Modais
  const [viewingContract, setViewingContract] = useState<GeneratedContract | null>(null);
  const [viewingContractDetails, setViewingContractDetails] = useState<GeneratedContract | null>(null);
  const [historyContract, setHistoryContract] = useState<GeneratedContract | null>(null);
  const [contractToCancel, setContractToCancel] = useState<GeneratedContract | null>(null);
  const [signingContract, setSigningContract] = useState<{
    contract: GeneratedContract;
    party: 'student' | 'director';
  } | null>(null);
  const [statusModalContract, setStatusModalContract] = useState<GeneratedContract | null>(null);
  const [historyModalTemplate, setHistoryModalTemplate] = useState<ContractTemplate | null>(null);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);

  // Estados do Editor de Modelos (Aba 'modelos')
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate>(
    contractTemplates[0] || {
      id: 'tpl-default',
      name: 'Contrato de Formação',
      title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS',
      type: 'formacao',
      version: 'v1.0',
      updatedAt: '2026-09-15',
      content: 'Minuta oficial do contrato com {{nome_aluno}} para o curso de {{curso}}.',
      isDefault: true,
      versionHistory: []
    }
  );
  const [editedTitle, setEditedTitle] = useState(selectedTemplate.title);
  const [editedContent, setEditedContent] = useState(selectedTemplate.content);
  const [changeNotes, setChangeNotes] = useState('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Estados da Emissão de Contrato (Aba 'gerar')
  const [genSelectedStudentId, setGenSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [genSelectedTemplateId, setGenSelectedTemplateId] = useState<string>(contractTemplates[0]?.id || '');
  const [genCustomVariables, setGenCustomVariables] = useState({
    nome_aluno: '',
    curso: '',
    turma: '',
    valor: '4.500',
    data: new Date().toLocaleDateString('pt-MZ'),
    duracao: '12 Meses (1200 horas)',
    instituicao: activeInstitution.name,
    diretor: 'Eng. Paulo Jafim'
  });
  const [genAutoSignStudent, setGenAutoSignStudent] = useState(true);
  const [genAutoSignDirector, setGenAutoSignDirector] = useState(true);

  // As 8 Variáveis Mandatórias e Complementares
  const requiredTags = [
    { tag: '{{nome_aluno}}', label: 'Nome Completo do Formando' },
    { tag: '{{curso}}', label: 'Nome do Curso de Especialização' },
    { tag: '{{turma}}', label: 'Identificador / Código da Turma' },
    { tag: '{{valor}}', label: 'Valor da Propina / Custo do Contrato' },
    { tag: '{{data}}', label: 'Data de Celebração do Contrato' },
    { tag: '{{duracao}}', label: 'Carga Horária / Período de Vigência' },
    { tag: '{{instituicao}}', label: 'Nome Oficial da Instituição de Ensino' },
    { tag: '{{diretor}}', label: 'Nome do Diretor Geral Homologador' }
  ];

  const optionalTags = [
    { tag: '{{bi}}', label: 'Documento de Identificação (BI/DIRE)' },
    { tag: '{{telefone}}', label: 'Contacto Telefónico' },
    { tag: '{{email}}', label: 'Correio Eletrónico' },
    { tag: '{{endereco}}', label: 'Morada / Domicílio do Formando' },
    { tag: '{{nuit_instituicao}}', label: 'NUIT da Instituição' },
    { tag: '{{endereco_instituicao}}', label: 'Sede da Instituição' }
  ];

  // Quando o aluno muda na aba de geração, atualiza as variáveis padrão
  const handleSelectStudentForGen = (studentId: string) => {
    setGenSelectedStudentId(studentId);
    const st = students.find(s => s.id === studentId);
    if (!st) return;

    const targetCourse = courses.find(c => c.id === st.courseId || c.name === st.courseName);
    const targetClass = classes.find(cl => cl.id === st.classGroupId);

    setGenCustomVariables(prev => ({
      ...prev,
      nome_aluno: st.fullName,
      curso: st.courseName,
      turma: st.classGroupName || targetClass?.name || 'Turma Regular',
      valor: String(targetCourse?.monthlyFee || targetCourse?.feeMonthly || 4500),
      duracao: targetCourse?.duration || '12 Meses (1200 horas)',
      instituicao: activeInstitution.name,
      diretor: 'Eng. Paulo Jafim'
    }));
  };

  // Seleção de template no editor
  const handleSelectTemplate = (tpl: ContractTemplate) => {
    setSelectedTemplate(tpl);
    setEditedTitle(tpl.title);
    setEditedContent(tpl.content);
    setChangeNotes('');
  };

  // Inserir tag no editor
  const handleInsertTag = (tag: string) => {
    setEditedContent(prev => prev + ' ' + tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  // Salvar modelo criando nova versão (REQUISITO: "Não apagar versões anteriores")
  const handleSaveModelWithVersion = () => {
    updateContractTemplateWithVersion(
      selectedTemplate.id,
      {
        title: editedTitle,
        content: editedContent
      },
      changeNotes || 'Atualização de cláusulas e termos do modelo oficial'
    );

    // Atualiza o estado local do template
    const updated = contractTemplates.find(t => t.id === selectedTemplate.id);
    if (updated) {
      setSelectedTemplate(updated);
    }
    setChangeNotes('');
    success('Modelo Atualizado', 'Nova versão do modelo de contrato salva com histórico preservado.');
  };

  // Exportação de contratos em CSV
  const handleExportContractsCsv = () => {
    try {
      const headers = ['Referência', 'Data', 'Formando', 'Curso', 'Turma', 'Duração', 'Valor', 'Estado', 'Assinatura Aluno', 'Assinatura Diretor'];
      const rows = filteredContracts.map(c => [
        `"${c.referenceNumber}"`,
        `"${c.date || c.generatedDate}"`,
        `"${c.studentName.replace(/"/g, '""')}"`,
        `"${c.courseName.replace(/"/g, '""')}"`,
        `"${(c.classGroupName || 'Turma Regular').replace(/"/g, '""')}"`,
        `"${c.duration || '12 Meses'}"`,
        `"${c.valueFormatted || `${c.value} MT`}"`,
        `"${c.status}"`,
        `"${c.signatures?.student?.signed ? 'Assinado' : 'Pendente'}"`,
        `"${c.signatures?.director?.signed ? 'Homologado' : 'Pendente'}"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Contratos_${activeInstitution.code}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('Exportação Concluída', `${filteredContracts.length} contratos exportados para formato CSV.`);
    } catch (err) {
      toastError('Erro na Exportação', 'Não foi possível gerar a folha de contratos.');
    }
  };

  // Executar a emissão automática do contrato com injeção de variáveis
  const handleGenerateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genSelectedStudentId || !genSelectedTemplateId) return;

    const newContract = generateContractWithVariables({
      templateId: genSelectedTemplateId,
      studentId: genSelectedStudentId,
      customVariables: {
        nome_aluno: genCustomVariables.nome_aluno,
        curso: genCustomVariables.curso,
        turma: genCustomVariables.turma,
        valor: genCustomVariables.valor,
        data: genCustomVariables.data,
        duracao: genCustomVariables.duracao,
        instituicao: genCustomVariables.instituicao,
        diretor: genCustomVariables.diretor
      },
      autoSignStudent: genAutoSignStudent,
      autoSignDirector: genAutoSignDirector
    });

    success('Contrato Gerado', `Contrato ${newContract.referenceNumber} emitido com sucesso para ${newContract.studentName}.`);

    // Abre imediatamente o contrato gerado em modal para inspeção / impressão
    setViewingContract(newContract);
    setActiveTab('contratos');
  };

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = generatedContracts.length;
    const ativos = generatedContracts.filter(c => c.status === 'ativo').length;
    const renovados = generatedContracts.filter(c => c.status === 'renovado').length;
    const encerrados = generatedContracts.filter(c => c.status === 'encerrado').length;
    const cancelados = generatedContracts.filter(c => c.status === 'cancelado').length;
    return { total, ativos, renovados, encerrados, cancelados, modelos: contractTemplates.length };
  }, [generatedContracts, contractTemplates]);

  // Contratos filtrados para a listagem
  const filteredContracts = useMemo(() => {
    return generatedContracts.filter(c => {
      const matchesSearch = 
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [generatedContracts, searchTerm, statusFilter]);

  // Helper para cores de badges de estado
  const renderStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'ativo':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ativo</span>
          </span>
        );
      case 'renovado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <RefreshCw className="w-3 h-3" />
            <span>Renovado</span>
          </span>
        );
      case 'encerrado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Check className="w-3 h-3" />
            <span>Encerrado</span>
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            <span>Cancelado</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Executivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-md border border-pink-500/20">
              {activeInstitution.code}
            </span>
            <span className="text-xs text-slate-400">Gabinete Jurídico &amp; Secretaria Acadêmica</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Gestão Integrada de Contratos &amp; Termos Oficiais
          </h1>
          <p className="text-xs text-slate-400">
            Modelos com versionamento imutável, injeção de variáveis, assinaturas digitais, impressão em PDF e controle de ciclo de vida.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportContractsCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer border border-slate-700 transition-all"
            title="Exportar Listagem de Contratos em Planilha CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('gerar')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Gerar Novo Contrato</span>
          </button>
          <button
            onClick={() => setIsNewTemplateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer border border-slate-700 transition-all"
          >
            <FolderOpen className="w-4 h-4 text-pink-400" />
            <span>Novo Modelo</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block">Total Emitidos</span>
          <span className="text-xl font-black text-white">{stats.total}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
          <span className="text-[11px] text-emerald-400 block font-bold">Ativos em Vigor</span>
          <span className="text-xl font-black text-emerald-400">{stats.ativos}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1">
          <span className="text-[11px] text-blue-400 block font-bold">Renovados</span>
          <span className="text-xl font-black text-blue-400">{stats.renovados}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-1">
          <span className="text-[11px] text-purple-400 block font-bold">Encerrados</span>
          <span className="text-xl font-black text-purple-400">{stats.encerrados}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-1">
          <span className="text-[11px] text-red-400 block font-bold">Cancelados</span>
          <span className="text-xl font-black text-red-400">{stats.cancelados}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block">Modelos de Minuta</span>
          <span className="text-xl font-black text-pink-400">{stats.modelos}</span>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('contratos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'contratos'
              ? 'bg-pink-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contratos Emitidos ({generatedContracts.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('gerar');
            if (students[0]) handleSelectStudentForGen(students[0].id);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gerar'
              ? 'bg-pink-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Gerar Contrato com Variáveis</span>
        </button>

        <button
          onClick={() => setActiveTab('modelos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'modelos'
              ? 'bg-pink-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Modelos &amp; Histórico de Versões</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* ABA 1: LISTAGEM DE CONTRATOS EMITIDOS */}
      {/* ========================================================= */}
      {activeTab === 'contratos' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar formando, curso ou ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-pink-500"
              />
            </div>

            {/* Filtro de Estado */}
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Estado:
              </span>
              {(['todos', 'ativo', 'renovado', 'encerrado', 'cancelado'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-pink-500 text-slate-950 shadow-xs'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Tabela de Contratos */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Referência &amp; Data</th>
                    <th className="py-3.5 px-4">Formando &amp; Curso</th>
                    <th className="py-3.5 px-4">Turma &amp; Duração</th>
                    <th className="py-3.5 px-4">Valor</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Assinaturas</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6">
                        <EmptyState
                          title="Nenhum contrato encontrado"
                          description="Não existem contratos emitidos correspondentes aos termos de busca ou filtro de estado selecionados."
                          actionLabel="Gerar Novo Contrato"
                          onAction={() => setActiveTab('gerar')}
                          resetLabel="Limpar Filtros"
                          onReset={() => {
                            setSearchTerm('');
                            setStatusFilter('todos');
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((c) => {
                      const studentSig = c.signatures?.student;
                      const directorSig = c.signatures?.director;

                      return (
                        <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-white block">
                              {c.referenceNumber}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {c.date || c.generatedDate}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">
                              {c.studentName}
                            </span>
                            <span className="text-[11px] text-pink-400 line-clamp-1">
                              {c.courseName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-300 block font-semibold">
                              {c.classGroupName || 'Turma Regular'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {c.duration || '12 Meses'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {c.valueFormatted || `${c.value} MT`}
                          </td>
                          <td className="py-3.5 px-4">
                            {renderStatusBadge(c.status)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 text-[10px]">
                              <span className={studentSig?.signed ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-500 flex items-center gap-1'}>
                                {studentSig?.signed ? '✓ Aluno Assinou' : '○ Aluno Pendente'}
                              </span>
                              <span className={directorSig?.signed ? 'text-blue-400 flex items-center gap-1 font-semibold' : 'text-slate-500 flex items-center gap-1'}>
                                {directorSig?.signed ? '★ Direção Homologou' : '○ Direção Pendente'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Botão Ver Ficha de Detalhes */}
                              <button
                                onClick={() => setViewingContractDetails(c)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                                title="Visualizar Ficha de Detalhes do Contrato"
                              >
                                <Eye className="w-4 h-4 text-sky-400" />
                              </button>

                              {/* Botão Ver / Imprimir PDF */}
                              <button
                                onClick={() => setViewingContract(c)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                                title="Visualizar Minuta e Imprimir PDF"
                              >
                                <Printer className="w-4 h-4 text-pink-400" />
                              </button>

                              {/* Botão Histórico do Contrato */}
                              <button
                                onClick={() => setHistoryContract(c)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                                title="Auditoria e Histórico do Contrato"
                              >
                                <History className="w-4 h-4 text-purple-400" />
                              </button>

                              {/* Botão Assinar se pendente */}
                              {(!studentSig?.signed || !directorSig?.signed) && (
                                <button
                                  onClick={() => setSigningContract({
                                    contract: c,
                                    party: !studentSig?.signed ? 'student' : 'director'
                                  })}
                                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                                  title="Assinar Digitalmente"
                                >
                                  <PenTool className="w-4 h-4" />
                                </button>
                              )}

                              {/* Botão Alterar Estado */}
                              <button
                                onClick={() => setStatusModalContract(c)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                                title="Alterar Estado (Ativo, Renovado, Encerrado, Cancelado)"
                              >
                                <RefreshCw className="w-4 h-4 text-blue-400" />
                              </button>

                              {/* Botão Cancelar / Rescindir Contrato se não cancelado */}
                              {c.status !== 'cancelado' && (
                                <button
                                  onClick={() => setContractToCancel(c)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-all cursor-pointer"
                                  title="Cancelar / Rescindir Contrato"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 2: GERAR CONTRATO COM VARIÁVEIS */}
      {/* ========================================================= */}
      {activeTab === 'gerar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário de Emissão (7 Colunas) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-pink-400 font-bold uppercase">
                Emissão Automatizada
              </span>
              <h3 className="text-base font-black text-white mt-0.5">
                Gerar Contrato para Formando
              </h3>
              <p className="text-xs text-slate-400">
                Preencha os dados e compile as variáveis para emitir o termo formal.
              </p>
            </div>

            <form onSubmit={handleGenerateContract} className="space-y-4">
              {/* Seleção do Formando */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Selecione o Formando Cadastrado:
                </label>
                <select
                  value={genSelectedStudentId}
                  onChange={(e) => handleSelectStudentForGen(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.code}) • {s.courseName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção do Modelo */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Modelo de Contrato a Utilizar:
                </label>
                <select
                  value={genSelectedTemplateId}
                  onChange={(e) => setGenSelectedTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                  required
                >
                  {contractTemplates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.version}) - {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Injeção das 8 Variáveis Requeridas */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block">
                  Variáveis Injetadas na Minuta (Editáveis):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">{'{{nome_aluno}}'}</label>
                    <input
                      type="text"
                      value={genCustomVariables.nome_aluno}
                      onChange={(e) => setGenCustomVariables(prev => ({ ...prev, nome_aluno: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">{'{{curso}}'}</label>
                    <input
                      type="text"
                      value={genCustomVariables.curso}
                      onChange={(e) => setGenCustomVariables(prev => ({ ...prev, curso: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">{'{{turma}}'}</label>
                    <input
                      type="text"
                      value={genCustomVariables.turma}
                      onChange={(e) => setGenCustomVariables(prev => ({ ...prev, turma: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">{'{{valor}}'} (Meticais)</label>
                    <input
                      type="text"
                      value={genCustomVariables.valor}
                      onChange={(e) => setGenCustomVariables(prev => ({ ...prev, valor: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">{'{{data}}'}</label>
                    <input
                      type="text"
                      value={genCustomVariables.data}
                      onChange={(e) => setGenCustomVariables(prev => ({ ...prev, data: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">{'{{duracao}}'}</label>
                    <input
                      type="text"
                      value={genCustomVariables.duracao}
                      onChange={(e) => setGenCustomVariables(prev => ({ ...prev, duracao: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">{'{{instituicao}}'}</label>
                    <input
                      type="text"
                      value={genCustomVariables.instituicao}
                      onChange={(e) => setGenCustomVariables(prev => ({ ...prev, instituicao: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">{'{{diretor}}'}</label>
                    <input
                      type="text"
                      value={genCustomVariables.diretor}
                      onChange={(e) => setGenCustomVariables(prev => ({ ...prev, diretor: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Opções de Assinatura */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                  Homologação e Assinaturas Imediatas:
                </span>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genAutoSignStudent}
                      onChange={(e) => setGenAutoSignStudent(e.target.checked)}
                      className="rounded-md border-slate-700 text-pink-500 focus:ring-pink-500"
                    />
                    <span>Assinar pelo Formando</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genAutoSignDirector}
                      onChange={(e) => setGenAutoSignDirector(e.target.checked)}
                      className="rounded-md border-slate-700 text-pink-500 focus:ring-pink-500"
                    />
                    <span>Homologar com Carimbo da Direção Geral</span>
                  </label>
                </div>
              </div>

              {/* Botão de Submissão */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Compilar e Emitir Contrato Imediatamente</span>
              </button>
            </form>
          </div>

          {/* Prévia ao Vivo das Cláusulas (5 Colunas) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Prévia com Variáveis Compiladas</span>
                </h3>
                <span className="text-[10px] font-mono text-pink-400">Tempo Real</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-serif text-xs leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap">
                {(() => {
                  const tpl = contractTemplates.find(t => t.id === genSelectedTemplateId) || contractTemplates[0];
                  if (!tpl) return 'Nenhum modelo selecionado.';

                  let text = tpl.content;
                  text = text
                    .replace(/{{nome_aluno}}/g, genCustomVariables.nome_aluno || '[NOME_ALUNO]')
                    .replace(/{{curso}}/g, genCustomVariables.curso || '[CURSO]')
                    .replace(/{{turma}}/g, genCustomVariables.turma || '[TURMA]')
                    .replace(/{{valor}}/g, genCustomVariables.valor || '[VALOR]')
                    .replace(/{{data}}/g, genCustomVariables.data || '[DATA]')
                    .replace(/{{duracao}}/g, genCustomVariables.duracao || '[DURACAO]')
                    .replace(/{{instituicao}}/g, genCustomVariables.instituicao || '[INSTITUICAO]')
                    .replace(/{{diretor}}/g, genCustomVariables.diretor || '[DIRETOR]')
                    .replace(/{{bi}}/g, '110100482914B')
                    .replace(/{{codigo_aluno}}/g, 'CFTPM-AL-2026-1042');
                  return text;
                })()}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              O contrato gerado será arquivado no histórico da instituição e associado à ficha pedagógica do formando.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ABA 3: MODELOS & HISTÓRICO DE VERSÕES */}
      {/* ========================================================= */}
      {activeTab === 'modelos' && (
        <div className="space-y-6">
          {/* Seletor de Modelos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {contractTemplates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                  selectedTemplate.id === tpl.id
                    ? 'bg-pink-500/10 border-pink-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white line-clamp-1">{tpl.name}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950 text-pink-400 border border-pink-500/20">
                    {tpl.version}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{tpl.title}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  <span>Atualizado: {tpl.updatedAt}</span>
                  <span className="text-emerald-400">
                    {tpl.versionHistory?.length || 1} versões guardadas
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Barra de Variáveis Rápidas para Inserir */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 block">
                Variáveis Obrigatórias (Clique para Inserir no Editor):
              </span>
              {copiedTag && (
                <span className="text-xs text-emerald-400 font-bold animate-fade-in">
                  ✓ Tag {copiedTag} inserida no texto!
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {requiredTags.map(({ tag, label }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-pink-400 text-xs font-mono text-pink-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5"
                  title={label}
                >
                  <span>{tag}</span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">({label})</span>
                </button>
              ))}
            </div>

            {/* Tags Opcionais */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-semibold self-center mr-1">Outras:</span>
              {optionalTags.map(({ tag, label }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer transition-all"
                  title={label}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Divisão: Editor à Esquerda e Prévia à Direita */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor de Código-Fonte do Modelo */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-pink-400" />
                  <h3 className="text-sm font-bold text-white">
                    Editor de Cláusulas ({selectedTemplate.name})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Botão para abrir Histórico de Versões */}
                  <button
                    type="button"
                    onClick={() => setHistoryModalTemplate(selectedTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer transition-all"
                  >
                    <History className="w-3.5 h-3.5 text-pink-400" />
                    <span>Ver Histórico de Versões</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Título Formal do Documento (Cabeçalho)
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-hidden focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Corpo das Cláusulas &amp; Termos Contratuais
                  </label>
                  <textarea
                    rows={13}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs leading-relaxed focus:outline-hidden focus:border-pink-500 resize-none"
                  />
                </div>

                {/* Registro de Notas da Nova Versão (Preserva anteriores) */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block">
                    Notas da Nova Versão (Justificativa da Alteração):
                  </label>
                  <input
                    type="text"
                    value={changeNotes}
                    onChange={(e) => setChangeNotes(e.target.value)}
                    placeholder="Ex: Atualização do prazo de cancelamento e inclusão do diretor geral homologador..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-pink-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    A versão anterior será arquivada no histórico sem ser apagada.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveModelWithVersion}
                  className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Nova Versão no Modelo (Preservar Anteriores)</span>
                </button>
              </div>
            </div>

            {/* Prévia Compilada com Aluno de Teste */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Pré-visualização Instantânea da Minuta</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Versão Atual: {selectedTemplate.version}
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner overflow-y-auto max-h-[460px]">
                  <div className="text-center border-b border-slate-800 pb-4 mb-4">
                    <div className="text-[10px] font-mono text-pink-400 font-bold tracking-wider uppercase">
                      {activeInstitution.name} • SIVEC JURÍDICO
                    </div>
                    <h4 className="text-sm font-black text-white mt-1 uppercase tracking-tight">
                      {editedTitle}
                    </h4>
                  </div>

                  <pre className="text-xs text-slate-200 font-serif leading-relaxed whitespace-pre-wrap">
                    {editedContent
                      .replace(/{{nome_aluno}}/g, students[0]?.fullName || 'Arnaldo Tomás Mabunda')
                      .replace(/{{curso}}/g, students[0]?.courseName || 'Engenharia de Software')
                      .replace(/{{turma}}/g, students[0]?.classGroupName || 'Turma ES-2026-A')
                      .replace(/{{valor}}/g, '4.500,00')
                      .replace(/{{data}}/g, new Date().toLocaleDateString('pt-MZ'))
                      .replace(/{{duracao}}/g, '12 Meses (1200 horas)')
                      .replace(/{{instituicao}}/g, activeInstitution.name)
                      .replace(/{{diretor}}/g, 'Eng. Paulo Jafim')
                      .replace(/{{bi}}/g, students[0]?.documentNumber || '110100482914B')
                      .replace(/{{telefone}}/g, students[0]?.phone || '+258 84 391 8201')}
                  </pre>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span>Válido sob a legislação moçambicana de formação profissional.</span>
                <span className="font-mono text-pink-400 font-semibold">SIGAR LEGAL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE IMPRESSÃO / PDF DO CONTRATO */}
      {/* ========================================================= */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="w-full max-w-5xl my-auto">
            <ContractPrintDocument
              contract={viewingContract}
              institution={activeInstitution}
              onClose={() => setViewingContract(null)}
              onSign={(party) => {
                const target = viewingContract;
                setViewingContract(null);
                setSigningContract({ contract: target, party });
              }}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE ASSINATURA DIGITAL */}
      {/* ========================================================= */}
      {signingContract && (
        <DigitalSignatureModal
          isOpen={true}
          onClose={() => setSigningContract(null)}
          contractTitle={signingContract.contract.templateName || 'Contrato Oficial'}
          contractRef={signingContract.contract.referenceNumber}
          signerParty={signingContract.party}
          defaultSignerName={
            signingContract.party === 'student'
              ? signingContract.contract.studentName
              : (signingContract.contract.directorName || 'Eng. Paulo Jafim')
          }
          defaultDocumentNumber={
            signingContract.party === 'student'
              ? signingContract.contract.studentDocumentNumber
              : 'Direção Geral SIVEC'
          }
          onConfirmSignature={(details) => {
            signContract(signingContract.contract.id, signingContract.party, details);
            setSigningContract(null);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL DE ALTERAÇÃO DE ESTADO & RENOVAÇÃO */}
      {/* ========================================================= */}
      {statusModalContract && (
        <ContractStatusModal
          isOpen={true}
          onClose={() => setStatusModalContract(null)}
          contract={statusModalContract}
          onUpdateStatus={(id, st, reason) => {
            updateContractStatus(id, st, reason);
            setStatusModalContract(null);
          }}
          onRenewContract={(id, dur, val, notes) => {
            renewContract(id, dur, val, notes);
            setStatusModalContract(null);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL DE HISTÓRICO DE VERSÕES ("Não apagar versões anteriores") */}
      {/* ========================================================= */}
      {historyModalTemplate && (
        <TemplateVersionHistoryModal
          isOpen={true}
          onClose={() => setHistoryModalTemplate(null)}
          template={historyModalTemplate}
          onRestoreVersion={(tplId, version) => {
            restoreContractTemplateVersion(tplId, version);
            const reloaded = contractTemplates.find(t => t.id === tplId);
            if (reloaded) {
              setSelectedTemplate(reloaded);
              setEditedTitle(reloaded.title);
              setEditedContent(reloaded.content);
            }
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL DE NOVO MODELO DE CONTRATO */}
      {/* ========================================================= */}
      {isNewTemplateModalOpen && (
        <NewTemplateModal
          isOpen={isNewTemplateModalOpen}
          onClose={() => setIsNewTemplateModalOpen(false)}
          onCreateTemplate={(data) => {
            const newId = createContractTemplate(data);
            const created = contractTemplates.find(t => t.id === newId);
            if (created) {
              setSelectedTemplate(created);
              setEditedTitle(created.title);
              setEditedContent(created.content);
            }
          }}
          availableTags={requiredTags}
        />
      )}

      {/* RecordDetailsModal - Visualização Completa da Ficha do Contrato */}
      <RecordDetailsModal
        isOpen={!!viewingContractDetails}
        onClose={() => setViewingContractDetails(null)}
        title={viewingContractDetails?.templateName || 'Contrato de Prestação de Serviços'}
        subtitle={viewingContractDetails ? `${viewingContractDetails.studentName} • ${viewingContractDetails.courseName}` : ''}
        code={viewingContractDetails?.referenceNumber}
        statusBadge={
          viewingContractDetails && renderStatusBadge(viewingContractDetails.status)
        }
        fields={viewingContractDetails ? [
          { label: 'Número de Referência', value: viewingContractDetails.referenceNumber },
          { label: 'Nome do Formando', value: viewingContractDetails.studentName },
          { label: 'Documento (BI / DIRE)', value: viewingContractDetails.studentDocumentNumber || 'Não informado' },
          { label: 'Curso de Especialização', value: viewingContractDetails.courseName },
          { label: 'Turma Atribuída', value: viewingContractDetails.classGroupName || 'Turma Regular' },
          { label: 'Período de Vigência / Duração', value: viewingContractDetails.duration || '12 Meses' },
          { label: 'Valor da Propina / Custo', value: viewingContractDetails.valueFormatted || `${viewingContractDetails.value} MT` },
          { label: 'Data de Celebração', value: viewingContractDetails.date || viewingContractDetails.generatedDate },
          { label: 'Instituição Outorgante', value: (viewingContractDetails as any).variables?.instituicao || activeInstitution.name },
          { label: 'Diretor Homologador', value: viewingContractDetails.directorName || (viewingContractDetails as any).variables?.diretor || 'Eng. Paulo Jafim' },
          { 
            label: 'Assinatura do Formando', 
            value: viewingContractDetails.signatures?.student?.signed 
              ? `Assinado em ${new Date(viewingContractDetails.signatures.student.signedAt || (viewingContractDetails.signatures.student as any).timestamp || Date.now()).toLocaleDateString('pt-MZ')} (${viewingContractDetails.signatures.student.signerName})`
              : 'Pendente de assinatura'
          },
          { 
            label: 'Homologação da Direção Geral', 
            value: viewingContractDetails.signatures?.director?.signed 
              ? `Homologado em ${new Date(viewingContractDetails.signatures.director.signedAt || (viewingContractDetails.signatures.director as any).timestamp || Date.now()).toLocaleDateString('pt-MZ')} (${viewingContractDetails.signatures.director.signerName})`
              : 'Pendente de homologação'
          }
        ] : []}
        onEdit={() => {
          const c = viewingContractDetails;
          setViewingContractDetails(null);
          if (c) setStatusModalContract(c);
        }}
        onViewHistory={() => {
          const c = viewingContractDetails;
          setViewingContractDetails(null);
          if (c) setHistoryContract(c);
        }}
        onDelete={
          viewingContractDetails && viewingContractDetails.status !== 'cancelado' 
            ? () => {
                const c = viewingContractDetails;
                setViewingContractDetails(null);
                setContractToCancel(c);
              }
            : undefined
        }
      />

      {/* RecordHistoryModal - Histórico & Auditoria do Contrato */}
      <RecordHistoryModal
        isOpen={!!historyContract}
        onClose={() => setHistoryContract(null)}
        entityName={historyContract ? `Contrato ${historyContract.referenceNumber} (${historyContract.studentName})` : 'Contrato'}
        entityId={historyContract?.id || ''}
      />

      {/* ConfirmationModal - Cancelamento / Rescisão */}
      <ConfirmationModal
        isOpen={!!contractToCancel}
        onCancel={() => setContractToCancel(null)}
        title="Cancelar / Rescindir Contrato Oficial"
        message={`Tem certeza que deseja rescindir e cancelar o contrato "${contractToCancel?.referenceNumber}" do formando "${contractToCancel?.studentName}"? O contrato ficará gravado no arquivo histórico com o estado cancelado.`}
        confirmText="Sim, Cancelar Contrato"
        cancelText="Voltar"
        variant="danger"
        requiredConfirmationWord="CANCELAR"
        onConfirm={() => {
          if (contractToCancel) {
            updateContractStatus(contractToCancel.id, 'cancelado', 'Cancelamento homologado pela administração');
            success('Contrato Cancelado', `O contrato ${contractToCancel.referenceNumber} foi cancelado com sucesso.`);
            setContractToCancel(null);
          }
        }}
      />
    </div>
  );
};
