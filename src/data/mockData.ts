import { CEU_AZUL_INSTITUTION, CEU_AZUL_STUDENTS } from './ceuAzulData';
import { 
  Course, 
  RegistrationApplication, 
  CertificateData, 
  LiveNotification,
  Institution,
  Student,
  ClassGroup,
  StudentClassTransfer,
  ClassScheduleSlot,
  ContractTemplate,
  GeneratedContract,
  CashRegisterSession,
  ClassLesson,
  LessonAttendanceAuditLog,
  GateAccessLog,
  Teacher,
  WhatsAppConnection,
  DashboardTask,
  StudentNotice,
  OnlineRegistrationConfig,
  OnlineCourseConfig,
  EvaluationItem,
  CalculationFormula,
  AssessmentType,
  InternshipContract,
  InternshipStatus,
  PautaHomologationRecord
} from '../types';

export const PROVINCES_MOZAMBIQUE = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Cabo Delgado',
  'Niassa',
];

export const DEFAULT_ONLINE_REGISTRATION_CONFIG: OnlineRegistrationConfig = {
  institutionId: 'inst-1',
  isOpen: true,
  title: 'Inscrições Abertas - 2º Semestre 2026',
  description: 'Garanta a sua vaga nos cursos técnico-profissionais com maior índice de empregabilidade em Moçambique. Candidatura rápida, submissão digital de documentos e análise prioritária pela secretaria acadêmica.',
  startDate: '2026-08-01',
  endDate: '2026-10-31',
  academicYear: '2026/2027',
  semester: '2º Semestre',
  requiredFields: {
    email: true,
    phone: true,
    documentNumber: true,
    birthDate: true,
    gender: true,
    province: true,
    city: true,
    address: true,
    guardianName: false,
    guardianPhone: false
  },
  requiredDocuments: [
    'Bilhete de Identidade (BI) ou Passaporte válido',
    'Certificado de Habilitações Literárias (10ª ou 12ª Classe)',
    'Declaração de NUIT (Identificação Tributária)',
    'Fotografia tipo passe recente (fundo branco)'
  ],
  customQuestions: [
    {
      id: 'q1',
      question: 'Como tomou conhecimento dos nossos cursos?',
      type: 'select',
      options: ['Redes Sociais (Facebook / Instagram)', 'Recomendação de Colega / Familiar', 'Website Oficial Moztechwave', 'Visita Presencial ao Campus', 'Outro'],
      required: true
    },
    {
      id: 'q2',
      question: 'Possui computador portátil próprio para os projetos práticos?',
      type: 'boolean',
      required: true
    },
    {
      id: 'q3',
      question: 'Qual o seu nível de escolaridade atual?',
      type: 'select',
      options: ['10ª Classe Concluída', '12ª Classe Geral Concluída', 'Técnico Básico ou Médio', 'Frequência Universitária', 'Licenciatura Concluída'],
      required: true
    },
    {
      id: 'q4',
      question: 'Tem interesse em plano de pagamento parcelado ou financiamento estudantil?',
      type: 'boolean',
      required: false
    }
  ],
  coursesConfig: [
    {
      courseId: 'prog-fullstack',
      courseName: 'Engenharia de Software & Web Full-Stack',
      category: 'Tecnologia',
      active: true,
      price: 1500,
      monthlyFee: 4500,
      duration: '12 Meses (1200h)',
      requirements: ['10ª Classe Concluída ou equivalente', 'Conhecimentos básicos de computador', 'Idade mínima 16 anos'],
      vacancies: 35,
      filledVacancies: 29,
      regimes: ['Pós-Laboral', 'Laboral', 'Online EAD'],
      shifts: ['Manhã (08:00 - 12:00)', 'Tarde (13:30 - 17:30)', 'Noite (18:00 - 21:30)'],
      documents: ['BI / Passaporte', 'Certificado 10ª ou 12ª', 'Foto Passe']
    },
    {
      courseId: 'cybersecurity-redes',
      courseName: 'Cibersegurança & Infraestrutura de Redes Cisco',
      category: 'Tecnologia',
      active: true,
      price: 1500,
      monthlyFee: 4800,
      duration: '9 Meses (800h)',
      requirements: ['12ª Classe Concluída', 'Noções de arquitetura de computadores', 'Idade mínima 17 anos'],
      vacancies: 30,
      filledVacancies: 26,
      regimes: ['Laboral', 'Pós-Laboral'],
      shifts: ['Manhã (08:00 - 12:00)', 'Noite (18:00 - 21:30)'],
      documents: ['BI / Passaporte', 'Certificado 12ª', 'NUIT']
    },
    {
      courseId: 'contabilidade-gestao',
      courseName: 'Contabilidade Informatizada & Gestão Fiscal (PGC-NIRF)',
      category: 'Gestão',
      active: true,
      price: 1200,
      monthlyFee: 3800,
      duration: '10 Meses (950h)',
      requirements: ['10ª Classe Concluída', 'Cálculo aritmético básico'],
      vacancies: 40,
      filledVacancies: 37,
      regimes: ['Pós-Laboral', 'Laboral'],
      shifts: ['Tarde (13:30 - 17:30)', 'Noite (18:00 - 21:30)'],
      documents: ['BI / Passaporte', 'Certificado de Habilitações']
    }
  ],
  autoApproveOnPayment: false,
  confirmationMessageTemplate: 'Prezado(a) {NOME}, sua inscrição no curso {CURSO} foi submetida com sucesso! Código: {CODIGO}. Acompanhe seu status pelo portal.'
};

export const INITIAL_INSTITUTIONS: Institution[] = [
  CEU_AZUL_INSTITUTION as Institution,
  {
    id: 'inst-1',
    code: 'MTW-CF-0001',
    name: 'Centro de Formação Técnico Profissional Moztechwave (CFTPM)',
    type: 'centro_formacao',
    nuit: '400192831',
    licenseNumber: 'ALV-MEC-2024/918',
    representativeName: 'Eng. Paulo Jafim Pereira',
    representativeRole: 'Diretor Geral & Coordenador Executivo',
    phone: '+258 84 900 1200',
    email: 'direcao@moztechwave.co.mz',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: 'Av. 24 de Julho nº 1840, 3º Andar',
    plan: 'ENTERPRISE',
    status: 'Ativa',
    connectedSystem: 'SIGAR',
    sivecEnabled: true,
    totalStudents: 428,
    totalTeachers: 31,
    totalCourses: 6,
    createdAt: '2024-01-15',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    subscription: {
      planId: 'enterprise',
      planName: 'ENTERPRISE',
      status: 'active',
      billingCycle: 'anual',
      priceMZN: 38000,
      startDate: '2024-01-15',
      renewalDate: '2027-01-15',
      usage: {
        students: 428,
        users: 31,
        branches: 2,
        storageGB: 182.4,
        monthlyCertificates: 215,
        whatsappMonthlyMessages: 4320,
        sivecMonthlyVerifications: 1890,
        onlineClassesMonthlyHours: 110,
        aiMonthlyPrompts: 840,
        lastUpdated: '2026-09-21'
      }
    },
    branches: [
      {
        id: 'branch-1-maputo',
        institutionId: 'inst-1',
        name: 'Campus Central (Maputo Sede)',
        code: 'CFTPM-MAP',
        phone: '+258 84 900 1200',
        email: 'maputo@moztechwave.co.mz',
        address: 'Av. 24 de Julho nº 1840, 3º Andar',
        city: 'Maputo',
        province: 'Maputo Cidade',
        directorName: 'Eng. Paulo Jafim',
        isMainBranch: true,
        createdAt: '2024-01-15'
      },
      {
        id: 'branch-1-matola',
        institutionId: 'inst-1',
        name: 'Delegação Matola (Polo Industrial)',
        code: 'CFTPM-MAT',
        phone: '+258 87 900 1201',
        email: 'matola.polo@moztechwave.co.mz',
        address: 'Av. da OUA nº 412, Matola Rio',
        city: 'Matola',
        province: 'Maputo Província',
        directorName: 'Dra. Amina Abdul',
        isMainBranch: false,
        createdAt: '2024-08-20'
      },
      {
        id: 'branch-1-nacala',
        institutionId: 'inst-1',
        name: 'Campus Nacala-Porto',
        code: 'CFTPM-NAC',
        phone: '+258 84 900 1206',
        email: 'nacala@moztechwave.co.mz',
        address: 'Bairro Triângulo, Estrada Nacional nº 1',
        city: 'Nacala-Porto',
        province: 'Nampula',
        directorName: 'Dr. Abdul Carimo',
        isMainBranch: false,
        createdAt: '2024-05-12'
      },
      {
        id: 'branch-1-mathapue',
        institutionId: 'inst-1',
        name: 'Campus Mathapue',
        code: 'CFTPM-MATP',
        phone: '+258 84 900 1207',
        email: 'mathapue@moztechwave.co.mz',
        address: 'Zona de Mathapue, Polo Vocacional',
        city: 'Nacala-Porto',
        province: 'Nampula',
        directorName: 'Prof. Sérgio Mapasse',
        isMainBranch: false,
        createdAt: '2024-09-01'
      },
      {
        id: 'branch-1-beira',
        institutionId: 'inst-1',
        name: 'Campus Regional Beira (Sofala)',
        code: 'CFTPM-BEI',
        phone: '+258 84 900 1205',
        email: 'beira@moztechwave.co.mz',
        address: 'Rua do Comércio nº 102, Chaimite',
        city: 'Beira',
        province: 'Sofala',
        directorName: 'Prof. Mateus Cossa',
        isMainBranch: false,
        createdAt: '2025-01-10'
      }
    ],
    financialAccounts: [
      {
        id: 'fa-1',
        bankName: 'Millennium BIM',
        accountNumber: '109283741',
        nib: '000100000010928374102',
        mpesaNumber: '+258 84 900 1200',
        emolaNumber: '+258 87 900 1200',
        currency: 'MZN',
        isDefault: true
      },
      {
        id: 'fa-2',
        bankName: 'BCI (Banco Comercial e de Investimentos)',
        accountNumber: '298371029',
        nib: '000800000029837102944',
        currency: 'MZN',
        isDefault: false
      }
    ],
    prefixes: {
      studentPrefix: 'CFTPM-AL',
      candidatePrefix: 'CFTPM-CAND',
      certificatePrefix: 'CFTPM-CERT',
      receiptPrefix: 'CFTPM-REC',
      contractPrefix: 'CFTPM-CTR'
    },
    financialSettings: {
      fineAmount: 250,
      interestRateDaily: 0.5,
      bankInfo: 'Millennium BIM: 109283741 | BCI: 298371029',
      pixKey: 'Conta M-Pesa Empresarial: 849001200',
      dueDay: 10
    },
    whatsAppConfig: {
      institutionId: 'inst-1',
      status: 'conectado',
      instanceName: 'CFTPM-OFICIAL-01',
      phoneNumber: '+258 84 900 1200',
      dailyMessagesSent: 342,
      lastSync: 'Hoje, 11:42'
    },
    certificateCurrentSequence: 1042,
    onlineRegistrationConfig: DEFAULT_ONLINE_REGISTRATION_CONFIG
  },
  {
    id: 'inst-2',
    code: 'MTW-CF-0002',
    name: 'Centro Tecnológico de Inovação da Matola (CTIM)',
    type: 'centro_formacao',
    nuit: '400817264',
    licenseNumber: 'ALV-MEC-2025/112',
    representativeName: 'Dra. Filomena Macamo',
    representativeRole: 'Diretora Pedagógica',
    phone: '+258 87 210 3400',
    email: 'matola@moztechwave.co.mz',
    province: 'Maputo Província',
    city: 'Matola',
    address: 'Av. das Indústrias, Parcela 409',
    plan: 'PROFISSIONAL',
    status: 'Ativa',
    connectedSystem: 'SIGAR',
    sivecEnabled: true,
    totalStudents: 184,
    totalTeachers: 14,
    totalCourses: 4,
    createdAt: '2025-02-10',
    subscription: {
      planId: 'profissional',
      planName: 'PROFISSIONAL',
      status: 'active',
      billingCycle: 'mensal',
      priceMZN: 6500,
      startDate: '2025-02-10',
      renewalDate: '2026-10-10',
      usage: {
        students: 184,
        users: 14,
        branches: 1,
        storageGB: 18.5,
        monthlyCertificates: 94,
        whatsappMonthlyMessages: 388,
        sivecMonthlyVerifications: 142,
        onlineClassesMonthlyHours: 24,
        aiMonthlyPrompts: 112,
        lastUpdated: '2026-09-21'
      }
    },
    branches: [
      {
        id: 'branch-2-matola',
        institutionId: 'inst-2',
        name: 'Sede CTIM (Matola Sede)',
        code: 'CTIM-01',
        phone: '+258 87 210 3400',
        email: 'secretaria@ctim.edu.mz',
        address: 'Av. das Indústrias, Parcela 409',
        city: 'Matola',
        province: 'Maputo Província',
        directorName: 'Dra. Filomena Macamo',
        isMainBranch: true,
        createdAt: '2025-02-10'
      },
      {
        id: 'branch-2-nampula',
        institutionId: 'inst-2',
        name: 'Delegação Nampula (Polo Norte)',
        code: 'CTIM-NAM',
        phone: '+258 87 210 3405',
        email: 'nampula@ctim.edu.mz',
        address: 'Av. Eduardo Mondlane nº 304, Centro da Cidade',
        city: 'Nampula',
        province: 'Nampula',
        directorName: 'Eng. Zacarias Mucavele',
        isMainBranch: false,
        createdAt: '2025-06-18'
      }
    ],
    financialAccounts: [
      {
        id: 'fa-3',
        bankName: 'Standard Bank Moçambique',
        accountNumber: '449182301',
        nib: '000300000044918230188',
        mpesaNumber: '+258 87 210 3400',
        currency: 'MZN',
        isDefault: true
      }
    ],
    prefixes: {
      studentPrefix: 'CTIM-AL',
      certificatePrefix: 'CTIM-CERT',
      receiptPrefix: 'CTIM-REC',
      contractPrefix: 'CTIM-CTR'
    },
    financialSettings: {
      fineAmount: 300,
      interestRateDaily: 0.8,
      bankInfo: 'Standard Bank: 449182301',
      pixKey: 'M-Pesa CTIM: 872103400',
      dueDay: 5
    },
    whatsAppConfig: {
      institutionId: 'inst-2',
      status: 'conectado',
      instanceName: 'CTIM-ZAP-02',
      phoneNumber: '+258 87 210 3400',
      dailyMessagesSent: 88,
      lastSync: 'Hoje, 09:15'
    },
    certificateCurrentSequence: 318
  },
  {
    id: 'inst-3',
    code: 'MTW-EMP-0003',
    name: 'Instituto Politécnico do Centro & Beira (IPCB)',
    type: 'instituicao_ensino',
    nuit: '400010992',
    licenseNumber: 'REG-COM-2018/88',
    representativeName: 'Dr. Lucas Nhantumbo',
    representativeRole: 'Diretor Académico',
    phone: '+258 84 555 8900',
    email: 'ipcb@instituto-centro.mz',
    province: 'Sofala',
    city: 'Beira',
    address: 'Av. Eduardo Mondlane nº 200',
    plan: 'BÁSICO',
    status: 'Ativa',
    connectedSystem: 'SoftGenial',
    sivecEnabled: false,
    totalStudents: 36,
    totalTeachers: 8,
    totalCourses: 2,
    createdAt: '2024-06-01',
    subscription: {
      planId: 'basico',
      planName: 'BÁSICO',
      status: 'active',
      billingCycle: 'mensal',
      priceMZN: 2500,
      startDate: '2024-06-01',
      renewalDate: '2026-10-01',
      usage: {
        students: 36,
        users: 3,
        branches: 1,
        storageGB: 2.8,
        monthlyCertificates: 18,
        whatsappMonthlyMessages: 0,
        sivecMonthlyVerifications: 0,
        onlineClassesMonthlyHours: 0,
        aiMonthlyPrompts: 0,
        lastUpdated: '2026-09-21'
      }
    },
    branches: [
      {
        id: 'branch-3-beira',
        institutionId: 'inst-3',
        name: 'Campus Central Beira',
        code: 'IPCB-BEI',
        phone: '+258 84 555 8900',
        email: 'beira@ipcb.edu.mz',
        address: 'Av. Eduardo Mondlane nº 200',
        city: 'Beira',
        province: 'Sofala',
        directorName: 'Dr. Lucas Nhantumbo',
        isMainBranch: true,
        createdAt: '2024-06-01'
      }
    ],
    financialAccounts: [
      {
        id: 'fa-4',
        bankName: 'Moza Banco',
        accountNumber: '772910392',
        nib: '000500000077291039211',
        currency: 'MZN',
        isDefault: true
      }
    ],
    prefixes: {
      studentPrefix: 'IPCB-AL',
      certificatePrefix: 'IPCB-CERT',
      receiptPrefix: 'IPCB-REC',
      contractPrefix: 'IPCB-CTR'
    },
    financialSettings: {
      fineAmount: 200,
      interestRateDaily: 0.4,
      bankInfo: 'Moza Banco: 772910392',
      pixKey: 'M-Pesa: 845558900',
      dueDay: 15
    },
    whatsAppConfig: {
      institutionId: 'inst-3',
      status: 'aguardando_qr',
      instanceName: 'IPCB-WHATSAPP',
      dailyMessagesSent: 0
    },
    certificateCurrentSequence: 89
  },
  {
    id: 'inst-4',
    code: 'MTW-CF-0004',
    name: 'Academia Politécnica de Nampula (APN)',
    type: 'centro_formacao',
    nuit: '400921045',
    licenseNumber: 'ALV-MEC-2023/401',
    representativeName: 'Prof. Hermenegildo Sitoe',
    representativeRole: 'Reitor Académico',
    phone: '+258 86 312 8800',
    email: 'nampula@moztechwave.co.mz',
    province: 'Nampula',
    city: 'Nampula',
    address: 'Av. do Trabalho nº 880, Muhala',
    plan: 'EMPRESARIAL',
    status: 'Ativa',
    connectedSystem: 'SIGAR',
    sivecEnabled: true,
    totalStudents: 1240,
    totalTeachers: 45,
    totalCourses: 8,
    createdAt: '2023-09-01',
    logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=120&auto=format&fit=crop&q=80',
    subscription: {
      planId: 'empresarial',
      planName: 'EMPRESARIAL',
      status: 'active',
      billingCycle: 'mensal',
      priceMZN: 16000,
      startDate: '2023-09-01',
      renewalDate: '2026-10-01',
      usage: {
        students: 1240,
        users: 28,
        branches: 3,
        storageGB: 96.2,
        monthlyCertificates: 640,
        whatsappMonthlyMessages: 2450,
        sivecMonthlyVerifications: 1980,
        onlineClassesMonthlyHours: 145,
        aiMonthlyPrompts: 720,
        lastUpdated: '2026-09-21'
      }
    },
    branches: [
      {
        id: 'branch-4-nampula',
        institutionId: 'inst-4',
        name: 'Campus Central (Nampula Sede)',
        code: 'APN-NAM',
        phone: '+258 86 312 8800',
        email: 'sede@apn.edu.mz',
        address: 'Av. do Trabalho nº 880',
        city: 'Nampula',
        province: 'Nampula',
        directorName: 'Prof. Hermenegildo Sitoe',
        isMainBranch: true,
        createdAt: '2023-09-01'
      },
      {
        id: 'branch-4-nacala',
        institutionId: 'inst-4',
        name: 'Polo Tecnológico de Nacala-Porto',
        code: 'APN-NAC',
        phone: '+258 86 312 8810',
        email: 'nacala@apn.edu.mz',
        address: 'Zona Industrial de Nacala',
        city: 'Nacala',
        province: 'Nampula',
        directorName: 'Eng. Abdul Remane',
        isMainBranch: false,
        createdAt: '2024-03-15'
      },
      {
        id: 'branch-4-angoche',
        institutionId: 'inst-4',
        name: 'Delegação de Angoche',
        code: 'APN-ANG',
        phone: '+258 86 312 8820',
        email: 'angoche@apn.edu.mz',
        address: 'Bairro Inguri nº 45',
        city: 'Angoche',
        province: 'Nampula',
        directorName: 'Dra. Amina Issufo',
        isMainBranch: false,
        createdAt: '2024-11-20'
      }
    ],
    financialAccounts: [
      {
        id: 'fa-5',
        bankName: 'Millennium BIM',
        accountNumber: '992014820',
        nib: '000100000099201482099',
        currency: 'MZN',
        isDefault: true
      },
      {
        id: 'fa-6',
        bankName: 'BCI',
        accountNumber: '334182910',
        nib: '000800000033418291022',
        currency: 'MZN',
        isDefault: false
      }
    ],
    prefixes: {
      studentPrefix: 'APN-AL',
      certificatePrefix: 'APN-CERT',
      receiptPrefix: 'APN-REC',
      contractPrefix: 'APN-CTR'
    },
    financialSettings: {
      fineAmount: 200,
      interestRateDaily: 0.5,
      bankInfo: 'Millennium BIM: 992014820 | BCI: 334182910',
      pixKey: 'M-Pesa APN: 863128800',
      dueDay: 8
    },
    whatsAppConfig: {
      institutionId: 'inst-4',
      status: 'conectado',
      instanceName: 'APN-CORP-01',
      phoneNumber: '+258 86 312 8800',
      dailyMessagesSent: 198,
      lastSync: 'Hoje, 10:30'
    },
    certificateCurrentSequence: 642
  }
];

