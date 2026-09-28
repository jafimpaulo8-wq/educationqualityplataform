import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  WhatsAppTemplateCategory, 
  WhatsAppMessageTemplate, 
  WhatsAppCampaign,
  WhatsAppTriggerType 
} from '../../types';
import { interpolateWhatsAppVariables } from '../../data/whatsappData';
import { 
  Smartphone, 
  QrCode, 
  Send, 
  Clock, 
  Calendar, 
  Cake, 
  AlertCircle, 
  CheckCircle, 
  CheckCircle2,
  RefreshCw, 
  MessageSquare, 
  User, 
  Building,
  DollarSign,
  FileText,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Plus,
  Trash2,
  Play,
  Copy,
  ExternalLink,
  Wifi,
  WifiOff,
  BatteryCharging,
  Battery,
  Paperclip,
  Ban,
  Check,
  Users,
  Search,
  BookOpen,
  BellRing,
  Key,
  Info
} from 'lucide-react';

export const WhatsAppCenterView: React.FC = () => {
  const { 
    whatsappConfig, 
    updateWhatsAppConfig, 
    students, 
    teachers,
    financialSettings, 
    activeInstitution,
    whatsAppTemplates,
    whatsAppCampaigns,
    whatsAppAutomations,
    whatsAppLogs,
    whatsAppConsents,
    sendDirectWhatsAppMessage,
    createWhatsAppTemplate,
    updateWhatsAppTemplate,
    deleteWhatsAppTemplate,
    createWhatsAppCampaign,
    executeWhatsAppCampaign,
    updateWhatsAppConsent,
    simulateWhatsAppPairing,
    disconnectWhatsAppDevice,
    openWhatsAppMessage
  } = useApp();

  type TabType = 'disparo' | 'cobranca' | 'aniversariantes' | 'templates' | 'campanhas' | 'instancia' | 'logs';
  const [activeTab, setActiveTab] = useState<TabType>('disparo');

  // Disparo Avulso State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [manualPhone, setManualPhone] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<WhatsAppTemplateCategory>('aviso');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageBody, setMessageBody] = useState<string>('');
  const [includeAttachment, setIncludeAttachment] = useState<boolean>(false);
  const [attachmentDocName, setAttachmentDocName] = useState<string>('Extrato_Financeiro_Setembro.pdf');
  const [openInWebOption, setOpenInWebOption] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Template Modal / Creation State
  const [showNewTemplateModal, setShowNewTemplateModal] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<WhatsAppTemplateCategory>('aviso');
  const [newTemplateBody, setNewTemplateBody] = useState<string>('');
  const [newTemplateHeader, setNewTemplateHeader] = useState<string>('');

  // Campanha Modal State
  const [showNewCampaignModal, setShowNewCampaignModal] = useState<boolean>(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState<string>('');
  const [newCampaignCategory, setNewCampaignCategory] = useState<WhatsAppTemplateCategory>('comunicacao_curso');
  const [newCampaignAudience, setNewCampaignAudience] = useState<'todos' | 'inadimplentes' | 'aniversariantes' | 'professores' | 'turma_especifica'>('todos');
  const [newCampaignMessage, setNewCampaignMessage] = useState<string>('');
  const [isExecutingCampaign, setIsExecutingCampaign] = useState<string | null>(null);

  // Pairing State
  const [pairingMethod, setPairingMethod] = useState<'qr' | 'code'>('qr');
  const [phoneForCode, setPhoneForCode] = useState<string>(whatsappConfig.phoneNumber || '+258 ');
  const [isPairingLoading, setIsPairingLoading] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  // Consent Filter & Search
  const [consentSearch, setConsentSearch] = useState<string>('');
  const [newOptOutPhone, setNewOptOutPhone] = useState<string>('');
  const [newOptOutName, setNewOptOutName] = useState<string>('');

  // Alunos em atraso para régua de cobrança
  const lateStudents = students.filter(s => s.paymentStatus === 'Atrasado' || s.paymentStatus === 'Pendente');

  // Aniversariantes de Setembro
  const birthdayStudents = students.filter((_, idx) => idx % 2 === 0);

  // Seletor de Aluno para preenchimento automático
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const st = students.find(s => s.id === studentId);
    if (st) {
      setManualName(st.fullName);
      setManualPhone(st.guardianPhone || st.phone);
      if (selectedTemplateId) {
        applyTemplate(selectedTemplateId, st);
      }
    }
  };

  // Aplica template ao corpo de mensagem
  const applyTemplate = (templateId: string, customStudent?: typeof students[0]) => {
    setSelectedTemplateId(templateId);
    const tmpl = whatsAppTemplates.find(t => t.id === templateId);
    if (!tmpl) return;

    setManualCategory(tmpl.category);
    const st = customStudent || students.find(s => s.id === selectedStudentId);
    const vars: Record<string, string> = {
      nome: st ? st.fullName : (manualName || 'Formando(a)'),
      instituicao: activeInstitution.name,
      curso: st ? st.courseName : 'Curso Técnico',
      turma: st ? (st.classGroupName || 'Laboral') : 'Laboral',
      valor: '4.500 MT',
      mes: 'Setembro/2026',
      hora: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      data: new Date().toLocaleDateString('pt-MZ'),
      documento: attachmentDocName,
      chave_pagamento: financialSettings.pixKey || activeInstitution.phone,
      telefone_instituicao: activeInstitution.phone
    };

    const interpolated = interpolateWhatsAppVariables(tmpl.body, vars);
    setMessageBody(interpolated);
  };

  // Disparo manual
  const handleSendDirectMessage = () => {
    setDispatchStatus(null);
    if (!manualPhone || manualPhone.trim().length < 8) {
      setDispatchStatus({ type: 'error', text: 'Informe um número de WhatsApp válido (+258...).' });
      return;
    }
    if (!messageBody.trim()) {
      setDispatchStatus({ type: 'error', text: 'O corpo da mensagem não pode estar vazio.' });
      return;
    }

    const res = sendDirectWhatsAppMessage({
      recipientPhone: manualPhone,
      recipientName: manualName || 'Destinatário',
      category: manualCategory,
      message: messageBody,
      source: 'manual',
      documentAttachment: includeAttachment ? {
        name: attachmentDocName,
        type: 'application/pdf',
        url: '#'
      } : undefined,
      openDirectlyInWeb: openInWebOption
    });

    if (res.success) {
      setDispatchStatus({ type: 'success', text: `Mensagem enviada com sucesso para ${manualPhone}!` });
      setMessageBody('');
      setSelectedTemplateId('');
    } else {
      setDispatchStatus({ type: 'error', text: res.error || 'Erro ao enviar mensagem.' });
    }
  };

  // Disparo de Cobrança Individual
  const handleSendIndividualCollection = (student: typeof students[0]) => {
    const daysLate = student.paymentStatus === 'Atrasado' ? 14 : 0;
    const fine = student.paymentStatus === 'Atrasado' ? financialSettings.fineAmount : 0;
    const interest = student.paymentStatus === 'Atrasado' ? (4500 * (financialSettings.interestRateDaily / 100) * daysLate) : 0;
    const totalDue = 4500 + fine + interest;

    const text = `Prezado(a) ${student.guardianName || student.fullName},\n\nInformamos que a mensalidade do formando *${student.fullName}* (${student.courseName}) referente a Setembro/2026 encontra-se pendente.\n\n• Valor Base: 4.500 MT\n• Multa/Juros: ${fine + interest} MT\n• *Total a Regularizar: ${totalDue.toLocaleString('pt-MZ')} MT*\n\nPagamento via M-Pesa / Conta: ${financialSettings.pixKey || activeInstitution.phone}\n\nAtenciosamente,\n*${activeInstitution.name}*`;

    sendDirectWhatsAppMessage({
      recipientPhone: student.guardianPhone || student.phone,
      recipientName: student.fullName,
      recipientType: 'aluno',
      category: 'cobranca',
      message: text,
      source: 'manual',
      openDirectlyInWeb: true
    });
  };

  // Disparo de Aniversário Individual
  const handleSendIndividualBirthday = (student: typeof students[0]) => {
    const text = `🎉 *Feliz Aniversário, ${student.fullName}!* 🎂\n\nA Direção e o corpo docente da *${activeInstitution.name}* felicitam-no pelo seu aniversário! Desejamos-lhe um excelente dia, com muita saúde, conhecimento e conquistas na sua formação em *${student.courseName}*! 🚀`;

    sendDirectWhatsAppMessage({
      recipientPhone: student.phone,
      recipientName: student.fullName,
      recipientType: 'aluno',
      category: 'aniversario',
      message: text,
      source: 'manual',
      openDirectlyInWeb: true
    });
  };

  // Execução de Campanha
  const handleExecuteCampaign = async (campaignId: string) => {
    setIsExecutingCampaign(campaignId);
    try {
      await executeWhatsAppCampaign(campaignId);
    } finally {
      setIsExecutingCampaign(null);
    }
  };

  // Criação de Template
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateBody.trim()) return;
    createWhatsAppTemplate({
      name: newTemplateName,
      category: newTemplateCategory,
      body: newTemplateBody,
      content: newTemplateBody,
      header: newTemplateHeader || undefined,
      variables: ['nome', 'instituicao', 'valor', 'curso']
    });
    setShowNewTemplateModal(false);
    setNewTemplateName('');
    setNewTemplateBody('');
    setNewTemplateHeader('');
  };

  // Pareamento QR Code ou Código
  const handleStartPairing = async (method: 'qr' | 'code') => {
    setIsPairingLoading(true);
    setGeneratedCode('');
    try {
      const res = await simulateWhatsAppPairing(method, phoneForCode);
      if (res.pairingCode) {
        setGeneratedCode(res.pairingCode);
      }
    } finally {
      setIsPairingLoading(false);
    }
  };

  const handleConfirmPairingCode = () => {
    updateWhatsAppConfig({
      isConnected: true,
      status: 'conectado',
      phoneNumber: phoneForCode,
      pairingCode: undefined,
      lastSync: 'Conectado agora'
    });
  };

  return (
    <div id="whatsapp-integration-center" className="space-y-6">
      {/* Top Banner Multi-Tenant & Security Notice */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-emerald-500/30 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold tracking-wide border border-emerald-500/40">
                MÓDULO 35 • WHATSAPP MULTI-TENANT
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                Instância Exclusiva: <strong className="text-emerald-300">{activeInstitution.name}</strong> ({activeInstitution.code})
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Camada de Integração & Mensageria WhatsApp
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Cada instituição possui conexão e número autorizados independentes. Não há mistura de canais entre instituições.
              Total conformidade com limites da Meta, delay anti-banimento (3s-8s) e consentimento/opt-out.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              whatsappConfig.isConnected 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {whatsappConfig.isConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold leading-tight">Instância Conectada</div>
                    <div className="text-[11px] font-mono text-emerald-200">{whatsappConfig.phoneNumber || activeInstitution.phone}</div>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-rose-400" />
                  <div>
                    <div className="text-xs font-bold leading-tight">Desconectada</div>
                    <div className="text-[11px] text-rose-200">Requer pareamento</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('disparo')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'disparo' ? 'bg-white shadow-xs text-slate-900 border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-emerald-600" />
          Enviar Mensagem
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cobranca')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'cobranca' ? 'bg-white shadow-xs text-slate-900 border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-600" />
          Régua de Cobrança ({lateStudents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aniversariantes')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'aniversariantes' ? 'bg-white shadow-xs text-slate-900 border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cake className="w-3.5 h-3.5 text-pink-500" />
          Aniversariantes ({birthdayStudents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'templates' ? 'bg-white shadow-xs text-slate-900 border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          Templates Oficiais ({whatsAppTemplates.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campanhas')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'campanhas' ? 'bg-white shadow-xs text-slate-900 border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          Campanhas em Massa ({whatsAppCampaigns.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('instancia')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'instancia' ? 'bg-white shadow-xs text-slate-900 border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-slate-700" />
          Dispositivo &amp; Pareamento
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'logs' ? 'bg-white shadow-xs text-slate-900 border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          Auditoria &amp; Consentimento
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: DISPARO AVULSO COM PREVIEW WHATSAPP                                */}
      {/* ========================================================================= */}
      {activeTab === 'disparo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Painel de Configuração do Disparo */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                Disparo Direto de Mensagem
              </h2>
              <p className="text-xs text-slate-500">
                Envie comunicados pontuais com substituição dinâmica de dados e anexo de documentos oficiais.
              </p>
            </div>

            {dispatchStatus && (
              <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                dispatchStatus.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {dispatchStatus.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div>{dispatchStatus.text}</div>
              </div>
            )}

            {/* Seleção Rápida de Aluno Cadastrado */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Preencher Automaticamente com Aluno da {activeInstitution.name}:</span>
                <span className="text-[11px] text-slate-400 font-normal">Opcional</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleSelectStudent(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-emerald-500"
              >
                <option value="">-- Selecione um aluno ou digite manualmente abaixo --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.courseName}) - Tel: {s.guardianPhone || s.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nome do Destinatário:</label>
                <input
                  type="text"
                  placeholder="Ex: João Tembe"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Número de Telefone (com indicativo):</label>
                <input
                  type="text"
                  placeholder="+258 84 000 0000"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Template Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Carregar de Template Homologado:</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-emerald-500"
                >
                  <option value="">-- Sem template (Mensagem livre) --</option>
                  {whatsAppTemplates.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.category.toUpperCase()}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Categoria da Mensagem:</label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as WhatsAppTemplateCategory)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-emerald-500"
                >
                  <option value="cobranca">Cobrança</option>
                  <option value="aniversario">Aniversário</option>
                  <option value="aviso">Aviso Geral</option>
                  <option value="confirmacao_pagamento">Confirmação de Pagamento</option>
                  <option value="documento">Envio de Documento</option>
                  <option value="frequencia">Frequência / Faltas</option>
                  <option value="entrada_saida">Entrada/Saída (Portaria)</option>
                  <option value="comunicacao_curso">Comunicação de Curso</option>
                </select>
              </div>
            </div>

            {/* Variáveis Rápidas para Inserir */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Variáveis Dinâmicas Disponíveis (Clique para Inserir):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['{{nome}}', '{{instituicao}}', '{{valor}}', '{{curso}}', '{{mes}}', '{{hora}}', '{{chave_pagamento}}'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setMessageBody(prev => `${prev} ${tag}`)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-mono cursor-pointer transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Corpo da Mensagem */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Corpo da Mensagem:</label>
              <textarea
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Escreva a mensagem ou selecione um template acima..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-emerald-500 font-sans"
              />
            </div>

            {/* Anexo de Documento */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={includeAttachment}
                  onChange={(e) => setIncludeAttachment(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <Paperclip className="w-3.5 h-3.5 text-slate-600" />
                Anexar Documento Digital (PDF) à Mensagem
              </label>

              {includeAttachment && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] text-slate-500">Nome do Arquivo Anexado:</label>
                  <input
                    type="text"
                    value={attachmentDocName}
                    onChange={(e) => setAttachmentDocName(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              )}
            </div>

            {/* Opções de Disparo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openInWebOption}
                  onChange={(e) => setOpenInWebOption(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                Abrir simultaneamente no WhatsApp Web/App
              </label>

              <button
                type="button"
                onClick={handleSendDirectMessage}
                disabled={!whatsappConfig.isConnected}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                  whatsappConfig.isConnected
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                Disparar Mensagem
              </button>
            </div>
          </div>

          {/* WhatsApp UI Live Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-[32px] overflow-hidden border-8 border-slate-900 bg-slate-900 shadow-xl">
              {/* Header do Telefone / WhatsApp */}
              <div className="bg-emerald-700 text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                    {activeInstitution.code?.substring(0, 2) || 'IN'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{activeInstitution.name}</div>
                    <div className="text-[10px] text-emerald-200 truncate">Online • Oficial da Instituição</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-200 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
              </div>

              {/* Chat Canvas (WhatsApp Background) */}
              <div className="p-4 space-y-3 min-h-[360px] bg-[#EFEAE2] flex flex-col justify-end">
                <div className="text-center">
                  <span className="text-[10px] bg-white/80 text-slate-600 px-2.5 py-1 rounded-md shadow-xs">
                    Hoje • Criptografia de ponta a ponta
                  </span>
                </div>

                {/* Mensagem Balão */}
                <div className="self-end max-w-[88%] bg-[#E7FFDB] text-slate-900 p-3 rounded-xl rounded-tr-none shadow-xs text-xs space-y-2 border border-emerald-200/50">
                  {includeAttachment && (
                    <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-emerald-100">
                      <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                      <div className="min-w-0 text-[11px] font-medium truncate">
                        {attachmentDocName}
                      </div>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap leading-relaxed">
                    {messageBody ? (
                      messageBody
                    ) : (
                      <span className="text-slate-400 italic">Digite o texto da mensagem para pré-visualizar...</span>
                    )}
                  </div>

                  {whatsappConfig.appendOptOutNotice && (
                    <div className="text-[10px] text-slate-500 italic pt-1 border-t border-emerald-200/40">
                      {whatsappConfig.optOutText}
                    </div>
                  )}

                  <div className="text-[9px] text-slate-400 text-right flex items-center justify-end gap-1">
                    <span>{new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}</span>
                    <Check className="w-3 h-3 text-emerald-600 inline" />
                  </div>
                </div>
              </div>

              {/* Input Fake Bar */}
              <div className="bg-slate-100 p-2.5 flex items-center gap-2 border-t border-slate-200 text-slate-400 text-xs">
                <div className="flex-1 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-slate-400 text-[11px]">
                  Mensagem WhatsApp
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Send className="w-3 h-3" />
                </div>
              </div>
            </div>

            <div className="text-center mt-3 text-xs text-slate-400">
              Visualização fiel da mensagem recebida pelo formando no dispositivo móvel.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: RÉGUA DE COBRANÇA INTELIGENTE COM MULTA E JUROS                    */}
      {/* ========================================================================= */}
      {activeTab === 'cobranca' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                Régua de Cobrança Automatizada ({activeInstitution.name})
              </h2>
              <p className="text-xs text-slate-500">
                Cálculo instantâneo de mensalidade + multa fixa ({financialSettings.fineAmount} MT) + juros diários ({financialSettings.interestRateDaily}%).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                M-Pesa / Chave de Pagamento: {financialSettings.pixKey || activeInstitution.phone}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {lateStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Nenhum formando em situação de atraso nesta instituição. Todos os pagamentos estão em dia.
              </div>
            ) : (
              lateStudents.map(student => {
                const daysLate = student.paymentStatus === 'Atrasado' ? 14 : 0;
                const fine = student.paymentStatus === 'Atrasado' ? financialSettings.fineAmount : 0;
                const interest = student.paymentStatus === 'Atrasado' ? (4500 * (financialSettings.interestRateDaily / 100) * daysLate) : 0;
                const totalDue = 4500 + fine + interest;

                return (
                  <div key={student.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={student.photoUrl}
                        alt={student.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{student.fullName}</h4>
                        <p className="text-xs text-slate-500">{student.courseName} • Encarregado: {student.guardianName || 'Próprio Formando'}</p>
                        <p className="text-xs font-mono text-emerald-700 font-semibold mt-0.5">
                          WhatsApp: {student.guardianPhone || student.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-rose-600 font-bold block">
                          {student.paymentStatus === 'Atrasado' ? `Atrasado (+${daysLate} dias)` : 'Pendente (Mês Atual)'}
                        </span>
                        <span className="text-xs text-slate-900 font-bold">
                          {totalDue.toLocaleString('pt-MZ')} MT
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Base: 4.500 MT + Multa/Juros: {fine + interest} MT
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendIndividualCollection(student)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Disparar Aviso
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: ANIVERSARIANTES DO MÊS COM TEMPLATES AMIGÁVEIS                     */}
      {/* ========================================================================= */}
      {activeTab === 'aniversariantes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cake className="w-5 h-5 text-pink-500" />
                Felicitações de Aniversário Humanizadas ({activeInstitution.name})
              </h2>
              <p className="text-xs text-slate-500">
                Dispare votos calorosos de aniversário e fortaleça o relacionamento institucional com formandos e encarregados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {birthdayStudents.map(student => (
              <div key={student.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={student.photoUrl}
                    alt={student.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{student.fullName}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{student.courseName}</p>
                    <span className="text-[10px] text-pink-600 font-bold block mt-0.5">🎂 {student.birthDate}</span>
                  </div>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 italic line-clamp-2">
                  "Feliz aniversário, {student.fullName}! A {activeInstitution.name} deseja-lhe um excelente dia."
                </div>

                <button
                  type="button"
                  onClick={() => handleSendIndividualBirthday(student)}
                  className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Felicitação
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: GERENCIADOR DE TEMPLATES OFICIAIS                                  */}
      {/* ========================================================================= */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Biblioteca de Templates Aprovados ({activeInstitution.name})
                </h2>
                <p className="text-xs text-slate-500">
                  Modelos de cobrança, aniversário, confirmação de pagamento, aviso de faltas, portaria e curso.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewTemplateModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Novo Modelo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {whatsAppTemplates.map(template => (
                <div key={template.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                          {template.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{template.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Atualizado em: {template.updatedAt}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteWhatsAppTemplate(template.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Excluir Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {template.body}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map(v => (
                        <span key={v} className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        applyTemplate(template.id);
                        setActiveTab('disparo');
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Usar no Disparo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal de Criação de Template */}
          {showNewTemplateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Novo Template Oficial de WhatsApp</h3>
                  <button
                    type="button"
                    onClick={() => setShowNewTemplateModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Título / Nome do Modelo:</label>
                    <input
                      type="text"
                      placeholder="Ex: Confirmação de Matrícula"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Categoria:</label>
                    <select
                      value={newTemplateCategory}
                      onChange={(e) => setNewTemplateCategory(e.target.value as WhatsAppTemplateCategory)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="cobranca">Cobrança</option>
                      <option value="aniversario">Aniversário</option>
                      <option value="aviso">Aviso</option>
                      <option value="confirmacao_pagamento">Confirmação de Pagamento</option>
                      <option value="documento">Documento</option>
                      <option value="frequencia">Frequência</option>
                      <option value="entrada_saida">Entrada/Saída</option>
                      <option value="comunicacao_curso">Comunicação de Curso</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Corpo do Modelo (use chaves duplas):</label>
                    <textarea
                      rows={5}
                      placeholder="Olá {{nome}}, informamos que..."
                      value={newTemplateBody}
                      onChange={(e) => setNewTemplateBody(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowNewTemplateModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Salvar Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 5: CAMPANHAS EM MASSA COM DELAY ANTI-BAN                              */}
      {/* ========================================================================= */}
      {activeTab === 'campanhas' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Campanhas Segmentadas ({activeInstitution.name})
                </h2>
                <p className="text-xs text-slate-500">
                  Envio em lote com proteção anti-bloqueio (intervalo dinâmico de 3s a 8s entre disparos e respeito a limites diários).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewCampaignModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Nova Campanha
              </button>
            </div>

            <div className="space-y-3">
              {whatsAppCampaigns.map(camp => (
                <div key={camp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">{camp.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          camp.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' :
                          camp.status === 'enviando' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {camp.status}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Público: <strong className="text-slate-800">{camp.targetAudience}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Criada em: {camp.createdAt}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-slate-500 block">Enviados: <strong className="text-emerald-700">{camp.sentCount}</strong> / {camp.totalRecipients}</span>
                        {camp.failedCount > 0 && <span className="text-rose-600 text-[10px] font-semibold">{camp.failedCount} falhas</span>}
                      </div>

                      {camp.status !== 'concluido' && (
                        <button
                          type="button"
                          disabled={isExecutingCampaign === camp.id || !whatsappConfig.isConnected}
                          onClick={() => handleExecuteCampaign(camp.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            whatsappConfig.isConnected 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Play className={`w-3.5 h-3.5 ${isExecutingCampaign === camp.id ? 'animate-spin' : ''}`} />
                          {isExecutingCampaign === camp.id ? 'Disparando...' : 'Executar Campanha'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {camp.messageText}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal de Criação de Campanha */}
          {showNewCampaignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Configurar Nova Campanha WhatsApp</h3>
                  <button
                    type="button"
                    onClick={() => setShowNewCampaignModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Título da Campanha:</label>
                    <input
                      type="text"
                      placeholder="Ex: Cobrança Geral de Propinas"
                      value={newCampaignTitle}
                      onChange={(e) => setNewCampaignTitle(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Público-Alvo:</label>
                      <select
                        value={newCampaignAudience}
                        onChange={(e) => setNewCampaignAudience(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="todos">Todos os Formandos</option>
                        <option value="inadimplentes">Alunos em Atraso / Pendentes</option>
                        <option value="aniversariantes">Aniversariantes do Mês</option>
                        <option value="professores">Corpo Docente</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Categoria:</label>
                      <select
                        value={newCampaignCategory}
                        onChange={(e) => setNewCampaignCategory(e.target.value as WhatsAppTemplateCategory)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="comunicacao_curso">Comunicação de Curso</option>
                        <option value="cobranca">Cobrança</option>
                        <option value="aniversario">Aniversário</option>
                        <option value="aviso">Aviso</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Texto da Mensagem:</label>
                    <textarea
                      rows={5}
                      placeholder="Ex: Olá {{nome}}, comunicamos que as aulas da {{instituicao}} iniciam..."
                      value={newCampaignMessage}
                      onChange={(e) => setNewCampaignMessage(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowNewCampaignModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCampaignTitle.trim() || !newCampaignMessage.trim()) return;
                      createWhatsAppCampaign({
                        title: newCampaignTitle,
                        category: newCampaignCategory,
                        targetAudience: newCampaignAudience,
                        messageText: newCampaignMessage,
                        totalRecipients: newCampaignAudience === 'inadimplentes' ? lateStudents.length : students.length
                      });
                      setShowNewCampaignModal(false);
                      setNewCampaignTitle('');
                      setNewCampaignMessage('');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Criar Campanha
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 6: CONEXÃO, PAREAMENTO & SEGURANÇA DA INSTÂNCIA                       */}
      {/* ========================================================================= */}
      {activeTab === 'instancia' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card de Pareamento e Status do Dispositivo */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-slate-700" />
                Mecanismo de Conexão Autorizado ({activeInstitution.name})
              </h2>
              <p className="text-xs text-slate-500">
                Pareamento seguro via QR Code da Meta ou Código de 8 Dígitos direto no WhatsApp Business.
              </p>
            </div>

            {whatsappConfig.isConnected ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">Dispositivo Conectado &amp; Operacional</h4>
                    <p className="text-xs text-emerald-800 font-mono">
                      Número: {whatsappConfig.phoneNumber || activeInstitution.phone}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Instância: {whatsappConfig.instanceName} • Modelo: {whatsappConfig.deviceModel}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Bateria</span>
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs mt-0.5">
                      <BatteryCharging className="w-4 h-4 text-emerald-600" />
                      {whatsappConfig.batteryLevel}% (Carregando)
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Envios Hoje</span>
                    <div className="text-slate-900 font-bold text-xs mt-0.5">
                      {whatsappConfig.dailyMessagesSent || 0} / {whatsappConfig.dailyLimit || 500}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Última Sincronia</span>
                    <div className="text-slate-900 font-bold text-xs mt-0.5 truncate">
                      {whatsappConfig.lastSync || 'Agora'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={disconnectWhatsAppDevice}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Desconectar Instância da {activeInstitution.name}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Seletor de Método de Conexão */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPairingMethod('qr')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      pairingMethod === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    1. Pareamento por QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPairingMethod('code')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      pairingMethod === 'code' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    2. Pareamento por Código (8 Dígitos)
                  </button>
                </div>

                {pairingMethod === 'qr' ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-4">
                    <div className="w-44 h-44 bg-white border border-slate-300 rounded-2xl p-3 mx-auto flex items-center justify-center shadow-xs">
                      <QrCode className={`w-36 h-36 text-slate-900 ${isPairingLoading ? 'animate-pulse text-emerald-600' : ''}`} />
                    </div>
                    <div className="text-xs text-slate-600 font-mono max-w-xs mx-auto">
                      Abra o WhatsApp &gt; Dispositivos Conectados &gt; Conectar Dispositivo e aponte para o QR Code acima.
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartPairing('qr')}
                      disabled={isPairingLoading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 ${isPairingLoading ? 'animate-spin' : ''}`} />
                      {isPairingLoading ? 'Autenticando Conexão...' : 'Simular Leitura do QR Code'}
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Informe o Telefone WhatsApp da Instituição:</label>
                      <input
                        type="text"
                        value={phoneForCode}
                        onChange={(e) => setPhoneForCode(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                        placeholder="+258 84 990 0000"
                      />
                    </div>

                    {generatedCode ? (
                      <div className="p-4 bg-white rounded-xl border border-emerald-300 text-center space-y-2">
                        <span className="text-xs text-slate-500 font-semibold block">Digite este código no seu WhatsApp:</span>
                        <div className="text-2xl font-black font-mono tracking-widest text-emerald-700">
                          {generatedCode}
                        </div>
                        <p className="text-[11px] text-slate-400">Expira em 3 minutos. Notificação enviada ao celular.</p>

                        <button
                          type="button"
                          onClick={handleConfirmPairingCode}
                          className="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Confirmar Código no Aparelho
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartPairing('code')}
                        disabled={isPairingLoading}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        Gerar Código de Pareamento de 8 Dígitos
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Políticas do Provedor e Limites */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Políticas de Proteção Anti-Bloqueio
              </h3>
              <p className="text-xs text-slate-500">
                Parâmetros definidos para garantir a reputação do número da {activeInstitution.name}.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Limite Diário Seguro:</span>
                  <span className="font-bold text-emerald-700">{whatsappConfig.dailyLimit || 500} mensagens / dia</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((whatsappConfig.dailyMessagesSent || 0) / (whatsappConfig.dailyLimit || 500)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Intervalo Aleatório Anti-Spam:</span>
                  <span className="font-mono text-slate-800">{whatsappConfig.minDelaySeconds || 3}s - {whatsappConfig.maxDelaySeconds || 8}s</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simula digitação humana e evita bloqueios por taxa excessiva (rate limiting).
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Horário Permitido de Envio:</span>
                  <span className="font-mono text-slate-800">{whatsappConfig.allowedStartHour || 8}:00 às {whatsappConfig.allowedEndHour || 20}:00</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Mensagens automáticas fora deste horário são enfileiradas para a manhã seguinte.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappConfig.appendOptOutNotice ?? true}
                    onChange={(e) => updateWhatsAppConfig({ appendOptOutNotice: e.target.checked })}
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                  Incluir Instrução de Descadastro (Opt-out)
                </label>
                <input
                  type="text"
                  value={whatsappConfig.optOutText || ''}
                  onChange={(e) => updateWhatsAppConfig({ optOutText: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 7: HISTÓRICO DE AUDITORIA & LISTA DE CONSENTIMENTO (OPT-IN/OPT-OUT)  */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Logs de Disparos */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Histórico de Mensagens Enviadas ({whatsAppLogs.length})</h3>
                <p className="text-xs text-slate-500">Rastreabilidade completa de cada mensagem disparada pela instituição.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {whatsAppLogs.map(log => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.recipientName}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{log.recipientPhone}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {log.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-1">{log.message}</p>
                    <div className="text-[10px] text-slate-400">
                      Origem: {log.source} • {log.sentAt}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    log.status === 'enviado' ? 'bg-emerald-100 text-emerald-800' :
                    log.status === 'opt_out' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gerenciador de Opt-in / Opt-out */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                Gestão de Consentimento &amp; Bloqueios
              </h3>
              <p className="text-xs text-slate-500">Números que solicitaram não receber mensagens (Opt-out).</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-800 block">Registrar Bloqueio Manual:</span>
                <input
                  type="text"
                  placeholder="Nome do titular"
                  value={newOptOutName}
                  onChange={(e) => setNewOptOutName(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Telefone (+258...)"
                  value={newOptOutPhone}
                  onChange={(e) => setNewOptOutPhone(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newOptOutPhone.trim()) return;
                    updateWhatsAppConsent(newOptOutPhone, newOptOutName || 'Titular', false, 'Solicitação manual de descadastro');
                    setNewOptOutPhone('');
                    setNewOptOutName('');
                  }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Bloquear Número (Opt-out)
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Lista de Consentimentos ({whatsAppConsents.length}):
                </span>
                {whatsAppConsents.map(cst => (
                  <div key={cst.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{cst.name}</div>
                      <div className="font-mono text-slate-500 text-[11px]">{cst.phone}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateWhatsAppConsent(cst.phone, cst.name, !cst.optIn)}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                        cst.optIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {cst.optIn ? 'Autorizado' : 'Bloqueado'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
