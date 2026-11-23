import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  Eye,
  Send,
  Archive,
  History,
  Building2,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';
import {
  JobApplication,
  JobApplicationStatus,
  JobContractType,
  JobVacancy,
  JobVacancyStatus
} from '../../types';
import {
  changeJobVacancyStatus,
  createOrUpdateJobVacancy,
  JOB_APPLICATION_STATUS_ORDER,
  JobVacancyFormInput,
  listInstitutionJobApplications,
  listInstitutionJobVacancies,
  updateJobApplicationStatusAndNotes
} from '../../services/jobRecruitmentService';
import { getPublicJobsUrl } from '../../services/publicInstitutionService';

const CONTRACT_TYPES: JobContractType[] = [
  'Tempo Inteiro',
  'Tempo Parcial',
  'Estágio Profissional',
  'Prestação de Serviços / Consultoria'
];

const VACANCY_STATUS_BADGES: Record<JobVacancyStatus, string> = {
  rascunho: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  publicada: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  encerrada: 'bg-slate-700/60 text-slate-300 border-slate-600'
};

const APPLICATION_STATUS_BADGES: Record<JobApplicationStatus, string> = {
  RECEBIDA: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'EM ANÁLISE': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  'PRÉ-SELECCIONADA': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  ENTREVISTA: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  APROVADA: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  REJEITADA: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  RETIRADA: 'bg-slate-700/60 text-slate-300 border-slate-600'
};

