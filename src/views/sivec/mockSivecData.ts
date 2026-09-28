import { SivecRegistryEntry, SivecCoreMetrics, SivecConnectWebhook, SivecApiKey, SivecPassData } from './types';

export const SIVEC_LEGAL_MANDATE = {
  standardFormula: "Certificado emitido pela instituição e registado/verificável através do SIVEC.",
  anepDisclaimer: "O SIVEC (Sistema Integrado de Verificação e Emissão de Credenciais) constitui uma camada institucional de integridade criptográfica e confiança digital. O SIVEC não substitui a ANEP (Autoridade Nacional de Educação Profissional). É estritamente vedado escrever 'certificado reconhecido pela ANEP' sem prova documental auditada de autorização/acreditação ministerial."
};

export const INITIAL_SIVEC_METRICS: SivecCoreMetrics = {
  totalRegistered: 1248,
  activeValid: 1239,
  revokedCount: 7,
  totalVerificationsToday: 84,
  blockchainLedgerBlocks: 4120,
  keyStatus: 'operacional',
  keyFingerprint: 'SHA256:7e:9a:4f:88:21:bc:33:d1:ef:aa:50:41:99:32:ee:f7:b1',
  cryptoAlgorithm: 'Ed25519 + SHA-256 / RFC-3161 TSA',
  tsaProvider: 'SIVEC National Digital Time-Stamp Authority (Mozambique Standard UTC+2)'
};

