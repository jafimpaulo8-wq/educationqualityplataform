import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileCheck,
  FileText,
  Landmark,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  Plus,
  Receipt,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  Wallet,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { SigarAuthModal } from '../../components/common/SigarAuthModal';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { PaymentProofModal } from './PaymentProofModal';
import {
  extractSlugFromLocation,
  resolveInstitutionSlug,
  resolvePublicInstitutionBySlug,
  compressImageToBase64
} from '../../services/publicInstitutionService';
import {
  hasFinancialPermission,
  fetchOwnStudentRecordsForPortal,
  fetchPortalAccountsReceivable,
  fetchPortalPayments,
  fetchPortalReceipts,
  fetchAuthorizedInstitutionFinancialConfig,
  createPortalPaymentSubmission,
  resubmitPortalPayment,
  approvePortalPaymentIdempotent,
  rejectPortalPayment,
  requestCorrectionPortalPayment,
  saveReceivingAccount,
  deleteReceivingAccount,
  saveInstitutionFinancialSettings,
  createContaReceberInFirestore
} from '../../services/paymentPortalService';
import {
  Institution,
  PublicInstitution,
  Student,
  PaymentRecord,
  PaymentNetwork,
  PaymentServiceItem,
  PAYMENT_SERVICE_CATALOG,
  ContaReceber,
  OfficialReceiptRecord,
  InstitutionalReceivingAccount,
  RECEIVABLE_CATEGORY_CONFIG
} from '../../types';
import { toCanonicalRole } from '../../types/rbac';

type StaffPortalTab = 'fila' | 'pagamentos' | 'obrigacoes' | 'recibos' | 'contas';
type StudentPortalTab = 'obrigacoes' | 'submeter' | 'historico';