export const COURSES_DATA: Course[] = [
  {
    id: 'prog-fullstack',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    name: 'Engenharia de Software & Web Full-Stack',
    code: 'TEC-SW-01',
    category: 'Profissional',
    duration: '12 Meses',
    workloadHours: 1200,
    theoryHours: 400,
    practiceHours: 800,
    modality: 'Híbrido',
    regime: 'Pós-Laboral',
    price: 54000,
    registrationFee: 1500,
    monthlyFee: 4500,
    feeMonthly: 4500,
    certificate: 'Diploma Técnico Médio Profissional (DINET)',
    status: 'Ativo',
    periodType: 'semestral',
    totalVacancies: 35,
    filledVacancies: 29,
    description: 'Formação de alta densidade técnica com React, Node.js, Cloud, Docker e APIs em ambiente prático de software.',
    requirements: [
      '12ª Classe Concluída ou equivalente',
      'Conhecimentos básicos de lógica ou informática',
      'Aptidão para raciocínio analítico'
    ],
    modules: [
      {
        id: 'mod-sw-1',
        name: 'Fundamentos de Algoritmos & JavaScript Moderno',
        code: 'SW-101',
        type: 'disciplina',
        period: '1º Semestre',
        workloadHours: 250,
        theoryHours: 80,
        practiceHours: 170,
        teacherName: 'Eng. Carlos Manuel Sitoe',
        minGrade: 10,
        minAttendance: 75,
        evaluationType: 'provas_e_exame',
        description: 'Estruturas de dados, lógica computacional e ecossistema TypeScript.'
      },
      {
        id: 'mod-sw-2',
        name: 'Desenvolvimento Frontend com React & Tailwind',
        code: 'SW-102',
        type: 'disciplina',
        period: '1º Semestre',
        workloadHours: 350,
        theoryHours: 100,
        practiceHours: 250,
        teacherName: 'Eng. Carlos Manuel Sitoe',
        minGrade: 12,
        minAttendance: 80,
        evaluationType: 'projeto_pratico',
        description: 'Interfaces ricas, estado global e arquitetura SPA.'
      },
      {
        id: 'mod-sw-3',
        name: 'Backend, Bancos de Dados & APIs Cloud',
        code: 'SW-201',
        type: 'disciplina',
        period: '2º Semestre',
        workloadHours: 350,
        theoryHours: 110,
        practiceHours: 240,
        teacherName: 'Eng. Paulo Jafim Pereira',
        minGrade: 10,
        minAttendance: 75,
        evaluationType: 'provas_e_exame',
        description: 'Node.js, PostgreSQL, Docker e Microsserviços.'
      },
      {
        id: 'mod-sw-4',
        name: 'Projeto de Conclusão & Estágio Supervisionado',
        code: 'SW-202',
        type: 'estagio_pratico',
        period: '2º Semestre',
        workloadHours: 250,
        theoryHours: 30,
        practiceHours: 220,
        teacherName: 'Eng. Paulo Jafim Pereira',
        minGrade: 12,
        minAttendance: 85,
        evaluationType: 'projeto_pratico',
        description: 'Desenvolvimento de software real em ambiente corporativo.'
      }
    ],
    highlights: [
      'Laboratórios modernos com fibra dedicada',
      'Estágio garantido em empresas parceiras Moztechwave',
      'Certificação reconhecida nacional e internacionalmente'
    ],
    icon: 'Code2',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80',
    level: 'Técnico Médio Profissional'
  },
  {
    id: 'maquinas-pesadas',
    institutionId: 'inst-1',
    branchId: 'branch-1-matola',
    name: 'Operador de Retroescavadeira, Pá Carregadora & Empilhadora',
    code: 'MAQ-OP-03',
    category: 'Máquinas Pesadas',
    duration: '3 Meses',
    workloadHours: 240,
    theoryHours: 60,
    practiceHours: 180,
    modality: 'Prático em Oficina/Campo',
    regime: 'Laboral',
    price: 28500,
    registrationFee: 2000,
    monthlyFee: 0, // Pagamento do pacote do curso
    feeMonthly: 0,
    certificate: 'Certificado de Aptidão Técnico-Operacional com Carteira Profissional de Operador',
    status: 'Inscrições Abertas',
    periodType: 'por_etapa',
    totalVacancies: 20,
    filledVacancies: 17,
    description: 'Curso intensivo de segurança operacional, mecânica básica do equipamento, manobras no simulador e operação real em campo de terraplanagem.',
    requirements: [
      'Carta de Condução Categoria C, C1 ou B com 2 anos',
      'Idade mínima de 21 anos',
      'Atestado médico de aptidão física e visual'
    ],
    modules: [
      {
        id: 'mod-maq-1',
        name: 'Etapa 1: Legislação, NR-11 & Segurança Operacional',
        code: 'MAQ-SEG-01',
        type: 'etapa',
        period: 'Etapa 1: Teórica & Segurança',
        workloadHours: 40,
        theoryHours: 35,
        practiceHours: 5,
        teacherName: 'Instrutor Alberto Mabunda',
        minGrade: 14,
        minAttendance: 90,
        evaluationType: 'provas_e_exame',
        description: 'Prevenção de acidentes, EPIs e checklist diário de inspeção da máquina.'
      },
      {
        id: 'mod-maq-2',
        name: 'Etapa 2: Simulação Virtual & Manobras de Precisão',
        code: 'MAQ-SIM-02',
        type: 'modulo',
        period: 'Etapa 2: Simulador Dinâmico',
        workloadHours: 60,
        theoryHours: 10,
        practiceHours: 50,
        teacherName: 'Instrutor Alberto Mabunda',
        minGrade: 12,
        minAttendance: 85,
        evaluationType: 'teste_operacional',
        description: 'Controles hidráulicos, joystick, estabilizadores e nivelamento de terreno.'
      },
      {
        id: 'mod-maq-3',
        name: 'Etapa 3: Operação Prática em Campo de Mineração / Obra',
        code: 'MAQ-PRAT-03',
        type: 'estagio_pratico',
        period: 'Etapa 3: Campo Real',
        workloadHours: 140,
        theoryHours: 10,
        practiceHours: 130,
        teacherName: 'Instrutor Alberto Mabunda',
        minGrade: 14,
        minAttendance: 95,
        evaluationType: 'teste_operacional',
        description: 'Escavação de valas, carregamento de caminhões basculantes e empilhamento seguro.'
      }
    ],
    highlights: [
      'Simulador industrial com cabine 3DOF',
      'Prática direta em Retroescavadeiras CAT e JCB',
      'Emissão de Carteira de Operador credenciada'
    ],
    icon: 'Truck',
    image: 'https://images.unsplash.com/photo-1579482382477-d6480e663a83?w=900&auto=format&fit=crop&q=80',
    level: 'Capacitação Técnica Operacional'
  },
  {
    id: 'ingles-tecnico-oil-gas',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    name: 'Inglês Técnico para Negócios, Petróleo & Gás',
    code: 'ING-OG-02',
    category: 'Línguas / Inglês',
    duration: '6 Meses',
    workloadHours: 180,
    theoryHours: 60,
    practiceHours: 120,
    modality: 'Semi-presencial',
    regime: 'Pós-Laboral',
    price: 18000,
    registrationFee: 1000,
    monthlyFee: 3000,
    feeMonthly: 3000,
    certificate: 'Certificado de Fluência em Inglês Técnico e Corporativo (B2 CEFR)',
    status: 'Ativo',
    periodType: 'trimestral',
    totalVacancies: 25,
    filledVacancies: 21,
    description: 'Desenvolvimento de fluência oral e escrita aplicada à indústria de hidrocarbonetos da Bacia do Rovuma, mineração, contratos e reuniões internacionais.',
    requirements: [
      'Conhecimento básico de inglês (nível pré-intermediário A2 comprovado ou teste diagnóstico)',
      '10ª Classe Concluída'
    ],
    modules: [
      {
        id: 'mod-ing-1',
        name: 'Oil & Gas Terminology & Safety Communications',
        code: 'ING-101',
        type: 'disciplina',
        period: '1º Trimestre',
        workloadHours: 60,
        theoryHours: 20,
        practiceHours: 40,
        teacherName: 'Profª. Sarah Jenkins',
        minGrade: 12,
        minAttendance: 80,
        evaluationType: 'avaliacao_continua',
        description: 'Vocabulário técnico de perfuração, refinaria, HSE e briefings de segurança.'
      },
      {
        id: 'mod-ing-2',
        name: 'Technical Reports, Procurement & Logistics English',
        code: 'ING-102',
        type: 'disciplina',
        period: '1º Trimestre',
        workloadHours: 60,
        theoryHours: 20,
        practiceHours: 40,
        teacherName: 'Profª. Sarah Jenkins',
        minGrade: 12,
        minAttendance: 80,
        evaluationType: 'projeto_pratico',
        description: 'Redação de relatórios de incidentes, ordens de compra e emails comerciais.'
      },
      {
        id: 'mod-ing-3',
        name: 'International Business Presentations & Negotiations',
        code: 'ING-201',
        type: 'disciplina',
        period: '2º Trimestre',
        workloadHours: 60,
        theoryHours: 15,
        practiceHours: 45,
        teacherName: 'Prof. David Ndlovu',
        minGrade: 14,
        minAttendance: 85,
        evaluationType: 'projeto_pratico',
        description: 'Simulações de negociação contratual e apresentação executiva em inglês.'
      }
    ],
    highlights: [
      'Laboratório de escuta e pronúncia avançada',
      'Material didático alinhado aos projetos de Cabo Delgado',
      'Certificado bilíngue aceito por multinacionais'
    ],
    icon: 'Languages',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&auto=format&fit=crop&q=80',
    level: 'Proficiência Ocupacional'
  },
  {
    id: 'eletricidade-industrial',
    institutionId: 'inst-1',
    branchId: 'branch-1-matola',
    name: 'Eletricidade Industrial & Comandos Eletromecânicos',
    code: 'ELE-IND-01',
    category: 'Eletricidade',
    duration: '8 Meses',
    workloadHours: 480,
    theoryHours: 160,
    practiceHours: 320,
    modality: 'Presencial',
    regime: 'Laboral',
    price: 32000,
    registrationFee: 1500,
    monthlyFee: 4000,
    feeMonthly: 4000,
    certificate: 'Certificado de Eletricista Instalador Industrial e Manutenção (Acreditado IFPELAC)',
    status: 'Ativo',
    periodType: 'semestral',
    totalVacancies: 30,
    filledVacancies: 25,
    description: 'Instalação de quadros elétricos trifásicos, contatores, inversores de frequência, soft-starters, transformadores e comandos de motores industriais.',
    requirements: [
      '10ª Classe Concluída',
      'Aptidão para trabalhos com ferramentas técnicas',
      'Idade mínima de 17 anos'
    ],
    modules: [
      {
        id: 'mod-ele-1',
        name: 'Eletrotécnica Geral & Segurança em Alta/Baixa Tensão',
        code: 'ELE-101',
        type: 'disciplina',
        period: '1º Semestre',
        workloadHours: 120,
        theoryHours: 50,
        practiceHours: 70,
        teacherName: 'Eng. Tomé Machava',
        minGrade: 10,
        minAttendance: 80,
        evaluationType: 'provas_e_exame',
        description: 'Grandezas elétricas, lei de Ohm, leitura de esquemas e proteção contra choques.'
      },
      {
        id: 'mod-ele-2',
        name: 'Comandos Elétricos & Acionamento de Motores Trifásicos',
        code: 'ELE-102',
        type: 'disciplina',
        period: '1º Semestre',
        workloadHours: 140,
        theoryHours: 40,
        practiceHours: 100,
        teacherName: 'Eng. Tomé Machava',
        minGrade: 12,
        minAttendance: 85,
        evaluationType: 'projeto_pratico',
        description: 'Montagem de painéis, relés térmicos, botoeiras e temporizadores.'
      },
      {
        id: 'mod-ele-3',
        name: 'Controladores Lógicos Programáveis (CLP/PLC) & Automação',
        code: 'ELE-201',
        type: 'disciplina',
        period: '2º Semestre',
        workloadHours: 120,
        theoryHours: 40,
        practiceHours: 80,
        teacherName: 'Eng. Tomé Machava',
        minGrade: 10,
        minAttendance: 80,
        evaluationType: 'projeto_pratico',
        description: 'Lógica Ladder, automação de linhas fabris e inversores de frequência.'
      },
      {
        id: 'mod-ele-4',
        name: 'Prática de Bancada & Diagnóstico de Avarias',
        code: 'ELE-202',
        type: 'estagio_pratico',
        period: '2º Semestre',
        workloadHours: 100,
        theoryHours: 10,
        practiceHours: 90,
        teacherName: 'Eng. Tomé Machava',
        minGrade: 12,
        minAttendance: 85,
        evaluationType: 'teste_operacional',
        description: 'Medições com multímetro/alicate amperimétrico e resolução de falhas elétricas.'
      }
    ],
    highlights: [
      'Bancadas individuais com contatores e relés reais',
      'Prática direta com motores Siemens e WEG',
      'Regras de segurança EDM e normas internacionais IEC'
    ],
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop&q=80',
    level: 'Técnico Profissional'
  },
  {
    id: 'mecanica-auto-diesel',
    institutionId: 'inst-1',
    branchId: 'branch-1-matola',
    name: 'Mecânica Automóvel, Motores Diesel & Injeção Eletrônica',
    code: 'MEC-AUT-01',
    category: 'Mecânica',
    duration: '10 Meses',
    workloadHours: 600,
    theoryHours: 180,
    practiceHours: 420,
    modality: 'Presencial',
    regime: 'Laboral',
    price: 36000,
    registrationFee: 1500,
    monthlyFee: 3600,
    feeMonthly: 3600,
    certificate: 'Certificado Técnico de Mecânico Automóvel e Manutenção de Frotas',
    status: 'Ativo',
    periodType: 'semestral',
    totalVacancies: 25,
    filledVacancies: 22,
    description: 'Diagnóstico de motores a gasolina e diesel (Common Rail), sistemas de freios ABS, suspensão, transmissão manual/automática e scanners automotivos.',
    requirements: [
      '10ª Classe Concluída',
      'Interesse na área de manutenção veicular',
      'Exame de acuidade visual'
    ],
    modules: [
      {
        id: 'mod-mec-1',
        name: 'Motores de Combustão Interna (Gasolina & Diesel)',
        code: 'MEC-101',
        type: 'disciplina',
        period: '1º Semestre',
        workloadHours: 180,
        theoryHours: 60,
        practiceHours: 120,
        teacherName: 'Mestre Joaquim Tembe',
        minGrade: 10,
        minAttendance: 80,
        evaluationType: 'provas_e_exame',
        description: 'Desmontagem, medição de cabeçote, folga de válvulas e pistões.'
      },
      {
        id: 'mod-mec-2',
        name: 'Sistemas de Transmissão, Embreagem e Freios',
        code: 'MEC-102',
        type: 'disciplina',
        period: '1º Semestre',
        workloadHours: 140,
        theoryHours: 40,
        practiceHours: 100,
        teacherName: 'Mestre Joaquim Tembe',
        minGrade: 12,
        minAttendance: 80,
        evaluationType: 'projeto_pratico',
        description: 'Caixas de velocidade manuais, diferenciais e sistema de frenagem.'
      },
      {
        id: 'mod-mec-3',
        name: 'Injeção Eletrônica Common Rail & Diagnóstico por Scanner',
        code: 'MEC-201',
        type: 'disciplina',
        period: '2º Semestre',
        workloadHours: 160,
        theoryHours: 50,
        practiceHours: 110,
        teacherName: 'Eng. Helder Cuna',
        minGrade: 12,
        minAttendance: 85,
        evaluationType: 'teste_operacional',
        description: 'Leitura de códigos de erro OBD2, sensores, atuadores e osciloscópio automotivo.'
      },
      {
        id: 'mod-mec-4',
        name: 'Oficina Prática & Atendimento de Frotas',
        code: 'MEC-202',
        type: 'estagio_pratico',
        period: '2º Semestre',
        workloadHours: 120,
        theoryHours: 10,
        practiceHours: 110,
        teacherName: 'Mestre Joaquim Tembe',
        minGrade: 12,
        minAttendance: 90,
        evaluationType: 'teste_operacional',
        description: 'Revisão periódica, troca de fluidos e resolução de panes reais.'
      }
    ],
    highlights: [
      'Oficina mecânica própria equipada com elevadores hidráulicos',
      'Scanners multimarca Launch e Bosch',
      'Prática em viaturas ligeiras e pesadas'
    ],
    icon: 'Wrench',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=900&auto=format&fit=crop&q=80',
    level: 'Técnico Especialista'
  },
  {
    id: 'operacoes-portuarias-logistica',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    name: 'Operações Portuárias, Estiva & Logística de Contentores',
    code: 'POR-LOG-01',
    category: 'Operações Portuárias',
    duration: '6 Meses',
    workloadHours: 320,
    theoryHours: 140,
    practiceHours: 180,
    modality: 'Semi-presencial',
    regime: 'Pós-Laboral',
    price: 27000,
    registrationFee: 1500,
    monthlyFee: 4500,
    feeMonthly: 4500,
    certificate: 'Certificado de Especialização em Gestão Portuária e Terminal de Cargas',
    status: 'Ativo',
    periodType: 'por_modulo',
    totalVacancies: 30,
    filledVacancies: 27,
    description: 'Fluxos de carga no Porto de Maputo e Beira, planos de estiva, amarração de navios, movimentação de TEUs com guindastes e Janela Única Portuária (JUP).',
    requirements: [
      '12ª Classe Concluída',
      'Noções de comércio exterior e transporte',
      'Disponibilidade para visitas técnicas portuárias'
    ],
    modules: [
      {
        id: 'mod-por-1',
        name: 'Módulo 1: Estrutura Portuária & Tráfego Marítimo',
        code: 'POR-101',
        type: 'modulo',
        period: 'Módulo 1',
        workloadHours: 80,
        theoryHours: 40,
        practiceHours: 40,
        teacherName: 'Capitão Américo Zitha',
        minGrade: 10,
        minAttendance: 75,
        evaluationType: 'provas_e_exame',
        description: 'Tipologia de navios, canais de acesso, rebocadores e berços de atracação.'
      },
      {
        id: 'mod-por-2',
        name: 'Módulo 2: Operações de Estiva, Guindastes STS & RTG',
        code: 'POR-102',
        type: 'modulo',
        period: 'Módulo 2',
        workloadHours: 100,
        theoryHours: 40,
        practiceHours: 60,
        teacherName: 'Capitão Américo Zitha',
        minGrade: 12,
        minAttendance: 85,
        evaluationType: 'teste_operacional',
        description: 'Plano de carga de navios porta-contentores, amarração e movimentação segura.'
      },
      {
        id: 'mod-por-3',
        name: 'Módulo 3: Sistemas JUP, Armazenagem & Logística Intermodal',
        code: 'POR-103',
        type: 'modulo',
        period: 'Módulo 3',
        workloadHours: 140,
        theoryHours: 60,
        practiceHours: 80,
        teacherName: 'Dra. Luísa Bila',
        minGrade: 12,
        minAttendance: 80,
        evaluationType: 'projeto_pratico',
        description: 'Operação com ferrovia CFM, pátio de contentores e manifesto de carga.'
      }
    ],
    highlights: [
      'Visitas guiadas ao Terminal de Contentores da MPDC',
      'Simulador de plano de estiva computadorizado',
      'Corpo docente com capitães e gestores portuários ativos'
    ],
    icon: 'Anchor',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&auto=format&fit=crop&q=80',
    level: 'Técnico Especialista Portuário'
  },
  {
    id: 'ctim-gestao-aduaneira',
    institutionId: 'inst-2',
    branchId: 'branch-2-matola',
    name: 'Técnicas Aduaneiras, Janela Única (JÚE) & Despacho',
    code: 'ADU-TEC-01',
    category: 'Técnicas Aduaneiras',
    duration: '8 Meses',
    workloadHours: 400,
    theoryHours: 180,
    practiceHours: 220,
    modality: 'Híbrido',
    regime: 'Pós-Laboral',
    price: 36800,
    registrationFee: 1400,
    monthlyFee: 4600,
    feeMonthly: 4600,
    certificate: 'Certificado de Técnico Despachante Aduaneiro Acreditado',
    status: 'Ativo',
    periodType: 'semestral',
    totalVacancies: 30,
    filledVacancies: 24,
    description: 'Classificação pautal no Sistema Harmonizado, desembaraço na fronteira de Ressano Garcia e aeroportos, cálculo de direitos aduaneiros, IVA e JÚE.',
    requirements: [
      '12ª Classe Concluída',
      'Boa capacidade de redação e conhecimentos matemáticos',
      'Idade mínima 18 anos'
    ],
    modules: [
      {
        id: 'mod-adu-1',
        name: 'Legislação Aduaneira de Moçambique & Pauta Geral',
        code: 'ADU-101',
        type: 'disciplina',
        period: '1º Semestre',
        workloadHours: 100,
        theoryHours: 60,
        practiceHours: 40,
        teacherName: 'Dr. Salvador Mondlane',
        minGrade: 10,
        minAttendance: 75,
        evaluationType: 'provas_e_exame',
        description: 'Código Aduaneiro, regimes aduaneiros (definitivo, temporário, trânsito).'
      },
      {
        id: 'mod-adu-2',
        name: 'Classificação Pautal no Sistema Harmonizado (SH)',
        code: 'ADU-102',
        type: 'disciplina',
        period: '1º Semestre',
        workloadHours: 100,
        theoryHours: 40,
        practiceHours: 60,
        teacherName: 'Dr. Salvador Mondlane',
        minGrade: 12,
        minAttendance: 80,
        evaluationType: 'provas_e_exame',
        description: 'Regras gerais de interpretação do SH e notas explicativas.'
      },
      {
        id: 'mod-adu-3',
        name: 'Prática na Janela Única Eletrónica (JÚE) & Simulações',
        code: 'ADU-201',
        type: 'disciplina',
        period: '2º Semestre',
        workloadHours: 120,
        theoryHours: 30,
        practiceHours: 90,
        teacherName: 'Dra. Carla Chissano',
        minGrade: 14,
        minAttendance: 85,
        evaluationType: 'projeto_pratico',
        description: 'Submissão de Documento Único (DU), conferência documental e física.'
      },
      {
        id: 'mod-adu-4',
        name: 'Contencioso Aduaneiro & Auditoria Pós-Desembaraço',
        code: 'ADU-202',
        type: 'disciplina',
        period: '2º Semestre',
        workloadHours: 80,
        theoryHours: 50,
        practiceHours: 30,
        teacherName: 'Dr. Salvador Mondlane',
        minGrade: 10,
        minAttendance: 75,
        evaluationType: 'provas_e_exame',
        description: 'Transgressões aduaneiras, multas, recursos e defesa do importador.'
      }
    ],
    highlights: [
      'Ambiente de simulação homologado da JÚE',
      'Casos reais das alfândegas de Moçambique',
      'Preparação para o exame de Ajudante de Despachante'
    ],
    icon: 'FileCheck',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=900&auto=format&fit=crop&q=80',
    level: 'Técnico Aduaneiro Oficial'
  },
  {
    id: 'informatica-optica-utilizador',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    name: 'Informática na Óptica do Utilizador & Produtividade Digital',
    code: 'INF-CURTA-01',
    category: 'Curta Duração',
    duration: '4 Semanas',
    workloadHours: 60,
    theoryHours: 15,
    practiceHours: 45,
    modality: 'Presencial',
    regime: 'Laboral',
    price: 3500,
    registrationFee: 500,
    monthlyFee: 0, // Curso de curta duração, valor fechado
    feeMonthly: 0,
    certificate: 'Certificado de Aptidão em Informática e Ferramentas Office',
    status: 'Inscrições Abertas',
    periodType: 'intensivo',
    totalVacancies: 30,
    filledVacancies: 28,
    description: 'Windows 11, Microsoft Word, Excel (fórmulas, gráficos e tabelas), PowerPoint, navegação segura na internet e correio eletrônico corporativo.',
    requirements: [
      'Qualquer pessoa interessada em dominar computadores',
      'Não exige escolaridade mínima'
    ],
    modules: [
      {
        id: 'mod-inf-1',
        name: 'Ambiente Windows & Digitação Rápida',
        code: 'INF-01',
        type: 'unidade',
        period: 'Semana 1',
        workloadHours: 15,
        theoryHours: 5,
        practiceHours: 10,
        teacherName: 'Formadora Neusa Nhantumbo',
        minGrade: 10,
        minAttendance: 80,
        evaluationType: 'avaliacao_continua',
        description: 'Organização de pastas, atalhos do teclado e postura na digitação.'
      },
      {
        id: 'mod-inf-2',
        name: 'Processador de Texto Microsoft Word',
        code: 'INF-02',
        type: 'unidade',
        period: 'Semana 2',
        workloadHours: 15,
        theoryHours: 4,
        practiceHours: 11,
        teacherName: 'Formadora Neusa Nhantumbo',
        minGrade: 10,
        minAttendance: 80,
        evaluationType: 'projeto_pratico',
        description: 'Formatação de cartas formais, relatórios e currículos padronizados.'
      },
      {
        id: 'mod-inf-3',
        name: 'Planilhas Eletrônicas Microsoft Excel Prático',
        code: 'INF-03',
        type: 'unidade',
        period: 'Semana 3',
        workloadHours: 15,
        theoryHours: 4,
        practiceHours: 11,
        teacherName: 'Formadora Neusa Nhantumbo',
        minGrade: 12,
        minAttendance: 85,
        evaluationType: 'projeto_pratico',
        description: 'Fórmulas SOMA, MÉDIA, SE, formatação condicional e gráficos.'
      },
      {
        id: 'mod-inf-4',
        name: 'Apresentações em PowerPoint & Internet Segura',
        code: 'INF-04',
        type: 'unidade',
        period: 'Semana 4',
        workloadHours: 15,
        theoryHours: 2,
        practiceHours: 13,
        teacherName: 'Formadora Neusa Nhantumbo',
        minGrade: 10,
        minAttendance: 80,
        evaluationType: 'projeto_pratico',
        description: 'Slides profissionais, Google Drive, email e segurança contra golpes digitais.'
      }
    ],
    highlights: [
      '1 computador individual por formando',
      'Turmas reduzidas com acompanhamento passo a passo',
      'Apostila física e digital inclusa'
    ],
    icon: 'Monitor',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=80',
    level: 'Iniciação Profissional'
  },
  {
    id: 'cybersecurity-redes',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    name: 'Cibersegurança & Infraestrutura de Redes Cisco',
    code: 'RED-CIS-01',
    category: 'Informática',
    duration: '9 Meses',
    workloadHours: 800,
    theoryHours: 300,
    practiceHours: 500,
    modality: 'Presencial',
    regime: 'Laboral',
    price: 43200,
    registrationFee: 1500,
    monthlyFee: 4800,
    feeMonthly: 4800,
    certificate: 'Certificado de Especialista em Infraestrutura de Redes e Ciberdefesa',
    status: 'Ativo',
    periodType: 'trimestral',
    totalVacancies: 30,
    filledVacancies: 26,
    description: 'Administração de servidores Linux/Windows, roteamento Cisco CCNA, segurança defensiva e auditoria de vulnerabilidades.',
    requirements: [
      '12ª Classe Concluída',
      'Conhecimentos prévios de hardware ou sistemas operacionais'
    ],
    modules: [
      {
        id: 'mod-red-1',
        name: 'Fundamentos de Redes IP & Arquitetura OSI/TCP-IP',
        code: 'RED-101',
        type: 'disciplina',
        period: '1º Trimestre',
        workloadHours: 200,
        theoryHours: 80,
        practiceHours: 120,
        teacherName: 'Eng. Amilcar Tovela',
        minGrade: 10,
        minAttendance: 75,
        evaluationType: 'provas_e_exame',
        description: 'Sub-redes IPv4/IPv6, cabeamento estruturado e switches.'
      },
      {
        id: 'mod-red-2',
        name: 'Roteamento Cisco, VLANs & Wireless Corporativo',
        code: 'RED-102',
        type: 'disciplina',
        period: '2º Trimestre',
        workloadHours: 300,
        theoryHours: 100,
        practiceHours: 200,
        teacherName: 'Eng. Amilcar Tovela',
        minGrade: 12,
        minAttendance: 80,
        evaluationType: 'projeto_pratico',
        description: 'Configuração de roteadores Cisco, OSPF, ACLs e NAT.'
      },
      {
        id: 'mod-red-3',
        name: 'Segurança Defensiva, Firewall & Auditoria Ethical Hacking',
        code: 'RED-103',
        type: 'disciplina',
        period: '3º Trimestre',
        workloadHours: 300,
        theoryHours: 120,
        practiceHours: 180,
        teacherName: 'Eng. Amilcar Tovela',
        minGrade: 12,
        minAttendance: 85,
        evaluationType: 'projeto_pratico',
        description: 'Hardening de servidores, pfSense, análise de logs e resposta a incidentes.'
      }
    ],
    highlights: [
      'Racks reais de servidores e switches gerenciáveis',
      'Preparação intensiva para CCNA & CompTIA Security+',
      'Aulas práticas com simulação de ataques reais'
    ],
    icon: 'ShieldCheck',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&auto=format&fit=crop&q=80',
    level: 'Certificação Avançada'
  }
];

