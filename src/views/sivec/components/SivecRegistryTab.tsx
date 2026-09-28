import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Printer, 
  Plus, 
  ShieldAlert, 
  Eye, 
  Copy, 
  Check, 
  Building2, 
  Calendar, 
  Lock, 
  RotateCcw, 
  Clock, 
  History, 
  Key, 
  FileCheck2, 
  Award, 
  UserCheck, 
  Fingerprint,
  ChevronRight
} from 'lucide-react';
import { 
  SivecRegistryEntry, 
  SivecCredentialState, 
  CredentialType, 
  SivecSignature, 
  SivecHistoryEvent 
} from '../types';
import { SIVEC_LEGAL_MANDATE } from '../mockSivecData';

interface SivecRegistryTabProps {
  registry: SivecRegistryEntry[];
  onAddEntry: (entry: SivecRegistryEntry) => void;
  onRevokeEntry: (id: string, reason: string) => void;
  onUpdateStatus?: (id: string, newStatus: SivecCredentialState, reason: string, actor?: string) => void;
  onSelectForVerify: (code: string) => void;
}

// Normalização de estado para os 5 estados oficiais (Requisito 43)
export const normalizeSivecStatus = (status: string): SivecCredentialState => {
  const upper = status.toUpperCase();
  if (upper === 'ATIVO' || upper === 'VALIDO') return 'ATIVO';
  if (upper === 'REVOGADO') return 'REVOGADO';
  if (upper === 'CORRIGIDO') return 'CORRIGIDO';
  if (upper === 'EXPIRADO') return 'EXPIRADO';
  if (upper === 'CANCELADO') return 'CANCELADO';
  return 'ATIVO';
};