export const INITIAL_SIVEC_REGISTRY: SivecRegistryEntry[] = [
  {
    id: 'sivec-reg-001',
    uniqueCertificateId: 'MZ-SIVEC-CERT-2026-008819-A1',
    sivecCode: 'SIVEC-MZ-2026-8819',
    certificateNumber: 'CERT-2026-008819',
    certificateTitle: 'Certificado de Habilitação & Competência Profissional',
    credentialType: 'certificado',
    academicLevel: 'Nível 5 - Especialização Tecnológica Avançada',
    studentName: 'BENEDITO AUGUSTO COSSA',
    studentDocument: 'BI nº 110293817290A',
    studentId: 'AL-2026-1042',
    studentEmail: 'benedito.cossa@aluno.co.mz',
    courseName: 'Engenharia de Software & Desenvolvimento Web Full-Stack',
    durationHours: 1200,
    finalGrade: '18 Valores (Distinção e Louvor)',
    issueDate: '15/08/2026',
    completionDate: '30/07/2026',
    timestampUtc: '2026-08-15T10:30:00.000Z',
    bookNumber: 'L-04/TEC',
    sheetNumber: 'Fl. 88',
    entryNumber: 'Assento nº 1042',
    status: 'ATIVO',
    sha256Hash: 'a8f5c490e12d3b7890a5f6e872c91a04b32198cd65fe123456789abcdef01234',
    digitalSignature: 'ED25519-SIG:9f40a1b2c3d4e5f6...7890abcdef',
    institutionName: 'Instituto Politécnico de Tecnologias Avançadas Moztechwave',
    institutionNuit: '400192837',
    institutionCode: 'IPTA-MZ-0042',
    institutionCampus: 'Campus Central Politécnico - Maputo',
    issuerName: 'Dr. Armando Macuácua',
    issuerRole: 'Secretário-Geral Notarial & Registo Académico',
    issuerDepartment: 'Secretaria-Geral Notarial SIVEC',
    signatoryDirector: 'Eng. Paulo Jafim (Diretor Geral)',
    pedagogicOfficer: 'Dra. Amina Abdul (Diretora Pedagógica)',
    signatures: [
      {
        id: 'sig-001-dir',
        signerName: 'Eng. Paulo Jafim',
        signerRole: 'Diretor Geral do Instituto',
        signatureDate: '15/08/2026 10:30',
        algorithm: 'Ed25519 (Curva Elíptica Edwards 25519)',
        signatureHex: '9f40a1b2c3d4e5f67a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
        isValid: true,
        publicFingerprint: 'SHA256:7e:9a:4f:88:21:bc:33:d1:ef:aa:50:41:99:32:ee:f7:b1'
      },
      {
        id: 'sig-001-ped',
        signerName: 'Dra. Amina Abdul',
        signerRole: 'Diretora Pedagógica & Homologação Curricular',
        signatureDate: '15/08/2026 10:35',
        algorithm: 'Ed25519 (Curva Elíptica Edwards 25519)',
        signatureHex: '1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f9f40a1b2c3d4e5f67a8b9c0d',
        isValid: true,
        publicFingerprint: 'SHA256:4b:21:ee:99:50:aa:ef:d1:33:bc:21:88:4f:9a:7e:f7:11'
      },
      {
        id: 'sig-001-sec',
        signerName: 'Dr. Armando Macuácua',
        signerRole: 'Oficial Notarial & Certificador Digital SIVEC',
        signatureDate: '15/08/2026 10:40',
        algorithm: 'RFC 3161 TSA Time-Stamp Authority',
        signatureHex: '5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1e2f3a4b9f40a1b2c3d4e5f67a8b9c0d',
        isValid: true,
        publicFingerprint: 'SHA256:11:77:88:99:aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66'
      }
    ],
    history: [
      {
        id: 'hist-001-1',
        timestamp: '15/08/2026 09:15',
        action: 'Emissão & Lavratura Notarial',
        actor: 'Dr. Armando Macuácua',
        actorRole: 'Secretário-Geral Notarial',
        newState: 'ATIVO',
        justification: 'Conclusão regular de formação com nota 18 e cumprimento integral de 1200 horas letivas.',
        transactionHash: 'tx-008819-block-4118'
      },
      {
        id: 'hist-001-2',
        timestamp: '15/08/2026 10:30',
        action: 'Assinatura Digital Ed25519 Tripla Homologada',
        actor: 'Eng. Paulo Jafim & Dra. Amina Abdul',
        actorRole: 'Direção Geral e Pedagógica',
        previousState: 'ATIVO',
        newState: 'ATIVO',
        justification: 'Aposição das chaves criptográficas institucionais de alta soberania e carimbo TSA.',
        transactionHash: 'tx-008819-block-4119'
      },
      {
        id: 'hist-001-3',
        timestamp: '17/09/2026 14:22',
        action: 'Verificação Pública Bem-Sucedida',
        actor: 'Portal Público / Recrutador Externo',
        actorRole: 'Empresa Parceira de TI',
        previousState: 'ATIVO',
        newState: 'ATIVO',
        justification: 'Consulta pública de autenticidade documental via SIVEC VERIFY e QR Code.',
        transactionHash: 'tx-verify-008819-42'
      }
    ],
    verificationCount: 42,
    lastVerifiedAt: '2026-09-17 14:22',
    accreditation: {
      hasAnepAccreditation: false,
      legalDisclaimer: SIVEC_LEGAL_MANDATE.standardFormula
    }
  },
  {
    id: 'sivec-reg-002',
    uniqueCertificateId: 'MZ-SIVEC-CERT-2026-007492-B2',
    sivecCode: 'SIVEC-MZ-2026-7492',
    certificateNumber: 'CERT-2026-007492',
    certificateTitle: 'Certificado de Especialização em Cibersegurança',
    credentialType: 'certificado',
    academicLevel: 'Nível 5 - Especialização Tecnológica',
    studentName: 'FILOMENA ERNESTO MACAMO',
    studentDocument: 'BI nº 100182937402F',
    studentId: 'AL-2026-1043',
    studentEmail: 'filomena.macamo@aluno.co.mz',
    courseName: 'Cibersegurança, Infraestrutura Cisco & Auditoria de Sistemas',
    durationHours: 800,
    finalGrade: '17 Valores (Muito Bom)',
    issueDate: '02/07/2026',
    completionDate: '25/06/2026',
    timestampUtc: '2026-07-02T14:15:00.000Z',
    bookNumber: 'L-04/TEC',
    sheetNumber: 'Fl. 45',
    entryNumber: 'Assento nº 1043',
    status: 'ATIVO',
    sha256Hash: 'b4c798a0e234df109786a543bc9812ef0123456789abcdef0123456789abcde0',
    digitalSignature: 'ED25519-SIG:7a8b9c0d1e2f3a4b...5c6d7e8f9a0b',
    institutionName: 'Instituto Politécnico de Tecnologias Avançadas Moztechwave',
    institutionNuit: '400192837',
    institutionCode: 'IPTA-MZ-0042',
    institutionCampus: 'Campus Central Politécnico - Maputo',
    issuerName: 'Dr. Armando Macuácua',
    issuerRole: 'Secretário-Geral Notarial',
    issuerDepartment: 'Secretaria-Geral Notarial SIVEC',
    signatoryDirector: 'Eng. Paulo Jafim (Diretor Geral)',
    pedagogicOfficer: 'Dra. Amina Abdul (Diretora Pedagógica)',
    signatures: [
      {
        id: 'sig-002-dir',
        signerName: 'Eng. Paulo Jafim',
        signerRole: 'Diretor Geral',
        signatureDate: '02/07/2026 14:15',
        algorithm: 'Ed25519',
        signatureHex: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1e2f3a4b5c6d7e8f',
        isValid: true,
        publicFingerprint: 'SHA256:7e:9a:4f:88:21:bc:33:d1:ef:aa:50:41:99:32:ee:f7:b1'
      }
    ],
    history: [
      {
        id: 'hist-002-1',
        timestamp: '02/07/2026 14:15',
        action: 'Emissão Inicial Notarial',
        actor: 'Dr. Armando Macuácua',
        actorRole: 'Secretário-Geral Notarial',
        newState: 'ATIVO',
        justification: 'Emissão homologada e lavrada no Livro Notarial L-04/TEC folha 45 assento 1043.',
        transactionHash: 'tx-007492-block-4080'
      }
    ],
    verificationCount: 19,
    lastVerifiedAt: '2026-09-16 09:10',
    accreditation: {
      hasAnepAccreditation: false,
      legalDisclaimer: SIVEC_LEGAL_MANDATE.standardFormula
    }
  },
  {
    id: 'sivec-reg-003',
    uniqueCertificateId: 'MZ-SIVEC-DIPL-2026-009104-C3',
    sivecCode: 'SIVEC-MZ-2026-9104',
    certificateNumber: 'DIPL-2026-009104',
    certificateTitle: 'Diploma Técnico de Honra & Mérito Notarial',
    credentialType: 'diploma',
    academicLevel: 'Nível 5 - Gestão Tributária & Sistemas ERP',
    studentName: 'ALICE FRANCISCO NHAMPULE',
    studentDocument: 'BI nº 110928374619B',
    studentId: 'AL-2026-1044',
    studentEmail: 'alice.nhampule@aluno.co.mz',
    courseName: 'Contabilidade Informatizada & Gestão Tributária Primavera',
    durationHours: 600,
    finalGrade: '19 Valores (Distinção de Mérito)',
    issueDate: '28/06/2026',
    completionDate: '20/06/2026',
    timestampUtc: '2026-06-28T11:00:00.000Z',
    bookNumber: 'L-03/ECO',
    sheetNumber: 'Fl. 12',
    entryNumber: 'Assento nº 0819',
    status: 'CORRIGIDO',
    correctionReason: 'Retificação notarial da grafia do apelido de família mediante apresentação de Certidão de Nascimento e BI atualizado emitido pela Direção Nacional de Identificação Civil.',
    correctionDate: '10/07/2026',
    correctedBy: 'Comissão Notarial de Registos & Secretaria Geral',
    sha256Hash: 'c90123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd',
    digitalSignature: 'ED25519-SIG:3c4d5e6f7a8b9c0d...1e2f3a4b5c6d',
    institutionName: 'Instituto Politécnico de Tecnologias Avançadas Moztechwave',
    institutionNuit: '400192837',
    institutionCode: 'IPTA-MZ-0042',
    institutionCampus: 'Campus Central Politécnico - Maputo',
    issuerName: 'Dr. Armando Macuácua',
    issuerRole: 'Secretário-Geral Notarial',
    issuerDepartment: 'Secretaria-Geral Notarial SIVEC',
    signatoryDirector: 'Eng. Paulo Jafim (Diretor Geral)',
    pedagogicOfficer: 'Dra. Amina Abdul (Diretora Pedagógica)',
    signatures: [
      {
        id: 'sig-003-dir',
        signerName: 'Eng. Paulo Jafim',
        signerRole: 'Diretor Geral',
        signatureDate: '28/06/2026 11:00',
        algorithm: 'Ed25519',
        signatureHex: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
        isValid: true,
        publicFingerprint: 'SHA256:7e:9a:4f:88:21:bc:33:d1:ef:aa:50:41:99:32:ee:f7:b1'
      }
    ],
    history: [
      {
        id: 'hist-003-1',
        timestamp: '28/06/2026 11:00',
        action: 'Emissão Original do Diploma',
        actor: 'Dr. Armando Macuácua',
        actorRole: 'Secretário-Geral Notarial',
        newState: 'ATIVO',
        justification: 'Emissão original com distinção de mérito 19 valores.',
        transactionHash: 'tx-009104-block-4050'
      },
      {
        id: 'hist-003-2',
        timestamp: '10/07/2026 15:30',
        action: 'Apostilha & Retificação Notarial',
        actor: 'Dra. Amina Abdul',
        actorRole: 'Diretora Pedagógica',
        previousState: 'ATIVO',
        newState: 'CORRIGIDO',
        justification: 'Aprovada correção do apelido familiar por averbamento no livro notarial sem alteração da carga horária ou classificação obtida.',
        transactionHash: 'tx-corr-009104-block-4091'
      }
    ],
    verificationCount: 31,
    lastVerifiedAt: '2026-09-15 17:40',
    accreditation: {
      hasAnepAccreditation: false,
      legalDisclaimer: SIVEC_LEGAL_MANDATE.standardFormula
    }
  },
  {
    id: 'sivec-reg-004',
    uniqueCertificateId: 'MZ-SIVEC-CERT-2026-003391-R1',
    sivecCode: 'SIVEC-MZ-2026-3391',
    certificateNumber: 'CERT-2026-003391',
    certificateTitle: 'Certificado Profissional de Inteligência Artificial',
    credentialType: 'certificado',
    academicLevel: 'Nível 4 - Qualificação Técnica',
    studentName: 'MANUEL CARLOS SITOE',
    studentDocument: 'BI nº 080293817201M',
    studentId: 'AL-2026-0912',
    studentEmail: 'manuel.sitoe.old@temp.mz',
    courseName: 'Inteligência Artificial Aplicada & Engenharia de Prompts',
    durationHours: 400,
    finalGrade: '15 Valores (Bom)',
    issueDate: '10/05/2026',
    completionDate: '01/05/2026',
    timestampUtc: '2026-05-10T09:00:00.000Z',
    bookNumber: 'L-04/TEC',
    sheetNumber: 'Fl. 08',
    entryNumber: 'Assento nº 0912',
    status: 'REVOGADO',
    revocationReason: 'Detetada divergência documental grave na verificação do Bilhete de Identidade apresentado no ato de matrícula. Processo disciplinar pedagógico nº 04/2026.',
    revocationDate: '20/07/2026',
    revokedBy: 'Comissão de Ética & Secretaria Geral',
    sha256Hash: 'd7890abcdef0123456789abcdef0123456789abcdef0123456789abcdef012345',
    digitalSignature: 'ED25519-REVOKED:000000000000000000000000',
    institutionName: 'Instituto Politécnico de Tecnologias Avançadas Moztechwave',
    institutionNuit: '400192837',
    institutionCode: 'IPTA-MZ-0042',
    institutionCampus: 'Campus Central Politécnico - Maputo',
    issuerName: 'Dr. Armando Macuácua',
    issuerRole: 'Secretário-Geral Notarial',
    issuerDepartment: 'Secretaria-Geral Notarial SIVEC',
    signatoryDirector: 'Eng. Paulo Jafim (Diretor Geral)',
    pedagogicOfficer: 'Dra. Amina Abdul (Diretora Pedagógica)',
    signatures: [
      {
        id: 'sig-004-rev',
        signerName: 'Comissão Notarial e Disciplinar SIVEC',
        signerRole: 'Autoridade Disciplinar Notarial',
        signatureDate: '20/07/2026 11:30',
        algorithm: 'Ed25519-Revocation-Marker',
        signatureHex: 'd7890abcdef0123456789abcdef0123456789abcdef0123456789abcdef012345',
        isValid: false,
        publicFingerprint: 'SHA256:00:00:00:00:REVOKED:LEDGER:ENTRY'
      }
    ],
    history: [
      {
        id: 'hist-004-1',
        timestamp: '10/05/2026 09:00',
        action: 'Emissão Inicial',
        actor: 'Dr. Armando Macuácua',
        actorRole: 'Secretário-Geral Notarial',
        newState: 'ATIVO',
        justification: 'Emissão original do certificado.',
        transactionHash: 'tx-003391-block-3980'
      },
      {
        id: 'hist-004-2',
        timestamp: '20/07/2026 11:30',
        action: 'Revogação Notarial & Anulação de Validade',
        actor: 'Comissão de Ética & Secretaria Geral',
        actorRole: 'Comissão Disciplinar',
        previousState: 'ATIVO',
        newState: 'REVOGADO',
        justification: 'Revogação formal de validade jurídica por fraude cadastral de identificação civil.',
        transactionHash: 'tx-rev-003391-block-4102'
      }
    ],
    verificationCount: 8,
    lastVerifiedAt: '2026-08-01 16:12',
    accreditation: {
      hasAnepAccreditation: false,
      legalDisclaimer: SIVEC_LEGAL_MANDATE.standardFormula
    }
  },
  {
    id: 'sivec-reg-005',
    uniqueCertificateId: 'MZ-SIVEC-MICR-2024-001182-E1',
    sivecCode: 'SIVEC-MZ-2024-1182',
    certificateNumber: 'MICR-2024-001182',
    certificateTitle: 'Microcredencial Tecnológica Bienal em Segurança Ofensiva',
    credentialType: 'microcredencial',
    academicLevel: 'Microcredencial com Revalidação Bienal',
    studentName: 'LUCAS AMÉRICO MONDLANE',
    studentDocument: 'BI nº 110948372610L',
    studentId: 'AL-2024-0518',
    studentEmail: 'lucas.mondlane@aluno.co.mz',
    courseName: 'Segurança Ofensiva & Pentest Avançado Red Team',
    durationHours: 240,
    finalGrade: '16 Valores (Bom com Distinção)',
    issueDate: '10/01/2024',
    completionDate: '05/01/2024',
    expiryDate: '10/01/2026',
    timestampUtc: '2024-01-10T10:00:00.000Z',
    bookNumber: 'L-01/SEC',
    sheetNumber: 'Fl. 22',
    entryNumber: 'Assento nº 0118',
    status: 'EXPIRADO',
    sha256Hash: 'f0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef1',
    digitalSignature: 'ED25519-SIG:9a8b7c6d5e4f3a2b...1c0d9e8f7a6b',
    institutionName: 'Instituto Politécnico de Tecnologias Avançadas Moztechwave',
    institutionNuit: '400192837',
    institutionCode: 'IPTA-MZ-0042',
    institutionCampus: 'Campus Central Politécnico - Maputo',
    issuerName: 'Dr. Armando Macuácua',
    issuerRole: 'Secretário-Geral Notarial',
    issuerDepartment: 'Secretaria-Geral Notarial SIVEC',
    signatoryDirector: 'Eng. Paulo Jafim (Diretor Geral)',
    pedagogicOfficer: 'Dra. Amina Abdul (Diretora Pedagógica)',
    signatures: [
      {
        id: 'sig-005-dir',
        signerName: 'Eng. Paulo Jafim',
        signerRole: 'Diretor Geral',
        signatureDate: '10/01/2024 10:00',
        algorithm: 'Ed25519',
        signatureHex: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
        isValid: true,
        publicFingerprint: 'SHA256:7e:9a:4f:88:21:bc:33:d1:ef:aa:50:41:99:32:ee:f7:b1'
      }
    ],
    history: [
      {
        id: 'hist-005-1',
        timestamp: '10/01/2024 10:00',
        action: 'Emissão de Microcredencial Temporária (Validade 24 Meses)',
        actor: 'Dr. Armando Macuácua',
        actorRole: 'Secretário-Geral Notarial',
        newState: 'ATIVO',
        justification: 'Emissão de certificação rápida técnica sujeita a revalidação técnica bianual.',
        transactionHash: 'tx-001182-block-2890'
      },
      {
        id: 'hist-005-2',
        timestamp: '10/01/2026 00:00',
        action: 'Expiração de Vigência Cronológica',
        actor: 'Motor de Integridade SIVEC TSA',
        actorRole: 'Sistema Automatizado de Auditoria',
        previousState: 'ATIVO',
        newState: 'EXPIRADO',
        justification: 'Decurso do prazo regulamentar de 24 meses sem registo de revalidação técnica pelo titular.',
        transactionHash: 'tx-exp-001182-block-3999'
      }
    ],
    verificationCount: 14,
    lastVerifiedAt: '2026-01-05 08:30',
    accreditation: {
      hasAnepAccreditation: false,
      legalDisclaimer: SIVEC_LEGAL_MANDATE.standardFormula
    }
  },
  {
    id: 'sivec-reg-006',
    uniqueCertificateId: 'MZ-SIVEC-DECL-2026-006640-X1',
    sivecCode: 'SIVEC-MZ-2026-6640',
    certificateNumber: 'DECL-2026-006640',
    certificateTitle: 'Declaração com Notas de Aproveitamento Letivo',
    credentialType: 'declaracao_notas',
    academicLevel: 'Nível 4 - Qualificação Profissional',
    studentName: 'ZACARIAS NELSON TEMBE',
    studentDocument: 'BI nº 100293847561Z',
    studentId: 'AL-2026-0883',
    studentEmail: 'zacarias.tembe@aluno.co.mz',
    courseName: 'Marketing Digital de Alta Conversão & Gestão de Tráfego',
    durationHours: 350,
    finalGrade: '16 Valores',
    issueDate: '01/08/2026',
    completionDate: '28/07/2026',
    timestampUtc: '2026-08-01T08:00:00.000Z',
    bookNumber: 'L-02/MKT',
    sheetNumber: 'Fl. 41',
    entryNumber: 'Assento nº 0664',
    status: 'CANCELADO',
    cancellationReason: 'Anulação administrativa do documento por duplicidade de emissão no mesmo período letivo. O estudante solicitou emissão de Diploma formal definitivo.',
    cancellationDate: '25/08/2026',
    cancelledBy: 'Secretaria-Geral & Registo Académico',
    sha256Hash: 'a1b2c3d4e5f67890abcdef0123456789abcdef0123456789abcdef0123456789',
    digitalSignature: 'ED25519-CANCELLED:000000000000000000000000',
    institutionName: 'Instituto Politécnico de Tecnologias Avançadas Moztechwave',
    institutionNuit: '400192837',
    institutionCode: 'IPTA-MZ-0042',
    institutionCampus: 'Campus Central Politécnico - Maputo',
    issuerName: 'Dr. Armando Macuácua',
    issuerRole: 'Secretário-Geral Notarial',
    issuerDepartment: 'Secretaria-Geral Notarial SIVEC',
    signatoryDirector: 'Eng. Paulo Jafim (Diretor Geral)',
    pedagogicOfficer: 'Dra. Amina Abdul (Diretora Pedagógica)',
    signatures: [
      {
        id: 'sig-006-dir',
        signerName: 'Dr. Armando Macuácua',
        signerRole: 'Secretário-Geral Notarial',
        signatureDate: '01/08/2026 08:00',
        algorithm: 'Ed25519',
        signatureHex: 'a1b2c3d4e5f67890abcdef0123456789abcdef0123456789abcdef0123456789',
        isValid: false,
        publicFingerprint: 'SHA256:CANCELLED:DOCUMENT:LEDGER:NULL'
      }
    ],
    history: [
      {
        id: 'hist-006-1',
        timestamp: '01/08/2026 08:00',
        action: 'Emissão de Declaração Provisória',
        actor: 'Dr. Armando Macuácua',
        actorRole: 'Secretário-Geral Notarial',
        newState: 'ATIVO',
        justification: 'Emissão a pedido do aluno para fins de estágio.',
        transactionHash: 'tx-006640-block-4100'
      },
      {
        id: 'hist-006-2',
        timestamp: '25/08/2026 14:00',
        action: 'Cancelamento Administrativo por Substituição',
        actor: 'Dra. Amina Abdul',
        actorRole: 'Diretora Pedagógica',
        previousState: 'ATIVO',
        newState: 'CANCELADO',
        justification: 'Cancelamento notarial deste registo provisório devido à outorga e registo do Diploma definitivo em livro solene.',
        transactionHash: 'tx-cancel-006640-block-4125'
      }
    ],
    verificationCount: 2,
    lastVerifiedAt: '2026-08-10 12:00',
    accreditation: {
      hasAnepAccreditation: false,
      legalDisclaimer: SIVEC_LEGAL_MANDATE.standardFormula
    }
  }
];