export const INITIAL_CLASSES: ClassGroup[] = [
  {
    id: 'turma-es-2026-a',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    name: 'Turma ES-2026-A (Software)',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    period: '1º Semestre 2026',
    shift: 'Noite (Pós-Laboral)',
    schedule: '18:00 - 21:30',
    room: 'Lab Informática 03 (Campus Central)',
    teacherName: 'Eng. Carlos Manuel Sitoe',
    capacity: 30,
    studentIds: ['std-01', 'std-04', 'std-06'],
    startDate: '2026-02-01',
    endDate: '2027-01-30',
    status: 'Em Curso',
    notes: 'Turma de especialização intensiva em TypeScript, Node.js e Docker.'
  },
  {
    id: 'turma-cs-2026-b',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    name: 'Turma CS-2026-B (Cibersegurança)',
    courseId: 'cybersecurity-redes',
    courseName: 'Cibersegurança & Infraestrutura Cisco',
    period: '1º Trimestre 2026',
    shift: 'Manhã',
    schedule: '08:00 - 11:30',
    room: 'Lab Redes Cisco (Campus Central)',
    teacherName: 'Dr. António Matusse',
    capacity: 25,
    studentIds: ['std-02', 'std-07'],
    startDate: '2026-03-10',
    endDate: '2026-11-20',
    status: 'Em Curso',
    notes: 'Preparação para certificações Cisco CCNA e CompTIA Security+.'
  },
  {
    id: 'turma-ct-2026-c',
    institutionId: 'inst-1',
    branchId: 'branch-1-matola',
    name: 'Turma CT-2026-C (Contabilidade Matola)',
    courseId: 'contabilidade-gestao',
    courseName: 'Contabilidade Informatizada & Fiscal',
    period: '1º Semestre 2026',
    shift: 'Tarde',
    schedule: '14:00 - 17:30',
    room: 'Sala Executiva 04 (Delegação Matola)',
    teacherName: 'Dra. Amina Abdul',
    capacity: 25,
    studentIds: ['std-03'],
    startDate: '2026-01-15',
    endDate: '2026-11-15',
    status: 'Em Curso',
    notes: 'Turma prática com módulo de Primavera BSS e fiscalidade moçambicana.'
  },
  {
    id: 'turma-es-2026-b',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    name: 'Turma ES-2026-B (Software Diurno)',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    period: '2º Semestre 2026',
    shift: 'Manhã',
    schedule: '08:00 - 12:00',
    room: 'Lab Informática 01 (Campus Central)',
    teacherName: 'Eng. Paulo Jafim',
    capacity: 30,
    studentIds: [],
    startDate: '2026-09-15',
    endDate: '2027-08-15',
    status: 'Inscrições Abertas',
    notes: 'Turma matutina recém-aberta para candidatos do 2º semestre.'
  },
  {
    id: 'turma-ctim-aut-01',
    institutionId: 'inst-2',
    branchId: 'branch-2-matola',
    name: 'Turma AUT-CTIM-01 (Automação)',
    courseId: 'ctim-automacao-industrial',
    courseName: 'Automação Industrial & Robótica de Fábrica CTIM',
    period: 'Ciclo 2026',
    shift: 'Manhã',
    schedule: '08:00 - 12:00',
    room: 'Hangar Técnico 01 - CTIM',
    teacherName: 'Eng. Mateus Nhaca',
    capacity: 20,
    studentIds: ['std-ctim-01'],
    startDate: '2026-02-15',
    endDate: '2026-12-15',
    status: 'Em Curso',
    notes: 'Oficina técnica de CLP e eletropneumática industrial.'
  }
];

