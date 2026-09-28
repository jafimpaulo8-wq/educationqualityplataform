/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { AppHeader } from './components/AppHeader';
import { NotificationCenter } from './components/NotificationCenter';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';

import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Portal Views
import { HeroGallery } from './components/HeroGallery';
import { CertificateShowcase } from './components/CertificateShowcase';
import { CourseCatalog } from './components/CourseCatalog';
import { RegistrationWizard } from './components/RegistrationWizard';
import { PaymentIntegrationsView } from './components/PaymentIntegrationsView';
import { DigitalGatePass } from './components/DigitalGatePass';
import { ApplicationTracker } from './components/ApplicationTracker';

// Back-Office Views
import { MoztechwaveCoreView } from './views/admin/MoztechwaveCoreView';
import { SuperAdminDashboard } from './views/admin/SuperAdminDashboard';
import { InstitutionRegistrationWizard } from './views/admin/InstitutionRegistrationWizard';
import { CenterDashboard } from './views/center/CenterDashboard';
import { StudentsListView } from './views/students/StudentsListView';
import { StudentRegistrationForm } from './views/students/StudentRegistrationForm';
import { StudentProfileView } from './views/students/StudentProfileView';
import { StudentCardGeneratorView } from './views/students/StudentCardGeneratorView';
import { AssessmentsAndGradesView } from './views/academic/AssessmentsAndGradesView';
import { PautasManagerView } from './views/academic/PautasManagerView';
import { BoletimView } from './views/academic/BoletimView';
import { InternshipsView } from './views/internships/InternshipsView';
import { ContractsManagerView } from './views/contracts/ContractsManagerView';
import { DocumentStudioView } from './views/studio/DocumentStudioView';
import { SivecVerificationView } from './views/sivec/SivecVerificationView';
import { AutomationCenterView } from './views/communication/AutomationCenterView';
import { FinancialManagerView } from './views/finance/FinancialManagerView';
import { CashRegisterView } from './views/finance/CashRegisterView';
import { FinanceModuleView } from './views/finance/FinanceModuleView';
import { PaymentPortalView } from './views/finance/PaymentPortalView';
import { FinancialReportsView } from './views/finance/FinancialReportsView';
import { GateControlView } from './views/access/GateControlView';
import { StudentQRCodeView } from './views/access/StudentQRCodeView';
import { GateEntryControlPanel } from './views/access/GateEntryControlPanel';
import { ClassManagerView } from './views/classes/ClassManagerView';
import { ScheduleView } from './views/schedules/ScheduleView';
import { TeacherDiaryView } from './views/classes/TeacherDiaryView';
import { LessonsAndAttendanceView } from './views/academic/LessonsAndAttendanceView';
import { StudentPortalView } from './views/student_portal/StudentPortalView';
import { MoztechwaveAIView } from './views/ai/MoztechwaveAIView';
import { WhatsAppCenterView } from './views/communication/WhatsAppCenterView';
import { RBACMatrixView } from './views/admin/RBACMatrixView';
import { CandidatesManagementView } from './views/secretariat/CandidatesManagementView';
import { PublicRegistrationView } from './views/public/PublicRegistrationView';
import { PublicSivecVerifyPage } from './views/sivec/PublicSivecVerifyPage';
import { CoursesManagementView } from './views/courses/CoursesManagementView';
import { TeachersManagementView } from './views/teachers/TeachersManagementView';
import { TeacherPortalView } from './views/teachers/TeacherPortalView';
import { TasksCenterView } from './views/tasks/TasksCenterView';
import { GeneralCalendarView } from './views/calendar/GeneralCalendarView';
import { AnnouncementsManagerView } from './views/communication/AnnouncementsManagerView';
import { AcademicReportsView } from './views/academic/AcademicReportsView';
import { AdministrativeReportsView } from './views/admin/AdministrativeReportsView';
import { StorageExplorerView } from './views/admin/StorageExplorerView';
import { BackupRecoveryView } from './views/admin/BackupRecoveryView';
import { InstitutionSettingsView } from './views/admin/InstitutionSettingsView';
import { FinancialSettingsView } from './views/finance/FinancialSettingsView';
import { PlanManagementView } from './views/admin/PlanManagementView';
import { FutureIntegrationsView } from './views/integrations/FutureIntegrationsView';
import { FundamentalPrinciplesView } from './views/admin/FundamentalPrinciplesView';
import { FolderStructureView } from './views/admin/FolderStructureView';
import { SuperiorityIntegrationView } from './views/integrations/SuperiorityIntegrationView';
import { GraduationWorkflowView } from './views/academic/GraduationWorkflowView';
import { PaymentWorkflowView } from './views/finance/PaymentWorkflowView';
import { SivecWorkflowView } from './views/sivec/SivecWorkflowView';
import { SuperAdminExperienceView } from './views/admin/SuperAdminExperienceView';
import { DirectorExperienceView } from './views/director/DirectorExperienceView';
import { SecretariatExperienceView } from './views/secretariat/SecretariatExperienceView';
import { FinanceExperienceView } from './views/finance/FinanceExperienceView';
import { TeacherExperienceView } from './views/teachers/TeacherExperienceView';
import { PorteiroExperienceView } from './views/porteiro/PorteiroExperienceView';
import { EmpresaExperienceView } from './views/empresa/EmpresaExperienceView';
import { MozcoinWalletView } from './views/mozcoin/MozcoinWalletView';
import { MozcoinBuyView } from './views/mozcoin/MozcoinBuyView';
import { MozcoinAdminApprovalView } from './views/mozcoin/MozcoinAdminApprovalView';
import { MoztechwaveIdPortalView } from './views/auth/MoztechwaveIdPortalView';
import { SigarAuthModal } from './components/common/SigarAuthModal';
import { LanguageProvider } from './i18n/LanguageContext';
import { PublicPortalLanding } from './components/public/PublicPortalLanding';
import { SigarOnboardingTour } from './components/onboarding/SigarOnboardingTour';
import { AccessDeniedView } from './components/security/AccessDeniedView';
import { isRouteAllowed } from './security/routeSecurity';
import { Loader2, Sparkles, Lock, ArrowLeft, LogOut } from 'lucide-react';

