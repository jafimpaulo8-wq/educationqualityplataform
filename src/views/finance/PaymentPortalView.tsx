import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Upload, 
  Copy, 
  Check, 
  ArrowRight, 
  Search, 
  Filter, 
  Printer, 
  Eye, 
  ShieldCheck, 
  RotateCcw, 
  History, 
  Sparkles, 
  UserCheck, 
  ChevronRight, 
  DollarSign, 
  Info,
  Calendar,
  AlertTriangle,
  BadgeAlert,
  Send,
  HelpCircle,
  TrendingUp,
  Award,
  BookOpen,
  Shirt,
  IdCard,
  FileCheck,
  Tag,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  PaymentRecord, 
  PaymentServiceItem, 
  PaymentNetwork, 
  PaymentStatus, 
  PAYMENT_SERVICE_CATALOG 
} from '../../types/finance';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { PaymentProofModal } from './PaymentProofModal';

export const PaymentPortalView: React.FC = () => {
  const { 
    activeInstitution, 
    students: allStudents, 
    paymentRecords, 
    submitPayment, 
    approvePayment, 
    rejectPayment, 
    requestPaymentCorrection, 
    resubmitPayment,
    deletePaymentRecord,
    activeRole,
    firebaseUser
  } = useApp();

  // Mode: 'student_portal' (Efetuar Pagamento) vs 'admin_management' (Homologação Tesouraria)
  const [activeTab, setActiveTab] = useState<'student_portal' | 'admin_management'>('student_portal');

  // Selected student (in student portal mode)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return allStudents.length > 0 ? allStudents[0].id : '';
  });

  const selectedStudent = useMemo(() => {
    return allStudents.find(s => s.id === selectedStudentId) || allStudents[0];
  }, [allStudents, selectedStudentId]);

  // Form State for Efetuar Pagamento
  const [selectedService, setSelectedService] = useState<PaymentServiceItem>('mensalidade');
  const [amount, setAmount] = useState<number>(() => PAYMENT_SERVICE_CATALOG['mensalidade'].defaultAmount);
  const [network, setNetwork] = useState<PaymentNetwork>('M-Pesa');
  const [transactionCode, setTransactionCode] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [transactionTime, setTransactionTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);
  const [proofPayment, setProofPayment] = useState<PaymentRecord | null>(null);
  const [auditPayment, setAuditPayment] = useState<PaymentRecord | null>(null);

  // Admin Action Modals
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject' | 'correct';
    payment: PaymentRecord;
  } | null>(null);
  const [adminActionNotes, setAdminActionNotes] = useState('');

  // Correction Resubmission Modal for Student
  const [correctionTarget, setCorrectionTarget] = useState<PaymentRecord | null>(null);
  const [resubmitCode, setResubmitCode] = useState('');
  const [resubmitAmount, setResubmitAmount] = useState<number>(0);
  const [resubmitDate, setResubmitDate] = useState('');
  const [resubmitTime, setResubmitTime] = useState('');
  const [resubmitNetwork, setResubmitNetwork] = useState<PaymentNetwork>('M-Pesa');
  const [resubmitProofUrl, setResubmitProofUrl] = useState('');
  const [resubmitFileName, setResubmitFileName] = useState('');

  // Admin Filters
  const [adminSearch, setAdminSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | PaymentStatus>('todos');
  const [serviceFilter, setServiceFilter] = useState<'todos' | PaymentServiceItem>('todos');
  const [networkFilter, setNetworkFilter] = useState<'todos' | PaymentNetwork>('todos');

  // Institution Financial Coordinates
  const financialInfo = {
    emolaNumber: activeInstitution.financialSettings?.emolaNumber || '87 987 6543',
    emolaAccountName: (activeInstitution.financialSettings as any)?.emolaAccountName || activeInstitution.name,
    mpesaNumber: activeInstitution.financialSettings?.mpesaNumber || '84 123 4567',
    mpesaAccountName: (activeInstitution.financialSettings as any)?.mpesaAccountName || activeInstitution.name,
    beneficiaryName: activeInstitution.name
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Switch service and update default amount
  const handleSelectService = (service: PaymentServiceItem) => {
    setSelectedService(service);
    setAmount(PAYMENT_SERVICE_CATALOG[service].defaultAmount);
  };

  // Mock upload / Image drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleProof = () => {
    // High-resolution realistic M-Pesa / e-Mola receipt banner
    setProofUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80');
    setProofFileName('comprovativo_mpesa_transferencia.jpg');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionCode.trim()) {
      alert('Por favor, informe o código da transação.');
      return;
    }
    if (amount <= 0) {
      alert('Por favor, informe um valor válido.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitPayment({
        studentId: selectedStudent?.id || 'stu-demo',
        studentCode: selectedStudent?.code || 'MTW-2026-001',
        studentName: selectedStudent?.fullName || 'Formando em Formação',
        studentPhone: selectedStudent?.phone || financialInfo.mpesaNumber,
        courseName: selectedStudent?.courseName || 'Curso Técnico',
        serviceItem: selectedService,
        serviceDescription: PAYMENT_SERVICE_CATALOG[selectedService].description,
        amount,
        network,
        transactionCode: transactionCode.trim().toUpperCase(),
        date: transactionDate,
        time: transactionTime,
        proofUrl: proofUrl || undefined,
        proofFileName: proofFileName || undefined,
        studentNotes: studentNotes.trim() || undefined,
        institutionId: activeInstitution.id
      });

      setIsSubmitting(false);
      // Reset form
      setTransactionCode('');
      setProofUrl('');
      setProofFileName('');
      setStudentNotes('');
    }, 400);
  };

  // Open correction modal for a student record
  const handleOpenCorrection = (record: PaymentRecord) => {
    setCorrectionTarget(record);
    setResubmitCode(record.transactionCode);
    setResubmitAmount(record.amount);
    setResubmitDate(record.date);
    setResubmitTime(record.time);
    setResubmitNetwork(record.network);
    setResubmitProofUrl(record.proofUrl || '');
    setResubmitFileName(record.proofFileName || '');
  };

  const handleConfirmResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionTarget) return;
    resubmitPayment(correctionTarget.id, {
      transactionCode: resubmitCode.trim().toUpperCase(),
      amount: resubmitAmount,
      date: resubmitDate,
      time: resubmitTime,
      network: resubmitNetwork,
      proofUrl: resubmitProofUrl || undefined,
      proofFileName: resubmitFileName || undefined
    });
    setCorrectionTarget(null);
  };

  // Filtered payments for Admin table
  const filteredAdminPayments = useMemo(() => {
    return paymentRecords.filter(p => {
      if (statusFilter !== 'todos' && p.status !== statusFilter) return false;
      if (serviceFilter !== 'todos' && p.serviceItem !== serviceFilter) return false;
      if (networkFilter !== 'todos' && p.network !== networkFilter) return false;
      if (adminSearch.trim()) {
        const query = adminSearch.toLowerCase();
        const matchesStudent = p.studentName.toLowerCase().includes(query) || p.studentCode.toLowerCase().includes(query);
        const matchesTx = p.transactionCode.toLowerCase().includes(query);
        const matchesReceipt = p.receiptNumber?.toLowerCase().includes(query);
        if (!matchesStudent && !matchesTx && !matchesReceipt) return false;
      }
      return true;
    });
  }, [paymentRecords, statusFilter, serviceFilter, networkFilter, adminSearch]);

  // Statistics for top bar
  const stats = useMemo(() => {
    const totalCount = paymentRecords.length;
    const pending = paymentRecords.filter(p => p.status === 'PENDENTE DE CONFIRMAÇÃO');
    const approved = paymentRecords.filter(p => p.status === 'PAGO');
    const corrections = paymentRecords.filter(p => p.status === 'CORREÇÃO SOLICITADA');
    const rejected = paymentRecords.filter(p => p.status === 'REJEITADO');

    const totalApprovedAmount = approved.reduce((acc, p) => acc + p.amount, 0);
    const totalPendingAmount = pending.reduce((acc, p) => acc + p.amount, 0);

    return {
      totalCount,
      pendingCount: pending.length,
      approvedCount: approved.length,
      correctionsCount: corrections.length,
      rejectedCount: rejected.length,
      totalApprovedAmount,
      totalPendingAmount
    };
  }, [paymentRecords]);

  // Student's own submissions
  const studentSubmissions = useMemo(() => {
    if (!selectedStudent) return [];
    return paymentRecords.filter(p => p.studentId === selectedStudent.id || p.studentCode === selectedStudent.code);
  }, [paymentRecords, selectedStudent]);

  // Service Icons Helper
  const getServiceIcon = (item: PaymentServiceItem) => {
    switch (item) {
      case 'inscrição': return <UserCheck className="w-5 h-5 text-indigo-500" />;
      case 'mensalidade': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'avaliação': return <FileCheck className="w-5 h-5 text-amber-500" />;
      case 'manual': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'uniforme': return <Shirt className="w-5 h-5 text-purple-500" />;
      case 'crachá': return <IdCard className="w-5 h-5 text-teal-500" />;
      case 'certificado': return <Award className="w-5 h-5 text-yellow-500" />;
      case 'declaração': return <FileText className="w-5 h-5 text-cyan-500" />;
      case 'multa': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'outros': default: return <Tag className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PENDENTE DE CONFIRMAÇÃO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            PENDENTE DE CONFIRMAÇÃO
          </span>
        );
      case 'PAGO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PAGO &amp; LIBERADO
          </span>
        );
      case 'CORREÇÃO SOLICITADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCcw className="w-3.5 h-3.5" />
            CORREÇÃO SOLICITADA
          </span>
        );
      case 'REJEITADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            REJEITADO
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header & Tabs */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                SIVERC • Módulo Financeiro Integrado
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2 mt-0.5">
                <CreditCard className="w-7 h-7 text-emerald-600" />
                30. Portal "Efetuar Pagamento" &amp; Homologação
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Pagamentos via M-Pesa &amp; e-Mola, emissão de recibos oficiais e liberação automática de serviços escolares.
              </p>
            </div>

            {/* Navigation Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button
                onClick={() => setActiveTab('student_portal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'student_portal'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Efetuar Pagamento (Aluno)
              </button>
              <button
                onClick={() => setActiveTab('admin_management')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'admin_management'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Homologação (Administrador)
                {stats.pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black animate-pulse">
                    {stats.pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Banner */}
      <div className="bg-white border-b border-slate-200 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Pendentes</span>
              <p className="text-lg font-black text-amber-600 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {stats.pendingCount}
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Pagos &amp; Liberados</span>
              <p className="text-lg font-black text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {stats.approvedCount}
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Arrecadado</span>
              <p className="text-lg font-black text-slate-900 font-mono">
                {stats.totalApprovedAmount.toLocaleString('pt-MZ')} MT
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Correções</span>
              <p className="text-lg font-black text-blue-600 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> {stats.correctionsCount}
              </p>
            </div>
            <div className="hidden lg:block bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Em Análise (MT)</span>
              <p className="text-lg font-black text-amber-700 font-mono">
                {stats.totalPendingAmount.toLocaleString('pt-MZ')} MT
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ========================================================= */}
        {/* 1. VISÃO DO ALUNO: EFETUAR PAGAMENTO                      */}
        {/* ========================================================= */}
        {activeTab === 'student_portal' && (
          <div className="space-y-8">
            {/* Student Switcher / Info Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg border border-emerald-200">
                  {selectedStudent?.fullName?.slice(0, 2).toUpperCase() || 'AL'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Formando Autenticado
                    </span>
                    <span className="text-xs font-mono text-slate-500">Código: {selectedStudent?.code}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{selectedStudent?.fullName}</h2>
                  <p className="text-xs text-slate-500">
                    Curso: {selectedStudent?.courseName || 'Formação Geral'} • Saldo Devedor: <span className="font-bold text-rose-600 font-mono">{(selectedStudent?.balanceOwing || 0).toLocaleString('pt-MZ')} MT</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Simular outro aluno:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-emerald-500 cursor-pointer"
                >
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.code}) - Saldo: {s.balanceOwing || 0} MT
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Submission Form */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  {/* Step 1: Aluno Escolhe o Serviço */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">Passo 1</span>
                        <h3 className="text-base font-bold text-slate-900">Escolha o Serviço a Pagar</h3>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">10 serviços disponíveis</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {(Object.keys(PAYMENT_SERVICE_CATALOG) as PaymentServiceItem[]).map((serviceKey) => {
                        const item = PAYMENT_SERVICE_CATALOG[serviceKey];
                        const isSelected = selectedService === serviceKey;
                        return (
                          <button
                            key={serviceKey}
                            type="button"
                            onClick={() => handleSelectService(serviceKey)}
                            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              {getServiceIcon(serviceKey)}
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            </div>
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-tight ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                                {item.label}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                {item.defaultAmount > 0 ? `${item.defaultAmount} MT` : 'Variável'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                      <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 uppercase">{PAYMENT_SERVICE_CATALOG[selectedService].label}:</strong>{' '}
                        {PAYMENT_SERVICE_CATALOG[selectedService].description}
                        <p className="text-emerald-700 font-medium mt-1">
                          Liberação automática: {PAYMENT_SERVICE_CATALOG[selectedService].serviceReleaseDetail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Informações de Pagamento (e-Mola / M-Pesa) */}
                  <div className="border-t border-slate-100 pt-5">
                    <div className="mb-3">
                      <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">Passo 2</span>
                      <h3 className="text-base font-bold text-slate-900">Efetue a Transferência nas Contas Oficiais</h3>
                      <p className="text-xs text-slate-500">Transfira pelo seu telemóvel para um dos números oficiais abaixo:</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* M-Pesa Card */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        network === 'M-Pesa' 
                          ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20' 
                          : 'border-slate-200 bg-white'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
                            <span className="font-black text-xs text-slate-900 tracking-wider uppercase">Vodacom M-Pesa</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNetwork('M-Pesa')}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                              network === 'M-Pesa' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {network === 'M-Pesa' ? 'Selecionada' : 'Selecionar'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500">Número Oficial:</p>
                        <div className="flex items-center justify-between mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                          <span className="font-mono font-black text-sm text-slate-900">{financialInfo.mpesaNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(financialInfo.mpesaNumber, 'mpesa')}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === 'mpesa' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === 'mpesa' ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                          Beneficiário: <strong className="text-slate-800">{financialInfo.mpesaAccountName}</strong>
                        </p>
                      </div>

                      {/* e-Mola Card */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        network === 'e-Mola' 
                          ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20' 
                          : 'border-slate-200 bg-white'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                            <span className="font-black text-xs text-slate-900 tracking-wider uppercase">Movitel e-Mola</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNetwork('e-Mola')}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                              network === 'e-Mola' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {network === 'e-Mola' ? 'Selecionada' : 'Selecionar'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500">Número Oficial:</p>
                        <div className="flex items-center justify-between mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                          <span className="font-mono font-black text-sm text-slate-900">{financialInfo.emolaNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(financialInfo.emolaNumber, 'emola')}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === 'emola' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === 'emola' ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                          Beneficiário: <strong className="text-slate-800">{financialInfo.emolaAccountName}</strong>
                        </p>
                      </div>
                    </div>

                    {/* USSD Instructions Accordion */}
                    <div className="mt-3 p-3 bg-slate-900 text-slate-300 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-emerald-400" />
                        Instruções para Transferência no Telemóvel:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <strong className="text-red-400">Vodacom M-Pesa:</strong> Digite <span className="font-mono text-white font-bold">*150#</span> &gt; Transferir dinheiro &gt; Inserir número <span className="font-mono text-white">{financialInfo.mpesaNumber}</span> &gt; Confirmar titular <span className="text-white font-bold">{financialInfo.mpesaAccountName}</span> &gt; Guardar o SMS com o código.
                        </div>
                        <div>
                          <strong className="text-amber-400">Movitel e-Mola:</strong> Digite <span className="font-mono text-white font-bold">*898#</span> &gt; Transferência &gt; Inserir número <span className="font-mono text-white">{financialInfo.emolaNumber}</span> &gt; Confirmar titular <span className="text-white font-bold">{financialInfo.emolaAccountName}</span> &gt; Guardar o SMS com a referência.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Aluno Informa Dados da Transação */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">Passo 3</span>
                      <h3 className="text-base font-bold text-slate-900">Informe os Dados da Transação e Anexe o Comprovativo</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Código da Transação / Referência *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: 9H76GF562A"
                          value={transactionCode}
                          onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                          className="w-full text-sm font-mono font-bold uppercase tracking-wider bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-emerald-500 focus:bg-white"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Código de confirmação alfanumérico que consta no SMS da operadora.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Valor Pago (MZN) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-full text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-12 py-2.5 text-slate-900 focus:outline-emerald-500 focus:bg-white"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">MT</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Sugerido para {PAYMENT_SERVICE_CATALOG[selectedService].label}: {PAYMENT_SERVICE_CATALOG[selectedService].defaultAmount} MT
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Rede Utilizada *
                        </label>
                        <select
                          value={network}
                          onChange={(e) => setNetwork(e.target.value as PaymentNetwork)}
                          className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-emerald-500"
                        >
                          <option value="M-Pesa">Vodacom M-Pesa</option>
                          <option value="e-Mola">Movitel e-Mola</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Data do Pagamento *
                        </label>
                        <input
                          type="date"
                          required
                          value={transactionDate}
                          onChange={(e) => setTransactionDate(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Hora do Pagamento *
                        </label>
                        <input
                          type="time"
                          required
                          value={transactionTime}
                          onChange={(e) => setTransactionTime(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Proof Upload Area */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">
                          Comprovativo / Captura de Ecrã (Opcional ou SMS)
                        </label>
                        <button
                          type="button"
                          onClick={handleUseSampleProof}
                          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold underline cursor-pointer"
                        >
                          Usar Comprovativo de Exemplo
                        </button>
                      </div>

                      <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all">
                        {proofUrl ? (
                          <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <img 
                                src={proofUrl} 
                                alt="Miniatura" 
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="text-left truncate">
                                <p className="text-xs font-bold text-slate-800 truncate">{proofFileName || 'comprovativo.png'}</p>
                                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Anexo Carregado com Sucesso
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setProofUrl(''); setProofFileName(''); }}
                              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded hover:bg-rose-50 cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-700">Clique para carregar ou arraste o ficheiro</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, JPEG ou PDF até 5MB</p>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Observações Adicionais do Aluno (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Mensalidade referente a Setembro de 2026"
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Submission Action */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          Submetendo para a Tesouraria...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submeter Pagamento para Confirmação
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-2">
                      Estado inicial após o envio: <strong className="text-amber-600">PENDENTE DE CONFIRMAÇÃO</strong>. A tesouraria analisará em até 24 horas.
                    </p>
                  </div>
                </form>
              </div>

              {/* Right Column: Student's Payment History */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-sm text-slate-900">Meus Pagamentos &amp; Comprovativos</h3>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                      {studentSubmissions.length}
                    </span>
                  </div>

                  {studentSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-medium">Nenhum pagamento submetido ainda.</p>
                      <p className="text-[11px] mt-1">Preencha o formulário ao lado para efetuar o primeiro pagamento.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studentSubmissions.map((payment) => (
                        <div 
                          key={payment.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {getServiceIcon(payment.serviceItem)}
                              <div>
                                <p className="font-bold text-xs text-slate-900 uppercase">{payment.serviceItem}</p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {payment.network} • Tx: <strong className="text-slate-800">{payment.transactionCode}</strong>
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-sm text-slate-900">
                                {payment.amount.toLocaleString('pt-MZ')} MT
                              </span>
                              <p className="text-[10px] text-slate-400">{payment.date} {payment.time}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <div>{getStatusBadge(payment.status)}</div>

                            <div className="flex items-center gap-1.5">
                              {payment.proofUrl && (
                                <button
                                  type="button"
                                  onClick={() => setProofPayment(payment)}
                                  className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                                  title="Ver Comprovativo"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}

                              {payment.status === 'PAGO' && (
                                <button
                                  type="button"
                                  onClick={() => setReceiptPayment(payment)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Printer className="w-3 h-3" /> Recibo
                                </button>
                              )}

                              {payment.status === 'CORREÇÃO SOLICITADA' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCorrection(payment)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" /> Retificar
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Notes if Correction Requested */}
                          {payment.status === 'CORREÇÃO SOLICITADA' && payment.correctionNotes && (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900">
                              <strong>Instruções da Tesouraria:</strong> {payment.correctionNotes}
                            </div>
                          )}

                          {/* Reason if Rejected */}
                          {payment.status === 'REJEITADO' && payment.rejectionReason && (
                            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900">
                              <strong>Motivo da Rejeição:</strong> {payment.rejectionReason}
                            </div>
                          )}

                          {/* Service Released Badge if Approved */}
                          {payment.status === 'PAGO' && payment.serviceReleased && (
                            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center gap-1.5 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{payment.serviceReleaseMessage || 'Serviço operacional ativo e registrado.'}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. VISÃO DO ADMINISTRADOR: HOMOLOGAÇÃO DE PAGAMENTOS     */}
        {/* ========================================================= */}
        {activeTab === 'admin_management' && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar por formando, código da transação ou recibo..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-600">Estado:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-800"
                  >
                    <option value="todos">Todos os Estados</option>
                    <option value="PENDENTE DE CONFIRMAÇÃO">Pendentes de Confirmação</option>
                    <option value="PAGO">Pagos</option>
                    <option value="CORREÇÃO SOLICITADA">Correção Solicitada</option>
                    <option value="REJEITADO">Rejeitados</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-600">Serviço:</span>
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-800"
                  >
                    <option value="todos">Todos os Serviços</option>
                    {(Object.keys(PAYMENT_SERVICE_CATALOG) as PaymentServiceItem[]).map(s => (
                      <option key={s} value={s}>{PAYMENT_SERVICE_CATALOG[s].label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-600">Rede:</span>
                  <select
                    value={networkFilter}
                    onChange={(e) => setNetworkFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-800"
                  >
                    <option value="todos">Todas as Redes</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="e-Mola">e-Mola</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Registros de Pagamento Submetidos</h3>
                  <p className="text-xs text-slate-500">
                    Ações requeridas: <strong className="text-slate-700">Aprovar</strong> (libera serviço, atualiza saldo e gera recibo), <strong className="text-slate-700">Rejeitar</strong> ou <strong className="text-slate-700">Pedir Correção</strong>.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full">
                  {filteredAdminPayments.length} registros
                </span>
              </div>

              {filteredAdminPayments.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold text-slate-600">Nenhum pagamento encontrado com os filtros selecionados.</p>
                  <p className="text-xs mt-1">Limpe os filtros ou aguarde novas submissões de formandos.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Formando / Curso</th>
                        <th className="p-3.5">Serviço</th>
                        <th className="p-3.5">Rede &amp; Código</th>
                        <th className="p-3.5">Data &amp; Hora</th>
                        <th className="p-3.5 text-right">Valor</th>
                        <th className="p-3.5 text-center">Estado</th>
                        <th className="p-3.5 text-center">Comprovativo</th>
                        <th className="p-3.5 text-right">Ações da Tesouraria</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdminPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900 text-xs">{p.studentName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {p.studentCode} • {p.courseName || 'Geral'}
                            </p>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              {getServiceIcon(p.serviceItem)}
                              <span className="font-bold text-slate-800 uppercase text-xs">
                                {p.serviceItem}
                              </span>
                            </div>
                            {p.receiptNumber && (
                              <p className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5">
                                Recibo: {p.receiptNumber}
                              </p>
                            )}
                          </td>

                          <td className="p-3.5">
                            <div className="font-mono font-bold text-slate-800 text-xs flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${p.network === 'M-Pesa' ? 'bg-red-600' : 'bg-amber-500'}`}></span>
                              {p.network}
                            </div>
                            <span className="font-mono text-slate-600 font-semibold text-[11px]">
                              {p.transactionCode}
                            </span>
                          </td>

                          <td className="p-3.5 font-mono text-slate-600">
                            <div>{p.date}</div>
                            <div className="text-[10px] text-slate-400">{p.time}</div>
                          </td>

                          <td className="p-3.5 text-right font-mono font-black text-slate-900 text-sm">
                            {p.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                          </td>

                          <td className="p-3.5 text-center">
                            {getStatusBadge(p.status)}
                          </td>

                          <td className="p-3.5 text-center">
                            {p.proofUrl ? (
                              <button
                                type="button"
                                onClick={() => setProofPayment(p)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-slate-500" /> Ver Anexo
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">SMS / Sem anexo</span>
                            )}
                          </td>

                          <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                            {p.status === 'PENDENTE DE CONFIRMAÇÃO' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setActionModal({ type: 'approve', payment: p })}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                                  title="Aprovar pagamento, atualizar saldo e liberar serviço"
                                >
                                  Aprovar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActionModal({ type: 'correct', payment: p })}
                                  className="px-2 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                  title="Solicitar correção ao aluno"
                                >
                                  Pedir Correção
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActionModal({ type: 'reject', payment: p })}
                                  className="px-2 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                  title="Rejeitar pagamento"
                                >
                                  Rejeitar
                                </button>
                              </>
                            )}

                            {p.status === 'PAGO' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setReceiptPayment(p)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Recibo Oficial
                                </button>
                              </>
                            )}

                            {p.status === 'CORREÇÃO SOLICITADA' && (
                              <span className="text-[11px] font-semibold text-blue-700 italic">
                                Aguardando reenvio pelo formando
                              </span>
                            )}

                            {p.status === 'REJEITADO' && (
                              <span className="text-[11px] font-semibold text-rose-600">
                                Rejeitado
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => setAuditPayment(p)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors ml-1"
                              title="Ver Auditoria do Registro"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. MODAIS & AUDITORIA                                     */}
      {/* ========================================================= */}

      {/* Admin Action Confirmation Modal (Approve, Reject, Correct) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className={`p-5 text-white flex items-center justify-between ${
              actionModal.type === 'approve' 
                ? 'bg-emerald-700' 
                : actionModal.type === 'correct' 
                  ? 'bg-blue-700' 
                  : 'bg-rose-700'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {actionModal.type === 'approve' && <CheckCircle2 className="w-5 h-5" />}
                {actionModal.type === 'correct' && <RotateCcw className="w-5 h-5" />}
                {actionModal.type === 'reject' && <XCircle className="w-5 h-5" />}
                {actionModal.type === 'approve' && 'Homologar & Aprovar Pagamento'}
                {actionModal.type === 'correct' && 'Solicitar Correção ao Formando'}
                {actionModal.type === 'reject' && 'Rejeitar Comprovativo de Pagamento'}
              </div>
              <button
                onClick={() => { setActionModal(null); setAdminActionNotes(''); }}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p><strong>Formando:</strong> {actionModal.payment.studentName} ({actionModal.payment.studentCode})</p>
                <p><strong>Serviço:</strong> <span className="uppercase font-bold">{actionModal.payment.serviceItem}</span></p>
                <p><strong>Valor:</strong> <span className="font-mono font-bold text-slate-900">{actionModal.payment.amount.toLocaleString('pt-MZ')} MT</span> via {actionModal.payment.network}</p>
                <p><strong>Código da Transação:</strong> <span className="font-mono font-bold">{actionModal.payment.transactionCode}</span></p>
              </div>

              {actionModal.type === 'approve' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Impactos Automáticos da Aprovação:
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    <li>Estado alterado para <strong>PAGO</strong></li>
                    <li><strong>Atualização de Saldo:</strong> Saldo devedor do aluno reduzido em {actionModal.payment.amount.toLocaleString('pt-MZ')} MT</li>
                    <li><strong>Liberação de Serviço:</strong> {PAYMENT_SERVICE_CATALOG[actionModal.payment.serviceItem].serviceReleaseDetail}</li>
                    <li><strong>Geração de Recibo Oficial:</strong> Numeração sequencial autenticada emitida</li>
                    <li><strong>Registro no Caixa:</strong> Lançamento automático de entrada em dinheiro digital</li>
                    <li><strong>Registro de Auditoria:</strong> Trilha arquivada no histórico financeiro</li>
                  </ul>
                </div>
              )}

              {actionModal.type === 'correct' && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900 uppercase">
                    Instruções para o Formando *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ex: O código enviado está cortado no final. Por favor, reenvie o código completo conforme o SMS da operadora."
                    value={adminActionNotes}
                    onChange={(e) => setAdminActionNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    O aluno verá este recado em destaque e terá acesso ao formulário de retificação imediata.
                  </p>
                </div>
              )}

              {actionModal.type === 'reject' && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-900 uppercase">
                    Motivo Formal da Rejeição *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ex: Transação não identificada na conta oficial da escola após verificação no extrato bancário."
                    value={adminActionNotes}
                    onChange={(e) => setAdminActionNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-rose-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    O motivo será arquivado na auditoria do formando.
                  </p>
                </div>
              )}

              {actionModal.type === 'approve' && (
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    Observação no Recibo (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Quitação homologada pela Direção Financeira"
                    value={adminActionNotes}
                    onChange={(e) => setAdminActionNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setActionModal(null); setAdminActionNotes(''); }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>

                {actionModal.type === 'approve' && (
                  <button
                    type="button"
                    onClick={() => {
                      approvePayment(actionModal.payment.id, adminActionNotes || undefined);
                      setActionModal(null);
                      setAdminActionNotes('');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm cursor-pointer"
                  >
                    Confirmar Aprovação &amp; Liberar
                  </button>
                )}

                {actionModal.type === 'correct' && (
                  <button
                    type="button"
                    disabled={!adminActionNotes.trim()}
                    onClick={() => {
                      requestPaymentCorrection(actionModal.payment.id, adminActionNotes.trim());
                      setActionModal(null);
                      setAdminActionNotes('');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    Enviar Pedido de Correção
                  </button>
                )}

                {actionModal.type === 'reject' && (
                  <button
                    type="button"
                    disabled={!adminActionNotes.trim()}
                    onClick={() => {
                      rejectPayment(actionModal.payment.id, adminActionNotes.trim());
                      setActionModal(null);
                      setAdminActionNotes('');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    Confirmar Rejeição
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Correction / Retification Modal for Student */}
      {correctionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Edit3 className="w-5 h-5" />
                Retificar Pagamento: {correctionTarget.serviceItem.toUpperCase()}
              </div>
              <button
                onClick={() => setCorrectionTarget(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResubmit} className="p-6 space-y-4 text-xs">
              {correctionTarget.correctionNotes && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                  <p className="font-bold text-xs uppercase mb-0.5">Orientações da Tesouraria:</p>
                  <p>{correctionTarget.correctionNotes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    Novo Código da Transação *
                  </label>
                  <input
                    type="text"
                    required
                    value={resubmitCode}
                    onChange={(e) => setResubmitCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    Valor Pago (MZN) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={resubmitAmount}
                    onChange={(e) => setResubmitAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    Rede *
                  </label>
                  <select
                    value={resubmitNetwork}
                    onChange={(e) => setResubmitNetwork(e.target.value as PaymentNetwork)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="e-Mola">e-Mola</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={resubmitDate}
                    onChange={(e) => setResubmitDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={resubmitTime}
                    onChange={(e) => setResubmitTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectionTarget(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm cursor-pointer"
                >
                  Salvar &amp; Reenviar para Homologação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Trail Drawer / Modal */}
      {auditPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <History className="w-4 h-4 text-emerald-400" />
                Trilha de Auditoria do Pagamento
              </div>
              <button
                onClick={() => setAuditPayment(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p><strong>Formando:</strong> {auditPayment.studentName} ({auditPayment.studentCode})</p>
                <p><strong>Serviço:</strong> {auditPayment.serviceItem.toUpperCase()} • <strong>Valor:</strong> {auditPayment.amount.toLocaleString('pt-MZ')} MT</p>
                <p><strong>Código:</strong> {auditPayment.transactionCode} ({auditPayment.network})</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Histórico de Eventos</h4>
                {auditPayment.auditTrail && auditPayment.auditTrail.length > 0 ? (
                  auditPayment.auditTrail.map((entry, idx) => (
                    <div key={entry.id || idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{entry.action}</span>
                        <span className="text-[10px] font-mono text-slate-400">{new Date(entry.timestamp).toLocaleString('pt-MZ')}</span>
                      </div>
                      <p className="text-slate-600">{entry.details}</p>
                      <p className="text-[10px] text-slate-400">
                        Responsável: <strong className="text-slate-700">{entry.actorName}</strong> ({entry.actorRole})
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Sem eventos adicionais de auditoria.</p>
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setAuditPayment(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {receiptPayment && (
        <PaymentReceiptModal
          payment={receiptPayment}
          onClose={() => setReceiptPayment(null)}
        />
      )}

      {/* Proof Preview Modal */}
      {proofPayment && (
        <PaymentProofModal
          payment={proofPayment}
          onClose={() => setProofPayment(null)}
        />
      )}
    </div>
  );
};