export const INITIAL_TRANSFERS: StudentClassTransfer[] = [
  {
    id: 'trf-001',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    studentId: 'std-01',
    studentName: 'Arnaldo Tomás Mabunda',
    studentCode: 'CFTPM-AL-2026-1042',
    fromClassId: 'turma-es-2026-b',
    fromClassName: 'Turma ES-2026-B (Software Diurno)',
    fromCourseName: 'Engenharia de Software & Web Full-Stack',
    toClassId: 'turma-es-2026-a',
    toClassName: 'Turma ES-2026-A (Software)',
    toCourseName: 'Engenharia de Software & Web Full-Stack',
    transferDate: '2026-03-02',
    reason: 'Compatibilidade de Horário de Trabalho (Emprego em regime diurno)',
    authorizedBy: 'Dra. Fátima Tembe (Secretaria Acadêmica)',
    notes: 'Transferência aprovada com validação do contrato de trabalho e aproveitamento curricular integral.',
    keepAcademicRecords: true,
    createdAt: '2026-03-02 10:30'
  },
  {
    id: 'trf-002',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    studentId: 'std-02',
    studentName: 'Yolanda Celina Mondlane',
    studentCode: 'CFTPM-AL-2026-1043',
    fromClassId: 'turma-es-2026-a',
    fromClassName: 'Turma ES-2026-A (Software)',
    fromCourseName: 'Engenharia de Software & Web Full-Stack',
    toClassId: 'turma-cs-2026-b',
    toClassName: 'Turma CS-2026-B (Cibersegurança)',
    toCourseName: 'Cibersegurança & Infraestrutura Cisco',
    transferDate: '2026-03-15',
    reason: 'Mudança de Especialidade / Orientação Vocacional',
    authorizedBy: 'Eng. Paulo Jafim (Diretor Geral)',
    notes: 'Formando solicitou migração para a área de Redes e Segurança Ofensiva antes do início das avaliações do 1º módulo.',
    keepAcademicRecords: false,
    createdAt: '2026-03-15 14:10'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  ...CEU_AZUL_STUDENTS,
  {
    id: 'std-01',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-AL-2026-1042',
    fullName: 'Arnaldo Tomás Mabunda',
    documentType: 'BI',
    documentNumber: '110100482914B',
    birthDate: '2001-05-14',
    gender: 'Masculino',
    phone: '+258 84 391 8201',
    email: 'arnaldo.mabunda@gmail.com',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: 'Bairro da Malhangalene, Rua dos Lusíadas nº 45',
    guardianName: 'Tomás Mabunda (Pai)',
    guardianPhone: '+258 82 441 9021',
    emergencyContact: '+258 84 119 2831 (Irmão)',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    regime: 'Pós-Laboral',
    status: 'Ativo',
    enrollmentDate: '2026-02-01',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    paymentStatus: 'Pago',
    balanceOwing: 0,
    attendancePercentage: 96,
    averageGrade: 17.5,
    assessments: [
      {
        id: 'ass-1',
        title: 'Teste 1 - Algoritmos & JavaScript ES6',
        moduleName: 'Programação Web I',
        weight: 30,
        maxScore: 20,
        score: 18,
        date: '2026-03-20',
        teacher: 'Eng. Carlos Manuel'
      },
      {
        id: 'ass-2',
        title: 'Trabalho Prático - API RESTful & Node.js',
        moduleName: 'Backend Architecture',
        weight: 30,
        maxScore: 20,
        score: 17,
        date: '2026-05-14',
        teacher: 'Eng. Carlos Manuel'
      },
      {
        id: 'ass-3',
        title: 'Exame Intermédio - Banco de Dados SQL & NoSQL',
        moduleName: 'Database Systems',
        weight: 40,
        maxScore: 20,
        score: 17.5,
        date: '2026-07-28',
        teacher: 'Eng. Carlos Manuel'
      }
    ],
    internship: {
      companyName: 'Vodacom Moçambique & Tech Labs',
      supervisor: 'Dr. Lucas Nhantumbo',
      role: 'Desenvolvedor Frontend Trainee',
      startDate: '2026-08-01',
      endDate: '2026-11-30',
      status: 'A Decorrer',
      evaluationScore: 18.5
    }
  },
  {
    id: 'std-02',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-AL-2026-1043',
    fullName: 'Yolanda Celina Mondlane',
    documentType: 'BI',
    documentNumber: '100293817201M',
    birthDate: '2002-11-20',
    gender: 'Feminino',
    phone: '+258 87 502 9184',
    email: 'yolanda.mondlane@outlook.com',
    province: 'Maputo Província',
    city: 'Matola',
    address: 'Matola Fomento, Av. 4 de Outubro nº 118',
    guardianName: 'Celina Mondlane (Mãe)',
    guardianPhone: '+258 84 883 9021',
    emergencyContact: '+258 87 502 9184',
    courseId: 'cybersecurity-redes',
    courseName: 'Cibersegurança & Infraestrutura Cisco',
    classGroupId: 'turma-cs-2026-b',
    classGroupName: 'Turma CS-2026-B (Cibersegurança)',
    regime: 'Laboral',
    status: 'Ativo',
    enrollmentDate: '2026-03-10',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    paymentStatus: 'Pago',
    balanceOwing: 0,
    attendancePercentage: 98,
    averageGrade: 18.2,
    assessments: [
      {
        id: 'ass-4',
        title: 'Prática de Roteamento Dinâmico OSPF & VLANs',
        moduleName: 'Redes Cisco I',
        weight: 50,
        maxScore: 20,
        score: 19,
        date: '2026-04-12',
        teacher: 'Dr. António Matusse'
      },
      {
        id: 'ass-5',
        title: 'Auditoria de Vulnerabilidades & Hardening Linux',
        moduleName: 'Segurança Ofensiva',
        weight: 50,
        maxScore: 20,
        score: 17.5,
        date: '2026-06-18',
        teacher: 'Dr. António Matusse'
      }
    ]
  },
  {
    id: 'std-03',
    institutionId: 'inst-1',
    branchId: 'branch-1-matola',
    code: 'CFTPM-AL-2026-1044',
    fullName: 'Edilson Zacarias Chissano',
    documentType: 'BI',
    documentNumber: '110928374619C',
    birthDate: '1999-08-03',
    gender: 'Masculino',
    phone: '+258 82 819 2831',
    email: 'edilson.chissano@gmail.com',
    province: 'Sofala',
    city: 'Beira',
    address: 'Bairro do Maquinino, Rua Correia de Brito',
    guardianName: 'Zacarias Chissano',
    guardianPhone: '+258 84 102 3812',
    emergencyContact: '+258 82 819 2831',
    courseId: 'contabilidade-gestao',
    courseName: 'Contabilidade Informatizada & Fiscal',
    classGroupId: 'turma-ct-2026-c',
    classGroupName: 'Turma CT-2026-C (Contabilidade Matola)',
    regime: 'Pós-Laboral',
    status: 'Aguardando Pagamento',
    enrollmentDate: '2026-01-15',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    paymentStatus: 'Pendente',
    balanceOwing: 3800,
    attendancePercentage: 88,
    averageGrade: 14.5,
    assessments: [
      {
        id: 'ass-6',
        title: 'Lançamentos Contabilísticos no Primavera BSS',
        moduleName: 'Contabilidade Geral',
        weight: 50,
        maxScore: 20,
        score: 14.5,
        date: '2026-03-30',
        teacher: 'Dra. Amina Abdul'
      }
    ]
  },
  {
    id: 'std-04',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-AL-2026-1045',
    fullName: 'Mariana Fernando Cossa',
    documentType: 'BI',
    documentNumber: '110394819283K',
    birthDate: '2000-09-10', // Faz anos hoje / nesta semana!
    gender: 'Feminino',
    phone: '+258 84 712 9012',
    email: 'mariana.cossa@gmail.com',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: 'Polana Caniço B, Rua da Resistência nº 89',
    emergencyContact: '+258 84 991 2019',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    regime: 'Pós-Laboral',
    status: 'Ativo',
    enrollmentDate: '2026-02-01',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    paymentStatus: 'Pago',
    balanceOwing: 0,
    attendancePercentage: 94,
    averageGrade: 16.8,
    assessments: []
  },
  {
    id: 'std-05',
    institutionId: 'inst-1',
    branchId: 'branch-1-matola',
    code: 'CFTPM-AL-2025-0819',
    fullName: 'Jaime Rogério Tembe',
    documentType: 'BI',
    documentNumber: '100481928471Z',
    birthDate: '1998-04-18',
    gender: 'Masculino',
    phone: '+258 84 551 9021',
    email: 'jaime.tembe@outlook.com',
    province: 'Maputo Província',
    city: 'Boane',
    address: 'Boane Sede, Estrada Nacional nº 2',
    emergencyContact: '+258 82 331 9021',
    courseId: 'contabilidade-gestao',
    courseName: 'Contabilidade Informatizada & Fiscal',
    classGroupId: 'turma-ct-2026-c',
    classGroupName: 'Turma CT-2026-C (Contabilidade Matola)',
    regime: 'Laboral',
    status: 'Baixado',
    enrollmentDate: '2025-03-01',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    paymentStatus: 'Pago',
    balanceOwing: 0,
    attendancePercentage: 72,
    averageGrade: 12.0,
    assessments: [],
    termination: {
      reason: 'Mudança de Cidade',
      date: '2026-01-10',
      authorizedBy: 'Eng. Paulo Jafim (Diretor)',
      notes: 'O aluno mudou-se para a província de Tete por motivos profissionais e solicitou a emissão de declaração com notas para transferência.',
      academicSituation: 'Aprovado em 3 módulos do 1º Semestre',
      financialSituation: 'Regularizado',
      documentGenerated: true
    }
  },
  {
    id: 'std-ctim-01',
    institutionId: 'inst-2',
    branchId: 'branch-2-matola',
    code: 'CTIM-AL-2026-001',
    fullName: 'Bernardo Simão Langa',
    documentType: 'BI',
    documentNumber: '100492817402W',
    birthDate: '2000-03-22',
    gender: 'Masculino',
    phone: '+258 87 119 4021',
    email: 'bernardo.langa@gmail.com',
    province: 'Maputo Província',
    city: 'Matola',
    address: 'Bairro da Machava, KM 15',
    guardianName: 'Simão Langa',
    guardianPhone: '+258 84 902 1102',
    emergencyContact: '+258 87 119 4021',
    courseId: 'ctim-automacao-industrial',
    courseName: 'Automação Industrial & Robótica de Fábrica CTIM',
    classGroupId: 'turma-ctim-aut-01',
    classGroupName: 'Turma AUT-CTIM-01 (Automação)',
    regime: 'Laboral',
    status: 'Ativo',
    enrollmentDate: '2026-02-15',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    paymentStatus: 'Pago',
    balanceOwing: 0,
    attendancePercentage: 97,
    averageGrade: 18.0,
    assessments: [
      {
        id: 'ass-ctim-1',
        title: 'Programação de CLP Siemens S7-1200',
        moduleName: 'Automação Prática',
        weight: 50,
        maxScore: 20,
        score: 18.5,
        date: '2026-04-10',
        teacher: 'Eng. Mateus Nhaca'
      }
    ]
  },
  {
    id: 'std-06',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-AL-2025-0711',
    fullName: 'Benedito Augusto Cossa',
    socialName: 'Benny Cossa',
    documentType: 'BI',
    documentNumber: '110293817290A',
    nuit: '400829103',
    birthDate: '1999-06-18',
    gender: 'Masculino',
    phone: '+258 84 990 1204',
    whatsapp: '+258 84 990 1204',
    email: 'benedito.cossa@gmail.com',
    province: 'Maputo Cidade',
    city: 'Maputo',
    neighborhood: 'Sommerschield II',
    address: 'Rua das Acácias nº 140',
    guardianName: 'Augusto Cossa (Pai)',
    guardianPhone: '+258 82 710 4910',
    emergencyContact: '+258 84 990 1204',
    notes: 'Estudante com desempenho de distinção. Estágio na Vodacom concluído com nota máxima. Certificado oficial homologado no SIVERC sob código MTW-CERT-2026-8819.',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    regime: 'Pós-Laboral',
    status: 'Concluído',
    enrollmentDate: '2025-02-01',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    paymentStatus: 'Pago',
    balanceOwing: 0,
    attendancePercentage: 99,
    averageGrade: 18.5,
    assessments: [
      {
        id: 'ass-ben-1',
        title: 'Projeto Final de Graduação - Plataforma Cloud',
        moduleName: 'Engenharia de Software',
        weight: 60,
        maxScore: 20,
        score: 19,
        date: '2026-07-20',
        teacher: 'Eng. Carlos Manuel'
      }
    ],
    internship: {
      companyName: 'Vodacom Moçambique',
      supervisor: 'Eng. Nelson Bila',
      role: 'Cloud Developer Trainee',
      startDate: '2026-01-10',
      endDate: '2026-06-30',
      status: 'Concluído',
      evaluationScore: 19.5
    },
    attachedDocuments: [
      { id: 'doc-1', name: 'BI_Benedito_Cossa.pdf', type: 'BI', url: '#', size: '1.2 MB', uploadDate: '2025-02-01', status: 'Verificado' },
      { id: 'doc-2', name: 'Certificado_12a_Classe.pdf', type: 'Certificado de Habilitações', url: '#', size: '2.5 MB', uploadDate: '2025-02-01', status: 'Verificado' }
    ],
    receipts: [
      { id: 'rec-01', receiptNumber: 'REC-MTW-2026-0041', date: '2026-08-10', amount: 4500, description: 'Propina Final de Conclusão', paymentMethod: 'M-Pesa', status: 'Emitido', qrVerificationCode: 'SIVERC-REC-9921-OK' }
    ],
    historyEvents: [
      { id: 'he-1', date: '2025-02-01', title: 'Matrícula Oficial', category: 'matrícula', description: 'Matrícula efetuada na Turma ES-2026-A.', recordedBy: 'Secretaria Central' },
      { id: 'he-2', date: '2026-08-15', title: 'Conclusão & Outorga de Certificado', category: 'certificação', description: 'Emissão e registro de certificado homologado MTW-CERT-2026-8819.', recordedBy: 'Diretoria Pedagógica' }
    ],
    auditTrail: [
      { id: 'aud-1', timestamp: '2026-08-15 14:30', actorName: 'Eng. Paulo Jafim', actorRole: 'Diretor Geral', action: 'HOMOLOGAR_CERTIFICADO', details: 'Aprovado certificado digital com chave criptográfica SIVERC', ipAddress: '197.249.12.44' }
    ]
  },
  {
    id: 'std-07',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-AL-2026-1050',
    fullName: 'Sérgio António Manhiça',
    socialName: 'Sérgio Manhiça',
    documentType: 'BI',
    documentNumber: '110392817409D',
    nuit: '400918231',
    birthDate: '2002-09-12', // Faz anos amanhã / nesta semana!
    gender: 'Masculino',
    phone: '+258 84 812 0914',
    whatsapp: '+258 84 812 0914',
    email: 'sergio.manhica@gmail.com',
    province: 'Maputo Cidade',
    city: 'Maputo',
    neighborhood: 'Alto Maé',
    address: 'Av. 24 de Julho nº 890',
    guardianName: 'António Manhiça (Pai)',
    guardianPhone: '+258 82 918 2011',
    emergencyContact: '+258 84 812 0914',
    notes: 'Matrícula temporariamente suspensa por atraso de pagamento de 2 mensalidades e pendência de regularização na tesouraria.',
    courseId: 'cybersecurity-redes',
    courseName: 'Cibersegurança & Infraestrutura de Redes Cisco',
    classGroupId: 'turma-cs-2026-b',
    classGroupName: 'Turma CS-2026-B (Cibersegurança)',
    regime: 'Laboral',
    status: 'Suspenso',
    enrollmentDate: '2026-03-10',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    paymentStatus: 'Atrasado',
    balanceOwing: 9600,
    attendancePercentage: 74,
    averageGrade: 11.5,
    assessments: [],
    historyEvents: [
      { id: 'he-s1', date: '2026-03-10', title: 'Matrícula', category: 'matrícula', description: 'Matrícula inicial em Cibersegurança', recordedBy: 'Secretaria' },
      { id: 'he-s2', date: '2026-08-28', title: 'Suspensão Administrativa', category: 'financeiro', description: 'Suspensão temporária aplicada por limite de inadimplência superior a 60 dias.', recordedBy: 'Tesouraria' }
    ],
    auditTrail: [
      { id: 'aud-s1', timestamp: '2026-08-28 10:15', actorName: 'Maria Zita', actorRole: 'Tesoureira', action: 'SUSPENSAO_INADIMPLENCIA', details: 'Notificação prévia enviada via WhatsApp e e-mail antes da suspensão do acesso.', ipAddress: '197.249.12.18' }
    ]
  }
];

export const INITIAL_DASHBOARD_TASKS: DashboardTask[] = [
  {
    id: 'tsk-01',
    title: 'Validar 14 processos de matrícula do polo Matola',
    dueDate: 'Hoje, 17:00',
    priority: 'alta',
    assignedTo: 'Secretaria Acadêmica',
    category: 'Secretaria',
    completed: false
  },
  {
    id: 'tsk-02',
    title: 'Assinar e homologar 18 certificados da turma de Software',
    dueDate: 'Hoje, 18:30',
    priority: 'alta',
    assignedTo: 'Eng. Paulo Jafim (Direção)',
    category: 'Certificados',
    completed: false
  },
  {
    id: 'tsk-03',
    title: 'Fechar pautas de avaliação contínua do Módulo Redes Cisco',
    dueDate: 'Amanhã, 12:00',
    priority: 'média',
    assignedTo: 'Dr. António Matusse',
    category: 'Acadêmico',
    completed: false
  },
  {
    id: 'tsk-04',
    title: 'Reconciliação diária dos pagamentos M-Pesa e e-Mola do caixa',
    dueDate: 'Hoje, 16:30',
    priority: 'alta',
    assignedTo: 'Maria Zita (Tesouraria)',
    category: 'Financeiro',
    completed: true
  },
  {
    id: 'tsk-05',
    title: 'Supervisionar relatório de estágio curricular - Vodacom Labs',
    dueDate: '15 de Setembro',
    priority: 'média',
    assignedTo: 'Coordenação de Estágios',
    category: 'Estágios',
    completed: false
  }
];

export const INITIAL_NOTICES: StudentNotice[] = [
  {
    id: 'av-01',
    title: 'Calendário de Exames do 2º Trimestre & Entrega de Trabalhos',
    date: '11 de Setembro de 2026',
    priority: 'alta',
    content: 'Informamos a todos os formadores e estudantes que as avaliações trimestrais e projetos de laboratório decorrerão de 20 a 28 de Setembro. As pautas devem ser homologadas no SIGAR até às 23:59 do dia 30.',
    author: 'Direção Pedagógica'
  },
  {
    id: 'av-02',
    title: 'Manutenção Preventiva dos Racks de Servidores & Fibra Óptica',
    date: '10 de Setembro de 2026',
    priority: 'média',
    content: 'O laboratório de Redes e Cibersegurança passará por atualização de firmware dos switches Cisco neste sábado das 14h às 18h. Os acessos aos laboratórios virtuais estarão operacionais.',
    author: 'Departamento de TI & Infraestrutura'
  },
  {
    id: 'av-03',
    title: 'Abertura de 25 Vagas de Estágio Remunerado na Vodacom & MCel',
    date: '08 de Setembro de 2026',
    priority: 'informativa',
    content: 'Estudantes dos cursos de Engenharia de Software e Cibersegurança com média igual ou superior a 14 valores podem submeter o CV na coordenação de estágios.',
    author: 'Gabinete de Saídas Profissionais'
  }
];

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'tpl-matricula',
    institutionId: 'inst-1',
    name: 'Contrato de Formação Técnico-Profissional & Matrícula',
    type: 'formacao',
    title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FORMAÇÃO TÉCNICO-PROFISSIONAL',
    version: 'v2.1',
    updatedAt: '2026-02-15',
    createdAt: '2025-01-10',
    author: 'Gabinete Jurídico & Secretaria Acadêmica',
    isDefault: true,
    description: 'Minuta padrão para matrícula em cursos técnicos e profissionais com cláusulas de pagamento, frequência e certificação oficial.',
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FORMAÇÃO TÉCNICO-PROFISSIONAL

Pelo presente instrumento particular de prestação de serviços educacionais e formação técnico-profissional:

PRIMEIRA CONTRATANTE:
{{instituicao}}, instituição de ensino técnico-profissional, representada neste ato pelo seu Diretor Geral, {{diretor}}.

SEGUNDO CONTRATANTE:
O(A) Formando(a) {{nome_aluno}}, inscrito na Turma {{turma}} do curso de {{curso}}.

Celebram entre si o presente contrato, mediante as cláusulas e condições seguintes:

CLÁUSULA PRIMEIRA (DO OBJETO)
O presente contrato tem por objeto a prestação de serviços educacionais e capacitação técnica no curso de {{curso}}, integrado na Turma {{turma}}, com uma carga horária e duração prevista de {{duracao}}.

CLÁUSULA SEGUNDA (DAS OBRIGAÇÕES DA INSTITUIÇÃO)
A {{instituicao}}, sob a direção de {{diretor}}, compromete-se a:
a) Ministrar os módulos do programa de formação com corpo docente qualificado;
b) Disponibilizar acesso a laboratórios, equipamentos e material didático oficial;
c) Emitir o respectivo Certificado de Habilitações autenticado pelo SIVEC após aproveitamento curricular com nota mínima de 10 (dez) valores e frequência não inferior a 75%.

CLÁUSULA TERCEIRA (DO VALOR E FORMA DE PAGAMENTO)
Pela prestação dos serviços contratados, o(a) Formando(a) obriga-se a liquidar o valor total/mensal de {{valor}} MZN, a ser pago conforme o cronograma financeiro aprovado até ao dia 10 de cada mês através dos canais autorizados (M-Pesa, e-Mola ou depósito bancário).

CLÁUSULA QUARTA (DA VIGÊNCIA E RESCISÃO)
O presente contrato entra em vigor na data da sua assinatura, em {{data}}, permanecendo válido durante todo o período lectivo estipulado em {{duracao}}, podendo ser rescindido por mútuo acordo ou inadimplemento comprovado de qualquer das partes.

E, por estarem plenamente de acordo, lavra-se o presente instrumento em duplicado, assinado pelas partes contratantes.

Maputo, {{data}}


__________________________________________           __________________________________________
Pela Direção Geral: {{diretor}}                      O(A) Formando(a): {{nome_aluno}}
{{instituicao}}                                      Turma: {{turma}}`,
    versionHistory: [
      {
        version: 'v1.0',
        title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS (MINUTA INICIAL)',
        content: 'Minuta preliminar de matrícula aprovada para o ano lectivo de 2025 com dados essenciais de formação e pagamento.',
        savedAt: '2025-01-10',
        savedBy: 'Dra. Fátima Tembe',
        changeNotes: 'Criação do modelo de contrato original'
      },
      {
        version: 'v2.0',
        title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FORMAÇÃO PROFISSIONAL',
        content: 'Minuta reformulada com introdução de cláusulas de certificação SIVEC e regras de assiduidade.',
        savedAt: '2026-01-05',
        savedBy: 'Eng. Paulo Jafim (Diretor)',
        changeNotes: 'Atualização para inclusão do carimbo e assinatura digital SIVEC'
      }
    ]
  },
  {
    id: 'tpl-estagio',
    institutionId: 'inst-1',
    name: 'Termo de Compromisso e Convênio de Estágio',
    type: 'estagio',
    title: 'TERMO DE COMPROMISSO DE ESTÁGIO CURRICULAR SUPERVISIONADO',
    version: 'v1.5',
    updatedAt: '2026-02-01',
    createdAt: '2025-05-12',
    author: 'Coordenação de Estágios & Saídas Profissionais',
    isDefault: false,
    description: 'Termo tripartite formalizando a inserção do aluno em empresa concedente com carga horária e plano de trabalho prático.',
    content: `TERMO DE COMPROMISSO DE ESTÁGIO CURRICULAR

Entre a {{instituicao}}, representada por {{diretor}}, a Empresa Concedente e o(a) Estudante {{nome_aluno}}, da Turma {{turma}} do curso de {{curso}}:

