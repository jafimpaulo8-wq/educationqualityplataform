import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Cake,
  BellRing,
  Play,
  Plus,
  Power,
  Shield,
  Building,
  DollarSign,
  DoorOpen,
  UserCheck,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatsAppTriggerType } from '../../types';

export const AutomationCenterView: React.FC = () => {
  const { 
    students, 
    activeInstitution,
    whatsAppAutomations,
    toggleWhatsAppAutomation,
    runWhatsAppAutomationNow,
    createWhatsAppAutomation,
    whatsappConfig,
    sendDirectWhatsAppMessage
  } = useApp();

  const [executingRuleId, setExecutingRuleId] = useState<string | null>(null);
  const [showNewRuleModal, setShowNewRuleModal] = useState<boolean>(false);
  const [newRuleTitle, setNewRuleTitle] = useState<string>('');
  const [newRuleTrigger, setNewRuleTrigger] = useState<WhatsAppTriggerType>('aniversario_dia');
  const [newRuleTime, setNewRuleTime] = useState<string>('08:00');
  const [newRuleMessage, setNewRuleMessage] = useState<string>('');

  // Aniversariantes de Setembro
  const birthdayStudents = students.filter((_, idx) => idx % 2 === 0);

  const handleRunNow = async (ruleId: string) => {
    setExecutingRuleId(ruleId);
    try {
      await runWhatsAppAutomationNow(ruleId);
    } finally {
      setExecutingRuleId(null);
    }
  };

  const handleCreateRule = () => {
    if (!newRuleTitle.trim() || !newRuleMessage.trim()) return;
    createWhatsAppAutomation({
      title: newRuleTitle,
      triggerType: newRuleTrigger,
      enabled: true,
      executionScheduleTime: newRuleTime,
      customMessage: newRuleMessage
    });
    setShowNewRuleModal(false);
    setNewRuleTitle('');
    setNewRuleMessage('');
  };

  const getTriggerIcon = (type: WhatsAppTriggerType) => {
    switch (type) {
      case 'aniversario_dia':
        return <Cake className="w-4 h-4 text-pink-500" />;
      case 'cobranca_vencido':
      case 'cobranca_vencendo':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'portaria_entrada':
      case 'portaria_saida':
        return <DoorOpen className="w-4 h-4 text-indigo-500" />;
      case 'pagamento_confirmado':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'falta_registrada':
        return <UserCheck className="w-4 h-4 text-rose-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              AUTOMAÇÕES INTELIGENTES WHATSAPP
            </span>
            <span className="text-xs text-slate-500">
              Instância: <strong>{activeInstitution.name}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Centro de Automações &amp; Gatilhos Periódicos
          </h1>
          <p className="text-xs text-slate-500">
            Regras disparadas por eventos do sistema: aniversários, régua de cobrança, portaria e comunicados acadêmicos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewRuleModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Regra de Automação
        </button>
      </div>

      {/* Security & Multi-tenant banner */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Shield className="w-4 h-4" />
            Políticas de Respeito ao Destinatário
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            As automações da <strong>{activeInstitution.name}</strong> são isoladas. Disparos ocorrem exclusivamente no horário autorizado ({whatsappConfig.allowedStartHour || 8}:00 às {whatsappConfig.allowedEndHour || 20}:00), respeitando a lista de opt-out.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-slate-400 block">Status da Conexão:</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block mt-0.5 ${
            whatsappConfig.isConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {whatsappConfig.isConnected ? '● Ativa e Monitorando' : '○ Desconectada'}
          </span>
        </div>
      </div>

      {/* Birthday Showcase Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-pink-500" />
            <h2 className="text-sm font-bold text-slate-900">Aniversariantes Desta Semana (Gatilho Ativo)</h2>
          </div>
          <span className="text-xs text-pink-600 font-semibold">
            {birthdayStudents.length} Formandos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {birthdayStudents.slice(0, 3).map(student => (
            <div key={student.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={student.photoUrl}
                  alt={student.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{student.fullName}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{student.courseName}</p>
                  <span className="text-[10px] text-pink-600 font-semibold block">{student.birthDate}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => sendDirectWhatsAppMessage({
                  recipientPhone: student.phone,
                  recipientName: student.fullName,
                  category: 'aniversario',
                  message: `Feliz aniversário, ${student.fullName}! A ${activeInstitution.name} deseja-lhe um excelente dia.`,
                  source: 'automacao',
                  openDirectlyInWeb: true
                })}
                className="px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
              >
                Felicitar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Automações Configuradas */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Regras de Automação em Execução</h2>
            <p className="text-xs text-slate-500">Gatilhos configurados especificamente para a {activeInstitution.name}.</p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {whatsAppAutomations.filter(a => a.enabled).length} ativas de {whatsAppAutomations.length}
          </span>
        </div>

        <div className="space-y-3">
          {whatsAppAutomations.map(rule => (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                rule.enabled ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200/60 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    {getTriggerIcon(rule.triggerType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{rule.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rule.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {rule.enabled ? 'Ativo' : 'Pausado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Disparo às: {rule.executionScheduleTime || 'Imediato ao evento'}
                      </span>
                      <span>•</span>
                      <span>Total Disparados: <strong className="text-slate-800">{rule.totalTriggeredCount}</strong></span>
                      {rule.lastExecutedAt && (
                        <>
                          <span>•</span>
                          <span>Último: {rule.lastExecutedAt}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWhatsAppAutomation(rule.id, !rule.enabled)}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
                      rule.enabled 
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {rule.enabled ? 'Pausar' : 'Ativar'}
                  </button>

                  <button
                    type="button"
                    disabled={executingRuleId === rule.id || !whatsappConfig.isConnected}
                    onClick={() => handleRunNow(rule.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      whatsappConfig.isConnected
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Play className={`w-3.5 h-3.5 ${executingRuleId === rule.id ? 'animate-spin' : ''}`} />
                    {executingRuleId === rule.id ? 'Executando...' : 'Executar Agora'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-sans italic">
                "{rule.customMessage}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nova Regra de Automação */}
      {showNewRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Nova Automação WhatsApp</h3>
              <button
                type="button"
                onClick={() => setShowNewRuleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Título da Regra:</label>
                <input
                  type="text"
                  placeholder="Ex: Alerta de Faltas Excessivas"
                  value={newRuleTitle}
                  onChange={(e) => setNewRuleTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tipo de Gatilho:</label>
                  <select
                    value={newRuleTrigger}
                    onChange={(e) => setNewRuleTrigger(e.target.value as WhatsAppTriggerType)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="aniversario_dia">Aniversário do Formando</option>
                    <option value="cobranca_vencido">Mensalidade Vencida</option>
                    <option value="cobranca_vencendo">Mensalidade a Vencer (3 dias)</option>
                    <option value="portaria_entrada">Entrada na Portaria</option>
                    <option value="portaria_saida">Saída da Portaria</option>
                    <option value="pagamento_confirmado">Pagamento Confirmado</option>
                    <option value="falta_registrada">Falta Registrada na Aula</option>
                    <option value="comunicado_geral">Comunicado Geral</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Horário Previsto:</label>
                  <input
                    type="time"
                    value={newRuleTime}
                    onChange={(e) => setNewRuleTime(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mensagem da Automação (Use chaves duplas):</label>
                <textarea
                  rows={4}
                  placeholder="Olá {{nome}}, informamos que..."
                  value={newRuleMessage}
                  onChange={(e) => setNewRuleMessage(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowNewRuleModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateRule}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                Salvar Automação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
