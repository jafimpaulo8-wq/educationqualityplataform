import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  CreditCard,
  ShieldCheck,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  Printer,
  MessageCircle,
  Search,
  Sparkles,
  QrCode,
  AlertTriangle,
  School,
  User,
  HelpCircle,
  RotateCcw,
  XCircle,
  BookOpen,
  Camera,
  HeartHandshake,
  Building2,
  MapPin,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';
import { PROVINCES_MOZAMBIQUE } from '../../data/mockData';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../services/firebase';
import { RegistrationApplication, PublicInstitution, OnlineCourseConfig, toCanonicalRole } from '../../types';
import {
  extractSlugFromLocation,
  fetchPublicInstitutionsIndex,
  fetchPublishedPublicInstitutionStrict,
  resolvePublicInstitutionStrictWithAliases,
  compressImageToBase64,
  generateSecureInvitationToken,
  normalizeSlug
} from '../../services/publicInstitutionService';
import {
  computeSha256Hex,
  createEmptyOnlineRegistrationConfig,
  getConfiguredDocuments,
  getRemainingVacancies,
  isCourseSoldOut,
  isQuestionVisible,
  normalizeFieldRequirement,
  NormalizedRequirement,
  sanitizeFirestoreData,
  validateAndFormatInternationalPhone,
  validateFullRegistration,
  validateRegistrationStep
} from '../../utils/registrationConfigUtils';
import {
  calculateApplicationAttachmentsByteSize,
  getUtf8Bytes,
  MAX_PUBLIC_DOC_IMAGE_RAW_BYTES,
  MAX_PUBLIC_DOC_PDF_BYTES,
  MAX_PUBLIC_DOCS_TOTAL_BYTES,
  readPdfFileAsValidatedDataUrl
} from '../../utils/documentPreviewUtils';

export { validateAndFormatInternationalPhone };

/**
 * Extrai o slug institucional a partir da URL (hash, pathname ou search query).
 */
function extractSlugFromBrowser(): string {
  if (typeof window === 'undefined') return '';
  return extractSlugFromLocation(
    window.location.pathname,
    window.location.hash,
    window.location.search
  );
}

/**
 * Oculta PII do candidato para consulta pública segura.
 * Mostra apenas as iniciais e o último apelido (ex.: "Ca•••••• Munguambe").
 */