export const RecruitmentManagerView: React.FC = () => {
  const {
    activeInstitution,
    activeRole,
    firebaseUser,
    userProfile,
    addNotification,
    themeMode
  } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const isLight = themeMode === 'branco';
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applications'>('vacancies');
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [vacancyFilterId, setVacancyFilterId] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal Criar/Editar Vaga
  const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<JobVacancy | null>(null);
  const [isSavingVacancy, setIsSavingVacancy] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formContractType, setFormContractType] = useState<JobContractType>('Tempo Inteiro');
  const [formSalaryRange, setFormSalaryRange] = useState('');
  const [formVacanciesCount, setFormVacanciesCount] = useState<number>(1);
  const [formDeadline, setFormDeadline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRequirementsText, setFormRequirementsText] = useState('');
  const [formQualifications, setFormQualifications] = useState('');
  const [formExperienceRequired, setFormExperienceRequired] = useState('');
  const [formRequiredAttachmentsText, setFormRequiredAttachmentsText] = useState('Currículo (CV), Carta de Apresentação');
  const [formStatus, setFormStatus] = useState<JobVacancyStatus>('publicada');

  // Modal Revisão de Candidatura
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [reviewNextStatus, setReviewNextStatus] = useState<JobApplicationStatus>('EM ANÁLISE');
  const [reviewInternalNotes, setReviewInternalNotes] = useState('');
  const [reviewPublicSummary, setReviewPublicSummary] = useState('');
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);

  const actor = useMemo(
    () => ({
      uid: firebaseUser?.uid || userProfile?.id || 'staff',
      name: userProfile?.name || firebaseUser?.displayName || firebaseUser?.email || 'Gestor RH',
      role: String(activeRole || userProfile?.role || 'SECRETARIA')
    }),
    [firebaseUser, userProfile, activeRole]
  );

  const loadRecruitmentData = async () => {
    if (!activeInstitution?.id) {
      setVacancies([]);
      setApplications([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [vacList, appList] = await Promise.all([
        listInstitutionJobVacancies(activeInstitution.id),
        listInstitutionJobApplications(activeInstitution.id)
      ]);
      setVacancies(vacList);
      setApplications(appList);
    } catch (err: any) {
      toastError('Erro ao carregar recrutamento', err?.message || 'Verifique a ligação ao Firestore.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRecruitmentData();
  }, [activeInstitution?.id]);

  const publicJobsUrl = useMemo(() => getPublicJobsUrl(activeInstitution), [activeInstitution]);

  const handleCopyPublicLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicJobsUrl);
      setCopiedLink(true);
      soundManager.playClick();
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const openNewVacancyModal = () => {
    const defaultDeadline = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    setEditingVacancy(null);
    setFormTitle('');
    setFormDepartment('');
    setFormLocation(activeInstitution.city || 'Nacala');
    setFormContractType('Tempo Inteiro');
    setFormSalaryRange('');
    setFormVacanciesCount(1);
    setFormDeadline(defaultDeadline);
    setFormDescription('');
    setFormRequirementsText('');
    setFormQualifications('');
    setFormExperienceRequired('');
    setFormRequiredAttachmentsText('Currículo (CV), Certificado de Habilitações');
    setFormStatus('publicada');
    setVacancyModalOpen(true);
  };

  const openEditVacancyModal = (vacancy: JobVacancy) => {
    setEditingVacancy(vacancy);
    setFormTitle(vacancy.title);
    setFormDepartment(vacancy.department || '');
    setFormLocation(vacancy.location);
    setFormContractType(vacancy.contractType);
    setFormSalaryRange(vacancy.salaryRange || '');
    setFormVacanciesCount(vacancy.vacanciesCount || 1);
    setFormDeadline(vacancy.deadline);
    setFormDescription(vacancy.description);
    setFormRequirementsText((vacancy.requirements || []).join('\n'));
    setFormQualifications(vacancy.qualifications || '');
    setFormExperienceRequired(vacancy.experienceRequired || '');
    setFormRequiredAttachmentsText((vacancy.requiredAttachments || ['Currículo (CV)']).join(', '));
    setFormStatus(vacancy.status);
    setVacancyModalOpen(true);
  };

  const handleSaveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInstitution?.id) return;

    const input: JobVacancyFormInput = {
      title: formTitle,
      department: formDepartment,
      location: formLocation,
      contractType: formContractType,
      salaryRange: formSalaryRange,
      vacanciesCount: Number(formVacanciesCount || 1),
      deadline: formDeadline,
      description: formDescription,
      requirements: formRequirementsText.split('\n').map(l => l.trim()).filter(Boolean),
      qualifications: formQualifications,
      experienceRequired: formExperienceRequired,
      requiredAttachments: formRequiredAttachmentsText.split(',').map(s => s.trim()).filter(Boolean),
      status: formStatus
    };

    setIsSavingVacancy(true);
    try {
      const saved = await createOrUpdateJobVacancy(activeInstitution, input, actor, editingVacancy);
      setVacancies(prev => {
        const exists = prev.some(v => v.id === saved.id);
        return exists ? prev.map(v => (v.id === saved.id ? saved : v)) : [saved, ...prev];
      });
      setVacancyModalOpen(false);
      soundManager.playSuccess();
      toastSuccess(
        editingVacancy ? 'Vaga actualizada' : 'Vaga registada com sucesso',
        `${saved.title} (${saved.status})`
      );
      addNotification({
        title: editingVacancy ? 'Vaga de Emprego Actualizada' : 'Nova Vaga de Emprego Publicada',
        message: `${saved.title} em ${activeInstitution.name}`,
        type: 'system'
      });
    } catch (err: any) {
      soundManager.playError();
      toastError('Erro ao gravar vaga', err?.message || 'Verifique os campos obrigatórios.');
    } finally {
      setIsSavingVacancy(false);
    }
  };

  const handleToggleVacancyStatus = async (vacancy: JobVacancy, nextStatus: JobVacancyStatus) => {
    if (!activeInstitution?.id) return;
    try {
      await changeJobVacancyStatus(activeInstitution.id, vacancy.id, nextStatus);
      setVacancies(prev =>
        prev.map(v => (v.id === vacancy.id ? { ...v, status: nextStatus, updatedAt: new Date().toISOString() } : v))
      );
      soundManager.playClick();
      toastSuccess('Estado da vaga alterado', `${vacancy.title} agora está "${nextStatus}".`);
    } catch (err: any) {
      toastError('Erro ao alterar estado', err?.message || 'Tente novamente.');
    }
  };

  const openApplicationReview = (app: JobApplication) => {
    setSelectedApplication(app);
    setReviewNextStatus(app.status);
    setReviewInternalNotes(app.internalNotes || '');
    setReviewPublicSummary('');
  };

  const handleSaveApplicationReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInstitution?.id || !selectedApplication) return;
    setIsUpdatingApp(true);
    try {
      const updated = await updateJobApplicationStatusAndNotes(
        activeInstitution.id,
        selectedApplication,
        reviewNextStatus,
        reviewInternalNotes,
        actor,
        reviewPublicSummary.trim() || undefined
      );
      setApplications(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      setSelectedApplication(updated);
      soundManager.playSuccess();
      toastSuccess('Candidatura actualizada', `Estado definido para ${reviewNextStatus}.`);
    } catch (err: any) {
      soundManager.playError();
      toastError('Erro ao actualizar candidatura', err?.message || 'Não foi possível guardar alterações.');
    } finally {
      setIsUpdatingApp(false);
    }
  };

  const applicationsCountByVacancy = useMemo(() => {
    const map: Record<string, number> = {};
    applications.forEach(a => {
      map[a.vacancyId] = (map[a.vacancyId] || 0) + 1;
    });
    return map;
  }, [applications]);

  const filteredVacancies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return vacancies.filter(v => {
      const matchSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        (v.department || '').toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'todos' || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vacancies, searchTerm, statusFilter]);

  const filteredApplications = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return applications.filter(a => {
      const matchVac = vacancyFilterId === 'todas' || a.vacancyId === vacancyFilterId;
      const matchStatus = statusFilter === 'todos' || a.status === statusFilter;
      const matchSearch =
        !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.applicationCode.toLowerCase().includes(q) ||
        a.vacancyTitle.toLowerCase().includes(q);
      return matchVac && matchStatus && matchSearch;
    });
  }, [applications, vacancyFilterId, statusFilter, searchTerm]);

  const stats = useMemo(
    () => ({
      totalVacancies: vacancies.length,
      publishedVacancies: vacancies.filter(v => v.status === 'publicada').length,
      totalApplications: applications.length,
      inProgressApplications: applications.filter(a => ['RECEBIDA', 'EM ANÁLISE', 'PRÉ-SELECCIONADA', 'ENTREVISTA'].includes(a.status)).length,
      approvedApplications: applications.filter(a => a.status === 'APROVADA').length
    }),
    [vacancies, applications]
  );

  if (!activeInstitution?.id) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold">Seleccione uma Instituição</h2>
        <p className="text-xs text-slate-400 mt-1">
          A gestão de vagas e recrutamento é isolada por instituição.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 font-mono block">
                SIGAR PRO • RECRUTAMENTO INSTITUCIONAL
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Vagas de Emprego &amp; Candidaturas
              </h1>
            </div>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Instituição activa: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{activeInstitution.name}</strong> — Módulo de RH independente de vagas de cursos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyPublicLink}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            title={publicJobsUrl}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Link Público de Vagas'}</span>
          </button>

          <button
            type="button"
            onClick={openNewVacancyModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Vaga de Emprego</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}>
          <span className="text-[11px] font-semibold text-slate-400">Vagas Registadas</span>
          <div className="text-2xl font-black mt-1">{stats.totalVacancies}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">{stats.publishedVacancies} publicadas</span>
        </div>
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}>
          <span className="text-[11px] font-semibold text-slate-400">Total Candidaturas</span>
          <div className="text-2xl font-black mt-1">{stats.totalApplications}</div>
          <span className="text-[11px] text-sky-400 font-semibold">Com CV anexado</span>
        </div>
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}>
          <span className="text-[11px] font-semibold text-slate-400">Em Triagem / Entrevista</span>
          <div className="text-2xl font-black mt-1">{stats.inProgressApplications}</div>
          <span className="text-[11px] text-amber-400 font-semibold">Aguardam decisão</span>
        </div>
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}>
          <span className="text-[11px] font-semibold text-slate-400">Candidatos Aprovados</span>
          <div className="text-2xl font-black mt-1">{stats.approvedApplications}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">Prontos para contratação</span>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('vacancies'); setStatusFilter('todos'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'vacancies'
                ? 'bg-sky-600 text-white shadow-sm'
                : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Vagas de Emprego ({vacancies.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('applications'); setStatusFilter('todos'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'applications'
                ? 'bg-sky-600 text-white shadow-sm'
                : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Candidaturas Recebidas ({applications.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'vacancies' ? 'Pesquisar vaga, departamento...' : 'Pesquisar candidato, código, vaga...'}
              className={`pl-8 pr-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
              }`}
            />
          </div>

          {activeTab === 'applications' && (
            <select
              value={vacancyFilterId}
              onChange={(e) => setVacancyFilterId(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
              }`}
            >
              <option value="todas">Todas as Vagas</option>
              {vacancies.map(v => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
            }`}
          >
            <option value="todos">Todos os Estados</option>
            {activeTab === 'vacancies' ? (
              <>
                <option value="publicada">Publicada</option>
                <option value="rascunho">Rascunho</option>
                <option value="encerrada">Encerrada</option>
              </>
            ) : (
              JOB_APPLICATION_STATUS_ORDER.map(st => (
                <option key={st} value={st}>{st}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">A carregar dados de recrutamento...</p>
        </div>
      ) : activeTab === 'vacancies' ? (
        filteredVacancies.length === 0 ? (
          <div className={`p-12 rounded-3xl border text-center space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold">Nenhuma vaga de emprego registada</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Crie a primeira vaga de recrutamento da sua instituição para receber currículos e candidaturas organizadas.
            </p>
            <button
              type="button"
              onClick={openNewVacancyModal}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Criar Primeira Vaga
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVacancies.map(vacancy => {
              const candCount = applicationsCountByVacancy[vacancy.id] ?? vacancy.applicationsCount ?? 0;
              return (
                <div
                  key={vacancy.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${VACANCY_STATUS_BADGES[vacancy.status]}`}>
                          {vacancy.status}
                        </span>
                        <h3 className="text-base font-bold mt-2">{vacancy.title}</h3>
                        {vacancy.department && (
                          <p className="text-xs text-sky-400 font-semibold">{vacancy.department}</p>
                        )}
                      </div>
                      <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                        {vacancy.vacanciesCount ?? 1} vaga{(vacancy.vacanciesCount ?? 1) > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {vacancy.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        {vacancy.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                        {vacancy.contractType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Prazo: {vacancy.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setVacancyFilterId(vacancy.id);
                        setActiveTab('applications');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Candidatos ({candCount})
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditVacancyModal(vacancy)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>

                      {vacancy.status !== 'publicada' ? (
                        <button
                          type="button"
                          onClick={() => handleToggleVacancyStatus(vacancy, 'publicada')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Publicar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleVacancyStatus(vacancy, 'encerrada')}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Encerrar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : filteredApplications.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center space-y-2 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <Users className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold">Sem candidaturas encontradas</h3>
          <p className="text-xs text-slate-400">
            Partilhe o link público <span className="font-mono text-sky-400">{publicJobsUrl}</span> para receber candidaturas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map(app => (
            <div
              key={app.id}
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400">{app.applicationCode}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${APPLICATION_STATUS_BADGES[app.status]}`}>
                    {app.status}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(app.submittedAt).toLocaleDateString('pt-MZ')}
                  </span>
                </div>
                <h4 className="font-bold text-sm sm:text-base">{app.fullName}</h4>
                <p className="text-xs text-slate-400">
                  Vaga: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{app.vacancyTitle}</strong> • {app.academicLevel}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span>{app.email}</span>
                  <span>•</span>
                  <span>{app.phone}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{app.attachments?.length || 0} anexo(s)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openApplicationReview(app)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Analisar &amp; CV
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Vaga */}
      {vacancyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl max-h-[90vh] flex flex-col overflow-hidden ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold">
                  {editingVacancy ? 'Editar Vaga de Emprego' : 'Nova Vaga de Emprego'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVacancyModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVacancy} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Título da Vaga *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Formador de Informática / Contabilista"
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Departamento / Área</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="Ex: Direcção Pedagógica / Administração"
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Local de Trabalho *</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Nacala-Porto"
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tipo de Contrato *</label>
                  <select
                    value={formContractType}
                    onChange={(e) => setFormContractType(e.target.value as JobContractType)}
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  >
                    {CONTRACT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Prazo de Candidatura *</label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nº de Vagas *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={formVacanciesCount}
                    onChange={(e) => setFormVacanciesCount(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Faixa Salarial / Honorários</label>
                  <input
                    type="text"
                    value={formSalaryRange}
                    onChange={(e) => setFormSalaryRange(e.target.value)}
                    placeholder="Opcional (Ex: A combinar)"
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Estado de Publicação *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as JobVacancyStatus)}
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  >
                    <option value="publicada">Publicada (Visível ao público)</option>
                    <option value="rascunho">Rascunho (Apenas interno)</option>
                    <option value="encerrada">Encerrada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Descrição da Função e Responsabilidades *</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva as responsabilidades principais, objectivos do cargo e contexto..."
                  className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Requisitos (um por linha)</label>
                <textarea
                  rows={3}
                  value={formRequirementsText}
                  onChange={(e) => setFormRequirementsText(e.target.value)}
                  placeholder={'Licenciatura ou nível médio técnico\nExperiência mínima de 2 anos\nDomínio de ferramentas digitais'}
                  className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Habilitações Exigidas</label>
                  <input
                    type="text"
                    value={formQualifications}
                    onChange={(e) => setFormQualifications(e.target.value)}
                    placeholder="Ex: Licenciatura em Educação / Engenharia"
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Experiência Mínima</label>
                  <input
                    type="text"
                    value={formExperienceRequired}
                    onChange={(e) => setFormExperienceRequired(e.target.value)}
                    placeholder="Ex: 2 anos em funções similares"
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Documentos Exigidos (separados por vírgula)</label>
                <input
                  type="text"
                  value={formRequiredAttachmentsText}
                  onChange={(e) => setFormRequiredAttachmentsText(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                />
              </div>

              <div className="pt-3 border-t border-slate-800/70 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVacancyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingVacancy}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingVacancy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingVacancy ? 'Guardar Alterações' : 'Publicar / Guardar Vaga'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Análise de Candidatura & Histórico */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl max-h-[92vh] flex flex-col overflow-hidden ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400">{selectedApplication.applicationCode}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${APPLICATION_STATUS_BADGES[selectedApplication.status]}`}>
                    {selectedApplication.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1">{selectedApplication.fullName}</h3>
                <p className="text-xs text-slate-400">Vaga: {selectedApplication.vacancyTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Contactos & Perfil */}
              <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">E-mail</span>
                  <span className="font-semibold">{selectedApplication.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Telefone</span>
                  <span className="font-semibold">{selectedApplication.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Formação Académica</span>
                  <span className="font-semibold">{selectedApplication.academicLevel}</span>
                </div>
              </div>

              {/* Resumo & Carta */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-xs uppercase text-slate-400 mb-1">Resumo de Experiência</h4>
                  <p className={`p-3 rounded-xl border leading-relaxed ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}>
                    {selectedApplication.experienceSummary}
                  </p>
                </div>
                {selectedApplication.coverLetter && (
                  <div>
                    <h4 className="font-bold text-xs uppercase text-slate-400 mb-1">Carta / Motivação</h4>
                    <p className={`p-3 rounded-xl border leading-relaxed ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}>
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}
              </div>

              {/* Anexos / CV */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Documentos &amp; Currículo Anexado</h4>
                <div className="space-y-2">
                  {(selectedApplication.attachments || []).map(att => (
                    <div
                      key={att.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold truncate">{att.fileName}</div>
                          <div className="text-[10px] text-slate-400">
                            {att.label} • {Math.round((att.sizeBytes || 0) / 1024)} KB
                          </div>
                        </div>
                      </div>
                      {att.dataUrl && (
                        <a
                          href={att.dataUrl}
                          download={att.fileName}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descarregar
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulário de Decisão e Notas Internas */}
              <form onSubmit={handleSaveApplicationReview} className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <h4 className="font-bold text-xs uppercase text-sky-400">Actualizar Parecer de Recrutamento</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Novo Estado</label>
                    <select
                      value={reviewNextStatus}
                      onChange={(e) => setReviewNextStatus(e.target.value as JobApplicationStatus)}
                      className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                    >
                      {JOB_APPLICATION_STATUS_ORDER.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Mensagem Pública (Tracking)</label>
                    <input
                      type="text"
                      value={reviewPublicSummary}
                      onChange={(e) => setReviewPublicSummary(e.target.value)}
                      placeholder="Ex: Convocado para entrevista presencial"
                      className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Notas Internas da Equipa (Privado RH)</label>
                  <textarea
                    rows={2}
                    value={reviewInternalNotes}
                    onChange={(e) => setReviewInternalNotes(e.target.value)}
                    placeholder="Registe parecer técnico, avaliação de entrevista ou observações internas..."
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingApp}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Guardar Parecer &amp; Estado
                  </button>
                </div>
              </form>

              {/* Histórico / Auditoria */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-sky-400" />
                  Histórico de Auditoria
                </h4>
                <div className="space-y-2">
                  {(selectedApplication.statusHistory || []).slice().reverse().map(entry => (
                    <div key={entry.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-sky-300">{entry.toStatus}</span>
                        {entry.fromStatus && <span className="text-slate-500"> (de {entry.fromStatus})</span>}
                        {entry.note && <p className="text-slate-300 mt-0.5">{entry.note}</p>}
                        <span className="text-[10px] text-slate-500">Por {entry.actorName} ({entry.actorRole})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {new Date(entry.timestamp).toLocaleString('pt-MZ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