export const IndependentPaymentPortalView: React.FC = () => {
  const {
    firebaseUser,
    userProfile,
    activeRole,
    allInstitutions,
    activeInstitution,
    logout,
    navigate,
    setPublicPortalIdentity,
    themeMode
  } = useApp();
  const toast = useToast();

  const isLight = themeMode === 'branco';
  const [slug, setSlug] = useState<string>(() => {
    const fromUrl = extractSlugFromLocation();
    if (fromUrl) return fromUrl;
    if (activeInstitution?.id) return resolveInstitutionSlug(activeInstitution);
    return '';
  });

  const [loadingPublic, setLoadingPublic] = useState(true);
  const [publicInst, setPublicInst] = useState<PublicInstitution | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Tenant operational state (loaded exclusively for the authorized institutionId)
  const [loadingTenantData, setLoadingTenantData] = useState(false);
  const [ownStudents, setOwnStudents] = useState<Student[]>([]);
  const [receivables, setReceivables] = useState<ContaReceber[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [receipts, setReceipts] = useState<OfficialReceiptRecord[]>([]);
  const [receivingAccounts, setReceivingAccounts] = useState<InstitutionalReceivingAccount[]>([]);
  const [authorizedInstModel, setAuthorizedInstModel] = useState<Institution | null>(null);

  // Navigation & modals
  const [staffTab, setStaffTab] = useState<StaffPortalTab>('fila');
  const [studentTab, setStudentTab] = useState<StudentPortalTab>('obrigacoes');
  const [selectedProofPayment, setSelectedProofPayment] = useState<PaymentRecord | null>(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);

  // Student submission / resubmission state
  const [resubmitTarget, setResubmitTarget] = useState<PaymentRecord | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedReceivableId, setSelectedReceivableId] = useState<string>('');
  const [serviceItem, setServiceItem] = useState<PaymentServiceItem>('mensalidade');
  const [serviceDescription, setServiceDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('4500');
  const [network, setNetwork] = useState<PaymentNetwork>('M-Pesa');
  const [transactionCode, setTransactionCode] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [payTime, setPayTime] = useState<string>(() => new Date().toTimeString().slice(0, 5));
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [submittingProof, setSubmittingProof] = useState<boolean>(false);

  // Staff review actions
  const [reviewActionTarget, setReviewActionTarget] = useState<{
    payment: PaymentRecord;
    mode: 'approve' | 'correct' | 'reject';
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [processingReview, setProcessingReview] = useState<boolean>(false);

  // Receiving account form (staff financeiro only)
  const [newAccChannel, setNewAccChannel] = useState<'M-Pesa' | 'e-Mola' | 'mKesh' | 'Banco'>('M-Pesa');
  const [newAccLabel, setNewAccLabel] = useState<string>('');
  const [newAccNumber, setNewAccNumber] = useState<string>('');
  const [newAccHolder, setNewAccHolder] = useState<string>('');
  const [newAccNib, setNewAccNib] = useState<string>('');
  const [newAccInstructions, setNewAccInstructions] = useState<string>('');
  const [savingAccount, setSavingAccount] = useState<boolean>(false);

  // New obligation quick form (staff financeiro only)
  const [newOblStudentName, setNewOblStudentName] = useState<string>('');
  const [newOblStudentCode, setNewOblStudentCode] = useState<string>('');
  const [newOblCategory, setNewOblCategory] = useState<keyof typeof RECEIVABLE_CATEGORY_CONFIG>('mensalidade');
  const [newOblDescription, setNewOblDescription] = useState<string>('');
  const [newOblAmount, setNewOblAmount] = useState<string>('');
  const [newOblDueDate, setNewOblDueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Listen to URL/hash slug updates
  useEffect(() => {
    const syncSlugFromUrl = () => {
      const urlSlug = extractSlugFromLocation();
      if (urlSlug) {
        setSlug(urlSlug);
      }
    };
    window.addEventListener('hashchange', syncSlugFromUrl);
    window.addEventListener('popstate', syncSlugFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncSlugFromUrl);
      window.removeEventListener('popstate', syncSlugFromUrl);
    };
  }, []);

  // Resolve public institutional metadata by slug (never exposes private numbers)
  useEffect(() => {
    let active = true;
    const loadPublic = async () => {
      if (!slug) {
        if (active) {
          setPublicInst(null);
          setLoadingPublic(false);
        }
        return;
      }
      setLoadingPublic(true);
      try {
        const resolved = await resolvePublicInstitutionBySlug(slug, allInstitutions);
        if (!active) return;
        setPublicInst(resolved);
        if (resolved) {
          setPublicPortalIdentity({
            officialName: resolved.name,
            logoUrl: resolved.logoUrl,
            emblemUrl: resolved.emblemUrl,
            faviconUrl: resolved.faviconUrl || resolved.logoUrl || resolved.emblemUrl,
            institutionId: resolved.institutionId,
            slug: resolved.slug
          });
        } else {
          setPublicPortalIdentity(null);
        }
      } catch (err) {
        console.warn('[IndependentPaymentPortal] Erro ao resolver portal público:', err);
        if (active) setPublicInst(null);
      } finally {
        if (active) setLoadingPublic(false);
      }
    };
    loadPublic();
    return () => {
      active = false;
    };
  }, [slug, allInstitutions, setPublicPortalIdentity]);

  // Reset publicPortalIdentity on unmount
  useEffect(() => {
    return () => {
      setPublicPortalIdentity(null);
    };
  }, [setPublicPortalIdentity]);

  const canonicalRole = toCanonicalRole(activeRole);
  const isSuperAdmin =
    canonicalRole === 'SUPER_ADMIN' ||
    (firebaseUser?.email === 'moztechwavenacala8@gmail.com' && firebaseUser?.emailVerified === true);

  const authorizedInstId = publicInst?.institutionId || '';

  const isTenantAuthorized = useMemo(() => {
    if (!firebaseUser || !authorizedInstId) return false;
    if (isSuperAdmin) return true;
    if (userProfile?.institutionId === authorizedInstId) return true;
    if (Array.isArray(userProfile?.institutionIds) && userProfile.institutionIds.includes(authorizedInstId)) return true;
    if (Array.isArray(userProfile?.ownedInstitutions) && userProfile.ownedInstitutions.includes(authorizedInstId)) return true;
    return false;
  }, [firebaseUser, authorizedInstId, isSuperAdmin, userProfile]);

  const isFinancialStaff = useMemo(
    () => isTenantAuthorized && hasFinancialPermission(canonicalRole, isSuperAdmin),
    [isTenantAuthorized, canonicalRole, isSuperAdmin]
  );

  const isStudentOrGuardian = useMemo(
    () => isTenantAuthorized && (canonicalRole === 'ALUNO' || canonicalRole === 'RESPONSAVEL'),
    [isTenantAuthorized, canonicalRole]
  );

  const loadAuthorizedFinancialData = useCallback(async () => {
    if (!firebaseUser || !authorizedInstId || !isTenantAuthorized) {
      setOwnStudents([]);
      setReceivables([]);
      setPayments([]);
      setReceipts([]);
      setReceivingAccounts([]);
      setAuthorizedInstModel(null);
      return;
    }

    if (!isFinancialStaff && !isStudentOrGuardian) {
      setOwnStudents([]);
      setReceivables([]);
      setPayments([]);
      setReceipts([]);
      setReceivingAccounts([]);
      return;
    }

    setLoadingTenantData(true);
    try {
      const linkedStudentIds = Array.from(new Set([
        ...((userProfile as any)?.studentId ? [(userProfile as any).studentId] : []),
        ...(Array.isArray((userProfile as any)?.studentIds) ? (userProfile as any).studentIds : [])
      ].filter(Boolean)));

      if (isFinancialStaff) {
        const [configRes, payList, recList, rcpList] = await Promise.all([
          fetchAuthorizedInstitutionFinancialConfig(authorizedInstId),
          fetchPortalPayments(authorizedInstId, { isFinancialStaff: true }),
          fetchPortalAccountsReceivable(authorizedInstId, { isFinancialStaff: true }),
          fetchPortalReceipts(authorizedInstId, { isFinancialStaff: true })
        ]);
        setAuthorizedInstModel(configRes.institution);
        setReceivingAccounts(configRes.receivingAccounts);
        setPayments(payList);
        setReceivables(recList);
        setReceipts(rcpList);
      } else if (isStudentOrGuardian) {
        const uid = firebaseUser.uid;
        const email = firebaseUser.email || undefined;
        const [studentList, payList, recList, rcpList] = await Promise.all([
          fetchOwnStudentRecordsForPortal(authorizedInstId, uid, email, linkedStudentIds),
          fetchPortalPayments(authorizedInstId, {
            isFinancialStaff: false,
            uid,
            email,
            linkedStudentIds
          }),
          fetchPortalAccountsReceivable(authorizedInstId, {
            isFinancialStaff: false,
            uid,
            email,
            linkedStudentIds
          }),
          fetchPortalReceipts(authorizedInstId, {
            isFinancialStaff: false,
            uid,
            email,
            linkedStudentIds
          })
        ]);
        setOwnStudents(studentList);
        if (studentList.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentList[0].id);
        }
        setPayments(payList);
        setReceivables(recList);
        setReceipts(rcpList);
      }
    } catch (err) {
      console.warn('[IndependentPaymentPortal] Erro ao carregar dados financeiros do centro:', err);
    } finally {
      setLoadingTenantData(false);
    }
  }, [
    firebaseUser,
    authorizedInstId,
    isTenantAuthorized,
    isFinancialStaff,
    isStudentOrGuardian,
    userProfile,
    selectedStudentId
  ]);

  useEffect(() => {
    loadAuthorizedFinancialData();
  }, [loadAuthorizedFinancialData]);

  // Derived receipt institution object (preserves branding of the URL portal institution)
  const receiptInstitutionShape = useMemo<Partial<Institution>>(() => {
    if (authorizedInstModel) return authorizedInstModel;
    if (publicInst) {
      return {
        id: publicInst.institutionId,
        name: publicInst.name,
        code: publicInst.code,
        sigla: publicInst.sigla,
        nuit: publicInst.nuit,
        phone: publicInst.phone,
        email: publicInst.email,
        address: publicInst.address,
        city: publicInst.city,
        province: publicInst.province,
        logoUrl: publicInst.logoUrl,
        emblemUrl: publicInst.emblemUrl,
        faviconUrl: publicInst.faviconUrl,
        slogan: publicInst.slogan
      };
    }
    return activeInstitution;
  }, [authorizedInstModel, publicInst, activeInstitution]);

  const handleSelectProofFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToBase64(file, 140000);
      setProofUrl(compressed);
      setProofFileName(file.name);
      toast.success('Comprovativo anexado e otimizado.');
    } catch {
      toast.error('Não foi possível processar a imagem selecionada.');
    }
  };

  const handleStartPayFromReceivable = (conta: ContaReceber) => {
    setResubmitTarget(null);
    setSelectedReceivableId(conta.id);
    if (conta.studentId) setSelectedStudentId(conta.studentId);
    const mappedCategory = (
      Object.keys(PAYMENT_SERVICE_CATALOG).includes(conta.category) ? conta.category : 'outros'
    ) as PaymentServiceItem;
    setServiceItem(mappedCategory);
    setServiceDescription(conta.description || conta.title || '');
    const remaining = Math.max(0, (conta.totalAmount ?? conta.amount) - (conta.paidAmount ?? 0));
    setAmount(String(remaining > 0 ? remaining : conta.amount));
    setStudentTab('submeter');
  };

  const handleStartResubmit = (payment: PaymentRecord) => {
    setResubmitTarget(payment);
    setSelectedReceivableId(payment.contaReceberId || '');
    setSelectedStudentId(payment.studentId);
    if (payment.serviceItem) setServiceItem(payment.serviceItem);
    setServiceDescription(payment.serviceDescription || '');
    setAmount(String(payment.amount));
    setNetwork(payment.network);
    setTransactionCode(payment.transactionCode);
    setPayDate(payment.date || new Date().toISOString().split('T')[0]);
    setPayTime(payment.time || '12:00');
    setProofUrl(payment.proofUrl || '');
    setProofFileName(payment.proofFileName || '');
    setStudentTab('submeter');
  };

  const handleStudentSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !authorizedInstId) return;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error('Indique um valor de pagamento válido superior a 0 MT.');
      return;
    }
    if (!transactionCode.trim()) {
      toast.error('Informe o código ou referência da transação.');
      return;
    }

    const activeStudent = ownStudents.find(s => s.id === selectedStudentId) || ownStudents[0];
    const resolvedStudentId = activeStudent?.id || (userProfile as any)?.studentId || firebaseUser.uid;
    const resolvedStudentName = activeStudent?.fullName || userProfile?.name || firebaseUser.displayName || 'Estudante';
    const resolvedStudentCode = activeStudent?.code || (userProfile as any)?.studentCode || 'PORTAL';

    setSubmittingProof(true);
    try {
      if (resubmitTarget) {
        const audit = [
          {
            id: `aud-${Date.now()}-resub`,
            timestamp: new Date().toISOString(),
            actorName: resolvedStudentName,
            actorRole: canonicalRole === 'RESPONSAVEL' ? 'Encarregado de Educação' : 'Aluno / Formando',
            action: 'Reenvio de Comprovativo Corrigido',
            details: `Novo código: ${transactionCode.trim()}, Valor: ${numericAmount} MT via ${network}.`
          },
          ...(resubmitTarget.auditTrail || [])
        ];

        await resubmitPortalPayment(resubmitTarget.id, {
          institutionId: authorizedInstId,
          studentId: resubmitTarget.studentId,
          studentUserId: resubmitTarget.studentUserId,
          guardianUserId: resubmitTarget.guardianUserId,
          transactionCode: transactionCode.trim(),
          amount: numericAmount,
          date: payDate,
          time: payTime,
          network,
          proofUrl: proofUrl || undefined,
          proofFileName: proofFileName || undefined,
          auditTrail: audit
        });
        toast.success('Comprovativo retificado e reenviado para confirmação da tesouraria.');
      } else {
        const now = new Date().toISOString();
        const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newRecord: PaymentRecord = {
          id: paymentId,
          institutionId: authorizedInstId,
          studentId: resolvedStudentId,
          studentName: resolvedStudentName,
          studentCode: resolvedStudentCode,
          studentUserId: activeStudent?.userId || (canonicalRole === 'ALUNO' ? firebaseUser.uid : undefined),
          guardianUserId: (activeStudent as any)?.guardianUserId || (canonicalRole === 'RESPONSAVEL' ? firebaseUser.uid : undefined),
          guardianUids: (activeStudent as any)?.guardianUids,
          guardianEmail: (activeStudent as any)?.guardianEmail,
          submittedByUid: firebaseUser.uid,
          contaReceberId: selectedReceivableId || undefined,
          serviceItem,
          serviceDescription: serviceDescription.trim() || PAYMENT_SERVICE_CATALOG[serviceItem]?.label,
          amount: numericAmount,
          date: payDate,
          time: payTime,
          network,
          transactionCode: transactionCode.trim(),
          proofUrl: proofUrl || undefined,
          proofFileName: proofFileName || undefined,
          studentNotes: studentNotes.trim() || undefined,
          status: 'PENDENTE DE CONFIRMAÇÃO',
          createdAt: now,
          serviceReleased: false,
          auditTrail: [
            {
              id: `aud-${Date.now()}-sub`,
              timestamp: now,
              actorName: resolvedStudentName,
              actorRole: canonicalRole === 'RESPONSAVEL' ? 'Encarregado de Educação' : 'Aluno / Formando',
              action: 'Submissão no Portal de Pagamentos',
              details: `Valor: ${numericAmount.toLocaleString('pt-MZ')} MT via ${network}. Código: ${transactionCode.trim()}.`
            }
          ]
        };

        await createPortalPaymentSubmission(newRecord);
        toast.success('Comprovativo submetido! Aguardando validação da tesouraria.');
      }

      setResubmitTarget(null);
      setSelectedReceivableId('');
      setTransactionCode('');
      setStudentNotes('');
      setProofUrl('');
      setProofFileName('');
      setStudentTab('historico');
      await loadAuthorizedFinancialData();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao submeter comprovativo.');
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleConfirmReviewAction = async () => {
    if (!reviewActionTarget || !isFinancialStaff || !firebaseUser) return;
    const { payment, mode } = reviewActionTarget;
    const operatorName = userProfile?.name || firebaseUser.displayName || firebaseUser.email || 'Tesouraria';
    const now = new Date().toISOString();

    if (mode !== 'approve' && !reviewNotes.trim()) {
      toast.error('Informe o motivo ou orientação antes de confirmar.');
      return;
    }

    setProcessingReview(true);
    try {
      if (mode === 'approve') {
        if (payment.status === 'PAGO' && payment.receiptNumber) {
          toast.info(`Pagamento já validado anteriormente com o recibo ${payment.receiptNumber}.`);
          setReviewActionTarget(null);
          return;
        }
        const receiptNumber =
          payment.receiptNumber || `REC-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
        const serviceReleaseMessage =
          payment.serviceDescription ||
          (payment.serviceItem ? PAYMENT_SERVICE_CATALOG[payment.serviceItem]?.serviceReleaseDetail : '') ||
          'Pagamento homologado pela tesouraria institucional.';
        const audit = [
          {
            id: `aud-${Date.now()}-app`,
            timestamp: now,
            actorName: operatorName,
            actorRole: canonicalRole,
            action: 'Validação Financeira & Emissão de Recibo',
            details: `Recibo ${receiptNumber} emitido sem duplicação. ${reviewNotes ? `Obs: ${reviewNotes}` : ''}`
          },
          ...(payment.auditTrail || [])
        ];

        const res = await approvePortalPaymentIdempotent({
          payment,
          operatorName,
          operatorUid: firebaseUser.uid,
          receiptNumber,
          serviceReleaseMessage,
          balanceBefore: payment.balanceBefore ?? 0,
          balanceAfter: Math.max(0, (payment.balanceBefore ?? payment.amount) - payment.amount),
          auditTrail: audit,
          notes: reviewNotes.trim() || undefined
        });
        toast.success(
          res.alreadyApproved
            ? `Recibo ${res.receipt.receiptNumber} já havia sido emitido anteriormente (sem duplicação).`
            : `Pagamento validado e recibo ${res.receipt.receiptNumber} emitido com sucesso!`
        );
      } else if (mode === 'correct') {
        const audit = [
          {
            id: `aud-${Date.now()}-cor`,
            timestamp: now,
            actorName: operatorName,
            actorRole: canonicalRole,
            action: 'Correção Solicitada',
            details: reviewNotes.trim()
          },
          ...(payment.auditTrail || [])
        ];
        await requestCorrectionPortalPayment(payment, reviewNotes.trim(), operatorName, audit);
        toast.success('Solicitação de correção enviada ao aluno/encarregado.');
      } else {
        const audit = [
          {
            id: `aud-${Date.now()}-rej`,
            timestamp: now,
            actorName: operatorName,
            actorRole: canonicalRole,
            action: 'Pagamento Rejeitado',
            details: reviewNotes.trim()
          },
          ...(payment.auditTrail || [])
        ];
        await rejectPortalPayment(payment, reviewNotes.trim(), operatorName, audit);
        toast.success('Pagamento marcado como rejeitado.');
      }

      setReviewActionTarget(null);
      setReviewNotes('');
      await loadAuthorizedFinancialData();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao processar validação financeira.');
    } finally {
      setProcessingReview(false);
    }
  };

  const handleSaveReceivingAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFinancialStaff || !authorizedInstId) return;
    if (!newAccNumber.trim() || !newAccHolder.trim()) {
      toast.error('Informe o número/IBAN da conta e o nome do titular.');
      return;
    }
    setSavingAccount(true);
    try {
      const accountId = `acc-${newAccChannel.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;
      const newAcc: InstitutionalReceivingAccount = {
        id: accountId,
        institutionId: authorizedInstId,
        channel: newAccChannel,
        label: newAccLabel.trim() || `${newAccChannel} Oficial`,
        accountNumber: newAccNumber.trim(),
        holderName: newAccHolder.trim(),
        nib: newAccNib.trim() || undefined,
        instructions: newAccInstructions.trim() || undefined,
        isActive: true,
        updatedAt: new Date().toISOString(),
        updatedBy: userProfile?.name || firebaseUser?.email || 'Financeiro'
      };
      await saveReceivingAccount(authorizedInstId, newAcc);

      // Espelhar no objeto privado financialSettings (apenas para acesso autorizado financeiro)
      const currentSettings = authorizedInstModel?.financialSettings || {
        currency: 'MT',
        currencySymbol: 'MT',
        taxRate: 0,
        paymentMethods: [],
        pixKey: '',
        dueDay: 10
      };
      const patchSettings = { ...currentSettings };
      if (newAccChannel === 'M-Pesa') {
        patchSettings.mpesaNumber = newAccNumber.trim();
        patchSettings.mpesaHolderName = newAccHolder.trim();
      } else if (newAccChannel === 'e-Mola') {
        patchSettings.emolaNumber = newAccNumber.trim();
        patchSettings.emolaHolderName = newAccHolder.trim();
      } else if (newAccChannel === 'mKesh') {
        patchSettings.mkeshNumber = newAccNumber.trim();
        patchSettings.mkeshHolderName = newAccHolder.trim();
      }
      await saveInstitutionFinancialSettings(authorizedInstId, {
        financialSettings: patchSettings
      }).catch(() => {});

      setNewAccLabel('');
      setNewAccNumber('');
      setNewAccHolder('');
      setNewAccNib('');
      setNewAccInstructions('');
      toast.success('Conta de recebimento institucional guardada com proteção de acesso.');
      await loadAuthorizedFinancialData();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao guardar conta de recebimento.');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleToggleReceivingAccount = async (acc: InstitutionalReceivingAccount) => {
    if (!isFinancialStaff || !authorizedInstId) return;
    try {
      await saveReceivingAccount(authorizedInstId, {
        ...acc,
        isActive: !acc.isActive,
        updatedAt: new Date().toISOString()
      });
      await loadAuthorizedFinancialData();
      toast.success(acc.isActive ? 'Conta desativada.' : 'Conta ativada.');
    } catch {
      toast.error('Sem permissão ou erro ao atualizar conta.');
    }
  };

  const handleDeleteReceivingAccount = async (accId: string) => {
    if (!isFinancialStaff || !authorizedInstId) return;
    try {
      await deleteReceivingAccount(authorizedInstId, accId);
      await loadAuthorizedFinancialData();
      toast.success('Conta removida.');
    } catch {
      toast.error('Erro ao remover conta de recebimento.');
    }
  };

  const handleCreateObligation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFinancialStaff || !authorizedInstId) return;
    const val = Number(newOblAmount);
    if (!newOblStudentName.trim() || !val || val <= 0) {
      toast.error('Informe o nome do aluno/pagador e um valor positivo.');
      return;
    }
    try {
      const newConta: ContaReceber = {
        id: `cr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        institutionId: authorizedInstId,
        category: newOblCategory,
        description: newOblDescription.trim() || RECEIVABLE_CATEGORY_CONFIG[newOblCategory].label,
        studentName: newOblStudentName.trim(),
        studentCode: newOblStudentCode.trim() || undefined,
        amount: val,
        totalAmount: val,
        dueDate: newOblDueDate,
        status: 'pendente',
        createdAt: new Date().toISOString()
      };
      await createContaReceberInFirestore(newConta);
      setNewOblStudentName('');
      setNewOblStudentCode('');
      setNewOblDescription('');
      setNewOblAmount('');
      toast.success('Obrigação financeira registada.');
      await loadAuthorizedFinancialData();
    } catch {
      toast.error('Erro ao criar obrigação financeira.');
    }
  };

  const pendingPayments = useMemo(
    () => payments.filter(p => p.status === 'PENDENTE DE CONFIRMAÇÃO'),
    [payments]
  );

  // Loading state while resolving slug
  if (loadingPublic) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm font-semibold">A carregar Portal Oficial de Pagamentos...</p>
        </div>
      </div>
    );
  }

  // Invalid or unknown institution slug -> never fall back to another center
  if (!publicInst) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
        <div className={`w-full max-w-md rounded-2xl border p-8 text-center space-y-4 shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold">Portal de Pagamentos Não Encontrado</h1>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            O identificador institucional (<code className="font-mono text-amber-400">{slug || 'vazio'}</code>) não corresponde a nenhum centro ou escola pública ativa no SIGAR PRO.
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/');
              }
              navigate('public_portal');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Portal Inicial</span>
          </button>
        </div>
      </div>
    );
  }

  const brandPrimary = publicInst.primaryColor || '#0f766e';
  const acceptedChannels =
    publicInst.acceptedChannels && publicInst.acceptedChannels.length > 0
      ? publicInst.acceptedChannels
      : publicInst.paymentMethods?.acceptedChannels || ['M-Pesa', 'e-Mola', 'mKesh', 'Transferência Bancária'];

  return (
    <div className={`min-h-screen flex flex-col ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#090d16] text-slate-100'}`}>
      {/* Institutional Header */}
      <header
        className={`border-b sticky top-0 z-30 backdrop-blur-xl ${
          isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-slate-800'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {publicInst.logoUrl || publicInst.emblemUrl ? (
              <img
                src={publicInst.logoUrl || publicInst.emblemUrl}
                alt={publicInst.name}
                className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200/30 shadow-sm shrink-0"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0"
                style={{ backgroundColor: brandPrimary }}
              >
                {publicInst.sigla || publicInst.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Portal Oficial de Pagamentos
                </span>
                <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  #{publicInst.slug}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight truncate mt-0.5">
                {publicInst.name}
              </h1>
              {publicInst.slogan && (
                <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {publicInst.slogan}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {firebaseUser ? (
              <>
                <div className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold truncate max-w-[160px]">
                    {userProfile?.name || firebaseUser.displayName || firebaseUser.email}
                  </span>
                </div>
                {isTenantAuthorized && (
                  <button
                    onClick={() => navigate(isFinancialStaff ? 'financial_manager' : 'portal_aluno')}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    Painel SIGAR PRO
                  </button>
                )}
                <button
                  onClick={() => logout()}
                  className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar com Conta Institucional</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Sanitized Public Institutional Info Strip (NEVER exposes private M-Pesa / e-Mola / mKesh / NIB numbers) */}
        <section
          className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Building2 className="w-4 h-4" />
              <span>Identificação Pública da Instituição</span>
            </div>
            <div className={`flex flex-wrap items-center gap-x-5 gap-y-1 text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {publicInst.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {[publicInst.address, publicInst.city, publicInst.province].filter(Boolean).join(', ')}
                </span>
              )}
              {publicInst.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Atendimento: {publicInst.phone}
                </span>
              )}
              {publicInst.nuit && <span className="font-mono">NUIT: {publicInst.nuit}</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-semibold mr-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Canais aceites:
            </span>
            {acceptedChannels.map(ch => (
              <span
                key={ch}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                {ch}
              </span>
            ))}
          </div>
        </section>

        {/* Gate 1: Unauthenticated visitor */}
        {!firebaseUser && (
          <section
            className={`rounded-2xl border p-6 sm:p-10 text-center space-y-5 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <h2 className="text-xl sm:text-2xl font-black">
                Acesso Protegido ao Portal Financeiro da {publicInst.sigla || publicInst.name}
              </h2>
              <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Por segurança institucional e sigilo financeiro, obrigações, propinas, recibos oficiais e coordenadas bancárias/carteiras móveis só estão disponíveis após autenticação com a sua conta autorizada.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Autenticar no Portal de Pagamentos</span>
              </button>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Alunos e Encarregados consultam apenas os seus próprios pagamentos e recibos. Funcionários da Tesouraria gerem validações e contas do centro.
            </p>
          </section>
        )}

        {/* Gate 2: Authenticated in DIFFERENT institution -> strict tenant isolation */}
        {firebaseUser && !isTenantAuthorized && (
          <section
            className={`rounded-2xl border p-8 text-center space-y-4 ${
              isLight ? 'bg-white border-rose-200' : 'bg-slate-900 border-rose-500/30'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-rose-400">
              Acesso Bloqueado — Isolamento Multi-Institucional
            </h2>
            <p className={`text-sm max-w-lg mx-auto ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              A sessão atual (<strong>{firebaseUser.email}</strong>) pertence à instituição{' '}
              <code className="font-mono text-amber-400">{userProfile?.institutionId || 'sem vínculo'}</code> e não tem autorização para aceder aos registos financeiros de{' '}
              <strong>{publicInst.name}</strong> ({publicInst.institutionId}).
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => logout()}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminar Sessão e Trocar Conta</span>
              </button>
            </div>
          </section>
        )}

        {/* Gate 3: Non-financial staff (Secretaria, Docente, Porteiro) -> explicit RBAC boundary */}
        {firebaseUser && isTenantAuthorized && !isFinancialStaff && !isStudentOrGuardian && (
          <section
            className={`rounded-2xl border p-8 text-center space-y-4 ${
              isLight ? 'bg-white border-amber-200' : 'bg-slate-900 border-amber-500/30'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">Perfil Sem Permissões Financeiras</h2>
            <p className={`text-sm max-w-lg mx-auto ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              O seu perfil atual (<span className="font-mono text-amber-400">{canonicalRole}</span>) não possui privilégios de Tesouraria ou Gestão Financeira. Apenas Diretores, Administradores da Instituição e Financeiros podem validar pagamentos, emitir recibos ou gerir contas de recebimento.
            </p>
          </section>
        )}

        {/* STUDENT & GUARDIAN WORKSPACE */}
        {firebaseUser && isStudentOrGuardian && (
          <div className="space-y-6">
            {/* Student/Guardian Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <p className="text-xs text-slate-400 font-semibold uppercase">Obrigações em Aberto</p>
                <p className="text-2xl font-black mt-1 text-amber-400">
                  {receivables
                    .filter(r => r.status !== 'pago' && r.status !== 'cancelado')
                    .reduce((sum, r) => sum + Math.max(0, (r.totalAmount ?? r.amount) - (r.paidAmount ?? 0)), 0)
                    .toLocaleString('pt-MZ')}{' '}
                  MT
                </p>
              </div>
              <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <p className="text-xs text-slate-400 font-semibold uppercase">Submissões em Análise</p>
                <p className="text-2xl font-black mt-1 text-sky-400">
                  {payments.filter(p => p.status === 'PENDENTE DE CONFIRMAÇÃO' || p.status === 'CORREÇÃO SOLICITADA').length}
                </p>
              </div>
              <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <p className="text-xs text-slate-400 font-semibold uppercase">Recibos Oficiais Emitidos</p>
                <p className="text-2xl font-black mt-1 text-emerald-400">
                  {Math.max(receipts.length, payments.filter(p => p.status === 'PAGO').length)}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'obrigacoes', label: 'Obrigações & Propinas', icon: Wallet },
                { id: 'submeter', label: resubmitTarget ? 'Retificar Comprovativo' : 'Submeter Comprovativo', icon: Upload },
                { id: 'historico', label: 'Pagamentos & Recibos', icon: Receipt }
              ].map(t => {
                const Icon = t.icon;
                const active = studentTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setStudentTab(t.id as StudentPortalTab)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                        : isLight
                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {loadingTenantData && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>A sincronizar registos pessoais na instituição...</span>
              </div>
            )}

            {/* Tab: Obrigações */}
            {studentTab === 'obrigacoes' && (
              <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="p-4 sm:p-5 border-b border-slate-800/40 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base">As Minhas Obrigações Financeiras</h3>
                    <p className="text-xs text-slate-400">
                      Consulte propinas, taxas e vencimentos registados exclusivamente para o seu vínculo escolar.
                    </p>
                  </div>
                  <button
                    onClick={() => setStudentTab('submeter')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Pagamento</span>
                  </button>
                </div>

                {receivables.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    Nenhuma obrigação pendente registada no momento. Pode submeter um pagamento avulso na aba «Submeter Comprovativo».
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/40">
                    {receivables.map(conta => {
                      const val = (conta.totalAmount ?? conta.amount) - (conta.paidAmount ?? 0);
                      const isPaid = conta.status === 'pago';
                      return (
                        <div key={conta.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm">{conta.description || conta.title || conta.category}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isPaid
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : conta.status === 'atrasado'
                                      ? 'bg-rose-500/15 text-rose-400'
                                      : 'bg-amber-500/15 text-amber-400'
                                }`}
                              >
                                {conta.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {conta.studentName && `${conta.studentName} • `}Vencimento: {conta.dueDate}
                              {conta.receiptNumber && ` • Recibo: ${conta.receiptNumber}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-base">
                              {(isPaid ? conta.paidAmount ?? conta.amount : val).toLocaleString('pt-MZ')} MT
                            </span>
                            {!isPaid && (
                              <button
                                onClick={() => handleStartPayFromReceivable(conta)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                              >
                                Pagar / Anexar Comprovativo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Submeter Comprovativo */}
            {studentTab === 'submeter' && (
              <form
                onSubmit={handleStudentSubmitPayment}
                className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base">
                      {resubmitTarget ? 'Retificar e Reenviar Comprovativo' : 'Submeter Comprovativo de Pagamento'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      O comprovativo entra com estado PENDENTE DE CONFIRMAÇÃO até validação pela tesouraria da {publicInst.sigla || publicInst.name}.
                    </p>
                  </div>
                  {resubmitTarget && (
                    <button
                      type="button"
                      onClick={() => setResubmitTarget(null)}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Cancelar retificação
                    </button>
                  )}
                </div>

                {resubmitTarget?.correctionNotes && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    <strong>Orientação da Tesouraria:</strong> {resubmitTarget.correctionNotes}
                  </div>
                )}

                {ownStudents.length > 1 && !resubmitTarget && (
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Educando / Estudante</label>
                    <select
                      value={selectedStudentId}
                      onChange={e => setSelectedStudentId(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    >
                      {ownStudents.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.fullName} ({st.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Serviço / Rubrica</label>
                    <select
                      value={serviceItem}
                      disabled={Boolean(resubmitTarget)}
                      onChange={e => {
                        const key = e.target.value as PaymentServiceItem;
                        setServiceItem(key);
                        if (!selectedReceivableId && PAYMENT_SERVICE_CATALOG[key]) {
                          setAmount(String(PAYMENT_SERVICE_CATALOG[key].defaultAmount));
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    >
                      {Object.entries(PAYMENT_SERVICE_CATALOG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">Valor Pago (MT)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">Canal Utilizado</label>
                    <select
                      value={network}
                      onChange={e => setNetwork(e.target.value as PaymentNetwork)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    >
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="e-Mola">e-Mola</option>
                      <option value="mKesh">mKesh</option>
                      <option value="Transferência Bancária">Transferência Bancária</option>
                      <option value="Ponto24">Ponto24 / POS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">Código / Referência da Transação</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: MP260512.1422.A9182"
                      value={transactionCode}
                      onChange={e => setTransactionCode(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">Data da Transação</label>
                    <input
                      type="date"
                      required
                      value={payDate}
                      onChange={e => setPayDate(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">Hora Aproximada</label>
                    <input
                      type="time"
                      required
                      value={payTime}
                      onChange={e => setPayTime(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Comprovativo Digital (Imagem)</label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>{proofFileName ? 'Substituir Ficheiro' : 'Selecionar Comprovativo'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleSelectProofFile} />
                    </label>
                    {proofFileName && <span className="text-xs text-emerald-400 font-mono">{proofFileName}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Observações (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Referente ao mês ou referência adicional"
                    value={studentNotes}
                    onChange={e => setStudentNotes(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingProof}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingProof ? 'A submeter...' : resubmitTarget ? 'Reenviar Corrigido' : 'Submeter Comprovativo'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Histórico & Recibos */}
            {studentTab === 'historico' && (
              <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="p-4 sm:p-5 border-b border-slate-800/40">
                  <h3 className="font-bold text-base">Os Meus Pagamentos e Recibos Oficiais</h3>
                  <p className="text-xs text-slate-400">
                    Acompanhe a validação pela tesouraria e descarregue ou imprima os seus recibos oficiais.
                  </p>
                </div>
                {payments.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    Ainda não submeteu nenhum pagamento neste portal.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/40">
                    {payments.map(p => (
                      <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm uppercase">
                              {p.serviceItem || 'Pagamento'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.status === 'PAGO'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : p.status === 'REJEITADO'
                                    ? 'bg-rose-500/15 text-rose-400'
                                    : p.status === 'CORREÇÃO SOLICITADA'
                                      ? 'bg-amber-500/15 text-amber-400'
                                      : 'bg-sky-500/15 text-sky-400'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            {p.network} • Tx: {p.transactionCode} • {p.date}
                            {p.receiptNumber && ` • Recibo ${p.receiptNumber}`}
                          </p>
                          {p.correctionNotes && p.status === 'CORREÇÃO SOLICITADA' && (
                            <p className="text-xs text-amber-400">Correção pedida: {p.correctionNotes}</p>
                          )}
                          {p.rejectionReason && p.status === 'REJEITADO' && (
                            <p className="text-xs text-rose-400">Motivo: {p.rejectionReason}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-black text-base mr-2">
                            {p.amount.toLocaleString('pt-MZ')} MT
                          </span>
                          {p.proofUrl && (
                            <button
                              onClick={() => setSelectedProofPayment(p)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Prova</span>
                            </button>
                          )}
                          {p.status === 'CORREÇÃO SOLICITADA' && (
                            <button
                              onClick={() => handleStartResubmit(p)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Corrigir & Reenviar
                            </button>
                          )}
                          {p.status === 'PAGO' && (
                            <button
                              onClick={() => setSelectedReceiptPayment(p)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Ver Recibo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FINANCIAL STAFF WORKSPACE */}
        {firebaseUser && isFinancialStaff && (
          <div className="space-y-6">
            {/* Staff KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <p className="text-xs text-slate-400 font-semibold uppercase">Pendentes de Validação</p>
                <p className="text-2xl font-black mt-1 text-amber-400">{pendingPayments.length}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <p className="text-xs text-slate-400 font-semibold uppercase">Receita Validada</p>
                <p className="text-2xl font-black mt-1 text-emerald-400">
                  {payments
                    .filter(p => p.status === 'PAGO')
                    .reduce((s, p) => s + (p.amount || 0), 0)
                    .toLocaleString('pt-MZ')}{' '}
                  MT
                </p>
              </div>
              <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <p className="text-xs text-slate-400 font-semibold uppercase">Recibos Emitidos</p>
                <p className="text-2xl font-black mt-1 text-sky-400">{receipts.length}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <p className="text-xs text-slate-400 font-semibold uppercase">Contas de Recebimento</p>
                <p className="text-2xl font-black mt-1 text-purple-400">{receivingAccounts.length}</p>
              </div>
            </div>

            {/* Staff Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'fila', label: `Fila de Validação (${pendingPayments.length})`, icon: Clock },
                { id: 'pagamentos', label: 'Todos Pagamentos', icon: CreditCard },
                { id: 'obrigacoes', label: 'Obrigações a Receber', icon: Wallet },
                { id: 'recibos', label: 'Recibos Oficiais', icon: Receipt },
                { id: 'contas', label: 'Contas de Recebimento', icon: Landmark }
              ].map(t => {
                const Icon = t.icon;
                const active = staffTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setStaffTab(t.id as StaffPortalTab)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                        : isLight
                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {loadingTenantData && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>A sincronizar dados financeiros do centro ({authorizedInstId})...</span>
              </div>
            )}

            {/* Tab: Fila / Todos Pagamentos */}
            {(staffTab === 'fila' || staffTab === 'pagamentos') && (
              <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="p-4 sm:p-5 border-b border-slate-800/40 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base">
                      {staffTab === 'fila' ? 'Pagamentos Pendentes de Validação Financeira' : 'Histórico Financeiro de Pagamentos'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Valide comprovativos, solicite correções ou emita recibos oficiais com prevenção de duplicação.
                    </p>
                  </div>
                  <button
                    onClick={loadAuthorizedFinancialData}
                    className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
                    title="Atualizar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {(staffTab === 'fila' ? pendingPayments : payments).length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    Nenhum registo nesta lista para {publicInst.name}.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/40">
                    {(staffTab === 'fila' ? pendingPayments : payments).map(p => (
                      <div key={p.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">{p.studentName}</span>
                            <span className="text-xs font-mono text-slate-400">({p.studentCode})</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.status === 'PAGO'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : p.status === 'REJEITADO'
                                    ? 'bg-rose-500/15 text-rose-400'
                                    : p.status === 'CORREÇÃO SOLICITADA'
                                      ? 'bg-amber-500/15 text-amber-400'
                                      : 'bg-sky-500/15 text-sky-400'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            {(p.serviceItem || 'pagamento').toUpperCase()} • {p.network} • Tx: {p.transactionCode} • {p.date} {p.time}
                            {p.receiptNumber && ` • Recibo ${p.receiptNumber}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-base mr-2">
                            {p.amount.toLocaleString('pt-MZ')} MT
                          </span>

                          {p.proofUrl && (
                            <button
                              onClick={() => setSelectedProofPayment(p)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Prova</span>
                            </button>
                          )}

                          {p.status !== 'PAGO' && (
                            <>
                              <button
                                onClick={() => {
                                  setReviewNotes('');
                                  setReviewActionTarget({ payment: p, mode: 'approve' });
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Validar & Emitir Recibo</span>
                              </button>
                              <button
                                onClick={() => {
                                  setReviewNotes('');
                                  setReviewActionTarget({ payment: p, mode: 'correct' });
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                              >
                                Pedir Correção
                              </button>
                              <button
                                onClick={() => {
                                  setReviewNotes('');
                                  setReviewActionTarget({ payment: p, mode: 'reject' });
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rejeitar</span>
                              </button>
                            </>
                          )}

                          {p.status === 'PAGO' && (
                            <button
                              onClick={() => setSelectedReceiptPayment(p)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Recibo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Obrigações a Receber */}
            {staffTab === 'obrigacoes' && (
              <div className="space-y-4">
                <form
                  onSubmit={handleCreateObligation}
                  className={`rounded-2xl border p-5 space-y-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}
                >
                  <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-400">
                    Registar Nova Obrigação Financeira ({publicInst.sigla || publicInst.name})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Nome do Estudante / Utente"
                      value={newOblStudentName}
                      onChange={e => setNewOblStudentName(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    />
                    <input
                      type="text"
                      placeholder="Código do Aluno (opcional)"
                      value={newOblStudentCode}
                      onChange={e => setNewOblStudentCode(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    />
                    <select
                      value={newOblCategory}
                      onChange={e => setNewOblCategory(e.target.value as keyof typeof RECEIVABLE_CATEGORY_CONFIG)}
                      className={`px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    >
                      {Object.entries(RECEIVABLE_CATEGORY_CONFIG).map(([k, cfg]) => (
                        <option key={k} value={k}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Descrição (ex: Mensalidade Maio)"
                      value={newOblDescription}
                      onChange={e => setNewOblDescription(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    />
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Valor (MT)"
                      value={newOblAmount}
                      onChange={e => setNewOblAmount(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        required
                        value={newOblDueDate}
                        onChange={e => setNewOblDueDate(e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </form>

                <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                  {receivables.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">Nenhuma conta a receber encontrada.</div>
                  ) : (
                    <div className="divide-y divide-slate-800/40">
                      {receivables.map(r => (
                        <div key={r.id} className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-sm">
                              {r.studentName || r.debtorName || 'Utente'} — {r.description || r.category}
                            </p>
                            <p className="text-xs text-slate-400">
                              Vencimento: {r.dueDate} • Estado: {r.status.toUpperCase()}
                              {r.receiptNumber && ` • Recibo ${r.receiptNumber}`}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-sm">
                            {(r.totalAmount ?? r.amount).toLocaleString('pt-MZ')} MT
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Recibos Oficiais */}
            {staffTab === 'recibos' && (
              <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="p-4 sm:p-5 border-b border-slate-800/40 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-base">Livro Oficial de Recibos Emitidos</h3>
                    <p className="text-xs text-slate-400">
                      Registos protegidos contra eliminação (preservação contabilística obrigatória).
                    </p>
                  </div>
                </div>
                {receipts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">Ainda não existem recibos emitidos na coleção receipts.</div>
                ) : (
                  <div className="divide-y divide-slate-800/40">
                    {receipts.map(rcp => {
                      const linkedPayment = payments.find(p => p.id === rcp.paymentId);
                      return (
                        <div key={rcp.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="font-bold text-sm font-mono text-emerald-400">
                              {rcp.receiptNumber} — {rcp.studentName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {String(rcp.serviceItem).toUpperCase()} • {rcp.network} • Tx: {rcp.transactionCode} • Emitido por {rcp.issuedBy}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-sm">
                              {rcp.amount.toLocaleString('pt-MZ')} MT
                            </span>
                            {linkedPayment && (
                              <button
                                onClick={() => setSelectedReceiptPayment(linkedPayment)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>2ª Via</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Contas de Recebimento (Restrito a Financeiro/Diretor/Admin) */}
            {staffTab === 'contas' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-300">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    As coordenadas de recebimento abaixo (M-Pesa, e-Mola, mKesh, Banco) são armazenadas em cofre privado da instituição (<code className="font-mono">/institutions/{authorizedInstId}/receivingAccounts</code>) e <strong>nunca são expostas na configuração pública</strong>.
                  </p>
                </div>

                <form
                  onSubmit={handleSaveReceivingAccount}
                  className={`rounded-2xl border p-5 space-y-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}
                >
                  <h3 className="font-bold text-sm uppercase tracking-wider">Adicionar Conta de Recebimento</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <select
                      value={newAccChannel}
                      onChange={e => setNewAccChannel(e.target.value as 'M-Pesa' | 'e-Mola' | 'mKesh' | 'Banco')}
                      className={`px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    >
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="e-Mola">e-Mola</option>
                      <option value="mKesh">mKesh</option>
                      <option value="Banco">Banco (NIB / IBAN)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Etiqueta (ex: Conta Principal Tesouraria)"
                      value={newAccLabel}
                      onChange={e => setNewAccLabel(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Número / Conta Bancária"
                      value={newAccNumber}
                      onChange={e => setNewAccNumber(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Nome do Titular Oficial"
                      value={newAccHolder}
                      onChange={e => setNewAccHolder(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    />
                    <input
                      type="text"
                      placeholder="NIB / Shortcode (opcional)"
                      value={newAccNib}
                      onChange={e => setNewAccNib(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    />
                    <input
                      type="text"
                      placeholder="Instruções internas (opcional)"
                      value={newAccInstructions}
                      onChange={e => setNewAccInstructions(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'}`}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingAccount}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{savingAccount ? 'A guardar...' : 'Guardar Conta'}</span>
                    </button>
                  </div>
                </form>

                <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
                  {receivingAccounts.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">
                      Nenhuma conta de recebimento registada nesta subcoleção ainda.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/40">
                      {receivingAccounts.map(acc => (
                        <div key={acc.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-emerald-400" />
                              <span className="font-bold text-sm">{acc.label}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold uppercase text-slate-300">
                                {acc.channel}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  acc.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {acc.isActive ? 'Ativa' : 'Inativa'}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-slate-300">
                              Conta/Número: {acc.accountNumber} • Titular: {acc.holderName}
                              {acc.nib && ` • NIB: ${acc.nib}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleReceivingAccount(acc)}
                              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                            >
                              {acc.isActive ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => handleDeleteReceivingAccount(acc.id)}
                              className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Staff Review Confirmation Modal */}
      {reviewActionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <h3 className="text-lg font-bold">
              {reviewActionTarget.mode === 'approve'
                ? 'Validar Pagamento e Emitir Recibo'
                : reviewActionTarget.mode === 'correct'
                  ? 'Solicitar Correção de Comprovativo'
                  : 'Rejeitar Submissão de Pagamento'}
            </h3>
            <p className="text-xs text-slate-400">
              {reviewActionTarget.payment.studentName} •{' '}
              <strong>{reviewActionTarget.payment.amount.toLocaleString('pt-MZ')} MT</strong> (
              {reviewActionTarget.payment.network})
            </p>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder={
                reviewActionTarget.mode === 'approve'
                  ? 'Observações internas opcionais...'
                  : 'Descreva claramente o motivo ou instrução de retificação...'
              }
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
              }`}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewActionTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={processingReview}
                onClick={handleConfirmReviewAction}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer ${
                  reviewActionTarget.mode === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : reviewActionTarget.mode === 'correct'
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {processingReview ? 'A processar...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProofPayment && (
        <PaymentProofModal payment={selectedProofPayment} onClose={() => setSelectedProofPayment(null)} />
      )}

      {selectedReceiptPayment && (
        <PaymentReceiptModal
          payment={selectedReceiptPayment}
          institution={receiptInstitutionShape}
          onClose={() => setSelectedReceiptPayment(null)}
        />
      )}

      <SigarAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="credentials"
      />
    </div>
  );
};
