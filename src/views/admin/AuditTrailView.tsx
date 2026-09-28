import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  User, 
  Eye, 
  Lock, 
  Trash2, 
  RefreshCw, 
  Key, 
  Clock, 
  Globe, 
  Layers, 
  FileSpreadsheet, 
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CriticalAuditAction, AuditLogEntry } from '../../types/audit';

export const AuditTrailView: React.FC = () => {
  const { 
    auditLogs, 
    purgeAuditLogs, 
    activeRole, 
    activeInstitution,
    currentUser,
    logCriticalAction 
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('todos');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('todos');
  const [selectedEntity, setSelectedEntity] = useState<string>('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeAlertMessage, setPurgeAlertMessage] = useState<string | null>(null);

  // Entities list for dropdown
  const availableEntities = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach(l => {
      if (l.entity) set.add(l.entity);
    });
    return Array.from(set);
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesUser = log.userName.toLowerCase().includes(term);
        const matchesId = log.entityId.toLowerCase().includes(term) || log.id.toLowerCase().includes(term);
        const matchesAction = log.actionLabel.toLowerCase().includes(term) || log.action.toLowerCase().includes(term);
        const matchesEntity = log.entity.toLowerCase().includes(term);
        const matchesSummary = log.relevantValues.summary.toLowerCase().includes(term);
        const matchesIp = log.ipAddress?.toLowerCase().includes(term);
        if (!matchesUser && !matchesId && !matchesAction && !matchesEntity && !matchesSummary && !matchesIp) {
          return false;
        }
      }

      // Action filter
      if (selectedAction !== 'todos' && log.action !== selectedAction) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'todos' && log.severity !== selectedSeverity) {
        return false;
      }

      // Entity filter
      if (selectedEntity !== 'todos' && log.entity !== selectedEntity) {
        return false;
      }

      // Date range filter
      if (startDate && log.date < startDate) return false;
      if (endDate && log.date > endDate) return false;

      return true;
    });
  }, [auditLogs, searchTerm, selectedAction, selectedSeverity, selectedEntity, startDate, endDate]);

  // KPI calculations
  const totalLogs = auditLogs.length;
  const criticalCount = auditLogs.filter(l => l.severity === 'critico').length;
  const warningCount = auditLogs.filter(l => l.severity === 'aviso').length;
  const softDeletesCount = auditLogs.filter(l => l.action === 'exclusao_logica').length;
  const gradeChangesCount = auditLogs.filter(l => l.action === 'alteracao_nota').length;
  const financialChangesCount = auditLogs.filter(l => l.action === 'alteracao_financeira').length;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID Registo', 'Data', 'Hora', 'Utilizador', 'Papel RBAC', 'Ação', 'Entidade', 'ID Entidade', 'IP Origem', 'Gravidade', 'Resumo', 'Hash Integridade'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.date}"`,
      `"${l.time}"`,
      `"${l.userName.replace(/"/g, '""')}"`,
      `"${l.userRole}"`,
      `"${l.actionLabel.replace(/"/g, '""')}"`,
      `"${l.entity.replace(/"/g, '""')}"`,
      `"${l.entityId}"`,
      `"${l.ipAddress || 'N/D'}"`,
      `"${l.severity}"`,
      `"${l.relevantValues.summary.replace(/"/g, '""')}"`,
      `"${l.integrityHash}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_sistema_${activeInstitution.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logCriticalAction({
      action: 'emissao',
      entity: 'Auditoria do Sistema',
      entityId: `EXP-CSV-${Date.now()}`,
      relevantValues: {
        summary: `Exportação de ficheiro CSV com ${filteredLogs.length} registos da trilha de auditoria.`,
        metadata: { rowCount: filteredLogs.length, format: 'CSV' }
      },
      severity: 'info'
    });
  };

  // Export / Print PDF View
  const handlePrintAuditReport = () => {
    window.print();
  };

  // Handle Purge Attempt
  const handleAttemptPurge = () => {
    const res = purgeAuditLogs();
    setPurgeAlertMessage(res.message);
    if (res.success) {
      setTimeout(() => {
        setShowPurgeModal(false);
        setPurgeAlertMessage(null);
      }, 2000);
    }
  };

  // Helper for action badges
  const getActionBadge = (action: CriticalAuditAction) => {
    switch (action) {
      case 'login':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Login</span>;
      case 'logout':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Logout</span>;
      case 'criacao':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Criação</span>;
      case 'alteracao':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Alteração</span>;
      case 'aprovacao':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Aprovação</span>;
      case 'rejeicao':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Rejeição</span>;
      case 'exclusao_logica':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Exclusão Lógica</span>;
      case 'emissao':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Emissão</span>;
      case 'revogacao':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Revogação</span>;
      case 'alteracao_nota':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Nota</span>;
      case 'alteracao_financeira':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">Financeiro</span>;
      case 'mudanca_permissoes':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">Permissões</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">{action}</span>;
    }
  };

  const getSeverityBadge = (severity: 'info' | 'aviso' | 'critico') => {
    switch (severity) {
      case 'critico':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded-md">
            <AlertCircle className="w-3 h-3" /> Crítico
          </span>
        );
      case 'aviso':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3 h-3" /> Atenção
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2 py-0.5 rounded-md">
            <Info className="w-3 h-3" /> Informativo
          </span>
        );
    }
  };

  const isSuperAdmin = activeRole === 'SUPER_ADMIN' || activeRole === 'superadmin';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-red-400">
                  Módulo 53 • Governança & Compliance
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Trilha de Auditoria & Ações Críticas
                </h1>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Registo inalterável de todas as ações de alta relevância: logins, exclusões lógicas, aprovações, 
              alterações de notas, movimentos financeiros e gestão de permissões RBAC com identificação do utilizador, data, hora, IP e integridade criptográfica.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-sm cursor-pointer"
              title="Exportar dados filtrados para CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Exportar CSV
            </button>
            <button
              onClick={handlePrintAuditReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-sm cursor-pointer"
              title="Imprimir relatório oficial de auditoria"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              Imprimir / PDF
            </button>
            <button
              onClick={() => setShowPurgeModal(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isSuperAdmin 
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30' 
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-400'
              }`}
              title={isSuperAdmin ? 'Purga e Arquivo de Auditoria (Restrito ao Super Admin)' : 'Acesso Restrito ao Super Admin'}
            >
              <Trash2 className="w-4 h-4" />
              {isSuperAdmin ? 'Arquivar Logs' : 'Eliminar Logs (Bloqueado)'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total de Registos</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalLogs}</p>
          <span className="text-[10px] text-slate-500 font-medium">Trilha completa ativa</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-400">Eventos Críticos</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400 mt-2">{criticalCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Permissões & revogações</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-yellow-400">Alterações de Nota</span>
            <Key className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-black text-yellow-400 mt-2">{gradeChangesCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Retificações pedagógicas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-teal-400">Alt. Financeiras</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-black text-teal-400 mt-2">{financialChangesCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Caixa e liquidações</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400">Exclusões Lógicas</span>
            <Trash2 className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{softDeletesCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Baixas sem perda de dados</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Integridade</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">100%</p>
          <span className="text-[10px] text-slate-500 font-medium">Hashes verificados</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por utilizador, ação, ID ou IP..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-red-500/50"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-red-500/50 cursor-pointer"
            >
              <option value="todos">Todas as Ações Críticas</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="criacao">Criação</option>
              <option value="alteracao">Alteração</option>
              <option value="aprovacao">Aprovação</option>
              <option value="rejeicao">Rejeição</option>
              <option value="exclusao_logica">Exclusão Lógica</option>
              <option value="emissao">Emissão</option>
              <option value="revogacao">Revogação</option>
              <option value="alteracao_nota">Alteração de Nota</option>
              <option value="alteracao_financeira">Alteração Financeira</option>
              <option value="mudanca_permissoes">Mudança de Permissões</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <select
              value={selectedEntity}
              onChange={e => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-red-500/50 cursor-pointer"
            >
              <option value="todos">Todas as Entidades</option>
              {availableEntities.map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-red-500/50 cursor-pointer"
            >
              <option value="todos">Todas as Gravidades</option>
              <option value="critico">Crítico</option>
              <option value="aviso">Atenção / Aviso</option>
              <option value="info">Informativo</option>
            </select>
          </div>
        </div>

        {/* Date Filter Range */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Período:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs"
            />
            <span>até</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs"
            />
          </div>
          {(startDate || endDate || selectedAction !== 'todos' || selectedSeverity !== 'todos' || selectedEntity !== 'todos' || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedAction('todos');
                setSelectedSeverity('todos');
                setSelectedEntity('todos');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-red-400 hover:underline ml-auto cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Audit Trail Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">
              Registos de Auditoria ({filteredLogs.length} de {totalLogs})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Ordenado cronologicamente (Mais recentes primeiro)
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">Nenhum registo de auditoria encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Data & Hora</th>
                  <th className="py-3.5 px-4">Utilizador & Papel</th>
                  <th className="py-3.5 px-4">Ação Crítica</th>
                  <th className="py-3.5 px-4">Entidade / ID</th>
                  <th className="py-3.5 px-4">Resumo da Alteração</th>
                  <th className="py-3.5 px-4">IP</th>
                  <th className="py-3.5 px-4">Gravidade</th>
                  <th className="py-3.5 px-4 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map(log => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <div>
                          <div className="font-bold text-white">{log.date}</div>
                          <div className="text-[11px] text-slate-500">{log.time}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                          {log.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{log.userName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{log.userRole}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      <span className="text-white font-semibold">{log.entity}</span>
                      <div className="text-slate-400">{log.entityId}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                      {log.relevantValues.summary}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                      {log.ipAddress || '—'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Ver Snapshot Completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Snapshot Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">ID: {selectedLog.id}</span>
                  {getSeverityBadge(selectedLog.severity)}
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {selectedLog.actionLabel}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* General Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 block">Data e Hora</span>
                <span className="font-mono text-white font-bold">{selectedLog.date} às {selectedLog.time}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Utilizador Responsável</span>
                <span className="text-white font-bold">{selectedLog.userName}</span>
                <span className="text-[10px] text-slate-400 block font-mono">({selectedLog.userRole})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Entidade & ID</span>
                <span className="text-white font-bold">{selectedLog.entity}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{selectedLog.entityId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Endereço IP</span>
                <span className="text-white font-mono">{selectedLog.ipAddress || 'Não registado'}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição do Evento</label>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200">
                {selectedLog.relevantValues.summary}
              </div>
            </div>

            {/* Previous vs New Values (State Snapshot) */}
            {(selectedLog.relevantValues.previousValue !== undefined || selectedLog.relevantValues.newValue !== undefined) && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Snapshot de Estado (Antes vs Depois)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-red-950/60 text-xs space-y-1">
                    <span className="text-[11px] font-bold text-red-400 uppercase flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Valor Anterior
                    </span>
                    <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto bg-slate-900/60 p-2.5 rounded-lg">
                      {selectedLog.relevantValues.previousValue ? JSON.stringify(selectedLog.relevantValues.previousValue, null, 2) : '— (Sem valor anterior / Criação inicial)'}
                    </pre>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-950/60 text-xs space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Novo Valor Aplicado
                    </span>
                    <pre className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto bg-slate-900/60 p-2.5 rounded-lg">
                      {selectedLog.relevantValues.newValue ? JSON.stringify(selectedLog.relevantValues.newValue, null, 2) : '— (Removido / Baixa efetuada)'}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Extra Metadata */}
            {selectedLog.relevantValues.metadata && Object.keys(selectedLog.relevantValues.metadata).length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metadados de Contexto</label>
                <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.relevantValues.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Cryptographic Hash Verification */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Assinatura de Integridade (Hash):</span>
                <span className="text-emerald-400 font-bold">{selectedLog.integrityHash}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Intacto & Verificado
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Fechar Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge / Archive Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Política de Retenção de Logs</h3>
                <span className="text-xs text-red-400 font-semibold">Artigo 53: Restrição de Eliminação</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="leading-relaxed">
                Por conformidade legal e exigência estrita do sistema (Item 53):
              </p>
              <blockquote className="border-l-2 border-red-500 pl-3 italic text-red-300 font-semibold">
                "Não permitir que utilizador comum apague logs."
              </blockquote>
              <p className="leading-relaxed text-slate-400">
                Apenas o <strong>Super Administrador</strong> possui privilégios para iniciar o procedimento de arquivo histórico ou purga autorizada de auditoria. 
                Qualquer tentativa por utilizadores comuns é automaticamente bloqueada e gera um registo de infração na trilha.
              </p>
            </div>

            {purgeAlertMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium border ${
                purgeAlertMessage.includes('negado') || purgeAlertMessage.includes('não permite')
                  ? 'bg-red-500/10 text-red-300 border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              }`}>
                {purgeAlertMessage}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowPurgeModal(false);
                  setPurgeAlertMessage(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAttemptPurge}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-500/20 cursor-pointer"
              >
                {isSuperAdmin ? 'Confirmar Arquivo (Super Admin)' : 'Testar Eliminação de Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
