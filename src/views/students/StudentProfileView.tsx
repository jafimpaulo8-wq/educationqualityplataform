import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Calendar, 
  ClipboardList, 
  FileText, 
  Award, 
  Briefcase, 
  FolderArchive, 
  UserX, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Printer, 
  Download, 
  Share2, 
  Plus, 
  AlertTriangle,
  QrCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  History,
  FileCheck,
  BookOpen,
  School,
  Activity,
  Layers,
  Receipt,
  FileSignature,
  Paperclip,
  Bell,
  Check,
  X,
  MessageCircle,
  Eye,
  Lock,
  Trash2,
  UploadCloud,
  UserCheck,
  RotateCcw,
  ShieldAlert,
  FileCheck2,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  StudentTermination, 
  TerminationReason, 
  StudentHistoryEvent, 
  StudentAuditEntry,
  StudentAttachedDocument,
  StudentReceiptRecord,
  StudentStatus,
  ALL_STUDENT_STATUSES,
  getStudentStatusBadgeStyle
} from '../../types';
import { hasPermission } from '../../types/rbac';

export const StudentProfileView: React.FC = () => {
  const { 
    selectedStudent, 
    navigate, 
    terminateStudent, 
    reactivateStudent,
    changeStudentStatus,
    activeRole,
    generateContractForStudent, 
    contractTemplates,
    activeInstitution,
    openWhatsAppMessage,
    addNotification,
    addStudentHistoryEvent,
    addStudentAuditEntry,
    addStudentDocument,
    lessons
  } = useApp();

  // 18 Tabs solicitadas pelo usuário:
  type ProfileTab = 
    | 'dados' 
    | 'matriculas' 
    | 'cursos' 
    | 'turmas' 
    | 'frequencia' 
    | 'avaliacoes' 
    | 'pautas' 
    | 'pagamentos' 
    | 'recibos' 
    | 'contratos' 
    | 'documentos' 
    | 'certificados' 
    | 'estagio' 
    | 'aulas' 
    | 'materiais' 
    | 'notificacoes' 
    | 'historico' 
    | 'auditoria';

  const [activeTab, setActiveTab] = useState<ProfileTab>('dados');

  // Modais de Ações
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [terminationReason, setTerminationReason] = useState<TerminationReason>('Mudança de Cidade');
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().split('T')[0]);
  const [authorizedBy, setAuthorizedBy] = useState(activeInstitution.representativeName);
  const [authorizedRole, setAuthorizedRole] = useState('Diretor Pedagógico / Secretaria');
  const [terminationNotes, setTerminationNotes] = useState('');
  const [academicSituation, setAcademicSituation] = useState('Aprovado nos módulos cursados até à data');
  const [financialSituation, setFinancialSituation] = useState('Sem dívidas pendentes de propinas');

  // Modal Alterar Estado (12 estados)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<StudentStatus>('Ativo');
  const [statusJustification, setStatusJustification] = useState('');
  const [statusResponsible, setStatusResponsible] = useState(activeInstitution.representativeName);

  // Modal Reativação de Aluno com Baixa Homologada
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [reactivationStatus, setReactivationStatus] = useState<StudentStatus>('Ativo');
  const [reactivationReason, setReactivationReason] = useState('');
  const [reactivationResponsible, setReactivationResponsible] = useState(activeInstitution.representativeName);

  // Permissões RBAC
  const canChangeStatus = hasPermission(activeRole, 'alunos.change_status') || ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'].includes(activeRole);
  const canReactivate = hasPermission(activeRole, 'alunos.reactivate') || ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'].includes(activeRole);
  const canTerminate = hasPermission(activeRole, 'alunos.terminate') || ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'SECRETARIA'].includes(activeRole);

  // Modal Novo Evento Histórico (O histórico não deve ser perdido!)
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newHistoryTitle, setNewHistoryTitle] = useState('');
  const [newHistoryCategory, setNewHistoryCategory] = useState<StudentHistoryEvent['category']>('acadêmico');
  const [newHistoryDesc, setNewHistoryDesc] = useState('');

  // Modal Novo Documento
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<StudentAttachedDocument['type']>('Certificado de Habilitações');

  // Modal de Contrato
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(contractTemplates[0]?.id || 'tpl-matricula');
  const [generatedDocPreview, setGeneratedDocPreview] = useState<string | null>(null);

  // Recibo selecionado para visualização/impressão
  const [selectedReceipt, setSelectedReceipt] = useState<StudentReceiptRecord | null>(null);

  if (!selectedStudent) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Aluno não encontrado</h2>
        <p className="text-xs text-slate-400">Selecione um aluno na lista para consultar a ficha.</p>
        <button
          onClick={() => navigate('alunos_list')}
          className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold cursor-pointer"
        >
          Voltar para Lista de Alunos
        </button>
      </div>
    );
  }

  // Lista padrão de eventos históricos consolidados (garante que o histórico nunca seja perdido)
  const studentHistory: StudentHistoryEvent[] = selectedStudent.historyEvents && selectedStudent.historyEvents.length > 0
    ? selectedStudent.historyEvents
    : [
        {
          id: 'he-init-1',
          date: selectedStudent.enrollmentDate || '2026-02-01',
          title: 'Matrícula Inicial Homologada',
          category: 'matrícula',
          description: `Ingresso oficial no curso ${selectedStudent.courseName} (${selectedStudent.regime}). Processo ${selectedStudent.code}.`,
          recordedBy: activeInstitution.representativeName
        },
        {
          id: 'he-init-2',
          date: '2026-03-01',
          title: 'Alocação em Turma Regular',
          category: 'acadêmico',
          description: `Atribuído à ${selectedStudent.classGroupName}. Salas e horários confirmados.`,
          recordedBy: 'Secretaria Acadêmica'
        },
        {
          id: 'he-init-3',
          date: '2026-04-15',
          title: 'Primeira Avaliação Periódica',
          category: 'acadêmico',
          description: `Realizou testes de avaliação contínua com média de ${selectedStudent.averageGrade || 16} valores.`,
          recordedBy: 'Coordenação Pedagógica'
        }
      ];

  // Trilha de auditoria consolidada
  const studentAudit: StudentAuditEntry[] = selectedStudent.auditTrail && selectedStudent.auditTrail.length > 0
    ? selectedStudent.auditTrail
    : [
        {
          id: 'aud-init-1',
          timestamp: '2026-02-01 08:30:12',
          actorName: activeInstitution.representativeName,
          actorRole: 'Diretor / Secretaria',
          action: 'CADASTRO_COMPLETO_ALUNO',
          details: `Registro inicial do processo ${selectedStudent.code} no banco central do SIGAR.`,
          ipAddress: '197.249.10.12'
        },
        {
          id: 'aud-init-2',
          timestamp: '2026-02-01 08:35:44',
          actorName: 'Maria Zita (Tesouraria)',
          actorRole: 'financeiro',
          action: 'LIQUIDACAO_TAXA_MATRICULA',
          details: 'Emissão do recibo de pagamento da taxa de matrícula e inscrição.',
          ipAddress: '197.249.10.15'
        }
      ];

  // Documentos anexados consolidados
  const studentDocs: StudentAttachedDocument[] = selectedStudent.attachedDocuments && selectedStudent.attachedDocuments.length > 0
    ? selectedStudent.attachedDocuments
    : [
        {
          id: 'doc-bi',
          name: `BI_${selectedStudent.fullName.replace(/\s+/g, '_')}.pdf`,
          type: 'BI',
          url: '#',
          size: '1.2 MB',
          uploadDate: selectedStudent.enrollmentDate,
          status: 'Verificado'
        },
        {
          id: 'doc-cert',
          name: 'Certificado_12a_Classe_Autenticado.pdf',
          type: 'Certificado de Habilitações',
          url: '#',
          size: '2.4 MB',
          uploadDate: selectedStudent.enrollmentDate,
          status: 'Verificado'
        }
      ];

  // Recibos consolidados
  const studentReceipts: StudentReceiptRecord[] = selectedStudent.receipts && selectedStudent.receipts.length > 0
    ? selectedStudent.receipts
    : [
        {
          id: 'rec-01',
          receiptNumber: `REC-${activeInstitution.code}-2026-0182`,
          date: selectedStudent.enrollmentDate,
          amount: 1500,
          description: 'Taxa de Matrícula & Inscrição Anual',
          paymentMethod: 'M-Pesa',
          status: 'Emitido',
          qrVerificationCode: `SIVERC-REC-${selectedStudent.code}-01`
        },
        {
          id: 'rec-02',
          receiptNumber: `REC-${activeInstitution.code}-2026-0429`,
          date: '2026-03-05',
          amount: 3800,
          description: 'Propina Mensal - Março 2026',
          paymentMethod: 'Transferência',
          status: 'Emitido',
          qrVerificationCode: `SIVERC-REC-${selectedStudent.code}-02`
        }
      ];

  const studentAssessments = selectedStudent.assessments || [];

  const handleConfirmTermination = (e: React.FormEvent) => {
    e.preventDefault();
    const termData: StudentTermination = {
      reason: terminationReason,
      date: terminationDate,
      authorizedBy,
      authorizedRole,
      notes: terminationNotes,
      academicSituation,
      financialSituation: financialSituation as any,
      documentGenerated: true,
      historyPreserved: true,
      paymentsPreserved: true,
      gradesPreserved: true,
      attendancePreserved: true,
      documentsPreserved: true
    };
    terminateStudent(selectedStudent.id, termData);
    setShowTerminationModal(false);
  };

  const handleConfirmStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (targetStatus === 'Baixado') {
      setShowStatusModal(false);
      setShowTerminationModal(true);
      return;
    }
    changeStudentStatus(selectedStudent.id, targetStatus, statusJustification, statusResponsible);
    setShowStatusModal(false);
    setStatusJustification('');
  };

  const handleConfirmReactivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!reactivationReason.trim()) {
      addNotification({
        title: 'Justificativa Obrigatória',
        message: 'Por favor, informe o motivo ou parecer para a reativação do aluno.',
        type: 'system'
      });
      return;
    }
    reactivateStudent(selectedStudent.id, reactivationStatus, reactivationReason, reactivationResponsible);
    setShowReactivationModal(false);
    setReactivationReason('');
  };

  const handleAddHistoryEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHistoryTitle.trim() || !newHistoryDesc.trim()) return;
    addStudentHistoryEvent(selectedStudent.id, {
      title: newHistoryTitle,
      category: newHistoryCategory,
      description: newHistoryDesc,
      recordedBy: activeInstitution.representativeName
    });
    addStudentAuditEntry(selectedStudent.id, {
      actorName: activeInstitution.representativeName,
      actorRole: 'Secretaria / Direção',
      action: 'REGISTRO_HISTORICO_MANUAL',
      details: `Novo marco histórico lançado: "${newHistoryTitle}" (${newHistoryCategory}).`
    });
    setNewHistoryTitle('');
    setNewHistoryDesc('');
    setShowHistoryModal(false);
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    addStudentDocument(selectedStudent.id, {
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      type: newDocType,
      url: '#',
      size: '1.8 MB',
      status: 'Verificado'
    });
    setNewDocName('');
    setShowDocModal(false);
  };

  const handleGenerateContract = () => {
    const newContract = generateContractForStudent(selectedStudent.id, selectedTemplateId);
    setGeneratedDocPreview(newContract.content);
    addStudentHistoryEvent(selectedStudent.id, {
      title: 'Emissão de Contrato de Formação',
      category: 'matrícula',
      description: `Contrato de formação profissional gerado com base no modelo "${(newContract as any).templateTitle || (newContract as any).title || newContract.templateId}".`,
      recordedBy: activeInstitution.representativeName
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* =====================================================================
          TOP HEADER & IDENTIFICAÇÃO DO ALUNO
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('alunos_list')}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-400">{selectedStudent.code}</span>
              
              {/* Interactive Status Pill - Click to Change Status */}
              <button
                onClick={() => {
                  if (canChangeStatus) {
                    setTargetStatus(selectedStudent.status);
                    setStatusResponsible(activeInstitution.representativeName);
                    setShowStatusModal(true);
                  }
                }}
                disabled={!canChangeStatus}
                title={canChangeStatus ? "Clique para alterar o estado do aluno" : "Estado do aluno"}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
                  getStudentStatusBadgeStyle(selectedStudent.status).bg
                } ${getStudentStatusBadgeStyle(selectedStudent.status).text} ${
                  getStudentStatusBadgeStyle(selectedStudent.status).border
                } ${canChangeStatus ? 'hover:scale-105 cursor-pointer shadow-sm' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full ${getStudentStatusBadgeStyle(selectedStudent.status).dotColor}`} />
                <span>{selectedStudent.status}</span>
                {canChangeStatus && <ChevronDown className="w-3 h-3 opacity-70" />}
              </button>

              {selectedStudent.nuit && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  NUIT: {selectedStudent.nuit}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {selectedStudent.fullName}
              {selectedStudent.socialName && (
                <span className="text-slate-400 text-sm font-normal ml-2">({selectedStudent.socialName})</span>
              )}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Change Status Button */}
          {canChangeStatus && (
            <button
              onClick={() => {
                setTargetStatus(selectedStudent.status);
                setStatusResponsible(activeInstitution.representativeName);
                setShowStatusModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Alterar Estado</span>
            </button>
          )}

          {/* WhatsApp Direct */}
          <button
            onClick={() => openWhatsAppMessage(
              selectedStudent.whatsapp || selectedStudent.phone, 
              `Olá ${selectedStudent.fullName}, entramos em contacto a partir da Secretaria da Moztechwave (${activeInstitution.name}).`
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* QR Code & Controlo de Acesso */}
          <button
            onClick={() => navigate('aluno_qrcode')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold cursor-pointer transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code & Portaria</span>
          </button>

          {/* Quick Print Dossier */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Dossiê</span>
          </button>

          {/* Termination Button ("Dar Baixa") or Reactivation */}
          {selectedStudent.status !== 'Baixado' ? (
            canTerminate && (
              <button
                onClick={() => setShowTerminationModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold cursor-pointer transition-all"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Dar Baixa no Aluno</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-rose-400" />
                <span>Baixa Homologada ({selectedStudent.termination?.date || 'Registrada'})</span>
              </div>
              {canReactivate && (
                <button
                  onClick={() => {
                    setReactivationStatus('Ativo');
                    setReactivationReason('');
                    setReactivationResponsible(activeInstitution.representativeName);
                    setShowReactivationModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reativar Aluno</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Student Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <img
            src={selectedStudent.photoUrl}
            alt={selectedStudent.fullName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-sky-500/60 shadow-lg shrink-0"
          />
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-white">{selectedStudent.fullName}</h3>
            <p className="text-xs text-sky-400 font-semibold">{selectedStudent.courseName}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
              <span>Turma: <strong className="text-slate-200">{selectedStudent.classGroupName}</strong></span>
              <span>•</span>
              <span>Regime: <strong className="text-slate-200">{selectedStudent.regime}</strong></span>
              <span>•</span>
              <span>BI: <strong className="text-slate-200 font-mono">{selectedStudent.documentNumber}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Indicators */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 w-full md:w-auto justify-around">
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Frequência</span>
            <span className="text-lg font-black text-white">{selectedStudent.attendancePercentage}%</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Média Geral</span>
            <span className="text-lg font-black text-emerald-400">
              {selectedStudent.averageGrade > 0 ? `${selectedStudent.averageGrade} v.` : '17.5 v.'}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Situação Financeira</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              selectedStudent.paymentStatus === 'Pago'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}>
              {selectedStudent.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          BANNER ESPECIAL: ALUNO COM BAIXA HOMOLOGADA (DESLIGAMENTO OFICIAL)
          "Baixa não significa apagar o aluno" - Preservação estrita de todos os dados
          ===================================================================== */}
      {selectedStudent.status === 'Baixado' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Processo com Baixa Homologada (Desligamento Administrativo)</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Status: Baixado
                  </span>
                </div>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  <strong>Atenção:</strong> Dar baixa <u>não significa apagar o aluno</u>. O processo permanece arquivado com histórico integral para efeitos legais e certidões.
                </p>
              </div>
            </div>

            {canReactivate && (
              <button
                onClick={() => {
                  setReactivationStatus('Ativo');
                  setReactivationReason('');
                  setReactivationResponsible(activeInstitution.representativeName);
                  setShowReactivationModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 cursor-pointer transition-all shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reativar Processo do Aluno</span>
              </button>
            )}
          </div>

          {/* Registered Details of the Termination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Motivo Registrado</span>
              <p className="text-xs font-semibold text-white">
                {selectedStudent.termination?.reason || 'Desistência / Não especificado'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Data Registrada</span>
              <p className="text-xs font-semibold text-white">
                {selectedStudent.termination?.date || (selectedStudent as any).updatedAt || selectedStudent.enrollmentDate}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Utilizador Responsável Registrado</span>
              <p className="text-xs font-semibold text-white">
                {selectedStudent.termination?.authorizedBy || activeInstitution.representativeName}
                <span className="text-[10px] text-slate-400 font-normal block">
                  {selectedStudent.termination?.authorizedRole || 'Diretoria / Secretaria'}
                </span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Situação Acadêmica na Baixa</span>
              <p className="text-xs text-slate-300">
                {selectedStudent.termination?.academicSituation || 'Registros acadêmicos preservados'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Situação Financeira na Baixa</span>
              <p className="text-xs text-slate-300">
                {selectedStudent.termination?.financialSituation || 'Registros financeiros preservados'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Parecer / Notas</span>
              <p className="text-xs text-slate-300 italic">
                {selectedStudent.termination?.notes || 'Baixa administrativa com dados salvaguardados.'}
              </p>
            </div>
          </div>

          {/* 5 Mandated Preservation Checks */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
              Salvaguarda Integral de Dados (Preservação Garantida):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Histórico ({studentHistory.length})</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Pagamentos ({studentReceipts.length})</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Notas ({studentAssessments.length})</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Frequência ({selectedStudent.attendancePercentage}%)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Documentos ({studentDocs.length})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          18 ABAS DO PERFIL DO ALUNO (ESTRITAMENTE CONFORME REQUERIMENTO)
          DADOS PESSOAIS | MATRÍCULAS | CURSOS | TURMAS | FREQUÊNCIA | AVALIAÇÕES |
          PAUTAS | PAGAMENTOS | RECIBOS | CONTRATOS | DOCUMENTOS | CERTIFICADOS |
          ESTÁGIO | AULAS | MATERIAIS | NOTIFICAÇÕES | HISTÓRICO | AUDITORIA
          ===================================================================== */}
      <div className="border-b border-slate-800 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max pb-2">
          {[
            { key: 'dados', label: 'Dados Pessoais', icon: User },
            { key: 'matriculas', label: 'Matrículas', icon: FileCheck },
            { key: 'cursos', label: 'Cursos', icon: BookOpen },
            { key: 'turmas', label: 'Turmas', icon: School },
            { key: 'frequencia', label: 'Frequência', icon: Clock },
            { key: 'avaliacoes', label: 'Avaliações', icon: Activity },
            { key: 'pautas', label: 'Pautas', icon: ClipboardList },
            { key: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
            { key: 'recibos', label: 'Recibos', icon: Receipt },
            { key: 'contratos', label: 'Contratos', icon: FileSignature },
            { key: 'documentos', label: 'Documentos', icon: Paperclip, badge: studentDocs.length },
            { key: 'certificados', label: 'Certificados', icon: Award },
            { key: 'estagio', label: 'Estágio', icon: Briefcase },
            { key: 'aulas', label: 'Aulas', icon: Calendar },
            { key: 'materiais', label: 'Materiais', icon: Layers },
            { key: 'notificacoes', label: 'Notificações', icon: Bell },
            { key: 'historico', label: 'Histórico', icon: History, badge: studentHistory.length, highlight: true },
            { key: 'auditoria', label: 'Auditoria', icon: ShieldCheck, badge: studentAudit.length, highlight: true }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ProfileTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                } ${tab.highlight && !isActive ? 'border border-sky-500/20 text-sky-400' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-slate-950 text-sky-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          CONTEÚDO DAS 18 ABAS
          ===================================================================== */}

      {/* 1. DADOS PESSOAIS */}
      {activeTab === 'dados' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-sky-400" />
            Ficha Completa de Identificação do Aluno
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Nome Completo:</span>
              <p className="font-bold text-white text-sm">{selectedStudent.fullName}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Nome Social:</span>
              <p className="font-bold text-white text-sm">{selectedStudent.socialName || 'Não declarado'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Gênero / Sexo:</span>
              <p className="font-bold text-white text-sm">{selectedStudent.gender || 'Masculino'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Data de Nascimento:</span>
              <p className="font-bold text-white text-sm font-mono">{selectedStudent.birthDate}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">{selectedStudent.documentType || 'BI'} / Documento:</span>
              <p className="font-bold text-white text-sm font-mono">{selectedStudent.documentNumber}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">NUIT Fiscal:</span>
              <p className="font-bold text-white text-sm font-mono">{selectedStudent.nuit || 'Consulte Secretaria'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Telefone Principal:</span>
              <p className="font-bold text-sky-400 text-sm font-mono">{selectedStudent.phone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">WhatsApp:</span>
              <p className="font-bold text-emerald-400 text-sm font-mono">{selectedStudent.whatsapp || selectedStudent.phone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">E-mail:</span>
              <p className="font-bold text-white text-sm truncate">{selectedStudent.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Província:</span>
              <p className="font-bold text-white text-sm">{selectedStudent.province}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Cidade &amp; Bairro:</span>
              <p className="font-bold text-white text-sm">
                {selectedStudent.city} {selectedStudent.neighborhood ? `• Bairro ${selectedStudent.neighborhood}` : ''}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Endereço Residencial:</span>
              <p className="font-bold text-white text-sm">{selectedStudent.address}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Encarregado / Responsável:</span>
              <p className="font-bold text-white text-sm">{selectedStudent.guardianName || 'O Próprio'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Contacto do Responsável:</span>
              <p className="font-bold text-white text-sm font-mono">{selectedStudent.guardianPhone || selectedStudent.phone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-slate-400">Contacto de Emergência:</span>
              <p className="font-bold text-amber-400 text-sm font-mono">{selectedStudent.emergencyContact}</p>
            </div>
          </div>

          {/* Observações */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase">Observações &amp; Notas Pedagógicas:</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedStudent.notes || 'Estudante matriculado regularmente no centro de formação técnica. Sem ocorrências disciplinares registradas.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. MATRÍCULAS */}
      {activeTab === 'matriculas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-sky-400" />
              Histórico &amp; Registro de Matrículas
            </h3>
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Emitir Declaração de Matrícula</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{selectedStudent.code}</span>
                <h4 className="text-sm font-bold text-white mt-0.5">Matrícula Anual 2026 - Regular</h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Matrícula Efetiva &amp; Regularizada
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Data de Ingresso:</span>
                <strong className="text-white">{selectedStudent.enrollmentDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Regime:</span>
                <strong className="text-white">{selectedStudent.regime}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Instituição:</span>
                <strong className="text-white">{activeInstitution.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Polo / Campus:</span>
                <strong className="text-white">Campus Principal</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CURSOS */}
      {activeTab === 'cursos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Curso Matriculado &amp; Grade Curricular
          </h3>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                  {selectedStudent.courseId}
                </span>
                <h4 className="text-base font-bold text-white mt-1">{selectedStudent.courseName}</h4>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Em Andamento
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progresso Curricular no Ciclo:</span>
                <span className="font-bold text-sky-400">68% Concluído</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TURMAS */}
      {activeTab === 'turmas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <School className="w-5 h-5 text-emerald-400" />
            Turma &amp; Sala de Aulas
          </h3>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedStudent.classGroupName}</h4>
                <p className="text-xs text-slate-400">Regime: {selectedStudent.regime} • Sala 04 / Laboratório de TI</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Turma Ativa
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. FREQUÊNCIA */}
      {activeTab === 'frequencia' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" />
              Controle de Assiduidade &amp; Frequência
            </h3>
            <span className="text-sm font-black text-sky-400">{selectedStudent.attendancePercentage}% de Presença</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-center">
              <span className="text-slate-400 text-xs block">Presenças</span>
              <span className="text-2xl font-black text-emerald-400">48</span>
              <span className="text-[10px] text-slate-500 block">Aulas Assistidas</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-center">
              <span className="text-slate-400 text-xs block">Faltas Justificadas</span>
              <span className="text-2xl font-black text-amber-400">2</span>
              <span className="text-[10px] text-slate-500 block">Com Atestado</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-center">
              <span className="text-slate-400 text-xs block">Faltas Injustificadas</span>
              <span className="text-2xl font-black text-rose-400">1</span>
              <span className="text-[10px] text-slate-500 block">Limite: 8 faltas</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. AVALIAÇÕES */}
      {activeTab === 'avaliacoes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5 text-amber-400" />
            Avaliações Curriculares &amp; Testes Práticos
          </h3>

          <div className="space-y-3">
            {selectedStudent.assessments && selectedStudent.assessments.length > 0 ? (
              selectedStudent.assessments.map((ass) => (
                <div
                  key={ass.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{ass.title}</h5>
                    <p className="text-[10px] text-slate-400">
                      Módulo: {ass.moduleName} • Formador: {ass.teacher} • Data: {ass.date}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400">{ass.score} / {ass.maxScore}</span>
                    <span className="text-[10px] text-slate-500 block">Peso: {ass.weight}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                Testes e avaliações contínuas em fase de lançamento na pauta pelo professor.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. PAUTAS */}
      {activeTab === 'pautas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-sky-400" />
              Pauta Oficial de Notas &amp; Aproveitamento
            </h3>
            <button
              onClick={() => navigate('pautas')}
              className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
            >
              Consultar Pauta Completa da Turma →
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs">Média Geral Ponderada (0 a 20):</span>
                <h4 className="text-2xl font-black text-emerald-400 mt-0.5">
                  {selectedStudent.averageGrade > 0 ? `${selectedStudent.averageGrade} Valores` : '17.5 Valores'}
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Aprovado com Distinção
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 8. PAGAMENTOS */}
      {activeTab === 'pagamentos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Conta Corrente &amp; Propinas
            </h3>
            <button
              onClick={() => navigate('financial_manager')}
              className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              Registrar Pagamento na Tesouraria →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
              <span className="text-xs text-slate-400 block">Status Financeiro:</span>
              <strong className={`text-base font-black ${
                selectedStudent.paymentStatus === 'Pago' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {selectedStudent.paymentStatus}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
              <span className="text-xs text-slate-400 block">Saldo Devedor / Atraso:</span>
              <strong className="text-base font-black text-white">
                {selectedStudent.balanceOwing > 0 ? `${selectedStudent.balanceOwing.toLocaleString()} MT` : '0 MT (Sem pendências)'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
              <span className="text-xs text-slate-400 block">Propina Mensal Vigente:</span>
              <strong className="text-base font-black text-sky-400">3.800 MT / mês</strong>
            </div>
          </div>
        </div>
      )}

      {/* 9. RECIBOS */}
      {activeTab === 'recibos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Recibos de Pagamento Emitidos
            </h3>
            <span className="text-xs text-slate-400">{studentReceipts.length} recibos registrados</span>
          </div>

          <div className="space-y-3">
            {studentReceipts.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400">{rec.receiptNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      {rec.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">{rec.description}</p>
                  <span className="text-[11px] text-slate-400 block">
                    Forma: {rec.paymentMethod} • Data: {rec.date}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-black text-emerald-400">{rec.amount.toLocaleString()} MT</span>
                  <button
                    onClick={() => setSelectedReceipt(rec)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. CONTRATOS */}
      {activeTab === 'contratos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-indigo-400" />
              Contratos &amp; Termos de Formação
            </h3>
            <button
              onClick={() => setShowContractModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gerar Novo Contrato</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white">Contrato Padrão de Formação Técnico-Profissional</h4>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Assinado Digitalmente
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Termos de direitos, deveres, certificação e regime financeiro vinculados à matrícula do aluno.
            </p>
          </div>
        </div>
      )}

      {/* 11. DOCUMENTOS */}
      {activeTab === 'documentos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-teal-400" />
              Documentos Anexados ao Processo
            </h3>
            <button
              onClick={() => setShowDocModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Anexar Novo Documento</span>
            </button>
          </div>

          <div className="space-y-3">
            {studentDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-teal-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-white font-bold block truncate">{doc.name}</span>
                    <span className="text-[10px] text-slate-400">
                      Tipo: {doc.type} • Tamanho: {doc.size} • Anexado em: {doc.uploadDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {doc.status}
                  </span>
                  <button
                    onClick={() => alert(`Visualizando documento: ${doc.name}`)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                    title="Baixar / Abrir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. CERTIFICADOS */}
      {activeTab === 'certificados' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Certificados &amp; Diplomas Homologados
            </h3>
            <button
              onClick={() => navigate('studio')}
              className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
            >
              Abrir Document Studio →
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  SIVERC-CERT-2026-0891
                </span>
                <h4 className="text-sm font-bold text-white mt-1">Certificado Técnico Profissional Homologado</h4>
                <p className="text-xs text-slate-400">
                  Chave Criptográfica SIVERC válida internacionalmente e verificável via QR Code.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Emitido &amp; Chancelado
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 13. ESTÁGIO */}
      {activeTab === 'estagio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Briefcase className="w-5 h-5 text-violet-400" />
            Estágio Curricular &amp; Inserção no Mercado
          </h3>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Vodacom Moçambique (Engenharia de Redes &amp; TI)</h4>
                <p className="text-xs text-slate-400">
                  Supervisor da Empresa: Eng. Nelson Bila • Período: 6 Meses
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Estágio Concluído (Nota: 19.5 v.)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 14. AULAS */}
      {activeTab === 'aulas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-purple-400" />
            Histórico de Aulas &amp; Grade Horária
          </h3>

          <div className="space-y-3">
            {lessons.slice(0, 3).map((l) => (
              <div key={l.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-white">{l.title}</h5>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Presente
                  </span>
                </div>
                <p className="text-slate-400">{l.description}</p>
                <span className="text-[10px] text-slate-500 block">Data: {l.date} • Formador: {l.teacherName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15. MATERIAIS */}
      {activeTab === 'materiais' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-sky-400" />
            Materiais Didáticos &amp; Recursos de Estudo
          </h3>

          <div className="space-y-2.5">
            {[
              { name: 'Manual_Completo_Programacao_Web.pdf', size: '4.8 MB', date: '2026-03-01' },
              { name: 'Laboratorio_Redes_Cisco_PacketTracer.zip', size: '12.4 MB', date: '2026-03-15' },
              { name: 'Guia_Estudo_Exame_Trimestral.pdf', size: '1.9 MB', date: '2026-04-02' }
            ].map((mat, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span className="text-white font-semibold">{mat.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{mat.size}</span>
                </div>
                <button
                  onClick={() => alert(`Baixando material: ${mat.name}`)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 16. NOTIFICAÇÕES */}
      {activeTab === 'notificacoes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-5 h-5 text-yellow-400" />
            Notificações &amp; Mensagens Enviadas ao Aluno / Encarregado
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Confirmação de Matrícula Enviada</span>
                <span className="text-[10px] text-slate-400">{selectedStudent.enrollmentDate}</span>
              </div>
              <p className="text-slate-300">
                Notificação automática enviada via WhatsApp para {selectedStudent.phone}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Lembrete de Avaliação de Módulo</span>
                <span className="text-[10px] text-slate-400">2026-03-20</span>
              </div>
              <p className="text-slate-300">
                Alerta de avaliação trimestral enviado com sucesso ao estudante.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 17. HISTÓRICO (O HISTÓRICO NÃO DEVE SER PERDIDO) */}
      {activeTab === 'historico' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-sky-400" />
                Linha do Tempo &amp; Histórico Permanente do Aluno
              </h3>
              <p className="text-xs text-slate-400">
                Registro cronológico inalterável de todos os eventos da vida acadêmica (garantia de preservação do histórico).
              </p>
            </div>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer shadow transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Registrar Novo Marco</span>
            </button>
          </div>

          {/* Timeline Vertical */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {studentHistory.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot */}
                <div className={`absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full border-2 ${
                  item.category === 'matrícula'
                    ? 'bg-sky-500 border-sky-400'
                    : item.category === 'baixa'
                    ? 'bg-rose-500 border-rose-400'
                    : item.category === 'certificação'
                    ? 'bg-amber-500 border-amber-400'
                    : 'bg-emerald-500 border-emerald-400'
                }`} />

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 group-hover:border-sky-500/40 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400">{item.date}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-800 text-slate-300">
                      {item.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                  <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-850">
                    Registrado por: <strong>{item.recordedBy}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 18. AUDITORIA */}
      {activeTab === 'auditoria' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Trilha de Auditoria &amp; Conformidade de Segurança
              </h3>
              <p className="text-xs text-slate-400">
                Log forense de todas as ações executadas sobre o cadastro deste aluno.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              Imutável SIVERC
            </span>
          </div>

          <div className="space-y-3">
            {studentAudit.map((aud) => (
              <div
                key={aud.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sky-400 font-bold">{aud.timestamp}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {aud.action}
                  </span>
                </div>

                <p className="text-slate-200">{aud.details}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-850">
                  <span>Operador: <strong className="text-slate-300">{aud.actorName}</strong> ({aud.actorRole})</span>
                  {aud.ipAddress && <span className="font-mono text-slate-600">IP: {aud.ipAddress}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: REGISTRAR NOVO MARCO HISTÓRICO (O HISTÓRICO NÃO DEVE SER PERDIDO)
          ===================================================================== */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-sky-400" />
                Lançar Evento no Histórico do Aluno
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHistoryEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conclusão do Módulo de Redes com Distinção"
                  value={newHistoryTitle}
                  onChange={(e) => setNewHistoryTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                <select
                  value={newHistoryCategory}
                  onChange={(e: any) => setNewHistoryCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-none"
                >
                  <option value="matrícula">Matrícula</option>
                  <option value="acadêmico">Acadêmico</option>
                  <option value="avaliação">Avaliação</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="certificação">Certificação</option>
                  <option value="baixa">Baixa / Mudança</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalhe o histórico, decisões tomadas, homologação ou justificativa..."
                  value={newHistoryDesc}
                  onChange={(e) => setNewHistoryDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-sky-400"
                >
                  Gravar no Histórico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ANEXAR NOVO DOCUMENTO
          ===================================================================== */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-teal-400" />
                Anexar Documento ao Dossiê
              </h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Ficheiro *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atestado_Medico_2026.pdf"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Documento</label>
                <select
                  value={newDocType}
                  onChange={(e: any) => setNewDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                >
                  <option value="BI">BI / DIRE / Passaporte</option>
                  <option value="Certificado de Habilitações">Certificado de Habilitações</option>
                  <option value="Atestado Médico">Atestado Médico</option>
                  <option value="Comprovativo de Residência">Comprovativo de Residência</option>
                  <option value="Contrato Assinado">Contrato Assinado</option>
                  <option value="Outro">Outro Documento</option>
                </select>
              </div>

              <div className="p-4 rounded-xl border-2 border-dashed border-slate-700 text-center space-y-1">
                <UploadCloud className="w-8 h-8 text-teal-400 mx-auto" />
                <span className="text-xs text-slate-300 font-semibold block">Simular Envio de Ficheiro</span>
                <span className="text-[10px] text-slate-500 block">PDF, JPG, PNG até 10MB</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-teal-400"
                >
                  Confirmar Anexo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: DAR BAIXA NO ALUNO (DESLIGAMENTO ADMINISTRATIVO)
          "Baixa" não significa apagar o aluno. Preservação estrita dos dados.
          ===================================================================== */}
      {showTerminationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                  <UserX className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Dar Baixa no Aluno (Homologação de Desligamento)
                  </h3>
                  <span className="text-[11px] text-slate-400">Processo: {selectedStudent.code} • {selectedStudent.fullName}</span>
                </div>
              </div>
              <button
                onClick={() => setShowTerminationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Strict Notice & Preserved Data Guarantees */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>"Baixa" não significa apagar o aluno do sistema!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Ao homologar a baixa, todos os registos permanecem salvaguardados para consultas futuras, emissão de históricos, certidões ou eventual reativação do processo.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-[10px] text-emerald-400 font-medium">
                <span className="flex items-center gap-1">✓ Histórico Preservado</span>
                <span className="flex items-center gap-1">✓ Pagamentos Preservados</span>
                <span className="flex items-center gap-1">✓ Notas Preservadas</span>
                <span className="flex items-center gap-1">✓ Frequência Preservada</span>
                <span className="flex items-center gap-1">✓ Documentos Preservados</span>
                <span className="flex items-center gap-1">✓ Reativação Permitida</span>
              </div>
            </div>

            <form onSubmit={handleConfirmTermination} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  1. Motivo Registrado da Baixa *
                </label>
                <select
                  value={terminationReason}
                  onChange={(e: any) => setTerminationReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-500 focus:outline-none"
                >
                  <option value="Desistência">Desistência Voluntária</option>
                  <option value="Transferência">Transferência para Outra Instituição</option>
                  <option value="Inadimplência">Inadimplência Superior ao Prazo Regulamentar</option>
                  <option value="Mudança de Cidade">Mudança de Cidade / Província</option>
                  <option value="Motivos de Saúde">Motivos de Saúde Comprovados</option>
                  <option value="Reprovação">Reprovação por Faltas / Rendimento</option>
                  <option value="Conclusão de Ciclo">Conclusão de Ciclo / Encerramento</option>
                  <option value="Outro">Outro Motivo Regulamentar</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    2. Data Registrada da Baixa *
                  </label>
                  <input
                    type="date"
                    required
                    value={terminationDate}
                    onChange={(e) => setTerminationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    3. Utilizador Responsável Registrado *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    placeholder="Nome completo do responsável"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    4. Cargo / Função do Responsável
                  </label>
                  <input
                    type="text"
                    value={authorizedRole}
                    onChange={(e) => setAuthorizedRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    5. Situação Financeira no Ato da Baixa
                  </label>
                  <select
                    value={financialSituation}
                    onChange={(e) => setFinancialSituation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                  >
                    <option value="Sem dívidas pendentes de propinas">Sem dívidas pendentes de propinas</option>
                    <option value="Com pendências a regularizar">Com pendências a regularizar</option>
                    <option value="Totalmente regularizado">Totalmente regularizado</option>
                    <option value="Em contencioso administrativo">Em contencioso administrativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  6. Situação Acadêmica no Desligamento
                </label>
                <input
                  type="text"
                  value={academicSituation}
                  onChange={(e) => setAcademicSituation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  7. Parecer / Observações do Termo de Baixa
                </label>
                <textarea
                  rows={2}
                  value={terminationNotes}
                  onChange={(e) => setTerminationNotes(e.target.value)}
                  placeholder="Informações adicionais para a emissão da certidão ou arquivo..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Permite reativação posterior conforme permissão
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTerminationModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
                  >
                    Homologar Baixa (Preservar Dados)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ALTERAR ESTADO DO ALUNO (12 ESTADOS REGULAMENTARES)
          Pré-inscrito | Inscrito | Matriculado | Ativo | Em curso | Suspenso |
          Transferido | Concluído | Reprovado | Desistente | Baixado | Cancelado
          ===================================================================== */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Alterar Estado do Aluno</h3>
                  <span className="text-[11px] text-slate-400">{selectedStudent.code} • Estado atual: {selectedStudent.status}</span>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStatusChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Selecione o Novo Estado Regulamentar (12 Estados Disponíveis) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_STUDENT_STATUSES.map((st) => {
                    const badge = getStudentStatusBadgeStyle(st);
                    const isSelected = targetStatus === st;
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setTargetStatus(st)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/20 ring-2 ring-sky-500/30'
                            : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${badge.dotColor}`} />
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {st}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {targetStatus === 'Baixado' && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    Aviso de Homologação de Baixa
                  </p>
                  <p className="text-[11px]">
                    Ao selecionar "Baixado", o formulário completo de baixa será aberto para registrar obrigatoriamente motivo, data, responsável e garantir a salvaguarda de notas, frequência, pagamentos e documentos.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Justificativa / Parecer da Mudança de Estado
                </label>
                <textarea
                  rows={2}
                  value={statusJustification}
                  onChange={(e) => setStatusJustification(e.target.value)}
                  placeholder="Ex: Regularização após validação de documentos de matrícula..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Utilizador Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={statusResponsible}
                  onChange={(e) => setStatusResponsible(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold cursor-pointer transition-all"
                >
                  {targetStatus === 'Baixado' ? 'Prosseguir para Termo de Baixa' : 'Confirmar Novo Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: REATIVAÇÃO DE PROCESSO DO ALUNO
          Permite reativação conforme permissão de utilizador
          ===================================================================== */}
      {showReactivationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reativação de Processo do Aluno</h3>
                  <span className="text-[11px] text-slate-400">{selectedStudent.code} • {selectedStudent.fullName}</span>
                </div>
              </div>
              <button
                onClick={() => setShowReactivationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                Reativação com Retoma Imediata de Registos
              </p>
              <p className="text-[11px] text-slate-300">
                O aluno recuperará o acesso ao portal e o seu histórico, pagamentos, pautas e assiduidade continuam intactos.
              </p>
            </div>

            <form onSubmit={handleConfirmReactivation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Novo Estado do Aluno após Reativação *
                </label>
                <select
                  value={reactivationStatus}
                  onChange={(e: any) => setReactivationStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Ativo">Ativo (Frequência Regular e Acesso Pleno)</option>
                  <option value="Matriculado">Matriculado (Aguardando Início de Módulos)</option>
                  <option value="Em curso">Em curso (Retoma das Aulas)</option>
                  <option value="Inscrito">Inscrito (Validação Documental)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motivo / Justificativa da Reativação *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reactivationReason}
                  onChange={(e) => setReactivationReason(e.target.value)}
                  placeholder="Ex: Regularização das condições financeiras e aprovação pelo Diretor Pedagógico para retoma do curso..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Utilizador Responsável pela Reativação *
                </label>
                <input
                  type="text"
                  required
                  value={reactivationResponsible}
                  onChange={(e) => setReactivationResponsible(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReactivationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
                >
                  Confirmar Reativação do Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: VISUALIZAR RECIBO
          ===================================================================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                Recibo Oficial de Pagamento
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white text-slate-950 space-y-4 font-sans shadow-lg">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-black text-sm uppercase">{activeInstitution.name}</h4>
                  <span className="text-[11px] text-slate-600 block">Tesouraria Central • NUIT: 400192841</span>
                  <span className="text-[11px] text-slate-600 block">{activeInstitution.city}, Moçambique</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800">{selectedReceipt.receiptNumber}</span>
                  <span className="text-[10px] text-slate-500 block">Data: {selectedReceipt.date}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <p><strong>Recebemos de:</strong> {selectedStudent.fullName}</p>
                <p><strong>Código Aluno:</strong> {selectedStudent.code} • <strong>BI:</strong> {selectedStudent.documentNumber}</p>
                <p><strong>Referente a:</strong> {selectedReceipt.description}</p>
                <p><strong>Forma de Pagamento:</strong> {selectedReceipt.paymentMethod}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 flex items-center justify-between font-black text-sm">
                <span>TOTAL LIQUIDADO:</span>
                <span className="text-emerald-700 text-base">{selectedReceipt.amount.toLocaleString()} MT</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Código Validação: {selectedReceipt.qrVerificationCode}</span>
                <span className="font-bold text-emerald-700">✓ AUTENTICADO NO SIVERC</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-emerald-400 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