1. É celebrado o presente termo para a realização de estágio prático supervisionado de duração de {{duracao}}, iniciado em {{data}}.
2. O valor de subsídio/bolsa acordado (se aplicável) é de {{valor}} MZN.
3. Todas as atividades curriculares serão avaliadas de 0 a 20 valores na caderneta oficial.

Assinado em {{data}} por {{diretor}} e {{nome_aluno}}.`,
    versionHistory: [
      {
        version: 'v1.0',
        title: 'TERMO DE ESTÁGIO CONVENCIONAL',
        content: 'Minuta básica para encaminhamento de alunos em empresas parceiras.',
        savedAt: '2025-05-12',
        savedBy: 'Coordenação de Estágios',
        changeNotes: 'Versão inicial de convênios empresariais'
      }
    ]
  },
  {
    id: 'tpl-bolsa',
    institutionId: 'inst-1',
    name: 'Contrato de Concessão de Bolsa de Mérito',
    type: 'prestacao_servicos',
    title: 'CONTRATO DE CONCESSÃO DE BOLSA DE ESTUDO POR MÉRITO ACADÊMICO',
    version: 'v1.2',
    updatedAt: '2026-01-20',
    createdAt: '2025-08-15',
    author: 'Conselho Diretivo',
    isDefault: false,
    description: 'Regulamentação de bolsa de mérito integral ou parcial para formandos de alto rendimento.',
    content: `CONTRATO DE BOLSA DE ESTUDO POR MÉRITO

Pelo presente contrato particular, a {{instituicao}}, representada pelo Diretor Geral {{diretor}}, concede a {{nome_aluno}}, estudante da Turma {{turma}} no curso de {{curso}}, o benefício de bolsa de estudos com valor de comparticipação de {{valor}} MZN pelo período de {{duracao}}.

O beneficiário compromete-se a manter média igual ou superior a 14 valores em todas as pautas.

Celebrado em {{data}}.`,
    versionHistory: [
      {
        version: 'v1.0',
        title: 'TERMO DE BOLSA DE ESTUDO',
        content: 'Minuta simples de incentivo acadêmico.',
        savedAt: '2025-08-15',
        savedBy: 'Dra. Amina Abdul',
        changeNotes: 'Abertura do programa de incentivos'
      }
    ]
  }
];

export const INITIAL_GENERATED_CONTRACTS: GeneratedContract[] = [
  {
    id: 'cnt-01',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    templateId: 'tpl-matricula',
    templateName: 'Contrato de Formação Técnico-Profissional & Matrícula',
    templateVersion: 'v2.1',
    studentId: 'std-01',
    studentName: 'Arnaldo Tomás Mabunda',
    studentCode: 'CFTPM-AL-2026-1042',
    studentDocumentNumber: '110100482914B',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    value: 4500,
    valueFormatted: '4.500,00 MT/mês',
    duration: '12 Meses (1200 Horas)',
    date: '10/02/2026',
    institutionName: 'Centro de Formação Técnico Profissional Moztechwave',
    directorName: 'Eng. Paulo Jafim',
    referenceNumber: 'CFTPM-CTR-2026-0042',
    status: 'ativo',
    statusHistory: [
      {
        id: 'csh-01',
        status: 'ativo',
        changedAt: '10/02/2026 09:30',
        changedBy: 'Secretaria Acadêmica (Dra. Fátima Tembe)',
        reason: 'Contrato de matrícula formalizado e assinado digitalmente por ambas as partes.'
      }
    ],
    signedByStudent: true,
    signedByDirector: true,
    signatures: {
      student: {
        signed: true,
        signerName: 'Arnaldo Tomás Mabunda',
        signedAt: '10/02/2026 10:15',
        role: 'Formando',
        documentNumber: 'BI nº 110100482914B'
      },
      director: {
        signed: true,
        signerName: 'Eng. Paulo Jafim',
        signedAt: '10/02/2026 11:00',
        role: 'Diretor Geral',
        hasStamp: true
      }
    },
    generatedDate: '2026-02-10',
    createdAt: '2026-02-10',
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FORMAÇÃO TÉCNICO-PROFISSIONAL

Pelo presente instrumento particular de prestação de serviços educacionais e formação técnico-profissional:

PRIMEIRA CONTRATANTE:
Centro de Formação Técnico Profissional Moztechwave, instituição de ensino técnico-profissional, representada neste ato pelo seu Diretor Geral, Eng. Paulo Jafim.

SEGUNDO CONTRATANTE:
O(A) Formando(a) Arnaldo Tomás Mabunda, inscrito na Turma Turma ES-2026-A (Software) do curso de Engenharia de Software & Web Full-Stack.

Celebram entre si o presente contrato, mediante as cláusulas e condições seguintes:

CLÁUSULA PRIMEIRA (DO OBJETO)
O presente contrato tem por objeto a prestação de serviços educacionais e capacitação técnica no curso de Engenharia de Software & Web Full-Stack, integrado na Turma Turma ES-2026-A (Software), com uma carga horária e duração prevista de 12 Meses (1200 Horas).

CLÁUSULA SEGUNDA (DAS OBRIGAÇÕES DA INSTITUIÇÃO)
A instituição compromete-se a disponibilizar corpo docente qualificado, laboratórios equipados e emissão do Certificado Oficial SIVEC com aproveitamento mínimo de 10 valores e frequência de 75%.

CLÁUSULA TERCEIRA (DO VALOR E FORMA DE PAGAMENTO)
Pela prestação dos serviços contratados, o formando pagará o valor mensal de 4.500,00 MT/mês.

CLÁUSULA QUARTA (DA VIGÊNCIA)
Válido a partir de 10/02/2026 pelo período de 12 Meses (1200 Horas).

Maputo, 10/02/2026

Assinado por:
Direção Geral: Eng. Paulo Jafim
Formando: Arnaldo Tomás Mabunda`
  },
  {
    id: 'cnt-02',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    templateId: 'tpl-matricula',
    templateName: 'Contrato de Formação Técnico-Profissional & Matrícula',
    templateVersion: 'v2.0',
    studentId: 'std-02',
    studentName: 'Yolanda Celina Mondlane',
    studentCode: 'CFTPM-AL-2026-1043',
    studentDocumentNumber: '110293817290A',
    courseId: 'cybersecurity-redes',
    courseName: 'Cibersegurança & Infraestrutura Cisco',
    classGroupId: 'turma-cs-2026-b',
    classGroupName: 'Turma CS-2026-B (Cibersegurança)',
    value: 4200,
    valueFormatted: '4.200,00 MT/mês',
    duration: '10 Meses (800 Horas)',
    date: '15/02/2026',
    institutionName: 'Centro de Formação Técnico Profissional Moztechwave',
    directorName: 'Eng. Paulo Jafim',
    referenceNumber: 'CFTPM-CTR-2026-0043',
    status: 'ativo',
    statusHistory: [
      {
        id: 'csh-02',
        status: 'ativo',
        changedAt: '15/02/2026 14:00',
        changedBy: 'Secretaria Acadêmica',
        reason: 'Matrícula efetuada com sucesso e contrato homologado.'
      }
    ],
    signedByStudent: true,
    signedByDirector: true,
    signatures: {
      student: {
        signed: true,
        signerName: 'Yolanda Celina Mondlane',
        signedAt: '15/02/2026 14:20',
        role: 'Formanda',
        documentNumber: 'BI nº 110293817290A'
      },
      director: {
        signed: true,
        signerName: 'Eng. Paulo Jafim',
        signedAt: '15/02/2026 16:00',
        role: 'Diretor Geral',
        hasStamp: true
      }
    },
    generatedDate: '2026-02-15',
    createdAt: '2026-02-15',
    content: 'Contrato ativo e registrado sob o número CFTPM-CTR-2026-0043.'
  },
  {
    id: 'cnt-03',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    templateId: 'tpl-matricula',
    templateName: 'Contrato de Formação Técnico-Profissional & Matrícula',
    templateVersion: 'v1.0',
    studentId: 'std-03',
    studentName: 'Mauro César Sitoe',
    studentCode: 'CFTPM-AL-2026-1044',
    studentDocumentNumber: '110398471920C',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    value: 4500,
    valueFormatted: '4.500,00 MT/mês',
    duration: '12 Meses (1200 Horas)',
    date: '05/01/2026',
    institutionName: 'Centro de Formação Técnico Profissional Moztechwave',
    directorName: 'Eng. Paulo Jafim',
    referenceNumber: 'CFTPM-CTR-2026-0012',
    status: 'renovado',
    statusHistory: [
      {
        id: 'csh-03a',
        status: 'ativo',
        changedAt: '05/01/2026 11:00',
        changedBy: 'Secretaria',
        reason: 'Início do contrato do 1º semestre.'
      },
      {
        id: 'csh-03b',
        status: 'renovado',
        changedAt: '01/07/2026 10:00',
        changedBy: 'Secretaria Acadêmica',
        reason: 'Renovado para o 2º semestre com termo aditivo oficial.'
      }
    ],
    signedByStudent: true,
    signedByDirector: true,
    signatures: {
      student: { signed: true, signerName: 'Mauro César Sitoe' },
      director: { signed: true, signerName: 'Eng. Paulo Jafim', hasStamp: true }
    },
    generatedDate: '2026-01-05',
    createdAt: '2026-01-05',
    content: 'Contrato do 1º Semestre renovado para ciclo continuado.'
  },
  {
    id: 'cnt-04',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    templateId: 'tpl-matricula',
    templateName: 'Contrato de Formação Técnico-Profissional & Matrícula',
    templateVersion: 'v1.0',
    studentId: 'std-05',
    studentName: 'Mateus Sebastião Nhatitima',
    studentCode: 'CFTPM-AL-2026-1046',
    studentDocumentNumber: '110500736281P',
    courseId: 'c3',
    courseName: 'Eletricidade Industrial & Automação PLC',
    classGroupId: 'turma-el-2026-c',
    classGroupName: 'Turma EL-2026-C (Eletricidade)',
    value: 3800,
    valueFormatted: '3.800,00 MT/mês',
    duration: '8 Meses (640 Horas)',
    date: '12/01/2026',
    institutionName: 'Centro de Formação Técnico Profissional Moztechwave',
    directorName: 'Eng. Paulo Jafim',
    referenceNumber: 'CFTPM-CTR-2026-0019',
    status: 'cancelado',
    statusHistory: [
      {
        id: 'csh-04a',
        status: 'ativo',
        changedAt: '12/01/2026 08:30',
        changedBy: 'Secretaria',
        reason: 'Contrato inicial emitido.'
      },
      {
        id: 'csh-04b',
        status: 'cancelado',
        changedAt: '25/01/2026 15:40',
        changedBy: 'Direção Pedagógica',
        reason: 'Desistência formal do candidato antes do início das aulas por motivo de transferência de província.'
      }
    ],
    cancellationReason: 'Mudança de província por motivos de saúde familiar.',
    signedByStudent: true,
    signedByDirector: false,
    signatures: {
      student: { signed: true, signerName: 'Mateus Sebastião Nhatitima' },
      director: { signed: false, signerName: 'Eng. Paulo Jafim' }
    },
    generatedDate: '2026-01-12',
    createdAt: '2026-01-12',
    content: 'Contrato cancelado a pedido do formando.'
  },
  {
    id: 'cnt-05',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    templateId: 'tpl-matricula',
    templateName: 'Contrato de Formação Técnico-Profissional & Matrícula',
    templateVersion: 'v1.0',
    studentId: 'std-06',
    studentName: 'Benedito Augusto Cossa',
    studentCode: 'CFTPM-AL-2025-0819',
    studentDocumentNumber: '110293817290A',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    classGroupId: 'turma-es-2025-a',
    classGroupName: 'Turma ES-2025-A',
    value: 4500,
    valueFormatted: '4.500,00 MT/mês',
    duration: '12 Meses (1200 Horas)',
    date: '10/08/2025',
    institutionName: 'Centro de Formação Técnico Profissional Moztechwave',
    directorName: 'Eng. Paulo Jafim',
    referenceNumber: 'CFTPM-CTR-2025-0812',
    status: 'encerrado',
    statusHistory: [
      {
        id: 'csh-05a',
        status: 'ativo',
        changedAt: '10/08/2025 09:00',
        changedBy: 'Secretaria',
        reason: 'Contrato do ano anterior ativado.'
      },
      {
        id: 'csh-05b',
        status: 'encerrado',
        changedAt: '15/08/2026 12:00',
        changedBy: 'Secretaria Acadêmica',
        reason: 'Curso integralmente concluído com mérito e certificado emitido.'
      }
    ],
    closureReason: 'Formando graduado com êxito (18 valores).',
    signedByStudent: true,
    signedByDirector: true,
    signatures: {
      student: { signed: true, signerName: 'Benedito Augusto Cossa' },
      director: { signed: true, signerName: 'Eng. Paulo Jafim', hasStamp: true }
    },
    generatedDate: '2025-08-10',
    createdAt: '2025-08-10',
    content: 'Contrato encerrado após conclusão do plano de estudos.'
  }
];

export const INITIAL_REGISTRATIONS: RegistrationApplication[] = [
  {
    id: 'reg-01',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-CAND-2026-9102',
    fullName: 'Arnaldo Tomás Mabunda',
    documentType: 'BI',
    documentNumber: '110100482914B',
    email: 'arnaldo.mabunda@gmail.com',
    phone: '+258 84 391 8201',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: 'Bairro da Polana Caniço B, Rua 12, Casa nº 48',
    birthDate: '2001-05-14',
    gender: 'Masculino',
    guardianName: 'Tomás Mabunda',
    guardianPhone: '+258 82 411 9021',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    regime: 'Pós-Laboral',
    shift: 'Noite (18:00 - 21:30)',
    status: 'Aprovada',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-08 14:20',
    paymentStatus: 'Pago',
    paymentReference: 'MP-881920-MZ',
    paymentAmount: 1500,
    paymentMethod: 'M-Pesa',
    analysisNotes: 'Candidato com 12ª classe concluída e conhecimentos preliminares de lógica. Documentação validada e taxa de inscrição liquidada. Aprovado para matrícula.',
    analyzedBy: 'Secretaria Acadêmica (Dra. Fátima Tembe)',
    analyzedAt: '2026-09-09 10:15',
    customAnswers: [
      { questionId: 'q1', question: 'Como tomou conhecimento dos nossos cursos?', answer: 'Redes Sociais (Facebook / Instagram)' },
      { questionId: 'q2', question: 'Possui computador portátil próprio para os projetos práticos?', answer: 'Sim' },
      { questionId: 'q3', question: 'Qual o seu nível de escolaridade atual?', answer: '12ª Classe Geral Concluída' },
      { questionId: 'q4', question: 'Tem interesse em plano de pagamento parcelado ou financiamento estudantil?', answer: 'Não' }
    ],
    documents: [
      { id: 'doc-1', name: 'Bilhete de Identidade (BI)', type: 'application/pdf', fileName: 'BI_Arnaldo_Mabunda.pdf', fileSize: '1.2 MB', verified: true, uploadedAt: '2026-09-08 14:18' },
      { id: 'doc-2', name: 'Certificado da 12ª Classe', type: 'application/pdf', fileName: 'Certificado_12a_Arnaldo.pdf', fileSize: '2.4 MB', verified: true, uploadedAt: '2026-09-08 14:19' },
      { id: 'doc-3', name: 'Declaração de NUIT', type: 'image/jpeg', fileName: 'NUIT_Mabunda.jpg', fileSize: '480 KB', verified: true, uploadedAt: '2026-09-08 14:19' }
    ],
    confirmationSent: {
      email: true,
      sms: true,
      whatsapp: true,
      sentAt: '2026-09-08 14:21',
      recipientPhone: '+258 84 391 8201',
      recipientEmail: 'arnaldo.mabunda@gmail.com'
    }
  },
  {
    id: 'reg-02',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-CAND-2026-9103',
    fullName: 'Yolanda Celina Mondlane',
    documentType: 'BI',
    documentNumber: '100293817201M',
    email: 'yolanda.mondlane@outlook.com',
    phone: '+258 87 502 9184',
    province: 'Maputo Província',
    city: 'Matola',
    address: 'Bairro da Matola C, Av. das Indústrias nº 304',
    birthDate: '2002-11-20',
    gender: 'Feminino',
    guardianName: 'Celina Mondlane',
    guardianPhone: '+258 84 991 0281',
    courseId: 'cybersecurity-redes',
    courseName: 'Cibersegurança & Infraestrutura de Redes Cisco',
    regime: 'Laboral',
    shift: 'Manhã (08:00 - 12:00)',
    status: 'Em Análise',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-09 09:15',
    paymentStatus: 'Pago',
    paymentReference: 'EM-749102-MZ',
    paymentAmount: 1500,
    paymentMethod: 'e-Mola',
    analysisNotes: 'Atestado médico anexado aguardando chancela da direção pedagógica.',
    analyzedBy: 'Secretaria Acadêmica (Sr. Hermenegildo Sitoe)',
    analyzedAt: '2026-09-09 11:30',
    customAnswers: [
      { questionId: 'q1', question: 'Como tomou conhecimento dos nossos cursos?', answer: 'Recomendação de Colega / Familiar' },
      { questionId: 'q2', question: 'Possui computador portátil próprio para os projetos práticos?', answer: 'Sim' },
      { questionId: 'q3', question: 'Qual o seu nível de escolaridade atual?', answer: '12ª Classe Geral Concluída' }
    ],
    documents: [
      { id: 'doc-4', name: 'Bilhete de Identidade (BI)', type: 'application/pdf', fileName: 'BI_Yolanda_Mondlane.pdf', fileSize: '1.8 MB', verified: true, uploadedAt: '2026-09-09 09:10' },
      { id: 'doc-5', name: 'Certificado de Conclusão', type: 'application/pdf', fileName: 'Certificado_ESG_Yolanda.pdf', fileSize: '3.1 MB', verified: false, uploadedAt: '2026-09-09 09:12' }
    ],
    confirmationSent: {
      email: true,
      sms: true,
      whatsapp: true,
      sentAt: '2026-09-09 09:16',
      recipientPhone: '+258 87 502 9184',
      recipientEmail: 'yolanda.mondlane@outlook.com'
    }
  },
  {
    id: 'reg-03',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-CAND-2026-9105',
    fullName: 'Cláudia Inácio Tembe',
    documentType: 'BI',
    documentNumber: '110948271039T',
    email: 'claudia.tembe@gmail.com',
    phone: '+258 84 712 9012',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: 'Bairro do Alto Maé, Rua de Timor nº 89',
    birthDate: '2000-03-12',
    gender: 'Feminino',
    courseId: 'contabilidade-gestao',
    courseName: 'Contabilidade Informatizada & Gestão Fiscal (PGC-NIRF)',
    regime: 'Pós-Laboral',
    shift: 'Noite (18:00 - 21:30)',
    status: 'Pendente',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-11 16:30',
    paymentStatus: 'Pago',
    paymentReference: 'MP-910283-MZ',
    paymentAmount: 1200,
    paymentMethod: 'M-Pesa',
    customAnswers: [
      { questionId: 'q1', question: 'Como tomou conhecimento dos nossos cursos?', answer: 'Website Oficial Moztechwave' },
      { questionId: 'q2', question: 'Possui computador portátil próprio para os projetos práticos?', answer: 'Sim' },
      { questionId: 'q3', question: 'Qual o seu nível de escolaridade atual?', answer: 'Frequência Universitária' }
    ],
    documents: [
      { id: 'doc-6', name: 'Bilhete de Identidade (BI)', type: 'application/pdf', fileName: 'BI_Claudia_Tembe.pdf', fileSize: '1.4 MB', verified: false, uploadedAt: '2026-09-11 16:25' },
      { id: 'doc-7', name: 'Certificado de Habilitações', type: 'application/pdf', fileName: 'Certificado_Claudia.pdf', fileSize: '2.0 MB', verified: false, uploadedAt: '2026-09-11 16:28' }
    ],
    confirmationSent: {
      email: true,
      sms: true,
      whatsapp: true,
      sentAt: '2026-09-11 16:31',
      recipientPhone: '+258 84 712 9012',
      recipientEmail: 'claudia.tembe@gmail.com'
    }
  },
  {
    id: 'reg-04',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-CAND-2026-8941',
    fullName: 'Rogério Samuel Macuácua',
    documentType: 'BI',
    documentNumber: '110392817402R',
    email: 'rogerio.macuacua@hotmail.com',
    phone: '+258 86 192 8301',
    province: 'Maputo Cidade',
    city: 'Maputo',
    address: 'Bairro da Maxaquene C, Rua dos Irmãos nº 14',
    birthDate: '1998-07-22',
    gender: 'Masculino',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    regime: 'Pós-Laboral',
    shift: 'Noite (18:00 - 21:30)',
    status: 'Matriculado',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-01 10:00',
    paymentStatus: 'Pago',
    paymentReference: 'MP-772819-MZ',
    paymentAmount: 1500,
    paymentMethod: 'M-Pesa',
    analysisNotes: 'Candidatura deferida com mérito. Documentos originais conferidos e convertidos na matrícula oficial.',
    analyzedBy: 'Dra. Amina Abdul (Direção Pedagógica)',
    analyzedAt: '2026-09-02 14:00',
    convertedStudentId: 'std-01',
    convertedStudentCode: 'CFTPM-AL-2026-1049',
    convertedAt: '2026-09-03 09:30',
    convertedClassId: 'cls-01',
    convertedClassName: 'Turma ESW-2026-A (Pós-Laboral)',
    customAnswers: [
      { questionId: 'q1', question: 'Como tomou conhecimento dos nossos cursos?', answer: 'Recomendação de Colega / Familiar' },
      { questionId: 'q2', question: 'Possui computador portátil próprio para os projetos práticos?', answer: 'Sim' },
      { questionId: 'q3', question: 'Qual o seu nível de escolaridade atual?', answer: 'Técnico Básico ou Médio' }
    ],
    documents: [
      { id: 'doc-8', name: 'Bilhete de Identidade (BI)', type: 'application/pdf', fileName: 'BI_Rogerio_Macuacua.pdf', fileSize: '1.5 MB', verified: true, uploadedAt: '2026-09-01 09:55' }
    ]
  },
  {
    id: 'reg-05',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'CFTPM-CAND-2026-9040',
    fullName: 'Benjamim Ernesto Sitoe',
    documentType: 'BI',
    documentNumber: '110593817204B',
    email: 'benjamim.sitoe@gmail.com',
    phone: '+258 84 801 9283',
    province: 'Gaza',
    city: 'Xai-Xai',
    address: 'Bairro Patrice Lumumba, Q. 4',
    birthDate: '2003-01-19',
    gender: 'Masculino',
    courseId: 'cybersecurity-redes',
    courseName: 'Cibersegurança & Infraestrutura de Redes Cisco',
    regime: 'Laboral',
    shift: 'Manhã (08:00 - 12:00)',
    status: 'Rejeitada',
    rejectionReason: 'Certificado de Habilitações com dados ilegíveis e sem carimbo oficial da instituição de ensino. Solicitada regularização da 2ª via.',
    analysisNotes: 'Notificação automática enviada ao candidato solicitando atualização documental.',
    analyzedBy: 'Secretaria Acadêmica (Dra. Fátima Tembe)',
    analyzedAt: '2026-09-10 15:40',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-07 11:20',
    paymentStatus: 'Pago',
    paymentReference: 'MP-661928-MZ',
    paymentAmount: 1500,
    paymentMethod: 'M-Pesa'
  },
  {
    id: 'reg-06',
    institutionId: 'inst-2',
    branchId: 'branch-2-beira',
    code: 'CTIM-CAND-2026-9104',
    fullName: 'Edilson Zacarias Chissano',
    documentType: 'BI',
    documentNumber: '110928374619C',
    email: 'edilson.chissano@gmail.com',
    phone: '+258 82 819 2831',
    province: 'Sofala',
    city: 'Beira',
    birthDate: '1999-08-03',
    gender: 'Masculino',
    courseId: 'contabilidade-gestao',
    courseName: 'Contabilidade Informatizada & Gestão Fiscal (PGC-NIRF)',
    regime: 'Pós-Laboral',
    status: 'Aguardando Pagamento',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-10 06:40',
    paymentStatus: 'Pendente',
    paymentReference: 'REF-P24-991823',
    paymentAmount: 1200
  }
];

