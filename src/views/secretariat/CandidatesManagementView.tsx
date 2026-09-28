import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowRight, 
  FileText, 
  Check, 
  X, 
  ChevronRight, 
  GraduationCap, 
  Sparkles, 
  Printer, 
  Download, 
  Share2, 
  MessageCircle, 
  Eye, 
  Settings, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Layers, 
  Award, 
  ShieldCheck, 
  BookOpen, 
  HelpCircle, 
  Send,
  ExternalLink,
  UserCheck,
  Building2,
  RefreshCw,
  Edit3,
  Globe,
  Sliders,
  History,
  FileSpreadsheet,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { soundManager } from '../../utils/audio';
import { RegistrationApplication, StudentStatus, OnlineRegistrationConfig, OnlineCourseConfig } from '../../types';
import { hasPermission } from '../../types/rbac';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { RecordHistoryModal } from '../../components/common/RecordHistoryModal';
import { RecordDetailsModal, DetailField } from '../../components/common/RecordDetailsModal';

export const CandidatesManagementView: React.FC = () => {
  const { 
    applications, 
    activeInstitution, 
    activeRole,
    classes,
    courses,
    activeBranchId,
    onlineRegistrationConfig,
    updateOnlineRegistrationConfig,
    addApplication,
    deleteApplication,
    approveApplication,
    rejectApplication,
    convertCandidateToStudent,
    updateApplication,
    navigate,
    openWhatsAppMessage
  } = useApp();

  const { success, error: toastError, info } = useToast();

  // Active View Tab: 'candidatos' | 'configuracao' | 'estatisticas'
  const [activeTab, setActiveTab] = useState<'candidatos' | 'configuracao'>('candidatos');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('todos');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('todos');

  // Candidate Detail / Review Drawer State
  const [selectedCandidate, setSelectedCandidate] = useState<RegistrationApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // UX Modals State
  const [viewingCandidateDetails, setViewingCandidateDetails] = useState<RegistrationApplication | null>(null);
  const [historyCandidate, setHistoryCandidate] = useState<RegistrationApplication | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<RegistrationApplication | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Add Candidate (Manual / Balcão) State
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [candidateFormData, setCandidateFormData] = useState({
    fullName: '',
    documentType: 'BI' as 'BI' | 'Passaporte' | 'DIRE' | 'Cédula',
    documentNumber: '',
    birthDate: '',
    gender: 'Masculino' as 'Masculino' | 'Feminino' | 'Outro',
    phone: '',
    email: '',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: '',
    guardianName: '',
    guardianPhone: '',
    courseId: '',
    regime: 'Pós-Laboral' as 'Laboral' | 'Pós-Laboral' | 'Online' | 'Híbrido' | 'Sábado',
    shift: 'Noite',
    paymentStatus: 'Pago' as 'Pago' | 'Pendente',
    paymentAmount: 1500,
    paymentMethod: 'Dinheiro',
    analysisNotes: ''
  });

  // Edit Candidate State
  const [candidateToEdit, setCandidateToEdit] = useState<RegistrationApplication | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    documentType: 'BI' as 'BI' | 'Passaporte' | 'DIRE' | 'Cédula',
    documentNumber: '',
    birthDate: '',
    gender: 'Masculino' as 'Masculino' | 'Feminino' | 'Outro',
    phone: '',
    email: '',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: '',
    guardianName: '',
    guardianPhone: '',
    courseId: '',
    courseName: '',
    regime: 'Pós-Laboral' as 'Laboral' | 'Pós-Laboral' | 'Online' | 'Híbrido' | 'Sábado',
    shift: 'Noite',
    paymentStatus: 'Pago' as 'Pago' | 'Pendente',
    paymentAmount: 1500,
    paymentMethod: 'Dinheiro',
    analysisNotes: ''
  });

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Documentação ilegível ou incompleta');
  const [rejectionCustomNotes, setRejectionCustomNotes] = useState('');

  // Conversion to Student Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [targetRegime, setTargetRegime] = useState<string>('');
  const [targetStudentStatus, setTargetStudentStatus] = useState<StudentStatus>('Matriculado');
  const [conversionSuccessResult, setConversionSuccessResult] = useState<{
    studentCode: string;
    studentName: string;
    className: string;
  } | null>(null);

  // Configuration Edit State (Local copy synced from onlineRegistrationConfig)
  const [cfgIsOpen, setCfgIsOpen] = useState(onlineRegistrationConfig.isOpen);
  const [cfgTitle, setCfgTitle] = useState(onlineRegistrationConfig.title);
  const [cfgDescription, setCfgDescription] = useState(onlineRegistrationConfig.description);
  const [cfgStartDate, setCfgStartDate] = useState(onlineRegistrationConfig.startDate);
  const [cfgEndDate, setCfgEndDate] = useState(onlineRegistrationConfig.endDate);
  const [cfgAcademicYear, setCfgAcademicYear] = useState(onlineRegistrationConfig.academicYear);
  const [cfgSemester, setCfgSemester] = useState(onlineRegistrationConfig.semester);
  const [cfgConfirmationTemplate, setCfgConfirmationTemplate] = useState(onlineRegistrationConfig.confirmationMessageTemplate || '');
  const [cfgRequiredFields, setCfgRequiredFields] = useState(onlineRegistrationConfig.requiredFields);
  const [cfgRequiredDocs, setCfgRequiredDocs] = useState<string[]>(onlineRegistrationConfig.requiredDocuments || []);
  const [cfgNewDocInput, setCfgNewDocInput] = useState('');
  const [cfgCourses, setCfgCourses] = useState<OnlineCourseConfig[]>(onlineRegistrationConfig.coursesConfig || []);
  const [cfgQuestions, setCfgQuestions] = useState(onlineRegistrationConfig.customQuestions || []);
  
  // New Question Form State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'select' | 'boolean'>('text');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);

  // Filtered Candidates List
  const filteredCandidates = useMemo(() => {
    return applications.filter(app => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = app.fullName.toLowerCase().includes(q);
        const matchCode = app.code.toLowerCase().includes(q);
        const matchDoc = app.documentNumber.toLowerCase().includes(q);
        const matchPhone = app.phone.toLowerCase().includes(q);
        const matchEmail = app.email.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDoc && !matchPhone && !matchEmail) return false;
      }

      // Status
      if (selectedStatusFilter !== 'todos' && app.status !== selectedStatusFilter) {
        return false;
      }

      // Course
      if (selectedCourseFilter !== 'todos' && app.courseId !== selectedCourseFilter) {
        return false;
      }

      // Payment
      if (selectedPaymentFilter !== 'todos' && app.paymentStatus !== selectedPaymentFilter) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, selectedStatusFilter, selectedCourseFilter, selectedPaymentFilter]);

  // Statistics KPIs
  const totalCandidates = applications.length;
  const pendingCandidates = applications.filter(a => a.status === 'Pendente' || a.status === 'Em Análise').length;
  const approvedCandidates = applications.filter(a => a.status === 'Aprovada').length;
  const enrolledCandidates = applications.filter(a => a.status === 'Matriculado').length;
  const rejectedCandidates = applications.filter(a => a.status === 'Rejeitada').length;
  const totalPaidRevenue = applications
    .filter(a => a.paymentStatus === 'Pago')
    .reduce((sum, a) => sum + (a.paymentAmount || 1500), 0);

  // Available classes for conversion matching the candidate's course
  const candidateClasses = useMemo(() => {
    if (!selectedCandidate) return classes;
    return classes.filter(c => c.courseId === selectedCandidate.courseId || c.courseName === selectedCandidate.courseName);
  }, [classes, selectedCandidate]);

  // Handle Opening Candidate Detail Drawer
  const handleOpenDetail = (cand: RegistrationApplication) => {
    setSelectedCandidate(cand);
    setReviewNotes(cand.analysisNotes || '');
    // Reset target conversion selections
    const matchedClass = classes.find(c => c.courseId === cand.courseId) || classes[0];
    setTargetClassId(matchedClass ? matchedClass.id : '');
    setTargetRegime(cand.regime || 'Pós-Laboral');
    soundManager.playClick();
  };

  // Handle Approval Action
  const handleApprove = () => {
    if (!selectedCandidate) return;
    approveApplication(selectedCandidate.id, reviewNotes || 'Candidatura analisada e aprovada pela secretaria acadêmica.');
    setSelectedCandidate(prev => prev ? { ...prev, status: 'Aprovada', analysisNotes: reviewNotes } : null);
    success('Candidatura Aprovada', `A candidatura de ${selectedCandidate.fullName} (#${selectedCandidate.code}) foi aprovada para matrícula.`);
  };

  // Handle Rejection Action
  const handleConfirmReject = () => {
    if (!selectedCandidate) return;
    const finalReason = rejectionCustomNotes ? `${rejectionReason}: ${rejectionCustomNotes}` : rejectionReason;
    rejectApplication(selectedCandidate.id, finalReason, reviewNotes);
    setSelectedCandidate(prev => prev ? { ...prev, status: 'Rejeitada', rejectionReason: finalReason, analysisNotes: reviewNotes } : null);
    setShowRejectModal(false);
    setRejectionCustomNotes('');
    info('Candidatura Deferida como Rejeitada', `A candidatura #${selectedCandidate.code} foi rejeitada pelo motivo: ${finalReason}`);
  };

  // Handle Convert to Student Action
  const handleConvert = () => {
    if (!selectedCandidate) return;
    const chosenClassId = targetClassId || (candidateClasses[0]?.id || classes[0]?.id);
    if (!chosenClassId) {
      toastError('Turma Obrigatória', 'Selecione ou crie uma turma para alocar o aluno.');
      return;
    }

    const createdStudent = convertCandidateToStudent(
      selectedCandidate.id, 
      chosenClassId, 
      targetStudentStatus, 
      targetRegime || selectedCandidate.regime
    );

    if (createdStudent) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      soundManager.playSuccess();
      setConversionSuccessResult({
        studentCode: createdStudent.code,
        studentName: createdStudent.fullName,
        className: createdStudent.classGroupName
      });
      setShowConvertModal(false);
      setSelectedCandidate(prev => prev ? { 
        ...prev, 
        status: 'Matriculado', 
        convertedStudentId: createdStudent.id, 
        convertedStudentCode: createdStudent.code 
      } : null);
      success('Matrícula Efetivada', `${createdStudent.fullName} matriculado com sucesso sob o código ${createdStudent.code}!`);
    }
  };

  // Handle Export CSV
  const handleExportCandidatesCsv = () => {
    setIsExporting(true);
    try {
      const headers = [
        'Código',
        'Nome Completo',
        'Tipo Documento',
        'Número Documento',
        'Data Nascimento',
        'Gênero',
        'Telefone',
        'Email',
        'Província',
        'Cidade',
        'Curso Pretendido',
        'Regime',
        'Turno',
        'Estado Candidatura',
        'Estado Pagamento',
        'Valor Taxa (MT)',
        'Data Inscrição',
        'Data Análise',
        'Parecer Secretaria'
      ];

      const rows = filteredCandidates.map(c => [
        `"${c.code}"`,
        `"${(c.fullName || '').replace(/"/g, '""')}"`,
        `"${c.documentType}"`,
        `"${c.documentNumber}"`,
        `"${c.birthDate || ''}"`,
        `"${c.gender || ''}"`,
        `"${c.phone}"`,
        `"${c.email}"`,
        `"${c.province || ''}"`,
        `"${c.city || ''}"`,
        `"${(c.courseName || '').replace(/"/g, '""')}"`,
        `"${c.regime || ''}"`,
        `"${c.shift || ''}"`,
        `"${c.status}"`,
        `"${c.paymentStatus}"`,
        `"${c.paymentAmount || 1500}"`,
        `"${c.createdAt || ''}"`,
        `"${c.analyzedAt || ''}"`,
        `"${(c.analysisNotes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `candidatos_${activeInstitution.code || 'instituicao'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('Exportação Concluída', `${filteredCandidates.length} candidatos exportados com sucesso.`);
    } catch (err) {
      toastError('Erro ao Exportar', 'Ocorreu um erro ao gerar a planilha de candidatos.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Save New Candidate (Manual / Balcão)
  const handleSaveNewCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateFormData.fullName || !candidateFormData.documentNumber || !candidateFormData.phone) {
      toastError('Campos Obrigatórios', 'Preencha o Nome Completo, Número de Documento e Telefone.');
      return;
    }

    const selectedCourse = courses.find(c => c.id === candidateFormData.courseId) || courses[0];
    const newCandidate = addApplication({
      institutionId: activeInstitution.id,
      branchId: activeBranchId !== 'todas' ? activeBranchId : undefined,
      fullName: candidateFormData.fullName,
      documentType: candidateFormData.documentType as any,
      documentNumber: candidateFormData.documentNumber,
      birthDate: candidateFormData.birthDate || '2000-01-01',
      gender: candidateFormData.gender as any,
      phone: candidateFormData.phone,
      email: candidateFormData.email || `${candidateFormData.documentNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@candidato.mz`,
      province: candidateFormData.province,
      city: candidateFormData.city,
      address: candidateFormData.address,
      guardianName: candidateFormData.guardianName,
      guardianPhone: candidateFormData.guardianPhone,
      courseId: selectedCourse?.id || 'crs-default',
      courseName: selectedCourse?.name || 'Curso Técnico',
      regime: candidateFormData.regime,
      shift: candidateFormData.shift,
      status: 'Pendente',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      paymentReference: `BALCAO-${Date.now().toString().slice(-6)}`,
      paymentStatus: candidateFormData.paymentStatus,
      paymentAmount: Number(candidateFormData.paymentAmount) || 1500,
      paymentMethod: candidateFormData.paymentMethod,
      analysisNotes: candidateFormData.analysisNotes,
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name: `Documento de Identificação (${candidateFormData.documentType})`,
          fileName: `identificacao_${candidateFormData.documentNumber}.pdf`,
          fileSize: '1.4 MB',
          type: 'BI',
          verified: true,
          uploadedAt: new Date().toISOString().split('T')[0]
        },
        {
          id: `doc-${Date.now()}-2`,
          name: 'Certificado de Habilitações',
          fileName: 'certificado_habilitacoes.pdf',
          fileSize: '2.1 MB',
          type: 'Certificado',
          verified: false,
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      ]
    });

    success('Candidato Cadastrado', `Inscrição #${newCandidate.code} criada com sucesso para ${newCandidate.fullName}.`);
    setIsAddCandidateModalOpen(false);
    // Reset form
    setCandidateFormData({
      fullName: '',
      documentType: 'BI',
      documentNumber: '',
      birthDate: '',
      gender: 'Masculino',
      phone: '',
      email: '',
      province: 'Maputo Cidade',
      city: 'Maputo',
      address: '',
      guardianName: '',
      guardianPhone: '',
      courseId: courses[0]?.id || '',
      regime: 'Pós-Laboral',
      shift: 'Noite',
      paymentStatus: 'Pago',
      paymentAmount: 1500,
      paymentMethod: 'Dinheiro',
      analysisNotes: ''
    });
  };

  // Open Edit Candidate Modal
  const handleOpenEditCandidate = (cand: RegistrationApplication) => {
    setCandidateToEdit(cand);
    setEditFormData({
      fullName: cand.fullName,
      documentType: cand.documentType,
      documentNumber: cand.documentNumber,
      birthDate: cand.birthDate || '',
      gender: cand.gender,
      phone: cand.phone,
      email: cand.email,
      province: cand.province || '',
      city: cand.city || '',
      address: cand.address || '',
      guardianName: cand.guardianName || '',
      guardianPhone: cand.guardianPhone || '',
      courseId: cand.courseId,
      courseName: cand.courseName,
      regime: (cand.regime as any) || 'Pós-Laboral',
      shift: cand.shift || 'Noite',
      paymentStatus: cand.paymentStatus,
      paymentAmount: cand.paymentAmount || 1500,
      paymentMethod: cand.paymentMethod || 'Dinheiro',
      analysisNotes: cand.analysisNotes || ''
    });
  };

  // Handle Save Edit Candidate
  const handleSaveEditCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateToEdit) return;

    const selectedCourse = courses.find(c => c.id === editFormData.courseId) || courses.find(c => c.name === editFormData.courseName);
    updateApplication(candidateToEdit.id, {
      fullName: editFormData.fullName,
      documentType: editFormData.documentType as any,
      documentNumber: editFormData.documentNumber,
      birthDate: editFormData.birthDate,
      gender: editFormData.gender as any,
      phone: editFormData.phone,
      email: editFormData.email,
      province: editFormData.province,
      city: editFormData.city,
      address: editFormData.address,
      guardianName: editFormData.guardianName,
      guardianPhone: editFormData.guardianPhone,
      courseId: selectedCourse?.id || candidateToEdit.courseId,
      courseName: selectedCourse?.name || candidateToEdit.courseName,
      regime: editFormData.regime,
      shift: editFormData.shift,
      paymentStatus: editFormData.paymentStatus,
      paymentAmount: Number(editFormData.paymentAmount) || candidateToEdit.paymentAmount,
      paymentMethod: editFormData.paymentMethod,
      analysisNotes: editFormData.analysisNotes
    });

    success('Dados Atualizados', `Ficha do candidato #${candidateToEdit.code} foi atualizada com sucesso.`);
    setCandidateToEdit(null);
  };

  // Handle Document Verification Toggle
  const handleToggleDocVerification = (docId: string, currentStatus: boolean) => {
    if (!selectedCandidate || !selectedCandidate.documents) return;
    const updatedDocs = selectedCandidate.documents.map(d => {
      if (d.id === docId) {
        return { ...d, verified: !currentStatus };
      }
      return d;
    });

    updateApplication(selectedCandidate.id, { documents: updatedDocs });
    setSelectedCandidate({ ...selectedCandidate, documents: updatedDocs });
    soundManager.playClick();
  };

  // Save Configuration Handler
  const handleSaveConfig = () => {
    const updatedConfig: OnlineRegistrationConfig = {
      ...onlineRegistrationConfig,
      isOpen: cfgIsOpen,
      title: cfgTitle,
      description: cfgDescription,
      startDate: cfgStartDate,
      endDate: cfgEndDate,
      academicYear: cfgAcademicYear,
      semester: cfgSemester,
      confirmationMessageTemplate: cfgConfirmationTemplate,
      requiredFields: cfgRequiredFields,
      requiredDocuments: cfgRequiredDocs,
      coursesConfig: cfgCourses,
      customQuestions: cfgQuestions
    };

    updateOnlineRegistrationConfig(updatedConfig);
  };

  // Add Document to Config
  const handleAddRequiredDoc = () => {
    if (!cfgNewDocInput.trim()) return;
    if (cfgRequiredDocs.includes(cfgNewDocInput.trim())) return;
    setCfgRequiredDocs([...cfgRequiredDocs, cfgNewDocInput.trim()]);
    setCfgNewDocInput('');
  };

  // Remove Document from Config
  const handleRemoveRequiredDoc = (docName: string) => {
    setCfgRequiredDocs(cfgRequiredDocs.filter(d => d !== docName));
  };

  // Add Question to Config
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ = {
      id: `q-${Date.now()}`,
      question: newQuestionText.trim(),
      type: newQuestionType,
      options: newQuestionType === 'select' ? newQuestionOptions.split(',').map(o => o.trim()).filter(Boolean) : undefined,
      required: newQuestionRequired
    };
    setCfgQuestions([...cfgQuestions, newQ]);
    setNewQuestionText('');
    setNewQuestionOptions('');
    setNewQuestionRequired(true);
  };

  // Remove Question from Config
  const handleRemoveQuestion = (qId: string) => {
    setCfgQuestions(cfgQuestions.filter(q => q.id !== qId));
  };

  // Toggle Course in Config
  const handleToggleCourseActive = (courseId: string) => {
    setCfgCourses(cfgCourses.map(c => c.courseId === courseId ? { ...c, active: !c.active } : c));
  };

  // Update Course Vacancies or Price
  const handleUpdateCourseField = (courseId: string, field: keyof OnlineCourseConfig, value: any) => {
    setCfgCourses(cfgCourses.map(c => c.courseId === courseId ? { ...c, [field]: value } : c));
  };

  return (
    <div id="candidates-management-root" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Context Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Secretaria Acadêmica & Admissões
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
              {activeInstitution.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-emerald-400" />
            Gestão de Candidatos & Inscrições Online
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Análise de candidaturas, conferência documental, aprovação com parecer da secretaria e conversão automatizada em aluno oficial.
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCandidatesCsv}
            disabled={isExporting || filteredCandidates.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Exportar candidatos para arquivo CSV"
          >
            <Download className="w-3.5 h-3.5 text-pink-400" />
            Exportar ({filteredCandidates.length})
          </button>

          <button
            onClick={() => setIsAddCandidateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/20"
            title="Cadastrar candidatura manual no balcão da secretaria"
          >
            <Plus className="w-4 h-4" />
            Inscrever Candidato
          </button>

          <button
            onClick={() => navigate('inscricao_privada')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-amber-500/20"
            title="Abrir plataforma de inscrição privada, balcão e links institucionais"
          >
            <Lock className="w-3.5 h-3.5 text-slate-950" />
            <span>Inscrição Privada &amp; Links</span>
          </button>

          <button
            onClick={() => navigate('inscricao_publica')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-sky-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-sky-500/40"
            title="Abrir página pública de candidatura como um candidato"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            Página Pública
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => { setActiveTab('candidatos'); soundManager.playClick(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'candidatos'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Candidaturas ({applications.length})
            </button>
            <button
              onClick={() => { setActiveTab('configuracao'); soundManager.playClick(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'configuracao'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Configurar Inscrições
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Candidatos</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalCandidates}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>Inscritos no portal</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">Pendentes / Análise</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{pendingCandidates}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>Aguardam validação</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Aprovadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{approvedCandidates}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>Prontos p/ matrícula</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-400">Matriculados</span>
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">{enrolledCandidates}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>Convertidos em aluno</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Taxas Arrecadadas</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalPaidRevenue.toLocaleString()} MT</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400/90 mt-1 font-medium">
            <span>Pagos via M-Pesa / Banco</span>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'candidatos' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por nome, código (CFTPM-CAND...), BI, telefone ou email..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Selects */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Select */}
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/60 cursor-pointer"
              >
                <option value="todos">Todos os Estados</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Análise">Em Análise</option>
                <option value="Aprovada">Aprovada</option>
                <option value="Matriculado">Matriculado</option>
                <option value="Rejeitada">Rejeitada</option>
                <option value="Aguardando Pagamento">Aguardando Pagamento</option>
              </select>

              {/* Course Select */}
              <select
                value={selectedCourseFilter}
                onChange={e => setSelectedCourseFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/60 cursor-pointer max-w-[200px] truncate"
              >
                <option value="todos">Todos os Cursos</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Payment Select */}
              <select
                value={selectedPaymentFilter}
                onChange={e => setSelectedPaymentFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/60 cursor-pointer"
              >
                <option value="todos">Pagamento (Todos)</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
              </select>

              {/* Reset Filters */}
              {(selectedStatusFilter !== 'todos' || selectedCourseFilter !== 'todos' || selectedPaymentFilter !== 'todos' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedStatusFilter('todos');
                    setSelectedCourseFilter('todos');
                    setSelectedPaymentFilter('todos');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-2 text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                  title="Limpar filtros"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Candidates List Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Candidato</th>
                    <th className="py-3.5 px-4">Curso / Regime</th>
                    <th className="py-3.5 px-4">Documentação</th>
                    <th className="py-3.5 px-4">Taxa Inscrição</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Submissão</th>
                    <th className="py-3.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6">
                        <EmptyState
                          title="Nenhum candidato encontrado"
                          description="Não existem candidaturas que correspondam aos filtros ou termos de pesquisa aplicados."
                          actionLabel="Inscrever Candidato (Balcão)"
                          onAction={() => setIsAddCandidateModalOpen(true)}
                          resetLabel="Limpar Filtros"
                          onReset={() => {
                            setSelectedStatusFilter('todos');
                            setSelectedCourseFilter('todos');
                            setSelectedPaymentFilter('todos');
                            setSearchQuery('');
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map(candidate => {
                      // Status Badge Styling
                      let statusBadge = { bg: 'bg-slate-800 text-slate-300 border-slate-700', label: candidate.status };
                      if (candidate.status === 'Aprovada') {
                        statusBadge = { bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Aprovada' };
                      } else if (candidate.status === 'Em Análise') {
                        statusBadge = { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'Em Análise' };
                      } else if (candidate.status === 'Pendente') {
                        statusBadge = { bg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', label: 'Pendente' };
                      } else if (candidate.status === 'Matriculado') {
                        statusBadge = { bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30', label: 'Matriculado' };
                      } else if (candidate.status === 'Rejeitada') {
                        statusBadge = { bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', label: 'Rejeitada' };
                      }

                      const docsCount = candidate.documents?.length || 0;
                      const verifiedDocsCount = candidate.documents?.filter(d => d.verified).length || 0;

                      return (
                        <tr 
                          key={candidate.id} 
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Candidate Identity */}
                          <td className="py-3 px-4" onClick={() => handleOpenDetail(candidate)}>
                            <div className="flex items-center gap-3">
                              <img 
                                src={candidate.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                                alt={candidate.fullName} 
                                className="w-10 h-10 rounded-full object-cover border border-slate-700/80 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                                  {candidate.fullName}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  <span className="font-mono text-emerald-400/90 font-medium">{candidate.code}</span>
                                  <span>•</span>
                                  <span>{candidate.documentType}: {candidate.documentNumber}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Course & Regime */}
                          <td className="py-3 px-4" onClick={() => handleOpenDetail(candidate)}>
                            <p className="font-medium text-slate-200 truncate max-w-[220px]">{candidate.courseName}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {candidate.regime} {candidate.shift ? `• ${candidate.shift}` : ''}
                            </p>
                          </td>

                          {/* Documents verification */}
                          <td className="py-3 px-4" onClick={() => handleOpenDetail(candidate)}>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                docsCount === 0
                                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                                  : verifiedDocsCount === docsCount
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              }`}>
                                {verifiedDocsCount}/{docsCount} verificados
                              </span>
                            </div>
                          </td>

                          {/* Payment */}
                          <td className="py-3 px-4" onClick={() => handleOpenDetail(candidate)}>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              candidate.paymentStatus === 'Pago'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${candidate.paymentStatus === 'Pago' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                              {candidate.paymentStatus === 'Pago' ? `${(candidate.paymentAmount || 1500).toLocaleString()} MT` : 'Pendente'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4" onClick={() => handleOpenDetail(candidate)}>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge.bg}`}>
                              {statusBadge.label}
                            </span>
                          </td>

                          {/* Submission Date */}
                          <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap" onClick={() => handleOpenDetail(candidate)}>
                            {candidate.createdAt}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
                              {/* Ver Ficha Detalhada */}
                              <button
                                onClick={() => setViewingCandidateDetails(candidate)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                                title="Visualizar Ficha Completa do Candidato"
                              >
                                <Eye className="w-4 h-4 text-sky-400" />
                              </button>

                              {/* Painel de Análise & Parecer */}
                              <button
                                onClick={() => handleOpenDetail(candidate)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                                title="Analisar Documentos & Parecer da Secretaria"
                              >
                                <FileText className="w-4 h-4 text-emerald-400" />
                              </button>

                              {/* Editar Candidato */}
                              <button
                                onClick={() => handleOpenEditCandidate(candidate)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                                title="Editar Dados da Candidatura"
                              >
                                <Edit3 className="w-4 h-4 text-amber-400" />
                              </button>

                              {/* Histórico do Candidato */}
                              <button
                                onClick={() => setHistoryCandidate(candidate)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                                title="Histórico e Auditoria da Inscrição"
                              >
                                <History className="w-4 h-4 text-purple-400" />
                              </button>

                              {/* WhatsApp Direct Message */}
                              {candidate.phone && (
                                <button
                                  onClick={() => openWhatsAppMessage(
                                    candidate.phone, 
                                    `Olá ${candidate.fullName}! Entramos em contato da secretaria do ${activeInstitution.name} a respeito da sua candidatura #${candidate.code}.`
                                  )}
                                  className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 transition-colors cursor-pointer"
                                  title="Enviar mensagem no WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                              )}

                              {/* Matricular Aluno (se aprovada) */}
                              {candidate.status === 'Aprovada' && (
                                <button
                                  onClick={() => {
                                    handleOpenDetail(candidate);
                                    setShowConvertModal(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                                  title="Efetivar Matrícula Oficial"
                                >
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  Matricular
                                </button>
                              )}

                              {/* Excluir Candidatura */}
                              <button
                                onClick={() => setCandidateToDelete(candidate)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700/60 hover:border-rose-500/30 transition-colors cursor-pointer"
                                title="Excluir Processo de Candidatura"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
      ) : (
        /* Configuration Tab */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-6 shadow-xl">
            {/* Header & Status Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  Parâmetros da Página Pública de Inscrição
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure datas de vigência, cursos disponíveis, vagas, valores, requisitos e perguntas adicionais.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  cfgIsOpen 
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}>
                  {cfgIsOpen ? 'Inscrições Abertas' : 'Inscrições Fechadas'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={cfgIsOpen} 
                    onChange={e => setCfgIsOpen(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Basic Information & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Título do Edital / Período</label>
                <input
                  type="text"
                  value={cfgTitle}
                  onChange={e => setCfgTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Ano Letivo</label>
                <input
                  type="text"
                  value={cfgAcademicYear}
                  onChange={e => setCfgAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Semestre / Módulo</label>
                <input
                  type="text"
                  value={cfgSemester}
                  onChange={e => setCfgSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Data de Início das Inscrições</label>
                <input
                  type="date"
                  value={cfgStartDate}
                  onChange={e => setCfgStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Data de Término / Encerramento</label>
                <input
                  type="date"
                  value={cfgEndDate}
                  onChange={e => setCfgEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Descrição Pública do Período</label>
                <input
                  type="text"
                  value={cfgDescription}
                  onChange={e => setCfgDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Courses Availability & Pricing Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    Cursos Disponíveis, Preços, Duração e Vagas
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ative os cursos aceitos neste período de candidatura e ajuste os valores e vagas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {cfgCourses.map(course => (
                  <div 
                    key={course.courseId} 
                    className={`p-4 rounded-xl border transition-all ${
                      course.active 
                        ? 'bg-slate-950 border-slate-800' 
                        : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                          {course.category}
                        </span>
                        <h4 className="font-bold text-white text-xs mt-1 truncate">{course.courseName}</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={course.active} 
                          onChange={() => handleToggleCourseActive(course.courseId)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                      <div>
                        <span className="text-slate-400 block">Taxa Inscrição (MT)</span>
                        <input
                          type="number"
                          value={course.price}
                          onChange={e => handleUpdateCourseField(course.courseId, 'price', Number(e.target.value))}
                          className="w-full mt-0.5 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block">Propina Mensal (MT)</span>
                        <input
                          type="number"
                          value={course.monthlyFee}
                          onChange={e => handleUpdateCourseField(course.courseId, 'monthlyFee', Number(e.target.value))}
                          className="w-full mt-0.5 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block">Duração</span>
                        <input
                          type="text"
                          value={course.duration}
                          onChange={e => handleUpdateCourseField(course.courseId, 'duration', e.target.value)}
                          className="w-full mt-0.5 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block">Total de Vagas</span>
                        <input
                          type="number"
                          value={course.vacancies}
                          onChange={e => handleUpdateCourseField(course.courseId, 'vacancies', Number(e.target.value))}
                          className="w-full mt-0.5 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Vacancy Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Preenchimento de Vagas</span>
                        <span>{course.filledVacancies || 0} / {course.vacancies} ({Math.round(((course.filledVacancies || 0) / course.vacancies) * 100)}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.round(((course.filledVacancies || 0) / course.vacancies) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Documentos Obrigatórios Exigidos
              </h3>
              <p className="text-[11px] text-slate-400">
                Documentos digitais que o candidato deve submeter durante o processo de inscrição online.
              </p>

              <div className="flex flex-wrap gap-2">
                {cfgRequiredDocs.map(doc => (
                  <span 
                    key={doc}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {doc}
                    <button
                      onClick={() => handleRemoveRequiredDoc(doc)}
                      className="text-slate-500 hover:text-rose-400 ml-1 p-0.5 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={cfgNewDocInput}
                  onChange={e => setCfgNewDocInput(e.target.value)}
                  placeholder="Ex: Atestado Médico de Aptidão Física..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddRequiredDoc())}
                />
                <button
                  onClick={handleAddRequiredDoc}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Custom Additional Questions Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Perguntas Adicionais no Formulário
              </h3>
              <p className="text-[11px] text-slate-400">
                Questionamentos personalizados para traçar o perfil de admissão ou levantamento estatístico.
              </p>

              <div className="space-y-2">
                {cfgQuestions.map(q => (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">{q.question}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-mono text-emerald-400 uppercase">{q.type}</span>
                        <span>•</span>
                        <span>{q.required ? 'Obrigatória' : 'Opcional'}</span>
                        {q.options && <span>• Opções: {q.options.join(', ')}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Question Inline Form */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-3">
                <p className="text-xs font-semibold text-slate-300">Nova Pergunta Personalizada</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={e => setNewQuestionText(e.target.value)}
                    placeholder="Pergunta (ex: Possui computador portátil?)"
                    className="md:col-span-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newQuestionType}
                    onChange={e => setNewQuestionType(e.target.value as any)}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="text">Resposta em Texto</option>
                    <option value="boolean">Sim ou Não (Booleano)</option>
                    <option value="select">Múltipla Escolha (Lista)</option>
                  </select>
                </div>

                {newQuestionType === 'select' && (
                  <input
                    type="text"
                    value={newQuestionOptions}
                    onChange={e => setNewQuestionOptions(e.target.value)}
                    placeholder="Opções separadas por vírgula (ex: Facebook, Jornal, Amigos, Website)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQuestionRequired}
                      onChange={e => setNewQuestionRequired(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    Preenchimento Obrigatório
                  </label>
                  <button
                    onClick={handleAddQuestion}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Inserir Pergunta
                  </button>
                </div>
              </div>
            </div>

            {/* Mandatory Personal Fields Checklist */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Campos Pessoais Obrigatórios do Candidato
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                {Object.entries(cfgRequiredFields).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={e => setCfgRequiredFields({ ...cfgRequiredFields, [key]: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Confirmation Template */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">
                Template de Mensagem de Confirmação (SMS / WhatsApp / Email)
              </label>
              <textarea
                rows={2}
                value={cfgConfirmationTemplate}
                onChange={e => setCfgConfirmationTemplate(e.target.value)}
                placeholder="Prezado(a) {NOME}, sua inscrição no curso {CURSO} foi submetida com sucesso! Código: {CODIGO}."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500">
                Substituições disponíveis: <code>&#123;NOME&#125;</code>, <code>&#123;CURSO&#125;</code>, <code>&#123;CODIGO&#125;</code>.
              </span>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('candidatos')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Voltar aos Candidatos
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                Salvar Configurações da Instituição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Review Drawer / Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedCandidate.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'} 
                  alt={selectedCandidate.fullName} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {selectedCandidate.code}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">Submetido: {selectedCandidate.createdAt}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedCandidate.fullName}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedCandidate.phone && (
                  <button
                    onClick={() => openWhatsAppMessage(
                      selectedCandidate.phone,
                      `Olá ${selectedCandidate.fullName}! Entramos em contato a respeito da sua inscrição #${selectedCandidate.code} no curso ${selectedCandidate.courseName}.`
                    )}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                )}
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-400">Estado Atual:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs border ${
                    selectedCandidate.status === 'Aprovada'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : selectedCandidate.status === 'Matriculado'
                      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      : selectedCandidate.status === 'Rejeitada'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {selectedCandidate.status}
                  </span>
                  {selectedCandidate.status === 'Matriculado' && selectedCandidate.convertedStudentCode && (
                    <span className="text-blue-300 font-mono">
                      (Aluno Oficial: {selectedCandidate.convertedStudentCode})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Taxa de Inscrição:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                    selectedCandidate.paymentStatus === 'Pago'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {selectedCandidate.paymentStatus === 'Pago' ? `Pago (${(selectedCandidate.paymentAmount || 1500).toLocaleString()} MT)` : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Two-Column Candidate Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Personal & Course Data */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      Curso Solicitado
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Curso</span>
                        <span className="font-semibold text-white">{selectedCandidate.courseName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Regime / Turno</span>
                        <span>{selectedCandidate.regime} {selectedCandidate.shift ? `(${selectedCandidate.shift})` : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-2">
                      <Users className="w-4 h-4 text-sky-400" />
                      Dados Pessoais & Contactos
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Documento</span>
                        <span>{selectedCandidate.documentType}: {selectedCandidate.documentNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Gênero / Nascimento</span>
                        <span>{selectedCandidate.gender} • {selectedCandidate.birthDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Telefone</span>
                        <span className="font-mono text-emerald-400">{selectedCandidate.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Email</span>
                        <span className="truncate block">{selectedCandidate.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Província / Cidade</span>
                        <span>{selectedCandidate.province}, {selectedCandidate.city}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Endereço</span>
                        <span className="truncate block">{selectedCandidate.address || 'Não especificado'}</span>
                      </div>
                      {selectedCandidate.guardianName && (
                        <div className="col-span-2 pt-1 border-t border-slate-800/60">
                          <span className="text-slate-500 block text-[10px]">Encarregado de Educação</span>
                          <span>{selectedCandidate.guardianName} ({selectedCandidate.guardianPhone || 'Sem telefone'})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2: Custom Answers & Rejection Notes */}
                <div className="space-y-4">
                  {/* Custom Questions Answers */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-2">
                      <HelpCircle className="w-4 h-4 text-violet-400" />
                      Respostas às Perguntas Adicionais
                    </h4>
                    {selectedCandidate.customAnswers && selectedCandidate.customAnswers.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCandidate.customAnswers.map((ans, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                            <span className="text-slate-400 block text-[11px] font-medium">{ans.question}</span>
                            <span className="font-semibold text-white mt-0.5 block">{ans.answer}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs italic">Sem perguntas adicionais preenchidas.</p>
                    )}
                  </div>

                  {/* If Rejected, Show Reason */}
                  {selectedCandidate.rejectionReason && (
                    <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-1.5">
                      <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Motivo do Indeferimento
                      </h4>
                      <p className="text-rose-200 text-xs font-medium">{selectedCandidate.rejectionReason}</p>
                    </div>
                  )}

                  {/* Secretariat Analysis Notes Input */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-emerald-400" />
                      Parecer & Observações da Secretaria
                    </h4>
                    <textarea
                      rows={3}
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      placeholder="Registre notas da verificação de requisitos, autenticidade documental ou observações para o deferimento..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    {selectedCandidate.analyzedBy && (
                      <p className="text-[10px] text-slate-500">
                        Última análise: {selectedCandidate.analyzedAt} por {selectedCandidate.analyzedBy}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Digital Documents Inspection Table */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Documentos Digitais Submetidos ({selectedCandidate.documents?.length || 0})
                  </h4>
                  <span className="text-[11px] text-slate-400">Clique para conferir e marcar como verificado</span>
                </div>

                <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                  {(selectedCandidate.documents && selectedCandidate.documents.length > 0) ? (
                    selectedCandidate.documents.map(doc => (
                      <div key={doc.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/80 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-5 h-5 text-sky-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{doc.name}</p>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {doc.fileName || 'documento.pdf'} • {doc.fileSize || '1.2 MB'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleDocVerification(doc.id, !!doc.verified)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              doc.verified
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 ${doc.verified ? 'text-emerald-400' : 'text-slate-500'}`} />
                            {doc.verified ? 'Verificado' : 'Marcar Verificado'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500">
                      Nenhum arquivo digital anexado nesta candidatura.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer: Action Buttons */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={selectedCandidate.status === 'Matriculado'}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  Indeferir / Rejeitar
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleApprove}
                  disabled={selectedCandidate.status === 'Aprovada' || selectedCandidate.status === 'Matriculado'}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {selectedCandidate.status === 'Aprovada' ? 'Já Aprovada' : 'Aprovar Candidatura'}
                </button>

                <button
                  onClick={() => setShowConvertModal(true)}
                  disabled={selectedCandidate.status === 'Matriculado'}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <GraduationCap className="w-4 h-4" />
                  {selectedCandidate.status === 'Matriculado' ? 'Já Matriculado' : 'Converter em Aluno (Efetivar Matrícula)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Justification Modal */}
      {showRejectModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Indeferimento de Candidatura
            </h3>
            <p className="text-xs text-slate-400">
              Indique o motivo oficial pelo qual a candidatura de <strong className="text-white">{selectedCandidate.fullName}</strong> não foi aprovada.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Motivo Padrão</label>
              <select
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="Documentação ilegível ou incompleta">Documentação ilegível ou incompleta</option>
                <option value="Não cumpre o pré-requisito de escolaridade (10ª/12ª classe)">Não cumpre o pré-requisito de escolaridade (10ª/12ª classe)</option>
                <option value="Número limite de vagas para o curso esgotado">Número limite de vagas para o curso esgotado</option>
                <option value="Taxa de inscrição não identificada no prazo regulamentar">Taxa de inscrição não identificada no prazo regulamentar</option>
                <option value="Incompatibilidade de turno ou regime solicitado">Incompatibilidade de turno ou regime solicitado</option>
                <option value="Outro motivo justificado">Outro motivo justificado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Observação Adicional / Instrução para o Candidato</label>
              <textarea
                rows={2}
                value={rejectionCustomNotes}
                onChange={e => setRejectionCustomNotes(e.target.value)}
                placeholder="Ex: Solicitado reenvio do certificado legível até sexta-feira..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <XCircle className="w-4 h-4" />
                Confirmar Indeferimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Candidate to Student Modal */}
      {showConvertModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  Homologação de Matrícula
                </span>
                <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  Efetivar Matrícula de Candidato
                </h3>
              </div>
              <button
                onClick={() => setShowConvertModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="font-bold text-white text-xs">{selectedCandidate.fullName}</p>
              <p className="text-[11px] text-slate-400">
                Curso: <span className="text-emerald-400 font-medium">{selectedCandidate.courseName}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Candidatura #{selectedCandidate.code} • BI: {selectedCandidate.documentNumber}
              </p>
            </div>

            {/* Target Class Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Alocar na Turma Oficial <span className="text-rose-400">*</span>
              </label>
              <select
                value={targetClassId}
                onChange={e => setTargetClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {candidateClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.shift} - Sala {cls.room}) • {(cls as any).enrolledCount || 0}/{cls.capacity} vagas
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500">
                As turmas acima correspondem ao curso solicitado pelo candidato.
              </span>
            </div>

            {/* Target Regime Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Regime</label>
                <select
                  value={targetRegime}
                  onChange={e => setTargetRegime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Laboral">Laboral</option>
                  <option value="Pós-Laboral">Pós-Laboral</option>
                  <option value="Online">Online / EAD</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Status Inicial</label>
                <select
                  value={targetStudentStatus}
                  onChange={e => setTargetStudentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Matriculado">Matriculado</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inscrito">Inscrito</option>
                </select>
              </div>
            </div>

            {/* Checklist of what will be generated */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-200/90 space-y-1.5">
              <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Automações executadas no ato da conversão:
              </p>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Geração de Código de Aluno Oficial ({activeInstitution.prefixes?.studentPrefix || 'MTW-AL'}-2026-XXXX)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Migração automática de todos os documentos verificados para o dossiê do aluno</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Emissão de Recibo de Matrícula & Inscrição com QR Code SIVERC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Registro no Diário de Classe e Liberação de Acesso na Portaria</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConvert}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <GraduationCap className="w-4 h-4" />
                Confirmar Matrícula Oficial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Success Celebratory Modal */}
      {conversionSuccessResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-md p-6 space-y-5 text-center shadow-2xl shadow-emerald-500/20">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                Matrícula Efetivada com Sucesso
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                {conversionSuccessResult.studentName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Aluno matriculado e integrado no sistema acadêmico sob o código:
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 mt-3 font-mono text-lg font-bold text-emerald-400">
                {conversionSuccessResult.studentCode}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Alocado na: <strong className="text-white">{conversionSuccessResult.className}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setConversionSuccessResult(null);
                  navigate('alunos_list');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Users className="w-4 h-4" />
                Ir para Gestão de Alunos
              </button>
              <button
                onClick={() => setConversionSuccessResult(null)}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Continuar na Gestão de Candidatos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inscrever Candidato (Balcão / Presencial) */}
      {isAddCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Nova Inscrição Presencial</h2>
                  <p className="text-xs text-slate-400">Cadastro direto de candidato no balcão da secretaria</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddCandidateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCandidate} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Dados Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo *</label>
                    <input 
                      type="text"
                      required
                      value={candidateFormData.fullName}
                      onChange={e => setCandidateFormData({ ...candidateFormData, fullName: e.target.value })}
                      placeholder="Ex: Armindo Celso Mabunda"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Documento</label>
                    <select
                      value={candidateFormData.documentType}
                      onChange={e => setCandidateFormData({ ...candidateFormData, documentType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="BI">Bilhete de Identidade (BI)</option>
                      <option value="Passaporte">Passaporte</option>
                      <option value="DIRE">DIRE</option>
                      <option value="Cédula">Cédula Pessoal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Número do Documento *</label>
                    <input 
                      type="text"
                      required
                      value={candidateFormData.documentNumber}
                      onChange={e => setCandidateFormData({ ...candidateFormData, documentNumber: e.target.value })}
                      placeholder="Ex: 110100234567A"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Data de Nascimento</label>
                    <input 
                      type="date"
                      value={candidateFormData.birthDate}
                      onChange={e => setCandidateFormData({ ...candidateFormData, birthDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Gênero</label>
                    <select
                      value={candidateFormData.gender}
                      onChange={e => setCandidateFormData({ ...candidateFormData, gender: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pt-2">Contatos & Localização</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Telefone / WhatsApp *</label>
                    <input 
                      type="tel"
                      required
                      value={candidateFormData.phone}
                      onChange={e => setCandidateFormData({ ...candidateFormData, phone: e.target.value })}
                      placeholder="+258 84 123 4567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                    <input 
                      type="email"
                      value={candidateFormData.email}
                      onChange={e => setCandidateFormData({ ...candidateFormData, email: e.target.value })}
                      placeholder="candidato@email.mz"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Província</label>
                    <input 
                      type="text"
                      value={candidateFormData.province}
                      onChange={e => setCandidateFormData({ ...candidateFormData, province: e.target.value })}
                      placeholder="Ex: Maputo Cidade"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Bairro / Endereço</label>
                    <input 
                      type="text"
                      value={candidateFormData.address}
                      onChange={e => setCandidateFormData({ ...candidateFormData, address: e.target.value })}
                      placeholder="Ex: Polana Caniço B"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pt-2">Opção Acadêmica & Pagamento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Curso Pretendido</label>
                    <select
                      value={candidateFormData.courseId}
                      onChange={e => setCandidateFormData({ ...candidateFormData, courseId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name} ({course.category})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Regime de Estudos</label>
                    <select
                      value={candidateFormData.regime}
                      onChange={e => setCandidateFormData({ ...candidateFormData, regime: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Laboral">Laboral (Diurno)</option>
                      <option value="Pós-Laboral">Pós-Laboral (Noturno)</option>
                      <option value="Online">Online / EaD</option>
                      <option value="Sábado">Sábado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Turno</label>
                    <select
                      value={candidateFormData.shift}
                      onChange={e => setCandidateFormData({ ...candidateFormData, shift: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Taxa de Inscrição (MT)</label>
                    <input 
                      type="number"
                      value={candidateFormData.paymentAmount}
                      onChange={e => setCandidateFormData({ ...candidateFormData, paymentAmount: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Estado do Pagamento</label>
                    <select
                      value={candidateFormData.paymentStatus}
                      onChange={e => setCandidateFormData({ ...candidateFormData, paymentStatus: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Pago">Pago no Balcão</option>
                      <option value="Pendente">Pendente de Pagamento</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Observações da Secretaria</label>
                    <textarea 
                      rows={2}
                      value={candidateFormData.analysisNotes}
                      onChange={e => setCandidateFormData({ ...candidateFormData, analysisNotes: e.target.value })}
                      placeholder="Observações ou anotações sobre os documentos entregues..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCandidateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  Confirmar Inscrição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Candidato */}
      {candidateToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Editar Candidatura #{candidateToEdit.code}</h2>
                  <p className="text-xs text-slate-400">{candidateToEdit.fullName}</p>
                </div>
              </div>
              <button 
                onClick={() => setCandidateToEdit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCandidate} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Dados Cadastrais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo *</label>
                    <input 
                      type="text"
                      required
                      value={editFormData.fullName}
                      onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Documento</label>
                    <select
                      value={editFormData.documentType}
                      onChange={e => setEditFormData({ ...editFormData, documentType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="BI">Bilhete de Identidade (BI)</option>
                      <option value="Passaporte">Passaporte</option>
                      <option value="DIRE">DIRE</option>
                      <option value="Cédula">Cédula Pessoal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Número do Documento</label>
                    <input 
                      type="text"
                      value={editFormData.documentNumber}
                      onChange={e => setEditFormData({ ...editFormData, documentNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Telefone / WhatsApp</label>
                    <input 
                      type="tel"
                      value={editFormData.phone}
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                    <input 
                      type="email"
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider pt-2">Curso & Pagamento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Curso</label>
                    <select
                      value={editFormData.courseId}
                      onChange={e => {
                        const found = courses.find(c => c.id === e.target.value);
                        setEditFormData({ 
                          ...editFormData, 
                          courseId: e.target.value,
                          courseName: found?.name || editFormData.courseName 
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Regime</label>
                    <select
                      value={editFormData.regime}
                      onChange={e => setEditFormData({ ...editFormData, regime: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Laboral">Laboral</option>
                      <option value="Pós-Laboral">Pós-Laboral</option>
                      <option value="Online">Online</option>
                      <option value="Sábado">Sábado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Turno</label>
                    <input 
                      type="text"
                      value={editFormData.shift}
                      onChange={e => setEditFormData({ ...editFormData, shift: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Valor Taxa (MT)</label>
                    <input 
                      type="number"
                      value={editFormData.paymentAmount}
                      onChange={e => setEditFormData({ ...editFormData, paymentAmount: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Estado Pagamento</label>
                    <select
                      value={editFormData.paymentStatus}
                      onChange={e => setEditFormData({ ...editFormData, paymentStatus: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Pago">Pago</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Parecer / Anotações</label>
                    <textarea 
                      rows={2}
                      value={editFormData.analysisNotes}
                      onChange={e => setEditFormData({ ...editFormData, analysisNotes: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCandidateToEdit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 cursor-pointer shadow-md shadow-amber-400/20"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RecordDetailsModal - Ficha Completa do Candidato */}
      {viewingCandidateDetails && (
        <RecordDetailsModal
          isOpen={!!viewingCandidateDetails}
          onClose={() => setViewingCandidateDetails(null)}
          title={`Ficha de Inscrição #${viewingCandidateDetails.code}`}
          subtitle={viewingCandidateDetails.fullName}
          code={viewingCandidateDetails.code}
          statusBadge={
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              viewingCandidateDetails.status === 'Aprovada' || viewingCandidateDetails.status === 'Matriculado' ? 'bg-emerald-500/20 text-emerald-300' :
              viewingCandidateDetails.status === 'Rejeitada' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {viewingCandidateDetails.status}
            </span>
          }
          imageUrl={viewingCandidateDetails.photoUrl}
          fields={[
            { label: 'Código de Candidatura', value: viewingCandidateDetails.code },
            { label: 'Nome Completo', value: viewingCandidateDetails.fullName },
            { label: 'Tipo de Documento', value: viewingCandidateDetails.documentType },
            { label: 'Número de Documento', value: viewingCandidateDetails.documentNumber },
            { label: 'Data de Nascimento', value: viewingCandidateDetails.birthDate || 'Não informada' },
            { label: 'Gênero', value: viewingCandidateDetails.gender },
            { label: 'Telefone / WhatsApp', value: viewingCandidateDetails.phone },
            { label: 'Email', value: viewingCandidateDetails.email },
            { label: 'Província', value: viewingCandidateDetails.province || 'Maputo' },
            { label: 'Cidade', value: viewingCandidateDetails.city || 'Maputo' },
            { label: 'Endereço / Bairro', value: viewingCandidateDetails.address || 'Não especificado', fullWidth: true },
            { label: 'Encarregado de Educação', value: viewingCandidateDetails.guardianName || 'Não aplicável' },
            { label: 'Contato Encarregado', value: viewingCandidateDetails.guardianPhone || 'Não aplicável' },
            { label: 'Curso Pretendido', value: viewingCandidateDetails.courseName, fullWidth: true },
            { label: 'Regime de Estudos', value: viewingCandidateDetails.regime },
            { label: 'Turno', value: viewingCandidateDetails.shift || 'Não definido' },
            { label: 'Taxa de Inscrição', value: `${(viewingCandidateDetails.paymentAmount || 1500).toLocaleString()} MT` },
            { label: 'Estado do Pagamento', value: viewingCandidateDetails.paymentStatus },
            { label: 'Método de Pagamento', value: viewingCandidateDetails.paymentMethod || 'Dinheiro / Balcão' },
            { label: 'Data de Submissão', value: viewingCandidateDetails.createdAt },
            { label: 'Parecer da Secretaria', value: viewingCandidateDetails.analysisNotes || 'Pendente de parecer formal', fullWidth: true },
            { label: 'Motivo de Rejeição', value: viewingCandidateDetails.rejectionReason || 'Nenhum', fullWidth: true }
          ]}
          onEdit={() => {
            handleOpenEditCandidate(viewingCandidateDetails);
            setViewingCandidateDetails(null);
          }}
          onViewHistory={() => {
            setHistoryCandidate(viewingCandidateDetails);
            setViewingCandidateDetails(null);
          }}
        />
      )}

      {/* RecordHistoryModal - Histórico da Candidatura */}
      {historyCandidate && (
        <RecordHistoryModal
          isOpen={!!historyCandidate}
          onClose={() => setHistoryCandidate(null)}
          entityName="Candidato"
          entityId={historyCandidate.id}
          entityCode={historyCandidate.code}
          customEvents={[
            {
              id: 'evt-1',
              timestamp: `${historyCandidate.createdAt} 08:30`,
              date: historyCandidate.createdAt,
              time: '08:30',
              operatorName: 'Portal / Secretaria',
              action: 'Submissão de Candidatura',
              summary: `Inscrição inicial registrada para o curso ${historyCandidate.courseName} (${historyCandidate.regime}).`,
              severity: 'info'
            },
            {
              id: 'evt-2',
              timestamp: `${historyCandidate.createdAt} 08:35`,
              date: historyCandidate.createdAt,
              time: '08:35',
              operatorName: 'M-Pesa / Tesouraria',
              action: `Taxa de Inscrição - ${historyCandidate.paymentStatus}`,
              summary: `Valor de ${(historyCandidate.paymentAmount || 1500).toLocaleString()} MT (${historyCandidate.paymentMethod || 'Dinheiro/M-Pesa'}).`,
              severity: historyCandidate.paymentStatus === 'Pago' ? 'sucesso' : 'aviso'
            },
            ...(historyCandidate.analyzedAt ? [{
              id: 'evt-3',
              timestamp: `${historyCandidate.analyzedAt} 11:20`,
              date: historyCandidate.analyzedAt,
              time: '11:20',
              operatorName: 'Secretaria Acadêmica',
              action: `Parecer: ${historyCandidate.status}`,
              summary: historyCandidate.analysisNotes || historyCandidate.rejectionReason || 'Análise curricular realizada.',
              severity: (historyCandidate.status === 'Aprovada' || historyCandidate.status === 'Matriculado' ? 'sucesso' : historyCandidate.status === 'Rejeitada' ? 'critico' : 'info') as any
            }] : []),
            ...(historyCandidate.convertedStudentCode ? [{
              id: 'evt-4',
              timestamp: `${new Date().toISOString().split('T')[0]} 14:00`,
              date: new Date().toISOString().split('T')[0],
              time: '14:00',
              operatorName: 'Secretaria Acadêmica',
              action: 'Conversão em Aluno Oficial',
              summary: `Matrícula acadêmica concluída. Código de estudante gerado: ${historyCandidate.convertedStudentCode}.`,
              severity: 'sucesso' as any
            }] : [])
          ]}
        />
      )}

      {/* ConfirmationModal - Excluir Candidatura */}
      {candidateToDelete && (
        <ConfirmationModal
          isOpen={!!candidateToDelete}
          onCancel={() => setCandidateToDelete(null)}
          onConfirm={() => {
            deleteApplication(candidateToDelete.id);
            success('Candidatura Excluída', `O processo de candidatura #${candidateToDelete.code} de ${candidateToDelete.fullName} foi removido.`);
            setCandidateToDelete(null);
            if (selectedCandidate?.id === candidateToDelete.id) {
              setSelectedCandidate(null);
            }
          }}
          title="Excluir Processo de Candidatura"
          message={`Tem certeza que deseja excluir permanentemente o processo de inscrição #${candidateToDelete.code} do candidato ${candidateToDelete.fullName}? Esta ação não pode ser desfeita.`}
          confirmText="Excluir Candidatura"
          cancelText="Cancelar"
          variant="danger"
        />
      )}
    </div>
  );
};
