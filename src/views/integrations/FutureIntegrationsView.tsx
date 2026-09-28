import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Smartphone, 
  CreditCard, 
  Landmark, 
  MessageSquare, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Copy, 
  Check, 
  Sliders, 
  Zap, 
  ExternalLink, 
  Play, 
  Lock, 
  Eye, 
  EyeOff, 
  Clock, 
  Activity, 
  X,
  Server,
  Database,
  Send,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  IntegrationCategory, 
  AnyIntegrationConfig, 
  IntegrationLog, 
  InstitutionIntegrationsMap 
} from '../../types/integrations';
import { IntegrationsService, TestResult } from '../../services/integrationsService';

type FilterTab = 'all' | 'finance' | 'communication' | 'sso' | 'academic';

export const FutureIntegrationsView: React.FC = () => {
  const { activeInstitution } = useApp();
  const instId = activeInstitution?.id || 'inst-1';

  const [integrationsData, setIntegrationsData] = useState<InstitutionIntegrationsMap>(() => 
    IntegrationsService.getIntegrations(instId)
  );
  const [logs, setLogs] = useState<IntegrationLog[]>(() => IntegrationsService.getLogs());
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('all');
  const [activeModalConfig, setActiveModalConfig] = useState<AnyIntegrationConfig | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'config' | 'test' | 'docs' | 'logs'>('config');
  
  // Test execution state
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<TestResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable config in modal
  const [editableConfig, setEditableConfig] = useState<AnyIntegrationConfig | null>(null);

  useEffect(() => {
    const data = IntegrationsService.getIntegrations(instId);
    setIntegrationsData(data);
    setLogs(IntegrationsService.getLogs());
  }, [instId]);

  const handleOpenConfig = (config: AnyIntegrationConfig) => {
    setActiveModalConfig(config);
    setEditableConfig(JSON.parse(JSON.stringify(config)));
    setActiveModalTab('config');
    setLastTestResult(null);
    setSaveSuccess(false);
  };

  const handleCloseModal = () => {
    setActiveModalConfig(null);
    setEditableConfig(null);
    setLastTestResult(null);
  };

  const handleRunTest = async (configToTest?: AnyIntegrationConfig) => {
    const target = configToTest || editableConfig || activeModalConfig;
    if (!target) return;
    
    setIsTesting(true);
    setLastTestResult(null);
    try {
      const result = await IntegrationsService.testConnection(target.category, target);
      setLastTestResult(result);
      // Refresh logs & current data
      setLogs(IntegrationsService.getLogs());
      setIntegrationsData(IntegrationsService.getIntegrations(instId));
    } catch (e) {
      console.error('Error testing connection', e);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    if (!editableConfig) return;
    const updated = IntegrationsService.updateIntegration(instId, editableConfig.category, editableConfig);
    setIntegrationsData(updated);
    setActiveModalConfig(editableConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const configsList = Object.values(integrationsData.configs);

  const filteredConfigs = configsList.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'finance') return ['mpesa', 'emola', 'bancos'].includes(item.category);
    if (selectedFilter === 'communication') return ['whatsapp', 'email', 'sms'].includes(item.category);
    if (selectedFilter === 'sso') return ['google', 'microsoft'].includes(item.category);
    if (selectedFilter === 'academic') return ['sistemas_externos', 'sivec_api'].includes(item.category);
    return true;
  });

  const getCategoryIcon = (category: IntegrationCategory) => {
    switch (category) {
      case 'mpesa':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'emola':
        return <CreditCard className="w-5 h-5 text-amber-400" />;
      case 'bancos':
        return <Landmark className="w-5 h-5 text-sky-400" />;
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'email':
        return <Mail className="w-5 h-5 text-indigo-400" />;
      case 'sms':
        return <Phone className="w-5 h-5 text-cyan-400" />;
      case 'google':
        return <Globe className="w-5 h-5 text-red-400" />;
      case 'microsoft':
        return <Server className="w-5 h-5 text-blue-400" />;
      case 'sistemas_externos':
        return <Database className="w-5 h-5 text-purple-400" />;
      case 'sivec_api':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'sandbox':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'testing':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold tracking-wider uppercase border border-indigo-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Módulo 64: Arquitetura Aberta
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
                {activeInstitution?.name || 'Centro de Formação'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Hub de Integrações Futuras</span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                10 Conectores Prontos
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Infraestrutura preparada com endpoints REST, Webhooks IPN, barramento de mensageria e adaptadores de interoperabilidade para carteiras móveis moçambicanas, rede bancária, mensageria e certificação governamental SIVEC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setIntegrationsData(IntegrationsService.getIntegrations(instId));
                setLogs(IntegrationsService.getLogs());
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sincronizar Status</span>
            </button>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Conectores Ativos</div>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-baseline gap-1.5">
              <span>8 / 10</span>
              <span className="text-[10px] text-slate-500 font-normal">Homologados</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Ambientes Sandbox</div>
            <div className="text-xl font-black text-amber-400 mt-1 flex items-baseline gap-1.5">
              <span>2</span>
              <span className="text-[10px] text-slate-500 font-normal">Google &amp; MS</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Latência Média APIs</div>
            <div className="text-xl font-black text-sky-400 mt-1 flex items-baseline gap-1.5">
              <span>312 ms</span>
              <span className="text-[10px] text-slate-500 font-normal">Moçambique Edge</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Taxa de Sucesso Webhooks</div>
            <div className="text-xl font-black text-purple-400 mt-1 flex items-baseline gap-1.5">
              <span>99.9%</span>
              <span className="text-[10px] text-slate-500 font-normal">Zero falhas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Todas as 10 Integrações
        </button>
        <button
          onClick={() => setSelectedFilter('finance')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedFilter === 'finance'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>M-Pesa, e-Mola &amp; Bancos</span>
        </button>
        <button
          onClick={() => setSelectedFilter('communication')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedFilter === 'communication'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp, Email &amp; SMS</span>
        </button>
        <button
          onClick={() => setSelectedFilter('sso')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedFilter === 'sso'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Google &amp; Microsoft</span>
        </button>
        <button
          onClick={() => setSelectedFilter('academic')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedFilter === 'academic'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sistemas Académicos &amp; SIVEC</span>
        </button>
      </div>

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConfigs.map((config) => {
          return (
            <div
              key={config.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-inner">
                      {getCategoryIcon(config.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight group-hover:text-indigo-300 transition-colors">
                        {config.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getBadgeColor(config.status)}`}>
                          {config.status === 'connected' ? 'Conectado' : config.status === 'sandbox' ? 'Sandbox Ativo' : 'Pendente'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {config.environment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {config.description}
                </p>

                {/* Specific Parameter Highlights */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1 font-mono">
                  {config.category === 'mpesa' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Shortcode C2B:</span>
                      <span className="text-emerald-400 font-bold">{(config as any).shortCode}</span>
                    </div>
                  )}
                  {config.category === 'emola' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Merchant ID:</span>
                      <span className="text-amber-400 font-bold">{(config as any).merchantId}</span>
                    </div>
                  )}
                  {config.category === 'bancos' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Conexão:</span>
                      <span className="text-sky-400 font-bold">BIM &bull; Standard &bull; BCI</span>
                    </div>
                  )}
                  {config.category === 'whatsapp' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Instância:</span>
                      <span className="text-emerald-400 font-bold">{(config as any).instanceName}</span>
                    </div>
                  )}
                  {config.category === 'email' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Remetente:</span>
                      <span className="text-indigo-400 font-bold">{(config as any).fromEmail}</span>
                    </div>
                  )}
                  {config.category === 'sms' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Saldo Créditos:</span>
                      <span className="text-cyan-400 font-bold">{(config as any).availableCredits} SMS</span>
                    </div>
                  )}
                  {config.category === 'google' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Domínio Google:</span>
                      <span className="text-red-400 font-bold">{(config as any).hostedDomain}</span>
                    </div>
                  )}
                  {config.category === 'microsoft' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Microsoft Teams:</span>
                      <span className="text-blue-400 font-bold">Aulas &bull; OneDrive</span>
                    </div>
                  )}
                  {config.category === 'sistemas_externos' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Padrão Sync:</span>
                      <span className="text-purple-400 font-bold">SIGAR &bull; LTI 1.3</span>
                    </div>
                  )}
                  {config.category === 'sivec_api' && (
                    <div className="text-slate-300 flex justify-between">
                      <span className="text-slate-500">Centro ANEP:</span>
                      <span className="text-emerald-400 font-bold">{(config as any).nationalCenterCode}</span>
                    </div>
                  )}
                  <div className="text-slate-400 text-[10px] flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Último teste:
                    </span>
                    <span>
                      {config.lastTestedAt 
                        ? new Date(config.lastTestedAt).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
                        : 'Nunca'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleRunTest(config)}
                  disabled={isTesting}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>Testar Ping</span>
                </button>
                <button
                  onClick={() => handleOpenConfig(config)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configurar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Activity Logs Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Log de Tráfego e Webhooks em Tempo Real</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Últimas {logs.length} requisições capturadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Integração</th>
                <th className="py-2.5 px-3">Ação / Endpoint</th>
                <th className="py-2.5 px-3">Detalhes do Payload</th>
                <th className="py-2.5 px-3 text-right">Latência</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.slice(0, 6).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString('pt-MZ')}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-300">
                    {log.category.toUpperCase()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-md font-sans">
                    {log.payloadSummary}
                  </td>
                  <td className="py-2.5 px-3 text-right text-sky-400">
                    {log.latencyMs} ms
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {log.statusCode || 200} OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / INSPECTOR FOR SPECIFIC CONNECTOR */}
      {activeModalConfig && editableConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {getCategoryIcon(editableConfig.category)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{editableConfig.name}</h2>
                  <p className="text-xs text-slate-400">{editableConfig.description}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900 text-xs font-bold">
              <button
                onClick={() => setActiveModalTab('config')}
                className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'config'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Parâmetros &amp; Credenciais
              </button>
              <button
                onClick={() => setActiveModalTab('test')}
                className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'test'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Simulador &amp; Teste ao Vivo
              </button>
              <button
                onClick={() => setActiveModalTab('docs')}
                className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
                  activeModalTab === 'docs'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Documentação &amp; Webhook cURL
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* TAB 1: CONFIG & CREDENTIALS */}
              {activeModalTab === 'config' && (
                <div className="space-y-4">
                  {saveSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Configurações salvas e aplicadas para esta instituição!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Ambiente</label>
                      <select
                        value={editableConfig.environment}
                        onChange={(e) => setEditableConfig({
                          ...editableConfig,
                          environment: e.target.value as 'sandbox' | 'production'
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-indigo-500 outline-none"
                      >
                        <option value="sandbox">Sandbox (Ambiente de Testes)</option>
                        <option value="production">Produção (Live)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Status da Integração</label>
                      <select
                        value={editableConfig.status}
                        onChange={(e) => setEditableConfig({
                          ...editableConfig,
                          status: e.target.value as any
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-indigo-500 outline-none"
                      >
                        <option value="connected">Conectado (Ativo)</option>
                        <option value="sandbox">Sandbox</option>
                        <option value="disconnected">Desconectado</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Fields per Category */}
                  {editableConfig.category === 'mpesa' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">ShortCode Vodacom C2B</label>
                          <input
                            type="text"
                            value={(editableConfig as any).shortCode || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, shortCode: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Consumer Key</label>
                          <input
                            type="text"
                            value={(editableConfig as any).consumerKey || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, consumerKey: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">API Key Vodacom OpenAPI</label>
                        <div className="relative">
                          <input
                            type={showSecrets['apiKey'] ? 'text' : 'password'}
                            value={(editableConfig as any).apiKey || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, apiKey: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecret('apiKey')}
                            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                          >
                            {showSecrets['apiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(editableConfig as any).autoReconciliation ?? true}
                            onChange={(e) => setEditableConfig({ ...editableConfig, autoReconciliation: e.target.checked } as any)}
                            className="rounded bg-slate-950 border-slate-800 text-indigo-600"
                          />
                          <span>Conciliação Automática de Propinas</span>
                        </label>
                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(editableConfig as any).c2bEnabled ?? true}
                            onChange={(e) => setEditableConfig({ ...editableConfig, c2bEnabled: e.target.checked } as any)}
                            className="rounded bg-slate-950 border-slate-800 text-indigo-600"
                          />
                          <span>STK Push (Cobrança no celular do aluno)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {editableConfig.category === 'emola' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Merchant ID Movitel</label>
                          <input
                            type="text"
                            value={(editableConfig as any).merchantId || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, merchantId: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Service ID</label>
                          <input
                            type="text"
                            value={(editableConfig as any).serviceId || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, serviceId: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Endpoint URL API</label>
                        <input
                          type="text"
                          value={(editableConfig as any).endpointUrl || ''}
                          onChange={(e) => setEditableConfig({ ...editableConfig, endpointUrl: e.target.value } as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {editableConfig.category === 'bancos' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Método de Conexão Bancária</label>
                          <select
                            value={(editableConfig as any).connectionMethod || 'open_banking_api'}
                            onChange={(e) => setEditableConfig({ ...editableConfig, connectionMethod: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          >
                            <option value="open_banking_api">Open Banking API (Directo)</option>
                            <option value="sftp_host_to_host">Host-to-Host SFTP Seguro</option>
                            <option value="mt940_parser">Parser MT940 &bull; CAMT.053 ISO 20022</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Servidor SFTP Extratos</label>
                          <input
                            type="text"
                            value={(editableConfig as any).sftpHost || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, sftpHost: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editableConfig.category === 'whatsapp' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Nome da Instância</label>
                          <input
                            type="text"
                            value={(editableConfig as any).instanceName || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, instanceName: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Gateway Provider</label>
                          <select
                            value={(editableConfig as any).provider || 'evolution_api'}
                            onChange={(e) => setEditableConfig({ ...editableConfig, provider: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          >
                            <option value="evolution_api">Evolution API (Recomendado)</option>
                            <option value="meta_cloud_api">Meta WhatsApp Cloud API Oficial</option>
                            <option value="baileys_gateway">Baileys WebSocket Gateway</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {editableConfig.category === 'email' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">E-mail Remetente Autorizado</label>
                          <input
                            type="email"
                            value={(editableConfig as any).fromEmail || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, fromEmail: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Nome de Exibição</label>
                          <input
                            type="text"
                            value={(editableConfig as any).fromName || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, fromName: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editableConfig.category === 'sms' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Sender ID (Máx 11 Chars)</label>
                          <input
                            type="text"
                            value={(editableConfig as any).senderId || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, senderId: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Saldo de Créditos SMS</label>
                          <input
                            type="number"
                            value={(editableConfig as any).availableCredits || 0}
                            onChange={(e) => setEditableConfig({ ...editableConfig, availableCredits: Number(e.target.value) } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editableConfig.category === 'google' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">OAuth Client ID</label>
                          <input
                            type="text"
                            value={(editableConfig as any).clientId || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, clientId: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Domínio Institucional Restrito</label>
                          <input
                            type="text"
                            value={(editableConfig as any).hostedDomain || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, hostedDomain: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editableConfig.category === 'microsoft' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Azure Tenant ID</label>
                          <input
                            type="text"
                            value={(editableConfig as any).tenantId || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, tenantId: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Application (Client) ID</label>
                          <input
                            type="text"
                            value={(editableConfig as any).clientId || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, clientId: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editableConfig.category === 'sistemas_externos' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Sistema Conectado</label>
                          <select
                            value={(editableConfig as any).systemType || 'sigar'}
                            onChange={(e) => setEditableConfig({ ...editableConfig, systemType: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          >
                            <option value="sigar">SIGAR (Governamental)</option>
                            <option value="softgenial">SoftGenial Escolar</option>
                            <option value="moodle">Moodle LMS</option>
                            <option value="lti_1_3">LTI 1.3 Interoperability</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Endpoint API</label>
                          <input
                            type="text"
                            value={(editableConfig as any).apiEndpoint || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, apiEndpoint: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editableConfig.category === 'sivec_api' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Código de Centro Nacional ANEP/DINET</label>
                          <input
                            type="text"
                            value={(editableConfig as any).nationalCenterCode || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, nationalCenterCode: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Thumbprint Certificado Digital</label>
                          <input
                            type="text"
                            value={(editableConfig as any).digitalCertificateThumbprint || ''}
                            onChange={(e) => setEditableConfig({ ...editableConfig, digitalCertificateThumbprint: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Webhook URL Endpoint */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-slate-400 font-semibold mb-1">Webhook IPN Callback Receptor</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={editableConfig.webhookUrl || `https://portal.moztechwave.co.mz/api/v1/webhooks/${editableConfig.category}/${instId}`}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(editableConfig.webhookUrl || '', 'whUrl')}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1 font-semibold"
                      >
                        {copiedKey === 'whUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveConfig}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20"
                    >
                      Salvar Configurações
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE SIMULATOR & TEST */}
              {activeModalTab === 'test' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">Disparar Teste de Conectividade</h4>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Envia um handshake de diagnóstico ao endpoint configurado e mede latência e status HTTP.
                      </p>
                    </div>
                    <button
                      onClick={() => handleRunTest()}
                      disabled={isTesting}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>{isTesting ? 'Executando...' : 'Executar Teste Agora'}</span>
                    </button>
                  </div>

                  {lastTestResult && (
                    <div className="space-y-3 animate-fade-in">
                      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                        lastTestResult.success 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          {lastTestResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                          <div>
                            <div className="font-bold text-sm text-white">{lastTestResult.message}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              Status: {lastTestResult.statusCode} OK &bull; Latência: {lastTestResult.latencyMs} ms &bull; Timestamp: {new Date(lastTestResult.timestamp).toLocaleTimeString('pt-MZ')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Response Payload Viewer */}
                      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                            Payload JSON Retornado pelo Gateway
                          </span>
                          <button
                            onClick={() => handleCopy(JSON.stringify(lastTestResult.responsePayload, null, 2), 'payload')}
                            className="hover:text-white flex items-center gap-1"
                          >
                            {copiedKey === 'payload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Copiar</span>
                          </button>
                        </div>
                        <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto">
                          {JSON.stringify(lastTestResult.responsePayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TECHNICAL DOCS & CURL */}
              {activeModalTab === 'docs' && (
                <div className="space-y-4">
                  {(() => {
                    const docs = IntegrationsService.getTechnicalDocs(editableConfig.category, editableConfig);
                    return (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <h4 className="font-bold text-white text-xs">{docs.title}</h4>
                          <p className="text-slate-400 text-[11px]">
                            Utilize o comando cURL ou os cabeçalhos abaixo para enviar payloads de teste via Postman, Insomnia ou diretamente do backend de parceiros.
                          </p>
                        </div>

                        {/* cURL Snippet */}
                        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                              Exemplo de Requisição cURL
                            </span>
                            <button
                              onClick={() => handleCopy(docs.curlExample, 'curl')}
                              className="hover:text-white flex items-center gap-1"
                            >
                              {copiedKey === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Copiar cURL</span>
                            </button>
                          </div>
                          <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                            {docs.curlExample}
                          </pre>
                        </div>

                        {/* Headers */}
                        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                            Cabeçalhos HTTP Obrigatórios
                          </div>
                          <div className="p-3 space-y-1.5 font-mono text-[11px]">
                            {Object.entries(docs.headers).map(([key, val]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-indigo-300 font-bold">{key}:</span>
                                <span className="text-slate-400">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
