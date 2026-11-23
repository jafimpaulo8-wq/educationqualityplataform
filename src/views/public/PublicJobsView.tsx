import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  KeyRound,
  AlertTriangle,
  Loader2,
  X,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';
import {
  Institution,
  JobApplication,
  JobApplicationAttachment,
  JobApplicationStatus,
  JobApplicationTracking,
  JobContractType,
  JobVacancy,
  PublicInstitution
} from '../../types';
import {
  extractSlugFromLocation,
  KNOWN_INSTITUTIONS,
  normalizeSlug,
  resolveInstitutionSlug,
  resolvePublicInstitutionBySlug
} from '../../services/publicInstitutionService';
import {
  listAllPublishedJobVacancies,
  lookupJobApplicationByToken,
  readFileAsValidatedAttachment,
  submitPublicJobApplication
} from '../../services/jobRecruitmentService';

const STATUS_BADGE: Record<JobApplicationStatus, string> = {
  RECEBIDA: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'EM ANÁLISE': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  'PRÉ-SELECCIONADA': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  ENTREVISTA: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  APROVADA: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  REJEITADA: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  RETIRADA: 'bg-slate-700/60 text-slate-300 border-slate-600'
};

export const PublicJobsView: React.FC = () => {
  const { allInstitutions, navigate, routeParams, themeMode } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const isLight = themeMode === 'branco';
  const [activeTab, setActiveTab] = useState<'vagas' | 'acompanhar'>('vagas');

  // Detectar slug institucional opcional (/i/<slug>/vagas)
  const routeParamSlug = normalizeSlug(String(routeParams?.inst || ''));
  const browserSlug =
    typeof window !== 'undefined'
      ? extractSlugFromLocation(window.location.pathname, window.location.hash, window.location.search)
      : '';
  const urlSlug = browserSlug || routeParamSlug;

  const [scopedInstitution, setScopedInstitution] = useState<PublicInstitution | null>(null);
  const [slugNotFound, setSlugNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [instFilter, setInstFilter] = useState<string>('todas');
  const [contractFilter, setContractFilter] = useState<string>('todos');

  // Modais de detalhe e candidatura
  const [detailVacancy, setDetailVacancy] = useState<JobVacancy | null>(null);
  const [applyVacancy, setApplyVacancy] = useState<JobVacancy | null>(null);

  // Formulário de Candidatura
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cvAttachment, setCvAttachment] = useState<JobApplicationAttachment | null>(null);
  const [extraAttachment, setExtraAttachment] = useState<JobApplicationAttachment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    application: JobApplication;
    trackingToken: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Acompanhamento por token
  const [lookupToken, setLookupToken] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupAttempted, setLookupAttempted] = useState(false);
  const [trackingResult, setTrackingResult] = useState<JobApplicationTracking | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setSlugNotFound(false);

      if (urlSlug) {
        const resolved = await resolvePublicInstitutionBySlug(urlSlug, allInstitutions);
        if (cancelled) return;
        if (!resolved) {
          setScopedInstitution(null);
          setSlugNotFound(true);
          setVacancies([]);
          setIsLoading(false);
          return;
        }
        setScopedInstitution(resolved);
        const list = await listAllPublishedJobVacancies(resolved.institutionId);
        if (!cancelled) {
          setVacancies(list);
          setIsLoading(false);
        }
        return;
      }

      setScopedInstitution(null);
      const list = await listAllPublishedJobVacancies();
      if (!cancelled) {
        setVacancies(list);
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [urlSlug, allInstitutions]);

  const institutionOptions = useMemo(() => {
    const map = new Map<string, string>();
    [...KNOWN_INSTITUTIONS, ...(allInstitutions || [])].forEach((inst: Institution) => {
      if (inst?.id) map.set(inst.id, inst.name);
    });
    vacancies.forEach(v => {
      if (v.institutionId && !map.has(v.institutionId)) {
        map.set(v.institutionId, v.institutionName || v.institutionId);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allInstitutions, vacancies]);

  const filteredVacancies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return vacancies.filter(v => {
      const matchInst = scopedInstitution
        ? v.institutionId === scopedInstitution.institutionId
        : instFilter === 'todas' || v.institutionId === instFilter;
      const matchContract = contractFilter === 'todos' || v.contractType === (contractFilter as JobContractType);
      const matchQuery =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        (v.department || '').toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.institutionName.toLowerCase().includes(q);
      return matchInst && matchContract && matchQuery;
    });
  }, [vacancies, scopedInstitution, instFilter, contractFilter, searchTerm]);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const att = await readFileAsValidatedAttachment(file, isPrimary ? 'Currículo (CV)' : 'Documento Adicional');
      if (isPrimary) {
        setCvAttachment(att);
      } else {
        setExtraAttachment(att);
      }
      soundManager.playClick();
    } catch (err: any) {
      soundManager.playError();
      toastError('Ficheiro inválido', err?.message || 'Anexe PDF, DOC ou DOCX com até 450 KB.');
    } finally {
      e.target.value = '';
    }
  };

  const openApplyModal = (vacancy: JobVacancy) => {
    setDetailVacancy(null);
    setApplyVacancy(vacancy);
    setSubmissionResult(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setAcademicLevel('');
    setExperienceSummary('');
    setCoverLetter('');
    setCvAttachment(null);
    setExtraAttachment(null);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyVacancy || isSubmitting) return;

    const attachments: JobApplicationAttachment[] = [];
    if (cvAttachment) attachments.push(cvAttachment);
    if (extraAttachment) attachments.push(extraAttachment);

    setIsSubmitting(true);
    try {
      const res = await submitPublicJobApplication(applyVacancy, {
        fullName,
        email,
        phone,
        academicLevel,
        experienceSummary,
        coverLetter,
        attachments
      });
      setSubmissionResult(res);
      soundManager.playSuccess();
      toastSuccess('Candidatura submetida!', `Código: ${res.application.applicationCode}`);
    } catch (err: any) {
      soundManager.playError();
      toastError('Não foi possível submeter', err?.message || 'Verifique os dados e o anexo do currículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupToken = async (e?: React.FormEvent, explicitToken?: string) => {
    e?.preventDefault();
    const token = (explicitToken ?? lookupToken).trim();
    if (!token) return;
    setIsLookingUp(true);
    setLookupAttempted(true);
    try {
      const result = await lookupJobApplicationByToken(token);
      setTrackingResult(result);
      if (result) {
        soundManager.playSuccess();
      } else {
        soundManager.playNotification();
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  if (urlSlug && slugNotFound && !isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 text-center ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}>
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Portal de Vagas Não Encontrado</h2>
          <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            Instituição não encontrada ou endereço inválido para o slug "{urlSlug}".
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => navigate('vagas_publicas')}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
            >
              Ver Todas as Vagas
            </button>
            <button
              type="button"
              onClick={() => navigate('public_portal')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Portal Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/85 border-slate-800'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base truncate">
                {scopedInstitution ? `Carreiras — ${scopedInstitution.name}` : 'Portal de Vagas & Recrutamento SIGAR PRO'}
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                Oportunidades de emprego e estágios profissionais por instituição
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('vagas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                activeTab === 'vagas'
                  ? 'bg-sky-600 text-white'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Vagas ({vacancies.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('acompanhar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                activeTab === 'acompanhar'
                  ? 'bg-sky-600 text-white'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Acompanhar
            </button>
            {scopedInstitution && (
              <button
                type="button"
                onClick={() =>
                  navigate('inscricao_publica', {
                    inst: resolveInstitutionSlug({
                      id: scopedInstitution.institutionId,
                      slug: scopedInstitution.slug,
                      name: scopedInstitution.name
                    })
                  })
                }
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold items-center gap-1 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Cursos
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('public_portal')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                isLight ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal SIGAR</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {activeTab === 'vagas' ? (
          <>
            {/* Search & Filters */}
            <div className={`p-4 rounded-2xl border grid grid-cols-1 md:grid-cols-4 gap-3 ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Procurar por cargo, área, localização ou escola..."
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              {!scopedInstitution ? (
                <select
                  value={instFilter}
                  onChange={(e) => setInstFilter(e.target.value)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                  }`}
                >
                  <option value="todas">Todas as Instituições</option>
                  {institutionOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('vagas_publicas')}
                  className="px-3 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-bold cursor-pointer"
                >
                  Ver Todas as Instituições
                </button>
              )}

              <select
                value={contractFilter}
                onChange={(e) => setContractFilter(e.target.value)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                }`}
              >
                <option value="todos">Todos os Contratos</option>
                <option value="Tempo Inteiro">Tempo Inteiro</option>
                <option value="Tempo Parcial">Tempo Parcial</option>
                <option value="Estágio Profissional">Estágio Profissional</option>
                <option value="Prestação de Serviços / Consultoria">Prestação de Serviços / Consultoria</option>
              </select>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">A carregar oportunidades publicadas...</p>
              </div>
            ) : filteredVacancies.length === 0 ? (
              <div className={`p-12 rounded-3xl border text-center space-y-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
                <h2 className="text-lg font-bold">Sem vagas abertas no momento</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {scopedInstitution
                    ? `A ${scopedInstitution.name} não possui vagas de emprego publicadas actualmente.`
                    : 'Não existem vagas publicadas correspondentes aos filtros seleccionados.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredVacancies.map(vacancy => (
                  <div
                    key={vacancy.id}
                    className={`p-6 rounded-3xl border flex flex-col justify-between gap-4 transition-all hover:shadow-lg ${
                      isLight ? 'bg-white border-slate-200 hover:border-sky-300' : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                            {vacancy.institutionLogoUrl ? (
                              <img src={vacancy.institutionLogoUrl} alt={vacancy.institutionName} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-5 h-5 text-sky-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-sky-400 truncate block">{vacancy.institutionName}</span>
                            <h3 className="text-base font-bold leading-snug">{vacancy.title}</h3>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                          Aberta
                        </span>
                      </div>

                      <p className={`text-xs line-clamp-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
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
                          Até {vacancy.deadline}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/60 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailVacancy(vacancy)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        Ver Requisitos
                      </button>
                      <button
                        type="button"
                        onClick={() => openApplyModal(vacancy)}
                        className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Candidatar-me</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Tracking Tab */
          <div className={`max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl border space-y-6 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/85 border-slate-800'
          }`}>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 font-mono">
                ACOMPANHAMENTO SEGURO SEM EXPOSIÇÃO DE DADOS PRIVADOS
              </span>
              <h2 className="text-xl font-bold">Consultar Estado da Candidatura de Emprego</h2>
              <p className="text-xs text-slate-400">
                Introduza o <strong>Token de Acompanhamento</strong> gerado após a submissão da sua candidatura.
              </p>
            </div>

            <form onSubmit={(e) => handleLookupToken(e)} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={lookupToken}
                  onChange={(e) => setLookupToken(e.target.value)}
                  placeholder="Cole aqui o seu Token de Acompanhamento (48 caracteres)"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={isLookingUp}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Consultar</span>
              </button>
            </form>

            {lookupAttempted && !isLookingUp && (
              trackingResult ? (
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 pb-3">
                    <div>
                      <span className="font-mono text-xs text-sky-400 font-bold">{trackingResult.applicationCode}</span>
                      <h3 className="font-bold text-base mt-0.5">{trackingResult.vacancyTitle}</h3>
                      <p className="text-xs text-slate-400">
                        {trackingResult.institutionName} • Candidato: <strong>{trackingResult.maskedCandidateName}</strong>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_BADGE[trackingResult.status]}`}>
                      {trackingResult.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-400">Linha Temporal da Candidatura</h4>
                    {(trackingResult.publicHistory || []).map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-emerald-400">{item.status}</span>
                          {item.summary && <p className="text-slate-300 mt-0.5">{item.summary}</p>}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(item.timestamp).toLocaleString('pt-MZ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
                  Nenhuma candidatura encontrada para o token fornecido. Confirme se copiou o token completo.
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* Modal Detalhes da Vaga */}
      {detailVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl max-h-[90vh] flex flex-col overflow-hidden ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-sky-400">{detailVacancy.institutionName}</span>
                <h3 className="text-lg font-bold">{detailVacancy.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailVacancy(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">{detailVacancy.location}</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">{detailVacancy.contractType}</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">Prazo: {detailVacancy.deadline}</span>
                {detailVacancy.salaryRange && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300">{detailVacancy.salaryRange}</span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm mb-1">Descrição da Função</h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{detailVacancy.description}</p>
              </div>

              {detailVacancy.requirements && detailVacancy.requirements.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm mb-1">Requisitos</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    {detailVacancy.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {detailVacancy.qualifications && (
                <div>
                  <h4 className="font-bold text-sm mb-1">Habilitações</h4>
                  <p className="text-slate-300">{detailVacancy.qualifications}</p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-sm mb-1">Anexos Exigidos</h4>
                <p className="text-slate-400">{(detailVacancy.requiredAttachments || ['Currículo (CV)']).join(', ')}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800/70 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDetailVacancy(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => openApplyModal(detailVacancy)}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <span>Candidatar-me Agora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Submissão de Candidatura */}
      {applyVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl max-h-[92vh] flex flex-col overflow-hidden ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-sky-400">{applyVacancy.institutionName}</span>
                <h3 className="text-lg font-bold">Candidatura: {applyVacancy.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setApplyVacancy(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submissionResult ? (
              <div className="p-6 sm:p-8 space-y-5 text-center overflow-y-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-bold">Candidatura Enviada com Sucesso!</h4>
                  <p className="text-xs text-slate-400">
                    Código de Registo: <strong className="font-mono text-emerald-400">{submissionResult.application.applicationCode}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
                  <span className="text-[10px] font-bold uppercase text-sky-400 block">
                    Token Seguro de Acompanhamento (Guarde este token!)
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-emerald-300 break-all select-all">
                      {submissionResult.trackingToken}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(submissionResult.trackingToken);
                          setCopiedToken(true);
                          setTimeout(() => setCopiedToken(false), 2500);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedToken ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const tk = submissionResult.trackingToken;
                      setApplyVacancy(null);
                      setActiveTab('acompanhar');
                      setLookupToken(tk);
                      void handleLookupToken(undefined, tk);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Acompanhar Estado Agora
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyVacancy(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nome completo do candidato"
                      className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">E-mail de Contacto *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="candidato@email.com"
                      className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+258 84 000 0000"
                      className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Nível Académico / Formação *</label>
                    <input
                      type="text"
                      required
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      placeholder="Ex: Licenciatura em Informática / Médio Técnico"
                      className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Resumo da Experiência Profissional / Académica *</label>
                  <textarea
                    rows={3}
                    required
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    placeholder="Resuma brevemente a sua experiência relevante para esta vaga..."
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Carta de Apresentação / Motivação</label>
                  <textarea
                    rows={2}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Opcional..."
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}
                  />
                </div>

                {/* Upload CV Obrigatório */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <span className="font-bold block">Currículo (CV) * <span className="text-[10px] text-slate-400">(PDF/DOC/DOCX até 450 KB)</span></span>
                    <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-sky-500/50 text-sky-400 font-semibold cursor-pointer hover:bg-sky-500/10">
                      <Upload className="w-4 h-4" />
                      <span>{cvAttachment ? cvAttachment.fileName : 'Seleccionar Currículo'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => handleCvUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                    {cvAttachment && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-400">
                        <span className="flex items-center gap-1 truncate">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          {Math.round(cvAttachment.sizeBytes / 1024)} KB válido
                        </span>
                        <button type="button" onClick={() => setCvAttachment(null)} className="text-rose-400 cursor-pointer">
                          Remover
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <span className="font-bold block">Certificado / Anexo Extra <span className="text-[10px] text-slate-400">(Opcional)</span></span>
                    <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-600 text-slate-300 font-semibold cursor-pointer hover:bg-slate-800">
                      <Upload className="w-4 h-4" />
                      <span>{extraAttachment ? extraAttachment.fileName : 'Anexar Certificado'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => handleCvUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                    {extraAttachment && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-400">
                        <span>{Math.round(extraAttachment.sizeBytes / 1024)} KB</span>
                        <button type="button" onClick={() => setExtraAttachment(null)} className="text-rose-400 cursor-pointer">
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/70 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyVacancy(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submeter Candidatura</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
