import { 
  WhatsAppMessageTemplate, 
  WhatsAppAutomationRule, 
  WhatsAppCampaign, 
  WhatsAppMessageLog, 
  WhatsAppConsentRecord,
  WhatsAppConnection
} from '../types';

export const INITIAL_INSTITUTION_WHATSAPP_CONFIG: Record<string, WhatsAppConnection> = {
  'inst-1': {
    institutionId: 'inst-1',
    status: 'conectado',
    isConnected: true,
    instanceName: 'Moztechwave_Maputo_Central',
    phoneNumber: '+258 84 900 1200',
    batteryLevel: 94,
    isCharging: true,
    deviceModel: 'Samsung Galaxy A54 (WhatsApp Business)',
    dailyMessagesSent: 34,
    dailyLimit: 500,
    minDelaySeconds: 3,
    maxDelaySeconds: 8,
    allowedStartHour: 8,
    allowedEndHour: 20,
    appendOptOutNotice: true,
    optOutText: 'Para não receber comunicados desta instituição, responda PARAR.',
    lastSync: '2026-09-17 08:45',
    connectedAt: '2026-08-01 09:00',
    authorizedBy: 'Diretoria Executiva'
  },
  'inst-2': {
    institutionId: 'inst-2',
    status: 'conectado',
    isConnected: true,
    instanceName: 'Academia_Matola_Connect',
    phoneNumber: '+258 82 455 9000',
    batteryLevel: 81,
    isCharging: false,
    deviceModel: 'Xiaomi Redmi Note 13 (WhatsApp Business)',
    dailyMessagesSent: 18,
    dailyLimit: 400,
    minDelaySeconds: 4,
    maxDelaySeconds: 10,
    allowedStartHour: 8,
    allowedEndHour: 19,
    appendOptOutNotice: true,
    optOutText: 'Para cancelar avisos desta instituição, responda PARAR.',
    lastSync: '2026-09-17 07:30',
    connectedAt: '2026-08-15 14:20',
    authorizedBy: 'Gabinete Pedagógico'
  },
  'inst-3': {
    institutionId: 'inst-3',
    status: 'desconectado',
    isConnected: false,
    instanceName: 'Beira_Inovacao_Bot',
    phoneNumber: '+258 87 312 8888',
    batteryLevel: 45,
    isCharging: false,
    dailyMessagesSent: 0,
    dailyLimit: 300,
    minDelaySeconds: 3,
    maxDelaySeconds: 8,
    allowedStartHour: 8,
    allowedEndHour: 20,
    appendOptOutNotice: true,
    optOutText: 'Para cancelar, responda PARAR.',
    lastSync: '2026-09-10 17:00'
  }
};

