import { Student, Institution, Course, ClassGroup } from '../types';

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
  { key: '{{numero_aluno}}', label: 'Número / Código do Aluno', category: 'aluno', sampleValue: 'CFTPM-AL-2026-1042', description: 'Número de matrícula ou processo escolar' },
  { key: '{{bi}}', label: 'Número de BI / Documento', category: 'aluno', sampleValue: '110100492817B', description: 'Bilhete de Identidade ou Passaporte' },
  { key: '{{telefone}}', label: 'Telefone do Aluno', category: 'aluno', sampleValue: '+258 84 123 4567', description: 'Contacto telefónico do estudante' },
  { key: '{{email}}', label: 'E-mail do Aluno', category: 'aluno', sampleValue: 'aluno@moztechwave.co.mz', description: 'Endereço de correio eletrónico' },

  // Acadêmico
  { key: '{{curso}}', label: 'Nome do Curso', category: 'academico', sampleValue: 'Engenharia de Software & Web Full-Stack', description: 'Designação oficial da formação' },
  { key: '{{turma}}', label: 'Turma', category: 'academico', sampleValue: 'Turma ES-2026-A', description: 'Designação da turma' },
  { key: '{{carga_horaria}}', label: 'Carga Horária Total', category: 'academico', sampleValue: '1200 Horas', description: 'Carga horária letiva do curso' },
  { key: '{{data_inicio}}', label: 'Data de Início do Curso', category: 'academico', sampleValue: '10/02/2026', description: 'Data oficial de início das aulas' },
  { key: '{{data_fim}}', label: 'Data de Conclusão / Fim', category: 'academico', sampleValue: '15/12/2026', description: 'Data de encerramento do curso' },
  { key: '{{nota_final}}', label: 'Nota / Média Final', category: 'academico', sampleValue: '17.8 Valores (Distinção)', description: 'Classificação final obtida' },
  { key: '{{nome_formador}}', label: 'Nome do Formador Titular', category: 'academico', sampleValue: 'Prof. Dr. Mateus Nhantumbo', description: 'Nome do docente ou formador responsável' },
  { key: '{{ano_letivo}}', label: 'Ano Letivo', category: 'academico', sampleValue: '2026', description: 'Ano de realização dos estudos' },

  // Instituição
  { key: '{{instituicao}}', label: 'Nome da Instituição', category: 'instituicao', sampleValue: 'Centro de Formação Profissional Moztechwave', description: 'Designação jurídica do centro ou escola' },
  { key: '{{filial}}', label: 'Filial / Polo / Delegação', category: 'instituicao', sampleValue: 'Sede Central (Maputo)', description: 'Campus ou delegação provincial' },
  { key: '{{nome_diretor}}', label: 'Nome do Diretor Geral', category: 'instituicao', sampleValue: 'Eng. Paulo Jafim', description: 'Nome do dirigente máximo da instituição' },
  { key: '{{alvara}}', label: 'Número de Alvará / Registro', category: 'instituicao', sampleValue: 'Alvará nº ALV-MEC-2024/918', description: 'Autorização ministerial oficial' },
  { key: '{{provincia}}', label: 'Província / Cidade', category: 'instituicao', sampleValue: 'Maputo Cidade', description: 'Localização geográfica da sede' },

  // SIVEC & Certificação Oficial
  { key: '{{numero_certificado}}', label: 'Número Oficial do Certificado', category: 'sivec', sampleValue: 'CERT-2026/0891-MZ', description: 'Código sequencial oficial de registro' },
  { key: '{{codigo_sivec}}', label: 'Código de Validação SIVEC', category: 'sivec', sampleValue: 'SIVEC-MZ-8921-X9A2', description: 'Hash e código nacional de autenticação' },
  { key: '{{qr_code}}', label: 'URL de Validação por QR Code', category: 'sivec', sampleValue: 'https://sigar.mz/verify/CERT-2026-0891', description: 'Link criptográfico contido no QR Code' },

  // Documento & Financeiro
  { key: '{{data}}', label: 'Data Abreviada', category: 'documento', sampleValue: '15/09/2026', description: 'Data em formato DD/MM/AAAA' },
  { key: '{{data_extenso}}', label: 'Data por Extenso Localizada', category: 'documento', sampleValue: 'Maputo, 15 de Setembro de 2026', description: 'Data por extenso formal' },
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

  const now = new Date();
  const monthsPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const city = institution?.city || 'Maputo';
  const dataExtenso = `${city}, ${now.getDate()} de ${monthsPt[now.getMonth()]} de ${now.getFullYear()}`;
  const dataCurta = now.toLocaleDateString('pt-MZ');

  const studentNumber = student?.code || (student as any)?.studentNumber || 'CFTPM-AL-2026-1042';
  const directorName = institution?.representativeName || (institution as any)?.directorName || 'Eng. Paulo Jafim';
  const filialName = context?.branchName || institution?.branches?.[0]?.name || 'Sede Central (Maputo)';
  const docNum = context?.docNumber || 'CERT-2026/0891-MZ';
  const sivec = context?.sivecCode || 'SIVEC-MZ-8921-X9A2';
  const qrValidationUrl = context?.qrUrl || `https://sigar.mz/verify/${docNum}`;
  const teacher = context?.teacherName || 'Prof. Dr. Mateus Nhantumbo';
  const finalGrade = student?.averageGrade ? `${student.averageGrade} Valores` : '17.8 Valores (Distinção)';
  const courseDuration = course?.duration || `${course?.workloadHours || 1200} Horas`;

  const replacements: Record<string, string> = {
    // Requisitos Canônicos 85.3
    '{{nome_aluno}}': student?.fullName || 'ARMANDO JOSÉ MACHAVA',
    '{{numero_aluno}}': studentNumber,
    '{{codigo_aluno}}': studentNumber,
    '{{bi}}': student?.documentNumber || '110100492817B',
    '{{curso}}': course?.name || student?.courseName || 'Engenharia de Software & Web Full-Stack',
    '{{turma}}': classGroup?.name || student?.classGroupName || 'Turma ES-2026-A',
    '{{instituicao}}': institution?.name || 'Centro de Formação Profissional Moztechwave',
    '{{filial}}': filialName,
    '{{data_inicio}}': (course as any)?.startDate || '10/02/2026',
    '{{data_fim}}': (course as any)?.endDate || '15/12/2026',
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
    '{{telefone}}': student?.phone || '+258 84 123 4567',
    '{{email}}': student?.email || 'aluno@moztechwave.co.mz',
    '{{ano_letivo}}': '2026',
    '{{alvara}}': institution?.licenseNumber || 'Alvará nº ALV-MEC-2024/918',
    '{{provincia}}': institution?.province || 'Maputo Cidade',
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