export function maskCandidateName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2) + '••••••';
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.slice(0, 2)}•••••• ${last}`;
}

/**
 * Converte de forma segura Firestore Timestamp, string ou Date para texto legível.
 */
export function formatFirestoreTimestamp(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val.toDate === 'function') {
    return val.toDate().toLocaleString('pt-MZ');
  }
  if (val.seconds !== undefined) {
    return new Date(val.seconds * 1000).toLocaleString('pt-MZ');
  }
  if (val instanceof Date) {
    return val.toLocaleString('pt-MZ');
  }
  return String(val);
}

export const PublicRegistrationView: React.FC = () => {
  const {
    allInstitutions,
    activeInstitution,
    activeRole,
    authorizedRoles,
    userProfile,
    addApplication,
    firebaseUser,
    navigate,
    routeParams,
    openWhatsAppMessage,
    setPublicPortalIdentity,
    themeMode
  } = useApp();
  const { error: toastError } = useToast();

  const isLight = themeMode === 'branco';

  // URL slug sincronizado dinamicamente com hash/popstate/routeParams
  const routeParamSlug = normalizeSlug(String(routeParams?.inst || routeParams?.slug || ''));
  const [urlSlug, setUrlSlug] = useState<string>(() => extractSlugFromBrowser() || routeParamSlug);
  const [isPreviewModeParam, setIsPreviewModeParam] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('preview') === 'true';
  });

  useEffect(() => {
    const syncSlug = () => {
      const next = extractSlugFromBrowser() || routeParamSlug;
      setUrlSlug(next);
      if (typeof window !== 'undefined') {
        setIsPreviewModeParam(new URLSearchParams(window.location.search).get('preview') === 'true');
      }
    };
    syncSlug();
    window.addEventListener('hashchange', syncSlug);
    window.addEventListener('popstate', syncSlug);
    return () => {
      window.removeEventListener('hashchange', syncSlug);
      window.removeEventListener('popstate', syncSlug);
    };
  }, [routeParamSlug]);

  // Resolução Assíncrona e Isolada da Instituição Pública
  const [resolvedPublicInst, setResolvedPublicInst] = useState<PublicInstitution | null>(null);
  const [isLoadingInst, setIsLoadingInst] = useState<boolean>(true);
  const [slugNotFound, setSlugNotFound] = useState<boolean>(false);
  const [instLoadError, setInstLoadError] = useState<string | null>(null);
  const [noSlugDirectoryMode, setNoSlugDirectoryMode] = useState<boolean>(false);
  const [directoryInstitutions, setDirectoryInstitutions] = useState<PublicInstitution[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState<boolean>(false);
  const [directoryError, setDirectoryError] = useState<string | null>(null);

  // Active Main View Tab & Step State
  const [activeTab, setActiveTab] = useState<'formulario' | 'consultar'>('formulario');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidate, setSubmittedCandidate] = useState<RegistrationApplication | null>(null);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Limpar todo o estado do formulário ao mudar de slug/instituição (zero contaminação cruzada)
  useEffect(() => {
    setSubmittedCandidate(null);
    setCurrentStep(1);
    setSelectedCourseId('');
    setFullName('');
    setDocumentNumber('');
    setNuit('');
    setBirthDate('');
    setGender('');
    setPhone('');
    setGuardianPhone('');
    setEmail('');
    setProvince('');
    setCity('');
    setAddress('');
    setGuardianName('');
    setGuardianRelationship('');
    setAuthorizedPickupPersons('');
    setPreviousSchool('');
    setCandidatePhotoUrl('');
    setCustomAnswers({});
    setUploadedDocs({});
    setPaymentTxCode('');
    setMpesaNumber('');
    setPaymentReferenceSubmitted(false);
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setStepErrors([]);
    setFieldErrors({});
    setLookedUpApplication(null);
    setLookupAttempted(false);
    setSearchCode('');
  }, [urlSlug]);

  // Efeito de resolução estrita via publicInstitutions/{slug} e _index
  // Pré-visualização administrativa (?preview=true) exige utilizador autenticado COM papel administrativo autorizado para a instituição alvo
  const authorizedPreviewPool = useMemo(() => {
    if (!isPreviewModeParam || !firebaseUser) return [];
    const canonicalActive = toCanonicalRole(activeRole);
    const allUserRoles = [
      canonicalActive,
      ...(authorizedRoles || []).map((r) => toCanonicalRole(r)),
      ...(userProfile?.role ? [toCanonicalRole(userProfile.role)] : []),
      ...(Array.isArray(userProfile?.roles) ? userProfile.roles.map((r) => toCanonicalRole(r)) : [])
    ];
    const isSuperAdmin =
      allUserRoles.includes('SUPER_ADMIN') ||
      (firebaseUser.emailVerified === true &&
        firebaseUser.email?.toLowerCase() === 'moztechwavenacala8@gmail.com');

    if (isSuperAdmin) {
      return allInstitutions;
    }

    const adminPreviewRoles = new Set(['ADMIN_INSTITUICAO', 'DIRETOR', 'CEO', 'SECRETARIA', 'FINANCEIRO']);
    const hasAdminRole = allUserRoles.some((r) => adminPreviewRoles.has(r));
    if (!hasAdminRole) return [];

    const allowedInstIds = new Set<string>(
      [
        userProfile?.institutionId,
        activeInstitution?.id,
        ...(Array.isArray(userProfile?.institutionIds) ? userProfile.institutionIds : []),
        ...(Array.isArray(userProfile?.ownedInstitutions) ? userProfile.ownedInstitutions : [])
      ].filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    );

    return allInstitutions.filter((inst) => inst?.id && allowedInstIds.has(inst.id));
  }, [isPreviewModeParam, firebaseUser, activeRole, authorizedRoles, userProfile, activeInstitution?.id, allInstitutions]);

  const isPreviewAuthorized = isPreviewModeParam && Boolean(firebaseUser) && authorizedPreviewPool.length > 0;

  useEffect(() => {
    let isCancelled = false;

    if (!urlSlug) {
      setResolvedPublicInst(null);
      setSlugNotFound(false);
      setInstLoadError(null);
      setNoSlugDirectoryMode(true);
      setIsLoadingInst(false);
      setIsLoadingDirectory(true);
      setDirectoryError(null);

      (async () => {
        const indexRes = await fetchPublicInstitutionsIndex();
        if (isCancelled) return;
        if (indexRes.error) {
          setDirectoryInstitutions([]);
          setDirectoryError(indexRes.error);
          setIsLoadingDirectory(false);
          return;
        }
        if (indexRes.slugs.length === 0) {
          setDirectoryInstitutions([]);
          setDirectoryError(null);
          setIsLoadingDirectory(false);
          return;
        }
        const results = await Promise.all(
          indexRes.slugs.map((s) => fetchPublishedPublicInstitutionStrict(s))
        );
        if (isCancelled) return;
        const map = new Map<string, PublicInstitution>();
        const errs: string[] = [];
        for (const r of results) {
          if (r.error) errs.push(r.error);
          if (r.institution && r.institution.institutionId && !map.has(r.institution.institutionId)) {
            map.set(r.institution.institutionId, r.institution);
          }
        }
        const list = Array.from(map.values());
        setDirectoryInstitutions(list);
        setDirectoryError(list.length === 0 && errs.length > 0 ? errs[0] : null);
        setIsLoadingDirectory(false);
      })().catch((err: any) => {
        if (!isCancelled) {
          setDirectoryInstitutions([]);
          setDirectoryError(err?.message || 'Erro ao carregar catálogo de instituições públicas.');
          setIsLoadingDirectory(false);
        }
      });

      return () => {
        isCancelled = true;
      };
    }

    setNoSlugDirectoryMode(false);
    setIsLoadingInst(true);
    setInstLoadError(null);
    resolvePublicInstitutionStrictWithAliases(urlSlug, {
      isPreviewMode: isPreviewAuthorized,
      previewPool: isPreviewAuthorized ? authorizedPreviewPool : undefined
    })
      .then(result => {
        if (isCancelled) return;
        if (result.error) {
          setResolvedPublicInst(null);
          setSlugNotFound(false);
          setInstLoadError(result.error);
        } else if (result.institution) {
          setResolvedPublicInst(result.institution);
          setSlugNotFound(false);
          setInstLoadError(null);
        } else {
          setResolvedPublicInst(null);
          setSlugNotFound(true);
          setInstLoadError(null);
        }
        setIsLoadingInst(false);
      })
      .catch(err => {
        console.warn('Erro ao resolver instituição pública:', err);
        if (!isCancelled) {
          setResolvedPublicInst(null);
          setSlugNotFound(false);
          setInstLoadError(err?.message || 'Erro ao consultar o portal público.');
          setIsLoadingInst(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [urlSlug, isPreviewAuthorized, authorizedPreviewPool]);

  useEffect(() => {
    if (resolvedPublicInst && !slugNotFound && !instLoadError) {
      setPublicPortalIdentity({
        officialName: resolvedPublicInst.name,
        logoUrl: resolvedPublicInst.logoUrl,
        emblemUrl: resolvedPublicInst.emblemUrl,
        faviconUrl: resolvedPublicInst.faviconUrl || resolvedPublicInst.logoUrl || resolvedPublicInst.emblemUrl,
        institutionId: resolvedPublicInst.institutionId,
        slug: resolvedPublicInst.slug
      });
    } else {
      setPublicPortalIdentity(null);
    }
    return () => {
      setPublicPortalIdentity(null);
    };
  }, [resolvedPublicInst, slugNotFound, instLoadError, setPublicPortalIdentity]);

  // Identificação do tipo institucional para rótulos contextuais
  const isChildCenter = useMemo(() => {
    if (!resolvedPublicInst) return false;
    const type = (resolvedPublicInst.type || '').toLowerCase();
    return type === 'centro_infantil';
  }, [resolvedPublicInst]);

  // Configuração efetiva estritamente da instituição resolvida (sem valores de outra instituição)
  const effectiveConfig = useMemo(() => {
    if (resolvedPublicInst?.onlineRegistrationConfig) {
      return resolvedPublicInst.onlineRegistrationConfig;
    }
    return createEmptyOnlineRegistrationConfig(
      resolvedPublicInst
        ? {
            id: resolvedPublicInst.institutionId,
            name: resolvedPublicInst.name,
            type: resolvedPublicInst.type as any,
            phone: resolvedPublicInst.phone,
            whatsapp: resolvedPublicInst.whatsapp,
            email: resolvedPublicInst.email
          }
        : null
    );
  }, [resolvedPublicInst]);

  // Número de WhatsApp validado e formatado internacionalmente (oculto se inexistente ou inválido)
  const validatedWhatsAppNumber = useMemo(() => {
    if (!resolvedPublicInst) return null;
    return (
      validateAndFormatInternationalPhone(effectiveConfig.contactWhatsapp) ||
      validateAndFormatInternationalPhone(resolvedPublicInst.whatsapp) ||
      validateAndFormatInternationalPhone(effectiveConfig.contactPhone) ||
      validateAndFormatInternationalPhone(resolvedPublicInst.phone)
    );
  }, [resolvedPublicInst, effectiveConfig]);

  // Helper de obrigatoriedade de campo (obrigatorio | opcional | oculto)
  const reqOf = (
    key: string,
    fallback: NormalizedRequirement = 'opcional'
  ): NormalizedRequirement => {
    return normalizeFieldRequirement(effectiveConfig.requiredFields?.[key], fallback);
  };

  // Modo Privado / Convite Direto
  const [isPrivateMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    return search.includes('token=') || hash.includes('token=') || hash.includes('inscricao_privada');
  });

  const [privateTokenParam] = useState(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  });

  // Termos e Privacidade
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Cursos / Salas ativos da instituição
  const activeCourses: OnlineCourseConfig[] = useMemo(() => {
    return (effectiveConfig.coursesConfig || []).filter(c => c.active !== false);
  }, [effectiveConfig]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  useEffect(() => {
    const availableCourses = activeCourses.filter(c => !isCourseSoldOut(c));
    if (availableCourses.length > 0 && !availableCourses.some(c => c.courseId === selectedCourseId)) {
      setSelectedCourseId(availableCourses[0].courseId);
    } else if (availableCourses.length === 0) {
      setSelectedCourseId('');
    }
  }, [activeCourses, selectedCourseId]);

  const selectedCourse = useMemo(() => {
    return activeCourses.find(c => c.courseId === selectedCourseId);
  }, [activeCourses, selectedCourseId]);

  const availableRegimes = useMemo(() => {
    if (selectedCourse?.regimes && selectedCourse.regimes.length > 0) {
      return selectedCourse.regimes;
    }
    return isChildCenter ? ['Laboral'] : ['Laboral', 'Pós-Laboral', 'Online'];
  }, [selectedCourse, isChildCenter]);

  const availableShifts = useMemo(() => {
    if (selectedCourse?.shifts && selectedCourse.shifts.length > 0) {
      return selectedCourse.shifts;
    }
    return isChildCenter ? ['Manhã', 'Tarde', 'Integral'] : ['Manhã', 'Tarde', 'Noite'];
  }, [selectedCourse, isChildCenter]);

  const [regime, setRegime] = useState<string>('Laboral');
  const [shift, setShift] = useState<string>('Manhã');

  useEffect(() => {
    if (availableRegimes.length > 0 && !availableRegimes.includes(regime as any)) {
      setRegime(availableRegimes[0]);
    }
    if (availableShifts.length > 0 && !availableShifts.includes(shift)) {
      setShift(availableShifts[0]);
    }
  }, [availableRegimes, availableShifts, regime, shift]);

  // Campos Pessoais (sem valores hardcoded falsos)
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState<'BI' | 'Passaporte' | 'DIRE' | 'Cédula'>(() =>
    isChildCenter ? 'Cédula' : 'BI'
  );
  const [documentNumber, setDocumentNumber] = useState('');
  const [nuit, setNuit] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Encarregados & Pessoas autorizadas
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [authorizedPickupPersons, setAuthorizedPickupPersons] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');

  // Fotografia tipo passe (comprimida <= 150 KB)
  const [candidatePhotoUrl, setCandidatePhotoUrl] = useState<string>('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  // Questionário customizado
  const visibleQuestions = useMemo(() => {
    return (effectiveConfig.customQuestions || []).filter(isQuestionVisible);
  }, [effectiveConfig]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  // Documentos configurados pela instituição
  const configuredDocuments = useMemo(() => {
    return getConfiguredDocuments(effectiveConfig);
  }, [effectiveConfig]);

  const [uploadedDocs, setUploadedDocs] = useState<
    Record<string, { fileName: string; fileSize: string; mimeType?: string; dataUrl?: string; uploadedAt: string }>
  >({});
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDocTitle, setPendingDocTitle] = useState<string | null>(null);

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'e-Mola' | 'BIM' | 'Presencial'>('M-Pesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [paymentTxCode, setPaymentTxCode] = useState('');
  const [paymentReferenceSubmitted, setPaymentReferenceSubmitted] = useState(false);

  // Status Lookup State
  const [searchCode, setSearchCode] = useState('');
  const [lookedUpApplication, setLookedUpApplication] = useState<RegistrationApplication | null>(null);
  const [lookupAttempted, setLookupAttempted] = useState(false);

  const isOpen = effectiveConfig.isOpen !== false;
  const coursePrice = typeof selectedCourse?.price === 'number' ? selectedCourse.price : 0;

  const currentFormInput = {
    selectedCourseId: selectedCourse?.courseId || selectedCourseId,
    fullName,
    documentNumber,
    birthDate,
    gender,
    phone,
    email,
    province,
    city,
    address,
    guardianName,
    guardianPhone,
    guardianRelationship,
    authorizedPickupPersons,
    nuit,
    previousSchool,
    customAnswers,
    uploadedDocs,
    termsAccepted,
    privacyAccepted
  };

  const showStepValidationErrors = (errors: string[], fErrors: Record<string, string>) => {
    setStepErrors(errors);
    setFieldErrors(fErrors);
    soundManager.playNotification();
    if (errors.length > 0) {
      toastError('Verifique os dados obrigatórios', errors[0]);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const goToNextStep = (fromStep: number) => {
    const check = validateRegistrationStep(fromStep, currentFormInput, effectiveConfig, activeCourses);
    if (!check.valid) {
      showStepValidationErrors(check.errors, check.fieldErrors);
      return;
    }
    setStepErrors([]);
    setFieldErrors({});
    setCurrentStep(fromStep + 1);
    soundManager.playClick();
  };

  const handleStepperClick = (targetStep: number) => {
    if (targetStep <= currentStep) {
      setStepErrors([]);
      setCurrentStep(targetStep);
      return;
    }
    for (let s = currentStep; s < targetStep; s++) {
      const check = validateRegistrationStep(s, currentFormInput, effectiveConfig, activeCourses);
      if (!check.valid) {
        setCurrentStep(s);
        showStepValidationErrors(check.errors, check.fieldErrors);
        return;
      }
    }
    setStepErrors([]);
    setFieldErrors({});
    setCurrentStep(targetStep);
  };

  // Handler para upload e compressão da foto tipo passe (<= 150 KB)
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingPhoto(true);
      const compressedDataUrl = await compressImageToBase64(file, 150000);
      setCandidatePhotoUrl(compressedDataUrl);
      soundManager.playSuccess();
    } catch (err) {
      console.warn('Falha na compressão da imagem:', err);
      toastError('Erro na fotografia', 'Não foi possível processar a imagem. Tente uma foto JPG ou PNG menor.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleAnswerChange = (qId: string, answer: string) => {
    setCustomAnswers(prev => ({ ...prev, [qId]: answer }));
    if (fieldErrors[`q_${qId}`]) {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy[`q_${qId}`];
        return copy;
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleUploadDoc = (docTitle: string) => {
    soundManager.playClick();
    setPendingDocTitle(docTitle);
    if (docFileInputRef.current) {
      docFileInputRef.current.value = '';
      docFileInputRef.current.click();
    }
  };

  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetTitle = pendingDocTitle;
    setPendingDocTitle(null);
    if (!file || !targetTitle) return;

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = allowedImageTypes.includes(file.type) || file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      toastError('Formato inválido', 'Selecione apenas ficheiros PDF, JPG, PNG ou WEBP.');
      return;
    }

    let safeDataUrl: string | undefined;
    if (isPdf) {
      try {
        safeDataUrl = await readPdfFileAsValidatedDataUrl(file, MAX_PUBLIC_DOC_PDF_BYTES);
      } catch (err: any) {
        toastError('PDF não aceite', err?.message || 'Não foi possível validar o documento PDF.');
        return;
      }
    } else {
      if (file.size > MAX_PUBLIC_DOC_IMAGE_RAW_BYTES) {
        toastError('Ficheiro demasiado grande', 'A imagem excede o limite de 5 MB antes da compressão.');
        return;
      }
      try {
        safeDataUrl = await compressImageToBase64(file, 100000);
      } catch (err: any) {
        toastError('Erro ao processar imagem', err?.message || 'Não foi possível comprimir a imagem selecionada.');
        return;
      }
    }

    const nextEntry = {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      mimeType: isPdf ? 'application/pdf' : file.type || 'image/jpeg',
      dataUrl: safeDataUrl,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const nextDocsPreview = {
      ...uploadedDocs,
      [targetTitle]: nextEntry
    };
    const totalBytes = calculateApplicationAttachmentsByteSize(candidatePhotoUrl, nextDocsPreview);
    if (totalBytes > MAX_PUBLIC_DOCS_TOTAL_BYTES) {
      toastError(
        'Limite de Anexos Atingido',
        `O conjunto de foto e documentos (${Math.round(totalBytes / 1024)} KB) excede o máximo de ${Math.round(MAX_PUBLIC_DOCS_TOTAL_BYTES / 1024)} KB para submissão segura. Reduza o tamanho dos PDFs ou envie fotografias comprimidas.`
      );
      return;
    }

    setUploadedDocs(nextDocsPreview);
    soundManager.playSuccess();
  };

  const handleRemoveDoc = (docTitle: string) => {
    setUploadedDocs(prev => {
      const copy = { ...prev };
      delete copy[docTitle];
      return copy;
    });
  };

  const handleSubmitPaymentReference = () => {
    const cleaned = paymentTxCode.trim();
    if (cleaned.length < 4) {
      toastError('Código inválido', 'Insira o código de confirmação da transação (mínimo 4 caracteres).');
      return;
    }
    soundManager.playSuccess();
    setPaymentReferenceSubmitted(true);
  };

  // Submissão Oficial com Prevenção de Duplo Clique e Validação Estrita
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!resolvedPublicInst) {
      toastError('Instituição inválida', 'Aceda através do endereço oficial da instituição.');
      return;
    }

    const fullValidation = validateFullRegistration(currentFormInput, effectiveConfig, activeCourses);
    if (!fullValidation.valid) {
      setCurrentStep(fullValidation.firstInvalidStep || 1);
      showStepValidationErrors(fullValidation.errors, fullValidation.fieldErrors);
      return;
    }

    setStepErrors([]);
    setFieldErrors({});
    setIsSubmitting(true);
    soundManager.playClick();

    try {
      const documentsList = (
        Object.entries(uploadedDocs) as [
          string,
          { fileName: string; fileSize: string; mimeType?: string; dataUrl?: string; uploadedAt: string }
        ][]
      ).map(([docType, fileInfo], idx) =>
        sanitizeFirestoreData({
          id: `cand-doc-${Date.now()}-${idx}`,
          name: docType,
          type: fileInfo.mimeType || docType,
          fileName: fileInfo.fileName,
          fileSize: fileInfo.fileSize,
          url: fileInfo.dataUrl || '',
          verified: false,
          uploadedAt: fileInfo.uploadedAt
        })
      );

      const customAnswersArray = visibleQuestions.map(q => ({
        questionId: q.id,
        question: q.question,
        answer: (customAnswers[q.id] || '').trim()
      }));

      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const prefix = (resolvedPublicInst.code || 'CAND').replace(/[^a-zA-Z0-9]/g, '');
      const year = effectiveConfig.academicYear?.match(/\d{4}/)?.[0] || String(new Date().getFullYear());
      const applicationCode = `${prefix}-${year}-${randomSeq}`;
      const trackingToken = generateSecureInvitationToken();
      const applicationId = `reg-${Date.now()}`;
      const portalSlug = resolvedPublicInst.slug;
      const normalizedTxCode = paymentTxCode.trim().toUpperCase();

      // Construir payload apenas com campos visíveis/fornecidos (sem valores fictícios nem undefined)
      const candidatePayload: any = sanitizeFirestoreData({
        id: applicationId,
        code: applicationCode,
        trackingToken,
        slug: portalSlug,
        institutionId: resolvedPublicInst.institutionId,
        branchId: resolvedPublicInst.branches?.[0]?.id || 'branch-main',
        status: 'submetida',
        fullName: fullName.trim(),
        documentType,
        ...(reqOf('documentNumber', 'opcional') !== 'oculto' && documentNumber.trim()
          ? { documentNumber: documentNumber.trim() }
          : { documentNumber: '' }),
        ...(reqOf('birthDate', 'opcional') !== 'oculto' && birthDate ? { birthDate } : { birthDate: '' }),
        ...(reqOf('gender', 'opcional') !== 'oculto' && gender ? { gender } : { gender: 'Outro' }),
        ...(reqOf('phone', 'obrigatorio') !== 'oculto' && phone.trim() ? { phone: phone.trim() } : { phone: '' }),
        ...(reqOf('email', 'opcional') !== 'oculto' && email.trim() ? { email: email.trim() } : { email: '' }),
        ...(reqOf('province', 'opcional') !== 'oculto' && province ? { province } : { province: '' }),
        ...(reqOf('city', 'opcional') !== 'oculto' && city.trim() ? { city: city.trim() } : { city: '' }),
        ...(reqOf('address', 'opcional') !== 'oculto' && address.trim() ? { address: address.trim() } : {}),
        ...(reqOf('guardianName', 'opcional') !== 'oculto' && guardianName.trim()
          ? { guardianName: guardianName.trim() }
          : {}),
        ...(reqOf('guardianPhone', 'opcional') !== 'oculto' && guardianPhone.trim()
          ? { guardianPhone: guardianPhone.trim() }
          : {}),
        ...(reqOf('guardianRelationship', 'oculto') !== 'oculto' && guardianRelationship
          ? { guardianRelationship }
          : {}),
        ...(reqOf('authorizedPickupPersons', 'oculto') !== 'oculto' && authorizedPickupPersons.trim()
          ? { authorizedPickupPersons: authorizedPickupPersons.trim() }
          : {}),
        ...(reqOf('nuit', 'opcional') !== 'oculto' && nuit.trim() ? { nuit: nuit.trim() } : {}),
        ...(reqOf('previousSchool', 'opcional') !== 'oculto' && previousSchool.trim()
          ? { previousSchool: previousSchool.trim() }
          : {}),
        courseId: selectedCourse!.courseId,
        courseName: selectedCourse!.courseName,
        regime,
        shift,
        photoUrl: candidatePhotoUrl || '',
        paymentStatus: 'Pendente',
        paymentAmount: coursePrice,
        paymentMethod,
        paymentReference: normalizedTxCode || `PEND-${applicationCode}`,
        ...(mpesaNumber.trim() ? { payerPhone: mpesaNumber.trim() } : {}),
        documents: documentsList,
        customAnswers: customAnswersArray,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        privacyAccepted: true,
        isPrivateApplication: !!isPrivateMode,
        ...(privateTokenParam ? { privateInviteToken: privateTokenParam } : {})
      });

      // Tracking seguro (sem PII) indexado por trackingToken de alta entropia
      const trackingPayload = sanitizeFirestoreData({
        token: trackingToken,
        code: applicationCode,
        applicationId,
        slug: portalSlug,
        institutionId: resolvedPublicInst.institutionId,
        status: 'submetida',
        courseId: selectedCourse!.courseId,
        courseName: selectedCourse!.courseName,
        paymentStatus: 'Pendente',
        paymentAmount: coursePrice,
        regime,
        shift,
        documentsCount: documentsList.length,
        maskedName: maskCandidateName(fullName.trim())
      });

      const payloadByteSize = getUtf8Bytes(JSON.stringify(candidatePayload));
      if (payloadByteSize > 950_000) {
        toastError(
          'Candidatura demasiado pesada',
          'O tamanho total dos anexos excede o limite técnico de envio. Comprima os PDFs ou remova anexos repetidos.'
        );
        setIsSubmitting(false);
        return;
      }

      // 3. Revalidação estrita em publicInstitutions/{slug} antes de persistir
      const freshRes = await fetchPublishedPublicInstitutionStrict(resolvedPublicInst.slug);
      if (freshRes.error) {
        throw new Error(`Não foi possível validar o portal público no servidor: ${freshRes.error}`);
      }
      const freshInst = freshRes.institution;
      if (!freshInst || freshInst.onlineRegistrationConfig?.isOpen === false) {
        throw new Error('As inscrições online desta instituição estão encerradas.');
      }
      const freshCourse = (freshInst.onlineRegistrationConfig?.coursesConfig || []).find(
        c => c.courseId === selectedCourse!.courseId && c.active !== false
      );
      if (!freshCourse) {
        throw new Error('O curso seleccionado já não está disponível para candidatura pública.');
      }
      if (isCourseSoldOut(freshCourse)) {
        throw new Error(`As vagas para "${freshCourse.courseName}" esgotaram. Seleccione outro curso.`);
      }

      // 4. Persistência atómica: prefere Cloud Function transaccional e usa writeBatch atómico com dedup SHA-256 quando não publicada
      let finalAppId = applicationId;
      let finalCode = applicationCode;
      let finalTrackingToken = trackingToken;
      let submittedViaServerCallable = false;

      try {
        const submitCallable = httpsCallable<
          Record<string, any>,
          { ok: boolean; applicationId: string; code: string; trackingToken: string }
        >(functions, 'submitPublicCourseApplicationCallable');
        const serverRes = await submitCallable(candidatePayload);
        if (serverRes.data?.ok) {
          submittedViaServerCallable = true;
          finalAppId = serverRes.data.applicationId || applicationId;
          finalCode = serverRes.data.code || applicationCode;
          finalTrackingToken = serverRes.data.trackingToken || trackingToken;
        }
      } catch (callableErr: any) {
        const rawCode = String(callableErr?.code || '');
        const businessErrorCodes = new Set([
          'functions/already-exists',
          'functions/failed-precondition',
          'functions/invalid-argument',
          'functions/permission-denied',
          'functions/not-found',
          'already-exists',
          'failed-precondition',
          'invalid-argument',
          'permission-denied',
          'not-found'
        ]);
        const callableMissingOnRoute =
          rawCode === 'functions/not-found' &&
          /not found|404/i.test(String(callableErr?.message || '')) &&
          !/curso|portal/i.test(String(callableErr?.message || ''));

        if (businessErrorCodes.has(rawCode) && !callableMissingOnRoute) {
          throw new Error(callableErr?.message || 'A candidatura foi recusada pelo servidor.');
        }
      }

      if (!submittedViaServerCallable) {
        const safeCourse = selectedCourse!.courseId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48);
        const normDoc = documentNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const normEmail = email.trim().toLowerCase();
        const normPhone = phone.replace(/\D/g, '');
        const dedupEntries: Array<{ id: string; hash: string }> = [];

        if (normDoc.length >= 4) {
          const h = await computeSha256Hex(`${resolvedPublicInst.institutionId}|${selectedCourse!.courseId}|doc:${normDoc}`);
          dedupEntries.push({ id: `doc_${safeCourse}_${h.slice(0, 32)}`, hash: h });
        }
        if (normEmail.length >= 5 && normEmail.includes('@')) {
          const h = await computeSha256Hex(`${resolvedPublicInst.institutionId}|${selectedCourse!.courseId}|email:${normEmail}`);
          dedupEntries.push({ id: `eml_${safeCourse}_${h.slice(0, 32)}`, hash: h });
        }
        if (normPhone.length >= 6) {
          const h = await computeSha256Hex(`${resolvedPublicInst.institutionId}|${selectedCourse!.courseId}|phone:${normPhone}`);
          dedupEntries.push({ id: `phn_${safeCourse}_${h.slice(0, 32)}`, hash: h });
        }

        const batch = writeBatch(db);
        const nowServer = serverTimestamp();

        batch.set(
          doc(db, 'institutions', resolvedPublicInst.institutionId, 'applications', finalAppId),
          { ...candidatePayload, id: finalAppId, code: finalCode, trackingToken: finalTrackingToken, createdAt: nowServer }
        );
        batch.set(
          doc(db, 'applications', finalAppId),
          { ...candidatePayload, id: finalAppId, code: finalCode, trackingToken: finalTrackingToken, createdAt: nowServer }
        );
        batch.set(
          doc(db, 'applicationTracking', finalTrackingToken),
          { ...trackingPayload, applicationId: finalAppId, code: finalCode, token: finalTrackingToken, createdAt: nowServer }
        );
        batch.set(
          doc(db, 'applicationTracking', finalCode),
          { ...trackingPayload, applicationId: finalAppId, code: finalCode, token: finalTrackingToken, createdAt: nowServer }
        );

        const nowIso = new Date().toISOString();
        for (const entry of dedupEntries) {
          batch.set(
            doc(db, 'institutions', resolvedPublicInst.institutionId, 'courseApplicationDedup', entry.id),
            {
              institutionId: resolvedPublicInst.institutionId,
              courseId: selectedCourse!.courseId,
              dedupHash: entry.hash,
              createdAt: nowIso
            }
          );
        }

        try {
          await batch.commit();
        } catch (batchErr: any) {
          if (batchErr?.code === 'permission-denied') {
            throw new Error(
              'Não foi possível registar a candidatura: já existe uma inscrição para este curso com o mesmo documento/e-mail/telefone ou as regras do portal recusaram o pedido.'
            );
          }
          throw batchErr;
        }
      }

      const createdLocal = addApplication({
        ...candidatePayload,
        id: finalAppId,
        code: finalCode,
        trackingToken: finalTrackingToken,
        createdAt: new Date().toLocaleString('pt-MZ'),
        skipFirestoreSync: true
      });
      setSubmittedCandidate(createdLocal);

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
      soundManager.playSuccess();
    } catch (err: any) {
      console.error('Erro na submissão de candidatura:', err);
      toastError(
        'Não foi possível submeter a candidatura',
        err?.message || 'Verifique os campos obrigatórios configurados pela instituição e tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pesquisa de Candidatura estritamente via applicationTracking/{token|code} (zero fallback em AppContext)
  const handleSearchApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim() || !resolvedPublicInst) return;
    setLookupAttempted(true);

    const trimmedQuery = searchCode.trim();
    const candidateKeys = Array.from(new Set([trimmedQuery, trimmedQuery.toUpperCase()]));

    for (const lookupKey of candidateKeys) {
      try {
        const trackingRef = doc(db, 'applicationTracking', lookupKey);
        const trackingSnap = await getDoc(trackingRef);
        if (trackingSnap.exists()) {
          const trData = trackingSnap.data();
          if (trData.institutionId === resolvedPublicInst.institutionId || trData.slug === resolvedPublicInst.slug) {
            setLookedUpApplication({
              id: trData.applicationId || trData.token,
              code: trData.code || trData.token,
              trackingToken: trData.token,
              institutionId: trData.institutionId,
              slug: trData.slug,
              fullName: trData.maskedCandidateName || trData.maskedName || 'Candidato',
              documentType: 'BI',
              documentNumber: '••••••••',
              email: '••••••••',
              phone: '••••••••',
              province: '••••••••',
              city: '••••••••',
              birthDate: '••••••••',
              gender: 'Outro',
              courseId: trData.courseId || '',
              courseName: trData.courseName || '',
              regime: trData.regime || 'Regular',
              status: trData.status || 'submetida',
              photoUrl: '',
              createdAt: formatFirestoreTimestamp(trData.submittedAt || trData.createdAt),
              paymentStatus: trData.paymentStatus || 'Pendente',
              paymentReference: '••••••••',
              documents: []
            });
            soundManager.playSuccess();
            return;
          }
        }
      } catch (err: any) {
        console.warn('Consulta applicationTracking:', err);
        toastError('Erro na consulta', err?.message || 'Não foi possível consultar o estado no Firestore.');
        setLookedUpApplication(null);
        return;
      }
    }

    setLookedUpApplication(null);
    soundManager.playNotification();
  };

  // 1. Tela de Carregamento da Instituição
  if (isLoadingInst) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 text-center select-none font-sans ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-4">
          <GraduationCap className="w-7 h-7 text-sky-400 animate-pulse" />
        </div>
        <h2 className="text-base font-bold">A carregar portal institucional...</h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">SIGAR PRO • Inscrições Online</p>
      </div>
    );
  }

  // 1B. Selecção de Instituição estritamente via publicInstitutions/_index (quando nenhum slug foi especificado)
  if (noSlugDirectoryMode) {
    return (
      <div
        className={`min-h-screen font-sans p-4 sm:p-8 ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                SIGAR PRO • INSCRIÇÕES ONLINE POR INSTITUIÇÃO
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Escolha a Instituição de Ensino
              </h1>
              <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Cada centro ou escola possui o seu próprio endereço isolado (<span className="font-mono">/i/slug</span>). Seleccione abaixo a instituição pretendida.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('public_portal')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Portal
            </button>
          </div>

          {isLoadingDirectory ? (
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/70 text-center text-xs text-slate-400">
              A consultar instituições publicadas em publicInstitutions...
            </div>
          ) : directoryError ? (
            <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-950/20 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Não foi possível consultar o catálogo público</h3>
              <p className="text-xs text-rose-300">{directoryError}</p>
            </div>
          ) : directoryInstitutions.length === 0 ? (
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/70 text-center space-y-2">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Nenhuma instituição publicada neste momento</h3>
              <p className="text-xs text-slate-400">
                Solicite o link directo da instituição ou tente novamente mais tarde.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {directoryInstitutions.map((inst) => (
                <div
                  key={inst.institutionId}
                  className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${
                    isLight ? 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm' : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                      {inst.logoUrl ? (
                        <img src={inst.logoUrl} alt={inst.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base truncate">{inst.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          {inst.city || inst.province || 'Moçambique'}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                          /i/{inst.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      navigate('inscricao_publica', { inst: inst.slug });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Aceder ao Portal de Inscrições</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Tela de Erro ou Link Inválido (Zero fallback cruzado)
  if (instLoadError || slugNotFound || !resolvedPublicInst) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 text-center select-none font-sans ${
          isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
        }`}
      >
        <div className="max-w-md w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-sky-400">
            <School className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block font-mono">
              SIGAR PRO • PLATAFORMA OFICIAL
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Portal de Candidaturas</h2>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm font-semibold leading-relaxed">
            {instLoadError
              ? `Erro ao consultar o portal público em publicInstitutions: ${instLoadError}`
              : 'Instituição não encontrada, despublicada ou inactiva. Solicite o link correcto (/i/slug) à sua instituição.'}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Cada instituição credenciada no SIGAR PRO possui um endereço próprio e isolado para recepção de candidaturas.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window.location.hash || window.location.pathname !== '/')) {
                  window.history.pushState(null, '', '/');
                }
                navigate('public_portal');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Portal Principal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showGuardianSection =
    reqOf('guardianName', 'opcional') !== 'oculto' ||
    reqOf('guardianPhone', 'opcional') !== 'oculto' ||
    reqOf('guardianRelationship', 'oculto') !== 'oculto' ||
    reqOf('authorizedPickupPersons', 'oculto') !== 'oculto';

  const resolvedTermsText =
    effectiveConfig.termsAndConditions ||
    resolvedPublicInst.termsAndConditions ||
    `1. A submissão da candidatura na ${resolvedPublicInst.name} constitui manifestação oficial de interesse e não assegura admissão automática sem parecer da secretaria.\n2. Os candidatos e encarregados comprometem-se com a veracidade dos dados submetidos.`;

  const resolvedPrivacyText =
    effectiveConfig.privacyPolicy ||
    resolvedPublicInst.privacyPolicy ||
    `Os dados recolhidos pela ${resolvedPublicInst.name} destinam-se estritamente à gestão académica oficial no SIGAR PRO.`;

  // 3. Renderização Principal do Portal Institucional Isolado
  return (
    <div
      className={`min-h-screen font-sans transition-colors ${
        isLight
          ? 'bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white'
          : 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950'
      }`}
    >
      {/* Top Portal Banner & Institution Branding */}
      <header
        className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isLight ? 'border-slate-200 bg-white/95' : 'border-slate-800/80 bg-slate-900/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold overflow-hidden ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {resolvedPublicInst.logoUrl ? (
                <img src={resolvedPublicInst.logoUrl} alt={resolvedPublicInst.name} className="w-full h-full object-cover" />
              ) : (
                <School className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`font-bold text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-md ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {resolvedPublicInst.name}
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  Portal Oficial
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {resolvedPublicInst.city
                  ? `${resolvedPublicInst.city}${resolvedPublicInst.province ? `, ${resolvedPublicInst.province}` : ''}`
                  : 'Inscrições Online Oficiais'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('formulario');
                soundManager.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'formulario'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Fazer Inscrição
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('consultar');
                soundManager.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'consultar'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Consultar Estado
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Campaign Announcement Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  isOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
                {isOpen ? 'Inscrições Abertas' : 'Inscrições Encerradas'}
              </span>
              {(effectiveConfig.academicYear || effectiveConfig.semester) && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                  {[effectiveConfig.academicYear ? `Ano Letivo ${effectiveConfig.academicYear}` : '', effectiveConfig.semester]
                    .filter(Boolean)
                    .join(' • ')}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {effectiveConfig.title || `Inscrições Online — ${resolvedPublicInst.name}`}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {effectiveConfig.description || `Portal oficial de candidaturas da instituição ${resolvedPublicInst.name}.`}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              {(effectiveConfig.startDate || effectiveConfig.endDate) && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>
                    Período: {effectiveConfig.startDate || 'Aberto'}
                    {effectiveConfig.endDate ? ` até ${effectiveConfig.endDate}` : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>
                  {activeCourses.length} {isChildCenter ? 'Salas/Grupos Disponíveis' : 'Cursos/Classes'}
                </span>
              </div>
              {(effectiveConfig.contactPhone || resolvedPublicInst.phone) && (
                <div className="flex items-center gap-1.5">
                  <PhoneCallBadge phone={effectiveConfig.contactPhone || resolvedPublicInst.phone} />
                </div>
              )}
            </div>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Tab 1: Formulário de Inscrição */}
        {activeTab === 'formulario' ? (
          submittedCandidate ? (
            /* Submission Success & Official Voucher */
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-bold text-white">Inscrição Submetida com Sucesso!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  {(effectiveConfig.confirmationMessageTemplate ||
                    `A candidatura foi registrada no sistema académico da ${resolvedPublicInst.name} e aguarda análise da secretaria.`)
                    .replace('{NOME}', submittedCandidate.fullName)
                    .replace('{CURSO}', submittedCandidate.courseName)
                    .replace('{CODIGO}', submittedCandidate.code)}
                </p>
              </div>

              {/* Official Voucher Printable Box */}
              <div id="comprovativo-voucher" className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Comprovativo Oficial de Inscrição
                    </span>
                    <h4 className="text-lg font-bold text-white">{submittedCandidate.fullName}</h4>
                    {submittedCandidate.documentNumber && (
                      <p className="text-xs text-slate-400">
                        {submittedCandidate.documentType}: {submittedCandidate.documentNumber}
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Número da Inscrição</span>
                    <span className="font-mono text-xl font-bold text-emerald-400">{submittedCandidate.code}</span>
                    {submittedCandidate.trackingToken && (
                      <div className="mt-1 flex flex-col sm:items-end gap-0.5 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-sky-400 shrink-0" />
                          Token Seguro de Consulta:
                        </span>
                        <span className="text-sky-300 select-all break-all">{submittedCandidate.trackingToken}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">{isChildCenter ? 'Sala / Grupo' : 'Curso Solicitado'}</span>
                    <span className="font-semibold text-white">{submittedCandidate.courseName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Turno &amp; Regime</span>
                    <span>
                      {submittedCandidate.regime} • {submittedCandidate.shift || 'Manhã'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Estado da Candidatura</span>
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Submetida (Em Análise)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Taxa de Inscrição</span>
                    <span className="font-semibold text-white">
                      {(submittedCandidate.paymentAmount ?? 0) > 0
                        ? `${(submittedCandidate.paymentAmount ?? 0).toLocaleString()} MT (${submittedCandidate.paymentStatus})`
                        : `Isento / 0 MT`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Data da Submissão</span>
                    <span>{formatFirestoreTimestamp(submittedCandidate.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Documentos Anexados</span>
                    <span>{submittedCandidate.documents?.length || 0} arquivos</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                      <QrCode className="w-full h-full text-slate-950" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Autenticação Digital SIVEC</span>
                      <span className="font-mono text-xs text-emerald-400">
                        SIVEC-CAND-{submittedCandidate.code.replace(/[^0-9]/g, '')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Válido para consulta institucional</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir
                    </button>
                    {validatedWhatsAppNumber && (
                      <button
                        type="button"
                        onClick={() =>
                          openWhatsAppMessage(
                            validatedWhatsAppNumber,
                            `Olá ${resolvedPublicInst.name}! Acabei de submeter a candidatura:\n\nCandidato: ${submittedCandidate.fullName}\nCódigo: ${submittedCandidate.code}\nOpção: ${submittedCandidate.courseName}`
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Secretaria
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedCandidate(null);
                    setCurrentStep(1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Fazer Nova Inscrição
                </button>
              </div>
            </div>
          ) : !isOpen ? (
            /* Registration Closed Screen */
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Inscrições Online Encerradas</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                O período de inscrições para este ciclo letivo está suspenso. Para esclarecimentos, contacte a secretaria da{' '}
                {resolvedPublicInst.name}.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('consultar')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-md"
                >
                  Consultar Inscrição Já Realizada
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Registration Form */
            <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 shadow-2xl">
              {/* Stepper Header */}
              <div className="grid grid-cols-5 gap-2 border-b border-slate-800 pb-6">
                {[
                  { step: 1, label: isChildCenter ? 'Sala' : 'Curso' },
                  { step: 2, label: 'Dados' },
                  { step: 3, label: 'Perguntas' },
                  { step: 4, label: 'Documentos' },
                  { step: 5, label: 'Pagamento' }
                ].map(item => (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => handleStepperClick(item.step)}
                    className={`flex flex-col items-center text-center group cursor-pointer transition-all ${
                      currentStep === item.step
                        ? 'text-emerald-400 font-bold'
                        : currentStep > item.step
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1.5 transition-all ${
                        currentStep === item.step
                          ? 'bg-emerald-500 text-slate-950 font-bold ring-4 ring-emerald-500/20'
                          : currentStep > item.step
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {currentStep > item.step ? <Check className="w-4 h-4" /> : item.step}
                    </div>
                    <span className="text-[11px] truncate max-w-full">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Validation Alert Banner */}
              {stepErrors.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-2 text-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Corrija os seguintes pontos antes de prosseguir:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {stepErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* STEP 1: Curso / Sala */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                      1. {isChildCenter ? 'Selecione a Sala / Grupo' : 'Selecione o Curso ou Classe Desejada'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isChildCenter
                        ? 'Selecione o grupo pedagógico adequado à faixa etária da criança.'
                        : 'Confira os valores, requisitos de ingresso e vagas disponíveis desta instituição.'}
                    </p>
                  </div>

                  {activeCourses.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <p className="text-sm font-semibold text-white">
                        Nenhuma oferta formativa configurada neste momento
                      </p>
                      <p className="text-xs text-slate-400">
                        A administração da {resolvedPublicInst.name} ainda não publicou cursos ou salas disponíveis para inscrição online.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeCourses.map(course => {
                          const isSelected = selectedCourseId === course.courseId;
                          const remainingVacancies = getRemainingVacancies(course);
                          const soldOut = isCourseSoldOut(course);
                          const filledPct = course.vacancies > 0
                            ? Math.min(100, Math.round(((course.filledVacancies || 0) / course.vacancies) * 100))
                            : 0;

                          return (
                            <div
                              key={course.courseId}
                              onClick={() => {
                                if (!soldOut) {
                                  setSelectedCourseId(course.courseId);
                                }
                              }}
                              aria-disabled={soldOut}
                              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                soldOut
                                  ? 'bg-slate-950/40 border-rose-500/30 opacity-60 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/10 cursor-pointer'
                                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 cursor-pointer'
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                                    {course.category || (isChildCenter ? 'Educação Infantil' : 'Oferta Formativa')}
                                  </span>
                                  {soldOut ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                                      Esgotado
                                    </span>
                                  ) : isSelected ? (
                                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </span>
                                  ) : null}
                                </div>

                                <div>
                                  <h4 className="font-bold text-white text-sm">{course.courseName}</h4>
                                  {course.duration && (
                                    <p className="text-xs text-slate-400 mt-1">
                                      Duração / Faixa: <strong className="text-slate-200">{course.duration}</strong>
                                    </p>
                                  )}
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Taxa de Inscrição:</span>
                                    <span className="font-bold text-emerald-400 font-mono">
                                      {(course.price ?? 0) > 0 ? `${course.price.toLocaleString()} MT` : 'Gratuito'}
                                    </span>
                                  </div>
                                  {(course.monthlyFee ?? 0) > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Propina Mensal:</span>
                                      <span className="font-medium text-slate-200 font-mono">
                                        {course.monthlyFee!.toLocaleString()} MT/mês
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {course.requirements && course.requirements.length > 0 && (
                                  <div className="space-y-1 text-[11px] text-slate-300">
                                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Requisitos:</span>
                                    {course.requirements.map((req, rIdx) => (
                                      <div key={rIdx} className="flex items-center gap-1.5">
                                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                        <span className="truncate">{req}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                  <span>Vagas Totais: {course.vacancies}</span>
                                  <span className={soldOut ? 'text-rose-400 font-bold' : filledPct > 85 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                    {soldOut
                                      ? '0 disponíveis (Esgotado)'
                                      : remainingVacancies !== null
                                        ? `${remainingVacancies} disponíveis`
                                        : 'Vagas abertas'}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${soldOut ? 'bg-rose-500' : filledPct > 85 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                    style={{ width: `${soldOut ? 100 : filledPct}%` }}
                                  ></div>
                                </div>
                                {validatedWhatsAppNumber && (
                                  <div className="pt-2 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        const msg = encodeURIComponent(
                                          `Olá ${resolvedPublicInst.name}! Gostaria de saber mais informações sobre "${course.courseName}".`
                                        );
                                        window.open(`https://wa.me/${validatedWhatsAppNumber}?text=${msg}`, '_blank');
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Saber mais</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Regime Pretendido</label>
                          <select
                            value={regime}
                            onChange={e => setRegime(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {availableRegimes.map(r => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Turno de Preferência</label>
                          <select
                            value={shift}
                            onChange={e => setShift(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {availableShifts.map(s => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      disabled={activeCourses.length === 0 || !selectedCourse || isCourseSoldOut(selectedCourse)}
                      onClick={() => goToNextStep(1)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {selectedCourse && isCourseSoldOut(selectedCourse)
                        ? 'Vagas Esgotadas'
                        : 'Avançar para Identificação'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Identificação Dinâmica (Obrigatório / Opcional / Oculto) */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-400" />
                      2. {isChildCenter ? 'Identificação da Criança e Encarregados' : 'Identificação do Candidato'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Campos assinalados com <span className="text-rose-400 font-bold">*</span> são exigidos pela instituição.
                    </p>
                  </div>

                  {/* Fotografia tipo passe */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative">
                      {candidatePhotoUrl ? (
                        <img src={candidatePhotoUrl} alt="Foto" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-7 h-7 text-slate-500" />
                      )}
                      {isCompressingPhoto && (
                        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
                          Ajustando...
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <h4 className="text-xs font-bold text-white">
                        {isChildCenter ? 'Fotografia tipo passe da Criança (Opcional)' : 'Fotografia tipo passe do Candidato (Opcional)'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        A imagem é comprimida automaticamente no seu navegador para até 150 KB.
                      </p>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-all border border-slate-700 mt-1">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Carregar Fotografia</span>
                        <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Nome Completo */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        {isChildCenter ? 'Nome Completo da Criança' : 'Nome Completo do Candidato'}{' '}
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder={isChildCenter ? 'Nome completo da criança' : 'Nome completo conforme documento'}
                        className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                          fieldErrors.fullName ? 'border-rose-500' : 'border-slate-800'
                        }`}
                      />
                    </div>

                    {/* Género */}
                    {reqOf('gender', 'opcional') !== 'oculto' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Género{' '}
                          {reqOf('gender', 'opcional') === 'obrigatorio' ? (
                            <span className="text-rose-400">*</span>
                          ) : (
                            <span className="text-slate-500 font-normal">(Opcional)</span>
                          )}
                        </label>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer ${
                            fieldErrors.gender ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        >
                          <option value="">Selecionar...</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    )}

                    {/* Data de Nascimento */}
                    {reqOf('birthDate', 'opcional') !== 'oculto' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Data de Nascimento{' '}
                          {reqOf('birthDate', 'opcional') === 'obrigatorio' ? (
                            <span className="text-rose-400">*</span>
                          ) : (
                            <span className="text-slate-500 font-normal">(Opcional)</span>
                          )}
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={e => setBirthDate(e.target.value)}
                          className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                            fieldErrors.birthDate ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        />
                      </div>
                    )}

                    {/* Documento de Identificação */}
                    {reqOf('documentNumber', 'opcional') !== 'oculto' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            {isChildCenter ? 'Tipo de Registo / Documento' : 'Tipo de Documento'}
                          </label>
                          <select
                            value={documentType}
                            onChange={e => setDocumentType(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="Cédula">Cédula de Nascimento</option>
                            <option value="BI">Bilhete de Identidade (BI)</option>
                            <option value="DIRE">DIRE</option>
                            <option value="Passaporte">Passaporte</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Número do Documento{' '}
                            {reqOf('documentNumber', 'opcional') === 'obrigatorio' ? (
                              <span className="text-rose-400">*</span>
                            ) : (
                              <span className="text-slate-500 font-normal">(Opcional)</span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={documentNumber}
                            onChange={e => setDocumentNumber(e.target.value)}
                            placeholder="Número do BI / Cédula / Passaporte"
                            className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono uppercase ${
                              fieldErrors.documentNumber ? 'border-rose-500' : 'border-slate-800'
                            }`}
                          />
                        </div>
                      </>
                    )}

                    {/* Telefone Principal */}
                    {reqOf('phone', 'obrigatorio') !== 'oculto' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Contacto Telefónico / WhatsApp{' '}
                          {reqOf('phone', 'obrigatorio') === 'obrigatorio' ? (
                            <span className="text-rose-400">*</span>
                          ) : (
                            <span className="text-slate-500 font-normal">(Opcional)</span>
                          )}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+258 84 / 85 / 86 XXX XXXX"
                          className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                            fieldErrors.phone ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        />
                      </div>
                    )}

                    {/* E-mail */}
                    {reqOf('email', 'opcional') !== 'oculto' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Endereço de E-mail{' '}
                          {reqOf('email', 'opcional') === 'obrigatorio' ? (
                            <span className="text-rose-400">*</span>
                          ) : (
                            <span className="text-slate-500 font-normal">(Opcional)</span>
                          )}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="nome@exemplo.mz"
                          className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                            fieldErrors.email ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        />
                      </div>
                    )}

                    {/* NUIT */}
                    {reqOf('nuit', 'opcional') !== 'oculto' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          NUIT{' '}
                          {reqOf('nuit', 'opcional') === 'obrigatorio' ? (
                            <span className="text-rose-400">*</span>
                          ) : (
                            <span className="text-slate-500 font-normal">(Opcional)</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={nuit}
                          onChange={e => setNuit(e.target.value)}
                          placeholder="9 dígitos do NUIT"
                          className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono ${
                            fieldErrors.nuit ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        />
                      </div>
                    )}

                    {/* Escola Anterior */}
                    {reqOf('previousSchool', 'opcional') !== 'oculto' && (
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-300">
                          Escola ou Habilitações Anteriores{' '}
                          {reqOf('previousSchool', 'opcional') === 'obrigatorio' ? (
                            <span className="text-rose-400">*</span>
                          ) : (
                            <span className="text-slate-500 font-normal">(Opcional)</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={previousSchool}
                          onChange={e => setPreviousSchool(e.target.value)}
                          placeholder="Estabelecimento frequentado anteriormente"
                          className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                            fieldErrors.previousSchool ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* SEÇÃO: Encarregados de Educação (conforme campos visíveis) */}
                  {showGuardianSection && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <HeartHandshake className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Dados do Encarregado de Educação
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reqOf('guardianName', 'opcional') !== 'oculto' && (
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-300">
                              Nome do Pai / Mãe / Tutor(a){' '}
                              {reqOf('guardianName', 'opcional') === 'obrigatorio' ? (
                                <span className="text-rose-400">*</span>
                              ) : (
                                <span className="text-slate-500 font-normal">(Opcional)</span>
                              )}
                            </label>
                            <input
                              type="text"
                              value={guardianName}
                              onChange={e => setGuardianName(e.target.value)}
                              placeholder="Nome Completo do Encarregado"
                              className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                                fieldErrors.guardianName ? 'border-rose-500' : 'border-slate-800'
                              }`}
                            />
                          </div>
                        )}

                        {reqOf('guardianRelationship', 'oculto') !== 'oculto' && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">
                              Grau de Parentesco{' '}
                              {reqOf('guardianRelationship', 'oculto') === 'obrigatorio' ? (
                                <span className="text-rose-400">*</span>
                              ) : (
                                <span className="text-slate-500 font-normal">(Opcional)</span>
                              )}
                            </label>
                            <select
                              value={guardianRelationship}
                              onChange={e => setGuardianRelationship(e.target.value)}
                              className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer ${
                                fieldErrors.guardianRelationship ? 'border-rose-500' : 'border-slate-800'
                              }`}
                            >
                              <option value="">Selecionar...</option>
                              <option value="Mãe">Mãe</option>
                              <option value="Pai">Pai</option>
                              <option value="Avó/Avô">Avó / Avô</option>
                              <option value="Tutor Legal">Tutor(a) Legal</option>
                              <option value="Tio/Tia">Tio / Tia</option>
                              <option value="Outro">Outro Responsável</option>
                            </select>
                          </div>
                        )}

                        {reqOf('guardianPhone', 'opcional') !== 'oculto' && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">
                              Telefone do Encarregado{' '}
                              {reqOf('guardianPhone', 'opcional') === 'obrigatorio' ? (
                                <span className="text-rose-400">*</span>
                              ) : (
                                <span className="text-slate-500 font-normal">(Opcional)</span>
                              )}
                            </label>
                            <input
                              type="tel"
                              value={guardianPhone}
                              onChange={e => setGuardianPhone(e.target.value)}
                              placeholder="+258 82 / 84 / 86 XXX XXXX"
                              className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                                fieldErrors.guardianPhone ? 'border-rose-500' : 'border-slate-800'
                              }`}
                            />
                          </div>
                        )}

                        {reqOf('authorizedPickupPersons', 'oculto') !== 'oculto' && (
                          <div className="sm:col-span-3 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">
                              Pessoas Autorizadas a Buscar a Criança{' '}
                              {reqOf('authorizedPickupPersons', 'oculto') === 'obrigatorio' ? (
                                <span className="text-rose-400">*</span>
                              ) : (
                                <span className="text-slate-500 font-normal">(Opcional)</span>
                              )}
                            </label>
                            <input
                              type="text"
                              value={authorizedPickupPersons}
                              onChange={e => setAuthorizedPickupPersons(e.target.value)}
                              placeholder="Nomes completos das pessoas autorizadas e contactos"
                              className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                                fieldErrors.authorizedPickupPersons ? 'border-rose-500' : 'border-slate-800'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Localização & Endereço */}
                  {(reqOf('province', 'opcional') !== 'oculto' ||
                    reqOf('city', 'opcional') !== 'oculto' ||
                    reqOf('address', 'opcional') !== 'oculto') && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {reqOf('province', 'opcional') !== 'oculto' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Província{' '}
                            {reqOf('province', 'opcional') === 'obrigatorio' ? (
                              <span className="text-rose-400">*</span>
                            ) : (
                              <span className="text-slate-500 font-normal">(Opcional)</span>
                            )}
                          </label>
                          <select
                            value={province}
                            onChange={e => setProvince(e.target.value)}
                            className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer ${
                              fieldErrors.province ? 'border-rose-500' : 'border-slate-800'
                            }`}
                          >
                            <option value="">Selecionar província...</option>
                            {PROVINCES_MOZAMBIQUE.map(p => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {reqOf('city', 'opcional') !== 'oculto' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Cidade / Distrito{' '}
                            {reqOf('city', 'opcional') === 'obrigatorio' ? (
                              <span className="text-rose-400">*</span>
                            ) : (
                              <span className="text-slate-500 font-normal">(Opcional)</span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            placeholder="Cidade ou distrito de residência"
                            className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                              fieldErrors.city ? 'border-rose-500' : 'border-slate-800'
                            }`}
                          />
                        </div>
                      )}

                      {reqOf('address', 'opcional') !== 'oculto' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Bairro / Rua{' '}
                            {reqOf('address', 'opcional') === 'obrigatorio' ? (
                              <span className="text-rose-400">*</span>
                            ) : (
                              <span className="text-slate-500 font-normal">(Opcional)</span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="Bairro, quarteirão ou avenida"
                            className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 ${
                              fieldErrors.address ? 'border-rose-500' : 'border-slate-800'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setStepErrors([]);
                        setCurrentStep(1);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar à {isChildCenter ? 'Sala' : 'Opção'}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToNextStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                    >
                      Avançar para Questionário
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Questionário de Admissão */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-emerald-400" />
                      3. Questionário de Admissão
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Responda às questões configuradas pela direção da {resolvedPublicInst.name}.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {visibleQuestions.length > 0 ? (
                      visibleQuestions.map(q => (
                        <div
                          key={q.id}
                          className={`p-4 rounded-2xl bg-slate-950 border space-y-2 ${
                            fieldErrors[`q_${q.id}`] ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        >
                          <label className="text-xs font-semibold text-slate-200 block">
                            {q.question} {q.required && <span className="text-rose-400">*</span>}
                          </label>

                          {q.type === 'text' && (
                            <input
                              type="text"
                              value={customAnswers[q.id] || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Digite a sua resposta..."
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          )}

                          {q.type === 'boolean' && (
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  value="Sim"
                                  checked={customAnswers[q.id] === 'Sim'}
                                  onChange={() => handleAnswerChange(q.id, 'Sim')}
                                  className="text-emerald-500 focus:ring-0"
                                />
                                Sim
                              </label>
                              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  value="Não"
                                  checked={customAnswers[q.id] === 'Não'}
                                  onChange={() => handleAnswerChange(q.id, 'Não')}
                                  className="text-emerald-500 focus:ring-0"
                                />
                                Não
                              </label>
                            </div>
                          )}

                          {q.type === 'select' && (
                            <select
                              value={customAnswers[q.id] || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="">Selecione uma opção...</option>
                              {(q.options || []).map(opt => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        Não há perguntas adicionais configuradas para esta instituição.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setStepErrors([]);
                        setCurrentStep(2);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar aos Dados
                    </button>
                    <button
                      type="button"
                      onClick={() => goToNextStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                    >
                      Avançar para Documentos
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Documentos Digitais */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      4. Documentos da Candidatura
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submeta cópias legíveis: PDF (máx. 450 KB) ou imagem JPG/PNG/WEBP (até 5 MB, comprimida automaticamente), conforme definido pela {resolvedPublicInst.name}.
                    </p>
                    <input
                      ref={docFileInputRef}
                      type="file"
                      accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
                      onChange={handleDocFileChange}
                      className="hidden"
                    />
                  </div>

                  {configuredDocuments.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                      Esta instituição não exige anexo digital de documentos nesta etapa. Pode avançar para finalizar a candidatura.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {configuredDocuments.map(docItem => {
                        const isUploaded = !!uploadedDocs[docItem.name];
                        const isDocRequired = docItem.requirement === 'obrigatorio';

                        return (
                          <div
                            key={docItem.name}
                            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isUploaded
                                ? 'bg-emerald-950/20 border-emerald-500/40'
                                : fieldErrors[`doc_${docItem.name}`]
                                ? 'bg-rose-950/20 border-rose-500'
                                : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  isUploaded
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {isUploaded ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white text-xs truncate">
                                  {docItem.name} {isDocRequired && <span className="text-rose-400">*</span>}
                                </p>
                                {isUploaded ? (
                                  <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                                    {uploadedDocs[docItem.name].fileName} ({uploadedDocs[docItem.name].fileSize})
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {isDocRequired ? 'Obrigatório' : 'Opcional'} • PDF (até 450 KB), JPG ou PNG
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isUploaded ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDoc(docItem.name)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                                >
                                  Remover
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUploadDoc(docItem.name)}
                                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                                  Carregar Arquivo
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setStepErrors([]);
                        setCurrentStep(3);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar ao Questionário
                    </button>
                    <button
                      type="button"
                      onClick={() => goToNextStep(4)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                    >
                      Avançar para Pagamento
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Pagamento e Finalização */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      5. Taxa de Candidatura &amp; Submissão Oficial
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {coursePrice > 0 ? (
                        <>
                          Taxa de inscrição configurada:{' '}
                          <strong className="text-emerald-400 font-mono">{coursePrice.toLocaleString()} MT</strong>.
                        </>
                      ) : (
                        'Este curso/sala não possui taxa de inscrição online configurada.'
                      )}
                    </p>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'M-Pesa', label: 'M-Pesa', desc: 'Carteira Móvel Vodacom' },
                      { id: 'e-Mola', label: 'e-Mola', desc: 'Carteira Móvel Movitel' },
                      {
                        id: 'BIM',
                        label: 'Transferência Bancária',
                        desc: resolvedPublicInst.paymentMethods?.bankName || 'Via Bancária Institucional'
                      },
                      { id: 'Presencial', label: 'Secretaria', desc: 'Presencial no balcão' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPaymentMethod(item.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          paymentMethod === item.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-bold text-xs block text-white">{item.label}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 truncate">{item.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment Box */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    {(paymentMethod === 'M-Pesa' || paymentMethod === 'e-Mola') && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">Instruções {paymentMethod} Oficial</span>
                          <span className="text-[11px] font-mono text-emerald-400">
                            Taxa: {coursePrice > 0 ? `${coursePrice.toLocaleString()} MT` : 'Gratuito'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Por segurança, as contas de recebimento M-Pesa/e-Mola são consultadas directamente na secretaria da{' '}
                          {resolvedPublicInst.name}
                          {resolvedPublicInst.phone ? ` (${resolvedPublicInst.phone})` : ''} ou após autenticação no Portal de Pagamentos.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
                          <input
                            type="tel"
                            value={mpesaNumber}
                            onChange={e => setMpesaNumber(e.target.value)}
                            placeholder="Seu nº telemóvel (ex: 84/86 XXX XXXX)"
                            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={paymentTxCode}
                              onChange={e => {
                                setPaymentTxCode(e.target.value);
                                setPaymentReferenceSubmitted(false);
                              }}
                              placeholder="Código da Transação (opcional)"
                              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                            />
                            <button
                              type="button"
                              onClick={handleSubmitPaymentReference}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                                paymentReferenceSubmitted
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                              }`}
                            >
                              {paymentReferenceSubmitted ? 'Ref. Registada' : 'Registar Ref.'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'BIM' && (
                      <div className="space-y-3 text-xs text-slate-300">
                        <p className="font-semibold text-white">Instruções de Pagamento Bancário:</p>
                        <div className="p-3 rounded-xl bg-slate-900 text-[11px] space-y-1">
                          {resolvedPublicInst.paymentMethods?.bankName && (
                            <p>
                              Banco: <strong className="text-white">{resolvedPublicInst.paymentMethods.bankName}</strong>
                            </p>
                          )}
                          <p>
                            Beneficiário: <strong className="text-white">{resolvedPublicInst.name}</strong>
                          </p>
                          <p className="text-slate-400">Consulte o NIB/IBAN oficial com a secretaria ou no Portal de Pagamentos.</p>
                        </div>
                        <input
                          type="text"
                          value={paymentTxCode}
                          onChange={e => setPaymentTxCode(e.target.value)}
                          placeholder="Referência do talão / transferência (opcional)"
                          className="w-full max-w-md px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                        />
                      </div>
                    )}

                    {paymentMethod === 'Presencial' && (
                      <div className="text-xs text-slate-300 space-y-1">
                        <p className="font-semibold text-white">Pagamento Direto na Secretaria:</p>
                        <p className="text-slate-400">
                          Poderá efectuar o pagamento presencialmente na secretaria da {resolvedPublicInst.name} no ato de conferência documental.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Regulamento e Privacidade */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={e => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs text-slate-300">
                        Declaro que li e aceito o{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-emerald-400 underline hover:text-emerald-300 font-semibold cursor-pointer"
                        >
                          Regulamento de Candidaturas
                        </button>{' '}
                        da {resolvedPublicInst.name}.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={e => setPrivacyAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs text-slate-300">
                        Concordo com o tratamento dos dados pessoais submetidos em conformidade com a{' '}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-emerald-400 underline hover:text-emerald-300 font-semibold cursor-pointer"
                        >
                          Política de Privacidade
                        </button>
                        .
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setStepErrors([]);
                        setCurrentStep(4);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar aos Documentos
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                          <span>Processando Candidatura...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Finalizar e Submeter Candidatura</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )
        ) : (
          /* TAB 2: CONSULTA PÚBLICA DE ESTADO (RASTREAMENTO SEGURO COM ANONIMIZAÇÃO PII) */
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-400" />
                Consulta Pública de Candidatura
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Acompanhe o estado da sua inscrição na {resolvedPublicInst.name} inserindo o código da candidatura.
              </p>
            </div>

            <form onSubmit={handleSearchApplication} className="flex gap-2 max-w-xl">
              <input
                type="text"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                placeholder={`Ex: ${(resolvedPublicInst.code || 'CAND').replace(/[^a-zA-Z0-9]/g, '')}-${new Date().getFullYear()}-1042`}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
              >
                <Search className="w-4 h-4" />
                Pesquisar
              </button>
            </form>

            {lookupAttempted &&
              (lookedUpApplication ? (
                <div className="max-w-2xl p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-400 block">{lookedUpApplication.code}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">
                        {maskCandidateName(lookedUpApplication.fullName)}
                      </h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        lookedUpApplication.status === 'Aprovada'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : lookedUpApplication.status === 'Matriculado'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : lookedUpApplication.status === 'Rejeitada'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {lookedUpApplication.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">{isChildCenter ? 'Sala / Grupo' : 'Curso'}</span>
                      <span className="font-semibold text-white">{lookedUpApplication.courseName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Data de Submissão</span>
                      <span>{formatFirestoreTimestamp(lookedUpApplication.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Taxa de Inscrição</span>
                      <span>{lookedUpApplication.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Dúvidas sobre o seu processo?</span>
                    {validatedWhatsAppNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          const msg = encodeURIComponent(
                            `Olá Secretaria da ${resolvedPublicInst.name}! Gostaria de informações sobre a candidatura #${lookedUpApplication.code}.`
                          );
                          window.open(`https://wa.me/${validatedWhatsAppNumber}?text=${msg}`, '_blank');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Falar com a Secretaria no WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Nenhuma candidatura encontrada na {resolvedPublicInst.name} com os dados informados.
                </div>
              ))}
          </div>
        )}
      </main>

      {/* Modal Termos e Condições */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Regulamento de Candidaturas • {resolvedPublicInst.name}
              </h4>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto leading-relaxed whitespace-pre-line">
              {resolvedTermsText}
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Aceitar Regulamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Política de Privacidade */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Política de Privacidade • {resolvedPublicInst.name}
              </h4>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto leading-relaxed whitespace-pre-line">
              {resolvedPrivacyText}
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setPrivacyAccepted(true);
                  setShowPrivacyModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Aceitar Privacidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PhoneCallBadge: React.FC<{ phone: string }> = ({ phone }) => (
  <span className="inline-flex items-center gap-1">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
    <span>Contacto: {phone}</span>
  </span>
);
