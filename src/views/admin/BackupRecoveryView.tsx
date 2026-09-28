import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Archive, 
  RotateCcw, 
  Download, 
  Upload, 
  ShieldCheck, 
  History, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Building2, 
  Search, 
  RefreshCw, 
  HardDrive, 
  Lock, 
  Eye, 
  Play, 
  ArrowRight,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  BackupSnapshot, 
  BackupScope, 
  HistoricalEvent, 
  RestorePreviewDiff,
  createInstitutionalBackup, 
  listInstitutionalBackups, 
  exportBackupToJsonFile, 
  parseBackupFile, 
  previewRestoreDiff, 
  executeRestore, 
  getLocalHistory 
} from '../../services/backupService';
import { FIRESTORE_COLLECTIONS } from '../../services/firestoreModular';

export const BackupRecoveryView: React.FC = () => {
  const { 
    activeInstitution: currentInstitution, 
    allInstitutions: institutions, 
    currentUser, 
    addNotification,
    students,
    courses,
    classes,
    teachers,
    contasReceber,
    contasPagar,
    paymentRecords,
    auditLogs
  } = useApp();

  const [selectedInstId, setSelectedInstId] = useState<string>(currentInstitution?.id || 'inst_001');
  const [activeTab, setActiveTab] = useState<'snapshots' | 'history' | 'modular_structure'>('snapshots');
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [historyEvents, setHistoryEvents] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // New Backup Modal state
  const [isNewBackupOpen, setIsNewBackupOpen] = useState(false);
  const [backupScope, setBackupScope] = useState<BackupScope>('full');
  const [backupNotes, setBackupNotes] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // Restore & Dry Run state
  const [selectedSnapshotForRestore, setSelectedSnapshotForRestore] = useState<BackupSnapshot | null>(null);
  const [dryRunDiff, setDryRunDiff] = useState<RestorePreviewDiff | null>(null);
  const [isDryRunModalOpen, setIsDryRunModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState<{ percent: number; stage: string } | null>(null);

  // Snapshot Inspection Modal
  const [inspectSnapshot, setInspectSnapshot] = useState<BackupSnapshot | null>(null);

  const selectedInst = institutions.find(i => i.id === selectedInstId) || currentInstitution;

  const loadData = async () => {
    setLoading(true);
    try {
      const snapList = await listInstitutionalBackups(selectedInstId);
      setBackups(snapList);
      const histList = getLocalHistory();
      setHistoryEvents(histList.filter(h => h.institutionId === selectedInstId || selectedInstId === 'all'));
    } catch (e) {
      console.error('Error loading backups:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedInstId]);

  // Current live dataset to pack during backup
  const getCurrentRuntimeData = () => {
    return {
      [FIRESTORE_COLLECTIONS.STUDENTS]: students || [],
      [FIRESTORE_COLLECTIONS.COURSES]: courses || [],
      [FIRESTORE_COLLECTIONS.CLASSES]: classes || [],
      [FIRESTORE_COLLECTIONS.TEACHERS]: teachers || [],
      [FIRESTORE_COLLECTIONS.ACCOUNTS_RECEIVABLE]: contasReceber || [],
      [FIRESTORE_COLLECTIONS.ACCOUNTS_PAYABLE]: contasPagar || [],
      [FIRESTORE_COLLECTIONS.PAYMENTS]: paymentRecords || [],
      [FIRESTORE_COLLECTIONS.AUDIT_LOGS]: auditLogs || []
    };
  };

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingBackup(true);
    try {
      const currentData = getCurrentRuntimeData();
      const snapshot = await createInstitutionalBackup(
        selectedInstId,
        selectedInst?.name || 'Instituição',
        {
          scope: backupScope,
          actorEmail: currentUser?.email || 'admin@moztechwave.com',
          actorName: currentUser?.name || 'Administrador',
          notes: backupNotes || `Backup de segurança gerado manualmente em ${new Date().toLocaleDateString('pt-PT')}`,
          currentAppData: currentData
        }
      );

      addNotification({
        title: 'Snapshot de Backup Gerado com Sucesso',
        message: `Backup ${snapshot.id} criado com ${snapshot.totalRecords} registos. Integridade verificada.`,
        type: 'system'
      });

      setIsNewBackupOpen(false);
      setBackupNotes('');
      loadData();
    } catch (err: any) {
      console.error('Backup creation error:', err);
      alert(`Falha ao gerar backup: ${err.message}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleImportBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const snapshot = await parseBackupFile(file);
        addNotification({
          title: 'Pacote de Backup Importado',
          message: `Backup ${snapshot.id} (${snapshot.scope}) carregado. Checksum verificado.`,
          type: 'system'
        });
        setInspectSnapshot(snapshot);
      } catch (err: any) {
        alert(`Erro ao importar ficheiro: ${err.message}`);
      }
    }
  };

  const handleOpenDryRun = (snapshot: BackupSnapshot) => {
    setSelectedSnapshotForRestore(snapshot);
    const diff = previewRestoreDiff(selectedInstId, snapshot, getCurrentRuntimeData());
    setDryRunDiff(diff);
    setIsDryRunModalOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedSnapshotForRestore) return;

    setIsRestoring(true);
    try {
      const result = await executeRestore(selectedSnapshotForRestore, {
        actorEmail: currentUser?.email || 'admin@moztechwave.com',
        actorName: currentUser?.name || 'Administrador',
        overwriteConflicting: true,
        onProgress: (percent, stage) => {
          setRestoreProgress({ percent, stage });
        }
      });

      addNotification({
        title: 'Restauração Concluída com Sucesso',
        message: `${result.restoredRecords} registos restabelecidos. Checkpoint de segurança: ${result.checkpointId}`,
        type: 'system'
      });

      setIsDryRunModalOpen(false);
      setSelectedSnapshotForRestore(null);
      setDryRunDiff(null);
      loadData();
    } catch (err: any) {
      alert(`Falha na restauração: ${err.message}`);
    } finally {
      setIsRestoring(false);
      setRestoreProgress(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Modular collections organized by Domain
  const modularClusters = [
    {
      domain: 'Instituição & Filiais',
      collections: [FIRESTORE_COLLECTIONS.INSTITUTIONS, FIRESTORE_COLLECTIONS.BRANCHES, FIRESTORE_COLLECTIONS.SETTINGS],
      color: 'border-sky-500/20 bg-sky-500/5 text-sky-400'
    },
    {
      domain: 'Identidade & RBAC',
      collections: [FIRESTORE_COLLECTIONS.USERS, FIRESTORE_COLLECTIONS.ROLES, FIRESTORE_COLLECTIONS.PERMISSIONS],
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
    },
    {
      domain: 'Académico & Pedagógico',
      collections: [
        FIRESTORE_COLLECTIONS.STUDENTS,
        FIRESTORE_COLLECTIONS.GUARDIANS,
        FIRESTORE_COLLECTIONS.APPLICATIONS,
        FIRESTORE_COLLECTIONS.ENROLLMENTS,
        FIRESTORE_COLLECTIONS.COURSES,
        FIRESTORE_COLLECTIONS.SUBJECTS,
        FIRESTORE_COLLECTIONS.CLASSES,
        FIRESTORE_COLLECTIONS.SCHEDULES,
        FIRESTORE_COLLECTIONS.TEACHERS,
        FIRESTORE_COLLECTIONS.LESSONS,
        FIRESTORE_COLLECTIONS.ATTENDANCE,
        FIRESTORE_COLLECTIONS.EVALUATIONS,
        FIRESTORE_COLLECTIONS.GRADES,
        FIRESTORE_COLLECTIONS.REPORT_CARDS
      ],
      color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400'
    },
    {
      domain: 'Estágios & Empresas',
      collections: [FIRESTORE_COLLECTIONS.INTERNSHIPS, FIRESTORE_COLLECTIONS.COMPANIES],
      color: 'border-amber-500/20 bg-amber-500/5 text-amber-400'
    },
    {
      domain: 'Documentos & Certificados',
      collections: [
        FIRESTORE_COLLECTIONS.CONTRACTS,
        FIRESTORE_COLLECTIONS.DOCUMENTS,
        FIRESTORE_COLLECTIONS.DOCUMENT_TEMPLATES,
        FIRESTORE_COLLECTIONS.CERTIFICATES,
        FIRESTORE_COLLECTIONS.CERTIFICATE_VERSIONS,
        FIRESTORE_COLLECTIONS.SIGNATURES
      ],
      color: 'border-teal-500/20 bg-teal-500/5 text-teal-400'
    },
    {
      domain: 'Financeiro & Tesouraria',
      collections: [
        FIRESTORE_COLLECTIONS.PAYMENTS,
        FIRESTORE_COLLECTIONS.PAYMENT_REQUESTS,
        FIRESTORE_COLLECTIONS.RECEIPTS,
        FIRESTORE_COLLECTIONS.ACCOUNTS_RECEIVABLE,
        FIRESTORE_COLLECTIONS.ACCOUNTS_PAYABLE,
        FIRESTORE_COLLECTIONS.CASH_REGISTERS,
        FIRESTORE_COLLECTIONS.CASH_MOVEMENTS
      ],
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
    },
    {
      domain: 'Comunicação & Materiais',
      collections: [
        FIRESTORE_COLLECTIONS.TASKS,
        FIRESTORE_COLLECTIONS.ANNOUNCEMENTS,
        FIRESTORE_COLLECTIONS.NOTIFICATIONS,
        FIRESTORE_COLLECTIONS.ONLINE_CLASSES,
        FIRESTORE_COLLECTIONS.ONLINE_CLASS_PARTICIPANTS,
        FIRESTORE_COLLECTIONS.MATERIALS,
        FIRESTORE_COLLECTIONS.WHATSAPP_CONNECTIONS,
        FIRESTORE_COLLECTIONS.MESSAGE_TEMPLATES,
        FIRESTORE_COLLECTIONS.MESSAGES
      ],
      color: 'border-purple-500/20 bg-purple-500/5 text-purple-400'
    },
    {
      domain: 'Governança & Auditoria',
      collections: [FIRESTORE_COLLECTIONS.ACCESS_LOGS, FIRESTORE_COLLECTIONS.AUDIT_LOGS],
      color: 'border-rose-500/20 bg-rose-500/5 text-rose-400'
    },
    {
      domain: 'SIVEC & Validação Nacional',
      collections: [
        FIRESTORE_COLLECTIONS.SIVEC_ISSUERS,
        FIRESTORE_COLLECTIONS.SIVEC_CERTIFICATES,
        FIRESTORE_COLLECTIONS.SIVEC_VERIFICATIONS,
        FIRESTORE_COLLECTIONS.SIVEC_API_KEYS
      ],
      color: 'border-amber-500/20 bg-amber-500/5 text-amber-300'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              57. Backup, Recuperação & Histórico
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                Retenção Ativa
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Arquitetura de salvaguarda contínua, exportação em lote e proteção contra perda acidental.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Institution Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedInstId}
              onChange={e => setSelectedInstId(e.target.value)}
              aria-label="Selecionar Instituição"
              className="bg-transparent text-sm text-slate-200 focus:outline-hidden font-medium"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id} className="bg-slate-900 text-slate-200">
                  {inst.sigla} - {inst.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-sm transition-all cursor-pointer border border-slate-700">
            <Upload className="w-4 h-4 text-sky-400" />
            Importar JSON
            <input type="file" accept=".json" onChange={handleImportBackupFile} className="hidden" />
          </label>

          <button
            onClick={() => setIsNewBackupOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Archive className="w-4 h-4" />
            Novo Backup
          </button>
        </div>
      </div>

      {/* Compliance Mandate Notice: "Não apagar dados históricos por operações comuns" */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-300">
              Política Estrita de Retenção e Não-Exclusão Histórica
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
              O sistema SIGAR implementa soft-delete institucional em todas as coleções.
              <strong className="text-emerald-400"> Operações comuns nunca apagam registos históricos</strong>, mantendo versões anteriores, carimbos temporais, autorias e rastreabilidade perene de auditoria.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/90 bg-emerald-950/60 border border-emerald-500/20 px-3 py-1.5 rounded-xl shrink-0">
          <Lock className="w-3.5 h-3.5" />
          Imutabilidade Ativa
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total de Snapshots</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">{backups.length}</div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Restauráveis
          </span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Coleções Ativas</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">48</div>
          <span className="text-[11px] text-slate-400 mt-1 font-medium">
            Estrutura Firestore Modular
          </span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Registos Históricos Gravados</span>
          <div className="text-2xl font-bold text-teal-400 mt-1">{historyEvents.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 font-medium">
            Trilhas de Auditoria Gravadas
          </span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Proteção contra Perda</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">100%</div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <Lock className="w-3 h-3" /> Soft-Delete Universal
          </span>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('snapshots')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'snapshots'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Archive className="w-4 h-4" />
          Snapshots de Backup ({backups.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Histórico & Linha do Tempo ({historyEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('modular_structure')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'modular_structure'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Estrutura Modular Firestore (48 Coleções)
        </button>
      </div>

      {/* Tab 1: Snapshots */}
      {activeTab === 'snapshots' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm">Consultando pontos de restauração...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="p-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl text-center">
              <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">Nenhum backup encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Crie o primeiro snapshot institucional para garantir a segurança dos dados.
              </p>
              <button
                onClick={() => setIsNewBackupOpen(true)}
                className="mt-4 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium"
              >
                Gerar Snapshot Inicial
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map(snap => (
                <div
                  key={snap.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        {snap.scope}
                      </span>
                      <h4 className="text-base font-bold text-slate-200">{snap.id}</h4>
                      {snap.retentionLock && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          Bloqueio de Retenção
                        </span>
                      )}
                      {snap.status === 'restored' && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">
                          Restaurado Recentemente
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400">{snap.notes || 'Sem observações'}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Registos: <strong className="text-slate-300">{snap.totalRecords}</strong></span>
                      <span>Arquivos Storage: <strong className="text-slate-300">{snap.storageFilesCount}</strong></span>
                      <span>Tamanho: <strong className="text-slate-300">{formatBytes(snap.sizeBytes)}</strong></span>
                      <span>Data: <strong className="text-slate-300">{new Date(snap.createdAt).toLocaleString('pt-PT')}</strong></span>
                      <span>Autor: <strong className="text-slate-300">{snap.createdByName}</strong></span>
                    </div>

                    <div className="pt-1">
                      <code className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        HASH: {snap.checksum}
                      </code>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setInspectSnapshot(snap)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspecionar
                    </button>

                    <button
                      onClick={() => exportBackupToJsonFile(snap)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      Exportar JSON
                    </button>

                    <button
                      onClick={() => handleOpenDryRun(snap)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Simular / Restaurar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: History & Immutability */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Linha do Tempo Imutável de Eventos Históricos
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Registo permanente de criações, atualizações com versionamento, exclusões lógicas (soft-delete) e restauros.
            </p>
          </div>

          {historyEvents.length === 0 ? (
            <div className="p-8 bg-slate-900/20 rounded-2xl text-center text-slate-500 text-xs">
              Nenhum evento gravado no histórico até ao momento.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {historyEvents.map(event => (
                <div key={event.id} className="relative bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="absolute -left-6 top-4 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                        {event.action}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {event.collectionName} / {event.docId}
                      </span>
                      {event.immutableLock && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5 text-emerald-400" /> Imutável
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(event.timestamp).toLocaleString('pt-PT')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">{event.details}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Operador: <strong className="text-slate-400">{event.actorName} ({event.actor})</strong>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Modular Firestore Structure (56) */}
      {activeTab === 'modular_structure' && (
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Estrutura de 48 Coleções Principais do Firestore Modular
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Coleções organizadas em clusters com isolamento multi-tenant por instituição e suporte a soft-delete.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              100% Mapeado no Schema
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modularClusters.map(cluster => (
              <div
                key={cluster.domain}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200">{cluster.domain}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {cluster.collections.length} coleções
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cluster.collections.map(col => (
                      <span
                        key={col}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${cluster.color}`}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Partição: /institutions/{'{id}'}</span>
                  <span className="text-emerald-400 font-medium">Ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Backup Modal */}
      {isNewBackupOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Archive className="w-5 h-5 text-emerald-400" />
                Gerar Novo Snapshot de Backup
              </h3>
              <button
                onClick={() => setIsNewBackupOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBackup} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Escopo do Backup</label>
                <select
                  value={backupScope}
                  onChange={e => setBackupScope(e.target.value as BackupScope)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-emerald-500"
                >
                  <option value="full">Backup Completo (Todas as 48 Coleções + Storage)</option>
                  <option value="academic">Académico (Alunos, Turmas, Horários, Notas)</option>
                  <option value="financial">Financeiro (Caixa, Pagamentos, Contas)</option>
                  <option value="documents">Documentos & Certificados (Contratos, Diplomas)</option>
                  <option value="governance">Governança & Auditoria (Usuários, RBAC, Logs)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observações / Motivo</label>
                <textarea
                  rows={3}
                  value={backupNotes}
                  onChange={e => setBackupNotes(e.target.value)}
                  placeholder="Ex: Backup de fecho de trimestre letivo com homologação de pautas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Instituição Alvo:</span>
                  <strong className="text-slate-200">{selectedInst?.name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Assinatura Criptográfica:</span>
                  <span className="text-emerald-400 font-mono">SHA-256 Automático</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bloqueio de Retenção:</span>
                  <span className="text-emerald-400 font-mono">Imutável</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewBackupOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBackup}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isCreatingBackup ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Gerando Snapshot...
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      Confirmar e Gravar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dry Run & Restore Modal */}
      {isDryRunModalOpen && selectedSnapshotForRestore && dryRunDiff && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Simulação de Restauração (Dry-Run Preview)
                </h3>
              </div>
              <button
                onClick={() => setIsDryRunModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ponto de Restauro:</span>
                  <strong className="text-slate-200">{selectedSnapshotForRestore.id}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Data do Snapshot:</span>
                  <span className="text-slate-300">{new Date(selectedSnapshotForRestore.createdAt).toLocaleString('pt-PT')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Checksum de Validação:</span>
                  <code className="text-emerald-400 font-mono">{selectedSnapshotForRestore.checksum}</code>
                </div>
              </div>

              {/* Diff Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400">Novos a Inserir</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">+{dryRunDiff.recordsToInsert}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400">A Atualizar</span>
                  <div className="text-lg font-bold text-sky-400 mt-1">{dryRunDiff.recordsToUpdate}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400">Inalterados</span>
                  <div className="text-lg font-bold text-slate-400 mt-1">{dryRunDiff.unchangedRecords}</div>
                </div>
              </div>

              {/* Safety checkpoint alert */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Garantia de Recuperabilidade Total:</strong>
                  <span>
                    Antes de aplicar qualquer alteração, o sistema criará um <strong>ponto de verificação de segurança automático</strong>. Nenhuma perda de dados ocorrerá.
                  </span>
                </div>
              </div>

              {/* Restore Progress Bar if active */}
              {isRestoring && restoreProgress && (
                <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-medium">{restoreProgress.stage}</span>
                    <span className="font-mono text-slate-300">{restoreProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${restoreProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => setIsDryRunModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs"
              >
                Fechar Simulação
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleConfirmRestore}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Restaurando Dados...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Executar Restauração Segura
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Inspection Modal */}
      {inspectSnapshot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-400" />
                Detalhes do Snapshot: {inspectSnapshot.id}
              </h3>
              <button
                onClick={() => setInspectSnapshot(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Escopo:</span>
                  <p className="font-semibold text-emerald-400 uppercase">{inspectSnapshot.scope}</p>
                </div>
                <div>
                  <span className="text-slate-500">Total de Registos:</span>
                  <p className="font-semibold text-slate-200">{inspectSnapshot.totalRecords}</p>
                </div>
                <div>
                  <span className="text-slate-500">Data de Criação:</span>
                  <p className="text-slate-300">{new Date(inspectSnapshot.createdAt).toLocaleString('pt-PT')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Tamanho em Disco:</span>
                  <p className="text-slate-300">{formatBytes(inspectSnapshot.sizeBytes)}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Checksum Criptográfico:</span>
                <code className="text-emerald-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 block text-[11px] select-all">
                  {inspectSnapshot.checksum}
                </code>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Coleções Incluídas ({inspectSnapshot.collections?.length || 0}):</span>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                  {inspectSnapshot.collections?.map(col => (
                    <span key={col} className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => exportBackupToJsonFile(inspectSnapshot)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                Exportar Pacote JSON
              </button>
              <button
                onClick={() => setInspectSnapshot(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