export const INITIAL_SIVEC_PASSES: SivecPassData[] = [
  {
    passId: 'pass-sivec-001',
    sivecCode: 'SIVEC-MZ-2026-8819',
    studentName: 'Benedito Augusto Cossa',
    studentNumber: 'AL-2026-1042',
    courseName: 'Engenharia de Software & Full-Stack',
    academicLevel: 'Especialização Profissional Tecnológica',
    issueDate: '15/08/2026',
    validUntil: '15/08/2028',
    dynamicPin: '8819',
    offlineSignatureToken: 'SIG_OFFLINE_ED25519_BENEDITO_SIVEC_2026',
    qrPayloadUrl: 'https://sivec.moztechwave.co.mz/verify?code=SIVEC-MZ-2026-8819',
    status: 'valido'
  },
  {
    passId: 'pass-sivec-002',
    sivecCode: 'SIVEC-MZ-2026-7492',
    studentName: 'Filomena Ernesto Macamo',
    studentNumber: 'AL-2026-1043',
    courseName: 'Cibersegurança & Infraestrutura Cisco',
    academicLevel: 'Certificação Avançada de Redes',
    issueDate: '02/07/2026',
    validUntil: '02/07/2028',
    dynamicPin: '7492',
    offlineSignatureToken: 'SIG_OFFLINE_ED25519_FILOMENA_SIVEC_2026',
    qrPayloadUrl: 'https://sivec.moztechwave.co.mz/verify?code=SIVEC-MZ-2026-7492',
    status: 'valido'
  }
];