export const INITIAL_NOTIFICATIONS: LiveNotification[] = [
  {
    id: 'notif-bday',
    title: '🎂 Aniversário Hoje: Mariana Fernando Cossa',
    message: 'A aluna Mariana Cossa (Engenharia de Software) comemora anos hoje! Clique para enviar os parabéns via WhatsApp.',
    type: 'birthday',
    timestamp: 'Hoje às 08:00',
    read: false,
    actionText: 'Enviar WhatsApp',
    metadata: { name: 'Mariana Cossa', phone: '+258847129012' }
  },
  {
    id: 'notif-1',
    title: 'Pagamento M-Pesa Confirmado',
    message: 'A inscrição #SIGAR-MZ-2026-9102 de Arnaldo Mabunda teve a taxa de 1.500 MT confirmada via Vodacom M-Pesa.',
    type: 'payment',
    timestamp: 'Há 5 minutos',
    read: false,
    actionText: 'Ver Comprovativo',
    metadata: { code: 'MP-881920-MZ', amount: 1500, name: 'Arnaldo Mabunda' }
  },
  {
    id: 'notif-2',
    title: 'Nova Inscrição Submetida (SIVERC)',
    message: 'Yolanda Mondlane completou a ficha de inscrição para Cibersegurança & Redes Cisco.',
    type: 'registration',
    timestamp: 'Há 18 minutos',
    read: false,
    actionText: 'Ver Candidatura',
    metadata: { code: 'SIGAR-MZ-2026-9103' }
  },
  {
    id: 'notif-3',
    title: 'Certificado Digital Emitido & Autenticado',
    message: 'Certificado oficial Moztechwave emitido para Benedito Cossa com selo digital autenticado no SIVERC.',
    type: 'certificate',
    timestamp: 'Há 45 minutos',
    read: true,
    actionText: 'Validar QR Code'
  }
];

export const CERTIFICATES_DATA: CertificateData[] = [
  {
    id: 'cert-1',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'MTW-CERT-2026-8819',
    studentName: 'BENEDITO AUGUSTO COSSA',
    documentNumber: 'BI nº 110293817290A',
    courseName: 'ENGENHARIA DE SOFTWARE & DESENVOLVIMENTO WEB FULL-STACK',
    durationHours: 1200,
    grade: '18 Valores (Distinção e Louvor)',
    issueDate: '15 de Agosto de 2026',
    validationUrl: 'https://sigar.moztechwave.co.mz/validar/MTW-CERT-2026-8819',
    directorName: 'Eng. Paulo Jafim',
    pedagogicDirector: 'Dra. Amina Abdul',
    authHash: 'e7c90b41aa891048b71d99e034ac2b6f',
    category: 'Tecnologia'
  },
  {
    id: 'cert-2',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'MTW-CERT-2026-7492',
    studentName: 'FILOMENA ERNESTO MACAMO',
    documentNumber: 'BI nº 100182937402F',
    courseName: 'CIBERSEGURANÇA, INFRAESTRUTURA CISCO & AUDITORIA DE SISTEMAS',
    durationHours: 800,
    grade: '17 Valores (Muito Bom)',
    issueDate: '02 de Julho de 2026',
    validationUrl: 'https://sigar.moztechwave.co.mz/validar/MTW-CERT-2026-7492',
    directorName: 'Eng. Paulo Jafim',
    pedagogicDirector: 'Dra. Amina Abdul',
    authHash: 'b482ca09ef911042781da2190bbca401',
    category: 'Tecnologia'
  }
];

export const GALLERY_SLIDES = [
  {
    id: 1,
    title: 'Laboratórios de Tecnologia & Inovação Moztechwave',
    subtitle: 'Ambiente prático com computadores de alto desempenho e rede dedicada',
    tag: 'Campus & Estrutura',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
    stats: '100% Aulas Práticas'
  },
  {
    id: 2,
    title: 'Estudantes em Formação de Programação e Inteligência Artificial',
    subtitle: 'Metodologia ativa baseada em projetos reais para o mercado corporativo',
    tag: 'Corpo Discente',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80',
    stats: '94% Empregabilidade'
  },
  {
    id: 3,
    title: 'Cerimônia de Outorga de Certificados & Diplomas Oficiais',
    subtitle: 'Reconhecimento técnico de excelência emitido pela Moztechwave & SIVERC',
    tag: 'Graduação & Conquista',
    image: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?w=1200&auto=format&fit=crop&q=80',
    stats: '+12.500 Graduados'
  }
];

export const INITIAL_CASH_SESSIONS: CashRegisterSession[] = [
  {
    id: 'cx-sess-2026-001',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    operator: 'Maria Zita Mabote (Tesouraria Central)',
    openedAt: '2026-09-11 07:30',
    openingBalance: 5000,
    currentBalance: 24750,
    status: 'aberto',
    transactions: [
      {
        id: 'cxt-001',
        institutionId: 'inst-1',
        branchId: 'branch-1-maputo',
        type: 'entrada',
        amount: 4500,
        description: 'Propina Mês de Setembro - Aluno Arnaldo Mabunda',
        timestamp: '08:15',
        category: 'Propinas',
        operator: 'Maria Zita',
        paymentMethod: 'M-Pesa',
        studentName: 'Arnaldo Mabunda',
        documentRef: 'REC-2026-9041'
      },
      {
        id: 'cxt-002',
        institutionId: 'inst-1',
        branchId: 'branch-1-maputo',
        type: 'entrada',
        amount: 3850,
        description: 'Taxa de Matrícula + Emissão de Carteirinha - Joana Alface',
        timestamp: '09:20',
        category: 'Matrículas',
        operator: 'Maria Zita',
        paymentMethod: 'Dinheiro',
        studentName: 'Joana Alface',
        documentRef: 'REC-2026-9042'
      },
      {
        id: 'cxt-003',
        institutionId: 'inst-1',
        branchId: 'branch-1-maputo',
        type: 'entrada',
        amount: 12500,
        description: 'Propina Trimestral Engenharia de Software - Filomena Macamo',
        timestamp: '10:45',
        category: 'Propinas',
        operator: 'Maria Zita',
        paymentMethod: 'POS',
        studentName: 'Filomena Macamo',
        documentRef: 'REC-2026-9043'
      },
      {
        id: 'cxt-004',
        institutionId: 'inst-1',
        branchId: 'branch-1-maputo',
        type: 'sangria',
        amount: 3000,
        description: 'Sangria de Caixa - Depósito bancário de segurança para cofre',
        timestamp: '11:30',
        category: 'Sangria',
        operator: 'Maria Zita Mabote',
        paymentMethod: 'Dinheiro',
        documentRef: 'SNG-2026-012'
      },
      {
        id: 'cxt-005',
        institutionId: 'inst-1',
        branchId: 'branch-1-maputo',
        type: 'saida',
        amount: 1100,
        description: 'Aquisição de resmas de papel A4 para Secretaria & Certificados',
        timestamp: '12:00',
        category: 'Material de Escritório',
        operator: 'Maria Zita',
        paymentMethod: 'Dinheiro',
        documentRef: 'DSP-2026-081'
      }
    ]
  },
  {
    id: 'cx-sess-ctim-001',
    institutionId: 'inst-2',
    branchId: 'branch-2-matola',
    operator: 'Joaquim Mondlane (Caixa CTIM)',
    openedAt: '2026-09-11 08:00',
    openingBalance: 3000,
    currentBalance: 8200,
    status: 'aberto',
    transactions: [
      {
        id: 'cxt-ctim-1',
        institutionId: 'inst-2',
        branchId: 'branch-2-matola',
        type: 'entrada',
        amount: 5200,
        description: 'Propina Mês de Setembro - Aluno Bernardo Langa',
        timestamp: '08:45',
        category: 'Propinas',
        operator: 'Joaquim Mondlane',
        paymentMethod: 'e-Mola',
        studentName: 'Bernardo Simão Langa',
        documentRef: 'REC-CTIM-2026-001'
      }
    ]
  }
];

export const INITIAL_LESSONS: ClassLesson[] = [
  {
    id: 'lsn-01',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    disciplineName: 'Arquitetura de Software & Cloud',
    teacherName: 'Eng. Carlos Manuel',
    date: '2026-09-11',
    time: '08:00 - 10:00',
    startTime: '08:00',
    endTime: '10:00',
    title: 'Aula 12: Microserviços com Node.js, Docker e Filas de Mensagens',
    description: 'Nesta aula prática os alunos implementaram containers Docker isolados e configuraram comunicação assíncrona com RabbitMQ.',
    content: '1. Arquitetura Orientada a Eventos vs Monólito Tradicional\n2. Criação de Dockerfile e docker-compose.yml multi-container\n3. Implementação de filas e exchanges no RabbitMQ\n4. Tratamento de mensagens com Dead Letter Queues (DLQ)\n5. Exercício prático em pares no laboratório',
    materials: [
      { id: 'mat-1', title: 'Guia_Pratico_Docker_Microservicos.pdf', type: 'pdf', url: '#', size: '2.4 MB' },
      { id: 'mat-2', title: 'Projeto_Base_Express_RabbitMQ.zip', type: 'zip', url: '#', size: '8.1 MB' }
    ],
    attendances: {
      'std-01': 'presente',
      'std-02': 'presente',
      'std-03': 'justificado',
      'std-04': 'presente'
    },
    attendanceNotes: {
      'std-03': 'Atestado médico odontológico entregue e validado'
    },
    isAttendanceLocked: true,
    attendanceFinalizedAt: '2026-09-11 10:15',
    attendanceFinalizedBy: 'Eng. Carlos Manuel (Docente)',
    totalPresent: 3,
    totalAbsent: 0,
    totalLate: 0,
    totalJustified: 1,
    status: 'concluida'
  },
  {
    id: 'lsn-02',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    disciplineName: 'Bancos de Dados & PostgreSQL',
    teacherName: 'Eng. Carlos Manuel',
    date: '2026-09-09',
    time: '10:15 - 12:15',
    startTime: '10:15',
    endTime: '12:15',
    title: 'Aula 11: Otimização de Índices, Triggers e Índices GiST em PostgreSQL',
    description: 'Análise de performance com EXPLAIN ANALYZE e redução do tempo de resposta de queries complexas.',
    content: '1. Planos de execução de consultas: Seq Scan vs Index Scan\n2. Índices B-Tree, Hash, GiST e GIN\n3. Triggers de auditoria automática em tabelas sensíveis\n4. Particionamento declarativo de tabelas por data',
    materials: [
      { id: 'mat-3', title: 'Apostila_PostgreSQL_Performance.pdf', type: 'pdf', url: '#', size: '1.9 MB' }
    ],
    attendances: {
      'std-01': 'presente',
      'std-02': 'presente',
      'std-03': 'atraso',
      'std-04': 'presente'
    },
    attendanceNotes: {
      'std-03': 'Entrou na sala às 10:35 por problema no transporte'
    },
    isAttendanceLocked: true,
    attendanceFinalizedAt: '2026-09-09 12:20',
    attendanceFinalizedBy: 'Eng. Carlos Manuel (Docente)',
    totalPresent: 3,
    totalAbsent: 0,
    totalLate: 1,
    totalJustified: 0,
    status: 'concluida'
  },
  {
    id: 'lsn-ctim-01',
    institutionId: 'inst-2',
    branchId: 'branch-2-matola',
    classGroupId: 'turma-ctim-aut-01',
    classGroupName: 'Turma AUT-CTIM-01 (Automação)',
    disciplineName: 'Controladores Lógicos Programáveis',
    teacherName: 'Eng. Mateus Nhaca',
    date: '2026-09-11',
    time: '08:00 - 11:00',
    startTime: '08:00',
    endTime: '11:00',
    title: 'Aula Prática 08: Programação Ladder para Esteiras Transportadoras',
    description: 'Calibração de sensores óticos e atuadores pneumáticos em bancada Festo.',
    content: '1. Linguagem Ladder segundo norma IEC 61131-3\n2. Mapeamento de entradas digitais (sensores de presença)\n3. Saídas analógicas para inversor de frequência\n4. Parada de emergência e intertravamento de segurança',
    materials: [
      { id: 'mat-ctim-1', title: 'Manual_CLP_Siemens.pdf', type: 'pdf', url: '#', size: '4.2 MB' }
    ],
    attendances: {
      'std-ctim-01': 'presente'
    },
    isAttendanceLocked: true,
    attendanceFinalizedAt: '2026-09-11 11:05',
    attendanceFinalizedBy: 'Eng. Mateus Nhaca',
    totalPresent: 1,
    totalAbsent: 0,
    totalLate: 0,
    totalJustified: 0,
    status: 'concluida'
  }
];

export const INITIAL_ATTENDANCE_AUDITS: LessonAttendanceAuditLog[] = [
  {
    id: 'aud-01',
    lessonId: 'lsn-01',
    lessonTitle: 'Aula 12: Microserviços com Node.js, Docker e Filas de Mensagens',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    disciplineName: 'Arquitetura de Software & Cloud',
    studentId: 'std-03',
    studentName: 'Mauro César Sitoe',
    studentCode: 'CFTPM-AL-2026-1044',
    previousStatus: 'ausente',
    newStatus: 'justificado',
    reason: 'Apresentação de atestado médico oficial protocolado na secretaria geral',
    actorName: 'Dra. Amina Abdul',
    actorRole: 'DIRETOR',
    actorEmail: 'pedagogico@cftpm.mz',
    timestamp: '2026-09-11 14:30:22',
    actionType: 'correcao'
  },
  {
    id: 'aud-02',
    lessonId: 'lsn-01',
    lessonTitle: 'Aula 12: Microserviços com Node.js, Docker e Filas de Mensagens',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    disciplineName: 'Arquitetura de Software & Cloud',
    studentId: 'std-01',
    studentName: 'Arnaldo Tomás Mabunda',
    studentCode: 'CFTPM-AL-2026-1042',
    previousStatus: 'ausente',
    newStatus: 'presente',
    reason: 'Fechamento regular do diário de frequência pelo docente responsável',
    actorName: 'Eng. Carlos Manuel',
    actorRole: 'PROFESSOR',
    actorEmail: 'carlos.manuel@cftpm.mz',
    timestamp: '2026-09-11 10:14:05',
    actionType: 'registro_inicial'
  },
  {
    id: 'aud-03',
    lessonId: 'lsn-02',
    lessonTitle: 'Aula 11: Otimização de Índices, Triggers e Índices GiST em PostgreSQL',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    disciplineName: 'Bancos de Dados & PostgreSQL',
    studentId: 'ALL',
    studentName: 'Todos os Estudantes Matriculados',
    previousStatus: 'pendente',
    newStatus: 'presente',
    reason: 'Acionamento do recurso de chamada rápida "MARCAR TODOS PRESENTES"',
    actorName: 'Eng. Carlos Manuel',
    actorRole: 'PROFESSOR',
    actorEmail: 'carlos.manuel@cftpm.mz',
    timestamp: '2026-09-09 10:20:10',
    actionType: 'marcar_todos_presentes'
  }
];

