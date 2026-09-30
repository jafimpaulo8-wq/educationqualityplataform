/**
 * Centro Infantil Céu Azul — Dados Oficiais & Credenciais
 * Delegação de Nacala-Porto, Nampula, Moçambique
 * Projeto Firebase: siverc-94da3
 */

import { Institution, Student, UserProfile } from '../types';

export const CEU_AZUL_INSTITUTION_ID = 'ceu-azul-nacala';

export const CEU_AZUL_INSTITUTION: Institution & {
  nome: string;
  nomeCompleto: string;
  tipo: string;
  local: string;
  telefone1: string;
  telefone2: string;
  mpesa: string;
  emola: string;
  estado: string;
  institutionId: string;
  createdBy: string;
} = {
  id: CEU_AZUL_INSTITUTION_ID,
  institutionId: CEU_AZUL_INSTITUTION_ID,
  code: 'CEU-AZUL-001',
  accessCode: 'CEU-AZUL-001',
  nome: 'Centro Infantil Céu Azul',
  name: 'Centro Infantil Céu Azul',
  nomeCompleto: 'Centro Infantil Céu Azul — Delegação de Nacala-Porto',
  tipo: 'Centro de Educação Infantil',
  type: 'centro_infantil',
  nuit: '402029013',
  licenseNumber: 'ALV-CEU-2026/0402',
  local: 'Nacala-Porto, Nampula, Moçambique',
  city: 'Nacala-Porto',
  province: 'Nampula',
  address: 'Nacala-Porto, Nampula, Moçambique',
  email: 'moztechwavenacala8@gmail.com',
  phone: '853 181 189',
  telefone1: '853 181 189',
  telefone2: '864 826 647',
  mpesa: '853 181 189',
  emola: '864 826 647',
  estado: 'activo',
  status: 'Ativa',
  connectedSystem: 'SIGAR',
  sivecEnabled: true,
  createdBy: 'jafimpaulo8@gmail.com',
  representativeName: 'Jafim Paulo Rupia',
  representativeRole: 'Diretor',
  directorName: 'Jafim Paulo Rupia',
  plan: 'Profissional',
  createdAt: '2026-01-01',
  totalStudents: 22,
  totalTeachers: 4,
  totalCourses: 2,
  branches: [
    {
      id: 'branch-ceu-azul-main',
      institutionId: CEU_AZUL_INSTITUTION_ID,
      name: 'Delegação de Nacala-Porto (Sede)',
      code: 'CEU-NAC',
      phone: '853 181 189',
      email: 'moztechwavenacala8@gmail.com',
      address: 'Nacala-Porto, Nampula, Moçambique',
      city: 'Nacala-Porto',
      province: 'Nampula',
      directorName: 'Jafim Paulo Rupia',
      isMainBranch: true,
      status: 'active',
      createdAt: '2026-01-01'
    }
  ],
  financialSettings: {
    fineAmount: 50,
    interestRateDaily: 0.5,
    bankInfo: 'M-Pesa: 853 181 189 | e-Mola: 864 826 647',
    pixKey: '853181189',
    dueDay: 10,
    mpesaNumber: '853 181 189',
    emolaNumber: '864 826 647'
  }
};

export const CEU_AZUL_DIRECTOR: UserProfile & {
  codigoAcesso: string;
  institutionIds: string[];
  roles: string[];
  status: string;
} = {
  id: 'usr-jafim-dir-001',
  email: 'jafimpaulo8@gmail.com',
  name: 'Jafim Paulo Rupia',
  role: 'DIRETOR',
  roles: ['DIRETOR'],
  institutionId: CEU_AZUL_INSTITUTION_ID,
  institutionIds: [CEU_AZUL_INSTITUTION_ID],
  status: 'aprovado',
  codigoAcesso: 'CEU-AZUL-DIR-001',
  preferences: {
    onboardingCompleted: true,
    theme: 'claro'
  }
};

