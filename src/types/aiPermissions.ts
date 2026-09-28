import { CanonicalRole, toCanonicalRole } from './rbac';

export type AiPermissionKey =
  | 'ai.query_financial'        // Consultar inadimplência, receitas e pendências financeiras
  | 'ai.query_academic'         // Consultar estatísticas de turmas, alunos e cursos
  | 'ai.create_student_from_doc'// Cadastrar alunos via documento PDF/Imagem
  | 'ai.manage_grades'          // Lançar ou alterar notas escolares via comando
  | 'ai.generate_notices'       // Criar comunicados e avisos oficiais
  | 'ai.generate_declarations'  // Gerar declarações e certidões escolares
  | 'ai.analyze_certificates'   // Analisar e validar autenticidade de certificados
  | 'ai.analyze_pautas'         // Resumir e auditar pautas de avaliação
  | 'ai.deep_link_browser';     // Conduzir e abrir perfis no browser automático

export interface AiPermissionMeta {
  key: AiPermissionKey;
  label: string;
  description: string;
  category: 'Consultas & Inteligência' | 'Ações Críticas & Cadastro' | 'Emissão de Documentos';
  riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
}

export const AI_PERMISSIONS_CATALOG: AiPermissionMeta[] = [
  {
    key: 'ai.query_financial',
    label: 'Consultar Finanças & Inadimplência',
    description: 'Permite que a IA responda sobre faturas pendentes, lista de alunos devedores e estatísticas de receita.',
    category: 'Consultas & Inteligência',
    riskLevel: 'Médio'
  },
  {
    key: 'ai.query_academic',
    label: 'Consultar Dados Académicos & Cursos',
    description: 'Permite consultar número de alunos, cursos mais procurados, alunos a terminar o curso e turmas ativas.',
    category: 'Consultas & Inteligência',
    riskLevel: 'Baixo'
  },
  {
    key: 'ai.create_student_from_doc',
    label: 'Cadastrar Alunos via Documento (PDF/Imagem)',
    description: 'Permite que a IA processe BI/Ficha em PDF/Imagem e crie o cadastro definitivo do aluno no sistema.',
    category: 'Ações Críticas & Cadastro',
    riskLevel: 'Alto'
  },
  {
    key: 'ai.manage_grades',
    label: 'Lançar ou Alterar Notas via IA',
    description: 'Permite comandos de inserção ou revisão de notas. Terminantemente bloqueado para Alunos e Perfis Operacionais.',
    category: 'Ações Críticas & Cadastro',
    riskLevel: 'Crítico'
  },
  {
    key: 'ai.generate_notices',
    label: 'Gerar Comunicados Institucionais',
    description: 'Permite elaborar e formatar avisos e comunicados com timbre oficial da Instituição.',
    category: 'Emissão de Documentos',
    riskLevel: 'Baixo'
  },
  {
    key: 'ai.generate_declarations',
    label: 'Gerar Declarações & Certidões',
    description: 'Permite emitir declarações de frequência, matrícula ou conclusão com código de autenticidade.',
    category: 'Emissão de Documentos',
    riskLevel: 'Médio'
  },
  {
    key: 'ai.analyze_certificates',
    label: 'Analisar & Auditar Certificados',
    description: 'Permite que a IA inspecione chancelas, selos notariais e códigos SIVEC de certificados anexados.',
    category: 'Consultas & Inteligência',
    riskLevel: 'Baixo'
  },
  {
    key: 'ai.analyze_pautas',
    label: 'Resumir & Auditar Pautas',
    description: 'Permite analisar pautas, calculando taxas de aprovação, reprovação e médias de turmas.',
    category: 'Consultas & Inteligência',
    riskLevel: 'Baixo'
  },
  {
    key: 'ai.deep_link_browser',
    label: 'Browser Automático & Condução ao Perfil',
    description: 'Permite que a IA apresente atalhos interativos e conduza o utilizador diretamente para o perfil/módulo.',
    category: 'Consultas & Inteligência',
    riskLevel: 'Baixo'
  }
];

export type AiRolePermissionsMatrix = Record<CanonicalRole, Record<AiPermissionKey, boolean>>;