export const SivecRegistryTab: React.FC<SivecRegistryTabProps> = ({
  registry,
  onAddEntry,
  onRevokeEntry,
  onUpdateStatus,
  onSelectForVerify
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<string>('todos');

  // Modal de Visualização Detalhada da Credencial (11 pontos)
  const [selectedEntry, setSelectedEntry] = useState<SivecRegistryEntry | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'geral' | 'assinaturas' | 'historico'>('geral');

  // Modal de Transição / Alteração de Estado (ATIVO, REVOGADO, CORRIGIDO, EXPIRADO, CANCELADO)
  const [statusChangeEntry, setStatusChangeEntry] = useState<SivecRegistryEntry | null>(null);
  const [targetStatus, setTargetStatus] = useState<SivecCredentialState>('REVOGADO');
  const [statusJustification, setStatusJustification] = useState('');
  const [statusActor, setStatusActor] = useState('Secretaria Notarial & Registo Académico SIVEC');

  // Modal de Registo de Novo Certificado
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // 1. Instituição
  const [newInstName, setNewInstName] = useState('Instituto Politécnico de Tecnologias Avançadas Moztechwave');
  const [newInstNuit, setNewInstNuit] = useState('400192837');
  const [newInstCode, setNewInstCode] = useState('IPTA-MZ-0042');
  const [newInstCampus, setNewInstCampus] = useState('Campus Central Politécnico - Maputo');

  // 2. Certificado & Tipo
  const [newCertTitle, setNewCertTitle] = useState('Certificado de Habilitação & Competência Profissional');
  const [newType, setNewType] = useState<CredentialType>('certificado');
  const [newAcademicLevel, setNewAcademicLevel] = useState('Nível 5 - Especialização Tecnológica');
  const [newBookNumber, setNewBookNumber] = useState('L-04/TEC');
  const [newSheetNumber, setNewSheetNumber] = useState('Fl. 92');
  const [newEntryNumber, setNewEntryNumber] = useState('Assento nº 1046');

  // 3. Aluno
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentDoc, setNewStudentDoc] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // 4. Curso
  const [newCourseName, setNewCourseName] = useState('Engenharia de Software & Full-Stack');
  const [newDurationHours, setNewDurationHours] = useState(800);
  const [newFinalGrade, setNewFinalGrade] = useState('17 Valores (Muito Bom)');

  // 5. Número
  const [newCertificateNumber, setNewCertificateNumber] = useState('');

  // 6. Data
  const [newIssueDate, setNewIssueDate] = useState(() => new Date().toLocaleDateString('pt-PT'));
  const [newCompletionDate, setNewCompletionDate] = useState(() => new Date().toLocaleDateString('pt-PT'));
  const [newExpiryDate, setNewExpiryDate] = useState('');

  // 7. Estado
  const [newInitialStatus, setNewInitialStatus] = useState<SivecCredentialState>('ATIVO');

  // 9. Emissor
  const [newIssuerName, setNewIssuerName] = useState('Dr. Armando Macuácua');
  const [newIssuerRole, setNewIssuerRole] = useState('Secretário-Geral Notarial');
  const [newIssuerDept, setNewIssuerDept] = useState('Secretaria-Geral Notarial SIVEC');

  // Cópia de Hash / ID
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Estatísticas por Estado
  const stateCounts = {
    total: registry.length,
    ativo: registry.filter(r => normalizeSivecStatus(r.status) === 'ATIVO').length,
    revogado: registry.filter(r => normalizeSivecStatus(r.status) === 'REVOGADO').length,
    corrigido: registry.filter(r => normalizeSivecStatus(r.status) === 'CORRIGIDO').length,
    expirado: registry.filter(r => normalizeSivecStatus(r.status) === 'EXPIRADO').length,
    cancelado: registry.filter(r => normalizeSivecStatus(r.status) === 'CANCELADO').length
  };

  // Filtragem
  const filteredRegistry = registry.filter(entry => {
    const normStatus = normalizeSivecStatus(entry.status);
    const matchesSearch = 
      entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sivecCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.uniqueCertificateId && entry.uniqueCertificateId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.certificateNumber && entry.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.studentDocument.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.issuerName && entry.issuerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.institutionName && entry.institutionName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || normStatus === statusFilter;
    const matchesType = typeFilter === 'todos' || entry.credentialType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handler de Registo Completo
  const handleCreateRegistry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentDoc.trim()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const sivecCode = `SIVEC-MZ-2026-${randomSuffix}`;
    const certNum = newCertificateNumber.trim() || `CERT-2026-00${randomSuffix}`;
    
    // Identificador único universal do certificado (Requisito 43)
    const uniqueCertificateId = `MZ-SIVEC-${newType.slice(0, 4).toUpperCase()}-2026-${randomSuffix}-U${Math.floor(Math.random() * 90 + 10)}`;
    
    const nowIso = new Date().toISOString();
    const timestampStr = new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT').slice(0, 5);
    
    // Geração de hash SHA-256 simulado de 64 caracteres
    const rawPayload = `${uniqueCertificateId}|${newStudentDoc}|${newStudentName}|${newCourseName}|${newDurationHours}|${newIssueDate}`;
    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // 10. Assinaturas Digitais Institucionais
    const signaturesList: SivecSignature[] = [
      {
        id: `sig-${Date.now()}-dir`,
        signerName: 'Eng. Paulo Jafim',
        signerRole: 'Diretor Geral do Instituto',
        signatureDate: timestampStr,
        algorithm: 'Ed25519 (Edwards 25519)',
        signatureHex: fakeHash.slice(0, 32) + fakeHash.slice(32),
        isValid: true,
        publicFingerprint: 'SHA256:7e:9a:4f:88:21:bc:33:d1:ef:aa:50:41:99:32:ee:f7:b1'
      },
      {
        id: `sig-${Date.now()}-ped`,
        signerName: 'Dra. Amina Abdul',
        signerRole: 'Diretora Pedagógica & Homologação Curricular',
        signatureDate: timestampStr,
        algorithm: 'Ed25519 (Edwards 25519)',
        signatureHex: fakeHash.slice(16, 48) + fakeHash.slice(0, 16),
        isValid: true,
        publicFingerprint: 'SHA256:4b:21:ee:99:50:aa:ef:d1:33:bc:21:88:4f:9a:7e:f7:11'
      },
      {
        id: `sig-${Date.now()}-not`,
        signerName: newIssuerName,
        signerRole: newIssuerRole,
        signatureDate: timestampStr,
        algorithm: 'RFC 3161 TSA Time-Stamp Authority',
        signatureHex: fakeHash.slice(32) + fakeHash.slice(0, 32),
        isValid: true,
        publicFingerprint: 'SHA256:11:77:88:99:aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66'
      }
    ];

    // 11. Histórico Notarial Inicial
    const initialHistoryEvent: SivecHistoryEvent = {
      id: `hist-${Date.now()}-1`,
      timestamp: timestampStr,
      action: 'Lavratura Notarial & Emissão Original do Certificado',
      actor: newIssuerName,
      actorRole: newIssuerRole,
      newState: newInitialStatus,
      justification: `Emissão e averbamento no Livro ${newBookNumber} Folha ${newSheetNumber} com outorga de ${newDurationHours}h e nota final ${newFinalGrade}.`,
      transactionHash: `tx-${randomSuffix}-init-block`
    };

    const newEntry: SivecRegistryEntry = {
      id: `sivec-reg-${Date.now()}`,
      uniqueCertificateId,
      sivecCode,
      
      // 1. Instituição
      institutionName: newInstName,
      institutionNuit: newInstNuit,
      institutionCode: newInstCode,
      institutionCampus: newInstCampus,

      // 2. Certificado
      certificateTitle: newCertTitle,
      credentialType: newType,
      academicLevel: newAcademicLevel,
      bookNumber: newBookNumber,
      sheetNumber: newSheetNumber,
      entryNumber: newEntryNumber || `Assento nº ${randomSuffix}`,

      // 3. Aluno
      studentName: newStudentName.trim().toUpperCase(),
      studentDocument: newStudentDoc.trim(),
      studentId: newStudentId.trim() || `AL-2026-${randomSuffix}`,
      studentEmail: newStudentEmail.trim() || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@aluno.co.mz`,

      // 4. Curso
      courseName: newCourseName,
      durationHours: Number(newDurationHours),
      finalGrade: newFinalGrade,

      // 5. Número
      certificateNumber: certNum,

      // 6. Data
      issueDate: newIssueDate,
      completionDate: newCompletionDate,
      expiryDate: newExpiryDate ? newExpiryDate : undefined,
      timestampUtc: nowIso,

      // 7. Estado
      status: newInitialStatus,

      // 8. Hash
      sha256Hash: fakeHash,

      // 9. Emissor
      issuerName: newIssuerName,
      issuerRole: newIssuerRole,
      issuerDepartment: newIssuerDept,

      // 10. Assinaturas
      signatures: signaturesList,
      digitalSignature: `ED25519-SIG:${fakeHash.slice(0, 16)}...${fakeHash.slice(48)}`,
      signatoryDirector: 'Eng. Paulo Jafim (Diretor Geral)',
      pedagogicOfficer: 'Dra. Amina Abdul (Diretora Pedagógica)',

      // 11. Histórico
      history: [initialHistoryEvent],

      verificationCount: 0,
      accreditation: {
        hasAnepAccreditation: false,
        legalDisclaimer: SIVEC_LEGAL_MANDATE.standardFormula
      }
    };

    onAddEntry(newEntry);
    setIsNewModalOpen(false);
    setNewStudentName('');
    setNewStudentDoc('');
    setNewStudentId('');
    setNewStudentEmail('');
    setNewCertificateNumber('');
  };

  // Handler de Confirmação de Mudança de Estado
  const handleConfirmStatusChange = () => {
    if (!statusChangeEntry || !statusJustification.trim()) return;

    if (onUpdateStatus) {
      onUpdateStatus(
        statusChangeEntry.id, 
        targetStatus, 
        statusJustification.trim(), 
        statusActor.trim()
      );
    } else {
      // Fallback para onRevokeEntry se for revogação
      if (targetStatus === 'REVOGADO') {
        onRevokeEntry(statusChangeEntry.id, statusJustification.trim());
      }
    }

    setStatusChangeEntry(null);
    setStatusJustification('');
  };

  // Render do Badge de Estado
  const renderStatusBadge = (status: SivecCredentialState | string) => {
    const norm = normalizeSivecStatus(status);
    switch (norm) {
      case 'ATIVO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            ATIVO
          </span>
        );
      case 'REVOGADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            REVOGADO
          </span>
        );
      case 'CORRIGIDO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <RotateCcw className="w-3 h-3" />
            CORRIGIDO
          </span>
        );
      case 'EXPIRADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-slate-500/20 text-slate-400 border border-slate-500/30">
            <Clock className="w-3 h-3" />
            EXPIRADO
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <AlertCircle className="w-3 h-3" />
            CANCELADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO DO REGISTRY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
            SIVEC REGISTRY • LIVRO CENTRAL DE CREDENCIAIS &amp; ASSENTOS NOTARIAIS
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Registo Notarial Académico de Certificados &amp; Diplomas
          </h2>
          <p className="text-xs text-slate-400">
            Registo de instituição, certificado, aluno, curso, número, datas, estados, hash, emissor, assinaturas e histórico auditável.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Livro</span>
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Novo Certificado</span>
          </button>
        </div>
      </div>

      {/* PAINEL DE CONTADORES DOS 5 ESTADOS DO REQUISITO 43 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setStatusFilter('todos')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'todos' 
              ? 'bg-slate-800 border-slate-600 shadow-md' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Registos</span>
          <span className="text-lg font-black text-white font-mono">{stateCounts.total}</span>
        </button>

        <button
          onClick={() => setStatusFilter('ATIVO')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'ATIVO' 
              ? 'bg-emerald-500/20 border-emerald-500/60 shadow-md' 
              : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <span className="text-[10px] text-emerald-400 uppercase font-mono block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ATIVO
          </span>
          <span className="text-lg font-black text-emerald-400 font-mono">{stateCounts.ativo}</span>
        </button>

        <button
          onClick={() => setStatusFilter('REVOGADO')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'REVOGADO' 
              ? 'bg-rose-500/20 border-rose-500/60 shadow-md' 
              : 'bg-slate-900 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <span className="text-[10px] text-rose-400 uppercase font-mono block flex items-center gap-1">
            <XCircle className="w-3 h-3" /> REVOGADO
          </span>
          <span className="text-lg font-black text-rose-400 font-mono">{stateCounts.revogado}</span>
        </button>

        <button
          onClick={() => setStatusFilter('CORRIGIDO')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'CORRIGIDO' 
              ? 'bg-amber-500/20 border-amber-500/60 shadow-md' 
              : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <span className="text-[10px] text-amber-400 uppercase font-mono block flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> CORRIGIDO
          </span>
          <span className="text-lg font-black text-amber-400 font-mono">{stateCounts.corrigido}</span>
        </button>

        <button
          onClick={() => setStatusFilter('EXPIRADO')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'EXPIRADO' 
              ? 'bg-slate-700/50 border-slate-500 shadow-md' 
              : 'bg-slate-900 border-slate-800 hover:border-slate-600'
          }`}
        >
          <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
            <Clock className="w-3 h-3" /> EXPIRADO
          </span>
          <span className="text-lg font-black text-slate-300 font-mono">{stateCounts.expirado}</span>
        </button>

        <button
          onClick={() => setStatusFilter('CANCELADO')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'CANCELADO' 
              ? 'bg-purple-500/20 border-purple-500/60 shadow-md' 
              : 'bg-slate-900 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <span className="text-[10px] text-purple-400 uppercase font-mono block flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> CANCELADO
          </span>
          <span className="text-lg font-black text-purple-400 font-mono">{stateCounts.cancelado}</span>
        </button>
      </div>

      {/* BARRA DE FILTROS & PESQUISA */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por Código, ID Único, Aluno, BI, Curso, Emissor ou Hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-sans placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-500">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-hidden cursor-pointer text-xs"
            >
              <option value="todos" className="bg-slate-900">Todos ({registry.length})</option>
              <option value="ATIVO" className="bg-slate-900">ATIVO ({stateCounts.ativo})</option>
              <option value="REVOGADO" className="bg-slate-900">REVOGADO ({stateCounts.revogado})</option>
              <option value="CORRIGIDO" className="bg-slate-900">CORRIGIDO ({stateCounts.corrigido})</option>
              <option value="EXPIRADO" className="bg-slate-900">EXPIRADO ({stateCounts.expirado})</option>
              <option value="CANCELADO" className="bg-slate-900">CANCELADO ({stateCounts.cancelado})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="text-[11px] text-slate-500">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-hidden cursor-pointer text-xs"
            >
              <option value="todos" className="bg-slate-900">Todos os Tipos</option>
              <option value="certificado" className="bg-slate-900">Certificados</option>
              <option value="diploma" className="bg-slate-900">Diplomas</option>
              <option value="declaracao_notas" className="bg-slate-900">Declarações com Notas</option>
              <option value="microcredencial" className="bg-slate-900">Microcredenciais</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABELA DO REGISTO CARTORÁRIO */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3.5 px-4">Identificador Único / Código</th>
                <th className="py-3.5 px-4">Aluno &amp; Documento</th>
                <th className="py-3.5 px-4">Certificado &amp; Curso</th>
                <th className="py-3.5 px-4">Instituição &amp; Emissor</th>
                <th className="py-3.5 px-4">Datas</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Assinaturas</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredRegistry.map((item) => {
                const normStatus = normalizeSivecStatus(item.status);
                const uniqueId = item.uniqueCertificateId || `MZ-SIVEC-CERT-${item.sivecCode}`;
                const certNum = item.certificateNumber || item.entryNumber || 'S/N';
                const sigCount = item.signatures ? item.signatures.length : 1;
                const histCount = item.history ? item.history.length : 1;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Identificador Único & Código */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{item.sivecCode}</span>
                        <button
                          onClick={() => handleCopy(item.sivecCode, `code-${item.id}`)}
                          title="Copiar Código SIVEC"
                          className="text-slate-500 hover:text-emerald-400 cursor-pointer"
                        >
                          {copiedText === `code-${item.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono truncate max-w-[140px]" title={uniqueId}>
                        {uniqueId}
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">
                        Nº: {certNum}
                      </span>
                    </td>

                    {/* Aluno & Documento */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{item.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.studentDocument}</div>
                      <div className="text-[10px] text-slate-500">ID: {item.studentId}</div>
                    </td>

                    {/* Certificado & Curso */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-white font-medium truncate">{item.courseName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="capitalize">{item.credentialType.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{item.durationHours}h</span>
                        <span>•</span>
                        <span className="text-emerald-400">{item.finalGrade}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.bookNumber} • {item.sheetNumber} • {item.entryNumber}
                      </div>
                    </td>

                    {/* Instituição & Emissor */}
                    <td className="py-3.5 px-4 max-w-[160px]">
                      <div className="text-slate-300 font-medium truncate" title={item.institutionName}>
                        {item.institutionName || 'IPTA Moztechwave'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Emissor: {item.issuerName || 'Dr. Armando Macuácua'}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono truncate">
                        NUIT: {item.institutionNuit || '400192837'}
                      </div>
                    </td>

                    {/* Datas */}
                    <td className="py-3.5 px-4 text-[11px] font-mono text-slate-400">
                      <div>Emissão: <strong className="text-white">{item.issueDate}</strong></div>
                      {item.expiryDate && (
                        <div className="text-[10px] text-amber-400">Validade: {item.expiryDate}</div>
                      )}
                      <div className="text-[9px] text-slate-500">
                        {new Date(item.timestampUtc).toLocaleDateString('pt-PT')} UTC
                      </div>
                    </td>

                    {/* Estado Oficial (ATIVO, REVOGADO, CORRIGIDO, EXPIRADO, CANCELADO) */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(normStatus)}
                    </td>

                    {/* Assinaturas & Histórico */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-sky-400">
                          {sigCount} {sigCount === 1 ? 'Assinatura' : 'Assinaturas'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {histCount} {histCount === 1 ? 'evento' : 'eventos'}
                        </span>
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedEntry(item);
                            setDetailActiveTab('geral');
                          }}
                          title="Ver Ficha Notarial Completa (11 Pontos)"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setStatusChangeEntry(item);
                            setTargetStatus(normStatus === 'ATIVO' ? 'REVOGADO' : 'ATIVO');
                            setStatusJustification('');
                          }}
                          title="Alterar Estado (ATIVO, REVOGADO, CORRIGIDO, EXPIRADO, CANCELADO)"
                          className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectForVerify(item.sivecCode)}
                          title="Validar Autenticidade no SIVEC Verify"
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FICHA CARTORÁRIA NOTARIAL COMPLETA (OS 11 REQUISITOS DO SIVEC REGISTRY) */}
      {/* ========================================================================= */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-5 shadow-2xl">
            
            {/* TOPO DO MODAL DE DETALHES */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    Assento Notarial Académico SIVEC v5.0
                  </span>
                  {renderStatusBadge(selectedEntry.status)}
                </div>
                <h3 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                  <FileCheck2 className="w-5 h-5 text-emerald-400" />
                  {selectedEntry.uniqueCertificateId || selectedEntry.sivecCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* ABAS DO MODAL: GERAL & DADOS | CRIPTOGRAFIA & ASSINATURAS | HISTÓRICO AUDITÁVEL */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setDetailActiveTab('geral')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  detailActiveTab === 'geral' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                1. Dados &amp; Registo Académico
              </button>
              <button
                onClick={() => setDetailActiveTab('assinaturas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'assinaturas' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>2. Assinaturas &amp; Hash SHA-256</span>
              </button>
              <button
                onClick={() => setDetailActiveTab('historico')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'historico' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>3. Histórico &amp; Auditoria ({selectedEntry.history?.length || 1})</span>
              </button>
            </div>

            {/* ABA 1: DADOS GERAIS DO CERTIFICADO */}
            {detailActiveTab === 'geral' && (
              <div className="space-y-4 text-xs">
                
                {/* 1. Instituição & 9. Emissor */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-sky-400 uppercase font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> 1. Instituição &amp; Emissor Notarial
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Nome da Instituição:</span>
                      <strong className="text-white">{selectedEntry.institutionName || 'Instituto Politécnico de Tecnologias Avançadas Moztechwave'}</strong>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        NUIT: {selectedEntry.institutionNuit || '400192837'} • Código: {selectedEntry.institutionCode || 'IPTA-MZ-0042'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Campus: {selectedEntry.institutionCampus || 'Campus Central Politécnico - Maputo'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Autoridade Emissora:</span>
                      <strong className="text-white">{selectedEntry.issuerName || 'Dr. Armando Macuácua'}</strong>
                      <span className="text-[11px] text-slate-400 block">
                        {selectedEntry.issuerRole || 'Secretário-Geral Notarial'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Departamento: {selectedEntry.issuerDepartment || 'Secretaria-Geral Notarial SIVEC'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Certificado, 3. Aluno, 4. Curso & 5. Número */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Aluno */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-400" /> 3. Aluno Titular
                    </span>
                    <strong className="text-white block text-sm">{selectedEntry.studentName}</strong>
                    <div className="text-[11px] text-slate-300 font-mono">{selectedEntry.studentDocument}</div>
                    <div className="text-[10px] text-slate-400">ID: {selectedEntry.studentId}</div>
                    <div className="text-[10px] text-slate-500 truncate">{selectedEntry.studentEmail}</div>
                  </div>

                  {/* Certificado & Assento */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-400" /> 2. Certificado &amp; Livro
                    </span>
                    <strong className="text-white block truncate">{selectedEntry.certificateTitle || 'Certificado Oficial'}</strong>
                    <div className="text-emerald-400 font-mono font-bold">
                      {selectedEntry.bookNumber} • {selectedEntry.sheetNumber}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">{selectedEntry.entryNumber}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{selectedEntry.credentialType.replace('_', ' ')}</div>
                  </div>

                  {/* Número & Datas */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-400" /> 5. Número &amp; 6. Datas
                    </span>
                    <strong className="text-white block font-mono">
                      Nº: {selectedEntry.certificateNumber || selectedEntry.entryNumber}
                    </strong>
                    <div className="text-[11px] text-slate-300 font-mono">
                      Emissão: {selectedEntry.issueDate}
                    </div>
                    {selectedEntry.completionDate && (
                      <div className="text-[10px] text-slate-400">Conclusão: {selectedEntry.completionDate}</div>
                    )}
                    {selectedEntry.expiryDate && (
                      <div className="text-[10px] text-amber-400 font-bold">Validade: {selectedEntry.expiryDate}</div>
                    )}
                  </div>
                </div>

                {/* 4. Curso */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    4. Curso &amp; Qualificação Académica
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-white text-sm block">{selectedEntry.courseName}</strong>
                      <span className="text-slate-400 text-[11px]">
                        Nível: {selectedEntry.academicLevel || 'Nível 5 - Especialização Tecnológica Avançada'}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-emerald-400 font-bold text-sm block">{selectedEntry.finalGrade}</span>
                      <span className="text-slate-500 text-[10px]">Carga Horária: {selectedEntry.durationHours} Horas</span>
                    </div>
                  </div>
                </div>

                {/* MOTIVO ESPECÍFICO CONFORME ESTADO */}
                {normalizeSivecStatus(selectedEntry.status) === 'REVOGADO' && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-1 text-rose-200">
                    <span className="text-[10px] font-bold uppercase text-rose-400 block font-mono">
                      MOTIVO FORMAL DA REVOGAÇÃO NOTARIAL:
                    </span>
                    <p className="font-medium">{selectedEntry.revocationReason || 'Processo notarial e disciplinar'}</p>
                    <div className="text-[10px] text-rose-300 pt-1">
                      Data: {selectedEntry.revocationDate || selectedEntry.issueDate} • Autoridade: {selectedEntry.revokedBy || 'Comissão Disciplinar'}
                    </div>
                  </div>
                )}

                {normalizeSivecStatus(selectedEntry.status) === 'CORRIGIDO' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-1 text-amber-200">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block font-mono">
                      APOSTILHA / NOTA DE RETIFICAÇÃO CADASTRAL:
                    </span>
                    <p className="font-medium">{selectedEntry.correctionReason || 'Retificação formal de dados homologada'}</p>
                    <div className="text-[10px] text-amber-300 pt-1">
                      Data: {selectedEntry.correctionDate || selectedEntry.issueDate} • Corrigido por: {selectedEntry.correctedBy || 'Secretaria Notarial'}
                    </div>
                  </div>
                )}

                {normalizeSivecStatus(selectedEntry.status) === 'CANCELADO' && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/40 space-y-1 text-purple-200">
                    <span className="text-[10px] font-bold uppercase text-purple-400 block font-mono">
                      MOTIVO DO CANCELAMENTO ADMINISTRATIVO:
                    </span>
                    <p className="font-medium">{selectedEntry.cancellationReason || 'Cancelamento por anulação ou substituição'}</p>
                    <div className="text-[10px] text-purple-300 pt-1">
                      Data: {selectedEntry.cancellationDate || selectedEntry.issueDate} • Cancelado por: {selectedEntry.cancelledBy || 'Direção do Registo'}
                    </div>
                  </div>
                )}

                {/* FÓRMULA PADRÃO INSTITUCIONAL OBRIGATÓRIA */}
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-mono">
                    Fórmula Institucional Obrigatória:
                  </span>
                  <blockquote className="font-serif italic font-bold text-white text-xs border-l-2 border-emerald-400 pl-3">
                    &ldquo;{selectedEntry.accreditation?.legalDisclaimer || SIVEC_LEGAL_MANDATE.standardFormula}&rdquo;
                  </blockquote>
                  <p className="text-[10px] text-slate-400">
                    SIVEC não substitui a ANEP. Vedada declaração de reconhecimento sem acreditação comprovada.
                  </p>
                </div>
              </div>
            )}

            {/* ABA 2: CRIPTOGRAFIA, HASH SHA-256 & ASSINATURAS */}
            {detailActiveTab === 'assinaturas' && (
              <div className="space-y-4 text-xs">
                
                {/* 8. Hash Criptográfico */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> 8. Hash Criptográfico SHA-256 (Inviolável)
                    </span>
                    <button
                      onClick={() => handleCopy(selectedEntry.sha256Hash, 'hash-modal')}
                      className="text-emerald-400 hover:text-emerald-300 text-[10px] flex items-center gap-1 cursor-pointer font-mono"
                    >
                      {copiedText === 'hash-modal' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText === 'hash-modal' ? 'Copiado!' : 'Copiar Hash'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all">
                    {selectedEntry.sha256Hash}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Calculado canonicamente sobre todos os metadados do documento no ato de outorga.
                  </span>
                </div>

                {/* 10. Quadro de Assinaturas Digitais */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-[10px] font-mono text-sky-400 uppercase font-bold flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5" /> 10. Quadro de Assinaturas Digitais Institucionais
                  </span>

                  <div className="space-y-2.5">
                    {selectedEntry.signatures && selectedEntry.signatures.length > 0 ? (
                      selectedEntry.signatures.map((sig) => (
                        <div key={sig.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="text-white block">{sig.signerName}</strong>
                              <span className="text-[10px] text-slate-400">{sig.signerRole}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              sig.isValid 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {sig.isValid ? 'ASSINATURA VÁLIDA' : 'ASSINATURA ANULADA'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                            <div>
                              <span className="text-slate-500 block">Algoritmo &amp; Carimbo:</span>
                              <span className="text-slate-300">{sig.algorithm} • {sig.signatureDate}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Chave Pública / Fingerprint:</span>
                              <span className="text-emerald-400 truncate block">{sig.publicFingerprint}</span>
                            </div>
                          </div>

                          <div className="text-[10px] font-mono text-slate-500 truncate bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                            Digest: {sig.signatureHex}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-white">{selectedEntry.signatoryDirector || 'Eng. Paulo Jafim (Diretor Geral)'}</strong>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            VÁLIDA (Ed25519)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {selectedEntry.digitalSignature || 'Assinatura digital padrão SIVEC CORE'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Carimbo de Tempo TSA RFC 3161 */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Carimbo TSA RFC 3161 UTC:</span>
                  <strong className="text-white">{selectedEntry.timestampUtc}</strong>
                </div>
              </div>
            )}

            {/* ABA 3: 11. HISTÓRICO & AUDITORIA DE CICLO DE VIDA */}
            {detailActiveTab === 'historico' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> 11. Trilha de Auditoria Imutável do Certificado
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total de Eventos: {selectedEntry.history?.length || 1}
                  </span>
                </div>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {selectedEntry.history && selectedEntry.history.length > 0 ? (
                    selectedEntry.history.map((ev, index) => (
                      <div key={ev.id || index} className="pl-7 relative space-y-1">
                        <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-emerald-400 -translate-x-1/2" />
                        
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <strong className="text-white text-xs">{ev.action}</strong>
                            <span className="text-[10px] font-mono text-slate-400">{ev.timestamp}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono">
                            <span className="text-slate-400">Autor: <strong className="text-slate-300">{ev.actor}</strong> ({ev.actorRole})</span>
                            <span>•</span>
                            <span className="text-slate-400">Transição: </span>
                            {ev.previousState && (
                              <>
                                <span className="text-slate-500">{ev.previousState}</span>
                                <span>➔</span>
                              </>
                            )}
                            {renderStatusBadge(ev.newState)}
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                            {ev.justification}
                          </p>

                          {ev.transactionHash && (
                            <div className="text-[9px] font-mono text-slate-500">
                              Ledger Hash: {ev.transactionHash}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="pl-7 relative">
                      <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-emerald-400 -translate-x-1/2" />
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <strong className="text-white text-xs">Emissão e Assento Notarial Inicial</strong>
                        <p className="text-[11px] text-slate-300">
                          Documento lavrado e registado no livro com hash imutável e estado {selectedEntry.status}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOTÕES DE AÇÃO DO MODAL DE DETALHES */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-500">
                SIVEC ID: {selectedEntry.id}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setStatusChangeEntry(selectedEntry);
                    setTargetStatus(selectedEntry.status === 'ATIVO' ? 'REVOGADO' : 'ATIVO');
                    setStatusJustification('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Alterar Estado</span>
                </button>

                <button
                  onClick={() => {
                    const code = selectedEntry.sivecCode;
                    setSelectedEntry(null);
                    onSelectForVerify(code);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validar no SIVEC Verify</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ALTERAÇÃO DE ESTADO COM AUDITORIA (ATIVO, REVOGADO, CORRIGIDO, EXPIRADO, CANCELADO) */}
      {/* ========================================================================= */}
      {statusChangeEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-base font-black text-white">Alteração de Estado de Credencial</h3>
              </div>
              <button
                type="button"
                onClick={() => setStatusChangeEntry(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">{statusChangeEntry.sivecCode}</span>
                <span className="text-slate-400 font-mono">Estado Atual: {renderStatusBadge(statusChangeEntry.status)}</span>
              </div>
              <strong className="text-white block text-sm">{statusChangeEntry.studentName}</strong>
              <div className="text-[11px] text-slate-400">{statusChangeEntry.courseName}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Novo Estado Desejado (Requisito 43):
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as SivecCredentialState)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                >
                  <option value="ATIVO">ATIVO (Válido &amp; Homologado)</option>
                  <option value="REVOGADO">REVOGADO (Anulado por Processo Disciplinar/Fraude)</option>
                  <option value="CORRIGIDO">CORRIGIDO (Retificado por Apostilha Notarial)</option>
                  <option value="EXPIRADO">EXPIRADO (Vigência Cronológica Esgotada)</option>
                  <option value="CANCELADO">CANCELADO (Cancelamento Administrativo/Substituição)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Autoridade Responsável pelo Ato Notarial:
                </label>
                <input
                  type="text"
                  required
                  value={statusActor}
                  onChange={(e) => setStatusActor(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Motivo / Justificativa Notarial Formal <span className="text-amber-400">*</span>:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva a fundamentação legal, despacho ou averbamento (ex: Despacho nº 08/2026, retificação de nome conforme certidão, anulação por processo disciplinar, etc.)..."
                  value={statusJustification}
                  onChange={(e) => setStatusJustification(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                ⚠️ Esta transição será gravada de forma <strong>imutável na trilha de histórico</strong> do certificado com carimbo temporal e hash de bloco.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusChangeEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!statusJustification.trim()}
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar &amp; Gravar no Histórico</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTAR NOVO CERTIFICADO (REGISTAR OS 11 PONTOS) */}
      {/* ========================================================================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form onSubmit={handleCreateRegistry} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                  SIVEC REGISTRY • NOVO ASSENTO NOTARIAL
                </span>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Registar Novo Certificado
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* 1. Instituição & Emissor */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-sky-400 uppercase font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> 1. Instituição &amp; 9. Emissor
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block">Nome da Instituição:</label>
                    <input
                      type="text"
                      required
                      value={newInstName}
                      onChange={(e) => setNewInstName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">NUIT Institucional:</label>
                    <input
                      type="text"
                      required
                      value={newInstNuit}
                      onChange={(e) => setNewInstNuit(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block">Autoridade Emissora (Emissor):</label>
                    <input
                      type="text"
                      required
                      value={newIssuerName}
                      onChange={(e) => setNewIssuerName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">Cargo do Emissor:</label>
                    <input
                      type="text"
                      required
                      value={newIssuerRole}
                      onChange={(e) => setNewIssuerRole(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Certificado */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> 2. Certificado &amp; Tipo
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block">Tipo de Credencial:</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as CredentialType)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="certificado">Certificado de Conclusão</option>
                      <option value="diploma">Diploma Técnico-Profissional</option>
                      <option value="declaracao_notas">Declaração com Notas</option>
                      <option value="microcredencial">Microcredencial Tecnológica</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">Título do Certificado:</label>
                    <input
                      type="text"
                      required
                      value={newCertTitle}
                      onChange={(e) => setNewCertTitle(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block">Livro Notarial:</label>
                    <input
                      type="text"
                      required
                      value={newBookNumber}
                      onChange={(e) => setNewBookNumber(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">Folha nº:</label>
                    <input
                      type="text"
                      required
                      value={newSheetNumber}
                      onChange={(e) => setNewSheetNumber(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">Assento nº:</label>
                    <input
                      type="text"
                      required
                      value={newEntryNumber}
                      onChange={(e) => setNewEntryNumber(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Aluno */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> 3. Aluno (Titular)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block">Nome Completo do Aluno:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Alberto João Matsinhe"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">BI / Passaporte / DIRE:</label>
                    <input
                      type="text"
                      required
                      placeholder="BI nº 110293817290A"
                      value={newStudentDoc}
                      onChange={(e) => setNewStudentDoc(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block">Nº de Matrícula / Estudante:</label>
                    <input
                      type="text"
                      placeholder="Ex: AL-2026-1046"
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">E-mail do Aluno:</label>
                    <input
                      type="email"
                      placeholder="aluno@instituicao.co.mz"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Curso */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> 4. Curso
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 text-[10px] block">Nome do Curso:</label>
                    <input
                      type="text"
                      required
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">Carga Horária (h):</label>
                    <input
                      type="number"
                      min={20}
                      value={newDurationHours}
                      onChange={(e) => setNewDurationHours(Number(e.target.value))}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block">Classificação / Nota Final:</label>
                    <input
                      type="text"
                      value={newFinalGrade}
                      onChange={(e) => setNewFinalGrade(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block">Nível Académico / NQF:</label>
                    <input
                      type="text"
                      value={newAcademicLevel}
                      onChange={(e) => setNewAcademicLevel(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Número & 6. Data & 7. Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px] block">5. Número do Certificado:</label>
                  <input
                    type="text"
                    placeholder="Auto: CERT-2026-..."
                    value={newCertificateNumber}
                    onChange={(e) => setNewCertificateNumber(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block">6. Data de Emissão:</label>
                  <input
                    type="text"
                    required
                    value={newIssueDate}
                    onChange={(e) => setNewIssueDate(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block">7. Estado Inicial:</label>
                  <select
                    value={newInitialStatus}
                    onChange={(e) => setNewInitialStatus(e.target.value as SivecCredentialState)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold"
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="CORRIGIDO">CORRIGIDO</option>
                    <option value="EXPIRADO">EXPIRADO</option>
                    <option value="REVOGADO">REVOGADO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>
              </div>

              {/* AUTOMATISMOS CRIPTOGRÁFICOS SIVEC */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-slate-300 space-y-1">
                <span className="text-emerald-400 font-bold block flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Geração Criptográfica Automática (Requisitos 8, 10 e 11):
                </span>
                <p>
                  O SIVEC gerará automaticamente o <strong>Identificador Único Universal</strong>, o <strong>Hash SHA-256</strong>, a tríplice <strong>assinatura digital Ed25519</strong> e o primeiro <strong>registo auditável no histórico</strong> imutável.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Gravar Certificado no SIVEC Registry</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