export const INITIAL_WHATSAPP_TEMPLATES: WhatsAppMessageTemplate[] = [
  // 1. Cobrança
  {
    id: 'tmpl-cob-01',
    institutionId: 'inst-1',
    name: 'Cobrança Padrão de Mensalidade',
    category: 'cobranca',
    content: 'Olá {{nome}}, informamos que existe uma mensalidade pendente no valor de {{valor}} referente a {{mes}}. Coordenadas M-Pesa: {{chave_pagamento}}. Agradecemos a regularização junto à {{instituicao}}.',
    variables: ['nome', 'valor', 'mes', 'chave_pagamento', 'instituicao'],
    isSystemDefault: true,
    updatedAt: '2026-09-15'
  },
  {
    id: 'tmpl-cob-02',
    institutionId: 'inst-1',
    name: 'Aviso Preventivo de Vencimento',
    category: 'cobranca',
    content: 'Prezado(a) {{nome}}, lembramos que a propina de {{mes}} no valor de {{valor}} vence no dia {{vencimento}}. Evite multas efetuando o pagamento antecipadamente na {{instituicao}}.',
    variables: ['nome', 'mes', 'valor', 'vencimento', 'instituicao'],
    isSystemDefault: true,
    updatedAt: '2026-09-14'
  },
  // 2. Aniversário
  {
    id: 'tmpl-aniv-01',
    institutionId: 'inst-1',
    name: 'Felicitações de Aniversário Oficial',
    category: 'aniversario',
    content: 'Feliz aniversário, {{nome}}! A {{instituicao}} deseja-lhe um excelente dia.',
    variables: ['nome', 'instituicao'],
    isSystemDefault: true,
    updatedAt: '2026-09-10'
  },
  {
    id: 'tmpl-aniv-02',
    institutionId: 'inst-1',
    name: 'Aniversário com Votos de Carreira e Aprendizado',
    category: 'aniversario',
    content: '🎂 Parabéns, {{nome}}! Toda a equipa de formadores e direção da {{instituicao}} felicita-o(a) pelo seu aniversário. Que este novo ciclo no curso de {{curso}} seja repleto de muito aprendizado e sucesso profissional!',
    variables: ['nome', 'instituicao', 'curso'],
    isSystemDefault: false,
    updatedAt: '2026-09-12'
  },
  // 3. Aviso Institucional
  {
    id: 'tmpl-avi-01',
    institutionId: 'inst-1',
    name: 'Comunicado Institucional Geral',
    category: 'aviso',
    content: 'COMUNICADO INSTITUCIONAL - {{instituicao}}\nPrezado(a) {{nome}},\nInformamos que: {{mensagem}}.\nPara mais esclarecimentos, contacte a secretaria pelo {{telefone_instituicao}}.',
    variables: ['instituicao', 'nome', 'mensagem', 'telefone_instituicao'],
    isSystemDefault: true,
    updatedAt: '2026-09-15'
  },
  // 4. Confirmação de Pagamento
  {
    id: 'tmpl-pag-01',
    institutionId: 'inst-1',
    name: 'Recibo de Pagamento Liquidado',
    category: 'confirmacao_pagamento',
    content: 'Olá {{nome}}, confirmamos a liquidação do valor de {{valor}} referente a {{mes}} (Recibo Nº {{recibo}}). O seu saldo atual encontra-se regularizado. Agradecemos a pontualidade junto à {{instituicao}}!',
    variables: ['nome', 'valor', 'mes', 'recibo', 'instituicao'],
    isSystemDefault: true,
    updatedAt: '2026-09-16'
  },
  // 5. Documento
  {
    id: 'tmpl-doc-01',
    institutionId: 'inst-1',
    name: 'Disponibilização de Documento Acadêmico',
    category: 'documento',
    content: 'Estimado(a) {{nome}}, o seu documento ({{documento}}) já se encontra emitido e assinado digitalmente pela {{instituicao}}. Código de validação oficial SIVEC: {{codigo_verificacao}}.',
    variables: ['nome', 'documento', 'instituicao', 'codigo_verificacao'],
    isSystemDefault: true,
    updatedAt: '2026-09-11'
  },
  // 6. Frequência
  {
    id: 'tmpl-freq-01',
    institutionId: 'inst-1',
    name: 'Alerta de Presença e Faltas',
    category: 'frequencia',
    content: 'Atenção: Informamos ao encarregado de educação que o formando {{nome}} regista uma taxa de assiduidade de {{frequencia_pct}}% com {{faltas}} faltas no curso {{curso}}. O regulamento da {{instituicao}} exige presença mínima de 75%.',
    variables: ['nome', 'frequencia_pct', 'faltas', 'curso', 'instituicao'],
    isSystemDefault: true,
    updatedAt: '2026-09-13'
  },
  // 7. Entrada / Saída
  {
    id: 'tmpl-port-01',
    institutionId: 'inst-1',
    name: 'Notificação de Portaria (Controle de Acesso)',
    category: 'entrada_saida',
    content: 'Prezado(a) encarregado(a), confirmamos que o formando {{nome}} registou {{tipo_movimento}} no portão principal da {{instituicao}} às {{hora}} do dia {{data}}.',
    variables: ['nome', 'tipo_movimento', 'instituicao', 'hora', 'data'],
    isSystemDefault: true,
    updatedAt: '2026-09-14'
  },
  // 8. Comunicação de Curso
  {
    id: 'tmpl-cur-01',
    institutionId: 'inst-1',
    name: 'Convocatória de Início de Aulas',
    category: 'comunicacao_curso',
    content: 'Olá {{nome}}! As aulas do curso de {{curso}} (Turma: {{turma}}) iniciam oficialmente no dia {{data}} às {{hora}} na sala {{sala}}. Estamos entusiasmados em recebê-lo(a) na {{instituicao}}!',
    variables: ['nome', 'curso', 'turma', 'data', 'hora', 'sala', 'instituicao'],
    isSystemDefault: true,
    updatedAt: '2026-09-15'
  }
];

