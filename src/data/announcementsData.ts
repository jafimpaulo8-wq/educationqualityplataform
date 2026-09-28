import { Announcement, AnnouncementType, AnnouncementTarget } from '../types';

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    institutionId: 'inst-1',
    type: 'feriado',
    title: 'Suspensão de Atividades Letivas: 4 de Outubro - Dia da Paz e Reconciliação Nacional',
    summary: 'Comunicação oficial sobre o feriado nacional de 4 de Outubro e tolerância de ponto.',
    content: `Informamos a toda a comunidade académica (estudantes, docentes, encarregados de educação e corpo técnico-administrativo) que, por ocasião do Feriado Nacional de 4 de Outubro (Dia da Paz e da Reconciliação Nacional), as actividades lectivas e administrativas estarão suspensas em todas as nossas instalações.

As aulas regulares e os serviços de atendimento presencial serão retomados na segunda-feira seguinte, nos horários habituais.

Desejamos a todos uma celebração de reflexão, fraternidade e compromisso com o desenvolvimento da nossa nação.`,
    targetAudience: 'todos',
    priority: 'normal',
    status: 'publicado',
    publishDate: '2026-09-18 09:00',
    authorName: 'Direção Geral',
    authorRole: 'Diretor Geral',
    channels: {
      system: true,
      email: true,
      whatsapp: true,
      muralA4: true
    },
    eventDate: '2026-10-04',
    readCount: 142,
    confirmedCount: 98,
    requiresConfirmation: false,
    createdAt: '2026-09-18T09:00:00Z',
    updatedAt: '2026-09-18T09:00:00Z'
  },
  {
    id: 'ann-002',
    institutionId: 'inst-1',
    type: 'pagamento',
    title: 'Prazo Limite de Liquidação de Propinas do Mês Corrente (Sem Sobretaxa até dia 10)',
    summary: 'Lembrete de regularização financeira com canais integrados M-Pesa, e-Mola e POS.',
    content: `Lembramos aos prezados estudantes e encarregados de educação que o prazo limite para a liquidação da mensalidade/propina relativa ao corrente mês decorre até ao dia 10 sem aplicação de sobretaxa de mora.

Para vossa comodidade, os pagamentos podem ser efectuados:
1. Directamente via M-Pesa pelo número de referência do estudante;
2. Pelo serviço e-Mola ou transferência bancária para as contas oficiais da instituição;
3. No Balcão de Caixa Escolar via POS ou numerário com emissão de recibo digital instantâneo.

Evite filas e regularize a situação dentro do prazo estipulado para manter o acesso às pautas, exames e frequências.`,
    targetAudience: 'todos',
    priority: 'alta',
    status: 'publicado',
    publishDate: '2026-09-17 08:30',
    authorName: 'Dr. Salvador Cossa',
    authorRole: 'Direção Financeira & Tesouraria',
    channels: {
      system: true,
      email: true,
      whatsapp: true,
      muralA4: true
    },
    paymentNoticeDetails: {
      referenceMonth: 'Setembro/2026',
      dueDate: '2026-09-25',
      bankAccount: 'BCI: 0008.0000.123456789 | BIM: 102938475',
      mpesaEntity: '841234567 (Referência: Código do Estudante)',
      fineAfterDueDate: '10% após o 10º dia útil'
    },
    readCount: 235,
    confirmedCount: 164,
    requiresConfirmation: true,
    createdAt: '2026-09-17T08:30:00Z',
    updatedAt: '2026-09-17T08:30:00Z'
  },
  {
    id: 'ann-003',
    institutionId: 'inst-1',
    type: 'reuniao',
    title: 'Convocatória: Assembleia Trimestral de Encarregados de Educação',
    summary: 'Apresentação do balanço pedagógico, assiduidade biométrica na portaria e estágios curriculares.',
    content: `A Direcção Pedagógica tem a honra de convidar todos os Pais e Encarregados de Educação para a Reunião Trimestral de Acompanhamento Académico.

Pauta da Reunião:
1. Avaliação do rendimento escolar e aproveitamento das turmas no 2º Trimestre;
2. Relatório do sistema de assiduidade e controlo de entradas na portaria via QR Code;
3. Parcerias empresariais e encaminhamento para estágios técnico-profissionais homologados;
4. Diversos e esclarecimentos com o corpo docente.

A presença de todos os encarregados é indispensável para o sucesso contínuo dos formandos.`,
    targetAudience: 'responsaveis',
    priority: 'alta',
    status: 'publicado',
    publishDate: '2026-09-16 11:00',
    authorName: 'Prof.ª Amélia Macamo',
    authorRole: 'Diretora Pedagógica',
    channels: {
      system: true,
      email: true,
      whatsapp: true,
      muralA4: true
    },
    eventDate: '2026-09-26T09:30',
    eventLocation: 'Auditório Nobre - Bloco de Engenharia e Tecnologias',
    readCount: 89,
    confirmedCount: 61,
    requiresConfirmation: true,
    createdAt: '2026-09-16T11:00:00Z',
    updatedAt: '2026-09-16T11:00:00Z'
  },
  {
    id: 'ann-004',
    institutionId: 'inst-1',
    type: 'mudanca_horario',
    title: 'Ajuste de Horário: Práticas de Laboratório de Redes e Hardware (Turma INFO-2026-A)',
    summary: 'Transferência de horário das práticas laboratoriais para acomodar novos bastidores de treino.',
    content: `Comunicamos aos formandos da Turma INFO-2026-A (Curso Técnico de Redes e Sistemas Informáticos) que, devido à chegada e calibração de novos equipamentos de fibra óptica e roteadores de treino prático, o horário da disciplina prática foi ajustado.

A partir da próxima segunda-feira, as aulas laboratoriais decorrerão no seguinte formato:
- Horário Anterior: Quinta-feira, das 14h00 às 16h30
- Novo Horário Vigorante: Terça-feira, das 08h00 às 11h15
- Local: Laboratório de Redes e CISCO (Piso 1, Sala L2)

Solicitamos a pontualidade habitual e o uso obrigatório de batas e crachás de identificação institucional.`,
    targetAudience: 'turma',
    targetClassName: 'INFO-2026-A (Técnico de Redes)',
    targetCourseName: 'Técnico de Redes e Sistemas Informáticos',
    priority: 'normal',
    status: 'publicado',
    publishDate: '2026-09-15 14:20',
    authorName: 'Eng.º Paulo Machel',
    authorRole: 'Coordenador do Departamento de TI',
    channels: {
      system: true,
      email: false,
      whatsapp: true,
      muralA4: true
    },
    scheduleChangeDetails: {
      subject: 'Práticas Laboratoriais de Redes e Conectividade',
      previousSchedule: 'Quinta-feira: 14h00 - 16h30',
      newSchedule: 'Terça-feira: 08h00 - 11h15',
      effectiveDate: '2026-09-22',
      roomOrLab: 'Laboratório de Redes L2'
    },
    readCount: 34,
    confirmedCount: 29,
    requiresConfirmation: true,
    createdAt: '2026-09-15T14:20:00Z',
    updatedAt: '2026-09-15T14:20:00Z'
  },
  {
    id: 'ann-005',
    institutionId: 'inst-1',
    type: 'evento',
    title: '1ª Mostra Tecnológica e Feira de Empregabilidade Moztechwave 2026',
    summary: 'Apresentação pública de projetos de fim de curso e recrutamento com empresas parceiras.',
    content: `Temos a imensa satisfação de anunciar a realização da 1ª Feira de Empregabilidade e Inovação Tecnológica da nossa instituição.

Durante dois dias, os nossos formandos de todos os cursos apresentarão seus projectos práticos de fim de curso e protótipos funcionais a mais de 25 empresas dos sectores bancário, telecomunicações, energia e contabilidade.

Atividades programadas:
- Stands de demonstração de projectos dos alunos;
- Palestras sobre Inteligência Artificial, Finanças Digitais e Empreendedorismo;
- Entrevistas rápidas de recrutamento para estágios remunerados e vagas júnior;
- Sorteio de kits de ferramentas e vouchers de formação avançada.

Contamos com o entusiasmo e a participação em massa de todos os alunos e docentes!`,
    targetAudience: 'todos',
    priority: 'normal',
    status: 'publicado',
    publishDate: '2026-09-14 10:00',
    authorName: 'Secretaria Académica & Relações Externas',
    authorRole: 'Comissão Organizadora',
    channels: {
      system: true,
      email: true,
      whatsapp: true,
      muralA4: true
    },
    eventDate: '2026-10-15T08:30',
    eventLocation: 'Pátio Polivalente e Pavilhão de Exposições',
    readCount: 310,
    confirmedCount: 220,
    requiresConfirmation: false,
    createdAt: '2026-09-14T10:00:00Z',
    updatedAt: '2026-09-14T10:00:00Z'
  },
  {
    id: 'ann-006',
    institutionId: 'inst-1',
    type: 'reuniao',
    title: 'Conselho Pedagógico de Alinhamento das Pautas e Fecho do Semestre',
    summary: 'Reunião obrigatória de formadores para consolidação de médias, exames de recurso e pautas finais.',
    content: `Convocam-se todos os Formadores e Docentes em exercício para a sessão do Conselho Pedagógico Trimestral.

Ordem de Trabalhos:
1. Prazos estritos para submissão digital de notas de frequência e avaliações práticas;
2. Critérios de admissão e calendário de exames de recurso segundo normas da ANEP/SIVEC;
3. Validação dos diários de turma e horas de estágio em empresa dos formandos;
4. Plano de intervenção e apoio pedagógico para alunos em risco de reprovação.

A presença de todos os formadores titulares de disciplina é de carácter obrigatório.`,
    targetAudience: 'professor',
    priority: 'urgente',
    status: 'agendado',
    publishDate: '2026-09-22 08:00',
    scheduledFor: '2026-09-22T08:00',
    authorName: 'Direção Pedagógica',
    authorRole: 'Diretor Pedagógico',
    channels: {
      system: true,
      email: true,
      whatsapp: true,
      muralA4: false
    },
    eventDate: '2026-09-24T14:30',
    eventLocation: 'Sala de Professores / Reuniões Pedagógicas',
    readCount: 0,
    confirmedCount: 0,
    requiresConfirmation: true,
    createdAt: '2026-09-18T16:00:00Z',
    updatedAt: '2026-09-18T16:00:00Z'
  },
  {
    id: 'ann-007',
    institutionId: 'inst-1',
    type: 'aviso',
    title: 'Regularização e Entrega de Documentos para Emissão de Certificados SIVEC',
    summary: 'Alunos concluintes devem entregar cópias autenticadas de BI e Certificados anteriores na Secretaria.',
    content: `Aviso urgente a todos os formandos finalistas dos cursos modulares:

A Secretaria Académica informa que se encontra aberta a última fase para submissão de documentos comprobatórios destinados à emissão de Certificados de Competências e Diplomas chancelados pelo SIVEC/ANEP.

Documentos requeridos no dossier:
1. Duas (2) cópias autenticadas do Bilhete de Identidade ou DIRE;
2. Uma (1) cópia autenticada do Certificado de Habilitações da 10ª ou 12ª Classe;
3. Relatório de Estágio devidamente assinado pela entidade acolhedora e avaliado pelo formador;
4. Declaração de quitação de propinas emitida pela Tesouraria.

O prazo impreterível termina impreterivelmente na próxima sexta-feira. Após esta data, a homologação será transferida para a época do ano lectivo subsequente.`,
    targetAudience: 'aluno',
    priority: 'alta',
    status: 'publicado',
    publishDate: '2026-09-12 09:15',
    authorName: 'Secretaria Académica',
    authorRole: 'Secretário Geral',
    channels: {
      system: true,
      email: true,
      whatsapp: true,
      muralA4: true
    },
    readCount: 178,
    confirmedCount: 112,
    requiresConfirmation: true,
    createdAt: '2026-09-12T09:15:00Z',
    updatedAt: '2026-09-12T09:15:00Z'
  },
  {
    id: 'ann-008',
    institutionId: 'inst-1',
    type: 'evento',
    title: 'Abertura das Inscrições para Cursos Noturnos e Modulares 2027',
    summary: 'Publicação programada com antecedência do novo catálogo de cursos e descontos de matrícula antecipada.',
    content: `A partir do próximo mês, dar-se-á início ao período de inscrições e matrículas antecipadas para os novos cursos em regime pós-laboral e fins-de-semana.

Descontos de 20% na taxa de matrícula para quem efetuar o registo durante a primeira semana promocional.`,
    targetAudience: 'todos',
    priority: 'normal',
    status: 'agendado',
    publishDate: '2026-10-01 07:00',
    scheduledFor: '2026-10-01T07:00',
    authorName: 'Comunicação & Marketing',
    authorRole: 'Secretaria',
    channels: {
      system: true,
      email: true,
      whatsapp: true,
      muralA4: true
    },
    readCount: 0,
    confirmedCount: 0,
    requiresConfirmation: false,
    createdAt: '2026-09-18T12:00:00Z',
    updatedAt: '2026-09-18T12:00:00Z'
  }
];