export const CEU_AZUL_CEO = {
  id: 'usr-alfredo-ceo-001',
  name: 'Alfredo Andrade',
  email: 'andradaalfred02308@gmail.com',
  role: 'CEO',
  roles: ['CEO'],
  institutionId: CEU_AZUL_INSTITUTION_ID,
  institutionIds: [CEU_AZUL_INSTITUTION_ID],
  ownedInstitutions: [CEU_AZUL_INSTITUTION_ID],
  status: 'aprovado',
  codigoAcesso: 'CEU-AZUL-CEO-001'
};

export interface CeuAzulStudentRaw {
  numLista: number;
  numAluno: string;
  nome: string;
  dataNascimento: string;
  lugarNascimento: string;
  contactos: string[];
  codigoAcesso: string;
}

export const CEU_AZUL_STUDENTS_RAW: CeuAzulStudentRaw[] = [
  {
    numLista: 41,
    numAluno: 'CEU-2026-0041',
    nome: 'Hilton Contavida',
    dataNascimento: '21/10/21',
    lugarNascimento: 'Nacala Porto',
    contactos: ['865009505', '844432254'],
    codigoAcesso: 'CEU-AZUL-ALUNO-041'
  },
  {
    numLista: 42,
    numAluno: 'CEU-2026-0042',
    nome: 'Anheley Dino Daniel',
    dataNascimento: '22/11/22',
    lugarNascimento: 'Nacala Porto',
    contactos: ['845009536', '867593500'],
    codigoAcesso: 'CEU-AZUL-ALUNO-042'
  },
  {
    numLista: 43,
    numAluno: 'CEU-2026-0043',
    nome: "Cristina O'Valelo",
    dataNascimento: '16/02/22',
    lugarNascimento: 'Nacala Porto',
    contactos: ['877420616'],
    codigoAcesso: 'CEU-AZUL-ALUNO-043'
  },
  {
    numLista: 44,
    numAluno: 'CEU-2026-0044',
    nome: 'Delfin Higa Yaluba',
    dataNascimento: '01/10/21',
    lugarNascimento: 'Nacala Porto',
    contactos: ['861388162', '867633394'],
    codigoAcesso: 'CEU-AZUL-ALUNO-044'
  },
  {
    numLista: 45,
    numAluno: 'CEU-2026-0045',
    nome: 'Elenson Lino Joaquim',
    dataNascimento: 'não fornecida',
    lugarNascimento: 'não fornecido',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-045'
  },
  {
    numLista: 46,
    numAluno: 'CEU-2026-0046',
    nome: 'Luisha Moziulpo',
    dataNascimento: 'não fornecida',
    lugarNascimento: 'não fornecido',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-046'
  },
  {
    numLista: 47,
    numAluno: 'CEU-2026-0047',
    nome: 'Fanio Lacupo Hiyuba',
    dataNascimento: 'não fornecida',
    lugarNascimento: 'não fornecido',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-047'
  },
  {
    numLista: 48,
    numAluno: 'CEU-2026-0048',
    nome: 'Gesleijne',
    dataNascimento: 'não fornecida',
    lugarNascimento: 'não fornecido',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-048'
  },
  {
    numLista: 49,
    numAluno: 'CEU-2026-0049',
    nome: 'Inneira Japein',
    dataNascimento: '19/02/22',
    lugarNascimento: 'Nacala Porto',
    contactos: ['878355280', '852785149'],
    codigoAcesso: 'CEU-AZUL-ALUNO-049'
  },
  {
    numLista: 50,
    numAluno: 'CEU-2026-0050',
    nome: 'Jackson Sopahi',
    dataNascimento: '07/06/22',
    lugarNascimento: 'Nacala Porto',
    contactos: ['834205761', '834559283'],
    codigoAcesso: 'CEU-AZUL-ALUNO-050'
  },
  {
    numLista: 51,
    numAluno: 'CEU-2026-0051',
    nome: 'Micaela Francisco',
    dataNascimento: '17/02/22',
    lugarNascimento: 'Nacala Porto',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-051'
  },
  {
    numLista: 52,
    numAluno: 'CEU-2026-0052',
    nome: 'Marriano Francisco',
    dataNascimento: 'não fornecida',
    lugarNascimento: 'não fornecido',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-052'
  },
  {
    numLista: 53,
    numAluno: 'CEU-2026-0053',
    nome: 'Marriano Lsiaca M.A',
    dataNascimento: '27/07/22',
    lugarNascimento: 'Nacala Porto',
    contactos: ['870507775', '876317772'],
    codigoAcesso: 'CEU-AZUL-ALUNO-053'
  },
  {
    numLista: 54,
    numAluno: 'CEU-2026-0054',
    nome: 'Matilda Alfredo',
    dataNascimento: '16/07/21',
    lugarNascimento: 'Nacala Porto',
    contactos: ['86097820', '862550446'],
    codigoAcesso: 'CEU-AZUL-ALUNO-054'
  },
  {
    numLista: 55,
    numAluno: 'CEU-2026-0055',
    nome: 'Meimuna Borepacio',
    dataNascimento: '25/10/22',
    lugarNascimento: 'Nacala Porto',
    contactos: ['877743466', '840429736'],
    codigoAcesso: 'CEU-AZUL-ALUNO-055'
  },
  {
    numLista: 56,
    numAluno: 'CEU-2026-0056',
    nome: 'Nezia Yunna',
    dataNascimento: '10/04/23',
    lugarNascimento: 'Nacala Porto',
    contactos: ['877178579', '848481496'],
    codigoAcesso: 'CEU-AZUL-ALUNO-056'
  },
  {
    numLista: 57,
    numAluno: 'CEU-2026-0057',
    nome: 'Oben Manuel Malinho',
    dataNascimento: '21/01/21',
    lugarNascimento: 'não fornecido',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-057'
  },
  {
    numLista: 58,
    numAluno: 'CEU-2026-0058',
    nome: 'Sohebe Insego Aguba',
    dataNascimento: 'não fornecida',
    lugarNascimento: 'não fornecido',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-058'
  },
  {
    numLista: 59,
    numAluno: 'CEU-2026-0059',
    nome: 'Tima Fortunato',
    dataNascimento: '12/02/23',
    lugarNascimento: 'Nacala Porto',
    contactos: ['844444949'],
    codigoAcesso: 'CEU-AZUL-ALUNO-059'
  },
  {
    numLista: 60,
    numAluno: 'CEU-2026-0060',
    nome: 'Uriel Do Rosario',
    dataNascimento: 'não fornecida',
    lugarNascimento: 'não fornecido',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-060'
  },
  {
    numLista: 61,
    numAluno: 'CEU-2026-0061',
    nome: 'Wendy Bernina',
    dataNascimento: '15/05/23',
    lugarNascimento: 'não fornecido',
    contactos: [],
    codigoAcesso: 'CEU-AZUL-ALUNO-061'
  },
  {
    numLista: 62,
    numAluno: 'CEU-2026-0062',
    nome: 'Yula Felix Silva Amine',
    dataNascimento: '27/01/21',
    lugarNascimento: 'Nacala Porto',
    contactos: ['870128149', '850326604'],
    codigoAcesso: 'CEU-AZUL-ALUNO-062'
  }
];