export const INITIAL_WHATSAPP_AUTOMATIONS: WhatsAppAutomationRule[] = [
  {
    id: 'auto-01',
    institutionId: 'inst-1',
    title: 'Cobrança Preventiva (3 Dias Antes)',
    description: 'Envia lembrete amigável antes do vencimento da mensalidade escolar.',
    triggerType: 'cobranca_preventiva',
    category: 'cobranca',
    enabled: true,
    templateId: 'tmpl-cob-02',
    executionHour: '08:30',
    daysOffset: -3,
    lastExecutedAt: '2026-09-16 08:30',
    totalTriggeredCount: 142
  },
  {
    id: 'auto-02',
    institutionId: 'inst-1',
    title: 'Cobrança de Mensalidade Vencida',
    description: 'Dispara régua com o valor original somado a juros de mora e multa.',
    triggerType: 'cobranca_vencido',
    category: 'cobranca',
    enabled: true,
    templateId: 'tmpl-cob-01',
    executionHour: '09:00',
    daysOffset: 5,
    lastExecutedAt: '2026-09-16 09:00',
    totalTriggeredCount: 88
  },
  {
    id: 'auto-03',
    institutionId: 'inst-1',
    title: 'Felicitação de Aniversário Matinal',
    description: 'Monitora aniversariantes cadastrados e parabeniza automaticamente às 08:00.',
    triggerType: 'aniversario_dia',
    category: 'aniversario',
    enabled: true,
    templateId: 'tmpl-aniv-01',
    executionHour: '08:00',
    daysOffset: 0,
    lastExecutedAt: '2026-09-17 08:00',
    totalTriggeredCount: 57
  },
  {
    id: 'auto-04',
    institutionId: 'inst-1',
    title: 'Confirmação Imediata de Pagamento',
    description: 'Envia recibo digital no ato do registro do pagamento na tesouraria.',
    triggerType: 'confirmacao_pagamento',
    category: 'confirmacao_pagamento',
    enabled: true,
    templateId: 'tmpl-pag-01',
    executionHour: 'Imediato',
    totalTriggeredCount: 231
  },
  {
    id: 'auto-05',
    institutionId: 'inst-1',
    title: 'Alerta de Entrada e Saída na Portaria',
    description: 'Avisa o encarregado no momento exato em que o crachá é validado na portaria.',
    triggerType: 'entrada_saida_portaria',
    category: 'entrada_saida',
    enabled: true,
    templateId: 'tmpl-port-01',
    executionHour: 'Imediato',
    totalTriggeredCount: 412
  },
  {
    id: 'auto-06',
    institutionId: 'inst-1',
    title: 'Alerta de Baixa Frequência Escolar',
    description: 'Notifica os pais quando a frequência do formando atinge nível de risco (<75%).',
    triggerType: 'frequencia_baixa',
    category: 'frequencia',
    enabled: true,
    templateId: 'tmpl-freq-01',
    executionHour: '17:00',
    totalTriggeredCount: 29
  },
  {
    id: 'auto-07',
    institutionId: 'inst-1',
    title: 'Boas-vindas e Início de Curso',
    description: 'Envia coordenadas de sala, material e horário 7 dias antes do início da turma.',
    triggerType: 'comunicacao_curso_inicio',
    category: 'comunicacao_curso',
    enabled: true,
    templateId: 'tmpl-cur-01',
    executionHour: '10:00',
    daysOffset: -7,
    lastExecutedAt: '2026-09-10 10:00',
    totalTriggeredCount: 76
  },
  {
    id: 'auto-08',
    institutionId: 'inst-1',
    title: 'Aviso de Certificado & Documento Pronto',
    description: 'Notifica o formando assim que a direção homologa a assinatura digital SIVEC.',
    triggerType: 'documento_pronto',
    category: 'documento',
    enabled: true,
    templateId: 'tmpl-doc-01',
    executionHour: 'Imediato',
    totalTriggeredCount: 94
  }
];

export const INITIAL_WHATSAPP_CAMPAIGNS: WhatsAppCampaign[] = [
  {
    id: 'camp-01',
    institutionId: 'inst-1',
    title: 'Campanha de Regularização Propinas - 2º Trimestre',
    category: 'cobranca',
    templateId: 'tmpl-cob-01',
    messageText: 'Olá {{nome}}, informamos que existe uma mensalidade pendente no valor de {{valor}}. Coordenadas M-Pesa: {{chave_pagamento}}. Agradecemos a regularização junto à {{instituicao}}.',
    targetAudience: 'inadimplentes',
    totalRecipients: 24,
    sentCount: 24,
    failedCount: 0,
    status: 'concluido',
    createdAt: '2026-09-12 10:00',
    completedAt: '2026-09-12 10:25'
  },
  {
    id: 'camp-02',
    institutionId: 'inst-1',
    title: 'Aviso de Seminário de Inteligência Artificial & Robótica',
    category: 'comunicacao_curso',
    messageText: 'Prezado(a) formando(a) da {{instituicao}}, convidamo-lo para a Masterclass de IA neste sábado às 09h00 no Auditório Central. Entrada livre para alunos ativos!',
    targetAudience: 'todos_alunos',
    totalRecipients: 120,
    sentCount: 118,
    failedCount: 2,
    status: 'concluido',
    createdAt: '2026-09-14 14:00',
    completedAt: '2026-09-14 15:10'
  }
];

