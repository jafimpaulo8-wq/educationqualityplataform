/**
 * Dados Padrão e Modelos Iniciais do Sistema de Assinaturas (Módulo 23)
 */

import { SystemSignature, OfficialSigner } from '../types/signatures';

export const DEFAULT_OFFICIAL_SIGNERS: OfficialSigner[] = [
  {
    id: 'signer-01',
    institutionId: 'inst-01',
    name: 'Eng. Paulo Jafim Pereira',
    role: 'Diretor',
    signerTitle: 'Diretor Geral & Coordenador Executivo',
    email: 'jafimpaulo8@gmail.com',
    phone: '+258 84 123 4567',
    associatedUserId: 'user-dir-01',
    digitalSealCode: 'SIVERC-SEAL-DIR-8819',
    isActive: true,
    registeredAt: '2026-01-15',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M10,40 Q40,5 70,35 T130,25 T190,45" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round"/></svg>'
  },
  {
    id: 'signer-02',
    institutionId: 'inst-01',
    name: 'Dra. Maria Helena Mabunda',
    role: 'Coordenador',
    signerTitle: 'Coordenadora Pedagógica & Registo Académico',
    email: 'helena.mabunda@moztechwave.co.mz',
    phone: '+258 82 987 6543',
    associatedUserId: 'user-coord-01',
    digitalSealCode: 'SIVERC-SEAL-COORD-4412',
    isActive: true,
    registeredAt: '2026-02-01',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M15,45 Q50,15 90,30 T150,20 T185,50" fill="none" stroke="%23047857" stroke-width="2.2" stroke-linecap="round"/></svg>'
  },
  {
    id: 'signer-03',
    institutionId: 'inst-01',
    name: 'Prof. Dr. Amílcar Silveira',
    role: 'Professor',
    signerTitle: 'Docente Titular de Cibersegurança & Redes',
    email: 'amilcar.silveira@moztechwave.co.mz',
    phone: '+258 84 555 1212',
    associatedUserId: 'prof-01',
    digitalSealCode: 'SIVERC-SEAL-PROF-9901',
    isActive: true,
    registeredAt: '2026-02-10',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M20,38 Q60,10 100,40 T140,15 T180,35" fill="none" stroke="%230f766e" stroke-width="2.5" stroke-linecap="round"/></svg>'
  },
  {
    id: 'signer-04',
    institutionId: 'inst-01',
    name: 'Eng. Carlos Manuel Sitoe',
    role: 'Formador',
    signerTitle: 'Formador Chefe de Engenharia de Software',
    email: 'carlos.sitoe@moztechwave.co.mz',
    phone: '+258 87 333 4444',
    associatedUserId: 'formador-01',
    digitalSealCode: 'SIVERC-SEAL-FORM-1049',
    isActive: true,
    registeredAt: '2026-02-15',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M15,35 Q70,5 110,45 T160,25 T195,40" fill="none" stroke="%234338ca" stroke-width="2.4" stroke-linecap="round"/></svg>'
  },
  {
    id: 'signer-05',
    institutionId: 'inst-01',
    name: 'Sr. Salomão Tembe',
    role: 'Responsável',
    signerTitle: 'Encarregado de Educação & Tutor Financeiro',
    email: 'salomao.tembe@gmail.com',
    phone: '+258 84 999 8888',
    associatedUserId: 'resp-01',
    digitalSealCode: 'SIVERC-SEAL-RESP-7712',
    isActive: true,
    registeredAt: '2026-03-01'
  },
  {
    id: 'signer-06',
    institutionId: 'inst-01',
    name: 'Dr. Zacarias Langa',
    role: 'Outro',
    customRoleTitle: 'Supervisor de Estágios & Relações Industriais',
    signerTitle: 'Supervisor Corporativo de Estágios',
    email: 'z.langa@empresa-parceira.mz',
    phone: '+258 82 111 2233',
    digitalSealCode: 'SIVERC-SEAL-AUT-3390',
    isActive: true,
    registeredAt: '2026-03-05'
  }
];