export const CEU_AZUL_STUDENTS: Student[] = CEU_AZUL_STUDENTS_RAW.map(raw => ({
  id: `std-ceu-${String(raw.numLista).padStart(3, '0')}`,
  numLista: raw.numLista,
  numAluno: raw.numAluno,
  code: raw.numAluno,
  codigoAcesso: raw.codigoAcesso,
  codigo: raw.codigoAcesso,
  name: raw.nome,
  fullName: raw.nome,
  birthDate: raw.dataNascimento,
  dataNascimento: raw.dataNascimento,
  lugarNascimento: raw.lugarNascimento,
  documentType: 'BI/Cédula',
  documentNumber: `DOC-NAC-${raw.numAluno}`,
  gender: 'Misto',
  phone: raw.contactos[0] || '853 181 189',
  contactos: raw.contactos,
  email: `${raw.codigoAcesso.toLowerCase()}@ceuazul.ac.mz`,
  province: 'Nampula',
  city: 'Nacala-Porto',
  address: 'Nacala-Porto, Nampula',
  morada: null,
  institutionId: CEU_AZUL_INSTITUTION_ID,
  branchId: 'branch-ceu-azul-main',
  courseId: 'crs-infantil-ceu',
  courseName: 'Educação Pré-Escolar / Infantil',
  classGroupId: 'turma-infantil-ceu-01',
  classGroupName: 'Turma Infantil Céu Azul',
  turma: 'Turma Infantil Céu Azul',
  regime: 'Presencial Diurno',
  role: 'ALUNO',
  roles: ['ALUNO'],
  estado: 'activo',
  status: 'Ativo',
  enrollmentDate: '2026-01-15',
  paymentStatus: 'Regularizado',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}));