import { 
  RegistrationApplication, 
  PaymentTransaction,
  LiveNotification
} from './types';

const MainAppContent: React.FC = () => {
  const { 
    currentRoute, 
    navigate, 
    notifications, 
    markAllNotificationsAsRead, 
    clearNotifications,
    addNotification,
    authLoadingPhase,
    onboardingCompleted,
    completeOnboarding,
    firebaseUser,
    activeRole,
    hasSigarProfile,
    logout
  } = useApp();

  const [activeToast, setActiveToast] = useState<LiveNotification | null>(null);
  const dismissToast = () => setActiveToast(null);
  const clearAllNotifications = () => clearNotifications();
  const triggerSimulatedNotification = () => {
    addNotification({
      title: 'Notificação do Sistema',
      message: 'Atualização do SIGAR processada com sucesso.',
      type: 'system'
    });
  };

  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Progressive Auth Loading Screen (PARTE 4)
  if (authLoadingPhase !== 'idle') {
    const loadingMessage = {
      verificando_sessao: 'Verificando sessão...',
      carregando_perfil: 'Carregando perfil...',
      carregando_instituicao: 'Carregando instituição...',
      carregando_dados: 'Carregando dados...'
    }[authLoadingPhase] || 'Carregando dados...';

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-3xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          </div>
          <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          {loadingMessage}
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 font-mono">
          SIGAR PRO • Comunicação Segura com o Firestore
        </p>

        <div className="w-48 bg-slate-900 h-1.5 rounded-full mt-6 overflow-hidden border border-slate-800">
          <div className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  // If browsing the dedicated public verification page (/verify/{id})
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isVerifyUrl = pathname.startsWith('/verify');
  const verifyIdFromUrl = isVerifyUrl ? decodeURIComponent(pathname.replace(/^\/verify\/?/, '').trim()) : undefined;

  if (isVerifyUrl || currentRoute === 'public_verify' || (currentRoute as string) === 'sivec_verify_public') {
    return (
      <PublicSivecVerifyPage
        initialId={verifyIdFromUrl || undefined}
        onNavigateHome={() => {
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/verify')) {
            window.history.pushState(null, '', '/');
          }
          navigate('public_portal');
        }}
      />
    );
  }

  // If browsing the dedicated Online Registration Public Page
  if (currentRoute === 'inscricao_publica') {
    return <PublicRegistrationView />;
  }

  // If the user is browsing the Public Portal (PARTE 3 - ZERO DADOS PRIVADOS)
  if (currentRoute === 'public_portal') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
        {/* Public Top Navbar strictly conforming to PARTE 3 */}
        <Navbar
          onNavigateToPlatform={() => setAuthModalOpen(true)}
          onOpenPublicVerify={() => navigate('public_verify')}
          onOpenRegisterInstitution={() => setAuthModalOpen(true)}
          onOpenHelp={() => setAuthModalOpen(true)}
        />

        {/* Public Landing (Zero private data) */}
        <main className="flex-1">
          <PublicPortalLanding
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onOpenPublicVerify={() => navigate('public_verify')}
            onOpenRegisterInstitution={() => setAuthModalOpen(true)}
            onOpenHelp={() => setAuthModalOpen(true)}
          />
        </main>

        {/* Secure Authentication & Access Gate Modal (PARTE 6, 7, 8) */}
        <SigarAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  // Back-office Management & Enterprise Modules
  const renderActiveView = () => {
    // If authenticated user does not have a SIGAR profile assigned yet
    if (firebaseUser && hasSigarProfile === false) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 text-center select-none">
          <div className="w-full max-w-md bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Conta Sem Perfil SIGAR</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              A sua conta (<strong className="text-amber-400">{firebaseUser.email}</strong>) foi autenticada, mas ainda não possui um perfil SIGAR associado no Firestore da instituição.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left font-mono space-y-1">
              <div>UID: <span className="text-slate-300">{firebaseUser.uid}</span></div>
              <div>Estado: <span className="text-amber-400">Pendente de Associação</span></div>
            </div>
            <p className="text-xs text-slate-400">
              Contacte a direção ou secretaria da sua instituição para registrar as suas permissões autorizadas.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => navigate('public_portal')}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portal Público</span>
              </button>
              <button
                onClick={logout}
                className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    const isSuper = firebaseUser?.email === 'jafimpaulo8@gmail.com' || (activeRole as string) === 'SUPER_ADMIN' || (activeRole as string) === 'superadmin';
    const isAllowed = isRouteAllowed(currentRoute, activeRole, isSuper);

    if (!isAllowed) {
      return <AccessDeniedView attemptedRoute={currentRoute} />;
    }

    switch (currentRoute as string) {
      case 'moztechwave_core':
      case 'super_admin':
      case 'admin_dashboard':
      case 'admin_instituicoes':
        return <MoztechwaveCoreView />;
      case 'admin_cadastrar':
        return <InstitutionRegistrationWizard />;
      case 'centro_dashboard':
        return <CenterDashboard />;
      case 'alunos_list':
        return <StudentsListView />;
      case 'alunos_cadastrar':
        return <StudentRegistrationForm />;
      case 'alunos_perfil':
        return <StudentProfileView />;
      case 'carteirinhas':
        return <StudentCardGeneratorView />;
      case 'pautas':
        return <PautasManagerView />;
      case 'avaliacoes':
        return <AssessmentsAndGradesView />;
      case 'boletim':
        return <BoletimView />;
      case 'estagios':
        return <InternshipsView />;
      case 'contratos':
      case 'contratos_editor':
        return <ContractsManagerView />;
      case 'studio':
      case 'studio_editor':
        return <DocumentStudioView />;
      case 'sivec_verify':
      case 'sivec_connect':
      case 'sivec_pass':
      case 'sivec_studio':
        return <SivecVerificationView />;
      case 'automacoes':
        return <AutomationCenterView />;
      case 'financial_manager':
        return <FinancialManagerView />;
      case 'financeiro':
      case 'financeiro_modulo29':
        return <FinanceModuleView />;
      case 'pagamentos':
        return <PaymentPortalView />;
      case 'caixa_escolar':
        return <CashRegisterView />;
      case 'relatorios_financeiros':
        return <FinancialReportsView />;
      case 'portaria_acesso':
        return <GateControlView />;
      case 'aluno_qrcode':
        return <StudentQRCodeView />;
      case 'controlo_entrada':
        return <GateEntryControlPanel />;
      case 'turmas_gestao':
        return <ClassManagerView />;
      case 'horarios_calendario':
        return <ScheduleView />;
      case 'professores_gestao':
        return <TeachersManagementView />;
      case 'portal_professor':
        return <TeacherPortalView />;
      case 'diario_professor':
      case 'aulas_frequencia':
        return <LessonsAndAttendanceView />;
      case 'portal_aluno':
      case 'experiencia_aluno':
        return <StudentPortalView />;
      case 'moztechwave_ai':
        return <MoztechwaveAIView />;
      case 'whatsapp_center':
        return <WhatsAppCenterView />;
      case 'tarefas':
      case 'tarefas_gestao':
        return <TasksCenterView />;
      case 'calendario':
      case 'calendario_geral':
        return <GeneralCalendarView />;
      case 'comunicados':
        return <AnnouncementsManagerView />;
      case 'relatorios_academicos':
        return <AcademicReportsView />;
      case 'relatorios_administrativos':
      case 'relatorios_admin':
        return <AdministrativeReportsView />;
      case 'storage_gestao':
        return <StorageExplorerView />;
      case 'backup_recuperacao':
        return <BackupRecoveryView />;
      case 'rbac_matrix':
        return <RBACMatrixView />;
      case 'candidatos_gestao':
        return <CandidatesManagementView />;
      case 'cursos_gestao':
        return <CoursesManagementView />;
      case 'inscricao_publica':
        return <PublicRegistrationView />;
      case 'configuracoes_instituicao':
        return <InstitutionSettingsView />;
      case 'configuracoes_financeiras':
        return <FinancialSettingsView />;
      case 'sistema_planos':
      case 'planos_gestao':
        return <PlanManagementView />;
      case 'integracoes_futuras':
      case 'integracoes_hub':
        return <FutureIntegrationsView />;
      case 'principio_fundamental':
      case 'sistema_arquitetura':
      case 'arquitetura_sistema':
        return <FundamentalPrinciplesView />;
      case 'estrutura_pastas':
      case 'estrutura_arquitetura':
        return <FolderStructureView />;
      case 'superioridade_integrada':
      case 'regras_desenvolvimento':
      case 'migracao_dados':
        return <SuperiorityIntegrationView />;
      case 'fluxo_conclusao':
        return <GraduationWorkflowView />;
      case 'fluxo_pagamento':
        return <PaymentWorkflowView />;
      case 'fluxo_sivec':
        return <SivecWorkflowView />;
      case 'experiencia_superadmin':
        return <SuperAdminExperienceView />;
      case 'experiencia_diretor':
        return <DirectorExperienceView />;
      case 'experiencia_secretaria':
        return <SecretariatExperienceView />;
      case 'experiencia_financeiro':
        return <FinanceExperienceView />;
      case 'experiencia_professor':
        return <TeacherExperienceView />;
      case 'experiencia_porteiro':
        return <PorteiroExperienceView />;
      case 'experiencia_empresa':
        return <EmpresaExperienceView />;
      case 'mozcoin_wallet':
        return <MozcoinWalletView />;
      case 'mozcoin_comprar':
        return <MozcoinBuyView />;
      case 'mozcoin_aprovacao':
        return <MozcoinAdminApprovalView />;
      case 'moztechwave_id':
        return <MoztechwaveIdPortalView />;
      default:
        return <CenterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Enterprise Left Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <AppHeader
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenNotificationCenter={() => setNotificationCenterOpen(!notificationCenterOpen)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Dynamic Route View (with safe bottom padding for MobileBottomNav) */}
        <main className="flex-1 overflow-y-auto bg-[#090d16] pb-20 lg:pb-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Institutional Mobile Bottom Navigation */}
      <MobileBottomNav
        onOpenMobileMenu={() => setMobileSidebarOpen(true)}
      />

      {/* Onboarding Guided Tour (PARTE 14 & 15) */}
      <SigarOnboardingTour
        isOpen={!onboardingCompleted && !!firebaseUser}
        role={activeRole}
        userName={firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Utilizador'}
        onComplete={completeOnboarding}
        onSkip={completeOnboarding}
      />

      {/* Secure Authentication & Access Gate Modal */}
      <SigarAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Real-Time Notification Center Drawer */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onClearAll={clearAllNotifications}
        onTriggerSimulatedNotification={triggerSimulatedNotification}
        activeToast={activeToast}
        onDismissToast={dismissToast}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppProvider>
          <ToastProvider>
            <MainAppContent />
          </ToastProvider>
        </AppProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
