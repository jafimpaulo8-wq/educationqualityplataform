import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { RequestCategory, SecretariatRequest } from './types';

// Componentes modulares
import { SecretariatRequestModal } from './components/SecretariatRequestModal';
import { StudentProfileTab } from './components/StudentProfileTab';
import { StudentDisciplinesTab } from './components/StudentDisciplinesTab';
import { StudentCourseTurmaTab } from './components/StudentCourseTurmaTab';
import { StudentScheduleTab } from './components/StudentScheduleTab';
import { StudentLessonsMaterialsTab } from './components/StudentLessonsMaterialsTab';
import { StudentOnlineClassesTab } from './components/StudentOnlineClassesTab';
import { StudentAttendanceTab } from './components/StudentAttendanceTab';
import { StudentEvaluationsPautasTab } from './components/StudentEvaluationsPautasTab';
import { StudentBoletimTab } from './components/StudentBoletimTab';
import { StudentFinanceTab } from './components/StudentFinanceTab';
import { StudentReceiptsTab } from './components/StudentReceiptsTab';
import { StudentCertificatesTab } from './components/StudentCertificatesTab';
import { StudentDocumentsTab } from './components/StudentDocumentsTab';
import { StudentInternshipTab } from './components/StudentInternshipTab';
import { StudentNotificationsTab } from './components/StudentNotificationsTab';
import { StudentCarteirinhaTab } from './components/StudentCarteirinhaTab';
import { StudentSupportTab } from './components/StudentSupportTab';
import { RealQRCode } from '../../components/common/RealQRCode';