export interface AnnouncementTemplate {
  id: string;
  type: AnnouncementType;
  title: string;
  defaultTitle: string;
  defaultTarget: AnnouncementTarget;
  defaultPriority: 'normal' | 'alta' | 'urgente';
  summary: string;
  content: string;
}

export const ANNOUNCEMENT_TEMPLATES: AnnouncementTemplate[] = [
  {
    id: 'tpl-aviso',
    type: 'aviso',
    title: 'Aviso Geral Oficial',
    defaultTitle: 'Aviso Oficial: [Assunto Principal]',
    defaultTarget: 'todos',
    defaultPriority: 'normal',
    summary: 'Aviso institucional formal para ampla divulgação.',
    content: `COMUNICADO OFICIAL

A Direcção da Instituição vem por este meio comunicar a todos os formandos, docentes e funcionários que:

1. [Descreva aqui o primeiro ponto do aviso];
2. [Descreva aqui as orientações ou prazos práticos];
3. Para mais informações, contacte os serviços da Secretaria Académica.

Contamos com a colaboração e empenho de todos.`
  },
  {
    id: 'tpl-reuniao',
    type: 'reuniao',
    title: 'Convocatória de Reunião',
    defaultTitle: 'Convocatória: Reunião de [Encarregados / Docentes / Turma]',
    defaultTarget: 'responsaveis',
    defaultPriority: 'alta',
    summary: 'Convocatória para reunião com pauta, data e local especificados.',
    content: `CONVOCATÓRIA

Convocam-se todos os [Encarregados de Educação / Professores / Estudantes] para a reunião que terá lugar no dia [Data] às [Hora], nas instalações da instituição ([Sala/Auditório]).

Pauta da Reunião:
1. Avaliação do rendimento escolar e assiduidade;
2. Apresentação do calendário de exames e actividades práticas;
3. Assuntos diversos e esclarecimentos gerais.

A sua pontualidade e participação activa são fundamentais.`
  },
  {
    id: 'tpl-mudanca-horario',
    type: 'mudanca_horario',
    title: 'Mudança de Horário de Aulas',
    defaultTitle: 'Alteração de Horário: Disciplina [Nome da Disciplina] - Turma [Turma]',
    defaultTarget: 'turma',
    defaultPriority: 'normal',
    summary: 'Comunicação precisa sobre realocação de dia, turno ou sala de aula.',
    content: `COMUNICADO DE ALTERAÇÃO DE HORÁRIO

A Coordenação Pedagógica informa que, por motivos de [adequação pedagógica / manutenção técnica], o horário das aulas da turma [Nome da Turma] foi alterado conforme se segue:

- Disciplina / Módulo: [Nome da Disciplina]
- Horário Anterior: [Dia da semana e horário]
- Novo Horário: [Novo dia da semana e horário]
- Sala / Laboratório: [Identificação da sala]
- Data de início do novo horário: [Data de início]

Pedimos atenção aos novos horários de chamada e registo de presença.`
  },
  {
    id: 'tpl-pagamento',
    type: 'pagamento',
    title: 'Lembrete de Propinas & Pagamento',
    defaultTitle: 'Lembrete de Pagamento de Propinas - Mês de [Mês Referência]',
    defaultTarget: 'todos',
    defaultPriority: 'alta',
    summary: 'Aviso de regularização financeira com dados para M-Pesa, e-Mola e contas bancárias.',
    content: `AVISO DE TESOURARIA: REGULARIZAÇÃO DE PROPINAS

Lembramos a todos os estudantes e encarregados de educação que o prazo de pagamento da propina referente ao mês de [Mês] sem aplicação de multa termina no próximo dia [Data Limite].

Dados para Pagamento Oficial:
- M-Pesa: Utilize o número [Número / Entidade] indicando o código do formando.
- e-Mola: [Instruções de pagamento].
- Conta Bancária: [Banco] - NIB: [Número de NIB / Conta].
- Caixa Escolar da Instituição: Aberto de segunda a sexta-feira das 07h30 às 17h00.

Evite penalizações e mantenha a sua situação escolar regularizada.`
  },
  {
    id: 'tpl-feriado',
    type: 'feriado',
    title: 'Feriado & Tolerância de Ponto',
    defaultTitle: 'Suspensão de Atividades Letivas: [Nome do Feriado / Data]',
    defaultTarget: 'todos',
    defaultPriority: 'normal',
    summary: 'Notificação sobre feriados nacionais moçambicanos e recesso letivo.',
    content: `COMUNICADO: FERIADO NACIONAL

Informamos a toda a comunidade académica que, em celebração do Feriado Nacional de [Nome do Feriado], as aulas e actividades administrativas estarão suspensas no dia [Data do Feriado].

As actividades lectivas e o atendimento ao público serão retomados com normalidade no dia [Data de Retorno], no horário regular.

Desejamos a todos um bom descanso e um excelente feriado.`
  },
  {
    id: 'tpl-evento',
    type: 'evento',
    title: 'Evento Escolar / Feira / Workshop',
    defaultTitle: 'Convite Especial: [Nome do Evento / Workshop / Cerimónia]',
    defaultTarget: 'todos',
    defaultPriority: 'normal',
    summary: 'Divulgação de eventos institucionais, palestras técnicas e graduações.',
    content: `CONVITE INSTITUCIONAL

A Direcção tem o grato prazer de convidar toda a comunidade estudantil e docente a participar no evento:

[NOME DO EVENTO]
Data: [Data do Evento]
Horário: [Horário de início e término]
Local: [Local / Auditório / Campus]

Destaques da Programação:
- Palestras com especialistas do sector;
- Demonstrações práticas e exposições de projectos;
- Sessões de networking e perguntas & respostas.

A vossa presença enriquecerá este momento de partilha e aprendizagem!`
  }
];
