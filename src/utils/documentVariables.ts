import { Student, Institution, Course, ClassGroup } from '../types';
import { resolveInstitutionIdentity } from './institutionIdentity';

export interface DynamicVariableDefinition {
  key: string;
  label: string;
  category: 'aluno' | 'academico' | 'instituicao' | 'documento' | 'sivec';
  sampleValue: string;
  description: string;
}

export const DYNAMIC_VARIABLES_LIST: DynamicVariableDefinition[] = [
  // Aluno
  { key: '{{nome_aluno}}', label: 'Nome Completo do Aluno', category: 'aluno', sampleValue: 'ARMANDO JOSÉ MACHAVA', description: 'Nome civil completo do estudante' },
  { key: '{{numero_aluno}}', label: 'Número / Código do Aluno', category: 'aluno', sampleValue: 'SIGAR-AL-2026-1042', description: 'Número de matrícula ou processo escolar' },
  { key: '{{bi}}', label: 'Número de BI / Documento', category: 'aluno', sampleValue: '110100492817B', description: 'Bilhete de Identidade ou Passaporte' },
  { key: '{{telefone}}', label: 'Telefone do Aluno', category: 'aluno', sampleValue: '+258 84 000 0000', description: 'Contacto telefónico do estudante' },
  { key: '{{email}}', label: 'E-mail do Aluno', category: 'aluno', sampleValue: 'estudante@instituicao.mz', description: 'Endereço de correio eletrónico' },

  // Acadêmico
  { key: '{{curso}}', label: 'Nome do Curso', category: 'academico', sampleValue: 'Curso / Nível Académico', description: 'Designação oficial da formação ou nível' },
  { key: '{{turma}}', label: 'Turma', category: 'academico', sampleValue: 'Turma 2026-A', description: 'Designação da turma' },
  { key: '{{carga_horaria}}', label: 'Carga Horária Total', category: 'academico', sampleValue: '1200 Horas', description: 'Carga horária letiva do curso' },
  { key: '{{data_inicio}}', label: 'Data de Início do Curso', category: 'academico', sampleValue: '10/02/2026', description: 'Data oficial de início das aulas' },
  { key: '{{data_fim}}', label: 'Data de Conclusão / Fim', category: 'academico', sampleValue: '15/12/2026', description: 'Data de encerramento do curso' },
  { key: '{{nota_final}}', label: 'Nota / Média Final', category: 'academico', sampleValue: '17.8 Valores (Distinção)', description: 'Classificação final obtida' },
  { key: '{{nome_formador}}', label: 'Nome do Formador Titular', category: 'academico', sampleValue: 'Docente Responsável', description: 'Nome do docente ou formador responsável' },
  { key: '{{ano_letivo}}', label: 'Ano Letivo', category: 'academico', sampleValue: '2026', description: 'Ano de realização dos estudos' },

  // Instituição
  { key: '{{instituicao}}', label: 'Nome da Instituição', category: 'instituicao', sampleValue: 'Instituição de Ensino', description: 'Designação jurídica da escola ou centro' },
  { key: '{{filial}}', label: 'Filial / Polo / Delegação', category: 'instituicao', sampleValue: 'Sede Principal', description: 'Campus ou delegação provincial' },
  { key: '{{nome_diretor}}', label: 'Nome do Diretor Geral', category: 'instituicao', sampleValue: 'Direção Geral', description: 'Nome do dirigente máximo da instituição' },
  { key: '{{alvara}}', label: 'Número de Alvará / Registro', category: 'instituicao', sampleValue: 'Alvará Institucional', description: 'Autorização ministerial oficial' },
  { key: '{{provincia}}', label: 'Província / Cidade', category: 'instituicao', sampleValue: 'Moçambique', description: 'Localização geográfica da sede' },

  // SIVEC & Certificação Oficial
  { key: '{{numero_certificado}}', label: 'Número Oficial do Certificado', category: 'sivec', sampleValue: 'CERT-2026/0891-MZ', description: 'Código sequencial oficial de registro' },
  { key: '{{codigo_sivec}}', label: 'Código de Validação SIVEC', category: 'sivec', sampleValue: 'SIVEC-MZ-8921-X9A2', description: 'Hash e código nacional de autenticação' },
  { key: '{{qr_code}}', label: 'URL de Validação por QR Code', category: 'sivec', sampleValue: '/verify/CERT-2026-0891', description: 'Link criptográfico contido no QR Code' },

  // Documento & Financeiro
  { key: '{{data}}', label: 'Data Abreviada', category: 'documento', sampleValue: '15/09/2026', description: 'Data em formato DD/MM/AAAA' },
  { key: '{{data_extenso}}', label: 'Data por Extenso Localizada', category: 'documento', sampleValue: '15 de Setembro de 2026', description: 'Data por extenso formal' },
  { key: '{{valor}}', label: 'Valor Financeiro / Propina', category: 'documento', sampleValue: '4.500,00 MT', description: 'Valor em Meticais formatado' }
];