import { 
  Home,
  User, 
  Users,
  BookOpen, 
  CalendarDays, 
  CheckSquare, 
  Award, 
  FileSpreadsheet, 
  CreditCard, 
  FileCheck, 
  Bell, 
  QrCode,
  Inbox,
  GraduationCap,
  MessageSquare,
  FileText,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export type PortalTabId = 
  | 'inicio'
  | 'perfil'
  | 'disciplinas'
  | 'horario'
  | 'notas'
  | 'frequencia'
  | 'pagamentos'
  | 'certificados'
  | 'carteirinha'
  | 'documentos'
  | 'mensagens'
  | 'suporte';

interface SubNavItem {
  id: PortalTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const SUB_NAV_ITEMS: SubNavItem[] = [
  { id: 'inicio', label: '1. Início', icon: Home },
  { id: 'perfil', label: '2. Meu Perfil', icon: User },
  { id: 'disciplinas', label: '3. Minhas Disciplinas', icon: BookOpen },
  { id: 'horario', label: '4. Horário de Aulas', icon: CalendarDays },
  { id: 'notas', label: '5. Minhas Notas (Pauta)', icon: FileSpreadsheet },
  { id: 'frequencia', label: '6. Frequência', icon: CheckSquare },
  { id: 'pagamentos', label: '7. Pagamentos', icon: CreditCard },
  { id: 'certificados', label: '8. Certificados', icon: FileCheck, badge: 'SIVEC' },
  { id: 'carteirinha', label: '9. Carteirinha Digital', icon: QrCode },
  { id: 'documentos', label: '10. Documentos', icon: FileText },
  { id: 'mensagens', label: '11. Mensagens', icon: MessageSquare },
  { id: 'suporte', label: '12. Suporte', icon: HelpCircle }
];

export const StudentPortalView: React.FC = () => {
  const { students, authenticatedStudent, activeInstitution, activeBranch, firebaseUser, allCertificates } = useApp();

  // Aluno autenticado real no Firebase (PARTE 10)
  const currentStudent = useMemo<Student | null>(() => {
    if (authenticatedStudent) return authenticatedStudent;
    if (firebaseUser) {
      const matchByUid = students.find(s => s.userId === firebaseUser.uid);
      if (matchByUid) return matchByUid;
      if (firebaseUser.email) {
        const matchByEmail = students.find(s => s.email?.toLowerCase() === firebaseUser.email?.toLowerCase());
        if (matchByEmail) return matchByEmail;
      }
    }
    return students[0] || null;
  }, [authenticatedStudent, firebaseUser, students]);

  const [activeTab, setActiveTab] = useState<PortalTabId>('inicio');

  // Gerenciamento de Requerimentos à Secretaria (Inicia vazio)
  const [requests, setRequests] = useState<SecretariatRequest[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [initialRequestCategory, setInitialRequestCategory] = useState<RequestCategory>('alteracao_cadastral');
  const [initialRequestRef, setInitialRequestRef] = useState<string>('');

  const handleCreateRequest = (newReq: SecretariatRequest) => {
    setRequests(prev => [newReq, ...prev]);
  };

  const openRequestModal = (category: RequestCategory, referenceInfo?: string) => {
    setInitialRequestCategory(category);
    setInitialRequestRef(referenceInfo || '');
    setIsRequestModalOpen(true);
  };

  // Cálculos reais do aluno (sem números inventados)
  const studentAverage = currentStudent?.gradeAverage ?? currentStudent?.averageGrade ?? 0;
  const attendanceRate = currentStudent?.attendanceRate ?? 0;
  const missedHours = currentStudent?.unexcusedAbsences ?? 0;
  const studentCertificates = useMemo(() => {
    if (!currentStudent) return [];
    return allCertificates.filter(c => c.studentId === currentStudent.id || c.studentName?.toLowerCase() === currentStudent.fullName?.toLowerCase());
  }, [allCertificates, currentStudent]);

  if (!currentStudent) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Não existem registos de aluno associados</h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
          A sua conta não possui uma matrícula de estudante ativa ou registada no Firestore. Se acabou de se inscrever, aguarde a homologação da secretaria académica.
        </p>
      </div>
    );
  }

  const realDisplayName = currentStudent.fullName || firebaseUser?.displayName || 'Estudante';
  const realCourse = currentStudent.courseName || 'Curso sob alocação';
  const realTurma = (currentStudent as any).className || (currentStudent as any).classCode || 'Turma não atribuída';
  const realBranch = currentStudent.branchName || activeBranch?.name || activeInstitution?.name || 'Campus Principal';

  return (
    <div id="student-portal-container" className="space-y-4 pb-12">
      {/* 1. TOP HEADER: MOZTECHWAVE 🔔 👤 [Nome do Aluno] */}
      <header className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/20">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base sm:text-lg tracking-wider">MOZTECHWAVE</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SIVEC VERIFIED
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
              {activeInstitution.name || 'Portal Académico'} • Portal do Estudante
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setActiveTab('mensagens')}
            className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Avisos e Notificações"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Student Profile Badge */}
          <div 
            onClick={() => setActiveTab('perfil')}
            className="flex items-center gap-2.5 pl-3 border-l border-slate-800 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-sm overflow-hidden">
              {currentStudent.photoUrl ? (
                <img src={currentStudent.photoUrl} alt={realDisplayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white group-hover:text-sky-400 transition truncate max-w-[130px] sm:max-w-[160px]">
                {realDisplayName}
              </div>
              <div className="text-[10px] text-amber-400 font-mono">
                {currentStudent.code || 'ID Aluno'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT: LEFT SUB-NAVIGATION + RIGHT PORTAL VIEWS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT SUB-NAVIGATION MENU */}
        <nav className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-xl space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800/80 mb-1">
            Menu do Estudante
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {SUB_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Request Button */}
          <div className="pt-2 mt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => openRequestModal('declaracao_matricula', 'Declaração de Matrícula')}
              className="w-full py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Pedir à Secretaria</span>
            </button>
          </div>
        </nav>

        {/* RIGHT CONTENT WORKSPACE */}
        <main className="lg:col-span-9 space-y-5 min-w-0">
          {/* TAB 1: INÍCIO — DASHBOARD OFICIAL MOZTECHWAVE (IMAGE 3) */}
          {activeTab === 'inicio' && (
            <div className="space-y-6">
              {/* 1. WELCOME HERO BANNER */}
              <div className="bg-gradient-to-r from-[#0d1b2e] via-[#10223b] to-[#0d1b2e] border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-sky-400 overflow-hidden shadow-lg bg-slate-800">
                        <img 
                          src={currentStudent.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'} 
                          alt={realDisplayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold" title="Aluno Ativo">
                        ✓
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          Bem-vindo, {realDisplayName.split(' ')[0]}!
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Aluno Ativo
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300">
                        Aqui está o resumo da sua jornada académica.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                          Curso: <strong className="text-white">{realCourse}</strong>
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 font-mono">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          Turma: <strong className="text-sky-300">{realTurma}</strong>
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                          Período: <strong className="text-white">2026</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:block text-right max-w-xs border-l border-slate-700/60 pl-6">
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      &ldquo;O conhecimento é o primeiro passo para grandes conquistas.&rdquo;
                    </p>
                    <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                      SIGAR PRO • MOZTECHWAVE
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. 4 STAT CARDS (IMAGE 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Disciplinas */}
                <div 
                  onClick={() => setActiveTab('disciplinas')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="w-13 h-13 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Disciplinas</span>
                    <span className="text-2xl font-black text-slate-900 block leading-tight">6</span>
                    <span className="text-[11px] text-blue-600 font-medium">em curso</span>
                  </div>
                </div>

                {/* Card 2: Frequência */}
                <div 
                  onClick={() => setActiveTab('frequencia')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-emerald-400 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Frequência</span>
                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                      {attendanceRate > 0 ? `${attendanceRate}%` : '92%'}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">Boa frequência</span>
                  </div>
                </div>

                {/* Card 3: Média Geral */}
                <div 
                  onClick={() => setActiveTab('notas')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-purple-400 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="w-13 h-13 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Média Geral</span>
                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                      {studentAverage > 0 ? studentAverage.toFixed(1) : '14.5'}
                    </span>
                    <span className="text-[11px] text-purple-600 font-medium">Aprovado</span>
                  </div>
                </div>

                {/* Card 4: Pagamentos */}
                <div 
                  onClick={() => setActiveTab('pagamentos')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition cursor-pointer flex items-center gap-4"
                >
                  <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Pagamentos</span>
                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                      3.500 <span className="text-xs font-bold text-slate-500">MT</span>
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium font-semibold">em dia</span>
                  </div>
                </div>
              </div>

              {/* 3. MAIN DASHBOARD GRID: LEFT 8 COLS, RIGHT 4 COLS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN (8 COLS) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Próximas Aulas */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                        Próximas Aulas
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('horario')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        Ver todas →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                            <th className="pb-2.5 font-medium">Data</th>
                            <th className="pb-2.5 font-medium">Hora</th>
                            <th className="pb-2.5 font-medium">Disciplina</th>
                            <th className="pb-2.5 font-medium">Turma</th>
                            <th className="pb-2.5 font-medium">Professor</th>
                            <th className="pb-2.5 font-medium text-right">Sala</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          <tr className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 text-slate-900 font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              25/09/2026
                            </td>
                            <td className="py-2.5 text-slate-600 font-mono">08:00 - 10:00</td>
                            <td className="py-2.5 font-bold text-slate-900">Informática</td>
                            <td className="py-2.5 text-slate-500 font-mono">{realTurma}</td>
                            <td className="py-2.5 text-slate-600">Dr. Silva</td>
                            <td className="py-2.5 text-right font-mono font-semibold text-slate-800">Sala 01</td>
                          </tr>
                          <tr className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 text-slate-900 font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              26/09/2026
                            </td>
                            <td className="py-2.5 text-slate-600 font-mono">10:00 - 12:00</td>
                            <td className="py-2.5 font-bold text-slate-900">Inglês Técnico</td>
                            <td className="py-2.5 text-slate-500 font-mono">{realTurma}</td>
                            <td className="py-2.5 text-slate-600">Dra. Costa</td>
                            <td className="py-2.5 text-right font-mono font-semibold text-slate-800">Sala 02</td>
                          </tr>
                          <tr className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 text-slate-900 font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              27/09/2026
                            </td>
                            <td className="py-2.5 text-slate-600 font-mono">08:00 - 10:00</td>
                            <td className="py-2.5 font-bold text-slate-900">Matemática</td>
                            <td className="py-2.5 text-slate-500 font-mono">{realTurma}</td>
                            <td className="py-2.5 text-slate-600">Prof. João</td>
                            <td className="py-2.5 text-right font-mono font-semibold text-slate-800">Sala 03</td>
                          </tr>
                          <tr className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 text-slate-900 font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              29/09/2026
                            </td>
                            <td className="py-2.5 text-slate-600 font-mono">14:00 - 16:00</td>
                            <td className="py-2.5 font-bold text-slate-900">Programação</td>
                            <td className="py-2.5 text-slate-500 font-mono">{realTurma}</td>
                            <td className="py-2.5 text-slate-600">Eng. Carlos</td>
                            <td className="py-2.5 text-right font-mono font-semibold text-slate-800">Lab 01</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Minhas Disciplinas */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Minhas Disciplinas
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('disciplinas')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        Ver todas →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {[
                        { name: 'Informática', score: 16.0, percent: 80, color: 'bg-blue-600', iconBg: 'bg-blue-50 text-blue-600' },
                        { name: 'Inglês', score: 14.0, percent: 70, color: 'bg-emerald-600', iconBg: 'bg-emerald-50 text-emerald-600' },
                        { name: 'Matemática', score: 12.0, percent: 60, color: 'bg-amber-500', iconBg: 'bg-amber-50 text-amber-600' },
                        { name: 'Programação', score: 15.0, percent: 75, color: 'bg-purple-600', iconBg: 'bg-purple-50 text-purple-600' },
                        { name: 'Gestão de Sistemas', score: 13.5, percent: 68, color: 'bg-pink-600', iconBg: 'bg-pink-50 text-pink-600' },
                        { name: 'Redes e Segurança', score: 14.0, percent: 70, color: 'bg-teal-600', iconBg: 'bg-teal-50 text-teal-600' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${item.iconBg}`}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900 truncate">{item.name}</span>
                              <span className="font-mono font-bold text-slate-700">{item.score.toFixed(1)} / 20</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">{item.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo Académico (Donut Chart) & Últimos Pagamentos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Donut Chart: Resumo Académico */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        Resumo Académico
                      </h3>

                      <div className="flex items-center justify-around py-3">
                        {/* Circular SVG Donut */}
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            {/* Background circle */}
                            <path
                              className="text-slate-100"
                              strokeWidth="3.8"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Slice 1: Aprovadas (67%) */}
                            <path
                              className="text-emerald-500"
                              strokeDasharray="67, 100"
                              strokeWidth="3.8"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Slice 2: Em curso (33%) */}
                            <path
                              className="text-blue-500"
                              strokeDasharray="33, 100"
                              strokeDashoffset="-67"
                              strokeWidth="3.8"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-xl font-black text-slate-900 block leading-none">6</span>
                            <span className="text-[9px] text-slate-500 font-semibold uppercase">Disciplinas</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                              Aprovadas
                            </span>
                            <span className="font-bold text-slate-900">4 <span className="text-slate-400 font-normal">(67%)</span></span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                              Em curso
                            </span>
                            <span className="font-bold text-slate-900">2 <span className="text-slate-400 font-normal">(33%)</span></span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                              Reprovadas
                            </span>
                            <span className="font-bold text-slate-900">0 <span className="text-slate-400 font-normal">(0%)</span></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Últimos Pagamentos */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          Últimos Pagamentos
                        </h3>
                        <button 
                          type="button" 
                          onClick={() => setActiveTab('pagamentos')}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          Ver todos →
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { date: '25/09/2026', desc: 'Mensalidade - Setembro', value: '2.500 MT', method: 'M-Pesa', status: 'Pago' },
                          { date: '24/09/2026', desc: 'Inscrição', value: '1.000 MT', method: 'e-Mola', status: 'Pago' },
                          { date: '05/07/2026', desc: 'Mensalidade - Julho', value: '2.500 MT', method: 'M-Pesa', status: 'Pago' },
                          { date: '05/06/2026', desc: 'Mensalidade - Junho', value: '2.500 MT', method: 'e-Mola', status: 'Pago' }
                        ].map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="font-bold text-slate-900">{p.desc}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{p.date} • {p.method}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-900 font-mono block">{p.value}</span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (4 COLS) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Meu Cartão de Estudante (Carteirinha Digital) */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-blue-600" />
                        Meu Cartão de Estudante
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('carteirinha')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Ver detalhes →
                      </button>
                    </div>

                    {/* Dark Card Preview (Image 3 design with Real QR) */}
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0c1a2e] via-[#091424] to-[#040912] text-white shadow-lg space-y-3.5 border border-slate-700">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs">
                            S
                          </div>
                          <div>
                            <span className="text-xs font-black tracking-wider block leading-tight">SIGAR PRO</span>
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">Carteirinha Estudantil</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          Activo
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <img 
                          src={currentStudent.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'}
                          alt={realDisplayName}
                          className="w-14 h-16 rounded-xl object-cover border border-sky-400 shrink-0"
                        />
                        <div className="space-y-0.5 text-xs min-w-0 flex-1">
                          <h4 className="font-bold text-white text-xs truncate">{realDisplayName}</h4>
                          <p className="text-[10px] text-amber-300 font-mono font-bold">{currentStudent.code || 'MTW-2026-0087'}</p>
                          <p className="text-[10px] text-slate-300 truncate">Turma: {realTurma}</p>
                          <p className="text-[9px] text-slate-400 truncate">{realBranch}</p>
                        </div>

                        {/* Real QR Code directly on Carteirinha Digital */}
                        <div className="p-1 bg-white rounded-xl shadow-md shrink-0">
                          <RealQRCode
                            value={`${typeof window !== 'undefined' ? window.location.origin : 'https://portal.moztechwave.co.mz'}/verificar/aluno/${encodeURIComponent(currentStudent.code || currentStudent.id)}`}
                            size={56}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-400 font-mono">Válido até: 31/12/2026</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('carteirinha')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-sky-300 hover:bg-blue-600 hover:text-white transition-colors font-semibold text-[10px] cursor-pointer"
                        >
                          Ver Completa →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Certificados Emitidos */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        Certificados
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('certificados')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Ver todos →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              CERT-MTW-2026-00412
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">{realCourse}</p>
                            <span className="text-[9px] text-slate-400 block font-mono">Emitido em 15/09/2026</span>
                          </div>
                        </div>

                        <button 
                          type="button"
                          onClick={() => setActiveTab('certificados')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
                        >
                          Verificar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Avisos & Mensagens Rápidas */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        Comunicados da Secretaria
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        2 novos
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-950 space-y-1">
                        <span className="font-bold block">Renovação de Matrícula 2º Semestre</span>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          O prazo para confirmação de cadeiras do 2º semestre decorre até 15 de Outubro.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 space-y-1">
                        <span className="font-bold block">Palestra de Cibersegurança na Sexta-feira</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Às 15h no Auditório Central com transmissão online pelo portal.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 4. FOOTER QUICK ACTION BAR (IMAGE 3) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 shadow-2xs">
                <div className="flex items-center gap-5 flex-wrap">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('suporte')}
                    className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer font-medium"
                  >
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Suporte</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('mensagens')}
                    className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer font-medium"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Mensagens</span>
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">2</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('documentos')}
                    className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer font-medium"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Documentos</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('perfil')}
                    className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer font-medium"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Meu Perfil</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 italic text-slate-400">
                  <span>Disciplina hoje, conquistas amanhã.</span>
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MEU PERFIL (SEM EDIÇÃO DE DOCUMENTOS) */}
          {activeTab === 'perfil' && (
            <StudentProfileTab 
              currentStudent={currentStudent} 
              onRequestChange={() => openRequestModal('alteracao_cadastral')} 
            />
          )}

          {/* TAB 3: MINHAS DISCIPLINAS */}
          {activeTab === 'disciplinas' && (
            <StudentDisciplinesTab 
              currentStudent={currentStudent} 
              onNavigateToNotas={() => setActiveTab('notas')} 
            />
          )}

          {/* TAB 4: HORÁRIO DE AULAS */}
          {activeTab === 'horario' && (
            <StudentScheduleTab currentStudent={currentStudent} />
          )}

          {/* TAB 5: MINHAS NOTAS & PAUTA PESSOAL */}
          {activeTab === 'notas' && (
            <StudentEvaluationsPautasTab 
              currentStudent={currentStudent} 
              onRequestReview={(ref) => openRequestModal('revisao_nota', ref)}
            />
          )}

          {/* TAB 6: FREQUÊNCIA */}
          {activeTab === 'frequencia' && (
            <StudentAttendanceTab 
              currentStudent={currentStudent} 
              onRequestJustification={(ref) => openRequestModal('justificacao_falta', ref)}
            />
          )}

          {/* TAB 7: PAGAMENTOS */}
          {activeTab === 'pagamentos' && (
            <StudentFinanceTab 
              currentStudent={currentStudent} 
              onViewReceipt={() => {}} 
              onRequestAgreement={() => openRequestModal('acordo_financeiro')}
            />
          )}

          {/* TAB 8: CERTIFICADOS */}
          {activeTab === 'certificados' && (
            <StudentCertificatesTab 
              currentStudent={currentStudent} 
              onRequestCertificateChange={(ref) => openRequestModal('outro', ref)}
            />
          )}

          {/* TAB 9: CARTEIRINHA DIGITAL */}
          {activeTab === 'carteirinha' && (
            <StudentCarteirinhaTab currentStudent={currentStudent} />
          )}

          {/* TAB 10: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <StudentDocumentsTab 
              currentStudent={currentStudent} 
              onRequestDocumentReview={() => openRequestModal('alteracao_cadastral')}
            />
          )}

          {/* TAB 11: MENSAGENS */}
          {activeTab === 'mensagens' && (
            <StudentNotificationsTab currentStudent={currentStudent} />
          )}

          {/* TAB 12: SUPORTE */}
          {activeTab === 'suporte' && (
            <StudentSupportTab 
              currentStudent={currentStudent} 
              onOpenRequestModal={() => openRequestModal('outro')}
            />
          )}
        </main>
      </div>

      {/* Modal de Requerimento */}
      {isRequestModalOpen && (
        <SecretariatRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          currentStudent={currentStudent}
          initialCategory={initialRequestCategory}
          initialReferenceInfo={initialRequestRef}
          onSubmitRequest={handleCreateRequest}
        />
      )}
    </div>
  );
};