export const INITIAL_SYSTEM_SIGNATURES: SystemSignature[] = [
  // 1. Certificado de Conclusão - Assinado pelo Diretor e Formador, Pendente pelo Coordenador
  {
    id: 'sig-001',
    institutionId: 'inst-01',
    role: 'Diretor',
    signerName: 'Eng. Paulo Jafim Pereira',
    signerTitle: 'Diretor Geral & Coordenador Executivo',
    signedAt: '2026-09-12 10:45',
    createdAt: '2026-09-10',
    deadlineDate: '2026-09-20',
    status: 'Assinado',
    document: {
      documentId: 'cert-9021',
      documentType: 'Certificado',
      documentNumber: 'MTW-CERT-2026-9021',
      title: 'Certificado de Habilitações & Conclusão de Curso',
      recipientName: 'Arsénio Mário Sitoe',
      recipientCode: 'CFTPM-AL-2026-0042',
      courseName: 'Engenharia de Software & Web Full-Stack',
      issueDate: '2026-09-10',
      summary: 'Certifica com louvor a conclusão de 480 horas letivas com média final de 17.5 valores.'
    },
    allowedRoles: ['DIRETOR', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'director', 'superadmin'],
    signedByUserId: 'user-dir-01',
    signedByUserName: 'Eng. Paulo Jafim Pereira',
    signedByUserEmail: 'jafimpaulo8@gmail.com',
    signedByRole: 'DIRETOR',
    digitalSeal: 'SIVERC-SIG-DIR-2026-88192A',
    verificationHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    stampType: 'homologado',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M10,40 Q40,5 70,35 T130,25 T190,45" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round"/></svg>',
    auditTrail: [
      {
        id: 'aud-1',
        action: 'solicitacao_criada',
        timestamp: '2026-09-10 09:00',
        actorId: 'sec-01',
        actorName: 'Secretaria Acadêmica',
        actorRole: 'SECRETARIA',
        details: 'Solicitação de assinatura de Certificado emitida para o Diretor Geral.'
      },
      {
        id: 'aud-2',
        action: 'assinada',
        timestamp: '2026-09-12 10:45',
        actorId: 'user-dir-01',
        actorName: 'Eng. Paulo Jafim Pereira',
        actorRole: 'DIRETOR',
        details: 'Assinado eletronicamente com selo SIVERC-SIG-DIR-2026-88192A e rubrica digital.'
      }
    ]
  },
  {
    id: 'sig-002',
    institutionId: 'inst-01',
    role: 'Formador',
    signerName: 'Eng. Carlos Manuel Sitoe',
    signerTitle: 'Formador Chefe de Engenharia de Software',
    signedAt: '2026-09-11 16:30',
    createdAt: '2026-09-10',
    deadlineDate: '2026-09-20',
    status: 'Assinado',
    document: {
      documentId: 'cert-9021',
      documentType: 'Certificado',
      documentNumber: 'MTW-CERT-2026-9021',
      title: 'Certificado de Habilitações & Conclusão de Curso',
      recipientName: 'Arsénio Mário Sitoe',
      recipientCode: 'CFTPM-AL-2026-0042',
      courseName: 'Engenharia de Software & Web Full-Stack',
      issueDate: '2026-09-10',
      summary: 'Certifica com louvor a conclusão de 480 horas letivas com média final de 17.5 valores.'
    },
    allowedRoles: ['FORMADOR', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'formador', 'superadmin'],
    signedByUserId: 'formador-01',
    signedByUserName: 'Eng. Carlos Manuel Sitoe',
    signedByUserEmail: 'carlos.sitoe@moztechwave.co.mz',
    signedByRole: 'FORMADOR',
    digitalSeal: 'SIVERC-SIG-FORM-2026-10492B',
    verificationHash: 'sha256:4b22e1189ac3f0559a2da38290a2d61998f413a1e502b489028cb9a2f7c00184',
    stampType: 'autenticado',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M15,35 Q70,5 110,45 T160,25 T195,40" fill="none" stroke="%234338ca" stroke-width="2.4" stroke-linecap="round"/></svg>',
    auditTrail: [
      {
        id: 'aud-3',
        action: 'solicitacao_criada',
        timestamp: '2026-09-10 09:00',
        actorId: 'sec-01',
        actorName: 'Secretaria Acadêmica',
        actorRole: 'SECRETARIA',
        details: 'Solicitação de assinatura de Certificado emitida para o Formador.'
      },
      {
        id: 'aud-4',
        action: 'assinada',
        timestamp: '2026-09-11 16:30',
        actorId: 'formador-01',
        actorName: 'Eng. Carlos Manuel Sitoe',
        actorRole: 'FORMADOR',
        details: 'Assinado pelo Formador com validação de notas e frequência de aulas.'
      }
    ]
  },
  {
    id: 'sig-003',
    institutionId: 'inst-01',
    role: 'Coordenador',
    signerName: 'Dra. Maria Helena Mabunda',
    signerTitle: 'Coordenadora Pedagógica & Registo Académico',
    createdAt: '2026-09-10',
    deadlineDate: '2026-09-20',
    status: 'Pendente',
    document: {
      documentId: 'cert-9021',
      documentType: 'Certificado',
      documentNumber: 'MTW-CERT-2026-9021',
      title: 'Certificado de Habilitações & Conclusão de Curso',
      recipientName: 'Arsénio Mário Sitoe',
      recipientCode: 'CFTPM-AL-2026-0042',
      courseName: 'Engenharia de Software & Web Full-Stack',
      issueDate: '2026-09-10',
      summary: 'Certifica com louvor a conclusão de 480 horas letivas com média final de 17.5 valores.'
    },
    allowedRoles: ['DIRETOR', 'SECRETARIA', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'director', 'secretaria', 'superadmin'],
    assignedUserEmail: 'helena.mabunda@moztechwave.co.mz',
    digitalSeal: 'SIVERC-SIG-COORD-2026-PENDING',
    verificationHash: '',
    auditTrail: [
      {
        id: 'aud-5',
        action: 'solicitacao_criada',
        timestamp: '2026-09-10 09:00',
        actorId: 'sec-01',
        actorName: 'Secretaria Acadêmica',
        actorRole: 'SECRETARIA',
        details: 'Aguardando validação e assinatura da Coordenadora Pedagógica.'
      }
    ]
  },

  // 2. Contrato de Prestação de Serviços - Diretor assinou, Responsável pendente
  {
    id: 'sig-004',
    institutionId: 'inst-01',
    role: 'Diretor',
    signerName: 'Eng. Paulo Jafim Pereira',
    signerTitle: 'Diretor Geral & Representante Legal',
    signedAt: '2026-09-08 11:15',
    createdAt: '2026-09-08',
    deadlineDate: '2026-09-18',
    status: 'Assinado',
    document: {
      documentId: 'ctr-0042',
      documentType: 'Contrato',
      documentNumber: 'CFTPM-CTR-2026-0042',
      title: 'Contrato de Prestação de Serviços Educacionais e Matrícula',
      recipientName: 'Kátia Macuácua',
      recipientCode: 'CFTPM-AL-2026-0088',
      courseName: 'Contabilidade Prática & Primavera BSS',
      issueDate: '2026-09-08',
      summary: 'Contrato semestral de formação profissional com valor de 18.000 MT.'
    },
    allowedRoles: ['DIRETOR', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'director', 'superadmin'],
    signedByUserId: 'user-dir-01',
    signedByUserName: 'Eng. Paulo Jafim Pereira',
    signedByUserEmail: 'jafimpaulo8@gmail.com',
    signedByRole: 'DIRETOR',
    digitalSeal: 'SIVERC-SIG-DIR-2026-33918C',
    verificationHash: 'sha256:9a32c0918ef88b1392aa001198fbc923091e08927163c4819a008cb19029a456',
    stampType: 'oficial',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M10,40 Q40,5 70,35 T130,25 T190,45" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round"/></svg>',
    auditTrail: [
      {
        id: 'aud-6',
        action: 'solicitacao_criada',
        timestamp: '2026-09-08 09:30',
        actorId: 'sec-01',
        actorName: 'Secretaria Acadêmica',
        actorRole: 'SECRETARIA',
        details: 'Contrato gerado a partir do modelo padrão.'
      },
      {
        id: 'aud-7',
        action: 'assinada',
        timestamp: '2026-09-08 11:15',
        actorId: 'user-dir-01',
        actorName: 'Eng. Paulo Jafim Pereira',
        actorRole: 'DIRETOR',
        details: 'Contrato assinado e homologado pelo Diretor Geral.'
      }
    ]
  },
  {
    id: 'sig-005',
    institutionId: 'inst-01',
    role: 'Responsável',
    signerName: 'Sr. Salomão Tembe',
    signerTitle: 'Encarregado de Educação & Tutor Financeiro',
    createdAt: '2026-09-08',
    deadlineDate: '2026-09-18',
    status: 'Pendente',
    document: {
      documentId: 'ctr-0042',
      documentType: 'Contrato',
      documentNumber: 'CFTPM-CTR-2026-0042',
      title: 'Contrato de Prestação de Serviços Educacionais e Matrícula',
      recipientName: 'Kátia Macuácua',
      recipientCode: 'CFTPM-AL-2026-0088',
      courseName: 'Contabilidade Prática & Primavera BSS',
      issueDate: '2026-09-08',
      summary: 'Contrato semestral de formação profissional com valor de 18.000 MT.'
    },
    allowedRoles: ['RESPONSAVEL', 'ALUNO', 'SUPER_ADMIN', 'responsavel', 'aluno', 'superadmin'],
    assignedUserEmail: 'salomao.tembe@gmail.com',
    digitalSeal: 'SIVERC-SIG-RESP-2026-PENDING',
    verificationHash: '',
    auditTrail: [
      {
        id: 'aud-8',
        action: 'solicitacao_criada',
        timestamp: '2026-09-08 09:30',
        actorId: 'sec-01',
        actorName: 'Secretaria Acadêmica',
        actorRole: 'SECRETARIA',
        details: 'Link de assinatura enviado via WhatsApp e e-mail para o Encarregado de Educação.'
      }
    ]
  },

  // 3. Pauta Acadêmica Oficial - Professor assinou, Coordenador e Diretor pendentes
  {
    id: 'sig-006',
    institutionId: 'inst-01',
    role: 'Professor',
    signerName: 'Prof. Dr. Amílcar Silveira',
    signerTitle: 'Docente Titular de Cibersegurança & Redes',
    signedAt: '2026-09-14 09:20',
    createdAt: '2026-09-13',
    deadlineDate: '2026-09-22',
    status: 'Assinado',
    document: {
      documentId: 'pauta-ti-01',
      documentType: 'Pauta',
      documentNumber: 'PAUTA-2026-T1-TI',
      title: 'Pauta Trimestral Oficial de Aproveitamento Académico',
      recipientName: 'Turma TI-2026-A (24 Alunos)',
      courseName: 'Técnico de Redes & Cibersegurança',
      issueDate: '2026-09-13',
      summary: 'Pauta de avaliação contínua (40%) + Exame (60%) de 24 estudantes da turma matutina.'
    },
    allowedRoles: ['PROFESSOR', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'professor', 'superadmin'],
    signedByUserId: 'prof-01',
    signedByUserName: 'Prof. Dr. Amílcar Silveira',
    signedByUserEmail: 'amilcar.silveira@moztechwave.co.mz',
    signedByRole: 'PROFESSOR',
    digitalSeal: 'SIVERC-SIG-PROF-2026-99011D',
    verificationHash: 'sha256:1a89b4562098dcf890123efaa89076bcde091238475892019485762039485761',
    stampType: 'autenticado',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M20,38 Q60,10 100,40 T140,15 T180,35" fill="none" stroke="%230f766e" stroke-width="2.5" stroke-linecap="round"/></svg>',
    auditTrail: [
      {
        id: 'aud-9',
        action: 'solicitacao_criada',
        timestamp: '2026-09-13 18:00',
        actorId: 'prof-01',
        actorName: 'Prof. Dr. Amílcar Silveira',
        actorRole: 'PROFESSOR',
        details: 'Pauta submetida para homologação institucional.'
      },
      {
        id: 'aud-10',
        action: 'assinada',
        timestamp: '2026-09-14 09:20',
        actorId: 'prof-01',
        actorName: 'Prof. Dr. Amílcar Silveira',
        actorRole: 'PROFESSOR',
        details: 'Assinatura digital de confirmação dos lançamentos de notas.'
      }
    ]
  },
  {
    id: 'sig-007',
    institutionId: 'inst-01',
    role: 'Coordenador',
    signerName: 'Dra. Maria Helena Mabunda',
    signerTitle: 'Coordenadora Pedagógica & Registo Académico',
    createdAt: '2026-09-13',
    deadlineDate: '2026-09-22',
    status: 'Pendente',
    document: {
      documentId: 'pauta-ti-01',
      documentType: 'Pauta',
      documentNumber: 'PAUTA-2026-T1-TI',
      title: 'Pauta Trimestral Oficial de Aproveitamento Académico',
      recipientName: 'Turma TI-2026-A (24 Alunos)',
      courseName: 'Técnico de Redes & Cibersegurança',
      issueDate: '2026-09-13',
      summary: 'Pauta de avaliação contínua (40%) + Exame (60%) de 24 estudantes da turma matutina.'
    },
    allowedRoles: ['DIRETOR', 'SECRETARIA', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'director', 'secretaria', 'superadmin'],
    assignedUserEmail: 'helena.mabunda@moztechwave.co.mz',
    digitalSeal: 'SIVERC-SIG-COORD-2026-PENDING2',
    verificationHash: '',
    auditTrail: [
      {
        id: 'aud-11',
        action: 'solicitacao_criada',
        timestamp: '2026-09-13 18:00',
        actorId: 'prof-01',
        actorName: 'Prof. Dr. Amílcar Silveira',
        actorRole: 'PROFESSOR',
        details: 'Aguardando parecer da Coordenadora Pedagógica.'
      }
    ]
  },

  // 4. Declaração de Frequência - Assinada pelo Diretor e Coordenador
  {
    id: 'sig-008',
    institutionId: 'inst-01',
    role: 'Diretor',
    signerName: 'Eng. Paulo Jafim Pereira',
    signerTitle: 'Diretor Geral do Centro',
    signedAt: '2026-09-05 14:00',
    createdAt: '2026-09-05',
    status: 'Assinado',
    document: {
      documentId: 'dec-019',
      documentType: 'Declaração',
      documentNumber: 'DEC-2026-0019',
      title: 'Declaração de Frequência & Matrícula Regular',
      recipientName: 'Jéssica Tembe',
      recipientCode: 'CFTPM-AL-2026-0019',
      courseName: 'Gestão de Recursos Humanos & Legislação Laboral',
      issueDate: '2026-09-05',
      summary: 'Declara para os devidos efeitos legais que a aluna está devidamente matriculada no ano letivo de 2026.'
    },
    allowedRoles: ['DIRETOR', 'SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'director', 'superadmin'],
    signedByUserId: 'user-dir-01',
    signedByUserName: 'Eng. Paulo Jafim Pereira',
    signedByUserEmail: 'jafimpaulo8@gmail.com',
    signedByRole: 'DIRETOR',
    digitalSeal: 'SIVERC-SIG-DIR-2026-99210E',
    verificationHash: 'sha256:3289ab7612093847589201948576203948576101928374659281726354819203',
    stampType: 'oficial',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M10,40 Q40,5 70,35 T130,25 T190,45" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round"/></svg>',
    auditTrail: [
      {
        id: 'aud-12',
        action: 'solicitacao_criada',
        timestamp: '2026-09-05 11:00',
        actorId: 'sec-01',
        actorName: 'Secretaria Acadêmica',
        actorRole: 'SECRETARIA',
        details: 'Declaração solicitada pelo estudante para efeitos de trabalho.'
      },
      {
        id: 'aud-13',
        action: 'assinada',
        timestamp: '2026-09-05 14:00',
        actorId: 'user-dir-01',
        actorName: 'Eng. Paulo Jafim Pereira',
        actorRole: 'DIRETOR',
        details: 'Declaração assinada eletronicamente.'
      }
    ]
  },

  // 5. Estágio Curricular - Outro (Supervisor da Empresa Parceira)
  {
    id: 'sig-009',
    institutionId: 'inst-01',
    role: 'Outro',
    customRoleTitle: 'Supervisor Corporativo de Estágios',
    signerName: 'Dr. Zacarias Langa',
    signerTitle: 'Diretor de Operações Técnicas - Vodacom Moçambique',
    createdAt: '2026-09-07',
    deadlineDate: '2026-09-25',
    status: 'Pendente',
    document: {
      documentId: 'est-003',
      documentType: 'Estágio',
      documentNumber: 'EST-2026-0003',
      title: 'Termo de Compromisso e Plano de Estágio Supervisionado',
      recipientName: 'Mauro Langa',
      recipientCode: 'CFTPM-AL-2026-0031',
      courseName: 'Engenharia de Software & Web Full-Stack',
      issueDate: '2026-09-07',
      summary: 'Plano de estágio prático de 3 meses em desenvolvimento mobile na empresa acolhedora.'
    },
    allowedRoles: ['SUPER_ADMIN', 'ADMIN_INSTITUICAO', 'DIRETOR', 'superadmin', 'director'],
    assignedUserEmail: 'z.langa@empresa-parceira.mz',
    digitalSeal: 'SIVERC-SIG-AUT-2026-PENDING',
    verificationHash: '',
    auditTrail: [
      {
        id: 'aud-14',
        action: 'solicitacao_criada',
        timestamp: '2026-09-07 10:00',
        actorId: 'sec-01',
        actorName: 'Secretaria Acadêmica',
        actorRole: 'SECRETARIA',
        details: 'Convite de assinatura enviado ao supervisor corporativo externo.'
      }
    ]
  }
];
