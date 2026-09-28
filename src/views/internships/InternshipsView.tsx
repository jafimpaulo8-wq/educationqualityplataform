import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  BookOpen,
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Printer, 
  Download, 
  ChevronRight, 
  Sliders, 
  Edit3, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  Stamp,
  Phone,
  Mail,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  InternshipContract, 
  InternshipStatus, 
  InternshipEvaluation, 
  InternshipDocumentType 
} from '../../types';

export const InternshipsView: React.FC = () => {
  const { 
    internships, 
    addInternship, 
    updateInternship, 
    deleteInternship, 
    evaluateInternship, 
    changeInternshipStatus,
    students, 
    courses, 
    teachers, 
    activeInstitution, 
    activeBranch,
    activeRole,
    addNotification
  } = useApp();

  // Filtros
  const [selectedStatus, setSelectedStatus] = useState<'todos' | InternshipStatus>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<InternshipContract | null>(null);

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [evaluatingInternship, setEvaluatingInternship] = useState<InternshipContract | null>(null);

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDocInternship, setSelectedDocInternship] = useState<InternshipContract | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<InternshipDocumentType>('termo_compromisso');

  // Estado do formulário de criação/edição
  const [formData, setFormData] = useState<{
    studentId: string;
    companyName: string;
    companyNuit: string;
    companySector: string;
    companyPhone: string;
    companyEmail: string;
    companyAddress: string;
    companyCity: string;
    companySupervisor: string;
    companySupervisorRole: string;
    academicSupervisor: string;
    startDate: string;
    endDate: string;
    workloadHours: number;
    location: string;
    activities: string;
    status: InternshipStatus;
  }>({
    studentId: students[0]?.id || '',
    companyName: '',
    companyNuit: '',
    companySector: '',
    companyPhone: '',
    companyEmail: '',
    companyAddress: '',
    companyCity: 'Maputo Cidade',
    companySupervisor: '',
    companySupervisorRole: 'Supervisor Técnico',
    academicSupervisor: teachers[0]?.fullName || 'Docente Orientador',
    startDate: '2026-04-01',
    endDate: '2026-07-31',
    workloadHours: 320,
    location: '',
    activities: '',
    status: 'procurando'
  });

  // Estado do formulário de avaliação
  const [evaluationForm, setEvaluationForm] = useState<{
    score: number;
    attendanceScore: number;
    technicalSkillsScore: number;
    professionalConductScore: number;
    technicalFeedback: string;
    recommendation: 'Aprovado com Distinção' | 'Aprovado' | 'Reprovado' | 'Pendente';
    companySupervisorName: string;
    academicSupervisorName: string;
  }>({
    score: 16.0,
    attendanceScore: 17.0,
    technicalSkillsScore: 16.0,
    professionalConductScore: 17.0,
    technicalFeedback: 'O formando apresentou excelente dedicação técnica, pontualidade e facilidade de integração.',
    recommendation: 'Aprovado',
    companySupervisorName: '',
    academicSupervisorName: teachers[0]?.fullName || 'Docente Orientador'
  });

  // Lista filtrada
  const filteredInternships = useMemo(() => {
    return internships.filter(item => {
      const matchStatus = selectedStatus === 'todos' || item.status === selectedStatus;
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        item.studentName.toLowerCase().includes(term) ||
        item.company.name.toLowerCase().includes(term) ||
        item.supervisor.companySupervisor.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [internships, selectedStatus, searchTerm]);

  // Contadores por estado
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: internships.length,
      pendente: 0,
      procurando: 0,
      atribuído: 0,
      'em andamento': 0,
      concluído: 0,
      cancelado: 0
    };
    internships.forEach(item => {
      if (counts[item.status] !== undefined) {
        counts[item.status] += 1;
      }
    });
    return counts;
  }, [internships]);

  // Abertura do Modal de Cadastro / Edição
  const handleOpenCreateModal = () => {
    setEditingInternship(null);
    setFormData({
      studentId: students[0]?.id || '',
      companyName: '',
      companyNuit: '',
      companySector: '',
      companyPhone: '',
      companyEmail: '',
      companyAddress: '',
      companyCity: 'Maputo Cidade',
      companySupervisor: '',
      companySupervisorRole: 'Supervisor Técnico',
      academicSupervisor: teachers[0]?.fullName || 'Docente Orientador',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      workloadHours: 320,
      location: '',
      activities: '',
      status: 'pendente'
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: InternshipContract) => {
    setEditingInternship(item);
    setFormData({
      studentId: item.studentId,
      companyName: item.company.name,
      companyNuit: item.company.nuit || '',
      companySector: item.company.sector || '',
      companyPhone: item.company.phone,
      companyEmail: item.company.email,
      companyAddress: item.company.address,
      companyCity: item.company.city,
      companySupervisor: item.supervisor.companySupervisor,
      companySupervisorRole: item.supervisor.companySupervisorRole || '',
      academicSupervisor: item.supervisor.academicSupervisor,
      startDate: item.startDate,
      endDate: item.endDate,
      workloadHours: item.workloadHours,
      location: item.location,
      activities: item.activities,
      status: item.status
    });
    setIsFormModalOpen(true);
  };

  // Salvar Estágio
  const handleSaveInternship = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.studentId);
    if (!student) {
      addNotification({
        title: 'Formando Inválido',
        message: 'Selecione um formando ativo para o estágio.',
        type: 'system'
      });
      return;
    }

    if (editingInternship) {
      updateInternship(editingInternship.id, {
        studentId: student.id,
        studentName: student.fullName,
        studentCode: student.code,
        studentPhone: student.phone,
        studentEmail: student.email,
        courseId: student.courseId,
        courseName: student.courseName,
        classGroupId: student.classGroupId,
        classGroupName: student.classGroupName,
        company: {
          name: formData.companyName,
          nuit: formData.companyNuit,
          sector: formData.companySector,
          phone: formData.companyPhone,
          email: formData.companyEmail,
          address: formData.companyAddress,
          city: formData.companyCity
        },
        supervisor: {
          companySupervisor: formData.companySupervisor,
          companySupervisorRole: formData.companySupervisorRole,
          academicSupervisor: formData.academicSupervisor
        },
        startDate: formData.startDate,
        endDate: formData.endDate,
        workloadHours: Number(formData.workloadHours),
        location: formData.location,
        activities: formData.activities,
        status: formData.status
      });
    } else {
      addInternship({
        institutionId: activeInstitution.id,
        branchId: activeBranch?.id,
        studentId: student.id,
        studentName: student.fullName,
        studentCode: student.code,
        studentDocumentNumber: student.documentNumber,
        studentPhone: student.phone,
        studentEmail: student.email,
        courseId: student.courseId,
        courseName: student.courseName,
        classGroupId: student.classGroupId,
        classGroupName: student.classGroupName,
        company: {
          name: formData.companyName,
          nuit: formData.companyNuit,
          sector: formData.companySector,
          phone: formData.companyPhone,
          email: formData.companyEmail,
          address: formData.companyAddress,
          city: formData.companyCity
        },
        supervisor: {
          companySupervisor: formData.companySupervisor,
          companySupervisorRole: formData.companySupervisorRole,
          academicSupervisor: formData.academicSupervisor
        },
        startDate: formData.startDate,
        endDate: formData.endDate,
        workloadHours: Number(formData.workloadHours),
        location: formData.location,
        activities: formData.activities,
        status: formData.status,
        generatedDocuments: {
          termoCompromissoDate: new Date().toISOString().split('T')[0]
        }
      });
    }

    setIsFormModalOpen(false);
  };

  // Abrir Modal de Avaliação
  const handleOpenEvaluationModal = (item: InternshipContract) => {
    setEvaluatingInternship(item);
    if (item.evaluation) {
      setEvaluationForm({
        score: item.evaluation.score,
        attendanceScore: item.evaluation.attendanceScore,
        technicalSkillsScore: item.evaluation.technicalSkillsScore,
        professionalConductScore: item.evaluation.professionalConductScore,
        technicalFeedback: item.evaluation.technicalFeedback,
        recommendation: item.evaluation.recommendation,
        companySupervisorName: item.evaluation.companySupervisorName || item.supervisor.companySupervisor,
        academicSupervisorName: item.evaluation.academicSupervisorName || item.supervisor.academicSupervisor
      });
    } else {
      setEvaluationForm({
        score: 16.0,
        attendanceScore: 17.0,
        technicalSkillsScore: 16.0,
        professionalConductScore: 17.0,
        technicalFeedback: 'O formando demonstrou rigor, cumprimento das rotinas e competência prática exemplar.',
        recommendation: 'Aprovado',
        companySupervisorName: item.supervisor.companySupervisor,
        academicSupervisorName: item.supervisor.academicSupervisor
      });
    }
    setIsEvaluationModalOpen(true);
  };

  // Salvar Avaliação
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingInternship) return;

    const evalData: InternshipEvaluation = {
      score: Number(evaluationForm.score),
      attendanceScore: Number(evaluationForm.attendanceScore),
      technicalSkillsScore: Number(evaluationForm.technicalSkillsScore),
      professionalConductScore: Number(evaluationForm.professionalConductScore),
      technicalFeedback: evaluationForm.technicalFeedback,
      recommendation: evaluationForm.recommendation,
      evaluatedByCompanySupervisor: true,
      companySupervisorName: evaluationForm.companySupervisorName,
      academicSupervisorName: evaluationForm.academicSupervisorName,
      evaluationDate: new Date().toISOString().split('T')[0]
    };

    evaluateInternship(evaluatingInternship.id, evalData);
    setIsEvaluationModalOpen(false);
  };

  // Abrir Gerador de Documentos
  const handleOpenDocModal = (item: InternshipContract, docType: InternshipDocumentType = 'termo_compromisso') => {
    setSelectedDocInternship(item);
    setSelectedDocType(docType);
    setIsDocModalOpen(true);
  };

  // Badge do Estado
  const renderStatusBadge = (status: InternshipStatus) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Pendente
          </span>
        );
      case 'procurando':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            Procurando Vaga
          </span>
        );
      case 'atribuído':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            Atribuído
          </span>
        );
      case 'em andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
            Em Andamento
          </span>
        );
      case 'concluído':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header do Módulo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Módulo 20 • SIGAR Estágios
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Inserção Profissional
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-emerald-400" />
              Gestão de Estágios Curriculares e Profissionais
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Controle completo de concessão, supervisores, cargas horárias, avaliação de competências e emissão oficial de documentos de estágio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Processo de Estágio
            </button>
          </div>
        </div>

        {/* Filtros de Estado Conforme Requisito 20 */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'pendente', label: 'Pendente' },
            { id: 'procurando', label: 'Procurando' },
            { id: 'atribuído', label: 'Atribuído' },
            { id: 'em andamento', label: 'Em Andamento' },
            { id: 'concluído', label: 'Concluído' },
            { id: 'cancelado', label: 'Cancelado' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                selectedStatus === st.id
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span>{st.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatus === st.id ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {statusCounts[st.id] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Pesquisar por aluno, empresa, supervisor ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Listando <strong className="text-white">{filteredInternships.length}</strong> de {internships.length} estágio(s)
        </div>
      </div>

      {/* LISTAGEM DOS ESTÁGIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInternships.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Nenhum estágio encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Não existem registros de estágio correspondentes ao filtro atual. Clique em "Novo Processo de Estágio" para registrar.
            </p>
          </div>
        ) : (
          filteredInternships.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Topo do Card: Aluno e Badge de Estado */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">
                      {item.studentCode}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {item.studentName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-500" />
                      {item.courseName}
                    </p>
                  </div>
                  <div>
                    {renderStatusBadge(item.status)}
                  </div>
                </div>

                {/* Empresa & Local */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block">{item.company.name}</strong>
                      <span className="text-[11px] text-slate-400 block">{item.company.city} • NUIT: {item.company.nuit || 'N/D'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-slate-300 line-clamp-1">{item.location}</span>
                  </div>
                </div>

                {/* Detalhes de Vigência e Carga Horária */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" /> Início / Fim
                    </span>
                    <strong className="text-slate-200 text-[11px] font-mono block mt-0.5">
                      {item.startDate} a {item.endDate}
                    </strong>
                  </div>

                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> Carga Horária
                    </span>
                    <strong className="text-slate-200 text-[11px] font-mono block mt-0.5">
                      {item.workloadHours} Horas Totais
                    </strong>
                  </div>
                </div>

                {/* Supervisores */}
                <div className="text-xs space-y-1 pt-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">Supervisor na Empresa:</span>
                    <strong className="text-slate-200 text-[11px]">{item.supervisor.companySupervisor}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">Orientador Acadêmico:</span>
                    <strong className="text-slate-200 text-[11px]">{item.supervisor.academicSupervisor}</strong>
                  </div>
                </div>

                {/* Avaliação (se houver) */}
                {item.evaluation ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Nota de Estágio:
                      </span>
                      <strong className="font-mono text-sm text-emerald-400">
                        {item.evaluation.score.toFixed(1)} / 20
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-300 italic line-clamp-2">
                      "{item.evaluation.technicalFeedback}"
                    </p>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Avaliação do Supervisor:</span>
                    <span className="text-amber-400 font-medium">Pendente de Parecer</span>
                  </div>
                )}
              </div>

              {/* Ações do Card */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEvaluationModal(item)}
                    title="Avaliar Desempenho (0-20)"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Award className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenDocModal(item, 'termo_compromisso')}
                    title="Gerar Documentos de Estágio"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(item)}
                    title="Editar Estágio"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <select
                    value={item.status}
                    onChange={(e) => changeInternshipStatus(item.id, e.target.value as InternshipStatus)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="procurando">Procurando</option>
                    <option value="atribuído">Atribuído</option>
                    <option value="em andamento">Em Andamento</option>
                    <option value="concluído">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CADASTRO / EDIÇÃO DE PROCESSO DE ESTÁGIO */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingInternship ? 'Editar Processo de Estágio' : 'Novo Processo de Estágio'}
                  </h3>
                  <p className="text-xs text-slate-400">Preencha os dados da concessão, supervisores e atividades</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInternship} className="space-y-4 text-xs">
              {/* Aluno */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Aluno do Centro <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.code}) - {s.courseName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dados da Empresa */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Dados da Empresa Concedente
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Nome da Empresa / Instituição <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      placeholder="Ex: Vodacom Moçambique, S.A."
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">NUIT da Empresa</label>
                    <input
                      type="text"
                      placeholder="Ex: 400129841"
                      value={formData.companyNuit}
                      onChange={(e) => setFormData({ ...formData, companyNuit: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Telefone da Empresa</label>
                    <input
                      type="text"
                      placeholder="Ex: +258 21 000 000"
                      value={formData.companyPhone}
                      onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Email de Contato</label>
                    <input
                      type="email"
                      placeholder="Ex: estagios@empresa.co.mz"
                      value={formData.companyEmail}
                      onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Endereço & Cidade da Empresa</label>
                    <input
                      type="text"
                      placeholder="Ex: Av. 24 de Julho, Edifício Jat, Maputo"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Supervisores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Supervisor na Empresa <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do supervisor responsável"
                    value={formData.companySupervisor}
                    onChange={(e) => setFormData({ ...formData, companySupervisor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Orientador Acadêmico (Docente)
                  </label>
                  <select
                    value={formData.academicSupervisor}
                    onChange={(e) => setFormData({ ...formData, academicSupervisor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.fullName}>{t.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vigência, Carga Horária e Local */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Data de Início <span className="text-rose-400">*</span></label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Data de Fim <span className="text-rose-400">*</span></label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Carga Horária (Horas) <span className="text-rose-400">*</span></label>
                  <input
                    type="number"
                    value={formData.workloadHours}
                    onChange={(e) => setFormData({ ...formData, workloadHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    min={40}
                    max={1000}
                    required
                  />
                </div>
              </div>

              {/* Local das Atividades */}
              <div>
                <label className="block text-slate-400 mb-1">Local / Instalações / Posto de Trabalho <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  placeholder="Ex: Departamento de TI / Instalações Centrais da Vodacom"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Atividades a Desempenhar */}
              <div>
                <label className="block text-slate-400 mb-1">Atividades e Competências Práticas <span className="text-rose-400">*</span></label>
                <textarea
                  rows={3}
                  placeholder="Descreva as tarefas e competências práticas a serem desempenhadas pelo formando..."
                  value={formData.activities}
                  onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-slate-400 mb-1">Estado do Estágio</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as InternshipStatus })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="procurando">Procurando</option>
                  <option value="atribuído">Atribuído</option>
                  <option value="em andamento">Em Andamento</option>
                  <option value="concluído">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition-colors"
                >
                  {editingInternship ? 'Salvar Alterações' : 'Criar Estágio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AVALIAÇÃO DE ESTÁGIO PELO SUPERVISOR */}
      {/* ========================================================================= */}
      {isEvaluationModalOpen && evaluatingInternship && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Avaliação de Desempenho do Estágio</h3>
                <p className="text-xs text-slate-400">
                  {evaluatingInternship.studentName} • {evaluatingInternship.company.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nota Final (0 a 20) <span className="text-rose-400">*</span></label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={evaluationForm.score}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, score: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono font-bold text-emerald-400 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Recomendação Final</label>
                  <select
                    value={evaluationForm.recommendation}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, recommendation: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Aprovado com Distinção">Aprovado com Distinção</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              {/* Critérios Parciais */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Assiduidade (0-20)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={evaluationForm.attendanceScore}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, attendanceScore: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 font-mono text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Técnica (0-20)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={evaluationForm.technicalSkillsScore}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, technicalSkillsScore: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 font-mono text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Ética/Conduta (0-20)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={evaluationForm.professionalConductScore}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, professionalConductScore: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 font-mono text-slate-200"
                  />
                </div>
              </div>

              {/* Parecer Técnico */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Parecer Circunstanciado do Supervisor <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Relatório qualitativo sobre postura, autonomia e desempenho prático do estagiário..."
                  value={evaluationForm.technicalFeedback}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, technicalFeedback: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEvaluationModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition-colors"
                >
                  Gravar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GERADOR DE DOCUMENTOS DE ESTÁGIO (PRINT / PDF) */}
      {/* ========================================================================= */}
      {isDocModalOpen && selectedDocInternship && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-0">
            {/* Seletor do Tipo de Documento */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'termo_compromisso', label: '1. Termo de Compromisso' },
                  { id: 'carta_apresentacao', label: '2. Carta de Apresentação' },
                  { id: 'ficha_avaliacao', label: '3. Ficha de Avaliação' },
                  { id: 'declaracao_conclusao', label: '4. Declaração de Conclusão' }
                ].map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocType(doc.id as InternshipDocumentType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedDocType === doc.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {doc.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cabeçalho Oficial do Documento */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                República de Moçambique
              </h4>
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Ministério da Ciência, Tecnologia e Ensino Superior • ANEP
              </h5>
              <h2 className="text-lg font-black text-slate-900 mt-1 uppercase">
                {activeInstitution.name}
              </h2>
              <p className="text-[11px] text-slate-500">
                Gabinete de Estágios & Inserção Profissional • {activeInstitution.address} • NUIT: {activeInstitution.nuit || '400192841'}
              </p>
            </div>

            {/* CONTEÚDO ESPECÍFICO DO DOCUMENTO */}
            {selectedDocType === 'termo_compromisso' && (
              <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
                <div className="text-center">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 underline">
                    Termo de Compromisso de Estágio Curricular
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Ref: TCE-{selectedDocInternship.studentCode}-2026
                  </span>
                </div>

                <p>
                  Pelo presente instrumento particular tripartite, acordam entre si:
                </p>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <p><strong>1. INSTITUIÇÃO DE ENSINO:</strong> {activeInstitution.name}, com sede em {activeInstitution.address}.</p>
                  <p><strong>2. EMPRESA CONCEDENTE:</strong> {selectedDocInternship.company.name}, com sede em {selectedDocInternship.company.address}, {selectedDocInternship.company.city}, NUIT {selectedDocInternship.company.nuit || 'N/D'}.</p>
                  <p><strong>3. FORMANDO / ESTAGIÁRIO:</strong> {selectedDocInternship.studentName}, portador do BI {selectedDocInternship.studentDocumentNumber || '110100293841B'}, formando do curso de <strong>{selectedDocInternship.courseName}</strong>.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">CLÁUSULA 1ª (DO OBJETO E VIGÊNCIA):</h4>
                  <p>
                    O estágio terá início em <strong>{selectedDocInternship.startDate}</strong> e término previsto para <strong>{selectedDocInternship.endDate}</strong>, com carga horária total de <strong>{selectedDocInternship.workloadHours} horas</strong>, no local: <strong>{selectedDocInternship.location}</strong>.
                  </p>

                  <h4 className="font-bold text-slate-900">CLÁUSULA 2ª (DAS ATIVIDADES):</h4>
                  <p>
                    O estagiário desempenhará as seguintes atividades supervisionadas: {selectedDocInternship.activities}.
                  </p>

                  <h4 className="font-bold text-slate-900">CLÁUSULA 3ª (DA SUPERVISÃO):</h4>
                  <p>
                    Fica designado como supervisor na empresa <strong>{selectedDocInternship.supervisor.companySupervisor}</strong> e como orientador pedagógico <strong>{selectedDocInternship.supervisor.academicSupervisor}</strong>.
                  </p>
                </div>
              </div>
            )}

            {selectedDocType === 'carta_apresentacao' && (
              <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
                <div className="text-right text-[11px] text-slate-600">
                  {selectedDocInternship.company.city}, {new Date().toLocaleDateString('pt-MZ')}
                </div>

                <div className="space-y-1">
                  <p>À Direcção de Recursos Humanos da</p>
                  <p className="font-bold text-sm text-slate-900">{selectedDocInternship.company.name}</p>
                  <p className="text-slate-600">{selectedDocInternship.company.city} • Moçambique</p>
                </div>

                <div className="pt-2">
                  <strong className="text-slate-900 uppercase">Assunto: Carta de Apresentação e Encaminhamento de Formando para Estágio</strong>
                </div>

                <p>Exmos. Senhores,</p>

                <p>
                  A Direção de <strong>{activeInstitution.name}</strong> vem por este meio apresentar o formando <strong>{selectedDocInternship.studentName}</strong>, inscrito sob o código <strong>{selectedDocInternship.studentCode}</strong>, matriculado no curso técnico-profissional de <strong>{selectedDocInternship.courseName}</strong>.
                </p>

                <p>
                  Solicitamos a V. Excias. o acolhimento do referido formando para cumprimento do seu estágio prático curricular com carga horária de <strong>{selectedDocInternship.workloadHours} horas</strong>, a ter início a <strong>{selectedDocInternship.startDate}</strong>, visando o desenvolvimento e consolidação das competências técnico-profissionais.
                </p>

                <p>
                  Criteriosamente agradecemos a parceria estratégica entre a vossa prestigiada instituição e o nosso centro de formação.
                </p>
              </div>
            )}

            {selectedDocType === 'ficha_avaliacao' && (
              <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
                <div className="text-center">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 underline">
                    Ficha de Avaliação e Desempenho do Estagiário
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Formando: {selectedDocInternship.studentName} • Empresa: {selectedDocInternship.company.name}
                  </span>
                </div>

                <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <th className="p-2 border border-slate-300">Critério de Avaliação Técnica</th>
                      <th className="p-2 border border-slate-300 text-center w-24">Pontuação (0-20)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-300">1. Assiduidade, Pontualidade e Cumprimento de Horários</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                        {selectedDocInternship.evaluation?.attendanceScore || 18.0}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300">2. Competência Técnica, Qualidade e Domínio Prático</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                        {selectedDocInternship.evaluation?.technicalSkillsScore || 17.0}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300">3. Postura Profissional, Iniciativa, Ética e Trabalho em Equipe</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                        {selectedDocInternship.evaluation?.professionalConductScore || 18.0}
                      </td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td className="p-2 border border-slate-300 text-right">Nota Final de Estágio:</td>
                      <td className="p-2 border border-slate-300 text-center font-mono text-sm text-emerald-800 font-black">
                        {selectedDocInternship.evaluation?.score.toFixed(1) || '17.7'} / 20
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block text-[11px] mb-1">Parecer Circunstanciado do Supervisor:</span>
                  <p className="italic text-slate-700">
                    "{selectedDocInternship.evaluation?.technicalFeedback || 'Formando altamente dedicado com capacidade de resolução ágil de problemas em ambiente produtivo.'}"
                  </p>
                </div>
              </div>
            )}

            {selectedDocType === 'declaracao_conclusao' && (
              <div className="space-y-4 text-xs text-slate-800 leading-relaxed text-justify">
                <div className="text-center py-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 underline">
                    Declaração de Conclusão de Estágio Curricular
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Nº Registo: DEC-EST-{selectedDocInternship.studentCode}-2026
                  </span>
                </div>

                <p>
                  Para os devidos efeitos, a Direção de <strong>{activeInstitution.name}</strong> declara que o formando <strong>{selectedDocInternship.studentName}</strong>, titular do Bilhete de Identidade nº <strong>{selectedDocInternship.studentDocumentNumber || '110100293841B'}</strong>, concluiu com sucesso o seu estágio prático curricular na empresa <strong>{selectedDocInternship.company.name}</strong>, no período de <strong>{selectedDocInternship.startDate}</strong> a <strong>{selectedDocInternship.endDate}</strong>, perfazendo um total de <strong>{selectedDocInternship.workloadHours} horas</strong> de formação prática em contexto de trabalho.
                </p>

                <p>
                  O formando obteve a classificação final de <strong>{selectedDocInternship.evaluation?.score || 18} valores ({selectedDocInternship.evaluation?.recommendation || 'Aprovado com Distinção'})</strong>, tendo demonstrado elevado aproveitamento e aptidão para o exercício pleno da profissão.
                </p>

                <p>
                  Por ser verdade e ter sido solicitada, passa-se a presente declaração que vai assinada e autenticada com o carimbo oficial da instituição.
                </p>
              </div>
            )}

            {/* Assinaturas Tripartidas Oficiais */}
            <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-1">
                <div className="h-12 flex items-end justify-center font-serif italic text-slate-700">
                  {selectedDocInternship.studentName}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <strong>O Formando / Estagiário</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-12 flex items-end justify-center font-serif italic text-slate-700">
                  {selectedDocInternship.supervisor.companySupervisor}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <strong>A Empresa Concedente</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-12 flex items-end justify-center font-serif italic text-slate-700">
                  Direção Geral {activeInstitution.code}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <strong>A Direção do Centro</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
