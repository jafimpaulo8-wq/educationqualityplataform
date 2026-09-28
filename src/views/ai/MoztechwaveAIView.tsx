import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  BrainCircuit, 
  AlertTriangle, 
  Send, 
  CheckCircle, 
  TrendingDown, 
  BookOpen, 
  FileText, 
  Upload, 
  Paperclip, 
  X, 
  Sliders, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  Bot, 
  User, 
  Lock, 
  ArrowRight,
  Printer,
  Compass,
  FileCheck
} from 'lucide-react';
import { 
  AiChatMessage, 
  processUserAiQuery 
} from '../../services/moztechwaveAiService';
import { toCanonicalRole, ROLE_DEFINITIONS } from '../../types/rbac';
import { AiBrowserCard } from './components/AiBrowserCard';
import { AiStudentRegistrationCard } from './components/AiStudentRegistrationCard';
import { AiRbacMatrixTab } from './components/AiRbacMatrixTab';

export const MoztechwaveAIView: React.FC = () => {
  const { 
    students, 
    courses, 
    classes, 
    activeInstitution, 
    activeBranchId, 
    activeRole,
    navigate
  } = useApp();

  const [activeTab, setActiveTab] = useState<'chat' | 'matrix' | 'docs' | 'evasao' | 'testes'>('chat');
  
  // Chat State
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Olá! Sou o **Moztechwave AI**, o seu assistente institucional inteligente integrado ao sistema **${activeInstitution.name}**.\n\nVocê pode me fazer perguntas sobre o quadro de alunos, faturas financeiras, emitir certidões, ou anexar um documento (foto ou PDF de BI/ficha) e dizer *"faz isso"* para matricular um novo aluno.\n\n*Todas as operações são auditadas e respeitam rigorosamente a Matriz RBAC.*`,
      timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      deepLink: {
        title: 'Central de Gestão Discente',
        description: 'Visualizar listagem oficial de formandos cadastrados.',
        url: 'sigar://alunos/todos',
        route: 'alunos_gestao',
        actionLabel: 'Conduzir para Alunos'
      }
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: string;
    dataUrl?: string;
    content?: string;
  } | null>(null);

  // Document Modal Preview State
  const [viewingDoc, setViewingDoc] = useState<{
    title: string;
    content: string;
    type: string;
  } | null>(null);
  const [docCopied, setDocCopied] = useState(false);

  // Test Generator State (Preserved)
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.name || 'Engenharia de Software');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermédio');
  const [testTopic, setTestTopic] = useState('Bancos de Dados Relacionais, Consultas SQL e Normalização');
  const [generatedTest, setGeneratedTest] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedTest, setCopiedTest] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const canonicalRole = toCanonicalRole(activeRole);
  const roleDef = ROLE_DEFINITIONS[canonicalRole];

  // Sugestões solicitadas na especificação do módulo 47
  const quickSuggestions = [
    'Quantos alunos estão inadimplentes?',
    'Quais alunos terminam o curso este mês?',
    'Qual curso tem mais alunos?',
    'Mostra os pagamentos pendentes.',
    'Cria um comunicado.',
    'Cria uma declaração.',
    'Analisa este certificado.',
    'Resume esta pauta.'
  ];

  // Alunos em risco de evasão
  const atRiskStudents = students.map(s => {
    const isRisk = s.attendancePercentage < 85 || s.averageGrade < 12;
    const riskFactor = s.attendancePercentage < 75 ? 'Crítico (Evasão Iminente)' : isRisk ? 'Atenção Pedagógica' : 'Baixo Risco';
    return {
      student: s,
      riskLevel: riskFactor,
      reasons: [
        s.attendancePercentage < 80 ? `Assiduidade de apenas ${s.attendancePercentage}%` : null,
        s.averageGrade < 12 ? `Média de ${s.averageGrade} valores` : null,
        s.paymentStatus === 'Atrasado' ? 'Pendência financeira ativa' : null
      ].filter(Boolean)
    };
  }).filter(r => r.riskLevel !== 'Baixo Risco');

  // Rolar para o final do chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() && !attachedFile) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text || (attachedFile ? `Anexei o documento ${attachedFile.name}. Faz isso!` : ''),
      timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
      attachedDocument: attachedFile ? {
        name: attachedFile.name,
        type: attachedFile.type,
        previewUrl: attachedFile.dataUrl
      } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    const currentAttachment = attachedFile;
    setAttachedFile(null);
    setIsProcessing(true);

    try {
      const reply = await processUserAiQuery(
        text || 'faz isso',
        {
          userRole: activeRole,
          activeInstitution,
          activeBranchId,
          students,
          courses,
          classes,
          attachedDocument: currentAttachment || undefined
        },
        [...messages, userMsg]
      );

      setMessages(prev => [...prev, reply]);
    } catch (err) {
      console.error('Erro ao consultar IA:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Desculpe, ocorreu uma instabilidade ao conectar com o serviço de inteligência artificial. Por favor, tente novamente.',
          timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateTest = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedTest(
`========================================================================
REPÚBLICA DE MOÇAMBIQUE
CENTRO DE FORMAÇÃO TÉCNICO PROFISSIONAL ${activeInstitution.name.toUpperCase()}
CURSO: ${selectedCourse.toUpperCase()}
MÓDULO: ${testTopic}
NÍVEL DE EXIGÊNCIA: ${selectedDifficulty.toUpperCase()}
DURAÇÃO: 90 MINUTOS • COTAÇÃO TOTAL: 20 VALORES
========================================================================

GRUPO I - TEORIA E CONCEITOS ESTRUTURAIS (6.0 Valores)
1. Diferencie integridade referencial de integridade de entidade em modelos relacionais. (2.0 v)
2. Explique em que situações a criação de um índice de chave estrangeira previne problemas de desempenho em consultas concorrentes com múltiplos JOINs. (2.0 v)
3. Apresente as características fundamentais da 3ª Forma Normal (3FN) e como ela elimina redundâncias transitivas. (2.0 v)

GRUPO II - PRÁTICA E RESOLUÇÃO DE CASO REAL (8.0 Valores)
Considere a tabela 'matriculas_alunos' com os campos (id, aluno_id, turma_id, data_matricula, status):
4. Escreva uma instrução SQL otimizada para listar as turmas que possuem mais de 25 alunos com status 'Ativo'. (4.0 v)
5. Desenvolva uma transação segura (BEGIN TRANSACTION ... COMMIT) para efetuar a transferência de um formando entre turmas, garantindo a integridade dos dados históricos. (4.0 v)

GRUPO III - ESTUDO DE CASO PEDAGÓGICO (6.0 Valores)
6. Um centro de formação necessita registrar o log de acessos na portaria em tempo real via QR Code. Proponha a arquitetura de persistência e a política de indexação por data e código do aluno. (6.0 v)

CRITÉRIOS DE CORREÇÃO:
- Precisão na sintaxe SQL: 40%
- Clareza na fundamentação teórica: 30%
- Estruturação arquitetural: 30%`
      );
      setIsGenerating(false);
    }, 1000);
  };

  const handleCopyDoc = (content: string) => {
    navigator.clipboard.writeText(content);
    setDocCopied(true);
    setTimeout(() => setDocCopied(false), 2000);
  };

  return (
    <div id="moztechwave-ai-container" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/20 shrink-0">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">47. Moztechwave AI</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Assistente Interno
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${roleDef?.badgeBg} ${roleDef?.badgeColor}`}>
                {canonicalRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assessoria institucional, matrícula via documento, consultas de dados autorizados e condução inteligente de perfis.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'chat' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            Assistente & Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'matrix' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-sky-600" />
            Matriz Editável RBAC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evasao')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'evasao' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            Radar de Evasão ({atRiskStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('testes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'testes' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Gerador de Testes
          </button>
        </div>
      </div>

      {/* ABA 1: ASSISTENTE INTERNO & CHAT COMANDOS */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Stream (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs h-[720px]">
            {/* Chat Top Banner */}
            <div className="p-3.5 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span className="text-xs font-bold text-slate-800">
                  Moztechwave AI Copilot • Ativo em {activeInstitution.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  RBAC Ativo
                </span>
                <button
                  type="button"
                  onClick={() => setMessages([messages[0]])}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Limpar Conversa"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-2.5 max-w-[92%]">
                    {msg.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div 
                        className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                            : msg.isSecurityViolation
                            ? 'bg-rose-50/90 text-rose-950 border border-rose-200 rounded-tl-xs shadow-xs'
                            : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        }`}
                      >
                        {/* Attached File Preview if any */}
                        {msg.attachedDocument && (
                          <div className="mb-2.5 p-2 bg-black/10 rounded-xl flex items-center gap-2 border border-white/20">
                            <FileText className="w-4 h-4 text-indigo-300" />
                            <span className="text-[11px] font-bold truncate">
                              {msg.attachedDocument.name}
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/20 font-mono">
                              Anexo
                            </span>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap font-sans">
                          {msg.text}
                        </div>

                        {/* Generated Document Action if any */}
                        {msg.generatedDocument && (
                          <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-slate-500 font-semibold">
                              Cód: {msg.generatedDocument.referenceCode}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyDoc(msg.generatedDocument!.content)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                {docCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                {docCopied ? 'Copiado' : 'Copiar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setViewingDoc({
                                  title: msg.generatedDocument!.title,
                                  content: msg.generatedDocument!.content,
                                  type: msg.generatedDocument!.type
                                })}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                Visualizar / Imprimir A4
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Registration Confirmation Card */}
                      {msg.registrationDraft && (
                        <AiStudentRegistrationCard
                          draft={msg.registrationDraft}
                        />
                      )}

                      {/* Browser Automático / Deep-Link Card */}
                      {msg.deepLink && (
                        <AiBrowserCard
                          title={msg.deepLink.title}
                          description={msg.deepLink.description}
                          url={msg.deepLink.url}
                          route={msg.deepLink.route}
                          actionLabel={msg.deepLink.actionLabel}
                          badgeText={msg.deepLink.badgeText}
                          studentData={msg.deepLink.studentData}
                        />
                      )}

                      <span className="text-[10px] text-slate-400 font-mono px-1 block">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl w-fit border border-slate-200">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">O Moztechwave AI está a analisar os dados e a verificar as permissões RBAC...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input & Attachment Area */}
            <div className="p-3.5 border-t border-slate-200 bg-white rounded-b-2xl space-y-2">
              {attachedFile && (
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold truncate">{attachedFile.name}</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded font-mono">
                      Pronto para Extração
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Anexar Foto ou PDF de BI/Ficha"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={attachedFile ? 'Digite "faz isso" ou dê uma instrução...' : 'Pergunte à IA (ex: "Quantos alunos estão inadimplentes?", "Cria um comunicado")...'}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || (!inputText.trim() && !attachedFile)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Quick Actions & RBAC Overview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Suggestions Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Comandos Oficiais Rápidos
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Clique numa das instruções pré-configuradas para obter diagnósticos instantâneos:
              </p>

              <div className="space-y-1.5">
                {quickSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item)}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-950 border border-slate-200/80 hover:border-indigo-200 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>"{item}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Document Upload Quick Tool */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Cadastrar Aluno via Documento</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Faça upload de imagem (BI de Moçambique, Ficha de Inscrição ou Formulário) ou PDF. Diga à IA: <em>"Faz isso"</em> e ela preencherá a matrícula automaticamente com validação RBAC.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4 text-indigo-600" />
                Carregar Imagem ou PDF
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Protocolo de Segurança & Auditoria</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Se um formando tentar comandos como <strong>"põe notas"</strong> ou solicitar acesso a dados financeiros de terceiros, o assistente negará automaticamente a operação com base no perfil <strong>{canonicalRole}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: MATRIZ EDITÁVEL DE ACESSOS RBAC */}
      {activeTab === 'matrix' && (
        <AiRbacMatrixTab />
      )}

      {/* ABA 3: RADAR DE EVASÃO ESCOLAR */}
      {activeTab === 'evasao' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Diagnóstico Preventivo de Evasão & Abandono
                </h2>
                <p className="text-xs text-slate-500">
                  O algoritmo correlaciona frequência em sala, notas dos módulos e histórico de atrasos financeiros
                </p>
              </div>
              <span className="text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-lg border border-rose-200 font-bold">
                {atRiskStudents.length} Alunos sob Monitoramento
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {atRiskStudents.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.student.photoUrl}
                        alt={item.student.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-300"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{item.student.fullName}</h4>
                        <p className="text-[11px] text-slate-500">{item.student.courseName}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.riskLevel.includes('Crítico')
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.riskLevel}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Indicadores de Alerta:</span>
                    {item.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-rose-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        {r}
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('alunos_gestao');
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      Conduzir para Perfil do Aluno
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: GERADOR DE TESTES E PROVAS */}
      {activeTab === 'testes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Parâmetros da Avaliação Pedagógica
            </h2>
            <p className="text-xs text-slate-500">
              Gere provas oficiais completas no padrão do Instituto com cotação de 0 a 20 valores e gabarito
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Curso Alvo</label>
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nível de Dificuldade</label>
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  <option value="Básico / Introdutório">Básico / Introdutório</option>
                  <option value="Intermédio">Intermédio</option>
                  <option value="Avançado / Especialista">Avançado / Especialista</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tópico ou Matéria do Teste</label>
                <textarea
                  value={testTopic}
                  onChange={e => setTestTopic(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateTest}
                disabled={isGenerating}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Elaborando Avaliação...' : 'Gerar Teste com Inteligência Artificial'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Enunciado Oficial da Prova
                </h3>

                {generatedTest && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedTest);
                        setCopiedTest(true);
                        setTimeout(() => setCopiedTest(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedTest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTest ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Imprimir Folha
                    </button>
                  </div>
                )}
              </div>

              {generatedTest ? (
                <pre className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {generatedTest}
                </pre>
              ) : (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Configure os parâmetros à esquerda e clique em "Gerar Teste" para elaborar uma avaliação personalizada.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview de Documento Oficial A4 */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-300">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">{viewingDoc.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir A4
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 bg-slate-50 whitespace-pre-wrap leading-relaxed">
              {viewingDoc.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