/**
 * Access Code Directory for fast in-app resolution and validation
 */
export interface AccessCodeEntry {
  code: string;
  role: 'DIRETOR' | 'CEO' | 'ALUNO' | 'INSTITUICAO';
  name: string;
  email: string;
  institutionId: string;
  institutionName: string;
  branchId: string;
  studentId?: string;
  studentData?: Student;
  status: 'ativo' | 'activo';
  description: string;
}

export const CEU_AZUL_ACCESS_CODES: Record<string, AccessCodeEntry> = {
  'CEU-AZUL-001': {
    code: 'CEU-AZUL-001',
    role: 'INSTITUICAO',
    name: 'Centro Infantil Céu Azul (Código Institucional)',
    email: 'moztechwavenacala8@gmail.com',
    institutionId: CEU_AZUL_INSTITUTION_ID,
    institutionName: 'Centro Infantil Céu Azul',
    branchId: 'branch-ceu-azul-main',
    status: 'ativo',
    description: 'Código Institucional do Centro Infantil Céu Azul — Delegação de Nacala-Porto'
  },
  'CEU-AZUL-DIR-001': {
    code: 'CEU-AZUL-DIR-001',
    role: 'DIRETOR',
    name: 'Jafim Paulo Rupia',
    email: 'jafimpaulo8@gmail.com',
    institutionId: CEU_AZUL_INSTITUTION_ID,
    institutionName: 'Centro Infantil Céu Azul',
    branchId: 'branch-ceu-azul-main',
    status: 'ativo',
    description: 'Acesso Institucional do Diretor do Centro Infantil Céu Azul'
  },
  'CEU-AZUL-CEO-001': {
    code: 'CEU-AZUL-CEO-001',
    role: 'CEO',
    name: 'Alfredo Andrade',
    email: 'andradaalfred02308@gmail.com',
    institutionId: CEU_AZUL_INSTITUTION_ID,
    institutionName: 'Centro Infantil Céu Azul',
    branchId: 'branch-ceu-azul-main',
    status: 'ativo',
    description: 'Acesso Institucional do CEO do Centro Infantil Céu Azul'
  }
};

// Populate the 22 students into the access codes index
CEU_AZUL_STUDENTS.forEach(student => {
  const code = (student as any).codigoAcesso;
  if (code) {
    CEU_AZUL_ACCESS_CODES[code] = {
      code,
      role: 'ALUNO',
      name: student.fullName || student.name || '',
      email: student.email || `${code.toLowerCase()}@ceuazul.ac.mz`,
      institutionId: CEU_AZUL_INSTITUTION_ID,
      institutionName: 'Centro Infantil Céu Azul',
      branchId: 'branch-ceu-azul-main',
      studentId: student.id,
      studentData: student,
      status: 'ativo',
      description: `Código individual de acesso do aluno ${student.fullName || student.name} (${(student as any).numAluno})`
    };
  }
});
