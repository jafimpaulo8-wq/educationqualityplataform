import { TaskItem } from '../types';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-101',
    institutionId: 'inst-default',
    branchId: 'branch-1',
    title: 'Auditoria e Emissão de Pautas do 1º Semestre',
    description: 'Revisar notas lançadas pelos professores no módulo acadêmico, conferir pesos das avaliações e emitir pautas oficiais assinadas.',
    assigneeName: 'Dra. Maria Lurdes',
    assigneeRole: 'Coordenadora Pedagógica',
    assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    priority: 'alta',
    dueDate: '2026-09-22',
    dueTime: '16:00',
    state: 'em andamento',
    category: 'Pedagógico',
    attachments: [
      {
        id: 'att-1',
        name: 'Checklist_Pautas_Semestre_1.pdf',
        size: '1.4 MB',
        type: 'application/pdf',
        uploadedAt: '2026-09-14 09:30',
        uploadedBy: 'Dra. Maria Lurdes'
      },
      {
        id: 'att-2',
        name: 'Diretrizes_Avaliacao_MEC.pdf',
        size: '850 KB',
        type: 'application/pdf',
        uploadedAt: '2026-09-14 09:35',
        uploadedBy: 'Dra. Maria Lurdes'
      }
    ],
    notes: [
      {
        id: 'note-1',
        authorId: 'user-coord',
        authorName: 'Dra. Maria Lurdes',
        authorRole: 'Coordenadora Pedagógica',
        content: 'Falta apenas a pauta da disciplina de Redes de Computadores do Professor Bernardo. Já enviei lembrete por WhatsApp.',
        createdAt: '2026-09-15 11:20',
        visibility: 'autorizados',
        authorizedRoles: ['superadmin', 'director', 'admin', 'coordenador']
      },
      {
        id: 'note-2',
        authorId: 'user-dir',
        authorName: 'Director Geral',
        authorRole: 'Diretor',
        content: 'Nota interna confidencial: se o professor atrasar a entrega além do dia 21, notificar o conselho executivo antes do conselho de notas.',
        createdAt: '2026-09-15 14:05',
        visibility: 'privada',
        authorizedRoles: ['director', 'superadmin']
      }
    ],
    createdBy: 'Director Geral',
    createdAt: '2026-09-14 09:00',
    updatedAt: '2026-09-15 14:05'
  },
  {
    id: 'task-102',
    institutionId: 'inst-default',
    branchId: 'branch-1',
    title: 'Campanha de Cobrança Preventiva - Mensalidade de Outubro',
    description: 'Disparar mensagens preventivas de WhatsApp e emitir avisos de cobrança para formandos com mensalidades a vencer em 5 dias.',
    assigneeName: 'Carlos Machel',
    assigneeRole: 'Chefe de Tesouraria',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    priority: 'urgente',
    dueDate: '2026-09-18',
    dueTime: '12:00',
    state: 'pendente',
    category: 'Financeiro',
    attachments: [
      {
        id: 'att-3',
        name: 'Relacao_Devedores_Outubro.xlsx',
        size: '520 KB',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedAt: '2026-09-16 08:15',
        uploadedBy: 'Carlos Machel'
      }
    ],
    notes: [
      {
        id: 'note-3',
        authorId: 'user-tes',
        authorName: 'Carlos Machel',
        authorRole: 'Chefe de Tesouraria',
        content: 'O template de cobrança preventiva foi homologado no módulo WhatsApp com link para pagamento M-Pesa.',
        createdAt: '2026-09-16 08:30',
        visibility: 'autorizados',
        authorizedRoles: ['superadmin', 'director', 'admin', 'tesoureiro']
      },
      {
        id: 'note-4',
        authorId: 'user-tes',
        authorName: 'Carlos Machel',
        authorRole: 'Chefe de Tesouraria',
        content: 'Lembrete pessoal: verificar se os alunos bolsistas foram excluídos da régua de cobrança automática.',
        createdAt: '2026-09-16 09:10',
        visibility: 'privada'
      }
    ],
    createdBy: 'Carlos Machel',
    createdAt: '2026-09-16 08:00',
    updatedAt: '2026-09-16 09:10'
  },
  {
    id: 'task-103',
    institutionId: 'inst-default',
    branchId: 'branch-1',
    title: 'Manutenção e Calibração dos Leitores QR da Portaria',
    description: 'Testar e calibrar leitores ópticos da catraca e validar tempo de resposta com o servidor local e SIVERC.',
    assigneeName: 'Eng. Fernando Sitoe',
    assigneeRole: 'Técnico de Suporte TI',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    priority: 'media',
    dueDate: '2026-09-25',
    dueTime: '18:00',
    state: 'em andamento',
    category: 'TI & Infraestrutura',
    attachments: [
      {
        id: 'att-4',
        name: 'Manual_Torniquete_QR_v2.pdf',
        size: '3.1 MB',
        type: 'application/pdf',
        uploadedAt: '2026-09-12 10:00',
        uploadedBy: 'Eng. Fernando Sitoe'
      }
    ],
    notes: [
      {
        id: 'note-5',
        authorId: 'user-ti',
        authorName: 'Eng. Fernando Sitoe',
        authorRole: 'Técnico de Suporte TI',
        content: 'Catraca 1 calibrada com 120ms de latência. Catraca 2 aguardando substituição do cabo ethernet.',
        createdAt: '2026-09-13 16:45',
        visibility: 'autorizados',
        authorizedRoles: ['superadmin', 'director', 'admin']
      }
    ],
    createdBy: 'Eng. Fernando Sitoe',
    createdAt: '2026-09-12 09:30',
    updatedAt: '2026-09-13 16:45'
  },
  {
    id: 'task-104',
    institutionId: 'inst-default',
    branchId: 'branch-1',
    title: 'Emissão dos Crachás e Carteirinhas da Turma de Informática 2026',
    description: 'Imprimir e plastificar carteirinhas com QR Code de acesso SIVERC para os 35 novos matriculados.',
    assigneeName: 'Anabela Cuamba',
    assigneeRole: 'Secretária Acadêmica',
    assigneeAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    priority: 'baixa',
    dueDate: '2026-09-15',
    dueTime: '17:00',
    state: 'concluído',
    category: 'Secretaria',
    attachments: [
      {
        id: 'att-5',
        name: 'Lote_Crachas_Info2026.pdf',
        size: '6.4 MB',
        type: 'application/pdf',
        uploadedAt: '2026-09-15 15:00',
        uploadedBy: 'Anabela Cuamba'
      }
    ],
    notes: [
      {
        id: 'note-6',
        authorId: 'user-sec',
        authorName: 'Anabela Cuamba',
        authorRole: 'Secretária Acadêmica',
        content: 'Todos os 35 crachás foram impressos, verificados e entregues ao delegado de turma.',
        createdAt: '2026-09-15 16:30',
        visibility: 'autorizados',
        authorizedRoles: ['superadmin', 'director', 'admin', 'secretaria']
      }
    ],
    createdBy: 'Dra. Maria Lurdes',
    createdAt: '2026-09-11 14:00',
    updatedAt: '2026-09-15 16:30',
    completedAt: '2026-09-15 16:30'
  },
  {
    id: 'task-105',
    institutionId: 'inst-default',
    branchId: 'branch-1',
    title: 'Renovação do Alvará Sanitário e Licença de Funcionamento',
    description: 'Submeter documentação de renovação perante o Conselho Municipal e pagar taxa de fiscalização.',
    assigneeName: 'Director Geral',
    assigneeRole: 'Diretor',
    assigneeAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    priority: 'media',
    dueDate: '2026-09-10',
    dueTime: '12:00',
    state: 'cancelado',
    category: 'Jurídico & Compliance',
    attachments: [],
    notes: [
      {
        id: 'note-7',
        authorId: 'user-dir',
        authorName: 'Director Geral',
        authorRole: 'Diretor',
        content: 'Cancelado porque o alvará atual é válido até 2027 conforme certidão retificada pelo município.',
        createdAt: '2026-09-09 11:00',
        visibility: 'autorizados',
        authorizedRoles: ['superadmin', 'director', 'admin']
      },
      {
        id: 'note-8',
        authorId: 'user-dir',
        authorName: 'Director Geral',
        authorRole: 'Diretor',
        content: 'Anotação estritamente confidencial: certidão original arquivada no cofre B da administração.',
        createdAt: '2026-09-09 11:05',
        visibility: 'privada'
      }
    ],
    createdBy: 'Director Geral',
    createdAt: '2026-09-08 09:00',
    updatedAt: '2026-09-09 11:05'
  }
];
