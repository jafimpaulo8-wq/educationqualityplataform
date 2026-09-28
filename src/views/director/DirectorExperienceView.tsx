import React, { useState } from 'react';
import {
  School,
  Users,
  BookOpen,
  Calendar,
  Award,
  CreditCard,
  FileText,
  ShieldCheck,
  Megaphone,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Check,
  Copy,
  Printer,
  FileSpreadsheet,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppRoute } from '../../types';

export const DirectorExperienceView: React.FC = () => {
  const { 
    activeInstitution, 
    allInstitutions,
    students, 
    courses, 
    classes, 
    teachers, 
    evaluations, 
    internships, 
    paymentRecords, 
    dashboardNotices, 
    navigate, 
    updateInstitution,
    activeRole
  } = useApp();

  // 15 Pillars Tab Selector for the Director
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'alunos'
    | 'cursos'
    | 'turmas'
    | 'professores'
    | 'frequencia'
    | 'avaliacoes'
    | 'pautas'
    | 'estagios'
    | 'financeiro'
    | 'documentos'
    | 'certificados'
    | 'sivec'
    | 'comunicados'
    | 'relatorios'
  >('dashboard');

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [approvedPautaId, setApprovedPautaId] = useState<string | null>(null);

  // Institution code & access code
  const accessCode = activeInstitution.accessCode || `SIGAR-ACC-8819-${activeInstitution.code.replace('MTW-', '')}`;

  const handleCopyAccessCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Metrics for active institution
  const instStudents = students.filter(s => s.institutionId === activeInstitution.id || !s.institutionId);
  const instCourses = courses.filter(c => c.institutionId === activeInstitution.id || !c.institutionId);
  const instClasses = classes.filter(cl => cl.institutionId === activeInstitution.id || !cl.institutionId);
  const instTeachers = teachers.filter(t => t.institutionId === activeInstitution.id || !t.institutionId);
  const instInternships = (internships || []).filter(i => i.institutionId === activeInstitution.id || !i.institutionId);

  // Financial summary
  const totalRevenueMZN = (paymentRecords || [])
    .filter(p => (p.status as string).toLowerCase() === 'aprovado' || (p.status as string).toLowerCase() === 'pago')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const pendingApprovalsCount = 3; // Pautas, estágios, certificados

  const handleApprovePauta = (pautaId: string) => {
    setApprovedPautaId(pautaId);
    setTimeout(() => setApprovedPautaId(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <School className="w-3.5 h-3.5" />
              Módulo 75: Experiência do Diretor Geral • {activeInstitution.code}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {activeInstitution.name}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Painel de governança executiva, pedagógica e financeira do Diretor. 
              Gestão integrada dos 15 módulos do centro, aprovação de pautas, outorga de certificados, homologação SIVEC e supervisão de filiais.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('experiencia_secretaria')}
                className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Secretaria Acadêmica (Módulo 76) →</span>
              </button>
              <button
                onClick={() => navigate('experiencia_financeiro')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Gestão Financeira &amp; Tesouraria (Módulo 77) →</span>
              </button>
              <button
                onClick={() => navigate('experiencia_professor')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Portal do Professor (Módulo 78) →</span>
              </button>
            </div>
          </div>

          {/* Director Identity & Access Code Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-2 shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Diretor(a) Responsável:
            </div>
            <div className="text-sm font-black text-white flex items-center gap-1.5">
              <span>{activeInstitution.representativeName || 'Dr. Diretor Geral'}</span>
            </div>
            <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2">
              <span className="text-[10px] text-indigo-300 font-mono font-bold">
                Código: {accessCode}
              </span>
              <button
                onClick={handleCopyAccessCode}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 15 Modules Tabs Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-1.5 mt-8 pt-4 border-t border-slate-800">
          {[
            { id: 'dashboard', label: '1. Dashboard', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'alunos', label: '2. Alunos', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'cursos', label: '3. Cursos', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'turmas', label: '4. Turmas', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'professores', label: '5. Professores', icon: <Briefcase className="w-3.5 h-3.5" /> },
            { id: 'frequencia', label: '6. Frequência', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'avaliacoes', label: '7. Avaliações', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
            { id: 'pautas', label: '8. Pautas', icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'estagios', label: '9. Estágios', icon: <Briefcase className="w-3.5 h-3.5" /> },
            { id: 'financeiro', label: '10. Financeiro', icon: <CreditCard className="w-3.5 h-3.5" /> },
            { id: 'documentos', label: '11. Documentos', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'certificados', label: '12. Certificados', icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'sivec', label: '13. SIVEC', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: 'comunicados', label: '14. Comunicados', icon: <Megaphone className="w-3.5 h-3.5" /> },
            { id: 'relatorios', label: '15. Relatórios', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 p-2 rounded-xl font-bold text-xs transition-all cursor-pointer truncate ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-950/70 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. DASHBOARD DO DIRETOR */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Executive Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Alunos Matriculados</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{instStudents.length}</div>
              <div className="text-[11px] text-emerald-400">Situação regular ativa</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Turmas Operantes</span>
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">{instClasses.length}</div>
              <div className="text-[11px] text-slate-400">Turnos manhã, tarde e noite</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Corpo Docente</span>
                <Briefcase className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">{instTeachers.length}</div>
              <div className="text-[11px] text-slate-400">Professores e formadores</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Receita Arrecadada</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">
                {totalRevenueMZN.toLocaleString()} MT
              </div>
              <div className="text-[11px] text-slate-400">Propinas liquidadas no mês</div>
            </div>
          </div>

          {/* Director Action Deck: Quick Despatches */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Despachos Imediatos da Direção Geral
              </h3>
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                3 Pendências Requerendo Sua Assinatura
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white">Pauta Semestral de Informática</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">Pendente</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Turma T-INFO-2026. 28 formandos aprovados, 2 em recurso.
                </p>
                <button
                  onClick={() => handleApprovePauta('pauta-1')}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-all"
                >
                  {approvedPautaId === 'pauta-1' ? '✓ Homologada com Sucesso!' : 'Homologar & Assinar Pauta'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white">Lote de 12 Certificados SIVEC</span>
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full">Aprovação</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Estágios validados e notas aprovadas. Prontos para selo digital.
                </p>
                <button
                  onClick={() => navigate('fluxo_conclusao')}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all"
                >
                  Outorgar Diplomas (Módulo 71)
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white">Novo Contrato com Empresa Parceira</span>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full">Estágio</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Convênio com a Cervejas de Moçambique para 15 formandos de Logística.
                </p>
                <button
                  onClick={() => navigate('estagios')}
                  className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer transition-all"
                >
                  Revisar &amp; Ratificar Convênio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ALUNOS */}
      {activeTab === 'alunos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Gestão Oficial de Alunos Matriculados
              </h3>
              <p className="text-xs text-slate-400">Total de {instStudents.length} estudantes ativos neste centro.</p>
            </div>
            <button
              onClick={() => navigate('alunos_list')}
              className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              Abrir Módulo de Alunos Completo →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {instStudents.slice(0, 6).map((student) => (
              <div key={student.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-start">
                  <strong className="text-white">{student.fullName}</strong>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded">
                    {student.code}
                  </span>
                </div>
                <div className="text-slate-400">BI: <span className="text-slate-200 font-mono">{student.documentNumber}</span></div>
                <div className="text-slate-400">Situação: <strong className="text-emerald-400">{student.status || 'Ativo'}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CURSOS */}
      {activeTab === 'cursos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Catálogo de Cursos Técnico-Profissionais
              </h3>
              <p className="text-xs text-slate-400">Cursos com alvará e autorização pedagógica da Direção.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {instCourses.map((course) => (
              <div key={course.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white block text-sm">{course.name}</strong>
                <div className="text-slate-400">Código: <span className="text-purple-300 font-mono">{course.code}</span></div>
                <div className="text-slate-400">Mensalidade: <strong className="text-emerald-400">{course.monthlyFee ? `${course.monthlyFee} MT` : '3.500 MT'}</strong></div>
                <div className="text-slate-400">Regime: <span className="text-slate-200">Laboral &amp; Pós-Laboral</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TURMAS */}
      {activeTab === 'turmas' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Turmas &amp; Distribuição Semestral
              </h3>
              <p className="text-xs text-slate-400">Alocação de salas e horários em vigor.</p>
            </div>
            <button
              onClick={() => navigate('turmas_gestao')}
              className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              Abrir Gestão de Turmas →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {instClasses.map((turma) => (
              <div key={turma.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <strong className="text-white block text-sm">{turma.name}</strong>
                <div className="text-slate-400">Identificador: <span className="font-mono text-cyan-300">{turma.id}</span></div>
                <div className="text-slate-400">Turno: <span className="text-slate-200">{turma.shift}</span></div>
                <div className="text-slate-400">Sala: <span className="text-slate-200">{turma.room || 'Sala 04'}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PROFESSORES */}
      {activeTab === 'professores' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                Corpo Docente &amp; Formadores Autorizados
              </h3>
              <p className="text-xs text-slate-400">Quadro de professores habilitados a lecionar e avaliar.</p>
            </div>
            <button
              onClick={() => navigate('professores_gestao')}
              className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              Gerir Docentes →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {instTeachers.map((prof) => (
              <div key={prof.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <strong className="text-white block text-sm">{prof.fullName}</strong>
                <div className="text-slate-400">Grau: <span className="text-slate-200">{prof.academicDegree || 'Licenciatura'}</span></div>
                <div className="text-slate-400">Especialidade: <span className="text-slate-200">{prof.specialty || 'Tecnologia'}</span></div>
                <div className="text-slate-400">Status: <strong className="text-emerald-400">{prof.status}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. FREQUÊNCIA */}
      {activeTab === 'frequencia' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                Assiduidade &amp; Controle de Faltas
              </h3>
              <p className="text-xs text-slate-400">Monitoramento da presença mínima de 75% exigida pelo regulamento.</p>
            </div>
            <button
              onClick={() => navigate('aulas_frequencia')}
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
            >
              Lançar Frequências →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Assiduidade Geral da Instituição:</span>
              <div className="text-2xl font-black text-emerald-400">92.4%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Alunos com Faltas Excessivas:</span>
              <div className="text-2xl font-black text-rose-400">3 Formandos</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Aulas Ministradas este Mês:</span>
              <div className="text-2xl font-black text-white">148 Aulas</div>
            </div>
          </div>
        </div>
      )}

      {/* 7. AVALIAÇÕES */}
      {activeTab === 'avaliacoes' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                Calendário &amp; Fórmulas de Avaliação
              </h3>
              <p className="text-xs text-slate-400">Controle das avaliações parcelares, testes e exames finais.</p>
            </div>
            <button
              onClick={() => navigate('avaliacoes')}
              className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
            >
              Módulo de Avaliações →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-white">Fórmula de Média Oficial Homologada pelo Diretor:</div>
            <div className="font-mono text-amber-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              Média Final = (Teste 1 * 0.3) + (Teste 2 * 0.3) + (Exame / Projeto Prático * 0.4)
            </div>
            <div className="text-slate-400 text-[11px]">
              Nota de aprovação direta: ≥ 10.0 valores. Recurso entre 8.0 e 9.4 valores.
            </div>
          </div>
        </div>
      )}

      {/* 8. PAUTAS */}
      {activeTab === 'pautas' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Pautas Oficiais &amp; Homologação da Direção
              </h3>
              <p className="text-xs text-slate-400">Assinatura digital do Diretor Geral para publicação das notas.</p>
            </div>
            <button
              onClick={() => navigate('pautas')}
              className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              Abrir Central de Pautas →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-white block text-sm">Pauta Semestral de Desenvolvimento Web</strong>
                <span className="text-slate-400 text-[11px]">Turma DW-2026-N • Docente: Eng. Carlos Nhantumbo</span>
              </div>
              <button
                onClick={() => handleApprovePauta('pauta-sem')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all"
              >
                {approvedPautaId === 'pauta-sem' ? '✓ Assinada & Publicada!' : 'Chancelar Pauta Oficial'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. ESTÁGIOS */}
      {activeTab === 'estagios' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                Estágios Profissionais &amp; Empresas Parceiras
              </h3>
              <p className="text-xs text-slate-400">Validação dos termos de estágio e parecer da empresa concedente.</p>
            </div>
            <button
              onClick={() => navigate('estagios')}
              className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              Gerir Estágios →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Estagiários Ativos no Mercado:</span>
              <div className="text-2xl font-black text-cyan-400">{instInternships.length || 18} Formandos</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Empresas Conveniadas:</span>
              <div className="text-2xl font-black text-white">8 Empresas</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Relatórios Aprovados:</span>
              <div className="text-2xl font-black text-emerald-400">100% em dia</div>
            </div>
          </div>
        </div>
      )}

      {/* 10. FINANCEIRO */}
      {activeTab === 'financeiro' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Painel Financeiro &amp; Fluxo de Caixa Escolar
              </h3>
              <p className="text-xs text-slate-400">Arrecadação de propinas, conciliações M-Pesa e balancete diário.</p>
            </div>
            <button
              onClick={() => navigate('caixa_escolar')}
              className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              Abrir Caixa Escolar →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Receita Total do Mês:</span>
              <div className="text-2xl font-black text-emerald-400">{totalRevenueMZN.toLocaleString()} MT</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">Índice de Pontualidade:</span>
              <div className="text-2xl font-black text-cyan-400">88.6%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">M-Pesa Automático:</span>
              <div className="text-2xl font-black text-purple-400">Ativo</div>
            </div>
          </div>
        </div>
      )}

      {/* 11. DOCUMENTOS */}
      {activeTab === 'documentos' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Document Studio &amp; Declarações Oficiais
              </h3>
              <p className="text-xs text-slate-400">Emissão de declarações de frequência, certidões e termos.</p>
            </div>
            <button
              onClick={() => navigate('studio')}
              className="text-xs font-bold text-purple-400 hover:underline cursor-pointer"
            >
              Abrir Document Studio →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Declaração com Notas</strong>
              <p className="text-slate-400 text-[11px]">Com código QR de autenticidade</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Declaração de Matrícula</strong>
              <p className="text-slate-400 text-[11px]">Para INSS, bancos e embaixadas</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Termo de Compromisso</strong>
              <p className="text-slate-400 text-[11px]">Regulamento disciplinar assinado</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Contrato de Formação</strong>
              <p className="text-slate-400 text-[11px]">Com cláusulas de pagamento</p>
            </div>
          </div>
        </div>
      )}

      {/* 12. CERTIFICADOS */}
      {activeTab === 'certificados' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Emissão &amp; Outorga de Certificados de Conclusão
              </h3>
              <p className="text-xs text-slate-400">Assinatura do Diretor e inserção do selo criptográfico do centro.</p>
            </div>
            <button
              onClick={() => navigate('fluxo_conclusao')}
              className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              Módulo 71 Conclusão →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-white">Livro Oficial de Registro de Certificados:</div>
            <div className="text-slate-400">
              Livro Nº 04 • Registro sequencial ativo: <strong className="text-emerald-400 font-mono">CERT-{activeInstitution.code}-2026-0042</strong>
            </div>
          </div>
        </div>
      )}

      {/* 13. SIVEC */}
      {activeTab === 'sivec' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Integração Governamental SIVEC (DINET / ANEP / MEC)
              </h3>
              <p className="text-xs text-slate-400">Transmissão de certificados para consulta pública nacional.</p>
            </div>
            <button
              onClick={() => navigate('fluxo_sivec')}
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
            >
              Módulo 73 SIVEC →
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Status da Conexão SIVEC:</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full">HOMOLOGADO</span>
            </div>
            <div className="text-slate-400">
              Certificados desta instituição possuem validação direta por QR Code e Hash SHA-256 no portal do Ministério.
            </div>
          </div>
        </div>
      )}

      {/* 14. COMUNICADOS */}
      {activeTab === 'comunicados' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                Comunicados Oficiais da Direção
              </h3>
              <p className="text-xs text-slate-400">Disparo direto para os canais de WhatsApp e painel do estudante.</p>
            </div>
            <button
              onClick={() => navigate('comunicados')}
              className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
            >
              Criar Novo Comunicado →
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {(dashboardNotices || []).slice(0, 3).map((notice: any) => (
              <div key={notice.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block">{notice.title || notice.message}</strong>
                  <span className="text-slate-400 text-[11px]">{notice.targetAudience || 'Comunidade Geral'} • {notice.date || notice.createdAt || 'Hoje'}</span>
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Ativo</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15. RELATÓRIOS */}
      {activeTab === 'relatorios' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Relatórios Executivos &amp; Estatísticas Oficiais
              </h3>
              <p className="text-xs text-slate-400">Exportação de relatórios para o Ministério e assembleias gerais.</p>
            </div>
            <button
              onClick={() => navigate('relatorios_academicos')}
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
            >
              Relatórios Acadêmicos →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Mapa de Aproveitamento Semestral</strong>
              <p className="text-slate-400 text-[11px]">PDF formatado conforme DINET</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Taxa de Evasão Escolar</strong>
              <p className="text-slate-400 text-[11px]">Estatística comparativa anual</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <strong className="text-white block">Demonstrativo de Receitas &amp; Propinas</strong>
              <p className="text-slate-400 text-[11px]">Relatório para conselho fiscal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
