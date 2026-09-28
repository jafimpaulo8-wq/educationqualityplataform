import React, { useState } from 'react';
import { 
  HeroGallery 
} from '../../components/HeroGallery';
import { 
  CertificateShowcase 
} from '../../components/CertificateShowcase';
import { 
  CourseCatalog 
} from '../../components/CourseCatalog';
import { 
  RegistrationWizard 
} from '../../components/RegistrationWizard';
import { 
  PaymentIntegrationsView 
} from '../../components/PaymentIntegrationsView';
import { 
  DigitalGatePass 
} from '../../components/DigitalGatePass';
import { 
  ApplicationTracker 
} from '../../components/ApplicationTracker';
import { 
  Course, 
  RegistrationApplication 
} from '../../types';
import { 
  INITIAL_REGISTRATIONS 
} from '../../data/mockData';
import { 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  QrCode, 
  Search, 
  Award, 
  Layers,
  ArrowRight,
  School
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SigarAuthModal } from '../../components/common/SigarAuthModal';

export const PublicPortalView: React.FC = () => {
  const { navigate, addNotification, courses } = useApp();

  const [activeTab, setActiveTab] = useState<'inscricao' | 'consultar' | 'cartao' | 'pagamentos' | 'certificados'>('inscricao');
  const [selectedCourseForRegistration, setSelectedCourseForRegistration] = useState<Course | null>(null);
  const [applications, setApplications] = useState<RegistrationApplication[]>(INITIAL_REGISTRATIONS);
  const [latestRegistration, setLatestRegistration] = useState<RegistrationApplication | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseForRegistration(course);
    setActiveTab('inscricao');
    const element = document.getElementById('portal-actions-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegistrationComplete = (app: RegistrationApplication) => {
    setApplications(prev => [app, ...prev]);
    setLatestRegistration(app);
    setActiveTab('cartao');
    addNotification({
      title: 'Inscrição Submetida com Sucesso',
      message: `${app.fullName} registrou-se no curso de ${app.courseName}. Cartão digital gerado.`,
      type: 'registration',
      metadata: { code: app.code, name: app.fullName }
    });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Top Welcome Notification & Center Switcher */}
      <div className="bg-slate-900 border-b border-slate-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Matrículas Abertas para o 2º Semestre 2026 em Maputo, Matola e Beira.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer bg-sky-950/40 border border-sky-800/40 px-3 py-1 rounded-xl"
            >
              <span>Painel de Gestão (Direção &amp; Super Admin)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Visual Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroGallery 
          onStartRegistration={() => {
            setActiveTab('inscricao');
            document.getElementById('portal-actions-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onViewCertificates={() => {
            setActiveTab('consultar');
            document.getElementById('portal-actions-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenPayments={() => {
            setActiveTab('pagamentos');
            document.getElementById('portal-actions-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* Course Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CourseCatalog onSelectCourseToEnroll={(courseId) => {
          const found = courses.find(c => c.id === courseId);
          if (found) handleSelectCourse(found);
        }} />
      </div>

      {/* Interactive Tabs: Inscrição, Consulta, Cartão, Pagamentos */}
      <div id="portal-actions-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Serviços Acadêmicos Digitais SIVERC
            </h2>
            <p className="text-xs text-slate-400">
              Faça sua inscrição, acompanhe seu processo ou aceda ao seu passe de estudante instantâneo.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('inscricao')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'inscricao' ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Ficha de Inscrição
            </button>
            <button
              onClick={() => setActiveTab('consultar')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'consultar' ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Consultar Inscrição
            </button>
            <button
              onClick={() => setActiveTab('cartao')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'cartao' ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Cartão Digital (Portaria)
            </button>
            <button
              onClick={() => setActiveTab('pagamentos')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pagamentos' ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Pagamentos M-Pesa &amp; e-Mola
            </button>
          </div>
        </div>

        {/* Tab Displays */}
        {activeTab === 'inscricao' && (
          <RegistrationWizard
            initialCourseId={selectedCourseForRegistration?.id}
            onRegistrationComplete={handleRegistrationComplete}
          />
        )}

        {activeTab === 'consultar' && (
          <ApplicationTracker applications={applications} />
        )}

        {activeTab === 'cartao' && (
          <DigitalGatePass applications={latestRegistration ? [latestRegistration, ...applications] : applications} />
        )}

        {activeTab === 'pagamentos' && (
          <PaymentIntegrationsView />
        )}
      </div>

      {/* Official Certificate Showcase & SIVEC Verifier */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CertificateShowcase />
      </div>

      {/* Authentication & Access Gate Modal */}
      <SigarAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};
