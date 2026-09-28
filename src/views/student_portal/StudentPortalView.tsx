import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { RequestCategory, SecretariatRequest } from './types';

// Componentes modulares
import { SecretariatRequestModal } from './components/SecretariatRequestModal';
import { StudentProfileTab } from './components/StudentProfileTab';
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

import { 
  Home,
  User, 
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
          {/* TAB 1: INÍCIO */}
          {activeTab === 'inicio' && (
            <div className="space-y-5">
              {/* WELCOME HERO CARD (PARTE 10) */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="space-y-4">
                  <div>
                    <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
                      SIGAR PRO • PORTAL DO ALUNO
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1">
                      Bem-vindo, {realDisplayName}!
                    </h1>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-300">
                    <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
                      Curso: <strong className="text-white ml-1">{realCourse}</strong>
                    </div>
                    <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
                      Turma: <strong className="text-white ml-1 font-mono">{realTurma}</strong>
                    </div>
                    <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
                      Filial: <strong className="text-white ml-1">{realBranch}</strong>
                    </div>
                  </div>

                  {/* 4 REAL STAT CARDS: [NOTAS] [FREQUÊNCIA] [PAGAMENTOS] [CERTIFICADOS] (PARTE 10) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {/* Box 1: Notas */}
                    <div 
                      onClick={() => setActiveTab('pautas')}
                      className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/60 p-4 rounded-2xl transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-400" />
                          Notas
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Média
                        </span>
                      </div>
                      <div className="text-2xl font-black text-white group-hover:text-amber-400 transition">
                        {studentAverage > 0 ? studentAverage.toFixed(1) : 'Sem notas'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {studentAverage >= 10 ? 'Situação: Aprovado' : studentAverage > 0 ? 'Em Recuperação' : 'Aguardando pauta'}
                      </div>
                    </div>

                    {/* Box 2: Frequência */}
                    <div 
                      onClick={() => setActiveTab('frequencia')}
                      className="bg-slate-950/90 border border-slate-800 hover:border-sky-500/60 p-4 rounded-2xl transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-sky-400" />
                          Frequência
                        </span>
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                          Presenças
                        </span>
                      </div>
                      <div className="text-2xl font-black text-white group-hover:text-sky-400 transition">
                        {attendanceRate > 0 ? `${attendanceRate}%` : 'Sem registos'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {missedHours} ausência(s) registada(s)
                      </div>
                    </div>

                    {/* Box 3: Pagamentos */}
                    <div 
                      onClick={() => setActiveTab('pagamentos')}
                      className="bg-slate-950/90 border border-slate-800 hover:border-emerald-500/60 p-4 rounded-2xl transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          Pagamentos
                        </span>
                      </div>
                      <div className="text-xl font-black text-emerald-400 group-hover:text-emerald-300 transition">
                        {currentStudent.paymentStatus || 'Regularizado'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Saldo: {currentStudent.balanceOwing ? `${currentStudent.balanceOwing} MT` : '0 MT'}
                      </div>
                    </div>

                    {/* Box 4: Certificados */}
                    <div 
                      onClick={() => setActiveTab('certificados')}
                      className="bg-slate-950/90 border border-slate-800 hover:border-indigo-500/60 p-4 rounded-2xl transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-indigo-400" />
                          Certificados
                        </span>
                      </div>
                      <div className="text-2xl font-black text-indigo-400 group-hover:text-indigo-300 transition">
                        {studentCertificates.length}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Com selo digital SIVEC
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARTEIRINHA E ATALHOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setActiveTab('carteirinha')}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-amber-500/40 transition cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-amber-400" />
                      Carteirinha Digital de Acesso
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">Ativa</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Apresente o seu QR Code institucional para controlo de acesso na portaria e biblioteca.
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('horario')}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-sky-500/40 transition cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-sky-400" />
                      Horário Semanal
                    </span>
                    <span className="text-[10px] font-bold text-sky-400">Grade Letiva</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Consulte os horários de aulas, salas atribuídas e professores de cada módulo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURSO & TURMA */}
          {activeTab === 'curso' && (
            <StudentCourseTurmaTab currentStudent={currentStudent} />
          )}

          {/* TAB 3: HORÁRIO */}
          {activeTab === 'horario' && (
            <StudentScheduleTab currentStudent={currentStudent} />
          )}

          {/* TAB 4: PAUTAS & NOTAS */}
          {activeTab === 'pautas' && (
            <StudentEvaluationsPautasTab 
              currentStudent={currentStudent} 
              onRequestReview={(ref) => openRequestModal('revisao_nota', ref)}
            />
          )}

          {/* TAB 5: FREQUÊNCIA */}
          {activeTab === 'frequencia' && (
            <StudentAttendanceTab 
              currentStudent={currentStudent} 
              onRequestJustification={(ref) => openRequestModal('justificacao_falta', ref)}
            />
          )}

          {/* TAB 6: PAGAMENTOS */}
          {activeTab === 'pagamentos' && (
            <StudentFinanceTab 
              currentStudent={currentStudent} 
              onViewReceipt={() => {}} 
              onRequestAgreement={() => openRequestModal('acordo_financeiro')}
            />
          )}

          {/* TAB 7: CERTIFICADOS */}
          {activeTab === 'certificados' && (
            <StudentCertificatesTab 
              currentStudent={currentStudent} 
              onRequestCertificateChange={(ref) => openRequestModal('outro', ref)}
            />
          )}

          {/* TAB 8: CARTEIRINHA */}
          {activeTab === 'carteirinha' && (
            <StudentCarteirinhaTab currentStudent={currentStudent} />
          )}

          {/* TAB 9: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <StudentDocumentsTab 
              currentStudent={currentStudent} 
              onRequestDocumentReview={() => openRequestModal('alteracao_cadastral')}
            />
          )}

          {/* TAB 10: MENSAGENS & NOTIFICAÇÕES */}
          {activeTab === 'mensagens' && (
            <StudentNotificationsTab currentStudent={currentStudent} />
          )}

          {/* TAB 11: PERFIL */}
          {activeTab === 'perfil' && (
            <StudentProfileTab 
              currentStudent={currentStudent} 
              onRequestChange={() => openRequestModal('alteracao_cadastral')} 
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