export const INITIAL_ACCESS_LOGS: GateAccessLog[] = [
  {
    id: 'acc-01',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    studentId: 'std-01',
    studentCode: 'CFTPM-AL-2026-1042',
    studentName: 'ARNALDO TOMÁS MABUNDA',
    courseName: 'Engenharia de Software & Web Full-Stack',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    guardianPhone: '+258 82 441 9021',
    guardianName: 'Tomás Mabunda (Pai)',
    timestamp: '2026-09-11 07:42:15',
    type: 'entrada',
    operator: 'Joaquim Cossa (Portaria Principal)',
    whatsappStatus: 'enviado',
    confirmed: true
  },
  {
    id: 'acc-02',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    studentId: 'std-02',
    studentCode: 'CFTPM-AL-2026-1043',
    studentName: 'YOLANDA CELINA MONDLANE',
    courseName: 'Cibersegurança & Redes Cisco',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    guardianPhone: '+258 84 883 9021',
    guardianName: 'Celina Mondlane (Mãe)',
    timestamp: '2026-09-11 07:51:30',
    type: 'entrada',
    operator: 'Joaquim Cossa (Portaria Principal)',
    whatsappStatus: 'enviado',
    confirmed: true
  },
  {
    id: 'acc-ctim-01',
    institutionId: 'inst-2',
    branchId: 'branch-2-matola',
    studentId: 'std-ctim-01',
    studentCode: 'CTIM-AL-2026-001',
    studentName: 'BERNARDO SIMÃO LANGA',
    courseName: 'Automação Industrial & Robótica de Fábrica CTIM',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    guardianPhone: '+258 84 902 1102',
    guardianName: 'Simão Langa (Encarregado)',
    timestamp: '2026-09-11 07:58:00',
    type: 'entrada',
    operator: 'Portaria Matola CTIM',
    whatsappStatus: 'enviado',
    confirmed: true
  }
];

export const INITIAL_WHATSAPP_CONFIG: WhatsAppConnection = {
  institutionId: 'inst-1',
  status: 'conectado',
  instanceName: 'Moztechwave_Maputo_Central',
  phoneNumber: '+258 84 900 1200',
  dailyMessagesSent: 148,
  lastSync: '2026-09-11 11:45'
};

export const INITIAL_SCHEDULES: ClassScheduleSlot[] = [
  // Turma ES-2026-A (Engenharia de Software - Manhã)
  {
    id: 'sch-001',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    disciplineId: 'mod-es-1',
    disciplineName: 'Algoritmos, Lógica & Estruturas de Dados Avançadas',
    teacherName: 'Eng. Arone Malendza',
    room: 'Laboratório Tech 1',
    dayOfWeek: 1, // Segunda-feira
    startTime: '08:00',
    endTime: '10:00',
    durationMinutes: 120,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#3b82f6',
    notes: 'Aulas teóricas e práticas com exercícios no terminal Linux e VS Code.',
    createdAt: '2026-02-15 08:00'
  },
  {
    id: 'sch-002',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    disciplineId: 'mod-es-2',
    disciplineName: 'Frontend Moderno com React & Tailwind CSS',
    teacherName: 'Eng. Paulo Jafim',
    room: 'Laboratório Tech 1',
    dayOfWeek: 1, // Segunda-feira
    startTime: '10:30',
    endTime: '12:30',
    durationMinutes: 120,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#06b6d4',
    notes: 'Componentes reativos e consumo de APIs REST.',
    createdAt: '2026-02-15 08:00'
  },
  {
    id: 'sch-003',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    disciplineId: 'mod-es-3',
    disciplineName: 'Backend Robusto em Node.js & Microsserviços',
    teacherName: 'Eng. Arone Malendza',
    room: 'Laboratório Tech 1',
    dayOfWeek: 3, // Quarta-feira
    startTime: '08:00',
    endTime: '10:30',
    durationMinutes: 150,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#3b82f6',
    notes: 'Arquitetura modular e testes automatizados.',
    createdAt: '2026-02-15 08:00'
  },
  {
    id: 'sch-004',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    courseId: 'prog-fullstack',
    courseName: 'Engenharia de Software & Web Full-Stack',
    disciplineId: 'mod-es-4',
    disciplineName: 'Bancos de Dados Relacionais, PostgreSQL & Cloud Firestore',
    teacherName: 'Eng. Paulo Jafim',
    room: 'Laboratório Tech 2',
    dayOfWeek: 5, // Sexta-feira
    startTime: '08:00',
    endTime: '11:00',
    durationMinutes: 180,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#8b5cf6',
    notes: 'Modelagem relacional, indexação e persistência em nuvem.',
    createdAt: '2026-02-15 08:00'
  },

  // Turma CS-2026-B (Cibersegurança - Tarde)
  {
    id: 'sch-005',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-cs-2026-b',
    classGroupName: 'Turma CS-2026-B (Cibersegurança)',
    courseId: 'ciber-cisco',
    courseName: 'Cibersegurança & Infraestrutura Cisco',
    disciplineId: 'mod-cs-1',
    disciplineName: 'Arquitetura TCP/IP, VLANs e Comutação Cisco',
    teacherName: 'Eng. Nelson Mandlate',
    room: 'Laboratório Redes & Hardware',
    dayOfWeek: 1, // Segunda-feira
    startTime: '13:30',
    endTime: '16:30',
    durationMinutes: 180,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#10b981',
    notes: 'Configuração prática em roteadores e switches no rack de laboratório.',
    createdAt: '2026-02-15 08:00'
  },
  {
    id: 'sch-006',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-cs-2026-b',
    classGroupName: 'Turma CS-2026-B (Cibersegurança)',
    courseId: 'ciber-cisco',
    courseName: 'Cibersegurança & Infraestrutura Cisco',
    disciplineId: 'mod-cs-2',
    disciplineName: 'Firewalls de Próxima Geração & Defesa de Perímetro',
    teacherName: 'Eng. Nelson Mandlate',
    room: 'Laboratório Redes & Hardware',
    dayOfWeek: 3, // Quarta-feira
    startTime: '13:30',
    endTime: '16:30',
    durationMinutes: 180,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#10b981',
    notes: 'Políticas de inspeção de pacotes e túneis VPN IPsec.',
    createdAt: '2026-02-15 08:00'
  },
  {
    id: 'sch-007',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-cs-2026-b',
    classGroupName: 'Turma CS-2026-B (Cibersegurança)',
    courseId: 'ciber-cisco',
    courseName: 'Cibersegurança & Infraestrutura Cisco',
    disciplineId: 'mod-cs-3',
    disciplineName: 'Hacking Ético, PenTest & Análise Forense',
    teacherName: 'Eng. Nelson Mandlate',
    room: 'Laboratório Tech 2',
    dayOfWeek: 5, // Sexta-feira
    startTime: '14:00',
    endTime: '17:00',
    durationMinutes: 180,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#ef4444',
    notes: 'Ambiente controlado em Kali Linux para testes de penetração.',
    createdAt: '2026-02-15 08:00'
  },

  // Turma MAQ-2026-A (Operação de Máquinas Pesadas)
  {
    id: 'sch-008',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-maq-2026-a',
    classGroupName: 'Turma MAQ-2026-A (Máquinas)',
    courseId: 'maq-pesadas-01',
    courseName: 'Operação de Máquinas Pesadas & Terraplanagem',
    disciplineId: 'mod-maq-1',
    disciplineName: 'Operação de Escavadeira Hidráulica & Retroescavadeira',
    teacherName: 'Instrutor Chefe Zacarias Sitoe',
    room: 'Pátio de Manobras e Máquinas',
    dayOfWeek: 2, // Terça-feira
    startTime: '08:00',
    endTime: '12:00',
    durationMinutes: 240,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#f59e0b',
    notes: 'Inspeção pré-uso de 360º, comandos por joystick e escavação de valas.',
    createdAt: '2026-02-15 08:00'
  },
  {
    id: 'sch-009',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-maq-2026-a',
    classGroupName: 'Turma MAQ-2026-A (Máquinas)',
    courseId: 'maq-pesadas-01',
    courseName: 'Operação de Máquinas Pesadas & Terraplanagem',
    disciplineId: 'mod-maq-2',
    disciplineName: 'Manutenção Preventiva de Motores Diesel & Hidráulica',
    teacherName: 'Instrutor Chefe Zacarias Sitoe',
    room: 'Oficina Mecânica Central',
    dayOfWeek: 4, // Quinta-feira
    startTime: '08:00',
    endTime: '12:00',
    durationMinutes: 240,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#f59e0b',
    notes: 'Fluidos hidráulicos, filtros, esteiras e sangria de sistemas.',
    createdAt: '2026-02-15 08:00'
  },
  {
    id: 'sch-010',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-maq-2026-a',
    classGroupName: 'Turma MAQ-2026-A (Máquinas)',
    courseId: 'maq-pesadas-01',
    courseName: 'Operação de Máquinas Pesadas & Terraplanagem',
    disciplineId: 'mod-maq-1',
    disciplineName: 'Simulação Operacional de Campo & Carregamento de Caminhões',
    teacherName: 'Instrutor Chefe Zacarias Sitoe',
    room: 'Pátio de Manobras e Máquinas',
    dayOfWeek: 6, // Sábado
    startTime: '08:00',
    endTime: '12:30',
    durationMinutes: 270,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#eab308',
    notes: 'Operação de pá-carregadeira articulada e cálculo de ciclos de carga.',
    createdAt: '2026-02-15 08:00'
  },

  // Inst-2 CTIM
  {
    id: 'sch-ctim-001',
    institutionId: 'inst-2',
    branchId: 'branch-2-matola',
    classGroupId: 'turma-ctim-aut-01',
    classGroupName: 'Turma AUT-CTIM-01 (Automação)',
    courseId: 'ctim-automacao-industrial',
    courseName: 'Automação Industrial & Robótica de Fábrica CTIM',
    disciplineId: 'mod-ctim-1',
    disciplineName: 'Automação com Controladores Lógicos Programáveis (CLP)',
    teacherName: 'Eng. Mateus Nhaca',
    room: 'Hangar Técnico 01 - CTIM',
    dayOfWeek: 1, // Segunda-feira
    startTime: '08:00',
    endTime: '11:30',
    durationMinutes: 210,
    status: 'Agendada',
    recurrence: 'semanal',
    color: '#0284c7',
    notes: 'Programação Ladder e parametrização de inversores de frequência.',
    createdAt: '2026-02-15 08:00'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'prof-01',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'PROF-2026-001',
    fullName: 'Eng. Arone Malendza',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    phone: '+258 84 311 9022',
    email: 'arone.malendza@moztechwave.co.mz',
    academicDegree: 'Mestrado em Engenharia Informática & Telecomunicações (UEM)',
    specialty: 'Arquitetura de Software, Algoritmos Avançados & Microsserviços',
    status: 'Ativo',
    biNumber: '110298410291M',
    hireDate: '2024-01-15',
    biography: 'Engenheiro de Software Sênior e formador com mais de 10 anos de experiência em sistemas distribuídos de alta disponibilidade, Docker e ecossistema Node.js / Go.',
    courseIds: ['prog-fullstack', 'ciber-redes'],
    courseNames: ['Engenharia de Software & Web Full-Stack', 'Cibersegurança & Redes Cisco CCNA'],
    disciplineIds: ['mod-es-1', 'mod-es-3'],
    disciplineNames: [
      'Algoritmos, Lógica & Estruturas de Dados Avançadas',
      'Backend Robusto em Node.js & Microsserviços',
      'Arquitetura de Software & Cloud'
    ],
    classGroupIds: ['turma-es-2026-a', 'turma-es-2026-b'],
    classGroupNames: ['Turma ES-2026-A (Software)', 'Turma ES-2026-B (Software Noite)'],
    documents: [
      {
        id: 'doc-prof-1',
        name: 'Diploma_Mestrado_Engenharia_Informatica_UEM.pdf',
        type: 'diploma',
        url: '#',
        uploadedAt: '2026-01-15',
        size: '2.8 MB'
      },
      {
        id: 'doc-prof-2',
        name: 'Curriculum_Vitae_Arone_Malendza.pdf',
        type: 'curriculo',
        url: '#',
        uploadedAt: '2026-01-15',
        size: '1.4 MB'
      },
      {
        id: 'doc-prof-3',
        name: 'Bilhete_Identidade_Autenticado.pdf',
        type: 'bi',
        url: '#',
        uploadedAt: '2026-01-15',
        size: '850 KB'
      },
      {
        id: 'doc-prof-4',
        name: 'Contrato_Docente_CFTPM_2026.pdf',
        type: 'contrato',
        url: '#',
        uploadedAt: '2026-02-01',
        size: '1.9 MB'
      }
    ],
    createdAt: '2026-01-15 08:30'
  },
  {
    id: 'prof-02',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'PROF-2026-002',
    fullName: 'Eng. Paulo Jafim',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    phone: '+258 84 900 1200',
    email: 'jafimpaulo8@gmail.com',
    academicDegree: 'Licenciatura em Engenharia de Computação & Sistemas',
    specialty: 'Frontend Moderno com React & Tailwind CSS, Bancos de Dados & Cloud Firestore',
    status: 'Ativo',
    biNumber: '110829104921P',
    hireDate: '2024-02-01',
    biography: 'Arquiteto de Soluções Cloud e Desenvolvedor Full-Stack especializado em ecossistema TypeScript, interfaces reativas e persistência na nuvem.',
    courseIds: ['prog-fullstack'],
    courseNames: ['Engenharia de Software & Web Full-Stack'],
    disciplineIds: ['mod-es-2', 'mod-es-4'],
    disciplineNames: [
      'Frontend Moderno com React & Tailwind CSS',
      'Bancos de Dados Relacionais, PostgreSQL & Cloud Firestore'
    ],
    classGroupIds: ['turma-es-2026-a'],
    classGroupNames: ['Turma ES-2026-A (Software)'],
    documents: [
      {
        id: 'doc-prof-5',
        name: 'Certificado_Oficial_Cloud_Solutions_Architect.pdf',
        type: 'certificado',
        url: '#',
        uploadedAt: '2026-01-20',
        size: '1.5 MB'
      },
      {
        id: 'doc-prof-6',
        name: 'Curriculo_Profissional_Paulo_Jafim.pdf',
        type: 'curriculo',
        url: '#',
        uploadedAt: '2026-01-20',
        size: '1.1 MB'
      }
    ],
    createdAt: '2026-01-20 09:00'
  },
  {
    id: 'prof-03',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    code: 'PROF-2026-003',
    fullName: 'Profª. Sarah Jenkins',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
    phone: '+258 82 770 1928',
    email: 'sarah.jenkins@moztechwave.co.mz',
    academicDegree: 'Master of Arts in Applied Linguistics (Cambridge UK)',
    specialty: 'Inglês Técnico para Petróleo e Gás (Oil & Gas), Mineração e Briefings de Segurança HSE',
    status: 'Ativo',
    biNumber: 'DIRE-992102-MZ',
    hireDate: '2024-03-01',
    biography: 'Consultora linguística internacional para projetos de GNL da Bacia do Rovuma com 12 anos de treino técnico corporativo em Moçambique e no Reino Unido.',
    courseIds: ['ingles-oil-gas'],
    courseNames: ['Inglês Técnico para Petróleo, Gás & Mineração'],
    disciplineIds: ['mod-ing-1', 'mod-ing-2'],
    disciplineNames: [
      'Oil & Gas Terminology & Safety Communications',
      'Technical Reports, Procurement & Logistics English'
    ],
    classGroupIds: ['turma-ing-2026-a'],
    classGroupNames: ['Turma ING-2026-A (Oil & Gas)'],
    documents: [
      {
        id: 'doc-prof-7',
        name: 'Cambridge_CELTA_Diploma.pdf',
        type: 'diploma',
        url: '#',
        uploadedAt: '2026-01-22',
        size: '3.4 MB'
      },
      {
        id: 'doc-prof-8',
        name: 'Certificado_Treinamento_HSE_Offshore.pdf',
        type: 'certificado',
        url: '#',
        uploadedAt: '2026-01-22',
        size: '1.8 MB'
      }
    ],
    createdAt: '2026-01-22 10:15'
  },
  {
    id: 'prof-04',
    institutionId: 'inst-2',
    branchId: 'branch-2-matola',
    code: 'FORM-2026-004',
    fullName: 'Eng. Mateus Nhaca',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    phone: '+258 84 551 2299',
    email: 'mateus.nhaca@ctim.co.mz',
    academicDegree: 'Engenharia Eletrotécnica & Especialização em Sistemas Ciberfísicos Industriais',
    specialty: 'Controladores Lógicos Programáveis (CLP), Pneumática & Robótica Fabril',
    status: 'Ativo',
    biNumber: '110492810481A',
    hireDate: '2023-11-10',
    biography: 'Formador sênior homologado Festo Didactic e Siemens Automation com atuação em indústrias pesadas de Moçambique.',
    courseIds: ['ctim-automacao-industrial'],
    courseNames: ['Automação Industrial & Robótica de Fábrica CTIM'],
    disciplineIds: ['mod-ctim-1'],
    disciplineNames: [
      'Automação com Controladores Lógicos Programáveis (CLP)',
      'Pneumática Industrial & Eletropneumática'
    ],
    classGroupIds: ['turma-ctim-aut-01'],
    classGroupNames: ['Turma AUT-CTIM-01 (Automação)'],
    documents: [
      {
        id: 'doc-prof-9',
        name: 'Certificado_Instrutor_Master_Siemens_TIA.pdf',
        type: 'certificado',
        url: '#',
        uploadedAt: '2026-02-05',
        size: '2.5 MB'
      }
    ],
    createdAt: '2026-02-05 11:00'
  }
];

// ==========================================================
// 17. MOTOR DE AVALIAÇÕES & FÓRMULAS DE CÁLCULO
// ==========================================================
export const INITIAL_CALCULATION_FORMULAS: CalculationFormula[] = [
  {
    id: 'formula-ac-exame',
    institutionId: 'inst-1',
    name: 'Regulamento Padrão: Avaliação Contínua (40%) + Exame (60%)',
    description: 'Fórmula acadêmica oficial: média das avaliações contínuas ponderada a 40% somada à nota do exame semestral ponderada a 60%.',
    components: [
      { id: 'comp-1', type: 'avaliacao_continua', label: 'Avaliação Contínua', weight: 40, minScore: 10 },
      { id: 'comp-2', type: 'exame', label: 'Exame Final / Semestral', weight: 60, minScore: 8 }
    ],
    minPassingScore: 10.0,
    examExemptionScore: 14.0,
    recourseMinScore: 7.0,
    isDefault: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'formula-projetos-defesa',
    institutionId: 'inst-1',
    name: 'Avaliação por Projetos: Trabalho (20%) + Projeto (40%) + Defesa (40%)',
    description: 'Fórmula para cursos tecnológicos avançados com ênfase prática, desenvolvimento de artefatos e sustentação perante banca examinadora.',
    components: [
      { id: 'comp-p1', type: 'trabalho', label: 'Trabalho de Pesquisa', weight: 20 },
      { id: 'comp-p2', type: 'projeto', label: 'Projeto Integrador', weight: 40, minScore: 10 },
      { id: 'comp-p3', type: 'defesa', label: 'Defesa Técnica', weight: 40, minScore: 10 }
    ],
    minPassingScore: 10.0,
    examExemptionScore: 16.0,
    recourseMinScore: 8.0,
    isDefault: false,
    createdAt: '2026-01-20'
  },
  {
    id: 'formula-tecnico-pratico',
    institutionId: 'inst-1',
    name: 'Técnico Operacional: Prática (50%) + Prova Final (50%)',
    description: 'Fórmula de cursos operacionais de curta e média duração com foco intensivo em oficina ou laboratório.',
    components: [
      { id: 'comp-t1', type: 'pratica', label: 'Avaliação Prática em Oficina', weight: 50, minScore: 10 },
      { id: 'comp-t2', type: 'prova_final', label: 'Prova Final Global', weight: 50, minScore: 10 }
    ],
    minPassingScore: 10.0,
    examExemptionScore: 14.0,
    recourseMinScore: 7.0,
    isDefault: false,
    createdAt: '2026-02-01'
  },
  {
    id: 'formula-continua-completa',
    institutionId: 'inst-1',
    name: 'Contínua Holística: Teste (30%) + Trabalho (20%) + Prática (30%) + Participação (20%)',
    description: 'Fórmula formativa contínua que avalia testes, relatórios, habilidades práticas de laboratório e assiduidade/participação ativa.',
    components: [
      { id: 'comp-h1', type: 'teste', label: 'Testes Teóricos', weight: 30 },
      { id: 'comp-h2', type: 'trabalho', label: 'Trabalhos & Relatórios', weight: 20 },
      { id: 'comp-h3', type: 'pratica', label: 'Práticas Laboratoriais', weight: 30 },
      { id: 'comp-h4', type: 'participacao', label: 'Participação & Presença', weight: 20 }
    ],
    minPassingScore: 10.0,
    examExemptionScore: 14.0,
    recourseMinScore: 7.0,
    isDefault: false,
    createdAt: '2026-02-10'
  }
];

