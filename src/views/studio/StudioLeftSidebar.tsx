import React, { useState } from 'react';
import { 
  Type, 
  Variable, 
  Image as ImageIcon, 
  Square, 
  Minus, 
  Table as TableIcon, 
  PenTool, 
  Stamp, 
  QrCode, 
  UserCheck, 
  Hash, 
  Calendar, 
  LayoutTemplate, 
  Sliders,
  Palette,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';
import { ElementType, StudioElement, DocumentSide } from '../../types/studio';
import { DYNAMIC_VARIABLES_LIST } from '../../utils/documentVariables';

interface StudioLeftSidebarProps {
  currentSide: DocumentSide;
  onAddElement: (element: Omit<StudioElement, 'id'>) => void;
}

export const StudioLeftSidebar: React.FC<StudioLeftSidebarProps> = ({
  currentSide,
  onAddElement
}) => {
  const [activeTab, setActiveTab] = useState<'elementos' | 'variaveis' | 'molduras'>('elementos');
  const [expandedSection, setExpandedSection] = useState<string | null>('texto');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Preset additions
  const addHeading = () => {
    onAddElement({
      type: 'texto',
      name: 'Título Principal',
      x: 10,
      y: 20,
      width: 80,
      height: 7,
      zIndex: 15,
      side: currentSide,
      content: 'TÍTULO DO DOCUMENTO',
      fontSize: 22,
      fontWeight: 'bold',
      fontFamily: 'serif',
      textAlign: 'center',
      color: '#0f172a'
    });
  };

  const addParagraph = () => {
    onAddElement({
      type: 'texto',
      name: 'Parágrafo do Documento',
      x: 10,
      y: 35,
      width: 80,
      height: 14,
      zIndex: 10,
      side: currentSide,
      content: 'Certifica-se para os devidos efeitos que o formando {{nome_aluno}}, inscrito com o número {{codigo_aluno}}, concluiu satisfatoriamente as atividades curriculares programadas.',
      fontSize: 13,
      fontFamily: 'serif',
      lineHeight: 1.6,
      textAlign: 'justify',
      color: '#1e293b'
    });
  };

  const addDynamicField = (variableKey: string, label: string) => {
    onAddElement({
      type: 'campo_dinamico',
      name: `Campo: ${label}`,
      x: 15,
      y: 40,
      width: 70,
      height: 6,
      zIndex: 20,
      side: currentSide,
      variableKey,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#0f172a'
    });
  };

  const addHeader = () => {
    onAddElement({
      type: 'cabecalho',
      name: 'Cabeçalho da República',
      x: 5,
      y: 4,
      width: 90,
      height: 12,
      zIndex: 10,
      side: currentSide,
      headerRepublicText: 'REPÚBLICA DE MOÇAMBIQUE • MINISTÉRIO DA EDUCAÇÃO E DESENVOLVIMENTO HUMANO',
      headerMinistryText: 'DIRECÇÃO NACIONAL DE ENSINO TÉCNICO-PROFISSIONAL',
      headerInstitutionText: '{{instituicao}}'
    });
  };

  const addFooter = () => {
    onAddElement({
      type: 'rodape',
      name: 'Rodapé Oficial',
      x: 5,
      y: 88,
      width: 90,
      height: 8,
      zIndex: 10,
      side: currentSide,
      footerLegalText: 'Documento registrado no Livro Geral de Termos sob o assento nº 0891/2026. A validade deste título pode ser aferida via QR Code SIVEC.',
      footerVerificationUrl: 'https://sivec.moztechwave.co.mz/validar'
    });
  };

  const addSignature = (role: 'Diretor Geral' | 'Formador' | 'Coordenador Pedagógico' | 'Aluno / Formando') => {
    const titles = {
      'Diretor Geral': 'Diretor Geral do Centro',
      'Formador': 'O Formador Titular',
      'Coordenador Pedagógico': 'Diretora Pedagógica',
      'Aluno / Formando': 'O Formando'
    };
    onAddElement({
      type: 'assinatura',
      name: `Assinatura: ${role}`,
      x: 35,
      y: 75,
      width: 30,
      height: 12,
      zIndex: 15,
      side: currentSide,
      signerRole: role,
      signerName: role === 'Diretor Geral' ? '{{diretor}}' : role === 'Aluno / Formando' ? '{{nome_aluno}}' : 'Nome do Responsável',
      signerTitle: titles[role],
      signatureStyle: 'cursive',
      signed: true,
      hasStampOnSignature: role === 'Diretor Geral'
    });
  };

  const addStamp = (type: 'homologado' | 'autenticado' | 'pago' | 'concluido') => {
    const configs = {
      homologado: { top: 'REPÚBLICA DE MOÇAMBIQUE', center: 'HOMOLOGADO', bottom: 'SIVEC • MINISTÉRIO DA EDUCAÇÃO', color: '#059669' },
      autenticado: { top: 'SECRETARIA GERAL', center: 'AUTENTICADO', bottom: 'CONFORME O ORIGINAL', color: '#2563eb' },
      pago: { top: 'TESOURARIA GERAL', center: 'PAGO / LIQUIDADO', bottom: 'AUTENTICAÇÃO FINANCEIRA', color: '#059669' },
      concluido: { top: 'CONSELHO TÉCNICO', center: 'APROVADO', bottom: 'CFTPM • MOÇAMBIQUE', color: '#b45309' }
    };
    const c = configs[type];
    onAddElement({
      type: 'carimbo',
      name: `Carimbo: ${c.center}`,
      x: 10,
      y: 72,
      width: 14,
      height: 14,
      zIndex: 25,
      side: currentSide,
      stampType: type,
      stampTextTop: c.top,
      stampCenterText: c.center,
      stampTextBottom: c.bottom,
      stampColor: c.color
    });
  };

  const addQrCode = () => {
    onAddElement({
      type: 'qrcode',
      name: 'QR Code de Validação',
      x: 10,
      y: 75,
      width: 12,
      height: 14,
      zIndex: 15,
      side: currentSide,
      qrCodeUrl: 'https://sivec.moztechwave.co.mz/verify?doc={{numero_documento}}',
      showQrHash: true,
      qrHashText: 'HASH: e7c90b41aa89',
      qrCaption: 'Validação SIVEC'
    });
  };

  const addPhoto = () => {
    onAddElement({
      type: 'fotografia',
      name: 'Foto 3x4 do Aluno',
      x: 10,
      y: 18,
      width: 12,
      height: 18,
      zIndex: 15,
      side: currentSide,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      borderRadius: 6,
      borderColor: '#b45309',
      borderWidth: 2
    });
  };

  const addTable = () => {
    onAddElement({
      type: 'tabela',
      name: 'Tabela Curricular de Notas',
      x: 10,
      y: 35,
      width: 80,
      height: 35,
      zIndex: 12,
      side: currentSide,
      tableColumns: ['Módulo / Unidade', 'Carga Horária', 'Nota Final', 'Situação'],
      tableRows: [
        ['Fundamentos de TI', '120h', '18 Valores', 'Aprovado'],
        ['Desenvolvimento de Software', '240h', '19 Valores', 'Aprovado'],
        ['Bancos de Dados', '160h', '17 Valores', 'Aprovado']
      ],
      tableHeaderBg: '#0f172a',
      tableHeaderColor: '#ffffff'
    });
  };

  const addLine = (borderStyle: 'solid' | 'dashed' | 'double', color: string) => {
    onAddElement({
      type: 'linha',
      name: `Linha Divisória (${borderStyle})`,
      x: 20,
      y: 32,
      width: 60,
      height: 1,
      zIndex: 10,
      side: currentSide,
      borderStyle,
      borderColor: color,
      borderWidth: borderStyle === 'double' ? 3 : 2
    });
  };

  const addShape = (shapeType: 'retangulo' | 'retangulo_arredondado' | 'circulo') => {
    onAddElement({
      type: 'forma',
      name: `Forma: ${shapeType}`,
      x: 10,
      y: 20,
      width: 80,
      height: 20,
      zIndex: 2,
      side: currentSide,
      shapeType,
      backgroundColor: '#f8fafc',
      borderColor: '#cbd5e1',
      borderWidth: 1,
      borderRadius: shapeType === 'retangulo_arredondado' ? 8 : 0
    });
  };

  const addDocNumber = () => {
    onAddElement({
      type: 'numero_documento',
      name: 'Número de Registro',
      x: 5,
      y: 92,
      width: 35,
      height: 4,
      zIndex: 12,
      side: currentSide,
      docNumberPrefix: 'CERT-2026/',
      docNumberFormat: '00192-MZ'
    });
  };

  const addDate = () => {
    onAddElement({
      type: 'data',
      name: 'Data Formal',
      x: 60,
      y: 92,
      width: 35,
      height: 4,
      zIndex: 12,
      side: currentSide,
      dateCity: 'Maputo',
      dateFormat: 'formal'
    });
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shadow-xs">
      {/* Sidebar Header Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('elementos')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'elementos' ? 'bg-white text-sky-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          Componentes
        </button>
        <button
          onClick={() => setActiveTab('variaveis')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'variaveis' ? 'bg-white text-sky-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Variable className="w-3.5 h-3.5" />
          Variáveis
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'elementos' ? (
          <div className="space-y-2">
            {/* Texto & Tipografia */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleSection('texto')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-sky-600" />
                  <span>Texto & Títulos</span>
                </div>
                {expandedSection === 'texto' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSection === 'texto' && (
                <div className="p-2.5 space-y-1.5 bg-white">
                  <button
                    onClick={addHeading}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Título Grande (H1 Serif)</span>
                    <Plus className="w-3.5 h-3.5 text-sky-600" />
                  </button>
                  <button
                    onClick={addParagraph}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Parágrafo Oficial Justificado</span>
                    <Plus className="w-3.5 h-3.5 text-sky-600" />
                  </button>
                  <button
                    onClick={addHeader}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Cabeçalho Oficial da República</span>
                    <Plus className="w-3.5 h-3.5 text-sky-600" />
                  </button>
                  <button
                    onClick={addFooter}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Rodapé Legal de Autenticidade</span>
                    <Plus className="w-3.5 h-3.5 text-sky-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Fotografia, Logotipo & Imagens */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleSection('imagens')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Fotografia & Logotipo</span>
                </div>
                {expandedSection === 'imagens' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSection === 'imagens' && (
                <div className="p-2.5 space-y-1.5 bg-white">
                  <button
                    onClick={addPhoto}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Foto 3×4 do Formando</span>
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                  <button
                    onClick={() => {
                      onAddElement({
                        type: 'logotipo',
                        name: 'Logotipo Institucional',
                        x: 45,
                        y: 10,
                        width: 10,
                        height: 10,
                        zIndex: 12,
                        side: currentSide,
                        imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80'
                      });
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Brasão / Logotipo Oficial</span>
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Assinaturas & Carimbos */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleSection('assinaturas')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-purple-600" />
                  <span>Assinaturas & Carimbos</span>
                </div>
                {expandedSection === 'assinaturas' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSection === 'assinaturas' && (
                <div className="p-2.5 space-y-1.5 bg-white">
                  <button
                    onClick={() => addSignature('Diretor Geral')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Assinatura: Diretor Geral</span>
                    <Plus className="w-3.5 h-3.5 text-purple-600" />
                  </button>
                  <button
                    onClick={() => addSignature('Formador')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Assinatura: Formador Titular</span>
                    <Plus className="w-3.5 h-3.5 text-purple-600" />
                  </button>
                  <button
                    onClick={() => addSignature('Coordenador Pedagógico')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Assinatura: Direção Pedagógica</span>
                    <Plus className="w-3.5 h-3.5 text-purple-600" />
                  </button>
                  <button
                    onClick={() => addSignature('Aluno / Formando')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Assinatura: Formando</span>
                    <Plus className="w-3.5 h-3.5 text-purple-600" />
                  </button>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Carimbos Oficiais Circulares
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => addStamp('homologado')}
                        className="p-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 text-center"
                      >
                        Homologado
                      </button>
                      <button
                        onClick={() => addStamp('autenticado')}
                        className="p-1.5 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-300 text-center"
                      >
                        Autenticado
                      </button>
                      <button
                        onClick={() => addStamp('pago')}
                        className="p-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 text-center"
                      >
                        Pago / Quitado
                      </button>
                      <button
                        onClick={() => addStamp('concluido')}
                        className="p-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-300 text-center"
                      >
                        Aprovado SIVEC
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code, Data & Nº de Documento */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleSection('seguranca')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>QR Code, Código & Data</span>
                </div>
                {expandedSection === 'seguranca' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSection === 'seguranca' && (
                <div className="p-2.5 space-y-1.5 bg-white">
                  <button
                    onClick={addQrCode}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>QR Code Criptográfico</span>
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                  <button
                    onClick={addDocNumber}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Número do Registro Oficial</span>
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                  <button
                    onClick={addDate}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Data Formal por Extenso</span>
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Tabelas & Dados Estruturados */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleSection('tabelas')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-amber-600" />
                  <span>Tabelas de Avaliação</span>
                </div>
                {expandedSection === 'tabelas' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSection === 'tabelas' && (
                <div className="p-2.5 space-y-1.5 bg-white">
                  <button
                    onClick={addTable}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Tabela Curricular de Módulos</span>
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Formas & Linhas Divisórias */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleSection('formas')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-teal-600" />
                  <span>Formas & Linhas</span>
                </div>
                {expandedSection === 'formas' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {expandedSection === 'formas' && (
                <div className="p-2.5 space-y-1.5 bg-white">
                  <button
                    onClick={() => addLine('double', '#d97706')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Linha Dupla Dourada</span>
                    <Plus className="w-3.5 h-3.5 text-teal-600" />
                  </button>
                  <button
                    onClick={() => addLine('solid', '#64748b')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Linha Divisória Fina</span>
                    <Plus className="w-3.5 h-3.5 text-teal-600" />
                  </button>
                  <button
                    onClick={() => addShape('retangulo_arredondado')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    <span>Caixa / Cartão com Borda</span>
                    <Plus className="w-3.5 h-3.5 text-teal-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Aba de Variáveis Dinâmicas */
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
              <strong>Campos Dinâmicos:</strong> Clique em qualquer variável abaixo para inseri-la diretamente no documento. No momento da emissão ou prévia, esses campos serão substituídos pelos dados reais do estudante.
            </div>

            <div className="space-y-2">
              {DYNAMIC_VARIABLES_LIST.map((varItem) => (
                <div
                  key={varItem.key}
                  onClick={() => addDynamicField(varItem.key, varItem.label)}
                  className="p-2.5 bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                      {varItem.label}
                    </span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-mono font-bold px-1.5 py-0.5 rounded">
                      {varItem.key}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Exemplo: <span className="text-slate-700 font-medium">{varItem.sampleValue}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
