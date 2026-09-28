import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Check, 
  Compass, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Award, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  Bell, 
  User, 
  HelpCircle,
  Building2,
  Users,
  DollarSign
} from 'lucide-react';
import { UserRole } from '../../types';
import { soundManager } from '../../utils/audio';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  target?: string;
}

interface SigarOnboardingTourProps {
  isOpen: boolean;
  role: UserRole;
  userName?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export const SigarOnboardingTour: React.FC<SigarOnboardingTourProps> = ({
  isOpen,
  role,
  userName = 'Utilizador',
  onComplete,
  onSkip
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  // Normalize role
  const normRole = String(role).toUpperCase();

  // Generate role-specific steps (PARTE 14 & PARTE 15)
  const getSteps = (): TourStep[] => {
    const baseWelcome: TourStep = {
      title: 'Bem-vindo ao SIGAR PRO',
      description: `Olá, ${userName}! Este é o seu portal seguro e integrado de gestão académica em Moçambique. Siga este breve roteiro para conhecer as suas ferramentas.`,
      icon: <Sparkles className="w-6 h-6 text-sky-400" />,
      badge: 'Início',
      target: 'header'
    };

    let roleSteps: TourStep[] = [];

    if (normRole === 'ALUNO' || normRole === 'STUDENT') {
      roleSteps = [
        {
          title: 'Meu Perfil & Identificação',
          description: 'Consulte os seus dados biográficos, código SIVEC do aluno, dados de contacto e situação de matrícula.',
          icon: <User className="w-6 h-6 text-indigo-400" />,
          badge: 'Aluno'
        },
        {
          title: 'Minhas Disciplinas & Cursos',
          description: 'Acompanhe a sua grade curricular, módulos formativos e progresso em cada disciplina do curso.',
          icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
          badge: 'Académico'
        },
        {
          title: 'Horário das Aulas',
          description: 'Visualize os seus horários semanais, salas de aula, docentes e avisos de início de sessão.',
          icon: <Calendar className="w-6 h-6 text-amber-400" />,
          badge: 'Horários'
        },
        {
          title: 'Minhas Notas & Avaliações',
          description: 'Consulte pautas oficiais, notas de testes, exames e trabalhos homologados pela secretaria.',
          icon: <FileText className="w-6 h-6 text-rose-400" />,
          badge: 'Desempenho'
        },
        {
          title: 'Frequência & Presenças',
          description: 'Monitore a sua assiduidade e percentagem de presenças registradas pelos formadores.',
          icon: <Check className="w-6 h-6 text-teal-400" />,
          badge: 'Presenças'
        },
        {
          title: 'Pagamentos & Propinas',
          description: 'Consulte mensalidades, referências M-Pesa/e-Mola e recibos digitais emitidos.',
          icon: <CreditCard className="w-6 h-6 text-cyan-400" />,
          badge: 'Financeiro'
        },
        {
          title: 'Certificados & Carteirinha Digital',
          description: 'Acesse o seu certificado com selo SIVEC e QR Code digital para acesso à portaria.',
          icon: <Award className="w-6 h-6 text-yellow-400" />,
          badge: 'Certificação'
        }
      ];
    } else if (normRole === 'PROFESSOR' || normRole === 'FORMADOR') {
      roleSteps = [
        {
          title: 'Suas Turmas & Cursos',
          description: 'Visualize as turmas atribuídas à sua docência com listagem e dados dos formandos.',
          icon: <Users className="w-6 h-6 text-indigo-400" />,
          badge: 'Docência'
        },
        {
          title: 'Diário de Aulas & Frequência',
          description: 'Lance sumários de aulas e registre presenças e faltas dos formandos em tempo real.',
          icon: <Calendar className="w-6 h-6 text-emerald-400" />,
          badge: 'Aulas'
        },
        {
          title: 'Avaliações & Pautas',
          description: 'Lance notas parciais, exames e gere pautas académicas com médias calculadas.',
          icon: <FileText className="w-6 h-6 text-amber-400" />,
          badge: 'Pautas'
        },
        {
          title: 'Materiais Didáticos',
          description: 'Partilhe apostilas, exercícios e apresentações diretamente com os estudantes.',
          icon: <BookOpen className="w-6 h-6 text-cyan-400" />,
          badge: 'Recursos'
        }
      ];
    } else if (normRole === 'SECRETARIA') {
      roleSteps = [
        {
          title: 'Inscrições & Candidaturas',
          description: 'Analise candidatos online, aprove inscrições e valide documentação submetida.',
          icon: <FileText className="w-6 h-6 text-sky-400" />,
          badge: 'Secretaria'
        },
        {
          title: 'Matrículas & Alunos',
          description: 'Efetive matrículas, atribua números de processo e gerencie o cadastro de estudantes.',
          icon: <Users className="w-6 h-6 text-emerald-400" />,
          badge: 'Alunos'
        },
        {
          title: 'Transferências & Turmas',
          description: 'Organize enturmações, vagas por turma e transferências internas entre filiais.',
          icon: <Building2 className="w-6 h-6 text-purple-400" />,
          badge: 'Turmas'
        },
        {
          title: 'Documentos Oficiais & Declarações',
          description: 'Gere declarações com código de validação, termos e pautas homologadas.',
          icon: <Award className="w-6 h-6 text-amber-400" />,
          badge: 'SIVEC'
        }
      ];
    } else if (normRole === 'FINANCEIRO') {
      roleSteps = [
        {
          title: 'Gestão de Pagamentos & Propinas',
          description: 'Acompanhe liquidações de propinas, taxas de inscrição e emolumentos em tempo real.',
          icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
          badge: 'Financeiro'
        },
        {
          title: 'Caixa Escolar & Sessões',
          description: 'Abra e feche sessões de caixa com conciliação automática de entradas por método.',
          icon: <CreditCard className="w-6 h-6 text-cyan-400" />,
          badge: 'Caixa'
        },
        {
          title: 'Contas a Receber & Inadimplência',
          description: 'Monitore formandos com propinas pendentes e envie lembretes por SMS e WhatsApp.',
          icon: <FileText className="w-6 h-6 text-amber-400" />,
          badge: 'Cobrança'
        },
        {
          title: 'Relatórios Financeiros',
          description: 'Exporte relatórios contabilísticos e balancetes por período, curso ou filial.',
          icon: <Award className="w-6 h-6 text-rose-400" />,
          badge: 'Relatórios'
        }
      ];
    } else if (normRole === 'SUPER_ADMIN' || normRole === 'SUPERADMIN') {
      roleSteps = [
        {
          title: 'Gestão Global de Instituições',
          description: 'Supervisione centros de formação técnica, faculdades e filiais registadas no SIGAR.',
          icon: <Building2 className="w-6 h-6 text-sky-400" />,
          badge: 'Super Admin'
        },
        {
          title: 'Segurança & RBAC Matrix',
          description: 'Controle perfis de acesso, permissões granulares e tokens criptográficos.',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
          badge: 'Segurança'
        },
        {
          title: 'Auditoria & Logs em Tempo Real',
          description: 'Rastreie alterações críticas em dados de notas, pagamentos e utilizadores.',
          icon: <FileText className="w-6 h-6 text-amber-400" />,
          badge: 'Auditoria'
        },
        {
          title: 'Configurações Globais & Cloud',
          description: 'Monitore conectividade Firebase Firestore, integrações de pagamento e SIVEC.',
          icon: <Sparkles className="w-6 h-6 text-purple-400" />,
          badge: 'Sistema'
        }
      ];
    } else {
      // Diretor / Gestor
      roleSteps = [
        {
          title: 'Visão Geral & Indicadores',
          description: 'Acompanhe taxa de ocupação, matrículas ativas, evasão e receita em tempo real.',
          icon: <Building2 className="w-6 h-6 text-sky-400" />,
          badge: 'Direção'
        },
        {
          title: 'Filiais & Delegações',
          description: 'Monitore o desempenho de cada polo institucional e compare métricas.',
          icon: <Users className="w-6 h-6 text-emerald-400" />,
          badge: 'Campi'
        },
        {
          title: 'Homologação & Aprovações',
          description: 'Aprove pautas finais, pedidos de encerramento de turmas e emissão de diplomas.',
          icon: <Award className="w-6 h-6 text-amber-400" />,
          badge: 'Aprovações'
        },
        {
          title: 'Relatórios Executivos',
          description: 'Gere relatórios para a tutela governamental e inspeção geral de educação.',
          icon: <FileText className="w-6 h-6 text-indigo-400" />,
          badge: 'Relatórios'
        }
      ];
    }

    const universalClosing: TourStep[] = [
      {
        title: 'Notificações & Alertas',
        description: 'No topo superior direito, o sino sinaliza aprovações de inscrições, pagamentos e avisos.',
        icon: <Bell className="w-6 h-6 text-amber-400" />,
        badge: 'Alertas',
        target: 'notifications'
      },
      {
        title: 'Central de Ajuda & Suporte',
        description: 'Sempre que precisar, consulte a documentação e os contactos de suporte no menu do utilizador.',
        icon: <HelpCircle className="w-6 h-6 text-emerald-400" />,
        badge: 'Ajuda',
        target: 'help'
      },
      {
        title: 'Pode Voltar ao Tutorial Quando Quiser',
        description: 'Pode reiniciar este guia de introdução a qualquer momento nas opções do seu perfil.',
        icon: <Compass className="w-6 h-6 text-sky-400" />,
        badge: 'Concluído'
      }
    ];

    return [baseWelcome, ...roleSteps, ...universalClosing];
  };

  const steps = getSteps();
  const currentStep = steps[currentStepIndex] || steps[0];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    soundManager.playClick();
    if (isLast) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    soundManager.playClick();
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <Compass className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Guia Interativo • SIGAR PRO
              </h3>
              <p className="text-[11px] text-slate-400">
                Passo {currentStepIndex + 1} de {steps.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onSkip();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Pular tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Card Content */}
        <div className="my-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-inner">
              {currentStep.icon}
            </div>
            <div>
              {currentStep.badge && (
                <span className="inline-block px-2 py-0.5 mb-1 text-[10px] font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {currentStep.badge}
                </span>
              )}
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            {currentStep.description}
          </p>
        </div>

        {/* Action Controls (PARTE 14) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Pular tutorial
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-950/40 transition-all cursor-pointer"
            >
              <span>{isLast ? 'Concluir' : 'Próximo'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