export const INITIAL_CONNECT_WEBHOOKS: SivecConnectWebhook[] = [
  {
    id: 'hook-1',
    systemName: 'SoftGenial ERP Central',
    systemType: 'SoftGenial',
    endpointUrl: 'https://erp.softgenial.co.mz/api/v2/sivec-listener',
    authHeaderPrefix: 'Bearer SG-SEC-99120',
    eventsSubscribed: ['credential.issued', 'credential.revoked'],
    status: 'ativo',
    lastPingMs: 18,
    totalDelivered: 1240
  },
  {
    id: 'hook-2',
    systemName: 'SIGAR Cloud Moçambique',
    systemType: 'SIGAR',
    endpointUrl: 'https://sigar.moztechwave.co.mz/webhook/sivec-sync',
    authHeaderPrefix: 'Bearer SIGAR-PROD-7712',
    eventsSubscribed: ['credential.issued', 'credential.revoked', 'credential.verified'],
    status: 'ativo',
    lastPingMs: 24,
    totalDelivered: 3105
  },
  {
    id: 'hook-3',
    systemName: 'Portal Nacional do Empregador (Recrutamento MZ)',
    systemType: 'Empregador',
    endpointUrl: 'https://empregos.co.mz/integrations/sivec/auto-verify',
    authHeaderPrefix: 'Bearer EMP-MZ-2026-KEY',
    eventsSubscribed: ['credential.verified'],
    status: 'ativo',
    lastPingMs: 42,
    totalDelivered: 890
  }
];