export function replaceDynamicVariables(
  text: string,
  context?: {
    student?: Student | null;
    institution?: Institution | null;
    course?: Course | null;
    classGroup?: ClassGroup | null;
    docNumber?: string;
    customDate?: string;
    customValue?: string | number;
    branchName?: string;
    teacherName?: string;
    sivecCode?: string;
    qrUrl?: string;
  }
): string {
  if (!text) return '';

  const student = context?.student;
  const institution = context?.institution;
  const course = context?.course;
  const classGroup = context?.classGroup;
  const instIdentity = resolveInstitutionIdentity(institution);

  const now = new Date();
  const monthsPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const city = instIdentity.city || '';
  const dataExtenso = city
    ? `${city}, ${now.getDate()} de ${monthsPt[now.getMonth()]} de ${now.getFullYear()}`
    : `${now.getDate()} de ${monthsPt[now.getMonth()]} de ${now.getFullYear()}`;
  const dataCurta = now.toLocaleDateString('pt-MZ');

  const instPrefix = instIdentity.code || 'SIGAR';
  const studentNumber = student
    ? (student.code || (student as any).studentNumber || '')
    : `${instPrefix}-AL-2026-1042`;
  const directorName = institution
    ? (instIdentity.representativeName || instIdentity.signatoryName || '')
    : 'Direção Geral';
  const filialName = context?.branchName || institution?.branches?.[0]?.name || 'Sede Principal';
  const docNum = context?.docNumber || 'CERT-2026/0891-MZ';
  const sivec = context?.sivecCode || 'SIVEC-MZ-8921-X9A2';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const qrValidationUrl = context?.qrUrl || `${origin}/verify/${docNum}`;
  const teacher = context?.teacherName || 'Docente Titular';
  const finalGrade = student
    ? (student.averageGrade ? `${student.averageGrade} Valores` : '—')
    : '17.8 Valores (Distinção)';
  const courseDuration = course?.duration || (course?.workloadHours ? `${course.workloadHours} Horas` : '—');

  const replacements: Record<string, string> = {
    // Requisitos Canônicos
    '{{nome_aluno}}': student ? (student.fullName || '') : 'NOME DO FORMANDO / ALUNO',
    '{{numero_aluno}}': studentNumber,
    '{{codigo_aluno}}': studentNumber,
    '{{bi}}': student ? (student.documentNumber || '') : 'Documento de Identificação',
    '{{curso}}': course?.name || student?.courseName || 'Curso / Turma',
    '{{turma}}': classGroup?.name || student?.classGroupName || 'Turma',
    '{{instituicao}}': institution ? instIdentity.officialName : 'Instituição de Ensino',
    '{{filial}}': filialName,
    '{{data_inicio}}': (course as any)?.startDate || '—',
    '{{data_fim}}': (course as any)?.endDate || '—',
    '{{nota_final}}': finalGrade,
    '{{media_final}}': finalGrade,
    '{{carga_horaria}}': courseDuration,
    '{{duracao}}': courseDuration,
    '{{numero_certificado}}': docNum,
    '{{numero_documento}}': docNum,
    '{{codigo_sivec}}': sivec,
    '{{qr_code}}': qrValidationUrl,
    '{{nome_diretor}}': directorName,
    '{{diretor}}': directorName,
    '{{nome_formador}}': teacher,

    // Suporte Complementar
    '{{telefone}}': student ? (student.phone || '') : (instIdentity.phone || ''),
    '{{email}}': student ? (student.email || '') : (instIdentity.email || ''),
    '{{ano_letivo}}': String(now.getFullYear()),
    '{{alvara}}': instIdentity.licenseNumber || '',
    '{{provincia}}': instIdentity.province || instIdentity.city || '',
    '{{data}}': context?.customDate || dataCurta,
    '{{data_extenso}}': dataExtenso,
    '{{valor}}': context?.customValue !== undefined ? `${context.customValue} MT` : '4.500,00 MT'
  };

  let result = text;
  Object.entries(replacements).forEach(([key, val]) => {
    result = result.split(key).join(val);
  });

  return result;
}
