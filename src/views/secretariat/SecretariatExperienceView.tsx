import React, { useState } from 'react';
import {
  FileText,
  Users,
  UserPlus,
  Calendar,
  FolderOpen,
  FileCheck2,
  CreditCard,
  Award,
  Clock,
  Megaphone,
  DollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Printer,
  Download,
  Send,
  Eye,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  IdCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SecretariatExperienceView: React.FC = () => {
  const { 
    activeInstitution, 
    students, 
    classes, 
    courses, 
    navigate,
    addNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'inscricoes'
    | 'alunos'
    | 'matriculas'
    | 'turmas'
    | 'documentos'
    | 'contratos'
    | 'carteirinhas'
    | 'declaracoes'
    | 'certificados'
    | 'frequencia'
    | 'comunicados'
    | 'pagamentos'
  >('inscricoes');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForDoc, setSelectedStudentForDoc] = useState(students[0] || null);
  const [issuedDocFeedback, setIssuedDocFeedback] = useState<string | null>(null);

  // Institution students
  const instStudents = students.filter(s => s.institutionId === activeInstitution.id || !s.institutionId);

  // Candidate applications mock
  const [candidates, setCandidates] = useState([
    {
      id: 'cand-01',
      fullName: 'Amina Selemane Bacar',
      biNumber: '110100452391M',
      courseName: 'Contabilidade e Auditoria',
      status: 'Pendente',
      submittedAt: 'Hoje às 09:20',
      phone: '+258 84 912 3456'
    },
    {
      id: 'cand-02',
      fullName: 'Edson Francisco Macamo',
      biNumber: '110299841029B',
      courseName: 'Informática e Redes',
      status: 'Documentos OK',
      submittedAt: 'Hoje às 08:45',
      phone: '+258 82 443 2190'
    },
    {
      id: 'cand-03',
      fullName: 'Gisela António Langa',
      biNumber: '100188472910F',
      courseName: 'Secretariado Executivo',
      status: 'Aprovada',
      submittedAt: 'Ontem',
      phone: '+258 86 554 1122'
    }
  ]);

  const handleApproveCandidate = (id: string, name: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'Aprovada' } : c));
    addNotification({
      title: 'Candidatura Aprovada',
      message: `A candidatura de ${name} foi validada pela Secretaria. Pronta para matrícula.`,
      type: 'registration'
    });
  };

  const handleEmitDeclaration = (type: string) => {
    setIssuedDocFeedback(`Declaração de ${type} gerada com sucesso para ${selectedStudentForDoc?.fullName || 'o estudante'}.`);
    setTimeout(() => setIssuedDocFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 border border-cyan-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              Módulo 76: Experiência da Secretaria Acadêmica • {activeInstitution.code}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Secretaria &amp; Atendimento ao Aluno
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Central operacional para gestão de inscrições, novas matrículas, emissão de documentos oficiais, contratos, carteirinhas discentes e regularização de expedientes conforme nível de permissão.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-2 shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Posto de Atendimento:
            </div>
            <div className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Balcão Central • {activeInstitution.name}</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sessão de Atendimento Ativa</span>
            </div>
          </div>
        </div>

        {/* 12 Secretariat Pillars Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-8 pt-4 border-t border-slate-800">
          {[
            { id: 'inscricoes', label: '1. Inscrições', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
            { id: 'alunos', label: '2. Alunos', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'matriculas', label: '3. Matrículas', icon: <UserPlus className="w-3.5 h-3.5" /> },
            { id: 'turmas', label: '4. Turmas', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'documentos', label: '5. Documentos', icon: <FolderOpen className="w-3.5 h-3.5" /> },
            { id: 'contratos', label: '6. Contratos', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'carteirinhas', label: '7. Carteirinhas', icon: <IdCard className="w-3.5 h-3.5" /> },
            { id: 'declaracoes', label: '8. Declarações', icon: <Printer className="w-3.5 h-3.5" /> },
            { id: 'certificados', label: '9. Certificados', icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'frequencia', label: '10. Frequência', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'comunicados', label: '11. Comunicados', icon: <Megaphone className="w-3.5 h-3.5" /> },
            { id: 'pagamentos', label: '12. Pagamentos', icon: <DollarSign className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 p-2 rounded-xl font-bold text-xs transition-all cursor-pointer truncate ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-950/70 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Alert */}
      {issuedDocFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{issuedDocFeedback}</span>
        </div>
      )}

      {/* 1. INSCRIÇÕES */}
      {activeTab === 'inscricoes' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                Candidaturas &amp; Inscrições Recentes
              </h3>
              <p className="text-xs text-slate-400">Validação de pré-requisitos e documentos de novos candidatos.</p>
            </div>
            <button
              onClick={() => navigate('candidatos_gestao')}
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
            >
              Módulo Completo de Candidatos →
            </button>
          </div>

          <div className="space-y-3">
            {candidates.map((cand) => (
              <div key={cand.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">{cand.fullName}</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cand.status === 'Aprovada' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {cand.status}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    BI: <span className="font-mono text-slate-200">{cand.biNumber}</span> • Curso: <span className="text-cyan-300">{cand.courseName}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Contato: {cand.phone} • Submetido: {cand.submittedAt}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {cand.status !== 'Aprovada' && (
                    <button
                      onClick={() => handleApproveCandidate(cand.id, cand.fullName)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
                    >
                      Aprovar Candidatura
                    </button>
                  )}
                  <button
                    onClick={() => navigate('alunos_cadastrar')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                  >
                    Matricular Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ALUNOS */}
      {activeTab === 'alunos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Dossiês &amp; Processos dos Alunos
              </h3>
              <p className="text-xs text-slate-400">Total de {instStudents.length} alunos cadastrados no centro.</p>
            </div>
            <button
              onClick={() => navigate('alunos_list')}
              className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              Listagem Geral de Alunos →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {instStudents.slice(0, 6).map((student) => (
              <div key={student.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-start">
                  <strong className="text-white">{student.fullName}</strong>
                  <span className="font-mono text-cyan-400 text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded">
                    {student.code}
                  </span>
                </div>
                <div className="text-slate-400">BI: <span className="font-mono text-slate-200">{student.documentNumber}</span></div>
                <div className="text-slate-400">Telefone: <span className="text-slate-200">{student.phone}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MATRÍCULAS */}
      {activeTab === 'matriculas' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Efetivação de Matrículas &amp; Reconfirmações
              </h3>
              <p className="text-xs text-slate-400">Abertura de processo acadêmico e geração do número de matrícula.</p>
            </div>
            <button
              onClick={() => navigate('alunos_cadastrar')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              + Nova Matrícula
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-white block">Regras de Matrícula Ativas:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              <li>Cópia autenticada do BI ou DIRE válida.</li>
              <li>Certificado de Habilitações Literárias (10ª ou 12ª Classe).</li>
              <li>Duas fotografias tipo passe recentes.</li>
              <li>Comprovativo de liquidação da taxa de inscrição e primeira propina.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 4. TURMAS */}
      {activeTab === 'turmas' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Enturmação &amp; Lotação de Salas
              </h3>
              <p className="text-xs text-slate-400">Distribuição de alunos por turmas ativas do centro.</p>
            </div>
            <button
              onClick={() => navigate('turmas_gestao')}
              className="text-xs font-bold text-purple-400 hover:underline cursor-pointer"
            >
              Gerir Turmas →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {classes.slice(0, 3).map((turma) => (
              <div key={turma.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <strong className="text-white block text-sm">{turma.name}</strong>
                <div className="text-slate-400">Código: <span className="font-mono text-cyan-300">{(turma as any).code || turma.id}</span></div>
                <div className="text-slate-400">Lotação: <span className="text-emerald-400 font-bold">28 / 30 Alunos</span></div>
                <div className="text-slate-400">Turno: <span className="text-slate-200">{turma.shift}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. DOCUMENTOS */}
      {activeTab === 'documentos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                Arquivo Digital de Documentos dos Estudantes
              </h3>
              <p className="text-xs text-slate-400">Repositório de cópias de BI, certificados e atestados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Documentos de Identificação (BI/DIRE)</strong>
              <span className="text-emerald-400 font-bold">98% dos alunos com BI verificado</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Certificados de Habilitação</strong>
              <span className="text-cyan-400 font-bold">Digitalizados e anexados aos processos</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Fotografias Tipo Passe</strong>
              <span className="text-purple-400 font-bold">Integradas para carteirinhas</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONTRATOS */}
      {activeTab === 'contratos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Contratos de Formação Pedagógica &amp; Termos
              </h3>
              <p className="text-xs text-slate-400">Emissão e recolha de assinaturas dos termos de compromisso.</p>
            </div>
            <button
              onClick={() => navigate('contratos')}
              className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              Editor de Contratos →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-white block">Modelos Contratuais Disponíveis:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                • Contrato Padrão de Formação Profissional (DINET)
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                • Termo de Responsabilidade Financeira e Pagamento
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CARTEIRINHAS */}
      {activeTab === 'carteirinhas' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <IdCard className="w-5 h-5 text-cyan-400" />
                Carteirinhas Digitais &amp; Físicas de Estudante
              </h3>
              <p className="text-xs text-slate-400">Emissão de crachá institucional com QR Code e foto do formando.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-950 border border-cyan-500/30 max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-white text-xs uppercase tracking-wider">{activeInstitution.name}</span>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">2026</span>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs shrink-0 font-bold">
                FOTO
              </div>
              <div className="text-xs space-y-0.5">
                <strong className="text-white block">{selectedStudentForDoc?.fullName || 'Nome do Formando'}</strong>
                <div className="text-slate-400 font-mono text-[11px]">Cód: {selectedStudentForDoc?.code || 'MTW-2026-001'}</div>
                <div className="text-cyan-300 text-[11px]">Curso Técnico Oficial</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
              <span>Válido até 31/12/2026</span>
              <span className="text-emerald-400 font-mono font-bold">QR ATIVO</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. DECLARAÇÕES */}
      {activeTab === 'declaracoes' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                Emissão Rápida de Declarações Oficiais
              </h3>
              <p className="text-xs text-slate-400">Emissão instantânea com carimbo eletrônico da Secretaria.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <button
              onClick={() => handleEmitDeclaration('Matrícula e Frequência')}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left space-y-1 transition-all cursor-pointer"
            >
              <strong className="text-white block">Declaração de Matrícula</strong>
              <p className="text-slate-400 text-[11px]">Comprova que o aluno está regularmente matriculado.</p>
              <span className="text-amber-400 font-bold text-[10px] block pt-2">Emitir Documento →</span>
            </button>

            <button
              onClick={() => handleEmitDeclaration('Frequência com Notas')}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left space-y-1 transition-all cursor-pointer"
            >
              <strong className="text-white block">Declaração com Notas</strong>
              <p className="text-slate-400 text-[11px]">Com histórico das disciplinas concluídas e médias obtidas.</p>
              <span className="text-cyan-400 font-bold text-[10px] block pt-2">Emitir Documento →</span>
            </button>

            <button
              onClick={() => handleEmitDeclaration('Fins Militares / Embaixada')}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left space-y-1 transition-all cursor-pointer"
            >
              <strong className="text-white block">Fins Bancários / Serviço Militar</strong>
              <p className="text-slate-400 text-[11px]">Declaração com formato oficial para instituições externas.</p>
              <span className="text-emerald-400 font-bold text-[10px] block pt-2">Emitir Documento →</span>
            </button>
          </div>
        </div>
      )}

      {/* 9. CERTIFICADOS */}
      {activeTab === 'certificados' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Dossiês de Conclusão &amp; Certificados
              </h3>
              <p className="text-xs text-slate-400">Reunião de notas, estágios e taxas para outorga do certificado.</p>
            </div>
            <button
              onClick={() => navigate('fluxo_conclusao')}
              className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              Módulo 71 Conclusão →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-white block">Lista de Verificação de Conclusão da Secretaria:</span>
            <div className="text-slate-300 text-[11px] space-y-1">
              <div>✓ Média curricular aprovada em todas as cadeiras (≥ 10 valores).</div>
              <div>✓ Assiduidade mínima de 75% validada no diário de frequência.</div>
              <div>✓ Relatório de estágio curricular deferido.</div>
              <div>✓ Quitação total de propinas e taxas acadêmicas.</div>
            </div>
          </div>
        </div>
      )}

      {/* 10. FREQUÊNCIA */}
      {activeTab === 'frequencia' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                Justificativas de Faltas &amp; Atestados
              </h3>
              <p className="text-xs text-slate-400">Recepção de atestados médicos e dispensa laboral.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-white block">Procedimento da Secretaria:</span>
            <p className="text-slate-400 text-[11px]">
              O formando deve apresentar o atestado original em até 5 dias úteis após a ausência. A secretaria registra o comprovativo e comunica o docente da turma.
            </p>
          </div>
        </div>
      )}

      {/* 11. COMUNICADOS */}
      {activeTab === 'comunicados' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                Comunicação Direta com Alunos &amp; Encarregados
              </h3>
              <p className="text-xs text-slate-400">Envio de avisos sobre renovação de matrícula, prazos e feriados.</p>
            </div>
            <button
              onClick={() => navigate('comunicados')}
              className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
            >
              Central de Comunicados →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
            <div>
              <strong className="text-white block">Aviso: Prazo Final para Confirmação de Matrícula</strong>
              <span className="text-slate-400 text-[11px]">Enviado via WhatsApp para 142 alunos</span>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Enviado</span>
          </div>
        </div>
      )}

      {/* 12. PAGAMENTOS CONFORME PERMISSÃO */}
      {activeTab === 'pagamentos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Cobrança de Emolumentos &amp; Consulta de Quitação
              </h3>
              <p className="text-xs text-slate-400">Verificação de regularidade antes da liberação de documentos oficiais.</p>
            </div>
            <button
              onClick={() => navigate('caixa_escolar')}
              className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              Caixa Escolar →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Emissão de Declaração</strong>
              <span className="text-emerald-400 font-bold text-sm">250 MT</span>
              <p className="text-slate-500 text-[10px]">Taxa de expediente de secretaria</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">2ª Via de Carteirinha</strong>
              <span className="text-emerald-400 font-bold text-sm">300 MT</span>
              <p className="text-slate-500 text-[10px]">Reimpressão de cartão plástico</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Certidão de Habilitações</strong>
              <span className="text-emerald-400 font-bold text-sm">500 MT</span>
              <p className="text-slate-500 text-[10px]">Autenticação e selo institucional</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