export const DEFAULT_AI_PERMISSIONS_MATRIX: AiRolePermissionsMatrix = {
  SUPER_ADMIN: {
    'ai.query_financial': true,
    'ai.query_academic': true,
    'ai.create_student_from_doc': true,
    'ai.manage_grades': true,
    'ai.generate_notices': true,
    'ai.generate_declarations': true,
    'ai.analyze_certificates': true,
    'ai.analyze_pautas': true,
    'ai.deep_link_browser': true
  },
  ADMIN_INSTITUICAO: {
    'ai.query_financial': true,
    'ai.query_academic': true,
    'ai.create_student_from_doc': true,
    'ai.manage_grades': true,
    'ai.generate_notices': true,
    'ai.generate_declarations': true,
    'ai.analyze_certificates': true,
    'ai.analyze_pautas': true,
    'ai.deep_link_browser': true
  },
  DIRETOR: {
    'ai.query_financial': true,
    'ai.query_academic': true,
    'ai.create_student_from_doc': true,
    'ai.manage_grades': true,
    'ai.generate_notices': true,
    'ai.generate_declarations': true,
    'ai.analyze_certificates': true,
    'ai.analyze_pautas': true,
    'ai.deep_link_browser': true
  },
  SECRETARIA: {
    'ai.query_financial': true,
    'ai.query_academic': true,
    'ai.create_student_from_doc': true,
    'ai.manage_grades': false, // Secretaria não altera notas por padrão sem autorização do pedagógico
    'ai.generate_notices': true,
    'ai.generate_declarations': true,
    'ai.analyze_certificates': true,
    'ai.analyze_pautas': true,
    'ai.deep_link_browser': true
  },
  FINANCEIRO: {
    'ai.query_financial': true,
    'ai.query_academic': true,
    'ai.create_student_from_doc': false,
    'ai.manage_grades': false,
    'ai.generate_notices': true,
    'ai.generate_declarations': false,
    'ai.analyze_certificates': false,
    'ai.analyze_pautas': false,
    'ai.deep_link_browser': true
  },
  PROFESSOR: {
    'ai.query_financial': false, // Professor não tem acesso à inadimplência global de alunos
    'ai.query_academic': true,
    'ai.create_student_from_doc': false,
    'ai.manage_grades': true,
    'ai.generate_notices': false,
    'ai.generate_declarations': false,
    'ai.analyze_certificates': false,
    'ai.analyze_pautas': true,
    'ai.deep_link_browser': true
  },
  FORMADOR: {
    'ai.query_financial': false,
    'ai.query_academic': true,
    'ai.create_student_from_doc': false,
    'ai.manage_grades': true,
    'ai.generate_notices': false,
    'ai.generate_declarations': false,
    'ai.analyze_certificates': false,
    'ai.analyze_pautas': true,
    'ai.deep_link_browser': true
  },
  PORTEIRO: {
    'ai.query_financial': false,
    'ai.query_academic': false,
    'ai.create_student_from_doc': false,
    'ai.manage_grades': false,
    'ai.generate_notices': false,
    'ai.generate_declarations': false,
    'ai.analyze_certificates': true,
    'ai.analyze_pautas': false,
    'ai.deep_link_browser': true
  },
  ALUNO: {
    'ai.query_financial': false, // Aluno não pode consultar inadimplentes da instituição
    'ai.query_academic': false,  // Aluno só vê o seu próprio curso/dados
    'ai.create_student_from_doc': false, // Aluno não pode cadastrar alunos
    'ai.manage_grades': false,   // TERMINANTEMENTE BLOQUEADO: "põe notas" é rejeitado
    'ai.generate_notices': false,
    'ai.generate_declarations': false,
    'ai.analyze_certificates': true, // Pode validar o seu próprio certificado
    'ai.analyze_pautas': false,
    'ai.deep_link_browser': true
  },
  RESPONSAVEL: {
    'ai.query_financial': false,
    'ai.query_academic': false,
    'ai.create_student_from_doc': false,
    'ai.manage_grades': false,
    'ai.generate_notices': false,
    'ai.generate_declarations': false,
    'ai.analyze_certificates': true,
    'ai.analyze_pautas': false,
    'ai.deep_link_browser': true
  },
  EMPRESA: {
    'ai.query_financial': false,
    'ai.query_academic': false,
    'ai.create_student_from_doc': false,
    'ai.manage_grades': false,
    'ai.generate_notices': false,
    'ai.generate_declarations': false,
    'ai.analyze_certificates': true,
    'ai.analyze_pautas': false,
    'ai.deep_link_browser': true
  },
  VISITANTE: {
    'ai.query_financial': false,
    'ai.query_academic': false,
    'ai.create_student_from_doc': false,
    'ai.manage_grades': false,
    'ai.generate_notices': false,
    'ai.generate_declarations': false,
    'ai.analyze_certificates': false,
    'ai.analyze_pautas': false,
    'ai.deep_link_browser': false
  }
};

const STORAGE_KEY = 'moztechwave_ai_rbac_matrix_v1';

export function getAiPermissionsMatrix(): AiRolePermissionsMatrix {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure any missing roles or keys are populated
      const merged = { ...DEFAULT_AI_PERMISSIONS_MATRIX };
      for (const roleKey of Object.keys(DEFAULT_AI_PERMISSIONS_MATRIX) as CanonicalRole[]) {
        if (parsed[roleKey]) {
          merged[roleKey] = {
            ...DEFAULT_AI_PERMISSIONS_MATRIX[roleKey],
            ...parsed[roleKey]
          };
        }
      }
      return merged;
    }
  } catch (err) {
    console.warn('Erro ao carregar matriz de permissões da IA:', err);
  }
  return DEFAULT_AI_PERMISSIONS_MATRIX;
}

export function saveAiPermissionsMatrix(matrix: AiRolePermissionsMatrix): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
    // Disparar evento para componentes ouvirem alterações em tempo real
    window.dispatchEvent(new CustomEvent('moztechwave_ai_permissions_updated', { detail: matrix }));
  } catch (err) {
    console.error('Erro ao salvar matriz de permissões da IA:', err);
  }
}

export function resetAiPermissionsMatrix(): AiRolePermissionsMatrix {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('moztechwave_ai_permissions_updated', { detail: DEFAULT_AI_PERMISSIONS_MATRIX }));
  } catch (err) {
    console.error('Erro ao resetar matriz da IA:', err);
  }
  return DEFAULT_AI_PERMISSIONS_MATRIX;
}

export function checkAiPermission(role: string, permissionKey: AiPermissionKey): boolean {
  const canonical = toCanonicalRole(role);
  const matrix = getAiPermissionsMatrix();
  const rolePerms = matrix[canonical];
  if (!rolePerms) return false;
  return !!rolePerms[permissionKey];
}