export const INITIAL_EVALUATIONS: EvaluationItem[] = [
  {
    id: 'eval-01',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    name: 'Avaliação Contínua 1 - Algoritmos & Testes',
    type: 'avaliacao_continua',
    discipline: 'Programação Web & Algoritmos',
    period: '1º Semestre 2026',
    weight: 40,
    maxScore: 20,
    date: '2026-03-22',
    teacher: 'Eng. Carlos Manuel',
    formulaId: 'formula-ac-exame',
    description: 'Fichas práticas, mini-testes laboratoriais e exercícios avaliados de codificação.',
    status: 'homologada',
    scores: {
      'std-01': { studentId: 'std-01', studentName: 'Arnaldo Tomás Mabunda', score: 17.5, maxScore: 20, notes: 'Excelente raciocínio lógico' },
      'std-02': { studentId: 'std-02', studentName: 'Ermelinda Chissano', score: 18.0, maxScore: 20, notes: 'Código limpo e documentado' },
      'std-04': { studentId: 'std-04', studentName: 'Zaida da Graça', score: 16.5, maxScore: 20, notes: 'Boa resolução de problemas' }
    },
    createdAt: '2026-03-10'
  },
  {
    id: 'eval-02',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    name: 'Exame Semestral de Programação Web',
    type: 'exame',
    discipline: 'Programação Web & Algoritmos',
    period: '1º Semestre 2026',
    weight: 60,
    maxScore: 20,
    date: '2026-04-10',
    teacher: 'Eng. Carlos Manuel',
    formulaId: 'formula-ac-exame',
    description: 'Exame oficial presencial com componentes teórico e prático em computador.',
    status: 'homologada',
    scores: {
      'std-01': { studentId: 'std-01', studentName: 'Arnaldo Tomás Mabunda', score: 16.0, maxScore: 20, notes: 'Ótima implementação da API' },
      'std-02': { studentId: 'std-02', studentName: 'Ermelinda Chissano', score: 19.0, maxScore: 20, notes: 'Desempenho exemplar no exame' },
      'std-04': { studentId: 'std-04', studentName: 'Zaida da Graça', score: 15.0, maxScore: 20, notes: 'Aprovada com mérito' }
    },
    createdAt: '2026-03-25'
  },
  {
    id: 'eval-03',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    name: 'Teste Teórico 1 - Arquitetura Limpa',
    type: 'teste',
    discipline: 'Arquitetura de Software',
    period: '1º Semestre 2026',
    weight: 30,
    maxScore: 20,
    date: '2026-03-15',
    teacher: 'Eng. Carlos Manuel',
    description: 'Teste sobre princípios SOLID, Design Patterns e Clean Code.',
    status: 'homologada',
    scores: {
      'std-01': { studentId: 'std-01', studentName: 'Arnaldo Tomás Mabunda', score: 18.0, maxScore: 20 },
      'std-02': { studentId: 'std-02', studentName: 'Ermelinda Chissano', score: 17.5, maxScore: 20 },
      'std-04': { studentId: 'std-04', studentName: 'Zaida da Graça', score: 14.0, maxScore: 20 }
    },
    createdAt: '2026-03-01'
  },
  {
    id: 'eval-04',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    name: 'Trabalho de Pesquisa: Microsserviços vs Monólitos',
    type: 'trabalho',
    discipline: 'Arquitetura de Software',
    period: '1º Semestre 2026',
    weight: 20,
    maxScore: 20,
    date: '2026-03-28',
    teacher: 'Eng. Carlos Manuel',
    description: 'Elaboração de artigo técnico comparativo com estudo de caso empresarial.',
    status: 'homologada',
    scores: {
      'std-01': { studentId: 'std-01', studentName: 'Arnaldo Tomás Mabunda', score: 17.0, maxScore: 20 },
      'std-02': { studentId: 'std-02', studentName: 'Ermelinda Chissano', score: 18.5, maxScore: 20 },
      'std-04': { studentId: 'std-04', studentName: 'Zaida da Graça', score: 16.0, maxScore: 20 }
    },
    createdAt: '2026-03-12'
  },
  {
    id: 'eval-05',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    name: 'Projeto Prático - Sistema de Gestão Escolar (SIGAR)',
    type: 'projeto',
    discipline: 'Engenharia de Software Aplicada',
    period: '1º Semestre 2026',
    weight: 40,
    maxScore: 20,
    date: '2026-04-05',
    teacher: 'Eng. Paulo Jafim',
    description: 'Desenvolvimento do backend e frontend com persistência e autenticação.',
    status: 'homologada',
    scores: {
      'std-01': { studentId: 'std-01', studentName: 'Arnaldo Tomás Mabunda', score: 18.5, maxScore: 20 },
      'std-02': { studentId: 'std-02', studentName: 'Ermelinda Chissano', score: 19.5, maxScore: 20 },
      'std-04': { studentId: 'std-04', studentName: 'Zaida da Graça', score: 17.0, maxScore: 20 }
    },
    createdAt: '2026-03-18'
  },
  {
    id: 'eval-06',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    name: 'Defesa Oral de Projeto & Demonstração Técnica',
    type: 'defesa',
    discipline: 'Engenharia de Software Aplicada',
    period: '1º Semestre 2026',
    weight: 40,
    maxScore: 20,
    date: '2026-04-12',
    teacher: 'Eng. Paulo Jafim',
    description: 'Sustentação perante banca e demonstração ao vivo da solução funcionando.',
    status: 'homologada',
    scores: {
      'std-01': { studentId: 'std-01', studentName: 'Arnaldo Tomás Mabunda', score: 19.0, maxScore: 20 },
      'std-02': { studentId: 'std-02', studentName: 'Ermelinda Chissano', score: 20.0, maxScore: 20 },
      'std-04': { studentId: 'std-04', studentName: 'Zaida da Graça', score: 17.5, maxScore: 20 }
    },
    createdAt: '2026-03-20'
  },
  {
    id: 'eval-07',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-cs-2026-b',
    classGroupName: 'Turma CS-2026-B (Cibersegurança)',
    name: 'Laboratório Prático: Configuração de Firewall & IDS',
    type: 'pratica',
    discipline: 'Segurança Perimetral',
    period: '1º Semestre 2026',
    weight: 50,
    maxScore: 20,
    date: '2026-04-02',
    teacher: 'Mestre Joaquim Tembe',
    description: 'Instalação e regras de iptables, Suricata e isolamento de tráfego malicioso.',
    status: 'homologada',
    scores: {
      'std-03': { studentId: 'std-03', studentName: 'Inocêncio Paulino Macuácua', score: 16.5, maxScore: 20 }
    },
    createdAt: '2026-03-15'
  },
  {
    id: 'eval-08',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-cs-2026-b',
    classGroupName: 'Turma CS-2026-B (Cibersegurança)',
    name: 'Prova Final Global de Segurança de Redes',
    type: 'prova_final',
    discipline: 'Segurança Perimetral',
    period: '1º Semestre 2026',
    weight: 50,
    maxScore: 20,
    date: '2026-04-15',
    teacher: 'Mestre Joaquim Tembe',
    description: 'Prova teórica e prática com simulação de ataque e defesa.',
    status: 'homologada',
    scores: {
      'std-03': { studentId: 'std-03', studentName: 'Inocêncio Paulino Macuácua', score: 15.0, maxScore: 20 }
    },
    createdAt: '2026-03-25'
  },
  {
    id: 'eval-09',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    name: 'Participação nas Discussões & Código Colaborativo',
    type: 'participacao',
    discipline: 'Programação Web & Algoritmos',
    period: '1º Semestre 2026',
    weight: 20,
    maxScore: 20,
    date: '2026-04-01',
    teacher: 'Eng. Carlos Manuel',
    description: 'Pontualidade, colaboração em pair programming e pull requests no GitHub.',
    status: 'homologada',
    scores: {
      'std-01': { studentId: 'std-01', studentName: 'Arnaldo Tomás Mabunda', score: 18.0, maxScore: 20 },
      'std-02': { studentId: 'std-02', studentName: 'Ermelinda Chissano', score: 19.0, maxScore: 20 },
      'std-04': { studentId: 'std-04', studentName: 'Zaida da Graça', score: 17.0, maxScore: 20 }
    },
    createdAt: '2026-03-01'
  }
];

export const INITIAL_INTERNSHIPS: InternshipContract[] = [
  {
    id: 'intern-01',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    studentId: 'std-01',
    studentName: 'Arnaldo Tomás Mabunda',
    studentCode: 'CFTPM-AL-2026-01',
    studentDocumentNumber: '110100293841B',
    studentPhone: '+258 84 901 2345',
    studentEmail: 'arnaldo.mabunda@gmail.com',
    courseId: 'c1',
    courseName: 'Engenharia de Software & Web Fullstack',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    company: {
      name: 'Vodacom Moçambique, S.A.',
      nuit: '400129841',
      sector: 'Telecomunicações e Tecnologia da Informação',
      contactPerson: 'Dra. Luísa Cossa (RH)',
      phone: '+258 84 000 0000',
      email: 'carreiras@vm.co.mz',
      address: 'Rua dos Desportistas, Edifício Jat V-III, 8º Andar',
      city: 'Maputo Cidade',
      province: 'Maputo Cidade'
    },
    supervisor: {
      companySupervisor: 'Eng. Nelson Chissano',
      companySupervisorRole: 'Tech Lead / Arquiteto de Sistemas',
      companySupervisorPhone: '+258 84 333 1290',
      companySupervisorEmail: 'nelson.chissano@vm.co.mz',
      academicSupervisor: 'Eng. Carlos Manuel',
      academicSupervisorPhone: '+258 84 123 4567'
    },
    startDate: '2026-02-01',
    endDate: '2026-05-31',
    workloadHours: 320,
    location: 'Sede Central Vodacom - Departamento de Engenharia de Plataformas Digitais',
    activities: 'Desenvolvimento e manutenção de microserviços em Node.js e TypeScript; integração de APIs de pagamento M-Pesa; implementação de testes automatizados e monitorização com Docker e CI/CD.',
    status: 'em andamento',
    generatedDocuments: {
      termoCompromissoDate: '2026-01-25',
      cartaApresentacaoDate: '2026-01-20'
    },
    createdAt: '2026-01-18'
  },
  {
    id: 'intern-02',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    studentId: 'std-02',
    studentName: 'Ermelinda Chissano',
    studentCode: 'CFTPM-AL-2026-02',
    studentDocumentNumber: '110200847291M',
    studentPhone: '+258 82 456 7890',
    studentEmail: 'ermelinda.chissano@gmail.com',
    courseId: 'c1',
    courseName: 'Engenharia de Software & Web Fullstack',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    company: {
      name: 'Moza Banco, S.A.',
      nuit: '400238910',
      sector: 'Banca Comercial & Soluções Financeiras',
      contactPerson: 'Dr. Salvador Matsinhe',
      phone: '+258 21 342 000',
      email: 'estagios@mozabanco.co.mz',
      address: 'Avenida 24 de Julho, nº 1098, Edifício Jat IV',
      city: 'Maputo Cidade',
      province: 'Maputo Cidade'
    },
    supervisor: {
      companySupervisor: 'Dr. Armando Bila',
      companySupervisorRole: 'Gestor de Segurança e Automação Bancária',
      companySupervisorPhone: '+258 82 998 1200',
      companySupervisorEmail: 'armando.bila@mozabanco.co.mz',
      academicSupervisor: 'Eng. Carlos Manuel',
      academicSupervisorPhone: '+258 84 123 4567'
    },
    startDate: '2025-10-01',
    endDate: '2026-01-31',
    workloadHours: 360,
    location: 'Direcção de Transformação Digital e Inovação - Moza Banco Central',
    activities: 'Apoio no desenvolvimento de interfaces de Internet Banking com React; validação de regras de segurança OWASP; elaboração de documentação técnica e apoio no canal de atendimento digital.',
    status: 'concluído',
    evaluation: {
      score: 18.5,
      attendanceScore: 19.0,
      technicalSkillsScore: 18.0,
      professionalConductScore: 18.5,
      technicalFeedback: 'A formanda Ermelinda Chissano demonstrou elevado rigor analítico, pontualidade britânica e facilidade em adaptar-se aos frameworks internos do banco. Excelente capacidade de trabalho em equipa e postura ética irrepreensível.',
      recommendation: 'Aprovado com Distinção',
      evaluatedByCompanySupervisor: true,
      companySupervisorName: 'Dr. Armando Bila',
      academicSupervisorName: 'Eng. Carlos Manuel',
      evaluationDate: '2026-02-05'
    },
    generatedDocuments: {
      termoCompromissoDate: '2025-09-20',
      cartaApresentacaoDate: '2025-09-15',
      fichaAvaliacaoDate: '2026-02-05',
      declaracaoConclusaoDate: '2026-02-08'
    },
    createdAt: '2025-09-10'
  },
  {
    id: 'intern-03',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    studentId: 'std-03',
    studentName: 'Inocêncio Paulino Macuácua',
    studentCode: 'CFTPM-AL-2026-03',
    studentDocumentNumber: '110300918234K',
    studentPhone: '+258 86 112 3456',
    studentEmail: 'inocencio.macuacua@outlook.com',
    courseId: 'c2',
    courseName: 'Cibersegurança & Defesa Digital',
    classGroupId: 'turma-cs-2026-b',
    classGroupName: 'Turma CS-2026-B (Cibersegurança)',
    company: {
      name: 'MPDC - Sociedade de Desenvolvimento do Porto de Maputo',
      nuit: '400087654',
      sector: 'Logística Portuária & Infraestruturas Críticas',
      contactPerson: 'Engª. Teresa Manjate',
      phone: '+258 21 432 100',
      email: 'recrutamento@portmaputo.com',
      address: 'Praça dos Trabalhadores, Recinto Portuário',
      city: 'Maputo Cidade',
      province: 'Maputo Cidade'
    },
    supervisor: {
      companySupervisor: 'Eng. Rui Guambe',
      companySupervisorRole: 'Diretor de Cibersegurança e OT',
      companySupervisorPhone: '+258 84 771 9022',
      companySupervisorEmail: 'rui.guambe@portmaputo.com',
      academicSupervisor: 'Mestre Joaquim Tembe',
      academicSupervisorPhone: '+258 84 991 2233'
    },
    startDate: '2026-03-15',
    endDate: '2026-07-15',
    workloadHours: 400,
    location: 'SOC (Security Operations Center) - Terminal de Carga Geral',
    activities: 'Auditoria perimetral de redes industriais (SCADA/OT); análise de vulnerabilidades com Nessus e OpenVAS; parametrização de políticas de firewall e simulações controladas de resposta a incidentes.',
    status: 'atribuído',
    generatedDocuments: {
      termoCompromissoDate: '2026-03-01',
      cartaApresentacaoDate: '2026-02-28'
    },
    createdAt: '2026-02-25'
  },
  {
    id: 'intern-04',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    studentId: 'std-04',
    studentName: 'Zaida da Graça',
    studentCode: 'CFTPM-AL-2026-04',
    studentDocumentNumber: '110400192837L',
    studentPhone: '+258 84 556 7788',
    studentEmail: 'zaida.graca@gmail.com',
    courseId: 'c1',
    courseName: 'Engenharia de Software & Web Fullstack',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    company: {
      name: 'Em Busca de Concedente (Centro de Carreiras)',
      nuit: '',
      sector: 'Tecnologia / Desenvolvimento Web',
      contactPerson: 'Gabinete de Empregabilidade',
      phone: '+258 21 000 111',
      email: 'estagios@cftpm.ac.mz',
      address: 'Campus Central SIGAR',
      city: 'Maputo Cidade',
      province: 'Maputo Cidade'
    },
    supervisor: {
      companySupervisor: 'Pendente de Atribuição',
      academicSupervisor: 'Eng. Carlos Manuel',
      academicSupervisorPhone: '+258 84 123 4567'
    },
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    workloadHours: 240,
    location: 'Maputo ou Matola',
    activities: 'Candidatura submetida no banco de vagas para estágio em Front-end React e APIs REST em empresas parceiras de tecnologia e telecomunicações.',
    status: 'procurando',
    createdAt: '2026-03-10'
  },
  {
    id: 'intern-05',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    studentId: 'std-05',
    studentName: 'Mateus Sebastião Nhatitima',
    studentCode: 'CFTPM-AL-2026-05',
    studentDocumentNumber: '110500736281P',
    studentPhone: '+258 84 778 9900',
    studentEmail: 'mateus.nhatitima@gmail.com',
    courseId: 'c3',
    courseName: 'Eletricidade Industrial & Automação PLC',
    classGroupId: 'turma-el-2026-c',
    classGroupName: 'Turma EL-2026-C (Eletricidade)',
    company: {
      name: 'EDM - Eletricidade de Moçambique, E.P.',
      nuit: '400012345',
      sector: 'Energia Elétrica & Distribuição',
      contactPerson: 'Eng. Lourenço Macamo',
      phone: '+258 21 353 600',
      email: 'rh.estagios@edm.co.mz',
      address: 'Avenida Agostinho Neto, nº 70, Central EDM',
      city: 'Maputo Cidade',
      province: 'Maputo Cidade'
    },
    supervisor: {
      companySupervisor: 'Eng. Alberto Nhantumbo',
      academicSupervisor: 'Eng. Daniel Cossa',
      academicSupervisorPhone: '+258 84 661 2299'
    },
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    workloadHours: 320,
    location: 'Subestação de Transformação de Infulene & Central de Despacho',
    activities: 'Comissionamento e calibração de transformadores de potência; programação de relés de proteção digital e leitura de esquemas de automação SCADA.',
    status: 'pendente',
    createdAt: '2026-03-12'
  }
];

export const INITIAL_PAUTA_HOMOLOGATIONS: PautaHomologationRecord[] = [
  {
    id: 'homol-01',
    institutionId: 'inst-1',
    branchId: 'branch-1-maputo',
    pautaKey: 'turma-es-2026-a_Programação Web & Algoritmos_semestral',
    scope: 'semestral',
    classGroupId: 'turma-es-2026-a',
    classGroupName: 'Turma ES-2026-A (Software)',
    courseId: 'c1',
    courseName: 'Engenharia de Software & Web Fullstack',
    discipline: 'Programação Web & Algoritmos',
    period: '1º Semestre 2026',
    status: 'HOMOLOGADA',
    homologatedBy: 'Prof. Doutor Zacarias Nhantumbo (Diretor Geral)',
    homologatedRole: 'DIRETOR',
    homologatedAt: '2026-04-10 14:30:00',
    approvalNotes: 'Pauta homologada em Conselho Pedagógico após verificação dos diários de turma e médias ponderadas.'
  }
];


