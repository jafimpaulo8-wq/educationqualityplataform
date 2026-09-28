export type DocumentCategory = 
  // 85.1 Tipos Canônicos de Documentos
  | 'contrato'                  // Contratos de formação
  | 'termo_compromisso'         // Termos de compromisso
  | 'termo_responsabilidade'    // Termos de responsabilidade
  | 'declaracao'                // Declarações
  | 'requerimento'              // Requerimentos
  | 'recibo'                    // Recibos
  | 'comprovativo'              // Comprovativos
  | 'ficha_inscricao'           // Fichas de inscrição
  | 'ficha_matricula'           // Fichas de matrícula
  | 'carteirinha'               // Cartões de estudante
  | 'cartao_operador'           // Cartões de operador
  | 'certificado'               // Certificados
  | 'carta_operador'            // Cartas de operador
  | 'declaracao_estagio'        // Declarações de estágio
  | 'declaracao_conclusao'      // Declarações de conclusão
  | 'personalizado'             // Outros documentos personalizados
  // Complementares do ecossistema
  | 'pauta'
  | 'boletim'
  | 'declaracao_frequencia';

export type DocumentFormat = 'A4_Vertical' | 'A4_Horizontal' | 'Carteirinha';

export type DocumentSide = 'frente' | 'verso';

export type ElementType =
  | 'texto'
  | 'imagem'
  | 'logotipo'
  | 'forma'
  | 'linha'
  | 'tabela'
  | 'assinatura'
  | 'carimbo'
  | 'qrcode'
  | 'campo_dinamico'
  | 'fotografia'
  | 'numero_documento'
  | 'data'
  | 'fundo'
  | 'bordas'
  | 'cabecalho'
  | 'rodape';

export interface TableCell {
  text: string;
  isHeader?: boolean;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
}

export interface StudioElement {
  id: string;
  type: ElementType;
  name: string;
  x: number; // percentage (0-100) or pixels
  y: number; // percentage (0-100) or pixels
  width: number; // in px or %
  height: number; // in px or %
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
  side: DocumentSide | 'ambos';

  // Typography
  content?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  fontFamily?: 'sans' | 'serif' | 'mono' | 'display' | 'cursive';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  lineHeight?: number;
  letterSpacing?: string;

  // Visual Styles
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  borderRadius?: number;
  opacity?: number;
  shadow?: boolean;

  // Specific Element Types Data
  // Dynamic Field
  variableKey?: string; // e.g. '{{nome_aluno}}', '{{curso}}', etc.
  prefix?: string;
  suffix?: string;

  // Image / Logo / Photo
  imageUrl?: string;
  imageFit?: 'contain' | 'cover' | 'fill';

  // Shape
  shapeType?: 'retangulo' | 'retangulo_arredondado' | 'circulo' | 'badge' | 'fita_ribbon' | 'faixa_banner';

  // Line
  lineOrientation?: 'horizontal' | 'vertical';

  // Table
  tableColumns?: string[];
  tableRows?: string[][];
  tableHeaderBg?: string;
  tableHeaderColor?: string;

  // Signature
  signerRole?: 'Diretor Geral' | 'Formador' | 'Coordenador Pedagógico' | 'Secretário' | 'Aluno / Formando';
  signerName?: string;
  signerTitle?: string;
  signatureStyle?: 'cursive' | 'drawn';
  hasStampOnSignature?: boolean;
  signed?: boolean;

  // Stamp / Carimbo
  stampType?: 'homologado' | 'autenticado' | 'pago' | 'republica' | 'concluido';
  stampTextTop?: string;
  stampTextBottom?: string;
  stampCenterText?: string;
  stampColor?: string; // e.g. '#059669', '#dc2626', '#2563eb', '#d97706'

  // QR Code
  qrCodeUrl?: string;
  showQrHash?: boolean;
  qrHashText?: string;
  qrCaption?: string;

  // Document Number
  docNumberPrefix?: string;
  docNumberFormat?: string;
  showBarcode?: boolean;

  // Official Date
  dateCity?: string;
  dateFormat?: 'extenso' | 'curto' | 'formal';

  // Header / Rodape
  headerRepublicText?: string;
  headerMinistryText?: string;
  headerInstitutionText?: string;
  footerLegalText?: string;
  footerVerificationUrl?: string;
}

export interface DocumentBackground {
  color: string;
  pattern: 'none' | 'guilloche' | 'pergaminho' | 'linhas_finas' | 'marcadagua' | 'gradiente';
  watermarkText?: string;
  watermarkOpacity?: number;
  borderStyle: 'nenhuma' | 'classica_dourada' | 'dupla_institucional' | 'ornamental_cantos' | 'moderna_fina';
  borderColor: string;
  borderWidth: number;
  cornerOrnaments?: boolean;
}

export interface StudioDocumentSnapshot {
  version: string;
  name: string;
  format: DocumentFormat;
  elementsCount: number;
  frenteElements: StudioElement[];
  versoElements: StudioElement[];
  backgroundFrente: DocumentBackground;
  backgroundVerso: DocumentBackground;
}

export interface StudioTemplateVersion {
  version: string;
  savedAt: string;     // data
  savedBy: string;     // autor
  changeNotes: string; // alterações
  format: DocumentFormat;
  frenteElements: StudioElement[];
  versoElements: StudioElement[];
  backgroundFrente: DocumentBackground;
  backgroundVerso: DocumentBackground;
  // 85.4 Versionamento comparativo
  documentoAnterior?: StudioDocumentSnapshot;
  documentoAtual?: StudioDocumentSnapshot;
}

export interface StudioTemplate {
  id: string;
  institutionId: string;
  name: string;
  description: string;
  category: DocumentCategory;
  format: DocumentFormat;
  hasBackSide: boolean;
  isActive: boolean;
  version: string;
  versionHistory: StudioTemplateVersion[];
  frenteElements: StudioElement[];
  versoElements: StudioElement[];
  backgroundFrente: DocumentBackground;
  backgroundVerso: DocumentBackground;
  createdAt: string;
  updatedAt: string;
  author: string;
  isSystemDefault?: boolean;
}