export const INITIAL_WHATSAPP_LOGS: WhatsAppMessageLog[] = [
  {
    id: 'log-01',
    institutionId: 'inst-1',
    recipientName: 'Amélia Cossa',
    recipientPhone: '+258 84 123 4567',
    recipientType: 'aluno',
    category: 'cobranca',
    message: 'Olá Amélia Cossa, informamos que existe uma mensalidade pendente no valor de 4.500 MT.',
    status: 'lido',
    sentAt: '2026-09-17 08:32',
    source: 'automacao'
  },
  {
    id: 'log-02',
    institutionId: 'inst-1',
    recipientName: 'Carlos Tembe',
    recipientPhone: '+258 82 987 6543',
    recipientType: 'aluno',
    category: 'aniversario',
    message: 'Feliz aniversário, Carlos Tembe! A Moztechwave Treinamentos deseja-lhe um excelente dia.',
    status: 'entregue',
    sentAt: '2026-09-17 08:00',
    source: 'automacao'
  },
  {
    id: 'log-03',
    institutionId: 'inst-1',
    recipientName: 'Isabel Mondlane',
    recipientPhone: '+258 84 456 7890',
    recipientType: 'encarregado',
    category: 'entrada_saida',
    message: 'Prezado(a) encarregado(a), confirmamos que o formando Paulo Mondlane registou entrada na Moztechwave Treinamentos às 07:45 de 17/09/2026.',
    status: 'lido',
    sentAt: '2026-09-17 07:45',
    source: 'portaria'
  },
  {
    id: 'log-04',
    institutionId: 'inst-1',
    recipientName: 'Zainab Patel',
    recipientPhone: '+258 86 555 1212',
    recipientType: 'aluno',
    category: 'confirmacao_pagamento',
    message: 'Olá Zainab Patel, confirmamos a recepção do seu pagamento de 4.500 MT referente a Setembro (Recibo Nº REC-2026-0892). Obrigado por cumprir com a Moztechwave Treinamentos!',
    status: 'lido',
    sentAt: '2026-09-16 16:20',
    source: 'tesouraria'
  },
  {
    id: 'log-05',
    institutionId: 'inst-1',
    recipientName: 'Fernando Mabunda',
    recipientPhone: '+258 87 222 3344',
    recipientType: 'aluno',
    category: 'documento',
    message: 'Estimado(a) Fernando Mabunda, informamos que o seu documento (Certificado de Conclusão) já foi autenticado e emitido pela Moztechwave Treinamentos. Código SIVEC: SIVEC-MZ-2026-0412.',
    status: 'entregue',
    sentAt: '2026-09-16 14:15',
    source: 'manual',
    documentAttachment: {
      name: 'Certificado_Fernando_Mabunda.pdf',
      type: 'application/pdf'
    }
  }
];

export const INITIAL_WHATSAPP_CONSENTS: WhatsAppConsentRecord[] = [
  {
    id: 'cst-01',
    institutionId: 'inst-1',
    phone: '+258 84 123 4567',
    name: 'Amélia Cossa',
    optIn: true,
    updatedAt: '2026-08-01'
  },
  {
    id: 'cst-02',
    institutionId: 'inst-1',
    phone: '+258 82 987 6543',
    name: 'Carlos Tembe',
    optIn: true,
    updatedAt: '2026-08-01'
  },
  {
    id: 'cst-03',
    institutionId: 'inst-1',
    phone: '+258 84 999 0001',
    name: 'Número Desconhecido (Solicitou Bloqueio)',
    optIn: false,
    updatedAt: '2026-09-02',
    reason: 'Solicitou opt-out via palavra-chave PARAR'
  }
];

/**
 * Função utilitária para preenchimento de variáveis dinâmicas em templates
 */
export function interpolateWhatsAppVariables(
  templateText: string, 
  variables: Record<string, string | number | undefined>
): string {
  let result = templateText;
  Object.keys(variables).forEach(key => {
    const value = variables[key] !== undefined && variables[key] !== null ? String(variables[key]) : '';
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}