export const INITIAL_SIVEC_API_KEYS: SivecApiKey[] = [
  {
    id: 'key-1',
    name: 'SoftGenial Production Bridge',
    systemType: 'SoftGenial',
    environment: 'production',
    tokenPrefix: 'sivec_live_99a8...3b1e',
    createdAt: '2026-01-15',
    scopes: ['verify:read', 'registry:read', 'registry:write', 'certificates:register', 'certificates:verify', 'certificates:status'],
    rateLimitPerMinute: 600,
    lastUsedAt: 'Hoje 14:10',
    status: 'ativa'
  },
  {
    id: 'key-2',
    name: 'Portal Público Validador Widget',
    systemType: 'SIGAR',
    environment: 'production',
    tokenPrefix: 'sivec_pub_44f1...99cb',
    createdAt: '2026-02-01',
    scopes: ['verify:read', 'certificates:verify', 'certificates:status'],
    rateLimitPerMinute: 300,
    lastUsedAt: 'Hoje 14:22',
    status: 'ativa'
  },
  {
    id: 'key-3',
    name: 'Admin Audit Terminal & Revoke Agent',
    systemType: 'ERP_Primavera',
    environment: 'production',
    tokenPrefix: 'sivec_admin_12ee...fa88',
    createdAt: '2026-03-10',
    scopes: ['verify:read', 'registry:read', 'registry:write', 'revoke:admin', 'certificates:validate_hash'],
    rateLimitPerMinute: 120,
    lastUsedAt: 'Ontem 18:30',
    status: 'ativa'
  }
];
